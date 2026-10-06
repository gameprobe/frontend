# TASK-FE-018 — 경기 상세 연결·Tracker 모달 Visual QA

Status: PASS — 2026-09-20 구현자 및 독립 보조 에이전트 검증 완료. 사용자/Cursor 검토 대기.

## 최종 단계 — 실제 Tracker 비율 보완

판정: **PASS**. 사용자의 “비슷하지만 다르다”는 피드백에 따라 실제 Chrome Tracker 경기 상세의 DOM 계산 스타일과 화면을 비교했다. 이번에는 모달 전용 CSS 7개와 Performance 표시 JSX 1개만 보완했다. 기존 기능·인라인·데이터 공급·이미지는 변경하지 않았다.

### 비교와 변경

| 항목 | 변경 전 | 변경 후 / 참고 기준 |
| --- | --- | --- |
| PC 상세 최대 폭 | 1,680px | 1,400px (Tracker 실제 측정) |
| 정보 헤더 / 탭 | 86px / 54px | 56px / 56px (Tracker 상단 합112px) |
| 창 위치·높이 | 가운데, 화면 높이에 고정 | 하단 정렬, 내용 높이 및 최대 높이 제한; 모바일은 전체 화면 |
| Scoreboard 행 / 초상 | 50px / 40px | 56px / 44px, 이름16px·중간 굵기 |
| Performance | 아이콘 아래 이름·추가 제목·짧은 라운드 카드 | 선수띠 단순화, 중간 제목 정리, 이름32px·수치24px·라운드160px |
| Rounds / Duels | 정보 영역 비율과 표 밀도 차이 | Rounds 38/22/40, Duels 카드·선수 열·행 간격 조정 |

글꼴은 실제 Tracker가 Roboto, 현재 앱이 Arial 계열임을 확인했다. 이번에는 외부 폰트를 추가하지 않았다. 실제 게임 이미지와 미제공 데이터 차이도 남으므로 픽셀 단위 동일함을 주장하지 않는다. 표본 고지와 누락 설명은 보존한다.

### 최종 검증

- Playwright 상세 동작 **42그룹**, 추가 폭320·768·1000·1440에서 **20개 탭/폭 조합 PASS**. pageerror 0, 문서·모달·활성 탭 가로 넘침 0.
- 데스크톱1728×941 Scoreboard 본문 높이와 scrollHeight가 모두 **736px**이며 두 팀 10명을 한 화면에서 표시한다.
- 모바일390×844는 모달 전체 화면과 표/선수/라운드 영역 내부 가로 스크롤을 유지한다.
- 정렬·선수 선택·누락값·키보드·포커스 복귀·Escape/배경/닫기·목록 위치·다른 프로필·Deathmatch PASS.
- 홈/닫힌 프로필 PC·모바일의 DOM/계산 스타일/좌표 **4조건 동일**. 인라인 관련 파일은 이전 검증 해시와 동일하며 기존 캡처를 보존했다.
- Docker Mock/상세Mock/누락SSR·타입·Lint·build PASS. Lint경고/오류0, 정적11페이지.
- 초기 캡처의 오프스크린 lazy 이미지 대기를 보완했고, 짧은 탭 아래 빈 공간은 dialog inset 수정 후 재촬영·동작 재검증했다.
- [측정값·동작·소스 해시·명령 전체](assets/TASK-FE-018/fidelity-verification.json).

독립 보조 에이전트도 최종 PC/모바일10장을 직접 대조해 **시각 PASS**로 판정했다. 새 겹침·의도치 않은 잘림·과도한 여백은 없었고, 모바일 표/타임라인 스크롤과 안내 가독성을 확인했다. 별도 Cursor 리뷰는 아니다.
개발 서버 복원 후 HTTP200·최소글자12px/닫기44px·Escape/잠금해제 smoke PASS. 문서링크176개·소스해시31개·캡처20장·보고서150파일·기본modal 검사 PASS.

### Before / After

