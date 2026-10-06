"use client";

import { useEffect, useRef, type ReactNode } from "react";
import s from "./MatchDetailDialog.module.css";

interface MatchDetailDialogProps {
  id: string;
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
}

// M04 모달 외곽만 담당한다. native dialog로 배경 접근을 막고,
// 상세 탭/Mock/인라인 표시는 알지 않는다. 닫을 때 원래 목록 위치와 포커스를 돌려준다.
export function MatchDetailDialog({ id, labelledBy, onClose, children }: MatchDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const startedOnBackdrop = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scrollX = window.scrollX, scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const bodyPadding = getComputedStyle(document.body).paddingRight;
    const changes = [
      { style: document.documentElement.style, property: "overflow" },
      { style: document.body.style, property: "overflow" },
      { style: document.body.style, property: "padding-right" },
    ].map(item => ({ ...item, value: item.style.getPropertyValue(item.property), priority: item.style.getPropertyPriority(item.property) }));

    document.documentElement.style.setProperty("overflow", "hidden");
    document.body.style.setProperty("overflow", "hidden");
    if (scrollbarWidth > 0) document.body.style.setProperty("padding-right", `calc(${bodyPadding} + ${scrollbarWidth}px)`);
    dialog.showModal();
    dialog.querySelector<HTMLElement>("[data-detail-close]")?.focus({ preventScroll: true });

    return () => {
      dialog.close();
      for (const { style, property, value, priority } of changes) {
        if (value) style.setProperty(property, value, priority);
        else style.removeProperty(property);
      }
      if (opener?.isConnected) {
        window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
        opener.focus({ preventScroll: true });
      }
    };
    // 탭 변경으로 콜백이 갱신돼도 모달을 재열지 않는다. 열림 수명은 부모의 선택 경기 상태다.
  }, []);

  function isBackdrop(clientX: number, clientY: number) {
    const rect = dialogRef.current?.getBoundingClientRect();
    return !!rect && (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom);
  }

  return <dialog
    id={id} ref={dialogRef} className={s.dialog} aria-labelledby={labelledBy} aria-modal="true"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => {
      if (event.key !== "Tab") return;
      // native dialog의 끝에서 브라우저 주소창으로 빠지는 순환도 막는다.
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea, [tabindex]"))
        .filter(node => node.tabIndex >= 0 && !node.matches(":disabled") && node.getClientRects().length > 0 && getComputedStyle(node).visibility !== "hidden");
      const first = controls[0], last = controls[controls.length - 1];
      const boundary = event.shiftKey ? first : last;
      const destination = event.shiftKey ? last : first;
      if (destination && (document.activeElement === boundary || !event.currentTarget.contains(document.activeElement))) {
        event.preventDefault();
        destination.focus({ preventScroll: true });
      }
    }}
    onPointerDown={event => { startedOnBackdrop.current = event.target === event.currentTarget && isBackdrop(event.clientX, event.clientY); }}
    onPointerCancel={() => { startedOnBackdrop.current = false; }}
    onClick={event => {
      // 상세 안에서 시작한 드래그가 배경에서 끝나도 창을 닫지 않는다.
      if (startedOnBackdrop.current && event.target === event.currentTarget && isBackdrop(event.clientX, event.clientY)) onClose();
      startedOnBackdrop.current = false;
    }}
  >{children}</dialog>;
}
