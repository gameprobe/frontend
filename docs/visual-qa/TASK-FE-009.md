# TASK-FE-009 — 100% 기준 크기 조정 Visual QA

## 기준

- Chrome에서 사용자 localhost 탭의 80% 배율을 원인으로 확인했다. 사용자가
  100%로 복원한 뒤 DPR 2, viewport 1920px 상태에서 이번 작업을 시작했다.
- Before/After는 같은 Chrome에서 데스크톱 1920×907, 모바일 390×844로 캡처.
- 기준은 새 100% Before 화면과 사용자가 지정한 홈·프로필 전체 크기 조정이다.
  이전 80% 캡처와 픽셀 크기를 직접 비교하지 않는다.
- 모바일은 viewport capability로 검증했다. 브라우저 배율을 변경하지 않았고
  테스트 viewport override는 종료 전 복원했다.

## Before / After

| 화면 | Before | After |
|---|---|---|
| 홈 데스크톱 | [Before](assets/TASK-FE-009/before-home-desktop.jpg) | [After](assets/TASK-FE-009/after-home-desktop.jpg) |
| 홈 모바일 | [Before](assets/TASK-FE-009/before-home-mobile.jpg) | [After](assets/TASK-FE-009/after-home-mobile.jpg) |
| 프로필 데스크톱 | [Before](assets/TASK-FE-009/before-profile-desktop.jpg) | [After](assets/TASK-FE-009/after-profile-desktop.jpg) |
| 프로필 모바일 | [Before](assets/TASK-FE-009/before-profile-mobile.jpg) | [After](assets/TASK-FE-009/after-profile-mobile.jpg) |
| 경기 목록 데스크톱 | [Before](assets/TASK-FE-009/before-matches-desktop.jpg) | [After](assets/TASK-FE-009/after-matches-desktop.jpg) |

## 결과

- 브랜드/내비 높이 48/68→44/60px, 모바일 44/64→44/56px.
  홈·프로필의 override도 일치한다. 모바일 검색·More는 44px를 유지한다.
- 홈 제목 48→42px, 모바일35→32px. 배너와 검색 영역 및 카드 여백을 줄여
  첫 화면에서 다음 섹션이 더 보인다. 설명 15~16px, 입력16px는 유지했다.
- 프로필 배너·아바타·탭·프로모션 높이와 섹션 간격 감소. 이름/버튼/이미지
  겹침 없음. 경기 시간13px, 라벨12px 유지. 경기 행은 데스크톱 약85px,
  좁은 모바일141px로 가독성과 두 줄 구성을 보존했다.
- 프로필 320/390/768/850/851/1000/1250/1251/1440/1920px에서 페이지
  가로 넘침 및 경기 행의 표시 중인 직접 자식 요소 겹침 0.
- 홈 320/390/768/1000/1250/1440/1920px에서 가로 넘침 0.
- 320px More 메뉴가 화면 내 표시(left127/right312), 검색 바로가기 입력
  포커스 및 SeoulDuelist#KR1 검색으로 데모 프로필 이동 PASS.
- 390px 경기 펼침·닫기 PASS. 패배 필터7개/0W7L, 전체 복원20개 PASS.
- 콘솔 warn/error 0. 독립 코드·캡처 검토 PASS: 제목·검색·신원 영역 겹침,
  잘림 및 의도하지 않은 CSS override 회귀 없음.
- 타입·Lint·production build PASS. 모바일 터치 및 실제 모니터의 크기 선호는
  사람이 최종 확인한다. 라인업·전역·데이터·인체 SVG는 변경하지 않았다.
