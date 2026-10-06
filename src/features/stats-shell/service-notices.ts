import { branding } from "./branding";

/** 2026-09-29 운영자가 공개 표기와 실제 수신을 확인한 문의처. */
export const serviceContact = {
  operator: "ShinJungho",
  email: "game.probe217@gmail.com",
  label: { ko: "서비스·개인정보 문의", en: "Service and privacy contact" },
  notice: {
    ko: "운영자 겸 개인정보 담당자 ShinJungho가 문의를 처리합니다.",
    en: "ShinJungho operates the service and handles privacy inquiries.",
  },
  region: {
    ko: "한국에서 운영하며 초기에는 한국 사용자를 중심으로 한국어·영어를 제공합니다. 무료 예시 데모는 해외에서도 접근할 수 있습니다.",
    en: "Operated from South Korea, initially focused on Korean users with Korean and English support. The free example demo is also accessible from other countries.",
  },
} as const;

// Riot이 제품에 게시하도록 제공한 공식 고지와 한국어 번역. 브랜드명을 바꾸면 고지도 함께 바뀐다.
// 출처: https://developer.riotgames.com/policies/general (Core Policies)
export const riotDisclaimer = {
  ko: `${branding.name}는 Riot Games의 보증을 받지 않으며, Riot Games 또는 Riot Games의 자산을 제작·관리하는 공식 관계자의 견해나 의견을 반영하지 않습니다. Riot Games 및 관련 자산은 Riot Games, Inc.의 상표 또는 등록상표입니다.`,
  en: `${branding.name} isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.`,
} as const;
