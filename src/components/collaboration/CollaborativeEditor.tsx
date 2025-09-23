"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { htmlToMarkdown } from '@/lib/htmlToMarkdown';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { FiBold, FiItalic, FiCode, FiList, FiLink, FiImage, FiAlignLeft, 
  FiAlignCenter, FiAlignRight, FiUnderline, FiType, 
  FiFileText, FiEye, FiEdit, FiMaximize, FiMinimize, FiUsers } from 'react-icons/fi';
import '../editor/editor.css';
import './collaboration.css';

interface CollaborativeEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  documentId: string;
  username: string;
  userColor?: string;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ 
  content, 
  onChange,
  placeholder = 'Write your article content here...',
  documentId,
  username,
  userColor = '#' + Math.floor(Math.random() * 16777215).toString(16) // Random color if not provided
}) => {
  const [editorView, setEditorView] = useState<'edit' | 'split' | 'preview'>('edit');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [markdownOutput, setMarkdownOutput] = useState('');
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  // Initialize Yjs document and provider
  useEffect(() => {
    // Create a new Y.Doc instance
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Connect to the WebSocket server
    const provider = new WebsocketProvider(
      'ws://localhost:1234', // WebSocket server URL
      `afrowiki-${documentId}`, // Document name/room
      ydoc
    );
    providerRef.current = provider;

    // Set user information
    provider.awareness.setLocalStateField('user', {
      name: username,
      color: userColor,
    });

    // Handle connection status
    provider.on('status', (event: { status: string }) => {
      setIsConnected(event.status === 'connected');
    });

    interface AwarenessState {
      user?: {
        name: string;
        color: string;
      };
    }

    // Track active users
    const updateActiveUsers = () => {
      const users: string[] = [];
      provider.awareness.getStates().forEach((state: AwarenessState) => {
        if (state.user?.name && !users.includes(state.user.name)) {
          users.push(state.user.name);
        }
      });
      setActiveUsers(users);
    };

    provider.awareness.on('change', updateActiveUsers);

    // Clean up on unmount
    return () => {
      provider.awareness.off('change', updateActiveUsers);
      provider.disconnect();
      ydoc.destroy();
    };
  }, [documentId, username, userColor]);

  // Initialize the editor with Yjs collaboration
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-gray-300 underline',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-black/40 rounded-md p-4 font-mono text-sm my-4',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-gray-600/20 text-white',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      // Add Yjs collaboration extensions
      Collaboration.configure({
        document: ydocRef.current,
      }),
      CollaborationCursor.configure({
        provider: providerRef.current,
        user: {
          name: username,
          color: userColor,
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Convert HTML to Markdown for preview
      const markdown = htmlToMarkdown(html);
      setMarkdownOutput(markdown);
    },
  });

  useEffect(() => {
    // Update editor content if it changes externally and we're not connected to Yjs yet
    if (editor && content !== editor.getHTML() && !isConnected) {
      editor.commands.setContent(content);
    }
  }, [content, editor, isConnected]);

  if (!editor) {
    return null;
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Add/remove a class to the body to handle fullscreen styles
    document.body.classList.toggle('editor-fullscreen');
  };

  return (
    <div className={`rich-text-editor ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900 p-4' : 'relative'}`}>
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-black/30 border border-white/10 rounded-t-md">
        <div className="flex items-center mr-4">
          <button
            onClick={() => setEditorView('edit')}
            className={`p-2 rounded ${editorView === 'edit' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            title="Edit mode"
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={() => setEditorView('split')}
            className={`p-2 rounded ${editorView === 'split' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            title="Split view"
          >
            <FiFileText size={16} />
          </button>
          <button
            onClick={() => setEditorView('preview')}
            className={`p-2 rounded ${editorView === 'preview' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            title="Preview mode"
          >
            <FiEye size={16} />
          </button>
        </div>

        {editorView !== 'preview' && (
          <>
            <div className="flex items-center border-l border-white/10 pl-2 mr-2">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded ${editor.isActive('bold') ? 'bg-white/10' : 'hover:bg-white/5'}`}
                title="Bold (Ctrl+B)"
              >
                <FiBold size={16} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded ${editor.isActive('italic') ? 'bg-white/10' : 'hover:bg-white/5'}`}
                title="Italic (Ctrl+I)"
              >
                <FiItalic size={16} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded ${editor.isActive('underline') ? 'bg-white/10' : 'hover:bg-white/5'}`}
                title="Underline (Ctrl+U)"
              >
                <FiUnderline size={16} />
              </button>
            </div>

            <div className="flex items-center border-l border-white/10 pl-2 mr-2">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-white/10' : 'hover:bg-white/5'}`}
                title="Heading 1"
              >
                <span className="font-bold">H1</span>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-white/10' : 'hover:bg-white/5'}`}
                title="Heading 2"
              >
                <span className="font-bold">H2</span>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-white/10' : 'hover:bg-white/5'}`}
                title="Heading 3"
              >
                <span className="font-bold">H3</span>
              </button>
            </div>

            <div className="flex items-center border-l border-white/10 pl-2 mr-2">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-white/10' : 'hover:bg-white/5'}`}
                title="Bullet List"
              >
                <FiList size={16} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-white/10' : 'hover:bg-white/5'}`}
                title="Numbered List"
              >
                <span className="font-mono">1.</span>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded ${editor.isActive('codeBlock') ? 'bg-white/10' : 'hover:bg-white/5'}`}
                title="Code Block"
              >
                <FiCode size={16} />
              </button>
            </div>

            <div className="flex items-center border-l border-white/10 pl-2 mr-2">
              <button
                onClick={() => {
                  const url = window.prompt('Enter the URL');
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className={`p-2 rounded ${editor.isActive('link') ? 'bg-white/10' : 'hover:bg-white/5'}`}
                title="Insert Link"
              >
                <FiLink size={16} />
              </button>
              <button
                onClick={() => {
                  const url = window.prompt('Enter the image URL');
                  if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                  }
                }}
                className="p-2 rounded hover:bg-white/5"
                title="Insert Image"
              >
                <FiImage size={16} />
              </button>
            </div>

            <div className="flex items-center border-l border-white/10 pl-2">
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-white/10' : 'hover:bg-white/5'}`}
                title="Align Left"
              >
                <FiAlignLeft size={16} />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-white/10' : 'hover:bg-white/5'}`}
                title="Align Center"
              >
                <FiAlignCenter size={16} />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-white/10' : 'hover:bg-white/5'}`}
                title="Align Right"
              >
                <FiAlignRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* Collaboration status */}
        <div className="ml-auto flex items-center">
          <div className="flex items-center mr-2">
            <div className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-white/60">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="relative group">
            <button
              className="p-2 rounded hover:bg-white/5 flex items-center"
              title="Active Users"
            >
              <FiUsers size={16} />
              <span className="ml-1 text-xs">{activeUsers.length}</span>
            </button>
            
            {/* Active users tooltip */}
            <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded-md shadow-lg p-2 w-48 z-10 hidden group-hover:block">
              <h4 className="text-xs font-medium text-white/80 mb-1">Active Users</h4>
              <ul className="text-xs text-white/60">
                {activeUsers.map((user, index) => (
                  <li key={index} className="py-1">{user}</li>
                ))}
                {activeUsers.length === 0 && (
                  <li className="py-1 italic">No active users</li>
                )}
              </ul>
            </div>
          </div>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded hover:bg-white/5"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className={`border border-white/10 border-t-0 rounded-b-md overflow-hidden ${isFullscreen ? 'h-[calc(100%-80px)]' : 'min-h-[300px]'}`}>
        {editorView === 'edit' && (
          <EditorContent 
            editor={editor} 
            className="prose prose-invert max-w-none p-4 min-h-[300px] focus:outline-none"
          />
        )}

        {editorView === 'split' && (
          <div className="flex h-full">
            <div className="w-1/2 border-r border-white/10">
              <EditorContent 
                editor={editor} 
                className="prose prose-invert max-w-none p-4 min-h-[300px] focus:outline-none"
              />
            </div>
            <div className="w-1/2 p-4 bg-black/20 overflow-auto">
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-mono text-sm bg-black/30 p-4 rounded-md">
                  {markdownOutput}
                </pre>
              </div>
            </div>
          </div>
        )}

        {editorView === 'preview' && (
          <div className="p-4 bg-black/20 overflow-auto min-h-[300px]">
            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
            </div>
          </div>
        )}
      </div>

      {/* Bubble Menu for selected text */}
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex bg-gray-800 rounded-md shadow-lg overflow-hidden">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 ${editor.isActive('bold') ? 'bg-white/20' : ''}`}
            >
              <FiBold size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 ${editor.isActive('italic') ? 'bg-white/20' : ''}`}
            >
              <FiItalic size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 ${editor.isActive('underline') ? 'bg-white/20' : ''}`}
            >
              <FiUnderline size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`p-2 ${editor.isActive('highlight') ? 'bg-white/20' : ''}`}
            >
              <FiType size={14} />
            </button>
            <button
              onClick={() => {
                const url = window.prompt('Enter the URL');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              className={`p-2 ${editor.isActive('link') ? 'bg-white/20' : ''}`}
            >
              <FiLink size={14} />
            </button>
          </div>
        </BubbleMenu>
      )}

      {/* Keyboard shortcuts help */}
      <div className="mt-2 text-xs text-gray-400 flex justify-between">
        <p>Keyboard shortcuts: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline), Ctrl+K (Link)</p>
        <p>Collaborative editing: {activeUsers.length} user{activeUsers.length !== 1 ? 's' : ''} online</p>
      </div>
    </div>
  );
};

export default CollaborativeEditor;
