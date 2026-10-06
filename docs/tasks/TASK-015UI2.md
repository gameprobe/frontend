# TASK-015UI2: 플레이어 프로필 · 최근 경기 카드 정보 강화

## Status

DONE (2026-06-15)

## Goal

TASK-015UI(홈 화면 및 공통 레이아웃 디자인, DONE)에서 적용한 GameProbe
디자인을 유지하면서, 플레이어 프로필 요약과 최근 경기 카드에 일반적인
VALORANT 전적 검색 서비스 수준의 정보를 표시한다.

1. **프로필 요약** (`PlayerProfile.tsx`)에 다음을 표시한다: Riot ID, 티어,
   최근 경기 승/패, 승률, 평균 ACS, 평균 K/D, 주 사용 요원 요약.
2. **최근 경기 카드** (`MatchSummaryList.tsx`)에 다음을 표시한다: 승리/패배,
   맵 이름과 맵 이미지, 사용 요원 이름과 초상화, 경기 모드, 최종 스코어,
   ACS, K/D/A, K/D 비율, 헤드샷률, 경기 일시, 대표 무기(또는 킬 이벤트
   기준 무기) 이미지.
3. 위 정보를 표시하기 위해 필요한 타입(`frontend/src/types/**`)과 Mock
   데이터(`frontend/src/data/mock-data.json`, `frontend/src/lib/**`)를
   최소한으로 확장한다. 필드 이름과 구조는 추후 Riot **VAL-MATCH-V1** 응답으로
   교체할 때 재사용 가능한 형태로 설계한다.
4. 요원·맵·무기 이미지는 **Riot 공식 Public Content Catalog(VAL-CONTENT-V1
   등 공식 문서화된 콘텐츠 카탈로그)에서 Mock 데이터에 실제로 등장하는
   자산만 선별해 프로젝트 로컬 파일로 포함**하는 방식을 기본으로 한다.
   `agentId`/`mapId`/`weaponId` 기준으로 로컬 경로를 반환하는 매핑을 두고,
   공식 카탈로그에서 해당 자산을 확인할 수 없는 항목에 한해 placeholder를
   fallback으로 사용한다(아래 "자산 매핑 설계" 참조).
5. `headshotPercentage`, `primaryWeapon`, `topAgents`, 그리고 컴포넌트에서
   계산하는 평균 ACS/평균 K/D는 **Mock/가공 집계 필드**다. 향후 Riot Match
   API(VAL-MATCH-V1) 원시 응답을 Backend에서 집계해 산출해야 하며, 이번
   Task는 Frontend Mock 표시만 구현한다. 화면·주석 어디에서도 이 값들을
   공식 API가 직접 제공하는 값처럼 표현하지 않는다.

다음은 이 Task의 범위가 아니다:

- 홈 화면(`/`)과 공통 레이아웃(헤더/푸터/검색 패널/분석 예시 카드) — TASK-015UI
  결과물을 그대로 유지한다.
- 경기 상세 화면의 스코어보드/라운드 타임라인 개선
  (`MatchDetailView.tsx`, `MatchScoreboard.tsx`, `MatchRoundTimeline.tsx`) —
  후속 Task로 분리한다.
- 실제 Riot API 호출, RSO 인증, 라인업, 분석(Phase 5) 로직.
- `docs/DECISIONS.md` PENDING-003(스타일링 방식) 해소.
- Backend 변경.

## Context

### Task ID에 대해

