'use client';

import { memo, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/Skeleton';

// react-pdf는 브라우저에서만 동작하므로 dynamic import 사용 (SSR 비활성화)
const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[480px] md:h-[600px] bg-black/40 rounded-2xl">
      <Skeleton variant="rounded" width="100%" height="100%" animation="wave" />
    </div>
  ),
});

export type PresentationDocument = {
  id: number;
  title: string;
  description?: string;
};

type PresentationMaterialsProps = {
  documents: PresentationDocument[];
  teamName?: string;
  pitchUrl?: string | null;
  teamId?: number;
};

// 팀별 링크 매핑
const TEAM_LINKS: { [key: string]: string } = {
  'TIO': 'https://tiokorea.com/',
  '벤양': 'https://www.notion.so/Team-2c0e64797b098043b6f6d23392bfa700?pvs=21',
  '불개미': 'https://pb-ai-introduce-page.vercel.app/',
  'SLOW': 'https://www.notion.so/FLOW-2025-2c2168fd6877801aadd1d85feb6ad9be?pvs=21',
  '일식이좋아': 'https://www.didimapp.com/',
  '일식이 조아': 'https://www.didimapp.com/',
  '힙72': 'https://avab.shop/',
};

// 문서 카드 컴포넌트
const DocumentCard = memo(function DocumentCard({ document }: { document: PresentationDocument }) {
  return (
    <article
      role="listitem"
      className="flex h-24 min-w-[140px] flex-col justify-between rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent px-4 py-3 hover:border-white/10 hover:from-white/8 transition-all"
    >
      <span className="text-sm font-semibold text-white">{document.title}</span>
      <span className="text-xs text-text-tertiary">
        {document.description ?? '미리보기 준비 중'}
      </span>
    </article>
  );
});

function PresentationMaterials({ documents, teamName, pitchUrl, teamId }: PresentationMaterialsProps) {
  // 프록시 URL 메모이제이션
  const proxyUrl = useMemo(() => {
    return typeof teamId === 'number' ? `/api/teams/${teamId}/pitch` : null;
  }, [teamId]);

  // 팀별 링크 메모이제이션
  const teamLink = useMemo(() => {
    return teamName ? TEAM_LINKS[teamName] : null;
  }, [teamName]);

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
            팀 페이지로 가기 →
          </a>
        )}
      </div>

      {/* PDF 뷰어 (다운로드/인쇄 버튼 없이 자연스럽게) */}
      {proxyUrl ? (
        <div className="mt-4 w-full">
          <PdfViewer url={proxyUrl} userControlled={true} />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide" role="list">
          {documents.map(document => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      )}
    </section>
  );
}

export default memo(PresentationMaterials);
