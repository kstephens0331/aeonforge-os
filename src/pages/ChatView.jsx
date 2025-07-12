import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import MemoryEditor from '../components/MemoryEditor';
import { useParams } from 'react-router-dom';

export default function ChatView() {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chatId) {
      fetchChat();
      fetchMessages();
    }
  }, [chatId]);

  const fetchChat = async () => {
    const { data } = await supabase.from('chats').select('*').eq('id', chatId).single();
    setChat(data);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const trimmed = input.trim();

    const { data: userMsg } = await supabase
      .from('messages')
      .insert([{ chat_id: chatId, role: 'user', content: trimmed }])
      .select()
      .single();

    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }]);

    const { data: memoryData } = await supabase
      .from('memory')
      .select('content')
      .eq('chat_id', chatId);

    const memoryBlock = memoryData?.map((m) => m.content).join('\n\n') || '';

    const { data: thread } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at');

    const messagesToSend = [
      {
        role: 'system',
        content: `You have private memory for this chat only:\n\n${memoryBlock}`,
      },
      ...thread.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // 🔒 Secure backend request to OpenAI
    const response = await fetch('https://aeonforge-router-production.up.railway.app/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messagesToSend, model: chat?.model || 'gpt-4' }),
    });

    const result = await response.json();
    const aiResponse = result.result;

    await supabase.from('messages').insert([
      { chat_id: chatId, role: 'assistant', content: aiResponse },
    ]);

    await supabase.from('memory').insert([
      { chat_id: chatId, content: `Assistant replied: ${aiResponse}` },
    ]);

    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1].content = aiResponse;
      return updated;
    });

    setInput('');
    setLoading(false);
  };

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1">
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {messages.map((msg, i) => (
            <div key={i} className={`text-sm ${msg.role === 'user' ? 'text-blue-700' : 'text-gray-800'}`}>
              <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            className="flex-grow border px-3 py-2 rounded text-sm"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded text-sm"
          >
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <MemoryEditor chatId={chatId} />
        </div>
      </div>
    </div>
  );
}
