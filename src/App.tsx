import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Onboarding } from "./pages/Onboarding";
import { Matches } from "./pages/Matches";
import { MiniGames } from "./pages/MiniGames";
import { People } from "./pages/People";
import { Bingo } from "./pages/Bingo";
import { Groups } from "./pages/Groups";
import { GroupDetail } from "./pages/GroupDetail";
import { Wall } from "./pages/Wall";
import { Admin } from "./pages/Admin";
import { Profile } from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/e/demo" replace />} />
            <Route path="/e/:eventId" element={<Landing />} />
            <Route path="/e/:eventId/join" element={<Onboarding />} />
            <Route path="/e/:eventId/matches" element={<Matches />} />
            <Route path="/e/:eventId/games" element={<MiniGames />} />
            <Route path="/e/:eventId/people" element={<People />} />
            <Route path="/e/:eventId/bingo" element={<Bingo />} />
            <Route path="/e/:eventId/groups" element={<Groups />} />
            <Route path="/e/:eventId/groups/:categorySlug" element={<GroupDetail />} />
            <Route path="/e/:eventId/wall" element={<Wall />} />
            <Route path="/e/:eventId/admin" element={<Admin />} />
            <Route path="/e/:eventId/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
