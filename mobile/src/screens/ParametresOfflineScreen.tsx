    import { useEffect, useState } from "react";
    import {
    View, Text, Pressable, ScrollView,
    Alert, ActivityIndicator, SafeAreaView, StyleSheet,
    } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import { useNetwork } from "../hooks/useNetwork";
    import { infosCache, viderCache } from "../services/offline.service";
    import { getMembres } from "../services/membres.service";
    import { api } from "../services/api";

    export default function ParametresOfflineScreen() {
    const { estConnecte, type } = useNetwork();
    const [infos, setInfos] = useState<{ nbElements: number; ageMoyen: string } | null>(null);
    const [telechargement, setTelechargement] = useState(false);
    const [suppression, setSuppression] = useState(false);

    useEffect(() => { chargerInfos(); }, []);

    async function chargerInfos() {
        const i = await infosCache();
        setInfos(i);
    }

    async function telechargerDonnees() {
        if (!estConnecte) {
        Alert.alert("Hors ligne", "Vous devez être connecté pour télécharger les données.");
        return;
        }

        setTelechargement(true);
        try {
        // Télécharger et mettre en cache toutes les données importantes
        await Promise.all([
            getMembres(),
            api.get("/communautes/").then(r => r.data),
            api.get("/departements/").then(r => r.data),
            api.get("/visiteurs/").then(r => r.data),
            api.get("/notifications/").then(r => r.data),
        ]);

        await chargerInfos();
        Alert.alert("✅ Données téléchargées", "Toutes les données sont maintenant disponibles hors ligne.");
        } catch {
        Alert.alert("Erreur", "Impossible de télécharger certaines données.");
        } finally {
        setTelechargement(false);
        }
    }

    async function supprimerCache() {
        Alert.alert(
        "Vider le cache ?",
        "Toutes les données hors ligne seront supprimées. Vous aurez besoin d'une connexion internet.",
        [
            { text: "Annuler", style: "cancel" },
            {
            text: "Vider", style: "destructive",
            onPress: async () => {
                setSuppression(true);
                await viderCache();
                await chargerInfos();
                setSuppression(false);
                Alert.alert("Cache vidé", "Les données hors ligne ont été supprimées.");
            },
            },
        ]
        );
    }

    return (
        <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

            {/* Statut connexion */}
            <View style={[s.statutCard, { backgroundColor: estConnecte ? "#F0FDF4" : "#FEF2F2" }]}>
            <View style={[s.statutIcone, { backgroundColor: estConnecte ? "#065F46" : "#EF4444" }]}>
                <Ionicons
                name={estConnecte ? "wifi-outline" : "cloud-offline-outline"}
                size={22} color="#fff"
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[s.statutTitre, { color: estConnecte ? "#065F46" : "#991B1B" }]}>
                {estConnecte ? "Connecté à internet" : "Hors ligne"}
                </Text>
                <Text style={s.statutSub}>
                {estConnecte ? `Réseau : ${type}` : "Les données sont servies depuis le cache local"}
                </Text>
            </View>
            <View style={[s.dot, { backgroundColor: estConnecte ? "#065F46" : "#EF4444" }]} />
            </View>

            {/* Infos cache */}
            <View style={s.section}>
            <Text style={s.sectionTitre}>Cache local</Text>

            <View style={s.infoRow}>
                <Ionicons name="server-outline" size={18} color="#64748B" />
                <Text style={s.infoLabel}>Données en cache</Text>
                <Text style={s.infoValeur}>
                {infos ? `${infos.nbElements} élément(s)` : "—"}
                </Text>
            </View>

            <View style={s.infoRow}>
                <Ionicons name="time-outline" size={18} color="#64748B" />
                <Text style={s.infoLabel}>Âge moyen</Text>
                <Text style={s.infoValeur}>{infos?.ageMoyen ?? "—"}</Text>
            </View>

            <View style={s.infoRow}>
                <Ionicons name="calendar-outline" size={18} color="#64748B" />
                <Text style={s.infoLabel}>Validité du cache</Text>
                <Text style={s.infoValeur}>24 heures</Text>
            </View>
            </View>

            {/* Télécharger */}
            <View style={s.section}>
            <Text style={s.sectionTitre}>Préparer le mode hors ligne</Text>
            <Text style={s.sectionSub}>
                Téléchargez toutes les données maintenant pour y accéder sans internet lors du culte.
            </Text>

            <Pressable
                style={[s.btnPrimaire, (!estConnecte || telechargement) && { opacity: 0.5 }]}
                onPress={telechargerDonnees}
                disabled={!estConnecte || telechargement}
            >
                {telechargement ? (
                <ActivityIndicator color="#fff" />
                ) : (
                <>
                    <Ionicons name="download-outline" size={20} color="#fff" />
                    <Text style={s.btnPrimaireTexte}>Télécharger les données</Text>
                </>
                )}
            </Pressable>

            {!estConnecte && (
                <Text style={s.avertissement}>
                Connexion requise pour télécharger les données.
                </Text>
            )}
            </View>

            {/* Ce qui fonctionne hors ligne */}
            <View style={s.section}>
            <Text style={s.sectionTitre}>Disponible hors ligne</Text>
            {[
                { icone: "people-outline" as const,           label: "Liste des membres" },
                { icone: "person-add-outline" as const,        label: "Liste des visiteurs" },
                { icone: "business-outline" as const,          label: "Départements" },
                { icone: "notifications-outline" as const,     label: "Notifications (lecture)" },
            ].map(item => (
                <View key={item.label} style={s.disponibleRow}>
                <Ionicons name={item.icone} size={16} color="#065F46" />
                <Text style={s.disponibleTexte}>{item.label}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#065F46" />
                </View>
            ))}

            <Text style={[s.sectionTitre, { marginTop: 12 }]}>Non disponible hors ligne</Text>
            {[
                { icone: "checkmark-circle-outline" as const, label: "Pointer les présences" },
                { icone: "chatbubbles-outline" as const,       label: "Envoyer des messages" },
                { icone: "calendar-outline" as const,          label: "Créer des événements" },
                { icone: "cash-outline" as const,              label: "Demandes financières" },
            ].map(item => (
                <View key={item.label} style={s.disponibleRow}>
                <Ionicons name={item.icone} size={16} color="#EF4444" />
                <Text style={[s.disponibleTexte, { color: "#94A3B8" }]}>{item.label}</Text>
                <Ionicons name="close-circle" size={16} color="#EF4444" />
                </View>
            ))}
            </View>

            {/* Vider cache */}
            <Pressable
            style={[s.btnDanger, suppression && { opacity: 0.5 }]}
            onPress={supprimerCache}
            disabled={suppression}
            >
            {suppression ? (
                <ActivityIndicator color="#EF4444" />
            ) : (
                <>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={s.btnDangerTexte}>Vider le cache local</Text>
                </>
            )}
            </Pressable>

        </ScrollView>
        </SafeAreaView>
    );
    }

    const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F8F5F0" },

    statutCard: {
        borderRadius: 14, padding: 14,
        flexDirection: "row", alignItems: "center", gap: 12,
        marginBottom: 14, borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    statutIcone: {
        width: 44, height: 44, borderRadius: 12,
        alignItems: "center", justifyContent: "center",
    },
    statutTitre: { fontSize: 15, fontWeight: "700" },
    statutSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
    dot: { width: 10, height: 10, borderRadius: 5 },

    section: {
        backgroundColor: "#fff", borderRadius: 14, padding: 14,
        marginBottom: 14, borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    sectionTitre: { fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 8 },
    sectionSub: { fontSize: 13, color: "#64748B", marginBottom: 12, lineHeight: 18 },

    infoRow: {
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#F8FAFC",
    },
    infoLabel: { flex: 1, fontSize: 13, color: "#64748B" },
    infoValeur: { fontSize: 13, fontWeight: "600", color: "#1E293B" },

    disponibleRow: {
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingVertical: 8,
    },
    disponibleTexte: { flex: 1, fontSize: 13, color: "#1E293B" },

    btnPrimaire: {
        backgroundColor: "#07074C", borderRadius: 12,
        padding: 14, flexDirection: "row",
        alignItems: "center", justifyContent: "center", gap: 8,
    },
    btnPrimaireTexte: { color: "#fff", fontWeight: "700", fontSize: 15 },

    avertissement: {
        fontSize: 12, color: "#EF4444",
        textAlign: "center", marginTop: 8,
    },

    btnDanger: {
        backgroundColor: "#FEF2F2", borderRadius: 12,
        padding: 14, flexDirection: "row",
        alignItems: "center", justifyContent: "center", gap: 8,
        borderWidth: 0.5, borderColor: "#FECACA",
    },
    btnDangerTexte: { color: "#EF4444", fontWeight: "700", fontSize: 15 },
    });