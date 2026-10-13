> **과거 단일 경기장 배경의 기록입니다.** 현재 교육자료의 기본값은 COCO 실사 배경입니다. 아래 이전 수치를 COCO 실험 성능으로 사용하지 마세요. 새 데이터 생성·검사는 완료했고 모델 학습·CPU 속도 재측정은 진행 중입니다.

# 형상별 1,000장 · GPU 실험 결과

> 문서의 미배포 표현은 실험 당시 상태입니다. 설치 오류와 실행 예제 수정은 이후 공개 교육 코드에 반영하는 변경으로 관리합니다.

RTX 2080 Ti에서 Fruits-360 없는 형상 데이터 4,000장을 생성하고 YOLO26n detector를 30 epoch 학습한 뒤, 남겨 둔 시험 400장에서 P/R/mAP50/mAP90을 측정했습니다. 배포하지 않았습니다.

## 실험 조건

| 항목 | 설정 |
|---|---|
| GPU | NVIDIA GeForce RTX 2080 Ti, VRAM 11GB |
| 생성 | GPU OptiX, 형상별 별도 프로세스 4개, 320×320, samples 4 |
| 데이터 | 큐브·정팔면체·정십이면체·정이십면체, 형상별 총 1,000장 |
| 분리 | 형상별 train 800 / val 100 / test 100; 전체 3,200 / 400 / 400 |
| 장면 | 한 장면 한 물체, 합성 방 배경·회전·조명·카메라 효과 변화, 빈 장면 없음 |
| 초기 모델 | yolo26n.pt 사전학습 가중치에서 새 미세조정; 이전 100장 모델을 이어 학습하지 않음 |
| 학습 | 320px, batch 8, 30 epoch, AdamW lr 0.001, FP32 (amp=False), workers 0 |
| 모델 선택 | validation 점수로 best.pt 선택, 학습 종료 후 test 1회 평가 |
| 데이터 seed | 51000000; 이전 CPU 100장 실험과 다른 seed와 분리 |
| 패키지 | Torch 2.10.0+cu128, torchvision 0.25.0+cu128, Ultralytics 8.4.54, BlenderProc 2.8.0, Blender 4.2.1 |

## 시험 결과

| 형상 | 시험 이미지 / 정답 물체 | Precision | Recall | AP50 | AP90 | AP50–95 |
|---|---:|---:|---:|---:|---:|---:|
| 큐브 | 100 / 100 | 97.75% | 100.00% | 99.43% | 99.43% | 99.13% |
| 정팔면체 | 100 / 100 | 95.20% | 99.14% | 99.36% | 99.36% | 98.23% |
| 정십이면체 | 100 / 100 | 98.02% | 98.89% | 99.06% | 99.00% | 97.34% |
| 정이십면체 | 100 / 100 | 96.24% | 99.00% | 99.35% | 99.35% | 98.87% |
| 전체 평균 | 400 / 400 | 96.80% | 99.26% | **99.30%** | **99.29%** | 98.39% |

AP90은 IoU 0.90에서의 AP입니다. mAP90은 이를 네 클래스에서 평균낸 값입니다. 실제 Ultralytics IoU 벡터 0.50/0.55/…/0.95의 0.90 열을 읽었고, 클래스별 원시 AP와 평균이 일치하는지 검사했습니다. `val(iou=0.90)`처럼 NMS IoU 설정을 바꾸어 계산한 값이 아닙니다.

P/R은 IoU 0.50의 정답 일치 기준과 Ultralytics의 F1 기준 confidence에서 계산한 값이며 고정 confidence=0.25에서 센 정답률은 아닙니다. 단일 클래스 행은 AP, 전체 행은 mAP입니다.

## 이전 실험과 비교

| 실험 | 형상별 총 이미지 | 전체 시험 이미지 | Precision | Recall | mAP50 | mAP90 |
|---|---:|---:|---:|---:|---:|---:|
| 이전 CPU | 100 | 40 | 78.06% | 76.88% | 88.91% | 88.91% |
| 이번 GPU | 1,000 | 400 | 96.80% | 99.26% | 99.30% | 99.29% |

이전 모델의 mAP90은 같은 가중치와 같은 시험 40장으로 추가 계산했고, P/R/mAP50이 이전 결과와 일치하는 것을 확인했습니다.

같은 모델·입력 해상도·epoch·batch 설정을 유지했지만 새 seed와 분리를 사용했습니다. 따라서 동일한 시험셋을 고정해 데이터 양만 바꾼 비교 실험은 아닙니다. 실제 카메라, 여러 물체가 있는 장면, 가림, 목표가 없는 사진의 성능은 별도 평가가 필요합니다.

## 검증과 근거

- 네 렌더 프로세스 모두 `RENDER_DEVICE_AUDIT`에 GPU/OPTIX/RTX 2080 Ti 선택을 기록합니다. GPU가 없으면 CPU로 자동 전환하지 않고 중단하도록 했습니다. 재료 준비·정답 검사·저장에는 CPU도 사용됩니다.
- 이미지 4,000장 모두 읽기·정답 클래스·bbox 범위·장면 seed·형상 provenance 검사를 통과했습니다. SHA256 중복이 없으며 분리별 저장 이미지의 해시도 manifest와 일치합니다.
- CUDA Torch 실제 GPU 행렬 계산과 `pip check` 통과. 별도 GPU venv를 사용했습니다. CPU 실험 환경과 가중치를 덮어쓰지 않았습니다.
- `benchmark.json`에 IoU별 원시 AP, 실행 설정, 패키지 버전, 데이터 manifest·best.pt SHA256을 저장했습니다.

## 재현 명령

CUDA Torch가 설치된 별도 GPU venv를 활성화한 뒤 교육 회차 루트에서 실행합니다.

```bash
python scripts/shape_detection.py generate \
  --per-class 1000 --seed 51000000 --output datasets/shapes1000_gpu \
  --render-device gpu --gpu-device-type OPTIX --render-workers 4
python scripts/shape_detection.py train \
  --output datasets/shapes1000_gpu --device 0 --epochs 30 \
  --name shapes1000_gpu_detect
```

이번 실행 폴더는 `clean/lessons/01-synthetic-data/datasets/shapes1000_gpu_parallel`, 모델은 `clean/lessons/01-synthetic-data/runs/perception/shapes1000_gpu_detect`입니다. 이전 CPU 환경과 보고서를 보존했습니다. 로그·환경 lock·원시 결과는 `/home/user/MERO-validation/2026-10-13/`에 있습니다. 초기 단일 프로세스 생성은 병렬 실행으로 전환하면서 중단했고, 그 일부 출력은 이번 데이터셋·점수에 포함되지 않습니다.
