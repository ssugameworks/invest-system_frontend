import { redirect } from 'next/navigation';

export default function DetailPage() {
  // detail 페이지는 팀 ID가 필요하므로 main 페이지로 리다이렉트
  redirect('/main');
}
