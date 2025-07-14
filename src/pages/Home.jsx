import React from 'react';
import MemoryViewer from '../components/MemoryViewer';
import MultiModelTest from '../components/MultiModelTest';

export default function Home() {
  const exampleChatId = '00000000-0000-0000-0000-000000000000'; // replace with actual chat_id
  const exampleProjectId = null;

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold text-indigo-700">Aeonforge OS: Command Center</h1>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <MultiModelTest />
        </div>

        <div className="space-y-6">
          <MemoryViewer chatId={exampleChatId} projectId={exampleProjectId} />
        </div>
      </div>
    </div>
  );
}
