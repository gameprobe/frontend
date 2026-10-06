# TASK-001: 프로젝트 초기 실행 환경 구성

> 2026-10-02 기록 정리: 아래는 당시 작업·검증 기록이다. 폐기된 DB별 명령·설정은 제거했으며,
> 현재 MongoDB 실행·검증 방법은 [실행 안내](../backend/MONGODB.md)와
> [TASK-BE-001](../tasks/TASK-BE-001.md)을 따른다. 과거 PASS를 MongoDB 검증 결과로 해석하지 않는다.

## Status

**DONE**

## Goal

프로젝트의 기본 디렉토리 구조를 생성하고, Frontend(Next.js)와 Backend(Spring Boot)를 초기화하여 각각 실행 가능한 상태로 만든다.

## Context

이 Task는 Phase 0의 첫 번째 작업이다. 이후 모든 개발 작업의 기반이 된다.

**선행 조건**:
- Node.js (v18 이상)
- JDK 17 이상
- Docker (당시 DB용)

**의존성**:
- 없음 (첫 번째 Task)

**관련 결정**:
- PENDING-001: Next.js 버전 → 이 Task 시작 전 결정 필요
- PENDING-002: Spring Boot 버전 → 이 Task 시작 전 결정 필요
- PENDING-005: 테스트 프레임워크 → 이 Task에서 기본 설정

## Allowed changes

```
frontend/
├── package.json
├── next.config.js (또는 next.config.ts)
├── tsconfig.json
├── src/
│   └── app/
│       ├── layout.tsx
│       └── page.tsx
└── (기타 Next.js 기본 파일)

backend/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle/
├── gradlew, gradlew.bat
└── src/
    └── main/
        └── kotlin/
            └── com/valorant/platform/
                └── Application.kt

docker/
└── 당시 DB Compose 설정 (현재 폐기됨)

.editorconfig
```

## Forbidden changes

- `docs/` 내용 수정 (PROGRESS.md 제외)
- `AGENTS.md` 수정
- 실제 기능 코드 추가
- Mock 데이터 추가
- 외부 API 연동

## Acceptance criteria

1. **Frontend**
   - [x] `cd frontend && npm install` 성공
   - [x] `cd frontend && npm run dev` 실행 시 localhost:3000에서 기본 페이지 표시
   - [x] `cd frontend && npm run build` 성공
   - [x] `cd frontend && npm run lint` 경고/에러 없음
   - [x] TypeScript 설정 완료 (strict mode)

2. **Backend**
   - [x] `cd backend && ./gradlew build` 성공
   - [x] `cd backend && ./gradlew bootRun` 실행 시 localhost:8080 응답
   - [x] `/health` 엔드포인트 200 OK 반환
   - [x] Kotlin 설정 완료

3. **당시 DB**
   - [x] DB 컨테이너 기동 성공
   - [x] DB 컨테이너 정상 실행
   - [x] Backend에서 DB 연결 성공 (연결 설정만, 당시 실제 데이터 구조 없음)

4. **공통**
   - [x] `.editorconfig` 생성
   - [x] 각 프로젝트 README 또는 최소 실행 가이드 포함

## Verification commands

```bash
# Frontend
cd frontend
npm install
npm run build
npm run lint
npm run dev &
sleep 5
curl http://localhost:3000 | head -20
kill %1

# Backend
cd backend
./gradlew build
./gradlew bootRun &
sleep 10
curl http://localhost:8080/health
kill %1

# 당시 DB 실행 명령은 폐기됨. 현재 명령은 docs/backend/MONGODB.md 참조.
```

## Stop conditions

다음 상황에서 작업을 중단하고 BLOCKED로 보고한다:

1. Node.js 또는 JDK 버전 불일치로 설치 실패
2. 의존성 충돌 3회 이상 해결 실패
3. Docker 실행 환경 문제
4. PENDING 결정이 필요한데 진행 불가능한 경우

## Result

**상태**: DONE

**PLAN.md 통합 범위**:
이 Task로 PLAN.md의 TASK-002 (Frontend 초기화), TASK-003 (Backend 초기화), TASK-004 (당시 DB 개발 환경 구성) 범위도 함께 충족됐다. 별도 Task 문서는 작성하지 않는다.

**변경된 파일**:
- `.editorconfig`
- `.gitignore` (승인된 예외 — 아래 `Approved exceptions` 참조)
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/next.config.js`
- `frontend/tsconfig.json`
- `frontend/.eslintrc.json`
- `frontend/.gitignore`
- `frontend/next-env.d.ts`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/globals.css`
- `backend/build.gradle.kts`
- `backend/settings.gradle.kts`
- `backend/gradle/wrapper/gradle-wrapper.jar`
- `backend/gradle/wrapper/gradle-wrapper.properties`
- `backend/gradlew`
- `backend/gradlew.bat`
- `backend/src/main/kotlin/com/valorant/platform/Application.kt`
- `backend/src/main/resources/application.yml`
- `backend/src/test/kotlin/com/valorant/platform/ApplicationTests.kt`
- 당시 DB Compose 파일 (현재 폐기됨)
- `docs/PLAN.md` (승인된 예외 — 아래 `Approved exceptions` 참조)
- `docs/tasks/TASK-001.md`
- `docs/PROGRESS.md`

