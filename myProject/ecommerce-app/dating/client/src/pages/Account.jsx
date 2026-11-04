import React, { useState } from "react";
import { API } from "../api";

export default function Account({ user, setUser }) {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [age, setAge] = useState(user?.age || 21);
  const [gender, setGender] = useState(user?.gender || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || "");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("age", age);
    formData.append("gender", gender);
    if (avatarFile) formData.append("avatarFile", avatarFile);

    try {
      const res = await API.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data);
      alert("Profile and DP updated successfully!");
    } catch {
      alert("Failed to update profile");
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-6">
        <div className="glass-card p-4">
          <div className="text-center mb-3">
            <img
              src={preview}
              width="100"
              height="100"
              className="rounded-circle border border-3 border-warning object-fit-cover shadow"
              alt="DP"
            />
            <h5 className="fw-bold mt-2">{user?.name}</h5>
            <p className="text-secondary small">@{user?.username}</p>
          </div>

          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="small text-secondary fw-semibold">
                Change Display Picture (DP)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-control"
              />
            </div>

            <div className="mb-2">
              <label className="small text-secondary fw-semibold">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                required
              />
            </div>

            <div className="row g-2 mb-2">
              <div className="col">
                <label className="small text-secondary fw-semibold">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="col">
                <label className="small text-secondary fw-semibold">
                  Gender
                </label>
                <input
                  type="text"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="small text-secondary fw-semibold">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="form-control"
                rows="3"
              />
            </div>

            <button className="btn btn-warning w-100 fw-bold">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
