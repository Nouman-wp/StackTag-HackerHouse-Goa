import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SpaceNavbar from './components/SpaceNavbar';
import SpaceFooter from './components/SpaceFooter';
import SpaceHome from './pages/SpaceHome';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/Dashboard';
import TestWallet from './pages/TestWallet';
import './index.css';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <SpaceNavbar />
      <main className="flex-1">
        {children}
      </main>
      <SpaceFooter />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Layout>
            <SpaceHome />
          </Layout>
        } />
        <Route path="/:username/profile" element={
          <Layout>
            <ProfilePage />
          </Layout>
        } />
        <Route path="/:username/dashboard" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/test" element={
          <Layout>
            <TestWallet />
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;