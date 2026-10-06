# 화면 데이터 대응표

기준: 2026-09-20 · 통합본 `660c6cd` · [TASK-FE-022](../tasks/TASK-FE-022.md).
현재 화면 위치는 [SCREEN-MAP](SCREEN-MAP.md), 표본 작성 방법은 [API-MOCK-DESIGN](API-MOCK-DESIGN.md)을 따른다.
이번 문서는 설계이며 화면·기존 수치·이미지는 바꾸지 않았다.

## 먼저 알아둘 점

킬·데스 같은 기록은 경기 응답에서 가져올 수 있다. 승률·요원별 합계는 그 기록을
모아 계산한다. 현재 화면의 모든 숫자가 Riot API에 같은 이름으로 존재하는 것은 아니다.
특히 현재 RR·최고 랭크·총기별 HS·Probe Score는 별도로 취급해야 한다.

아래의 **계산**은 원시 데이터가 충분할 때 가능한 설계다. 실제 응답 검증이나
산식 변경이 완료되었다는 뜻은 아니다. 운영 전환 때 값이 달라질 수 있는 항목은
후속 구현 Task에서 기존 Mock과 비교하고 검토받는다.

| 분류 | 뜻 |
|---|---|
| 직접 | 공식 응답에 해당 필드가 있다. 요청 권한·실제 값 유무는 별개 |
| 계산 | 직접 받은 기록으로 집계한다. 분모·조회 범위·예외 규칙 필요 |
| 콘텐츠 | 요원/맵/Act 이름·기존 이미지 연결 등 경기 외 메타데이터 |
| 앱 | 브랜드·저장·공유·시연 점수 등 GameProbe가 관리 |
| 미확인 | 확인한 공식 API만으로 일반적으로 제공할 수 있다고 보장하지 않음 |

## 공식 문서에서 확인한 경계

2026-09-20 개발자 포털의 Response Classes를 읽었다. 키를 사용한 실제 호출은 하지 않았다.
공식 문서의 필드 존재와 운영에서의 완전성·권한·보존 기간은 구분한다.

