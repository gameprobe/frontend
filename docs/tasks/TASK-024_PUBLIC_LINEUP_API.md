# TASK-024_PUBLIC_LINEUP_API: 사용자 라인업 목록 API 연결

> 2026-10-02 기록 정리: 아래는 당시 작업·검증 기록이다. 폐기된 DB별 명령·설정은 제거했으며,
> 현재 MongoDB 실행·검증 방법은 [실행 안내](../backend/MONGODB.md)와
> [TASK-BE-001](../tasks/TASK-BE-001.md)을 따른다. 과거 PASS를 MongoDB 검증 결과로 해석하지 않는다.

## Status

DONE (2026-09-16)

## Goal

사용자 라인업 목록을 기존 Mock 데이터 중심 화면에서 공개 백엔드 API 중심으로 전환한다.
백엔드가 반환하는 `PUBLISHED` 라인업을 검색·필터 카드에 표시하고, API 장애 시에만
기존 Preview 데이터를 보조 fallback으로 사용한다.

## Scope

- `/lineups` 공개 목록 API 연결
- 백엔드 응답을 기존 카드 모델로 정규화
- 맵·요원·스킬 슬롯 필터 유지
- 로딩·API 오류·Mock fallback 상태 표시
- 기존 상세 링크와 관리자 화면 영향 없이 연결
- 브라우저 개발 origin CORS 허용

## Allowed changes

- `frontend/src/app/lineups/page.tsx`
- `frontend/src/components/LineupSearchFilter.tsx`
- `frontend/src/lib/lineup-api.ts`
- `frontend/src/types/lineup.ts`
- `frontend/src/lib/asset-map.ts`
- `frontend/src/app/globals.css`
- `frontend/public/assets/SOURCES.md`
- `frontend/public/assets/agents/*`
- `frontend/public/assets/abilities/*`
- `frontend/public/assets/maps/*`
- `screenshots/public-lineups-before.png`
- `screenshots/public-lineups-after-desktop.png`
- `screenshots/public-lineups-after-mobile.png`
- `docs/visual-qa/TASK-024_PUBLIC_LINEUP_API.md`
- `docs/tasks/TASK-024_PUBLIC_LINEUP_API.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `backend/src/main/resources/application.yml`
- `backend/src/main/kotlin/com/valorant/platform/common/config/CorsConfig.kt`
- `.agent-reports/CURRENT.md`
- `.agent-reports/HANDOFF.json`

## Forbidden changes

- 백엔드 스키마/API 계약 변경
- 관리자 인증 방식 변경
- 관리자 편집기 변경
- 즐겨찾기·댓글·신고 기능
- 신규 npm 패키지 추가

## Verification commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
```

## Result

- 사용자 `/lineups`가 `GET /api/lineups`를 호출하고 공개 응답을 기존 카드 모델로 정규화합니다.
- API 로딩 중에는 상태를 안내하고, API 실패 시 기존 Preview 데이터를 유지하면서 오류와 fallback 상태를 표시합니다.
- 전체 공식 맵 17개·요원 29명·C/Q/E/X 스킬 종류를 선택지로 제공하고 상세/YouTube 링크를 유지했습니다.
- 모든 맵과 좌표를 시계방향 90도 기준으로 정렬했습니다.
- 도착 지점에 실제 스킬 아이콘을 표시하고, 클릭 전 경로를 숨깁니다. 연결 요원이 하나면 요원·경로를 즉시 표시하고, 여러 개면 요원 아이콘을 선택한 뒤 선택한 경로를 표시합니다.
- Riot Public Content Catalog 기반으로 전 요원 및 스킬 아이콘을 로컬 자산으로 추가했습니다.
- 모바일 390px에서 가로 overflow 없이 카드 목록을 확인했습니다.
- Strats.gg 방식에 맞춘 맵 우선 진입(17개 이미지 카드)과 맵 선택 후 요원·스킬·공수 지도 탐색 흐름을 적용했습니다.
- 꼬인 Next.js 생성 캐시를 재생성한 뒤 개발 서버를 단독 재시작해 `/lineups` Server Error를 해결했습니다.
- 팀 데스매치 맵 5종을 제거하고, 요원 선택 전 스킬 숨김·요원별 스킬 아이콘 표시 흐름을 적용했습니다.
- 공격/수비 전환을 라인업의 `side` 데이터 필터에 연결해 공격과 수비 라인업을 독립적으로 표시하고, 공수 전환 시 기존 경로 선택을 초기화했습니다.

### 변경 파일

- `frontend/src/app/lineups/page.tsx`
- `frontend/src/components/LineupSearchFilter.tsx`
- `frontend/src/lib/lineup-api.ts`
- `backend/src/main/resources/application.yml`
- `backend/src/main/kotlin/com/valorant/platform/common/config/CorsConfig.kt`
- `screenshots/public-lineups-before.png`
- `screenshots/public-lineups-after-desktop.png`
- `screenshots/public-lineups-after-mobile.png`
- `docs/visual-qa/TASK-024_PUBLIC_LINEUP_API.md`

### 검증

- `cd frontend && npx tsc --noEmit` — PASS
- `cd frontend && npm run lint` — PASS
- `cd frontend && npm run build` — PASS
- 브라우저 `/lineups` Preview/fallback 및 Published API 상태, 1440px/390px 가로폭 — PASS
- 브라우저 `/lineups` 전체 필터 선택지와 스킬→요원→경로 표시 흐름 — PASS
- 당시 DB 통합 API: 관리자 저장·목록·공개 전환·공개 목록·상세 응답 — PASS
- 실제 프론트(`3000`) → 백엔드(`8080`) 브라우저 호출 — PASS (Published API 카드 표시)
- 공개 상세 화면에서 마커 2개, 경로, YouTube 플레이어, Sova 설정 — PASS
- 브라우저 `/lineups` 맵 카드 17개 표시, Ascent 선택 후 지도·요원 선택 30개·스킬 선택 UI 표시 — PASS
- 브라우저 공격→수비 전환 및 Server Error 없음 — PASS
- 브라우저 경쟁 맵 12개 및 팀 데스매치 맵 제외 — PASS
- 브라우저 요원 선택 전/후 스킬 영역과 실제 아이콘 표시 — PASS
- 브라우저 공격/수비 라인업 독립 필터와 요원별 스킬 아이콘 — PASS

### 남은 위험

- 기본 개발 origin은 `http://localhost:3000`이며, 운영 환경은 `CORS_ALLOWED_ORIGINS`로 명시적으로 설정해야 합니다.
