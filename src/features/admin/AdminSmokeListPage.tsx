import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { TextField } from "@/components/ui/TextField";
import { CATALOG_MAPS } from "@/data/game-catalog";
import { StatusBadge } from "./StatusBadge";
import { useAdminMode } from "./admin-session";
import { loadAdminSmokes, useAdminSmokes, useDemoSmokes } from "./admin-smoke-store";
import type { SmokeSide, SmokeStatus } from "@/features/smokes/smoke-model";

const MAP_OPTIONS = [{ value: "all", label: "모든 맵" }, ...CATALOG_MAPS.map((map) => ({ value: map.key, label: map.ko }))];
const SIDE_OPTIONS = [{ value: "all", label: "모든 진영" }, { value: "attack", label: "공격" }, { value: "defense", label: "수비" }, { value: "unspecified", label: "미지정" }] as const;
const STATUS_OPTIONS = [{ value: "all", label: "모든 상태" }, { value: "active", label: "활성" }, { value: "inactive", label: "비활성" }] as const;

export function AdminSmokeListPage() {
  const mode = useAdminMode();
  const real = useAdminSmokes();
  const demo = useDemoSmokes();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [mapId, setMapId] = useState("all");
  const [side, setSide] = useState<"all" | "unspecified" | SmokeSide>("all");
  const [status, setStatus] = useState<"all" | SmokeStatus>("all");
  const entries = mode === "real" ? real.entries : demo;
  const keyword = query.trim().toLocaleLowerCase();
  const filtered = entries.filter((entry) =>
    (mapId === "all" || entry.mapId === mapId) &&
    (side === "all" || (side === "unspecified" ? !entry.side : entry.side === side)) &&
    (status === "all" || entry.status === status) &&
    (!keyword || `${entry.title} ${entry.notes}`.toLocaleLowerCase().includes(keyword)),
  );
  const waiting = mode === "real" && (!real.loaded || real.loading || Boolean(real.error));

  return <div className="flex flex-col gap-5">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-24 font-bold">스모크 관리</h2>
        <p className="text-14 text-sub">진영, 위치 한 점과 설명을 등록하세요. 활성 자료만 공개 지도에 표시됩니다.</p>
      </div>
      <ButtonLink to="/admin/smokes/new">+ 새 스모크 등록</ButtonLink>
    </div>
    {(location.state as { deleted?: boolean } | null)?.deleted && <p role="status" className="text-14 text-win">스모크를 삭제했습니다.</p>}
    {mode === "real" && <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-14 text-sub">{real.loading ? "스모크를 불러오는 중…" : "DB에 저장된 스모크 목록입니다."}</p>
        <Button size="md" variant="secondary" disabled={real.loading} onClick={() => void loadAdminSmokes()}>목록 새로고침</Button>
      </div>
      {real.error && <p role="alert" className="text-14 text-loss">{real.error} 목록 새로고침으로 다시 시도해 주세요.</p>}
    </div>}
    <Card as="section" aria-label="스모크 목록" className="flex flex-col">
      <div className="grid gap-4 border-b border-line p-5 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_140px_140px_140px]">
        <TextField label="스모크 검색" type="search" placeholder="제목 또는 설명 검색" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="flex flex-col gap-2"><span className="text-14 text-sub">맵 필터</span><Dropdown label="맵 필터" appearance="field" options={MAP_OPTIONS} value={mapId} onChange={setMapId} /></div>
        <div className="flex flex-col gap-2"><span className="text-14 text-sub">진영 필터</span><Dropdown label="진영 필터" appearance="field" options={SIDE_OPTIONS} value={side} onChange={setSide} /></div>
        <div className="flex flex-col gap-2"><span className="text-14 text-sub">목록 상태 필터</span><Dropdown label="목록 상태 필터" appearance="field" options={STATUS_OPTIONS} value={status} onChange={setStatus} /></div>
      </div>
      {!waiting && <div className="flex flex-col gap-3 p-5">
        <p className="text-13 text-sub">검색 결과 {filtered.length}개 / 전체 {entries.length}개</p>
        {filtered.length === 0 && <p className="py-10 text-center text-15 text-sub">{entries.length === 0 ? "등록된 스모크가 없습니다. 새 스모크를 등록해 보세요." : "조건에 맞는 스모크가 없습니다."}</p>}
        <ul className="divide-y divide-line">
          {filtered.map((entry) => <li key={entry.id}>
            <Link to={`/admin/smokes/${encodeURIComponent(entry.id)}`} className="flex items-center gap-3 rounded-lg px-3 py-4 hover:bg-elevated">
              <div className="min-w-0 flex-1">
                <span className="block truncate text-15 font-semibold">{entry.title}</span>
                <span className="text-13 text-sub">{CATALOG_MAPS.find((map) => map.key === entry.mapId)?.ko ?? entry.mapId} · {entry.side === "attack" ? "공격" : entry.side === "defense" ? "수비" : "진영 미지정"} · {new Date(entry.updatedAt).toLocaleDateString("ko-KR")} 수정</span>
              </div>
              <StatusBadge status={entry.status} />
              <span className="hidden text-14 text-sub sm:inline">편집 →</span>
            </Link>
          </li>)}
        </ul>
      </div>}
    </Card>
  </div>;
}
