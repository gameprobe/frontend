# TASK-015UI8B: 라운드 상세 타임라인 재설계 (경기 상세 라운드 탭)

## Status

DONE (2026-06-22)

## Goal

프로필 페이지(`/players/[puuid]`) 인라인 경기 상세의 **라운드 탭**
(`MatchRoundsTab`)을 단순 표/리스트에서 **전적 사이트에서 익숙한 라운드
타임라인 문법**으로 재설계한다. Tracker.gg·valorant.op.gg의 라운드 상세 정보
**구조만 참고**하고, 디자인은 GameProbe의 다크 네이비·청록 색상·카드·
타이포그래피로 재해석한다. **현재 Mock에 없는 이벤트는 만들지 않는다.**

이 Task는 **라운드 탭에만 집중**한다. 구체적으로:

1. **(1) 라운드 결과 타임라인 스트립** — 라운드 탭 상단에 전체 라운드를 작은
   칩/블록으로 한 줄(또는 전반/후반/연장 구간별)로 표시. 각 칩: 라운드 번호,
   승/패 색상, 라운드 종료 결과(제압/폭발/해제), 선택·hover·focus 상태.
2. **(2) 전반/후반/연장 구간 요약** — 각 구간의 라운드 수·우리 팀 승/패·구간
   스코어 요약. (공격/수비 표기는 Human Decisions 참조 — 기본 미표기.)
3. **(3) 압축 라운드 로그 리스트** — 현재의 큰 `round-card` 반복을 더 얇은
   로그형 행으로: R번호, 승/패, 누적 스코어, `endType` 기반 결과 라벨.
4. **(4·선택) 선택 라운드 상세** — 칩/행을 선택하면 해당 라운드의 파생 가능한
   정보(번호·승패·승리 팀·누적 스코어·종료 방식)를 강조 표시. 범위가 커지면
   선택 사항으로 분리 가능(미구현 허용).

시각 방향: GameProbe 스타일 유지, OP.GG/Tracker.gg 디자인 복제 금지. 페이지
내부 중첩 스크롤 금지.

## Background

- Riot Production API 신청 전, 프로필 페이지를 실제 서비스처럼 다듬는 단계다.
  데이터는 모두 Mock 기반이다.
- 선행 완료(커밋·푸시됨, HEAD `8c48f3f`): **TASK-015UI8A** — 경기 상세 4탭
  활성 상태·접근성, 라운드 탭 전반/후반/연장 구분, 성과 placeholder 통합, 분석
  탭 Mock 고지. UI8A 기능은 삭제·후퇴시키지 않는다.
- 라운드 탭은 `MatchDetailPanel` → `MatchRoundsTab`으로 렌더된다.

### 현재 라운드 탭 구조 (`8c48f3f` 기준)

- `frontend/src/components/MatchRoundsTab.tsx`:
  - `ROUND_PHASES` = R1–12 전반 / R13–24 후반 / R25+ 연장. `groupRoundsByPhase`로
    구간 그룹화. 빈 구간은 제외.
  - 각 구간을 `round-phase` 섹션으로, 각 라운드를 `round-card`(article)로 렌더.
  - 행 표시: `R{n}`, `scoreAfterRound.attackers-defenders`,
    `우리 팀 {teamLabel(matchSummary.team)}`, `승리 {teamLabel(winningTeam)}`,
    `승/패`(`round-win`/`round-loss`), `결과 {spikeLabel}`(폭발/해제/—).
  - `spikeLabel`은 `endType`(`Spike Detonation`→폭발, `Defuse`→해제, else —)에서
    파생. 상단에 진영 교체 미반영 고지 문구가 있다.
- `frontend/src/app/globals.css` 라운드 관련 클래스: `.rounds-tab`,
  `.round-list`, `.round-phase`, `.round-phase-header`, `.round-phase-list`,
  `.round-card`(+`span`/`strong`/`p`), `.round-win`, `.round-loss`,
  `.match-data-note`, `.match-tab-panel`(약 1234–1465, 반응형 1790·1874 부근).

