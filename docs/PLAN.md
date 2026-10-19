# PLAN.md - 개발 계획

## 현재 실행 기준 (2026-10-19)

- [TASK-FE-062](tasks/TASK-FE-062.md): 라인업 site 제거·위치/에임 이미지 등록 및 공개 표시·스모크 공격/수비 연결 IMPLEMENTED. `codex/lineup-images-smoke-side`에서 검증 완료, 사용자 검토 대기.
- 작업 시작 시 frontend dev와 main 파일 트리는 같았다. main은 변경하지 않는다. 사용자 승인으로 작업 브랜치를 커밋·푸시하고 dev 대상 PR을 제출한다. 병합은 사용자가 수행하며 main·운영 배포는 변경하지 않는다.
- 일반 라인업 공개 조회도 실제 API 연결 완료. 이후 운영 적용은 해당 이미지/진영 API의 백엔드 배포 및 동료의 frontend main 반영 순서 확인이 필요하다.
- 아래 기록은 이전 시점의 계획이며 현재 결과와 검증은 TASK-FE-062를 따른다.


## 현재 실행 기준 (2026-10-14)

- TASK-FE-055: 조직 frontend의 dev에 최신 Vite 프론트 이관. 현재 실행·검증 안내는 [README](../README.md)와 [Task](tasks/TASK-FE-055.md)를 따른다.
- [TASK-FE-059](tasks/TASK-FE-059.md): 라인업·스모크 영상 상세 페이지(Figma 222:6350). 출발지·영상을 누르면 상세로 이동. 브랜치 `feat/guide-video-page`에 사용자 승인으로 커밋(미푸시). 영상 썸네일은 후속.
- 아래 Next.js·모노레포 계획은 과거 기록이다. 이번 작업은 main 병합·운영 배포·deploy 저장소 변경을 포함하지 않는다.


## 현재 추가 기능
- Insights 예시 분석 리포트 및 영문 신청 목표 추가. 로컬 검증 완료, 미커밋/미배포. [Task](tasks/TASK-FE-035.md). 실제 모델 학습은 별도 작업.

## 현재 신청 준비 상태 (2026-09-29)

- TASK-FE-034: main `8970129` 정책 보완 공개 배포 및 도메인 검증 완료. Riot 신청은 미제출.
- 운영자/문의처/지역과 문의 해결 후30일 이내 수동 영구삭제 방침 확인 완료.
- 로그인한 대화 내 Vercel에서 Hobby, Analytics 비활성, Drains 미등록, Speed Insights 수집 없음, 실제 접속 로그 확인.
- 최신 한영 개인정보 보완본은 공개·검증 완료. 국외 이전 세부사항·법적 요건 최종 판단은 남아 초안 유지.
- [신청 자료 묶음](riot-submission/README.md), [운영 사실](riot-submission/POLICY-OPERATIONS.md).
- 아래 과거 PLAN 상태는 당시 기록이며 최근 결과는 TASK-FE-034를 따른다.

## 개요

이 문서는 VALORANT 플레이어 성장 플랫폼의 개발 계획을 Phase별로 정리한다.

## 저장소 구성 업데이트 (2026-10-04)

- 라인업 저장은 MongoDB 하나로 통일한다. 현재 범위·진행 상태·검증 결과는
  [TASK-BE-002](tasks/TASK-BE-002.md)과 [백엔드 계획](backend/PLAN.md)을 따른다.
- 아래 초기 Phase의 DB 구성·완료 표시는 당시 작업 기록이며 현재 실행 안내가 아니다.
  현재 Docker 백엔드/Atlas 연결 구성은 [MongoDB 실행 안내](backend/MONGODB.md)를 따른다.

## 현재 작업 관리 (2026-09-16 기록)

> **현재 구현 기준선**: 원격 main `19a2415`를 `f4e90d1`에서 통합했으며,
> `b6d1d3b`에서 TASK-FE-001 실행 조건을 재검토했다. 프론트 전용 Docker 개발
> 환경은 `codex/frontend-docker-dev`에서 구현·검증을 완료했다.

- 저장소는 프론트·백엔드가 함께 사용하는 모노레포를 유지한다.
- 앞으로의 Task 번호는 `TASK-FE-*`(프론트), `TASK-BE-*`(백엔드),
  `TASK-INFRA-*`(두 영역이 함께 사용하는 환경/배포)로 구분한다. 각 영역은
  독립적으로 번호를 부여하며, 기존 `TASK-001`~`TASK-015UI11G` 등의 번호와
  파일 경로는 유지한다.
- Task 문서는 기존 `docs/tasks/TASK-*.md` 위치를 유지한다. 영역별 계획에는
  해당 영역의 작업만 나열하고, 구현·검증 결과의 근거는 각 Task 문서에 기록한다.
- [프론트 작업 목록](frontend/PLAN.md): 현재 후보는
  [TASK-FE-001: 프론트 Docker 개발 환경 구성](tasks/TASK-FE-001.md)
  (`IMPLEMENTED`, 프론트 Docker 구현·검증 완료·사람 검토 대기).
- [백엔드 작업 목록](backend/PLAN.md): 현재 할당된 구현 Task 없음. 이번 프론트
  작업에는 백엔드 API, 인증, DB 변경을 포함하지 않는다.
- 프론트 통합 브랜치는 `codex/frontend-rework`다. 각 Task는 통합 브랜치에서
  분기하고, 검증·사람 검토 후 통합한다. 개편 전체는 검토 후 `main`에 병합한다.
  커밋·푸시·병합은 별도 사용자 지시 없이 수행하지 않는다.
