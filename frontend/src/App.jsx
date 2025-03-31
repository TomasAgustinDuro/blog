import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import CreatePostForm from "./components/insertPost";
import Posts from "./components/Posts";
import EditPost from "./components/EditPost";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/post" element={<Posts />} />
          <Route path="/edit/:id" element={<EditPost />} />
          <Route path="/create" element={<CreatePostForm />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