| 탭 | PC Before | PC After | 모바일 Before | 모바일 After |
| --- | --- | --- | --- | --- |
| Scoreboard | [desktop before](assets/TASK-FE-018/fidelity-before-desktop-scoreboard.png) | [desktop after](assets/TASK-FE-018/fidelity-after-desktop-scoreboard.png) | [mobile before](assets/TASK-FE-018/fidelity-before-mobile-scoreboard.png) | [mobile after](assets/TASK-FE-018/fidelity-after-mobile-scoreboard.png) |
| Performance | [desktop before](assets/TASK-FE-018/fidelity-before-desktop-performance.png) | [desktop after](assets/TASK-FE-018/fidelity-after-desktop-performance.png) | [mobile before](assets/TASK-FE-018/fidelity-before-mobile-performance.png) | [mobile after](assets/TASK-FE-018/fidelity-after-mobile-performance.png) |
| Economy | [desktop before](assets/TASK-FE-018/fidelity-before-desktop-economy.png) | [desktop after](assets/TASK-FE-018/fidelity-after-desktop-economy.png) | [mobile before](assets/TASK-FE-018/fidelity-before-mobile-economy.png) | [mobile after](assets/TASK-FE-018/fidelity-after-mobile-economy.png) |
| Rounds | [desktop before](assets/TASK-FE-018/fidelity-before-desktop-rounds.png) | [desktop after](assets/TASK-FE-018/fidelity-after-desktop-rounds.png) | [mobile before](assets/TASK-FE-018/fidelity-before-mobile-rounds.png) | [mobile after](assets/TASK-FE-018/fidelity-after-mobile-rounds.png) |
| Duels | [desktop before](assets/TASK-FE-018/fidelity-before-desktop-duels.png) | [desktop after](assets/TASK-FE-018/fidelity-after-desktop-duels.png) | [mobile before](assets/TASK-FE-018/fidelity-before-mobile-duels.png) | [mobile after](assets/TASK-FE-018/fidelity-after-mobile-duels.png) |

이번 캡처20장과 검증 JSON을 추가했다. 앞선 PNG88장·JSON3개는 당시 단계의 근거로 보존하며, 현재 단계는 위 fidelity 파일을 기준으로 확인한다.

## 이전 단계 — Tracker 상세 5탭 디자인

판정: **PASS**. 기본 모달은 Scoreboard / Performance / Economy / Rounds / Duels 5탭이며, 설정을 `inline`으로 바꾸면 기존 4탭이 그대로 복원된다. 아래 근거는 비율 보완 전 단계의 화면 기준이다. 이전 단계의 캡처와 JSON은 변경 이력으로 보존한다.

### 검증 결과

- 모달 상세 42그룹 + 기존 회귀 18그룹 = **60그룹 PASS**. 추가 반응형 20조건과 독립 CSS 25조건 PASS.
- 1920×960 / 390×844 및 폭 320·768·1000·1440에서 탭 전환, ARIA 연결, 키보드, 정렬, 선수 선택, 누락 상태를 확인했다. 페이지·dialog·활성 탭 본문 가로 넘침과 pageerror는 0이다.
- 닫기/Escape/노출된 배경 클릭, 포커스 순환·복귀, 배경 잠금, 내부 스크롤 시 헤더/탭 고정, 경기 행/최근 경기 스트립의 위치 복원을 확인했다. 모바일은 전체 화면이므로 클릭할 배경이 없으며 닫기/Escape를 사용한다.
- Scoreboard 양 팀 정렬·누락값 뒤배치, Performance 선수 변경·교전/무기 정렬, Economy 3가지 선택, Rounds 키보드 선택, Duels 제공 5조합/미제공 20조합을 확인했다. Deathmatch와 다른 프로필 신원도 통과했다.
- 홈·닫힌 프로필 PC/모바일 **4쌍 픽셀 차이 0**. 기존 DOM·계산 스타일·좌표 비교도 4조건 동일하다.
- 실제 설정을 인라인으로 전환해 **22그룹·16반응형 조건 PASS**, 인라인 스코어보드/성과 **4쌍 픽셀 차이 0**. `finally`에서 모달로 원문 복원 후 표시 구성에 대한 주석만 승인대로 명확히 했다.
- root 최종 Docker 원본/상세 Mock·누락 SSR·타입·Lint·production build PASS(정적 경로 11개). 서버 복원 HTTP200 및 재시작 후 모달5탭/닫기/포커스/잠금해제 smoke PASS.
- 전체 PNG **88장** = 검증 캡처83(기존52 + Tracker Before8 + After19 + 인라인 복원4) + 사용자 레퍼런스5. After19는 기능17/키보드2이며, 레퍼런스는 원본 바이트 그대로 복사했다. JSON3개를 각각 보존한다.

측정값·60개 동작 항목·CSS25조건·최종 소스 SHA-256은 [tracker-verification.json](assets/TASK-FE-018/tracker-verification.json)에 기록했다. 홈/프로필 픽셀 원본은 `/tmp/tracker-before-*`와 `/tmp/tracker-after-*`, 인라인 원본은 `/tmp/fe018-tracker-inline-restored-full-*`에 보관했다.

