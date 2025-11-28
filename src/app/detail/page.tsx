import { redirect } from 'next/navigation';
import { DEFAULT_TEAM_NAME } from './detailData';

export default function DetailPage() {
  redirect(`/detail/${encodeURIComponent(DEFAULT_TEAM_NAME)}`);
}
