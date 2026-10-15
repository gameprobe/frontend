import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { TextField } from "@/components/ui/TextField";
import { StatusBadge } from "@/features/admin/StatusBadge";
import { loadAdminLineups, useAdminLineups } from "./admin-lineup-store";
import { useAdminMode } from "./admin-session";
import { useGuideEntries } from "@/features/admin/guide-store";
import { groupDestinations, KIND_LABEL, KIND_PATH, STATUS_LABEL, type GuideKind, type GuideStatus } from "@/features/admin/model";
import { agentAbilities, agentName, mapName } from "@/data/game-names";
import { agentIconPath } from "@/lib/assets";

const STATUS_OPTIONS: { value: "all" | GuideStatus; label: string }[] = [
  { value: "all", label: "모든 상태" },
  ...(Object.keys(STATUS_LABEL) as GuideStatus[]).map((status) => ({ value: status, label: STATUS_LABEL[status] })),
];

/** /admin/lineups · /admin/smokes: 같은 도착점의 공략을 묶어 보여준다. */
export function AdminListPage({ kind }: { kind: GuideKind }) {
  const demoEntries = useGuideEntries();
  const real = useAdminLineups();
  const mode = useAdminMode();
  const entries = mode === "real" ? real.entries : demoEntries;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | GuideStatus>("all");
  const base = `/admin/${KIND_PATH[kind]}`;

  const ofKind = entries.filter((entry) => entry.kind === kind);
  const keyword = query.trim().toLowerCase();
  const filtered = ofKind.filter((entry) => {
    if (status !== "all" && entry.status !== status) return false;
    if (!keyword) return true;
    const haystack = [mapName(entry.mapId), entry.mapId, entry.destination.name, entry.title, agentName(entry.agentId), entry.agentId];
    return haystack.some((text) => text.toLowerCase().includes(keyword));
  });
  const groups = groupDestinations(filtered, kind);

  if (mode === "real" && kind === "smoke") return <Card className="p-6">스모크 관리는 준비 중입니다.</Card>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-24 font-bold">{KIND_LABEL[kind]} 관리</h2>
          <p className="text-14 text-sub">같은 도착점의 공략을 모았습니다. 공략을 고르면 편집할 수 있습니다.</p>
        </div>
        <ButtonLink to={`${base}/new`}>+ 새 {KIND_LABEL[kind]} 등록</ButtonLink>
      </div>

      {mode === "real" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p role="status" className="text-14 text-sub">{real.loading ? "DB에서 라인업을 불러오는 중…" : "DB에 저장된 라인업 목록입니다."}</p>
            <Button size="md" variant="secondary" disabled={real.loading} onClick={() => void loadAdminLineups()}>목록 새로고침</Button>
          </div>
          {real.error && <p role="alert" className="text-14 text-loss">{real.error} 위의 목록 새로고침으로 다시 시도해 주세요.</p>}
          {real.unsupportedCount > 0 && <p className="text-13 text-caution">이전 형식의 자료 {real.unsupportedCount}개는 목록에서 제외했습니다. 기존 자료는 변경하지 않습니다.</p>}
        </div>
      )}
      <Card as="section" aria-label={`${KIND_LABEL[kind]} 목록`} className="flex flex-col">
        <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-end">
          <TextField
            label="자료 검색"
            type="search"
            placeholder="맵, 도착점, 제목, 요원 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="flex-1"
          />
          <div className="flex flex-col gap-2 sm:w-44">
            <span className="text-14 font-medium text-sub">목록 상태 필터</span>
            <Dropdown label="목록 상태 필터" appearance="field" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex justify-between text-13 text-sub">
            <span>
              검색 결과 {filtered.length}개 / 전체 {ofKind.length}개
            </span>
            <span>도착점 {groups.length}개</span>
          </div>

          {groups.length === 0 && !(mode === "real" && (real.loading || real.error)) && <p className="py-10 text-center text-15 text-sub">조건에 맞는 공략이 없습니다.</p>}

          {groups.map((group) => (
            <section key={`${group.mapId}-${group.destination.id}`} className="overflow-hidden rounded-thumb border border-line">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-elevated px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-13 text-sub">{mapName(group.mapId)} · 도착점</span>
                  <h3 className="text-15 font-semibold">{group.destination.name || "이름 없는 도착점"}</h3>
                </div>
                <div className="flex items-center gap-4 text-13 text-sub">
                  <span>공략 {group.entries.length}개</span>
                  <Link to={`${base}/new?destination=${encodeURIComponent(group.destination.id)}&map=${encodeURIComponent(group.mapId)}`} className="font-medium text-primary hover:underline">
                    + 공략 추가
                  </Link>
                </div>
              </div>
              <ul className="divide-y divide-line">
                {group.entries.map((entry) => {
                  const ability = agentAbilities(entry.agentId).find((item) => item.key === entry.abilitySlot);
                  return (
                    <li key={entry.id}>
                      <Link
                        to={`${base}/${entry.id}`}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-elevated/60"
                      >
                        <img src={agentIconPath(entry.agentId)} alt="" className="size-10 shrink-0 rounded-lg bg-elevated object-cover" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-15 font-semibold">{entry.title}</span>
                          <span className="truncate text-13 text-sub">
                            {agentName(entry.agentId)} · {entry.abilitySlot} {ability?.ko}
                            {entry.path.length > 0 && ` · 경로 ${entry.path.length}`}
                          </span>
                        </div>
                        <StatusBadge status={entry.status} />
                        <span className="hidden text-14 font-medium text-sub sm:inline">편집 →</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </Card>
    </div>
  );
}
