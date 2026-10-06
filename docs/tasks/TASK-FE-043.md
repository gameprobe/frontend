# TASK-FE-043 — 프론트 Docker Hub 자동 업로드 워크플로

## Status
IMPLEMENTED

## Request
사용자가 공개 Docker Hub 저장소 `seocj/gameprobe-frontend`를 만들고 GitHub 프론트 저장소에
`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` 등록을 완료한 뒤 워크플로 작성을 요청했다.
작업 대상은 분리된 `gameprobe/frontend` 저장소다. NewsLab 워크플로는 읽기 전용 참고 자료다.

## Scope
- main push와 main을 선택한 수동 실행에서 기존 운영 Dockerfile로 ARM64 이미지를 빌드·업로드한다.
- 등록한 Secret 참조와 선택적 공개 백엔드 URL Variable을 사용한다.
- 커밋별 태그와 고정 배포에 사용할 이미지 digest를 제공한다.
- 설정 방법, 실행 확인 방법, dev/main 흐름과 deploy 후속 작업을 README에 설명한다.
- 후속 사용자 요청으로 검증 완료 변경의 커밋·푸시와 `dev` 대상 PR 제출까지 포함한다. PR 병합·실제 이미지 업로드·k3s·Argo CD 연결은 별도 진행한다.

## Allowed changes
- .github/workflows/docker-publish.yml
- README.md
- docs/tasks/TASK-FE-043.md
- .agent-reports/HANDOFF.json
- .agent-reports/CURRENT.md (Codex Implementation 및 작업 메타데이터)

## Read-only inputs
- AGENTS.md, docs/PLAN.md, docs/PROGRESS.md, docs/tasks/TASK-FE-042.md
- Dockerfile, Dockerfile.dev, .dockerignore, .gitignore, compose.yaml, .env.example
- package.json, package-lock.json, next.config.js
- NewsLab news-lab-web/.github/workflows/docker-build.yml 및 해당 AGENTS.md

## Verification commands
- actionlint: GitHub Actions YAML, expressions, runner 및 step 설정 검사.
- 워크플로 인라인 Bash 구문 검사 및 Secret 사전 검사 정상/누락 조건 확인. 실제 Secret은 사용하지 않는다.
- 트리거·분기 조건·플랫폼·태그·Secret 참조·빌드 인수·권한·배포 제외 확인.
- README 로컬 링크 확인, git diff --check, 허용 변경 파일 목록 확인.
- 독립 읽기 전용 워크플로 검토.
- 기존 Dockerfile/제품 코드는 변경하지 않으므로 TASK-FE-042의 ARM64 빌드·실행 검증을 재사용한다.
- 실제 GitHub 실행·Docker Hub 로그인/업로드 성공은 main 반영 후 확인해야 하며 로컬 검사로 성공을 주장하지 않는다.

## Result

- Status: IMPLEMENTED
- Human Decision Required: NO
- 구현 요약: `main` push와 main 전용 수동 실행에서 기존 운영 Dockerfile로 ARM64 이미지를 만들어 `seocj/gameprobe-frontend`에 업로드하는 워크플로를 작성했다. 두 Secret, 선택적 공개 API 주소 Variable, 빌드 캐시, SHA 태그와 digest Summary를 구성했다. 새 운영 의존성·앱·Dockerfile 변경 없음.
- 실제 변경 파일 전체:
- `.github/workflows/docker-publish.yml`
- `README.md`
- `docs/tasks/TASK-FE-043.md`
- `.agent-reports/HANDOFF.json` (Git 제외 로컬 보고서)
- `.agent-reports/CURRENT.md` (Git 제외 로컬 보고서)

### 실제 검증 명령과 결과
- `/tmp/gameprobe-workflow-043/actionlint -shellcheck= -pyflakes= .github/workflows/docker-publish.yml`: PASS. 공식 actionlint v1.7.12를 임시 폴더에 다운로드하고 공식 SHA-256으로 확인. YAML/표현식/러너/액션 입력 검사 통과. ShellCheck/Pyflakes는 설치되지 않아 연동하지 않았으며 인라인 Bash는 별도로 검사했다.
- `python3 /tmp/gameprobe-workflow-043/verify.py`: PASS.
  - main push 필터와 main 전용 수동 실행 조건, ARM64, 최소 GitHub 권한, 고정 액션 SHA, 정확한 Secret 참조, 선택 공개 빌드 인수, 배포 작업 없음 확인.
  - Bash 블록 2개 `bash -n` 통과.
  - 가짜 값으로 자격증명 사전 검사 4조건: 정상 0, 사용자명/토큰/둘 다 누락 시 1; 토큰 출력 없음.
  - 가짜 digest로 Summary를 실행하여 복사 가능한 태그·배포 참조 출력 확인.
  - README 로컬 링크 12개, 정확한 변경 파일 범위 및 새 파일 포함 공백 검사 통과.
  - 기존 Dockerfile·개발 환경·앱 소스·자산·의존성이 HEAD와 동일함을 확인.
- `git diff --check`: PASS. 새 파일도 `git diff --no-index --check`로 별도 확인.
- 독립 읽기 전용 워크플로/README/Dockerfile 연동 검토: PASS, 수정 필요 사항 없음.
- 초기 YAML 생성 중 Summary의 줄바꿈 이스케이프 오류를 수정한 후 검증을 통과했다. 임시 검증기의 `git diff --no-index` 변경 감지 종료 코드 1 해석도 보완했다.

### 남은 문제 및 주의사항
- 실제 GitHub Actions 실행, Docker Hub 로그인 및 업로드는 아직 수행하지 않았다. 등록된 Secret의 유효성은 main 반영 후 첫 실행에서 확인해야 한다.
- 선택 Variable `NEXT_PUBLIC_BACKEND_URL` 미등록 시 빈 값으로 빌드한다. 현재 프론트의 기존 예시 화면 범위로 동작하며 실제 API 연결을 검증한 것은 아니다.
- SHA 태그는 같은 커밋 재실행 시 갱신될 수 있다. 고정 배포에는 Summary의 이미지 digest 참조를 사용한다.
- 공개 이미지의 실행 코드·정적 자산은 내려받을 수 있다. 비밀 파일을 추가하거나 토큰을 빌드 인수로 전달하지 않았다.
- GitHub Actions의 실제 러너·Buildx 빌드는 미검증. Dockerfile은 변경하지 않았으며 TASK-FE-042의 ARM64 빌드/실행 검증을 재사용했다.
- 사용자 후속 승인에 따라 `codex/frontend-dockerhub-workflow → dev` PR을 제출한다. `dev` 병합에서는 게시되지 않고, 이후 `dev → main` 병합 시 첫 이미지 게시가 실행된다. PR 병합·이미지 게시·deploy 변경·k3s·Argo CD 작업은 이번 제출 범위에 포함하지 않는다.


### dev 대상 PR 제출 전 확인 (2026-10-06)
- 원격 `dev`와 `main`의 기준 커밋은 모두 `54eace3`; 분기 이후 다른 원격 변경 없음.
- 독립 PR 사전 검토 PASS: main 전용 트리거와 변경 범위 확인. Vite 전환·Nginx 추가 없음.
- 사용자 명시 요청으로 커밋·푸시 및 `dev` 대상 PR 생성 승인됨. 제출 결과는 로컬 Agent Report에 기록한다.
