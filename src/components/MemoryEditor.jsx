import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import jsPDF from 'jspdf';

export default function MemoryEditor({ chatId, projectId }) {
  const [memory, setMemory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [newMemory, setNewMemory] = useState('');
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('chat');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMemory();
  }, [chatId, projectId, scope]);

  useEffect(() => {
    applyFilters();
  }, [search, filter, memory]);

  const fetchMemory = async () => {
    let query = supabase.from('memory').select('*');

    if (scope === 'chat' && chatId) query = query.eq('chat_id', chatId);
    else if (scope === 'project' && projectId) query = query.eq('project_id', projectId);
    else if (scope === 'both' && chatId && projectId)
      query = query.or(`chat_id.eq.${chatId},project_id.eq.${projectId}`);

    const { data } = await query.order('updated_at', { ascending: false });
    if (data) setMemory(data);
  };

  const applyFilters = () => {
    let data = [...memory];
    if (filter === 'pinned') data = data.filter((m) => m.pinned);
    if (filter === 'summary') data = data.filter((m) => m.summary);
    if (search.trim()) {
      const term = search.toLowerCase();
      data = data.filter(
        (m) =>
          m.content.toLowerCase().includes(term) ||
          (m.tags || []).some((t) => t.toLowerCase().includes(term))
      );
    }
    setFiltered(data);
  };

  const addMemory = async () => {
    if (!newMemory.trim()) return;
    const insertData = {
      content: newMemory.trim(),
      pinned: false,
      summary: false,
      tags: [],
      clarity: null,
      helpfulness: null,
      actionability: null,
    };
    if (scope === 'chat' && chatId) insertData.chat_id = chatId;
    if (scope === 'project' && projectId) insertData.project_id = projectId;
    if (scope === 'both') {
      if (chatId) insertData.chat_id = chatId;
      if (projectId) insertData.project_id = projectId;
    }

    await supabase.from('memory').insert([insertData]);
    setNewMemory('');
    fetchMemory();
  };

  const updateMemory = async (id, field, value) => {
    await supabase.from('memory').update({ [field]: value }).eq('id', id);
    fetchMemory();
  };

  const deleteMemory = async (id) => {
    await supabase.from('memory').delete().eq('id', id);
    fetchMemory();
  };

  const exportCSV = () => {
    const rows = filtered.map((m) => ({
      content: m.content.replace(/\n/g, ' '),
      pinned: m.pinned,
      summary: m.summary,
      tags: (m.tags || []).join(', '),
      clarity: m.clarity ?? '',
      helpfulness: m.helpfulness ?? '',
      actionability: m.actionability ?? ''
    }));
    const header = Object.keys(rows[0]).join(',');
    const csv = [header, ...rows.map((r) => Object.values(r).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'memory.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    filtered.forEach((item, i) => {
      doc.text(`Memory ${i + 1}`, 10, 10 + i * 30);
      doc.text(`Tags: ${(item.tags || []).join(', ')}`, 10, 16 + i * 30);
      doc.text(item.content, 10, 22 + i * 30);
    });
    doc.save('memory.pdf');
  };

  return (
    <div className="border rounded p-4 bg-white shadow-sm text-sm">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="font-semibold text-lg">🧠 Memory Editor</h2>
        <div className="flex gap-2">
          {(chatId && projectId) && (
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="text-sm border px-2 py-1 rounded"
            >
              <option value="chat">Chat Only</option>
              <option value="project">Project Only</option>
              <option value="both">Chat + Project</option>
            </select>
          )}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border px-2 py-1 rounded"
          >
            <option value="all">All</option>
            <option value="pinned">Pinned</option>
            <option value="summary">Summary</option>
          </select>
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        <input
          type="text"
          className="border w-full px-2 py-1 rounded text-sm"
          placeholder="Search memory by text or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={exportCSV} className="bg-blue-500 text-white text-xs px-3 py-1 rounded">
          Export CSV
        </button>
        <button onClick={exportPDF} className="bg-green-600 text-white text-xs px-3 py-1 rounded">
          Export PDF
        </button>
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500 italic">No memory matches your filters.</p>
      )}

      <div className="space-y-4">
        {filtered.map((item) => (
          <div key={item.id} className="border p-3 rounded bg-gray-50">
            <textarea
              className="w-full border rounded p-2 text-sm mb-2"
              rows={3}
              value={item.content}
              onChange={(e) => updateMemory(item.id, 'content', e.target.value)}
            />

            <div className="flex gap-3 text-xs mb-1">
              <label>
                <input
                  type="checkbox"
                  checked={item.pinned}
                  onChange={(e) => updateMemory(item.id, 'pinned', e.target.checked)}
                /> Pin
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={item.summary}
                  onChange={(e) => updateMemory(item.id, 'summary', e.target.checked)}
                /> Summary
              </label>
            </div>

            <div className="text-xs text-gray-700 mb-1">
              Tags:{' '}
              {(item.tags || []).map((tag, i) => (
                <span key={i} className="inline-block bg-gray-200 rounded px-2 py-0.5 mr-1">
                  {tag}
                </span>
              ))}
            </div>

            <input
              type="text"
              className="w-full border px-2 py-1 text-xs rounded mb-2"
              placeholder="Add tags (comma separated)"
              onBlur={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean);
                updateMemory(item.id, 'tags', tags);
              }}
            />

            <div className="flex gap-2 text-xs mb-2">
              <input
                type="number"
                placeholder="Clarity"
                min="1"
                max="5"
                value={item.clarity ?? ''}
                onChange={(e) => updateMemory(item.id, 'clarity', e.target.value)}
                className="w-20 border px-1 py-0.5 rounded"
              />
              <input
                type="number"
                placeholder="Helpfulness"
                min="1"
                max="5"
                value={item.helpfulness ?? ''}
                onChange={(e) => updateMemory(item.id, 'helpfulness', e.target.value)}
                className="w-24 border px-1 py-0.5 rounded"
              />
              <input
                type="number"
                placeholder="Actionability"
                min="1"
                max="5"
                value={item.actionability ?? ''}
                onChange={(e) => updateMemory(item.id, 'actionability', e.target.value)}
                className="w-28 border px-1 py-0.5 rounded"
              />
            </div>

            <div className="flex justify-end mt-2">
              <button
                onClick={() => deleteMemory(item.id)}
                className="text-red-500 text-xs hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <input
          type="text"
          className="flex-grow border rounded px-3 py-2 text-sm"
          placeholder="Add new memory block..."
          value={newMemory}
          onChange={(e) => setNewMemory(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addMemory()}
        />
        <button
          onClick={addMemory}
          className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
        >
          Add
        </button>
      </div>
    </div>
  );
}
