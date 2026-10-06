# TASK-018_LINEUP_BACKEND: 라인업 DB 모델 및 API

> 2026-10-02 기록 정리: 아래는 당시 작업·검증 기록이다. 폐기된 DB별 명령·설정은 제거했으며,
> 현재 MongoDB 실행·검증 방법은 [실행 안내](../backend/MONGODB.md)와
> [TASK-BE-001](../tasks/TASK-BE-001.md)을 따른다. 과거 PASS를 MongoDB 검증 결과로 해석하지 않는다.

## Status

DONE

## Goal

관리자 편집기와 사용자용 라인업 상세 화면이 사용할 영속 데이터 모델과 API를 구축한다.
라인업은 여러 스킬/요원 아이콘, 맵 기준 상대 좌표 경로, YouTube 영상 URL,
난이도, Sova 전용 차징·튕김 설정을 저장할 수 있어야 한다.

## Scope

- 당시 라인업 영구 저장 구조 및 중첩 자료 설계
- 라인업 기본 조회 API
- 관리자용 생성·수정·삭제·공개 상태 변경 API
- 관리자 권한 검사를 위한 역할 경계 정의
- 요청/응답 DTO와 유효성 검증
- 기존 `/lineups` Mock 화면과 호환되는 필드명 유지

## Data requirements

- 라인업 기본 정보: 제목, 설명, 맵, 공격/수비, 요원, 난이도
- 다중 스킬 마커: 스킬 ID, 상대 좌표, 표시 순서, YouTube URL
- 요원 마커: 요원 ID, 상대 좌표, 난이도 색상용 난이도 값
- 경로: 상대 좌표 배열과 화살표 표시 여부
- Sova 옵션: 차징 단계와 튕김 횟수. Sova가 아니면 저장하지 않는다.
- 상태: `DRAFT`, `REVIEW`, `PUBLISHED`, `REJECTED`
- 작성자 및 생성/수정 시각

## API

```text
GET    /api/lineups
GET    /api/lineups/{id}
POST   /api/admin/lineups
PUT    /api/admin/lineups/{id}
DELETE /api/admin/lineups/{id}
PATCH  /api/admin/lineups/{id}/status
```

공개 사용자 조회는 `PUBLISHED`만 반환하며, 관리자 API는 `ADMIN` 역할을 요구한다.

## Allowed changes

- `backend/build.gradle.kts`
- `backend/src/main/kotlin/com/valorant/platform/lineup/**`
- `backend/src/main/resources/application.yml`
- 당시 DB 스키마 파일 (현재 폐기됨)
- `backend/src/test/kotlin/com/valorant/platform/lineup/**`
- `docs/tasks/TASK-018_LINEUP_BACKEND.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `.agent-reports/CURRENT.md`
- `.agent-reports/HANDOFF.json`

## Forbidden changes

- 관리자 UI 및 사용자 상세 UI 구현
- 기존 전적 API·인증 정책의 임의 변경
- 외부 영상 파일 저장 또는 YouTube 영상 다운로드
- Git add/commit/push

## Verification commands

```bash
cd backend && ./gradlew test
cd backend && ./gradlew build
```

## Human decision required

당시 DB 스키마와 저장 관련 운영 의존성 추가가 필요한 경우,
이번 사용자 요청의 백엔드 DB/API 승인 범위 안에서 진행하되 기존 인증 방식이 없는
상태에서는 관리자 권한을 임시 경계로 명시하고 실제 로그인 연동은 후속 Task로 둔다.

## Result

- 변경된 파일: 백엔드 build 설정, 당시 DB 스키마, `com/valorant/platform/lineup/` 모델·저장소·서비스·컨트롤러, 테스트 설정·회귀 테스트, 관련 계획·handoff·진행 보고서.
- 실행한 명령: `cd backend && ./gradlew test` — PASS; `cd backend && ./gradlew build` — PASS.
- 검증 결과: 다중 마커·정규화 좌표·경로·YouTube URL·난이도·공개 상태·Sova 설정 저장 및 검증 규칙 구현.
- 남은 위험: 현재 관리자 권한 헤더는 임시 경계이며 실제 로그인/토큰 인증은 후속 Task에서 연동해야 한다. 당시 실 DB 통합 테스트는 별도 환경에서 추가 확인하는 범위였다.
