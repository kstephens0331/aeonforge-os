// src/utils/batchCreateFiles.js
export const batchCreateFiles = async (files, options = {}) => {
  const {
    project_id,
    folder = 'output',
    saveToSupabase = true,
    description = '',
    projectName = '',
    toolName = '',
  } = options;

  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

  const payload = files.map((file) => {
    const baseTitle = file.title || `${projectName || 'generated'}-${toolName || 'tool'}`;
    const filename = `${baseTitle}-${timestamp}.${file.extension || 'txt'}`;

    return {
      content: file.content || '',
      filename,
      folder,
      saveToSupabase,
      project_id,
      description: description || `Generated on ${new Date().toLocaleString()}`,
    };
  });

  const results = [];
  for (const entry of payload) {
    try {
      const res = await fetch('/api/create-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      const data = await res.json();
      results.push({ filename: entry.filename, ...data });
    } catch (err) {
      console.error('File creation failed:', err);
      results.push({ filename: entry.filename, error: err.message });
    }
  }

  return results;
};
