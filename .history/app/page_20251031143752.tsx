"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setLoading(true);

    try {
      // Generate background image and quiz in parallel
      const [imageResponse, quizResponse] = await Promise.all([
        fetch("/api/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topic }),
        }),
        fetch("/api/generate-quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topic, difficulty, numQuestions }),
        }),
      ]);

      if (!quizResponse.ok) {
        throw new Error("Failed to generate quiz");
      }

      const quizData = await quizResponse.json();
      
      // Get image data (don't fail if image generation fails)
      let imageData = null;
      if (imageResponse.ok) {
        imageData = await imageResponse.json();
      }

      // Store quiz data in localStorage
      localStorage.setItem(
        "currentQuiz",
        JSON.stringify({
          topic,
          difficulty,
          questions: quizData.questions,
          startTime: Date.now(),
          backgroundImage: imageData?.imageUrl || null,
          backgroundImageBlur: imageData?.imageUrlBlur || null,
          imageAttribution: imageData?.attribution || null,
        })
      );

      router.push("/quiz");
    } catch (err) {
      setError("Failed to generate quiz. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass-card p-8 md:p-12 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            AI Quiz Generator
          </h1>
          <p className="text-gray-300 text-lg">
            Test your knowledge on any topic with AI-generated questions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium mb-2">
              Quiz Topic
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., JavaScript, World History, Biology..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="difficulty"
              className="block text-sm font-medium mb-2"
            >
              Difficulty Level
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            >
              <option value="easy" className="bg-slate-800">
                Easy
              </option>
              <option value="medium" className="bg-slate-800">
                Medium
              </option>
              <option value="hard" className="bg-slate-800">
                Hard
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="numQuestions"
              className="block text-sm font-medium mb-2"
            >
              Number of Questions: {numQuestions}
            </label>
            <input
              type="range"
              id="numQuestions"
              min="3"
              max="10"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>3</span>
              <span>10</span>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating Quiz...
              </span>
            ) : (
              "Generate Quiz"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/20 text-center">
          <button
            onClick={() => router.push("/leaderboard")}
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            View Leaderboard →
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>Powered by AI • Made with Next.js</p>
      </div>
    </div>
  );
}
