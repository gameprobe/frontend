# TASK-019_LINEUP_DETAIL: 사용자용 라인업 상세 및 YouTube 패널

## Status

READY

## Goal

백엔드 `Lineup` API의 공개 데이터를 사용자용 상세 화면에 연결한다.
맵 위에 여러 스킬/요원 아이콘과 경로를 표시하고, 아이콘을 클릭하면 연결된
YouTube 영상을 화면 안에서 재생할 수 있어야 한다.

## Scope

- `/lineups/[id]` 사용자 상세 라우트
- API에서 공개 라인업 1건 조회
- API 응답과 기존 Mock 라인업 타입 사이의 호환 어댑터
- 맵 위 다중 스킬/요원 마커 렌더링
- 정규화 좌표 기반 경로와 화살표 표시
- 요원 아이콘의 난이도 색상: 초록/주황/빨강
- 스킬 아이콘 클릭 시 YouTube 임베드 패널
- Sova 차징 단계·튕김 횟수 표시
- API 실패/빈 데이터/영상 URL 누락 상태 처리

## API contract

```text
GET /api/lineups/{id}
```

공개 사용자 화면은 `PUBLISHED` 라인업만 표시한다. 개발 중 API base URL은
환경 변수로 주입하고, 정적 Mock 목록에서 상세로 이동하는 경우에도 실제 API
데이터를 우선한다.

## Allowed changes

- `frontend/src/app/lineups/[id]/page.tsx`
- `frontend/src/components/LineupDetail.tsx`
- `frontend/src/lib/lineup-api.ts`
- `frontend/src/types/lineup.ts`
- `frontend/src/app/globals.css`
- `screenshots/lineup-detail-before-list.png`
- `screenshots/lineup-detail-after-desktop.png`
- `screenshots/lineup-detail-after-mobile.png`
- `docs/visual-qa/TASK-019_LINEUP_DETAIL.md`
- `docs/tasks/TASK-019_LINEUP_DETAIL.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `.agent-reports/CURRENT.md`
- `.agent-reports/HANDOFF.json`

## Forbidden changes

- 관리자 편집기 구현
- 백엔드 API/DB 변경
- 즐겨찾기, 댓글, 신고 기능
- 외부 이미지 핫링크 또는 신규 npm 패키지 추가

## Verification commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
```

## Result

- Status: IMPLEMENTED
- 변경된 파일: 상세 라우트, 상세 컴포넌트, API 어댑터, 라인업 타입, 전역 스타일, 시각 QA 보고서 및 Before/After 스크린샷.
- 검증: `npx tsc --noEmit`, `npm run lint`, `npm run build` 모두 PASS.
- 브라우저 검증: Mock 상세 라우트 렌더링 PASS, 스킬 버튼 1개 확인 및 클릭 후 YouTube iframe 1개 확인 PASS, 390px 모바일에서 body width 390px·상세 콘텐츠 width 374px 확인 PASS.
- 남은 위험: 개발/배포 환경에서 `NEXT_PUBLIC_BACKEND_URL`을 백엔드 주소로 설정해야 하며, API 실패 시 기존 Mock 데이터로 fallback한다.
