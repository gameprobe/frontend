# TASK-015UI8A: 경기 상세 4탭 사용성·표시 정리 (신규 외부 자산·신규 Mock 이벤트 없이)

## Status

IMPLEMENTED — Cursor 리뷰·커밋 대기 (2026-06-17 구현)

> 계획 시 READY로 작성됐고 Codex 구현이 완료됐다(작업 트리 변경, 미커밋).
> Cursor 최종 리뷰에서 BLOCKER/MAJOR가 없고 검증이 모두 통과하면 **별도
> 지시를 통해** commit/push까지 진행한다. 아래 **운영 원칙(Git / 커밋)** 참조.

## Goal

프로필 페이지(`/players/[puuid]`) 최근 전적 행의 **인라인 4탭 상세 패널**
(스코어보드 / 라운드 / 성과 / 분석)의 **사용성·표시·고지·접근성**을 높인다. 이
Task는 **새 외부 자산을 추가하지 않고, 새 Mock 이벤트 데이터를 만들지 않고**
구현 가능한 범위만 다룬다. 구체적으로:

1. **(A) 탭 활성 상태 명확화 + 접근성** — 활성 탭이 한눈에 구분되도록
   배경/글자/하단 강조선을 강화하고, `role="tablist"`/`role="tab"`/
   `role="tabpanel"`·`aria-selected`·`aria-controls`/`id` 연결과 키보드
   좌우 이동을 보강한다.
2. **(B-레이아웃) 라운드 탭 압축** — 라운드 행 높이를 줄이고, 라운드 번호
   기준으로 **전반 / 후반 / 연장**을 구분한다. 기본은 압축 요약, 개별 라운드
   확장은 선택 사항. **라운드별 킬 이벤트·스파이크 설치/해제자·첫 킬 등 근거
   없는 정보는 추가하지 않는다.** 기존 정보는 사라지지 않는다.
3. **(D) 성과 탭 placeholder 통합** — 근거 없는 "연동 후 제공" 카드 4개
   (첫 킬/첫 데스, 멀티킬, 클러치, 플랜트/해제)를 개별 큰 카드에서 **하나의
   안내 영역**으로 통합한다. 실제 근거가 있는 6개 지표는 유지·재배치한다.
4. **(E) 분석 탭 명칭·고지 정리** — "분석 준비 중"과 숫자 점수가 공존해
   모호한 현재 상태를 정리한다. 명칭을 "분석 미리보기 / 예시 분석(Mock)" 등
   정확한 표현으로 바꾸고, **기존 예시 점수는 제거하지 않고** 의미·근거 설명을
   보강하며, 기존 GameProbe Score와 중복·공식 지표 오해가 없도록 한다.

**스코어보드 10명 전원 실제 요원 이미지·라운드 이벤트 기반 정보·역할군
아이콘·무기 적중 분포·전체 레이아웃 재설계는 신규 외부 자산/신규 Mock 또는
별도 범위가 필요하므로 이 Task가 아니다.** 각각 TASK-015UI8B / UI8C / UI8D에서
사람 결정 후 진행한다.

시각 방향: 현재 GameProbe 다크 네이비·청록 스타일 유지. OP.GG·Tracker.gg
디자인을 복제하지 않는다. 페이지 내부 중첩 스크롤 금지.

## Background

- 우리는 Riot Production API 신청 전, GameProbe 프로필 페이지를 실제 서비스처럼
  보이도록 다듬는 단계다. 데이터는 모두 Mock 기반이다.
- 선행 완료: **TASK-015UI7A**(상단 구조·사이드바·시즌 성적·티어 그래프·최근
  20판 요약), **TASK-015UI7B**(날짜별 최근 전적·경기 행 재설계·KAST/DDΔ/R·
  하이라이트 태그·인라인 경기 상세 4탭).
- 인라인 4탭은 `MatchSummaryList`가 경기 행을 펼칠 때 `MatchDetailPanel`을 통해
  렌더된다. 탭 구성: 스코어보드 / 라운드 / 성과 / 분석.

### 현재 구조 (TASK-015UI7A/7B 완료 후, `b0cfbf9` 기준)

- `frontend/src/components/MatchTabs.tsx` — 탭 네비게이션. `role="tablist"`
  컨테이너와 `role="tab"` 버튼·`aria-selected`는 이미 있다. 활성 className은
  `match-tab-active`. **단 `aria-controls`/`id`로 탭↔패널 연결과 키보드 화살표
  이동은 미보강.**
