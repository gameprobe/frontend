# CYPHER_ASCENT_B_MVP.md - 분석 피드백 초기 MVP 범위

## 문서 목적

이 문서는 `docs/SPEC.md` 4차 목표("상위 랭커 데이터 수집 및 통계 기반 분석")의
**첫 구현 범위(MVP)**를 정의한다. `docs/PLAN.md` Phase 5(TASK-027~034) Task를
세분화하기 전에, 분석 대상·기준 집단·데이터 범위를 먼저 확정해 이후 Task 설계의
근거로 사용한다.

> 이 문서는 설계 문서이며, `docs/PLAN.md`의 Phase 5 Task 정의나 상태,
> 기존 Phase 1/2 Task 상태를 변경하지 않는다.

## 확정된 MVP 분석 범위

| 축 | 값 | 비고 |
|----|----|------|
| 요원 | Cypher | 위치가 명확한 설치형 유틸리티 위주 |
| 맵 | Ascent | |
| 진영 | 수비 (Defense) | |
| 사이트 | B 사이트 | |

이 네 축의 조합을 **"Cypher/Ascent/Defense/B" 분석 단위**라고 부른다. 모든 기준
통계, 분석 규칙, 구역(zone) 정의, 버전 관리는 이 단위를 최소 단위로 시작한다.

## 선정 근거

- Cypher는 트랩와이어/사이버 케이지/카메라 등 **위치가 명확한 설치형
  유틸리티**를 사용하므로, 위치(zone) 기반 분석 규칙을 가장 단순한 형태로
  설계할 수 있다.
- Ascent B 사이트는 진입로가 제한적이고 구조가 비교적 단순해, 초기 zone 정의를
  작은 범위로 시작할 수 있다.
- 수비 진영으로 한정하면 "사전 배치/홀드" 패턴에 분석을 집중할 수 있어, 공격
  진영의 유동적 패턴(추측이 필요한 영역이 더 큼)을 1차 범위에서 제외할 수 있다.

## 범위 밖 (이 MVP에서 다루지 않음)

- Cypher 외 요원, Ascent 외 맵, 공격 진영, B 사이트 외 지역.
- 위 항목 확장은 Cypher/Ascent/Defense/B 단위에서 데이터 모델·규칙·버전 관리
  구조가 검증된 이후, `zone_definitions`/`scoring_rule_sets`에 새 맵/요원
  항목을 추가하는 방식으로 처리한다(`DATA_MODEL.md` 참고). 이 문서는 그
  확장 작업을 정의하지 않는다.
- 실시간/인게임 분석 (Phase 6 Overwolf 영역).

## 랭커 비교 집단

- Radiant 전체
- Immortal 3 상위 구간

각 집단은 별도 `tier_group`으로 식별하며 `benchmark_stats`에서 분리 집계한다
(`DATA_MODEL.md` 참고).

### 검증/정의 필요

- "Immortal 3 상위 구간"의 구체적 정의(예: RR 상위 N%, 리더보드 기준 등)는
  미정 — PENDING.
- 수집 대상 리전(지역)은 미정 — PENDING. 리전별로 랭크 분포와 표본 크기가
  다르므로 Phase 5 착수 전 결정이 필요하다.

## 패치 범위

- 최근 1개 패치 데이터를 우선 사용한다.
- 표본 수가 기준치 미달일 경우 직전 패치를 포함해 최근 2개 패치로 확장한다.
- 표본 수 기준치(threshold) 값은 미정 — PENDING (`SCORING_RULES.md` 참고).

## 데이터 소스

- 초기에는 **Riot 공식 API만 사용**한다 (`docs/SPEC.md` 원칙 "공식 API만
  사용"과 일치).
- 비공식 클라이언트 API, 서드파티 통계 사이트 크롤링 등은 사용하지 않는다.

## 관련 문서

- `DATA_MODEL.md` — 원본/가공/기준 통계 계층과 버전 관리 테이블
- `SCORING_RULES.md` — Cypher/Ascent/Defense/B 분석 규칙
- `FEEDBACK_POLICY.md` — 분석 실행 정책, AI 역할, 피드백 반응
- `DATA_LIMITATIONS.md` — Riot 공식 API 제한사항
- `ARCHITECTURE.md` (이 디렉터리) — 분석 작업 큐, 동기/비동기 처리 구조

## Phase 5 Task와의 관계

`docs/PLAN.md` Phase 5(TASK-027~034)는 아래와 같이 이 문서의 결정을 참고할 수
있다(Task 분해·상태 변경은 별도 작업으로 수행한다):

- TASK-027 (상위 랭커 선정 기준 정의) — 이 문서의 "랭커 비교 집단" 절
- TASK-029 (전적 데이터 정규화 및 저장) — `DATA_MODEL.md` "가공" 계층
- TASK-030 (기준 통계 생성) — `DATA_MODEL.md` "기준 통계" 계층,
  `SCORING_RULES.md`
- TASK-033 (통계 기반 피드백 생성) — `FEEDBACK_POLICY.md`
- TASK-034 (AI 자연어 설명) — `FEEDBACK_POLICY.md` "AI 역할과 한계"
