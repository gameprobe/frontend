# TASK-FE-012 — 홈·프로필 공통 브랜드·테마 설정 분리

## Status

IMPLEMENTED — 1차 구현 및 사용자 지정 보완 검증 완료, 사용자 요청으로 커밋·푸시 진행 및 PR 검토 대기 (2026-09-18).

## Goal

FE-011의 A 단계를 구현한다. 홈·프로필의 현재 브랜드 네 값과 공통 테마를
독립된 파일로 옮겨 수정 위치를 명확히 한다. 외형·동작·이미지·Mock 통계는 유지한다.

- 기준: `codex/frontend-rework`, `6298fdb` (PR #4 병합).
- 작업 브랜치: `codex/frontend-shared-settings`.
- 이후 컴포넌트 분리는 이번 결과 검토 후 별도 Task로 진행한다.

## 사용자 지정 보완 (2026-09-18)

중복·차이 감사 후 사용자가 브랜드 문구와 같은 역할의 직접 색상값 연결을 승인했다.
기존 미커밋 변경을 보존하며 같은 Task/브랜치에서 마무리한다.

- 홈 소개의 서비스명과 프로필 점수 접근성 이름·툴팁·경기 상세/풋노트를 브랜드 설정에 연결한다.
- 드롭다운·도넛 내부 배경, 시즌 카드 하단 배경을 역할이 같은 기존 색상 변수에 연결한다.
- main 바깥 body 배경도 공통 배경값 한 선언을 사용한다. 홈/프로필이 있을 때만 적용한다.
- 기본 표시 문구·색·배치·동작은 유지한다. 접근성 이름은 점수명과 동일한 대소문자로 연결한다.
- 홈/프로필 계정 버튼 색 차이와 More 메뉴 동작은 다음 컴포넌트 작업에서 다룬다.
- 이미지·이미지 위 오버레이·저장 키·라인업·전역 파일은 유지한다.
- Before/After 재촬영, 기본값 유지, 다른 브랜드/테마 값의 연결 검증과 복원을 수행한다.

## Allowed changes

- `frontend/src/features/stats-shell/branding.ts` (신규)
- `frontend/src/features/stats-shell/theme.module.css` (신규)
- `frontend/src/features/home/HomeLanding.tsx`
- `frontend/src/features/home/HomeLanding.module.css`
- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/TrackerProfile.module.css`
- `frontend/src/features/tracker-profile/mock.ts` (브랜드 export 이동만)
- `docs/tasks/TASK-FE-012.md`
- `docs/frontend/PLAN.md`
- `docs/frontend/SCREEN-MAP.md` (변경된 설정 경로만)
- `docs/frontend/REFACTORING.md` (A 단계 실제 구현 상태)
- `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-012.md`
- `docs/visual-qa/assets/TASK-FE-012/*` (Before/After 및 검증 근거)
- `.agent-reports/CURRENT.md` (Codex 및 공통 상태)

읽기 전용: 프로젝트 지침·기존 Task/계획/QA, `docker/compose.frontend.yml`,
`frontend/package.json`, `frontend/tsconfig.json`, `frontend/next.config.ts`,
`frontend/src/features/tracker-profile/mock.test.cjs`,
`frontend/src/components/HomeSearch.tsx`, `frontend/src/components/AnalysisExampleCards.tsx`,
`frontend/src/app/page.tsx`, `frontend/src/app/players/[puuid]/page.tsx`.
브랜드 참조 누락 확인은 `frontend/src`의 import/branding 이름 검색만 허용한다.

HANDOFF.json은 존재하지 않는다. 사용자가 지정한 이번 구현은 위 변경·읽기 범위로
한정하며 Claude의 인계 문서가 작성된 것으로 간주하지 않는다. 검증용 임시 스크립트는
/tmp에 둔다.

## Forbidden changes

- 화면의 값·색·크기·배치·표시 문구·상호작용 변경.
- 이미지/SVG/경로/선택/매핑 변경·추가.
- 라인업, 공용 레이아웃/전역 CSS, 백엔드, 의존성·실행 설정 변경.
- Mock 데이터·계산식·검색 경로·저장 키 변경.
- 실제 API/RSO/Overwolf 연결, 컴포넌트/상태/데이터 분리.
- 지시 없는 git add/commit/push/merge.

## Acceptance criteria

- 브랜드 네 값은 `stats-shell/branding.ts`에서 홈·프로필이 가져온다.
- 공통 CSS 변수와 기본 글꼴은 `stats-shell/theme.module.css`로 옮긴다.
- 설정마다 실제 사용하는 화면·영역을 한국어 주석으로 안내한다. 사용자 추가 요청이다.
- `.page` 범위 표식과 `:has(.page)`의 기존 동작을 유지한다.
- 홈 제목·반응형 덮어쓰기 우선순위와 계산된 스타일을 보존한다.
- 동일 조건의 Playwright Before/After, 지정 너비, 주요 조작에서 회귀가 없다.
- 새 변경 위치·브랜드 문구 연결과 남아 있는 프로필 CSS 의존을 문서화한다.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
git status --short
```

Playwright: 홈/프로필 desktop1920×960·mobile390×844 Before/After.
320/390/768/1000/1250/1440/1499/1500/1920px와 홈 제목 분기점에서 넘침·테마 값을 비교한다.
검색·More/Escape·주요 탭·필터·상세, 홈/프로필→라인업 이동 시 공용 헤더/푸터
복원을 확인한다. 사용자 브라우저 배율은 바꾸지 않는다.

## Result

- 소스 변경 7개: 신규 `stats-shell/branding.ts`, `stats-shell/theme.module.css`,
  홈 TSX/CSS, 프로필 TSX/CSS, `tracker-profile/mock.ts`의 브랜드 선언 제거.
- 브랜드 네 값에 `BrandConfig` 타입과 실제 사용처 주석을 붙였다. 공통 변수
  26개와 기본 글꼴·배경·글자색을 독립 테마로 옮기고 두 화면의 main에 연결했다.
- 공통 변수 기본값은 `:where(.theme)`로 낮은 우선순위를 사용해 기존 홈/프로필
  반응형 덮어쓰기를 유지했다. `.page`와 초기화·공용 헤더 숨김 규칙은 보존했다.
- 글자·배치·색상별 주석 및 홈/프로필 사용 지점·반응형 예외 위치를 안내한다.
- 문서 변경: 이 Task, frontend PLAN/SCREEN-MAP/REFACTORING, PROGRESS,
  Visual QA 보고서, Before/After PNG 10개·검증 요약 JSON, ignored CURRENT.
- `git switch -c codex/frontend-shared-settings`: PASS, 기준 `6298fdb`.
- Verification commands: Mock selector PASS; TypeScript PASS; Lint 경고·오류 0;
  production build PASS(정적 페이지 11개); 개발 서버 재시작 PASS.
  컨테이너의 git 부재 메시지는 기존 빌드 정보 fallback이며 이번 변경과 무관하다.
- Playwright: 홈/프로필 13너비씩 26조건의 텍스트·요소 위치·계산된 스타일과 변수
  동일, 페이지 가로 넘침 0. PNG 5쌍 픽셀 차이 0.
- 검색·6탭·요원/승패/Act 필터·빈 상태·초기화·20→23경기·상세 2탭·저장 유지·
  홈/프로필→라인업 공용 스타일 복원 PASS. 브라우저 실행 오류 0.
- 독립 코드/시각 검토에서 변경에 따른 회귀를 찾지 못했다. 정식 Cursor 리뷰는
  별도이며 [Visual QA](../visual-qa/TASK-FE-012.md)에 비교 근거를 기록했다.
- `git diff --check`: PASS. 변경/신규 24개 파일의 허용 범위·공백·문서 링크·
  코드 펜스 검사 PASS. Mock 브랜드 선언만 삭제·공통 변수 26개 보존 검사 PASS.
- 1차 감사에서 찾은 고정 브랜드 문구·같은 역할의 직접 색상값은 아래 보완으로 연결했다.
  홈의 프로필 헤더/푸터 CSS 의존과 개별 스타일은 후속 작업 대상이다.
  다른 화면까지 포함한 전체 브랜드·디자인 교체를 의미하지 않는다.
  기존 LAST 20 MATCHES 제목 한계도 유지한다.
- 이미지·라인업·전역 스타일·Mock 값/계산식·저장 키·의존성 변경 없음.
  컴포넌트 분리·실제 API/Overwolf 구현은 하지 않았다. 1차 검증 당시 커밋·푸시·병합 없음.

### 2026-09-18 보완 결과

- 추가 소스 수정 5개: branding.ts, theme.module.css, HomeLanding.tsx,
  TrackerProfile.tsx, TrackerProfile.module.css.
- 홈 소개 서비스명과 프로필 점수 접근성 이름·툴팁·경기 상세 지표·안내문을 기존
  branding 네 값에 연결했다. 기본 visible text는 유지하고 접근성 이름만 점수명과
  같은 대소문자(Probe Score)로 맞췄다. 주석도 현재 사용처로 갱신했다.
- More 메뉴·승률 도넛 내부는 --raised, 시즌 카드 하단은 --panel로 연결했다.
  --bg는 .theme와 해당 main이 존재하는 body에 한 번 선언하고 배경 규칙을
  theme로 모았다. 나머지 변수는 main 안에만 적용한다.
- 추가 문서: 이 Task, 기존 PLAN/PROGRESS/SCREEN-MAP/REFACTORING/Visual QA,
  followup Before/After PNG 10개와 검증 JSON, ignored CURRENT.
- `/tmp/fe012-followup-visual.cjs before/after`: 26조건 동일·넘침0·pageerror0 PASS.
  번들 Python/Pillow 픽셀 비교: 새 5쌍 차이0 PASS.
- `/tmp/fe012-config-preview.cjs`: 독립 브라우저에서 설정 선언만 대체해 브랜드
  문구·점수·표면색 반영 및 라인업 기존 body 배경 복원 PASS, 실행 오류0.
  원본 파일과 사용자 브라우저를 임시 수정하지 않았다.
- `/tmp/fe012-interactions.cjs`: 기존 주요 동작 재검증 PASS.
- 이미지/오버레이·상태색·계정 버튼 색·More 메뉴 동작·저장 키·Mock은 그대로다.
- 최종 Verification commands의 Mock·타입·Lint·production build PASS. 개발 서버 복원.
  독립 코드·추가 캡처 시각 검토에서 새 회귀 없음.
- 최종 문서 링크 95개·공백·펜스·허용 범위 35파일 검사 PASS. 공통 변수 26개
  기본값 보존·배경 단일 선언·브랜드 직접 표기 제거·Mock 보존 검사 PASS.
  보완 검증 당시 사용자 검토 대기이며 커밋·푸시 없음.

### 2026-09-18 커밋·푸시 요청

- 사용자가 현재 결과의 커밋·푸시와 PR 문안 작성을 요청했다.
- `codex/frontend-shared-settings`를 업로드하며 PR 대상은 `codex/frontend-rework`다.
  PR 생성·병합은 사용자가 진행한다.
- 소스는 최종 검증 이후 변경하지 않았다. 업로드 준비에서는 문서 상태와 diff를 확인한다.
- 홈·오버뷰 Search의 글자 크기·색·hover 차이는 후속 공통 헤더 컴포넌트 작업에서 다룬다.
