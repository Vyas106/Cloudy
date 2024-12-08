import React, { useState, useEffect } from 'react';
import { 
  FaCloud, 
  FaUserCircle, 
  FaSignOutAlt, 
  FaFileUpload, 
  FaTrash, 
  FaDownload,
  FaUser
} from 'react-icons/fa';
import axios from 'axios';

const UserDashboard = () => {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [files, setFiles] = useState([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [totalStorage] = useState(2); // Default 2GB for free tier
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Login handler
  const handleLogin = async (loginUsername) => {
    try {
      await axios.post('http://localhost:5000/api/login', { username: loginUsername });
      setIsLoggedIn(true);
      setUsername(loginUsername);
      localStorage.setItem('username', loginUsername);
      fetchUserFiles();
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  // Fetch user files
  const fetchUserFiles = async () => {
    try {
      const storedUsername = localStorage.getItem('username');
      const response = await axios.get(`http://localhost:5000/api/files/${storedUsername}`);
      const userFiles = Array.isArray(response.data) ? response.data : [];
      
      setFiles(userFiles);
      
      // Calculate total storage used
      const totalStorage = userFiles.reduce((acc, file) => acc + (file.size || 0), 0);
      setStorageUsed(totalStorage / (1024 * 1024)); // Convert to MB
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    }
  };

  // File upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', localStorage.getItem('username') || '');

    try {
      await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchUserFiles();
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('File upload error:', error);
      alert('File upload failed. Check storage limits.');
    }
  };

  // File delete handler
  const handleFileDelete = async (fileId) => {
    try {
      await axios.delete(`http://localhost:5000/api/files/${fileId}`);
      fetchUserFiles();
    } catch (error) {
      console.error('File delete error:', error);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    setFiles([]);
  };

  // Check login status on mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      handleLogin(storedUsername);
    }
  }, []);

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className={`w-full max-w-md p-8 space-y-6 rounded-xl shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <div className="flex items-center justify-center space-x-3">
            <FaCloud className="text-4xl text-blue-600" />
            <h1 className="text-3xl font-bold">CloudyDrive</h1>
          </div>
          
          <input
            type="text"
            placeholder="Enter Username"
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin(e.target.value)}
          />
          
          <button
            onClick={() => {
              const usernameInput = document.querySelector('input');
              handleLogin(usernameInput.value);
            }}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <FaUserCircle className="mr-2" /> Login
          </button>

          <div className="flex justify-center">
            <button 
              onClick={toggleDarkMode}
              className="text-sm text-blue-600 hover:underline"
            >
              {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`w-64 p-6 space-y-6 ${isDarkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r'}`}>
        <div className="flex items-center space-x-3">
          <FaCloud className="text-4xl text-blue-600" />
          <h1 className="text-2xl font-bold">CloudyDrive</h1>
        </div>

        <nav className="space-y-2">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className={`w-full text-left p-3 rounded-lg flex items-center space-x-2 hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
          >
            <FaFileUpload /> <span>Upload Files</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className={`w-full text-left p-3 rounded-lg flex items-center space-x-2 text-red-500 hover:bg-red-50 ${isDarkMode ? 'hover:bg-red-900/20' : ''}`}
          >
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </nav>

        <div className="absolute bottom-6 w-52">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <h3 className="text-sm font-semibold mb-2">Storage</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{width: `${(storageUsed / totalStorage) * 100}%`}}
              ></div>
            </div>
            <p className="text-xs text-gray-600">
              {storageUsed.toFixed(1)} MB / {totalStorage} GB Used
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
              <FaUser />
            </div>
            <h2 className="text-3xl font-bold">Welcome, {username}</h2>
          </div>
          
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <FaFileUpload /> <span>Upload New File</span>
          </button>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div 
              key={file._id} 
              className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {`${(file.size / 1024).toFixed(2)} KB`}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <a 
                    href={file.cloudinaryUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaDownload size={20} />
                  </a>
                  <button 
                    onClick={() => handleFileDelete(file._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-96 p-6 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload File</h2>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <input 
              type="file" 
              onChange={handleFileUpload} 
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;