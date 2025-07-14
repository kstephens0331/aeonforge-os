import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function AdminOverrides() {
  const [model, setModel] = useState('');
  const [override, setOverride] = useState('');

  async function saveOverride() {
    await supabase.from('overrides').upsert({ key: 'default_model', value: override });
    alert('Override saved!');
  }

  useEffect(() => {
    supabase.from('overrides').select('*').eq('key', 'default_model').then(({ data }) => {
      setOverride(data?.[0]?.value || '');
    });
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">⚙️ Admin Overrides</h2>
      <label>Default Model Override</label>
      <input
        type="text"
        className="border px-3 py-2 rounded w-full"
        placeholder="gpt-4, gemini-pro, etc."
        value={override}
        onChange={(e) => setOverride(e.target.value)}
      />
      <button
        onClick={saveOverride}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}
