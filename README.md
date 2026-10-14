# GameProbe Frontend

GameProbe 조직의 **Vite + React + TypeScript** 프론트 저장소입니다.
`98jh-shin/valorant-platform` dev `259d880`의 `frontend/`를 저장소 루트로 이관했습니다.
팀원들의 기존 Git 이력, Docker Hub ARM64 게시 및 deploy 이미지 갱신 PR 자동화는 유지합니다.
이전 Next.js 코드는 이관 전 dev `83c9023`에서 확인할 수 있습니다.

현재 화면은 예시 데이터입니다. 실제 Riot 조회·로그인·기능 API 저장은 연결되지 않았습니다.
별도 [gameprobe/backend](https://github.com/gameprobe/backend)의 FastAPI는 현재
`GET /health` 연결 확인 API를 제공합니다. 화면이 보이는 것과 실제 API 연결은 별도로 검증합니다.

## 화면과 구조

홈 `/`, 검색 `/search`, 프로필 `/players/:riotId`, 경기 `/matches/:matchId`,
랭킹 `/ranking`, 메타 `/meta`, 게임 정보 `/game-info`, 마이페이지 `/my`,
라인업 `/lineups`, 스모크 `/smokes`를 제공합니다.
이전 Next.js 관리자·API·정책 경로와 새 Vite의 기능 범위는 같지 않습니다.

- `src/`: 화면·라우팅·예시 데이터·백엔드 클라이언트
- `public/`: 정적 자산
- `vite.config.ts`, `index.html`: Vite 실행 설정
- `compose.yaml`, `Dockerfile.dev`: 로컬 개발
- `Dockerfile`, `scripts/serve.mjs`: 빌드 결과 정적 제공 (Node 내장 기능, 추가 패키지 없음)
- `.github/`: 팀의 이미지 게시와 deploy PR 자동화
- `vercel.json`: Vite 빌드와 SPA 새로고침 설정. Vercel 프로젝트·도메인 연결은 별도 작업

Node `22.20.0`, npm `10.9.3`을 사용합니다. 정확한 버전은 `.nvmrc`와 lockfile이 기준입니다.
아래 명령은 모두 **이 프론트 저장소 루트**에서 실행합니다.

## 로컬 실행과 중지

Docker Desktop을 실행한 뒤 환경파일을 준비합니다. 기존 파일을 덮어쓰지 않습니다.

```bash
test -e .env.local || cp .env.example .env.local
chmod 600 .env.local
```

`.env.local`에 공개 주소만 설정합니다. 비밀번호·토큰은 넣지 않습니다.

```dotenv
VITE_BACKEND_URL=http://localhost:8000
```

별도 백엔드 저장소 루트에서 README에 따라 `.env`를 준비합니다.
로컬은 `APP_ENV=local`, `MONGODB_URI=`이며 운영 DB를 연결하지 않습니다.
그 폴더에서 `docker compose up --build -d`를 실행한 뒤 프론트 폴더에서 실행합니다.

```bash
docker compose up --build -d
docker compose logs -f frontend
```

접속: [http://localhost:3000](http://localhost:3000).
백엔드 응답: [http://localhost:8000/health](http://localhost:8000/health).
프론트는 호스트의 127.0.0.1에만 공개하며, 의존성은 전용 Docker 볼륨에 저장합니다.
현재 백엔드 로컬 CORS는 localhost/127.0.0.1의 3000번만 허용하므로 연결 확인에는 기본 포트를 사용합니다.
화면만 확인할 때는 `FRONTEND_PORT=3001 docker compose up --build -d`로 변경할 수 있습니다.

```bash
# 프론트 폴더에서 중지/재시작 (백엔드는 그 저장소에서 별도 실행)
docker compose stop
docker compose up -d
# 환경변수 변경 후
docker compose restart frontend
```

`docker compose down`은 컨테이너를 제거하고 의존성 볼륨을 보존합니다.
호스트에서 실행하려면 지정 Node/npm 버전으로 `npm ci`, `npm run dev -- --host 127.0.0.1`을 사용합니다.

## 실제 백엔드 연결 확인

로컬 프론트의 브라우저 개발자 도구 Console에서 실행합니다.

```js
const { backendApi } = await import('/src/lib/backend-api.ts');
await backendApi.getHealth(AbortSignal.timeout(10_000));
```

브라우저 Network에서 `http://localhost:8000/health`의 200 응답과 `{status: "UP"}`를 확인합니다.
페이지는 현재 자동 health 호출을 하지 않습니다. 이 검사는 실제 클라이언트·설정·CORS의 연결 검사이며,
전적·라인업 데이터 연결 완료를 의미하지 않습니다. 자세한 내용은 [연결 안내](docs/frontend/BACKEND-CONNECTION.md)를 따릅니다.

## 검증

```bash
docker compose exec -T frontend npm run typecheck
docker compose exec -T frontend npm run lint
docker compose exec -T frontend npm run test:backend
docker compose exec -T frontend npm run build
docker compose exec -T frontend node --test scripts/serve.test.mjs
```

[이관 Task](docs/tasks/TASK-FE-055.md), [화면 비교](docs/visual-qa/TASK-FE-055.md).
과거 docs의 Next.js·모노레포 경로는 당시 작업 기록이며 현재 실행 기준은 이 README입니다.

## Docker 빌드 호환성 (배포 실행과 별개)

기존 Node 이미지·비특권 `node` 사용자·3000 포트를 유지합니다.
빌드 결과 `dist/`와 정적 서버만 최종 이미지에 복사합니다. 개발 의존성·소스·환경파일은 포함하지 않습니다.
SPA 경로를 직접 열거나 새로고침할 수 있으며, 없는 정적 자산/API 경로는 404입니다.
다음 명령은 이미지의 **로컬 확인만** 수행하며 어디에도 게시하지 않습니다.

```bash
docker build --platform linux/arm64 -t gameprobe-frontend:local-check .
docker run --rm --init -p 127.0.0.1:3001:3000 gameprobe-frontend:local-check
```

API 주소는 공개 빌드 인수 `--build-arg VITE_BACKEND_URL=<공개 API origin>`으로 전달합니다.
브라우저 번들에 포함되므로 주소 변경 시 재빌드가 필요합니다. 컨테이너 실행 환경변수만 변경해서는 반영되지 않습니다.
백엔드가 허용하는 프론트 출처도 확인해야 합니다. 토큰·DB URI는 빌드 인수로 넣지 않습니다.

아래 팀 자동화는 유지됩니다. **dev 반영만으로 운영 이미지 게시·운영 배포를 실행하지 않습니다.**
Vercel의 조직 저장소 연결·Production Branch·환경변수·도메인 검토는 이번 이관에 포함하지 않습니다.

### GitHub Actions로 Docker Hub에 업로드

[Publish frontend image](.github/workflows/docker-publish.yml) 워크플로는 `main`에 push되거나
PR이 병합되면 Vite 대응 Dockerfile로 `linux/arm64` 이미지를 빌드하고
공개 Docker Hub 저장소 `seocj/gameprobe-frontend`에 업로드합니다.
`dev` push와 PR 생성만으로는 이 워크플로를 실행하지 않습니다.

GitHub **frontend 저장소 → Settings → Secrets and variables → Actions → Secrets**에
다음 Repository secrets를 등록합니다.

| 이름 | 값 |
|------|----|
| `DOCKERHUB_USERNAME` | `seocj` |
| `DOCKERHUB_TOKEN` | Docker Hub의 Read & Write 권한 토큰 |
| `DEPLOY_REPO_TOKEN` | `gameprobe/deploy` 수정·PR 생성용 GitHub fine-grained PAT. 아래 설정 참고 |

실제 백엔드를 연결할 때는 같은 화면의 **Variables → New repository variable**에서
`VITE_BACKEND_URL`을 브라우저에서 접근 가능한 공개 API 주소로 등록합니다.
기존 `NEXT_PUBLIC_BACKEND_URL` Variable은 호환 입력으로 유지하며 새 변수가 우선합니다. 아직 백엔드가 없으면 생략합니다. 빈 값으로 빌드되며 위 표의 예시 화면 범위로 동작합니다.
Secret과 Variable은 조직 공통 설정이 아닌 이 프론트 저장소에 등록합니다.
Docker Hub 토큰은 로그인 단계에서 사용하고, `DEPLOY_REPO_TOKEN`은 이미지 게시 이후 별도 PR 작업에서만 사용합니다. 토큰은 이미지 빌드 인수로 전달하지 않습니다.

워크플로 파일이 `main`에 반영되면 첫 자동 실행이 시작됩니다.
GitHub **Actions → Publish frontend image**에서 실행 결과를 확인합니다.
다시 빌드하려면 **Run workflow → Branch: main → Run workflow**를 선택합니다.
다른 브랜치를 선택한 수동 실행은 업로드 작업을 건너뜁니다.
백엔드 URL Variable을 변경했을 때도 `main`으로 새 수동 실행을 시작해야 반영됩니다.

성공하면 Docker Hub의 **Tags**와 GitHub 실행 **Summary**에서 결과를 확인할 수 있습니다.

- 태그: `seocj/gameprobe-frontend:sha-<전체 커밋 SHA>`
- 고정 배포 참조: `seocj/gameprobe-frontend@sha256:<이미지 digest>`

같은 커밋을 재빌드하면 SHA 태그가 새 이미지로 갱신될 수 있습니다.
배포할 이미지를 정확히 고정하려면 Summary의 `Deployment reference`를 사용합니다.
이 워크플로는 `main` 또는 `latest` 이미지 태그를 만들지 않습니다.
소스 저장소의 빌드 메타데이터를 공개 이미지에 첨부하지 않도록 provenance/SBOM 생성을 끕니다.
이미지에 포함된 실행 코드와 정적 자산은 공개 저장소에서 내려받을 수 있습니다.

등록한 Secret의 유효성과 실제 업로드는 GitHub에서 첫 실행이 성공해야 확인됩니다.
GitHub Actions 빌드는 비공개 저장소 플랜의 Actions 사용량에 포함됩니다.
참고: [GitHub Docker 업로드 안내](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images),
[비공개 저장소 ARM64 러너 지원](https://github.blog/changelog/2026-01-29-arm64-standard-runners-are-now-available-in-private-repositories/).

### deploy 이미지 갱신 PR과 k3s 배포

이미지 게시가 성공하면 후속 job이 `gameprobe/deploy`의 `main`을 가져와
`apps/frontend/kustomization.yaml`의 이미지 **digest**와 원본 프론트 커밋 주석을 갱신합니다.
고정 브랜치 `codex/frontend-image-update`에서 `deploy/main`을 대상으로 PR을 만들며,
아직 열려 있는 PR이 있으면 최신 이미지로 갱신합니다. 이미 digest와 소스 커밋이 모두 동일하면 PR을 만들지 않습니다.
따라서 배포 PR이 열려 있는 동안 새 이미지가 게시되면 해당 PR의 배포 대상도 바뀝니다.

```text
frontend 기능 브랜치 → dev → main 병합
  → Docker Hub 이미지 게시
  → deploy 이미지 갱신 PR 생성 또는 갱신
  → 사람이 deploy PR 확인·병합
  → Argo CD 자동 Sync → k3s 프론트 갱신
```

Argo CD는 `deploy`의 Git 변경을 감지합니다. Docker Hub 업로드만으로 배포되지는 않습니다.
워크플로는 `deploy/main`에 직접 push하거나 PR을 자동 병합하지 않습니다.
이미 지난 frontend/main 커밋의 실행을 재시도하면 PR 갱신을 건너뜁니다.

#### 처음 한 번 필요한 GitHub 인증 설정

Argo CD에 등록한 **읽기 전용 토큰은 그대로 유지**합니다. PR 작성용 토큰을 별도로 만듭니다.

1. GitHub 개인 프로필 → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**으로 이동합니다.
2. 이름은 예를 들어 `gameprobe-frontend-deploy-pr`로 정합니다. 만료일은 관리 가능한 기간으로 선택하며 조직 정책이 허용하면 `No expiration`도 선택할 수 있습니다. 만료되면 새 토큰으로 Secret을 갱신해야 합니다.
3. **Resource owner: gameprobe**, **Repository access: Only select repositories → deploy**를 선택합니다.
4. **Repository permissions**에서 **Contents: Read and write**, **Pull requests: Read and write**를 지정합니다. Metadata 읽기 권한은 자동 포함됩니다. 조직 승인 대기 상태라면 승인을 먼저 완료합니다.
5. 생성한 값을 **gameprobe/frontend → Settings → Secrets and variables → Actions → New repository secret**에 이름 `DEPLOY_REPO_TOKEN`으로 등록합니다.

기본 `GITHUB_TOKEN`은 frontend 저장소 범위이므로 다른 비공개 저장소인 deploy에 PR을 만들 수 없습니다.
이 워크플로의 기본 권한은 계속 `contents: read`이며, deploy 토큰에 frontend 접근 권한은 필요하지 않습니다.
토큰 값을 소스 파일이나 PR 본문에 넣지 않습니다.

#### 반영과 실행 확인

1. 위 Secret을 등록하고 이 저장소의 변경을 `dev`를 거쳐 `main`에 병합합니다.
2. **Actions → Publish frontend image**에서 `publish`와 `Propose deployment image update` 두 job의 결과를 확인합니다.
3. 실행 Summary에 표시된 배포 PR에서 digest와 소스 커밋을 확인한 뒤 `deploy/main`으로 병합합니다.
4. Argo CD `gameprobe-frontend`에서 해당 deploy 커밋이 `Synced`이고 앱이 `Healthy`인지 확인합니다.

자동 Sync 활성화는 [deploy README](https://github.com/gameprobe/deploy#readme)의 순서로 먼저 진행합니다.
`argocd/frontend-application.yaml`은 앱이 추적하는 `apps/frontend` 밖에 있으므로,
등록 YAML의 자동 Sync 설정 변경은 Git push에 이어 기존 Application에 `kubectl apply`로 반영해야 합니다.
자동 Sync 설정을 반영하기 전에는 기존처럼 수동 Sync가 필요합니다.

이미지는 올라갔는데 PR job만 실패했다면 인증·권한 등을 수정한 뒤 해당 실행의 **Re-run failed jobs**를 선택합니다.
이미 성공한 이미지 빌드까지 다시 실행할 필요는 없습니다. 이후 main이 바뀌었다면 이전 실행은 건너뛰므로 최신 main의 실행 결과를 확인합니다.
이 안내의 로컬 검증만으로는 실제 토큰 접근, GitHub PR 생성 또는 클러스터 배포까지 확인된 것이 아닙니다.

k3s 매니페스트는 `gameprobe/deploy`, 로컬 개발용 Compose와 Dockerfile은 이 저장소에서 관리합니다.
참고: [GitHub PAT 설정](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens),
[배포 PR 액션](https://github.com/peter-evans/create-pull-request),
[Argo CD 자동 Sync](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/).

## 라이선스

추후 결정합니다.

이 프로젝트는 Riot Games의 공식 프로젝트가 아닙니다.
