# TASK-015UI11A: Riot Production API 신청용 UI 완성 마스터 플랜

## Status

READY (계획 문서 — 사람/GPT 검토 대기)

## Goal

Riot Production API 신청 전에, GameProbe 프로필/경기 상세 페이지 전체를 **실제
운영 가능한 VALORANT 전적 분석 서비스처럼 보이게** 만들기 위한 **UI 완성 마스터
플랜(UI11 계열)**을 확정한다. 이 문서는 UI11 전체 작업의 단일 기준이며, 개별
구현(UI11B~)은 이 플랜에서 승인된 순서로만 진행한다.

이 Task의 산출물은 **계획·문서**다. 제품 코드를 수정하지 않는다.

## Background

- UI8A·UI8B·UI9A로 정보 구조를 재정렬하고, UI10A로 배포 식별용 UI Build 배지와
  레퍼런스 감사·가드레일 문서를 고정했다(HEAD `520f8fa`, push 완료).
- 기준 문서가 준비됐다: `docs/ui-reference-audit.md`(7영역 비교표),
  `docs/ui-design-guardrails.md`(가져올 것/가져오지 않을 것/표절 방지/데이터
  없는 UI 금지/자산·Mock Stop).
- UI9B/UI9C/UI9D는 신규 자산·Mock이 필요해 PENDING-DECISION으로 보류돼 있었다.
  이 마스터 플랜에서 **개별 UI9 Task로 직접 착수하지 않고** UI11 작업 안의 자산/
  Mock 결정 입력으로 재분류한다.

## Final Purpose

**Riot API 심사자가 봤을 때 "이 서비스는 실제 전적/분석 플랫폼으로 운영될
준비가 되어 있다"고 납득할 수 있는 전적 페이지 완성.** 지금은 GameProbe 고유
차별화 기능을 크게 구현하는 단계가 아니라, 익숙한 전적 사이트(OP.GG/Tracker.gg)
정보 구조를 참고해 **전체 페이지 완성도·신뢰도**를 끌어올리는 단계다.

## Current Problem

- 정보 구조는 재정렬됐으나, 페이지가 아직 "운영 중인 전적 서비스"의 완성도(밀도·
  일관성·신뢰 신호)에는 못 미친다.
- 스코어보드 요원 placeholder(3/10 실 PNG), 역할 아이콘 부재, 라운드 이벤트
  데이터 부재, 분석 탭 예시값 등 **데이터/에셋 결손**이 완성도를 떨어뜨린다.
- 어떤 결손을 신청 전에 메우고, 어떤 것을 승인 후로 미룰지 기준이 단일 플랜으로
  고정돼 있지 않다.

## Strategy

1. **신청 전(Before API Approval)**: 신규 외부 자산·신규 Mock 결정 없이 **기존
   데이터·에셋만으로 완성도를 높일 수 있는 영역**부터 정리한다. 정보 위계,
   승패/자기 행 강조, 카드 문법 통일, 반응형, 빈 상태 처리 등.
2. **결정 게이트**: 요원 7종 PNG, 역할 아이콘, 라운드 이벤트 Mock처럼 **자산/
   Mock이 필요한 부분**은 가드레일의 Stop Condition에 따라 멈추고 사람 결정을
   받는다. 결정 전에는 placeholder를 "데이터 없음"으로 정직하게 표시한다.
3. **승인 후(After API Approval)**: 실데이터·차별화 분석은 실 API/RSO/통계 단계로
   미룬다.
4. 모든 UI11 Task는 `ui-reference-audit.md`·`ui-design-guardrails.md`를 함께
   확인하고, 표절 기준과 "데이터 없는 UI 금지" 기준을 우선 적용한다.

## Reference Direction

- 참고는 **정보 구조·배치·읽기 흐름**까지로 한정한다. 색/타이포/그래픽/레이아웃
  픽셀 복제는 금지(가드레일 2·3장). GameProbe 자체 디자인 언어로 재해석한다.
- 화면을 나란히 놓아 레퍼런스 스크린샷으로 오인되지 않아야 한다.

## What to Follow Before API Approval

기존 데이터/에셋으로 가능하므로 신청 전에 따라간다:

- 프로필 상단: 핵심 KPI(승률·KD·HS%) 한 줄 요약, 시즌/큐 필터 위치, 갱신 시각
  표기(단, timestamp 출처가 신규 Mock이면 결정 게이트).
- 최근 경기 리스트: 승패 컬러 바, 핵심 지표 압축, 행 스캔성.
- 스코어보드: 팀 구분 헤더, 자기 행 하이라이트, 기존 컬럼 재정렬(새 컬럼 신설
  금지).
- 라운드/성과: UI8B 타임라인 유지, 성과 지표의 비교 맥락 표현(표본 없는 단정
  금지), 분석 탭 예시값은 Mock Preview임을 명시 유지.
- 전체: 카드 문법 통일, 반응형, 빈/부분 데이터 상태 처리, UI Build 배지 유지.

## What to Defer Until After API Approval

- 실데이터 연동(실 전적/타임라인/요원 통계) — 실 API/RSO(Phase 4).
- 통계 기반 차별화 분석·기준 비교·AI 설명 — 표본 확보 후(Phase 5).
- 데이터가 없는 신규 지표/이벤트(라운드 첫 킬·클러치·무기 Head/Body/Legs)를
  실값으로 보여주는 것 — 실데이터 단계.
- GameProbe 고유 차별화 기능 강화.

## Proposed UI11 Task Breakdown

> 순서는 "위→아래 읽기 흐름 + 자산/Mock 결정 게이트"를 함께 고려한 제안이다.
> 자산/Mock이 필요한 항목은 사람 결정 전까지 placeholder를 정직하게 유지한다.

