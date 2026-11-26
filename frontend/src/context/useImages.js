import { useContext } from "react";
import { ImagesContext } from "./imagesContext";

export const useImages = () => {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("useImages must be used within an ImagesContextProvider");
  }
  return context;
};
