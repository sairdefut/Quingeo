import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function MainLayout() {
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
        <Outlet />
      </main>
    </div>
  );
}
