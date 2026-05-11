import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";
import api from "../services/api";
import styles from "./ProductManagementPage.module.css";

function normalizeProducts(data) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map((item) => ({
    id: item.id,
    name: item.name || "",
    description: item.description || "",
    price: item.price ?? 0,
    supplierId: item.supplierId,
    supplierName: item.supplierName || "-",
  }));
}

export default function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    supplierId: "",
  });

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/owner/products");
      setProducts(normalizeProducts(response.data));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      supplierId: "",
    });
    setEditingId(null);
    setFormError("");
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    if (!form.name || form.price === "") {
      setFormError("Name and price are required.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || "",
      price: Number(form.price),
      supplierId: form.supplierId ? Number(form.supplierId) : null,
    };

    try {
      if (editingId) {
        await api.put(`/api/owner/products/${editingId}`, payload);
      } else {
        await api.post("/api/owner/products", payload);
      }
      resetForm();
      await loadProducts();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (targetProduct) => {
    setEditingId(targetProduct.id);
    setForm({
      name: targetProduct.name || "",
      description: targetProduct.description || "",
      price: targetProduct.price ?? "",
      supplierId: targetProduct.supplierId || "",
    });
    setFormError("");
  };

  const handleDelete = async (targetProduct) => {
    const confirmed = window.confirm(`Delete product ${targetProduct.name}?`);
    if (!confirmed) return;

    setDeletingId(targetProduct.id);
    setError("");

    try {
      await api.delete(`/api/owner/products/${targetProduct.id}`);
      await loadProducts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className={styles.page}>
      <PageHeader
        title="Product Management"
        subtitle="Create and manage products in your warehouse."
      />

      <ProductForm
        form={form}
        onChange={handleFieldChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        isEditing={Boolean(editingId)}
        isSubmitting={saving}
        error={formError}
      />

      {error ? <p className={styles.error}>{error}</p> : null}

      <ProductTable
        products={products}
        loading={loading}
        deletingId={deletingId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </section>
  );
}

