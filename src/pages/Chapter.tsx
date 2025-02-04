import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VocabularyForm } from "@/components/VocabularyForm";
import { Button } from "@/components/ui/button";
import { Flashcard } from "@/components/Flashcard";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { VocabularyTest } from "@/components/VocabularyTest";

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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showTest, setShowTest] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchVocabulary();
  }, [chapterId, user, navigate]);

  const fetchVocabulary = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('chapter_id', chapterId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error fetching vocabulary:', error);
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
    } catch (error) {
      console.error('Error in fetchVocabulary:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vocabulary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVocabulary = async (vocabulary: any) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to add vocabulary",
          variant: "destructive",
        });
        return;
      }

      if (editingVocabulary) {
        const { error } = await supabase
          .from('vocabulary')
          .update({
            meaning: vocabulary.meaning,
            reading: vocabulary.reading,
            kanji: vocabulary.kanji || null,
            writing_system: vocabulary.writingSystem,
          })
          .eq('id', editingVocabulary.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating vocabulary:', error);
          toast({
            title: "Error updating vocabulary",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Vocabulary updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('vocabulary')
          .insert({
            chapter_id: chapterId,
            user_id: user.id,
            meaning: vocabulary.meaning,
            reading: vocabulary.reading,
            kanji: vocabulary.kanji || null,
            writing_system: vocabulary.writingSystem,
          });

        if (error) {
          console.error('Error adding vocabulary:', error);
          toast({
            title: "Error adding vocabulary",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Vocabulary added successfully",
        });
      }

      await fetchVocabulary();
      setShowForm(false);
      setEditingVocabulary(null);
    } catch (error) {
      console.error('Error in handleAddVocabulary:', error);
      toast({
        title: "Error",
        description: "Failed to process vocabulary. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (showTest) {
    return (
      <VocabularyTest 
        chapterId={chapterId} 
        onClose={() => setShowTest(false)} 
      />
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-sakura-500 hover:bg-sakura-600"
            disabled={showForm}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Vocabulary
          </Button>
          {vocabularyList.length > 0 && (
            <Button
              onClick={() => setShowTest(true)}
              className="bg-zen-600 hover:bg-zen-700"
            >
              Start Test
            </Button>
          )}
        </div>

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
                  if (!user) {
                    toast({
                      title: "Authentication required",
                      description: "Please log in to edit vocabulary",
                      variant: "destructive",
                    });
                    return;
                  }
                  setEditingVocabulary(vocabulary);
                  setShowForm(true);
                }}
                onDelete={async () => {
                  try {
                    if (!user) {
                      toast({
                        title: "Authentication required",
                        description: "Please log in to delete vocabulary",
                        variant: "destructive",
                      });
                      return;
                    }

                    const { error } = await supabase
                      .from('vocabulary')
                      .delete()
                      .eq('id', vocabulary.id)
                      .eq('user_id', user.id);

                    if (error) {
                      console.error('Error deleting vocabulary:', error);
                      toast({
                        title: "Error deleting vocabulary",
                        description: error.message,
                        variant: "destructive",
                      });
                      return;
                    }

                    await fetchVocabulary();
                    toast({
                      title: "Success",
                      description: "Vocabulary deleted successfully",
                    });
                  } catch (error) {
                    console.error('Error in delete operation:', error);
                    toast({
                      title: "Error",
                      description: "Failed to delete vocabulary. Please try again.",
                      variant: "destructive",
                    });
                  }
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