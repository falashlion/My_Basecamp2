import React, { useState, useEffect } from 'react';
import { GrAddCircle } from 'react-icons/gr';
import { IoRemove } from 'react-icons/io5';

const Dropdown = ({ getUsers, addMember, removeMember }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const toggleDropdown = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      const usersData = await getUsers();
      setUsers(usersData);
    }
  };

  const handleAddMember = async (userId) => {
    const user = await addMember(userId);
  };

  const handleremoveMember = async (userId) => {
    const user = await removeMember(userId);
  };

  return (
    <div>
      <div className="dropdown">
        <div
          tabIndex={0}
          role="button"
          className="btn m-1"
          onClick={toggleDropdown}
        >
          <p className='mb-4 hover:text-black'><GrAddCircle size={20} /></p>
        </div>
        {isOpen && (
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-xl z-[1] w-52 p-2 shadow"
          >
            {users.map((user) => (
              <li
                key={user._id}
                className="flex justify-between items-center group"
              >
                <div>
                  <a className='font-bold text-black'>
                    {user.firstName ? user.firstName : ''} {user.lastName ? user.lastName : ''}
                  </a>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={() => handleremoveMember(user._id)}
                    className="hover:bg-gray-200 p-1 rounded"
                  >
                    <IoRemove size={20} />
                  </button>
                  <button 
                    onClick={() => handleAddMember(user._id)}
                    className="hover:bg-gray-200 p-1 rounded"
                  >
                    <GrAddCircle size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
