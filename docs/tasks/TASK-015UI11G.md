# TASK-015UI11G: 반응형 / 마감 / Riot API 신청 전 점검 (API 신청용)

## Status

IMPLEMENTED_VERIFIED (UI11B~UI11F 정리 후 마감 단계)

**분류: Safe with existing data.** (신규 Mock/자산/타입 불필요 — 폴리시·QA·점검)

## Goal

UI11B~UI11F 정리 후, 프로필/경기 상세 페이지 전체의 **반응형·일관성·빈 상태·
접근성·UI Build 배지**를 최종 점검하고 마감해 Riot Production API **신청 전 상태**로
완성한다. 기존 데이터/에셋 범위의 polish·QA만 수행한다.

## Background

- UI11B~UI11F가 영역별 정보 구조를 정리하면, 영역 간 카드 문법·간격·반응형
  일관성과 빈/부분 데이터 상태 처리를 통합 점검할 마감 단계가 필요하다.
- UI10A의 UI Build 배지는 배포 검증 장치이므로 신청 전까지 유지·표기 확인이
  필요하다.

## User Value for Riot API Application

- 데스크톱/모바일 반응형, 일관된 밀도, 빈 상태 처리, 접근성은 "실제 운영 서비스"의
  완성도를 종합적으로 증명한다.
- 신청 직전 통합 QA로 깨진 레이아웃·미완성 흔적을 제거해 심사 인상을 높인다.

## Reference Direction

- 참고: 전적 서비스의 반응형 레이아웃·빈 상태 처리·정보 밀도의 **일반 원칙**만.
- 금지: 디자인 픽셀 복제, 데이터 없는 화면 신설.

## Allowed Changes

- 프로필/경기 상세 관련 컴포넌트의 **반응형·일관성·빈 상태·접근성 polish**(기능·
  데이터 변경 없는 범위): `PlayerProfile.tsx`, `PlayerHeaderCard.tsx`,
  `MatchSummaryList.tsx`, `MatchDetailPanel.tsx` 및 4탭, `ProfileSidebar.tsx` 등.
  - `PlayerHeaderCard.tsx`는 UI11B에서 이미 구현됐으므로, UI11G에서는 **최종
    반응형/일관성 polish 한정**으로만 수정한다(상단 요약의 정보 구조·데이터·기능
    변경 금지, 뷰포트별 레이아웃 보정만).
- `frontend/src/app/globals.css` — 반응형/간격/일관성 스타일.
- UI Build 배지(`AppVersionBadge`) 표기/위치 점검(유지 전제).
- 문서: 이 Task 문서 + 신청 전 점검 체크리스트 결과(`docs/ui-application-completion-plan.md`
  참조).

## Forbidden Changes

- 신규 Mock 데이터/타입 필드, 신규 외부 자산, 신규 패키지.
- backend/docker/scripts.
- 새로운 기능·지표·이벤트 추가(마감 단계는 정보 구조 추가가 아니라 마무리).
- UI9B/UI9C/UI9D 자산·Mock 게이트 항목 임의 착수.
- OP.GG/Tracker pixel-perfect 복제, 런타임 외부 URL, `Math.random`.
- Git add/commit/push.

## Existing Data / Assets Available

- UI11B~UI11F가 사용한 기존 데이터/에셋 전부(신규 없음).
- UI10A `AppVersionBadge`(앱 version + UI Build 라벨).
- 빈/부분 데이터 상태 표현(placeholder, `—`, "표본 없음")은 기존 패턴 활용.

## Required UI Changes

1. 데스크톱/태블릿/모바일 **반응형** 동작 점검·보정(레이아웃 깨짐 제거).
2. 영역 간 **카드 문법·간격·타이포 위계 일관성** 통합 점검.
3. **빈/부분 데이터 상태** 처리 일관화(데이터 없음을 정직하게 표시).
4. **접근성**(UI8A 탭 접근성 보존, 대비/포커스/aria) 점검.
5. **UI Build 배지** 표기 유지·확인(신청 전 배포 검증용).
6. 신청 전 점검 체크리스트(`ui-application-completion-plan.md`)를 통과한다.

## Required Human Decisions

