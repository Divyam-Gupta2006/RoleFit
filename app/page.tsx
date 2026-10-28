
"use client";

import { useRef, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

export default function Home() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  function handleFile(selected?: File) {
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      alert("Please upload a PDF smaller than 5 MB.");
      return;
    }

    setFile(selected);
  }

  // function handleAnalyze() {
  //   if (!file) {
  //     alert("Upload your resume first.");
  //     return;
  //   }

  //   if (jobDescription.trim().length < 50) {
  //     alert("Please enter a more detailed job description.");
  //     return;
  //   }

  //   alert("UI ready! Next, we will connect the analysis API.");
  // }

  async function handleAnalyze() {
  if (!file) {
    alert("Upload your resume first.");
    return;
  }

  if (jobDescription.trim().length < 50) {
    alert("Please enter a more detailed job description.");
    return;
  }

  const formData = new FormData();
  formData.append("resume", file);
  formData.append("jobDescription", jobDescription);

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Analysis failed.");
    }

    console.log("RoleFit analysis:", result);
    alert(`Preliminary match score: ${result.matchScore ?? "N/A"}%`);
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Something went wrong."
    );
  }
}

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/" className="text-xl font-bold tracking-tight">
            role<span className="text-violet-400">fit.</span>
          </a>

          <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400">
            AI Resume Analyzer
          </span>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 pb-24 pt-16 sm:pt-24">
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm text-violet-300">
            <Sparkles size={15} />
            Your next opportunity starts here
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Your resume,
            <br />
            <span className="text-violet-400">
              decoded for the role.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-400">
            Discover how your experience aligns with a job.
            Identify skill gaps and get actionable feedback
            before you apply.
          </p>
        </div>

        <div className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <FileText size={18} className="text-violet-400" />
              <h2 className="font-medium">Your resume</h2>
            </div>

            <input
              ref={fileInput}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            {file ? (
              <div className="flex items-center justify-between rounded-xl border border-violet-400/30 bg-violet-400/5 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="shrink-0 text-violet-400" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {(file.size / 1024).toFixed(0)} KB · PDF
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Remove resume"
                  onClick={() => {
                    setFile(null);
                    if (fileInput.current) {
                      fileInput.current.value = "";
                    }
                  }}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex w-full flex-col items-center rounded-xl border border-dashed border-white/20 px-4 py-10 transition hover:border-violet-400/60 hover:bg-violet-400/5"
              >
                <Upload size={24} className="mb-3 text-violet-400" />
                <span className="text-sm font-medium">
                  Click to upload your resume
                </span>
                <span className="mt-2 text-xs text-zinc-500">
                  PDF only · Maximum 5 MB
                </span>
              </button>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <BriefcaseBusiness
                size={18}
                className="text-violet-400"
              />
              <h2 className="font-medium">Job description</h2>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={7}
              maxLength={15000}
              className="w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-6 outline-none placeholder:text-zinc-600 focus:border-violet-400/60"
            />

            <p className="mt-2 text-right text-xs text-zinc-500">
              {jobDescription.length}/15000 characters
            </p>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-4 font-medium text-white transition hover:bg-violet-400"
          >
            Analyze my resume
            <ArrowRight size={18} />
          </button>

          <p className="text-center text-xs text-zinc-500">
            Your resume should be evaluated on relevant evidence,
            not just keyword matching.
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-600">
          Built with Next.js · LangChain · AI
        </p>
      </section>
    </main>
  );
}
