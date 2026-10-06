# TASK-005: 공통 검증 명령 구성

> 2026-10-02 기록 정리: 아래는 당시 작업·검증 기록이다. 폐기된 DB별 명령·설정은 제거했으며,
> 현재 MongoDB 실행·검증 방법은 [실행 안내](../backend/MONGODB.md)와
> [TASK-BE-001](../tasks/TASK-BE-001.md)을 따른다. 과거 PASS를 MongoDB 검증 결과로 해석하지 않는다.

## Status

**DONE**

## Goal

Frontend, Backend, Docker, Git 상태를 한 번에 검증할 수 있는 **공통 검증 진입점**을 구성한다.
개발자와 AI 에이전트가 단일 명령으로 다음을 순차 실행하고, 하나라도 실패하면 비정상 종료(non-zero exit)하도록 한다:

1. Frontend build / lint
2. Backend build / test
3. Git diff 검사 (빌드가 추적 파일을 더럽히지 않는지, 산출물이 무시 처리되는지)
4. Docker Compose 설정 검증

이 Task는 **검증 인프라(스크립트)만** 만든다. 제품 기능, Mock 데이터, API 연동은 포함하지 않는다.

## Context

- Phase 0의 마지막 Task다. 이후 모든 Task의 `Verification commands`가 이 공통 진입점을 재사용할 수 있게 한다.
- 현재 상태:
  - Frontend: `frontend/package.json`에 `dev`, `build`, `lint` 스크립트가 있다 (Next.js 14).
  - Backend: `backend/`에 Gradle Wrapper와 `build`, `test` 태스크가 있다 (Spring Boot 3.2.12, Kotlin).
  - Docker: 당시 DB Compose 설정 (현재 폐기됨).
  - 저장소 루트에는 통합 검증 스크립트가 없다.

**선행 조건**:
- Node.js 18+
- JDK 17+ — `backend/build.gradle.kts`가 `sourceCompatibility`/`targetCompatibility`/`jvmTarget`을 모두 17로 설정하고, Java toolchain 강제 설정(toolchain / jvmToolchain / languageVersion)은 두지 않는다. 즉 Java 17 바이트코드를 타깃으로 하며 JDK 17 이상이면 빌드된다. (더 높은 JDK로 실행해도 무방하나 요구 최소 버전은 17이다.)
- Docker CLI + Compose (v2 `docker compose` 또는 v1 `docker-compose`). compose 파일 문법 검증(`config`)은 Docker daemon 없이 동작한다.

**의존성**:
- TASK-002, TASK-003 (PLAN.md 기준). 실제로는 TASK-001에서 함께 완료됨. 따라서 선행 조건은 충족된 상태다.

**관련 결정**:
- DEC-006: 초기 부트스트랩 버전 (Next.js 14, Spring Boot 3.2.12). 검증 스크립트는 이 버전 기준으로 동작해야 한다.

## Allowed changes

```
scripts/
└── verify.sh              # 통합 검증 진입점 (신규). 필요 시 scripts/ 하위로 단계별 보조 스크립트 분리 가능

Makefile                   # (선택) `make verify`로 scripts/verify.sh를 호출하는 얇은 래퍼

README.md                  # (선택) "검증" 절 추가 — 통합 검증 명령 사용법만 문서화

docs/PLAN.md               # TASK-005 상태 갱신 (TODO → DONE)
docs/PROGRESS.md           # 완료 기록 추가
docs/tasks/TASK-005.md     # 이 문서의 Result 갱신
```

- 검증 스크립트는 **기존 npm/Gradle 스크립트를 호출**하는 방식으로만 동작한다. 새 빌드 도구나 의존성을 도입하지 않는다.

## Forbidden changes

- `frontend/`, `backend/`, `docker/` 내부 소스 및 설정 수정 (예: `package.json` 스크립트 변경, `build.gradle.kts` 변경, DB Compose 설정 변경 금지)
- 실제 기능 코드, Mock 데이터, 외부 API 연동 추가
- 의존성 추가 또는 버전 변경
- 테스트 삭제 또는 비활성화
- `npm audit fix` 실행
- `docs/` 내용 수정 (`PLAN.md`, `PROGRESS.md`, 이 Task 문서 제외)
- `AGENTS.md`, `CLAUDE.md` 수정

## Acceptance criteria

1. **통합 진입점**
   - [x] 저장소 루트에서 단일 명령(`bash scripts/verify.sh`, 또는 `make verify`)으로 4개 검증을 순차 실행한다.
   - [x] 단계 중 하나라도 실패하면 즉시 또는 종료 시점에 **non-zero exit code**로 종료한다.
   - [x] 각 단계의 시작/성공/실패가 출력으로 구분된다.
   - [x] 재실행 가능(idempotent)하며, 실행 자체가 추적 대상 파일을 변경하지 않는다.

2. **Frontend 검증**
   - [x] `frontend`에서 의존성 설치 → `npm run build` → `npm run lint`를 수행하고 모두 통과한다.
   - [x] 재현성을 위해 `npm ci`를 사용한다 (lockfile 기반).

