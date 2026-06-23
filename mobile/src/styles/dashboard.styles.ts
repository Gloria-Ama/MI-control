    import { StyleSheet } from "react-native";

    // ─── Couleurs de l'app ────────────────────────────────────────────────────────
    const COULEURS = {
    primaire: "#07074C",       // Bleu marine foncé
    primaireLight: "#1a1a6e",
    accent: "#4F46E5",         // Indigo
    fond: "#F8F5F0",
    carte: "#FFFFFF",
    texte: "#1E293B",
    texteSecondaire: "#64748B",
    bordure: "#E2E8F0",
    danger: "#EF4444",
    dangerFond: "#FEF2F2",
    succes: "#10B981",
    secondaire: "#F1F5F9",
    };

    // ─── Styles de la navigation (header + barre du bas) ─────────────────────────
    export const navStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COULEURS.primaire,
    },

    // Header
    header: {
        backgroundColor: COULEURS.primaire,
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    headerTitre: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
    },
    headerBoutonRetour: {
        paddingVertical: 6,
        paddingRight: 12,
        minWidth: 70,
    },
    headerBoutonRetourTexte: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "500",
    },
    headerEspaceur: {
        minWidth: 70,
    },

    // Contenu
    contenu: {
        flex: 1,
        backgroundColor: COULEURS.fond,
    },

    // Barre de navigation du bas
    barreNav: {
        flexDirection: "row",
        backgroundColor: COULEURS.carte,
        borderTopWidth: 1,
        borderTopColor: COULEURS.bordure,
        paddingBottom: 8,
        paddingTop: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 8,
    },
    onglet: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 4,
        position: "relative",
    },
    ongletIcone: {
        fontSize: 20,
        marginBottom: 2,
    },
    ongletLabel: {
        fontSize: 11,
        color: COULEURS.texteSecondaire,
        fontWeight: "500",
    },
    ongletLabelActif: {
        color: COULEURS.accent,
        fontWeight: "700",
    },
    ongletIndicateur: {
        position: "absolute",
        top: 0,
        width: 28,
        height: 3,
        backgroundColor: COULEURS.accent,
        borderRadius: 2,
    },
    });

    // ─── Styles du contenu du dashboard ──────────────────────────────────────────
    export const dashStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },

    sectionTitre: {
        fontSize: 20,
        fontWeight: "700",
        color: COULEURS.texte,
        marginBottom: 16,
        marginTop: 8,
    },

    // Carte profil
    profilCard: {
        backgroundColor: COULEURS.carte,
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COULEURS.bordure,
    },
    profilAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COULEURS.primaire,
        alignItems: "center",
        justifyContent: "center",
    },
    profilAvatarTexte: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "700",
    },
    profilNom: {
        fontSize: 16,
        fontWeight: "700",
        color: COULEURS.texte,
    },
    profilRole: {
        fontSize: 13,
        color: COULEURS.texteSecondaire,
        marginTop: 2,
        textTransform: "capitalize",
    },

    // Stats rapides
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 14,
    },
    statCard: {
        flex: 1,
        backgroundColor: COULEURS.carte,
        borderRadius: 14,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COULEURS.bordure,
    },
    statNombre: {
        fontSize: 28,
        fontWeight: "700",
        color: COULEURS.primaire,
    },
    statLabel: {
        fontSize: 13,
        color: COULEURS.texteSecondaire,
        marginTop: 4,
    },

    // Anniversaires
    anniversairesBox: {
        backgroundColor: COULEURS.carte,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COULEURS.bordure,
    },
    anniversairesTitre: {
        fontSize: 18,
        fontWeight: "700",
        color: COULEURS.texte,
        marginBottom: 12,
    },
    anniversairesSousTitre: {
        fontSize: 14,
        fontWeight: "700",
        color: "#8B5E34",
        marginTop: 10,
        marginBottom: 6,
    },
    anniversairesItem: {
        fontSize: 15,
        color: COULEURS.texte,
        marginBottom: 4,
    },
    videTexte: {
        color: COULEURS.texteSecondaire,
        fontStyle: "italic",
        fontSize: 14,
    },

    // Cartes de module (onglet "Plus")
    card: {
        backgroundColor: COULEURS.carte,
        borderRadius: 14,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COULEURS.bordure,
    },
    cardIcone: {
        fontSize: 22,
        marginRight: 14,
    },
    cardTextes: {
        flex: 1,
    },
    cardTitre: {
        fontSize: 16,
        fontWeight: "600",
        color: COULEURS.texte,
    },
    cardSousTitre: {
        fontSize: 13,
        color: COULEURS.texteSecondaire,
        marginTop: 2,
    },
    cardFleche: {
        fontSize: 22,
        color: COULEURS.texteSecondaire,
    },

    // Carte danger (déconnexion)
    cardDanger: {
        backgroundColor: COULEURS.dangerFond,
        borderRadius: 14,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#FECACA",
        marginTop: 20,
    },
    cardTitreDanger: {
        fontSize: 16,
        fontWeight: "600",
        color: COULEURS.danger,
    },

    // Carte secondaire (changer de culte)
    cardSecondaire: {
        backgroundColor: COULEURS.secondaire,
        borderRadius: 14,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COULEURS.bordure,
    },
    });
