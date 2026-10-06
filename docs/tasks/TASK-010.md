# TASK-010: 경기 상세

## Status

DONE (2026-06-13)

## Goal

`docs/PLAN.md` Phase 1, TASK-010("경기 상세")의 목표를 그대로 따른다.
`docs/SPEC.md`의 화면 목록 중 "경기 상세"(스코어보드, 라운드 타임라인)를
구현하고, TASK-009가 마련한 경기 상세 placeholder(비활성 버튼)를 실제 경기
상세 라우트로 연결되는 링크로 교체한다.

이 Task는 다음을 수행한다:

1. 새 동적 라우트 `frontend/src/app/matches/[matchId]/page.tsx`를 생성한다.
   라우트 파라미터 `matchId`로 TASK-006의 `getMatchDetail(matchId)`
   (`frontend/src/lib/mock-data.ts`)를 호출해 `MatchDetail`을 조회한다.
2. 조회한 `MatchDetail`로 스코어보드(참가자별 정보·전투 통계)와 라운드
   타임라인(라운드별 결과)을 렌더링한다.
3. 라우트 파라미터로 조회한 결과가 `null`인 경우(존재하지 않는 `matchId`)
   "경기를 찾을 수 없음" 안내를 표시한다.
4. TASK-009가 `frontend/src/components/MatchSummaryList.tsx`에 마련한 비활성
   버튼(`경기 상세 준비 중: {match.matchId}`)을, 1번에서 만든 라우트로 이동
   하는 링크로 교체한다. 카드의 다른 영역(필드/구조)은 수정하지 않는다.

다음은 이 Task의 범위가 아니다:

- 통계 기반 분석, 기준 통계 비교, AI 자연어 설명 (Phase 5)
- 라인업, 커뮤니티 기능 (Phase 3)
- 배포, 개인정보처리방침/이용약관, API Adapter, RSO 연동 등 Phase 2 이후
  기능 (TASK-011 이상)
- 플레이어 프로필 기본 정보/통계 요약 영역, 최근 경기 카드의 레이아웃
  (TASK-008/009 범위, 수정 금지 — placeholder 버튼 교체만 허용)
- 홈 화면/검색 (TASK-007 범위)
- TASK-006/TASK-007/TASK-008/TASK-009에서 만든 타입·Mock 데이터·데이터
  로더·기존 산출물의 수정 (이 Task는 그 결과를 "사용"만 한다, 단 위 4번의
  비활성 버튼 교체는 예외)

## Context

- `docs/PLAN.md` Phase 1 목표: "Mock JSON 파일로 전적 검색 흐름을 구현한다.
  분석 피드백은 제외한다." 완료 기준에 "경기 상세 페이지 렌더링 (스코어보드,
  타임라인)"이 포함된다.
- `docs/SPEC.md` 화면 목록(Phase 1-2): "경기 상세 | 스코어보드, 라운드
  타임라인".
- `docs/SPEC.md` 핵심 사용자 흐름: `홈 → Riot ID 검색 또는 데모 계정 선택 →
  플레이어 프로필 → 최근 경기 목록 → 경기 상세`. 이 Task로 이 흐름의 마지막
  단계가 완성된다.
- **TASK-006(Mock JSON 데이터 모델 정의)은 DONE**이다 (`docs/tasks/TASK-006.md`
  Result 참조). 이 Task가 재사용할 타입/로더
  (`frontend/src/types/match.ts`, `frontend/src/lib/mock-data.ts`):
  - `getMatchDetail(matchId: string): MatchDetail | null` — `matchId`로
    `mockData.matchDetails`에서 조회, 없으면 `null`.
  - `MatchDetail`: `matchId`, `map`, `mode`, `startedAt`,
    `durationSeconds`, `participants: MatchParticipant[]`,
    `rounds: MatchRound[]`.
  - `MatchParticipant`: `puuid`, `riotId`(`gameName`, `tagLine`), `team`,
    `agent`, `stats`(`CombatStats`).
  - `CombatStats`: `kills`, `deaths`, `assists`, `averageCombatScore`.
  - `MatchRound`: `roundNumber`, `winningTeam`, `endType`,
    `scoreAfterRound`(`attackers`, `defenders`).
- **TASK-007/TASK-008/TASK-009는 DONE**이다 (`docs/tasks/TASK-007.md`,
  `docs/tasks/TASK-008.md`, `docs/tasks/TASK-009.md` Result 참조).

### TASK-009 결과 재사용 및 확정된 사항

`docs/tasks/TASK-009.md` Result에 따라 다음을 그대로 재사용한다:

