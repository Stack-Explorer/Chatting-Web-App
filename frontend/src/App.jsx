import './App.css'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import { useAuthStore } from './store/useAuthStore.js';
import { useEffect } from 'react';
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast"
import { useThemeStore } from './store/useThemeStore.js';
import OTPVerification from './pages/OTPVerification.jsx';

function App() {

  const { authUser, checkAuth, isCheckingAuth , hasSubmittedDetails } = useAuthStore();
  const { theme } = useThemeStore();


  // checkAuth is function.

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);  // it will be triggered from another pages
  // re.data is even sent ence for 1 second animation is appearing
  console.log({ authUser });

  if (isCheckingAuth && !authUser) {
    <div className='flex items-center justify-center h-screen' >
      <Loader className='size-10 animate-spin' />
    </div>
  }

  // call checkAuth when it is triggered.

  return (
    <>
      <div data-theme={theme}>
        <Navbar />
        <Routes>
          <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path='/settings' element={<SettingsPage />} />
          <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path='/otp-verification' element={  hasSubmittedDetails ?  <Navigate to="/" /> : <OTPVerification />} />
        </Routes>
        <Toaster />
      </div>
    </>
  )
}

export default App;
