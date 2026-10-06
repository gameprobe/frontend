# UI12 Cursor Review — 프로필/전적 페이지 서비스 완성도·UX 비판 평가

> **역할**: Independent Reviewer (제품 코드 미변경)  
> **기준일**: 2026-06-23 (자가검증 `ui12-cursor-self-check.md` 반영 보완)  
> **범위**: `/players/[puuid]` 프로필·전적 검색 페이지 (UI11B~G 반영 후, HEAD `127ed49` 기준)  
> **참고**: `ui-design-guardrails.md`, `ui-reference-audit.md`  
> **주의**: OP.GG / Tracker.gg는 **정보 구조 참고**일 뿐, 디자인 복제 대상이 아님.  
> UI11 구현 결과를 옹호하지 않고, **Riot Production API 신청용 “운영 중인 VALORANT 전적·분석 서비스” 인상** 관점에서 평가한다.  
> **한계**: viewport 스크린샷·실측 없이 코드·문서 기반 판단. above-the-fold는 **레이아웃 순서·스크롤 비용** 기준.

---

## 1. Review Verdict

**`CHANGES_REQUIRED`** (서비스 완성도·UX 관점)  
**`HUMAN_DECISION_REQUIRED`** (UI12 방향·정보 아키텍처·API 신청 기준선)

UI11B~G는 **기존 Mock 데이터 범위 안에서** 카드 문법·반응형·게이트 준수를 개선했다.  
그러나 **페이지 전체 읽기 흐름·VALORANT 도메인 정체성·스캔 밀도**는 여전히 전적검색 서비스 수준이 아니다.

- 구현 품질(가드레일·Forbidden 준수)과 **제품 완성도(심사자·사용자 체감)** 는 별개다.
- **CSS polish·pill 분리만으로는** “OP.GG/Tracker처럼 빠르게 읽힌다”는 목표에 도달하지 못했다.
- Mock 데이터상 **ACS·ADR·KAST·HS%·DDΔ/R 등 VAL 표준 지표는 이미 갖춰져 있다**. 문제는 **지표 부족**이 아니라 **우선순위·중복·한 행 과노출**이다.
- API 신청 전 단계라도, 심사자는 **“실제로 쓰는 VALORANT 전적 사이트”** 를 기대한다. 현재 화면은 **LoL식 랭크 대시보드 + 내부 Mock 분석 프로토타입** 에 가깝다.

---

## 2. 현재 페이지가 보기 불편한 이유

### 2.1 1차 시선·스크롤 비용 — 경기 리스트가 늦게 온다

현재 `PlayerProfile` 흐름:

1. `PlayerHeaderCard` (정체성 + KPI + 티어 + 최근 폼 + Preview Score)
2. `ProfileFilterBar` (동작하지 않는 Preview 필터)
3. **2열 그리드**
   - **좌측 `ProfileSidebar`**: disclaimer + Career Peak + 이전 시즌 + 정확도 + 역할 + 무기 + 맵 + 활동 + 팀원 (패널 8~9개)
   - **우측 메인**: `SeasonSummaryCard` → `RankHistoryChart` → `RecentTwentySummaryCard` → **그 다음에** 최근 경기

전적검색 서비스의 1차 목적은 **“이 사람 최근에 어떻게 했는가”** 이다.  
지금은 헤더·필터·사이드바·시즌·랭크 차트·최근20 카드를 **모두 지나야** 경기 리스트에 닿는다.  
일부 viewport에서는 경기 **일부**가 보일 수 있으나, **1차 시선·스크롤 비용** 관점에서 전적검색 UX와 반대다.

### 2.2 같은 정보가 여러 번 반복된다

| 정보 | 노출 위치 (중복) |
|------|------------------|
| 시즌 승률·K/D·ACS·HS% | `PlayerHeaderCard` KPI + `SeasonSummaryCard` |
| Career Peak / Previous | `PlayerHeaderCard` + `ProfileSidebar` |
| 최근 20 WR·KAST | `PlayerHeaderCard` form + `RecentTwentySummaryCard` |
| GameProbe Preview Score | 헤더 + 시즌 카드 + 최근20 카드 + **경기 행마다** |

사용자는 **어디를 봐야 “공식 요약”인지** 혼란스럽고, 스크롤만 길어진다.

### 2.3 경기 행 하나가 “행”이 아니라 “미니 대시보드”다

`MatchSummaryList` 한 행(`match-card`)은 데스크톱에서 **7열 grid** (strip · outcome · identity · stats 2열 · tags · score badge · arrow)이다.

