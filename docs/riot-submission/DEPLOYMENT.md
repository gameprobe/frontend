# 신청용 배포 실행안

2026-09-28 · TASK-FE-034 · 실제 배포/권한 변경은 수행하지 않았다.

## 현재 확인한 상태

| 구분 | 결과 |
|---|---|
| 원격 구현 기준 | dev `6249e145a66c00423ff873619ee2fb39ed603b23` |
| 작업 브랜치 | `codex/riot-submission-readiness` (이 Task의 변경은 아직 미커밋) |
| Vercel 프로젝트 | `valorant-platform` / `prj_oQcT7yBpzNSKi6VvM6f0wfIOCVNy` |
| 기존 공개 배포 | main `189c1eb2d8e1c9525ad0a10eb5f131043d95d703`, READY |
| 기존 공개 별칭 | `www.game-probe.com`, `game-probe.com`, `valorant-platform.vercel.app` |
| 최신 dev 배포 | `dpl_DNTby9prVx6ah3ceS79kCD6NXoXz`, BLOCKED |
| dev 오류 안내 | team configuration / Git 작성자·팀 연결 확인 필요 |
| 로그아웃 Preview 접근 | Vercel 로그인 화면으로 이동. 현재 심사 URL로 부적합 |
| 기존 공개 7개 경로 | HTTP 200. 그러나 /connect는 이전 비활성 화면 |
| 기존 공개 라인업 요청 | 방문자 `http://localhost:8080/api/lineups`로 요청. 이번 코드에서 공개 조회 기본값 제거 |

근거: Vercel 연결 도구 list/get deployment 조회 및 [실제 브라우저 기록](../visual-qa/assets/TASK-FE-034/live.json).
프로젝트 상세 조회 도구는 입력 스키마 불일치, 빌드 로그 도구는 도구 없음 응답으로 세부 계정 설정까지는 확인할 수 없었다.
READY는 최신 구현 반영을 의미하지 않는다. 최종 배포의 커밋과 /connect 실제 흐름을 모두 확인해야 한다.

## 추천 배포 구성

- 기존 Vercel 프로젝트와 공개 도메인 유지. Root Directory `frontend`, Next.js, Node 22 계열, Build Command `npm run build`, Install Command `npm ci`.
- 위 값은 저장소 기준 실행안이다. Vercel 대시보드의 현재 설정값은 배포 담당자가 재확인한다.
- 전적/계정 동의 체험은 합성 데이터로 동작하며 Riot 키와 DB가 필요하지 않다.
- 공개 라인업도 예시로 제출한다면 `NEXT_PUBLIC_BACKEND_URL`은 **미설정**으로 둔다. 빈 값도 요청하지 않는다.
- 공개 라인업 API 연결을 선택하면 실제 HTTPS origin으로 `NEXT_PUBLIC_BACKEND_URL`을 설정한다. URL 뒤 `/api/lineups`를 포함하지 않는다. 변경 후 다시 빌드한다.
- `NEXT_PUBLIC_API_BASE_URL`은 이 프론트의 라인업 조회에 사용되지 않는다.
- 공개 환경에 localhost를 입력하지 않는다. 로컬 백엔드 개발에서만 `http://localhost:8080`을 명시한다.
- Riot 비밀키·RSO secret·관리자 토큰을 NEXT_PUBLIC 변수에 넣지 않는다. 이번 신청 흐름에는 관리자 로그인이 필요하지 않다.
- Railway 실제 공개 자료를 쓰기로 하면 기존 README의 backend 배포 절차, HTTPS origin/CORS 및 공개 자료 상태를 운영 담당자와 확인한다. 이번 검증은 Railway 운영 검증을 대신하지 않는다.

## 소유자 승인 후 순서

