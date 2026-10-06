export type MatchDetailPresentation = "modal" | "inline";

// M04 경기 상세의 여는 방식. 팀 논의 후 이 한 곳을 "inline"으로 바꾸면
// 기존 목록 아래 펼침을 다시 사용한다.
// 상세 공급 데이터는 공유하며 인라인 4탭과 모달 5탭의 표시 구성은 별도로 유지한다.
export const matchDetailPresentation: MatchDetailPresentation = "modal";
