import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';

import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import UploadPage from './pages/UploadPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
        <Route path="/upload" element={<UploadPage />} /> 
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;