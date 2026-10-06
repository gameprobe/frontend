const fs=require('node:fs'), path=require('node:path');
const runtime=process.env.QA_NODE_MODULES;
if(!runtime)throw Error('Set QA_NODE_MODULES to existing runtime node_modules');
const {PNG}=require(path.join(runtime,'pngjs'));
const moduleValue=require(path.join(runtime,'pixelmatch'));const pixelmatch=moduleValue.default||moduleValue;
const dir=__dirname;
const before=JSON.parse(fs.readFileSync(path.join(dir,'before.json'))),after=JSON.parse(fs.readFileSync(path.join(dir,'after.json')));
const comparison=[];
for(const item of before.screens){const af=item.file.replace('before-','after-');if(!fs.existsSync(path.join(dir,af)))continue;const a=PNG.sync.read(fs.readFileSync(path.join(dir,item.file))),b=PNG.sync.read(fs.readFileSync(path.join(dir,af)));const width=Math.min(a.width,b.width),height=Math.min(a.height,b.height);const changed=a.width===b.width?pixelmatch(a.data.subarray(0,width*height*4),b.data.subarray(0,width*height*4),null,width,height,{threshold:0.1}):null;comparison.push({before:item.file,after:af,beforeSize:[a.width,a.height],afterSize:[b.width,b.height],comparedHeight:height,changedPixels:changed});}
fs.writeFileSync(path.join(dir,'comparison.json'),JSON.stringify(comparison,null,2)+'\n');
const unchanged=comparison.filter(r=>r.changedPixels===0&&r.beforeSize[1]===r.afterSize[1]).length;
const changed=comparison.filter(r=>r.changedPixels!==0||r.beforeSize[1]!==r.afterSize[1]);
const md=`# TASK-FE-034 Visual QA — Riot 신청 준비 마감

자동 집계: \`summarize.cjs\` · 기준 dev \`6249e14\` · ${after.capturedAt}

## 검증 범위 및 실제 결과

- Before: 개발 서버의 기존 dev, ${before.screens.length}장.
- After: 최종 수정의 로컬 production build, ${after.screens.length}장 + 경기 푸터 4장.
- 1440×960 / 390×960, 한국어/영어. 홈·합성 프로필·단독 경기·연결·정책2개·라인업·스모크 8경로.
- ${after.checks.length}개 검사 그룹 완료. 경기 5개 탭, 홈→프로필→모달→단독 경기→복귀, 동의 기본 미선택·취소·허용·철회·재동의·리로드.
- 브라우저 예외 ${after.errors.length}, 콘솔 오류 ${after.consoleErrors.length}, API 요청 ${(after.apiRequests||[]).length}.
- 페이지 이동으로 취소된 RSC prefetch는 raw JSON에 남기며 실행 예외/외부 요청 실패와 구분한다. 예상 밖 실패는 테스트 실패 처리.
- 비교 ${comparison.length}쌍 중 크기·픽셀 동일 ${unchanged}쌍(색상 threshold 0.1, 안티앨리어싱 제외).
- 원본 결과: [Before](assets/TASK-FE-034/before.json), [After](assets/TASK-FE-034/after.json), [픽셀 대조](assets/TASK-FE-034/comparison.json).

## 변경된 화면

| Before | After | 기존/최종 크기 | 공통 영역 차이 픽셀 |
|---|---|---|---:|
${changed.map(r=>`| [${r.before}](assets/TASK-FE-034/${r.before}) | [${r.after}](assets/TASK-FE-034/${r.after}) | ${r.beforeSize.join('×')} → ${r.afterSize.join('×')} | ${r.changedPixels} |`).join('\n')}

## 시각 검토

- 변경 목적은 합성 단독 경기의 공통 Riot 고지·정책·문의 링크 추가다. 최초 배치의 화면 가장자리 밀착을 발견해 경기 본문 컨테이너 안으로 이동했다.
- PC/모바일 경기·영문 동의 화면을 직접 이미지로 확인했다. 최종 결과의 여백, 줄바꿈, 정책 링크와 기존 경기 본문은 아래 이미지 및 픽셀 비교를 기준으로 평가한다.
- 모바일 스코어보드와 탭은 기존 내부 가로 스크롤을 유지한다. 문서 전체 가로 넘침은 없음.
- 실제 문의처/법적 운영 정보는 입력 대기이므로 예시·초안 고지를 보존했다. 이를 승인 완료로 평가하지 않는다.
- 외부 디자인 레퍼런스 추가 없음. 이번 작업의 기준은 Before 레이아웃과 기존 공통 푸터다. 독립 Cursor 검토는 수행하지 않았다.

### 데스크톱
![Before desktop](assets/TASK-FE-034/before-1440-ko-match.png)
![After desktop](assets/TASK-FE-034/after-1440-ko-match.png)

### 모바일
![Before mobile](assets/TASK-FE-034/before-390-en-match.png)
![After mobile](assets/TASK-FE-034/after-390-en-match.png)

### 동의와 철회
![Consent granted](assets/TASK-FE-034/after-390-en-consent-granted.png)
![Consent withdrawn](assets/TASK-FE-034/after-390-en-consent-withdrawn.png)

## 공개 환경과의 차이

[공개 사이트 점검](assets/TASK-FE-034/live.json): 기존 www.game-probe.com 7경로 HTTP200이나 /connect는 이전 비활성 안내.
Vercel 최신 dev 배포는 BLOCKED이며 dev 별칭은 Vercel 로그인을 요구한다. 공개 최신 배포 검증 통과를 주장하지 않는다.

## 실행 및 초기 보정

- 설치된 agent-browser 실행 파일과 Playwright 전용 Chromium이 없어 기존 Chrome을 Playwright channel=chrome으로 사용했다. 새 패키지/브라우저 다운로드 없음.
- 최초 검증 선택자에서 계정명에 포함된 태그와 경기 내부 footer 주석을 구분하지 못해 실패했다. 실제 DOM에 맞춘 계정명 정규식/정책 링크 footer 선택자로 보정했다.
- 초기 favicon.ico 404는 자체 GP SVG 아이콘으로 해소. Before localhost:8080 라인업 요청 실패는 미설정 공개 API의 로컬 기본값 제거로 해소.
- 실행: PLAYWRIGHT_MODULE 지정 후 verify.cjs before/after; QA_NODE_MODULES 지정 후 summarize.cjs.
`;
fs.writeFileSync(path.resolve(dir,'../../TASK-FE-034.md'),md);console.log(JSON.stringify({pairs:comparison.length,unchanged,changed:changed.map(r=>({file:r.after,pixels:r.changedPixels,sizes:[r.beforeSize,r.afterSize]}))},null,2));
