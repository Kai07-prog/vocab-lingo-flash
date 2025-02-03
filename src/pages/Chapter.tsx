import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VocabularyForm } from "@/components/VocabularyForm";
import { Button } from "@/components/ui/button";
import { Flashcard } from "@/components/Flashcard";
import { VocabularyTest } from "@/components/VocabularyTest";
import { Plus, GraduationCap, PenTool, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Vocabulary {
  id: string;
  meaning: string;
  reading: string;
  kanji: string | null;
  writing_system: "hiragana" | "katakana";
}

const Chapter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chapterId = Number(id);
  const [showForm, setShowForm] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [vocabularyList, setVocabularyList] = useState<Vocabulary[]>([]);
  const [editingVocabulary, setEditingVocabulary] = useState<Vocabulary | null>(null);
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
    }
  };

  const handleAddVocabulary = async (vocabulary: any) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (editingVocabulary) {
      // Update existing vocabulary
      const { error } = await supabase
        .from('vocabulary')
        .update({
          meaning: vocabulary.meaning,
          reading: vocabulary.reading,
          kanji: vocabulary.kanji,
          writing_system: vocabulary.writingSystem,
        })
        .eq('id', editingVocabulary.id);

      if (error) {
        toast({
          title: "Error updating vocabulary",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    } else {
      // Insert new vocabulary
      const { error } = await supabase
        .from('vocabulary')
        .insert({
          chapter_id: chapterId,
          user_id: userData.user.id,
          meaning: vocabulary.meaning,
          reading: vocabulary.reading,
          kanji: vocabulary.kanji,
          writing_system: vocabulary.writingSystem,
        });

      if (error) {
        toast({
          title: "Error adding vocabulary",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    // Refresh the vocabulary list
    await fetchVocabulary();
    setShowForm(false);
    setEditingVocabulary(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('vocabulary')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting vocabulary",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    await fetchVocabulary();
  };

  const handleEdit = (vocabulary: Vocabulary) => {
    setEditingVocabulary(vocabulary);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-[100] bg-white shadow-md hover:bg-gray-100"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="ml-2">Back</span>
      </Button>

      <div className="mt-16">
        <div className="flex gap-4">
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-sakura-500 hover:bg-sakura-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Vocabulary
          </Button>
          <Button 
            className="bg-zen-500 hover:bg-zen-600"
            onClick={() => setShowTest(true)}
          >
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
              initialValues={editingVocabulary ? {
                meaning: editingVocabulary.meaning,
                reading: editingVocabulary.reading,
                kanji: editingVocabulary.kanji,
                writingSystem: editingVocabulary.writing_system
              } : undefined}
            />
          </div>
        )}

        {showTest ? (
          <div className="mt-6">
            <VocabularyTest 
              chapterId={chapterId}
              onClose={() => setShowTest(false)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {vocabularyList.map((vocabulary) => (
              <Flashcard
                key={vocabulary.id}
                front={vocabulary.reading}
                back={vocabulary.meaning}
                onDelete={() => handleDelete(vocabulary.id)}
                onEdit={() => handleEdit(vocabulary)}
                writingSystem={vocabulary.writing_system}
                isKanji={vocabulary.writing_system === "hiragana" && !!vocabulary.kanji}
                kanji={vocabulary.kanji || undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chapter;