// Mock Firebase implementation for compatibility
export const storage = null;
export const uploadImage = async (file: File): Promise<string> => {
  return ""; // Este valor no se usará ya que las imágenes se suben directamente al servidor
};
export const deleteImageFromStorage = async () => {
  // No es necesario hacer nada aquí
};
