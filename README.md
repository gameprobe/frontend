# GameProbe Frontend

VALORANT 플레이어를 위한 GameProbe의 프론트엔드 저장소입니다.
전적·경기 상세, 라인업·스모크 탐색, 분석 예시와 관리자 화면을 제공합니다.

기존 모노레포의 `dev`에서 프론트를 분리했으며, 현재 구현은 **Next.js + React + TypeScript**입니다.
이 저장소는 프론트 코드, 로컬 개발 환경과 운영용 Docker 이미지를 관리합니다.

## 현재 기능과 데이터 범위

백엔드 없이도 아래 예시 화면을 실행할 수 있습니다. 실제 Riot 전적 조회와 계정 인증은 아직 연결되지 않았습니다.

| 화면 | 경로 | 현재 동작 |
|------|------|-----------|
| 홈·플레이어 검색 | `/` | 검색 시 데모 프로필로 이동. 실제 플레이어 검색은 미연동 |
| 플레이어 프로필 | `/players/demo-puuid-seoul-duelist-001` | 로컬 예시 데이터로 전적·최근 경기 표시 |
| 경기 상세 | `/matches/[matchId]` | 예시 경기의 상세 정보 표시 |
| 라인업 | `/lineups` | 공개 API 연결 시 자료 조회. API 미설정·실패 시 로컬 예시 표시 |
| 라인업 상세 | `/lineups/[id]` | 로컬 예시 상세는 백엔드 없이 확인 가능. 실제 자료는 API 필요 |
| 스모크 | `/smokes` | 로컬 예시 기반 맵·요원 필터와 지도 탐색 |
| Insights | `/insights` | 분석 리포트 예시. 실제 학습 모델과 데이터셋은 미연동 |
| 관리자 체험 | `/admin/preview` | 예시 코드 `DEMO1234`로 목록·등록·편집 체험. 메모리에만 저장되어 새로고침 시 초기화 |
| 실제 관리자 | `/admin`, `/admin/lineups` | 로그인·조회·등록·수정·삭제에 백엔드 API 필요 |
| 계정 연결 안내 | `/connect` | 계정 연결 및 공개 동의 과정의 데모 |
| 정책 안내 | `/privacy`, `/terms` | 개인정보처리방침·이용약관 |

`[matchId]`, `[id]`는 실제 항목 ID가 들어가는 동적 경로입니다.
데모 프로필이나 라인업 목록에서 항목을 선택하면 해당 상세 화면으로 이동합니다.

## 기술 스택

| 항목 | 버전 |
|------|------|
| Next.js | 14.2.35 |
| React | 18.3.1 |
| TypeScript | 5.7.3 |
| Node.js | 22.20.0 |
| npm | 10.9.3 |

패키지 버전은 [package.json](package.json)과 [package-lock.json](package-lock.json)을 기준으로 합니다.
Node 버전은 [.nvmrc](.nvmrc), Docker 빌드의 Node/npm 버전은 [Dockerfile.dev](Dockerfile.dev)와 [Dockerfile](Dockerfile)에 지정되어 있습니다.

## 프로젝트 구조

```text
frontend/
├── public/              # 맵·요원 이미지 등 정적 자산
├── src/
│   ├── app/             # 페이지와 라우팅
│   ├── components/      # UI 컴포넌트
│   ├── features/        # 기능별 화면·상태·데이터 처리
│   └── lib/             # API 호출·공통 데이터와 유틸리티
├── .env.example         # 선택 환경변수 안내
├── .gitignore
├── .dockerignore
├── .nvmrc
├── compose.yaml         # 프론트 단독 로컬 개발 환경
├── Dockerfile.dev       # 개발 서버와 코드 자동 반영
├── Dockerfile           # 운영 빌드와 운영 서버
├── next.config.js
├── package.json
├── package-lock.json
└── README.md
```

아래 명령은 모두 **이 저장소의 최상위 폴더**에서 실행합니다.

## Docker로 개발하기

### 준비

- Docker Desktop 또는 Docker Engine과 `docker compose`를 사용할 수 있는 환경
- 실행 중인 Docker 엔진
- 최초 이미지·패키지 다운로드를 위한 인터넷 연결

