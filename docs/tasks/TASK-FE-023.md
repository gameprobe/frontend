# TASK-FE-023 — API 기반 합성 Mock와 변환·집계 구현

## Status

DONE — PR #16 사용자 병합 완료. 통합 브랜치 `8d204e8`. 후속 화면 연결은 TASK-FE-024.

## Goal

FE-022 설계의 첫 단계를 구현한다. 공식 문서 형태의 합성 4경기를 만들고 동일 원본에서 선수·요원·맵·프로필 통계를 계산한다. 기존 화면 연결은 다음 Task다.

## Baseline

- 사용자 승인: `codex/frontend-rework` pull 후 새 브랜치에서 실제 Mock 구현 시작.
- PR #15 병합본 `a7019f8`에서 `codex/api-mock-data` 생성. 작업 시작 시 깨끗한 상태.
- 기존 HANDOFF 없음. 승인된 이번 범위를 Codex가 `.agent-reports/HANDOFF.json`에 기록했다(Claude 작성으로 표시하지 않음).
- [설계](../frontend/API-MOCK-DESIGN.md), [대응표](../frontend/API-DATA-MAP.md).

## Allowed changes

- `frontend/src/features/tracker-profile/data/**` — 신규 DTO·원본 표본·검사·변환·집계·테스트·사용 설명
- `docs/tasks/TASK-FE-023.md`
- `docs/tasks/TASK-FE-022.md` — 병합 상태만
- `docs/frontend/PLAN.md`, `docs/frontend/API-MOCK-DESIGN.md` — 구현 상태와 다음 연결 단계
- `docs/PROGRESS.md`
- `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md` — 범위 및 Codex 보고만

읽기 전용 소스: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/src/features/tracker-profile/mock.test.cjs`, `docker/compose.frontend.yml`.
프로젝트 지침·docs·Git 메타데이터·공식 Riot 문서는 읽을 수 있다. 검증 보조 파일은 `/tmp/fe023-*` 사용.

## Forbidden changes

- 기존 UI/CSS/Mock/이미지/라인업 변경, 새 화면 연결
- 백엔드·공개 API·인증/RSO·DB·비밀키·배포·운영 의존성 변경
- 실제 사용자/API 데이터 수집, 요청 없는 커밋·푸시·PR

## Acceptance criteria

- 공식 Match/Matchlist/Content의 사용 필드를 명시적인 타입으로 표현하고 앱 메타데이터와 분리한다. 전체 공식 응답을 검증했다고 주장하지 않는다.
- 10명 roster와 전체 roundResults를 가진 재현 가능한 합성 4경기를 생성한다. 원본 이벤트와 선수/팀 합계를 교차 검사한다.
- 조회 선수 합계 65/56/23, 3승1패, Jett 42/32/11; 평균의 평균이 아닌 분자·분모 합산.
- 목록과 상세 ID/시간/queue, roster/team, 라운드·킬·assist·피해/명중 수를 검사한다.
- 0, 분모0, 미제공을 구별한다. KAST·현재 RR·무기 HS 등 보류 지표는 만들어내지 않는다.
- 빈 목록, 일부 상세 실패, 중복/충돌, 미지원 모드, 다른 선수/팀, 미상 콘텐츠, 잘못된 원본을 테스트한다.
- 지표 함수에 사용처·분모·누락 조건을 한국어로 설명한다.
- F09 페이지 동작·F11 인증 동선·F12 실제 재시도 등 UI/운영 연결은 다음 Task로 명시한다.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml exec -T frontend node src/features/tracker-profile/data/data.test.cjs
docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit
docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint
python3 /tmp/fe023-verify-docs.py
git diff --check
```

기존 순수 함수 테스트도 회귀 확인한다. 런타임 부재 시 동일 Node/TypeScript 환경으로 실행하고 실제 명령을 Result에 적는다. UI/CSS 변경이 없어 시각 검증 대상이 아니다.

## Result

### 변경 파일

- `frontend/src/features/tracker-profile/data/README.md`
- `frontend/src/features/tracker-profile/data/contracts/model.ts`
- `frontend/src/features/tracker-profile/data/contracts/riot.ts`
- `frontend/src/features/tracker-profile/data/data.test.cjs`
- `frontend/src/features/tracker-profile/data/fixtures/content.ts`
- `frontend/src/features/tracker-profile/data/fixtures/manifest.ts`
- `frontend/src/features/tracker-profile/data/fixtures/matches.ts`
- `frontend/src/features/tracker-profile/data/mapMatch.ts`
- `frontend/src/features/tracker-profile/data/metrics.ts`
- `frontend/src/features/tracker-profile/data/profile.ts`
- `frontend/src/features/tracker-profile/data/validate.ts`
- `docs/tasks/TASK-FE-023.md`
- `docs/tasks/TASK-FE-022.md`
- `docs/frontend/PLAN.md`
- `docs/frontend/API-MOCK-DESIGN.md`
- `docs/PROGRESS.md`
- `.agent-reports/HANDOFF.json (ignored)`
- `.agent-reports/CURRENT.md (ignored)`

