"use client";

import { useEffect, useState } from 'react';
import { extractTableOfContents, processArticleContent } from '@/lib/markdownCleaner';

interface TableOfContentsProps {
  content: string;
}

interface TocItem {
  text: string;
  level: number;
  id: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from processed content to guarantee exact ID/text parity
    const processedContent = processArticleContent(content);
    const headings = extractTableOfContents(processedContent);
    setTocItems(headings);
    
    // Set up intersection observer to highlight current section
    const observerOptions = {
      rootMargin: '0px 0px -80% 0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all heading elements
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [content]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  if (tocItems.length === 0) {
    return (
      <div className="bg-white/5 rounded-lg p-4">
        <h3 className="text-lg font-normal mb-4">Table of Contents</h3>
        <div className="text-sm text-white/70">
          <p>No headings found in this article.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg p-4">
      <h3 className="text-lg font-normal mb-4">Table of Contents</h3>
      <nav className="space-y-1">
        {tocItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleClick(item.id)}
            className={`
              block w-full text-left text-sm py-1 px-2 rounded transition-colors
              ${activeId === item.id 
                ? 'bg-white/10 text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/5'
              }
              ${item.level === 1 ? 'font-medium' : ''}
              ${item.level === 2 ? 'ml-2' : ''}
              ${item.level === 3 ? 'ml-4' : ''}
              ${item.level === 4 ? 'ml-6' : ''}
              ${item.level === 5 ? 'ml-8' : ''}
              ${item.level === 6 ? 'ml-10' : ''}
            `}
          >
            {item.text}
          </button>
        ))}
      </nav>
      
      {tocItems.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/60">
          <p>{tocItems.length} section{tocItems.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  );
}