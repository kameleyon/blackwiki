"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
}

export default function TagInput({ id, name, label, placeholder, defaultValue = '' }: TagInputProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (defaultValue) {
      setTags(defaultValue.split(',').map(tag => tag.trim()).filter(Boolean));
    }
  }, [defaultValue]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleBlur = () => {
    if (input) {
      addTag(input);
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-200 mb-1">
        {label}
      </label>
      <input
        type="hidden"
        name={name}
        value={tags.join(',')}
      />
      <div className="flex flex-wrap gap-2 p-2 bg-white/5 border border-gray-700 rounded-lg">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-md text-sm text-gray-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-gray-400 hover:text-gray-200"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          type="text"
          id={id}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="tag flex-1 min-w-[200px] focus:outline-none"
          placeholder={tags.length === 0 ? placeholder : ''}
        />
      </div>
      <p className="mt-1 text-xs text-gray-400">Press Enter or comma to add a tag</p>
    </div>
  );
}