- **경기 상세 placeholder**: `frontend/src/components/MatchSummaryList.tsx`의
  각 경기 카드(`<article key={match.matchId}>`)에 다음 비활성 버튼이
  존재한다:

  ```tsx
  <button type="button" disabled>
    경기 상세 준비 중: {match.matchId}
  </button>
  ```

  TASK-009는 이 버튼으로 `MatchSummary.matchId`를 "TASK-010에서 사용할 상세
  식별자"로 노출했다. 이 Task는 이 버튼을 `match.matchId`를 사용해
  경기 상세 라우트로 이동하는 링크로 교체한다.
- **카드 레이아웃**: `MatchSummaryList`는 각 카드에서 맵/모드, 결과/시작
  시각, 요원/스코어/K-D-A를 표시하는 3개의 `<p>`와 위 버튼으로 구성된다. 이
  Task는 버튼만 교체하고 나머지 구조·내용은 변경하지 않는다.
- **식별자 일치**: `MatchSummary.matchId`와 `MatchDetail.matchId`는 동일한
  식별자 체계다(`getMatchDetail`이 `matchDetail.matchId === matchId`로
  조회하므로, `MatchSummaryList`가 노출한 `match.matchId`를 그대로
  `getMatchDetail`의 인자로 사용할 수 있다).

### 경기 상세 라우트 (이 Task에서 결정)

`docs/SPEC.md`와 선행 Task는 경기 상세의 라우트 경로를 정하지 않았다. 이
Task는 TASK-007이 `/players/[puuid]`로 확정한 패턴(동적 세그먼트 기반
프로필 라우트)과 동일한 방식으로, **`frontend/src/app/matches/[matchId]/page.tsx`**
(동적 세그먼트 `matchId`, `MatchSummary.matchId`/`MatchDetail.matchId` 기반)를
경기 상세 라우트로 신설한다. 최종 경로를 Result에 기록한다.

## Dependencies

- **선행 Task**:
  - TASK-006 (Mock JSON 데이터 모델 정의) — DONE (2026-06-13).
  - TASK-007 (홈 검색 화면) — DONE (`docs/tasks/TASK-007.md` Result 참조).
  - TASK-008 (데모 플레이어 프로필) — DONE (`docs/tasks/TASK-008.md` Result
    참조).
  - TASK-009 (최근 경기 목록) — DONE (`docs/tasks/TASK-009.md` Result 참조).
    **TASK-010은 사람의 시작 승인 전까지 시작하지 않는다.**
- **후속 Task**: TASK-011(배포 환경 구성, Phase 2)은 이 Task 완료 및 사람
  승인 전까지 만들거나 시작하지 않는다.

## Allowed changes

```
frontend/src/app/matches/[matchId]/page.tsx   # 신규: 경기 상세 라우트 (동적 세그먼트 matchId)
frontend/src/components/**                    # 신규 컴포넌트: 스코어보드, 라운드 타임라인 등 (예: MatchScoreboard, MatchRoundTimeline)
frontend/src/components/MatchSummaryList.tsx  # TASK-009의 비활성 버튼(경기 상세 준비 중: {matchId})을 경기 상세 라우트로의 링크로 교체. 그 외 영역(맵/모드/결과/스코어 등) 수정 금지
docs/tasks/TASK-010.md                        # 이 문서의 Result 갱신
```

- TASK-006이 작성한 `frontend/src/types/**`, `frontend/src/data/**`,
  `frontend/src/lib/**`은 가져오기(import)만 하고 수정하지 않는다.
- `frontend/src/components/PlayerProfile.tsx`,
  `frontend/src/app/players/[puuid]/page.tsx`는 수정하지 않는다.

## Forbidden changes

- `frontend/src/types/**`, `frontend/src/data/**`, `frontend/src/lib/**`
  (TASK-006 범위 — 사용만 하고 수정하지 않음)
- `frontend/src/app/page.tsx`, `frontend/src/app/layout.tsx`,
  `frontend/src/app/globals.css`, `frontend/src/components/HomeSearch.tsx`
  (TASK-007 범위)
- `frontend/src/app/players/[puuid]/page.tsx`,
  `frontend/src/components/PlayerProfile.tsx` (TASK-008 범위)
- `frontend/src/components/MatchSummaryList.tsx`의 비활성 버튼 외 영역
  (맵/모드, 결과/시작 시각, 요원/스코어/K-D-A 표시) (TASK-009 범위 — 버튼
  교체만 허용)
- 통계 기반 분석, 기준 통계 비교, AI 자연어 설명 (Phase 5)
- 라인업, 커뮤니티 관련 UI/로직 (Phase 3)
- 배포 환경, 개인정보처리방침/이용약관, API Adapter, RSO 연동 등 (TASK-011
  이상, Phase 2 이후)
- `backend/**`, `docker/**`, `scripts/**`
- `frontend/package.json`, `frontend/package-lock.json` (새 의존성 추가
  포함)
