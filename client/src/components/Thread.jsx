import React, { useState, useEffect } from 'react';

const Thread = ({ handleCreateThread, handleEditThread }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    document.body.classList.add('bg-white');
    
    return () => {
      document.body.classList.remove('bg-white');
    };
  }, []);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const onCreateThread = () => {
    handleCreateThread({ title, description });
  };

  return (
    <>
      <div className="heading text-center rounded-lg font-bold text-2xl m-5 text-gray-800">Create Discussion</div>
      <div className="editor mx-auto w-10/12 flex flex-col text-gray-800 border border-gray-300 p-4 shadow-lg max-w-2xl">
        <input
          className="title bg-gray-100 border rounded-lg border-gray-300 p-2 mb-4 outline-none"
          spellCheck="false"
          placeholder="Title"
          type="text"
          value={title}
          onChange={handleTitleChange}
        />
        <textarea
          className="description bg-gray-100 sec p-3 h-60 border rounded-lg border-gray-300 outline-none"
          spellCheck="false"
          placeholder="Describe everything about this post here"
          value={description}
          onChange={handleDescriptionChange}
        ></textarea>
        
        <div className="buttons flex p-2 items-center">
          <div className="btn border rounded-2xl border-indigo-500 p-1 px-4 font-semibold cursor-pointer text-gray-200 ml-2 bg-indigo-500" onClick={onCreateThread }>CREATE</div>
        </div>
      </div>
    </>
  );
};

export default Thread;
