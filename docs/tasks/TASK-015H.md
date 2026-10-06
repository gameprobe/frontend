# TASK-015H: Riot Developer Portal 신청 제출

## Status

HUMAN-REQUIRED (사람 수행 필요 — 자동 구현 대상 아님)

> Riot Developer Portal **신청 제출은 사람이 직접 수행**한다. AI/Codex는
> 신청에 필요한 자료 준비(설명, URL 정리)까지만 보조하며, 계정 로그인·신청서
> 제출을 대신하지 않는다.

## Goal

`docs/PLAN.md` Phase 2 목표 "Riot Production API 신청 준비"의 최종 단계로,
배포된 사이트와 승인된 법률 문서를 근거로 **Riot Developer Portal에 Production
API 신청서를 사람이 제출**한다.

## Context

- `docs/SPEC.md` 1차 목표: "Riot Production API 신청 준비".
- 신청에는 일반적으로 공개 서비스 URL, 개인정보처리방침/이용약관 URL, 제품
  설명, 데이터 사용 목적 등이 필요하다.
- 이 단계는 요청서에 명시된 사람 작업 "Riot Developer Portal 신청 제출"에
  해당한다.

## Dependencies

- **선행**:
  - TASK-011H (운영 배포 실행) — 공개 접근 가능한 서비스 URL 필요.
  - TASK-013H (법률 문서 최종 승인) — 공개 개인정보처리방침/이용약관 URL 필요.
  - TASK-015 (Riot 계정 연결 예정 흐름 UI) — 신청 심사에 도움이 되는 흐름
    제시(필수 아님, 권장).
- **후속**: Phase 4(실제 Riot API/RSO 연동)는 신청 승인 이후 진행한다(이
  Task 범위 밖).

## Allowed changes

```
docs/tasks/TASK-015H.md   # 신청 준비 자료 목록과 제출 결과(신청 일시/상태)를 기록
```

- 비밀정보(클라이언트 시크릿 등)는 문서에 기록하지 않는다.
- 소스코드는 변경하지 않는다.

## Forbidden changes

- AI/Codex가 Riot 계정 로그인·신청서 작성·제출을 대신 수행
- 발급 예정 API 키/시크릿을 저장소/문서에 평문 저장
- 소스코드(`frontend/**`, `backend/**`, `docker/**`, `scripts/**`) 변경

## Acceptance criteria

1. **신청 자료 준비**
   - [ ] 공개 서비스 URL, 개인정보처리방침 URL, 이용약관 URL, 제품 설명,
     데이터 사용 목적을 정리한다(AI 보조 가능).
2. **제출**
   - [ ] 사람이 Riot Developer Portal에 로그인해 Production API 신청서를
     제출한다.
3. **결과 기록**
   - [ ] 신청 일시와 신청 상태(제출 완료/심사 대기 등)를 Result에 기록한다
     (비밀정보 제외).

## Verification commands

```bash
# 공개 URL이 신청 자료로 사용 가능한지 사람이 확인 (예시 — 실제 도메인으로 대체)
curl -I https://<배포-도메인>/privacy
curl -I https://<배포-도메인>/terms
```

## Stop conditions

1. AI/Codex가 신청서 제출/계정 로그인을 대신 수행하도록 요청받는 경우 —
   중단하고 사람 수행을 요청한다.
2. 선행(배포/법률 승인)이 완료되지 않아 필수 URL이 없는 경우 — 선행 Task
   완료 대기.

## Result

_Pending — 사람 수행 대기 (TASK-011H, TASK-013H 이후)._
