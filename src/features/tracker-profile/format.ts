/** 카드/목록 공통 표시 규칙. null은 미제공이며 0과 구별한다. */
export const number = (value: number | null | undefined, digits = 1) => value == null ? "—" : value.toFixed(digits);
export const signed = (value: number | null | undefined) => value == null ? "—" : `${value > 0 ? "+" : ""}${number(value, 0)}`;
export const percent = (value: number | null | undefined, digits = 1) => value == null ? "—" : `${number(value, digits)}%`;