- Riot API 실제 호출, 인증/세션 관련 코드
- `AGENTS.md`, `CLAUDE.md`, `docs/PLAN.md`, `docs/PROGRESS.md`,
  `docs/tasks/TASK-006.md`, `docs/tasks/TASK-007.md`, `docs/tasks/TASK-008.md`,
  `docs/tasks/TASK-009.md`
- TASK-011 이상 작업 시작

## Acceptance criteria

1. **경기 상세 라우트 및 기본 정보**
   - [x] `frontend/src/app/matches/[matchId]/page.tsx`를 생성하고, 라우트
     파라미터 `matchId`로 `getMatchDetail(matchId)`를 호출해 `MatchDetail`을
     조회한다.
   - [x] `map`, `mode`, `startedAt`, `durationSeconds` 중 1개 이상을
     표시한다 (표시한 필드를 Result에 기록한다).

2. **스코어보드**
   - [x] `MatchDetail.participants`(`MatchParticipant[]`)를 스코어보드 형태로
     렌더링한다. 각 참가자의 Riot ID(`riotId.gameName#riotId.tagLine`),
     `team`, `agent`와 `stats`(`kills`/`deaths`/`assists`/
     `averageCombatScore`)를 표시한다.

3. **라운드 타임라인**
   - [x] `MatchDetail.rounds`(`MatchRound[]`)를 `roundNumber` 순서대로
     렌더링한다. 각 라운드의 `roundNumber`, `winningTeam`, `endType`,
     `scoreAfterRound`(`attackers`/`defenders`) 중 1개 이상을 표시한다
     (표시한 필드를 Result에 기록한다).

4. **존재하지 않는 matchId 처리**
   - [x] `getMatchDetail(matchId)` 결과가 `null`인 경우, 에러 없이 "경기를
     찾을 수 없음"류의 안내 UI를 표시한다 (페이지 크래시/예외 없음).

5. **TASK-009 placeholder 연결**
   - [x] `frontend/src/components/MatchSummaryList.tsx`의 비활성 버튼
     (`경기 상세 준비 중: {match.matchId}`)을, `match.matchId`를 사용해
     1번에서 만든 경기 상세 라우트로 이동하는 링크로 교체한다.
   - [x] `MatchSummaryList`의 다른 영역(맵/모드, 결과/시작 시각, 요원/스코어/
     K-D-A)은 변경하지 않는다. 사용한 링크 형태(예: Next.js `Link`의 `href`
     패턴)를 Result에 기록한다.

6. **빌드 및 정적 검사**
   - [x] `cd frontend && npx tsc --noEmit` 성공 (타입 에러 없음).
   - [x] `cd frontend && npm run lint` 성공 (경고/에러 없음).
   - [x] `cd frontend && npm run build` 성공.

7. **범위 확인**
   - [x] `git status --porcelain -- frontend/src/types frontend/src/data
     frontend/src/lib` 출력이 비어 있다 (TASK-006 산출물 미변경).
   - [x] `git status --porcelain -- frontend/src/app/page.tsx
     frontend/src/app/layout.tsx frontend/src/app/globals.css
     frontend/src/components/HomeSearch.tsx` 출력이 비어 있다 (TASK-007
     산출물 미변경).
   - [x] `git status --porcelain -- "frontend/src/app/players/[puuid]/page.tsx"
     frontend/src/components/PlayerProfile.tsx` 출력이 비어 있다 (TASK-008
     산출물 미변경).
   - [x] `git status --porcelain -- frontend/package.json
     frontend/package-lock.json backend docker scripts` 출력이 비어 있다.
   - [x] `git diff -- frontend/src/components/MatchSummaryList.tsx`에서
     비활성 버튼을 링크로 교체한 변경 외에 다른 변경이 없음을 Result에
     명시한다 (diff로 확인한 근거 포함).
   - [x] Result에 TASK-011 이상 범위 작업을 시작하지 않았음을 명시한다.

## Verification commands

```bash
# 1) 타입 검사
cd frontend && npx tsc --noEmit

# 2) Lint
cd frontend && npm run lint

# 3) 빌드
cd frontend && npm run build

# 4) 범위 확인 (출력이 비어 있어야 함, staged·unstaged·untracked 모두 포함)
cd .. && git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib
git status --porcelain -- frontend/src/app/page.tsx frontend/src/app/layout.tsx frontend/src/app/globals.css frontend/src/components/HomeSearch.tsx
git status --porcelain -- "frontend/src/app/players/[puuid]/page.tsx" frontend/src/components/PlayerProfile.tsx
git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts

# 5) 변경된 파일 확인 (Allowed 영역만 존재해야 함)
git status --porcelain -- frontend/src/app/matches frontend/src/app/players frontend/src/components

# 6) MatchSummaryList.tsx 변경 범위 확인 (비활성 버튼 교체 외 변경 없어야 함)
git diff -- frontend/src/components/MatchSummaryList.tsx
```

