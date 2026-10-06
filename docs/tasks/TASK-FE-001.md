# TASK-FE-001: 프론트 Docker 개발 환경 구성

> 2026-10-02 기록 정리: 아래는 당시 작업·검증 기록이다. 폐기된 DB별 명령·설정은 제거했으며,
> 현재 MongoDB 실행·검증 방법은 [실행 안내](../backend/MONGODB.md)와
> [TASK-BE-001](../tasks/TASK-BE-001.md)을 따른다. 과거 PASS를 MongoDB 검증 결과로 해석하지 않는다.

## Status

IMPLEMENTED — 최신 main이 반영된 `b6d1d3b` 기준으로 구현·검증 완료.
2026-09-16 사용자가 지정한 프론트 Docker 환경을 `codex/frontend-docker-dev`에
구현했다. 통합 브랜치 `codex/frontend-rework` 병합 전 사람 검토 대기다.

## Goal

호스트의 Node/npm 버전과 관계없이, 기존 프론트를 고정된 개발 환경에서 실행한다.
Docker Compose 명령 하나로 Next.js 개발 서버를 켜고, 로컬 소스 수정이 화면에
반영되도록 한다. 백엔드와 DB 없이 홈·Mock 프로필과 공개 라인업 목록의 기존
Mock fallback을 확인할 수 있어야 한다. 실제 API·관리자 저장 검증은 제외한다.

## Context

- 최초 작성 기준은 `127ed49`였으나, 사용자 병합 커밋 `f4e90d1`로 원격 main
  `19a2415`를 통합했다. 이번 구현 기준은 통합 브랜치의 `b6d1d3b`다.
  Node/npm·잠금 파일·Next 설정·API fallback과 허용 범위를 다시 확인했다.
- 프론트는 Next.js 14.2.35 / React 18.3.1이고, package.json과 lockfile의 해당
  버전은 일치한다. 버전 업그레이드는 이 Task의 목표가 아니다.
- `frontend/.nvmrc` 기준은 Node.js 22.20.0이고, TASK-005A의 기존 검증 기준은
  npm 10.9.3이다.
- 2026-09-16 조사에서 에이전트 기본 셸은 Node 24.16.0 / npm 11.13.0이었다.
  이는 환경 차이 확인이며, 해당 차이로 실제 앱 오류가 발생했다고 검증한 것은 아니다.
- 당시 DB Compose는 프론트를 포함하지 않았고, `backend/Dockerfile`은
  Railway 배포용이다. 이 Task 착수 전에는 프론트 개발용 Docker 설정이 없었다.
- 전적 화면은 로컬 Mock을 읽는다. 공개 라인업 목록은 브라우저에서
  `NEXT_PUBLIC_BACKEND_URL`(기본 `http://localhost:8080`)의 API를 호출하며,
  실패하면 기존 Mock 목록과 안내를 표시한다. 따라서 이 화면 확인에는
  백엔드·DB·API 키가 필요하지 않지만 실제 API·관리자 저장에는 별도 환경이 필요하다.
- `next.config.js`의 Git 커밋 조회는 저장소 메타데이터가 없는 컨테이너에서
  기존 fallback인 `unknown`을 사용한다. 배지 동작을 위해 제품 설정을 변경하거나
  `.git`을 이미지에 넣지 않는다.
- 새 공통 지침의 `.agent-reports/HANDOFF.json`은 현재 없다. 이번 사용자 지정과
  아래 Allowed changes를 기준으로 프론트 Docker 환경만 구현하며 소스 수정은
  명시된 일시적 자동 반영 검증으로 한정한다.
- 프론트 계획: [docs/frontend/PLAN.md](../frontend/PLAN.md).

## Allowed changes

다음 파일만 최종 변경할 수 있다.

