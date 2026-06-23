import { useEffect, useState } from "react";
import {
    View, Text, TextInput, ScrollView, Pressable,
    Alert, ActivityIndicator, SafeAreaView,
  KeyboardAvoidingView, Platform,
} from "react-native";
    import {
    getVisiteurs, createVisiteur, updateVisiteur,
    deleteVisiteur, convertirEnMembre,
    } from "../services/visiteurs.service";
    import { styles, STATUT_COULEURS } from "../styles/visiteurs.styles";

    type Visiteur = {
    id: number; nom: string; telephone: string; email: string;
    sexe: string; date_premiere_visite: string; nombre_visites: number;
    statut: string; notes: string; communaute_culte: number;
    };

    type Vue = "liste" | "detail" | "formulaire";

    const SEXES = ["masculin", "feminin", "autre"];
    const SEXE_LABELS: Record<string, string> = {
    masculin: "Masculin", feminin: "Féminin", autre: "Autre",
    };

    const STATUTS = [
    { valeur: "nouveau",         label: "Nouveau",         desc: "Vient d'arriver, pas encore contacté" },
    { valeur: "contacte",        label: "Contacté",         desc: "A été appelé ou rencontré" },
    { valeur: "en_suivi",        label: "En suivi",         desc: "Suivi régulier en cours" },
    { valeur: "integre",         label: "Intégré",          desc: "Participe activement à l'église" },
    { valeur: "converti_membre", label: "Converti membre",  desc: "Devenu membre officiel" },
    ];

    const VISITEUR_VIDE = { nom: "", telephone: "", email: "", sexe: "", statut: "nouveau", notes: "", communaute_culte: 1 };

    export default function VisiteursScreen() {
    const [visiteurs, setVisiteurs] = useState<Visiteur[]>([]);
    const [chargement, setChargement] = useState(true);
    const [recherche, setRecherche] = useState("");
    const [filtreStatut, setFiltreStatut] = useState("");
    const [vue, setVue] = useState<Vue>("liste");
    const [visiteurSelectionne, setVisiteurSelectionne] = useState<Visiteur | null>(null);
    const [formulaire, setFormulaire] = useState<any>(VISITEUR_VIDE);
    const [modeEdition, setModeEdition] = useState(false);
    const [sauvegarde, setSauvegarde] = useState(false);

    useEffect(() => { chargerVisiteurs(); }, []);

    async function chargerVisiteurs() {
        setChargement(true);
        try {
        const data = await getVisiteurs();
        setVisiteurs(data);
        } catch {
        Alert.alert("Erreur", "Impossible de charger les visiteurs.");
        } finally { setChargement(false); }
    }

    async function sauvegarder() {
        if (!formulaire.nom.trim()) { Alert.alert("Champ requis", "Le nom est obligatoire."); return; }
        setSauvegarde(true);
        try {
        if (modeEdition && visiteurSelectionne) await updateVisiteur(visiteurSelectionne.id, formulaire);
        else await createVisiteur(formulaire);
        await chargerVisiteurs();
        setVue("liste");
        } catch {
        Alert.alert("Erreur", "Impossible de sauvegarder.");
        } finally { setSauvegarde(false); }
    }

    async function changerStatut(visiteur: Visiteur, statut: string) {
        try {
        await updateVisiteur(visiteur.id, { ...visiteur, statut });
        await chargerVisiteurs();
        setVisiteurSelectionne({ ...visiteur, statut });
        } catch { Alert.alert("Erreur", "Impossible de changer le statut."); }
    }

    async function confirmerConversion(visiteur: Visiteur) {
        Alert.alert("Convertir en membre ?", `${visiteur.nom} sera ajouté comme membre.`, [
        { text: "Annuler", style: "cancel" },
        { text: "Convertir", onPress: async () => {
            try {
            await convertirEnMembre(visiteur);
            Alert.alert("✅ Succès", `${visiteur.nom} est maintenant un membre.`);
            await chargerVisiteurs(); setVue("liste");
            } catch { Alert.alert("Erreur", "Impossible de convertir."); }
        }},
        ]);
    }

    async function confirmerSuppression(visiteur: Visiteur) {
        Alert.alert("Supprimer ?", `${visiteur.nom} sera supprimé définitivement.`, [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: async () => {
            await deleteVisiteur(visiteur.id); await chargerVisiteurs(); setVue("liste");
        }},
        ]);
    }

    function ouvrirDetail(v: Visiteur) { setVisiteurSelectionne(v); setVue("detail"); }
    function ouvrirFormulaire(v?: Visiteur) {
        if (v) { setFormulaire({ ...v }); setModeEdition(true); }
        else { setFormulaire(VISITEUR_VIDE); setModeEdition(false); }
        setVue("formulaire");
    }

    function initiales(nom: string) { return nom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2); }
    function couleurAvatar(statut: string) {
        const map: Record<string, string> = { nouveau: "#0C447C", contacte: "#633806", en_suivi: "#3C3489", integre: "#065F46", converti_membre: "#444441" };
        return map[statut] ?? "#07074C";
    }

    const visiteursFiltres = visiteurs.filter(v => {
        const matchRecherche = v.nom.toLowerCase().includes(recherche.toLowerCase());
        const matchStatut = filtreStatut ? v.statut === filtreStatut : true;
        return matchRecherche && matchStatut;
    });

    const compteurs = STATUTS.reduce((acc, s) => {
        acc[s.valeur] = visiteurs.filter(v => v.statut === s.valeur).length;
        return acc;
    }, {} as Record<string, number>);

    // ── LISTE ────────────────────────────────────────────────────────────────
    if (vue === "liste") {
        return (
        <SafeAreaView style={[styles.safe, { flex: 1 }]}>
            {/* Recherche */}
            <View style={styles.searchBar}>
            <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un visiteur..."
                placeholderTextColor="#94A3B8"
                value={recherche}
                onChangeText={setRecherche}
            />
            <Pressable style={styles.filterBtn} onPress={() => setFiltreStatut("")}>
                <Text style={styles.filterBtnText}>✕</Text>
            </Pressable>
            </View>

            {/* ✅ FIX : flexGrow: 0 pour limiter la hauteur du filtre */}
            <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.statutFiltreScroll, { flexGrow: 0 }]}
            contentContainerStyle={{ gap: 6, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center" }}
            >
            <Pressable
                style={[styles.statutPill, !filtreStatut && styles.statutPillActif]}
                onPress={() => setFiltreStatut("")}
            >
                <Text style={[styles.statutPillText, !filtreStatut && styles.statutPillTextActif]}>
                Tous ({visiteurs.length})
                </Text>
            </Pressable>
            {STATUTS.map(s => (
                <Pressable
                key={s.valeur}
                style={[styles.statutPill, filtreStatut === s.valeur && styles.statutPillActif]}
                onPress={() => setFiltreStatut(filtreStatut === s.valeur ? "" : s.valeur)}
                >
                <Text style={[styles.statutPillText, filtreStatut === s.valeur && styles.statutPillTextActif]}>
                    {s.label} ({compteurs[s.valeur] ?? 0})
                </Text>
                </Pressable>
            ))}
            </ScrollView>

            {/* ✅ FIX : flex: 1 pour que la liste prenne l'espace restant */}
            {chargement ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" />
            ) : (
            <ScrollView style={[styles.liste, { flex: 1 }]} contentContainerStyle={{ paddingBottom: 100 }}>
                <Text style={styles.compteLabel}>
                {visiteursFiltres.length} visiteur{visiteursFiltres.length > 1 ? "s" : ""}
                </Text>
                {visiteursFiltres.length === 0 ? (
                <Text style={{ color: "#94A3B8", fontStyle: "italic", textAlign: "center", marginTop: 30 }}>
                    Aucun visiteur trouvé.
                </Text>
                ) : (
                visiteursFiltres.map(v => {
                    const statutInfo = STATUT_COULEURS[v.statut] ?? STATUT_COULEURS.nouveau;
                    return (
                    <Pressable key={v.id} style={styles.visiteurCard} onPress={() => ouvrirDetail(v)}>
                        <View style={[styles.avatar, { backgroundColor: couleurAvatar(v.statut) }]}>
                        <Text style={styles.avatarText}>{initiales(v.nom)}</Text>
                        </View>
                        <View style={styles.visiteurInfo}>
                        <Text style={styles.visiteurNom}>{v.nom}</Text>
                        <Text style={styles.visiteurSub}>{v.telephone}</Text>
                        <Text style={styles.visiteurVisites}>
                            {v.nombre_visites} visite{v.nombre_visites > 1 ? "s" : ""} · depuis le {v.date_premiere_visite}
                        </Text>
                        <View style={[styles.statutBadge, { backgroundColor: statutInfo.fond, borderColor: statutInfo.bordure }]}>
                            <Text style={[styles.statutBadgeText, { color: statutInfo.texte }]}>
                            {STATUTS.find(s => s.valeur === v.statut)?.label ?? v.statut}
                            </Text>
                        </View>
                        </View>
                    </Pressable>
                    );
                })
                )}
            </ScrollView>
            )}

            <Pressable style={styles.fab} onPress={() => ouvrirFormulaire()}>
            <Text style={styles.fabText}>+ Ajouter</Text>
            </Pressable>
        </SafeAreaView>
        );
    }

    // ── DÉTAIL ───────────────────────────────────────────────────────────────
    if (vue === "detail" && visiteurSelectionne) {
        const v = visiteurSelectionne;
        return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled">
            <View style={styles.detailHeader}>
                <Pressable onPress={() => setVue("liste")} style={styles.retourBtn}>
                <Text style={styles.retourText}>‹ Retour</Text>
                </Pressable>
                <View style={[styles.detailAvatar, { backgroundColor: couleurAvatar(v.statut) }]}>
                <Text style={styles.detailAvatarText}>{initiales(v.nom)}</Text>
                </View>
                <Text style={styles.detailNom}>{v.nom}</Text>
                <Text style={styles.detailSub}>{v.nombre_visites} visite{v.nombre_visites > 1 ? "s" : ""} · depuis le {v.date_premiere_visite}</Text>
            </View>

            <View style={styles.detailBody}>
                <View style={styles.section}>
                <Text style={styles.sectionTitre}>Informations</Text>
                <View style={styles.infoRow}><Text style={styles.infoIcone}>📞</Text><Text style={styles.infoLabel}>Téléphone</Text><Text style={styles.infoValeur}>{v.telephone || "—"}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoIcone}>✉️</Text><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValeur}>{v.email || "—"}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoIcone}>👤</Text><Text style={styles.infoLabel}>Sexe</Text><Text style={styles.infoValeur}>{SEXE_LABELS[v.sexe] ?? "—"}</Text></View>
                </View>

                <View style={styles.section}>
                <Text style={styles.sectionTitre}>Suivi d'intégration</Text>
                <View style={styles.statutsContainer}>
                    {STATUTS.map(s => {
                    const estActif = v.statut === s.valeur;
                    const couleurs = STATUT_COULEURS[s.valeur];
                    return (
                        <Pressable key={s.valeur}
                        style={[styles.statutOption, { backgroundColor: estActif ? couleurs.fond : "#F8FAFC", borderColor: estActif ? couleurs.bordure : "#E2E8F0" }, estActif && styles.statutOptionActif]}
                        onPress={() => changerStatut(v, s.valeur)}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.statutOptionTexte, { color: estActif ? couleurs.texte : "#1E293B" }]}>{s.label}</Text>
                            <Text style={[styles.statutOptionDesc, { color: estActif ? couleurs.texte : "#94A3B8" }]}>{s.desc}</Text>
                        </View>
                        {estActif && <Text style={styles.statutCheck}>✓</Text>}
                        </Pressable>
                    );
                    })}
                </View>
                </View>

                {v.notes ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitre}>Notes</Text>
                    <Text style={{ fontSize: 14, color: "#1E293B", lineHeight: 20 }}>{v.notes}</Text>
                </View>
                ) : null}

                <View style={styles.actionsRow}>
                <Pressable style={styles.btnEditer} onPress={() => ouvrirFormulaire(v)}>
                    <Text style={styles.btnEditerText}>✏️ Modifier</Text>
                </Pressable>
                {v.statut !== "converti_membre" && (
                    <Pressable style={styles.btnConvertir} onPress={() => confirmerConversion(v)}>
                    <Text style={styles.btnConvertirText}>👥 → Membre</Text>
                    </Pressable>
                )}
                </View>
                <Pressable style={styles.btnSupprimer} onPress={() => confirmerSuppression(v)}>
                <Text style={styles.btnSupprimerText}>🗑 Supprimer</Text>
                </Pressable>
            </View>
            </ScrollView>
        </SafeAreaView>
        );
    }

    // ── FORMULAIRE ───────────────────────────────────────────────────────────
    if (vue === "formulaire") {
        return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={90}>
            <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
            <Pressable onPress={() => setVue(modeEdition ? "detail" : "liste")} style={styles.retourBtn}>
                <Text style={styles.retourText}>‹ Retour</Text>
            </Pressable>
            <Text style={styles.formTitre}>{modeEdition ? "Modifier le visiteur" : "Nouveau visiteur"}</Text>

            <Text style={styles.champLabel}>Nom complet *</Text>
            <TextInput style={styles.champInput} value={formulaire.nom}
                onChangeText={v => setFormulaire({ ...formulaire, nom: v })}
                placeholder="Nom et prénom" placeholderTextColor="#94A3B8" />

            <Text style={styles.champLabel}>Téléphone *</Text>
            <TextInput style={styles.champInput} value={formulaire.telephone}
                onChangeText={v => setFormulaire({ ...formulaire, telephone: v })}
                keyboardType="phone-pad" placeholder="06 12 34 56 78" placeholderTextColor="#94A3B8" />

            <Text style={styles.champLabel}>Email</Text>
            <TextInput style={styles.champInput} value={formulaire.email}
                onChangeText={v => setFormulaire({ ...formulaire, email: v })}
                keyboardType="email-address" autoCapitalize="none"
                placeholder="email@exemple.com" placeholderTextColor="#94A3B8" />

            <Text style={styles.champLabel}>Sexe</Text>
            <View style={styles.choixRow}>
                {SEXES.map(s => (
                <Pressable key={s} style={[styles.choixBtn, formulaire.sexe === s && styles.choixBtnActif]}
                    onPress={() => setFormulaire({ ...formulaire, sexe: s })}>
                    <Text style={[styles.choixBtnText, formulaire.sexe === s && styles.choixBtnTextActif]}>{SEXE_LABELS[s]}</Text>
                </Pressable>
                ))}
            </View>

            <Text style={styles.champLabel}>Statut</Text>
            <View style={styles.choixRow}>
                {STATUTS.map(s => (
                <Pressable key={s.valeur} style={[styles.choixBtn, formulaire.statut === s.valeur && styles.choixBtnActif]}
                    onPress={() => setFormulaire({ ...formulaire, statut: s.valeur })}>
                    <Text style={[styles.choixBtnText, formulaire.statut === s.valeur && styles.choixBtnTextActif]}>{s.label}</Text>
                </Pressable>
                ))}
            </View>

            <Text style={styles.champLabel}>Notes</Text>
            <TextInput style={[styles.champInput, styles.champInputMulti]} value={formulaire.notes}
                onChangeText={v => setFormulaire({ ...formulaire, notes: v })}
                multiline placeholder="Observations, contexte de la visite..." placeholderTextColor="#94A3B8" />

            <Pressable style={[styles.btnPrimaire, sauvegarde && { opacity: 0.6 }]} onPress={sauvegarder} disabled={sauvegarde}>
                {sauvegarde ? <ActivityIndicator color="#fff" /> :
                <Text style={styles.btnPrimaireText}>{modeEdition ? "Enregistrer les modifications" : "Ajouter le visiteur"}</Text>}
            </Pressable>
            </ScrollView>
        </SafeAreaView>
        );
    }

    return null;
    }