## Stop conditions

다음 상황에서 작업을 중단하고 `BLOCKED`로 보고한다:

1. 사람의 시작 승인이 없는 상태에서 이 Task를 시작하게 되는 경우 (시작
   자체를 중단한다).
2. 이 문서에 기록한 `getMatchDetail`/`MatchDetail`/`MatchParticipant`/
   `MatchRound` 타입이나 `frontend/src/components/MatchSummaryList.tsx`의
   비활성 버튼 구조가 실제 `frontend/src/lib/mock-data.ts`,
   `frontend/src/types/match.ts`,
   `frontend/src/components/MatchSummaryList.tsx`의 현재 상태와 달라
   Acceptance criteria를 재정의해야 하는 경우 — 임의로 새 가정을 추가하지
   말고 BLOCKED로 보고한다.
3. Acceptance criteria를 만족하기 위해 새로운 npm 패키지 설치가 필요한 경우.
4. 통계 기반 분석, 기준 통계 비교, AI 자연어 설명, 라인업/커뮤니티, 배포 등
   TASK-011 이상 범위(Phase 2 이후) 구현이 불가피한 경우.
5. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

## Result

DONE (2026-06-13)

### Changed files

- `frontend/src/app/matches/[matchId]/page.tsx`
  - 새 경기 상세 동적 라우트 `/matches/[matchId]`를 생성했다.
  - 라우트 파라미터 `matchId`를 `decodeURIComponent`로 복원한 뒤
    `getMatchDetail(matchId)`로 `MatchDetail`을 조회한다.
  - 조회 결과가 없으면 "경기를 찾을 수 없음" 안내를 표시한다.
- `frontend/src/components/MatchDetailView.tsx`
  - `MatchDetail` 기본 정보와 하위 상세 섹션을 렌더링한다.
  - 표시 필드: `map`, `mode`, `startedAt`, `durationSeconds`.
- `frontend/src/components/MatchScoreboard.tsx`
  - `participants`를 스코어보드 형태로 렌더링한다.
  - 표시 필드: Riot ID(`gameName#tagLine`), `team`, `agent`,
    `kills`, `deaths`, `assists`, `averageCombatScore`.
- `frontend/src/components/MatchRoundTimeline.tsx`
  - `rounds`를 `roundNumber` 오름차순으로 렌더링한다.
  - 표시 필드: `roundNumber`, `winningTeam`, `endType`,
    `scoreAfterRound.attackers`, `scoreAfterRound.defenders`.
- `frontend/src/components/MatchSummaryList.tsx`
  - TASK-009의 비활성 버튼만 Next.js `Link`로 교체했다.
  - 링크 형태: `href={`/matches/${encodeURIComponent(match.matchId)}`}`.
  - `git diff -- frontend/src/components/MatchSummaryList.tsx` 확인 결과,
    변경은 `next/link` import 추가와 비활성 버튼을 링크로 바꾼 부분뿐이다.
- `docs/tasks/TASK-010.md`
  - Status, Acceptance criteria 체크박스, Result를 실제 결과에 맞게 갱신했다.

### Verification results

- `cd frontend && npx tsc --noEmit` — 성공.
- `cd frontend && npm run lint` — 성공, ESLint 경고/에러 없음.
- `cd frontend && npm run build` — 성공.
- `git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib`
  — 출력 없음, TASK-006 산출물 미변경.
- `git status --porcelain -- frontend/src/app/page.tsx frontend/src/app/layout.tsx frontend/src/app/globals.css frontend/src/components/HomeSearch.tsx`
  — 출력 없음, TASK-007 산출물 미변경.
- `git status --porcelain -- "frontend/src/app/players/[puuid]/page.tsx" frontend/src/components/PlayerProfile.tsx`
  — 출력 없음, TASK-008 산출물 미변경.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`
  — 출력 없음, package/backend/docker/scripts 미변경.
- `git status --porcelain -- frontend/src/app/matches frontend/src/app/players frontend/src/components`
  — 허용된 `frontend/src/app/matches/**` 신규 파일과
    `frontend/src/components/**` 변경만 확인했다.
- `git diff -- frontend/src/components/MatchSummaryList.tsx`
  — 비활성 버튼 교체 외 카드 필드/구조 변경 없음.

### Notes

- `npx tsc --noEmit` 실행 중 `frontend/tsconfig.tsbuildinfo`가 생성되었으나,
  TASK-010 허용 범위 밖 임시 산출물이므로 최종 작업 트리에서 제거했다.
- TASK-011 이상 범위 작업은 만들거나 시작하지 않았다.
- 남은 위험: 현재 UI는 기존 전역 스타일을 재사용하며, 경기 상세 전용 시각
  디자인 개선은 별도 Task에서 다루는 것이 안전하다.
