import { useEffect, useState } from "react";
import api from "../api";
import BusinessForm from "../components/BusinessForm";

export default function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [businessResponse, categoryResponse] = await Promise.all([
        api.get("/businesses"),
        api.get("/categories")
      ]);
      setBusinesses(businessResponse.data);
      setCategories(categoryResponse.data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveBusiness(payload) {
    let response;

    if (editing) {
      response = await api.put(`/businesses/${editing.id}`, payload);
      setSuccess("Business updated.");
    } else {
      response = await api.post("/businesses", payload);
      setSuccess("Business added.");
    }

    const savedBusiness = response.data;
    const category = categories.find(
      (item) => Number(item.id) === Number(savedBusiness.category_id)
    );
    const businessWithCategory = {
      ...savedBusiness,
      category_name: category?.name || "-"
    };

    setBusinesses((current) =>
      editing
        ? current.map((item) =>
            item.id === savedBusiness.id ? businessWithCategory : item
          )
        : [businessWithCategory, ...current]
    );
    setShowForm(false);
    setEditing(null);
  }

  async function deleteBusiness(business) {
    if (!window.confirm(`Delete "${business.name}"?`)) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/businesses/${business.id}`);
      setBusinesses((current) => current.filter((item) => item.id !== business.id));
      setSuccess("Business deleted.");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not delete business.");
    }
  }

  async function toggleFeatured(business) {
    setError("");
    setSuccess("");

    try {
      const response = await api.patch(`/businesses/${business.id}/featured`, {
        is_featured: !business.is_featured
      });
      setBusinesses((current) =>
        current.map((item) =>
          item.id === business.id
            ? { ...item, is_featured: response.data.is_featured }
            : item
        )
      );
      setSuccess("Featured status updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not update featured status.");
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Businesses</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
            setSuccess("");
          }}
        >
          Add business
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <BusinessForm
          business={editing}
          categories={categories}
          onSave={saveBusiness}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {loading ? (
        <p>Loading businesses...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Featured</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((business) => (
                <tr key={business.id}>
                  <td>{business.name}</td>
                  <td>{business.category_name || "-"}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${business.is_featured ? "btn-success" : "btn-outline-secondary"}`}
                      onClick={() => toggleFeatured(business)}
                      aria-label={`Toggle featured for ${business.name}`}
                    >
                      {business.is_featured ? "Yes" : "No"}
                    </button>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          setEditing(business);
                          setShowForm(true);
                          setSuccess("");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteBusiness(business)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!businesses.length && (
                <tr><td colSpan="4">No businesses found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
