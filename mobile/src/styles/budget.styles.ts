    import { StyleSheet } from "react-native";

    const C = {
    primaire: "#07074C",
    fond: "#F8F5F0",
    carte: "#FFFFFF",
    texte: "#1E293B",
    texteSec: "#64748B",
    bordure: "#E2E8F0",
    succes: "#065F46",
    succesFond: "#F0FDF4",
    danger: "#EF4444",
    dangerFond: "#FEF2F2",
    warningFond: "#FFFBEB",
    };

    export const bs = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.fond },

    // Header budget
    budgetHeader: {
        backgroundColor: C.primaire, padding: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    anneeSelector: { flexDirection: "row", alignItems: "center", gap: 12 },
    anneeBouton: { padding: 6 },
    anneeTexte: { color: "#fff", fontSize: 20, fontWeight: "700", minWidth: 60, textAlign: "center" },
    btnNouveauBudget: {
        backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8,
        paddingVertical: 6, paddingHorizontal: 12,
        flexDirection: "row", alignItems: "center", gap: 4,
    },
    btnNouveauBudgetTexte: { color: "#fff", fontSize: 12, fontWeight: "700" },

    // Résumé
    resumeCard: {
        backgroundColor: C.carte, margin: 14, borderRadius: 14,
        padding: 14, borderWidth: 0.5, borderColor: C.bordure,
    },
    resumeTitre: { fontSize: 15, fontWeight: "700", color: C.texte, marginBottom: 12 },
    resumeRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
    resumeBloc: {
        flex: 1, backgroundColor: C.fond, borderRadius: 10, padding: 12, alignItems: "center",
    },
    resumeBlocLabel: { fontSize: 11, color: C.texteSec, marginBottom: 4 },
    resumeBlocValeur: { fontSize: 18, fontWeight: "700", color: C.primaire },
    barreContainer: {
        height: 10, backgroundColor: C.bordure, borderRadius: 5,
        overflow: "hidden", marginTop: 8,
    },
    barreFill: { height: 10, borderRadius: 5 },
    resumeTaux: { fontSize: 12, color: C.texteSec, marginTop: 4, textAlign: "right" },

    // Lignes budget
    sectionTitre: {
        fontSize: 14, fontWeight: "700", color: C.texte,
        paddingHorizontal: 14, marginBottom: 8, marginTop: 4,
    },
    ligneCard: {
        backgroundColor: C.carte, marginHorizontal: 14, marginBottom: 8,
        borderRadius: 12, padding: 12, borderWidth: 0.5, borderColor: C.bordure,
    },
    ligneHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    ligneIconeBox: {
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center",
    },
    ligneDescription: { fontSize: 14, fontWeight: "600", color: C.texte, flex: 1 },
    ligneDept: { fontSize: 11, color: "#4F46E5", marginTop: 1 },
    ligneChiffres: {
        flexDirection: "row", justifyContent: "space-between", marginBottom: 6,
    },
    ligneChiffreBloc: { alignItems: "center" },
    ligneChiffreLabel: { fontSize: 10, color: C.texteSec },
    ligneChiffreValeur: { fontSize: 14, fontWeight: "700", color: C.texte },
    ligneEcart: { fontSize: 12, fontWeight: "700" },
    ligneBarre: { height: 6, backgroundColor: C.bordure, borderRadius: 3, overflow: "hidden" },
    ligneBarreFill: { height: 6, borderRadius: 3 },
    ligneActions: { flexDirection: "row", gap: 8, marginTop: 8 },
    btnLigneAction: {
        flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: "center",
        borderWidth: 0.5,
    },

    fab: {
        position: "absolute", bottom: 24, right: 20,
        backgroundColor: C.primaire, borderRadius: 14,
        paddingVertical: 14, paddingHorizontal: 20, elevation: 5,
        flexDirection: "row", alignItems: "center", gap: 8,
    },
    fabTexte: { color: "#fff", fontWeight: "700", fontSize: 15 },

    videTexte: { color: C.texteSec, fontStyle: "italic", textAlign: "center", marginTop: 30 },

    // Formulaire
    formContainer: { flex: 1, padding: 16 },
    formTitre: { fontSize: 20, fontWeight: "700", color: C.texte, marginBottom: 20 },
    champLabel: { fontSize: 13, fontWeight: "600", color: C.texte, marginBottom: 6 },
    champInput: {
        backgroundColor: C.carte, borderRadius: 12, padding: 14,
        fontSize: 15, color: C.texte, marginBottom: 16,
        borderWidth: 0.5, borderColor: C.bordure,
    },
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
    });