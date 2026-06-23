    import { useState } from "react";
    import {
    View, Text, TextInput, Pressable,
    Modal, FlatList, StyleSheet, SafeAreaView,
    } from "react-native";

    const PAYS = [
    { code: "CA", nom: "Canada",              indicatif: "+1",   drapeau: "🇨🇦", longueur: 10 },
    { code: "US", nom: "États-Unis",          indicatif: "+1",   drapeau: "🇺🇸", longueur: 10 },
    { code: "FR", nom: "France",              indicatif: "+33",  drapeau: "🇫🇷", longueur: 9  },
    { code: "BE", nom: "Belgique",            indicatif: "+32",  drapeau: "🇧🇪", longueur: 9  },
    { code: "CH", nom: "Suisse",              indicatif: "+41",  drapeau: "🇨🇭", longueur: 9  },
    { code: "HT", nom: "Haïti",              indicatif: "+509", drapeau: "🇭🇹", longueur: 8  },
    { code: "CD", nom: "Congo (RDC)",         indicatif: "+243", drapeau: "🇨🇩", longueur: 9  },
    { code: "CG", nom: "Congo (Brazzaville)", indicatif: "+242", drapeau: "🇨🇬", longueur: 9  },
    { code: "CM", nom: "Cameroun",            indicatif: "+237", drapeau: "🇨🇲", longueur: 9  },
    { code: "CI", nom: "Côte d'Ivoire",       indicatif: "+225", drapeau: "🇨🇮", longueur: 10 },
    { code: "SN", nom: "Sénégal",            indicatif: "+221", drapeau: "🇸🇳", longueur: 9  },
    { code: "GA", nom: "Gabon",              indicatif: "+241", drapeau: "🇬🇦", longueur: 8  },
    { code: "BJ", nom: "Bénin",             indicatif: "+229", drapeau: "🇧🇯", longueur: 8  },
    { code: "TG", nom: "Togo",               indicatif: "+228", drapeau: "🇹🇬", longueur: 8  },
    { code: "GN", nom: "Guinée",            indicatif: "+224", drapeau: "🇬🇳", longueur: 9  },
    { code: "BF", nom: "Burkina Faso",       indicatif: "+226", drapeau: "🇧🇫", longueur: 8  },
    { code: "ML", nom: "Mali",               indicatif: "+223", drapeau: "🇲🇱", longueur: 8  },
    { code: "NE", nom: "Niger",              indicatif: "+227", drapeau: "🇳🇪", longueur: 8  },
    { code: "NG", nom: "Nigeria",            indicatif: "+234", drapeau: "🇳🇬", longueur: 10 },
    { code: "GH", nom: "Ghana",              indicatif: "+233", drapeau: "🇬🇭", longueur: 9  },
    { code: "MG", nom: "Madagascar",         indicatif: "+261", drapeau: "🇲🇬", longueur: 9  },
    { code: "MA", nom: "Maroc",             indicatif: "+212", drapeau: "🇲🇦", longueur: 9  },
    { code: "TN", nom: "Tunisie",            indicatif: "+216", drapeau: "🇹🇳", longueur: 8  },
    { code: "DZ", nom: "Algérie",           indicatif: "+213", drapeau: "🇩🇿", longueur: 9  },
    { code: "AO", nom: "Angola",             indicatif: "+244", drapeau: "🇦🇴", longueur: 9  },
    { code: "KE", nom: "Kenya",              indicatif: "+254", drapeau: "🇰🇪", longueur: 9  },
    { code: "GB", nom: "Royaume-Uni",        indicatif: "+44",  drapeau: "🇬🇧", longueur: 10 },
    { code: "DE", nom: "Allemagne",          indicatif: "+49",  drapeau: "🇩🇪", longueur: 11 },
    { code: "IT", nom: "Italie",             indicatif: "+39",  drapeau: "🇮🇹", longueur: 10 },
    { code: "ES", nom: "Espagne",            indicatif: "+34",  drapeau: "🇪🇸", longueur: 9  },
    { code: "PT", nom: "Portugal",           indicatif: "+351", drapeau: "🇵🇹", longueur: 9  },
    { code: "BR", nom: "Brésil",           indicatif: "+55",  drapeau: "🇧🇷", longueur: 11 },
    ];

    type Props = {
    valeur: string;
    onChange: (telephone: string, valide: boolean) => void;
    erreur?: string;
    };

    export default function PhoneInput({ valeur, onChange, erreur }: Props) {
    const [paysSelectionne, setPaysSelectionne] = useState(PAYS[0]);
    const [numero, setNumero] = useState(
        valeur ? valeur.replace(/^\+\d+\s?/, "") : ""
    );
    const [modalVisible, setModalVisible] = useState(false);
    const [recherche, setRecherche] = useState("");
    const [erreurLocale, setErreurLocale] = useState("");

    const paysFiltres = PAYS.filter(p =>
        p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
        p.indicatif.includes(recherche)
    );

    function validerNumero(num: string, pays: typeof PAYS[0]): boolean {
        const chiffres = num.replace(/\D/g, "");
        return chiffres.length >= pays.longueur;
    }

    function choisirPays(pays: typeof PAYS[0]) {
        setPaysSelectionne(pays);
        setModalVisible(false);
        setRecherche("");
        const valide = validerNumero(numero, pays);
        setErreurLocale(
        valide ? "" : `${pays.longueur} chiffres requis pour ${pays.nom}`
        );
        onChange(`${pays.indicatif} ${numero}`, valide);
    }

    function changerNumero(v: string) {
        const filtre = v.replace(/[^\d\s\-]/g, "");
        setNumero(filtre);
        const valide = validerNumero(filtre, paysSelectionne);
        if (filtre.length > 0) {
        setErreurLocale(
            valide ? "" : `${paysSelectionne.longueur} chiffres requis pour ${paysSelectionne.nom}`
        );
        } else {
        setErreurLocale("");
        }
        onChange(`${paysSelectionne.indicatif} ${filtre}`, valide);
    }

    const afficherErreur = erreur || erreurLocale;

    return (
        <>
        <View style={ps.row}>
            <Pressable style={ps.paysBtn} onPress={() => setModalVisible(true)}>
            <Text style={ps.drapeau}>{paysSelectionne.drapeau}</Text>
            <Text style={ps.indicatif}>{paysSelectionne.indicatif}</Text>
            <Text style={ps.chevron}>▼</Text>
            </Pressable>
            <TextInput
            style={[ps.input, afficherErreur ? ps.inputErreur : numero.length > 0 && validerNumero(numero, paysSelectionne) ? ps.inputValide : null]}
            value={numero}
            onChangeText={changerNumero}
            keyboardType="phone-pad"
            placeholder={`${"0".repeat(paysSelectionne.longueur)}`}
            placeholderTextColor="#94A3B8"
            maxLength={paysSelectionne.longueur + 3}
            />
        </View>

        {afficherErreur ? (
            <Text style={ps.erreurTexte}>⚠ {afficherErreur}</Text>
        ) : numero.length > 0 && validerNumero(numero, paysSelectionne) ? (
            <Text style={ps.valideTexte}>✓ Numéro valide</Text>
        ) : null}

        <Modal
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
        >
            <SafeAreaView style={ps.modal}>
            <View style={ps.modalHeader}>
                <Text style={ps.modalTitre}>Choisir un pays</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                <Text style={ps.modalFermer}>✕</Text>
                </Pressable>
            </View>
            <View style={ps.modalRecherche}>
                <TextInput
                style={ps.modalInput}
                placeholder="🔍  Rechercher un pays..."
                placeholderTextColor="#94A3B8"
                value={recherche}
                onChangeText={setRecherche}
                autoFocus
                />
            </View>
            <FlatList
                data={paysFiltres}
                keyExtractor={item => item.code}
                renderItem={({ item }) => (
                <Pressable
                    style={[
                    ps.paysOption,
                    paysSelectionne.code === item.code && ps.paysOptionActif,
                    ]}
                    onPress={() => choisirPays(item)}
                >
                    <Text style={ps.paysDrapeau}>{item.drapeau}</Text>
                    <View style={{ flex: 1 }}>
                    <Text style={ps.paysNom}>{item.nom}</Text>
                    <Text style={ps.paysDetail}>{item.longueur} chiffres</Text>
                    </View>
                    <Text style={ps.paysIndicatif}>{item.indicatif}</Text>
                    {paysSelectionne.code === item.code && (
                    <Text style={ps.paysCheck}>✓</Text>
                    )}
                </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={ps.separateur} />}
            />
            </SafeAreaView>
        </Modal>
        </>
    );
    }

    const ps = StyleSheet.create({
    row: { flexDirection: "row", gap: 8, marginBottom: 4 },
    paysBtn: {
        backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14,
        borderWidth: 0.5, borderColor: "#E2E8F0",
        flexDirection: "row", alignItems: "center", gap: 6,
    },
    drapeau: { fontSize: 20 },
    indicatif: { fontSize: 13, fontWeight: "700", color: "#1E293B" },
    chevron: { fontSize: 10, color: "#94A3B8" },
    input: {
        flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14,
        fontSize: 15, color: "#1E293B", borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    inputErreur: { borderColor: "#EF4444", borderWidth: 1.5 },
    inputValide: { borderColor: "#10B981", borderWidth: 1.5 },
    erreurTexte: { fontSize: 12, color: "#EF4444", marginTop: 4, marginBottom: 12 },
    valideTexte: { fontSize: 12, color: "#10B981", marginTop: 4, marginBottom: 12 },
    modal: { flex: 1, backgroundColor: "#F8F5F0" },
    modalHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        padding: 16, backgroundColor: "#07074C",
    },
    modalTitre: { color: "#fff", fontSize: 17, fontWeight: "700" },
    modalFermer: { color: "#94A3B8", fontSize: 22, padding: 4 },
    modalRecherche: {
        padding: 12, backgroundColor: "#fff",
        borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0",
    },
    modalInput: {
        backgroundColor: "#F8F5F0", borderRadius: 10, padding: 10,
        fontSize: 14, color: "#1E293B", borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    paysOption: {
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingVertical: 14, paddingHorizontal: 16, backgroundColor: "#fff",
    },
    paysOptionActif: { backgroundColor: "#EEF2FF" },
    paysDrapeau: { fontSize: 22 },
    paysNom: { fontSize: 14, color: "#1E293B", fontWeight: "500" },
    paysDetail: { fontSize: 11, color: "#94A3B8", marginTop: 1 },
    paysIndicatif: { fontSize: 13, color: "#64748B", fontWeight: "600" },
    paysCheck: { fontSize: 16, color: "#4F46E5", fontWeight: "700" },
    separateur: { height: 0.5, backgroundColor: "#F1F5F9", marginLeft: 60 },
    });