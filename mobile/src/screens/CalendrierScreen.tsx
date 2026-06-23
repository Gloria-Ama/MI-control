import { useEffect, useState } from "react";
    import {
    View, Text, ScrollView, Pressable, TextInput,
    Alert, ActivityIndicator, SafeAreaView,
  KeyboardAvoidingView, Platform,
} from "react-native";
    import { getEvenements, createEvenement, updateEvenement, deleteEvenement } from "../services/calendrier.service";
    import { getProfilConnecte } from "../services/auth.service";
    import { api } from "../services/api";
    import { cal, TYPE_COULEURS } from "../styles/calendrier.styles";

    type Evenement = {
    id: number;
    titre: string;
    description: string;
    type: string;
    type_label: string;
    date_debut: string;
    heure_debut: string | null;
    date_fin: string | null;
    heure_fin: string | null;
    lieu: string;
    tous_les_cultes: boolean;
    communaute_culte: number | null;
    };

    const TYPES = [
    { valeur: "culte",          label: "⛪ Culte" },
    { valeur: "reunion",        label: "📋 Réunion" },
    { valeur: "formation",      label: "📚 Formation" },
    { valeur: "evangelisation", label: "✝️ Évangélisation" },
    { valeur: "social",         label: "🎉 Social" },
    { valeur: "anniversaire",   label: "🎂 Anniversaire" },
    { valeur: "autre",          label: "📌 Autre" },
    ];

    const MOIS_NOMS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
    ];
    const JOURS_COURTS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

    export default function CalendrierScreen() {
    const aujourd = new Date();
    const [moisActuel, setMoisActuel] = useState(aujourd.getMonth());
    const [anneeActuelle, setAnneeActuelle] = useState(aujourd.getFullYear());
    const [jourSelectionne, setJourSelectionne] = useState<string | null>(null);
    const [evenements, setEvenements] = useState<Evenement[]>([]);
    const [communauteId, setCommunauteId] = useState<number | undefined>();
    const [profil, setProfil] = useState<any>(null);
    const [chargement, setChargement] = useState(true);
    const [vue, setVue] = useState<"calendrier" | "formulaire">("calendrier");
    const [evenementEdite, setEvenementEdite] = useState<Evenement | null>(null);
    const [sauvegarde, setSauvegarde] = useState(false);

    // Formulaire
    const [formTitre, setFormTitre] = useState("");
    const [formType, setFormType] = useState("culte");
    const [formDateDebut, setFormDateDebut] = useState("");
    const [formHeureDebut, setFormHeureDebut] = useState("");
    const [formDateFin, setFormDateFin] = useState("");
    const [formLieu, setFormLieu] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formTousLesCultes, setFormTousLesCultes] = useState(false);

    const estAdmin = profil?.role === "pasteur" || profil?.role === "administrateur";

    useEffect(() => { chargerDonnees(); }, []);
    useEffect(() => { chargerEvenements(); }, [moisActuel, anneeActuelle, communauteId]);

    async function chargerDonnees() {
        try {
        const [p, cultes] = await Promise.all([
            getProfilConnecte().catch(() => null),
            api.get("/communautes/").then(r => r.data).catch(() => []),
        ]);
        setProfil(p);
        let cid = p?.communaute_culte ? Number(p.communaute_culte) : undefined;
        if (!cid && cultes.length > 0) cid = cultes[0].id;
        setCommunauteId(cid);
        } catch {}
    }

    async function chargerEvenements() {
        setChargement(true);
        try {
        const data = await getEvenements({
            communaute_culte: communauteId,
            mois: moisActuel + 1,
            annee: anneeActuelle,
        });
        setEvenements(Array.isArray(data) ? data : []);
        } finally {
        setChargement(false);
        }
    }

    // ── Calendrier ────────────────────────────────────────────────────────────

    function jousrDuMois(): (string | null)[] {
        const premier = new Date(anneeActuelle, moisActuel, 1);
        const dernier = new Date(anneeActuelle, moisActuel + 1, 0);
        const jours: (string | null)[] = [];

        // Jours vides avant le 1er
        for (let i = 0; i < premier.getDay(); i++) jours.push(null);

        // Jours du mois
        for (let d = 1; d <= dernier.getDate(); d++) {
        const date = `${anneeActuelle}-${String(moisActuel + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        jours.push(date);
        }

        // Compléter à 42 cellules
        while (jours.length % 7 !== 0) jours.push(null);
        return jours;
    }

    function evenementsDuJour(date: string) {
        return evenements.filter(e => e.date_debut === date);
    }

    function moisPrecedent() {
        if (moisActuel === 0) { setMoisActuel(11); setAnneeActuelle(a => a - 1); }
        else setMoisActuel(m => m - 1);
    }

    function moisSuivant() {
        if (moisActuel === 11) { setMoisActuel(0); setAnneeActuelle(a => a + 1); }
        else setMoisActuel(m => m + 1);
    }

    function formatDate(dateStr: string) {
        try {
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        } catch { return dateStr; }
    }

    // ── Formulaire ────────────────────────────────────────────────────────────

    function ouvrirFormulaire(ev?: Evenement) {
        if (ev) {
        setEvenementEdite(ev);
        setFormTitre(ev.titre);
        setFormType(ev.type);
        setFormDateDebut(ev.date_debut);
        setFormHeureDebut(ev.heure_debut ?? "");
        setFormDateFin(ev.date_fin ?? "");
        setFormLieu(ev.lieu);
        setFormDescription(ev.description);
        setFormTousLesCultes(ev.tous_les_cultes);
        } else {
        setEvenementEdite(null);
        setFormTitre("");
        setFormType("culte");
        setFormDateDebut(jourSelectionne ?? aujourd.toISOString().split("T")[0]);
        setFormHeureDebut("");
        setFormDateFin("");
        setFormLieu("");
        setFormDescription("");
        setFormTousLesCultes(false);
        }
        setVue("formulaire");
    }

    async function sauvegarder() {
        if (!formTitre.trim() || !formDateDebut.trim()) {
        Alert.alert("Champs requis", "Le titre et la date de début sont obligatoires.");
        return;
        }
        setSauvegarde(true);
        try {
        const donnees = {
            titre: formTitre.trim(),
            type: formType,
            date_debut: formDateDebut,
            heure_debut: formHeureDebut || null,
            date_fin: formDateFin || null,
            lieu: formLieu.trim(),
            description: formDescription.trim(),
            tous_les_cultes: formTousLesCultes,
            communaute_culte: formTousLesCultes ? null : communauteId,
        };
        if (evenementEdite) {
            await updateEvenement(evenementEdite.id, donnees);
        } else {
            await createEvenement(donnees);
        }
        await chargerEvenements();
        setVue("calendrier");
        Alert.alert("✅", evenementEdite ? "Événement modifié." : "Événement créé.");
        } catch (error: any) {
        Alert.alert("Erreur", JSON.stringify(error?.response?.data ?? "Impossible de sauvegarder."));
        } finally {
        setSauvegarde(false);
        }
    }

    async function confirmerSuppression(ev: Evenement) {
        Alert.alert("Supprimer ?", `Supprimer "${ev.titre}" ?`, [
        { text: "Annuler", style: "cancel" },
        {
            text: "Supprimer", style: "destructive",
            onPress: async () => {
            await deleteEvenement(ev.id);
            await chargerEvenements();
            },
        },
        ]);
    }

    // ── FORMULAIRE ────────────────────────────────────────────────────────────
    if (vue === "formulaire") {
        return (
        <SafeAreaView style={cal.safe}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={90}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled">
            <Pressable onPress={() => setVue("calendrier")} style={cal.retourBtn}>
                <Text style={cal.retourText}>‹ Retour</Text>
            </Pressable>

            <Text style={cal.formTitre}>
                {evenementEdite ? "Modifier l'événement" : "Nouvel événement"}
            </Text>

            <Text style={cal.champLabel}>Titre *</Text>
            <TextInput
                style={cal.champInput}
                value={formTitre}
                onChangeText={setFormTitre}
                placeholder="Ex: Culte du jeudi"
                placeholderTextColor="#94A3B8"
            />

            <Text style={cal.champLabel}>Type</Text>
            <View style={cal.typeRow}>
                {TYPES.map(t => {
                const couleur = TYPE_COULEURS[t.valeur];
                const actif = formType === t.valeur;
                return (
                    <Pressable
                    key={t.valeur}
                    style={[cal.typeBtn, actif && cal.typeBtnActif, actif && { backgroundColor: couleur }]}
                    onPress={() => setFormType(t.valeur)}
                    >
                    <Text style={[cal.typeBtnTexte, actif && cal.typeBtnTexteActif]}>
                        {t.label}
                    </Text>
                    </Pressable>
                );
                })}
            </View>

            <Text style={cal.champLabel}>Date de début * (AAAA-MM-JJ)</Text>
            <TextInput
                style={cal.champInput}
                value={formDateDebut}
                onChangeText={setFormDateDebut}
                placeholder="Ex: 2026-06-20"
                placeholderTextColor="#94A3B8"
            />

            <Text style={cal.champLabel}>Heure de début (HH:MM)</Text>
            <TextInput
                style={cal.champInput}
                value={formHeureDebut}
                onChangeText={setFormHeureDebut}
                placeholder="Ex: 19:00"
                placeholderTextColor="#94A3B8"
            />

            <Text style={cal.champLabel}>Date de fin (AAAA-MM-JJ)</Text>
            <TextInput
                style={cal.champInput}
                value={formDateFin}
                onChangeText={setFormDateFin}
                placeholder="Optionnel"
                placeholderTextColor="#94A3B8"
            />

            <Text style={cal.champLabel}>Lieu</Text>
            <TextInput
                style={cal.champInput}
                value={formLieu}
                onChangeText={setFormLieu}
                placeholder="Ex: Salle principale"
                placeholderTextColor="#94A3B8"
            />

            <Text style={cal.champLabel}>Description</Text>
            <TextInput
                style={[cal.champInput, cal.champInputMulti]}
                value={formDescription}
                onChangeText={setFormDescription}
                multiline
                placeholder="Détails de l'événement..."
                placeholderTextColor="#94A3B8"
            />

            <Pressable
                style={cal.toggleRow}
                onPress={() => setFormTousLesCultes(!formTousLesCultes)}
            >
                <Text style={cal.toggleLabel}>Visible par tous les cultes</Text>
                <View style={[cal.toggleBouton, formTousLesCultes ? cal.toggleOn : cal.toggleOff]}>
                <View style={[cal.toggleKnob, formTousLesCultes ? cal.toggleKnobOn : cal.toggleKnobOff]} />
                </View>
            </Pressable>

            <Pressable
                style={[cal.btnSoumettre, sauvegarde && { opacity: 0.6 }]}
                onPress={sauvegarder}
                disabled={sauvegarde}
            >
                {sauvegarde
                ? <ActivityIndicator color="#fff" />
                : <Text style={cal.btnSoumettreTexte}>
                    {evenementEdite ? "Enregistrer les modifications" : "Créer l'événement"}
                    </Text>
                }
            </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
        );
    }

    // ── CALENDRIER ────────────────────────────────────────────────────────────
    const jours = jousrDuMois();
    const semaines: (string | null)[][] = [];
    for (let i = 0; i < jours.length; i += 7) semaines.push(jours.slice(i, i + 7));

    const aujourdHuiStr = aujourd.toISOString().split("T")[0];

    // Événements à afficher (jour sélectionné ou tous du mois)
    const evenementsAffiches = jourSelectionne
        ? evenementsDuJour(jourSelectionne)
        : evenements;

    return (
        <SafeAreaView style={cal.safe}>
        {/* En-tête mois */}
        <View style={cal.moisHeader}>
            <Pressable style={cal.moisBouton} onPress={moisPrecedent}>
            <Text style={cal.moisBoutonTexte}>‹</Text>
            </Pressable>
            <Text style={cal.moisTitre}>
            {MOIS_NOMS[moisActuel]} {anneeActuelle}
            </Text>
            <Pressable style={cal.moisBouton} onPress={moisSuivant}>
            <Text style={cal.moisBoutonTexte}>›</Text>
            </Pressable>
        </View>

        {/* Jours de la semaine */}
        <View style={cal.joursHeader}>
            {JOURS_COURTS.map(j => (
            <Text key={j} style={cal.jourHeaderTexte}>{j}</Text>
            ))}
        </View>

        {/* Grille */}
        <View style={cal.grille}>
            {semaines.map((semaine, si) => (
            <View key={si} style={cal.semaine}>
                {semaine.map((date, di) => {
                const evts = date ? evenementsDuJour(date) : [];
                const estAujourdhui = date === aujourdHuiStr;
                const estSelectionne = date === jourSelectionne;
                const horsMois = !date;

                return (
                    <Pressable
                    key={di}
                    style={[
                        cal.jourCell,
                        horsMois && cal.jourCellHorseMois,
                        estAujourdhui && cal.jourCellAujourdhui,
                        estSelectionne && cal.jourCellSelectionne,
                    ]}
                    onPress={() => {
                        if (!date) return;
                        setJourSelectionne(jourSelectionne === date ? null : date);
                    }}
                    >
                    <Text style={[
                        cal.jourTexte,
                        horsMois && cal.jourTexteHorsMois,
                        estAujourdhui && cal.jourTexteAujourdhui,
                        estSelectionne && cal.jourTexteSelectionne,
                    ]}>
                        {date ? new Date(date + "T00:00:00").getDate() : ""}
                    </Text>
                    {evts.length > 0 && (
                        <View style={cal.dotsRow}>
                        {evts.slice(0, 3).map((e, i) => (
                            <View
                            key={i}
                            style={[
                                cal.dot,
                                { backgroundColor: estSelectionne ? "#fff" : (TYPE_COULEURS[e.type] ?? "#64748B") },
                            ]}
                            />
                        ))}
                        </View>
                    )}
                    </Pressable>
                );
                })}
            </View>
            ))}
        </View>

        {/* Liste événements */}
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled">
            <Text style={cal.listeTitre}>
            {jourSelectionne
                ? formatDate(jourSelectionne)
                : `Événements — ${MOIS_NOMS[moisActuel]}`}
            {" "}({evenementsAffiches.length})
            </Text>

            {chargement ? (
            <ActivityIndicator color="#07074C" style={{ marginTop: 20 }} />
            ) : evenementsAffiches.length === 0 ? (
            <Text style={cal.videTexte}>
                {jourSelectionne ? "Aucun événement ce jour." : "Aucun événement ce mois-ci."}
            </Text>
            ) : (
            evenementsAffiches.map(ev => {
                const couleur = TYPE_COULEURS[ev.type] ?? "#64748B";
                return (
                <View key={ev.id} style={cal.eventCard}>
                    <View style={[cal.eventBarre, { backgroundColor: couleur }]} />
                    <View style={cal.eventContenu}>
                    <Text style={cal.eventTitre}>{ev.titre}</Text>
                    <Text style={cal.eventMeta}>
                        📅 {ev.date_debut}
                        {ev.heure_debut ? ` · ⏰ ${ev.heure_debut.slice(0, 5)}` : ""}
                        {ev.date_fin && ev.date_fin !== ev.date_debut ? ` → ${ev.date_fin}` : ""}
                    </Text>
                    {ev.lieu ? <Text style={cal.eventLieu}>📍 {ev.lieu}</Text> : null}
                    {ev.description ? (
                        <Text style={cal.eventDesc} numberOfLines={2}>{ev.description}</Text>
                    ) : null}
                    <View style={[cal.eventBadge, { backgroundColor: couleur }]}>
                        <Text style={cal.eventBadgeTexte}>{ev.type_label}</Text>
                    </View>
                    {estAdmin && (
                        <View style={cal.eventActions}>
                        <Pressable style={cal.btnEdit} onPress={() => ouvrirFormulaire(ev)}>
                            <Text style={cal.btnEditTexte}>✏️ Modifier</Text>
                        </Pressable>
                        <Pressable style={cal.btnDelete} onPress={() => confirmerSuppression(ev)}>
                            <Text style={cal.btnDeleteTexte}>🗑 Supprimer</Text>
                        </Pressable>
                        </View>
                    )}
                    </View>
                </View>
                );
            })
            )}
        </ScrollView>

        {estAdmin && (
            <Pressable style={cal.fab} onPress={() => ouvrirFormulaire()}>
            <Text style={cal.fabTexte}>+ Événement</Text>
            </Pressable>
        )}
        </SafeAreaView>
    );
    }