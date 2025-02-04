import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { VocabularyForm } from "@/components/VocabularyForm";
import { Button } from "@/components/ui/button";
import { Flashcard } from "@/components/Flashcard";
import { Plus } from "lucide-react";
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
  const chapterId = Number(id);
  const [showForm, setShowForm] = useState(false);
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
          kanji: vocabulary.kanji || null,
          writing_system: vocabulary.writingSystem,
        })
        .eq('id', editingVocabulary.id)
        .eq('user_id', userData.user.id);

      if (error) {
        toast({
          title: "Error updating vocabulary",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    } else {
      // Add new vocabulary
      const { error } = await supabase
        .from('vocabulary')
        .insert({
          chapter_id: chapterId,
          user_id: userData.user.id,
          meaning: vocabulary.meaning,
          reading: vocabulary.reading,
          kanji: vocabulary.kanji || null,
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

    await fetchVocabulary();
    setShowForm(false);
    setEditingVocabulary(null);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          onClick={() => setShowForm(true)} 
          className="mb-6 bg-sakura-500 hover:bg-sakura-600"
          disabled={showForm}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Vocabulary
        </Button>

        {showForm && (
          <div className="mb-8">
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
                kanji: editingVocabulary.kanji || "",
                writingSystem: editingVocabulary.writing_system,
              } : undefined}
            />
          </div>
        )}

        {!showForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vocabularyList.map((vocabulary) => (
              <Flashcard
                key={vocabulary.id}
                front={vocabulary.reading}
                back={vocabulary.meaning}
                writingSystem={vocabulary.writing_system}
                isKanji={vocabulary.writing_system === "hiragana" && !!vocabulary.kanji}
                kanji={vocabulary.kanji || undefined}
                onEdit={() => {
                  setEditingVocabulary(vocabulary);
                  setShowForm(true);
                }}
                onDelete={async () => {
                  const { error } = await supabase
                    .from('vocabulary')
                    .delete()
                    .eq('id', vocabulary.id);

                  if (error) {
                    toast({
                      title: "Error deleting vocabulary",
                      description: error.message,
                      variant: "destructive",
                    });
                    return;
                  }

                  await fetchVocabulary();
                  toast({
                    title: "Vocabulary deleted",
                    description: "The vocabulary has been removed",
                  });
                }}
              />
            ))}
          </div>
        )}

        {!showForm && vocabularyList.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zen-500 text-lg">No vocabulary words yet. Add your first word to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chapter;