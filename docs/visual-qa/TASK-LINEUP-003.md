# TASK-LINEUP-003 — 관리자 활성/비활성 시각·동작 검증

- 날짜: 2026-10-15
- 결과: PASS
- 기준: 기존 관리자 카드·지도·반응형 배치를 유지하며 상태 선택지만 두 개로 단순화한다.
- 환경: Chromium/Playwright, PC 1440×1000, 모바일 390×844. 실제 프론트 소스 localhost:3001, 실제 FastAPI 앱+메모리 Mongo localhost:8001, 공개된 테스트 전용 토큰 사용.
- 실제 Atlas·실제 관리자 토큰은 사용하지 않았다. 이미지는 임시 경로에만 저장하며 Git/Docker 이미지에는 들어가지 않는다.

## Before / After

| 화면 | Before | After |
| --- | --- | --- |
| 예시 목록·상태 필터 | [Before](/private/tmp/gameprobe-status-qa/before-list.png) | [After](/private/tmp/gameprobe-status-qa/after-list.png) |
| PC 편집·상태 선택 | [Before](/private/tmp/gameprobe-status-qa/before-editor.png) | [After](/private/tmp/gameprobe-status-qa/after-editor.png) |
| 모바일 편집 | [Before](/private/tmp/gameprobe-status-qa/before-editor-mobile.png) | [After](/private/tmp/gameprobe-status-qa/after-editor-mobile.png) |

- 상태 설명을 가리지 않는 [PC 닫힌 선택지](/private/tmp/gameprobe-status-qa/after-editor-closed.png)와 [모바일 상태 영역](/private/tmp/gameprobe-status-qa/after-status-mobile.png)도 확인했다.
- 실제 API 응답 목록: [PC](/private/tmp/gameprobe-status-qa/after-real-list.png), [모바일](/private/tmp/gameprobe-status-qa/after-real-list-mobile.png).

## 시각 평가

- 초안·검토 대기·게시·반려가 활성·비활성으로 바뀌었다. 목록 필터에는 모든 상태·활성·비활성 세 선택지만 표시된다.
- 활성은 기존 초록 계열 강조, 비활성은 회색 보조색을 사용한다. 기존 어두운 카드·파란 버튼·노란 안내와 일관된다.
- PC 지도/입력 두 열과 모바일 한 열 구조가 유지된다. 상태 설명은 선택지 아래에서 자연스럽게 줄바꿈하고 테두리를 벗어나지 않는다.
- 목록 뱃지·선택지 화살표·모바일 버튼에서 글자 겹침, 잘림, 가로 넘침이 발견되지 않았다.
- Before 전체 화면은 선택지를 누른 스크롤 위치에서 고정 헤더가 중간에 캡처되었다. 최종 After는 맨 위로 이동한 전체 화면과 실제 모바일 뷰포트 캡처를 함께 제공한다.

- 별도 검토자가 Before 목록/편집/모바일과 After 목록/PC 편집/모바일 상태/실제 모바일 목록 7장을 교차 검토했다. 활성 청록색·비활성 중립색과 텍스트가 명확하며 잘림·겹침이 없어 독립 시각 검토도 PASS다.

## 동작 검증

`node /private/tmp/gameprobe-status-qa/after.cjs`: 13개 PASS, 런타임 오류 0.

1. 예시 목록 필터의 활성/비활성 선택지.
2. PC·모바일 편집 선택지와 공개 의미 설명, 가로 넘침 없음.
3. 기존 published/draft/review/rejected 문서가 실제 API에서 활성/비활성으로 표시됨.
4. 관리자 활성 2개/비활성 4개 필터 일치.
5. 비활성 저장 후 공개 목록 제외 및 공개 상세 404.
6. 활성 저장 후 공개 목록·상세 200 복귀, 경로·도착점·ID·등록 시각 보존.
7. 새로고침 후 저장 상태 유지.
8. 기본 비활성 등록, 중간 지점 2개 순서 유지, 공개 상세 차단.
9. 비활성 공략 관리자 삭제 유지.
10. 실제 자료 목록 모바일 가로 넘침 없음.
11. 조회만 한 기존 문서의 과거 저장값 불변(일괄 변경 없음).
12. 실제 스모크 관리 준비 중 유지.
13. 브라우저 런타임 오류 없음.

추가 단위 테스트는 기본값/새 공략 복사, API 상태 왕복, 예시 활성 전환, 비활성·알 수 없는 값·좌표 없는 자료의 공개 차단, 예시 종료 시 공개 예시 분리를 검증한다.

## 한계

- 첫 실행의 예시 종료 버튼 이름과 두 번째 실행의 저장 후 접힌 상세 설정을 테스트 선택자가 잘못 가정했다. 실제 흐름에 맞춘 최종 실행에서 13개 모두 통과했다. 제품 코드의 동작 오류는 발견되지 않았다.
- 영상 재생이나 실제 게임에서의 좌표 정확성을 검증하는 작업은 아니다.
- 일반 사용자 화면의 실제 API 연결은 이번 범위가 아니다. 공개 여부는 실제 FastAPI 공개 응답으로 확인했다.
