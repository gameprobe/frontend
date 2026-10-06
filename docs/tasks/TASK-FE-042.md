# TASK-FE-042 — 분리된 프론트 저장소 운영 Docker 이미지

## Status
IMPLEMENTED

## Request
사용자가 k3s 배포용 운영 Dockerfile을 지금 준비하도록 요청했다. 이 Task는 gameprobe/frontend 루트 기준이며, 복사된 모노레포 문서의 과거 경로와 구분한다.

## Scope
- 기존 Next.js 프론트를 multi-stage 기본 Next.js 운영 서버 이미지로 빌드한다. 기존 next/image 최적화를 추가 패키지 없이 유지하기 위해 next start를 사용한다.
- 현재 개발 Dockerfile과 Compose 흐름은 유지한다.
- 브라우저용 공개 백엔드 주소의 빌드 시점 주입과 ARM64 빌드/실행 방법을 문서화한다.
- k3s 배포, 레지스트리 푸시, CI/Argo CD 연결, 앱 기능 및 의존성 변경은 포함하지 않는다.

## Allowed changes
- Dockerfile
- README.md (운영 이미지 실행/검증 안내)
- docs/tasks/TASK-FE-042.md
- .agent-reports/HANDOFF.json
- .agent-reports/CURRENT.md (Codex Implementation 및 작업 메타데이터만)

## Read-only inputs
- package.json, package-lock.json, next.config.js, Dockerfile.dev, compose.yaml, .dockerignore, .gitignore, .env.example
- src/ 및 public/: 빌드 입력. 제품 코드 수정 없음.
- 기존 AGENTS.md, docs/PLAN.md, docs/PROGRESS.md

## Verification commands
- docker build --platform linux/arm64 --build-arg NEXT_PUBLIC_BACKEND_URL=https://api.example.invalid -t gameprobe-frontend:production-check .
- docker image inspect gameprobe-frontend:production-check (ARM64/비루트 사용자/실행 명령 확인)
- 임시 로컬 컨테이너를 실행하여 주요 페이지, public 자산, 생성된 JS/CSS 응답 확인.
- 별도 PORT로 실행 가능한지 확인하고 실제 브라우저 번들에 빌드 인수가 반영됐는지 확인.
- 실행 이미지에 docs/screenshots/에이전트 지침/소스/환경 비밀 파일이 포함되지 않는지 확인.
- 개발 Compose 구성 검증.

## Result

- Status: IMPLEMENTED
- Human Decision Required: NO
- 운영 Dockerfile 신규 작성. Next.js 기본 운영 서버, multi-stage 빌드, 운영 의존성 분리, 일반 사용자 실행, 공개 API 주소 빌드 인수 지원.
- `next.config.js`, 패키지 파일, 기존 개발 Dockerfile/Compose, 제품 소스는 변경하지 않음.
- 이미지: `sha256:3422a6e56adc0b55ff58da847b16f342e6b0c0489ba603290e3340bbfd17b21b`, linux/arm64, Docker inspect Size 257,094,355 bytes. 문서/QA 파일을 제외한 빌드 컨텍스트 약 69.36MB.

### Changed files
- `Dockerfile`
- `README.md`
- `docs/tasks/TASK-FE-042.md`
- `.agent-reports/HANDOFF.json` (Git 제외 로컬 인수인계)
- `.agent-reports/CURRENT.md` (Git 제외 로컬 보고서)

