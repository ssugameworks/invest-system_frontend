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
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
