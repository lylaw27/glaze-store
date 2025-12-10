import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Database types
export type Database = {
  public: {
    Tables: {
      Category: {
        Row: {
          id: string;
          name: string;
          handle: string;
          type: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          handle: string;
          type: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          name?: string;
          handle?: string;
          type?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Product: {
        Row: {
          id: string;
          name: string;
          handle: string;
          description: string | null;
          price: number;
          images: string;
          stock: number;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          handle: string;
          description?: string | null;
          price: number;
          images?: string;
          stock?: number;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          name?: string;
          handle?: string;
          description?: string | null;
          price?: number;
          images?: string;
          stock?: number;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      ProductCategory: {
        Row: {
          id: string;
          productId: string;
          categoryId: string;
          createdAt: string;
        };
        Insert: {
          id?: string;
          productId: string;
          categoryId: string;
          createdAt?: string;
        };
        Update: {
          id?: string;
          productId?: string;
          categoryId?: string;
          createdAt?: string;
        };
      };
      Order: {
        Row: {
          id: string;
          customerName: string;
          customerEmail: string;
          customerAddress: string;
          totalAmount: number;
          status: string;
          paymentId: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          customerName: string;
          customerEmail: string;
          customerAddress: string;
          totalAmount: number;
          status?: string;
          paymentId?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          customerName?: string;
          customerEmail?: string;
          customerAddress?: string;
          totalAmount?: number;
          status?: string;
          paymentId?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      OrderItem: {
        Row: {
          id: string;
          quantity: number;
          price: number;
          productId: string;
          orderId: string;
        };
        Insert: {
          id?: string;
          quantity: number;
          price: number;
          productId: string;
          orderId: string;
        };
        Update: {
          id?: string;
          quantity?: number;
          price?: number;
          productId?: string;
          orderId?: string;
        };
      };
    };
  };
};

// Server-side client with service role key for storage and database operations
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Storage bucket name for product images
export const PRODUCT_IMAGES_BUCKET = "product-images";

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param fileName - The name to save the file as
 * @returns The public URL of the uploaded file
 */
export async function uploadProductImage(
  file: File,
  fileName: string
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const filePath = `${fileName}.${fileExt}`;

  const { error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Upload multiple images to Supabase Storage
 * @param files - Array of files to upload
 * @param baseFileName - Base name for the files (will append index)
 * @returns Array of public URLs of the uploaded files
 */
export async function uploadProductImages(
  files: File[],
  baseFileName: string
): Promise<string[]> {
  const uploadPromises = files.map((file, index) => {
    const fileName = `${baseFileName}-${index}-${Date.now()}`;
    return uploadProductImage(file, fileName);
  });

  return Promise.all(uploadPromises);
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  // Extract the file path from the URL
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split(`/${PRODUCT_IMAGES_BUCKET}/`);
  if (pathParts.length < 2) return;

  const filePath = pathParts[1];

  const { error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Delete multiple images from Supabase Storage
 * @param imageUrls - Array of public URLs of images to delete
 */
export async function deleteProductImages(imageUrls: string[]): Promise<void> {
  await Promise.all(imageUrls.map(url => deleteProductImage(url)));
}
