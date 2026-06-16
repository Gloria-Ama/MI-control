    import { useEffect, useState } from "react";
    import { Pressable, Text, TextInput, View, ScrollView } from "react-native";
    import { membresData, Membre } from "../data/membresData";
    import { styles } from "../styles/presences.styles";
    import { getMembres } from "../services/membres.service";
    import { getVisiteurs, createVisiteur, deleteVisiteur } from "../services/visiteurs.service";   
    import { getDepartements } from "../services/departements.service";
    import {getPresences,createPresence,updatePresence,} from "../services/presences.service";


    type Props = {
        nomCulte: string;
    };
    type Visiteur = {
        id: number;
        nom: string;
        telephone: string;
        email: string;
        sexe: string;
    };

    export default function PresencesScreen({ nomCulte }: Props) {
    const [membres, setMembres] = useState<Membre[]>([]);
    const [membresPresents, setMembresPresents] = useState<number[]>([]);
    const [visiteurs, setVisiteurs] = useState<Visiteur[]>([]);
    const [nomVisiteur, setNomVisiteur] = useState("");
    const [telephoneVisiteur, setTelephoneVisiteur] = useState("");
    const [emailVisiteur, setEmailVisiteur] = useState("");
    const [sexeVisiteur, setSexeVisiteur] = useState("");
    const [departements, setDepartements] = useState<any[]>([]);
    const [voirStats, setVoirStats] = useState(false);
    const [afficherFormulaireVisiteur, setAfficherFormulaireVisiteur] =useState(false);
    const [afficherChoixSexeVisiteur, setAfficherChoixSexeVisiteur] =useState(false);
    const dateDuJour = new Date().toISOString().split("T")[0];
    const totalHommes = membres.filter((membre) => membre.sexe === "Masculin").length;
    const totalAutres = membres.filter((membre) => membre.sexe === "Autre").length;
    const [presences, setPresences] = useState<any[]>([]);
    const [voirHistorique, setVoirHistorique] = useState(false);
    const [dateHistoriqueOuverte, setDateHistoriqueOuverte] = useState<string | null>(null);



    useEffect(() => {chargerMembres();chargerVisiteurs();chargerDepartements();chargerPresences();}, []);
    useEffect(() => {chargerVisiteurs();}, []);
    useEffect(() => {chargerMembres();chargerVisiteurs();chargerDepartements();}, []);

    async function chargerPresences() {
        const data = await getPresences();
        setPresences(data);
    }

    async function chargerVisiteurs() {
        const data = await getVisiteurs();
        setVisiteurs(data);
    }

    async function chargerMembres() {
        const data = await getMembres();
        setMembres(data);
    }

    async function chargerDepartements() {
        const data = await getDepartements();
        setDepartements(data);
    }

    function trouverNomDepartement(id: number | null) {
        if (!id) return "Aucun département";
        const dep = departements.find((d) => d.id === id);
        return dep ? dep.nom : "Aucun département";
    }


    function cocherMembre(id: number) {
        if (membresPresents.includes(id)) {
        setMembresPresents(membresPresents.filter((membreId) => membreId !== id));
        } else {
        setMembresPresents([...membresPresents, id]);
        }
    }

    function choisirSexeVisiteur(valeur: string) {
        setSexeVisiteur(valeur);
        setAfficherChoixSexeVisiteur(false);
    }

    async function ajouterVisiteur() {
        if (!nomVisiteur.trim() || !telephoneVisiteur.trim()) {
            alert("Veuillez entrer le nom et le téléphone du visiteur.");
            return;
        }
        const nouveauVisiteur = {
            nom: nomVisiteur,
            telephone: telephoneVisiteur,
            email: emailVisiteur,
            sexe:
            sexeVisiteur === "Féminin"
                ? "feminin"
                : sexeVisiteur === "Masculin"
                ? "masculin"
                : sexeVisiteur === "Autre"
                ? "autre"
                : "",
            communaute_culte: 1,
            notes: "",
        };
        try {
            await createVisiteur(nouveauVisiteur);
            await chargerVisiteurs();
            setNomVisiteur("");
            setTelephoneVisiteur("");
            setEmailVisiteur("");
            setSexeVisiteur("");
            setAfficherFormulaireVisiteur(false);
            alert("Visiteur enregistré !");
        } catch (error: any) {
            console.log(error.response?.data || error.message);
            alert("Erreur lors de l'enregistrement.");
        }
    }

    const membresAbsents = membres.filter(
        (membre) => !membresPresents.includes(membre.id)
    );

    const membresPresentsComplets = membres.filter((membre) =>
        membresPresents.includes(membre.id)
    );

    const femmesPresentes = membresPresentsComplets.filter(
        (membre) => membre.sexe === "Féminin"
    ).length;

    const hommesPresents = membresPresentsComplets.filter(
        (membre) => membre.sexe === "Masculin"
    ).length;

    const autresPresents = membresPresentsComplets.filter(
        (membre) => membre.sexe === "Autre"
    ).length;

    const visiteursFemmes = visiteurs.filter(
        (visiteur) => visiteur.sexe === "Feminin"
    ).length;

    const visiteursHommes = visiteurs.filter(
        (visiteur) => visiteur.sexe === "Masculin"
    ).length;

    const visiteursAutres = visiteurs.filter(
        (visiteur) => visiteur.sexe === "Autre"
    ).length;

    const totalPresents = membresPresents.length + visiteurs.length;
    const totalFemmes = membres.filter(
    (membre) => membre.sexe === "feminin"
    ).length;

    if (voirHistorique) {
        const datesUniques = [
            ...new Set(presences.map((p) => p.date)),
        ].sort().reverse();

        return (
            <ScrollView style={styles.container}>
            <Text style={styles.title}>
                Historique des présences
            </Text>

            {datesUniques.map((date) => {
                const presencesDate = presences.filter(
                (p) => p.date === date
                );

                const presents = presencesDate.filter(
                (p) => p.present
                );

                const absents = presencesDate.filter(
                (p) => !p.present
                );

                return (
                <View
                    key={date}
                    style={styles.departmentCard}
                >
                    <Text style={styles.departmentTitle}>
                    {date}
                    </Text>

                    <Text style={styles.statText}>
                    Présents : {presents.length}
                    </Text>

                    <Text style={styles.statText}>
                    Absents : {absents.length}
                    </Text>

                    <Pressable
                        style={styles.secondaryButton}
                        onPress={() =>
                            setDateHistoriqueOuverte(
                            dateHistoriqueOuverte === date ? null : date
                            )
                        }
                        >
                        <Text style={styles.secondaryButtonText}>
                            En savoir plus
                        </Text>
                        </Pressable>

                        {dateHistoriqueOuverte === date && (
                        <View>
                            <Text style={styles.smallTitle}>Présents</Text>
                            {presents.map((presence) => {
                            const membre = membres.find((m) => m.id === presence.membre);
                            return (
                                <Text key={presence.id}>
                                ✅ {membre ? membre.nom : "Membre inconnu"}
                                </Text>
                            );
                            })}

                            <Text style={styles.smallTitle}>Absents</Text>
                            {absents.map((presence) => {
                            const membre = membres.find((m) => m.id === presence.membre);
                            return (
                                <Text key={presence.id}>
                                ❌ {membre ? membre.nom : "Membre inconnu"}
                                </Text>
                            );
                            })}
                        </View>
                        )}
                </View>
                );
            })}

            <Pressable
                style={styles.saveButton}
                onPress={() => setVoirHistorique(false)}
            >
                <Text style={styles.saveButtonText}>
                Retour
                </Text>
            </Pressable>
            </ScrollView>
        );
        }

    if (voirStats) {
        return (
        <ScrollView style={styles.container}>
            <Text style={styles.sectionTitle}>
                Composition de l'église
            </Text>
            <View style={styles.statsBox}>
            <Text style={styles.statText}>
                Total membres : {membres.length}
            </Text>
            <Text style={styles.statText}>
                Femmes : {totalFemmes}
            </Text>
            <Text style={styles.statText}>
                Hommes : {totalHommes}
            </Text>
            <Text style={styles.statText}>
                Autres : {totalAutres}
            </Text>
            </View>
            <Text style={styles.title}>Statistiques</Text>
            <Text style={styles.subtitle}>{nomCulte}</Text>
            <Text style={styles.date}>Date : {dateDuJour}</Text>

            <View style={styles.statsBox}>
            <Text style={styles.statText}>
                Membres présents : {membresPresents.length}
            </Text>
            <Text style={styles.statText}>
                Membres absents : {membresAbsents.length}
            </Text>
            <Text style={styles.statText}>Visiteurs : {visiteurs.length}</Text>
            <Text style={styles.statTotal}>Total présents : {totalPresents}</Text>
            </View>

            <Text style={styles.sectionTitle}>Statistiques par sexe</Text>

            <View style={styles.statsBox}>
            <Text style={styles.statText}>
                Femmes présentes : {femmesPresentes + visiteursFemmes}
            </Text>
            <Text style={styles.statText}>
                Hommes présents : {hommesPresents + visiteursHommes}
            </Text>
            <Text style={styles.statText}>
                Autres présents : {autresPresents + visiteursAutres}
            </Text>
            </View>

            <Text style={styles.sectionTitle}>Résumé par département</Text>
                {departements.map((departement) => {
                const membresDuDepartement = membres.filter(
                    (membre) => membre.departement === departement.id
                );

                const presents = membresDuDepartement.filter((membre) =>
                    membresPresents.includes(membre.id)
                );

                const absents = membresDuDepartement.filter(
                    (membre) => !membresPresents.includes(membre.id)
                );

                const taux =
                    membresDuDepartement.length === 0
                    ? 0
                    : Math.round(
                        (presents.length / membresDuDepartement.length) * 100
                        );

                return (
                    <View key={departement.id} style={styles.departmentCard}>
                    <Text style={styles.departmentTitle}>
                        {departement.nom}
                    </Text>
                <Text style={styles.statText}>Présents : {presents.length}</Text>
                <Text style={styles.statText}>Absents : {absents.length}</Text>
                <Text style={styles.statText}>Taux de présence : {taux}%</Text>

                <Text style={styles.smallTitle}>Présents</Text>
                {presents.length === 0 ? (
                    <Text style={styles.emptyText}>Aucun présent</Text>
                ) : (
                    presents.map((membre) => (
                    <Text key={membre.id}>✅ {membre.nom}</Text>
                    ))
                )}

                <Text style={styles.smallTitle}>Absents</Text>
                {absents.length === 0 ? (
                    <Text style={styles.emptyText}>Aucun absent</Text>
                ) : (
                    absents.map((membre) => (
                    <Text key={membre.id}>❌ {membre.nom}</Text>
                    ))
                )}
                </View>
            );
            })}

            <Text style={styles.sectionTitle}>Visiteurs du jour</Text>

            {visiteurs.length === 0 ? (
            <Text style={styles.emptyText}>Aucun visiteur ajouté.</Text>
            ) : (
            visiteurs.map((visiteur) => (
                <Text key={visiteur.id}>
                🆕 {visiteur.nom} — {visiteur.telephone}
                {visiteur.sexe ? ` — ${visiteur.sexe}` : ""}
                </Text>
            ))
            )}

            <Pressable
            style={styles.saveButton}
            onPress={() => setVoirStats(false)}
            >
            <Text style={styles.saveButtonText}>Retour aux présences</Text>
            </Pressable>
        </ScrollView>
        );
    }

    async function enregistrerPresences() {
        try {
            const presencesExistantes = await getPresences();
            for (const membre of membres) {
            const presenceDejaExiste = presencesExistantes.find(
                (presence: any) =>
                presence.membre === membre.id &&
                presence.date === dateDuJour &&
                presence.communaute_culte === 1
            );
            const dataPresence = {
                communaute_culte: 1,
                membre: membre.id,
                date: dateDuJour,
                present: membresPresents.includes(membre.id),
            };
            if (presenceDejaExiste) {
                await updatePresence(presenceDejaExiste.id, dataPresence);
            } else {
                await createPresence(dataPresence);
            }
            }
            alert("Présences enregistrées !");
            setVoirStats(true);
        } catch (error: any) {
            console.log("Erreur présence :", error.response?.data || error.message);
            alert("Erreur lors de l'enregistrement des présences.");
        }
}
    return (
        <ScrollView style={styles.container}>
        <Text style={styles.title}>Présences</Text>
        <Text style={styles.subtitle}>{nomCulte}</Text>
        <Text style={styles.date}>Date : {dateDuJour}</Text>

        <Text style={styles.sectionTitle}>Membres</Text>

        {membres.length === 0 && (
            <Text style={styles.emptyText}>Aucun membre ajouté pour le moment.</Text>
        )}

        {membres.map((membre) => (
            <Pressable
            key={membre.id}
            style={styles.memberRow}
            onPress={() => cocherMembre(membre.id)}
            >
            <View>
                <Text style={styles.memberText}>{membre.nom}</Text>
                <Text style={styles.memberDepartment}>{trouverNomDepartement(membre.departement)}</Text>
            </View>

            <Text style={styles.checkbox}>
                {membresPresents.includes(membre.id) ? "☑️" : "⬜"}
            </Text>
            </Pressable>
        ))}

        <Text style={styles.sectionTitle}>Visiteurs du jour</Text>

        <Pressable
            style={styles.addVisitorButton}
            onPress={() =>
            setAfficherFormulaireVisiteur(!afficherFormulaireVisiteur)
            }
        >
            <Text style={styles.addVisitorButtonText}>🆕 Ajouter un visiteur</Text>
        </Pressable>

        {afficherFormulaireVisiteur && (
            <>
            <TextInput
                style={styles.input}
                placeholder="Nom du visiteur"
                value={nomVisiteur}
                onChangeText={setNomVisiteur}
            />

            <TextInput
                style={styles.input}
                placeholder="Téléphone du visiteur"
                value={telephoneVisiteur}
                onChangeText={setTelephoneVisiteur}
                keyboardType="phone-pad"
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={emailVisiteur}
                onChangeText={setEmailVisiteur}
                keyboardType="email-address"
            />

            <Text style={styles.label}>Sexe</Text>

            <Pressable
                style={styles.selectBox}
                onPress={() =>
                setAfficherChoixSexeVisiteur(!afficherChoixSexeVisiteur)
                }
            >
                <Text style={styles.selectText}>
                {sexeVisiteur || "Choisir le sexe"}
                </Text>
            </Pressable>

            {afficherChoixSexeVisiteur && (
                <View style={styles.selectOptions}>
                <Pressable
                    style={styles.selectOption}
                    onPress={() => choisirSexeVisiteur("Féminin")}
                >
                    <Text>Féminin</Text>
                </Pressable>

                <Pressable
                    style={styles.selectOption}
                    onPress={() => choisirSexeVisiteur("Masculin")}
                >
                    <Text>Masculin</Text>
                </Pressable>

                <Pressable
                    style={styles.selectOption}
                    onPress={() => choisirSexeVisiteur("Autre")}
                >
                    <Text>Autre</Text>
                </Pressable>
                </View>
            )}

            <Pressable style={styles.secondaryButton} onPress={ajouterVisiteur}>
                <Text style={styles.secondaryButtonText}>
                Enregistrer le visiteur
                </Text>
            </Pressable>
            </>
        )}

        {visiteurs.map((visiteur) => (
            <Text key={visiteur.id}>
            🆕 {visiteur.nom} — {visiteur.telephone}
            {visiteur.sexe ? ` — ${visiteur.sexe}` : ""}
            </Text>
        ))}
        <Pressable style={styles.secondaryButton}onPress={() => setVoirHistorique(true)}>
            <Text style={styles.secondaryButtonText}>Historique des présences</Text>
        </Pressable>
        <Pressable style={styles.saveButton} onPress={enregistrerPresences}>
            <Text style={styles.saveButtonText}>Voir statistiques</Text>
        </Pressable>
        </ScrollView>
    );
    }