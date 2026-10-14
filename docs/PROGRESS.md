# PROGRESS.md - 진행 상황 로그

## 2026-10-14 — TASK-FE-055

- 개인 dev259d880의 Vite 프론트를 조직 dev83c9023 기반에 이관했다. 팀원 Git 이력·배포 helper·main 전용 자동화 정책을 보존하고, 루트 Docker/Compose와 안내를 Vite에 맞췄다.
- 타입/Lint/빌드, 클라이언트10개·정적 서버16개 검사, ARM64 이미지 HTTP9개 및 브라우저 직접 경로/새로고침 PASS. 데스크톱·모바일 Before/After 비교 PASS.
- 실제 browser backendApi → localhost:8000/health 200/CORS/UP 및 서버 로그 일치. 화면 데이터는 예시이고 DB 미연결이다. main·운영·Vercel·deploy 변경 없음.
- 상세 변경·검증·범위는 [Task](tasks/TASK-FE-055.md), [Visual QA](visual-qa/TASK-FE-055.md).


## 2026-10-05 — TASK-FE-041

- 사용자 승인으로 검증 완료 변경을 커밋·푸시하고 `codex/frontend-rework` 대상 PR을 제출한다. 최신 원격 기준4e29dbd와 차이 없음, 최종 범위 검토 PASS, 비밀 환경파일 제외 확인. 병합은 사용자가 수행한다.

- 사용성 보완 3건 승인 후 선택 목록을 자료 바로 위로 이동하고 선택 번호·이름 제목 및 자료 없음 사전 표시를 적용했다. 최종 타입/Lint/단위41개/선택27개/상세회귀23개/격리빌드 PASS, PC·모바일 Before/After 추가4장 확인. 미커밋·사용자 검토 대기. 아래25개 기록은 최초 구현 검증이다.

- PR #48 병합을 반영해 frontend-rework를 `4e29dbd`로 fast-forward하고 `codex/lineup-marker-selection`을 분기했다.
- 범위: 상세 다중 스킬의 번호·이름 보조 선택과 선택/포커스 마커 표시 순서. 공개 목록에는 이미 보조 선택이 있어 제품 변경은 상세 컴포넌트와 전용 CSS 두 파일이다.
- 타입·Lint·기존 경로18/미디어12/API11 검사와 비밀환경파일 없는 격리 빌드 PASS. 겹친 좌표·중복 이름·터치/키보드25개와 기존 상세 오류/자료23개 PASS. 시각 검토에서 발견한 공통 버튼 reset 충돌을 수정 후 재검증·최종 빌드 PASS. Before/After4장 약224KiB. IMPLEMENTED, 미커밋·사용자 검토 대기. DB·백엔드·환경파일·관리자·스모크 변경 없음.

## 2026-10-05 — TASK-FE-040

- 사용자 요청으로 `codex/frontend-rework` 대상 PR을 준비한다. API 연결·지도 통일·상세 오류 보완을 세 커밋으로 구분하며, 겹친 마커 선택은 병합 후 별도 브랜치로 미룬다. 기준 브랜치는 이미 dev에 병합된 `5e0fa1c`까지 원격에도 동기화한다. 스모크 실제 저장·운영 자료 검수는 남은 작업이다.

- 상세 재점검에서 찾은 두 결함을 보완했다. 서버/연결 오류를 자료 없음으로 덮지 않고, 구형 다중 스킬 중 자료 없는 스킬에 다른 스킬 영상을 표시하지 않는다. 제품 변경은 LineupDetail.tsx 한 파일. 타입·Lint·81개 기존 검사·격리 빌드·새 PC/모바일 상세 회귀23개 PASS, 실제 등록 예시4개화면폭 읽기 전용 확인 PASS. Before/After 영역8장 약106KiB, DB 쓰기0. 후속 수정은 미커밋이며 사용자 검토 대기.

- 사용자 승인에 따라 API 연결을 `c87b263`으로 먼저 커밋하고 상세 지도 통일을 별도 작업 단위로 마무리했다. 상세의 공수 방향·아이콘·경로 스타일·아이콘 중심 좌표를 목록과 일치시켰으며 목록/관리자/DB는 유지했다.
- 추가 검증: 타입·Lint·81개 기존 검사·격리 빌드 PASS, PC/모바일 목록↔상세 회귀10개 PASS. Before1/After2 캡처, 직접/독립 코드·시각 검토 PASS. 실제 자료 변경/DB 쓰기0, git diff 검사 PASS. 로컬 커밋2개로 분리하고 푸시·PR은 별도 요청을 기다린다.

- 후속 요청: Abyss/Brimstone/Q의 꺾이는 경로 예시 한 건을 실제 관리자 UI에서 Atlas에 공개 저장했다(ID `15f99bbd-3982-469e-b447-09f4ffcc4064`). 테스트/게임 미검증 고지, Strats 원본 링크 포함. 사용자 확인용으로 보존하며 다른 자료는 그대로다.
- 추가 단위 검사 후81개 PASS, 실제 UI 등록·조회15개 PASS, 읽기 전용 재실행14개 PASS(중복 생성0). 공개 지도·상세 캡처2장 추가. 기존ID를 우선 확인하는 재실행 안전장치도 검토·보완했다.
- Docker 감사 PASS: QA 스크린샷은 현재 frontend/backend 이미지에 포함되지 않는다. frontend 개발 이미지의 테스트 CJS는 약126KiB. 별도 운영용 프론트 Dockerfile은 없어 추후 설정 확인이 필요하다. 소스 기능·환경 비밀값·Docker 설정 변경 없음.

- `codex/admin-lineup-api`에서 라인업 관리자 실제 API 연결 완료. 예시 디자인으로 목록/등록/편집을 통일하고 실제 토큰·저장·상태·삭제를 사용한다.
- registration 및 중간 좌표를 보존하고 공개 도착점/출발점 선택·직선/꺾임·영상/이미지 상세를 연결했다. 기존 다중 마커 자료는 읽기 전용으로 보존하며 상태/삭제만 지원한다.
- 타입/Lint/격리 빌드, 모델79개, 일회용 DB 실제 API8개·PC/모바일 브라우저19개·목록 시각 회귀2개 PASS. Before12/After23장, 독립 코드·시각 검토 후 초기화/인증 재시도/기존 스킬 ID/모바일 줄바꿈 문제 수정·재검증 PASS.
- 로컬 백엔드는 이미 병합된 소스로 갱신해 healthy 및 기존 토큰200/오류토큰401/무인증403 확인. Git 제외 frontend/.env.local의 공개 API 주소를 로컬8080으로 설정했다. 비밀값 노출0. 초기 격리 검증에서는 Atlas 쓰기 없음; 아래 후속 요청에서 한 건 등록.
- 스모크 실제 저장·공유 도착점 일괄 이동·운영 자료 검수는 제외. 커밋/푸시/PR 없이 사용자 검토 대기. [Task](tasks/TASK-FE-040.md), [Visual QA](visual-qa/TASK-FE-040.md).

## 2026-10-04 — TASK-BE-003

- 로컬 환경 후속: 요청한 접두어를 포함한 무작위 관리자 토큰을 비밀 환경파일에 설정하고 기존 이미지에 적용했다. 인증200/오류토큰401/무토큰403/health200 PASS, Git 노출0. 새 소스 배포·실제 자료 조회/쓰기·프론트 변경 없음.

- 최신 단순화 완료: pathPoints의 x/y 좌표 배열 하나만 저장한다. 일반 경유/튕김 구분·소바 설정·충전·별도 횟수·중복 routePoints와 호환 코드를 제거했다. 경로만의 수정/정렬/초기화를 허용하고 누락/null 좌표를 거절한다. 임시 DB 전체47개 테스트·bootJar PASS(15초), 실제 Atlas/서버/프론트 미변경. 아래 공통 횟수·선택 충전 기록은 이번 결정으로 대체됐다.

- 공통 튕김 후속: 새 등록의 소바 설정 필수를 해제하고 BOUNCE 개수를 응답에서 계산한다. 별도 횟수 저장 없음. 선택 충전 단계와 구형 호환·전환 시 충전 보존을 보완했다. 여러 요원/경로 수정/구형 PUT 및 raw DB 검증8개 추가, 전체48개·bootJar PASS(14초). 프론트·실제 Atlas·실행 서버 변경 없음.

- 가독성 후속 요청: Controller/Service/Repository 3개 파일의 중첩 처리·위치 인자를 단계별 변수와 이름 있는 인자로 정리했다. API·DB·인증 의미를 보존했고 기존40개 테스트·bootJar(14초)·독립 원본 비교 검토 PASS. 테스트·DTO·저장 모델 변경 없음.

- 파일 정리 후속: 저장소 인터페이스/Mongo 구현을 단일 LineupRepository로 통합, StatusRequest를 LineupRequest.kt로, 등록 값 타입을 LineupModels.kt로 합쳐 라인업 소스12개→9개. web/service/repository/dto로 역할을 구분하고 저장 모델 FQN·기존 동작은 유지했다. 테스트의 인터페이스 대역을 구체 클래스 대역으로 바꾸고 조회 후 수정 실패/ID/호출 횟수 검증을 유지했다. 전체40개 테스트·bootJar 재검증 PASS(14초).
- 후속 요청: `lineup/dto`에 등록/수정 요청, 라인업 응답, 상태 변경 요청, 관리자 세션 DTO를 모았다. Controller 응답 변환을 명시하고 기존 JSON/인증/저장 형태를 유지했다. 관련 import 정리 후 전체40개 테스트 및 bootJar 재검증 PASS.
- 최신 dev `5fccc83`을 로컬 `codex/backend`에 fast-forward하고 `codex/lineup-storage-contract`를 분기했다.
- 라인업 패키지에 선택적 등록 정보 DTO와 저장/검증을 추가했다. 도착점 ID·경유/튕김·영상/이미지·사이트/슬롯을 보존하고 기존 요청/다중 마커/BSON 자료와 호환한다.
- 구형 PUT에서 신규 정보를 보존하고, 관련 경로·마커 등을 새 등록 정보 없이 바꾸면409로 거절한다. 기존 소바 필수 설정 유지.
- 새 API·Mongo 테스트15개 + 기존25개 = **40개 PASS**, 실행 패키지 빌드·diff·환경파일 제외·독립 검토 PASS. 첫 테스트 smart-cast 컴파일 오류 수정 후 재검증했다.
- 실제 Atlas/기존 서버를 건드리지 않고 tmpfs 임시 Mongo만 사용·정리했다. 프론트·스모크·인증·의존성·Docker 변경 없음.
- 공유 도착점 일괄 이동/동시 편집 및 관리자 프론트 연결은 후속 범위. 미커밋·사용자 검토 대기. [Task](tasks/TASK-BE-003.md), [API 계약](backend/LINEUP-API.md).

## 2026-10-04 — TASK-BE-002

- PR #43 병합 dev `d042256`을 로컬 `codex/backend`에 fast-forward 후 `codex/backend-atlas-docker`를 분기했다.
- 백엔드 Docker 단독 실행·필수 Atlas URI·비밀환경 빌드 제외를 구성하고 앱 실행용 Mongo Compose/init를 제거했다. 기존 데이터 볼륨/프론트 서버를 보존하며 테스트는 tmpfs 일회용 DB로 유지한다.
- Java17 이미지 빌드·기존25테스트·테스트 환경 격리·임시 DB 런타임 조회 및 관리자 거절·독립 검토 PASS.
- 사용자 입력 URI의 DB 이름을 보완한 뒤 **실제 Atlas 연결 PASS**: healthy, health200, 공개 라인업 GET200/0건. 테스트 자료 쓰기·삭제 없음. 현재 백엔드 localhost:8080 실행 중.
- 프론트/API/인증/저장 문서/의존성 변경 없음. 관리자 preview 실제 연결·배포는 별도 범위. 사용자 요청으로 커밋·푸시·codex/backend 대상 PR 제출 진행, 병합은 사용자가 수행한다. [Task](tasks/TASK-BE-002.md), [Atlas 실행 안내](backend/MONGODB.md).

## 2026-10-04 — TASK-FE-039

- PR 전 추가 점검: 홈·오버뷰·인사이트·스모크·관리자 예시 PC/모바일16장과 기존 동작 회귀 PASS. 실행 예외·가로 넘침·네트워크 쓰기0, 공유 코드 독립 재검토 PASS. 추가 소스 수정 없음.

- PR #41 병합 frontend-rework `25b0f52`를 충돌 없이 받고 `codex/lineup-destination-flow` 분기.
- 공개 라인업 도착점 묶음/출발점·경로 hover·focus/정확한 상세 연결, 겹침·누락 위치의 텍스트 접근을 보완했다. 기존 상세 링크가 첫 공략을 계속 가리키던 문제를 제거했다.
- 기존10개ID+추가3개 합성예시의 목록/상세 좌표를 통일했다. 기존 API 경로는 보존하고 빈 경로를 추정하지 않는다. 실제 영상 없는 예시는 안내한다.
- 타입/Lint/격리 빌드15개·모델17개·관리자30개 PASS. Before6/After9/API4장·1440/390px 키보드/터치·누락자료/빈결과·독립 코드/실제 이미지 검토 PASS.
- 관리자 편의성·저장/API/백엔드/DB/스모크/인사이트는 미변경. 사용자 승인으로 커밋·푸시·frontend-rework 대상 PR 제출 진행. 병합은 사용자가 수행한다. [Task](tasks/TASK-FE-039.md), [Visual QA](visual-qa/TASK-FE-039.md).

## 2026-10-04 — TASK-FE-038

- PR #40 병합 frontend-rework `d3547ec`를 받고 `codex/admin-management-flow` 분기. dev 변경은 이미 기준 브랜치에 포함됨을 확인했다.
- 관리자 예시 입장 후 목록부터 표시하고 라인업/스모크 관리 메뉴와 목록·등록/편집을 분리했다. 모바일은 위쪽 관리 메뉴 및 세로 목록이다.
- 종류별 검색·상태를 왕복/저장 후 유지하고, 미저장 이동 확인·빈 결과 초기화·전환 초점을 보완했다. 기존 지도/모델/API/인증/공개 페이지는 변경하지 않았다.
- 타입·Lint·격리 빌드(정적15개)·모델30개 PASS. Before8장/After20장 및 지도 회귀14장, 1440/390px 마우스/터치·키보드 PASS, 브라우저 오류/API 요청/가로 넘침0. 초기 입장 초점 누락을 수정해 재검증 PASS.
- 실제 이미지 대조 및 독립 코드/시각 검토 PASS. [Task](tasks/TASK-FE-038.md), [Visual QA](visual-qa/TASK-FE-038.md). 구현 검증 완료. 사용자 승인으로 현재 상태를 커밋·푸시하고 frontend-rework 대상 PR 제출을 진행한다. 실제 등록 담당자의 피드백 후 편의성 개선을 검토하며 백엔드는 이번 변경에서 제외한다.

## 2026-10-04 — TASK-FE-037

- PR #39 병합 dev `c0a876d`를 로컬 `codex/frontend-rework`에 fast-forward하고 `codex/admin-ui-preview`를 분기했다. 이후 PR 대상은 frontend-rework다.
- `/admin/preview`에 예시 코드 `DEMO1234`, 자료 목록/검색/상태 필터, 신규/수정, 자료 URL 및 지도 위치 입력, 같은 데이터 기반 미리보기를 구현했다.
- 사용자 추가 요청을 반영해 시작 → 여러 경유·벽 튕김 지점 → 도착을 연결했다. 일반/튕김 선택, 순서 번호, 마지막 지점 취소 및 위치 초기화를 제공한다. 실제 반사 계산은 하지 않는다.
- 기존 관리자 인증에는 예시 진입 링크만 추가했다. 예시 데이터는 현재 화면 메모리만 사용하며 실제 인증/공개 API/DB/미디어 자동 로드/게시 동작은 변경하지 않았다.
- 타입·Lint·격리 임시 빌드 PASS, 모델 11/11 PASS, Playwright Before 8장/After 18장, 1440/390px 입장·편집·경로·미리보기·키보드·초기화 PASS, 브라우저 오류/API 요청 0. 기존 홈·Insights·라인업·스모크 캡처 각각 픽셀 동일.
- 후속 사용자 피드백: 공통 시작점 하나에서 여러 도착 경로를 추가/선택/삭제하도록 확장했다. 경로별 좌표 격리·전체 미리보기·모든 경로 검증, Before4장/After10장 및 기존 전체18장 회귀·타입·Lint·빌드·모델15/15 PASS. 최종 기존4화면 픽셀 차이0.
- 직접·독립 코드/시각 검토 PASS. 상세 [Task](tasks/TASK-FE-037.md), [Visual QA](visual-qa/TASK-FE-037.md). 미커밋·미푸시 상태로 사용자 화면 검토를 기다린다.

- 최종 사용자 승인에 따라 공통 출발점/복수 경로 양식을 도착점 중심의 개별 공략 등록으로 대체했다. 도착점 ID를 공유하는 개별 공략 등록으로 단순화했다. 같은 도착점에 공략 추가 시 맵·요원·스킬·도착점은 재사용하고 출발점·경유/튕김·자료는 새로 입력한다. 기존 도착점 잠금과 명시적 새 도착점 분리로 다른 공략을 보호한다.
- 최종 Before6/After16/회귀6장, 모델18/18·타입·Lint·격리 빌드 PASS. 긴 이름 미리보기 넘침 수정, PC/모바일 모든 주요 흐름 및 독립 시각 검토 PASS. 기존4화면 픽셀 차이0.

- 드래그 수정 후속: 이미 지정한 출발·새 도착·경유·튕김·벽 끝을 마우스/터치로 끌어 수정한다. 방향키 미세 조정, Shift+방향키 크게 이동, Esc/터치 취소 복구를 지원한다. 공유 도착점은 잠금을 유지하며 드래그 후 새 지점이 추가되지 않는다. Before4/After12장, PC 마우스/모바일 touch 및 기존 등록16장 회귀 PASS. 미리보기 마커 쌓임 순서 수정 후 독립 시각 검토 PASS. 모델23/23·타입·Lint·격리 빌드 PASS.

- 최신 후속 보완: 단독 도착점은 바로 이동하고 공유 도착점은 영향 공략 수를 확인한 뒤 ‘도착점 수정’으로 활성화한다. 저장 성공 시 같은 종류·맵·도착점 ID의 좌표만 함께 반영하며 취소는 도착 좌표만 복구한다. 선택 상자 화살표를 오른쪽 테두리에서 12px 안쪽으로 배치하고 글자 공간 36px을 확보했다. 안내/오류 제거로 드래그 중 지도가 이동하는 결함도 수정했다. Before4/After14장·기존 등록16장/드래그12장 회귀·모델30개·타입/Lint/빌드 PASS. 독립 코드/시각 검토 PASS. 미커밋·사용자 검토 대기.

- PR 제출 승인: 기존 dev c0a876d로 원격 codex/frontend-rework를 fast-forward 동기화하고, FE-037만 커밋·푸시해 프론트 통합 브랜치 대상 PR을 제출한다. 구현 범위/최신 QA 재확인 PASS, 병합은 사용자가 수행한다.

## 2026-10-04 — TASK-FE-036

- PR #38 병합 dev e1a3288에서 codex/dev-design-alignment를 분기했다. 동료 추가 변경은 프론트/문서/프론트 설정이며 백엔드 변경은 없다.
- Insights의 개별 색상/제목/안내/탭/버튼을 기존 테마 변수로 연결하고 최종 상단 메뉴를 Lineups/Smokes/Insights 순서로 확정했다. 분석 내용·수치·정책·데이터 동작은 유지했다.
- 타입/Lint/임시 폴더 빌드 PASS. Playwright Before/After 각21장, 한영·1440/390·3탭·키보드·모바일 이동 PASS, 실행 오류0/가로 넘침0. 기존4화면8쌍의 헤더 아래 픽셀 동일. 독립 코드·시각 검토 PASS.
- 후속 폭 피드백: Insights만 공통1440px 외곽 컨테이너·모바일 여백에 맞췄다. 4화면 폭 및 기존 안내/기록 없음6조건 회귀, 추가 Before/After 각10장·타입/Lint/빌드 PASS.
- 관리자 읽기 전용 조사: 라인업은 편집기+Mongo 저장 존재, 스모크는 예시만 있음. 자료 URL과 시작/도착/경로 등록은 후속 저장 계약·관리자 Task로 진행한다.
- 사용자 요청으로 More의 중복 Insights 제거. 메뉴 Before/After 각12장·20조건 및 최종 전체 회귀21장·타입/Lint/빌드·독립 리뷰 PASS. dev 대상 PR 제출 준비 완료, 병합은 사람이 수행한다. [Task](tasks/TASK-FE-036.md), [Visual QA](visual-qa/TASK-FE-036.md).

## 2026-09-29 — TASK-FE-035
- Insights 예시 분석 리포트 및 영문 신청 목표 추가. 로컬 검증 완료, 미커밋/미배포. [Task](tasks/TASK-FE-035.md). 실제 모델 학습은 별도 작업.

## 개인정보 안내 보완 공개 결과 — 2026-09-29
- Status: IMPLEMENTED / DEPLOYED
- Human Decision Required: YES — 정책의 국외 이전 법적 요건 최종 판단. 이번 공개 배포는 승인대로 완료.
- 구현 a5787a9; PR32 병합 dev6523cbc; PR33 병합 main8970129.
- PR32·33 Frontend/Backend/Deployment config/Vercel 검사 모두 PASS.
- Production dpl_VPPsLPQQBsQUJNv2JLqTnhzZYXh6 READY, main8970129, aliasError null. 빌드 약55초.
- www.game-probe.com/privacy HTTPS200; game-probe.com/privacy HTTPS308→www. 공개정책/약관8화면(1440/390·한영) PASS, 페이지오류0,넘침0, 요청origin은 www만 관측. 결과 /tmp/gameprobe-policy-public-qa/after.json.
- 로컬 tsc/lint/build·동의5테스트 PASS; 정책Before8/After8 및 전체데모44검사 PASS. 변경 범위는 고지 문구와 검증/문서.
- 공개 내용: 문의 해결 후30일 내 운영자 수동 영구삭제, Vercel 확인 설정, Vercel/Google 국외 처리 설명·공식 링크, 운영자 삭제와 제공자 백업 삭제의 구분.
- 법적 검토 완료/모든 국외 이전 요건 충족을 주장하지 않음. 초안 표시 유지. Hobby DPA 적용 주장·유료변경·Riot 신청 제출 없음.
- 관측 한계: 브라우저 실행오류 검사는 통과했지만 배포 후 플랫폼 전체 오류로그를 전수 감사한 것은 아님. Drains 없음(직전 계정 확인).

## 2026-09-29 — 로그인 후 운영 사실 및 문의 방침 반영
- Status: IMPLEMENTED (이번 보완 범위)
- Human Decision Required: YES — 정책 최종 검토·재배포 결정. 로그인과 문의30일 방침은 확인 완료이므로 재요청하지 않음.
- 대화 내 브라우저에서 Vercel Hobby, Web Analytics 비활성, Drains 미등록, Speed Insights 설치안내/이벤트 없음, 실제 요청 로그 확인. 설정 변경 없음. Chrome은 향후 Jhshin.dev 프로필만 사용.
- 한영 개인정보 페이지: 문의 해결 후30일 이내 수동 삭제·Gmail 휴지통 영구삭제·다운로드 사본 삭제 반영. Hobby 런타임 로그1시간과 플랫폼 전체 파기의 차이 설명.
- 남은 문제: 외부 서비스 국외 처리 상세 고지·적용 조건 최종 검토. 최신 정책은 로컬 수정본, 재배포·Riot 제출 미실행.
- 실행 검증: `npx tsc --noEmit`, `npm run lint`, `npm run build` PASS; `node src/features/account-connection/consentDemo.test.cjs` 5/5 PASS (frontend에서 실행).
- `PLAYWRIGHT_MODULE=…/node_modules/playwright node docs/visual-qa/assets/TASK-FE-034/policy/verify.cjs before` 및 `after`: 각각8화면, 한영·1440/390·privacy/terms PASS; 페이지오류0, 가로넘침0, 요청 origin은 localhost만 확인.
- `git diff --check` PASS. 로컬 서버3100 최신 빌드로 재시작. 최초 일반 권한 종료는 거부되어 권한을 갖춰 해당 미리보기 PID만 종료 후 성공.

## 2026-09-29 — TASK-FE-034 운영 정보 확정 반영
- ShinJungho/정상 수신 문의메일/한국 중심 한영 무료 데모를 정책·푸터·신청서 반영.
- 타입/lint/build/동의5테스트/브라우저44그룹/문의16검사 PASS.
- 문의 보관안·Vercel 로그인/운영 설정·최종 정책/공개 결정 남음. 커밋·푸시·배포 없음.

이 문서는 프로젝트 진행 상황을 시간순으로 기록한다.

과거 항목은 당시의 구현·검증 이력이다. 2026-10-02 저장소 구성 정리에 따라 폐기된 DB 전용
파일·실행 명령·선택 지침은 제거했다. 과거 검증 결과를 현재 MongoDB 구성의 결과로 해석하지 않는다.

---

## 2026-10-04

### TASK-BE-001 — PR 전 보완 및 백엔드 통합 브랜치 준비

- 사용자 요청에 따라 Kotlin과 현재 패키지 구성을 유지하고 MongoDB 전환을 PR로 마무리한다.
- 최신 프론트 통합 버전 `53a0542`에서 백엔드 통합 브랜치 `codex/backend`를 생성했다. 이번 작업은 `codex/mongodb-storage`에서 PR로 제출하며, 이후 검토된 백엔드 변경을 `dev`에 통합한다. 병합은 사람이 수행한다.
- 불필요한 테스트 프로필을 제거하고 수정/상태 변경 중 삭제된 자료를 404로 반환한다. 두 회귀 테스트를 추가했다.
- 실 MongoDB 테스트 25개, 실행 파일 빌드, 기본/인증 DB 배포 설정의 실제 HTTP 흐름과 재시작 후 자료 보존, 패키지 및 설정 검사 PASS. 독립 코드 검토 PASS. 프론트 변경·실제 배포 없음.
- 관련 문서: [Task](tasks/TASK-BE-001.md), [백엔드 계획](backend/PLAN.md). 패키지·DTO·Repository 구조 정리는 후속 검토로 남긴다.

## 2026-10-02

### TASK-BE-001 — MongoDB 단일 저장소 구성

- 사용자의 최신 요청에 따라 라인업 영구 저장을 MongoDB 하나로 통일한다. `81f5288` 기준
  `codex/mongodb-storage` 브랜치의 기본 작업 공간에서 진행하며, 이전 시연 초안은 별도 보관했다.
- LineupRepository 인터페이스와 Mongo 구현을 유지하고, 폐기된 저장 구현·연결 설정·프로필·의존성·전용 테스트를 제거했다.
  API·서비스·DTO·인증·프론트는 유지했다.
- 공식 Mongo 7.0 로컬 Compose의 loopback 접근·별도 데이터 볼륨·healthcheck 구성을 유지한다.
- 별도 소형 서버용 Mongo Compose·앱 계정 초기화·비밀 파일 마운트·자원 제한과 SSH/사설망 접속 안내를 유지한다.
- 2026-09-29에는 Mongo 저장·인증/권한 거절·컨테이너 재생성 후 자료 보존·앱 계정의 백엔드 CRUD 연결을
  로컬 임시 구성에서 검증했다. 현재 단일 저장소에서도 실제 Mongo 테스트 23개·빌드, 기본/railway 실행 파일의 API·인증·재시작 조회 검증을 통과했다.
- 검증은 새 임시 컨테이너와 테스트 전용 DB에서 수행한다. 기존 사용자 DB·볼륨이나 배포 서버는 건드리지 않는다.
- [Task](tasks/TASK-BE-001.md), [로컬 실행 안내](backend/MONGODB.md)에 현재 범위와 설정을 반영한다.
  상태 IMPLEMENTED, 사람 검토 대기. 커밋·푸시·배포 없음. Java 전환과 자동 데이터 이전은 제외했다.

- 2026-10-02 최종 검증: 실행 패키지·runtimeClasspath에서 폐기된 저장 의존성 미포함, 저장소 참조 잔존 0건.
  CI Mongo 서비스와 검증 스크립트 준비/정리 경로를 구성하고 로컬 함수 실행 검증을 통과했다.
  전체 테스트 23개/실패·오류·제외 0. 기존 프론트는 변경하지 않았으며 임시 DB와 비밀 파일은 정리했다.
  최종 상태 IMPLEMENTED, 사람 검토 대기.

## 2026-09-28

### TASK-FE-034 — Riot 신청 준비 마감

- 사용자 요청: 운영 정보·공개 데모·신청 설명의 세 준비 영역 중 사람이 결정할 사항을 제외하고 완료 후 일괄 의사 결정 요청.
- origin/dev `6249e14`에서 `codex/riot-submission-readiness` 생성. 커밋·푸시·실제 배포/신청은 미실행.
- 합성 단독 경기 상세에 공통 고지/정책/문의 푸터 추가. 기존 본문 레이아웃/데이터 보존.
- 공개 라인업 조회의 암묵적 localhost:8080 기본값 제거. BACKEND_URL 미설정 시 기존 예시/오류 흐름 사용, 설정된 API 계약/관리자 인증은 보존.
- frontend/.env.example 및 README 정합성 보완. 기존 GP 자체 SVG 아이콘 추가로 favicon 404 해소.
- TypeScript/Lint/build(정적13개)/동의5테스트/공개API설정 경계 검사 PASS.
- Playwright Before52/After60+푸터4장, PC/모바일·한영 44검사 그룹 PASS. 실행 예외/콘솔 오류/API요청0, 이동 취소된 RSC prefetch는 기록에서 별도 구분.
- 시각52쌍: 48쌍 동일, 경기4쌍은 기존 높이까지 픽셀 동일하고 푸터만 확장. 이미지 직접 검토 및 자동 보고서 완료.
- Vercel 조회: 기존 공개 main189c1eb는 READY, 최신 dev6249e14는 BLOCKED(team configuration 안내). 공개7경로HTTP200이나 연결 안내는 구버전, dev별칭은 Vercel 로그인 필요.
- [신청 자료](riot-submission/README.md)에 영문 문안·심사 동선·배포 절차·소유자 결정표 작성. 실제 문의처·운영/보관 사실·정책 최종 승인·배포 계정 확인과 공개 승인이 남음.
- [Task](tasks/TASK-FE-034.md), [Visual QA](visual-qa/TASK-FE-034.md) 참조. 상태 IMPLEMENTED(준비 범위), Human Decision Required: YES.


## 2026-09-26

### TASK-FE-033 — 공통 고지·약관·개인정보 안내 정리

- PR #27 병합 87119c0을 codex/frontend-rework에 pull 후 codex/service-notices에서 작업했다.
- 푸터의 Riot 비보증·권리 고지와 한영 정책/문의 링크를 정리했다. example@example.com을 공통 설정 한 곳에 두고 세 사용처에서 예시·미접수로 표시하며 mailto를 만들지 않았다.
- 개인정보 안내에 언어/프로필 저장의 브라우저 설정, 동의 체험 초기화, 실제 연결 해제·공개 중단·삭제와의 차이를 반영했다. 호스팅 로그/운영자/보관 정책은 미확정 상태로 남겼다.
- 약관에 전적 데모와 라인업/스모크 탐색 범위를 반영했다. 기능·저장·API·백엔드·인증/인가·이미지는 변경하지 않았다.
- Playwright Before/After 각 22장, 한영 정책 12조건·공통 푸터 6조건·동의/철회 2조건, 상단 회귀 4쌍 PASS. TypeScript/Lint/build(정적 12페이지)/diff 및 독립 코드·시각 검토 PASS.
- 개발 서버 복원 후 문의 링크 키보드 이동과 예시 비링크 재확인 PASS. [Task](tasks/TASK-FE-033.md), [Visual QA](visual-qa/TASK-FE-033.md)에 결과/한계 기록.
- 2026-09-27 사용자 확인 후 커밋·푸시 및 codex/frontend-rework 대상 PR 제출 승인. 병합은 사용자가 수행한다. 실제 문의 이메일·운영 정보·배포 설정 확인과 제출용 데모 최종 점검은 남아 있다.
- 공통 푸터 적용 범위를 읽기 전용으로 확인했다. 새 데이터 단독 경기 상세의 푸터 연결은 후속 검토로 남기고 이번 안내 정리를 마무리한다.