| 파일 | 허용 범위 |
|------|-----------|
| `frontend/Dockerfile.dev` | 공식 Node 이미지 기반 개발 환경, Node/npm 고정, 의존성 설치와 개발 서버 실행 |
| `frontend/.dockerignore` | 호스트 node_modules·.next·로컬 환경 파일 등을 빌드 컨텍스트에서 제외 |
| `docker/compose.frontend.yml` | 프론트 단독 서비스, 소스 마운트, 컨테이너 전용 의존성·캐시 볼륨, 포트 설정 |
| `README.md` | 로컬 프론트 Docker 시작·중지·검증·의존성 갱신 방법 추가 |
| `docs/tasks/TASK-FE-001.md` | 최신 기준선·실행 조건 재검토 및 Status·Result 기록 |
| `docs/frontend/PLAN.md` | 이 Task 상태 요약 |
| `docs/PLAN.md` | 이 Task의 현재 상태 요약만 동기화 |
| `docs/PROGRESS.md` | 이 Task 결과 요약과 링크 |
| `.agent-reports/CURRENT.md` | Codex Implementation 및 공통 상태 스냅샷만 |

자동 반영 검증을 위해 `frontend/src/app/page.tsx`의 화면 문구 한 곳을 일시적으로
바꾸고 즉시 복원할 수 있다. 기존 사용자 변경이 있으면 덮어쓰지 않는다. 검증 전후
파일 내용이 같아야 하며 최종 제품 코드 변경은 허용하지 않는다.

## Forbidden changes

- `backend/**`, 당시 DB 실행 설정 및 기존 데이터/볼륨 변경.
- 프론트 화면·Mock·타입·조회 함수 변경(위 일시적 자동 반영 검증 예외만 허용).
- `frontend/package.json`, `frontend/package-lock.json`, `frontend/.nvmrc`,
  `frontend/next.config.js` 변경; 패키지 추가·업그레이드·audit 자동 수정.
- 공통 CI, `scripts/verify.sh`, 프로젝트 지침, 기존 Task 문서 변경.
- API·인증·실제 데이터 연결, 운영 이미지/배포, 원격 서비스 작업.
- 사용자 지시 없는 git add/commit/push/merge, 다음 Task 자동 시작.
- `docker system prune`, 기존 DB 볼륨 삭제, 다른 작업의 컨테이너 종료.

## Required changes

1. Node.js 22.20.0 / npm 10.9.3을 명시적으로 고정한다. 공식 Node 이미지의
   구체적인 버전 태그를 사용하고 `latest` 태그는 사용하지 않는다. npm 버전이
   다르면 컨테이너 안에서 해당 버전을 명시적으로 설정한다.
2. lockfile을 유지하며 `npm ci`로 설치한다. 소스 마운트가 이미지의 설치 결과를
   가리지 않도록 구성한다. 반복 실행 및 lockfile 변경 뒤에도 오래된 의존성을
   그대로 사용하지 않는 절차를 구현하고 README에 설명한다.
3. `docker/compose.frontend.yml`은 단독 파일로 실행 가능하며 서비스 이름은
   `frontend`, 프로젝트 이름은 `valorant-frontend-dev`로 둔다. 백엔드/DB 서비스나
   `depends_on`을 추가하지 않는다.
4. 컨테이너 작업 디렉터리는 `/app`, 내부 개발 서버는 `0.0.0.0:3000`에서 실행한다.
   호스트에는 `127.0.0.1:${FRONTEND_PORT:-3000}:3000`으로 게시한다. 기본 포트 충돌
   시 `FRONTEND_PORT`로 변경하고, 기존 프로세스를 종료하지 않는다.
5. 소스는 bind mount하고 `/app/node_modules`와 `/app/.next`는 이 Compose 전용
   볼륨으로 격리한다. 호스트의 맥용 의존성과 컨테이너의 Linux 의존성, 개발/빌드
   캐시가 섞이지 않도록 한다. build/lint 검증과 dev 서버는 순차 실행한다.
