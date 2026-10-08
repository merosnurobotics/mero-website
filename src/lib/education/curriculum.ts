import { vlaLessons } from "./vla-catalog";
import { simulationLessons } from "./simulation-catalog";
import {
  educationTopics, remoteWorkLessonPath, pidLessonPath, openrbDynamixelLessonPath,
  rosBasicsPath, rosPythonPath, rosBagRvizPath, rosArduinoMotorLessonPath,
  ros2DynamixelLessonPath, perceptionLessonPath, lidarLessonPath,
  ros2TopicsLessonPath, objectLocalizationLessonPath, kimodoLessonPath,
} from "./catalog";
import { deepMLLessons } from "./deepml-catalog";

// Concepts precede the existing perception and learned-control applications.
const stages = [
  { title: "개발 환경 준비", description: "코드를 어디에서 실행하는지부터 정합니다. 내 컴퓨터와 로봇의 컴퓨터를 연결합니다.", paths: [remoteWorkLessonPath] },
  { title: "목표와 실제 움직임 연결", description: "센서로 측정한 값과 목표의 차이를 줄이는 원리를 배우고, 모터에 명령을 보내 실제 응답을 확인합니다.", paths: [pidLessonPath, openrbDynamixelLessonPath] },
  { title: "ROS로 프로그램 연결", description: "노드와 메시지의 관계를 익힌 뒤, 제어에서 다룬 모터 명령과 피드백을 ROS로 주고받습니다.", paths: [rosBasicsPath, rosPythonPath, rosBagRvizPath, rosArduinoMotorLessonPath, ros2DynamixelLessonPath] },
  { title: "데이터로 판단과 행동을 학습", description: "입력·정답·신경망·학습·평가를 익힙니다. 이후 객체인식과 강화학습 자료에서 같은 입력 기준과 학습·평가 개념을 사용합니다.", paths: deepMLLessons.slice(0, 3).map(lesson => lesson.path) },
  { title: "사진에서 물체 찾기", description: "가중치·손실·학습·추론부터 설명합니다. 사진과 정답으로 학습한 모델이 물체의 종류와 영역을 출력하는 과정을 봅니다.", paths: [perceptionLessonPath] },
  { title: "센서 값을 지도 위 위치로 변환", description: "LiDAR로 로봇의 위치를 구하고 ROS로 전달합니다. 여기에 물체 영역과 깊이를 더해 물체의 지도 좌표를 계산합니다.", paths: [lidarLessonPath, ros2TopicsLessonPath, objectLocalizationLessonPath] },
  { title: "로봇 모델과 물리 시뮬레이션", description: "몸체·관절·구동기의 의미를 익히고, 작은 MuJoCo 모델에서 명령과 움직임을 확인합니다.", paths: [...simulationLessons.slice(0, 2).map(lesson => lesson.path), simulationLessons[3].path] },
  { title: "강화학습: 기초에서 로봇 제어까지", description: "관측·행동·보상과 정책 업데이트를 이해하고 Microban 한 발 서기 사례의 결과를 읽습니다.", paths: [...deepMLLessons.slice(3).map(lesson => lesson.path), simulationLessons[2].path, kimodoLessonPath] },
  {title:"VLA와 로봇 조작 개념",description:"사진·언어·시연·행동을 구분하고 프로젝트에서 정할 연결을 이해합니다.",paths:vlaLessons.map(lesson=>lesson.path)},
];
const lessons = educationTopics.flatMap(topic => topic.lessons);
export const educationCurriculum = stages.map(stage => ({
  ...stage,
  lessons: stage.paths.map(path => {
    const lesson = lessons.find(lesson => lesson.path === path);
    if (!lesson) throw new Error(`Curriculum lesson does not exist: ${path}`);
    return lesson;
  }),
}));
export const educationReadingOrder = educationCurriculum.flatMap(stage => stage.lessons);

