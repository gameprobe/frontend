# TASK-015UI11F: 사이드바 요원 / 무기 / 맵 / 역할군 정리 (API 신청용)

## Status

IMPLEMENTED_VERIFIED (데이터 기반 카드 정리분) + HUMAN-DECISION-GATE (역할 아이콘/요원·무기 이미지분)

**분류:**
- 역할 승률·맵 성적·무기(topWeapons)·정확도(head/body/legs)·활동 시간대·팀원
  카드 정보 구성(기존 데이터): **Safe with existing data**
- 역할군 아이콘·요원 PNG 완성·무기 이미지 시각화: **Requires new assets** (UI9D/UI9B 게이트)
- 무기별 Head/Body/Legs 적중 분포: **Requires new mock data** (현재 무기별 분포 없음)
- 모스트/탑 요원 카드·요원별 게임수·승률·KD 등 **요원 집계**: **Requires new mock
  data / Riot API(승인 후) 데이터** — 현재 `ProfileSidebarStats`에 요원 집계 필드가
  **없으므로** UI11F 구현 전 **Human Decision Gate**. (기존 데이터로 가능한 Safe
  범위가 아님)

## Goal

프로필 **사이드바**(`ProfileSidebar` / `ProfileSidebarStats`)의 요원/무기/맵/역할군
카드를 정보 구성·위계 측면에서 정리한다. 기존 데이터로 가능한 카드 정보 구성을
먼저 하고, **아이콘/이미지 자산과 무기별 분포 Mock은 게이트**로 분리한다.

## Background

- `ProfileSidebarStats`에는 roleWinRates·accuracy(head/body/legs)·topWeapons·
  mapWinRates·activityByTimeSlot·frequentTeammates가 **데이터로 존재**한다.
- **단, 요원(agent) 집계 필드는 존재하지 않는다.** 즉 모스트/탑 요원, 요원별
  게임수·승률·KD 같은 요원 단위 통계는 현재 스키마에 **없다**. 사이드바의 "요원"
  관련 표현은 기존 데이터로 채울 수 없다.
- 그러나 **역할군 아이콘 자산이 없고**, 요원 PNG는 3/10·무기 PNG는 3종만 실물이다.
  무기별 Head/Body/Legs 분포는 데이터에 없다(전체 accuracy만 존재).

## User Value for Riot API Application

- 역할 승률·맵 성적·정확도 같은 **기존 집계 카드**는 전적 서비스의 핵심 보조
  정보로, 심사자에게 "데이터를 요약·제공하는 플랫폼" 인상을 강화한다. (모스트/탑
  요원 카드는 전적 사이트의 익숙한 패턴이나, 현재 GameProbe 데이터에는 요원 집계가
  없어 게이트로 둔다.)
- 자산이 없는 부분은 텍스트/막대 등 **데이터 기반 표현**으로 정직하게 채우고,
  아이콘/이미지 완성은 자산 결정 게이트로 둔다.

## Reference Direction

- 참고: 모스트 요원(게임수·승률·KD), 맵별 성적, 무기/역할 분포 미니 카드의
  **정보 항목 구성·배치**만.
- 금지: 디자인 픽셀 복제, 데이터 없는 패널 선제작, 외부 위젯.

## Allowed Changes

- `frontend/src/components/ProfileSidebar.tsx` — 카드 정보 구성·위계 정리(기존
  `ProfileSidebarStats` 필드 한정).
- (선택) 사이드바 카드용 작은 보조 컴포넌트(기존 타입만 사용).
- `frontend/src/app/globals.css` — 사이드바 스타일만.
- 문서: 이 Task 문서.

> 역할군 아이콘/요원·무기 이미지 자산 추가, 무기별 Head/Body/Legs Mock은
> Allowed에서 제외(게이트).

## Forbidden Changes

- 신규 외부 자산(역할 아이콘·요원/무기 PNG)·`public/assets`·`SOURCES.md`·
  `asset-map.ts` 변경 — **UI9D/UI9B 결정 전 금지**.
- 신규 Mock 데이터/타입 필드(무기별 적중 분포 등) — **금지**.
- 신규 패키지, backend/docker/scripts.
- 상단/요약·최근 경기·스코어보드·라운드/성과/분석 구현 착수.
- OP.GG/Tracker pixel-perfect 복제, 런타임 외부 URL, `Math.random`.
- Git add/commit/push.

## Existing Data / Assets Available

- `ProfileSidebarStats`: peakRank, **roleWinRates**(role·matches·wins·losses·
  winRate), **accuracy**(head/body/legs 전체 분포), **topWeapons**(weaponId·
  displayName·kills·headshotPercentage), **mapWinRates**, activityByTimeSlot,
  frequentTeammates. → 카드 정보 구성 **가능**.
- 에셋: 요원 PNG jett/sova/omen, 무기 PNG vandal/phantom/operator, 맵 PNG
  ascent/haven/split, 티어 다수. placeholder fallback 존재.
- **없음(데이터)**: 요원(agent) 집계 필드(모스트/탑 요원·요원별 게임수·승률·KD),
  무기별 Head/Body/Legs 분포(전체 accuracy만 있음).
- **없음(에셋)**: 역할군 아이콘 자산, 누락 요원/무기 이미지.

## Required UI Changes

### 즉시 가능 (Safe with existing data)
1. **맵별 성적**(mapWinRates: 게임수·승률) 카드와 **무기**(topWeapons: kills·HS%)
   카드를 일관 구성한다. (요원 집계 필드는 현재 데이터에 없어 제외)
