import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";
import api from "../services/api";
import styles from "./ProductManagementPage.module.css";

function normalizeProducts(data) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map((item) => ({
    id: item.id,
    reference: item.reference,
    nom: item.nom,
    description: item.description,
    categorie: item.categorie,
    quantiteDisponible: item.quantiteDisponible,
    zoneId: item.zoneId || item.location?.zoneId,
    rackId: item.rackId || item.location?.rackId,
    shelfId: item.shelfId || item.location?.shelfId,
    locationId: item.locationId || item.location?.id,
    emplacementName: item.location?.name || "-",
    fournisseurName: item.supplier?.name || "-",
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
    reference: "",
    nom: "",
    description: "",
    categorie: "",
    quantiteDisponible: 0,
    zoneId: "",
    rackId: "",
    shelfId: "",
    locationId: "",
    fournisseurId: "",
  });

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/products");
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
      reference: "",
      nom: "",
      description: "",
      categorie: "",
      quantiteDisponible: 0,
      zoneId: "",
      rackId: "",
      shelfId: "",
      locationId: "",
      fournisseurId: "",
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

    if (!form.reference || !form.nom || !form.locationId || !form.fournisseurId) {
      setFormError("Reference, nom, locationId, and fournisseurId are required.");
      setSaving(false);
      return;
    }

    const payload = {
      reference: form.reference,
      nom: form.nom,
      description: form.description,
      categorie: form.categorie,
      quantiteDisponible: Number(form.quantiteDisponible),
      locationId: Number(form.locationId),
      fournisseurId: Number(form.fournisseurId),
      // zoneId, rackId, shelfId optional if backend needs
    };

    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload);
      } else {
        await api.post("/api/products", payload);
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
      reference: targetProduct.reference || "",
      nom: targetProduct.nom || "",
      description: targetProduct.description || "",
      categorie: targetProduct.categorie || "",
      quantiteDisponible: targetProduct.quantiteDisponible || 0,
      zoneId: targetProduct.zoneId || "",
      rackId: targetProduct.rackId || "",
      shelfId: targetProduct.shelfId || "",
      locationId: targetProduct.locationId || "",
      fournisseurId: targetProduct.fournisseurId || "",
    });
    setFormError("");
  };

  const handleDelete = async (targetProduct) => {
    const confirmed = window.confirm(`Delete product ${targetProduct.reference}?`);
    if (!confirmed) return;

    setDeletingId(targetProduct.id);
    setError("");

    try {
      await api.delete(`/api/products/${targetProduct.id}`);
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

