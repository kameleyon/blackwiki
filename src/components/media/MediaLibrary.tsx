"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { FiFolder, FiImage, FiFile, FiUpload, FiX, FiCheck, FiTrash2, FiCrop } from 'react-icons/fi';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

type MediaItem = {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'other';
  size: number;
  createdAt: string;
  folder?: string;
};

type Folder = {
  id: string;
  name: string;
  createdAt: string;
};

interface MediaLibraryProps {
  onSelect?: (media: MediaItem) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  initialFolder?: string;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({
  onSelect,
  maxFiles = 10,
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt', '.md'],
  initialFolder = 'root'
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>(initialFolder);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cropMode, setCropMode] = useState<boolean>(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);

  // Fetch media items and folders
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch(`/api/media/list?folder=${currentFolder}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch media');
        }
        
        const data = await response.json();
        setMediaItems(data.files);
        setFolders(data.folders);
      } catch (error) {
        console.error('Error fetching media:', error);
      }
    };

    fetchMedia();
  }, [currentFolder]);

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);
    
    try {
      // Create FormData for multiple files
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('folder', currentFolder);
      
      // Upload files to the server
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload files');
      }
      
      const data = await response.json();
      
      // Add the uploaded files to the media items
      setMediaItems(prev => [...prev, ...data.files]);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset upload state after a delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error uploading files:', error);
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [currentFolder]);
  
  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      if (type.startsWith('.')) {
        // Handle file extensions
        acc[`application/${type.substring(1)}`] = [];
      } else {
        // Handle MIME types
        acc[type] = [];
      }
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
    multiple: true
  });
  
  // Filter media items by current folder and search query
  const filteredMediaItems = mediaItems.filter(item => {
    const matchesFolder = item.folder === currentFolder;
    const matchesSearch = searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });
  
  // Sort media items
  const sortedMediaItems = [...filteredMediaItems].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // Handle item selection
  const handleItemClick = (item: MediaItem) => {
    if (onSelect) {
      onSelect(item);
    } else {
      // Toggle selection
      setSelectedItems(prev => {
        if (prev.includes(item.id)) {
          return prev.filter(id => id !== item.id);
        } else {
          return [...prev, item.id];
        }
      });
    }
  };
  
  // Handle folder navigation
  const navigateToFolder = (folderId: string) => {
    setCurrentFolder(folderId);
    setSelectedItems([]);
  };
  
  // Handle folder creation
  const createFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      createdAt: new Date().toISOString()
    };
    
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };
  
  // Handle item deletion
  const deleteSelectedItems = () => {
    setMediaItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };
  
  // Handle image cropping
  const startCrop = (imageUrl: string) => {
    setCropImage(imageUrl);
    setCropMode(true);
  };
  
  const cancelCrop = () => {
    setCropMode(false);
    setCropImage(null);
    setCompletedCrop(null);
  };
  
  const completeCrop = async () => {
    if (!completedCrop || !imageRef) {
      cancelCrop();
      return;
    }
    
    // Create a canvas to draw the cropped image
    const canvas = document.createElement('canvas');
    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      cancelCrop();
      return;
    }
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    ctx.drawImage(
      imageRef,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
    
    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.95);
    });
    
    // Create a new media item with the cropped image
    const croppedImageUrl = URL.createObjectURL(blob);
    const originalItem = mediaItems.find(item => item.url === cropImage);
    
    if (originalItem) {
      const newItem: MediaItem = {
        ...originalItem,
        id: `cropped-${Date.now()}`,
        name: `cropped-${originalItem.name}`,
        url: croppedImageUrl,
        createdAt: new Date().toISOString()
      };
      
      setMediaItems(prev => [...prev, newItem]);
    }
    
    cancelCrop();
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Render file icon based on type
  const renderFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FiImage className="text-blue-400" size={24} />;
      case 'document':
        return <FiFile className="text-green-400" size={24} />;
      default:
        return <FiFile className="text-gray-400" size={24} />;
    }
  };

  return (
    <div className="bg-black/20 rounded-xl border border-white/10 p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Media Library</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 bg-black/30 rounded-md text-white/80 hover:bg-black/40"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-') as ['name' | 'date' | 'size', 'asc' | 'desc'];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="p-2 bg-black/30 rounded-md text-white/80 border border-white/10"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 bg-black/30 rounded-md text-white/80 border border-white/10 w-64"
          />
          
          {selectedItems.length > 0 && (
            <button
              onClick={deleteSelectedItems}
              className="p-2 bg-red-500/20 rounded-md text-red-400 hover:bg-red-500/30 flex items-center"
            >
              <FiTrash2 className="mr-1" /> Delete Selected
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isCreatingFolder ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="p-2 bg-black/30 rounded-md text-white/80 border border-white/10 w-40"
                autoFocus
              />
              <button
                onClick={createFolder}
                className="p-2 bg-green-500/20 rounded-md text-green-400 hover:bg-green-500/30"
              >
                <FiCheck />
              </button>
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="p-2 bg-red-500/20 rounded-md text-red-400 hover:bg-red-500/30"
              >
                <FiX />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="p-2 bg-black/30 rounded-md text-white/80 hover:bg-black/40"
            >
              New Folder
            </button>
          )}
        </div>
      </div>
      
      {/* Folder navigation */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => navigateToFolder('root')}
          className={`p-2 rounded-md ${currentFolder === 'root' ? 'bg-white/10 text-white' : 'bg-black/30 text-white/80 hover:bg-black/40'}`}
        >
          Root
        </button>
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => navigateToFolder(folder.id)}
            className={`p-2 rounded-md flex items-center ${currentFolder === folder.id ? 'bg-white/10 text-white' : 'bg-black/30 text-white/80 hover:bg-black/40'}`}
          >
            <FiFolder className="mr-1" /> {folder.name}
          </button>
        ))}
      </div>
      
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/20'
        }`}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto mb-2 text-white/60" size={32} />
        <p className="text-white/80">Drag & drop files here, or click to select files</p>
        <p className="text-white/60 text-sm mt-1">
          Supports: {allowedTypes.join(', ')} (Max: {maxFiles} files)
        </p>
      </div>
      
      {/* Upload progress */}
      {isUploading && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-white/80 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Media items */}
      {sortedMediaItems.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          No files found in this folder
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedMediaItems.map(item => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`relative rounded-lg overflow-hidden border cursor-pointer transition-all ${
                selectedItems.includes(item.id) ? 'border-blue-500 ring-2 ring-blue-500' : 'border-white/10 hover:border-white/30'
              }`}
            >
              {item.type === 'image' ? (
                <div className="relative aspect-square bg-black/40">
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-black/40">
                  {renderFileIcon(item.type)}
                </div>
              )}
              
              <div className="p-2 bg-black/60">
                <p className="text-sm text-white truncate">{item.name}</p>
                <p className="text-xs text-white/60">{formatFileSize(item.size)}</p>
              </div>
              
              {selectedItems.includes(item.id) && (
                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                  <FiCheck size={12} />
                </div>
              )}
              
              {item.type === 'image' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startCrop(item.url);
                  }}
                  className="absolute top-2 left-2 bg-black/60 rounded-full p-1 text-white/80 hover:bg-black/80"
                >
                  <FiCrop size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-black/40">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-white/80">Name</th>
                <th className="p-3 text-left text-sm font-medium text-white/80">Type</th>
                <th className="p-3 text-left text-sm font-medium text-white/80">Size</th>
                <th className="p-3 text-left text-sm font-medium text-white/80">Date</th>
                <th className="p-3 text-left text-sm font-medium text-white/80">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedMediaItems.map(item => (
                <tr
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`border-t border-white/10 cursor-pointer ${
                    selectedItems.includes(item.id) ? 'bg-blue-500/10' : 'hover:bg-white/5'
                  }`}
                >
                  <td className="p-3 flex items-center">
                    {renderFileIcon(item.type)}
                    <span className="ml-2 text-white">{item.name}</span>
                  </td>
                  <td className="p-3 text-white/80">{item.type}</td>
                  <td className="p-3 text-white/80">{formatFileSize(item.size)}</td>
                  <td className="p-3 text-white/80">{formatDate(item.createdAt)}</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      {item.type === 'image' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startCrop(item.url);
                          }}
                          className="p-1 bg-black/30 rounded text-white/80 hover:bg-black/50"
                        >
                          <FiCrop size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItems([item.id]);
                          deleteSelectedItems();
                        }}
                        className="p-1 bg-red-500/20 rounded text-red-400 hover:bg-red-500/30"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Crop modal */}
      {cropMode && cropImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-4 max-w-4xl w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Crop Image</h3>
            
            <div className="mb-4 overflow-auto max-h-[60vh]">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={undefined}
              >
                {/* We need to use the img tag here instead of Next.js Image component
                    because ReactCrop requires direct access to the image element */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cropImage}
                  alt="Crop preview"
                  onLoad={e => setImageRef(e.currentTarget)}
                  className="max-w-full"
                />
              </ReactCrop>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelCrop}
                className="px-4 py-2 bg-white/10 text-white/80 rounded-md hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={completeCrop}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
