"use client";

import MermaidDiagram from './MermaidDiagram';

interface DiagramModalProps {
  chart: string;
  onClose: () => void;
}

const DiagramModal = ({ chart, onClose }: DiagramModalProps) => {
  // A dummy onFullscreen function for the diagram inside the modal
  const handleFullscreen = () => {};

  return (
    // UI TWEAK: The overlay uses a semi-transparent paper white for a softer feel.
    <div className="fixed inset-0 bg-[#F5F5EC]/90 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      {/* UI TWEAK: Reduced padding from p-4 to p-8 on desktop, and used w-full/h-full with max constraints to make it responsive. */}
      <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] bg-white rounded-lg shadow-2xl border-2 border-dashed border-gray-300" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-red-600 transition-transform hover:scale-110"
        >
          &times;
        </button>
        {/* Pass the dummy function to satisfy the component's prop requirement */}
        <MermaidDiagram chart={chart} onFullscreen={handleFullscreen} />
      </div>
    </div>
  );
};

export default DiagramModal;
