import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function ModelLeaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    loadModelScores();
  }, []);

  async function loadModelScores() {
    const { data, error } = await supabase.rpc('get_model_rankings');
    if (error) console.error('Error loading rankings:', error);
    else setScores(data);
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">🏆 AI Model Leaderboard</h2>
      <table className="w-full border text-sm shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Model</th>
            <th className="p-3">Clarity</th>
            <th className="p-3">Helpfulness</th>
            <th className="p-3">Actionability</th>
            <th className="p-3 font-semibold">Total Score</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((row) => (
            <tr key={row.model} className="border-t">
              <td className="p-3 font-mono">{row.model}</td>
              <td className="p-3">{row.clarity_avg.toFixed(2)}</td>
              <td className="p-3">{row.helpfulness_avg.toFixed(2)}</td>
              <td className="p-3">{row.actionability_avg.toFixed(2)}</td>
              <td className="p-3 font-semibold text-indigo-700">
                {row.score.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
