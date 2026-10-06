# TASK-015UI: 홈 화면 및 공통 레이아웃 디자인 — GameProbe 브랜드 적용

## Status

DONE (2026-06-15)

## Goal

확정된 "GameProbe" 디자인(아래 "확정 디자인" 참조)을 기준으로 다음을 구현한다.

1. **공통 레이아웃**: 모든 페이지에 적용되는 헤더(좌측 `GameProbe`, 우측
   `Privacy / Terms / Connect`)와 비제휴 안내 푸터를 추가한다.
2. **홈 화면 재설계**: 짙은 네이비·차콜 기반 "Clean Data Terminal" 분위기,
   청록·민트 포인트 컬러, 아주 약한 그리드 배경을 적용하고, 핵심 문구
   "Riot ID를 검색하고 플레이를 확인하세요"와 큰 둥근 검색 패널, 분석 예시
   카드 4개(위치 선정 / 팀 교전 / 첫 교전 / 사이트 방어)를 첫 화면에 배치한다.
3. **검색 동작 변경**: 형식이 올바른 Riot ID는 Mock 데이터 존재 여부와 무관하게
   항상 고정 데모 프로필로 이동한다.
4. **결과 화면 표시**: 플레이어 프로필·경기 상세 화면에 "Demo Profile" 또는
   "Mock Data"임을 나타내는 작은 배지/라벨을 추가한다(대규모 레이아웃 변경
   제외).

다음은 이 Task의 범위가 아니다:

- 플레이어 프로필(`PlayerProfile.tsx`)과 경기 상세
  (`MatchDetailView.tsx`/`MatchScoreboard.tsx`/`MatchRoundTimeline.tsx`/
  `MatchSummaryList.tsx`)의 내부 구조·정보 표시 방식에 대한 대규모 디자인
  변경 — 후속 Task로 분리한다. 이번 Task에서는 위 4)의 작은 배지 추가만
  허용한다.
- `docs/DECISIONS.md` PENDING-003(스타일링 방식) 자체의 해소 — 이 Task는
  새 패키지를 추가하지 않고 기존 `globals.css` 기반 일반 CSS 접근을 계속
  사용한다. PENDING-003은 여전히 "대기" 상태로 유지된다.
- `frontend/src/types/**`, `frontend/src/data/**`, `frontend/src/lib/**`의
  수정 — 검색·프로필·경기 상세 데이터 로더와 타입은 그대로 사용한다.
- `/privacy`, `/terms`, `/connect` 페이지 본문 콘텐츠 변경 — 공통
  헤더/푸터를 통해 자동으로 새 레이아웃을 상속받는 것 외의 본문 변경은
  하지 않는다.

## Context

### 확정 디자인 (사람이 확정한 요구사항, 변경 없이 그대로 반영)

- 서비스명: GameProbe
- 첫인상: 전적 검색 사이트형
- 분위기: 짙은 네이비·차콜 기반의 Clean Data Terminal
- 포인트 색: 청록·민트
- 배경: 아주 약한 그리드
- 헤더: 왼쪽 GameProbe, 오른쪽 Privacy / Terms / Connect
- 첫 화면 안에 검색 영역과 분석 예시 카드가 대부분 보이게 구성
- 검색 영역은 큰 둥근 패널
- 핵심 문구: "Riot ID를 검색하고 플레이를 확인하세요"
- 검색창 placeholder: `SeoulDuelist#KR1`
- 검색 버튼 문구: "전적 검색"
- 별도 검색 설명 문구 없음
- 어떤 Riot ID를 입력해도 고정 데모 프로필로 이동
- 결과 화면에는 Demo Profile 또는 Mock Data 표시
- 분석 예시 카드 4개: 위치 선정 / 팀 교전 / 첫 교전 / 사이트 방어
- 점수는 숫자만 크게 표시
- 분석 카드는 각진 패널
- 검색 패널은 둥근 형태
- 모바일·태블릿·데스크톱 반응형
- 새 패키지 설치 금지
- 기존 검색·프로필·경기 상세 데이터 흐름 유지
- Backend, Mock 데이터, 타입, package.json, lockfile 수정 금지
- 프로필·경기 상세의 대규모 디자인 변경은 후속 Task로 분리
- Riot 공식 서비스로 오해받지 않도록 비제휴 안내 포함

