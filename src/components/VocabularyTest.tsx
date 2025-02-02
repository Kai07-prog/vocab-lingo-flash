import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Vocabulary {
  id: string;
  reading: string;
  meaning: string;
  kanji: string | null;
  writingSystem: "hiragana" | "katakana";
}

interface VocabularyTestProps {
  chapterId: number;
  onClose: () => void;
}

interface TestResult {
  word: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  type: "meaning" | "reading";
}

export const VocabularyTest = ({ chapterId, onClose }: VocabularyTestProps) => {
  const [vocabularyList, setVocabularyList] = useState<Vocabulary[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [testQuestions, setTestQuestions] = useState<Array<{ vocab: Vocabulary; type: "meaning" | "reading" }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchVocabulary();
  }, [chapterId]);

  const fetchVocabulary = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('user_id', userData.user.id);

    if (error) {
      toast({
        title: "Error fetching vocabulary",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setVocabularyList(data);
      // Generate test questions (each word appears 1-2 times)
      const questions = data.flatMap(vocab => {
        const questions = [{ vocab, type: Math.random() < 0.5 ? "meaning" : "reading" as const }];
        // 50% chance to add a second question for this word
        if (Math.random() < 0.5) {
          questions.push({ 
            vocab, 
            type: questions[0].type === "meaning" ? "reading" : "meaning" as const 
          });
        }
        return questions;
      });
      // Shuffle the questions
      setTestQuestions(questions.sort(() => Math.random() - 0.5));
      setIsLoading(false);
    }
  };

  const checkAnswer = () => {
    const currentQ = testQuestions[currentQuestion];
    const isCorrect = currentQ.type === "meaning"
      ? userAnswer.toLowerCase() === currentQ.vocab.meaning.toLowerCase()
      : userAnswer === currentQ.vocab.reading;

    if (isCorrect) {
      setScore(score + 1);
      toast({
        title: "Correct!",
        description: "Great job!",
        duration: 1500,
      });
    } else {
      toast({
        title: "Incorrect",
        description: `The correct answer was: ${currentQ.type === "meaning" 
          ? currentQ.vocab.meaning 
          : currentQ.vocab.reading}`,
        variant: "destructive",
        duration: 2000,
      });
    }

    setTestResults([...testResults, {
      word: currentQ.vocab.reading + (currentQ.vocab.kanji ? ` (${currentQ.vocab.kanji})` : ''),
      userAnswer,
      correctAnswer: currentQ.type === "meaning" ? currentQ.vocab.meaning : currentQ.vocab.reading,
      isCorrect,
      type: currentQ.type
    }]);

    setUserAnswer("");
    if (currentQuestion < testQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsTestComplete(true);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (vocabularyList.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center mb-4">No vocabulary found in this chapter.</p>
        <Button onClick={onClose}>Close</Button>
      </Card>
    );
  }

  if (isTestComplete) {
    const accuracy = (score / testQuestions.length) * 100;
    const incorrectAnswers = testResults.filter(result => !result.isCorrect);

    return (
      <Card className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Test Complete!</h2>
        <p className="text-lg mb-4">Accuracy: {accuracy.toFixed(1)}%</p>
        
        {incorrectAnswers.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Words to Review:</h3>
            <div className="space-y-2">
              {incorrectAnswers.map((result, index) => (
                <div key={index} className="p-2 bg-red-50 rounded">
                  <p><span className="font-semibold">Word:</span> {result.word}</p>
                  <p><span className="font-semibold">Question Type:</span> {result.type}</p>
                  <p><span className="font-semibold">Your answer:</span> {result.userAnswer}</p>
                  <p><span className="font-semibold">Correct answer:</span> {result.correctAnswer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Button onClick={onClose} className="mt-6">
          Close
        </Button>
      </Card>
    );
  }

  const currentQ = testQuestions[currentQuestion];

  return (
    <Card className="p-6 max-w-xl mx-auto">
      <div className="text-right mb-4">
        <span className="text-sm text-gray-500">
          Question {currentQuestion + 1} of {testQuestions.length}
        </span>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          {currentQ.type === "meaning" 
            ? `What is the meaning of:`
            : `What is the ${currentQ.vocab.writingSystem} reading for:`
          }
        </h3>
        <p className={`text-center mb-4 ${
          currentQ.type === "meaning" 
            ? currentQ.vocab.writingSystem === "hiragana" 
              ? "japanese-text-hiragana text-2xl" 
              : "japanese-text-katakana text-2xl"
            : ""
        }`}>
          {currentQ.type === "meaning" ? currentQ.vocab.reading : currentQ.vocab.meaning}
        </p>
        {currentQ.vocab.kanji && currentQ.type === "meaning" && (
          <p className="japanese-text-kanji text-3xl text-center mb-4">{currentQ.vocab.kanji}</p>
        )}
      </div>

      <div className="space-y-4">
        <Input
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your answer"
          onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
          className="w-full"
          autoFocus
        />
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Exit Test
          </Button>
          <Button onClick={checkAnswer}>
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};