- `frontend/src/components/MatchScoreboardTab.tsx` — 10명 참가자 렌더(팀별
  분리, ACS 정렬). 요원 이미지는 `getAgentAssetPath(agentId)`로 얻는다.
  **이 Task에서는 구조를 바꾸지 않는다(자산 확장은 UI8C).**
- `frontend/src/components/MatchRoundsTab.tsx` — `matchDetail.rounds`(22개)를
  `round-card`로 반복. grid 6열, 행 높이가 크고 **전/후반 구분이 없다**. 각
  라운드에 "킬 이벤트 —" placeholder 문구가 있다.
- `frontend/src/components/MatchPerformanceTab.tsx` — 실제 6카드(우리 팀 MVP /
  상대 팀 MVP / 개인 ACS 순위 / K/D / HS% / ADR) + **근거 없는 placeholder
  4카드**(첫 킬·첫 데스 / 멀티킬 / 클러치 / 플랜트·해제). 모두 `performance-grid`
  안 동급 카드로 배치돼 미완성처럼 보인다.
- `frontend/src/components/MatchAnalysisTab.tsx` — 제목 "분석 준비 중" + 고지
  문구와 함께 4개 카드 중 **3개는 고정 숫자 점수(72/68/61)**, 1개는 "—"
  placeholder. 점수의 출처/의미 설명이 없어 GameProbe Score와 혼동될 수 있다.
- 탭/패널/카드 스타일은 `frontend/src/app/globals.css`(`match-tab*`,
  `round-card`, `performance-grid`, `match-analysis-list` 영역).

### 데이터 한계 (이 Task가 지켜야 할 근거)

- `MatchRound` 필드: `roundNumber`, `winningTeam`, `endType`,
  `scoreAfterRound{attackers,defenders}`. **첫 킬/스파이크 설치·해제자·라운드별
  킬 이벤트 필드가 없다.** → 라운드 탭은 위 필드 + 라운드 번호 기반 전/후반/연장
  구분까지만 표현한다. 새 이벤트를 만들지 않는다.
- 성과 탭 placeholder 4카드와 분석 탭 점수는 현재 Mock 근거가 없다. → 카드
  통합·예시 고지로 처리하고 새 수치를 만들지 않는다.
- 전/후반 구분은 **라운드 번호로 결정적으로 계산 가능**하다(R1–12 전반, R13–24
  후반, R25+ 연장). 진영 교체는 Mock에 없으므로 표시하지 않는다.

## Current Problems

이 Task가 직접 해결하는 문제(스크린샷 검토 기준):

1. **(A)** 경기 상세 4탭에서 현재 활성 탭을 구분하기 어렵다.
2. **(B)** 라운드 탭이 너무 길고, 각 라운드가 과도하게 큰 카드처럼 반복된다.
3. **(D)** 성과 탭에 "연동 후 제공" placeholder 카드가 많아 미완성처럼 보인다.
4. **(E)** 분석 탭은 "분석 준비 중"과 숫자 점수가 동시에 있어 의미가 모호하다.

> 다음 문제는 **이 Task 범위 밖**(신규 자산/Mock/별도 범위)이며 UI8B/UI8C/UI8D로
> 분리한다: 스코어보드 일부 참가자 placeholder, 역할군 아이콘 부재, 무기
> Head/Body/Legs 분포 부재, 전체 레이아웃·헤더·그래프·최근 전적 위계.

## Allowed Changes

```
frontend/src/components/MatchTabs.tsx              # 탭 활성 강조 + aria-controls/id/키보드 이동
frontend/src/components/MatchDetailPanel.tsx       # 패널 role="tabpanel"/id/aria-labelledby 연결
frontend/src/components/MatchRoundsTab.tsx         # 행 압축 + 전/후반/연장 구분(번호 기반)
frontend/src/components/MatchPerformanceTab.tsx    # placeholder 4카드 → 단일 안내 영역, 실지표 재배치
frontend/src/components/MatchAnalysisTab.tsx       # 명칭·고지·점수 설명 정리
frontend/src/components/**                          # 위 4탭 정리에 필요한 보조 컴포넌트 분리(신규 자산/Mock 없이)
frontend/src/lib/**                                 # 전/후반 구분 등 순수 파생 유틸(신규 로더 가능, 기존 시그니처 유지)
frontend/src/app/globals.css                       # 탭/라운드/성과/분석 스타일·반응형
docs/tasks/TASK-015UI8A.md                          # 이 문서의 갱신
docs/PLAN.md                                        # Phase 2 표·현재 상태 갱신
docs/PROGRESS.md                                    # 작업 로그 추가
```

## Forbidden Changes

