
import React from 'react';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm fixed top-0 w-full z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-brand-blue">AI Hedge</span>
          </div>
          <div className="flex items-center space-x-4">
            <a className="text-gray-600 hover:text-brand-blue transition-colors" href="#features">功能</a>
            <a className="text-gray-600 hover:text-brand-blue transition-colors" href="#agents">智能体</a>
            <a className="text-gray-600 hover:text-brand-blue transition-colors" href="#demo">演示</a>
            <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white">
              登录
            </Button>
            <Button className="bg-brand-blue text-white hover:bg-blue-700">
              立即体验
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
