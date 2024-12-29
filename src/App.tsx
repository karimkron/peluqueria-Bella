import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Scissors } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "./contexts/AuthContext";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { PublicHome } from "./components/PublicHome";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />
      <Route
        path="/admin"
        element={user ? <AdminDashboard /> : <AdminLogin />}
      />
    </Routes>
  );
}

export default App;