### 데이터 사실 (조사 결과 — 이 Task의 설계 근거)

- `types/match.ts`의 `MatchRound = { roundNumber, winningTeam, endType,
  scoreAfterRound{attackers, defenders} }`. **그 외 필드 없음.**
- Mock(`data/mock-data.json`)에는 **`matchDetails[0]`(Ascent, 뷰어 경기)에만
  rounds 22개**가 있다. `endType` 분포: Elimination 12 / Spike Detonation 6 /
  Defuse 4. 최종 스코어 13–9.
- `winningTeam`/`scoreAfterRound`의 `attackers`/`defenders`는 **경기 내내 고정된
  팀 식별자**다(어느 한 팀이 13에 먼저 도달=승). **라운드별로 바뀌는 진영(side)이
  아니다.** 하프타임/연장 진영 교체 정보는 Mock에 **없다**.
- 따라서 **라운드별·구간별 "공격/수비"는 현재 Mock으로 신뢰성 있게 단정할 수
  없다.** 현재 코드는 `matchSummary.team`(경기 고정값)을 그대로 "우리 팀 진영"으로
  보여주며 고지 문구로 한계를 밝히고 있다.

### 파생 가능 vs 불가 (이 Task의 경계)

- **파생 가능(사용)**: 라운드 번호, 승/패(`winningTeam === matchSummary.team`),
  누적 스코어(`scoreAfterRound`), 라운드 종료 결과(`endType`: 제압/폭발/해제),
  구간 분류(R번호 기반), 구간별 우리 팀 승/패 수·구간 스코어.
- **파생 불가(생성 금지)**: 라운드별/구간별 공격·수비 side(신뢰 불가),
  첫 킬, 첫 데스, 스파이크 설치자/해제자, 클러치, 멀티킬, 실제 킬 타임라인.

## Current Problems

배포 화면(라운드 탭) 확인 결과:

1. 전반/후반 구분은 생겼지만 **라운드 흐름이 한눈에 보이지 않는다**(전체 결과를
   훑는 타임라인이 없음).
2. 라운드 행이 여전히 **텍스트 리스트/표처럼** 보인다(큰 `round-card` 반복).
3. Tracker.gg/valorant.op.gg에서 익숙한 **라운드 타임라인 문법**(결과 칩 스트립)이
   부족하다.
4. **승패 흐름·라운드 결과**가 시각적으로 약하다(색·아이콘 위계 부족).
5. "경기 상세"라기보다 **단순 데이터 표** 느낌이 강하다.

## Allowed Changes

```
frontend/src/components/MatchRoundsTab.tsx     # 라운드 탭 재설계(타임라인 스트립/구간 요약/압축 로그/선택 상세)
frontend/src/components/**                       # 라운드 타임라인 보조 컴포넌트 분리(신규 자산/Mock 없이)
frontend/src/lib/**                              # 라운드 구간/승패/요약 파생 순수 유틸(기존 시그니처 유지)
frontend/src/app/globals.css                    # 라운드 칩/스트립/구간/로그 행/선택 상태 스타일·반응형
docs/tasks/TASK-015UI8B.md                       # 이 문서의 갱신
docs/PLAN.md                                     # Phase 2 표·현재 상태 갱신
docs/PROGRESS.md                                 # 작업 로그 추가
```

> 라운드 탭과 무관한 4탭 구조(`MatchTabs`/`MatchDetailPanel`의 탭 추가/삭제/
> 순서) 변경은 하지 않는다. 단, 라운드 패널 내부에서 선택 라운드 상태를 다루기
> 위한 **라운드 탭 내부 한정**의 client 상태/하위 컴포넌트 추가는 허용한다
> (탭 전환 구조·`role="tabpanel"` 연결은 UI8A 산출물을 보존).

## Forbidden Changes

- **신규 외부 자산 다운로드·추가 금지**(`frontend/public/assets/**` 신규 파일).
  기존 자산 재사용만 허용(라운드 타임라인은 기본적으로 자산 불필요).
