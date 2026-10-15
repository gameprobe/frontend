# TASK-FRONTEND-SYNC-001 — Visual QA

Status: PASS

- 기준: origin/dev387a2d3 기존 화면과 origin/main06c02d2 공개 페이지를 통합. 디자인 재설계 없음.
- 환경: 로컬 Docker 개발 프론트 localhost:3000, Chromium Playwright, 1440×1000 / 390×1000. 공개 회귀 일부 모바일390×844.
- Before/After: /, /lineups/ascent/jett, /smokes/ascent, /admin, /insights 각각 PC·모바일. 각10장.
- 추가: 공개 심사·정책·동의 페이지, 관리자 편집, 라인업·스모크 상세 캡처.
- 결과: 공개 배너·푸터 추가 후 기존 지도/관리자 배치 유지. 잘림·겹침·가로 넘침 없음. /insights는 기존404에서 정상 공개 보고서로 변경.
- 편집 전체 페이지 캡처는 스크롤 위치 때문에 sticky header가 중간에 나타났으나 최상단 재촬영 후 정상 확인. 제품 변경 불필요.
- 독립 시각 검토 PASS. 실제 영상 재생 및 다른 화면 폭은 미검증.
- PNG와 실행 스크립트는 /private/tmp/gameprobe-frontend-sync-qa에 저장하며 신규 Git 이미지 추가 없음.

## Evidence

- [Before desktop lineup](/private/tmp/gameprobe-frontend-sync-qa/before-1440-lineups.png)
- [After desktop lineup](/private/tmp/gameprobe-frontend-sync-qa/after-1440-lineups.png)
- [Before mobile smoke](/private/tmp/gameprobe-frontend-sync-qa/before-390-smokes.png)
- [After mobile smoke](/private/tmp/gameprobe-frontend-sync-qa/after-390-smokes.png)
- [After mobile admin](/private/tmp/gameprobe-frontend-sync-qa/after-390-admin-editor.png)
- [After mobile detail](/private/tmp/gameprobe-frontend-sync-qa/after-390-lineup-detail.png)