2. **역할 승률**(roleWinRates)을 텍스트/막대로 정직하게 표시(아이콘 없이 라벨).
3. **정확도(head/body/legs)** 전체 분포를 막대/비율로 표시(기존 accuracy 필드).
4. 자주 함께한 팀원·활동 시간대 카드의 위계를 정돈한다.
5. 기존 사이드바 카드들의 시각 polish(여백·라벨·카드 문법 일관화).

### Human Decision Gate (이 Task에서 구현하지 않음)
6. 역할군 **아이콘** 추가 → **UI9D 자산 결정** 승인 후.
7. 요원/무기 **이미지 완성** → **UI9B/UI9D 자산 결정** 승인 후(현재 placeholder 유지).
8. **무기별** Head/Body/Legs 분포 → 신규 Mock 결정 필요.
9. **모스트/탑 요원 카드·요원별 게임수·승률·KD** → 현재 `ProfileSidebarStats`에
   요원 집계 필드가 **없음**. 신규 Mock 또는 Riot API(승인 후) 데이터가 있어야
   가능 → 그 전에는 구현하지 않는다(데이터 없는 UI 금지).

## Required Human Decisions

- **(게이트) 역할군 아이콘**: 출처/라이선스·취득 승인 여부(UI9D). 미승인 시 라벨로
  표시.
- **(게이트) 요원/무기 이미지**: 누락 자산 취득 승인 여부(UI9B/UI9D). 미승인 시
  placeholder 유지.
- **(게이트) 무기별 적중 분포 Mock**: 신규 필드 추가 승인 여부. 미승인 시 전체
  accuracy만 표시.
- **(게이트) 요원 집계 카드**: 모스트/탑 요원·요원별 게임수·승률·KD를 위한 신규
  Mock 또는 Riot API(승인 후) 데이터 도입 여부. 현재 데이터에 요원 집계 필드가
  없으므로, 미도입 시 요원 단위 카드는 표시하지 않는다.
- 카드 우선순위/노출 순서.

## Acceptance Criteria

1. 역할 승률·정확도(head/body/legs)·맵 성적·무기(topWeapons) 등 **기존 데이터
   카드**가 정보 구성·위계 측면에서 정돈된다. (요원 집계 카드는 포함하지 않는다)
2. 역할 아이콘·요원/무기 이미지·무기별 분포·**요원 집계 카드** 등 자산/Mock/신규
   데이터가 필요한 부분은 추가되지 않고 정직하게 표현된다(라벨/placeholder/전체
   분포, 요원 카드 미표시).
3. 신규 Mock/타입/자산/패키지 추가가 없다.
4. 다른 UI11 영역 미변경. `tsc`/`lint`/`build` 통과.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
git diff --check
git status --porcelain -- frontend/public/assets frontend/src/data frontend/src/types frontend/package.json frontend/package-lock.json backend docker scripts
git diff -- frontend/src/lib/asset-map.ts frontend/src/lib/score-gameprobe.ts
git status --porcelain -- frontend/src/components/PlayerHeaderCard.tsx frontend/src/components/MatchSummaryList.tsx frontend/src/components/MatchScoreboardTab.tsx frontend/src/components/MatchRoundsTab.tsx frontend/src/components/MatchPerformanceTab.tsx frontend/src/components/MatchAnalysisTab.tsx
grep -RnE "https?://|Math.random" frontend/src/components frontend/src/app/globals.css || true
```

## Stop Conditions

- 역할 아이콘·요원/무기 이미지·무기별 분포·요원 집계 카드 등 자산/Mock/신규
  데이터가 필요해지면 즉시 중단하고 UI9B/UI9D/Mock(또는 API 승인 후) 결정을
  요청한다(가드레일 5장).
- 사이드바 외 영역을 건드려야 하면 중단.
- 같은 검증 실패 3회 반복 시 `BLOCKED` 보고.

## Codex Implementation Notes

- `ProfileSidebarStats`의 기존 필드만 사용해 사이드바 카드 위계를 정리했다:
  `roleWinRates`, `accuracy`, `topWeapons`, `mapWinRates`, `activityByTimeSlot`,
  `frequentTeammates`, `sampleLabel`.
- 역할 승률은 아이콘 없이 라벨·전적·승률 막대로 표시했다.
- 정확도는 전체 `head/body/legs` 분포 막대와 3개 수치 카드로 표시했다. 무기별
  Head/Body/Legs 분포는 데이터가 없어 추가하지 않았다.
- 주 무기와 맵별 성적은 기존 이미지 매핑 fallback을 유지하고, kills/HS% 또는
  전적/경기수/승률을 같은 카드 문법으로 정리했다.
- 기존에 렌더링되지 않던 활동 시간대와 자주 함께한 팀원 카드를 기존 데이터로
  추가했다.
- 요원 집계 카드(모스트/탑 요원·요원별 게임수/승률/KD)는 `ProfileSidebarStats`에
  필드가 없어 구현하지 않았다. 역할 아이콘, 신규 요원/무기 자산, 무기별 적중 분포
  Mock도 추가하지 않았다.
- 신규 Mock 데이터, 신규 타입 필드, 신규 외부 자산, 신규 패키지, backend/docker/
  scripts 변경은 없다.
- 검증: `npx tsc --noEmit`, `npm run lint`, `npm run build`, `git diff --check`,
  금지 경로/다른 UI11 컴포넌트 변경 확인, 외부 URL/난수 grep 모두 통과.
- Git add/commit/push는 Task 금지 사항에 따라 수행하지 않았다.

## Cursor Review Notes

(리뷰 후 기록: 자산/Mock 미착수 확인, 데이터 기반 표현 정직성, AC 충족,
BLOCKER/MAJOR/MINOR, 커밋 가능 여부.)
