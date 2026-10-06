# TASK-FE-014 — 프로필 시즌 요약·점수·요원 표 컴포넌트 분리

## Status

IMPLEMENTED — 2026-09-19 구현·검증 완료. 2026-09-20 사용자 요청으로 커밋·푸시 및 통합 브랜치 대상 PR 전달 진행.

## Goal

[모듈 분리 계획](../frontend/REFACTORING.md)의 B2를 나눠 첫 묶음(B2a)을 수행한다.
[화면 정의서](../frontend/SCREEN-MAP.md)의 P06 시즌 요약, P07 Probe Score,
P08 요원 통계 표를 각각 수정할 수 있는 표시 컴포넌트와 CSS로 분리한다.
외형·데이터·동작을 유지하며, 상태와 집계는 부모 `TrackerProfile`에 남긴다.

- 기준: 최신 `codex/frontend-rework` / PR #6 병합 `06076ca`.
- 작업 브랜치: `codex/profile-summary-components`.
- `dev`는 별도 공유 브랜치이며 운영 배포/`main` 병합은 이번 작업에 포함하지 않는다.
- B2b(프로필 배너·플랫폼/모드/Act 필터·사이드바), B3(경기 목록), C/D는 후속 Task다.

## 구현 경계

| 파일 | 책임 | 부모에 유지할 것 |
|---|---|---|
| `summary/SeasonOverview.tsx` | P06 제목·랭크·주요/보조 수치·Show More 표시 | 시즌 선택/집계/임시 랭크 그래프 계산, Show More 상태 |
| `summary/ProbeScoreCard.tsx` | P07 점수·등급·막대 표시 | 점수·등급·막대 비율 계산 |
| `summary/AgentStatsTable.tsx` | P08 표·빈 상태·요원 선택 이벤트 | 요원 집계, 상위3/전체 선택, 요원 필터+Matches 이동 |
| 각 컴포넌트의 `.module.css` | 해당 영역 전용 스타일·반응형 | 공통 카드/제목/색/표 스크롤/빈 상태 스타일은 기존 CSS 재사용 |
| `format.ts` | 기존 number/signed 두 표시 함수의 그대로 이동·공유 | 집계·통계 의미·새 포맷 정책 없음 |

- 기존 `Asset`/이미지 경로 helper/`Sparkline`은 부모에 유지한다. 랭크 아이콘·그래프와
  요원 초상화는 의미가 명확한 ReactNode 슬롯/행 데이터로 전달한다. 새 자산 선택 계층은 만들지 않는다.
- 컴포넌트는 표시할 필드와 콜백만 받는다. Mock fixture 직접 import, localStorage,
  clipboard, 네트워크, 새 상태 훅을 넣지 않는다. 점수 이름은 기존 branding을 재사용한다.
- DOM 태그/순서/접근성 이름/키/조건부 표시를 보존한다. 추가 wrapper로 배치를 바꾸지 않는다.
- CSS 이동 시 media query 순서와 결합 selector를 보존한다. agentTable/weaponTable 결합 규칙은
  agent 쪽만 이동한다. `.rankGraph .sparkline`은 부모가 제공하는 기존 단일 SVG를 대상으로
  `.rankGraph > svg`로 연결한다. 계산 스타일/좌표/스크린샷 비교로 동일성을 검증한다.
- 컴포넌트·props·스타일의 사용 화면과 범위를 한국어 주석으로 표시한다.

## Allowed changes

- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/TrackerProfile.module.css`
- `frontend/src/features/tracker-profile/format.ts` (신규)
- `frontend/src/features/tracker-profile/summary/SeasonOverview.tsx` (신규)
- `frontend/src/features/tracker-profile/summary/SeasonOverview.module.css` (신규)
- `frontend/src/features/tracker-profile/summary/ProbeScoreCard.tsx` (신규)
- `frontend/src/features/tracker-profile/summary/ProbeScoreCard.module.css` (신규)
- `frontend/src/features/tracker-profile/summary/AgentStatsTable.tsx` (신규)
- `frontend/src/features/tracker-profile/summary/AgentStatsTable.module.css` (신규)
- `docs/tasks/TASK-FE-014.md`
- `docs/frontend/PLAN.md`
- `docs/frontend/REFACTORING.md`
- `docs/frontend/SCREEN-MAP.md`
- `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-014.md` (신규)
- `docs/visual-qa/assets/TASK-FE-014/*` (신규)
- `.agent-reports/CURRENT.md` (Codex·공통 상태)

읽기 전용: 프로젝트 지침/기존 계획·Task·QA, 위 소스 경로, `tracker-profile/mock.ts`와
`mock.test.cjs`, `stats-shell/*`, `home/HomeLanding.tsx`/`.module.css`,
`components/HomeSearch.tsx`, `components/AnalysisExampleCards.tsx`,
`app/page.tsx`, `app/players/[puuid]/page.tsx`, frontend package/tsconfig/next.config,
`docker/compose.frontend.yml`. 소스 경로의 기준은 `frontend/src/features`다(components/app은 src 바로 아래).

현재 HANDOFF.json은 없다. 사용자 다음 작업 지시에 따라 이 Task에서 범위를 정의한다.
Claude 인계 문서가 있는 것으로 간주하지 않는다. 검증 스크립트는 `/tmp`에 둔다.

## Forbidden changes

- 이미지 파일/선택/매핑/표시, 인체 SVG, 브랜드·테마 기본값 변경.
- 라인업, 백엔드, 공용 App 레이아웃, 전역 CSS, 실행/배포 환경, 의존성 변경.
- Mock 값/산식/선택 필터 영향 범위/검색 경로/저장 키/알림 수명 변경.
- 디자인 변경, 실제 Riot API/RSO/Overwolf 연결, B2b/B3/C/D 자동 진행.
- 요청 없는 커밋·푸시·PR 생성/병합·브랜치 삭제.

## Acceptance criteria

1. 세 표시 영역은 새 컴포넌트를 사용하고 해당 전용 CSS가 함께 이동한다.
2. 상태·집계·브라우저 동작은 부모 소유이며 UI는 값과 콜백을 받는다. 이미지 helper는 그대로다.
3. Overview/Performance의 시즌 통계, Show More, Top Agents와 Agents 전체 표를 유지한다.
4. 플랫폼/모드/Act는 시즌 전체를 바꾸고 하위 경기 필터는 시즌 통계·요원 표를 바꾸지 않는다.
5. 요원 선택 시 기존 다른 조건을 유지하며 Matches로 이동하고 펼침/표시 개수 초기화를 보존한다.
6. Deathmatch 전용 명칭/보조 항목, 데이터 없는 상태, 모바일 표 스크롤을 유지한다.
7. Before/After DOM·배치·계산 스타일·시각 비교와 기존 주요 동작 검증이 통과한다.
8. 사용처 주석, 화면 정의서, Task Result 및 CURRENT 보고를 갱신한다.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
git status --short
```

- Playwright: 기준/결과를 동일한 Chromium, 100%, DPR1에서 촬영. desktop1920/mobile390,
  홈/프로필 전체 화면 및 P06~08, Show More/Performance/Agents/빈 결과/Deathmatch 상태.
- 320/390/480/481/700/701/768/850/851/1000/1001/1250/1251/1440/1499/1500/1920px와
  이동한 CSS의 추가 분기점에서 배치·계산 스타일·넘침을 비교한다.
- 프로필 탭/요원·승패·Act/플랫폼·모드/복합 필터·빈 상태·Reset,
  시즌/하위 필터 영향 구분, 경기20→23·상세 초기화·저장, 공유/갱신 안내, 홈·라인업 이동을 확인한다.
- 신규 소스 및 변경 문서의 허용 경로·링크·코드 펜스 검사. 동결 경로 diff 없음 확인.
- 문서·파일 이동 자체를 모사하는 단위 테스트를 추가하지 않고 기존 Mock 검증과 실제 UI 경계를 확인한다.

## Result

- 구현: 시즌 요약·점수·요원 표와 전용 CSS를 분리했다. 부모의 집계·상태·선택 콜백·이미지/그래프 helper를 유지하고 기존 number/signed를 공유했다. 사용 화면·책임 경계를 한국어 주석으로 기록했다.
- 실제 변경 소스9개:
  - `frontend/src/features/tracker-profile/TrackerProfile.tsx`
  - `frontend/src/features/tracker-profile/TrackerProfile.module.css`
  - `frontend/src/features/tracker-profile/format.ts`
  - `frontend/src/features/tracker-profile/summary/SeasonOverview.tsx`
  - `frontend/src/features/tracker-profile/summary/SeasonOverview.module.css`
  - `frontend/src/features/tracker-profile/summary/ProbeScoreCard.tsx`
  - `frontend/src/features/tracker-profile/summary/ProbeScoreCard.module.css`
  - `frontend/src/features/tracker-profile/summary/AgentStatsTable.tsx`
  - `frontend/src/features/tracker-profile/summary/AgentStatsTable.module.css`
- 문서6개: 이 Task, `docs/frontend/PLAN.md`, `docs/frontend/REFACTORING.md`, `docs/frontend/SCREEN-MAP.md`, `docs/PROGRESS.md`, `docs/visual-qa/TASK-FE-014.md`.
- 산출물: `docs/visual-qa/assets/TASK-FE-014/`의 PNG46장과 `verification.json`. ignored `.agent-reports/CURRENT.md` Codex·공통 상태 갱신.
- 실행 명령: 위 Verification commands 전부 성공. 추가로 번들 Node의 `/tmp/fe014-visual.cjs before/after`, `/tmp/fe014-interactions.cjs`, `/tmp/fe014-summary-interactions.cjs`, Python/Pillow22쌍 비교, 문서·허용 파일·동결 경로 검사를 수행했다.
- 실제 결과: Mock/타입 PASS, Lint0경고0오류, production build 정적11페이지 PASS. 개발 서버 재실행 완료. 54조건 DOM·좌표·23개 계산 스타일·접근성/이미지 속성 동일, pageerror0·페이지 넘침0. 동작29개 PASS. PNG22쌍 변경 픽셀0.
- 독립 검토: CSS560단위 등가 확인, 대표 화면6쌍에서 새 겹침·잘림·배치 차이 없음. [Visual QA](../visual-qa/TASK-FE-014.md)에 전체 근거를 기록했다.
- 남은 범위/주의: 공유 카드·제목·색·표 스크롤·빈 상태 CSS는 부모 파일을 재사용한다. 고정 랭크/이미지와 시연 통계 산식, LAST20 제목·페이지별 동작 차이는 기존 그대로다. 실제 API와 Overwolf는 미연결이며 Cursor 및 사람 리뷰는 별도다. 컨테이너 git 부재는 기존 빌드 정보 fallback으로 빌드에 영향 없음.
- 2026-09-20 사용자가 커밋·푸시·PR 작성을 요청했다. 검증 이후 소스 변경 없이 전달 상태만 갱신했고, 최종 문서·허용 경로·diff 검사를 통과했다. 대상은 `codex/profile-summary-components` → `codex/frontend-rework`다. PR 병합 및 다음 Task는 자동으로 진행하지 않는다.
