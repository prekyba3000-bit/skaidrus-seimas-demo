import { trpc } from '@/lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';
import { VotingTrendChart } from '@/components/charts/VotingTrendChart';
import { SessionHeatmap } from '@/components/charts/SessionHeatmap';
import { Card } from '@/components/ui/card';
import { Activity, TrendingUp, Users } from 'lucide-react';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

export default function Pulsas() {
  const { data, isLoading, error } = trpc.pulse.getParliamentPulse.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout title="Pulsas">
        {/* Summary Header Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Charts Grid Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard className="h-80" />
          <SkeletonCard className="h-80" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Pulsas">
        <div className="text-center py-12">
          <p className="text-red-400">Klaida užkraunant duomenis</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pulsas">
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-surface-dark border-surface-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#92adc9] text-sm uppercase tracking-widest mb-1">Iš viso balsavimų</p>
              <p className="text-white text-3xl font-black">{data?.summary.totalVotes.toLocaleString() || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card className="bg-surface-dark border-surface-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#92adc9] text-sm uppercase tracking-widest mb-1">Vidutinis lankomumas</p>
              <p className="text-white text-3xl font-black">{data?.summary.avgAttendance.toFixed(1) || 0}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent-green" />
          </div>
        </Card>
        <Card className="bg-surface-dark border-surface-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#92adc9] text-sm uppercase tracking-widest mb-1">Aktyvus laikotarpis</p>
              <p className="text-white text-3xl font-black">6 mėn.</p>
            </div>
            <Users className="w-8 h-8 text-amber-400" />
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <VotingTrendChart data={data?.monthlyVotes || []} />
        <SessionHeatmap data={data?.sessionStats || []} />
      </div>
    </DashboardLayout>
  );
}
