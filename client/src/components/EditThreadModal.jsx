// EditThreadModal.js
import React, { useState } from 'react';

const EditThreadModal = ({ threadId, currentTitle, onClose, onSave }) => {
  const [title, setTitle] = useState(currentTitle);

  const handleSave = () => {
    onSave(threadId, title);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-10">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Thread</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 p-2 w-full mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-indigo-500 text-white py-2 px-4 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditThreadModal;
