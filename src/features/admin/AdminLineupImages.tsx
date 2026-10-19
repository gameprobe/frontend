import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { lineupImageFileError } from "./admin-lineup-api";
import { adminErrorMessage, fetchAdminLineupImage } from "./admin-lineup-store";
import { useAdminToken } from "./admin-session";
import type { LineupImage, LineupImages, LineupImageSlot } from "./model";

/** undefined는 유지, File은 등록·교체, null은 삭제 예약이다. */
export type LineupImageChanges = Partial<Record<LineupImageSlot, File | null>>;
const IMAGE_SLOTS: { slot: LineupImageSlot; label: string; hint: string }[] = [
  { slot: "position", label: "위치 이미지", hint: "캐릭터가 서 있어야 하는 위치" },
  { slot: "aim", label: "에임 이미지", hint: "조준점을 맞출 곳" },
];

export function AdminLineupImages({ lineupId, images, changes, onChange, realMode }: {
  lineupId: string;
  images: LineupImages;
  changes: LineupImageChanges;
  onChange: (slot: LineupImageSlot, value: File | null | undefined) => void;
  realMode: boolean;
}) {
  return <div className="flex flex-col gap-4">
    <p className="text-13 text-sub">위치·에임 이미지를 각각 한 장씩 추가할 수 있습니다. JPG, PNG, WebP · 한 장당 최대 10 MB.</p>
    {!realMode && <p className="text-13 text-caution">이미지 등록은 관리자 인증 후 사용할 수 있습니다.</p>}
    {IMAGE_SLOTS.map(({ slot, label, hint }) => <ImageSlot key={slot} lineupId={lineupId} slot={slot} label={label} hint={hint}
      image={images[slot]} change={changes[slot]} onChange={(value) => onChange(slot, value)} realMode={realMode} />)}
    {realMode && <p className="text-13 text-sub">선택한 이미지와 삭제는 위의 ‘DB에 저장’을 누르면 반영됩니다.</p>}
  </div>;
}

function ImageSlot({ lineupId, slot, label, hint, image, change, onChange, realMode }: {
  lineupId: string; slot: LineupImageSlot; label: string; hint: string;
  image: LineupImage | null; change: File | null | undefined;
  onChange: (value: File | null | undefined) => void; realMode: boolean;
}) {
  const token = useAdminToken();
  const [preview, setPreview] = useState<{ key: unknown; url: string } | null>(null);
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const previewKey = change ?? image?.id;
  // 관리자 이미지는 토큰 헤더로 가져온 뒤 임시 URL로 표시한다. URL에 토큰을 넣지 않는다.
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    let active = true;
    async function load() {
      setError("");
      setPreview(null);
      if (change === null || (!change && !image)) return;
      try {
        const blob = change ?? (realMode && token && lineupId
          ? await fetchAdminLineupImage(lineupId, slot, controller.signal) : null);
        if (!active || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setPreview({ key: previewKey, url: objectUrl });
      } catch (reason) {
        if (active && !controller.signal.aborted) setError(adminErrorMessage(reason));
      }
    }
    void load();
    return () => { active = false; controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [lineupId, slot, image, change, previewKey, realMode, token, attempt]);

  const url = change !== null && preview && preview.key === previewKey ? preview.url : undefined;
  return <section aria-label={label} className="flex min-w-0 flex-col gap-3 rounded-lg border border-line p-4">
    <div><h4 className="text-15 font-semibold">{label}</h4><p className="text-13 text-sub">{hint}</p></div>
    <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-elevated">
      {url ? <img src={url} alt={`${label} 미리보기`} className="size-full object-contain" />
        : <p className="px-3 text-center text-13 text-sub">{change === null ? "저장하면 이미지가 삭제됩니다." : error ? "이미지를 표시할 수 없습니다." : image || change ? "이미지 불러오는 중…" : "등록된 이미지가 없습니다."}</p>}
    </div>
    {error && <div className="flex flex-col items-start gap-2"><p role="alert" className="text-13 text-loss">{error}</p><Button size="md" variant="secondary" onClick={() => setAttempt((value) => value + 1)}>이미지 다시 불러오기</Button></div>}
    <label className="flex min-w-0 flex-col gap-2 text-13 text-sub">
      <span>{label} {image ? "교체" : "선택"}</span>
      <input type="file" aria-label={label} accept="image/jpeg,image/png,image/webp" disabled={!realMode}
        className="w-full min-w-0 text-13 file:mr-2 file:rounded-md file:border-0 file:bg-elevated file:px-3 file:py-2 file:text-main"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          const message = lineupImageFileError(file);
          setFileError(message);
          if (!message) onChange(file);
        }} />
    </label>
    {fileError && <p role="alert" className="text-13 text-loss">{fileError}</p>}
    {change instanceof File && <p className="break-all text-13 text-sub">저장 대기: {change.name} · {(change.size / 1_000_000).toFixed(2)} MB</p>}
    <div className="flex flex-wrap gap-2">
      {realMode && image && change !== null && <Button size="md" variant="secondary" onClick={() => { setFileError(""); onChange(null); }}>이미지 삭제</Button>}
      {change !== undefined && <Button size="md" variant="secondary" onClick={() => { setFileError(""); onChange(undefined); }}>변경 취소</Button>}
    </div>
  </section>;
}
