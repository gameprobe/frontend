# TASK-FE-010 — 글자 기준 통일과 독립적인 레이아웃 밀도

## Status

IMPLEMENTED — 구현·검증 완료, 사용자 시각 검토 대기 (2026-09-16).

## Goal

사용자가 90% 배율의 배치는 적절하지만 요원 플레이 시간 등 글자가 여전히
작고 흐리다고 지적했다. 100% 기준에서 레이아웃 폭·여백을 별도로 줄이고
홈·프로필 글자를 역할별 CSS 변수로 정리해 작은 보조 정보의 가독성을 확보한다.

## Allowed changes

- `frontend/src/features/home/HomeLanding.module.css`
- `frontend/src/features/tracker-profile/TrackerProfile.module.css`
- `docs/tasks/TASK-FE-010.md`
- `docs/frontend/PLAN.md`
- `docs/PROGRESS.md` (이번 결과 요약)
- `docs/visual-qa/TASK-FE-010.md`
- `docs/visual-qa/assets/TASK-FE-010/*`
- `.agent-reports/CURRENT.md` (Codex 및 공통 상태)

읽기: 위 화면 JSX와 기존 계획·Task. HANDOFF.json 부재이며 사용자가 지적한
전체 글자 통일·작은 메타데이터·90% 배치 선호를 이번 범위로 기록한다.

## Forbidden changes

- 라인업·전역 파일·백엔드·데이터/필터 로직·의존성·폰트 파일 변경
- CSS zoom/transform scale을 통한 전체 축소, 사용자 브라우저 배율 변경
- 인체 SVG 제거, 기존 기능 제거, 요청 없는 commit/push

## Acceptance criteria

- 글자와 배치 크기를 독립 CSS 변수로 조절한다. 데스크톱 본문 최대 폭은
  기존1600px의90%인1440px를 기준으로 하고 여백·장식 크기를 보완한다.
- 요원 플레이 시간·경기 시간13px, 표 라벨·보조 문구 최소12px, 본문14px,
  입력16px. 모바일에서8~11px로 다시 축소하지 않는다.
- 메타데이터 회색을 읽기 쉬운 공통 색상으로 정리하되 숫자 위계는 유지한다.
- 320/390/768/1000/1250/1440/1920px에서 가로 넘침·텍스트 겹침이 없다.
  작은 화면의 긴 표는 기존 가로 스크롤 영역으로 제공한다.
- 홈 검색·프로필 탭·요원/경기 필터·펼침 유지. Before/After·시각 리뷰 기록.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

브라우저: computed style·반응형·텍스트 겹침·상호작용·Before/After 시각 검토.

## Stop conditions

- 동일 원인 검증 실패3회, 범위 밖 변경 필요, 새 사용자 변경 충돌.

## Result

- 변경 소스: 홈·프로필 CSS 2개. TypeScript·데이터·라인업·전역 무변경.
- 글자 토큰: caption12/meta13/body14/value16/section18/heading20/
  feature24/title28px, 홈 제목38px(태블릿36/모바일30px).
- 배치 토큰: content-max1440px, sidebar-width272/288px, card14px,
  section18px, gap18px, brand40px/nav54px. 모바일 터치 영역은 유지했다.
- 보조 회색은 `--muted:#b4c2cf`로 통일. 제트 플레이 시간11px(모바일9px)→
  13px. 표·순위·통계 설명·사이드바·경기 상세·푸터의8~11px 규칙은12px 이상.
- 좁은 화면의 통계 라벨 줄바꿈, score2열/secondary3열/480px 이하 sidebar1열로
  가독성을 유지했다. 기존 표 가로 스크롤·인체 SVG·경기 필터 의미 유지.
- 문서: 이 Task, frontend PLAN, PROGRESS, Visual QA, 캡처9장 및 ignored CURRENT.
- Verification commands 모두 PASS: 타입 검사, Lint 경고·오류0,
  production build(정적 페이지11개), 개발 서버 재시작, diff 공백 검사.
- 프로필13개 너비(320/390/480/700/701/768/850/851/1000/1250/1251/1440/1920),
  홈7개 너비(320/390/768/1000/1250/1440/1920)에서 페이지 가로 넘침0.
  Overview의12px 미만 표시 텍스트0, 텍스트 넘침0, 경기 자식 요소 겹침0.
- Agents/Maps/Weapons/Performance 탭320/1440px에서 가로 넘침0·12px 미만0.
  Jett 필터9경기, 상세 펼침/Performance, 패배7경기/0W7L, 검색 이동 PASS.
- 320px 프로필 신원·프로모션·랭크·사이드바/상세를 시각 확인했다.
  콘솔 warn/error0, 독립 증분 코드·시각 리뷰 PASS.
- `--muted`와 주요 단색 배경(#111d26/#202c37/#18312f/#2a252d)의 대비7.61~9.42:1.
  전체 페이지 접근성 인증을 의미하지 않는다.
- [Visual QA](../visual-qa/TASK-FE-010.md) 참조. 미해결 구현 문제 없음.
  컨테이너 git 부재 메시지는 기존 metadata fallback이다.
- 검증은100% 기준이며 사용자 localhost의90% 설정은 변경하지 않았다.
  크기 선호는 실제 모니터에서100%로 확인해야 한다. 읽기 가능한 글자를 유지하므로
  모든 요소가 이전90% 화면과 정확히 같은 크기가 되는 것은 아니다.
- 기존 미커밋 변경 보존, 이번 승인 대상만 조정. 커밋·푸시 없음.
