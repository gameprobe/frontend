# TASK-BE-003 — 라인업 관리자 저장 계약 보완

- Status: IMPLEMENTED
- Branch: `codex/lineup-storage-contract`
- Base: `5fccc83` (최신 dev를 반영한 로컬 codex/backend)

## Goal

새 관리자 예시의 도착점 식별자·이름·좌표, 순서 있는 중간 경로, 영상/이미지 주소,
사이트·스킬 슬롯을 라인업 API와 MongoDB가 보존한다. 경로는 좌표 배열 하나로 단순화하고
발사 방법은 첨부 자료로 안내한다. 기존 다중 마커 자료와 관계없는 동작을 유지한다.

## Authorization and scope

- 로컬 환경 후속 승인: 사용자가 JG217을 포함하는 관리자 토큰 생성을 요청했다. backend/.env의 ADMIN_API_TOKEN만 설정하고 기존 백엔드 이미지에 환경값을 적용해 인증만 검증한다. 원문 토큰/URI를 출력하지 않고 새 소스를 빌드·배포하거나 DB 자료를 변경하지 않는다. 아래 기존 환경파일·재배포 제외 범위의 이번 로컬 설정 예외다.

- 사용자가 Kotlin/Spring을 유지하고 라인업의 API·DTO·저장 계약을 백엔드부터 보완하도록 승인했다.
- DTO 폴더 구성, 저장소 인터페이스/구현 통합, 작은 파일 통합, 처리 흐름을 쉽게 읽도록 정리하는 후속 요청을 포함한다.
- **최신 결정**: 경로는 출발 → 중간 좌표 → 도착을 순서대로 연결하는 선이다. 일반 경유/튕김 구분과 별도 횟수는 사용하지 않는다. 발사·충전 방법은 자료 영상으로 안내한다.
- `pathPoints` 한 곳에 순서가 있는 x/y 좌표만 저장한다. `registration.routePoints`, `SovaSettings`/`sovaSettings`, `chargeLevel`, `bounceCount`와 관련 호환·승계·충돌 검사를 제거한다. 이전 소바 호환 및 선택 충전 요구를 대체한다.
- 제품 변경은 `backend/.../lineup`과 관련 테스트·문서에 한정한다. 프론트는 읽기 전용 참고이며 기존 관리자 버튼 정리는 후속 프론트 연결 작업이다.
- 실제 Atlas 자료는 조회·수정하지 않고 실행 중인 서버도 재배포하지 않는다. 테스트는 임시 로컬 MongoDB만 사용한다.
- 인증 정책, 의존성, 스모크, Docker 설정 변경은 제외한다. 로컬 환경값 설정은 위 승인 범위만 허용한다.
- 사용자 후속 승인으로 이 Task를 커밋·푸시하고 `codex/backend` 대상 PR을 작성한다. 병합은 사용자가 수행하며, 이후 dev 반영과 프론트 갱신은 순차적으로 진행한다.

## Contract decisions

1. 기존 API 경로, 필수 필드, 인증·공개 상태·조회 필터를 유지한다. 요청/응답 DTO를 분리한다.
2. `pathPoints: [{x, y}]`가 유일한 중간 경로다. 좌표는 0~1, 순서대로 연결하며 최대30개다. 생략은 빈 배열이며 직선 경로를 뜻한다. null 배열/원소, 누락/null x/y는 거절한다. 지점 종류·횟수·충전값은 없다.
3. 선택적 `registration`에는 `destination {id, name, point}`, `media {type, url}`, `site`, `abilitySlot`만 둔다. 새 개별 공략은 출발/도착 마커 각1개이고 도착 좌표는 skillMarkers[0].position과 같다.
4. 자료는 VIDEO/IMAGE, 사이트는 A/B/C/MID, 슬롯은 C/Q/E/X다. 미디어는 자격정보 없는 절대 HTTP(S) URL이다. 기존 youtubeUrl을 함께 보내면 동일 VIDEO URL이어야 한다.
5. 전체 PUT의 registration 생략/null은 기존 등록 정보를 보존한다. 맵/요원/공수/마커를 변경하려면 registration 전체를 보내야 하며 그렇지 않으면409다. 경로는 독립된 필드이므로 registration 재전송 없이 수정·정렬·초기화할 수 있다. PUT에서 pathPoints 생략은 기존 기본값[]로 경로를 초기화한다.
6. 소바도 다른 요원과 같은 좌표 요청을 사용한다. 제거한 설정의 호환 클래스·충전 승계·튕김 계산은 유지하지 않는다. 기존 Jackson 동작대로 추가 JSON 필드는 무시하며 응답/DB에 저장하지 않는다.
7. registration 없는 기존 다중 마커 문서와 좌표 경로는 읽고 수정할 수 있다. 실제 DB 일괄 이전·삭제는 하지 않는다. 기존 문서의 제거된 추가 필드는 읽을 때 무시되고 이후 정상 전체 저장 시 새 모델에 포함되지 않는다.
8. 같은 맵의 destination.id를 재사용하여 공략을 묶을 수 있다. 공유 도착점의 일괄 이동·동시 편집 충돌 방지는 이번 범위가 아니다.

