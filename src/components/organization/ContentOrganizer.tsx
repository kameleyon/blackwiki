"use client";

import React, { useState, useEffect } from 'react';
import { FiTag, FiFolder, FiPlus, FiX, FiEdit2, FiTrash2, FiLink } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  articleCount: number;
}

interface Tag {
  id: string;
  name: string;
  createdAt: string;
  articleCount: number;
}

interface RelatedContent {
  id: string;
  title: string;
  type: 'article' | 'category' | 'tag';
  relationship: 'parent' | 'child' | 'related';
}

interface ContentOrganizerProps {
  onCategorySelect?: (categoryId: string | null) => void;
  onTagSelect?: (tagIds: string[]) => void;
  selectedCategoryId?: string | null;
  selectedTagIds?: string[];
  onCategoryCreate?: (category: Omit<Category, 'id' | 'createdAt' | 'articleCount'>) => void;
  onTagCreate?: (tag: Omit<Tag, 'id' | 'createdAt' | 'articleCount'>) => void;
  onRelationshipCreate?: (sourceId: string, targetId: string, type: string) => void;
}

const ContentOrganizer: React.FC<ContentOrganizerProps> = ({
  onCategorySelect,
  onTagSelect,
  selectedCategoryId = null,
  selectedTagIds = [],
  onCategoryCreate,
  onTagCreate,
  onRelationshipCreate,
}) => {
  // State for categories and tags
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [relatedContent, setRelatedContent] = useState<RelatedContent[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(selectedTagIds);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(selectedCategoryId);
  
  // State for creating new categories and tags
  const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryDescription, setNewCategoryDescription] = useState<string>('');
  
  const [isCreatingTag, setIsCreatingTag] = useState<boolean>(false);
  const [newTagName, setNewTagName] = useState<string>('');
  
  // State for creating relationships
  const [isCreatingRelationship, setIsCreatingRelationship] = useState<boolean>(false);
  const [relationshipSource, setRelationshipSource] = useState<string>('');
  const [relationshipTarget, setRelationshipTarget] = useState<string>('');
  const [relationshipType, setRelationshipType] = useState<string>('related');
  
  // Fetch categories and tags
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        // In a real implementation, you would fetch from an API
        // For now, we'll use mock data
        setCategories([
          {
            id: 'cat-1',
            name: 'History',
            description: 'Historical articles and events',
            createdAt: new Date().toISOString(),
            articleCount: 24,
          },
          {
            id: 'cat-2',
            name: 'Culture',
            description: 'Cultural topics and traditions',
            createdAt: new Date().toISOString(),
            articleCount: 18,
          },
          {
            id: 'cat-3',
            name: 'Science',
            description: 'Scientific discoveries and innovations',
            createdAt: new Date().toISOString(),
            articleCount: 12,
          },
        ]);
        
        setTags([
          {
            id: 'tag-1',
            name: 'civil rights',
            createdAt: new Date().toISOString(),
            articleCount: 15,
          },
          {
            id: 'tag-2',
            name: 'music',
            createdAt: new Date().toISOString(),
            articleCount: 22,
          },
          {
            id: 'tag-3',
            name: 'literature',
            createdAt: new Date().toISOString(),
            articleCount: 9,
          },
          {
            id: 'tag-4',
            name: 'innovation',
            createdAt: new Date().toISOString(),
            articleCount: 7,
          },
          {
            id: 'tag-5',
            name: 'education',
            createdAt: new Date().toISOString(),
            articleCount: 11,
          },
        ]);
        
        setRelatedContent([
          {
            id: 'rel-1',
            title: 'Civil Rights Movement',
            type: 'article',
            relationship: 'related',
          },
          {
            id: 'rel-2',
            title: 'Jazz History',
            type: 'article',
            relationship: 'child',
          },
          {
            id: 'rel-3',
            title: 'African Literature',
            type: 'category',
            relationship: 'parent',
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
      articleCount: 0,
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
      articleCount: 0,
    };
    
    setTags(prev => [...prev, mockCreatedTag]);
    setNewTagName('');
    setIsCreatingTag(false);
  };
  
  // Handle relationship creation
  const handleCreateRelationship = () => {
    if (!relationshipSource || !relationshipTarget || !relationshipType) return;
    
    if (onRelationshipCreate) {
      onRelationshipCreate(relationshipSource, relationshipTarget, relationshipType);
    }
    
    // In a real implementation, you would wait for the API response
    // For now, we'll simulate it
    const mockRelatedContent: RelatedContent = {
      id: `rel-${Date.now()}`,
      title: 'New Related Content',
      type: 'article',
      relationship: relationshipType as 'parent' | 'child' | 'related',
    };
    
    setRelatedContent(prev => [...prev, mockRelatedContent]);
    setRelationshipSource('');
    setRelationshipTarget('');
    setRelationshipType('related');
    setIsCreatingRelationship(false);
  };
  
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-4">
      <h2 className="text-xl font-semibold text-white mb-4">Content Organization</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <FiFolder className="mr-2" />
              Categories
            </h3>
            <button
              onClick={() => setIsCreatingCategory(!isCreatingCategory)}
              className="p-2 bg-black/30 rounded-md text-white/80 hover:bg-black/40"
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
                className="w-full p-2 bg-black/30 rounded-md text-white/80 border border-white/10 mb-2"
                autoFocus
              />
              <textarea
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full p-2 bg-black/30 rounded-md text-white/80 border border-white/10 mb-2 resize-none h-20"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsCreatingCategory(false);
                    setNewCategoryName('');
                    setNewCategoryDescription('');
                  }}
                  className="px-4 py-2 bg-white/10 text-white/80 rounded-md hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim()}
                  className={`px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 ${!newCategoryName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Create
                </button>
              </div>
            </div>
          )}
          
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => handleCategorySelect(null)}
              className={`px-3 py-1 rounded-full text-sm ${selectedCategory === null ? 'bg-white/20 text-white' : 'bg-white/5 text-white/80 hover:bg-white/10'}`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-3 py-1 rounded-full text-sm ${selectedCategory === category.id ? 'bg-white/20 text-white' : 'bg-white/5 text-white/80 hover:bg-white/10'}`}
                title={category.description}
              >
                {category.name} ({category.articleCount})
              </button>
            ))}
          </div>
          
          <div className="bg-black/20 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-white/80 mb-2">Category Management</h4>
            <p className="text-xs text-white/60 mb-2">
              Categories help organize articles into broad topics. Each article can belong to one or more categories.
            </p>
            <div className="text-xs text-white/60">
              <p>• Create categories for major topics</p>
              <p>• Use hierarchical relationships for organization</p>
              <p>• Categories can contain subcategories</p>
            </div>
          </div>
        </div>
        
        {/* Tags Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <FiTag className="mr-2" />
              Tags
            </h3>
            <button
              onClick={() => setIsCreatingTag(!isCreatingTag)}
              className="p-2 bg-black/30 rounded-md text-white/80 hover:bg-black/40"
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
                className="w-full p-2 bg-black/30 rounded-md text-white/80 border border-white/10 mb-2"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsCreatingTag(false);
                    setNewTagName('');
                  }}
                  className="px-4 py-2 bg-white/10 text-white/80 rounded-md hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className={`px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 ${!newTagName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Create
                </button>
              </div>
            </div>
          )}
          
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleTagSelect(tag.id)}
                className={`px-3 py-1 rounded-full text-sm ${selectedTags.includes(tag.id) ? 'bg-white/20 text-white' : 'bg-white/5 text-white/80 hover:bg-white/10'}`}
              >
                #{tag.name} ({tag.articleCount})
              </button>
            ))}
          </div>
          
          <div className="bg-black/20 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-white/80 mb-2">Tag Management</h4>
            <p className="text-xs text-white/60 mb-2">
              Tags are keywords that help users find related content. They are more specific than categories and can be used to create connections between articles.
            </p>
            <div className="text-xs text-white/60">
              <p>• Use lowercase for consistency</p>
              <p>• Keep tags concise and specific</p>
              <p>• Avoid creating duplicate tags</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Content Section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FiLink className="mr-2" />
            Related Content
          </h3>
          <button
            onClick={() => setIsCreatingRelationship(!isCreatingRelationship)}
            className="p-2 bg-black/30 rounded-md text-white/80 hover:bg-black/40"
          >
            {isCreatingRelationship ? <FiX /> : <FiPlus />}
          </button>
        </div>
        
        {isCreatingRelationship && (
          <div className="mb-3 p-3 bg-black/30 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div>
                <label className="block text-sm text-white/80 mb-1">Source</label>
                <select
                  value={relationshipSource}
                  onChange={(e) => setRelationshipSource(e.target.value)}
                  className="w-full p-2 bg-black/30 rounded-md text-white/80 border border-white/10"
                >
                  <option value="">Select source</option>
                  <option value="current">Current Article</option>
                  {categories.map(category => (
                    <option key={`cat-${category.id}`} value={category.id}>
                      Category: {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-white/80 mb-1">Relationship</label>
                <select
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className="w-full p-2 bg-black/30 rounded-md text-white/80 border border-white/10"
                >
                  <option value="related">Related to</option>
                  <option value="parent">Parent of</option>
                  <option value="child">Child of</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-white/80 mb-1">Target</label>
                <select
                  value={relationshipTarget}
                  onChange={(e) => setRelationshipTarget(e.target.value)}
                  className="w-full p-2 bg-black/30 rounded-md text-white/80 border border-white/10"
                >
                  <option value="">Select target</option>
                  {categories.map(category => (
                    <option key={`cat-${category.id}`} value={category.id}>
                      Category: {category.name}
                    </option>
                  ))}
                  {/* In a real implementation, you would also list articles here */}
                  <option value="article-1">Article: Civil Rights Movement</option>
                  <option value="article-2">Article: Jazz History</option>
                  <option value="article-3">Article: African Literature</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsCreatingRelationship(false);
                  setRelationshipSource('');
                  setRelationshipTarget('');
                  setRelationshipType('related');
                }}
                className="px-4 py-2 bg-white/10 text-white/80 rounded-md hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRelationship}
                disabled={!relationshipSource || !relationshipTarget}
                className={`px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 ${(!relationshipSource || !relationshipTarget) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Create Relationship
              </button>
            </div>
          </div>
        )}
        
        {relatedContent.length > 0 ? (
          <div className="bg-black/20 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-black/40">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-white/80">Title</th>
                  <th className="p-3 text-left text-sm font-medium text-white/80">Type</th>
                  <th className="p-3 text-left text-sm font-medium text-white/80">Relationship</th>
                  <th className="p-3 text-left text-sm font-medium text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody>
                {relatedContent.map(content => (
                  <tr key={content.id} className="border-t border-white/10">
                    <td className="p-3 text-white">{content.title}</td>
                    <td className="p-3 text-white/80 capitalize">{content.type}</td>
                    <td className="p-3 text-white/80 capitalize">{content.relationship}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 bg-black/30 rounded text-white/80 hover:bg-black/50">
                          <FiEdit2 size={14} />
                        </button>
                        <button className="p-1 bg-red-500/20 rounded text-red-400 hover:bg-red-500/30">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-white/60">
            No related content defined
          </div>
        )}
        
        <div className="bg-black/20 rounded-lg p-3 mt-4">
          <h4 className="text-sm font-medium text-white/80 mb-2">Content Relationships</h4>
          <p className="text-xs text-white/60 mb-2">
            Create relationships between articles, categories, and tags to help users navigate related content.
          </p>
          <div className="text-xs text-white/60">
            <p>• Parent/child relationships create hierarchies</p>
            <p>• Related content appears in &quot;See Also&quot; sections</p>
            <p>• Well-connected content improves discoverability</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentOrganizer;
