// ============================================================
//  MERO club homepage content data (English + Korean)
//  Edit this file to update the homepage content directly.
//
//  HOW TO EDIT (KO/EN):
//  Every piece of text has two versions: `en` (English) and `ko` (Korean).
//  Example:  title: { en: "Projects", ko: "프로젝트" }
//  Change the text inside the quotes. Keep both en and ko filled in.
//  Fields that are NOT text (slug, image, qty, dates, tags, links) are
//  shared across both languages and only written once.
//
//  (Editing and committing this file on GitHub auto-deploys via Vercel)
// ============================================================

export type Lang = "en" | "ko";

// A text value that exists in both languages.
export type LocalizedText = { en: string; ko: string };

// Pick one language out of a localized value.
export function t(value: LocalizedText, lang: Lang): string {
  return value[lang];
}

// ------------------------------------------------------------
//  Site-wide text: name, tagline, navigation, stats
// ------------------------------------------------------------
export const site = {
  name: "MERO",
  tagline: {
    en: "A robotics & maker club that builds, experiments, and grows together",
    ko: "만들고, 실험하고, 함께 성장하는 로보틱스 · 메이커 동아리",
  },
  description: {
    en: "MERO is a community of people who turn ideas into things with their own hands. We move freely across robotics, embedded systems, and software, taking on projects and competitions every semester.",
    ko: "MERO는 아이디어를 직접 손으로 만들어내는 사람들의 모임입니다. 로봇, 임베디드, 소프트웨어를 넘나들며 매 학기 프로젝트와 대회에 도전합니다.",
  },
  // Top navigation menu (href is shared; label is translated)
  nav: [
    { label: { en: "About", ko: "소개" }, href: "/about" },
    { label: { en: "Equipment", ko: "장비" }, href: "/equipment" },
    { label: { en: "Projects", ko: "프로젝트" }, href: "/projects" },
    { label: { en: "Events", ko: "행사" }, href: "/events" },
    { label: { en: "People", ko: "구성원" }, href: "/people" },
    { label: { en: "Schedule", ko: "일정" }, href: "/schedule" },
    { label: { en: "Contact", ko: "연락처" }, href: "/support" },
  ],
  // Key figures shown in the hero section (value shared; label translated)
  stats: [
    { value: "40", label: { en: "Active members", ko: "활동 부원" } },
    { value: "12", label: { en: "Ongoing projects", ko: "진행 프로젝트" } },
    { value: "9", label: { en: "Competitions & events", ko: "참여 대회·행사" } },
    { value: "2018", label: { en: "Founded", ko: "설립 연도" } },
  ],
};

