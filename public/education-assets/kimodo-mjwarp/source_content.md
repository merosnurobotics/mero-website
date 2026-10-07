# 문장 하나에서 한 발 서기 정책까지

이 노트는 **실제 영어 문장으로 만든 Kimodo 모션을 Microban에 맞추고, PPO로 학습한 뒤 MuJoCo-Warp와 native MuJoCo에서 검증한 사례 하나**를 따라간다. 목표는 양발로 시작해 왼발로 서고, 몸통을 세 번 밀어도 균형을 유지하는 것이다.

## 먼저 읽는 용어

| 용어 | 뜻 |
|---|---|
| 모션 / motion | 시간 순서대로 저장한 몸과 관절의 자세 |
| 프롬프트 / prompt | 만들 동작을 설명하는 문장 |
| 기구학 / kinematics | 힘을 계산하지 않고 자세와 손발 위치를 구하는 계산 |
| 리타기팅 / retargeting | 다른 로봇의 관절과 팔다리에 맞춰 모션을 옮기는 과정 |
| IK / Inverse Kinematics | 손발 목표 위치에 맞는 관절각을 찾는 계산 |
| 정책 / policy | 현재 상태를 보고 다음 모터 명령을 정하는 함수 |
| 모방 강화학습 / Imitation Reinforcement Learning | 참조 동작을 따르는 보상을 넣어 제어 정책을 학습하는 방법 |
| PPO / Proximal Policy Optimization | 행동 결과를 모아 정책을 조금씩 개선하는 강화학습 알고리즘 |
| MuJoCo | 질량·중력·마찰·모터·접촉을 계산하는 물리 시뮬레이터 |
| MuJoCo-Warp / MJWarp | MuJoCo 물리를 NVIDIA GPU에서 여러 환경에 병렬 계산하는 구현 |
| 외란 / disturbance | 균형을 흔드는 외부 자극. 여기서는 몸통에 가하는 실제 수평 힘 |

## 셀 1 — Kimodo에 문장을 넣는다

