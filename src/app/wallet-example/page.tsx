'use client';

import { useState } from 'react';
import InvestmentWallet from '@/components/InvestmentWallet';

export default function WalletExamplePage() {
  const [balance] = useState('₩50,000');
  const [userName] = useState('우현');
  const [profitRate] = useState('+30%');
  const [rank] = useState(31);

  const handleInvestClick = () => {
    alert('투자 시작하기 버튼 클릭!');
  };

  return (
    <div className="min-h-screen bg-[#141414] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-white text-2xl md:text-3xl font-bold mb-8">
          InvestmentWallet 컴포넌트
        </h1>

        {/* Default Example */}
        <div className="mb-12">
          <h2 className="text-white text-lg md:text-xl mb-4">기본 예시</h2>
          <div className="bg-[#1A1A1A] p-6 rounded-lg flex justify-center">
            <InvestmentWallet
              balance={balance}
              userName={userName}
              profitRate={profitRate}
              rank={rank}
              onInvestClick={handleInvestClick}
            />
          </div>
        </div>

        {/* Mobile Preview */}
        <div className="mb-12">
          <h2 className="text-white text-lg md:text-xl mb-4">
            모바일 화면 미리보기
          </h2>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="text-gray-400 text-sm mb-2">
                iPhone 14 Pro (393x852)
              </div>
              <div
                className="bg-gray-800 rounded-[40px] p-4 border-4 border-gray-700 mx-auto"
                style={{ maxWidth: '393px' }}
              >
                <div
                  className="bg-[#141414] rounded-[30px] overflow-hidden p-6"
                  style={{ height: '600px' }}
                >
                  <div className="text-white text-xl font-bold mb-4">
                    모바일 뷰
                  </div>
                  <InvestmentWallet
                    balance={balance}
                    userName={userName}
                    profitRate={profitRate}
                    rank={rank}
                    onInvestClick={handleInvestClick}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variations */}
        <div className="mb-12">
          <h2 className="text-white text-lg md:text-xl mb-4">다양한 예시</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1A1A1A] p-6 rounded-lg flex justify-center">
              <InvestmentWallet
                balance="₩100,000"
                userName="민수"
                profitRate="+50%"
                rank={5}
                onInvestClick={handleInvestClick}
              />
            </div>
            <div className="bg-[#1A1A1A] p-6 rounded-lg flex justify-center">
              <InvestmentWallet
                balance="₩25,000"
                userName="지은"
                profitRate="-10%"
                rank={120}
                onInvestClick={handleInvestClick}
              />
            </div>
          </div>
        </div>

        {/* Component Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg border border-gray-300">
            <h3 className="text-gray-900 text-lg mb-4">✨ 주요 기능</h3>
            <ul className="text-gray-700 space-y-2">
              <li>💰 현재 보유 자금 표시</li>
              <li>📊 수익률 및 순위 정보</li>
              <li>👛 지갑 아이콘</li>
              <li>🎯 투자 시작 버튼</li>
              <li>📱 반응형 디자인</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-300">
            <h3 className="text-gray-900 text-lg mb-4">🎨 디자인 사양</h3>
            <ul className="text-gray-700 space-y-2">
              <li>
                <span className="font-semibold">크기:</span> 352px × 215px (최대)
              </li>
              <li>
                <span className="font-semibold">Border Radius:</span> 20px
              </li>
              <li>
                <span className="font-semibold">배경색:</span> White
              </li>
              <li>
                <span className="font-semibold">버튼 색:</span> #DAEB4D (노란색)
              </li>
              <li>
                <span className="font-semibold">폰트:</span> 내 자금 18px, 금액
                32px
              </li>
            </ul>
          </div>
        </div>

        {/* Props Documentation */}
        <div className="bg-white p-6 rounded-lg border border-gray-300">
          <h3 className="text-gray-900 text-lg mb-4">📝 Props</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-gray-900">Prop</th>
                  <th className="px-4 py-2 text-gray-900">Type</th>
                  <th className="px-4 py-2 text-gray-900">Default</th>
                  <th className="px-4 py-2 text-gray-900">Description</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-t">
                  <td className="px-4 py-2 font-mono">balance</td>
                  <td className="px-4 py-2">string</td>
                  <td className="px-4 py-2">&quot;₩50,000&quot;</td>
                  <td className="px-4 py-2">보유 자금</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-mono">userName</td>
                  <td className="px-4 py-2">string</td>
                  <td className="px-4 py-2">&quot;사용자&quot;</td>
                  <td className="px-4 py-2">사용자 이름</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-mono">profitRate</td>
                  <td className="px-4 py-2">string</td>
                  <td className="px-4 py-2">&quot;+30%&quot;</td>
                  <td className="px-4 py-2">수익률</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-mono">rank</td>
                  <td className="px-4 py-2">number</td>
                  <td className="px-4 py-2">31</td>
                  <td className="px-4 py-2">현재 순위</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-mono">onInvestClick</td>
                  <td className="px-4 py-2">function</td>
                  <td className="px-4 py-2">-</td>
                  <td className="px-4 py-2">투자 버튼 클릭 핸들러</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-mono">className</td>
                  <td className="px-4 py-2">string</td>
                  <td className="px-4 py-2">&quot;&quot;</td>
                  <td className="px-4 py-2">추가 CSS 클래스</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