3. **Backend 검증**
   - [x] `backend`에서 Gradle Wrapper로 `build`와 `test`를 수행하고 모두 통과한다.

4. **Git diff 검사 (베이스라인 기준 증분 검사)**
   - [x] 단순 `git diff --exit-code`는 사용하지 않는다. 그 방식은 TASK-005가 정상적으로 추가/수정한 `scripts/verify.sh`와 문서 변경까지 변경으로 감지해 오탐(false positive)을 낸다.
   - [x] **검증 시작 시점의 Git 상태를 베이스라인으로 캡처**하고, Frontend/Backend 빌드 실행 후 **베이스라인 대비 새로 발생한 변경만** 판별한다. 베이스라인에 이미 존재하던 변경(=Task 자체 변경)은 실패로 판단하지 않는다.
   - [x] 권장 구현 방식:
     - 빌드 전: `BASE_TREE=$(git stash create)` 로 추적 파일의 현재 상태 스냅샷을 만든다(작업 트리가 깨끗하면 빈 문자열). 그리고 `git status --porcelain --untracked-files=all | sort` 결과를 `BASE_STATUS`로 저장한다.
     - 빌드 후: `git diff --exit-code "${BASE_TREE:-HEAD}"` 로 추적 파일이 빌드 때문에 변경됐는지 검사한다(베이스라인에 포함된 Task 변경은 차이로 잡히지 않는다). 또한 빌드 후 `git status --porcelain --untracked-files=all | sort`를 `BASE_STATUS`와 비교해 **새로 나타난 항목만** 추출한다(예: `comm -13`).
     - 새 항목이나 추적 파일의 빌드 유발 변경이 있으면 해당 경로를 출력하고 실패 처리한다(예: lockfile drift, 빌드가 추적 파일을 덮어쓴 경우).
   - [x] 검사 실패 시 어떤 경로가 새로 변경/생성됐는지 출력한다.

5. **빌드 산출물 무시 처리 검사 (경로 부재에도 안전)**
   - [x] 빌드 산출물(`frontend/.next`, `frontend/node_modules`, `backend/build`, `backend/.gradle`)이 `.gitignore`로 무시 처리됨을 확인한다.
   - [x] `git check-ignore`는 경로가 존재하지 않아도 ignore 규칙으로 평가하지만, 경로가 무시되지 **않으면** exit code 1을 반환하므로 스크립트가 `set -e`에서 의도치 않게 중단될 수 있다. 따라서 각 경로를 루프로 돌며 `git check-ignore -q <path>`의 종료 코드를 직접 해석한다(0=무시됨=정상, 그 외=무시 안 됨=실패로 보고).
   - [x] 의미 있는 검증을 위해 이 검사는 **빌드 실행 후**(산출물이 실제로 생성된 뒤) 수행하는 것을 권장한다. 단, 검사 자체는 경로 존재 여부에 의존하지 않도록 작성한다.

6. **Docker Compose 설정 검증 (문법 검증만 필수)**
   - [x] 당시 DB Compose 파일의 문법/구성을 검증했다 (폐기된 파일·실행 명령 생략).
   - [x] 이 검증은 **compose 파일 문법/구성 검증만** 필수로 한다. 컨테이너 기동(`up`)이나 Docker daemon 연결은 요구하지 않는다 — `config`는 파일을 로컬에서 파싱·해석·렌더링하는 동작이라 daemon 없이 통과한다.
   - [x] Compose v2(`docker compose`)와 v1(`docker-compose`) 중 사용 가능한 쪽을 자동 선택하거나, 사용하는 명령을 문서에 명시한다.

7. **문서 정합성**
   - [x] `docs/PLAN.md`의 TASK-005 상태를 DONE으로 갱신한다.
   - [x] `docs/PROGRESS.md`에 변경 파일, 검증 결과, 남은 위험을 기록한다.

## Verification commands

```bash
# 1) 통합 진입점 전체 통과 확인
bash scripts/verify.sh
echo "exit=$?"   # 0 이어야 함

# (Makefile을 추가한 경우)
make verify
echo "exit=$?"

# 2) 실패 전파 확인 (선택): 일부러 실패를 주입했을 때 non-zero 종료하는지 확인
#    예) lint를 깨뜨리는 임시 변경 후 verify 실행 → exit != 0 확인 → 변경 원복

# 3) 개별 단계 직접 검증
cd frontend && npm ci && npm run build && npm run lint
cd ../backend && ./gradlew build test
cd ..

# 4) Docker Compose 문법 검증 (daemon/컨테이너 기동 불필요)
# 당시 Compose 명령은 폐기됨. 현재 명령은 docs/backend/MONGODB.md 참조.

# 5) Git diff 검사 (베이스라인 기준 증분 검사)
#    아래는 verify.sh가 구현해야 할 로직의 수동 재현이다.
#    빌드 전에 베이스라인을 캡처하고, 빌드 후 베이스라인 대비 새 변경만 본다.
BASE_TREE=$(git stash create)                                  # 빌드 전에 미리 실행해 둔다 (Task 자체 변경 포함)
BASE_STATUS=$(git status --porcelain --untracked-files=all | sort)
# ... (위 2~4의 빌드 단계 실행) ...
git diff --exit-code "${BASE_TREE:-HEAD}"                       # 추적 파일이 빌드로 변경됐으면 non-zero
comm -13 <(printf '%s\n' "$BASE_STATUS") \
         <(git status --porcelain --untracked-files=all | sort) # 출력이 있으면 빌드가 만든 새 변경 = 실패

# 6) 산출물 무시 처리 확인 (경로 부재/미무시에도 스크립트가 죽지 않게 종료코드 직접 해석)
for p in frontend/.next frontend/node_modules backend/build backend/.gradle; do
  if git check-ignore -q "$p"; then
    echo "ignored OK: $p"
  else
    echo "NOT ignored (실패): $p"
  fi
done
```

