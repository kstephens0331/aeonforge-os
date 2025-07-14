import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import Input from './Input';
import Button from './Button';
import Textarea from './Textarea';

export default function MemoryViewer({ chatId, projectId }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editedMemories, setEditedMemories] = useState({});

  useEffect(() => {
    if (chatId || projectId) loadMemories();
  }, [chatId, projectId]);

async function loadMemories() {
  setLoading(true);

  const cleanChatId = chatId?.split(':')[0]; // Strip off suffix if present
  const filter = projectId ? { project_id: projectId } : { chat_id: cleanChatId };

  const { data, error } = await supabase
    .from('memory')
    .select('*')
    .order('created_at', { ascending: false })
    .match(filter);

  if (error) console.error(error);
  else setMemories(data);

  setLoading(false);
}

  const handleFieldChange = (id, field, value) => {
    setEditedMemories((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveMemoryChanges = async (id) => {
    const updates = editedMemories[id];
    if (!updates) return;
    const { error } = await supabase
      .from('memory')
      .update(updates)
      .eq('id', id);
    if (!error) {
      setEditedMemories((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      loadMemories();
    } else {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">🧠 Memory Viewer</h2>
      {loading ? (
        <p>Loading...</p>
      ) : memories.length === 0 ? (
        <p className="text-gray-500">No memory found for this context.</p>
      ) : (
        <div className="space-y-6">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="bg-white rounded shadow p-4 border border-gray-200"
            >
              <Textarea
                value={
                  editedMemories[memory.id]?.content || memory.content || ''
                }
                className="w-full border mb-2"
                rows={4}
                onChange={(e) =>
                  handleFieldChange(memory.id, 'content', e.target.value)
                }
              />
              <Input
                value={
                  editedMemories[memory.id]?.summary || memory.summary || ''
                }
                placeholder="Summary (optional)"
                className="w-full mb-2"
                onChange={(e) =>
                  handleFieldChange(memory.id, 'summary', e.target.value)
                }
              />
              <Input
                value={
                  editedMemories[memory.id]?.tags?.join(', ') ||
                  memory.tags?.join(', ') ||
                  ''
                }
                placeholder="Tags (comma separated)"
                className="w-full mb-2"
                onChange={(e) =>
                  handleFieldChange(memory.id, 'tags', e.target.value
                    .split(',')
                    .map((tag) => tag.trim()))
                }
              />
              <Button onClick={() => saveMemoryChanges(memory.id)}>
                💾 Save
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