- **이전 계획과 실제 코드의 차이**: 아래 2026-06-23 계획의 UI11B `READY`,
  UI11C~G `PLANNED` 표시는 당시 기록이다. 현재 기준 커밋 `127ed49`에는
  UI11B~G의 기존 데이터 기반 화면 정리가 반영되어 있다. 이를 미착수 작업으로
  다시 시작하지 않는다. 상세 근거와 남은 범위는 프론트 작업 목록을 따른다.

## 이전 상태 기록 (2026-06-23)

- **현재 Phase**: Phase 1(Mock 프로토타입) 완료 → Phase 3(라인업 및 디자인 시스템 리팩토링) 진행 중
- **현재 목표(마일스톤)**: **Riot Production API 신청용 전적 서비스 완성 및 디자인 시스템 안정화**.
- **현재 Task**: TASK-FE-026_SMOKE_PAGE(Smoke 전용 맵·공수·컨트롤러 연막 가이드) 구현 완료. 다음은 전적 화면 신청용 상태 정리와 라인업 부가 기능 검토다.
  사람 전용 Task는 HUMAN-* 상태 유지. TASK-015UI(홈 화면 및 공통 레이아웃
  디자인, GameProbe 브랜드), TASK-015UI2(플레이어 프로필·최근 경기 카드
  정보 강화), TASK-015UI3(요원/맵/무기 이미지를 공식 Public Content
  Catalog 자산으로 교체)는 DONE(2026-06-15). 그 후속으로 신규 작성된
  TASK-015UI4(최근 경기 카드 인라인 펼침 + 4탭 상세 패널)는 DONE
  (2026-06-15). 그 후속 TASK-015UI5(프로필 페이지 전적 서비스형 재구성 +
  GameProbe Score 도입)는 DONE(2026-06-16)이다. 그 후속 TASK-015UI6
  (프로필 데스크톱 레이아웃 폭·2열 비율 수정 + 사이드바 Mock 데이터
  채우기)는 DONE(2026-06-16)이다. 그 후속 TASK-015UI7(프로필 페이지 최종
  시안 재구성)은 범위가 커서 구현 전 TASK-015UI7A(상단 구조: 헤더 카드·
  필터·사이드바·시즌 성적·티어 그래프·최근 20판)와 TASK-015UI7B(날짜별
  최근 전적·경기 행 재설계·KAST/DDΔ/R·하이라이트 태그·인라인 상세 연결)로
  분리됐다(TASK-015UI7은 SPLIT). TASK-015UI7A는 DONE(2026-06-16)이고,
  TASK-015UI7B는 DONE(2026-06-16)이다. 그 후속으로 Riot Production API 신청
  전 프로필 화면의 시각적·사용성 완성도를 높이기 위한 TASK-015UI8 계열을
  분할 계획했다(2026-06-17): TASK-015UI8A(경기 상세 4탭 사용성·표시 정리,
  신규 자산·Mock 없이)는 Cursor 리뷰 통과 후 commit·push되어 DONE(2026-06-22,
  HEAD `8c48f3f`)이다. 라운드 탭이 여전히 표 느낌이라 후속으로 UI8 분할안을
  재조정했다(2026-06-22): TASK-015UI8B를 **라운드 상세 타임라인 재설계**로
  새로 정의했고 DONE(2026-06-22, HEAD `eb108a1`). UI8A·UI8B 완료 후에도 화면이
  전적 사이트(OP.GG/Tracker.gg) 정보 구조와 다르다는 피드백을 받아, 화면을
  조금씩 고치는 대신 **전체 정보 구조를 OP.GG/Tracker.gg식으로 재정렬**하는
  TASK-015UI9 계열로 재분할했다(2026-06-22). 이에 따라 미착수였던 UI8C/UI8D/
  UI8E는 **SUPERSEDED**(UI9 계열로 대체): UI9A(정보 구조·레이아웃 골격 재정렬,
  디자인 구조만·자산/Mock 없음, READY), UI9B(스코어보드 10요원 데이터/이미지
  완성), UI9C(라운드 상세 이벤트 데이터 확장·타임라인 고도화), UI9D(사이드바
  역할군·무기·맵 시각화), UI9E(데스크톱 폭·헤더·그래프·최근 경기 위계 보정+
  반응형). 디자인 구조(UI9A·UI9E)와 데이터/에셋 확장(UI9B·UI9C·UI9D)을 분리했고,
  UI9A는 Codex 구현·검증과 Cursor 리뷰(COMMIT_READY, BLOCKER/MAJOR 없음)를
  통과해 commit되어 DONE(2026-06-22, HEAD `aecdb7e`)이다. UI9A까지의 방향이
  전적 사이트식 정보 구조에 맞는지 확신하기 어려워, **UI9B/UI9C/UI9D를 바로
  착수하지 않고** Tracker.gg / OP.GG와의 차이를 먼저 감사하고 작업 순서를
  재정렬하는 단계로 전환했다(2026-06-23). 이를 위해 `docs/ui-reference-audit.md`
  (영역별 비교표)와 `docs/ui-design-guardrails.md`(가져올 것/가져오지 않을 것/
  표절 방지/데이터 없는 UI 금지/자산·Mock Stop)를 작성하고, 배포 버전 표시 +
  레퍼런스 기준 문서 고정을 범위로 하는 **TASK-015UI10A**를 신설했다.
  UI10A는 레퍼런스 감사·가드레일 문서 보강, 프로필 화면 우하단 UI Build 배지
  추가, 검증 통과 후 commit·**push 완료**되어 DONE(2026-06-23, HEAD `520f8fa`)
  이다. 배지는 기존 `frontend/package.json` version만 사용하며 신규 자산/Mock/
  타입/패키지를 추가하지 않았다.
  UI10A 완료 후, Riot Production API 신청 전 프로필/경기 상세 페이지를 **실제
  운영 가능한 전적 분석 서비스처럼 보이게 완성**하기 위한 **UI11 마스터 플랜**
  단계로 전환했다(2026-06-23). 그 단일 기준 문서가 **TASK-015UI11A**(READY)이며,
  UI11 작업을 UI11A(마스터 플랜)·UI11B(프로필 상단/요약)·UI11C(최근 경기
  리스트)·UI11D(스코어보드)·UI11E(라운드/성과/분석)·UI11F(사이드바 요원/무기/
  맵/역할군)·UI11G(반응형/마감/신청 전 점검)로 분할했다. 신청 전에는 기존 데이터/
  에셋으로 가능한 완성도부터 높이고, 자산/Mock이 필요한 부분은 사람 결정 게이트로
  둔다. 차별화 기능 강화는 API 승인 후(Phase 4 실 API / Phase 5 분석)로 분리한다.
  UI9B/UI9C/UI9D는 "직접 착수" 대상이 아니라 **UI11 마스터 플랜 안에서 재분류된
  후보**다: 각각 UI11D(요원 자산)·UI11E(라운드 이벤트 Mock)·UI11F(역할 아이콘/
  무기 분포)의 자산·Mock 결정 입력으로 흡수된다(PENDING-DECISION). UI9E는
  UI11G/UI11B로 흡수. TASK-015UI11A 마스터 플랜은 Cursor COMMIT_READY 후
  commit·push되어 DONE(2026-06-23)이다. 그 첫 구현 Task로 **TASK-015UI11B(프로필
  상단/요약 영역 정리, READY)**를 작성했다 — 기존 Mock 데이터(`SeasonSummary`·
  `RecentTwentySummary`·`CareerPeakRank`)만으로 상단 KPI 요약·티어·최근 폼 위계를
  정돈하고, 신규 자산/Mock/타입 없이 UI Build 배지를 유지한다. 다음 단계는 Cursor가
  UI11B를 리뷰하고, 승인 시 Codex가 구현하는 것이다(UI11C 이후는 미착수).
