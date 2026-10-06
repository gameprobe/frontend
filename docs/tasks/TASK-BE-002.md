# TASK-BE-002 — Docker 백엔드와 MongoDB Atlas 연결

- Status: IMPLEMENTED
- Branch: `codex/backend-atlas-docker`
- Base: `d042256` (dev, PR #43 병합)

## Goal

로컬 백엔드를 Docker로 실행하고 `MONGODB_URI`로 사용자가 준비한 Atlas에 연결한다. 애플리케이션 실행용 MongoDB 컨테이너 설정은 제거한다.

## Authorization and scope

- 사용자가 Atlas 사용, 백엔드 Docker 실행, 로컬 MongoDB 이미지 구성 제거를 요청했다.
- `codex/backend`를 최신 dev로 fast-forward하고 작업 브랜치를 분기했다. 최종 사용자 요청으로 커밋·푸시·`codex/backend` 대상 PR 제출을 승인받았다. 병합·배포는 수행하지 않는다.
- 기존 Spring Data MongoDB와 Kotlin을 유지한다. 공개 API, 저장 문서 구조, 인증 정책, 관리자 preview 및 프론트는 변경하지 않는다.
- 운영/개발 DB를 자동 테스트 대상으로 사용하지 않는다. 기존 통합 테스트를 유지하기 위한 격리된 일회용 MongoDB와 CI 서비스는 테스트 용도로만 유지한다.
- 기존 컨테이너·볼륨·이미지 캐시를 무차별 삭제하지 않는다. 현재 MongoDB 컨테이너와 프로젝트 이름의 MongoDB 볼륨은 발견되지 않았다.
- 비밀값은 `backend/.env` 또는 실행 환경에만 보관한다. 로그·보고서·Git에 URI/토큰 원문을 출력하지 않는다. 사용자가 값을 넣기 전 실제 Atlas 연결 성공으로 보고하지 않는다.

## Allowed changes

- `docker/compose.backend.yml` (신규)
- `docker/compose.mongodb.yml`, `docker/compose.mongodb.server.yml`, `docker/mongodb/init-app-user.js` (실행용 구성 제거)
- `backend/Dockerfile`, `backend/Dockerfile.dockerignore`
- `backend/.env.example`, `backend/.env` (실제 파일은 Git 제외, 기존 값 보존)
- `backend/src/main/resources/application.yml`, `backend/src/main/resources/application-railway.yml`
- `scripts/verify.sh` (제거한 Compose 참조를 테스트 전용 임시 DB로 대체)
- `README.md`, `docs/backend/MONGODB.md`, `docs/backend/PLAN.md`, `docs/PLAN.md`, `docs/PROGRESS.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`
- `docs/tasks/TASK-BE-002.md`, `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md`
- 나머지 HANDOFF 파일은 읽기 전용. 의존성·CI 테스트·기존 테스트 내용은 변경하지 않는다.

## Acceptance criteria

1. Docker Compose가 백엔드 한 서비스만 실행하고 Atlas URI를 런타임으로 전달한다. 기본 공개 포트는 localhost:8080이다.
2. URI 미설정 시 명확하게 실패하며, 이미지에는 실제 환경파일이 들어가지 않는다.
3. DB 이름·Atlas 사용자/IP 접근·URI 특수문자 처리·실행/중지/검증 절차를 문서에 안내한다.
4. 테스트는 일회용 로컬 DB에서만 수행하며 기존 25개 테스트를 건너뛰지 않는다. 프론트 서버는 유지한다.
5. 실제 Atlas URI가 제공되면 기존 인덱스 초기화와 서버 기동, health 및 공개 GET을 확인한다. 운영 자료 쓰기/삭제 테스트는 하지 않는다.
6. UI 변경 없음: Visual QA 대상 아님.

## Verification commands

- `git diff --check`, `bash -n scripts/verify.sh`
- 비밀값 없는 임시 환경으로 `docker compose --env-file ... -f docker/compose.backend.yml config --quiet/--services`; URI 없는 경우 실패 검사
- `docker build -f backend/Dockerfile -t valorant-backend:atlas-dev .`
- 격리된 일회용 MongoDB로 기존 `./gradlew --no-daemon test bootJar` 실행 및 테스트 결과 확인
- 새 백엔드 이미지/Compose의 `/health`, 공개 `/api/lineups`, 무인증 관리자 거절 확인 (격리 DB)
- 실제 Atlas URI 존재 시 사용자 환경으로 Compose 실행하고 GET 확인. 미제공 시 그 한계 기록
- Docker 빌드 컨텍스트/환경파일 Git 제외 확인, 삭제한 실행 설정 참조 검색, 독립 검토

## Result

### 구현 결과

- `codex/backend`를 dev `d042256`으로 fast-forward한 후 `codex/backend-atlas-docker`를 분기했다. 구현 검증 후 사용자 요청으로 커밋·푸시·PR 제출을 진행한다.
- Docker Compose는 백엔드만 localhost:8080에 실행한다. 기존 Spring Data MongoDB를 사용하고 `MONGODB_URI`를 필수로 받는다.
- 앱 실행용 MongoDB Compose 2개와 계정 초기화 스크립트를 제거했다. 기존 볼륨·다른 이미지·프론트 서버는 보존했다.
- Dockerfile 전용 제외 규칙으로 빌드에 필요한 파일만 전달하고 환경파일·프론트·테스트 소스를 제외했다. Java 프로세스가 종료 신호를 직접 받도록 `exec`를 사용했다.
- 전체 검증 스크립트의 삭제된 Compose 참조를 테스트 전용 tmpfs MongoDB로 교체했다. 운영 URI·프로필·JSON 설정을 테스트 서브셸에서 분리한다. CI 및 기존 테스트 내용은 그대로다.
- 사용자 로컬 `backend/.env`를 Git 제외·0600으로 준비했다. 사용자 입력 완료 후 빠진 DB 이름만 `/valorant_platform`으로 보완했다. 비밀번호·URI 원문은 출력하거나 추적 파일에 저장하지 않았다.

### 변경 파일

- 신규: `docker/compose.backend.yml`, `backend/Dockerfile.dockerignore`, `docs/tasks/TASK-BE-002.md`
- 수정: `backend/Dockerfile`, `backend/.env.example`, `backend/src/main/resources/application.yml`, `scripts/verify.sh`
- 제거: `docker/compose.mongodb.yml`, `docker/compose.mongodb.server.yml`, `docker/mongodb/init-app-user.js`
- 문서: `README.md`, `docs/backend/MONGODB.md`, `docs/backend/PLAN.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/PLAN.md`, `docs/PROGRESS.md`
- 로컬 전용: `backend/.env`, `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md`

### 실제 검증

- `git diff --check`, `bash -n scripts/verify.sh`: PASS.
- 비밀값 없는 임시 URI + `docker compose --env-file /dev/null -f docker/compose.backend.yml config --services`: `backend` 하나. URI를 제거한 `config --quiet`는 명확하게 거절: PASS.
- `docker build --target builder -f backend/Dockerfile -t valorant-backend:be002-builder .`: Java17 `bootJar` 성공. 이후 `docker compose --env-file backend/.env -f docker/compose.backend.yml up -d --build --wait`로 최종 런타임 이미지 빌드 성공. 초기 전체 소스 컨텍스트 약85KB, 실제 환경파일은 빌드 대상에서 제외.
- `docker run --rm eclipse-temurin:17-jre sh -c 'command -v curl'`: `/usr/bin/curl` 확인.
- 검증 스크립트의 `prepare_test_mongodb`와 `verify_backend`를 임시 실행기에서 호출: `./gradlew --no-daemon build test` PASS, **25 tests / 0 failures / 0 errors / 0 skipped**. 런타임 URI·프로필·JSON을 의도적으로 잘못 지정한 상태에서도 격리 테스트 URI를 사용함을 확인했다. 테스트 컨테이너 자동 정리 PASS.
- 새 런타임 이미지를 별도 tmpfs DB에 연결: `/health` 200 UP, `/api/lineups` 200 `[]`, 무인증 `/api/admin/lineups` 403. 이미지 내 환경파일·테스트 소스 없음. 검증 컨테이너 모두 정리 PASS.
- 실제 사용자 Atlas: 첫 기동은 URI의 DB 이름 누락으로 종료. DB 이름을 보완한 뒤 `docker compose --env-file backend/.env -f docker/compose.backend.yml up -d --wait` PASS, **healthy**. `/health` 200, `/api/lineups` 200 (공개 자료0건), 무인증 관리자 GET403. 테스트 자료 등록·수정·삭제 요청은 보내지 않았다.
- `git check-ignore backend/.env`: PASS. 실제 환경파일0600. 현재 실행 안내·스크립트에서 제거한 Mongo Compose/init 참조0.
- 독립 읽기 전용 코드 검토 PASS: 필수 URI, 빌드 제외, 테스트 분리, 해당 실행의 컨테이너만 정리, 범위 확인.
- 검증 실행기 첫 시도에서 임시 함수 로딩이 실패했다. 실행기에 함수 복사본을 사용하도록 고친 뒤 테스트25개를 정상 실행했다. 제품 코드 결함이나 테스트 생략은 아니다.
- UI 변경이 없어 Visual QA와 프론트 재빌드는 대상이 아니다. 전체 `scripts/verify.sh` 중 프론트 부분을 재실행하지 않고 변경된 백엔드/Compose 경로를 검증했다.

### 남은 범위와 주의 사항

- 백엔드는 `http://localhost:8080`에서 Atlas에 연결되어 실행 중이다. 기존 기동 시 `lineups` 인덱스 생성 동작은 유지된다.
- 이번 실제 Atlas 검증은 연결·기존 초기화·읽기 확인이다. 실제 Atlas에 대한 등록/삭제 테스트나 운영 배포·부하/백업 검증은 하지 않았다.
- `/admin/preview` 메모리 자료·스모크 예시·전적 Mock은 자동 저장되지 않는다. 관리자 새 편집기와 실제 저장 API 연결은 후속 Task다.
- `/health`는 DB를 직접 검사하지 않으므로 장애 확인에는 공개 DB 조회도 함께 사용한다.
- 실제 URI·관리자 토큰은 로컬/배포 환경에서 관리한다. 원격 저장소에는 포함하지 않는다.
- Gradle 기존 deprecation 안내가 있었으며 빌드·테스트는 성공했다. 패키지 업그레이드는 수행하지 않았다.


### 마무리 전 재확인

- 사용자 요청으로 현재 backend `running healthy`, health200/공개GET200(0건)/미인증관리자403 재확인.
- 실제 `backend/.env`는 Git 미추적·제외·0600이며 스테이지와 로컬 전체 ref 이력에 없다. 추적 환경파일은 `.env.example`3개만 있다.
- 변경 파일의 실제 Mongo 자격정보 URI 후보0. Docker 빌드에서 환경파일 제외, 최종 이미지에 URI/토큰 환경변수 내장 없음 독립 검토 PASS.
- 원문 비밀값 재열람·출력 없음. 코드 변경·커밋·푸시·PR 없이 점검 결과만 기록했다.

### PR 제출 승인

- 사용자가 현재 상태의 PR 제출을 명시적으로 요청했다.
- 원격 `codex/backend`는 dev의 조상(0/10)이고 로컬 backend는 최신 dev `d042256`과 동일하다. 이미 병합된 dev 이력을 일반 fast-forward 푸시하여 PR에 BE-002 변경만 표시한다. 강제 푸시·새 기능 병합은 하지 않는다.
- 최종17개 변경 파일은 허용 범위이며 실제 `.env`는 제외한다. 동일 소스의 기존25개 테스트·빌드·Atlas 검증 결과를 사용하고 커밋 전 diff/환경파일 제외를 재검사한다.
