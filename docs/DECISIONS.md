# DECISIONS.md - 기술 결정 기록

이 문서는 프로젝트의 기술 결정 사항과 그 근거를 기록한다.

---

## 결정 완료

### DEC-001: 모노레포 구조

**날짜**: 2026-06-12
**상태**: 결정됨

**결정**: Frontend와 Backend를 하나의 Git 저장소에서 관리한다.

**근거**:
- 작은 팀에서 빠른 개발 가능
- 공유 타입 정의 관리 용이
- 일관된 버전 관리

**대안**:
- 별도 저장소: 팀 규모가 커지면 고려

---

### DEC-002: 모듈형 모놀리스

**날짜**: 2026-06-12
**상태**: 결정됨

**결정**: Backend를 마이크로서비스가 아닌 모듈형 모놀리스로 구성한다.

**근거**:
- 초기 복잡도 감소
- 운영 비용 절감
- 필요 시 점진적 분리 가능

**대안**:
- 마이크로서비스: 트래픽이 특정 모듈에 집중되면 분리 고려

---

### DEC-003: Riot API Adapter 패턴

**날짜**: 2026-06-12
**상태**: 결정됨

**결정**: Riot API를 Adapter 인터페이스 뒤에 격리한다.

**근거**:
- API 승인 전 Mock 데이터로 전체 흐름 개발 가능
- 테스트 용이
- 외부 의존성 격리

---

### DEC-004: 상위 랭커 통계 기반 분석

**날짜**: 2026-06-12
**상태**: 결정됨

**결정**: 분석은 상위 랭커 데이터를 수집하여 만든 통계 기준과 비교하는 방식으로 구현한다. AI는 계산된 비교 결과를 자연어로 설명하는 용도로만 사용한다.

**근거**:
- 실제 데이터 기반의 객관적인 비교 가능
- 규칙 기반보다 더 정확한 피드백 제공
- AI 환각 위험 감소 (통계를 직접 생성하지 않음)
- 충분한 표본 확보 시에만 피드백 제공하여 신뢰도 확보

**구현 시기**: Phase 5 (Riot Production API 연동 이후)

**구현 단계**:
1. 상위 랭커 선정 기준 정의
2. 데이터 수집 및 정규화
3. 조건별 기준 통계 생성
4. 사용자 전적과 비교
5. 피드백 생성
6. AI 자연어 설명 추가

---

### DEC-006: 초기 부트스트랩 버전 (Next.js 14, Spring Boot 3.2.12)

**날짜**: 2026-06-12
**상태**: 결정됨 (재검토 가능)

**결정**: TASK-001 실행 환경 구성에서 Frontend는 Next.js 14, Backend는 Spring Boot 3.2.12 (Kotlin)로 초기화했다.

**근거**:
- Next.js 14: App Router 기반의 안정 버전으로 호스팅 호환성과 커뮤니티 지원이 충분하다.
- Spring Boot 3.2.12: 3.2.x 안정 라인의 패치 버전으로 Java/Kotlin 호환성이 검증되어 있다.

**범위 한정**:
- 이 버전들은 **초기 부트스트랩 기준 버전이며 장기 버전 확정이 아니다.** 보안 검토 후 변경될 수 있다.
- 현재 `npm audit --omit=dev` 기준으로 배포 의존성에 `next` high, `postcss` moderate 취약점이 보고된다. npm audit 취약점 검토와 버전 대응은 TASK-001 범위에 포함하지 않고 **별도 후속 작업**으로 다룬다. 자동 수정(`npm audit fix --force`)은 Next.js 16으로의 breaking change를 요구하므로 적용하지 않았다.

**관련 Task**: TASK-001 (PENDING-001, PENDING-002 해소)

---

### DEC-005: 초기 MVP에서 분석 기능 제외

**날짜**: 2026-06-12
**상태**: 결정됨

**결정**: 초기 MVP(Phase 1-3)에서는 분석 피드백 기능을 제외한다. 전적 검색과 라인업 기능에 집중한다.

**근거**:
- Riot Production API 승인 전에는 실제 랭커 데이터 수집 불가
- 가짜 피드백은 사용자 신뢰 저하 우려
- 핵심 흐름(전적 검색, 라인업)을 먼저 완성하는 것이 효율적
- API 승인 대기 기간에 라인업 기능 개발로 시간 활용

---

### DEC-007: 배포 플랫폼 (Vercel + Railway)

**날짜**: 2026-06-13
**상태**: 결정됨

**결정**: Frontend는 Vercel, Backend API는 Railway에 배포한다. 당시 DB 호스팅
결정은 2026-10-02 DEC-008로 대체되었다. 향후 분석 Worker는 Railway의 별도 서비스로, 수집·
분석 Scheduler는 Railway Cron Job으로 운영한다. 저장소 연결은 비공개 GitHub
저장소를 사용한다.

