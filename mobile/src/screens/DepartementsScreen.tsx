    import { useEffect, useState } from "react";
    import {
    View, Text, TextInput, ScrollView, Pressable,
    Alert, ActivityIndicator, SafeAreaView, Modal, StyleSheet,
    } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import { api } from "../services/api";
    import { getResponsables } from "../services/responsables.service";

    type Departement = {
    id: number;
    nom: string;
    description: string;
    communaute_culte: number;
    communaute_nom: string;
    responsable_nom: string | null;
    responsable_id: number | null;
    };

    type Responsable = {
    id: number;
    username: string;
    role: string;
    actif: boolean;
    };

    type Membre = {
    id: number;
    nom: string;
    telephone: string;
    };

    type Vue = "liste" | "detail" | "formulaire";

    // Icônes et couleurs par département
    const DEPT_STYLES: Record<string, { icon: string; couleur: string; fond: string }> = {
    musique:      { icon: "musical-notes-outline",   couleur: "#7C3AED", fond: "#F5F3FF" },
    chorale:      { icon: "musical-notes-outline",   couleur: "#7C3AED", fond: "#F5F3FF" },
    accueil:      { icon: "hand-right-outline",      couleur: "#0891B2", fond: "#ECFEFF" },
    intercessio:  { icon: "flower-outline",          couleur: "#DC2626", fond: "#FEF2F2" },
    priere:       { icon: "flower-outline",          couleur: "#DC2626", fond: "#FEF2F2" },
    jeunesse:     { icon: "people-outline",          couleur: "#D97706", fond: "#FFFBEB" },
    enfant:       { icon: "happy-outline",           couleur: "#F59E0B", fond: "#FFFBEB" },
    femme:        { icon: "rose-outline",            couleur: "#DB2777", fond: "#FDF2F8" },
    homme:        { icon: "barbell-outline",         couleur: "#1D4ED8", fond: "#EFF6FF" },
    media:        { icon: "videocam-outline",        couleur: "#059669", fond: "#ECFDF5" },
    finance:      { icon: "cash-outline",            couleur: "#065F46", fond: "#ECFDF5" },
    secretar:     { icon: "document-text-outline",   couleur: "#475569", fond: "#F1F5F9" },
    evangeli:     { icon: "megaphone-outline",       couleur: "#B45309", fond: "#FFFBEB" },
    diacre:       { icon: "shield-outline",          couleur: "#1E40AF", fond: "#EFF6FF" },
    technique:    { icon: "construct-outline",       couleur: "#374151", fond: "#F9FAFB" },
    pastoral:     { icon: "heart-outline",           couleur: "#BE185D", fond: "#FDF2F8" },
    };

    function getDeptStyle(nom: string) {
    const nomLower = nom.toLowerCase();
    for (const [key, style] of Object.entries(DEPT_STYLES)) {
        if (nomLower.includes(key)) return style;
    }
    return { icon: "business-outline", couleur: "#07074C", fond: "#EEF2FF" };
    }

    export default function DepartementsScreen() {
    const [departements, setDepartements] = useState<Departement[]>([]);
    const [membres, setMembres] = useState<Membre[]>([]);
    const [responsables, setResponsables] = useState<Responsable[]>([]);
    const [communautes, setCommunautes] = useState<{ id: number; nom: string }[]>([]);
    const [communauteActive, setCommunauteActive] = useState<number | undefined>();
    const [chargement, setChargement] = useState(true);
    const [vue, setVue] = useState<Vue>("liste");
    const [selectionne, setSelectionne] = useState<Departement | null>(null);
    const [sauvegarde, setSauvegarde] = useState(false);
    const [modalResponsable, setModalResponsable] = useState(false);
    const [recherche, setRecherche] = useState("");

    // Formulaire
    const [formNom, setFormNom] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formCommunaute, setFormCommunaute] = useState<number | undefined>();
    const [modeEdition, setModeEdition] = useState(false);

    useEffect(() => { chargerDonnees(); }, []);

    async function chargerDonnees() {
        setChargement(true);
        try {
        const [c, r] = await Promise.all([
            api.get("/communautes/").then(r => r.data).catch(() => []),
            getResponsables().catch(() => []),
        ]);
        setCommunautes(Array.isArray(c) ? c : []);
        setResponsables(Array.isArray(r) ? r : []);
        const cid = c.length > 0 ? c[0].id : undefined;
        setCommunauteActive(cid);
        if (cid) await chargerDepartements(cid);
        } finally {
        setChargement(false);
        }
    }

    async function chargerDepartements(cid?: number) {
        const id = cid ?? communauteActive;
        if (!id) return;
        try {
        const d = await api.get(`/departements/?communaute_culte=${id}`).then(r => r.data);
        setDepartements(Array.isArray(d) ? d : []);
        } catch {}
    }

    async function chargerMembres(deptId: number) {
        try {
        const m = await api.get(`/membres/?departement=${deptId}`).then(r => r.data);
        setMembres(Array.isArray(m) ? m : []);
        } catch {}
    }

    function ouvrirDetail(dept: Departement) {
        setSelectionne(dept);
        setVue("detail");
        chargerMembres(dept.id);
    }

    function ouvrirFormulaire(dept?: Departement) {
        if (dept) {
        setModeEdition(true);
        setSelectionne(dept);
        setFormNom(dept.nom);
        setFormDescription(dept.description);
        setFormCommunaute(dept.communaute_culte);
        } else {
        setModeEdition(false);
        setSelectionne(null);
        setFormNom("");
        setFormDescription("");
        setFormCommunaute(communauteActive);
        }
        setVue("formulaire");
    }

    async function sauvegarder() {
        if (!formNom.trim()) { Alert.alert("Champ requis", "Le nom est obligatoire."); return; }
        if (!formCommunaute) { Alert.alert("Champ requis", "Choisissez un culte."); return; }

        setSauvegarde(true);
        try {
        if (modeEdition && selectionne) {
            await api.put(`/departements/${selectionne.id}/`, {
            nom: formNom.trim(),
            description: formDescription.trim(),
            communaute_culte: formCommunaute,
            });
        } else {
            await api.post("/departements/", {
            nom: formNom.trim(),
            description: formDescription.trim(),
            communaute_culte: formCommunaute,
            });
        }
        await chargerDepartements();
        setVue("liste");
        Alert.alert("✅", modeEdition ? "Département modifié." : "Département créé.");
        } catch (err: any) {
        Alert.alert("Erreur", JSON.stringify(err?.response?.data ?? "Impossible de sauvegarder."));
        } finally {
        setSauvegarde(false);
        }
    }

    async function supprimer(dept: Departement) {
        Alert.alert("Supprimer ?", `Supprimer le département "${dept.nom}" ?`, [
        { text: "Annuler", style: "cancel" },
        {
            text: "Supprimer", style: "destructive",
            onPress: async () => {
            await api.delete(`/departements/${dept.id}/`);
            await chargerDepartements();
            setVue("liste");
            },
        },
        ]);
    }

    async function assignerResponsable(responsableId: number | null) {
        if (!selectionne) return;
        try {
        await api.post(`/departements/${selectionne.id}/assigner-responsable/`, {
            responsable_id: responsableId,
        });
        await chargerDepartements();
        // Mettre à jour le département sélectionné
        const resp = responsableId ? responsables.find(r => r.id === responsableId) : null;
        setSelectionne(prev => prev ? {
            ...prev,
            responsable_nom: resp?.username ?? null,
            responsable_id: responsableId,
        } : null);
        setModalResponsable(false);
        Alert.alert("✅", resp ? `${resp.username} assigné au département.` : "Responsable retiré.");
        } catch {
        Alert.alert("Erreur", "Impossible d'assigner le responsable.");
        }
    }

    // ── MODAL SÉLECTION RESPONSABLE ───────────────────────────────────────────
    function renderModalResponsable() {
        const respFiltres = responsables.filter(r =>
        r.actif && r.username.toLowerCase().includes(recherche.toLowerCase())
        );
        return (
        <Modal visible={modalResponsable} transparent animationType="slide" onRequestClose={() => setModalResponsable(false)}>
            <View style={s.modalOverlay}>
            <View style={s.modalCard}>
                <View style={s.modalHeader}>
                <Text style={s.modalTitre}>Choisir le responsable</Text>
                <Pressable onPress={() => setModalResponsable(false)}>
                    <Ionicons name="close" size={24} color="#64748B" />
                </Pressable>
                </View>
                <TextInput
                style={s.searchInput}
                placeholder="Rechercher..."
                placeholderTextColor="#94A3B8"
                value={recherche}
                onChangeText={setRecherche}
                />
                <ScrollView style={{ maxHeight: 300 }}>
                {/* Option aucun */}
                <Pressable
                    style={[s.respItem, !selectionne?.responsable_id && s.respItemActif]}
                    onPress={() => assignerResponsable(null)}
                >
                    <View style={[s.respAvatar, { backgroundColor: "#94A3B8" }]}>
                    <Ionicons name="person-remove-outline" size={18} color="#fff" />
                    </View>
                    <Text style={s.respNom}>Aucun responsable</Text>
                    {!selectionne?.responsable_id && <Ionicons name="checkmark-circle" size={20} color="#07074C" />}
                </Pressable>

                {respFiltres.map(r => (
                    <Pressable
                    key={r.id}
                    style={[s.respItem, selectionne?.responsable_id === r.id && s.respItemActif]}
                    onPress={() => assignerResponsable(r.id)}
                    >
                    <View style={[s.respAvatar, { backgroundColor: "#07074C" }]}>
                        <Text style={s.respAvatarTexte}>{r.username[0]?.toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={s.respNom}>{r.username}</Text>
                        <Text style={s.respRole}>{r.role}</Text>
                    </View>
                    {selectionne?.responsable_id === r.id && (
                        <Ionicons name="checkmark-circle" size={20} color="#07074C" />
                    )}
                    </Pressable>
                ))}
                </ScrollView>
            </View>
            </View>
        </Modal>
        );
    }

    // ── FORMULAIRE ────────────────────────────────────────────────────────────
    if (vue === "formulaire") {
        return (
        <SafeAreaView style={s.safe}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
            <Pressable onPress={() => setVue(selectionne ? "detail" : "liste")} style={{ marginBottom: 16 }}>
                <Text style={{ color: "#64748B", fontSize: 15 }}>‹ Retour</Text>
            </Pressable>
            <Text style={s.formTitre}>{modeEdition ? "Modifier le département" : "Nouveau département"}</Text>

            <Text style={s.champLabel}>Nom *</Text>
            <TextInput
                style={s.champInput}
                value={formNom}
                onChangeText={setFormNom}
                placeholder="Ex: Département musique"
                placeholderTextColor="#94A3B8"
            />

            <Text style={s.champLabel}>Description</Text>
            <TextInput
                style={[s.champInput, { minHeight: 80, textAlignVertical: "top" }]}
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="Description du département..."
                placeholderTextColor="#94A3B8"
                multiline
            />

            <Text style={s.champLabel}>Culte *</Text>
            <View style={s.culteRow}>
                {communautes.map(c => (
                <Pressable
                    key={c.id}
                    style={[s.cultePill, formCommunaute === c.id && s.cultePillActif]}
                    onPress={() => setFormCommunaute(c.id)}
                >
                    <Text style={[s.cultePillTexte, formCommunaute === c.id && s.cultePillTexteActif]}>
                    {c.nom.replace("Culte du ", "")}
                    </Text>
                </Pressable>
                ))}
            </View>

            <Pressable
                style={[s.btnPrimaire, sauvegarde && { opacity: 0.6 }]}
                onPress={sauvegarder}
                disabled={sauvegarde}
            >
                {sauvegarde
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Ionicons name="checkmark-outline" size={20} color="#fff" />
                    <Text style={s.btnPrimaireTexte}>
                        {modeEdition ? "Enregistrer les modifications" : "Créer le département"}
                    </Text>
                    </>
                }
            </Pressable>

            {modeEdition && selectionne && (
                <Pressable style={s.btnDanger} onPress={() => supprimer(selectionne)}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={s.btnDangerTexte}>Supprimer ce département</Text>
                </Pressable>
            )}
            </ScrollView>
        </SafeAreaView>
        );
    }

    // ── DETAIL ────────────────────────────────────────────────────────────────
    if (vue === "detail" && selectionne) {
        const style = getDeptStyle(selectionne.nom);
        return (
        <SafeAreaView style={s.safe}>
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            {/* Header département */}
            <View style={[s.deptHeader, { backgroundColor: style.couleur }]}>
                <Pressable onPress={() => setVue("liste")} style={{ marginBottom: 16 }}>
                <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.8)" />
                </Pressable>
                <View style={s.deptHeaderIconeBox}>
                <Ionicons name={style.icon as any} size={36} color="#fff" />
                </View>
                <Text style={s.deptHeaderNom}>{selectionne.nom}</Text>
                <Text style={s.deptHeaderCulte}>{selectionne.communaute_nom}</Text>
                {selectionne.description ? (
                <Text style={s.deptHeaderDesc}>{selectionne.description}</Text>
                ) : null}
            </View>

            <View style={{ padding: 14 }}>
                {/* Responsable */}
                <View style={s.section}>
                <View style={s.sectionHeader}>
                    <Ionicons name="person-circle-outline" size={18} color="#07074C" />
                    <Text style={s.sectionTitre}>Responsable du département</Text>
                </View>

                {selectionne.responsable_nom ? (
                    <View style={s.responsableCard}>
                    <View style={s.responsableAvatar}>
                        <Text style={s.responsableAvatarTexte}>
                        {selectionne.responsable_nom[0]?.toUpperCase()}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={s.responsableNom}>{selectionne.responsable_nom}</Text>
                        <Text style={s.responsableLabel}>Responsable désigné</Text>
                    </View>
                    <Pressable
                        style={s.btnChanger}
                        onPress={() => { setRecherche(""); setModalResponsable(true); }}
                    >
                        <Text style={s.btnChangerTexte}>Changer</Text>
                    </Pressable>
                    </View>
                ) : (
                    <Pressable
                    style={s.responsableVide}
                    onPress={() => { setRecherche(""); setModalResponsable(true); }}
                    >
                    <View style={s.responsableVideIcone}>
                        <Ionicons name="person-add-outline" size={22} color="#94A3B8" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={s.responsableVideTexte}>Aucun responsable assigné</Text>
                        <Text style={{ fontSize: 12, color: "#94A3B8" }}>Appuyez pour assigner</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
                    </Pressable>
                )}
                </View>

                {/* Statistiques */}
                <View style={s.statsRow}>
                <View style={s.statCard}>
                    <Text style={[s.statNombre, { color: style.couleur }]}>{membres.length}</Text>
                    <Text style={s.statLabel}>Membres</Text>
                </View>
                <View style={s.statCard}>
                    <Text style={[s.statNombre, { color: "#065F46" }]}>
                    {membres.filter(() => true).length}
                    </Text>
                    <Text style={s.statLabel}>Actifs</Text>
                </View>
                </View>

                {/* Liste des membres */}
                <View style={s.section}>
                <View style={s.sectionHeader}>
                    <Ionicons name="people-outline" size={18} color="#07074C" />
                    <Text style={s.sectionTitre}>Membres du département ({membres.length})</Text>
                </View>

                {membres.length === 0 ? (
                    <Text style={s.videTexte}>Aucun membre dans ce département.</Text>
                ) : (
                    membres.map(m => (
                    <View key={m.id} style={s.membreItem}>
                        <View style={[s.membreAvatar, { backgroundColor: style.couleur + "30" }]}>
                        <Text style={[s.membreAvatarTexte, { color: style.couleur }]}>
                            {m.nom[0]?.toUpperCase()}
                        </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                        <Text style={s.membreNom}>{m.nom}</Text>
                        <Text style={s.membreTel}>{m.telephone}</Text>
                        </View>
                        <Ionicons name="call-outline" size={16} color="#94A3B8" />
                    </View>
                    ))
                )}
                </View>

                {/* Actions */}
                <Pressable
                style={[s.btnSecondaire]}
                onPress={() => ouvrirFormulaire(selectionne)}
                >
                <Ionicons name="create-outline" size={18} color="#07074C" />
                <Text style={s.btnSecondaireTexte}>Modifier le département</Text>
                </Pressable>
            </View>
            </ScrollView>
            {renderModalResponsable()}
        </SafeAreaView>
        );
    }

    // ── LISTE ─────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={s.safe}>
        {/* Sélecteur de culte */}
        {communautes.length > 1 && (
            <View style={s.culteRow2}>
            {communautes.map(c => (
                <Pressable
                key={c.id}
                style={[s.cultePill, communauteActive === c.id && s.cultePillActif]}
                onPress={() => {
                    setCommunauteActive(c.id);
                    chargerDepartements(c.id);
                }}
                >
                <Text style={[s.cultePillTexte, communauteActive === c.id && s.cultePillTexteActif]}>
                    {c.nom.replace("Culte du ", "")}
                </Text>
                </Pressable>
            ))}
            </View>
        )}

        {chargement ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />
        ) : (
            <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 100 }}>
            {departements.length === 0 && (
                <Text style={s.videTexte}>Aucun département. Créez le premier !</Text>
            )}

            <View style={s.grille}>
                {departements.map(dept => {
                const style = getDeptStyle(dept.nom);
                return (
                    <Pressable
                    key={dept.id}
                    style={s.deptCard}
                    onPress={() => ouvrirDetail(dept)}
                    >
                    {/* Icône colorée */}
                    <View style={[s.deptIconeBox, { backgroundColor: style.fond }]}>
                        <Ionicons name={style.icon as any} size={28} color={style.couleur} />
                    </View>

                    <Text style={s.deptNom} numberOfLines={2}>{dept.nom}</Text>

                    {/* Responsable */}
                    <View style={s.deptResponsableRow}>
                        <Ionicons
                        name={dept.responsable_nom ? "person-circle" : "person-circle-outline"}
                        size={14}
                        color={dept.responsable_nom ? style.couleur : "#CBD5E0"}
                        />
                        <Text style={[s.deptResponsableNom, !dept.responsable_nom && { color: "#CBD5E0" }]}>
                        {dept.responsable_nom ?? "Aucun responsable"}
                        </Text>
                    </View>

                    {/* Nombre de membres */}
                    <View style={[s.deptBadge, { backgroundColor: style.fond }]}>
                        <Ionicons name="people-outline" size={12} color={style.couleur} />
                        <Text style={[s.deptBadgeTexte, { color: style.couleur }]}>
                        voir membres
                        </Text>
                    </View>

                    {/* Chevron */}
                    <View style={s.deptChevron}>
                        <Ionicons name="chevron-forward" size={14} color="#CBD5E0" />
                    </View>
                    </Pressable>
                );
                })}
            </View>
            </ScrollView>
        )}

        {/* FAB */}
        <Pressable style={s.fab} onPress={() => ouvrirFormulaire()}>
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={s.fabTexte}>Nouveau département</Text>
        </Pressable>
        </SafeAreaView>
    );
    }

    const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F8F5F0" },

    // Grille
    grille: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    deptCard: {
        width: "47%", backgroundColor: "#fff", borderRadius: 16,
        padding: 14, borderWidth: 0.5, borderColor: "#E2E8F0",
        position: "relative",
    },
    deptIconeBox: {
        width: 52, height: 52, borderRadius: 14,
        alignItems: "center", justifyContent: "center",
        marginBottom: 10,
    },
    deptNom: { fontSize: 14, fontWeight: "700", color: "#1E293B", marginBottom: 8, lineHeight: 18 },
    deptResponsableRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
    deptResponsableNom: { fontSize: 11, color: "#64748B", flex: 1 },
    deptBadge: {
        flexDirection: "row", alignItems: "center", gap: 4,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99,
        alignSelf: "flex-start",
    },
    deptBadgeTexte: { fontSize: 11, fontWeight: "600" },
    deptChevron: {
        position: "absolute", top: 12, right: 12,
    },

    // Header détail
    deptHeader: {
        padding: 24, paddingBottom: 28,
        alignItems: "center",
    },
    deptHeaderIconeBox: {
        width: 70, height: 70, borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center", justifyContent: "center",
        marginBottom: 14,
    },
    deptHeaderNom: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 4 },
    deptHeaderCulte: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
    deptHeaderDesc: {
        fontSize: 13, color: "rgba(255,255,255,0.8)",
        marginTop: 10, textAlign: "center", lineHeight: 18,
    },

    // Section
    section: {
        backgroundColor: "#fff", borderRadius: 14, padding: 14,
        marginBottom: 12, borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    sectionTitre: { fontSize: 14, fontWeight: "700", color: "#1E293B" },

    // Responsable
    responsableCard: {
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: "#F8F5F0", borderRadius: 12, padding: 12,
    },
    responsableAvatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#07074C", alignItems: "center", justifyContent: "center",
    },
    responsableAvatarTexte: { color: "#fff", fontWeight: "700", fontSize: 18 },
    responsableNom: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
    responsableLabel: { fontSize: 12, color: "#64748B", marginTop: 2 },
    btnChanger: {
        backgroundColor: "#EEF2FF", paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 8, borderWidth: 0.5, borderColor: "#C7D2FE",
    },
    btnChangerTexte: { fontSize: 13, color: "#4F46E5", fontWeight: "700" },
    responsableVide: {
        flexDirection: "row", alignItems: "center", gap: 12,
        borderRadius: 12, padding: 12, borderWidth: 1,
        borderColor: "#E2E8F0", borderStyle: "dashed",
    },
    responsableVideIcone: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center",
    },
    responsableVideTexte: { fontSize: 14, color: "#94A3B8", fontWeight: "600" },

    // Stats
    statsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
    statCard: {
        flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 14,
        alignItems: "center", borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    statNombre: { fontSize: 28, fontWeight: "700" },
    statLabel: { fontSize: 11, color: "#64748B", marginTop: 4 },

    // Membres
    membreItem: {
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#F8FAFC",
    },
    membreAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    membreAvatarTexte: { fontWeight: "700", fontSize: 15 },
    membreNom: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
    membreTel: { fontSize: 12, color: "#64748B" },

    // Culte selector
    culteRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    culteRow2: {
        flexDirection: "row", gap: 10, padding: 12,
        backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0",
    },
    cultePill: {
        flex: 1, paddingVertical: 10, borderRadius: 10,
        borderWidth: 0.5, borderColor: "#E2E8F0",
        backgroundColor: "#F8F5F0", alignItems: "center",
    },
    cultePillActif: { backgroundColor: "#07074C", borderColor: "#07074C" },
    cultePillTexte: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
    cultePillTexteActif: { color: "#fff" },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalCard: {
        backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 20, maxHeight: "70%",
    },
    modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
    modalTitre: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
    searchInput: {
        backgroundColor: "#F8F5F0", borderRadius: 10, padding: 12,
        fontSize: 14, color: "#1E293B", marginBottom: 10,
        borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    respItem: {
        flexDirection: "row", alignItems: "center", gap: 10,
        padding: 12, borderRadius: 10, marginBottom: 4,
        backgroundColor: "#F8F5F0",
    },
    respItemActif: { backgroundColor: "#EEF2FF", borderWidth: 1, borderColor: "#C7D2FE" },
    respAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    respAvatarTexte: { color: "#fff", fontWeight: "700", fontSize: 16 },
    respNom: { fontSize: 14, fontWeight: "600", color: "#1E293B", flex: 1 },
    respRole: { fontSize: 12, color: "#64748B", marginTop: 2 },

    // Formulaire
    formTitre: { fontSize: 20, fontWeight: "700", color: "#1E293B", marginBottom: 20 },
    champLabel: { fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 6 },
    champInput: {
        backgroundColor: "#fff", borderRadius: 12, padding: 14,
        fontSize: 15, color: "#1E293B", marginBottom: 16,
        borderWidth: 0.5, borderColor: "#E2E8F0",
    },

    // Boutons
    btnPrimaire: {
        backgroundColor: "#07074C", borderRadius: 12, padding: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10,
    },
    btnPrimaireTexte: { color: "#fff", fontWeight: "700", fontSize: 15 },
    btnSecondaire: {
        backgroundColor: "#EEF2FF", borderRadius: 12, padding: 14,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        borderWidth: 0.5, borderColor: "#C7D2FE", marginBottom: 10,
    },
    btnSecondaireTexte: { color: "#07074C", fontWeight: "700", fontSize: 15 },
    btnDanger: {
        backgroundColor: "#FEF2F2", borderRadius: 12, padding: 14,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        borderWidth: 0.5, borderColor: "#FECACA",
    },
    btnDangerTexte: { color: "#EF4444", fontWeight: "700", fontSize: 15 },

    // FAB
    fab: {
        position: "absolute", bottom: 24, right: 16,
        backgroundColor: "#07074C", borderRadius: 14,
        paddingVertical: 14, paddingHorizontal: 20, elevation: 5,
        flexDirection: "row", alignItems: "center", gap: 8,
    },
    fabTexte: { color: "#fff", fontWeight: "700", fontSize: 15 },

    videTexte: { color: "#94A3B8", fontStyle: "italic", textAlign: "center", marginTop: 30 },
    });