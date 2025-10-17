export interface Comment {
  nickname: string;
  studentId: string;
  content: string;
}

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  totalInvestment?: string;
  pdfUrls?: string[];
  comments?: Comment[];
}
