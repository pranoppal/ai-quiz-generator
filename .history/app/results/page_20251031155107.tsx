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
  backgroundImage?: string | null;
  backgroundImageBlur?: string | null;
  imageAttribution?: {
    photographer: string;
    photographerUrl: string;
    unsplashUrl: string;
  } | null;
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

  // Prepare background style
  const backgroundStyle: React.CSSProperties = {};
  if (
    result?.backgroundImage &&
    !result.backgroundImage.startsWith("linear-gradient")
  ) {
    backgroundStyle.backgroundImage = `url(${result.backgroundImage})`;
    backgroundStyle.backgroundSize = "cover";
    backgroundStyle.backgroundPosition = "center";
    backgroundStyle.backgroundAttachment = "fixed";
  } else if (result?.backgroundImage?.startsWith("linear-gradient")) {
    // Parse gradient data
    const parts = result.backgroundImage.split("-");
    if (parts.length === 4) {
      const [, hue1, hue2, hue3] = parts;
      backgroundStyle.background = `linear-gradient(135deg, hsl(${hue1}, 70%, 40%), hsl(${hue2}, 70%, 45%), hsl(${hue3}, 70%, 35%))`;
    }
  }

  if (showReview && result.questions && result.userAnswers) {
    return (
      <div className="min-h-screen py-8 px-4" style={backgroundStyle}>
        {/* Dark overlay for better readability */}
        <div className="fixed inset-0 bg-black/50 -z-10"></div>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Quiz Review</h1>
              <button
                onClick={() => setShowReview(false)}
                className="btn-secondary"
              >
                ← Back to Results
              </button>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-400">
                Score:{" "}
                <span className="text-white font-semibold">
                  {result.score}%
                </span>
              </span>
              <span className="text-gray-400">
                Correct:{" "}
                <span className="text-green-400 font-semibold">
                  {result.correctAnswers}
                </span>
              </span>
              <span className="text-gray-400">
                Wrong:{" "}
                <span className="text-red-400 font-semibold">
                  {result.totalQuestions - result.correctAnswers}
                </span>
              </span>
            </div>
          </div>

          {/* Questions Review */}
          <div className="space-y-6">
            {result.questions.map((question, qIndex) => {
              const userAnswer = result.userAnswers![qIndex];
              const isCorrect = userAnswer === question.correctAnswer;
              const wasAnswered = userAnswer !== null;

              return (
                <div
                  key={qIndex}
                  className={`glass-card p-6 border-2 ${
                    isCorrect
                      ? "border-green-500/50"
                      : wasAnswered
                      ? "border-red-500/50"
                      : "border-yellow-500/50"
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg flex-1">
                      <span className="text-gray-400 mr-2">Q{qIndex + 1}.</span>
                      {question.question}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        isCorrect
                          ? "bg-green-500/20 text-green-400"
                          : wasAnswered
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {isCorrect
                        ? "✓ Correct"
                        : wasAnswered
                        ? "✗ Wrong"
                        : "⊘ Skipped"}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {question.options.map((option, oIndex) => {
                      const isUserAnswer = userAnswer === oIndex;
                      const isCorrectAnswer = question.correctAnswer === oIndex;

                      return (
                        <div
                          key={oIndex}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isCorrectAnswer
                              ? "bg-green-500/10 border-green-500/50"
                              : isUserAnswer
                              ? "bg-red-500/10 border-red-500/50"
                              : "bg-white/5 border-white/10"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-medium text-gray-400">
                              {String.fromCharCode(65 + oIndex)}.
                            </span>
                            <span className="flex-1">{option}</span>
                            <div className="flex gap-2">
                              {isCorrectAnswer && (
                                <span className="text-green-400 font-semibold">
                                  ✓ Correct Answer
                                </span>
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <span className="text-red-400 font-semibold">
                                  Your Answer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="glass-card p-6 mt-6">
            <div className="flex gap-4">
              <button
                onClick={() => setShowReview(false)}
                className="btn-secondary flex-1"
              >
                Back to Results
              </button>
              <button
                onClick={() => router.push("/")}
                className="btn-primary flex-1"
              >
                Take Another Quiz
              </button>
            </div>
          </div>

          {/* Image Attribution */}
          {result.imageAttribution && (
            <div className="mt-4 text-center text-xs text-gray-400">
              <p>
                {result.imageAttribution.photographer ? (
                  <>
                    Photo by{" "}
                    <a
                      href={result.imageAttribution.photographerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {result.imageAttribution.photographer}
                    </a>{" "}
                    on{" "}
                    <a
                      href={result.imageAttribution.unsplashUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Unsplash
                    </a>
                  </>
                ) : (
                  result.imageAttribution.source
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={backgroundStyle}
    >
      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 bg-black/50 -z-10"></div>
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

        {/* Review Quiz Button */}
        {result.questions && result.userAnswers && (
          <button
            onClick={() => setShowReview(true)}
            className="btn-primary w-full mb-4"
          >
            📝 Review Answers
          </button>
        )}

        {/* Name input for leaderboard */}
        {!showNameInput ? (
          <button
            onClick={() => setShowNameInput(true)}
            className="btn-secondary w-full mb-4"
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

      {/* Image Attribution */}
      {result.imageAttribution && (
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>
            {result.imageAttribution.photographer ? (
              <>
                Photo by{" "}
                <a
                  href={result.imageAttribution.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {result.imageAttribution.photographer}
                </a>{" "}
                on{" "}
                <a
                  href={result.imageAttribution.unsplashUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Unsplash
                </a>
              </>
            ) : (
              result.imageAttribution.source
            )}
          </p>
        </div>
      )}
    </div>
  );
}
