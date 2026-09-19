"use client";

import { useState } from "react";
import { schedule, ui } from "@/data/site";
import { useLang } from "@/components/LanguageProvider";

type ScheduleItem = (typeof schedule)[number];

const WEEKDAYS = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ko: ["일", "월", "화", "수", "목", "금", "토"],
};
const MONTHS = {
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  ko: [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
  ],
};

// Parse "YYYY-MM-DD" into { year, month, day } (month 1-based).
function parseDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

// Local "today" as a YYYY-MM-DD-comparable object (no timezone surprises).
function todayParts() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

// Upcoming events: today or later, soonest first, limited to `count`.
function upcomingEvents(items: ScheduleItem[], count: number) {
  const t = todayParts();
  const todayKey = `${t.year}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
  return [...items]
    .filter((s) => s.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}

export default function Calendar() {
  const { lang, t } = useLang();
  const now = todayParts();

  // Which month is shown. Defaults to the current month.
  const [view, setView] = useState({ year: now.year, month: now.month });

  const goPrev = () =>
    setView((v) =>
      v.month === 1 ? { year: v.year - 1, month: 12 } : { ...v, month: v.month - 1 },
    );
  const goNext = () =>
    setView((v) =>
      v.month === 12 ? { year: v.year + 1, month: 1 } : { ...v, month: v.month + 1 },
    );

  // Build day cells for the shown month.
  const firstWeekday = new Date(view.year, view.month - 1, 1).getDay();
  const daysInMonth = new Date(view.year, view.month, 0).getDate();

  const eventsByDay = new Map<number, ScheduleItem[]>();
  for (const item of schedule) {
    const d = parseDate(item.date);
    if (d.year !== view.year || d.month !== view.month) continue;
    if (!eventsByDay.has(d.day)) eventsByDay.set(d.day, []);
    eventsByDay.get(d.day)!.push(item);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const upcoming = upcomingEvents(schedule, 3);
  const monthName = MONTHS[lang][view.month - 1];
  const heading =
    lang === "ko" ? `${view.year}년 ${monthName}` : `${monthName} ${view.year}`;

  return (
    <div>
      {/* Month header with prev/next */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={goPrev}
          aria-label="Previous month"
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
        >
          ‹
        </button>
        <h2 className="text-xl font-black sm:text-2xl">{heading}</h2>
        <button
          onClick={goNext}
          aria-label="Next month"
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
        >
          ›
        </button>
      </div>

      {/* Calendar grid */}
      <div className="card rounded-2xl p-5 sm:p-6">
        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wide text-white/40">
          {WEEKDAYS[lang].map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="mt-2 grid grid-cols-7 gap-2">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`blank-${i}`} className="min-h-20 rounded-lg" />;
            }
            const dayEvents = eventsByDay.get(day) ?? [];
            const hasEvents = dayEvents.length > 0;
            const isToday =
              day === now.day &&
              view.month === now.month &&
              view.year === now.year;

            return (
              <div
                key={day}
                className={`min-h-20 rounded-lg border p-1.5 text-left transition-colors ${
                  isToday
                    ? "border-accent-2 bg-accent-2/10 ring-1 ring-accent-2"
                    : hasEvents
                      ? "border-accent/40 bg-gradient-to-br from-accent/15 to-accent-2/10"
                      : "border-white/5 bg-white/[0.015]"
                }`}
              >
                <div
                  className={`inline-grid h-6 w-6 place-items-center rounded-full font-mono text-xs ${
                    isToday
                      ? "bg-accent-2 font-bold text-black"
                      : hasEvents
                        ? "font-bold text-accent-2"
                        : "text-white/40"
                  }`}
                >
                  {day}
                </div>
                <div className="mt-1 space-y-1">
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.date + t(ev.title)}
                      title={`${t(ev.title)} · ${t(ev.tag)}`}
                      className="truncate rounded bg-white/10 px-1.5 py-0.5 text-[10px] leading-tight text-white/80"
                    >
                      {t(ev.title)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming events */}
      <div className="mt-10">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent-2">
          {t(ui.schedule.upcoming)}
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-white/50">{t(ui.schedule.noUpcoming)}</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((s) => {
              const d = parseDate(s.date);
              return (
                <div
                  key={s.date + t(s.title)}
                  className="card flex items-center gap-5 rounded-xl p-5"
                >
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-2/20 text-white">
                    <span className="font-mono text-[10px] text-accent-2">
                      {String(d.month).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-xl font-bold leading-none">
                      {d.day}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{t(s.title)}</h4>
                    <p className="mt-1 font-mono text-xs text-white/40">
                      {s.date}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                    {t(s.tag)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
