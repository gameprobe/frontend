"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LINEUP_AGENT_OPTIONS, LINEUP_MAP_OPTIONS, getAgentAssetPath } from "../../../lib/asset-map";
import { AdminPageShell } from "../AdminPageShell";
import { changeMap, createEmpty, createExamples, createAtDestination, detachDestination, groupDestinations, isSafeMediaUrl, savePreviewEntry, validateDraft, type PreviewDraft, type PreviewKind } from "./model";
import { PreviewMap } from "./PreviewMap";
import s from "./AdminPreview.module.css";

const kindLabel = (kind: PreviewKind) => kind === "lineup" ? "라인업" : "스모크";
const statusLabel = (status: PreviewDraft["status"]) => status === "draft" ? "초안" : "검토 대기";
const agentName = (id: string) => LINEUP_AGENT_OPTIONS.find(a => a.id === id)?.name ?? id;
const mapName = (id: string) => LINEUP_MAP_OPTIONS.find(m => m.id === id)?.name ?? id;

function Field({ label, name, children, error }: { label: string; name: string; children: ReactNode; error?: string }) {
  return <div className={s.field}><label htmlFor={name}>{label}</label>{children}{error && <span className={s.error} id={`${name}-error`}>{error}</span>}</div>;
}

/** 공개된 체험용 코드. 실제 관리자 인증이나 접근 권한을 부여하지 않는다. */
export function AdminPreview() {
  const [entered, setEntered] = useState(false);
  const [code, setCode] = useState("");
  const [invalid, setInvalid] = useState(false);
  if (entered) return <AdminPreviewEditor />;
  return <AdminPageShell><div className={s.preview}><section className={s.entryGate}>
    <span className={s.eyebrow}>GAMEPROBE / CONTENT STUDIO</span>
    <h1>관리자 화면 체험</h1>
    <p>예시 코드로 들어가 라인업·스모크 자료와 지도 경로를 등록해 보세요.</p>
    <form onSubmit={event => {
      event.preventDefault();
      const valid = code.trim().toUpperCase() === "DEMO1234";
      setInvalid(!valid); setEntered(valid);
    }}>
      <Field label="예시 입장 코드" name="preview-code"><input id="preview-code" value={code} autoComplete="off" autoCapitalize="characters" placeholder="DEMO1234" aria-invalid={invalid} aria-describedby="preview-code-help" onChange={event => { setCode(event.target.value); setInvalid(false); }} /></Field>
      <p id="preview-code-help" className={s.help}>체험용 코드: <strong>DEMO1234</strong></p>
      {invalid && <p role="alert" className={s.error}>예시 코드 DEMO1234를 입력해 주세요.</p>}
      <button className={s.primary} type="submit">예시 화면 들어가기</button>
    </form>
    <p className={s.help}>실제 관리자 인증이 아닌 화면 체험입니다. 입력한 자료는 공개되지 않으며 새로고침하면 초기화됩니다.</p>
    <Link className={s.secondary} href="/admin">실제 관리자 인증으로 이동</Link>
  </section></div></AdminPageShell>;
}