### 구현 결과

- 문서의 소비 DTO와 앱용 Metric/PlayerMatch/Summary를 분리했다. unknown 입력을 검사하고, 없는 값은 0으로 채우지 않는다.
- 합성 4경기·89라운드·각10명 원본에서 이벤트와 선수/팀 합계를 교차 확인했다. 전체65/56/23·3승1패·75%, Jett42/32/11이다.
- 경기→선수→요원/맵/프로필 변환·합산과 중복/내용충돌·부분/빈/오류·지원범위 처리를 구현했다. 시간·비율은 반올림 전 값과 분모를 유지한다.
- 독립 리뷰에서 재현한 가짜 11번째0통계 선수/라운드 참가자 누락을 차단하고, 조회 범위 밖의 경기 중복 충돌을 현재 결과 오류로 만들지 않게 했다.
- 사용처·계산 분모·미제공 조건을 한국어 주석 및 data/README.md에 기록했다.

### 실행·검증 결과

- `git fetch origin`, `git switch codex/frontend-rework`, `git pull --ff-only origin codex/frontend-rework`: PASS, `660c6cd → a7019f8`.
- `git switch -c codex/api-mock-data`: PASS. 구현 직후에는 커밋·푸시·PR을 보류했고 이후 사용자가 PR 생성을 명시적으로 요청했다.
- `docker compose -f docker/compose.frontend.yml exec -T frontend node src/features/tracker-profile/data/data.test.cjs`: PASS, 최종14 tests / 0 failures.
- `docker compose -f docker/compose.frontend.yml exec -T frontend node src/features/tracker-profile/mock.test.cjs`: PASS, 기존 Mock 집계/필터 회귀 검사.
- `docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit`: 최종 PASS. 최초 ES5 iterator 호환 오류2곳 및 파생 타입 오류는 Array.from 변환 후 해결했다.
- `docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint`: PASS, No ESLint warnings or errors. 컨테이너에 git 실행 파일이 없다는 별도 출력이 있었으나 종료코드0이었다.
- 독립 fixture 검사: 전 라운드 생존 killer/victim/assistant·전멸 승리·각 사망 피해 합계150·목록/상세 시각·공수 변경 PASS.
- `python3 /tmp/fe023-verify-docs.py`: PASS, 허용 변경16파일·상대 링크·신규 파일 공백 검사. 최초 보조 검사는 git no-index의 정상 차이 종료코드1을 실패로 분류하여 검사기만 수정했다. 제품 테스트를 삭제/비활성화하지 않았다. 결과 기록 후 검사에서 발견한 파일 끝 빈 줄도 제거했다.
- `git diff --check`: PASS. PR 준비 시 원격을 다시 갱신해 통합 브랜치가 동일 기준 `a7019f8`임을 확인했고 문서/변경 범위를 재검증했다. 제품 소스는 마지막 검증 이후 추가 변경하지 않았다.
- 기본 Docker 접근은 sandbox에서 소켓 접근이 거절되어 승인된 Docker 접근으로 실행했다. 독립 검사자의 로컬 TypeScript 미설치도 같은 기존 컨테이너로 해결했다.
- UI/CSS/기존 소스의 변경이 없는 독립 데이터 모듈이므로 브라우저 시각 검증·프로덕션 빌드는 실행하지 않았다.

### 남은 범위 / 제한

- 문서 기반 **소비 필드 부분 표본**이다. 전체 공식 DTO나 실제 Riot 응답과의 동등성을 검증한 것이 아니다. 실제 키 승인 후 응답/권한/예외를 재검증해야 한다.
- 설치/해체/좌표·부활·환경사·이탈/부분 라운드는 이 표본/검사 범위 밖이다. 상세 탭 연결 시 지원 필드와 미제공 상태를 확장한다.
- 장비/피해/score는 합성 관측값이며 게임의 경제·탄도·전투점수 규칙을 재현하지 않는다. 콘텐츠 ID/assetPath는 데모 전용, 실제 이미지 매핑은 후속 범위다.
- F04캐시, F09페이지/기간 UI, F11동의, F12로딩/취소/재시도, 비동기 공급자와 화면 연결은 남아 있다. 기존 Mock/화면/자산/라인업/백엔드/의존성은 변경하지 않았다.
- KAST·현재 RR·무기 HS 등은 미제공/정의 대기다. 현재 프론트 화면에는 이 새 데이터가 표시되지 않는다.
