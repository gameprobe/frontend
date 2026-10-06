# TASK-008: 데모 플레이어 프로필

## Status

DONE

## Goal

`docs/PLAN.md` Phase 1, TASK-008("데모 플레이어 프로필")의 목표를 그대로
따른다. `docs/SPEC.md`의 화면 목록 중 "플레이어 프로필"(기본 정보, 랭크,
통계 요약)을 구현하고, TASK-007이 확정한 `/players/[puuid]` 프로필 라우트의
placeholder를 실제 콘텐츠로 교체한다.

이 Task는 다음을 수행한다:

1. TASK-007이 만든 `frontend/src/app/players/[puuid]/page.tsx`(placeholder)에
   실제 콘텐츠를 구현한다: Riot ID(게임네임#태그), 현재 랭크, 통계 요약
   (`PlayerStatsSummary`)을 표시한다. TASK-006의 `getDemoPlayerByPuuid(puuid)`로
   플레이어 데이터를 조회한다.
2. 라우트 파라미터로 조회되는 플레이어가 없는 경우(존재하지 않는 식별자) "플레이어를
   찾을 수 없음" 안내를 표시한다.
3. 최근 경기 목록(TASK-009)을 어디에 배치할지 결정하고, 최소한의
   placeholder(섹션 제목 등)를 마련한다. 실제 경기 목록은 구현하지 않는다.
   이 결정은 TASK-009가 따른다.

다음은 이 Task의 범위가 아니다:

- 최근 경기 목록의 실제 렌더링 (TASK-009)
- 경기 상세 (TASK-010)
- 홈 화면/검색/데모 계정 선택 UI 수정 (TASK-007 범위)
- Riot API 실제 연동, 인증, 분석, 라인업, 커뮤니티 등 이후 Phase 기능
- TASK-006/TASK-007에서 만든 타입·Mock 데이터·데이터 로더·홈 화면 자체의 수정
  (이 Task는 그 결과를 "사용"만 한다)

## Context

- `docs/PLAN.md` Phase 1 목표: "Mock JSON 파일로 전적 검색 흐름을 구현한다.
  분석 피드백은 제외한다." 완료 기준에 "플레이어 프로필 페이지 렌더링"이
  포함된다.
- `docs/SPEC.md` 화면 목록(Phase 1-2): "플레이어 프로필 | 기본 정보, 랭크,
  통계 요약".
- `docs/SPEC.md` 핵심 사용자 흐름: `홈 → Riot ID 검색 또는 데모 계정 선택 →
  플레이어 프로필 → 최근 경기 목록 → 경기 상세`.
- **TASK-006(Mock JSON 데이터 모델 정의)은 DONE**이다 (`docs/tasks/TASK-006.md`
  Result 참조). 이 Task가 재사용할 타입/로더:
  - `frontend/src/types/index.ts`: `Player`, `RiotId`, `PlayerStatsSummary`,
    `MatchSummary`, `MatchDetail` 등.
  - `frontend/src/lib/mock-data.ts`: `getDemoPlayers()`,
    `getDemoPlayerByPuuid(puuid)`, `getDemoPlayerByRiotId(riotId)`,
    `getRecentMatchesForPlayer(puuid)`, `getMatchDetail(matchId)`.
  - 데모 플레이어는 1명(`SeoulDuelist#KR1`)이며, 존재하지 않는 식별자 조회 시
    `getDemoPlayerByPuuid`/`getDemoPlayerByRiotId`는 `null`을 반환한다.
- **TASK-007(홈 검색 화면)은 DONE으로 완료됐다** (`docs/tasks/TASK-007.md`
  Result 참조). TASK-007이 확정한 프로필 라우트 경로/식별자 조회 함수는 아래
  "TASK-007 결과 재사용 및 TASK-008에서 결정할 사항"에 정리한다.

### TASK-007 결과 재사용 및 TASK-008에서 결정할 사항

`docs/tasks/TASK-007.md` Result에 따라 다음 결과물을 그대로 재사용한다:

- **확정된 프로필 라우트**: `frontend/src/app/players/[puuid]/page.tsx`
  (동적 세그먼트 `puuid`, PUUID 기반). 현재는 받은 `puuid`만 표시하는 최소
  placeholder이며, TASK-008이 이를 실제 콘텐츠로 교체한다.
- **확정된 식별자 조회 함수**: 라우트 파라미터 `puuid`로
  `getDemoPlayerByPuuid(puuid)`(`frontend/src/lib/mock-data.ts`, TASK-006)를
  호출해 `Player` 데이터를 조회한다.
- **TASK-007 산출물(수정 금지)**: `frontend/src/app/page.tsx`,
  `frontend/src/app/globals.css`, `frontend/src/components/HomeSearch.tsx`.

다음 항목은 TASK-007이 결정하지 않았으며, 이 Task(TASK-008)에서 결정하고
Result에 기록한다:

- **[Pending] 최근 경기 목록 배치**: `docs/SPEC.md`는 "플레이어 프로필"과
  "최근 경기 목록"을 별도 화면으로 나열하지만, 별도 라우트인지 같은 페이지의
  섹션인지는 명시하지 않는다. 이 Task에서 결정하고(예: 프로필 페이지 내
  "최근 경기" 섹션 + placeholder, 또는 별도 라우트로의 링크) Result에
  기록한다. TASK-009는 이 결정을 따른다.

## Dependencies

- **선행 Task**:
  - TASK-006 (Mock JSON 데이터 모델 정의) — DONE (2026-06-13).
  - TASK-007 (홈 검색 화면) — DONE (`docs/tasks/TASK-007.md` Result 참조).
    **TASK-008은 사람의 시작 승인 전까지 시작하지 않는다.**
- **후속 Task**: TASK-009(최근 경기 목록)는 이 Task에서 결정하는 "최근 경기
  목록 배치"(Pending 항목 참조)를 따른다. 이 Task 완료 및 사람 승인 전까지
  TASK-009는 만들거나 시작하지 않는다.

## Allowed changes

```
frontend/src/app/players/[puuid]/page.tsx   # TASK-007 placeholder를 실제 프로필 콘텐츠로 교체
frontend/src/components/**                  # 새 디렉터리/파일: 프로필 표시용 컴포넌트
docs/tasks/TASK-008.md                      # 이 문서의 Result 갱신
```

- TASK-006이 작성한 `frontend/src/types/**`, `frontend/src/data/**`,
  `frontend/src/lib/**`은 가져오기(import)만 하고 수정하지 않는다.
- TASK-007이 작성한 `frontend/src/app/page.tsx`,
  `frontend/src/app/globals.css`, `frontend/src/components/HomeSearch.tsx`,
  `frontend/src/app/layout.tsx`은 수정하지 않는다.

## Forbidden changes

- `frontend/src/types/**`, `frontend/src/data/**`, `frontend/src/lib/**`
  (TASK-006 범위 — 사용만 하고 수정하지 않음)
- `frontend/src/app/page.tsx`, `frontend/src/app/layout.tsx`,
  `frontend/src/app/globals.css`, `frontend/src/components/HomeSearch.tsx`
  (TASK-007 범위)
- 최근 경기 목록의 실제 렌더링, 경기 상세 (TASK-009, TASK-010 범위)
- `backend/**`, `docker/**`, `scripts/**`
- `frontend/package.json`, `frontend/package-lock.json` (새 의존성 추가
  포함)
- Riot API 실제 호출, 인증/세션 관련 코드
- 분석, 라인업, 커뮤니티 관련 UI/로직
- `AGENTS.md`, `CLAUDE.md`, `docs/PLAN.md`, `docs/PROGRESS.md`,
  `docs/tasks/TASK-006.md`, `docs/tasks/TASK-007.md`
- TASK-009 이상 작업 시작

## Acceptance criteria

1. **기본 정보 / 랭크 / 통계 요약 표시**
   - [x] `frontend/src/app/players/[puuid]/page.tsx`에서
     `getDemoPlayerByPuuid(puuid)`로 조회한 `Player` 데이터를 사용해 Riot
     ID(`게임네임#태그`)를 표시한다.
   - [x] 현재 랭크를 표시한다.
   - [x] `PlayerStatsSummary`에 포함된 통계 요약 항목을 1개 이상 표시한다
     (정확한 필드는 `frontend/src/types/`를 확인해 사용하고, 표시한 필드를
     Result에 기록한다).

2. **존재하지 않는 식별자 처리**
   - [x] 라우트 파라미터로 조회한 결과가 `null`인 경우, 에러 없이 "플레이어를
     찾을 수 없음"류의 안내 UI를 표시한다 (페이지 크래시/예외 없음).

3. **최근 경기 섹션 배치**
   - [x] 최근 경기 목록을 위한 배치(같은 페이지 섹션 또는 별도 라우트 링크)를
     결정하고, 최소한의 placeholder(예: 섹션 제목, "준비 중" 안내, 또는 링크)를
     구현한다.
   - [x] 결정한 배치 방식을 Result에 기록한다. TASK-009가 그대로 따를 수
     있도록 구체적으로 작성한다 (예: 컴포넌트/라우트 경로).

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
   - [x] Result에 TASK-009 이상 범위 작업을 시작하지 않았음을 명시한다.

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

# 5) 변경된 파일 확인 (Allowed 영역만 존재해야 함)
git status --porcelain -- frontend/src/app/players frontend/src/components
```

## Stop conditions

다음 상황에서 작업을 중단하고 `BLOCKED`로 보고한다:

1. 사람의 시작 승인이 없는 상태에서 이 Task를 시작하게 되는 경우 (시작 자체를
   중단한다).
2. 이 문서에 기록한 라우트(`frontend/src/app/players/[puuid]/page.tsx`)나
   `getDemoPlayerByPuuid` 조회 함수가 실제 `frontend/src/app/players/`,
   `frontend/src/lib/mock-data.ts`의 현재 상태와 달라 Acceptance criteria
   1~2를 재정의해야 하는 경우 — 임의로 새 가정을 추가하지 말고 BLOCKED로
   보고한다.
3. Acceptance criteria를 만족하기 위해 새로운 npm 패키지 설치가 필요한 경우.
4. 최근 경기 목록의 실제 렌더링(TASK-009 범위) 구현이 불가피한 경우.
5. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

## Result

**상태**: DONE

**변경된 파일**:
- `frontend/src/app/players/[puuid]/page.tsx`
- `frontend/src/components/PlayerProfile.tsx`
- `docs/tasks/TASK-008.md`

**구현 내용**:
- TASK-007에서 확정한 `/players/[puuid]` 라우트 placeholder를 실제 프로필
  콘텐츠로 교체했다.
- `getDemoPlayerByPuuid(puuid)`로 TASK-006 Mock 플레이어 데이터를 조회한다.
- 플레이어가 존재하면 Riot ID(`게임네임#태그`), 현재 랭크, 통계 요약을 표시한다.
- 표시한 `PlayerStatsSummary` 필드:
  - `matchesPlayed`
  - `winRate`
  - `averageKills`
  - `averageDeaths`
  - `averageAssists`
  - `averageCombatScore`
- 플레이어가 없으면 예외 없이 "플레이어를 찾을 수 없음" 안내 UI를 표시한다.

**최근 경기 목록 배치 결정**:
- TASK-009의 최근 경기 목록은 같은 프로필 페이지(`/players/[puuid]`) 안의
  `최근 경기` 섹션에 배치한다.
- 이번 Task에서는 `PlayerProfile` 컴포넌트 안에 섹션 제목과 "TASK-009에서
  구현" 안내만 추가했다. 실제 경기 목록 렌더링은 구현하지 않았다.

**실행한 명령**:
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- `git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib`
- `git status --porcelain -- frontend/src/app/page.tsx frontend/src/app/layout.tsx frontend/src/app/globals.css frontend/src/components/HomeSearch.tsx`
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`
- `git status --porcelain -- frontend/src/app/players frontend/src/components`

**검증 결과**:
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공. ESLint 경고/에러 없음.
- `cd frontend && npm run build`: 성공.
- `git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib`: 출력 없음.
- `git status --porcelain -- frontend/src/app/page.tsx frontend/src/app/layout.tsx frontend/src/app/globals.css frontend/src/components/HomeSearch.tsx`: 출력 없음.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`: 출력 없음.
- `git status --porcelain -- frontend/src/app/players frontend/src/components`: TASK-008 허용 영역 변경만 출력.

**남은 위험**:
- `npx tsc --noEmit`가 `frontend/tsconfig.tsbuildinfo`를 생성했으나 TASK-008
  허용 범위 밖의 검증 산출물이므로 제거했다.
- 실제 최근 경기 목록 UI는 TASK-009에서 구현해야 한다.

**범위 확인**:
- TASK-006 산출물(`frontend/src/types/**`, `frontend/src/data/**`,
  `frontend/src/lib/**`)은 수정하지 않고 import만 했다.
- TASK-007 산출물(`frontend/src/app/page.tsx`, `layout.tsx`, `globals.css`,
  `HomeSearch.tsx`)은 수정하지 않았다.
- `backend/**`, `docker/**`, `scripts/**`, 패키지 파일은 수정하지 않았다.
- Riot API, 인증, 분석, 라인업, 커뮤니티 기능은 구현하지 않았다.
- TASK-009 이상 작업은 시작하지 않았다.
- `docs/tasks/TASK-009.md`는 참조하거나 수정하지 않았다.
