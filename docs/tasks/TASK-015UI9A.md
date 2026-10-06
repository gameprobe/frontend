# TASK-015UI9A: 프로필·경기 상세 정보 구조 / 레이아웃 골격 재정렬 (디자인 구조만, 신규 자산·Mock 없음)

## Status

DONE (2026-06-22)

## Goal

프로필 페이지(`/players/[puuid]`)와 인라인 경기 상세를 OP.GG / valorant.op.gg /
Tracker.gg 같은 전적 사이트의 **정보 구조·배치 원칙·읽기 흐름**에 가깝게
**전체 골격을 다시 정렬**한다. 단 **신규 외부 자산·신규 Mock 데이터·신규
라운드 이벤트 없이**, 기존 데이터·기존 에셋만으로 **레이아웃·정보 위계·카드
시스템·컬럼 구조**를 재배치한다.

이 Task는 **"디자인 구조 재정렬"에만 집중**하고, 데이터/에셋 확장(스코어보드
10요원 이미지, 라운드 이벤트, 역할군 아이콘, 무기 Head/Body/Legs)은 후속
UI9B~UI9E로 분리한다. pixel-perfect 복제는 금지하며 정보 구조만 참고하고
색상·여백·카드·문구·세부 컴포넌트는 GameProbe 다크 네이비·청록 스타일로
재해석한다.

재정렬 대상:

1. **프로필 메인 대시보드 골격** — 상단 헤더 카드 → 필터 → 좌측 보조 영역 +
   우측 메인(시즌 성적·티어 그래프·최근 20판·최근 경기)의 폭·밀도·위계·카드
   시스템을 전적 사이트 대시보드처럼 정돈한다.
2. **최근 경기 리스트 한 줄 가독성** — 승패·요원·맵·스코어·K/D/A·ACS·KAST·
   HS%·DDΔ/R·RR 변화·태그가 한 줄에서 빠르게 읽히도록 컬럼 정렬·정렬 위계를
   다듬는다(필드 자체는 UI7B 산출물 유지, **신규 지표 추가 없음**).
3. **경기 상세 4탭 정보 구조 통일** — 스코어보드/라운드/성과/분석이 **서로 다른
   카드 문법**처럼 보이는 문제를 하나의 일관된 카드/헤더/테이블 시스템으로
   통일한다(탭 구성·기능은 UI8A/UI8B 유지, **데이터·이벤트 추가 없음**).

## Background

- Riot Production API 신청 전, 프로필/경기 상세를 실제 전적 서비스처럼 보이도록
  다듬는 단계다. 데이터는 모두 Mock 기반이다.
- 완료·push됨: **UI7A**(상단 구조·사이드바·시즌 성적·티어 그래프·최근 20판),
  **UI7B**(날짜별 최근 전적·경기 행·KAST/DDΔ/R·태그·인라인 4탭), **UI8A**(4탭
  활성/접근성·성과/분석 고지), **UI8B**(라운드 타임라인 재설계). 최신 커밋
  `eb108a1 [TASK-015UI8B] redesign round timeline detail`.
- 이 Task는 그 위에서 **구조만** 재정렬하며 UI7/UI8 기능을 삭제·후퇴시키지
  않는다.

### 현재 구조 (`eb108a1` 기준, 조사 결과)

- **레이아웃**: `PlayerProfile`(server)이 `PlayerHeaderCard` → `ProfileFilterBar`
  → 2열(`grid-template-columns: clamp(280px,24vw,320px) minmax(0,1fr)`, 최대 폭
  `min(100%,1240px)`)을 렌더. 좌측 `ProfileSidebar`, 우측 `profile-main`에
  `SeasonSummaryCard` → `RankHistoryChart` → `RecentTwentySummaryCard` →
  `MatchSummaryList`.
- **사이드바**(`ProfileSidebar`): 전체 시즌 최고 기록 / 이전 시즌 티어 / 정확도
  (Head·Body·Legs) / 역할별 승률(텍스트) / 주 무기(이미지+킬·HS%) / 맵별 승률.
  역할군 아이콘 없음(텍스트만).
