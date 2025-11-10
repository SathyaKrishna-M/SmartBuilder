import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center transition-colors duration-500">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-light dark:text-gray-100 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text-light dark:text-gray-100 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-electric to-brand-blue hover:from-brand-blue hover:to-[#60A5FA] text-white rounded-lg transition-all duration-300 font-medium shadow-[0_0_10px_rgba(30,64,255,0.3)]"
        >
          <Home className="w-5 h-5" />
          Go Home
        </Link>
      </div>
    </div>
  );
}

