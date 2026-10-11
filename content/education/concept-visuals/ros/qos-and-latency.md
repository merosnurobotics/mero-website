---
lang: ko
theme: shadcn
template: doc
title: QoS와 데이터 신선도 · 그림으로 이해하기
---

## queue-and-durability | 오래된 프레임은 어디에서 쌓일까요

```flow LR
카메라 -> 수신 큐: 새 프레임
수신 큐 -> 전처리: 대기
전처리 -> 추론
추론 -> 행동 명령
```

입력보다 처리가 느리면 대기가 늘어납니다. 큐를 키워도 계산이 빨라지지는 않습니다.

## compatibility | 발행자의 제공 조건과 구독자의 요구 비교

| 발행자 | 구독자 요구 | Reliability 호환 |
|---|---|---|
| best effort | best effort | 가능 |
| reliable | best effort | 가능 |
| reliable | reliable | 가능 |
| best effort | reliable | 불가 |

이 표는 reliability 항목만 비교합니다. 다른 QoS 정책도 별도로 맞아야 합니다.

## processing-budget | 전체 지연을 나누어 기록하기

```timeline v
측정 | 센서가 값을 만듦 | 관측의 출발 시각
수신 | 메시지가 도착함 | 통신 지연 확인
처리 | 콜백·추론 실행 | 대기와 계산 확인
출력 | 행동 명령 생성 | 관측부터 명령까지 비교
```
