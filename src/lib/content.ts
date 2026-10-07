import type { Project, Robot } from "./types";

export const club = {
  name: "MERO", university: "서울대학교", location: "서울대학교 301동",
  semester: "2026-2", youtube: "https://www.youtube.com/watch?v=bwild_6jS2U",
  article: "https://www.irobotnews.com/news/articleView.html?idxno=47888",
};

export const projects: Project[] = [
  {
    id: "qdd-quadruped", title: "QDD 사족보행 로봇", english: "QDD Quadruped", category: "Locomotion",
    summary: "네 발로 세상을 탐험하는 로봇.",
    description: "Mini Cheetah형 구조와 QDD 구동기를 바탕으로 사족보행 로봇을 직접 만듭니다. 기구 설계와 조립에서 출발해, Jetson Orin Nano를 활용한 인지와 지형에 맞는 보행 제어를 연구합니다.",
    semester: "2026-2", image: "/images/robot-sketches.webp", imageType: "concept",
    imageCredit: "Mini Cheetah 실물 기반 프로젝트 스케치", imageSource: "https://news.mit.edu/2019/mit-mini-cheetah-first-four-legged-robot-to-backflip-0304",
    referenceImage: "/images/minicheetah-reference.jpg", tags: ["QDD", "기구 설계", "보행 제어"],
    goals: [
      { title: "직접 만드는 구동계", text: "저감속 구동기의 특성을 살려 관절과 링크를 설계하고, 조립 가능한 로봇 플랫폼을 만듭니다." },
      { title: "지형을 보고 움직이기", text: "경사, 단차와 간격을 인지하고, 로봇이 실행할 수 있는 보행 전략을 선택하는 것을 목표로 합니다." },
      { title: "Microban과의 협업", text: "TRI-RESPONSE 자체대회에서 작은 휴머노이드를 운반하고 임무를 넘겨주는 시나리오를 준비합니다." },
    ],
    milestones: [
      { title: "설계와 제작", text: "구동기, 링크, 전장과 컴퓨팅 구성 검토" },
      { title: "보행과 인지", text: "기본 보행 검증, 지형 관측과 동적 제어 실험" },
      { title: "프로젝트 연계", text: "Microban 운반과 임무 인계 구조 검토" },
    ], links: [{ title: "MIT Mini Cheetah 원형 플랫폼", url: "https://news.mit.edu/2019/mit-mini-cheetah-first-four-legged-robot-to-backflip-0304" }],
  },
  {
    id: "mini-humanoid", title: "Microban 미니 휴머노이드", english: "Mini Humanoid", category: "Humanoid",
    summary: "작은 로봇으로 시작하는 전신 제어.",
    description: "Rhoban의 오픈소스 Microban을 기반으로 약 30cm 크기의 19관절 휴머노이드를 제작합니다. 3D 프린팅과 조립을 익히고, MuJoCo·MJLab 및 Isaac Lab 환경에서 강화학습을 실험한 뒤 목적에 맞는 하드웨어 개량으로 연결합니다.",
    semester: "2026-2", image: "/images/robot-sketches.webp", imageType: "concept",
    imageCredit: "Microban 실물 기반 프로젝트 스케치", imageSource: "https://github.com/Rhoban/microban", referenceImage: "/images/microban.png",
    tags: ["3D 프린팅", "강화학습", "전신 제어"],
    goals: [
      { title: "복제하며 배우기", text: "공개된 설계와 부품 구성을 이해하고, 출력·조립·전장 연결을 통해 실제 플랫폼을 만듭니다." },
      { title: "시뮬레이션에서 실험하기", text: "보행, 자세 전환과 장애물 통과를 연구합니다. 보상 설계와 도메인 랜덤화가 행동에 미치는 영향을 비교합니다." },
      { title: "목적에 맞게 바꾸기", text: "시뮬레이션과 실물의 차이를 확인하면서 발 형상, 접촉과 구조를 개선하고 QDD 연계 임무를 준비합니다." },
    ],
    milestones: [
      { title: "원형 제작", text: "Microban 구조 이해, 부품 출력과 조립" },
      { title: "학습과 비교", text: "보행·장애물 과제의 정책 학습 및 재현성 확인" },
      { title: "실물 개량", text: "목적에 맞는 부품 설계와 실물 검증" },
    ],
    links: [
      { title: "Microban 오픈소스 프로젝트", url: "https://github.com/Rhoban/microban" },
      { title: "원형 플랫폼 시연 영상", url: "https://www.youtube.com/watch?v=1pnFrT_jfXQ" },
      { title: "MJLab Microban 학습 환경", url: "https://github.com/Rhoban/mjlab_microban" },
    ],
  },
  {
    id: "vla-manipulation", title: "RBY1 VLA Manipulation", english: "VLA Manipulation", category: "Manipulation",
    summary: "보고, 이해하고, 물체를 집는 로봇.",
    description: "Rainbow Robotics의 이동형 양팔 로봇 RBY1을 활용해 시각·언어·행동을 연결하는 VLA 기반 manipulation을 연구합니다. ICRA Robotic Grasping and Manipulation Competition의 Picking in Clutter 트랙 출전을 목표로, 복잡하게 놓인 물체를 인식하고 집는 작업을 준비합니다.",
    semester: "2026-2", image: "/images/robot-sketches.webp", imageType: "concept",
    imageCredit: "RBY1 실물 기반 프로젝트 스케치", imageSource: "https://rainbow-robotics.com/en/products/rb-y1/", referenceImage: "/images/rby1.png",
    tags: ["RBY1", "VLA", "ICRA RGMC"],
    goals: [
      { title: "RBY1 작업 환경 구축", text: "이동형 양팔 플랫폼의 제어 인터페이스와 관측 구성을 이해하고 데이터 수집 환경을 준비합니다." },
      { title: "시각·언어·행동 연결", text: "물체와 작업 지시를 이해하는 모델을 로봇 동작에 연결하고, manipulation 데이터로 실험합니다." },
      { title: "Picking in Clutter 준비", text: "여러 물체가 섞인 환경에서 목표 물체를 집는 작업을 중심으로 대회 출전을 준비합니다. 개최 연도와 세부 일정은 확정 후 안내합니다." },
    ],
    milestones: [
      { title: "플랫폼과 데이터", text: "RBY1 환경 구성, 관측과 작업 데이터 수집" },
      { title: "모델과 제어", text: "VLA 정책 실험, 물체 집기 동작 연동" },
      { title: "대회 준비", text: "Picking in Clutter 과제에 맞춘 반복 평가" },
    ],
    links: [
      { title: "Rainbow Robotics RBY1", url: "https://rainbow-robotics.com/en/products/rb-y1/" },
      { title: "RBY1 SDK와 공식 설명서", url: "https://rainbowrobotics.github.io/rby1-dev/" },
      { title: "ICRA RGMC 트랙 소개 (2026 자료)", url: "https://2026.ieee-icra.org/program/competitions/" },
    ],
  },
];

