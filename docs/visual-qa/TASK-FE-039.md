# TASK-FE-039 Visual QA

## Result
PASS — PC1440px / 모바일390px. 최종 실제 이미지 대조 및 독립 검토를 포함한다.

## 기준과 범위
- 기존 GameProbe 라인업 테마와 사용자가 제공한 도착점 → 여러 출발점 → 자료 보기 흐름을 기준으로 삼았다.
- 구현 전 Before6장, 최종 예시 After9장, 임시 API 응답 화면4장. 결과 JSON과 캡처를 읽어 이 보고서를 생성했다.
- 관리자·스모크·공통 CSS는 수정하지 않았다. 공개 API의 공유 도착점 계약은 아직 추가하지 않았다.

## Before / After
| 화면 | Before | After |
|---|---|---|
| 1440px destinations | [Before](assets/TASK-FE-039/before-1440-destinations.png) | [After](assets/TASK-FE-039/after-1440-destinations.png) |
| 1440px origins | [Before](assets/TASK-FE-039/before-1440-origins.png) | [After](assets/TASK-FE-039/after-1440-origins.png) |
| 1440px detail | [Before](assets/TASK-FE-039/before-1440-detail.png) | [After](assets/TASK-FE-039/after-1440-detail.png) |
| 390px destinations | [Before](assets/TASK-FE-039/before-390-destinations.png) | [After](assets/TASK-FE-039/after-390-destinations.png) |
| 390px origins | [Before](assets/TASK-FE-039/before-390-origins.png) | [After](assets/TASK-FE-039/after-390-origins.png) |
| 390px detail | [Before](assets/TASK-FE-039/before-390-detail.png) | [After](assets/TASK-FE-039/after-390-detail.png) |

Before: 첫 공략 도착점 하나만 표시하고 스킬 ID로 출발점을 찾았다. 경로 선택과 상세 링크가 서로 다른 공략을 가리킬 수 있었다.
After: 명시적 도착점별 선택 버튼과 개수, 출발점 번호 및 공략 목록을 제공한다. hover/focus는 한 경로만 강조하고 클릭/Enter/터치는 해당 공략의 상세로 이동한다. 같은 예시 원본에서 좌표를 가져온다.

## 시각 확인
- 기존 헤더·색상·글자·카드 테마를 유지했다. 도착점 선택 버튼은 경계와 선택 상태를 구분한다.
- PC 좌측 필터/우측 지도, 모바일 세로 흐름에서 글자 겹침·가로 넘침 없음. 지도 마커와 공략 번호 대응.
- 지도 및 좌표가 같은 정사각형 영역을 사용하고 공수별 회전을 유지한다. 지도 가장자리에 마커가 잘리지 않도록 여백을 둔다.
- 경로는 초록, 강조 경로는 금색이며 범례를 맞췄다. 초점 테두리를 표시한다.
- 임시 API 모바일 캡처의 지연 로딩 이미지를 decode 완료 후 재촬영했고 독립 시각 검토 PASS.
- 전체 페이지 캡처 전 최상단으로 이동하여 고정 헤더가 이미지 중간에 나타나는 캡처 오류를 제거했다.

## 동작 검증
- [Before](assets/TASK-FE-039/before.json), [예시 After](assets/TASK-FE-039/after.json), [API fixture](assets/TASK-FE-039/api-fixtures.json)
- 같은 도착점3공략/별도도착점1공략, hover복원, 이전hover가 남은 상태에서 키보드focus/Enter, 모바일터치, 올바른 상세URL/좌표, 영상없음 안내 PASS.
- 도착점 전환, 맵/요원/스킬/진영 필터 초기화, 빈 예시, 수비회전 PASS.
- 임시production서버의 GET 응답만 Playwright로 대체해 실제공개목록·상세 UI를 검증했다. 운영 API/DB에 쓰기 없음.
- 도착점 ID 없는 같은 스킬·동일좌표2공략은 분리 유지. 겹친 마커는 텍스트 도착점 버튼으로 각각 접근 PASS.
- 빈 경로를 임의 직선으로 만들지 않고 기록된 경로의 원래 순서·좌표를 보존 PASS.
- 출발점 없음/도착점 없음은 공략 목록으로 상세 접근, 성공응답0건은 예시로 바꾸지 않고 빈목록 PASS.
- 실행 예외·가로넘침 없음(각 테스트대상). 전체 운영환경/실미디어 검증을 의미하지 않는다.

