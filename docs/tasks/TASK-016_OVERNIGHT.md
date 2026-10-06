# TASK-016_OVERNIGHT: 라인업 데이터 모델 + 검색 화면 야간 통합 구현 (Phase 3 진입)

## Status

READY (사용자 명시 지시에 의한 야간 자율 구현 Task — 기존 TASK-016 + TASK-017 1차 범위 통합)

> TASK-015UI12G(경기 상세 4탭 고밀도 재설계, G-A~G-D)가 전체 커밋 완료된 Git 상태(HEAD `ed86869`) 위에서 진행한다.
> 사용자가 "자는 동안 Codex가 구현"하도록 명시 승인했으므로, 본 Task는 야간 자율 구현 대상이다(Planner는 문서·핸드오프만 작성).

## Goal

Phase 3 라인업(Lineups) 기능의 1차 토대를 구축한다.

1. **데이터 모델**: 맵·요원·스킬(Ability)·팁 내용·미디어(YouTube/이미지) URL·작성자를 포함하는 스킬 라인업 Mock 데이터 모델(`Lineup` 타입)과 Mock 데이터셋을 설계·작성한다.
2. **검색 화면 UI**: 맵·요원·스킬 종류로 필터링해 해당 라인업 목록을 카드로 조회하는 `/lineups` 검색 페이지를 구현한다.

> 본 Task는 데이터 모델 + 검색/필터/카드 목록까지다. 라인업 **상세 페이지**(TASK-018), 즐겨찾기·관리자 등록·댓글 등은 범위 밖이다.

## Background

- 현재 라인업 기능은 존재하지 않는다. Phase 3의 TASK-016(데이터 모델)·TASK-017(검색)을 사용자 지시로 하나의 야간 통합 Task로 묶는다(PLAN·PROGRESS에 통합 근거 기록).
- 기존 자산·관례 재사용: 맵은 `mapId`(예: `ascent`/`haven`/`split`), 요원은 `agentId`(예: `sova`/`viper`/`cypher` 등) 슬러그를 사용하며, `frontend/src/lib/asset-map.ts`의 `getMapListViewAssetPath(mapId)`·`getAgentAssetPath(agentId)`로 썸네일을 렌더할 수 있다. 신규 맵/요원 자산은 취득하지 않는다(기존 자산 범위 내).
- 데이터 흐름은 기존 Mock 패턴(`src/data/*.json` → `src/lib/*` 로더)을 따른다.

## Reference Direction

- 라인업 사이트(예: lineups.gg, valorant lineup DB)의 정보 구조를 **참고만** 하고 디자인을 복제하지 않는다.
- 카드 그리드 + 좌측/상단 필터 패턴. 프로필/경기 상세와 동일한 다크 톤·카드 문법(`globals.css`)을 재사용해 일관성을 유지한다.

## Allowed Changes

- `frontend/src/types/lineup.ts` (신규) — `Lineup` 및 관련 타입 정의.
- `frontend/src/data/mock-lineups.json` (신규) — 라인업 Mock 데이터셋(맵·요원·스킬 다양성 확보, 최소 8~12건).
- `frontend/src/app/lineups/page.tsx` (신규) — `/lineups` 검색 페이지(서버 컴포넌트 권장, 데이터 로드 + 결과 렌더).
- `frontend/src/components/LineupSearchFilter.tsx` (신규) — 맵/요원/스킬 필터 UI(상태 필요 시 client component) + 필터링된 카드 목록 렌더.
- `frontend/src/app/globals.css` — `/lineups` 페이지·필터·카드 스타일.

## Forbidden Changes

- 위 5개 파일 외 수정 금지(`SiteHeader.tsx` 네비 링크 추가 등은 후속 Task로 분리 — `/lineups` 직접 접근으로 검증).
- `backend/`, `docker/`, `scripts/`, `frontend/package.json`/lockfile, 신규 npm 패키지(차트/캐러셀 등 라이브러리) 추가 금지 — 순수 React/CSS로 구현.
- 외부 이미지 **런타임 핫링크 금지**: 미디어 URL은 데이터로 보관하되, YouTube는 새 탭 링크(anchor)로, 썸네일은 기존 로컬 맵/요원 자산 또는 로컬 placeholder로 렌더한다. `<img src="https://...">`/외부 CDN 런타임 fetch 금지(가드레일 `ui-design-guardrails.md`).
- 기존 전적/프로필/경기 상세 기능·라우트 변경 금지.
- Git add/commit/push 실행 금지(구현 단계).

## 데이터 모델 (목표 정본)

`frontend/src/types/lineup.ts`에 다음 형태로 정의한다(필드명은 가이드, 합리적 보완 허용).

