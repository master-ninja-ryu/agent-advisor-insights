
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Agents from '@/components/Agents';
import StockDemo from '@/components/StockDemo';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Agents />
        <StockDemo />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