- primary/secondary로 **나눴을 뿐**, secondary 5 pill + 티어 + 태그 + Preview Score + 팀 요원 썸네일이 **여전히 한 화면에 동시 노출**된다.
- secondary pill에는 **ADR·KAST·DDΔ/R·HS%** 등 VAL 표준 지표가 **전부** 들어 있다 — 데이터는 충분하나 **스캔 행으로 읽히지 않는다**.
- 레퍼런스의 “KDA + 핵심 2~3개” 스캔 행과 비교하면 **정보 면적·시선 이동**이 과하다.

### 2.4 Mock/Preview 고지가 “운영 서비스” 인상을 깎는다

가드레일상 정직한 표기는 맞지만, 화면 곳곳의 `Mock / Preview`, `Preview filter`, `GameProbe Preview Score`, disclaimer 문단은 **심사자에게 “아직 프로덕트가 아니다”** 를 반복 강조한다.  
UI11은 이를 줄이지 못했고, 일부 영역(필터·분석·pending)은 **의도적으로 미완** 을 드러낸다.

### 2.5 에이전트 슈터 정체성이 약하다

- 헤더는 Riot ID·티어·KPI 중심이며 **대표 요원·최근 요원 아트/아이콘이 없다**.
- VALORANT 전적 사이트는 **요원·맵·경기**가 정체성 축인데, 현재는 **범용 KPI 카드**가 앞선다.
- 모스트 요원 집계는 sidebar disclaimer로 **없음**을 고지 — 정직하나 **프로필 핵심 요약 빈틈**.

### 2.6 시각적 위계가 평평하다

- 카드·패널·pill·badge가 **같은 border/background 문법** (`side-panel`, `season-summary-card`, `match-stat-pill` 등).
- **승패·KDA·부가 지표** 간 강약이 약하다. (Arial·eyebrow 혼재는 부차적 — **스캔 실패**가 본질.)

### 2.7 반응형은 “깨짐 방지” 수준이지 “읽기 최적화”가 아니다

UI11G는 overflow-wrap·mobile stack으로 **레이아웃 붕괴**를 막았다.  
모바일에서도 경기 행은 **여러 줄로 쪼개진 동일 정보**를 순차 스크롤해야 하며, **한 눈에 승패·맵·KDA** 가 들어오는 단일 시선 흐름은 아니다.

---

## 3. 정보 우선순위가 잘못된 부분

| 기대 우선순위 (VALORANT 전적검색) | 현재 GameProbe |
|----------------------------------|----------------|
| 1. 플레이어 정체성 + **요원·맵 맥락** + 현재 티어 | ⚠️ 티어·KPI만, **요원 정체성 약함** |
| 2. **최근 경기 목록 (승패·맵·요원·KDA)** | ❌ 4~5개 요약 블록 **아래** |
| 3. 시즌/최근 N판 핵심 KPI **한 번** | ⚠️ 헤더 + 카드 2~3곳 중복 |
| 4. 보조 통계 (역할·맵·무기) | ⚠️ 좌측 사이드바 **전면** (너무 이르고 김) |
| 5. 경기 상세 (스코어보드·라운드·공/수) | ⚠️ 인라인 4탭, **side 라벨 없음** |
| 6. 분석/차별화 | ⚠️ Mock Preview가 눈에 띄는 탭으로 존재 |

**필터**(`ProfileFilterBar`): 헤더 직후 full-width이나 **Competitive/Unrated·큐/시즌** 등 VAL 맥락 없이 “Preview filter”만 있고 **재계산도 없다** → 전적 사이트 필터 기대와 충돌.

**GameProbe Preview Score**: Riot/VALORANT 표준 지표가 아닌데 헤더·카드·경기 행에 반복 → **ACS/KDA/승률보다 먼저 읽히는 경우**가 많다.

---

## 4. VALORANT 도메인 gap

> 가드레일(데이터 없는 UI 금지)과 **별개로**, “VALORANT 전적·분석 서비스”로 **읽히는지**를 본다.

