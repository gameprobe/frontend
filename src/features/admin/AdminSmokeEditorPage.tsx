import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useBlocker, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { TextAreaField, TextField } from "@/components/ui/TextField";
import { CATALOG_MAPS } from "@/data/game-catalog";
import { SmokePointMap } from "@/features/smokes/SmokePointMap";
import { smokeErrorMessage } from "@/features/smokes/smoke-api";
import type { SmokePayload, SmokeRecord, SmokeSide } from "@/features/smokes/smoke-model";
import { useAdminMode, useAdminToken } from "./admin-session";
import { deleteAdminSmoke, deleteDemoSmoke, fetchAdminSmoke, saveAdminSmoke, saveDemoSmoke, useDemoSmokes } from "./admin-smoke-store";

const MAP_OPTIONS = CATALOG_MAPS.map((map) => ({ value: map.key, label: map.ko }));
const SIDE_OPTIONS = [{ value: "attack", label: "공격" }, { value: "defense", label: "수비" }] as const;
const STATUS_OPTIONS = [{ value: "inactive", label: "비활성" }, { value: "active", label: "활성" }] as const;
type Draft = Omit<SmokePayload, "destination" | "side"> & { destination: SmokePayload["destination"] | null; side: SmokeSide | "" };

export function AdminSmokeEditorPage() {
  const { id } = useParams();
  const location = useLocation();
  const mode = useAdminMode();
  // 주소가 바뀌면 이전 자료의 편집 상태가 다음 자료에 남지 않도록 한다.
  return <SmokeEditorLoader key={`${mode}-${id ?? "new"}-${location.key}`} id={id} realMode={mode === "real"} />;
}

function SmokeEditorLoader({ id, realMode }: { id?: string; realMode: boolean }) {
  const token = useAdminToken();
  const demo = useDemoSmokes();
  const [record, setRecord] = useState<SmokeRecord | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!realMode || !id || !token || record) return;
    let current = true;
    fetchAdminSmoke(id).then((saved) => { if (current) setRecord(saved); })
      .catch((reason: unknown) => { if (current) setError(smokeErrorMessage(reason)); });
    return () => { current = false; };
  }, [realMode, id, token, record, attempt]);
  const initial = realMode ? record : demo.find((item) => item.id === id);
  if (error || (id && !realMode && !initial)) return <Card className="flex flex-col items-start gap-4 p-6">
    <p role="alert">{error || "이 체험 자료를 찾을 수 없습니다. 새로고침하면 체험 자료가 초기화됩니다."}</p>
    {realMode && <Button onClick={() => { setError(""); setAttempt((value) => value + 1); }}>다시 불러오기</Button>}
    <ButtonLink to="/admin/smokes" variant="secondary">목록으로</ButtonLink>
  </Card>;
  if (id && !initial) return <Card className="p-6"><p role="status">스모크를 불러오는 중…</p></Card>;
  return <SmokeEditor initial={initial ?? undefined} realMode={realMode} />;
}

