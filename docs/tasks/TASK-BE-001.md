# TASK-BE-001 — MongoDB 단일 저장소 구성

- Status: IMPLEMENTED
- Updated: 2026-10-04
- Branch: `codex/mongodb-storage`
- Base: `81f5288`

## Goal

라인업 영구 저장을 MongoDB 하나로 통일한다. 기존 관리자·공개 API 경로, 요청·응답 형태,
공개 상태, UUID 식별자, 인증·입력 검증은 유지한다. 로컬 개발과 별도 DB 서버 실행을 지원한다.

## Authorization and scope

- 2026-10-02 사용자가 기존 관계형 DB 관련 구현·설정·의존성·문서 흔적을 제거하고 MongoDB만 남기도록 명시적으로 요청했다. 이전의 두 저장소 공존 요구를 대체한다.
- 현재 미커밋 작업 브랜치에서 정리한다. Spring Boot/Kotlin, 프론트 화면, 스모크·Riot 기능, 인증 정책은 변경하지 않는다.
- 저장소 파일의 제거는 승인 범위다. 실제 DB·기존 볼륨·컨테이너·비밀정보·Git 이력은 삭제하거나 수정하지 않는다.
- 기존 DB 데이터 자동 이전과 실제 원격 배포는 포함하지 않는다.
- 2026-10-04 사용자 요청으로 PR 전 작은 보완 두 가지(불필요한 테스트 프로필 제거, 수정 도중 삭제된 자료의 404 응답)를 완료하고 커밋·푸시 및 `codex/backend` 대상 PR을 제출한다. 새 백엔드 통합 브랜치는 최신 `origin/codex/frontend-rework` (`53a0542`)에서 생성한다. 병합은 사용자가 수행하며, 패키지·DTO·Repository 구조 변경은 후속 작업으로 남긴다.

## Allowed changes

- `.env.example`, `backend/.env.example`: 추적되는 공개 설정 예시만 정리. 실제 비밀 파일은 읽지 않는다.
- `backend/build.gradle.kts`
- `backend/src/main/kotlin/com/valorant/platform/lineup/`: 저장소 구현·문서 모델·인터페이스 수정. 서비스는 수정 도중 삭제된 자료를 404로 반환하는 예외 처리만 허용; 컨트롤러·인증·API 모델은 참조만 허용.
- `backend/src/main/resources/`: DB 연결 설정 정리 및 폐기된 스키마 파일 삭제.
- `backend/src/test/kotlin/com/valorant/platform/ApplicationTests.kt`
- `backend/src/test/kotlin/com/valorant/platform/lineup/`: 저장소·API 통합 테스트 및 수정/공개 상태 변경 도중 삭제 상황의 서비스 회귀 테스트. 폐기된 저장소 전용 테스트 삭제 허용. 나머지 검증 삭제·비활성화 금지.
- `backend/src/test/resources/application.yml`
- `docker/`: Mongo 실행 설정 및 폐기된 DB 실행 파일 정리.
- `.github/workflows/verify.yml`, `scripts/verify.sh`: 실제 Mongo 통합 테스트 실행 환경 연결.
- `README.md`, `docs/PLAN.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`
- `docs/backend/`, `docs/analysis/`: 현재 Mongo 저장 방식 및 미래 기능과 구현 범위 구분.
- `docs/tasks/`, `docs/visual-qa/`, `docs/PROGRESS.md`: 폐기된 DB 명령·설정 참조 정리. 과거 검증을 새 DB 검증으로 바꿔 기록하지 않는다.
- `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md`: 현재 범위와 실제 결과 갱신.

## Acceptance criteria