// ------------------------------------------------------------
//  Reusable UI strings (page headers, buttons, section labels)
// ------------------------------------------------------------
export const ui = {
  hero: {
    badge: {
      en: "Now recruiting new members · together since 2018",
      ko: "신입 부원 모집 중 · 2018년부터 함께",
    },
    headlineA: { en: "People who turn ideas into", ko: "아이디어를" },
    headlineHighlight: { en: "reality", ko: "현실" },
    headlineB: { en: ", this is", ko: "로 만드는 사람들," },
    ctaPrimary: { en: "Contact us", ko: "연락하기" },
    ctaSecondary: { en: "Browse projects", ko: "프로젝트 둘러보기" },
    featuredEyebrow: { en: "Featured Projects", ko: "주요 프로젝트" },
    featuredTitle: { en: "What we're building", ko: "우리가 만드는 것들" },
    viewAll: { en: "View all projects", ko: "전체 프로젝트 보기" },
  },
  about: {
    eyebrow: { en: "About", ko: "소개" },
    title: { en: "What we do", ko: "우리가 하는 일" },
  },
  equipment: {
    eyebrow: { en: "Equipment", ko: "장비" },
    title: { en: "An environment to build anything", ko: "무엇이든 만들 수 있는 환경" },
    description: {
      en: "We're equipped with fabrication, measurement, and computing gear so you can turn ideas into prototypes right away.",
      ko: "아이디어를 바로 시제품으로 옮길 수 있도록 제작·계측·컴퓨팅 장비를 갖추고 있습니다.",
    },
    specs: { en: "Specs", ko: "사양" },
    available: { en: "available", ko: "보유" },
    back: { en: "← Back to equipment", ko: "← 장비 목록으로" },
  },
  projects: {
    eyebrow: { en: "Projects", ko: "프로젝트" },
    title: { en: "What we're building now", ko: "지금 만들고 있는 것들" },
    description: {
      en: "Every semester we form teams and turn ideas into working results.",
      ko: "매 학기 팀을 꾸려 아이디어를 실제로 동작하는 결과물로 완성합니다.",
    },
    highlights: { en: "Highlights", ko: "핵심 포인트" },
    team: { en: "Team", ko: "팀" },
    tech: { en: "Tech", ko: "기술" },
    inProgress: { en: "In progress", ko: "진행 중" },
    completed: { en: "Completed", ko: "완료" },
    back: { en: "← Back to projects", ko: "← 프로젝트 목록으로" },
  },
  events: {
    eyebrow: { en: "Events & Competitions", ko: "행사 · 대회" },
    title: { en: "The stages we've taken on", ko: "우리가 도전한 무대" },
    description: {
      en: "We regularly take part in on- and off-campus competitions and exhibitions to compete and share.",
      ko: "교내외 대회와 전시에 꾸준히 참여하며 실력을 겨루고 나눕니다.",
    },
    gallery: { en: "Gallery", ko: "갤러리" },
    back: { en: "← Back to events", ko: "← 행사 목록으로" },
  },
  people: {
    eyebrow: { en: "People", ko: "구성원" },
    title: { en: "The people behind MERO", ko: "MERO를 만드는 사람들" },
    description: {
      en: "Meet the members building today and the alumni who shaped the club along the way.",
      ko: "지금 함께하는 부원들과 동아리를 만들어온 졸업생들을 소개합니다.",
    },
    advisors: { en: "Advisors", ko: "지도교수" },
    current: { en: "Current members", ko: "현재 부원" },
    alumni: { en: "Alumni", ko: "졸업생" },
  },
  schedule: {
    eyebrow: { en: "Schedule", ko: "일정" },
    title: { en: "Upcoming activities", ko: "다가오는 활동" },
    description: {
      en: "From workshops to competition prep, check out this semester's key dates.",
      ko: "워크숍부터 대회 준비까지, 이번 학기 주요 일정을 확인하세요.",
    },
  },
  support: {
    eyebrow: { en: "Contact", ko: "연락처" },
    title: { en: "Get in touch", ko: "연락 주세요" },
    description: {
      en: "Whether you want to join, mentor, sponsor, or just cheer us on, we'd love to hear from you.",
      ko: "가입, 멘토링, 후원, 혹은 응원까지 — 어떤 방식이든 연락 주시면 반갑겠습니다.",
    },
    getInTouchA: { en: "Get in", ko: "아래로" },
    getInTouchHighlight: { en: "touch", ko: "연락" },
    getInTouchB: { en: "below", ko: "주세요" },
    sponsorsTitle: { en: "Honor & Sponsors", ko: "후원 · 협력사" },
    sponsorsDesc: {
      en: "Thank you to the organizations that support MERO.",
      ko: "MERO를 후원해 주시는 기업·기관에 감사드립니다.",
    },
  },
  footer: {
    tagline: { en: "Build, experiment, together.", ko: "만들고 실험하고 함께." },
  },
};

// ------------------------------------------------------------
//  About — what we do
// ------------------------------------------------------------
export const about = [
  {
    icon: "robot",
    title: { en: "Robotics", ko: "로보틱스" },
    desc: {
      en: "We design and build hardware and control systems ourselves, including autonomous robots, robotic arms, and drones.",
      ko: "자율주행 로봇, 로봇팔, 드론 등 하드웨어와 제어 시스템을 직접 설계하고 제작합니다.",
    },
  },
  {
    icon: "chip",
    title: { en: "Embedded · IoT", ko: "임베디드 · IoT" },
    desc: {
      en: "We use sensors and microcontrollers to build systems that connect the physical world with software.",
      ko: "센서와 마이크로컨트롤러를 활용해 물리 세계와 소프트웨어를 연결하는 시스템을 만듭니다.",
    },
  },
  {
    icon: "code",
    title: { en: "Software", ko: "소프트웨어" },
    desc: {
      en: "From web and apps to computer vision and data, we write all the code needed to complete a project together.",
      ko: "웹, 앱, 컴퓨터 비전, 데이터까지 프로젝트를 완성하는 데 필요한 모든 코드를 함께 짭니다.",
    },
  },
];

