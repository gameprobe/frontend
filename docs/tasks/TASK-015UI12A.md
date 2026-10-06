# TASK-015UI12A: UI12 통합 설계 / IA 골격 확정 (구현 Task 아님)

## Status

READY (통합 설계 Task — 사람/Cursor 검토 대기)

> **성격**: 이 Task는 **코드 구현이 아니다.** 세 agent(Claude/Codex/Cursor)의
> UI12 진단·self-check를 취합해 **단일 합의 골격**을 확정하고, 읽기 흐름 기준
> 구현 Task(UI12B~F)의 범위·순서·게이트·정본 위치를 못 박는 **설계 Task**다.
> 산출물은 문서(`docs/ui12-implementation-plan.md` + 이 문서). 제품 코드 미수정.

## Goal

GameProbe 프로필/전적 페이지를 Riot Production API 신청 전에 **실제 운영 가능한
VALORANT 전적검색/전적분석 서비스**처럼 보이게 만들기 위한 UI12 작업을, **부분
polish가 아니라 PlayerProfile 전체 IA 재설계**로 정의하고, 사용자의 **전적 읽기
흐름** 기준으로 구현 Task를 분할·확정한다.

## Background

- UI11B~G는 영역별 polish·반응형·게이트 준수를 마쳤으나, 세 agent 진단이 공통으로
  "화면이 여전히 전적검색 서비스로 읽히지 않는다"고 결론냈다(경기 리스트 지연,
  KPI 2~3중 중복, 행 과밀, 사이드바 평면 나열, VAL 정체성 약함).
- 원인은 카드 품질이 아니라 **페이지의 주인공이 불명확한 IA**다. 따라서 UI12의
  첫 작업은 CSS polish가 아니라 **레이아웃 재구성**이어야 한다.
- 통합 분석·근거는 `docs/ui12-implementation-plan.md`에 정리. 이 Task는 그 계획을
  실행 Task로 고정한다.

## User Value for Riot API Application

- 심사자가 프로필 진입 즉시 **"최근에 어떻게 했는가"(경기 리스트)**를 보게 되어
  "실제로 쓰는 VALORANT 전적 사이트"로 읽힌다.
- 중복·과밀·비표준 강조(Preview Score)·미완 신호(Mock 배지·비동작 필터)를 줄여
  "운영 중인 서비스" 인상을 준다. 데이터 없는 표현은 정직하게 보류.

## Reference Direction

- OP.GG/Tracker는 **정보 구조·읽기 흐름만** 참고(검색 → 한 줄 요약 → 경기 리스트
  지배 → 상세). 색/타이포/레이아웃 픽셀 복제 금지(가드레일 1·3장).
- VALORANT 정체성(요원·맵·역할·라운드 누적 스코어·endType)을 **데이터 있는 범위**
  에서 드러낸다. LoL식 랭크 대시보드(Career/RankHistory/장문 sidebar 우선)로 읽히지
  않게 한다.

## 합의된 IA 골격 (UI12 공통 기준)

```
[masthead]  정체성 · 현재 티어+RR · 시즌 핵심 KPI 한 줄(정본) · 전역 Mock 고지 1개
[control ]  필터(축소·리스트 컨텍스트) 
[workspace] main = 최근 경기 리스트(HERO) → 선택 경기 상세
            rail = 역할/맵/무기/정확도(우선) · RankHistory(축소) · (접힘) 활동/팀원/이전시즌
```

**정본 위치 표(중복 제거 기준):**

| 데이터 | 정본 위치 (1회) | 제거할 중복 |
|--------|-----------------|-------------|
| 시즌 승률/KD/ACS/HS% | masthead 한 줄 | SeasonSummaryCard 중복 |
| 최근 N판 폼(WR/KAST) | masthead 또는 rail 1곳 | Recent20 카드 중복 |
| Career Peak / Previous | rail "랭크" 1곳 | 헤더 rank-context 중복 |
| 랭크 추세 | RankHistory(rail/축소) 1곳 | 메인 상단 점유 제거 |
| Preview Score | 프로필 1곳(또는 승인 후) | 경기 행마다 반복 제거 |

## 채택 / 폐기 요약

- **채택**: 경기 리스트 메인 hero, 중복 정본화, 행 스캔 압축, rail 우선순위·접기,
  맵 PNG 적용, 라운드 누적 스코어·endType 표시, Mock 고지 면적 축소(정직성 유지),
  읽기 흐름 기준 분할.
- **폐기**: 컴포넌트별 polish 분할(부분 수정), CSS primitive 선행 리팩터링,
  데이터 없는 VAL 표현 강행(공/수 side 단정·모스트 요원·평균 대비 분석),
  selected-detail 즉시 기본 전환, RankHistory/Career 1순위 유지.

## Allowed Changes

- 문서만: `docs/tasks/TASK-015UI12A.md`(이 문서), `docs/ui12-implementation-plan.md`.

## Forbidden Changes

- 모든 제품 코드(`frontend/**`, `backend/**`, `docker/**`, `scripts/**`,
  `package*.json`).
- 신규 Mock/자산/타입/패키지.
- 기존 UI11 문서(`TASK-015UI11*`, `ui-reference-audit.md`, `ui-design-guardrails.md`)
  수정.
- 다른 agent의 ui12 문서(`ui12-codex-*`, `ui12-cursor-*`) 수정.
- Git add/commit/push.