### 참고 캡처와 육안 대조

사용자 제공 5개 상세 캡처를 PC/모바일 최종 5탭과 직접 대조했다. 청회색 헤더와 5탭·팀 색 띠·교차 행·라운드 띠·탭별 정보 배치를 재현했으며, 새 겹침이나 의도하지 않은 잘림은 발견되지 않았다. 작은 화면의 표·참가자/라운드 띠·탭 목록은 각 영역 안에서 가로 스크롤한다. 긴 내용은 활성 탭 내부에서 세로 스크롤한다.

| 탭 | 대조 결과 | 데이터 차이 처리 |
| --- | --- | --- |
| Scoreboard | 청회색 정보 헤더·균등 5탭·승리 타임라인·청록/붉은 팀 띠·교차 행·정렬 열 강조·선택 선수 표시 | 평균/개별 랭크와 FK/FD/MK 미제공은 —. Tracker TRS 대신 별도 의미의 PS를 고지한다. |
| Performance | 가운데 모인 양 팀 선수띠/VS·선수 초상화와 요약·라운드 띠·Attack/Defense·상대/무기 표 | 라운드 개인 킬/데스·공수별 통계·피해값을 만들지 않는다. 다른 선수 선택 시 제공된 요약만 표시한다. |
| Economy | 상단 평균 정보·Bank/Loadout/Total 선택·그래프 영역·하단 양 팀 스코어보드 | 경제 표본이 없어 추정 곡선 대신 선택 항목별 미제공 안내를 표시한다. |
| Rounds | 가로 라운드 선택 띠·선택 라운드 제목·팀 참가자 표/Event Log/Player Positions 3영역 | 팀 승패/누적 점수만 사용한다. 라운드 개인 기록/종료 원인/이벤트/좌표/지도는 임의로 생성하지 않는다. |
| Duels | 상단 3개 요약 카드·청록/붉은 선수 축·교차 행·킬/데스 색상 칩의 매트릭스 | 전체 Top Rivalry/Mismatch 순위를 추정하지 않고 조회 선수 합계/5개 제공 조합/20개 미제공 안내로 대체한다. |

참고 이미지 파일명:

- Scoreboard: [codex-clipboard-de4468e2-4f97-4d0b-adc6-dbd43f3f0086.png](assets/TASK-FE-018/tracker-reference-scoreboard.png)
- Performance: [codex-clipboard-0ae785d5-ec12-492c-9445-9aaec282ddb5.png](assets/TASK-FE-018/tracker-reference-performance.png)
- Economy: [codex-clipboard-6ae53d0c-19b4-4a6a-864c-8924d3373359.png](assets/TASK-FE-018/tracker-reference-economy.png)
- Rounds: [codex-clipboard-7cb0cc2f-59fe-49b4-91e9-4a399084e876.png](assets/TASK-FE-018/tracker-reference-rounds.png)
- Duels: [codex-clipboard-bd6dbf65-c492-4d5b-9a2a-515995e06967.png](assets/TASK-FE-018/tracker-reference-duels.png)

### 발견한 문제와 수정 확인

Economy의 기본 grid 열이 스코어보드 최소 폭 1290px을 따라 늘어나 모바일에서 보기 버튼과 미제공 안내가 잘렸다. 문서 전체의 넘침 검사만으로는 이 문제를 찾을 수 없었다. `.economy`에 `grid-template-columns: minmax(0, 1fr)`를 적용해 전체 탭 폭은 화면에 맞추고 표만 내부 스크롤하도록 수정했다. 활성 `tabpanel.scrollWidth <= clientWidth` 검사를 모든 탭/폭에 추가한 최종42그룹·20조건과 독립CSS25조건을 재통과했고 After17장을 다시 촬영했다. 수정된 모바일 Economy도 직접 재확인했다.

검증 스크립트의 KAST 선택자에서 부모 범위를 중복한 1회 오류는 지역 선택자로 고쳤다. 앱 결함은 아니며 최종 검증에는 수정한 선택자를 사용했다.

### 이번 단계 캡처 전체

