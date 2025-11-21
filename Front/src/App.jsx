// src/App.jsx
import React, { useEffect, useState } from "react";
import "./css/App.css";
import DailyPnlModal from "./components/DailyPnlModal";
import axios from "axios";

const API_URL = "http://localhost:3333/api/dailypnls/crud";
const DB_SERVER = "mongodb";
const LOGGED_USER = "Luis";

export default function App() {
  const [rows, setRows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [form, setForm] = useState({
    account: "",
    date: "",
    realized: "",
    unrealized: "",
    active: true,
  });

  // ================== CARGAR DATOS (GETALL) ==================
  const loadData = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        API_URL,
        {},
        {
          params: {
            ProcessType: "GetAll",
            DBServer: DB_SERVER,
            LoggedUser: LOGGED_USER,
          },
        }
      );

   //BIT
      const list = res?.data?.data?.[0]?.dataRes || [];

      const mapped = list.map((doc) => ({
        account: doc.account,
        date: doc.date ? String(doc.date).slice(0, 10) : "",
        realized: doc.realized ?? 0,
        unrealized: doc.unrealized ?? 0,
        active: doc.active === false ? false : true,
      }));

      setRows(mapped);
      setFiltered(mapped);
      setSelected(null);
    } catch (err) {
      console.error("Error GetAll:", err?.response?.data || err.message);
      alert("Error cargando datos desde el backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ================== BÚSQUEDA ==================
  useEffect(() => {
    const term = (search || "").toLowerCase();
    const f = rows.filter(
      (r) =>
        String(r.account).toLowerCase().includes(term) ||
        String(r.date).toLowerCase().includes(term)
    );
    setFiltered(f);
  }, [search, rows]);

  // ================== MODAL: CREAR / EDITAR ==================
  const openCreate = () => {
    setMode("create");
    setForm({
      account: "",
      date: "",
      realized: "",
      unrealized: "",
      active: true,
    });
    setModalOpen(true);
  };

  const openEdit = () => {
    if (!selected) {
      alert("Selecciona una fila primero.");
      return;
    }
    setMode("edit");
    setForm({ ...selected });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        account: form.account,
        date: form.date,
        realized: Number(form.realized || 0),
        unrealized: Number(form.unrealized || 0),
        active: form.active !== false,
      };

      const ProcessType = mode === "create" ? "Create" : "Update";

      await axios.post(
        API_URL,
        { data: payload },
        {
          params: {
            ProcessType,
            DBServer: DB_SERVER,
            LoggedUser: LOGGED_USER,
          },
        }
      );

      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Error al guardar:", err?.response?.data || err.message);
      alert("No se pudo guardar el registro.");
    }
  };

  // ================== DELETE FÍSICO ==================
  const deleteHard = async () => {
    if (!selected) {
      alert("Selecciona una fila primero.");
      return;
    }
    if (!window.confirm("¿Eliminar definitivamente este registro?")) return;

    try {
      const payload = {
        account: selected.account,
        date: selected.date,
      };

      await axios.post(
        API_URL,
        { data: payload },
        {
          params: {
            ProcessType: "DeleteHard",
            DBServer: DB_SERVER,
            LoggedUser: LOGGED_USER,
          },
        }
      );

      setSelected(null);
      await loadData();
    } catch (err) {
      console.error("Error DeleteHard:", err?.response?.data || err.message);
      alert("No se pudo eliminar el registro.");
    }
  };

  // ================== DELETE LÓGICO (ACTIVO / INACTIVO) ==================
  const toggleActive = async (value) => {
    if (!selected) {
      alert("Selecciona una fila primero.");
      return;
    }

    try {
      const payload = {
        account: selected.account,
        date: selected.date,
        active: !!value,
      };

      // Este ProcessType UpdateActive

      await axios.post(
        API_URL,
        { data: payload },
        {
          params: {
            ProcessType: "UpdateActive",
            DBServer: DB_SERVER,
            LoggedUser: LOGGED_USER,
          },
        }
      );

      await loadData();
    } catch (err) {
      console.error("Error cambio activo:", err?.response?.data || err.message);
      alert("No se pudo cambiar el estado Activo/Inactivo.");
    }
  };

  // ================== diseñooooo ==================
  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>DailyPnls - Control PnL Diario</h1>
         
        </div>
        </header>

      <main className="app-main">
        <section className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-header-row">
            <div className="card-header">
              <h2>DailyPnls</h2>
              
            </div>

            <div className="toolbar">
              <button className="btn primary" onClick={openCreate}>
                + Crear
              </button>
              <button className="btn secondary" onClick={openEdit}>
                ✏ Editar
              </button>
              <button className="btn danger" onClick={deleteHard}>
                🗑 Eliminar
              </button>
              <button
                className="btn secondary"
                onClick={() => toggleActive(false)}
              >
                ✖ Desactivar
              </button>
              <button
                className="btn secondary"
                onClick={() => toggleActive(true)}
              >
                ✔ Activar
              </button>
            </div>
          </div>

          <div className="toolbar toolbar-search">
            <input
              placeholder="Buscar por cuenta o fecha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th>Fecha</th>
                  <th>Realizado</th>
                  <th>No Realizado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      Cargando...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      Sin registros.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, idx) => {
                    const isSelected =
                      selected &&
                      selected.account === row.account &&
                      selected.date === row.date;
                    return (
                      <tr
                        key={`${row.account}-${row.date}-${idx}`}
                        onClick={() => setSelected(row)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: isSelected
                            ? "rgba(79, 70, 229, 0.25)"
                            : "transparent",
                        }}
                      >
                        <td>{row.account}</td>
                        <td>{row.date}</td>
                        <td>{row.realized}</td>
                        <td>{row.unrealized}</td>
                        <td>{row.active ? "Activo" : "Inactivo"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <DailyPnlModal
        open={modalOpen}
        mode={mode}
        form={form}
        setForm={setForm}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
