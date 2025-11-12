"use client";

import Link from "next/link";
import Image from "next/image";
import { useAchievements } from "@/hooks/useAchievements";
import AchievementPanel from "@/components/AchievementPanel";

export default function AchievementsPage() {
  const { achievements, isLoading, error, summary } = useAchievements();

  return (
    <main className="min-h-screen bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] text-text-primary">
      {/* Header */}
      <div className="bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border-b-2 border-panel-border shadow-[--shadow-cockpit] backdrop-blur-[10px] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and title */}
          <div className="flex items-center gap-4">
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

            <div className="flex items-center gap-3">
              <Image
                src="/fish.png"
                alt="Fin Findr Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <h1 
                  className="text-2xl font-bold"
                  style={{ color: "#f5ca53" }}
                >
                  FIN FINDR ACHIEVEMENTS
                </h1>
                <p 
                  className="text-sm font-mono"
                  style={{ color: "#f5ca53" }}
                >
                  YOUR PROGRESS & MILESTONES
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Summary stats */}
          {summary && (
            <div className="flex gap-4 text-xs font-mono">
              <div className="border border-panel-border shadow-[--shadow-cockpit-border] px-3 py-1 rounded">
                <span className="text-text-secondary">UNLOCKED:</span>
                <span className="text-sonar-green ml-2 font-bold">{summary.unlocked}/{summary.total}</span>
              </div>
              <div className="border border-panel-border shadow-[--shadow-cockpit-border] px-3 py-1 rounded">
                <span className="text-text-secondary">PROGRESS:</span>
                <span className="text-warning-amber ml-2 font-bold">{Math.round(summary.unlockedPercentage)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {error ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-xl text-red-400 mb-2">Failed to Load Achievements</div>
            <div className="text-text-secondary">{error}</div>
          </div>
        ) : (
          <AchievementPanel 
            achievementProgress={achievements}
            isLoading={isLoading}
          />
        )}
      </div>
    </main>
  );
}