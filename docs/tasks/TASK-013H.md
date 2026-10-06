# TASK-013H: 개인정보처리방침·이용약관 법률 검토 및 최종 승인

## Status

HUMAN-REQUIRED (사람 수행 필요 — 자동 구현 대상 아님)

> 법률 문서의 **최종 문구 확정과 승인은 사람의 책임**이다. AI/Codex는 초안
> 렌더링(TASK-012/013)까지만 수행하며, 법적 효력이 있는 최종 문구를 단독으로
> 확정하지 않는다.

## Goal

TASK-012(개인정보처리방침)와 TASK-013(이용약관)이 페이지에 렌더링한 초안
문구를 검토하고, 운영 공개에 사용할 **최종 문구를 사람이 확정·승인**한다.
이는 Riot Production API 신청과 운영 배포의 선행 조건이다.

## Context

- `docs/SPEC.md` Phase 1-2 화면 목록 외, Phase 2 완료 기준에 "개인정보처리방침,
  이용약관 페이지 존재"가 포함된다.
- Riot Developer Portal 신청(TASK-015H)은 개인정보처리방침/이용약관 공개
  URL을 요구하는 것이 일반적이므로, 최종 승인된 문서가 필요하다.
- 이 단계는 요청서에 명시된 사람 작업 "법률 문서의 최종 승인"에 해당한다.

## Dependencies

- **선행**: TASK-012(개인정보처리방침 페이지), TASK-013(이용약관 페이지) —
  초안 문구가 페이지에 렌더링되어 있어야 한다.
- **후속**: TASK-011H(운영 배포), TASK-015H(Riot 신청 제출)는 승인된 최종
  문서를 전제로 한다.

## Allowed changes

```
frontend/src/app/privacy/**   # 사람이 승인한 최종 문구 반영 (사람 지시에 따른 텍스트 확정)
frontend/src/app/terms/**     # 사람이 승인한 최종 문구 반영
docs/tasks/TASK-013H.md       # 검토·승인 결과 기록
```

- 문구(텍스트 콘텐츠) 확정에 한정한다. 레이아웃/라우팅 구조 변경은 TASK-012/013
  범위다.

## Forbidden changes

- AI/Codex가 법적 효력 문구를 단독으로 최종 확정·승인하는 행위
- 페이지 텍스트 외 소스코드(`backend/**`, `docker/**`, `scripts/**`,
  라우팅/컴포넌트 구조) 변경
- 패키지 파일 변경

## Acceptance criteria

1. **검토**
   - [ ] 사람이 개인정보처리방침/이용약관 초안 문구를 검토한다(필요 시 법률
     자문 포함).
2. **최종 문구 확정**
   - [ ] 승인된 최종 문구를 `frontend/src/app/privacy`,
     `frontend/src/app/terms` 페이지에 반영한다(사람 지시 기준).
3. **승인 기록**
   - [ ] 승인자, 승인 일시, 근거(버전/출처)를 Result에 기록한다.

## Verification commands

```bash
# 페이지가 최종 문구로 빌드되는지 확인
cd frontend && npx tsc --noEmit && npm run lint && npm run build
```

## Stop conditions

1. AI/Codex가 법률 문서를 단독 승인하도록 요청받는 경우 — 중단하고 사람
   승인을 요청한다.
2. 최종 문구가 확정되지 않아 페이지 반영이 불가능한 경우 — 사람 입력 대기.

## Result

_Pending — 사람 검토·승인 대기 (TASK-012, TASK-013 이후)._
