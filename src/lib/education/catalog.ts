import { vlaPath, vlaTopic } from "./vla-catalog";
import { simulationPath, simulationTopic } from "./simulation-catalog";
import { deepMLPath, deepMLTopic, deepMLLessons } from "./deepml-catalog";
export type EducationAuthor = { name: string; email: string };
export type EducationLesson = { author?: EducationAuthor; path: string; number?: number; shortTitle: string; label: string; title: string; description: string; chapters: { id: string; label: string }[] };
export type EducationTopic = { title: string; path: string; description: string; lessons: EducationLesson[] };
const yeonwooCho: EducationAuthor = { name: "조연우", email: "yencho929@snu.ac.kr" };

export const reinforcementLearningPath = "/education/reinforcement-learning";
export const kimodoTopicPath = reinforcementLearningPath;
export const kimodoLessonPath = `${reinforcementLearningPath}/kimodo-mjwarp`;
export const lessonChapters = [
  { id: "terms", label: "용어와 전체 흐름" },
  { id: "kimodo", label: "Kimodo와 모션 생성" },
  { id: "query", label: "실제 입력과 코드" },
  { id: "retarget", label: "Microban 리타기팅" },
  { id: "learning", label: "PPO 학습" },
  {id:"observations",label:"관측 70차원"},{id:"action-contract",label:"행동과 스케일"},{id:"reward-terms",label:"보상과 성공 판정"},{id:"implementation-notes",label:"종료 처리의 한계"},{id:"balance-physics",label:"균형과 평가 조건"},{id:"control-comparison",label:"기본 제어기 대비 비교"},
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
export const ros2TopicsLessonPath = "/education/ros/localization-topics";
export const objectLocalizationLessonPath = `${localizationPath}/object-localization`;
export const ros2TopicsChapters = [
  { id: "nodes", label: "노드와 토픽으로 나누기" },
  { id: "messages", label: "위치 메시지의 약속" },
  { id: "environment", label: "ROS 2 환경 준비" },
  { id: "run", label: "세 터미널로 확인하기" },
  { id: "real-scan", label: "실제 LiDAR 입력으로 바꾸기" },
  { id: "checks", label: "QoS·시각·좌표 확인" },
];
export const objectLocalizationChapters = [
  { id: "task", label: "로봇 위치와 객체 위치" },
  { id: "mask-depth", label: "마스크와 깊이를 같은 픽셀에" },
  { id: "projection", label: "픽셀에서 카메라 좌표로" },
  { id: "transform", label: "로봇 좌표에서 지도 좌표로" },
  { id: "practice", label: "경량 코드로 object map 만들기" },
  { id: "real-data", label: "실제 입력을 연결하는 순서" },
];
export const controlPath = "/education/control";
export const pidLessonPath = `${controlPath}/pid-control`;
export const rosArduinoMotorLessonPath = "/education/ros/arduino-motor";
export const rosArduinoMotorChapters = [
  { id: "pipeline", label: "Jetson부터 모터까지" },
  { id: "cmd-vel", label: "cmd_vel과 시리얼 통신 명령" },
  { id: "firmware", label: "Arduino의 엔코더 속도 제어" },
  { id: "wiring", label: "모터 드라이버와 엔코더 연결" },
  { id: "dry-run", label: "모터 없이 ROS 흐름 확인" },
  { id: "hardware", label: "펌웨어 업로드와 실제 연결" },
  { id: "feedback", label: "피드백과 정지 확인" },
];
export const openrbDynamixelLessonPath = `${controlPath}/openrb-dynamixel`;
export const ros2DynamixelLessonPath = "/education/ros/dynamixel";
export const openrbDynamixelChapters = [
 {id:"roles",label:"OpenRB와 DYNAMIXEL의 역할"}, {id:"setup",label:"Jetson과 준비물"},
 {id:"bus",label:"전원과 통신 연결"}, {id:"identity",label:"ID 확인과 펌웨어"},
 {id:"commands",label:"토크와 위치 명령"}, {id:"feedback",label:"실제 피드백 확인"},
];
export const ros2DynamixelChapters = [
 {id:"pipeline",label:"ROS에서 USB로 연결"}, {id:"environment",label:"환경과 이전 펌웨어"},
 {id:"dry-run",label:"모터 없이 토픽 확인"}, {id:"hardware",label:"실제 port와 명령"},
 {id:"feedback",label:"토픽과 피드백"}, {id:"discussion",label:"여러 관절로 확장하기"},
];
export const developmentSetupPath = "/education/development-setup";
export const remoteWorkLessonPath = `${developmentSetupPath}/remote-work`;
export const lidarChapters = [
  { id: "sensor", label: "LiDAR는 무엇을 측정할까" },
  { id: "coordinates", label: "거리에서 좌표로" },
  { id: "matching", label: "알려진 벽과 비교하기" },
  { id: "practice", label: "경량 코드로 위치 찾기" },
  { id: "robot", label: "실제 센서에 연결하기" },
  { id: "discussion", label: "더 생각해 보기: 방향 정보" },
];
export const pidChapters = [
  { id: "feedback", label: "목표·측정·오차" },
  { id: "terms", label: "P, I, D를 그림으로 보기" },
  { id: "digital", label: "컴퓨터에서 계산하기" },
  { id: "applications", label: "PID 활용 예시" },
  { id: "tuning", label: "적용과 튜닝의 관점" },
 {id:"pid-response",label:"P·PI·PID 폐루프 비교"},
];
export const remoteWorkChapters = [
{id:"system",label:"로봇 전체 구조"},{id:"local-python",label:"로컬 Python과 경로"},
  { id: "roles", label: "로컬 컴퓨터와 Jetson" },
  { id: "server", label: "Jetson의 SSH 서버 준비" },
  { id: "tailscale", label: "Tailscale 설치와 로그인" },
  { id: "keys", label: "SSH 키 생성과 등록" },
  { id: "alias", label: "ssh jetson 별칭 만들기" },
  { id: "workflow", label: "코드·파일·장시간 작업" },
  { id: "gui", label: "GUI가 필요하면 RustDesk" },
  { id: "troubleshooting", label: "연결 문제를 나눠 확인하기" },
];
export const rosPath = "/education/ros";
export const rosBasicsPath = `${rosPath}/basics`;
export const rosPythonPath = `${rosPath}/python-pubsub`;
export const rosBagRvizPath = `${rosPath}/bag-rviz`;
export const rosBasicsChapters = [
{id:"units",label:"단위와 시간"},{id:"frames",label:"좌표계와 회전"},
 {id:"role",label:"ROS의 역할"},{id:"vocabulary",label:"노드·패키지·토픽"},{id:"environment",label:"Humble 실습 환경"},
 {id:"first-message",label:"첫 메시지 보내기"},{id:"contracts",label:"Service·Action·Parameter"},{id:"check",label:"확인과 다음 단계"},{id:"official-examples",label:"공식 talker/listener·turtlesim"},
];
export const rosPythonChapters = [

 {id:"classes",label:"Python 클래스와 노드"},{id:"publisher",label:"발행 노드와 타이머"},{id:"subscriber",label:"구독 노드와 콜백"},
 {id:"lifecycle",label:"Spin과 종료"},{id:"package",label:"패키지와 빌드"},{id:"run",label:"세 터미널 실습"},
];
export const rosBagRvizChapters = [
 {id:"roles",label:"Bag과 RViz의 역할"},{id:"pose",label:"표시할 위치와 방향 준비"},{id:"rviz",label:"Fixed Frame과 표시 항목"},
 {id:"record",label:"기록하고 정보 보기"},{id:"replay",label:"재생과 ROS time"},{id:"checks",label:"Frame·TF·QoS 점검"},
];
const topics: EducationTopic[] = [
  vlaTopic,
  deepMLTopic,
  simulationTopic,
  {
    title: "강화학습", path: reinforcementLearningPath,
    description: "관측·행동·정책·보상의 기본 개념부터 학습된 정책의 로봇 제어까지 연결합니다. Kimodo와 Microban은 이 개념을 사용하는 응용 자료입니다.",
    lessons: [...deepMLLessons.slice(3), { author: yeonwooCho, path: kimodoLessonPath, shortTitle: "모방 강화학습", label: "Kimodo + MuJoCo Warp", title: "한 발 서기로 배우는 모방 강화학습", description: "따라 할 동작을 만들고 Microban의 몸체에 맞춘 뒤, 넘어지지 않도록 제어를 배웁니다. Kimodo와 MuJoCo Warp를 쓴 코드와 검증 영상을 함께 읽습니다.", chapters: lessonChapters }],
  },
  {
    title: "객체인식", path: objectRecognitionPath,
    description: "사진 속 물체가 무엇이고 어디에 있는지 알아내는 방법을 배웁니다. 처음 공부하는 사람도 사진과 정답지부터 시작할 수 있습니다.",
    lessons: [{ author: yeonwooCho, path: perceptionLessonPath, shortTitle: "합성 데이터로 시작하기", label: "사진에서 형태와 과일 찾기", title: "합성 데이터로 시작하는 객체인식", description: "정다면체의 형태와 과일 그림을 알아내는 두 단계 모델을 살펴봅니다. Blender로 학습 사진과 정답지를 함께 만들고, YOLO 모델을 학습한 뒤 실제 사진에서 확인합니다.", chapters: perceptionChapters }],
  },
  {
    title: "위치 추정", path: localizationPath,
    description: "센서로 측정한 주변 모습과 지도를 비교해 로봇의 위치를 알아냅니다.",
    lessons: [{ author: yeonwooCho, path: lidarLessonPath, shortTitle: "LiDAR 사용", label: "알려진 벽으로 위치 찾기", title: "LiDAR로 시작하는 위치 추정", description: "거리와 각도부터 이해하고, 알려진 사각형 벽과 측정 거리를 비교하는 방식을 경량 Python 코드로 실습합니다.", chapters: lidarChapters },
      { author: yeonwooCho, path: objectLocalizationLessonPath, number: 3, shortTitle: "객체 위치 추정", label: "물체 영역 분할 + 깊이 → object map", title: "사진 속 물체를 지도에 표시하기", description: "객체의 마스크와 깊이로 카메라 기준 관측점을 구하고, 촬영 당시 로봇 위치를 이용해 지도 좌표로 옮깁니다.", chapters: objectLocalizationChapters },
    ],
  },
  {
    title: "ROS", path: rosPath,
    description: "노드와 토픽으로 프로그램을 연결하고, 데이터를 기록·표시한 뒤 로봇 하드웨어까지 이어갑니다. ROS 2 Humble 기준의 실습 시리즈입니다.",
    lessons: [
      {author: yeonwooCho, path: rosBasicsPath, shortTitle:"ROS 2 시작하기",label:"노드 · 패키지 · 토픽",title:"처음 시작하는 ROS 2",description:"ROS의 역할부터 익히고, 터미널에서 메시지를 보내고 받으며 연결 관계를 확인합니다.",chapters:rosBasicsChapters},
      {author: yeonwooCho, path: rosPythonPath, shortTitle:"Python으로 메시지 주고받기",label:"클래스 · 타이머 · 콜백",title:"Python으로 메시지 주고받기",description:"작은 노드 두 개를 작성하고 ament_python 패키지로 빌드하여 메시지를 주고받습니다.",chapters:rosPythonChapters},
      {author: yeonwooCho, path: rosBagRvizPath, shortTitle:"rosbag과 RViz",label:"기록 · 재생 · 공간에 표시",title:"rosbag과 RViz로 데이터 다시 보기",description:"Pose 메시지를 기록·재생하고 RViz의 Fixed Frame과 표시 항목으로 위치와 방향을 확인합니다.",chapters:rosBagRvizChapters},
      { author: yeonwooCho, path: ros2TopicsLessonPath, shortTitle: "ROS 2 토픽으로 내보내기", label: "위치 계산을 노드로 연결하기", title: "위치 추정 결과를 ROS 2 토픽으로 내보내기", description: "LiDAR 입력을 구독하고 추정 위치를 PoseStamped로 발행합니다. 세 터미널에서 메시지·좌표·시각을 확인합니다.", chapters: ros2TopicsChapters },
      { author: yeonwooCho, path: rosArduinoMotorLessonPath, shortTitle: "ROS로 엔코더 모터 제어하기", label: "Jetson → Arduino → 모터 드라이버", title: "Jetson에서 ROS로 엔코더 모터 제어하기", description: "cmd_vel을 USB 시리얼 통신으로 전달하고, Arduino가 엔코더 피드백으로 모터 드라이버의 PWM을 보정하는 흐름을 따라갑니다.", chapters: rosArduinoMotorChapters },
      { author: yeonwooCho, path: ros2DynamixelLessonPath, shortTitle: "ROS 2로 DYNAMIXEL 제어", label: "같은 펌웨어에 ROS 연결 프로그램 연결", title: "ROS 2 토픽으로 DYNAMIXEL 제어하기", description: "기본 사용에서 확인한 USB 인터페이스에 ROS 2 command와 state 토픽을 연결하고 명령·응답을 확인합니다.", chapters: ros2DynamixelChapters },
    ],
  },
  {
    title: "제어", path: controlPath,
    description: "목표와 측정값의 차이를 줄여 로봇이 원하는 움직임을 만들도록 합니다.",
    lessons: [{ author: yeonwooCho, path: pidLessonPath, shortTitle: "PID 제어", label: "엔코더 모터와 경로 추종", title: "그림으로 이해하는 PID 제어", description: "P·I·D의 역할을 그림으로 이해하고, 엔코더 모터와 경로 추종에 어떻게 적용할 수 있는지 살펴봅니다.", chapters: pidChapters },
      { author: yeonwooCho, path: openrbDynamixelLessonPath, shortTitle: "OpenRB + DYNAMIXEL 기본 사용", label: "USB 연결부터 위치 피드백까지", title: "Jetson + OpenRB로 DYNAMIXEL 기본 사용하기", description: "전원·ID·baud·펌웨어를 준비하고 ROS 없이 USB 콘솔로 토크와 작은 위치 이동을 확인합니다.", chapters: openrbDynamixelChapters },
    ],
  },
  {
    title: "개발 환경 준비", path: developmentSetupPath,
    description: "내 컴퓨터에서 로봇의 컴퓨터에 접속하고, 코드를 옮기고 실행하는 환경을 준비합니다.",
    lessons: [{ author: yeonwooCho, path: remoteWorkLessonPath, shortTitle: "원격 작업하기", label: "SSH · Tailscale · RustDesk", title: "원격 작업하기: ssh jetson부터 GUI까지", description: "SSH 키 생성, Tailscale 로그인, 접속 별칭 설정을 따라 하고 GUI 작업에는 RustDesk를 사용합니다.", chapters: remoteWorkChapters }],
  },
];

export const educationTopics = [developmentSetupPath, controlPath, rosPath, deepMLPath, objectRecognitionPath, localizationPath, simulationPath, kimodoTopicPath, vlaPath].map(path => topics.find(topic => topic.path === path)!).map(topic=>({...topic,lessons:topic.lessons.map(lesson=>lesson.path===deepMLLessons[0].path ? {...lesson,chapters:[{id:"arrays",label:"배열·shape 보충"},...lesson.chapters]} : lesson)}));
