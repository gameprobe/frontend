# TASK-015UI3: 요원/맵/무기 이미지를 공식 Public Content Catalog 자산으로 교체

## Status

DONE (2026-06-15)

## Goal

TASK-015UI2(플레이어 프로필·최근 경기 카드 정보 강화, DONE)에서 추가한
요원·맵·무기 이미지는 현재 전부 **SVG fallback placeholder**다
(`frontend/public/assets/SOURCES.md` 참조, "Source status: fallback" 9건).
이 Task는 그 중 아래 9개 대상에 대해, Riot 공식 Public Content Catalog에서
실제 이미지를 식별·추출해 로컬 자산으로 교체한다.

- Agents: Jett (`jett`), Omen (`omen`), Sova (`sova`)
- Maps: Ascent (`ascent`), Haven (`haven`), Split (`split`)
- Weapons: Vandal (`vandal`), Phantom (`phantom`), Operator (`operator`)

**공식 소스(사용자 제공)**:

```
https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip
```

1. 위 ZIP을 다운로드해 내용을 확인하고, 위 9개 대상에 대응하는 이미지
   파일(요원 초상화, 맵 이미지, 무기 아이콘)과 이름/ID 매핑 근거(카탈로그
   내부 JSON/매니페스트의 식별자·표시 이름·자산 경로)를 찾는다.
2. ZIP 전체를 저장소에 포함하지 않고, 식별된 이미지 파일만 추출해
   `frontend/public/assets/{agents,maps,weapons}/`에 추가한다(기존
   placeholder 파일을 대체하거나 새 파일로 추가).
3. `frontend/src/lib/asset-map.ts`의 내부 매핑 테이블(`agentAssetPaths`,
   `mapAssetPaths`, `weaponAssetPaths`)이 새 파일을 가리키도록 갱신한다.
   `getAgentAssetPath`/`getMapAssetPath`/`getWeaponAssetPath` 공개 함수의
   시그니처와 동작(매핑 없는 키에 대한 placeholder fallback)은 그대로
   유지하고, 호출부(`PlayerProfile.tsx`, `MatchSummaryList.tsx`)는
   변경하지 않는다.
4. `frontend/public/assets/SOURCES.md`를 갱신해 각 대상별로 공식 다운로드
   URL, 카탈로그 버전, ZIP 내부 원본 경로, 로컬 저장 경로, 대상 이름
   (agentId/mapId/weaponId + displayName), 확인일을 기록한다.
5. 카탈로그에서 공식 이미지를 정말 찾지 못한 대상에 한해서만 기존 SVG
   placeholder를 유지하고, SOURCES.md에 "공식 자산 미확인" 사유를 구체적으로
   기록한다(어떤 경로/식별자를 확인했고 왜 사용할 수 없었는지).

다음은 이 Task의 범위가 아니다:

- `frontend/src/types/**`, `frontend/src/data/mock-data.json`,
  `frontend/src/lib/mock-data.ts` — 타입/Mock 데이터 구조 변경 없음.
- `frontend/src/components/**`, `frontend/src/app/**` (globals.css 포함) —
  UI 구조·스타일 변경 없음. 이미지 파일과 매핑 테이블 값만 바뀐다.
- `frontend/package.json`/lockfile, Backend, Docker, Scripts.
- 홈 화면, 경기 상세 스코어보드/타임라인.
- 9개 대상 외 다른 요원/맵/무기 자산 추가.

## Context

### 현재 상태 (TASK-015UI2 결과)

`frontend/public/assets/`:

```
agents/jett.svg, agents/omen.svg, agents/sova.svg, agents/placeholder.svg
maps/ascent.svg, maps/haven.svg, maps/split.svg, maps/placeholder.svg
weapons/vandal.svg, weapons/phantom.svg, weapons/operator.svg, weapons/placeholder.svg
SOURCES.md
```

`frontend/public/assets/SOURCES.md`는 9개 대상(agent 3, map 3, weapon 3)이
모두 `Source status: fallback`이며, 사유는 "공식 카탈로그 패밀리(VAL-CONTENT-V1
/ VAL-MATCH-V1)는 확인했지만 정확한 공식 이미지 파일 URL은 이번 Task에서
확인하지 못함"으로 기록되어 있다. PENDING 항목으로 "VAL-CONTENT-V1
식별자-이미지 매핑이 확인되면 fallback을 공식 자산으로 교체"가 명시돼 있다.
이 Task가 그 PENDING을 해소하는 후속 작업이다.

`frontend/src/lib/asset-map.ts` (현재 전체):

