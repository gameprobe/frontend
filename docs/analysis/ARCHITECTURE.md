# ARCHITECTURE.md (분석 시스템) - docs/analysis

## 문서 목적

`docs/ARCHITECTURE.md`(메인)의 `stats`/`analysis` 모듈(Phase 5)을
`CYPHER_ASCENT_B_MVP.md` 범위에서 구체화한다. 메인 `docs/ARCHITECTURE.md`와
충돌하지 않으며, Phase 5 상세 설계로 보충한다.

> 2026-10-02: 저장소를 MongoDB로 통일하는 결정에 맞춘 **미구현 분석 설계안**이다.
> 현재 라인업 저장 구현과 구분하며, 아래 작업 큐·워커·컬렉션은 아직 구현하지 않았다.

## 전체 데이터 흐름

```
[Riot 공식 API]
   │ (랭커 명단 + 경기 데이터 수집)
   ▼
raw_matches / raw_players  ── 원본 계층 (DATA_MODEL.md)
   │
   ▼
processed_match_participants / processed_round_events  ── 가공 계층
   │
   ▼
benchmark_stats (Radiant 전체 / Immortal 3 상위 구간, Cypher/Ascent/Defense/B)
   │                                                      ── 기준 통계 계층
   ▼ (사용자 요청 시)
analysis_jobs → 비교/규칙 엔진 → analysis_results
   │
   ▼
AI 설명 생성 (근거 설명/우선순위/행동 지침) → 사용자
```

## 모듈 매핑 (메인 ARCHITECTURE.md 정합)

메인 `docs/ARCHITECTURE.md`의 `stats/`, `analysis/` 모듈 구조를 따른다:

```
stats/
├── application/
│   ├── collector/     # raw_matches, raw_players, ranker_roster 수집
│   └── aggregator/     # processed_* 생성, benchmark_stats 집계/클러스터링
├── domain/             # zone_definitions, scoring_rule_sets 등 버전 엔티티
└── infrastructure/      # MongoDB 리포지토리 (예정)

analysis/
├── application/
│   ├── comparator/     # 사용자 경기 vs benchmark_stats 비교
│   ├── feedback/        # 비교 결과 → 우선순위 선정, analysis_results 생성
│   └── ai/               # 근거 설명/행동 지침 자연어 생성
├── domain/               # analysis_jobs, analysis_results,
│                         # feedback_reactions, analysis_qa_reviews
└── infrastructure/
```

## 분석 작업 큐 (MongoDB 기반 제안·미구현)

- 별도 메시지 브로커 없이 `analysis_jobs` 컬렉션을 사용하는 안을 검토한다.
  Phase 5 구현 전에 처리량·재시도·중복 방지 요구를 확인하고 확정한다.
- 워커가 작업을 가져갈 때는 조건부 원자적 갱신으로 `pending` → `processing`을
  선점하는 방식을 제안한다. 별도 조회 후 갱신하는 방식은 동시 선점 위험이 있다.
- 작업 소유자·선점 만료 시각·재시도 횟수, 만료 작업 회수, 결과 중복 방지와
  상태/예약 시각 인덱스를 함께 설계해야 한다. 현재 구현되거나 검증된 기능은 아니다.
- **단일 경기 분석**: 사용자 요청을 받은 즉시 동기적으로 비교/규칙 엔진을
  실행하고 결과를 반환한다. `analysis_jobs`에는 기록용으로만 적재(상태값은
  즉시 `"completed"`)할 수 있다.
- **10경기/30경기 분석**: `analysis_jobs`에 `"pending"` 상태로 적재 → 워커가
  polling하여 `"processing"`으로 변경 → 처리 완료 후 `analysis_results`
  생성, `analysis_jobs`를 `"completed"`로 갱신.
- 워커는 Backend(Spring Boot) 내부의 스케줄링된 백그라운드 작업(예: 주기적
  polling) 또는 별도 워커 프로세스로 구현할 수 있다. 구체적 구현 방식은
  Phase 5 Task(TASK-033 등) 및 TASK-011D(배포 인프라 결정)에 따라 달라진다.

