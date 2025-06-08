import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Clock, MessageSquare, Crown, Sparkles, Award, Send, Keyboard } from 'lucide-react';

interface DebateRoomProps {
  topic: string;
  onDebateComplete: (result: JudgementResult) => void; 
}
interface JudgementResult {
  winner: string;
  analysis: string;
  scores: {
    left: number;
    right: number;
  };
  reasons: string[];
  highlights: string;
}
interface Message {
  id: number;
  text: string;
  sender: 'left' | 'right';
  timestamp: string;
}

export default function DebateRoom({ topic, onDebateComplete }: DebateRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSide, setCurrentSide] = useState<'left' | 'right'>('left');
  const [isLeftListening, setIsLeftListening] = useState(false);
  const [isRightListening, setIsRightListening] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5分
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showSparkles, setShowSparkles] = useState(false);
  const [inputText, setInputText] = useState('');
  const [draftTranscript, setDraftTranscript] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isListeningRef = useRef(false);

  // タイマー機能
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimerRunning(false);
            handleJudgement(); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  // 自動スクロール
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ja-JP';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setDraftTranscript(transcript);
        setInputText(transcript); // 音声認識テキストをテキスト入力に同期
      };

      recognitionRef.current.onend = () => {
        isListeningRef.current = false;
        setIsLeftListening(false);
        setIsRightListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isListeningRef.current = false;
        setIsLeftListening(false);
        setIsRightListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('お使いのブラウザは音声入力に対応していません。');
      return;
    }

    if (isListeningRef.current) {
      return; // 既に音声認識中の場合は何もしない
    }

    try {
      recognitionRef.current.start();
      isListeningRef.current = true;
      if (currentSide === 'left') {
        setIsLeftListening(true);
      } else {
        setIsRightListening(true);
      }
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      isListeningRef.current = false;
      setIsLeftListening(false);
      setIsRightListening(false);
    }
  };

  const stopVoiceInput = () => {
    if (!recognitionRef.current || !isListeningRef.current) {
      return;
    }

    try {
      recognitionRef.current.stop();
      isListeningRef.current = false;
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now(),
        text: inputText,
        sender: currentSide,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      setDraftTranscript('');
      setCurrentSide(currentSide === 'left' ? 'right' : 'left');
      
      // アニメーション効果
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // モックAPIレスポンスを生成する関数
  // const generateMockJudgement = () => {
  //   // メッセージの数をカウント
  //   const leftMessages = messages.filter(msg => msg.sender === 'left');
  //   const rightMessages = messages.filter(msg => msg.sender === 'right');
    
  //   // 単純な判定ロジック（メッセージの長さと数で判定）
  //   let leftScore = 0;
  //   let rightScore = 0;
    
  //   // メッセージの数による加点
  //   leftScore += leftMessages.length * 1;
  //   rightScore += rightMessages.length * 1;
    
  //   // メッセージの長さによる加点
  //   leftMessages.forEach(msg => {
  //     leftScore += Math.min(msg.text.length / 20, 2); // 長さに応じて加点（最大2点）
  //   });
    
  //   rightMessages.forEach(msg => {
  //     rightScore += Math.min(msg.text.length / 20, 2); // 長さに応じて加点（最大2点）
  //   });
    
  //   // スコアを整数に丸める
  //   leftScore = Math.round(leftScore);
  //   rightScore = Math.round(rightScore);
    
  //   // 勝者を決定
  //   const winner = leftScore > rightScore ? 'left' : 'right';
    
  //   // 分析コメントを生成
  //   let analysis = '';
  //   if (winner === 'left') {
  //     analysis = '参加者1は論点を明確に示し、具体的な例を挙げながら説得力のある議論を展開しました。';
  //   } else {
  //     analysis = '参加者2は反論が的確で、トピックに対する深い理解を示しながら説得力のある議論を展開しました。';
  //   }
    
  //   // ハイライトを生成
  //   const leftHighlights = leftMessages.length > 0 
  //     ? [leftMessages[0].text.substring(0, Math.min(leftMessages[0].text.length, 30)) + '...'] 
  //     : ['発言なし'];
      
  //   const rightHighlights = rightMessages.length > 0 
  //     ? [rightMessages[0].text.substring(0, Math.min(rightMessages[0].text.length, 30)) + '...'] 
  //     : ['発言なし'];
    
  //   // 勝利の理由
  //   const reasons = winner === 'left' 
  //     ? ['論点の明確さ', '具体例の提示', '説得力のある議論展開'] 
  //     : ['的確な反論', 'トピックへの深い理解', '論理的な議論構成'];
    
  //   return {
  //     winner,
  //     analysis,
  //     scores: { left: leftScore, right: rightScore },
  //     reasons: reasons.slice(0, 2), // 2つだけ表示
  //     highlights: {
  //       left: leftHighlights,
  //       right: rightHighlights
  //     }
  //   };
  // };

  const handleJudgement = async () => {
    // if (messages.length < 2) {
    //   alert('議論が短すぎます。もう少し会話を続けてください。');
    //   return;
    // }

    setIsSubmitting(true);

    try {
      const debateData = messages.map(msg => [msg.sender, msg.text]);
      console.log('Debate data:', debateData);
      let judgementResult;

      try {

        const formData = new URLSearchParams();
        formData.append('topic', topic);
        // debateDataの各項目をURLエンコード形式で追加
        debateData.forEach(([sender, text]) => {
          formData.append('debateData[]', sender);
          formData.append('debateData[]', text);
        });

        console.log([...formData.entries()]);
        // 実際のAPIを呼び出し
        const response = await fetch('http://127.0.0.1:5000/api/judge', {
          method: 'POST',
          body: formData
        });
        
        // if (!response.ok) {
        //   throw new Error(`API error: ${response.status}`);
        // }

        judgementResult = await response.json();
        console.log("勝者:", judgementResult.winner); // "left" または "right"
        console.log("分析:", judgementResult.analysis);
        console.log("スコア:", judgementResult.scores); // { left: 75, right: 25 }
        console.log("理由:", judgementResult.reasons); // ["理由1", "理由2", "理由3"]
        console.log("ハイライト:", judgementResult.highlights);
      } catch (apiError) {
        console.warn('API呼び出しに失敗しました。モックデータを使用します:', apiError);
        // APIが利用できない場合はモックデータを使用
        // judgementResult = generateMockJudgement();
      }
      
      // // 結果をローカルストレージに保存
      // localStorage.setItem('judgementResult', JSON.stringify(judgementResult));
      // localStorage.setItem('debateTopic', topic);
      // localStorage.setItem('debateMessages', JSON.stringify(messages));
      
      onDebateComplete(judgementResult);
    } catch (error) {
      console.error('Judgement error:', error);
      
      // // エラーが発生した場合もモックデータを使用
      // const mockResult = generateMockJudgement();
      // localStorage.setItem('judgementResult', JSON.stringify(mockResult));
      // localStorage.setItem('debateTopic', topic);
      // localStorage.setItem('debateMessages', JSON.stringify(messages));
      
      // onDebateComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSpeakerPanel = (side: 'left' | 'right') => {
    const isListening = side === 'left' ? isLeftListening : isRightListening;
    const isCurrentSide = currentSide === side;
    const colors = side === 'left' 
      ? {
          bg: 'from-orange-50 to-orange-100',
          ring: 'ring-orange-400',
          text: 'text-orange-800',
          icon: 'text-orange-500',
          button: 'bg-orange-500 hover:bg-orange-600',
        }
      : {
          bg: 'from-blue-50 to-blue-100',
          ring: 'ring-blue-400',
          text: 'text-blue-800',
          icon: 'text-blue-500',
          button: 'bg-blue-500 hover:bg-blue-600',
        };

    return (
      <div className={`bg-gradient-to-br ${colors.bg} p-6 rounded-2xl shadow-lg transition-all duration-300 ${
        isCurrentSide ? `ring-4 ${colors.ring} glow-effect` : ''
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${colors.text} text-lg flex items-center gap-2`}>
            <Crown className={`w-5 h-5 ${colors.icon}`} />
            参加者 {side === 'left' ? '左側' : '右側'}
          </h3>
          <div className="text-sm text-gray-600">
            {isCurrentSide && 'あなたのターン'}
          </div>
        </div>
        {isCurrentSide && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <button
                onMouseDown={startVoiceInput}
                onMouseUp={stopVoiceInput}
                onMouseLeave={stopVoiceInput}
                onTouchStart={startVoiceInput}
                onTouchEnd={stopVoiceInput}
                className={`relative p-8 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 text-white scale-110'
                    : `${colors.button} text-white`
                }`}
              >
                {isListening && (
                  <>
                    <div className="mic-wave" style={{ animationDelay: '0s' }} />
                    <div className="mic-wave" style={{ animationDelay: '0.5s' }} />
                    <div className="mic-wave" style={{ animationDelay: '1s' }} />
                  </>
                )}
                {isListening ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
              </button>
            </div>
            
            {/* 入力エリア */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-inner">
              <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                {isListening ? (
                  <>
                    <Mic className="w-4 h-4" />
                    音声認識中...
                  </>
                ) : (
                  <>
                    <Keyboard className="w-4 h-4" />
                    メッセージを入力または編集
                  </>
                )}
              </div>
              
              <div className="space-y-4">
                {/* 編集可能なテキストエリア */}
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isListening ? '音声認識中...' : 'メッセージを入力または編集（Enterで送信）'}
                    className={`w-full min-h-[120px] p-3 rounded-lg border transition-all duration-300 ${
                      isListening 
                        ? 'border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-300'
                        : 'border-gray-200 focus:ring-2 focus:ring-orange-300'
                    } focus:border-transparent outline-none resize-none`}
                  />
                </div>

                {/* 送信ボタン */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className={`w-full py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    inputText.trim()
                      ? `${colors.button} text-white hover:scale-105`
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  送信
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-[1fr_2fr_1fr] gap-6">
      <style>
        {`
          @keyframes floatEmoji {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-100px); opacity: 0; }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.5); }
            50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.8); }
          }
          @keyframes wave {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(2); opacity: 0; }
          }
          .mic-wave {
            position: absolute;
            border: 2px solid currentColor;
            border-radius: 50%;
            animation: wave 2s infinite;
          }
          .message-new {
            animation: pulse 0.3s ease-in-out;
          }
          .glow-effect {
            animation: glow 2s infinite;
          }
        `}
      </style>

      {renderSpeakerPanel('left')}

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl mb-4">
          <h2 className="text-xl font-semibold text-orange-800 text-center flex items-center justify-center gap-2">
            <MessageSquare className="w-6 h-6" />
            トピック: {topic}
          </h2>
          <div className="mt-2 text-center text-lg font-bold text-orange-600">
            <Clock className="inline-block w-5 h-5 mr-2" />
            残り時間: {formatTime(timeLeft)}
          </div>
        </div>
        
        <div ref={chatBodyRef} className="h-[500px] overflow-y-auto space-y-4 mb-4 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-xl max-w-[80%] message-new ${
                message.sender === 'left'
                  ? 'bg-orange-100 ml-0 mr-auto'
                  : 'bg-blue-100 ml-auto mr-0'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-500">{message.timestamp}</span>
              </div>
              {message.text}
            </div>
          ))}
          {showSparkles && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Sparkles className="w-12 h-12 text-yellow-400 floating-emoji" />
            </div>
          )}
        </div>

        <button
          onClick={handleJudgement}
          disabled={isSubmitting || messages.length < 2}
          className={`w-full py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold ${
            isSubmitting 
              ? 'bg-gray-400 text-white cursor-wait'
              : messages.length < 2
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-105'
          }`}
        >
          <Award className="w-5 h-5" />
          {isSubmitting ? '判定中...' : '判定を行う'}
        </button>
      </div>

      {renderSpeakerPanel('right')}
    </div>
  );
}