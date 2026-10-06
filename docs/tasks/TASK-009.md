# TASK-009: 최근 경기 목록

## Status

DONE

## Goal

`docs/PLAN.md` Phase 1, TASK-009("최근 경기 목록")의 목표를 그대로 따른다.
`docs/SPEC.md`의 화면 목록 중 "최근 경기 목록"(경기 카드 리스트)을 구현하고,
TASK-008이 마련한 "최근 경기" 섹션 placeholder를 실제 목록으로 교체한다.

이 Task는 다음을 수행한다:

1. TASK-006의 `getRecentMatchesForPlayer(puuid)`(`frontend/src/lib/mock-data.ts`)로
   조회한 `MatchSummary[]`를 경기 카드 리스트로 렌더링하고,
   `frontend/src/components/PlayerProfile.tsx`의 "최근 경기" 섹션
   (`recent-matches-heading`)에 배치한다(TASK-008에서 확정).
2. 조회 결과가 빈 배열인 경우 "최근 경기 없음"류의 안내 UI를 표시한다.
3. 각 경기 카드에 경기 상세(TASK-010)로 이동할 수 있는 링크/요소의
   placeholder를 마련한다. 실제 경기 상세 페이지/라우트는 구현하지 않는다.

다음은 이 Task의 범위가 아니다:

- 경기 상세 페이지의 실제 렌더링(스코어보드, 라운드 타임라인) (TASK-010)
- 플레이어 프로필의 기본 정보 / 랭크 / 통계 요약 영역 (TASK-008 범위, 수정
  금지 — "최근 경기" 섹션만 대상으로 한다)
- 홈 화면/검색/데모 계정 선택 UI (TASK-007 범위)
- Riot API 실제 연동, 인증, 분석, 라인업, 커뮤니티 등 이후 Phase 기능
- TASK-006/TASK-007/TASK-008에서 만든 타입·Mock 데이터·데이터 로더·기존
  산출물의 수정 (이 Task는 그 결과를 "사용"만 한다)

## Context

- `docs/PLAN.md` Phase 1 목표: "Mock JSON 파일로 전적 검색 흐름을 구현한다.
  분석 피드백은 제외한다." 완료 기준에 "최근 경기 목록 표시"가 포함된다.
- `docs/SPEC.md` 화면 목록(Phase 1-2): "최근 경기 목록 | 경기 카드 리스트".
- `docs/SPEC.md` 핵심 사용자 흐름: `홈 → Riot ID 검색 또는 데모 계정 선택 →
  플레이어 프로필 → 최근 경기 목록 → 경기 상세`.
- **TASK-006(Mock JSON 데이터 모델 정의)은 DONE**이다 (`docs/tasks/TASK-006.md`
  Result 참조). 이 Task가 재사용할 타입/로더:
  - `frontend/src/types/index.ts`: `MatchSummary`, `MatchDetail` 등.
  - `frontend/src/lib/mock-data.ts`: `getRecentMatchesForPlayer(puuid)`,
    `getMatchDetail(matchId)`.
- **TASK-007(홈 검색 화면)은 DONE으로 완료됐다** (`docs/tasks/TASK-007.md`
  Result 참조).
- **TASK-008(데모 플레이어 프로필)은 DONE이다** (`docs/tasks/TASK-008.md`
  Result 참조). TASK-008이 확정한 결과물은 아래 "TASK-008 결과 재사용 및
  확정된 사항"에 정리한다.

### TASK-008 결과 재사용 및 확정된 사항

`docs/tasks/TASK-008.md` Result에 따라 다음 결과물을 그대로 재사용한다:

- **확정된 최근 경기 목록 배치**: 같은 프로필 페이지(`/players/[puuid]`) 안,
  `frontend/src/components/PlayerProfile.tsx`의 "최근 경기" 섹션
  (`<section aria-labelledby="recent-matches-heading">`,
  `<h2 id="recent-matches-heading">최근 경기</h2>`)에 배치한다. TASK-008은
  이 섹션에 다음 placeholder 문단만 추가했다:

  > 최근 경기 목록은 이 프로필 페이지의 하위 섹션으로 배치합니다. 실제 목록
  > 렌더링은 TASK-009에서 구현합니다.

  TASK-009는 이 placeholder 문단을 실제 경기 카드 리스트로 교체한다.
