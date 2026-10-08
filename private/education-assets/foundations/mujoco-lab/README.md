# MuJoCo 첫 실행

Python 3.10 이상, CPU만으로 시작합니다. ROS·Jetson·실물 모터는 필요 없습니다.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install mujoco
python run.py --controller none
python run.py --controller p
python run.py --controller pd
python run.py --model inverted --controller pd
```

정진자 PD는 3초 뒤 약 0.000028 rad입니다. 역진자는 2초에 외부 토크를 받아도 다시 위쪽으로 돌아옵니다. `results/*.csv`의 시각·각도·속도·토크를 비교합니다. 패키지 버전에 따라 소수점 끝자리 차이는 있을 수 있습니다.

창을 볼 수 있는 데스크톱에서는 `python run.py --model inverted --controller pd --viewer`를 실행합니다. macOS의 passive viewer는 `mjpython run.py --model inverted --controller pd --viewer`로 실행합니다. 화면 없는 서버에서는 `--viewer`를 빼고 계산과 CSV부터 확인합니다. Viewer를 닫으면 계산도 종료합니다.

XML의 막대 방향이 정진자는 -z, 역진자는 +z이므로 각도 0의 의미도 아래/위로 다릅니다. 이 모델은 고정된 힌지의 근처 제어이며 swing-up·Cart-pole·실물 모터 제어를 포함하지 않습니다.