- **최근 경기**(`MatchSummaryList`): 날짜 그룹 헤더 + 경기 행(승패 스트립·요원·
  맵 아이콘·스코어·K/D/A·K/D·ACS·ADR·KAST·DDΔ/R·HS%·티어 변동·태그·Preview
  Score·펼침). 펼치면 `MatchDetailPanel`.
- **4탭**: `MatchScoreboardTab`(우리/상대 팀, 본인 강조, ACS 정렬, 요원 이미지),
  `MatchRoundsTab`(UI8B: 칩 스트립·구간 요약·압축 로그·선택 상세),
  `MatchPerformanceTab`(실지표 6 + "연동 후 제공" 안내), `MatchAnalysisTab`(예시
  점수 72/68/—/61 + Mock 고지).
- 각 탭이 **독립적으로 성장해 카드/헤더/테이블 문법이 제각각**이다.

### 데이터/에셋 한계 (이 Task의 경계)

- 요원 실 PNG는 jett/sova/omen 3개만, 무기 vandal/phantom/operator 3개만, 맵
  ascent/haven/split 3개만 매핑. 나머지는 placeholder. 역할군 아이콘 자산 부재.
- `topWeapons`에 Head/Body/Legs 분포 필드 없음. `MatchRound`에 킬/스파이크
  이벤트 필드 없음. 라운드별 공격/수비 side 신뢰 불가(UI8B에서 확인).
- → 이 Task는 위 부재 데이터/에셋을 **만들지 않는다.** 구조·위계·정렬만 바꾼다.

## Current Problems

1. 경기 상세가 "전적 사이트"라기보다 **자체 제작 카드 UI**처럼 보인다.
2. 스코어보드/라운드/성과/분석 4탭이 **서로 다른 정보 구조**처럼 느껴진다(카드
   문법 불일치).
3. 프로필 페이지 전체가 목표 시안 대비 **폭·밀도·위계·카드 배치가 약하다**.
4. 최근 경기 한 줄이 전적 사이트처럼 **빠르게 스캔되지 않는다**(정렬·위계).
5. (데이터/에셋 부족으로 보이는 문제 — 요원 placeholder, 역할군 아이콘, 무기
   분포 — 는 **이 Task 범위 밖**이며 UI9B~UI9D에서 처리).

## Reference Direction

OP.GG / valorant.op.gg / Tracker.gg에서 **정보 구조만** 참고한다(디자인 복제 금지):

- **프로필 상단**: 플레이어 정보·현재 티어·최근 폼·핵심 지표·검색/필터가 한
  상단 영역에서 신뢰감 있게 정돈.
- **좌측/보조**: 최고 티어·최근 시즌 티어·역할군 성과·주요 요원·주요 무기·맵별
  성과·플레이 스타일 요약이 **조밀한 통계 패널**로.
- **최근 경기 리스트**: 승패가 강하게 보이고, 핵심 지표가 한 줄에서 빠르게
  읽히며, 펼침 상세가 자연스럽게 연결.
- **경기 상세**: 스코어보드(팀 구분·본인 강조·팀 헤더 지표)·라운드(타임라인)·
  성과/분석이 **하나의 일관된 표/카드 시스템**으로 통일.

재해석 원칙: 색상·여백·카드 스타일·타이포·문구·세부 컴포넌트는 GameProbe 고유
스타일. **정보 구조·배치 원칙·사용 흐름만** 참고. pixel-perfect 복제 금지.

## Allowed Changes