Kimodo는 NVIDIA의 사전학습 모션 생성 모델과 실행 코드다. 문장, 전신 자세, 손발 위치나 이동 경로를 조건으로 받아 시간별 골격 위치·회전을 생성한다. 공식 소개 페이지에는 문장으로 동작을 만드는 예와 로봇 학습에 연결하는 예가 있다. [NVIDIA Kimodo 소개](https://research.nvidia.com/labs/sil/projects/kimodo/), [공식 공개 데모](https://huggingface.co/spaces/nvidia/Kimodo).

이번에는 **Kimodo-G1-RP-v1**을 골라 Unitree G1 골격의 모션을 만들었다. Kimodo의 SOMA·G1·SMPL-X 모델은 대상 골격이 다르므로 생성할 로봇에 맞는 모델을 선택해야 한다. [공식 모델 목록](https://github.com/nv-tlabs/kimodo#kimodo-models).

실제로 보낸 문장:

```text
A humanoid robot stands on both feet, slowly shifts weight onto its left foot, raises the right foot, and balances steadily on the left leg.
```

“휴머노이드가 양발로 서 있다가 왼발로 체중을 옮기고, 오른발을 들어 왼발로 안정적으로 균형을 잡는다.”

실제로 사용한 설정:

```python
query = {
    "model": "nvidia/Kimodo-G1-RP-v1",
    "seed": 14,
    "frames": 180, "fps": 30,
    "num_denoising_steps": 100,
    "num_samples": 1,
    "text_guidance": 2.0,
    "constraint_guidance": 0.0,
    "numeric_constraints": [],
    "real_robot_rotations": True,
    "post_processing": False,
}
```

DDIM 100단계는 잡음을 정리해 모션을 만드는 추론을 100회 수행한다는 뜻이다. 출력 180프레임이나 PPO 업데이트 횟수와는 다른 숫자다. text guidance는 문장 조건의 강도이며 숫자 자세 조건은 넣지 않았다. [공식 모델 설명](https://research.nvidia.com/labs/sil/projects/kimodo/docs/key_concepts/model.html), [공식 설정](https://research.nvidia.com/labs/sil/projects/kimodo/docs/user_guide/configuration.html).

실행 셀:

```bash
vendor/kimodo/.venv/bin/python education/kimodo_official_demo_oneleg.py \
  --output-dir data/kimodo_text_oneleg_reproduced
```

이 헬퍼는 NVIDIA 공식 공개 데모의 메시지 API를 사용한다. 이번 로컬 환경에서는 Llama 텍스트 인코더 인증이 401이어서 공식 데모에서 문장 조건 추론을 실행했다. 다른 인코더로 대체하지 않았다.

출력:

```text
Motion generation finished!
oneleg_text_00.npz
oneleg_text_00.csv
180 frames · 30 Hz · 6 seconds
```

공식 데모는 6초짜리 모션을 생성했다. 처음에는 양발로 서고 약2–5초에 오른발을 들며 마지막에는 다시 양발로 돌아온다. 이 영상은 **생성 데이터의 기구학 미리보기**다. 아직 모터나 균형 정책이 로봇을 움직인 결과가 아니다. [실제 입력](data/generation_inputs.json).

## 셀 2 — G1 자세를 작은 Microban에 맞춘다

G1과 19관절 Microban은 팔다리 길이·관절 축·관절 수가 다르다. 생성한2–5초의 한발 홀드91프레임 중앙값을 관절 대응으로 옮기고, 왼발 면을 평평하게 놓으며 무게중심을 그 발 위에 맞추는 IK를 수행했다. 들어 올린 오른발과 몸통·다리가 서로 부딪히지 않도록 다리 굽힘과 벌림도 조정했다.

CSV를 Microban의 중립 관절각에 대응시키기 위해 G1의 고정 rest 회전을 분리하는 변환을 적용했다. G1 원본 영상에는 원래 CSV를, Microban 리타기팅에는 변환 CSV를 사용했다. 전환 제어는 양발 기본 자세에서 체중을 옮기고 오른발을 드는 순서로 구성했다. **G1 영상의 모든 프레임을 그대로 복사하는 학습은 아니다.**

실행 셀:

```bash
.venv/bin/python scripts/one_leg_text_reference.py \
  --source data/kimodo_text_oneleg/oneleg_text_00_mujoco_rest_zero.csv \
  --request data/kimodo_text_oneleg/request.json \
  --lift-scale 2.8 --stance-knee .3 --arm-abduction .25 \
  --lift-abduction .18 --output runs/one_leg_text_reference_reproduced
```

출력:

```text
support: left
right-foot FK clearance: 44.56 mm
joint-limit violation: 0
self-collision penetration: 0
reference.json
```

이 참조는 정책이 따라갈 홀드 목표와 중력 보상용 모터 목표를 담는다. 이후 시뮬레이션에서는 초기 reset 뒤 몸통 위치를 다시 써서 세우지 않는다. [사용한 참조](evidence/one_leg_text_policy_reference.json).

## 셀 3 — 실제 물리에서 PPO 정책을 학습한다

정책은 현재 상태70개를 보고 모터 목표 보정19개를 출력한다. 관절 모방, 몸통 자세, 무게중심, 발 간격, 실제 바닥 접촉을 보상으로 사용한다. 잘못된 자세와 낙상에는 벌점을 준다. PPO는 이 실제 행동·보상 기록으로 신경망을 업데이트한다. [PPO 논문](https://arxiv.org/abs/1707.06347).

안정화에 필요한 선형 물리 피드백을 초기화하고 신경망 잔차를 학습했다. 새 문장 참조로 native MuJoCo에서460회 PPO를 먼저 수행한 뒤, 그 정책에서 MuJoCo-Warp GPU PPO120회를 이어서 수행했다. GPU 단계에서는 선형 균형 피드백을 고정하고 신경망 잔차·가치 함수·탐색 분산을 업데이트했다. [MuJoCo-Warp 공식 문서](https://mujoco.readthedocs.io/en/stable/mjwarp/index.html).

실제 GPU 실행 셀:

```bash
.venv/bin/python scripts/one_leg_warp_run.py train \
  --checkpoint runs/one_leg_text_robust_ppo_v3/policy_final.pt \
  --reference runs/one_leg_text_reference_v3/reference.json \
  --n 64 --iterations 120 --seed 74101 --learning-rate .00003 \
  --output runs/one_leg_text_warp_ppo_reproduced
```

출력:

```text
actual GPU PPO updates: 120
actual GPU rollout transitions: 245,760
elapsed training: 56.29 seconds
residual parameter change L2: 0.17680
frozen balance parameter change: 0
policy_final.pt
```

전체는 native460+GPU120=580회 업데이트,952,320 transition이다. 위 시간은 GPU 학습 구간이며 모델 컴파일·생성·영상 렌더 시간은 포함하지 않는다. GPU 모델의 수치 정밀도는 float32이며 별도 native MuJoCo에서도 같은 최종 정책을 다시 검증했다.

실제 로봇 모델은 질량약0.81891 kg, position gain0.277, 토크 상한±0.77 N·m를 사용한다. 물리 주기는2 ms, 정책 주기는20 ms다. 몸통의 자유 관절과 원래 접촉 형상을 유지한다. 이 결과는 이상적 토크 제한 액추에이터의 시뮬레이션이며 하드웨어 시험 결과는 아니다.

## 셀 4 — 몸통을 밀어도 유지하는지 확인한다

새 초기 상태64개에 관절·몸통 자세 오차를 넣고18초씩 실행했다. 4·8·12초 부근에 몸통 질량 중심을 **1 N으로100 ms씩 세 번** 밀었다. 발생 시각은±0.7초, 방향은0–2π에서 무작위로 바뀐다. 각 힘의 충격량은0.1 N·s다. 수직 보조력이나 몸통을 세우는 외부 토크는 사용하지 않는다.

GPU 평가 셀:

```bash
.venv/bin/python scripts/one_leg_warp_run.py evaluate \
  --checkpoint runs/one_leg_text_warp_ppo_v1/policy_final.pt \
  --reference runs/one_leg_text_reference_v3/reference.json \
  --n 64 --seed 74201 --push 1 --push-mode random --push-jitter .7 \
  --output runs/one_leg_gpu_eval_reproduced
```

같은 정책의 native 확인 셀:

```bash
.venv/bin/python scripts/one_leg_run.py evaluate \
  --checkpoint runs/one_leg_text_warp_ppo_v1/policy_final.pt \
  --reference runs/one_leg_text_reference_v3/reference.json --transition \
  --n 64 --seed 74201 --duration 18 --perturb .006 \
  --push 1 --push-mode random --push-jitter .7 \
  --output runs/one_leg_native_eval_reproduced
```

| 최종 정책 평가 | 성공 | 가장 짧은 연속 한발 지지 | 오른발 간격 최솟값 |
|---|---:|---:|---:|
| 실제 MuJoCo-Warp GPU,64회 | 64/64 | 15.96초 | 15.04 mm |
| 같은 정책 native MuJoCo,64회 | 64/64 | 15.98초 | 15.08 mm |

성공은 왼발에 실제 수직 하중이 실리고, 오른발·다른 부위는 바닥을 지지하지 않으며, 오른발이1 cm 이상 떠 있는 상태를 최소10초 연속 유지하고 낙상하지 않는 것이다. 각 밀기 뒤3초 안에1초 연속 단일 지지로 회복해야 한다. 관측한64/64는 이 초기 상태·지면·힘 범위에서의 결과다.

마지막 영상은 **최종 정책이 실제 MuJoCo-Warp에서 움직인18초 rollout**이다. CPU 렌더러는 GPU의 현재 상태를 읽어 화면으로 그리기만 한다. 생성 모션 미리보기와 달리 중력·모터·마찰·접촉이 자세를 결정한다.


## 별도 실험 — 외란 학습 전·후 비교

교육 페이지에는 기존 두 정책의 비교 영상도 복원했다. 두 정책은 **이전 숫자 조건 참조**로 학습한 native MuJoCo 정책이며, 위 문장 기반 GPU 정책과는 별도 실험이다. 양쪽은 동일한 seed 46007, 초기 관절각·속도, 무작위 방향의 1 N·100 ms 밀기 세 번을 사용한다.

“외란 없는 환경에서 학습”은 외부 밀기 없이 학습한 정책이다. 초기 상태 오차는 사용했다. 이 영상에서는 8.66초에 넘어졌다. “외란 학습 + 균형 보정”은 외란을 적용한 PPO 학습과 수동으로 선택한 균형 피드백 계수 −2를 함께 적용했으며, 이후 PPO 120회를 추가했다. 이 영상은 18초 시험을 통과하고 16초 연속 한 발 지지를 유지했다. 개선을 PPO만의 효과로 해석하지 않는다.

두 압축 영상은 원본의 50 Hz·900프레임·18초를 유지한다. [동일 초기 상태·외력과 실제 모터·접촉 검증](data/paired_random_video_audit.json), [전 정책의 학습 설정](evidence/oneleg_comparison_before_training.json), [후 정책의 학습 설정](evidence/oneleg_comparison_after_training.json).
