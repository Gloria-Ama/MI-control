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

    export const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.fond },

    searchBar: {
        backgroundColor: C.carte, padding: 12,
        borderBottomWidth: 0.5, borderBottomColor: C.bordure,
    },
    searchInput: {
        backgroundColor: C.fond, borderRadius: 12, padding: 12,
        fontSize: 14, color: C.texte, borderWidth: 0.5, borderColor: C.bordure,
    },

    compteLabel: { fontSize: 12, color: C.texteSec, marginBottom: 10 },
    videTexte: {
        color: C.texteSec, fontStyle: "italic",
        textAlign: "center", marginTop: 30,
    },

    membreCard: {
        backgroundColor: C.carte, borderRadius: 14, padding: 14,
        flexDirection: "row", alignItems: "center", gap: 12,
        marginBottom: 10, borderWidth: 0.5, borderColor: C.bordure,
    },
    avatar: {
        width: 46, height: 46, borderRadius: 23,
        alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    avatarText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    membreNom: { fontSize: 15, fontWeight: "700", color: C.texte },
    membreSub: { fontSize: 12, color: C.texteSec, marginTop: 2 },
    alerte: { fontSize: 11, color: C.danger, marginTop: 3, fontWeight: "600" },

    statutBadge: {
        paddingVertical: 3, paddingHorizontal: 9, borderRadius: 99,
        borderWidth: 0.5, borderColor: C.bordure, backgroundColor: C.fond,
    },
    statutTexte: { fontSize: 11, fontWeight: "600", color: C.texteSec },
    badgeActif: { backgroundColor: C.succesFond, borderColor: "#86EFAC" },
    badgeActifTexte: { color: "#065F46" },
    badgeDanger: { backgroundColor: C.dangerFond, borderColor: "#FECACA" },
    badgeDangerTexte: { color: "#991B1B" },
    badgeNeutre: { backgroundColor: C.fond, borderColor: C.bordure },
    badgeNeutreTexte: { color: C.texteSec },

    fab: {
        position: "absolute", bottom: 24, right: 20,
        backgroundColor: C.primaire, borderRadius: 14,
        paddingVertical: 14, paddingHorizontal: 24, elevation: 5,
    },
    fabText: { color: "#fff", fontWeight: "700", fontSize: 15 },

    detailHeader: {
        backgroundColor: C.primaire, padding: 20,
        alignItems: "center", paddingBottom: 28,
    },
    retourBtn: { alignSelf: "flex-start", marginBottom: 14 },
    retourText: { color: "#94A3B8", fontSize: 15 },
    detailAvatar: {
        width: 68, height: 68, borderRadius: 34,
        alignItems: "center", justifyContent: "center", marginBottom: 12,
    },
    detailAvatarText: { color: "#fff", fontWeight: "700", fontSize: 26 },
    detailNom: { color: "#fff", fontSize: 20, fontWeight: "700" },
    detailSub: { color: "#94A3B8", fontSize: 13, marginTop: 4 },

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
        paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: "#F8FAFC",
    },
    infoIcone: { fontSize: 14, width: 26 },
    infoLabel: { fontSize: 12, color: C.texteSec, width: 90 },
    infoValeur: { flex: 1, fontSize: 13, color: C.texte, fontWeight: "500" },

    presenceDot: { width: 22, height: 22, borderRadius: 6 },
    presentDot: { backgroundColor: "#D1FAE5" },
    absentDot: { backgroundColor: "#FEE2E2" },
    alerteBox: {
        backgroundColor: C.warningFond, borderRadius: 8, padding: 10,
        marginTop: 8, borderWidth: 0.5, borderColor: "#FCD34D",
    },
    alerteBoxText: { fontSize: 12, color: "#92400E", fontWeight: "600" },

    btnAction: {
        flex: 1, borderRadius: 12, padding: 14, alignItems: "center",
    },
    btnActionText: { color: "#fff", fontWeight: "700", fontSize: 14 },

    formTitre: {
        fontSize: 22, fontWeight: "700", color: C.texte, marginBottom: 22,
    },
    champLabel: {
        fontSize: 13, fontWeight: "600", color: C.texte, marginBottom: 6,
    },
    champInput: {
        backgroundColor: C.carte, borderRadius: 12, padding: 14,
        fontSize: 15, color: C.texte, marginBottom: 16,
        borderWidth: 0.5, borderColor: C.bordure,
    },
    champInputMulti: { minHeight: 90, textAlignVertical: "top" },
    champInputErreur: { borderColor: C.danger, borderWidth: 1.5 },
    champErreur: {
        fontSize: 12, color: C.danger, marginTop: -10, marginBottom: 12,
    },

    choixRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    choixBtn: {
        paddingVertical: 9, paddingHorizontal: 16, borderRadius: 99,
        borderWidth: 0.5, borderColor: C.bordure, backgroundColor: C.carte,
    },
    choixBtnActif: { backgroundColor: C.primaire, borderColor: C.primaire },
    choixBtnText: { fontSize: 13, color: C.texte },
    choixBtnTextActif: { color: "#fff", fontWeight: "700" },

    // Département dropdown
    deptSelector: {
        backgroundColor: C.carte, borderRadius: 12, padding: 14,
        borderWidth: 0.5, borderColor: C.bordure, marginBottom: 8,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    deptSelectorTexte: { fontSize: 15, color: C.texte, flex: 1 },
    deptSelectorChevron: { fontSize: 12, color: C.texteSec },
    deptListe: {
        backgroundColor: C.carte, borderRadius: 12,
        borderWidth: 0.5, borderColor: C.bordure,
        marginBottom: 16, overflow: "hidden",
    },
    deptGroupHeader: {
        backgroundColor: "#F1F5F9",
        paddingVertical: 8, paddingHorizontal: 14,
        borderBottomWidth: 0.5, borderBottomColor: C.bordure,
    },
    deptGroupHeaderTexte: {
        fontSize: 12, fontWeight: "700", color: "#475569",
        textTransform: "uppercase", letterSpacing: 0.5,
    },
    deptOption: {
        padding: 14, borderBottomWidth: 0.5, borderBottomColor: C.bordure,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    deptOptionActif: { backgroundColor: "#EEF2FF" },
    deptOptionTexte: { fontSize: 14, color: C.texte },
    deptOptionTexteActif: { fontWeight: "700", color: "#4F46E5" },
    deptCheck: { fontSize: 16, color: "#4F46E5", fontWeight: "700" },

    btnPrimaire: {
        backgroundColor: C.primaire, borderRadius: 12,
        padding: 16, alignItems: "center", marginTop: 8,
    },
    btnPrimaireText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    });