1. 배포되는 백엔드의 저장 구현·런타임 의존성·환경변수·프로필에는 MongoDB만 남는다.
2. LineupRepository 공통 인터페이스와 Mongo 구현은 유지한다. 생성은 insert, 수정은 기존 문서만 교체하고 공개 필터·정렬·UUID·중첩 자료를 보존한다.
3. 기존 API·인증·입력 검증은 보존하고 실제 MongoDB 통합 테스트를 모두 실행한다. 테스트 전용 무작위 DB만 생성·정리한다.
4. 로컬 Mongo와 인증된 서버용 Compose는 공식 Mongo 이미지, 영구 볼륨, 기본 loopback 바인딩을 사용한다. 기존 저장 자료는 건드리지 않는다.
5. CI 및 검증 스크립트에서 실제 테스트 DB를 사용할 수 있다. 테스트를 skip하지 않는다.
6. 실행 안내·설계·이전 기록에서 폐기된 DB 의존 안내를 제거하고 현재 구현 여부를 정직하게 기록한다.
7. 프론트/UI 변경이 없으므로 Visual QA는 대상이 아니다.
8. 조회 후 실제 수정 전에 자료가 삭제된 경우 수정/공개 상태 변경 모두 404로 응답한다. 별도 Mongo 프로필 없이 기본 구성의 통합 테스트가 통과한다.

## Verification commands

- `git diff --check`
- 저장소 파일을 대상으로 폐기된 DB 이름·드라이버·접속 변수·스키마·실행 명령 잔존 검색(비밀 파일, Git 내부, 생성물 제외).
- `docker compose -f docker/compose.mongodb.yml config --quiet`
- `docker compose --env-file /dev/null -f docker/compose.mongodb.server.yml config --quiet` (검증용 비밀 파일 경로만 제공)
- `node --check docker/mongodb/init-app-user.js`, `bash -n scripts/verify.sh`
- 별도 임시 Mongo를 실행한 뒤 `MONGODB_TEST_URI=<disposable-local-uri> ./gradlew --no-daemon clean test bootJar` (`backend`).
- 빌드한 JAR의 기본/railway 환경 시작, health 및 관리자 인증·등록·공개·조회·삭제, 재시작 후 자료 유지 확인.
- 패키지와 runtimeClasspath에 폐기된 저장소 구현·스키마·의존성 미포함 확인.

## Result

- Status: IMPLEMENTED
- Human Decision Required: NO
- 사용자 최종 요청에 따라 라인업 저장소를 MongoDB 하나로 통일했다. 폐기된 저장 구현·드라이버·스키마·연결 설정·전용 회귀 테스트를 제거했다.
- 기본/railway에서 동일한 Mongo 구현을 사용하며 API 경로·DTO·인증·Kotlin·프론트는 유지했다. 서비스는 수정 중 삭제된 자료의 404 응답만 보완했다.
- CI에 Mongo 7.0 테스트 서비스를 연결했다. 로컬 검증 스크립트는 전용 임시 프로젝트를 만들고 자기 컨테이너·볼륨만 정리한다.
- README·환경변수 예시·설계·실행 문서를 정리했다. 과거 기록은 당시 검증으로 보존하고 새 DB 검증으로 소급 변경하지 않았다.

### 실제 변경 파일

