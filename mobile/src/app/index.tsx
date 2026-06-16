import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { choixCulteStyles } from "../styles/choixCulte.Styles";
import DashboardScreen from "../screens/DashboardScreen";
import LoginScreen from "../screens/LoginScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";



export default function ChoixCulte() {
  const [connecte, setConnecte] = useState(false);
  const [culteChoisi, setCulteChoisi] = useState<string | null>(null);
  useEffect(() => {verifierConnexion();}, []);
  async function verifierConnexion() {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      setConnecte(true);
    }
  }




  if (!connecte) {
    return <LoginScreen onLoginSuccess={() => setConnecte(true)} />;
  }

  if (culteChoisi) {
    return (
      <View style={{ flex: 1 }}>
        <DashboardScreen nomCulte={culteChoisi} />

        <Pressable onPress={() => setCulteChoisi(null)}>
          <Text style={{ textAlign: "center", marginBottom: 30 }}>
            Retour
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={choixCulteStyles.container}>
      <Text style={choixCulteStyles.title}>MI Control</Text>

      <Text style={choixCulteStyles.subtitle}>
        Choisissez votre espace de culte
      </Text>

      <Pressable
        style={choixCulteStyles.button}
        onPress={() => setCulteChoisi("Culte du dimanche")}
      >
        <Text style={choixCulteStyles.buttonText}>Culte du dimanche</Text>
      </Pressable>

      <Pressable
        style={choixCulteStyles.button}
        onPress={() => setCulteChoisi("Culte du jeudi")}
      >
        <Text style={choixCulteStyles.buttonText}>Culte du jeudi</Text>
      </Pressable>
    </View>
  );
}