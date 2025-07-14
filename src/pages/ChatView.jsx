import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { exportChatToCSV, exportChatToPDF } from '../utils/exportUtils';

export default function ChatView() {
  const { id: chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [controller, setController] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const cleanChatId = chatId?.split(':')[0];
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchChat();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChat = async () => {
    const { data: chatData } = await supabase.from('chats').select('*').eq('id', cleanChatId).single();
    setChat(chatData);

    const { data: messageData } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', cleanChatId)
      .order('created_at', { ascending: true });

    setMessages(messageData || []);
  };

  const runCompletion = async (thread) => {
    const abortController = new AbortController();
    setController(abortController);

    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          messages: thread,
          model: selectedModel || null,
          project_id: chat?.project_id || null,
          chat_id: cleanChatId,
        }),
      });

      const data = await res.json();
      return data.output;
    } catch (err) {
      console.error('Completion error:', err);
      return '⚠️ Output stopped or failed.';
    } finally {
      setController(null);
    }
  };

  const sendMessage = async (editIdx = null) => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setIsLoading(true);

    const thread = [...messages];

    const { data: tools } = await supabase.from('tools').select('*');
    const matchedTool = tools.find((t) =>
      (t.keywords || []).some((kw) => trimmed.toLowerCase().includes(kw.toLowerCase()))
    );

    if (matchedTool) {
      console.log(`🧠 Suggested Tool Match: ${matchedTool.name}`);
      if (matchedTool.launch_path && chat?.project_id) {
        const route = matchedTool.launch_path
          .replace(':projectId', chat.project_id)
          .replace(':projectName', encodeURIComponent(chat.project_name || 'Project'))
          .replace(':toolName', encodeURIComponent(matchedTool.name));
        navigate(route);
        setIsLoading(false);
        return;
      }
    }

    if (editIdx !== null) {
      thread[editIdx].content = trimmed;
      await supabase.from('messages').update({ content: trimmed }).eq('id', thread[editIdx].id);
    } else {
      const { data: insertedMessage } = await supabase
        .from('messages')
        .insert([{ chat_id: cleanChatId, role: 'user', content: trimmed }])
        .select();

      if (insertedMessage?.[0]) thread.push(insertedMessage[0]);
    }

    setInput('');
    setEditingIdx(null);

    const aiReply = await runCompletion(thread);

    const { data: replyMessage } = await supabase
      .from('messages')
      .insert([{ chat_id: cleanChatId, role: 'assistant', content: aiReply }])
      .select();

    await supabase.from('memory').insert([{
      chat_id: cleanChatId,
      project_id: chat?.project_id || null,
      content: `${trimmed}\n---\n${aiReply}`,
      tags: matchedTool ? [matchedTool.name] : [],
    }]);

    await fetchChat();
    setIsLoading(false);
  };

  const stopResponse = () => {
    controller?.abort();
    setController(null);
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(editingIdx);
    }
  };

  const startEditing = (idx) => {
    setInput(messages[idx].content);
    setEditingIdx(idx);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">{chat?.title || 'Chat'}</h2>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="">Auto (Smart Routing)</option>
          <option value="gpt-4">GPT-4</option>
          <option value="claude-3-opus-20240229">Claude</option>
          <option value="gemini-pro">Gemini</option>
          <option value="mistral-tiny">Mistral</option>
        </select>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`max-w-3xl px-4 py-2 rounded-md ${
              msg.role === 'user' ? 'bg-indigo-100 self-end ml-auto' : 'bg-gray-200 self-start mr-auto'
            }`}
          >
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
            {msg.role === 'user' && (
              <button
                onClick={() => startEditing(idx)}
                className="text-xs text-indigo-600 mt-1"
              >
                ✏️ Edit & Rerun
              </button>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="text-sm text-gray-500 italic">
            Generating response...
            <button onClick={stopResponse} className="ml-2 text-red-600 text-xs underline">
              Stop
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white border-t px-6 py-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full resize-none border rounded px-3 py-2 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="text-right mt-2">
          <button
            onClick={() => sendMessage(editingIdx)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            {editingIdx !== null ? 'Save Edit & Run' : 'Send'}
          </button>
        </div>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => exportChatToCSV(messages, `chat-${chatId}.csv`)}
            className="text-sm text-gray-600 underline"
          >
            📁 Export CSV
          </button>
          <button
            onClick={() => exportChatToPDF(messages, `chat-${chatId}.pdf`)}
            className="text-sm text-gray-600 underline"
          >
            📄 Export PDF
          </button>
        </div>
      </footer>
    </div>
  );
}