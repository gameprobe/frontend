import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import alertIcon from "@/assets/icons/alert-lg.svg";
import checkIcon from "@/assets/icons/check.svg";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMockSession } from "@/features/my/my-store";
import { agentIconPath } from "@/lib/assets";
import { cx } from "@/lib/cx";

const CARD = "flex flex-col p-6 md:p-10";

/** 25 마이 - 로그인 전 (Figma 57:1104) */
export function LoginCard() {
  return (
    <Card as="section" aria-labelledby="login-title" className={cx(CARD, "items-center gap-9 text-center")}>
      <div className="flex flex-col items-center gap-8">
        <img src={agentIconPath("sova")} alt="" className="size-[72px] rounded-card object-cover" />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-14 font-medium text-sub">라이엇 계정 연동</p>
            <h1 id="login-title" className="text-20 font-semibold md:text-24">
              로그인하고 내 전적을 바로 확인하세요
            </h1>
          </div>
          <p className="text-15 text-sub">
            연동하면 검색 없이 내 프로필이 자동으로 연결되고,
            <br className="hidden sm:inline" /> 즐겨찾기와 설정이 계정에 저장돼요.
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-5">
        <ButtonLink to="/my/consent" size="xl" className="w-full">
          라이엇 계정으로 로그인
        </ButtonLink>
        <p className="text-12 text-sub-weak">GAMEPROBE는 비밀번호를 저장하지 않아요.</p>
      </div>
    </Card>
  );
}

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  children: ReactNode;
  emphasis?: boolean;
};

function Checkbox({ checked, onChange, label, children, emphasis }: CheckboxProps) {
  return (
    <label className={cx("flex cursor-pointer items-center gap-3", emphasis ? "rounded-thumb bg-elevated p-4" : "px-4 py-3")}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} aria-label={label} className="peer sr-only" />
      <span
        aria-hidden
        className={cx(
          "flex size-[22px] shrink-0 items-center justify-center rounded-md border peer-focus-visible:outline-2 peer-focus-visible:outline-primary",
          checked ? "border-primary bg-primary" : "border-disabled",
        )}
      >
        {checked && <img src={checkIcon} alt="" width={14} height={14} />}
      </span>
      {children}
    </label>
  );
}

const ITEMS = [
  { key: "riotId", required: true, label: "Riot ID 및 태그" },
  { key: "matches", required: true, label: "매치 기록 및 랭크 정보" },
  { key: "region", required: false, label: "계정 지역 정보" },
] as const;

type ItemKey = (typeof ITEMS)[number]["key"];

/** 26 마이 - 정보 제공 동의 (Figma 57:1145). 필수 2개에 동의해야 연결할 수 있다. 처음에는 모두 해제 상태다. */
export function ConsentCard() {
  const navigate = useNavigate();
  const { signIn } = useMockSession();
  const [agreed, setAgreed] = useState<Record<ItemKey, boolean>>({ riotId: false, matches: false, region: false });
  const all = ITEMS.every((item) => agreed[item.key]);
  const requiredDone = ITEMS.every((item) => !item.required || agreed[item.key]);

  const connect = () => {
    signIn(agreed.region);
    navigate("/my");
  };

  return (
    <Card as="section" aria-labelledby="consent-title" className={cx(CARD, "gap-6")}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-14 font-medium text-sub">로그인 · 정보 제공 동의</p>
          <h1 id="consent-title" className="text-20 font-semibold md:text-24">
            GAMEPROBE가 아래 정보를 가져와요
          </h1>
        </div>
        <p className="text-15 text-sub">필수 항목에 동의해야 계정을 연결할 수 있어요.</p>
      </div>
      <div className="flex flex-col gap-2">
        <Checkbox
          checked={all}
          onChange={(checked) => setAgreed({ riotId: checked, matches: checked, region: checked })}
          label="전체 동의"
          emphasis
        >
          <span className="text-16 font-semibold">전체 동의</span>
        </Checkbox>
        <div className="flex flex-col">
          {ITEMS.map((item) => (
            <Checkbox
              key={item.key}
              checked={agreed[item.key]}
              onChange={(checked) => setAgreed((current) => ({ ...current, [item.key]: checked }))}
              label={`${item.required ? "필수" : "선택"} ${item.label}`}
            >
              <span className="text-13 font-semibold text-sub">{item.required ? "필수" : "선택"}</span>
              <span className="text-15">{item.label}</span>
            </Checkbox>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <ButtonLink to="/my" variant="secondary" size="xl" className="flex-1">
          취소
        </ButtonLink>
        <Button size="xl" onClick={connect} disabled={!requiredDone} className="flex-1">
          동의하고 연결
        </Button>
      </div>
    </Card>
  );
}

/** 27 마이 - 로그인 실패 (Figma 57:1211). 실제로는 라이엇 로그인 콜백 오류일 때 이 경로로 보낸다. */
export function LoginFailedCard() {
  return (
    <Card as="section" role="alert" aria-labelledby="failed-title" className={cx(CARD, "items-center gap-9 text-center")}>
      <div className="flex flex-col items-center gap-7">
        <span className="flex size-16 items-center justify-center rounded-card bg-elevated">
          <img src={alertIcon} alt="" width={28} height={28} />
        </span>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-14 font-medium text-sub">로그인 실패</p>
            <h1 id="failed-title" className="text-20 font-semibold md:text-24">
              라이엇 계정 인증이 완료되지 않았어요
            </h1>
          </div>
          <p className="text-15 text-sub">
            로그인 창이 닫혔거나 인증 시간이 지났을 수 있어요.
            <br className="hidden sm:inline" /> 잠시 후 다시 시도해 주세요.
          </p>
        </div>
      </div>
      <ButtonLink to="/my/consent" size="xl" className="w-full">
        다시 시도
      </ButtonLink>
    </Card>
  );
}