- **UI12 진행**: UI11A~G 후, 세 agent UI12 진단을 취합해 UI12 통합 설계(UI12A)와
  읽기 흐름 기준 분할(B~F)을 확정했다. UI12B(페이지 골격 재배치 + 요원/맵 자산
  온보딩)와 긴급 패치 UI12B_PATCH는 구현 및 검증 완료 후 커밋되어 DONE(2026-06-24)이다.
  그 후속으로 경기 행 높이를 다이어트하고 스캔성을 확보하는 TASK-015UI12C도 구현 및 검증 완료 후 커밋되어 DONE(2026-06-24)이다.
  경기 상세 탭 정리 및 스코어보드 우선화를 위한 TASK-015UI12D가 구현 및 검증 완료 후 커밋되어 DONE(2026-06-24)이다. 후속으로 사이드바 보조 통계 rail 정리 및 카드 축소를 위한 TASK-015UI12E가 구현 및 검증 완료 후 DONE(2026-06-24)이다. 후속으로 전체 반응형 마감 및 전역 Mock 고지 단일화를 위한 TASK-015UI12F가 구현 및 검증 완료 후 커밋(HEAD `7a3e727`)되어 DONE(2026-06-24)이다. UI12F 커밋 후 브라우저 검증에서 5대 결함/요구사항(1440px 경기 목록 stretch 붕괴 BLOCKER, 홈 검색 UX, 잔여 Mock 고지 정리, 중첩 `<main>` 시맨틱, Git 커밋 버전 동적 표시)이 식별되어 긴급 패치 TASK-015UI12F_PATCH를 신설했고, 구현·검증·리뷰(COMMIT_READY) 완료 후 커밋되어 DONE(2026-06-24, HEAD `2d8d65c`)이다. 그 후속으로 OP.GG·Tracker.gg 대비 경기 상세 4탭의 전술 정보 깊이 격차를 해소하기 위한 UX 감사(`ux_evaluation_report.md`, 사람 승인)를 거쳐 **경기 상세 4탭 고밀도 재설계 마스터 플랜 TASK-015UI12G**를 신설했다(2026-06-24). 사람 결정으로 **신규 Mock 데이터+신규 타입 전체 승인**(FK/FD/MK·듀얼 매트릭스·무기 분포·2D 좌표·경제) 및 **탭별 4분할**(G-A 스코어보드·G-B 라운드·G-C 성과·G-D 분석)을 확정했다. 단 신규 텔레메트리는 모두 Mock/Preview로 정직 고지하며, 외부 실 자산 신규 취득은 별도 게이트로 분리한다. G-A(스코어보드 FK/FD/MK·K/D Ratio·MVP·YOU 강조)는 구현·검증·Cursor 리뷰(COMMIT_READY) 후 커밋되어 DONE(2026-06-24, HEAD `d47a818`)이다. 후속 G-B(라운드 1-24 수평 스트립 + 킬 로그·CSS 그리드 2D 좌표 플로터)도 구현·검증·Cursor 리뷰(COMMIT_READY) 후 커밋되어 DONE(2026-06-24, HEAD `8e576bf`)이다. 후속 G-C(성과 탭 듀얼 H2H 매트릭스 + 무기 분포)도 구현·검증·Cursor 리뷰(COMMIT_READY) 후 커밋되어 DONE(2026-06-24, HEAD `1e50c62`)이다. Phase G 마지막 G-D(분석 탭 팀 전투/피해 델타 막대 + 경제 그래프)도 구현·검증·Cursor 리뷰(COMMIT_READY) 후 커밋되어 DONE(2026-06-25, HEAD `ed86869`)이며, 이로써 **경기 상세 4탭 고밀도 재설계(TASK-015UI12G 마스터 및 G-A~G-D) 전체가 완료**되었다. 그 후속으로 사용자 명시 지시에 따라 **Phase 3 라인업(Lineups) 기능의 데이터 모델 + 검색 화면을 야간 통합 구현하는 TASK-016_OVERNIGHT**를 READY로 신설했다(2026-06-25). 이는 기존 Phase 3의 TASK-016(라인업 데이터 모델)과 TASK-017(라인업 검색)의 1차 범위를 하나의 야간 통합 Task로 묶은 것이다.
