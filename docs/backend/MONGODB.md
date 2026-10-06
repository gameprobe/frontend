# MongoDB Atlas 연결과 백엔드 실행

TASK-BE-002부터 **백엔드는 Docker에서 실행하고 DB는 MongoDB Atlas에 연결**한다.
실행용 로컬·별도 서버 MongoDB Compose와 계정 초기화 스크립트는 제거했다.
백엔드 실행에 DB 이미지나 DB 데이터 볼륨은 필요하지 않다. 기존 외부 자료나 Docker 볼륨을
자동으로 지우거나 Atlas로 이전하지 않는다.

Spring Boot 3.2.12 + Kotlin과 기존 Spring Data MongoDB 의존성을 그대로 사용한다.
Atlas 연결을 위해 Kotlin 코루틴 드라이버를 추가할 필요는 없다. 이 프로젝트는
`MONGODB_URI`를 Spring의 `spring.data.mongodb.uri`에 전달한다.
[Spring Boot MongoDB 연결 설정](https://docs.spring.io/spring-boot/docs/3.2.12/reference/html/data.html#data.nosql.mongodb)

현재 영구 저장 대상은 라인업이다. 프론트 전적 Mock, 스모크 예시, `/admin/preview`의
화면 메모리 저장은 이번 작업으로 Atlas에 연결되지 않는다. HTTP API·저장 문서·관리자 인증
정책은 변경하지 않는다.

## 1. Atlas에서 연결 준비

- Atlas 로그인 계정과 별개인 **DB 사용자**를 준비한다. 앱이 사용할 `valorant_platform` DB에
  `readWrite` 역할을 부여한다. 시작 시 기존 인덱스를 생성하므로 읽기 전용 계정만으로는 부족하다.
- Atlas 프로젝트의 IP Access List에 **백엔드를 실행하는 컴퓨터의 공인 IP**를 등록한다.
  Docker 내부 IP나 `127.0.0.1`을 등록하는 것이 아니다. 실행 장소나 배포 서버가 바뀌면
  해당 환경의 접근도 확인한다.
- Atlas의 연결 화면에서 받은 URI를 사용하고 사용자·비밀번호·DB 이름을 확인한다.
  앱의 DB 이름은 이 안내에서 `valorant_platform`으로 통일한다.

DB 사용자와 IP 접근은 [Atlas 연결 준비](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/),
권한은 [MongoDB readWrite 역할](https://www.mongodb.com/docs/manual/reference/built-in-roles/#mongodb-authrole-readWrite)을 참고한다.

URI 형태는 다음과 같다. 아래 값은 자리표시자이며 그대로 실행할 수 없다.

```dotenv
MONGODB_URI='mongodb+srv://<db-user>:<encoded-password>@<cluster>.mongodb.net/valorant_platform?retryWrites=true&w=majority&appName=gameprobe'
```

사용자명·비밀번호 안의 URI 예약 문자는 퍼센트 인코딩한다. 예를 들어 비밀번호의 `@`는
`%40`으로 적는다. **URI 전체를 인코딩하지 않는다.** Atlas에서 제공한 연결 옵션을 유지하고,
이전 로컬 계정용 `authSource=valorant_platform`을 임의로 붙이지 않는다.
[MongoDB 연결 문자열 안내](https://www.mongodb.com/docs/manual/reference/connection-string-formats/)

## 2. 환경파일 준비

Docker와 Docker Compose v2가 필요하다. 아래 명령은 모두 **저장소 루트**에서 실행한다.
기존 환경파일은 덮어쓰지 않는다.

```sh
(umask 077; test -e backend/.env || cp backend/.env.example backend/.env)
chmod 600 backend/.env
```

`backend/.env`를 에디터로 열어 실제 값을 입력한다. 이 파일은 Git과 이미지 빌드에서 제외한다.
실제 URI와 토큰은 채팅·공유 로그·커밋에 넣지 않는다.

| 항목 | 설정 |
|---|---|
| `MONGODB_URI` | 필수. Atlas 인증 정보와 `/valorant_platform`을 포함한 연결 주소 |
| `ADMIN_API_TOKEN` | 관리자 기능을 사용할 때 직접 정한 비밀값. 미설정 시 관리자 API 거절 |
| `CORS_ALLOWED_ORIGINS` | 로컬 기본 `http://localhost:3000`. 프론트 주소가 바뀌면 함께 변경 |
| `BACKEND_PORT` | 선택. 호스트 포트, 기본 `8080` |
| `VALORANT_RIOT_ADAPTER` | 기본 `mock` 유지 |

URI가 비어 있으면 Compose가 실행을 거절한다. 기본 실행과 `railway` 프로필 모두 URI를
필수로 받으며 로컬 DB로 자동 연결하는 기본값은 없다.

## 3. 백엔드 실행·확인·종료

```sh
docker compose --env-file backend/.env -f docker/compose.backend.yml config --quiet
docker compose --env-file backend/.env -f docker/compose.backend.yml up -d --build --wait
docker compose --env-file backend/.env -f docker/compose.backend.yml ps
```

이 Compose는 **백엔드 한 서비스만** 실행한다. 기존 Dockerfile의 Java 17 런타임과
`railway` 프로필을 사용하며 프론트 개발 컨테이너는 건드리지 않는다.
백엔드 주소는 기본 `http://localhost:8080`이고 포트는 로컬 컴퓨터에만 공개한다.
다른 포트가 필요하면 `backend/.env`에 `BACKEND_PORT=8081`처럼 지정하고 다시 실행한다.

```sh
curl --fail http://localhost:8080/health
curl --fail http://localhost:8080/api/lineups
```

- `/health`의 `{"status":"UP"}`과 Compose의 healthy 상태는 **앱 응답 확인**이다.
- `/api/lineups`의 성공 응답까지 확인해야 MongoDB 읽기를 확인한 것이다.
  공개(`PUBLISHED`) 자료가 없으면 `[]`가 정상이며 예시 공략은 자동 등록하지 않는다.
- 백엔드 시작 시 기존 `lineups` 컬렉션용 인덱스를 생성한다. 사용자 입력 URI가 다른 DB를
  가리키지 않는지 실행 전에 확인한다. 자료 등록·삭제로 운영 연결을 시험하지 않는다.
- 실제 Atlas URI를 넣기 전에는 Docker/격리 DB 테스트만으로 Atlas 연결 성공을 판단할 수 없다.
  해당 작업의 실제 검증 범위는 [TASK-BE-002](../tasks/TASK-BE-002.md)에 기록한다.

설정 변경 후 같은 `up -d --build --wait` 명령을 다시 실행한다. 종료는 다음과 같다.
Atlas에 저장된 자료는 유지된다.

```sh
docker compose --env-file backend/.env -f docker/compose.backend.yml down
```

연결되지 않으면 Atlas DB 사용자와 비밀번호 인코딩, URI의 DB 이름, IP Access List를 먼저
확인한다. 필요하면 `docker compose --env-file backend/.env -f docker/compose.backend.yml logs --tail=80 backend`로
기동 오류를 확인하되 원문 로그를 공유하기 전에 URI·계정·토큰 포함 여부를 확인한다.

프론트에서 이 로컬 백엔드를 쓰려면 기존 `frontend/.env.local`의
`NEXT_PUBLIC_BACKEND_URL=http://localhost:8080`을 설정하고 프론트를 재시작한다.
이는 브라우저가 접근하는 백엔드 주소이며 Atlas URI를 프론트 환경변수로 넣지 않는다.
실제 `/admin` 인증·저장은 백엔드의 `ADMIN_API_TOKEN`을 사용한다.
`/admin/preview`의 `DEMO1234`는 화면 예시용 코드여서 실제 관리자 토큰이 아니다.

## 코드와 배포

```text
LineupController → LineupService → LineupRepository
                                  └─ MongoLineupRepository
                                     └─ LineupDocument → Atlas의 lineups
```

- `LineupRepository.kt`: 서비스가 사용하는 저장 인터페이스.
- `MongoLineupRepository.kt`: MongoDB 저장 구현. 필터·정렬·등록·수정·삭제 담당.
- `LineupDocument.kt`: 라인업 한 건의 저장 문서와 기존 API 모델 사이의 변환.
- `application.yml`, `application-railway.yml`: 실행 환경에서 받은 MongoDB URI 사용.

마커·경로·Sova 설정은 같은 라인업 문서 안에 저장한다. `_id`는 기존 UUID 문자열이며
시간은 BSON Date의 밀리초 정밀도를 사용한다. 공개 조회는 `PUBLISHED`만 반환하고 최근
수정순으로 정렬한다. 시작 시 `updatedAt`, `status + updatedAt`,
`status + mapId + agentId + side + updatedAt` 인덱스를 생성하는 기존 동작을 유지한다.

Railway에서는 `MONGODB_URI`, 필요한 `ADMIN_API_TOKEN`, 공개 프론트에 맞는
`CORS_ALLOWED_ORIGINS`를 플랫폼 환경변수로 입력한다. 로컬 `backend/.env`는 배포되지 않는다.
실제 배포 서버의 Atlas 접근과 자료·백업 정책은 따로 확인한다. 브랜치 병합만으로 연결 정보나
기존 자료가 이전되는 것은 아니다. 이번 Task는 실제 배포를 수행하지 않는다.

## 자동 테스트는 격리 DB에서 실행

Atlas 운영/개발 자료가 있는 DB는 자동 테스트 대상으로 사용하지 않는다. 테스트는 무작위
이름의 DB를 생성하고 정리하므로 **테스트 전용 `MONGODB_TEST_URI`**만 사용할 수 있다.
앱 실행용 `MONGODB_URI`와 혼동하지 않는다.

전체 검증 스크립트는 호스트 Node/npm, JDK 17+, Docker/Compose가 필요하다.
저장소 루트에서 실행한다.

```sh
bash scripts/verify.sh
```

`MONGODB_TEST_URI`가 없으면 스크립트가 공식 `mongo:7.0` 이미지로 고유 이름의 일회용
테스트 컨테이너를 만들고 임의 포트에 연결한다. 데이터는 tmpfs에 두며 성공·실패 후 해당
컨테이너만 정리한다. CI의 MongoDB 서비스도 테스트 용도로 유지한다.
이 테스트 컨테이너는 애플리케이션 실행용 DB나 Atlas의 대체 저장소가 아니다.

직접 준비한 격리 DB를 사용하려면 다음과 같이 테스트 전용 URI를 제공한다.
운영 Atlas URI를 넣지 않는다. 스크립트는 백엔드 테스트 실행 환경도 이 URI로 분리한다.

```sh
MONGODB_TEST_URI='mongodb://127.0.0.1:<test-port>/unused_test_db?serverSelectionTimeoutMS=5000' \
bash scripts/verify.sh
```

직접 지정한 테스트 서버는 스크립트가 종료하지 않는다. 기존 단위 테스트와 Mongo 문서·중첩
자료 보존, 필터·정렬, 관리자 API 흐름을 유지하며, DB가 없으면 통합 테스트를 건너뛰지 않고
실패한다. 이번 실제 명령·결과는 [TASK-BE-002](../tasks/TASK-BE-002.md)를 따른다.
