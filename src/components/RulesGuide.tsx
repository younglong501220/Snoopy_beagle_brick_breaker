/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const RulesGuide: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 font-['Bangers'] tracking-wide">
          HOW TO PLAY
        </h2>
        <div className="mt-1 text-sm text-gray-600 font-bold">
          遊戲規則 · 狗屋物理角度 · 漫畫連擊升調機制
        </div>
      </div>

      <div className="space-y-4">
        {/* Panel 1: Doghouse Angle Bounce */}
        <div className="p-5 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0px_#111]">
          <h3 className="text-base font-black text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[#E53935] text-white flex items-center justify-center text-xs font-mono">1</span>
            狗屋斜面反射物理機制 (Roof Angle Physics)
          </h3>
          <p className="text-xs text-gray-700 leading-relaxed">
            小獵犬的紅色狗屋屋頂並非死板的水平直線，而是採用經典斜面造型。當棒球擊中<strong>狗屋正中心</strong>時，球體將以垂直角度筆直向上反彈；擊中<strong>左右斜面兩側邊緣</strong>時，球體則會呈現大角度（最高約 75 度）的高速斜彈，藉此瞄準難以觸及的側邊與頂部磚塊！
          </p>
        </div>

        {/* Panel 2: Musical Combo Scale */}
        <div className="p-5 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0px_#111]">
          <h3 className="text-base font-black text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[#F1C40F] text-black flex items-center justify-center text-xs font-mono">2</span>
            五聲音階升調連擊系統 (Ascending Combo Audio)
          </h3>
          <p className="text-xs text-gray-700 leading-relaxed">
            遊戲內建 Web Audio API 微型合成音效晶片，每次擊碎磚塊若在 2.5 秒內連續擊中下一塊磚，將觸發連擊倍數加成（最高 5 倍得分），並伴隨五聲音階（C4 → D4 → E4 → G4 → A4 → C5...）自動爬升的高昂樂音，達到高連擊時畫面更會彈出「SMAAASH!」等美式漫畫擬聲詞！
          </p>
        </div>

        {/* Panel 3: Responsive Controls */}
        <div className="p-5 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0px_#111]">
          <h3 className="text-base font-black text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[#3498DB] text-white flex items-center justify-center text-xs font-mono">3</span>
            全方位多元操作模式 (Multi-Platform Controls)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
            <div className="p-3 bg-gray-50 border-2 border-black rounded-lg">
              <div className="font-black text-gray-900 mb-1">🖱️ 電腦滑鼠</div>
              <div className="text-gray-600">在畫布上左右平移游標，狗屋將精準即時跟隨游標水平位置。</div>
            </div>
            <div className="p-3 bg-gray-50 border-2 border-black rounded-lg">
              <div className="font-black text-gray-900 mb-1">⌨️ 鍵盤按鍵</div>
              <div className="text-gray-600">左右方向鍵 或 A / D 鍵平滑移動；空白鍵發射/重開；P 鍵暫停。</div>
            </div>
            <div className="p-3 bg-gray-50 border-2 border-black rounded-lg">
              <div className="font-black text-gray-900 mb-1">📱 手機/平板觸控</div>
              <div className="text-gray-600">直接於螢幕畫布手指滑動，或使用畫面下方的左右按鈕進行靈活點按。</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