```ts
export type AbilitySlot = "C" | "Q" | "E" | "X"; // Valorant 스킬 슬롯
export type LineupSide = "attack" | "defense";
export type LineupDifficulty = "easy" | "medium" | "hard";

export interface LineupAbility {
  abilityId: string;     // 예: "sova-shock-bolt" (slug)
  slot: AbilitySlot;
  displayName: string;   // 예: "Shock Bolt"
}

export interface LineupMedia {
  // 외부 URL은 데이터로만 보관. 런타임 외부 이미지 fetch 금지(링크/로컬 자산 렌더).
  youtubeUrl?: string;
  thumbnailAssetId?: string; // 로컬 맵/요원 자산 키 또는 placeholder
  imageUrls?: string[];      // 데이터 보관용(렌더는 로컬 placeholder 우선)
}

export interface LineupAuthor {
  name: string;
  profileUrl?: string;
}

export interface Lineup {
  id: string;
  title: string;
  mapId: string;         // 기존 mapId 관례 재사용 (getMapListViewAssetPath)
  mapName: string;
  agentId: string;       // 기존 agentId 관례 재사용 (getAgentAssetPath)
  agentName: string;
  ability: LineupAbility;
  side: LineupSide;
  difficulty: LineupDifficulty;
  description: string;   // 스킬 사용 팁 내용
  steps?: string[];      // 선택: 단계별 가이드
  media: LineupMedia;
  author: LineupAuthor;
  tags?: string[];
  createdAt: string;     // ISO 날짜 문자열
}
```

- 모든 라인업은 **Mock/데모 데이터**임을 화면에서 정직하게 고지한다(전역 Mock/Preview 정책 일관). 타입에는 기존 스타일대로 Mock 주석을 단다.

## 검색 화면 UI (요구사항)

1. `/lineups` 페이지: 페이지 제목·간단 설명·Mock 고지, 필터 영역 + 결과 카드 그리드.
2. 필터(`LineupSearchFilter.tsx`): **맵**(mapId), **요원**(agentId), **스킬 종류**(AbilitySlot 또는 abilityId) 다중/단일 선택. 필터 변경 시 결과가 즉시 갱신된다(client 상태). "전체" 옵션 제공.
3. 결과 카드: 맵 썸네일(로컬 자산), 요원 아이콘(로컬 자산), 스킬명·슬롯, 제목, 난이도 배지, side(공격/수비), 작성자, YouTube 링크(있으면 새 탭). 빈 결과 시 빈 상태 메시지.
4. 반응형: 데스크톱 다열 그리드 → 모바일 1열. 기존 카드 보더/톤 문법 재사용.

## Acceptance Criteria

1. `frontend/src/types/lineup.ts`에 `Lineup` 및 관련 타입이 정의되고, 기존 `mapId`/`agentId` 관례와 호환되는가.
2. `frontend/src/data/mock-lineups.json`에 맵·요원·스킬이 다양하게 분포한 라인업 Mock이 8건 이상 있고 타입과 정합하는가.
3. `/lineups`에서 맵/요원/스킬 필터로 카드 목록이 정확히 필터링되고, 빈 결과 폴백이 동작하는가.
4. 카드 썸네일/아이콘이 기존 로컬 자산 헬퍼로 렌더되고, 외부 이미지 런타임 핫링크가 없는가(YouTube는 링크만).
5. 라인업이 Mock/데모임이 화면에서 고지되는가.
6. `npx tsc --noEmit`, `npm run lint`, `npm run build`가 모두 통과하고, 수정이 Allowed 5개 파일 범위를 벗어나지 않는가.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
ls frontend/src/types/lineup.ts frontend/src/data/mock-lineups.json frontend/src/app/lineups/page.tsx frontend/src/components/LineupSearchFilter.tsx
grep -rn "https://\|http://" frontend/src/app/lineups frontend/src/components/LineupSearchFilter.tsx || echo "OK: no runtime external image hotlink in render"
```

> 참고: 위 grep에서 `mock-lineups.json`의 youtubeUrl 등 데이터 문자열은 제외 대상이다(데이터 보관은 허용, 런타임 외부 이미지 fetch만 금지). 렌더 컴포넌트/페이지 코드에서 외부 `<img>` src가 없어야 한다.

## Stop Conditions

- 신규 npm 패키지(차트/캐러셀/비디오 라이브러리)나 외부 실 자산이 필요해질 때 → 중단·사람 결정 대기.
- 동일 검증 에러가 3회 이상 반복되면 `BLOCKED`로 처리하고 중단한다.
- 라인업 상세/즐겨찾기/관리자 등록 등 범위 밖 기능으로 확장하지 않는다(후속 Task).

## Result

(구현 후 Codex 작성)
