import { useState, useEffect } from 'react';

interface ShareListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (email: string, permission: 'edit' | 'view') => void;
}

const ShareListModal = ({ isOpen, onClose, onShare }: ShareListModalProps) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'edit' | 'view'>('edit');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPermission('edit');
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = () => {
    if (email.trim()) {
      onShare(email, permission);
      setEmail('');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#00000066] flex items-center justify-center z-50 ">
      <div className="bg-white rounded-md shadow-lg max-w-lg w-full p-6  flex flex-col">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-semibold">Share List</h2>
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col grow">
          <div className="mb-6 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:border-red-500"
            />

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="border border-gray-300 rounded-md p-2 flex items-center"
              >
                <span className="mr-2">{permission === 'edit' ? 'Edit' : 'View'}</span>
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white shadow-lg rounded-md z-10 border border-gray-200">
                  <button
                    onClick={() => {
                      setPermission('edit');
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setPermission('view');
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    View
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grow">
            <div className="flex justify-end">
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Share
              </button>
            </div>
          </div>

          <div className="">
            <h3 className="text-sm font-medium mb-2">People with Access</h3>
            <div className="flex items-center p-2 ">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mr-3">
                <span className="text-red-700 text-sm font-medium">YU</span>
              </div>
              <div className="flex-grow">
                <p className="text-sm font-medium">You (Owner)</p>
                <p className="text-xs text-gray-500">your.email@example.com</p>
              </div>
              <div className="relative">
                <button className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  Owner
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShareListModal; 