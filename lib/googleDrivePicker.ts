// Client-only helper: lets an admin pick images from Google Drive via the
// Google Picker and returns them as File objects for the normal upload flow.

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const APP_ID = process.env.NEXT_PUBLIC_GOOGLE_APP_ID; // Cloud project number

// drive.file only grants access to files the user explicitly picks.
const SCOPE = "https://www.googleapis.com/auth/drive.file";
const DOWNLOAD_CONCURRENCY = 3;

export const isDrivePickerConfigured = Boolean(CLIENT_ID && API_KEY && APP_ID);

const scriptPromises = new Map<string, Promise<void>>();

// Inject a <script> once; later calls reuse the same promise.
function loadScript(src: string): Promise<void> {
  let promise = scriptPromises.get(src);
  if (!promise) {
    promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromises.delete(src);
        reject(new Error(`Failed to load ${src}`));
      };
      document.head.appendChild(script);
    });
    scriptPromises.set(src, promise);
  }
  return promise;
}

let pickerLoaded: Promise<void> | null = null;

function loadPicker(): Promise<void> {
  if (!pickerLoaded) {
    pickerLoaded = loadScript("https://apis.google.com/js/api.js").then(
      () => new Promise<void>((resolve) => gapi.load("picker", () => resolve()))
    );
    pickerLoaded.catch(() => (pickerLoaded = null));
  }
  return pickerLoaded;
}

// Access token cached in memory until shortly before it expires.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  await loadScript("https://accounts.google.com/gsi/client");
  return new Promise<string>((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID!,
      scope: SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || "Google sign-in failed"));
          return;
        }
        cachedToken = {
          value: response.access_token,
          expiresAt: Date.now() + (Number(response.expires_in) - 60) * 1000,
        };
        resolve(response.access_token);
      },
      error_callback: (err) => reject(new Error(err.message || "Google sign-in was cancelled")),
    });
    client.requestAccessToken();
  });
}

// Show the picker; resolves to the chosen docs, or [] if cancelled.
function showPicker(token: string): Promise<google.picker.DocumentObject[]> {
  return new Promise((resolve) => {
    const view = new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .setOAuthToken(token)
      .setDeveloperKey(API_KEY!)
      .setAppId(APP_ID!)
      .setTitle("Select images to import")
      .setCallback((data: google.picker.ResponseObject) => {
        if (data.action === google.picker.Action.PICKED) {
          resolve(data.docs ?? []);
        } else if (data.action === google.picker.Action.CANCEL) {
          resolve([]);
        }
      })
      .build();
    picker.setVisible(true);
  });
}

async function downloadFile(
  doc: google.picker.DocumentObject,
  token: string
): Promise<File> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Download failed for ${doc.name} (${res.status})`);
  const blob = await res.blob();
  return new File([blob], doc.name ?? doc.id, {
    type: doc.mimeType || blob.type,
  });
}

export interface DrivePickResult {
  files: File[];
  failed: string[]; // names of files that couldn't be downloaded
}

// Sign in (if needed), let the admin pick images, and download them.
// `onPicked` fires once the selection is known, before downloads start.
export async function pickDriveImages(
  onPicked?: (count: number) => void
): Promise<DrivePickResult> {
  if (!isDrivePickerConfigured) {
    throw new Error("Google Drive import is not configured.");
  }

  const [token] = await Promise.all([getAccessToken(), loadPicker()]);
  const docs = await showPicker(token);
  if (docs.length === 0) return { files: [], failed: [] };
  onPicked?.(docs.length);

  const files: File[] = [];
  const failed: string[] = [];
  for (let i = 0; i < docs.length; i += DOWNLOAD_CONCURRENCY) {
    const batch = docs.slice(i, i + DOWNLOAD_CONCURRENCY);
    const results = await Promise.allSettled(batch.map((d) => downloadFile(d, token)));
    results.forEach((r, j) => {
      if (r.status === "fulfilled") files.push(r.value);
      else {
        console.error(r.reason);
        failed.push(batch[j].name ?? batch[j].id);
      }
    });
  }
  return { files, failed };
}
