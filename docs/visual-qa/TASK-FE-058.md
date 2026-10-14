# TASK-FE-058 Visual QA — 기존 팀원 작업 이관

Playwright 기반 CUA로 로컬 http://localhost:3000에서 변경 전후를 촬영하고 이미지를 직접 확인했다. 데스크톱1280×720, 추가 모바일390×844 검사. 초기 lazy 이미지가 로드되기 전 사진은 최종 이미지로 교체했다.

| 화면 | Before | After | 판정 |
| --- | --- | --- | --- |
| 관리자 | /admin 404 | 예시 입장·목록·편집 화면 | 화면 체험 고지와 목록·입력 배치 정상 |
| 스모크 | /smokes 즉시 어센트 가이드 | 맵10개 선택 → /smokes/:mapId | 기존 스타일 유지, 맵 이미지 모두 로드 |
| 라인업 | 개별 도착지 마커 | 동일 도착지 묶음·출발지3곳·경로 | 지도와 목록 배치 정상, 선택 경로 확인 |
| 모바일 | 별도 Before 없음 | 관리자·라인업·스모크390px | 가로 넘침0, 텍스트 겹침 없음 |

## 실제 기능 검사
- PASS: 관리자 하위 경로의 예시 입장 가드
- PASS: 잘못된 코드 거부 및 DEMO1234 공백 정규화 입장
- PASS: 빈 저장 차단과 유튜브 외 URL 거부
- PASS: 지도 도착·출발·중간 지점 키보드 지정
- PASS: 예시 공략 저장·목록 반영·새로고침 초기화
- PASS: 라인업 도착지의 출발지3곳 펼침과 출발지 선택
- PASS: 라인업 쿼리 및 nocookie iframe autoplay 주소 확인
- PASS: 스모크 맵10개 및 상세 이동
- PASS: 스모크 출발지3곳 펼침과 영상 iframe 주소
- PASS: 이전 map 쿼리 주소 변환 및 직접 경로 새로고침
- PASS: 잘못된 맵 ID 404
- PASS: 390px 관리자·라인업·스모크 가로 넘침0
- PASS: 맵 이미지10개 로딩 완료
- PASS: 관측 브라우저 오류로그0

## 한계
마우스 포인터 hover 자체를 자동 조작하지는 않았다. 같은 펼침 동작을 사용하는 포커스/클릭과 모바일 탭 방식으로 확인했다. 유튜브 iframe 목적지·autoplay 연결은 확인했으나 실제 외부 영상의 재생 완료는 확인하지 않았다. 관리자 자료는 메모리 예시이며 저장/초기화 검사는 실제 운영 데이터를 변경하지 않는다. 원본의 전체 자동화 회귀 스크립트를 재실행한 것은 아니다.

## 화면 증거
- [after-admin-editor.png](../../screenshots/TASK-FE-058/after-admin-editor.png)
- [after-admin-gate.png](../../screenshots/TASK-FE-058/after-admin-gate.png)
- [after-admin-list.png](../../screenshots/TASK-FE-058/after-admin-list.png)
- [after-admin-mobile.png](../../screenshots/TASK-FE-058/after-admin-mobile.png)
- [after-lineups-mobile.png](../../screenshots/TASK-FE-058/after-lineups-mobile.png)
- [after-lineups.png](../../screenshots/TASK-FE-058/after-lineups.png)
- [after-smokes-mobile.png](../../screenshots/TASK-FE-058/after-smokes-mobile.png)
- [after-smokes.png](../../screenshots/TASK-FE-058/after-smokes.png)
- [before-admin.png](../../screenshots/TASK-FE-058/before-admin.png)
- [before-lineups.png](../../screenshots/TASK-FE-058/before-lineups.png)
- [before-smokes.png](../../screenshots/TASK-FE-058/before-smokes.png)
