# DATA_MODEL.md - 분석 데이터 모델

## 문서 목적

`CYPHER_ASCENT_B_MVP.md`에서 정의한 초기 범위(Cypher/Ascent/Defense/B)를
기준으로, 분석 시스템의 데이터를 **원본(Raw) → 가공(Processed) → 기준 통계
(Benchmark)** 3계층으로 분리해 정의한다.

> 2026-10-02: MongoDB 저장 방향에 맞춘 **미구현 Phase 5 컬렉션 설계안**이다.
> 실제 컬렉션 생성·워커·저장 코드는 포함하지 않으며, 필드·인덱스·무결성 규칙은
> 구현 시 확정한다. 참조 ID는 DB가 강제하는 외래 키가 아니므로 서비스 검증이 필요하다.

## 계층 분리 원칙

- **원본(Raw)**: Riot 공식 API 응답을 가공 없이 저장한다. append-only이며,
  어떤 분석 단계도 원본을 직접 수정하지 않는다.
- **가공(Processed)**: 원본에서 "확인 가능한 사실"만 추출해 정규화한 데이터.
  zone 태깅 등 분석에 필요한 형태로 변환하되, 추측이 들어간 필드는 만들지
  않는다(`DATA_LIMITATIONS.md` 참고).
- **기준 통계(Benchmark)**: 가공 데이터를 랭커 집단·맵·요원·역할·진영·티어·
  패치 범위 기준으로 집계한 결과. 표본 수와 신뢰도를 함께 저장한다.

각 계층의 데이터는 "구역 정의 버전(`zone_definition_version`)"과 "분석 규칙
버전(`scoring_rule_version`)"을 참조한다. 같은 원본 데이터라도 버전이 다르면
가공/기준 통계 결과가 달라질 수 있다.

## 계층 1: 원본 (Raw)

### raw_matches

- `match_id` (문서 식별자)
- `map`, `mode`, `started_at`, `patch_version`
- `raw_payload` (중첩 문서/배열) — Riot Match-V1 등 API 원본 응답
- `collected_at`
- `source` (예: `"riot_match_v1"`)

### raw_players

- `puuid` (문서 식별자)
- `riot_id` (`game_name`, `tag_line`)
- `raw_payload` (중첩 문서/배열) — Riot Account/MMR API 원본 응답(필드 확인
  필요 — `DATA_LIMITATIONS.md`)
- `collected_at`

### ranker_roster (Phase 5 수집 대상 명단)

- `puuid` (문서 식별자)
- `tier_group` (예: `"radiant_all"`, `"immortal3_top"` —
  `CYPHER_ASCENT_B_MVP.md` 기준)
- `region`
- `tracked_since`
- `last_collected_at`

## 계층 2: 가공 (Processed)

### processed_match_participants

- `id` (문서 식별자)
- `match_id` (참조 ID → `raw_matches`)
- `puuid`
- `agent`, `role`, `team`(공격/수비), `patch_version`
- `combat_stats` (중첩 문서/배열) — kills/deaths/assists/ACS 등. **이 필드들의 실제
  Riot API 응답 존재 여부는 미검증이다(`DATA_LIMITATIONS.md` "확인 필요").**
  현재는 TASK-006/010 Mock 데이터 기준 필드명을 잠정 사용하며, 검증되지
  않은 필드는 분석(`SCORING_RULES.md`)에 사용하지 않는다.
- `zone_definition_version` (참조 ID → `zone_definitions`)
- `scoring_rule_version` (참조 ID → `scoring_rule_sets`)
- `derived_at`

### processed_round_events

- `id` (문서 식별자)
- `match_id`, `round_number`
- `event_type` (예: `"kill"`, `"death"`, `"utility_use"` — "확인됨" 데이터만)
- `puuid`
- `zone_id` (참조 ID → `zone_definitions.zones`, nullable — 위치 데이터 확인
  전까지는 NULL)
- `timestamp_in_round` (확인 필요 — `DATA_LIMITATIONS.md`)
- `raw_event_ref` (원본 추적용)

> `processed_round_events`의 `zone_id`, `timestamp_in_round` 등은 Riot
> API에서 위치/시간 정보 제공이 **확인되기 전까지 NULL로 두거나 필드 자체를
> 보류**한다. 추측으로 채우지 않는다.

## 계층 3: 기준 통계 (Benchmark)

### benchmark_stats

