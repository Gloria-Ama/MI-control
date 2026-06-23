    import { StyleSheet } from "react-native";

    const C = {
    primaire: "#07074C",
    fond: "#F8F5F0",
    carte: "#FFFFFF",
    texte: "#1E293B",
    texteSec: "#64748B",
    bordure: "#E2E8F0",
    };

    export const ns = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.fond },

    header: {
        backgroundColor: C.carte, padding: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        borderBottomWidth: 0.5, borderBottomColor: C.bordure,
    },
    headerTitre: { fontSize: 18, fontWeight: "700", color: C.texte },
    headerActions: { flexDirection: "row", gap: 10 },
    btnToutLire: {
        paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8,
        backgroundColor: "#EEF2FF",
    },
    btnToutLireTexte: { fontSize: 12, color: "#4F46E5", fontWeight: "700" },
    btnGenerer: {
        paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8,
        backgroundColor: C.primaire,
    },
    btnGenererTexte: { fontSize: 12, color: "#fff", fontWeight: "700" },

    compteur: {
        fontSize: 12, color: C.texteSec,
        paddingHorizontal: 16, paddingVertical: 8,
    },

    notifCard: {
        backgroundColor: C.carte, padding: 14,
        flexDirection: "row", gap: 12,
        borderBottomWidth: 0.5, borderBottomColor: C.bordure,
    },
    notifCardNonLue: { backgroundColor: "#F0F4FF" },

    iconeBox: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    icone: { fontSize: 22 },

    notifContenu: { flex: 1 },
    notifTitre: { fontSize: 14, fontWeight: "700", color: C.texte },
    notifTitreNonLu: { color: C.primaire },
    notifMessage: { fontSize: 13, color: C.texteSec, marginTop: 3, lineHeight: 18 },
    notifDate: { fontSize: 11, color: C.texteSec, marginTop: 6 },

    pointNonLu: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: "#4F46E5", marginTop: 6, flexShrink: 0,
    },

    videTexte: {
        color: C.texteSec, fontStyle: "italic",
        textAlign: "center", marginTop: 60, paddingHorizontal: 30,
        lineHeight: 22,
    },
    videIcone: { fontSize: 48, textAlign: "center", marginTop: 40 },
    });