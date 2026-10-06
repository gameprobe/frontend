"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LINEUP_AGENT_OPTIONS, LINEUP_MAP_OPTIONS, getAgentAssetPath } from "../../lib/asset-map";
import {
  createLineup,
  deleteLineup,
  fetchAdminLineup,
  fetchAdminLineups,
  getLineupApiErrorMessage,
  getStoredAdminToken,
  LineupApiError,
  updateLineup,
  updateLineupStatus
} from "../../lib/lineup-api";
import type { AdminLineupStatus, LineupDetailModel } from "../../types/lineup";
import { AdminPageShell } from "./AdminPageShell";
import {
  ABILITY_OPTIONS,
  createAtRegisteredDestination,
  createRegistrationDraft,
  DIFFICULTY_LABELS,
  draftFromLineup,
  isIndividualLineup,
  registrationPayload,
  STATUS_LABELS,
  validateRegistrationDraft,
  type RegistrationDraft
} from "./lineup-registration";
import { changeMap, detachDestination, isSafeMediaUrl, type PreviewDraft } from "./preview/model";
import { PreviewMap } from "./preview/PreviewMap";
import s from "./preview/AdminPreview.module.css";
import w from "./LineupWorkspace.module.css";

const mapName = (id: string) => LINEUP_MAP_OPTIONS.find(map => map.id === id)?.name ?? id;
const agentName = (id: string) => LINEUP_AGENT_OPTIONS.find(agent => agent.id === id)?.name ?? id;
const editUrl = (id: string) => `/admin/lineups/${encodeURIComponent(id)}/edit`;
const statuses = Object.keys(STATUS_LABELS) as AdminLineupStatus[];

function Field({ label, name, children, error }: { label: string; name: string; children: ReactNode; error?: string }) {
  return <div className={s.field}>
    <label htmlFor={name}>{label}</label>
    {children}
    {error && <span className={s.error} id={`${name}-error`}>{error}</span>}
  </div>;
}

/** 실제 관리자 API만 사용한다. /admin/preview의 메모리 예시와 저장 상태를 공유하지 않는다. */

