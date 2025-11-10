"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center transition-colors duration-500 px-4">
          <div className="text-center max-w-md w-full">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-text-light dark:text-gray-100 mb-4">
              Something went wrong!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {error.message || "An unexpected error occurred. Please refresh the page."}
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-electric to-brand-blue hover:from-brand-blue hover:to-[#60A5FA] text-white rounded-lg transition-all duration-300 font-medium shadow-[0_0_10px_rgba(30,64,255,0.3)]"
            >
              <RefreshCw className="w-5 h-5" />
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

