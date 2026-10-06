# TASK-011: 배포 환경 구성 (설정·CI·문서)

> 2026-10-02 기록 정리: 아래는 당시 배포 준비·검증 기록이다. 폐기된 DB별 명령·설정은 제거했다.
> 현재 MongoDB 연결·검증 방법은 [실행 안내](../backend/MONGODB.md)와
> [TASK-BE-001](TASK-BE-001.md)을 따른다. 과거 PASS는 현재 MongoDB 검증 결과가 아니다.

## Status

DONE (2026-06-13)

> 이 Task는 자동 구현 대상이다. TASK-011D에서 Frontend=Vercel, Backend
> API·당시 DB=Railway로 플랫폼이 확정되어 시작 가능했다. 실제 배포
> 실행(로그인·도메인·비밀정보·운영 승인)은 이 Task가 아니라 TASK-011H(사람)가
> 수행한다.

## Goal

`docs/PLAN.md` Phase 2 완료 기준 "사이트 배포 완료"를 위한 **배포 설정·CI·
문서**를 구성한다. 실제 운영 배포는 하지 않으며, 사람이 TASK-011H에서 이
설정으로 배포할 수 있도록 준비만 한다.

TASK-011D 당시 결정(Frontend: Vercel / Backend API·당시 DB: Railway /
향후 Analysis Worker·Scheduler: Railway 별도 서비스·Cron Job /
저장소: 비공개 GitHub 저장소, `docs/tasks/TASK-011D.md` Result 참고)을
기준으로, 이 Task는 다음을 수행한다:

1. **Frontend(Vercel) 환경변수 구조**: `frontend/.env.example`에 Backend
   공개 URL을 가리키는 환경 변수(예: `NEXT_PUBLIC_API_BASE_URL`)를
   placeholder로 정의한다.
2. **Backend(Railway) 실행 설정**: Railway에서 Spring Boot 앱을 빌드·실행할
   수 있는 설정(`backend/Dockerfile` 등)을 작성하고, Railway가 주입하는
   `PORT` 환경 변수로 서버 포트가 바인딩되도록 한다.
3. **당시 Railway DB 연결 설정**: 배포용 DB 환경 변수를 매핑하는
   `application-railway.yml`을 추가했다. 해당 DB별 매핑은 폐기되었으며
   현재 연결 설정은 TASK-BE-001과 MongoDB 실행 안내를 따른다.
4. **Frontend → Backend 공개 URL 사용 구조**: Frontend가 Backend API를
   호출할 때 사용할 Base URL을 환경 변수로 주입받는 구조를 준비한다(현재
   Phase 1 Frontend는 Mock 데이터만 사용하므로, 실제 호출 코드 작성은 이
   Task의 범위가 아니다 — 환경 변수 placeholder와 문서화까지만 수행한다).
5. **Backend CORS 설정**: Vercel에 배포될 Frontend Origin을 허용하는 CORS
   설정을 추가한다. 허용 Origin은 환경 변수/설정 값으로 주입 가능하게 한다.
6. **헬스체크**: 기존 `/health`(`backend/src/main/kotlin/com/valorant/
   platform/Application.kt`의 `HealthController`)를 Railway 헬스체크
   경로로 사용하도록 Railway 배포 설정에 지정한다(엔드포인트 자체는 이미
   존재하므로 신규 구현 불필요).
7. **환경 변수 템플릿**: `.env.example`, `frontend/.env.example`,
   `backend/.env.example`을 작성한다. 실제 비밀값은 넣지 않는다(플레이스홀더만).
8. **CI/파이프라인**: 빌드/검증 워크플로(`.github/workflows/**`)를 작성한다.
   외부 시크릿이 필요한 부분은 플레이스홀더와 주석으로 표시한다.
9. **Mock 모드 공개 배포 확인**: `valorant.riot.adapter` 기본값(`mock`,
   TASK-014에서 `matchIfMissing=true`로 확정)이 유지되어 Production Key
   없이 공개 배포가 가능함을 문서로 확인한다(설정 변경이 불필요하면
   "변경 없음"으로 기록).
10. **배포 문서**: README 또는 `docs/`에 배포 절차, 배포 후 확인할 URL
    목록, smoke test 명령(`curl` 등)을 작성한다.

다음은 이 Task의 범위가 아니다:

