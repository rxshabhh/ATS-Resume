const Button = ({ children, variant = 'primary', className = '', onClick, type = 'button' }) => {
  const base =
    'px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400/50';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-white/70 backdrop-blur-md text-gray-800 hover:bg-white',
    cta: 'bg-indigo-600 hover:bg-indigo-700 text-white'
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