/** 공략은 개별 저장하고 같은 도착점 ID끼리 목록에서 묶는다. 실제 저장/API와는 분리된 예시다. */
function AdminPreviewEditor() {
  const [entries, setEntries] = useState(createExamples);
  const [draft, setDraft] = useState(() => createExamples()[0]);
  const [baseline, setBaseline] = useState(() => createExamples()[0]);
  const [kind, setKind] = useState<PreviewKind>("lineup");
  const [view, setView] = useState<"list" | "editor">("list");
  // 관리 메뉴를 오가거나 편집을 마쳐도 종류별 목록 조건은 그대로 남긴다.
  const [listFilters, setListFilters] = useState({ lineup: { query: "", status: "all" }, smoke: { query: "", status: "all" } });
  const { query, status: filter } = listFilters[kind];
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const [messagesHidden, setMessagesHidden] = useState(false);
  const [editingDestination, setEditingDestination] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { focusHeading(); }, []);
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const visible = entries.filter(entry => entry.kind === kind && (filter === "all" || entry.status === filter)
    && `${entry.title} ${entry.destination.name} ${mapName(entry.mapId)} ${agentName(entry.agentId)}`.toLowerCase().includes(query.trim().toLowerCase()));
  const groups = groupDestinations(visible, kind);
  const availableDestinations = groupDestinations(entries, kind, draft.mapId);
  const selectedGroup = availableDestinations.find(group => group.destination.id === draft.destination.id);
  // 목록 검색 결과와 무관하게 새로 연결할 현재 공략까지 포함해 영향 범위를 센다.
  const destinationGuideCount = selectedGroup ? selectedGroup.entries.filter(entry => entry.id !== draft.id).length + 1 : 1;
  const destinationLocked = destinationGuideCount > 1 && !editingDestination;

  function change(next: PreviewDraft) {
    if (next.kind !== draft.kind || next.mapId !== draft.mapId || next.destination.id !== draft.destination.id) setEditingDestination(false);
    // 편집 중 안내/오류 공간을 없애면 드래그 기준 지도가 움직인다. 다음 검사 전까지 자리만 유지한다.
    setDraft(next); setMessagesHidden(true);
  }
  function showFeedback(message: string) {
    setErrors({}); setFeedback(message); setMessagesHidden(false);
  }
  function focusHeading() {
    requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({ block: "start" });
    });
  }
  function canLeaveEditor() {
    return view !== "editor" || !dirty || window.confirm("저장하지 않은 변경이 있습니다. 변경을 버리고 이동할까요?");
  }
  function open(next: PreviewDraft) {
    if (!canLeaveEditor()) return false;
    setDraft(next); setBaseline(next); setPreview(false); setErrors({}); setFeedback(""); setMessagesHidden(false); setEditingDestination(false);
    setView("editor"); focusHeading();
    return true;
  }
  function showList(next: PreviewKind = kind) {
    if (!canLeaveEditor()) return;
    setDraft(baseline); setPreview(false); setErrors({}); setFeedback(""); setMessagesHidden(false); setEditingDestination(false);
    setKind(next); setView("list"); focusHeading();
  }
  function updateFilters(next: Partial<{ query: string; status: string }>) {
    setListFilters(current => ({ ...current, [kind]: { ...current[kind], ...next } }));
  }
  function newEntry() { open(createEmpty(kind)); }
  function addAtDestination() {
    if (!selectedGroup) return;
    const savedSource = selectedGroup.entries.find(entry => entry.id === draft.id) ?? selectedGroup.entries[0];
    if (open(createAtDestination(savedSource))) {
      showFeedback(`‘${savedSource.destination.name}’에 공략을 추가합니다. 새 출발점과 자료 주소를 입력하세요.`);
    }
  }
  function selectDestination(id: string) {
    if (!id) { change(detachDestination(draft)); return; }
    const source = availableDestinations.find(group => group.destination.id === id)?.entries[0];
    if (!source || source.destination.id === draft.destination.id) return;
    change({ ...draft, destination: { ...source.destination, point: source.destination.point && { ...source.destination.point } }, site: source.site, path: [], wallEnd: null });
    showFeedback("도착점을 선택했습니다. 출발 위치를 확인하고 필요한 경로를 지정하세요.");
  }
  function cancelDestinationEdit() {
    if (!selectedGroup) return;
    // 도착점 이동만 취소한다. 제목·자료·출발점 등 다른 임시 수정은 보존한다.
    change({ ...draft, destination: { ...draft.destination, point: selectedGroup.destination.point && { ...selectedGroup.destination.point } } });
    setEditingDestination(false);
  }
  function save() {
    const invalid = validateDraft(draft);
    setErrors(invalid); setMessagesHidden(false);
    if (Object.keys(invalid).length) { setFeedback(""); requestAnimationFrame(() => errorRef.current?.focus()); return; }
    const saved = { ...draft, id: draft.id || `preview-${crypto.randomUUID()}`, title: draft.title.trim(), mediaUrl: draft.mediaUrl.trim(), notes: draft.notes.trim(), destination: { ...draft.destination, name: draft.destination.name.trim() } };
    const sharedPointChanged = editingDestination && destinationGuideCount > 1
      && JSON.stringify(selectedGroup?.destination.point) !== JSON.stringify(saved.destination.point);
    // 다른 공략에는 저장 성공 시에만 공유 도착 좌표를 함께 반영한다.
    const nextEntries = savePreviewEntry(entries, saved, editingDestination);
    const savedEntry = nextEntries.find(entry => entry.id === saved.id)!;
    setEntries(nextEntries);
    setDraft(savedEntry); setBaseline(savedEntry); setEditingDestination(false);
    showFeedback(sharedPointChanged ? `예시 목록에 저장했습니다. 공략 ${destinationGuideCount}개의 도착 위치를 함께 수정했습니다.` : "예시 목록에 저장했습니다. 같은 도착점의 다른 공략은 그대로 유지됩니다.");
  }

  return <AdminPageShell><div className={s.preview}>
    <header className={s.heading}>
      <div><span className={s.eyebrow}>GAMEPROBE / CONTENT STUDIO</span><h1>전술 자료 관리</h1><p>자료를 찾아 수정하거나 새 공략을 등록하세요.</p></div>
    </header>
    <div className={s.notice}><strong>화면 체험 중</strong><p>입력한 내용은 이 화면에서만 유지됩니다. 새로고침하면 초기화되며 공개 페이지에는 반영되지 않습니다.</p></div>
    <div className={s.layout}>
      <aside className={s.management}>
        <p className={s.menuLabel}>자료 관리</p>
        <nav className={s.managementNav} aria-label="관리자 메뉴">{(["lineup", "smoke"] as const).map(k => <button key={k} type="button" aria-current={kind === k ? "page" : undefined} onClick={() => showList(k)}><span>{kindLabel(k)} 관리</span><b aria-hidden="true">{entries.filter(e => e.kind === k).length}</b></button>)}</nav>
      </aside>
      {view === "list" ? <section className={s.workspace} aria-label={`${kindLabel(kind)} 목록`}>
        <div className={s.workspaceHeader}>
          <div><h2 ref={headingRef} tabIndex={-1}>{kindLabel(kind)} 관리</h2><p>같은 도착점의 공략을 모았습니다. 공략을 선택하면 편집할 수 있습니다.</p></div>
          <button className={s.primary} type="button" onClick={newEntry}><span aria-hidden="true">＋</span> 새 {kindLabel(kind)} 등록</button>
        </div>
        <div className={s.listPanel}>
          <div className={s.filters}>
            <Field label="자료 검색" name="guide-search"><input id="guide-search" placeholder="맵, 도착점, 제목, 요원 검색" value={query} onChange={e => updateFilters({ query: e.target.value })} /></Field>
            <Field label="목록 상태 필터" name="guide-filter"><select id="guide-filter" value={filter} onChange={e => updateFilters({ status: e.target.value })}><option value="all">모든 상태</option><option value="draft">초안</option><option value="review">검토 대기</option></select></Field>
          </div>
          <div className={s.listSummary} role="status">검색 결과 {visible.length}개 / 전체 {entries.filter(entry => entry.kind === kind).length}개<span>도착점 {groups.length}개</span></div>
          <div className={s.list}>{groups.length ? groups.map(group => <section key={`${group.mapId}-${group.destination.id}`} className={s.destinationGroup} data-destination-group={group.destination.id}>
            <div className={s.groupHeading}><div><span className={s.subtle}>{mapName(group.mapId)} · 도착점</span><h3>{group.destination.name}</h3></div><span className={s.subtle}>공략 {group.entries.length}개</span></div>
            {group.entries.map(entry => <button type="button" key={entry.id} data-guide-id={entry.id} className={s.entry} aria-label={`${entry.title} 편집`} onClick={() => open(entry)}>
              <Image src={getAgentAssetPath(entry.agentId)} alt="" width={44} height={44} />
              <span className={s.entryText}><strong>{entry.title}</strong><span className={s.subtle}>{agentName(entry.agentId)} · 스킬 {entry.abilitySlot}</span></span>
              <span className={s.mediaType}>{entry.mediaType === "video" ? "영상" : "이미지"}</span>
              <span className={`${s.badge} ${entry.status === "review" ? s.review : ""}`}>{statusLabel(entry.status)}</span>
              <span className={s.editHint} aria-hidden="true">편집 →</span>
            </button>)}
          </section>) : <div className={s.empty}><p>조건에 맞는 공략이 없습니다.</p><p>다른 검색어나 상태를 선택해 보세요.</p><button type="button" className={s.secondary} onClick={() => updateFilters({ query: "", status: "all" })}>검색 조건 초기화</button></div>}</div>
        </div>
      </section> : <section className={s.workspace} aria-label="자료 편집">
        <div className={s.editorTrail}><button className={s.smallButton} type="button" onClick={() => showList()}><span aria-hidden="true">←</span> 목록으로</button><span>{kindLabel(kind)} 관리 / {draft.id ? "편집" : "새 등록"}</span></div>
        <div className={s.workspaceHeader}>
          <div><h2 ref={headingRef} tabIndex={-1}>{draft.id ? "공략 편집" : "새 공략 등록"}</h2><p>{dirty ? "저장하지 않은 변경이 있습니다." : "공략 하나에 출발점과 자료 주소를 하나씩 등록합니다."}</p></div>
          <div className={s.actions}><button className={s.secondary} type="button" aria-pressed={preview} onClick={() => setPreview(p => !p)}>{preview ? "편집으로 돌아가기" : "미리보기"}</button><button className={s.primary} type="button" onClick={save}>예시 목록에 저장</button></div>
        </div>
        {selectedGroup && <div className={s.sharedDestination}><div><strong>{selectedGroup.destination.name}</strong><span>같은 도착점의 공략 {selectedGroup.entries.length}개</span></div><button className={s.smallButton} type="button" onClick={addAtDestination}>이 도착점에 공략 추가</button></div>}
        {feedback && <div role="status" className={s.feedback} style={messagesHidden ? { visibility: "hidden" } : undefined}>{feedback}</div>}
        {Object.keys(errors).length > 0 && <div role="alert" tabIndex={-1} ref={errorRef} className={s.errorBox} style={messagesHidden ? { visibility: "hidden" } : undefined}><strong>아래 항목을 확인해 주세요.</strong><ul>{Object.entries(errors).map(([key, text]) => <li key={key}>{text}</li>)}</ul></div>}
        {preview ? <div className={s.editorGrid}>
          <section className={s.previewInfo} aria-label="자료 미리보기">
            <div><span className={s.eyebrow}>공략 미리보기</span><h2>{draft.title || "제목을 입력해 주세요"}</h2></div>
            <div className={s.previewIdentity}><Image src={getAgentAssetPath(draft.agentId)} alt="" width={56} height={56} /><div><h3>{agentName(draft.agentId)}</h3><span className={s.subtle}>스킬 {draft.abilitySlot} · {kindLabel(draft.kind)}</span></div></div>
            <dl className={s.metadata}><div><dt>도착점</dt><dd>{draft.destination.name || "미지정"}</dd></div><div><dt>맵 / 구역</dt><dd>{mapName(draft.mapId)} / {draft.site}</dd></div><div><dt>진영</dt><dd>{draft.side === "attack" ? "공격" : "수비"}</dd></div><div><dt>자료 형식</dt><dd>{draft.mediaType === "video" ? "영상" : "이미지"}</dd></div></dl>
            <div><h3>이 공략의 자료</h3>{isSafeMediaUrl(draft.mediaUrl) ? <a className={s.mediaLink} href={draft.mediaUrl.trim()} target="_blank" rel="noopener noreferrer">{draft.mediaUrl.trim()} ↗</a> : <p className={s.help}>올바른 자료 주소를 입력해 주세요.</p>}<p className={s.help}>예시에서는 주소만 표시합니다. 실제 영상·이미지와 공략 내용은 별도로 확인해 주세요.</p></div>
            <div><h3>설명</h3><p className={s.description}>{draft.notes || "등록한 설명이 없습니다."}</p></div>
            <p className={s.savedNote}>이 공략의 출발점과 경로만 표시합니다. 위치와 자료 주소는 화면 체험용 예시입니다.</p>
          </section>
          <PreviewMap key={`${draft.id}-${draft.mapId}-${draft.destination.id}-preview`} draft={draft} />
        </div> : <form noValidate onSubmit={event => { event.preventDefault(); save(); }} className={`${s.editorGrid} ${messagesHidden ? s.validationHidden : ""}`}>
          <div className={s.formSections}>
            <section className={s.fields} aria-label="도착점 선택">
              <div className={s.stepHeading}><span>1</span><div><h3>도착점 선택</h3><p>어디에 도착하는 공략인가요?</p></div></div>
              <div className={s.row}>
                <Field label="맵" name="preview-map"><select id="preview-map" value={draft.mapId} onChange={e => { change(changeMap(draft, e.target.value)); showFeedback("맵을 변경했습니다. 새 지도에서 도착점과 출발점을 지정하세요."); }}>{LINEUP_MAP_OPTIONS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field>
                <Field label="요원" name="preview-agent"><select id="preview-agent" value={draft.agentId} onChange={e => change({ ...draft, agentId: e.target.value })}>{LINEUP_AGENT_OPTIONS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>
              </div>
              <Field label="도착점" name="preview-destination"><select id="preview-destination" value={selectedGroup ? draft.destination.id : ""} onChange={e => selectDestination(e.target.value)}><option value="">＋ 새 도착점 지정</option>{availableDestinations.map(group => <option key={group.destination.id} value={group.destination.id}>{group.destination.name} · 공략 {group.entries.length}개</option>)}</select></Field>
              {selectedGroup ? <p className={s.lockedNote}>{destinationGuideCount === 1 ? "이 공략만 사용하는 도착점입니다. 지도에서 바로 옮길 수 있습니다." : `현재 공략을 포함해 ${destinationGuideCount}개 공략이 이 도착점을 사용합니다.`} 이 공략만 다른 곳에 도착하게 하려면 ‘새 도착점 지정’을 선택하세요.</p> : <Field label="도착점 이름 *" name="preview-destination-name" error={errors.destination}><input id="preview-destination-name" placeholder="예: A 사이트 기본 설치 위치" maxLength={80} value={draft.destination.name} aria-invalid={!messagesHidden && !!errors.destination} onChange={e => change({ ...draft, destination: { ...draft.destination, name: e.target.value } })} /></Field>}
              <div className={s.row}>
                <Field label="스킬 슬롯" name="preview-ability"><select id="preview-ability" value={draft.abilitySlot} onChange={e => change({ ...draft, abilitySlot: e.target.value as PreviewDraft["abilitySlot"] })}>{["C", "Q", "E", "X"].map(slot => <option key={slot}>{slot}</option>)}</select></Field>
                {draft.kind === "smoke" && <Field label="스모크 형태" name="preview-shape"><select id="preview-shape" value={draft.shape} onChange={e => change({ ...draft, shape: e.target.value as PreviewDraft["shape"], wallEnd: null })}><option value="circle">원형</option><option value="wall">벽형</option></select></Field>}
              </div>
            </section>
            <section className={s.fields} aria-label="공략 자료 입력">
              <div className={s.stepHeading}><span>2</span><div><h3>출발점과 자료 입력</h3><p>지도에 출발점을 찍고 자료 주소를 넣으세요.</p></div></div>
              <Field label="공략 제목 *" name="preview-title" error={errors.title}><input id="preview-title" placeholder="예: A 메인에서 던지는 방법" maxLength={120} value={draft.title} aria-invalid={!messagesHidden && !!errors.title} aria-describedby={!messagesHidden && errors.title ? "preview-title-error" : undefined} onChange={e => change({ ...draft, title: e.target.value })} /></Field>
              <Field label={draft.mediaType === "video" ? "영상 주소 *" : "이미지 주소 *"} name="preview-url" error={errors.mediaUrl}><input id="preview-url" type="url" placeholder="https://…" value={draft.mediaUrl} aria-invalid={!messagesHidden && !!errors.mediaUrl} aria-describedby={!messagesHidden && errors.mediaUrl ? "preview-url-error" : undefined} onChange={e => change({ ...draft, mediaUrl: e.target.value })} /></Field>
              <details className={s.extraOptions}><summary>설명·자료 형식·기타 설정</summary>
                <Field label="자료 형식" name="preview-media-type"><select id="preview-media-type" value={draft.mediaType} onChange={e => change({ ...draft, mediaType: e.target.value as PreviewDraft["mediaType"] })}><option value="video">영상 주소</option><option value="image">이미지 주소</option></select></Field>
                <Field label="사용 방법 · 메모" name="preview-notes"><textarea id="preview-notes" rows={3} maxLength={3000} placeholder="서 있는 위치와 사용 순서를 적어 주세요." value={draft.notes} onChange={e => change({ ...draft, notes: e.target.value })} /></Field>
                <div className={s.row}><Field label="진영" name="preview-side"><select id="preview-side" value={draft.side} onChange={e => change({ ...draft, side: e.target.value as PreviewDraft["side"] })}><option value="attack">공격</option><option value="defense">수비</option></select></Field>
                <Field label="구역" name="preview-site"><select id="preview-site" value={draft.site} onChange={e => change({ ...draft, site: e.target.value as PreviewDraft["site"] })}>{["A", "B", "C", "Mid"].map(site => <option key={site}>{site}</option>)}</select></Field></div>
                <Field label="상태 예시" name="preview-status"><select id="preview-status" value={draft.status} onChange={e => change({ ...draft, status: e.target.value as PreviewDraft["status"] })}><option value="draft">초안</option><option value="review">검토 대기</option></select></Field>
              </details>
            </section>
          </div>
          <PreviewMap key={`${draft.id}-${draft.mapId}-${draft.destination.id}`} draft={draft} onChange={change} destinationLocked={destinationLocked}
            destinationEdit={destinationGuideCount > 1 ? { count: destinationGuideCount, active: editingDestination, onStart: () => setEditingDestination(true), onCancel: cancelDestinationEdit } : undefined} />
        </form>}
      </section>}
    </div>
  </div></AdminPageShell>;
}
