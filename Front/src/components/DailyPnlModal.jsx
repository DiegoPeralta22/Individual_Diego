// src/components/DailyPnlModal.jsx
import React from "react";
import "../css/Modal.css"; // ajusta la ruta si tu Modal.css está en otra carpeta

export default function DailyPnlModal(props) {
  //acepta varios prop 
  const isModalOpen =
    props.isOpen ?? props.isModalOpen ?? props.open ?? props.visible ?? false;

    //crea modelo 
  const mode = props.mode ?? props.modalMode ?? "edit";
//formulario
  const form =
    props.form ?? props.formData ?? props.data ?? {
      account: "",
      date: "",
      realized: "",
      unrealized: "",
    };
//escribir y cambio
  const setForm = props.setForm ?? props.setFormData ?? (() => {});
  const onClose = props.onClose ?? props.onCancel ?? (() => {});
  const onSave = props.onSave ?? props.onSubmit ?? (() => {});

  if (!isModalOpen) return null;
//funcion para manejar cambiaos
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="dp-backdrop">
      <div className="dp-modal">
        {/* HEADER */}
        <div className="dp-modal-header">
          <h2 className="dp-modal-title">
            {mode === "create" ? "Crear DailyPnl" : "Editar DailyPnl"}
          </h2>
          <button
            type="button"
            className="dp-close-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="dp-modal-body">
          <div className="dp-field">
            <label>Cuenta</label>
            <input
              className="dp-input"
              type="text"
              placeholder="Cuenta..."
              value={form.account ?? ""}
              onChange={handleChange("account")}
            />
          </div>

          <div className="dp-field">
            <label>Fecha (YYYY-MM-DD)</label>
            <input
              className="dp-input-date"
              type="date"
              value={form.date ?? ""}
              onChange={handleChange("date")}
            />
          </div>

          <div className="dp-field">
            <label>Realizado</label>
            <input
              className="dp-input"
              type="number"
              value={form.realized ?? ""}
              onChange={handleChange("realized")}
            />
          </div>

          <div className="dp-field">
            <label>No Realizado</label>
            <input
              className="dp-input"
              type="number"
              value={form.unrealized ?? ""}
              onChange={handleChange("unrealized")}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="dp-modal-footer">
          <button
            type="button"
            className="dp-btn-modal dp-btn-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="dp-btn-modal dp-btn-primary"
            onClick={onSave}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