| 참조 | 공식 API / 확인 사항 | 설계 영향 |
|---|---|---|
| MATCH | [경기 상세](https://developer.riotgames.com/apis#val-match-v1/GET_getMatch): `matchInfo`, `players`, `teams`, `roundResults`, `coaches` | 개인 요약만으로 팀/라운드 상세를 만들어내지 않는다 |
| LIST | [개인 경기 목록](https://developer.riotgames.com/apis#val-match-v1/GET_getMatchlist): `puuid`, `history[].matchId/gameStartTimeMillis/queueId` | 목록에는 K/D나 맵별 합계가 없다. 상세를 조합해야 한다. 문서에 없는 페이지 커서를 가정하지 않는다 |
| CONTENT | [콘텐츠](https://developer.riotgames.com/apis#val-content-v1/GET_getContent): 요원·맵·장비·Act 식별 정보 | 맵/게임 모드는 `assetPath` 연결을 고려한다. 모든 ID를 UUID 하나로 통일하지 않는다 |
| RANKED | [Act 리더보드](https://developer.riotgames.com/apis#val-ranked-v1/GET_getLeaderboard): `leaderboardRank`, `rankedRating`, `numberOfWins` | 해당 목록에 있는 식별 가능한 선수만 조건부 연결. 모든 선수의 현재 RR 조회 API로 취급하지 않는다 |
| POLICY | [VALORANT 개발 정책](https://developer.riotgames.com/docs/valorant) | 플레이어 공유 동의·RSO, 신청 데모와 실제 계정 연결을 구분 |

MATCH의 `gameStartMillis`와 LIST의 `gameStartTimeMillis`는 이름이 다르다.
플레이어는 `puuid`, 경기는 `matchId`로 연결하며 이름·태그를 키로 쓰지 않는다.
RANKED의 익명 선수는 식별 필드가 생략될 수 있으므로 이름 추측으로 연결하지 않는다.
콘솔 API는 별도로 나열되어 있다. 첫 설계 검증 대상은 PC Competitive이며 콘솔 지원 완료를 의미하지 않는다.

## 홈 H01~H06

| ID | 화면 | 출처와 전환 경계 |
|---|---|---|
| H01 | 브랜드 바·계정 버튼 | 앱 설정. 계정 링크와 실제 RSO 인증 완료는 별개 |
| H02 | Search·메뉴 | 앱의 이동/입력 UI. Riot가 내비게이션을 제공하지 않음 |
| H03 | Riot ID 검색 | 현재 고정 데모 이동. 미래에는 동의된 계정만 조회하는 서비스 경계 필요. ID만 알면 누구나 전적 조회 가능하다고 설계하지 않음 |
| H04 | 프로필 미리보기 | 현재 고정 표본. 미래에는 프로필과 같은 변환 결과의 요약을 사용 |
| H05 | 소개·분석 예시 | 앱의 설명/시연 자료. 87/74/68/91 같은 예시 점수를 실제 API 분석 결과로 재사용하지 않음 |
| H06 | 푸터 | 앱 문구·약관/개인정보 링크. 게임 응답과 독립 |

## 프로필 P01~P10

| ID | 화면 / 주요 값 | 분류·원본 / 계획 |
|---|---|---|
| P01 | 브랜드·Search·More·Mock 안내 | 앱. 현재 검색은 안내만 표시. 데이터 공급 상태와 Mock 안내를 후속 연결 |
| P02 | 이름·태그·배너·저장·갱신·공유·조회수 | 신원은 동의된 계정 식별 결과 및 MATCH `players[].gameName/tagLine/puuid`. 배너는 기존 자산. 저장/공유는 앱. 조회수는 자체 기능이며 Riot 필드 아님. 갱신은 현재 안내 동작 |
| P03 | Overview/Matches/Performance/Agents/Maps/Weapons 탭 | 앱의 화면 선택. 각 탭은 아래 동일 데이터 집합을 재사용 |
| P04 | 프로모션 | 앱 브랜드/문구/이동. 전적과 독립 |
| P05 | 플랫폼·모드·Act | 앱의 조회 조건 + MATCH `queueId/gameMode/seasonId`, CONTENT `acts`. 표시 Act 이름으로 필터하지 않음 |
| P06 | 시즌 통계·랭크·레벨·그래프 | 통계는 아래 지표 표 참조. `players[].accountLevel/competitiveTier`는 해당 경기 시점 기록. 현재 계정 상태나 RR 추이로 단정하지 않음 |
| P07 | Probe Score·등급·막대 | 앱 시연 점수. Round Win/ACS 등 기초 수치는 계산 가능하지만 점수·등급 기준은 별도. 공식 랭크·MMR·TRS로 표시하지 않음 |
| P08 | Top Agents / 전체 Agents | `characterId`별 경기·시간·승패·킬/데스·피해 합계. CONTENT와 기존 자산으로 표시. Best Map 동률 규칙 별도 정의 |
| P09 | 푸터 | 앱 문구/링크 |
| P10 | 토스트·조회 피드백 | 앱의 동작 결과. API 오류 상태와 기존 저장/공유 알림을 구분 |

프로필 Performance의 추이도 같은 경기 시계열을 사용한다. 순위/RR 그래프와 경기
성과 그래프를 혼동하지 않는다. Maps·Weapons 탭은 아래 S06·S05 집계의 전체 목록이다.
모달 내부의 Performance와 프로필 Performance는 서로 다른 화면이다.

## 사이드바 S01~S06

| ID | 화면 | 연결 가능 데이터 | 현재 표본 / 전환 주의 |
|---|---|---|---|
| S01 | Current / Peak Rating | 최근 조회 경기 `competitiveTier`는 경기 당시 랭크. 리더보드 RR·지역 순위는 조건부 | `rank/rr/peakRank/peakRR/regionRank`는 고정 표본. 일반 선수의 현재 RR·경기 RR 변화·역대 최고 RR은 미확인. 최근 경기 랭크를 Current로 바꾸어 표시하지 않음 |
| S02 | 프로모션 | 앱 | 통계 공급과 독립 |
| S03 | Head/Body/Legs·HS 추이 | `roundResults[].playerStats[].damage[].headshots/bodyshots/legshots` 합계 | 현재 Body는 Head를 이용한 임시 계산, Legs 7% 고정. 실제 적중 수 집계와 같지 않음. 적중 데이터가 없으면 — |
| S04 | Roles | 요원별 통계를 역할 메타데이터로 묶어 합산 | 현재 역할별 첫 요원만 선택. 역할 분류는 확인한 MATCH/CONTENT 필드에 없으므로 기존 메타데이터의 출처를 별도로 확인. 새 자산 작업 아님 |
| S05 | Top Weapons / Weapons | `kills[].finishingDamage.damageItem/damageType`로 무기별 킬 집계 가능 | 현재 대표 무기에 경기 전체 킬 귀속. DamageDto에는 무기 ID가 없어 총기별 HS·피해를 확정할 수 없음. 총기 승률도 정의 없이 만들지 않음 |
| S06 | Top Maps / Maps | `matchInfo.mapId` + 선수 팀의 결과, CONTENT 맵 매핑 | 조회된 경기 기준 승률/판수. 맵 이름/이미지 미매핑은 Unknown/기존 대체 표시 |

## 경기 목록 M01~M05

| ID | 화면 | 데이터 연결 / 범위 |
|---|---|---|
| M01 | 요원·맵·무기·날짜·승패 조건, 안내 배너 | 원본 식별자와 변환된 결과에 조건 적용. 무기 조건은 현재 대표 무기 기준이므로 “해당 무기로 킬을 낸 경기” 등 새 의미는 별도 검토 |
| M02 | 최근 요약·요원 요약·8경기 스트립 | 필터 결과를 시간순 정렬하여 최근20개 요약, 최대8개 스트립. API가 제공하는 완성 요약이 아님 |
| M03 | 날짜별 합계·경기 행 | `matchId`, 시작 시각, `queueId`, 맵/요원 ID, 선수 통계, 선수 팀의 점수와 결과. 일별 합계는 현재 표시된 행의 합계 |
| M04 | 선택 경기 상세 | 아래 5탭. 목록과 동일 `matchId/puuid` 사용. 다른 표본 상세로 fallback하지 않음 |
| M05 | Load more·All Matches | 현재는 로컬 표시량 +20 / 전체 표시. Riot API의 다음 페이지 호출 기능과 다름. 조회 가능한 범위와 아직 가져오지 못한 상세 수를 분리 |

P05 조건은 시즌 카드·사이드바·목록 모두에 영향을 준다. M01 조건은 목록과 최근
요약만 바꾼다. 현재 날짜 필터는 표본 최신 날짜 기준이다. 운영의 “최근7일”은 시계·시간대를
주입하는 별도 규칙이 필요하다. 확보한 최근 일부 경기를 시즌 전체 통계로 부르지 않는다.

## 지표별 원본과 계산 기준

아래 식은 **후속 구현용 제안**이다. 우선 대상은 완료된 PC Competitive 경기이며,
무승부·중도 종료·다른 모드의 집계는 시나리오별로 검증한다. 모든 비율은 전체 원시
합계에서 계산하고 마지막에만 반올림한다. 분모가 없거나 기록이 부족하면 0으로 채우지 않는다.

| 지표 | 공식 원본 / 계산 후보 | 보류 또는 예외 |
|---|---|---|
| K / D / A | `players[].stats.kills/deaths/assists` | 라운드 이벤트 합계와 대조. 안 맞는 값을 조용히 보정하지 않음 |
| K/D, KAD, Kills/Round | 합계 K÷D, (K+A)÷D, K÷`roundsPlayed` | 분모0은 임의의1로 바꾸지 않음. 초기 제안은 비율—와 사망0/라운드0 사유 표시. 정렬에서 숫자0으로 취급하지 않음 |
| 승패·점수 | `teamId`로 연결한 `teams[].won/roundsWon` | `won=false` 하나만으로 패배 확정 금지. 무승부/미완료 별도 |
| 경기 승률 | 승리 수÷집계 대상 경기 수 | 무승부는 별도 수·분모 포함 여부 명시. 중도 종료는 제외 이유 기록 |
| 라운드 승률 | 선수 팀의 이긴 라운드÷대상 라운드 | 참가 라운드/팀 라운드 차이 확인. 팀 고정 ID와 공격/수비 진영 구분 |
| ACS | 선수 `stats.score`÷`stats.roundsPlayed` | score를 킬 수로 추정하지 않음. 시즌 ACS는 분자·분모 합계 사용 |
| 플레이 시간 | 선수 `stats.playtimeMillis` 합계 | 경기 지속 시간 `matchInfo.gameLengthMillis`와 구별. 한쪽이 없다고 같은 값으로 위장하지 않음 |
| ADR | 해당 선수 `damage[].damage` 합계÷참가 라운드 | 대상 PUUID로 적/자신/아군을 구분하는 규칙 검증 필요. 현재 임의 ADR 재사용 금지 |
| DDΔ/Round | (적에게 준 피해−적에게 받은 피해)÷참가 라운드 | 모든 상대의 피해 기록까지 필요. 일부 선수만 있으면 미제공 |
| HS/Body/Legs % | 해당 부위 적중 수÷전체 부위 적중 수 | HS 킬 비율과 다름. 현재 라운드 가중 HS 평균과 다름 |
| KAST | Kill/Assist/Survive/Traded 조건 충족 라운드의 비율 후보 | 공식 완성 필드 없음. trade 시간창·부활·생존 판정 확정 전 미제공. 임의 상수로 계산 금지 |
| FK/FD | 라운드 킬 이벤트를 시각순으로 정렬해 첫 유효 적 처치 판정 | 동시 시각·부활·자살·환경사 예외 필요. 0은 전체 이벤트가 있어야 확정 |
| Ace / Flawless / Multi-kill | 라운드 참가자·킬·사망 또는 확인된 종료 코드 | 5킬만으로 모든 모드 Ace를 추정하지 않음. `roundCeremony/roundResultCode`의 실제 의미를 검증한 뒤 사용 |
| 무기별 킬 | 유효 적 처치의 `finishingDamage.damageItem`별 집계 | 능력/환경/미상 피해 유형을 총기에 강제 귀속하지 않음 |
| 무기별 HS·Damage·승률 | 현재 확인한 응답만으로 직접 연결 불가 또는 정의 미정 | 라운드 시작 `economy.weapon`을 모든 피해에 붙이지 않음 |
| 상대별 킬·데스 | `kills[].killer/victim` 쌍 집계 | 전체 이벤트가 있어야 없는 쌍을 0으로 표시 가능 |
| Probe Score·S/A/B/C 등급 | 앱 자체 산식 | 시연 값과 Riot 필드 분리. 운영 정의·정책 검토 전 실제 실력 점수로 사용하지 않음 |

## M04 경기 상세 5탭

| 탭 | 필요한 원본 | 현재 없는 부분 / 설계 |
|---|---|---|
| Scoreboard | 선수 명단·팀·K/D/A·score·roundsPlayed·competitiveTier, 라운드 승리 팀 | 10명은 표준 경쟁전 표본의 조건이지 모든 모드 공통 조건이 아님. 경기 랭크와 평균 랭크 표시 규칙 분리. 평균 tier 번호를 무조건 반올림해 랭크로 만들지 않음 |
| Performance | 선택 PUUID의 요약 + 라운드 킬/피해 + 상대별 집계 | 선수 교체 시 그 선수의 기록으로 계산. 현재 조회 선수 전용 PS/DDΔ/KAST를 다른 선수에게 복사 금지. 개인 킬/사망 로그와 팀 승리 스트립 구분 |
| Economy | 라운드별 `playerStats[].economy.remaining/spent/loadoutValue/weapon/armor` | 현재 금액 미제공. Bank는 remaining 후보, Loadout은 loadoutValue 후보. Total의 의미·스냅샷 시점·팀 합계/평균을 정의하기 전 그래프 구현 보류 |
| Rounds | `roundNum/winningTeam/winningTeamRole`, `playerStats`, 킬·설치·해체 기록 | 승리 원인 코드는 실제 enum 확인 필요. `playerLocations`는 이벤트 시점 스냅샷이지 연속 위치 추적이 아님. 맵 좌표 변환·자산 준비 전 위치도 미제공 |
| Duels | 경기 전체 킬 이벤트의 killer/victim 쌍 | 현재 조회 선수 관련5쌍만 표본. 나머지20쌍을 0으로 채우지 않음. 전체 이벤트 표본에서만 5×5 생성 |

모달과 보존한 인라인4탭은 같은 상세 모델·미제공 판정을 사용한다. 표시 방식 때문에
데이터 공급자를 두 개 만들지 않는다. Deathmatch에는 경쟁전의 두 팀·공수·팀 승률을
강제로 적용하지 않고 모드 미지원/개인 지표 범위를 유지한다.

## 현재 Mock에서 전환 시 달라지는 것

근거는 [SCREEN-MAP의 데이터 정의](SCREEN-MAP.md)와 [FE-018 결과](../tasks/TASK-FE-018.md),
직전 Mock 감사다. 이번 Task에서 제품 소스를 새로 읽거나 수정하지 않았다.

| 현재 화면용 표본 | 새 원시 응답 표본 설계 |
|---|---|
| 목록 요약과 상세의 합성 산식이 별개 | 동일 경기 원본에서 두 화면을 생성 |
| 무기 표에 대표 무기의 경기 전체 킬 / 상세에는 임의 분배 | 킬 이벤트가 알려주는 무기에만 귀속 |
| HS 라운드 가중 평균·Body 보정·Legs 고정 | 적중 수를 합산한 비율 |
| 역할군별 첫 요원 | 역할군에 속한 모든 요원 집계 |
| KAST·RR·하이라이트·점수의 시연 산식 | 검증한 계산 또는 이유 있는 미제공 |
| 다른 이름으로 들어가도 같은 전적 | 데모 계정별 PUUID/경기 관계를 명시 |

이 변경은 단순 파일 이동이 아니라 **데이터 의미 변경**이다. 기존 표본은 비교 기준으로
보존하고, 새 표본 전환 Task에서 변경 수치·산식·표시 범위를 검토받는다.
