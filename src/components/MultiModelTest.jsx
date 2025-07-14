import React, { useState } from 'react';
import { supabase } from '../supabase';
import Input from './Input';
import Button from './Button';
import Textarea from './Textarea';

const MODELS = ['gpt-4', 'claude-3-opus', 'gemini-pro', 'mistral-7b'];

export default function MultiModelTest() {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState({});
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);

  async function submitPrompt() {
    if (!prompt.trim()) return;
    setLoading(true);
    const res = await fetch('/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }

  function handleScoreChange(model, field, value) {
    setScores((prev) => ({
      ...prev,
      [model]: { ...prev[model], [field]: +value },
    }));
  }

  async function submitScore(model) {
    const { clarity = 3, helpfulness = 3, actionability = 3 } = scores[model] || {};
    await supabase.from('model_scores').insert({
      model,
      prompt,
      clarity,
      helpfulness,
      actionability,
    });
    alert(`✅ Score saved for ${model}`);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">🧪 Multi-Model Prompt Test</h2>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your prompt here..."
        rows={5}
        className="w-full border"
      />
      <Button onClick={submitPrompt} disabled={loading}>
        {loading ? 'Running...' : 'Run Prompt on All Models'}
      </Button>

      {Object.entries(results).map(([model, output]) => (
        <div
          key={model}
          className="bg-white border p-4 mt-6 rounded shadow space-y-3"
        >
          <h3 className="font-bold text-indigo-700">{model}</h3>
          <pre className="text-sm whitespace-pre-wrap">{output}</pre>

          <div className="flex gap-4 mt-4">
            {['clarity', 'helpfulness', 'actionability'].map((metric) => (
              <div key={metric}>
                <label className="text-sm font-medium">{metric}</label>
                <Input
                  type="range"
                  min={1}
                  max={5}
                  value={scores[model]?.[metric] || 3}
                  onChange={(e) =>
                    handleScoreChange(model, metric, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
          <Button onClick={() => submitScore(model)}>💾 Save Score</Button>
        </div>
      ))}
    </div>
  );
}
