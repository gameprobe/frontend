# TASK-019_LINEUP_DETAIL Visual QA

## Scope

사용자용 라인업 상세 화면의 맵 오버레이, 다중 마커, 경로, 난이도 표시,
YouTube 패널 및 모바일 반응형을 확인했다.

## Evidence

- Before: `screenshots/lineup-detail-before-list.png`
- After desktop: `screenshots/lineup-detail-after-desktop.png`
- After mobile: `screenshots/lineup-detail-after-mobile.png`
- Desktop DOM: 라인업 제목, 맵, 요원 마커, 스킬 버튼, 경로 범례, YouTube iframe 렌더링 확인.
- Interaction: `Recon Bolt 영상 보기` 버튼이 유일하게 resolve되며 클릭 후 iframe 1개가 유지됨.
- Mobile DOM: viewport 390px, body width 390px, 상세 페이지 width 374px로 수평 overflow 없음.

## Visual review

- 데스크톱: 맵이 주 콘텐츠로 배치되고 오른쪽에 영상/설정 패널이 고정되어 정보 위계가 명확하다.
- 데스크톱: 요원 위치는 난이도 링, 스킬 도착 위치는 번호 마커, 경로는 노란 점선으로 구분된다.
- 모바일: 상세 헤더 → 맵 → 영상 → 요원 설정 순서로 단일 열 재배치되며 overflow가 없다.
- YouTube iframe은 별도 외부 이미지 핫링크가 아니라 사용자가 요청한 영상 임베드로만 사용된다.

## Verdict

`PASS` — 발견된 blocker/major 시각 결함 없음.
