"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import type { GalleryImage, Product } from "@/types/product";
import {
  CSV_COLUMNS,
  isImageUrl,
  productsToCsvRecords,
  recordsToImportRows,
  type ImportRow,
  type RowError,
} from "@/lib/productCsv";

export interface ImportResult {
  created: number;
  updated: number;
  errors: RowError[];
}

interface ProductCsvToolsProps {
  products: Product[];
  galleryImages: GalleryImage[];
  importAction: (rows: ImportRow[]) => Promise<ImportResult>;
}

export default function ProductCsvTools({
  products,
  galleryImages,
  importAction,
}: ProductCsvToolsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<RowError[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    const csv = Papa.unparse(
      {
        fields: [...CSV_COLUMNS],
        data: productsToCsvRecords(products, galleryImages).map((r) =>
          CSV_COLUMNS.map((c) => r[c])
        ),
      },
      { newline: "\r\n" }
    );
    // BOM so Excel opens the file as UTF-8.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (parsed) => {
        const headers = parsed.meta.fields ?? [];
        const converted = recordsToImportRows(parsed.data, headers);
        setFileName(file.name);
        setRows(converted.rows);
        setErrors(converted.errors);
        setResult(null);
      },
      error: (err) => {
        setFileName(file.name);
        setRows([]);
        setErrors([{ line: 1, message: `could not read file: ${err.message}` }]);
        setResult(null);
      },
    });
  };

  const handleConfirm = async () => {
    setIsImporting(true);
    try {
      const res = await importAction(rows);
      setResult(res);
      setErrors(res.errors);
    } catch (err) {
      setErrors([
        { line: 0, message: err instanceof Error ? err.message : "Import failed" },
      ]);
    } finally {
      setIsImporting(false);
    }
  };

  const close = () => {
    setFileName(null);
    setRows([]);
    setErrors([]);
    setResult(null);
  };

  const succeeded = result !== null && result.errors.length === 0;
  const urlImageCount = new Set(rows.flatMap((r) => r.images).filter(isImageUrl)).size;

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          title="Download all products as CSV. Use it as a template for importing."
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Import CSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {fileName && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Import products</h2>
            <p className="text-sm text-gray-500 mb-4">{fileName}</p>

            {succeeded ? (
              <p className="text-green-700 bg-green-50 rounded-lg p-3 mb-4">
                Import complete: {result.created} created, {result.updated} updated.
              </p>
            ) : errors.length > 0 ? (
              <div className="mb-4">
                <p className="text-red-700 font-medium mb-2">
                  {errors.length} problem{errors.length === 1 ? "" : "s"} found. Nothing
                  was imported. Fix the file and try again.
                </p>
                <ul className="text-sm text-red-700 bg-red-50 rounded-lg p-3 space-y-1 max-h-64 overflow-y-auto">
                  {errors.map((e, i) => (
                    <li key={i}>
                      {e.line > 0 && <span className="font-mono">Line {e.line}: </span>}
                      {e.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-700 mb-4">
                {rows.length} product{rows.length === 1 ? "" : "s"} ready to import.
                Products with an existing handle will be updated; new handles will be
                created.
                {urlImageCount > 0 &&
                  ` ${urlImageCount} image URL${urlImageCount === 1 ? "" : "s"} will be downloaded into the gallery (if not already there).`}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={isImporting}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {succeeded || errors.length > 0 ? "Close" : "Cancel"}
              </button>
              {!succeeded && errors.length === 0 && rows.length > 0 && (
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isImporting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isImporting
                    ? urlImageCount > 0
                      ? "Downloading & importing…"
                      : "Importing…"
                    : "Import"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