```
frontend/src/app/players/[puuid]/page.tsx          # 래퍼/구조 최소 조정
frontend/src/components/PlayerProfile.tsx           # 메인 대시보드 골격 재배치(컴포넌트 합성)
frontend/src/components/ProfileSidebar.tsx          # 보조 패널 정보 위계/카드 통일(기존 데이터만)
frontend/src/components/PlayerHeaderCard.tsx        # 상단 카드 정보 위계 정돈(기존 데이터만)
frontend/src/components/SeasonSummaryCard.tsx       # 카드 시스템 통일
frontend/src/components/RankHistoryChart.tsx        # 카드 시스템 통일(차트 데이터/패키지 변경 없음)
frontend/src/components/RecentTwentySummaryCard.tsx # 카드 시스템 통일
frontend/src/components/MatchSummaryList.tsx        # 경기 행 컬럼 정렬·위계(필드 추가 없음)
frontend/src/components/MatchDetailPanel.tsx        # 4탭 컨테이너 카드/헤더 통일(탭 구조 유지)
frontend/src/components/MatchScoreboardTab.tsx      # 카드/테이블 문법 통일(요원 재매핑·팀 헤더 신규 데이터 없음)
frontend/src/components/MatchRoundsTab.tsx          # 카드 문법 통일(UI8B 기능 유지, 이벤트 추가 없음)
frontend/src/components/MatchPerformanceTab.tsx     # 카드 문법 통일(지표 추가 없음)
frontend/src/components/MatchAnalysisTab.tsx        # 카드 문법 통일(예시 점수 기본 유지, 고지 정돈)
frontend/src/components/**                            # 위 재정렬용 공용 카드/섹션 래퍼 컴포넌트 분리
frontend/src/app/globals.css                        # 폭·그리드·밀도·카드 시스템·반응형 스타일
docs/tasks/TASK-015UI9A.md                           # 이 문서의 갱신
docs/PLAN.md                                         # Phase 2 표·현재 상태 갱신
docs/PROGRESS.md                                     # 작업 로그 추가
```

> 컴포넌트 마크업·className·합성·CSS 재배치는 허용한다. **데이터 로딩·계산·필드
> 추가·기능 변경은 하지 않는다.**

## Forbidden Changes

- **신규 외부 자산 다운로드·추가 금지**(`frontend/public/assets/**` 신규 파일).
  요원/무기/맵/티어/역할군 아이콘 신규 이미지 추가 금지(UI9B/UI9D).
- **신규 Mock 데이터/필드/이벤트 추가 금지**(`frontend/src/data/**`,
  `types/**`). 라운드 킬/스파이크/클러치 이벤트, 무기 Head/Body/Legs, 팀 헤더용
  신규 집계 등 **현재 Mock에 없는 값 생성 금지**(UI9B/UI9C/UI9D).
- 스코어보드 참가자 요원 이미지 재매핑·10요원 자산 확장 금지(UI9B).
- 역할군 아이콘 추가, 무기 적중 분포 추가 금지(UI9D).
- 라운드 이벤트 데이터 확장·`MatchRound` 새 필드 금지(UI9C).
- **신규 npm 패키지 추가 금지**(순수 React + CSS/SVG). 새 차트 라이브러리 금지.
- 실제 Riot API 호출, 실제 AI 분석 로직 금지. 분석 탭 예시 점수를 공식 지표처럼
  보이게 만들지 않는다(Mock/Preview 고지 유지).
- `score-gameprobe.ts` 가중치/정규화/등급 변경, UI7A의 DDΔ/R·KAST 정의 변경 금지.
- 기존 로더·`asset-map` 함수 시그니처 변경 금지.
- **기존 UI7A/UI7B/UI8A/UI8B 기능 삭제·후퇴 금지**(필드/탭/접근성/날짜 그룹/
  라운드 타임라인/펼침 상세 보존). 4탭 구성·순서 유지.
- `/matches/[matchId]` 라우트 삭제, `MatchDetailView`/`MatchScoreboard`/
  `MatchRoundTimeline` 구조 변경 금지.
- 홈/privacy/terms/connect·공통 헤더·푸터 대규모 변경 금지.
- 페이지 내부 중첩 스크롤 추가 금지. OP.GG/Tracker.gg 디자인 복제 금지.
- `backend/**`, `docker/**`, `scripts/**`, `frontend/package.json`,
  `frontend/package-lock.json` 변경 금지.
- **Git add/commit/push 금지**(운영 원칙 참조).
- `AGENTS.md`, `CLAUDE.md`, `docs/SPEC.md`, `docs/ARCHITECTURE.md`,
  `docs/DECISIONS.md`, `docs/tasks/TASK-015UI.md`~`TASK-015UI8B.md`, 그 외
  `docs/tasks/TASK-0XX.md`.
