# ARCHITECTURE.md - 아키텍처 설계

## 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| Frontend | Next.js + TypeScript | App Router |
| Backend | Spring Boot + Kotlin | 3.x |
| Database | MongoDB Atlas | 앱은 `MONGODB_URI`로 연결, 격리 통합 테스트만 MongoDB 7.0 Docker 사용 |
| 구조 | 모듈형 모놀리스 | 점진적 분리 가능 |
| 저장소 | 모노레포 | frontend/, backend/ |

## 저장소 구조

```
valorant-platform/
├── frontend/                    # Next.js 애플리케이션
│   ├── src/
│   │   ├── app/                 # App Router 페이지
│   │   ├── components/          # UI 컴포넌트
│   │   ├── lib/                 # 유틸리티, API 클라이언트
│   │   ├── hooks/               # 커스텀 훅
│   │   └── types/               # TypeScript 타입
│   ├── public/
│   └── package.json
│
├── backend/                     # Spring Boot 애플리케이션
│   ├── src/main/kotlin/
│   │   └── com/valorant/platform/
│   │       ├── player/          # 플레이어 모듈
│   │       ├── match/           # 경기 모듈
│   │       ├── lineup/          # 라인업 모듈
│   │       ├── stats/           # 통계 모듈 (Phase 5)
│   │       ├── analysis/        # 분석 모듈 (Phase 5)
│   │       ├── riot/            # Riot API 어댑터
│   │       └── common/          # 공통 코드
│   └── build.gradle.kts
│
├── docs/                        # 프로젝트 문서
├── docker/                      # 프론트 개발 서버·백엔드 실행 Compose
├── AGENTS.md
├── README.md
└── .gitignore
```

## 모듈형 모놀리스

### 모듈 구조

```
backend/src/main/kotlin/com/valorant/platform/
├── player/
│   ├── api/           # REST Controller
│   ├── application/   # 서비스, 유스케이스
│   ├── domain/        # 엔티티, 값 객체
│   └── infrastructure/# 리포지토리 구현
│
├── match/
│   ├── api/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
│
├── lineup/
│   ├── api/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
│
├── stats/                       # Phase 5: 상위 랭커 통계
│   ├── api/
│   ├── application/
│   │   ├── collector/           # 데이터 수집
│   │   └── aggregator/          # 통계 집계
│   ├── domain/
│   └── infrastructure/
│
├── analysis/                    # Phase 5: 분석
│   ├── api/
│   ├── application/
│   │   ├── comparator/          # 기준 통계 비교
│   │   ├── feedback/            # 피드백 생성
│   │   └── ai/                  # AI 설명 생성
│   └── domain/
│
├── riot/
│   ├── adapter/       # Riot API 어댑터 인터페이스
│   ├── mock/          # Mock 구현
│   └── client/        # 실제 API 클라이언트 (Phase 4)
│
└── common/
    ├── config/
    ├── exception/
    └── util/
```

### 모듈 의존성 규칙

- 각 모듈은 자체 도메인을 소유한다.
- 모듈 간 통신은 public API(서비스 인터페이스)를 통해서만 한다.
- 순환 의존성을 금지한다.
- common 모듈은 다른 모듈에 의존하지 않는다.
- stats, analysis 모듈은 Phase 5에서 구현한다.

## Riot API 어댑터

### 인터페이스 설계

```kotlin
interface RiotApiAdapter {
    suspend fun getPlayerByRiotId(gameName: String, tagLine: String): Player?
    suspend fun getPlayerByPuuid(puuid: String): Player?
    suspend fun getMatchHistory(puuid: String, count: Int): List<MatchSummary>
    suspend fun getMatchDetail(matchId: String): MatchDetail?
}
```

### 구현체

```
riot/
├── adapter/
│   └── RiotApiAdapter.kt       # 인터페이스
├── mock/
│   ├── MockRiotApiAdapter.kt   # Mock 구현
│   └── data/                   # JSON Mock 데이터
└── client/
    └── RiotApiClient.kt        # 실제 API 클라이언트 (Phase 4)
```

### 전환 전략

1. **Phase 0-3**: MockRiotApiAdapter 사용
2. **Phase 4**: RiotApiClient 구현, 설정으로 전환
3. **운영**: 환경 변수로 어댑터 선택

## 데이터베이스 설계 (개요)

2026-10-02 TASK-BE-001 기준 저장 구현은 MongoDB 하나다.
2026-10-04 TASK-BE-002부터 앱 DB 실행 환경은 Atlas를 사용한다. 로컬 Docker는 백엔드만
실행하고 DB URI를 런타임 환경변수로 받는다. 앱 실행용 로컬·별도 서버 DB Compose는 제거했다.
현재 영구 저장 구현은 `lineups` 컬렉션이며, HTTP API와 도메인 모델은
`LineupRepository` 인터페이스를 통해 `MongoLineupRepository`에 저장을 요청한다.
실행·인증·연결 설정은 [Atlas 연결 안내](backend/MONGODB.md)를 따른다.
기존 Spring Data MongoDB와 저장 문서·API 계약을 유지하며 별도 코루틴 드라이버는 추가하지 않는다.