// ------------------------------------------------------------
//  People — advisors, current members, alumni
//  name/year/image are shared; role is translated.
// ------------------------------------------------------------
export const people = {
  advisors: [
    { name: "Prof. Jaehyun Moon", role: { en: "Faculty Advisor", ko: "지도교수" }, year: { en: "Dept. of Mechanical Eng.", ko: "기계공학과" }, image: "/people/jaehyun-moon.svg" },
    { name: "Prof. Hyeri Baek", role: { en: "Faculty Advisor", ko: "지도교수" }, year: { en: "Dept. of Electrical Eng.", ko: "전기공학과" }, image: "/people/hyeri-baek.svg" },
  ],
  current: [
    { name: "Jiwon Park", role: { en: "President", ko: "회장" }, year: { en: "2023", ko: "23학번" }, image: "/people/jiwon-park.svg" },
    { name: "Minseok Lee", role: { en: "Vice President", ko: "부회장" }, year: { en: "2023", ko: "23학번" }, image: "/people/minseok-lee.svg" },
    { name: "Soyeon Kim", role: { en: "Robotics Lead", ko: "로보틱스 팀장" }, year: { en: "2024", ko: "24학번" }, image: "/people/soyeon-kim.svg" },
    { name: "Hyunwoo Choi", role: { en: "Embedded Lead", ko: "임베디드 팀장" }, year: { en: "2024", ko: "24학번" }, image: "/people/hyunwoo-choi.svg" },
    { name: "Dahye Jung", role: { en: "Software Lead", ko: "소프트웨어 팀장" }, year: { en: "2024", ko: "24학번" }, image: "/people/dahye-jung.svg" },
    { name: "Junho Kang", role: { en: "Treasurer", ko: "총무" }, year: { en: "2025", ko: "25학번" }, image: "/people/junho-kang.svg" },
    { name: "Yerin Han", role: { en: "Member", ko: "부원" }, year: { en: "2025", ko: "25학번" }, image: "/people/yerin-han.svg" },
    { name: "Taeyang Seo", role: { en: "Member", ko: "부원" }, year: { en: "2025", ko: "25학번" }, image: "/people/taeyang-seo.svg" },
  ],
  alumni: [
    { name: "Woojin Yoon", role: { en: "Founder · President", ko: "창립자 · 회장" }, year: { en: "2018–2021", ko: "2018–2021" }, image: "/people/woojin-yoon.svg" },
    { name: "Eunji Shin", role: { en: "Robotics Lead", ko: "로보틱스 팀장" }, year: { en: "2019–2022", ko: "2019–2022" }, image: "/people/eunji-shin.svg" },
    { name: "Sangmin Oh", role: { en: "Software Lead", ko: "소프트웨어 팀장" }, year: { en: "2020–2023", ko: "2020–2023" }, image: "/people/sangmin-oh.svg" },
    { name: "Nari Cho", role: { en: "President", ko: "회장" }, year: { en: "2021–2023", ko: "2021–2023" }, image: "/people/nari-cho.svg" },
  ],
};

