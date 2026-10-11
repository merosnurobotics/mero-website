export type ConceptLesson = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  level: "입문" | "기초" | "응용";
  minutes: number;
  prerequisites: string[];
  goals: string[];
  sections: {
    id: string;
    title: string;
    paragraphs: string[];
    bullets?: string[];
    comparison?: { headers: string[]; rows: string[][] };
  }[];
  example: { title: string; situation: string; walkthrough: string[]; takeaway: string };
  misconceptions: { claim: string; correction: string }[];
  questions: { prompt: string; answer: string }[];
  sources: { title: string; url: string; note: string }[];
  updatedAt: string;
};
