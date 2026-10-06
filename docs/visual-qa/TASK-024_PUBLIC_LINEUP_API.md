# TASK-024_PUBLIC_LINEUP_API Visual QA

> 2026-10-02 기록 정리: 아래는 당시 작업·검증 기록이다. 폐기된 DB별 명령·설정은 제거했으며,
> 현재 MongoDB 실행·검증 방법은 [실행 안내](../backend/MONGODB.md)와
> [TASK-BE-001](../tasks/TASK-BE-001.md)을 따른다. 과거 PASS를 MongoDB 검증 결과로 해석하지 않는다.

## Scope

사용자 공개 라인업 목록의 API 상태 안내, Preview fallback, Strats.gg 방향의 맵 중심 탐색, 전체 맵·요원·스킬 필터, 공수 전환, 반응형 레이아웃을 확인했다.

## Evidence

- Before: `screenshots/public-lineups-before.png`
- After desktop: `screenshots/public-lineups-after-desktop.png` at 1440px
- After mobile: `screenshots/public-lineups-after-mobile.png` at 390px

## Result

- 실제 당시 DB `PUBLISHED` 응답이 `Published API` 상태와 함께 사용자 화면에 표시된다.
- 실제 API 카드와 전체 맵·전체 요원·전체 C/Q/E/X 스킬 필터가 유지된다.
- 기존 카드 그리드를 맵 중심 탐색 구조로 전환하고 시작 위치·도착 위치·투사 경로를 맵 위에 표시한다.
- 모든 맵 이미지는 시계방향 90도 회전 기준으로 표시하고 좌표도 동일하게 회전한다.
- 공격 선택은 시계방향 90도, 수비 선택은 여기에 180도를 더한 270도 기준으로 이미지와 좌표를 전환한다.
- 맵·요원·스킬 종류 필터는 네이티브 select 대신 실제 맵/요원/스킬 이미지를 사용하는 선택 버튼으로 표시한다.
- 스킬 도착 지점은 실제 스킬 아이콘으로 표시하며, 클릭 전 시작 요원과 투사 경로를 숨긴다.
- 연결된 시작 요원이 1개면 스킬 클릭 직후 해당 요원과 투사 경로를 표시하고, 여러 개면 요원 아이콘 선택 후 선택한 요원의 경로만 표시한다.
- 도착 지점은 Riot Public Content Catalog에서 추출한 실제 스킬 이미지로 표시하고, 결과 목록과 시작 지점은 실제 요원 이미지로 표시한다.
- GameProbe 전용 색상 중심의 영웅 영역을 중립적인 흰색·회색 데이터베이스 UI로 정리했다.
- 데스크톱 document width는 1440px, 모바일 document width는 390px로 viewport와 일치해 수평 overflow가 없다.
- 상세 보기 및 YouTube 링크가 유지된다.
- 상세 화면에서 요원 위치·스킬 도착 위치·경로·YouTube 플레이어·Sova 설정을 확인했다.
- 스킬 도착 아이콘 클릭 후 단일 후보 요원·경로 즉시 표시와 1440px/390px overflow를 재검증했다.
- Strats.gg의 맵 우선 진입 방식에 맞춰 `/lineups` 첫 화면에 17개 맵 이미지 카드 인덱스를 표시하고, 맵 선택 후에만 요원·스킬 필터와 지도 탐색을 표시한다.
- 맵 카드 선택 및 공격·수비 전환을 브라우저에서 재검증했으며 Server Error 없이 정상 동작한다.
- 팀 데스매치 맵을 제외한 경쟁 맵 12개만 맵 인덱스에 표시한다.
- 맵 선택 후 요원 선택 전에는 스킬 영역을 숨기고, 요원 선택 후 해당 요원의 실제 C/Q/E/X 스킬 아이콘만 표시한다.
- 공격/수비 전환 시 해당 `side` 라인업만 표시하고 반대 진영 라인업은 표시하지 않으며, 선택한 요원의 스킬 아이콘을 사용한다.
- 첫 화면 맵 카드 크기는 유지하고 12개 경쟁 맵별 splash/concept art를 카드 배경으로 표시한다.
- 선택한 맵의 탐색 화면은 라인업 좌표가 맞는 전술 맵 이미지를 계속 사용한다.
- 선택한 맵 화면은 맵 변경 버튼 없이 해당 맵의 splash/concept art를 전술 맵 뒤에 항상 표시한다.
- 필터 패널 하단의 `사용 방법` 안내 영역을 제거하고 요원·스킬 선택 영역에 집중한다.
- Astra 선택 시 Astra C/Q/E/X 실제 아이콘이 placeholder 없이 표시되는 것을 브라우저에서 확인한다.

## Verdict

PASS
