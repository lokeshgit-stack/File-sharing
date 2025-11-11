const LoadingSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 p-4">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="glass-effect rounded-2xl p-4 sm:p-6 animate-pulse">
          <div className="h-32 sm:h-48 bg-white/10 rounded-lg mb-4"></div>
          <div className="h-4 sm:h-5 bg-white/10 rounded w-3/4 mb-2"></div>
          <div className="h-3 sm:h-4 bg-white/10 rounded w-1/2"></div>
          <div className="mt-4 flex items-center space-x-2">
            <div className="h-8 sm:h-10 bg-white/10 rounded-full flex-grow"></div>
            <div className="h-8 sm:h-10 w-8 sm:w-10 bg-white/10 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;