interface DeleteConfirmationProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmation = ({ onCancel, onConfirm }: DeleteConfirmationProps) => {
  return (
    <div className="fixed inset-0 bg-[#00000066] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[500px] relative shadow-lg">
        <div className="flex justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-primary">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#fa5252" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 text-center">Are you sure want to delete this List?</h2>
        
        <p className="mb-6 text-gray-600 text-center leading-relaxed">This action cannot be undone. All tasks associated with this list will be lost.</p>
        
        <div className="flex gap-4 justify-center">
          <button 
            className="py-3 px-6 border border-gray-300 bg-white rounded text-sm font-medium text-gray-900"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="py-3 px-6 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark"
            onClick={onConfirm}
          >
            Delete List
          </button>
        </div>
        
        <button 
          className="absolute top-4 right-4 bg-transparent border-none cursor-pointer p-1 text-gray-600 hover:text-gray-900"
          onClick={onCancel} 
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmation; 