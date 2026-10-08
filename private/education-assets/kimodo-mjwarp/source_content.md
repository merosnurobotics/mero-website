# 문장 하나에서 한 발 서기 정책까지

이 노트는 **실제 영어 문장으로 만든 Kimodo 모션을 Microban에 맞추고, PPO로 학습한 뒤 MuJoCo-Warp와 native MuJoCo에서 검증한 사례 하나**를 따라간다. 목표는 양발로 시작해 왼발로 전환하고 한 발 서기를 유지하는 것이다.

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
| 접촉 / Contact | 발과 바닥이 맞닿아 몸의 무게를 지지하는 상태 |

## 1. Kimodo에 문장을 넣는다

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

실행 코드:

```bash
vendor/kimodo/.venv/bin/python education/kimodo_official_demo_oneleg.py \
  --output-dir data/kimodo_text_oneleg_reproduced
```

Python 클라이언트로 NVIDIA 공식 공개 데모에 이 문장과 설정을 입력했다.

출력:

```text
Motion generation finished!
oneleg_text_00.npz
oneleg_text_00.csv
180 frames · 30 Hz · 6 seconds
```

공식 데모는 6초짜리 모션을 생성했다. 처음에는 양발로 서고 약2–5초에 오른발을 들며 마지막에는 다시 양발로 돌아온다. 이 영상은 **생성 데이터의 기구학 미리보기**다. 아직 모터나 균형 정책이 로봇을 움직인 결과가 아니다. [실제 입력](data/generation_inputs.json).

## 2. G1 자세를 작은 Microban에 맞춘다

G1과 19관절 Microban은 팔다리 길이·관절 축·관절 수가 다르다. 생성한2–5초의 한발 홀드91프레임 중앙값을 관절 대응으로 옮기고, 왼발 면을 평평하게 놓으며 무게중심을 그 발 위에 맞추는 IK를 수행했다. 들어 올린 오른발과 몸통·다리가 서로 부딪히지 않도록 다리 굽힘과 벌림도 조정했다.

CSV를 Microban의 중립 관절각에 대응시키기 위해 G1의 고정 rest 회전을 분리하는 변환을 적용했다. G1 원본 영상에는 원래 CSV를, Microban 리타기팅에는 변환 CSV를 사용했다. 전환 제어는 양발 기본 자세에서 체중을 옮기고 오른발을 드는 순서로 구성했다. **G1 영상의 모든 프레임을 그대로 복사하는 학습은 아니다.**

실행 코드:

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

## 3. 실제 물리에서 PPO 정책을 학습한다

70차원 Observation에서 19개 관절 목표의 Residual을 출력한다. 관절 모방, 몸통 자세, 무게중심, 발 높이와 실제 바닥 접촉을 Reward로 사용한다. PPO는 실제 행동과 Reward를 모아 신경망을 업데이트한다. [PPO 논문](https://arxiv.org/abs/1707.06347).

해석적 Balance feedback과 초기 신경망에서 시작했다. Balance feedback을 고정하고 신경망 Residual, Value network와 Action distribution을 MuJoCo Warp GPU에서 학습했다. [MuJoCo Warp 공식 문서](https://mujoco.readthedocs.io/en/stable/mjwarp/index.html).

| PPO setting | Value |
|---|---|
| Num environments | 64 GPU |
| Rollout length | 32 steps |
| Policy / Value network | 정책 70 → 64 → 64 → 19 / 가치 70 → 64 → 64 → 1, 은닉층 tanh · 출력층 선형 |
| Residual scale | 0.15 |
| Discount factor γ | 0.995 |
| GAE λ | 0.95 |
| Clip range ε | 0.2 |
| Learning rate | 0.0001 |
| Loss weights | Policy + 0.2 Value − 0.0001 Entropy |
| Updates | 400 |
| Transitions | 819,200 |
| Training seed | 75401 |
| Policy / Physics | 50 Hz / 500 Hz |

GPU 학습은 약 189.96초 동안 실행했다. Residual parameter의 학습 전후 L2 변화는 1.39237이며 Balance feedback의 변화는 0이다. 시간에는 생성과 영상 렌더링을 포함하지 않는다.

Microban 모델은 질량 약 0.81891 kg, Position actuator Kp 0.277, 토크 상한 ±0.77 N·m를 사용한다. 물리 주기는 2 ms, 정책 주기는 20 ms다. 자유 몸통과 접촉 형상을 유지했다.

## 4. 양발에서 왼발로 전환하고 한 발 서기를 유지한다

학습과 다른 Seed 75501로 만든 초기 상태 64개를 18초 동안 실행했다. 양발로 서는 상태에서 체중을 옮기고 오른발을 들어 올렸다. 같은 정책을 MuJoCo Warp GPU와 Native MuJoCo CPU에서 각각 검증했다.

| 실행 환경 | 통과 | 가장 짧은 연속 한 발 지지 |
|---|---:|---:|
| MuJoCo Warp GPU | 64/64 | 16.00초 |
| Native MuJoCo CPU | 64/64 | 16.02초 |

통과하려면 왼발의 실제 접촉 하중으로 10초 이상 연속 한 발 지지를 유지하고 넘어지지 않아야 한다. 오른발은 1 cm 이상 떠 있어야 하며, 오른발과 다른 부위가 바닥을 지지하면 안 된다.

영상은 실제 MuJoCo Warp GPU rollout이다. CPU 렌더러는 적분된 GPU 상태를 읽어 화면으로 그린다. 모터·중력·마찰·접촉으로 움직이는 시뮬레이션 결과다.
