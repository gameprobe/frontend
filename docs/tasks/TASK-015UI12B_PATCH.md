# TASK-015UI12B_PATCH: UI12B 긴급 패치 — 모바일 마스트헤드 겹침 + 텍스트 띄어쓰기

## Status

READY (긴급 패치 · Cursor 리뷰 → 승인 시 Codex 구현)

> UI12B 구현(미커밋/COMMIT_READY) 위에 올리는 **핫픽스**다. Visual QA
> (`docs/ui12-visual-qa.md`)에서 발견한 **모바일 뷰포트 렌더링 붕괴(MAJOR)**와
> **마스트헤드 텍스트 띄어쓰기 버그**만 좁게 수선한다. 마스트헤드 슬림화·카드
> 보더 억제·경기 행 다이어트·요원 배경 재설계 등 **나머지 QA 지적은 이 패치
> 범위가 아니다**(UI12C 이후).

## Goal

1. **모바일(390px) 마스트헤드 하단 카드 겹침 해소** — `현재 티어` → `Career Peak`/
   `Previous` → `최근 N판` → `Preview Score` → `UI Build 배지`가 **겹치지 않고
   수직 스택으로 자연스럽게 흐르도록** 한다.
2. **마스트헤드 텍스트 띄어쓰기 버그 수정** — `PeakDiamond`, `PreviousDiamond`처럼
   라벨과 티어 값이 붙어 렌더되는 문제를 정상 띄어쓰기로 고친다.

## Background

- `docs/ui12-visual-qa.md` §3: 모바일 390px에서 `현재 티어`~`최근 20판` 카드,
  `Preview Score`, `UI Build 배지`가 유연하게 떨어지지 못하고 **한곳에 겹쳐
  뭉개져** 렌더링됨(모바일 사용 불가 수준, MAJOR).
- 같은 보고서 §2-결함3: `PeakDiamond`, `PreviousDiamond` 등 가장 기초적인
  띄어쓰기조차 처리되지 않아 완성도를 깎음.
- 코드 근거(`PlayerHeaderCard.tsx`):
  - `player-hero-rank-panel` 내부 `player-hero-rank` / `player-hero-rank-context`
    (`Career Peak`·`Previous` article) / `player-hero-form` / `player-hero-score-wrapper`
    가 데스크톱 기준 배치라 모바일에서 폭·고정 높이로 겹침.
  - `context-label`("Career Peak"/"Previous") + `context-value`(tier, 예: "Diamond")가
    띄어쓰기 없이 붙어 보이는 것이 텍스트 버그의 원인.

## Reference Direction

- 레퍼런스(OP.GG/Tracker)는 **정보 구조만** 참고. 이 패치는 디자인 재설계가 아니라
  **모바일에서 깨지지 않게 하는 최소 수선** + 텍스트 오타성 버그 교정이다.

## Allowed Changes

엄격히 아래 2개 파일만:

- `frontend/src/components/PlayerHeaderCard.tsx`
  - 마스트헤드 **모바일 뷰포트 정렬** 보정(겹침 유발 구조 최소 조정).
  - `Career Peak`/`Previous` **라벨–티어 값 띄어쓰기** 수정(라벨과 값이 붙지 않게).
- `frontend/src/app/globals.css`
  - 마스트헤드 관련 클래스의 **고정/최대 높이 제한 해제**(겹침 원인 제거).
  - 모바일 브레이크포인트에서 `player-hero-content`/`player-hero-primary`/
    `player-hero-rank-panel`/`player-hero-rank-context`를 **flex-column 수직 스택**
    으로 흐르게 보정.
  - 절대 배치 배경 요원 이미지(`player-hero-bg-agent`)가 스택된 콘텐츠를 **겹치지
    않도록 z-index/positioning만** 보정(배경 자체 재설계는 범위 밖).

## Forbidden Changes

- **다른 UI12 단계 범위 침범 금지:**
  - 경기 리스트/경기 행 스캔 압축·행 다이어트 — **UI12C**.
  - 경기 상세·4탭·스코어보드·라운드 — **UI12D**.
  - 사이드바/support rail 내부 — **UI12E**.
  - 마스트헤드 **슬림화**(요약 카드 5개 통합), **카드 보더 억제**, **요원 배경
    재설계**(QA 결함 1·2·4) — 후속(UI12C/마감) 범위. 이 패치는 **겹침·텍스트만**.
- `PlayerHeaderCard.tsx`·`globals.css` **외 파일 수정 금지**(다른 컴포넌트·데이터·
  타입·asset-map·라우트 불변).