- `frontend/public/assets/**` 신규 자산 추가(요원/역할군/무기/맵/티어 등 **새
  이미지 다운로드·추가 금지**). 기존 자산 재사용만 허용.
- `frontend/src/data/**`에 **새 Mock 이벤트/수치 추가**(라운드 킬 이벤트, 첫
  킬/첫 데스, 멀티킬, 클러치, 플랜트/해제, 새 점수 등). 표시 정리만 한다.
- `MatchScoreboardTab.tsx`의 참가자 렌더 구조 변경·요원 이미지 재매핑(UI8C 범위).
- 4탭 **구조 자체 변경**(탭 추가/삭제/순서 변경). 활성 표시·접근성·내부 레이아웃
  정리만 한다.
- 분석 탭 **기존 예시 점수 제거**(이번 Task 기본값은 보존 + 고지 강화. 제거는
  Human Decisions 항목으로 사람 판단 후에만).
- `backend/**`, `docker/**`, `scripts/**`.
- `frontend/package.json`, `frontend/package-lock.json`, 새 npm 패키지.
- 실제 Riot API 호출, 실제 AI 분석 로직.
- `score-gameprobe.ts` 가중치/정규화/등급 변경, UI7A의 DDΔ/R·KAST 정의 변경.
- 기존 로더·`asset-map` 함수 시그니처 변경.
- OP.GG/Tracker.gg 디자인 복제.
- 상단 구조(헤더 카드/필터/사이드바/시즌 성적/티어 그래프/최근 20판)·날짜
  그룹·경기 행(UI7A/7B 산출물) 재설계, 전체 페이지 폭·레이아웃 재설계(UI8D 범위).
- `/matches/[matchId]` 라우트 삭제, `MatchDetailView`/`MatchScoreboard`/
  `MatchRoundTimeline` 구조 변경.
- UI7A/UI7B 기능 삭제.
- `AGENTS.md`, `CLAUDE.md`, `docs/SPEC.md`, `docs/ARCHITECTURE.md`,
  `docs/DECISIONS.md`, `docs/tasks/TASK-015UI.md`~`TASK-015UI7B.md`,
  `docs/tasks/TASK-015UI8B.md`/`UI8C.md`/`UI8D.md`, 그 외 `docs/tasks/TASK-0XX.md`.
- TASK-016 이상 작업 시작.

## Acceptance Criteria

### 1. 탭 활성 상태 + 접근성 (A)

- [x] 활성 탭이 비활성 탭과 배경색·글자색·하단 강조선으로 명확히 구분된다.
- [x] 탭 컨테이너에 `role="tablist"`, 각 탭에 `role="tab"`·`aria-selected`,
  각 탭과 패널이 `aria-controls`/`id`로 연결되고 패널에 `role="tabpanel"`이
  적용된다.
- [x] 키보드로 탭 간 좌우 이동(←/→)과 활성화가 가능하다.
- [x] 4탭 구조(스코어보드/라운드/성과/분석)와 순서는 그대로 유지된다.

### 2. 라운드 탭 압축 (B-레이아웃)

- [x] 라운드 행 높이가 축소되고 전체 라운드 목록이 더 조밀해진다.
- [x] 라운드 번호 기준으로 **전반 / 후반 / 연장**이 구분 표시된다(구분 기준이
  코드 상수/주석과 이 문서에 명시된다).
- [x] 라운드 행에는 기존 필드(라운드 번호·승패·진영·`scoreAfterRound`·
  `endType`)만 사용하고, **첫 킬·스파이크 설치/해제자·라운드별 킬 이벤트 등
  Mock 근거 없는 정보는 추가되지 않는다.** 기존 "킬 이벤트 —" placeholder 문구는
  제거하거나 압축 표기로 정리한다. 기존 정보는 사라지지 않는다.
- [ ] (선택) 개별 라운드 확장 시에도 새 이벤트 데이터를 생성하지 않는다.

### 3. 성과 탭 정리 (D)

- [x] 근거 있는 6개 지표(우리 팀 MVP/상대 팀 MVP/개인 ACS 순위/K/D/HS%/ADR)가
  유지되고 시각적으로 묶여 우선 노출된다.
- [x] 근거 없는 4개 placeholder가 개별 큰 카드에서 **하나의 "연동 후 제공"
  안내 영역**으로 통합되어 미완성 인상이 줄어든다.

### 4. 분석 탭 정리 (E)

- [x] 탭/섹션 명칭이 "분석 미리보기" 또는 "예시 분석(Mock)" 등 **실제 AI 분석
  결과가 아님이 분명한 표현**으로 정리된다.
