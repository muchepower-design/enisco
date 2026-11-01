const GlassCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/70 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;