| 구분 | 파일 |
| --- | --- |
| After | [tracker-after-desktop-content-scrolled.png](assets/TASK-FE-018/tracker-after-desktop-content-scrolled.png) |
| After | [tracker-after-desktop-deathmatch.png](assets/TASK-FE-018/tracker-after-desktop-deathmatch.png) |
| After | [tracker-after-desktop-duels.png](assets/TASK-FE-018/tracker-after-desktop-duels.png) |
| After | [tracker-after-desktop-economy.png](assets/TASK-FE-018/tracker-after-desktop-economy.png) |
| After | [tracker-after-desktop-performance-other-player.png](assets/TASK-FE-018/tracker-after-desktop-performance-other-player.png) |
| After | [tracker-after-desktop-performance.png](assets/TASK-FE-018/tracker-after-desktop-performance.png) |
| After | [tracker-after-desktop-rounds.png](assets/TASK-FE-018/tracker-after-desktop-rounds.png) |
| After | [tracker-after-desktop-scoreboard.png](assets/TASK-FE-018/tracker-after-desktop-scoreboard.png) |
| After | [tracker-after-home-keyboard-focus.png](assets/TASK-FE-018/tracker-after-home-keyboard-focus.png) |
| After | [tracker-after-mobile-content-scrolled.png](assets/TASK-FE-018/tracker-after-mobile-content-scrolled.png) |
| After | [tracker-after-mobile-deathmatch.png](assets/TASK-FE-018/tracker-after-mobile-deathmatch.png) |
| After | [tracker-after-mobile-duels.png](assets/TASK-FE-018/tracker-after-mobile-duels.png) |
| After | [tracker-after-mobile-economy.png](assets/TASK-FE-018/tracker-after-mobile-economy.png) |
| After | [tracker-after-mobile-performance-other-player.png](assets/TASK-FE-018/tracker-after-mobile-performance-other-player.png) |
| After | [tracker-after-mobile-performance.png](assets/TASK-FE-018/tracker-after-mobile-performance.png) |
| After | [tracker-after-mobile-rounds.png](assets/TASK-FE-018/tracker-after-mobile-rounds.png) |
| After | [tracker-after-mobile-scoreboard-scrolled.png](assets/TASK-FE-018/tracker-after-mobile-scoreboard-scrolled.png) |
| After | [tracker-after-mobile-scoreboard.png](assets/TASK-FE-018/tracker-after-mobile-scoreboard.png) |
| After | [tracker-after-profile-keyboard-focus.png](assets/TASK-FE-018/tracker-after-profile-keyboard-focus.png) |
| Before | [tracker-before-desktop-analysis.png](assets/TASK-FE-018/tracker-before-desktop-analysis.png) |
| Before | [tracker-before-desktop-performance.png](assets/TASK-FE-018/tracker-before-desktop-performance.png) |
| Before | [tracker-before-desktop-rounds.png](assets/TASK-FE-018/tracker-before-desktop-rounds.png) |
| Before | [tracker-before-desktop-scoreboard.png](assets/TASK-FE-018/tracker-before-desktop-scoreboard.png) |
| Before | [tracker-before-mobile-analysis.png](assets/TASK-FE-018/tracker-before-mobile-analysis.png) |
| Before | [tracker-before-mobile-performance.png](assets/TASK-FE-018/tracker-before-mobile-performance.png) |
| Before | [tracker-before-mobile-rounds.png](assets/TASK-FE-018/tracker-before-mobile-rounds.png) |
| Before | [tracker-before-mobile-scoreboard.png](assets/TASK-FE-018/tracker-before-mobile-scoreboard.png) |
| 인라인 복원 | [tracker-inline-restored-desktop-performance.png](assets/TASK-FE-018/tracker-inline-restored-desktop-performance.png) |
| 인라인 복원 | [tracker-inline-restored-desktop-scoreboard.png](assets/TASK-FE-018/tracker-inline-restored-desktop-scoreboard.png) |
| 인라인 복원 | [tracker-inline-restored-mobile-performance.png](assets/TASK-FE-018/tracker-inline-restored-mobile-performance.png) |
| 인라인 복원 | [tracker-inline-restored-mobile-scoreboard.png](assets/TASK-FE-018/tracker-inline-restored-mobile-scoreboard.png) |

### 실행 근거와 한계

```sh
node /tmp/fe018-tracker-before.cjs
node /tmp/fe018-tracker-after.cjs
node /tmp/fe018-tracker-regressions.cjs
python3 /tmp/fe018-tracker-inline-cycle.py
python3 /tmp/fe018-tracker-results.py
git diff --check
```

