export default function Button({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded ${className}`}
    >
      {children}
    </button>
  );
}