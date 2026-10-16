/** 스모크는 맵 위의 한 지점만 저장한다. 좌표는 화면 크기와 무관한 0~1 값이다. */
export type SmokePoint = { x: number; y: number };
export type SmokeStatus = "active" | "inactive";
export type SmokePayload = {
  title: string;
  mapId: string;
  destination: SmokePoint;
  notes: string;
  status: SmokeStatus;
};
export type SmokeRecord = SmokePayload & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
export type PublicSmoke = Omit<SmokeRecord, "status">;
export type SmokePage<T> = { items: T[]; total: number; limit: number; offset: number };

/** 응답의 ID·시각이나 이전 폼의 필드가 저장 요청에 섞이지 않도록 다섯 항목만 선택한다. */
export function toSmokePayload(value: SmokePayload): SmokePayload {
  const { x, y } = value.destination;
  if (![x, y].every((coordinate) => Number.isFinite(coordinate) && coordinate >= 0 && coordinate <= 1)) {
    throw new Error("맵 안에 연막 위치를 지정해 주세요.");
  }
  if (!["active", "inactive"].includes(value.status)) {
    throw new Error("공개 상태를 활성 또는 비활성으로 선택해 주세요.");
  }
  return {
    title: value.title.trim(),
    mapId: value.mapId,
    destination: { x, y },
    notes: value.notes,
    status: value.status,
  };
}
