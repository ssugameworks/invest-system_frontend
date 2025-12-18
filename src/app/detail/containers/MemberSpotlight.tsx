'use client';

import { memo } from 'react';
import Image from 'next/image';

export type TeamMember = {
  id: number;
  name: string;
  department: string;
  avatar?: string;
};

type MemberSpotlightProps = {
  members: TeamMember[];
};

// 개별 멤버 카드 컴포넌트 - 메모이제이션
const MemberCard = memo(function MemberCard({ member }: { member: TeamMember }) {
  const initial = member.name.charAt(0).toUpperCase();

  return (
    <article className="flex flex-col items-center gap-2.5 text-center">
      <div className="flex size-16 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-accent-yellow/20 to-accent-yellow/5 shadow-[0_0_20px_rgba(239,255,143,0.1)] overflow-hidden">
        {member.avatar ? (
          <Image
            src={member.avatar}
            alt={`${member.name} 프로필`}
            width={64}
            height={64}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-xl font-bold text-accent-yellow">
            {initial}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 w-full">
        <p className="text-sm font-semibold text-white whitespace-nowrap">{member.name}</p>
        <p className="text-xs text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis" title={member.department}>
          {member.department}
        </p>
      </div>
    </article>
  );
});

function MemberSpotlight({ members }: MemberSpotlightProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[#151A29] p-5" style={{ position: 'relative', zIndex: 10, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.36)' }}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-white">팀 멤버</h3>
        <p className="text-xs text-text-secondary mt-0.5">{members.length}명</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {members.map(member => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}

export default memo(MemberSpotlight);
