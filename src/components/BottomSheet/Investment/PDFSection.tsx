import { RefObject } from 'react';

interface PDFSectionProps {
  pdfUrls: string[];
  currentIndex: number;
  onScroll: () => void;
  scrollRef: RefObject<HTMLDivElement>;
}

export default function PDFSection({
  pdfUrls,
  currentIndex,
  onScroll,
  scrollRef,
}: PDFSectionProps) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-pretendard text-base font-light text-text-secondary">
          발표자료
        </p>
        {pdfUrls.length > 0 && (
          <p className="font-pretendard text-xs font-light text-text-secondary">
            {currentIndex + 1} / {pdfUrls.length}
          </p>
        )}
      </div>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex gap-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
      >
        {pdfUrls.length > 0 ? (
          pdfUrls.map((url, index) => (
            <div
              key={index}
              className="h-[7.2rem] w-[11.75rem] flex-shrink-0 snap-start overflow-hidden rounded-md bg-background-placeholder"
            >
              <iframe
                src={url}
                className="h-full w-full pointer-events-none"
                title={`PDF ${index + 1}`}
              />
            </div>
          ))
        ) : (
          <>
            <div className="h-[7.2rem] w-[11.75rem] flex-shrink-0 rounded-md bg-background-placeholder" />
            <div className="h-[7.2rem] w-[11.75rem] flex-shrink-0 rounded-md bg-background-placeholder" />
          </>
        )}
      </div>
    </div>
  );
}
