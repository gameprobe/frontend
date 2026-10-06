# TASK-FE-028 — 공통 메뉴 구성 Visual QA

## 기준과 검증 환경

- Before 기준 `df4d078` (PR #21 병합), 작업 브랜치 `codex/shared-navigation`.
- 참조: 사용자가 제공한 홈·오버뷰 캡처와 합의한 Search 옆 메뉴 순서. Lineups·Smokes는 기존 메뉴 바로 뒤에 이어 배치한다.
- Playwright Chromium, DPR 1, reduced motion, 1440×960 / 820×960 / 390×960. 제품 수정 전 Before 12장, 완료 후 대응 After 12장, 키보드 초점 6장.
- 라인업 요청만 통제된 503 응답으로 기존 Preview를 사용했다. 백엔드 상태나 데이터 정확성을 검증한 결과가 아니다.

## 전후 화면

| 화면 | Before | After |
|---|---|---|
| 홈 1440 | [이전](assets/TASK-FE-028/before-1440-home.png) | [이후](assets/TASK-FE-028/after-1440-home.png) |
| 프로필 1440 | [이전](assets/TASK-FE-028/before-1440-profile.png) | [이후](assets/TASK-FE-028/after-1440-profile.png) |
| 라인업 1440 | [이전](assets/TASK-FE-028/before-1440-lineups.png) | [이후](assets/TASK-FE-028/after-1440-lineups.png) |
| 스모크 1440 | [이전](assets/TASK-FE-028/before-1440-smokes.png) | [이후](assets/TASK-FE-028/after-1440-smokes.png) |
| 홈 390 | [이전](assets/TASK-FE-028/before-390-home.png) | [이후](assets/TASK-FE-028/after-390-home.png) |
| 프로필 390 | [이전](assets/TASK-FE-028/before-390-profile.png) | [이후](assets/TASK-FE-028/after-390-profile.png) |
| 라인업 390 | [이전](assets/TASK-FE-028/before-390-lineups.png) | [이후](assets/TASK-FE-028/after-390-lineups.png) |
| 스모크 390 | [이전](assets/TASK-FE-028/before-390-smokes.png) | [이후](assets/TASK-FE-028/after-390-smokes.png) |

820px 대응 캡처와 키보드 화면은 [산출물 목록](assets/TASK-FE-028/manifest.json)에 있다.

## 시각 평가와 변경 확인

- 데스크톱 프로필의 순서는 Home → Overview → Matches → Performance → Agents → Maps → Weapons → Lineups → Smokes다. More는 기존 오른쪽 위치를 유지한다.
- 홈·라인업·스모크는 Home → Overview → Lineups → Smokes를 사용한다. 현재 위치를 같은 붉은 밑줄로 표시한다.
- Before에서는 820px 프로필의 마지막 전적 버튼 3개, 390px에서는 전적 버튼 전체를 CSS로 숨겼다. After에서는 모든 항목을 가로 스크롤로 접근한다. 페이지 자체는 가로로 넘치지 않는다.
- [390px 마지막 메뉴 초점](assets/TASK-FE-028/after-keyboard-profile-390.png)을 직접 확인했다. Tab 이동 시 Smokes 전체와 금색 초점선이 메뉴 영역에 들어오고 More 버튼도 보인다. 기존/합성 프로필 및 3개 폭에서 30개 초점·배치 확인을 통과했다.
- 12개 대응 화면의 헤더 위치·높이는 동일하다. 프로필은 3개 폭 모두 헤더 아래 픽셀 차이 0이다. 나머지 화면의 헤더 아래 차이는 최대 82픽셀로 기록했으며, 직접 시각 검토에서 본문 배치 붕괴·글자 겹침을 발견하지 못했다. [픽셀 비교 결과](assets/TASK-FE-028/comparison.json)
- 메뉴 목록 외 본문과 상태 훅·탐색 페이지·전역 CSS·package.json의 소스 보존 9개 확인이 통과했다. [소스 보존 결과](assets/TASK-FE-028/source-preservation.json)

## 기능 검증

[메뉴 회귀 결과](assets/TASK-FE-028/navigation-results.json): **498개 검사 PASS**, 홈·기존 프로필·합성 프로필·라인업·스모크 × 3개 폭, 총 15개 조건.

- 메뉴 순서·단일 현재 위치·문서 가로 넘침 0.
- 기존/합성 프로필 전적 6탭 실제 전환, 플레이어 URL 유지 및 본문 탭 선택 동기화.
- 키보드 Tab으로 Lineups/Smokes 접근, Enter로 실제 페이지 이동. Home/Overview 목적지와 기존 디자인 데모 진입 유지.
- More 열기 → 내부 링크 초점 → Escape 닫기 및 버튼 초점 복원. 기존 privacy/terms/connect 목적지 유지.
- 홈 검색 앵커, 탐색 페이지 홈 검색 이동, 프로필 입력/데모 안내 및 Language 한국어·영어 전환 정상.
- 브라우저 예외·예상 밖 콘솔 오류 0. 의도한 라인업 503 응답만 기록했다.

## 실행 기록

```bash
node docs/visual-qa/assets/TASK-FE-028/capture.cjs before
node docs/visual-qa/assets/TASK-FE-028/capture.cjs after
node docs/visual-qa/assets/TASK-FE-028/navigation-qa.cjs
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 docs/visual-qa/assets/TASK-FE-028/compare.py
docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit
docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build
docker compose -f docker/compose.frontend.yml up -d frontend
node docs/visual-qa/assets/TASK-FE-028/post-build.cjs
git diff --check
```

- Before 첫 실행은 이미지 decode 대기가 끝나지 않아 중단했다. 촬영 도구의 이미지 대기에 4초 상한을 두고 제품 수정 전에 12장을 모두 재촬영했다. 제품 코드는 이 문제로 변경하지 않았다.
- Playwright는 일반 샌드박스의 브라우저 실행 제한 때문에 로컬 실행 권한으로 실행했다. 새 패키지는 설치하지 않았다.
- 타입·Lint·build 통과. build는 컴파일·타입/Lint·정적 12페이지 생성까지 완료했다. 컨테이너의 기존 `git: not found` 안내와 관계없이 종료 코드 0이다.
- 개발 서버 복원 후 네 모바일 경로의 HTTP 200·마지막 두 메뉴·현재 위치·가로 넘침·페이지 오류 확인 PASS. 실제 결과는 [복원 확인](assets/TASK-FE-028/post-build.json)에 기록했다.

## 판정과 제한

**PASS — 메뉴 구현·시각·기능 검증 통과.** 별도 코드 검토에서도 범위 침범과 회귀를 발견하지 못했다. Cursor의 별도 리뷰를 수행한 것으로 간주하지 않는다.

작은 화면에서는 모든 메뉴가 한 번에 보이는 대신 메뉴 영역을 가로로 이동한다. 프로필 본문 탭·상단 브랜드 바·API 상태 안내·데모 데이터·관리자 및 독립 상세 페이지는 이번 변경 대상이 아니다. 사용자가 화면을 확인하고 커밋·푸시·PR 제출을 요청했으며, 병합은 사용자 검토 후 수행한다.