- `.github/workflows/verify.yml` (수정)
- `README.md` (수정)
- `backend/.env.example` (수정)
- `backend/build.gradle.kts` (수정)
- `backend/src/main/kotlin/com/valorant/platform/lineup/LineupRepository.kt` (수정)
- `backend/src/main/kotlin/com/valorant/platform/lineup/LineupService.kt` (수정)
- `backend/src/main/resources/application-railway.yml` (수정)
- `backend/src/main/resources/application.yml` (수정)
- `backend/src/main/resources/db/migration/V1__create_lineups.sql` (삭제)
- `backend/src/test/kotlin/com/valorant/platform/ApplicationTests.kt` (수정)
- `backend/src/test/kotlin/com/valorant/platform/lineup/LineupServiceTest.kt` (수정)
- `backend/src/test/resources/application.yml` (수정)
- `docker/docker-compose.yml` (삭제)
- `docs/ARCHITECTURE.md` (수정)
- `docs/DECISIONS.md` (수정)
- `docs/PLAN.md` (수정)
- `docs/PROGRESS.md` (수정)
- `docs/analysis/ARCHITECTURE.md` (수정)
- `docs/analysis/DATA_MODEL.md` (수정)
- `docs/backend/PLAN.md` (수정)
- `docs/tasks/TASK-001.md` (수정)
- `docs/tasks/TASK-005.md` (수정)
- `docs/tasks/TASK-011.md` (수정)
- `docs/tasks/TASK-011D.md` (수정)
- `docs/tasks/TASK-018_LINEUP_BACKEND.md` (수정)
- `docs/tasks/TASK-020_LINEUP_EDITOR.md` (수정)
- `docs/tasks/TASK-021_ADMIN_ACCESS.md` (수정)
- `docs/tasks/TASK-022_ADMIN_REVIEW.md` (수정)
- `docs/tasks/TASK-023_ADMIN_EDIT.md` (수정)
- `docs/tasks/TASK-024_PUBLIC_LINEUP_API.md` (수정)
- `docs/tasks/TASK-FE-001.md` (수정)
- `docs/visual-qa/TASK-022_ADMIN_REVIEW.md` (수정)
- `docs/visual-qa/TASK-023_ADMIN_EDIT.md` (수정)
- `docs/visual-qa/TASK-024_PUBLIC_LINEUP_API.md` (수정)
- `scripts/verify.sh` (수정)
- `backend/src/main/kotlin/com/valorant/platform/lineup/LineupDocument.kt` (신규)
- `backend/src/main/kotlin/com/valorant/platform/lineup/MongoLineupRepository.kt` (신규)
- `backend/src/test/kotlin/com/valorant/platform/lineup/LineupMongoApiIntegrationTest.kt` (신규)
- `backend/src/test/kotlin/com/valorant/platform/lineup/MongoLineupRepositoryIntegrationTest.kt` (신규)
- `docker/compose.mongodb.server.yml` (신규)
- `docker/compose.mongodb.yml` (신규)
- `docker/mongodb/init-app-user.js` (신규)
- `docs/backend/MONGODB.md` (신규)
- `docs/tasks/TASK-BE-001.md` (신규)

무시된 `.agent-reports/HANDOFF.json`과 `.agent-reports/CURRENT.md`도 갱신했다.
이전 미커밋 작업에서 추가했던 폐기 저장 구현·전용 회귀 테스트 두 파일도 삭제했다.

### 실제 실행 및 검증 결과 (2026-10-02)

- 환경: 로컬 Docker 29.4.3, MongoDB 7.0, Microsoft OpenJDK 21.0.9로 빌드/테스트, Java 17 대상 바이트코드. 실제 Java 17 환경의 CI는 아직 실행하지 않았다.
- `MONGODB_TEST_URI=<이번 검증의 임시 로컬 URI> ./gradlew --no-daemon clean test bootJar`: **PASS — 23개 / 실패 0 / 오류 0 / 제외 0**.
  폐기된 저장소 전용 테스트 1개를 제거하고 기본 실행 health 테스트 1개를 추가했으므로 전체 수는 같다.
- `./gradlew --no-daemon bootJar`: 소스와 생성물의 빈 스키마 디렉터리 제거 후 다시 패키징 PASS.
- 패키지 ZIP 및 `./gradlew --no-daemon dependencies --configuration runtimeClasspath`: 폐기 저장소 클래스·스키마·라이브러리 미포함 PASS.
- 실제 JAR: 기본 로컬 DB 및 `railway` 인증 DB에서 health, 관리자 무인증 거절, 등록→수정→공개→조회→재시작 조회→비공개→삭제 PASS. 테스트 YAML이 아닌 실제 실행 설정 사용.
- 로컬/인증 서버용 Compose `config --quiet`, `up -d --wait`: PASS. 서버용 인증 URI로 백엔드 연결 PASS.
- `scripts/verify.sh`의 실제 Mongo 준비/정리 함수를 분리 실행: 임의 포트의 새 DB 생성·정리 PASS, 외부 테스트 URI 제공 시 해당 서버 보존 PASS. 전체 프론트 재설치·빌드는 이번에 실행하지 않았다.
- `bash -n scripts/verify.sh`, `node --check docker/mongodb/init-app-user.js`, 변경 YAML 파싱, `git diff --check`: PASS.
- 추적/신규 저장소 텍스트에서 폐기된 DB 이름·드라이버·환경변수·명령·경로 잔존 검색: 0건. 실제 비밀 파일·Git 내부·빌드 캐시는 제외.
- 독립 리뷰에서 Compose v1 허용 조건과 원격 URI 문서 예제 누락을 발견해 수정했다.
- 이번 임시 DB 프로젝트·볼륨·비밀번호 파일은 정리 완료. 기존 프론트 컨테이너는 그대로 실행 중이다.