- **마지막 업데이트**: 2026-09-22

> **정합성 주의**: TASK-007~010은 각 Task 문서(`docs/tasks/TASK-007~010.md`)의
> Status가 DONE이고 실제 산출물(`frontend/src/app/players/[puuid]`,
> `frontend/src/app/matches/[matchId]`, 관련 컴포넌트)이 존재해 아래 Phase 1
> 표에 DONE으로 반영했다. 단, `docs/PROGRESS.md`에는 TASK-007~010의 개별 완료
> 로그가 아직 backfill되지 않았다(현재 PROGRESS 최신 항목은 TASK-006). 별도
> 정합성 작업으로 PROGRESS 로그 보강이 필요하다.

---

## 기존 Phase 로드맵

아래 Phase별 표는 기존 계획과 의존 관계를 보존한 기록이다. 상태가 실제 코드와
다른 항목은 위 현재 작업 목록 및 해당 Task의 구현 결과를 우선 확인한다.
이번 작업 분리는 기존 제품 목표나 Phase 순서를 일괄 재설계하지 않는다.

## Phase 0: 프로젝트 실행 환경 구성

**목표**: 개발 환경을 구성하고 기본 프로젝트 구조를 설정한다.

| Task | 설명 | 선행 Task | 상태 |
|------|------|-----------|------|
| TASK-001 | 프로젝트 초기 실행 환경 구성 | - | DONE (2026-06-12) |
| TASK-002 | Frontend 초기화 (Next.js) — TASK-001에서 함께 수행 | TASK-001 | DONE (TASK-001에 통합) |
| TASK-003 | Backend 초기화 (Spring Boot) — TASK-001에서 함께 수행 | TASK-001 | DONE (TASK-001에 통합) |
| TASK-004 | 당시 DB 개발 환경 구성 (Docker) — TASK-001에서 함께 수행 | TASK-001 | DONE (TASK-001에 통합) |
| [TASK-005A](tasks/TASK-005A.md) | Frontend 의존성 및 lockfile 정합성 복구 | TASK-001 | DONE (2026-06-12) |
| TASK-005 | 공통 검증 명령 구성 | TASK-002, TASK-003, TASK-005A | DONE (2026-06-13) |

**완료 기준**:
- `npm run dev`로 Frontend 실행 가능
- `./gradlew bootRun`으로 Backend 실행 가능
- 당시 DB Docker 컨테이너 실행 가능 (현재 구성은 TASK-BE-001 참조)
- 공통 린트, 테스트 명령 동작

TASK-002~004는 별도 작업이 아니라 TASK-001 결과로 충족됐다. 검증 근거는 `docs/tasks/TASK-001.md`와 `docs/PROGRESS.md`의 2026-06-12 항목 참조.

TASK-005A에서 Node.js 22.20.0 / npm 10.9.3 기준을 고정하고 `frontend/package-lock.json`
정합성을 복구했다. TASK-005는 공통 검증 스크립트 추가와 전체 검증 통과로 완료됐다.
상세는 `docs/tasks/TASK-005.md`, `docs/tasks/TASK-005A.md`, `docs/PROGRESS.md`의
2026-06-12 및 2026-06-13 항목 참조.

---

## Phase 1: Mock JSON 기반 전적 검색 프로토타입

**목표**: Mock JSON 파일로 전적 검색 흐름을 구현한다. 분석 피드백은 제외한다.

**데이터 소스**: 모든 플레이어/경기 데이터는 정적 JSON 파일에서 로드한다. 실제 Riot API 호출 없음.

| Task | 설명 | 선행 Task | 상태 |
|------|------|-----------|------|
| [TASK-006](tasks/TASK-006.md) | Mock JSON 데이터 모델 정의 | TASK-005 | DONE (2026-06-13) |
| [TASK-007](tasks/TASK-007.md) | 홈 검색 화면 | TASK-006 | DONE (2026-06-13) |
| [TASK-008](tasks/TASK-008.md) | 데모 플레이어 프로필 | TASK-006, TASK-007 | DONE (2026-06-13) |
| [TASK-009](tasks/TASK-009.md) | 최근 경기 목록 | TASK-008 | DONE (2026-06-13) |
| [TASK-010](tasks/TASK-010.md) | 경기 상세 | TASK-009 | DONE (2026-06-13) |

**완료 기준**:
- Riot ID 검색 또는 데모 계정 선택 가능
- 플레이어 프로필 페이지 렌더링
- 최근 경기 목록 표시
- 경기 상세 페이지 렌더링 (스코어보드, 타임라인)

**제외 항목**:
- 분석 피드백 (Phase 5로 이동)
- 라인업 추천 연결

---

## Phase 2: Riot Production API 신청 준비

**목표**: 배포 가능한 사이트를 완성하고 Riot API 신청을 준비한다. 이 Phase의
UI 트랙(TASK-015UI* 계열, 특히 UI11 마스터 플랜)의 목표는 **Riot API 신청용
전적 서비스 완성** — Riot 심사자가 "실제 전적/분석 플랫폼으로 운영될 준비가
되어 있다"고 납득할 페이지 완성도다. 차별화 기능 강화는 API 승인 후(Phase 4/5)로
분리한다.

