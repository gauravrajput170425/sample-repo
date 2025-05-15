import { useState } from 'react';

interface EditListNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
  initialName: string;
}

const EditListNameModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  initialName
}: EditListNameModalProps) => {
  const [listName, setListName] = useState(initialName);

  if (!isOpen) return null;

  const handleSave = () => {
    if (listName.trim()) {
      onSave(listName);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#00000066] flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg max-w-lg w-full p-6">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold">Edit List Name</h2>
          <button 
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm mb-1">List Name</label>
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="List Name"
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditListNameModal; 