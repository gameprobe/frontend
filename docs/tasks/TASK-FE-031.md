# TASK-FE-031 — 단독 경기 상세 화면의 공통 메뉴 보완

## Status
IMPLEMENTED — 검증 완료, 사용자 요청으로 PR 제출·병합 검토 진행

## Goal
새 데이터 데모의 ‘이 경기 새 탭에서 보기’로 여는 단독 경기 화면에서 홈·Overview·Lineups·Smokes로 이동할 수 있게 한다.

## Baseline / authorization
- 사용자: “단독 경기 상세 화면의 메뉴 보완 작업만 수행하도록 하자.”
- PR #24 병합본 `6f3e131`을 `codex/frontend-rework`에 fast-forward로 반영하고 `codex/standalone-match-navigation`에서 진행한다. 시작 작업 트리 clean.
- 관리자/이미지/프로필 하단 메뉴 작업은 보류한다. 후속 사용자 요청 “여기까지 한것들 pr 올려줘”에 따라 커밋·푸시 및 codex/frontend-rework 대상 PR을 제출한다. 병합은 사용자가 수행한다.

## Scope
- `SyntheticMatchPage` 성공 화면에 기존 `StatsHeader`와 `createMainNavigation`을 재사용한다.
- Search는 홈 검색으로, Overview는 기존 디자인 데모로 연결한다. 기존 새 데이터 데모 복귀 링크와 닫기 동작은 유지한다.
- 공통 Language/More 메뉴를 기존 방식으로 제공한다. 경기 내용·5개 탭·공유·모달은 변경하지 않는다.

## Allowed changes
- `frontend/src/features/tracker-profile/SyntheticMatchPage.tsx`
- `docs/tasks/TASK-FE-031.md`
- `docs/visual-qa/TASK-FE-031.md`
- `docs/visual-qa/assets/TASK-FE-031/**`
- `docs/frontend/PLAN.md`, `docs/PROGRESS.md`
- `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md`의 공통 상태·Codex Implementation
- `/private/tmp/fe031-*`

## Out of scope
프로필 배너 하단 메뉴, 모달 UI·공유 패널·통계·데이터·이미지, 기존 단독 경기 화면, 백엔드·관리자 인증, API·DB·의존성·전역 CSS·배포.

## Acceptance criteria
- 새 탭 경기 화면에 공통 메뉴가 한 번 표시되며 Home → Overview → Lineups → Smokes 순서를 따른다.
- 메뉴 이동·Search·More Escape/초점 복원·언어 선택이 동작한다.
- 경기 데이터·5개 탭과 새 탭 URL의 경기/선수, 복귀/닫기 목적지가 유지된다.
- 1440/820/390px에서 문서 가로 넘침이나 메뉴/본문 겹침이 없다. 경기 표의 내부 스크롤은 유지한다.
- 기존 프로필 경기 모달과 오류 화면은 바뀌지 않는다.
- Before/After Playwright 캡처와 시각 보고서, 타입·Lint·production build 검증을 완료한다.

## Verification commands
```bash
node docs/visual-qa/assets/TASK-FE-031/verify.cjs before
node docs/visual-qa/assets/TASK-FE-031/verify.cjs after
docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit
docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

## Result
### 변경 파일과 결과
- `frontend/src/features/tracker-profile/SyntheticMatchPage.tsx`: 성공한 단독 경기 화면에 공통 StatsHeader/createMainNavigation 연결 및 More 열림 상태 추가. 용도 주석 포함.
- `docs/tasks/TASK-FE-031.md`, `docs/frontend/PLAN.md`, `docs/PROGRESS.md`.
- `docs/visual-qa/TASK-FE-031.md`, `docs/visual-qa/assets/TASK-FE-031/verify.cjs`, before/after/regression/post-build JSON과 PNG17장.
- `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md` (ignored).

### 실행 명령·검증
- `git fetch origin`, `git switch codex/frontend-rework`, `git pull --ff-only origin codex/frontend-rework`, `git switch -c codex/standalone-match-navigation`: PASS, 기준 `6f3e131`.
- Verification commands 전체 PASS. 타입 검사, ESLint 경고·오류0, production build 정적12페이지 생성 및 개발 서버 복원 완료.
- Playwright Before/After8쌍+모바일 공유 접근1장. 1440/820/390px 메뉴·본문 겹침/문서 가로 넘침/브라우저 예외0.
- 실제 새 탭 열기와 경기/선수 URL 보존, 공통 메뉴 4개/Search/복귀/닫기 이동, More Escape·초점 복원, 언어 변경 PASS.
- 3개 폭의 경기 5탭 본문, 다른 선수 화면의 본문/공유 주소가 변경 전과 동일하다.
- 기존 모달 desktop/mobile·없는 경기 안내·구 경기 화면 PNG4쌍 byte 동일.
- 직접 이미지 대조와 독립 에이전트 코드·화면 리뷰 PASS. 별도 Cursor 검증을 수행한 것은 아니다.
- 컨테이너의 기존 `git: not found` 출력은 버전 확인 단계에서 발생했으며 lint/build 성공을 방해하지 않았다.

### 남은 제한
- 이번 범위 미해결 없음. 기존 모달 높이/내부 스크롤을 유지해 모바일 단독 화면은 문서 스크롤로 하단 공유 버튼에 도달한다.
- 이미지·프로필 하단 메뉴·관리자·백엔드·API·데이터·배포를 변경하지 않았다. 사용자 요청에 따라 커밋/푸시/PR을 진행하며 병합·배포는 수행하지 않는다.
