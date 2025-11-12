'use client';

import { useState, useEffect } from 'react';
import type { LeaderboardResponse, LeaderboardEntry } from '@/types/leaderboard';

interface LeaderboardPanelProps {
  className?: string;
}

export default function LeaderboardPanel({ className = '' }: LeaderboardPanelProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendsOnly, setFriendsOnly] = useState(false);

  const fetchLeaderboard = async (friendsOnlyMode: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        friendsOnly: friendsOnlyMode.toString(),
        limit: '50'
      });
      
      const response = await fetch(`/api/leaderboard?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data: LeaderboardResponse = await response.json();
      setLeaderboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(friendsOnly);
  }, [friendsOnly]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈'; 
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fin-findr-teal"></div>
        <p className="mt-2 text-text-secondary">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 ${className}`}>
        <p className="text-red-400 mb-2">Error: {error}</p>
        <button
          onClick={() => fetchLeaderboard(friendsOnly)}
          className="px-4 py-2 bg-fin-findr-teal text-white rounded hover:bg-fin-findr-teal/80 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!leaderboard || leaderboard.entries.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 ${className}`}>
        <p className="text-text-secondary mb-2">
          {friendsOnly ? 'No friends found' : 'No participants yet'}
        </p>
        <p className="text-xs text-text-secondary">
          {friendsOnly ? 'Add some friends to see their progress!' : 'Be the first to catch some fish!'}
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-panel-bg border border-panel-border rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🏆 Leaderboard
          </h2>
          <span className="text-sm text-text-secondary">
            {leaderboard.totalParticipants} {friendsOnly ? 'friends' : 'participants'}
          </span>
        </div>
        
        {/* Toggle Friends Only */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-secondary">Friends Only</label>
          <button
            onClick={() => setFriendsOnly(!friendsOnly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              friendsOnly ? 'bg-fin-findr-teal' : 'bg-panel-border'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                friendsOnly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Current User Rank */}
      {leaderboard.currentUserRank > 0 && (
        <div className="mb-4 p-3 bg-fin-findr-teal/10 border border-fin-findr-teal/20 rounded-lg">
          <p className="text-sm text-fin-findr-teal">
            Your rank: <span className="font-bold">{getRankIcon(leaderboard.currentUserRank)}</span>
          </p>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {leaderboard.entries.map((entry: LeaderboardEntry, index: number) => (
          <div
            key={entry.userId}
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
              entry.isCurrentUser 
                ? 'bg-fin-findr-teal/10 border border-fin-findr-teal/30' 
                : 'bg-panel-bg/50 hover:bg-panel-bg/80'
            }`}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-12 h-8 text-sm font-bold">
              {getRankIcon(entry.rank)}
            </div>

            {/* User Avatar & Name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fin-findr-teal to-sonar-green flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {entry.userImage ? (
                  <img 
                    src={entry.userImage} 
                    alt={entry.userName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  entry.userName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${entry.isCurrentUser ? 'text-fin-findr-teal' : 'text-white'}`}>
                  {entry.userName}
                  {entry.isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                  {entry.isFriend && !entry.isCurrentUser && <span className="ml-2 text-xs text-green-400">👥</span>}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col items-end gap-1 text-right min-w-0 flex-shrink-0">
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span>🐟 {entry.fishCaughtCount}</span>
                <span>🏅 {entry.unlockedAchievements}/{entry.totalAchievements}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-20 h-2 bg-panel-border rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getProgressBarColor(entry.achievementProgress)}`}
                  style={{ width: `${Math.min(entry.achievementProgress, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-white">
                {entry.achievementProgress}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-panel-border">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Based on achievements & fish caught</span>
          <button
            onClick={() => fetchLeaderboard(friendsOnly)}
            className="text-fin-findr-teal hover:text-fin-findr-teal/80 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}