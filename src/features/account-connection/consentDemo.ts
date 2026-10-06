// /connect의 공개 동의 시연만 관리한다. 실제 로그인·인증·공개 권한을 부여하는 상태가 아니다.
export type ConsentDemoState = {
  step: 'intro' | 'consent' | 'profile' | 'private';
  accepted: boolean;
  outcome: 'cancelled' | 'revoked' | null;
};

type ConsentDemoAction =
  | { type: 'begin' }
  | { type: 'accept'; value: boolean }
  | { type: 'cancel' }
  | { type: 'grant' }
  | { type: 'revoke' }
  | { type: 'reset' };

export const initialConsentDemoState: ConsentDemoState = {
  step: 'intro',
  accepted: false,
  outcome: null,
};

// 동의는 매 시연마다 새로 받는다. 저장소/세션을 사용하지 않아 페이지 재진입 시 초기화된다.
export function consentDemoReducer(
  state: ConsentDemoState,
  action: ConsentDemoAction,
): ConsentDemoState {
  switch (action.type) {
    case 'begin':
      return state.step === 'intro' || state.step === 'private'
        ? { step: 'consent', accepted: false, outcome: null }
        : state;
    case 'accept':
      return state.step === 'consent' ? { ...state, accepted: action.value } : state;
    case 'grant':
      return state.step === 'consent' && state.accepted
        ? { step: 'profile', accepted: true, outcome: null }
        : state;
    case 'cancel':
      return state.step === 'consent'
        ? { step: 'private', accepted: false, outcome: 'cancelled' }
        : state;
    case 'revoke':
      return state.step === 'profile'
        ? { step: 'private', accepted: false, outcome: 'revoked' }
        : state;
    case 'reset':
      return initialConsentDemoState;
  }
  return state;
}
