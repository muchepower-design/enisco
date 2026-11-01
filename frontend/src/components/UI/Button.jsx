const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105 gap-2';
  const variants = {
    primary: 'bg-brand-red text-white hover:bg-brand-red-dark',
    outline: 'border-2 border-brand-red text-brand-red hover:bg-brand-red hover:text-white',
    dark: 'bg-gray-800 text-white hover:bg-gray-900',
  };
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;