# TASK-FE-055 Visual QA — Vite 이관

- 날짜: 2026-10-14 KST
- 기준: 개인 저장소 dev `259d880`의 최신 Vite. Before는 구형 Next 화면이 아니라 **이관할 Vite 원본**이다.
- After: 조직 frontend `83c9023` 위에 같은 Vite 파일을 이관한 로컬 Compose.
- 방법: Codex 브라우저 Playwright API로 경로 이동/새로고침, 데스크톱 1440×1000·모바일 390×844에서 full-page 캡처. 저장된 Before/After를 직접 시각 대조.
- 결과: PASS. 홈의 헤더·히어로·요원 카드·하단 통계, 모바일 한 열 배치·두 열 요원 카드, 프로필의 요약·사이드바·경기 목록에서 이관으로 인한 레이아웃 붕괴·텍스트 겹침·자산 누락을 발견하지 않았다. PNG 바이트는 소폭 달라 완전 픽셀 동일 판정은 하지 않는다.
- 제품 파일 541개는 원본 바이트와 동일하다(저장소별 ignore 두 파일 제외). 제품 UI를 별도 수정하지 않았다.
- Cursor의 독립 리뷰를 실행했다고 주장하지 않는다. 이 문서는 Codex 구현자 검증이다.

| 화면 | Before | After |
| --- | --- | --- |
| 홈 데스크톱 | [Before](../../screenshots/TASK-FE-055/before-home-desktop.png) | [After](../../screenshots/TASK-FE-055/after-home-desktop.png) |
| 홈 모바일 | [Before](../../screenshots/TASK-FE-055/before-home-mobile.png) | [After](../../screenshots/TASK-FE-055/after-home-mobile.png) |
| 프로필 데스크톱 | [Before](../../screenshots/TASK-FE-055/before-profile-desktop.png) | [After](../../screenshots/TASK-FE-055/after-profile-desktop.png) |

## 실제 연결과 빌드 이미지

- 프론트의 기존 `backendApi.getHealth`를 임시 검증 페이지에서 호출했다. 원래 fetch를 그대로 실행하면서 요청·응답을 기록했으며 응답을 대체하지 않았다.
- `http://localhost:3000` → `http://localhost:8000/health`: GET, CORS, credentials omit, cache no-store, HTTP 200, `{status:"UP"}` PASS.
- 서버 로그에서도 해당 시각 GET /health 200을 확인했다. 임시 검증 HTML은 제거했다.
- [브라우저 응답 증거](../../screenshots/TASK-FE-055/backend-connection.png).
- 최종 ARM64 정적 이미지의 프로필 URL 직접 접속/새로고침 및 라인업 메뉴 이동 PASS, 브라우저 error 0.
- [빌드 이미지 직접 경로](../../screenshots/TASK-FE-055/image-direct-route.png).

이 결과는 실행·라우팅·실제 health 연결 검증이다. 전적·라인업 화면 데이터는 여전히 예시이며 DB·실제 Riot 로그인·기능 API 연결은 미구현이다.