Phase 2는 **자동 구현 Task(Codex 수행)**와 **사람 전용 Task(로그인·도메인·
비밀정보·법률 승인·신청 제출·운영 배포 승인)**로 구분한다. 사람 전용 Task는
`D`(결정) / `H`(사람 수행) 접미사로 표기한다.

| Task | 설명 | 유형 | 선행 Task | 상태 |
|------|------|------|-----------|------|
| [TASK-011D](tasks/TASK-011D.md) | 배포 플랫폼·DB 호스팅 결정 (PENDING-006/007) | 사람-결정 | TASK-010 | DONE (2026-06-13) |
| [TASK-011](tasks/TASK-011.md) | 배포 환경 구성 (설정·CI·문서) | 자동 | TASK-010, TASK-011D | READY |
| [TASK-012](tasks/TASK-012.md) | 개인정보처리방침 페이지 (초안) | 자동 | TASK-010 | DONE (2026-06-13) |
| [TASK-013](tasks/TASK-013.md) | 이용약관 페이지 (초안) | 자동 | TASK-010 | DONE (2026-06-13) |
| [TASK-013H](tasks/TASK-013H.md) | 개인정보처리방침·이용약관 법률 검토·최종 승인 | 사람 | TASK-012, TASK-013 | HUMAN-REQUIRED |
| [TASK-014](tasks/TASK-014.md) | API Adapter 인터페이스 설계 (Backend) | 자동 | TASK-010 | DONE (2026-06-13) |
| [TASK-015](tasks/TASK-015.md) | Riot 계정 연결 예정 흐름 (UI) | 자동 | TASK-010, TASK-014 | DONE (2026-06-13) |
| [TASK-015UI](tasks/TASK-015UI.md) | 홈 화면 및 공통 레이아웃 디자인 (GameProbe 브랜드) | 자동 | TASK-007, TASK-012, TASK-013, TASK-015 | DONE (2026-06-15) |
| [TASK-015UI2](tasks/TASK-015UI2.md) | 플레이어 프로필·최근 경기 카드 정보 강화 | 자동 | TASK-015UI | DONE (2026-06-15) |
| [TASK-015UI3](tasks/TASK-015UI3.md) | 요원/맵/무기 이미지를 공식 Public Content Catalog 자산으로 교체 | 자동 | TASK-015UI2 | DONE (2026-06-15) |
| [TASK-015UI4](tasks/TASK-015UI4.md) | 최근 경기 카드 인라인 펼침 + 4탭 상세 패널 (스코어보드/라운드/성과/분석) | 자동 | TASK-015UI3 | DONE (2026-06-15) |
| [TASK-015UI5](tasks/TASK-015UI5.md) | 프로필 페이지 전적 서비스형 재구성 + GameProbe Score 도입 | 자동 | TASK-015UI4 | DONE (2026-06-16) |
| [TASK-015UI6](tasks/TASK-015UI6.md) | 프로필 데스크톱 레이아웃 폭·2열 비율 수정 + 사이드바 Mock 데이터 채우기 | 자동 | TASK-015UI5 | DONE (2026-06-16) |
| [TASK-015UI7](tasks/TASK-015UI7.md) | 프로필 페이지 최종 시안 재구성 (UI7A+UI7B로 분리) | 자동 | TASK-015UI6 | SPLIT (2026-06-16) |
| [TASK-015UI7A](tasks/TASK-015UI7A.md) | 프로필 상단 구조 재구성 (헤더 카드·필터·사이드바·시즌 성적·티어 그래프·최근 20판) | 자동 | TASK-015UI6 | DONE (2026-06-16) |
| [TASK-015UI7B](tasks/TASK-015UI7B.md) | 날짜별 최근 전적·경기 행 재설계·KAST/DDΔ/R·하이라이트 태그·인라인 상세 연결 | 자동 | TASK-015UI7A | DONE (2026-06-16) |
| [TASK-015UI8A](tasks/TASK-015UI8A.md) | 경기 상세 4탭 사용성·표시 정리 (탭 활성/접근성·라운드 압축·성과 통합·분석 명칭, 신규 자산·Mock 없이) | 자동 | TASK-015UI7B | DONE (2026-06-22) |
| [TASK-015UI8B](tasks/TASK-015UI8B.md) | 라운드 상세 타임라인 재설계 (라운드 탭: 결과 칩 스트립·구간 요약·압축 로그·선택 상세, 신규 자산·Mock 없이) | 자동 | TASK-015UI8A | DONE (2026-06-22) |
| TASK-015UI8C | 스코어보드 10요원 요원 이미지 확장 | 자동 | TASK-015UI8A | SUPERSEDED → UI9B (2026-06-22) |
| TASK-015UI8D | 사이드바 역할군 아이콘·무기 적중 분포 | 자동 | TASK-015UI8A | SUPERSEDED → UI9D (2026-06-22) |
| TASK-015UI8E | 전체 데스크톱 레이아웃·시각 위계 보정 | 자동 | TASK-015UI8A | SUPERSEDED → UI9A/UI9E (2026-06-22) |
| [TASK-015UI9A](tasks/TASK-015UI9A.md) | 프로필·경기 상세 정보 구조/레이아웃 골격 재정렬 (OP.GG/Tracker식 정보 구조, 디자인 구조만·신규 자산/Mock 없음) | 자동 | TASK-015UI8B | DONE (2026-06-22) |
| [TASK-015UI10A](tasks/TASK-015UI10A.md) | 배포 버전 표시 + 레퍼런스 비교 감사·가드레일 문서 고정 (UI 방향 검증) | 자동 | TASK-015UI9A | DONE (2026-06-23, HEAD `520f8fa`, push 완료) |
| [TASK-015UI11A](tasks/TASK-015UI11A.md) | Riot API 신청용 UI 완성 마스터 플랜 (UI11 전체 정렬·신청 전/후 분리) | 계획 | TASK-015UI10A | DONE (2026-06-23, commit·push 완료) |
| [TASK-015UI11B](tasks/TASK-015UI11B.md) | 프로필 상단/요약 영역 정리 (헤더 KPI 요약·티어·최근 폼, 기존 데이터만) | 자동 | TASK-015UI11A | READY (다음 구현 후보) |
| TASK-015UI11C | 최근 경기 리스트 정리 (승패 강조·지표 압축·스캔성, 기존 데이터) | 자동 | TASK-015UI11A | PLANNED |
| TASK-015UI11D | 경기 상세 스코어보드 정리 (팀 구분·자기 행 하이라이트·컬럼 정렬) | 자동 | TASK-015UI11A | PLANNED (요원 placeholder 제거는 UI9B 자산 결정 게이트) |
| TASK-015UI11E | 라운드 상세·성과·분석 정리 (UI8B 타임라인 유지·성과 비교 맥락) | 자동 | TASK-015UI11A | PLANNED (라운드 이벤트는 UI9C Mock 결정 게이트) |
| TASK-015UI11F | 사이드바 요원/무기/맵/역할군 정리 (모스트 카드 정보 구성) | 자동 | TASK-015UI11A | PLANNED (역할 아이콘·무기 분포는 UI9B/UI9D 자산·Mock 결정 게이트) |
| TASK-015UI11G | 전체 반응형·마감·신청 전 점검 (일관성·빈 상태·접근성·배지 최종 점검) | 자동 | TASK-015UI11A | PLANNED |
| [TASK-015UI12A](tasks/TASK-015UI12A.md) | UI12 통합 설계 / IA 골격 확정 (읽기 흐름 기준 분할, 구현 아님) | 계획 | TASK-015UI11G | DONE (2026-06-24) |
| [TASK-015UI12B](tasks/TASK-015UI12B.md) | 페이지 골격 재배치 + 요원/맵 자산 온보딩 (읽기 흐름 ①정체성+②리스트 진입) | 자동 | TASK-015UI12A | DONE (2026-06-24) |
| [TASK-015UI12B_PATCH](tasks/TASK-015UI12B_PATCH.md) | 긴급 패치: 모바일(390px) 마스트헤드 겹침 + Peak/Previous 텍스트 띄어쓰기 (PlayerHeaderCard·globals.css 한정) | 자동 | TASK-015UI12B | DONE (2026-06-24) |
| [TASK-015UI12C](tasks/TASK-015UI12C.md) | 경기 리스트 스캔성 정리 (읽기 흐름 ②리스트 읽기 - 경기 행 다이어트) | 자동 | TASK-015UI12B_PATCH | DONE (2026-06-24) |
| [TASK-015UI12D](tasks/TASK-015UI12D.md) | 경기 상세 탭 정리 및 스코어보드 우선화 (읽기 흐름 ③상세) | 자동 | TASK-015UI12C | DONE (2026-06-24) |
| [TASK-015UI12E](tasks/TASK-015UI12E.md) | 사이드바 보조 통계 rail 정리 및 카드 축소 (읽기 흐름 ④보조) | 자동 | TASK-015UI12D | DONE (2026-06-24) |
| [TASK-015UI12F](tasks/TASK-015UI12F.md) | 전체 반응형 마감 및 전역 Mock 고지 단일화 (읽기 흐름 전체) | 자동 | TASK-015UI12E | DONE (2026-06-24, HEAD `7a3e727`) |
| [TASK-015UI12F_PATCH](tasks/TASK-015UI12F_PATCH.md) | 긴급 패치: 1440px 경기 목록 stretch 붕괴(BLOCKER)·홈 검색 무조건 데모 진입·잔여 Mock 고지 정리·중첩 `<main>` 수정·Git 커밋 버전 동적 표시(next.config.js·AppVersionBadge) | 자동 | TASK-015UI12F | DONE (2026-06-24, HEAD `2d8d65c`) |
| [TASK-015UI12G](tasks/TASK-015UI12G.md) | 경기 상세 4탭 고밀도 재설계 마스터 플랜 (탭별 G-A~G-D 분할, 신규 Mock+타입 전체 승인) | 계획 | TASK-015UI12F_PATCH | DONE (2026-06-25, G-A~G-D 전체 커밋 완료) |
| [TASK-015UI12G-A](tasks/TASK-015UI12G-A.md) | 스코어보드 고밀도화: FK/FD/MK·K/D Ratio·MVP 마커·YOU 네온 강조 | 자동 | TASK-015UI12G | DONE (2026-06-24, HEAD `d47a818`) |
| [TASK-015UI12G-B](tasks/TASK-015UI12G-B.md) | 라운드 1-24 수평 스트립 + 킬 로그·2D 좌표 플로터 | 자동 | TASK-015UI12G-A | DONE (2026-06-24, HEAD `8e576bf`) |
| [TASK-015UI12G-C](tasks/TASK-015UI12G-C.md) | 성과 탭 재설계: 듀얼 H2H 매트릭스 + 무기 분포 위젯 | 자동 | TASK-015UI12G-B | DONE (2026-06-24, HEAD `1e50c62`) |
| [TASK-015UI12G-D](tasks/TASK-015UI12G-D.md) | 분석 탭 재설계: 팀 전투/피해 델타 막대 + 경제(Bank/Loadout) 그래프 | 자동 | TASK-015UI12G-C | DONE (2026-06-25, HEAD `ed86869`) |
| TASK-015UI9B | (재분류) 스코어보드 10요원 자산 → UI11D/UI11F 자산 결정 입력 | 자동 | TASK-015UI11A | PENDING-DECISION → UI11 흡수 |
| TASK-015UI9C | (재분류) 라운드 이벤트 Mock → UI11E Mock 결정 입력 | 자동 | TASK-015UI11A | PENDING-DECISION → UI11 흡수 |
| TASK-015UI9D | (재분류) 역할 아이콘·무기 분포 → UI11F 자산·Mock 결정 입력 | 자동 | TASK-015UI11A | PENDING-DECISION → UI11 흡수 |
| TASK-015UI9E | (재분류) 데스크톱 폭·위계·반응형 → UI11B/UI11G 흡수 | 자동 | TASK-015UI11A | PLANNED → UI11 흡수 |
| [TASK-011H](tasks/TASK-011H.md) | 운영 배포 실행 및 승인 | 사람 | TASK-011, TASK-012, TASK-013, TASK-013H | HUMAN-REQUIRED |
| [TASK-015H](tasks/TASK-015H.md) | Riot Developer Portal 신청 제출 | 사람 | TASK-011H, TASK-013H, TASK-015 | HUMAN-REQUIRED |

