import Link from "next/link";
import CatalogClient from "@/components/CatalogClient";

// Catalog Page
export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] text-text-primary p-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          href="/"
          className="inline-flex items-center text-sonar-green hover:text-sonar-green/80 transition-colors"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Back
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-sonar-green mb-8 text-center">
        Fish Species Catalog
      </h1>

      <CatalogClient />
    </main>
  );
}