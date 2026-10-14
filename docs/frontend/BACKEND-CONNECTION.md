# GameProbe 백엔드 연결 준비

이 안내는 현재 저장소 루트의 **Vite + React + TypeScript**와 별도 저장소
`gameprobe/backend`의 **FastAPI** 연결 기준이다. 과거 Next.js의
`NEXT_PUBLIC_BACKEND_URL`과 구분한다.
프론트는 저장소 루트의 `compose.yaml`로, FastAPI는 별도 백엔드 저장소의 Compose로 실행한다.

현재 백엔드가 제공하는 연결 확인 API는 다음과 같다.

```text
GET https://api.game-probe.com/health
200 {"status":"UP"}
```

현재 연결 코드는 설정과 호출 함수를 제공한다. 페이지 자동 요청·상태 표시 UI·예시 데이터의
실제 데이터 전환은 포함하지 않는다. 함수를 import하는 것만으로도 요청하지 않는다.

## 1. 설정 파일과 역할

| 파일 | 역할 |
| --- | --- |
| `.env.example` | 공개 API 주소 설정 예시. 기본값은 빈 값 |
| `src/vite-env.d.ts` | `VITE_BACKEND_URL`의 TypeScript 타입 |
| `src/lib/backend-api.ts` | Vite 환경 변수를 읽어 공용 클라이언트 생성 |
| `src/lib/backend-client.ts` | 주소 검사, GET /health 호출, 응답 검사 |
| `src/lib/backend-client.test.cjs` | 실제 서버 없이 위 동작 검증 |

`VITE_BACKEND_URL`에는 **경로 없는 서버 주소**를 넣는다. `/health`는 코드가 붙인다.
주소가 비어 있거나 상대경로·인증정보·쿼리·해시가 포함되면 호출 시 오류가 나며
네트워크 요청은 보내지 않는다. 운영 주소나 프론트 자체 주소로 자동 대체하지 않는다.

