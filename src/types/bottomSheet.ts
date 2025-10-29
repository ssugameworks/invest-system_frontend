export interface Comment {
  id: string;
  nickname: string;
  studentId: string;
  content: string;
  createdAt?: Date;
}

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  totalInvestment?: string;
  pdfUrls?: string[];
  comments?: Comment[];
}
