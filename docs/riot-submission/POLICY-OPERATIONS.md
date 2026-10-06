# 개인정보 안내 최종화 — 확인 사실과 운영자 결정

2026-09-29 · TASK-FE-034

## 신청 경로
VALORANT는 Personal Key 신청을 지원하지 않는다. Production Key를 신청하고 승인 후 RSO 연동 절차를 진행한다. 예시 데이터로 사용자 흐름을 보여주는 프로토타입도 심사 자료로 제시할 수 있다. 무료 서비스라도 신청 키 종류는 Production이다.

## 5번 항목의 의미

개인정보 안내는 “무엇을, 왜, 어디에, 언제까지 보관하고 어떻게 삭제하는지”를 실제 동작과 맞추는 작업이다. 페이지 문구 수정과 운영자 메일함/플랫폼 설정 변경은 서로 다르다.

| 대상 | 확인 사실 | 남은 확인 |
|---|---|---|
| 실제 Riot 전적·토큰 | 현재 예시 데모에서 수집하지 않음 | 실제 연동 전 별도 보관·공개·철회 구현 |
| 언어·프로필 저장 설정 | 브라우저 저장, 자동 만료 없음, 이용자가 사이트 데이터 삭제 가능 | 현 동작 설명은 반영 완료 |
| 연결 동의 체험 | 메모리 상태, 새로고침/이탈 시 초기화 | 실제 서버 동의 기록이 아님을 반영 완료 |
| 이메일 문의 | Gmail, 이메일/표시이름/본문/첨부, 담당 ShinJungho | 해결 후30일 이내 수동 영구삭제 — 사용자 확인 완료 |
| 호스팅 요청 | Vercel에 실제 배포, 도메인 접근 정상 | Hobby/분석/Drains 확인 완료. 국외 처리 상세 고지·적용 조건은 후속 검토 |

프론트에서 API요청0이라는 결과는 호스팅 사업자의 IP·보안 기록까지 없다는 뜻이 아니다. 브라우저 사이트 데이터 삭제는 Gmail 문의나 Vercel 기록 삭제와 다르다.

## 반영한 내용
- 공개 개인정보 페이지에 Vercel을 호스팅 제공자로 명시.
- 요청 경로·응답 상태·시각 등 운영 기록 가능성과 실제 계정 설정 미확인을 구분.
- 런타임 로그 조회 기간을 모든 데이터의 삭제 기간으로 혼동하지 않도록 정리.
- 문의 이메일과 브라우저 저장의 삭제 범위 차이, 자동 메일 삭제 기능 부재를 명시.
- 열람/정정/삭제/처리 중지 요청을 보낼 방법을 구체화. 불필요한 신분증/비밀번호 요청 없음.
- 이미 공개된 사이트에서 “공개 운영 전”으로 표현한 시제를 수정. 정책 미확정 부분은 계속 초안으로 표시.

## 확정한 문의 방침 — 2026-09-29

사용자가 수동 삭제 방침을 확인했다. 아래 기준을 한영 정책 페이지에 반영했다. 법정 보관 기간이나 자동 삭제 기능으로 주장하지 않는다.

한국어:
“문의 대응을 위해 발신자 이메일, 표시 이름, 본문 및 자발적으로 제공한 첨부파일을 처리합니다. 문의가 해결된 날부터 30일 이내 관련 메일·첨부파일을 삭제하고 Gmail 휴지통에서도 영구 삭제합니다. 별도로 내려받은 사본이 있다면 함께 삭제합니다. 법령상 보존이 필요한 경우에는 해당 근거와 기간을 별도로 안내합니다.”

English:
“We process the sender’s email address, display name, message and voluntarily supplied attachments to respond to inquiries. Within 30 days after an inquiry is resolved, we delete the related messages and attachments, permanently remove them from Gmail Trash, and delete any separately downloaded copies. If retention is required by law, we will separately explain the applicable basis and period.”

### 실제 수행 절차
1. 문의 해결일을 본인이 확인한다. 해결 여부가 불명확하면 먼저 후속 답변을 마무리한다.
2. 해결 후 30일 이내 관련 대화/첨부를 삭제한다. 자동 일정이나 자동 삭제는 이번 작업에서 만들지 않았다.
3. Gmail 휴지통에서도 해당 메일을 영구 삭제한다. 관련 없는 메일을 한꺼번에 지우지 않는다.
4. 별도 저장한 첨부/내보내기 사본도 확인한다. 보존 의무가 있는 자료는 적용 근거를 확인하고 별도로 취급한다.

