# TASK-015UI12G-B: 라운드 1-24 수평 스트립 + 킬 로그·2D 좌표 플로터

## Status

READY (선행 TASK-015UI12G-A DONE·커밋 `d47a818` 완료로 승격, 다음 구현 후보)

> 마스터 플랜 `docs/tasks/TASK-015UI12G.md` 및 `ux_evaluation_report.md` §2 기준.
> 신규 Mock+타입 전체 승인(2026-06-24) 범위 내에서 라운드 슬라이스(killEvents·좌표)만 추가한다.

## Goal

`MatchRoundsTab.tsx`의 세로 텍스트 목록을 OP.GG/Tracker.gg식 **수평 라운드 타임라인 + 인터랙티브 상세**로 재설계한다.

1. **수평 라운드 스트립 (1-24)**: 상세 패널 상단에 콤팩트한 가로 스트립(현재 Mock은 22라운드)을 배치한다. 각 라운드 칩은 우리 팀 기준 승/패 색상(승 Blue/Green, 패 Red)과 종료 방식 아이콘(제압/스파이크 폭발/해제)을 표시한다. 스트립은 라운드 선택 네비게이션 역할을 한다(sticky 권장).
2. **선택 라운드 상세**: 칩 선택 시 해당 라운드의 **킬 로그**(킬러→피해자, 무기, 시간, 퍼스트킬/헤드샷 표시)를 2열 또는 로그 형태로 렌더한다.
3. **2D 맵 좌표 플로터**: 선택 라운드의 킬/데스 좌표를 스타일라이즈드 전술 그리드(0~1 정규화 좌표) 위에 점으로 플롯한다. 실제 미니맵 PNG는 신규 자산이므로 기본은 CSS 그리드 배경(미니맵 사용은 별도 사람 결정).

## Background

- 현재 `MatchRoundsTab.tsx`는 라운드 결과 칩 스트립·구간 요약·로그 행(UI8B)을 갖지만, 킬 단위 이벤트·좌표가 없어 "텍스트 목록" 인상이 남아 있다. `MatchRoundTimeline.tsx` 기존 컴포넌트를 재사용/확장할 수 있다.
- `MatchRound`에는 `roundNumber/winningTeam/endType/scoreAfterRound`만 있어 킬 이벤트·좌표는 신규 Mock이 필요하다(마스터 정본 G-B 슬라이스).
- 좌표는 정규화(0~1)로 저장해 배경 렌더 방식과 독립시킨다.

## Allowed Changes

- `frontend/src/types/match.ts` — `MatchRound.killEvents?: RoundKillEvent[]`, `RoundKillEvent`, `MapPoint` 타입 추가(optional + Mock 주석).
- `frontend/src/data/mock-data.json` — `mock-match-ascent-001` 라운드들에 `killEvents`(킬러/피해자 puuid는 기존 참가자 10명 puuid와 일치, 무기 slug는 기존 weaponId 체계, 정규화 좌표) Mock 추가.
- `frontend/src/components/MatchRoundsTab.tsx` — 수평 스트립·선택 상세·플로터 통합.
- `frontend/src/components/MatchRoundTimeline.tsx` — 기존 타임라인 재사용/확장(필요 시).
- **신규 컴포넌트 허용**: `frontend/src/components/MatchRoundMapPlotter.tsx`(2D 좌표 플로터).
- `frontend/src/app/globals.css` — 스트립·로그·플로터 스타일.

## Forbidden Changes

- 마스터 Forbidden 상속. 스코어보드/성과/분석 슬라이스(G-A/C/D) 수정 금지.
- 실제 미니맵 PNG 등 외부 실 자산 신규 취득 금지(기본 CSS 그리드). 신규 패키지 금지. Git 커밋 금지.

## Required UI Changes

1. 라운드 칩 스트립: 22개 칩, 승/패 색상 + 종료 아이콘, hover/focus/선택 상태, sticky 상단 고정.
2. 선택 라운드 킬 로그: 시간순 정렬, 킬러/피해자 요원·이름, 무기, 퍼스트킬/헤드샷 마커.
3. 2D 플로터: 정규화 좌표 점 플롯(킬=공격 측 톤, 데스=피해 측 톤), 라운드 전환 시 갱신.
4. 킬 이벤트가 없는 라운드는 "이벤트 기록 없음(Mock)"로 안전 폴백.

## Acceptance Criteria

1. 수평 1-24(현재 22) 스트립이 승/패·종료 방식을 한눈에 보여주고 라운드 네비게이션으로 동작하는가.
2. 칩 선택 시 해당 라운드 킬 로그와 2D 좌표 플로터가 정확히 갱신되는가.
3. killEvents의 puuid/weaponId가 기존 참가자·무기 체계와 정합하고, 좌표가 0~1 범위인가.
4. 신규 타입이 optional+Mock 주석이고 Mock/Preview 고지가 유지되는가.
5. `tsc`/`lint`/`build` 통과 및 Allowed 범위 준수.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
grep -n "killEvents\|RoundKillEvent\|MapPoint" frontend/src/types/match.ts
```

## Stop Conditions

- 미니맵 실 자산/신규 패키지 필요 시 중단. 동일 검증 에러 3회 시 `BLOCKED`.

## Result

(구현 후 Codex 작성)