6. 최초 실행·중지·포트 변경·의존성 갱신 명령을 README에 제공한다. 기존 호스트
   실행 방법도 유지하며, Mock/fallback 화면 확인과 실제 API·관리자 저장의
   실행 조건을 구분한다.

## Acceptance criteria

1. 호스트 Node/npm 설치 없이 Docker로 프론트를 실행할 수 있다.
2. 컨테이너의 `node --version`은 `v22.20.0`, `npm --version`은 `10.9.3`이다.
3. 기존 lockfile로 `npm ci`, 타입 검사, lint, build가 모두 통과한다.
4. 아래 Compose 명령으로 실행 시 홈·데모 프로필이 HTTP 200으로 응답하고
   브라우저에 표시된다. API·DB 없이 Mock 화면을 확인할 수 있다.
   공개 라인업 목록도 기존 API 실패 안내와 Mock fallback이 표시되는지 확인한다.
5. 호스트 소스의 일시적 문구 변경이 재빌드/컨테이너 재시작 없이 브라우저에
   반영되고, 복원 후 원래 문구로 돌아온다. 확인 방법·결과를 Result에 기록한다.
6. 반복 시작 시에도 정상 동작하며 의존성 파일과 `.next` 빌드 캐시는 전용 볼륨에
   저장된다. Docker가 호스트에 생성하는 빈 마운트 지점은 패키지·캐시와 구분해
   내용이 비어 있는지 확인한다.
7. 신규 의존성·제품 코드·백엔드·기존 DB 환경 변경이 없다. README 절차와 실제
   검증이 일치하고, 구현 종료 시 기존 사용자 컨테이너·데이터를 보존한다.

## Verification commands

구현 시 저장소 루트에서 실행한다. 아래 명령은 이 문서 작성 중 실행한 결과가
아니다. Docker daemon과 이미지/패키지 다운로드가 가능해야 한다. 첫 명령 전에
현재 Git 변경과 프론트 호스트 캐시 존재 여부를 기록한다.

먼저 다음 조회만 실행한다. 같은 프로젝트의 컨테이너나 볼륨이 이미 있으면 사용
상태와 이번 Task에서 재사용해도 되는지 확인하기 전까지 아래 build/run/up을
실행하지 않는다. 특히 실행 중인 개발 서버와 의존성·캐시 볼륨을 공유한 채로
`npm ci`나 build를 실행하지 않는다.

```bash
git status --short
docker version
docker compose version
docker ps -a --filter label=com.docker.compose.project=valorant-frontend-dev
docker volume ls --filter label=com.docker.compose.project=valorant-frontend-dev
```

기존 작업과 충돌하지 않음을 확인한 뒤 다음 검증을 순서대로 실행한다.

```bash
docker compose -f docker/compose.frontend.yml config -q
docker compose -f docker/compose.frontend.yml config --services
docker compose -f docker/compose.frontend.yml build frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node --version && npm --version && npm ci && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
docker compose -f docker/compose.frontend.yml ps
docker compose -f docker/compose.frontend.yml logs --tail=80 frontend
curl --fail --retry 12 --retry-connrefused --retry-delay 2 "http://localhost:${FRONTEND_PORT:-3000}/"
curl --fail --retry 12 --retry-connrefused --retry-delay 2 "http://localhost:${FRONTEND_PORT:-3000}/players/demo-puuid-seoul-duelist-001"
curl --fail --retry 12 --retry-connrefused --retry-delay 2 "http://localhost:${FRONTEND_PORT:-3000}/lineups"
```

- `config --services` 출력은 `frontend` 하나여야 한다.
- HTTP 확인은 설치가 끝나고 개발 서버 로그에 준비 완료가 표시된 뒤 수행한다.
  초기 설치가 진행 중인 상태의 연결 실패를 앱 검증 실패로 오판하지 않는다.
