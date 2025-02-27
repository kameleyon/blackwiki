"use client";

import React, { useState, useEffect } from 'react';
import { FiTag, FiFolder, FiPlus, FiX } from 'react-icons/fi';
import './media.css';

interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

interface MediaOrganizerProps {
  onCategorySelect?: (categoryId: string | null) => void;
  onTagSelect?: (tagIds: string[]) => void;
  selectedCategoryId?: string | null;
  selectedTagIds?: string[];
  onCategoryCreate?: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  onTagCreate?: (tag: Omit<Tag, 'id' | 'createdAt'>) => void;
}

const MediaOrganizer: React.FC<MediaOrganizerProps> = ({
  onCategorySelect,
  onTagSelect,
  selectedCategoryId = null,
  selectedTagIds = [],
  onCategoryCreate,
  onTagCreate,
}) => {
  // State for categories and tags
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(selectedTagIds);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(selectedCategoryId);
  
  // State for creating new categories and tags
  const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryDescription, setNewCategoryDescription] = useState<string>('');
  
  const [isCreatingTag, setIsCreatingTag] = useState<boolean>(false);
  const [newTagName, setNewTagName] = useState<string>('');
  
  // Fetch categories and tags
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        // In a real implementation, you would fetch from an API
        // For now, we'll use mock data
        setCategories([
          {
            id: 'cat-1',
            name: 'Articles',
            description: 'Images for articles',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'cat-2',
            name: 'Profiles',
            description: 'Profile pictures and avatars',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'cat-3',
            name: 'Backgrounds',
            description: 'Background images',
            createdAt: new Date().toISOString(),
          },
        ]);
        
        setTags([
          {
            id: 'tag-1',
            name: 'people',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'tag-2',
            name: 'nature',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'tag-3',
            name: 'history',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'tag-4',
            name: 'culture',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'tag-5',
            name: 'art',
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        console.error('Error fetching categories and tags:', error);
      }
    };
    
    fetchCategoriesAndTags();
  }, []);
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };
  
  // Handle tag selection
  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev => {
      const newSelectedTags = prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId];
      
      if (onTagSelect) {
        onTagSelect(newSelectedTags);
      }
      
      return newSelectedTags;
    });
  };
  
  // Handle category creation
  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory = {
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim() || undefined,
    };
    
    if (onCategoryCreate) {
      onCategoryCreate(newCategory);
    }
    
    // In a real implementation, you would wait for the API response
    // For now, we'll simulate it
    const mockCreatedCategory: Category = {
      ...newCategory,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    setCategories(prev => [...prev, mockCreatedCategory]);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setIsCreatingCategory(false);
  };
  
  // Handle tag creation
  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    
    const newTag = {
      name: newTagName.trim().toLowerCase(),
    };
    
    if (onTagCreate) {
      onTagCreate(newTag);
    }
    
    // In a real implementation, you would wait for the API response
    // For now, we'll simulate it
    const mockCreatedTag: Tag = {
      ...newTag,
      id: `tag-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    setTags(prev => [...prev, mockCreatedTag]);
    setNewTagName('');
    setIsCreatingTag(false);
  };
  
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FiFolder className="mr-2" />
            Categories
          </h3>
          <button
            onClick={() => setIsCreatingCategory(!isCreatingCategory)}
            className="media-control-button"
          >
            {isCreatingCategory ? <FiX /> : <FiPlus />}
          </button>
        </div>
        
        {isCreatingCategory && (
          <div className="mb-3 p-3 bg-black/30 rounded-lg">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="media-search w-full mb-2"
              autoFocus
            />
            <textarea
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              placeholder="Description (optional)"
              className="media-search w-full mb-2 resize-none h-20"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsCreatingCategory(false);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                }}
                className="media-editor-button-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                className={`media-editor-button-apply ${!newCategoryName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Create
              </button>
            </div>
          </div>
        )}
        
        <div className="media-categories">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`media-category ${selectedCategory === null ? 'media-category-active' : 'media-category-inactive'}`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`media-category ${selectedCategory === category.id ? 'media-category-active' : 'media-category-inactive'}`}
              title={category.description}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FiTag className="mr-2" />
            Tags
          </h3>
          <button
            onClick={() => setIsCreatingTag(!isCreatingTag)}
            className="media-control-button"
          >
            {isCreatingTag ? <FiX /> : <FiPlus />}
          </button>
        </div>
        
        {isCreatingTag && (
          <div className="mb-3 p-3 bg-black/30 rounded-lg">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name"
              className="media-search w-full mb-2"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsCreatingTag(false);
                  setNewTagName('');
                }}
                className="media-editor-button-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className={`media-editor-button-apply ${!newTagName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Create
              </button>
            </div>
          </div>
        )}
        
        <div className="media-tags">
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => handleTagSelect(tag.id)}
              className={`media-tag ${selectedTags.includes(tag.id) ? 'media-tag-active' : 'media-tag-inactive'}`}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaOrganizer;
