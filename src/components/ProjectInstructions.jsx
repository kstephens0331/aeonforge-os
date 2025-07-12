import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function ProjectInstructions({ projectId }) {
  const [project, setProject] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (data) setProject(data);
  };

  if (!project?.instructions) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded shadow-sm">
      <p className="text-sm text-yellow-800 whitespace-pre-line">
        <strong>📘 Project Instructions:</strong><br />
        {project.instructions}
      </p>
    </div>
  );
}
