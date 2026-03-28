import React, { useState } from "react";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";

const FileUpload = () => {
  const toast = useToast();
  const { execute: uploadFile } = usePost("/upload");
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return toast.error("Select a file first");

    try {
      const formData = new FormData();
      formData.append("file", file); // must match API key

      const response = await uploadFile(formData); // no Content-Type manually
      // console.log("Upload response:", response);
      toast.success("File uploaded!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Upload failed");
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default FileUpload;
