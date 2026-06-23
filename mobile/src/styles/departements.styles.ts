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
    succesFond: "#F0FDF4",
    };

    export const d = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.fond },

    culteRow: {
        flexDirection: "row", gap: 8, padding: 12,
        backgroundColor: C.carte,
        borderBottomWidth: 0.5, borderBottomColor: C.bordure,
    },
    cultePill: {
        flex: 1, paddingVertical: 10, borderRadius: 10,
        borderWidth: 0.5, borderColor: C.bordure,
        backgroundColor: C.carte, alignItems: "center",
    },
    cultePillActif: { backgroundColor: C.primaire, borderColor: C.primaire },
    cultePillTexte: { fontSize: 14, fontWeight: "600", color: C.texte },
    cultePillTexteActif: { color: "#fff" },

    resumeRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    resumeCard: {
        flex: 1, backgroundColor: C.carte, borderRadius: 12, padding: 12,
        alignItems: "center", borderWidth: 0.5, borderColor: C.bordure,
    },
    resumeNombre: { fontSize: 22, fontWeight: "700", color: C.primaire },
    resumeLabel: { fontSize: 11, color: C.texteSec, marginTop: 3, textAlign: "center" },

    videTexte: {
        color: "#94A3B8", fontStyle: "italic",
        textAlign: "center", marginTop: 20, padding: 16,
    },

    deptCard: {
        backgroundColor: C.carte, borderRadius: 14,
        marginBottom: 10, borderWidth: 0.5, borderColor: C.bordure,
        overflow: "hidden",
    },
    deptHeader: {
        flexDirection: "row", alignItems: "center",
        padding: 14, gap: 12,
    },
    deptIconeBox: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center",
    },
    deptIcone: { fontSize: 22 },
    deptInfo: { flex: 1 },
    deptNom: { fontSize: 15, fontWeight: "700", color: C.texte },
    deptSub: { fontSize: 12, color: C.texteSec, marginTop: 2 },
    progressBar: {
        height: 4, backgroundColor: C.bordure, borderRadius: 2,
        marginTop: 6, overflow: "hidden",
    },
    progressFill: { height: 4, backgroundColor: C.primaire, borderRadius: 2 },
    deptChevron: { fontSize: 12, color: "#94A3B8" },

    membresList: { borderTopWidth: 0.5, borderTopColor: C.bordure },
    membreRow: {
        flexDirection: "row", alignItems: "center", gap: 10,
        padding: 12, borderBottomWidth: 0.5, borderBottomColor: "#F8FAFC",
    },
    membreAvatar: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    membreAvatarTexte: { color: "#fff", fontWeight: "700", fontSize: 12 },
    membreInfo: { flex: 1 },
    membreNom: { fontSize: 13, fontWeight: "600", color: C.texte },
    membreSub: { fontSize: 11, color: C.texteSec, marginTop: 1 },

    statutBadge: {
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
    },
    statutTexte: { fontSize: 11, fontWeight: "700" },
    statutActif: { backgroundColor: C.succesFond },
    statutActifTexte: { color: "#065F46" },
    statutInactif: { backgroundColor: C.dangerFond },
    statutInactifTexte: { color: "#991B1B" },
    statutPause: { backgroundColor: "#FFFBEB" },
    statutPauseTexte: { color: "#633806" },

    deptStats: {
        flexDirection: "row",
        borderTopWidth: 0.5, borderTopColor: C.bordure,
        backgroundColor: "#F8FAFC",
    },
    deptStatItem: {
        flex: 1, padding: 10, alignItems: "center",
        borderRightWidth: 0.5, borderRightColor: C.bordure,
    },
    deptStatNombre: { fontSize: 16, fontWeight: "700", color: C.primaire },
    deptStatLabel: { fontSize: 10, color: C.texteSec, marginTop: 2 },
    });