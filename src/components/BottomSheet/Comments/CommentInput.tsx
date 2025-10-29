import SendIcon from '@/assets/icons/send.svg';

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}

export default function CommentInput({
  value,
  onChange,
  onSubmit,
  placeholder = '텍스트를 입력해주세요',
}: CommentInputProps) {
  const isInputEmpty = value.trim().length === 0;

  const handleSubmit = () => {
    if (onSubmit && !isInputEmpty) {
      onSubmit();
    }
  };

  return (
    <div className="flex h-11 w-full items-center gap-2.5 rounded-md border border-border-card bg-background px-5 transition-colors duration-200">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent font-pretendard text-base font-light text-white placeholder:text-text-secondary placeholder:opacity-60 focus:outline-none"
        aria-label={placeholder}
      />
      <button
        onClick={handleSubmit}
        disabled={isInputEmpty}
        className="shrink-0 transition-all duration-200"
        aria-label="댓글 제출"
      >
        <SendIcon
          className={`transition-colors duration-200 ${
            isInputEmpty ? 'text-white opacity-40' : 'text-accent-yellow'
          }`}
        />
      </button>
    </div>
  );
}
