
export type PresentationDocument = {
  id: number;
  title: string;
  description?: string;
};

type PresentationMaterialsProps = {
  documents: PresentationDocument[];
};

export default function PresentationMaterials({ documents }: PresentationMaterialsProps) {
  return (
    <section className="rounded-2xl ">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-text-secondary">발표자료</p>
        <span className="text-xs text-text-secondary">{documents.length.toString().padStart(2, '0')}개</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide" role="list">
        {documents.map(document => (
          <article
            key={document.id}
            role="listitem"
            className="flex h-[5.5rem] min-w-[8.75rem] flex-col justify-between rounded-lg border border-white/5 bg-gradient-to-br from-[#1f2431] to-[#10121a] px-3 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          >
            <span className="text-xs font-semibold text-white">{document.title}</span>
            <span className="text-[0.6875rem] text-text-secondary">
              {document.description ?? '미리보기 준비 중'}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