독립 CSS 측정은 `/tmp/fe018-tracker-css-audit.json`, 설정 복원은 `/tmp/fe018-tracker-config-restoration.json`, 인라인 픽셀 대조는 `/tmp/fe018-tracker-inline-pixels.json`에 기록했다. 위 node/python 명령은 번들 런타임으로 실행했다.

검증 브라우저는 Chromium이다. Safari/Firefox·실기기 터치는 검사하지 않았다. 레퍼런스의 실제 경기와 현재 Mock은 서로 다르므로 레퍼런스 전체 픽셀 일치는 판정 기준으로 삼지 않았다. 원본 레퍼런스에만 있는 랭크·라운드 개인 기록·경제·좌표·전체 교전 순위를 만들지 않았고, 새 게임 자산도 추가하지 않았다.

## 이전 단계 — 모달 기본 + 인라인 보존

사용자가 긴 인라인 상세의 페이지 이동 문제를 확인하고 모달 전환을 승인했다.
`detail/presentation.ts`의 `matchDetailPresentation`은 최종 `modal`이다.
`inline`으로 변경하면 기존 펼침이 복원되며 네 탭·Mock·누락 처리는 두 방식이 공유한다.

최종 모달은 경기 정보·표본 안내·탭·닫기를 고정하고 활성 탭 내용만 스크롤한다.
닫기 버튼/Escape/노출된 배경 클릭 후 원래 목록 위치와 버튼 포커스로 복귀한다.
모바일은 전체 화면이므로 클릭할 바깥 배경이 없으며 닫기 버튼/Escape를 사용한다.

| 화면 | 인라인 Before | 모달 After | 인라인 복원 확인 |
| --- | --- | --- | --- |
| PC 스코어보드 | [Before](assets/TASK-FE-018/before-modal-desktop-scoreboard.png) | [After](assets/TASK-FE-018/after-modal-desktop-scoreboard.png) | [복원](assets/TASK-FE-018/after-inline-restored-desktop-scoreboard.png) |
| PC 성과 | [Before](assets/TASK-FE-018/before-modal-desktop-performance.png) | [After](assets/TASK-FE-018/after-modal-desktop-performance.png) | [복원](assets/TASK-FE-018/after-inline-restored-desktop-performance.png) |
| 모바일 스코어보드 | [Before](assets/TASK-FE-018/before-modal-mobile-scoreboard.png) | [After](assets/TASK-FE-018/after-modal-mobile-scoreboard.png) | [복원](assets/TASK-FE-018/after-inline-restored-mobile-scoreboard.png) |
| 모바일 성과 | [Before](assets/TASK-FE-018/before-modal-mobile-performance.png) | [After](assets/TASK-FE-018/after-modal-mobile-performance.png) | [복원](assets/TASK-FE-018/after-inline-restored-mobile-performance.png) |

| 추가 상태 | PC | 모바일 |
| --- | --- | --- |
| 라운드 | [After](assets/TASK-FE-018/after-modal-desktop-rounds.png) | [After](assets/TASK-FE-018/after-modal-mobile-rounds.png) |
| 분석 | [After](assets/TASK-FE-018/after-modal-desktop-analysis.png) | [After](assets/TASK-FE-018/after-modal-mobile-analysis.png) |
| 내부 세로 스크롤 | [After](assets/TASK-FE-018/after-modal-desktop-content-scrolled.png) | [After](assets/TASK-FE-018/after-modal-mobile-content-scrolled.png) |
| Deathmatch | [After](assets/TASK-FE-018/after-modal-desktop-deathmatch.png) | [After](assets/TASK-FE-018/after-modal-mobile-deathmatch.png) |

- [모바일 표 끝 열](assets/TASK-FE-018/after-modal-mobile-scoreboard-scrolled.png)
- [홈 키보드 포커스](assets/TASK-FE-018/after-modal-home-keyboard-focus.png)
- [프로필 키보드 포커스](assets/TASK-FE-018/after-modal-profile-keyboard-focus.png)

### 모달 단계 검증 결과

- 모달 32그룹 + 기존 회귀 18그룹 = 50그룹 PASS. 추가 반응형 16조건 PASS.
- 행 Enter, 네 탭/ARIA/좌우키, Tab·Shift+Tab 순환, 배경 wheel 잠금, 내부 스크롤과 상단 고정,
  Escape·닫기·배경 클릭, 목록/스트립 위치와 포커스 복귀, 필터·더 보기·Deathmatch·다른 프로필을 확인했다.
