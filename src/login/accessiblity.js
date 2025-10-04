import React, { useState } from "react";

export default function AccessibilityForm() {
  const [formData, setFormData] = useState({
    wheelchair: false,
    mobilityAid: false,
    visualImpairment: false,
    hearingImpairment: false,
    learningDisabilities: false,
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Convert selected checkboxes into a single string
    const selectedNeeds = Object.keys(formData)
      .filter((key) => formData[key]) // keep only checked ones
      .map((key) => {
        switch (key) {
          case "wheelchair": return "Wheelchair Access";
          case "mobilityAid": return "Mobility Aid";
          case "visualImpairment": return "Visual Impairment";
          case "hearingImpairment": return "Hearing Impairment";
          case "learningDisabilities": return "Learning Disabilities";
          default: return "";
        }
      })
      .join(", ");

    try {
      const res = await fetch("http://localhost/backend/accessbility.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ needs: selectedNeeds }),
      });

      const data = await res.json();
      if (data.status === "success") {
        alert("Accessibility needs saved ✅");
        window.location.href = "/";
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.log("Request failed: " + error.message);
    }
  };

  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">Accessibility Needs Form</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="wheelchair"
            checked={formData.wheelchair}
            onChange={handleChange}
            className="form-checkbox"
          />
          <span>Wheelchair Access</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="mobilityAid"
            checked={formData.mobilityAid}
            onChange={handleChange}
            className="form-checkbox"
          />
          <span>Mobility Aid</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="visualImpairment"
            checked={formData.visualImpairment}
            onChange={handleChange}
            className="form-checkbox"
          />
          <span>Visual Impairment</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="hearingImpairment"
            checked={formData.hearingImpairment}
            onChange={handleChange}
            className="form-checkbox"
          />
          <span>Hearing Impairment</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="learningDisabilities"
            checked={formData.learningDisabilities}
            onChange={handleChange}
            className="form-checkbox"
          />
          <span>Learning Disabilities</span>
        </label>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="submit"
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
