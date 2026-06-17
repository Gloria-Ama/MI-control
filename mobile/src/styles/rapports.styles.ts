    import { StyleSheet } from "react-native";

    const C = {
    primaire: "#07074C",
    fond: "#F8F5F0",
    carte: "#FFFFFF",
    texte: "#1E293B",
    texteSec: "#64748B",
    bordure: "#E2E8F0",
    danger: "#EF4444",
    dangerFond: "#FEF2F2",
    succes: "#065F46",
    };

    export const r = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.fond },

    onglet: {
        paddingVertical: 14, paddingHorizontal: 12, marginRight: 4,
        borderBottomWidth: 2, borderBottomColor: "transparent",
    },
    ongletActif: { borderBottomColor: C.primaire },
    ongletTexte: { fontSize: 13, color: C.texteSec, fontWeight: "500" },
    ongletTexteActif: { color: C.primaire, fontWeight: "700" },

    section: {
        backgroundColor: C.carte, borderRadius: 14, padding: 14,
        marginBottom: 14, borderWidth: 0.5, borderColor: C.bordure,
    },
    sectionTitre: {
        fontSize: 15, fontWeight: "700", color: C.texte, marginBottom: 12,
    },

    statGrid: {
        flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14,
    },
    statBox: {
        flex: 1, minWidth: "45%", backgroundColor: C.carte, borderRadius: 12,
        padding: 14, alignItems: "center", borderWidth: 0.5, borderColor: C.bordure,
    },
    statIcone: { fontSize: 22, marginBottom: 6 },
    statValeur: { fontSize: 22, fontWeight: "700", color: C.primaire },
    statLabel: { fontSize: 11, color: C.texteSec, marginTop: 4, textAlign: "center" },

    barreContainer: {
        flex: 1, height: 8, backgroundColor: C.bordure,
        borderRadius: 4, overflow: "hidden", marginHorizontal: 8,
    },
    barreFill: { height: 8, borderRadius: 4 },
    barreGrandeContainer: {
        height: 12, backgroundColor: C.bordure,
        borderRadius: 6, overflow: "hidden", marginTop: 10,
    },
    barreGrandeFill: { height: 12, borderRadius: 6 },

    sexeRow: {
        flexDirection: "row", alignItems: "center", marginBottom: 10,
    },
    sexeLabel: { fontSize: 13, color: C.texte, width: 60 },
    sexeVal: { fontSize: 12, color: C.texteSec, width: 70, textAlign: "right" },

    deptRow: {
        flexDirection: "row", alignItems: "center", marginBottom: 10,
    },
    deptNom: { fontSize: 12, color: C.texte, width: 100 },
    deptVal: { fontSize: 13, fontWeight: "700", color: C.primaire, width: 30, textAlign: "right" },

    historiqueRow: {
        flexDirection: "row", alignItems: "center", marginBottom: 8,
    },
    historiqueDate: { fontSize: 12, color: C.texteSec, width: 90 },
    historiqueTaux: { fontSize: 13, fontWeight: "700", width: 40, textAlign: "right" },

    alerteBox: {
        backgroundColor: C.dangerFond, borderRadius: 12, padding: 14,
        borderWidth: 0.5, borderColor: "#FECACA", marginBottom: 14,
    },
    alerteTexte: { fontSize: 14, color: "#991B1B", fontWeight: "600" },

    absentCard: {
        backgroundColor: C.carte, borderRadius: 12, padding: 12,
        flexDirection: "row", alignItems: "center", gap: 10,
        marginBottom: 8, borderWidth: 0.5, borderColor: C.bordure,
    },
    absentAvatar: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    absentAvatarTexte: { color: "#fff", fontWeight: "700", fontSize: 13 },
    absentNom: { fontSize: 14, fontWeight: "700", color: C.texte },
    absentSub: { fontSize: 12, color: C.texteSec, marginTop: 2 },
    absentBadge: {
        backgroundColor: C.dangerFond, borderRadius: 8, padding: 6,
        borderWidth: 0.5, borderColor: "#FECACA",
    },
    absentBadgeTexte: { fontSize: 11, color: "#991B1B", fontWeight: "700" },

    videTexte: {
        color: "#94A3B8", fontStyle: "italic",
        textAlign: "center", marginTop: 20,
    },
    });