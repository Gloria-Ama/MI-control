    import { StyleSheet } from "react-native";

    const C = {
    primaire: "#07074C",
    fond: "#F8F5F0",
    carte: "#FFFFFF",
    texte: "#1E293B",
    texteSec: "#64748B",
    bordure: "#E2E8F0",
    accent: "#4F46E5",
    };

    const TYPE_COULEURS: Record<string, string> = {
    culte:          "#07074C",
    reunion:        "#4F46E5",
    formation:      "#0F6E56",
    evangelisation: "#854F0B",
    social:         "#BE185D",
    anniversaire:   "#D97706",
    autre:          "#64748B",
    };

    export { TYPE_COULEURS };

    export const cal = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.fond },

    // En-tête mois
    moisHeader: {
        backgroundColor: C.primaire, padding: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    moisBouton: { padding: 8 },
    moisBoutonTexte: { color: "#fff", fontSize: 22, fontWeight: "700" },
    moisTitre: { color: "#fff", fontSize: 18, fontWeight: "700" },

    // Grille calendrier
    joursHeader: {
        flexDirection: "row", backgroundColor: C.primaire,
        paddingBottom: 10, paddingHorizontal: 4,
    },
    jourHeaderTexte: {
        flex: 1, textAlign: "center", fontSize: 12,
        fontWeight: "700", color: "rgba(255,255,255,0.6)",
    },
    grille: {
        backgroundColor: C.carte, borderBottomWidth: 0.5, borderBottomColor: C.bordure,
    },
    semaine: { flexDirection: "row" },
    jourCell: {
        flex: 1, minHeight: 52, alignItems: "center",
        paddingVertical: 6, borderWidth: 0.5, borderColor: "#F1F5F9",
    },
    jourCellHorseMois: { backgroundColor: "#F8FAFC" },
    jourCellAujourdhui: { backgroundColor: "#EEF2FF" },
    jourCellSelectionne: { backgroundColor: C.primaire },
    jourTexte: { fontSize: 14, color: C.texte, fontWeight: "500" },
    jourTexteHorsMois: { color: "#CBD5E1" },
    jourTexteAujourdhui: { color: C.accent, fontWeight: "700" },
    jourTexteSelectionne: { color: "#fff", fontWeight: "700" },
    dotsRow: { flexDirection: "row", gap: 2, marginTop: 2 },
    dot: { width: 5, height: 5, borderRadius: 3 },

    // Liste événements
    listeTitre: {
        fontSize: 15, fontWeight: "700", color: C.texte,
        paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8,
    },
    videTexte: {
        color: C.texteSec, fontStyle: "italic",
        textAlign: "center", paddingVertical: 20,
    },

    // Carte événement
    eventCard: {
        backgroundColor: C.carte, borderRadius: 14, padding: 14,
        marginHorizontal: 14, marginBottom: 10,
        borderWidth: 0.5, borderColor: C.bordure,
        flexDirection: "row", gap: 12,
    },
    eventBarre: { width: 4, borderRadius: 2 },
    eventContenu: { flex: 1 },
    eventTitre: { fontSize: 15, fontWeight: "700", color: C.texte },
    eventMeta: { fontSize: 12, color: C.texteSec, marginTop: 3 },
    eventLieu: { fontSize: 12, color: C.texteSec, marginTop: 2 },
    eventDesc: { fontSize: 13, color: C.texte, marginTop: 6, lineHeight: 18 },
    eventBadge: {
        alignSelf: "flex-start", paddingVertical: 3, paddingHorizontal: 8,
        borderRadius: 99, marginTop: 6,
    },
    eventBadgeTexte: { fontSize: 11, fontWeight: "700", color: "#fff" },

    eventActions: { flexDirection: "row", gap: 8, marginTop: 10 },
    btnEdit: {
        paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8,
        backgroundColor: "#EEF2FF",
    },
    btnEditTexte: { fontSize: 12, color: C.accent, fontWeight: "700" },
    btnDelete: {
        paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8,
        backgroundColor: "#FEF2F2",
    },
    btnDeleteTexte: { fontSize: 12, color: "#EF4444", fontWeight: "700" },

    fab: {
        position: "absolute", bottom: 24, right: 20,
        backgroundColor: C.primaire, borderRadius: 14,
        paddingVertical: 14, paddingHorizontal: 20, elevation: 5,
    },
    fabTexte: { color: "#fff", fontWeight: "700", fontSize: 15 },

    // Formulaire
    formTitre: { fontSize: 20, fontWeight: "700", color: C.texte, marginBottom: 20 },
    retourBtn: { marginBottom: 16 },
    retourText: { fontSize: 15, color: C.texteSec },
    champLabel: { fontSize: 13, fontWeight: "600", color: C.texte, marginBottom: 6 },
    champInput: {
        backgroundColor: C.carte, borderRadius: 12, padding: 14,
        fontSize: 15, color: C.texte, marginBottom: 16,
        borderWidth: 0.5, borderColor: C.bordure,
    },
    champInputMulti: { minHeight: 80, textAlignVertical: "top" },

    typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    typeBtn: {
        paddingVertical: 8, paddingHorizontal: 14, borderRadius: 99,
        borderWidth: 0.5, borderColor: C.bordure, backgroundColor: C.carte,
    },
    typeBtnActif: { borderColor: "transparent" },
    typeBtnTexte: { fontSize: 13, color: C.texte },
    typeBtnTexteActif: { color: "#fff", fontWeight: "700" },

    toggleRow: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: C.carte, borderRadius: 12, padding: 14,
        marginBottom: 16, borderWidth: 0.5, borderColor: C.bordure,
    },
    toggleLabel: { fontSize: 15, color: C.texte, fontWeight: "500" },
    toggleBouton: {
        width: 50, height: 28, borderRadius: 14,
        justifyContent: "center", paddingHorizontal: 3,
    },
    toggleOn: { backgroundColor: C.primaire },
    toggleOff: { backgroundColor: "#CBD5E1" },
    toggleKnob: {
        width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff",
    },
    toggleKnobOn: { alignSelf: "flex-end" },
    toggleKnobOff: { alignSelf: "flex-start" },

    btnSoumettre: {
        backgroundColor: C.primaire, borderRadius: 12,
        padding: 16, alignItems: "center", marginTop: 8,
    },
    btnSoumettreTexte: { color: "#fff", fontWeight: "700", fontSize: 16 },
    });