import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { LOCALE_COOKIE, toLocale } from "./i18n";

export const getLocale = cache(async () => toLocale((await cookies()).get(LOCALE_COOKIE)?.value));