| 도메인 | 현재 상태 | gap | API 신청 UX 영향 |
|--------|-----------|-----|------------------|
| **요원** | 리스트·스코어보드 PNG **3/10**, 7명 placeholder | 모스트 요원 없음, 헤더 요원 정체성 없음 | **스크린샷·1인칭 전적 인상** 크게 저하 |
| **역할군** | `ProfileSidebar` `roleWinRates` **텍스트만** | **역할군 아이콘 없음** (audit) | VAL 프로필 대비 **에이전트 슈터 맥락 약함** |
| **맵** | sidebar `getMapAssetPath` / 리스트 `MapIcon` **2글자** | 리스트 맵 스캔성 저하 | 중 — 자산 있으나 **미적용** |
| **라운드** | UI8B `ROUND_PHASES`, chip에 제압/폭발/해제 | **첫 킬·경제·구간 이벤트** 없음 | 분석 깊이 부족 (게이트 UI9C) |
| **공격/수비** | `MatchRoundsTab` disclaimer: **side 데이터 없어 미표시** | VAL 라운드 읽기 **필수 축** 부재 | **MAJOR** — “VAL 라운드 UI”로 안 읽힘 |
| **스파이크** | `endType` → 폭발/해제 **결과 라벨**만 | plant/defuse **이벤트·타임라인** 없음 | 결과 사유 vs **스파이크 플레이** 구분 불가 |
| **스코어보드** | 팀 분리·YOU·ACS 등 (UI11D) | 요원 placeholder, econ 등 **없는 컬럼은 미추가**(올바름) | 구조는 양호, **에셋**이 완성도 지배 |
| **지표** | ACS·ADR·KAST·HS%·DDΔ/R **데이터 존재** | **한 행·여러 카드에 전부 노출** | “부족”이 아니라 **스캔 순서·접기 실패** |
| **무기/교전** | sidebar `topWeapons`, head/body/legs accuracy Mock | 패널이 sidebar **깊숙이** 묻힘 | VAL 특화(Head/Body/Legs) **강점을 못 살림** |
| **큐/모드** | Preview filter (비동작) | Competitive/Unrated 등 **없음** | VAL 전적 사이트 **기본 UX** 미충족 |

---

## 5. LoL식 프로필 오해 위험

GameProbe 프로필은 **VALORANT 전적검색**이 아니라 **LoL 랭크 대시보드**로 오해될 요소가 많다.

| LoL식·범용 랭크 대시보드 패턴 | GameProbe 해당 | VALORANT 전적검색 기대 | 판정 |
|------------------------------|----------------|------------------------|------|
| Career Peak + Previous Season 강조 | 헤더 + sidebar **중복** | 시즌·최근 경기 중심 | ⚠️ 비중 과다 |
| RankHistoryChart 상단 노출 | 시즌 카드 **위** 배치 | Tracker도 랭크 추이는 쓰나 **경기보다 2순위** | ⚠️ **1순위 IA**로는 과함 |
| 좌측 긴 stat sidebar | 8+ 패널 고정 | **경기·요원·맵**이 메인 | ❌ 정체성 불일치 |
| KPI 카드 스택 | 헤더 + Season + Recent20 | **한 줄 요약 + 경기** | ❌ |
| 챔피언(요원) 대형 아트 헤더 | 없음 | 요원·맵 **시각 식별** | ❌ |
| CS/gold/라인 등 LoL 지표 | 없음 (올바름) | — | ✅ |

**결론**: VAL 서비스로 보이려면 **경기 리스트·요원·맵·라운드(공/수)** 가 앞서야 한다.  
현재는 **시즌 랭크·커리어·장문 sidebar** 가 앞서 **LoL OP.GG 프로필**에 가깝게 읽힌다.

---

## 6. OP.GG / Tracker 대비 gap (audit 요약)

`ui-reference-audit.md` 7영역을 **정보 구조만** 재요약 (디자인 복제 아님):

| 영역 | 레퍼런스 패턴 | GameProbe gap (한 줄) |
|------|---------------|------------------------|
| 프로필 상단 | KPI 한 줄 + **큐/시즌 필터** + 갱신 | KPI **중복**, Preview filter **비동작**, 갱신 시각 없음, **요원 정체성 없음** |
| 좌측/보조 | 모스트 요원·맵 (게임수·WR·KD) | 패널 **과다·중복**, 모스트 요원 **없음**, 역할 **아이콘 없음** |
| 최근 경기 | 승패 바 + 맵/요원 + KDA + **2~3 지표** | 지표 **8 pill 동시**, Preview Score·팀 아이콘 과다 |
| 스코어보드 | 팀 분리·YOU·정렬 | **구조 OK**, 요원 placeholder **70%** |
| 라운드 | 승패·**공/수**·이긴 방식·첫 킬·스파이크 | 전반/후반만, **side 없음**, endType만, **이벤트 없음** |
| 성과/분석 | 평균 대비 (Phase 5) | Mock Preview **탭 동급** 노출 |
| 버전 표시 | (부분) | `AppVersionBadge` **있음** ✅ |