- **신규 npm 패키지 추가 금지**(순수 React + CSS/SVG).
- **신규 Mock 이벤트/수치 임의 생성 금지** — 특히 첫 킬, 첫 데스, 스파이크
  설치자/해제자, 클러치, 멀티킬, 실제 킬 타임라인, 라운드별 공격/수비 side.
  `frontend/src/data/**`·`types/match.ts`의 `MatchRound`에 새 이벤트 필드를
  추가하지 않는다.
- **스코어보드 10명 요원 이미지 확장 금지**(별도 Task UI8C). `MatchScoreboardTab`
  변경 금지.
- **역할군 아이콘 추가 금지**, **무기 Head/Body/Legs 분포 추가 금지**(별도 Task).
- **전체 페이지 폭·헤더·티어 그래프·사이드바 재설계 금지**(별도 Task).
- 상단 구조·날짜 그룹·경기 행(UI7A/7B 산출물)·성과/분석/스코어보드 탭 재설계 금지.
- 실제 Riot API 호출, 실제 AI 분석 로직 금지.
- `score-gameprobe.ts` 가중치/정규화/등급 변경, UI7A의 DDΔ/R·KAST 정의 변경 금지.
- 기존 로더·`asset-map` 함수 시그니처 변경 금지.
- `/matches/[matchId]` 라우트 삭제, `MatchDetailView`/`MatchScoreboard`/
  `MatchRoundTimeline` 구조 변경 금지.
- **UI8A 기능 삭제·후퇴 금지**(탭 활성/접근성, 전반/후반/연장 구분 유지).
- OP.GG/Tracker.gg 디자인 복제 금지.
- `backend/**`, `docker/**`, `scripts/**`, `frontend/package.json`,
  `frontend/package-lock.json` 변경 금지.
- **Git add/commit/push 금지**(운영 원칙 참조).
- `AGENTS.md`, `CLAUDE.md`, `docs/SPEC.md`, `docs/ARCHITECTURE.md`,
  `docs/DECISIONS.md`, `docs/tasks/TASK-015UI.md`~`TASK-015UI8A.md`, 그 외
  `docs/tasks/TASK-0XX.md`.
- TASK-016 이상 작업 시작.

## Acceptance Criteria

### 1. 라운드 결과 타임라인 스트립

- [x] 라운드 탭 상단에 전체 라운드를 작은 칩/블록으로 보여주는 타임라인
  스트립이 있고, 전반/후반/연장 구간으로 묶여 한눈에 흐름이 보인다.
- [x] 각 칩에 라운드 번호, 승/패 색상(우리 팀 기준), 라운드 종료 결과
  (제압/폭발/해제)가 표시된다.
- [x] 칩에 hover/focus 가시 상태와 선택 상태가 있고 키보드 접근이 가능하다
  (button 등 적절한 시맨틱·focus 스타일).

### 2. 전반/후반/연장 구간 요약

- [x] 각 구간 헤더에 라운드 수, 우리 팀 구간 승/패, 구간 스코어가 표시된다.
- [x] 연장이 없으면 연장 구간은 표시되지 않는다(기존 동작 유지).
- [x] **공격/수비 side는 신뢰 가능한 근거가 없으면 사실로 단정하지 않는다**
  (Human Decisions 결정에 따름). 기존 진영 한계 고지는 유지하거나 정리한다.

### 3. 압축 라운드 로그 리스트

- [x] 라운드 행이 기존보다 얇은 로그형으로 바뀌고, R번호·승/패·누적 스코어·
  `endType` 기반 결과 라벨이 한 행에 정리된다.
- [x] 기존에 보이던 정보(라운드 번호·누적 스코어·승패·종료 결과)가 사라지지
  않는다.
- [x] **Mock에 없는 정보(첫 킬/스파이크 설치·해제자/클러치/킬 타임라인)는
  추가되지 않는다.**

### 4. 선택 라운드 상세 (선택)

