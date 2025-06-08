import React, { useState, useEffect } from 'react';
import { MessageSquare, Award, Users, Sparkles, Heart, Star, Rocket } from 'lucide-react';
import TopicSelector from './components/TopicSelector';
import DebateRoom from './components/DebateRoom';
import JudgementScreen from './components/JudgementScreen';
import { JudgementResult } from './types'; 

function App() {
  const [step, setStep] = useState<'intro' | 'topic' | 'debate' | 'judgement'>('intro');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [judgementResult, setJudgementResult] = useState<JudgementResult | null>(null);  // ここでnullを許容
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowContent(true);
    }, 500);
  }, []);

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setStep('debate');
  };

  const handleDebateComplete = (result: JudgementResult) => {
    setJudgementResult(result);  // 結果を引数として受け取る
    console.log(result);  // 結果をコンソールに表示
    setStep('judgement');
  };
  const startApp = () => {
    setStep('topic');
  };

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center">
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-20px); }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes fadeSlideIn {
              from { 
                opacity: 0;
                transform: translateY(20px);
              }
              to { 
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes sparkle {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(1.2); }
            }
            .floating {
              animation: float 3s ease-in-out infinite;
            }
            .bouncing {
              animation: bounce 2s ease-in-out infinite;
            }
            .spinning {
              animation: spin 10s linear infinite;
            }
            .fade-slide-in {
              animation: fadeSlideIn 0.8s ease-out forwards;
            }
            .sparkle-icon {
              animation: sparkle 2s ease-in-out infinite;
            }
            .delayed-1 { animation-delay: 0.2s; }
            .delayed-2 { animation-delay: 0.4s; }
            .delayed-3 { animation-delay: 0.6s; }
            .delayed-4 { animation-delay: 0.8s; }
          `}
        </style>

        <div className="text-center space-y-8 p-8">
          <div className="relative mb-12">
            {/* 装飾アイコン */}
            <Star className="absolute -top-16 -left-16 w-12 h-12 text-yellow-400 spinning" />
            <Heart className="absolute -top-8 -right-16 w-10 h-10 text-pink-400 bouncing" />
            <Rocket className="absolute -bottom-8 -right-16 w-12 h-12 text-blue-400 floating" />
            <Sparkles className="absolute -bottom-16 -left-16 w-10 h-10 text-orange-400 sparkle-icon" />
            
            {/* メインタイトル */}
            <div className={`space-y-4 ${showContent ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400 fade-slide-in">
                ディベート
              </h1>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 fade-slide-in delayed-1">
                ジャッジAI
              </h2>
            </div>
          </div>

          {/* アイコンセクション */}
          <div className="flex justify-center gap-8 mb-12">
            {[
              { icon: MessageSquare, color: 'text-blue-500' },
              { icon: Users, color: 'text-green-500' },
              { icon: Award, color: 'text-orange-500' },
              { icon: Sparkles, color: 'text-yellow-400' }
            ].map((item, index) => (
              <div
                key={index}
                className={`fade-slide-in delayed-${index + 1} ${showContent ? 'opacity-100' : 'opacity-0'}`}
              >
                <item.icon className={`w-12 h-12 ${item.color} floating`} style={{ animationDelay: `${index * 0.2}s` }} />
              </div>
            ))}
          </div>

          {/* 説明テキスト */}
          <div className={`space-y-4 ${showContent ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 delay-500`}>
            <p className="text-xl text-gray-700 fade-slide-in delayed-2">
              面白いトピックで白熱の議論を始めましょう！
            </p>
            <p className="text-lg text-gray-600 fade-slide-in delayed-3">
              AIが公平に判定してくれます
            </p>
          </div>

          {/* スタートボタン */}
          <button
            onClick={startApp}
            className={`mt-8 px-12 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            } fade-slide-in delayed-4`}
          >
            始める
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      <header className="bg-white shadow-lg py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400 flex items-center gap-3">
            <Users className="w-10 h-10 text-orange-500" />
            ディベートジャッジAI
            <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {step === 'topic' && (
          <div className="max-w-3xl mx-auto">
            <TopicSelector onSelect={handleTopicSelect} />
          </div>
        )}

        {step === 'debate' && (
          <DebateRoom 
            topic={selectedTopic}
            onDebateComplete={handleDebateComplete}
          />
        )}

        {step === 'judgement' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400 mb-6 flex items-center gap-3">
                <Award className="w-8 h-8 text-orange-500" />
                AI判定結果
                <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
              </h2>
              <JudgementScreen judgementResult={judgementResult}/>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

// npm run dev