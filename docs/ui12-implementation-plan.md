# UI12 Implementation Plan — 프로필/전적 페이지 전적검색 서비스화 (통합)

> 취합 대상: `ui12-claude-diagnosis.md`(+self-check v2), `ui12-codex-feasibility.md`
> (+self-check), `ui12-cursor-review.md`(+self-check).
> 목표: Riot Production API 신청 전, 프로필/전적 페이지를 **실제 운영 가능한
> VALORANT 전적검색/전적분석 서비스**처럼 보이게 한다. OP.GG/Tracker는 **정보
> 구조 참고만**, 디자인 복제 금지. 차별화는 API 승인 후.
> 이 문서는 계획·설계용이며 **제품 코드 미수정**.

---

## 1. 세 agent 의견의 공통점

세 agent가 **일치**한 진단(= UI12의 합의된 토대):

1. **경기 리스트가 메인 1순위가 아니다.** 헤더 → 필터 → 사이드바 → 요약 3카드
   (Season/RankHistory/Recent20)를 지나야 경기 리스트에 닿는다. → **경기 리스트를
   메인 컬럼 최상단 hero**로 올려야 한다. (Claude §4·§6, Codex §4 제안A, Cursor B1)
2. **같은 데이터가 2~3중 중복.** 시즌 KPI(승률/KD/ACS/HS%)·Career Peak·Previous·
   최근20·Preview Score가 헤더+사이드바+메인에 반복. → **정본 1곳**으로. (Claude
   §1-1, Codex §1.2, Cursor §2.2·M1)
3. **경기 행이 "행"이 아니라 "미니 대시보드".** 8 pill + 태그 + Preview Score +
   팀 아이콘 10개 동시 노출. → 기본은 **승패·맵·요원·KDA·핵심 2~3개**, 나머지
   펼침. (Claude §2·§3, Codex §3, Cursor §2.3·M2)
4. **사이드바 8패널 평면 나열.** → **support rail**로 축소·우선순위·접기. (Claude
   §1-5, Codex §1.5·§3, Cursor M3)
5. **부분 polish로는 부족.** UI11식 컴포넌트별 조정이 아니라 **PlayerProfile 전체
   레이아웃 재구성**이 UI12의 첫 작업. (세 문서 공통, 특히 Codex §최종판단, Cursor H1)
6. **VALORANT 정체성 부족.** 요원·맵·역할군·공수·스파이크가 약하고 범용/LoL식 랭크
   대시보드로 읽힌다. (Claude §2-bis, Cursor §4·§5) — 단 어디까지 신청 전 가능한지는
   §2 충돌 참조.
7. **신규 Mock/자산/타입은 게이트로 분리.** 요원 PNG·라운드 이벤트·역할 아이콘·요원
   집계·갱신 시각·평균 대비 분석은 사람 결정/승인 후. (세 문서 공통)
8. **유지할 것**: `AppVersionBadge`, UI8B 라운드 타임라인(endType chip), 스코어보드
   팀 분리·YOU 강조, 날짜별 경기 그룹, Mock 고지의 **정직성 원칙**(면적만 축소).

---

## 2. 충돌하는 의견

