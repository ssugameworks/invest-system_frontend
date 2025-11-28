import Image from 'next/image';

export type TeamMember = {
  id: number;
  name: string;
  department: string;
  avatar: string;
};

type MemberSpotlightProps = {
  members: TeamMember[];
};

export default function MemberSpotlight({ members }: MemberSpotlightProps) {
  return (
    <section className="rounded-2xl  py-3">
      <div className="mt-4 grid grid-cols-3 gap-4">
        {members.map(member => (
          <article key={member.id} className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-[3.75rem] items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
              <Image
                src={member.avatar}
                alt={`${member.name} 프로필 사진`}
                width={60}
                height={60}
                sizes="60px"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-[#efff8f]">{member.name}</p>
              <p className="text-xs text-white">{member.department}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

