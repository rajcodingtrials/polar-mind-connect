import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, BookOpen, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { LessonActivity } from "@/hooks/useLessonActivity";
import { LessonReview } from "./LessonReviewModal";

interface LessonActivityHistoryProps {
  lessonActivities: LessonActivity[];
  loading: boolean;
  onReviewClick: (activity: LessonActivity) => void;
  onRetryLesson: (lessonId: string, questionType: string) => void;
  hideTitle?: boolean;
}

const LessonActivityHistory: React.FC<LessonActivityHistoryProps> = ({
  lessonActivities,
  loading,
  onReviewClick,
  onRetryLesson,
  hideTitle = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Sort lesson activities: most recent first
  const sortedLessonActivities = [...lessonActivities].sort((a, b) => {
    const dateA = new Date(a.completed_at);
    const dateB = new Date(b.completed_at);
    return dateB.getTime() - dateA.getTime();
  });

  // Get visible lesson activities based on expanded state
  const visibleLessonActivities = expanded 
    ? sortedLessonActivities 
    : sortedLessonActivities.slice(0, 3);

  const formatQuestionType = (type: string) => {
    const typeMap: Record<string, string> = {
      'first_words': 'First Words',
      'question_time': 'Question Time',
      'tap_and_play': 'Tap and Play',
      'build_sentence': 'Build a Sentence',
      'lets_chat': 'Lets Chat',
      'story_activity': 'Story Activity',
    };
    return typeMap[type] || type;
  };

  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'started':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string | null | undefined) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Define alternating row styles with two shades of blue/gray
  const getRowStyle = (index: number) => {
    const isEven = index % 2 === 0;
    return {
      bgColor: isEven ? 'bg-blue-50' : 'bg-slate-50',
      hoverColor: isEven ? 'hover:bg-blue-100' : 'hover:bg-slate-100',
      textColor: isEven ? 'text-blue-900' : 'text-slate-900',
    };
  };

  if (loading) {
    return (
      <div>
        {!hideTitle && <h2 className="text-xl font-bold text-slate-700 mb-4 px-4 text-left">Learning History</h2>}
        <div className="text-center py-8 text-slate-600">Loading learning history...</div>
      </div>
    );
  }

  if (lessonActivities.length === 0) {
    return (
      <div>
        {!hideTitle && <h2 className="text-xl font-bold text-slate-700 mb-4 px-4 text-left">Learning History</h2>}
        <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-slate-600">No lessons completed yet. Start learning with Laura or Lawrence!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!hideTitle && <h2 className="text-xl font-bold text-slate-700 mb-4 px-4 text-left">Learning History ({lessonActivities.length})</h2>}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-64">Lesson</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-56">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-52">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visibleLessonActivities.map((activity, index) => {
              const completedDate = new Date(activity.completed_at);
              const formattedDate = format(completedDate, "MMM dd, yyyy");
              const formattedTime = format(completedDate, "h:mm a");
              const rowStyle = getRowStyle(index);
              
              return (
                <tr
                  key={activity.id}
                  className={`${rowStyle.bgColor} ${rowStyle.hoverColor} ${rowStyle.textColor} transition-all duration-300`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-left w-64">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate">
                          {activity.lesson?.name || 'Unknown Lesson'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-left w-56">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formattedDate} • {formattedTime}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-left w-32">
                    <Badge className={`${getStatusColor(activity.status)} text-xs`}>
                      {formatStatus(activity.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-left w-52">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReviewClick(activity)}
                      >
                        <Star className="w-3 h-3 mr-2" />
                        Review
                      </Button>
                      {activity.lesson && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRetryLesson(activity.lesson_id, activity.lesson.question_type)}
                        >
                          <RotateCcw className="w-3 h-3 mr-2" />
                          Try Again
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sortedLessonActivities.length > 3 && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 mx-auto"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show All ({sortedLessonActivities.length - 3} more)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LessonActivityHistory;

