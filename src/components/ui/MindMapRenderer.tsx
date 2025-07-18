"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

interface MindMapRendererProps {
  markdown: string;
}

export interface MindMapRendererRef {
  download: (filename?: string) => Promise<void>;
}

export const MindMapRenderer = forwardRef<MindMapRendererRef, MindMapRendererProps>(
  ({ markdown }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    // FIX: Add a state to track when the component has mounted on the client
    const [isMounted, setIsMounted] = useState(false);

    // FIX: This effect runs once on the client to confirm hydration is complete
    useEffect(() => {
      setIsMounted(true);
    }, []);

    useEffect(() => {
      // FIX: Do not attempt to render until the component is mounted in the browser
      if (!isMounted || !svgRef.current) {
        return;
      }

      // Clear previous render to prevent duplicates
      svgRef.current.innerHTML = '';

      const transformer = new Transformer();
      const { root, features } = transformer.transform(markdown);
      const { styles } = transformer.getUsedAssets(features);

      if (styles) {
        const style = document.createElement('style');
        style.textContent = styles.map(s => s.data).join('\n');
        document.head.appendChild(style);
      }

      const mm = Markmap.create(svgRef.current, undefined, root);
      
      // Delay the fit() call to ensure the container has dimensions
      setTimeout(() => mm.fit(), 50);

      return () => {
        mm.destroy(); // Cleanup the markmap instance
      };
    }, [markdown, isMounted]); // Depend on isMounted

    // Expose download functionality through ref
    useImperativeHandle(ref, () => ({
      download: async (filename = 'mindmap.png') => {
        if (!svgRef.current) {
          console.warn('SVG element not available for download');
          return;
        }

        try {
          // Convert SVG to PNG
          const dataUrl = await toPng(svgRef.current as unknown as HTMLElement, {
            cacheBust: true,
            backgroundColor: '#ffffff',
            width: svgRef.current.clientWidth,
            height: svgRef.current.clientHeight,
            style: {
              transform: 'scale(1)',
              transformOrigin: 'top left'
            }
          });
          
          // Save the image
          saveAs(dataUrl, filename);
        } catch (error) {
          console.error('Failed to download mind map:', error);
          throw error;
        }
      }
    }), []);

    // FIX: Return null during SSR to prevent hydration mismatch
    if (!isMounted) {
      return null;
    }

    return <svg ref={svgRef} className="w-full h-full" style={{ minHeight: '500px' }} />;
  }
);

MindMapRenderer.displayName = 'MindMapRenderer';

export default MindMapRenderer;

