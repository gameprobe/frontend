# 백엔드 작업 목록

## 관리 범위

- Spring Boot/Kotlin API, 백엔드 도메인·데이터 처리·인증을 관리한다.
- 백엔드 통합 브랜치는 `codex/backend`다. 작업 브랜치에서 PR로 통합하고, 검토된 버전을 `dev`에 반영한다. 병합은 사람이 수행한다.
- 최초 통합 기준은 `origin/codex/frontend-rework`의 `53a0542`이며, 프론트와 백엔드는 기존 모노레포를 유지한다.
- 앞으로 작성하는 Task는 `TASK-BE-001`부터 독립적으로 번호를 부여하며,
  문서는 `../tasks/TASK-BE-XXX.md`에 보관한다.
- 기존 Task 번호·문서는 유지한다. 기존 Phase별 계획과 의존 관계는
  [루트 계획](../PLAN.md)에 남겨둔다.
- 프론트 화면·Mock·프론트 전용 Docker 실행은 [프론트 계획](../frontend/PLAN.md)
  에서 관리한다. API 연결은 요청 조건·응답 형태를 합의한 FE/BE Task로 나눈다.
- 공통 DB 환경·CI·배포 변경은 필요할 때 `TASK-INFRA-*`로 별도 작성한다.
- 각 Task의 구현·검증 결과는 해당 Task 문서에 기록하고, 이 목록과
  [진행 로그](../PROGRESS.md)에는 상태 요약만 반영한다.

## 현재 상태 (2026-10-04)

- TASK-BE-001/002는 `codex/backend`와 dev 병합 완료. 최신 dev `5fccc83`을 로컬 백엔드 통합 브랜치에 fast-forward했다.
- 현재 [TASK-BE-003](../tasks/TASK-BE-003.md)을 `codex/lineup-storage-contract`에서 구현·검증을 완료했다. 전체47개 테스트와 실행 패키지 빌드 PASS. 사용자 요청으로 `codex/backend` 대상 PR을 제출하며 병합은 사람이 수행한다.
- 라인업 패키지의 요청/응답·Mongo 저장에 새 관리자 등록 정보를 추가한다. [API 계약](LINEUP-API.md).
- 사용자 후속 요청으로 저장소 인터페이스/구현을 한 클래스로 통합하고 작은 DTO·등록 모델 파일을 합쳤다. HTTP(web)·service·repository·dto 폴더로 구분했으며 저장 모델의 패키지/이름은 유지했다. 전체40개 테스트·bootJar 재검증 PASS.
- 최신 결정: pathPoints=[{x,y}] 하나로 경로를 저장하고 소바 설정·충전·튕김 구분/횟수·registration.routePoints 및 호환 코드를 제거했다. 중간점 없는 직선과 순서 있는 꺾임을 같은 구조로 처리한다. 프론트 연결·불필요한 입력 버튼 정리·스모크 저장·공유 도착점 일괄 이동은 후속 범위다.
- 백엔드 실행과 Atlas 연결은 [실행 안내](MONGODB.md)를 따른다. 이번 검증은 별도 임시 DB만 사용한다.

## 작업 목록

| Task | 범위 | 상태 |
| --- | --- | --- |
| [TASK-BE-001](../tasks/TASK-BE-001.md) | MongoDB 단일 저장소·통합 검증 (앱 실행 구성은 BE-002로 대체) | MERGED |
| [TASK-BE-002](../tasks/TASK-BE-002.md) | Docker 백엔드·Atlas 연결·테스트 DB 격리 | MERGED |
| [TASK-BE-003](../tasks/TASK-BE-003.md) | 라인업 관리자 저장 계약·기존 자료 호환 | IMPLEMENTED |

Kotlin을 유지한다. 이번 라인업 파일 통합 외 전체 백엔드 구조 변경은 후속 범위이며, 다음 작업은 사람이 결정한다. 자동으로 시작하지 않는다.
