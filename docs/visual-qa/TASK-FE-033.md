# TASK-FE-033 Visual QA

## 결과
PASS — 공통 고지·정책 문구와 예시 문의처를 현재 데모 상태에 맞게 정리했다.

- 기준: PR #27 병합 `87119c0`, `codex/service-notices`.
- 참조 화면: 아래 Before. 정책 본문의 정보 보완과 푸터의 높이 증가가 의도한 차이다.
- Playwright Before 22장 / After 22장. 정책 2페이지 × 1440/390/320px × 한국어/영어 = 12조건.
- 문의 주소/예시·미접수 문구, mailto 없음, 개인정보/약관/문의 앵커 이동과 제목 가림 없음 확인.
- 홈·프로필 상단 4쌍: pixelmatch threshold 0.1·antialiasing 제외, 변경 픽셀 0. 문서 넘침 및 브라우저 예외 0.
- 홈·프로필·계정 연결의 공통 푸터 6조건, 연결 체험 동의→요약→철회 2조건 PASS.
- 소스 사실성·범위 독립 리뷰와 별도 에이전트 시각 리뷰 PASS. Cursor 리뷰를 수행했다고 간주하지 않는다.
- TypeScript / ESLint / production build (정적 12페이지) / diff 검사 PASS.
- 빌드 후 개발 서버 복원. 1440/390px HTTP 200·Enter 문의 이동·예시 이메일 비링크 재확인 PASS.

## 시각 평가
- PC에서는 브랜드·정책 링크 아래 고지와 문의처가 구분된다. 작은 화면에서는 자연스럽게 줄바꿈하며 겹침이나 잘림이 없다.
- 예시 주소임과 실제 문의를 받지 않는다는 설명을 함께 표시한다. 전화번호/발송 링크는 추가하지 않았다.
- 원래 본문·메뉴는 유지한다. 320px 공통 메뉴의 가로 스크롤은 Before와 같은 동작이다.
- 1440 홈 푸터, 390 홈/프로필 푸터, 320 영문 개인정보, 390 한글 약관을 원본 화면과 정성 비교해 필수 수정 사항이 없음을 확인했다.

## Before / After