- TASK-016 이상 작업 시작.

## Acceptance Criteria

### 1. 프로필 메인 대시보드 골격

- [x] 상단 헤더 → 필터 → 2열(보조/메인) 흐름이 전적 사이트 대시보드처럼 폭·
  밀도·위계가 정돈되고, 콘텐츠 최대 폭·여백 기준이 일관된다(Human Decisions의
  폭/밀도 기준을 따른다).
- [x] `SeasonSummaryCard`·`RankHistoryChart`·`RecentTwentySummaryCard`·
  `MatchSummaryList`가 **하나의 통일된 카드 시스템**(헤더·여백·테두리·강조색)을
  공유한다.
- [x] 좌측 보조 패널(`ProfileSidebar`)이 조밀한 통계 패널 위계로 정돈된다(기존
  데이터만, 역할군 아이콘/무기 분포는 추가하지 않음).

### 2. 최근 경기 리스트 가독성

- [x] 경기 행에서 승패가 강하게 보이고, 요원·맵·스코어·K/D/A·ACS·KAST·HS%·
  DDΔ/R·RR 변화·태그가 한 줄에서 빠르게 스캔되도록 정렬·위계가 개선된다.
- [x] UI7B의 경기 행 필드·날짜 그룹·태그·펼침 상세가 보존되고 **신규 지표가
  추가되지 않는다**.

### 3. 경기 상세 4탭 정보 구조 통일

- [x] 스코어보드/라운드/성과/분석 4탭이 **일관된 카드/헤더/테이블 시스템**으로
  통일되어 같은 화면 언어로 읽힌다.
- [x] UI8A 접근성(탭 활성/`role="tabpanel"`/키보드)·UI8B 라운드 타임라인(칩
  스트립·구간 요약·압축 로그·선택 상세)이 보존된다.
- [x] 스코어보드 팀 구분·본인 강조가 유지되며, **신규 데이터(팀 헤더 집계·요원
  재매핑) 없이** 시각 위계만 강화된다.
- [x] 성과 탭의 실지표/“연동 후 제공” 분리, 분석 탭의 Mock/Preview 고지가 더
  명확해지고 예시 점수가 공식 지표처럼 보이지 않는다(기본: 예시 점수 유지).

### 4. 범위·빌드

- [x] `frontend/public/assets`·`frontend/src/data`·`frontend/src/types`에 신규
  파일/신규 필드 추가가 없다.
- [x] `cd frontend && npx tsc --noEmit` 성공.
- [x] `cd frontend && npm run lint` 성공.
- [x] `cd frontend && npm run build` 성공.
- [x] `git status --porcelain -- frontend/public/assets frontend/src/data frontend/package.json frontend/package-lock.json backend docker scripts`
  출력이 비어 있다.
- [x] `grep -rn "riotcdn.net\|media.valorant-api" frontend/src` 출력이 비어 있다.
- [x] `git diff -- frontend/src/types frontend/src/lib/score-gameprobe.ts` 에
  타입 필드/점수 모델 변경이 없다.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build

# 신규 자산/Mock/패키지/타입 변경 없음 (출력 없어야 함)
cd .. && git status --porcelain -- \
  frontend/public/assets frontend/src/data frontend/src/types \
  frontend/package.json frontend/package-lock.json backend docker scripts

# 점수 모델 미변경 (출력 없어야 함)
git diff -- frontend/src/lib/score-gameprobe.ts

# 라운드/Mock 이벤트 임의 생성 흔적 없음 (출력 없어야 함)
grep -rn "Math.random\|firstKill\|firstBlood\|defuser\|clutch\|multikill" frontend/src/components

# 외부 Riot CDN 런타임 참조 없음 (출력 없어야 함)
grep -rn "riotcdn.net\|media.valorant-api" frontend/src