- 홈·닫힌 프로필 PC/모바일 4쌍은 글자·스타일·배치·픽셀 차이 0.
  행의 `aria-haspopup=dialog` 추가는 의도된 접근성 변경으로 별도 기록했다.
- 설정을 실제 `inline`으로 바꿔 22그룹·반응형 16조건 PASS. 모달 없음 및 기존 펼침/초기화 동작을 확인했다.
  인라인 복원 스코어보드·성과 PC/모바일 4쌍은 Before와 픽셀 차이 0.
- 설정을 다시 `modal`로 복원한 뒤 원본/상세/누락 검사·타입·Lint·production build 모두 PASS.
  개발 서버 복원·HTTP 200과 모달 열기/닫기/스크롤 잠금 해제 최종 smoke PASS.
- 독립 CSS 확인: 1920/1440/768/390/320px × 네 탭 20조건 PASS, 12px 미만 글자·문서/dialog 가로 넘침 없음.
  닫기 버튼 44×44px. 1920×960에서 본문 clientHeight=scrollHeight=672px로 양 팀 10명이 한 화면에 보인다.
  작은 화면에서는 본문 내부 세로 스크롤과 표 내부 가로 스크롤을 사용한다.
- 최종 모달 PC/모바일 13장 육안 검토 PASS: 제목 겹침·배치 붕괴 없이 고정 상단과 스크롤 본문이 구분된다.

초기 native dialog는 마지막 Tab/처음 Shift+Tab에서 브라우저 UI로 빠지는 단계가 있었다.
키보드 경계 순환을 보완하고 전체 모달 검증·최종 캡처를 다시 완료했다. 수정 전 캡처를 최종 근거로 쓰지 않는다.
Docker/브라우저 기본 sandbox 권한 오류는 승인된 실행 권한으로 재실행해 통과했다.

이 단계의 결과는 [modal-verification.json](assets/TASK-FE-018/modal-verification.json)에 기록했다.
기존 `verification.json`과 PNG 29장을 보존했다. 이 이전 단계 당시 PNG는 **52장**
(기존29 + 모달 Before4 + 모달 After15(키보드2 포함) + 인라인 복원4)이다.

실행 스크립트는 번들 Node의 `/tmp/fe018-modal-before.cjs`, `/tmp/fe018-modal-after.cjs`,
`/tmp/fe018-interactions.cjs`, `/tmp/fe018-modal-restored-smoke.cjs` 및 인라인 재검증용 기존 After 스크립트다.
상세 명령·임시 측정 파일은 modal-verification.json에 기록했다.
Before는 모달 소스 수정 전에 캡처하고 해시로 확인했다. 모달은 viewport 캡처, 인라인은 기존 문서 좌표 자르기를 사용했다.
운영 배포·다른 브라우저 엔진·별도 Cursor 검토는 이번 검증에 포함하지 않는다.

## 연결 단계 기록 (모달 전환 이전)

아래는 기존 두 탭에서 네 탭 인라인으로 연결했던 단계의 검증이다. 해당 소스 분기와 근거는 보존한다.

## 기준과 의도한 변경

- 기준: PR #10 병합 `17da56c`, 작업 브랜치 `codex/profile-match-detail-restore`.
- Before는 현재 프로필의 인라인 Overview/Performance 두 탭이다. 기존 상세 컴포넌트의
  스코어보드·라운드·성과·분석 네 탭을 연결하고 현재 프로필의 글자·표면색·테두리 기준을 적용한다.
- 사용자가 제공한 기존 팀 스코어보드 화면의 두 팀·개인 지표 구조를 재사용한다.
  Tracker 참고 화면의 새 모달/전체 열/경제·교전 탭까지 구현하는 작업은 아니다.
- 현재 목록을 유지하고 필요한 상세 Mock을 보강한다. 상세는 의도적으로 달라지므로
  Before와 픽셀 동일성을 요구하지 않는다. 홈·닫힌 프로필은 동일해야 한다.

## 환경과 측정

Playwright Chromium headless, 브라우저 배율 100%, DPR 1.
주 캡처 크기는 데스크톱 1920×960 / 모바일 390×844, 추가 반응형 폭은 320/768/1000/1440px다.
홈·닫힌 프로필의 main DOM, 문구, 좌표, 계산 스타일 23개, ARIA/id, 이미지/SVG 속성과
전체 PNG를 비교했다. 네 상세 탭은 렌더링·키보드·누락 상태·표 스크롤을 확인했다.

