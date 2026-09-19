# MERO 동아리 홈페이지

로보틱스·메이커 동아리 **MERO**의 공식 홈페이지입니다. (Next.js + Tailwind CSS)

이 문서는 **개발을 몰라도** 홈페이지 내용(부원, 프로젝트, 일정 등)을 직접 고치는 방법을 설명합니다.
이 사이트는 **한국어/영어 2개 언어**를 지원합니다.

---

## 1. 핵심 요약: 딱 한 파일만 고치면 됩니다

홈페이지에 보이는 거의 모든 글자와 목록은 아래 **한 파일**에 들어 있습니다.

```
src/data/site.ts
```

이 파일만 수정해서 GitHub에 저장(커밋)하면, 연결된 Vercel이 자동으로 홈페이지를 다시 배포합니다.
사진을 바꾸려면 `public/` 폴더의 이미지 파일을 교체하면 됩니다.

---

## 2. ⭐ 가장 중요: 한국어 / 영어 두 언어 함께 쓰기

이 사이트의 **모든 글자는 한국어와 영어 두 버전**을 함께 적습니다.
글자 값은 아래처럼 `{ en: "영어", ko: "한국어" }` 형태입니다.

```ts
title: { en: "Projects", ko: "프로젝트" }
```

- `en` = 영어로 보일 때의 글자
- `ko` = 한국어로 보일 때의 글자
- **두 개를 모두 채워야 합니다.** 하나를 비우면 그 언어에서 빈칸으로 보입니다.

> 📌 글자가 아닌 값(사진 경로 `image`, 수량 `qty`, 날짜 `date`, 주소 `slug`, 기술 태그 `tags`, 링크 `href`)은
> 언어와 상관없이 **한 번만** 적습니다. (예: `image: "/projects/robot.svg"`)

### 언어는 어떻게 정해지나요?

- 방문자가 **한국에 있거나 브라우저 언어가 한국어**면 → 자동으로 **한국어**로 열립니다.
- 그 외에는 → **영어**로 열립니다.
- 화면 오른쪽 위 **`EN` / `한국어` 버튼**으로 누구나 직접 바꿀 수 있고, 선택은 기억됩니다.

> 문법 규칙(공통):
> - 각 항목은 `{ ... }` 중괄호로 감싸고, 항목 사이는 쉼표 `,` 로 구분합니다.
> - 글자 값은 반드시 큰따옴표 `"..."` 로 감쌉니다.
> - 따옴표 안에서 큰따옴표를 쓰려면 `\"` 처럼 앞에 백슬래시를 붙입니다.

---

## 3. 부원(People) 추가·수정하기

`src/data/site.ts` 안의 `export const people` 부분을 찾으세요. 세 목록으로 나뉩니다.

- `advisors` : 지도교수 / 자문
- `current` : 현재 활동 부원
- `alumni` : 졸업생

각 사람은 아래 형식의 한 줄입니다.

```ts
{ name: "Jiwon Park", role: { en: "President", ko: "회장" }, year: { en: "2023", ko: "23학번" }, image: "/people/jiwon-park.svg" },
```

| 항목 | 설명 |
| --- | --- |
| `name` | 이름 (한 번만, 언어 공통) |
| `role` | 역할. `{ en, ko }` 형태로 영어·한국어 함께 |
| `year` | 기수/연도. `{ en, ko }` 형태. 졸업생은 기간(`"2019–2022"`), 지도교수는 소속으로 |
| `image` | 프로필 사진 경로. `/people/` 폴더 안의 파일 |

**졸업 처리** — `current`에서 해당 줄을 잘라 `alumni`로 옮기고 `year`를 기간으로 바꿉니다.

---

## 4. 프로젝트(Projects) 추가·수정하기

`export const projects` 부분입니다. 각 프로젝트는 아래 형식입니다.

