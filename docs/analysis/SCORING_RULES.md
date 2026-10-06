# SCORING_RULES.md - 분석 규칙 (Cypher/Ascent/Defense/B)

## 문서 목적

`CYPHER_ASCENT_B_MVP.md`에서 정의한 초기 범위에 대해, **모델 학습 없이
통계·클러스터링·규칙 엔진**으로 동작하는 분석 규칙의 설계 원칙과 구조를
정의한다. 구체적인 zone 좌표·규칙 파라미터 값은 이 문서에서 확정하지 않으며,
`scoring_rule_sets`(`DATA_MODEL.md`)의 버전별 데이터로 관리한다.

## 규칙 엔진 원칙

1. **모델 학습 없음**: 초기에는 머신러닝 모델을 학습시키지 않는다. 통계
   집계(평균/중앙값/분포)와 클러스터링(예: 포지셔닝 패턴 그룹화), 명시적
   규칙(조건-결과)만 사용한다.
2. **AI는 계산하지 않는다**: 통계값·클러스터 결과·규칙 판정은 모두 규칙
   엔진/통계 코드가 계산한다. AI는 이미 계산된 결과를 입력으로만 받는다
   (`DEC-004`, `FEEDBACK_POLICY.md`).
3. **검증된 사실만 규칙화한다**: `DATA_LIMITATIONS.md` "확인 필요" 항목은
   실제 Riot API 응답에서 필드 존재가 확인되기 전까지 규칙 입력으로 사용하지
   않는다. `combat_stats`(kills/deaths/assists/ACS), 라운드 승패를 포함한
   모든 지표가 이 원칙의 적용 대상이며, "기본 항목이므로 검증이 필요
   없다"는 예외는 두지 않는다. 검증되지 않은 지표를 사용하는 분석 항목은
   `INSUFFICIENT_DATA`로 처리하거나 비활성화한다.

## 규칙이 평가하는 항목 (예시 — 확정 아님)

아래는 Cypher/Ascent/Defense/B 범위에서 **검토 중인 분석 항목의 예시**이며,
실제 포함 여부는 `DATA_LIMITATIONS.md` 검증 결과와 `zone_definitions` v1
작성 후 확정한다.

| 분석 항목 | 필요 데이터 | 상태 |
|-----------|-------------|------|
| 라운드 결과와 생존/사망 zone의 상관관계 | 사망/생존 시점의 위치(zone) | 검증 필요 |
| 라운드 단계별(초반/중반/후반) zone 점유 패턴 | 시간대별 위치 또는 사망 시각 | 검증 필요 |
| 유틸리티(트랩와이어/사이버 케이지/카메라) 사용 위치 | 능력 사용 이벤트 + 위치 | 검증 필요 |
| 전투 결과(킬/데스/어시스트, ACS) 비교 | combat_stats | 검증 필요 — TASK-006/TASK-010 Mock 데이터에는 필드가 존재하나, 실제 Riot API 응답 필드 존재 여부는 미검증(`DATA_LIMITATIONS.md`) |
| 라운드 승패 자체와의 비교 | round result | 검증 필요 — 실제 Riot API 응답 필드 존재 여부 미검증(`DATA_LIMITATIONS.md`) |

> 위 표의 모든 항목은 실제 Riot API 필드 존재 여부가 확인되기 전까지 "검증
> 필요" 상태이며 **점수 계산(규칙/통계 입력)에 사용할 수 없다.** 위치 기반
> 항목뿐 아니라 combat_stats/라운드 승패와 같은 기본 항목도 동일하게
> 적용된다 — "기본 항목이므로 검증을 생략한다"는 가정을 두지 않는다.
> 검증되지 않은 항목에 대한 분석 요청은 해당 비교 항목을 결과에서 제외하거나
> `INSUFFICIENT_DATA`로 표시한다(메인 `docs/ARCHITECTURE.md` 에러 코드
> `INSUFFICIENT_DATA` 참고).

위치 기반 항목(zone 관련)이 검증 실패할 경우, 1차 규칙은 "전투 결과 + 라운드
승패" 수준의 비-위치 기반 통계로 축소될 수 있다(단, 이 항목들 자체도 위와
같이 별도 검증이 필요하다). 이 경우에도 `CYPHER_ASCENT_B_MVP.md`의
맵/요원/진영/사이트 단위 자체는 유지하되, zone 세분화 없이 "B 사이트 수비
라운드 전체" 단위로 집계한다.

## 클러스터링 방식 (기준 통계 생성)

- 랭커 비교 집단(Radiant 전체, Immortal 3 상위 구간)의 가공 데이터를 입력으로,
  동일 조건(map=Ascent, agent=Cypher, side=Defense, site=B, patch_range)의
  경기들을 군집화해 "전형적인 패턴" 그룹을 식별한다.
