import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";
import { Fish } from "@/types/fish";
import { fetchFishes } from "@/api/fish";

export default async function CatalogPage() {
  // Fetch fish from Fishy Dex API
  let fishes: Fish[];
  
  try {
    fishes = await fetchFishes();
  } catch (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        Failed to load fish catalog.
      </div>
    );
  }

  const rarityColor = {
    COMMON: "text-gray-300 border-gray-500",
    RARE: "text-blue-400 border-blue-500",
    EPIC: "text-purple-400 border-purple-500",
  } as const;

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {fishes.map((fish) => (
          <div
            key={fish.id}
            className="border border-panel-border rounded-lg overflow-hidden shadow-[--shadow-cockpit-border] bg-[color-mix(in_srgb,var(--color-dark-navy)_70%,transparent)] hover:shadow-[--shadow-cockpit] transition-shadow"
          >
            <div className="relative w-full h-40">
              <Image
                src={fish.image}
                alt={fish.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-4">
              <h2 className="text-lg font-semibold text-sonar-green">
                {fish.name}
              </h2>

              <div
                className={`inline-block mt-1 px-2 py-0.5 text-xs font-mono border rounded ${rarityColor[fish.rarity]}`}
              >
                {fish.rarity}
              </div>

              <div className="mt-4 text-sm text-text-secondary">
                <div>
                  <span className="text-text-primary font-medium">
                    Last seen:
                  </span>{" "}
                  {format(new Date(fish.latestSighting.timestamp), "PPpp")}
                </div>
                <div className="font-mono text-xs mt-1">
                  Lat: {fish.latestSighting.latitude.toFixed(3)} | Lng:{" "}
                  {fish.latestSighting.longitude.toFixed(3)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}