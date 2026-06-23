import { useEffect, useState } from "react";
    import {
    View, Text, ScrollView, Pressable,
    Alert, ActivityIndicator, SafeAreaView, StyleSheet,
    } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import { getMembres } from "../services/membres.service";
    import { getPresences } from "../services/presences.service";
    import { getVisiteurs } from "../services/visiteurs.service";
    import { getBudgets } from "../services/budget.service";
    import { api } from "../services/api";
    import {
    exporterMembresPDF, exporterPresencesPDF,
    exporterAbsentsPDF, exporterVisiteursPDF, exporterBudgetPDF,
    } from "../services/export.service";

    type Props = { nomCulte?: string; communauteId?: number };

    export default function ExportPDFScreen({ nomCulte = "Église", communauteId }: Props) {
    const [chargement, setChargement] = useState<string | null>(null);
    const [membres, setMembres] = useState<any[]>([]);
    const [visiteurs, setVisiteurs] = useState<any[]>([]);
    const [budget, setBudget] = useState<any>(null);
    const [pret, setPret] = useState(false);

    useEffect(() => { chargerDonnees(); }, []);

    async function chargerDonnees() {
        try {
        const [m, v, b] = await Promise.all([
            getMembres(communauteId ? { communaute_culte: communauteId } : {}),
            getVisiteurs(communauteId ? { communaute_culte: communauteId } : {}),
            getBudgets(communauteId, new Date().getFullYear()).catch(() => []),
        ]);
        setMembres(Array.isArray(m) ? m : []);
        setVisiteurs(Array.isArray(v) ? v : []);
        setBudget(Array.isArray(b) && b.length > 0 ? b[0] : null);
        setPret(true);
        } catch {
        setPret(true);
        }
    }

    async function exporter(type: string) {
        setChargement(type);
        try {
        switch (type) {
            case "membres":
            await exporterMembresPDF(membres, nomCulte);
            break;

            case "absents":
            const absents = membres.filter(m => (m.absences_recentes ?? 0) >= 3);
            if (absents.length === 0) {
                Alert.alert("Aucun absent", "Aucun membre absent depuis 3 semaines ou plus.");
                return;
            }
            await exporterAbsentsPDF(absents, nomCulte);
            break;

            case "visiteurs":
            if (visiteurs.length === 0) {
                Alert.alert("Aucun visiteur", "Aucun visiteur enregistré.");
                return;
            }
            await exporterVisiteursPDF(visiteurs, nomCulte);
            break;

            case "presences": {
            const aujourd = new Date().toISOString().split("T")[0];
            const p = await getPresences({ date: aujourd, communaute_culte: communauteId });
            if (!p || p.length === 0) {
                Alert.alert("Aucune présence", "Aucune présence enregistrée aujourd'hui.");
                return;
            }
            await exporterPresencesPDF(p, membres, aujourd, nomCulte);
            break;
            }

            case "budget":
            if (!budget) {
                Alert.alert("Aucun budget", `Aucun budget créé pour ${new Date().getFullYear()}.`);
                return;
            }
            await exporterBudgetPDF(budget, new Date().getFullYear());
            break;
        }
        } catch (err: any) {
        Alert.alert("Erreur", "Impossible de générer le PDF. Réessayez.");
        } finally {
        setChargement(null);
        }
    }

    const rapports = [
        {
        id: "membres",
        titre: "Liste des membres",
        sous: `${membres.length} membres — actifs et inactifs`,
        icone: "people-outline" as const,
        couleur: "#07074C",
        },
        {
        id: "absents",
        titre: "Rapport d'absences",
        sous: `${membres.filter(m => (m.absences_recentes ?? 0) >= 3).length} membres absents 3+ semaines`,
        icone: "alert-circle-outline" as const,
        couleur: "#EF4444",
        },
        {
        id: "presences",
        titre: "Présences du jour",
        sous: "Feuille de présence du culte d'aujourd'hui",
        icone: "checkmark-circle-outline" as const,
        couleur: "#065F46",
        },
        {
        id: "visiteurs",
        titre: "Rapport des visiteurs",
        sous: `${visiteurs.length} visiteurs enregistrés`,
        icone: "person-add-outline" as const,
        couleur: "#4F46E5",
        },
        {
        id: "budget",
        titre: "Budget annuel",
        sous: budget
            ? `${new Date().getFullYear()} — Taux : ${budget.taux_global}%`
            : `Aucun budget pour ${new Date().getFullYear()}`,
        icone: "wallet-outline" as const,
        couleur: "#854F0B",
        },
    ];

    return (
        <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

            {/* Info */}
            <View style={s.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#4F46E5" />
            <Text style={s.infoTexte}>
                Les rapports sont générés en PDF et peuvent être enregistrés, imprimés ou partagés.
            </Text>
            </View>

            <Text style={s.sectionTitre}>Rapports disponibles</Text>

            {!pret ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />
            ) : (
            rapports.map(r => (
                <Pressable
                key={r.id}
                style={[s.card, chargement === r.id && { opacity: 0.7 }]}
                onPress={() => exporter(r.id)}
                disabled={chargement !== null}
                >
                <View style={[s.iconeBox, { backgroundColor: r.couleur + "15" }]}>
                    <Ionicons name={r.icone} size={24} color={r.couleur} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={s.cardTitre}>{r.titre}</Text>
                    <Text style={s.cardSub}>{r.sous}</Text>
                </View>
                {chargement === r.id ? (
                    <ActivityIndicator size="small" color={r.couleur} />
                ) : (
                    <View style={[s.btnExport, { backgroundColor: r.couleur }]}>
                    <Ionicons name="download-outline" size={16} color="#fff" />
                    <Text style={s.btnExportTexte}>PDF</Text>
                    </View>
                )}
                </Pressable>
            ))
            )}
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
    sectionTitre: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 12 },
    card: {
        backgroundColor: "#fff", borderRadius: 14, padding: 14,
        flexDirection: "row", alignItems: "center", gap: 12,
        marginBottom: 10, borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    iconeBox: {
        width: 46, height: 46, borderRadius: 12,
        alignItems: "center", justifyContent: "center",
    },
    cardTitre: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
    cardSub: { fontSize: 12, color: "#64748B", marginTop: 3 },
    btnExport: {
        flexDirection: "row", alignItems: "center", gap: 4,
        paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8,
    },
    btnExportTexte: { color: "#fff", fontSize: 13, fontWeight: "700" },
    });