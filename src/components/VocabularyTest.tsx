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

export const VocabularyTest = ({ chapterId, onClose }: VocabularyTestProps) => {
  const [vocabularyList, setVocabularyList] = useState<Vocabulary[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [askMeaning, setAskMeaning] = useState(true); // Toggle between asking meaning or reading
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
      setIsLoading(false);
    }
  };

  const checkAnswer = () => {
    const currentVocab = vocabularyList[currentQuestion];
    const isCorrect = askMeaning 
      ? userAnswer.toLowerCase() === currentVocab.meaning.toLowerCase()
      : userAnswer === currentVocab.reading;

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
        description: `The correct answer was: ${askMeaning ? currentVocab.meaning : currentVocab.reading}`,
        variant: "destructive",
        duration: 2000,
      });
    }

    setUserAnswer("");
    if (currentQuestion < vocabularyList.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAskMeaning(!askMeaning);
    } else {
      // Test completed
      toast({
        title: "Test completed!",
        description: `Your score: ${score + (isCorrect ? 1 : 0)}/${vocabularyList.length}`,
        duration: 3000,
      });
      setTimeout(onClose, 3000);
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

  const currentVocab = vocabularyList[currentQuestion];

  return (
    <Card className="p-6 max-w-xl mx-auto">
      <div className="text-right mb-4">
        <span className="text-sm text-gray-500">
          Question {currentQuestion + 1} of {vocabularyList.length}
        </span>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          {askMeaning 
            ? `What is the meaning of:`
            : `What is the ${currentVocab.writingSystem} reading for:`
          }
        </h3>
        <p className={`text-center mb-4 ${askMeaning ? currentVocab.writingSystem === "hiragana" ? "japanese-text-hiragana" : "japanese-text-katakana" : ""}`}>
          {askMeaning ? currentVocab.reading : currentVocab.meaning}
        </p>
        {currentVocab.kanji && askMeaning && (
          <p className="japanese-text-kanji text-center mb-4">{currentVocab.kanji}</p>
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