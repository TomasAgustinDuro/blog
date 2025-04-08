import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./auth/authContext";
import AppRoutes from "../routes/routes";
import Navbar from "./components/navbar";

function App() {
  const queryClient = new QueryClient();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
      <Router>
        <Navbar/>
        <AppRoutes />
      </Router>
    </QueryClientProvider>
    </AuthProvider>
    
  );
}

export default App;
