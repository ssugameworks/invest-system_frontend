interface ResultInfoProp {
  first_line: string;
  second_line: string;
}

export function ResultInfo({ first_line, second_line }: ResultInfoProp) {
  return (
    <div className="font-pretendard flex w-full flex-col gap-[0.375rem] text-left text-[1.25rem] leading-[1.25rem] font-bold tracking-[-0.0256rem] text-black">
      <div>{first_line}</div>
      <div>{second_line}</div>
    </div>
  );
}