상세 이미지는 Playwright 전체 페이지 캡처에서 문서 좌표로 자른 것이다.
고정 내비게이션 촬영 간섭을 피하기 위한 자르기만 했으며 색상 수정·마스킹은 하지 않았다.
측정값과 자르기 좌표는 [verification.json](assets/TASK-FE-018/verification.json)에 보관한다.
Before 8장 + After 21장 = PNG 29장이다.

## Before/After

| 화면 | 데스크톱 Before | 데스크톱 After | 모바일 Before | 모바일 After |
| --- | --- | --- | --- | --- |
| 홈 | [Before](assets/TASK-FE-018/before-desktop-home.png) | [After](assets/TASK-FE-018/after-desktop-home.png) | [Before](assets/TASK-FE-018/before-mobile-home.png) | [After](assets/TASK-FE-018/after-mobile-home.png) |
| 닫힌 프로필 | [Before](assets/TASK-FE-018/before-desktop-profile.png) | [After](assets/TASK-FE-018/after-desktop-profile.png) | [Before](assets/TASK-FE-018/before-mobile-profile.png) | [After](assets/TASK-FE-018/after-mobile-profile.png) |
| 기존 Overview → 스코어보드 | [Before](assets/TASK-FE-018/before-desktop-detail-overview.png) | [After](assets/TASK-FE-018/after-desktop-detail-scoreboard.png) | [Before](assets/TASK-FE-018/before-mobile-detail-overview.png) | [After](assets/TASK-FE-018/after-mobile-detail-scoreboard.png) |
| 성과 | [Before](assets/TASK-FE-018/before-desktop-detail-performance.png) | [After](assets/TASK-FE-018/after-desktop-detail-performance.png) | [Before](assets/TASK-FE-018/before-mobile-detail-performance.png) | [After](assets/TASK-FE-018/after-mobile-detail-performance.png) |

| 추가 확인 | 데스크톱 | 모바일 |
| --- | --- | --- |
| 라운드 | [After](assets/TASK-FE-018/after-desktop-detail-rounds.png) | [After](assets/TASK-FE-018/after-mobile-detail-rounds.png) |
| 분석 | [After](assets/TASK-FE-018/after-desktop-detail-analysis.png) | [After](assets/TASK-FE-018/after-mobile-detail-analysis.png) |
| 라운드 선택 | [After](assets/TASK-FE-018/after-desktop-round-selected.png) | [After](assets/TASK-FE-018/after-mobile-round-selected.png) |
| Deathmatch 미제공·개인 요약 | [After](assets/TASK-FE-018/after-desktop-deathmatch-missing.png) | [After](assets/TASK-FE-018/after-mobile-deathmatch-missing.png) |
| 다른 프로필 신원 | [After](assets/TASK-FE-018/after-desktop-alternate-identity.png) | [After](assets/TASK-FE-018/after-mobile-alternate-identity.png) |

- [모바일 표 끝 열까지 스크롤](assets/TASK-FE-018/after-mobile-scoreboard-scrolled.png)
- [홈 Search 키보드 포커스](assets/TASK-FE-018/after-home-keyboard-focus.png)
- [프로필 Search 키보드 포커스](assets/TASK-FE-018/after-profile-keyboard-focus.png)

## 동작·시각 검증 결과

| 구분 | 실제 결과 |
| --- | --- |
| 홈·닫힌 프로필 4조건 | DOM·23개 계산 스타일·좌표 동일, 4쌍 PNG 변경 픽셀 0 |
| 상세 22그룹 | PC/모바일 네 탭·ARIA 연결·키보드 좌우 순환·라운드 선택·모바일 표 스크롤 PASS |
| 상세 상태 | 재펼침·다른 경기·스트립의 기본 탭 초기화, 필터/프로필 탭 변경 시 닫힘, 더 보기 PASS |
| 데이터별 표시 | 선택 경기와 선수 기록, 다른 프로필 신원, Deathmatch 네 탭의 미제공 안내와 개인 지표 PASS |
| 기존 동작 18그룹 | 검색·More·계정/푸터·알림·고정 내비게이션·프로필 탭·필터·즐겨찾기·라인업 이동 후 공통 외곽 복원 PASS |
| 추가 16조건 | 320/768/1000/1440px × 네 탭, 탭 작동 및 페이지 가로 넘침 0 |
| 최종 캡처 육안 검토 | PC/모바일 네 탭의 새 겹침·카드 붕괴 없음. 페이지 오류 0 |