- 실제 배포 실행, 로그인, 도메인/DNS, 비밀정보 입력, 운영 승인 (TASK-011H)
- 플랫폼 선택 자체 (TASK-011D — 확정됨)
- 개인정보처리방침/이용약관 페이지 구현 (TASK-012/013 — DONE)
- API Adapter, RSO UI (TASK-014/015 — DONE)
- 실제 Riot API 키 발급, RSO 연동, 랭커 데이터 수집, 분석 Worker 구현
  (Production Key 승인 이후 또는 별도 Task)
- Frontend가 실제로 Backend API를 호출하도록 하는 기능 코드 작성(항목 4는
  환경 변수 구조 준비까지만)

## Context

- TASK-011D(당시 결정, 2026-06-13): Frontend=Vercel, Backend API/DB=Railway,
  향후 Analysis Worker/Scheduler=Railway 별도 서비스/Cron
  Job, 저장소=비공개 GitHub. 상세는 `docs/tasks/TASK-011D.md` Result 참고.
- 현재 저장소에는 배포 설정이 없다: `.github/` 없음, `frontend`에 배포용
  설정 없음(`next.config.js`만 존재), `backend`에 `Dockerfile` 없음,
  `docker/`에는 당시 개발용 DB Compose만 있었다.
- `backend/src/main/kotlin/com/valorant/platform/Application.kt`에 `/health`
  엔드포인트(`HealthController`, `{"status": "UP"}`)가 이미 존재한다.
- 당시 `backend/src/main/resources/application.yml`은 서버 포트와 로컬 DB
  연결을 고정했으며 CORS 설정이 없었다.
- Frontend(`frontend/src`)는 현재 `frontend/src/lib/mock-data.ts`/
  `frontend/src/data/mock-data.json` 기반으로 동작하며, Backend API를
  호출하는 코드가 없다(`process.env`/`NEXT_PUBLIC_*` 참조 없음).
- `frontend/.nvmrc`는 Node.js `22.20.0` 기준을 고정한다(TASK-005A). 배포
  설정은 이 버전을 따른다.
- **TASK-006~010(Phase 1), TASK-012~015(Phase 2 자동)는 DONE**이다. 배포
  대상 Frontend 앱이 완성되어 있다(`frontend/src/app/`: 홈, `players/[puuid]`,
  `matches/[matchId]`, `privacy`, `terms`, `connect`).

## Dependencies

- **선행**:
  - TASK-010 (경기 상세) — DONE.
  - TASK-011D (배포 플랫폼·DB 호스팅 결정) — **DONE (2026-06-13, Vercel +
    Railway 확정)**.
- **후속**: TASK-011H(운영 배포 실행, 사람)가 이 설정을 사용한다.

## Allowed changes

```
.github/**                                            # CI 워크플로 (신규, 시크릿은 플레이스홀더)
backend/Dockerfile                                    # Railway 배포용 (신규)
backend/src/main/resources/application-railway.yml    # 당시 Railway 프로파일: DB 환경 변수, PORT, CORS Origin (신규)
backend/src/main/kotlin/com/valorant/platform/**      # CORS 허용 Origin 설정 (신규 파일, 최소 구성)
frontend/.env.example                                 # NEXT_PUBLIC_API_BASE_URL 등 placeholder (신규)
.env.example, backend/.env.example                    # 환경 변수 템플릿 (플레이스홀더)
README.md                                             # 배포 절차, 확인 URL, smoke test 명령
docs/tasks/TASK-011.md                                # Result 갱신
```

- 정확한 파일명/경로는 구현 시 조정 가능하나, 실제 작성한 파일을 Result에
  기록한다.

## Forbidden changes

- 실제 비밀값(API 키, DB 비밀번호, 토큰)을 파일에 기입
- 기존 애플리케이션 **기능/도메인 코드**(`frontend/src/**`, `backend/src/**`의
  기존 컨트롤러/서비스/도메인 로직) 수정. 다만 위 "Allowed changes"에 명시한
  **CORS 설정·Railway 프로파일(`application-railway.yml`) 신규 추가**는
  배포 설정 목적의 예외로 허용한다. 기존 `application.yml`의 기존 키 값을
  변경하는 대신, Railway 전용 프로파일 파일을 추가하는 방식을 우선한다.
- TASK-006~010, TASK-012~015 산출물(타입/Mock/로더/화면/Adapter) 수정
- `frontend/package.json`, `frontend/package-lock.json` 의존성 추가(배포 설정에
  불필요한 경우)
