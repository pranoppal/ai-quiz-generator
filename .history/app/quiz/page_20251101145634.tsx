"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizData {
  topic: string;
  difficulty: string;
  questions: Question[];
  startTime: number;
  backgroundImage?: string | null;
  backgroundImageBlur?: string | null;
  imageAttribution?: {
    photographer?: string;
    photographerUrl?: string;
    unsplashUrl?: string;
    source?: string;
  } | null;
}

export default function Quiz() {
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    // Load quiz data from localStorage
    const data = localStorage.getItem("currentQuiz");
    if (!data) {
      router.push("/");
      return;
    }

    const quiz: QuizData = JSON.parse(data);
    setQuizData(quiz);
    setSelectedAnswers(new Array(quiz.questions.length).fill(null));

    // Calculate time based on number of questions (1 minute per question)
    setTimeLeft(quiz.questions.length * 60);
  }, [router]);

  useEffect(() => {
    if (!quizData || quizComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizData, quizComplete]);

  const handleSelectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < (quizData?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = useCallback(() => {
    if (!quizData) return;

    setQuizComplete(true);

    // Calculate score
    let correctCount = 0;
    quizData.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quizData.questions.length) * 100);
    const timeTaken = Math.floor((Date.now() - quizData.startTime) / 1000);

    // Store result with questions and answers for review
    const result = {
      topic: quizData.topic,
      difficulty: quizData.difficulty,
      score,
      correctAnswers: correctCount,
      totalQuestions: quizData.questions.length,
      timeTaken,
      timestamp: Date.now(),
      questions: quizData.questions,
      userAnswers: selectedAnswers,
      backgroundImage: quizData.backgroundImage,
      backgroundImageBlur: quizData.backgroundImageBlur,
      imageAttribution: quizData.imageAttribution,
    };

    localStorage.setItem("lastQuizResult", JSON.stringify(result));

    // Add to leaderboard
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    leaderboard.push(result);

    // Sort by score (desc) and time (asc)
    leaderboard.sort((a: any, b: any) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTaken - b.timeTaken;
    });

    // Keep top 100
    localStorage.setItem(
      "leaderboard",
      JSON.stringify(leaderboard.slice(0, 100))
    );

    router.push("/results");
  }, [quizData, selectedAnswers, router]);

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQ = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  // Prepare background style
  const backgroundStyle: React.CSSProperties = {};
  if (
    quizData.backgroundImage &&
    !quizData.backgroundImage.startsWith("linear-gradient")
  ) {
    backgroundStyle.backgroundImage = `url(${quizData.backgroundImage})`;
    backgroundStyle.backgroundSize = "cover";
    backgroundStyle.backgroundPosition = "center";
    backgroundStyle.backgroundRepeat = "no-repeat";
  } else if (quizData.backgroundImage?.startsWith("linear-gradient")) {
    // Parse gradient data
    const parts = quizData.backgroundImage.split("-");
    if (parts.length === 4) {
      const [, hue1, hue2, hue3] = parts;
      backgroundStyle.background = `linear-gradient(135deg, hsl(${hue1}, 70%, 40%), hsl(${hue2}, 70%, 45%), hsl(${hue3}, 70%, 35%))`;
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Quiz Panel (33%) */}
      <div className="w-full lg:w-1/3 min-h-screen flex items-center justify-center p-4 lg:p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative z-10">
        <div className="glass-card p-6 lg:p-8 w-full max-w-lg">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-white text-contrast">
                {quizData.topic}
              </h2>
              <p className="text-gray-200 text-xs lg:text-sm capitalize text-contrast">
                {quizData.difficulty} Difficulty
              </p>
            </div>
            <div
              className={`text-2xl lg:text-3xl font-bold text-contrast ${
                timeLeft < 60 ? "text-red-400 animate-pulse" : "text-blue-400"
              }`}
            >
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-black/30 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-200 mt-2 text-contrast">
            Question {currentQuestion + 1} of {quizData.questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="mb-6 lg:mb-8">
          <h3 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6 text-white text-contrast">
            {currentQ.question}
          </h3>

          <div className="space-y-2 lg:space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={`w-full text-left p-3 lg:p-4 rounded-xl border-2 transition-all duration-200 text-white text-contrast text-sm lg:text-base ${
                  selectedAnswers[currentQuestion] === index
                    ? "border-blue-400 bg-blue-500/40 backdrop-blur-sm shadow-lg"
                    : "border-white/30 bg-black/40 backdrop-blur-sm hover:border-blue-300 hover:bg-black/50"
                }`}
              >
                <span className="font-medium mr-2 lg:mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            {quizData.questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  selectedAnswers[index] !== null
                    ? "bg-blue-500"
                    : "bg-white/20"
                }`}
              ></div>
            ))}
          </div>

          {currentQuestion === quizData.questions.length - 1 ? (
            <button onClick={handleSubmit} className="btn-primary">
              Submit Quiz
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary">
              Next →
            </button>
          )}
        </div>

        {/* Skip to submit */}
        {currentQuestion < quizData.questions.length - 1 && (
          <div className="mt-4 text-center">
            <button
              onClick={handleSubmit}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Submit quiz early
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Right side - Image (67%) */}
      <div 
        className="w-full lg:w-2/3 min-h-[50vh] lg:min-h-screen relative"
        style={backgroundStyle}
      >
        {/* Dark overlay for better image visibility */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Image Attribution */}
        {quizData.imageAttribution && (
          <div className="absolute bottom-6 right-6 text-right text-xs text-gray-200 text-contrast bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
            <p>
              {quizData.imageAttribution.photographer ? (
                <>
                  Photo by{" "}
                  <a
                    href={quizData.imageAttribution.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {quizData.imageAttribution.photographer}
                  </a>{" "}
                  on{" "}
                  <a
                    href={quizData.imageAttribution.unsplashUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Unsplash
                  </a>
                </>
              ) : (
                quizData.imageAttribution.source
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
