import { type ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
            <p className="text-14 font-medium text-sub">계정 연결 체험</p>
            <h1 id="login-title" className="text-20 font-semibold md:text-24">
              예시 계정으로 연결 과정을 살펴보세요
            </h1>
          </div>
          <p className="text-15 text-sub">
            실제 Riot 로그인 없이 가상 프로필을 체험해요.
            <br className="hidden sm:inline" /> 연결 상태와 설정은 이 브라우저에만 저장돼요.
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-5">
        <ButtonLink to="/my/consent" size="xl" className="w-full">
          예시 연결 체험
        </ButtonLink>
        <p className="text-12 text-sub-weak">Riot 인증·비밀번호·실제 전적 수집은 하지 않아요.</p>
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
  { key: "matches", required: true, label: "종료된 매치 기록 및 플레이어 통계" },
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
          <p className="text-14 font-medium text-sub">예시 연결 · 동의 화면 체험</p>
          <h1 id="consent-title" className="text-20 font-semibold md:text-24">
            향후 연결 시 필요한 정보예요
          </h1>
        </div>
        <p className="text-15 text-sub">현재는 가상 계정 프로브#KR1로 체험해요. 선택 내용은 실제 개인정보 처리 동의로 사용되지 않으며 Riot에 전송되지 않아요.</p>
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
      <div className="rounded-thumb bg-elevated p-4 text-13 leading-relaxed text-sub">
        <p>실제 서비스에서는 RSO 로그인과 별도 동의를 거쳐 내 전적의 서비스 내 공개 범위를 안내할 예정이에요. 다른 선수의 동의 없는 개인 통계는 공개하지 않아요. 마이페이지에서 예시 연결을 해제할 수 있어요.</p>
        <p className="mt-2" lang="en">Demo only. No Riot sign-in or player-data access. Selections preview future consent; real sharing will require RSO and explicit opt-in.</p>
        <div className="mt-3 flex flex-wrap gap-4 text-primary"><Link to="/privacy" className="hover:underline">개인정보 안내</Link><Link to="/terms" className="hover:underline">이용약관</Link></div>
      </div>
      <div className="flex gap-2">
        <ButtonLink to="/my" variant="secondary" size="xl" className="flex-1">
          취소
        </ButtonLink>
        <Button size="xl" onClick={connect} disabled={!requiredDone} className="flex-1">
          선택하고 예시 연결
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
            <p className="text-14 font-medium text-sub">로그인 실패 화면 예시</p>
            <h1 id="failed-title" className="text-20 font-semibold md:text-24">
              인증이 실패하면 이 화면을 보여드려요
            </h1>
          </div>
          <p className="text-15 text-sub">
            향후 인증 취소·시간 초과를 안내할 화면이에요.
            <br className="hidden sm:inline" /> 현재는 실제 Riot 인증을 실행하지 않아요.
          </p>
        </div>
      </div>
      <ButtonLink to="/my/consent" size="xl" className="w-full">
        연결 예시로 돌아가기
      </ButtonLink>
    </Card>
  );
}
