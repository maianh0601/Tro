export const getPrimaryImage = (src) => {
  if (!src) return "";

  if (Array.isArray(src)) {
    return src.find(Boolean) || "";
  }

  if (typeof src === "string") {
    return (
      src
        .split(",")
        .map((item) => item.trim())
        .find((item) => item.length > 0) || ""
    );
  }

  return "";
};