### 현재 구현: lineups

- `_id`: 기존 API 주소를 유지하는 UUID 문자열
- `title`, `description`, `mapId`, `side`, `agentId`, `difficulty`
- `skillMarkers`, `agentMarkers`, `pathPoints`: 중첩 문서 배열
- `sovaSettings`: 선택적 중첩 문서
- `status`, `authorId`, `createdAt`, `updatedAt`
- 공개 조회는 `PUBLISHED`만 반환하고, 수정 시각 내림차순으로 정렬한다.
- 문서 모델·인덱스의 정본은 `LineupDocument.kt`다.

### 향후 기능의 컬렉션 개념안 (미구현)

아래 전적·즐겨찾기·신고 저장 구조와 Phase 5 분석 구조는 구현된 DB 목록이 아니다.
문서 ID·참조 ID·중첩 자료의 초안이며 실제 필드·인덱스·무결성 처리는 해당 Task에서 확정한다.

```
players
├── puuid (문서 식별자)
├── game_name
├── tag_line
├── current_rank
├── updated_at

matches
├── match_id (문서 식별자)
├── map
├── mode
├── started_at
├── match_data (중첩 문서/배열)

player_matches
├── puuid (참조 ID)
├── match_id (참조 ID)
├── team
├── agent
├── stats (중첩 문서/배열)

lineup_favorites
├── user_id (참조 ID)
├── lineup_id (참조 ID)

lineup_reports
├── report_id (문서 식별자)
├── lineup_id (참조 ID)
├── reason
├── created_at
```

### Phase 5 컬렉션 (예정·미구현)

```
ranker_players                   # 상위 랭커 목록
├── puuid (문서 식별자)
├── tier
├── rank_position
├── tracked_since
├── last_collected_at

ranker_match_stats               # 수집된 경기 통계
├── stat_id (문서 식별자)
├── puuid (참조 ID)
├── match_id
├── map
├── agent
├── role
├── side (attack/defense)
├── metrics (중첩 문서/배열)
├── collected_at

benchmark_stats                  # 기준 통계
├── benchmark_id (문서 식별자)
├── map
├── agent
├── role
├── tier
├── side
├── sample_count
├── metrics (중첩 문서/배열)              # 평균, 중앙값, 분포 등
├── confidence_level
├── calculated_at
```

## API 설계

### 응답 형식

```json
{
  "success": true,
  "data": { ... },
  "error": null
}

{
  "success": false,
  "data": null,
  "error": {
    "code": "PLAYER_NOT_FOUND",
    "message": "플레이어를 찾을 수 없습니다."
  }
}
```

### 에러 코드

| 코드 | HTTP 상태 | 설명 |
|------|----------|------|
| PLAYER_NOT_FOUND | 404 | 플레이어 없음 |
| MATCH_NOT_FOUND | 404 | 경기 없음 |
| LINEUP_NOT_FOUND | 404 | 라인업 없음 |
| INVALID_RIOT_ID | 400 | 잘못된 Riot ID 형식 |
| RATE_LIMITED | 429 | 호출 제한 초과 |
| RIOT_API_ERROR | 502 | Riot API 오류 |
| INSUFFICIENT_DATA | 422 | 분석에 필요한 표본 부족 (Phase 5) |

## 실행·배포 구조

### 개발 환경

```
Frontend (localhost:3000)
    │
    ▼
Backend (Docker, localhost:8080)
    │ MONGODB_URI
    ▼
MongoDB Atlas (외부 DB)
```

`docker/compose.backend.yml`은 백엔드 한 서비스만 실행하고 기본 포트를 `127.0.0.1:8080`에
공개한다. `backend/.env`는 Git·이미지에서 제외하고 런타임으로만 전달한다. URI가 없으면
실행을 거절한다. `/health`는 앱 응답, 공개 `GET /api/lineups`는 DB 읽기 확인에 사용한다.
기존 인덱스 생성은 기동 시 유지한다. 실제 Atlas 연결 확인 여부는 해당 Task 결과를 따른다.

자동 테스트에서는 운영 URI를 사용하지 않는다. `scripts/verify.sh`가 만드는 일회용
MongoDB 컨테이너와 CI 테스트 서비스는 테스트를 위해서만 유지한다.

### 운영 환경 (예정)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │────▶│   Railway   │────▶│  MongoDB    │
│   Frontend  │     │   Backend   │     │   Atlas     │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 보안 고려사항

### 인증

- RSO(Riot Sign On) 사용 (Phase 4)
- JWT 토큰 기반 세션 관리
- 민감한 API 키는 환경 변수로 관리

### 데이터 보호

- 사용자 동의 기반 데이터 접근
- 데이터 삭제 요청 지원 (GDPR 대응)
- 개인 식별 정보 최소화

### API 보안

- Rate Limiting
- CORS 설정
- Input Validation
