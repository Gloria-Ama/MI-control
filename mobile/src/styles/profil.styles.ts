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
    warningFond: "#FFFBEB",
    };

    export const ps = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.fond },

    // Header profil
    header: {
        backgroundColor: C.primaire,
        padding: 24, paddingBottom: 32,
        alignItems: "center",
    },
    avatarGrand: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: "#4F46E5",
        alignItems: "center", justifyContent: "center",
        marginBottom: 12, borderWidth: 3, borderColor: "rgba(255,255,255,0.3)",
    },
    avatarTexte: { color: "#fff", fontSize: 30, fontWeight: "700" },
    nom: { color: "#fff", fontSize: 20, fontWeight: "700" },
    role: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 },
    culte: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 },

    alerteMdp: {
        backgroundColor: C.warningFond, borderRadius: 10, padding: 12,
        marginHorizontal: 16, marginTop: 12,
        borderWidth: 0.5, borderColor: "#FCD34D",
        flexDirection: "row", alignItems: "center", gap: 8,
    },
    alerteMdpTexte: { fontSize: 13, color: "#633806", fontWeight: "600", flex: 1 },

    // Sections
    section: {
        backgroundColor: C.carte, borderRadius: 14, padding: 14,
        marginHorizontal: 16, marginTop: 14,
        borderWidth: 0.5, borderColor: C.bordure,
    },
    sectionTitre: {
        fontSize: 11, fontWeight: "700", color: C.texteSec,
        textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12,
    },

    infoRow: {
        flexDirection: "row", alignItems: "center",
        paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#F8FAFC",
    },
    infoIcone: { fontSize: 16, width: 28 },
    infoLabel: { fontSize: 12, color: C.texteSec, width: 90 },
    infoValeur: { flex: 1, fontSize: 14, color: C.texte, fontWeight: "500" },

    // Formulaire
    champLabel: { fontSize: 13, fontWeight: "600", color: C.texte, marginBottom: 6, marginTop: 4 },
    champInput: {
        backgroundColor: C.fond, borderRadius: 10, padding: 12,
        fontSize: 14, color: C.texte, marginBottom: 4,
        borderWidth: 0.5, borderColor: C.bordure,
    },
    champInputErreur: { borderColor: C.danger, borderWidth: 1.5 },
    champErreur: { fontSize: 12, color: C.danger, marginBottom: 8 },
    champSucces: { fontSize: 12, color: "#065F46", marginBottom: 8 },

    // Boutons
    btnPrimaire: {
        backgroundColor: C.primaire, borderRadius: 12,
        padding: 14, alignItems: "center", marginTop: 8,
    },
    btnPrimaireTexte: { color: "#fff", fontWeight: "700", fontSize: 15 },
    btnSecondaire: {
        backgroundColor: C.fond, borderRadius: 12, padding: 14,
        alignItems: "center", marginTop: 8,
        borderWidth: 0.5, borderColor: C.bordure,
    },
    btnSecondaireTexte: { color: C.texte, fontWeight: "600", fontSize: 15 },
    btnDanger: {
        backgroundColor: C.dangerFond, borderRadius: 12, padding: 14,
        alignItems: "center", marginTop: 8,
        borderWidth: 0.5, borderColor: "#FECACA",
    },
    btnDangerTexte: { color: C.danger, fontWeight: "700", fontSize: 15 },

    // Stats
    statsRow: { flexDirection: "row", gap: 10 },
    statBox: {
        flex: 1, backgroundColor: C.fond, borderRadius: 10,
        padding: 12, alignItems: "center",
        borderWidth: 0.5, borderColor: C.bordure,
    },
    statValeur: { fontSize: 20, fontWeight: "700", color: C.primaire },
    statLabel: { fontSize: 11, color: C.texteSec, marginTop: 2, textAlign: "center" },

    badgeRole: {
        alignSelf: "center", paddingHorizontal: 12, paddingVertical: 4,
        borderRadius: 99, backgroundColor: "rgba(255,255,255,0.2)",
        marginTop: 8,
    },
    badgeRoleTexte: { color: "#fff", fontSize: 12, fontWeight: "700" },
    });