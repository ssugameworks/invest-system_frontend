'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import GameworksLogo from '@/assets/icons/gameworks-logo.svg';

export default function LoginPage() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const isFormValid = studentId.length === 8 && password.trim() !== '';

  return (
    <div className="relative w-full h-screen bg-background-card overflow-hidden">
      {/* GAMEWORKS Logo */}
      <div className="absolute left-7 top-9 flex items-center gap-1">
        <GameworksLogo className="w-[1.125rem] h-[1.0625rem]" />
        <p className="font-pretendard font-semibold text-14 text-white leading-none">
          GAMEWORKS
        </p>
      </div>

      {/* Title Section */}
      <div className="absolute left-1/2 top-36 -translate-x-1/2 w-[19.75rem] flex flex-col gap-2.5 items-center text-center">
        <h1 className="font-pretendard font-semibold text-[1.75rem] text-accent-yellow leading-normal animate-neon-glow">
          FLOW : Startup Bridge
        </h1>
        <p className="font-pretendard font-light text-18 text-text-secondary leading-normal">
          The more you explore, the smarter your
          <br />
          dashboard becomes
        </p>
      </div>

      {/* Input Fields */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[20.25rem] w-[19.6875rem] flex flex-col gap-6">
        <TextField
          label="학번"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={8}
          value={studentId}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            if (value.length <= 8) {
              setStudentId(value);
            }
          }}
        />
        <TextField
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <div className="absolute left-1/2 bottom-[2.5625rem] -translate-x-1/2 w-[21.25rem]">
        <Button
          variant={isFormValid ? 'primary' : 'disabled'}
          disabled={!isFormValid}
          className="w-full h-[3.125rem] rounded-[0.625rem] text-16"
        >
          투자시작하기
        </Button>
      </div>
    </div>
  );
}
