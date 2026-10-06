# TASK-007: 홈 검색 화면

## Status

DONE

## Goal

`docs/PLAN.md` Phase 1, TASK-007("홈 검색 화면")의 목표를 그대로 따른다.
`docs/SPEC.md`의 화면 목록 중 "홈"(Riot ID 검색, 데모 계정 선택)을 구현하고,
핵심 사용자 흐름의 첫 단계인 "홈 → Riot ID 검색 또는 데모 계정 선택 → 플레이어
프로필" 전환을 만든다.

이 Task는 다음을 수행한다:

1. 홈페이지(`/`)에 Riot ID 검색 입력 폼을 구현한다 (`게임네임#태그` 형식 검증
   포함).
2. 홈페이지에 데모 계정 선택 UI를 구현한다. TASK-006에서 정의한 Mock 데이터와
   데이터 로더를 사용해 데모 플레이어 목록(또는 단일 데모 플레이어)을
   표시한다.
3. Riot ID 검색 제출 또는 데모 계정 선택 시, 플레이어 프로필 라우트로
   이동(navigate)하는 로직을 구현한다. 라우트 경로 네이밍은 이 Task에서
   정하고 문서화하여 TASK-008이 따르도록 한다.

다음은 이 Task의 범위가 아니다:

- 플레이어 프로필 페이지의 실제 콘텐츠 (TASK-008)
- 최근 경기 목록, 경기 상세 (TASK-009, TASK-010)
- Riot API 실제 연동, 인증, 분석, 라인업, 커뮤니티 등 이후 Phase 기능
- TASK-006에서 정의한 타입/Mock 데이터/데이터 로더 자체의 수정 (이 Task는
  그 결과를 "사용"만 한다)

## Context

- `docs/PLAN.md` Phase 1 목표: "Mock JSON 파일로 전적 검색 흐름을 구현한다.
  분석 피드백은 제외한다." 데이터 소스는 정적 JSON, 실제 Riot API 호출 없음.
- `docs/SPEC.md` 화면 목록(Phase 1-2): "홈 | Riot ID 검색, 데모 계정 선택".
- `docs/SPEC.md` 핵심 사용자 흐름: `홈 → Riot ID 검색 또는 데모 계정 선택 →
  플레이어 프로필 → 최근 경기 목록 → 경기 상세`.
- 현재 `frontend/src/app/`에는 `layout.tsx`, `page.tsx`, `globals.css`만
  존재한다 (create-next-app 기본 템플릿). 홈페이지(`/`)는 `page.tsx`를
  교체/수정해 구현한다.
- **TASK-006("Mock JSON 데이터 모델 정의")은 DONE으로 완료됐다**
  (`docs/PLAN.md`, `docs/tasks/TASK-006.md`의 Result 참조). 이 Task가
  재사용할 타입/Mock 데이터/데이터 로더는 아래 "TASK-006 결과 재사용 및
  TASK-007에서 결정할 사항"에 정리한다. TASK-007은 사람의 시작 승인 후
  시작한다.

### TASK-006 결과 재사용 및 TASK-007에서 결정할 사항

`docs/tasks/TASK-006.md` Result에 따라 다음 결과물을 그대로 재사용한다:

- **타입**: `frontend/src/types/index.ts`에서 `Player`, `RiotId`,
  `PlayerStatsSummary`, `MatchSummary`, `MatchDetail` 및 참가자/라운드/전투
  통계 타입이 `export`된다 (`player.ts`, `match.ts`에 정의). 정확한 필드
  구성은 구현 시 해당 파일을 직접 확인한다.
- **데이터 로더**: `frontend/src/lib/mock-data.ts`에서 다음 함수가
  `export`된다 — `getDemoPlayers()`, `getDemoPlayerByPuuid(puuid)`,
  `getDemoPlayerByRiotId(riotId)`, `getRecentMatchesForPlayer(puuid)`,
  `getMatchDetail(matchId)`.
- **데모 계정 수**: 현재 Mock 데이터(`frontend/src/data/mock-data.json`)에는
  데모 플레이어가 1명(`SeoulDuelist#KR1`)뿐이다. "선택" UI는 최소 이 1개
  계정을 선택 가능한 형태(버튼/카드)로 표시하면 된다. 추후 계정이 늘어날
  경우를 고려한 목록 형태 구현은 권장 사항이며 필수는 아니다.
- **존재하지 않는 Riot ID 처리**: `getDemoPlayerByRiotId(riotId)`가 `null`을
  반환하면 검색 결과 없음을 안내하는 UI를 표시한다. 에러 코드 체계
  (`PLAYER_NOT_FOUND` 등)는 이 Task에서 구현하지 않는다.

