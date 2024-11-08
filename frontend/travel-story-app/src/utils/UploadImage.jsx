import axiosInstance from "./AxiosInstance";

const uploadImage = async (imageFile) => {
  const formData = new FormData();
  // Append image file to form data
  formData.append("image", imageFile);

  try {
    const responce = await axiosInstance.post("image-upload", formData, {
      headers: {
        "Content-Type": "multipal/form-data",
      },
    });
    return responce.data;
  } catch (error) {
    console.error("Error uploading the image", error);
    throw error;
  }
};

export default uploadImage