// ------------------------------------------------------------
//  Equipment
//  slug/image/qty/tag are shared; name/model/detail/specs are translated.
// ------------------------------------------------------------
export const equipment = [
  {
    slug: "3d-printers",
    qty: 4,
    tag: { en: "Fabrication", ko: "제작" },
    image: "/equipment/3d-printers.svg",
    name: { en: "3D Printers", ko: "3D 프린터" },
    model: { en: "Bambu Lab X1C · Prusa MK4", ko: "Bambu Lab X1C · Prusa MK4" },
    detail: {
      en: "Our fleet of FDM printers lets multiple teams prototype in parallel. From quick draft parts to production-quality enclosures, we print in PLA, PETG, and TPU almost every day.",
      ko: "여러 팀이 동시에 시제품을 만들 수 있는 FDM 프린터들입니다. 간단한 초안 부품부터 완성도 높은 케이스까지 PLA, PETG, TPU로 거의 매일 출력합니다.",
    },
    specs: [
      { label: { en: "Build volume", ko: "출력 크기" }, value: { en: "256 × 256 × 256 mm", ko: "256 × 256 × 256 mm" } },
      { label: { en: "Materials", ko: "재료" }, value: { en: "PLA · PETG · TPU · ABS", ko: "PLA · PETG · TPU · ABS" } },
      { label: { en: "Nozzle", ko: "노즐" }, value: { en: "0.4 mm (swappable)", ko: "0.4 mm (교체 가능)" } },
    ],
  },
  {
    slug: "laser-cutter",
    qty: 1,
    tag: { en: "Fabrication", ko: "제작" },
    image: "/equipment/laser-cutter.svg",
    name: { en: "Laser Cutter", ko: "레이저 커터" },
    model: { en: "FSL Muse 3D", ko: "FSL Muse 3D" },
    detail: {
      en: "A CO2 laser cutter for acrylic, plywood, and cardboard. Great for enclosures, gears, and precise flat parts that would be slow to print.",
      ko: "아크릴, 합판, 판지를 자르는 CO2 레이저 커터입니다. 케이스, 기어, 정밀한 평면 부품을 빠르게 만들 수 있습니다.",
    },
    specs: [
      { label: { en: "Work area", ko: "작업 영역" }, value: { en: "500 × 300 mm", ko: "500 × 300 mm" } },
      { label: { en: "Laser", ko: "레이저" }, value: { en: "40W CO2", ko: "40W CO2" } },
      { label: { en: "Materials", ko: "재료" }, value: { en: "Acrylic · Wood · Paper", ko: "아크릴 · 목재 · 종이" } },
    ],
  },
  {
    slug: "oscilloscopes",
    qty: 3,
    tag: { en: "Measurement", ko: "계측" },
    image: "/equipment/oscilloscopes.svg",
    name: { en: "Oscilloscopes", ko: "오실로스코프" },
    model: { en: "Rigol DS1054Z", ko: "Rigol DS1054Z" },
    detail: {
      en: "Four-channel digital oscilloscopes for debugging analog and digital circuits, checking signal integrity, and teaching electronics fundamentals.",
      ko: "아날로그·디지털 회로를 디버깅하고 신호 무결성을 확인하며 전자 기초를 가르치는 데 쓰는 4채널 디지털 오실로스코프입니다.",
    },
    specs: [
      { label: { en: "Bandwidth", ko: "대역폭" }, value: { en: "50 MHz", ko: "50 MHz" } },
      { label: { en: "Channels", ko: "채널" }, value: { en: "4", ko: "4" } },
      { label: { en: "Sample rate", ko: "샘플링 속도" }, value: { en: "1 GSa/s", ko: "1 GSa/s" } },
    ],
  },
  {
    slug: "soldering-stations",
    qty: 6,
    tag: { en: "Fabrication", ko: "제작" },
    image: "/equipment/soldering-stations.svg",
    name: { en: "Soldering Stations", ko: "납땜 스테이션" },
    model: { en: "Hakko FX-888D", ko: "Hakko FX-888D" },
    detail: {
      en: "Temperature-controlled soldering stations at our electronics bench for through-hole and surface-mount work.",
      ko: "스루홀과 표면 실장 작업을 위한 온도 조절 납땜 스테이션이 전자 작업대에 마련되어 있습니다.",
    },
    specs: [
      { label: { en: "Temp range", ko: "온도 범위" }, value: { en: "200–480 °C", ko: "200–480 °C" } },
      { label: { en: "Stations", ko: "스테이션 수" }, value: { en: "6 seats", ko: "6석" } },
      { label: { en: "Tips", ko: "인두팁" }, value: { en: "Fine · Chisel · Bevel", ko: "가는팁 · 끌형 · 경사형" } },
    ],
  },
  {
    slug: "embedded-boards",
    qty: 12,
    tag: { en: "Computing", ko: "컴퓨팅" },
    image: "/equipment/embedded-boards.svg",
    name: { en: "Embedded Boards", ko: "임베디드 보드" },
    model: { en: "Raspberry Pi 5 · Jetson Orin Nano", ko: "Raspberry Pi 5 · Jetson Orin Nano" },
    detail: {
      en: "A shared pool of single-board computers and microcontrollers for robotics, computer vision, and IoT projects. Members can check them out for a semester.",
      ko: "로보틱스, 컴퓨터 비전, IoT 프로젝트를 위한 싱글보드 컴퓨터와 마이크로컨트롤러 공용 세트입니다. 부원들은 한 학기 동안 대여할 수 있습니다.",
    },
    specs: [
      { label: { en: "SBCs", ko: "싱글보드" }, value: { en: "Raspberry Pi 5 · Jetson Orin Nano", ko: "Raspberry Pi 5 · Jetson Orin Nano" } },
      { label: { en: "MCUs", ko: "MCU" }, value: { en: "ESP32 · STM32 · Arduino", ko: "ESP32 · STM32 · Arduino" } },
      { label: { en: "Available units", ko: "보유 수량" }, value: { en: "12", ko: "12" } },
    ],
  },
  {
    slug: "drone-platforms",
    qty: 5,
    tag: { en: "Flight", ko: "비행" },
    image: "/equipment/drone-platforms.svg",
    name: { en: "Drone Platforms", ko: "드론 플랫폼" },
    model: { en: "DJI Tello · Custom FPV", ko: "DJI Tello · 커스텀 FPV" },
    detail: {
      en: "Ready-to-fly and custom-built drones for programming practice, aerial imaging, and FPV racing experiments.",
      ko: "프로그래밍 실습, 항공 촬영, FPV 레이싱 실험을 위한 완제품 및 커스텀 제작 드론입니다.",
    },
    specs: [
      { label: { en: "Ready-to-fly", ko: "완제품" }, value: { en: "DJI Tello", ko: "DJI Tello" } },
      { label: { en: "Custom", ko: "커스텀" }, value: { en: "5-inch FPV quad", ko: "5인치 FPV 쿼드" } },
      { label: { en: "Control", ko: "제어" }, value: { en: "SDK · Betaflight", ko: "SDK · Betaflight" } },
    ],
  },
  {
    slug: "robotic-arms",
    qty: 2,
    tag: { en: "Robotics", ko: "로보틱스" },
    image: "/equipment/robotic-arms.svg",
    name: { en: "Robotic Arms", ko: "로봇팔" },
    model: { en: "Dobot Magician", ko: "Dobot Magician" },
    detail: {
      en: "Desktop robotic arms used for pick-and-place demos, motion planning, and human-robot interaction projects.",
      ko: "픽앤플레이스 시연, 모션 플래닝, 인간-로봇 상호작용 프로젝트에 쓰는 데스크톱 로봇팔입니다.",
    },
    specs: [
      { label: { en: "Reach", ko: "작업 반경" }, value: { en: "320 mm", ko: "320 mm" } },
      { label: { en: "Payload", ko: "가반 하중" }, value: { en: "500 g", ko: "500 g" } },
      { label: { en: "Axes", ko: "축" }, value: { en: "4", ko: "4" } },
    ],
  },
  {
    slug: "power-tool-set",
    qty: 1,
    tag: { en: "Machining", ko: "가공" },
    image: "/equipment/power-tool-set.svg",
    name: { en: "Power Tool Set", ko: "전동 공구 세트" },
    model: { en: "Drill · Grinder · Band saw", ko: "드릴 · 그라인더 · 밴드쏘" },
    detail: {
      en: "A basic workshop corner for cutting, drilling, and finishing metal and wood parts that finish off a build.",
      ko: "금속·목재 부품을 자르고 뚫고 다듬어 완성도를 높이는 기본 작업 공간입니다.",
    },
    specs: [
      { label: { en: "Cutting", ko: "절단" }, value: { en: "Band saw · Angle grinder", ko: "밴드쏘 · 앵글 그라인더" } },
      { label: { en: "Drilling", ko: "드릴링" }, value: { en: "Bench + hand drill", ko: "탁상·핸드 드릴" } },
      { label: { en: "Safety", ko: "안전" }, value: { en: "Goggles · Gloves provided", ko: "고글 · 장갑 제공" } },
    ],
  },
];

