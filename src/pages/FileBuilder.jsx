import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { batchCreateFiles } from '../utils/batchCreateFiles';
import { supabase } from '../supabase';

export default function FileBuilder() {
  const { projectId, projectName, toolName } = useParams();
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🧠 Fetch memory snippets related to this tool/project
  useEffect(() => {
    autoFillFromMemory();
  }, [projectId, toolName]);

  const autoFillFromMemory = async () => {
    const { data } = await supabase
      .from('memory')
      .select('*')
      .eq('project_id', projectId)
      .contains('tags', [toolName]);

    if (!data) return;

    for (const item of data) {
      const lower = item.content.toLowerCase();
      if (lower.includes('<html') || lower.includes('</html>')) setHtmlCode(item.content);
      else if (lower.includes('{') && lower.includes('}')) setCssCode(item.content);
      else if (lower.includes('function') || lower.includes('console.') || lower.includes('document.')) setJsCode(item.content);
    }
  };

  // 🔁 Save 3 files dynamically
  const saveFiles = async () => {
    setLoading(true);
    const files = [
      { content: htmlCode, title: `${toolName}-index`, extension: 'html' },
      { content: cssCode, title: `${toolName}-style`, extension: 'css' },
      { content: jsCode, title: `${toolName}-script`, extension: 'js' },
    ];

    const results = await batchCreateFiles(files, {
      project_id: projectId,
      folder: `projects/${projectName}`,
      saveToSupabase: true,
      projectName,
      toolName,
      description: `Auto-generated tool files for ${toolName}`,
    });

    setLog(results);
    setLoading(false);
  };

  // 🔄 Regenerate all tool files from memory content
  const rebuildFromMemory = async () => {
    setHtmlCode('');
    setCssCode('');
    setJsCode('');
    await autoFillFromMemory();
    await saveFiles();
  };

  return (
    <div className="p-6 bg-white border rounded shadow-sm">
      <h2 className="text-lg font-bold mb-4">🛠️ File Generator: {toolName} (Project: {projectName})</h2>

      <textarea
        className="w-full border p-2 mb-3 rounded text-sm"
        rows={6}
        value={htmlCode}
        onChange={(e) => setHtmlCode(e.target.value)}
        placeholder="HTML Code..."
      />
      <textarea
        className="w-full border p-2 mb-3 rounded text-sm"
        rows={6}
        value={cssCode}
        onChange={(e) => setCssCode(e.target.value)}
        placeholder="CSS Code..."
      />
      <textarea
        className="w-full border p-2 mb-3 rounded text-sm"
        rows={6}
        value={jsCode}
        onChange={(e) => setJsCode(e.target.value)}
        placeholder="JavaScript Code..."
      />

      <div className="flex gap-4">
        <button
          onClick={saveFiles}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          💾 Save & Generate Files
        </button>

        <button
          onClick={rebuildFromMemory}
          disabled={loading}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          🔄 Rebuild All from Memory
        </button>
      </div>

      {log.length > 0 && (
        <div className="mt-4 text-sm text-gray-700">
          <h4 className="font-medium mb-2">📄 Output Log:</h4>
          <ul className="list-disc pl-6 space-y-1">
            {log.map((entry, idx) => (
              <li key={idx}>
                {entry.filename}: {entry.success ? '✅ Saved' : '❌ Error'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