---

## 7. 카드/탭/지표가 과한 부분

### 프로필 상단·메인

- `PlayerHeaderCard`: KPI 4 + rank panel 3블록 + Preview Score (**요원 없음**)
- `SeasonSummaryCard`: 티어 + metric 7 + Preview Score
- `RecentTwentySummaryCard`: metric 5 + Preview Score (KAST·DDΔ/R 포함)
- `RankHistoryChart`: 별도 카드 — VAL에서도 쓰이나 **경기 1순위 IA** 대비 **2순위·접힘**이어야 함

### 사이드바

- 패널 8개 이상 + disclaimer (Career peak / 이전 시즌 **삼중**)
- 역할·무기·맵·정확도(Head/Body/Legs) — **VAL 특화 데이터**이나 sidebar **최하단**에 묻힘

### 경기 행

- 지표 pill 8개 (primary 3 + secondary 5: **ADR·KAST·DDΔ/R·HS%** 등)
- highlight tags, Match Preview Score, TeamAgentSummary (10 아이콘)
- 펼침 시 **4탭 전체** 경기 상세

### 경기 상세 4탭

- **스코어보드**: 구조 양호, placeholder 비율 문제
- **라운드**: UI8B 타임라인 + **“공/수 side 미표시”** disclaimer + 이벤트 미연동
- **성과**: MVP + pending 블록
- **분석**: 예시 점수 4개 — API 신청 전 **노출 면적 과다**

---

## 8. 전적검색 사이트처럼 빠르게 읽히지 않는 이유

1. **F-pattern / Z-pattern 스캔 경로 부재**: 레퍼런스는 승패 → 맵/요원 → KDA **한 줄**; GameProbe는 grid 셀마다 시선 점프.
2. **VAL 표준 지표는 있는데 한 행에 몰림**: ACS·ADR·KAST·DDΔ/R·HS% **전부** secondary pill — **접기·우선순위** 없이 동시 노출.
3. **행 높이·열 수**: 데스크톱 `minmax(410px, 1.8fr)` stats 영역 등 **한 행이 넓고 높다**.
4. **맵·요원 식별 약함**: 리스트 `MapIcon` 2글자, 요원 placeholder — **에이전트 슈터 스캔** 실패.
5. **경기 상세 진입 비용**: 인라인 4탭 전체 로드.
6. **중복 요약** — 정본 KPI 위치 불명.
7. **공/수·스파이크 타임라인 없음** — 라운드 탭을 열어도 VAL 분석 **읽기 흐름**이 끊김.

---

## 9. API 심사자가 봤을 때 약해 보이는 부분

| 약점 | 심사자가 받을 인상 |
|------|-------------------|
| Mock/Preview·disclaimer 다수 | “데모/Mockup 단계” |
| Preview filter (큐/시즌 아님, 비동작) | “기능 반만·VAL 맥락 없음” |
| 요원 placeholder 7/10 | “VAL 전적 UI 미완” |
| **공격/수비 side 없음** | “라운드 이해 부족 — LoL식 점수판?” |
| 스파이크 plant/defuse 타임라인 없음 | “스파이크 게임 분석 역량 부족” |
| 역할군 아이콘·모스트 요원 없음 | “에이전트 슈터 프로필 아님” |
| 분석 탭 예시 점수 | “가짜 분석” (정직하나 약점) |
| Preview Score 강조 | 비표준 noise |
| 갱신 시각 없음 | “운영 서비스” 신뢰 낮음 |

**긍정**: 팀 분리 스코어보드, YOU, UI8B 라운드 chip·endType, 날짜별 경기 그룹, Mock 고지 정직함, AppVersionBadge.

---

## 10. API 신청 전 Must / 승인 후 Defer

> **개발 게이트**(UI9B/C/D)와 **심사 UX 목표**는 다를 수 있다. H9·H12에서 Must/Defer 최종 확정.

