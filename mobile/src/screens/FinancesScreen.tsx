    import { useEffect, useState } from "react";
    import {
    View, Text, TextInput, ScrollView, Pressable, Image,
    Alert, ActivityIndicator, SafeAreaView, Modal,
    } from "react-native";
    import * as ImagePicker from "expo-image-picker";
    import {
    getDemandes, createDemande, approuverDemande, refuserDemande, rembourserDemande,
    getTransactions, createTransaction, deleteTransaction, getResume,
    } from "../services/finances.service";
    import { getProfilConnecte } from "../services/auth.service";
    import { api } from "../services/api";
    import { fs } from "../styles/finances.styles";

    type Demande = {
    id: number; type: string; type_label: string;
    responsable: number | null; responsable_nom: string | null;
    departement: number | null; departement_nom: string | null;
    communaute_culte: number; montant: string; motif: string;
    statut: string; statut_label: string; date_demande: string;
    notes_traitement: string; pieces_jointes_list: string[];
    };

    type Transaction = {
    id: number; type: string; type_label: string;
    est_entree: boolean; montant: string; description: string;
    date: string; responsable_nom: string | null;
    };

    type Resume = {
    total_entrees: number; total_sorties: number; solde: number;
    par_type: Record<string, { label: string; montant: number }>;
    };

    type Departement = { id: number; nom: string };

    const FILTRES_STATUT = [
    { valeur: "", label: "Toutes" },
    { valeur: "en_attente", label: "En attente" },
    { valeur: "approuvee", label: "Approuvées" },
    { valeur: "refusee", label: "Refusées" },
    { valeur: "remboursee", label: "Remboursées" },
    ];

    const TYPES_TRANSACTION = [
    { valeur: "offrande",  label: "🙏 Offrande",     entree: true },
    { valeur: "cotisation",label: "💳 Cotisation",    entree: true },
    { valeur: "dime",      label: "✝️ Dîme",          entree: true },
    { valeur: "don",       label: "🎁 Don",            entree: true },
    { valeur: "entree",    label: "📥 Autre entrée",   entree: true },
    { valeur: "sortie",    label: "📤 Sortie",         entree: false },
    { valeur: "depense",   label: "🧾 Dépense",        entree: false },
    ];

    export default function FinancesScreen() {
    const [onglet, setOnglet] = useState<"demandes" | "nouvelle_demande" | "comptabilite" | "nouvelle_transaction">("demandes");
    const [demandes, setDemandes] = useState<Demande[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [resume, setResume] = useState<Resume | null>(null);
    const [departements, setDepartements] = useState<Departement[]>([]);
    const [profil, setProfil] = useState<any>(null);
    const [communauteId, setCommunauteId] = useState<number | undefined>();
    const [chargement, setChargement] = useState(true);
    const [filtreStatut, setFiltreStatut] = useState("");
    const [sauvegarde, setSauvegarde] = useState(false);

    const [typeDemande, setTypeDemande] = useState<"financement" | "remboursement">("financement");
    const [montantDemande, setMontantDemande] = useState("");
    const [motif, setMotif] = useState("");
    const [departementId, setDepartementId] = useState<number | null>(null);
    const [deptOuvert, setDeptOuvert] = useState(false);
    const [piecesJointes, setPiecesJointes] = useState<string[]>([]);
    const [imageSelectionnee, setImageSelectionnee] = useState<string | null>(null);

    const [typeTransaction, setTypeTransaction] = useState("offrande");
    const [montantTransaction, setMontantTransaction] = useState("");
    const [descriptionTransaction, setDescriptionTransaction] = useState("");
    const [dateTransaction, setDateTransaction] = useState(new Date().toISOString().split("T")[0]);

    const peutApprouver = profil?.role === "pasteur" ||
        profil?.role === "administrateur" ||
        profil?.role === "tresoriere";

    useEffect(() => { chargerDonnees(); }, []);

    async function chargerDonnees() {
        setChargement(true);
        try {
        const p = await getProfilConnecte().catch(() => null);
        setProfil(p);
        const cultes = await api.get("/communautes/").then(r => r.data).catch(() => []);
        let cid = p?.communaute_culte ? Number(p.communaute_culte) : undefined;
        if (!cid && cultes.length > 0) cid = Number(cultes[0].id);
        setCommunauteId(cid);
        const deptUrl = cid ? `/departements/?communaute_culte=${cid}` : "/departements/";
        const [d, dem, trans, res] = await Promise.all([
            api.get(deptUrl).then(r => r.data).catch(() => []),
            getDemandes({ communaute_culte: cid }).catch(() => []),
            getTransactions({ communaute_culte: cid }).catch(() => []),
            getResume(cid).catch(() => null),
        ]);
        setDepartements(Array.isArray(d) ? d : []);
        setDemandes(Array.isArray(dem) ? dem : []);
        setTransactions(Array.isArray(trans) ? trans : []);
        setResume(res);
        } catch {
        Alert.alert("Erreur", "Impossible de charger les données.");
        } finally {
        setChargement(false);
        }
    }

    async function choisirPhoto() {
        try {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) { Alert.alert("Permission refusée", "Autorisation galerie requise."); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: true });
        if (!result.canceled && result.assets[0].base64) {
            setPiecesJointes(prev => [...prev, `data:image/jpeg;base64,${result.assets[0].base64}`]);
        }
        } catch { Alert.alert("Erreur", "Impossible d'accéder à la galerie."); }
    }

    async function prendrePhoto() {
        try {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) { Alert.alert("Permission refusée", "Autorisation appareil photo requise."); return; }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: true });
        if (!result.canceled && result.assets[0].base64) {
            setPiecesJointes(prev => [...prev, `data:image/jpeg;base64,${result.assets[0].base64}`]);
        }
        } catch { Alert.alert("Erreur", "Impossible d'accéder à l'appareil photo."); }
    }

    function supprimerPiece(index: number) {
        setPiecesJointes(prev => prev.filter((_, i) => i !== index));
    }

    async function soumettreDemande() {
        if (!montantDemande.trim() || !motif.trim()) { Alert.alert("Champs requis", "Le montant et le motif sont obligatoires."); return; }
        if (isNaN(Number(montantDemande)) || Number(montantDemande) <= 0) { Alert.alert("Montant invalide", "Entrez un montant valide."); return; }
        setSauvegarde(true);
        try {
        await createDemande({ type: typeDemande, montant: Number(montantDemande), motif: motif.trim(), departement: departementId || null, communaute_culte: communauteId, pieces_jointes: JSON.stringify(piecesJointes) });
        setMontantDemande(""); setMotif(""); setDepartementId(null); setPiecesJointes([]);
        setOnglet("demandes");
        Alert.alert("✅ Demande soumise !");
        await chargerDonnees();
        } catch (error: any) {
        Alert.alert("Erreur", error?.response?.data ? JSON.stringify(error.response.data, null, 2) : "Impossible de soumettre.");
        } finally { setSauvegarde(false); }
    }

    async function soumettreTransaction() {
        if (!montantTransaction.trim() || isNaN(Number(montantTransaction)) || Number(montantTransaction) <= 0) { Alert.alert("Montant invalide", "Entrez un montant valide."); return; }
        setSauvegarde(true);
        try {
        await createTransaction({ type: typeTransaction, montant: Number(montantTransaction), description: descriptionTransaction.trim(), date: dateTransaction, communaute_culte: communauteId, culte_date: dateTransaction });
        setMontantTransaction(""); setDescriptionTransaction("");
        setOnglet("comptabilite");
        Alert.alert("✅ Transaction enregistrée !");
        await chargerDonnees();
        } catch (error: any) {
        Alert.alert("Erreur", error?.response?.data ? JSON.stringify(error.response.data, null, 2) : "Impossible d'enregistrer.");
        } finally { setSauvegarde(false); }
    }

    async function handleApprouver(demande: Demande) {
        Alert.alert("Approuver ?", `Approuver la demande de ${demande.montant}$ ?`, [
        { text: "Annuler", style: "cancel" },
        { text: "Approuver", onPress: async () => { await approuverDemande(demande.id); await chargerDonnees(); } },
        ]);
    }

    async function handleRefuser(demande: Demande) {
        Alert.alert("Refuser ?", `Refuser la demande de ${demande.montant}$ ?`, [
        { text: "Annuler", style: "cancel" },
        { text: "Refuser", style: "destructive", onPress: async () => { await refuserDemande(demande.id); await chargerDonnees(); } },
        ]);
    }

    async function handleRembourser(demande: Demande) {
        await rembourserDemande(demande.id); await chargerDonnees();
    }

    async function handleSupprimerTransaction(t: Transaction) {
        Alert.alert("Supprimer ?", `Supprimer la transaction de ${t.montant}$ ?`, [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: async () => { await deleteTransaction(t.id); await chargerDonnees(); } },
        ]);
    }

    function formatDate(s: string) {
        try { return new Date(s).toLocaleDateString("fr-FR"); } catch { return s; }
    }

    function statutStyle(statut: string) {
        switch (statut) {
        case "en_attente": return { badge: fs.statutEnAttente, texte: fs.statutEnAttenteTexte };
        case "approuvee":  return { badge: fs.statutApprouvee, texte: fs.statutApprouveeTexte };
        case "refusee":    return { badge: fs.statutRefusee,   texte: fs.statutRefuseeTexte };
        case "remboursee": return { badge: fs.statutRemboursee, texte: fs.statutRembourseeTexte };
        default: return { badge: {}, texte: {} };
        }
    }

    const demandesFiltrees = filtreStatut ? demandes.filter(d => d.statut === filtreStatut) : demandes;
    const deptNom = departementId ? departements.find(d => d.id === departementId)?.nom ?? "Choisir..." : "Aucun département";

    return (
        <SafeAreaView style={[fs.safe, { flex: 1 }]}>

        {/* ✅ FIX — flexGrow: 0 pour que les onglets ne prennent pas d'espace vertical */}
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0", flexGrow: 0 }}
            contentContainerStyle={{ flexDirection: "row", paddingHorizontal: 8 }}
        >
            {[
            { id: "demandes",             label: "📋 Demandes" },
            { id: "nouvelle_demande",     label: "➕ Demander" },
            { id: "comptabilite",         label: "📊 Comptabilité" },
            { id: "nouvelle_transaction", label: "✏️ Enregistrer" },
            ].map(o => (
            <Pressable
                key={o.id}
                style={[fs.onglet, onglet === o.id && fs.ongletActif]}
                onPress={() => setOnglet(o.id as any)}
            >
                <Text style={[fs.ongletTexte, onglet === o.id && fs.ongletTexteActif]}>{o.label}</Text>
            </Pressable>
            ))}
        </ScrollView>

        {/* ── DEMANDES ──────────────────────────────────────────────────────────── */}
        {onglet === "demandes" && (
            <View style={{ flex: 1 }}>
            {/* ✅ FIX — flexGrow: 0 sur le filtre */}
            <View style={{ backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0", paddingVertical: 10, paddingHorizontal: 12, flexGrow: 0 }}>
                <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: "row", gap: 8, alignItems: "center" }}
                >
                {FILTRES_STATUT.map(f => (
                    <Pressable
                    key={f.valeur}
                    style={{
                        paddingHorizontal: 14, height: 32, borderRadius: 99, borderWidth: 0.5,
                        borderColor: filtreStatut === f.valeur ? "#07074C" : "#E2E8F0",
                        backgroundColor: filtreStatut === f.valeur ? "#07074C" : "#fff",
                        justifyContent: "center",
                    }}
                    onPress={() => setFiltreStatut(f.valeur)}
                    >
                    <Text style={{ fontSize: 13, color: filtreStatut === f.valeur ? "#fff" : "#1E293B", fontWeight: filtreStatut === f.valeur ? "700" : "400" }}>
                        {f.label}
                    </Text>
                    </Pressable>
                ))}
                </ScrollView>
            </View>

            {/* ✅ FIX — flex: 1 sur la liste */}
            {chargement ? (
                <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" />
            ) : (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 100 }}>
                {demandesFiltrees.length === 0 && <Text style={fs.videTexte}>Aucune demande trouvée.</Text>}
                {demandesFiltrees.map(d => {
                    const { badge, texte } = statutStyle(d.statut);
                    return (
                    <View key={d.id} style={fs.demandeCard}>
                        <View style={fs.demandeHeader}>
                        <Text style={fs.demandeType}>{d.type_label}</Text>
                        <Text style={fs.demandeMontant}>{d.montant} $</Text>
                        </View>
                        <View style={fs.infoRow}><Text style={fs.infoLabel}>Département</Text><Text style={fs.infoValeur}>{d.departement_nom ?? "—"}</Text></View>
                        <View style={fs.infoRow}><Text style={fs.infoLabel}>Demandé par</Text><Text style={fs.infoValeur}>{d.responsable_nom ?? "—"}</Text></View>
                        <View style={fs.infoRow}><Text style={fs.infoLabel}>Date</Text><Text style={fs.infoValeur}>{formatDate(d.date_demande)}</Text></View>
                        <View style={fs.infoRow}><Text style={fs.infoLabel}>Motif</Text><Text style={fs.infoValeur}>{d.motif}</Text></View>
                        {d.notes_traitement ? <View style={fs.infoRow}><Text style={fs.infoLabel}>Notes</Text><Text style={fs.infoValeur}>{d.notes_traitement}</Text></View> : null}

                        {/* ✅ FIX — pièces jointes avec taille réduite */}
                        {d.pieces_jointes_list && d.pieces_jointes_list.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                            {d.pieces_jointes_list.map((uri, i) => (
                            <Pressable key={i} onPress={() => setImageSelectionnee(uri)}>
                                <Image
                                source={{ uri }}
                                style={fs.piecePreview}
                                resizeMode="cover"
                                />
                            </Pressable>
                            ))}
                        </ScrollView>
                        )}

                        <View style={[fs.statutBadge, badge]}>
                        <Text style={[fs.statutTexte, texte]}>{d.statut_label}</Text>
                        </View>
                        {peutApprouver && d.statut === "en_attente" && (
                        <View style={fs.actionsRow}>
                            <Pressable style={fs.btnApprouver} onPress={() => handleApprouver(d)}><Text style={fs.btnApprouverTexte}>✅ Approuver</Text></Pressable>
                            <Pressable style={fs.btnRefuser} onPress={() => handleRefuser(d)}><Text style={fs.btnRefuserTexte}>❌ Refuser</Text></Pressable>
                        </View>
                        )}
                        {peutApprouver && d.statut === "approuvee" && (
                        <View style={fs.actionsRow}>
                            <Pressable style={fs.btnRembourser} onPress={() => handleRembourser(d)}><Text style={fs.btnRembourserTexte}>💸 Marquer remboursé</Text></Pressable>
                        </View>
                        )}
                    </View>
                    );
                })}
                </ScrollView>
            )}
            </View>
        )}

        {/* ── NOUVELLE DEMANDE ──────────────────────────────────────────────────── */}
        {onglet === "nouvelle_demande" && (
            <ScrollView style={[fs.formulaire, { flex: 1 }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <Text style={fs.formTitre}>Nouvelle demande</Text>
            <Text style={fs.champLabel}>Type</Text>
            <View style={fs.typeRow}>
                <Pressable style={[fs.typeBtn, typeDemande === "financement" && fs.typeBtnActif]} onPress={() => setTypeDemande("financement")}>
                <Text style={[fs.typeBtnTexte, typeDemande === "financement" && fs.typeBtnTexteActif]}>💰 Financement</Text>
                </Pressable>
                <Pressable style={[fs.typeBtn, typeDemande === "remboursement" && fs.typeBtnActif]} onPress={() => setTypeDemande("remboursement")}>
                <Text style={[fs.typeBtnTexte, typeDemande === "remboursement" && fs.typeBtnTexteActif]}>🧾 Remboursement</Text>
                </Pressable>
            </View>

            <Text style={fs.champLabel}>Montant ($) *</Text>
            <TextInput style={fs.champInput} value={montantDemande} onChangeText={setMontantDemande} keyboardType="decimal-pad" placeholder="Ex: 150.00" placeholderTextColor="#94A3B8" />

            <Text style={fs.champLabel}>Département</Text>
            <Pressable style={fs.deptSelector} onPress={() => setDeptOuvert(!deptOuvert)}>
                <Text style={fs.deptSelectorTexte}>{deptNom}</Text>
                <Text style={fs.deptSelectorChevron}>{deptOuvert ? "▲" : "▼"}</Text>
            </Pressable>
            {deptOuvert && (
                <View style={fs.deptListe}>
                <Pressable style={fs.deptOption} onPress={() => { setDepartementId(null); setDeptOuvert(false); }}>
                    <Text style={[fs.deptOptionTexte, !departementId && fs.deptOptionTexteActif]}>Aucun département</Text>
                    {!departementId && <Text style={fs.deptCheck}>✓</Text>}
                </Pressable>
                {departements.map((d, i) => {
                    const sel = departementId === d.id;
                    return (
                    <Pressable key={d.id} style={[fs.deptOption, sel && fs.deptOptionActif, i === departements.length - 1 && { borderBottomWidth: 0 }]} onPress={() => { setDepartementId(d.id); setDeptOuvert(false); }}>
                        <Text style={[fs.deptOptionTexte, sel && fs.deptOptionTexteActif]}>{d.nom}</Text>
                        {sel && <Text style={fs.deptCheck}>✓</Text>}
                    </Pressable>
                    );
                })}
                </View>
            )}

            <Text style={fs.champLabel}>Motif / description *</Text>
            <TextInput style={[fs.champInput, fs.champInputMulti]} value={motif} onChangeText={setMotif} multiline placeholder="Décrivez la raison de la demande..." placeholderTextColor="#94A3B8" />

            <View style={fs.piecesBox}>
                <View style={fs.piecesHeader}>
                <Text style={fs.piecesLabel}>📎 Pièces jointes ({piecesJointes.length})</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: piecesJointes.length > 0 ? 10 : 0 }}>
                <Pressable style={[fs.piecesAjouter, { flex: 1 }]} onPress={prendrePhoto}><Text style={fs.piecesAjouterTexte}>📷 Prendre une photo</Text></Pressable>
                <Pressable style={[fs.piecesAjouter, { flex: 1 }]} onPress={choisirPhoto}><Text style={fs.piecesAjouterTexte}>🖼 Galerie</Text></Pressable>
                </View>
                {piecesJointes.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {piecesJointes.map((uri, i) => (
                    <View key={i} style={{ marginRight: 8, position: "relative" }}>
                        <Image source={{ uri }} style={fs.piecePreview} resizeMode="cover" />
                        <Pressable onPress={() => supprimerPiece(i)} style={{ position: "absolute", top: -6, right: -6, backgroundColor: "#EF4444", borderRadius: 99, width: 20, height: 20, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>✕</Text>
                        </Pressable>
                    </View>
                    ))}
                </ScrollView>
                )}
            </View>

            <Pressable style={[fs.btnSoumettre, sauvegarde && { opacity: 0.6 }]} onPress={soumettreDemande} disabled={sauvegarde}>
                {sauvegarde ? <ActivityIndicator color="#fff" /> : <Text style={fs.btnSoumettreTexte}>Soumettre la demande</Text>}
            </Pressable>
            </ScrollView>
        )}

        {/* ── COMPTABILITÉ ─────────────────────────────────────────────────────── */}
        {/* ✅ FIX — flex: 1 sur ScrollView pour remplir l'écran sans espace vide */}
        {onglet === "comptabilite" && (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
            {resume && (
                <View style={fs.resumeCard}>
                <Text style={fs.resumeTitre}>Solde total</Text>
                <Text style={fs.resumeSolde}>{resume.solde >= 0 ? "+" : ""}{resume.solde.toFixed(2)} $</Text>
                <View style={fs.resumeRow}>
                    <View style={fs.resumeBloc}>
                    <Text style={fs.resumeBlocLabel}>Entrées</Text>
                    <Text style={fs.resumeBlocMontant}>+{resume.total_entrees.toFixed(2)} $</Text>
                    </View>
                    <View style={fs.resumeBloc}>
                    <Text style={fs.resumeBlocLabel}>Sorties</Text>
                    <Text style={fs.resumeBlocMontant}>-{resume.total_sorties.toFixed(2)} $</Text>
                    </View>
                </View>
                </View>
            )}

            {resume && (
                <View style={{ marginHorizontal: 14, marginBottom: 14 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E293B", marginBottom: 10 }}>Détail par type</Text>
                {Object.entries(resume.par_type).filter(([, v]) => v.montant > 0).map(([type, v]) => {
                    const estEntree = ["cotisation", "offrande", "dime", "don", "entree"].includes(type);
                    return (
                    <View key={type} style={{ backgroundColor: "#fff", borderRadius: 10, padding: 12, flexDirection: "row", justifyContent: "space-between", marginBottom: 6, borderWidth: 0.5, borderColor: "#E2E8F0" }}>
                        <Text style={{ fontSize: 13, color: "#1E293B" }}>{v.label}</Text>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: estEntree ? "#065F46" : "#EF4444" }}>
                        {estEntree ? "+" : "-"}{v.montant.toFixed(2)} $
                        </Text>
                    </View>
                    );
                })}
                </View>
            )}

            <View style={{ paddingHorizontal: 14 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E293B", marginBottom: 10 }}>Transactions récentes</Text>
                {chargement ? (
                <ActivityIndicator color="#07074C" />
                ) : transactions.length === 0 ? (
                <Text style={fs.videTexte}>Aucune transaction enregistrée.</Text>
                ) : (
                transactions.map(t => (
                    <Pressable key={t.id} style={fs.transactionCard} onLongPress={() => handleSupprimerTransaction(t)}>
                    <View style={[fs.transactionIcone, { backgroundColor: t.est_entree ? "#D1FAE5" : "#FEE2E2" }]}>
                        <Text style={{ fontSize: 18 }}>{t.est_entree ? "📥" : "📤"}</Text>
                    </View>
                    <View style={fs.transactionInfo}>
                        <Text style={fs.transactionType}>{t.type_label}</Text>
                        {t.description ? <Text style={fs.transactionDesc}>{t.description}</Text> : null}
                        <Text style={fs.transactionDate}>{formatDate(t.date)}</Text>
                    </View>
                    <Text style={[fs.transactionMontant, t.est_entree ? fs.montantEntree : fs.montantSortie]}>
                        {t.est_entree ? "+" : "-"}{t.montant} $
                    </Text>
                    </Pressable>
                ))
                )}
                <Text style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", marginTop: 8, fontStyle: "italic" }}>
                Appui long pour supprimer
                </Text>
            </View>
            </ScrollView>
        )}

        {/* ── NOUVELLE TRANSACTION ──────────────────────────────────────────────── */}
        {onglet === "nouvelle_transaction" && (
            <ScrollView style={[fs.formulaire, { flex: 1 }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <Text style={fs.formTitre}>Enregistrer une transaction</Text>
            <Text style={fs.champLabel}>Type de transaction</Text>
            <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#065F46", marginBottom: 8, textTransform: "uppercase" }}>Entrées d'argent</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 12 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    {TYPES_TRANSACTION.filter(t => t.entree).map(t => (
                    <Pressable key={t.valeur}
                        style={{ paddingHorizontal: 14, height: 36, borderRadius: 99, borderWidth: 0.5, borderColor: typeTransaction === t.valeur ? "#065F46" : "#E2E8F0", backgroundColor: typeTransaction === t.valeur ? "#065F46" : "#fff", justifyContent: "center" }}
                        onPress={() => setTypeTransaction(t.valeur)}>
                        <Text style={{ fontSize: 13, color: typeTransaction === t.valeur ? "#fff" : "#1E293B", fontWeight: typeTransaction === t.valeur ? "700" : "400" }}>{t.label}</Text>
                    </Pressable>
                    ))}
                </View>
                </ScrollView>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#991B1B", marginBottom: 8, textTransform: "uppercase" }}>Sorties d'argent</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    {TYPES_TRANSACTION.filter(t => !t.entree).map(t => (
                    <Pressable key={t.valeur}
                        style={{ paddingHorizontal: 14, height: 36, borderRadius: 99, borderWidth: 0.5, borderColor: typeTransaction === t.valeur ? "#991B1B" : "#E2E8F0", backgroundColor: typeTransaction === t.valeur ? "#991B1B" : "#fff", justifyContent: "center" }}
                        onPress={() => setTypeTransaction(t.valeur)}>
                        <Text style={{ fontSize: 13, color: typeTransaction === t.valeur ? "#fff" : "#1E293B", fontWeight: typeTransaction === t.valeur ? "700" : "400" }}>{t.label}</Text>
                    </Pressable>
                    ))}
                </View>
                </ScrollView>
            </View>

            <Text style={fs.champLabel}>Montant ($) *</Text>
            <TextInput style={fs.champInput} value={montantTransaction} onChangeText={setMontantTransaction} keyboardType="decimal-pad" placeholder="Ex: 250.00" placeholderTextColor="#94A3B8" />
            <Text style={fs.champLabel}>Date</Text>
            <TextInput style={fs.champInput} value={dateTransaction} onChangeText={setDateTransaction} placeholder="AAAA-MM-JJ" placeholderTextColor="#94A3B8" />
            <Text style={fs.champLabel}>Description (optionnel)</Text>
            <TextInput style={[fs.champInput, fs.champInputMulti]} value={descriptionTransaction} onChangeText={setDescriptionTransaction} multiline placeholder="Notes sur cette transaction..." placeholderTextColor="#94A3B8" />

            <Pressable style={[fs.btnSoumettre, sauvegarde && { opacity: 0.6 }]} onPress={soumettreTransaction} disabled={sauvegarde}>
                {sauvegarde ? <ActivityIndicator color="#fff" /> : <Text style={fs.btnSoumettreTexte}>Enregistrer</Text>}
            </Pressable>
            </ScrollView>
        )}

        {/* ── Modal image plein écran ───────────────────────────────────────────── */}
        <Modal visible={!!imageSelectionnee} transparent animationType="fade" onRequestClose={() => setImageSelectionnee(null)}>
            <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }} onPress={() => setImageSelectionnee(null)}>
            {imageSelectionnee && <Image source={{ uri: imageSelectionnee }} style={{ width: "90%", height: "70%", borderRadius: 12 }} resizeMode="contain" />}
            <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 16, fontSize: 13 }}>Appuyer pour fermer</Text>
            </Pressable>
        </Modal>

        </SafeAreaView>
    );
    }