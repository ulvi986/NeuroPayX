import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Templates from "./pages/Templates";
import TemplateDetail from "./pages/TemplateDetail";
import CreateTemplate from "./pages/CreateTemplate";
import Consultants from "./pages/Consultants";
import ConsultantDetail from "./pages/ConsultantDetail";
import Community from "./pages/Community";
import CommunityDetail from "./pages/CommunityDetail";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Conversation from "./pages/Conversation";
import AdminPanel from "./pages/AdminPanel";
import { LiveChatWidget } from "./components/LiveChatWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/templates/:id" element={<TemplateDetail />} />
          <Route path="/create-template" element={<CreateTemplate />} />
          <Route path="/consultants" element={<Consultants />} />
          <Route path="/consultants/:id" element={<ConsultantDetail />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/:id" element={<CommunityDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/conversations/:id" element={<Conversation />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <LiveChatWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
