import { equipment } from "@/data/site";
import EquipmentDetail from "./EquipmentDetail";

// Prerender one page per equipment item.
export function generateStaticParams() {
  return equipment.map((e) => ({ slug: e.slug }));
}

export default async function EquipmentDetailPage({
  params,
}: PageProps<"/equipment/[slug]">) {
  const { slug } = await params;
  return <EquipmentDetail slug={slug} />;
}
