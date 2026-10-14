import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { DEMO_CODE, isDemoCode, startDemoSession } from "@/features/admin/admin-session";

/**
 * /admin 입구. 실제 관리자 토큰 인증은 백엔드 연결 Task에서 붙이고,
 * 지금은 예시 코드(DEMO1234)로만 관리자 화면을 체험한다 (TASK-FE-055).
 */
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
  const [token, setToken] = useState("");
  const [notice, setNotice] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setNotice("실제 관리자 인증은 백엔드 연결 후 사용할 수 있습니다. 지금은 예시 코드로 체험해 주세요.");
  };

  return (
    <>
      <Link to="/lineups" className="self-start text-14 text-sub hover:text-main">
        ← 라인업 목록
      </Link>
      <CardHeading title="관리자 인증" text="라인업·스모크 작성과 검수는 관리자 인증 후 사용할 수 있습니다." />
      <form onSubmit={submit} className="flex flex-col gap-3">
        <TextField
          label="관리자 토큰"
          type="password"
          autoComplete="off"
          placeholder="ADMIN_API_TOKEN"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          hint="토큰은 현재 브라우저 탭의 세션에만 보관됩니다."
        />
        <Button type="submit" disabled={!token.trim()}>
          관리자 페이지로 이동
        </Button>
        {notice && (
          <p role="status" className="text-13 text-caution">
            {notice}
          </p>
        )}
      </form>
      <button type="button" onClick={onDemo} className="self-start text-14 font-medium text-main hover:text-primary">
        예시 코드로 관리자 화면 체험하기 →
      </button>
    </>
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
    startDemoSession();
    navigate("/admin/lineups");
  };

  return (
    <>
      <CardHeading title="관리자 화면 체험" text="예시 코드로 들어가 라인업·스모크 자료와 지도 경로를 등록해 보세요." />
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
