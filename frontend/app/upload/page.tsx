"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Zap, Lock } from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/database/client";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [extractedData, setExtractedData] = useState<any>(null);
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const [isMounted, setIsMounted] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

    if (!user) {
      setUploadStatus("error");
      setErrorMessage("You must be logged in to upload files");
      return;
    }

    setUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("statement", file);
      formData.append("userId", user.id);

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

  const handleAnalyze = async () => {
    if (!extractedData || !user) return;

    setAnalyzing(true);
    try {
      const response = await fetch("/api/transactions/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfText: extractedData.text,
          statementId: extractedData.statementId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to analyze transactions");
      }

      console.log("Redirecting to analysis page with statementId:", extractedData.statementId);
      router.push(`/analysis/${extractedData.statementId}`);
    } catch (error) {
      console.error("Analysis error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to analyze transactions",
      );
      setUploadStatus("error");
    } finally {
      setAnalyzing(false);
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

  if (!isMounted || isLoading) return null;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <Lock className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-text-primary mb-4 tracking-tight">
            Authentication Required
          </h1>
          <p className="text-lg text-text-secondary mb-10 leading-relaxed font-medium">
            Join Spenwise to securely import and analyze your bank statements.
          </p>
          <a
            href="/auth?view=signup"
            className="btn-primary w-full py-4 text-base tracking-[0.2em]"
          >
            CREATE FREE ACCOUNT
          </a>
          <p className="mt-6 text-sm text-text-muted">
            Already have an account? <Link href="/auth?view=login" className="text-primary font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-10 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-text-primary tracking-tight">
          Import Financial Data
        </h1>
        <p className="text-text-secondary text-lg  leading-relaxed">
          Upload your bank statement in PDF format. Spenwise uses secure, private-first AI to categorize transactions without human intervention.
        </p>
      </div>

      <div className="card-lg bg-surface relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-105" />
        
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 relative z-10 ${
            file
              ? "border-primary bg-primary-lighter"
              : "border-border hover:border-primary/50 hover:bg-secondary-medium/30"
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
            <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <p className="text-xl font-bold text-text-primary mb-2">
                {file.name}
              </p>
              <p className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6">
                {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
              </p>
              <button
                onClick={() => document.getElementById("file-input")?.click()}
                className="text-primary hover:text-primary-light text-sm font-bold underline underline-offset-4"
              >
                Change Statement
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-secondary-medium rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Upload className="h-10 w-10 text-text-muted" />
              </div>
              <p className="text-xl font-bold text-text-primary mb-2">
                Drag your statement here
              </p>
              <p className="text-text-secondary mb-6">
                or click to <span className="text-primary font-bold">browse files</span>
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-text-muted bg-secondary-medium px-4 py-2 rounded-full">
                <AlertCircle size={14} />
                <span>Supports PDF only (Max 10MB)</span>
              </div>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {uploadStatus === "error" && (
          <div className="mt-6 bg-error/10 border border-error/20 rounded-2xl p-5 flex items-start gap-4 animate-in slide-in-from-top-4 duration-300 relative z-10">
            <div className="p-2 bg-error/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-error" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-error">Import Error</h3>
              <p className="text-sm text-error/80 mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        {uploadStatus === "success" && (
          <div className="mt-6 bg-success/10 border border-success/20 rounded-2xl p-5 flex items-start gap-4 animate-in slide-in-from-top-4 duration-300 relative z-10">
            <div className="p-2 bg-success/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-success">Extraction Complete</h3>
              <p className="text-sm text-success/80 mt-1">
                Successfully processed {extractedData?.numPages} pages of financial data.
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8 flex justify-center relative z-10">
          <button
            onClick={handleUpload}
            disabled={!file || uploading || uploadStatus === "success"}
            className="btn-primary px-12 py-4 h-auto text-lg shadow-xl shadow-primary/20"
          >
            {uploading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : "Begin Artificial Intelligence Extraction"}
          </button>
        </div>

        {/* Extracted Data Preview */}
        {extractedData && uploadStatus === "success" && (
          <div className="mt-10 pt-10 border-t border-border relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary">
                Data Preview
              </h3>
              <span className="text-xs font-bold text-text-muted bg-secondary-medium px-3 py-1 rounded-full uppercase tracking-tighter">
                Raw Extraction Results
              </span>
            </div>
            <div className="bg-secondary-medium/50 rounded-2xl p-6 max-h-64 overflow-y-auto border border-border">
              <pre className="text-xs text-text-secondary whitespace-pre-wrap font-mono leading-relaxed">
                {extractedData.text.slice(0, 1000)}
                {extractedData.text.length > 1000 && "..."}
              </pre>
            </div>
            <div className="mt-10 flex flex-col items-center">
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn-primary px-12 py-4 h-auto text-lg w-full md:w-auto"
              >
                {analyzing ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Trends...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <TrendingUp size={20} />
                    <span>Analyze Comprehensive Statement</span>
                  </div>
                )}
              </button>
              <p className="text-xs text-text-muted mt-4 font-medium uppercase tracking-widest">
                Final step: Convert extracted text into actionable insights
              </p>
            </div>
          </div>
        )}
      </div>

     
    </div>
  );
}
