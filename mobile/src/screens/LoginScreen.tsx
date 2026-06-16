    import { useState } from "react";
    import { View, Text, TextInput, Pressable, Alert } from "react-native";
    import { api } from "../services/api";
    import { styles } from "../styles/login.styles";
    import AsyncStorage from "@react-native-async-storage/async-storage";



    type Props = {
        onLoginSuccess: () => void;
    };

    export default function LoginScreen({ onLoginSuccess }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    async function seConnecter() {
        try {
        const response = await api.post("/login/", {
            username,
            password,
        });
        await AsyncStorage.setItem("token", response.data.access);
        await AsyncStorage.setItem("refreshToken", response.data.refresh);
        console.log("Connexion réussie :", response.data);
        onLoginSuccess();
        } catch (error: any) {
        console.log(error.response?.data || error.message);
        Alert.alert("Erreur", "Nom d'utilisateur ou mot de passe incorrect.");
        }
    }

    return (
        <View style={styles.container}>
        <Text style={styles.title}>MI Control</Text>

        <TextInput
            placeholder="Nom d'utilisateur"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
        />

        <TextInput
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
        />

        <Pressable onPress={seConnecter} style={styles.button}>
            <Text style={styles.buttonText}>Se connecter</Text>
        </Pressable>
        </View>
    );
    }