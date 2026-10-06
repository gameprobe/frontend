# TASK-015UI12C: 경기 리스트 스캔성 정리 (읽기 흐름 ②리스트 읽기)

## Status

DONE (경기 리스트 스캔성 확보 · 커밋 완료)

> UI12B 및 UI12B_PATCH가 완료(DONE)되어 커밋/동기화된 Git 상태 위에서 진행한다.
> Visual QA(`docs/ui12-visual-qa.md`)의 **결함 1: 뚱뚱하고 무거워 스캔이 불가능한 경기 행**을 해결하기 위해 경기 행 높이를 대폭 깎고 시각 위계를 재조정한다.

## Goal

1. **경기 행 높이 다이어트**: 기본 경기 행의 세로 높이를 70~80px 수준으로 대폭 축소하여 한 화면에 여러 경기가 콤팩트하게 노출되도록 한다 (기존 대비 약 40% 이상 높이 축소).
2. **상세 지표 및 10인 요원 숨김/압축**: K/D/A 외의 세부 지표(ACS, ADR, KAST, DDΔ/R, HS%, 티어 변동 등) 및 Preview Score, 10인 요원 아이콘을 기본 행에서 숨기고 호버(Hover) 시 혹은 상세 펼침(Expand) 시에만 나타나도록 압축하여 스캔성을 확보한다.

## Background

- `docs/ui12-visual-qa.md` §2-결함1: 현재 GameProbe의 경기 행은 높이가 150px에 육박해 전적 "리스트"가 아니라 조잡한 목업 카드들이 쌓여 있는 느낌을 준다. 화면당 경기가 1~2개만 보여 스캔이 아예 불가능함.
- `docs/ui12-implementation-plan.md` §3-4 및 §5-3: 경기 행을 스캔 가능하게 압축하기 위해 기본 상태에서는 **승패, 맵, 요원, KDA, 핵심 지표(K/D 또는 ACS 중 1개)**만 남기고 나머지는 숨김 처리하는 방향 채택.
- 카드 간의 간격과 테두리(Border)가 너무 두꺼워 파편화된 느낌(결함 2)을 주므로, border 및 padding 여백도 조밀하게 다이어트해야 한다.

## Reference Direction

- OP.GG / Tracker.gg의 최근 경기 목록 행 디자인 참고.
- 한 행이 콤팩트한 가로 스트립 형태로 표시되며, 텍스트 크기와 아이콘 크기를 작게 정렬하고 시각적 노이즈를 최소화한다.

## Allowed Changes

- `frontend/src/components/MatchSummaryList.tsx`
  - 경기 행 레이아웃 압축 및 구조 조정.
  - K/D/A 외 지표, Preview Score, 10인 요원 목록을 호버/펼침 시에만 노출되도록 제어문 추가.
  - 마우스 호버 시 툴팁이나 레이아웃 확장 형태로 보완 지표를 노출하는 UI 구현.
- `frontend/src/app/globals.css`
  - 경기 행 관련 CSS 클래스의 높이, padding, gap, border 두께 및 색상 축소.
  - 맵 이미지 배경 불투명도 및 크기 조절.

## Forbidden Changes

- **타 단계 범위 침범 금지**:
  - 경기 상세 탭 수정 (UI12D): `MatchDetailPanel.tsx` 및 4개 하위 탭 내부(라운드 타임라인, 스코어보드 등)의 렌더링 방식 수정 금지.
  - 사이드바/support rail 내부 수정 (UI12E): `ProfileSidebar.tsx` 수정 금지.
  - 마스트헤드 수정: `PlayerHeaderCard.tsx` 수정 금지.
- **제품 코드 외 변경 금지**:
  - 신규 Mock 데이터 모델, 타입 필드 추가 금지 (기존 데이터 구조와 집계 활용).
  - backend, docker, scripts 경로 변경 금지.
  - 외부 Riot CDN 참조 추가 및 `Math.random` 사용 금지.
  - Git add/commit/push 실행 금지.

## Existing Data / Assets Available

- 기존의 `Match`, `MatchInsight`, `MatchParticipant` 데이터 모델 및 `getMatchInsight` 집계 함수 그대로 사용.
- `frontend/public/assets/maps`에 위치한 기존 맵 이미지 그대로 사용.

