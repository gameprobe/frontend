# TASK-FE-020 Visual QA — 프로필 공통 스타일

## 결과

PASS — 최종 Before/After 30쌍의 픽셀 차이 0. 전체 DOM·계산 스타일·좌표·스크롤 크기·ARIA 58상태가 동일하다.
기준은 PR #12 병합 `1863a99`, 작업 브랜치는 `codex/profile-shared-styles`다.
현재 화면을 기준으로 한 코드 정리이며 새 디자인이나 참고 이미지 변경은 없다.

## 방법과 범위

- Playwright Chromium, 100% 배율(DPR 1), reduced motion, 글꼴과 이미지 로딩 완료 후 촬영.
- 데스크톱 1728×941 / 모바일 390×844. 프로필 본문 캡처는 전체 페이지로 기록해 사이드바와 하단까지 비교했다.
- Overview/Matches/Performance/Agents/Maps/Weapons 6탭, Show More, 경기 필터·추가 표시, Act/Deathmatch, 경기/맵 빈 결과와 초기화, 무기 표 포커스/가로 스크롤.
- 홈과 경기 상세 모달도 대조. 모달 5탭·Escape 닫기·원래 경기 버튼 포커스 복원을 확인했다.
- 320/700/701/1000/1001/1250/1251/1440/1500/1920px에서 Overview/Weapons 20조건을 추가 대조하고 문서 가로 넘침이 없음을 확인했다.
- CSS Module의 해시 클래스는 비교에서 제외하고 실제 적용 스타일·DOM·수치·동작을 비교했다.

## 시각적 검토

독립 보조 에이전트가 PC/모바일 Overview의 Before/After를 직접 열고 확대해서 비교했다.
카드, 제목, 요원 표, 경기 행, 하단 사이드바에 새 겹침·여백·색상·글꼴 차이를 발견하지 못했다.
구현자도 경기 상세 비교 캡처를 직접 확인했다. 별도 Cursor 리뷰를 실행한 결과는 아니다.

## 캡처 안정성 확인

첫 자동화 시 Console/Competitive에도 2개 표본이 있음을 확인했다. 제품 소스를 바꾸지 않고
실제로 표본이 없는 Console/Premier 조합으로 테스트 조건을 바로잡은 뒤 Before를 기록했다.

첫 모달 After 캡처에서 왼쪽 둥근 모서리 18픽셀에 채널 최대 5의 차이가 있었으며,
서버 재시작 후에도 남아 원본/변경본의 통제 재촬영을 진행했다. 허용 소스만 일시적으로
원본으로 복원해 촬영하고 모든 작업 파일을 바이트 단위로 복원한 뒤 같은 순서로 After를 촬영했다.
원본 재촬영 15장은 기존 Before와 동일했고, 변경본 15장도 원본과 픽셀까지 동일했다.
해당 최종 After를 사용해 엄격한 픽셀 비교를 다시 통과했다. Before를 교체하거나 비교 허용치를 늘리지 않았다.
초기 차이 캡처는 [진단 자료](assets/TASK-FE-020/diagnostic-first-after-desktop-modal-scoreboard.png)로 보존했다.
제품 코드 수정 없이 재촬영에서 사라진 캡처 차이로 판단하며, 계산 스타일은 모든 실행에서 동일했다.

## 실행 명령과 실제 결과

- `node /tmp/fe020-visual.cjs before` / `after`: PASS — 58상태 동일, 브라우저 pageerror 0.
- 번들 Python `/tmp/fe020-pixels.py`: PASS — 최종 30쌍 픽셀 차이 0.
- `node /tmp/fe020-control-run.cjs`: PASS — 원본/변경본 19상태 동일, 모든 작업 파일 정확히 복원. 재촬영 15쌍과 기존 Before 동일성도 검증.
- `python3 /tmp/fe020-static-audit.py`: PASS — 공통 30선언 블록, 페이지 로컬 CSS, 부모 TSX import/class-only, 자식11개 import-only, 사용처 주석 변경 확인.
- 독립 소스 리뷰: 기존 CSS 91개 규칙의 값과 미디어 조건 보존, Performance 그래프 표식의 2클래스 우선순위 및 필터/제목 표식 보존 확인.
- Task에 명시한 Docker의 Mock·상세 Mock·누락 SSR·`npx tsc --noEmit`·`npm run lint`·`npm run build`: PASS. Lint 경고/오류 0, 정적 페이지 11개 생성.
- 개발 서버 재실행과 `node /tmp/fe020-smoke.cjs`: PASS — HTTP200·모달5탭·1400px 폭·44px 닫기·12px 최소 글자·Escape·스크롤 잠금 해제.
- `git diff --check`: PASS.

Node/Python은 번들 런타임을 사용했다. 전체 수치와 소스 SHA-256은 [verification.json](assets/TASK-FE-020/verification.json)에 기록했다.
컨테이너의 `git: not found` 메타데이터 경고는 기존 경고이며 빌드는 통과했다.
홈·라인업·Mock·자산·API·배포·모달 소스는 이번에 변경하지 않았다. 실제 API나 배포는 검증하지 않았다.

## Before / After 파일

