import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase.js';
import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function Layout() {
  const [tools, setTools] = useState([]);
  const [projects, setProjects] = useState([]);
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const fetchSidebarData = async () => {
    const { data: toolsData } = await supabase.from('tools').select('*');
    setTools(toolsData || []);

    const { data: projectsData } = await supabase.from('projects').select('*');
    setProjects(projectsData || []);

    const { data: chatsData } = await supabase.from('chats').select('*');
    setChats(chatsData || []);
  };

  const createProject = async () => {
    const name = prompt('Enter project name (required):');
    if (!name) return alert('❌ Project name is required.');
    const instructions = prompt('Enter instructions or background (optional):');
    const { error, data } = await supabase.from('projects').insert([{ name, instructions }]);
    if (!error) fetchSidebarData();
  };

  const createChat = async (projectId = null) => {
    const title = `Untitled Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const { data, error } = await supabase
      .from('chats')
      .insert([{ title, project_id: projectId }])
      .select();

    if (!error && data?.[0]) {
      fetchSidebarData();
      navigate(`/chat/${data[0].id}`);
    }
  };

  const standaloneChats = chats.filter(c => !c.project_id);
  const chatsByProject = {};
  chats.forEach(chat => {
    if (chat.project_id) {
      chatsByProject[chat.project_id] = chatsByProject[chat.project_id] || [];
      chatsByProject[chat.project_id].push(chat);
    }
  });

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r shadow-md p-4 overflow-y-auto">
        <div className="text-xl font-bold mb-4 cursor-pointer hover:text-indigo-600 transition">
          ⚙️ <Link to="/">Aeonforge OS</Link>
        </div>

        <button
          onClick={() => createChat(null)}
          className="bg-indigo-600 text-white w-full py-2 rounded hover:bg-indigo-700 mb-4"
        >
          + New Chat
        </button>

        {tools.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-600">🛠 Tools</h3>
            <ul className="pl-2 space-y-1 text-sm">
              {tools.map(tool => (
                <li key={tool.id}>{tool.name}</li>
              ))}
            </ul>
          </div>
        )}

        {standaloneChats.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-600">💬 Chats</h3>
            <ul className="pl-2 space-y-1 text-sm">
              {standaloneChats.map(chat => (
                <li key={chat.id}>
                  <Link to={`/chat/${chat.id}`} className="hover:underline text-indigo-700">
                    {chat.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-600">📁 Projects</h3>
          <button className="text-indigo-600 text-xs hover:underline" onClick={createProject}>+ New</button>
        </div>

        <div className="space-y-3 pl-2 text-sm">
          {projects.map(project => (
            <div key={project.id}>
              <div className="font-medium">{project.name}</div>
              <ul className="ml-2 text-gray-700">
                {(chatsByProject[project.id] || []).map(chat => (
                  <li key={chat.id}>
                    <Link to={`/chat/${chat.id}`} className="hover:underline text-indigo-700">
                      {chat.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Main View */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
