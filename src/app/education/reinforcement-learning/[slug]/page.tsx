export { default, generateMetadata } from "../../deepml/[slug]/page";
import { deepMLLessons } from "@/lib/education/deepml-catalog";
export function generateStaticParams() { return deepMLLessons.slice(3).map(({ slug }) => ({ slug })); }
