# TASK-FE-035 Visual QA

- Status: IMPLEMENTED
- Human Decision Required: YES — UI 검토 및 이 신규 기능의 공개 배포 여부. 실제 학습을 위한 데이터 출처·허용 범위·동의/삭제 설계는 별도 후속 작업.
- 사용자가 예시 분석 리포트 선택. /insights에 한영 스타일·위치/타이밍/습관 탭, 가상 비교 수치, 관측/해석 한계/연습 목표, 실제 학습 전제조건 구현.
- 모든 수치는 별도 가상 예시. 실제 최상위권 데이터/학습 모델/정확도 주장 없음. 기존 DemoPlayer01과 혼동되지 않게 고지.
- 공통 Insights 메뉴 및 모바일 More 링크 추가. 현재 메뉴 표시/키보드 방향키·Home·End/aria 관계 구현.
- 영문 신청서에 목표·비교 조건·데이터 확보/이용허용·학습 미실행·증거 한계와 미배포 경로 구분 추가.
- 검증: cd frontend && npx tsc --noEmit; npm run lint; npm run build 모두 PASS(14정적 경로). PLAYWRIGHT_MODULE 지정 verify.cjs before/after PASS: Before4/After16, 1440/390·ko/en, 분석3탭/키보드/모바일More 진입/가로넘침0/console·page오류0. git diff --check PASS.
- 직접 시각검토: 모바일한국어/PC영어의 글자·차트·긴문구 줄바꿈 확인. 초기 섹션간격 및 모바일 접근성 개선 후 재촬영.
- 신규 페이지이므로 Before는 기존 프로필 진입점4장, After는 프로필4장+새페이지3탭12장. 기존 화면의 메뉴 추가와 신규 화면 모두 검증.
- 커밋/배포 없음. 공개 /insights를 심사 URL로 제출하지 않음. 로컬 http://127.0.0.1:3100/insights 검토 가능.
- 이전 FE034 배포 후 문서 변경과 사용자 current-screen.png는 보존.

## 화면
- [기존 프로필 Before](assets/TASK-FE-035/before-390-ko-profile.png)
- [기존 프로필 After](assets/TASK-FE-035/after-390-ko-profile.png)
- [모바일 분석 리포트](assets/TASK-FE-035/after-390-ko-position.png)
- [PC 영어 분석 리포트](assets/TASK-FE-035/after-1440-en-position.png)
