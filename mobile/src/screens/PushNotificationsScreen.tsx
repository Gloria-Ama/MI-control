    import { useEffect, useState } from "react";
    import {
    View, Text, Pressable, ScrollView, TextInput,
    Alert, ActivityIndicator, SafeAreaView, StyleSheet, Switch,
    } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import {
    enregistrerPushNotifications,
    notificationLocale,
    envoyerPushGroupe,
    viderBadge,
    } from "../services/push.service";

    export default function PushNotificationsScreen() {
    const [tokenActif, setTokenActif] = useState(false);
    const [chargement, setChargement] = useState(false);
    const [envoi, setEnvoi] = useState(false);
    const [titre, setTitre] = useState("");
    const [corps, setCorps] = useState("");

    useEffect(() => {
        verifierToken();
        viderBadge();
    }, []);

    async function verifierToken() {
        // On essaie d'enregistrer — si déjà fait, ça met juste à jour
        try {
        const token = await enregistrerPushNotifications();
        setTokenActif(!!token);
        } catch {
        setTokenActif(false);
        }
    }

    async function activer() {
        setChargement(true);
        try {
        const token = await enregistrerPushNotifications();
        if (token) {
            setTokenActif(true);
            Alert.alert("✅ Activé", "Vous recevrez les notifications push sur cet appareil.");
        } else {
            Alert.alert(
            "Permission refusée",
            "Allez dans les Réglages de l'iPhone → MI Control → Notifications pour les activer."
            );
        }
        } catch {
        Alert.alert("Erreur", "Impossible d'activer les notifications.");
        } finally {
        setChargement(false);
        }
    }

    async function testerNotificationLocale() {
        await notificationLocale(
        "Test — MI Control",
        "Les notifications fonctionnent correctement !",
        2,
        );
        Alert.alert("✅ Test envoyé", "Vous allez recevoir une notification dans 2 secondes.");
    }

    async function envoyerMessage() {
        if (!titre.trim() || !corps.trim()) {
        Alert.alert("Champs requis", "Entrez un titre et un message.");
        return;
        }
        setEnvoi(true);
        try {
        const result = await envoyerPushGroupe(titre.trim(), corps.trim());
        setTitre("");
        setCorps("");
        Alert.alert("✅ Envoyé", result.detail ?? "Notification envoyée.");
        } catch {
        Alert.alert("Erreur", "Impossible d'envoyer la notification.");
        } finally {
        setEnvoi(false);
        }
    }

    return (
        <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

            {/* Statut */}
            <View style={[s.statutCard, { backgroundColor: tokenActif ? "#F0FDF4" : "#FFFBEB" }]}>
            <View style={[s.statutIcone, { backgroundColor: tokenActif ? "#065F46" : "#F59E0B" }]}>
                <Ionicons
                name={tokenActif ? "notifications" : "notifications-off-outline"}
                size={22} color="#fff"
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[s.statutTitre, { color: tokenActif ? "#065F46" : "#633806" }]}>
                {tokenActif ? "Notifications activées" : "Notifications désactivées"}
                </Text>
                <Text style={s.statutSub}>
                {tokenActif
                    ? "Cet appareil recevra les alertes MI Control"
                    : "Activez pour recevoir les alertes"}
                </Text>
            </View>
            </View>

            {/* Activation */}
            {!tokenActif && (
            <Pressable
                style={[s.btnPrimaire, chargement && { opacity: 0.6 }]}
                onPress={activer}
                disabled={chargement}
            >
                {chargement
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Ionicons name="notifications-outline" size={20} color="#fff" />
                    <Text style={s.btnPrimaireTexte}>Activer les notifications</Text>
                    </>
                }
            </Pressable>
            )}

            {/* Ce que vous recevrez */}
            <View style={s.section}>
            <Text style={s.sectionTitre}>Alertes automatiques</Text>
            <Text style={s.sectionSub}>Ces notifications sont envoyées automatiquement par le système :</Text>

            {[
                { icone: "gift-outline" as const,         label: "Anniversaires du jour",         couleur: "#854F0B" },
                { icone: "alert-circle-outline" as const,  label: "Membres absents 3+ semaines",   couleur: "#EF4444" },
                { icone: "chatbubbles-outline" as const,   label: "Nouveau message reçu",           couleur: "#4F46E5" },
                { icone: "cash-outline" as const,          label: "Demande financière en attente",  couleur: "#065F46" },
                { icone: "person-add-outline" as const,    label: "Nouveau visiteur enregistré",    couleur: "#06B6D4" },
            ].map(item => (
                <View key={item.label} style={s.alerteRow}>
                <Ionicons name={item.icone} size={18} color={item.couleur} />
                <Text style={s.alerteTexte}>{item.label}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#065F46" />
                </View>
            ))}
            </View>

            {/* Test */}
            {tokenActif && (
            <View style={s.section}>
                <Text style={s.sectionTitre}>Tester</Text>
                <Text style={s.sectionSub}>Envoyez une notification test sur cet appareil :</Text>
                <Pressable style={s.btnSecondaire} onPress={testerNotificationLocale}>
                <Ionicons name="flask-outline" size={18} color="#07074C" />
                <Text style={s.btnSecondaireTexte}>Envoyer un test</Text>
                </Pressable>
            </View>
            )}

            {/* Envoyer à tous */}
            {tokenActif && (
            <View style={s.section}>
                <Text style={s.sectionTitre}>Envoyer à tous les responsables</Text>
                <Text style={s.sectionSub}>
                Envoyez une notification à tous les responsables qui ont activé les notifications.
                </Text>

                <Text style={s.champLabel}>Titre</Text>
                <TextInput
                style={s.champInput}
                value={titre}
                onChangeText={setTitre}
                placeholder="Ex: Réunion de direction"
                placeholderTextColor="#94A3B8"
                />

                <Text style={s.champLabel}>Message</Text>
                <TextInput
                style={[s.champInput, { minHeight: 80, textAlignVertical: "top" }]}
                value={corps}
                onChangeText={setCorps}
                placeholder="Ex: La réunion de ce soir est déplacée à 20h."
                placeholderTextColor="#94A3B8"
                multiline
                />

                <Pressable
                style={[s.btnPrimaire, envoi && { opacity: 0.6 }]}
                onPress={envoyerMessage}
                disabled={envoi}
                >
                {envoi
                    ? <ActivityIndicator color="#fff" />
                    : <>
                        <Ionicons name="send-outline" size={18} color="#fff" />
                        <Text style={s.btnPrimaireTexte}>Envoyer la notification</Text>
                    </>
                }
                </Pressable>
            </View>
            )}

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

    section: {
        backgroundColor: "#fff", borderRadius: 14, padding: 14,
        marginBottom: 14, borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    sectionTitre: { fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 6 },
    sectionSub: { fontSize: 13, color: "#64748B", marginBottom: 12, lineHeight: 18 },

    alerteRow: {
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#F8FAFC",
    },
    alerteTexte: { flex: 1, fontSize: 13, color: "#1E293B" },

    champLabel: { fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 6 },
    champInput: {
        backgroundColor: "#F8F5F0", borderRadius: 10, padding: 12,
        fontSize: 14, color: "#1E293B", marginBottom: 14,
        borderWidth: 0.5, borderColor: "#E2E8F0",
    },

    btnPrimaire: {
        backgroundColor: "#07074C", borderRadius: 12,
        padding: 14, flexDirection: "row",
        alignItems: "center", justifyContent: "center", gap: 8,
        marginBottom: 14,
    },
    btnPrimaireTexte: { color: "#fff", fontWeight: "700", fontSize: 15 },
    btnSecondaire: {
        backgroundColor: "#EEF2FF", borderRadius: 12,
        padding: 14, flexDirection: "row",
        alignItems: "center", justifyContent: "center", gap: 8,
        borderWidth: 0.5, borderColor: "#C7D2FE",
    },
    btnSecondaireTexte: { color: "#07074C", fontWeight: "700", fontSize: 15 },
    });