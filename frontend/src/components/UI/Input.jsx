const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-bold mb-2">{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-brand-red transition ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;