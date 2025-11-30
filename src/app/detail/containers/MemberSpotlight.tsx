export type TeamMember = {
  id: number;
  name: string;
  department: string;
  avatar?: string;
};

type MemberSpotlightProps = {
  members: TeamMember[];
};

export default function MemberSpotlight({ members }: MemberSpotlightProps) {
  return (
    <section className="rounded-2xl  py-3">
      <div className="mt-4 grid grid-cols-3 gap-4">
        {members.map(member => {
          // 이름의 첫 글자를 이니셜로 사용
          const initial = member.name.charAt(0).toUpperCase();
          
          return (
            <article key={member.id} className="flex flex-col items-center gap-2 text-center">
              <div className="flex size-[3.75rem] items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-accent-yellow/20 to-accent-yellow/5">
                <span className="text-xl font-bold text-accent-yellow">
                  {initial}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-[#efff8f]">{member.name}</p>
                <p className="text-xs text-white">{member.department}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

