    import { useEffect, useState } from "react";
    import {
    View, Text, ScrollView, Pressable,
    ActivityIndicator, SafeAreaView, StyleSheet, Share,
    } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import QRCode from "react-native-qrcode-svg";
    import { api } from "../services/api";

    type Communaute = { id: number; nom: string };

    const BASE_URL = "https://undamaged-tabloid-tweezers.ngrok-free.dev/api";

    export default function InscriptionQRScreen() {
    const [communautes, setCommunautes] = useState<Communaute[]>([]);
    const [communauteActive, setCommunauteActive] = useState<Communaute | null>(null);
    const [chargement, setChargement] = useState(true);

    useEffect(() => { chargerCommunautes(); }, []);

    async function chargerCommunautes() {
        try {
        const response = await api.get("/communautes/");
        const cultes = response.data;
        setCommunautes(Array.isArray(cultes) ? cultes : []);
        if (cultes.length > 0) setCommunauteActive(cultes[0]);
        } finally {
        setChargement(false);
        }
    }

    function getUrlInscription(communaute: Communaute) {
        return `${BASE_URL}/inscription/${communaute.id}/`;
    }

    async function partagerLien() {
        if (!communauteActive) return;
        const url = getUrlInscription(communauteActive);
        await Share.share({
        title: `Inscription — ${communauteActive.nom}`,
        message: `Scannez ce lien pour vous inscrire à ${communauteActive.nom} :\n${url}`,
        url,
        });
    }

    if (chargement) return <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />;

    return (
        <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

            {/* Info */}
            <View style={s.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#4F46E5" />
            <Text style={s.infoTexte}>
                Le membre scanne ce QR code avec son téléphone, remplit le formulaire et est ajouté automatiquement.
            </Text>
            </View>

            {/* Sélecteur de culte */}
            {communautes.length > 1 && (
            <View style={s.section}>
                <Text style={s.sectionTitre}>Culte</Text>
                <View style={s.culteRow}>
                {communautes.map(c => (
                    <Pressable
                    key={c.id}
                    style={[s.cultePill, communauteActive?.id === c.id && s.cultePillActif]}
                    onPress={() => setCommunauteActive(c)}
                    >
                    <Text style={[s.cultePillTexte, communauteActive?.id === c.id && s.cultePillTexteActif]}>
                        {c.nom.replace("Culte du ", "")}
                    </Text>
                    </Pressable>
                ))}
                </View>
            </View>
            )}

            {/* QR Code */}
            {communauteActive && (
            <View style={s.qrSection}>
                <Text style={s.qrTitre}>QR Code d'inscription</Text>
                <Text style={s.qrSousTitre}>{communauteActive.nom}</Text>

                <View style={s.qrContainer}>
                <QRCode
                    value={getUrlInscription(communauteActive)}
                    size={220}
                    color="#07074C"
                    backgroundColor="white"
                />
                </View>

                <Text style={s.qrUrl} numberOfLines={2}>
                {getUrlInscription(communauteActive)}
                </Text>

                {/* Actions */}
                <Pressable style={s.btnPartager} onPress={partagerLien}>
                <Ionicons name="share-outline" size={18} color="#07074C" />
                <Text style={s.btnPartagerTexte}>Partager le lien</Text>
                </Pressable>
            </View>
            )}

            {/* Instructions */}
            <View style={s.section}>
            <Text style={s.sectionTitre}>Comment ça marche</Text>
            {[
                { n: "1", t: "Montrez ce QR code au nouveau membre", i: "qr-code-outline" as const },
                { n: "2", t: "Il le scanne avec l'appareil photo de son téléphone", i: "camera-outline" as const },
                { n: "3", t: "Un formulaire s'ouvre automatiquement", i: "document-text-outline" as const },
                { n: "4", t: "Il remplit ses informations et envoie", i: "send-outline" as const },
                { n: "5", t: "Il est ajouté dans la liste des membres", i: "checkmark-circle-outline" as const },
            ].map(item => (
                <View key={item.n} style={s.etapeRow}>
                <View style={s.etapeNum}>
                    <Text style={s.etapeNumTexte}>{item.n}</Text>
                </View>
                <Ionicons name={item.i} size={18} color="#64748B" />
                <Text style={s.etapeTexte}>{item.t}</Text>
                </View>
            ))}
            </View>

            {/* Ce que le membre remplit */}
            <View style={s.section}>
            <Text style={s.sectionTitre}>Informations collectées</Text>
            {[
                "Nom complet",
                "Numéro de téléphone",
                "Sexe",
                "Date d'anniversaire",
                "Adresse",
                "Département",
            ].map(info => (
                <View key={info} style={s.infoRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#065F46" />
                <Text style={s.infoRowTexte}>{info}</Text>
                </View>
            ))}
            </View>

        </ScrollView>
        </SafeAreaView>
    );
    }

    const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F8F5F0" },

    infoCard: {
        backgroundColor: "#EEF2FF", borderRadius: 12, padding: 12,
        flexDirection: "row", alignItems: "flex-start", gap: 10,
        marginBottom: 16, borderWidth: 0.5, borderColor: "#C7D2FE",
    },
    infoTexte: { flex: 1, fontSize: 13, color: "#3730A3", lineHeight: 18 },

    section: {
        backgroundColor: "#fff", borderRadius: 14, padding: 14,
        marginBottom: 14, borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    sectionTitre: { fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 12 },

    culteRow: { flexDirection: "row", gap: 10 },
    cultePill: {
        flex: 1, paddingVertical: 10, borderRadius: 10,
        borderWidth: 0.5, borderColor: "#E2E8F0",
        backgroundColor: "#F8F5F0", alignItems: "center",
    },
    cultePillActif: { backgroundColor: "#07074C", borderColor: "#07074C" },
    cultePillTexte: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
    cultePillTexteActif: { color: "#fff" },

    qrSection: {
        backgroundColor: "#fff", borderRadius: 14, padding: 20,
        marginBottom: 14, borderWidth: 0.5, borderColor: "#E2E8F0",
        alignItems: "center",
    },
    qrTitre: { fontSize: 18, fontWeight: "700", color: "#1E293B", marginBottom: 4 },
    qrSousTitre: { fontSize: 13, color: "#64748B", marginBottom: 20 },
    qrContainer: {
        padding: 16, backgroundColor: "#fff",
        borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0",
        marginBottom: 16,
    },
    qrUrl: {
        fontSize: 11, color: "#94A3B8", textAlign: "center",
        marginBottom: 16, paddingHorizontal: 10,
    },

    btnPartager: {
        flexDirection: "row", alignItems: "center", gap: 8,
        backgroundColor: "#EEF2FF", borderRadius: 12,
        paddingVertical: 12, paddingHorizontal: 20,
        borderWidth: 0.5, borderColor: "#C7D2FE",
        marginBottom: 8,
    },
    btnPartagerTexte: { color: "#07074C", fontWeight: "700", fontSize: 14 },

    etapeRow: {
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#F8FAFC",
    },
    etapeNum: {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: "#07074C", alignItems: "center", justifyContent: "center",
    },
    etapeNumTexte: { color: "#fff", fontSize: 12, fontWeight: "700" },
    etapeTexte: { flex: 1, fontSize: 13, color: "#1E293B" },

    infoRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
    infoRowTexte: { fontSize: 13, color: "#1E293B" },
    });