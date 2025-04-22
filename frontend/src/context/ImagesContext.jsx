import { createContext, useContext, useState } from "react";
import React from "react";

// 1. Creamos el contexto (con valor inicial opcional)
const ImagesContext = createContext(null);

// 2. Proveedor del contexto
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

export const useImages = () => {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("useImages must be used within an ImagesContextProvider");
  }
  return context;
};
