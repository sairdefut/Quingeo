import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { SyncStatusIndicator } from "./SyncStatusIndicator";
import { syncService } from "../../services/syncService";
import { useToast } from "../../contexts/ToastContext";

export default function MainLayout() {
  const { showToast } = useToast();

  useEffect(() => {
    syncService.setToastCallback(showToast);
    syncService.initAutoSync();
  }, [showToast]);

  if (!localStorage.getItem('usuarioLogueado')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          background: "#f4f7f6",
          padding: "2rem",
        }}
      >
        <SyncStatusIndicator />
        <Outlet />
      </main>
    </div>
  );
}
