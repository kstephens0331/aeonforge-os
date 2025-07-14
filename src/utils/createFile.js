function generateDynamicFilename({ title = '', type = '', extension = 'txt' }) {
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${safeTitle || type || 'output'}-${timestamp}.${extension}`;
}

export async function createFile({
  content,
  filename = '',
  project_id = null,
  folder = 'output',
  description = '',
  saveToSupabase = true,
  type = 'text',
  title = '',
  extension = 'txt',
}) {
  try {
    const finalFilename = filename || generateDynamicFilename({ title, type, extension });

    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/create-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        filename: finalFilename,
        folder,
        project_id,
        description,
        saveToSupabase,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create file');

    return { success: true, path: data.path, filename: finalFilename };
  } catch (err) {
    console.error('File creation failed:', err);
    return { success: false, error: err.message };
  }
}
