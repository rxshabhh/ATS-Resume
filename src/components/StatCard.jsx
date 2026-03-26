const StatCard = ({ icon, title, value, iconBg }) => {
  const Icon = icon;

  return (
    <div className="
      bg-white/80 backdrop-blur-2xl
      border border-white/60
      rounded-2xl p-6
      shadow-xl
      transition-all duration-300
      hover:shadow-2xl
      hover:-translate-y-1
    ">
      <div className="mb-4">
        <div className={`${iconBg} p-3 rounded-xl w-fit`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>

      <div className="text-4xl font-semibold text-gray-900 mb-1">
        {value}
      </div>

      <div className="text-gray-600 font-medium">
        {title}
      </div>
    </div>
  );
};

export default StatCard;