- **UI11A** (이 문서): API 신청용 UI 완성 마스터 플랜 확정. (계획)
- **UI11B**: 프로필 상단/요약 영역 정리 — 헤더 KPI 요약·필터·갱신 표기. 기존
  데이터만. (자산/Mock 불필요 — 갱신 timestamp가 Mock 필요 시 그 부분만 게이트)
- **UI11C**: 최근 경기 리스트 정리 — 승패 강조·지표 압축·스캔성. 기존 데이터만.
  (자산/Mock 불필요. 요원 아이콘 정렬은 기존 에셋 한계 내)
- **UI11D**: 경기 상세 스코어보드 정리 — 팀 구분·자기 행 하이라이트·컬럼 정렬.
  (디자인은 자산 불필요 / 요원 placeholder 제거는 **UI9B 자산 결정** 게이트)
- **UI11E**: 라운드 상세·성과·분석 정리 — UI8B 타임라인 유지·성과 비교 맥락.
  (라운드 이벤트 표시는 **UI9C Mock 결정** 게이트 / 분석은 예시값 명시 유지)
- **UI11F**: 사이드바 요원/무기/맵/역할군 정리 — 모스트 카드 정보 구성.
  (역할 아이콘·요원 PNG·무기 분포는 **UI9B/UI9D 자산·Mock 결정** 게이트)
- **UI11G**: 전체 반응형·마감·신청 전 점검 — 일관성·빈 상태·접근성·배지 최종 점검.

**UI9B/UI9C/UI9D 재분류**: 독립 착수 Task가 아니라, 위 UI11D(요원 자산)·
UI11E(라운드 이벤트 Mock)·UI11F(역할 아이콘/무기 분포)의 **자산·Mock 결정
입력**으로 흡수한다. 해당 결정이 승인되어야 그 부분 구현이 열린다.

## Allowed Changes

문서만:
- `docs/tasks/TASK-015UI11A.md` (이 문서)
- `docs/PLAN.md` (UI11 계열 추가·UI9B/C/D 재분류·Phase 목표 명확화)
- `docs/PROGRESS.md` (로그)
- `.agent-reports/CURRENT.md` (`## Claude Plan` + 공통 상태 스냅샷)
- (필요 시) `docs/ui-reference-audit.md`, `docs/ui-design-guardrails.md` 참조 정합성
  보정

## Forbidden Changes

- 모든 제품 코드: `frontend/`, `backend/`, `docker/`, `scripts/`.
- 신규 외부 자산·`public/assets`·`SOURCES.md` 변경.
- 신규 Mock 데이터/필드·`frontend/src/data`·`frontend/src/types`·`asset-map`·
  `score-gameprobe` 변경.
- 신규 npm 패키지·`package.json`/lockfile 변경.
- UI11B 이후 구현 착수.
- Git add/commit/push.

## Acceptance Criteria

1. 이 문서가 Final Purpose·Strategy·Reference Direction·신청 전/후 분리·UI11
   Task 분할을 포함한다.
2. UI11 작업 분할(UI11A~UI11G)이 단일 목적(API 신청용 전적 페이지 완성)으로
   정렬되고, 각 Task의 자산/Mock 결정 게이트가 표시된다.
3. UI9B/UI9C/UI9D가 독립 착수가 아니라 UI11 안의 결정 입력으로 재분류됨이
   문서에 명시된다.
4. `PLAN.md`가 UI10A 완료 이후 다음 단계=UI11A, UI11 분할, 신청 전 완성/승인 후
   차별화 분리를 반영한다.
5. 제품 코드·자산·Mock·패키지 변경이 전혀 없다(문서만).

## Verification Commands

```bash
# 문서만 변경됐는지 확인 (frontend/backend/docker/scripts 미변경)
git status --porcelain -- frontend backend docker scripts
# 신규 자산/Mock/패키지 미변경 확인
git status --porcelain -- frontend/public/assets frontend/src/data frontend/src/types frontend/package.json frontend/package-lock.json
# UI11A 핵심 섹션 존재 확인
grep -nE "^## (Final Purpose|Strategy|Proposed UI11 Task Breakdown|What to Defer Until After API Approval)" docs/tasks/TASK-015UI11A.md
git diff --check
```

## Stop Conditions

- UI11 정리 과정에서 신규 자산/Mock/타입/패키지가 필요해지면(가드레일 5장 Stop
  Condition) 즉시 멈추고 사람 결정을 요청한다. 임의 생성하지 않는다.
- 이 Task에서 제품 코드를 수정해야 하는 상황이 되면 중단한다(UI11A는 계획 전용).
- 같은 검증 실패가 3회 반복되면 `BLOCKED`로 보고하고 중단한다.

## Human Decisions

- UI11 Task 분할·순서를 이대로 확정할지, 조정할지.
- 신청 전 완성 범위에 "갱신 시각 표기"를 포함할지(필요 timestamp가 신규 Mock이면
  PENDING-DECISION).
- UI9B(요원 7종 PNG 자산), UI9C(라운드 이벤트 Mock), UI9D(역할 아이콘·무기 분포)의
  자산/Mock 취득·출처·라이선스 승인 — 각각 UI11D/UI11E/UI11F를 여는 게이트.
- 승인 후 차별화 기능을 어느 Phase로 둘지(Phase 4 실 API / Phase 5 분석) 최종 확인.

## Codex Implementation Notes

(UI11A는 계획 문서다. Codex 구현 대상은 사람이 승인한 첫 UI11 구현 Task(UI11B
등)부터다. 이 섹션은 그 Task 문서에서 사용한다.)

## Cursor Review Notes

(이 문서의 계획 정합성 리뷰 또는 후속 UI11 구현 Task 리뷰 시 Cursor가 기록.)
