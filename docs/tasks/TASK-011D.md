# TASK-011D: 배포 플랫폼·DB 호스팅 결정

> 2026-10-02 기록 정리: 아래는 당시 작업·검증 기록이다. 폐기된 DB별 명령·설정은 제거했으며,
> 현재 MongoDB 실행·검증 방법은 [실행 안내](../backend/MONGODB.md)와
> [TASK-BE-001](../tasks/TASK-BE-001.md)을 따른다. 과거 PASS를 MongoDB 검증 결과로 해석하지 않는다.

## Status

HUMAN-DECISION 완료 (결정 확정 — 2026-06-13)

> 이 Task는 **사람이 직접 결정**했다. 결정 결과는 아래 Result에 기록했으며,
> 후속 Task(TASK-011)는 이 결정을 기준으로 설정 파일을 구현한다.

## Goal

`docs/PLAN.md` Phase 2 "배포 환경 구성"의 선행 결정으로, 다음 미해소 결정을
확정한다:

- `docs/DECISIONS.md` **PENDING-006 (배포 플랫폼)**: Frontend(Vercel /
  Cloudflare Pages / AWS Amplify)와 Backend(AWS / GCP Cloud Run / Railway /
  Render) 호스팅 플랫폼 선택.
- `docs/DECISIONS.md` **PENDING-007 (당시 DB 호스팅)**: 당시 DB의 운영 위치 선택. 현재 저장소 결정은 DEC-008로 대체됨.

이 결정이 확정되어야 TASK-011(배포 환경 구성 설정 파일)을 정확한 대상
플랫폼 기준으로 구현할 수 있다.

## Context

- `docs/ARCHITECTURE.md` "배포 구조 (예정)"는 운영 환경을 Vercel(Frontend) →
  API Server → Cloud DB 형태로 예시한다(확정 아님).
- `docs/DECISIONS.md` PENDING-006/007은 "Phase 2 배포 준비 시 결정"으로
  표시되어 있다.
- 이 결정은 비용·확장성·운영 복잡도 트레이드오프를 포함하며, 사람의 판단과
  계정/예산 권한이 필요하다.

## Dependencies

- **선행**: 없음 (지금 결정 가능).
- **후속**: TASK-011(배포 환경 구성)은 이 결정 없이는 시작하지 않는다.

## Allowed changes

```
docs/DECISIONS.md        # 사람이 DEC-007 등으로 결정 기록 (사람이 직접 작성)
docs/tasks/TASK-011D.md  # 결정 결과를 Result에 기록
```

- 이 Task는 소스코드를 변경하지 않는다.

## Forbidden changes

- AI/Codex가 플랫폼을 임의로 선택·확정하는 행위
- `frontend/**`, `backend/**`, `docker/**`, `scripts/**` 등 소스코드
- 실제 계정 생성·결제·예약(이 단계는 결정만, 실행은 TASK-011H)

## Acceptance criteria

1. **배포 플랫폼 확정**
   - [x] Frontend 호스팅 플랫폼을 1개 선택한다. → Vercel.
   - [x] Backend 호스팅 플랫폼을 1개 선택한다(또는 Backend 미배포로 Phase 2
     범위를 한정하는 결정을 내린다). → Railway.
2. **DB 호스팅 확정**
   - [x] 당시 DB 호스팅 방식을 선택했다. 현재 저장소·운영 구성은 DEC-008을 따른다.
3. **결정 기록**
   - [x] 이 문서 Result에 선택 결과를 요약한다.
   - [ ] 선택 결과와 근거를 `docs/DECISIONS.md`에 DEC 항목으로 기록한다(사람이
     직접 작성). PENDING-006/007 상태를 "해소됨"으로 갱신한다. — **이번
     갱신 범위 밖**(Allowed changes에 따라 사람이 직접 작성). 아래 Result
     "미반영 항목" 참고.

## Verification commands

```bash
# 사람이 결정 기록 여부를 확인한다 (자동 검증 아님)
grep -n "PENDING-006\|PENDING-007\|DEC-007" docs/DECISIONS.md
```

## Stop conditions

1. AI/Codex가 이 결정을 대신 내리도록 요청받는 경우 — 결정은 사람의 몫이므로
   중단하고 사람 확인을 요청한다.

## Result

**결정 확정 (2026-06-13)**:

- Frontend: Vercel
- Backend API: Railway
- Database: 당시 Railway DB 선택 (현재 결정은 DEC-008로 대체됨)
- 향후 Analysis Worker: Railway의 별도 서비스
- 향후 Scheduler: Railway Cron Job
- 저장소 연결: 비공개 GitHub 저장소 사용

**초기 배포 범위**:

- 초기 목적: Riot VALORANT Production API 신청용 공개 프로토타입 배포.
- 초기 배포에서는 Mock 데이터와 Mock Riot API Adapter(TASK-014
  `MockRiotApiAdapter`, `valorant.riot.adapter=mock`)를 사용한다.
- 실제 Riot API 키, RSO, 랭커 데이터 수집, 분석 Worker 구현은 Production
  Key 승인 이후 또는 별도 Task에서 진행한다.
- 공개 프로토타입 포함 화면: `/`(전적검색), `/players/[puuid]`(프로필),
  `/matches/[matchId]`(경기 상세), `/privacy`, `/terms`, `/connect`.
- 사용자 비밀번호나 Riot 로그인 정보를 직접 수집하지 않는다(`/connect`는
  연결 예정 안내만 표시하며 버튼은 비활성 상태 — TASK-015).

**실행 책임**:

- 실제 배포·외부 로그인·환경변수 입력 등 운영 실행은 TASK-011H에서 사람이
  수행한다. AI/Codex는 이 결정 자체를 내리지 않았으며, 사람이 확정한 결과를
  문서에 반영했을 뿐이다.

**후속 Task**:

- 이 결정에 따라 TASK-011(배포 환경 구성)이 BLOCKED에서 READY로 전환됐다
  (`docs/PLAN.md` Phase 2 참고).

**미반영 항목 (참고)**:

- `docs/DECISIONS.md`의 PENDING-006/007을 "해소됨"으로 갱신하고 DEC 항목을
  추가하는 작업은 Allowed changes에 "사람이 직접 작성"으로 명시되어 있어
  이번 문서 갱신 범위에 포함하지 않았다. 필요 시 별도로 진행한다.
