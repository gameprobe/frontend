# TASK-INFRA-002 — 프론트 이미지 갱신 PR과 Argo CD 자동 배포 연결

## Status
IMPLEMENTED

## Request and scope
사용자는 첫 이미지 게시와 첫 프론트 배포를 마쳤고, Argo CD 자동 Sync 및 deploy 이미지 버전 갱신 PR 생성까지 이번 작업으로 연결하도록 명시했다. 하나의 인프라 Task를 frontend/deploy 두 저장소에 나누어 구현한다. 사용자가 deploy 설정 게시·기존 Application 적용과 DEPLOY_REPO_TOKEN 등록을 진행했다. 이후 명시적 요청에 따라 에이전트가 frontend 변경을 커밋·푸시하고 dev 대상 PR을 제출한다.

## Requirements
- frontend/main 이미지 게시 성공 후 별도 job이 gameprobe/deploy의 main을 기준으로 이미지 갱신 PR을 생성한다.
- 배포 PR은 고정 작업 브랜치를 사용하여 미병합 PR을 갱신한다. 이미 동일한 상태이면 중복 PR을 만들지 않는다.
- 이미지 digest와 원본 프론트 main 커밋 주석만 수정한다. 이전 main 커밋 실행의 재시도는 배포 PR 갱신을 건너뛴다.
- 토큰은 frontend Repository secret `DEPLOY_REPO_TOKEN`을 사용한다. gameprobe 조직의 deploy 저장소 Contents/Pull requests Read and write만 필요하며 기존 Argo CD 읽기 토큰은 유지한다.
- frontend/dev 및 PR에서는 이미지를 게시하지 않는다. 기존 ARM64 빌드, SHA 태그, Docker Hub 인증, GITHUB_TOKEN contents: read를 유지한다.
- deploy Application에 automated.enabled: true를 설정한다. prune/selfHeal은 false, CreateNamespace와 앱 이름·소스·목적지는 유지한다.
- deploy PR 병합 후 자동 Sync하며 직접 main push나 자동 PR merge를 워크플로에 추가하지 않는다.
- argocd/ 등록 파일은 앱 추적 경로 밖이므로 사용자가 Git push 후 kubectl apply로 기존 Application을 갱신해야 한다.
- 후속 사용자 요청으로 frontend 변경의 git add/commit/push와 dev 대상 PR 제출을 수행한다. PR 병합, main 직접 게시, remote workflow 실행, 클러스터 접속·변경, 토큰 생성/조회/등록은 수행하지 않는다.

## Allowed changes (frontend)
- .github/workflows/docker-publish.yml
- .github/scripts/update-deploy-image.py
- README.md
- docs/tasks/TASK-INFRA-002.md
- .agent-reports/HANDOFF.json
- .agent-reports/CURRENT.md (Codex Implementation 및 작업 메타데이터)

## Read-only inputs
AGENTS.md, docs/PLAN.md, docs/PROGRESS.md, docs/tasks/TASK-FE-043.md. 이전 개발 계획의 제품 Task를 시작하거나 수정하지 않는다.

## Verification commands
- actionlint: 워크플로 YAML/표현식/액션 입력 및 최소 권한 확인
- 인라인 Bash 및 README bash 블록 구문 검사
- Python helper fixture 검사: 대상 digest/주석 변경, 다른 이미지·설정 보존, 재실행, 잘못된 값/중복/누락 구조 거절
- workflow Secret 누락/이전 main 커밋/성공·실패 job 연결 확인 및 임시 격리 실행
- README 로컬 링크, git diff --check와 허용 파일 범위 확인
- 독립 읽기 전용 검토