## Acceptance Criteria

1. 세 agent 공통점·충돌·채택·폐기가 `ui12-implementation-plan.md`에 정리돼 있다.
2. API 신청 전 Must / 승인 후 Defer / 게이트가 분리돼 있다.
3. UI12B~F가 **읽기 흐름 기준**으로 분할되고(컴포넌트별 아님) 각 범위·게이트가
   정의돼 있다.
4. §충돌(C1 selected-detail / C2 공·수 side / C4 필터 / C5 요원 PNG)이 Human
   Decision으로 고정돼 있다.
5. `.agent-assets` 운영 기준과 실제 Riot catalog 로컬 경로가 구현 Task에
   명시돼 있다.
6. 제품 코드·기존 UI11 문서·다른 agent 문서 변경이 없다.

## Verification Commands

```bash
# 문서만 변경됐는지(제품 코드·금지 경로 미변경)
git status --porcelain -- frontend backend docker scripts package.json package-lock.json
# 기존 UI11/레퍼런스/다른 agent 문서 미변경
git status --porcelain -- docs/tasks/TASK-015UI11*.md docs/ui-reference-audit.md docs/ui-design-guardrails.md docs/ui12-codex-*.md docs/ui12-cursor-*.md
# UI12A 산출물 존재·핵심 섹션
git status --short -- docs/tasks/TASK-015UI12A.md docs/ui12-implementation-plan.md
grep -nE "^## (11\. Codex 구현 순서|7\. 신규 Mock|13\. Agent Assets)" docs/ui12-implementation-plan.md
git diff --check
```

## 읽기 흐름 기준 UI12 분할 (구현 Task)

> 컴포넌트별이 아니라 **전적을 읽는 순서**(정체성 → 리스트 → 상세 → 보조 → 마감)로
> 분할. 상세 범위·Allowed/Forbidden·게이트는 `ui12-implementation-plan.md` §11과
> 동기화.

| Task | 읽기 흐름 단계 | 목표(요약) | 분류 |
|------|----------------|------------|------|
| **UI12B** | ①정체성 + ②리스트 진입 | PlayerProfile 골격 재배치(경기 리스트 hero) + 중복 정본화 + 필요한 요원/맵 자산 온보딩 | Safe + 공식 로컬 자산 |
| **UI12C** | ②리스트 읽기 | 경기 행 스캔 압축 + Preview Score 축소 | Safe |
| **UI12D** | ③경기 상세 | 스코어보드 우선 + 라운드 누적 스코어·endType + 분석 축소 | Safe + 게이트(공/수·이벤트) + 결정(selected-detail) |
| **UI12E** | ④보조 통계 | 사이드바 → support rail 우선순위·접기 | Safe + 게이트(요원집계·역할아이콘·무기분포) |
| **UI12F** | 전체 마감 | Mock 고지 단일화·반응형·접근성·검색 진입·CSS 레이어 정리·신청 전 점검 | Safe |

순서: **B → C → D → E → F** (리스트가 본체이므로 골격·리스트 먼저, 상세·보조·마감
순). 각 Task는 독립 Cursor 리뷰.

## Human Decisions (UI12 진행 전/중 사람 결정)

- **C1 (UI12D)**: 경기 상세를 인라인 펼침 유지 vs **selected-detail 영역 전환**.
  기본 권장: 인라인 유지(저위험), 전환은 모바일 위치·state 상위 이동 리스크 검토 후.
- **C2 (UI12D 게이트)**: 라운드 **팀별 공/수 side 라벨**. 현재 `attackers/defenders`는
  누적 점수만 → 신청 전엔 **누적 스코어 진행·전/후반 구간·endType 사유까지만**.
  팀별 공/수 단정은 신규 Mock(UI9C 인접) 승인 후.
- **C4 (UI12B/F)**: 필터 — 제거 / 비동작 명시 축소 / 기존 데이터 클라이언트 필터
  실동작 중 택1.
- **C5 / H9 (게이트)**: 요원 7종 PNG(UI9B)를 **신청 전 확보(Must)** vs placeholder
  유지 + 요원 열 visual 최소화.
- **C5 처리 기준**: Riot Public Content Catalog 12.08 로컬 캐시는
  `.agent-assets/riot-public-content-catalog/12.08/`에 있으며, 구현 Task는 필요한
  파일만 `frontend/public/assets`로 선별 복사하고 `.agent-assets` 자체는 커밋하지
  않는다. 세부 정책은 `docs/agent-assets.md`와
  `docs/riot-public-content-catalog.md`를 따른다.
- **기타 게이트**: 역할군 아이콘(UI9D), 무기별 Head/Body/Legs(UI9D), 요원 집계
  카드, 참가자 랭크/econ, 갱신 시각(timestamp), 평균 대비 분석(Phase 5).

## Codex Implementation Notes

(UI12A는 설계 Task로 구현 없음. Codex 구현은 사람이 승인한 **UI12B**부터 시작하며,
각 구현 Task 문서에서 기록.)

## Cursor Review Notes

(이 설계 Task 리뷰: 분할이 읽기 흐름 기준인지(컴포넌트 polish 아님), 충돌이 결정
목록으로 고정됐는지, Must/Defer/게이트 분리가 명확한지. 구현 리뷰 기준은
`ui12-implementation-plan.md` §12.)