```ts
type AssetKind = "agent" | "map" | "weapon";

const agentAssetPaths: Record<string, string> = {
  jett: "/assets/agents/jett.svg",
  sova: "/assets/agents/sova.svg",
  omen: "/assets/agents/omen.svg",
};

const mapAssetPaths: Record<string, string> = {
  ascent: "/assets/maps/ascent.svg",
  haven: "/assets/maps/haven.svg",
  split: "/assets/maps/split.svg",
};

const weaponAssetPaths: Record<string, string> = {
  vandal: "/assets/weapons/vandal.svg",
  phantom: "/assets/weapons/phantom.svg",
  operator: "/assets/weapons/operator.svg",
};

function fallbackPath(kind: AssetKind): string {
  return `/assets/${kind}s/placeholder.svg`;
}

export function getAgentAssetPath(agentId: string): string {
  return agentAssetPaths[agentId] ?? fallbackPath("agent");
}

export function getMapAssetPath(mapId: string): string {
  return mapAssetPaths[mapId] ?? fallbackPath("map");
}

export function getWeaponAssetPath(weaponId: string): string {
  return weaponAssetPaths[weaponId] ?? fallbackPath("weapon");
}
```

이 Task는 위 3개 `Record<string, string>` 테이블의 **값**(경로/확장자)만
새 자산을 가리키도록 바꾼다. `placeholder.svg` 파일과 `fallbackPath` 함수,
3개 export 함수의 이름·시그니처·호출부는 변경하지 않는다.

### Task ID에 대해

TASK-015UI(DONE) → TASK-015UI2(DONE)에 이어 같은 Phase 2 UI 개선 계열의
후속 작업이므로 `TASK-015UI3`로 명명한다. TASK-016~038의 번호/상태는
변경하지 않는다.

## Allowed changes

```
frontend/public/assets/agents/**     # jett/omen/sova 공식 이미지로 교체 또는 추가
                                      # (placeholder.svg는 유지)
frontend/public/assets/maps/**       # ascent/haven/split 공식 이미지로 교체 또는 추가
                                      # (placeholder.svg는 유지)
frontend/public/assets/weapons/**    # vandal/phantom/operator 공식 이미지로 교체 또는 추가
                                      # (placeholder.svg는 유지)
frontend/public/assets/SOURCES.md    # 출처 표 갱신
frontend/src/lib/asset-map.ts        # 3개 매핑 테이블의 값(경로)만 갱신.
                                      # export 함수 시그니처/이름/동작 변경 금지
docs/tasks/TASK-015UI3.md            # 이 문서의 Result 갱신
```

## Forbidden changes

- `frontend/src/types/**`, `frontend/src/data/mock-data.json`,
  `frontend/src/lib/mock-data.ts` — 타입/Mock 데이터 변경 금지.
- `frontend/src/components/**` — `PlayerProfile.tsx`, `MatchSummaryList.tsx`
  등 호출부 변경 금지(이미지 경로는 `asset-map.ts`를 통해서만 바뀐다).
- `frontend/src/app/**` (`globals.css`, `page.tsx`, `layout.tsx` 등) —
  스타일/구조 변경 금지.
- `frontend/src/lib/asset-map.ts`의 `getAgentAssetPath`/`getMapAssetPath`/
  `getWeaponAssetPath`/`fallbackPath` 시그니처·이름·반환 형식(문자열 경로)
  변경, 새 export 추가.
- `frontend/public/assets/agents/placeholder.svg`,
  `frontend/public/assets/maps/placeholder.svg`,
  `frontend/public/assets/weapons/placeholder.svg` 삭제 — 매핑 없는 키의
  fallback으로 계속 사용되므로 유지한다.
- `frontend/package.json`, `frontend/package-lock.json` (새 패키지/의존성
  추가 포함)
- `backend/**`, `docker/**`, `scripts/**`
- `AGENTS.md`, `CLAUDE.md`, `docs/PLAN.md`, `docs/PROGRESS.md`,
  `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`,
  `docs/tasks/TASK-015UI.md`, `docs/tasks/TASK-015UI2.md`, 그 외
  `docs/tasks/TASK-0XX.md`
- 다운로드한 ZIP 파일 자체, 압축 해제한 카탈로그 디렉터리 전체, 또는 9개
  대상 외 자산을 저장소에 커밋하는 것.
- 런타임에 외부 호스트(예: `valorant.dyn.riotcdn.net`,
  `media.valorant-api.com` 등)에서 이미지를 fetch하는 코드 추가 — ZIP
  다운로드는 구현 시 1회성 자산 추출 작업이며, 실행 중인 Frontend 앱
  코드에는 포함되지 않는다.
- 라인업, 커뮤니티, 분석(Phase 5) 실제 데이터/로직.

## Acceptance criteria

### 1. 자산 추출 및 교체

- [x] 제공된 URL에서 `PublicContentCatalog-release-12.08.zip`을 다운로드해
  내용을 확인한다. (URL이 더 이상 유효하지 않으면 Stop condition 참조.)