// ------------------------------------------------------------
//  Projects
//  slug/image/period/tags are shared; title/status/desc/detail/highlights/team translated.
//  For `status`, use "in-progress" or "completed" (drives the badge color).
// ------------------------------------------------------------
export const projects = [
  {
    slug: "autonomous-delivery-robot",
    status: "in-progress",
    period: { en: "Spring 2025", ko: "2025 봄" },
    image: "/projects/autonomous-delivery-robot.svg",
    tags: ["ROS2", "LiDAR", "Computer Vision"],
    title: { en: "Autonomous Delivery Robot", ko: "자율주행 배송 로봇" },
    desc: {
      en: "A delivery robot that navigates indoors and outdoors on campus using LiDAR- and camera-based SLAM.",
      ko: "라이다와 카메라 기반 SLAM으로 캠퍼스 내 실내외를 주행하는 배송 로봇.",
    },
    detail: {
      en: "We're building a wheeled robot that can carry small packages between campus buildings on its own. It fuses LiDAR and camera data for mapping and obstacle avoidance, and plans routes with a ROS2 navigation stack.",
      ko: "캠퍼스 건물 사이로 소형 물품을 스스로 운반하는 바퀴형 로봇을 만들고 있습니다. 라이다와 카메라 데이터를 융합해 지도를 만들고 장애물을 피하며, ROS2 내비게이션 스택으로 경로를 계획합니다.",
    },
    highlights: [
      { en: "Real-time SLAM with sensor fusion", ko: "센서 융합 기반 실시간 SLAM" },
      { en: "Autonomous path planning and re-routing", ko: "자율 경로 계획 및 재탐색" },
      { en: "Custom chassis with a lockable cargo bay", ko: "잠금형 적재함을 갖춘 커스텀 섀시" },
    ],
    team: { en: "Robotics team · 6 members", ko: "로보틱스 팀 · 6명" },
  },
  {
    slug: "smart-cultivation-system",
    status: "completed",
    period: { en: "Fall 2024", ko: "2024 가을" },
    image: "/projects/smart-cultivation-system.svg",
    tags: ["ESP32", "IoT", "React"],
    title: { en: "Smart Cultivation System", ko: "스마트 재배 시스템" },
    desc: {
      en: "An IoT system that optimizes plant growth with temperature/humidity/light sensors and automatic watering.",
      ko: "온습도·조도 센서와 자동 급수로 식물 생육을 최적화하는 IoT 시스템.",
    },
    detail: {
      en: "A closed-loop growing box that monitors temperature, humidity, and light, then automatically waters and adjusts lighting. A React dashboard shows live readings and history.",
      ko: "온도, 습도, 조도를 모니터링해 자동으로 급수하고 조명을 조절하는 폐쇄형 재배 상자입니다. React 대시보드로 실시간 수치와 기록을 볼 수 있습니다.",
    },
    highlights: [
      { en: "ESP32 firmware with sensor polling", ko: "센서 폴링을 수행하는 ESP32 펌웨어" },
      { en: "Automatic watering and grow-light control", ko: "자동 급수 및 식물등 제어" },
      { en: "Live dashboard with charts", ko: "차트가 있는 실시간 대시보드" },
    ],
    team: { en: "IoT team · 4 members", ko: "IoT 팀 · 4명" },
  },
  {
    slug: "gesture-controlled-robotic-arm",
    status: "completed",
    period: { en: "Spring 2024", ko: "2024 봄" },
    image: "/projects/gesture-controlled-robotic-arm.svg",
    tags: ["MediaPipe", "Python", "Arduino"],
    title: { en: "Gesture-Controlled Robotic Arm", ko: "제스처 인식 로봇팔" },
    desc: {
      en: "An interaction project that controls a robotic arm by recognizing hand gestures in real time.",
      ko: "손 동작을 실시간으로 인식해 로봇팔을 조종하는 인터랙션 프로젝트.",
    },
    detail: {
      en: "Using a webcam and MediaPipe hand tracking, this project maps finger and wrist movements to a robotic arm in real time, letting you move objects without touching a controller.",
      ko: "웹캠과 MediaPipe 손 추적을 이용해 손가락과 손목 움직임을 실시간으로 로봇팔에 매핑하여, 컨트롤러 없이 물체를 옮길 수 있습니다.",
    },
    highlights: [
      { en: "Real-time hand landmark tracking", ko: "실시간 손 랜드마크 추적" },
      { en: "Gesture-to-motion mapping", ko: "제스처-동작 매핑" },
      { en: "Sub-100ms control latency", ko: "100ms 미만의 제어 지연" },
    ],
    team: { en: "Vision team · 3 members", ko: "비전 팀 · 3명" },
  },
  {
    slug: "fpv-racing-drone",
    status: "in-progress",
    period: { en: "Summer 2025", ko: "2025 여름" },
    image: "/projects/fpv-racing-drone.svg",
    tags: ["Betaflight", "PCB Design", "3D Printing"],
    title: { en: "FPV Racing Drone", ko: "FPV 레이싱 드론" },
    desc: {
      en: "A racing drone built with a self-designed, self-assembled frame and custom firmware.",
      ko: "직접 설계·조립한 프레임과 커스텀 펌웨어로 완성한 레이싱 드론.",
    },
    detail: {
      en: "A 5-inch FPV racing quad designed from the frame up. We're tuning a custom Betaflight configuration and iterating on a 3D-printed frame for durability and weight.",
      ko: "프레임부터 직접 설계한 5인치 FPV 레이싱 쿼드입니다. 커스텀 Betaflight 설정을 튜닝하고 내구성과 무게를 위해 3D 프린팅 프레임을 개선하고 있습니다.",
    },
    highlights: [
      { en: "Self-designed 3D-printed frame", ko: "직접 설계한 3D 프린팅 프레임" },
      { en: "Custom Betaflight tune", ko: "커스텀 Betaflight 튜닝" },
      { en: "Low-latency analog FPV feed", ko: "저지연 아날로그 FPV 영상" },
    ],
    team: { en: "Flight team · 5 members", ko: "비행 팀 · 5명" },
  },
];

