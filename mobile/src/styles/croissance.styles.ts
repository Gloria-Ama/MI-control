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
    accent: "#4F46E5",
    };

    export const crs = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.fond },

    // Onglets
    ongletScroll: {
        backgroundColor: C.carte,
        borderBottomWidth: 0.5,
        borderBottomColor: C.bordure,
    },
    onglet: {
        paddingVertical: 14, paddingHorizontal: 16,
        borderBottomWidth: 2, borderBottomColor: "transparent",
    },
    ongletActif: { borderBottomColor: C.primaire },
    ongletTexte: { fontSize: 13, color: C.texteSec, fontWeight: "500" },
    ongletTexteActif: { color: C.primaire, fontWeight: "700" },

    // Résumé cards
    resumeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
    resumeCard: {
        flex: 1, minWidth: "45%", backgroundColor: C.carte,
        borderRadius: 14, padding: 14, alignItems: "center",
        borderWidth: 0.5, borderColor: C.bordure,
    },
    resumeIcone: { fontSize: 24, marginBottom: 6 },
    resumeValeur: { fontSize: 26, fontWeight: "700", color: C.primaire },
    resumeLabel: { fontSize: 11, color: C.texteSec, marginTop: 3, textAlign: "center" },
    resumeTendance: { fontSize: 12, fontWeight: "600", marginTop: 4 },
    tendanceHausse: { color: C.succes },
    tendanceBaisse: { color: C.danger },
    tendanceStable: { color: C.texteSec },

    // Section graphique
    section: {
        backgroundColor: C.carte, borderRadius: 14, padding: 14,
        marginBottom: 14, borderWidth: 0.5, borderColor: C.bordure,
    },
    sectionHeader: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between", marginBottom: 16,
    },
    sectionTitre: { fontSize: 15, fontWeight: "700", color: C.texte },
    sectionSub: { fontSize: 12, color: C.texteSec, marginTop: 2 },

    // Graphique barres
    graphContainer: { height: 160, flexDirection: "row", alignItems: "flex-end", gap: 4 },
    barreColonne: { flex: 1, alignItems: "center", gap: 4 },
    barre: { width: "100%", borderRadius: 4, minHeight: 4 },
    barreMois: { fontSize: 9, color: C.texteSec, textAlign: "center" },
    barreValeur: { fontSize: 9, color: C.texteSec, textAlign: "center" },

    // Graphique ligne (taux)
    ligneContainer: { height: 160, position: "relative", marginBottom: 20 },
    ligneGrille: {
        position: "absolute", left: 0, right: 0,
        borderTopWidth: 0.5, borderTopColor: "#F1F5F9",
    },
    ligneLabel: {
        position: "absolute", left: 0,
        fontSize: 9, color: C.texteSec,
    },
    moisRow: { flexDirection: "row", marginTop: 6 },
    moisLabel: { flex: 1, fontSize: 9, color: C.texteSec, textAlign: "center" },

    // Légende
    legendeRow: { flexDirection: "row", gap: 16, marginTop: 10, flexWrap: "wrap" },
    legendeItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendeDot: { width: 10, height: 10, borderRadius: 5 },
    legendeTexte: { fontSize: 12, color: C.texteSec },

    // Tableau
    tableauHeader: {
        flexDirection: "row", paddingVertical: 8,
        borderBottomWidth: 1, borderBottomColor: C.bordure,
        marginBottom: 4,
    },
    tableauHeaderTexte: { fontSize: 11, fontWeight: "700", color: C.texteSec },
    tableauRow: {
        flexDirection: "row", paddingVertical: 10,
        borderBottomWidth: 0.5, borderBottomColor: "#F8FAFC",
        alignItems: "center",
    },
    tableauTexte: { fontSize: 13, color: C.texte },
    tableauValeur: { fontSize: 13, fontWeight: "600", color: C.primaire },
    tableauTaux: { fontSize: 13, fontWeight: "700" },

    videTexte: {
        color: C.texteSec, fontStyle: "italic",
        textAlign: "center", marginTop: 30,
    },

    // Sélecteur culte
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
    cultePillTexte: { fontSize: 13, fontWeight: "600", color: C.texte },
    cultePillTexteActif: { color: "#fff" },
    });