## 2026-09-25

### TASK-FE-032 — 계정 연결·공개 동의 데모

- 최신 codex/frontend-rework adfbc3e에서 codex/account-consent-demo를 분기하고 Task를 작성한 뒤 구현했다.
- /connect에 연결 설명·공개 범위·체크박스 동의/취소·합성 프로필 요약·철회 후 비공개 체험을 추가했다.
- 기존 Mock 공급자의 4경기·3승1패·K/D/A65/56/23을 재사용한다. 동의 전/취소/철회 후에는 요약을 마운트하지 않고 재동의가 필요하다.
- 실제 인증/공개/삭제가 아닌 체험임을 안내하고 새로고침·페이지 이탈 시 초기화한다. 기존 홈/데모/경기 경로·API/백엔드·이미지는 변경하지 않았다.
- 상태 테스트5개, 타입/Lint/build(정적12페이지), Playwright Before9/After33·한영6조건, 데모3화면 PNG 동일, 독립 코드·시각 검토 PASS.
- 개발 서버 복원 후 1440/390px HTTP200·동의/철회 재확인 PASS. [Task](tasks/TASK-FE-032.md), [Visual QA](visual-qa/TASK-FE-032.md)에 범위·결과 기록.
- 2026-09-26 사용자 화면 확인 완료 및 codex/frontend-rework 대상 커밋·푸시·PR 제출 승인. 고지/정책 문서와 신청 안내 작업은 시작하지 않았다.


### TASK-FE-031 — 단독 경기 상세 화면의 공통 메뉴 보완

- PR #24 병합 `6f3e131`을 통합 브랜치에 pull 후 `codex/standalone-match-navigation`에서 진행했다.
- 새 데이터 데모의 단독 경기 화면에 기존 StatsHeader와 공통 메뉴를 연결했다. Overview는 기존 디자인 데모, 복귀/닫기는 새 데이터 데모 경로를 유지한다.
- 제품 소스는 SyntheticMatchPage.tsx 한 파일만 변경했다. 경기 패널·모달·프로필 하단 메뉴·데이터·이미지·관리자·백엔드는 보존했다.
- Before/After8쌍+하단 접근1장, 3개 화면 폭·5탭 데이터 대조, 새 탭/메뉴/언어/More Escape·초점/복귀 동작 PASS. 기존 모달·오류·구 경기 PNG4쌍 동일.
- TypeScript/Lint/production build(정적12페이지)/diff 및 독립 코드·시각 리뷰 PASS. 개발 서버 복원 완료.
- [Task](tasks/TASK-FE-031.md), [Visual QA](visual-qa/TASK-FE-031.md)에 결과 기록. 사용자 요청으로 커밋·푸시 및 codex/frontend-rework 대상 PR을 제출한다. 병합은 사용자가 수행한다.

## 2026-09-24

### TASK-FE-030 — 상세·관리자·오류 화면 공통 테마 보완

- PR #23 병합 76adc9e를 통합 브랜치에 pull 후 codex/remaining-page-theme에서 진행했다.
- 라인업 상세/로딩/실패, 구 경기 상세, 관리자 로그인/목록/신규/수정, 기본404를 공통 테마로 연결하고 SupportPage의 Smokes 누락을 수정했다.
- 라인업 난이도 배지가 화면 우상단에 붙던 문제와 모바일 스킬명 겹침, 관리자 수정 첫 진입 hydration 오류를 보완했다. 인증 정책·API·데이터·좌표/영상/저장 로직은 유지한다.
- Before/After38쌍+추가13장, 라인업230·관리자215검사·경기414필드 대조·공통메뉴28조건 PASS. 원본/API/테마17파일 동일, 홈·프로필PNG 동일.
- TypeScript/Lint/production build(정적12페이지)/diff 및 서버 복원 후 8경로·언어표시 PASS. 관리자 API41요청은 전부 테스트 응답으로 처리했다.
- [Task](tasks/TASK-FE-030.md), [Visual QA](visual-qa/TASK-FE-030.md)에 변경과 검증 제한 기록. 사용자 요청으로 커밋·푸시 및 `codex/frontend-rework` 대상 PR 제출을 진행한다. 병합은 사용자가 수행하며 프로필 배너 하단 메뉴·새 데이터 단독 경기 메뉴 변경은 후속 범위다.

### TASK-FE-029 — 라인업·스모크 상태 안내 정리

- PR #22 병합 c469a68을 통합 브랜치에 pull 후 codex/strategy-status-messages를 생성했다.
- 상단 자료 상태와 탐색 안내를 status.ts에서 관리한다. 로딩/공개 자료/공개0건/연결 실패 후 예시를 구별하고 원시 오류를 사용자용 문구로 바꿨다.
- 맵 안의 원본0건/필터0건/요원 미선택/위치 누락 안내를 추가하고, 스모크0건일 때 선택을 요구하는 문구를 제거했다. 예시·패치 검증 전 의미와 기존 값은 유지한다.
- 필터/state/지도/좌표/회전/데이터·API 동작 보존. 독립 검토에서 경로 없는 자료에 맞지 않는 안내를 찾아 시작 위치 안내로 보완했다.
- Before/After29쌍+추가4장, 상태168·동작262·누락경계4검사 PASS. 29조건 핀/경로/회전/링크/메뉴 동일, 홈·프로필1440 변경픽셀0. 브라우저 예외·예상 밖 오류0.
- TypeScript/Lint/production build(정적12페이지)/diff PASS. API·데이터·공통 헤더 등13파일 byte 동일. 개발 서버 복원 후 네 모바일 경로HTTP200·안내 확인 PASS.
- [Task](tasks/TASK-FE-029.md), [Visual QA](visual-qa/TASK-FE-029.md)에 상세 결과 기록. 상태 IMPLEMENTED, 사용자 요청에 따라 커밋·푸시 및 codex/frontend-rework 대상 PR 제출을 진행한다. 병합은 사용자가 수행하며, 디자인 미적용 페이지 점검·보완은 후속 Task로 남긴다.

### TASK-FE-028 — 공통 메뉴 구성 통일

- PR #21 병합 `df4d078`을 `codex/frontend-rework`에 pull 후 `codex/shared-navigation`을 생성했다.
- 공통 메뉴 주소·문구·Lineups→Smokes 순서를 `features/stats-shell/navigation.ts`에 모으고 홈·프로필·라인업·스모크에서 사용한다. 프로필은 Home과 전적 6탭 다음에 전술 링크 두 개가 이어진다.
- 현재 메뉴를 공통 밑줄과 `aria-current`로 표시한다. 모바일에서 숨기던 전적 버튼을 메뉴 가로 스크롤로 접근하게 하고 프로필 More의 Escape/초점 복원을 보완했다.
- 본문·상태 훅·필터·API·데이터·전역 CSS·운영 의존성을 변경하지 않았다.
- Before/After 12쌍 및 키보드 6장, 기능 498검사/15조건·30개 초점 배치 확인 PASS. 문서 가로 넘침/브라우저 오류 0, 프로필 본문 3개 폭 변경 픽셀 0.
- TypeScript·Lint·production build(정적 12페이지)·소스 보존 9개·diff 검사 PASS. 개발 서버 복원 후 네 모바일 경로 HTTP 200 및 메뉴 확인 PASS.
- 자세한 범위·제한은 [Task](tasks/TASK-FE-028.md), 화면과 근거는 [Visual QA](visual-qa/TASK-FE-028.md)에 기록했다. 상태 IMPLEMENTED, 사용자 화면 확인 완료. 명시적 요청에 따라 commit/push 및 `codex/frontend-rework` 대상 PR 제출을 진행하며, 병합은 사용자가 수행한다.

### TASK-FE-027 — 라인업·스모크 공통 테마 연결

- `codex/frontend-rework`와 `origin/dev`가 `f3efedf`로 같고 미해결 충돌·작업 파일 변경이 없음을 확인한 후 `codex/lineup-smoke-theme`를 생성했다.
- `/lineups`·`/smokes`에 기존 홈 StatsShell/StatsHeader/StatsFooter를 재사용하고, 두 탐색 화면 전용 CSS에 맵 카드·필터·지도 주변·스모크 비교표/가이드 스타일을 모았다.
- 보조 글자 12px 이상·일반 조작 14px 기준, 어두운 테마와 버튼 선택·초점 표시, PC/태블릿/모바일 배치를 적용했다.
- 두 필터 소스·API 호출/상태·Preview 좌표·데이터·globals.css·공통 헤더 소스는 변경하지 않았다. 표시 경로는 이미지 위/핀 아래로 정리했다.
- Playwright Before/After 14쌍, 기능 262검사, 후속 배치 32검사·최종 초점 18검사 PASS. 홈/프로필 1440px 변경 픽셀 0, 6개 선택 상태의 좌표/경로/회전 동일.
- TypeScript, Lint, production build(정적 12페이지), diff 공백 검증 통과. 개발 서버 복원.
- 변경 목록/실행 명령/제한은 [Task](tasks/TASK-FE-027.md), 화면 비교는 [Visual QA](visual-qa/TASK-FE-027.md)에 기록했다.
- 상태 IMPLEMENTED, 검증 완료·PR 제출 및 사용자 병합 검토. 후속 사용자 요청으로 commit/push/PR을 진행하며 대상은 `codex/frontend-rework`다. 추가 작업 후 `dev`에 모아서 반영하고 병합은 사용자가 수행한다.
- 원격 `codex/frontend-rework`는 `3418943`로 구현 기준 `f3efedf`보다 6개 커밋 뒤에 있어, 이번 PR에는 기존 dev의 라인업·스모크 변경도 함께 포함된다. FE-027 자체의 제품 변경은 두 페이지와 신규 공통 셸 TSX/CSS 4파일이다.

## 2026-09-22

### TASK-FE-026_SMOKE_PAGE 완료 — Smoke 전용 가이드 페이지

- `/smokes`에 기존 `/lineups`와 같은 맵 우선 진입 흐름을 추가했습니다.
- 맵 선택 후 공격/수비, 사이트, 연막 유형을 필터링할 수 있으며 컨트롤러 선택은 제거했습니다.
- 좌측에 Omen·Brimstone·Astra·Clove·Harbor·Miks 6명의 공통 연막 크기·지속시간 비교표를 표시합니다.
- 모든 맵에서 `모든 연막 (바이퍼 제외)`과 Harbor 일자 연막만 선택할 수 있으며, Viper 전용 라인업은 기존 `/lineups`로 분류했습니다.
- `/lineups`와 `/smokes` 상세 화면의 맵 필터를 선택 맵 컨셉 아트·이름 버튼으로 통일했으며, 버튼을 누르면 같은 화면에서 12개 맵 목록을 펼쳐 맵을 변경할 수 있습니다.
- 두 상세 전술 지도 뒤의 컨셉 아트 배경은 제거하고 전술 맵 이미지만 표시하도록 정리했습니다.
- 라인업 요원 선택 아이콘은 로컬 원본을 즉시 로드하도록 수정해 빈 슬롯을 제거했고, 공격 90°·수비 270° 맵 회전 규칙을 복구했습니다.
- 연막 도착 아이콘을 누르기 전에는 경로를 숨기고, 선택 후 투척 위치·방향선·설치 단계가 표시됩니다.
- 기존 로컬 맵·요원·스킬 자산만 재사용했으며 백엔드 API와 DB 스키마는 변경하지 않았습니다.
- 헤더에 `/smokes` 이동 메뉴를 추가했습니다.
- `tsc`, `lint`, `build`와 데스크톱/390px 모바일 브라우저 검증을 통과했습니다.
- 현재 좌표와 설명은 Preview 예시이며, 실제 패치별 검증은 후속 범위입니다.

**변경된 파일**:

- `frontend/src/app/smokes/page.tsx`
- `frontend/src/components/SmokeSearchFilter.tsx`
- `frontend/src/components/LineupSearchFilter.tsx`
- `frontend/src/lib/smoke-data.ts`
- `frontend/src/types/smoke.ts`
- `frontend/src/components/SiteHeader.tsx`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-FE-026_SMOKE_PAGE.md`
- `docs/visual-qa/TASK-FE-026_SMOKE_PAGE.md`
- `screenshots/smokes-before.png`
- `screenshots/smokes-after-desktop.png`
- `screenshots/smokes-after-mobile.png`
- `screenshots/lineups-after-desktop.png`
- `screenshots/lineups-after-mobile.png`


## 2026-09-21

### TASK-FE-025 — 보조 화면·공통 버튼·안내·탭 사이드바 일관성 정리

- PR #17 병합본 `36faaba`를 `codex/frontend-rework`에 반영한 뒤 `codex/support-page-theme`에서 작업했다.
- 연결·개인정보·약관 및 플레이어/기존·합성 경기 없음에 공통 StatsShell/Header/Footer를 적용했다.
  SupportPage는 문서용 폭·여백·제목28px을, MissingRecordPage는 안내·복귀 링크를 공유한다.
- 보조 페이지 Search는 홈 검색창으로 이동하고, Overview/일반 기록 없음은 기존 디자인 데모, 합성 경기 없음은 새 데이터 데모를 연다.
- 1차 보조 화면 작업은 법적·연결 본문과 disabled 상태, 정상 홈·프로필·경기 상세를 보존했다. 라인업/백엔드/전역 CSS 변경은 없다.
- 1차 타입·Lint·빌드 PASS. Before49/After181 브라우저 검사,40캡처, 회귀8쌍 DOM/스타일/좌표 및 PNG 픽셀 완전 일치.
  서버 복원 후 보조12경로·실제 복귀8동작·브라우저 오류0도 확인했다.
- 변경 파일 및 실제 검증 명령은 [Task 결과](tasks/TASK-FE-025.md), 비교 화면은 [Visual QA](visual-qa/TASK-FE-025.md)에 기록했다.
- 사용자 승인으로 1차를 `2018b08`에 커밋하고 같은 Task/브랜치에서 버튼·안내·사이드바까지 확장했다.
- 주요 행동 버튼의 기본/hover/글자 색을 THEME에 모았다. 저장 완료·비활성·필터·승패 색은 보존했다.
- 반복 안내는 `stats-shell/copy.ts`에 모으고 홈·프로필·보조 화면의 설명/피드백을 한국어로 정리했다.
  정책 문서의 개발 번호·예전 서비스명을 정리하되 초안/법률 검토·비제휴·실제 데이터 미연결 의미는 유지한다.
- Agents/Maps/Weapons는 랭크와 Overview 복귀만 남겨 PC 기준 페이지 전체 높이를 약1,400px 줄였다.
  Overview/Matches/Performance 전체 사이드바와 수치·필터·데모 진입 경로는 유지한다.
- 확장 TypeScript/Lint/build·기존 데이터6검사 PASS. 1440/820/390px Before164/After593검사·78캡처,
  PC/모바일 실제 동작104검사와 오류/빈/부분 상태·기본 복귀 PASS. 브라우저 오류0, 독립 소스 검토에서 결함 없음.
- 확장분은 검증 후 두 번째 로컬 커밋으로 남긴다. 사용자 화면 검토 대기이며 push/PR/merge는 이번에 수행하지 않는다.

### TASK-FE-025 추가 — 한국어·영어 전환

- 앞선 보조 화면·디자인 정리는 `2018b08`, `0a2c08b` 두 로컬 커밋으로 보존했다.
- 사용자 요청으로 공통 헤더에 EN/한국어 전환 버튼을 추가했다. 홈 소개·분석 예시·프로필 안내/알림·연결/정책/기록 없음의 영어 문구를 제공한다.
- `stats-shell/locale.tsx`에서 표시 언어를 공유하고 `gameprobe:locale`에 선택을 저장한다. 서버 첫 출력은 한국어, 브라우저에서 저장값을 동기화한다. 저장 차단 시 현재 방문은 메모리로 유지한다.
- 탭·필터·저장·선택 경기와 열린 상세 탭을 보존한다. 알림은 동작 코드로 보관해 현재 언어로 표시하고 만료 시간은 늘리지 않는다.
- 독립 검토에서 구독자가 없는 동안의 다른 탭 변경을 놓치는 경우를 발견해 첫 재구독 때 저장값을 읽도록 보완했다. 저장 실패 시 메모리 선택을 덮지 않는 것도 검증했다.
- Before38/After94·36캡처, 상태215·64반응형 조건, 저장소22, 기존 동작104검사 PASS. 타입/Lint/최종빌드·서버 복원8검사 PASS, 브라우저 오류0.
- 메뉴·게임/통계명·기존 영문 상세5탭은 유지하고 라인업/관리자/데이터/인증/이미지/전역 CSS/의존성 변경은 없다. 정책은 기존 초안의 의미를 번역만 했다.
- 이번 언어 추가분은 미커밋 상태로 사용자 검토를 기다린다. 새 commit/push/PR/merge는 수행하지 않았다.

### TASK-FE-025 추가 — Language 목록

- 사용자 요청으로 상단 토글을 Language 박스와 한국어·English 선택 목록으로 변경했다. 코드·표시 이름은 locale.tsx의 supportedLanguages에 모았다.
- hover/클릭/터치·키보드 이동/선택·Escape·바깥 클릭/Tab 닫기와 선택 체크 표시를 지원한다. 외부 입력에 초점을 둔 hover 메뉴의 Escape도 보완했다.
- 320/390/820/1440px에서24레이아웃·메뉴 상태205검사, Before20/After32검사·18캡처, 저장소22검사 PASS. 타입/Lint/최종빌드와 개발 서버 복원8검사 PASS, 브라우저 오류0.
- 언어 목록을 늘릴 때는 문구 번역도 함께 추가해야 한다. 기존 저장·번역·데이터 상태와 앞선2커밋을 보존했다. 새 커밋/푸시/PR/병합 없이 사용자 화면 검토 대기.

### TASK-FE-025 — PR 제출 승인

- 사용자가 현재 상태의 커밋·푸시·PR 작성을 요청했다. 앞선 두 구현 커밋에 언어 선택 추가분을 별도 커밋으로 더해 `codex/frontend-rework`로 제출한다.
- 검증된 제품 코드는 추가 수정하지 않는다. 번역할 문구의 범위는 동료 논의 후 조정할 수 있도록 PR에 현재 범위와 제한을 설명한다. 병합은 사용자에게 맡긴다.

### TASK-FE-024 — API 기반 Mock를 기존 데모 화면에 연결

- PR #16 병합본 `8d204e8`을 기준으로 `codex/api-mock-ui`에서 구현했다.
- 홈의 명시적 새 데이터 데모 링크 → DemoPlayer01 프로필 → 경기 상세/직접 링크가 동일 합성4경기를 사용한다.
  요약65/56/23·3승1패, 요원/맵/무기/승패 필터와 상세10인·89라운드를 교차 검사했다.
- 기존 컴포넌트와 공통 스타일을 재사용했다. 홈 전체 분리는 진행하지 않고 필요한 provider·표시 변환·상세 변환·조회 훅만 추가했다.
- 실제0과 미제공을 구별해 현재 RR/KAST/Probe Score/무기별HS·좌표 등을 임의로 채우지 않는다.
  독립 검토에서 동일 표시 이름의 집계 충돌과 빈 데이터 비율0 표시를 발견해 ID 집계/null 표시로 보완했다.
- 로딩/빈/부분/오류/재시도, 요청 취소·늦은 응답 무시를 검증했다. 기존 데모 경로와 인라인 표시 모드를 보존했다.
- 데이터14·표시 변환6 테스트, 상세 변환·기존 회귀, TypeScript/Lint/build PASS.
  데스크톱·모바일14동작그룹과 추가 빈 상태·인라인·실제 React 훅 검사 PASS.
  [Visual QA](visual-qa/TASK-FE-024.md)에 Before6/After31 캡처와 제한을 기록했다.
- 실제 Riot API/RSO·백엔드·라인업·새 이미지·운영 의존성은 범위 밖이다. 현재 데모 검색은 실제 계정 검색이 아니다.
- 사용자 보완으로 홈에 새 데이터 데모/기존 디자인 데모 링크를 함께 노출하고 미검색 안내를 명확히 했다.
  두 화면 크기의 링크 이동 검사와 추가 Before/After4장을 기록했다.
- PR 전 사용자 요청으로 홈 프로필 카드도 새/기존 데모 두 개로 표시하고 5개 화면 폭에서 이동·겹침을 검사했다.
- 병합 전 사용자 요청으로 기본 데모 보기·Overview·일반 프로필 소개는 기존 IED agent 화면으로 복원했다. 새 데이터는 명시적 링크/카드 선택으로만 연다.
- 구현·검증 완료. 사용자 요청에 따라 TASK-FE-024를 커밋·푸시해 `codex/frontend-rework` 대상 PR로 전달한다. 병합은 사용자가 진행한다.

## 2026-09-20

### TASK-FE-023 — API 기반 합성 Mock와 변환·집계 구현

- PR #15 병합본 `a7019f8`을 `codex/frontend-rework`에 pull하고 `codex/api-mock-data` 생성.
- Task와 HANDOFF 범위를 먼저 작성한 뒤 새 `tracker-profile/data/`에 소비 DTO, 합성 4경기,
  입력 검사·조회 선수 변환·공통 지표·목록/상세 연결을 구현했다. 사용처와 분모/누락 조건을 주석과 README에 기록했다.
- 4경기·89라운드·각10명 기록에서 65/56/23, 3승1패, Jett42/32/11을 교차 확인했다.
  앱 메타데이터와 원본 응답 필드를 구별하고 현재 RR/KAST/무기 HS는 임의 계산하지 않는다.
- 독립 검토의 참가자/라운드 누락과 조회 범위 밖 충돌 문제를 보완하고 회귀 검사를 추가했다.
- 새 데이터14테스트·기존 Mock 검사·TypeScript·Lint 통과. 실제 API 호출은 하지 않았다.
  초기 타입 검사의 ES5 iterator 호환 오류는 Array.from으로 수정했다. Docker는 승인된 접근으로 검사했다.
- 기존 화면/Mock/자산/라인업/백엔드/의존성 변경 없음. 전체 실 API 호환 또는 신청 데모 완성을 의미하지 않는다.
  공급자와 화면 연결, 미포함 상세 필드·운영 예외는 후속 Task. 사용자 요청에 따라 커밋·푸시하고
  `codex/frontend-rework` 대상 PR로 전달한다. 병합은 사용자가 진행한다.

### TASK-FE-022 — 화면 데이터 대응표와 API 기반 Mock 설계

- PR #14 병합본 `660c6cd`로 통합 브랜치를 갱신하고 `codex/api-mock-design`으로 분기했다.
  안정본을 원격 dev에 먼저 반영하라는 사용자 설명에 따라 강제 push 없이 `06076ca → 660c6cd`로 올렸다.
  추가 dev 업데이트 확인은 사용자의 후속 지시로 설계 진행과 분리했다. dev 업데이트에는 설계 파일을 포함하지 않았다.
- [화면 데이터 대응표](frontend/API-DATA-MAP.md): 홈·프로필·사이드바·목록27영역과 상세5탭을
  직접 응답/계산/콘텐츠/앱 자체/미확인으로 분류했다. 현재 RR·최고 랭크·무기별 HS·KAST·Probe Score의 한계를 구분했다.
- [API 기반 Mock 설계](frontend/API-MOCK-DESIGN.md): 공식 응답 형태의 합성 표본→검사·변환→공통 집계→화면 경계,
  원본4경기의 기대 합계·12시나리오·누락/0/부분조회·데모/RSO의 차이와 단계별 구현 기준을 작성했다.
- 독립 문서 검토에서 분모0, 캐시 요약만 남는 경우, 동일 목록 중복과 내용 충돌, 서버 위치 후보/확정 구분을 보완했다.
- 문서 검사 PASS: 화면 ID27개·상세5탭·시나리오12개·JSON 예시·표본 합계 및 상대 링크.
  최초 검사는 기존 로그의 file URL을 상대 경로로 잘못 분류하여 실패했고 URI 분류를 수정했다. 제품 테스트나 문서 링크를 삭제하지 않았다.
  `git diff --check` PASS, 제품 소스 변경0. 상세 결과는 Task에 기록했다.
- 기존 Mock·화면·이미지·라인업·API 연결은 변경하지 않았다. 문서 설계 완료·사람 검토 대기이며,
  실제 원본 fixture와 변환·집계 구현은 별도 Task로 지정한다. 사용자 요청으로 검증된 문서를 커밋·푸시하고
  `codex/frontend-rework` 대상 PR로 전달한다. 병합은 사용자가 진행한다.

### TASK-FE-021 — 프로필 상태·동작 분리

- PR #13 병합 `45bbd06`을 pull한 뒤 `codex/profile-view-state`로 분기하고 Task를 작성했다.
- 1차 `useProfileViewState`: 탭·필터·경기 선택·목록 표시량·초기화 규칙을 옮겨 `32aefcd`로 커밋했다.
- 사용자 승인으로 C2도 같은 Task에서 완료했다. `useProfileBrowserActions`는 저장·공유·검색 안내·Mock 갱신·알림·메뉴/배너 상태를 맡는다.
  부모는 두 훅을 한 번씩 호출한다. 사용처 주석·수정 위치·상태 소유를 화면 정의서에 반영했다.
- 저장 키와 성공/실패 안내, 3200ms 타이머·같은 문구 유지·cleanup, 선수 ID 변경과 탭 전환 중 상태 수명을 보존했다.
- 최종 전체58상태 동일, 화면30쌍(기존 기준28+통제 재촬영2) 픽셀 차이0. 브라우저18동작그룹·12상태·4쌍 비교 PASS.
  최초 두 화면의 모서리 래스터 차이는 동일 환경의 첫 커밋/최종 코드 재촬영으로 해소했다. 허용치는 그대로다.
- 실제 React 일반/StrictMode 화면 상태30그룹+브라우저 동작10그룹 PASS. Mock/상세Mock/누락SSR·타입·Lint·build·서버 복원·모달 smoke PASS.
- [Visual QA](visual-qa/TASK-FE-021.md)에 1차 근거와 최종 캡처/검증 JSON을 보존했다. CSS·표시값·이미지·홈·라인업은 그대로다.
- 구현·검증 완료. 사용자 승인에 따라 두 커밋을 한 PR로 전달하며 병합은 사용자가 진행한다.
  D 데이터 경계·실제 API·Spring은 후속 Task로 남긴다.

### TASK-FE-020 — 프로필 공통 스타일 정리

- PR #12 병합 `1863a99`를 `codex/frontend-rework`에 pull 받은 뒤 `codex/profile-shared-styles`로 분기하고 Task를 먼저 작성했다.
- `ProfileShared.module.css`에 카드·제목·Select·빈 상태·강조색·표 스크롤·그래프·접근성 이름의 공통10클래스와 반응형을 모았다.
  부모와 자식11개가 공통 CSS를 직접 사용한다. 전용 배치·표·알림·Performance 그래프 높이는 각 CSS에 유지했다.
- 사용처를 한국어 주석과 모듈 분리 문서의 수정 위치 표에 기록했다. 상태·Mock·이미지·홈·라인업·모달 소스는 그대로다.
- 58상태 DOM/계산 스타일/좌표 동일, 최종30쌍 픽셀 차이0, 주요 필터/탭/빈 결과/모달 동작과 반응형20조건 PASS.
- Mock/상세Mock/누락SSR·타입·Lint·build 및 개발 서버 복원·HTTP200 smoke PASS. 독립 코드·PC/모바일 시각 검토에서도 새 문제 없음.
- [Visual QA](visual-qa/TASK-FE-020.md)에 캡처·진단·검증 JSON을 기록했다. 초기 모달 모서리18픽셀 차이는 원본/변경본 통제 재촬영으로 검증하고 비교 허용치를 바꾸지 않았다.
- 구현·검증 완료. 사용자 확인과 PR 요청에 따라 `codex/frontend-rework` 대상 커밋·푸시·PR 전달을 진행한다. 병합은 사용자가 맡으며 다음 상태·동작 분리는 자동 시작하지 않는다.

### TASK-FE-019 — 경기 상세 모달 공통 스타일 정리

- PR #11 병합 `d48aac4`에서 `codex/match-detail-shared-styles`로 분기하고 Task를 먼저 작성했다.
- `MatchDetailShared.module.css`에 모달 범위 색상15개, Performance/Duels의 같은 미제공 안내와 가로 스크롤 규칙을 모았다.
  기존 여섯 모듈 CSS에서 변수와 CSS Module 합성으로 연결하고 한국어 사용처 주석을 추가했다.
- 표 열·배치·글자 크기·반응형과 의미가 다른 같은 색상은 로컬에 남겼다. TSX·데이터·인라인·프로필 전체 스타일은 그대로다.
- Before/After30쌍 픽셀 차이0, 76개 상태의 계산 스타일/좌표 동일. 상세42동작·추가20반응형·미제공 안내2개 CSS 비교 PASS.
- Mock/상세 Mock/누락SSR·타입·Lint·build PASS. 개발 서버 복원·HTTP200 및 모달 재시작 smoke PASS.
- [Visual QA](visual-qa/TASK-FE-019.md)에 캡처60장·검증 JSON을 기록했다. 독립 CSS/시각 검토에서도 새 문제 없음.
  구현 검증 완료. 사용자 요청으로 `codex/frontend-rework` 대상 커밋·푸시·PR 전달을 진행하며 병합은 사용자가 맡는다. 다음 프로필 카드/제목 공통 스타일은 별도 Task다.

### TASK-FE-018 — 경기 상세 연결 복원과 Tracker 스타일 모달

- PR #10 병합 `17da56c`에서 `codex/profile-match-detail-restore`로 분기하고 Task를 작성했다.
- 사용자 승인에 따라 현재 목록 36개를 유지하며 34개 팀 경기 상세 Mock을 보강하고 기존 4탭을 연결했다.
  Deathmatch 2개는 개인 요약과 미제공 안내를 표시한다. 구형 다른 경기 상세를 재지정하지 않는다.
- 상세 연결·데이터 공급/검사·표시·전용 CSS를 나누고 한국어 사용처 주석과 화면 정의서를 갱신했다.
  누락 수치를 0으로 표시하지 않으며 없는 종료 원인·좌표도 명시한다.
- 원본 Mock/상세 Mock/누락 상태 검사, 타입·Lint·build PASS. 동작 40그룹·반응형 16조건과
  PC/모바일 시각 검토 PASS. 홈·닫힌 프로필 4쌍 DOM/스타일/픽셀 동일.
- Before 8장·After 21장 및 [Visual QA](visual-qa/TASK-FE-018.md) 기록. 개발 서버 복원·HTTP 200 확인.
  구현·검증 완료, 사용자 검토 대기. 커밋·푸시·PR은 진행하지 않았다.
- 사용자 추가 요청으로 기본을 큰 모달로 전환했다. `presentation.ts` 한 곳에서 `inline`을 선택하면 기존 펼침을 복원한다.
  모달은 경기 정보·탭 고정, 내용 내부 스크롤, 닫기 후 목록 위치/포커스 복귀를 제공한다.
- 모달50그룹·반응형16조건, 인라인복원22그룹·반응형16조건 PASS. 홈/닫힌프로필4쌍 및 인라인복원4쌍 픽셀 동일.
  최종 modal 복원 후 전체 Mock/타입/Lint/build·서버 HTTP200·모달 smoke PASS. PNG52장과 단계별 JSON2개 보존.

- Tracker 상세 참고 5장에 맞춰 모달을 Scoreboard/Performance/Economy/Rounds/Duels로 구성했다.
  청회색 헤더·균등 탭·팀 띠/교차 행·선수 선택·라운드/교전 배치를 반영하고 기존 인라인 4탭은 보존한다.
- 없는 랭크·경제·라운드 개인 기록·이벤트·좌표는 미제공으로 구분한다. 소수점 정밀도·실제0·조회 선수 지표 범위 SSR을 보강했다.
- Tracker Before/After·모바일 경제 grid 보완·5탭 동작/가로 넘침·인라인 복원·홈/프로필 회귀 및 최종 타입/Lint/build PASS.
  최종 검증/캡처는 [Visual QA](visual-qa/TASK-FE-018.md)와 tracker-verification.json에 기록했다. 기본 modal·개발 서버 실행 유지.

- 실제 Tracker DOM/화면 비교 후 최대폭1400·헤더56/탭56·하단 정렬·표/Performance/Rounds/Duels 비율을 보완했다.
  새 Before/After20장·fidelity-verification.json, 동작42그룹·반응형20조건·Mock/SSR/타입/Lint/build PASS.
  기존 인라인/데이터/이미지는 보존했으며 Roboto/Arial 글꼴 차이는 남는다.
- 사용자 요청으로 커밋·푸시 및 `codex/frontend-rework` 대상 PR 전달을 진행한다.
  전달 전 검증 대상 소스 31개의 SHA-256 일치와 허용 범위 150개 파일을 재확인했다. PR 검토·병합은 사용자가 진행한다.

### TASK-FE-017 — 경기 목록 M01~M05 표시 컴포넌트 분리

- PR #9 병합 `eac0cbf`에서 `codex/profile-match-history-components`로 분기하고 Task를 먼저 작성했다.
- 사용자 지정대로 M01~M05 전체를 한 Task로 구현한다. 필터·요약·날짜별 그룹·행·상세 표시와 전용 CSS를 분리한다.
- 상태·집계·이미지 선택·스크롤은 부모에 유지한다. 공통 스타일·상태 훅·Mock/데이터 계층 정리는 후속 범위다.
- 화면86조건·캡처30쌍 픽셀 동일, 경기22개 포함68개 동작과 Mock/타입/Lint/build PASS.
  [Visual QA](visual-qa/TASK-FE-017.md)에 스크롤 측정 보정과 비교 근거를 기록했다. 개발 서버 복원·HTTP200 확인.
- 화면 정의서·분리 계획·Task 결과를 갱신했다. 구현·검증 완료.
- 사용자 요청으로 커밋·푸시하고 `codex/frontend-rework` 대상 PR로 전달한다. 원격 기준은 `eac0cbf`로 동일하며,
  검증 이후 소스 변경 없이 전달 상태 문서만 갱신했다. PR 병합은 사용자가 진행한다.

### TASK-FE-016 — 프로필 사이드바 표시 컴포넌트 분리

- PR #8 병합 `9e84346`을 pull한 뒤 `codex/profile-sidebar-components`에서 Task를 작성했다.
- S01~S06을 ProfileSidebar와 카드5개/CSS로 분리하고 사용처 주석·화면 정의서를 갱신했다.
  상태·집계·이미지/그래프 helper는 부모에 유지하고, 인체 SVG는 같은 경로/속성으로 명중 부위 카드로 이동했다.
- 화면56조건·캡처26쌍 픽셀 동일, 동작46개·Mock/타입/Lint/build PASS. 개발 서버 복원 및 HTTP200 확인.
  [Visual QA](visual-qa/TASK-FE-016.md)에 근거를 기록했다. 구현·검증 완료.
- 사용자 요청으로 커밋·푸시하고 `codex/frontend-rework` 대상 PR로 전달한다. 원격 기준은 `9e84346`으로 동일하다.
  검증 이후 소스 변경 없이 전달 상태 문서만 갱신했다. PR 병합은 사용자가 진행한다.
- 이후 후보는 경기 목록(B3), 상태·동작(C), Mock·집계·데이터 공급(D)이며 이번에 시작하지 않는다.

### TASK-FE-015 — 프로필 상단 배너·탭·프로모션·시즌 필터 분리

- PR #7 병합 `e4f78bf`에서 `codex/profile-header-components`를 만들고 Task 작성 후
  P02/P03 `ProfileHeader`, P04 `ProfilePromotion`, P05 `ProfileFilters`와 전용 CSS를 분리했다.
- 기존 이미지·아이콘·Select helper와 상태·저장/공유·집계는 부모에 유지했다.
  한국어 사용처 주석과 화면 정의서·모듈 계획의 실제 연결을 갱신했다.
- 검증 중 모드 선택 aria-pressed와 모바일 Act 여백을 복원했다.
  최종56조건 DOM·스타일·좌표 동일, 동작36개 및 Mock/타입/Lint/build PASS.
- 캡처24쌍 중23쌍 동일. 전체 모바일 프로필의 홍보 박스 둥근 모서리3픽셀만 최대RGB1 차이이며,
  새 배치·글자 차이는 없었다. 키보드2장 포함50장과 [Visual QA](visual-qa/TASK-FE-015.md)에 근거를 남겼다.
- 구현·검증 완료. 사용자 요청에 따라 커밋·푸시하고 `codex/frontend-rework` 대상 PR로 전달한다.
  원격 기준은 `e4f78bf`로 동일하며 검증 이후 소스 변경 없이 전달 상태 문서만 갱신했다.
  PR 병합·사이드바·후속 Task와 dev/main 변경은 진행하지 않는다.

### TASK-FE-014 — 통합 브랜치 대상 PR 전달

- 사용자 요청에 따라 `codex/profile-summary-components`의 변경을 커밋·푸시하고
  `codex/frontend-rework` 대상 PR로 전달한다. 원격 통합 기준은 `06076ca`로 동일하다.
- 기존 검증 이후 소스 변경은 없으며 전달 상태 문서만 갱신했다.
  허용62파일·문서 링크/펜스·공백·diff 검사 PASS. 앱 검증 근거는 [Task](tasks/TASK-FE-014.md)를 따른다.
- PR 병합·명칭 변경·후속 컴포넌트 분리와 dev/main 변경은 진행하지 않는다.

## 2026-09-19

### TASK-FE-014 — 프로필 시즌 요약·점수·요원 표 분리

- PR #6 병합 `06076ca`까지 통합 브랜치를 최신화하고 `codex/profile-summary-components`에서
  Task를 작성한 뒤 P06~08의 표시 컴포넌트3개와 전용 CSS를 분리했다.
- 숫자 표시 함수를 공유하고 상태·집계·필터·이미지 helper는 부모에 유지했다.
  사용처 주석과 화면 정의서의 실제 코드 연결을 갱신했다.
- Mock/타입/Lint/build, 54조건 DOM·배치·스타일 비교, 29개 동작 확인 PASS.
  Before/After22쌍 픽셀 차이0, 키보드2장을 포함한46장과 [Visual QA](visual-qa/TASK-FE-014.md) 기록 완료.
- 구현·검증 완료, 사용자 검토 대기. 커밋·푸시는 하지 않았다.
  B2b/B3 및 상태·데이터 분리, 이미지·라인업 변경, dev/main·운영 배포는 진행하지 않았다.

## 2026-09-18

### TASK-FE-013 — 공통 헤더·푸터 구현 및 Search 외형 통일

- 사용자 구현 지시 후 stats-shell에 공통 외곽/헤더/푸터/CSS를 분리했다.
  홈의 프로필 CSS 의존을 제거하고 사용처·페이지별 차이를 주석과 화면 정의서에 연결했다.
- Search 글자16px·밝은 색·hover/키보드 focus를 통일했다. 검색 동작·모바일 폭과
  계정 버튼/More의 기존 차이·게임 이미지·라인업·Mock은 유지했다.
- Mock/타입/Lint/build,42조건 배치·스타일 비교 및18항목 동작 확인 PASS.
  Before/After18쌍과 키보드 캡처2장을 [Visual QA](visual-qa/TASK-FE-013.md)에 기록했다.
- 구현 완료. 사용자 요청으로 커밋·푸시를 진행하며 `codex/frontend-rework` 대상
  PR 생성·병합은 사용자가 진행한다. 후속 컴포넌트 작업은 시작하지 않았다.

### TASK-FE-013 — 공통 헤더·푸터 분리 Task 준비

- FE-012가 PR #5로 병합된 통합 브랜치 `6cde828`에서 `codex/frontend-shared-shell`을 생성했다.
- 사용자 요청대로 [Task](tasks/TASK-FE-013.md)의 목표·수정 범위·완료 조건·검증만 작성했다.
  공통 헤더·푸터 분리와 Search 외형 통일 기준안을 구분했다.
- 검색 기능·계정 버튼·More의 현재 차이를 유지하며, 이미지·라인업·Mock 변경을 제외한다.
- 현재는 PLANNED다. 소스 구현과 앱 검증은 시작하지 않으며 문서 검토 후 사용자가 구현을 지정한다.
- 문서 diff·허용 경로·추가 링크·펜스 검사 및 프론트/백엔드/실행 환경 무변경 확인 PASS.

### TASK-FE-012 보완 — 브랜드 잔여 문구·표면색 연결

- 사용자 감사·보완 지정에 따라 홈 소개와 프로필 접근성 이름/툴팁/경기 상세의
  브랜드 표기를 설정에 연결했다. 현재 화면 문구·색·배치는 유지했다.
- 메뉴·도넛 내부·시즌 카드 하단의 같은 역할 색상값을 기존 변수로 연결했다.
  body 배경은 홈·프로필에서만 적용되는 단일 배경 설정을 공유한다.
- 보완 전후 26조건 스타일·배치 동일, PNG 5쌍 픽셀 차이0. 다른 설정값도 독립된
  브라우저에서 연결·라인업 원래 배경 복원을 확인했다. Mock/타입/Lint/build PASS.
- 버튼 색·More 동작·이미지/오버레이·저장 키·라인업 소스는 유지했다.
  [Task](tasks/TASK-FE-012.md), [Visual QA](visual-qa/TASK-FE-012.md)에 기록했다.
  사용자 요청으로 커밋·푸시를 진행하며 `codex/frontend-rework` 대상 PR 생성·병합은
  사용자가 진행한다. Search 외형 통일은 후속 공통 헤더 컴포넌트 작업에서 다룬다.

## 2026-09-17

### TASK-FE-012 — 홈·프로필 공통 브랜드·테마 설정 분리

- PR #4 병합 기준 `6298fdb`에서 `codex/frontend-shared-settings`를 분기했다.
- 브랜드 네 값과 공통 CSS 변수 26개·기본 글꼴을 `stats-shell`로 옮기고
  설정별 사용처와 반응형 예외 위치를 한국어 주석으로 안내했다.
- Mock·이미지·문구·화면 동작·라인업을 유지했다. 컴포넌트 분리는 아직 시작하지 않았다.
- Mock/타입/Lint/build, 홈·프로필 26조건 스타일 비교 및 PNG 5쌍 동일,
  주요 동작과 라인업 공용 스타일 복원 PASS.
- [Task](tasks/TASK-FE-012.md), [Visual QA](visual-qa/TASK-FE-012.md) 참조.
  구현 완료·사용자 검토 대기이며 커밋·푸시는 하지 않았다.

### TASK-FE-011 — 홈·프로필 화면 정의서와 모듈 분리 계획

- PR #3 병합 기준 `b016a29`에서 `codex/frontend-screen-map` 브랜치를 만들었다.
- 사용자 지시에 따라 이미지 파일·종류·선택·매핑·표시 방식을 유지한다.
  추가·수정은 토의 이후로 보류하고, 라인업 구현도 제외했다.
- [화면 정의서](frontend/SCREEN-MAP.md)에 현재 배치도, 영역 ID, 실제 파일/함수,
  탭·필터의 영향 범위와 Mock 데이터 의미를 연결했다.
- [모듈 분리 계획](frontend/REFACTORING.md)에 브랜드/테마 → 화면 영역 →
  상태·동작 → 데이터 경계의 후보를 정리했다. 실제 코드 분리는 아직 하지 않았다.
- 문서 작업 결과·검증은 [Task](tasks/TASK-FE-011.md)에 기록한다.
  이미지·소스·설정 변경 없음. 사용자 요청으로 문서 커밋·푸시를 진행하며,
  통합 브랜치 대상 PR 생성·병합은 사용자가 직접 진행한다.

## 2026-09-16

### TASK-FE-002~010 — 홈·프로필 디자인 단계 마감 및 PR 준비

- 사용자 확인을 받아 현재 화면·상호작용·가독성 변경을 디자인 단계의 결과로
  정리한다. 대상은 `codex/tracker-profile-clone` → `codex/frontend-rework`이며,
  라인업·백엔드·공용 레이아웃·의존성은 변경하지 않는다.
- FE-004~010의 겹치는 시각 조정은 최종 FE-010 상태로 함께 커밋한다.
  각 Task와 Before/After 기록은 보존하며 중간 디자인 상태를 재구성하지 않는다.
- 업로드 전 최종 Mock selector·타입·Lint·빌드·diff 검사 PASS.
  홈·프로필 모바일 및 라인업 이동 시 공용 스타일 복원도 확인했다.
- 알려진 P3: 더 보기 후 23경기가 표시돼도 제목은 `LAST 20 MATCHES`로 남는다.
- 현재 Mock은 API 응답 계약이 아니다. 대표 무기별 경기 전체 수치를 합산한
  총기 통계, 임시 생성한 KAST/플레이 시간/RR 및 선취점·에이스·부위별 비율,
  Probe Score/등급은 실제 통계 연동 때 정의·데이터를 재검토해야 한다.
- 후속 방향: 현재 화면·상태·동작을 기준으로 브랜드/테마, 화면 컴포넌트,
  상태 처리, 데이터 공급·집계를 분리하고 화면별 관련 함수 연결표를 작성한다.
  리팩터링·스토리보드 작업 및 PR 병합은 이번 마감에 포함하지 않는다.

### TASK-FE-010 — 글자 기준 통일·레이아웃 밀도 분리

- 본문 폭1440px와 별도 배치 토큰을 적용하고, 글자를12/13/14px 이상 역할별
  토큰으로 통일했다. 플레이 시간13px, 보조 회색 대비 개선, 모바일 축소 규칙 제거.
- 홈·프로필 CSS만 수정. 라인업·전역·데이터·인체 SVG 보존.
- 320~1920px, 주요 탭·검색·필터·상세·시각 리뷰·타입·Lint·빌드 PASS.
- [Task](tasks/TASK-FE-010.md), [Visual QA](visual-qa/TASK-FE-010.md) 참조.
  사용자 브라우저 배율 설정 무변경.100%에서 확인 필요. 커밋·푸시 없음.

### TASK-FE-009 — 100% 기준 홈·프로필 크기 조정

- localhost의 Chrome 배율이 80%였음을 확인하고, 사용자가 100%로 복원한 뒤
  홈·프로필 전체 크기 조정을 요청했다. 헤더·제목·배너·카드 여백을 줄였다.
- 경기 시간 13px·라벨 12px, 입력16px, 기존 인체 SVG와 반응형 기능 유지.
- 홈·프로필 320~1920px, 주요 동작·시각 리뷰·타입·Lint·빌드 PASS.
- [Task](tasks/TASK-FE-009.md), [Visual QA](visual-qa/TASK-FE-009.md) 참조.
  라인업·전역·데이터 무변경. 서버 실행 유지, 커밋·푸시 없음.

### TASK-FE-008 — 경기 목록 보조 글자 가독성

- 경기 시간·요원명 13px, 지표·날짜 라벨 12px/700으로 확대하고 요약·날짜
  스트립 글자도 보완했다. 글꼴·색상은 유지하고 좁은 화면은 두 줄로 배치했다.
- 320~1920px 총 14개 너비, 경기 펼침·승패 필터, 시각·타입·Lint·빌드 PASS.
- [Task](tasks/TASK-FE-008.md), [Visual QA](visual-qa/TASK-FE-008.md) 참조.
  이전 미커밋 작업 보존. 홈·라인업·전역 파일 수정 및 커밋·푸시 없음.

### TASK-FE-007 — 명중 부위 인체 실루엣 개선

- 프로필 ACCURACY의 원·막대 그림을 자연스러운 비율의 자체 인체 SVG로 교체했다.
  어깨·허리·관절·손발을 표현하고 기존 부위별 색상·수치·필터 의미를 유지했다.
- 320/390/768/1440px, A4/A5 수치 갱신, 시각 검토, 타입·Lint·빌드 PASS.
- [Task](tasks/TASK-FE-007.md), [Visual QA](visual-qa/TASK-FE-007.md) 참조.
  기존 미커밋 변경 보존. 라인업·홈·공통 파일 수정 및 커밋·푸시 없음.

### TASK-FE-006 — 홈·프로필 최상단 브랜드 바 확대

- 최상단 브랜드 바를 48px(모바일 44px), 서비스명을 20px(모바일 18px),
  계정 버튼 글자를 16px(모바일 14px)로 키웠다. 좁은 화면의 보조 라벨을 줄였다.
- 기존 FE-004/005 변경을 보존하고 브랜드 바 관련 두 CSS만 추가 수정했다.
  라인업·전역 파일·본문·내비게이션은 이번 작업에서 변경하지 않았다.
- 홈/프로필 320~1440px, 링크·시각 검토·타입·Lint·빌드 PASS.
- [TASK-FE-006](tasks/TASK-FE-006.md), [Visual QA](visual-qa/TASK-FE-006.md) 참조.
  미커밋 상태로 사용자 검토 대기. 개발 서버 실행 유지, 푸시·병합 없음.

### TASK-FE-005 — 홈·프로필 상단 내비게이션 확대

- 사용자 캡처의 상단 메뉴를16px, 바 높이를68px(모바일64px), 검색/More를44px로 키웠다.
- 이전 FE-004 미커밋 변경을 보존하고 내비게이션 관련 두 CSS만 추가 수정했다.
  동료의 라인업 및 전역 CSS/레이아웃은 변경하지 않았다.
- 홈/프로필320~1440px, 검색·메뉴·탭·sticky·시각 리뷰·타입·Lint·빌드 PASS.
- [TASK-FE-005](tasks/TASK-FE-005.md), [Visual QA](visual-qa/TASK-FE-005.md) 참조.
  미커밋 상태로 사용자 검토 대기. 푸시·병합 없음.

### TASK-FE-004 — 홈 글자 가독성 보완

- 홈 테마를 사용자 요청으로 `7d66a7f`에 커밋한 후 가독성 피드백을 반영했다.
- 홈 본문·입력·조작·보조 글자의 크기를 높이고 검색 버튼 대비를 개선했다.
  큰 제목/폰트와 현재 테마를 유지했으며 프로필·라인업·공통 파일은 변경하지 않았다.
- 320/390/768/1440px, 홈 동작·시각 리뷰·타입·Lint·빌드 검증 PASS.
- [TASK-FE-004](tasks/TASK-FE-004.md), [Visual QA](visual-qa/TASK-FE-004.md) 참조.
  가독성 보완은 미커밋 상태로 사람 검토 대기. 푸시·병합 없음.

### TASK-FE-003 — 홈 테마 통일

- 사용자 요청으로 기존 `codex/tracker-profile-clone`에서 홈을 프로필 테마에 맞췄다.
- 프로필의 색상·헤더·푸터 스타일과 로고 설정, 기존 홈 검색/분석 예시를 재사용했다.
  홈 전용 구성과 스타일만 추가했고 라인업·공통 파일·프로필은 변경하지 않았다.
- 데스크톱/모바일 Before·After, 검색·프로필·라인업 이동, 메뉴 포커스를 검증했다.
- [TASK-FE-003](tasks/TASK-FE-003.md) 및 [Visual QA](visual-qa/TASK-FE-003.md) 참조.
  사용자 요청으로 홈 테마 변경을 커밋한다. 푸시·병합은 수행하지 않는다.


### TASK-FE-002 — Tracker 프로필 클론 구현

- FE-001이 병합된 `88bc139`에서 `codex/tracker-profile-clone`을 분기했다.
- 기존 프로필 진입점과 새 전적 전용 화면/CSS/Mock을 구성했다. 프로필 배너,
  좌측 통계, 시즌 지표, 요원 표, 날짜별 경기와 필터·상세·탭·공유를 구현했다.
- 기존 `/players/demo-puuid-seoul-duelist-001`과 비교용 `/players/ied-agent-allen`에서
  확인할 수 있다. 공통 스타일·레이아웃, 라인업, 백엔드, 의존성 변경은 없다.
- Docker Mock 검증·타입 검사·Lint·build 및 브라우저 상호작용 검증을 통과했다.
  데스크톱/390px Before·After와 768px 경기 상세를 확인했다.
- [Task 결과](tasks/TASK-FE-002.md), [시각 검증](visual-qa/TASK-FE-002.md) 참조.
  상태는 `IMPLEMENTED`이며 큰 모듈 분리와 통합 브랜치 병합은 사람 검토 이후다.


### TASK-FE-001 구현·검증 완료 — 프론트 Docker 개발 환경

- 최신 main `19a2415`가 통합된 `b6d1d3b`에서 `codex/frontend-docker-dev`를
  분기해 프론트 단독 개발 환경을 구현했다. Node 22.20.0 / npm 10.9.3을 고정하고
  의존성·빌드 캐시를 전용 볼륨으로 격리했다.
- 타입 검사·Lint·build, 홈/프로필/라인업 HTTP 200과 브라우저 확인,
  소스 자동 반영·복원, 중지/재시작 검증을 통과했다.
- 최신 라인업 목록은 기존 API 실패 시 Mock fallback으로 확인했다.
  제품 코드·백엔드·기존 DB 설정 및 의존성 버전은 변경하지 않았다.
- 검증 후 프론트 컨테이너는 중지하고 볼륨을 보존했다. 기존 의존성의 audit
  경고 8건(7 high, 1 critical)은 별도 대응 사항으로 기록했다.
- 상태는 `IMPLEMENTED`(통합 브랜치 병합 전 사람 검토 대기)다.
  상세 변경 파일·검증 명령·결과는 [TASK-FE-001](tasks/TASK-FE-001.md)을 따른다.

### 계획 브랜치 푸시 및 원격 기준선 차이 확인

- 사용자 요청으로 계획 문서 5개를 `14d9e3e`로 커밋하고,
  `codex/frontend-rework`(`127ed49`)와 `codex/frontend-task-planning`을 원격에
  푸시했다. 두 브랜치의 upstream 설정을 완료했다.
- 원격 `main`은 `19a2415`로 로컬 작성 기준보다 16개 커밋 앞서 있으며 라인업
  화면/API 등 후속 구현이 포함되어 있다. 이전 로컬 조사와 계획을 최신 원격의
  상태로 해석하지 않도록 기준점을 명시했다.
- TASK-FE-001 상태를 `NEEDS_REVIEW`로 변경했다. 문서는 작성됐지만 구현 전에
  최신 기준선과 Task 범위를 재확인해야 한다. Docker 구현은 여전히 미착수다.
- `git fetch origin main`으로 원격 참조만 갱신했으며 main/통합/작업 브랜치를
  merge/rebase하거나 PR을 생성하지 않았다. 사용자 GitHub 검토를 기다린다.

### FE/BE 작업 목록 분리 및 TASK-FE-001 작성 (문서만)

- 사용자 요청에 따라 모노레포를 유지하고 앞으로의 Task 번호를 FE/BE/INFRA로
  구분했다. 기존 Task 파일·번호·커밋 이력은 이동하거나 변경하지 않았다.
- [프론트 작업 목록](frontend/PLAN.md)과 [백엔드 작업 목록](backend/PLAN.md)을
  추가하고, 루트 PLAN에 현재 작업으로 연결했다. 기존 Phase 계획은 과거 기록으로
  구분했으며 전체 제품 계획을 재설계하지 않았다.
- [TASK-FE-001](tasks/TASK-FE-001.md)을 작성했다. 범위는 고정된 Node/npm의
  프론트 단독 Docker 개발 환경이며, 백엔드·DB·화면·Mock·의존성 업그레이드는 제외한다.
- 상태는 `READY`(문서 완료·구현 미착수)다. Dockerfile/Compose는 아직 생성하지
  않았으며 이미지 빌드·패키지 설치·컨테이너 실행은 하지 않았다.
- 계획 작업 브랜치는 `codex/frontend-task-planning`이며
  `codex/frontend-rework`에서 분기했다. 검토 후 병합 대상은
  `codex/frontend-rework`이며, `main`에 직접 병합하지 않는다.

**문서 검증**: 내부 링크/필수 Task 섹션 및 `git diff --check` 확인.
Docker 검증 명령은 구현 단계에서 실행할 항목이며 이번 결과로 기록하지 않는다.

**다음 단계**: 사용자 검토 후 TASK-FE-001을 명시적으로 지정하면 해당 Task만 구현한다.

---

## 2026-09-16

### TASK-024_PUBLIC_LINEUP_API 완료 — 사용자 공개 라인업 목록 API 연결

**작업 내용**:
- `/lineups`가 공개 `GET /api/lineups`를 호출하도록 연결했습니다.
- 백엔드 라인업 응답을 기존 카드 모델로 변환하고 맵·요원·스킬 슬롯 필터를 유지했습니다.
- 로딩/API 오류 상태와 Preview fallback을 표시하며 상세·YouTube 링크를 유지했습니다.
- 1440px 및 390px 브라우저 화면에서 가로 overflow 없이 확인했습니다.
- 당시 임시 DB 환경에서 관리자 저장·공개 전환·공개 목록·상세 API 응답을 실제 HTTP로 확인했습니다.

**변경된 파일**:
- `frontend/src/app/lineups/page.tsx`
- `frontend/src/components/LineupSearchFilter.tsx`
- `frontend/src/lib/lineup-api.ts`
- `docs/tasks/TASK-024_PUBLIC_LINEUP_API.md`
- `docs/visual-qa/TASK-024_PUBLIC_LINEUP_API.md`
- `screenshots/public-lineups-before.png`
- `screenshots/public-lineups-after-desktop.png`
- `screenshots/public-lineups-after-mobile.png`

**검증 결과**:
- `cd frontend && npx tsc --noEmit` — PASS
- `cd frontend && npm run lint` — PASS
- `cd frontend && npm run build` — PASS
- 브라우저 API Preview/fallback 및 반응형 목록 확인 — PASS
- 당시 백엔드 API의 실제 저장·수정·삭제·공개 흐름 — PASS
- 프론트에서 백엔드로의 브라우저 호출 — PASS (`localhost:3000` origin)
- 공개 상세의 마커·경로·YouTube·Sova 설정 렌더링 — PASS

**이슈/위험**:
- 기본 개발 origin은 `http://localhost:3000`이며 운영 origin은 `CORS_ALLOWED_ORIGINS`로 설정합니다.

**다음 단계**:
- 운영 환경의 `CORS_ALLOWED_ORIGINS` 설정

---

### TASK-023_ADMIN_EDIT 완료 — 기존 라인업 관리자 수정

**작업 내용**:
- 관리자 목록 카드에서 기존 라인업 수정 화면으로 이동할 수 있게 했습니다.
- `/admin/lineups/[id]/edit`에서 기존 데이터로 편집기를 초기화하고 `PUT /api/admin/lineups/{id}`로 저장합니다.
- 다중 스킬/요원 마커, 경로, 난이도, YouTube URL, Sova 차징·튕김 설정을 복원합니다.
- 선택한 스킬 마커의 스킬 종류와 YouTube URL을 수정할 수 있습니다.

**변경된 파일**:
- `frontend/src/app/admin/lineups/[id]/edit/page.tsx`
- `frontend/src/components/AdminLineupList.tsx`
- `frontend/src/components/LineupEditor.tsx`
- `frontend/src/lib/lineup-api.ts`
- `docs/tasks/TASK-023_ADMIN_EDIT.md`
- `docs/visual-qa/TASK-023_ADMIN_EDIT.md`
- `screenshots/admin-edit-before.png`
- `screenshots/admin-edit-after-desktop.png`
- `screenshots/admin-edit-after-mobile.png`

**검증 결과**:
- `cd frontend && npx tsc --noEmit` — PASS
- `cd frontend && npm run lint` — PASS
- `cd frontend && npm run build` — PASS
- 브라우저 인증 게이트 및 1440px/390px 수정 라우트 확인 — PASS

**이슈/위험**:
- 당시 DB 미실행 환경에서는 실제 기존 데이터 조회와 PUT 저장 통합 검증을 수행하지 못했습니다.

**다음 단계**:
- 운영 DB 통합 검증 또는 사용자 즐겨찾기 기능

---

## 2026-09-16

### TASK-022_ADMIN_REVIEW 완료 — 관리자 라인업 목록 및 상태 검수

**작업 내용**:
- `/admin/lineups`에서 저장된 라인업을 상태별로 필터링하고 요약 카드로 확인할 수 있게 했습니다.
- `DRAFT → REVIEW → PUBLISHED` 검수 흐름과 `REJECTED` 반려/초안 복귀 흐름을 연결했습니다.
- 기존 관리자 토큰 세션과 `GET /api/admin/lineups`, `PATCH /api/admin/lineups/{id}/status` API를 재사용했습니다.
- 인증 게이트, 빈 목록, 오류, 상태 변경 피드백 및 모바일 레이아웃을 처리했습니다.

**변경된 파일**:
- `frontend/src/app/admin/lineups/page.tsx`
- `frontend/src/components/AdminLineupList.tsx`
- `frontend/src/lib/lineup-api.ts`
- `frontend/src/types/lineup.ts`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-022_ADMIN_REVIEW.md`
- `docs/visual-qa/TASK-022_ADMIN_REVIEW.md`
- `screenshots/admin-review-before.png`
- `screenshots/admin-review-after-desktop.png`
- `screenshots/admin-review-after-mobile.png`

**검증 결과**:
- `cd frontend && npx tsc --noEmit` — PASS
- `cd frontend && npm run lint` — PASS
- `cd frontend && npm run build` — PASS
- 브라우저 인증 게이트 및 1440px/390px 반응형 확인 — PASS

**이슈/위험**:
- 당시 DB 미실행 환경에서는 실제 DB 목록 조회와 상태 변경 통합 검증을 수행하지 못했습니다.
- 운영 배포 시 `ADMIN_API_TOKEN`, `NEXT_PUBLIC_BACKEND_URL` 설정이 필요합니다.

**다음 단계**:
- 사용자 기능(즐겨찾기 등) 또는 운영 DB 통합 검증

---

## 2026-09-16

### TASK-021_ADMIN_ACCESS 완료 — 관리자 토큰 인증 및 편집기 접근 보호

**작업 내용**:
- `ADMIN_API_TOKEN` 설정을 읽는 백엔드 관리자 인증 경계를 추가했습니다.
- `POST /api/admin/session` 토큰 확인 API를 추가했습니다.
- 관리자 CRUD/status API가 `X-Admin-Token`을 요구하도록 변경했습니다.
- `/admin` 로그인 화면과 세션 저장을 추가했습니다.
- 인증되지 않은 `/admin/lineups/new` 접근을 차단하고, 저장 요청에 관리자 토큰을 전달합니다.
- 공개 라인업 조회 API는 계속 인증 없이 사용할 수 있습니다.

**변경된 파일**:
- `backend/src/main/kotlin/com/valorant/platform/lineup/AdminAuthorization.kt`
- `backend/src/main/kotlin/com/valorant/platform/lineup/LineupController.kt`
- `backend/src/main/resources/application.yml`
- `backend/src/test/kotlin/com/valorant/platform/lineup/AdminAuthorizationTest.kt`
- `frontend/src/app/admin/page.tsx`
- `frontend/src/components/AdminLogin.tsx`
- `frontend/src/components/LineupEditor.tsx`
- `frontend/src/lib/lineup-api.ts`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-021_ADMIN_ACCESS.md`
- `docs/visual-qa/TASK-021_ADMIN_ACCESS.md`
- `screenshots/admin-access-before.png`
- `screenshots/admin-access-after-desktop.png`
- `screenshots/admin-access-after-mobile.png`