**실행 순서 (의존성 기준)**:

1. **완료 (자동)**: TASK-012 · TASK-013 · TASK-014 · TASK-015.
2. **완료 (사람 결정)**: TASK-011D — Vercel(Frontend) + Railway(Backend
   API·당시 DB) 확정 (2026-06-13). TASK-011을 언블록했다.
3. TASK-011 — TASK-011D 확정 기준으로 자동 구현 (READY).
4. TASK-013H — TASK-012/013 초안 완료 후 사람 검토·승인.
5. TASK-011H — TASK-011 설정 + 법률 문서 승인 후 사람 배포.
6. TASK-015H — 배포 URL + 승인된 법률 문서 확보 후 사람 신청 제출.

**유형 요약**:
- **자동 수행 가능(Codex)**: TASK-011, TASK-012, TASK-013, TASK-014, TASK-015,
  TASK-015UI, TASK-015UI2, TASK-015UI3, TASK-015UI4, TASK-015UI5,
  TASK-015UI6, TASK-015UI7A, TASK-015UI7B. (TASK-015UI7은 UI7A+UI7B로
  분리되어 SPLIT.)
- **사람 확인/수행 필요**: TASK-013H(법률 최종 승인), TASK-011H(외부
  로그인·도메인/DNS·비밀정보·운영 배포 승인), TASK-015H(Riot Developer
  Portal 신청 제출).
