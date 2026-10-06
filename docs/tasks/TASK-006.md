# TASK-006: Mock JSON 데이터 모델 정의

## Status

DONE

## Goal

PLAN.md Phase 1("Mock JSON 기반 전적 검색 프로토타입")의 첫 번째 Task로, 이후 화면
구현(TASK-007~010)이 사용할 **데이터 모델(TypeScript 타입), Mock JSON 데이터,
데이터 로더 함수**를 정의한다.

이 Task는 다음을 수행한다:

1. SPEC.md의 "데이터 모델 (개요)" 절을 기반으로 플레이어/경기 데이터에 대한
   TypeScript 타입을 정의한다.
2. 위 타입을 만족하는 Mock JSON 데이터를 작성한다 (데모 플레이어 1명 이상, 최근
   경기 목록, 그 중 최소 1개 경기의 상세 데이터 포함).
3. Mock JSON 데이터를 읽어 타입화된 객체로 반환하는 데이터 로더 함수를 작성한다.

다음은 이 Task의 범위가 아니다:

- 화면/라우트 구현 (홈, 프로필, 경기 목록, 경기 상세 — TASK-007~010)
- Riot API, 인증, 분석, 라인업, 커뮤니티 등 이후 Phase 기능
- Backend(`backend/**`) 변경
- 새로운 npm 패키지 설치

## Context

- `docs/PLAN.md` Phase 1 목표: "Mock JSON 파일로 전적 검색 흐름을 구현한다. 분석
  피드백은 제외한다." 데이터 소스: "모든 플레이어/경기 데이터는 정적 JSON
  파일에서 로드한다. 실제 Riot API 호출 없음."
