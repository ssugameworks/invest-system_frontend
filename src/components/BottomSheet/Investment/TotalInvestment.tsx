interface TotalInvestmentProps {
  amount: string;
}

export default function TotalInvestment({ amount }: TotalInvestmentProps) {
  return (
    <div className="mb-8 mt-[3.3rem]">
      <p className="mb-1 font-pretendard text-lg font-medium text-white">
        총 투자금
      </p>
      <p
        className="font-pretendard text-[2rem] font-semibold text-accent-yellow"
        style={{ textShadow: '0 0 1.25rem #efff8f' }}
      >
        {amount}
      </p>
    </div>
  );
}