# UI8A 접근성 / UI8B 타임라인 보존 확인(육안 + grep)
grep -rn "role=\"tabpanel\"\|aria-selected\|aria-controls" frontend/src/components/MatchTabs.tsx frontend/src/components/MatchDetailPanel.tsx
grep -rn "round-chip\|round-phase\|ROUND_PHASES" frontend/src/components/MatchRoundsTab.tsx
```

## Stop Conditions

`BLOCKED`로 보고:

1. 정보 구조 통일에 새 npm 패키지(차트/그리드 등)가 반드시 필요한 경우.
2. 신규 자산 또는 신규 Mock 없이는 목표 구조를 만들 수 없다고 판단되는 부분이
   있는 경우(그 부분은 UI9B~UI9D로 분리하고 나머지만 진행).
3. 기존 로더·`asset-map`·타입 시그니처 변경이 불가피한 경우.
4. 한 Task로 4탭 + 프로필 메인 + 사이드바 전체 재정렬 범위가 과도해 안전하게
   끝낼 수 없다고 판단되는 경우 — **하위 분할을 제안하고 BLOCK**(예: 9A-1
   프로필 메인, 9A-2 경기 상세 4탭).
5. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

BLOCKED가 **아님**(계속 진행):

- 요원/무기/맵이 여전히 placeholder로 보이는 경우(자산은 UI9B/UI9D, 정상).
- 라운드에 공격/수비 side·킬 이벤트가 없는 경우(UI8B 한계, UI9C 범위, 정상).
- 분석 탭이 예시 점수를 고지와 함께 유지하는 경우(기본).

## 운영 원칙 (Git / 커밋)

- **Codex 구현 단계에서는 Git add/commit/push를 하지 않는다.** 변경은 작업
  트리에만 남긴다.
- **Cursor 최종 리뷰**에서 BLOCKER/MAJOR가 없고 검증이 모두 통과하면, **별도
  지시를 통해** commit/push까지 진행한다.

## Human Decisions

| 항목 | 사람 판단 필요 | 기본 판단(미정 시) |
| --- | --- | --- |
| **OP.GG/Tracker.gg 유사도 한계** | YES | 정보 구조·배치·흐름만 참고, 디자인 복제 금지. pixel-perfect 아님 |
| **전체 페이지 폭·카드 밀도 기준** | YES | 현재 ~1240px 유지~1320px 이내, 밀도는 중간↑(여백 축소)로 정돈. 폭 확대는 사람 확인 후 |
| 분석 탭 예시 점수(72/68/—/61) 유지 vs 축소/제거 | YES | 유지 + Mock/Preview 고지 강화 |
| 기존 UI8A/UI8B 구현 유지 vs 일부 대체 | YES | **유지**(구조 통일만, 기능 보존) |
| 스코어보드 팀 헤더 지표(팀 점수/평균/MVP) 추가 | YES (후속) | 이 Task에선 **신규 집계 없이** 시각 위계만. 신규 집계는 UI9B |
| 신규 요원 이미지 자산 추가 | YES (UI9B) | 이 Task 범위 아님 |
| 역할군 아이콘 출처 | YES (UI9D) | 이 Task 범위 아님 |
| 무기 Head/Body/Legs Mock 추가 | YES (UI9D) | 이 Task 범위 아님 |
| 라운드 첫 킬/스파이크/클러치 이벤트 Mock 추가 | YES (UI9C) | 이 Task 범위 아님 |

> UI9A는 **디자인 구조만** 다루므로 위 자산/Mock 항목은 모두 후속 Task로
> 분리돼 있다. 폭/밀도·OP.GG 유사도·분석 점수만 UI9A 진행에 영향을 준다(기본값
> 제공 — 미정이어도 착수 가능).

## Codex Implementation Notes

- Status: IMPLEMENTED / DONE (2026-06-22)
- Git: Codex 구현 단계 원칙에 따라 `git add`/`git commit`/`git push`는 수행하지
  않았다.

### 변경 파일

- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/MatchSummaryList.tsx`
- `frontend/src/components/MatchDetailPanel.tsx`
- `frontend/src/components/MatchScoreboardTab.tsx`
- `frontend/src/components/MatchRoundsTab.tsx`
- `frontend/src/components/MatchPerformanceTab.tsx`
- `frontend/src/components/MatchAnalysisTab.tsx`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI9A.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