- `benchmark_id` (문서 식별자)
- `map`, `agent`, `role`, `side`, `site`, `tier_group`
- `patch_range` (예: `["25.05"]` 또는 `["25.04","25.05"]` — "최근 1개 패치
  우선, 부족 시 2개")
- `round_phase` (nullable — 라운드 단계별(초반/중반/후반) 식별 조건.
  `SCORING_RULES.md` "라운드 단계별 zone 점유 패턴" 항목의 데이터 가용성이
  검증되어 활성화되기 전까지는 NULL)
- `spike_state` (nullable — 스파이크 설치 전/후 식별 조건. 데이터 가용성이
  검증되기 전까지는 NULL — `DATA_LIMITATIONS.md` "확인 필요" 참고)
- `zone_definition_version`, `scoring_rule_version`
- `sample_count`
- `metrics` (중첩 문서/배열) — 평균/중앙값/분포/클러스터 결과
- `confidence_level`
- `calculated_at`

**기준 집단 식별**: `benchmark_stats`의 기준 집단은 `map`/`agent`/`side`/
`site`/`tier_group`/`patch_range`(및 활성화된 경우 `round_phase`/
`spike_state`) 조합으로 식별한다. `site`는 `CYPHER_ASCENT_B_MVP.md`에서
확정된 MVP 축(B 사이트)을 그대로 반영한 명시적 필드이며,
`zone_definition_version`에 site가 내재되어 있다는 간접 규칙에 의존하지
않는다. `zone_definition_version`/`scoring_rule_version`은 동일 기준 집단에
대해 어떤 구역 정의·분석 규칙 버전으로 계산되었는지를 구분하는 보조
식별자이며, 기준 집단 식별 조건을 대신하지 않는다.

`benchmark_stats`는 `docs/ARCHITECTURE.md` "Phase 5 컬렉션" 절의 동일 이름
컬렉션을 이 분석 설계 기준으로 구체화한 것이다(계층/버전/식별 조건 필드
추가). 메인 설계와의 관계는 다음 "메인 ARCHITECTURE.md과의 관계" 절 참고.

## 메인 ARCHITECTURE.md과의 관계 (Phase 5 컬렉션 매핑)

`docs/ARCHITECTURE.md`(메인) "Phase 5 컬렉션 (예정·미구현)" 절은 Phase 5 데이터
저장을 위한 초기 개념 스케치이며, `ranker_players`, `ranker_match_stats`,
`benchmark_stats`(tier 필드 포함) 3개 컬렉션을 제시한다. 이 문서
(`DATA_MODEL.md`)는 `CYPHER_ASCENT_B_MVP.md` 범위에서 그 개념을 원본/가공/
기준 통계 3계층으로 구체화한 것이며, 다음과 같이 대응한다.

| 메인 `docs/ARCHITECTURE.md` (Phase 5 컬렉션 예정) | 이 문서의 대응 컬렉션 | 관계 |
|---|---|---|
| `ranker_players` | `ranker_roster` | 명칭 구체화. 랭커 명단이라는 역할은 동일하며, 필드는 이 문서 "계층 1: 원본" 기준 |
| `ranker_match_stats` | `processed_match_participants`, `processed_round_events` | 단일 컬렉션 개념을 가공 계층에서 "참가자 단위"와 "라운드 이벤트 단위"로 분리 |
| `benchmark_stats`(`tier` 필드) | `benchmark_stats`(`tier_group` 필드, `site`/`round_phase`/`spike_state` 등 식별 조건 추가) | 동일 컬렉션명 유지, 필드 구체화·추가(`tier` → `tier_group`, 식별 조건 필드 추가) |

### 폐기 여부

- 메인 ARCHITECTURE.md의 위 3개 컬렉션 정의는 **폐기되지 않는다.** 이 문서는
  그 개념을 Cypher/Ascent/Defense/B MVP 범위에서 구현 가능한 수준으로
  **구체화·대체**한 것이다 — 즉, Phase 5 구현 시에는 메인
  ARCHITECTURE.md의 `ranker_players`/`ranker_match_stats`/
  `benchmark_stats(tier)`가 아니라 이 문서의 `ranker_roster`/
  `processed_match_participants` + `processed_round_events`/
  `benchmark_stats(tier_group, site, ...)`를 사용한다.
- 메인 ARCHITECTURE.md의 모듈 구조(`stats/`, `analysis/`)와 모듈 의존성
  규칙은 변경되지 않는다.

### 정본(authoritative) 관계

- **전체 아키텍처(모듈 구조, 의존성 규칙, 배포 구조 등)**: 메인
  `docs/ARCHITECTURE.md`가 정본이다.
- **Phase 5 분석 데이터 모델의 세부 컬렉션/필드/계층/버전 관리**: 이 문서
  (`docs/analysis/DATA_MODEL.md`)와 `docs/analysis/*`의 관련 문서가 정본
  이다.
- 두 문서가 Phase 5 데이터 모델 세부사항에서 충돌하면 이 문서를 따른다.
  메인 문서는 컬렉션 개념안이며, 실제 Phase 5 필드·인덱스는 구현 Task에서 검증한다.

## 버전 관리 컬렉션

### zone_definitions

- `zone_definition_id` (문서 식별자)
- `map` (예: `"Ascent"`)
- `version` (예: `"v1"`)
- `zones` (중첩 문서/배열) — zone 목록과 경계 정의. Cypher/Ascent/B MVP에서는 B 사이트
  관련 zone부터 정의한다.
- `created_at`, `description`

### scoring_rule_sets

- `rule_set_id` (문서 식별자)
- `version`
- `agent`, `map`, `side`, `site` (예: Cypher/Ascent/Defense/B)
- `rules` (중첩 문서/배열) — `SCORING_RULES.md`에서 정의하는 규칙의 버전별 스냅샷
- `created_at`, `description`

분석 결과는 항상 `(zone_definition_version, scoring_rule_version)` 조합을
함께 기록해, 규칙·구역 정의가 바뀌어도 과거 결과를 재현할 수 있다.

## 분석 작업 큐 (MongoDB 제안·미구현)

### analysis_jobs

- `job_id` (문서 식별자)
- `requester_puuid`
- `job_type` (`"single_match"` | `"match_10"` | `"match_30"`)
- `match_ids` (중첩 문서/배열)
- `status` (`"pending"` | `"processing"` | `"completed"` | `"failed"`)
- `zone_definition_version`, `scoring_rule_version` (작업 생성 시점 기준
  스냅샷)
- `created_at`, `started_at`, `completed_at`
- `worker_id`, `lease_expires_at`, `attempt_count` (선점 소유자·만료 복구·재시도용 제안)
- `result_id` (참조 ID → `analysis_results`, nullable)

`"single_match"`은 동기 처리를 우선하며, 큐는 비동기(`"match_10"`,
`"match_30"`)에 사용하는 안이다(`ARCHITECTURE.md` 참고). 워커의 조건부 원자적
갱신으로 선점하고, 만료된 작업 복구와 결과 멱등성을 검증해야 한다. 현재 미구현이다.

## 분석 결과 (장기 보관, 버전별)

### analysis_results

- `result_id` (문서 식별자)
- `job_id` (참조 ID → `analysis_jobs`, nullable — 동기 처리 시에도 결과는 남김)
- `requester_puuid`
- `job_type`, `match_ids`
- `benchmark_refs` (중첩 문서/배열) — 비교에 사용한 `benchmark_stats.benchmark_id`
  목록
- `zone_definition_version`, `scoring_rule_version`
- `result_data` (중첩 문서/배열) — 비교 결과, 우선순위, AI 설명/행동 지침
- `created_at`

동일 경기를 다른 규칙/구역 버전으로 재분석하면 새 `analysis_results` 문서가
추가되며, 기존 문서는 삭제·덮어쓰기하지 않는다("버전별 장기 보관").

## 피드백 반응 / 운영자 품질 관리

### feedback_reactions

- `reaction_id` (문서 식별자)
- `result_id` (참조 ID → `analysis_results`)
- `user_puuid`
- `reaction_type` (`"helpful"` | `"not_helpful"` | `"report"`)
- `comment` (nullable)
- `created_at`

### analysis_qa_reviews

- `review_id` (문서 식별자)
- `result_id` (참조 ID → `analysis_results`)
- `flagged_by` (`"user_report"` | `"operator"`)
- `status` (`"open"` | `"reviewing"` | `"resolved"`)
- `operator_id` (nullable)
- `resolution_notes`
- `created_at`, `reviewed_at`

## 사용자 데이터의 위치

- 사용자 본인의 경기 데이터(`raw_matches`/`processed_*`)는 **비교 대상**으로만
  사용된다.
- `benchmark_stats` 집계 입력(`ranker_roster` 기반 수집 데이터)과 사용자
  요청 경기 데이터는 별도 파이프라인으로 취급하며, 사용자 데이터가
  `benchmark_stats`나 `scoring_rule_sets` 생성에 직접 반영되지 않는다.
- 초기에는 모델 학습을 하지 않으므로 "학습 데이터셋" 개념 자체가 없다
  (`FEEDBACK_POLICY.md` 참고).

## 확정 사항 vs 검증 필요 사항

**확정**

- 원본/가공/기준 통계 3계층 분리
- `zone_definitions`, `scoring_rule_sets` 버전 관리 컬렉션 분리
- `analysis_results` 버전별 누적 보관(삭제/덮어쓰기 없음)
- `feedback_reactions`, `analysis_qa_reviews` 구조
- `benchmark_stats` 기준 집단은 `map`/`agent`/`side`/`site`/`tier_group`/
  `patch_range` 등 명시적 식별 조건으로 구분하며, 버전 필드는 보조 식별자임
- 메인 `docs/ARCHITECTURE.md` Phase 5 컬렉션(`ranker_players`,
  `ranker_match_stats`, `benchmark_stats.tier`)은 폐기되지 않고 이 문서의
  컬렉션로 구체화·대체됨

**검증 필요**

- MongoDB `analysis_jobs` 큐 제안: 동시 선점 방지, 만료 복구, 재시도, 결과 중복 방지

- `processed_round_events`의 위치(zone)·시간 필드가 실제 Riot API에서
  제공되는지(`DATA_LIMITATIONS.md`)
- `raw_players`의 MMR/티어 조회 API 필드(랭커 명단 수집에 필요)
- `combat_stats`(kills/deaths/assists/ACS)와 라운드 승패 결과의 실제 Riot
  API 필드 존재 여부(`DATA_LIMITATIONS.md`)
- `benchmark_stats.round_phase`/`spike_state` 활성화 여부(데이터 가용성
  검증 후 결정)
- 필드명/타입은 Phase 5 구현 시 TASK-029 등에서 확정