## Result
- Status: IMPLEMENTED — 로컬 구현·검증 완료.
- Human Decision Required: NO — 사용자 승인 범위로 구현했다. 원격 활성화는 사용자가 진행한다.
- 구현: frontend main 이미지 게시 성공 후 deploy digest/원본 커밋 갱신 PR을 생성·재사용하는 job과 helper, deploy 자동 Sync 설정 및 단계별 안내를 준비했다. 한 개의 열린 배포 PR을 최신 이미지로 갱신하며 사람이 병합한다.
- 실제 변경 파일 전체 (이 저장소):
  - `.github/workflows/docker-publish.yml`
  - `.github/scripts/update-deploy-image.py`
  - `README.md`
  - `docs/tasks/TASK-INFRA-002.md`
  - `.agent-reports/HANDOFF.json (Git 제외)`
  - `.agent-reports/CURRENT.md (Git 제외)`

### 실행한 명령 및 검증 결과
- `/tmp/gameprobe-workflow-043/actionlint -shellcheck= -pyflakes= .github/workflows/docker-publish.yml` (frontend): PASS. YAML/표현식/액션 입력 검사. ShellCheck/Pyflakes 연동은 사용하지 않고 Bash 구문을 별도로 검사했다.
- `python3 /tmp/gameprobe-infra-002/verify.py`: PASS.
  - helper fixture: 대상 digest/커밋 주석만 변경, 다른 이미지·필드 보존, 동일 값 재실행 no-op, 잘못된 digest/SHA 및 10개 누락·중복·예상 밖 구조 거절, CLI 실패 시 파일 보존.
  - workflow: main 전용 게시, 성공한 publish의 digest 출력/후속 job 연결, 고정 PR 브랜치·배포 main 대상·변경 경로 제한·최소 권한·액션 SHA 고정 확인.
  - 격리 Bash 실행: 가짜 gh로 현재 main/지난 커밋/API 실패, 가짜 토큰의 누락/정상 및 토큰 값 비출력, PR/no-op Summary 분기 통과. 실제 네트워크·자격증명 없이 검증했다.
  - Application YAML: `automated` 추가 외 HEAD와 전체 객체 동일; enabled true, prune/selfHeal false 확인.
  - README Bash 구문: frontend 10개/deploy 5개 PASS. 로컬 링크 frontend 12개/deploy 2개 존재 확인.
  - 양쪽 저장소 `git diff --check`, 신규 파일 공백 검사 및 허용 파일 범위 PASS.
- 독립 읽기 전용 검토: PASS, 차단 결함 없음. README의 동일 이미지 표현을 digest와 소스 커밋 모두 동일한 경우로 명확히 했다.

### 남은 문제 및 주의사항
- 사용자는 `DEPLOY_REPO_TOKEN` 등록을 완료했다고 보고했다. 실제 토큰 접근 및 자동 이미지 갱신 PR 생성·갱신·병합 후 배포는 frontend/main 반영 후 첫 실행으로 검증해야 한다.
- 사용자가 공유한 화면에서 deploy/main의 `1c4fb76` 게시, 기존 Application 적용과 `automated.enabled` 조회 결과 `true`를 확인했다. 에이전트가 직접 클러스터에 접속하여 재검증하지는 않았다.
- frontend 변경은 작업 브랜치 → dev → main 순서로 반영한다. dev 대상 PR 생성·병합 시에는 이미지 게시 workflow가 실행되지 않으며, main 반영 시 첫 자동화 실행을 확인한다. 기존 Argo 읽기 전용 토큰과 Docker Hub 토큰은 유지한다.
- 게시 성공 후 deploy의 PR에서 digest/원본 커밋을 확인하고 사람이 병합한다. 이미지 업로드만으로 새 버전이 배포되지는 않는다.
- helper는 현재 Kustomize images 블록 형식을 엄격히 검사한다. 해당 형식을 바꿀 때 helper도 함께 검토해야 한다.
- 최초 구현 단계는 로컬 검증까지 완료했다. 후속 사용자 요청으로 frontend 커밋·푸시·dev 대상 PR 제출을 진행하며 결과 URL과 커밋은 로컬 Agent Report에 기록한다. PR 병합·원격 workflow/이미지 게시·클러스터 접속·토큰 취급은 이 제출 범위에 포함하지 않는다.
