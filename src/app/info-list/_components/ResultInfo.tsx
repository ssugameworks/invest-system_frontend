interface ResultInfoProp {
  num: number;
}

export function ResultInfo({ num }: ResultInfoProp) {
  return (
    <div className="font-pretendard flex w-full flex-col gap-[0.375rem] text-left text-[1.25rem] leading-[1.25rem] font-bold tracking-[-0.0256rem] text-black">
      <div className="flex">
        여기&nbsp;<p className="text-[#4097F9]">내 조건</p>에 딱 맞는
      </div>
      <div className="flex">
        장학 공고&nbsp;<p className="text-[#4097F9]">{num}개</p>를 찾았어요!
      </div>
    </div>
  );
}