- **`PlayerProfile` 컴포넌트 props**: `PlayerProfile`은 `player: Player`를
  prop으로 받는다(`frontend/src/components/PlayerProfile.tsx`). `Player`에는
  `puuid` 필드가 포함되므로(`frontend/src/lib/mock-data.ts`의
  `getDemoPlayerByPuuid` 구현에서 `player.puuid === puuid`로 조회), 컴포넌트
  내부에서 `getRecentMatchesForPlayer(player.puuid)`를 호출해
  `MatchSummary[]`를 조회할 수 있다. 이를 위해 `PlayerProfile.tsx`에
  `getRecentMatchesForPlayer` import를 추가하는 것은 이 Task의 허용 범위다.
- **라우트/플레이어 없음 처리**: `frontend/src/app/players/[puuid]/page.tsx`는
  `getDemoPlayerByPuuid(puuid)`로 조회한 `player`가 있으면
  `<PlayerProfile player={player} />`를 렌더링하고, 없으면 "플레이어를 찾을
  수 없음" 안내를 렌더링한다. 이 라우트 파일은 TASK-009에서 수정할 필요가
  없다.
- **`MatchSummary` 타입**(`frontend/src/types/match.ts`, TASK-006):
  `matchId`, `map`, `mode`, `startedAt`, `result`, `agent`, `team`,
  `score`(`roundsWon`, `roundsLost`), `stats`(`CombatStats`) 필드를 포함한다.

## Dependencies

- **선행 Task**:
  - TASK-006 (Mock JSON 데이터 모델 정의) — DONE (2026-06-13).
  - TASK-007 (홈 검색 화면) — DONE (`docs/tasks/TASK-007.md` Result 참조).
  - TASK-008 (데모 플레이어 프로필) — DONE (`docs/tasks/TASK-008.md` Result
    참조). **TASK-009는 사람의 시작 승인 전까지 시작하지 않는다.**
- **후속 Task**: TASK-010(경기 상세)은 이 Task에서 마련하는 경기 상세 링크
  placeholder를 따른다. 이 Task 완료 및 사람 승인 전까지 TASK-010은 만들거나
  시작하지 않는다.

## Allowed changes

```
frontend/src/components/PlayerProfile.tsx   # "최근 경기" 섹션(recent-matches-heading)의 placeholder 문단을 실제 경기 카드 리스트로 교체. getRecentMatchesForPlayer import 추가 허용.
frontend/src/components/**                  # 새 컴포넌트: 경기 카드/목록 (예: MatchSummaryList, MatchCard)
docs/tasks/TASK-009.md                      # 이 문서의 Result 갱신
```

- TASK-006이 작성한 `frontend/src/types/**`, `frontend/src/data/**`,
  `frontend/src/lib/**`은 가져오기(import)만 하고 수정하지 않는다.
- `PlayerProfile.tsx`의 "기본 정보"(`player-profile-heading`) 및 "통계
  요약"(`player-stats-heading`) 섹션은 수정하지 않는다. "최근
  경기"(`recent-matches-heading`) 섹션만 대상으로 한다.
- `frontend/src/app/players/[puuid]/page.tsx`는 수정하지 않는다. `player`
  객체가 이미 `PlayerProfile`에 전달되므로, `player.puuid`로
  `getRecentMatchesForPlayer`를 호출하는 데 라우트 파일 변경이 필요하지
  않다.

## Forbidden changes

- `frontend/src/types/**`, `frontend/src/data/**`, `frontend/src/lib/**`
  (TASK-006 범위 — 사용만 하고 수정하지 않음)
- `frontend/src/app/page.tsx`, `frontend/src/app/layout.tsx`,
  `frontend/src/app/globals.css`, `frontend/src/components/HomeSearch.tsx`
  (TASK-007 범위)
- `frontend/src/app/players/[puuid]/page.tsx` (TASK-008 산출물 — 수정 불필요)
- `PlayerProfile.tsx`의 "기본 정보"(`player-profile-heading`) 및 "통계
  요약"(`player-stats-heading`) 섹션 (단, "최근
  경기"(`recent-matches-heading`) 섹션의 placeholder 교체는 허용)
- 경기 상세의 실제 렌더링, 경기 상세 라우트/페이지 신설 (TASK-010 범위)
- `backend/**`, `docker/**`, `scripts/**`
- `frontend/package.json`, `frontend/package-lock.json` (새 의존성 추가
  포함)
