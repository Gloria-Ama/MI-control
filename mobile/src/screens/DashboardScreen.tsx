    import { useEffect, useState } from "react";
    import {
    View, Text, ScrollView, Pressable,
    SafeAreaView, StatusBar, StyleSheet,
    } from "react-native";
    import { api } from "../services/api";

    import MembresScreen from "./MembresScreen";
    import VisiteursScreen from "./VisiteursScreen";
    import PresencesScreen from "./PresencesScreen";
    import DepartementsScreen from "./DepartementsScreen";
    import FinancesScreen from "./FinancesScreen";
    import RapportsScreen from "./RapportsScreen";
    import ResponsablesScreen from "./ResponsablesScreen";
    import ChatScreen from "./ChatScreen";
    import CalendrierScreen from "./CalendrierScreen";

    import { getMembres } from "../services/membres.service";
    import { getProfilConnecte } from "../services/auth.service";

    type Props = {
    nomCulte: string;
    onRetour: () => void;
    onDeconnexion: () => void;
    };

    type OngletNav = "accueil" | "membres" | "presences" | "finances" | "plus";
    type SousModule = "visiteurs" | "departements" | "rapports" | "responsables" | "chat" | "calendrier" | null;

    export default function DashboardScreen({ nomCulte, onRetour, onDeconnexion }: Props) {
    const [onglet, setOnglet] = useState<OngletNav>("accueil");
    const [sousModule, setSousModule] = useState<SousModule>(null);
    const [membres, setMembres] = useState<any[]>([]);
    const [profil, setProfil] = useState<any>(null);
    const [communautes, setCommunautes] = useState<{ id: number; nom: string }[]>([]);

    useEffect(() => {
        chargerProfil();
        chargerMembres();
        chargerCommunautes();
    }, []);

    async function chargerProfil() {
        try {
        const data = await getProfilConnecte();
        setProfil(data);
        } catch {}
    }

    async function chargerMembres() {
        try {
        const data = await getMembres();
        setMembres(data);
        } catch {}
    }

    async function chargerCommunautes() {
        try {
        const response = await api.get("/communautes/");
        setCommunautes(response.data);
        } catch {}
    }

    function getCommunauteId(): number | undefined {
        if (communautes.length === 0) return undefined;
        const culte = communautes.find(c =>
        c.nom.toLowerCase() === nomCulte.toLowerCase()
        );
        return culte?.id;
    }

    function peutVoir(module: string) {
        if (!profil) return true;
        if (profil.role === "pasteur" || profil.role === "administrateur") return true;
        if (profil.role === "tresoriere") return ["finances", "rapports"].includes(module);
        if (profil.role === "secretaire") return ["membres", "visiteurs", "presences", "rapports"].includes(module);
        if (profil.role === "responsable_accueil") return ["visiteurs", "membres", "presences"].includes(module);
        if (profil.role === "responsable") return ["membres", "presences"].includes(module);
        return false;
    }

    function estAdmin() {
        return profil?.role === "pasteur" || profil?.role === "administrateur";
    }

    function getDateFormat(date: Date) {
        return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    const aujourdHui = getDateFormat(new Date());
    const demainDate = new Date();
    demainDate.setDate(demainDate.getDate() + 1);
    const demain = getDateFormat(demainDate);
    const datesCetteSemaine = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return getDateFormat(d);
    });

    const anniversairesAujourdhui = membres.filter(m => m.date_anniversaire === aujourdHui);
    const anniversairesDemain = membres.filter(m => m.date_anniversaire === demain);
    const anniversairesSemaine = membres.filter(m => datesCetteSemaine.includes(m.date_anniversaire));

    // ── Sous-modules ───────────────────────────────────────────────────────────
    if (sousModule === "visiteurs") {
        return (
        <SafeAreaView style={s.safe}>
            <View style={s.header}>
            <Pressable onPress={() => setSousModule(null)} style={s.retourBtn}>
                <Text style={s.retourText}>‹ Retour</Text>
            </Pressable>
            <Text style={s.headerTitre}>Visiteurs</Text>
            <View style={s.headerEspace} />
            </View>
            <View style={{ flex: 1, backgroundColor: "#F8F5F0" }}>
            <VisiteursScreen />
            </View>
        </SafeAreaView>
        );
    }

    if (sousModule === "departements") {
        return (
        <SafeAreaView style={s.safe}>
            <View style={s.header}>
            <Pressable onPress={() => setSousModule(null)} style={s.retourBtn}>
                <Text style={s.retourText}>‹ Retour</Text>
            </Pressable>
            <Text style={s.headerTitre}>Départements</Text>
            <View style={s.headerEspace} />
            </View>
            <View style={{ flex: 1, backgroundColor: "#F8F5F0" }}>
            <DepartementsScreen />
            </View>
        </SafeAreaView>
        );
    }

    if (sousModule === "rapports") {
        return (
        <SafeAreaView style={s.safe}>
            <View style={s.header}>
            <Pressable onPress={() => setSousModule(null)} style={s.retourBtn}>
                <Text style={s.retourText}>‹ Retour</Text>
            </Pressable>
            <Text style={s.headerTitre}>Rapports</Text>
            <View style={s.headerEspace} />
            </View>
            <View style={{ flex: 1, backgroundColor: "#F8F5F0" }}>
            <RapportsScreen />
            </View>
        </SafeAreaView>
        );
    }

    if (sousModule === "responsables") {
        return (
        <SafeAreaView style={s.safe}>
            <View style={s.header}>
            <Pressable onPress={() => setSousModule(null)} style={s.retourBtn}>
                <Text style={s.retourText}>‹ Retour</Text>
            </Pressable>
            <Text style={s.headerTitre}>Responsables</Text>
            <View style={s.headerEspace} />
            </View>
            <View style={{ flex: 1, backgroundColor: "#F8F5F0" }}>
            <ResponsablesScreen />
            </View>
        </SafeAreaView>
        );
    }

    if (sousModule === "chat") {
        return (
        <SafeAreaView style={s.safe}>
            <View style={{ flex: 1, backgroundColor: "#F8F5F0" }}>
            <ChatScreen onRetour={() => setSousModule(null)} />
            </View>
        </SafeAreaView>
        );
    }

    if (sousModule === "calendrier") {
        return (
        <SafeAreaView style={s.safe}>
            <View style={s.header}>
            <Pressable onPress={() => setSousModule(null)} style={s.retourBtn}>
                <Text style={s.retourText}>‹ Retour</Text>
            </Pressable>
            <Text style={s.headerTitre}>Calendrier</Text>
            <View style={s.headerEspace} />
            </View>
            <View style={{ flex: 1, backgroundColor: "#F8F5F0" }}>
            <CalendrierScreen />
            </View>
        </SafeAreaView>
        );
    }

    // ── Contenu selon l'onglet ─────────────────────────────────────────────────
    function renderContenu() {

        if (onglet === "membres" && peutVoir("membres")) {
        return <MembresScreen nomCulte={nomCulte} communauteId={getCommunauteId()} />;
        }

        if (onglet === "presences" && peutVoir("presences")) {
        return <PresencesScreen nomCulte={nomCulte} communauteId={getCommunauteId()} />;
        }

        if (onglet === "finances" && peutVoir("finances")) {
        return <FinancesScreen />;
        }

        if (onglet === "plus") {
        return (
            <ScrollView
            style={s.contenu}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            >
            <Text style={s.sectionTitre}>Autres modules</Text>

            {peutVoir("visiteurs") && (
                <Pressable style={s.moduleCard} onPress={() => setSousModule("visiteurs")}>
                <Text style={s.moduleIcone}>🆕</Text>
                <View style={{ flex: 1 }}>
                    <Text style={s.moduleNom}>Visiteurs</Text>
                    <Text style={s.moduleSub}>Suivi des nouveaux arrivants</Text>
                </View>
                <Text style={s.moduleFleche}>›</Text>
                </Pressable>
            )}

            {peutVoir("departements") && (
                <Pressable style={s.moduleCard} onPress={() => setSousModule("departements")}>
                <Text style={s.moduleIcone}>🏛️</Text>
                <View style={{ flex: 1 }}>
                    <Text style={s.moduleNom}>Départements</Text>
                    <Text style={s.moduleSub}>Gérer les départements</Text>
                </View>
                <Text style={s.moduleFleche}>›</Text>
                </Pressable>
            )}

            {peutVoir("rapports") && (
                <Pressable style={s.moduleCard} onPress={() => setSousModule("rapports")}>
                <Text style={s.moduleIcone}>📊</Text>
                <View style={{ flex: 1 }}>
                    <Text style={s.moduleNom}>Rapports</Text>
                    <Text style={s.moduleSub}>Statistiques et exports</Text>
                </View>
                <Text style={s.moduleFleche}>›</Text>
                </Pressable>
            )}

            {/* Calendrier — visible par tous */}
            <Pressable style={s.moduleCard} onPress={() => setSousModule("calendrier")}>
                <Text style={s.moduleIcone}>📅</Text>
                <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>Calendrier</Text>
                <Text style={s.moduleSub}>Activités et événements</Text>
                </View>
                <Text style={s.moduleFleche}>›</Text>
            </Pressable>

            {/* Chat — visible par tous */}
            <Pressable style={s.moduleCard} onPress={() => setSousModule("chat")}>
                <Text style={s.moduleIcone}>💬</Text>
                <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>ChatIntimacy</Text>
                <Text style={s.moduleSub}>Messagerie interne</Text>
                </View>
                <Text style={s.moduleFleche}>›</Text>
            </Pressable>

            {/* Responsables — admin seulement */}
            {estAdmin() && (
                <Pressable style={s.moduleCard} onPress={() => setSousModule("responsables")}>
                <Text style={s.moduleIcone}>👤</Text>
                <View style={{ flex: 1 }}>
                    <Text style={s.moduleNom}>Responsables</Text>
                    <Text style={s.moduleSub}>Gérer les comptes</Text>
                </View>
                <Text style={s.moduleFleche}>›</Text>
                </Pressable>
            )}

            <View style={{ marginTop: 30 }}>
                <Pressable style={s.cardSecondaire} onPress={onRetour}>
                <Text style={s.moduleIcone}>↩</Text>
                <Text style={s.moduleNom}>Changer de culte</Text>
                </Pressable>
                <Pressable style={s.cardDanger} onPress={onDeconnexion}>
                <Text style={s.moduleIcone}>🚪</Text>
                <Text style={s.moduleDangerTexte}>Se déconnecter</Text>
                </Pressable>
            </View>
            </ScrollView>
        );
        }

        // ── Accueil ───────────────────────────────────────────────────────────────
        return (
        <ScrollView
            style={s.contenu}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
            {profil && (
            <View style={s.profilCard}>
                <View style={s.profilAvatar}>
                <Text style={s.profilAvatarTexte}>
                    {profil.username?.[0]?.toUpperCase() ?? "?"}
                </Text>
                </View>
                <View>
                <Text style={s.profilNom}>Bonjour, {profil.username} 👋</Text>
                <Text style={s.profilRole}>{nomCulte}</Text>
                </View>
            </View>
            )}

            <View style={s.statsRow}>
            <View style={s.statCard}>
                <Text style={s.statNombre}>{membres.length}</Text>
                <Text style={s.statLabel}>Membres</Text>
            </View>
            <View style={s.statCard}>
                <Text style={s.statNombre}>
                {membres.filter(m => m.statut === "actif").length}
                </Text>
                <Text style={s.statLabel}>Actifs</Text>
            </View>
            <View style={s.statCard}>
                <Text style={s.statNombre}>
                {membres.filter(m => (m.absences_recentes ?? 0) >= 3).length}
                </Text>
                <Text style={[s.statLabel, { color: "#EF4444" }]}>Absents 3+</Text>
            </View>
            </View>

            <View style={s.section}>
            <Text style={s.sectionTitre}>🎂 Anniversaires</Text>

            <Text style={s.sousSection}>Aujourd'hui</Text>
            {anniversairesAujourdhui.length === 0
                ? <Text style={s.videTexte}>Aucun anniversaire aujourd'hui.</Text>
                : anniversairesAujourdhui.map(m => (
                <Text key={m.id} style={s.anniversaireItem}>
                    🎉 {m.nom} — {m.telephone}
                </Text>
                ))
            }

            <Text style={s.sousSection}>Demain</Text>
            {anniversairesDemain.length === 0
                ? <Text style={s.videTexte}>Aucun anniversaire demain.</Text>
                : anniversairesDemain.map(m => (
                <Text key={m.id} style={s.anniversaireItem}>
                    ⏰ {m.nom} — {m.telephone}
                </Text>
                ))
            }

            <Text style={s.sousSection}>Cette semaine</Text>
            {anniversairesSemaine.length === 0
                ? <Text style={s.videTexte}>Aucun cette semaine.</Text>
                : anniversairesSemaine.map(m => (
                <Text key={m.id} style={s.anniversaireItem}>
                    📅 {m.nom} — {m.date_anniversaire}
                </Text>
                ))
            }
            </View>

            <Text style={s.sectionTitre}>Accès rapide</Text>
            <View style={s.raccourcisGrid}>
            {peutVoir("membres") && (
                <Pressable style={s.raccourciCard} onPress={() => setOnglet("membres")}>
                <Text style={s.raccourciIcone}>👥</Text>
                <Text style={s.raccourciNom}>Membres</Text>
                </Pressable>
            )}
            {peutVoir("presences") && (
                <Pressable style={s.raccourciCard} onPress={() => setOnglet("presences")}>
                <Text style={s.raccourciIcone}>✅</Text>
                <Text style={s.raccourciNom}>Présences</Text>
                </Pressable>
            )}
            {peutVoir("visiteurs") && (
                <Pressable style={s.raccourciCard} onPress={() => setSousModule("visiteurs")}>
                <Text style={s.raccourciIcone}>🆕</Text>
                <Text style={s.raccourciNom}>Visiteurs</Text>
                </Pressable>
            )}
            {peutVoir("finances") && (
                <Pressable style={s.raccourciCard} onPress={() => setOnglet("finances")}>
                <Text style={s.raccourciIcone}>💰</Text>
                <Text style={s.raccourciNom}>Finances</Text>
                </Pressable>
            )}
            <Pressable style={s.raccourciCard} onPress={() => setSousModule("calendrier")}>
                <Text style={s.raccourciIcone}>📅</Text>
                <Text style={s.raccourciNom}>Calendrier</Text>
            </Pressable>
            <Pressable style={s.raccourciCard} onPress={() => setSousModule("chat")}>
                <Text style={s.raccourciIcone}>💬</Text>
                <Text style={s.raccourciNom}>Chat</Text>
            </Pressable>
            </View>
        </ScrollView>
        );
    }

    // ── Structure principale ───────────────────────────────────────────────────
    return (
        <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#07074C" />

        <View style={s.header}>
            <View style={s.headerEspace} />
            <Text style={s.headerTitre} numberOfLines={1}>
            {onglet === "accueil" ? nomCulte
                : onglet === "membres" ? "Membres"
                : onglet === "presences" ? "Présences"
                : onglet === "finances" ? "Finances"
                : "Plus"}
            </Text>
            <View style={s.headerEspace} />
        </View>

        <View style={{ flex: 1, backgroundColor: "#F8F5F0" }}>
            {renderContenu()}
        </View>

        <View style={s.navbar}>
            {[
            { id: "accueil" as OngletNav,   icone: "🏠", label: "Accueil" },
            { id: "membres" as OngletNav,   icone: "👥", label: "Membres",   module: "membres" },
            { id: "presences" as OngletNav, icone: "✅", label: "Présences", module: "presences" },
            { id: "finances" as OngletNav,  icone: "💰", label: "Finances",  module: "finances" },
            { id: "plus" as OngletNav,      icone: "⋯",  label: "Plus" },
            ].map(tab => {
            if (tab.module && !peutVoir(tab.module)) return null;
            const actif = onglet === tab.id;
            return (
                <Pressable
                key={tab.id}
                style={s.tab}
                onPress={() => { setOnglet(tab.id); setSousModule(null); }}
                >
                {actif && <View style={s.tabIndicateur} />}
                <Text style={s.tabIcone}>{tab.icone}</Text>
                <Text style={[s.tabLabel, actif && s.tabLabelActif]}>{tab.label}</Text>
                </Pressable>
            );
            })}
        </View>
        </SafeAreaView>
    );
    }

    const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#07074C" },

    header: {
        backgroundColor: "#07074C", height: 54,
        flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    },
    headerTitre: {
        flex: 1, color: "#fff", fontSize: 17,
        fontWeight: "700", textAlign: "center",
    },
    headerEspace: { width: 70 },
    retourBtn: { paddingRight: 12 },
    retourText: { color: "#94A3B8", fontSize: 15 },

    contenu: { flex: 1 },

    profilCard: {
        backgroundColor: "#fff", borderRadius: 16, padding: 14,
        flexDirection: "row", alignItems: "center", gap: 12,
        marginBottom: 14, borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    profilAvatar: {
        width: 46, height: 46, borderRadius: 23,
        backgroundColor: "#07074C", alignItems: "center", justifyContent: "center",
    },
    profilAvatarTexte: { color: "#fff", fontWeight: "700", fontSize: 18 },
    profilNom: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
    profilRole: { fontSize: 12, color: "#64748B", marginTop: 2 },

    statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
    statCard: {
        flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 14,
        alignItems: "center", borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    statNombre: { fontSize: 24, fontWeight: "700", color: "#07074C" },
    statLabel: { fontSize: 11, color: "#64748B", marginTop: 4 },

    section: {
        backgroundColor: "#fff", borderRadius: 14, padding: 14,
        marginBottom: 14, borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    sectionTitre: {
        fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 10,
    },
    sousSection: {
        fontSize: 13, fontWeight: "700", color: "#8B5E34",
        marginTop: 8, marginBottom: 4,
    },
    anniversaireItem: { fontSize: 14, color: "#1E293B", paddingVertical: 3 },
    videTexte: { fontSize: 13, color: "#94A3B8", fontStyle: "italic" },

    raccourcisGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    raccourciCard: {
        width: "47%", backgroundColor: "#fff", borderRadius: 14,
        padding: 16, alignItems: "center", gap: 8,
        borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    raccourciIcone: { fontSize: 28 },
    raccourciNom: { fontSize: 13, fontWeight: "700", color: "#1E293B" },

    moduleCard: {
        backgroundColor: "#fff", borderRadius: 14, padding: 16,
        flexDirection: "row", alignItems: "center", gap: 14,
        marginBottom: 10, borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    moduleIcone: { fontSize: 22 },
    moduleNom: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
    moduleSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
    moduleFleche: { fontSize: 22, color: "#94A3B8" },
    cardSecondaire: {
        backgroundColor: "#F1F5F9", borderRadius: 14, padding: 16,
        flexDirection: "row", alignItems: "center", gap: 14,
        marginBottom: 10, borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    cardDanger: {
        backgroundColor: "#FEF2F2", borderRadius: 14, padding: 16,
        flexDirection: "row", alignItems: "center", gap: 14,
        borderWidth: 0.5, borderColor: "#FECACA",
    },
    moduleDangerTexte: { fontSize: 15, fontWeight: "600", color: "#EF4444" },

    navbar: {
        flexDirection: "row", backgroundColor: "#fff",
        borderTopWidth: 0.5, borderTopColor: "#E2E8F0",
        paddingBottom: 8, paddingTop: 6,
    },
    tab: {
        flex: 1, alignItems: "center", justifyContent: "center",
        paddingVertical: 4, position: "relative",
    },
    tabIndicateur: {
        position: "absolute", top: 0, width: 28, height: 3,
        backgroundColor: "#4F46E5", borderRadius: 2,
    },
    tabIcone: { fontSize: 20, marginBottom: 2 },
    tabLabel: { fontSize: 10, color: "#94A3B8", fontWeight: "500" },
    tabLabelActif: { color: "#4F46E5", fontWeight: "700" },
    });