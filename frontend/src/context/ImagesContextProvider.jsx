import { useState } from "react";
import { ImagesContext } from "./imagesContext";

export const ImagesContextProvider = ({ children }) => {
  const [images, setImages] = useState([]); // [{ id, url }]
  const [featuredImageId, setFeaturedImageId] = useState(null);

  const value = {
    images,
    setImages,
    featuredImageId,
    setFeaturedImageId,
  };

  return (
    <ImagesContext.Provider value={value}>{children}</ImagesContext.Provider>
  );
};
