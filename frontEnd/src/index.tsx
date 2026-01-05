import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import App from './App.tsx';
import Home from './Page/Home.tsx';
import Mypage1 from './Page/MyPage1.tsx';
import Mypage2 from './Page/MyPage2.js';
import UploadVideo from './Page/VideoUpload.js';
import SelectPerson from './Page/SelectPerson.js';
import { getCookie } from './apis/apis_Cookie.js';



const PrivateRoute = ({ element}: { element: React.ReactElement }) => {
  const isAuthenticated = null != getCookie('ACCESS_TOKEN');
  return isAuthenticated===true ? (
    element
  ) : (
    <Navigate to="/" />
  );
};

const PublicRoute = ({ element}: { element: React.ReactElement }) => {
  const isAuthenticated = null != getCookie('ACCESS_TOKEN');
  return isAuthenticated == true ? (
    <Navigate to="/home" />
  ) : (
    element
  );
};

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

root.render(
  <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute element={<App />} />} />
        <Route path='/home' element={<PrivateRoute element={<Home />} />} />
        <Route path="/uploadvideo" element={<PrivateRoute element={<UploadVideo />}  />} />
        <Route path="/Mypage1" element={<PrivateRoute element={<Mypage1 />} />} />
        <Route path="/Mypage2" element={<PrivateRoute element={<Mypage2 />}  />} />
        <Route path="/selectperson" element={<PrivateRoute element={<SelectPerson />}  />} />
    </Routes>
  </BrowserRouter>
);

