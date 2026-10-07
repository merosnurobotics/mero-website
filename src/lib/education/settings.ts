// Server-side switch. Public by default; enable only when explicitly requested.
export function educationMembersOnly() {
  return process.env.EDUCATION_MEMBERS_ONLY === "true";
}