**실행한 명령**:
- `git status --short`
- `find . -maxdepth 3 -type d | sort`
- `node --version`
- `npm --version`
- `java -version`
- `gradle --version`
- `docker --version`
- `docker-compose --version`
- `npm install`
- `npm install --foreground-scripts --loglevel verbose`
- `npm install next@14 eslint-config-next@14 --save-exact`
- `npm run build`
- `npm run lint`
- `npm run dev & sleep 5; curl http://localhost:3000 | head -20; kill %1`
- `./gradlew build`
- `./gradlew bootRun & sleep 10; curl -i http://localhost:8080/health; kill %1`
- 당시 DB 컨테이너 기동·상태·연결·종료 검증 (폐기된 접속 명령은 삭제)
- `git check-ignore -v backend/gradle/wrapper/gradle-wrapper.jar`
- `git add -f backend/gradle/wrapper/gradle-wrapper.jar`
- `npm audit --omit=dev`
- `npm audit`

**검증 결과**:
- Frontend `npm install`: 성공. 샌드박스에서는 registry 접근 지연으로 중단 후 권한 상승으로 성공.
- Frontend `npm run build`: 성공.
- Frontend `npm run lint`: 성공. ESLint 경고/에러 없음.
- Frontend `npm run dev` + `curl http://localhost:3000`: 성공. 기본 페이지 HTML 반환.
- Backend `./gradlew build`: 성공. 최초 실패 원인은 Java 17 toolchain 강제 설정이었고, JDK 21에서 Java/Kotlin target 17로 컴파일하도록 수정 후 성공.
- Backend `./gradlew bootRun` + `curl http://localhost:8080/health`: 성공. `/health`가 `HTTP/1.1 200` 및 `{"status":"UP"}` 반환.
- 당시 DB 컨테이너 기동·상태·연결·조회·종료: 성공. 현재 MongoDB 검증과는 별개의 과거 결과다.
- Gradle Wrapper JAR: `.gitignore`의 `*.jar` 규칙에 의해 무시되던 문제를, `.gitignore`에 `!backend/gradle/wrapper/gradle-wrapper.jar` 예외를 추가해 정상 추적되도록 해결했다 (승인된 예외 — 아래 `Approved exceptions` 참조). `git check-ignore`로 더 이상 무시되지 않음을 확인했다.
- npm audit 범위 확인: 배포 의존성(`--omit=dev`)에도 `next` high, `postcss` moderate 취약점이 보고됨. 전체 audit에서는 dev dependency 경로의 `glob` high까지 포함해 총 5건(1 moderate, 4 high)이 보고됨. `npm audit fix --force`는 breaking change가 필요하므로 실행하지 않음.

**남은 위험**:
- `npm audit --omit=dev` 기준으로도 배포 의존성 취약점이 남아 있다. 자동 수정은 Next.js 16으로의 breaking change를 요구하므로 TASK-001 범위에서는 적용하지 않았다. npm audit 취약점 검토는 별도 후속 작업으로 분리한다.

## Approved exceptions

아래 두 변경은 TASK-001의 원래 `Allowed changes`에는 포함되지 않았으나, 작업 중 필요성이 확인되어 **사람의 명시적 승인을 받아 수행한 예외**다. 원래 Task 계약(위 `Allowed changes` / `Forbidden changes`)은 그대로 유지하며, 소급해서 변경하지 않는다.

1. **`.gitignore` 수정 (Gradle Wrapper 추적용)**
   - 내용: `*.jar` 중복 규칙을 정리하고 `!backend/gradle/wrapper/gradle-wrapper.jar` 예외를 추가했다.
   - 사유: `.gitignore`의 `*.jar` 규칙이 Gradle Wrapper JAR를 무시해, Wrapper가 정상 추적되지 않았다. Backend를 클론만으로 실행 가능하게 하려면 Wrapper JAR가 추적되어야 한다.
   - 원래 `Forbidden changes`에는 `.gitignore`가 명시되어 있지 않았으나 `Allowed changes`에도 없었으므로, 범위 밖 변경으로 간주하고 승인 예외로 기록한다.

2. **`docs/PLAN.md` 수정 (계획-실제 상태 정합성)**
   - 내용: TASK-001이 TASK-002~004 범위까지 함께 수행했음을 PLAN.md에 반영하고, 현재 Task를 TASK-005 대기로 갱신했다.
   - 사유: TASK-001 구현이 PLAN.md상 별도 Task였던 Frontend/Backend/당시 DB 초기화까지 실제로 수행했다. 계획 문서가 실제 완료 범위와 어긋나면 이후 Task 정합성이 깨지므로 실제 상태에 맞췄다.
   - 원래 `Forbidden changes`에 "`docs/` 내용 수정 (PROGRESS.md 제외)"가 있어 PLAN.md 수정은 명시적으로 금지 범위였다. 따라서 이 변경은 승인 예외로 명확히 기록한다.
