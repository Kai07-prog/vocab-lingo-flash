import { useState } from "react";
import { useParams } from "react-router-dom";
import { VocabularyForm } from "@/components/VocabularyForm";
import { Button } from "@/components/ui/button";
import { Flashcard } from "@/components/Flashcard";
import { Plus, GraduationCap, PenTool } from "lucide-react";

interface Vocabulary {
  id: string;
  meaning: string;
  reading: string;
  kanji: string | null;
  writingSystem: "hiragana" | "katakana";
}

const Chapter = () => {
  const { id } = useParams();
  const chapterId = Number(id);
  const [showForm, setShowForm] = useState(false);
  const [vocabularyList, setVocabularyList] = useState<Vocabulary[]>([]);
  const [editingVocabulary, setEditingVocabulary] = useState<Vocabulary | null>(null);

  const handleAddVocabulary = (vocabulary: any) => {
    const newVocabulary = {
      ...vocabulary,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    if (editingVocabulary) {
      setVocabularyList(vocabularyList.map(v => 
        v.id === editingVocabulary.id ? newVocabulary : v
      ));
      setEditingVocabulary(null);
    } else {
      setVocabularyList([...vocabularyList, newVocabulary]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setVocabularyList(vocabularyList.filter(v => v.id !== id));
  };

  const handleEdit = (vocabulary: Vocabulary) => {
    setEditingVocabulary(vocabulary);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex gap-4 mb-6">
        <Button 
          onClick={() => setShowForm(true)} 
          className="bg-sakura-500 hover:bg-sakura-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Vocabulary
        </Button>
        <Button className="bg-zen-500 hover:bg-zen-600">
          <GraduationCap className="mr-2 h-4 w-4" />
          Start Test
        </Button>
        <Button className="bg-zen-500 hover:bg-zen-600">
          <PenTool className="mr-2 h-4 w-4" />
          Kanji Test
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <VocabularyForm 
            chapterId={chapterId} 
            onAdd={handleAddVocabulary}
            onCancel={() => {
              setShowForm(false);
              setEditingVocabulary(null);
            }}
            initialValues={editingVocabulary || undefined}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vocabularyList.map((vocabulary) => (
          <Flashcard
            key={vocabulary.id}
            front={vocabulary.writingSystem === "hiragana" ? vocabulary.kanji || vocabulary.reading : vocabulary.reading}
            back={vocabulary.meaning}
            onDelete={() => handleDelete(vocabulary.id)}
            onEdit={() => handleEdit(vocabulary)}
          />
        ))}
      </div>
    </div>
  );
};

export default Chapter;