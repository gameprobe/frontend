import { useStoredValue } from "@/lib/stored-list";
import type { RiotId } from "@/lib/riot-id";

/**
 * 07 마이페이지의 예시 로그인 상태. 실제 라이엇 로그인(RSO)은 백엔드 연결 때 붙인다.
 * 지금은 '동의하고 연결'을 누르면 브라우저에 연동 정보를 저장하고, '연동 해제'로 지운다.
 */
export type MockSession = RiotId & {
  /** 연동한 날짜 (표시용) */
  linkedAt: string;
  /** 선택 동의: 계정 지역 정보 */
  shareRegion: boolean;
};

const SESSION_KEY = "gp:mock-session";

/** 시안(28)의 연동 계정 */
export const DEMO_ACCOUNT = { gameName: "프로브", tagLine: "KR1", linkedAt: "2026.10.07" } as const;

const isSession = (value: unknown): value is MockSession =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as MockSession).gameName === "string" &&
  typeof (value as MockSession).tagLine === "string";

const isSessionOrNull = (value: unknown): value is MockSession | null => value === null || isSession(value);

export function useMockSession() {
  const [session, setSession] = useStoredValue<MockSession | null>(SESSION_KEY, null, isSessionOrNull);
  return {
    session,
    signIn: (shareRegion: boolean) => setSession({ ...DEMO_ACCOUNT, shareRegion }),
    signOut: () => setSession(null),
  };
}

export type Settings = {
  theme: "dark" | "light";
  language: "ko" | "en";
  region: "kr" | "ap" | "na" | "eu";
};

const SETTINGS_KEY = "gp:settings";
const DEFAULT_SETTINGS: Settings = { theme: "dark", language: "ko", region: "kr" };

const isSettings = (value: unknown): value is Settings =>
  typeof value === "object" &&
  value !== null &&
  ["dark", "light"].includes((value as Settings).theme) &&
  ["ko", "en"].includes((value as Settings).language) &&
  ["kr", "ap", "na", "eu"].includes((value as Settings).region);

export function useSettings() {
  const [settings, setSettings] = useStoredValue<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS, isSettings);
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings({ ...settings, [key]: value });
  return [settings, update] as const;
}