- `docs/SPEC.md` "데이터 모델 (개요)"에 정의된 항목:
  - **플레이어**: Riot ID (게임네임#태그), PUUID, 현재 랭크, 최근 경기 목록, 통계 요약
  - **경기**: 경기 ID, 맵, 모드, 참가자 목록, 라운드별 데이터, 개인 성적
- `docs/ARCHITECTURE.md`는 Mock 데이터를 `backend/.../riot/mock/data`에 두는 구조를
  정의하지만, 이는 `RiotApiAdapter`의 Mock 구현체(Phase 0-3)를 위한 backend 측
  구조다. 반면 `docs/PLAN.md` Phase 1의 Task 목록(TASK-007~010)은 모두
  Frontend 화면이며 backend 연동 Task가 없다.
  - **이 Task의 가정**: Phase 1에서는 Mock 데이터를 `frontend/` 내부에 두고,
    Frontend가 직접 로드한다. backend `riot/mock` 어댑터 구조는 이후 Phase에서
    backend API 연동이 시작될 때 별도로 다룬다. 이 가정이 적절하지 않다고
    판단되면 구현을 시작하지 말고 BLOCKED로 보고한다 (Stop conditions 참조).
- 현재 `frontend/src/`에는 `app/` 디렉터리만 존재한다. `types/`, `lib/`,
  `data/`는 `docs/ARCHITECTURE.md`의 저장소 구조에 계획되어 있으나 아직
  생성되지 않았다.
- `frontend/tsconfig.json`은 `resolveJsonModule: true`, `strict: true`이므로
  JSON 파일을 TypeScript에서 직접 `import`할 수 있다.

### 불확실한 사항 (구현자가 합리적으로 결정하고 Result에 기록)

- 데모 플레이어/경기 수: 최소 기준(아래 Acceptance criteria)만 제시한다.
  정확한 수치, 맵/요원/랭크 이름 등 구체적인 값은 구현자가 VALORANT의 실제
  맵/요원/랭크 명칭을 사용해 자유롭게 정한다.
- `PlayerStatsSummary`, `MatchDetail.rounds`, `MatchDetail.participants`의
  세부 필드 구성: SPEC에 명시된 항목(통계 요약, 라운드별 데이터, 개인 성적)을
  포함하면 되고, 그 외 추가 필드는 구현자가 결정한다.
- 데이터 로더 함수의 정확한 이름/시그니처/동기·비동기 여부.
- Mock JSON 파일을 1개로 합칠지 여러 파일로 나눌지.
- 위 항목들은 이후 화면 Task(TASK-007~010)에서 인터페이스가 일부 조정될 수
  있음을 전제로 하며, 이 Task에서 완전히 고정할 필요는 없다.

## Dependencies

- **선행 Task**: TASK-005 (공통 검증 명령 구성) — DONE (2026-06-13).
- **후속 Task**: TASK-007 (홈 검색 화면)은 이 Task에서 정의하는 타입과 데이터
  로더를 사용한다. 이 Task 완료 및 사람 승인 전까지 TASK-007은 시작하지 않는다.

## Allowed changes

```
frontend/src/types/**      # 새 디렉터리: Player/Match 등 데이터 모델 타입
frontend/src/data/**        # 새 디렉터리: Mock JSON 데이터 파일
frontend/src/lib/**          # 새 디렉터리(또는 기존 lib 확장): 데이터 로더 함수
docs/PLAN.md                 # 진행 상태 갱신
docs/PROGRESS.md             # 완료 기록
docs/tasks/TASK-006.md        # 이 문서의 Result 갱신
```

- `frontend/src/app/**`, `frontend/package.json`, `frontend/package-lock.json`은
  수정하지 않는다.

## Forbidden changes

- `frontend/src/app/**` (화면/라우트 구현 — TASK-007 이후 범위)
- `backend/**`, `docker/**`
- `frontend/package.json`, `frontend/package-lock.json` (새 의존성 추가 포함)
- Riot API 실제 호출, 인증/세션 관련 코드
- 분석(Phase 5), 라인업(Phase 3), 커뮤니티 관련 타입/데이터
- `AGENTS.md`, `CLAUDE.md`
- `docs/` 중 위 `Allowed changes`에 명시되지 않은 문서
- TASK-007 이상 작업 시작

## Acceptance criteria

1. **플레이어 타입 정의**
   - [x] `frontend/src/types/`(예: `player.ts`)에 다음을 포함하는 타입을
     `export`한다:
     - Riot ID 표현(게임네임, 태그라인을 별도 필드로 구분)
     - PUUID
     - 현재 랭크
     - 최근 경기 목록에 대한 참조(매치 ID 배열 또는 `MatchSummary[]`)
     - 통계 요약(`PlayerStatsSummary` 또는 동등 타입, 최소 1개 이상의 집계
       지표 포함 — 예: 총 경기 수, 승률, 평균 K/D/A 등 중 구현자가 선택)

2. **경기 타입 정의**
   - [x] `frontend/src/types/`(예: `match.ts`)에 다음을 포함하는 타입을
     `export`한다:
     - `MatchSummary`: 경기 ID, 맵, 모드, 진행 시각(또는 동등 시각 필드),
       해당 플레이어의 결과(승/패/무)와 개인 성적(킬/데스/어시스트, 사용
       요원 등)
     - `MatchDetail`: 경기 ID, 맵, 모드, 참가자 목록(양 팀 인원 및 각자의
       요원/개인 성적 포함), 라운드별 데이터(라운드 번호, 결과, 팀별 점수 등
       타임라인 구성에 필요한 정보를 포함)

3. **Mock JSON 데이터**
   - [x] `frontend/src/data/`(예: `data/mock/`) 하위에 Mock JSON 데이터 파일을
     1개 이상 작성한다.
   - [x] 최소 1명의 데모 플레이어 데이터를 포함하며, Riot ID는
     `게임네임#태그` 형식을 따른다.
   - [x] 해당 플레이어의 최근 경기 목록을 `MatchSummary` 형태로 최소 3개
     이상 포함한다.
   - [x] 위 경기 목록 중 최소 1개에 대해 `MatchDetail`(참가자 목록과
     라운드별 데이터 포함)을 작성한다.
   - [x] JSON 데이터는 1·2번에서 정의한 타입과 구조적으로 일치해야 하며,
     이를 TypeScript에서 타입화된 변수에 대입(또는 `satisfies` 사용)하여
     컴파일 타임에 확인할 수 있어야 한다.

4. **데이터 로더 함수**
   - [x] `frontend/src/lib/`에 Mock 데이터를 읽어 1·2번 타입으로 반환하는
     함수를 `export`한다. 최소한 다음 조회를 지원한다:
     - 데모 플레이어 조회 (Riot ID 또는 PUUID 기준)
     - 특정 플레이어의 최근 경기 목록(`MatchSummary[]`) 조회
     - 특정 경기 ID의 `MatchDetail` 조회
   - [x] 함수가 존재하지 않는 플레이어/경기를 조회했을 때의 동작(예:
     `null`/`undefined` 반환)을 정의하고 Result에 기록한다. 에러 코드
     체계(`PLAYER_NOT_FOUND` 등)는 이 Task에서 구현하지 않는다 (API 계층은
     이후 Task에서 다룬다).

5. **빌드 및 정적 검사**
   - [x] `cd frontend && npx tsc --noEmit` 성공 (타입 에러 없음).
   - [x] `cd frontend && npm run lint` 성공 (경고/에러 없음).
   - [x] `cd frontend && npm run build` 성공.

6. **범위 확인**
   - [x] `git diff --stat -- frontend/src/app` 출력이 비어 있다 (화면/라우트
     미변경).
   - [x] `git diff --stat -- frontend/package.json frontend/package-lock.json`
     출력이 비어 있다 (의존성 미변경).
   - [x] Result에 TASK-007 이상 범위 작업을 시작하지 않았음을 명시한다.

## Verification commands

```bash
# 1) 타입 검사
cd frontend && npx tsc --noEmit

# 2) Lint
cd frontend && npm run lint

# 3) 빌드
cd frontend && npm run build

# 4) 범위 확인 (출력이 비어 있어야 함, staged·unstaged·untracked 모두 포함)
cd .. && git status --porcelain -- frontend/src/app
git status --porcelain -- frontend/package.json frontend/package-lock.json

# 5) 변경된 파일 확인 (Allowed 영역만 존재해야 함)
git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib
```

## Stop conditions

다음 상황에서 작업을 중단하고 `BLOCKED`로 보고한다:

1. Mock 데이터의 위치를 "Context"의 가정(Frontend 내부, Frontend가 직접
   로드)과 다르게(예: backend `riot/mock` 구조 우선) 정해야만 Acceptance
   criteria를 만족할 수 있다고 판단되는 경우.
2. Acceptance criteria 1~4를 만족하기 위해 새로운 npm 패키지(런타임 또는
   개발 의존성, 예: 스키마 검증 라이브러리) 설치가 필요한 경우.
3. `frontend/src/app/**` 또는 `frontend/package.json` 수정 없이는 위 기준을
   만족할 수 없는 경우.
4. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

## Result

**상태**: DONE

**변경된 파일**:
- `frontend/src/types/match.ts`
- `frontend/src/types/player.ts`
- `frontend/src/types/index.ts`
- `frontend/src/data/mock-data.json`
- `frontend/src/lib/mock-data.ts`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `docs/tasks/TASK-006.md`

**구현 내용**:
- `Player`, `RiotId`, `PlayerStatsSummary`, `MatchSummary`, `MatchDetail`,
  참가자/라운드/전투 통계 타입을 정의했다.
- 데모 플레이어 `SeoulDuelist#KR1` 1명, 최근 경기 요약 3개, 상세 경기 1개를
  Mock JSON으로 작성했다.
- 상세 경기에는 10명 참가자와 22라운드 타임라인을 포함했다.
- Mock 데이터 로더 함수:
  - `getDemoPlayers()`
  - `getDemoPlayerByPuuid(puuid)`
  - `getDemoPlayerByRiotId(riotId)`
  - `getRecentMatchesForPlayer(puuid)`
  - `getMatchDetail(matchId)`
- 존재하지 않는 플레이어/경기 조회는 `null` 또는 빈 배열을 반환한다:
  `getDemoPlayerByPuuid`, `getDemoPlayerByRiotId`, `getMatchDetail`은 `null`,
  `getRecentMatchesForPlayer`는 `[]`.

**실행한 명령**:
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- `git status --porcelain -- frontend/src/app`
- `git status --porcelain -- frontend/package.json frontend/package-lock.json`
- `git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib`

**검증 결과**:
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공. ESLint 경고/에러 없음.
- `cd frontend && npm run build`: 성공.
- `git status --porcelain -- frontend/src/app`: 출력 없음.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json`: 출력 없음.
- `git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib`: 허용된 신규 파일만 출력.

**남은 위험**:
- `npx tsc --noEmit`가 `frontend/tsconfig.tsbuildinfo`를 생성했으나 TASK-006 허용
  범위 밖의 검증 산출물이므로 제거했다.
- Mock 데이터 필드와 값은 이후 화면 Task(TASK-007~010)의 표시 요구사항에 따라
  조정될 수 있다.

**범위 확인**:
- `frontend/src/app/**`, `frontend/package.json`, `frontend/package-lock.json`,
  `backend/**`, `docker/**`는 수정하지 않았다.
- Riot API, 인증, 분석, 라인업, 커뮤니티 기능은 구현하지 않았다.
- TASK-007 이상 작업은 시작하지 않았다.
- 병렬 작성 중인 `docs/tasks/TASK-007.md`는 참조하거나 수정하지 않았다.
