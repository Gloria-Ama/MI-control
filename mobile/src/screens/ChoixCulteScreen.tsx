    import { View, Text, Pressable, StyleSheet } from "react-native";

    type Props = {
    onCulteChoisi: (culte: string) => void;
    onDeconnexion: () => void;
    };

    export default function ChoixCulteScreen({ onCulteChoisi, onDeconnexion }: Props) {
    return (
        <View style={styles.container}>
        <Text style={styles.titre}>MI Control</Text>
        <Text style={styles.sousTitre}>Choisissez votre espace de culte</Text>

        <Pressable style={styles.btn} onPress={() => onCulteChoisi("Culte du dimanche")}>
            <Text style={styles.btnTexte}>🙏 Culte du dimanche</Text>
        </Pressable>

        <Pressable style={styles.btn} onPress={() => onCulteChoisi("Culte du jeudi")}>
            <Text style={styles.btnTexte}>✨ Culte du jeudi</Text>
        </Pressable>

        <Pressable style={styles.btnDeconnexion} onPress={onDeconnexion}>
            <Text style={styles.btnDeconnexionTexte}>Se déconnecter</Text>
        </Pressable>
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 28,
        justifyContent: "center",
        backgroundColor: "#F8F5F0",
    },
    titre: {
        fontSize: 38,
        fontWeight: "800",
        textAlign: "center",
        color: "#07074C",
        marginBottom: 8,
    },
    sousTitre: {
        fontSize: 16,
        textAlign: "center",
        color: "#64748B",
        marginBottom: 40,
    },
    btn: {
        backgroundColor: "#07074C",
        padding: 22,
        borderRadius: 18,
        marginBottom: 16,
    },
    btnTexte: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
    },
    btnDeconnexion: {
        marginTop: 20,
        padding: 14,
        alignItems: "center",
    },
    btnDeconnexionTexte: {
        color: "#94A3B8",
        fontSize: 15,
    },
    });