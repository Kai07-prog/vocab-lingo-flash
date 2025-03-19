
import { useState, useCallback, memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";

interface FlashcardProps {
  front: string;
  back: string;
  onDelete: () => void;
  onEdit: () => void;
  writingSystem: "hiragana" | "katakana";
  isKanji?: boolean;
  kanji?: string;
}

export const Flashcard = memo(({ 
  front, 
  back, 
  onDelete, 
  onEdit, 
  writingSystem,
  isKanji = false,
  kanji
}: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExiting(true);
    setTimeout(() => {
      onDelete();
    }, 200);
  }, [onDelete]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  }, [onEdit]);

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEdit}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div
        className={`flip-card h-48 w-full ${isFlipped ? "flipped" : ""} ${isExiting ? "exit" : ""}`}
        onClick={handleFlip}
      >
        <div className="flip-card-inner">
          <Card className="flip-card-front flex flex-col items-center justify-center p-6">
            <div className="flex flex-col items-center gap-1">
              <span className={`${writingSystem === "hiragana" ? "japanese-text-hiragana" : "japanese-text-katakana"} text-2xl`}>
                {front}
              </span>
              {isKanji && kanji && (
                <span className="japanese-text-kanji text-3xl text-gray-700">{kanji}</span>
              )}
            </div>
          </Card>
          
          <Card className="flip-card-back flex items-center justify-center p-6">
            <span className="text-xl">{back}</span>
          </Card>
        </div>
      </div>
    </div>
  );
});

Flashcard.displayName = "Flashcard";
