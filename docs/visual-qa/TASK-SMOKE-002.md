# TASK-SMOKE-002 — Visual QA

Status: PASS

- 기준: 기존 어두운 카드/파란 강조 디자인을 유지하며 스모크 입력을 한 점으로 단순화한다. 공개 지도에서는 실제 저장된 active 자료만 표시한다.
- 환경: localhost:3000 Docker frontend, Chromium Playwright, 1440×1000 및 390×1000. 실제 FastAPI는 localhost:8001의 격리 메모리 DB를 사용했다.
- Before: 기존 예시 공개 지도와 관리자 스모크 목록·편집 각2개 화면 폭, 총6장.
- After: 실제 목록·편집, 공개 지도·상세. 관리자·공개 지도에서 동일 저장 좌표의 위치와 방향 일치.
- 결과: PC 카드 분할 및 모바일 세로 배치 정상. 입력/버튼/긴 설명 겹침·잘림·가로 넘침 없음. 원은 위치 표시이며 실제 연막 반경이 아님을 안내한다.
- 독립 시각 검토 PASS. 모바일 full-page 캡처는 맨 위로 스크롤한 상태를 기준으로 확인했다.
- 모든 신규 PNG/QA 스크립트는 /private/tmp/gameprobe-smoke-qa에 저장하며 Git에 포함하지 않는다. 실제 Atlas 쓰기 없음.

## Evidence

- [Before 관리자 PC](/private/tmp/gameprobe-smoke-qa/before-1440-admin-editor.png)
- [After 관리자 PC](/private/tmp/gameprobe-smoke-qa/after-1440-admin-editor.png)
- [Before 공개 PC](/private/tmp/gameprobe-smoke-qa/before-1440-public.png)
- [After 공개 PC](/private/tmp/gameprobe-smoke-qa/after-1440-public.png)
- [After 관리자 모바일](/private/tmp/gameprobe-smoke-qa/after-390-admin-editor.png)
- [After 공개 모바일](/private/tmp/gameprobe-smoke-qa/after-390-public.png)
- [After 상세 모바일](/private/tmp/gameprobe-smoke-qa/after-390-detail.png)
