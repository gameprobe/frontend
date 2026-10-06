# TASK-FE-010 — 글자 기준과 레이아웃 밀도 Visual QA

## 비교 조건

- 사용자 localhost Chrome 탭:90%, DPR1.8, viewport2133px.
  Jett 플레이 시간의 CSS 크기는11px였고 화면에는 약9.9px로 표시되었다.
- 사용자 설정을 변경하지 않고 같은 서버의127.0.0.1 주소에서100%로 검증했다.
  데스크톱1920×960, 모바일390×844. 캡처는 동일 조건의 Before/After다.
- 임시 viewport override는 종료 전에 복원했다.
- [90% 배치 참고 캡처](assets/TASK-FE-010/reference-90-percent.jpg).

## Before / After

| 화면 | Before | After |
|---|---|---|
| 홈 데스크톱 | [Before](assets/TASK-FE-010/before-home-desktop.jpg) | [After](assets/TASK-FE-010/after-home-desktop.jpg) |
| 홈 모바일 | [Before](assets/TASK-FE-010/before-home-mobile.jpg) | [After](assets/TASK-FE-010/after-home-mobile.jpg) |
| 프로필 통계 데스크톱 | [Before](assets/TASK-FE-010/before-profile-desktop.jpg) | [After](assets/TASK-FE-010/after-profile-desktop.jpg) |
| 프로필 요원 표 모바일 | [Before](assets/TASK-FE-010/before-profile-mobile.jpg) | [After](assets/TASK-FE-010/after-profile-mobile.jpg) |

## 글자와 배치

- 본문 max1440px는 이전1600px의90%에 해당한다. 배너·간격·장식도 줄이되
  글자 크기는 별도 토큰을 사용한다. 전체 zoom/scale은 사용하지 않았다.
- 플레이 시간:11px(모바일9px)→13px, 표 라벨과 작은 설명은 최소12px.
  본문14px, 입력16px. 큰 숫자와 제목은16/18/20/24/28px 위계로 정리했다.
- `--muted:#b4c2cf`로 회색 글자를 정리했다. 요원 표 배경#202c37과7.83:1,
  기본 패널#111d26과9.42:1, 경기 승리/패배 배경과7.61/8.25:1 대비다.
  이것은 해당 단색 조합의 계산이며 전체 접근성 인증은 아니다.
- 작은 글자를 모바일에서 다시8~11px로 줄이던 규칙을 제거했다. 작은 화면의
  라벨은 줄바꿈하고 score2열/secondary3열/sidebar1열(480px 이하)로 재배치했다.
- 이미지·인체 SVG·승패 색상·필터 데이터 의미는 유지했다.

## 검증 결과

- 프로필13개 너비:320/390/480/700/701/768/850/851/1000/1250/1251/1440/1920px.
  페이지 가로 넘침0, Overview12px 미만 표시 텍스트0, 텍스트 넘침0,
  표시 중인 경기 직접 자식 요소 겹침0. 플레이 시간 전 구간13px.
- 홈7개 너비:320/390/768/1000/1250/1440/1920px. 넘침0, 작은 글자0,
  입력16px 유지. 제목은30/36/38px로 확인했다.
- Agents/Maps/Weapons/Performance 탭320/1440px: 넘침0,12px 미만 표시 텍스트0.
  긴 표는 기존 스크롤 영역에서 가로 이동한다.
- Jett 클릭→9경기 필터, 경기 상세 Overview/Performance, 패배7경기/0W7L,
  전체 결과 복원 및 홈 검색 바로가기 포커스·데모 프로필 이동 PASS.
- 320px 신원·프로모션·랭크·ACCURACY/ROLES·경기 상세를 추가 시각 확인했다.
  랭크 행client/scrollWidth274px 일치, 프로모션 문구 높이70px 안에 배치됨.
- 콘솔 warn/error0. 타입·Lint·production build PASS, 별도 증분 코드 및
  데스크톱 홈/프로필·모바일 프로필 캡처 검토 PASS.

## 사람 확인

사용자는 localhost를100%로 돌려 글자 선명도와 전체 밀도를 확인한다. 배율90%를
계속 적용하면 이번 조정 결과도 추가로 작아진다. 글자를 읽기 쉽게 유지했으므로
행 높이와 모든 요소를 이전90% 화면과 정확히 일치시키는 것은 목표가 아니다.