- **사람 결정 완료**: TASK-011D(배포 플랫폼·DB 호스팅, 2026-06-13 확정 —
  Vercel + Railway).

**완료 기준**:
- 사이트 배포 완료 (TASK-011 + TASK-011H)
- 개인정보처리방침, 이용약관 페이지 존재 (TASK-012/013 + TASK-013H 승인)
- Mock/실제 API 전환 가능한 Adapter 구조 (TASK-014)
- RSO 연결 예정 UI (실제 동작 없음) (TASK-015)
- Riot Production API 신청 제출 (TASK-015H)

---

## Phase 3: 라인업 기능

**목표**: API 승인 대기 중 맵·요원별 라인업 기능을 구현한다.

| Task | 설명 | 선행 Task | 상태 |
|------|------|-----------|------|
| [TASK-016_OVERNIGHT](tasks/TASK-016_OVERNIGHT.md) | 라인업 데이터 모델(`Lineup` 타입·Mock) + 검색 화면(`/lineups` 맵/요원/스킬 필터·카드) 야간 통합 구현 | 자동 | TASK-015UI12G | DONE (2026-06-25) |
| [TASK-017_DESIGN_SYSTEM](tasks/TASK-017_DESIGN_SYSTEM.md) | 디자인 시스템 토큰 수립 및 CSS 치환 (PR-1) | 자동 | TASK-016_OVERNIGHT | READY |
| TASK-016 | 라인업 데이터 모델 | TASK-011 | ABSORBED → TASK-016_OVERNIGHT |
| TASK-017 | 라인업 검색 (맵/요원/스킬 필터) | TASK-016 | ABSORBED → TASK-016_OVERNIGHT |
| [TASK-018_LINEUP_BACKEND](tasks/TASK-018_LINEUP_BACKEND.md) | 라인업 DB 모델 및 사용자/관리자 API | TASK-016_OVERNIGHT | DONE |
| [TASK-019_LINEUP_DETAIL](tasks/TASK-019_LINEUP_DETAIL.md) | 사용자용 라인업 상세 및 YouTube 패널 | TASK-018_LINEUP_BACKEND | DONE |
| [TASK-020_LINEUP_EDITOR](tasks/TASK-020_LINEUP_EDITOR.md) | 관리자 라인업 등록 및 아이콘 편집기 | TASK-018_LINEUP_BACKEND | DONE |
| [TASK-021_ADMIN_ACCESS](tasks/TASK-021_ADMIN_ACCESS.md) | 라인업 검수·공개 상태 및 관리자 권한 연동 | TASK-020 | DONE |
| [TASK-022_ADMIN_REVIEW](tasks/TASK-022_ADMIN_REVIEW.md) | 관리자 라인업 목록·검수·공개 상태 | TASK-021_ADMIN_ACCESS | DONE |
| [TASK-023_ADMIN_EDIT](tasks/TASK-023_ADMIN_EDIT.md) | 기존 라인업 관리자 수정 | TASK-022_ADMIN_REVIEW | DONE |
| [TASK-024_PUBLIC_LINEUP_API](tasks/TASK-024_PUBLIC_LINEUP_API.md) | 사용자 라인업 목록 API 연결 | TASK-023_ADMIN_EDIT | DONE |
| TASK-025 | 즐겨찾기 | TASK-019_LINEUP_DETAIL | TODO |
| TASK-026 | 패치 검증 상태 | TASK-019_LINEUP_DETAIL | TODO |
| TASK-027 | 댓글과 작동 여부 신고 | TASK-019_LINEUP_DETAIL | TODO |
| [TASK-FE-026_SMOKE_PAGE](tasks/TASK-FE-026_SMOKE_PAGE.md) | Smoke 전용 맵·공수·컨트롤러 연막 가이드 | TASK-024_PUBLIC_LINEUP_API | DONE (2026-09-22) |

