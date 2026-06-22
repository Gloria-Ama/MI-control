    import { useEffect, useState } from "react";
    import {
    View, Text, TextInput, ScrollView, Pressable,
    Alert, ActivityIndicator, SafeAreaView,
    } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import { getSuivisPastoraux, createSuivi, updateSuivi, changerStatut, deleteSuivi } from "../services/pastoral.service";
    import { getMembres } from "../services/membres.service";
    import { ps2, CATEGORIE_COULEURS, STATUT_COULEURS } from "../styles/pastoral.styles";

    type Suivi = {
    id: number;
    membre: number;
    membre_nom: string;
    auteur: number;
    auteur_nom: string;
    categorie: string;
    categorie_label: string;
    titre: string;
    notes: string;
    statut: string;
    statut_label: string;
    confidentiel: boolean;
    date_creation: string;
    date_modification: string;
    date_suivi_prochain: string | null;
    };

    type Membre = { id: number; nom: string; departement_nom: string | null };
    type Vue = "liste" | "formulaire" | "detail";

    const CATEGORIES = [
    { valeur: "sante",       label: "Santé",        icon: "heart-outline" as const },
    { valeur: "famille",     label: "Famille",       icon: "home-outline" as const },
    { valeur: "spirituel",   label: "Spirituel",     icon: "flower-outline" as const },
    { valeur: "financier",   label: "Financier",     icon: "cash-outline" as const },
    { valeur: "integration", label: "Intégration",   icon: "enter-outline" as const },
    { valeur: "conflit",     label: "Conflit",       icon: "warning-outline" as const },
    { valeur: "autre",       label: "Autre",         icon: "ellipsis-horizontal-outline" as const },
    ];

    const STATUTS = [
    { valeur: "ouvert",   label: "Ouvert" },
    { valeur: "en_cours", label: "En cours" },
    { valeur: "resolu",   label: "Résolu" },
    { valeur: "archive",  label: "Archivé" },
    ];

    export default function SuiviPastoralScreen() {
    const [suivis, setSuivis] = useState<Suivi[]>([]);
    const [membres, setMembres] = useState<Membre[]>([]);
    const [chargement, setChargement] = useState(true);
    const [vue, setVue] = useState<Vue>("liste");
    const [selectionne, setSelectionne] = useState<Suivi | null>(null);
    const [filtreStatut, setFiltreStatut] = useState("");
    const [sauvegarde, setSauvegarde] = useState(false);
    const [recherche, setRecherche] = useState("");
    const [membreOuvert, setMembreOuvert] = useState(false);

    // Formulaire
    const [formMembreId, setFormMembreId] = useState<number | null>(null);
    const [formCategorie, setFormCategorie] = useState("autre");
    const [formTitre, setFormTitre] = useState("");
    const [formNotes, setFormNotes] = useState("");
    const [formStatut, setFormStatut] = useState("ouvert");
    const [formDateProchain, setFormDateProchain] = useState("");
    const [modeEdition, setModeEdition] = useState(false);

    useEffect(() => { chargerDonnees(); }, []);

    async function chargerDonnees() {
        setChargement(true);
        try {
        const [s, m] = await Promise.all([
            getSuivisPastoraux({ statut: filtreStatut || undefined }),
            getMembres(),
        ]);
        setSuivis(Array.isArray(s) ? s : []);
        setMembres(Array.isArray(m) ? m : []);
        } finally {
        setChargement(false);
        }
    }

    async function chargerSuivis() {
        try {
        const s = await getSuivisPastoraux({ statut: filtreStatut || undefined });
        setSuivis(Array.isArray(s) ? s : []);
        } catch {}
    }

    function ouvrirFormulaire(suivi?: Suivi) {
        if (suivi) {
        setModeEdition(true);
        setSelectionne(suivi);
        setFormMembreId(suivi.membre);
        setFormCategorie(suivi.categorie);
        setFormTitre(suivi.titre);
        setFormNotes(suivi.notes);
        setFormStatut(suivi.statut);
        setFormDateProchain(suivi.date_suivi_prochain ?? "");
        } else {
        setModeEdition(false);
        setSelectionne(null);
        setFormMembreId(null);
        setFormCategorie("autre");
        setFormTitre("");
        setFormNotes("");
        setFormStatut("ouvert");
        setFormDateProchain("");
        }
        setMembreOuvert(false);
        setVue("formulaire");
    }

    async function sauvegarder() {
        if (!formMembreId) { Alert.alert("Champ requis", "Choisissez un membre."); return; }
        if (!formTitre.trim()) { Alert.alert("Champ requis", "Le titre est obligatoire."); return; }
        if (!formNotes.trim()) { Alert.alert("Champ requis", "Les notes sont obligatoires."); return; }

        setSauvegarde(true);
        try {
        const donnees = {
            membre: formMembreId,
            categorie: formCategorie,
            titre: formTitre.trim(),
            notes: formNotes.trim(),
            statut: formStatut,
            confidentiel: true,
            date_suivi_prochain: formDateProchain || null,
        };
        if (modeEdition && selectionne) {
            await updateSuivi(selectionne.id, donnees);
        } else {
            await createSuivi(donnees);
        }
        await chargerSuivis();
        setVue("liste");
        Alert.alert("✅", modeEdition ? "Suivi modifié." : "Suivi créé.");
        } catch (err: any) {
        Alert.alert("Erreur", JSON.stringify(err?.response?.data ?? "Impossible de sauvegarder."));
        } finally {
        setSauvegarde(false);
        }
    }

    async function handleChangerStatut(suivi: Suivi, statut: string) {
        await changerStatut(suivi.id, statut);
        await chargerSuivis();
    }

    async function handleSupprimer(suivi: Suivi) {
        Alert.alert("Supprimer ?", `Supprimer le suivi "${suivi.titre}" ?`, [
        { text: "Annuler", style: "cancel" },
        {
            text: "Supprimer", style: "destructive",
            onPress: async () => {
            await deleteSuivi(suivi.id);
            await chargerSuivis();
            setVue("liste");
            },
        },
        ]);
    }

    function formatDate(dateStr: string) {
        try { return new Date(dateStr).toLocaleDateString("fr-FR"); } catch { return dateStr; }
    }

    function estProchain(dateStr: string | null) {
        if (!dateStr) return false;
        const diff = new Date(dateStr).getTime() - new Date().getTime();
        return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
    }

    function estEnRetard(dateStr: string | null) {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date();
    }

    const nomMembre = (id: number | null) => membres.find(m => m.id === id)?.nom ?? "Choisir un membre";

    const suivisFiltres = suivis.filter(s =>
        s.membre_nom.toLowerCase().includes(recherche.toLowerCase()) ||
        s.titre.toLowerCase().includes(recherche.toLowerCase())
    );

    // ── FORMULAIRE ────────────────────────────────────────────────────────────
    if (vue === "formulaire") {
        return (
        <SafeAreaView style={ps2.safe}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <Pressable onPress={() => setVue("liste")} style={{ marginBottom: 16 }}>
                <Text style={{ color: "#64748B", fontSize: 15 }}>‹ Retour</Text>
            </Pressable>
            <Text style={ps2.formTitre}>{modeEdition ? "Modifier le suivi" : "Nouveau suivi pastoral"}</Text>

            {/* Confidentialité */}
            <View style={ps2.confidentialBox}>
                <Ionicons name="lock-closed-outline" size={18} color="#991B1B" />
                <Text style={ps2.confidentialTexte}>
                Ce suivi est confidentiel — visible uniquement par les pasteurs et administrateurs.
                </Text>
            </View>

            {/* Membre */}
            <Text style={ps2.champLabel}>Membre *</Text>
            <Pressable style={ps2.champInput} onPress={() => setMembreOuvert(!membreOuvert)}>
                <Text style={{ color: formMembreId ? "#1E293B" : "#94A3B8", fontSize: 15 }}>
                {nomMembre(formMembreId)}
                </Text>
            </Pressable>
            {membreOuvert && (
                <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 0.5, borderColor: "#E2E8F0", marginBottom: 16, overflow: "hidden" }}>
                <TextInput
                    style={{ padding: 12, borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0", fontSize: 14 }}
                    placeholder="Rechercher un membre..."
                    placeholderTextColor="#94A3B8"
                    onChangeText={setRecherche}
                />
                <ScrollView style={{ maxHeight: 200 }}>
                    {membres.filter(m => m.nom.toLowerCase().includes(recherche.toLowerCase())).map(m => (
                    <Pressable
                        key={m.id}
                        style={{ padding: 14, borderBottomWidth: 0.5, borderBottomColor: "#F8FAFC", flexDirection: "row", justifyContent: "space-between" }}
                        onPress={() => { setFormMembreId(m.id); setMembreOuvert(false); setRecherche(""); }}
                    >
                        <Text style={{ fontSize: 14, color: "#1E293B" }}>{m.nom}</Text>
                        {formMembreId === m.id && <Ionicons name="checkmark" size={16} color="#07074C" />}
                    </Pressable>
                    ))}
                </ScrollView>
                </View>
            )}

            {/* Catégorie */}
            <Text style={ps2.champLabel}>Catégorie</Text>
            <View style={ps2.choixRow}>
                {CATEGORIES.map(cat => (
                <Pressable
                    key={cat.valeur}
                    style={[ps2.choixBtn, formCategorie === cat.valeur && ps2.choixBtnActif,
                    formCategorie === cat.valeur && { backgroundColor: CATEGORIE_COULEURS[cat.valeur] }]}
                    onPress={() => setFormCategorie(cat.valeur)}
                >
                    <Text style={[ps2.choixBtnTexte, formCategorie === cat.valeur && ps2.choixBtnTexteActif]}>
                    {cat.label}
                    </Text>
                </Pressable>
                ))}
            </View>

            {/* Titre */}
            <Text style={ps2.champLabel}>Titre *</Text>
            <TextInput
                style={ps2.champInput}
                value={formTitre}
                onChangeText={setFormTitre}
                placeholder="Ex: Situation de santé difficile"
                placeholderTextColor="#94A3B8"
            />

            {/* Notes */}
            <Text style={ps2.champLabel}>Notes confidentielles *</Text>
            <TextInput
                style={[ps2.champInput, ps2.champInputMulti]}
                value={formNotes}
                onChangeText={setFormNotes}
                multiline
                placeholder="Décrivez la situation, les besoins et les actions prises..."
                placeholderTextColor="#94A3B8"
            />

            {/* Statut */}
            <Text style={ps2.champLabel}>Statut</Text>
            <View style={[ps2.choixRow, { marginBottom: 16 }]}>
                {STATUTS.map(st => (
                <Pressable
                    key={st.valeur}
                    style={[ps2.choixBtn, formStatut === st.valeur && ps2.choixBtnActif]}
                    onPress={() => setFormStatut(st.valeur)}
                >
                    <Text style={[ps2.choixBtnTexte, formStatut === st.valeur && ps2.choixBtnTexteActif]}>
                    {st.label}
                    </Text>
                </Pressable>
                ))}
            </View>

            {/* Date prochain suivi */}
            <Text style={ps2.champLabel}>Date du prochain suivi (AAAA-MM-JJ)</Text>
            <TextInput
                style={ps2.champInput}
                value={formDateProchain}
                onChangeText={setFormDateProchain}
                placeholder="Ex: 2026-07-15"
                placeholderTextColor="#94A3B8"
            />

            <Pressable
                style={[ps2.btnPrimaire, sauvegarde && { opacity: 0.6 }]}
                onPress={sauvegarder}
                disabled={sauvegarde}
            >
                {sauvegarde
                ? <ActivityIndicator color="#fff" />
                : <Text style={ps2.btnPrimaireTexte}>
                    {modeEdition ? "Enregistrer les modifications" : "Créer le suivi"}
                    </Text>
                }
            </Pressable>
            </ScrollView>
        </SafeAreaView>
        );
    }

    // ── LISTE ─────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={ps2.safe}>
        {/* Recherche */}
        <View style={{ backgroundColor: "#fff", padding: 12, borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0" }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F8F5F0", borderRadius: 10, paddingHorizontal: 10, borderWidth: 0.5, borderColor: "#E2E8F0" }}>
            <Ionicons name="search-outline" size={16} color="#94A3B8" />
            <TextInput
                style={{ flex: 1, padding: 10, fontSize: 14, color: "#1E293B" }}
                placeholder="Rechercher un membre ou suivi..."
                placeholderTextColor="#94A3B8"
                value={recherche}
                onChangeText={setRecherche}
            />
            </View>
        </View>

        {/* Filtres statut */}
        <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={ps2.filtresScroll}
            contentContainerStyle={{ flexDirection: "row", alignItems: "center" }}
        >
            {[{ valeur: "", label: "Tous" }, ...STATUTS].map(st => (
            <Pressable
                key={st.valeur}
                style={[ps2.filtrePill, filtreStatut === st.valeur && ps2.filtrePillActif]}
                onPress={() => { setFiltreStatut(st.valeur); chargerSuivis(); }}
            >
                <Text style={[ps2.filtrePillTexte, filtreStatut === st.valeur && ps2.filtrePillTexteActif]}>
                {st.label}
                </Text>
            </Pressable>
            ))}
        </ScrollView>

        {chargement ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />
        ) : (
            <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 100 }}>
            {suivisFiltres.length === 0 && (
                <Text style={ps2.videTexte}>Aucun suivi pastoral trouvé.</Text>
            )}

            {suivisFiltres.map(suivi => {
                const couleur = CATEGORIE_COULEURS[suivi.categorie] ?? "#64748B";
                const statutStyle = STATUT_COULEURS[suivi.statut] ?? { fond: "#F1F5F9", texte: "#475569" };
                const prochain = estProchain(suivi.date_suivi_prochain);
                const retard = estEnRetard(suivi.date_suivi_prochain);

                return (
                <View key={suivi.id} style={[ps2.suiviCard, { borderLeftColor: couleur }]}>
                    <View style={ps2.suiviHeader}>
                    <View style={[ps2.suiviIconeBox, { backgroundColor: couleur + "20" }]}>
                        <Ionicons
                        name={CATEGORIES.find(c => c.valeur === suivi.categorie)?.icon ?? "ellipsis-horizontal-outline"}
                        size={18} color={couleur}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={ps2.suiviTitre}>{suivi.titre}</Text>
                        <Text style={ps2.suiviMembre}>{suivi.membre_nom}</Text>
                    </View>
                    <Ionicons name="lock-closed-outline" size={14} color="#94A3B8" />
                    </View>

                    <Text style={ps2.suiviNotes} numberOfLines={3}>{suivi.notes}</Text>

                    {(prochain || retard) && suivi.date_suivi_prochain && (
                    <View style={[ps2.alerteProchain, { backgroundColor: retard ? "#FEF2F2" : "#FFFBEB" }]}>
                        <Ionicons name="alarm-outline" size={14} color={retard ? "#991B1B" : "#633806"} />
                        <Text style={[ps2.alerteProchainTexte, { color: retard ? "#991B1B" : "#633806" }]}>
                        {retard ? "Suivi en retard — " : "Suivi prévu — "}
                        {formatDate(suivi.date_suivi_prochain)}
                        </Text>
                    </View>
                    )}

                    <View style={ps2.suiviMeta}>
                    <View style={[ps2.statutBadge, { backgroundColor: statutStyle.fond }]}>
                        <Text style={[ps2.statutTexte, { color: statutStyle.texte }]}>{suivi.statut_label}</Text>
                    </View>
                    <View style={ps2.categorieBadge}>
                        <Text style={ps2.categorieTexte}>{suivi.categorie_label}</Text>
                    </View>
                    <Text style={ps2.dateTexte}>{formatDate(suivi.date_modification)}</Text>
                    </View>

                    {/* Actions */}
                    <View style={ps2.suiviActions}>
                    <Pressable
                        style={[ps2.btnAction, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}
                        onPress={() => ouvrirFormulaire(suivi)}
                    >
                        <Text style={[ps2.btnActionTexte, { color: "#4F46E5" }]}>Modifier</Text>
                    </Pressable>

                    {suivi.statut !== "resolu" && (
                        <Pressable
                        style={[ps2.btnAction, { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }]}
                        onPress={() => handleChangerStatut(suivi, "resolu")}
                        >
                        <Text style={[ps2.btnActionTexte, { color: "#065F46" }]}>Résolu</Text>
                        </Pressable>
                    )}

                    {suivi.statut !== "en_cours" && suivi.statut !== "resolu" && (
                        <Pressable
                        style={[ps2.btnAction, { backgroundColor: "#FFFBEB", borderColor: "#FCD34D" }]}
                        onPress={() => handleChangerStatut(suivi, "en_cours")}
                        >
                        <Text style={[ps2.btnActionTexte, { color: "#633806" }]}>En cours</Text>
                        </Pressable>
                    )}

                    <Pressable
                        style={[ps2.btnAction, { backgroundColor: "#FEF2F2", borderColor: "#FECACA", flex: 0, paddingHorizontal: 12 }]}
                        onPress={() => handleSupprimer(suivi)}
                    >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </Pressable>
                    </View>
                </View>
                );
            })}
            </ScrollView>
        )}

        <Pressable style={ps2.fab} onPress={() => ouvrirFormulaire()}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={ps2.fabTexte}>Nouveau suivi</Text>
        </Pressable>
        </SafeAreaView>
    );
    }