## Allowed changes

- `backend/.env` (로컬 비밀값 전용, Git 제외 유지), `docker/compose.backend.yml` (읽기 전용)

- `backend/src/test/kotlin/com/valorant/platform/ApplicationTests.kt` (저장소 구현 통합에 따른 타입/빈 검증 갱신)
- `backend/src/main/kotlin/com/valorant/platform/lineup/web/LineupController.kt`
- `backend/src/main/kotlin/com/valorant/platform/lineup/web/AdminAuthorization.kt`
- `backend/src/main/kotlin/com/valorant/platform/lineup/service/LineupService.kt`
- `backend/src/main/kotlin/com/valorant/platform/lineup/repository/LineupRepository.kt`
- `backend/src/test/kotlin/com/valorant/platform/lineup/AdminAuthorizationTest.kt`
- `backend/src/main/kotlin/com/valorant/platform/lineup/LineupRepository.kt`, `MongoLineupRepository.kt`, `AdminAuthorization.kt` (통합 또는 이동 전 경로)

- `backend/src/main/kotlin/com/valorant/platform/lineup/dto/LineupRequest.kt` (신규, 기존 요청 클래스 이동)
- `backend/src/main/kotlin/com/valorant/platform/lineup/dto/LineupResponse.kt` (신규, 기존 응답 형태 명시)
- `backend/src/main/kotlin/com/valorant/platform/lineup/dto/StatusRequest.kt` (신규, 기존 상태 요청 이동)
- `backend/src/main/kotlin/com/valorant/platform/lineup/dto/AdminSessionDto.kt` (신규, 기존 세션 요청/응답 형태 명시)
- `backend/src/main/kotlin/com/valorant/platform/lineup/LineupController.kt`

- `backend/src/main/kotlin/com/valorant/platform/lineup/LineupModels.kt`
- `backend/src/main/kotlin/com/valorant/platform/lineup/LineupRegistration.kt` (신규)
- `backend/src/main/kotlin/com/valorant/platform/lineup/LineupService.kt`
- `backend/src/main/kotlin/com/valorant/platform/lineup/LineupDocument.kt`
- `backend/src/test/kotlin/com/valorant/platform/lineup/LineupRegistrationApiIntegrationTest.kt` (신규)
- `backend/src/test/kotlin/com/valorant/platform/lineup/LineupServiceTest.kt`
- `backend/src/test/kotlin/com/valorant/platform/lineup/LineupMongoApiIntegrationTest.kt`
- `backend/src/test/kotlin/com/valorant/platform/lineup/MongoLineupRepositoryIntegrationTest.kt`
- `docs/backend/LINEUP-API.md` (신규), `docs/backend/PLAN.md`, `docs/PROGRESS.md`
- `docs/tasks/TASK-BE-003.md`, `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md`

## Acceptance criteria

- 영상/이미지 등록 → Mongo 저장 → 관리자/공개 목록·상세 → 수정·상태 변경에서 등록 정보와 단일 경로가 유지된다.
- 같은 도착점에 다른 출발점·경로·자료를 독립 저장할 수 있다.
- 모든 요원이 좌표만으로 등록하며 0/1/여러 중간점의 순서·변경·초기화가 정확히 반영된다.
- 요청·응답·DB에 중복 경로/소바 설정/충전/횟수/지점 종류가 없다. 제거한 추가 입력을 저장하지 않는다.
- 필수 입력, URL, 좌표, 배열 길이, 도착점 일치 검증과 인증·공개 상태·404·409·no-upsert 규칙을 검증한다.
- 프론트 연결에 사용할 JSON과 전체 PUT 동작·제한을 문서로 명시한다.

