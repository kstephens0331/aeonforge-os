import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function ProjectSettings({ projectId }) {
  const [modelOverride, setModelOverride] = useState('');

  useEffect(() => {
    const fetchOverride = async () => {
      const { data } = await supabase.from('projects').select('model_override').eq('id', projectId).single();
      if (data) setModelOverride(data.model_override || '');
    };
    fetchOverride();
  }, [projectId]);

  const updateOverride = async () => {
    await supabase.from('projects').update({ model_override: modelOverride }).eq('id', projectId);
    alert('Model override updated');
  };

  return (
    <div className="p-4 bg-white border rounded">
      <h2 className="font-bold text-lg mb-2">Model Override</h2>
      <select
        value={modelOverride}
        onChange={(e) => setModelOverride(e.target.value)}
        className="border px-3 py-2"
      >
        <option value="">🧠 Auto</option>
        <option value="gpt-4">GPT-4</option>
        <option value="claude-3-opus-20240229">Claude</option>
        <option value="gemini-pro">Gemini</option>
        <option value="mistral-tiny">Mistral</option>
      </select>
      <button onClick={updateOverride} className="ml-3 bg-blue-600 text-white px-4 py-2 rounded">
        Save
      </button>
    </div>
  );
}