**근거**:
- Vercel: Next.js App Router와의 호환성이 높고, 무료 티어로 공개 프로토타입
  배포가 가능하다.
- Railway: Backend(Spring Boot)의 실행 환경을 제공하며, 향후
  비동기 워커/Cron Job(Phase 5 `analysis_jobs` polling, 랭커 데이터 수집)을
  위한 상시 실행 환경과 스케줄러를 지원한다(`docs/analysis/ARCHITECTURE.md`
  "배포/인프라 영향" 참고).
- 비공개 GitHub 저장소: 공개 프로토타입 단계에서도 소스코드 비공개를
  유지하면서 Vercel/Railway에 연결해 배포할 수 있다.

**범위 한정**:
- 초기 배포 목적은 Riot VALORANT Production API 신청용 공개 프로토타입이며,
  Mock 데이터와 Mock Riot API Adapter(TASK-014 `MockRiotApiAdapter`,
  `valorant.riot.adapter=mock`)를 사용한다.
- 실제 Riot API 키, RSO 연동, 랭커 데이터 수집, 분석 Worker 구현은 Production
  Key 승인 이후 또는 별도 Task에서 진행한다.
- 실제 배포 실행, 외부 로그인, 도메인/DNS, 환경변수·비밀정보 입력은
  TASK-011H에서 사람이 수행한다.

**대안**:
- Backend: AWS/GCP Cloud Run/Render — Railway 대비 초기 설정·비용 부담이
  크거나 상시 백그라운드 워커/Cron 지원이 제한적이어서 보류.
- 당시 DB 대안 비교는 현행 구성에서 폐기했다. 현재 저장소 결정은 DEC-008을 따른다.

**관련 Task**: TASK-011D (PENDING-006, PENDING-007 해소), TASK-011 (배포
환경 구성)

---

### DEC-008: MongoDB 단일 저장소

**날짜**: 2026-10-02
**상태**: 사용자 결정됨 (TASK-BE-001). MongoDB 단일 저장소 결정은 유지하며, 아래 당시 로컬/서버 실행 방식은 DEC-009로 대체했다.

**결정**: 라인업 저장 구현·운영 의존성·실행 설정은 MongoDB만 유지한다.
이전 저장소 공존 요구를 대체하며 API 경로, DTO, 인증 방식, Kotlin/Spring은 유지한다.
로컬에서는 공식 MongoDB 7.0 Docker 이미지를 사용하고, 향후 별도 DB 서버에 연결할 수
있도록 `MONGODB_URI`로 주소·인증 정보를 주입한다.

**근거**: 사용자가 동료와 상의한 뒤 단일 저장 방식으로 정리하도록 명시했다.

**범위 한정**: 기존 데이터 자동 이전, 실제 DB·볼륨 삭제, 원격 배포는 포함하지 않는다.
현재 영구 저장 대상은 라인업이며, 분석 작업 큐·전적 저장은 아직 미구현 설계다.
서버 크기에 따른 운영 성능은 실제 데이터와 부하로 검증해야 한다.

**관련 문서**: [TASK-BE-001](tasks/TASK-BE-001.md), [MongoDB 실행 안내](backend/MONGODB.md)

---

### DEC-009: 앱 DB는 Atlas, 로컬 Docker는 백엔드 실행

**날짜**: 2026-10-04
**상태**: 사용자 결정됨 (TASK-BE-002)

**결정**: 사용자가 준비한 MongoDB Atlas에 `MONGODB_URI`로 연결한다.
로컬에서는 백엔드만 Docker Compose로 실행하고, 앱 실행용 MongoDB Compose 두 개와
계정 초기화 스크립트는 제거한다. 기존 자료·볼륨을 삭제하거나 자동 이전하지 않는다.

**근거**: 사용자가 Atlas 연결 URI를 사용하는 백엔드 Docker 실행과 로컬 DB 실행 구성의
제거를 명시했다. 기존 Spring Data MongoDB가 연결을 담당하므로 언어·프레임워크·드라이버를
새로 바꿀 필요가 없다.

**범위 한정**:
- 기본 실행·Railway 프로필 모두 URI를 필수로 받으며 비밀값은 이미지·Git 밖에서 전달한다.
- 라인업 문서와 API·인증 정책, Kotlin/Spring 및 기존 인덱스 생성은 유지한다.
- 자동 테스트는 Atlas 운영 자료를 사용하지 않는다. 기존 통합 테스트용 일회용 MongoDB
  컨테이너와 CI 서비스는 유지한다.
- 실제 Atlas 접속 성공과 운영 배포 완료는 구성 변경만으로 판단하지 않는다.
  DB 사용자·IP 접근·URI를 준비한 실행 환경에서 확인하며 실제 결과는 Task에 기록한다.