## 버전 관리 전략

- `zone_definitions`, `scoring_rule_sets`(`DATA_MODEL.md`)는
  `(map/agent/side/site)` 단위로 독립적으로 버전이 올라간다.
- `analysis_jobs` 생성 시점의 `(zone_definition_version,
  scoring_rule_version)`을 스냅샷으로 기록하고, `analysis_results`에도 동일
  버전을 기록한다.
- `benchmark_stats`의 기준 집단은 `map`/`agent`/`side`/`site`/`tier_group`/
  `patch_range` 등 명시적 식별 조건으로 구분된다(`DATA_MODEL.md`
  `benchmark_stats` 참고). `zone_definition_version`/`scoring_rule_version`은
  동일 기준 집단 내에서 규칙/구역 정의가 갱신될 때 새 문서를 구분하는 보조
  식별자이며(기존 문서 유지), 기준 집단 식별 조건을 대신하지 않는다.
- 이를 통해 "어떤 시점의 어떤 규칙/구역 정의로 계산된 결과인지"를 항상
  재현 가능하게 한다.

## 동기/비동기 경계와 사용자 경험

- 단일 경기: 경기 상세 페이지에서 "분석 요청" → 즉시 결과 표시(동기).
- 10/30경기: 분석 요청 → "분석 대기 중" 상태 표시 → 완료 시 결과 조회
  가능(비동기). 알림 방식(폴링/푸시 등)은 Phase 5 Frontend Task 범위.

## 배포/인프라 영향 (TASK-011D 관련 — 새로 식별된 요구사항)

TASK-011D(배포 플랫폼·DB 호스팅 결정, PENDING-006/007)가 고려해야 할 추가
요구사항:

1. **비동기 워커 실행 환경**: 10/30경기 분석을 처리할 백그라운드 워커
   (폴링 또는 스케줄 작업)가 지속적으로 실행될 수 있는 환경이 필요하다.
   순수 요청-응답형 서버리스(요청이 없으면 완전히 종료되는 형태)만으로는
   폴링 워커를 상시 구동하기 어렵다 — 배포 플랫폼이 백그라운드 프로세스/
   스케줄러(cron 등)를 지원하는지 확인 필요.
2. **MongoDB 연결**: `analysis_jobs` polling의 추가 조회·갱신 부하를 고려해
   드라이버 연결 풀, 조회 인덱스, 폴링 주기와 워커 수를 설계해야 한다.
   실제 호스팅 자원 한도에서 부하 검증이 필요하다.
3. **수집(Collector) 작업의 실행 주기**: 랭커 명단·경기 데이터 수집
   (`raw_matches`/`raw_players`)도 주기적 실행이 필요하다 — 위 워커와 같은
   실행 환경 요구사항을 공유한다.
4. **장기 보관 스토리지**: `analysis_results`가 버전별로 누적되므로(삭제
   없음), DB 스토리지 증가를 PENDING-007 호스팅 선택 시 고려 항목으로
   추가한다.

이 항목들은 TASK-011D의 결정 자체를 바꾸기 위한 것이 아니라, **결정 시 고려할
추가 요구사항**으로 기록한다. TASK-011D 문서 수정은 이 작업의 범위 밖이다.

## 확정 사항 vs 검증 필요 사항

**확정**

- 원본 → 가공 → 기준 통계 → 비교/규칙 → AI 설명 흐름
- 단일 경기=동기, 10/30경기=비동기
- `(zone_definition_version, scoring_rule_version)` 스냅샷 기반 재현성
- `benchmark_stats` 기준 집단은 `map`/`agent`/`side`/`site`/`tier_group`/
  `patch_range` 등 명시적 식별 조건으로 구분(버전 필드는 보조 식별자)

**검증 필요**

- MongoDB `analysis_jobs` 큐 제안의 원자적 선점·만료 복구·멱등 처리·인덱스
- 워커 구현 방식(Backend 내부 스케줄러 vs 별도 프로세스) — TASK-011D 결과에
  따라 결정
- polling 주기, 동시 처리량 등 운영 파라미터
