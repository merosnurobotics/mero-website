import PageShell from "@/components/PageShell";
import { people } from "@/data/site";

type Person = {
  name: string;
  role: string;
  year: string;
  image: string;
};

function PersonCard({ person }: { person: Person }) {
  return (
    <div className="card flex flex-col items-center rounded-2xl p-6 text-center">
      <div className="h-24 w-24 overflow-hidden rounded-full border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={person.image}
          alt={person.name}
          className="h-full w-full object-cover"
        />
      </div>
      <h3 className="mt-4 font-bold">{person.name}</h3>
      <p className="mt-1 text-sm text-accent-2">{person.role}</p>
      <p className="mt-1 font-mono text-xs text-white/40">{person.year}</p>
    </div>
  );
}

function PeopleGrid({ members }: { members: Person[] }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {members.map((person) => (
        <PersonCard key={person.name} person={person} />
      ))}
    </div>
  );
}

export default function PeoplePage() {
  return (
    <PageShell
      eyebrow="People"
      title="The people behind MERO"
      description="Meet the members building today and the alumni who shaped the club along the way."
    >
      {/* Advisors */}
      <section className="mb-16">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-accent-2">
            Advisors
          </h2>
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-xs text-white/50">
            {people.advisors.length}
          </span>
        </div>
        <PeopleGrid members={people.advisors} />
      </section>

      {/* Current members */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-accent-2">
            Current members
          </h2>
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-xs text-white/50">
            {people.current.length}
          </span>
        </div>
        <PeopleGrid members={people.current} />
      </section>

      {/* Alumni */}
      <section className="mt-16">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-accent-2">
            Alumni
          </h2>
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-xs text-white/50">
            {people.alumni.length}
          </span>
        </div>
        <PeopleGrid members={people.alumni} />
      </section>
    </PageShell>
  );
}
