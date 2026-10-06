# UI Application Completion Plan — Riot Production API 신청 전 전적 페이지 완성

## 목적

Riot Production API 신청 전에 GameProbe 프로필/경기 상세 페이지 전체를 **실제
운영 가능한 VALORANT 전적 분석 서비스처럼 보이게** 완성하기 위한 UI11 실행
플랜이다. OP.GG/Tracker.gg는 **정보 구조 참고용**이며 디자인을 복제하지 않는다.
GameProbe 고유 차별화 기능은 **API 승인 후** 강화한다.

이 문서는 계획용이며 제품 코드가 아니다. 기준 문서: `ui-reference-audit.md`,
`ui-design-guardrails.md`, `tasks/TASK-015UI11A.md`(마스터 플랜),
`tasks/TASK-015UI11B.md`(상단/요약, 첫 구현 Task).

## 분류 범례

- **Safe with existing data**: 기존 Mock 데이터/에셋만으로 즉시 구현 가능.
- **Requires human decision**: 진행 전 사람 결정 필요(주로 자산/Mock 승인).
- **Requires new mock data**: 신규 Mock 데이터/필드가 있어야 가능.
- **Requires new assets**: 신규 외부 이미지/아이콘 자산이 있어야 가능.
- **Should wait until after API approval**: 실데이터/기준 통계 의존 → 승인 후.

> UI11D/E/F는 **혼합**이다: 구조 정리분은 Safe, 자산/Mock분은 게이트. 아래
> "즉시 가능 범위"와 "Human Decision Gate"를 분리한다.

## UI11 영역별 분류표

| Task | 영역 | 1차 분류 | 즉시 가능 범위 (Safe) | Human Decision Gate / 후순위 | 게이트 종류 |
|------|------|----------|------------------------|------------------------------|-------------|
| UI11B | 프로필 상단/요약 | Safe with existing data — **DONE** | 헤더 KPI 요약·티어 강조·최근 폼(SeasonSummary/RecentTwenty/CareerPeak) — 구현·push 완료(HEAD `aa9c1fc`) | "마지막 갱신 시각"은 데이터 없어 미도입 | (조건부) new mock |
| UI11C | 최근 경기 리스트 | Safe with existing data | 승패 강조·지표 압축·날짜 그룹·펼침 보존(MatchSummary/MatchInsight/DailyMatchGroup) | 요원/맵 아이콘 전체 커버리지 | new assets (UI9B/UI9D) |
| UI11D | 경기 상세 스코어보드 | 혼합(Safe + 게이트) | 팀 구분·자기 행 하이라이트·기존 컬럼 정렬(MatchParticipant) | 요원 이미지 10요원 완성 / 참가자 랭크 컬럼 | new assets (UI9B) / new mock |
| UI11E | 라운드/성과/분석 | 혼합(Safe + 게이트 + 후순위) | UI8B 타임라인 보존·라운드 결과/성과 카드 문법·분석 예시값 명시 | 라운드 이벤트(첫킬/스파이크/클러치) / 평균 대비 분석 | new mock (UI9C) / after-approval (Phase 5) |
| UI11F | 사이드바 무기/맵/역할군 | 혼합(Safe + 게이트) | 역할 승률·정확도(head/body/legs)·맵 성적·무기(topWeapons)·활동/팀원 카드(ProfileSidebarStats) | 역할 아이콘 / 요원·무기 이미지 / 무기별 적중 분포 / **요원 집계 카드(모스트·탑 요원·요원 KD — 현재 데이터 없음)** | new assets (UI9D/UI9B) / new mock / after-approval (요원 집계) |
| UI11G | 반응형/마감/신청 전 점검 | Safe with existing data | 반응형·일관성·빈 상태·접근성·UI Build 배지 점검 | 게이트 미해결 항목을 placeholder로 둘지 최종 결정 | (결정) |

## 권장 실행 순서

1. **UI11B**(상단/요약) — **DONE**(구현·push 완료, HEAD `aa9c1fc`). Safe.
2. **UI11C**(최근 경기 리스트) — Safe. 자산 결정 불필요로 바로 진행 가능.
3. **UI11D 구조 정리분**(팀 구분·자기 행·컬럼) — Safe. 요원 이미지/랭크는 게이트.
4. **UI11E 구조 정리분**(타임라인 보존·성과 카드·분석 예시 명시) — Safe. 이벤트/
   분석 실질은 게이트/후순위.
