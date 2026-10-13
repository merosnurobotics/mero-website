#!/usr/bin/env bash
# MERO 객체인식 입문: 회차 루트(lessons/01-synthetic-data)에서 시작
# 코드 출처·사용 조건: 별도 출처 기록 및 LICENSE
# 같은 터미널에서 01부터 순서대로 source 명령으로 실행
set -e
python3.11 -m venv .venv-perception
source .venv-perception/bin/activate
python -m pip install --upgrade pip
python -m pip install torch==2.10.0 torchvision==0.25.0 --index-url https://download.pytorch.org/whl/cpu
python -m pip install -r perception/generation/requirements.txt
python -c 'from importlib.metadata import version; import torch, torchvision; print({p: version(p) for p in ("torch", "torchvision", "blenderproc", "ultralytics")}); print("CPU torch:", torch.version.cuda is None)'
blenderproc --version
