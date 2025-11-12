export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userImage?: string;
  fishCaughtCount: number;
  totalAchievements: number;
  unlockedAchievements: number;
  achievementProgress: number; // Percentage
  rank: number;
  isFriend: boolean;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  currentUserRank: number;
  totalParticipants: number;
  friendsOnly: boolean;
}

export interface FriendRequest {
  id: string;
  userId: string;
  friendUserId: string;
  status: 'pending' | 'accepted' | 'blocked';
  userName: string;
  userImage?: string;
  createdAt: string;
}