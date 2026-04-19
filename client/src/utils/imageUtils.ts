export const resizeToThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 200;
      ctx.drawImage(img, 0, 0, 400, 200);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
};