스코어보드의 두 팀·선택 선수·핵심 지표가 기존 상세 구조를 유지하면서 현재 카드 테마에 맞게 배치된다.
좁은 화면에서는 열을 숨기지 않고 팀 표 안에서만 가로 스크롤하며 HS% 끝 열까지 접근할 수 있다.
표 포커스·탭 포커스는 식별 가능하다. 상세 표와 안내 문구에는 12px 미만 글자를 사용하지 않는다.

라운드는 선택 테두리와 누적 점수를 보여주고, 없는 종료 원인은 `—`와 설명으로 구분한다.
킬 이벤트·좌표가 없으면 기록 미제공 안내가 나타나며 실제 좌표처럼 보일 빈 지도 도형도 숨긴다.
성과의 무기·교전 표본과 분석의 제공 가능한 지표는 표시한다. 미제공 피해 합계를 0으로 계산하지 않는다.
Deathmatch는 5대5 팀 상세를 만들지 않고 개인 기록을 유지하며 지원하지 않는 KAST도 추가하지 않는다.
화면 상단·하단에 Mock임을 명시한다.

독립 CSS 검토에서는 320/390/700/768/1250/1920px × 네 탭 24조건에서 넘침·12px 미만 글자 없음도 확인했다.
모바일 교전 표의 마지막 차이 열이 보이도록 너비를 보완한 뒤 최종 캡처에 반영했다.
최종 좌표 미제공 패널도 PC/모바일에서 안내 13px, 지도 도형/위치 범례 없음, 넘침 0을 확인했다.

## 실행 근거

컨테이너에서 다음 검사를 순서대로 실행하고 모두 통과했다.

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && node src/features/tracker-profile/match-history/detail/mockDetail.test.cjs && node src/features/tracker-profile/match-history/detail/missingData.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/players/ied-agent-allen
git diff --check
```

- 원본 Mock 검사 PASS. 상세 검사 34개 팀 경기·2개 Deathmatch PASS.
  경기/선수 신원·개인 수치·팀 합계·라운드·무기/교전 분포 일치와 잘못된 ID/요약 거절을 확인했다.
- 누락 SSR 검사 PASS. FK/FD 미제공과 실제 0, viewer 없음, 일부 피해 누락,
  무기/교전 미제공과 명시적 빈 배열, 종료 원인·좌표 누락과 제공된 기록의 보존을 확인했다.
- 타입 검사·Lint(경고/오류 0)·production build(11개 정적 페이지) PASS.
  마지막 좌표 누락 UI 수정 이후 전체 검증을 재실행했다.
- 개발 서버 복원 후 프로필 HTTP 200. 컨테이너 `git: not found`는 기존 메타데이터 fallback 경고다.

브라우저 측정은 로컬 번들 런타임으로 다음 임시 스크립트를 실행했다.

```sh
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /tmp/fe018-before.cjs
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /tmp/fe018-after.cjs
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /tmp/fe018-interactions.cjs
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 /tmp/fe018-after-assets.py
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 /tmp/fe018-results.py
```

Before 스크립트는 소스 수정 전에 실행했다. 임시 원본은 `/tmp/fe018-before.json`,
`/tmp/fe018-after.json`, `/tmp/fe018-interactions.json`, `/tmp/fe018-unchanged-pixels.json`에 있다.
최종 결과와 정성 관찰은 저장소의 verification.json에 보존한다.
초기 키보드 검사에서 비활성 탭에 포커스만 주고 활성화를 가정하던 스크립트를 수정했다.
스코어보드를 선택한 뒤 실제 좌우 키로 순환하는 방식으로 확인했으며 앱 결함은 아니었다.

## 검증 범위의 한계

- 상세는 UI 시연용 Mock이다. 실제 Riot 응답·통계 산식·실시간 데이터는 검증하지 않았다.
- 원본에 없는 다른 참가자의 요원은 기존 placeholder를 사용한다. 이미지 추가는 이번 범위가 아니다.
- 추가 반응형 조건은 동작/넘침 검사이며 모든 폭의 전체 스크린샷을 저장한 것은 아니다.
- 기본 select 값은 selectOption으로 바꿨다. OS 네이티브 선택 팝업의 키보드 조작까지 검증했다고 주장하지 않는다.
  탭·버튼·라운드 선택·표 스크롤은 실제 키 입력으로 확인했다.
- 외부 브라우저/운영 배포·별도 Cursor 리뷰는 아직 진행하지 않았다.