## 실행 명령
- `docker exec valorant-frontend-dev-frontend-1 npx tsc --noEmit`: PASS
- `docker exec valorant-frontend-dev-frontend-1 npm run lint`: PASS
- `docker exec valorant-frontend-dev-frontend-1 node src/features/lineup-explorer/model.test.cjs`: 17/17 PASS
- `docker exec valorant-frontend-dev-frontend-1 node src/features/admin/preview/model.test.cjs`: 30/30 PASS
- 임시컨테이너 `valorant-fe039-qa` 내 소스복사본 `npm run build`: PASS, 정적15/15. QA용 localhost API 주소만 설정. 기존 개발 `.next`/환경파일 미변경.
- `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-039/verify.cjs before|after`: PASS
- 같은 환경 `node docs/visual-qa/assets/TASK-FE-039/api-fixtures.cjs`: PASS
- `git diff --check`: PASS

## 수정 및 재검증 기록
- 개발 중 초기 도착점 버튼의 CSS 우선순위를 보완했다. 최종 캡처에 반영했다.
- 독립 코드 검토에서 실제자료의 경로 임의 생성·마우스 hover와 키보드focus 충돌·범례 색 불일치를 찾아 수정 후 재검증했다.
- 초기 브라우저검증의 버튼이름/겹친마커/중복안내 선택자는 실제 제공하는 도착점 버튼과 선택공략 영역으로 한정했다. 검사를 삭제하거나 강제 클릭으로 우회하지 않았다.

## 한계
합성 예시13개(기존10개 ID 유지+추가3개). 실제 영상·이미지나 관리자 저장 자료를 공개하는 기능은 연결하지 않았다. 기존 API 자료는 도착점 ID가 없으므로 공략별 도착점으로 표시한다. 운영 자료의 공유 관계·관리자 자료 저장/공개는 별도 Task다.

- 검증용 임시 컨테이너 `valorant-fe039-qa` 종료·자동 삭제 완료. 기존 개발 서버는 유지했다.


## PR 전 추가 회귀 확인 (2026-10-04)
- 사용자의 다른 화면 영향 확인 요청에 따라 추가 검사했다. 소스 변경 없음.
- 추가 회귀: `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-039/regression.cjs` PASS — PC1440/모바일390, 홈·오버뷰·인사이트·스모크 가이드/진영 전환·관리자 예시 입장/수정/저장/목록/종류별 검색 유지. 16장 캡처, 실행 예외·가로 넘침·네트워크 쓰기 요청 0.
- [결과 JSON](assets/TASK-FE-039/regression.json), [검증 스크립트](assets/TASK-FE-039/regression.cjs).
- 전체 16장 캡처를 모아 시각 확인했다. PC의 좌측 관리 메뉴/지도 배치와 모바일의 세로 배치에서 큰 레이아웃 붕괴는 확인되지 않았다. 기존 페이지와 픽셀 동일성을 비교한 검사는 아니다.
- 관리자 예시에서 제목을 수정해 저장하고 목록으로 돌아온 뒤 검색 유지/스모크 메뉴 왕복을 확인했다. 공유 도착점 잠금과 벽 튕김 지점도 유지된다. 새 브라우저 메모리만 사용했으며 사용자 탭·실제 저장 자료는 변경하지 않았다.
- 스모크 검사 작성 중 버튼 이름 및 존재하지 않는 aria-pressed 가정을 실제 접근성 이름/화면의 수비 결과 표시 기준으로 정정했다. 제품 코드 결함 수정은 없었다.
- 공유 API/타입/관리자 모델의 독립 읽기 전용 검토 PASS. 운영 백엔드·DB·실제 영상 재생 검증은 이 검사 범위에 포함하지 않는다.
