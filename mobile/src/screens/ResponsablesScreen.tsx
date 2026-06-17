    import { useEffect, useState } from "react";
    import { Pressable, ScrollView, Text, View } from "react-native";
    import { getResponsables } from "../services/responsables.service";
    import { styles } from "../styles/responsables.styles";

    export default function ResponsablesScreen() {
    const [responsables, setResponsables] = useState<any[]>([]);

    useEffect(() => {
        chargerResponsables();
    }, []);

    async function chargerResponsables() {
        const data = await getResponsables();
        setResponsables(data);
    }

    return (
        <ScrollView style={styles.container}>
        <Text style={styles.title}>Responsables</Text>

        {responsables.map((responsable) => (
            <View key={responsable.id} style={styles.card}>
            <Text style={styles.name}>{responsable.username}</Text>
            <Text>Email : {responsable.email}</Text>
            <Text>Rôle : {responsable.role}</Text>
            <Text>Actif : {responsable.actif ? "Oui" : "Non"}</Text>
            </View>
        ))}
        </ScrollView>
    );
    
    }