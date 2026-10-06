/** 홈·프로필의 표시용 브랜드 설정. Mock 통계나 브라우저 저장 키와는 독립적이다. */
export interface BrandConfig {
  /** 홈·프로필 상단/하단 서비스명, 홈 소개 문구, 프로필 툴팁·경기 상세 안내. */
  readonly name: string;
  /** 홈·프로필 상단 문자 로고와 프로필 프로모션의 문자 로고. */
  readonly logoText: string;
  /** 프로필 종합 점수 카드의 제목·접근성 이름, 경기 상세 지표·안내 문구. */
  readonly scoreName: string;
  /** 프로필 경기 목록에서 각 경기 점수 위에 표시하는 약칭. */
  readonly scoreAbbreviation: string;
}

// 사용 화면: home/HomeLanding.tsx, tracker-profile/TrackerProfile.tsx.
// 해당 화면의 소개·접근성·상세 설명에 들어가는 브랜드 이름도 이 값을 사용한다.
// 브라우저 저장 키의 gameprobe:는 기존 저장 데이터를 유지하기 위해 바꾸지 않는다.
export const branding: BrandConfig = {
  name: "GameProbe",
  logoText: "GP",
  scoreName: "Probe Score",
  scoreAbbreviation: "PS",
};
