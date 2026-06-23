import { useEffect, useState } from "react";
    import {
    View, Text, TextInput, ScrollView, Pressable,
    Alert, ActivityIndicator, SafeAreaView,
  KeyboardAvoidingView, Platform,
} from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import {
    getBudgets, createBudget, createLigne,
    updateLigne, deleteLigne,
    } from "../services/budget.service";
    import { getDepartements } from "../services/departements.service";
    import { api } from "../services/api";
    import { bs } from "../styles/budget.styles";

    type Ligne = {
    id: number;
    budget: number;
    departement: number | null;
    departement_nom: string | null;
    categorie: string;
    categorie_label: string;
    description: string;
    montant_prevu: number;
    montant_realise: number;
    notes: string;
    ecart: number;
    taux_execution: number;
    };

    type Budget = {
    id: number;
    communaute_culte: number;
    annee: number;
    montant_total: number;
    notes: string;
    lignes: Ligne[];
    total_prevu: number;
    total_realise: number;
    taux_global: number;
    };

    type Departement = { id: number; nom: string };
    type Vue = "budget" | "nouvelle_ligne" | "modifier_ligne";

    const CATEGORIES = [
    { valeur: "departement",  label: "Département",   icon: "business-outline" as const },
    { valeur: "operations",   label: "Opérations",    icon: "settings-outline" as const },
    { valeur: "evenements",   label: "Événements",    icon: "calendar-outline" as const },
    { valeur: "missions",     label: "Missions",      icon: "earth-outline" as const },
    { valeur: "entretien",    label: "Entretien",     icon: "construct-outline" as const },
    { valeur: "autre",        label: "Autre",         icon: "ellipsis-horizontal-outline" as const },
    ];

    export default function BudgetScreen() {
    const [budget, setBudget] = useState<Budget | null>(null);
    const [departements, setDepartements] = useState<Departement[]>([]);
    const [communauteId, setCommunauteId] = useState<number | undefined>();
    const [annee, setAnnee] = useState(new Date().getFullYear());
    const [chargement, setChargement] = useState(true);
    const [sauvegarde, setSauvegarde] = useState(false);
    const [vue, setVue] = useState<Vue>("budget");
    const [ligneEditee, setLigneEditee] = useState<Ligne | null>(null);

    // Formulaire ligne
    const [formDescription, setFormDescription] = useState("");
    const [formCategorie, setFormCategorie] = useState("autre");
    const [formDeptId, setFormDeptId] = useState<number | null>(null);
    const [formPrevu, setFormPrevu] = useState("");
    const [formRealise, setFormRealise] = useState("");
    const [formNotes, setFormNotes] = useState("");

    useEffect(() => { chargerDonnees(); }, []);
    useEffect(() => { if (communauteId) chargerBudget(); }, [annee, communauteId]);

    async function chargerDonnees() {
        try {
        const cultes = await api.get("/communautes/").then(r => r.data).catch(() => []);
        const cid = cultes.length > 0 ? cultes[0].id : undefined;
        setCommunauteId(cid);
        if (cid) {
            const d = await getDepartements(cid).catch(() => []);
            setDepartements(Array.isArray(d) ? d : []);
        }
        } catch {}
    }

    async function chargerBudget() {
        setChargement(true);
        try {
        const data = await getBudgets(communauteId, annee);
        setBudget(Array.isArray(data) && data.length > 0 ? data[0] : null);
        } finally {
        setChargement(false);
        }
    }

    async function creerBudget() {
        if (!communauteId) return;
        setSauvegarde(true);
        try {
        const b = await createBudget({
            communaute_culte: communauteId,
            annee,
            montant_total: 0,
        });
        setBudget(b);
        } catch {
        Alert.alert("Erreur", "Impossible de créer le budget.");
        } finally {
        setSauvegarde(false);
        }
    }

    function ouvrirNouvelleLigne() {
        setLigneEditee(null);
        setFormDescription("");
        setFormCategorie("autre");
        setFormDeptId(null);
        setFormPrevu("");
        setFormRealise("");
        setFormNotes("");
        setVue("nouvelle_ligne");
    }

    function ouvrirModifierLigne(ligne: Ligne) {
        setLigneEditee(ligne);
        setFormDescription(ligne.description);
        setFormCategorie(ligne.categorie);
        setFormDeptId(ligne.departement);
        setFormPrevu(String(ligne.montant_prevu));
        setFormRealise(String(ligne.montant_realise));
        setFormNotes(ligne.notes);
        setVue("modifier_ligne");
    }

    async function sauvegarderLigne() {
        if (!formDescription.trim()) { Alert.alert("Champ requis", "La description est obligatoire."); return; }
        if (!formPrevu || isNaN(Number(formPrevu))) { Alert.alert("Montant invalide", "Entrez un montant prévu valide."); return; }
        if (!budget) return;

        setSauvegarde(true);
        try {
        const donnees = {
            budget: budget.id,
            categorie: formCategorie,
            description: formDescription.trim(),
            montant_prevu: Number(formPrevu),
            montant_realise: Number(formRealise) || 0,
            departement: formDeptId || null,
            notes: formNotes.trim(),
        };

        if (ligneEditee) {
            await updateLigne(ligneEditee.id, donnees);
        } else {
            await createLigne(donnees);
        }
        await chargerBudget();
        setVue("budget");
        Alert.alert("✅", ligneEditee ? "Ligne modifiée." : "Ligne ajoutée.");
        } catch (err: any) {
        Alert.alert("Erreur", JSON.stringify(err?.response?.data ?? "Impossible de sauvegarder."));
        } finally {
        setSauvegarde(false);
        }
    }

    async function supprimerLigne(ligne: Ligne) {
        Alert.alert("Supprimer ?", `Supprimer la ligne "${ligne.description}" ?`, [
        { text: "Annuler", style: "cancel" },
        {
            text: "Supprimer", style: "destructive",
            onPress: async () => {
            await deleteLigne(ligne.id);
            await chargerBudget();
            },
        },
        ]);
    }

    // ── FORMULAIRE LIGNE ───────────────────────────────────────────────────────
    if (vue === "nouvelle_ligne" || vue === "modifier_ligne") {
        return (
        <SafeAreaView style={bs.safe}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={90}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled">
            <Pressable onPress={() => setVue("budget")} style={{ marginBottom: 16 }}>
                <Text style={{ color: "#64748B", fontSize: 15 }}>‹ Retour</Text>
            </Pressable>
            <Text style={bs.formTitre}>
                {vue === "modifier_ligne" ? "Modifier la ligne" : "Nouvelle ligne budgétaire"}
            </Text>

            <Text style={bs.champLabel}>Catégorie</Text>
            <View style={bs.choixRow}>
                {CATEGORIES.map(cat => (
                <Pressable
                    key={cat.valeur}
                    style={[bs.choixBtn, formCategorie === cat.valeur && bs.choixBtnActif]}
                    onPress={() => setFormCategorie(cat.valeur)}
                >
                    <Text style={[bs.choixBtnTexte, formCategorie === cat.valeur && bs.choixBtnTexteActif]}>
                    {cat.label}
                    </Text>
                </Pressable>
                ))}
            </View>

            <Text style={bs.champLabel}>Description *</Text>
            <TextInput
                style={bs.champInput}
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="Ex: Budget musique Chorale"
                placeholderTextColor="#94A3B8"
            />

            <Text style={bs.champLabel}>Département (optionnel)</Text>
            <View style={bs.choixRow}>
                <Pressable
                style={[bs.choixBtn, !formDeptId && bs.choixBtnActif]}
                onPress={() => setFormDeptId(null)}
                >
                <Text style={[bs.choixBtnTexte, !formDeptId && bs.choixBtnTexteActif]}>Aucun</Text>
                </Pressable>
                {departements.map(d => (
                <Pressable
                    key={d.id}
                    style={[bs.choixBtn, formDeptId === d.id && bs.choixBtnActif]}
                    onPress={() => setFormDeptId(d.id)}
                >
                    <Text style={[bs.choixBtnTexte, formDeptId === d.id && bs.choixBtnTexteActif]}>
                    {d.nom}
                    </Text>
                </Pressable>
                ))}
            </View>

            <Text style={bs.champLabel}>Montant prévu ($) *</Text>
            <TextInput
                style={bs.champInput}
                value={formPrevu}
                onChangeText={setFormPrevu}
                keyboardType="decimal-pad"
                placeholder="Ex: 500.00"
                placeholderTextColor="#94A3B8"
            />

            <Text style={bs.champLabel}>Montant réalisé ($)</Text>
            <TextInput
                style={bs.champInput}
                value={formRealise}
                onChangeText={setFormRealise}
                keyboardType="decimal-pad"
                placeholder="Ex: 250.00"
                placeholderTextColor="#94A3B8"
            />

            <Text style={bs.champLabel}>Notes</Text>
            <TextInput
                style={bs.champInput}
                value={formNotes}
                onChangeText={setFormNotes}
                placeholder="Observations sur cette ligne..."
                placeholderTextColor="#94A3B8"
            />

            <Pressable
                style={[bs.btnPrimaire, sauvegarde && { opacity: 0.6 }]}
                onPress={sauvegarderLigne}
                disabled={sauvegarde}
            >
                {sauvegarde
                ? <ActivityIndicator color="#fff" />
                : <Text style={bs.btnPrimaireTexte}>
                    {vue === "modifier_ligne" ? "Enregistrer les modifications" : "Ajouter la ligne"}
                    </Text>
                }
            </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
        );
    }

    // ── VUE BUDGET ─────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={bs.safe}>
        {/* Sélecteur d'année */}
        <View style={bs.budgetHeader}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Budget annuel</Text>
            <View style={bs.anneeSelector}>
            <Pressable style={bs.anneeBouton} onPress={() => setAnnee(a => a - 1)}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
            </Pressable>
            <Text style={bs.anneeTexte}>{annee}</Text>
            <Pressable style={bs.anneeBouton} onPress={() => setAnnee(a => a + 1)}>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
            </Pressable>
            </View>
        </View>

        {chargement ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />
        ) : !budget ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 30 }}>
            <Ionicons name="calculator-outline" size={60} color="#CBD5E0" />
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1E293B", marginTop: 16, textAlign: "center" }}>
                Aucun budget pour {annee}
            </Text>
            <Text style={{ fontSize: 14, color: "#64748B", marginTop: 8, textAlign: "center" }}>
                Créez un budget pour commencer à planifier les finances de l'année.
            </Text>
            <Pressable
                style={[bs.btnPrimaire, { marginTop: 24, paddingHorizontal: 30, opacity: sauvegarde ? 0.6 : 1 }]}
                onPress={creerBudget}
                disabled={sauvegarde}
            >
                {sauvegarde
                ? <ActivityIndicator color="#fff" />
                : <Text style={bs.btnPrimaireTexte}>Créer le budget {annee}</Text>
                }
            </Pressable>
            </View>
        ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled">
            {/* Résumé */}
            <View style={bs.resumeCard}>
                <Text style={bs.resumeTitre}>Résumé budgétaire {annee}</Text>
                <View style={bs.resumeRow}>
                <View style={bs.resumeBloc}>
                    <Text style={bs.resumeBlocLabel}>Prévu</Text>
                    <Text style={bs.resumeBlocValeur}>{budget.total_prevu.toFixed(2)} $</Text>
                </View>
                <View style={bs.resumeBloc}>
                    <Text style={bs.resumeBlocLabel}>Réalisé</Text>
                    <Text style={[bs.resumeBlocValeur, {
                    color: budget.total_realise > budget.total_prevu ? "#EF4444" : "#065F46",
                    }]}>
                    {budget.total_realise.toFixed(2)} $
                    </Text>
                </View>
                <View style={bs.resumeBloc}>
                    <Text style={bs.resumeBlocLabel}>Écart</Text>
                    <Text style={[bs.resumeBlocValeur, {
                    color: (budget.total_realise - budget.total_prevu) > 0 ? "#EF4444" : "#065F46",
                    }]}>
                    {(budget.total_realise - budget.total_prevu) >= 0 ? "+" : ""}
                    {(budget.total_realise - budget.total_prevu).toFixed(2)} $
                    </Text>
                </View>
                </View>
                <View style={bs.barreContainer}>
                <View style={[bs.barreFill, {
                    width: `${Math.min(budget.taux_global, 100)}%` as any,
                    backgroundColor: budget.taux_global > 100 ? "#EF4444" : budget.taux_global >= 80 ? "#065F46" : "#4F46E5",
                }]} />
                </View>
                <Text style={bs.resumeTaux}>Taux d'exécution : {budget.taux_global}%</Text>
            </View>

            {/* Lignes groupées par catégorie */}
            {CATEGORIES.map(cat => {
                const lignesCat = budget.lignes.filter(l => l.categorie === cat.valeur);
                if (lignesCat.length === 0) return null;
                const totalCat = lignesCat.reduce((acc, l) => acc + Number(l.montant_prevu), 0);
                const realiseCat = lignesCat.reduce((acc, l) => acc + Number(l.montant_realise), 0);

                return (
                <View key={cat.valeur}>
                    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, marginTop: 12, marginBottom: 6, gap: 8 }}>
                    <Ionicons name={cat.icon} size={16} color="#64748B" />
                    <Text style={bs.sectionTitre}>{cat.label}</Text>
                    <Text style={{ fontSize: 12, color: "#64748B", marginLeft: "auto" }}>
                        {realiseCat.toFixed(0)} / {totalCat.toFixed(0)} $
                    </Text>
                    </View>

                    {lignesCat.map(ligne => {
                    const taux = ligne.taux_execution;
                    const couleurBarre = taux > 100 ? "#EF4444" : taux >= 80 ? "#065F46" : "#4F46E5";
                    const ecartPositif = ligne.ecart >= 0;

                    return (
                        <View key={ligne.id} style={bs.ligneCard}>
                        <View style={bs.ligneHeader}>
                            <View style={bs.ligneIconeBox}>
                            <Ionicons name={cat.icon} size={16} color="#64748B" />
                            </View>
                            <View style={{ flex: 1 }}>
                            <Text style={bs.ligneDescription}>{ligne.description}</Text>
                            {ligne.departement_nom && (
                                <Text style={bs.ligneDept}>{ligne.departement_nom}</Text>
                            )}
                            </View>
                        </View>

                        <View style={bs.ligneChiffres}>
                            <View style={bs.ligneChiffreBloc}>
                            <Text style={bs.ligneChiffreLabel}>Prévu</Text>
                            <Text style={bs.ligneChiffreValeur}>{Number(ligne.montant_prevu).toFixed(2)} $</Text>
                            </View>
                            <View style={bs.ligneChiffreBloc}>
                            <Text style={bs.ligneChiffreLabel}>Réalisé</Text>
                            <Text style={bs.ligneChiffreValeur}>{Number(ligne.montant_realise).toFixed(2)} $</Text>
                            </View>
                            <View style={bs.ligneChiffreBloc}>
                            <Text style={bs.ligneChiffreLabel}>Écart</Text>
                            <Text style={[bs.ligneEcart, { color: ecartPositif ? "#EF4444" : "#065F46" }]}>
                                {ecartPositif ? "+" : ""}{ligne.ecart.toFixed(2)} $
                            </Text>
                            </View>
                            <View style={bs.ligneChiffreBloc}>
                            <Text style={bs.ligneChiffreLabel}>Taux</Text>
                            <Text style={[bs.ligneChiffreValeur, { color: couleurBarre }]}>{taux}%</Text>
                            </View>
                        </View>

                        <View style={bs.ligneBarre}>
                            <View style={[bs.ligneBarreFill, {
                            width: `${Math.min(taux, 100)}%` as any,
                            backgroundColor: couleurBarre,
                            }]} />
                        </View>

                        <View style={bs.ligneActions}>
                            <Pressable
                            style={[bs.btnLigneAction, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}
                            onPress={() => ouvrirModifierLigne(ligne)}
                            >
                            <Text style={{ fontSize: 12, color: "#4F46E5", fontWeight: "700" }}>Modifier</Text>
                            </Pressable>
                            <Pressable
                            style={[bs.btnLigneAction, { backgroundColor: "#FEF2F2", borderColor: "#FECACA", flex: 0, paddingHorizontal: 12 }]}
                            onPress={() => supprimerLigne(ligne)}
                            >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                            </Pressable>
                        </View>
                        </View>
                    );
                    })}
                </View>
                );
            })}

            {budget.lignes.length === 0 && (
                <Text style={bs.videTexte}>
                Aucune ligne budgétaire.{"\n"}Appuyez sur + pour en ajouter une.
                </Text>
            )}
            </ScrollView>
        )}

        {budget && (
            <Pressable style={bs.fab} onPress={ouvrirNouvelleLigne}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={bs.fabTexte}>Ajouter une ligne</Text>
            </Pressable>
        )}
        </SafeAreaView>
    );
    }