**검증 결과**:
- `cd backend && ./gradlew test` — PASS
- `cd frontend && npx tsc --noEmit` — PASS
- `cd frontend && npm run lint` — PASS
- `cd frontend && npm run build` — PASS (`/admin` 및 `/admin/lineups/new` 포함)
- 브라우저: 인증 전 편집기 차단, 빈 토큰 오류, 390px 반응형 PASS

**이슈/위험**:
- 현재 인증은 계정/RSO/JWT가 없는 프로젝트의 임시 토큰 경계입니다.
- 운영 환경에서 반드시 `ADMIN_API_TOKEN`을 안전한 secret으로 주입해야 합니다.
- 당시 DB가 실행되지 않은 환경이라 브라우저에서 실제 저장 API 호출까지는 검증하지 못했습니다.

**다음 단계**:
- 관리자 라인업 목록/검수 상태 화면 및 공개 전환 UI

---

## 2026-09-16

### TASK-020_LINEUP_EDITOR 완료 — 관리자 아이콘/경로 배치 편집기

**작업 내용**:
- `/admin/lineups/new` 관리자 편집기와 API 저장 흐름을 추가했습니다.
- 스킬 마커를 먼저 배치해야 요원 배치 모드가 활성화되도록 순서를 강제했습니다.
- 여러 스킬/요원 마커, 정규화 좌표 경로, 마커 삭제와 경로 초기화를 지원합니다.
- 요원 난이도 색상, YouTube URL, Sova 차징 단계·튕김 횟수를 입력할 수 있습니다.
- 저장 시 `POST /api/admin/lineups`와 임시 관리자 헤더를 사용합니다.
- 시각 QA 중 발견한 lineup 폭 CSS 오류를 `calc()` 표현식으로 수정했습니다.

**변경된 파일**:
- `frontend/src/app/admin/lineups/new/page.tsx`
- `frontend/src/components/LineupEditor.tsx`
- `frontend/src/lib/lineup-api.ts`
- `frontend/src/types/lineup.ts`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-020_LINEUP_EDITOR.md`
- `docs/visual-qa/TASK-020_LINEUP_EDITOR.md`
- `screenshots/lineup-editor-before.png`
- `screenshots/lineup-editor-after-desktop.png`
- `screenshots/lineup-editor-after-mobile.png`

**검증 결과**:
- `cd frontend && npx tsc --noEmit` — PASS
- `cd frontend && npm run lint` — PASS
- `cd frontend && npm run build` — PASS
- 브라우저: 스킬→요원→경로 순서와 390px 반응형 검사 PASS

**이슈/위험**:
- 실제 로그인/토큰 인증은 TASK-021에서 연동해야 합니다.
- 당시 DB 실행 환경이 없는 상태에서는 실제 저장 API 통합 검증을 수행하지 못했습니다.

**다음 단계**:
- TASK-021 라인업 검수·공개 상태 및 관리자 권한 연동

---

## 2026-09-16

### TASK-019_LINEUP_DETAIL 완료 — 사용자용 상세 및 YouTube 패널

**작업 내용**:
- `/lineups/[id]` 상세 라우트와 API 어댑터를 추가했습니다.
- 백엔드 공개 API 응답을 우선 사용하고, 개발 중 API가 없을 때 기존 Mock 데이터로 fallback합니다.
- 맵 위 다중 스킬/요원 마커, 상대 좌표 경로, 난이도 색상 링을 렌더링합니다.
- 스킬 마커 클릭 시 연결된 YouTube 영상 iframe을 패널에 표시합니다.
- Sova 차징 단계와 튕김 횟수를 사용자 화면에 표시합니다.
- 데스크톱/390px 모바일 시각 QA와 상호작용 검증을 완료했습니다.

**변경된 파일**:
- `frontend/src/app/lineups/[id]/page.tsx`
- `frontend/src/components/LineupDetail.tsx`
- `frontend/src/lib/lineup-api.ts`
- `frontend/src/types/lineup.ts`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-019_LINEUP_DETAIL.md`
- `docs/visual-qa/TASK-019_LINEUP_DETAIL.md`
- `screenshots/lineup-detail-before-list.png`
- `screenshots/lineup-detail-after-desktop.png`
- `screenshots/lineup-detail-after-mobile.png`

**검증 결과**:
- `cd frontend && npx tsc --noEmit` — PASS
- `cd frontend && npm run lint` — PASS
- `cd frontend && npm run build` — PASS
- 브라우저: 상세 렌더링 PASS, 스킬 클릭 후 iframe PASS, 390px overflow 검사 PASS

**이슈/위험**:
- 배포 환경에서 `NEXT_PUBLIC_BACKEND_URL` 설정이 필요합니다.
- 실제 관리자 편집기와 DB에 저장된 다중 마커 데이터는 TASK-020에서 연결합니다.

**다음 단계**:
- TASK-020 관리자 라인업 편집기 및 다중 아이콘/경로 배치

---

## 2026-09-16

### TASK-018_LINEUP_BACKEND 완료 — 라인업 DB 모델 및 API

**작업 내용**:
- 당시 라인업 영구 저장 구조와 저장소 구현을 추가했습니다. 현재 저장 구현은 TASK-BE-001에서 정리합니다.
- 여러 스킬/요원 마커, 맵 상대 좌표, 경로, YouTube URL, 난이도, 공개 상태를 저장합니다.
- Sova에만 차징 단계와 튕김 횟수를 허용하고 좌표 범위 오류를 차단합니다.
- 공개 조회 API와 관리자 CRUD/상태 변경 API를 추가했습니다.
- 실제 인증 시스템이 없는 현재 구조에서는 `X-Admin-Role: ADMIN`을 임시 권한 경계로 사용했습니다.

**변경된 파일**:
- `backend/build.gradle.kts`
- `backend/src/main/resources/application.yml`
- `backend/src/main/kotlin/com/valorant/platform/lineup/`
- `backend/src/test/resources/application.yml`
- `backend/src/test/kotlin/com/valorant/platform/lineup/LineupServiceTest.kt`
- `docs/tasks/TASK-018_LINEUP_BACKEND.md`, `docs/PLAN.md`, `.agent-reports/HANDOFF.json`

**검증 결과**:
- `cd backend && ./gradlew test` — PASS
- `cd backend && ./gradlew build` — PASS

**다음 단계**:
- TASK-019 사용자용 라인업 상세 및 아이콘 클릭 YouTube 패널
- TASK-020 관리자 라인업 편집기 및 다중 아이콘/경로 배치

---

## 2026-06-30

### TASK-016_OVERNIGHT 완료 동기화 + PR-0 완료 및 TASK-017_DESIGN_SYSTEM 신설 (Phase 3 리팩토링 진입, READY)