- [x] 각 예시 점수에 예시값 고지·근거 설명이 붙고, 기존 GameProbe Score와
  중복·공식 지표로 오해되지 않게 구분된다. **기존 점수는 제거하지 않았다.**
- [x] "분석 준비 중" 문구와 숫자 점수가 모순 없이 한 의미로 정리된다.

### 5. 범위·빌드

- [x] `frontend/public/assets`와 `frontend/src/data`에 **신규 파일/신규
  Mock 수치 추가가 없다**(표시 정리만).
- [x] `cd frontend && npx tsc --noEmit` 성공.
- [x] `cd frontend && npm run lint` 성공.
- [x] `cd frontend && npm run build` 성공.
- [x] `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts frontend/public/assets`
  출력이 비어 있다.
- [x] `grep -rn "riotcdn.net\|media.valorant-api" frontend/src` 출력이 비어 있다.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build

# 탭 접근성 속성 확인
grep -rn "role=\"tablist\"\|role=\"tab\"\|role=\"tabpanel\"\|aria-selected\|aria-controls" frontend/src/components/MatchTabs.tsx

# 신규 자산/Mock 추가 없음 확인 (출력 없어야 함)
cd .. && git status --porcelain -- frontend/public/assets frontend/src/data

# 변경 금지 영역 (출력 없어야 함)
git status --porcelain -- \
  frontend/package.json frontend/package-lock.json backend docker scripts

# 외부 Riot CDN 런타임 참조 없음 (출력 없어야 함)
grep -rn "riotcdn.net\|media.valorant-api" frontend/src

# 스코어보드 참가자 렌더 구조 미변경 확인(육안/diff)
git diff -- frontend/src/components/MatchScoreboardTab.tsx
```

## Stop Conditions

`BLOCKED`로 보고:

1. 탭 사용성·라운드 압축·성과/분석 정리에 새 npm 패키지가 반드시 필요한 경우.
2. 새 외부 자산 또는 새 Mock 이벤트 없이는 요구를 만족할 수 없다고 판단되는
   경우(그 경우 해당 항목은 UI8B/UI8C 사람 결정으로 넘기고 나머지만 진행).
3. 기존 로더 또는 `asset-map` 함수 시그니처 변경이 불가피한 경우.
4. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

BLOCKED가 **아님**(계속 진행):

- 스코어보드 일부 요원이 여전히 placeholder로 보이는 경우(이 Task는 자산을
  추가하지 않으므로 UI8C까지 placeholder 유지가 정상).
- 분석 탭이 예시값임을 고지한 채 기존 점수를 유지하는 경우(기본값).

## 운영 원칙 (Git / 커밋)

- **Codex 구현 단계에서는 Git add/commit/push를 하지 않는다.** 변경은 작업
  트리에만 남긴다.
- **Cursor 최종 리뷰**에서 BLOCKER/MAJOR가 없고 검증(`tsc`/`lint`/`build` +
  범위 확인)이 모두 통과하면, **별도 지시를 통해** 자동 commit/push까지 진행할
  수 있다.
- 즉, commit/push는 (1) Cursor 리뷰 통과 + (2) 사람/별도 지시 두 조건이 모두
  충족될 때만 수행한다.

## Human Decisions

| 항목 | 어느 Task | 사람 판단 필요 | 현재 기본 판단 |
| --- | --- | --- | --- |
| 분석 탭 예시 점수(72/68/61) 유지 vs 제거 | UI8A | YES | **유지** + Mock 예시 고지·근거 설명 보강 (구현도 유지로 완료). 제거 원하면 후속 변경 |
| 성과 통합 안내 문구/범위 | UI8A | 선택 | 기본은 placeholder 4개(첫 킬/멀티킬/클러치/플랜트)를 단일 안내로 통합 |
| 신규 요원 7개 자산 추가 여부 | UI8C | YES | 보류(placeholder 유지) — 외부 자산 출처·라이선스·SOURCES.md·승인 필요 |
| 역할군 아이콘 출처 | UI8B | YES | 보류 — 신규 자산 출처 결정 필요 |
| 무기 Head/Body/Legs Mock 추가 여부 | UI8B | YES | 보류 — 신규 Mock 필드 설계 필요 |
| 라운드 첫 킬/스파이크 이벤트 Mock 추가 여부 | UI8C | YES | 보류 — 임의 생성 시 데이터 신뢰성 훼손 |
| 전체 레이아웃 폭/헤더/그래프 재설계 방향 | UI8D | YES | 보류 — 별도 범위 |
| Tracker.gg 유사화 위험 UI 요소 | UI8B~D | YES | 복제 금지, GameProbe 밀도로 단순화 |

> UI8A의 기본 판단(예시 점수 유지 + Mock 예시 고지 강화 후 진행)은 타당한 것으로
> 확인됐고 그대로 구현됐다. 요원 10명 이미지·역할군 아이콘·무기 분포·라운드
> 이벤트·전체 레이아웃은 후속 Task로 미룬다.

## Codex Implementation Notes

Codex가 본 Task 범위를 작업 트리에 구현 완료했다(미커밋). 변경·검증·위험은
아래와 같다.

### 변경 파일

- `frontend/src/components/MatchTabs.tsx`
- `frontend/src/components/MatchDetailPanel.tsx`
- `frontend/src/components/MatchRoundsTab.tsx`
- `frontend/src/components/MatchPerformanceTab.tsx`
- `frontend/src/components/MatchAnalysisTab.tsx`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI8A.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

### 구현 결과

- 4탭 구조·순서를 유지한 채 활성 탭의 배경색·글자색·테두리·하단 강조선을
  강화했다.
- `MatchTabs`에 `aria-controls`·탭 `id`·roving `tabIndex`·좌우 화살표 키보드
  이동을 추가하고, `MatchDetailPanel` 패널에 `role="tabpanel"`·`id`·
  `aria-labelledby`를 연결했다.
- 라운드 탭을 R1–12 전반, R13–24 후반, R25+ 연장 기준으로 그룹화했다. 행은
  기존 필드(라운드 번호·진영·승리팀·승패·스코어·종료 방식)만 사용해 압축했고,
  근거 없는 킬 이벤트 placeholder는 제거했다.
- 성과 탭은 근거 있는 6개 지표를 유지하고, 첫 킬/첫 데스·멀티킬·클러치·
  플랜트/해제 placeholder 4개를 하나의 "연동 후 제공 예정" 안내 영역으로
  통합했다.
- 분석 탭은 "분석 미리보기"와 "Example Analysis / Mock Preview" 표현으로
  정리했다. 기존 72/68/61 예시 점수는 유지하되 GameProbe Score·Riot 공식
  지표·실제 AI 분석 결과가 아님을 명확히 고지했다.

### 검증 결과

- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `git diff --check`: 성공.
- `grep -rn "role=\"tablist\"\|role=\"tab\"\|role=\"tabpanel\"\|aria-selected\|aria-controls" frontend/src/components/MatchTabs.tsx`: 성공.
- `git status --porcelain -- frontend/public/assets frontend/src/data`: 출력 없음.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`: 출력 없음.
- `grep -rn "riotcdn.net\|media.valorant-api" frontend/src`: 출력 없음.
- `git diff -- frontend/src/components/MatchScoreboardTab.tsx`: 출력 없음.

