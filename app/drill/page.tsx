"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DrillConfigSchema, Mode } from "@/lib/schema";
import { apiClient } from "@/lib/api-client";
import { Question } from "@/app/types";
import { useRouter } from "next/navigation";
import { DrillAttemptPayload } from "@/app/types";

interface SelectedAnswer {
  questionId: number;
  selectedOption: string;
  isCorrect: boolean;
  timeTaken: number;
}

function DrillComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [config, setConfig] = useState<DrillConfigSchema | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswer[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams) {
      const drillConfig: any = {};
      for (const [key, value] of searchParams.entries()) {
        drillConfig[key] = value;
      }
      setConfig(drillConfig);
      if (drillConfig.drillMode === Mode.SEMI_STRICT && drillConfig.totalTime) {
        setTimeLeft(drillConfig.totalTime * 60);
      } else if (drillConfig.drillMode === Mode.STRICT && drillConfig.timePerQuestion) {
        setTimeLeft(drillConfig.timePerQuestion);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (config) {
      const fetchQuestions = async () => {
        try {
          const data = await apiClient.getQuestions(config);
          setQuestions(data);
          setStartTime(Date.now());
        } catch (error) {
          setError("Failed to fetch questions.");
        } finally {
          setLoading(false);
        }
      };

      fetchQuestions();
    }
  }, [config]);

  useEffect(() => {
    if (!config || config.drillMode === Mode.FLEX || quizFinished) return;

    if (timeLeft <= 0) {
      handleTimeEnd();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, config, quizFinished]);
  
  useEffect(() => {
    if (quizFinished && config) {
      const submitResults = async () => {
        setSubmitting(true);
        const score = selectedAnswers.filter(a => a.isCorrect).length;
        const totalTimeSpent = selectedAnswers.reduce((acc, a) => acc + a.timeTaken, 0);
        
        const payload: DrillAttemptPayload = {
          score: score,
          mode: config.drillMode,
          total_time_spent: totalTimeSpent,
          total_questions: questions.length,
          details: selectedAnswers.map(a => ({
            question_id: a.questionId,
            selected_answer: a.selectedOption.toString(),
            time_taken: a.timeTaken
          })),
        };
        
        console.log(payload)

        try {
          await apiClient.submitDrillAttempt(payload);
          router.push("/drills");
        } catch (error) {
          setError("Failed to submit results.");
        } finally {
          setSubmitting(false);
        }
      };
      
      submitResults();
    }
  }, [quizFinished, config, questions, selectedAnswers, router]);

  const handleTimeEnd = () => {
    if (config?.drillMode === Mode.STRICT) {
      handleAnswer("N/A"); // Auto-submit with no answer
    } else if (config?.drillMode === Mode.SEMI_STRICT) {
      setQuizFinished(true);
    }
  };

  const handleAnswer = (selectedOption: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const timeTaken = (Date.now() - startTime) / 1000;

    setSelectedAnswers([
      ...selectedAnswers,
      {
        questionId: currentQuestion.id,
        selectedOption,
        isCorrect: selectedOption === currentQuestion.correct_answer,
        timeTaken,
      },
    ]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setStartTime(Date.now());
      if (config?.drillMode === Mode.STRICT && config.timePerQuestion) {
        setTimeLeft(config.timePerQuestion);
      }
    } else {
      setQuizFinished(true);
    }
  };
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  if (questions.length === 0 && !loading) {
    return <div className="flex items-center justify-center min-h-screen">No questions found for this configuration.</div>;
  }
  
  if (submitting) {
    return <div className="flex items-center justify-center min-h-screen">Submitting results...</div>;
  }

  if (quizFinished && !submitting) {
    const score = selectedAnswers.filter(a => a.isCorrect).length;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">Quiz Finished!</h1>
        <p className="text-2xl mb-8">Your score: {score} / {questions.length}</p>
        <p>Redirecting to drills page...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground p-6">
      <header className="flex items-center justify-between">
        <div className="text-xl font-semibold">
          Question {currentQuestionIndex + 1}/{questions.length}
        </div>
        {config?.drillMode !== Mode.FLEX && <div className="text-xl font-semibold">{new Date(timeLeft * 1000).toISOString().substr(14, 5)}</div>}
      </header>

      <main className="flex flex-grow items-center justify-center text-center">
        <h1 className="max-w-4xl text-5xl font-bold leading-tight sm:text-6xl md:text-7xl lg:text-8xl">
          {currentQuestion.question_text}
        </h1>
      </main>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        {Object.values(currentQuestion.options).map((option, index) => (
          <Button
            key={index}
            className="h-24 text-2xl font-semibold sm:h-32 md:h-40 lg:h-48"
            variant="outline"
            onClick={() => handleAnswer(option)}
          >
            {option}
          </Button>
        ))}
      </section>
    </div>
  );
}

export default function DrillPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DrillComponent />
    </Suspense>
  );
}
