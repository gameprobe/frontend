# TASK-ADMIN-001 — 관리자 라인업 CRUD 시각·브라우저 검증

- 날짜: 2026-10-15
- 결과: PASS
- 기준: 현재 프로젝트 관리자 화면의 기존 디자인·지도 편집 흐름 유지.
- 실제 프론트 소스를 별도 Vite localhost:3001로 실행하고, 실제 FastAPI 앱을 가짜 Mongo 저장소와 테스트 토큰으로 localhost:8001에 실행했다. 실제 Atlas·비밀값은 사용하지 않았다.
- Chromium / Playwright. 데스크톱 1440×1000, 모바일 390×844.
- 이미지는 로컬 임시 경로에만 저장했다. Git·Docker 이미지에 포함하지 않으며 임시 폴더 정리 시 사라질 수 있다.

## Before / After

| 화면 | Before | After |
| --- | --- | --- |
| 인증 | [Before](/private/tmp/gameprobe-admin-crud-qa/before-gate.png) | [After](/private/tmp/gameprobe-admin-crud-qa/after-gate.png) |
| 목록 | [Before](/private/tmp/gameprobe-admin-crud-qa/before-list.png) | [After](/private/tmp/gameprobe-admin-crud-qa/after-list.png) |
| PC 편집 | [Before](/private/tmp/gameprobe-admin-crud-qa/before-editor.png) | [After](/private/tmp/gameprobe-admin-crud-qa/after-editor.png) |
| 모바일 편집 | [Before](/private/tmp/gameprobe-admin-crud-qa/before-editor-mobile.png) | [After](/private/tmp/gameprobe-admin-crud-qa/after-editor-mobile.png) |

## 시각 평가

- 기존 어두운 배경, 카드 테두리, 파란 주 버튼과 노란 안내 표현을 유지했다.
- PC 지도/입력 2열 및 모바일 1열 구조가 유지되었다. 삭제·미리보기·저장 버튼이 모바일 폭 안에 배치된다.
- 드롭다운 화살표, 지도 점/경로, 경고 문구가 카드 영역에 배치되며 겹침·잘림이 발견되지 않았다.
- DB 관리 안내, 실제 스모크 준비 중 표시와 이전 형식 자료 제외 안내가 기존 UI와 일치한다.
- 구현자와 독립 검토자가 실제 캡처를 각각 확인했다. 브라우저에서도 모바일 가로 넘침이 없음을 확인했다.

## 동작 검증

`node /private/tmp/gameprobe-admin-crud-qa/browser.cjs`: 21개 PASS.

잘못된 토큰 거부, 인증 성공·실제 목록, 목록 실패 후 재시도, 잘못된 폼 저장 차단, 지도 좌표+중간점 2개 등록, 새로고침 복원, 외부 자료 링크, 저장 503 시 입력 보존, 401 재인증 시 입력 보존, 수정 후 ID/등록 시각 보존, 모바일 가로 넘침 없음, 삭제 취소, 삭제 실패, 삭제 후 새로고침, 삭제된 상세 404, 기존 형식 보호, 실제 스모크 차단, 로그아웃 토큰 제거, 예시 모드 API 분리, 예시 스모크 유지, 런타임 오류 0을 확인했다.

실제 로컬 Docker 환경에서도 프론트 API 주소 localhost:8000, 백엔드 health 200 UP, CRUD OpenAPI, 무인증 목록 401, CORS 사전 요청 200을 확인했다. 실제 토큰으로 Atlas 쓰기는 수행하지 않았다.

## 한계

- 처음 두 실행은 테스트 코드의 버튼/링크 이름이 실제 화면과 달라 멈췄다. 실제 UI 이름으로 선택자를 수정한 최종 실행에서 전체 통과했다.
- 실제 영상 재생 여부나 실제 게임 좌표의 정확성을 검증한 테스트는 아니다.
- 브라우저 자체 뒤로/앞으로 이동 시 미저장 차단과 모바일 저장 버튼 고정은 후속 개선 후보다.
- 임시 테스트 서버는 검증 후 종료한다. 사용자 로컬 Docker 서비스는 계속 실행한다.
