export const reinforcementLearningPath = "/education/reinforcement-learning";
export const kimodoLessonPath = `${reinforcementLearningPath}/kimodo-mjwarp`;
export const lessonChapters = [
  { id: "terms", label: "용어와 전체 흐름" },
  { id: "kimodo", label: "Kimodo와 모션 생성" },
  { id: "query", label: "실제 입력과 코드" },
  { id: "retarget", label: "Microban 리타기팅" },
  { id: "learning", label: "PPO 학습" },
  { id: "validation", label: "정책 검증" },
  { id: "comparison", label: "외란 학습 전·후 비교" },
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
  { id: "improve", label: "실패를 보고 개선하기" },
];
export const educationTopics = [
  {
    title: "강화학습", path: reinforcementLearningPath,
    description: "시뮬레이션 안에서 행동을 시도하고, 보상을 통해 로봇의 제어 정책을 배우는 과정을 살펴봅니다.",
    lessons: [{ path: kimodoLessonPath, shortTitle: "모방 강화학습", label: "Kimodo + MuJoCo Warp", title: "NVIDIA Kimodo + MuJoCo Warp로 모방 강화학습 만들기", description: "한 발 서기를 사례로, 문장으로 생성한 모션을 Microban의 자세로 옮기고 PPO로 균형 잡는 정책을 학습합니다. 실제 입력, 코드, 검증 영상과 함께 따라가세요.", chapters: lessonChapters }],
  },
  {
    title: "객체인식", path: objectRecognitionPath,
    description: "사진 속 물체가 무엇이고 어디에 있는지 알아내는 방법을 배웁니다. 처음 공부하는 사람도 사진과 정답지부터 시작할 수 있습니다.",
    lessons: [{ path: perceptionLessonPath, shortTitle: "합성 데이터로 시작하기", label: "사진에서 형태와 과일 찾기", title: "합성 데이터로 시작하는 객체인식", description: "똥개 로봇의 정다면체와 과일 인식을 사례로 살펴봅니다. Blender로 학습 사진과 정답지를 함께 만들고, YOLO 모델을 학습한 뒤 실제 사진에서 확인합니다.", chapters: perceptionChapters }],
  },
];