- Riot API 실제 호출, 인증/세션 관련 코드
- 분석, 라인업, 커뮤니티 관련 UI/로직
- `AGENTS.md`, `CLAUDE.md`, `docs/PLAN.md`, `docs/PROGRESS.md`,
  `docs/tasks/TASK-006.md`, `docs/tasks/TASK-007.md`, `docs/tasks/TASK-008.md`
- TASK-010 이상 작업 시작

## Acceptance criteria

1. **경기 카드 리스트 렌더링**
   - [x] `PlayerProfile.tsx`의 "최근 경기" 섹션(`recent-matches-heading`)에서
     `getRecentMatchesForPlayer(player.puuid)`로 조회한 `MatchSummary[]`를
     경기 카드 리스트로 표시하고, TASK-008이 추가한 placeholder 문단("최근
     경기 목록은 이 프로필 페이지의 하위 섹션으로 배치합니다...")을 제거한다.
   - [x] 각 카드에 `MatchSummary`(`frontend/src/types/match.ts`)의 `map`,
     `mode`, `result`, `startedAt` 중 1개 이상을 표시한다 (표시한 필드를
     Result에 기록한다).

2. **빈 목록 처리**
   - [x] `getRecentMatchesForPlayer(puuid)` 결과가 빈 배열인 경우, 에러 없이
     "최근 경기 없음"류의 안내 UI를 표시한다 (페이지 크래시/예외 없음).

3. **경기 상세 링크 placeholder**
   - [x] 각 경기 카드에 경기 상세(TASK-010)로 연결될 자리(링크/버튼 등)의
     최소 placeholder를 둔다. `MatchSummary.matchId`를 식별자로 사용할 수
     있다. 실제 경기 상세 라우트/페이지는 구현하지 않으며, 클릭 시 동작은
     없거나 비활성 상태여도 무방하다.
   - [x] 사용한 placeholder 형태(예: 링크 `href` 패턴, 비활성 버튼 등)를
     Result에 기록한다. TASK-010이 참고할 수 있도록 구체적으로 작성한다.

4. **빌드 및 정적 검사**
   - [x] `cd frontend && npx tsc --noEmit` 성공 (타입 에러 없음).
   - [x] `cd frontend && npm run lint` 성공 (경고/에러 없음).
   - [x] `cd frontend && npm run build` 성공.

5. **범위 확인**
   - [x] `git status --porcelain -- frontend/src/types frontend/src/data
     frontend/src/lib` 출력이 비어 있다 (TASK-006 산출물 미변경).
   - [x] `git status --porcelain -- frontend/src/app/page.tsx
     frontend/src/app/layout.tsx frontend/src/app/globals.css
     frontend/src/components/HomeSearch.tsx` 출력이 비어 있다 (TASK-007 홈
     화면 산출물 미변경).
   - [x] `git status --porcelain -- frontend/package.json
     frontend/package-lock.json backend docker scripts` 출력이 비어 있다.
   - [x] `git status --porcelain -- frontend/src/app/players/[puuid]/page.tsx`
     출력이 비어 있다 (TASK-008 라우트 파일 미변경).
   - [x] `PlayerProfile.tsx`의 "기본 정보"(`player-profile-heading`) 및
     "통계 요약"(`player-stats-heading`) 섹션을 변경하지 않았음을 Result에
     명시한다 (diff로 확인한 근거 포함).
   - [x] Result에 TASK-010 이상 범위 작업을 시작하지 않았음을 명시한다.

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
git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts
git status --porcelain -- "frontend/src/app/players/[puuid]/page.tsx"

# 5) 변경된 파일 확인 (Allowed 영역만 존재해야 함)
git status --porcelain -- frontend/src/app/players frontend/src/components
```

## Stop conditions

다음 상황에서 작업을 중단하고 `BLOCKED`로 보고한다:

1. 사람의 시작 승인이 없는 상태에서 이 Task를 시작하게 되는 경우 (시작 자체를
   중단한다).
2. 이 문서에 기록한 `PlayerProfile.tsx`의 "최근 경기" 섹션
   (`recent-matches-heading`) 구조, `player.puuid`, 또는
   `getRecentMatchesForPlayer`/`MatchSummary`가 실제
   `frontend/src/components/PlayerProfile.tsx`,
   `frontend/src/lib/mock-data.ts`, `frontend/src/types/match.ts`의 현재
   상태와 달라 Acceptance criteria 1을 재정의해야 하는 경우 — 임의로 새
   가정을 추가하지 말고 BLOCKED로 보고한다.
3. Acceptance criteria를 만족하기 위해 새로운 npm 패키지 설치가 필요한 경우.
4. 경기 상세 페이지/라우트의 실제 구현(TASK-010 범위)이 불가피한 경우.
5. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

## Result

**상태**: DONE

**변경된 파일**:
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/MatchSummaryList.tsx`
- `docs/tasks/TASK-009.md`

**구현 내용**:
- `PlayerProfile.tsx`의 `recent-matches-heading` 섹션에서 TASK-008 placeholder
  문단을 제거하고 `MatchSummaryList`를 렌더링하도록 교체했다.
- `getRecentMatchesForPlayer(player.puuid)`로 TASK-006 Mock 최근 경기 목록을
  조회한다.
- `MatchSummaryList`는 `MatchSummary[]`를 경기 카드 리스트로 렌더링한다.
- 빈 배열이면 예외 없이 `최근 경기 없음` 안내를 표시한다.

**경기 카드 표시 필드**:
- `map`
- `mode`
- `result`
- `startedAt`
- `agent`
- `score.roundsWon`
- `score.roundsLost`
- `stats.kills`
- `stats.deaths`
- `stats.assists`

**경기 상세 placeholder 결정**:
- 각 경기 카드에 비활성 버튼을 둔다.
- 버튼 문구는 `경기 상세 준비 중: {matchId}`이며, `MatchSummary.matchId`를
  TASK-010에서 사용할 상세 식별자로 노출한다.
- 실제 경기 상세 라우트나 페이지는 만들지 않았다.

**실행한 명령**:
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- `git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib`
- `git status --porcelain -- frontend/src/app/page.tsx frontend/src/app/layout.tsx frontend/src/app/globals.css frontend/src/components/HomeSearch.tsx`
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`
- `git status --porcelain -- "frontend/src/app/players/[puuid]/page.tsx"`
- `git status --porcelain -- frontend/src/app/players frontend/src/components`
- `git diff -- frontend/src/components/PlayerProfile.tsx`

**검증 결과**:
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공. ESLint 경고/에러 없음.
- `cd frontend && npm run build`: 성공.
- `git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib`: 출력 없음.
- `git status --porcelain -- frontend/src/app/page.tsx frontend/src/app/layout.tsx frontend/src/app/globals.css frontend/src/components/HomeSearch.tsx`: 출력 없음.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`: 출력 없음.
- `git status --porcelain -- "frontend/src/app/players/[puuid]/page.tsx"`: 출력 없음.
- `git status --porcelain -- frontend/src/app/players frontend/src/components`: TASK-009 허용 영역 변경만 출력.
- `git diff -- frontend/src/components/PlayerProfile.tsx`: import 추가, `recentMatches`
  조회 추가, `recent-matches-heading` 섹션의 placeholder 교체만 확인했다.

**남은 위험**:
- `npx tsc --noEmit`가 `frontend/tsconfig.tsbuildinfo`를 생성할 수 있으므로 검증
  후 제거한다.
- 실제 경기 상세 라우트와 상세 렌더링은 TASK-010에서 구현해야 한다.

**범위 확인**:
- TASK-006 산출물(`frontend/src/types/**`, `frontend/src/data/**`,
  `frontend/src/lib/**`)은 수정하지 않고 import만 했다.
- TASK-007 산출물(`frontend/src/app/page.tsx`, `layout.tsx`, `globals.css`,
  `HomeSearch.tsx`)은 수정하지 않았다.
- TASK-008 라우트 파일(`frontend/src/app/players/[puuid]/page.tsx`)은 수정하지 않았다.
- `PlayerProfile.tsx`의 기본 정보(`player-profile-heading`) 및 통계 요약
  (`player-stats-heading`) 섹션은 수정하지 않았다. diff에서 해당 섹션의 본문
  변경은 없고, 최근 경기 섹션만 placeholder에서 목록 컴포넌트로 교체됐다.
- `backend/**`, `docker/**`, `scripts/**`, 패키지 파일은 수정하지 않았다.
- Riot API, 인증, 분석, 라인업, 커뮤니티 기능은 구현하지 않았다.
- TASK-010 이상 작업은 시작하지 않았다.
- `docs/tasks/TASK-010.md`는 참조하거나 수정하지 않았다.