## Verification commands

- `git diff --check`
- 임시 MongoDB(tmpfs/임의 localhost 포트)를 생성하고 MONGODB_TEST_URI로 지정한 뒤
  런타임 URI/프로필 간섭을 제거하여 `cd backend && ./gradlew --no-daemon test bootJar` 실행.
- JUnit XML에서 전체 tests/failures/errors/skipped 집계. 기존 25개 테스트 포함, 건너뛰기 없음.
- `git diff --name-only`, `git status --short`, `git check-ignore backend/.env`로 범위/비밀파일 제외 확인.
- 독립 코드 검토. UI 변경이 없어 Visual QA는 해당 없음.

## Result

### 구현 결과

- 요청/응답 DTO를 dto 폴더에 모으고 web/service/repository로 역할을 구분했다. Mongo 저장소는 단일 클래스로 통합했다.
- 최상위 pathPoints의 x/y 좌표 배열 하나로 경로를 저장한다. 순서대로 연결하며 중간점이 없으면 직선이다.
- SovaSettings/sovaSettings, registration.routePoints, chargeLevel, bounceCount 및 경유/튕김 종류·호환·승계·중복 경로 검사 코드를 제거했다.
- 모든 요원이 좌표만으로 등록한다. 등록 정보와 경로를 독립시켜 registration 생략/null PUT에서도 경로 수정·정렬·초기화가 가능하다.
- NormalizedPoint의 x/y 누락·null이 0으로 바뀌지 않도록 거절한다. 좌표 범위/개수, 도착점 일치, URL, 인증/공개 상태/수정 no-upsert 규칙은 검증한다.

### 실제 변경 파일 전체

- .agent-reports/CURRENT.md
- .agent-reports/HANDOFF.json
- backend/src/main/kotlin/com/valorant/platform/lineup/AdminAuthorization.kt
- backend/src/main/kotlin/com/valorant/platform/lineup/LineupController.kt
- backend/src/main/kotlin/com/valorant/platform/lineup/LineupDocument.kt
- backend/src/main/kotlin/com/valorant/platform/lineup/LineupModels.kt
- backend/src/main/kotlin/com/valorant/platform/lineup/LineupRepository.kt
- backend/src/main/kotlin/com/valorant/platform/lineup/LineupService.kt
- backend/src/main/kotlin/com/valorant/platform/lineup/MongoLineupRepository.kt
- backend/src/main/kotlin/com/valorant/platform/lineup/dto/AdminSessionDto.kt
- backend/src/main/kotlin/com/valorant/platform/lineup/dto/LineupRequest.kt
- backend/src/main/kotlin/com/valorant/platform/lineup/dto/LineupResponse.kt
- backend/src/main/kotlin/com/valorant/platform/lineup/repository/LineupRepository.kt
- backend/src/main/kotlin/com/valorant/platform/lineup/service/LineupService.kt
- backend/src/main/kotlin/com/valorant/platform/lineup/web/AdminAuthorization.kt
- backend/src/main/kotlin/com/valorant/platform/lineup/web/LineupController.kt
- backend/src/test/kotlin/com/valorant/platform/ApplicationTests.kt
- backend/src/test/kotlin/com/valorant/platform/lineup/AdminAuthorizationTest.kt
- backend/src/test/kotlin/com/valorant/platform/lineup/LineupMongoApiIntegrationTest.kt
- backend/src/test/kotlin/com/valorant/platform/lineup/LineupRegistrationApiIntegrationTest.kt
- backend/src/test/kotlin/com/valorant/platform/lineup/LineupServiceTest.kt
- backend/src/test/kotlin/com/valorant/platform/lineup/MongoLineupRepositoryIntegrationTest.kt
- docs/PROGRESS.md
- docs/backend/LINEUP-API.md
- docs/backend/PLAN.md
- docs/tasks/TASK-BE-003.md

- 위 목록의 기존 루트 Controller/Service/AdminAuthorization/MongoLineupRepository 경로는 이동되어 삭제 표시다. 기존 저장소 인터페이스는 제거됐다.
- 중간 추가 파일 LineupRegistration.kt와 dto/StatusRequest.kt는 각각 모델/요청 파일에 합쳤으므로 최종 Git 변경 파일에는 없다.

### 검증 결과

