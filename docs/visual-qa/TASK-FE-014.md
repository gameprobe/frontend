# TASK-FE-014 Visual QA

## 기준과 결과

- 2026-09-19, 기준 `06076ca`(PR #6), 작업 브랜치 `codex/profile-summary-components`.
- 목표는 P06 시즌 요약·P07 점수·P08 요원 표를 분리하면서 기존 외형·동작을 유지하는 것이다.
  기준 구현을 Before로 촬영한 뒤 분리된 코드에서 After를 촬영했다. 외부 사이트를 새 기준으로 삼지 않는다.
- **PASS**: 54조건의 전체 main DOM·좌표·계산 스타일 동일. PNG 22쌍 모두 같은 크기, 변경 픽셀0.
  Search도 비교에 포함했고, 화면 영역 제외나 차이 허용 마스크는 사용하지 않았다.
- 기본 동작18개와 분리 경계 동작11개 PASS. Mock·타입·Lint·production build PASS.
- [기계 판독 결과와 개별 픽셀 수](assets/TASK-FE-014/verification.json).

## 촬영·비교 조건

Playwright Chromium headless, 배율100%, DPR1. 데스크톱1920×960, 모바일390×844.
같은 브라우저에서 폰트와 이미지 디코딩을 기다리고, 포커스·마우스·스크롤 상태와 애니메이션을 정리했다.
사용자 브라우저의 배율이나 저장 데이터는 변경하지 않았다.

- 21너비: 320/390/480/481/700/701/768/800/801/850/851/1000/1001/1100/1101/1250/1251/1440/1499/1500/1920px.
- 홈·프로필 기본 화면 각각21조건, Show More/Performance/Agents/Deathmatch/빈 요원/요원 필터 각각 desktop·mobile12조건, 총54조건.
- 전체 main의 태그·텍스트·좌표와23개 계산 스타일, 이미지/접근성/SVG 속성을 비교했다. 각 조건 main1개·페이지 가로 넘침0.
- CSS media/selector/declaration560단위를 정규화해 누락·추가 없이 이동했음을 독립 검토했다.
  랭크 그래프 selector만 부모의 기존 단일 SVG를 대상으로 연결했다.
- 캡처 후 CSS 들여쓰기·빈 줄만 정리했다. 선언·selector·우선순위 변경은 없으며 최종 파일로 빌드를 통과했다.

## Before / After

각 쌍의 변경 픽셀은 모두0이다. 모바일 요원 표는 기존처럼 영역 내부에서 가로 스크롤한다.

| 화면·상태 | Before | After | 변경 픽셀 |
|---|---|---|---|
| desktop-agents-tab | [Before](assets/TASK-FE-014/before-desktop-agents-tab.png) | [After](assets/TASK-FE-014/after-desktop-agents-tab.png) | 0 |
| desktop-deathmatch | [Before](assets/TASK-FE-014/before-desktop-deathmatch.png) | [After](assets/TASK-FE-014/after-desktop-deathmatch.png) | 0 |
| desktop-empty-agents | [Before](assets/TASK-FE-014/before-desktop-empty-agents.png) | [After](assets/TASK-FE-014/after-desktop-empty-agents.png) | 0 |
| desktop-filtered-season | [Before](assets/TASK-FE-014/before-desktop-filtered-season.png) | [After](assets/TASK-FE-014/after-desktop-filtered-season.png) | 0 |
| desktop-performance | [Before](assets/TASK-FE-014/before-desktop-performance.png) | [After](assets/TASK-FE-014/after-desktop-performance.png) | 0 |
| desktop-show-more | [Before](assets/TASK-FE-014/before-desktop-show-more.png) | [After](assets/TASK-FE-014/after-desktop-show-more.png) | 0 |
| 홈 데스크톱 전체 | [Before](assets/TASK-FE-014/before-home-desktop.png) | [After](assets/TASK-FE-014/after-home-desktop.png) | 0 |
| 홈 모바일 전체 | [Before](assets/TASK-FE-014/before-home-mobile.png) | [After](assets/TASK-FE-014/after-home-mobile.png) | 0 |
| mobile-agents-tab | [Before](assets/TASK-FE-014/before-mobile-agents-tab.png) | [After](assets/TASK-FE-014/after-mobile-agents-tab.png) | 0 |
| mobile-deathmatch | [Before](assets/TASK-FE-014/before-mobile-deathmatch.png) | [After](assets/TASK-FE-014/after-mobile-deathmatch.png) | 0 |
| mobile-empty-agents | [Before](assets/TASK-FE-014/before-mobile-empty-agents.png) | [After](assets/TASK-FE-014/after-mobile-empty-agents.png) | 0 |
| mobile-filtered-season | [Before](assets/TASK-FE-014/before-mobile-filtered-season.png) | [After](assets/TASK-FE-014/after-mobile-filtered-season.png) | 0 |
| mobile-performance | [Before](assets/TASK-FE-014/before-mobile-performance.png) | [After](assets/TASK-FE-014/after-mobile-performance.png) | 0 |
| mobile-show-more | [Before](assets/TASK-FE-014/before-mobile-show-more.png) | [After](assets/TASK-FE-014/after-mobile-show-more.png) | 0 |
| 요원 표 데스크톱 | [Before](assets/TASK-FE-014/before-profile-desktop-agents.png) | [After](assets/TASK-FE-014/after-profile-desktop-agents.png) | 0 |
| 점수 카드 데스크톱 | [Before](assets/TASK-FE-014/before-profile-desktop-score.png) | [After](assets/TASK-FE-014/after-profile-desktop-score.png) | 0 |
| 시즌 요약 데스크톱 | [Before](assets/TASK-FE-014/before-profile-desktop-season.png) | [After](assets/TASK-FE-014/after-profile-desktop-season.png) | 0 |
| 프로필 데스크톱 전체 | [Before](assets/TASK-FE-014/before-profile-desktop.png) | [After](assets/TASK-FE-014/after-profile-desktop.png) | 0 |
| 요원 표 모바일 | [Before](assets/TASK-FE-014/before-profile-mobile-agents.png) | [After](assets/TASK-FE-014/after-profile-mobile-agents.png) | 0 |
| 점수 카드 모바일 | [Before](assets/TASK-FE-014/before-profile-mobile-score.png) | [After](assets/TASK-FE-014/after-profile-mobile-score.png) | 0 |
| 시즌 요약 모바일 | [Before](assets/TASK-FE-014/before-profile-mobile-season.png) | [After](assets/TASK-FE-014/after-profile-mobile-season.png) | 0 |
| 프로필 모바일 전체 | [Before](assets/TASK-FE-014/before-profile-mobile.png) | [After](assets/TASK-FE-014/after-profile-mobile.png) | 0 |

추가 키보드 포커스 캡처: [홈](assets/TASK-FE-014/after-home-keyboard-focus.png),
[프로필](assets/TASK-FE-014/after-profile-keyboard-focus.png). Before/After44장+추가2장, 총46장.

## 정성 평가

독립 검토자가 시즌 요약·점수·요원 표의 desktop/mobile 대표6쌍을 직접 대조했다.
데스크톱 랭크·도넛·그래프, 주요 수치4열·보조값6열, 점수막대4열과 요원 초상화/행 강조/Best Map 정렬이 유지된다.
모바일 주요 수치2열·보조값3열·점수2열도 유지된다. 새 겹침·잘림·간격 변화는 발견하지 못했다.
모바일 표의 화면 밖 열은 기존 내부 가로 스크롤로 확인하며 페이지 자체는 넘치지 않는다.
이는 로컬 Chromium 결과와 독립 검토이며 정식 Cursor 리뷰·사용자 검토를 대체하지 않는다.

## 동작 검증

- 기본18개: 홈·프로필 Search hover/키보드 포커스, 홈 More Escape/포커스 복원,
  데모 이동, 프로필 검색 안내/토스트 수명, 프로필 More 토글, 링크·Mock 안내 닫기,
  sticky 내비, 6탭, 요원9경기, 단일 경기 펼침·상세 탭 초기화, 패배7/Reset/20→23경기,
  Act 전환, 시즌 빈 상태·Reset, 즐겨찾기 재방문, 홈/프로필→라인업 공용 스타일 복원.
- 추가11개: 하위 경기 필터가 시즌 요약·점수·요원 집계를 바꾸지 않음,
  요원 선택이 기존 패배 조건을 보존하며 Matches로 이동, Show More의 탭/Act 변경 유지,
  All Acts/플랫폼 집계, Deathmatch 명칭·항목, 빈 시즌0값/등급 없음/0%막대/표 안내,
  Reset의 원래 값 복원, Mock 갱신은 안내만 변경, 공유 성공/실패 안내,
  모바일 표 내부 스크롤, 저장소 차단 시 방문 중 저장 안내.
- 각 브라우저 스크립트의 pageerror0. 실제 Riot 조회나 실시간 데이터 검증은 하지 않는다.

## 실행한 명령과 결과

```sh
# 번들 Node로 실행한 임시 Playwright 스크립트
node /tmp/fe014-visual.cjs before
node /tmp/fe014-visual.cjs after
node /tmp/fe014-interactions.cjs
node /tmp/fe014-summary-interactions.cjs

docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
docker compose -f docker/compose.frontend.yml ps
git diff --check
```

Playwright54조건·29동작, Pillow22쌍 대조 PASS. Mock/타입 PASS, Lint0경고0오류,
production build 정적11페이지 생성 PASS. 개발 서버127.0.0.1:3000 재실행 확인.
컨테이너의 기존 `git: not found`는 빌드 메타데이터 fallback이며 빌드 실패가 아니다.
임시 스크립트는 저장소에 추가하지 않았다. 검증 JSON과 캡처를 근거로 보관한다.

## 유지한 한계

이미지·Mock 값/산식·고정 랭크 문구와 그림·실제 API 미연결 상태를 유지했다.
기존 `LAST 20 MATCHES` 제목, 페이지별 More/계정 차이도 변경하지 않았다.
공통 카드/제목/색/스크롤/빈 상태 CSS는 기존 파일을 공유한다. 나머지 프로필과 상태/데이터 분리는 후속 Task다.
