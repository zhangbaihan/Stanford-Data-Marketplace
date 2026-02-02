// This page allows authenticated users to upload datasets.
// It handles:
// 1. File selection (drag & drop or click to browse)
// 2. Form fields (title, description)
// 3. Upload progress feedback
// 4. Error handling

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function UploadPage() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Axio's onUploadProgress tracks upload progress (0-100)
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (e) => {
        // e.target.files is a FileList (array-like) of selected files
        // Since we only allow one file, we take the first one
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const allowedTypes = ['.csv', '.xlsx', '.json'];
            const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
            if (!allowedTypes.includes(fileExtension)) {
                setError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
                setFile(null);
                return;
            }
            const maxSize = 50 * 1024 * 1024;
            if (selectedFile.size > maxSize) {
                setError('File too large. Maximum size is 50MB.');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!file) {
            setError('Please select a file to upload');
            return;
        }
          
        if (!title.trim()) {
            setError('Please enter a title');
            return;
        }
          
        if (!description.trim()) {
            setError('Please enter a description');
            return;
        }
          
        if (title.length > 100) {
            setError('Title must be 100 characters or less');
            return;
        }
          
        if (description.length > 2000) {
            setError('Description must be 2000 characters or less');
            return;
        }

        // We use FormData, which creates multipart/form-data
        // This is the format browsers use for file uploads
    
        const formData = new FormData();
        // append(fieldName, value) adds a field to the form
        // The field names must match what the backend expects
        // In our case: 'file', 'title', 'description'
        formData.append('file', file);
        formData.append('title', title.trim());
        formData.append('description', description.trim());

        try {
            setIsUploading(true);
            setUploadProgress(0);

            const response = await api.post('/api/datasets', formData, {
                onUploadProgress: (progressEvent) => {
                  const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );
                  setUploadProgress(percentCompleted);
                },
            });

            console.log('Upload successful:', response.data);
            // Currently directing to Dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error('Upload error:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Upload failed. Please try again.');
            }
            setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    };


if (authLoading) {
    return <div>Loading...</div>;
}

if (!user) {
    return (
      <div>
        <h1>Upload Dataset</h1>
        <p>You must be logged in to upload datasets.</p>
        <a href="/">Go to Home to Login</a>
      </div>
    );
}

if (!user.isProfileComplete) {
    return (
      <div>
        <h1>Upload Dataset</h1>
        <p>Please complete your profile before uploading.</p>
        <a href="/complete-profile">Complete Profile</a>
      </div>
    );
}

return (
    <div>
        <h1>Upload Dataset</h1>
        <p>Supported formats: CSV, XLSX, JSON (max 50MB)</p>
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="file">
                    Select File
                </label>

                <input type="file" id="file" onChange={handleFileChange} accept=".csv,.xlsx,.json" disabled={isUploading}/>
                {file && (<p>Selected: {file.name}</p>)}
            </div>

            <div>
                <label htmlFor="title">Title</label>
                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g., Stanford Faculty Demographics 2024"
                    disabled={isUploading}
                    maxLength={100}
                />
                <p>{title.length}/100 characters</p>
            </div>

            <div>
                <label htmlFor="description">Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your dataset: what data it contains, how it was collected, time period, etc."
                    disabled={isUploading}
                    maxLength={2000}
                    rows={5}
                />
                <p>{description.length}/2000 characters</p>
            </div>

            {error && (<p>{error}</p>)}

            {isUploading && (
                <div>
                    <p>Uploading... {uploadProgress}%</p>
                    <div></div>
                </div>
            )}

            <button type="submit" disabled={isUploading || !file}>{isUploading ? 'Uploading...' : 'Upload Dataset'}</button>
        </form>

        <p>Your dataset is by default private for your view only until you request to have it made public - in which case moderators need to approve of it.</p>
    </div>
    );

}
export default UploadPage;