
export type PresentationDocument = {
  id: number;
  title: string;
  description?: string;
};

type PresentationMaterialsProps = {
  documents: PresentationDocument[];
  teamName?: string;
};

// 팀별 링크 매핑
const TEAM_LINKS: { [key: string]: string } = {
  '벤양': 'https://www.notion.so/Team-2c0e64797b098043b6f6d23392bfa700?source=copy_link',
  '일식이 조아': 'https://didimapp.com',
  '힙72': 'https://avab.shop',
  '불개미': 'https://pb-ai-introduce-page.vercel.app/',
};

export default function PresentationMaterials({ documents, teamName }: PresentationMaterialsProps) {
  const teamLink = teamName ? TEAM_LINKS[teamName] : null;

  return (
    <section className="rounded-[24px] border border-white/10 bg-[#151A29] p-5" style={{ position: 'relative', zIndex: 10, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.36)' }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">발표자료</h3>
          <p className="text-xs text-text-secondary mt-0.5">{documents.length}개 문서</p>
        </div>
        {teamLink && (
          <a
            href={teamLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white hover:bg-white/10 hover:border-accent-yellow/30 transition-all"
          >
            팀 페이지 →
          </a>
        )}
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide" role="list">
        {documents.map(document => (
          <article
            key={document.id}
            role="listitem"
            className="flex h-24 min-w-[140px] flex-col justify-between rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent px-4 py-3 hover:border-white/10 hover:from-white/8 transition-all"
          >
            <span className="text-sm font-semibold text-white">{document.title}</span>
            <span className="text-xs text-text-tertiary">
              {document.description ?? '미리보기 준비 중'}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

