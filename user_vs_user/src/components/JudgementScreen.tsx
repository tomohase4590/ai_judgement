import React, { useEffect, useState } from 'react';
import { Trophy, RotateCcw, Award, Star, MessageSquare } from 'lucide-react';
import { JudgementResult } from '../types';

interface JudgementScreenProps {
  judgementResult: JudgementResult | null;  // judgementResultは親から渡される
  topic: string;  // トピックも親から渡される
}

export default function JudgementScreen({ judgementResult, topic }: JudgementScreenProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (judgementResult) {
      setLoading(false);
    }
  }, [judgementResult]);

  const handleRestart = () => {
    // ローカルストレージをクリア
    localStorage.removeItem('judgementResult');
    localStorage.removeItem('debateTopic');
    localStorage.removeItem('debateMessages');
    
    window.location.reload();
  };
  const return_top = () => {
    window.location.href = 'http://127.0.0.1:5000';
  };
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">AI が判定結果を読み込み中です...</p>
      </div>
    );
  }

  if (!judgementResult) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">判定結果の取得に失敗しました</p>
        <button
          onClick={handleRestart}
          className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
        >
          新しい議論を始める
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {topic && (
        <div className="bg-orange-50 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-orange-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-600" />
            トピック: {topic}
          </h3>
        </div>
      )}

      <div className="text-center">
        <div className="inline-block bg-orange-100 rounded-full p-4 mb-4">
          <Trophy className="w-12 h-12 text-orange-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          判定結果
        </h3>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 shadow-inner">
        <h4 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-600" />
          勝者
        </h4>
        <div className="flex items-center justify-center gap-8 mb-4">
          <div className={`text-center p-4 rounded-xl ${
            judgementResult.winner === 'left' 
              ? 'bg-orange-100 ring-2 ring-orange-400 shadow-lg' 
              : 'bg-gray-100'
          }`}>
            <p className="text-lg font-semibold">参加者 左側</p>
            {judgementResult.scores && (
              <p className="text-3xl font-bold text-orange-600">{judgementResult.scores.left}</p>
            )}
            {judgementResult.winner === 'left' && (
              <div className="flex justify-center mt-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
            )}
          </div>
          
          <div className="text-xl font-bold text-gray-400">VS</div>
          
          <div className={`text-center p-4 rounded-xl ${
            judgementResult.winner === 'right' 
              ? 'bg-blue-100 ring-2 ring-blue-400 shadow-lg' 
              : 'bg-gray-100'
          }`}>
            <p className="text-lg font-semibold">参加者 右側</p>
            {judgementResult.scores && (
              <p className="text-3xl font-bold text-blue-600">{judgementResult.scores.right}</p>
            )}
            {judgementResult.winner === 'right' && (
              <div className="flex justify-center mt-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
        {/* <h4 className="font-semibold text-gray-800 mb-4">分析</h4>
        <p className="text-gray-700 leading-relaxed">{judgementResult.analysis}</p> */}
        
        {judgementResult.reasons && judgementResult.reasons.length > 0 && (
          <div className="mt-4">
            <h5 className="font-medium text-gray-700 mb-2">勝利の理由:</h5>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {judgementResult.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
        
        {judgementResult.highlights && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-orange-700 mb-2">参加者1のハイライト:</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {judgementResult.highlights.left.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-700 mb-2">参加者2のハイライト:</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {judgementResult.highlights.right.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleRestart}
        className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        新しい議論を始める
      </button>
      <button
        onClick={return_top}
        className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        戻る
      </button>
    </div>
  );
}