const connections: Record<string, string> = {
  [simulationLessons[0].path]: "센서의 좌표를 로봇의 몸체·관절 좌표와 연결합니다. 관절 값에서 손·발 끝의 위치를 계산하고, 목표 자세와 실제 모터 제어를 구분합니다.",
  [simulationLessons[1].path]: "앞에서 정한 몸체·관절·구동기를 실제 물리 계산에 넣습니다. PID에서 익힌 피드백 제어로 명령과 관절 움직임의 관계를 확인합니다.",
  [simulationLessons[2].path]: "물리 계산 위에 관측·행동·보상·종료 조건을 정의합니다. 이 환경의 계약을 이해한 뒤 Kimodo의 목표 모션과 Microban 정책 학습을 읽습니다.",
  [deepMLLessons[0].path]: "사진과 센서 값을 모델의 입력으로 읽습니다. ROS나 모터 실습을 먼저 끝낼 필요는 없습니다. 입력·정답·출력을 정하는 일이 객체인식과 학습 제어의 출발점입니다.",
  [deepMLLessons[1].path]: "앞에서 정한 입력과 정답으로 신경망의 가중치를 맞춥니다. 여기서 익힌 학습 반복은 객체인식 모델과 신경망 정책에 공통으로 쓰입니다.",
  [deepMLLessons[2].path]: "학습한 데이터에서의 개선을 새 데이터와 로봇의 실행 조건에서 다시 확인합니다. 이 기준으로 뒤의 과일 인식 결과와 시뮬레이션 정책을 읽습니다.",
  [deepMLLessons[3].path]: "이제 모델의 출력이 예측값에서 다음 행동으로 바뀝니다. 센서 관측·관절 목표·피드백 제어를 강화학습의 용어에 연결합니다.",
  [deepMLLessons[4].path]: "관측·행동·보상으로 모은 경험을 사용해 정책을 학습합니다. 이후 Microban 자료에서는 같은 흐름에 목표 모션과 물리 시뮬레이션을 더합니다.",
  [remoteWorkLessonPath]: "공통 입문 명령은 내 컴퓨터에서 실행합니다. SSH 접속 뒤의 명령부터 Jetson에서 실행합니다. 이후 모터·센서·학습 코드도 같은 방식으로 실행합니다.",
  [pidLessonPath]: "제어의 기본은 목표와 측정값을 비교해 출력을 고치는 것입니다. 뒤에서 다룰 모터 제어와 강화학습도 움직인 결과를 다시 측정합니다.",
  [openrbDynamixelLessonPath]: "PID에서 구분한 목표값과 측정값을 실제 모터의 목표 각도와 현재 각도로 확인합니다. 이 USB 통신에 나중에 ROS를 연결합니다.",
  [rosBasicsPath]: "모터 명령과 센서 측정값을 여러 프로그램이 주고받도록 연결합니다. ROS는 메시지를 전달하며, 제어 계산은 각 노드가 맡습니다.",
  [rosPythonPath]: "앞에서 터미널로 주고받은 메시지를 Python 코드로 옮깁니다. 발행·구독·콜백은 이후 센서와 모터 노드에도 그대로 쓰입니다.",
  [rosBagRvizPath]: "노드가 주고받는 값을 기록하고 다시 재생합니다. 위치나 제어가 잘못됐을 때 같은 입력으로 원인을 확인하는 방법입니다.",
  [rosArduinoMotorLessonPath]: "ROS의 목표 속도를 Arduino로 전달하고, 엔코더로 측정한 실제 속도를 PID로 보정합니다. 통신과 피드백 제어가 만나는 예시입니다.",
  [ros2DynamixelLessonPath]: "OpenRB에서 확인한 목표 각도와 현재 각도를 ROS 토픽으로 연결합니다. 앞서 올린 펌웨어를 그대로 사용합니다.",
  [perceptionLessonPath]: "센서 입력이 사진일 때는 숫자 배열에서 물체의 종류와 영역을 찾아야 합니다. 이 본문에서 딥러닝 기초를 익히고, 인식 결과를 이후 위치 추정에 사용합니다.",
  [lidarLessonPath]: "물체의 종류를 찾는 것과 로봇 자신의 위치를 찾는 것은 다른 문제입니다. 여기서는 LiDAR의 거리·각도와 알려진 벽을 비교해 로봇 위치를 구합니다.",
  [ros2TopicsLessonPath]: "LiDAR 자료에서 계산한 로봇 위치를 ROS 메시지로 내보냅니다. 좌표계와 측정 시각을 함께 전달해야 다음 프로그램이 이 위치를 사용할 수 있습니다.",
  [objectLocalizationLessonPath]: "객체인식의 물체 영역, 깊이 센서의 거리, 촬영 당시 로봇 위치를 합칩니다. 세 값이 있어야 사진 속 물체를 지도 좌표로 옮길 수 있습니다.",
  [kimodoLessonPath]: "이제 로봇의 몸 상태를 입력으로 받고 관절 목표를 출력하는 제어 규칙을 학습합니다. PID의 피드백과 객체인식에서 배운 가중치·학습·추론을 연결합니다.",
};

export function lessonConnection(path: string) { return path===vlaLessons[0].path ? "사진·언어·로봇 상태가 어떤 행동으로 연결되는지 이해합니다. 장치 연결과 학습 결과 제작은 프로젝트에서 진행합니다." : path===simulationLessons[3].path ? "MuJoCo에서 나눈 모델·계산·제어 역할을 Gazebo의 센서·ROS 연결에도 적용합니다. 여러 시뮬레이터를 모두 필수로 배우지는 않습니다." : connections[path]; }

