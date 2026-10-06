# TASK-FE-027 — 라인업·스모크 테마 Visual QA

## 기준과 범위

- 기준 `f3efedf` / 브랜치 `codex/lineup-smoke-theme`.
- Before는 제품 파일 수정 전에 Playwright로 캡처했다. 참조는 현재 홈의 StatsShell·StatsHeader·StatsFooter·공통 테마다.
- 1440×960, 820×960, 390×844 / Chromium / DPR 1 / 애니메이션 축소. 두 페이지의 맵 목록과 Ascent 선택 상태를 각각 확인했다.
- 라인업 화면 비교에서는 공개 목록 요청에 통제한 503을 반환하여 동일한 기존 Preview를 사용했다. 기능 검사는 성공·빈 배열·실패 응답을 별도로 검증했다. 실제 운영 서버는 수정하지 않았다.
- 홈·프로필은 1440px에서 전체 화면과 DOM·배치·스타일을 비교했다.

## 전후 비교

| 화면 | Before | After |
|---|---|---|
| 라인업 맵 목록 1440 | [이전](assets/TASK-FE-027/before-1440-lineups-index.png) | [이후](assets/TASK-FE-027/after-1440-lineups-index.png) |
| 라인업 선택 1440 | [이전](assets/TASK-FE-027/before-1440-lineups-ascent.png) | [이후](assets/TASK-FE-027/after-1440-lineups-ascent.png) |
| 스모크 맵 목록 1440 | [이전](assets/TASK-FE-027/before-1440-smokes-index.png) | [이후](assets/TASK-FE-027/after-1440-smokes-index.png) |
| 스모크 선택 1440 | [이전](assets/TASK-FE-027/before-1440-smokes-ascent.png) | [이후](assets/TASK-FE-027/after-1440-smokes-ascent.png) |
| 라인업 선택 820 | [이전](assets/TASK-FE-027/before-820-lineups-ascent.png) | [이후](assets/TASK-FE-027/after-820-lineups-ascent.png) |
| 스모크 선택 820 | [이전](assets/TASK-FE-027/before-820-smokes-ascent.png) | [이후](assets/TASK-FE-027/after-820-smokes-ascent.png) |
| 라인업 선택 390 | [이전](assets/TASK-FE-027/before-390-lineups-ascent.png) | [이후](assets/TASK-FE-027/after-390-lineups-ascent.png) |
| 스모크 선택 390 | [이전](assets/TASK-FE-027/before-390-smokes-ascent.png) | [이후](assets/TASK-FE-027/after-390-smokes-ascent.png) |

맵 목록의 820/390px 캡처와 홈·프로필 회귀 캡처는 같은 [산출물 폴더](assets/TASK-FE-027)에 있다. 총 Before 14장, 대응 After 14장과 API 상태·키보드 초점 추가 캡처를 기록했다.

## 직접 시각 평가와 보완

- 흰색 표면·흐린 기존 헤더를 홈의 브랜드 바·검색 메뉴·어두운 표면으로 연결했다. 중복 헤더/푸터와 중첩 main은 없다.
- 일반 조작은 14px, 비교표·보조 안내는 12px 이상으로 읽힌다. 지도·요원·스킬 자산은 그대로 사용했다.
- 스모크 수치/단위의 줄바꿈, 가이드 설명과 Preview 표시가 작은 화면에서 잘리거나 겹치지 않는다.
- 태블릿의 비교표 옆 빈 공간을 줄이기 위해 진영·사이트·유형을 왼쪽에, 비교표를 오른쪽에 배치했다. 모바일에서는 원래 읽기 순서로 한 열을 사용한다.
- 코드 검토에서 맵 카드 hover가 키보드 초점 윤곽선을 덮는 문제를 발견했다. 명시적 금색 윤곽선을 추가했고, 이미지 내부의 선이 이미지에 가려지는 시각 문제도 발견하여 카드 바깥으로 옮겼다. 최종 실제 Tab+hover 캡처에서 네 화면 모두 금색 선 픽셀을 확인했다.
- 지도 내부 회전·핀의 퍼센트 좌표·경로점은 Before와 동일하다. 경로 표시 순서는 이미지 위, 핀 아래로 정리했다.
- 홈·프로필 1440px PNG의 변경 픽셀은 각각 0이다. 독립 코드 검토에서도 두 탐색 화면 밖으로 새 CSS가 적용되지 않음을 확인했다.