다음 항목은 TASK-006이 결정하지 않았으며, 이 Task(TASK-007)에서 결정하고
Result에 기록한다:

- **[Pending] 프로필 라우트 식별자**: 플레이어 프로필 라우트(예:
  `/players/[id]`)의 동적 세그먼트 값으로 PUUID 또는 Riot ID 문자열 중 무엇을
  사용할지 이 Task에서 결정한다. 결정한 경로 형식은 TASK-008이 그대로
  사용한다.

## Dependencies

- **선행 Task**: TASK-006 (Mock JSON 데이터 모델 정의) — DONE (2026-06-13).
  **TASK-007은 사람의 시작 승인 전까지 시작하지 않는다.**
- **후속 Task**: TASK-008(데모 플레이어 프로필)은 이 Task에서 정의하는 프로필
  라우트 경로(Pending 항목 참조)를 사용한다. 이 Task 완료 및 사람 승인 전까지
  TASK-008은 시작하지 않는다.

## Allowed changes

```
frontend/src/app/page.tsx          # 홈페이지 구현
frontend/src/app/players/**        # 프로필 라우트 진입점 (디렉터리/동적 세그먼트만,
                                    # 내용은 최소 placeholder — 실제 콘텐츠는 TASK-008)
frontend/src/components/**         # 새 디렉터리: 검색 폼, 데모 계정 선택 UI 컴포넌트
docs/tasks/TASK-007.md             # 이 문서의 Result 갱신
```

- TASK-006이 작성한 `frontend/src/types/**`, `frontend/src/data/**`,
  `frontend/src/lib/**`은 가져오기(import)만 하고 수정하지 않는다.
- `frontend/src/app/layout.tsx`, `frontend/src/app/globals.css`는 레이아웃
  공통 요소가 필요한 경우에만 최소한으로 수정하고, 변경 사유를 Result에
  기록한다.

## Forbidden changes

- `frontend/src/types/**`, `frontend/src/data/**`, `frontend/src/lib/**`
  (TASK-006 범위 — 사용만 하고 수정하지 않음)
- `frontend/src/app/players/**` 하위의 실제 프로필 콘텐츠 구현 (TASK-008
  범위 — 이 Task에서는 라우트 진입점/placeholder만 허용)
- `backend/**`, `docker/**`, `scripts/**`
- `frontend/package.json`, `frontend/package-lock.json` (새 의존성 추가
  포함)
- Riot API 실제 호출, 인증/세션 관련 코드
- 최근 경기 목록, 경기 상세, 분석, 라인업, 커뮤니티 관련 UI/로직
- `AGENTS.md`, `CLAUDE.md`, `docs/PLAN.md`, `docs/PROGRESS.md`,
  `docs/tasks/TASK-006.md`
- TASK-008 이상 작업 시작

## Acceptance criteria

1. **Riot ID 검색 폼**
   - [x] 홈페이지(`/`)에 `게임네임#태그` 형식의 Riot ID를 입력하는 폼이
     존재한다.
   - [x] 입력값이 `게임네임#태그` 형식이 아닌 경우, 제출을 막거나 에러
     메시지를 표시한다 (형식 검증 규칙은 구현자가 정하고 Result에 기록).

2. **데모 계정 선택**
   - [x] `getDemoPlayers()`(`frontend/src/lib/mock-data.ts`)로 데모 플레이어
     목록을 가져와 선택 가능한 형태(버튼/카드/목록)로 표시한다.
   - [x] 현재 데모 플레이어는 1명(`SeoulDuelist#KR1`)이다. 최소 이 1개
     계정을 선택할 수 있으면 된다. 추후 계정이 늘어날 경우를 고려한 목록
     형태 구현은 권장 사항이며 필수는 아니다.

3. **프로필 라우트로 이동**
   - [x] Riot ID 검색 제출 또는 데모 계정 선택 시, 정의된 프로필 라우트
     (`Pending` 항목에서 결정한 경로 형식)로 클라이언트 라우팅
     (`next/navigation` 등)이 발생한다.
   - [x] 검색한 Riot ID가 TASK-006 Mock 데이터에 존재하지 않는 경우의 동작
     (에러 메시지 표시, 이동 안 함 등)을 구현하고 Result에 기록한다.
   - [x] 이동 대상 라우트(`frontend/src/app/players/**`)에는 최소한의
     placeholder만 존재해도 무방하다 (예: 받은 파라미터를 표시하는 정도).
     실제 프로필 콘텐츠는 TASK-008에서 구현한다.

4. **빌드 및 정적 검사**
   - [x] `cd frontend && npx tsc --noEmit` 성공 (타입 에러 없음).
   - [x] `cd frontend && npm run lint` 성공 (경고/에러 없음).
   - [x] `cd frontend && npm run build` 성공.

