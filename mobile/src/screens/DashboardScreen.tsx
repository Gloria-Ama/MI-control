    import { useEffect, useState } from "react";
    import { Pressable, Text, View, ScrollView } from "react-native";
    import AsyncStorage from "@react-native-async-storage/async-storage";

    import MembresScreen from "./MembresScreen";
    import VisiteursScreen from "./VisiteursScreen";
    import PresencesScreen from "./PresencesScreen";
    import DepartementsScreen from "./DepartementsScreen";
    import FinancesScreen from "./FinancesScreen";
    import RapportsScreen from "./RapportsScreen";

    import { getMembres } from "../services/membres.service";
    import { getProfilConnecte } from "../services/auth.service";
    import { styles } from "../styles/dashboard.styles";

    type Props = {
    nomCulte: string;
    };

    export default function DashboardScreen({ nomCulte }: Props) {
    const [moduleActif, setModuleActif] = useState<string | null>(null);
    const [membres, setMembres] = useState<any[]>([]);
    const [profil, setProfil] = useState<any>(null);

    useEffect(() => {
        chargerProfil();
        chargerMembres();
    }, []);

    async function chargerProfil() {
        try {
            const data = await getProfilConnecte();
            setProfil(data);
        } catch (error) {
            console.log("Profil non chargé :", error);
        }
    }

    async function chargerMembres() {
        const data = await getMembres();
        setMembres(data);
    }

    async function seDeconnecter() {
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        window.location.reload();
    }

    function peutVoirModule(module: string) {
        if (!profil) return false;
        if (profil.role === "pasteur") return true;

        if (profil.role === "tresoriere") {
        return module === "finances" || module === "rapports";
        }

        if (profil.role === "secretaire") {
        return (
            module === "membres" ||
            module === "visiteurs" ||
            module === "presences" ||
            module === "rapports"
        );
        }

        if (profil.role === "responsable") {
        return module === "membres" || module === "presences";
        }

        return false;
    }

    function getDateFormat(date: Date) {
        const jour = String(date.getDate()).padStart(2, "0");
        const mois = String(date.getMonth() + 1).padStart(2, "0");
        return `${jour}/${mois}`;
    }

    function getDatesProchainsJours(nombreJours: number) {
        const dates: string[] = [];

        for (let i = 0; i < nombreJours; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(getDateFormat(date));
        }

        return dates;
    }

    const aujourdHui = getDateFormat(new Date());

    const demainDate = new Date();
    demainDate.setDate(demainDate.getDate() + 1);
    const demain = getDateFormat(demainDate);

    const datesCetteSemaine = getDatesProchainsJours(7);

    const anniversairesAujourdhui = membres.filter(
        (membre) => membre.date_anniversaire === aujourdHui
    );

    const anniversairesDemain = membres.filter(
        (membre) => membre.date_anniversaire === demain
    );

    const anniversairesCetteSemaine = membres.filter((membre) =>
        datesCetteSemaine.includes(membre.date_anniversaire)
    );

    if (moduleActif === "membres") return <MembresScreen nomCulte={nomCulte} />;
    if (moduleActif === "visiteurs") return <VisiteursScreen />;
    if (moduleActif === "presences")
        return <PresencesScreen nomCulte={nomCulte} />;
    if (moduleActif === "departements") return <DepartementsScreen />;
    if (moduleActif === "finances") return <FinancesScreen />;
    if (moduleActif === "rapports") return <RapportsScreen />;

    return (
        <ScrollView style={styles.container}>
        <Text style={styles.title}>{nomCulte}</Text>

        {profil && (
            <Text style={styles.profileText}>
            Bonjour {profil.username} — {profil.role}
            </Text>
        )}

        <Pressable style={styles.logoutButton} onPress={seDeconnecter}>
            <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </Pressable>

        <View style={styles.birthdayBox}>
            <Text style={styles.birthdayTitle}>🎂 Anniversaires</Text>

            <Text style={styles.birthdaySubtitle}>Aujourd’hui</Text>
            {anniversairesAujourdhui.length === 0 ? (
            <Text style={styles.emptyText}>Aucun anniversaire aujourd’hui.</Text>
            ) : (
            anniversairesAujourdhui.map((membre) => (
                <Text key={membre.id} style={styles.birthdayItem}>
                🎉 {membre.nom} — {membre.telephone}
                </Text>
            ))
            )}

            <Text style={styles.birthdaySubtitle}>Demain</Text>
            {anniversairesDemain.length === 0 ? (
            <Text style={styles.emptyText}>Aucun anniversaire demain.</Text>
            ) : (
            anniversairesDemain.map((membre) => (
                <Text key={membre.id} style={styles.birthdayItem}>
                ⏰ {membre.nom} — {membre.telephone}
                </Text>
            ))
            )}

            <Text style={styles.birthdaySubtitle}>Cette semaine</Text>
            {anniversairesCetteSemaine.length === 0 ? (
            <Text style={styles.emptyText}>Aucun anniversaire cette semaine.</Text>
            ) : (
            anniversairesCetteSemaine.map((membre) => (
                <Text key={membre.id} style={styles.birthdayItem}>
                📅 {membre.nom} — {membre.date_anniversaire}
                </Text>
            ))
            )}
        </View>

        {peutVoirModule("membres") && (
            <Pressable style={styles.card} onPress={() => setModuleActif("membres")}>
            <Text style={styles.cardText}>Membres</Text>
            </Pressable>
        )}

        {peutVoirModule("visiteurs") && (
            <Pressable
            style={styles.card}
            onPress={() => setModuleActif("visiteurs")}
            >
            <Text style={styles.cardText}>Visiteurs</Text>
            </Pressable>
        )}

        {peutVoirModule("presences") && (
            <Pressable
            style={styles.card}
            onPress={() => setModuleActif("presences")}
            >
            <Text style={styles.cardText}>Présences</Text>
            </Pressable>
        )}

        {peutVoirModule("departements") && (
            <Pressable
            style={styles.card}
            onPress={() => setModuleActif("departements")}
            >
            <Text style={styles.cardText}>Départements</Text>
            </Pressable>
        )}

        {peutVoirModule("finances") && (
            <Pressable
            style={styles.card}
            onPress={() => setModuleActif("finances")}
            >
            <Text style={styles.cardText}>Finances</Text>
            </Pressable>
        )}

        {peutVoirModule("rapports") && (
            <Pressable
            style={styles.card}
            onPress={() => setModuleActif("rapports")}
            >
            <Text style={styles.cardText}>Rapports</Text>
            </Pressable>
        )}
        </ScrollView>
    );
    }