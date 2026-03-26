const ChartCard = ({ data = [] }) => {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Monthly Applications
      </h3>

      {!data.length && (
        <div className="flex-1 flex items-center justify-center text-gray-500 font-medium">
          No data available
        </div>
      )}
    </div>
  );
};

export default ChartCard;