1. [결정표](DECISIONS.md)의 실제 문의처·운영 사실을 정책/고지에 반영하고 초안 승인 여부를 확인한다.
2. 로컬 변경 검토 후 커밋·푸시·통합 승인. 기존 main/dev 변경 전체가 공개 범위에 포함되는지도 확인한다.
3. Vercel에서 [해당 BLOCKED 배포](https://vercel.com/98jh-shins-projects/valorant-platform/DNTby9prVx6ah3ceS79kCD6NXoXz)를 열어 Git 작성자 연결과 팀 자격을 확인한다. [공식 협업 지침](https://vercel.com/docs/deployments/troubleshoot-project-collaboration#team-configuration)을 따른다. 플랜 업그레이드나 멤버 추가는 임의 실행하지 않는다.
4. 검증된 커밋으로 빌드하고 Preview를 확인한 뒤 승인된 버전을 공개 도메인에 배포한다. 기존 운영 배포 `dpl_78x98XcC3QL6EZVpet2xCgq8UPsL`은 복구 기준으로 기록해 둔다.
5. 아래 공개 환경 검사를 수행하고, 통과한 URL만 신청서에 넣는다.

## 공개 환경 통과 기준

- Vercel/GitHub/Riot에 로그인하지 않은 새 브라우저에서 접근 가능.
- `/`, `/players/demo-player-01`, `/matches/demo-match-001`, `/connect`, `/privacy`, `/terms`, `/lineups`, `/smokes`가 정상 표시.
- `/connect`에 동의 체크·취소·철회 조작이 실제로 보임. 예전 비활성 버튼만 보이면 배포 버전 불일치.
- 동의 이전·취소·철회 이후 요약이 숨겨지며 재동의가 필요. 새로고침 시 초기화.
- 390px/1440px·한국어/영어에서 필수 경로·정책 링크·문의처와 경기 5개 탭 확인.
- 실제 문의처·운영 정보와 개인정보 고지가 승인된 내용과 일치.
- 예시 모드에서 방문자 localhost·실제 Riot API 요청 없음. API 모드면 실제 backend HTTPS 성공과 공개 자료 상태 확인.
- 브라우저 실행 오류·예상 밖 요청 실패 없음. 코드 빌드 성공만으로 이 기준을 대신하지 않음.

## 재실행 가능한 검증

프로젝트 루트에서 설치된 Playwright 경로를 지정한다. Playwright를 제품 의존성으로 추가하지 않는다.

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright \
QA_BASE_URL=https://www.game-probe.com \
QA_OUTPUT_DIR=/private/tmp/gameprobe-public-qa \
node docs/visual-qa/assets/TASK-FE-034/verify.cjs after
```

위 검사는 조작 가능한 데모와 사이트 고지를 검사하며 문의 이메일의 실제 수신, 법률 승인, 호스팅 보관 정책을 검증하지 않는다.
QA_OUTPUT_DIR로 새 환경 결과를 별도 경로에 보관한다. 위 스크립트의 API 요청 0 검사는 예시 모드 기준이다. 실제 공개 라인업 API를 선택하면 성공 요청/데이터 검증을 별도 적용한다.
최종 정책에 예시 주소가 남지 않았는지 별도로 확인하고, 검사 시각·배포 ID/커밋·공개 URL을 결과에 기록한다.

## 작성자 비교 확인 (2026-09-28 후속 조사)

GitHub API로 저장소 private=true, 성공한 main189c1eb의 author=98jh-shin,
차단된 dev6249e14의 author=seochanjin을 확인했다. 두 커밋 모두 GitHub web-flow 병합 커밋이다.
최신dev의 Vercel status는 failure / Deployment was blocked이다. Riot/애플리케이션 API 또는 Railway 오류 메시지는 발견하지 못했다.
Vercel 공식 협업 문서상 비공개 저장소는 Hobby에서 소유자 작성자, Pro에서 팀 멤버 작성자 조건을 확인한다.
현재 플랜/멤버십은 확인하지 못했으므로 특정 플랜을 단정하지 않는다.
소유자가 dev→main PR을 직접 검토·병합하는 기존 흐름은 성공 이력과 부합한다. PR 개설만으로는 main 배포가 시작되지 않으며,
squash/rebase 등 방식에 따라 최종 작성자가 달라질 수 있으므로 병합 커밋과 실제 배포 성공을 함께 확인한다.
이번 FE-034 변경은 아직 로컬 미커밋이어서 원격dev→main 병합만으로 포함되지 않는다.

## 2026-09-29 공개 배포 승인 및 진행
- 사용자: “dev를 main에 올리고 지금 내 도메인에 연결이 정상적으로 됐는지 확인하자.”
- 현재 검증된 로컬 FE-034 변경을 커밋·업로드하고 dev→main 통합 및 기존 도메인 배포 검증을 승인한 것으로 반영. 추가 승인 재요청 없음.
- 기준: 원격dev6249e14, main189c1eb. 다른 작업의 current-screen.png는 제외.
- 운영 정보·문의처·성과점수 변경 포함. 미확정 보관/정책 항목은 초안으로 유지하며 Riot 신청 제출은 별개.
- Railway 백엔드는 9/29 읽기 전용 확인에서 FAILED, /health는404 Application not found. 프론트 데모 공개는 백엔드 복구와 독립.

## 2026-09-29 실제 공개 배포 결과
- Status: DEPLOYED_AND_VERIFIED
- Human Decision Required: NO (요청한 통합·도메인 검증); Riot 제출/정책 최종화는 별도.
- 구현 commit6522293 → PR#30 dev통합78a97a8 → PR#31 main통합b08f9a1. 두 PR의 Frontend/Backend/Deployment config 및 Vercel 검사 PASS, 충돌/강제푸시/검사우회 없음.
- PR: https://github.com/98jh-shin/valorant-platform/pull/30 및 https://github.com/98jh-shin/valorant-platform/pull/31 (모두 MERGED).
- Production deployment dpl_2gb9NB26ZcwyE7ZpNJ24XPuPwLH5, READY, commit b08f9a1d98cccb2ff02a93474986fe1b40cd5364, aliasError=null.
- www.game-probe.com HTTPS200, game-probe.com HTTPS308 → www.game-probe.com. 두 도메인 모두 이번 배포 alias에 연결.
- 운영 URL 대상 Playwright verify.cjs after: 1440/390px·한영8경로·경기5탭·동의/취소/철회/초기화44검사그룹 PASS.60스크린샷. errors0, consoleErrors0, apiRequests0. RSC 이동취소는 raw failedRequests에 구분.
- 운영 문의 검사16개 PASS: 실제 이메일/mailto/담당자/지역, 예시 이메일 없음. 운영 화면에서 성과점수 변경 확인. 이미지 검토: PC프로필·모바일동의 정상.
- 실행: git fetch; git add(허용변경만); git diff --cached --check; git commit; git push; gh pr create/checks/merge30·31; Vercel list/get; curl -I 도메인2개; QA_BASE_URL=https://www.game-probe.com verify.cjs after; /tmp/gameprobe-public-qa/verify-contact.cjs; git diff --quiet HEAD origin/main. 전부 PASS.
- 결과 원본·스크린샷: /tmp/gameprobe-public-qa. 이 배포 후 결과 문서는 로컬 후속 기록이며 배포된 코드와 별개.
- Railway는 main push로 자동 재배포 e9e2f4e2-c15d-4152-96a5-b49c30a821a5 진행 중 상태를 관측. 복구/DB 정상은 판정하지 않음. 이번 공개 데모 API요청0.
- 개인정보 문의 보관 및 Vercel 상세 운영 설정은 여전히 미확정. 정책 초안 표시 유지, Riot 신청 미제출.
- 기존 사용자 current-screen.png 보존.
