import React, { useState } from 'react';

const AddMessage = ({ ThreadId, onAddMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (message.trim()) {
      await onAddMessage(ThreadId, message);
      setMessage(''); // Clear the input after submitting
    } else {
      console.error('Message is empty');
    }
  };

  return (
    <>
      <script src="https://cdn.tailwindcss.com/"></script>
      <div className="p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="flex justify-between mb-4">
          <div className="mr-2">
            <span className="bg-gray-100 rounded-md font-semibold cursor-pointer p-2">Write</span>
          </div>
        </div>
        <textarea
          placeholder="Add your message..."
          className="p-2 focus:outline-1 focus:outline-blue-500 font-bold border-[0.1px] resize-none h-32 sm:h-36 md:h-40 lg:h-48 border-gray-400 rounded-md w-full md:w-3/4 lg:w-2/3 xl:w-3/4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        <div className="flex justify-end mt-4">
          <button
            className="text-sm font-semibold bg-indigo-600 text-white py-2 rounded px-3 hover:bg-indigo-500 transition-colors duration-300"
            onClick={handleSubmit}
          >
            Post
          </button>
        </div>
      </div>
    </>
  );
};

export default AddMessage;
