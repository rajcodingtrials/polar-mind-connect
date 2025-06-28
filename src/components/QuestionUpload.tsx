
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, Image, Trash2, Tag } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
  questionType?: string;
}

interface QuestionUploadProps {
  onQuestionsUploaded: (questions: Question[], images: File[], questionType: string) => void;
}

const QuestionUpload = ({ onQuestionsUploaded }: QuestionUploadProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('question_time');
  const { toast } = useToast();

  const questionTypes = [
    { value: 'first_words', label: 'First Words' },
    { value: 'question_time', label: 'Question Time' },
    { value: 'build_sentence', label: 'Build a Sentence' },
    { value: 'lets_chat', label: 'Lets Chat' }
  ];

  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        if (Array.isArray(jsonData)) {
          const formattedQuestions = jsonData.map((item, index) => ({
            id: `q_${index}`,
            question: item.question || '',
            answer: item.answer || '',
            imageName: item.imageName || item.image || '',
            questionType: item.questionType || selectedQuestionType
          }));
          setQuestions(formattedQuestions);
          toast({
            title: "Questions loaded",
            description: `Loaded ${formattedQuestions.length} questions from JSON file`,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid JSON file format",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files]);
    toast({
      title: "Images uploaded",
      description: `Added ${files.length} images`,
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a questions JSON file first",
        variant: "destructive",
      });
      return;
    }

    if (!selectedQuestionType) {
      toast({
        title: "Error",
        description: "Please select a question type",
        variant: "destructive",
      });
      return;
    }

    onQuestionsUploaded(questions, images, selectedQuestionType);
    toast({
      title: "Success",
      description: "Questions and images uploaded successfully!",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Questions & Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* JSON File Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            <FileText className="w-4 h-4 inline mr-1" />
            Questions JSON File
          </label>
          <Input
            type="file"
            accept=".json"
            onChange={handleJsonUpload}
            className="cursor-pointer"
          />
          <p className="text-xs text-gray-600">
            Format: {`[{"question": "What is this?", "answer": "apple", "imageName": "apple.jpg"}]`}
          </p>
        </div>

        {/* Images Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            <Image className="w-4 h-4 inline mr-1" />
            Images
          </label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="cursor-pointer"
          />
        </div>

        {/* Question Type Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            <Tag className="w-4 h-4 inline mr-1" />
            Question Type
          </label>
          <Select value={selectedQuestionType} onValueChange={setSelectedQuestionType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              {questionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loaded Questions Preview */}
        {questions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Loaded Questions ({questions.length})</h3>
            <div className="max-h-32 overflow-y-auto space-y-2 bg-gray-50 p-3 rounded-lg">
              {questions.slice(0, 5).map((q, index) => (
                <div key={q.id} className="text-sm p-2 bg-white rounded border">
                  <div className="font-medium">Q: {q.question}</div>
                  <div className="text-gray-600">A: {q.answer}</div>
                  {q.questionType && (
                    <div className="text-xs text-gray-500 mt-1">
                      Type: {questionTypes.find(t => t.value === q.questionType)?.label}
                    </div>
                  )}
                </div>
              ))}
              {questions.length > 5 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  ...and {questions.length - 5} more questions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Uploaded Images Preview */}
        {images.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Uploaded Images ({images.length})</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="bg-white border p-2 rounded text-xs flex items-center gap-2 min-w-0">
                      <Image className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate max-w-24">{img.name}</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-1 -right-1 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="w-2 h-2" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={questions.length === 0 || !selectedQuestionType}
          >
            Upload Questions & Images
          </Button>
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>Note:</strong> Uploaded questions and images will be stored in Supabase and 
          made available for all speech therapy sessions.
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionUpload;
