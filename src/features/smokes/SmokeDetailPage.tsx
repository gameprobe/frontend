import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { MinimapSide } from "@/data/minimap-layout";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SmokePointMap } from "@/features/smokes/SmokePointMap";
import { createSmokeApi, SmokeApiError, smokeErrorMessage } from "@/features/smokes/smoke-api";
import type { PublicSmoke } from "@/features/smokes/smoke-model";
import { findLineupMap, type LineupMap } from "@/mocks/lineups";
import { NotFoundPage } from "@/pages/NotFoundPage";

const smokeApi = createSmokeApi(import.meta.env.VITE_BACKEND_URL);
type DetailState = { status: "loading" } | { status: "missing" } | { status: "error"; message: string } | { status: "ready"; smoke: PublicSmoke };

/** 새로고침과 직접 주소 접근에서도 서버에 공개된 한 건을 다시 읽는다. */
export function SmokeDetailPage() {
  const { mapId, smokeId = "" } = useParams();
  const map = findLineupMap(mapId);
  if (!map) return <NotFoundPage />;
  return <SmokeDetail key={`${map.mapId}:${smokeId}`} map={map} smokeId={smokeId} />;
}

function SmokeDetail({ map, smokeId }: { map: LineupMap; smokeId: string }) {
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const savedSide = state.status === "ready" ? state.smoke.side : null;
  // 이전 상세 링크의 side는 지도 방향으로 사용했으므로 계속 읽을 수 있게 한다.
  const view = params.get("view") ?? params.get("side");
  const side: MinimapSide = view === "attack" || view === "defense" ? view : savedSide ?? "attack";
  const setSide = (nextSide: MinimapSide) => {
    const next = new URLSearchParams(params);
    next.set("view", nextSide);
    setParams(next, { replace: true });
  };
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    void smokeApi.getPublic(smokeId, controller.signal).then((smoke) => {
      if (controller.signal.aborted) return;
      setState(smoke.mapId === map.mapId ? { status: "ready", smoke } : { status: "missing" });
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      if (error instanceof SmokeApiError && error.status === 404) setState({ status: "missing" });
      else setState({ status: "error", message: smokeErrorMessage(error) });
    });
    return () => controller.abort();
  }, [map.mapId, smokeId, reload]);

  return (
    <div className="container-page flex flex-col gap-6 pt-8 pb-12">
      <div><ButtonLink to={`/smokes/${map.mapId}?smoke=${encodeURIComponent(smokeId)}&side=${savedSide ?? "attack"}&view=${side}`} variant="secondary">← {map.name} 스모크 목록</ButtonLink></div>
      {state.status === "loading" && <Card className="p-8"><p role="status" className="text-14 text-sub">스모크를 불러오는 중이에요.</p></Card>}
      {state.status === "missing" && <Card className="space-y-2 p-8"><h1 className="text-20 font-semibold">공개된 스모크를 찾을 수 없어요.</h1><p className="text-14 text-sub">삭제되었거나 현재 공개되지 않은 자료예요. 목록에서 다른 위치를 확인해 주세요.</p></Card>}
      {state.status === "error" && <Card className="flex flex-col items-start gap-4 p-6"><p role="alert" className="text-14 text-loss">{state.message}</p><Button variant="secondary" onClick={() => setReload((value) => value + 1)}>다시 시도</Button></Card>}
      {state.status === "ready" && (
        <>
          <Card as="header" className="min-w-0 space-y-2 p-5 sm:p-7">
            <p className="text-13 font-medium text-primary">{map.name} · {savedSide === "attack" ? "공격" : savedSide === "defense" ? "수비" : "진영 미지정"} 스모크</p>
            {!savedSide && <p className="text-13 text-sub">아직 진영이 지정되지 않은 기존 자료입니다.</p>}
            <h1 className="text-24 leading-[1.5] font-semibold break-words">{state.smoke.title}</h1>
          </Card>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Card as="section" className="min-w-0 p-4 sm:p-6" aria-label="스모크 설치 위치">
              <h2 className="text-18 font-semibold">설치 위치</h2>
              <SmokePointMap mapId={map.mapId} side={side} onSideChange={setSide} points={[state.smoke]} selectedId={state.smoke.id} />
            </Card>
            <Card as="section" className="min-w-0 space-y-4 p-5 sm:p-6" aria-label="스모크 설명">
              <h2 className="text-18 font-semibold">설치 안내</h2>
              <p className="text-14 leading-[1.8] whitespace-pre-wrap break-words text-sub">{state.smoke.notes || "등록된 설명이 없어요."}</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
