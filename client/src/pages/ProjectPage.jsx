import React, { useState, useEffect } from 'react';
import { useParams, useLoaderData, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { IoPerson } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GrAddCircle } from "react-icons/gr";
import Dropdown from '../components/Dropdown';
import Chart from '../components/Chart';
import { IoRemove } from 'react-icons/io5';
import AddMessage from '../components/AddMessage';
import Thread from '../components/Thread';
import ToggleSwitch from '../components/ToggleSwitch';
import { Navigate } from 'react-router-dom';

let projectId;

const ProjectPage = ({ deleteProject }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(useLoaderData());
  const [refresh, setRefresh] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [showThreadModal, setShowThreadModal] = useState(false);

  useEffect(() => {
    projectId = id;
  }, [id]);

  useEffect(() => {
    const fetchProject = async () => {
      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();
      setProject(data.data.project);
    };

    fetchProject();
  }, [id, refresh]);

  const handleCreateThread = async ({ title, description }) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`/api/projects/${projectId}/threads/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }),
    });

    if (response.ok) {
      toast.success('Thread Created Successfully');
      setRefresh(!refresh);
      setShowThreadModal(false);
    } else {
      toast.error('Failed to create thread');
    }
  };

  const onDeleteClick = async () => {
    const confirm = window.confirm('Are you sure you want to delete this project?');

    if (!confirm) return;

    const response = await deleteProject(id);
    console.log(response);
    if(response.ok) {

    toast.success('Project Deleted Successfully');
    }else{
      const errorData = await response.json();
            // console.error('Error:', errorData);
            toast.error('Project Not Deleted Check your permissions or Network');
    }

    navigate('/projects');
  };

  const getUsers = async () => {
    const token = localStorage.getItem('token');
    if(!token){
      <Navigate to="/signin" replace />
    }

    const response = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (response.ok) {
      const usersData = await response.json();
      return usersData.data.response.users;
    } else {
      console.error('Failed to fetch users');
      return [];
    }
  };

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const addAttachment = async () => {
    const token = localStorage.getItem('token');
    if(!token){
      <Navigate to="/signin" replace />
    }

    if (selectedFiles && selectedFiles.length > 0) {
      const formData = new FormData();
      for (const file of selectedFiles) {
        formData.append('attachment', file);
      }

      const response =await fetch(`/api/projects/${projectId}/attachments/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if(response.ok) {
      toast.success ('Attachment created successfully');
      setRefresh(!refresh); 
      }else {
      console.error('selected  file not uploaded');
      toast.error(`unsuccessful attachment upload`);
      }
    } else {
      console.error('No files selected');
      toast.error(`No attachments selected`);
    }
  };

  const addMember = async (userId) => {
    const token = localStorage.getItem('token');

    if(!token){
      navigate('/signin');
      return;
    }
    if (userId) {
      await fetch(`/api/projects/${projectId}/updateMember`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user: userId }),
      });
      setRefresh(!refresh); 
      
    } else {
      console.error('UserID not found');
    }
  };

  // remove member

  const removeMember = async (userId) => {
    const token = localStorage.getItem('token');
    if(!token){
      navigate('/signin');
      return;
    }

    if (userId) {
      await fetch(`/api/projects/${projectId}/removeMember`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user: userId }),
      });
      setRefresh(!refresh); 
      
    } else {
      console.error('UserID not found');
    }
  };

  // delete attachments
  const deleteAttachment = async (attachmentId) => {
    const token = localStorage.getItem('token');
    if(!token){
      navigate('/signin');
      return;
    }

    if (attachmentId) {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if(response.ok) {
        toast.success ('Attachment deleted successfully');
        setRefresh(!refresh); 
        }else {
        console.error('selected  file not deleted');
        toast.error(`attachment delete was unsuccessful`);
        }
    } else {
      console.error('AttachmentID not found');
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    console.log('attachmentId: ' + attachmentId);
      const confirm = window.confirm('Are you sure you want to delete this attachment?');
  
      if (!confirm) return;
  
      await deleteAttachment(attachmentId);
  
    };


    // add message
    const addMessage = async (ThreadId, message) => {
      const token = localStorage.getItem('token');
      if(!token){
        navigate('/signin');
        return;
      }
      if (ThreadId && message) {
        await fetch(`/api/threads/${ThreadId}/messages/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
        });
        setRefresh(!refresh); 
        toast.success('Message added successfully'); 
      } else {
        console.error('ThreadId or message not found');
      }
    };

    // make user admin 
    const updateMember = async (userId) => {
      alert("Make user admin");
      const token = localStorage.getItem('token');
      if(!token){
        navigate('/signin');
        return;
      }
      if (userId) {
        await fetch(`/api/projects/${projectId}/updateMember`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ user: userId ,
            role: 'admin',
            permissions: {
              create : true,
              read: true,
              update: true,
              delete: true
            }
          }),
        });
        setRefresh(!refresh); 
        
      } else {
        console.error('UserID not found');
      }
    };

  return (
    <>
      <section>
        <div className="container m-auto py-6 px-6">
          <Link to="/projects" className="text-indigo-500 hover:text-indigo-600 flex items-center">
            <FaArrowLeft className="text-indigo-500 hover:text-indigo-600 text-lg mr-2" />
            Back to Projects List
          </Link>
        </div>
      </section>

      <section className="bg-indigo-50">
        <div className="container m-auto py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
            <main>
                <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
                  <h2 className="text-lg mb-4">Members</h2>
                  <div className="text-gray-500 mb-4 flex flex-col md:flex-row align-middle justify-center md:justify-start">
                    <IoPerson className="text-lg text-orange-700 mr-3 mt-1 md:flex-row align-middle justify-center md:justify-start" />
                    <Dropdown className="mr-3" getUsers={getUsers} addMember={addMember} removeMember={removeMember} />
                    {project.members.map((member, index) => (
                      <div key={index} className="flex items-center ml-2 mb-1 md:flex-row align-middle justify-center md:justify-start">
                        <p className="text-indigo-800 mr-2">
                          {member.user.firstName || ''} {member.user.lastName || ''}
                        </p>
                        <ToggleSwitch
                          isChecked={member.role === 'admin'}
                          onToggle={(isChecked) => {
                            if (isChecked) {
                              updateMember(member.user._id);
                            }
                             else {
                              addMember(member.user._id);
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>


              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-indigo-800 text-lg font-bold mb-6">Project Description</h3>
                <p className="mb-4">{project.description}</p>
                <h3 className="text-indigo-800 text-lg font-bold mb-2">Created By</h3>
                <p className="mb-4">{project.created_by.firstName} {project.created_by.lastName}</p>
              </div>

              <div className="bg-white  p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-black text-lg font-bold mb-6">Discussions</h3>
      
                  <div>
                    {project.Threads.map((Thread) => (
                      <div key={Thread.id} className="mb-6">
                        <h4 className="text-indigo-600 text-md font-semibold mb-2">{Thread.title}</h4>
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          {Thread.messages.map((message) => (
                            <div key={message.id} className="mb-4">
                              <p className="text-gray-700"><strong>{message.creator_id.firstName} {message.creator_id.lastName}:</strong> {message.message}</p>
                              <p className="text-gray-500 text-sm">{new Date(message.createdAt).toLocaleString()}</p>
                            </div>
                          ))}
                          <AddMessage ThreadId={Thread.id} onAddMessage={addMessage}/>
                        </div>
                      </div>
                    ))}
                  </div>
                <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full mt-4 block" onClick={() => setShowThreadModal(true)}>
                  <GrAddCircle size={24} className="m-2" />
                </button>
              {showThreadModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-10 md:p-40 lg:p-60 xl:p-96">
                  <div className="bg-white bg-opacity-80 p-4 rounded-lg shadow-lg w-full m-4">
                    <button className="ml-auto text-red-500 hover:text-red-700 " onClick={() => setShowThreadModal(false)}>
                      close
                    </button>
                    <Thread handleCreateThread={handleCreateThread} />
                  </div>
                </div>
                 )}
              </div>
            </main>

            <aside>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-6">PROJECT INFO</h3>
                <hr className="my-4" />
                <h3 className="text-xl">Project Attachments:</h3>
                {project.attachments.map((attachment, index) => (
                   <div key={index} className="flex items-center my-2 bg-indigo-100 p-2 rounded-lg">
                   <p className="flex-1 font-bold">{attachment.data}</p>
                   <button
                      onClick={() => handleDeleteAttachment(attachment._id)}
                      className="ml-2  hover:text-red-900 hover:opacity-100 group-hover:opacity-100 transition-opacity duration-300"
                      aria-label="Delete attachment"
                    >
                      <IoRemove size={20} className="hover:bg-gray-400  rounded"/>
                    </button>
                 </div>
                ))}
                <input
                  className="block p-2 w-full text-sm text-gray-900 border border-indigo-100 rounded cursor-pointer bg-indigo-100 dark:text-gray-400 focus:outline-none dark:bg-indigo-200 dark:placeholder-gray-700"
                  id="multiple_files"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                />
                <button
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                  onClick={addAttachment}
                >
                  Upload Files
                </button>
                <h3 className="text-xl">Contact Email:</h3>
                <p className="my-2 bg-indigo-100 rounded-lg p-4 font-bold text-xl sm:text-lg md:text-sm md:font-medium md:p-2 lg:text-sm lg:font-bold xl:text-xs xl:font-bold">
                  {project.created_by.email}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-xl font-bold mb-6">Manage Project</h3>
                <Link
                  to={`/edit-projects/${project.id}`}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                >
                  Edit Project
                </Link>
                <button
                  onClick={onDeleteClick}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                >
                  Delete Project
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

const projectLoader = async ({ params }) => {
  const response = await fetch(`/api/projects/${params.id}`);
  const data = await response.json();
  return data.data.project;
};

export { ProjectPage as default, projectLoader };
