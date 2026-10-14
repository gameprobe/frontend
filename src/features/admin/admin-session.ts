/**
 * 예시 입장 여부. 실제 관리자 인증이 아니며 이 탭(sessionStorage)에만 남는다.
 * 실제 토큰 인증(POST /api/admin/session)은 백엔드 연결 Task에서 붙인다.
 */
export const DEMO_CODE = "DEMO1234";
const KEY = "gameprobe-admin-demo";
/** sessionStorage를 못 쓰는 환경에서 이번 페이지 동안만 쓰는 값 */
let entered = false;

export function isDemoCode(value: string): boolean {
  return value.trim().toUpperCase() === DEMO_CODE;
}

export function hasDemoSession(): boolean {
  try {
    return entered || window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return entered;
  }
}

export function startDemoSession(): void {
  entered = true;
  try {
    window.sessionStorage.setItem(KEY, "1");
  } catch {
    // 저장소를 못 쓰면 이번 화면에서만 들어간다
  }
}

export function endDemoSession(): void {
  entered = false;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // 무시
  }
}
