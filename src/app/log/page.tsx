'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NewSightingForm from '../../components/NewSightingForm';

export default function LogSightingPage() {
    const router = useRouter();

    return (
        <div className="w-full h-screen flex flex-col relative overflow-hidden bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] text-sonar-green font-mono">
            {/* Scanline effect */}
            <div className="fixed top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--color-sonar-green)_10%,transparent)] to-transparent animate-scanline pointer-events-none z-[9999]" />

            {/* Header */}
            <div className="bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border-b-2 border-panel-border shadow-[--shadow-cockpit] backdrop-blur-[10px] px-6 py-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold [text-shadow:--shadow-glow-text] text-sonar-green">
                        LOG NEW SIGHTING
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="text-xs text-sonar-green hover:text-sonar-light border border-panel-border rounded px-2 py-1 shadow-[--shadow-cockpit-border] transition-colors"
                    >
                        ← BACK
                    </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                    <Link
                        href="/"
                        className="text-text-secondary hover:text-sonar-green transition-colors border border-panel-border rounded px-2 py-1 shadow-[--shadow-cockpit-border]"
                    >
                        DASHBOARD
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <h1 className="text-xl font-semibold text-sonar-green [text-shadow:--shadow-glow-text]">
                    Nieuwe Waarneming Loggen
                </h1>

                <div className="border border-panel-border shadow-[--shadow-cockpit-border] rounded-xl p-6 bg-[color-mix(in_srgb,var(--color-dark-navy)_90%,transparent)]">
                    <NewSightingForm />
                </div>
            </div>
        </div>
    );
}
