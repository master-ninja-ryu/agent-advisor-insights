
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-24 pb-16">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-brand-blue">AI驱动</span>的投资决策，<br/>
              <span className="text-brand-green">智能预测</span>助力投资未来
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              我们的产品通过多个AI智能体协同工作，模拟虚拟对冲基金，
              为您提供基于数据的实时投资建议。
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-brand-blue text-white hover:bg-blue-700 px-6 py-6">
                开始投资之旅
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-6 py-6">
                了解更多
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="w-full h-72 lg:h-96 bg-gradient-to-br from-brand-blue/10 to-brand-green/10 rounded-2xl flex items-center justify-center relative">
                <div className="absolute w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center animate-float top-12 left-12 z-10">
                  <div className="text-brand-blue font-bold">情绪分析</div>
                </div>
                <div className="absolute w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center animate-float delay-300 bottom-12 left-24">
                  <div className="text-brand-green font-bold">基本面</div>
                </div>
                <div className="absolute w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center animate-float delay-700 top-16 right-16">
                  <div className="text-brand-red font-bold">技术分析</div>
                </div>
                <div className="w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center animate-pulse-slow z-20">
                  <div className="text-xl font-bold bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">决策中心</div>
                </div>
                <div className="absolute w-full h-full flex items-center justify-center">
                  <div className="absolute w-48 h-48 border-2 border-dashed border-gray-300 rounded-full animate-spin-slow opacity-60"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
