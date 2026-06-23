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

    const CATEGORIE_COULEURS: Record<string, string> = {
    sante:       "#EF4444",
    famille:     "#F59E0B",
    spirituel:   "#4F46E5",
    financier:   "#10B981",
    integration: "#06B6D4",
    conflit:     "#EF4444",
    autre:       "#64748B",
    };

    const STATUT_COULEURS: Record<string, { fond: string; texte: string }> = {
    ouvert:   { fond: "#FEF2F2", texte: "#991B1B" },
    en_cours: { fond: "#FFFBEB", texte: "#633806" },
    resolu:   { fond: "#F0FDF4", texte: "#065F46" },
    archive:  { fond: "#F1F5F9", texte: "#475569" },
    };

    export { CATEGORIE_COULEURS, STATUT_COULEURS };

    export const ps2 = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.fond },

    // Filtres
    filtresScroll: {
        backgroundColor: C.carte,
        borderBottomWidth: 0.5, borderBottomColor: C.bordure,
        paddingVertical: 10, paddingHorizontal: 12,
    },
    filtrePill: {
        height: 32, paddingHorizontal: 14, borderRadius: 99,
        borderWidth: 0.5, borderColor: C.bordure,
        backgroundColor: C.carte, justifyContent: "center", marginRight: 8,
    },
    filtrePillActif: { backgroundColor: C.primaire, borderColor: C.primaire },
    filtrePillTexte: { fontSize: 13, color: C.texte },
    filtrePillTexteActif: { color: "#fff", fontWeight: "700" },

    // Carte suivi
    suiviCard: {
        backgroundColor: C.carte, borderRadius: 14, padding: 14,
        marginBottom: 10, borderWidth: 0.5, borderColor: C.bordure,
        borderLeftWidth: 4,
    },
    suiviHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
    suiviIconeBox: {
        width: 36, height: 36, borderRadius: 8,
        alignItems: "center", justifyContent: "center",
    },
    suiviTitre: { fontSize: 14, fontWeight: "700", color: C.texte, flex: 1 },
    suiviMembre: { fontSize: 13, color: C.primaire, fontWeight: "600", marginTop: 2 },
    suiviNotes: { fontSize: 13, color: C.texteSec, lineHeight: 18, marginBottom: 8 },

    suiviMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 },
    statutBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
    statutTexte: { fontSize: 11, fontWeight: "700" },
    categorieBadge: {
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
        backgroundColor: "#F1F5F9",
    },
    categorieTexte: { fontSize: 11, color: C.texteSec },
    dateTexte: { fontSize: 11, color: C.texteSec },

    suiviActions: { flexDirection: "row", gap: 8, marginTop: 10 },
    btnAction: {
        flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center",
        borderWidth: 0.5,
    },
    btnActionTexte: { fontSize: 12, fontWeight: "700" },

    alerteProchain: {
        backgroundColor: "#FFFBEB", borderRadius: 8, padding: 8,
        marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6,
        borderWidth: 0.5, borderColor: "#FCD34D",
    },
    alerteProchainTexte: { fontSize: 12, color: "#633806", fontWeight: "600" },

    fab: {
        position: "absolute", bottom: 24, right: 20,
        backgroundColor: C.primaire, borderRadius: 14,
        paddingVertical: 14, paddingHorizontal: 20, elevation: 5,
        flexDirection: "row", alignItems: "center", gap: 8,
    },
    fabTexte: { color: "#fff", fontWeight: "700", fontSize: 15 },

    videTexte: { color: C.texteSec, fontStyle: "italic", textAlign: "center", marginTop: 40 },

    // Formulaire
    formContainer: { flex: 1, padding: 16 },
    formTitre: { fontSize: 20, fontWeight: "700", color: C.texte, marginBottom: 20 },
    champLabel: { fontSize: 13, fontWeight: "600", color: C.texte, marginBottom: 6 },
    champInput: {
        backgroundColor: C.carte, borderRadius: 12, padding: 14,
        fontSize: 15, color: C.texte, marginBottom: 16,
        borderWidth: 0.5, borderColor: C.bordure,
    },
    champInputMulti: { minHeight: 100, textAlignVertical: "top" },
    choixRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    choixBtn: {
        paddingVertical: 8, paddingHorizontal: 14, borderRadius: 99,
        borderWidth: 0.5, borderColor: C.bordure, backgroundColor: C.carte,
    },
    choixBtnActif: { backgroundColor: C.primaire, borderColor: C.primaire },
    choixBtnTexte: { fontSize: 13, color: C.texte },
    choixBtnTexteActif: { color: "#fff", fontWeight: "700" },
    btnPrimaire: {
        backgroundColor: C.primaire, borderRadius: 12,
        padding: 16, alignItems: "center", marginTop: 8,
    },
    btnPrimaireTexte: { color: "#fff", fontWeight: "700", fontSize: 16 },

    confidentialBox: {
        backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12,
        flexDirection: "row", alignItems: "center", gap: 10,
        borderWidth: 0.5, borderColor: "#FECACA", marginBottom: 16,
    },
    confidentialTexte: { fontSize: 13, color: "#991B1B", fontWeight: "600", flex: 1 },
    });