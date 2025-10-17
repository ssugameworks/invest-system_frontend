import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button onClick={onClick} className="absolute left-5 top-[3.4rem] z-10">
      <ChevronLeftIcon />
    </button>
  );
}