| 상태 | Before | After | 결과 |
|---|---|---|---|
| desktop-act | [Before](assets/TASK-FE-020/before-desktop-act.png) | [After](assets/TASK-FE-020/after-desktop-act.png) | 픽셀 동일 |
| desktop-agents | [Before](assets/TASK-FE-020/before-desktop-agents.png) | [After](assets/TASK-FE-020/after-desktop-agents.png) | 픽셀 동일 |
| desktop-deathmatch | [Before](assets/TASK-FE-020/before-desktop-deathmatch.png) | [After](assets/TASK-FE-020/after-desktop-deathmatch.png) | 픽셀 동일 |
| desktop-empty-maps | [Before](assets/TASK-FE-020/before-desktop-empty-maps.png) | [After](assets/TASK-FE-020/after-desktop-empty-maps.png) | 픽셀 동일 |
| desktop-empty-matches | [Before](assets/TASK-FE-020/before-desktop-empty-matches.png) | [After](assets/TASK-FE-020/after-desktop-empty-matches.png) | 픽셀 동일 |
| desktop-filters | [Before](assets/TASK-FE-020/before-desktop-filters.png) | [After](assets/TASK-FE-020/after-desktop-filters.png) | 픽셀 동일 |
| desktop-home | [Before](assets/TASK-FE-020/before-desktop-home.png) | [After](assets/TASK-FE-020/after-desktop-home.png) | 픽셀 동일 |
| desktop-maps | [Before](assets/TASK-FE-020/before-desktop-maps.png) | [After](assets/TASK-FE-020/after-desktop-maps.png) | 픽셀 동일 |
| desktop-matches | [Before](assets/TASK-FE-020/before-desktop-matches.png) | [After](assets/TASK-FE-020/after-desktop-matches.png) | 픽셀 동일 |
| desktop-modal-scoreboard | [Before](assets/TASK-FE-020/before-desktop-modal-scoreboard.png) | [After](assets/TASK-FE-020/after-desktop-modal-scoreboard.png) | 픽셀 동일 |
| desktop-overview | [Before](assets/TASK-FE-020/before-desktop-overview.png) | [After](assets/TASK-FE-020/after-desktop-overview.png) | 픽셀 동일 |
| desktop-performance | [Before](assets/TASK-FE-020/before-desktop-performance.png) | [After](assets/TASK-FE-020/after-desktop-performance.png) | 픽셀 동일 |
| desktop-show-more | [Before](assets/TASK-FE-020/before-desktop-show-more.png) | [After](assets/TASK-FE-020/after-desktop-show-more.png) | 픽셀 동일 |
| desktop-weapon-scroll | [Before](assets/TASK-FE-020/before-desktop-weapon-scroll.png) | [After](assets/TASK-FE-020/after-desktop-weapon-scroll.png) | 픽셀 동일 |
| desktop-weapons | [Before](assets/TASK-FE-020/before-desktop-weapons.png) | [After](assets/TASK-FE-020/after-desktop-weapons.png) | 픽셀 동일 |
| mobile-act | [Before](assets/TASK-FE-020/before-mobile-act.png) | [After](assets/TASK-FE-020/after-mobile-act.png) | 픽셀 동일 |
| mobile-agents | [Before](assets/TASK-FE-020/before-mobile-agents.png) | [After](assets/TASK-FE-020/after-mobile-agents.png) | 픽셀 동일 |
| mobile-deathmatch | [Before](assets/TASK-FE-020/before-mobile-deathmatch.png) | [After](assets/TASK-FE-020/after-mobile-deathmatch.png) | 픽셀 동일 |
| mobile-empty-maps | [Before](assets/TASK-FE-020/before-mobile-empty-maps.png) | [After](assets/TASK-FE-020/after-mobile-empty-maps.png) | 픽셀 동일 |
| mobile-empty-matches | [Before](assets/TASK-FE-020/before-mobile-empty-matches.png) | [After](assets/TASK-FE-020/after-mobile-empty-matches.png) | 픽셀 동일 |
| mobile-filters | [Before](assets/TASK-FE-020/before-mobile-filters.png) | [After](assets/TASK-FE-020/after-mobile-filters.png) | 픽셀 동일 |
| mobile-home | [Before](assets/TASK-FE-020/before-mobile-home.png) | [After](assets/TASK-FE-020/after-mobile-home.png) | 픽셀 동일 |
| mobile-maps | [Before](assets/TASK-FE-020/before-mobile-maps.png) | [After](assets/TASK-FE-020/after-mobile-maps.png) | 픽셀 동일 |
| mobile-matches | [Before](assets/TASK-FE-020/before-mobile-matches.png) | [After](assets/TASK-FE-020/after-mobile-matches.png) | 픽셀 동일 |
| mobile-modal-scoreboard | [Before](assets/TASK-FE-020/before-mobile-modal-scoreboard.png) | [After](assets/TASK-FE-020/after-mobile-modal-scoreboard.png) | 픽셀 동일 |
| mobile-overview | [Before](assets/TASK-FE-020/before-mobile-overview.png) | [After](assets/TASK-FE-020/after-mobile-overview.png) | 픽셀 동일 |
| mobile-performance | [Before](assets/TASK-FE-020/before-mobile-performance.png) | [After](assets/TASK-FE-020/after-mobile-performance.png) | 픽셀 동일 |
| mobile-show-more | [Before](assets/TASK-FE-020/before-mobile-show-more.png) | [After](assets/TASK-FE-020/after-mobile-show-more.png) | 픽셀 동일 |
| mobile-weapon-scroll | [Before](assets/TASK-FE-020/before-mobile-weapon-scroll.png) | [After](assets/TASK-FE-020/after-mobile-weapon-scroll.png) | 픽셀 동일 |
| mobile-weapons | [Before](assets/TASK-FE-020/before-mobile-weapons.png) | [After](assets/TASK-FE-020/after-mobile-weapons.png) | 픽셀 동일 |