| 화면 | Before | After |
|---|---|---|
| 1440 / ko / privacy / 전체 | [Before](assets/TASK-FE-033/before-1440-privacy-ko.png) | [After](assets/TASK-FE-033/after-1440-privacy-ko.png) |
| 1440 / ko / terms / 전체 | [Before](assets/TASK-FE-033/before-1440-terms-ko.png) | [After](assets/TASK-FE-033/after-1440-terms-ko.png) |
| 1440 / en / privacy / 전체 | [Before](assets/TASK-FE-033/before-1440-privacy-en.png) | [After](assets/TASK-FE-033/after-1440-privacy-en.png) |
| 1440 / en / terms / 전체 | [Before](assets/TASK-FE-033/before-1440-terms-en.png) | [After](assets/TASK-FE-033/after-1440-terms-en.png) |
| 390 / ko / privacy / 전체 | [Before](assets/TASK-FE-033/before-390-privacy-ko.png) | [After](assets/TASK-FE-033/after-390-privacy-ko.png) |
| 390 / ko / terms / 전체 | [Before](assets/TASK-FE-033/before-390-terms-ko.png) | [After](assets/TASK-FE-033/after-390-terms-ko.png) |
| 390 / en / privacy / 전체 | [Before](assets/TASK-FE-033/before-390-privacy-en.png) | [After](assets/TASK-FE-033/after-390-privacy-en.png) |
| 390 / en / terms / 전체 | [Before](assets/TASK-FE-033/before-390-terms-en.png) | [After](assets/TASK-FE-033/after-390-terms-en.png) |
| 320 / ko / privacy / 전체 | [Before](assets/TASK-FE-033/before-320-privacy-ko.png) | [After](assets/TASK-FE-033/after-320-privacy-ko.png) |
| 320 / ko / terms / 전체 | [Before](assets/TASK-FE-033/before-320-terms-ko.png) | [After](assets/TASK-FE-033/after-320-terms-ko.png) |
| 320 / en / privacy / 전체 | [Before](assets/TASK-FE-033/before-320-privacy-en.png) | [After](assets/TASK-FE-033/after-320-privacy-en.png) |
| 320 / en / terms / 전체 | [Before](assets/TASK-FE-033/before-320-terms-en.png) | [After](assets/TASK-FE-033/after-320-terms-en.png) |
| 1440 / ko / / / top | [Before](assets/TASK-FE-033/before-1440-home-top.png) | [After](assets/TASK-FE-033/after-1440-home-top.png) |
| 1440 / ko / / / footer | [Before](assets/TASK-FE-033/before-1440-home-footer.png) | [After](assets/TASK-FE-033/after-1440-home-footer.png) |
| 1440 / ko / /players/ied-agent-allen / top | [Before](assets/TASK-FE-033/before-1440-profile-top.png) | [After](assets/TASK-FE-033/after-1440-profile-top.png) |
| 1440 / ko / /players/ied-agent-allen / footer | [Before](assets/TASK-FE-033/before-1440-profile-footer.png) | [After](assets/TASK-FE-033/after-1440-profile-footer.png) |
| 1440 / ko / /connect / footer | [Before](assets/TASK-FE-033/before-1440-connect-footer.png) | [After](assets/TASK-FE-033/after-1440-connect-footer.png) |
| 390 / ko / / / top | [Before](assets/TASK-FE-033/before-390-home-top.png) | [After](assets/TASK-FE-033/after-390-home-top.png) |
| 390 / ko / / / footer | [Before](assets/TASK-FE-033/before-390-home-footer.png) | [After](assets/TASK-FE-033/after-390-home-footer.png) |
| 390 / ko / /players/ied-agent-allen / top | [Before](assets/TASK-FE-033/before-390-profile-top.png) | [After](assets/TASK-FE-033/after-390-profile-top.png) |
| 390 / ko / /players/ied-agent-allen / footer | [Before](assets/TASK-FE-033/before-390-profile-footer.png) | [After](assets/TASK-FE-033/after-390-profile-footer.png) |
| 390 / ko / /connect / footer | [Before](assets/TASK-FE-033/before-390-connect-footer.png) | [After](assets/TASK-FE-033/after-390-connect-footer.png) |

## 실행 근거
- [검증 스크립트](assets/TASK-FE-033/verify.cjs)
- [Before 결과](assets/TASK-FE-033/before.json), [After 결과](assets/TASK-FE-033/after.json), [서버 복원 후 검사](assets/TASK-FE-033/post-build.json)
- 실행 명령과 전체 변경 범위: [Task](../tasks/TASK-FE-033.md).

## 검사 중 보완 / 한계
- 최초 Chromium 실행은 샌드박스 권한으로 실패해 승인된 로컬 브라우저 실행 권한으로 촬영했다.
- 지연 로딩 이미지의 무기한 decode 대기를 제한했다. 제품 코드는 변경하지 않고 검증 프로세스만 재실행했다.
- 최초 홈 상단 PNG byte 비교는 가장자리의 미세한 antialiasing 82픽셀로 실패했다. 이미지를 직접 대조하고 표준 픽셀 비교로 확인한 결과 유의미한 변경은 0이었다. 이후 4쌍도 같은 기준으로 검사했다.
- 컨테이너의 기존 git 미설치 로그는 빌드·린트 결과에 영향이 없었다.
- 운영 배포 환경의 호스팅 로그·분석 도구·외부 서비스 설정과 실제 문의 수신은 검사하지 않았다. 예시 이메일이며 동의/인증/권한/삭제 정책을 새로 구현하지 않았다.
- 최종 운영 정보와 법률 검토 및 API 신청 승인 여부를 이 검증으로 보장하지 않는다.
