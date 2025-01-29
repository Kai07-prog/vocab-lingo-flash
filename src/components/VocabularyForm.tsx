import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface VocabularyFormProps {
  chapterId: number;
  onAdd: (vocabulary: any) => void;
  onCancel: () => void;
  initialValues?: {
    meaning: string;
    reading: string;
    kanji: string | null;
    writingSystem: "hiragana" | "katakana";
  };
}

export const VocabularyForm = ({ 
  chapterId, 
  onAdd, 
  onCancel,
  initialValues 
}: VocabularyFormProps) => {
  const [writingSystem, setWritingSystem] = useState<"hiragana" | "katakana">(
    initialValues?.writingSystem || "hiragana"
  );
  const [meaning, setMeaning] = useState(initialValues?.meaning || "");
  const [reading, setReading] = useState(initialValues?.reading || "");
  const [kanji, setKanji] = useState(initialValues?.kanji || "");
  
  const { toast } = useToast();

  useEffect(() => {
    if (initialValues) {
      setWritingSystem(initialValues.writingSystem);
      setMeaning(initialValues.meaning);
      setReading(initialValues.reading);
      setKanji(initialValues.kanji || "");
    }
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const vocabulary = {
      meaning,
      reading,
      kanji: writingSystem === "hiragana" ? kanji : null,
      chapterId,
      writingSystem,
    };

    onAdd(vocabulary);
    toast({
      title: initialValues ? "Vocabulary updated" : "Vocabulary added",
      description: initialValues 
        ? "The vocabulary has been updated successfully" 
        : "New vocabulary has been added to the chapter",
      duration: 2000, // 2 seconds
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      <div>
        <Select
          value={writingSystem}
          onValueChange={(value: "hiragana" | "katakana") => setWritingSystem(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select writing system" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hiragana">Hiragana</SelectItem>
            <SelectItem value="katakana">Katakana</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Input 
        value={meaning}
        onChange={(e) => setMeaning(e.target.value)}
        placeholder="Meaning" 
        required 
      />
      
      <Input 
        value={reading}
        onChange={(e) => setReading(e.target.value)}
        placeholder={`Reading (${writingSystem})`} 
        required 
      />
      
      {writingSystem === "hiragana" && (
        <Input 
          value={kanji}
          onChange={(e) => setKanji(e.target.value)}
          placeholder="Kanji (optional)" 
        />
      )}

      <div className="flex gap-4">
        <Button 
          type="submit" 
          className="flex-1 bg-sakura-500 hover:bg-sakura-600"
        >
          {initialValues ? "Update" : "Add"} Vocabulary
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};