환경 변수는 [Vite 공식 문서](https://vite.dev/guide/env-and-mode)에 설명된 대로
빌드 시 브라우저 코드에 포함된다. 공개 URL만 넣고 토큰·DB 비밀번호는 넣지 않는다.
변수 변경 후 개발 서버를 재시작하거나 다시 빌드해야 반영된다.

## 2. 화면 코드에서 사용할 방법

연결할 화면의 이벤트나 데이터 조회 코드에서 다음 함수를 호출한다.
현재 화면들은 예시 데이터 기반이므로 이번 Task에서는 직접 연결하지 않았다.

```ts
import { backendApi } from "@/lib/backend-api";

try {
  const health = await backendApi.getHealth(AbortSignal.timeout(10_000));
  console.log(health.status); // "UP"
} catch (error) {
  // 실제 화면에서는 조회 실패 상태를 표시한다.
  console.error("백엔드 상태 확인 실패", error);
}
```

GET 요청에 쿠키와 인증정보를 싣지 않는다. 불필요한 `Content-Type`·`Authorization`
헤더도 붙이지 않는다. HTTP 오류, JSON이 아닌 응답, `status: "UP"`가 아닌 응답을
성공으로 처리하지 않는다. 자동 재시도는 없으며, 취소/시간 제한은 호출자가
`AbortSignal`로 전달할 수 있다. HTTP 성공 상태(2xx) 여부는 직접 검사한다
([Fetch 동작](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)).

## 3. 배포 담당자가 나중에 할 일

프론트 Vercel 프로젝트에서 **Production 환경에만** 아래 값을 설정한다.

```text
VITE_BACKEND_URL=https://api.game-probe.com
```

1. 이번 프론트 변경을 dev에서 검토한다. dev 병합 자체는 운영 연결 확인이 아니다.
2. 실제 운영 반영 시점에 위 환경 변수를 등록한다.
3. 해당 변경과 환경 변수를 포함해 운영 프론트를 다시 빌드·배포한다.
4. `https://game-probe.com` 또는 `https://www.game-probe.com`에서 실제 브라우저
   GET 요청의 성공을 확인한다. health 호출을 화면에 붙이는 단계가 별도로 필요하다.

배포 후 연결만 먼저 확인하려면, 해당 운영 프론트 페이지의 브라우저 개발자 도구
Console에서 아래 코드를 직접 실행할 수 있다. 이것은 백엔드와 브라우저 CORS의
확인이며, 프론트 빌드에 환경 변수가 반영되었는지까지 검증하는 코드는 아니다.

```js
const response = await fetch("https://api.game-probe.com/health", {
  credentials: "omit",
  cache: "no-store",
  signal: AbortSignal.timeout(10_000),
});
console.log(response.status, await response.json());
```

운영 백엔드의 CORS 허용 출처는 위 두 프론트 주소뿐이다. `*.vercel.app` 프리뷰 주소는
허용되지 않는다. 프리뷰에 운영 주소를 설정해도 브라우저 연결이 허용되는 것은 아니다.
프리뷰에서 호출할 수 있도록 운영 CORS를 넓히거나 프록시로 우회하지 않는다.

저장소에 `.env.production`을 추가하지 않은 이유도 환경을 명시적으로 구분하기 위해서다.
Vite의 production 빌드 모드는 Vercel의 Production 배포 환경과 같은 개념이 아니며,
Preview에서도 production 빌드를 실행할 수 있다.

## 4. 로컬에서 프론트와 백엔드를 Docker로 실행

Docker와 Docker Compose v2를 준비하고 두 저장소에서 각각 실행한다. 이 프론트
저장소의 루트 Compose는 `frontend`만 켠다. 별도 백엔드의 Compose는 그 저장소에서 실행한다.

### 1) 별도 FastAPI 실행

**`gameprobe/backend` 저장소 루트**에서 실행한다.

```bash
docker compose up --build -d
curl --fail http://localhost:8000/health
```

`{"status":"UP"}`이면 백엔드가 응답한다. 별도 백엔드의 최신 Compose는 `APP_ENV=local`을
지정하며 `http://localhost:3000`과 `http://127.0.0.1:3000` 출처를 허용한다.
백엔드 소스는 컨테이너에 자동 반영되지 않으므로 수정 후 같은 명령으로 다시 빌드한다.

### 2) 프론트 주소 설정

프론트 저장소의 **`.env.local`**에 다음 값을 설정한다. 기존 파일이 있다면
다른 값을 보존하고 이 변수만 추가하거나 변경한다.

```dotenv
VITE_BACKEND_URL=http://localhost:8000
```

현재 Vite는 프론트 저장소 루트를 기준으로 실행된다. 별도 백엔드의 `.env`는 프론트 설정으로 읽지 않는다. `.env.example`은 설명용이므로 자동으로
읽지 않으며, `.env.local`은 Git에 커밋하지 않는다. 기존 개인 환경 파일은 덮어쓰지 않는다.

여기서 `localhost`는 **브라우저를 실행하는 컴퓨터**다. API 요청은 프론트 컨테이너가
아닌 방문자의 브라우저에서 실행되므로 프론트도 Docker여도 같은 주소를 사용한다.
현재 구조에서는 두 Compose 네트워크를 합치거나 Docker 서비스 이름으로 주소를
변경할 필요가 없다.

### 3) 프론트 실행

**이 프론트 저장소 루트**에서 실행한다. 호스트 Node/npm 설치는 필요하지 않다.

```bash
docker compose up --build -d
docker compose logs -f frontend
```

준비가 끝나면 `http://localhost:3000`을 연다. 로그 보기의 `Ctrl+C`는 컨테이너를 종료하지
않는다. 프론트 소스 변경은 자동 반영되지만, **`.env.local` 변경 후에는** 같은
저장소 루트에서 다음 명령으로 개발 서버를 재시작한다.

```bash
docker compose restart frontend
```

현재 로컬 CORS에는 3000번 포트만 포함된다. `FRONTEND_PORT=3001` 등으로 프론트 포트를
바꾸면 백엔드 응답을 브라우저에서 읽을 수 없으므로, 연결 확인에는 3000번을 사용한다.
운영 백엔드는 두 HTTPS 운영 프론트 출처만 허용한다. 로컬 프론트에서 운영 API를
호출하려고 운영 CORS를 넓히지 않는다. CORS는 브라우저 응답 읽기 정책이며 인증은 아니다.

### 4) 실제 브라우저 연결 확인

로컬 프론트 페이지의 개발자 도구 Console에서 다음을 실행한다.

```js
const { backendApi } = await import("/src/lib/backend-api.ts");
await backendApi.getHealth(AbortSignal.timeout(10_000));
```

`{status: 'UP'}`이면 주소 설정, 로컬 백엔드, 브라우저 CORS까지 연결된 것이다.
화면에서 자동으로 health를 호출하거나 결과를 표시하지는 않는다.
`/src/...` import는 Vite 개발 서버 전용이므로 운영 빌드에서는 화면 코드가 함수를
import하도록 연결해야 한다.

개발을 마치면 각 저장소 루트에서 `docker compose stop`으로 해당 컨테이너만 중지한다.
두 저장소는 별도 Compose 프로젝트이므로 프론트를 중지해도 백엔드는 계속 실행된다.

## 5. 연결 코드 자체 검증

실제 백엔드 없이 요청·응답·실패·취소 동작을 검사할 수 있다. 테스트는 fetch를 대체하며
외부 서버를 호출하지 않는다. Docker 프론트의 개발 서버를 중지한 후 검사한다.

```bash
docker compose stop frontend
docker compose run --rm --no-deps frontend sh -c 'npm ci && npm run test:backend && npm run typecheck && npm run lint && npm run build'
docker compose up -d frontend
```

이미 호스트에 프로젝트의 Node/npm을 준비했다면 저장소 루트에서 동일한 npm 명령을
직접 실행해도 된다. 테스트 통과와 빌드 성공은 실제 운영 브라우저 연결 성공과 구분한다.

## 다음 연결 작업

- 프론트 담당자의 Production 환경 변수 등록·배포와 브라우저 확인
- health 상태를 화면에 표시할 경우 해당 UI에서 호출 함수 연결
- 실제 기능 API 개발 및 해당 화면의 예시 데이터 교체