- 클러스터링 알고리즘(예: k-means 등) 선택과 입력 피처 정의는 Phase 5
  구현 시점(TASK-030)에 확정한다. 이 문서는 "클러스터링을 사용한다"는
  방침만 확정한다.
- 클러스터 결과는 `benchmark_stats.metrics`에 포함되며, `scoring_rule_version`
  에 귀속된다.
- `benchmark_stats`의 기준 집단 식별 조건은 `map`/`agent`/`side`/`site`/
  `tier_group`/`patch_range`이다(`DATA_MODEL.md` `benchmark_stats` 참고).
  위 표의 "라운드 단계별 zone 점유 패턴"(`round_phase`)과 스파이크 설치
  상태(`spike_state`)는 해당 데이터 가용성이 검증된 이후 추가 식별 조건으로
  활성화될 수 있다 — 활성화 전까지는 식별 조건에 포함하지 않는다.

## 사용자 비교 방식

- 사용자의 단일/복수 경기 데이터를 동일 조건(map/agent/side/site/patch_range)
  의 `benchmark_stats`와 비교한다.
- 비교 결과는 백분위(percentile), 평균과의 편차(z-score 등) 형태로 산출하되,
  구체적인 통계 방법은 TASK-031 구현 시 확정한다.
- 표본 수(`sample_count`)가 기준치 미달인 `benchmark_stats`는 비교에 사용하지
  않는다(`docs/SPEC.md` "충분한 표본 확보" 원칙). 기준치 값은 PENDING.

## AI 역할 한정

AI(자연어 설명 생성)는 아래 세 가지로 한정한다:

1. **근거 설명**: 통계 비교 결과(이미 계산된 percentile/z-score 등)를 사람이
   이해할 수 있는 문장으로 설명한다.
2. **우선순위 선정**: 여러 비교 항목 중 사용자에게 먼저 보여줄 항목의 순서를
   정한다(예: 편차가 큰 항목 우선). 순위를 정하는 기준 자체도 규칙/통계
   기반이며, AI는 그 기준에 따라 항목을 선택·서술한다.
3. **행동 지침 생성**: "다음 경기에서 시도해볼 행동"을 통계 비교 결과에
   근거해 문장으로 제안한다.

AI는 다음을 하지 않는다:

- 통계값/클러스터/percentile을 직접 계산하거나 추정하지 않는다.
- `benchmark_stats`나 `scoring_rule_sets`를 생성·수정하지 않는다.

## 추측 금지 항목

다음은 공식 API로 확인할 수 없으므로, 규칙·AI 설명 어디에서도 단정하지
않는다(`DATA_LIMITATIONS.md`와 연결):

- 플레이어의 의도("왜 그 위치에 있었는지")
- 사운드 인지 여부("발소리를 들었는지")
- 시야/조준 방향에 따른 실제 인지("적을 봤는지")
- 정보 획득 여부("팀원이 콜을 했는지", "미니맵 정보를 봤는지")

규칙/AI 출력은 항상 "관찰된 결과(위치, 결과, 통계 비교)" 수준에서만
서술한다. 예를 들어 "이 위치에서 사망 빈도가 높다"는 가능하지만, "그 위치에서
적의 소리를 듣지 못해 사망했다"는 작성하지 않는다.

## 규칙 버전 관리

- `scoring_rule_sets`(`DATA_MODEL.md`)에 `(agent, map, side, site, version)`
  단위로 규칙 스냅샷을 저장한다.
- 규칙이 변경되면 새 버전을 추가하고, 기존 `analysis_results`는 과거 버전
  그대로 보관한다(재계산 시 새 결과를 별도로 추가).

## 확정 사항 vs 검증 필요 사항

**확정**

- 모델 학습 없음, 통계·클러스터링·규칙 엔진 사용
- AI 역할은 설명/우선순위/행동지침 3가지로 한정
- 추측 금지 4항목(의도/사운드/시선/정보 획득)
- 규칙은 `scoring_rule_sets`로 버전 관리
- `benchmark_stats` 기준 집단 식별 조건은 `map`/`agent`/`side`/`site`/
  `tier_group`/`patch_range`이며, `round_phase`/`spike_state`는 검증 후
  추가 가능한 조건임

**검증 필요**

- zone 기반 분석 항목의 실제 데이터 가용성(`DATA_LIMITATIONS.md`)
- `combat_stats`(kills/deaths/assists/ACS)와 라운드 승패의 실제 Riot API
  필드 존재 여부 — 검증 전까지 점수 계산에 사용 불가(`DATA_LIMITATIONS.md`)
- 클러스터링 알고리즘, 비교 통계 방법(percentile vs z-score 등)의 구체 선택
- 표본 수 기준치(threshold) 값
- `round_phase`/`spike_state`의 실제 데이터 가용성 및 식별 조건 활성화 여부