```ts
{
  slug: "autonomous-delivery-robot",
  status: "in-progress",
  period: { en: "Spring 2025", ko: "2025 봄" },
  image: "/projects/autonomous-delivery-robot.svg",
  tags: ["ROS2", "LiDAR", "Computer Vision"],
  title: { en: "Autonomous Delivery Robot", ko: "자율주행 배송 로봇" },
  desc: { en: "Short summary.", ko: "짧은 요약 (목록 카드에 보임)." },
  detail: { en: "Long description.", ko: "상세 페이지에 보이는 긴 설명." },
  highlights: [
    { en: "Point 1", ko: "핵심 포인트 1" },
    { en: "Point 2", ko: "핵심 포인트 2" },
  ],
  team: { en: "Robotics team · 6 members", ko: "로보틱스 팀 · 6명" },
},
```

| 항목 | 설명 |
| --- | --- |
| `slug` | 상세 페이지 주소 → `/projects/<slug>`. **영문 소문자·하이픈(-)만**, 중복 금지 |
| `status` | 진행 상태. **`"in-progress"`** (진행 중, 강조색 배지) 또는 **`"completed"`** (완료, 회색 배지). 이 값은 영어 그대로 쓰고, 화면 표시 글자는 자동 번역됩니다 |
| `period` | 진행 시기 `{ en, ko }` |
| `image` | 대표 사진 경로 (`/projects/` 폴더) |
| `tags` | 기술 태그 (언어 공통, 한 번만) |
| `title` / `desc` / `detail` | 제목 / 짧은 설명 / 긴 설명, 각각 `{ en, ko }` |
| `highlights` | 핵심 포인트 목록. 각 항목이 `{ en, ko }` |
| `team` | 참여 팀/인원 `{ en, ko }` |

> 💡 메인 페이지 **주요 프로젝트(Featured Projects)** 영역에는 이 목록의 **처음 3개**가 자동 표시됩니다.

---

## 5. 일정(Schedule) 추가·수정하기

`export const schedule` 부분입니다.

```ts
{ date: "03.14", title: { en: "New Member Orientation", ko: "신입 부원 오리엔테이션" }, tag: { en: "Recruiting", ko: "모집" } },
```

| 항목 | 설명 |
| --- | --- |
| `date` | 날짜. `"월.일"` 형식 (예: `"03.14"`). 언어 공통 |
| `title` | 일정 이름 `{ en, ko }` |
| `tag` | 분류 라벨 `{ en, ko }` |

---

## 6. 장비(Equipment) 추가·수정하기

`export const equipment` 부분입니다.

```ts
{
  slug: "3d-printers",
  qty: 4,
  tag: { en: "Fabrication", ko: "제작" },
  image: "/equipment/3d-printers.svg",
  name: { en: "3D Printers", ko: "3D 프린터" },
  model: { en: "Bambu Lab X1C", ko: "Bambu Lab X1C" },
  detail: { en: "Long description.", ko: "긴 설명." },
  specs: [
    { label: { en: "Build volume", ko: "출력 크기" }, value: { en: "256 mm", ko: "256 mm" } },
  ],
},
```

| 항목 | 설명 |
| --- | --- |
| `slug` | 상세 페이지 주소 → `/equipment/<slug>`. 영문 소문자·하이픈, 중복 금지 |
| `qty` | 수량 (숫자, 따옴표 없이). 언어 공통 |
| `tag` / `name` / `model` / `detail` | 각각 `{ en, ko }` |
| `image` | 사진 경로 (`/equipment/` 폴더) |
| `specs` | 사양 표. 각 줄이 `label`(항목)과 `value`(값), 둘 다 `{ en, ko }` |

---

## 7. 행사(Events) 추가·수정하기

`export const events` 부분입니다.

```ts
{
  slug: "campus-hackathon",
  year: "2025",
  image: "/events/campus-hackathon.svg",
  name: { en: "Campus Hackathon", ko: "교내 해커톤" },
  result: { en: "Grand Prize", ko: "대상" },
  place: { en: "Engineering Hall", ko: "공학관" },
  detail: { en: "Recap.", ko: "후기." },
  gallery: [
    "/events/campus-hackathon.svg",
    "/events/campus-hackathon-2.svg",
  ],
},
```

| 항목 | 설명 |
| --- | --- |
| `slug` | 상세 페이지 주소 → `/events/<slug>`. 영문 소문자·하이픈, 중복 금지 |
| `year` | 연도 (언어 공통) |
| `name` / `result` / `place` / `detail` | 각각 `{ en, ko }` |
| `image` | 대표 사진 경로 (`/events/` 폴더) |
| `gallery` | 상세 페이지 사진 목록 (여러 장, 언어 공통) |