### 현재 구현 상태 (변경 전)

- `frontend/src/app/layout.tsx`: 헤더/푸터 없이 `<html><body>{children}</body></html>`만
  렌더링한다. `metadata.title`은 `"VALORANT Platform"`이다.
- `frontend/src/app/globals.css`: 라이트 테마(`#f9fafb` 배경, `#111827` 텍스트,
  포인트 컬러 `#be123c`)이며 `.home`, `.hero`, `.search-panel`,
  `.search-form`, `.demo-grid`, `.demo-card`, `.placeholder-page` 등 클래스가
  정의되어 있다. CSS 변수(디자인 토큰)는 없다.
- `frontend/src/app/page.tsx`: `<main className="home">` 안에 `.hero`(소제목
  "Mock 전적 검색", 헤드라인 "VALORANT 플레이어를 검색하세요", 설명 문단)와
  `HomeSearch` 컴포넌트를 렌더링한다.
- `frontend/src/components/HomeSearch.tsx`:
  - Riot ID 형식 검증 정규식 `^[^#\s][^#]*#[A-Za-z0-9]{2,5}$`을 사용한다.
  - 형식이 올바르지 않으면 에러 메시지를 표시하고 이동하지 않는다.
  - 형식은 올바르지만 `getDemoPlayerByRiotId(trimmedRiotId)`가 `null`이면
    "Mock 데이터에 없는 Riot ID입니다. 데모 계정을 선택하세요." 에러를
    표시하고 이동하지 않는다. **이 분기를 이번 Task에서 변경한다 (아래
    Acceptance criteria 5 참조).**
  - "데모 계정" 섹션에서 `getDemoPlayers()` 결과를 `.demo-grid`/`.demo-card`로
    렌더링하고, 클릭 시 해당 플레이어 프로필로 이동한다.
  - 검색 버튼 문구는 현재 "검색"이다 (→ "전적 검색"으로 변경).
- 현재 데모 플레이어는 1명(`SeoulDuelist#KR1`, `frontend/src/data/mock-data.json`)뿐이며,
  `getDemoPlayers()[0]`과 `getDemoPlayerByRiotId("SeoulDuelist#KR1")`가 이
  플레이어를 반환한다.
