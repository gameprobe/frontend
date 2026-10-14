import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";

type RiotIdSearchBarProps = {
  onSearch: (value: string) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
};

/** Figma 검색 카드(53:32, 53:275): KR 지역 라벨 + 입력 + 검색 버튼. */
export function RiotIdSearchBar({
  onSearch,
  placeholder = "플레이어 이름#태그",
  defaultValue = "",
  className,
}: RiotIdSearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(value);
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cx(
        "flex h-15 w-full items-center gap-3 rounded-thumb border border-line bg-elevated pr-2 pl-5 focus-within:border-primary",
        className,
      )}
    >
      <span lang="en" className="flex h-4 items-center border-r border-line pr-3 text-14 font-semibold">
        KR
      </span>
      <label className="flex min-w-0 flex-1 px-1">
        <span className="sr-only">Riot ID</span>
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          className="w-full min-w-0 bg-transparent text-ellipsis text-16 text-main outline-none placeholder:text-disabled [&::-webkit-search-cancel-button]:hidden"
        />
      </label>
      <Button type="submit">검색</Button>
    </form>
  );
}
