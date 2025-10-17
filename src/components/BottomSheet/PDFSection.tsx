interface PDFSectionProps {
  pdfUrls: string[];
}

export default function PDFSection({ pdfUrls }: PDFSectionProps) {
  return (
    <div className="mb-8">
      <p className="mb-2 font-pretendard text-sm font-light text-text-secondary">
        발표자료
      </p>
      <div className="flex gap-1">
        {pdfUrls.length > 0 ? (
          pdfUrls.slice(0, 2).map((url, index) => (
            <div
              key={index}
              className="h-[7.2rem] w-[11.75rem] overflow-hidden rounded-md bg-background-placeholder"
            >
              <iframe
                src={url}
                className="h-full w-full"
                title={`PDF ${index + 1}`}
              />
            </div>
          ))
        ) : (
          <>
            <div className="h-[7.2rem] w-[11.75rem] rounded-md bg-background-placeholder" />
            <div className="h-[7.2rem] w-[11.75rem] rounded-md bg-background-placeholder" />
          </>
        )}
      </div>
    </div>
  );
}
