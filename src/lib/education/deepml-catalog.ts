export const deepMLPath = "/education/deepml";
export const deepMLLessons = [
  {
    slug: "data-and-models", shortTitle: "데이터에서 예측까지", title: "데이터에서 예측까지",
    label: "입력 · 정답 · 모델 · 추론",
    description: "카메라와 센서 값을 모델의 입력으로 읽고, 정답 데이터로 학습한 결과를 로봇 프로그램에 연결합니다.",
    chapters: [{ id: "task", label: "로봇이 풀어야 할 문제" }, { id: "tensors", label: "숫자 배열과 입력 기준" }, { id: "labels", label: "데이터와 정답" }, { id: "training-inference", label: "학습과 추론" }],
  },
  {
    slug: "neural-networks", shortTitle: "신경망은 어떻게 배우는가", title: "신경망은 어떻게 배우는가",
    label: "가중치 · 손실 · 역전파 · 학습률",
    description: "신경망의 가중치가 바뀌는 과정을 이해하고, 직접 실행한 작은 거리 보정 모델의 학습 곡선을 읽습니다.",
    chapters: [{ id: "linear-update", label: "선형 모델 한 번의 수정" }, { id: "weights", label: "신경망과 가중치" }, { id: "loss", label: "손실과 기울기" }, { id: "training-loop", label: "학습 반복과 코드" }, { id: "learning-curve", label: "학습 곡선과 과적합" }],
  },
  {
    slug: "evaluation", shortTitle: "새 데이터에서 평가하기", title: "새 데이터에서도 작동하는 모델",
    label: "데이터 분리 · 지표 · 환경 변화",
    description: "train·validation·test를 나누고, 모델의 오차와 실행 시간을 실제 동아리 작업의 기준으로 평가합니다.",
    chapters: [{ id: "split", label: "데이터 분리와 누수" }, { id: "metrics", label: "손실과 평가 지표" }, { id: "shift", label: "입력 조건의 변화" }, { id: "deployment", label: "로봇 프로그램에 연결" }],
  },
  {
    slug: "reinforcement-learning", shortTitle: "관측에서 행동으로", title: "관측에서 행동으로",
    label: "관측 · 행동 · 정책 · 보상",
    description: "Spinning Up의 핵심 용어를 한국어로 익히고, Microban 한 발 서기에서 무엇을 관측하고 제어하는지 살펴봅니다.",
    chapters: [{ id: "tiny-environment", label: "두 행동의 작은 환경" }, { id: "interaction", label: "에이전트와 환경" }, { id: "observation", label: "상태와 관측" }, { id: "policy", label: "정책과 행동 공간" }, { id: "reward", label: "보상과 에피소드" }],
  },
  {
    slug: "policy-and-robot", shortTitle: "학습한 정책으로 제어하기", title: "학습한 정책을 로봇 제어로 연결하기",
    label: "경험 · PPO · 관절 제어 · 실물 평가",
    description: "경험으로 정책을 개선하는 과정을 이해하고, 저장된 정책과 피드백 제어기가 로봇을 움직이는 흐름을 연결합니다.",
    chapters: [{ id: "experience", label: "경험과 가치 함수" }, { id: "actor-critic", label: "Actor·Critic 숫자 예제" }, { id: "ppo", label: "PPO의 역할" }, { id: "control", label: "정책 추론과 관절 제어" }, { id: "transfer", label: "시뮬레이션에서 실물로" }],
  },
].map(lesson => ({ ...lesson, path: `${["reinforcement-learning", "policy-and-robot"].includes(lesson.slug) ? "/education/reinforcement-learning" : deepMLPath}/${lesson.slug}`, author: undefined }));

export const deepMLTopic = {
  title: "DeepML · 학습의 기초", path: deepMLPath,
  description: "딥러닝을 처음 접하는 동아리원을 위한 3개 자료입니다. 사진과 센서 데이터에서 시작해 신경망의 학습·평가를 익힙니다. 변수·함수에 더해 배열의 shape·배치와 실행 환경이 필요합니다. 각 자료의 선행 설명을 먼저 확인하세요.",
  lessons: deepMLLessons.slice(0, 3),
};
