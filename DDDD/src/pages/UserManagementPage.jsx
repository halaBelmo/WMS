import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import UserForm from "../components/UserForm";
import UserTable from "../components/UserTable";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import styles from "./UserManagementPage.module.css";

function normalizeUsers(data) {
  const list = Array.isArray(data) ? data : data?.users || data?.data || [];
  return list.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    role: item.role,
    warehouseId: item.warehouseId ?? item.warehouse?.id ?? null,
    warehouseName: item.warehouseName ?? item.warehouse?.name ?? null,
  }));
}

function normalizeWarehouses(data) {
  const list = Array.isArray(data) ? data : data?.warehouses || data?.data || [];
  return list.map((item) => ({
    id: String(item.id ?? item.warehouseId),
    name: item.name ?? item.warehouseName,
  }));
}

function getRolesFor(currentRole) {
  if (currentRole === "OWNER") {
    return ["ADMIN", "MAGASINIER"];
  }

  if (currentRole === "ADMIN") {
    return ["MAGASINIER"];
  }

  return [];
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const currentRole = user?.role;

  const roles = useMemo(() => getRolesFor(currentRole), [currentRole]);
  const ownerMode = currentRole === "OWNER";

  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingSnapshot, setEditingSnapshot] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: roles[0] || "",
    warehouseId: "",
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, role: roles[0] || "" }));
  }, [roles]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    setError("");
    try {
      const response = await api.get("/api/owner/users");
      setUsers(normalizeUsers(response.data));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadWarehouses = async () => {
    if (!ownerMode) {
      setWarehouses([]);
      return;
    }

    setLoadingWarehouses(true);
    try {
      const response = await api.get("/api/owner/warehouses");
      const normalized = normalizeWarehouses(response.data);
      setWarehouses(normalized);

      setForm((prev) => ({
        ...prev,
        warehouseId: prev.warehouseId || normalized[0]?.id || "",
      }));
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || "Could not load warehouses.");
    } finally {
      setLoadingWarehouses(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadWarehouses();
  }, [ownerMode]);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: roles[0] || "",
      warehouseId: ownerMode ? warehouses[0]?.id || "" : "",
    });
    setEditingId(null);
    setEditingSnapshot(null);
    setFormError("");
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    const payload = {
      name: form.name,
      email: form.email,
    };

    if (form.password) {
      payload.password = form.password;
    }

    if (!editingId) {
      payload.roleName = form.role;
    } else if (editingSnapshot && form.role !== editingSnapshot.role) {
      payload.roleName = form.role;
    }

    if (!editingId && !form.password) {
      setFormError("Password is required when creating a user.");
      setSaving(false);
      return;
    }

    if (ownerMode) {
      if (!form.warehouseId) {
        setFormError("Please select a warehouse.");
        setSaving(false);
        return;
      }

      if (!editingId) {
        payload.warehouseId = Number(form.warehouseId);
      } else if (editingSnapshot && form.warehouseId !== editingSnapshot.warehouseId) {
        payload.warehouseId = Number(form.warehouseId);
      }
    }

    try {
      if (editingId) {
        await api.put(`/api/owner/users/${editingId}`, payload);
      } else {
        await api.post("/api/owner/users", payload);
      }

      resetForm();
      await loadUsers();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || "Could not save user.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (targetUser) => {
    const targetWarehouseId = String(targetUser.warehouseId || "");

    setEditingId(targetUser.id);
    setEditingSnapshot({
      role: targetUser.role || "",
      warehouseId: targetWarehouseId,
    });
    setForm({
      name: targetUser.name || "",
      email: targetUser.email || "",
      password: "",
      role: targetUser.role || roles[0] || "",
      warehouseId: targetWarehouseId,
    });
    setFormError("");
  };

  const handleDelete = async (targetUser) => {
    const confirmed = window.confirm(`Delete user ${targetUser.name}?`);
    if (!confirmed) return;

    setDeletingId(targetUser.id);
    setError("");

    try {
      await api.delete(`/api/owner/users/${targetUser.id}`);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className={styles.page}>
      <PageHeader
        title="User Management"
        subtitle="Create and manage users based on your role permissions."
      />

      <UserForm
        form={form}
        roles={roles}
        warehouses={warehouses}
        showWarehouseSelect={ownerMode}
        onChange={handleFieldChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        isEditing={Boolean(editingId)}
        isSubmitting={saving || loadingWarehouses}
        error={formError}
        currentWarehouseName={user?.warehouseName}
      />

      {error ? <p className={styles.error}>{error}</p> : null}

      <UserTable
        users={users}
        loading={loadingUsers}
        deletingId={deletingId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </section>
  );
}