### Verification
- `docker build --platform linux/arm64 --build-arg NEXT_PUBLIC_BACKEND_URL=https://api.example.invalid -t gameprobe-frontend:production-check .`: 로컬 Docker credential helper 대기로 중단. 기존 로그인 설정 변경 없이 일회용 공개 레지스트리 설정으로 재실행.
- `docker --config /tmp/gameprobe-production-check.HyBBd5/docker-config --host unix:///Users/seochanjin/.docker/run/docker.sock build --platform linux/arm64 --build-arg NEXT_PUBLIC_BACKEND_URL=https://api.example.invalid -t gameprobe-frontend:production-check .`: PASS. 내부 `npm ci`, `npm run build`(타입/Lint 포함), `npm prune --omit=dev --ignore-scripts --no-audit --no-fund` 성공, 정적 페이지 15개 생성.
- `python3 /tmp/gameprobe-production-check.HyBBd5/verify.py`: PASS. `docker image inspect`, 일회용 `docker run`, HTTP 요청, `docker exec` 검사 후 두 테스트 컨테이너 모두 종료·제거.
  - Linux ARM64, Node v22.20.0, 실행 UID 1000, `.next` 쓰기 권한 확인.
  - 홈/Insights/라인업/스모크/관리자 체험/관리자/관리자 목록/계정 연결/정책 2개/데모 프로필 총 11개 페이지 HTTP 200.
  - JS/CSS 포함 생성 정적 자산 35개 HTTP 200.
  - 실제 PNG 이미지 1024×1024 → 64×64 최적화 성공. 원본 반환 우회가 아닌 변환 결과 크기 확인.
  - 빌드 인수 URL을 포함한 브라우저 번들 3개, 런타임 덮어쓰기 URL 포함 번들 0개.
  - `PORT=3100` 재실행 및 HTTP 200 확인.
  - docs/screenshots/AGENTS.md/CLAUDE.md/.agent-reports/.git/.env 계열/src/개발 Dockerfile/README/TypeScript/ESLint 부재 확인.
- `docker compose config --quiet`: PASS. 개발 환경 구성 유지.
- README 상대 링크 검사 및 Bash 예제 10개 `bash -n`: PASS.
- 독립 읽기 전용 Docker/README 검토: PASS.

### Remaining limitations
- k3s/레지스트리/실제 백엔드/CI/Argo CD 연결은 이번 작업에서 수행하지 않음. 실제 운영 API 주소로 이미지 빌드가 필요함.
- 검증 이미지는 공개 가짜 주소 `https://api.example.invalid`로 빌드했으며, `gameprobe-frontend:production-check` 태그로 로컬에만 존재함.
- 기존 Git 해시 확인 설정 때문에 Git이 없는 이미지에서는 시작/빌드 로그에 `git: not found`가 표시되고 UI 커밋 표시는 `unknown`임. 기존 동작을 유지했고 앱 실행/검증에는 영향 없음.
- 기존 Next.js 14의 Squoosh 이미지 최적화를 유지함. `sharp` 권장 경고는 존재하지만 실제 이미지 변환 PASS. 새 패키지 추가 및 기존 의존성 버전 변경 없음.
- 이 환경의 Docker 로그인 도우미가 정지해 최초 빌드를 중단했고, 임시 익명 설정에서는 legacy builder로 검증했음. 일반 Dockerfile 명령만 사용하며 Buildx/CI 환경은 별도 검증 대상임.
- 런타임 `.next` 쓰기 권한 필요. 읽기 전용 파일시스템을 적용할 경우 배포 매니페스트에서 별도 캐시 구성을 준비해야 함.

- 사용자 검토 대기. git add/commit/push 및 배포 없음.

## 초기 원격 게시 승인 — 2026-10-06

- 사용자가 현재 내용을 main에 바로 push하고, 같은 커밋으로 원격 dev 브랜치를 만들도록 명시적으로 승인했다.
- 이번 범위는 기존 검증 완료 파일의 초기 커밋·게시다. 앱 코드·Dockerfile·의존성·Actions·배포 구성은 추가 변경하지 않는다.
- 게시 전 점검: 기존 후보 2,697개, 100MiB 초과 파일 0개, 심볼릭 링크 0개, 실제 환경파일·로컬 보고서·실행 산출물 제외 확인. 독립 메타데이터 검토 PASS.
- 원격 heads 조회 결과 기존 main/dev 없음. 강제 푸시 없이 main/dev를 같은 커밋으로 생성하며 실제 원격 SHA 일치 결과는 로컬 CURRENT.md에 기록한다.
- 기존 ARM64 빌드/실행 검증은 위 결과를 사용한다. 검증 이후 제품 소스와 Dockerfile 변경 없음.
- 이미지 용량 기준 보완: 당시 257,094,355 bytes는 압축 콘텐츠이며 풀린 스냅샷 716,697,600 bytes를 합한 Docker 로컬 표시 용량은 973,791,955 bytes(약 974MB)다. 이미지 용량 축소는 이번 게시에 포함하지 않는다.