- 포트를 변경하면 `export FRONTEND_PORT=3001`처럼 해당 셸에 설정한 뒤 Compose와
  curl 모두 같은 값을 사용한다. 실제 사용 포트는 Result에 기록한다.
- 홈·프로필 브라우저 확인 및 위 Acceptance criteria 5의 일시적 문구 변경/복원
  검증을 수행한다. 확인할 수 없으면 미검증으로 기록하고 완료 처리하지 않는다.
- 이번 Task에서 시작한 프론트만 중지했다가 다시 시작해 반복 실행을 확인한다.

```bash
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml up -d frontend
curl --fail --retry 12 --retry-connrefused --retry-delay 2 "http://localhost:${FRONTEND_PORT:-3000}/"
git diff --check
git diff -- frontend/package.json frontend/package-lock.json frontend/.nvmrc frontend/next.config.js frontend/src backend
git status --short -- frontend/src frontend/package.json frontend/package-lock.json backend
```

마지막 diff/status는 시작 시점과 비교해 금지 경로의 신규 변경이 없어야 한다.
빌드 중 자동 생성 파일이 변경됐다면 기존 사용자 변경을 보존하며 해당 검증에서
생긴 변경만 복원한다. 검증용 컨테이너는 검증 후 중지하고 볼륨은 보존한다.

## Stop conditions

- 기존 고정 버전/lockfile로 설치·검증할 수 없어 패키지나 lockfile을 바꿔야 할 때.
- Docker 실행 또는 필요한 이미지/패키지 접근이 불가능하고 승인된 방법으로
  해결할 수 없을 때. 미실행을 성공으로 기록하지 않는다.
- 백엔드/DB·공통 CI·제품 코드의 영구 수정이 필요할 때.
- 기존 사용자 컨테이너·데이터를 변경하거나 삭제해야 할 때.
- 동일 원인의 검증 실패가 3회 반복될 때 `BLOCKED`로 보고한다.

## Result

2026-09-16 구현·검증 완료. 작업 브랜치: `codex/frontend-docker-dev`.

### 변경 파일 및 생성 구조

- `frontend/Dockerfile.dev`: 공식 `node:22.20.0-bookworm-slim` 기반,
  npm 10.9.3 고정·버전 확인, 잠금 파일 설치, 개발 서버 실행.
- `frontend/.dockerignore`: 호스트 의존성·빌드 캐시·로컬 환경 파일을 이미지에서 제외.
- `docker/compose.frontend.yml`: `frontend` 단일 서비스, 소스 bind mount,
  의존성/빌드 캐시 전용 named volume, localhost 포트, init 프로세스.
- `README.md`: 시작·중지·포트 변경·의존성 갱신·순차 검증 및 API fallback 안내.
- `docs/tasks/TASK-FE-001.md`: 최신 기준선 재검토 및 실제 검증 결과.
- `docs/PLAN.md`, `docs/frontend/PLAN.md`, `docs/PROGRESS.md`: 상태와 결과 요약.
- `.agent-reports/CURRENT.md`: 로컬 Codex 보고서(Git ignore 대상).

생성된 Docker 리소스:

- 이미지: `valorant-frontend-dev-frontend`.
- 컨테이너: `valorant-frontend-dev-frontend-1` (검증 후 중지).
- 볼륨: `valorant-frontend-dev_frontend_node_modules`,
  `valorant-frontend-dev_frontend_next` (보존).
- 네트워크: `valorant-frontend-dev_default`.

### 실행 명령과 결과

아래 명령은 저장소 루트에서 실행했다. `compose` 표기는
`docker compose -f docker/compose.frontend.yml`을 뜻한다.

