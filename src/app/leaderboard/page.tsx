import { Metadata } from 'next';
import LeaderboardPanel from '@/components/LeaderboardPanel';

export const metadata: Metadata = {
  title: 'Leaderboard - Fin Findr',
  description: 'See how you rank against your friends in fish catching and achievements',
};

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🏆 Leaderboard
          </h1>
          <p className="text-text-secondary">
            Compare your progress with friends and see who's the ultimate fish finder!
          </p>
        </div>

        <LeaderboardPanel />
      </div>
    </div>
  );
}