Gmail은 삭제된 메일을 휴지통에서 최대30일 유지한 뒤 영구 삭제한다. 이것은 “문의 해결 후30일”이라는 운영 방침과 다른 기간이다. 받은 편지함에서 지우는 것만으로 위 방침을 모두 이행한 것은 아니다. 사업자 백업까지 즉시 지운다고 약속하지 않는다.

## Vercel 로그인 후 확인 결과 — 2026-09-29

사용자가 로그인한 Codex 대화 내 브라우저에서 읽기 전용 확인했다. Chrome을 사용할 경우 Jhshin.dev 프로필만 사용한다.

| 항목 | 실제 화면 근거 | 결과 |
|---|---|---|
| 플랜 | 프로젝트 상단 Hobby | Hobby 확인 |
| Web Analytics | Enable 버튼 / Demo Data | 비활성화 |
| Speed Insights | Get Started / 패키지 설치 안내 / No events collected | 수집 이벤트 없음; 비활성화라고 단정하지 않음 |
| Drains | Get started / Upgrade to Pro to create your first Drain | 등록된 외부 전달 없음 |
| Logs | 시간·GET·응답상태·호스트·경로 행 | 공개 도메인 요청 기록 존재 |

프로젝트 package.json에는 Analytics/Speed Insights 패키지가 없다. 설정 변경·추가 비용·외부 전송·원본 로그 내보내기는 하지 않았다.
공식 문서상 Hobby Runtime Logs 조회/보관 범위는1시간이다. 이는 보안 기록이나 백업 등 전체 플랫폼 데이터의 일괄 파기 시점이 아니다.
Vercel Privacy Notice는 미국 및 기타 운영 국가의 처리 가능성과 목적에 따른 보관을 명시한다. 특정 프로젝트의 모든 처리 국가나 고정 파기 일수를 이 문서에서 확정할 수 없다.

## 국외 처리 공식 문서 대조 — 2026-09-29
- Vercel Privacy Notice: 미국 및 기타 운영 국가에서 처리 가능. 보안·계약·법적 목적에 따라 보관하고 불필요한 정보는 삭제/익명화하며 백업의 즉시 삭제는 보장하지 않음.
- Vercel DPA 1항은 Pro·Enterprise 적용을 명시. 현재 Hobby에 별도 처리계약이 체결됐다고 주장하지 않음. 이 사실만으로 Pro 업그레이드가 법적으로 필수라고 결론내리지 않음.
- Google Privacy Policy: Google LLC 및 계열사의 서비스, 전 세계 서버에서 거주국 밖 처리 가능. 개인 Gmail의 한국 전용 저장이나 Workspace 계약 적용을 주장하지 않음.
- Google Retention: 일반적인 삭제 약2개월, 암호화 백업 최대6개월, 예외 지연 가능. 운영자30일 삭제 기준과 구분하여 한영 화면 반영.
- 수신자·목적·항목·전송 시점/방법·알려진 국외 처리 범위·삭제 범위·권리 요청 방법과 공식 링크를 화면에 추가.

## 남은 판단과 범위
- 사용자 “시작해보자”에 따라 검증된 사실 고지 보완본의 커밋·dev→main·공개 반영 진행. 신청 제출은 미승인/미실행.
- 공개 문서만으로 개별 문의/요청의 모든 처리 국가 및 파기일을 특정할 수 없음. 한국 개인정보보호법상 적절한 국외 이전 근거·필수 고지 충족 여부는 법률 또는 제공자 확인 필요. 임의의 동의 근거나 계약을 만들지 않음.
- 따라서 사실 고지 보완은 구현 완료하되 약관·개인정보의 초안 표시를 유지. “신청 요건을 모두 충족했다” 또는 “법률 검토 완료”로 보고하지 않음.
- 이미 확정한 운영자·메일·30일 방침·로그인은 재질문하지 않음. 유료 플랜이나 외부 설정 변경 없음.

## 근거
- [Riot VALORANT 정책 및 Production Key/RSO](https://developer.riotgames.com/docs/valorant)
- [개인정보 보호법 제30조](https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1029331583) — 처리 목적·보유기간·파기·권리·연락처 등 실제 정책 내용 확인
- [Vercel Runtime Logs](https://vercel.com/docs/logs/runtime) — 플랜별 런타임 로그 제한
- [Vercel Privacy Notice](https://vercel.com/legal/privacy-notice)
- [Gmail 삭제 안내](https://support.google.com/mail/answer/7401?hl=ko)

- [Vercel DPA 적용 범위](https://vercel.com/legal/dpa)
- [Google 개인정보처리방침](https://policies.google.com/privacy?hl=ko)
- [Google 보관·삭제](https://policies.google.com/technologies/retention?hl=ko)
