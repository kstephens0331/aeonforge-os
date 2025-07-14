export default function Textarea({ value, onChange, placeholder, className = '', ...props }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border px-3 py-2 text-sm rounded ${className}`}
      {...props}
    />
  );
}