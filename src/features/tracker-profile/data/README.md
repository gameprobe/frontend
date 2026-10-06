# API 기반 Mock 데이터 — TASK-FE-023 / FE-024

공식 문서 형태의 **합성 표본과 순수 계산 함수**다. FE-024에서 홈과 `/players/demo-player-01`, 경기 상세에 연결했다. 기존 `/players/ied-agent-allen`을 기본 진입으로 유지하며 새 데이터는 명시적으로 선택한다.
실제 Riot API를 호출하거나 전체 공식 응답을 저장한 데이터가 아니다.

## 어디를 수정하는가

| 파일 | 사용처 / 수정할 때 |
|---|---|
| `contracts/riot.ts` | MATCH·LIST·CONTENT에서 실제로 읽는 필드. 공식 문서와 대조할 때 |
| `contracts/model.ts` | 프로필/경기 행에 전달할 수치·미제공 사유. 표시 계약을 바꿀 때 |
| `fixtures/matches.ts` | 10명·전체 라운드가 있는 기본 4경기. 경기 예시를 바꿀 때 |
| `fixtures/content.ts` | 요원/맵/장비/Act의 데모 식별자와 이름. 이미지 파일은 포함하지 않음 |
| `fixtures/manifest.ts` | 합성 출처·버전·기준 시각·지원 범위·단순화 가정. 앱 전용 메타데이터 |
| `validate.ts` | 누락·타입·ID·라운드/선수 합계 일관성 검사 |
| `mapMatch.ts` | 한 경기에서 조회 선수의 기록을 추출. 이름은 콘텐츠와 연결 |
| `metrics.ts` | P06/P08·S03/S06·M02의 합계/비율. 분모와 누락 규칙을 바꿀 때 |
| `profile.ts` | 목록/상세 연결·중복 제거·조회 범위·부분 실패·요원/맵 집계 |
| `provider.ts` | 홈 데모 신원·조회 공급자·ready/partial/empty/error 시연 상태 |
| `viewModel.ts` | 같은 원본의 요약·요원·맵·무기 기록을 기존 표시 컴포넌트에 전달 |
| `matchDetail.ts` | 모달/인라인/직접 링크에 동일 10인·라운드·교전·경제 원본 전달 |
| `../hooks/useProfileData.ts` | 로딩·요청 취소·재시도와 이전 응답 차단 |
| `data.test.cjs` | 정상 표본과 잘못된 응답·0/누락·팀 반전 회귀 검사 |

## 호출 예시

```ts
import { matches, matchList } from './fixtures/matches';
import { content } from './fixtures/content';
import { manifest } from './fixtures/manifest';
import { buildProfile } from './profile';

const result = buildProfile(
  matchList,
  matches.map((data) => ({ matchId: data.matchInfo.matchId, status: 'ok', data })),
  content,
  { puuid: manifest.viewerPuuid, platform: 'pc', queueId: 'competitive' },
);
```

`result.matches`는 경기 행용 원본 수치, `summary`는 같은 범위 전체 합계,
`agents/maps`는 같은 자료의 ID별 합계다. 값은 반올림 전 숫자다.
`mapMatch()` 결과에 더해 원본 `roundResults`를 이용할 상세 탭 모델은 다음 연결 Task에서 확장한다.

## 기본 표본과 검사

| 경기 | 요원 | 결과 | K / D / A |
|---|---|---|---|
| demo-match-001 | Jett | 13:9 승 | 24 / 15 / 5 |
| demo-match-002 | Omen | 9:13 패 | 10 / 16 / 8 |
| demo-match-003 | Jett | 14:12 승 | 18 / 17 / 6 |
| demo-match-004 | Sova | 13:6 승 | 13 / 8 / 4 |

합계: 4경기·89라운드·3승1패·65/56/23. Jett는 2경기·42/32/11.
원본 선수 합계는 라운드 이벤트에서 만든다. 즉 목표 숫자를 스코어보드에 따로 덮어쓰지 않는다.
검사에서는 참가자 10명/팀별 5명, 전 라운드 기록, 킬·데스·assist·score와 팀 승수까지 대조한다.
표본의 전멸·생존·피해 일관성도 별도로 확인한다.

- ACS = score 합계 / 참여 라운드. ADR = 적에게 준 피해 / 참여 라운드.
- DDA = (적에게 준 피해 − 적에게 받은 피해) / 참여 라운드.
- HS = 머리 적중 수 / 전체 부위 적중 수. 피해량이나 경기별 HS의 단순 평균이 아니다.
- K/D = 킬 합계 / 데스 합계. 데스0은 `unavailable: no_deaths`다.
- 실제 0은 `known`이고, 분모0·누락·미정의는 `unavailable`이다.
- 무기별 킬은 `finishingDamage`를 사용한다. 장비의 `economy.weapon`으로 추정하지 않는다.
- KAST·현재 RR·무기별 HS는 미제공/정의 대기로 남긴다.

