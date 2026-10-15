import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { adminLineupApi, clearAdminLineups } from "./admin-lineup-store";
import { clearAdminSmokes, clearDemoSmokes } from "./admin-smoke-store";
import { DEMO_CODE, isDemoCode, startAdminSession, startDemoSession } from "@/features/admin/admin-session";

/** 실제 관리자 인증과 DB를 사용하지 않는 예시 체험을 구분한다. */
export function AdminGatePage() {
  const [step, setStep] = useState<"token" | "demo">("token");

  return (
    <div className="container-page flex justify-center pt-10 pb-20 md:pt-16">
      <Card as="section" className="flex w-full max-w-[480px] flex-col gap-6 p-6 md:p-8">
        {step === "token" ? <TokenCard onDemo={() => setStep("demo")} /> : <DemoCard onBack={() => setStep("token")} />}
      </Card>
    </div>
  );
}

function CardHeading({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p lang="en" className="text-12 font-semibold tracking-wider text-sub-weak">
        GAMEPROBE ADMIN
      </p>
      <h1 className="text-28 font-bold">{title}</h1>
      <p className="text-15 text-sub">{text}</p>
    </div>
  );
}

function TokenCard({ onDemo }: { onDemo: () => void }) {
  const navigate = useNavigate();
  return (
    <>
      <Link to="/lineups" className="self-start text-14 text-sub hover:text-main">← 라인업 목록</Link>
      <CardHeading title="관리자 인증" text="관리자 토큰으로 로그인하면 DB에 저장된 라인업·스모크를 관리할 수 있습니다." />
      <AdminTokenForm onAuthenticated={() => {
        clearAdminLineups(); clearAdminSmokes(); clearDemoSmokes();
        navigate("/admin/lineups");
      }} />
      <button type="button" onClick={onDemo} className="self-start text-14 font-medium text-main hover:text-primary">
        예시 코드로 관리자 화면 체험하기 →
      </button>
    </>
  );
}

/** 인증이 만료되어도 편집 폼을 지우지 않고 같은 자리에서 다시 인증한다. */
export function AdminTokenForm({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [token, setToken] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setNotice("");
    try {
      await adminLineupApi.authenticate(token);
      if (!mounted.current) return;
      startAdminSession(token);
      setToken("");
      onAuthenticated();
    } catch (error) {
      if (!mounted.current) return;
      setNotice(error instanceof Error ? error.message : "관리자 인증에 실패했습니다.");
    } finally {
      submitting.current = false;
      if (mounted.current) setPending(false);
    }
  };
  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <TextField label="관리자 토큰" type="password" autoComplete="off" placeholder="ADMIN_API_TOKEN"
        value={token} onChange={(event) => setToken(event.target.value)} disabled={pending}
        hint="토큰은 현재 브라우저 탭에만 보관되며 로그아웃하면 삭제됩니다." />
      <Button type="submit" disabled={!token.trim() || pending}>{pending ? "인증 확인 중…" : "관리자 인증"}</Button>
      {notice && <p role="alert" className="text-13 text-loss">{notice}</p>}
    </form>
  );
}

function DemoCard({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!isDemoCode(code)) {
      setError("예시 입장 코드가 맞지 않습니다.");
      return;
    }
    clearAdminLineups(); clearAdminSmokes(); clearDemoSmokes();
    startDemoSession();
    navigate("/admin/lineups");
  };

  return (
    <>
      <CardHeading title="관리자 화면 체험" text="예시 코드로 들어가 라인업 경로와 스모크 위치를 등록해 보세요." />
      <form onSubmit={submit} className="flex flex-col gap-3">
        <TextField
          label="예시 입장 코드"
          autoComplete="off"
          placeholder={DEMO_CODE}
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setError("");
          }}
          error={error}
          hint={`체험용 코드: ${DEMO_CODE}`}
        />
        <Button type="submit">예시 화면 들어가기</Button>
      </form>
      <p className="text-13 text-sub">실제 관리자 인증이 아닌 화면 체험입니다. 입력한 자료는 공개되지 않으며 새로고침하면 초기화됩니다.</p>
      <Button variant="secondary" size="md" className="self-start" onClick={onBack}>
        실제 관리자 인증으로 이동
      </Button>
    </>
  );
}
