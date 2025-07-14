import React from 'react';
import { Subject } from '@/types';
import { Button } from '@/components/ui/Button';

interface SubjectCardProps {
  subject: Subject;
  onStartLearning?: (subjectId: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onStartLearning }) => {
  const handleStartLearning = () => {
    if (onStartLearning && subject.available) {
      onStartLearning(subject.id);
    }
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border-2 border-dashed border-[${subject.color}] hover:shadow-lg transition-shadow`}>
      <div className="flex items-center mb-4">
        <div className={`text-3xl text-[${subject.color}] mr-3`}>
          {subject.icon}
        </div>
        <h3 className="text-xl font-semibold text-[#1A1A1A]">{subject.title}</h3>
      </div>
      <p className="text-[#363636] mb-4">{subject.description}</p>
      <Button
        onClick={handleStartLearning}
        disabled={!subject.available}
        className={`text-sm px-4 py-2 bg-[${subject.color}] text-black hover:bg-[#34C9A3] hover:text-black transition-colors duration-300`}
      >
        {subject.available ? 'Start Learning' : 'Coming Soon'}
      </Button>
    </div>
  );
};

export default SubjectCard;
