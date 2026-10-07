import "server-only";
import { redirect } from "next/navigation";
import { educationMembersOnly } from "./settings";
import { currentMember } from "@/lib/auth";

export async function requireEducationMember(path: string) {
  if (educationMembersOnly() && !await currentMember()) redirect(`/login?next=${encodeURIComponent(path)}`);
}
