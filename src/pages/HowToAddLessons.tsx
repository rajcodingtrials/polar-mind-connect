import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TherapistHeader from "@/components/therapist/TherapistHeader";
import Footer from "@/components/Footer";
import { ArrowLeft, FileText, Folder, Image, CheckCircle, AlertCircle } from "lucide-react";

const HowToAddLessons = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <TherapistHeader />
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/therapist-my-profile')}
              className="text-slate-700 hover:bg-slate-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <h1 className="text-3xl font-bold text-slate-800">How to Add Lessons</h1>
          </div>

          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                To upload lessons to the platform, you need to organize your lesson files in a specific directory structure. 
                Each lesson should be in its own folder with a <code className="bg-slate-100 px-2 py-1 rounded">lesson.json</code> file 
                and any associated image files. Image files should be in jpg or png formats.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> After uploading, your lessons will need to be reviewed and approved by an admin 
                  before they appear in the lesson plan.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Directory Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Directory Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Organize your lessons in the following structure:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 font-mono text-sm">
                <div className="text-slate-600">lessons/</div>
                <div className="ml-4 mt-2">
                  <div className="text-slate-600">lesson-1/</div>
                  <div className="ml-4 mt-1">
                    <div className="text-blue-600">lesson.json</div>
                    <div className="text-green-600">question-image-1.jpg</div>
                    <div className="text-green-600">choice-image-1.jpg</div>
                    <div className="text-green-600">choice-image-2.jpg</div>
                  </div>
                </div>
                <div className="ml-4 mt-2">
                  <div className="text-slate-600">lesson-2/</div>
                  <div className="ml-4 mt-1">
                    <div className="text-blue-600">lesson.json</div>
                    <div className="text-green-600">question-image-1.jpg</div>
                    <div className="text-green-600">choice-image-1.jpg</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* lesson.json Format */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                lesson.json Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Each lesson folder must contain a <code className="bg-slate-100 px-2 py-1 rounded">lesson.json</code> file 
                with the following structure:
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <pre className="text-xs overflow-x-auto">
{`{
  "question_type": "first_words",
  "lesson": "My First Lesson",
  "description": "A description of the lesson",
  "difficulty_level": "beginner",
  "youtube_video_id": "optional-youtube-id",
  "add_mini_celebration": true,
  "questions": [
    {
      "question_text": "What is this?",
      "question_speech": "What is this?",
      "description_text": "Look at the image",
      "answer": "Apple",
      "answer_index": 0,
      "question_image": "question-image-1.jpg",
      "choices_text": "Apple, Banana, Orange",
      "choices_image": "choice-image-1.jpg, choice-image-2.jpg, choice-image-3.jpg"
    }
  ]
}`}
                </pre>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">Required Fields:</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">question_type</code> - One of: <code className="bg-slate-100 px-1 rounded">first_words</code>, <code className="bg-slate-100 px-1 rounded">question_time</code>, <code className="bg-slate-100 px-1 rounded">build_sentence</code>, <code className="bg-slate-100 px-1 rounded">lets_chat</code>, <code className="bg-slate-100 px-1 rounded">tap_and_play</code>, <code className="bg-slate-100 px-1 rounded">story_activity</code>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">lesson</code> - The name of the lesson.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">questions</code> - Array of question objects.</span>
                  </li>
                </ul>

                <h3 className="font-semibold text-slate-800 mt-4">Optional Fields:</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">description</code> - Lesson description.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">difficulty_level</code> - One of: "beginner", "intermediate", or "advanced". Defaults to "beginner".</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">youtube_video_id</code> - Optional YouTube video ID.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">add_mini_celebration</code> - Boolean, defaults to true. If set to true, a smaller celebration is shown after the child answers each question correctly. If set to false or not set, celebration is shown only once the child completes the entire lesson.</span>
                  </li>
                </ul>

                <h3 className="font-semibold text-slate-800 mt-4">Question Object Fields:</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">question_text</code> - The text to show at the top of the question above the image.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">question_speech</code> - The speech that is read by the AI agent to the child.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">description_text</code> - Question description text to show below the question image in smaller font.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">answer</code> - The correct answer. If this field is non-empty, a microphone is shown to collect the child's answer and the AI agent will verify if it is correct.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">choices_text</code> or <code className="bg-slate-100 px-1 rounded">choices</code> - Comma-separated choice texts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">choices_image</code> - Array or comma-separated string of image file paths.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">answer_index</code> - Index of correct answer (0-based). If the answer field is empty and answer_index has a value greater than or equal to zero, a tap and play question is created by making the different choice images clickable. When the child clicks one of those choice images, the AI agent will verify if the choice clicked is correct and gives feedback to the child. If answer is empty and answer_index is negative, after the question speech is read by the AI agent, the next question is shown. This option is useful to show scenes without questions in story time questions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><code className="bg-slate-100 px-1 rounded">question_image</code> - Path to question image file (relative to lesson folder).</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Image Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Image Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Image files should be placed in the same folder as the <code className="bg-slate-100 px-2 py-1 rounded">lesson.json</code> file.
                Reference them using their filename (relative to the lesson folder).
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <p className="text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  <strong>Important:</strong> Image file paths in <code className="bg-amber-100 px-1 rounded">question_image</code> and 
                  <code className="bg-amber-100 px-1 rounded">choices_image</code> should match the actual filenames in your folder. 
                  The system will verify that all referenced images exist before uploading.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upload Process */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Upload Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 list-decimal list-inside text-slate-700">
                <li>Organize your lessons in folders as described above</li>
                <li>Go to your profile page and click "Upload Lessons from Directory"</li>
                <li>Click "Browse" and select the parent folder containing all your lesson folders</li>
                <li>The system will verify all lessons before uploading</li>
                <li>If verification passes, the upload will begin automatically</li>
                <li>After successful upload, your lessons will be queued for admin review</li>
              </ol>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-800">
                  <strong>Tip:</strong> You can upload multiple lessons at once by selecting a folder that contains multiple lesson subfolders.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Common Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Common Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-slate-800">Invalid question_type</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Make sure your <code className="bg-slate-100 px-1 rounded">question_type</code> is one of the valid types listed above.
                    Note: <code className="bg-slate-100 px-1 rounded">story_time</code> will be automatically converted to <code className="bg-slate-100 px-1 rounded">story_activity</code>.
                  </p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-slate-800">Image file not found</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Ensure all image paths in your <code className="bg-slate-100 px-1 rounded">lesson.json</code> match the actual filenames 
                    in your folder. Check for typos, case sensitivity, and file extensions.
                  </p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-slate-800">Duplicate lesson</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    A lesson with the same name and question_type already exists. Either rename your lesson or update the existing one.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => navigate('/therapist-my-profile')}
              className="bg-slate-700 hover:bg-slate-800 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowToAddLessons;