**완료 기준**:
- 맵/요원/스킬 필터로 라인업 검색 가능
- 라인업 상세 페이지 렌더링
- 관리자가 라인업 등록 가능
- 사용자가 즐겨찾기 추가/제거 가능
- 패치 버전별 검증 상태 표시
- 댓글과 작동 여부 신고 기능

---

## Phase 4: Riot Production API와 RSO 연동

**목표**: 실제 Riot API를 연동하고 RSO 인증을 구현한다.

| Task | 설명 | 선행 Task | 상태 |
|------|------|-----------|------|
| TASK-023 | Riot API Adapter 구현 | TASK-014 | TODO |
| TASK-024 | RSO 인증 | TASK-023 | TODO |
| TASK-025 | 호출 제한과 캐시 | TASK-023 | TODO |
| TASK-026 | 사용자 동의와 데이터 삭제 | TASK-024 | TODO |

**완료 기준**:
- 환경 변수로 Mock/실제 API 전환 가능
- RSO 로그인 가능
- Rate Limiting 적용
- 응답 캐시 동작
- 사용자 데이터 삭제 요청 처리

---

## Phase 5: 상위 랭커 데이터 수집 및 통계 기반 분석

**목표**: 상위 랭커 데이터를 수집하고 통계 기반 분석 기능을 구현한다.

| Task | 설명 | 선행 Task | 상태 |
|------|------|-----------|------|
| TASK-027 | 상위 랭커 선정 기준 정의 | TASK-026 | TODO |
| TASK-028 | 랭커 데이터 수집 스케줄러 | TASK-027 | TODO |
| TASK-029 | 전적 데이터 정규화 및 저장 | TASK-028 | TODO |
| TASK-030 | 기준 통계 생성 (맵/요원/역할/티어/진영) | TASK-029 | TODO |
| TASK-031 | 사용자 전적과 기준 통계 비교 | TASK-030 | TODO |
| TASK-032 | 표본 수와 신뢰도 표시 | TASK-030 | TODO |
| TASK-033 | 통계 기반 피드백 생성 | TASK-031, TASK-032 | TODO |
| TASK-034 | AI 자연어 설명 | TASK-033 | TODO |

**상세 분석 설계**:

Phase 5 Task 분해와 구현 시 참고할 상세 설계 문서(`docs/analysis/`):

- [CYPHER_ASCENT_B_MVP.md](analysis/CYPHER_ASCENT_B_MVP.md) — 초기 MVP 범위
- [DATA_MODEL.md](analysis/DATA_MODEL.md) — 원본/가공/기준 통계 데이터 모델
- [SCORING_RULES.md](analysis/SCORING_RULES.md) — 분석 규칙
- [FEEDBACK_POLICY.md](analysis/FEEDBACK_POLICY.md) — 피드백 정책
- [DATA_LIMITATIONS.md](analysis/DATA_LIMITATIONS.md) — 데이터 제한사항
- [ARCHITECTURE.md](analysis/ARCHITECTURE.md) — 분석 시스템 아키텍처

**완료 기준**:
- 상위 랭커 데이터 자동 수집
- 조건별 기준 통계 생성
- 사용자 전적과 기준 통계 비교 가능
- 표본 수와 신뢰도 표시
- 통계 기반 개선 피드백 제공
- AI가 비교 결과를 자연어로 설명

**원칙**:
- 충분한 표본 수 확보 전까지 피드백 제공하지 않음
- AI는 통계를 직접 생성하지 않고 계산된 결과를 설명만 함

---

## Phase 6: Overwolf 앱

**목표**: 웹 백엔드를 재사용하는 Overwolf 앱을 개발한다.

| Task | 설명 | 선행 Task | 상태 |
|------|------|-----------|------|
| TASK-035 | Overwolf 앱 기본 구조 | TASK-022 | TODO |
| TASK-036 | 라인업 오버레이 | TASK-035 | TODO |
| TASK-037 | 경기 후 요약 | TASK-034, TASK-035 | TODO |
| TASK-038 | 웹 계정 연동 | TASK-035 | TODO |

**완료 기준**:
- Overwolf 앱 설치 및 실행 가능
- 게임 중 라인업 오버레이 표시
- 경기 종료 후 분석 요약 표시
- 웹 계정과 동기화

---

## 후순위

아래 기능은 Phase 6 이후 우선순위에 따라 진행한다:

- 감도 계산과 기록
- 다국어 콜아웃
- 음성채팅 번역 연구
- 자유게시판과 파티 모집

---

## 작업 규칙

1. 한 번에 하나의 Task만 진행한다.
2. Task 완료 후 이 문서의 상태를 업데이트한다.
3. 다음 Task는 사람의 승인 후 시작한다.
4. 선행 Task가 완료되어야 해당 Task를 시작할 수 있다.
