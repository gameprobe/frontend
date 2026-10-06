# TASK-FE-026 Smoke Page Visual QA

## Scope

Smoke 전용 맵 인덱스, `/lineups`·`/smokes` 맵 상세 필터, 인라인 맵 선택, 전술 지도, 연막 선택 상태를 확인했습니다.

## Screenshots

- Before reference: `screenshots/smokes-before.png` — 기존 `/lineups` 탐색 화면을 Smoke 페이지 추가 전 기준선으로 캡처
- After desktop: `screenshots/smokes-after-desktop.png`
- After mobile: `screenshots/smokes-after-mobile.png`
- Lineups after desktop: `screenshots/lineups-after-desktop.png`
- Lineups after mobile: `screenshots/lineups-after-mobile.png`

## Checks

- 12개 경쟁 맵 카드 표시: PASS
- 맵 선택 전 상세 필터·전술 지도 숨김: PASS
- Ascent 선택 후 공격/수비·사이트·연막 유형 필터 표시: PASS
- 컨트롤러 필터 제거 및 좌측 6명 연막 크기·지속시간 비교표 표시: PASS
- `모든 연막 (바이퍼 제외)`·Harbor 일자 연막 유형만 표시하고 바이퍼 유형은 숨김: PASS
- 연막 도착 아이콘 선택 전 경로 숨김: PASS
- 연막 선택 후 투척 위치·투사 경로·설치 단계 표시: PASS
- 공통 유형 1개 가이드 및 Harbor 유형 1개 가이드 표시: PASS
- Harbor 일자 연막 선택 후 경로 1개 표시: PASS
- 기존 `/lineups` Ascent 선택 후 Viper 요원 선택지 표시: PASS
- `/lineups` 상세에서 선택 맵 컨셉 아트·이름 버튼 표시: PASS
- `/smokes` 상세에서 선택 맵 컨셉 아트·이름 버튼 표시: PASS
- 두 페이지에서 맵 변경 버튼 클릭 시 12개 맵 목록 펼침 및 Haven 전환: PASS
- 두 페이지 상세 전술 지도에서 컨셉 아트 배경 제거, 전술 맵만 표시: PASS
- `/lineups` 요원 선택 아이콘 29개 전체 표시: PASS
- `/lineups` 공격 90°·수비 270° 맵 회전 시각 확인: PASS
- Harbor 일자 연막 선택 후 `smoke-wall-line` 1개 표시: PASS
- 공격→수비 전환 시 선택 상태 초기화 및 수비 데이터 표시: PASS
- 데스크톱 화면 시각 확인: PASS
- 390px 모바일 화면 시각 확인: PASS
- 모바일 `scrollWidth === clientWidth` (`390 === 390`): PASS

## Notes

Smoke 데이터는 현재 Preview 예시입니다. 실제 서비스 전에는 패치별 좌표 검증이 필요합니다. 모바일 After 캡처는 고정 헤더가 겹치지 않는 viewport 기준으로 저장했습니다. 맵 선택 컨트롤과 맵 카드의 컨셉 아트는 유지하고, 상세 전술 지도 배경 레이어만 제거했습니다.