| API 신청 **전** Must (권장) | **승인 후** Defer (Phase·게이트) |
|----------------------------|----------------------------------|
| 경기 리스트 **메인 1순위** IA | GameProbe Preview Score **본격** 노출 (Phase 5) |
| KPI **중복 제거**·정본 1곳 | Phase 5 **기준 통계·평균 대비** 분석 |
| 경기 행 **스캔 압축** (K/D/A + 2~3 지표, 나머지 접기) | 라운드 **이벤트 Mock** (UI9C) — side·첫 킬·plant |
| Preview filter **제거/축소/실동작** | 실 API **갱신·RSO** (Phase 4) |
| Mock/Preview **노출 면적 축소** | 무기 Head/Body/Legs **필드 확장** (UI9D) |
| 리스트 **맵 PNG** (`getMapAssetPath`) | 분석 탭 **실데이터** 전환 |
| 분석 탭 **접기/축소** (신청용) | |
| **요원 PNG 7종** (UI9B) — 신청 스크린샷 목표면 **Must 후보** (→ H9) | placeholder 유지 시 **요원 열 visual 최소화** |

**즉시 가능·게이트 불필요**: 맵 PNG 리스트 적용, IA 재배치, pill 접기, 필ter 정책, KPI merge.  
**사람 결정 필요**: UI9B 신청 전 Must vs Defer, Mock timestamp, 완성 기준선(H12).

---

## 11. 유지해도 되는 부분

- **가드레일 4장**: placeholder 정직 표기 ( **노출 면적·위치**는 재설계).
- **UI8B 라운드 타임라인** — endType(제압/폭발/해제) chip, `ROUND_PHASES` (이벤트·side는 UI9C 후).
- **스코어보드 팀 분리·viewer 강조·기존 컬럼** — econ 등 **없는 필드 추가 금지** 유지.
- **날짜별 경기 그룹**, **AppVersionBadge**, **UI11 게이트 분리**.
- **인라인 경기 펼침** — Mock 검증용 ( **기본 UX로는** 스코어보드 우선·2차 탭 권장).

---

## 12. 과감히 재배치해야 하는 부분

### 12.1 페이지 IA (UI12 핵심)

```
[헤더: ID + 티어 + (요원) + 시즌 KPI 한 줄]
[최근 경기 리스트]                    ← 메인 최상단
[시즌/최근20 — 1블록 또는 탭]
[보조: 역할·맵·무기 — 접힘/탭]
[랭크 히스토리 — 기본 collapsed]
```

- 좌측 고정 sidebar **300px + 8패널** → 메인 폭·경기 우선과 불일치.
- Career Peak / Previous / RankHistory — **LoL식 비중** 줄이고 **경기·요원·맵** 앞으로.

### 12.2 경기 행

- 기본: 승패 + **맵 PNG** + **요원** + K/D/A + (K/D 또는 ACS).
- ADR·KAST·DDΔ/R·HS%·tags·Preview Score·team icons → **펼침/더보기**.

### 12.3 경기 상세

- **스코어보드 우선**; 라운드/성과 2차; 분석 API 전 **축소**.
- 라운드: side·스파이크 이벤트는 **UI9C Mock 후** — 그 전까지 disclaimer **면적 최소화**.

### 12.4 필터

- Competitive/Unrated 등 **VAL 큐** 또는 **제거**. Preview-only full-width **비권장**.

### 12.5 Preview Score

- 리스트 행 **제거**; 프로필 1곳 또는 API 후 Phase 5.

### 12.6 에셋

- 맵 PNG: **즉시** (게이트 불필요).
- 요원: UI9B 또는 **visual 최소화** (H9).

---

## 13. BLOCKER / MAJOR / MINOR

> **심사자 관점**(API 신청 UX)과 **개발 게이트**(가드레일 준수)를 구분한다.

### BLOCKER

- **B1 — 1차 시선·스크롤 비용: 경기 리스트가 요약·sidebar·차트 아래**  
  - `PlayerProfile.tsx` 레이아웃 순서  
  - VAL 전적검색 **1순위 목표**와 정면 충돌  
  - UI12 **IA 재배치** 필요

- **B2 — 동작하지 않는 Preview filter가 헤더 직후 full-width**  
  - `ProfileFilterBar.tsx` — VAL 큐/시즌도 아님  
  - **기능 허위·맥락 부재**

- **B3 — 요원 placeholder ~70% (스코어보드·리스트)**  
  - UI9B 게이트는 **개발 제약**으로 이해 가능  
  - **Riot API 신청용 스크린샷·VAL 전적 UX** 목표라면 **BLOCKER**  
  - H9: 신청 전 PNG 확보 vs UI 최소화

### MAJOR

