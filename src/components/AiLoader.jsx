import React from 'react';

export default function AiLoader() {
  return (
    <div className="flex items-center space-x-2 animate-pulse text-purple-700">
      <div className="h-3 w-3 rounded-full bg-purple-800"></div>
      <div className="h-3 w-3 rounded-full bg-purple-600"></div>
      <div className="h-3 w-3 rounded-full bg-purple-500"></div>
      <span className="text-sm">AI is thinking...</span>
    </div>
  );
}
