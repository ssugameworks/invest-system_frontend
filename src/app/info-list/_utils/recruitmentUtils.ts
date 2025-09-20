export type RecruitmentStatus = 'recruiting' | 'scheduled' | 'completed';

export const getStatusText = (status: RecruitmentStatus): string => {
  switch (status) {
    case 'recruiting':
      return '모집중';
    case 'scheduled':
      return '모집예정';
    case 'completed':
      return '모집완료';
    default:
      return '모집예정';
  }
};

export const getStatusColor = (status: RecruitmentStatus): string => {
  switch (status) {
    case 'recruiting':
      return '#4097F9';
    case 'scheduled':
      return '#7B7B7B';
    case 'completed':
      return '#87BFFA';
    default:
      return '#7B7B7B';
  }
};