## Stop conditions

다음 상황에서 작업을 중단하고 BLOCKED로 보고한다:

1. Node.js / JDK / Docker CLI(+Compose) 미설치 또는 버전 불일치로 검증 단계 실행 불가. (JDK는 17 미만이면 BLOCKED.)
2. 검증 스크립트와 무관하게 기존 산출물(TASK-001 결과)이 깨져 빌드/테스트가 실패하는 경우. (스크립트로 우회하지 말고 원인을 보고한다.)
3. Docker CLI 또는 Compose 플러그인(`docker compose` / `docker-compose`)이 설치되어 있지 않아 `config` 검증 자체를 실행할 수 없는 경우. (Docker daemon 미기동은 `config` 검증에 영향을 주지 않으므로 BLOCKED 사유가 아니다.)
4. `npm ci`가 lockfile 불일치로 실패하는 경우. (lockfile 수정은 이 Task 범위 밖이므로 보고한다.)
5. 동일한 실패가 3회 반복되는 경우.

## Result

**상태**: DONE

**변경된 파일**:
- `scripts/verify.sh`
- `docs/PLAN.md`
- `docs/tasks/TASK-005.md`
- `docs/PROGRESS.md`

**실행한 명령**:
- `git status --short --untracked-files=all`
- `bash scripts/verify.sh`
- `bash scripts/verify.sh; echo "exit=$?"`
- `cd frontend && npm ci && npm run build && npm run lint`
- `cd backend && ./gradlew build test`
- `cd backend && GRADLE_USER_HOME="$PWD/.gradle" GRADLE_OPTS="-Dorg.gradle.cache.internal.locklistener=false" ./gradlew --no-daemon build test`
- 당시 DB Compose 문법 검사
- `BASE_TREE=$(git stash create); BASE_STATUS=$(git status --porcelain --untracked-files=all | sort); ...; git diff --exit-code "${BASE_TREE:-HEAD}"; comm -13 ...`
- `for p in frontend/.next frontend/node_modules backend/build backend/.gradle; do ... git check-ignore -q ...; done`

**검증 결과**:
- `bash scripts/verify.sh; echo "exit=$?"`: 성공, `exit=0` (권한 상승 환경). Frontend, Backend, Git baseline increment, build output ignore, Docker Compose config 모두 통과.
- `cd frontend && npm ci && npm run build && npm run lint`: 성공. ESLint 경고/에러 없음.
- `cd backend && ./gradlew build test`: 성공 (권한 상승 환경). `BUILD SUCCESSFUL`.
- `cd backend && GRADLE_USER_HOME="$PWD/.gradle" GRADLE_OPTS="-Dorg.gradle.cache.internal.locklistener=false" ./gradlew --no-daemon build test`: 일반 샌드박스에서 실패. `java.net.SocketException: Operation not permitted`.
- 당시 DB Compose 문법 검사: 성공 (현재 MongoDB 구성의 검증 결과가 아님).
- Git baseline 수동 재현: 성공. `git diff --exit-code "${BASE_TREE:-HEAD}"` exit 0, `comm -13` 추가 출력 없음.
- 산출물 ignore 검사: `frontend/.next`, `frontend/node_modules`, `backend/build`, `backend/.gradle` 모두 `ignored OK`.

**남은 위험**:
- 일반 샌드박스에서 Gradle은 로컬 파일락 통신 소켓 생성 제한으로 `java.net.SocketException: Operation not permitted`가 발생한다. `GRADLE_OPTS=-Dorg.gradle.cache.internal.locklistener=false`로도 우회되지 않았고, 실제 검증은 권한 상승 환경에서 통과했다.
- `npm ci` 중 deprecated package 경고와 audit 요약 `5 vulnerabilities (1 moderate, 4 high)`가 출력된다. `npm audit fix` 또는 의존성 업그레이드는 TASK-005 범위가 아니므로 실행하지 않았다.
- Gradle은 Gradle 9.0 호환성 관련 deprecated feature 경고를 출력한다. 현재 `build test`는 성공한다.