- [x] (선택) 칩/행 선택 시 해당 라운드의 파생 가능한 정보가 강조 표시되며,
  새 이벤트 데이터를 생성하지 않는다. 미구현 시에도 1~3이 충족되면 통과.

### 5. 범위·접근성·빌드

- [x] UI8A의 탭 활성/접근성·전반/후반/연장 구분이 보존된다.
- [x] `frontend/public/assets`·`frontend/src/data`·`types/match.ts`에 신규
  파일/신규 Mock 필드 추가가 없다.
- [x] `cd frontend && npx tsc --noEmit` 성공.
- [x] `cd frontend && npm run lint` 성공.
- [x] `cd frontend && npm run build` 성공.
- [x] `git status --porcelain -- frontend/public/assets frontend/src/data frontend/package.json frontend/package-lock.json backend docker scripts`
  출력이 비어 있다.
- [x] `grep -rn "riotcdn.net\|media.valorant-api" frontend/src` 출력이 비어 있다.
- [x] `git diff -- frontend/src/components/MatchScoreboardTab.tsx` 출력이 비어 있다.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build

# 신규 자산/Mock/패키지 변경 없음 (출력 없어야 함)
cd .. && git status --porcelain -- \
  frontend/public/assets frontend/src/data frontend/package.json \
  frontend/package-lock.json backend docker scripts

# MatchRound 타입에 새 이벤트 필드 미추가 확인(육안/diff)
git diff -- frontend/src/types/match.ts

# 스코어보드 탭 미변경 확인 (출력 없어야 함)
git diff -- frontend/src/components/MatchScoreboardTab.tsx

# 라운드 이벤트 임의 생성 흔적 없음 (출력 없어야 함)
grep -rn "Math.random\|firstKill\|firstBlood\|plant\|defuser\|clutch\|multikill" frontend/src/components/MatchRoundsTab.tsx

# 외부 Riot CDN 런타임 참조 없음 (출력 없어야 함)
grep -rn "riotcdn.net\|media.valorant-api" frontend/src

