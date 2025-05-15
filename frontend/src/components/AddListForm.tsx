import React, { useState } from 'react';

interface AddListFormProps {
  onAddList: (name: string) => void;
}

const AddListForm: React.FC<AddListFormProps> = ({ onAddList }) => {
  const [newListName, setNewListName] = useState('');

  const handleAddList = () => {
    if (!newListName.trim()) return;
    onAddList(newListName);
    setNewListName('');
  };

  return (
    <div className="flex my-6 border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
      <input
        id="add-list-input"
        type="text"
        placeholder="Add List Name"
        value={newListName}
        onChange={(e) => setNewListName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
        className="flex-1 py-3 px-4 border-none outline-none text-base"
        autoFocus
      />
      <button 
        className="px-4 flex items-center justify-center text-gray-800 hover:text-primary"
        onClick={handleAddList}
        aria-label="Add list"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

export default AddListForm; 