import { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "../screens/LoginScreen";
import ChoixCulteScreen from "../screens/ChoixCulteScreen";
import DashboardScreen from "../screens/DashboardScreen";

export default function Index() {
  const [etat, setEtat] = useState<"chargement" | "deconnecte" | "choix" | "dashboard">("chargement");
  const [culteChoisi, setCulteChoisi] = useState<string | null>(null);

  useEffect(() => {
    verifierConnexion();
  }, []);

  async function verifierConnexion() {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        setEtat("choix");
      } else {
        setEtat("deconnecte");
      }
    } catch {
      setEtat("deconnecte");
    }
  }

  async function seDeconnecter() {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    setCulteChoisi(null);
    setEtat("deconnecte");
  }

  // ── Chargement initial ─────────────────────────────────────────────────────
  if (etat === "chargement") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#07074C" }}>
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  // ── Pas connecté ───────────────────────────────────────────────────────────
  if (etat === "deconnecte") {
    return (
      <LoginScreen onLoginSuccess={() => setEtat("choix")} />
    );
  }

  // ── Choix du culte ─────────────────────────────────────────────────────────
  if (etat === "choix" || !culteChoisi) {
    return (
      <ChoixCulteScreen
        onCulteChoisi={(culte) => {
          setCulteChoisi(culte);
          setEtat("dashboard");
        }}
        onDeconnexion={seDeconnecter}
      />
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <DashboardScreen
      nomCulte={culteChoisi}
      onRetour={() => setEtat("choix")}
      onDeconnexion={seDeconnecter}
    />
  );
}