// ------------------------------------------------------------
//  Events & competitions
//  slug/image/year/gallery are shared; name/result/place/detail translated.
// ------------------------------------------------------------
export const events = [
  {
    slug: "national-university-robot-competition",
    year: "2024",
    image: "/events/national-university-robot-competition.svg",
    name: { en: "National University Robot Competition", ko: "전국 대학생 로봇경진대회" },
    result: { en: "Finalist · Special Award", ko: "본선 진출 · 특별상" },
    place: { en: "COEX", ko: "코엑스" },
    detail: {
      en: "Two of our teams reached the finals of the national robot competition. One picked up a special award for its innovative gripper design after three intense days of qualifiers.",
      ko: "우리 팀 두 곳이 전국 로봇경진대회 본선에 진출했습니다. 사흘간의 치열한 예선 끝에 한 팀은 혁신적인 그리퍼 설계로 특별상을 받았습니다.",
    },
    gallery: [
      "/events/national-university-robot-competition.svg",
      "/events/national-university-robot-competition-2.svg",
    ],
  },
  {
    slug: "maker-faire-seoul",
    year: "2024",
    image: "/events/maker-faire-seoul.svg",
    name: { en: "Maker Faire Seoul", ko: "메이커 페어 서울" },
    result: { en: "Booth exhibitor", ko: "부스 전시 참가" },
    place: { en: "Oil Tank Culture Park", ko: "문화비축기지" },
    detail: {
      en: "We ran a hands-on booth showing off member projects and let visitors try our gesture-controlled arm. A great weekend of sharing what we build with the public.",
      ko: "부원 프로젝트를 선보이는 체험 부스를 운영하고, 관람객이 제스처 인식 로봇팔을 직접 다뤄보게 했습니다. 우리가 만든 것을 대중과 나눈 즐거운 주말이었습니다.",
    },
    gallery: [
      "/events/maker-faire-seoul.svg",
      "/events/maker-faire-seoul-2.svg",
    ],
  },
  {
    slug: "embedded-sw-competition",
    year: "2023",
    image: "/events/embedded-sw-competition.svg",
    name: { en: "Embedded SW Competition", ko: "임베디드 SW 경진대회" },
    result: { en: "Bronze Award", ko: "동상 수상" },
    place: { en: "Online", ko: "온라인" },
    detail: {
      en: "Our embedded team took home a bronze award in this online competition with a low-power sensor node design that impressed the judges on efficiency.",
      ko: "임베디드 팀이 이 온라인 대회에서 효율성으로 심사위원을 사로잡은 저전력 센서 노드 설계로 동상을 받았습니다.",
    },
    gallery: ["/events/embedded-sw-competition.svg"],
  },
  {
    slug: "campus-hackathon",
    year: "2025",
    image: "/events/campus-hackathon.svg",
    name: { en: "Campus Hackathon", ko: "교내 해커톤" },
    result: { en: "Grand Prize · Popularity Award", ko: "대상 · 인기상" },
    place: { en: "Engineering Hall", ko: "공학관" },
    detail: {
      en: "A 24-hour build sprint where members split into teams and shipped working prototypes overnight. We swept both the grand prize and the popularity vote.",
      ko: "부원들이 팀을 나눠 하룻밤 사이 동작하는 시제품을 완성한 24시간 빌드 스프린트입니다. 대상과 인기상을 모두 휩쓸었습니다.",
    },
    gallery: [
      "/events/campus-hackathon.svg",
      "/events/campus-hackathon-2.svg",
    ],
  },
];