---

## 8. 사진 넣기

사진은 모두 `public/` 폴더 안에 종류별로 있습니다.

```
public/
├─ people/       ← 부원 사진
├─ projects/     ← 프로젝트 사진
├─ equipment/    ← 장비 사진
└─ events/       ← 행사 사진
```

**사진 바꾸는 방법 (둘 중 하나):**

1. **기존 파일 교체** — 같은 이름으로 새 사진을 덮어씁니다.
2. **새 파일 추가** — 새 사진을 폴더에 올리고, `site.ts`의 `image` 값을 그 경로로 바꿉니다.
   예: `public/projects/new-robot.jpg` → `image: "/projects/new-robot.jpg"`

> 📌 경로는 `public`을 빼고 `/` 부터 씁니다. 형식은 `.jpg`, `.png`, `.svg`, `.webp` 모두 가능.
> 부원 사진은 **정사각형**, 프로젝트·행사 사진은 **가로가 긴(16:9)** 사진이 잘 어울립니다.
> 사진에는 글자가 없으므로 언어와 상관없이 한 번만 넣으면 됩니다.

---

## 9. 메뉴 이름·기본 정보 바꾸기

`site.ts` 맨 위 `export const site` 부분입니다.

- `name` : 동아리 이름 (언어 공통)
- `tagline` / `description` : 대문 소개 문구 `{ en, ko }`
- `nav` : 상단 메뉴. 각 줄의 `label`이 `{ en, ko }`, `href`가 이동 주소(공통)
- `stats` : 대문 숫자 4개. `value`(숫자, 공통), `label`(`{ en, ko }`)

버튼·페이지 제목 같은 UI 문구는 `export const ui` 부분에 모여 있습니다. 여기도 모두 `{ en, ko }` 형식입니다.

연락처는 `export const contact` 에서 이메일·위치·SNS를 바꿉니다. (위치 `location`만 `{ en, ko }`)

---

## 10. 언어 자동 감지는 어떻게 동작하나요? (참고)

- `src/proxy.ts` 가 방문자의 **국가(한국인지)** 와 **브라우저 언어**를 보고 첫 언어를 정합니다.
  - 한국(또는 한국어 브라우저) → 한국어, 그 외 → 영어
- 한 번 정해지면 `lang` 쿠키에 저장되어 다음 방문에도 유지됩니다.
- 방문자가 오른쪽 위 `EN` / `한국어` 버튼을 누르면 그 선택이 우선합니다.

> 국가 감지는 **Vercel에 배포됐을 때** 정확히 동작합니다. 내 컴퓨터(`npm run dev`)에서는
> 브라우저 언어로 판단합니다. 언어를 직접 확인하려면 오른쪽 위 버튼으로 바꿔 보세요.

---

## 11. 바뀐 내용 확인하고 배포하기

### 내 컴퓨터에서 미리 보기

```bash
npm install   # 최초 1회만
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열면 실시간으로 확인됩니다.

### 실제 홈페이지에 반영하기

`src/data/site.ts` (또는 `public/` 사진)를 고친 뒤 GitHub에 커밋·푸시하면,
Vercel이 자동으로 다시 배포합니다. 보통 1~2분 안에 반영됩니다.

> ⚠️ 저장 전에 쉼표·따옴표·`{ en, ko }` 짝을 실수로 빠뜨리면 배포가 실패할 수 있습니다.
> 가능하면 `npm run dev` 로 먼저 확인하거나, `npm run build` 를 돌려 에러가 없는지 보세요.

---

## 폴더 구조 참고

```
src/
├─ data/site.ts        ← ★ 내용은 대부분 여기서 수정 (한/영 함께)
├─ proxy.ts            ← 언어 자동 감지 (건드릴 일 거의 없음)
├─ app/                ← 각 페이지 (about, projects, people, schedule ...)
└─ components/         ← 공통 UI (네비게이션 바, 언어 전환, 푸터 등)
public/                ← 사진·이미지 파일
```

내용(글자·목록·사진)만 바꾸는 거라면 **`src/data/site.ts` 와 `public/` 폴더**만 건드리면 충분합니다.
