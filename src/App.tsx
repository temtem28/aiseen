
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import AuditForm from "./pages/AuditForm";
import AuditRunning from "./pages/AuditRunning";
import AuditResults from "./pages/AuditResults";
import AuditHistory from "./pages/AuditHistory";
import AIPerception from "./pages/AIPerception";
import CompetitiveAnalysis from "./pages/CompetitiveAnalysis";
import ContentGenerator from "./pages/ContentGenerator";
import WeeklyReports from "./pages/WeeklyReports";
import AICitations from "./pages/AICitations";
import Settings from "./pages/Settings";
import BlogListing from "./pages/BlogListing";
import BlogArticle from "./pages/BlogArticle";
import PricingPage from "./pages/PricingPage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/audit" element={<ProtectedRoute><AuditForm /></ProtectedRoute>} />
              <Route path="/audit/running" element={<ProtectedRoute><AuditRunning /></ProtectedRoute>} />
              <Route path="/audit/results" element={<ProtectedRoute><AuditResults /></ProtectedRoute>} />
              <Route path="/audit/history" element={<ProtectedRoute><AuditHistory /></ProtectedRoute>} />
              <Route path="/ai-perception" element={<ProtectedRoute><AIPerception /></ProtectedRoute>} />
              <Route path="/competitive-analysis" element={<ProtectedRoute><CompetitiveAnalysis /></ProtectedRoute>} />
              <Route path="/content-generator" element={<ProtectedRoute><ContentGenerator /></ProtectedRoute>} />
              <Route path="/weekly-reports" element={<ProtectedRoute><WeeklyReports /></ProtectedRoute>} />
              <Route path="/ai-citations" element={<ProtectedRoute><AICitations /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<BlogListing />} />
              <Route path="/blog/:slug" element={<BlogArticle />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

