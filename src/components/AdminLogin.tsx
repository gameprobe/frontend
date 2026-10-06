"use client";

import Link from "next/link";
import { AdminPageShell } from "../features/admin/AdminPageShell";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLineupApiErrorMessage, LineupApiError, validateAdminToken } from "../lib/lineup-api";

const ADMIN_TOKEN_KEY = "lineup-admin-token";

export function AdminLogin() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAvailable, setRetryAvailable] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const existingToken = window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (!existingToken) { setIsChecking(false); return; }
    setIsChecking(true);
    setRetryAvailable(false);
    validateAdminToken(existingToken)
      .then(() => { if (active) router.replace("/admin/lineups"); })
      .catch((reason: unknown) => {
        if (!active) return;
        if (reason instanceof LineupApiError && (reason.status === 401 || reason.status === 403)) {
          window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
          setError("저장된 관리자 토큰이 만료되었습니다. 다시 인증해 주세요.");
        } else {
          setError(getLineupApiErrorMessage(reason));
          setRetryAvailable(true);
        }
        setIsChecking(false);
      });
    return () => { active = false; };
  }, [router, retry]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) {
      setError("관리자 토큰을 입력해 주세요.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await validateAdminToken(token.trim());
      window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token.trim());
      router.replace("/admin/lineups");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "관리자 인증에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isChecking) {
    return <AdminPageShell className="admin-access-page"><div className="admin-access-state" role="status">관리자 세션을 확인하는 중입니다…</div></AdminPageShell>;
  }

  return (
    <AdminPageShell className="admin-access-page">
      <section className="admin-login-card">
        <Link className="lineup-back-link" href="/lineups">← 라인업 목록</Link>
        <p className="eyebrow">GameProbe Admin</p>
        <h1>관리자 인증</h1>
        <p>라인업 작성·검수 기능은 관리자 인증 후 사용할 수 있습니다.</p>
        <form onSubmit={submit}>
          <label htmlFor="admin-token">관리자 토큰</label>
          <input
            autoComplete="off"
            id="admin-token"
            onChange={(event) => setToken(event.target.value)}
            placeholder="ADMIN_API_TOKEN"
            type="password"
            value={token}
          />
          {error ? <p className="admin-access-error" role="alert">{error}</p> : null}
          {retryAvailable && <button disabled={isSubmitting} type="button" onClick={() => setRetry(value => value + 1)}>저장된 인증으로 다시 시도</button>}
          <button disabled={isSubmitting} type="submit">{isSubmitting ? "확인 중…" : "관리자 페이지로 이동"}</button>
        </form>
        <small>토큰은 현재 브라우저 탭의 세션에만 보관됩니다.</small>
        <Link className="lineup-back-link" href="/admin/preview">예시 코드로 관리자 화면 체험하기 →</Link>
      </section>
    </AdminPageShell>
  );
}
