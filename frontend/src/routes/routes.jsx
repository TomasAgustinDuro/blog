import ProtectedRoutes from "./protectedRoutes";
import { Routes, Route } from "react-router";
import Posts from "../pages/admin/Posts";
import EditPost from "../pages/admin/EditPost";
import CreatePostForm from "../pages/admin/CreatePostComponent/insertPost";
import Login from "../pages/public/Login";
import PublicPosts from "../pages/public/PublicPosts";
import Home from "../pages/public/Home";
import AboutMe from "../pages/public/aboutMe";
import SpecificPost from "../pages/public/SpecificPost";
import Admin from "../pages/admin/Admin";
import { ImagesContextProvider } from "../context/ImagesContext";
// import CloudinaryUploader from "../src/components/cloudinary";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about-me" element={<AboutMe />} />
      <Route path="/post" element={<PublicPosts />} />
      <Route path="/post/:id" element={<SpecificPost />} />

      <Route path="/admin" element={
        <ProtectedRoutes>
          <Admin />
        </ProtectedRoutes>
      }>
        <Route path="create" element={<ImagesContextProvider><CreatePostForm /></ImagesContextProvider>} />
        <Route path="edit/:id" element={<ImagesContextProvider><EditPost /></ImagesContextProvider>} />
        <Route path="post" element={<Posts />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
