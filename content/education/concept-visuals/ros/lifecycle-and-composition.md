---
lang: ko
theme: shadcn
template: doc
title: 라이프사이클과 컴포지션 · 그림으로 이해하기
---

## lifecycle | 준비와 활성화를 구분하는 상태 흐름

```flow LR
unconfigured -> inactive: configure
inactive -> active: activate
active -> inactive: deactivate
inactive -> unconfigured: cleanup
```

정상 동작의 주요 전이만 표시했습니다. 오류 처리와 종료 전이도 구현에 맞춰 확인합니다.

## composition | 노드의 책임과 프로세스 배치는 별도입니다

```tree
시스템의 한 배치 예
  프로세스 A
    카메라 노드
    전처리 노드
  프로세스 B
    판단 노드
```

같은 책임 구조라도 프로세스 배치는 바꿀 수 있습니다. 효과는 실제 지연과 장애 영향으로 확인합니다.

## recovery-and-measurement | 배치 변경의 효과를 측정하는 기준

| 관점 | 확인할 값 | 놓치기 쉬운 것 |
|---|---|---|
| 성능 | 지연·처리량·메모리 | 복사 감소가 전체 개선인지 |
| 준비 | 실제 데이터·변환 | 프로세스만 켜진 상태 |
| 복구 | 재시작 범위 | 오래된 목표·관측 |