- `AGENTS.md`, `CLAUDE.md`, `docs/PLAN.md`, `docs/PROGRESS.md`, 기존 Task
  문서(TASK-006~010, TASK-011D 등)
- 실제 배포 실행 (TASK-011H 범위)

## Acceptance criteria

1. **Frontend(Vercel) 환경변수 구조**
   - [x] `frontend/.env.example`에 Backend 공개 URL 환경 변수(예:
     `NEXT_PUBLIC_API_BASE_URL`)를 placeholder로 정의한다.
2. **Backend(Railway) 실행 설정**
   - [x] `backend/Dockerfile`(또는 동등한 Railway 빌드/실행 설정)을
     작성하고, `PORT` 환경 변수로 서버 포트를 바인딩한다.
3. **당시 Railway DB 연결 매핑**
   - [x] 당시 DB 연결 환경 변수를 받는 Railway 프로파일을 추가했다. 현재 구성은 TASK-BE-001로 대체됨.
4. **Frontend → Backend 공개 URL 사용 구조**
   - [x] Frontend가 사용할 Backend Base URL 환경 변수 구조를 문서화한다
     (실제 호출 코드는 작성하지 않음).
5. **Backend CORS 설정**
   - [x] Vercel Frontend Origin을 허용하는 CORS 설정을 추가하고, 허용
     Origin을 환경 변수/설정 값으로 주입 가능하게 한다.
6. **헬스체크**
   - [x] 기존 `/health`를 Railway 헬스체크 경로로 사용하도록 배포 설정에
     명시한다.
7. **환경 변수 템플릿**
   - [x] `.env.example`류 템플릿을 작성하고, 모든 비밀값은 플레이스홀더로
     둔다(실제 값 없음).
8. **CI/파이프라인**
   - [x] 빌드/검증 워크플로를 작성한다. 시크릿 참조는 플레이스홀더/주석으로
     표시한다.
9. **Mock 모드 공개 배포 가능 확인**
   - [x] `valorant.riot.adapter` 기본값(`mock`)이 Railway 배포 설정에서도
     유지됨을 확인하고 문서화한다(설정 변경이 불필요하면 "변경 없음"으로
     기록).
10. **배포 문서**
   - [x] README 또는 `docs/`에 배포 절차, 배포 후 확인할 URL 목록, smoke
      test 명령(`curl /health`, `curl /` 등)을 작성한다.
11. **로컬 검증**
   - [x] `cd frontend && npm run build` 성공(배포용 빌드가 깨지지 않음).
   - [x] `cd backend && ./gradlew build` 성공(CORS 설정·Railway 프로파일
     추가 후에도 빌드 성공).
   - [x] 작성한 설정 파일이 유효한 형식인지 확인한다(YAML/JSON/Dockerfile
     문법).
12. **비밀정보 미포함 확인**
   - [x] 저장소에 실제 비밀값이 커밋되지 않았음을 확인한다.

## Verification commands

```bash
# 1) Frontend 배포 빌드
cd frontend && npm run build

# 2) Backend 빌드 (CORS 설정·Railway 프로파일 추가 후)
cd ../backend && ./gradlew build

# 3) 작성한 워크플로/설정 문법 확인 (해당 시)
cd .. && git diff --name-only            # 작성/변경 파일 확인
# YAML 확인 예시(파일 존재 시):
# python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/<file>.yml'))"
# python3 -c "import yaml,sys; yaml.safe_load(open('backend/src/main/resources/application-railway.yml'))"

# 4) 비밀값 평문 미포함 점검 (예시 — 실제 키 패턴으로 보강)
grep -RniE "api[_-]?key|secret|password|token" .env.example frontend/.env.example backend/.env.example 2>/dev/null || true

# 5) 범위 확인 (기존 기능 코드 미변경 — CORS/Railway 프로파일 신규 파일은 제외)
git status --porcelain -- frontend/src backend/src

# 6) /health 응답 형식 확인 (로컬)
cd backend && ./gradlew bootRun &
sleep 5 && curl -s localhost:8080/health
```

## Stop conditions

1. CORS 설정·Railway 프로파일 추가만으로 해결되지 않고 기존 기능/도메인
   코드 수정이 불가피한 경우 — BLOCKED로 보고한다.
2. 설정 작성에 실제 비밀값/계정 접근이 필요한 경우 — 해당 부분은 TASK-011H로
   넘기고 플레이스홀더로 처리한다.
3. 동일한 `build` 실패가 3회 이상 반복되는 경우.

