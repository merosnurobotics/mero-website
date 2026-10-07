import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { SESSION_COOKIE, sessionMember } from "./security";

export const currentMember = cache(async () => sessionMember((await cookies()).get(SESSION_COOKIE)?.value));
