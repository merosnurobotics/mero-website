---
lang: ko
theme: shadcn
template: doc
title: Python과 가상환경 · 그림으로 이해하기
---

## interpreter-packages | 코드가 패키지를 찾는 경로

```flow LR
실행 명령 -> Python 실행기
Python 실행기 -> 환경의 패키지: import
환경의 패키지 -> 프로그램 동작
```

설치한 패키지와 실행하는 Python이 같은 환경에 속하는지 확인하세요.

## isolation | 프로젝트별 도구함의 경계

```tree
개발 컴퓨터
  프로젝트 A 환경
    Python·패키지 A
  프로젝트 B 환경
    Python·패키지 B
```

운영체제와 GPU 드라이버는 이 가상환경 바깥의 조건입니다.

## verify-small | 작은 실행으로 실패 위치 찾기

| 단계 | 확인 | 실패하면 볼 곳 |
|---|---|---|
| 실행기 | 경로·버전 | 환경 선택 |
| import | 패키지 읽기 | 설치 대상 |
| 샘플 처리 | 실제 기능 | 의존성·입력 |
| 결과 확인 | 기대 출력 | 경로·계산 조건 |
