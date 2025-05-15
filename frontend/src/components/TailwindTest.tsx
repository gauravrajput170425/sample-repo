const TailwindTest = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-primary mb-4">
        Tailwind CSS v4 is now added!
      </h2>
      
      <p className="mb-3 text-gray-700">
        This component demonstrates Tailwind CSS v4 working alongside existing styles.
      </p>
      
      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="p-2 bg-primary text-white rounded hover:bg-primary-dark">
          Tailwind Button
        </button>
        
        <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Another Tailwind Button
        </button>
      </div>
    </div>
  );
};

export default TailwindTest; 