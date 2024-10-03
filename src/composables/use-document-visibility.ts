import { useState, useEffect } from "react";

export const useDocumentVisibility = () => {
  const [visibility, setVisibility] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisibility(document.visibilityState == "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return visibility;
};
