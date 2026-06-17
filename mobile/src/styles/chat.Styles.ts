    import { StyleSheet } from "react-native";

    const C = {
    primaire: "#07074C",
    fond: "#F8F5F0",
    carte: "#FFFFFF",
    texte: "#1E293B",
    texteSec: "#64748B",
    bordure: "#E2E8F0",
    bulleMoi: "#07074C",
    bulleAutre: "#FFFFFF",
    };

    export const cs = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.fond },

    // Liste des conversations
    header: {
        backgroundColor: C.primaire, padding: 16, paddingTop: 20,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    headerTitre: { color: "#fff", fontSize: 20, fontWeight: "700" },
    headerBadge: {
        backgroundColor: "#EF4444", borderRadius: 99,
        paddingHorizontal: 8, paddingVertical: 3,
    },
    headerBadgeTexte: { color: "#fff", fontSize: 12, fontWeight: "700" },

    searchBar: {
        backgroundColor: C.carte, padding: 12,
        borderBottomWidth: 0.5, borderBottomColor: C.bordure,
    },
    searchInput: {
        backgroundColor: C.fond, borderRadius: 12, padding: 12,
        fontSize: 14, color: C.texte, borderWidth: 0.5, borderColor: C.bordure,
    },

    videTexte: {
        color: C.texteSec, fontStyle: "italic",
        textAlign: "center", marginTop: 40, paddingHorizontal: 30,
    },

    // Carte conversation
    convCard: {
        backgroundColor: C.carte, padding: 14,
        flexDirection: "row", alignItems: "center", gap: 12,
        borderBottomWidth: 0.5, borderBottomColor: C.bordure,
    },
    convCardNonLue: { backgroundColor: "#F0F4FF" },
    avatar: {
        width: 50, height: 50, borderRadius: 25,
        alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    avatarTexte: { color: "#fff", fontWeight: "700", fontSize: 18 },
    convInfo: { flex: 1 },
    convNom: { fontSize: 15, fontWeight: "700", color: C.texte },
    convDernier: { fontSize: 13, color: C.texteSec, marginTop: 3 },
    convDate: { fontSize: 11, color: C.texteSec },
    badgeNonLu: {
        backgroundColor: C.primaire, borderRadius: 99,
        minWidth: 20, height: 20,
        alignItems: "center", justifyContent: "center",
        paddingHorizontal: 5,
    },
    badgeNonLuTexte: { color: "#fff", fontSize: 11, fontWeight: "700" },

    fab: {
        position: "absolute", bottom: 24, right: 20,
        backgroundColor: C.primaire, borderRadius: 14,
        paddingVertical: 14, paddingHorizontal: 20, elevation: 5,
    },
    fabTexte: { color: "#fff", fontWeight: "700", fontSize: 15 },

    // Sélection destinataire
    destTitre: { fontSize: 18, fontWeight: "700", color: C.texte, padding: 16 },
    destCard: {
        flexDirection: "row", alignItems: "center", gap: 12,
        padding: 14, borderBottomWidth: 0.5, borderBottomColor: C.bordure,
        backgroundColor: C.carte,
    },
    destNom: { fontSize: 15, fontWeight: "600", color: C.texte },
    destRole: { fontSize: 12, color: C.texteSec, marginTop: 2 },

    // Vue conversation
    chatHeader: {
        backgroundColor: C.primaire, padding: 14,
        flexDirection: "row", alignItems: "center", gap: 12,
    },
    retourBtn: { padding: 4 },
    retourText: { color: "#94A3B8", fontSize: 22 },
    chatHeaderAvatar: {
        width: 38, height: 38, borderRadius: 19,
        alignItems: "center", justifyContent: "center",
    },
    chatHeaderAvatarTexte: { color: "#fff", fontWeight: "700", fontSize: 14 },
    chatHeaderNom: { color: "#fff", fontSize: 16, fontWeight: "700" },
    chatHeaderSub: { color: "#94A3B8", fontSize: 12 },

    messagesListe: { flex: 1 },
    messagesContenu: { padding: 12, gap: 6 },

    // Bulle de message
    bulleContainer: { flexDirection: "row", marginBottom: 6 },
    bulleContainerMoi: { justifyContent: "flex-end" },
    bulleContainerAutre: { justifyContent: "flex-start" },

    bulle: {
        maxWidth: "75%", borderRadius: 16, padding: 10,
        paddingHorizontal: 14,
    },
    bulleMoi: {
        backgroundColor: C.bulleMoi,
        borderBottomRightRadius: 4,
    },
    bulleAutre: {
        backgroundColor: C.bulleAutre,
        borderBottomLeftRadius: 4,
        borderWidth: 0.5, borderColor: C.bordure,
    },
    bulleTexte: { fontSize: 15, lineHeight: 20 },
    bulleTexteMoi: { color: "#fff" },
    bulleTexteAutre: { color: C.texte },
    bulleDate: { fontSize: 10, marginTop: 4 },
    bulleDateMoi: { color: "rgba(255,255,255,0.6)", textAlign: "right" },
    bulleDateAutre: { color: C.texteSec },
    bulleLu: { fontSize: 10, color: "rgba(255,255,255,0.6)", textAlign: "right" },

    // Séparateur de date
    dateSeparateur: { alignItems: "center", marginVertical: 10 },
    dateSeparateurTexte: {
        fontSize: 11, color: C.texteSec, backgroundColor: C.fond,
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99,
    },

    // Zone de saisie
    saisieContainer: {
        backgroundColor: C.carte, padding: 10,
        borderTopWidth: 0.5, borderTopColor: C.bordure,
        flexDirection: "row", alignItems: "flex-end", gap: 10,
    },
    saisieInput: {
        flex: 1, backgroundColor: C.fond, borderRadius: 20,
        paddingHorizontal: 16, paddingVertical: 10,
        fontSize: 15, color: C.texte, maxHeight: 120,
        borderWidth: 0.5, borderColor: C.bordure,
    },
    envoiBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: C.primaire,
        alignItems: "center", justifyContent: "center",
    },
    envoiBtnVide: { backgroundColor: "#CBD5E1" },
    envoiIcone: { fontSize: 18 },
    });