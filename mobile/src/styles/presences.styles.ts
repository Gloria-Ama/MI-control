    import { StyleSheet } from "react-native";

    const C = {
    primaire: "#07074C", accent: "#4F46E5", fond: "#F8F5F0",
    carte: "#FFFFFF", texte: "#1E293B", texteSec: "#64748B",
    bordure: "#E2E8F0", danger: "#EF4444", dangerFond: "#FEF2F2",
    succes: "#10B981", succesFond: "#F0FDF4",
    };

    export const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.fond },

    progressContainer: { backgroundColor: C.primaire, padding: 14 },
    progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    progressLabel: { color: "#fff", fontSize: 13, fontWeight: "700" },
    liveTag: { backgroundColor: "#EF4444", borderRadius: 99, paddingVertical: 2, paddingHorizontal: 8 },
    liveTagText: { color: "#fff", fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },
    progressBar: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 99, height: 6, overflow: "hidden", marginBottom: 10 },
    progressFill: { backgroundColor: "#10B981", height: 6, borderRadius: 99 },
    statsRapides: { flexDirection: "row", gap: 6 },
    statPill: { flex: 1, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 10, padding: 8, alignItems: "center" },
    statPillValeur: { color: "#fff", fontSize: 16, fontWeight: "700" },
    statPillLabel: { color: "rgba(255,255,255,0.7)", fontSize: 9, marginTop: 2 },

    searchBar: {
        flexDirection: "row", gap: 6, padding: 10,
        backgroundColor: C.carte, borderBottomWidth: 0.5, borderBottomColor: C.bordure,
    },
    searchInput: {
        flex: 1, backgroundColor: C.fond, borderRadius: 8, padding: 9,
        fontSize: 13, color: C.texte, borderWidth: 0.5, borderColor: C.bordure,
    },
    toutBtn: {
        backgroundColor: C.primaire, borderRadius: 8,
        paddingHorizontal: 10, justifyContent: "center",
    },
    toutBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },

    // ✅ CORRIGÉ — pilules compactes horizontales
    deptFiltreScroll: {
        backgroundColor: C.carte,
        borderBottomWidth: 0.5,
        borderBottomColor: C.bordure,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    deptPill: {
        height: 32,
        paddingHorizontal: 14,
        borderRadius: 99,
        borderWidth: 0.5,
        borderColor: C.bordure,
        backgroundColor: C.carte,
        justifyContent: "center",
        marginRight: 8,
    },
    deptPillActif: { backgroundColor: C.primaire, borderColor: C.primaire },
    deptPillText: { fontSize: 13, color: C.texte },
    deptPillTextActif: { color: "#fff", fontWeight: "700" },

    liste: { flex: 1 },
    membreRow: {
        backgroundColor: C.carte, marginHorizontal: 10, marginTop: 6,
        borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center",
        gap: 10, borderWidth: 0.5, borderColor: C.bordure,
    },
    membreRowPresent: { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" },
    avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    membreInfo: { flex: 1 },
    membreNom: { fontSize: 14, fontWeight: "700", color: C.texte },
    membreDept: { fontSize: 11, color: C.texteSec, marginTop: 1 },
    checkBox: { width: 26, height: 26, borderRadius: 8, borderWidth: 1.5, borderColor: C.bordure, alignItems: "center", justifyContent: "center" },
    checkBoxPresent: { backgroundColor: "#065F46", borderColor: "#065F46" },
    checkText: { color: "#fff", fontWeight: "700", fontSize: 14 },

    bottomActions: { position: "absolute", bottom: 16, left: 12, right: 12, flexDirection: "row", gap: 8 },
    btnVisiteur: { flex: 1, backgroundColor: "#2563EB", borderRadius: 12, padding: 14, alignItems: "center" },
    btnVisiteurText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    btnHistorique: { flex: 1, backgroundColor: C.fond, borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 0.5, borderColor: C.bordure },
    btnHistoriqueText: { color: C.texte, fontWeight: "700", fontSize: 13 },
    btnSauvegarder: { flex: 2, backgroundColor: C.primaire, borderRadius: 12, padding: 14, alignItems: "center" },
    btnSauvegarderText: { color: "#fff", fontWeight: "700", fontSize: 14 },

    retourBtn: { marginBottom: 12 },
    retourText: { color: C.texteSec, fontSize: 14 },
    titrePage: { fontSize: 22, fontWeight: "700", color: C.texte, marginBottom: 4 },
    sousTitre: { fontSize: 13, color: C.texteSec, marginBottom: 16 },
    videTexte: { color: C.texteSec, fontStyle: "italic", marginTop: 20, textAlign: "center" },
    section: { backgroundColor: C.carte, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 0.5, borderColor: C.bordure },
    sectionTitre: { fontSize: 11, fontWeight: "700", color: C.texteSec, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },

    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
    statCard: { flex: 1, minWidth: "45%", backgroundColor: C.fond, borderRadius: 10, padding: 12, alignItems: "center" },
    statCardValeur: { fontSize: 24, fontWeight: "700", color: C.primaire },
    statCardLabel: { fontSize: 11, color: C.texteSec, marginTop: 2 },
    tauxContainer: { gap: 6 },
    tauxLabel: { fontSize: 13, color: C.texteSec },
    tauxValeur: { fontSize: 28, fontWeight: "700", color: C.primaire },

    sexeRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    sexeLabel: { fontSize: 13, color: C.texte, width: 60 },
    sexeBarBg: { flex: 1, backgroundColor: C.fond, borderRadius: 99, height: 8, overflow: "hidden" },
    sexeBarFill: { backgroundColor: C.accent, height: 8, borderRadius: 99 },
    sexeTaux: { fontSize: 12, color: C.texteSec, width: 40, textAlign: "right" },

    deptStatRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: C.bordure },
    deptStatInfo: { flex: 1 },
    deptStatNom: { fontSize: 13, fontWeight: "600", color: C.texte },
    deptStatSub: { fontSize: 11, color: C.texteSec, marginTop: 1 },
    deptStatTaux: { fontSize: 16, fontWeight: "700" },

    visiteurRow: { paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: C.bordure },
    visiteurNom: { fontSize: 13, fontWeight: "600", color: C.texte },
    visiteurInfo: { fontSize: 11, color: C.texteSec, marginTop: 2 },

    histCard: { backgroundColor: C.carte, borderRadius: 14, marginBottom: 10, borderWidth: 0.5, borderColor: C.bordure, overflow: "hidden" },
    histHeader: { padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    histDate: { fontSize: 14, fontWeight: "700", color: C.texte },
    histSub: { fontSize: 12, color: C.texteSec, marginTop: 2 },
    histTauxBox: { alignItems: "center" },
    histTaux: { fontSize: 18, fontWeight: "700", color: C.primaire },
    histChevron: { fontSize: 10, color: C.texteSec, marginTop: 2 },
    histDetail: { padding: 14, paddingTop: 0, borderTopWidth: 0.5, borderTopColor: C.bordure },
    histSousTitre: { fontSize: 12, fontWeight: "700", color: C.texteSec, marginBottom: 6 },
    histNom: { fontSize: 13, color: C.texte, paddingVertical: 3 },

    champLabel: { fontSize: 13, fontWeight: "600", color: C.texte, marginBottom: 6 },
    champInput: { backgroundColor: C.fond, borderRadius: 10, padding: 12, fontSize: 14, color: C.texte, marginBottom: 14, borderWidth: 0.5, borderColor: C.bordure },
    choixBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 99, borderWidth: 0.5, borderColor: C.bordure, backgroundColor: C.carte },
    choixBtnActif: { backgroundColor: C.primaire, borderColor: C.primaire },
    choixBtnText: { fontSize: 13, color: C.texte },
    choixBtnTextActif: { color: "#fff", fontWeight: "700" },
    });