import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { GuideMapViewer, type MapGuide } from "@/components/guide-map/GuideMapViewer";
import { YouTubePlayer } from "@/components/guide-map/YouTubePlayer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TextAreaField, TextField } from "@/components/ui/TextField";
import { agentAbilities, agentName, ALL_AGENT_IDS, mapName } from "@/data/game-names";
import { MapEditor } from "@/features/admin/MapEditor";
import { saveGuideEntry, useGuideEntries } from "@/features/admin/guide-store";
import {
  changeMap,
  createAtDestination,
  createEmpty,
  detachDestination,
  groupDestinations,
  KIND_LABEL,
  KIND_PATH,
  sharedCount,
  STATUS_LABEL,
  toMapGuide,
  validateEntry,
  type AbilitySlot,
  type GuideEntry,
  type GuideKind,
  type GuideStatus,
} from "@/features/admin/model";
import { LINEUP_MAPS, type LineupSide, type LineupSite } from "@/mocks/lineups";
import { SMOKE_VARIANT_LABEL, type SmokeVariant } from "@/mocks/smokes";

const NEW_DESTINATION = "__new__";
const SIDE_OPTIONS: { value: LineupSide; label: string }[] = [
  { value: "attack", label: "공격" },
  { value: "defense", label: "수비" },
];
const SITE_OPTIONS: { value: LineupSite; label: string }[] = (["A", "B", "C", "미드"] as const).map((site) => ({ value: site, label: site }));
const MAP_OPTIONS = LINEUP_MAPS.map((map) => ({ value: map.mapId, label: map.name }));
const STATUS_OPTIONS = (Object.keys(STATUS_LABEL) as GuideStatus[]).map((status) => ({ value: status, label: STATUS_LABEL[status] }));
const SHAPE_OPTIONS = (Object.keys(SMOKE_VARIANT_LABEL) as SmokeVariant[]).map((shape) => ({ value: shape, label: SMOKE_VARIANT_LABEL[shape] }));

/** 라인업·스모크 모두 모든 요원을 고를 수 있다. 이름순 */
const AGENT_OPTIONS = ALL_AGENT_IDS.map((agentId) => ({ value: agentId, label: agentName(agentId) }))
  .sort((a, b) => a.label.localeCompare(b.label, "ko"));

/** /admin/:kind/new · /admin/:kind/:id. 이동할 때마다 key로 편집 상태를 새로 만든다. */
export function AdminEditorPage({ kind }: { kind: GuideKind }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { key } = useLocation();
  const destinationId = params.get("destination");
  // 저장 후 같은 주소로 다시 들어와도(location.key 변경) 저장된 값으로 새로 시작한다
  return <Editor key={key} kind={kind} id={id} destinationId={destinationId} />;
}

