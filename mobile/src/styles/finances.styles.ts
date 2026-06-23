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

    export const fs = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.fond },

    // Onglets
    onglets: {
        flexDirection: "row",
        backgroundColor: C.carte,
        borderBottomWidth: 0.5,
        borderBottomColor: C.bordure,
        paddingHorizontal: 8,
    },
    onglet: {
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    ongletActif: { borderBottomColor: C.primaire },
    ongletTexte: { fontSize: 13, color: C.texteSec, fontWeight: "500" },
    ongletTexteActif: { color: C.primaire, fontWeight: "700" },

    // Filtres
    filtreContainer: {
        backgroundColor: C.carte,
        borderBottomWidth: 0.5,
        borderBottomColor: C.bordure,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    filtrePill: {
        paddingVertical: 6, paddingHorizontal: 14, borderRadius: 99,
        borderWidth: 0.5, borderColor: C.bordure, backgroundColor: C.carte,
        marginRight: 8,
    },
    filtrePillActif: { backgroundColor: C.primaire, borderColor: C.primaire },
    filtrePillTexte: { fontSize: 13, color: C.texte },
    filtrePillTexteActif: { color: "#fff", fontWeight: "700" },

    // Résumé financier
    resumeCard: {
        backgroundColor: C.primaire, margin: 14, borderRadius: 16, padding: 16,
    },
    resumeTitre: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 4 },
    resumeSolde: { color: "#fff", fontSize: 28, fontWeight: "700", marginBottom: 14 },
    resumeRow: { flexDirection: "row", gap: 10 },
    resumeBloc: {
        flex: 1, backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 10, padding: 10, alignItems: "center",
    },
    resumeBlocLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginBottom: 4 },
    resumeBlocMontant: { color: "#fff", fontSize: 16, fontWeight: "700" },

    // Transaction card
    transactionCard: {
        backgroundColor: C.carte, borderRadius: 12, padding: 14,
        marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 12,
        borderWidth: 0.5, borderColor: C.bordure,
    },
    transactionIcone: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    transactionInfo: { flex: 1 },
    transactionType: { fontSize: 14, fontWeight: "700", color: C.texte },
    transactionDesc: { fontSize: 12, color: C.texteSec, marginTop: 2 },
    transactionDate: { fontSize: 11, color: C.texteSec, marginTop: 2 },
    transactionMontant: { fontSize: 16, fontWeight: "700" },
    montantEntree: { color: "#065F46" },
    montantSortie: { color: C.danger },

    // Formulaire demande
    formulaire: { padding: 16 },
    formTitre: { fontSize: 20, fontWeight: "700", color: C.texte, marginBottom: 20 },
    champLabel: { fontSize: 13, fontWeight: "600", color: C.texte, marginBottom: 6 },
    champInput: {
        backgroundColor: C.carte, borderRadius: 12, padding: 14,
        fontSize: 15, color: C.texte, marginBottom: 16,
        borderWidth: 0.5, borderColor: C.bordure,
    },
    champInputMulti: { minHeight: 90, textAlignVertical: "top" },

    typeRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    typeBtn: {
        flex: 1, padding: 12, borderRadius: 12,
        borderWidth: 0.5, borderColor: C.bordure,
        backgroundColor: C.carte, alignItems: "center",
    },
    typeBtnActif: { backgroundColor: C.primaire, borderColor: C.primaire },
    typeBtnTexte: { fontSize: 13, fontWeight: "600", color: C.texte },
    typeBtnTexteActif: { color: "#fff" },

    // Pièces jointes
    piecesBox: {
        backgroundColor: C.carte, borderRadius: 12, padding: 14,
        borderWidth: 0.5, borderColor: C.bordure, marginBottom: 16,
    },
    piecesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    piecesLabel: { fontSize: 13, fontWeight: "600", color: C.texte },
    piecesAjouter: {
        flexDirection: "row", alignItems: "center", gap: 4,
        backgroundColor: "#EEF2FF", borderRadius: 8, padding: 8,
    },
    piecesAjouterTexte: { fontSize: 12, color: "#4F46E5", fontWeight: "700" },
    piecePreview: {
        width: 70, height: 70, borderRadius: 8, marginRight: 8,
        borderWidth: 0.5, borderColor: C.bordure,
    },
    piecesScroll: { flexDirection: "row" },

    // Département
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
    deptOptionTexteActif: { fontWeight: "700", color: "#4F46E5" },
    deptCheck: { fontSize: 16, color: "#4F46E5", fontWeight: "700" },

    btnSoumettre: {
        backgroundColor: C.primaire, borderRadius: 12,
        padding: 16, alignItems: "center", marginTop: 8,
    },
    btnSoumettreTexte: { color: "#fff", fontWeight: "700", fontSize: 16 },

    // Demande card
    demandeCard: {
        backgroundColor: C.carte, borderRadius: 14, padding: 16,
        marginBottom: 10, borderWidth: 0.5, borderColor: C.bordure,
    },
    demandeHeader: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 10,
    },
    demandeType: { fontSize: 15, fontWeight: "700", color: C.texte, flex: 1 },
    demandeMontant: { fontSize: 18, fontWeight: "700", color: C.primaire },

    infoRow: { flexDirection: "row", gap: 6, marginBottom: 4 },
    infoLabel: { fontSize: 12, color: C.texteSec, width: 80 },
    infoValeur: { fontSize: 12, color: C.texte, fontWeight: "500", flex: 1 },

    statutBadge: {
        alignSelf: "flex-start", paddingVertical: 4, paddingHorizontal: 10,
        borderRadius: 99, marginTop: 8, borderWidth: 0.5,
    },
    statutTexte: { fontSize: 12, fontWeight: "700" },
    statutEnAttente: { backgroundColor: C.warningFond, borderColor: "#FCD34D" },
    statutEnAttenteTexte: { color: "#633806" },
    statutApprouvee: { backgroundColor: C.succesFond, borderColor: "#86EFAC" },
    statutApprouveeTexte: { color: "#065F46" },
    statutRefusee: { backgroundColor: C.dangerFond, borderColor: "#FECACA" },
    statutRefuseeTexte: { color: "#991B1B" },
    statutRemboursee: { backgroundColor: "#F1F5F9", borderColor: C.bordure },
    statutRembourseeTexte: { color: C.texteSec },

    actionsRow: { flexDirection: "row", gap: 8, marginTop: 12 },
    btnApprouver: {
        flex: 1, backgroundColor: C.succesFond, borderRadius: 10,
        padding: 10, alignItems: "center", borderWidth: 0.5, borderColor: "#86EFAC",
    },
    btnApprouverTexte: { color: "#065F46", fontWeight: "700", fontSize: 13 },
    btnRefuser: {
        flex: 1, backgroundColor: C.dangerFond, borderRadius: 10,
        padding: 10, alignItems: "center", borderWidth: 0.5, borderColor: "#FECACA",
    },
    btnRefuserTexte: { color: C.danger, fontWeight: "700", fontSize: 13 },
    btnRembourser: {
        flex: 1, backgroundColor: "#EFF6FF", borderRadius: 10,
        padding: 10, alignItems: "center", borderWidth: 0.5, borderColor: "#BFDBFE",
    },
    btnRembourserTexte: { color: "#1D4ED8", fontWeight: "700", fontSize: 13 },

    videTexte: {
        color: C.texteSec, fontStyle: "italic",
        textAlign: "center", marginTop: 40,
    },
    fab: {
        position: "absolute", bottom: 24, right: 20,
        backgroundColor: C.primaire, borderRadius: 14,
        paddingVertical: 14, paddingHorizontal: 24, elevation: 5,
    },
    fabTexte: { color: "#fff", fontWeight: "700", fontSize: 15 },
    });