import { events } from "@/data/site";
import EventDetail from "./EventDetail";

// Prerender one page per event.
export function generateStaticParams() {
  return events.map((ev) => ({ slug: ev.slug }));
}

export default async function EventDetailPage({
  params,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  return <EventDetail slug={slug} />;
}
