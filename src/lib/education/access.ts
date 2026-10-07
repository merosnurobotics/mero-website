import "server-only";
import { redirect } from "next/navigation";
import { currentMember } from "@/lib/auth";

export async function requireEducationMember(path: string) {
  if (!await currentMember()) redirect(`/login?next=${encodeURIComponent(path)}`);
}
