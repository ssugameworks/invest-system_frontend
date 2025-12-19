'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Skeleton } from '@/components/Skeleton';

// PDF.js 워커 설정 (react-pdf가 사용하는 버전과 일치)
if (typeof window !== 'undefined') {
  // react-pdf가 내부적으로 사용하는 pdfjs-dist 버전(5.4.296)의 worker 사용
  // public 폴더에 복사한 worker 파일 사용
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

// PDF options를 컴포넌트 외부로 이동하여 항상 같은 참조 유지
const PDF_OPTIONS = {
  cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/cmaps/',
  cMapPacked: true,
  standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/standard_fonts/',
} as const;

type PdfViewerProps = {
  url: string;
  className?: string;
  externalPageNumber?: number; // 외부에서 제어하는 페이지 번호
  onPageChange?: (pageNumber: number) => void; // 페이지 변경 콜백
  userControlled?: boolean; // 외부에서 제어하는 수동 모드 여부
  onUserControlledChange?: (controlled: boolean) => void; // 수동 모드 변경 콜백
};

export default function PdfViewer({ url, className = '', externalPageNumber, onPageChange, userControlled: externalUserControlled, onUserControlledChange }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(externalPageNumber || 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState(1280); // 1920x1080 비율 기준
  const [pageHeight, setPageHeight] = useState(720); // 1920x1080 비율 기준
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  // 외부에서 userControlled를 제어하는 경우 외부 값을 사용
  // undefined인 경우 (detail 페이지 등)는 항상 수동 모드로 간주
  const userControlled = externalUserControlled !== undefined ? externalUserControlled : true;
  const containerRef = useRef<HTMLDivElement>(null);
  const innerContainerRef = useRef<HTMLDivElement>(null);
  const wheelHandlerRef = useRef<((e: WheelEvent) => void) | null>(null);
  // ⭐ 최적화: 중첩된 timeout cleanup을 위한 ref
  const fadeInTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    setDocumentLoaded(true);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF 로드 실패:', error);
    setError('PDF를 불러올 수 없습니다.');
    setLoading(false);
  }

  useEffect(() => {
    // URL이 변경되면 초기화
    setPageNumber(externalPageNumber || 1);
    setLoading(true);
    setError(null);
    setDocumentLoaded(false);
    // 외부에서 userControlled를 제어하는 경우에만 콜백 호출
    if (onUserControlledChange && externalUserControlled !== undefined) {
      onUserControlledChange(false); // URL이 변경되면 사용자 제어 모드 초기화
    }
  }, [url]); // url만 의존성으로 설정

  // externalPageNumber가 변경되면 내부 pageNumber도 업데이트 (부드러운 전환)
  // 단, 사용자가 수동 모드를 켠 경우에는 완전히 무시
  useEffect(() => {
    // 사용자가 수동 모드를 켠 경우에는 externalPageNumber 변경을 완전히 무시
    if (userControlled) {
      return;
    }
    
    // externalPageNumber가 없거나 undefined면 무시
    if (externalPageNumber === undefined || externalPageNumber === null) return;
    
    // 이미 같은 페이지면 무시
    if (externalPageNumber === pageNumber) {
      return;
    }
    
    setIsPageTransitioning(true);
    // fade out 효과를 위한 짧은 지연 (더 빠른 반응을 위해 100ms로 단축)
    const timeoutId = setTimeout(() => {
      setPageNumber(externalPageNumber);
      // fade in 효과를 위한 추가 지연
      // ⭐ 최적화: 중첩된 timeout도 ref로 추적하여 cleanup
      if (fadeInTimeoutRef.current) {
        clearTimeout(fadeInTimeoutRef.current);
      }
      fadeInTimeoutRef.current = setTimeout(() => {
        setIsPageTransitioning(false);
        fadeInTimeoutRef.current = null;
      }, 30);
    }, 100);
    return () => {
      clearTimeout(timeoutId);
      // ⭐ 최적화: 중첩된 timeout도 cleanup
      if (fadeInTimeoutRef.current) {
        clearTimeout(fadeInTimeoutRef.current);
        fadeInTimeoutRef.current = null;
      }
    };
  }, [externalPageNumber, pageNumber, userControlled]);

  // 수동 모드로 전환할 때 현재 externalPageNumber로 동기화
  const prevUserControlledRef = useRef(userControlled);
  useEffect(() => {
    // 수동 모드로 전환하는 순간 (false -> true)
    if (!prevUserControlledRef.current && userControlled) {
      // 수동 모드로 전환할 때 항상 externalPageNumber로 동기화 (같은 값이어도)
      if (externalPageNumber !== undefined && externalPageNumber !== null) {
        setPageNumber(externalPageNumber);
      }
    }
    prevUserControlledRef.current = userControlled;
  }, [userControlled, externalPageNumber]);

  // 모달 열림/닫힘 시 body 스크롤 제어 및 키보드 이벤트 처리
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsModalOpen(false);
        } else if (e.key === 'ArrowLeft' && numPages) {
          if (onUserControlledChange) {
            onUserControlledChange(true);
          }
          const newPage = Math.max(1, pageNumber - 1);
          setPageNumber(newPage);
          onPageChange?.(newPage);
        } else if (e.key === 'ArrowRight' && numPages) {
          if (onUserControlledChange) {
            onUserControlledChange(true);
          }
          const newPage = Math.min(numPages, pageNumber + 1);
          setPageNumber(newPage);
          onPageChange?.(newPage);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isModalOpen, numPages]);

  // 스크롤 방지를 위한 wheel/touchmove 이벤트 핸들러 (passive 이벤트 리스너 문제 해결)
  useEffect(() => {
    const element = innerContainerRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    // passive: false로 등록하여 preventDefault 가능하게 함
    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // 1920x1080 비율 유지하면서 반응형으로 크기 계산 (실제 컨테이너 크기 기준)
  useEffect(() => {
    const updateSize = () => {
      if (innerContainerRef.current) {
        // 내부 컨테이너의 실제 너비 측정 (padding 포함된 상태)
        const innerRect = innerContainerRef.current.getBoundingClientRect();
        // 내부 padding 16px씩 좌우 = 32px 제외
        const availableWidth = innerRect.width - 32;
        
        // PDF width를 컨테이너에 맞게 설정 (98% 사용, 최대 1800px)
        const finalWidth = Math.min(availableWidth * 0.98, 1800);
        
        // 1920:1080 비율로 height 계산
        const finalHeight = finalWidth * 0.5625;
        
        setPageWidth(finalWidth);
        setPageHeight(finalHeight);
      }
    };

    // 초기 크기 계산을 위해 약간의 지연
    const timeoutId = setTimeout(updateSize, 100);
    window.addEventListener('resize', updateSize);
    
    // ResizeObserver로 컨테이너 크기 변화 감지
    const resizeObserver = new ResizeObserver(updateSize);
    if (innerContainerRef.current) {
      resizeObserver.observe(innerContainerRef.current);
    }
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateSize);
      resizeObserver.disconnect();
    };
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-black/40 rounded-2xl ${className}`} style={{ aspectRatio: '16/9', minHeight: '450px' }}>
        <p className="text-text-secondary text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col items-center bg-black/40 rounded-2xl overflow-hidden ${className}`}
    >
      <div 
        ref={innerContainerRef}
        className="w-full overflow-hidden flex justify-center bg-[#0a0a0a] p-4 cursor-pointer"
        style={{ 
          height: `${pageHeight}px`,
        }}
        onClick={() => setIsModalOpen(true)}
      >
        {loading && !documentLoaded && (
          <div className="flex items-center justify-center w-full" style={{ height: `${pageHeight}px` }}>
            <Skeleton variant="rounded" width="100%" height="100%" animation="wave" />
          </div>
        )}
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className="flex flex-col items-center"
          options={PDF_OPTIONS}
        >
          {documentLoaded && numPages && (
            <div 
              className={`transition-opacity duration-300 ease-in-out ${
                isPageTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
              key={pageNumber}
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg"
                width={pageWidth}
              />
            </div>
          )}
        </Document>
      </div>

      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center gap-4 p-3 bg-black/60 border-t border-white/10 w-full">
          <button
            onClick={() => {
              const newPage = Math.max(1, pageNumber - 1);
              setIsPageTransitioning(true);
              // ⭐ 최적화: timeout ref로 cleanup 가능하도록
              const timeoutId1 = setTimeout(() => {
                setPageNumber(newPage);
                onPageChange?.(newPage);
                const timeoutId2 = setTimeout(() => {
                  setIsPageTransitioning(false);
                }, 50);
                // cleanup은 컴포넌트 언마운트 시 자동으로 처리됨 (이벤트 핸들러 내부)
              }, 150);
              // 이벤트 핸들러 내부이므로 cleanup은 선택적
            }}
            disabled={pageNumber <= 1 || !userControlled}
            className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            이전
          </button>
          <span className="text-sm text-text-secondary">
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => {
              const newPage = Math.min(numPages, pageNumber + 1);
              setIsPageTransitioning(true);
              // ⭐ 최적화: timeout ref로 cleanup 가능하도록
              const timeoutId1 = setTimeout(() => {
                setPageNumber(newPage);
                onPageChange?.(newPage);
                const timeoutId2 = setTimeout(() => {
                  setIsPageTransitioning(false);
                }, 50);
                // cleanup은 컴포넌트 언마운트 시 자동으로 처리됨 (이벤트 핸들러 내부)
              }, 150);
              // 이벤트 핸들러 내부이므로 cleanup은 선택적
            }}
            disabled={pageNumber >= numPages || !userControlled}
            className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            다음
          </button>
        </div>
      )}

      {/* PDF 모달 - 고정된 높이의 상단 부분만 화면 중앙에 크게 표시 */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="flex items-center justify-center w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {documentLoaded && numPages ? (
              (() => {
                // 모달에서는 더 크게 표시 (화면 너비의 95%, 최대 1920px)
                const modalWidth = typeof window !== 'undefined' 
                  ? Math.min(window.innerWidth * 0.95, 1920) 
                  : 1920;
                const modalHeight = modalWidth * 0.5625; // 1920:1080 비율
                
                return (
                  <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={null}
                    className="flex flex-col items-center"
                    options={PDF_OPTIONS}
                  >
                    <div
                      className="overflow-hidden"
                      style={{
                        width: `${modalWidth}px`,
                        height: `${modalHeight}px`,
                      }}
                    >
                      {documentLoaded && numPages && (
                        <div 
                          className={`transition-opacity duration-300 ease-in-out ${
                            isPageTransitioning ? 'opacity-0' : 'opacity-100'
                          }`}
                          key={pageNumber}
                        >
                          <Page
                            pageNumber={pageNumber}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="shadow-lg"
                            width={modalWidth}
                          />
                        </div>
                      )}
                    </div>
                  </Document>
                );
              })()
            ) : (
              <div className="flex items-center justify-center w-full" style={{ minHeight: '400px' }}>
                <Skeleton variant="rounded" width="100%" height="100%" animation="wave" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

