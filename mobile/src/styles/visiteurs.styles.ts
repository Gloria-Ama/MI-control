    import { StyleSheet } from "react-native";

    const C = {
    primaire: "#07074C", fond: "#F8F5F0", carte: "#FFFFFF",
    texte: "#1E293B", texteSec: "#64748B", bordure: "#E2E8F0",
    danger: "#EF4444", dangerFond: "#FEF2F2",
    succes: "#10B981", succesFond: "#F0FDF4",
    warning: "#F59E0B", warningFond: "#FFFBEB",
    info: "#3B82F6", infoFond: "#EFF6FF",
    };

    const STATUT_COULEURS: Record<string, { fond: string; texte: string; bordure: string }> = {
    nouveau:          { fond: "#E6F1FB", texte: "#0C447C", bordure: "#B5D4F4" },
    contacte:         { fond: "#FAEEDA", texte: "#633806", bordure: "#FCD34D" },
    en_suivi:         { fond: "#EEEDFE", texte: "#3C3489", bordure: "#AFA9EC" },
    integre:          { fond: "#F0FDF4", texte: "#065F46", bordure: "#86EFAC" },
    converti_membre:  { fond: "#F1EFE8", texte: "#444441", bordure: "#D3D1C7" },
    };

    export { STATUT_COULEURS };

    export const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.fond },

    searchBar: {
        flexDirection: "row", gap: 8, padding: 12,
        backgroundColor: C.carte, borderBottomWidth: 0.5, borderBottomColor: C.bordure,
    },
    searchInput: {
        flex: 1, backgroundColor: C.fond, borderRadius: 10, padding: 10,
        fontSize: 14, color: C.texte, borderWidth: 0.5, borderColor: C.bordure,
    },
    filterBtn: {
        width: 40, height: 40, backgroundColor: C.primaire,
        borderRadius: 10, alignItems: "center", justifyContent: "center",
    },
    filterBtnText: { color: "#fff", fontSize: 16 },

    statutFiltreScroll: {
        backgroundColor: C.carte, paddingVertical: 8,
        borderBottomWidth: 0.5, borderBottomColor: C.bordure,
    },
    statutPill: {
        paddingVertical: 5, paddingHorizontal: 12, borderRadius: 99,
        borderWidth: 0.5, borderColor: C.bordure, marginRight: 6, backgroundColor: C.carte,
    },
    statutPillActif: { backgroundColor: C.primaire, borderColor: C.primaire },
    statutPillText: { fontSize: 12, color: C.texte },
    statutPillTextActif: { color: "#fff", fontWeight: "700" },

    liste: { flex: 1, padding: 12 },
    compteLabel: { fontSize: 12, color: C.texteSec, marginBottom: 10 },

    visiteurCard: {
        backgroundColor: C.carte, borderRadius: 14, padding: 14,
        marginBottom: 8, borderWidth: 0.5, borderColor: C.bordure,
        flexDirection: "row", alignItems: "flex-start", gap: 12,
    },
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    avatarText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    visiteurInfo: { flex: 1 },
    visiteurNom: { fontSize: 15, fontWeight: "700", color: C.texte },
    visiteurSub: { fontSize: 12, color: C.texteSec, marginTop: 2 },
    visiteurVisites: { fontSize: 11, color: C.texteSec, marginTop: 3 },

    statutBadge: {
        paddingVertical: 3, paddingHorizontal: 8, borderRadius: 99,
        borderWidth: 0.5, alignSelf: "flex-start", marginTop: 6,
    },
    statutBadgeText: { fontSize: 11, fontWeight: "700" },

    fab: {
        position: "absolute", bottom: 24, right: 20,
        backgroundColor: C.primaire, borderRadius: 14,
        paddingVertical: 14, paddingHorizontal: 22, elevation: 4,
    },
    fabText: { color: "#fff", fontWeight: "700", fontSize: 15 },

    // Détail
    detailHeader: { backgroundColor: C.primaire, padding: 20, alignItems: "center", paddingBottom: 24 },
    retourBtn: { alignSelf: "flex-start", marginBottom: 12 },
    retourText: { color: "#94A3B8", fontSize: 14 },
    detailAvatar: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 10 },
    detailAvatarText: { color: "#fff", fontWeight: "700", fontSize: 24 },
    detailNom: { color: "#fff", fontSize: 20, fontWeight: "700" },
    detailSub: { color: "#94A3B8", fontSize: 13, marginTop: 4 },
    detailBody: { padding: 16 },

    section: {
        backgroundColor: C.carte, borderRadius: 14, padding: 14,
        marginBottom: 12, borderWidth: 0.5, borderColor: C.bordure,
    },
    sectionTitre: {
        fontSize: 11, fontWeight: "700", color: C.texteSec,
        textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10,
    },

    infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: "#F8FAFC" },
    infoIcone: { fontSize: 14, marginRight: 10, width: 20 },
    infoLabel: { fontSize: 12, color: C.texteSec, width: 90 },
    infoValeur: { flex: 1, fontSize: 13, color: C.texte, fontWeight: "500" },

    // Statuts
    statutsContainer: { gap: 8 },
    statutOption: {
        padding: 12, borderRadius: 10, borderWidth: 0.5,
        flexDirection: "row", alignItems: "center", gap: 10,
    },
    statutOptionActif: { borderWidth: 2 },
    statutOptionTexte: { fontSize: 13, fontWeight: "600", flex: 1 },
    statutOptionDesc: { fontSize: 11, marginTop: 2 },
    statutCheck: { fontSize: 16 },

    actionsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
    btnEditer: { flex: 1, backgroundColor: C.primaire, borderRadius: 12, padding: 14, alignItems: "center" },
    btnEditerText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    btnConvertir: { flex: 1, backgroundColor: C.succesFond, borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 0.5, borderColor: "#86EFAC" },
    btnConvertirText: { color: "#065F46", fontWeight: "700", fontSize: 13 },
    btnSupprimer: { backgroundColor: C.dangerFond, borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 0.5, borderColor: "#FECACA", marginTop: 8 },
    btnSupprimerText: { color: C.danger, fontWeight: "700", fontSize: 14 },

    // Formulaire
    formContainer: { flex: 1, padding: 16 },
    formTitre: { fontSize: 20, fontWeight: "700", color: C.texte, marginBottom: 20 },
    champLabel: { fontSize: 13, fontWeight: "600", color: C.texte, marginBottom: 6 },
    champInput: {
        backgroundColor: C.carte, borderRadius: 10, padding: 12,
        fontSize: 15, color: C.texte, marginBottom: 16,
        borderWidth: 0.5, borderColor: C.bordure,
    },
    champInputMulti: { minHeight: 80, textAlignVertical: "top" },
    choixRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    choixBtn: {
        paddingVertical: 8, paddingHorizontal: 14, borderRadius: 99,
        borderWidth: 0.5, borderColor: C.bordure, backgroundColor: C.carte,
    },
    choixBtnActif: { backgroundColor: C.primaire, borderColor: C.primaire },
    choixBtnText: { fontSize: 13, color: C.texte },
    choixBtnTextActif: { color: "#fff", fontWeight: "700" },
    btnPrimaire: { backgroundColor: C.primaire, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
    btnPrimaireText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    });