export function LineupWorkspace({ initialMode = "list", initialId }: { initialMode?: "list" | "new" | "edit"; initialId?: string }) {
  const router = useRouter();
  const [entries, setEntries] = useState<LineupDetailModel[]>([]);
  const [record, setRecord] = useState<LineupDetailModel | null>(null);
  const [draft, setDraft] = useState<RegistrationDraft>(() => createRegistrationDraft());
  const [baseline, setBaseline] = useState<RegistrationDraft>(draft);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const [messagesHidden, setMessagesHidden] = useState(false);
  const [reload, setReload] = useState(0);
  const errorRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const leavingRef = useRef(false);
  const editing = initialMode !== "list";
  const legacy = Boolean(record && !isIndividualLineup(record));
  const dirty = editing && !legacy && JSON.stringify(draft) !== JSON.stringify(baseline);
  const handleFailure = useCallback((reason: unknown): string => {
    if (reason instanceof LineupApiError && (reason.status === 401 || reason.status === 403)) {
      window.sessionStorage.removeItem("lineup-admin-token");
      setAdminToken(null);
      setSessionExpired(true);
      setEntries([]);
    }
    return getLineupApiErrorMessage(reason);
  }, []);

  useEffect(() => {
    let active = true;
    const token = getStoredAdminToken();
    setAdminToken(token);
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError("");
    Promise.all([
      fetchAdminLineups(token),
      initialMode === "edit" && initialId ? fetchAdminLineup(initialId, token) : Promise.resolve(null)
    ])
      .then(([items, current]) => {
        if (!active) return;
        setEntries(items);
        setRecord(current);
        if (initialMode === "edit" && !current) throw new Error("수정할 공략을 찾을 수 없습니다.");
        const nextDraft = current ? draftFromLineup(current) : createRegistrationDraft();
        if (nextDraft) {
          // 목록의 ‘같은 도착점에 추가’는 새 공략의 맥락만 복사한다. 저장은 별도 POST다.
          const sourceId = initialMode === "new" ? new URLSearchParams(window.location.search).get("destinationFrom") : null;
          const source = sourceId ? items.find(item => item.id === sourceId) : undefined;
          const sourceDraft = source && draftFromLineup(source);
          const next = sourceDraft ? createAtRegisteredDestination(sourceDraft) : nextDraft;
          setDraft(next);
          setBaseline(next);
        }
        setErrors({});
        setFeedback("");
        setMessagesHidden(false);
        leavingRef.current = false;
      })
      .catch(reason => {
        if (active) setLoadError(handleFailure(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialMode, initialId, reload, handleFailure]);

  useEffect(() => {
    if (!dirty && !busy) return;
    const previousUrl = window.location.href;
    const previousState = window.history.state;
    const confirmLeave = () => !busyRef.current && window.confirm("저장하지 않은 변경이 있습니다. 변경을 버리고 이동할까요?");
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (leavingRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const linkClick = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.href === window.location.href) return;
      if (!confirmLeave()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      else leavingRef.current = true;
    };
    const popState = (event: PopStateEvent) => {
      if (leavingRef.current) return;
      if (!confirmLeave()) {
        event.stopImmediatePropagation();
        window.history.pushState(previousState, "", previousUrl);
      } else leavingRef.current = true;
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", linkClick, true);
    window.addEventListener("popstate", popState, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", linkClick, true);
      window.removeEventListener("popstate", popState, true);
    };
  }, [dirty, busy]);

  function canLeave() {
    if (busyRef.current) return false;
    return !dirty || window.confirm("저장하지 않은 변경이 있습니다. 변경을 버리고 이동할까요?");
  }

  function navigate(url: string) {
    if (!canLeave()) return;
    leavingRef.current = true;
    router.push(url);
  }

  function change(next: PreviewDraft | RegistrationDraft) {
    if (busyRef.current) return;
    setDraft(current => ({ ...current, ...next }));
    setMessagesHidden(true);
  }

  function showError(message: string) {
    setErrors({ request: message });
    setFeedback("");
    setMessagesHidden(false);
    requestAnimationFrame(() => errorRef.current?.focus());
  }

  function startRequest() {
    busyRef.current = true;
    setBusy(true);
  }

  function finishRequest() {
    busyRef.current = false;
    setBusy(false);
  }

  function logout() {
    if (!canLeave()) return;
    window.sessionStorage.removeItem("lineup-admin-token");
    leavingRef.current = true;
    setAdminToken(null);
    setEntries([]);
    router.replace("/admin");
  }

  function reloadRecords() {
    if (!canLeave()) return;
    setReload(value => value + 1);
  }
  const registered = entries.map(entry => draftFromLineup(entry)).filter((entry): entry is RegistrationDraft => Boolean(entry));
  const availableDestinations = registered.filter(entry => entry.mapId === draft.mapId).filter((entry, index, items) => items.findIndex(item => item.destination.id === entry.destination.id) === index);
  const selectedDestination = availableDestinations.find(entry => entry.destination.id === draft.destination.id);
  const destinationReference = registered.find(entry => entry.id === draft.id && entry.mapId === draft.mapId && entry.destination.id === draft.destination.id) ?? selectedDestination;
  const peers = registered.filter(entry => entry.mapId === draft.mapId && entry.destination.id === draft.destination.id && entry.id !== draft.id);
  const destinationLocked = peers.length > 0;
  const visible = entries.filter(entry =>
    (filter === "ALL" || entry.status === filter)
    && `${entry.title} ${entry.registration?.destination.name ?? ""} ${mapName(entry.mapId)} ${agentName(entry.agentId)}`.toLowerCase().includes(query.trim().toLowerCase()));
  const groups = new Map<string, LineupDetailModel[]>();
  for (const entry of visible) {
    const key = JSON.stringify([entry.mapId, entry.registration?.destination.id ?? `legacy-${entry.id}`]);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }

  async function save() {
    if (!adminToken || busyRef.current || legacy) return;
    const invalid = validateRegistrationDraft(draft);
    // 공유 도착점은 화면의 드래그뿐 아니라 저장 직전에도 이동을 차단한다.
    if (destinationLocked && destinationReference && (draft.destination.name !== destinationReference.destination.name
      || draft.destination.point?.x !== destinationReference.destination.point?.x || draft.destination.point?.y !== destinationReference.destination.point?.y)) {
      invalid.destination = "공유 도착점은 이동할 수 없습니다. ‘새 도착점 지정’으로 이 공략을 분리해 주세요.";
    }
    setErrors(invalid);
    setMessagesHidden(false);
    setFeedback("");
    if (Object.keys(invalid).length) {
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    startRequest();
    try {
      const payload = registrationPayload(draft);
      const saved = draft.id ? await updateLineup(draft.id, payload, adminToken) : await createLineup(payload, adminToken);
      const next = draftFromLineup(saved);
      if (!next) throw new Error("저장은 완료됐으나 응답 형식을 확인할 수 없습니다. 목록을 새로고침해 주세요.");
      setDraft(next);
      setBaseline(next);
      setRecord(saved);
      setEntries(items => items.some(item => item.id === saved.id) ? items.map(item => item.id === saved.id ? saved : item) : [...items, saved]);
      setFeedback("저장했습니다. 새로고침해도 이 공략을 다시 확인할 수 있습니다.");
      if (!draft.id) {
        leavingRef.current = true;
        router.replace(editUrl(saved.id));
      }
    } catch (reason) {
      showError(handleFailure(reason));
    }
    finally {
      finishRequest();
    }
  }

  async function changeStatus(entry: LineupDetailModel, status: AdminLineupStatus) {
    if (!adminToken || busyRef.current) return;
    startRequest();
    setErrors({});
    setFeedback("");
    setMessagesHidden(false);
    try {
      const updated = await updateLineupStatus(entry.id, status, adminToken);
      setEntries(items => items.map(item => item.id === updated.id ? updated : item));
      if (record?.id === updated.id) setRecord(updated);
      setFeedback(`상태를 ‘${STATUS_LABELS[status]}’로 변경했습니다.`);
    } catch (reason) {
      showError(handleFailure(reason));
    }
    finally {
      finishRequest();
    }
  }

  async function remove(entry: LineupDetailModel) {
    if (!adminToken || busyRef.current || !window.confirm(`‘${entry.title}’ 공략을 삭제할까요? 삭제한 공략은 복구할 수 없습니다.${dirty ? " 저장하지 않은 변경도 사라집니다." : ""}`)) return;
    startRequest();
    try {
      await deleteLineup(entry.id, adminToken);
      setEntries(items => items.filter(item => item.id !== entry.id));
      if (editing) {
        leavingRef.current = true;
        router.replace("/admin/lineups");
      }
      else setFeedback("공략을 삭제했습니다.");
    } catch (reason) {
      showError(handleFailure(reason));
    }
    finally {
      finishRequest();
    }
  }

  function selectDestination(id: string) {
    if (!id) {
      change(detachDestination(draft));
      return;
    }
    const source = availableDestinations.find(entry => entry.destination.id === id);
    if (source && source.destination.id !== draft.destination.id) change({
      ...draft,
      destination: { ...source.destination, point: source.destination.point && { ...source.destination.point } },
      site: source.site,
      path: []
    });
  }
  if (!loading && !adminToken) return <AdminPageShell className="admin-access-page">
    <section className="admin-login-card">
      <p className="eyebrow">GAMEPROBE / CONTENT STUDIO</p>
      <h1>{sessionExpired ? "관리자 인증이 만료되었습니다." : "관리자 인증이 필요합니다."}</h1>
      <p>{sessionExpired ? "토큰을 다시 확인한 뒤 로그인해 주세요. 현재 입력 내용은 저장되지 않았습니다." : "등록된 공략을 관리하려면 관리자 토큰으로 인증해 주세요."}</p>
      <Link className="admin-access-primary-link" href="/admin">관리자 인증으로 이동</Link>
      <Link className="lineup-back-link" href="/lineups">사용자 라인업으로 돌아가기</Link>
    </section>
  </AdminPageShell>;
  return <AdminPageShell>
    <div className={`${s.preview} ${w.workspace}`}>
      <header className={s.heading}>
        <div>
          <span className={s.eyebrow}>GAMEPROBE / CONTENT STUDIO</span>
          <h1>전술 자료 관리</h1>
          <p>자료를 찾아 수정하거나 새 공략을 등록하세요.</p>
        </div>
        <div className={s.actions}>
          <Link className={s.secondary} href="/lineups">사용자 화면</Link>
          <button className={s.secondary} type="button" disabled={busy} onClick={logout}>로그아웃</button>
        </div>
      </header>
      <div className={s.layout}>
        <aside className={s.management}>
          <p className={s.menuLabel}>자료 관리</p>
          <nav className={s.managementNav} aria-label="관리자 메뉴">
            <button type="button" aria-current="page" disabled={busy} onClick={() => navigate("/admin/lineups")}>
              <span>라인업 관리</span>
              <b>{entries.length}</b>
            </button>
          </nav>
          <p className={w.sidebarNote}>스모크 등록은 예시 화면에서 체험할 수 있습니다.</p>
          <Link className={w.demoLink} href="/admin/preview">예시 화면 체험 ↗</Link>
        </aside>
        <section className={s.workspace} aria-label={editing ? "자료 편집" : "라인업 목록"}>
          {loading
            ? <div className={w.state} role="status">라인업을 불러오는 중입니다…</div>
            : loadError
              ? <div className={w.state} role="alert">
                <h2>자료를 불러오지 못했습니다.</h2>
                <p>{loadError}</p>
                <button className={s.primary} type="button" onClick={reloadRecords}>다시 불러오기</button>
                <button className={s.secondary} type="button" onClick={() => navigate("/admin/lineups")}>목록으로</button>
              </div>
              : <>
                {editing && <div className={s.editorTrail}>
                  <button className={s.smallButton} type="button" disabled={busy} onClick={() => navigate("/admin/lineups")}>← 목록으로</button>
                  <span>라인업 관리 / {record ? "편집" : "새 등록"}</span>
                </div>}
                <div className={s.workspaceHeader}>
                  <div>
                    <h2>{editing ? legacy ? "기존 자료 확인" : record ? "공략 편집" : "새 공략 등록" : "라인업 관리"}</h2>
                    <p>
                      {editing ? dirty ? "저장하지 않은 변경이 있습니다." : "공략 하나에 출발점과 자료 주소를 하나씩 등록합니다." : "같은 도착점의 공략을 모았습니다. 공략을 선택하면 편집할 수 있습니다."}
                    </p>
                  </div>
                  <div className={s.actions}>
                    <button className={s.secondary} type="button" disabled={busy} onClick={reloadRecords}>새로고침</button>
                    {!editing
                      ? <button className={s.primary} type="button" onClick={() => navigate("/admin/lineups/new")}>＋ 새 라인업 등록</button>
                      : !legacy && <><button
                        className={s.secondary}
                        type="button"
                        disabled={busy}
                        aria-pressed={preview}
                        onClick={() => setPreview(value => !value)}
                      >
                        {preview ? "편집으로 돌아가기" : "미리보기"}
                      </button><button className={s.primary} type="button" disabled={busy} onClick={save}>{busy ? "저장 중…" : "저장"}</button></>}
                  </div>
                </div>
                {feedback && <div role="status" className={s.feedback} style={messagesHidden ? { visibility: "hidden" } : undefined}>{feedback}</div>}
                {Object.keys(errors).length > 0 && <div
                  role="alert"
                  tabIndex={-1}
                  ref={errorRef}
                  className={s.errorBox}
                  style={messagesHidden ? { visibility: "hidden" } : undefined}
                >
                  <strong>아래 항목을 확인해 주세요.</strong>
                  <ul>{Object.entries(errors).map(([key, message]) => <li key={key}>{message}</li>)}</ul>
                </div>}
                {!editing
                  ? <div className={s.listPanel}>
                    <div className={s.filters}>
                      <Field label="자료 검색" name="guide-search">
                        <input
                          id="guide-search"
                          placeholder="맵, 도착점, 제목, 요원 검색"
                          value={query}
                          onChange={event => setQuery(event.target.value)}
                        />
                      </Field>
                      <Field label="목록 상태 필터" name="guide-filter">
                        <select id="guide-filter" value={filter} onChange={event => setFilter(event.target.value)}>
                          <option value="ALL">모든 상태</option>
                          {statuses.map(status => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div className={s.listSummary} role="status">검색 결과 {visible.length}개 / 전체 {entries.length}개<span>도착점 {Array.from(groups.values()).filter(group => group[0].registration).length}개</span></div>
                    <div className={s.list}>
                      {groups.size
                        ? Array.from(groups.entries()).map(([key, group]) =>
                          <section
                            key={key}
                            className={s.destinationGroup}
                            data-destination-group={group[0].registration?.destination.id}
                          >
                            <div className={s.groupHeading}>
                              <div>
                                <span className={s.subtle}>{mapName(group[0].mapId)} · {group[0].registration ? "도착점" : "기존 자료"}</span>
                                <h3>{group[0].registration?.destination.name ?? "기존 형식 공략"}</h3>
                              </div>
                              <span className={s.subtle}>공략 {group.length}개</span>
                            </div>
                            {group.map(entry =>
                              <div key={entry.id} className={w.entryRow}>
                                <button
                                  type="button"
                                  data-guide-id={entry.id}
                                  className={s.entry}
                                  disabled={busy}
                                  aria-label={`${entry.title} 편집`}
                                  onClick={() => navigate(editUrl(entry.id))}
                                >
                                  <Image src={getAgentAssetPath(entry.agentId)} alt="" width={44} height={44} />
                                  <span className={s.entryText}>
                                    <strong>{entry.title}</strong>
                                    <span className={s.subtle}>{agentName(entry.agentId)} · {entry.registration ? `스킬 ${entry.registration.abilitySlot}` : `마커 ${entry.agentMarkers.length + entry.skillMarkers.length}개 · 읽기 전용`}</span>
                                  </span>
                                  <span className={s.mediaType}>
                                    {entry.registration?.media.type === "IMAGE" ? "이미지" : entry.registration ? "영상" : "기존"}
                                  </span>
                                  <span
                                    className={`${s.badge} ${entry.status === "PUBLISHED" ? w.published : entry.status === "REJECTED" ? w.rejected : entry.status === "REVIEW" ? s.review : ""}`}
                                  >
                                    {STATUS_LABELS[entry.status as AdminLineupStatus] ?? entry.status}
                                  </span>
                                  <span className={s.editHint}>편집 →</span>
                                </button>
                                <div className={w.entryActions}>
                                  <label className={w.statusControl}>공개 상태<select
                                    aria-label={`${entry.title} 공개 상태`}
                                    value={entry.status}
                                    disabled={busy}
                                    onChange={event => changeStatus(entry, event.target.value as AdminLineupStatus)}
                                  >
                                    {statuses.map(status => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                                  </select></label>
                                  {entry.status === "PUBLISHED" && <Link
                                    className={s.smallButton}
                                    href={`/lineups/${encodeURIComponent(entry.id)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >사용자 화면 ↗</Link>}
                                  <button
                                    className={`${s.smallButton} ${w.danger}`}
                                    type="button"
                                    disabled={busy}
                                    onClick={() => remove(entry)}
                                  >삭제</button>
                                </div>
                              </div>)}
                          </section>)
                        : <div className={s.empty}>
                          <p>{entries.length ? "조건에 맞는 공략이 없습니다." : "등록된 라인업이 없습니다."}</p>
                          <p>{entries.length ? "다른 검색어나 상태를 선택해 보세요." : "첫 공략의 도착점과 출발 위치를 지정해 보세요."}</p>
                          {entries.length
                            ? <button className={s.secondary} type="button" onClick={() => {
                              setQuery("");
                              setFilter("ALL");
                            }}>검색 조건 초기화</button>
                            : <button className={s.primary} type="button" onClick={() => navigate("/admin/lineups/new")}>새 라인업 등록</button>}
                        </div>}
                    </div>
                  </div>
                  : legacy && record
                    ? <LegacyRecord
                      record={record}
                      busy={busy}
                      onStatus={status => changeStatus(record, status)}
                      onDelete={() => remove(record)}
                    />
                    : <>
                      {selectedDestination && <div className={s.sharedDestination}>
                        <div>
                          <strong>{draft.destination.name}</strong>
                          <span>같은 도착점의 공략 {peers.length + 1}개</span>
                        </div>
                        {record && <button
                          type="button"
                          className={s.smallButton}
                          disabled={busy}
                          onClick={() => navigate(`/admin/lineups/new?destinationFrom=${encodeURIComponent(selectedDestination.id)}`)}
                        >이 도착점에 공략 추가</button>}
                      </div>}
                      {preview
                        ? <div className={s.editorGrid}>
                          <section className={s.previewInfo} aria-label="자료 미리보기">
                            <div>
                              <span className={s.eyebrow}>공략 미리보기</span>
                              <h2>{draft.title || "제목을 입력해 주세요"}</h2>
                            </div>
                            <div className={s.previewIdentity}>
                              <Image src={getAgentAssetPath(draft.agentId)} alt="" width={56} height={56} />
                              <div>
                                <h3>{agentName(draft.agentId)}</h3>
                                <span className={s.subtle}>스킬 {draft.abilitySlot} · {DIFFICULTY_LABELS[draft.difficulty]}</span>
                              </div>
                            </div>
                            <dl className={s.metadata}>
                              <div>
                                <dt>도착점</dt>
                                <dd>{draft.destination.name || "미지정"}</dd>
                              </div>
                              <div>
                                <dt>맵 / 구역</dt>
                                <dd>{mapName(draft.mapId)} / {draft.site}</dd>
                              </div>
                              <div>
                                <dt>진영</dt>
                                <dd>{draft.side === "attack" ? "공격" : "수비"}</dd>
                              </div>
                              <div>
                                <dt>공개 상태</dt>
                                <dd>{STATUS_LABELS[draft.status.toUpperCase() as AdminLineupStatus]}</dd>
                              </div>
                            </dl>
                            <div>
                              <h3>{draft.mediaType === "video" ? "영상 자료" : "이미지 자료"}</h3>
                              {isSafeMediaUrl(draft.mediaUrl)
                                ? <a className={s.mediaLink} href={draft.mediaUrl.trim()} target="_blank" rel="noopener noreferrer">자료 새 창에서 확인 ↗</a>
                                : <p className={s.help}>올바른 자료 주소를 입력해 주세요.</p>}
                            </div>
                            <div>
                              <h3>설명</h3>
                              <p className={s.description}>{draft.notes || "설명을 입력해 주세요."}</p>
                            </div>
                          </section>
                          <PreviewMap key={`preview-${draft.id}-${draft.mapId}`} draft={draft} live />
                        </div>
                        : <form noValidate onSubmit={event => {
                          event.preventDefault();
                          save();
                        }}>
                          <fieldset
                            disabled={busy}
                            className={`${s.editorGrid} ${w.editorFields} ${messagesHidden ? s.validationHidden : ""}`}
                          >
                            <div className={s.formSections}>
                              <section className={s.fields} aria-label="도착점 선택">
                                <div className={s.stepHeading}>
                                  <span>1</span>
                                  <div>
                                    <h3>도착점 선택</h3>
                                    <p>어디에 도착하는 공략인가요?</p>
                                  </div>
                                </div>
                                <div className={s.row}>
                                  <Field label="맵" name="registration-map">
                                    <select
                                      id="registration-map"
                                      value={draft.mapId}
                                      onChange={event => change(changeMap(draft, event.target.value))}
                                    >
                                      {!LINEUP_MAP_OPTIONS.some(map => map.id === draft.mapId) && <option value={draft.mapId}>{draft.mapId}</option>}
                                      {LINEUP_MAP_OPTIONS.map(map => <option key={map.id} value={map.id}>{map.name}</option>)}
                                    </select>
                                  </Field>
                                  <Field label="요원" name="registration-agent">
                                    <select
                                      id="registration-agent"
                                      value={draft.agentId}
                                      onChange={event => {
                                        const ability = ABILITY_OPTIONS[event.target.value]?.[0];
                                        change({ ...draft, agentId: event.target.value, abilityId: ability?.id ?? "", abilitySlot: ability?.slot ?? "E" });
                                      }}
                                    >
                                      {!LINEUP_AGENT_OPTIONS.some(agent => agent.id === draft.agentId) && <option value={draft.agentId}>{draft.agentId}</option>}
                                      {LINEUP_AGENT_OPTIONS.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                                    </select>
                                  </Field>
                                </div>
                                <Field label="도착점" name="registration-destination">
                                  <select
                                    id="registration-destination"
                                    value={selectedDestination ? draft.destination.id : ""}
                                    onChange={event => selectDestination(event.target.value)}
                                  >
                                    <option value="">＋ 새 도착점 지정</option>
                                    {availableDestinations.map(entry => <option key={entry.destination.id} value={entry.destination.id}>{entry.destination.name}</option>)}
                                  </select>
                                </Field>
                                {selectedDestination
                                  ? <p className={s.lockedNote}>
                                    {destinationLocked ? "공유 도착점의 위치는 고정되어 있습니다. 이 공략만 옮기려면 ‘새 도착점 지정’을 선택하세요." : "이 공략만 사용하는 도착점입니다. 지도에서 바로 옮길 수 있습니다."}
                                  </p>
                                  : <Field label="도착점 이름 *" name="registration-destination-name" error={errors.destination}>
                                    <input
                                      id="registration-destination-name"
                                      maxLength={120}
                                      placeholder="예: A 사이트 기본 설치 위치"
                                      value={draft.destination.name}
                                      aria-invalid={!messagesHidden && !!errors.destination}
                                      onChange={event => change({ ...draft, destination: { ...draft.destination, name: event.target.value } })}
                                    />
                                  </Field>}
                                <Field label="스킬" name="registration-ability">
                                  <select
                                    id="registration-ability"
                                    value={(ABILITY_OPTIONS[draft.agentId] ?? []).some(ability => ability.id === draft.abilityId) ? draft.abilityId : "custom"}
                                    onChange={event => {
                                      const ability = ABILITY_OPTIONS[draft.agentId]?.find(item => item.id === event.target.value);
                                      change({ ...draft, abilityId: ability?.id ?? "", abilitySlot: ability?.slot ?? draft.abilitySlot });
                                    }}
                                  >
                                    {(ABILITY_OPTIONS[draft.agentId] ?? []).map(ability => <option key={ability.id} value={ability.id}>{ability.name} ({ability.slot})</option>)}
                                    <option value="custom">직접 입력 / 기존 스킬 ID</option>
                                  </select>
                                </Field>
                                <div className={s.row}>
                                  <Field label="실제 스킬 ID *" name="registration-ability-id" error={errors.abilityId}>
                                    <input
                                      id="registration-ability-id"
                                      value={draft.abilityId}
                                      placeholder="예: sova-recon-bolt"
                                      aria-invalid={!messagesHidden && !!errors.abilityId}
                                      onChange={event => change({ ...draft, abilityId: event.target.value })}
                                    />
                                  </Field>
                                  <Field label="스킬 슬롯" name="registration-slot">
                                    <select
                                      id="registration-slot"
                                      value={draft.abilitySlot}
                                      onChange={event => change({ ...draft, abilitySlot: event.target.value as RegistrationDraft["abilitySlot"] })}
                                    >
                                      {["C", "Q", "E", "X"].map(slot => <option key={slot}>{slot}</option>)}
                                    </select>
                                  </Field>
                                </div>
                              </section>
                              <section className={s.fields} aria-label="공략 자료 입력">
                                <div className={s.stepHeading}>
                                  <span>2</span>
                                  <div>
                                    <h3>출발점과 자료 입력</h3>
                                    <p>지도에 출발점을 찍고 사용 방법을 입력하세요.</p>
                                  </div>
                                </div>
                                <Field label="공략 제목 *" name="registration-title" error={errors.title}>
                                  <input
                                    id="registration-title"
                                    maxLength={160}
                                    value={draft.title}
                                    placeholder="예: A 메인에서 던지는 방법"
                                    aria-invalid={!messagesHidden && !!errors.title}
                                    onChange={event => change({ ...draft, title: event.target.value })}
                                  />
                                </Field>
                                <Field label="공략 설명 *" name="registration-notes" error={errors.notes}>
                                  <textarea
                                    id="registration-notes"
                                    rows={4}
                                    placeholder="서 있는 위치와 사용 순서를 적어 주세요."
                                    value={draft.notes}
                                    aria-invalid={!messagesHidden && !!errors.notes}
                                    onChange={event => change({ ...draft, notes: event.target.value })}
                                  />
                                </Field>
                                <div className={s.row}>
                                  <Field label="자료 형식" name="registration-media-type">
                                    <select
                                      id="registration-media-type"
                                      value={draft.mediaType}
                                      onChange={event => change({ ...draft, mediaType: event.target.value as RegistrationDraft["mediaType"] })}
                                    >
                                      <option value="video">영상 주소</option>
                                      <option value="image">이미지 주소</option>
                                    </select>
                                  </Field>
                                  <Field label="난이도" name="registration-difficulty">
                                    <select
                                      id="registration-difficulty"
                                      value={draft.difficulty}
                                      onChange={event => change({ ...draft, difficulty: event.target.value as RegistrationDraft["difficulty"] })}
                                    >
                                      {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                    </select>
                                  </Field>
                                </div>
                                <Field
                                  label={draft.mediaType === "video" ? "영상 주소 *" : "이미지 주소 *"}
                                  name="registration-url"
                                  error={errors.mediaUrl}
                                >
                                  <input
                                    id="registration-url"
                                    type="url"
                                    maxLength={2048}
                                    placeholder="https://…"
                                    value={draft.mediaUrl}
                                    aria-invalid={!messagesHidden && !!errors.mediaUrl}
                                    onChange={event => change({ ...draft, mediaUrl: event.target.value })}
                                  />
                                </Field>
                                <div className={s.row}>
                                  <Field label="진영" name="registration-side">
                                    <select
                                      id="registration-side"
                                      value={draft.side}
                                      onChange={event => change({ ...draft, side: event.target.value as RegistrationDraft["side"] })}
                                    >
                                      <option value="attack">공격</option>
                                      <option value="defense">수비</option>
                                    </select>
                                  </Field>
                                  <Field label="구역" name="registration-site">
                                    <select
                                      id="registration-site"
                                      value={draft.site}
                                      onChange={event => change({ ...draft, site: event.target.value as RegistrationDraft["site"] })}
                                    >
                                      {["A", "B", "C", "Mid"].map(site => <option key={site}>{site}</option>)}
                                    </select>
                                  </Field>
                                </div>
                                <Field label="공개 상태" name="registration-status">
                                  <select
                                    id="registration-status"
                                    value={draft.status}
                                    onChange={event => change({ ...draft, status: event.target.value as RegistrationDraft["status"] })}
                                  >
                                    {statuses.map(status => <option key={status} value={status.toLowerCase()}>{STATUS_LABELS[status]}</option>)}
                                  </select>
                                </Field>
                                <p className={s.help}>‘공개’로 저장한 공략만 사용자 화면에 표시됩니다.</p>
                              </section>
                            </div>
                            <PreviewMap
                              key={`${draft.id}-${draft.mapId}-${draft.destination.id}`}
                              draft={draft}
                              onChange={change}
                              destinationLocked={destinationLocked}
                              live
                            />
                          </fieldset>
                        </form>}
                      {record && <div className={w.recordActions}>
                        {record.status === "PUBLISHED" && <Link
                          className={s.secondary}
                          href={`/lineups/${encodeURIComponent(record.id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >공개된 사용자 화면 ↗</Link>}
                        <button className={`${s.secondary} ${w.danger}`} type="button" disabled={busy} onClick={() => remove(record)}>공략 삭제</button>
                      </div>}
                    </>}
              </>}
        </section>
      </div>
    </div>
  </AdminPageShell>;
}

function LegacyRecord({ record, busy, onStatus, onDelete }: { record: LineupDetailModel; busy: boolean; onStatus: (status: AdminLineupStatus) => void; onDelete: () => void }) {
  return <section className={s.previewInfo} aria-label="기존 자료 읽기 전용">
    <div>
      <span className={s.eyebrow}>기존 형식 · 읽기 전용</span>
      <h3>{record.title}</h3>
      <p className={s.help}>이 자료는 기존 마커 구성을 그대로 보존합니다. 새 개별 공략 편집기로 자동 변환하지 않습니다. 상태 변경과 삭제는 가능합니다.</p>
    </div>
    <p className={s.description}>{record.description}</p>
    <dl className={s.metadata}>
      <div>
        <dt>맵 / 요원</dt>
        <dd>{mapName(record.mapId)} / {agentName(record.agentId)}</dd>
      </div>
      <div>
        <dt>진영 / 난이도</dt>
        <dd>{record.side === "attack" ? "공격" : "수비"} / {DIFFICULTY_LABELS[record.difficulty]}</dd>
      </div>
    </dl>
    <div className={w.legacyPoints}>
      <h3>출발 마커 {record.agentMarkers.length}개</h3>
      <ol>
        {record.agentMarkers.map((marker, index) => <li key={index}>{marker.label || `출발 ${index + 1}`} · ({marker.position.x}, {marker.position.y})</li>)}
      </ol>
      <h3>스킬 마커 {record.skillMarkers.length}개</h3>
      <ol>
        {record.skillMarkers.map((marker, index) =>
          <li key={index}>{marker.abilityId} · ({marker.position.x}, {marker.position.y}){marker.youtubeUrl && isSafeMediaUrl(marker.youtubeUrl) && <> · <a href={marker.youtubeUrl} target="_blank" rel="noopener noreferrer">영상 자료 ↗</a></>}</li>)}
      </ol>
      <h3>중간 지점 {record.pathPoints.length}개</h3>
      <ol>{record.pathPoints.map((point, index) => <li key={index}>({point.x}, {point.y})</li>)}</ol>
    </div>
    <Field label="공개 상태" name="legacy-status">
      <select
        id="legacy-status"
        disabled={busy}
        value={record.status}
        onChange={event => onStatus(event.target.value as AdminLineupStatus)}
      >
        {statuses.map(status => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
      </select>
    </Field>
    <div className={s.actions}>
      {record.status === "PUBLISHED" && <Link
        className={s.secondary}
        href={`/lineups/${encodeURIComponent(record.id)}`}
        target="_blank"
        rel="noopener noreferrer"
      >사용자 화면 ↗</Link>}
      <button className={`${s.secondary} ${w.danger}`} type="button" disabled={busy} onClick={onDelete}>공략 삭제</button>
    </div>
  </section>;
}
