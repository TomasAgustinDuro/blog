import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./auth/authContext";
import AppRoutes from "../routes/routes";
import Navbar from "./components/navbar";

const queryClient = new QueryClient();

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Navbar />
          <AppRoutes />
        </Router>
      </QueryClientProvider>
    </AuthProvider>

  );
}

export default App;
