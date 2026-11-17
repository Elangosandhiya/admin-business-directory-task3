import { useEffect, useState } from "react";
import api from "../api";

function sortCategories(items) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let response;

      if (editingId) {
        response = await api.put(`/categories/${editingId}`, { name });
        setSuccess("Category updated.");
      } else {
        response = await api.post("/categories", { name });
        setSuccess("Category added.");
      }

      setCategories((current) =>
        sortCategories(
          editingId
            ? current.map((category) =>
                category.id === response.data.id ? response.data : category
              )
            : [...current, response.data]
        )
      );
      setName("");
      setEditingId(null);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not save category.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(category) {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/categories/${category.id}`);
      setCategories((current) =>
        current.filter((item) => item.id !== category.id)
      );
      setSuccess("Category deleted.");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not delete category.");
    }
  }

  return (
    <>
      <h1 className="h3 mb-3">Categories</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="card card-body mb-4" onSubmit={handleSubmit}>
        <label className="form-label" htmlFor="category-name">
          {editingId ? "Edit category" : "Add category"}
        </label>
        <div className="d-flex flex-wrap gap-2">
          <input
            id="category-name"
            className="form-control category-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength="150"
            required
          />
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          {editingId && (
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                setEditingId(null);
                setName("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <div className="list-group">
          {categories.map((category) => (
            <div
              className="list-group-item d-flex justify-content-between align-items-center gap-2"
              key={category.id}
            >
              <span>{category.name}</span>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    setEditingId(category.id);
                    setName(category.name);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteCategory(category)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!categories.length && (
            <div className="list-group-item">No categories found.</div>
          )}
        </div>
      )}
    </>
  );
}