## Required UI Changes

1. **행 높이 축소 (다이어트)**:
   - 경기 행의 기본 높이를 70~80px 범위 내로 유지한다.
   - 여백(padding), 글씨 크기(font-size)를 전반적으로 소형화한다.
2. **지표 노출 정돈**:
   - **기본 노출**: 승패(Win/Loss) 텍스트 또는 칩, 요원 초상화(작게), 맵 이름, 게임 모드, 경과 시간, K/D/A (예: `15 / 10 / 5`), K/D 비율 (예: `1.50`).
   - **숨김 후 호버/펼침 노출**: ACS, ADR, HS%, KAST, DDΔ/R, 티어 변동, Preview Score 및 10인 요원 초상화 리스트. 이 정보들은 행 위에 마우스를 호버하거나 펼침 화살표를 눌러 인라인 상세가 열렸을 때만 노출되도록 구조를 분리한다.
3. **디자인 톤 정돈 (테두리 억제)**:
   - 각 경기 행 카드들의 두껍고 파편화된 테두리(Border)를 억제하고 플랫하면서 일체감 있는 어두운 톤으로 일체화한다.
   - 맵 이미지 배경을 활용할 경우, 텍스트 가독성을 방해하지 않도록 그라데이션 필터나 불투명도를 정교하게 보정한다.

## Acceptance Criteria

1. 기본 경기 행 세로 높이가 80px 이하로 콤팩트해졌는가.
2. K/D/A 외의 기타 지표 및 Preview Score, 10인 요원 아이콘이 기본 행에서 감춰져 한 화면에 5경기 이상 스캔이 가능한가.
3. 숨겨진 지표들이 마우스 호버 또는 인라인 펼침 시 자연스럽게 노출되는가.
4. `tsc`, `lint`, `build`가 에러 없이 성공하는가.
5. 수정한 파일이 `MatchSummaryList.tsx`와 `globals.css` 2개(혹은 관련 CSS 스타일 시트 한정)인가.
6. 기존 기능(인라인 상세 4탭의 펼침/접힘 동작)이 정상 작동하며 레이아웃이 깨지지 않는가.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
git diff --check

# 변경 파일이 2개 이하인지 검증 (허용 외 파일 수정 금지)
git status --porcelain | grep -v "docs/tasks/TASK-015UI12C.md"
```

## Stop Conditions

- 경기 행 압축을 위해 `MatchDetailPanel.tsx` 나 `PlayerHeaderCard.tsx` 등 허용되지 않은 컴포넌트의 내부 구조 수정을 강제해야 할 때.
- 기존의 데이터 모델이나 타입 파일을 수정해야 하는 설계 결함이 발견될 때.
- 동일한 빌드/린트 에러 및 검증 실패가 3회 이상 반복될 시 `BLOCKED` 상태로 보고하고 작업을 중단한다.

## Codex Implementation Notes

(구현 완료 시 Codex가 작성: 줄어든 높이 값, 기본 노출/숨김 지표 분리 방식, 호버 UI 세부 사항, CSS 보더 억제 처리 방식, 검증 스크립트 실행 결과 기록.)

## Cursor Review Notes

- **스캔성 개선 여부 검증**: 경기 카드 기본 높이를 70~80px 수준으로 줄이고, 요원 이미지 크기를 32px로 조정하였으며, 패딩 및 폰트 크기를 축소하여 스캔성을 대폭 개선했습니다.
- **호버/펼침 상태 정합성**: 마우스 Hover 또는 상세가 펼쳐진 expanded 상태(`isActive = isHovered || isExpanded`)일 때만 ACS, ADR, KAST, DDΔ/R, HS%, 티어 변동, Preview Score 및 10인 요원 아이콘 요약(2단 상세 정보)이 CSS transition을 통해 자연스럽게 노출됩니다.
- **Allowed/Forbidden 범위 준수**: 허용된 두 파일(`MatchSummaryList.tsx`, `globals.css`)만 변경되었으며, 다른 파일은 일절 수정되지 않았습니다.
- **최종 Verdict**: **COMMIT_READY**