**작업 내용 (Planner)**:
- **TASK-016_OVERNIGHT 완료 동기화**: 야간 자율 구현을 통해 라인업 검색/필터 및 데이터 모델이 완성되어 최종 커밋(`0332688`)된 Git 상태를 동기화했습니다.
- **PR-0 CSS Inventory & Visual Baseline 완료**:
  - `globals.css` (4,617줄)의 섹션 맵, 미디어 쿼리 9개, `!important` 22개, 공통 유틸리티 클래스 및 TSX 인라인 스타일 일체를 분석한 [docs/CSS_INVENTORY.md](file:///Users/shinjungho/valorant-platform/docs/CSS_INVENTORY.md)를 신설했습니다.
  - 리팩토링 시 레이아웃 붕괴를 검증하기 위한 14종의 화면/뷰포트 상태를 지정한 [docs/VISUAL_BASELINE_PLAN.md](file:///Users/shinjungho/valorant-platform/docs/VISUAL_BASELINE_PLAN.md)를 수립했습니다.
  - Codex Handoff를 통해 14가지 세부 화면의 스크린샷 캡처본을 `screenshots/page-states/` 폴더에 안전하게 보관 및 완성했습니다.
- **TASK-017_DESIGN_SYSTEM 신설 (PR-1, READY)**:
  - globals.css의 하드코딩 값들을 Spacing/Radii/Typography 디자인 토큰으로 안전하게 치환 및 치환 후 Visual Baseline 과의 픽셀 대조 검증을 수행하는 리팩토링 태스크인 [TASK-017_DESIGN_SYSTEM.md](file:///Users/shinjungho/valorant-platform/docs/tasks/TASK-017_DESIGN_SYSTEM.md)를 신설했습니다.
- `.agent-reports/HANDOFF.json`을 **TASK-017_DESIGN_SYSTEM** 핸드오프(stage IMPLEMENTATION, allowed_files = globals.css, PlayerHeaderCard.tsx)로 갱신했습니다.

**변경된 파일**:
- `docs/tasks/TASK-017_DESIGN_SYSTEM.md` (신규, Status READY)
- `docs/PLAN.md` (현재 상태 갱신, Phase 3 표 업데이트)
- `docs/PROGRESS.md` (이 항목)
- `.agent-reports/CURRENT.md` (Next Action 및 Next Task 갱신)
- `.agent-reports/HANDOFF.json` (TASK-017_DESIGN_SYSTEM 구현 핸드오프)

---

## 2026-06-25

### Phase G 전체 완료(TASK-015UI12G 마스터 + G-A~G-D) + TASK-016_OVERNIGHT 신설 (Phase 3 진입, READY)

**작업 내용 (Planner)**:
- **G-D 완료 동기화 → Phase G 종료**: 분석 탭 재설계(Team Delta 양방향 바 + 경제 그래프, `MatchAnalysisTab` props 배선 포함)가 Codex 구현, 검증(`tsc`/`lint`/`build` PASS, Mock 정합성 PASS — 피해량 ADR×22 정합, economy 22/22, 승리팀 로드아웃 우위 0 불일치), Cursor 리뷰(COMMIT_READY)를 거쳐 커밋되어 DONE(HEAD `ed86869`). 이로써 마스터 TASK-015UI12G 및 G-A~G-D 4탭 고밀도 재설계가 **전체 완료**되었다.
  - 누적 슬라이스: G-A `firstKills/firstDeaths/multiKills`, G-B `killEvents`·`MapPoint`, G-C `weaponKills`·`duels`, G-D `damageDealt/Received`·`MatchRound.economy`. 신규 컴포넌트: `MatchRoundMapPlotter`·`MatchDuelMatrix`·`WeaponDistribution`·`TeamDeltaChart`·`MatchEconomyChart`.
- **TASK-016_OVERNIGHT 신설(Phase 3 진입)**: 사용자 명시 지시(야간 자율 구현 승인)에 따라 라인업 데이터 모델 + 검색 화면을 하나의 야간 통합 Task로 신설했다(READY). 기존 Phase 3 TASK-016(데이터 모델)·TASK-017(검색)의 1차 범위를 통합하고, PLAN Phase 3 표에서 두 Task를 `ABSORBED → TASK-016_OVERNIGHT`로 표기했다.
  - 범위: `Lineup` 타입(맵·요원·스킬·팁·미디어 URL·작성자) + Mock 데이터셋 + `/lineups` 검색 페이지(맵/요원/스킬 필터·카드 그리드). 상세/즐겨찾기/관리자 등록/댓글은 범위 밖(후속).
  - 정합성·가드레일: 기존 `mapId`/`agentId` 관례와 `asset-map.ts` 헬퍼 재사용, 신규 자산·패키지 금지, 외부 이미지 런타임 핫링크 금지(YouTube는 링크, 썸네일은 로컬 자산), 라인업은 Mock/데모로 정직 고지.
- `.agent-reports/HANDOFF.json`을 **TASK-016_OVERNIGHT** 핸드오프(stage IMPLEMENTATION, allowed_files 5개 신규/연동)로 갱신했다.

**변경된 파일**:
- `docs/tasks/TASK-016_OVERNIGHT.md` (신규, Status READY)
- `docs/PLAN.md` (G 마스터·G-D DONE, Phase 3 표 통합·TASK-016_OVERNIGHT 추가, 현재 상태 갱신)
- `docs/PROGRESS.md` (이 항목)
- `.agent-reports/CURRENT.md` (Claude Plan·헤더·Next Action 갱신)
- `.agent-reports/HANDOFF.json` (TASK-016_OVERNIGHT 구현 핸드오프)

**금지 준수**:
- 제품 코드 수정 없음(문서/핸드오프만), 신규 자산·Mock·타입 실제 추가 없음, Git add/commit/push 없음.

**다음 단계**:
- 사용자 야간 자율 구현 승인에 따라 Codex가 `.agent-reports/HANDOFF.json` 범위 내에서 TASK-016_OVERNIGHT를 구현 → Cursor 리뷰 → 사람 커밋. (Phase G 커밋들의 origin/main push 여부는 사람 결정 사항으로 잔존.)

---

### TASK-015UI12G-C 완료 + TASK-015UI12G-D 활성화 — 분석 탭 재설계 READY 승격 (Phase G 마지막)

**작업 내용 (Planner)**:
- **G-C 완료 동기화**: 성과 탭 재설계(뷰어 기준 1v1 라이벌 매트릭스 + 무기별 킬 비율 위젯)가 Codex 구현, 검증(`tsc`/`lint`/`build` PASS, Mock 정합성 PASS — 듀얼 5건 합계 24/15가 뷰어 K/D와 일치, 무기 킬 합 24, opponentPuuid 전원 상대팀·중복 0), Cursor 리뷰(COMMIT_READY, BLOCKER/MAJOR 없음)를 거쳐 커밋되어 DONE(HEAD `1e50c62`). `WeaponKillBreakdown`·`DuelRecord`·optional `MatchParticipant.weaponKills/duels`(Mock 주석) 추가, 신규 `MatchDuelMatrix.tsx`·`WeaponDistribution.tsx`로 구현. 기존 ACS/ADR/HS% 반복 카드는 한 줄 요약으로 축소.
- **G-D 활성화**: 순차 진행 원칙(한 번에 하나)에 따라 Phase G 마지막 TASK-015UI12G-D(분석 탭 팀 전투/피해 델타 막대 + 경제 그래프)를 READY로 승격했다.
  - 슬라이스: `CombatStats.damageDealt/Received`·`MatchRound.economy`(attackersLoadout/defendersLoadout·Bank 선택)를 `mock-match-ascent-001`에 추가.
  - `MatchAnalysisTab.tsx`를 정적 미니맵 점 표시 → 아군 vs 적군 양방향 가로 바(Team Delta: 전투점수·피해량·킬) + 라운드별 경제 그래프(평균 로드아웃 차이 등)로 리팩토링. **현재 `MatchAnalysisTab`은 props 미수용 → `MatchDetailPanel.tsx` 배선 수정 포함.**
- `.agent-reports/HANDOFF.json`을 **TASK-015UI12G-D** 핸드오프(stage IMPLEMENTATION)로 갱신했다.

**변경된 파일**:
- `docs/tasks/TASK-015UI12G-D.md` (Status READY로 갱신)
- `docs/PLAN.md` (G-C DONE·G-D READY·현재 상태 갱신)
- `docs/PROGRESS.md` (이 항목)
- `.agent-reports/CURRENT.md` (Claude Plan·헤더·Next Action 갱신)
- `.agent-reports/HANDOFF.json` (TASK-015UI12G-D 구현 핸드오프)

**금지 준수**:
- 제품 코드 수정 없음(문서/핸드오프만), 신규 자산·Mock·타입 실제 추가 없음, Git add/commit/push 없음, G-D 구현 착수 없음.

**다음 단계**:
- 사람 승인 후 Codex가 `.agent-reports/HANDOFF.json` 범위 내에서 TASK-015UI12G-D 구현 → Cursor 리뷰 → 사람 커밋. G-D 완료 시 Phase G(경기 상세 4탭 고밀도 재설계) 전체 종료.

---

## 2026-06-24

### TASK-015UI12G-B 완료 + TASK-015UI12G-C 활성화 — 성과 탭 재설계 READY 승격

**작업 내용 (Planner)**:
- **G-B 완료 동기화**: 라운드 탭 재설계(1-24 수평 스트립 + 선택 라운드 킬 로그 + CSS 그리드 2D 좌표 플로터)가 Codex 구현, 검증(`tsc`/`lint`/`build` PASS, Mock 정합성 PASS — 22라운드×22이벤트, unknown puuid·동일팀 킬·승리팀 불일치·좌표 범위 오류 0건), Cursor 리뷰(COMMIT_READY, BLOCKER/MAJOR 없음)를 거쳐 커밋되어 DONE(HEAD `8e576bf`). `MapPoint`(0~1)·`RoundKillEvent`·optional `MatchRound.killEvents`(Mock 주석) 추가, 신규 `MatchRoundMapPlotter.tsx`(외부 자산 없이 CSS 전술 그리드)로 구현.
- **G-C 활성화**: 순차 진행 원칙(한 번에 하나)에 따라 후속 TASK-015UI12G-C(성과 탭 듀얼 H2H 매트릭스 + 무기 분포 위젯)를 READY로 승격했다.
  - 슬라이스: `MatchParticipant.weaponKills?`(`WeaponKillBreakdown`)·`duels?`(`DuelRecord`, opponentPuuid 상대팀 정합)를 `mock-match-ascent-001`에 추가.
  - `MatchPerformanceTab.tsx`를 기존 4지표 숫자 요약 카드 → 뷰어 기준 1v1 라이벌 매트릭스 + 주 무기별 킬 비율 위젯으로 개편.
- `.agent-reports/HANDOFF.json`을 **TASK-015UI12G-C** 핸드오프(stage IMPLEMENTATION)로 갱신했다.

**변경된 파일**:
- `docs/tasks/TASK-015UI12G-C.md` (Status READY로 갱신)
- `docs/PLAN.md` (G-B DONE·G-C READY·현재 상태 갱신)
- `docs/PROGRESS.md` (이 항목)
- `.agent-reports/CURRENT.md` (Claude Plan·헤더·Next Action 갱신)
- `.agent-reports/HANDOFF.json` (TASK-015UI12G-C 구현 핸드오프)

**금지 준수**:
- 제품 코드 수정 없음(문서/핸드오프만), 신규 자산·Mock·타입 실제 추가 없음, Git add/commit/push 없음, G-C 구현 착수 없음.

**다음 단계**:
- 사람 승인 후 Codex가 `.agent-reports/HANDOFF.json` 범위 내에서 TASK-015UI12G-C 구현 → Cursor 리뷰 → 사람 커밋 → G-D 순차 승격.

---

### TASK-015UI12G-A 완료 + TASK-015UI12G-B 활성화 — 라운드 탭 재설계 READY 승격

**작업 내용 (Planner)**:
- **G-A 완료 동기화**: 스코어보드 고밀도화(FK/FD/MK·K/D Ratio·MVP 마커·YOU 네온 강조)가 Codex 구현, 검증(`tsc`/`lint`/`build` PASS, Mock 정합성 PASS), Cursor 리뷰(COMMIT_READY, BLOCKER/MAJOR 없음)를 거쳐 커밋되어 DONE(HEAD `d47a818`). `CombatStats`에 optional `firstKills/firstDeaths/multiKills`(Mock 주석) 추가, `mock-match-ascent-001` 참가자 10명에만 값 추가(attackers FK/FD 13/9·defenders 9/13으로 22라운드 스코어와 교차 정합).
- **G-B 활성화**: 순차 진행 원칙(한 번에 하나)에 따라 후속 TASK-015UI12G-B(라운드 1-24 수평 스트립 + 킬 로그 + 2D 좌표 플로터)를 READY로 승격했다.
  - 슬라이스: `MatchRound.killEvents?`(`RoundKillEvent`·`MapPoint` 0~1 정규화 좌표)를 `mock-match-ascent-001` 라운드에 추가.
  - `MatchRoundsTab.tsx`를 세로 텍스트 목록 → 가로 라운드 타임라인 칩 + 선택 시 하단 킬 로그 + CSS 그리드 기반 2D 좌표 플로터 레이아웃으로 재설계.
- `.agent-reports/HANDOFF.json`을 **TASK-015UI12G-B** 핸드오프(stage IMPLEMENTATION)로 갱신했다.

**변경된 파일**:
- `docs/tasks/TASK-015UI12G-B.md` (Status READY로 갱신)
- `docs/PLAN.md` (G-A DONE·G-B READY·현재 상태 갱신)
- `docs/PROGRESS.md` (이 항목)
- `.agent-reports/CURRENT.md` (Claude Plan·헤더·Next Action 갱신)
- `.agent-reports/HANDOFF.json` (TASK-015UI12G-B 구현 핸드오프)

**금지 준수**:
- 제품 코드 수정 없음(문서/핸드오프만), 신규 자산·Mock·타입 실제 추가 없음, Git add/commit/push 없음, G-B 구현 착수 없음.

**다음 단계**:
- 사람 승인 후 Codex가 `.agent-reports/HANDOFF.json` 범위 내에서 TASK-015UI12G-B 구현 → Cursor 리뷰 → 사람 커밋 → G-C 순차 승격.

---

### TASK-015UI12G 계열 작성 — 경기 상세 4탭 고밀도 재설계 마스터 플랜 + 탭별 4분할 (PLAN/READY)

**작업 내용 (Planner)**:
- 외부 UX 감사 보고서(`ux_evaluation_report.md`, 사람 APPROVED)와 GameProbe/OP.GG/Tracker.gg 캡처를 검토해, 경기 상세 4탭(스코어보드/라운드/성과/분석)의 전술 정보 깊이 격차를 정리했다.
- **데이터 모델 정합성 조사**: 현재 `types/match.ts`·`mock-data.json`은 `mock-match-ascent-001` 1경기만 상세(참가자 10·라운드 22)를 갖고, 참가자 통계는 K/D/A·ACS·ADR·HS%뿐, 라운드는 winningTeam/endType/scoreAfterRound뿐임을 확인했다. 요청 기능 대부분(FK/FD/MK·듀얼 매트릭스·무기 분포·2D 좌표·경제)은 **신규 Mock+신규 타입**을 요구하며, 이는 가드레일("데이터 없는 UI 금지")·AGENTS.md("데이터 의미 변경은 사람 결정")상 사람 결정 게이트임을 식별했다.
- **사람 결정 확정(2026-06-24)**: (1) 신규 Mock+타입 **전체 승인**(2D 좌표·경제 포함), (2) 티켓 구조 **탭별 4분할**.
- 이에 따라 마스터 플랜 `docs/tasks/TASK-015UI12G.md`(PLAN)와 하위 4개 Task를 신설했다:
  - `TASK-015UI12G-A.md` (READY): 스코어보드 FK/FD/MK·K/D Ratio(파생)·MVP(ACS 파생)·YOU 네온 강조·밀도 압축. 슬라이스 = firstKills/firstDeaths/multiKills.
  - `TASK-015UI12G-B.md` (PLANNED): 라운드 1-24 수평 스트립 + 킬 로그 + 2D 좌표 플로터. 슬라이스 = killEvents·정규화 좌표.
  - `TASK-015UI12G-C.md` (PLANNED): 성과 탭 듀얼 H2H 매트릭스 + 무기 분포. 슬라이스 = weaponKills·duels.
  - `TASK-015UI12G-D.md` (PLANNED): 분석 탭 팀 전투/피해 델타 + 경제 그래프. 슬라이스 = damageDealt/Received·economy. (현재 `MatchAnalysisTab`은 props 미수용 → `MatchDetailPanel` 배선 수정 포함.)
- 마스터에 목표 데이터 모델을 단일 정본으로 고정하고, 네 Task가 `types/match.ts`·`mock-data.json`·`globals.css`를 공유 수정하므로 **순차 진행(한 번에 하나)**으로 직렬화했다. 신규 텔레메트리는 모두 Mock/Preview 정직 고지, 외부 실 자산 신규 취득은 별도 게이트로 분리했다. Phase G 한정으로 신규 컴포넌트 생성 허용을 명시했다.
- `.agent-reports/HANDOFF.json`을 최초 구현 Task **TASK-015UI12G-A** 핸드오프로 작성했다.

**변경된 파일**:
- `docs/tasks/TASK-015UI12G.md`, `TASK-015UI12G-A.md`, `TASK-015UI12G-B.md`, `TASK-015UI12G-C.md`, `TASK-015UI12G-D.md` (신규)
- `docs/PLAN.md` (G 계열 행 추가·현재 상태 갱신)
- `docs/PROGRESS.md` (이 항목)
- `.agent-reports/CURRENT.md` (Claude Plan·헤더·Next Action 갱신)
- `.agent-reports/HANDOFF.json` (TASK-015UI12G-A 구현 핸드오프 작성)

**금지 준수**:
- 제품 코드 수정 없음, 신규 자산·Mock·타입·패키지 실제 추가 없음(문서만), Git add/commit/push 없음, 구현 착수 없음.

**다음 단계**:
- 사람 승인 후 Codex가 `.agent-reports/HANDOFF.json` 범위 내에서 TASK-015UI12G-A를 구현 → Cursor 리뷰 → 사람 커밋 → G-B READY 승격(순차).

---

### TASK-015UI12F_PATCH 작성 — UI12F 후속 긴급 패치 기획 (READY)

**작업 내용 (Planner)**:
- TASK-015UI12F(DONE, HEAD `7a3e727`) 커밋 후 실제 브라우저 검증에서 식별된 5대 결함/요구사항을 긴급 패치로 묶어 `docs/tasks/TASK-015UI12F_PATCH.md`를 신설(READY)했다.
  1. **(BLOCKER)** 1440px에서 `.profile-dashboard-grid`의 stretch로 날짜별 경기 그룹 사이에 거대한 빈 영역이 벌어지는 데스크톱 레이아웃 붕괴.
  2. **(MAJOR)** 홈 검색을 형식 검증 우회 + 입력/공백 무관하게 무조건 고정 데모 프로필(`/players/demo-puuid-seoul-duelist-001`)로 즉시 진입.
  3. **(MAJOR)** 헤더 `meta-badges`의 `Demo Profile`·`Mock Data` 렌더링 제거 및 최근 20판 안내·DDΔ/R 툴팁 등 잔여 `Mock` 명칭 순화.
  4. **(MINOR)** `PlayerProfile.tsx`의 중첩 `<main className="profile-main">`을 `<div>`로 수정.
  5. **(NEW)** `next.config.js`에서 빌드 시점 `git rev-parse --short HEAD`를 환경 변수로 주입하고 `AppVersionBadge.tsx`에 커밋 해시 동적 노출 + UI Build 라벨 `UI12F_PATCH`로 갱신.
- 정합성 확인: 결함 위치를 소스에서 검증(`globals.css:469` 그리드, `HomeSearch.tsx:34-50`, `profile-overview.ts:38·89`, `PlayerHeaderCard.tsx:88-91`, `MatchSummaryList.tsx:293`, `RecentTwentySummaryCard.tsx:35`, `PlayerProfile.tsx:54`, `AppVersionBadge.tsx`, `next.config.js`).
- Allowed Changes에 `next.config.js`를 포함했고, 신규 Mock/타입/패키지 추가는 금지로 명시했다.

**변경된 파일**:
- `docs/tasks/TASK-015UI12F_PATCH.md` (신규, Status READY)
- `docs/PLAN.md` (UI12F_PATCH 행 추가·현재 상태 갱신)
- `docs/PROGRESS.md` (이 항목)
- `.agent-reports/CURRENT.md` (Claude Plan·헤더·Next Action 갱신)
- `.agent-reports/HANDOFF.json` (TASK-015UI12F_PATCH 구현 핸드오프 작성)

**금지 준수**:
- 제품 코드 수정 없음, 신규 자산·Mock·타입·패키지 없음, Git add/commit/push 없음, 구현 착수 없음(문서만).

**다음 단계**:
- 사람 승인 후 Codex가 `.agent-reports/HANDOFF.json`의 `allowed_files` 범위 내에서 TASK-015UI12F_PATCH를 구현 → Cursor 리뷰 → 사람 커밋.

---

### TASK-015UI12F 완료 — 전체 반응형 마감 및 전역 Mock 고지 단일화 (DONE)

**작업 내용**:
- **전역 Mock 고지 단일화 구현**:
  - `PlayerHeaderCard.tsx` 닉네임 우측에 `Mock Preview` 배지를 추가하고, 마우스 오버 시 "Riot Production API 승인 전에 제공되는 데모 데이터 기반의 화면입니다" 툴팁이 노출되는 고급스러운 호버 인터랙션을 globals.css를 통해 구현하였습니다.
  - 나머지 서브 컴포넌트(`PlayerProfile`, `ProfileSidebar`, `SeasonSummaryCard`, `RecentTwentySummaryCard`, `RankHistoryChart`, `MatchDetailPanel`, `MatchDetailView`, `MatchPerformanceTab`, `MatchAnalysisTab`, `MatchRoundsTab`)에서 중복되던 모든 Mock 관련 데이터 배지와 텍스트를 제거했습니다.
  - 특히 `ProfileSidebar.tsx` 내 `PanelHeader`와 최상단의 `sidebar-disclaimer` Mock 안내 문구 블록을 완전히 제거하여 professional한 첫인상을 확보했습니다.
  - `MatchAnalysisTab.tsx` 내의 불필요한 예시값 배너와 지표 카드들의 `예시값`/`미산정` 라벨을 제거하고 콤팩트한 미래 연동 안내 문구로 축소 정리했습니다.
- **반응형 390px / 1440px CSS 마감**:
  - `globals.css`에서 모바일(max-width: 640px 및 420px) 뷰포트에 맞게 카드 패딩과 텍스트 크기, K/D/A 셀 크기 조절 등을 슬림하게 압축 조율하였습니다.
  - 모바일(390px) 해상도에서 성적 요약 카드와 요약 지표들이 세로 1열 나열되던 것을 가로 2열(`repeat(2, 1fr)`)로 유지하며, 이전/피크 랭크 카드도 2열 구조로 흘려보내 공간 겹침 현상을 해결하고 스크롤 면적을 극대화했습니다.
  - 전체 카드들의 테두리 투명도를 `border: 1px solid rgba(255, 255, 255, 0.07)`로 통일하여 어두운 다크 톤의 시각적 깊이감(Depth)과 일체감을 완성했습니다.

**변경된 파일**:
- `frontend/src/components/PlayerHeaderCard.tsx`
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/ProfileSidebar.tsx`
- `frontend/src/components/SeasonSummaryCard.tsx`
- `frontend/src/components/RecentTwentySummaryCard.tsx`
- `frontend/src/components/RankHistoryChart.tsx`
- `frontend/src/components/MatchDetailPanel.tsx`
- `frontend/src/components/MatchDetailView.tsx`
- `frontend/src/components/MatchPerformanceTab.tsx`
- `frontend/src/components/MatchAnalysisTab.tsx`
- `frontend/src/components/MatchRoundsTab.tsx`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI12F.md`
- `docs/PLAN.md`
- `.agent-reports/CURRENT.md`
- `docs/PROGRESS.md` (이 로그)

---

### TASK-015UI12E 완료 — 사이드바 보조 통계 rail 정리 및 카드 축소 (DONE)

**작업 내용**:
- **사이드바 카드 순서 재배치**: `ProfileSidebar.tsx` 내의 각 카드 렌더링 순서를 발로란트 특화 통계가 상단에 오도록 재배치했습니다: 정확도 분포 → 역할별 승률 → 주 무기 → 맵별 승률 → 전체 시즌 최고 기록 → 이전 시즌 티어 → 활동 시간대 → 자주 함께한 팀원.
- **활동 시간대 및 팀원 접기/더보기 기능**: `useState`와 `'use client';` 지시어를 도입하여 활동 시간대와 자주 함께한 팀원 카드에 기본 3개 항목 제한 및 접기/더보기 토글 버튼을 적용했습니다.
- **전체 시즌 최고 및 이전 시즌 티어 요약 압축**: 최고 기록 이미지 크기를 72px에서 48px로, 텍스트 크기를 22px에서 16px로 줄이고, 이전 시즌 티어 이미지 크기를 34px에서 24px로 줄여 높이를 압축했습니다.
- **보조 카드 테두리 및 여백 압축**: `SeasonSummaryCard` 및 `RecentTwentySummaryCard`를 감싸는 border 색상을 옅고 투명한 `rgba(255, 255, 255, 0.07)`로 낮추고 배경 알파 값을 조절하여 플랫한 느낌으로 바꿨습니다. 카드 내부의 padding과 article 간의 margin(gap)을 각각 축소하고, 내부 폰트 크기도 조밀하게 줄여 컴팩트하게 구성했습니다.

**변경된 파일**:
- `frontend/src/components/ProfileSidebar.tsx`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI12E.md` (Status를 DONE으로 변경)
- `docs/PLAN.md` (TASK-015UI12E Status를 DONE으로 변경)
- `.agent-reports/CURRENT.md`
- `docs/PROGRESS.md` (이 로그)

---

### TASK-015UI12D 완료 — 경기 상세 탭 정리 및 스코어보드 우선화 (DONE)

**작업 내용**:
- **상세 패널 기본 탭 활성화 및 여백 조정**: 경기 상세를 열었을 때 스코어보드가 1순위로 기본 활성화 상태임을 확인하였고, 상세 패널과 탭 헤더의 간격 및 padding을 대폭 깎아내 공간 낭비를 억제했습니다.
- **스코어보드 팀 구분 및 YOU 강조**: `MatchScoreboardTab.tsx`에서 아군/적군 스코어보드를 명확히 분리하기 위해 `scoreboard-team-blue`와 `scoreboard-team-red` 클래스를 부여하고 은은한 블루/레드 배경색 톤과 좌측 3px 테두리 강조를 추가했습니다. 요원 이미지 크기를 28px로 조밀하게 줄여 정보 밀도를 높였으며, 플레이어 본인(YOU) 행에 테두리 보더 강조 및 어두운 대비의 배경색, 글로우 효과를 부여했습니다.
- **라운드 탭 압축**: `MatchRoundsTab.tsx`에서 진영 정보 미연동 관련 문구와 선택 라운드 상세 텍스트의 크기와 양을 축소하고, globals.css에서 타임라인 칩 패딩, min-width, 로그 버튼 및 요약 카드 영역의 간격을 콤팩트하게 다이어트했습니다.
- **성과 및 분석 탭 다이어트**: `MatchPerformanceTab.tsx`에서 미연동 전투 지표 안내를 인라인 형태의 한 줄 배너로 축소하고, `MatchAnalysisTab.tsx`에서 불필요한 예시 설명 문단을 배너와 통합 제거하여 정보 스캔 면적을 극대화했습니다. globals.css에서 각 탭 내 카드의 보더 두께를 투명하게 제어하고 padding과 font-size를 조밀하게 깎아냈습니다.

**변경된 파일**:
- `frontend/src/components/MatchScoreboardTab.tsx`
- `frontend/src/components/MatchPerformanceTab.tsx`
- `frontend/src/components/MatchAnalysisTab.tsx`
- `frontend/src/components/MatchRoundsTab.tsx`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI12D.md` (Status를 DONE으로 변경)
- `docs/PLAN.md` (TASK-015UI12D Status를 DONE으로 변경)
- `.agent-reports/CURRENT.md`
- `docs/PROGRESS.md` (이 로그)

---

### TASK-015UI12B 및 TASK-015UI12B_PATCH 완료 — 페이지 골격 재배치 + 자산 온보딩 + 긴급 모바일 패치 (DONE)

**작업 내용**:
- **TASK-015UI12B 완료**: `PlayerProfile.tsx` 레이아웃을 masthead → control → main(최근 경기 리스트) + rail(보조) 구조로 재배치하고 중복 노출되던 시즌 KPI 요약 카드를 마스트헤드로 통합 정본화했다. 로컬 Riot content catalog에서 필요한 요원/맵 이미지를 선별 복사하고 `asset-map.ts` 및 `SOURCES.md`에 연동 완료.
- **TASK-015UI12B_PATCH 완료**: Visual QA(`docs/ui12-visual-qa.md`)에서 제기된 모바일 390px 마스트헤드 겹침(MAJOR) 현상 및 `PeakDiamond` 띄어쓰기 오류 해결. 1023px 이하에서 수직 flex 스택으로 흐르게 하고 높이 제한을 풀어 겹침을 해결하고 띄어쓰기를 추가했다.
- 두 작업 모두 Codex 구현, Cursor 리뷰 통과 후 최종 커밋 완료(DONE)되어 메인 브랜치에 동기화되었다.

**변경된 파일**:
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/PlayerHeaderCard.tsx`
- `frontend/src/components/ProfileFilterBar.tsx`
- `frontend/src/components/MatchSummaryList.tsx`
- `frontend/src/app/globals.css`
- `frontend/src/lib/asset-map.ts`
- `frontend/public/assets/SOURCES.md` 및 선별 자산들
- `docs/tasks/TASK-015UI12B.md`, `docs/tasks/TASK-015UI12B_PATCH.md` (Status를 DONE으로 갱신)
- `docs/PLAN.md`, `docs/PROGRESS.md`, `.agent-reports/CURRENT.md`

---
### TASK-015UI12D 작성 — 경기 상세 탭 정리 및 스코어보드 우선화 (READY)

**작업 내용**:
- **목표**: 경기 상세 패널에서 스코어보드 탭을 기본 활성(1순위)으로 두고, 팀 구분 헤더/자기 행 강조 강화 및 라운드/성과/분석 탭 노출 압축.
- **기획 및 문서 수립**: `docs/tasks/TASK-015UI12D.md`를 신설하고 READY 상태로 배치했다.
  * Allowed: `MatchDetailPanel.tsx`, `MatchScoreboardTab.tsx`, `MatchRoundsTab.tsx`, `MatchPerformanceTab.tsx`, `MatchAnalysisTab.tsx`, 관련 CSS.
  * Forbidden: 사이드바 내부 분해(UI12E), CSS primitive 리팩토링(UI12F) 등 타 단계 범위 침범 금지. 신규 Mock/타입/자산/패키지 금지.
- **상태 동기화**: `docs/PLAN.md` 및 `docs/PROGRESS.md`에 UI12C 완료와 UI12D READY를 동기화하고, `.agent-reports/CURRENT.md`를 "Codex implements TASK-015UI12D" 상태로 갱신했다.

**변경된 파일**:
- `docs/tasks/TASK-015UI12D.md` (신규)
- `docs/PLAN.md`
- `docs/PROGRESS.md` (이 항목)
- `.agent-reports/CURRENT.md`

**금지 준수**:
- 제품 코드 직접 수정 없음. 커밋/푸시 없음. 신규 Mock/자산/타입/패키지 없음.

**다음 단계**:
- Codex가 TASK-015UI12D를 구현(Allowed 범위 내) → Cursor 리뷰 → 사람 커밋.

---

### TASK-015UI12C 완료 — 경기 리스트 스캔성 정리 (DONE)

**작업 내용**:
- **경기 행 높이 다이어트**: 기본 경기 행의 세로 높이를 70~80px 수준으로 대폭 축소하여 한 화면에 여러 경기가 콤팩트하게 노출되도록 조정.
- **상세 지표 및 10인 요원 숨김/압축**: K/D/A 외의 세부 지표 및 10인 요원 목록을 기본 행에서 숨기고, 호버/펼침 시에만 노출되도록 구현하여 리스트 스캔성 극대화.
- 검증 통과 후 커밋 및 동기화 완료.

**변경된 파일**:
- `frontend/src/components/MatchSummaryList.tsx`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI12C.md` (Status를 DONE으로 갱신)
- `docs/PLAN.md`, `docs/PROGRESS.md`, `.agent-reports/CURRENT.md`

---

## 2026-06-23

### TASK-015UI11B 작성 완료 — 프로필 상단/요약 영역 정리 (READY)

**상태 반영**:
- TASK-015UI11A는 Cursor COMMIT_READY 후 commit·push 완료되어 DONE으로 간주한다.
  그 첫 구현 Task로 UI11B를 작성했다.

**작업 내용**:
- `docs/tasks/TASK-015UI11B.md` 신설(READY): 프로필 페이지 상단/요약 영역만 다루는
  Task. Status/Goal/Background/Current Problems/Reference Direction/User Value for
  Riot API Application/Allowed·Forbidden Changes/Existing Data·Assets Available/
  Required UI Changes/Acceptance Criteria/Verification Commands/Stop Conditions/
  Human Decisions/Codex·Cursor Notes 포함.
- 범위: `PlayerHeaderCard`와 상단 요약의 정보 위계 정리. 기존 데이터(`SeasonSummary`
  winRate·kd·acs·adr·headshotPercentage, `RecentTwentySummary` winRate·kast,
  `CareerPeakRank`/`PreviousSeasonRank`)만으로 핵심 KPI 요약·티어 강조·최근 폼을
  상단으로 끌어올린다. UI Build 배지·`Mock / Preview` 고지 유지.
- 금지: 신규 Mock/타입 필드/외부 자산/패키지, backend·docker·scripts, 그리고 최근
  경기 리스트·스코어보드·라운드/성과/분석·사이드바 구현 착수, OP.GG/Tracker
  pixel-perfect 복제.
- 데이터 검증: 현재 `PlayerHeaderCard`는 요원·ID·Lv·region·badges·티어·Preview
  Score만 노출하고 KPI/최근 폼은 하위 카드에 분산되어 있어, 상단 요약 끌어올림이
  기존 데이터만으로 가능함을 타입(`profile-overview.ts`)으로 확인.

**변경된 파일**:
- `docs/tasks/TASK-015UI11B.md` (신규, Status READY)
- `docs/PLAN.md` (UI11A DONE·UI11B READY/다음 구현 후보 표기, 현재 상태 갱신)
- `docs/PROGRESS.md` (이 항목)
- `.agent-reports/CURRENT.md` (Current Task UI11B·TASK_READY·Next Action 갱신)

**금지 준수**:
- 제품 코드 수정 없음, 신규 자산·Mock·패키지 없음, Git add/commit/push 없음,
  UI11B 구현 착수 없음(문서만).

**다음 단계**:
- Cursor가 TASK-015UI11B를 리뷰한다. 승인되면 Codex가 구현한다. UI11C 이후는
  미착수.

### TASK-015UI11A 계획 시작 — Riot API 신청용 UI 완성 마스터 플랜

**상태 반영**:
- TASK-015UI10A는 commit·**push 완료**되어 DONE이다(HEAD `520f8fa`,
  `origin/main`도 `520f8fa`, 워크트리 clean). 이전 보고의 `COMMITTED_PUSH_BLOCKED`
  는 push 이후 해소됐다.

**작업 내용**:
- UI10A 완료 후, Riot Production API 신청 전 프로필/경기 상세 페이지를 "실제
  운영 가능한 전적 분석 서비스"처럼 완성하기 위한 **UI11 마스터 플랜** 단계로
  전환했다.
- `docs/tasks/TASK-015UI11A.md` 신설(READY): Final Purpose·Strategy·Reference
  Direction·신청 전(Follow)/승인 후(Defer) 분리·UI11 작업 분할(UI11A~UI11G)·
  Allowed/Forbidden·AC·Verification·Stop·Human Decisions 포함.
- UI11 분할: UI11A(마스터 플랜)·UI11B(프로필 상단/요약)·UI11C(최근 경기 리스트)·
  UI11D(스코어보드)·UI11E(라운드/성과/분석)·UI11F(사이드바 요원/무기/맵/역할군)·
  UI11G(반응형/마감/신청 전 점검).
- UI9B/UI9C/UI9D는 독립 착수가 아니라 UI11 안의 자산·Mock 결정 입력으로 재분류
  (UI9B→UI11D/UI11F, UI9C→UI11E, UI9D→UI11F). UI9E는 UI11B/UI11G로 흡수.
- 차별화 기능 강화는 API 승인 후(Phase 4 실 API/RSO, Phase 5 분석)로 분리함을
  PLAN에 명확화하고, 현재 마일스톤을 "Riot API 신청용 전적 서비스 완성"으로 명시.

**변경된 파일**:
- `docs/tasks/TASK-015UI11A.md` (신규, Status READY)
- `docs/PLAN.md` (현재 목표·Phase 2 목표 명확화, UI11A~UI11G 행 추가, UI9B/C/D/E
  재분류, UI10A DONE·push 완료 반영)
- `docs/PROGRESS.md` (이 항목)
- `.agent-reports/CURRENT.md` (Current Task UI11A·PLAN_COMPLETE·Next Action 갱신)

**금지 준수**:
- 제품 코드 수정 없음(frontend/backend/docker/scripts), 신규 자산·신규 Mock·npm
  패키지 변경 없음, Git add/commit/push 없음, UI11B 이후 구현 착수 없음.

**다음 단계**:
- 사람/GPT가 TASK-015UI11A 마스터 플랜을 검토한다. 승인되면 Codex가 첫 UI11
  구현 Task(UI11B 등)를 진행한다.

### TASK-015UI10A 구현 완료 — UI Build 배지 + 레퍼런스 감사·가드레일 고정

**작업 내용**:
- 프로필 화면 우하단에 작은 고정 배포 식별 배지를 추가했다.
- 배지는 `GameProbe Preview`, `UI Build: UI10A`, `App v0.1.0`만 표시한다.
  버전은 기존 `frontend/package.json`의 `version` 필드를 참조한다.
- `docs/ui-reference-audit.md`에 안전하게 구현 가능한 항목과 신규 데이터/자산이
  필요한 항목을 명시해 "무엇을 가져올지/가져오지 않을지" 판단 근거를 보강했다.
- `docs/ui-design-guardrails.md`에 Tracker.gg / OP.GG는 레퍼런스일 뿐 템플릿이
  아니라는 기준을 명시했다.
- `docs/tasks/TASK-015UI10A.md`에 구현 메모와 검증 결과를 기록하고 Status를
  `COMMIT_READY`로 갱신했다.

**변경된 파일**:
- `frontend/src/components/AppVersionBadge.tsx` (신규)
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/app/globals.css`
- `docs/ui-reference-audit.md` (신규)
- `docs/ui-design-guardrails.md` (신규)
- `docs/tasks/TASK-015UI10A.md` (신규)
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `.agent-reports/CURRENT.md`

**검증 결과**:
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `git diff --check`: 성공.
- 금지 경로(`package.json`, lockfile, backend, docker, scripts, assets, SOURCES.md,
  data, types, asset-map) 변경 없음 확인: 성공.
- `grep -R "https://\|http://\|Math.random" frontend/src/components frontend/src/app/globals.css || true`: 출력 없음.
- `grep -R "first kill\|first death\|clutch\|multikill\|plant\|defuse\|spike planter\|spike defuser" frontend/src/components || true`: 기존 `SeasonSummaryCard.tsx`의 `clutchWinRate` 1건만 출력. 이번 Task 신규 이벤트/Mock 아님.

**금지 준수**:
- UI10B/UI10C/UI10D, UI9B/UI9C/UI9D 구현 착수 없음.
- 신규 자산, 신규 Mock, 신규 타입 필드, 신규 npm 패키지, 외부 URL, 난수, backend/
  docker/scripts 변경 없음.
- git SHA·빌드 시각은 빌드 설정 주입이 필요하므로 표시하지 않았다.

**다음 단계**:
- 배포된 프로필 화면에서 UI Build 배지가 보이는지 확인하고, reference audit과
  guardrails를 기준으로 다음 UI10B 범위를 결정한다.

### UI 방향 검증 단계 전환 — 레퍼런스 감사·가드레일 + TASK-015UI10A 신설

**작업 내용**:
- UI9A까지의 방향(전적 사이트식 정보 구조)이 맞는지 확신이 어려워, UI9B/UI9C/
  UI9D를 바로 착수하는 대신 Tracker.gg / OP.GG와의 차이를 먼저 감사하고 작업
  순서를 재정렬하는 단계로 전환했다.
- `docs/ui-reference-audit.md` 작성: 7개 영역(프로필 상단·좌측/보조·최근 경기
  리스트·스코어보드·라운드 상세·성과/분석·버전 표시)을 현재 GameProbe / Tracker·
  OP.GG식 패턴 / 차이점 / 가져올 것 / 가져오지 않을 것 / 필요한 데이터·에셋 /
  구현 난이도 / 사람 판단 필요 컬럼으로 비교.
- `docs/ui-design-guardrails.md` 작성: 가져올 것·가져오지 않을 것·표절 방지
  기준·데이터 없는 UI 금지 기준·외부 자산/Mock Stop Condition.
- `docs/tasks/TASK-015UI10A.md` 신설(READY): 배포 버전 표시 + 레퍼런스 감사·
  가드레일 문서 고정. 신규 자산/Mock/타입/패키지 없이 기존 빌드 정보만 사용.
- PLAN.md: UI10A 표 행 추가, UI9B/UI9C/UI9D를 "audit 후 재정렬 후보"로 표기,
  현재 상태 문구를 방향 검증 단계로 갱신.

**변경된 파일**:
- `docs/ui-reference-audit.md` (신규)
- `docs/ui-design-guardrails.md` (신규)
- `docs/tasks/TASK-015UI10A.md` (신규, Status READY)
- `docs/PLAN.md` (UI10A 추가·UI9B/C/D 재정렬 후보 표기·현재 상태 갱신)
- `docs/PROGRESS.md` (이 항목)
- `.agent-reports/CURRENT.md` (Current Task UI10A·PLAN_COMPLETE·Next Action 갱신)

**금지 준수**:
- 제품 코드 수정 없음, 외부 자산 다운로드 없음, 신규 Mock 없음, Git
  add/commit/push 없음, UI9B/UI9C/UI9D 구현 착수 없음.

**다음 단계**:
- 사람/GPT가 `ui-reference-audit.md`를 검토·확정한다. 승인되면 Codex가
  TASK-015UI10A(배포 버전 표시)를 구현한다. UI9B/C/D 또는 UI10 계열 다음 Task는
  audit 확정 후 결정한다.

### TASK-015UI9A commit 완료 + 문서 정합성 정리

**작업 내용**:
- TASK-015UI9A가 Cursor 리뷰(COMMIT_READY) 통과 후 `[TASK-015UI9A] realign
  profile and match detail layout` 커밋으로 반영됐다(HEAD `aecdb7e`, 워크트리
  clean). 커밋에는 `docs/tasks/TASK-015UI9A.md`를 포함한 11개 파일이 포함됐다.
- 커밋 전 상태(HEAD `eb108a1`, 미커밋)를 가리키던 `PLAN.md` 현재 상태 문구와
  `.agent-reports/CURRENT.md`(Current Task·Git State·Next Action)를 커밋 후
  실제 git 상태로 갱신했다. UI9A 표 행과 TASK 문서 Status는 이미 DONE으로
  정합했다.

**변경된 파일**:
- `docs/PLAN.md` (현재 상태 문구: UI9A 커밋 반영, 다음 단계 갱신)
- `docs/PROGRESS.md` (이 항목)
- `.agent-reports/CURRENT.md` (header·Claude Plan·Next Action 갱신)

**다음 단계**:
- UI9B/UI9C/UI9D는 신규 외부 자산·신규 Mock 사람 결정(PENDING-DECISION) 전
  착수하지 않는다. UI9E(PLANNED)도 UI9 데이터/에셋 결정 이후로 둔다.

---

## 2026-06-22

### TASK-015UI9A 구현 완료 — 프로필·경기 상세 정보 구조 재정렬

**작업 내용**:
- 프로필 페이지의 상단 헤더 → 필터 → 좌측 보조/중앙 메인 흐름은 유지하되,
  콘텐츠 최대 폭을 1320px 이내로 넓히고 카드 간격·padding·섹션 헤더를 조정해
  전적 사이트식 대시보드에 가깝게 정보 위계를 정리했다.
- `SeasonSummaryCard`, `RankHistoryChart`, `RecentTwentySummaryCard`,
  `MatchSummaryList`가 같은 카드/헤더/여백 문법을 공유하도록
  `profile-overview-stack`, `dashboard-section-head` 기반 구조를 추가했다.
- 최근 경기 행은 기존 UI7B 필드와 날짜 그룹·태그·펼침 상세를 유지하면서,
  K/D/A·K/D·ACS·ADR·KAST·DDΔ/R·HS%·티어 변동을 라벨/값이 분리된 조밀한 통계
  셀로 정렬했다. 신규 지표는 추가하지 않았다.
- 경기 상세 4탭은 `MatchDetailPanel` 공통 헤더와 탭별 섹션 헤더를 추가해
  스코어보드/라운드/성과/분석의 카드 문법을 맞췄다. UI8A 탭 접근성과 UI8B
  라운드 타임라인은 보존했다.
- 분석 탭의 기존 예시 점수 72/68/—/61은 유지하되 Mock Preview 예시값임을
  명확히 표현했다.

**변경된 파일**:
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/MatchSummaryList.tsx`
- `frontend/src/components/MatchDetailPanel.tsx`
- `frontend/src/components/MatchScoreboardTab.tsx`
- `frontend/src/components/MatchRoundsTab.tsx`
- `frontend/src/components/MatchPerformanceTab.tsx`
- `frontend/src/components/MatchAnalysisTab.tsx`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI9A.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `git diff --check`: 성공.
- 신규 자산/Mock/타입/패키지/점수 모델 변경 없음 확인: 성공.
- 외부 Riot CDN 런타임 참조 없음 확인: 성공.
- UI8A 접근성 및 UI8B 라운드 타임라인 보존 grep 확인: 성공.

**이슈/위험**:
- `grep`에서 기존 `SeasonSummaryCard.tsx`의 `clutchWinRate` 표시가 잡히지만,
  UI7A에서 도입된 기존 시즌 요약 필드이며 이번 Task에서 신규 이벤트/Mock을
  추가한 것은 아니다.
- 요원 placeholder, 역할군 아이콘, 라운드 이벤트 상세, 무기 적중 분포는 신규
  자산/Mock이 필요한 UI9B~UI9D 범위로 남아 있다.
- Git add/commit/push는 수행하지 않았다.

**다음 단계**:
- Cursor 리뷰 대상은 TASK-015UI9A 변경 파일, 검증 결과, Forbidden 범위 준수
  여부다. TASK-015UI9B 이후는 사람 결정 전 시작하지 않는다.

---

### TASK-015UI9 계열 계획 수립 — OP.GG/Tracker.gg식 전체 정보 구조 재정렬 (Planner)

**작업 내용**:
- TASK-015UI8B가 commit·push되어 DONE(HEAD `eb108a1`). 그러나 UI8A·UI8B 완료
  후에도 화면이 전적 사이트(OP.GG/Tracker.gg) 정보 구조와 다르다는 피드백을
  받았다. 목표를 "조금씩 수정"에서 "전적 사이트식 정보 구조로 전체 재정렬"로
  전환했다.
- 현재 구조를 정밀 조사했다(Explore). 레이아웃은 2열·최대 1240px·4탭이 이미
  있으나 폭·밀도·위계가 약하고, 4탭이 서로 다른 카드 문법으로 성장해 통일성이
  부족하다. **가장 큰 격차는 데이터/에셋 완성도**다: 요원 실 PNG 3/10(스코어보드
  7명 placeholder), 역할군 아이콘 부재, 무기 Head/Body/Legs 분포 필드 부재,
  `MatchRound`에 킬/스파이크 이벤트 부재(라운드별 공격/수비 side 신뢰 불가).
- 사용자 권장 분할 후보 A/B를 검토해 **후보 A를 다듬은 5분할**을 채택했다.
  근거: 후보 B의 "데이터/에셋 완성도"가 한 Task에 신규 자산+신규 Mock+라운드
  이벤트를 모두 묶어 위험하다. 후보 A처럼 디자인 구조(UI9A·UI9E)와 데이터/에셋
  확장(UI9B 스코어보드 자산·UI9C 라운드 이벤트·UI9D 사이드바 자산/Mock)을
  분리하면 사람 결정 게이트가 작업별로 격리된다.
- 미착수였던 UI8C/UI8D/UI8E를 UI9 계열로 SUPERSEDED 처리했다(UI8C→UI9B,
  UI8D→UI9D, UI8E→UI9A/UI9E).
- 첫 실행 대상으로 **사람 자산/Mock 결정이 필요 없는 TASK-015UI9A**(정보 구조·
  레이아웃 골격 재정렬, 디자인 구조만)를 선정하고 Task 문서를 작성했다. 기존
  데이터·에셋만으로 프로필 대시보드·최근 경기 행·4탭 카드 시스템을 통일한다.

**생성·수정한 문서**:
- `docs/tasks/TASK-015UI9A.md` (신규, Status READY)
- `docs/PLAN.md` (UI8C/D/E SUPERSEDED + UI9A~E 추가 + 현재 상태 갱신)
- `docs/PROGRESS.md` (이 로그)
- `.agent-reports/CURRENT.md` (UI8B 커밋 후 상태로 정합성 정리 + Claude Plan 갱신)

**사람 판단 필요**:
- OP.GG/Tracker.gg 유사도 한계(구조 참고만, 복제 금지), 전체 폭·카드 밀도 기준.
- (UI9A) 분석 탭 예시 점수 유지(기본) vs 축소/제거, UI8A/UI8B 유지(기본) vs 일부 대체.
- (UI9B) 신규 요원 7개 자산 추가 여부·출처.
- (UI9C) 라운드 첫 킬/스파이크/클러치 이벤트 Mock 추가 여부.
- (UI9D) 역할군 아이콘 출처, 무기 Head/Body/Legs Mock 추가 여부.

**다음 단계**:
- TASK-015UI9A 구현은 Codex가 수행한다(commit/push 없이). 사람 승인 후 착수.
- UI9B/UI9C/UI9D는 위 자산/Mock 사람 결정 확정 후 Task 문서를 작성한다.

---

### TASK-015UI8B 구현 완료 — 라운드 상세 타임라인 재설계

**작업 내용**:
- `MatchRoundsTab` 상단에 전반/후반/연장별 라운드 결과 칩 스트립을 추가했다.
  각 칩은 라운드 번호, 우리 팀 기준 승/패, `endType` 기반 종료 라벨(제압/폭발/
  해제)을 표시하고 hover/focus/선택 상태를 제공한다.
- 전반/후반/연장 구간 헤더에 라운드 수, 구간 승패, 구간 종료 누적 스코어,
  종료 타입 분포를 표시했다. 연장이 없으면 기존처럼 연장 구간은 렌더링하지
  않는다.
- 기존 큰 라운드 카드 반복을 얇은 로그형 버튼 행으로 바꿨다. 각 행은 R번호,
  승/패, 누적 스코어, 종료 타입, 이벤트 기록 없음만 표시한다.
- 칩/행 선택 시 선택 라운드 상세 영역에 라운드 번호, 승패, 누적 스코어, 종료
  타입을 표시한다. 새 이벤트 데이터는 생성하지 않았다.
- 사용자 결정에 따라 공격/수비 side, ATK/DEF, 공격팀/수비팀 라벨은 표시하지
  않았다. `scoreAfterRound.attackers/defenders`는 누적 스코어 숫자로만 사용했다.

**변경된 파일**:
- `frontend/src/components/MatchRoundsTab.tsx`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI8B.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `git diff --check`: 성공.
- Forbidden 범위 확인: 성공.
- 외부 URL/랜덤 사용 없음 확인: 성공.
- 라운드 이벤트 임의 생성 키워드 없음 확인: 성공.
- `.agent-reports/CURRENT.md` 갱신 확인: 성공.

**이슈/위험**:
- 현재 Mock에는 실제 킬 이벤트, 첫 킬/첫 데스, 스파이크 설치·해제자, 클러치,
  멀티킬 정보가 없어 라운드 상세는 파생 가능한 요약만 제공한다.
- Git add/commit/push는 수행하지 않았다.

**다음 단계**:
- Cursor 리뷰 대상은 TASK-015UI8B 변경 파일과 금지 범위 검증 결과다.
- UI8C/UI8D는 신규 자산·Mock 사람 결정 후 진행한다. TASK-016 이상은 시작하지
  않았다.

---

### TASK-015UI8B 계획 수립 — 라운드 상세 타임라인 재설계 (Planner)

**작업 내용**:
- TASK-015UI8A가 Cursor 리뷰 통과 후 commit·push되어 DONE(HEAD `8c48f3f`).
  그러나 배포 화면에서 라운드 탭이 여전히 표 느낌이고 라운드 흐름이 한눈에
  보이지 않는다는 피드백을 받았다.
- 라운드 탭 현재 구현(`MatchRoundsTab`)과 타입·Mock을 조사했다. `MatchRound`는
  `roundNumber/winningTeam/endType/scoreAfterRound`만 갖고, Mock은 Ascent
  경기(`matchDetails[0]`)에만 rounds 22개가 있다. **핵심 발견: attackers/
  defenders는 경기 내내 고정된 팀 식별자라 라운드별/구간별 "공격/수비 side"를
  신뢰성 있게 단정할 수 없다**(하프타임 진영 교체 정보 부재).
- 이를 근거로 라운드 탭을 전적 사이트 타임라인 문법으로 재해석하되 **파생
  가능한 값만** 쓰는 TASK-015UI8B를 계획했다: (1) 라운드 결과 칩 스트립,
  (2) 전반/후반/연장 구간 요약, (3) 압축 로그 행, (4·선택) 선택 라운드 상세.
  첫 킬/스파이크 설치·해제자/클러치/킬 타임라인/공격·수비 side는 생성 금지.
- UI8 분할안을 재조정했다: 신규 UI8B=라운드 타임라인, 기존 작업은 한 글자씩
  밀어 UI8C(스코어보드 10요원 이미지)·UI8D(사이드바 역할군·무기 분포)·
  UI8E(전체 레이아웃·시각 위계)로 재배치했다.

**생성·수정한 문서**:
- `docs/tasks/TASK-015UI8B.md` (신규, Status READY)
- `docs/PLAN.md` (UI8A DONE 반영 + UI8B 재정의 + UI8C/D/E 재배치)
- `docs/PROGRESS.md` (이 로그)
- `.agent-reports/CURRENT.md` (Claude Plan + 공통 상태)

**사람 판단 필요**:
- UI8B: 라운드별/구간별 공격·수비 표기 방식(기본=사실로 단정하지 않음 / 또는
  "가정" 라벨 후 R1–12·13–24 교체 규칙). 선택 라운드 상세 구현 여부.
- 라운드 이벤트(첫 킬/스파이크 등) Mock 추가는 별도 Task로만 가능.
- UI8C/UI8D: 신규 요원 자산·역할군 아이콘 출처, 무기 Head/Body/Legs Mock.
- UI8E: 전체 레이아웃 폭/헤더/그래프 재설계 방향.

**다음 단계**:
- TASK-015UI8B 구현은 Codex가 수행한다(commit/push 없이). 사람 승인 후 착수.
- UI8C/UI8D는 자산/Mock 사람 결정 확정 후 Task 문서를 작성한다.

---

### TASK-015UI8A 문서 보강 + 정합성 조정 (Planner)

**작업 내용**:
- 재계획 요청 검토 중 정합성 충돌을 확인했다: UI8A는 이미 Codex 구현
  완료(작업 트리 6개 파일 modified, 미커밋)이고 문서·PLAN은 DONE인데, 요청은
  UI8A를 Status READY로 새로 작성하라는 내용이었다. HEAD는 여전히 UI7B
  `b0cfbf9`(UI8A 미커밋·미리뷰).
- 사람 판단을 받아 **구현은 유지하고 UI8A 문서만 보강**하기로 했다. UI8A를
  READY로 되돌리거나 작업 트리 구현을 폐기하지 않았다.
- UI8A 문서를 새 템플릿으로 재구성했다: Status를 `IMPLEMENTED — 리뷰·커밋
  대기`로 정정하고 Background, Current Problems, Human Decisions(표),
  Codex Implementation Notes, Cursor Review Notes 섹션과 **운영 원칙(Git /
  커밋)**을 추가했다. 기존 Goal/Allowed/Forbidden/AC/Verification/Stop
  Conditions·구현 결과는 보존했다.
- 운영 원칙 명문화: Codex 구현 단계에서는 commit/push하지 않는다. Cursor 최종
  리뷰에서 BLOCKER/MAJOR가 없고 검증이 모두 통과하면 별도 지시로 commit/push까지
  진행한다.
- PLAN.md의 UI8A 상태를 DONE → `IMPLEMENTED — 리뷰·커밋 대기`로 정정했다.

**생성·수정한 문서**:
- `docs/tasks/TASK-015UI8A.md` (문서 보강, Status 정정 — 구현 유지)
- `docs/PLAN.md` (UI8A 상태 정정 + 운영 원칙 반영)
- `docs/PROGRESS.md` (이 로그)
- `.agent-reports/CURRENT.md` (Claude Plan + 공통 상태)

**사람 판단 필요(후속)**:
- UI8A 분석 탭 예시 점수 유지(기본) vs 제거.
- UI8C: 신규 요원 7개 자산 추가 여부, 라운드 첫 킬/스파이크 이벤트 Mock.
- UI8B: 역할군 아이콘 출처, 무기 Head/Body/Legs Mock.
- UI8D: 전체 레이아웃 폭/헤더/그래프 재설계 방향.

**다음 단계**:
- UI8A를 Cursor 최종 리뷰로 넘긴다. 통과 시 별도 지시로 commit/push.
- UI8B/UI8C는 위 자산/Mock 사람 결정 확정 후 Task 문서를 작성한다. UI8D는 별도.

---

## 2026-06-17

### TASK-015UI8A 구현 완료

**작업 내용**:
- 인라인 경기 상세 4탭의 활성 상태를 강화했다. 활성 탭은 배경색, 글자색,
  테두리, 하단 강조선으로 구분되며 `role="tablist"`/`role="tab"`/
  `role="tabpanel"`과 `aria-selected`, `aria-controls`, `id`, `aria-labelledby`
  연결을 보강했다. 좌우 화살표 키로 탭 이동과 활성화가 가능하다.
- 라운드 탭을 압축했다. 라운드 번호 기준 R1-12 전반, R13-24 후반, R25+ 연장
  그룹으로 나누고, 각 행은 기존 Mock 필드(라운드 번호, 스코어, 우리 팀 고정
  진영, 승리팀, 승패, 종료 방식)만 사용한다. 근거 없는 킬 이벤트 placeholder는
  제거했다.
- 성과 탭은 근거 있는 6개 지표(우리 팀 MVP, 상대 팀 MVP, 개인 ACS 순위, K/D,
  HS%, ADR)를 유지하고, 첫 킬/첫 데스·멀티킬·클러치·플랜트/해제 placeholder를
  단일 "연동 후 제공 예정" 안내 영역으로 통합했다.
- 분석 탭은 "분석 미리보기"와 "Example Analysis / Mock Preview"로 명칭과
  고지를 정리했다. 기존 예시 점수 72/68/61은 유지하되 GameProbe Score, Riot
  공식 지표, 실제 AI 분석 결과가 아님을 명확히 표시했다.
- 신규 외부 자산, 신규 Mock 이벤트/수치, 스코어보드 참가자 구조 변경은 하지
  않았다.

**변경된 파일**:
- `frontend/src/components/MatchTabs.tsx`
- `frontend/src/components/MatchDetailPanel.tsx`
- `frontend/src/components/MatchRoundsTab.tsx`
- `frontend/src/components/MatchPerformanceTab.tsx`
- `frontend/src/components/MatchAnalysisTab.tsx`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI8A.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `git diff --check`: 성공.
- 탭 접근성 속성 grep 확인: 성공.
- 신규 자산/Mock 추가 없음 확인: 성공.
- 변경 금지 영역 확인: 성공.
- 외부 Riot CDN 런타임 참조 없음 확인: 성공.
- `MatchScoreboardTab.tsx` diff 없음 확인: 성공.

**이슈/위험**:
- 스코어보드의 일부 요원 placeholder, 역할군 아이콘, 무기 적중 분포, 라운드
  첫 킬/스파이크 설치·해제자 정보는 신규 자산 또는 신규 Mock이 필요해 UI8B/UI8C
  범위로 남아 있다.

**다음 단계**:
- TASK-015UI8A는 완료됐다.
- TASK-015UI8B/UI8C는 사람 결정 후 진행한다. TASK-016 이상은 시작하지 않았다.

---

### TASK-015UI8 계열 계획 수립 (프로필 화면 완성도)

**작업 내용 (Planner)**:
- Riot Production API 신청 전 프로필 페이지의 시각적·사용성 완성도를 높이기
  위한 개선 요구(경기 상세 4탭·사이드바·전체 레이아웃)를 의존성·위험도 기준으로
  분할했다.
- 현재 코드 조사로 핵심 의존성을 확인했다: 스코어보드 Mock 참가자 10명은 모두
  `agentId`를 갖지만 `asset-map.ts`는 jett/sova/omen 3개만 실제 PNG로 매핑하고
  나머지 7명은 placeholder로 떨어진다. 역할군(Duelist/Initiator/Controller/
  Sentinel) 아이콘 자산은 부재하다. 라운드 Mock에는 첫 킬·스파이크 설치/해제자
  등 이벤트 필드가 없다. → 스코어보드 10요원 이미지·라운드 이벤트·역할군
  아이콘·무기 적중 분포는 **신규 외부 자산 또는 신규 Mock**이 필요해 사람 결정
  대상이다.
- 사용자의 3분할안(UI8A 4탭 / UI8B 사이드바 / UI8C 레이아웃)을 **4분할로 재구성**
  했다. 4탭 작업 중 자산·Mock이 필요 없는 사용성·표시 정리(탭 활성/접근성·라운드
  압축·성과 통합·분석 명칭)를 **TASK-015UI8A**로 먼저 분리하고, 자산/Mock 결정에
  묶이는 스코어보드·라운드 데이터 확장을 **TASK-015UI8C**로 떼어냈다. 사이드바는
  **TASK-015UI8B**(역할 아이콘·무기 적중 분포, 자산/Mock 결정 대기), 전체
  레이아웃·시각 위계는 **TASK-015UI8D**로 별도화했다.
- 첫 실행 대상으로 사람 결정이 필요 없는 **TASK-015UI8A**를 선정하고 Task 문서를
  작성했다. UI8B/UI8C는 신규 자산 출처·신규 Mock 항목에 대한 사람 결정 후 착수한다.

**생성·수정한 문서**:
- `docs/tasks/TASK-015UI8A.md` (신규, Status READY)
- `docs/PLAN.md` (Phase 2 표·현재 상태에 UI8 계열 반영)
- `docs/PROGRESS.md` (이 로그)

**사람 판단 필요(착수 전)**:
- UI8C 스코어보드 10요원 이미지: 신규 7개 요원 자산 취득 승인 여부(또는
  placeholder 유지).
- UI8B 역할군 아이콘: 신규 자산 출처 승인 여부.
- UI8B 무기 적중 분포(Head/Body/Legs)·라운드 이벤트: 신규 Mock 추가 승인 여부.

**다음 단계**:
- TASK-015UI8A 구현은 Codex가 수행한다. 사람 승인 후 착수한다.
- UI8B/UI8C는 위 사람 결정 확정 후 Task 문서를 작성한다.

---

## 2026-06-16

### TASK-015UI7B 구현 완료

**작업 내용**:
- 프로필 페이지 중앙 하단 최근 전적을 날짜별 `DailyMatchGroup`으로 그룹화했다.
  그룹 헤더에는 날짜, 경기 수, 승/패, 평균 K/D, 평균 DDΔ/R, 평균 HS%, 평균
  ACS를 표시한다.
- `MatchSummaryList` 경기 행을 재설계했다. 맵 사진은 사용하지 않고 CSS 기반
  작은 맵 아이콘과 맵명만 표시하며, 승패, 시간, 모드, 스코어, 요원, K/D/A,
  K/D, ACS, ADR, KAST, DDΔ/R, HS%, 티어 변동, Match Preview Score, 등급,
  펼침 상태를 한 행에 배치했다.
- `MatchInsight`, `MatchHighlightTag`, `DailyMatchGroup` 별도 타입과
  `getMatchInsight(matchId)` 로더, 날짜 그룹화/태그 파생 유틸을 추가했다.
  기존 `Player`/`Match*` 타입과 기존 Mock 데이터 로더 시그니처는 변경하지
  않았다.
- KAST, DDΔ/R, 티어 변동, 이벤트 기반 태그는 `MatchInsight`의 Mock/가공 집계
  값으로 분리했다. 멀티킬/클러치 등 이벤트 기반 태그는 `highlightTags`에
  명시된 Mock 근거가 있는 경우에만 표시하며 런타임에서 임의 생성하지 않는다.
- 파생 태그 임계값은 `MATCH_HIGHLIGHT_THRESHOLDS` 상수로 관리한다. High/Low
  ACS, HS, KAST, DDΔ/R 및 참가자 상세가 있는 경기의 팀 내 ACS 최고(MVP)를
  결정적으로 계산한다.
- 기존 인라인 `MatchDetailPanel` 4탭 연결을 유지했다. 펼침 시 중복 요약 카드를
  추가하지 않고 기존 상세 패널만 연결한다.
- 내부 중첩 스크롤을 추가하지 않았고, 좁은 화면에서는 경기 행이 2~3줄 카드형으로
  줄바꿈되도록 CSS grid를 조정했다.

**변경된 파일**:
- `frontend/src/components/MatchSummaryList.tsx`
- `frontend/src/data/match-insights.ts`
- `frontend/src/lib/match-insights.ts`
- `frontend/src/types/index.ts`
- `frontend/src/types/match-insight.ts`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI7B.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- 외부 Riot CDN 런타임 참조 없음 확인: 성공.
- 기존 로더 시그니처 유지 확인: 성공.
- `frontend/package.json`, `frontend/package-lock.json`, `backend`, `docker`,
  `scripts` 변경 없음.

**이슈/위험**:
- 경기별 KAST, DDΔ/R, 티어 변동, 이벤트 태그는 Mock/가공 집계 값이다. 실제 Riot
  API 연동 후 Backend 집계로 교체해야 한다.
- 현재 Mock 경기 3개가 서로 다른 날짜라 날짜별 그룹은 각 1경기씩 표시된다.

**다음 단계**:
- TASK-015UI7B는 완료됐다.
- TASK-016 이상은 시작하지 않았다. 다음 작업은 사람 검토와 승인 후 진행한다.

---

### TASK-015UI7A 구현 완료

**작업 내용**:
- 프로필 페이지 상단에 전체 폭 `PlayerHeaderCard`를 추가했다. 대표 요원
  이미지, Riot ID, 칭호, 레벨, 지역, 현재 티어, 배지, GameProbe Preview
  Score를 표시하고 Mock/Preview 고지를 유지했다.
- 플레이어 카드 바로 아래 전체 폭 `ProfileFilterBar`를 추가했다. 매칭 종류,
  시즌, 조회 기간 선택 UI를 제공하되 실제 통계 재계산이 아닌 Preview filter로
  명시했다.
- `PlayerProfile`은 서버 컴포넌트로 유지했다. 상태가 필요한 필터와 티어 그래프
  기간 선택만 각각 client component로 분리했다.
- 좌측 사이드바를 전체 시즌 최고 기록, 이전 시즌 티어, 헤드샷률, 역할군
  승률, 주요 무기, 맵별 승률 순서로 재구성했다. 현재 시즌 최고 기록과
  진행률 바는 추가하지 않았다.
- 중앙 영역에 이번 시즌 성적 카드, SVG/CSS 기반 티어/누적 랭크 점수 변화
  그래프, 최근 20판 요약을 추가했다. 기존 `MatchSummaryList`는 그 아래에
  유지했고 내부 행 구조와 인라인 상세는 변경하지 않았다.
- `ProfileOverview` 별도 타입/Mock 데이터/로더를 추가해 헤더·필터·시즌
  성적·전체 시즌 최고·이전 시즌·티어 이력·최근 20판 가공 집계를 관리한다.
  기존 `Player`/`Match*` 타입과 기존 로더 시그니처는 변경하지 않았다.
- `getTierAssetPath(tierId)`를 추가했다. 공식 Public Content Catalog 12.11의
  ZIP 파일명과 JSON 키에서는 경쟁 티어 엠블럼 레코드를 확인하지 못했고,
  Valorant-API `competitivetiers?language=ko-KR`를 구현 시 1회성 자산 취득
  용도로만 사용해 Iron/Bronze/Silver/Gold/Platinum/Diamond/Ascendant/
  Immortal의 1/2/3 디비전별 PNG와 Radiant 단일 PNG, 총 25개를 로컬에
  저장했다. 대소문자·연속 공백을 정규화하고, 디비전 없는 기본 티어명은 해당
  티어의 1 디비전 이미지로 매핑한다.
- 같은 세트의 Iron 1 이전 항목을 확인했다. tier 0은 `랭크 없음` /
  `ECompetitiveDivision::UNRANKED` / `divisionName: 랭크 없음`과 largeIcon,
  smallIcon을 제공해 `tiers/unranked.png`로 저장했다. tier 1/2는 INVALID이고
  아이콘이 없어 저장하지 않았다.
- DDΔ/R 계산 유틸을 추가했다. `(가한 피해량 - 받은 피해량) ÷ 플레이 라운드`
  정의를 코드 주석과 UI 설명에 반영하고, 분모 0은 `—` 처리한다.
- TASK-015UI7A 문서와 PLAN을 DONE 상태로 갱신했다.

**변경된 파일**:
- `frontend/public/assets/SOURCES.md`
- `frontend/public/assets/tiers/*-1.png`
- `frontend/public/assets/tiers/*-2.png`
- `frontend/public/assets/tiers/*-3.png`
- `frontend/public/assets/tiers/placeholder.svg`
- `frontend/public/assets/tiers/radiant.png`
- `frontend/public/assets/tiers/unranked.png`
- `frontend/src/app/globals.css`
- `frontend/src/components/PlayerHeaderCard.tsx`
- `frontend/src/components/ProfileFilterBar.tsx`
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/ProfileSidebar.tsx`
- `frontend/src/components/RankHistoryChart.tsx`
- `frontend/src/components/RecentTwentySummaryCard.tsx`
- `frontend/src/components/SeasonSummaryCard.tsx`
- `frontend/src/data/profile-overview.ts`
- `frontend/src/lib/asset-map.ts`
- `frontend/src/lib/profile-overview.ts`
- `frontend/src/lib/rank-history.ts`
- `frontend/src/lib/recent-twenty.ts`
- `frontend/src/types/index.ts`
- `frontend/src/types/profile-overview.ts`
- `docs/tasks/TASK-015UI7A.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `grep -n "getTierAssetPath" frontend/src/lib/asset-map.ts`: 성공.
- `file frontend/public/assets/tiers/*.png`: 성공. 26개 모두 PNG RGBA. 원본
  기준으로 대부분 256x256이며 `ascendant-2.png`, `immortal-2.png`는 275x256.
- `wc -c frontend/public/assets/tiers/*.png`: 성공. 26개 PNG 파일 크기 확인.
- `shasum -a 256 frontend/public/assets/tiers/*.png`: 성공. 26개 SHA-256 모두
  고유해 중복 없음.
- PNG signature 확인: 성공. 26개 모두 `89504e470d0a1a0a`.
- `getTierAssetPath()` 매핑 검증: 성공. 25개 입력, Radiant 단일 매핑,
  Unranked/Unrated/언랭크/배치 전/Placement/랭크 없음 매핑, 디비전 없는 기본
  티어의 1 디비전 이미지 매핑 확인.
- 실사용 티어 PNG 개수 확인: 성공. 정확히 25개.
- 이전 기본 티어 PNG 경로 사용처 없음 확인: 성공.
- `grep -rn "DDΔ/R\|ddDeltaPerRound" frontend/src`: 성공.
- `grep -rn "riotcdn.net\|media.valorant-api" frontend/src`: 출력 없음.
- 기존 로더 시그니처(`getDemoPlayerByPuuid`, `getRecentMatchesForPlayer`,
  `getMatchDetail`) 유지 확인: 성공.
- `grep -n "use client" frontend/src/components/PlayerProfile.tsx`: 출력 없음.
- 금지 범위(`frontend/package.json`, `frontend/package-lock.json`, `backend`,
  `docker`, `scripts`) 변경 없음.
- `MatchSummaryList` 및 인라인 상세 관련 파일 diff 없음.
- ProfileOverview Mock 일관성 확인: 성공. 승률·라운드 승률·이전 시즌 개수·
  현재 시즌 제외·최신 티어 정합성을 확인했다.
- DDΔ/R 양수/음수/0/rounds=0 처리 확인: 성공.

**이슈/위험**:
- 티어 PNG는 Riot 공식 Public Content Catalog에서 확인되지 않아 Valorant-API
  메타데이터와 이미지 URL로 1회성 취득했다. 런타임 외부 호출은 없지만, 출처는
  비공식·비제휴 서비스다.
- Mock 데이터에 디비전 없는 `tierImageId`가 남아 있으면 해당 티어의 1 디비전
  이미지로 표시된다. 표시 티어 문자열이 있는 컴포넌트는 그 전체 문자열을
  우선 사용한다.
- 필터는 Preview UI이며 실제 서버 데이터 재계산은 수행하지 않는다.
- 최근 20판 성적은 Mock/가공 집계 데이터이며 Riot API 직접 제공값이 아니다.

**다음 단계**:
- TASK-015UI7A는 완료됐다.
- TASK-015UI7B와 TASK-016 이상은 시작하지 않았다. 다음 작업은 사람 검토와
  승인 후 진행한다.

---

### TASK-015UI7 분리 → TASK-015UI7A + TASK-015UI7B (계획)

**작업 내용**:
- 범위가 큰 TASK-015UI7(프로필 페이지 최종 시안 재구성)을 구현 전에 두
  Task로 분리했다.
  - `docs/tasks/TASK-015UI7A.md`(신규, READY, 선행 TASK-015UI6) — 상단
    플레이어 카드, 전체 폭 필터 바, 좌측 사이드바 재구성(현재 시즌 최고 기록
    제거 → 전체 시즌 최고 기록 + 이전 시즌 티어 + 헤드샷률/역할군/무기/맵),
    이번 시즌 성적 카드, 날짜별 티어 변동 그래프(SVG/CSS), 최근 20판 요약,
    필요한 티어 공식 자산 선별 추가. **DDΔ/R·KAST의 공유 정의/가공 집계(Mock)
    타입을 도입**한다.
  - `docs/tasks/TASK-015UI7B.md`(신규, READY, 선행 TASK-015UI7A) — 날짜별
    최근 전적 그룹화(그룹 헤더 + 그날 요약), 개별 경기 행 재설계(맵 사진
    제거), 경기별·날짜별 KAST·DDΔ/R 적용(UI7A 정의 재사용), 긍정/부정
    하이라이트 태그(임의 생성 금지), 기존 인라인 4탭 상세 연결, 아래로 계속
    이어지는 전적 목록.
- `docs/tasks/TASK-015UI7.md`는 Status를 `SPLIT (2026-06-16)`로 바꾸고
  UI7A/UI7B로 분리됐음과 두 Task 경계·공유 데이터 모델을 안내하는 포인터
  문서로 전환했다(구현 대상 아님).
- 경계: UI7A = 페이지 골격 + 좌측 사이드바 + 중앙 상단(시즌/그래프/최근20) +
  공유 가공 집계 타입·`getTierAssetPath` 도입. UI7B = 중앙 하단
  `MatchSummaryList`의 날짜 그룹화·행 재설계·경기별 KAST/DDΔ/R·태그·인라인
  연결. 공유 데이터 모델은 `score-gameprobe.ts`(기존) + DDΔ/R·KAST 정의
  (UI7A 도입)이며, 모든 신규 통계는 기존 `Player`/`Match*` 타입을 오염시키지
  않고 별도 타입/로더로 관리(기존 로더·`asset-map` 시그니처 유지).
- `docs/PLAN.md` Phase 2 표에서 TASK-015UI7을 SPLIT으로 표시하고 그 아래에
  TASK-015UI7A(선행 UI6, READY)·TASK-015UI7B(선행 UI7A, READY)를 추가했다.
  "현재 상태"·"유형 요약"도 갱신했다. Phase 3~6 표(TASK-016~038)는 변경하지
  않았다.
- 실제 구현은 시작하지 않았다.

**변경된 파일**:
- `docs/tasks/TASK-015UI7A.md` (신규)
- `docs/tasks/TASK-015UI7B.md` (신규)
- `docs/tasks/TASK-015UI7.md` (SPLIT 포인터로 전환)
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- 문서 작업이며 빌드/테스트 대상 변경 없음. `frontend/`, `backend/`,
  `docker/`, `scripts/`는 수정하지 않았다.

**다음 단계**:
- 사람 승인 후 TASK-015UI7A → TASK-015UI7B 순으로 Codex가 구현한다.

---

### TASK-015UI7 작업 문서 작성 (계획)

**작업 내용**:
- TASK-015UI6 구현 완료(Status: DONE 2026-06-16)와 실제 산출물
  (`PlayerProfile`/`ProfileSidebar`/`ProfileScoreCard`/`MatchSummaryList`,
  `profile-sidebar` 타입·데이터·로더, `score-gameprobe.ts`, `.profile-page`
  폭 확장)을 확인한 뒤, 그 후속으로 `docs/tasks/TASK-015UI7.md`("프로필
  페이지 최종 시안 재구성")를 작성했다.
- 범위: 상단 플레이어 카드(전체 폭) → 필터 바(전체 폭) → 좌측 사이드바
  재구성(현재 시즌 최고 기록 제거, 전체 시즌 최고 기록 큰 카드 + 이전 시즌
  티어 리스트 추가) + 중앙 이번 시즌 성적 카드 + 티어 변동 그래프(SVG/CSS) +
  최근 20판 요약(그래프 없음) + 날짜별 최근 전적(그룹 헤더 + 행 재설계,
  맵 사진 제거) + 긍정/부정 하이라이트 태그 + 기존 인라인 4탭 유지.
- 데이터 한계 반영: 현재 Mock에는 킬 이벤트·데미지·KAST·클러치·티어 이력·
  레벨/칭호/지역이 없으므로, KAST·DDΔ/R·클러치 승률·티어 이력·이전 시즌·
  헤더 정보·이벤트 기반 태그는 모두 **별도 Mock/가공 집계 타입**으로 추가하고
  타입/주석으로 실제 API 값과 구분하도록 명시했다. 라운드 승률·Preview
  Score·MVP·임계값 기반 태그는 기존 데이터로 계산. 멀티킬/에이스/클러치/
  FK/FD 태그는 Mock 근거가 있을 때만 표시(런타임 임의 생성 금지).
- DDΔ/R = (가한 피해량 - 받은 피해량) ÷ 플레이 라운드, 표기 통일·색상(양수
  청록/음수 붉은색/0 중립)·툴팁·가공 집계 고지를 정의했다. 숫자 백분위는
  생성 금지("벤치마크 준비 중").
- 자산: 티어 이미지 선별 추가 + `asset-map.ts`에 신규 `getTierAssetPath`
  (기존 함수 시그니처 불변, placeholder fallback), `SOURCES.md` 갱신.
  전체 ZIP/카탈로그 커밋·외부 런타임 CDN 금지.
- 원칙: 기존 `Player`/`Match*` 타입 오염 금지·별도 타입, UI 하드코딩 금지,
  기존 로더 시그니처 유지, `PlayerProfile` 서버 컴포넌트 유지(필터 등 상태만
  최소 client 분리), 페이지 내부 중첩 스크롤 금지.
- 비범위: `backend/**`, `docker/**`, `scripts/**`, `package.json`/lockfile,
  새 패키지, 실제 Riot API/AI, 점수 모델 변경, 홈/privacy/terms/connect·공통
  헤더/푸터 대규모 변경, `/matches/[matchId]` 구조 변경, OP.GG/Tracker.gg
  복제, TASK-016 이상.
- Task ID는 TASK-015UI 계열 후속으로 `TASK-015UI7`로 명명(TASK-016~038과
  충돌 없음).
- `docs/PLAN.md` Phase 2 표의 TASK-011H 이전에 `TASK-015UI7`(자동, 선행
  TASK-015UI6, READY)를 추가하고 "현재 상태"·"유형 요약"을 갱신했다.
  Phase 3~6 표는 변경하지 않았다.
- 실제 구현은 시작하지 않았다.

**변경된 파일**:
- `docs/tasks/TASK-015UI7.md` (신규)
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- 문서 작성 작업이며 빌드/테스트 대상 변경 없음. `frontend/`,
  `backend/`, `docker/`, `scripts/`는 수정하지 않았다.

**다음 단계**:
- TASK-015UI7 구현은 사람 승인 후 Codex가 시작한다.

---

### TASK-015UI6 구현 완료

**작업 내용**:
- 프로필 라우트에 `profile-page` 전용 클래스를 추가해 다른
  `.placeholder-page` 페이지의 920px 폭은 유지하면서 프로필 페이지만
  `1240px` 폭으로 확장했다.
- 프로필 레이아웃을 좌측 `clamp(280px, 24vw, 320px)` 사이드바와 중앙
  `minmax(0, 1fr)` 2열 구조, `22px` gap으로 조정했다. 1023px 이하에서는
  단일 컬럼/축소형 사이드바로 전환한다.
- 프로필 제목 영역에 긴 Riot ID 대응용 `min-width: 0`/줄바꿈 안전 처리를
  추가하고 Preview Score 카드와 최근 N경기 기준 문구가 겹치지 않도록 했다.
- 최근 경기 카드의 Match Preview Score와 펼침 화살표가 잘리지 않도록 카드
  그리드 컬럼과 축소 안전 처리를 조정했다.
- `ProfileSidebarStats` 전용 타입, `frontend/src/data/profile-sidebar-stats.ts`
  Mock 데이터, `getProfileSidebarStats(puuid)` 조회 함수를 추가했다.
- 최고 랭크, 역할별 승률, 정확도 분포, 주 무기, 맵별 승률, 활동 시간대,
  자주 함께한 플레이어를 구조화된 Mock 데이터로 표시했다. 모든 신규 패널에
  Mock 배지를 유지했다.
- TASK-015UI6 문서와 PLAN을 DONE 상태로 갱신했다.

**변경된 파일**:
- `frontend/src/app/players/[puuid]/page.tsx`
- `frontend/src/app/globals.css`
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/ProfileScoreCard.tsx`
- `frontend/src/components/ProfileSidebar.tsx`
- `frontend/src/data/profile-sidebar-stats.ts`
- `frontend/src/lib/profile-sidebar-stats.ts`
- `frontend/src/types/index.ts`
- `frontend/src/types/profile-sidebar.ts`
- `docs/tasks/TASK-015UI6.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- 기본 `.placeholder-page` 920px 유지 및 `profile-page` 1240px 확장 확인:
  성공.
- 사이드바 Mock 데이터 일관성 확인: 성공. 정확도 합계 100, 역할/맵/함께한
  플레이어의 경기 수·승패·승률 일치, 활동 시간대 20경기 기준, 함께한
  플레이어 4명 조건을 확인했다.
- 기존 로더 시그니처(`getDemoPlayerByPuuid`, `getRecentMatchesForPlayer`,
  `getMatchDetail`) 유지 확인: 성공.
- 금지 범위(`frontend/package.json`, `frontend/package-lock.json`, `backend`,
  `docker`, `scripts`, `frontend/src/app/matches`) 변경 없음.
- `PlayerProfile`은 client component로 전환되지 않았다.

**이슈/위험**:
- 사이드바 통계는 Mock/Preview 데이터이며 Riot API가 직접 제공한 실제 통계가
  아니다.
- 실제 브라우저 육안 QA는 수행하지 않았다. CSS/빌드/정적 검증으로 확인했다.

**다음 단계**:
- TASK-015UI6은 완료됐다.
- TASK-015UI7 또는 TASK-016 이상은 시작하지 않았다. 다음 작업은 사람 검토와
  승인 후 진행한다.

---

### TASK-015UI6 작업 문서 작성 (계획)

**작업 내용**:
- TASK-015UI5 구현 완료(Status: DONE 2026-06-16)와 실제 산출물
  (`PlayerProfile`/`ProfileScoreCard`/`ProfileSidebar`/`MatchScoreBadge`,
  `score-gameprobe.ts`, `.profile-*`·`.match-card*` 스타일, `CombatStats.adr`)
  을 확인한 뒤, 그 후속으로 `docs/tasks/TASK-015UI6.md`("프로필 데스크톱
  레이아웃 폭·2열 비율 수정 + 사이드바 Mock 데이터 채우기")를 작성했다.
- 근본 원인 확인: 프로필이 라우트의 `.placeholder-page`(`width:
  min(100%, 920px)`) 안에서 렌더링돼 데스크톱 폭이 920px로 묶이고, 사이드바
  280px + dense 5열 `.match-card`(최소 ~630px)가 좁은 중앙에서 Match Score/
  화살표 잘림과 강제 줄바꿈을 유발한다. `.profile-score-hero` 제목 컨테이너에
  `min-width:0`이 없어 긴 Riot ID가 Score 배지와 겹칠 수 있다.
- 범위: (1) 전체 폭 1200~1280px, 사이드바 280~320px, 중앙 1fr, gap 20~24px로
  레이아웃 수정. 폭 상한은 globals.css `:has(.profile-layout)` 또는 래퍼
  클래스명 추가로 프로필만 넓히고 다른 페이지 920px는 유지. hero 겹침·카드
  잘림·줄바꿈·breakpoint 조정. (2) 사이드바의 `—`/"예정" 7개 항목(최고 랭크·
  역할별 승률·정확도 분포·주 무기·맵별 승률·활동 시간대·자주 함께한 플레이어)
  에 일관된 Mock 데이터 채우기.
- 데이터 원칙: 기존 `Player`/`Match*` 타입을 오염시키지 않고 별도 사이드바
  Mock 타입/데이터(`frontend/src/data`·`frontend/src/types`)와 신규 로더로
  관리. 기존 로더 시그니처 유지, UI 하드코딩 금지, `PlayerProfile` 서버
  컴포넌트 유지. 정확도 Head/Body/Legs 합 100, 역할/맵 승률 논리 일치
  (matchesPlayed=wins+losses), 활동 시간대 "최근 20경기 Mock 기준" 표기,
  함께한 플레이어 3~5명, 모든 패널 Mock 고지.
- 비범위: `backend/**`, `docker/**`, `scripts/**`, `package.json`/lockfile,
  새 패키지, 실제 Riot API/AI 분석, 점수 모델 변경, 홈/헤더/푸터 대규모
  변경, 다른 페이지 `.placeholder-page` 폭 변경, 전체 Riot 자산 카탈로그
  확장, 기존 로더 시그니처 변경, `/matches/[matchId]` 구조 변경,
  TASK-015UI7/TASK-016 이상.
- Task ID는 TASK-015UI 계열 후속으로 `TASK-015UI6`로 명명(TASK-016~038과
  충돌 없음).
- `docs/PLAN.md` Phase 2 표의 TASK-011H 이전에 `TASK-015UI6`(자동, 선행
  TASK-015UI5, READY)를 추가하고 "현재 상태"·"유형 요약"을 갱신했다.
  Phase 3~6 표는 변경하지 않았다.
- 실제 구현은 시작하지 않았다.

**변경된 파일**:
- `docs/tasks/TASK-015UI6.md` (신규)
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- 문서 작성 작업이며 빌드/테스트 대상 변경 없음. `frontend/`,
  `backend/`, `docker/`, `scripts/`는 수정하지 않았다.

**다음 단계**:
- TASK-015UI6 구현은 사람 승인 후 Codex가 시작한다.

---

### TASK-015UI5 작업 문서 작성 (계획)

**작업 내용**:
- TASK-015UI4 구현 완료(Status: DONE 2026-06-15)와 실제 산출물
  (`PlayerProfile`, `MatchSummaryList`, `MatchDetailPanel`, 4개 `Match*Tab`,
  `CombatStats`/`MatchParticipant` 타입, `mock-data.json`)을 확인한 뒤, 그
  후속으로 `docs/tasks/TASK-015UI5.md`("프로필 페이지 전적 서비스형 재구성
  + GameProbe Score 도입")를 작성했다.
- 범위: (1) 프로필 종합 GameProbe Score(Preview)와 경기별 Match
  Score(Preview)를 동일 코어 로직으로 도입, (2) 프로필을 좌측 보조 통계 +
  중앙 핵심 2컬럼으로 재배치, (3) 최근 경기 카드 압축(높이 축소, ADR·점수
  배지 추가, 가능 시 양 팀 요원 요약), (4) 인라인 상세 패널의 큰 요약 카드
  5개(.match-detail-summary) 제거 + 얇은 탭, (5) 라운드 탭 컴팩트 행/
  타임라인, 성과 탭 조밀한 지표 그리드, 분석 탭 예시 4개(점수+피드백,
  Example Analysis 표기).
- 점수 모델: 가중치(ACS 30 / K/D 25 / ADR 15 / 승패 10 / HS% 10 /
  어시스트·생존 10), 0–1000 정규화·clamp, 등급 경계(S≥850/A 750–849/
  B 600–749/C 450–599/D 300–449/E 0–299), 누락 시 가중치 재분배 fallback을
  코드·문서 일치 조건으로 명시했다. UI와 분리된 `lib/score-gameprobe.ts`로
  경기별·프로필 함수를 재사용한다.
- 데이터 확장: `CombatStats`에 Mock/aggregated `adr` 추가 + `recentMatches`
  3건·`participants` 10명에 mock `adr` 채움만 허용. 최고 티어/랭크·상위
  백분위·역할별 승률·정확도 분포·집계 주 무기·맵별 승률·활동 시간대·함께한
  플레이어·라운드 파생 지표는 **임의 통계 생성 금지**, 자리만 두고
  `—`/"예정"/작은 Preview·Mock 배지로 표시하도록 못 박았다.
- 비범위: `backend/**`, `docker/**`, `scripts/**`,
  `package.json`/lockfile, 새 npm 패키지, 실제 Riot API/AI 분석,
  `/matches/[matchId]` 라우트 삭제, `MatchDetailView`/`MatchScoreboard`/
  `MatchRoundTimeline` 수정, 홈/헤더/푸터 대규모 변경, `MatchRound`/
  `MatchDetail` 필드 추가, OP.GG·Tracker.gg 디자인 복제, TASK-016 이상.
- Task ID는 TASK-015UI 계열 후속으로 `TASK-015UI5`로 명명했다
  (TASK-016~038과 충돌 없음).
- `docs/PLAN.md` Phase 2 표의 TASK-011H 이전에 `TASK-015UI5`(자동, 선행
  TASK-015UI4, READY)를 추가하고 "현재 상태"·"유형 요약"·"마지막
  업데이트"를 갱신했다. Phase 3~6 표는 변경하지 않았다.
- 실제 구현은 시작하지 않았다.

**변경된 파일**:
- `docs/tasks/TASK-015UI5.md` (신규)
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- 문서 작성 작업이며 빌드/테스트 대상 변경 없음. `frontend/`,
  `backend/`, `docker/`, `scripts/`는 수정하지 않았다.

**다음 단계**:
- TASK-015UI5 구현은 사람 승인 후 Codex가 시작한다.

---

### TASK-015UI5 구현 완료

**작업 내용**:
- `frontend/src/lib/score-gameprobe.ts`를 추가해 GameProbe Preview Score
  계산을 UI에서 분리했다. 경기별 점수와 프로필 종합 점수는 같은 코어 함수와
  `GRADE_THRESHOLDS`를 재사용한다.
- 점수 모델은 ACS 30%, K/D 25%, ADR 15%, 승패 10%, HS% 10%, 어시스트 5%,
  생존 기여 5%를 사용한다. 누락 데이터는 0점 처리하지 않고 해당 가중치를
  제외해 재분배한다.
- `CombatStats.adr`를 Mock/aggregated 필드로 추가하고, 최근 경기 3건과
  상세 참가자 10명에 ADR 값을 추가했다.
- `PlayerProfile`을 서버 컴포넌트로 유지하면서 좌측 보조 통계 + 중앙 핵심
  영역 구조로 재배치했다.
- 프로필 중앙에 GameProbe Preview Score, 등급, 최근 N경기 기준, 현재 티어,
  최고 티어 자리, 승률, 평균 ACS, 평균 K/D, 평균 HS%, 최근 승패 흐름을
  표시했다. 백분위 숫자는 생성하지 않고 벤치마크 준비 중으로 표시했다.
- 최근 경기 카드를 낮고 조밀한 형태로 바꾸고, ADR 및 경기별 Match Preview
  Score/등급을 표시했다. 상세 데이터가 있는 경기에는 양 팀 요원 아이콘
  요약을 표시한다.
- 인라인 상세 패널에서 중복 상단 요약 카드(`.match-detail-summary`)를 제거하고
  바로 얇은 탭 바가 표시되도록 했다.
- 스코어보드에 ADR을 추가하고, 라운드/성과/분석 탭을 더 조밀하게 재구성했다.
  Mock에 없는 첫 킬/첫 데스, 멀티킬, 클러치, 플랜트/해체, 라운드 킬 이벤트는
  임의 생성하지 않고 `—`/연동 후 제공으로 표시한다.
- TASK-015UI5 문서와 PLAN을 DONE 상태로 갱신했다.

**변경된 파일**:
- `frontend/src/lib/score-gameprobe.ts` (신규)
- `frontend/src/components/MatchScoreBadge.tsx` (신규)
- `frontend/src/components/ProfileScoreCard.tsx` (신규)
- `frontend/src/components/ProfileSidebar.tsx` (신규)
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/MatchSummaryList.tsx`
- `frontend/src/components/MatchDetailPanel.tsx`
- `frontend/src/components/MatchScoreboardTab.tsx`
- `frontend/src/components/MatchRoundsTab.tsx`
- `frontend/src/components/MatchPerformanceTab.tsx`
- `frontend/src/components/MatchAnalysisTab.tsx`
- `frontend/src/types/match.ts`
- `frontend/src/data/mock-data.json`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI5.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- 점수 결정성, 0~1000 범위, 누락값 재분배, `totalRounds` 0/없음 처리,
  등급 경계(299/300/449/450/599/600/749/750/849/850), 프로필 평균 일치 확인:
  성공.
- 현재 Mock 경기 점수는 773(A), 499(C), 741(B)이며 프로필 종합 점수는
  산술평균 671(B)로 일치한다.
- `grep -rn "경기 상세 보기" frontend/src/components`: 출력 없음.
- `grep -rn "match-detail-summary" frontend/src`: 출력 없음.
- `grep -c '"adr"' frontend/src/data/mock-data.json`: 13.
- 금지 범위(`package.json`, lockfile, Backend, Docker, Scripts,
  `frontend/src/app/matches`) 변경 없음.

**남은 위험**:
- 상세 데이터는 현재 Ascent Mock 경기 1건에만 존재한다. Haven/Split은 상세
  데이터 없음 안내를 유지한다.
- Preview Score는 Mock/Preview 산식이며 Riot 공식 점수나 실제 랭킹 지표가
  아니다. 실제 벤치마크/백분위는 Phase 5 데이터 확보 후 별도 구현해야 한다.

---

## 2026-06-15

### TASK-015UI 작업 문서 작성 (계획)

**작업 내용**:
- 확정된 "GameProbe" 디자인(짙은 네이비·차콜 기반 Clean Data Terminal,
  청록·민트 포인트, 아주 약한 그리드 배경, 좌측 GameProbe·우측
  Privacy/Terms/Connect 헤더, 큰 둥근 검색 패널과 각진 분석 예시 카드 4개
  등)을 기준으로 `docs/tasks/TASK-015UI.md`("홈 화면 및 공통 레이아웃 디자인
  — GameProbe 브랜드 적용")를 작성했다.
- 범위: 공통 헤더/비제휴 안내 푸터(모든 페이지 적용), 홈 히어로·검색 패널·분석
  예시 카드 4개(위치 선정/팀 교전/첫 교전/사이트 방어, 정적 예시 점수) 재설계,
  검색 동작 변경(형식이 올바른 Riot ID는 항상 고정 데모 프로필로 이동), 결과
  화면(프로필/경기 상세)에 "Demo Profile"/"Mock Data" 작은 배지 추가, 반응형
  대응.
- 비범위: 프로필·경기 상세 컴포넌트의 대규모 디자인 변경(후속 Task로 분리),
  `docs/DECISIONS.md` PENDING-003(스타일링 방식) 해소, Mock 데이터/타입/패키지
  변경, 새 npm 패키지 설치.
- Task ID는 `TASK-015UI`로 결정했다. 다음 사용 가능한 순번인 `TASK-016`은
  `docs/PLAN.md` Phase 3("라인업 데이터 모델")에 TODO로 이미 예약되어 있어
  충돌하므로, Phase 3~6의 기존 Task 번호(TASK-016~038)와 상태는 변경하지 않고
  Phase 2에 `TASK-015UI`를 추가했다(사람 결정).
- `docs/PLAN.md` Phase 2 표에 `TASK-015UI`(자동, 선행 TASK-007/012/013/015,
  READY)를 TASK-015 다음·TASK-011H 이전에 추가하고, "현재 상태"와 "유형
  요약"에 반영했다. Phase 3~6 표의 Task 번호/상태는 변경하지 않았다.
- 실제 구현(Frontend 소스코드)은 시작하지 않았다.

**변경된 파일**:
- `docs/tasks/TASK-015UI.md` (신규)
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- 문서 작성 작업이며 빌드/테스트 대상 변경 없음. `frontend/`, `backend/`,
  `docker/`, `scripts/`는 수정하지 않았다.

**다음 단계**:
- TASK-015UI 구현은 사람 승인 후 Codex가 시작한다.
- 후속(프로필·경기 상세 대규모 디자인 변경) Task는 이번 작업에서 생성하지
  않았다.

---

### TASK-015UI2 작업 문서 작성 (계획)

**작업 내용**:
- TASK-015UI 구현 완료(Result에 DONE 기록)를 확인한 뒤, 그 후속으로
  `docs/tasks/TASK-015UI2.md`("플레이어 프로필 · 최근 경기 카드 정보
  강화")를 작성했다.
- 범위: `PlayerProfile.tsx` 프로필 요약에 Riot ID/티어/최근 경기 승패/승률/
  평균 ACS/평균 K/D/주 사용 요원 요약 표시, `MatchSummaryList.tsx` 최근 경기
  카드에 승패/맵 이름+이미지/요원 이름+초상화/모드/최종 스코어/ACS/K-D-A/
  K-D 비율/헤드샷률/경기 일시/대표 무기 이미지 표시. 이를 위해
  `frontend/src/types/player.ts`(`PlayerStatsSummary.topAgents`,
  `AgentPlayRate`), `frontend/src/types/match.ts`(`MatchSummary.mapId`/
  `agentId`/`primaryWeapon`, `CombatStats.headshotPercentage`,
  `WeaponSummary`), `frontend/src/types/index.ts`, `mock-data.json`,
  `frontend/src/lib/**`(자산 매핑 모듈 신규 추가), `frontend/public/assets/**`
  (요원/맵/무기 이미지)를 변경 대상으로 정의했다.
- 이미지 자산은 Riot 공식 Public Content Catalog(VAL-CONTENT-V1 등)에서
  Mock 데이터에 등장하는 요원·맵·무기만 선별해 로컬 파일로 포함하는 것을
  기본으로 하고, 공식 자산을 확인할 수 없는 항목만 SVG placeholder로
  대체한다(카탈로그 원본 전체 포함은 금지). 자산 출처와 placeholder 대체
  여부는 Task Result 또는 별도 출처 문서에 기록한다. 실제 Riot UUID
  매핑과 headshotPercentage·primaryWeapon·topAgents 집계 로직(Mock/가공
  필드, Backend 집계 필요)은 PENDING으로 남긴다.
- 비범위: 홈 화면/공통 레이아웃(TASK-015UI 결과 유지), 경기 상세
  스코어보드·라운드 타임라인(`MatchDetailView.tsx`,
  `MatchScoreboard.tsx`, `MatchRoundTimeline.tsx`, 후속 Task로 분리),
  Backend, `package.json`/lockfile, 새 npm 패키지.
- Task ID는 `TASK-015UI2`로 결정했다(TASK-015UI와 동일하게 Phase 3~6의
  TASK-016~038 번호와 충돌하지 않는 Phase 2 UI 개선 계열 후속 명명).
- `docs/PLAN.md` Phase 2 표에서 TASK-015UI를 DONE(2026-06-15)으로
  반영하고, 그 다음·TASK-011H 이전에 `TASK-015UI2`(자동, 선행
  TASK-015UI, READY)를 추가했다. "현재 상태"와 "유형 요약"에도 반영했다.
  Phase 3~6 표의 Task 번호/상태는 변경하지 않았다.
- 실제 구현(Frontend 소스코드)은 시작하지 않았다.

**변경된 파일**:
- `docs/tasks/TASK-015UI2.md` (신규)
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- 문서 작성 작업이며 빌드/테스트 대상 변경 없음. `frontend/`, `backend/`,
  `docker/`, `scripts/`는 수정하지 않았다.

**다음 단계**:
- TASK-015UI2 구현은 사람 승인 후 Codex가 시작한다.
- 경기 상세 스코어보드·라운드 타임라인 개선 Task는 이번 작업에서 생성하지
  않았다.

---

### TASK-015UI3 작업 문서 작성 (계획)

**작업 내용**:
- TASK-015UI2 구현 완료(Status: DONE 2026-06-15)를 확인했다. 그 결과
  `frontend/public/assets/{agents,maps,weapons}/`의 요원(jett/sova/omen),
  맵(ascent/haven/split), 무기(vandal/phantom/operator) 이미지 9건은 모두
  `frontend/public/assets/SOURCES.md`상 `Source status: fallback`(SVG
  placeholder)이며, "공식 카탈로그 패밀리는 확인했으나 정확한 공식 이미지
  URL은 미확인"으로 기록된 PENDING 상태임을 확인했다.
- 이 PENDING을 해소하는 후속 Task로 `docs/tasks/TASK-015UI3.md`("요원/맵/
  무기 이미지를 공식 Public Content Catalog 자산으로 교체")를 작성했다.
- 범위: 사용자가 제공한 공식 소스
  `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip`
  에서 위 9개 대상에 대응하는 이미지와 ID/이름 매핑 근거를 확인해, ZIP 전체가
  아닌 필요한 파일만 `frontend/public/assets/{agents,maps,weapons}/`에 추가하고
  `frontend/src/lib/asset-map.ts`의 3개 매핑 테이블 값을 갱신한다.
  `getAgentAssetPath`/`getMapAssetPath`/`getWeaponAssetPath`/`fallbackPath`
  시그니처와 `placeholder.svg` 3종은 유지한다. `SOURCES.md`에 대상별 공식
  다운로드 URL·카탈로그 버전·원본 경로·로컬 경로·확인일을 기록하고, 공식
  자산을 찾지 못한 항목만 placeholder를 유지하며 사유를 기록한다.
- 비범위: `frontend/src/types/**`, `mock-data.json`/`mock-data.ts`,
  컴포넌트(`PlayerProfile.tsx`, `MatchSummaryList.tsx` 등), `globals.css`,
  홈/경기 상세, Backend, `package.json`/lockfile. ZIP 원본이나 압축 해제
  디렉터리 전체, 외부 호스트 런타임 호출도 금지.
- Task ID는 TASK-015UI/TASK-015UI2와 같은 Phase 2 UI 개선 계열 후속으로
  `TASK-015UI3`로 명명했다(TASK-016~038과 충돌 없음).
- `docs/PLAN.md` Phase 2 표에서 TASK-015UI2를 DONE(2026-06-15)으로 반영하고,
  그 다음·TASK-011H 이전에 `TASK-015UI3`(자동, 선행 TASK-015UI2, READY)를
  추가했다. "현재 상태"와 "유형 요약"에도 반영했다. Phase 3~6 표의 Task
  번호/상태는 변경하지 않았다.
- 실제 구현(자산 다운로드/추출 포함)은 시작하지 않았다.

**변경된 파일**:
- `docs/tasks/TASK-015UI3.md` (신규)
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- 문서 작성 작업이며 빌드/테스트 대상 변경 없음. `frontend/`, `backend/`,
  `docker/`, `scripts/`는 수정하지 않았다.

**다음 단계**:
- TASK-015UI3 구현은 사람 승인 후 Codex가 시작한다.

---

### TASK-015UI4 작업 문서 작성 (계획)

**작업 내용**:
- TASK-015UI3 구현 완료(Status: DONE 2026-06-15)를 확인했다. 그 후속으로
  `docs/tasks/TASK-015UI4.md`("최근 경기 카드 인라인 펼침 + 4탭 상세
  패널")를 작성했다.
- 범위: `MatchSummaryList`의 각 경기 카드를 클릭하면 같은 페이지 안에서
  상세 패널이 펼쳐지고, 스코어보드/라운드/성과/분석 4개 탭으로 정보를
  확인하도록 한다. 카드 전체 클릭 + 펼침 화살표가 동일한 상태를
  제어하고, 한 번에 하나의 경기만 펼쳐지며, 짧은 CSS 슬라이드
  애니메이션을 적용한다. 기존 "경기 상세 보기" 링크(`/matches/[matchId]`)는
  제거하지만 해당 라우트와 `MatchDetailView`/`MatchScoreboard`/
  `MatchRoundTimeline`은 수정하지 않고 유지한다(향후 재사용은 별도
  Task).
- 데이터/타입: `MatchParticipant`에 `agentId`(요원 이미지용 슬러그)를
  추가하고, `stats`를 기존 `CombatStats`(헤드샷률 포함, 기존
  Mock/aggregated 주석 재사용)로 교체한다. `mock-data.json`의
  `matchDetails[0].participants` 10명에 `agentId`/`headshotPercentage`
  값을 추가한다. `MatchRound`/`MatchDetail`에는 새 필드를 추가하지
  않는다.
- 라운드 탭의 "공격/수비"·"스파이크 설치/해제"·"주요 킬 이벤트"와 성과
  탭의 "첫 킬/첫 데스"·"멀티킬 수"는 현재 Mock 데이터로 계산 가능한
  범위와 처리 원칙(기존 필드 파생 표시 또는 "데이터 없음"/PENDING 고정
  문구, 임의 데이터 생성 금지)을 Task 문서에 명시했다.
- 비범위: `backend/**`, `docker/**`, `scripts/**`,
  `frontend/package.json`/lockfile, `/matches/[matchId]` 라우트 삭제,
  홈 화면/공통 헤더·푸터 대규모 변경, 실제 Riot API/AI 분석 구현,
  TASK-016 이상 작업.
- Task ID는 TASK-015UI/UI2/UI3과 같은 Phase 2 UI 개선 계열 후속으로
  `TASK-015UI4`로 명명했다(TASK-016~038과 충돌 없음).
- `docs/PLAN.md` Phase 2 표에서 TASK-015UI3을 DONE(2026-06-15)으로
  반영하고, 그 다음·TASK-011H 이전에 `TASK-015UI4`(자동, 선행
  TASK-015UI3, READY)를 추가했다. "현재 상태"와 "유형 요약"에도
  반영했다. Phase 3~6 표의 Task 번호/상태는 변경하지 않았다.
- 실제 구현은 시작하지 않았다.

**변경된 파일**:
- `docs/tasks/TASK-015UI4.md` (신규)
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- 문서 작성 작업이며 빌드/테스트 대상 변경 없음. `frontend/`,
  `backend/`, `docker/`, `scripts/`는 수정하지 않았다.

**다음 단계**:
- TASK-015UI4 구현은 사람 승인 후 Codex가 시작한다.

---

### TASK-015UI4 구현 완료

**작업 내용**:
- `MatchSummaryList`를 클라이언트 아코디언으로 전환했다. 카드 전체와 오른쪽
  화살표가 같은 `expandedMatchId` 상태를 토글하며, 한 번에 한 경기만 펼쳐진다.
- 최근 경기 카드의 기존 `경기 상세 보기` 링크를 제거했다. `/matches/[matchId]`
  라우트와 `MatchDetailView`/`MatchScoreboard`/`MatchRoundTimeline`은 수정하지
  않았다.
- 펼친 카드 안에 재사용 가능한 `MatchDetailPanel`과 4개 탭
  (`MatchTabs`, `MatchScoreboardTab`, `MatchRoundsTab`,
  `MatchPerformanceTab`, `MatchAnalysisTab`)을 추가했다.
- 스코어보드 탭은 우리 팀/상대 팀 구분, 승패 색상, 팀별 ACS 내림차순,
  본인 행 강조와 YOU 배지, 요원 이미지, ACS, K/D/A, K/D, 헤드샷률을 표시한다.
- 라운드 탭은 기존 Mock 라운드 필드만 사용한다. 라운드별 킬 이벤트와
  진영 교체 데이터는 임의 생성하지 않고 데이터 없음/PENDING 안내로 표시한다.
- 성과 탭은 계산 가능한 팀 MVP, 개인 ACS 순위, K/D, 헤드샷률만 표시하고
  첫 킬/첫 데스·멀티킬 수는 PENDING 처리했다.
- 분석 탭은 실제 AI 분석 없이 Mock Data 기반 준비 중 영역만 제공한다.
- `MatchParticipant.agentId`와 `CombatStats` 기반 participant stats를 적용하고,
  `matchDetails[0].participants` 10명에 `agentId`와 `headshotPercentage`를
  추가했다.
- `docs/PLAN.md`와 `docs/tasks/TASK-015UI4.md`를 DONE 상태로 갱신했다.

**변경된 파일**:
- `frontend/src/components/MatchSummaryList.tsx`
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/MatchDetailPanel.tsx` (신규)
- `frontend/src/components/MatchTabs.tsx` (신규)
- `frontend/src/components/MatchScoreboardTab.tsx` (신규)
- `frontend/src/components/MatchRoundsTab.tsx` (신규)
- `frontend/src/components/MatchPerformanceTab.tsx` (신규)
- `frontend/src/components/MatchAnalysisTab.tsx` (신규)
- `frontend/src/types/match.ts`
- `frontend/src/data/mock-data.json`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI4.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `/matches/[matchId]/page.tsx` 존재 확인 성공.
- `grep -rn "경기 상세 보기" frontend/src/components`: 출력 없음.
- 금지 범위(`package.json`, lockfile, Backend, Docker, Scripts,
  `frontend/src/app/matches`) 변경 없음.

**남은 위험**:
- 현재 상세 Mock 데이터는 첫 번째 경기(`mock-match-ascent-001`)에만 존재한다.
  다른 최근 경기 펼침 시에는 상세 데이터 없음 안내가 표시된다.
- 공식 이미지 매핑이 없는 일부 참가자 요원은 기존 placeholder fallback을 사용한다.

---

## 2026-06-13

### TASK-011D 배포 플랫폼·DB 호스팅 결정 확정 (HUMAN-DECISION 완료)

**작업 내용**:
- `docs/DECISIONS.md` PENDING-006(배포 플랫폼)에 대해 사람이 다음과 같이 결정을 확정했다.
  당시 DB 호스팅 선택은 폐기되어 아래 기록에서 제외하며 현재 저장 구성은 TASK-BE-001을 따른다:
  - Frontend: Vercel
  - Backend API: Railway
  - 향후 Analysis Worker: Railway의 별도 서비스
  - 향후 Scheduler: Railway Cron Job
  - 저장소 연결: 비공개 GitHub 저장소
- 초기 배포 목적은 Riot VALORANT Production API 신청용 공개 프로토타입이며,
  Mock 데이터와 Mock Riot API Adapter(TASK-014 `MockRiotApiAdapter`,
  `valorant.riot.adapter=mock`)를 사용한다. 실제 Riot API 키, RSO, 랭커
  데이터 수집, 분석 Worker 구현은 Production Key 승인 이후 또는 별도
  Task에서 진행한다.
- 공개 프로토타입에는 `/`(전적검색), `/players/[puuid]`(프로필),
  `/matches/[matchId]`(경기 상세), `/privacy`, `/terms`, `/connect`를
  포함하며, 사용자 비밀번호나 Riot 로그인 정보는 직접 수집하지 않는다.
- 이 결정에 따라 `docs/tasks/TASK-011D.md`를 HUMAN-DECISION 완료 상태로
  갱신하고 Result에 결정 내용을 기록했다.
- `docs/tasks/TASK-011.md`를 BLOCKED → READY로 전환하고, 위 플랫폼 기준으로
  구현 범위를 구체화했다: Vercel용 Frontend 환경변수 구조
  (`NEXT_PUBLIC_API_BASE_URL`), Railway용 Spring Boot 실행 설정
  (`Dockerfile`, `PORT` 바인딩), 배포 환경 설정(`application-railway.yml`), Frontend→Backend 공개 URL 사용
  구조, Backend CORS 허용 Origin 설정, 기존 `/health`를 Railway 헬스체크로
  사용, 비밀값 미포함 확인, Mock 모드 공개 배포 확인, 배포 후 확인 URL과
  smoke test 명령, 사람 수행 단계(TASK-011H)와의 분리.
- `docs/PLAN.md` Phase 2 표에서 TASK-011D를 DONE(2026-06-13)으로,
  TASK-011을 READY로 갱신하고, "실행 순서"/"유형 요약"/"현재 상태"를
  정합성 있게 수정했다.
- 실제 배포·외부 로그인·환경변수 입력은 TASK-011H(사람)에서 수행한다.
  소스코드, 원격 저장소, 배포, DNS, 환경변수는 변경하지 않았다.

**변경된 파일**:
- `docs/tasks/TASK-011D.md`
- `docs/tasks/TASK-011.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- 문서 정합성 갱신만 수행했으며 소스코드 변경 없음. 빌드/테스트 실행 대상
  아님.

**남은 항목**:
- `docs/DECISIONS.md` PENDING-006/007을 "해소됨"으로 갱신하고 DEC 항목을
  추가하는 작업은 `docs/tasks/TASK-011D.md` Allowed changes상 "사람이 직접
  작성"으로 명시되어 있어 이번 갱신에 포함하지 않았다.

---

### Phase 2 자동 READY Task 배치 수행 (TASK-012~015)

**작업 내용**:
- TASK-012 개인정보처리방침 초안 페이지를 구현했다.
  - 신규 라우트: `frontend/src/app/privacy/page.tsx`
  - 수집 항목, 이용 목적, 보관 및 파기, 제3자 제공, 이용자 권리, 문의처 섹션을
    초안으로 렌더링한다.
- TASK-013 이용약관 초안 페이지를 구현했다.
  - 신규 라우트: `frontend/src/app/terms/page.tsx`
  - 서비스 정의, 이용 조건, 금지 행위, 책임 제한, 준거법 및 분쟁, 약관 변경,
    문의처 섹션을 초안으로 렌더링한다.
- TASK-014 Backend Riot API Adapter 구조를 구현했다.
  - `RiotApiAdapter` 인터페이스, 최소 반환 타입 모델, `MockRiotApiAdapter`,
    `valorant.riot.adapter=mock` 기반 빈 선택 설정, Mock 단위 테스트를 추가했다.
  - 실제 Riot API 클라이언트와 네트워크 호출은 구현하지 않았다.
- TASK-015 Riot 계정 연결 예정 UI를 구현했다.
  - 신규 라우트: `frontend/src/app/connect/page.tsx`
  - 신규 컴포넌트: `frontend/src/components/RiotConnectNotice.tsx`
  - 연결 버튼은 비활성 상태이며 실제 RSO/OAuth/세션/토큰 처리는 없다.
- TASK-011, TASK-011D, TASK-011H, TASK-013H, TASK-015H는 사람 전용 또는 사람
  결정 대기 범위로 유지했다.
- Phase 3은 시작하지 않았다.

**변경된 파일**:
- `frontend/src/app/privacy/page.tsx`
- `frontend/src/app/terms/page.tsx`
- `frontend/src/app/connect/page.tsx`
- `frontend/src/components/RiotConnectNotice.tsx`
- `backend/src/main/kotlin/com/valorant/platform/common/config/RiotApiAdapterConfig.kt`
- `backend/src/main/kotlin/com/valorant/platform/riot/adapter/RiotApiAdapter.kt`
- `backend/src/main/kotlin/com/valorant/platform/riot/mock/MockRiotApiAdapter.kt`
- `backend/src/main/resources/application.yml`
- `backend/src/test/kotlin/com/valorant/platform/riot/mock/MockRiotApiAdapterTest.kt`
- `docs/tasks/TASK-012.md`
- `docs/tasks/TASK-013.md`
- `docs/tasks/TASK-014.md`
- `docs/tasks/TASK-015.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- TASK-012: `cd frontend && npx tsc --noEmit`, `npm run lint`,
  `npm run build` 성공.
- TASK-013: `cd frontend && npx tsc --noEmit`, `npm run lint`,
  `npm run build` 성공.
- TASK-014: `cd backend && ./gradlew build` 성공. Mock 어댑터 테스트 통과.
- TASK-015: `cd frontend && npx tsc --noEmit`, `npm run lint`,
  `npm run build` 성공.
- 각 Task의 범위 확인 명령에서 금지된 영역 변경 없음.

**관련 커밋**:
- `40be109` — `feat: add privacy policy draft page [TASK-012]`
- `e375cc9` — `feat: add terms draft page [TASK-013]`
- `2307949` — `feat: add riot api adapter structure [TASK-014]`
- `d8d0595` — `feat: add riot account connect placeholder [TASK-015]`

**이슈/위험**:
- TASK-012/013 문구는 법률 최종본이 아니며 TASK-013H에서 사람 검토와 승인이 필요하다.
- TASK-011은 TASK-011D(배포 플랫폼·DB 호스팅 결정) 전까지 BLOCKED다.
- TASK-011H/TASK-015H는 외부 로그인, 도메인, 배포 승인, Riot Developer Portal
  제출이 필요한 사람 전용 Task로 남아 있다.
- TASK-014는 Adapter 구조와 Mock만 제공하며 실제 Riot API 클라이언트는 Phase 4
  범위다.

---

### Phase 2 Task 문서 일괄 작성 (계획)

**작업 내용**:
- `docs/PLAN.md` Phase 2 전체를 검토하고, 배포 가능한 사이트 완성 + Riot API
  신청 준비를 독립적으로 구현·검증 가능한 Task로 분리했다.
- 자동 구현 Task 5개를 작성했다: `TASK-011`(배포 환경 구성 설정·CI·문서),
  `TASK-012`(개인정보처리방침 페이지), `TASK-013`(이용약관 페이지),
  `TASK-014`(API Adapter 인터페이스 설계, Backend), `TASK-015`(Riot 계정 연결
  예정 UI).
- 사람 전용 Task 4개를 자동 Task와 구분해 작성했다: `TASK-011D`(배포 플랫폼·DB
  호스팅 결정, PENDING-006/007), `TASK-013H`(개인정보처리방침·이용약관 법률
  최종 승인), `TASK-011H`(외부 로그인·도메인/DNS·비밀정보·운영 배포 승인),
  `TASK-015H`(Riot Developer Portal 신청 제출).
- `docs/PLAN.md` Phase 2 표를 유형(자동/사람)·선행 의존성·상태(READY/BLOCKED/
  HUMAN-*)로 재정리하고 실행 순서를 명시했다.
- Phase 1 정합성 보정: TASK-007~010 Task 문서 Status가 DONE이고 실제 산출물이
  존재해 `docs/PLAN.md` Phase 1 표를 DONE으로 갱신했다.

**변경된 파일**:
- `docs/tasks/TASK-011.md` (신규)
- `docs/tasks/TASK-011D.md` (신규)
- `docs/tasks/TASK-011H.md` (신규)
- `docs/tasks/TASK-012.md` (신규)
- `docs/tasks/TASK-013.md` (신규)
- `docs/tasks/TASK-013H.md` (신규)
- `docs/tasks/TASK-014.md` (신규)
- `docs/tasks/TASK-015.md` (신규)
- `docs/tasks/TASK-015H.md` (신규)
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- 문서 작성 작업이며 빌드/테스트 대상 변경 없음. 소스코드(`frontend/`,
  `backend/`, `docker/`, `scripts/`)는 수정하지 않았다.

**이슈/위험**:
- **PROGRESS backfill 필요**: TASK-007~010 개별 완료 로그가 이 문서에 아직
  반영되지 않았다(현재 위쪽 최신 항목은 TASK-006). PLAN Phase 1 표는 DONE으로
  보정했으나, PROGRESS 완료 로그 보강은 별도 정합성 작업으로 남는다.
- TASK-011은 TASK-011D(배포 플랫폼 결정, 사람) 확정 전까지 BLOCKED다.
- TASK-014의 어댑터 위치는 `docs/ARCHITECTURE.md` 정본(Backend riot 모듈)을
  따르며, 현재 Phase 1 Mock은 Frontend에 있다는 점을 Context에 명시했다.

**다음 단계**:
- 자동 READY Task(TASK-012/013/014)는 사람 승인 후 병렬 착수 가능.
- 사람은 TASK-011D 결정으로 배포 트랙을 언블록한다.
- Phase 3(TASK-016~) Task는 생성하지 않았다.

---

### TASK-010 경기 상세 (DONE)

> backfill 기록. 근거: `docs/tasks/TASK-010.md` Status/Result, Git commit
> `00542fc`(2026-06-13), 현재 존재하는 구현 파일.

**완료 상태**: DONE (2026-06-13)

**핵심 구현 결과**:
- 동적 라우트 `frontend/src/app/matches/[matchId]/page.tsx`를 추가하고,
  TASK-006의 `getMatchDetail(matchId)`로 `MatchDetail`을 조회한다.
- 스코어보드(`MatchScoreboard.tsx`)와 라운드 타임라인(`MatchRoundTimeline.tsx`)을
  `MatchDetailView.tsx`로 구성해 렌더링한다.
- 존재하지 않는 `matchId`는 "경기를 찾을 수 없음" 안내를 표시한다.
- TASK-009가 둔 `MatchSummaryList.tsx`의 경기 상세 placeholder 버튼을 경기 상세
  라우트 링크로 교체했다.

**변경된 파일** (commit `00542fc`):
- `frontend/src/app/matches/[matchId]/page.tsx`
- `frontend/src/components/MatchDetailView.tsx`
- `frontend/src/components/MatchRoundTimeline.tsx`
- `frontend/src/components/MatchScoreboard.tsx`
- `frontend/src/components/MatchSummaryList.tsx` (수정)
- `docs/tasks/TASK-010.md`

**통과한 주요 검증** (`docs/tasks/TASK-010.md` Result 기준):
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.

**관련 커밋**: `00542fc` (feat: add match detail page [TASK-010])

---

### TASK-009 최근 경기 목록 (DONE)

> backfill 기록. 근거: `docs/tasks/TASK-009.md` Status/Result, Git commit
> `155eeda`(2026-06-13), 현재 존재하는 구현 파일.

**완료 상태**: DONE (2026-06-13)

**핵심 구현 결과**:
- `PlayerProfile.tsx`의 "최근 경기" 섹션(`recent-matches-heading`)에서 TASK-008
  placeholder 문단을 제거하고 `MatchSummaryList`를 렌더링하도록 교체했다.
- TASK-006의 `getRecentMatchesForPlayer(player.puuid)`로 `MatchSummary[]`를
  조회해 경기 카드 리스트(맵/모드, 결과/시작 시각, 요원/스코어/K-D-A)를 표시한다.
- 빈 배열이면 "최근 경기 없음" 안내를 표시한다.
- 각 카드에 경기 상세(TASK-010)용 placeholder(비활성 버튼, `matchId` 노출)를 두었다.

**변경된 파일** (commit `155eeda`):
- `frontend/src/components/MatchSummaryList.tsx`
- `frontend/src/components/PlayerProfile.tsx` (수정)
- `docs/tasks/TASK-009.md`

**통과한 주요 검증** (`docs/tasks/TASK-009.md` Result 기준):
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.

**관련 커밋**: `155eeda` (feat: add recent match list [TASK-009])

---

### TASK-008 데모 플레이어 프로필 (DONE)

> backfill 기록. 근거: `docs/tasks/TASK-008.md` Status/Result, Git commit
> `8c24484`(2026-06-13), 현재 존재하는 구현 파일.

**완료 상태**: DONE (2026-06-13)

**핵심 구현 결과**:
- TASK-007의 `/players/[puuid]` placeholder를 실제 프로필 콘텐츠로 교체했다
  (`PlayerProfile.tsx`).
- `getDemoPlayerByPuuid(puuid)`로 조회한 `Player`로 Riot ID(`게임네임#태그`),
  현재 랭크, 통계 요약(`matchesPlayed`, `winRate`, `averageKills`,
  `averageDeaths`, `averageAssists`, `averageCombatScore`)을 표시한다.
- 조회 결과가 `null`이면 "플레이어를 찾을 수 없음" 안내를 표시한다.
- 최근 경기 목록(TASK-009)을 같은 프로필 페이지의 "최근 경기" 섹션에 배치하기로
  결정하고 placeholder를 마련했다.

**변경된 파일** (commit `8c24484`):
- `frontend/src/app/players/[puuid]/page.tsx` (수정)
- `frontend/src/components/PlayerProfile.tsx`
- `docs/tasks/TASK-008.md`

**통과한 주요 검증** (`docs/tasks/TASK-008.md` Result 기준):
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.

**관련 커밋**: `8c24484` (feat: add demo player profile page [TASK-008])

---

### TASK-007 홈 검색 화면 (DONE)

> backfill 기록. 근거: `docs/tasks/TASK-007.md` Status/Result, Git commit
> `3a721ea`(2026-06-13), 현재 존재하는 구현 파일.

**완료 상태**: DONE (2026-06-13)

**핵심 구현 결과**:
- 홈페이지(`/`)에 Riot ID 검색 폼(`게임네임#태그` 형식 검증, 정규식
  `^[^#\s][^#]*#[A-Za-z0-9]{2,5}$`)과 데모 계정 선택 UI를 구현했다
  (`HomeSearch.tsx`).
- TASK-006의 `getDemoPlayers()`, `getDemoPlayerByRiotId()`를 재사용했다.
- 프로필 라우트를 PUUID 기반 `/players/[puuid]`로 결정했다(TASK-008이 따름).
  해당 라우트에는 최소 placeholder만 두었다.
- 형식 오류 또는 Mock 데이터에 없는 Riot ID는 이동하지 않고 에러 메시지를 표시한다.

**변경된 파일** (commit `3a721ea`):
- `frontend/src/app/page.tsx` (수정)
- `frontend/src/app/globals.css` (수정)
- `frontend/src/app/players/[puuid]/page.tsx` (placeholder 추가)
- `frontend/src/components/HomeSearch.tsx`
- `docs/tasks/TASK-007.md`

**통과한 주요 검증** (`docs/tasks/TASK-007.md` Result 기준):
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.

**관련 커밋**: `3a721ea` (feat: add player search home flow [TASK-007])

---

### TASK-006 Mock JSON 데이터 모델 정의 (DONE)

**작업 내용**:
- Frontend 내부 Mock 데이터 가정에 따라 `frontend/src/types/`, `frontend/src/data/`,
  `frontend/src/lib/`를 생성했다.
- 플레이어 타입(`Player`, `RiotId`, `PlayerStatsSummary`)과 경기 타입
  (`MatchSummary`, `MatchDetail`, 참가자/라운드/전투 통계 타입)을 정의했다.
- `frontend/src/data/mock-data.json`에 데모 플레이어 1명, 최근 경기 요약 3개,
  상세 경기 1개(10명 참가자, 22라운드 타임라인)를 작성했다.
- `frontend/src/lib/mock-data.ts`에 데모 플레이어, 플레이어별 최근 경기,
  경기 상세를 조회하는 로더 함수를 추가했다.
- 존재하지 않는 플레이어/경기 조회는 `null` 또는 빈 배열을 반환한다:
  `getDemoPlayerByPuuid`, `getDemoPlayerByRiotId`, `getMatchDetail`은 `null`,
  `getRecentMatchesForPlayer`는 `[]`.
- 화면/라우트(`frontend/src/app/**`), 패키지 파일, backend, docker는 수정하지 않았다.
- TASK-007은 시작하지 않았다. 병렬 작성 중인 `docs/tasks/TASK-007.md`는 참조하거나 수정하지 않았다.

**변경된 파일**:
- `frontend/src/types/match.ts`
- `frontend/src/types/player.ts`
- `frontend/src/types/index.ts`
- `frontend/src/data/mock-data.json`
- `frontend/src/lib/mock-data.ts`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `docs/tasks/TASK-006.md`

**검증 결과**:
- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공. ESLint 경고/에러 없음.
- `cd frontend && npm run build`: 성공.
- `git status --porcelain -- frontend/src/app`: 출력 없음.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json`: 출력 없음.
- `git status --porcelain -- frontend/src/types frontend/src/data frontend/src/lib`: 허용된 신규 파일만 출력.

**이슈/위험**:
- `npx tsc --noEmit`가 `frontend/tsconfig.tsbuildinfo`를 생성했으나 TASK-006 허용 범위 밖의 검증 산출물이므로 제거했다.
- 현재 Mock 데이터의 세부 필드는 이후 화면 Task(TASK-007~010)에서 UI 요구에 따라 조정될 수 있다.

**다음 단계**:
- TASK-006은 완료됐다.
- TASK-007은 사람 승인 후 별도로 시작한다.

---

### TASK-006 작업 문서 작성

**작업 내용**:
- `docs/tasks/TASK-006.md`("Mock JSON 데이터 모델 정의")를 작성했다. TASK-005
  완료 이후 Phase 1의 첫 Task로, 데이터 모델(TypeScript 타입), Mock JSON
  데이터, 데이터 로더 함수 정의를 범위로 한다.
- Mock 데이터 위치(Frontend 내부 vs backend `riot/mock`)에 대한 불확실성을
  Context에 명시하고, Frontend 내부에 두는 것을 가정으로 채택했다. 이 가정이
  부적절하면 BLOCKED로 보고하도록 Stop conditions에 반영했다.
- 데모 플레이어/경기 수, 통계 요약 필드, 데이터 로더 시그니처 등 세부 사항은
  최소 기준만 제시하고 구현자가 결정하도록 "불확실한 사항"으로 명시했다.
- `docs/PLAN.md`에 `TASK-006` 문서 링크를 반영하고, "현재 상태"를
  "TASK-006 작업 문서 작성 완료 — 구현은 사람 승인 후 시작"으로 갱신했다.
- TASK-007은 생성하거나 시작하지 않았다. 소스코드는 수정하지 않았다.

**변경된 파일**:
- `docs/tasks/TASK-006.md` (생성)
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**다음 단계**:
- TASK-006 구현은 사람 승인 후 Codex가 시작한다.
- TASK-007은 TASK-006 완료 및 사람 승인 후 별도로 작성/시작한다.

---

### TASK-005 공통 검증 명령 구성 (DONE)

**작업 내용**:
- `scripts/verify.sh` 통합 검증 진입점을 완료했다.
- 검증 단계는 prerequisite 확인, Git baseline 캡처, Frontend `npm ci/build/lint`, Backend Gradle Wrapper `build/test`, 베이스라인 기준 Git 증분 오염 검사, 산출물 ignore 검사, Docker Compose config 검증 순서로 구성했다.
- Backend 검증은 에이전트/CI 환경에서 홈 디렉터리 Gradle 캐시 쓰기를 피하도록 `GRADLE_USER_HOME`을 `backend/.gradle`로 지정하고, Gradle daemon 의존을 줄이기 위해 `--no-daemon`으로 실행한다.
- Git 검사는 검증 시작 시점의 `git stash create`와 `git status --porcelain --untracked-files=all` 스냅샷을 기준으로 새 변경만 검사한다.
- 당시 Docker 검증은 컨테이너 실행 없이 Compose 문법 확인만 수행했다.
- TASK-006은 시작하지 않았다.

**변경된 파일**:
- `scripts/verify.sh`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `docs/tasks/TASK-005.md`

**검증 결과**:
- `bash scripts/verify.sh; echo "exit=$?"`: 성공, `exit=0` (권한 상승 환경). Frontend, Backend, Git baseline increment, build output ignore, Docker Compose config 모두 통과.
- `cd frontend && npm ci && npm run build && npm run lint`: 성공.
- `cd backend && ./gradlew build test`: 성공 (권한 상승 환경). `BUILD SUCCESSFUL`.
- `cd backend && GRADLE_USER_HOME="$PWD/.gradle" GRADLE_OPTS="-Dorg.gradle.cache.internal.locklistener=false" ./gradlew --no-daemon build test`: 일반 샌드박스에서 실패. `java.net.SocketException: Operation not permitted`.
- 당시 Compose 설정 문법 검사: 성공.
- Git baseline 수동 재현: 성공. `git diff --exit-code "${BASE_TREE:-HEAD}"` exit 0, `comm -13` 추가 출력 없음.
- 산출물 ignore 검사: `frontend/.next`, `frontend/node_modules`, `backend/build`, `backend/.gradle` 모두 `ignored OK`.

**이슈/위험**:
- 일반 샌드박스에서 Gradle은 로컬 파일락 통신 소켓 생성 제한으로 `java.net.SocketException: Operation not permitted`가 발생한다. `GRADLE_OPTS=-Dorg.gradle.cache.internal.locklistener=false`로도 우회되지 않았고, 실제 검증은 권한 상승 환경에서 통과했다.
- `npm ci` 중 deprecated package 경고와 audit 요약 `5 vulnerabilities (1 moderate, 4 high)`가 출력된다. `npm audit fix` 또는 의존성 업그레이드는 TASK-005 범위가 아니므로 실행하지 않았다.
- Gradle은 Gradle 9.0 호환성 관련 deprecated feature 경고를 출력한다. 현재 `build test`는 성공한다.

**다음 단계**:
- TASK-005는 완료됐다.
- TASK-006은 사람 승인 후 별도로 시작한다.

---

## 2026-06-12

### TASK-005A Frontend 의존성 및 lockfile 정합성 복구

> 이 항목은 아래 "TASK-005 공통 검증 명령 구성 (BLOCKED)"에서 보고된 `npm ci` 실패를
> 해소하기 위해 생성된 선행 Task(TASK-005A, 아래 "TASK-005A 생성" 항목 참조)의 완료
> 기록이다. **TASK-005 자체는 이 항목으로 완료 처리되지 않으며**, 별도로 재시도해야
> 한다 (아래 `다음 단계` 참조).

**작업 내용**:
- Frontend 기준 Node.js 버전을 `22.20.0`으로 확정하고 `frontend/.nvmrc`에 고정했다.
- README에 Frontend 실행 전 `nvm use`와 Node.js `22.20.0` 사용 안내를 추가했다.
- Node.js `22.20.0` / npm `10.9.3` 환경에서 `frontend/package-lock.json`을 정합성 있게 복구했다.
- `frontend/package.json`은 수정하지 않았다.
- npm audit 취약점 해결은 이 Task 범위에서 제외하고 후속 Task로 남겼다.

**변경된 파일**:
- `frontend/.nvmrc`
- `frontend/package-lock.json`
- `README.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `docs/tasks/TASK-005A.md`

**검증 결과**:
- `cat frontend/.nvmrc`: `22.20.0`
- `node --version`: `v22.20.0`
- `npm --version`: `10.9.3`
- `git diff --exit-code frontend/package.json`: 성공. `frontend/package.json` 변경 없음.
- `cd frontend && npm install`: 성공. lockfile 정합성 복구.
- `git diff --stat frontend/package-lock.json`: `74` lines changed, `63` insertions, `11` deletions.
- `cd frontend && npm ci`: 성공.
- `cd frontend && npm run build`: 성공.
- `cd frontend && npm run lint`: 성공. ESLint 경고/에러 없음.
- `git diff --exit-code frontend/package.json`: 재확인 성공.

**이슈/위험**:
- npm install/ci 중 deprecated package 경고가 출력된다. 의존성 업그레이드나 audit 대응은 별도 후속 Task에서 다룬다.
- Node 25/npm 11 같은 다른 메이저 환경에서는 lockfile 해석이 달라질 수 있으므로 Frontend 작업 전 `frontend/.nvmrc` 기준 `nvm use`가 필요하다.

**다음 단계**:
- TASK-005A는 완료됐다.
- TASK-005는 사람 승인 후 재시도한다.
- TASK-006은 시작하지 않는다.

---

### TASK-005A 생성 (Frontend 의존성/lockfile 정합성 복구, 선행 Task)

> 후속 처리: 이 항목에서 생성된 TASK-005A는 같은 날 완료됐다. 완료 기록은 위
> "TASK-005A Frontend 의존성 및 lockfile 정합성 복구" 항목 참조.

**작업 내용**:
- TASK-005 구현이 BLOCKED된 사유를 검토했다. `cd frontend && npm ci`가
  `package-lock.json`과 `package.json`의 `@emnapi/core`, `@emnapi/runtime`,
  `@emnapi/wasi-threads` 관련 정합성 불일치로 실패했다 (실행 환경: Node v25.1.0,
  npm 11.6.2). TASK-005 범위에서는 `package-lock.json` 수정과 패키지 버전 변경이
  금지되어 있어 해결할 수 없으므로 BLOCKED 상태를 유지한다.
- 이를 해소하기 위한 선행 Task `docs/tasks/TASK-005A.md` ("Frontend 의존성 및
  lockfile 정합성 복구")를 작성했다.
- `docs/PLAN.md`에 TASK-005A를 TASK-005의 선행 Task로 반영하고, 현재 Task를
  TASK-005A로 갱신했다. TASK-005 상태를 BLOCKED로 표기했다.

**변경된 파일**:
- `docs/tasks/TASK-005A.md` (신규)
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- 문서 작성 작업이며 빌드/테스트 대상 변경 없음. 소스코드(`frontend/`, `backend/`,
  `docker/`)와 `scripts/verify.sh`는 수정하지 않았다. `frontend/package-lock.json`도
  아직 수정하지 않았다 (TASK-005A 본 작업에서 처리).

**남은 위험**:
- TASK-005A에서 Node/npm 버전을 고정하고 lockfile을 복구하지 못하면 TASK-005와
  이후 TASK-006 이상은 계속 대기 상태로 남는다.

**다음 단계**:
- TASK-005A (Frontend 의존성 및 lockfile 정합성 복구) 구현 대기. 사람 승인 후 시작한다.
- TASK-005A 완료 후 TASK-005를 재실행해 BLOCKED를 해소한다.
- TASK-005가 DONE이 되기 전까지 TASK-006은 시작하지 않는다.

---

### TASK-005 공통 검증 명령 구성 (BLOCKED)

**작업 내용**:
- `scripts/verify.sh` 통합 검증 진입점을 추가했다.
- 검증 단계는 prerequisite 확인, Git baseline 캡처, Frontend `npm ci/build/lint`, Backend `./gradlew build test`, 베이스라인 기준 Git 증분 오염 검사, 산출물 ignore 검사, Docker Compose config 검증 순서로 구성했다.
- Git 검사는 단순 `git diff --exit-code`가 아니라 검증 시작 시점의 `git stash create`와 `git status --porcelain --untracked-files=all` 스냅샷을 기준으로 새 변경만 검사하도록 구현했다.
- `git check-ignore`는 경로별 루프로 종료 코드를 직접 해석하도록 구현했다.
- 당시 Docker 검증은 컨테이너 실행 없이 Compose 문법 확인만 수행하도록 구현했다.

**변경된 파일**:
- `scripts/verify.sh`
- `docs/tasks/TASK-005.md`
- `docs/PROGRESS.md`

**검증 결과**:
- `bash scripts/verify.sh` 1차 실행: Frontend `npm ci/build/lint`까지 성공했으나 Backend Gradle Wrapper가 샌드박스에서 `~/.gradle` lock 파일에 접근하지 못해 실패했다.
- `bash scripts/verify.sh` 권한 상승 재실행: Frontend `npm ci`가 lockfile 불일치로 실패했다. `@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads` 관련 누락/불일치가 보고됐다.
- `bash -n scripts/verify.sh`: 성공.
- 당시 Compose 설정 문법 검사: 성공.
- 산출물 ignore 검사: `frontend/.next`, `frontend/node_modules`, `backend/build`, `backend/.gradle` 모두 ignore 처리 확인.

**이슈/위험**:
- TASK-005 Stop condition 4에 해당한다: `npm ci`가 lockfile 불일치로 실패했다.
- TASK-005 범위에서는 `frontend/package-lock.json` 수정, 패키지 버전 변경, `npm audit fix` 실행이 금지되어 있어 완료 처리할 수 없다.
- 권한 상승 환경의 Node/npm은 `node v25.1.0`, `npm 11.6.2`로 확인됐다.

**다음 단계**:
- 사람 또는 별도 승인된 Task에서 `frontend/package-lock.json` 정합성을 해결한 뒤 TASK-005 검증을 재실행한다.
- TASK-005가 DONE이 아니므로 TASK-006은 시작하지 않는다.

> **(갱신)** TASK-005A가 같은 날 완료되어 위에서 보고한 `npm ci` 실패(lockfile
> 정합성 문제)와 Node/npm 버전 미고정 문제는 해소됐다. 상세는 위 "TASK-005A
> Frontend 의존성 및 lockfile 정합성 복구" 항목 참조. 다만 **TASK-005 자체의
> 재실행과 완료 처리는 아직 수행되지 않았다** — TASK-005는 여전히 BLOCKED 상태이며,
> 사람 승인 후 재실행해야 한다.

---

### TASK-005 Task 문서 검토·수정 (계획)

**작업 내용**:
- 독립 검토 결과를 반영해 `docs/tasks/TASK-005.md`를 수정했다. 검증 인프라 설계의 오탐·환경 가정 오류를 바로잡았다.
- Git diff 검증: 단순 `git diff --exit-code` 사용을 금지하고, 검증 시작 시점을 베이스라인으로 캡처해(`git stash create` + `git status --porcelain` 스냅샷) 빌드 전후의 **새 변경만** 판별하도록 재설계했다. TASK-005가 정상적으로 추가한 `verify.sh`·문서 변경을 실패로 오판하지 않게 했다.
- Docker 조건: `docker compose config`가 Docker daemon 없이도 동작함을 확인하고, compose 파일 문법 검증만 필수로 유지했다. Stop condition을 "daemon 없음"에서 "Docker CLI/Compose 미설치"로 수정했다.
- JDK 요구사항: `backend/build.gradle.kts`가 source/target/jvmTarget 17이고 toolchain 강제 설정이 없음을 확인해 선행 조건을 JDK 17+로 정확히 명시했다 (Java 21 아님).
- `git check-ignore` 검증: 경로 미존재·미무시 시 종료 코드로 스크립트가 중단되지 않도록, 경로별 루프로 `git check-ignore -q`의 종료 코드를 직접 해석하는 안전한 방식으로 수정했다.

**변경된 파일**:
- `docs/tasks/TASK-005.md`
- `docs/PROGRESS.md`

**검증 결과**:
- 문서 검토·수정 작업이며 빌드/테스트 대상 변경 없음. 소스코드(`frontend/`, `backend/`, `docker/`)는 수정하지 않았다.
- 사실 확인: `backend/build.gradle.kts`에 toolchain/jvmToolchain/languageVersion 설정 없음(grep 무결과), Java 17 타깃. 당시 Compose 설정 문법 검사 통과(exit 0, daemon 불필요).

**남은 위험**:
- 없음. 실제 검증 스크립트 구현은 TASK-005 본 작업에서 수행하며, 사람 승인 후 시작한다.

**다음 단계**:
- TASK-005 (공통 검증 명령 구성) 구현 대기. 사람 승인 후 시작한다.

---

### TASK-005 Task 문서 작성 (계획)

**작업 내용**:
- TASK-005 "공통 검증 명령 구성"을 구현 가능한 Task 문서로 작성했다 (`docs/tasks/TASK-005.md`).
- Goal, Allowed changes, Forbidden changes, Acceptance criteria, Verification commands, Stop conditions, Result 골격을 포함했다.
- 범위: Frontend build/lint, Backend build/test, Git diff 검사, Docker Compose 설정 검증의 공통 진입점 구성. 제품 기능 구현은 제외.
- `docs/PLAN.md`의 TASK-005 항목(현재 Task 줄과 Phase 0 표)에 Task 문서 링크를 반영했다.

**변경된 파일**:
- `docs/tasks/TASK-005.md` (신규)
- `docs/PLAN.md`
- `docs/PROGRESS.md`

**검증 결과**:
- 문서 작성 작업이며 빌드/테스트 대상 변경 없음. 소스코드(`frontend/`, `backend/`, `docker/`)는 수정하지 않았다.

**남은 위험**:
- 없음. 실제 검증 스크립트 구현은 TASK-005 본 작업에서 수행하며, 사람 승인 후 시작한다.

**다음 단계**:
- TASK-005 (공통 검증 명령 구성) 구현 대기. 사람 승인 후 시작한다.

---

### TASK-001 프로젝트 초기 실행 환경 구성

**작업 내용**:
- Frontend 최소 Next.js 14 App Router 프로젝트 생성
- Backend 최소 Spring Boot 3.2 Kotlin 프로젝트 생성
- `/health` 엔드포인트 추가
- 당시 개발용 DB 실행 환경 추가(현재 구성은 TASK-BE-001로 대체)
- `.editorconfig` 추가

**PLAN.md 범위 정합성**:
- 이 Task로 PLAN.md의 TASK-002 (Frontend 초기화), TASK-003 (Backend 초기화), TASK-004 (당시 DB 개발 환경 구성) 범위가 모두 함께 수행·검증됐다. 별도 Task 문서는 만들지 않는다.
- TASK-002 검증 근거: `npm install`, `npm run build`, `npm run lint`, `npm run dev` + `curl http://localhost:3000` 모두 성공 (아래 `검증 결과` 블록 참조).
- TASK-003 검증 근거: `./gradlew build` 성공, `./gradlew bootRun` 실행 후 `curl http://localhost:8080/health`가 `HTTP/1.1 200`과 `{"status":"UP"}` 반환.
- TASK-004 검증 근거: 당시 개발용 DB 시작·상태·접속·질의·종료 확인이 성공했다. 폐기된 구성의 실행 명령은 제거했다.

**변경된 파일**:
- `.editorconfig`
- `.gitignore` (승인된 예외 — Gradle Wrapper JAR 추적용)
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/next.config.js`
- `frontend/tsconfig.json`
- `frontend/.eslintrc.json`
- `frontend/.gitignore`
- `frontend/next-env.d.ts`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/globals.css`
- `backend/build.gradle.kts`
- `backend/settings.gradle.kts`
- `backend/gradle/wrapper/gradle-wrapper.jar`
- `backend/gradle/wrapper/gradle-wrapper.properties`
- `backend/gradlew`
- `backend/gradlew.bat`
- `backend/src/main/kotlin/com/valorant/platform/Application.kt`
- `backend/src/main/resources/application.yml`
- `backend/src/test/kotlin/com/valorant/platform/ApplicationTests.kt`
- `docs/PLAN.md` (승인된 예외 — 계획-실제 상태 정합성)
- `docs/tasks/TASK-001.md`
- `docs/PROGRESS.md`

**검증 결과**:
- `cd frontend && npm install`: 성공
- `cd frontend && npm run build`: 성공
- `cd frontend && npm run lint`: 성공
- `cd frontend && npm run dev` 후 `curl http://localhost:3000 | head -20`: 성공
- `cd backend && ./gradlew build`: 성공
- `cd backend && ./gradlew bootRun` 후 `curl http://localhost:8080/health`: 성공
- 당시 개발용 DB 실행·상태·연결·질의·종료 확인: 성공. 현재 MongoDB 구성의 검증 결과는 TASK-BE-001에 별도 기록한다.
- `.gitignore` Gradle Wrapper 예외: 적용 완료. `*.jar` 중복 규칙을 정리하고 `!backend/gradle/wrapper/gradle-wrapper.jar` 예외를 추가해 Wrapper JAR가 정상 추적된다. `git check-ignore`로 더 이상 무시되지 않음을 확인했다.

**승인된 예외 (TASK-001 원래 Allowed changes 밖)**:
- `.gitignore` 수정: Gradle Wrapper JAR를 정상 추적하기 위해 `!backend/gradle/wrapper/gradle-wrapper.jar` 예외를 추가했다 (사람 승인).
- `docs/PLAN.md` 수정: TASK-001이 TASK-002~004 범위까지 수행한 결과를 계획에 반영하고 현재 Task를 TASK-005 대기로 갱신했다 (사람 승인). 상세는 `docs/tasks/TASK-001.md`의 `Approved exceptions` 참조.

**범위 정합성 (TASK-002~004 통합)**:
- TASK-002 (Frontend 초기화), TASK-003 (Backend 초기화), TASK-004 (당시 DB 개발 환경 구성)는 별도 작업이 아니라 TASK-001 범위에서 함께 수행·검증되어 완료됐다. `docs/PLAN.md`와 `docs/tasks/TASK-001.md`에 동일하게 반영했다.

**이슈/위험**:
- `npm audit --omit=dev` 기준으로도 배포 의존성 취약점이 남아 있다: `next` high, `postcss` moderate. 전체 audit은 `glob` high 등 dev dependency 경로를 포함해 총 5건(1 moderate, 4 high)을 보고했다.
- `npm audit fix --force`는 Next.js 16으로의 breaking change를 요구하므로 실행하지 않았다.
- npm audit 취약점 검토와 대응은 TASK-001 범위에 포함하지 않고 별도 후속 작업으로 분리한다.

**다음 단계**:
- TASK-001은 완료됐다.
- TASK-002, TASK-003, TASK-004는 TASK-001 범위에 통합되어 함께 완료됐다.
- 다음 실제 Task는 TASK-005 (공통 검증 명령 구성). 사람 승인 후 시작한다.

---

### 프로젝트 초기화

**작업 내용**:
- 프로젝트 문서 구조 생성
- AGENTS.md 작성 (AI 에이전트 작업 규칙)
- docs/SPEC.md 작성 (제품 명세)
- docs/ARCHITECTURE.md 작성 (아키텍처 설계)
- docs/PLAN.md 작성 (개발 계획)
- docs/PROGRESS.md 작성 (이 문서)
- docs/DECISIONS.md 작성 (기술 결정 기록)
- docs/tasks/TASK-001.md 작성 (첫 번째 Task)
- README.md 초안 작성
- .gitignore 생성

**생성된 파일**:
```
valorant-platform/
├── AGENTS.md
├── README.md
├── .gitignore
└── docs/
    ├── SPEC.md
    ├── ARCHITECTURE.md
    ├── PLAN.md
    ├── PROGRESS.md
    ├── DECISIONS.md
    └── tasks/
        └── TASK-001.md
```

**다음 단계**:
- TASK-001 시작 대기 (사람 승인 필요)

---

## 로그 형식

각 항목은 다음 형식을 따른다:

```markdown
## YYYY-MM-DD

### [Task ID 또는 작업 제목]

**작업 내용**:
- 수행한 작업 목록

**변경된 파일**:
- 파일 경로 목록

**검증 결과**:
- 실행한 검증 명령과 결과

**이슈/위험**:
- 발견된 문제나 주의 사항

**다음 단계**:
- 후속 작업
```