function Editor({ kind, id, destinationId }: { kind: GuideKind; id?: string; destinationId: string | null }) {
  const entries = useGuideEntries();
  const navigate = useNavigate();
  const location = useLocation();
  const base = `/admin/${KIND_PATH[kind]}`;

  const [initial] = useState<GuideEntry | null>(() => {
    if (id) return entries.find((entry) => entry.id === id && entry.kind === kind) ?? null;
    const source = destinationId && entries.find((entry) => entry.kind === kind && entry.destination.id === destinationId);
    return source ? createAtDestination(source) : createEmpty(kind);
  });
  const [draft, setDraft] = useState<GuideEntry | null>(initial);
  const [moveShared, setMoveShared] = useState(false);
  // 저장을 한 번 눌러 본 뒤에는 고칠 때마다 남은 오류만 다시 보여준다
  const [attempted, setAttempted] = useState(false);
  const [preview, setPreview] = useState(false);
  const [playingId, setPlayingId] = useState<string>();
  const savedMessage = (location.state as { saved?: boolean } | null)?.saved;

  if (!draft || !initial) {
    return (
      <Card className="flex flex-col items-start gap-4 p-6">
        <p className="text-15 text-sub">공략을 찾을 수 없습니다. 새로고침하면 예시 자료로 초기화됩니다.</p>
        <ButtonLink to={base} size="md" variant="secondary">
          목록으로
        </ButtonLink>
      </Card>
    );
  }

  const errors = attempted ? validateEntry(draft) : {};
  const others = sharedCount(entries, draft);
  const destinationLocked = others > 0 && !moveShared;
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const groups = groupDestinations(entries, kind, draft.mapId);
  const currentGroup = groups.find((group) => group.destination.id === draft.destination.id);
  const update = (changes: Partial<GuideEntry>) => setDraft({ ...draft, ...changes });
  const abilityOptions = agentAbilities(draft.agentId).map((ability) => ({ value: ability.key, label: `${ability.key} · ${ability.ko}` }));

  const chooseDestination = (value: string) => {
    if (value === NEW_DESTINATION) {
      setDraft(detachDestination(draft));
    } else {
      const source = groups.find((group) => group.destination.id === value)?.entries[0];
      if (source) setDraft({ ...draft, destination: { ...source.destination }, path: [] });
    }
    setMoveShared(false);
  };

  const save = () => {
    setAttempted(true);
    if (Object.keys(validateEntry(draft)).length > 0) return;
    const savedId = saveGuideEntry(draft, moveShared);
    navigate(`${base}/${savedId}`, { replace: Boolean(id), state: { saved: true } });
  };

  // 미리보기: 같은 맵·종류의 저장된 공략 + 지금 편집 중인 공략(저장 전 내용으로 바꿔 끼움)
  const previewGuides = [...entries.filter((entry) => entry.kind === kind && entry.mapId === draft.mapId && entry.id !== draft.id), draft]
    .map(toMapGuide)
    .filter((guide): guide is MapGuide => guide !== null);
  const playing = previewGuides.find((guide) => guide.id === playingId) ?? previewGuides.find((guide) => guide.id === (draft.id || "draft"));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3 text-13 text-sub">
        <ButtonLink to={base} size="md" variant="secondary">
          ← 목록으로
        </ButtonLink>
        <span>
          {KIND_LABEL[kind]} 관리 / {id ? "편집" : "새 등록"}
        </span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-24 font-bold">{id ? "공략 편집" : "새 공략 등록"}</h2>
          <p className="text-14 text-sub" role="status">
            {dirty ? "저장하지 않은 변경이 있습니다." : savedMessage ? "예시 목록에 저장했습니다." : "공략 하나에 출발점과 유튜브 영상을 하나씩 등록합니다."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setPreview((value) => !value)}>
            {preview ? "편집으로 돌아가기" : "미리보기"}
          </Button>
          <Button onClick={save}>예시 목록에 저장</Button>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <p role="alert" className="rounded-lg border border-loss bg-loss-soft px-4 py-3 text-14 text-loss">
          저장하려면 표시한 항목을 채워 주세요: {Object.values(errors).join(" ")}
        </p>
      )}

      {id && currentGroup && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line border-l-2 border-l-caution bg-surface px-4 py-3">
          <div className="flex flex-col">
            <span className="text-15 font-semibold">{currentGroup.destination.name}</span>
            <span className="text-13 text-sub">같은 도착점의 공략 {currentGroup.entries.length}개</span>
          </div>
          <Link to={`${base}/new?destination=${encodeURIComponent(currentGroup.destination.id)}`} className="text-14 font-medium text-primary hover:underline">
            이 도착점에 공략 추가 →
          </Link>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-5">
          <FormSection step="1" title="도착점 선택" text="어디에 도착하는 공략인가요?">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="맵">
                <Dropdown label="맵" appearance="field" options={MAP_OPTIONS} value={draft.mapId} onChange={(mapId) => setDraft(changeMap(draft, mapId))} />
              </Field>
              <Field label="요원">
                <Dropdown label="요원" appearance="field" options={AGENT_OPTIONS} value={draft.agentId} onChange={(agentId) => update({ agentId })} />
              </Field>
              <Field label="진영">
                <SegmentedControl label="진영" options={SIDE_OPTIONS} value={draft.side} onChange={(side) => update({ side })} />
              </Field>
              <Field label="사이트">
                <Dropdown label="사이트" appearance="field" options={SITE_OPTIONS} value={draft.site} onChange={(site) => update({ site })} />
              </Field>
            </div>
            <Field label="도착점">
              <Dropdown
                label="도착점"
                appearance="field"
                options={[
                  { value: NEW_DESTINATION, label: "+ 새 도착점 지정" },
                  ...groups.map((group) => ({ value: group.destination.id, label: `${group.destination.name} · 공략 ${group.entries.length}개` })),
                ]}
                value={currentGroup ? draft.destination.id : NEW_DESTINATION}
                onChange={chooseDestination}
              />
            </Field>
            {others > 0 && (
              <p className="text-13 text-sub">
                이 도착점을 공략 {others}개가 함께 씁니다. 이 공략만 다른 곳에 도착하게 하려면 '새 도착점 지정'을 고르세요.
              </p>
            )}
            <TextField
              label="도착점 이름 *"
              placeholder="예: A 사이트 기본 설치 위치"
              value={draft.destination.name}
              disabled={destinationLocked}
              onChange={(event) => update({ destination: { ...draft.destination, name: event.target.value } })}
              error={errors.destination && !draft.destination.name.trim() ? errors.destination : undefined}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="스킬 슬롯">
                <Dropdown
                  label="스킬 슬롯"
                  appearance="field"
                  options={abilityOptions}
                  value={draft.abilitySlot}
                  onChange={(abilitySlot: AbilitySlot) => update({ abilitySlot })}
                />
              </Field>
              {kind === "smoke" && (
                <Field label="스모크 형태">
                  <Dropdown
                    label="스모크 형태"
                    appearance="field"
                    options={SHAPE_OPTIONS}
                    value={draft.shape}
                    onChange={(shape) => update({ shape })}
                  />
                </Field>
              )}
            </div>
          </FormSection>

          <FormSection step="2" title="공략 정보와 영상" text="지도에 출발점을 찍고 유튜브 주소를 넣으세요.">
            <TextField
              label="공략 제목 *"
              placeholder="예: A 메인에서 던지는 방법"
              value={draft.title}
              maxLength={120}
              onChange={(event) => update({ title: event.target.value })}
              error={errors.title}
            />
            <TextField
              label="유튜브 영상 주소 *"
              type="url"
              inputMode="url"
              placeholder="https://www.youtube.com/watch?v=…"
              value={draft.videoUrl}
              onChange={(event) => update({ videoUrl: event.target.value })}
              error={errors.videoUrl}
              hint="youtube.com/watch, youtu.be, shorts 주소를 넣을 수 있습니다. 출발지를 누르면 이 영상이 재생됩니다."
            />
            <details className="group border-t border-line pt-4">
              <summary className="cursor-pointer text-14 font-medium text-sub hover:text-main">설명·상태 설정</summary>
              <div className="mt-4 flex flex-col gap-4">
                <TextAreaField
                  label="설명"
                  placeholder="서는 위치, 조준 기준 등을 적어 주세요."
                  value={draft.notes}
                  onChange={(event) => update({ notes: event.target.value })}
                />
                <Field label="상태">
                  <Dropdown label="상태" appearance="field" options={STATUS_OPTIONS} value={draft.status} onChange={(status) => update({ status })} />
                </Field>
              </div>
            </details>
          </FormSection>
        </div>

        {preview ? (
          <Card as="section" aria-label="공략 미리보기" className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex flex-col gap-1">
              <p lang="en" className="text-12 font-semibold tracking-wider text-sub-weak">
                PREVIEW
              </p>
              <h2 className="text-20 font-semibold">공개 화면 미리보기</h2>
              <p className="text-13 text-sub">
                {mapName(draft.mapId)}의 {KIND_LABEL[kind]} 공략 {previewGuides.length}개를 보여줍니다. 편집 중인 공략은 저장 전 내용입니다.
              </p>
            </div>
            {playing ? (
              <div className="flex flex-col gap-2">
                <YouTubePlayer url={playing.videoUrl} title={playing.title} autoplay={Boolean(playingId)} />
                <p className="text-15 font-semibold">{playing.title}</p>
                <p className="text-13 text-sub">
                  {agentName(playing.agentId)} · {playing.destinationName}
                </p>
              </div>
            ) : (
              <p className="rounded-lg bg-elevated px-4 py-3 text-14 text-sub">편집 중인 공략의 도착·출발 위치를 지정하면 함께 보입니다.</p>
            )}
            <GuideMapViewer mapId={draft.mapId} mapName={mapName(draft.mapId)} guides={previewGuides} playingId={playing?.id} onPlay={(guide) => setPlayingId(guide.id)} />
          </Card>
        ) : (
          <MapEditor
            entry={draft}
            mapName={mapName(draft.mapId)}
            onChange={setDraft}
            errors={errors}
            shared={others > 0 ? { count: others, editing: moveShared, onToggle: () => setMoveShared((value) => !value) } : undefined}
          />
        )}
      </div>
    </div>
  );
}

function FormSection({ step, title, text, children }: { step: string; title: string; text: string; children: ReactNode }) {
  return (
    <Card as="section" className="flex flex-col gap-4 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-elevated text-14 font-bold text-sub">{step}</span>
        <div className="flex flex-col">
          <h3 className="text-18 font-semibold">{title}</h3>
          <p className="text-13 text-sub">{text}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

/** Dropdown·SegmentedControl은 자체 aria-label이 있어 보이는 라벨만 단다. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-14 font-medium text-sub">{label}</span>
      {children}
    </div>
  );
}
