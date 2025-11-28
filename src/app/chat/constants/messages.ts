export type ChatMessage = {
  id: string;
  sender: string;
  time: string;
  content: string;
};

export const CHAT_MESSAGES: readonly ChatMessage[] = [
  {
    id: 'message-1',
    sender: '상도동 콩콩이 (202418XX)',
    time: '10:35',
    content: '요호 좋은데 좋은데',
  },
  {
    id: 'message-2',
    sender: '상도동 콩콩이 (202418XX)',
    time: '10:35',
    content: [
      '길게 쓰면 이렇게 이렇게 저렇게 저렇게',
      '이렇게 저렇게 막 이렇게 되겠죠?',
      '길게 쓰면 이렇게 이렇게 저렇게 저렇게 이렇게 저렇게 막 이렇게 되겠죠?',
      '길게 쓰면 이렇게 이렇게 저렇게 저렇게 이렇게 저렇게 막 이렇게 되겠죠?',
    ].join('\n'),
  },
  {
    id: 'message-3',
    sender: '상도동 콩콩이 (202418XX)',
    time: '10:35',
    content: '요호 좋은데 좋은데',
  },
  {
    id: 'message-4',
    sender: '상도동 콩콩이 (202418XX)',
    time: '10:35',
    content: '요호 좋은데 좋은데',
  },
  {
    id: 'message-5',
    sender: '상도동 콩콩이 (202418XX)',
    time: '10:35',
    content: '요호 좋은데 좋은데',
  },
  {
    id: 'message-6',
    sender: '상도동 콩콩이 (202418XX)',
    time: '10:35',
    content: '요호 좋은데 좋은데',
  },
] as const;

