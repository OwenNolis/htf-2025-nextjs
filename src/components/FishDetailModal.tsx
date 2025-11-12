"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Fish } from "@/types/fish";
import { getRarityBadgeClass } from "@/utils/rarity";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import SpottedToggle from "./SpottedToggle";
import { useFishSightings } from "@/hooks/useFishSightings";

interface FishDetailModalProps {
  fish: Fish | null;
  isOpen: boolean;
  onClose: () => void;
  onFishUpdate?: (updatedFish: Fish) => void;
}

export default function FishDetailModal({ fish, isOpen, onClose, onFishUpdate }: FishDetailModalProps) {
  const [localFish, setLocalFish] = useState<Fish | null>(fish);
  const [mounted, setMounted] = useState(false);
  const [showNewSightingForm, setShowNewSightingForm] = useState(false);
  const { addSighting, isLoading } = useFishSightings();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLocalFish(fish);
  }, [fish]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleFishToggle = (fishId: string, isSpotted: boolean) => {
    if (localFish) {
      const updatedFish = {
        ...localFish,
        isSpotted,
        spottedAt: isSpotted ? new Date().toISOString() : undefined
      };
      setLocalFish(updatedFish);
      onFishUpdate?.(updatedFish);
    }
  };

  const handleAddSighting = async (latitude?: number, longitude?: number, sightingDate?: Date) => {
    if (!localFish) return;
    
    try {
      await addSighting(localFish.id, latitude, longitude, sightingDate);
      
      // Refresh the fish data by fetching updated information
      const response = await fetch('/api/fish-with-sightings');
      if (response.ok) {
        const updatedFishes = await response.json();
        const updatedFish = updatedFishes.find((f: Fish) => f.id === localFish.id);
        if (updatedFish) {
          setLocalFish(updatedFish);
          onFishUpdate?.(updatedFish);
        }
      }
      
      setShowNewSightingForm(false);
    } catch (error) {
      console.error('Failed to add sighting:', error);
    }
  };

  if (!isOpen || !localFish || !mounted) {
    return null;
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-panel-bg border border-panel-border shadow-[--shadow-cockpit-border] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with Fish Image */}
        <div className="relative">
          <div className="h-64 relative overflow-hidden rounded-t-lg">
            <Image
              src={localFish.image}
              alt={localFish.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Spotted Badge */}
            {localFish.isSpotted && (
              <div className="absolute top-4 left-4 bg-sonar-green text-deep-ocean px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                SPOTTED
              </div>
            )}

            {/* Fish Name and Rarity */}
            <div className="absolute bottom-4 left-4 right-16">
              <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                {localFish.name}
              </h2>
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-bold shadow-lg ${getRarityBadgeClass(localFish.rarity)}`}
              >
                {localFish.rarity}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Spotted Toggle Section */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary mb-1">Sighting Status</h3>
              <p className="text-sm text-text-secondary">
                {localFish.isSpotted 
                  ? `${localFish.sightingCount || 1} sighting${(localFish.sightingCount || 1) > 1 ? 's' : ''} • Last spotted ${localFish.lastSpottedAt ? formatDistanceToNow(new Date(localFish.lastSpottedAt), { addSuffix: true }) : 'recently'}`
                  : "Not yet spotted - mark when you see this fish!"
                }
              </p>
            </div>
            <div className="flex gap-2">
              <SpottedToggle 
                fish={localFish} 
                size="lg" 
                onToggle={handleFishToggle}
              />
              {localFish.isSpotted && (
                <button
                  className="px-4 py-2 bg-sonar-green hover:bg-sonar-green/80 text-deep-ocean rounded-lg transition-colors font-medium flex items-center gap-2"
                  onClick={() => setShowNewSightingForm(true)}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {isLoading ? 'Adding...' : 'Add Another'}
                </button>
              )}
            </div>
          </div>

          {/* New Sighting Form */}
          {showNewSightingForm && (
            <div className="bg-gray-800/50 border border-sonar-green/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-sonar-green">Add New Sighting</h3>
                <button
                  onClick={() => setShowNewSightingForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const latitudeStr = formData.get('latitude') as string;
                const longitudeStr = formData.get('longitude') as string;
                const sightingDate = formData.get('sightingDate') as string;
                
                console.log('Form data:', { latitudeStr, longitudeStr, sightingDate });
                
                // Only pass coordinates if both are provided and non-empty
                const latitude = latitudeStr && latitudeStr.trim() ? parseFloat(latitudeStr) : undefined;
                const longitude = longitudeStr && longitudeStr.trim() ? parseFloat(longitudeStr) : undefined;
                
                console.log('Parsed coordinates:', { latitude, longitude });
                
                await handleAddSighting(
                  latitude,
                  longitude,
                  sightingDate ? new Date(sightingDate) : new Date()
                );
              }} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Latitude (optional)
                    </label>
                    <input
                      type="number"
                      name="latitude"
                      step="any"
                      placeholder="e.g., 40.7589"
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-sonar-green focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Longitude (optional)
                    </label>
                    <input
                      type="number"
                      name="longitude"
                      step="any"
                      placeholder="e.g., -73.9851"
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-sonar-green focus:outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Sighting Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="sightingDate"
                    defaultValue={new Date().toISOString().slice(0, -8)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-sonar-green focus:outline-none"
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-sonar-green hover:bg-sonar-green/80 text-deep-ocean font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Adding Sighting...' : 'Add Sighting'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewSightingForm(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Last Seen Sectors - User Sightings */}
          {localFish.userSightings && localFish.userSightings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary border-b border-panel-border pb-2">
                Last Seen Sectors ({localFish.userSightings.length} sighting{localFish.userSightings.length > 1 ? 's' : ''})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {localFish.userSightings
                  .sort((a, b) => new Date(b.sightingDate).getTime() - new Date(a.sightingDate).getTime())
                  .map((sighting, index) => (
                    <div 
                      key={sighting.id} 
                      className="bg-gray-800/30 border border-gray-700 p-4 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-sonar-green rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-sonar-green">
                            Sighting #{(localFish.userSightings?.length || 0) - index}
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary">
                          {formatDistanceToNow(new Date(sighting.sightingDate), { addSuffix: true })}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-text-secondary mb-1">Coordinates</div>
                          <div className="text-sonar-green font-mono">
                            {sighting.latitude && sighting.longitude ? (
                              `${parseFloat(sighting.latitude).toFixed(4)}, ${parseFloat(sighting.longitude).toFixed(4)}`
                            ) : (
                              <span className="text-text-secondary">Location not recorded</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-text-secondary mb-1">Date & Time</div>
                          <div className="text-warning-amber font-mono text-xs">
                            {new Date(sighting.sightingDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {sighting.latitude && sighting.longitude && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${sighting.latitude}, ${sighting.longitude}`);
                            // You could add a toast notification here
                          }}
                          className="mt-3 text-xs text-sonar-green hover:text-sonar-light transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 002 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy coordinates
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary border-b border-panel-border pb-2">
              Latest Sighting Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-800/30 p-3 rounded-lg">
                <div className="text-text-secondary mb-1">Latitude</div>
                <div className="text-sonar-green font-mono text-base">
                  {localFish.latestSighting.latitude.toFixed(6)}°
                </div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded-lg">
                <div className="text-text-secondary mb-1">Longitude</div>
                <div className="text-sonar-green font-mono text-base">
                  {localFish.latestSighting.longitude.toFixed(6)}°
                </div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded-lg md:col-span-2">
                <div className="text-text-secondary mb-1">Last Seen</div>
                <div className="text-warning-amber font-mono text-base">
                  {formatDistanceToNow(new Date(localFish.latestSighting.timestamp), {
                    addSuffix: true,
                  })}
                </div>
                <div className="text-text-secondary text-xs mt-1">
                  {new Date(localFish.latestSighting.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Rarity Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary border-b border-panel-border pb-2">
              Species Information
            </h3>
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-text-secondary">Rarity Classification</span>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-bold ${getRarityBadgeClass(localFish.rarity)}`}
                >
                  {localFish.rarity}
                </div>
              </div>
              <div className="text-sm text-text-secondary">
                {localFish.rarity === 'COMMON' && 'Frequently spotted in these waters. Great for beginners!'}
                {localFish.rarity === 'RARE' && 'Uncommon sighting. You\'re lucky to encounter this species!'}
                {localFish.rarity === 'EPIC' && 'Extremely rare! This is a once-in-a-lifetime sighting! 🏆'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-panel-border">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Copy coordinates to clipboard
                navigator.clipboard.writeText(`${localFish.latestSighting.latitude}, ${localFish.latestSighting.longitude}`);
              }}
              className="py-3 px-4 bg-sonar-green hover:bg-sonar-green/80 text-deep-ocean rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}