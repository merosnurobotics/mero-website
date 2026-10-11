export type RobotDemo = {
  id: string;
  title: string;
  publisher: string;
  year: number;
  kind: string;
  description: string;
  sourceUrl: string;
  watchUrl: string;
  youtubeId?: string;
  videoUrl?: string;
};

// Original publisher streams only. No copied videos, thumbnails, or inferred video IDs.
export const robotDemosReviewedAt = "2026-10-11";
export const robotDemos: RobotDemo[] = [
  {
    id: "moveit-servo", title: "MoveIt Servo: ROS 2에서 로봇 팔을 연속 제어하기", publisher: "Nuclear & Applied Robotics Group · MoveIt 공식 소개", year: 2020,
    kind: "실물 로봇 · 실시간 명령 데모", youtubeId: "MF-_XKpGefY", watchUrl: "https://www.youtube.com/watch?v=MF-_XKpGefY",
    sourceUrl: "https://moveit.ai/moveit/ros2/servo/jog/2020/09/09/moveit2-servo.html",
    description: "ROS 2의 MoveIt Servo로 로봇 팔을 움직이는 공식 소개 영상입니다. 완성된 경로를 한 번 보내는 방식과 연속된 운동 명령을 보내는 방식을 비교할 수 있습니다. 설치법은 현재 문서를 따르세요.",
  },
  {
    id: "orb-slam3", title: "ORB-SLAM3: 실제 카메라·관성 데이터로 궤적과 지도 추정", publisher: "UZ-SLAMLab · ORB-SLAM3", year: 2020,
    kind: "실제 센서 데이터 · SLAM 시각화", youtubeId: "HyLNq-98LRo", watchUrl: "https://www.youtube.com/watch?v=HyLNq-98LRo",
    sourceUrl: "https://github.com/UZ-SLAMLab/ORB_SLAM3",
    description: "TUM-VI의 실제 스테레오 카메라·관성 센서 기록으로 지도와 이동 궤적을 추정하는 공식 영상입니다. 로봇의 자율 주행 성공 장면과 구분해, 위치 추정기 내부에서 어떤 결과가 만들어지는지 보는 자료입니다.",
  },
  {
    id: "splatam", title: "SplaTAM: RGB-D 관측으로 Gaussian 지도 만들기", publisher: "AirLab · SplaTAM 연구팀", year: 2024,
    kind: "실제 센서 및 데이터셋 · 3D 지도 재구성", youtubeId: "jWLI-OFp3qU", watchUrl: "https://www.youtube.com/watch?v=jWLI-OFp3qU",
    sourceUrl: "https://spla-tam.github.io/",
    description: "카메라 위치를 추정하면서 3D Gaussian으로 장면을 쌓아 가는 연구 설명 영상입니다. 여러 평가 장면을 포함하므로 실물 카메라 입력과 재구성된 가상 시점을 구분해 보세요.",
  },
  {
    id: "conceptgraphs", title: "ConceptGraphs: 물체의 의미와 위치를 실제 주행에 연결", publisher: "Alihusein Kuwajerwala 외 · ConceptGraphs 연구팀", year: 2024,
    kind: "실물 로봇 · 의미 지도와 계획", youtubeId: "ie9VdL7wieY", watchUrl: "https://www.youtube.com/watch?v=ie9VdL7wieY",
    sourceUrl: "https://concept-graphs.github.io/",
    description: "물체의 종류·위치·관계를 지도에 담아 로봇 계획에 사용하는 연구입니다. Jackal이 장면 속 물체에 따라 이동 경로를 정하는 예시에서 인식 결과가 행동에 어떻게 쓰이는지 볼 수 있습니다.",
  },
  {
    id: "umv-training", title: "UMV는 어떻게 균형과 점프를 배울까?", publisher: "RAI Institute", year: 2025,
    kind: "실물 로봇 · 학습 과정 설명", youtubeId: "cjaZUFMZWOY", watchUrl: "https://www.youtube.com/watch?v=cjaZUFMZWOY",
    sourceUrl: "https://rai-inst.com/resources/videos/balance-and-brains-building-an-ultra-mobile-vehicle/",
    description: "RAI 연구진이 두 바퀴 로봇 UMV의 개발과 학습 과정을 설명합니다. 완성된 동작과 함께 시뮬레이션에서 연습한 행동을 실제 기계에 옮기는 과정을 살펴볼 수 있습니다.",
  },
  {
    id: "umv-acrobatics", title: "Bicycle Acrobatics: 여러 곡예 기술을 이어 수행하기", publisher: "Shamel Fahmi · RAI 연구팀", year: 2026,
    kind: "실물 로봇 · 연구 데모", youtubeId: "DMgspxwq2Gw", watchUrl: "https://www.youtube.com/watch?v=DMgspxwq2Gw",
    sourceUrl: "https://shamelfahmi.com/bicycle_acrobatics/",
    description: "RAI 연구팀의 후속 연구로, 두 바퀴 로봇의 점프·회전·일어나기 같은 기술을 연결합니다. 하나의 동작을 잘하는 문제에서 여러 기술을 순서 있게 사용하는 문제로 시야를 넓혀 줍니다.",
  },
  {
    id: "rai-baseball", title: "공을 던지고 받고 치는 동적 로봇", publisher: "RAI Institute", year: 2025,
    kind: "실물 로봇 · 동적 조작", youtubeId: "eIa9fKkxXAo", watchUrl: "https://www.youtube.com/watch?v=eIa9fKkxXAo",
    sourceUrl: "https://rai-inst.com/resources/videos/dynamic-robot-that-can-throw-catch-and-hit-a-baseball/",
    description: "빠른 팔 동작과 공의 접촉을 다루는 RAI 로봇입니다. 제작팀의 저임피던스 설계 설명과 함께 보면, 위치를 정확히 맞추는 것 외에 힘과 접촉 시점이 왜 중요한지 이해할 수 있습니다.",
  },
  {
    id: "daydreamer", title: "DayDreamer: 실제 로봇의 경험으로 걷기 배우기", publisher: "Danijar Hafner · DayDreamer 연구팀", year: 2022,
    kind: "실물 로봇 · 학습 과정", youtubeId: "xAXvfVTgqr0", watchUrl: "https://www.youtube.com/watch?v=xAXvfVTgqr0",
    sourceUrl: "https://danijar.com/project/daydreamer/",
    description: "실제 로봇의 경험으로 월드 모델을 배우고, 그 모델 안에서 행동의 결과를 연습하는 연구입니다. 물리 시뮬레이터를 먼저 만들어 학습하는 UMV 사례와 학습 데이터가 생기는 위치를 비교해 보세요.",
  },
  {
    id: "aloha-act", title: "ALOHA와 ACT: 양팔로 배터리 끼우기", publisher: "Tony Z. Zhao 외 · Stanford ALOHA 연구팀", year: 2023,
    kind: "실물 로봇 · 학습한 정책의 자율 실행",
    videoUrl: "https://tonyzhaozh.github.io/aloha/resources/slot_battery.mp4", watchUrl: "https://tonyzhaozh.github.io/aloha/resources/slot_battery.mp4",
    sourceUrl: "https://tonyzhaozh.github.io/aloha/",
    description: "사람의 양팔 시범으로 학습한 ACT 정책이 배터리를 끼우는 공식 실행 영상입니다. 손의 위치만 아니라 두 팔의 역할 분담과 연속된 행동 묶음을 관찰하기 좋습니다.",
  },
  {
    id: "aloha-teleop", title: "Mobile ALOHA: 사람이 조작하며 요리 시범 기록하기", publisher: "Stanford IRIS Lab", year: 2024,
    kind: "실물 로봇 · 사람의 원격 조작", youtubeId: "mnLVbwxSdNM", watchUrl: "https://www.youtube.com/watch?v=mnLVbwxSdNM",
    sourceUrl: "https://mobile-aloha.github.io/",
    description: "사람이 이동형 양팔 로봇을 원격 조작해 요리하는 영상입니다. 이 장면은 자율 정책의 성공률을 보여주는 평가가 아니라, 로봇이 배울 시범을 사람이 어떻게 만들어 주는지 보여줍니다.",
  },
  {
    id: "aloha-failures", title: "Mobile ALOHA의 실패 장면 살펴보기", publisher: "Zipeng Fu · Mobile ALOHA 연구팀", year: 2024,
    kind: "실물 로봇 · 실패 사례 모음", youtubeId: "xGNNW6smDPQ", watchUrl: "https://www.youtube.com/watch?v=xGNNW6smDPQ",
    sourceUrl: "https://mobile-aloha.github.io/",
    description: "연구팀이 공개한 실패 모음입니다. 재미있는 장면에서 한 걸음 더 나아가 실패가 인식·접촉·동작 연결 중 어디서 시작되는지 관찰해 보세요. 편집된 영상만으로 전체 성공률을 계산할 수는 없습니다.",
  },
  {
    id: "diffusion-policy", title: "Diffusion Policy: 머그컵 방향 바꾸기", publisher: "Cheng Chi 외 · Diffusion Policy 연구팀", year: 2023,
    kind: "실물 로봇 · 시각 기반 자율 조작",
    videoUrl: "https://diffusion-policy.cs.columbia.edu/videos/highlight_mug.mp4", watchUrl: "https://diffusion-policy.cs.columbia.edu/videos/highlight_mug.mp4",
    sourceUrl: "https://diffusion-policy.cs.columbia.edu/",
    description: "카메라 관측을 바탕으로 앞으로의 행동 묶음을 생성해 머그컵을 다루는 데모입니다. 여러 미래 행동을 계획하더라도 새 관측을 받으며 다시 계획하는 과정에 주목해 보세요.",
  },
  {
    id: "openvla", title: "OpenVLA: 영상과 언어 지시에서 로봇 행동으로", publisher: "OpenVLA 연구팀", year: 2024,
    kind: "실물 로봇 · VLA 연구 데모",
    videoUrl: "https://openvla.github.io/static/videos/openvla_teaser_video.mp4", watchUrl: "https://openvla.github.io/static/videos/openvla_teaser_video.mp4",
    sourceUrl: "https://openvla.github.io/",
    description: "언어 지시와 카메라 영상을 입력받는 OpenVLA의 로봇 작업 모음입니다. 연구팀은 사전학습한 시각·언어 표현을 로봇 행동 학습에 연결하고 새로운 로봇에 맞추는 방법을 공개했습니다.",
  },
  {
    id: "gemini-whole-body", title: "Gemini Robotics 2: 이동과 양팔 동작 함께 다루기", publisher: "Google DeepMind", year: 2026,
    kind: "실물 로봇 · 전신 동작 연구 데모", youtubeId: "9MNLEAzA59o", watchUrl: "https://www.youtube.com/watch?v=9MNLEAzA59o",
    sourceUrl: "https://deepmind.google/blog/gemini-robotics-2-brings-whole-body-intelligence-to-robots/",
    description: "이동과 팔 동작을 함께 사용해 작업하는 연구 데모입니다. 상위 작업 지시가 몸 전체의 동작으로 이어지는 장면을 보며, 경로·도달 가능 범위·손의 작업을 동시에 고려해야 하는 이유를 생각해 보세요.",
  },
  {
    id: "gemini-collaboration", title: "Gemini Robotics 2: 여러 로봇이 작업 나누기", publisher: "Google DeepMind", year: 2026,
    kind: "실물 로봇 · 다중 로봇 연구 데모", youtubeId: "CiTPDm7PKW0", watchUrl: "https://www.youtube.com/watch?v=CiTPDm7PKW0",
    sourceUrl: "https://deepmind.google/blog/gemini-robotics-2-brings-whole-body-intelligence-to-robots/",
    description: "여러 로봇이 역할을 나눠 작업하는 공식 영상입니다. 언어로 표현한 목표를 하위 행동으로 나누고 다른 로봇의 진행 상황과 연결하는 문제를 관찰할 수 있습니다.",
  },
  {
    id: "simpler", title: "SIMPLER: 실제 로봇과 시뮬레이션의 평가 비교", publisher: "Kyle Hsu 외 · SIMPLER 연구팀", year: 2024,
    kind: "실물과 시뮬레이션 비교", youtubeId: "SIcPxapIgBI", watchUrl: "https://www.youtube.com/watch?v=SIcPxapIgBI",
    sourceUrl: "https://simpler-env.github.io/",
    description: "실제 로봇의 작업 환경을 시뮬레이션에 대응시켜 정책을 비교하는 연구입니다. 겉모습뿐 아니라 같은 명령에 대한 로봇의 반응도 맞춰야 평가 결과를 해석할 수 있음을 보여줍니다.",
  },
  {
    id: "nav2-turtlebot", title: "TurtleBot3의 ROS 2 Navigation2 주행", publisher: "Navigation2 프로젝트", year: 2019,
    kind: "실물 로봇 · 자율 주행", youtubeId: "ZeCds7Sv-5Q", watchUrl: "https://www.youtube.com/watch?v=ZeCds7Sv-5Q",
    sourceUrl: "https://github.com/ros-navigation/docs.nav2.org/blob/rolling/docs/tutorials/general_tutorials/navigation2_on_real_turtlebot3/navigation2_on_real_turtlebot3.md",
    description: "Nav2 공식 실물 로봇 튜토리얼에 연결된 TurtleBot3 주행 데모입니다. 초기 ROS 2 시기의 영상이므로 설치 화면보다는 지도·위치 추정·목표·이동이 연결되는 구조를 관찰하는 용도로 봅니다.",
  },
];

