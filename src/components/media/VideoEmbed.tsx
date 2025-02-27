"use client";

import React, { useState, useEffect } from 'react';
import { FiVideo, FiX, FiCheck, FiExternalLink } from 'react-icons/fi';
import './media.css';

// Supported video platforms
const SUPPORTED_PLATFORMS = [
  {
    name: 'YouTube',
    pattern: /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    embedUrl: (id: string) => `https://www.youtube.com/embed/${id}`,
    thumbnailUrl: (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
  },
  {
    name: 'Vimeo',
    pattern: /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|)(\d+)(?:$|\/|\?))/i,
    embedUrl: (id: string) => `https://player.vimeo.com/video/${id}`,
    thumbnailUrl: null, // Vimeo requires API access for thumbnails
  },
  {
    name: 'Dailymotion',
    pattern: /(?:dailymotion\.com\/(?:embed\/)?video\/|dai\.ly\/)([a-zA-Z0-9]+)(?:_[\w-]+)?/i,
    embedUrl: (id: string) => `https://www.dailymotion.com/embed/video/${id}`,
    thumbnailUrl: null,
  },
];

interface VideoEmbedProps {
  onEmbed?: (embedData: VideoEmbedData) => void;
  initialUrl?: string;
}

export interface VideoEmbedData {
  url: string;
  embedUrl: string;
  platform: string;
  videoId: string;
  thumbnailUrl?: string | null;
}

const VideoEmbed: React.FC<VideoEmbedProps> = ({ onEmbed, initialUrl = '' }) => {
  const [url, setUrl] = useState<string>(initialUrl);
  const [embedData, setEmbedData] = useState<VideoEmbedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parse video URL when it changes
  useEffect(() => {
    if (!url.trim()) {
      setEmbedData(null);
      setError(null);
      return;
    }

    // Try to match URL with supported platforms
    for (const platform of SUPPORTED_PLATFORMS) {
      const match = url.match(platform.pattern);
      if (match && match[1]) {
        const videoId = match[1];
        const embedUrl = platform.embedUrl(videoId);
        const thumbnailUrl = platform.thumbnailUrl ? platform.thumbnailUrl(videoId) : null;
        
        setEmbedData({
          url,
          embedUrl,
          platform: platform.name,
          videoId,
          thumbnailUrl,
        });
        setError(null);
        return;
      }
    }

    // If no match found
    setEmbedData(null);
    setError('Unsupported video URL. Please use YouTube, Vimeo, or Dailymotion.');
  }, [url]);

  // Handle embed confirmation
  const handleEmbed = () => {
    if (embedData && onEmbed) {
      onEmbed(embedData);
    }
  };

  return (
    <div className="video-embed-container">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <FiVideo className="mr-2 text-white/80" size={20} />
          <h3 className="text-lg font-semibold text-white">Embed Video</h3>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm text-white/80 mb-1">Video URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube, Vimeo, or Dailymotion URL"
            className="video-embed-input"
          />
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
        
        {embedData && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-white/80">Preview</span>
              <span className="text-xs text-white/60">{embedData.platform}</span>
            </div>
            <div className="video-embed-preview">
              <iframe
                src={embedData.embedUrl}
                title="Video preview"
                width="100%"
                height="100%"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <div>
            <a
              href="https://support.google.com/youtube/answer/171780"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/60 hover:text-white/80 flex items-center"
            >
              <FiExternalLink className="mr-1" size={12} />
              How to embed videos
            </a>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setUrl('');
                setEmbedData(null);
                setError(null);
              }}
              className="media-editor-button-cancel"
            >
              <FiX className="mr-1" />
              Clear
            </button>
            <button
              onClick={handleEmbed}
              disabled={!embedData}
              className={`media-editor-button-apply ${!embedData ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FiCheck className="mr-1" />
              Embed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEmbed;
