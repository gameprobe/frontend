// Standalone local QA harness. Uses real map components, no API or credentials.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { SmokePointMap } from "/src/features/smokes/SmokePointMap";
import { MapEditor } from "/src/features/admin/MapEditor";
import { createEmpty } from "/src/features/admin/model";
import "/src/styles/index.css";

export function Harness() {
  const [mapId, setMapId] = useState("icebox");
  const [point, setPoint] = useState({ x: 0.25, y: 0.75 });
  const [entry, setEntry] = useState(() => ({ ...createEmpty("lineup"), mapId: "icebox", start: { x: 128, y: 384 }, destination: { id: "qa", name: "QA", point: { x: 320, y: 160 } }, path: [{ x: 240, y: 300 }, { x: 280, y: 220 }] }));
  return <main className="mx-auto max-w-[1280px] space-y-5 p-6">
    <h1 className="text-24 font-semibold">미니맵 좌표 검증 · API 요청 없음</h1>
    <label>검증 맵 <select aria-label="검증 맵" className="bg-surface p-2" value={mapId} onChange={(event) => { setMapId(event.target.value); setEntry({ ...entry, mapId: event.target.value }); }}>
      {["ascent", "bind", "breeze", "fracture", "haven", "icebox", "lotus", "pearl", "split", "sunset"].map((map) => <option key={map}>{map}</option>)}
    </select></label>
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-label="스모크 편집 검증" className="rounded-xl bg-surface p-4">
        <h2>정규화 좌표 편집</h2>
        <output data-testid="smoke-coordinate">{JSON.stringify(point)}</output>
        <SmokePointMap key={mapId} mapId={mapId} value={point} onChange={setPoint} />
      </section>
      <section aria-label="라인업 편집 검증">
        <button type="button" className="m-2 rounded bg-primary p-2" onClick={() => setEntry({ ...entry, side: entry.side === "attack" ? "defense" : "attack" })}>라인업 진영 전환</button>
        <output data-testid="lineup-coordinate">{JSON.stringify({ start: entry.start, destination: entry.destination.point, path: entry.path, side: entry.side })}</output>
        <MapEditor key={`${mapId}:${entry.side}`} entry={entry} mapName={mapId} onChange={setEntry} errors={{}} />
      </section>
    </div>
  </main>;
}
createRoot(document.getElementById("root")!).render(<Harness />);
