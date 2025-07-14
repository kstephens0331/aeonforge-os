import { jsPDF } from 'jspdf';

export function exportChatToCSV(messages, filename = 'chat.csv') {
  const rows = messages.map((msg) => [msg.role, msg.content.replace(/\n/g, ' ')]);
  const header = ['Role', 'Message'];
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function exportChatToPDF(messages, filename = 'chat.pdf') {
  const doc = new jsPDF();
  let y = 10;
  doc.setFontSize(12);
  messages.forEach((msg, i) => {
    const role = `[${msg.role.toUpperCase()}]`;
    const content = msg.content || '';
    doc.text(`${role} ${content}`, 10, y);
    y += 10;
    if (y > 280) {
      doc.addPage();
      y = 10;
    }
  });
  doc.save(filename);
}