| 검증 | 실제 결과 |
|------|-----------|
| `git status --short` 및 호스트 캐시 존재 확인 | 시작 시 clean, node_modules/.next/tsconfig.tsbuildinfo 없음 |
| `docker version`, `docker compose version` | Engine 29.4.3, Docker Desktop 4.73.0, Compose v5.1.3 (darwin/arm64 호스트) |
| 프로젝트 label로 `docker ps -a`, `docker volume ls` | 기존 프론트 전용 컨테이너·볼륨 없음. 실행 중인 다른 컨테이너도 없었음 |
| `compose config -q`, `compose config --services` | PASS, 서비스는 `frontend` 하나 |
| `compose build frontend` | PASS, 기존 package-lock.json으로 설치 성공 |
| `compose run --rm --no-deps frontend sh -c 'node --version && npm --version && npm ci && npx tsc --noEmit && npm run lint && npm run build'` | PASS, Node v22.20.0 / npm 10.9.3, 332개 패키지 설치, 타입·Lint·build 통과 |
| `compose up -d frontend`, `compose ps`, `compose logs --tail=80 frontend` | PASS, `127.0.0.1:3000` 게시 및 Ready 확인 |
| `curl --fail --retry 12 --retry-connrefused --retry-delay 2`로 홈·데모 프로필·`/lineups` 확인 | 모두 HTTP 200 (응답 본문은 /tmp 검증 파일로 저장) |
| 브라우저 홈·프로필 확인 | PASS, 홈 검색 화면과 SeoulDuelist#KR1의 Mock 프로필 표시 |
| 브라우저 `/lineups` 확인 | PASS, API 실패 안내와 데모 라인업 10개 표시 |
| 임시 홈 문구 변경·복원 | PASS, 열린 브라우저에서 새로고침·이미지 빌드·컨테이너 재시작 없이 양방향 자동 반영 |
| `compose exec -T frontend` 버전·디렉터리 크기, `docker inspect` 마운트 확인 | PASS, 의존성 455M / 빌드 캐시 67M은 전용 볼륨, 호스트 동명 폴더는 모두 비어 있음 |
| `compose stop frontend` → `compose up -d frontend` → 홈 HTTP 확인 | PASS, 재시작 시 npm ci 실행 후 Ready 및 HTTP 200 |
| 마지막 `compose stop frontend`, `compose ps -a`, 볼륨 조회 | 정상 중지(SIGTERM, 143), 전용 볼륨 2개 보존 |
| `git diff --check`, 금지 경로 diff/status | PASS, 제품 코드·잠금 파일·Next 설정·백엔드·기존 DB Compose 변경 없음 |

자동 반영 검증에서는 `frontend/src/app/page.tsx`의 제목을
`프론트 Docker 자동 반영 확인 (TASK-FE-001)`로 잠시 변경해 열린 탭에서 반영을
확인했다. 원래 제목으로 복원한 후 브라우저 반영 및 파일의 HEAD와 바이트 단위
동일함을 확인했다. 검증 중 생성된 ignored `tsconfig.tsbuildinfo`만 제거했다.

베이스 이미지 확인 digest:
`sha256:b21fe589dfbe5cc39365d0544b9be3f1f33f55f3c86c87a76ff65a02f8f5848e`.

### 남은 위험과 사람 검토

- 현재 고정 의존성의 `npm ci` audit 결과는 8건(7 high, 1 critical)이다.
  버전 변경은 이 Task 범위 밖이므로 자동 수정하지 않았으며 별도 대응이 필요하다.
- 컨테이너의 Git 정보 부재로 기존 UI 커밋 배지는 `unknown`이며, Next 설정의
  기존 fallback대로 동작한다. 실행 버전은 별도로 확인했다.
- 실제 백엔드 API·관리자 저장·운영 배포는 검증 범위가 아니다.
- Docker Desktop arm64에서 검증했다. 다른 호스트 환경은 이번에 실행하지 않았다.
- 컨테이너는 중지해 두었다. README 시작 명령으로 다시 실행할 수 있다.
- 사용자 요청에 따라 변경을 커밋·푸시하며, 통합 브랜치 병합은 사람 검토 후
  결정한다. 다음 화면 구현 Task는 별도 지정 후 시작한다.