export const robotStatusLabels = { building: "개발 중", ready: "사용 가능", maintenance: "점검 중", archived: "보관 중" };
export const memberStatusLabels = { pending: "승인 대기", active: "활동 회원", suspended: "이용 중지" };

export const seedRobots: Robot[] = [
  {
    id: "qdd-01", name: "MERO QDD", platform: "QDD / Mini Cheetah형", project_id: "qdd-quadruped", status: "building",
    description: "QDD 기반 사족보행 로봇 프로젝트의 개발 플랫폼입니다. 기구 설계, 구동계와 보행 제어를 연결합니다.",
    creators: ["QDD 프로젝트 팀"], start_date: "2026-2", end_date: "", hostname: "", ssh_user: "", ssh_port: 22,
    workdir: "", launch_command: "", stop_command: "", network_note: "",
    guide: [ { title: "프로젝트별 운용 안내", body: "담당 팀이 접속 주소, 실행 명령과 실제 장비 기준의 운용 순서를 등록하면 이곳에서 확인할 수 있습니다." } ], updated_at: "",
  },
  {
    id: "microban-01", name: "MERO Microban", platform: "Microban / 19관절", project_id: "mini-humanoid", status: "building",
    description: "3D 프린팅으로 제작하고 강화학습을 실험하는 소형 휴머노이드 플랫폼입니다. 공개 원형 설계를 기반으로 제작과 개량을 진행합니다.",
    creators: ["미니 휴머노이드 프로젝트 팀"], start_date: "2026-2", end_date: "", hostname: "", ssh_user: "", ssh_port: 22,
    workdir: "", launch_command: "", stop_command: "", network_note: "",
    guide: [ { title: "제작과 학습 자료", body: "원형 조립·운용 자료는 Rhoban Microban 프로젝트에서 확인할 수 있습니다. MERO 장비의 실행 환경과 정책은 담당 팀의 검증 후 등록합니다." } ], updated_at: "",
  },
  {
    id: "rby1-01", name: "MERO RBY1", platform: "Rainbow Robotics RBY1", project_id: "vla-manipulation", status: "building",
    description: "VLA 기반 manipulation과 ICRA Picking in Clutter 대회 준비에 활용하는 이동형 양팔 로봇 플랫폼입니다.",
    creators: ["VLA Manipulation 프로젝트 팀"], start_date: "2026-2", end_date: "", hostname: "", ssh_user: "", ssh_port: 22,
    workdir: "", launch_command: "", stop_command: "", network_note: "",
    guide: [ { title: "RBY1 공식 자료", body: "Rainbow Robotics의 SDK·Web Manual을 참고하세요. 장비별 네트워크 구성과 MERO 작업 환경은 관리자가 등록합니다." } ], updated_at: "",
  },
];

export function getProject(id: string) { return projects.find(project => project.id === id); }
