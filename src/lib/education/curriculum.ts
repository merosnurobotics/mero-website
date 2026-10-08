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
  { title: "로봇 모델과 물리 시뮬레이션", description: "몸체·관절·구동기의 의미를 익히고, 작은 MuJoCo 모델에서 명령과 움직임을 확인합니다.", paths: simulationLessons.slice(0, 2).map(lesson => lesson.path) },
  { title: "강화학습: 기초에서 로봇 제어까지", description: "모션 생성·리타기팅·정책 학습을 연결해 Microban이 한 발로 서는 제어를 만듭니다.", paths: [...deepMLLessons.slice(3).map(lesson => lesson.path), simulationLessons[2].path, kimodoLessonPath] },
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
  [deepMLLessons[0].path]: "ROS로 전달하는 사진과 센서 값을 이제 모델의 입력으로 읽습니다. 입력·정답·출력을 정하는 일이 객체인식과 학습 제어의 출발점입니다.",
  [deepMLLessons[1].path]: "앞에서 정한 입력과 정답으로 신경망의 가중치를 맞춥니다. 여기서 익힌 학습 반복은 객체인식 모델과 신경망 정책에 공통으로 쓰입니다.",
  [deepMLLessons[2].path]: "학습한 데이터에서의 개선을 새 데이터와 로봇의 실행 조건에서 다시 확인합니다. 이 기준으로 뒤의 과일 인식 결과와 시뮬레이션 정책을 읽습니다.",
  [deepMLLessons[3].path]: "이제 신경망의 출력이 예측 종류에서 다음 행동으로 바뀝니다. 센서 관측·관절 목표·피드백 제어를 강화학습의 용어에 연결합니다.",
  [deepMLLessons[4].path]: "관측·행동·보상으로 모은 경험을 사용해 정책을 학습합니다. 이후 Microban 자료에서는 같은 흐름에 목표 모션과 물리 시뮬레이션을 더합니다.",
  [remoteWorkLessonPath]: "실습 명령은 Jetson에서 실행하고, 내 컴퓨터에서는 접속과 편집을 합니다. 이후 모터·센서·학습 코드도 같은 방식으로 실행합니다.",
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

export function lessonConnection(path: string) { return connections[path]; }
