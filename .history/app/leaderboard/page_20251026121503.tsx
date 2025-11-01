"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LeaderboardEntry {
  playerName?: string;
  topic: string;
  difficulty: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  timestamp: number;
}

export default function Leaderboard() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "easy" | "medium" | "hard">(
    "all"
  );

  useEffect(() => {
    const data = localStorage.getItem("leaderboard");
    if (data) {
      setEntries(JSON.parse(data));
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredEntries = entries.filter(
    (entry) => filter === "all" || entry.difficulty === filter
  );

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  const clearLeaderboard = () => {
    if (confirm("Are you sure you want to clear the leaderboard?")) {
      localStorage.setItem("leaderboard", "[]");
      setEntries([]);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-300">Top quiz performers across all topics</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              All Difficulties
            </button>
            <button
              onClick={() => setFilter("easy")}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === "easy"
                  ? "bg-green-500 text-white"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => setFilter("medium")}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === "medium"
                  ? "bg-yellow-500 text-white"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setFilter("hard")}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === "hard"
                  ? "bg-red-500 text-white"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Hard
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="glass-card p-6 mb-6">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No entries yet!</p>
              <p className="text-gray-500">
                Take a quiz to get on the leaderboard
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    index < 3
                      ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl font-bold w-12 text-center">
                      {getMedal(index)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">
                        {entry.playerName || "Anonymous"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {entry.topic} •{" "}
                        <span className="capitalize">{entry.difficulty}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-400">
                      {entry.score}%
                    </p>
                    <p className="text-xs text-gray-400">
                      {entry.correctAnswers}/{entry.totalQuestions} •{" "}
                      {formatTime(entry.timeTaken)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push("/")} className="btn-primary">
            Take a Quiz
          </button>
          {entries.length > 0 && (
            <button onClick={clearLeaderboard} className="btn-secondary">
              Clear Leaderboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
