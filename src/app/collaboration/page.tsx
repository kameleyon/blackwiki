"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import CollaborativeEditor from '@/components/collaboration/CollaborativeEditor';
import { FiUsers, FiServer, FiInfo } from 'react-icons/fi';

export default function CollaborationPage() {
  const { data: session } = useSession();
  const [content, setContent] = useState('<h1>Collaborative Editing Demo</h1><p>Start typing to collaborate in real-time with other users.</p>');
  const [documentId, setDocumentId] = useState('demo-document');
  const [serverStatus, setServerStatus] = useState<'checking' | 'running' | 'not-running'>('checking');
  const [showInfo, setShowInfo] = useState(true);

  // Check if the WebSocket server is running
  useEffect(() => {
    const checkServer = async () => {
      try {
        const ws = new WebSocket('ws://localhost:1234');
        
        ws.onopen = () => {
          setServerStatus('running');
          ws.close();
        };
        
        ws.onerror = () => {
          setServerStatus('not-running');
        };
      } catch {
        setServerStatus('not-running');
      }
    };
    
    checkServer();
  }, []);

  // Generate a random username if not logged in
  const username = session?.user?.name || `Guest-${Math.floor(Math.random() * 1000)}`;
  
  // Generate a random color for the user
  const userColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Real-Time Collaborative Editing</h1>
      
      {showInfo && (
        <div className="bg-black/30 border border-white/10 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <FiInfo className="text-blue-400 mt-1 mr-3 flex-shrink-0" size={20} />
            <div>
              <h2 className="text-xl font-semibold mb-2">How It Works</h2>
              <p className="mb-2">
                This demo showcases real-time collaborative editing using Yjs and WebSockets. Multiple users can edit the same document simultaneously and see each other&apos;s changes in real-time.
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Each user gets a unique cursor color</li>
                <li>See who else is currently editing the document</li>
                <li>Changes are synchronized automatically</li>
                <li>No need to manually save or refresh</li>
              </ul>
              <div className="flex items-center text-sm text-white/60">
                <FiServer className="mr-1" />
                <span>WebSocket Server Status: </span>
                {serverStatus === 'checking' && <span className="ml-1">Checking...</span>}
                {serverStatus === 'running' && <span className="ml-1 text-green-400">Running</span>}
                {serverStatus === 'not-running' && (
                  <span className="ml-1 text-red-400">
                    Not Running - Start the server with &quot;node src/server/y-websocket-server.js&quot;
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={() => setShowInfo(false)}
              className="ml-auto text-white/60 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <FiUsers className="mr-2" />
          <span>Editing as: <span className="font-medium">{username}</span></span>
        </div>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="document-id" className="text-sm text-white/60">
            Document ID:
          </label>
          <input
            id="document-id"
            type="text"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            className="bg-black/30 border border-white/10 rounded px-2 py-1 text-sm"
          />
        </div>
      </div>
      
      <CollaborativeEditor
        content={content}
        onChange={setContent}
        documentId={documentId}
        username={username}
        userColor={userColor}
      />
      
      <div className="mt-6 text-sm text-white/60">
        <p>
          Note: To see the collaborative editing in action, open this page in multiple browser windows or share the URL with others.
          Make sure the WebSocket server is running by executing <code className="bg-black/30 px-1 py-0.5 rounded">node src/server/y-websocket-server.js</code> in your terminal.
        </p>
      </div>
    </div>
  );
}