**관련 문서**: [TASK-BE-002](tasks/TASK-BE-002.md), [Atlas 연결 안내](backend/MONGODB.md)

---

## 결정 대기

### PENDING-001: Next.js 버전 → 해소됨 (DEC-006)

**상태**: 해소됨 (TASK-001에서 Next.js 14로 결정, 초기 부트스트랩 기준 버전)

**결과**: Next.js 14 (App Router, 안정)를 채택했다. 상세와 재검토 조건은 DEC-006 참조.

**선택지(당시)**:
1. Next.js 14 (App Router, 안정) ← 채택
2. Next.js 15 (최신, 일부 실험적 기능)

---

### PENDING-002: Spring Boot 버전 → 해소됨 (DEC-006)

**상태**: 해소됨 (TASK-001에서 Spring Boot 3.2.12로 결정, 초기 부트스트랩 기준 버전)

**결과**: Spring Boot 3.2.12 (3.2.x 안정 라인)를 채택했다. 상세와 재검토 조건은 DEC-006 참조.

**선택지(당시)**:
1. Spring Boot 3.2.x (안정) ← 채택 (3.2.12)
2. Spring Boot 3.3.x (최신)

---

### PENDING-003: 스타일링 방식

**상태**: 대기

**선택지**:
1. Tailwind CSS
2. CSS Modules
3. styled-components / Emotion
4. Shadcn/ui + Tailwind

**고려 사항**:
- 개발 속도
- 디자인 시스템 확장성
- 번들 크기

**필요 정보**:
- UI 디자인 방향 확정 후 결정

---

### PENDING-004: 상태 관리

**상태**: 대기

**선택지**:
1. React Query (TanStack Query) - 서버 상태
2. Zustand - 클라이언트 상태
3. Jotai - 원자적 상태
4. React Context - 단순한 경우

**고려 사항**:
- 서버 상태 vs 클라이언트 상태 비율
- 복잡도
- 러닝 커브

**필요 정보**:
- Phase 1 데이터 흐름 설계 후 결정

---

### PENDING-005: 테스트 프레임워크

**상태**: 대기

**Frontend 선택지**:
1. Jest + React Testing Library
2. Vitest + React Testing Library
3. Playwright (E2E)

**Backend 선택지**:
1. JUnit 5 + MockK
2. Kotest

**필요 정보**:
- TASK-002, TASK-003 시작 전 결정 필요

---

### PENDING-006: 배포 플랫폼 → 해소됨 (DEC-007)

**상태**: 해소됨 (TASK-011D에서 2026-06-13 결정, Frontend=Vercel,
Backend=Railway)

**결과**: Frontend는 Vercel, Backend API는 Railway를 채택했다. 상세와 근거는
DEC-007 참조.

**선택지(당시)**:

**Frontend 선택지**:
1. Vercel ← 채택
2. Cloudflare Pages
3. AWS Amplify

**Backend 선택지**:
1. AWS (EC2/ECS)
2. GCP (Cloud Run)
3. Railway ← 채택
4. Render

**고려 사항(당시)**:
- 비용
- 확장성
- 운영 복잡도

---

### PENDING-007: DB 호스팅 → Atlas로 결정 (DEC-009)

**상태**: 저장소는 DEC-008의 MongoDB 단일 구성, 실행 환경은 2026-10-04 DEC-009의 Atlas로 확정.

**현재 방향**: 백엔드는 Docker/Railway에서 Atlas URI로 연결한다.
실제 배포 환경의 연결·권한 확인과 백업 정책은 운영 단계에서 확인한다.

---

### PENDING-008: 상위 랭커 선정 기준

**상태**: 대기

**선택지**:
1. Radiant 전체
2. Immortal 3 이상
3. 리더보드 상위 N명
4. 지역별 상위 N%

**고려 사항**:
- 표본 크기
- 데이터 품질
- API 호출 제한

**필요 정보**:
- Phase 5 시작 전 결정 필요
- Riot API 호출 제한 확인 후 결정

---

### PENDING-009: 통계 집계 주기

**상태**: 대기

**선택지**:
1. 실시간 (경기 종료 시)
2. 시간별
3. 일별
4. 패치별

**고려 사항**:
- 서버 부하
- 데이터 신선도
- 스토리지 비용

**필요 정보**:
- Phase 5 시작 전 결정 필요

---

## 결정 형식

새로운 결정은 다음 형식을 따른다:

```markdown
### DEC-XXX: 결정 제목

**날짜**: YYYY-MM-DD
**상태**: 결정됨 / 대기 / 재검토

**결정**: 결정 내용

**근거**:
- 이유 1
- 이유 2

**대안**:
- 고려했던 다른 선택지와 채택하지 않은 이유

**관련 Task**: TASK-XXX (있는 경우)
```