### PR 전 최종 보완과 검증 (2026-10-04)

- 통합 테스트의 불필요한 Mongo 프로필 선택을 제거했다.
- 조회 후 수정 전에 자료가 삭제되면 일반 수정/공개 상태 변경 모두 기존과 같은 404를 반환한다. 스레드 실행 순서에 의존하지 않는 서비스 회귀 테스트 2개를 추가했다.
- 실 MongoDB 7.0 임시 구성에서 `./gradlew --no-daemon clean test bootJar`: **PASS — 25개 / 실패 0 / 오류 0 / 제외 0**. Java21 실행, Java17 대상.
- 새 JAR의 기본 모드와 인증된 MongoDB를 사용하는 railway 모드에서 health·인증 거절·등록·수정·공개·필터·재시작 후 보존·비공개·삭제 PASS.
- 실행 패키지와 runtimeClasspath의 폐기된 저장소 라이브러리/스키마 미포함 PASS. Compose 두 설정·YAML·쉘/JS 문법·diff 검사 PASS.
- 독립 코드 검토 PASS. 프론트 변경은 없으며 전체 프론트 빌드/UI QA는 반복하지 않았다.
- 이번 검증에서 만든 로컬/인증 Mongo 프로젝트·볼륨·비밀번호 파일을 모두 정리했다. 기존 프론트 환경은 보존했다.
- `codex/backend`를 최신 프론트 통합 버전 `53a0542`에서 생성했다. 이번 PR의 작업 브랜치는 `codex/mongodb-storage`이며 병합은 사용자가 수행한다.

### 남은 사항

- 실제 배포 환경에는 인증된 `MONGODB_URI`와 관리자 토큰을 별도로 설정해야 한다. 기존 데이터 자동 이전이나 실제 서버 배포는 수행하지 않았다.
- 프론트 관리자 화면의 실제 사용자 조작을 통한 통합 확인과 신규 기능은 이번 범위에 포함하지 않는다.
- 기존 Gradle deprecated 경고는 남는다. GitHub CI 실행 결과는 push 후 확인할 수 있다.
- 사용자 요청에 따라 검증된 변경을 커밋·푸시하고 `codex/backend` 대상 PR을 제출한다. 패키지 전체 정리는 다음 작업으로 남긴다.

### dev 통합 PR 준비 (2026-10-04)

- 사용자가 PR #37을 `codex/backend`에 병합한 뒤 `dev` 대상 PR 생성을 요청했다.
- `origin/codex/backend` (`16f1b5d`)와 `origin/dev` (`9ac428c`)를 비교했다. 코드 충돌은 없고 `docs/PROGRESS.md`의 신규 기록 삽입 위치만 충돌했다.
- `codex/backend`에 `origin/dev`를 병합 준비하고 양쪽 진행 기록을 원문 그대로 보존했다. README와 PLAN의 자동 병합도 독립 검토 PASS.
- `git diff --cached --quiet origin/dev -- frontend`: PASS. 프론트는 dev와 동일하다.
- 백엔드·Docker·CI·검증 스크립트의 staged 비교: 기존 검증된 `origin/codex/backend`와 동일, PASS.
- 진행 기록 두 블록 원문 보존 검사 및 `git diff --check`, `git diff --cached --check`: PASS.
- PR #37의 GitHub Verify 프론트 빌드/Lint·Java17 백엔드 빌드·배포 설정 검사 모두 PASS 확인. 실행 코드 변경이 없어 기존 실 Mongo 테스트 25개와 실행 JAR 검증은 반복하지 않았다.
- 최종 dev 병합과 실제 배포는 사용자가 결정한다. 이번 통합으로 운영 Mongo 연결값이나 관리자 토큰을 설정하지 않는다.
