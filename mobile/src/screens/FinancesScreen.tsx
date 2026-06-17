    import { useState } from "react";
    import { Pressable, Text, TextInput, View } from "react-native";
    import { styles } from "../styles/finances.styles";

    type Demande = {
    id: number;
    type: "financement" | "remboursement";
    responsable: string;
    departement: string;
    montant: string;
    motif: string;
    statut: "En attente" | "Approuvée" | "Refusée" | "Remboursée";
    };

    export default function FinancesScreen() {
    const [typeDemande, setTypeDemande] = useState<"financement" | "remboursement">("financement");
    const [responsable, setResponsable] = useState("");
    const [departement, setDepartement] = useState("");
    const [montant, setMontant] = useState("");
    const [motif, setMotif] = useState("");
    const [demandes, setDemandes] = useState<Demande[]>([]);

    function ajouterDemande() {
        if (!responsable || !departement || !montant || !motif) {
        alert("Veuillez remplir tous les champs.");
        return;
        }

        setDemandes([
        ...demandes,
        {
            id: Date.now(),
            type: typeDemande,
            responsable,
            departement,
            montant,
            motif,
            statut: "En attente",
        },
        ]);

        setResponsable("");
        setDepartement("");
        setMontant("");
        setMotif("");
    }

    function approuverDemande(id: number) {
        setDemandes(demandes.map((d) => d.id === id ? { ...d, statut: "Approuvée" } : d));
    }

    function refuserDemande(id: number) {
        setDemandes(demandes.map((d) => d.id === id ? { ...d, statut: "Refusée" } : d));
    }

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Finances</Text>

        <View style={styles.switchRow}>
            <Pressable
            style={[styles.switchButton, typeDemande === "financement" && styles.activeSwitch]}
            onPress={() => setTypeDemande("financement")}
            >
            <Text style={styles.switchText}>Financement</Text>
            </Pressable>

            <Pressable
            style={[styles.switchButton, typeDemande === "remboursement" && styles.activeSwitch]}
            onPress={() => setTypeDemande("remboursement")}
            >
            <Text style={styles.switchText}>Remboursement</Text>
            </Pressable>
        </View>

        <TextInput style={styles.input} placeholder="Nom du responsable" value={responsable} onChangeText={setResponsable} />
        <TextInput style={styles.input} placeholder="Département" value={departement} onChangeText={setDepartement} />
        <TextInput style={styles.input} placeholder="Montant" value={montant} onChangeText={setMontant} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Motif / description" value={motif} onChangeText={setMotif} />

        {typeDemande === "remboursement" && (
            <Text style={styles.receiptNote}>Photo du reçu à ajouter plus tard</Text>
        )}

        <Pressable style={styles.button} onPress={ajouterDemande}>
            <Text style={styles.buttonText}>Soumettre la demande</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Demandes</Text>

        {demandes.map((demande) => (
            <View key={demande.id} style={styles.card}>
            <Text style={styles.cardTitle}>
                {demande.type === "financement" ? "Demande de financement" : "Demande de remboursement"}
            </Text>
            <Text>Responsable : {demande.responsable}</Text>
            <Text>Département : {demande.departement}</Text>
            <Text>Montant : {demande.montant} $</Text>
            <Text>Motif : {demande.motif}</Text>
            <Text>Statut : {demande.statut}</Text>

            {demande.statut === "En attente" && (
                <View style={styles.actionRow}>
                <Pressable style={styles.approveButton} onPress={() => approuverDemande(demande.id)}>
                    <Text style={styles.actionText}>Approuver</Text>
                </Pressable>

                <Pressable style={styles.refuseButton} onPress={() => refuserDemande(demande.id)}>
                    <Text style={styles.actionText}>Refuser</Text>
                </Pressable>
                </View>
            )}
            </View>
        ))}
        </View>
    );
}