## 기능·회귀 증거

- [Before](assets/TASK-FE-027/before-results.json) / [After](assets/TASK-FE-027/after-results.json): 페이지 오류 및 예상 밖 콘솔 오류 0.
- [기능 검증](assets/TASK-FE-027/state-results.json): 262개 검사 PASS, 17개 레이아웃 조건. 공개 API 성공/빈 결과/503 fallback, 12개 맵, 인라인 맵 변경, 요원/스킬/공수 필터, 다중 시작 위치 선택, 상세 링크, Smoke 사이트/유형/가이드/선택 초기화, 언어와 검색 이동 포함.
- [좌표·픽셀 비교](assets/TASK-FE-027/comparison-results.json): 6개 선택 상태의 핀·경로·회전 동일, 홈/프로필 변경 픽셀 0.
- [초점·보완 배치](assets/TASK-FE-027/focus-layout-results.json): Tab과 hover가 겹친 실제 초점, 표 글자 크기, 태블릿·모바일 배치 확인.
- [소스 보존](assets/TASK-FE-027/source-preservation.json): 라인업 데이터·상태·effect·Preview 계산 부분, 두 필터, globals.css, StatsHeader 변경 없음.

## 실행 명령

Before/초기 After 및 상태 검사는 `/private/tmp/fe027-visual.cjs`, `fe027-state.cjs`, `fe027-compare.py`로 실행했다. 동일 스크립트는 아래 경로에 보관하며 최종 재촬영과 초점 검사는 보관본을 사용한다. 기존 설치된 Playwright/Pillow를 사용했고 패키지를 추가하지 않았다.

```bash
node docs/visual-qa/assets/TASK-FE-027/browser-qa.cjs after
node docs/visual-qa/assets/TASK-FE-027/state-qa.cjs
node docs/visual-qa/assets/TASK-FE-027/focus-layout-qa.cjs
node docs/visual-qa/assets/TASK-FE-027/focus-layout-qa.cjs --focus-only
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 docs/visual-qa/assets/TASK-FE-027/focus-pixels.py
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 docs/visual-qa/assets/TASK-FE-027/compare.py
docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit
docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

Before 명령은 기준 커밋에서만 재실행해야 한다. 현재 코드에서 실행하면 원본 비교 캡처를 덮어쓴다.

개발 서버 복원 후 `node /private/tmp/fe027-post-build.cjs`로 390px 두 경로와 맵/가이드 선택을 재확인했다. [19검사 PASS](assets/TASK-FE-027/post-build-results.json), HTTP 200·가로 넘침 0·브라우저 오류 0. 재현본은 `assets/TASK-FE-027/post-build-qa.cjs`다.

## 현재 판정과 제한

**PASS — 구현·시각·기능·타입·Lint·프로덕션 빌드 검증 완료.**

후속 배치 32검사, 최종 초점 18검사와 [실제 초점선 픽셀 확인](assets/TASK-FE-027/focus-pixel-results.json)도 통과했다. 빌드는 컴파일·타입/Lint·정적 12페이지 생성까지 통과했다. 컨테이너의 기존 `git: not found` 안내는 빌드 실패가 아니며 종료 코드는 0이다.

- 데이터 정확성/패치 검증·실제 운영 API 가용성·Railway/Vercel 배포는 이번 검증 범위가 아니다.
- Smoke 수치/좌표는 기존 Preview다. 라인업 결과가 없는 경우의 기존 표시 방식과 독립 상세 페이지 디자인은 유지한다.
- 공통 헤더/푸터 언어 선택은 유지하지만 탐색 본문 번역 범위는 넓히지 않는다.
- Cursor의 별도 리뷰와 사용자 디자인 검토는 아직 수행한 것으로 간주하지 않는다.
