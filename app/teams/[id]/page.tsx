import { fetchJSON } from '@/lib/api';
import { TeamProfile } from '@/lib/types';
import { StatCard } from '@/components/StatCard';

export default async function TeamPage({ params }: { params: { id: string } }) {
  const team = await fetchJSON<TeamProfile>(`/api/teams/${params.id}`);

  return (
    <main className="page-shell space-y-8">
      <section className="card p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-accent">Team Dashboard</p>
        <h1 className="mt-2 text-4xl font-bold">{team.name}</h1>
        <p className="mt-2 text-muted">{team.conference}</p>
        <p className="mt-4 max-w-3xl text-sm text-muted">{team.lineupInsight}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {team.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>
    </main>
  );
}
