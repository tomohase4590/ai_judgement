import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Dices, Sparkles, PartyPopper as Party, StopCircle } from 'lucide-react';

interface TopicSelectorProps {
  onSelect: (topic: string) => void;
}

const DEBATE_TOPICS = [
  "カレーに生卵はアリかナシか",
  "ピザにパイナップルはアリかナシか",
  "お風呂とシャワーどっちが優れているか",
  "アイスは噛むべきか溶かすべきか",
  "寿司のシャリは大きいのと小さいのどっちがいいか",
  "ラーメンのスープは全部飲むべきか",
  "コンビニのおでんは認めるべきか",
  "納豆は混ぜるべきか混ぜないべきか",
  "たこ焼きはソースと醤油どっちが正解か",
  "カップラーメンの残り汁は飲むべきか",
  "おにぎりの具で最強なのは何か",
  "アイスクリームは冬でも食べていいのか",
  "チョコミントは邪道か否か",
  "お好み焼きにご飯はありか",
  "サイゼリヤはデートに使っていいのか",
  "回転寿司は一人で行っていいのか",
  "ステーキは焼き加減どれが正解か",
  "マヨネーズは何にでもかけていいのか",
  "ケチャップご飯は認められるべきか",
  "コーヒーはブラックで飲むべきか",
  "天ぷらは塩派か醤油派か",
  "うどんの汁は全部飲むべきか",
  "ハンバーガーは手で食べるべきか",
  "アイスクリームはコーンと容器どっちが正解か",
  "ポテトチップスは箸で食べるべきか",
  "カップ麺の待ち時間3分は守るべきか",
  "どん兵衛は東日本と西日本どっちが正解か",
  "ファミレスのドリンクバーは何杯飲むべきか",
  "ラーメンの具は全部入れるべきか",
  "牛丼は紅しょうがを入れるべきか"
];

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

export default function TopicSelector({ onSelect }: TopicSelectorProps) {
  const [spinning, setSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isSlowingDown, setIsSlowingDown] = useState(false);

  const clearTimeouts = () => {
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
  };

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const createConfetti = () => {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 2000);
  };

  const stopRoulette = () => {
    if (!spinning || isSlowingDown) return;
  
    setIsSlowingDown(true);
    clearTimeouts();
  
    // 減速フェーズ
    let speed = 100;
    let currentIndex = displayedIndex;
  
    const slowDown = () => {
      currentIndex = (currentIndex + 1) % DEBATE_TOPICS.length;
      setDisplayedIndex(currentIndex); // 表示インデックスだけを更新
  
      if (speed < 500) { // 完全に停止する前の最大遅延
        speed += 50;
        spinTimeoutRef.current = setTimeout(slowDown, speed);
      } else {
        setSpinning(false);
        setIsSlowingDown(false);
        setShowSparkles(true);
  
        // 紙吹雪のエフェクト
        for (let i = 0; i < 30; i++) {
          setTimeout(createConfetti, Math.random() * 1000);
        }
  
        // 最終的なテーマ選択
        setSelectedIndex(currentIndex); // 最終的に選ばれるトピックを確定
      }
    };
  
    slowDown();
  };
  
  const spinRoulette = () => {
    if (spinning) return;
  
    setSpinning(true);
    setShowSparkles(false);
    setIsSlowingDown(false);
  
    // // 紙吹雪のアニメーション
    // for (let i = 0; i < 50; i++) {
    //   setTimeout(createConfetti, Math.random() * 2000);
    // }
  
    // 高速回転フェーズ
    spinIntervalRef.current = setInterval(() => {
      setDisplayedIndex(prev => (prev + 1) % DEBATE_TOPICS.length); // 表示インデックスを更新
    }, 50);
  
    // 自動停止タイマー（10秒後）
    spinTimeoutRef.current = setTimeout(() => {
      if (!isSlowingDown) {
        stopRoulette();
      }
    }, 10000);
  };
  

  const handleSelect = () => {
    onSelect(DEBATE_TOPICS[selectedIndex]);
  };

  return (
    <div className="space-y-8">
      <style>
        {`
          @keyframes sparkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes confetti-fall {
            0% { transform: translateY(-100vh) rotate(0deg); }
            100% { transform: translateY(100vh) rotate(360deg); }
          }
          .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            top: -10px;
            animation: confetti-fall 2s linear forwards;
            z-index: 50;
          }
          .topic-float {
            animation: float 4s ease-in-out infinite;
          }
          .sparkle-animation {
            animation: sparkle 1s ease-in-out infinite;
          }
        `}
      </style>

      <div className="relative bg-white rounded-2xl shadow-2xl p-8 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100 via-yellow-100 to-orange-100 opacity-50" />
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400" />
        
        <div className="relative">
          <div className="text-center mb-8 topic-float">
            <h3 className="text-3xl font-bold text-orange-600 mb-2 tracking-wide">
              ディベートトピック
              {showSparkles && (
                <Sparkles className="inline-block ml-2 w-6 h-6 text-yellow-400 sparkle-animation" />
              )}
            </h3>
            <p className="text-gray-600 text-lg">
              面白いトピックで白熱の議論を始めましょう！
            </p>
          </div>

          <div className={`bg-gradient-to-br from-white to-orange-50 rounded-xl p-8 mb-6 shadow-lg border-2 border-orange-200 transition-all duration-300 ${
            spinning ? 'scale-105 shadow-xl' : ''
          }`}>
            <p className="text-2xl font-bold text-center text-gray-800 min-h-[2.5em] flex items-center justify-center leading-relaxed">
              {DEBATE_TOPICS[displayedIndex]}
            </p>
          </div>

          <div className="flex gap-4">
            {spinning ? (
              <button
                onClick={stopRoulette}
                disabled={isSlowingDown}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                <StopCircle className="w-6 h-6" />
                {isSlowingDown ? '停止中...' : 'ストップ！'}
              </button>
            ) : (
              <button
                onClick={spinRoulette}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center justify-center gap-2 text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                <Dices className="w-6 h-6" />
                ルーレットを回す
              </button>
            )}

            <button
              onClick={handleSelect}
              disabled={spinning}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              <Party className="w-6 h-6" />
              議論を始める
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}