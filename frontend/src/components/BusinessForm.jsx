import { useEffect, useState } from "react";

const emptyBusiness = {
  name: "",
  description: "",
  category_id: "",
  address: "",
  location: "",
  contact_number: "",
  whatsapp_number: "",
  website_url: "",
  image_url: "",
  is_featured: false
};

const textFields = [
  ["description", "Description"],
  ["address", "Address"],
  ["location", "Location"],
  ["contact_number", "Contact number"],
  ["whatsapp_number", "WhatsApp number"],
  ["website_url", "Website URL"],
  ["image_url", "Image URL"]
];

export default function BusinessForm({ business, categories, onSave, onCancel }) {
  const [form, setForm] = useState(emptyBusiness);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(business ? { ...emptyBusiness, ...business } : emptyBusiness);
    setError("");
  }, [business]);

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [
        key,
        typeof value === "string" && value.trim() === "" ? null : value
      ])
    );
    payload.category_id = Number(payload.category_id);

    try {
      await onSave(payload);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not save business.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card card-body mb-4" onSubmit={handleSubmit}>
      <h2 className="h5">{business ? "Edit business" : "Add business"}</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="business-name">Name</label>
          <input
            id="business-name"
            className="form-control"
            name="name"
            value={form.name || ""}
            onChange={updateField}
            maxLength="200"
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label" htmlFor="business-category">Category</label>
          <select
            id="business-category"
            className="form-select"
            name="category_id"
            value={form.category_id || ""}
            onChange={updateField}
            required
          >
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        {textFields.map(([name, label]) => (
          <div className="col-md-6" key={name}>
            <label className="form-label" htmlFor={`business-${name}`}>{label}</label>
            {name === "description" ? (
              <textarea
                id={`business-${name}`}
                className="form-control"
                name={name}
                value={form[name] || ""}
                onChange={updateField}
                rows="3"
              />
            ) : (
              <input
                id={`business-${name}`}
                className="form-control"
                name={name}
                value={form[name] || ""}
                onChange={updateField}
              />
            )}
          </div>
        ))}

        <div className="col-12">
          <div className="form-check">
            <input
              id="business-featured"
              className="form-check-input"
              type="checkbox"
              name="is_featured"
              checked={Boolean(form.is_featured)}
              onChange={updateField}
            />
            <label className="form-check-label" htmlFor="business-featured">
              Featured
            </label>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button className="btn btn-outline-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
