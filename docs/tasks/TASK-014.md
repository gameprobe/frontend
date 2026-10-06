# TASK-014: API Adapter 인터페이스 설계

## Status

DONE (2026-06-13)

## Goal

`docs/PLAN.md` Phase 2 완료 기준 "Mock/실제 API 전환 가능한 Adapter 구조"를
위해, `docs/ARCHITECTURE.md`에 정의된 **Riot API Adapter 인터페이스와 Mock
구현 골격, 환경 기반 전환 구조**를 Backend에 설계·구현한다. 실제 Riot API
호출 클라이언트(Phase 4)는 만들지 않는다.

이 Task는 다음을 수행한다:

1. `docs/ARCHITECTURE.md` "Riot API 어댑터" 설계를 따라 Backend `riot` 모듈에
   어댑터 인터페이스를 정의한다(`RiotApiAdapter`).
2. Mock 구현(`MockRiotApiAdapter`)을 추가한다. Mock은 결정적 스텁/내장 샘플로
   인터페이스를 충족한다(실제 외부 호출 없음).
3. 환경/설정으로 어댑터 구현을 선택하는 구조(예: 설정 프로퍼티 + 빈 선택)를
   마련한다. Phase 4의 실제 클라이언트 자리만 비워둔다(구현하지 않음).

다음은 범위가 아니다:

- 실제 Riot API 클라이언트 구현, 네트워크 호출, 인증 (Phase 4)
- Frontend ↔ Backend 연동(현재 Frontend는 자체 Mock을 직접 사용; 통합은
  이 Task 범위 밖)
- RSO/인증 UI (TASK-015)

## Context

- `docs/ARCHITECTURE.md` "Riot API 어댑터"는 인터페이스 시그니처와
  `riot/adapter`, `riot/mock`, `riot/client` 구조, 전환 전략(환경 변수로
  어댑터 선택)을 정의한다.
- `docs/DECISIONS.md` DEC-003: "Riot API를 Adapter 인터페이스 뒤에
  격리한다."
- **현재 상태 주의**: Phase 1의 Mock 데이터/로더는 **Frontend**
  (`frontend/src/lib/mock-data.ts`, `frontend/src/data/mock-data.json`)에
  있다. Backend `riot` 모듈에는 아직 어댑터/Mock이 없다. 이 Task는
  ARCHITECTURE.md의 정본 위치인 **Backend riot 모듈**에 인터페이스를
  설계한다. Frontend의 기존 Mock은 수정하지 않는다.
- `backend`는 Spring Boot 3.2.x / Kotlin이며 `./gradlew build`로 검증한다.

## Dependencies

- **선행**: TASK-010 (경기 상세) — DONE. (Phase 1 도메인 형상이 확정되어
  어댑터 시그니처의 반환 타입 모델을 참고할 수 있다.)
- **후속**: TASK-015(RSO 연결 예정 UI)는 이 어댑터 구조를 개념적으로
  전제한다. Phase 4(실제 클라이언트)는 이 인터페이스를 구현한다.

## Allowed changes

```
backend/src/main/kotlin/com/valorant/platform/riot/adapter/**   # 인터페이스
backend/src/main/kotlin/com/valorant/platform/riot/mock/**      # Mock 구현 골격
backend/src/main/kotlin/com/valorant/platform/common/config/**  # 어댑터 선택 설정 (필요 시)
backend/src/main/kotlin/com/valorant/platform/<관련 도메인 모델>  # 어댑터 반환 타입 정의(필요 최소)
backend/src/test/kotlin/com/valorant/platform/riot/**           # Mock 어댑터 단위 테스트
backend/src/main/resources/application.yml                      # 어댑터 선택 프로퍼티 (필요 시)
docs/tasks/TASK-014.md                                          # Result 갱신
```

- 추가 의존성 없이 표준 Spring/Kotlin으로 구현한다.

## Forbidden changes

- 실제 Riot API 클라이언트(`riot/client/**`) 구현, 네트워크 호출 코드
- `frontend/**` (Frontend Mock/로더 포함 — 수정하지 않음)
- `docker/**`, `scripts/**`
- `backend/build.gradle.kts` 의존성 추가(설계상 표준 라이브러리로 충분)
- 인증/RSO 로직 (TASK-015 및 Phase 4)
- `AGENTS.md`, `CLAUDE.md`, `docs/PLAN.md`, `docs/PROGRESS.md`,
  `docs/ARCHITECTURE.md`, 기존 Task 문서

## Acceptance criteria

1. **어댑터 인터페이스 정의**
   - [x] `riot/adapter`에 `RiotApiAdapter` 인터페이스를 정의한다. 메서드는
     `docs/ARCHITECTURE.md`의 시그니처(플레이어 조회, 경기 이력, 경기 상세)를
     기준으로 하되, 실제 구현한 시그니처를 Result에 기록한다.
