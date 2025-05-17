import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StockAnalysis from "./pages/StockAnalysis";
import AnalysisResult from "./pages/AnalysisResult";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import BlankPage from "./pages/BlankPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-blue-50 flex flex-col">
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/stock-analysis" element={<BlankPage />} />
            <Route path="/analysis-result" element={<AnalysisResult />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
