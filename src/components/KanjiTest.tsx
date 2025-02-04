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

interface KanjiTestProps {
  chapterId: number;
  onClose: () => void;
}

type QuestionType = "kanjiToReading" | "readingToKanji" | "meaningToKanji";

interface TestResult {
  word: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  type: QuestionType;
}

export const KanjiTest = ({ chapterId, onClose }: KanjiTestProps) => {
  const [vocabularyList, setVocabularyList] = useState<Vocabulary[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [testQuestions, setTestQuestions] = useState<Array<{ vocab: Vocabulary; type: QuestionType }>>([]);
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
      const vocabWithKanji = data
        .map(item => ({
          ...item,
          writingSystem: item.writing_system
        }))
        .filter(item => item.kanji); // Only include words with kanji

      setVocabularyList(vocabWithKanji);
      
      // Generate questions for each vocabulary word
      const questions: Array<{ vocab: Vocabulary; type: QuestionType }> = [];
      vocabWithKanji.forEach(vocab => {
        questions.push(
          { vocab, type: "kanjiToReading" },
          { vocab, type: "readingToKanji" },
          { vocab, type: "meaningToKanji" }
        );
      });
      
      // Shuffle questions
      const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
      setTestQuestions(shuffledQuestions);
      setIsLoading(false);
    }
  };

  const getQuestionText = (currentQ: { vocab: Vocabulary; type: QuestionType }) => {
    switch (currentQ.type) {
      case "kanjiToReading":
        return "What is the reading for this kanji?";
      case "readingToKanji":
        return "What is the kanji for this reading?";
      case "meaningToKanji":
        return "What is the kanji for this meaning?";
      default:
        return "";
    }
  };

  const getQuestionDisplay = (currentQ: { vocab: Vocabulary; type: QuestionType }) => {
    switch (currentQ.type) {
      case "kanjiToReading":
        return (
          <p className="japanese-text-kanji text-3xl text-center mb-4">
            {currentQ.vocab.kanji}
          </p>
        );
      case "readingToKanji":
        return (
          <p className={`text-center mb-4 ${
            currentQ.vocab.writingSystem === "hiragana" 
              ? "japanese-text-hiragana text-2xl" 
              : "japanese-text-katakana text-2xl"
          }`}>
            {currentQ.vocab.reading}
          </p>
        );
      case "meaningToKanji":
        return (
          <p className="text-center mb-4 text-2xl">
            {currentQ.vocab.meaning}
          </p>
        );
    }
  };

  const getCorrectAnswer = (currentQ: { vocab: Vocabulary; type: QuestionType }) => {
    switch (currentQ.type) {
      case "kanjiToReading":
        return currentQ.vocab.reading;
      case "readingToKanji":
      case "meaningToKanji":
        return currentQ.vocab.kanji || "";
    }
  };

  const checkAnswer = () => {
    const currentQ = testQuestions[currentQuestion];
    const correctAnswer = getCorrectAnswer(currentQ);
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

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
        description: `The correct answer was: ${correctAnswer}`,
        variant: "destructive",
        duration: 2000,
      });
    }

    setTestResults([...testResults, {
      word: currentQ.vocab.reading + (currentQ.vocab.kanji ? ` (${currentQ.vocab.kanji})` : ''),
      userAnswer,
      correctAnswer,
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
        <p className="text-center mb-4">No vocabulary with kanji found in this chapter.</p>
        <Button onClick={onClose}>Close</Button>
      </Card>
    );
  }

  if (isTestComplete) {
    const accuracy = (score / testQuestions.length) * 100;
    const incorrectAnswers = testResults.filter(result => !result.isCorrect);

    return (
      <Card className="p-8 max-w-xl mx-auto bg-gradient-to-br from-white to-gray-50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Kanji Test Complete!</h2>
          <div className="inline-block rounded-full bg-zen-100 px-6 py-3 mb-4">
            <p className="text-2xl font-semibold text-zen-800">
              Accuracy: {accuracy.toFixed(1)}%
            </p>
          </div>
        </div>
        
        {incorrectAnswers.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4 text-zen-800">Kanji to Review:</h3>
            <div className="space-y-3">
              {incorrectAnswers.map((result, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-lg border border-sakura-200 bg-sakura-50 transition-all hover:shadow-md"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zen-600 mb-1">Word</p>
                      <p className="font-medium">{result.word}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zen-600 mb-1">Question Type</p>
                      <p className="font-medium capitalize">{result.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zen-600 mb-1">Your Answer</p>
                      <p className="font-medium">{result.userAnswer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zen-600 mb-1">Correct Answer</p>
                      <p className="font-medium">{result.correctAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center mt-6 p-6 bg-green-50 rounded-lg">
            <p className="text-lg text-green-700 font-medium">
              Perfect score! You got all kanji correct! 🎉
            </p>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Button 
            onClick={onClose}
            className="bg-zen-600 hover:bg-zen-700 text-white px-8 py-2"
          >
            Close Test
          </Button>
        </div>
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
          {getQuestionText(currentQ)}
        </h3>
        {getQuestionDisplay(currentQ)}
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