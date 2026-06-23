import { useState } from "react";
    import { View, Text, TextInput, Pressable, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from "react-native";
    import { api } from "../services/api";
    import { styles } from "../styles/login.styles";
    import AsyncStorage from "@react-native-async-storage/async-storage";

    type Props = {
    onLoginSuccess: () => void;
    };

    export default function LoginScreen({ onLoginSuccess }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [chargement, setChargement] = useState(false);

    async function seConnecter() {
        if (!username.trim() || !password.trim()) {
        Alert.alert("Champs requis", "Veuillez remplir tous les champs.");
        return;
        }

        setChargement(true);
        try {
        const response = await api.post("/login/", {
            username: username.trim(),
            password,
        });

        await AsyncStorage.setItem("accessToken", response.data.access);
        await AsyncStorage.setItem("refreshToken", response.data.refresh);

        onLoginSuccess();
        } catch (error: any) {
        const message = error.response?.status === 401
            ? "Nom d'utilisateur ou mot de passe incorrect."
            : "Impossible de se connecter. Vérifiez votre connexion réseau.";
        Alert.alert("Erreur de connexion", message);
        } finally {
        setChargement(false);
        }
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={styles.container}>
        <Text style={styles.title}>MI Control</Text>
        <Text style={styles.subtitle}>Espace responsables</Text>

        <TextInput
            placeholder="Nom d'utilisateur"
            placeholderTextColor="#94A3B8"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!chargement}
        />

        <TextInput
            placeholder="Mot de passe"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            editable={!chargement}
            onSubmitEditing={seConnecter}
            returnKeyType="done"
        />

        <Pressable
            onPress={seConnecter}
            style={[styles.button, chargement && styles.buttonDisabled]}
            disabled={chargement}
        >
            {chargement ? (
            <ActivityIndicator color="#FFFFFF" />
            ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
            )}
        </Pressable>
        </View>
        </KeyboardAvoidingView>
    );
    }