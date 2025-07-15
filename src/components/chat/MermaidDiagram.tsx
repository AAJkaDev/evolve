"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

interface MermaidDiagramProps {
  chart: string;
  onFullscreen: () => void;
  isFullscreen?: boolean;
}

const generateId = () => `mermaid-diagram-${Math.random().toString(36).substr(2, 9)}`;

const MermaidDiagram = ({ chart, onFullscreen, isFullscreen = false }: MermaidDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [diagramId] = useState(generateId());
  const [isError, setIsError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- UTILITIES LOGIC START ---
  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(chart);
    // You can add a toast notification here for better UX
  }, [chart]);

  const handleDownload = useCallback(async () => {
    if (containerRef.current) {
      try {
        const [{ toPng }, { saveAs }] = await Promise.all([
          import('html-to-image'),
          import('file-saver')
        ]);
        
        const dataUrl = await toPng(containerRef.current, { cacheBust: true, backgroundColor: '#ffffff' });
        saveAs(dataUrl, 'diagram.png');
      } catch (err) {
        console.error('Failed to download image', err);
      }
    }
  }, []);
  // --- UTILITIES LOGIC END ---

  useEffect(() => {
    if (!isClient) return;
    
    setIsError(false);
    let isMounted = true;
    let panZoomInstance: SvgPanZoom.Instance | null = null;
    let resizeObserver: ResizeObserver | null = null;
    const currentContainer = containerRef.current;

    const renderDiagram = async () => {
      if (!currentContainer || !isMounted) return;

      try {
        const [mermaidLib, svgPanZoomLib] = await Promise.all([
          import('mermaid'),
          import('svg-pan-zoom')
        ]);
        
        const mermaid = mermaidLib.default;
        const svgPanZoom = svgPanZoomLib.default;
        
        // Clean up the chart syntax to fix common issues
        const cleanedChart = chart
          .replace(/\[([^\]]+)\]/g, (match, content) => {
            // Remove problematic characters from node labels
            const cleaned = content.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
            return `[${cleaned}]`;
          })
          .replace(/\(([^\)]+)\)/g, (match, content) => {
            // Clean rounded rectangles
            const cleaned = content.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
            return `(${cleaned})`;
          });
        
        const { svg } = await mermaid.render(diagramId, cleanedChart);
        if (currentContainer && isMounted) {
          currentContainer.innerHTML = svg;
          const svgElement = currentContainer.querySelector('svg');

          if (svgElement) {
            svgElement.style.width = '100%';
            svgElement.style.height = '100%';
            svgElement.style.maxWidth = '100%';
            svgElement.style.display = 'block';

            panZoomInstance = svgPanZoom(svgElement, {
              panEnabled: true,
              zoomEnabled: true,
              controlIconsEnabled: false,
              fit: true,
              center: true,
              minZoom: 0.2,
            });

            resizeObserver = new ResizeObserver(() => {
              panZoomInstance?.resize();
              panZoomInstance?.fit();
              panZoomInstance?.center();
            });
            resizeObserver.observe(currentContainer);
          }
        }
      } catch (error) {
        console.error("Mermaid rendering failed:", error);
        if (currentContainer && isMounted) {
           const errorMessage = error instanceof Error ? error.message : 'Unknown error';
           currentContainer.innerHTML = `
             <div class="p-4 text-red-500 font-mono text-sm">
               <strong>Diagram Error:</strong><br/>
               There is a syntax error in the generated diagram code.<br/>
               <details class="mt-2">
                 <summary class="cursor-pointer text-blue-600 hover:text-blue-800">Show Error Details</summary>
                 <pre class="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">${errorMessage}</pre>
                 <pre class="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">Chart Code:\n${chart}</pre>
               </details>
             </div>`;
        }
        setIsError(true);
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
      panZoomInstance?.destroy();
      if (currentContainer && resizeObserver) {
        resizeObserver.unobserve(currentContainer);
      }
    };
  }, [chart, diagramId, isClient]);

  return (
    <div className="flex flex-col h-full">
        <div 
          ref={containerRef}
          className={`w-full flex-grow overflow-hidden ${isFullscreen ? 'h-full' : 'h-[500px]'}`} 
        >
          {/* The SVG will be injected here. */}
        </div>
        
        {/* --- BUTTONS UI START --- */}
        {!isError && (
            <div className="flex-shrink-0 bg-gray-50/50 p-2 border-t border-dashed border-gray-300 flex items-center justify-end gap-2">
                {!isFullscreen && (
                  <button 
                    onClick={onFullscreen} 
                    className="bg-gray-700 text-white text-xs font-semibold py-1.5 px-3 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Fullscreen
                  </button>
                )}
                <button 
                    onClick={handleCopyCode}
                    className="bg-blue-500 text-white text-xs font-semibold py-1.5 px-3 rounded-md hover:bg-blue-600 transition-colors"
                >
                    Copy Code
                </button>
                <button 
                    onClick={handleDownload}
                    className="bg-green-500 text-white text-xs font-semibold py-1.5 px-3 rounded-md hover:bg-green-600 transition-colors"
                >
                    Download
                </button>
            </div>
        )}
        {/* --- BUTTONS UI END --- */}
    </div>
  );
};

export default MermaidDiagram;