- **M1 — KPI 삼중·사중 중복** (헤더 + Season + Recent20 + sidebar peak)
- **M2 — 경기 행 8 pill + tags + Preview Score + agents 동시 노출**
- **M3 — sidebar 8+ 패널·좌측 고정** — 보조가 primary 잠식
- **M4 — 분석 탭 Mock Preview 탭 동급 노출**
- **M5 — GameProbe Preview Score 반복**
- **M6 — 공격/수비(side) 라벨 부재** (`MatchRoundsTab` disclaimer) — VAL 라운드 **정체성** gap
- **M7 — 역할군 아이콘 없음** — 텍스트 role win rate만
- **M8 — LoL식 rank dashboard IA** — Career/Previous/RankHistory가 경기·요원보다 앞섬

### MINOR

- **m1 — MapIcon 텍스트**, 리스트 `getMapAssetPath` 미사용 (자산 있음)
- **m2 — 영/한 eyebrow 혼재**
- **m3 — UI11G viewport 스크린샷 QA 없음**
- **m4 — completion-plan 체크리스트 미체크**
- **m5 — sidebar 무기·Head/Body/Legs accuracy** — VAL 특화이나 **위치·위계** 문제 (데이터 자체는 minor)

---

## 14. 다음 구현 전 사람 판단 필요 항목

| # | 결정 | 선택지 | 비고 |
|---|------|--------|------|
| H1 | **UI12 목표** | (A) IA 전면 재배치 (권장) / (B) CSS polish만 | (B)는 UI11과 동일 한계 |
| H2 | **프로필 요약 중복** | 헤더만 / 시즌 카드만 / 통합 1카드 | KPI 정본 1곳 |
| H3 | **사이드bar** | 제거·탭·접힘 / 좌측 유지 | **경기·요원·맵** 메인 |
| H4 | **필터** | 제거 / VAL 큐 disabled / Mock 재계산 | Preview-only **비권장** |
| H5 | **경기 행 기본 노출** | K/D/A+ACS / +맵·요원 / secondary 숨김 | §10 Must |
| H6 | **Preview Score** | 1곳 / 제거 / API 후 | 신청용 축소 |
| H7 | **분석 탭** | API 전 숨김·축소 / 유지 | §10 Must |
| H8 | **경기 상세 UX** | 4탭 / 스코어보드 우선 | |
| H9 | **UI9B 요원 PNG** | **신청 전 Must(B3)** / placeholder + UI 최소화 | **BLOCKER 연동** |
| H10 | **맵 PNG 리스트** | 적용 (권장) | 게이트 불필요 |
| H11 | **갱신 시각** | 미표기 / Mock timestamp | audit PENDING |
| H12 | **API 신청 완성 기준선** | §10 Must/Defer 확정 | placeholder·Mock 허용 범위 |
| H13 | **LoL식 IA 수용 한계** | RankHistory·Career **접힘/축소** vs 유지 | §5 |
| H14 | **공/수·스파이크** | UI9C 전 disclaimer만 / 신청 전 Mock 승인 | M6 |

---

## 부록 — 근거 컴포넌트·구조

| 파일 | UX·VAL 관련 사실 |
|------|------------------|
| `PlayerProfile.tsx` | overview → matches **순서** |
| `PlayerHeaderCard.tsx` | KPI + rank + form + Preview; **요원 없음** |
| `SeasonSummaryCard.tsx` | 7 metrics + Preview (중복) |
| `RecentTwentySummaryCard.tsx` | KAST·DDΔ/R + Preview |
| `ProfileSidebar.tsx` | 8+ panels; role **텍스트**; topWeapons·accuracy |
| `ProfileFilterBar.tsx` | Preview only, no recalculation |
| `MatchSummaryList.tsx` | 7-col, 8 pills (ADR/KAST/DDΔ/R/HS%), inline 4-tab |
| `MatchRoundsTab.tsx` | **side 미표시** disclaimer; endType chip |
| `MatchScoreboardTab.tsx` | 팀 분리; placeholder 7/10 |
| `MatchAnalysisTab.tsx` | Mock Preview 예시 |
| `globals.css` | `.match-card` 7-column grid |

---

## Cursor Reviewer 메모

- **구현 리뷰(UI11 AC)** 가 아니라 **VALORANT 전적·분석 서비스 완성도** 리뷰.
- UI11B~G: Task·가드레일 **준수** ≠ **심사 통과 UX**.
- 자가검증(`ui12-cursor-self-check.md`) 반영: VAL 도메인·LoL 오해·API Must/Defer·심각도(B3·M6~M8) 보강.
- UI12 = **polish가 아닌 IA·VAL 정체성·노출량·접기**.

**최종 Verdict**: `CHANGES_REQUIRED` + `HUMAN_DECISION_REQUIRED`