2. **Mock 구현**
   - [x] `riot/mock`에 `MockRiotApiAdapter`를 추가해 인터페이스를 충족한다
     (결정적 스텁/샘플, 외부 호출 없음).
3. **전환 구조**
   - [x] 환경/설정으로 어댑터 구현을 선택할 수 있는 구조를 마련한다(예: 설정
     프로퍼티 + 조건부 빈). 실제 클라이언트 자리는 비워둔다(구현 안 함).
4. **빌드·테스트**
   - [x] `cd backend && ./gradlew build` 성공.
   - [x] Mock 어댑터에 대한 최소 단위 테스트가 통과한다.
5. **범위 확인**
   - [x] `git status --porcelain -- frontend docker scripts` 출력이 비어 있다.
   - [x] `riot/client`에 실제 클라이언트를 구현하지 않았음을 Result에 명시한다.

## Verification commands

```bash
# 1) Backend 빌드 및 테스트
cd backend && ./gradlew build

# (샌드박스에서 Gradle 소켓 제한이 있으면 권한 상승 환경에서 실행)
# cd backend && GRADLE_USER_HOME="$PWD/.gradle" ./gradlew --no-daemon build

# 2) 범위 확인
cd .. && git status --porcelain -- frontend docker scripts
git status --porcelain -- backend/src
```

## Stop conditions

1. 사람의 시작 승인이 없는 경우 — 시작 중단.
2. 어댑터 설계를 위해 실제 Riot API 호출/인증 구현이 불가피한 경우 — Phase 4
   범위이므로 BLOCKED로 보고한다.
3. 어댑터 구조를 Frontend에 두는 것이 더 적절하다고 판단되어 ARCHITECTURE.md
   정본(Backend)과 충돌하는 경우 — 임의 결정하지 말고 BLOCKED로 보고한다.
4. 새 Gradle 의존성 추가가 필요한 경우.
5. 동일한 `build` 실패가 3회 이상 반복되는 경우.

## Result

DONE (2026-06-13)

### Changed files

- `backend/src/main/kotlin/com/valorant/platform/riot/adapter/RiotApiAdapter.kt`
  - Riot API Adapter 인터페이스와 최소 반환 타입 모델을 추가했다.
  - 실제 구현 시그니처:
    - `suspend fun getPlayerByRiotId(gameName: String, tagLine: String): RiotPlayer?`
    - `suspend fun getPlayerByPuuid(puuid: String): RiotPlayer?`
    - `suspend fun getMatchHistory(puuid: String, count: Int): List<RiotMatchSummary>`
    - `suspend fun getMatchDetail(matchId: String): RiotMatchDetail?`
- `backend/src/main/kotlin/com/valorant/platform/riot/mock/MockRiotApiAdapter.kt`
  - 외부 호출 없는 결정적 Mock 구현을 추가했다.
  - 알 수 없는 플레이어/경기는 `null` 또는 빈 목록을 반환한다.
- `backend/src/main/kotlin/com/valorant/platform/common/config/RiotApiAdapterConfig.kt`
  - `valorant.riot.adapter=mock` 조건에서 `RiotApiAdapter` 빈으로
    `MockRiotApiAdapter`를 등록한다.
  - `matchIfMissing = true`로 설정 누락 시에도 Mock이 기본 선택된다.
- `backend/src/main/resources/application.yml`
  - 기본 설정 `valorant.riot.adapter: mock`을 추가했다.
- `backend/src/test/kotlin/com/valorant/platform/riot/mock/MockRiotApiAdapterTest.kt`
  - Mock 조회, 알 수 없는 입력 처리, 경기 이력/상세 반환, 설정 빈 등록을
    검증하는 테스트를 추가했다.
- `docs/tasks/TASK-014.md`
  - Status, Acceptance criteria, Result를 실제 결과에 맞게 갱신했다.

### Verification results

- `cd backend && ./gradlew build` — 성공. Kotlin compile, test, build 모두 통과.
- `git status --porcelain -- frontend docker scripts` — 출력 없음.
- `git status --porcelain -- backend/src` — 허용된 Backend adapter/mock/config/test
  및 `application.yml` 변경만 출력됨.

### Notes

- `backend/src/main/kotlin/com/valorant/platform/riot/client/**`는 생성하지 않았다.
  실제 Riot API 클라이언트, 네트워크 호출, 인증 구현은 Phase 4 범위로 남겼다.
- 새 Gradle 의존성은 추가하지 않았다.
- 첫 번째 build에서 테스트 헬퍼가 `null` 정상 반환을 미완료로 오인해 실패했고,
  두 번째 build에서 같은 테스트 헬퍼의 Kotlin 라벨 사용 오류가 있었다. 모두
  TASK-014 테스트 코드 내부 결함으로 확인해 수정했으며, 세 번째 build는
  성공했다.
