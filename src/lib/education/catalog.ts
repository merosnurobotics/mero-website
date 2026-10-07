export type EducationAuthor = { name: string; email: string };
const yeonwooCho: EducationAuthor = { name: "조연우", email: "yencho929@snu.ac.kr" };

export const reinforcementLearningPath = "/education/reinforcement-learning";
export const kimodoLessonPath = `${reinforcementLearningPath}/kimodo-mjwarp`;
export const lessonChapters = [
  { id: "terms", label: "용어와 전체 흐름" },
  { id: "kimodo", label: "Kimodo와 모션 생성" },
  { id: "query", label: "실제 입력과 코드" },
  { id: "retarget", label: "Microban 리타기팅" },
  { id: "learning", label: "PPO 학습" },
  { id: "validation", label: "정책 검증" },
];

export const objectRecognitionPath = "/education/object-recognition";
export const perceptionLessonPath = `${objectRecognitionPath}/synthetic-data`;
export const perceptionChapters = [
  { id: "first-look", label: "객체인식이 하는 일" },
  { id: "labels", label: "사진과 정답지" },
  { id: "synthetic", label: "합성 데이터와 랜덤화" },
  { id: "pipeline", label: "형태와 과일을 나눠 보기" },
  { id: "setup", label: "실습 환경 준비" },
  { id: "render", label: "120장 생성하고 확인하기" },
  { id: "split", label: "데이터 분리와 내보내기" },
  { id: "train", label: "첫 모델 학습하기" },
  { id: "evaluate", label: "평가와 실제 사진 추론" },
  { id: "improve", label: "실습 확장하기" },
];
export const localizationPath = "/education/localization";
export const lidarLessonPath = `${localizationPath}/lidar`;
export const ros2TopicsLessonPath = `${localizationPath}/ros2-topics`;
export const objectLocalizationLessonPath = `${localizationPath}/object-localization`;
export const ros2TopicsChapters = [
  { id: "nodes", label: "Node와 topic으로 나누기" },
  { id: "messages", label: "위치 메시지의 약속" },
  { id: "environment", label: "ROS 2 환경 준비" },
  { id: "run", label: "세 터미널로 확인하기" },
  { id: "real-scan", label: "실제 LiDAR 입력으로 바꾸기" },
  { id: "checks", label: "QoS·시각·좌표 확인" },
];
export const objectLocalizationChapters = [
  { id: "task", label: "로봇 위치와 객체 위치" },
  { id: "mask-depth", label: "Mask와 depth를 같은 픽셀에" },
  { id: "projection", label: "픽셀에서 카메라 좌표로" },
  { id: "transform", label: "로봇 좌표에서 지도 좌표로" },
  { id: "practice", label: "경량 코드로 object map 만들기" },
  { id: "real-data", label: "실제 입력을 연결하는 순서" },
];
export const controlTheoryPath = "/education/control-theory";
export const pidLessonPath = `${controlTheoryPath}/pid-control`;
export const developmentSetupPath = "/education/development-setup";
export const remoteWorkLessonPath = `${developmentSetupPath}/remote-work`;
export const lidarChapters = [
  { id: "sensor", label: "LiDAR는 무엇을 측정할까" },
  { id: "coordinates", label: "거리에서 좌표로" },
  { id: "matching", label: "알려진 벽과 비교하기" },
  { id: "practice", label: "경량 코드로 위치 찾기" },
  { id: "robot", label: "실제 센서에 연결하기" },
  { id: "discussion", label: "심화 discussion: 방향 정보" },
];
export const pidChapters = [
  { id: "feedback", label: "목표·측정·오차" },
  { id: "terms", label: "P, I, D를 그림으로 보기" },
  { id: "digital", label: "컴퓨터에서 계산하기" },
  { id: "applications", label: "PID 활용 예시" },
  { id: "tuning", label: "적용과 튜닝의 관점" },
];
export const remoteWorkChapters = [
  { id: "roles", label: "로컬 컴퓨터와 Jetson" },
  { id: "server", label: "Jetson의 SSH 서버 준비" },
  { id: "tailscale", label: "Tailscale 설치와 로그인" },
  { id: "keys", label: "SSH 키 생성과 등록" },
  { id: "alias", label: "ssh jetson 별칭 만들기" },
  { id: "workflow", label: "코드·파일·장시간 작업" },
  { id: "gui", label: "GUI가 필요하면 RustDesk" },
  { id: "troubleshooting", label: "연결 문제를 나눠 확인하기" },
];
export const educationTopics = [
  {
    title: "강화학습", path: reinforcementLearningPath,
    description: "시뮬레이션 안에서 행동을 시도하고, 보상을 통해 로봇의 제어 정책을 배우는 과정을 살펴봅니다.",
    lessons: [{ author: yeonwooCho, path: kimodoLessonPath, shortTitle: "모방 강화학습", label: "Kimodo + MuJoCo Warp", title: "NVIDIA Kimodo + MuJoCo Warp로 모방 강화학습 만들기", description: "한 발 서기를 사례로, 문장으로 생성한 모션을 Microban의 자세로 옮기고 PPO로 균형 잡는 정책을 학습합니다. 실제 입력, 코드, 검증 영상과 함께 따라가세요.", chapters: lessonChapters }],
  },
  {
    title: "객체인식", path: objectRecognitionPath,
    description: "사진 속 물체가 무엇이고 어디에 있는지 알아내는 방법을 배웁니다. 처음 공부하는 사람도 사진과 정답지부터 시작할 수 있습니다.",
    lessons: [{ author: yeonwooCho, path: perceptionLessonPath, shortTitle: "합성 데이터로 시작하기", label: "사진에서 형태와 과일 찾기", title: "합성 데이터로 시작하는 객체인식", description: "정다면체의 형태와 과일 그림을 알아내는 두 단계 모델을 살펴봅니다. Blender로 학습 사진과 정답지를 함께 만들고, YOLO 모델을 학습한 뒤 실제 사진에서 확인합니다.", chapters: perceptionChapters }],
  },
  {
    title: "Localization", path: localizationPath,
    description: "센서로 측정한 주변 모습과 지도를 비교해 로봇의 위치를 알아냅니다.",
    lessons: [{ author: yeonwooCho, path: lidarLessonPath, shortTitle: "LiDAR 사용", label: "알려진 벽으로 위치 찾기", title: "LiDAR로 시작하는 localization", description: "거리와 각도부터 이해하고, 알려진 사각형 벽과 측정 거리를 비교하는 방식을 경량 Python 코드로 실습합니다.", chapters: lidarChapters },
      { author: yeonwooCho, path: ros2TopicsLessonPath, shortTitle: "ROS 2 토픽으로 내보내기", label: "위치 계산을 node로 연결하기", title: "Localization 결과를 ROS 2 토픽으로 내보내기", description: "LiDAR 입력을 구독하고 추정 위치를 PoseStamped로 발행합니다. 세 터미널에서 메시지·좌표·시각을 확인합니다.", chapters: ros2TopicsChapters },
      { author: yeonwooCho, path: objectLocalizationLessonPath, shortTitle: "객체 localization", label: "Segmentation + depth → object map", title: "Segmentation과 depth로 객체 localization 하기", description: "객체의 mask와 depth로 카메라 기준 관측점을 구하고, 촬영 당시 로봇 위치를 이용해 지도 좌표로 옮깁니다.", chapters: objectLocalizationChapters },
    ],
  },
  {
    title: "Control theory", path: controlTheoryPath,
    description: "목표와 측정값의 차이를 줄여 로봇이 원하는 움직임을 만들도록 합니다.",
    lessons: [{ author: yeonwooCho, path: pidLessonPath, shortTitle: "PID control", label: "Encoder motor와 line tracking", title: "그림으로 이해하는 PID control", description: "P·I·D의 역할을 그림으로 이해하고, encoder motor와 line tracking에 어떻게 적용할 수 있는지 살펴봅니다.", chapters: pidChapters }],
  },
  {
    title: "개발 환경 셋업", path: developmentSetupPath,
    description: "내 컴퓨터에서 로봇의 컴퓨터에 접속하고, 코드를 옮기고 실행하는 환경을 준비합니다.",
    lessons: [{ author: yeonwooCho, path: remoteWorkLessonPath, shortTitle: "원격 작업하기", label: "SSH · Tailscale · RustDesk", title: "원격 작업하기: ssh jetson부터 GUI까지", description: "SSH 키 생성, Tailscale 로그인, 접속 별칭 설정을 따라 하고 GUI 작업에는 RustDesk를 사용합니다.", chapters: remoteWorkChapters }],
  },
];