- [x] 카탈로그 내부 JSON/매니페스트에서 Jett/Omen/Sova(agents),
  Ascent/Haven/Split(maps), Vandal/Phantom/Operator(weapons)에 대응하는
  식별자·표시 이름·이미지 자산 경로를 확인한다.
- [x] 확인된 이미지 중 실제로 존재·사용 가능한 파일만 추출해
  `frontend/public/assets/{agents,maps,weapons}/`에 추가한다. ZIP 전체나
  압축 해제 디렉터리는 저장소에 포함하지 않는다.
- [x] 9개 대상 중 공식 이미지를 확인한 항목은 `asset-map.ts`의 해당
  매핑 값을 새 파일 경로로 갱신한다.
- [x] 공식 이미지를 확인하지 못한 항목은 기존 SVG placeholder 매핑을
  그대로 둔다(삭제/변경 금지).

### 2. asset-map.ts

- [x] `getAgentAssetPath`/`getMapAssetPath`/`getWeaponAssetPath`/
  `fallbackPath`의 이름, 시그니처(`(id: string) => string`), 매핑 없는
  키에 대한 fallback 동작은 변경되지 않는다.
- [x] `placeholder.svg` 3개 파일은 그대로 존재한다.

### 3. 출처 기록 (SOURCES.md)

- [x] 공식 이미지로 교체한 각 대상에 대해 다음을 표에 기록한다: 공식
  다운로드 URL, 카탈로그 버전(ZIP 파일명 기준, 실제 확인된 버전이 다르면
  그 값), ZIP 내부 원본 경로, 로컬 저장 경로, 대상 이름
  (agentId/mapId/weaponId + displayName), 확인일(YYYY-MM-DD).
- [x] placeholder로 남은 대상에 대해서는 "공식 자산 미확인" 사유를
  구체적으로 갱신한다(어떤 카탈로그 경로/식별자를 확인했고 왜 사용할 수
  없었는지).
- [x] "PENDING" 섹션을 현재 상태에 맞게 갱신한다(전부 해소됐으면 PENDING
  항목 제거 또는 남은 항목만 유지).

### 4. 빌드 및 정적 검사

- [x] `cd frontend && npx tsc --noEmit` 성공.
- [x] `cd frontend && npm run lint` 성공.
- [x] `cd frontend && npm run build` 성공.

### 5. 범위 확인

- [x] `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts frontend/src/types frontend/src/data frontend/src/lib/mock-data.ts frontend/src/components frontend/src/app`
  출력이 비어 있다(이 Task에서 변경되지 않아야 하는 영역).
- [x] `git status --porcelain -- frontend/public/assets frontend/src/lib/asset-map.ts docs/tasks/TASK-015UI3.md`
  만 변경 사항으로 나타난다.
- [x] `git ls-files | grep -i '\.zip$'` 출력이 비어 있다(ZIP 파일 미커밋).
- [x] `grep -r "riotcdn.net" frontend/src` 출력이 비어 있다(런타임 코드에
  외부 호스트 참조 없음 — URL은 `SOURCES.md`/이 Task 문서에만 기록).

## Verification commands

```bash
# 1) 타입 검사
cd frontend && npx tsc --noEmit

# 2) Lint
cd frontend && npm run lint

# 3) 빌드
cd frontend && npm run build

# 4) 범위 확인 — 이 Task에서 변경되지 않아야 하는 영역 (출력 없어야 함)
cd .. && git status --porcelain -- \
  frontend/package.json frontend/package-lock.json backend docker scripts \
  frontend/src/types frontend/src/data frontend/src/lib/mock-data.ts \
  frontend/src/components frontend/src/app

# 5) 변경된 파일 확인 (자산/매핑/이 Task 문서만 존재해야 함)
git status --porcelain -- frontend/public/assets frontend/src/lib/asset-map.ts docs/tasks/TASK-015UI3.md

# 6) ZIP 미커밋 확인
git ls-files | grep -i '\.zip$'

# 7) 런타임 코드에 외부 카탈로그 호스트 참조 없음 확인
grep -r "riotcdn.net" frontend/src
```

## Stop conditions

다음 상황에서 작업을 중단하고 `BLOCKED`로 보고한다:

1. 제공된 ZIP URL에 접근할 수 없는 경우(네트워크 차단, 404 등). 이 경우
   동일한 `PublicContentCatalog-release-X.XX.zip` 패턴의 최신 버전을
   1회 시도해볼 수 있으나, 그래도 접근할 수 없으면 BLOCKED로 보고하고
   현재 placeholder 상태를 유지한다(되돌리기 불필요 — 변경하지 않음).