## 조회 범위와 오류

`ready / empty / partial / unavailable / error`를 구별한다. 목록 성공 후 빈 배열은 `empty`,
일부 상세 실패는 `partial`, 전부 조회 실패 또는 유효하지 않은 데이터는 `error`다.
요청 조건으로 제외된 경기와 손상된 기록을 구별하며, 모드 미지원/무승부/미완료도 제외 이유로 남긴다.

`coverage.returned`는 원래 목록 길이, `unique`는 고유 경기 수,
`duplicateEntries/duplicateDetails`는 동일 내용 중복 수다.
`received`는 이번 범위에서 검사한 성공 응답 수(유효하지 않은 내용일 수도 있음),
`failed`는 상세 누락/조회 실패 수, `invalid`는 충돌/검사 실패 경기 수다.
`included`는 실제 집계 수, `excluded`는 빠진 경기별 사유다.
`unique = included + excluded.length`이며 `received`와 `invalid`는 서로 배타적인 수가 아니다.
시작/끝 시각은 집계된 경기 기준이며, `completeSeason`은 항상 false다.

## 한계와 다음 연결 단계

- 소비하는 DTO 부분만 구현했다. 설치/해체·좌표·ability 상세 등 안 쓰는 필드는 이 표본에서 생략했다.
  타입 검사 성공을 전체 Riot 응답 계약 또는 실 API 호환 검증으로 해석하지 않는다.
- 게임 물리/경제/탄도/실제 전투점수 산식을 재현하지 않는다. 합성 score와 피해 등 단순화는 manifest에 설명했다.
- 콘텐츠 ID와 맵 경로는 테스트 전용이다. 실제 콘텐츠 ID·이미지 매핑은 운영 연결 시 검증한다.
  기존 이미지·자산 매핑은 변경하지 않았다.
- 현재 검사 범위는 10명·두 팀·전체 라운드의 PC Competitive 표본이다.
  부활·환경사·이탈/부분 라운드·특수 모드의 실제 응답 사례를 확보하면 규칙과 테스트를 확장해야 한다.
- 역할 분류는 Riot 응답이 아닌 앱 메타데이터다. 화면에서 같은 역할에 속하는 요원의 원본 기록을 함께 집계한다.
- F01/F02/F03/F05/F06/F07/F08/F10의 순수 데이터 경계를 검증했다.
  FE-024에서 기간/표시량은 기존 UI를 재사용하고 F12 로딩/취소/재시도를 연결했다. F04 운영 캐시·페이지 수집, F11 동의 흐름은 남아 있다.
- 실제 키 승인 후 원본 공급자와 RSO/권한을 연결하고, 실제 응답으로 가정을 재검증해야 한다.
  이 폴더에 네트워크 호출·비밀키·서버/공개 엔드포인트는 없다.

실행: `docker compose -f docker/compose.frontend.yml exec -T frontend node src/features/tracker-profile/data/data.test.cjs` (저장소 루트에서).

## 화면에서 확인하기

- 홈의 `데모 보기`·`Overview`·일반 프로필 카드 → `/players/ied-agent-allen`: 기존 디자인 데모. 입력한 Riot ID는 조회하지 않는다.
- `새 데이터 데모` 링크/카드 → `/players/demo-player-01`: 합성 4경기. 새 데이터 확인을 명시적으로 선택한 경우에만 진입한다.
- `/players/demo-player-01?scenario=partial`: 상세 1개 조회 실패, 3개만 집계. `empty`는 빈 결과, `error`는 조회 실패.
- 실패 시나리오의 재시도는 같은 실패를 다시 보여준다. 정상 복귀 링크를 누르면 기본 표본으로 돌아간다.
- `/matches/demo-match-001?viewer=demo-player-01`: 같은 경기 상세. 새 탭/복사도 이 주소와 조회 선수를 보존한다.
- `—`는 0과 다르다. RR/현재·최고 랭크, KAST, Probe Score/등급, 무기 HS/KD, 프로필 하이라이트 합계는 미제공이다.
- 무기 킬은 처치 이벤트 기준이며 능력·기타 킬을 제외한다. 무기 필터는 해당 무기로 처치한 경기 전체를 선택한다.
- 새 상세의 FK/FD는 각 라운드 첫 킬 이벤트, MK는 2킬 이상 라운드 수다. 운영 통계 정의 확정은 별도다.
- 실제 API 연결 시 공급자만 바꾸면 모든 기능이 자동 완성되는 것은 아니다. 서버 키 보관·RSO·권한·실응답 검증과 운영 예외 처리가 필요하다.

추가 검사: `data/viewModel.test.cjs`, `data/matchDetail.test.cjs`. 브라우저 검증·재현 명령은 [FE-024 Visual QA](../../../../../docs/visual-qa/TASK-FE-024.md)에 기록한다.