function SmokeEditor({ initial, realMode }: { initial?: SmokeRecord; realMode: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [draft, setDraft] = useState<Draft>(() => initial ? { ...initial, side: initial.side ?? "" } : { title: "", mapId: MAP_OPTIONS[0].value, side: "attack", destination: null, notes: "", status: "inactive" });
  const original = useRef(draft);
  const dirty = JSON.stringify(draft) !== JSON.stringify(original.current);
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const mounted = useRef(true);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const allowNavigation = useRef(false);
  const blocker = useBlocker(() => dirty && !allowNavigation.current);
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm("저장하지 않은 내용을 버리고 이동할까요?")) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  const knownMap = MAP_OPTIONS.some((map) => map.value === draft.mapId);
  const titleError = attempted && !draft.title.trim() ? "제목을 입력해 주세요." : undefined;
  const sideError = attempted && !draft.side ? "공격 또는 수비를 선택해 주세요." : undefined;
  const pointError = attempted && !draft.destination ? "지도에서 스모크 위치를 한 번 눌러 주세요." : undefined;
  const update = (changes: Partial<Draft>) => setDraft((previous) => ({ ...previous, ...changes }));

  async function save(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    setAttempted(true);
    if (!draft.title.trim() || !draft.destination || !draft.side || !knownMap) return;
    // 편집용 상태와 서버 응답 필드를 제외하고 쓰기 계약의 여섯 필드만 보낸다.
    const payload: SmokePayload = { title: draft.title.trim(), mapId: draft.mapId, side: draft.side, destination: draft.destination, notes: draft.notes, status: draft.status };
    submitting.current = true; setPending(true); setError("");
    try {
      const saved = realMode ? await saveAdminSmoke(payload, initial?.id) : saveDemoSmoke(payload, initial?.id);
      if (!mounted.current) return;
      allowNavigation.current = true;
      navigate(`/admin/smokes/${encodeURIComponent(saved.id)}`, { replace: true, state: { saved: true } });
    } catch (reason) {
      if (mounted.current) setError(smokeErrorMessage(reason));
    } finally {
      submitting.current = false;
      if (mounted.current) setPending(false);
    }
  }
  async function remove() {
    if (!initial || submitting.current) return;
    if (!window.confirm(`“${initial.title}” 스모크를 삭제할까요? 삭제하면 되돌릴 수 없습니다.`)) return;
    submitting.current = true; setPending(true); setError("");
    try {
      if (realMode) await deleteAdminSmoke(initial.id);
      else deleteDemoSmoke(initial.id);
      if (mounted.current) {
        allowNavigation.current = true;
        navigate("/admin/smokes", { replace: true, state: { deleted: true } });
      }
    } catch (reason) {
      if (mounted.current) setError(smokeErrorMessage(reason));
    } finally {
      submitting.current = false;
      if (mounted.current) setPending(false);
    }
  }

  return <form onSubmit={save} className="flex flex-col gap-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <ButtonLink to="/admin/smokes" size="md" variant="secondary">← 목록으로</ButtonLink>
      <h2 className="text-24 font-bold">{initial ? "스모크 편집" : "새 스모크 등록"}</h2>
    </div>
    {(location.state as { saved?: boolean } | null)?.saved && !dirty && <p role="status" className="text-14 text-win">{realMode ? "스모크를 저장했습니다." : "이 탭의 체험 목록에 저장했습니다."}</p>}
    <fieldset disabled={pending} className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card as="section" className="flex min-w-0 flex-col gap-5 p-5 md:p-6">
        <h3 className="text-20 font-semibold">기본 정보</h3>
        <TextField label="스모크 제목 *" value={draft.title} maxLength={120} onChange={(event) => update({ title: event.target.value })} error={titleError} placeholder="예: A 사이트 천국 시야 차단" />
        <div className="flex flex-col gap-2">
          <span className="text-14 font-medium text-sub">맵 *</span>
          <Dropdown label="스모크 맵" appearance="field" options={knownMap ? MAP_OPTIONS : [...MAP_OPTIONS, { value: draft.mapId, label: draft.mapId }]}
            value={draft.mapId} onChange={(mapId) => {
              if (mapId === draft.mapId) return;
              if (draft.destination && !window.confirm("맵을 변경하면 지정한 위치가 초기화됩니다. 변경할까요?")) return;
              update({ mapId, destination: null });
            }} />
          {!knownMap && <p role="alert" className="text-13 text-loss">지원하지 않는 맵입니다. 맵을 선택하고 위치를 다시 지정해 주세요.</p>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-14 font-medium text-sub">진영 *</span>
          <Dropdown label="스모크 진영" appearance="field" options={draft.side ? SIDE_OPTIONS : [{ value: "", label: "진영을 선택해 주세요" }, ...SIDE_OPTIONS]}
            value={draft.side} onChange={(side) => update({ side })} />
          <p className="text-13 text-sub">이 스모크를 사용할 진영입니다. 지도 방향을 바꿔도 저장할 진영과 위치는 유지됩니다.</p>
          {!draft.side && <p className="text-13 text-sub">기존 자료에 진영이 없습니다. 저장 전에 선택해 주세요.</p>}
          {sideError && <p role="alert" className="text-13 text-loss">{sideError}</p>}
        </div>
        <TextAreaField label="설명" value={draft.notes} maxLength={5000} rows={5} placeholder="어떤 시야를 막는 위치인지 적어 주세요." onChange={(event) => update({ notes: event.target.value })} />
        <div className="flex flex-col gap-2">
          <span className="text-14 font-medium text-sub">공개 상태</span>
          <Dropdown label="스모크 상태" appearance="field" options={STATUS_OPTIONS} value={draft.status} onChange={(status) => update({ status })} />
          <p className="text-13 text-sub">{realMode ? "활성으로 저장하면 공개 지도에 표시됩니다. 비활성은 관리자만 볼 수 있습니다." : "체험 자료는 활성으로 저장해도 공개 지도에 표시되지 않습니다."}</p>
        </div>
      </Card>
      <Card as="section" className="flex min-w-0 flex-col gap-4 p-5 md:p-6">
        <div><h3 className="text-20 font-semibold">스모크 위치 *</h3><p className="mt-1 text-14 text-sub">지도에서 한 점을 누르세요. 지정한 점은 끌어서 옮길 수 있습니다.</p></div>
        {knownMap && <SmokePointMap key={draft.mapId} mapId={draft.mapId} value={draft.destination} onChange={(destination) => update({ destination })} />}
        {pointError && <p role="alert" className="text-13 text-loss">{pointError}</p>}
        {draft.destination && <Button size="md" variant="secondary" className="self-start" onClick={() => update({ destination: null })}>위치 초기화</Button>}
      </Card>
    </fieldset>
    {error && <p role="alert" className="text-14 text-loss">{error}</p>}
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-4">
        {initial && <Button variant="secondary" disabled={pending} onClick={() => void remove()}>스모크 삭제</Button>}
        {realMode && initial?.status === "active" && <Link to={`/smokes/${encodeURIComponent(initial.mapId)}/${encodeURIComponent(initial.id)}`} className="text-14 text-primary hover:underline">저장된 공개 자료 보기 →</Link>}
      </div>
      <Button type="submit" disabled={pending}>{pending ? "처리 중…" : "스모크 저장"}</Button>
    </div>
  </form>;
}
