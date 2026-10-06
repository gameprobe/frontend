/** 홈·프로필·보조 페이지가 함께 쓰는 안내 문구. 메뉴/통계 이름과 데이터 값은 각 화면에 유지한다. */
export const statsCopy = {
  // StatsHeader, HomeLanding, ProfileHeader, TrackerProfile의 데모 표시.
  demoPreview: "데모 미리보기",
  liveDataNotice: "현재 전적은 예시 데이터입니다. 실제 Riot 전적은 연결되지 않았습니다.",
  // HomeLanding/HomeSearch와 프로필 검색 피드백. 입력값으로 실제 계정을 조회하지 않는다.
  searchUnavailable: "실제 Riot ID 검색은 아직 제공하지 않습니다.",
  // 홈·프로필·SupportPage의 StatsFooter에서 같은 비제휴/예시 데이터 안내를 사용한다.
  footerNotice: "Tracker Network와 제휴 관계가 없는 독립 서비스입니다. 전적 화면은 예시 데이터를 사용하며 실제 Riot 전적 조회·계정 연결은 아직 제공하지 않습니다.",
  // MissingRecordPage와 경기 직접 화면의 복귀 동작. 목적지는 각 화면이 지정한다.
  returnDemoProfile: "데모 프로필로 돌아가기",
  returnHome: "홈으로 돌아가기",
  // 프로필·시즌 요약·랭크 카드의 미제공 표시. 실제 0과 구별한다.
  unavailable: "미제공",
  // 개인정보처리방침/이용약관의 초안 안내. 기존 법률 검토·승인 조건을 유지한다.
  legalReview: "현재 데모 동작을 기준으로 작성한 초안입니다. 운영자·문의처·문의 메일 파기 기준과 현재 호스팅 설정은 확인했습니다. 외부 서비스의 국외 처리와 삭제 범위를 안내합니다. 세부 처리 국가와 적용 법적 요건 검토는 남아 있어 초안으로 표시합니다.",
} as const;

// 양쪽 언어가 같은 키를 갖도록 검사한다. 게임·통계 명칭과 개별 화면 설명은 사용처에 둔다.
const english: Record<keyof typeof statsCopy, string> = {
  demoPreview: "Demo preview",
  liveDataNotice: "These stats use sample data. Live Riot match history is not connected.",
  searchUnavailable: "Live Riot ID search is not available yet.",
  footerNotice: "An independent service with no affiliation to Tracker Network. Stats use example data; live Riot match lookup and account connection are not available yet.",
  returnDemoProfile: "Back to demo profile",
  returnHome: "Back to home",
  unavailable: "Not provided",
  legalReview: "This draft describes the current demo. The operator, contact channel, inquiry deletion policy and current hosting settings are confirmed. Overseas processing and deletion limits are described below. Detailed processing locations and applicable legal requirements remain under review, so this document is marked as a draft.",
};

export const statsCopies = { ko: statsCopy, en: english };