// Branches describe prerequisites; the original full sequence remains a reference.
export const educationLearningPaths = [
 {title:"공통 입문",description:"교육은 과제에 투입되기 전 개념을 익히는 단계입니다. 로봇 프로그램의 역할, 단위·좌표·시간, 배열과 피드백을 읽습니다. 로컬 실행 준비는 필요한 학생만 확인합니다.",steps:[
  {path:`${remoteWorkLessonPath}#system`,label:"센서 · 추정 · 계획 · 제어의 역할"},
  {path:`${rosBasicsPath}#units`,label:"단위 · 시간 · 좌표계"},
  {path:`${deepMLLessons[0].path}#arrays`,label:"배열 · 관측의 순서와 모양"},
  {path:pidLessonPath,label:"피드백 · P·PI·PID 응답"},
 ]},
 {title:"휴머노이드 동작 이해",description:"춤은 시간에 따른 모션과 접촉을, 포복은 여러 부위의 허용 접촉과 몸 높이를 이해해야 합니다. 교육에서 움직임의 의미를 익히고 실제 정책·장애물 과제는 프로젝트에서 만듭니다.",steps:[
  {path:simulationLessons[0].path,label:"관절 · 2링크 기구학 · 접촉과 구동기 한계"},
  {path:simulationLessons[1].path,label:"물리와 제어 · 진자와 Cart-pole 비교"},
  {path:deepMLLessons[3].path,label:"작은 환경 · 보상과 누적 보상"},
  {path:deepMLLessons[1].path,label:"가중치가 바뀌는 원리"},
  {path:deepMLLessons[4].path,label:"Actor–Critic · PPO 숫자 예제"},
  {path:simulationLessons[2].path,label:"관측 · 행동 · 종료의 의미"},
  {path:kimodoLessonPath,label:"모션·잔차 제어·평가를 읽는 기존 사례"},
 ]},
 {title:"사족 지형·점프 이해",description:"같은 피드백과 강화학습 기초를 사용합니다. 발의 지지·스윙, 계단의 디딤, 이륙·비행·착지에서 관측과 평가가 왜 달라지는지 준비합니다. 보행·점프 정책 제작은 프로젝트 범위입니다.",steps:[
  {path:`${simulationLessons[0].path}#contact`,label:"지지 · 접촉 · 마찰 · 구동기 한계"},
  {path:simulationLessons[1].path,label:"목표와 실제 움직임의 차이"},
  {path:deepMLLessons[3].path,label:"보상과 정책의 관계"},
  {path:deepMLLessons[1].path,label:"정책 신경망의 학습"},
  {path:deepMLLessons[4].path,label:"가치 추정과 정책 변화"},
  {path:simulationLessons[2].path,label:"관측 · 제어 주기 · 종료 조건"},
 ]},
 {title:"조작 · VLA 이해",description:"ROS 모터 실습이나 합성 데이터 프로젝트를 모두 끝낼 필요는 없습니다. 입력·학습·평가를 익힌 뒤 시각·언어·행동을 연결합니다. RB-Y1 장치 연결과 시연 수집은 프로젝트에서 정합니다.",steps:[
  ...deepMLLessons.slice(0,3).map(lesson=>({path:lesson.path,label:lesson.shortTitle})),
  {path:`${rosBasicsPath}#frames`,label:"카메라 · 베이스 · 손끝 좌표"},
  {path:vlaLessons[0].path,label:"VLA · 시연 · 행동 표현 · 청크 · 평가"},
 ]},
 {title:"ROS · Gazebo 선택 과정",description:"프로젝트에서 ROS와 시뮬레이터를 연결할 학생만 읽습니다. 통신·물리·화면·센서의 역할을 구분하는 과정이며 로봇 전체 통합 프로젝트를 대신하지 않습니다.",steps:[
  {path:rosBasicsPath,label:"ROS 메시지와 프로그램의 역할"},
  {path:rosBagRvizPath,label:"좌표와 시간 기록 · 표시"},
  {path:simulationLessons[3].path,label:"Gazebo · 월드 · 센서 · 브리지 · 물리 시간"},
 ]},
];