# UI8A 접근성 보존 확인
grep -rn "role=\"tabpanel\"\|aria-selected\|aria-controls" frontend/src/components/MatchTabs.tsx frontend/src/components/MatchDetailPanel.tsx
```

## Stop Conditions

`BLOCKED`로 보고:

1. 라운드 타임라인 구현에 새 npm 패키지가 반드시 필요한 경우.
2. 신규 Mock 이벤트 또는 `MatchRound` 새 필드 없이는 요구를 만족할 수 없다고
   판단되는 경우(그 항목은 후속 Task로 분리하고 나머지만 진행).
3. 기존 로더·`asset-map`·`MatchRound` 타입 시그니처 변경이 불가피한 경우.
4. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

BLOCKED가 **아님**(계속 진행):

- 선택 라운드 상세(AC §4)를 구현하지 않는 경우(선택 사항).
- 공격/수비 side를 사실로 표기하지 않아 칩/요약에 side 정보가 비는 경우(의도된
  안전 동작 — Human Decisions 참조).
- rounds가 있는 경기가 Ascent 1건뿐이라 다른 경기에서 라운드 탭이 비는 경우
  (현재 Mock 한계, 정상).

## 운영 원칙 (Git / 커밋)

- **Codex 구현 단계에서는 Git add/commit/push를 하지 않는다.** 변경은 작업
  트리에만 남긴다.
- **Cursor 최종 리뷰**에서 BLOCKER/MAJOR가 없고 검증(`tsc`/`lint`/`build` +
  범위 확인)이 모두 통과하면, **별도 지시를 통해** commit/push까지 진행할 수
  있다.

## Human Decisions

| 항목 | 사람 판단 필요 | 기본 판단(미정 시) |
| --- | --- | --- |
| **라운드별/구간별 공격·수비 표기** — Mock의 attackers/defenders는 고정 팀 식별자라 진영 교체를 신뢰 단정 불가 | **YES** | **사실로 단정하지 않음.** (a) side 미표기(승/패·결과만) 또는 (b) "가정" 라벨 명시 후 R1–12/13–24 교체 규칙 적용 중 택1. 기본은 (a) |
| 칩 종료 결과 아이콘 표기 방식(제압/폭발/해제 텍스트 vs 기호) | 선택 | `endType` 파생 라벨/색만 사용, 신규 아이콘 자산 없이 CSS/문자 |
| 선택 라운드 상세(AC §4) 구현 여부 | 선택 | 1차에서는 선택. 범위 커지면 후속 분리 |
| 라운드 이벤트(첫 킬/스파이크 설치·해제자 등) Mock 추가 | **YES (후속)** | 이 Task 범위 아님. 신규 Mock 설계·승인 필요 → 별도 Task |

> 핵심 결정은 **공격/수비 표기**다. 데이터 신뢰성 원칙상 기본값은 "side를 사실로
> 표기하지 않음"이다. (b)를 택할 경우 화면·코드·문서에 "가정값"임을 명시해야 한다.

## Codex Implementation Notes

- Status: DONE (2026-06-22)
- 변경 파일:
  - `frontend/src/components/MatchRoundsTab.tsx`
  - `frontend/src/app/globals.css`
  - `docs/tasks/TASK-015UI8B.md`
  - `docs/PLAN.md`
  - `docs/PROGRESS.md`
- 구현 결과:
  - 라운드 탭 상단에 전반/후반/연장별 결과 칩 스트립을 추가했다.
  - 각 칩은 R번호, 우리 팀 기준 승/패, `endType` 기반 종료 라벨(제압/폭발/해제)을 표시하고, hover/focus/선택 상태를 가진 button으로 구현했다.
  - 구간 헤더에 라운드 수, 구간 승패, 구간 종료 누적 스코어, 종료 타입 분포를 표시했다.
  - 기존 큰 라운드 카드를 얇은 로그형 행으로 바꾸고, R번호·승패·누적 스코어·종료 타입·이벤트 기록 없음만 표시했다.
  - 칩/행 선택 시 선택 라운드 상세 영역에 R번호, 승패, 누적 스코어, 종료 타입을 표시한다.
  - 공격/수비 side, ATK/DEF, 공격팀/수비팀 라벨은 표시하지 않았다. `scoreAfterRound.attackers/defenders`는 누적 스코어 숫자 계산에만 사용했다.
- 검증 결과:
  - `cd frontend && npx tsc --noEmit`: 성공.
  - `cd frontend && npm run lint`: 성공.
  - `cd frontend && npm run build`: 성공.
  - `git diff --check`: 성공.
  - Forbidden 범위 확인 명령: 통과.
- 남은 위험:
  - 현재 Mock에는 실제 킬 이벤트, 첫 킬/첫 데스, 스파이크 설치·해제자, 클러치, 멀티킬 정보가 없어 라운드 상세는 파생 가능한 요약만 제공한다.
  - Git add/commit/push는 수행하지 않았다.

## Cursor Review Notes

> Cursor 최종 리뷰가 결과를 이 섹션에 기록한다. 리뷰 전까지는 비어 있다.

- Status: NOT_REVIEWED
- Verdict: (미정)
- 확인 권장 포인트:
  - 타임라인 칩 스트립이 파생 가능한 값(번호·승패·`endType`)만 쓰는지, 공격/수비
    side를 사실로 단정하지 않는지(Human Decisions 결정과 일치).
  - Mock/타입에 새 이벤트 필드·임의 수치가 추가되지 않았는지(`MatchRound` diff,
    `data/**` 미변경, `Math.random`/킬 이벤트 키워드 부재).
  - UI8A 보존: 탭 활성/접근성(`role="tabpanel"`·aria 연결), 전반/후반/연장 구분.
  - 범위 침범 없음: ScoreboardTab/public assets/package/backend/docker/scripts
    diff 0건, 외부 CDN 런타임 참조 0건.
  - 칩/행 키보드 접근·focus 가시성, 페이지 내부 중첩 스크롤 부재.
- BLOCKER / MAJOR / MINOR: (기록)
