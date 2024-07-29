import React, { useState } from 'react';

const EditMessageModal = ({ messageId, currentContent, onClose, onSave }) => {
  const [newContent, setNewContent] = useState(currentContent);

  const handleSave = () => {
    onSave(messageId, newContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-10">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-1/2 lg:w-1/3">
        <h2 className="text-2xl font-bold mb-4">Edit Message</h2>
        <textarea
          className="w-full p-2 border rounded mb-4"
          rows="5"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        ></textarea>
        <div className="flex justify-end">
          <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMessageModal;
