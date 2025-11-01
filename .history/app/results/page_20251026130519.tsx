"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizResult {
  topic: string;
  difficulty: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  timestamp: number;
  questions?: Question[];
  userAnswers?: (number | null)[];
}

export default function Results() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("lastQuizResult");
    if (!data) {
      router.push("/");
      return;
    }
    setResult(JSON.parse(data));
  }, [router]);

  const handleSaveToLeaderboard = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }

    const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    const updatedLeaderboard = leaderboard.map((entry: any) =>
      entry.timestamp === result?.timestamp ? { ...entry, playerName } : entry
    );
    localStorage.setItem("leaderboard", JSON.stringify(updatedLeaderboard));
    router.push("/leaderboard");
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreMessage = (score: number) => {
    if (score === 100) return "🎉 Perfect Score!";
    if (score >= 80) return "🌟 Excellent!";
    if (score >= 60) return "👍 Good Job!";
    if (score >= 40) return "💪 Keep Practicing!";
    return "📚 Study More!";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass-card p-8 md:p-12 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div
            className={`text-7xl font-bold mb-4 ${getScoreColor(result.score)}`}
          >
            {result.score}%
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {getScoreMessage(result.score)}
          </h2>
          <p className="text-gray-400">
            You got {result.correctAnswers} out of {result.totalQuestions}{" "}
            questions correct
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm mb-1">Topic</p>
            <p className="font-semibold">{result.topic}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm mb-1">Difficulty</p>
            <p className="font-semibold capitalize">{result.difficulty}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm mb-1">Time Taken</p>
            <p className="font-semibold">{formatTime(result.timeTaken)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm mb-1">Questions</p>
            <p className="font-semibold">{result.totalQuestions}</p>
          </div>
        </div>

        {/* Name input for leaderboard */}
        {!showNameInput ? (
          <button
            onClick={() => setShowNameInput(true)}
            className="btn-primary w-full mb-4"
          >
            Save to Leaderboard
          </button>
        ) : (
          <div className="mb-4 space-y-3">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              maxLength={20}
            />
            <button
              onClick={handleSaveToLeaderboard}
              className="btn-primary w-full"
            >
              Submit to Leaderboard
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/")}
            className="btn-secondary w-full"
          >
            Take Another Quiz
          </button>
          <button
            onClick={() => router.push("/leaderboard")}
            className="w-full text-blue-400 hover:text-blue-300 transition-colors"
          >
            View Leaderboard →
          </button>
        </div>
      </div>
    </div>
  );
}