호스트의 Node/npm 설치나 백엔드·DB 실행은 예시 화면 확인에 필요하지 않습니다.
[compose.yaml](compose.yaml)은 프론트 개발 서버 하나만 실행합니다.

### 시작과 로그 확인

```bash
docker compose up -d --build
docker compose logs -f frontend
```

의존성 설치 후 로그에 준비 완료가 표시되면 [http://localhost:3001](http://localhost:3001)에 접속합니다.
로그 보기에서 `Ctrl+C`를 눌러도 서버는 계속 실행됩니다.

소스 폴더를 컨테이너에 연결하므로 코드 변경이 화면에 자동 반영됩니다.
`node_modules`와 `.next`는 이 Compose 프로젝트 전용 볼륨에 저장하여 호스트 파일과 분리합니다.
컨테이너 내부 포트는 `3000`, 호스트 기본 포트는 `3001`이며 로컬 컴퓨터에서만 접속할 수 있습니다.

### 중지와 재시작

```bash
# 컨테이너를 중지하고 제거합니다. 의존성·캐시 볼륨은 유지됩니다.
docker compose down

# 다시 실행합니다.
docker compose up -d
```

### 포트 변경

기본 포트가 사용 중이면 같은 터미널에서 포트를 지정합니다.
이후 Compose 명령에도 같은 `FRONTEND_PORT` 값을 사용합니다.

```bash
export FRONTEND_PORT=3100
docker compose up -d
# http://localhost:3100
```

### 의존성 변경 반영

컨테이너는 시작할 때마다 `package-lock.json`을 기준으로 `npm ci`를 실행합니다.
`package.json`과 `package-lock.json`을 변경한 경우 다음 명령으로 반영합니다.

```bash
docker compose stop frontend
docker compose up -d --build --force-recreate frontend
```

## Docker 없이 실행하기

Node.js `22.20.0`과 npm `10.9.3` 환경을 준비한 뒤 실행합니다.

```bash
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3001
```

[http://localhost:3001](http://localhost:3001)에서 확인할 수 있습니다.
같은 포트를 사용하는 Docker 개발 서버는 먼저 중지합니다.

## 환경변수와 백엔드 연결

예시 화면만 확인할 때는 환경변수 파일을 만들 필요가 없습니다.
실제 라인업 API를 연결할 때 [.env.example](.env.example)을 참고해 `.env.local`을 준비합니다.
다음 명령은 기존 `.env.local`이 있으면 덮어쓰지 않습니다.

```bash
test -e .env.local || cp .env.example .env.local
```

`.env.local`에서 사용할 주소의 주석을 해제하거나 다음 값을 설정합니다.

```dotenv
# 로컬 백엔드를 실행한 경우
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

- 브라우저가 직접 백엔드를 호출하므로 브라우저에서 접근 가능한 주소를 사용합니다.
- 백엔드 CORS 설정에 프론트 주소(기본 `http://localhost:3001`)를 허용해야 합니다.
- 공개 라인업은 주소 미설정 시 API를 호출하지 않고 예시 자료로 전환합니다.
- 실제 관리자 API는 주소 미설정 시 `http://localhost:8080`을 사용하며, 동작하는 백엔드가 필요합니다.
- 환경변수 변경 후 개발 서버를 재시작합니다. Docker에서는 `docker compose restart frontend`를 사용합니다.
- 운영 빌드에서 `NEXT_PUBLIC_BACKEND_URL`을 바꾸면 새 값으로 다시 빌드하고 배포해야 합니다.
- `NEXT_PUBLIC_*` 값은 브라우저에 공개됩니다. DB 접속 정보 등 비밀값은 프론트 환경변수에 넣지 않습니다.

백엔드 연결 시 현재 프론트가 사용하는 API 경로와 요청·응답 형식도 맞아야 합니다.
API 호출 코드는 [src/lib/lineup-api.ts](src/lib/lineup-api.ts)에 있습니다.

## 검증

개발 서버와 빌드가 `.next`를 동시에 사용하지 않도록 서버를 중지한 뒤 실행합니다.

Docker 환경:

```bash
docker compose stop frontend
docker compose run --rm --no-deps frontend sh -c 'npm ci --no-audit --no-fund && npx --no-install tsc --noEmit && npm run lint && npm run build'
docker compose up -d frontend
```

호스트 환경에서는 의존성 설치 후 다음 명령을 사용합니다.

```bash
npx --no-install tsc --noEmit
npm run lint
npm run build
```

## 배포 구성

### 운영 이미지 빌드와 로컬 확인

[Dockerfile](Dockerfile)은 빌드 단계와 실행 단계를 분리합니다. 최종 이미지에는
운영 의존성, `.next` 빌드 결과, `public` 자산, 실행 설정만 복사하고 일반 사용자(`node`, UID 1000)로 실행합니다.
문서·스크린샷·에이전트 기록·환경 파일·개발 의존성은 실행 이미지에 포함하지 않습니다.
기존 [Dockerfile.dev](Dockerfile.dev)와 [compose.yaml](compose.yaml)은 로컬 개발에 계속 사용합니다.

현재 k3s 노드는 ARM64이므로 배포 이미지도 `linux/arm64`로 빌드합니다.
백엔드 없이 예시 화면을 확인하려면 다음 명령을 사용합니다.

```bash
docker build --platform linux/arm64 -t gameprobe-frontend:prod .
docker run --rm --init --name gameprobe-frontend-prod \
  -p "127.0.0.1:${FRONTEND_PORT:-3001}:3000" \
  gameprobe-frontend:prod
```

호스트 포트는 개발 환경처럼 `FRONTEND_PORT`로 바꿀 수 있습니다.
컨테이너 내부 포트는 기본 `3000`이며, `PORT` 환경변수로 변경하면 포트 연결도 함께 바꿔야 합니다.
운영 컨테이너는 시작 시 패키지를 설치하거나 소스를 다시 빌드하지 않습니다.
코드 변경 시 이미지를 다시 빌드합니다. 위 실행은 `Ctrl+C`로 종료합니다.

실제 API를 연결할 때는 **브라우저에서 접근 가능한 백엔드 주소를 빌드 인수로 지정**합니다.
아래 주소는 예시이므로 실제 주소로 교체합니다.

```bash
docker build --platform linux/arm64 \
  --build-arg NEXT_PUBLIC_BACKEND_URL=https://api.example.com \
  -t gameprobe-frontend:prod .
```

`NEXT_PUBLIC_BACKEND_URL`은 브라우저 번들에 고정됩니다. k3s Deployment의 환경변수만
바꿔서는 반영되지 않으므로 주소 변경 시 이미지를 다시 빌드해야 합니다.
백엔드의 CORS 설정에는 실제 프론트 주소를 허용합니다. Atlas URI 같은 비밀값은 빌드 인수로 전달하지 않습니다.

현재 Next.js 14의 기본 운영 서버(`next start`)를 사용해 기존 이미지 최적화를 유지합니다.
`sharp` 패키지는 추가하지 않았으며 Next.js에 포함된 Squoosh가 이미지를 처리합니다.
실행 로그에 `sharp` 설치 권장 메시지가 나올 수 있습니다.
[Next.js 14 배포 안내](https://nextjs.org/docs/14/app/building-your-application/deploying#image-optimization)를 참고하세요.
이미지 캐시를 쓰므로 `.next`에는 실행 사용자의 쓰기 권한이 필요합니다.

### k3s 배포 연결

운영 이미지 빌드 파일은 준비되어 있습니다. GitHub Actions, 이미지 레지스트리 업로드와
Argo CD 연결은 아직 구성하지 않았습니다. 계획한 배포 흐름은 다음과 같습니다.

1. 이 저장소의 GitHub Actions에서 프론트 이미지를 빌드하고 이미지 저장소에 업로드합니다.
2. 별도 `gameprobe/deploy` 저장소의 프론트 매니페스트에 이미지 버전을 반영합니다.
3. Argo CD가 해당 변경을 동기화하여 k3s에 배포합니다.

k3s 배포용 매니페스트는 `gameprobe/deploy`에서 관리하고,
로컬 개발용 `compose.yaml`과 프론트 Dockerfile은 이 저장소에서 관리합니다.

## 라이선스

추후 결정합니다.

이 프로젝트는 Riot Games의 공식 프로젝트가 아닙니다.
