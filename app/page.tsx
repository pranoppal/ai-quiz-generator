"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: "",
    body: "",
  });
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
      // const [imageResponse, quizResponse] = await Promise.all([
      const [quizResponse] = await Promise.all([
        // axios
        //   .post(
        //     "/api/generate-image",
        //     { topic },
        //     { timeout: 60000 } // 60 second timeout
        //   )
        //   .catch((err) => ({ data: null, error: err })),
        axios.post(
          "/api/generate-quiz",
          { topic, difficulty, numQuestions },
          { timeout: 60000 } // 60 second timeout
        ),
      ]);

      const quizData = quizResponse.data;

      // Get image data (don't fail if image generation fails)
      let imageData = null;
      // if (imageResponse.data) {
      //   imageData = imageResponse.data;
      // }

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
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
          setErrorMessage({
            title: "Request Timed Out",
            body: "The quiz generation is taking longer than expected. This might be due to a slow connection or high server load.",
          });
        } else {
          setErrorMessage({
            title: "Oops! Something Went Wrong",
            body: "We couldn't generate your quiz at this moment. Please check your connection and try again.",
          });
        }
      } else {
        setErrorMessage({
          title: "Oops! Something Went Wrong",
          body: "We couldn't generate your quiz at this moment. Please check your connection and try again.",
        });
      }
      setShowErrorDialog(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setShowErrorDialog(false);
    // Open a different URL in a new tab
    window.open(
      "https://ai-quiz-generator-sp-seva-mela2.netlify.app/",
      "_blank"
    );
  };

  const handlePlayGame = () => {
    setShowErrorDialog(false);
    // Navigate to game page (you can change this route as needed)
    window.open("https://snake.io", "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass-card p-8 md:p-12 max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-700 text-transparent bg-clip-text">
            Seva Mela 2025
          </h1>
          <h1 className="text-8xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            AI Quiz
          </h1>
          <p className="text-gray-300 text-xl pt-4">
            Ready to challenge yourself?
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
              placeholder="e.g., India, Sadhguru, Cricket..."
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            />
          </div>

          {/* <div>
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
          </div> */}
          {/* 
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
          </div> */}

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
      </div>

      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>Powered by AI</p>
      </div>

      {/* Error Dialog */}
      {showErrorDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-8 max-w-md w-full animate-scale-up">
            {/* Image Placeholder */}
            <div className="mb-6 flex justify-center">
              <div className="flex items-center justify-center border-4">
                <Image
                  src="/images/sleeping-ai.png"
                  alt="Error"
                  width={512}
                  height={256}
                />
              </div>
            </div>
            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-red-400 to-orange-400 text-transparent bg-clip-text">
              {errorMessage.title}
            </h2>
            {/* Body Text
            <p className="text-gray-300 text-center mb-8">
              {errorMessage.body}
            </p> */}
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePlayGame}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold transition-all transform hover:scale-105"
              >
                Play a Game Instead
              </button>
              <button
                onClick={handleTryAgain}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