- `bash /tmp/valorant-be003-verify.sh > /tmp/valorant-be003-verify-single-path.log 2>&1`: **BUILD SUCCESSFUL(15초)**. 임시 tmpfs MongoDB를 만들고 `./gradlew --no-daemon test bootJar`를 실행한 뒤 해당 컨테이너만 정리했다.
- JUnit XML 집계: **47 tests / 0 failures / 0 errors / 0 skipped**, 7 suites.
- 종전48개 중 폐기된 소바/충전/종류/중복 경로 계약 테스트를 새 요구에 맞게 대체했다. 기존 CRUD·인증·공개 필터·동시 삭제·URL·도착점·좌표·최대 길이 검증은 유지하고, 좌표 전용 API/DB 왕복·경로 수정/순서/초기화·제거 필드 미저장·x/y 누락/null 거절을 검증했다. 테스트 비활성화 없음.
- 제품 모델·DTO·서비스·저장 모델과 API 문서의 독립 검토 PASS. 추가 수정 사항 없음.
- `git diff --check` PASS. `git check-ignore backend/.env` 제외 확인, `git ls-files -- backend/.env` 무출력.
- 제품 lineup 패키지에서 SovaSettings/sovaSettings/chargeLevel/bounceCount/routePoints/WAYPOINT/BOUNCE/종류 모델 참조가 없음을 확인했다. 테스트·문서의 폐기 필드 문자열은 미저장 검증/설명용이다.
- 실제 Atlas 조회·쓰기·이전과 기존 서버 재배포는 하지 않았다. UI 변경이 없어 Visual QA 대상이 아니다.

### 남은 범위와 제한

- 프론트 소스는 변경하지 않았고 실행 중인 서버에는 BE-003 소스를 적용하지 않았다. 관리자 preview는 계속 메모리 예시이며, 경유/튕김 구분 버튼·소바 전용 입력의 제거와 실제 저장 연결은 프론트 후속 범위다.
- 기존 프론트의 x/y 경로 형식은 유지한다. 제거된 추가 필드는 기존 JSON 정책대로 무시하며 DB/응답에 포함하지 않는다. 기존 문서에 해당 필드가 있다면 읽기는 원본을 변경하지 않으나 이후 전체 저장은 새 모델만 반영한다.
- PUT은 전체 수정이다. pathPoints를 보내지 않으면 기본값[]로 중간 경로를 비운다. 등록 정보 보존과는 별도이며 API 문서에 명시했다.
- 공유 도착점 일괄 수정·동시 편집 충돌 방지·스모크 저장·실제 자료 품질 검수는 후속 범위다. 게임 반사 물리·충전 시간·지점별 의미는 추론하지 않는다.
- 구현 검증을 마치고 사용자 요청에 따라 `codex/backend` 대상 PR로 제출한다. 프론트 연결과 dev 병합은 후속 단계다.

### 로컬 관리자 토큰 설정 후속

- 사용자 요청으로 JG217 접두어와 암호학적 무작위 문자열(32바이트)을 결합한 토큰을 backend/.env의 ADMIN_API_TOKEN에 저장했다. 다른 환경값의 바이트 내용은 그대로이며 파일 권한은600이다. 토큰 원문은 채팅·문서·명령 인자에 남기지 않았다.
- 기존 실행 이미지와 로컬 태그의 이미지 ID가 동일함을 확인한 뒤 `docker compose --env-file backend/.env -f docker/compose.backend.yml up -d --no-build --pull never --no-deps --force-recreate --wait --wait-timeout 50 backend` 실행: healthy PASS. 새 백엔드 소스는 빌드·배포하지 않았다.
- 로컬 HTTP 검증: 올바른 토큰의 세션 검증200/ADMIN, 임의의 잘못된 토큰401, 무토큰 관리자 조회403, health200 모두 PASS. 세션 검증은 DB 접근 없이 토큰만 비교한다. 실제 자료 조회·쓰기 요청은 보내지 않았다.
- backend/.env Git 제외·미추적 확인, 생성한 토큰의 staged/unstaged diff 및 공유 가능한 untracked 파일 포함 여부 검사 PASS(노출0). 실제 변경 추가 파일은 backend/.env(로컬 전용)이며 Compose 파일은 읽기만 했다.
- 프론트는 변경하지 않았다. 이번 환경값 적용은 기존 이미지에만 해당하며 BE-003 새 소스의 실행 반영은 별도다. 환경파일은 커밋에서 제외한다.
