    import { useEffect, useState } from "react";
    import {
    View, Text, TextInput, ScrollView, Pressable,
    Alert, ActivityIndicator, SafeAreaView,
    } from "react-native";
    import { getMembres, createMembre, updateMembre, deleteMembre, getHistoriquePresences } from "../services/membres.service";
    import { getDepartements } from "../services/departements.service";
    import { getProfilConnecte } from "../services/auth.service";
    import { api } from "../services/api";
    import { s } from "../styles/membres.styles";
    import PhoneInput from "../components/PhoneInput";

    type Membre = {
    id: number; nom: string; telephone: string; email: string;
    sexe: string; date_anniversaire: string; adresse: string;
    departement: number | null; departement_nom: string | null;
    statut: string; notes: string; taux_presence: number | null;
    absences_recentes: number; communautes_culte: number[];
    };
    type Departement = { id: number; nom: string };
    type DepartementAvecCulte = { id: number; nom: string; culteNom: string };
    type Culte = { id: number; nom: string };

    type Props = {
    nomCulte?: string;
    communauteId?: number;
    };

    const STATUTS = ["actif", "inactif", "en_pause"];
    const SEXES = ["masculin", "feminin", "autre"];
    const STATUT_LABELS: Record<string, string> = {
    actif: "Actif", inactif: "Inactif", en_pause: "En pause",
    };
    const SEXE_LABELS: Record<string, string> = {
    masculin: "Masculin", feminin: "Féminin", autre: "Autre",
    };

    export default function MembresScreen({ nomCulte, communauteId }: Props) {
    const [membres, setMembres] = useState<Membre[]>([]);
    const [departements, setDepartements] = useState<Departement[]>([]);
    const [tousLesDepartements, setTousLesDepartements] = useState<DepartementAvecCulte[]>([]);
    const [cultes, setCultes] = useState<Culte[]>([]);
    const [chargement, setChargement] = useState(true);
    const [recherche, setRecherche] = useState("");
    const [vue, setVue] = useState<"liste" | "detail" | "formulaire">("liste");
    const [membreSelectionne, setMembreSelectionne] = useState<Membre | null>(null);
    const [historiquePresences, setHistoriquePresences] = useState<any[]>([]);
    const [formulaire, setFormulaire] = useState<any>({});
    const [modeEdition, setModeEdition] = useState(false);
    const [sauvegarde, setSauvegarde] = useState(false);
    const [erreurs, setErreurs] = useState<{ nom?: string; telephone?: string }>({});
    const [telephoneValide, setTelephoneValide] = useState(false);
    const [deptOuvert, setDeptOuvert] = useState(false);

    useEffect(() => { chargerDonnees(); }, [communauteId]);

    async function chargerDonnees() {
        setChargement(true);
        try {
            // Charger communautés EN PREMIER
            const c = await api.get("/communautes/").then(r => r.data).catch(() => []);
            setCultes(c);

            // Construire map culteId → culteNom
            const cultesMap: Record<number, string> = {};
            (c as Culte[]).forEach(cu => { cultesMap[cu.id] = cu.nom; });

            // Charger membres et départements en parallèle
            const [m, tousD] = await Promise.all([
            getMembres({ communaute_culte: communauteId }),
            api.get("/departements/").then(r => r.data),
            ]);

            setMembres(m);

        // Enrichir départements avec nom du culte
        const departementsAvecCulte: DepartementAvecCulte[] = (tousD as any[]).map(dep => ({
        id: dep.id,
        nom: dep.nom,
        culteNom: cultesMap[dep.communaute_culte] ?? "Inconnu",
        }));
        setTousLesDepartements(departementsAvecCulte);

        const depFiltres = communauteId
        ? (tousD as any[]).filter(d => d.communaute_culte === communauteId)
        : tousD;
        setDepartements(depFiltres);

    } catch (err) {
        console.log("Erreur chargement:", err);
        Alert.alert("Erreur", "Impossible de charger les données.");
    } finally {
        setChargement(false);
    }
    }

    async function ouvrirDetail(membre: Membre) {
        setMembreSelectionne(membre);
        setVue("detail");
        try {
        const h = await getHistoriquePresences(membre.id);
        setHistoriquePresences(h);
        } catch {}
    }
    function ouvrirFormulaire(membre?: Membre) {
        if (membre) {
            setFormulaire({ ...membre });
            setModeEdition(true);
            setTelephoneValide(true);
        } else {
            // ✅ Pré-cocher le culte actif automatiquement
            const cultesInitiaux = communauteId ? [Number(communauteId)] : 
            cultes.length > 0 ? [cultes[0].id] : [];

            setFormulaire({
            nom: "",
            telephone: "",
            email: "",
            sexe: "masculin",
            date_anniversaire: "",
            adresse: "",
            departement: null,
            statut: "actif",
            notes: "",
            communautes_culte: cultesInitiaux,
            });
            setModeEdition(false);
            setTelephoneValide(false);
        }
        setErreurs({});
        setDeptOuvert(false);
        setVue("formulaire");
        }
    

    function valider(): boolean {
        const nouvellesErreurs: { nom?: string; telephone?: string } = {};
        if (!formulaire.nom?.trim()) {
        nouvellesErreurs.nom = "Le nom est obligatoire.";
        }
        if (!formulaire.telephone?.trim()) {
        nouvellesErreurs.telephone = "Le téléphone est obligatoire.";
        } else if (!telephoneValide) {
        nouvellesErreurs.telephone = "Le numéro de téléphone est invalide.";
        }
        setErreurs(nouvellesErreurs);
        return Object.keys(nouvellesErreurs).length === 0;
    }

    async function sauvegarder() {
        if (!valider()) return;
        setSauvegarde(true);
        try {
        const cultesSelectionnes = (formulaire.communautes_culte ?? []).map(Number);
        if (cultesSelectionnes.length === 0 && communauteId) {
            cultesSelectionnes.push(Number(communauteId));
        }

        const donnees = {
            nom: formulaire.nom?.trim(),
            telephone: formulaire.telephone?.trim(),
            email: formulaire.email?.trim() ?? "",
            sexe: formulaire.sexe ?? "",
            date_anniversaire: formulaire.date_anniversaire?.trim() ?? "",
            adresse: formulaire.adresse?.trim() ?? "",
            departement: formulaire.departement ? Number(formulaire.departement) : null,
            statut: formulaire.statut ?? "actif",
            notes: formulaire.notes?.trim() ?? "",
            communautes_culte: cultesSelectionnes,
        };

        if (modeEdition && membreSelectionne) {
            await updateMembre(membreSelectionne.id, donnees);
        } else {
            await createMembre(donnees);
        }
        await chargerDonnees();
        setVue("liste");
        Alert.alert("✅ Succès", modeEdition ? "Membre modifié." : "Membre ajouté.");
        } catch (error: any) {
        const message = error?.response?.data
            ? JSON.stringify(error.response.data, null, 2)
            : "Impossible de sauvegarder.";
        Alert.alert("Erreur", message);
        } finally {
        setSauvegarde(false);
        }
    }

    async function confirmerSuppression(membre: Membre) {
        Alert.alert(
        "Supprimer ?",
        `${membre.nom} sera supprimé définitivement.`,
        [
            { text: "Annuler", style: "cancel" },
            {
            text: "Supprimer", style: "destructive",
            onPress: async () => {
                await deleteMembre(membre.id);
                await chargerDonnees();
                setVue("liste");
            },
            },
        ]
        );
    }

    function initiales(nom: string) {
        return nom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }

    function couleur(nom: string) {
        const c = ["#07074C", "#4F46E5", "#0F6E56", "#854F0B", "#993C1D"];
        return c[nom.charCodeAt(0) % c.length];
    }

    const membresFiltres = membres.filter(m =>
        m.nom.toLowerCase().includes(recherche.toLowerCase())
    );

    const deptsJeudi = tousLesDepartements.filter(d =>
        d.culteNom.toLowerCase().includes("jeudi")
    );
    const deptsDimanche = tousLesDepartements.filter(d =>
        d.culteNom.toLowerCase().includes("dimanche")
    );

    function nomDeptSelectionne(): string {
        if (!formulaire.departement) return "Aucun département";
        const d = tousLesDepartements.find(
        dep => Number(dep.id) === Number(formulaire.departement)
        );
        return d ? `${d.nom} (${d.culteNom})` : "Choisir un département";
    }

    // ── LISTE ──────────────────────────────────────────────────────────────────
    if (vue === "liste") {
        return (
        <SafeAreaView style={s.safe}>
            <View style={s.searchBar}>
            <TextInput
                style={s.searchInput}
                placeholder="🔍  Rechercher un membre..."
                placeholderTextColor="#94A3B8"
                value={recherche}
                onChangeText={setRecherche}
            />
            </View>

            {chargement ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />
            ) : (
            <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 100 }}>
                <Text style={s.compteLabel}>
                {membresFiltres.length} membre{membresFiltres.length > 1 ? "s" : ""}
                {nomCulte ? ` — ${nomCulte}` : ""}
                </Text>

                {membresFiltres.length === 0 && (
                <Text style={s.videTexte}>Aucun membre pour ce culte.</Text>
                )}

                {membresFiltres.map(m => (
                <Pressable key={m.id} style={s.membreCard} onPress={() => ouvrirDetail(m)}>
                    <View style={[s.avatar, { backgroundColor: couleur(m.nom) }]}>
                    <Text style={s.avatarText}>{initiales(m.nom)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                    <Text style={s.membreNom}>{m.nom}</Text>
                    <Text style={s.membreSub}>
                        {m.departement_nom ?? "Sans département"}
                        {m.sexe ? ` · ${SEXE_LABELS[m.sexe]}` : ""}
                    </Text>
                    {(m.absences_recentes ?? 0) >= 3 && (
                        <Text style={s.alerte}>⚠ {m.absences_recentes} absences consécutives</Text>
                    )}
                    </View>
                    <View style={[
                    s.statutBadge,
                    m.statut === "actif" ? s.badgeActif :
                    m.statut === "inactif" ? s.badgeDanger : s.badgeNeutre,
                    ]}>
                    <Text style={[
                        s.statutTexte,
                        m.statut === "actif" ? s.badgeActifTexte :
                        m.statut === "inactif" ? s.badgeDangerTexte : s.badgeNeutreTexte,
                    ]}>
                        {STATUT_LABELS[m.statut]}
                    </Text>
                    </View>
                </Pressable>
                ))}
            </ScrollView>
            )}

            <Pressable style={s.fab} onPress={() => ouvrirFormulaire()}>
            <Text style={s.fabText}>+ Ajouter</Text>
            </Pressable>
        </SafeAreaView>
        );
    }

    // ── DÉTAIL ─────────────────────────────────────────────────────────────────
    if (vue === "detail" && membreSelectionne) {
        const m = membreSelectionne;
        const presents = historiquePresences.filter(p => p.present).length;
        const total = historiquePresences.length;

        return (
        <SafeAreaView style={s.safe}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={s.detailHeader}>
                <Pressable onPress={() => setVue("liste")} style={s.retourBtn}>
                <Text style={s.retourText}>‹ Retour</Text>
                </Pressable>
                <View style={[s.detailAvatar, { backgroundColor: couleur(m.nom) }]}>
                <Text style={s.detailAvatarText}>{initiales(m.nom)}</Text>
                </View>
                <Text style={s.detailNom}>{m.nom}</Text>
                <Text style={s.detailSub}>{m.departement_nom ?? "Sans département"}</Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                <View style={[
                    s.statutBadge,
                    m.statut === "actif" ? s.badgeActif : s.badgeDanger,
                ]}>
                    <Text style={[
                    s.statutTexte,
                    m.statut === "actif" ? s.badgeActifTexte : s.badgeDangerTexte,
                    ]}>
                    {STATUT_LABELS[m.statut]}
                    </Text>
                </View>
                {m.sexe ? (
                    <View style={s.statutBadge}>
                    <Text style={s.statutTexte}>{SEXE_LABELS[m.sexe]}</Text>
                    </View>
                ) : null}
                </View>
            </View>

            <View style={{ padding: 16 }}>
                <View style={s.section}>
                <Text style={s.sectionTitre}>Informations</Text>
                {[
                    { i: "📞", l: "Téléphone", v: m.telephone },
                    { i: "✉️", l: "Email", v: m.email },
                    { i: "🎂", l: "Anniversaire", v: m.date_anniversaire },
                    { i: "🏠", l: "Adresse", v: m.adresse },
                ].map(row => (
                    <View key={row.l} style={s.infoRow}>
                    <Text style={s.infoIcone}>{row.i}</Text>
                    <Text style={s.infoLabel}>{row.l}</Text>
                    <Text style={s.infoValeur}>{row.v || "—"}</Text>
                    </View>
                ))}
                </View>

                {total > 0 && (
                <View style={s.section}>
                    <Text style={s.sectionTitre}>Présences — {total} derniers cultes</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {historiquePresences.slice(0, 12).map((p, i) => (
                        <View key={i} style={[s.presenceDot, p.present ? s.presentDot : s.absentDot]} />
                    ))}
                    </View>
                    <View style={{ flexDirection: "row", gap: 16 }}>
                    <Text style={{ fontSize: 12, color: "#64748B" }}>✅ {presents}</Text>
                    <Text style={{ fontSize: 12, color: "#64748B" }}>❌ {total - presents}</Text>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#07074C" }}>
                        {m.taux_presence ?? 0}%
                    </Text>
                    </View>
                    {(m.absences_recentes ?? 0) >= 3 && (
                    <View style={s.alerteBox}>
                        <Text style={s.alerteBoxText}>
                        ⚠️ Absent(e) {m.absences_recentes} fois de suite
                        </Text>
                    </View>
                    )}
                </View>
                )}

                {m.notes ? (
                <View style={s.section}>
                    <Text style={s.sectionTitre}>Notes</Text>
                    <Text style={{ fontSize: 14, color: "#1E293B", lineHeight: 20 }}>
                    {m.notes}
                    </Text>
                </View>
                ) : null}

                <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                <Pressable
                    style={[s.btnAction, { backgroundColor: "#07074C" }]}
                    onPress={() => ouvrirFormulaire(m)}
                >
                    <Text style={s.btnActionText}>✏️ Modifier</Text>
                </Pressable>
                <Pressable
                    style={[s.btnAction, {
                    backgroundColor: "#FEF2F2",
                    borderWidth: 0.5, borderColor: "#FECACA",
                    }]}
                    onPress={() => confirmerSuppression(m)}
                >
                    <Text style={[s.btnActionText, { color: "#EF4444" }]}>🗑 Supprimer</Text>
                </Pressable>
                </View>
            </View>
            </ScrollView>
        </SafeAreaView>
        );
    }

    // ── FORMULAIRE ─────────────────────────────────────────────────────────────
    if (vue === "formulaire") {
        return (
        <SafeAreaView style={s.safe}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

            <Pressable
                onPress={() => setVue(modeEdition ? "detail" : "liste")}
                style={s.retourBtn}
            >
                <Text style={s.retourText}>‹ Retour</Text>
            </Pressable>

            <Text style={s.formTitre}>
                {modeEdition ? "Modifier le membre" : "Nouveau membre"}
            </Text>

            {/* Nom */}
            <Text style={s.champLabel}>Nom complet *</Text>
            <TextInput
                style={[s.champInput, erreurs.nom ? s.champInputErreur : null]}
                value={formulaire.nom}
                onChangeText={v => {
                setFormulaire({ ...formulaire, nom: v });
                if (v.trim()) setErreurs(e => ({ ...e, nom: undefined }));
                }}
                placeholder="Nom et prénom"
                placeholderTextColor="#94A3B8"
            />
            {erreurs.nom && <Text style={s.champErreur}>⚠ {erreurs.nom}</Text>}

            {/* Téléphone */}
            <Text style={s.champLabel}>Téléphone *</Text>
            <PhoneInput
                valeur={formulaire.telephone ?? ""}
                onChange={(v, valide) => {
                setFormulaire({ ...formulaire, telephone: v });
                setTelephoneValide(valide);
                if (valide) setErreurs(e => ({ ...e, telephone: undefined }));
                }}
                erreur={erreurs.telephone}
            />

            {/* Email */}
            <Text style={s.champLabel}>Email</Text>
            <TextInput
                style={s.champInput}
                value={formulaire.email}
                onChangeText={v => setFormulaire({ ...formulaire, email: v })}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="email@exemple.com"
                placeholderTextColor="#94A3B8"
            />

            {/* Anniversaire */}
            <Text style={s.champLabel}>Anniversaire (JJ/MM)</Text>
            <TextInput
                style={s.champInput}
                value={formulaire.date_anniversaire}
                onChangeText={v => setFormulaire({ ...formulaire, date_anniversaire: v })}
                placeholder="Ex: 25/12"
                placeholderTextColor="#94A3B8"
            />

            {/* Adresse */}
            <Text style={s.champLabel}>Adresse</Text>
            <TextInput
                style={[s.champInput, s.champInputMulti]}
                value={formulaire.adresse}
                onChangeText={v => setFormulaire({ ...formulaire, adresse: v })}
                multiline
                placeholder="Adresse complète"
                placeholderTextColor="#94A3B8"
            />

            {/* Sexe */}
            <Text style={s.champLabel}>Sexe</Text>
            <View style={s.choixRow}>
                {SEXES.map(sx => (
                <Pressable
                    key={sx}
                    style={[s.choixBtn, formulaire.sexe === sx && s.choixBtnActif]}
                    onPress={() => setFormulaire({ ...formulaire, sexe: sx })}
                >
                    <Text style={[s.choixBtnText, formulaire.sexe === sx && s.choixBtnTextActif]}>
                    {SEXE_LABELS[sx]}
                    </Text>
                </Pressable>
                ))}
            </View>

            {/* Statut */}
            <Text style={s.champLabel}>Statut</Text>
            <View style={s.choixRow}>
                {STATUTS.map(st => (
                <Pressable
                    key={st}
                    style={[s.choixBtn, formulaire.statut === st && s.choixBtnActif]}
                    onPress={() => setFormulaire({ ...formulaire, statut: st })}
                >
                    <Text style={[s.choixBtnText, formulaire.statut === st && s.choixBtnTextActif]}>
                    {STATUT_LABELS[st]}
                    </Text>
                </Pressable>
                ))}
            </View>

            {/* Cultes */}
            <Text style={s.champLabel}>Culte(s)</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                {cultes.map(c => {
                const estSelectionne = (formulaire.communautes_culte ?? [])
                    .map(Number).includes(Number(c.id));
                return (
                    <Pressable
                    key={c.id}
                    style={[s.choixBtn, estSelectionne && s.choixBtnActif]}
                    onPress={() => {
                        const actuels = (formulaire.communautes_culte ?? []).map(Number);
                        const nouveau = estSelectionne
                        ? actuels.filter((id: number) => id !== Number(c.id))
                        : [...actuels, Number(c.id)];
                        setFormulaire({ ...formulaire, communautes_culte: nouveau });
                    }}
                    >
                    <Text style={[s.choixBtnText, estSelectionne && s.choixBtnTextActif]}>
                        {c.nom.replace("Culte du ", "")}
                    </Text>
                    </Pressable>
                );
                })}
            </View>

            {/* Département — groupé par culte */}
            <Text style={s.champLabel}>Département</Text>
            <Pressable
                style={s.deptSelector}
                onPress={() => setDeptOuvert(!deptOuvert)}
            >
                <Text style={s.deptSelectorTexte}>{nomDeptSelectionne()}</Text>
                <Text style={s.deptSelectorChevron}>{deptOuvert ? "▲" : "▼"}</Text>
            </Pressable>

            {deptOuvert && (
                <View style={s.deptListe}>
                {/* Aucun */}
                <Pressable
                    style={s.deptOption}
                    onPress={() => { setFormulaire({ ...formulaire, departement: null }); setDeptOuvert(false); }}
                >
                    <Text style={[s.deptOptionTexte, !formulaire.departement && s.deptOptionTexteActif]}>
                    Aucun département
                    </Text>
                    {!formulaire.departement && <Text style={s.deptCheck}>✓</Text>}
                </Pressable>

                {/* Groupe Jeudi */}
                {deptsJeudi.length > 0 && (
                    <>
                    <View style={s.deptGroupHeader}>
                        <Text style={s.deptGroupHeaderTexte}>📅 Culte du jeudi</Text>
                    </View>
                    {deptsJeudi.map(d => {
                        const sel = Number(formulaire.departement) === Number(d.id);
                        return (
                        <Pressable
                            key={d.id}
                            style={[s.deptOption, sel && s.deptOptionActif]}
                            onPress={() => { setFormulaire({ ...formulaire, departement: Number(d.id) }); setDeptOuvert(false); }}
                        >
                            <Text style={[s.deptOptionTexte, sel && s.deptOptionTexteActif]}>{d.nom}</Text>
                            {sel && <Text style={s.deptCheck}>✓</Text>}
                        </Pressable>
                        );
                    })}
                    </>
                )}

                {/* Groupe Dimanche */}
                {deptsDimanche.length > 0 && (
                    <>
                    <View style={s.deptGroupHeader}>
                        <Text style={s.deptGroupHeaderTexte}>🙏 Culte du dimanche</Text>
                    </View>
                    {deptsDimanche.map((d, index) => {
                        const sel = Number(formulaire.departement) === Number(d.id);
                        return (
                        <Pressable
                            key={d.id}
                            style={[
                            s.deptOption, sel && s.deptOptionActif,
                            index === deptsDimanche.length - 1 && { borderBottomWidth: 0 },
                            ]}
                            onPress={() => { setFormulaire({ ...formulaire, departement: Number(d.id) }); setDeptOuvert(false); }}
                        >
                            <Text style={[s.deptOptionTexte, sel && s.deptOptionTexteActif]}>{d.nom}</Text>
                            {sel && <Text style={s.deptCheck}>✓</Text>}
                        </Pressable>
                        );
                    })}
                    </>
                )}
                </View>
            )}

            {/* Notes */}
            <Text style={s.champLabel}>Notes</Text>
            <TextInput
                style={[s.champInput, s.champInputMulti]}
                value={formulaire.notes}
                onChangeText={v => setFormulaire({ ...formulaire, notes: v })}
                multiline
                placeholder="Notes internes..."
                placeholderTextColor="#94A3B8"
            />

            {/* Bouton */}
            <Pressable
                style={[s.btnPrimaire, sauvegarde && { opacity: 0.6 }]}
                onPress={sauvegarder}
                disabled={sauvegarde}
            >
                {sauvegarde
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnPrimaireText}>
                    {modeEdition ? "Enregistrer les modifications" : "Ajouter le membre"}
                    </Text>
                }
            </Pressable>

            </ScrollView>
        </SafeAreaView>
        );
    }

    return null;
    }