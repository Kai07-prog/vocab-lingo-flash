import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VocabularyForm } from "@/components/VocabularyForm";
import { Button } from "@/components/ui/button";
import { Flashcard } from "@/components/Flashcard";
import { Plus, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { VocabularyTest } from "@/components/VocabularyTest";
import { KanjiTest } from "@/components/KanjiTest";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface Vocabulary {
  id: string;
  meaning: string;
  reading: string;
  kanji: string | null;
  writing_system: "hiragana" | "katakana";
}

type TestType = "none" | "vocabulary" | "kanji";

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
  const [activeTest, setActiveTest] = useState<TestType>("none");
  const isMobile = useIsMobile();

  const fetchVocabulary = useCallback(async () => {
    try {
      console.log('Fetching vocabulary for chapter:', chapterId, 'user:', user?.id);
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
        console.log('Fetched vocabulary:', data);
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
  }, [chapterId, user, toast]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchVocabulary();
  }, [chapterId, user, navigate, fetchVocabulary]);

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

  const handleEditVocabulary = useCallback((vocabulary: Vocabulary) => {
    setEditingVocabulary(vocabulary);
    setShowForm(true);
  }, []);

  const handleDeleteVocabulary = useCallback(async (vocabularyId: string) => {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .delete()
        .eq('id', vocabularyId)
        .eq('user_id', user?.id);

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
  }, [user, toast, fetchVocabulary]);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingVocabulary(null);
  }, []);

  const handleCloseTest = useCallback(() => {
    setActiveTest("none");
  }, []);

  const startVocabularyTest = useCallback(() => {
    setActiveTest("vocabulary");
  }, []);

  const startKanjiTest = useCallback(() => {
    setActiveTest("kanji");
  }, []);

  const flashcardList = useMemo(() => {
    return vocabularyList.map((vocabulary) => (
      <Flashcard
        key={vocabulary.id}
        front={vocabulary.reading}
        back={vocabulary.meaning}
        writingSystem={vocabulary.writing_system}
        isKanji={vocabulary.writing_system === "hiragana" && !!vocabulary.kanji}
        kanji={vocabulary.kanji || undefined}
        onEdit={() => handleEditVocabulary(vocabulary)}
        onDelete={() => handleDeleteVocabulary(vocabulary.id)}
      />
    ));
  }, [vocabularyList, handleEditVocabulary, handleDeleteVocabulary]);

  const renderTest = () => {
    switch (activeTest) {
      case "vocabulary":
        return <VocabularyTest chapterId={chapterId} onClose={handleCloseTest} />;
      case "kanji":
        return <KanjiTest chapterId={chapterId} onClose={handleCloseTest} />;
      default:
        return (
          <div className="w-full h-full">
            <ScrollArea className="h-[calc(100vh-4rem)] scrollbar-none">
              <div className="container mx-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 w-full md:w-auto"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Chapters
                      </Button>
                      <Button 
                        onClick={() => setShowForm(true)} 
                        className="bg-sakura-500 hover:bg-sakura-600 w-full md:w-auto"
                        disabled={showForm}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Vocabulary
                      </Button>
                    </div>
                    {vocabularyList.length > 0 && (
                      <div className="flex flex-col md:flex-row gap-2">
                        <Button
                          onClick={startVocabularyTest}
                          className="bg-zen-600 hover:bg-zen-700"
                        >
                          Start Test
                        </Button>
                        <Button
                          onClick={startKanjiTest}
                          className="bg-zen-600 hover:bg-zen-700"
                        >
                          Kanji Test
                        </Button>
                      </div>
                    )}
                  </div>

                  {showForm && (
                    <div className="mb-8">
                      <VocabularyForm
                        chapterId={chapterId}
                        onAdd={handleAddVocabulary}
                        onCancel={handleCancelForm}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {flashcardList}
                    </div>
                  )}

                  {!showForm && vocabularyList.length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-zen-500 text-lg">No vocabulary words yet. Add your first word to get started!</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        );
    }
  };

  return renderTest();
};

export default Chapter;
