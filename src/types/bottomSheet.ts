export interface Comment {
  id: number;
  nickname: string;
  studentId: number;
  content: string;
  createdAt?: string | Date;
}

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  totalInvestment?: number;
  pdfUrls?: string[];
  comments?: Comment[];
}
