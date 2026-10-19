import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { MinimapSide } from "@/data/minimap-layout";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Card } from "@/components/ui/Card";
import { SmokePointMap } from "@/features/smokes/SmokePointMap";
import { createSmokeApi, smokeErrorMessage } from "@/features/smokes/smoke-api";
import type { PublicSmoke, SmokeSide } from "@/features/smokes/smoke-model";
import { cx } from "@/lib/cx";
import { findLineupMap, type LineupMap } from "@/mocks/lineups";
import { NotFoundPage } from "@/pages/NotFoundPage";

const smokeApi = createSmokeApi(import.meta.env.VITE_BACKEND_URL);
type ListState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; items: PublicSmoke[] };

export function SmokeGuidePage() {
  const { mapId } = useParams();
  const [params] = useSearchParams();
  const side: SmokeSide = params.get("side") === "defense" ? "defense" : "attack";
  const map = findLineupMap(mapId);
  if (!map) return <NotFoundPage />;
  return <SmokeBoard key={`${map.mapId}:${side}`} map={map} side={side} />;
}

function SmokeBoard({ map, side }: { map: LineupMap; side: SmokeSide }) {
  const [state, setState] = useState<ListState>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    async function load() {
      try {
        const records = new Map<string, PublicSmoke>();
        let offset = 0;
        let total = 0;
        // 한 맵에 100개 이상 있어도 다음 페이지를 이어 읽어 지도에서 빠지지 않게 한다.
        do {
          const page = await smokeApi.listPublic(map.mapId, side, offset, controller.signal);
          if (controller.signal.aborted) return;
          for (const item of page.items) records.set(item.id, item);
          total = page.total;
          if (page.items.length === 0 && offset < total) throw new Error("스모크 목록을 끝까지 불러오지 못했어요. 다시 시도해 주세요.");
          offset += page.items.length;
        } while (offset < total);
        setState({ status: "ready", items: [...records.values()] });
      } catch (error) {
        if (!controller.signal.aborted) setState({ status: "error", message: smokeErrorMessage(error) });
      }
    }

    void load();
    return () => controller.abort();
  }, [map.mapId, side, reload]);

  const items = state.status === "ready" ? state.items : [];
  const selected = items.find((item) => item.id === params.get("smoke"));
  const view = params.get("view");
  const mapSide: MinimapSide = view === "attack" || view === "defense" ? view : side;
  function setSide(nextSide: SmokeSide) {
    const next = new URLSearchParams(params);
    if (nextSide === "defense") next.set("side", "defense");
    else next.delete("side");
    next.delete("smoke");
    next.delete("view");
    setParams(next, { replace: true });
  }
  function setMapSide(nextSide: MinimapSide) {
    const next = new URLSearchParams(params);
    next.set("view", nextSide);
    setParams(next, { replace: true });
  }
  function select(id: string) {
    const next = new URLSearchParams(params);
    if (id !== selected?.id) next.set("smoke", id);
    else next.delete("smoke");
    setParams(next);
  }

  return (
    <div className="container-page flex flex-col gap-6 pt-8 pb-12">
      <Card as="section" className="flex flex-wrap items-center justify-between gap-5 p-5 sm:p-7">
        <div className="min-w-0 space-y-2">
          <p lang="en" className="text-12 font-semibold tracking-[1.44px] text-primary">GAMEPROBE SMOKE LIBRARY</p>
          <h1 className="text-28 font-semibold tracking-normal">{map.name} · {side === "attack" ? "공격" : "수비"} 스모크</h1>
          <p className="text-14 leading-[1.6] text-sub">지도나 목록에서 위치를 고르면 설치 위치와 설명을 확인할 수 있어요.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl label="스모크 진영" options={[{ value: "attack", label: "공격" }, { value: "defense", label: "수비" }]} value={side} onChange={setSide} />
          <ButtonLink to={`/smokes?side=${side}`} variant="secondary">맵 변경</ButtonLink>
        </div>
      </Card>

      {state.status === "loading" && <Card className="p-8"><p role="status" className="text-14 text-sub">스모크를 불러오는 중이에요.</p></Card>}
      {state.status === "error" && (
        <Card className="flex flex-col items-start gap-4 p-6">
          <p role="alert" className="text-14 text-loss">{state.message}</p>
          <Button variant="secondary" onClick={() => setReload((value) => value + 1)}>다시 시도</Button>
        </Card>
      )}
      {state.status === "ready" && (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card as="section" aria-label="스모크 지도" className="min-w-0 p-4 sm:p-6">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-18 font-semibold">설치 위치</h2>
              <span className="text-13 text-sub">스모크 {items.length}개</span>
            </div>
            <SmokePointMap mapId={map.mapId} side={mapSide} onSideChange={setMapSide} points={items} selectedId={selected?.id} onSelect={select} />
            {selected ? (
              <section aria-label="선택한 스모크" className="mt-5 space-y-3 rounded-thumb border border-primary/40 bg-primary-soft p-5">
                <h3 className="text-18 font-semibold break-words">{selected.title}</h3>
                <p className="text-14 leading-[1.7] whitespace-pre-wrap break-words text-sub">{selected.notes || "등록된 설명이 없어요."}</p>
                <ButtonLink to={`/smokes/${map.mapId}/${encodeURIComponent(selected.id)}?view=${mapSide}`} size="md" variant="secondary">상세 보기</ButtonLink>
              </section>
            ) : <p className="mt-5 rounded-lg bg-page px-4 py-3 text-13 leading-[1.6] text-sub">{items.length ? "지도에서 번호를 선택하세요. 위치가 겹치면 스모크 목록에서 선택할 수 있어요." : `${side === "attack" ? "공격" : "수비"} 진영에 공개된 스모크가 아직 없어요.`}</p>}
          </Card>
          <Card as="section" aria-labelledby="smoke-list-title" className="flex min-w-0 flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="smoke-list-title" className="text-18 font-semibold">스모크 목록</h2>
              <button type="button" className="min-h-10 text-13 text-primary" onClick={() => setReload((value) => value + 1)}>새로고침</button>
            </div>
            {items.length === 0 ? <p className="text-14 leading-[1.6] text-sub">선택한 진영의 스모크가 활성화되면 여기에 표시돼요.</p> : (
              <ol className="flex flex-col gap-2">
                {items.map((smoke, index) => (
                  <li key={smoke.id}>
                    <button
                      type="button"
                      aria-pressed={selected?.id === smoke.id}
                      onClick={() => select(smoke.id)}
                      className={cx("flex w-full items-start gap-3 rounded-lg border p-3 text-left", selected?.id === smoke.id ? "border-primary bg-primary-soft" : "border-transparent hover:bg-elevated")}
                    >
                      <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-elevated text-13 font-semibold text-primary">{index + 1}</span>
                      <span className="min-w-0 break-words text-14 leading-7 font-medium">{smoke.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
