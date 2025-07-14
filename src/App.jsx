import { Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout.jsx';
import Home from './pages/Home.jsx';
import ChatView from './pages/ChatView.jsx';
import ModelLeaderboard from './pages/ModelLeaderboard';
import FileBuilder from './pages/FileBuilder';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="chat/:id" element={<ChatView />} />
        <Route path="/models" element={<ModelLeaderboard />} />
        <Route path="/builder/files/:projectId/:projectName/:toolName" element={<FileBuilder />} />
      </Route>
    </Routes>
  );
}