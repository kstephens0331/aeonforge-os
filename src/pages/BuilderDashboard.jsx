import { useState } from 'react';
import { supabase } from '../supabase';

export default function BuilderDashboard() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('');

  const submit = async () => {
    setStatus('Submitting...');
    const { error } = await supabase.from('requests').insert([
      { prompt, status: 'pending' }
    ]);
    if (error) return setStatus('❌ Error: ' + error.message);
    setStatus('✅ Submitted!');
    setPrompt('');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🧠 Aeonforge Builder</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe what to build..."
        className="w-full p-4 border rounded mb-3"
        rows={5}
      />
      <button onClick={submit} className="bg-indigo-600 text-white px-4 py-2 rounded">
        Build It
      </button>
      <p className="mt-2 text-sm">{status}</p>
    </div>
  );
}
