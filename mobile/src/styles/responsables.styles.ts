    import { StyleSheet } from "react-native";

    const C = {
    primaire: "#07074C",
    accent: "#4F46E5",
    fond: "#F8F5F0",
    carte: "#FFFFFF",
    texte: "#1E293B",
    texteSec: "#64748B",
    bordure: "#E2E8F0",
    danger: "#EF4444",
    dangerFond: "#FEF2F2",
    succesFond: "#F0FDF4",
    warningFond: "#FFFBEB",
    };

    export const rs = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.fond },

    // Liste
    searchBar: {
        backgroundColor: C.carte, padding: 12,
        borderBottomWidth: 0.5, borderBottomColor: C.bordure,
    },
    searchInput: {
        backgroundColor: C.fond, borderRadius: 12, padding: 12,
        fontSize: 14, color: C.texte, borderWidth: 0.5, borderColor: C.bordure,
    },

    compteLabel: { fontSize: 12, color: C.texteSec, marginBottom: 10 },

    card: {
        backgroundColor: C.carte, borderRadius: 14, padding: 14,
        marginBottom: 10, borderWidth: 0.5, borderColor: C.bordure,
        flexDirection: "row", alignItems: "center", gap: 12,
    },
    avatar: {
        width: 48, height: 48, borderRadius: 24,
        alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    avatarTexte: { color: "#fff", fontWeight: "700", fontSize: 16 },
    cardInfo: { flex: 1 },
    cardNom: { fontSize: 15, fontWeight: "700", color: C.texte },
    cardRole: { fontSize: 12, color: C.texteSec, marginTop: 2 },
    cardCulte: { fontSize: 12, color: C.accent, marginTop: 2 },

    badgeActif: {
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
        backgroundColor: C.succesFond, borderWidth: 0.5, borderColor: "#86EFAC",
    },
    badgeActifTexte: { fontSize: 11, fontWeight: "700", color: "#065F46" },
    badgeInactif: {
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
        backgroundColor: C.dangerFond, borderWidth: 0.5, borderColor: "#FECACA",
    },
    badgeInactifTexte: { fontSize: 11, fontWeight: "700", color: "#991B1B" },

    fab: {
        position: "absolute", bottom: 24, right: 20,
        backgroundColor: C.primaire, borderRadius: 14,
        paddingVertical: 14, paddingHorizontal: 24, elevation: 5,
    },
    fabTexte: { color: "#fff", fontWeight: "700", fontSize: 15 },

    videTexte: {
        color: C.texteSec, fontStyle: "italic",
        textAlign: "center", marginTop: 30,
    },

    // Détail
    detailHeader: {
        backgroundColor: C.primaire, padding: 20,
        alignItems: "center", paddingBottom: 28,
    },
    retourBtn: { alignSelf: "flex-start", marginBottom: 14 },
    retourText: { color: "#94A3B8", fontSize: 15 },
    detailAvatar: {
        width: 72, height: 72, borderRadius: 36,
        alignItems: "center", justifyContent: "center", marginBottom: 12,
    },
    detailAvatarTexte: { color: "#fff", fontWeight: "700", fontSize: 28 },
    detailNom: { color: "#fff", fontSize: 20, fontWeight: "700" },
    detailRole: { color: "#94A3B8", fontSize: 13, marginTop: 4 },

    section: {
        backgroundColor: C.carte, borderRadius: 14, padding: 14,
        marginBottom: 12, borderWidth: 0.5, borderColor: C.bordure,
    },
    sectionTitre: {
        fontSize: 11, fontWeight: "700", color: C.texteSec,
        textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10,
    },
    infoRow: {
        flexDirection: "row", alignItems: "center",
        paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#F8FAFC",
    },
    infoIcone: { fontSize: 14, width: 26 },
    infoLabel: { fontSize: 12, color: C.texteSec, width: 100 },
    infoValeur: { flex: 1, fontSize: 13, color: C.texte, fontWeight: "500" },

    btnAction: {
        flex: 1, borderRadius: 12, padding: 13, alignItems: "center",
    },
    btnActionTexte: { color: "#fff", fontWeight: "700", fontSize: 14 },
    actionsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },

    // Formulaire
    formTitre: { fontSize: 22, fontWeight: "700", color: C.texte, marginBottom: 22 },
    champLabel: { fontSize: 13, fontWeight: "600", color: C.texte, marginBottom: 6 },
    champInput: {
        backgroundColor: C.carte, borderRadius: 12, padding: 14,
        fontSize: 15, color: C.texte, marginBottom: 16,
        borderWidth: 0.5, borderColor: C.bordure,
    },
    champInputErreur: { borderColor: C.danger, borderWidth: 1.5 },
    champErreur: { fontSize: 12, color: C.danger, marginTop: -10, marginBottom: 12 },

    choixRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    choixBtn: {
        paddingVertical: 9, paddingHorizontal: 14, borderRadius: 99,
        borderWidth: 0.5, borderColor: C.bordure, backgroundColor: C.carte,
    },
    choixBtnActif: { backgroundColor: C.primaire, borderColor: C.primaire },
    choixBtnTexte: { fontSize: 13, color: C.texte },
    choixBtnTexteActif: { color: "#fff", fontWeight: "700" },

    deptSelector: {
        backgroundColor: C.carte, borderRadius: 12, padding: 14,
        borderWidth: 0.5, borderColor: C.bordure, marginBottom: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    deptSelectorTexte: { fontSize: 15, color: C.texte, flex: 1 },
    deptSelectorChevron: { fontSize: 12, color: C.texteSec },
    deptListe: {
        backgroundColor: C.carte, borderRadius: 12,
        borderWidth: 0.5, borderColor: C.bordure,
        marginBottom: 16, overflow: "hidden",
    },
    deptOption: {
        padding: 14, borderBottomWidth: 0.5, borderBottomColor: C.bordure,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    deptOptionActif: { backgroundColor: "#EEF2FF" },
    deptOptionTexte: { fontSize: 14, color: C.texte },
    deptOptionTexteActif: { fontWeight: "700", color: C.accent },
    deptCheck: { fontSize: 16, color: C.accent, fontWeight: "700" },

    btnPrimaire: {
        backgroundColor: C.primaire, borderRadius: 12,
        padding: 16, alignItems: "center", marginTop: 8,
    },
    btnPrimaireTexte: { color: "#fff", fontWeight: "700", fontSize: 16 },

    // Alerte mdp
    alerteMdp: {
        backgroundColor: C.warningFond, borderRadius: 10, padding: 12,
        borderWidth: 0.5, borderColor: "#FCD34D", marginBottom: 16,
    },
    alerteMdpTexte: { fontSize: 13, color: "#633806", fontWeight: "600" },
    });