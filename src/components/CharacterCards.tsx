/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface Character {
  name: string;
  comicRole: string;
  colorName: string;
  colorHex: string;
  points: number;
  description: string;
  quote: string;
  icon: string;
}

const CHARACTERS: Character[] = [
  {
    name: 'Snoopy (史努比)',
    comicRole: '小獵犬主角 · 狗屋守護者',
    colorName: '經典狗屋紅',
    colorHex: '#E74C3C',
    points: 40,
    description: '喜愛躺在紅色狗屋頂上沉思、寫小說或幻想自己是一戰王牌飛行員。在遊戲中為最上層的招牌紅磚塊，分數最高。',
    quote: '「爬得越高，狗屋上的視野越開闊！」',
    icon: '🐾',
  },
  {
    name: 'Woodstock (糊塗塌客)',
    comicRole: '飛行夥伴 · 秘書小鳥',
    colorName: '羽毛金黃',
    colorHex: '#F1C40F',
    points: 30,
    description: '史努比最忠實的知己與好哥們，常常倒著飛或在空中翻滾。擊碎黃色磚塊有高機率掉落珍貴的輔助道具。',
    quote: '「！！！？！！（嘰嘰喳喳翻跟斗）」',
    icon: '🐥',
  },
  {
    name: 'Lucy (露西)',
    comicRole: '心理諮商師 · 棒球外野手',
    colorName: '自信水藍',
    colorHex: '#3498DB',
    points: 20,
    description: '收費5分錢的露天精神諮商攤位老闆，常抽走查理布朗想踢的橄欖球。藍色磚塊穩固排列於中段防線。',
    quote: '「人生就像打棒球，隨時準備接球吧！」',
    icon: '🧢',
  },
  {
    name: 'Linus (萊納斯)',
    comicRole: '哲學家 · 毛毯守護者',
    colorName: '安全感薄荷綠',
    colorHex: '#2ECC71',
    points: 10,
    description: '總是緊抓藍綠色毛毯與吸大拇指的小哲學家，期待著「南瓜大王」的降臨。作為最基礎平易近人的前線磚塊。',
    quote: '「只要抱緊這條毛毯，沒有擋不下來的球。」',
    icon: '🧣',
  },
  {
    name: 'Charlie Brown (查理·布朗)',
    comicRole: '棒球隊經理 · 永遠的圓頭小子',
    colorName: '招牌鋸齒橘黃',
    colorHex: '#E67E22',
    points: 60,
    description: '永不放棄的棒球隊投手，身上穿著經典黑色鋸齒條紋黃衣服。他的特製磚塊需要擊中 2 次才會破碎！',
    quote: '「Good Grief! 這次我一定能投出好球！」',
    icon: '⚾',
  },
];

export const CharacterCards: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 font-['Bangers'] tracking-wide">
          COMIC STRIP CAST
        </h2>
        <div className="mt-1 text-sm text-gray-600 font-bold">
          經典花生漫畫角色 · 磚塊分數與設定
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHARACTERS.map((char) => (
          <div
            key={char.name}
            className="p-5 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0px_#111] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_#111] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-black flex items-center justify-center text-2xl shadow-[2px_2px_0px_#111] shrink-0"
                    style={{ backgroundColor: char.colorHex }}
                  >
                    {char.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 leading-tight">
                      {char.name}
                    </h3>
                    {/* Clean unboxed metadata with typographic dot separator */}
                    <div className="text-xs text-gray-500 font-bold mt-0.5">
                      <span>{char.comicRole}</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span style={{ color: char.colorHex }}>{char.colorName}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl font-black text-gray-900 font-mono tabular-nums">
                    +{char.points}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">分 / 磚塊</div>
                </div>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed mt-3">
                {char.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-200">
              <span className="text-xs italic text-gray-500 font-medium">
                {char.quote}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
