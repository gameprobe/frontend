# TASK-013: 이용약관 페이지

## Status

DONE (2026-06-13)

## Goal

`docs/PLAN.md` Phase 2 완료 기준 "...이용약관 페이지 존재"를 위해, Frontend에
이용약관 페이지를 구현하고 **초안 문구**를 렌더링한다. 법적 효력이 있는
**최종 문구 확정·승인은 TASK-013H(사람)**가 수행하며, 이 Task는 페이지 구조와
초안 렌더링까지만 담당한다.

이 Task는 다음을 수행한다:

1. 새 라우트 `frontend/src/app/terms/page.tsx`를 생성한다.
2. 이용약관 초안 콘텐츠(서비스 정의, 이용 조건, 금지 행위, 책임 제한,
   준거법/분쟁, 약관 변경, 문의처 등 섹션 골격)를 렌더링한다. 문구는 초안임을
   명시한다.
3. 접근을 위한 최소 링크 경로를 마련한다(TASK-012와 동일 패턴, 기존 홈 산출물
   미수정).

다음은 범위가 아니다:

- 법적 최종 문구 확정·승인 (TASK-013H, 사람)
- 개인정보처리방침 페이지 (TASK-012)
- 배포 (TASK-011/011H)

## Context

- `docs/SPEC.md` Phase 2 완료 기준에 "개인정보처리방침, 이용약관 페이지 존재".
- **Phase 1(TASK-006~010) DONE.** 라우트/컴포넌트/스타일 패턴은 TASK-012와
  동일하게 따른다.
- TASK-012(개인정보처리방침)와 구조가 대칭이다. 공용 법률 문서 표시 컴포넌트를
  TASK-012에서 만들었다면 재사용할 수 있다(없으면 신규 작성).

## Dependencies

- **선행**: TASK-010 (경기 상세) — DONE. (Frontend 베이스라인 확보.)
- **권장 동반**: TASK-012(개인정보처리방침 페이지) — 공용 컴포넌트 재사용 시.
- **후속**: TASK-013H(법률 문서 최종 승인)가 최종본을 확정한다. TASK-011H/
  TASK-015H가 공개 URL을 사용한다.

## Allowed changes

```
frontend/src/app/terms/page.tsx       # 신규: 이용약관 라우트
frontend/src/components/**             # 신규/재사용: 법률 문서 표시용 공용 컴포넌트
docs/tasks/TASK-013.md                 # Result 갱신
```

- TASK-006 산출물(`frontend/src/types/**`, `frontend/src/data/**`,
  `frontend/src/lib/**`)은 수정하지 않는다.
- TASK-007 홈 산출물과 `layout.tsx`는 수정하지 않는다.

## Forbidden changes

- `frontend/src/types/**`, `frontend/src/data/**`, `frontend/src/lib/**`
- `frontend/src/app/page.tsx`, `frontend/src/app/layout.tsx`,
  `frontend/src/app/globals.css`, `frontend/src/components/HomeSearch.tsx`
- 개인정보처리방침 페이지 라우트(TASK-012의 `privacy/page.tsx`) — 단, 공용
  컴포넌트는 공유 가능
- 배포 설정(TASK-011)
- `backend/**`, `docker/**`, `scripts/**`
- `frontend/package.json`, `frontend/package-lock.json`
- `AGENTS.md`, `CLAUDE.md`, `docs/PLAN.md`, `docs/PROGRESS.md`, 기존 Task 문서

## Acceptance criteria

1. **라우트 렌더링**
   - [x] `frontend/src/app/terms/page.tsx`가 `/terms`에서 렌더링된다.
   - [x] 이용약관 초안 섹션(서비스 정의/이용 조건/금지 행위/책임 제한/준거법/
     약관 변경/문의처 등) 골격을 표시한다.
2. **초안 표기**
   - [x] 문구가 초안이며 최종 문구는 TASK-013H에서 확정됨을 페이지에 명시한다.
3. **빌드 및 정적 검사**
   - [x] `cd frontend && npx tsc --noEmit` 성공.
   - [x] `cd frontend && npm run lint` 성공.
   - [x] `cd frontend && npm run build` 성공.
4. **범위 확인**
   - [x] `git status --porcelain -- frontend/src/types frontend/src/data
     frontend/src/lib` 출력이 비어 있다.
   - [x] `git status --porcelain -- frontend/src/app/page.tsx
     frontend/src/app/layout.tsx frontend/src/app/globals.css
     frontend/src/components/HomeSearch.tsx` 출력이 비어 있다.
   - [x] `git status --porcelain -- frontend/package.json
     frontend/package-lock.json backend docker scripts` 출력이 비어 있다.

## Verification commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
cd .. && git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib
git status --porcelain -- frontend/src/app/page.tsx frontend/src/app/layout.tsx frontend/src/app/globals.css frontend/src/components/HomeSearch.tsx
git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts
git status --porcelain -- frontend/src/app/terms frontend/src/components
```

## Stop conditions

1. 사람의 시작 승인이 없는 경우 — 시작 중단.
2. 초안 문구를 넘어 법적 최종 문구 확정이 요구되는 경우 — TASK-013H로 넘긴다.
3. 새 npm 패키지 설치가 필요한 경우.
4. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

## Result

DONE (2026-06-13)

### Changed files

- `frontend/src/app/terms/page.tsx`
  - `/terms` 라우트를 생성했다.
  - 이용약관 초안 섹션을 렌더링한다: 서비스 정의, 이용 조건, 금지 행위,
    책임 제한, 준거법 및 분쟁, 약관 변경, 문의처.
  - 페이지 본문에 이 문서가 초안이며 최종 문구는 TASK-013H에서 사람의 법률
    검토와 승인을 거쳐 확정된다고 명시했다.
- `docs/tasks/TASK-013.md`
  - Status, Acceptance criteria, Result를 실제 결과에 맞게 갱신했다.

### Verification results

- `cd frontend && npx tsc --noEmit` — 성공.
- `cd frontend && npm run lint` — 성공.
- `cd frontend && npm run build` — 성공. Build output에서 `/terms` 라우트가
  생성됨을 확인했다.
- `git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib`
  — 출력 없음.
- `git status --porcelain -- frontend/src/app/page.tsx frontend/src/app/layout.tsx frontend/src/app/globals.css frontend/src/components/HomeSearch.tsx`
  — 출력 없음.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`
  — 출력 없음.
- `git status --porcelain -- frontend/src/app/terms frontend/src/components`
  — 허용된 신규 `frontend/src/app/terms/page.tsx`만 출력됨.

### Notes

- `npx tsc --noEmit` 실행 중 `frontend/tsconfig.tsbuildinfo`가 생성되었으나,
  TASK-013 허용 범위 밖 검증 산출물이므로 최종 작업 트리에서 제거했다.
- 법적 최종 문구 확정은 TASK-013H 사람 검토 대상이며, 이 Task에서는 초안
  렌더링까지만 수행했다.
