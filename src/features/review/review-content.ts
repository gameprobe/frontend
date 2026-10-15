import { useSearchParams } from "react-router-dom";

export type ReviewLanguage = "ko" | "en";
export const CONTACT_EMAIL = "game.probe217@gmail.com";
export const DEMO_PROFILE_PATH = "/players/" + encodeURIComponent("프로브#KR1");
export const DEMO_MATCH_PATH = "/matches/demo-match-001";
export const reviewLink = (path: string, language: ReviewLanguage) => `${path}?lang=${language}`;

export function useReviewLanguage() {
  const [params, setParams] = useSearchParams();
  const language: ReviewLanguage = params.get("lang") === "en" ? "en" : "ko";
  const setLanguage = (next: ReviewLanguage) => {
    const copy = new URLSearchParams(params);
    copy.set("lang", next);
    setParams(copy, { replace: true });
  };
  return [language, setLanguage] as const;
}