- 신규 Mock/타입/외부 자산/npm 패키지 금지. `backend/`·`docker/`·`scripts/` 금지.
- 정보 구조 변경·지표 추가/삭제·새 카드 신설 금지(겹침 해소를 위한 배치/높이만).
- 런타임 외부 URL, `Math.random`. Git add/commit/push.

## Existing Data / Assets Available

- 기존 `PlayerHeaderProfile`·`SeasonSummary`·`CareerPeakRank`·`PreviousSeasonRank`·
  `RecentTwentySummary` 그대로 사용(데이터 변경 없음).
- 기존 티어/요원 이미지·`MatchScoreBadge`·`AppVersionBadge` 그대로.

## Required UI Changes

1. **모바일 수직 스택**: ≤390px(및 모바일 브레이크포인트)에서 마스트헤드 하단
   블록(현재 티어 → Career/Previous → 최근 N판 → Preview Score)이 **겹침 없이
   위에서 아래로** 흐른다. 고정/최대 높이로 인한 클리핑·오버랩 제거.
2. **텍스트 띄어쓰기**: `Career Peak`/`Previous` 라벨과 티어 값이 **명확히 분리**
   되어 `Peak Diamond`/`Previous Diamond`처럼 정상 렌더된다(붙어 보이지 않음).
3. **배경 요원 이미지 비간섭**: 모바일에서 배경 일러스트가 스택 콘텐츠를 가리거나
   밀어내지 않는다(z-index/positioning 최소 보정만).
4. 데스크톱(1440px) 레이아웃 **회귀 없음**(패치는 모바일/텍스트 한정).

## Acceptance Criteria

1. 390px 뷰포트에서 마스트헤드 하단 카드들이 **겹치지 않고** 수직으로 스택되어
   모두 읽힌다(클리핑·오버랩 없음).
2. `PeakDiamond`/`PreviousDiamond`가 **`Peak`/`Previous`와 티어 값 사이 띄어쓰기**로
   정상 표기된다.
3. 변경 파일이 `PlayerHeaderCard.tsx`·`globals.css` **2개뿐**이다.
4. 데스크톱 레이아웃·기존 데이터·다른 UI12 영역에 회귀가 없다.
5. 신규 Mock/타입/자산/패키지 없음. `tsc`/`lint`/`build` 통과.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
git diff --check
# 변경 파일이 2개로 한정되는지(허용 외 파일 미변경)
git status --porcelain -- frontend/src/components/PlayerHeaderCard.tsx frontend/src/app/globals.css
git status --porcelain -- frontend/src/components/MatchSummaryList.tsx frontend/src/components/ProfileSidebar.tsx frontend/src/components/MatchDetailPanel.tsx frontend/src/lib frontend/src/data frontend/src/types frontend/public/assets   # 출력 없어야 함
git status --porcelain -- backend docker scripts frontend/package.json frontend/package-lock.json   # 출력 없어야 함
grep -RnE "https?://|Math.random" frontend/src/components/PlayerHeaderCard.tsx frontend/src/app/globals.css || true
# 모바일 스택/높이 해제 흔적 확인(예: 모바일 미디어쿼리 내 flex-direction column)
grep -nE "flex-direction:\s*column|max-width:\s*(390|480|768)px" frontend/src/app/globals.css | head
```

> 시각 확인(390px 겹침 해소·텍스트 띄어쓰기)은 실제 브라우저/뷰포트 캡처가 필요하다.
> 헤드리스 드라이버 미설치 환경이면 사람 또는 별도 결정으로 viewport QA를 수행한다
> (신규 패키지 설치는 이 Task 범위 밖).

## Stop Conditions

- 겹침/텍스트 수선이 `PlayerHeaderCard.tsx`·`globals.css` 2파일을 넘어가야 한다면
  중단하고 보고(범위 초과 → 별도 Task).
- 겹침 원인이 마스트헤드 구조 재설계(슬림화·카드 통합)를 요구하면 중단(UI12C/후속).
- 데스크톱 회귀가 발생하면 중단·보고.
- 같은 검증 실패 3회 반복 시 `BLOCKED` 보고.

## Codex Implementation Notes

(구현 후 기록: 모바일 스택 방식(미디어쿼리·flex-column), 해제한 높이 제한,
텍스트 띄어쓰기 수정 위치, 배경 이미지 비간섭 처리, 데스크톱 회귀 점검 결과,
변경 2파일 한정 확인, 검증 결과.)

## Cursor Review Notes

(리뷰 후 기록: 390px 겹침 해소·텍스트 정상화 확인, 변경 2파일 한정, 데스크톱
회귀 없음, 다른 UI12 범위 미침범, BLOCKER/MAJOR/MINOR, 커밋 가능 여부.)
