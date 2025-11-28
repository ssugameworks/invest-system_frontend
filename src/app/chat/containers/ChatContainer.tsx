'use client';

import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import ChatMessageCard from './ChatMessageCard';
import ChatInputBar from './ChatInputBar';
import { CHAT_MESSAGES } from '../constants/messages';

export default function ChatContainer() {
  const router = useRouter();

  const handleSubmit = (message: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[ChatContainer] message submitted', message);
    }
  };
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen w-full justify-center bg-[#050d18] px-3 py-6 text-white">
      <div className="relative flex w-full max-w-[420px] flex-col rounded-[28px] pb-6">
        <Header label="채팅" onBack={handleBack} />

        <div className="mt-10 flex flex-1 flex-col gap-4 pb-32">
          {CHAT_MESSAGES.map((message) => (
            <ChatMessageCard
              key={message.id}
              sender={message.sender}
              time={message.time}
              content={message.content}
            />
          ))}
        </div>

        <div className="sticky w-full bottom-6 z-10 mt-auto flex justify-center bg-[#050d18] pb-2 pt-4">
          <ChatInputBar onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