## Result

DONE (2026-06-13)

### Changed files

- `.env.example`
  - 저장소 공통 배포 URL placeholder를 추가했다.
- `frontend/.env.example`
  - Vercel에 설정할 `NEXT_PUBLIC_API_BASE_URL` placeholder를 추가했다.
- `backend/.env.example`
  - 당시 Railway Backend/DB 환경 변수 템플릿을 추가했다.
  - 모든 민감값은 실제 값이 아닌 placeholder다.
- `backend/Dockerfile`
  - Railway가 repo root build context에서 Spring Boot jar를 빌드하고 실행할 수
    있는 Dockerfile을 추가했다.
  - `java -Dserver.port=${PORT:-8080} -jar app.jar`로 Railway `PORT`에 바인딩한다.
- `railway.json`
  - Railway Dockerfile 경로를 `backend/Dockerfile`로 지정했다.
  - `/health`를 healthcheck path로 지정했다.
- `backend/src/main/resources/application-railway.yml`
  - `PORT`, 당시 DB 연결 변수, `CORS_ALLOWED_ORIGINS`,
    `VALORANT_RIOT_ADAPTER` 매핑을 추가했다. 당시 DB별 매핑은 현재 폐기됨.
  - `VALORANT_RIOT_ADAPTER` 기본값은 `mock`이다.
- `backend/src/main/kotlin/com/valorant/platform/common/config/CorsConfig.kt`
  - `valorant.cors.allowed-origins` 값을 쉼표 구분 Origin 목록으로 받아 CORS에
    적용하는 설정을 추가했다.
- `.github/workflows/verify.yml`
  - Frontend build/lint, Backend build, 배포 설정 YAML/JSON 문법 검증 워크플로를
    추가했다.
  - 실제 Vercel/Railway 배포는 수행하지 않는다고 주석으로 명시했다.
- `README.md`
  - Vercel Frontend, 당시 Railway Backend/DB 배포 절차, 배포 후 확인 URL,
    smoke test 명령, Mock 모드 배포 가능 조건을 문서화했다.
- `docs/tasks/TASK-011.md`
  - Status, Acceptance criteria, Result를 실제 결과에 맞게 갱신했다.

### Verification results

- `cd frontend && npm run build` — 성공.
- `cd backend && ./gradlew build` — 성공.
- `git diff --name-only` — TASK-011 허용 파일만 확인.
- YAML/JSON 문법 확인:
  - `ruby -e "require 'yaml'; YAML.load_file('.github/workflows/verify.yml'); YAML.load_file('backend/src/main/resources/application-railway.yml')"` — 성공.
  - `ruby -e "require 'json'; JSON.parse(File.read('railway.json'))"` — 성공.
  - Task 문서의 Python PyYAML 예시는 현재 로컬 Python에 `yaml` 모듈이 없어
    실행 불가했으며, 동일 목적의 Ruby 표준 YAML 파서로 대체 확인했다.
- Dockerfile 문법 확인:
  - `docker build --check -f backend/Dockerfile .` — 성공, warning 없음.
- 비밀값 평문 미포함 점검:
  - `grep -RniE "api[_-]?key|secret|password|token" .env.example frontend/.env.example backend/.env.example 2>/dev/null || true`
  - 출력은 안내문과 당시 DB 비밀번호 등 placeholder뿐이며 실제 비밀값 없음.
- 범위 확인:
  - `git status --porcelain -- frontend/src backend/src` — 허용된 신규
    `CorsConfig.kt`, `application-railway.yml`만 출력됨.
- `/health` 응답 형식 확인:
  - 샌드박스 내 `bootRun`은 Gradle 홈/파일락 소켓 권한 제한으로 실패했다.
  - 권한 상승으로 `GRADLE_USER_HOME="$PWD/.gradle" ./gradlew bootRun` 실행 후
    `curl -s localhost:8080/health` — `{"status":"UP"}` 반환 확인.

### Notes

- 실제 GitHub 저장소 생성, Vercel/Railway 로그인, 프로젝트 생성, 배포,
  환경변수 입력, DNS 변경은 수행하지 않았다.
- TASK-011H는 시작하지 않았다.
- Frontend는 여전히 Phase 1 Mock JSON을 직접 사용하며, Backend API 호출 코드는
  추가하지 않았다.
- 당시 DB의 실제 비밀번호와 서비스 URL 입력은 TASK-011H 사람 작업으로 남겨두었다.