다음 사용 가능한 전역 번호(TASK-016)는 `docs/PLAN.md` Phase 3("라인업 데이터
모델")에 TODO로 예약되어 있어 충돌한다. 이전에 동일한 사유로 생성한
`TASK-015UI`(홈/공통 레이아웃 디자인, DONE)와 같은 Phase 2 UI 개선 계열로,
그 후속 작업이므로 `TASK-015UI2`로 명명한다. TASK-016~038의 기존 번호/상태는
변경하지 않는다.

### 선행 Task 결과 (TASK-015UI, DONE)

- `docs/tasks/TASK-015UI.md` Result 기준, 다음이 이미 적용되어 있다:
  - 공통 헤더/푸터(`frontend/src/app/layout.tsx`, 신규 컴포넌트), 다크
    네이비·차콜 테마와 청록·민트 토큰(`frontend/src/app/globals.css`의
    `:root` 변수: `--bg`, `--bg-panel`, `--accent`, `--accent-strong`,
    `--text`, `--text-muted`, `--text-soft`, `--line`, `--line-strong`,
    `--danger`, `--shadow` 등), 약한 그리드 배경.
  - 홈(`/`)은 큰 둥근 검색 패널(`.search-panel`)과 각진 분석 예시 카드
    4개(`.analysis-grid`/`.analysis-card`, `AnalysisExampleCards.tsx`)로
    재구성됨.
  - `frontend/src/components/PlayerProfile.tsx`에 `.section-kicker` +
    `.data-badge`("Demo Profile") 배지가 추가됨.
  - `frontend/src/components/MatchDetailView.tsx`에 동일한 방식으로
    "Mock Data" 배지가 추가됨.
  - 검색(`HomeSearch.tsx`)은 형식이 올바른 모든 Riot ID를 고정 데모 프로필
    (`SeoulDuelist#KR1`, `/players/{puuid}`)로 이동시킨다.
- 이 Task는 위 결과물을 그대로 두고, 프로필/최근 경기 영역만 확장한다.

### 현재 데이터/타입 구조 (변경 전)

`frontend/src/types/player.ts`:

```ts
export interface PlayerStatsSummary {
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  averageKills: number;
  averageDeaths: number;
  averageAssists: number;
  averageCombatScore: number;
}

export interface Player {
  puuid: string;
  riotId: RiotId;
  currentRank: string;
  statsSummary: PlayerStatsSummary;
  recentMatches: MatchSummary[];
}
```

`frontend/src/types/match.ts`:

```ts
export interface CombatStats {
  kills: number;
  deaths: number;
  assists: number;
  averageCombatScore: number;
}

export interface MatchSummary {
  matchId: string;
  map: string;
  mode: string;
  startedAt: string;
  result: MatchResult;
  agent: string;
  team: ValorantTeam;
  score: { roundsWon: number; roundsLost: number };
  stats: CombatStats;
}
```

`frontend/src/data/mock-data.json`은 데모 플레이어 1명
(`SeoulDuelist#KR1`, `currentRank: "Diamond 2"`)과 `recentMatches` 3건
(Ascent/Jett/승, Haven/Sova/패, Split/Omen/승)을 포함한다.
`frontend/src/lib/mock-data.ts`는 `getDemoPlayers`,
`getDemoPlayerByPuuid`, `getDemoPlayerByRiotId`,
`getRecentMatchesForPlayer`, `getMatchDetail`을 제공한다(시그니처 변경 없이
유지).

`frontend/src/components/PlayerProfile.tsx`는 현재 "현재 랭크"와 통계 요약
한 문단(최근 N경기·승률·평균 K/D/A·평균 전투 점수)만 표시한다.
`frontend/src/components/MatchSummaryList.tsx`는 현재 맵/모드, 결과/시작
시각, 요원·스코어·K/D/A만 텍스트로 표시한다.

## 새 타입/Mock 데이터 설계 (제안)

구현자는 아래 제안을 기준으로 진행하며, 불가피하게 구조를 다르게 해야 하면
Result에 사유와 실제 구조를 기록한다(필드명을 임의로 크게 바꾸지 않는다).

### `frontend/src/types/match.ts` 추가/변경

```ts
export interface WeaponSummary {
  // VAL-CONTENT-V1 호환 자산 슬러그(예: "vandal"). 실제 Riot UUID 매핑은
  // PENDING — Phase 4에서 VAL-CONTENT-V1 조회 결과로 교체한다.
  weaponId: string;
  displayName: string;
}

export interface CombatStats {
  kills: number;
  deaths: number;
  assists: number;
  averageCombatScore: number;
  // 0-100. VAL-MATCH-V1의 kills[].finishingDamage / 라운드별 damage(헤드샷·
  // 바디샷·레그샷) 집계로 산출 가능 — Mock에서는 정적 값.
  headshotPercentage: number;
}

export interface MatchSummary {
  matchId: string;
  map: string;
  // VAL-CONTENT-V1 호환 자산 슬러그(예: "ascent"). 실제 UUID 매핑은 PENDING.
  mapId: string;
  mode: string;
  startedAt: string;
  result: MatchResult;
  agent: string;
  // VAL-CONTENT-V1 호환 자산 슬러그(예: "jett"). 실제 UUID 매핑은 PENDING.
  agentId: string;
  team: ValorantTeam;
  score: { roundsWon: number; roundsLost: number };
  stats: CombatStats;
  // "대표 무기": 이번 경기 킬 이벤트에서 가장 많이 사용된 무기.
  // VAL-MATCH-V1 kills[].finishingDamage.damageItem 집계로 산출 가능 —
  // Mock에서는 정적 값. (PENDING: 실제 집계 로직은 Phase 4)
  primaryWeapon: WeaponSummary;
}
```

`MatchParticipant`/`MatchRound`/`MatchDetail`은 변경하지 않는다(경기 상세
범위 제외).

### `frontend/src/types/player.ts` 추가/변경

```ts
export interface AgentPlayRate {
  // VAL-CONTENT-V1 호환 자산 슬러그(예: "jett").
  agentId: string;
  displayName: string;
  matchesPlayed: number;
  winRate: number;
}

export interface PlayerStatsSummary {
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  averageKills: number;
  averageDeaths: number;
  averageAssists: number;
  averageCombatScore: number;
  // "주 사용 요원 요약". VAL-MATCH-V1은 개별 경기 단위만 제공하므로 이 필드는
  // 자체 집계 결과다 (PENDING: 실제 집계 파이프라인은 Phase 4/5).
  topAgents: AgentPlayRate[];
}
```

`Player.currentRank`는 "티어" 표시에 그대로 사용한다(필드 추가 불필요).
"평균 K/D"는 `averageKills / averageDeaths`를 컴포넌트에서 계산해 표시한다
(타입에 별도 필드 추가 불필요). "최근 경기 승/패"는 `statsSummary.wins`/
`losses` 또는 `recentMatches[].result`로부터 컴포넌트에서 표시한다(타입
추가 불필요).

### `frontend/src/types/index.ts`

새로 추가한 `WeaponSummary`, `AgentPlayRate`를 `export type`에 추가한다.

### `frontend/src/data/mock-data.json`

- `players[0].statsSummary.topAgents`에 1~3개 항목을 추가한다(현재
  `recentMatches`의 Jett/Sova/Omen을 근거로 한 예시 값이면 충분하다).
- `players[0].recentMatches[*]`(3건) 각각에 `mapId`, `agentId`,
  `stats.headshotPercentage`, `primaryWeapon`을 추가한다. 예시 매핑:
  - Ascent → `mapId: "ascent"`, Jett → `agentId: "jett"`
  - Haven → `mapId: "haven"`, Sova → `agentId: "sova"`
  - Split → `mapId: "split"`, Omen → `agentId: "omen"`
  - `primaryWeapon`은 각 경기에 어울리는 주력 무기(예: Vandal/Phantom/
    Operator 등) 중 하나로 정적 지정한다.
- `matchDetails[*].participants[*]`(`MatchParticipant`)는 변경하지 않는다.

### `frontend/src/lib/**`

- `getDemoPlayers`, `getDemoPlayerByPuuid`, `getDemoPlayerByRiotId`,
  `getRecentMatchesForPlayer`, `getMatchDetail`의 시그니처와 동작은
  변경하지 않는다(반환 타입에 새 필드가 포함되는 것은 허용).
- 자산 식별자(`mapId`/`agentId`/`weaponId`)를 로컬 placeholder 이미지
  경로로 변환하는 매핑 모듈을 추가한다(예: `frontend/src/lib/asset-map.ts`,
  파일명은 구현자가 결정). 이 모듈은 Mock 데이터/타입을 import만 하고,
  외부 네트워크 호출을 하지 않는다.

## 자산 매핑 설계 (요원·맵·무기 이미지)

### 원칙

- **기본 소스**: Riot 공식 Public Content Catalog(공식적으로 문서화·공개된
  콘텐츠 카탈로그, 예: VAL-CONTENT-V1 또는 Riot가 공식 공개한 콘텐츠/브랜드
  자산)에서 Mock 데이터에 등장하는 `agentId`/`mapId`/`weaponId`에 대응하는
  공식 이미지(요원 초상화, 맵 이미지, 무기 아이콘)를 식별해 사용한다.
- **선별 포함, 전체 포함 금지**: 카탈로그 원본 전체를 저장소에 포함하지
  않는다. 이번 Task의 Mock 데이터에 실제로 등장하는 요원 3종
  (Jett/Sova/Omen), 맵 3종(Ascent/Haven/Split), 무기 최대 3종에 대응하는
  이미지 파일만 선별해 `frontend/public/assets/{agents,maps,weapons}/`에
  추가한다.
- **placeholder는 fallback**: 공식 카탈로그에서 해당 항목의 이미지를 확인할
  수 없는 경우에만, 그 항목에 한해 SVG placeholder(아이콘/색상 블록 + 텍스트
  라벨)를 fallback으로 사용한다. 어떤 항목이 공식 자산이고 어떤 항목이
  placeholder인지 "출처 기록"(아래)에 구분해 명시한다.
- **외부 런타임 호출 금지**: 비공식 CDN(예: `media.valorant-api.com` 등)을
  포함한 모든 외부 호스트에서 런타임에 이미지를 fetch하는 방식은 사용하지
  않는다. 모든 이미지는 `frontend/public/assets/` 아래 로컬 파일이어야 한다.

### 매핑 함수

- 매핑 모듈(`asset-map.ts` 등, `frontend/src/lib/**`)은 `agentId`/
  `mapId`/`weaponId` → 로컬 경로(`/assets/agents/jett.png` 등, 확장자는
  실제 추가한 자산 형식에 따름)를 반환한다. 매핑에 없는 키는 기본
  placeholder(예: `assets/placeholder.svg`) 또는 `null`을 반환하고,
  컴포넌트는 이 경우 이미지를 생략하거나 기본 placeholder를 표시한다(에러
  throw 금지). 이 모듈은 Mock 데이터/타입만 import하고 외부 네트워크 호출을
  하지 않는다.
- `<img>` 또는 `next/image`(로컬 정적 자산이므로 `next.config.js` 변경
  불필요) 중 구현자가 선택한다.

### 출처 기록

- 추가한 각 자산 파일에 대해 (a) 출처(공식 Riot Public Content Catalog의
  구체적 엔드포인트/페이지와 확인 날짜), (b) 대응하는 `agentId`/`mapId`/
  `weaponId`, (c) 라이선스/사용 조건 확인 사항, (d) placeholder로 대체한
  항목과 그 이유를 기록한다.
- 기록 위치는 Task Result 또는 `frontend/public/assets/SOURCES.md`(신규,
  파일명은 구현자가 결정) 중 구현자가 선택하고, Result에서 해당 내용 또는
  문서 위치를 명시한다.
- 실제 VAL-CONTENT-V1 식별자(UUID)와 Mock `agentId`/`mapId`/`weaponId`
  (슬러그) 사이의 1:1 매핑 테이블이 확정되지 않았다면 PENDING으로 남기고
  Result에 "PENDING: VAL-CONTENT-V1 식별자 매핑"으로 명시한다.

## Dependencies

- 선행 Task: TASK-015UI (홈 화면 및 공통 레이아웃 디자인, DONE 2026-06-15).
- 후속 Task: 경기 상세 스코어보드/라운드 타임라인 개선(범위 미정, 별도 Task로
  작성 예정).

## Allowed changes

```
frontend/src/types/player.ts             # PlayerStatsSummary.topAgents, AgentPlayRate
frontend/src/types/match.ts              # MatchSummary.mapId/agentId/primaryWeapon,
                                          # CombatStats.headshotPercentage, WeaponSummary
frontend/src/types/index.ts              # 신규 타입 export
frontend/src/data/mock-data.json         # players[0].statsSummary.topAgents,
                                          # players[0].recentMatches[*] 필드 추가
frontend/src/lib/**                      # 자산 매핑 모듈 추가 (신규 파일),
                                          # 기존 로더 시그니처/동작 변경 금지
frontend/src/components/PlayerProfile.tsx    # 프로필 요약 정보 확장
frontend/src/components/MatchSummaryList.tsx # 최근 경기 카드 정보 확장
frontend/src/app/globals.css             # 프로필 요약/경기 카드용 신규 스타일 추가
                                          # (기존 선택자 정의는 변경하지 않음)
frontend/public/assets/**                # 공식 Public Content Catalog에서 선별한
                                          # 요원/맵/무기 이미지(필요 시 placeholder
                                          # SVG fallback 포함), 자산 출처 기록 문서
docs/tasks/TASK-015UI2.md                # 이 문서의 Result 갱신
```

## Forbidden changes

- `frontend/src/app/page.tsx`, `frontend/src/app/layout.tsx`,
  `frontend/src/components/HomeSearch.tsx`,
  `frontend/src/components/AnalysisExampleCards.tsx`, 그 외 TASK-015UI가
  추가한 헤더/푸터 컴포넌트 — 홈/공통 레이아웃 대규모 수정 금지.
- `frontend/src/components/MatchDetailView.tsx`,
  `frontend/src/components/MatchScoreboard.tsx`,
  `frontend/src/components/MatchRoundTimeline.tsx` — 경기 상세 개선은
  후속 Task.
- `frontend/src/app/players/[puuid]/page.tsx`,
  `frontend/src/app/matches/[matchId]/page.tsx`
- `frontend/src/app/privacy/page.tsx`, `frontend/src/app/terms/page.tsx`,
  `frontend/src/app/connect/page.tsx`,
  `frontend/src/components/RiotConnectNotice.tsx`
- `frontend/src/app/globals.css`의 기존 선택자(`.site-header`,
  `.site-footer`, `.home`, `.hero`, `.search-panel`, `.search-form`,
  `.search-row`, `.analysis-grid`, `.analysis-card`, `.placeholder-page`
  등)의 정의 변경 — 새 선택자 추가만 허용.
- `frontend/package.json`, `frontend/package-lock.json` (새 패키지/의존성
  추가 포함)
- `backend/**`, `docker/**`, `scripts/**`
- `AGENTS.md`, `CLAUDE.md`, `docs/PLAN.md`, `docs/PROGRESS.md`,
  `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`,
  `docs/tasks/TASK-015UI.md`, 그 외 `docs/tasks/TASK-0XX.md`
- Riot API 실제 호출(예: `media.valorant-api.com` 등 외부 자산 CDN
  fetch 포함), 인증/세션 관련 코드
- Riot 공식 Public Content Catalog 원본 전체(전체 덤프/아카이브)를
  저장소에 포함하는 것 — 이번 Task의 Mock 데이터에 실제로 등장하는
  요원/맵/무기에 대응하는 자산만 선별해 포함한다.
- 라인업, 커뮤니티, 분석(Phase 5) 실제 데이터/로직

## Acceptance criteria

### 1. 타입 확장

- [x] `frontend/src/types/match.ts`에 `WeaponSummary`를 추가하고,
  `CombatStats`에 `headshotPercentage: number`, `MatchSummary`에 `mapId`,
  `agentId`, `primaryWeapon: WeaponSummary`를 추가한다.
- [x] `frontend/src/types/player.ts`에 `AgentPlayRate`를 추가하고,
  `PlayerStatsSummary`에 `topAgents: AgentPlayRate[]`를 추가한다.
- [x] `frontend/src/types/index.ts`에서 `WeaponSummary`, `AgentPlayRate`를
  `export`한다.
- [x] `MatchParticipant`, `MatchRound`, `MatchDetail`은 변경하지 않는다.
- [x] `headshotPercentage`, `primaryWeapon`, `topAgents`와 컴포넌트에서
  계산하는 평균 ACS/평균 K/D에는 "Mock/가공 집계 필드 — Riot Match API
  원시 데이터 기반 Backend 집계 필요, 공식 API 직접 제공 값 아님"이라는
  취지의 주석을 타입 정의에 남긴다.

### 2. Mock 데이터 갱신

- [x] `frontend/src/data/mock-data.json`의 `players[0].statsSummary.topAgents`에
  1~3개 항목(`agentId`, `displayName`, `matchesPlayed`, `winRate`)을 추가한다.
- [x] `players[0].recentMatches`의 3건 모두에 `mapId`, `agentId`,
  `stats.headshotPercentage`, `primaryWeapon`(`weaponId`, `displayName`)을
  추가한다.
- [x] `matchDetails`는 변경하지 않는다.

### 3. 자산 매핑 및 이미지

- [x] `frontend/public/assets/agents/`, `maps/`, `weapons/`에 Mock
  데이터에서 사용하는 agentId 3개, mapId 3개, weaponId 최대 3개에
  대응하는 이미지를 추가한다. Riot 공식 Public Content Catalog에서 선별한
  자산을 우선 사용하고, 공식 자산을 확인할 수 없는 항목만 SVG placeholder로
  대체한다.
- [x] 공식 콘텐츠 카탈로그 원본 전체를 저장소에 포함하지 않는다(실제 사용하는
  자산 파일만 선별 포함).
- [x] `frontend/src/lib/**`에 `mapId`/`agentId`/`weaponId` → 로컬 자산
  경로 매핑 함수(들)를 추가한다. 매핑에 없는 키에 대해 안전한 기본값을
  반환한다(에러 throw 금지).
- [x] 외부 호스트에서 이미지를 fetch하지 않는다(`next.config.js` 미수정).
- [x] 각 자산의 출처(공식 카탈로그 엔드포인트/페이지, 확인 날짜), 대응하는
  agentId/mapId/weaponId, placeholder로 대체한 항목과 이유를 Task Result
  또는 별도 출처 문서(`frontend/public/assets/SOURCES.md` 등)에 기록한다.

### 4. 플레이어 프로필 요약

- [x] `PlayerProfile.tsx`에 Riot ID, 티어(`currentRank`), 최근 경기 승/패,
  승률, 평균 ACS, 평균 K/D(계산값), 주 사용 요원 요약(`topAgents`)을
  표시한다.
- [x] 기존 "Demo Profile" `data-badge`(및 `.section-kicker`)는 유지한다
  (제거·이름 변경 금지).
- [x] "최근 경기" 섹션과 `MatchSummaryList` 렌더링 구조(컴포넌트 호출)는
  유지한다.
- [x] 평균 K/D, 주 사용 요원 요약 등 가공 집계 값은 기존 "Demo Profile"
  배지 컨텍스트 내에서 표시하며, 이를 "공식 API 제공 값"처럼 보이게 하는
  별도 표현(라벨/문구)을 추가하지 않는다.

### 5. 최근 경기 카드

- [x] `MatchSummaryList.tsx`의 각 카드에 승리/패배, 맵 이름+맵 이미지,
  요원 이름+초상화, 경기 모드, 최종 스코어(`roundsWon`-`roundsLost`),
  ACS, K/D/A, K/D 비율(계산값), 헤드샷률, 경기 일시, 대표 무기 이름+이미지를
  표시한다.
- [x] 경기 상세로 이동하는 기존 링크(`/matches/{matchId}`)는 그대로
  유지한다.
- [x] 빈 배열(`matches.length === 0`)일 때 "최근 경기 없음" 안내는 유지한다.

### 6. 스타일

- [x] `frontend/src/app/globals.css`에 프로필 요약/경기 카드용 신규
  선택자를 추가한다. 기존 선택자(`.site-header`, `.site-footer`, `.home`,
  `.hero`, `.search-panel`, `.search-form`, `.search-row`, `.analysis-grid`,
  `.analysis-card`, `.placeholder-page` 등)의 정의는 변경하지 않는다.
- [x] 새 카드/요약 레이아웃은 모바일~데스크톱에서 가로 스크롤이나 깨짐 없이
  표시된다(기존 반응형 브레이크포인트 패턴과 일관되게).

### 7. 빌드 및 정적 검사

- [x] `cd frontend && npx tsc --noEmit` 성공.
- [x] `cd frontend && npm run lint` 성공.
- [x] `cd frontend && npm run build` 성공.

### 8. 범위 확인

- [x] `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`
  출력이 비어 있다.
- [x] `git status --porcelain -- frontend/src/app/page.tsx frontend/src/app/layout.tsx frontend/src/components/HomeSearch.tsx frontend/src/components/MatchDetailView.tsx frontend/src/components/MatchScoreboard.tsx frontend/src/components/MatchRoundTimeline.tsx "frontend/src/app/players/[puuid]/page.tsx" "frontend/src/app/matches/[matchId]/page.tsx" frontend/src/app/privacy frontend/src/app/terms frontend/src/app/connect frontend/src/components/RiotConnectNotice.tsx`
  출력이 비어 있다.
- [x] Result에 (a) PENDING으로 남긴 항목(VAL-CONTENT-V1 자산 매핑,
  headshotPercentage/primaryWeapon/topAgents 집계 로직)과 (b) 경기 상세
  개선을 시작하지 않았음을 명시한다.

## Verification commands

```bash
# 1) 타입 검사
cd frontend && npx tsc --noEmit

# 2) Lint
cd frontend && npm run lint

# 3) 빌드
cd frontend && npm run build

# 4) 범위 확인 — 패키지/Backend/Docker/Scripts 미변경 (출력 없어야 함)
cd .. && git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts

# 5) 범위 확인 — 홈/공통 레이아웃/경기 상세/약관 페이지 미변경 (출력 없어야 함)
git status --porcelain -- \
  frontend/src/app/page.tsx \
  frontend/src/app/layout.tsx \
  frontend/src/components/HomeSearch.tsx \
  frontend/src/components/MatchDetailView.tsx \
  frontend/src/components/MatchScoreboard.tsx \
  frontend/src/components/MatchRoundTimeline.tsx \
  "frontend/src/app/players/[puuid]/page.tsx" \
  "frontend/src/app/matches/[matchId]/page.tsx" \
  frontend/src/app/privacy frontend/src/app/terms frontend/src/app/connect \
  frontend/src/components/RiotConnectNotice.tsx

# 6) 변경된 파일 확인 (Allowed 영역만 존재해야 함)
git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib \
  frontend/src/components/PlayerProfile.tsx frontend/src/components/MatchSummaryList.tsx \
  frontend/src/app/globals.css frontend/public
```

## Stop conditions

다음 상황에서 작업을 중단하고 `BLOCKED`로 보고한다:

1. 신규 정보를 표시하기 위해 새로운 npm 패키지(이미지 처리, 아이콘 라이브러리,
   날짜/포맷 라이브러리 등) 설치가 필요한 경우.
2. 새 필드(`topAgents`, `headshotPercentage`, `primaryWeapon`, `mapId`,
   `agentId` 등) 추가가 `getDemoPlayers`/`getDemoPlayerByPuuid`/
   `getDemoPlayerByRiotId`/`getRecentMatchesForPlayer`/`getMatchDetail`의
   기존 시그니처나 호출부와 충돌하는 경우 — 임의로 시그니처를 변경하지 말고
   BLOCKED로 보고한다.
3. Riot 공식 Public Content Catalog에서 자산을 확인할 수 없고, placeholder
   fallback으로도 디자인 요구를 충족할 수 없어 비공식 외부 이미지 호스트
   연동이 필요하다고 판단되는 경우. (공식 자산을 못 찾은 항목에 placeholder를
   쓰는 것 자체는 BLOCKED가 아니다 — 출처 기록에 placeholder로 명시하고
   계속 진행한다.)
4. 위 변경 과정에서 경기 상세
   (`MatchDetailView.tsx`/`MatchScoreboard.tsx`/`MatchRoundTimeline.tsx`)
   또는 홈/공통 레이아웃(`page.tsx`, `layout.tsx`, `HomeSearch.tsx`,
   `AnalysisExampleCards.tsx`, 헤더/푸터 컴포넌트) 수정이 불가피한 경우.
5. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

## Result

DONE (2026-06-15)

변경 파일:

- `frontend/src/types/match.ts`
- `frontend/src/types/player.ts`
- `frontend/src/types/index.ts`
- `frontend/src/data/mock-data.json`
- `frontend/src/lib/asset-map.ts`
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/MatchSummaryList.tsx`
- `frontend/src/app/globals.css`
- `frontend/public/assets/SOURCES.md`
- `frontend/public/assets/agents/{jett,omen,sova,placeholder}.svg`
- `frontend/public/assets/maps/{ascent,haven,split,placeholder}.svg`
- `frontend/public/assets/weapons/{operator,phantom,vandal,placeholder}.svg`
- `docs/tasks/TASK-015UI2.md`

구현 결과:

- 프로필 요약에 Riot ID, 티어, 최근 승/패, 승률, 평균 ACS, 평균 K/D,
  주 사용 요원 요약을 표시했다.
- 최근 경기 카드에 승/패, 맵 이미지와 이름, 요원 이미지와 이름, 모드,
  스코어, ACS, K/D/A, K/D 비율, 헤드샷률, 경기 일시, 대표 무기 이미지와
  이름을 표시했다.
- `agentId`/`mapId`/`weaponId`를 로컬 자산 경로로 변환하는
  `frontend/src/lib/asset-map.ts`를 추가했다. 매핑되지 않은 값은 각 분류의
  placeholder SVG로 fallback한다.
- `getDemoPlayers`, `getDemoPlayerByPuuid`, `getDemoPlayerByRiotId`,
  `getRecentMatchesForPlayer`, `getMatchDetail`의 이름과 시그니처는 유지했다.
- `matchDetails` 데이터는 변경하지 않았다. 단, `CombatStats.headshotPercentage`
  필드를 `MatchSummary`에 필수로 추가하면서 경기 상세 데이터에 새 필드를
  강제로 추가하지 않기 위해 `MatchParticipant.stats` 타입은 기존 필드
  집합(kills/deaths/assists/averageCombatScore)을 유지하도록 `CombatStats`와
  분리했다.

자산 출처와 PENDING:

- Riot Developer Portal API 목록에서 `val-content-v1`와 `val-match-v1`의
  공식 존재를 확인했다(확인일: 2026-06-15).
- 이번 실행에서 Mock 데이터의 Jett/Sova/Omen, Ascent/Haven/Split,
  Vandal/Phantom/Operator에 대응하는 공식 이미지 파일 URL과 슬러그/UUID
  1:1 매핑을 확정하지 못했으므로, 모든 추가 이미지는 로컬 SVG placeholder
  fallback으로 포함했다.
- 자산별 출처, 확인일, 매핑 ID, fallback 여부는
  `frontend/public/assets/SOURCES.md`에 기록했다.
- PENDING: VAL-CONTENT-V1 식별자와 이미지 자산의 정확한 매핑 확정 후
  placeholder를 공식 Riot Public Content Catalog 기반 파일로 교체해야 한다.
- PENDING: `headshotPercentage`, `primaryWeapon`, `topAgents`는 Mock/가공
  집계 필드이며, 실제 서비스에서는 Backend가 Riot VAL-MATCH-V1 원시
  데이터를 집계해 산출해야 한다.
- 경기 상세 화면 개선은 시작하지 않았다.

검증 결과:

- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`: 출력 없음.
- 홈/공통 레이아웃/경기 상세/약관 페이지 금지 파일 범위 확인: 출력 없음.
- 변경 파일 확인: TASK-015UI2 Allowed 영역과 `docs/tasks/TASK-015UI2.md`만 변경됨.
- 기존 데이터 로더 시그니처 확인: 변경 없음.
- 포함된 자산과 `SOURCES.md` 기록 일치 확인: 성공.

남은 위험:

- 현재 SVG 이미지는 공식 이미지가 아니라 fallback placeholder이므로,
  시각적 정확도는 후속 공식 자산 매핑 확정 전까지 제한된다.
- 대표 무기, 헤드샷률, 주 사용 요원은 Mock 값이며 실제 Riot Match API
  집계와 다를 수 있다.
