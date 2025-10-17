import SendIcon from '@/assets/icons/send.svg';

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function CommentInput({
  value,
  onChange,
  onSubmit,
}: CommentInputProps) {
  return (
    <div className="flex h-11 w-full items-center gap-2.5 rounded-md border border-border-card bg-background px-5">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="텍스트를 입력해주세요"
        className="w-full bg-transparent font-pretendard text-sm font-light text-white placeholder:text-[rgba(136,136,136,0.53)] focus:outline-none"
      />
      <button onClick={onSubmit} className="shrink-0">
        <SendIcon />
      </button>
    </div>
  );
}