| # | 쟁점 | Claude | Codex | Cursor | 판정/절충 |
|---|------|--------|-------|--------|-----------|
| C1 | 경기 상세 표시 방식 | 인라인 펼침 유지 + 행 압축 | **selected-detail 영역**으로 끌어올림(제안 B 권장 경향) | 스코어보드 우선, 인라인 4탭은 2차 | **절충**: 기본은 인라인 펼침 유지(저위험), selected-detail 전환은 client state 상위 이동·모바일 위치 리스크가 커 **Human Decision**(UI12D)으로 분리 |
| C2 | 공격/수비(side) | self-check v2에서 "기존 `attackers/defenders`로 신청 전 가능"으로 상향 | 라운드 이벤트는 게이트 | side 데이터 없음 → **MAJOR(M6)**, UI9C(Mock) 후 | **데이터 재검증 결과 Cursor 쪽**: `scoreAfterRound.attackers/defenders`는 라운드별 **누적 점수**일 뿐, "viewer 팀이 그 라운드 공/수였나"는 없음. → 신청 전 가능: **누적 스코어 진행 + 전/후반 구간(roundNumber 기반)** 표시. **팀별 공/수 side 라벨 단정은 게이트**(신규 Mock) |
| C3 | RankHistoryChart 비중 | 슬림/보조 | 보조 유지 | LoL식 과잉 → 접힘/축소 | **일치 쪽**: 메인 1순위에서 내리고 rail 또는 접힘. 단 "VAL Tracker도 랭크 추이 사용"이므로 제거가 아니라 **2순위 축소** |
| C4 | 필터(`ProfileFilterBar`) | 리스트 위로 이동 | 유지(Preview 고지 명확) | 비동작 full-width → **BLOCKER(B2)**, 제거/실동작/축소 | **절충**: 리스트 컨텍스트로 이동 + **축소**. 비동작은 명확히 disabled/Preview 표기, 또는 기존 데이터 범위 클라이언트 필터 실동작 검토(신규 데이터 불필요 시) |
| C5 | 요원 placeholder(UI9B) | 자산 게이트 | 자산 게이트 | 신청 스크린샷 목표면 **BLOCKER 후보(B3)** | **Human Decision(H9)**: 신청 전 요원 PNG 확보 vs placeholder 유지+요원 열 visual 최소화 |
| C6 | 분할 단위 | 페이지 골격 재설계 권장 | **컴포넌트별** UI12A~E(리스트분해·KPI통합·sidebar분해·CSS) | IA 중심 | **사용자 지시 우선**: 컴포넌트별 분할은 "부분 polish"라 거부. **읽기 흐름 기준**으로 재정의(§3·§11) |

---

## 3. 최종 채택할 방향

1. **읽기 흐름 중심 IA 재설계**를 UI12의 본질로 삼는다(컴포넌트 polish 아님).
   사용자가 전적을 읽는 순서: **정체성/현재 티어 → 최근 경기 리스트 → 경기 상세
   → 보조 통계 → 마감**.
2. **경기 리스트 = 메인 컬럼 hero.** masthead → control → (main: 경기 리스트) +
   (rail: 보조 통계). Season/Recent20/RankHistory는 rail/하단/접힘으로.
3. **요약 정본화.** 시즌 핵심 KPI는 masthead 한 줄, 상세 분포는 rail 한 곳, 추세는
   RankHistory 한 곳 — 각 1회만.
4. **경기 행 스캔화.** 기본: 승패 + 맵(PNG) + 요원 + K/D/A + (ACS 또는 K/D).
   나머지(ADR·KAST·DDΔ/R·HS%·태그·Preview Score·팀 아이콘) → 펼침/더보기.
5. **경기 상세는 스코어보드 우선**, 라운드(누적 스코어 진행·endType), 분석 탭은
   신청 전 축소. 인라인 펼침 유지(기본), selected-detail은 결정 사항.
6. **사이드바 → support rail**: 역할/맵/무기/정확도(VAL 특화) 우선, 활동/팀원/이전
   시즌은 접힘/하단.
7. **Mock 고지 면적 축소 + 정직성 유지**: 카드별 배지 제거, 전역 고지 1개 유지.
8. **VAL 정체성 강화(데이터 있는 범위)**: 행/스코어보드 요원·맵 식별, 역할 승률,
   정확도(head/body/legs), 라운드 누적 스코어 진행·endType 사유.
9. **게이트 분리**: 신규 Mock/자산/타입은 §7 게이트로, 결정 전 placeholder/빈
   상태로 정직하게.
10. **공식 자산 운영은 `.agent-assets` 기준**: 대량 원본은
    `.agent-assets/riot-public-content-catalog/12.08/`에 보관하고, 제품에는 Task가
    허용한 파일만 선별 복사한다.

---

## 4. 버릴 방향