### 구현 결과

- 프로필 페이지 최대 폭을 1320px 이내로 확장하고, 상단 헤더 → 필터 → 보조/메인
  2열 흐름의 간격과 카드 밀도를 조정했다.
- 시즌 성적, 티어 그래프, 최근 20판, 최근 경기 섹션이 같은 카드/헤더/여백
  문법을 공유하도록 `profile-overview-stack`, `dashboard-section-head`를 추가했다.
- 최근 경기 행의 기존 필드를 유지하면서 K/D/A, K/D, ACS, ADR, KAST, DDΔ/R,
  HS%, 티어 변동을 라벨/값이 분리된 조밀한 통계 셀로 정렬했다.
- 경기 상세 패널과 스코어보드/라운드/성과/분석 탭에 공통 섹션 헤더와 카드
  스타일을 적용했다. UI8A 탭 접근성과 UI8B 라운드 타임라인은 보존했다.
- 분석 탭은 기존 예시 점수 72/68/—/61을 유지하되 Mock Preview 예시값임을 더
  명확히 표현했다.

### 검증 결과

- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `git diff --check`: 성공.
- `git status --porcelain -- frontend/public/assets frontend/src/data frontend/src/types frontend/package.json frontend/package-lock.json backend docker scripts`: 출력 없음.
- `git diff -- frontend/src/lib/score-gameprobe.ts`: 출력 없음.
- `git diff -- frontend/src/types frontend/src/lib/score-gameprobe.ts`: 출력 없음.
- `grep -rn "Math.random\|firstKill\|firstBlood\|defuser\|clutch\|multikill" frontend/src/components`: 기존 `SeasonSummaryCard.tsx`의 `clutchWinRate` 표시 1건만 출력. 이번 Task에서 추가한 신규 이벤트/Mock은 아니다.
- `grep -rn "riotcdn.net\|media.valorant-api" frontend/src`: 출력 없음.
- `grep -rn "role=\"tabpanel\"\|aria-selected\|aria-controls" frontend/src/components/MatchTabs.tsx frontend/src/components/MatchDetailPanel.tsx`: 접근성 속성 보존 확인.
- `grep -rn "round-chip\|round-phase\|ROUND_PHASES" frontend/src/components/MatchRoundsTab.tsx`: UI8B 라운드 타임라인 보존 확인.

### 남은 위험

- 요원 placeholder, 역할군 아이콘, 라운드 이벤트 상세, 무기 적중 분포는 신규
  자산/Mock이 필요한 후속 UI9B~UI9D 범위다.
- 실제 화면의 OP.GG/Tracker 유사도는 pixel-perfect 복제가 아니라 정보 구조
  재해석 기준으로 Cursor/사람 리뷰가 필요하다.

## Cursor Review Notes

> Cursor 최종 리뷰가 결과를 이 섹션에 기록한다. 리뷰 전까지는 비어 있다.

- Status: NOT_REVIEWED
- Verdict: (미정)
- 확인 권장 포인트:
  - 신규 자산/Mock/타입 필드/패키지 0건(`public/assets`·`data`·`types`·package
    diff 없음), 외부 CDN/`Math.random`/킬 이벤트 키워드 부재.
  - UI7A/UI7B/UI8A/UI8B 기능 보존: 경기 행 필드·날짜 그룹·태그·펼침, 4탭 구성·
    접근성, 라운드 칩 스트립·구간 요약·압축 로그·선택 상세.
  - 4탭/프로필 카드가 실제로 **하나의 통일된 카드 시스템**을 공유하는지(헤더·
    여백·강조색 일관).
  - 분석 탭 예시 점수가 공식 지표처럼 보이지 않게 고지가 유지/강화됐는지.
  - 페이지 내부 중첩 스크롤 부재, 반응형(데스크톱/태블릿/모바일) 정상.
- BLOCKER / MAJOR / MINOR: (기록)