2. ZIP 처리(압축 해제, 이미지 포맷 변환 등)에 새 npm 패키지 설치나
   `scripts/**`에 영구 스크립트 추가가 필요한 경우 — 임시 작업 디렉터리와
   OS 기본 도구(unzip 등)로 처리할 수 없다면 BLOCKED로 보고한다.
3. `asset-map.ts`의 공개 함수 시그니처나 이름 변경이 불가피한 경우.
4. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

다음은 BLOCKED가 **아니다** (계속 진행):
- 9개 대상 중 일부만 공식 자산으로 교체되고 나머지는 placeholder로
  남는 경우 — SOURCES.md에 사유를 기록하고 정상 완료로 보고한다.
- 카탈로그 버전이 제공된 `release-12.08`과 다른 경우 — 실제 확인한
  버전을 SOURCES.md에 기록한다.

## Result

DONE (2026-06-15)

변경 파일:

- `frontend/public/assets/SOURCES.md`
- `frontend/public/assets/agents/jett.png`
- `frontend/public/assets/agents/omen.png`
- `frontend/public/assets/agents/sova.png`
- `frontend/public/assets/maps/ascent.png`
- `frontend/public/assets/maps/haven.png`
- `frontend/public/assets/maps/split.png`
- `frontend/public/assets/weapons/vandal.png`
- `frontend/public/assets/weapons/phantom.png`
- `frontend/public/assets/weapons/operator.png`
- `frontend/public/assets/agents/jett.svg` 삭제
- `frontend/public/assets/agents/omen.svg` 삭제
- `frontend/public/assets/agents/sova.svg` 삭제
- `frontend/public/assets/maps/ascent.svg` 삭제
- `frontend/public/assets/maps/haven.svg` 삭제
- `frontend/public/assets/maps/split.svg` 삭제
- `frontend/public/assets/weapons/vandal.svg` 삭제
- `frontend/public/assets/weapons/phantom.svg` 삭제
- `frontend/public/assets/weapons/operator.svg` 삭제
- `frontend/src/lib/asset-map.ts`
- `docs/tasks/TASK-015UI3.md`

구현 결과:

- 사용자 제공 공식 ZIP
  `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip`
  을 `/private/tmp`에 다운로드해 조사했다. ZIP 파일과 압축 해제 디렉터리는
  저장소에 포함하지 않았다.
- ZIP 내부 `PublicContentCatalog.json`에서 카탈로그 버전
  `12.08.00.4578383`과 9개 대상의 공식 ID/display name을 확인했다.
- 공식 ID 기반 이미지 파일 9개를 선별 추출해 로컬 PNG로 저장했다.
  - Agents: `Characters/{id}_small.png`
  - Maps: `Maps/{id}_listview.png`
  - Weapons: `Weapons/{id}.png`
- `frontend/src/lib/asset-map.ts`의 3개 매핑 테이블 값만 `.png` 경로로
  갱신했다. `getAgentAssetPath`, `getMapAssetPath`,
  `getWeaponAssetPath`, `fallbackPath`의 이름·시그니처·fallback 동작은
  변경하지 않았다.
- 기존 대상별 SVG fallback 파일 9개는 공식 PNG로 대체되어 삭제했다.
  `agents/placeholder.svg`, `maps/placeholder.svg`,
  `weapons/placeholder.svg`는 그대로 유지했다.
- 9개 대상 모두 공식 자산으로 교체됐다. placeholder로 남은 대상은 없다.
- `frontend/public/assets/SOURCES.md`에 대상 이름, 자산 종류, 카탈로그
  버전, 공식 ZIP URL, ZIP 내부 원본 경로, 로컬 저장 경로, 매핑 ID/이름 근거,
  확인일, 공식 자산 여부를 기록했다.

검증 결과:

- 공식 자산 교체 개수: 9/9.
- `file frontend/public/assets/agents/*.png frontend/public/assets/maps/*.png frontend/public/assets/weapons/*.png frontend/public/assets/*/*.svg`: PNG/SVG 렌더링 가능 형식 확인 성공.
- PNG signature 및 `SOURCES.md` 실제 파일 목록 일치 검사: 성공.
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts frontend/src/types frontend/src/data frontend/src/lib/mock-data.ts frontend/src/components frontend/src/app`: 출력 없음.
- `git status --porcelain -- frontend/public/assets frontend/src/lib/asset-map.ts docs/tasks/TASK-015UI3.md`: 허용 영역 변경만 표시됨.
- `git ls-files | grep -i '\.zip$'`: 출력 없음(명령 종료코드 1, 매칭 없음).
- `grep -r "riotcdn.net" frontend/src`: 출력 없음(명령 종료코드 1, 매칭 없음).

남은 위험:

- 현재 자산은 Riot Public Content Catalog `12.08.00.4578383` 기준이다. Riot가
  새 카탈로그 버전을 배포하면 동일 매핑을 재확인해야 한다.