const prerequisites: Record<string, {path:string;label:string}[]> = {
 [vlaLessons[0].path]:[{path:deepMLLessons[2].path,label:"학습과 평가"},{path:`${rosBasicsPath}#frames`,label:"좌표와 행동 단위"}],
 [simulationLessons[3].path]:[{path:rosBasicsPath,label:"ROS 메시지"},{path:simulationLessons[0].path,label:"모델과 물리"}],
 [remoteWorkLessonPath]:[],
 [pidLessonPath]:[{path:`${rosBasicsPath}#units`,label:"단위와 시간 간격"}],
 [openrbDynamixelLessonPath]:[{path:pidLessonPath,label:"피드백과 모터 명령"}],
 [rosBasicsPath]:[{path:`${remoteWorkLessonPath}#local-python`,label:"터미널과 실행 환경"}],
 [rosPythonPath]:[{path:rosBasicsPath,label:"ROS 노드·토픽"}],
 [rosBagRvizPath]:[{path:rosPythonPath,label:"메시지 발행·구독"},{path:`${rosBasicsPath}#frames`,label:"좌표계와 방향"}],
 [rosArduinoMotorLessonPath]:[{path:pidLessonPath,label:"PID와 엔코더"},{path:rosPythonPath,label:"ROS Python"}],
 [ros2DynamixelLessonPath]:[{path:openrbDynamixelLessonPath,label:"OpenRB 기본 통신"},{path:rosPythonPath,label:"ROS Python"}],
 [deepMLLessons[0].path]:[{path:`${deepMLLessons[0].path}#arrays`,label:"배열·shape 보충"}],
 [deepMLLessons[1].path]:[{path:deepMLLessons[0].path,label:"입력·정답·배열"}],
 [deepMLLessons[2].path]:[{path:deepMLLessons[1].path,label:"예측·손실·학습"}],
 [perceptionLessonPath]:[{path:deepMLLessons[2].path,label:"학습과 평가"}],
 [lidarLessonPath]:[{path:`${rosBasicsPath}#frames`,label:"좌표계와 거리 단위"}],
 [ros2TopicsLessonPath]:[{path:lidarLessonPath,label:"LiDAR 위치 계산"},{path:rosPythonPath,label:"ROS Python"}],
 [objectLocalizationLessonPath]:[{path:perceptionLessonPath,label:"물체 영역과 마스크"},{path:`${rosBasicsPath}#frames`,label:"좌표 변환"}],
 [simulationLessons[0].path]:[{path:`${rosBasicsPath}#frames`,label:"축과 관절 각도"}],
 [simulationLessons[1].path]:[{path:simulationLessons[0].path,label:"몸체와 관절"},{path:pidLessonPath,label:"P·I·D"}],
 [deepMLLessons[3].path]:[{path:`${remoteWorkLessonPath}#local-python`,label:"Python 실행"}],
 [deepMLLessons[4].path]:[{path:deepMLLessons[3].path,label:"관측·행동·누적 보상"},{path:deepMLLessons[1].path,label:"가중치 수정"}],
 [simulationLessons[2].path]:[{path:simulationLessons[1].path,label:"물리 스텝"},{path:deepMLLessons[3].path,label:"보상과 에피소드"}],
 [kimodoLessonPath]:[{path:deepMLLessons[4].path,label:"Actor–Critic·PPO"},{path:simulationLessons[2].path,label:"환경 입출력"}],
};
export function lessonPreparation(path:string) {
 const lesson=lessons.find(item=>item.path===path);
 if(!lesson)return undefined;
 const kind=path===kimodoLessonPath ? "프로젝트 사례 분석 · 개념 확인용" : path===vlaLessons[0].path || path===simulationLessons[3].path || path===deepMLLessons[4].path ? "개념 읽기" : path===deepMLLessons[0].path || path===deepMLLessons[2].path || path===simulationLessons[0].path || path===simulationLessons[2].path ? "개념 읽기 · 코드 따라 읽기" : "개념 읽기 · 직접 실행 실습";
 const environment=path===vlaLessons[0].path || path===simulationLessons[3].path ? "브라우저로 읽기 · 실제 로봇 실행을 요구하지 않는 개념 입문" : path===kimodoLessonPath ? "본문과 저장된 결과 읽기: 브라우저 · 정책 재실행은 별도 MuJoCo 환경" : path===openrbDynamixelLessonPath || path===ros2DynamixelLessonPath ? "기본 연결: Jetson/Ubuntu 22.04 · OpenRB/XC330 · 실제 전원과 USB 필요, 형식 검사는 연결 없이 가능" : path.startsWith('/education/ros/') ? "공통 보충: Python 3.10+ · ROS 실습: Ubuntu 22.04 / ROS 2 Humble, 드라이런·합성 입력부터 시작" : path===remoteWorkLessonPath ? "공통 입문: 로컬 Python 3.10+ · SSH 이후: 접속 권한이 있는 Ubuntu 장치" : path===perceptionLessonPath ? "Python/Ultralytics · 추론은 CPU 가능, 전체 합성 데이터 재현은 Ubuntu/CUDA·렌더링 환경" : path===simulationLessons[1].path ? "브라우저 비교 · 직접 실행: Python 3.10+ / MuJoCo, GPU·ROS·실물 장치 불필요" : "Python 3.10+ · 작은 예제부터 실행, 추가 패키지는 본문 명령으로 설치";
 return {kind,environment,prerequisites:prerequisites[path] || [],goals:[lesson.description,`입력과 출력의 의미를 읽고 ${lesson.chapters.at(-1)?.label || '결과'}의 가정과 확인 범위를 구분합니다.`]};
}
