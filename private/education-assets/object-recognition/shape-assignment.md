# 형상 박스 디텍션 과제

Fruits-360 없이 cube, octahedron, dodecahedron, icosahedron 4종을 찾습니다. BlenderProc의 3D 물체에 COCO 실사 배경을 무작위로 합성합니다. 회전·크기·카메라·조명·물체 색과 거칠기도 바뀝니다. 각 장면에는 한 물체가 들어갑니다. 과일 면 인식과 마스크 학습은 없습니다.

회차 루트(`lessons/01-synthetic-data`)에서 새 환경을 설치하고 실행합니다.

```bash
source steps/01-environment.sh
python perception/generation/scripts/download_coco2017_backgrounds.py --split val2017 --output perception/generation/datasets/backgrounds/coco2017 --cache perception/generation/datasets/_downloads
python scripts/shape_detection.py generate --per-class 100
python scripts/shape_detection.py train --epochs 30
```

- 형상별 총 100장: 학습 80·검증 10·시험 10장. 총 400장, 320×320, CPU 렌더 worker 1·thread 6 (`--render-threads`로 변경 가능)·samples 4.
- `datasets/shapes100/manifest.json`에 클래스·분리·장면 seed·이미지 SHA256·생성 시간을 기록합니다. 정답은 한 장당 한 bbox인지 검사하며 중복 이미지와 누락 파일을 거부합니다.
- `yolo26n.pt` 사전학습 가중치를 처음 실행할 때 내려받아 CPU로 미세조정합니다. 입력 320px, batch 8, workers 0, AdamW, 30 epoch. 기존 두 모델 smoke 실습은 `yolo26s-seg.yaml`에서 1 epoch 새로 학습하므로 점수를 직접 비교하는 설정은 아닙니다.
- COCO val2017의 5,000장 중 CC BY / CC BY-SA 사진을 사용합니다. COCO 자체의 원래 train/val 이름과 이번 과제의 데이터 분리는 별개입니다. 출처·사진별 라이선스·SHA256을 `backgrounds-manifest.json`에 기록하며 사진의 SHA256 기준으로 겹치지 않는 배경 풀을 만듭니다. `arena_background_ratio`는 0이며 경기장 배경은 사용하지 않습니다.
- train/val/test는 장면별로 분리합니다. 장면 ID의 마지막 자리 0은 val, 1은 test, 나머지는 train입니다. 형상별 ID 간격 100000과 같은 seed를 유지하면 N=100의 장면이 N=1000에 포함됩니다. 배경 풀도 같은 분리에 맞춰 고릅니다. best.pt는 검증으로 선택하고 시험은 학습 종료 후 한 번 평가합니다. 시험 자료를 보고 epoch나 설정을 바꾸면 최종 성능 추정이 편향됩니다.
- `runs/perception/shapes100_detect/benchmark.json`에 실제 학습·시험 시간, epoch별 시간, 클래스별 precision/recall/mAP를 기록합니다.
- 이전 경기장 배경의 데이터셋을 현재 코드로 다시 학습하지 않습니다. COCO 데이터는 새 출력 폴더에서 생성해야 하며, 학습 스크립트도 이전 배경 manifest를 거부합니다.
- 새 실험은 `--output datasets/shapes100_v2`, `--name shapes100_detect_v2`처럼 이름을 바꿉니다. 기존 출력을 덮어쓰지 않습니다.
- 이 시험은 한 물체가 있는 합성 장면입니다. 실물 카메라·복수 물체·가림·목표 없는 장면의 성능은 별도 시험이 필요합니다. 실제 과제에서는 그런 사진도 별도 모아 평가하세요.
- 원본 코드 MIT, Ultralytics와 파생 가중치 AGPL-3.0 조건을 유지합니다. COCO 배경 사진의 개별 CC BY / CC BY-SA 출처와 변경 고지를 함께 보존합니다. Fruits-360은 사용하지 않습니다.

측정 결과와 발견한 문제는 회차의 `CPU_VALIDATION.md`에 정리합니다. 실제 CPU/GPU 생성·학습·시험을 완료한 예제입니다.

## GPU로 형상별 1,000장 생성·학습하기

CPU 환경과 별도의 GPU 가상환경을 사용합니다. 아래 CUDA 12.8 wheel은 이번 RTX 2080 Ti 시험에서 사용한 환경입니다.

```bash
python3.11 -m venv .venv-shapes-gpu
source .venv-shapes-gpu/bin/activate
python -m pip install torch==2.10.0 torchvision==0.25.0 --index-url https://download.pytorch.org/whl/cu128
python -m pip install -r perception/generation/requirements.txt
python -c 'import torch; assert torch.cuda.is_available(); print(torch.cuda.get_device_name(0))'
python scripts/shape_detection.py generate \
  --per-class 1000 --seed 41000000 --output datasets/shapes1000_gpu \
  --render-device gpu --gpu-device-type OPTIX --render-workers 4
python scripts/shape_detection.py train \
  --output datasets/shapes1000_gpu --device 0 --epochs 30 \
  --name shapes1000_gpu_detect
```

총 4,000장을 형상별 학습 800·검증 100·시험 100장으로 나눕니다. 4개 생성 프로세스의 raw 경로와 장면 번호는 서로 다릅니다. VRAM이 작은 장비는 `--render-workers 1` 또는 `2`로 줄일 수 있습니다. GPU를 찾지 못하면 CPU로 조용히 전환하지 않고 오류로 중단합니다. 사진 렌더는 GPU를 사용하며 재료 준비·정답 검사·파일 저장에는 CPU가 사용됩니다.

시험 결과의 P/R, mAP50, mAP90과 mAP50–95를 `benchmark.json`에 저장합니다. mAP90은 IoU 0.90에서의 클래스별 AP 평균입니다. Ultralytics의 `all_ap`가 사용하는 IoU 0.50/0.55/…/0.95 중 0.90 열을 읽습니다. `val(iou=0.90)`의 NMS 설정을 mAP90으로 해석하지 않습니다. 모든 IoU별 AP를 함께 저장해 계산을 확인할 수 있습니다.

## 같은 시험셋으로 데이터 크기 비교하기

두 생성 명령에서 같은 seed를 사용하고 N=1000의 시험셋 400장을 공통 평가에 사용합니다. N=100 모델도 새 출력/실험 이름으로 학습합니다.

```bash
python scripts/shape_detection.py train \
  --output datasets/shapes100 --epochs 30 --name shapes100_common_test \
  --test-data datasets/shapes1000_gpu/data.yaml
```

형상별 N은 생성 장수입니다. N=100의 학습 장수는 형상별 80장, N=1000은 800장입니다. 학습/검증에서 사용한 장면 ID가 공통 시험에 있으면 스크립트가 중단됩니다. 시험 결과를 보고 설정이나 epoch를 바꾸지 않습니다.
