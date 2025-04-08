import ProtectedRoutes from "./protectedRoutes";
import { Routes, Route } from "react-router";
import Posts from "../src/pages/admin/Posts";
import EditPost from "../src/pages/admin/EditPost";
import CreatePostForm from "../src/pages/admin/insertPost";
import Login from "../src/pages/public/Login";
import PublicPosts from "../src/pages/public/PublicPosts";
import Home from "../src/pages/public/Home";
import AboutMe from "../src/pages/public/aboutMe";
import SpecificPost from "../src/pages/public/SpecificPost";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about-me" element={<AboutMe />} />
      <Route path="/post" element={<PublicPosts />} />
      <Route path="/post/:id" element={<SpecificPost />} />
      <Route
        path="/edit/:id"
        element={
          <ProtectedRoutes>
            <EditPost />
          </ProtectedRoutes>
        }
      />
      <Route
        path="admin/post"
        element={
          <ProtectedRoutes>
            <Posts />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <ProtectedRoutes>
            <Posts />
          </ProtectedRoutes>
        }
      />

      <Route
        path="/create"
        element={
          <ProtectedRoutes>
            <CreatePostForm />
          </ProtectedRoutes>
        }
      />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