export type LessonDemoConnection = { path: string; demoId: string; focus: string[] };
// Link only a method taught here or a process directly demonstrated in the video.
// Do not infer invisible internals from robot motion or require a demo for every topic.
export const lessonDemoConnections: LessonDemoConnection[] = [];

function connect(topic: string, slug: string, demoId: string, ...focus: string[]) {
  lessonDemoConnections.push({ path: `/education/${topic}/${slug}`, demoId, focus });
}

connect("control", "trajectories-and-timing", "rai-baseball", "공에 닿는 위치뿐 아니라 그 순간의 속도와 시점이 결과를 바꾸는 장면을 찾아보세요.");
connect("control", "contact-and-impedance", "rai-baseball", "공을 받는 순간의 충격을 다룰 때, 팔을 단단하게 고정하는 전략과 접촉에 반응하는 전략을 비교해 보세요.");
connect("control", "whole-body-and-learned-control", "gemini-whole-body", "물체를 집기 위해 걷고 몸을 낮추고 팔을 뻗는 장면에서, 이동과 조작을 하나의 작업으로 조합하는 모습을 보세요.");
connect("ros", "basics", "nav2-turtlebot", "화면의 지도와 실제 로봇의 이동이 이어지려면 센서·위치 추정·계획·구동 노드 사이에 어떤 정보가 오가야 할지 짚어 보세요.");
connect("ros", "bag-rviz", "nav2-turtlebot", "RViz에 표시되는 지도·로봇 위치·계획 경로를 실제 TurtleBot3의 주행 장면과 대응시켜 보세요.");
connect("ros", "frames-and-time", "moveit-servo", "같은 방향의 이동 명령도 도구 기준인지 로봇 기반 기준인지에 따라 달라질 수 있습니다. 제작팀 설명의 명령 좌표 선택과 연결해 보세요.");
connect("deepml", "data-and-models", "aloha-teleop", "사람의 시범에서 모델 입력이 될 카메라 영상과 학습 목표가 될 로봇 행동을 구분해 보세요.");
connect("deepml", "evaluation", "aloha-failures", "성공과 실패를 어떻게 정의할지 정해 보세요. 실패 장면 모음과 전체 시도에서 계산한 성공률이 왜 다른지 설명해 보세요.");
connect("deepml", "diffusion-and-flow-matching", "diffusion-policy", "이 영상은 diffusion 방식의 행동 생성 예시입니다. 이미지 생성 대신 연속된 로봇 행동을 생성한다는 관점으로 보세요.");
connect("localization", "relocalization", "conceptgraphs", "물체의 의미와 위치를 단서로 이미 만든 지도 안에서 현재 위치 후보를 좁히는 과정을 찾아보세요.");
connect("localization", "loop-closure", "orb-slam3", "다시 본 장소나 서로 겹치는 지도를 연결할 때 궤적과 지도가 함께 조정되는 장면을 살펴보세요.");
connect("localization", "visual-inertial-odometry", "orb-slam3", "이 영상의 입력이 스테레오 영상과 관성 데이터라는 점을 확인하고, 움직임을 이어 추정하는 일과 지도를 다시 맞추는 일을 나눠 보세요.");
connect("localization", "object-localization", "conceptgraphs", "사진에서 찾은 물체가 3D 지도의 어느 위치에 대응하는지, 그 결과가 이동 계획에 어떻게 쓰이는지 따라가 보세요.");
connect("localization", "semantic-and-gaussian-maps", "splatam", "새로 관측한 영역에 Gaussian이 추가되는 과정과 카메라 위치를 추정하는 과정을 구분해 보세요.");
connect("localization", "semantic-and-gaussian-maps", "conceptgraphs", "시각적으로 자세한 지도와 물체의 의미·관계를 담은 지도가 로봇의 서로 다른 질문에 어떻게 답하는지 비교해 보세요.");
connect("reinforcement-learning", "reinforcement-learning", "umv-training", "제작팀이 설명하는 시뮬레이션 학습과 실물 실행을 구분하고, 연습 전후 균형·점프 동작이 어떻게 달라지는지 보세요.");
connect("reinforcement-learning", "exploration-and-practice", "daydreamer", "처음 움직임과 학습 뒤 움직임을 비교해 보세요. 로봇이 시도하면서 얻는 데이터가 다음 시도를 어떻게 바꾸는지 생각해 보세요.");
connect("reinforcement-learning", "policy-and-robot", "umv-training", "학습된 정책의 출력과 실제 모터가 실행하는 명령 사이에 로봇 시스템이 있다는 점을 떠올려 보세요.");
connect("reinforcement-learning", "world-models", "daydreamer", "실제 경험으로 배운 예측 모델 안에서 연습하는 과정과 미리 만든 물리 시뮬레이터에서 연습하는 과정을 비교해 보세요.");
connect("reinforcement-learning", "sim2real-evaluation", "umv-training", "모터·바퀴·접촉을 실제와 맞추는 일과 다양한 조건에서 견디도록 연습시키는 일의 역할을 구분해 보세요.");
connect("simulation", "physics-and-appearance", "simpler", "실물과 시뮬레이션을 비교하며 화면의 닮음과 운동 반응의 닮음을 따로 평가해 보세요.");
connect("simulation", "sensors-and-observations", "simpler", "카메라 시점과 물체 배경이 달라지면 같은 로봇 상태도 정책에 다른 관측으로 전달된다는 점을 찾아보세요.");
connect("simulation", "locomotion-and-support", "umv-acrobatics", "접촉점이 바뀌는 순간과 공중 동작, 착지를 구분해 보세요. 정지해 있을 때의 지지 영역만으로 전체 운동을 설명하기 어려운 이유를 생각해 보세요.");
connect("simulation", "system-identification", "umv-training", "실제 바퀴·모터의 반응을 시뮬레이션에 맞추는 작업이 실물 전이에 어떤 도움을 주는지 찾아보세요.");
connect("robot-vision", "detection-segmentation", "conceptgraphs", "한 물체에 해당하는 영상 영역이 여러 시점에서 연결되어 3D 물체로 모이는 과정을 찾아보세요.");
connect("robot-vision", "depth-and-frames", "conceptgraphs", "카메라 영상의 물체 영역이 깊이와 카메라 자세를 거쳐 공통 지도 좌표에 모이는 과정을 따라가 보세요.");
connect("robot-vision", "data-and-evaluation", "aloha-failures", "집기 시작·이동·놓기 중 실패가 시작된 지점을 구분하고, 실패를 재현할 평가 조건을 적어 보세요.");
connect("robot-vision", "learning-from-demonstrations", "aloha-teleop", "이 영상은 사람이 조작하는 시범입니다. 자율 실행 영상과 구분하며 학습 데이터에 기록할 관측과 행동을 찾아보세요.");
connect("robot-vision", "action-chunks-and-diffusion", "aloha-act", "미세한 행동 하나씩보다 앞으로 이어질 행동 묶음을 예측하는 것이 양팔 협응에 어떤 도움을 주는지 보세요.");
connect("robot-vision", "action-chunks-and-diffusion", "diffusion-policy", "행동 묶음을 생성하면서도 다음 관측으로 계획을 갱신해야 하는 이유를 접촉 장면과 연결해 보세요.");
connect("robot-vision", "openvla-and-action-models", "openvla", "같은 장면에서 언어 지시가 달라지면 선택해야 할 물체와 행동이 어떻게 달라지는지 관찰해 보세요.");
connect("robot-vision", "embodied-planning", "gemini-collaboration", "긴 작업을 하위 목표로 나누는 부분과 실제 손과 몸 전체를 움직이는 부분을 구분해 보세요.");
connect("vla", "foundations", "openvla", "시각·언어·행동이 각각 입력과 출력의 어느 부분에 해당하는지 찾아보세요.");

export function demosForLesson(path: string) {
  return lessonDemoConnections.filter(connection => connection.path === path).map(connection => {
    const demo = robotDemos.find(item => item.id === connection.demoId);
    if (!demo) throw new Error(`Unknown robot demo: ${connection.demoId}`);
    return { demo, focus: connection.focus };
  });
}