- **컴포넌트별 부분 polish 분할**(Codex UI12A~E 원안의 "MatchSummaryList 분해 →
  KPI 통합 → sidebar 분해 → CSS" 식). 사용자가 명시 거부. → 읽기 흐름 분할로 대체.
- **CSS primitive 리팩터링을 앞단에 두기**(Codex §5·P3). 회귀 위험 큼 → **마감
  단계(UI12F)** 또는 후순위. self-check도 "안정화 단계로" 동의.
- **데이터 없는 VAL 표현 강행**: 팀별 공/수 side 라벨 단정, 첫 킬/스파이크 타임라인,
  모스트 요원 카드, 무기별 Head/Body/Legs, 평균 대비 분석 — **신청 전 구현 금지**
  (게이트).
- **selected-detail 패턴을 기본값으로 즉시 전환**: 리스크 큼 → 결정 사항으로만.
- **RankHistory/Career Peak를 1순위 IA로 유지**(LoL식). → 2순위로 축소.
- **비동작 필터를 헤더 직후 full-width로 방치**.

---

## 5. API 신청 전 반드시 구현할 범위 (Must · 신규 데이터/자산 불필요)

> 전부 기존 Mock/타입/에셋 + CSS/JSX 재배치로 가능. 가드레일 "데이터 없는 UI 금지"
> 위반 없음.

1. **PlayerProfile 레이아웃 재구성** — 경기 리스트 메인 hero, 요약은 rail/하단.
2. **시즌 KPI·Career Peak·Previous·Recent20·Preview Score 중복 제거** → 정본 1곳.
3. **경기 행 스캔 압축** — 기본 노출 최소화 + 보조 펼침.
4. **리스트 맵 PNG 적용**(`getMapAssetPath`) — 현재 mock의 `ascent`/`haven`/`split`
   PNG는 이미 `frontend/public/assets/maps`에 있으며, UI12B/C Task에서
   `MatchSummaryList`가 `getMapAssetPath`를 사용하도록 연결한다.
5. **사이드바 → support rail 우선순위·접기**.
6. **Mock/Preview 고지 면적 축소(전역 1개)** — 정직성 원칙은 유지.
7. **필터 축소 + 리스트 컨텍스트화**(비동작 명시 또는 기존 데이터 클라이언트 필터).
8. **라운드 누적 스코어 진행 + 전/후반 구간 + endType 사유** 표시(데이터 있는 범위).
9. **경기 상세 스코어보드 우선**·분석 탭 축소.
10. **반응형/접근성/검색 진입 흐름 재점검**(재배치 반영).

---

## 6. API 승인 후로 미룰 범위 (Defer)

- 실 API 연동·RSO·**마지막 갱신 시각/갱신 버튼**(실 fetch 필요) — Phase 4.
- **평균 대비 비교·백분위·통계 기반 분석 코멘트**(수치 비교) — Phase 5 기준 통계.
  (단 "있는 데이터로 강점/약점 읽기"는 신청 전 가능 — §5 아님 수치비교 아님.)
- **GameProbe Preview Score 본격 노출**·차별화 기능 강화 — 승인 후.
- selected-detail 고도화(채택 시에도 모바일 동작 정교화는 후속).

---

## 7. 신규 Mock/자산/타입이 필요한 범위 (Human Decision Gate)

| 게이트 | 필요한 것 | 연결 | 결정 |
|--------|-----------|------|------|
| 요원 이미지 | 누락 요원 PNG·출처/라이선스. 원본은 `.agent-assets/riot-public-content-catalog/12.08/extracted/Characters/`와 `catalog-index.json`에 있음 | UI12B/UI12D / 행·스코어보드 | **H9 결정 반영**: 신청 전 필요한 범위부터 공식 원본 선별 복사 |
| 라운드 이벤트 | 첫 킬/스파이크 plant·defuse 시각/클러치/멀티킬 Mock·schema | UI9C / 라운드 탭 | 사람 승인 |
| 팀별 공/수 side | 라운드별 viewer 팀 공/수 매핑(현재 누적 점수만) | UI9C 인접 | 사람 승인(신규 Mock) |
| 역할군 아이콘 | 역할 아이콘 자산·출처 | UI9D / rail·스코어보드 | 사람 승인 |
| 무기별 적중 분포 | 무기별 Head/Body/Legs 필드 | UI9D / rail | 사람 승인 |
| 요원 집계 카드 | 모스트/탑 요원·요원별 WR/KD 필드 | 신규 Mock or 실 API | 사람 승인 |
| 참가자 랭크/econ | MatchParticipant 신규 필드 | 신규 Mock | 사람 승인 |
| 갱신 시각 | 신뢰 timestamp 출처 | 실 API | 보류(신청 전 미표기 권장) |

> 게이트 미해결 시 최소 표현: 모스트 요원 영역 만들지 않음, 누락 이미지는 기존
> fallback만, 분석은 Preview 지표만, 라운드는 결과/누적 점수까지만, 공/수 side
> 라벨 단정 금지.

---

## 8. UI12A 구현 목표 (통합 설계 Task — 구현 아님)

**UI12A는 코드 구현 Task가 아니라 "통합 설계/IA 골격 확정" Task다.** 산출물은
이 계획을 **단일 합의 골격**으로 확정하고, 읽기 흐름 기준 **UI12B~F 구현 Task의
범위·순서·게이트·정본 위치**를 못 박는 것이다. 제품 코드는 손대지 않는다.

UI12A가 확정해야 할 것:
- 페이지 IA 골격(masthead → control → main 경기 리스트 + rail) 합의.
- "정본 위치" 표(어느 데이터를 어디서 1회 노출).
- 읽기 흐름 기준 UI12B~F 분할과 각 Task의 Allowed/Forbidden·게이트.
- §2 충돌(C1 selected-detail, C2 공/수, C4 필터, C5 요원 PNG)의 결정 사항을
  Human Decision 목록으로 고정.
- `.agent-assets` 운영 원칙과 Riot catalog 로컬 경로를 구현 Task에 연결.

---

## 9. UI12A Allowed / Forbidden

**Allowed (문서만):**
- `docs/tasks/TASK-015UI12A.md`(이 설계 Task), `docs/ui12-implementation-plan.md`.
- (정합성 목적, 사람 승인 시) `docs/PLAN.md`·`docs/PROGRESS.md`·`.agent-reports/CURRENT.md`
  의 UI12 상태 반영 — 단 이번 작성 범위에서는 건드리지 않음.

**Forbidden:**
- 모든 제품 코드(`frontend/**`, `backend/**`, `docker/**`, `scripts/**`,
  `package*.json`).
- 신규 Mock/자산/타입/패키지.
- 기존 UI11 문서(TASK-015UI11*·ui-reference-audit·ui-design-guardrails) 수정.
- 다른 agent의 ui12 문서(codex/cursor) 수정.
- Git add/commit/push.

## 10. UI12A Acceptance Criteria

1. 세 agent 의견의 공통점·충돌·채택·폐기가 한 문서로 정리돼 있다.
2. API 신청 전 Must(§5)와 승인 후 Defer(§6), 게이트(§7)가 명확히 분리된다.
3. UI12B~F가 **읽기 흐름 기준**으로 분할되고(컴포넌트별 아님), 각 Task의 목표·
   Allowed/Forbidden·게이트가 정의된다.
4. §2 충돌(C1·C2·C4·C5)이 Human Decision 목록으로 고정된다.
5. 제품 코드·기존 UI11 문서·다른 agent 문서 변경이 없다.

## 11. Codex 구현 순서 (읽기 흐름 기준 UI12B~F)

> 컴포넌트별이 아니라 **사용자가 전적을 읽는 순서**로 분할. 각 단계는 독립
> 검증·리뷰 가능. 신규 데이터 없는 Safe 범위만, 게이트는 분리.

- **UI12B — 페이지 골격 재배치 (읽기 흐름 ①정체성 + ②리스트 진입)** *[최우선]*
  - `PlayerProfile.tsx` 레이아웃을 masthead → control → main(경기 리스트 hero) +
    rail(보조)로 재구성. Season/Recent20/RankHistory를 rail/하단으로 이동.
    중복 요약 정본화(헤더 한 줄 + rail). 신규 데이터 없음. 공식 Riot catalog
    로컬 캐시에서 필요한 요원/맵 이미지만 선별 복사한다.
  - Allowed: `PlayerProfile.tsx`, `PlayerHeaderCard.tsx`, `ProfileFilterBar.tsx`,
    `MatchSummaryList.tsx`의 자산 연결 범위, 필요 시 wrapper 1~2개,
    `globals.css`(layout grid), `frontend/public/assets/{agents,maps}`,
    `frontend/src/lib/asset-map.ts`, `frontend/public/assets/SOURCES.md`.
  - Forbidden: 데이터/타입, 행 내부 지표 재설계·sidebar 카드 내부 재작성,
    selected-detail 전환, `.agent-assets` 커밋.
- **UI12C — 경기 리스트 스캔성 (읽기 흐름 ②리스트 읽기)**
  - 경기 행 기본 노출 압축(승패·맵·요원·KDA·핵심), 보조 펼침, Preview Score
    행에서 축소. 날짜 그룹 유지.
  - Allowed: `MatchSummaryList.tsx`, 관련 CSS. Forbidden: 신규 필드/이벤트, selected-detail.
- **UI12D — 경기 상세 읽기 (읽기 흐름 ③상세)**
  - 스코어보드 우선 위계, 라운드 누적 스코어 진행·전/후반 구간·endType 사유 표시
    (데이터 범위), 분석 탭 축소. 인라인 펼침 유지(기본).
  - Human Decision: C1 selected-detail 전환 여부, C2 공/수 side 라벨(게이트).
  - Allowed: `MatchDetailPanel`·4탭·CSS. Forbidden: 라운드 이벤트 Mock, side 단정, 분석 수치비교.
- **UI12E — 보조 통계 rail (읽기 흐름 ④보조)**
  - 사이드바를 support rail로 재정의: 역할/맵/무기/정확도 우선, 활동/팀원/이전 시즌
    접힘. 요원 집계·역할 아이콘은 게이트(빈 상태 정직).
  - Allowed: `ProfileSidebar.tsx`·CSS. Forbidden: 요원 집계 카드, 역할 아이콘 자산, 무기별 분포.
- **UI12F — 정합성·반응형·마감·신청 전 점검 (읽기 흐름 전체)**
  - 전역 Mock 고지 단일화, 반응형·접근성(heading/landmark)·검색 진입 흐름, 필터
    정책 확정, CSS 레이어 정리(여기서만), 신청 전 체크리스트 통과.
  - Allowed: 관련 컴포넌트·`globals.css`. Forbidden: 신규 정보 구조/기능 추가.

순서 근거: ②(리스트)가 전적검색의 본체라 골격(B)→리스트(C)를 먼저, 그다음 상세(D)
→보조(E)→마감(F). selected-detail/공수/요원PNG는 D·게이트에서 사람 결정 후.

## 13. Agent Assets 운영 기준

- 공통 정책 문서: `docs/agent-assets.md`.
- Riot catalog 세부 문서: `docs/riot-public-content-catalog.md`.
- 로컬 캐시 루트:
  `.agent-assets/riot-public-content-catalog/12.08/`.
- ZIP:
  `.agent-assets/riot-public-content-catalog/12.08/PublicContentCatalog-release-12.08.zip`.
- 압축 해제본:
  `.agent-assets/riot-public-content-catalog/12.08/extracted`.
- 검색 인덱스:
  `.agent-assets/riot-public-content-catalog/12.08/catalog-index.json`.
- `.agent-assets/`는 git-ignored 원본 창고다. 제품 코드가 직접 참조하지 않고,
  Task에서 허용한 파일만 `frontend/public/assets`로 복사한다.

## 12. Cursor 리뷰 기준

각 UI12 Task(B~F) 공통 리뷰 기준:
1. **읽기 흐름 개선 확인**: 해당 흐름 단계가 실제로 더 빨리/명확히 읽히는가
   (경기 리스트가 메인 hero인가, 행이 스캔되는가 등) — CSS polish 여부가 아니라
   **IA·노출 순서** 기준.
2. **Allowed/Forbidden 준수**: 해당 Task 범위만 변경, 게이트 항목 미착수.
3. **중복 정본화 확인**: 시즌 KPI·Career Peak·Recent20·Preview Score가 정본 1곳.
4. **데이터 정직성**: 신규 Mock/자산/타입 없음, 데이터 없는 표현(공/수 side 단정·
   모스트 요원·평균 대비) 미생성, placeholder/빈 상태 정직.
5. **VAL 정체성**: 요원·맵·역할·라운드(누적 스코어·endType)가 데이터 범위에서
   드러나는가(과장 없이).
6. **보존 확인**: UI8B 라운드 타임라인, 스코어보드 팀 분리·YOU, 날짜 그룹,
   `AppVersionBadge`, 접근성(`aria-selected`/`role=tabpanel`).
7. **검증 통과**: `tsc`/`lint`/`build`/`git diff --check`, 금지 경로 grep.
8. **회귀 점검**: 다른 페이지(home/privacy/terms/connect) 영향(특히 UI12F CSS).
9. **Verdict**: 심사 UX 목표(전적검색 서비스 인상) 기준 `COMMIT_READY` /
   `CHANGES_REQUIRED` + 필요한 `HUMAN_DECISION_REQUIRED`.