### 남은 위험

- 스코어보드 일부 요원 placeholder, 역할군 아이콘, 무기 적중 분포, 라운드
  첫 킬/스파이크 설치·해제자 정보는 신규 자산 또는 신규 Mock이 필요해 UI8B/UI8C
  범위로 남겼다.
- 구현이 아직 커밋·리뷰되지 않았다. 운영 원칙(Git / 커밋)에 따라 Cursor 리뷰
  통과 + 별도 지시 후 커밋한다.

## Cursor Review Notes

> Cursor 최종 리뷰가 자신의 결과를 이 섹션에 기록한다. 리뷰 전까지는 비어 있다.

- Status: NOT_REVIEWED
- Verdict: (미정)
- 확인 권장 포인트:
  - 탭 접근성: `aria-controls`/`id`/`role="tabpanel"`/`aria-labelledby` 연결과
    키보드 좌우 이동·roving tabIndex 정확성.
  - 라운드 전/후반/연장 경계(R12/R24)와 기존 필드만 사용했는지(새 이벤트 무생성).
  - 성과 placeholder 통합으로 기존 6개 실지표가 누락되지 않았는지.
  - 분석 탭 예시 점수 유지 + 고지 강화, GameProbe Score와의 구분 명확성.
  - 범위 침범 없음: `public/assets`/`src/data` 신규 추가 0건, 스코어보드 구조
    diff 0건, package/backend/docker/scripts 변경 0건, 외부 CDN 런타임 참조 0건.
  - UI7A/UI7B 산출물(상단 구조·날짜 그룹·경기 행) 미변경.
- BLOCKER: (없음/기록)
- MAJOR: (없음/기록)
- MINOR: (기록)