- `frontend/src/components/PlayerProfile.tsx`,
  `frontend/src/components/MatchDetailView.tsx`: 각각 `.eyebrow` 문단("Player
  profile" / "Match detail")과 `<h1>`로 시작한다. "Demo Profile"/"Mock Data"
  표시가 없다.
- `/privacy`, `/terms`, `/connect`는 각각 `<main className="placeholder-page">`
  (또는 동등한 래퍼) 안에서 본문을 렌더링한다 (TASK-012/013/015, DONE).

### 참고 문서

- `docs/SPEC.md` 화면 목록(Phase 1-2): "홈 | Riot ID 검색, 데모 계정 선택" —
  이번 Task에서 "데모 계정 선택" UI는 검색 동작 변경(Acceptance criteria 5)으로
  대체되며, 화면 목록 자체의 수정은 이 Task 범위가 아니다(필요 시 후속 Task로
  보고).
- `docs/DECISIONS.md` PENDING-003(스타일링 방식, 대기): 이 Task는 PENDING-003을
  해소하지 않고 기존 plain CSS(`globals.css`) 방식을 계속 사용한다.
- `docs/tasks/TASK-007.md`: 현재 홈 검색 화면과 Riot ID 검증 규칙의 원본.

## Dependencies

- 선행 Task: TASK-007(홈 검색 화면, DONE), TASK-012/013(개인정보처리방침/이용약관,
  DONE), TASK-015(Riot 계정 연결 안내, DONE). 모두 완료 상태이며 이 Task는
  해당 라우트(`/privacy`, `/terms`, `/connect`)가 이미 존재한다는 점만
  사용한다(라우트 자체는 수정하지 않음).
- 후속 Task: 프로필·경기 상세 컴포넌트의 대규모 디자인 변경(범위 미정, 별도
  Task로 작성 예정).

## Allowed changes

```
frontend/src/app/layout.tsx          # 공통 헤더/푸터 적용, metadata.title을 "GameProbe" 계열로 변경
frontend/src/app/globals.css         # 디자인 토큰(CSS 변수), 다크 네이비·차콜 테마,
                                      # 그리드 배경, 헤더/푸터/히어로/검색 패널/분석 카드 스타일,
                                      # 반응형 브레이크포인트
frontend/src/app/page.tsx            # 홈 히어로 문구, 검색 패널 + 분석 예시 카드 섹션 구성
frontend/src/components/HomeSearch.tsx   # 검색 버튼 문구, 검색 동작(고정 데모 프로필 이동),
                                          # 데모 계정 선택 UI 제거/대체
frontend/src/components/PlayerProfile.tsx    # "Demo Profile"/"Mock Data" 배지 추가만
frontend/src/components/MatchDetailView.tsx  # "Mock Data" 배지 추가만
frontend/src/components/**           # 신규 컴포넌트 추가 가능
                                      # (예: 헤더, 푸터/비제휴 안내, 분석 예시 카드 —
                                      #  파일명은 구현자가 정하고 Result에 기록)
docs/tasks/TASK-015UI.md             # 이 문서의 Result 갱신
```

- `frontend/src/types/**`, `frontend/src/data/**`, `frontend/src/lib/**`은
  가져오기(import)만 하고 수정하지 않는다.
- `frontend/src/app/players/[puuid]/page.tsx`,
  `frontend/src/app/matches/[matchId]/page.tsx`는 수정하지 않는다(배지는
  `PlayerProfile.tsx`/`MatchDetailView.tsx` 내부에 추가).

## Forbidden changes

- `frontend/src/types/**`, `frontend/src/data/**`, `frontend/src/lib/**`
- `frontend/package.json`, `frontend/package-lock.json` (새 패키지/의존성 추가
  포함)
- `backend/**`, `docker/**`, `scripts/**`
- `frontend/src/app/privacy/page.tsx`, `frontend/src/app/terms/page.tsx`,
  `frontend/src/app/connect/page.tsx`, `frontend/src/components/RiotConnectNotice.tsx`
  (본문 콘텐츠 변경 금지 — 공통 헤더/푸터를 통한 레이아웃 상속은 허용)
- `frontend/src/app/players/[puuid]/page.tsx`,
  `frontend/src/app/matches/[matchId]/page.tsx`
- `frontend/src/components/MatchScoreboard.tsx`,
  `frontend/src/components/MatchRoundTimeline.tsx`,
  `frontend/src/components/MatchSummaryList.tsx` (구조 변경 금지 — 후속 Task)
- `AGENTS.md`, `CLAUDE.md`, `docs/PLAN.md`, `docs/PROGRESS.md`,
  `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`,
  `docs/tasks/TASK-007.md`, 그 외 `docs/tasks/TASK-0XX.md`
- Riot API 실제 호출, 인증/세션 관련 코드
- 라인업, 커뮤니티, 분석(Phase 5) 실제 데이터/로직 구현 — 분석 예시 카드는
  정적 예시(하드코딩) 콘텐츠로만 구현한다 (아래 Acceptance criteria 4 참조).

## Acceptance criteria

### 1. 공통 헤더

- [x] `frontend/src/app/layout.tsx`를 통해 모든 페이지(`/`, `/players/[puuid]`,
  `/matches/[matchId]`, `/privacy`, `/terms`, `/connect`)에 공통 헤더가
  렌더링된다.
- [x] 헤더 좌측에 "GameProbe" 브랜드 표기가 있다.
- [x] 헤더 우측에 `Privacy`(`/privacy`), `Terms`(`/terms`), `Connect`(`/connect`)
  링크가 있다(`next/link` 사용, 기존 라우트 그대로 사용).
- [x] 헤더는 짙은 네이비·차콜 기반 색상과 청록·민트 포인트 컬러를 사용한다.

### 2. 비제휴 안내 (Footer)

- [x] 모든 페이지에 공통으로 표시되는 영역(푸터 등)에 "GameProbe는 Riot
  Games, Inc.와 제휴 관계가 없는 비공식 서비스이며 VALORANT 공식 서비스가
  아니다"라는 취지의 안내 문구를 포함한다. 정확한 문구는 구현자가 작성하고
  Result에 기록한다(법률 최종 검토 대상이 아닌 일반 비제휴 고지로 작성).

### 3. 홈 히어로 + 검색 패널

- [x] 홈(`/`)의 핵심 문구로 "Riot ID를 검색하고 플레이를 확인하세요"(또는
  의미가 동일한 헤드라인)를 표시한다.
- [x] 검색 폼에 대한 별도 설명 문단(현재 `.hero`의 안내 문단 등)을 추가하지
  않는다. 헤드라인 외 부가 설명 텍스트 없이 검색 패널로 이어진다.
- [x] 검색 입력란의 placeholder는 `SeoulDuelist#KR1`이다.
- [x] 검색 제출 버튼의 문구는 "전적 검색"이다.
- [x] 검색 영역은 모서리가 크게 둥근(rounded) 패널로 표시된다.
- [x] 배경은 짙은 네이비·차콜 기반이며, 아주 옅은(낮은 대비/투명도) 그리드
  패턴을 포함한다.
- [x] 데스크톱 뷰포트(예: 1280×800 이상)에서 검색 패널과 분석 예시 카드
  섹션(아래 4)이 스크롤 없이 또는 최소한의 스크롤로 대부분 보인다.

### 4. 분석 예시 카드 4개

- [x] 홈 화면에 "위치 선정", "팀 교전", "첫 교전", "사이트 방어" 4개의 분석
  예시 카드를 표시한다.
- [x] 각 카드는 각진(모서리 radius 없음 또는 최소) 패널로, 검색 패널의 둥근
  형태와 시각적으로 구분된다.
- [x] 각 카드는 카테고리 이름과 큰 숫자(점수)만 표시한다. 점수 외의 추가
  설명 문구/단위 라벨은 넣지 않는다("점수는 숫자만 크게 표시").
- [x] 카드의 점수는 정적 예시 값(하드코딩)이며, `frontend/src/data/mock-data.json`이나
  `frontend/src/lib/mock-data.ts`를 수정하거나 참조하지 않는다. 컴포넌트
  내부 상수로 정의한다.
- [x] 기존 "데모 계정" 선택 카드 UI(`.demo-grid`/`.demo-card` 및 관련 마크업)는
  제거하거나 분석 예시 카드 섹션으로 대체한다(아래 5번 검색 동작 변경으로
  데모 계정 선택이 더 이상 필요하지 않음).

### 5. 검색 동작: 항상 고정 데모 프로필로 이동

- [x] Riot ID 형식 검증 정규식(`^[^#\s][^#]*#[A-Za-z0-9]{2,5}$`)은 그대로
  유지한다.
- [x] 입력값이 형식에 맞지 않으면 기존과 동일하게 에러 메시지를 표시하고
  이동하지 않는다.
- [x] 입력값이 형식에 맞으면, `frontend/src/lib/mock-data.ts`의 데이터
  로더(`getDemoPlayerByRiotId`, `getDemoPlayers` 등 기존 함수)를 사용해
  **항상 고정 데모 플레이어(`SeoulDuelist#KR1`)의 프로필 라우트
  (`/players/{puuid}`)로 이동한다** — Mock 데이터에 해당 Riot ID가 있는지
  여부와 무관하다. 기존의 "Mock 데이터에 없는 Riot ID입니다" 에러 분기는
  제거한다.
- [x] `frontend/src/lib/mock-data.ts`, `frontend/src/types/**`,
  `frontend/src/data/mock-data.json`은 수정하지 않는다(기존 데이터 흐름
  유지).

### 6. 결과 화면의 Demo Profile / Mock Data 표시

- [x] `frontend/src/components/PlayerProfile.tsx`에 "Demo Profile" 또는
  "Mock Data"임을 나타내는 작은 배지/라벨을 추가한다(예: 기존 `.eyebrow`
  문단 옆 또는 대체).
- [x] `frontend/src/components/MatchDetailView.tsx`에도 동일한 취지의 작은
  배지/라벨을 추가한다.
- [x] 배지 추가 외에 두 컴포넌트의 기존 섹션 구성/정보 표시 구조는 변경하지
  않는다(대규모 디자인 변경은 후속 Task).

### 7. 반응형

- [x] 모바일(예: ~390px), 태블릿(예: ~768px), 데스크톱(예: ~1280px) 너비에서
  헤더, 홈 히어로, 검색 패널, 분석 예시 카드가 가로 스크롤이나 레이아웃
  깨짐 없이 표시된다.
- [x] 분석 예시 카드 4개는 데스크톱에서 한 행 또는 여러 열 그리드로, 좁은
  화면에서는 줄바꿈/세로 배치로 전환된다.

### 8. 빌드 및 정적 검사

- [x] `cd frontend && npx tsc --noEmit` 성공 (타입 에러 없음).
- [x] `cd frontend && npm run lint` 성공 (경고/에러 없음).
- [x] `cd frontend && npm run build` 성공.

### 9. 범위 확인

- [x] `git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib`
  출력이 비어 있다.
- [x] `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`
  출력이 비어 있다.
- [x] `git status --porcelain -- frontend/src/app/privacy frontend/src/app/terms frontend/src/app/connect frontend/src/components/RiotConnectNotice.tsx frontend/src/app/players/[puuid]/page.tsx "frontend/src/app/matches/[matchId]/page.tsx" frontend/src/components/MatchScoreboard.tsx frontend/src/components/MatchRoundTimeline.tsx frontend/src/components/MatchSummaryList.tsx`
  출력이 비어 있다.
- [x] Result에 프로필·경기 상세 대규모 디자인 변경을 시작하지 않았음을
  명시한다.

## Verification commands

```bash
# 1) 타입 검사
cd frontend && npx tsc --noEmit

# 2) Lint
cd frontend && npm run lint

# 3) 빌드
cd frontend && npm run build

# 4) 범위 확인 — TASK-006/Mock 데이터/타입/패키지 미변경 (출력 없어야 함)
cd .. && git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib
git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts

# 5) 범위 확인 — 금지 영역 미변경 (출력 없어야 함)
git status --porcelain -- frontend/src/app/privacy frontend/src/app/terms frontend/src/app/connect \
  frontend/src/components/RiotConnectNotice.tsx \
  "frontend/src/app/players/[puuid]/page.tsx" \
  "frontend/src/app/matches/[matchId]/page.tsx" \
  frontend/src/components/MatchScoreboard.tsx \
  frontend/src/components/MatchRoundTimeline.tsx \
  frontend/src/components/MatchSummaryList.tsx

# 6) 변경된 파일 확인 (Allowed 영역만 존재해야 함)
git status --porcelain -- frontend/src/app frontend/src/components
```

## Stop conditions

다음 상황에서 작업을 중단하고 `BLOCKED`로 보고한다:

1. 디자인 요구사항(예: 분석 예시 카드의 정확한 점수/문구, 비제휴 안내 문구)을
   구현하기 위해 새로운 npm 패키지(아이콘 라이브러리, 차트 라이브러리, 폰트
   패키지 등) 설치가 필요한 경우.
2. "고정 데모 프로필로 이동" 동작을 구현하기 위해
   `frontend/src/lib/mock-data.ts`/`frontend/src/types/**`/Mock JSON 수정이
   불가피한 경우 — 기존 함수로 해결 가능한지 먼저 확인하고, 불가능하면
   임의로 수정하지 말고 BLOCKED로 보고한다.
3. 헤더/푸터를 모든 페이지에 적용하는 과정에서 `/privacy`, `/terms`,
   `/connect`, 프로필, 경기 상세 페이지의 **본문 콘텐츠**(배지 추가 제외)
   변경이 불가피한 경우.
4. 분석 예시 카드 4개의 점수·문구를 정적 예시가 아닌 실제 데이터/로직으로
   구현해야 할 필요가 생기는 경우(이는 후속 Task의 분석 기능 범위다).
5. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

## Result

DONE (2026-06-15)

### Changed files

- `frontend/src/app/layout.tsx`
  - Metadata title을 `GameProbe`로 변경했다.
  - 모든 페이지에 공통 `SiteHeader`와 `SiteFooter`를 적용했다.
- `frontend/src/components/SiteHeader.tsx`
  - 좌측 `GameProbe` 브랜드와 우측 `Privacy`, `Terms`, `Connect` 링크를 추가했다.
- `frontend/src/components/SiteFooter.tsx`
  - 공통 비제휴 안내 문구를 추가했다:
    "GameProbe는 Riot Games, Inc.와 제휴 관계가 없는 비공식 서비스이며 VALORANT 공식 서비스가 아닙니다."
- `frontend/src/app/page.tsx`
  - 홈 히어로 문구를 "Riot ID를 검색하고 플레이를 확인하세요"로 변경했다.
  - 검색 패널 아래에 분석 예시 카드 섹션을 추가했다.
- `frontend/src/components/HomeSearch.tsx`
  - 검색 버튼 문구를 "전적 검색"으로 변경했다.
  - Riot ID 형식 검증 정규식은 유지했다.
  - 형식이 올바른 입력은 Mock 데이터 존재 여부와 무관하게 `getDemoPlayers()`에서
    고정 데모 플레이어(`SeoulDuelist#KR1`)를 찾아 `/players/{puuid}`로 이동하게
    변경했다.
  - 기존 "Mock 데이터에 없는 Riot ID입니다" 분기와 데모 계정 카드 UI를 제거했다.
- `frontend/src/components/AnalysisExampleCards.tsx`
  - 정적 분석 예시 카드 4개를 추가했다: 위치 선정 `87`, 팀 교전 `74`,
    첫 교전 `68`, 사이트 방어 `91`.
  - 점수는 컴포넌트 내부 하드코딩 상수이며 Mock 데이터/로더를 수정하거나
    참조하지 않는다.
- `frontend/src/components/PlayerProfile.tsx`
  - 기존 프로필 섹션에 작은 `Demo Profile` 배지만 추가했다.
- `frontend/src/components/MatchDetailView.tsx`
  - 기존 경기 상세 섹션에 작은 `Mock Data` 배지만 추가했다.
- `frontend/src/app/globals.css`
  - 짙은 네이비·차콜 기반 테마, 청록·민트 포인트 색상, 약한 그리드 배경,
    공통 헤더/푸터, 둥근 검색 패널, 각진 분석 카드, 반응형 브레이크포인트를
    추가했다.
- `docs/tasks/TASK-015UI.md`
  - Status, Acceptance criteria, Result를 실제 결과에 맞게 갱신했다.

### Verification results

- `cd frontend && npx tsc --noEmit` — 성공.
- `cd frontend && npm run lint` — 성공.
- `cd frontend && npm run build` — 성공.
- `git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib`
  — 출력 없음.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`
  — 출력 없음.
- `git status --porcelain -- frontend/src/app/privacy frontend/src/app/terms frontend/src/app/connect frontend/src/components/RiotConnectNotice.tsx "frontend/src/app/players/[puuid]/page.tsx" "frontend/src/app/matches/[matchId]/page.tsx" frontend/src/components/MatchScoreboard.tsx frontend/src/components/MatchRoundTimeline.tsx frontend/src/components/MatchSummaryList.tsx`
  — 출력 없음.
- `git status --porcelain -- frontend/src/app frontend/src/components`
  — 허용된 홈/레이아웃/글로벌 CSS/배지 대상 컴포넌트 및 신규 공통 컴포넌트만 출력됨.

### Notes

- 새 npm 패키지는 설치하지 않았다.
- Backend, package 파일, Mock 데이터, 타입, 로더는 수정하지 않았다.
- `/privacy`, `/terms`, `/connect` 본문은 수정하지 않았고 공통 헤더/푸터만
  `layout.tsx`를 통해 상속된다.
- 프로필·경기 상세 대규모 디자인 변경은 시작하지 않았으며, 배지 추가만 수행했다.
- Riot API 실제 호출, 인증/세션, 라인업, TASK-016 이상 작업은 시작하지 않았다.
