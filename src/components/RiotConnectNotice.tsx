import { AccountConsentDemo } from "../features/account-connection/AccountConsentDemo";

/** /connect의 기존 진입점. 실제 RSO 대신 계정 공개 동의의 앞뒤 화면을 시연한다. */
export function RiotConnectNotice() {
  return <AccountConsentDemo />;
}