// ------------------------------------------------------------
//  Schedule — upcoming activities
//  date is shared; title/tag translated.
// ------------------------------------------------------------
export const schedule = [
  { date: "03.14", title: { en: "New Member Orientation", ko: "신입 부원 오리엔테이션" }, tag: { en: "Recruiting", ko: "모집" } },
  { date: "03.28", title: { en: "Arduino Basics Workshop", ko: "아두이노 기초 워크숍" }, tag: { en: "Seminar", ko: "세미나" } },
  { date: "04.12", title: { en: "Project Team Building Day", ko: "프로젝트 팀 빌딩 데이" }, tag: { en: "Project", ko: "프로젝트" } },
  { date: "05.09", title: { en: "Midterm Showcase & Demo", ko: "중간 발표 & 시연회" }, tag: { en: "Showcase", ko: "발표" } },
  { date: "06.20", title: { en: "Summer Competition Bootcamp", ko: "여름 대회 준비 부트캠프" }, tag: { en: "Competition", ko: "대회" } },
];

// ------------------------------------------------------------
//  Contact & support (email/location/socials shared; location translated)
// ------------------------------------------------------------
export const contact = {
  email: "mero.club@example.com",
  location: {
    en: "Club Room 302, 3rd Floor, Engineering Hall",
    ko: "공학관 3층 302호 동아리방",
  },
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "GitHub", href: "https://github.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
};

// ------------------------------------------------------------
//  Honor & Sponsors — companies/organizations that support the club
//  Shown on the Contact page. To add a sponsor, add a line below.
//  - name:  company/organization name (shown as the logo alt text)
//  - logo:  path to a logo in /public/sponsors (replace with a real logo)
//  - href:  (optional) the sponsor's website; leave "" for no link
// ------------------------------------------------------------
export const sponsors = [
  { name: "Robotis", logo: "/sponsors/robotis.svg", href: "https://example.com" },
  { name: "NVIDIA", logo: "/sponsors/nvidia.svg", href: "https://example.com" },
  { name: "Samsung Electronics", logo: "/sponsors/samsung.svg", href: "https://example.com" },
  { name: "LG Innotek", logo: "/sponsors/lg-innotek.svg", href: "https://example.com" },
  { name: "Naver", logo: "/sponsors/naver.svg", href: "https://example.com" },
  { name: "University Foundation", logo: "/sponsors/university-foundation.svg", href: "" },
];