5. **범위 확인**
   - [x] `git status --porcelain -- frontend/src/types frontend/src/data
     frontend/src/lib` 출력이 비어 있다 (TASK-006 산출물 미변경).
   - [x] `git status --porcelain -- frontend/package.json
     frontend/package-lock.json backend docker scripts` 출력이 비어 있다.
   - [x] Result에 TASK-008 이상 범위 작업을 시작하지 않았음을 명시한다.

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
git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts

# 5) 변경된 파일 확인 (Allowed 영역만 존재해야 함)
git status --porcelain -- frontend/src/app frontend/src/components
```

## Stop conditions

다음 상황에서 작업을 중단하고 `BLOCKED`로 보고한다:

1. TASK-006이 아직 DONE 상태가 아니거나, 사람의 시작 승인이 없는 상태에서
   이 Task를 시작하게 되는 경우 (시작 자체를 중단한다).
2. 이 문서의 "TASK-006 결과 재사용 및 TASK-007에서 결정할 사항"에 기록한
   타입/함수 이름, 데모 계정 수, not-found 동작이 실제
   `frontend/src/types/`, `frontend/src/lib/mock-data.ts`,
   `frontend/src/data/mock-data.json`의 현재 상태와 달라 Acceptance criteria
   1~3을 재정의해야 하는 경우 — 임의로 새 가정을 추가하지 말고 BLOCKED로
   보고한다.
3. Acceptance criteria를 만족하기 위해 새로운 npm 패키지(폼 검증 라이브러리,
   상태 관리 라이브러리 등) 설치가 필요한 경우.
4. 프로필 라우트 placeholder 이상의 실제 프로필 콘텐츠(TASK-008 범위) 구현이
   불가피한 경우.
5. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

## Result

**상태**: DONE

**변경된 파일**:
- `frontend/src/app/page.tsx`
- `frontend/src/app/globals.css`
- `frontend/src/app/players/[puuid]/page.tsx`
- `frontend/src/components/HomeSearch.tsx`
- `docs/tasks/TASK-007.md`

**구현 내용**:
- 홈페이지(`/`)에 Riot ID 검색 폼과 데모 계정 선택 UI를 구현했다.
- TASK-006의 `getDemoPlayers()`와 `getDemoPlayerByRiotId()`를 재사용했다.
- 프로필 라우트는 PUUID 기반 `/players/[puuid]`로 결정했다. TASK-008은 이
  경로 형식을 따르면 된다.
- `/players/[puuid]`에는 받은 PUUID만 표시하는 최소 placeholder를 추가했다.
  실제 프로필 콘텐츠는 구현하지 않았다.
- `frontend/src/app/globals.css`는 홈 검색 UI와 placeholder 라우트의 최소
  스타일을 위해 수정했다.

**Riot ID 검증 규칙**:
- 형식은 `게임네임#태그`로 검증한다.
- 정규식: `^[^#\s][^#]*#[A-Za-z0-9]{2,5}$`
- `#` 앞 게임네임은 비어 있으면 안 되고, 태그는 영문/숫자 2~5자여야 한다.

**검색 실패 동작**:
- 형식이 잘못되면 이동하지 않고 에러 메시지를 표시한다.
- 형식은 맞지만 Mock 데이터에 없는 Riot ID면 이동하지 않고 데모 계정을
  선택하라는 에러 메시지를 표시한다.

**실행한 명령**:
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- `git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib`
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`
- `git status --porcelain -- frontend/src/app frontend/src/components`

**검증 결과**:
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공. ESLint 경고/에러 없음.
- `cd frontend && npm run build`: 성공.
- `git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib`: 출력 없음.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`: 출력 없음.
- `git status --porcelain -- frontend/src/app frontend/src/components`: TASK-007 허용 영역 변경만 출력.

**남은 위험**:
- `npx tsc --noEmit`가 `frontend/tsconfig.tsbuildinfo`를 생성했으나 TASK-007
  허용 범위 밖의 검증 산출물이므로 제거했다.
- 실제 프로필 콘텐츠와 상세 라우트 동작은 TASK-008에서 구현해야 한다.

**범위 확인**:
- TASK-006 산출물(`frontend/src/types/**`, `frontend/src/data/**`,
  `frontend/src/lib/**`)은 수정하지 않고 import만 했다.
- `backend/**`, `docker/**`, `scripts/**`, 패키지 파일은 수정하지 않았다.
- Riot API, 인증, 분석, 라인업, 커뮤니티 기능은 구현하지 않았다.
- TASK-008 이상 작업은 시작하지 않았다.
- 병렬 작성 예정인 `docs/tasks/TASK-008.md`는 참조하거나 수정하지 않았다.