- 신청 전 "완성" 기준선(어느 영역까지 데이터 기반 polish로 충분하다고 볼지).
- 자산/Mock 게이트(UI9B/UI9C/UI9D) 미해결 항목을 신청 전 placeholder로 둘지,
  신청 전에 자산/Mock을 확보해 채울지 최종 결정.
- 반응형 지원 최소 뷰포트 범위.

## Acceptance Criteria

1. 주요 뷰포트에서 레이아웃이 깨지지 않고 반응형으로 동작한다.
2. 영역 간 카드 문법·간격·위계가 일관되고, 빈/부분 데이터가 정직하게 처리된다.
3. UI8A 접근성·UI8B 라운드 타임라인 등 기존 기능이 보존된다.
4. UI Build 배지가 유지·표시된다.
5. 신규 Mock/타입/자산/패키지 추가가 없다. `tsc`/`lint`/`build` 통과.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
git diff --check
git status --porcelain -- frontend/public/assets frontend/src/data frontend/src/types frontend/package.json frontend/package-lock.json backend docker scripts
git diff -- frontend/src/lib/asset-map.ts frontend/src/lib/score-gameprobe.ts
grep -RnE "https?://|Math.random" frontend/src/components frontend/src/app/globals.css || true
# UI Build 배지 보존 확인
grep -RnE "AppVersionBadge|UI Build" frontend/src/components/PlayerProfile.tsx frontend/src/components/AppVersionBadge.tsx
# UI8A 접근성/UI8B 타임라인 보존 확인
grep -RnE "aria-selected|role=\"tabpanel\"" frontend/src/components/MatchTabs.tsx frontend/src/components/MatchDetailPanel.tsx
grep -RnE "ROUND_PHASES|round-chip" frontend/src/components/MatchRoundsTab.tsx
```

## Stop Conditions

- 마감 점검 중 데이터/자산이 더 필요하다고 판단되면(신규 Mock/자산), 임의 추가
  대신 중단하고 UI9B/UI9C/UI9D 결정을 요청한다.
- 새로운 정보 구조/기능을 추가해야 하는 상황이면 중단(마감 범위 초과 → 별도 Task).
- 같은 검증 실패 3회 반복 시 `BLOCKED` 보고.

## Codex Implementation Notes

- `globals.css`에서 반응형·마감 보정만 수행했다.
- 사이드바 패널 헤더와 긴 Riot ID/카드 텍스트가 좁은 폭에서 넘치지 않도록
  `min-width: 0`, `overflow-wrap`, badge 고정 폭, mobile 1열 보정을 추가했다.
- 경기 상세/탭/스코어보드 헤더는 모바일에서 세로 배치로 접히도록 보정하고, 점수
  배지는 `fit-content`로 유지했다.
- 최근 경기 카드의 승패 strip이 모바일에서 전체 폭 행으로 안정적으로 배치되도록
  grid column을 보정했다.
- UI Build 배지 컴포넌트와 표기는 유지했다(`AppVersionBadge`, `UI Build` grep
  확인). UI10A 라벨은 기존 배포 검증 장치로 유지했다.
- UI8A 탭 접근성(`aria-selected`, `role="tabpanel"`)과 UI8B 라운드 타임라인
  (`ROUND_PHASES`, `round-chip`)은 보존했다.
- 신규 Mock 데이터, 신규 타입 필드, 신규 외부 자산, 신규 패키지, backend/docker/
  scripts 변경은 없다.
- 로컬 dev server에서 `/players/demo-puuid-seoul-duelist-001` HTTP 200 응답을
  확인했다. Playwright 패키지는 있었으나 브라우저 바이너리가 없어 screenshot 기반
  viewport 검사는 수행하지 못했다(신규 다운로드는 진행하지 않음).
- 검증: `npx tsc --noEmit`, `npm run lint`, `npm run build`, `git diff --check`,
  금지 경로/asset-map/score-gameprobe diff, 외부 URL/난수 grep, UI Build 배지 grep,
  탭 접근성/라운드 타임라인 grep 모두 통과.
- Git add/commit/push는 Task 금지 사항에 따라 수행하지 않았다.

## Cursor Review Notes

(리뷰 후 기록: 마감 품질, 기능 보존, 신규 추가 없음 확인, AC 충족,
BLOCKER/MAJOR/MINOR, 커밋 가능 여부.)
