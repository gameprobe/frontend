/** 숫자 표시 도우미. */

export function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

export function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR");
}

/**
 * 승률 색. 시안 기준으로 50% 초과는 win 색이고, 그 이하는 화면에 따라 loss 색(맵·역할군)
 * 또는 보조 글자색(같이 게임한 플레이어·최근 요원)을 쓴다.
 */
export function winRateClass(winRate: number, lowTone: "loss" | "sub"): string {
  if (winRate > 50) return "text-win";
  return lowTone === "loss" ? "text-loss" : "text-sub";
}
