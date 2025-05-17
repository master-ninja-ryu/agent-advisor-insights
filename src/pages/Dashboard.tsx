import React from 'react';
import { useAuthStore } from '@/store/auth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-2xl font-bold mb-4">仪表板</h1>
      <p>欢迎来到您的个人仪表板！</p>
    </div>
  );
};

export default Dashboard; 