"use client";

import { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setErrorMessage("Please upload a PDF file");
        setUploadStatus("error");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMessage("File size must be less than 10MB");
        setUploadStatus("error");
        return;
      }
      setFile(selectedFile);
      setErrorMessage("");
      setUploadStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("statement", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus("success");
        setExtractedData(data);
      } else {
        setUploadStatus("error");
        setErrorMessage(data.error || "Failed to upload file");
      }
    } catch (error) {
      setUploadStatus("error");
      setErrorMessage("An unexpected error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const input = document.getElementById("file-input") as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        input.files = dataTransfer.files;

        const event = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upload Bank Statement
          </h1>
          <p className="text-lg text-gray-600">
            Upload your bank statement to extract transactions and get
            AI-powered insights
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              file
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center">
                <FileText className="h-12 w-12 text-blue-500 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={() => document.getElementById("file-input")?.click()}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Choose different file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your PDF file here, or{" "}
                  <button
                    onClick={() =>
                      document.getElementById("file-input")?.click()
                    }
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF files up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {uploadStatus === "error" && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Upload Failed
                </h3>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadStatus === "success" && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  Upload Successful
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Extracted {extractedData?.numPages} pages of text from your
                  statement
                </p>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? "Processing..." : "Extract Transactions"}
            </button>
          </div>

          {/* Extracted Data Preview */}
          {extractedData && uploadStatus === "success" && (
            <div className="mt-8 border-t pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Extracted Text Preview
              </h3>
              <div className="bg-gray-50 rounded-md p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {extractedData.text.slice(0, 1000)}
                  {extractedData.text.length > 1000 && "..."}
                </pre>
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    // In a real app, this would navigate to analysis page
                    console.log("Navigate to analysis with extracted data");
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Analyze Transactions
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Supported Banks */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Supported Nigerian Banks
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-600 font-bold text-sm">GTB</span>
              </div>
              <p className="text-sm text-gray-600">GTBank</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold text-sm">AB</span>
              </div>
              <p className="text-sm text-gray-600">Access Bank</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-red-600 font-bold text-sm">UBA</span>
              </div>
              <p className="text-sm text-gray-600">UBA</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 font-bold text-sm">FB</span>
              </div>
              <p className="text-sm text-gray-600">First Bank</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
