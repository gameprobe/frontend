# TASK-FE-002 — Tracker 프로필 클론

## Status

IMPLEMENTED — 사용자 지정 범위 구현·검증 완료, 사람 검토 대기 (2026-09-16).

## Goal

`codex/frontend-rework`의 `88bc139`에서 분기한 `codex/tracker-profile-clone`에서
Tracker 전적 프로필의 배치·밀도·필터·경기 탐색을 Mock으로 구현한다.
사용자는 먼저 완성하고 커밋한 뒤 모듈 분리를 별도 작업으로 진행하도록 지정했다.
기존 UI 가이드의 복제 제한보다 이번 사용자 지정을 우선한다.

레퍼런스: https://tracker.gg/valorant/profile/riot/IED%20agent%23Allen/overview?platform=pc&playlist=competitive&season=8102cd81-43a0-d0d7-bd59-47b8fe9bed1b

## Allowed changes

- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/TrackerProfile.module.css`
- `frontend/src/features/tracker-profile/mock.ts`
- `frontend/src/features/tracker-profile/mock.test.cjs`
- `frontend/src/app/players/[puuid]/page.tsx`
- `docs/tasks/TASK-FE-002.md`
- `docs/frontend/PLAN.md`
- `docs/PROGRESS.md` (이번 Task 요약 추가만)
- `docs/visual-qa/TASK-FE-002.md`
- `docs/visual-qa/assets/TASK-FE-002/*`
- `.agent-reports/CURRENT.md` (Codex 및 공통 상태만, Git 제외)

HANDOFF.json은 현재 없다. 이번 사용자가 지정한 범위와 이 문서로 변경 경로를
한정한다. 신규 패키지 없이 기존 요원·랭크·맵·무기 자산을 재사용한다.

## Forbidden changes

- 라인업, 공통 레이아웃/스타일/컴포넌트, 기존 공용 Mock, 백엔드 수정
- API·RSO·Overwolf·DB·운영 배포·의존성 추가/업그레이드
- 전체 구조 리팩터링, 다른 Task 자동 착수, 사용자 요청 없는 push/merge
- 실제 데이터·Tracker 공식 서비스인 것처럼 표시

## Acceptance criteria

- 기존 데모 프로필 경로에서 프로필 배너·탭·플랫폼/모드/시즌 필터,
  좌측 랭크/정확도/역할/무기/맵, 우측 통계/점수/요원/날짜별 경기를 표시한다.
- 주요 탐색 탭, 필터 및 초기화, 경기 상세 펼침, 공유가 실제 동작한다.
- Mock 데이터와 집계 로직은 화면과 분리하고 필터 결과·통계를 일관되게 계산한다.
- GameProbe 브랜드와 Mock 안내를 유지하고 색상/간격은 페이지 CSS 변수로 모은다.
- 1440px 및 390px 화면에서 내용 접근 가능, 페이지 가로 넘침 없음.
- 라인업 소스 변경 없음 및 기존 라인업 화면 회귀 확인.
- Before/After 캡처 및 레퍼런스 대조 보고서 작성.

## Verification commands

공유 빌드 볼륨 경합을 피하기 위해 dev 중지 후 실행한다.

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

브라우저 Playwright: 데스크톱/모바일 Before/After, 탭, 모드/시즌/경기 필터,
빈 상태와 초기화, 경기 상세, 공유, 라인업 회귀를 검증한다.

## Stop conditions

- 같은 원인의 검증 실패 3회
- 공용 라인업 코드 또는 API/의존성 변경이 필수인 경우
- 사용자 변경과 같은 경로에서 충돌 시 보존하고 보고

## Result

- 변경 파일: Allowed changes의 전적 소스 5개, Task/프론트 계획/진행 로그,
  시각 검증 문서 및 JPEG 12개, ignored `.agent-reports/CURRENT.md`.
- 구조: 프로필 route → `features/tracker-profile/TrackerProfile.tsx` + CSS Module,
  별도 `mock.ts` fixture/필터/집계 및 `mock.test.cjs`. 큰 UI 모듈 분리는 보류했다.
- `codex/frontend-rework`의 `88bc139`에서 새 브랜치를 만들었다. 기존 프로필의
  이름을 보존하며 `/players/ied-agent-allen`은 레퍼런스 비교용 Mock 별칭이다.
- Verification commands 전부 PASS: selector 테스트, `npx tsc --noEmit`,
  `npm run lint`(경고·오류 0), `npm run build`(11개 정적 페이지 생성),
  `git diff --check`. 초기 JSX 주석 텍스트 Lint 오류 2개는 수정 후 통과했다.
- 브라우저: 필터 교차 조건 2경기, 빈 상태와 초기화, A4 3경기,
  Console 2경기, 더 보기 23경기, 6개 탐색 탭, 경기 상세, 공유, 저장 지속 검증 PASS.
- 리뷰에서 발견한 Deathmatch 라운드 승률 오류를 경기 승률로 수정하고
  50% 표시를 확인했다. 상세 버튼의 불완전한 tab 역할은 일반 pressed 버튼으로
  수정했다. 데이터 없는 정확도, 배너 이미지 잘림도 수정했다.
- [Visual QA](../visual-qa/TASK-FE-002.md): Before/After 및 레퍼런스 비교,
  1440px/390px 가로 넘침 없음, 768px 경기 상세 정상, 독립 시각 검토 PASS.
- 라인업으로 클라이언트 이동해 기존 공용 헤더와 Mock fallback 10개 확인.
  라인업·공통 CSS/레이아웃·기존 Mock·백엔드·의존성은 변경하지 않았다.
- 개발 서버는 검증 후 실행 상태로 두었다. Node 22.20.0 / npm 10.9.3 Docker 환경.
- 남은 한계: 실제 계정 수치가 아닌 fixture 36개, 요원/맵 3개, GameProbe 브랜드와
  기존 Jett 자산/로컬 글꼴을 사용하므로 픽셀 단위 동일하지 않다.
  Encounters/Customs/Crosshairs, 팀 전체 스코어보드·라운드 이벤트, 실제 검색·API는
  이번 Overview 중심 구현에 포함하지 않는다. 전용 UI 파일은 의도적으로 크게 유지했다.
- 기존 컨테이너의 Git 명령 부재 메시지는 build metadata fallback이며 빌드는 통과한다.
  신규 프로필과 무관한 기존 데모 화면의 시간대 hydration 오류는 Before 캡처 중
  확인했다. 기존 화면 코드는 수정하지 않았고 신규 화면의 날짜는 UTC 고정이다.
- 사람 확인: 레퍼런스 대비 상세 시각 차이 및 첫 구현 범위를 검토한 뒤
  리팩터링 Task/통합 브랜치 PR을 지정한다. 이번 요청의 구현 커밋만 수행하며
  push/merge와 다음 Task는 자동 진행하지 않는다.