5. **UI11F 데이터 기반 카드분**(역할 승률·정확도·맵 성적·무기 카드) — Safe.
   아이콘/이미지/무기별 분포·**요원 집계 카드(현재 데이터 없음)**는 게이트.
6. **UI11G**(반응형/마감/신청 전 점검) — 위 영역 정리 후 통합 마감.

> 게이트(자산/Mock) 항목은 사람 결정 후, 해당 UI11 Task의 게이트 범위로만 열어
> 진행한다. 결정 전에는 placeholder/라벨/전체 분포로 **정직하게** 표시한다.

## 지금 바로 구현 가능한 작업 (사람 결정 불필요)

- **UI11B** — 이미 DONE(구현·push 완료).
- **UI11C** 전체, **UI11G**(다른 영역 정리 후).
- **UI11D/UI11E/UI11F의 "즉시 가능 범위"**(구조 정리·데이터 기반 카드)만 분리 진행.
  단 UI11F의 즉시 가능 범위는 **역할/맵/무기/정확도/활동·팀원 카드에 한정**하며,
  요원 집계 카드는 포함하지 않는다.

## 사람 판단이 필요한 작업 (Human Decision Gates)

- **UI9B (자산)**: 누락 요원 7종 PNG 취득·출처·라이선스 승인 → UI11D 요원 이미지,
  UI11F 요원 이미지, UI11C 아이콘 커버리지를 연다.
- **UI9C (Mock)**: 라운드 첫 킬/스파이크/클러치 등 이벤트 Mock·schema 승인 →
  UI11E 라운드 이벤트 표시를 연다.
- **UI9D (자산/Mock)**: 역할군 아이콘 출처·승인, 무기별 적중 분포 Mock 승인 →
  UI11F 아이콘·무기 분포를 연다.
- **요원 집계 카드**(UI11F): 모스트/탑 요원·요원별 게임수·승률·KD는 현재
  `ProfileSidebarStats`에 **요원 집계 필드가 없다**. 신규 Mock 또는 Riot
  API(승인 후) 데이터 도입 여부를 결정해야 하며, 결정 전에는 요원 단위 카드를
  구현하지 않는다.
- **참가자 랭크 컬럼**(UI11D): 신규 Mock 필드 승인 여부.
- **"마지막 갱신 시각"**(UI11B): 신뢰 timestamp 출처 없으면 신규 Mock → 보류 여부.
- **신청 전 완성 기준선**(UI11G): 게이트 미해결 항목을 placeholder로 둔 채 신청할지.

## 신규 Mock / 신규 자산이 필요한 작업

- **신규 자산(이미지/아이콘)**: UI11D(요원 이미지), UI11F(역할 아이콘·요원/무기
  이미지), UI11C(아이콘 전체 커버리지) — UI9B/UI9D 게이트.
- **신규 Mock 데이터**: UI11E(라운드 이벤트), UI11D(참가자 랭크), UI11F(무기별
  적중 분포), UI11F(요원 집계 카드 — 모스트/탑 요원·요원 KD), UI11B(갱신
  timestamp, 조건부) — UI9C/Mock 결정.
- **API 승인 후로 미룸**: UI11E 평균 대비 통계 분석(기준 통계·Phase 5),
  UI11F 요원 집계(실데이터로 대체 가능 시), 실데이터 연동·차별화 기능(Phase 4/5).

## 신청 전 점검 체크리스트 (UI11G에서 사용)

- [ ] 데스크톱/태블릿/모바일 반응형 레이아웃 깨짐 없음
- [ ] 영역 간 카드 문법·간격·타이포 위계 일관
- [ ] 빈/부분 데이터가 정직하게 표시(placeholder/`—`/"표본 없음")
- [ ] `Mock / Preview` 고지 유지(과장된 실데이터/분석 단정 없음)
- [ ] UI8A 탭 접근성·UI8B 라운드 타임라인 보존
- [ ] UI Build 배지 표시(배포 검증)
- [ ] 데이터 없는 UI/임의 이벤트/난수/외부 URL 없음
- [ ] OP.GG/Tracker 디자인 복제로 보이지 않음(가드레일 3장)
