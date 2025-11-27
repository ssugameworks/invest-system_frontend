import GameworksLogo from '@/assets/icons/gameworks-logo.svg';

type HeaderProps = {
  label?: string;
  className?: string;
};

export default function Header({ label = 'GAMEWORKS', className = '' }: HeaderProps) {
  return (
    <header
      className={`flex items-center gap-1 text-white ${className}`}
      aria-label={`${label} 헤더`}
      data-node-id="4595:326"
    >
      <GameworksLogo
        className="h-[1.0625rem] w-[1.125rem]"
        aria-hidden="true"
        focusable="false"
      />
      <span className="font-pretendard text-14 font-semibold leading-none tracking-[0.02em] uppercase">
        {label}
      </span>
    </header>
  );
}

