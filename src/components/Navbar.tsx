import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuthStore } from '@/store/auth';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { isLoggedIn, login, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuth = () => {
    if (isLoggedIn) {
      logout();
      navigate('/');
    } else {
      login();
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const isDashboard = location.pathname === '/dashboard';

  return (
    <nav className="bg-white shadow-sm fixed top-0 w-full z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span 
              className="text-xl font-bold text-brand-blue cursor-pointer hover:text-blue-700"
              onClick={() => navigate('/')}
            >
              AI Hedge
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {!isDashboard && (
                  <Button 
                    variant="outline" 
                    className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
                    onClick={handleGoToDashboard}
                  >
                    进入仪表板
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={handleLogout}
                >
                  登出
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
                onClick={handleAuth}
              >
                钱包登录
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
