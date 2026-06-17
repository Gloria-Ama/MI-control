    import { useEffect, useState } from "react";
    import {
    View, Text, TextInput, ScrollView, Pressable,
    Alert, ActivityIndicator, SafeAreaView,
    } from "react-native";
    import {
    getResponsables, createResponsable, updateResponsable,
    reinitialiserMotDePasse, toggleActif, deleteResponsable,
    } from "../services/responsables.service";
    import { api } from "../services/api";
    import { rs } from "../styles/responsables.styles";

    type Responsable = {
    id: number;
    username: string;
    email: string;
    role: string;
    communaute_culte: number | null;
    communaute_nom?: string;
    departement: number | null;
    departement_nom?: string | null;
    mot_de_passe_change: boolean;
    actif: boolean;
    };

    type Culte = { id: number; nom: string };
    type Departement = { id: number; nom: string; communaute_culte: number };

    const ROLES = [
    { valeur: "pasteur",           label: "Pasteur" },
    { valeur: "administrateur",    label: "Administrateur" },
    { valeur: "tresoriere",        label: "Trésorière" },
    { valeur: "secretaire",        label: "Secrétaire" },
    { valeur: "responsable_accueil", label: "Resp. Accueil" },
    { valeur: "responsable",       label: "Resp. Département" },
    ];

    export default function ResponsablesScreen() {
    const [responsables, setResponsables] = useState<Responsable[]>([]);
    const [cultes, setCultes] = useState<Culte[]>([]);
    const [departements, setDepartements] = useState<Departement[]>([]);
    const [chargement, setChargement] = useState(true);
    const [recherche, setRecherche] = useState("");
    const [vue, setVue] = useState<"liste" | "detail" | "formulaire" | "mdp">("liste");
    const [selectionne, setSelectionne] = useState<Responsable | null>(null);
    const [modeEdition, setModeEdition] = useState(false);
    const [sauvegarde, setSauvegarde] = useState(false);
    const [deptOuvert, setDeptOuvert] = useState(false);

    // Formulaire création/édition
    const [formUsername, setFormUsername] = useState("");
    const [formPassword, setFormPassword] = useState("");
    const [formEmail, setFormEmail] = useState("");
    const [formRole, setFormRole] = useState("responsable");
    const [formCulteId, setFormCulteId] = useState<number | undefined>();
    const [formDeptId, setFormDeptId] = useState<number | null>(null);
    const [formActif, setFormActif] = useState(true);
    const [erreurs, setErreurs] = useState<Record<string, string>>({});

    // Réinitialisation mot de passe
    const [nouveauMdp, setNouveauMdp] = useState("");
    const [confirmerMdp, setConfirmerMdp] = useState("");

    useEffect(() => { chargerDonnees(); }, []);

    async function chargerDonnees() {
        setChargement(true);
        try {
        const [r, c, d] = await Promise.all([
            getResponsables(),
            api.get("/communautes/").then(res => res.data).catch(() => []),
            api.get("/departements/").then(res => res.data).catch(() => []),
        ]);
        setResponsables(Array.isArray(r) ? r : []);
        setCultes(Array.isArray(c) ? c : []);
        setDepartements(Array.isArray(d) ? d : []);
        } finally {
        setChargement(false);
        }
    }

    function ouvrirFormulaire(responsable?: Responsable) {
        if (responsable) {
        setFormUsername(responsable.username);
        setFormPassword("");
        setFormEmail(responsable.email ?? "");
        setFormRole(responsable.role);
        setFormCulteId(responsable.communaute_culte ?? undefined);
        setFormDeptId(responsable.departement);
        setFormActif(responsable.actif);
        setModeEdition(true);
        setSelectionne(responsable);
        } else {
        setFormUsername("");
        setFormPassword("");
        setFormEmail("");
        setFormRole("responsable");
        setFormCulteId(cultes.length > 0 ? cultes[0].id : undefined);
        setFormDeptId(null);
        setFormActif(true);
        setModeEdition(false);
        setSelectionne(null);
        }
        setErreurs({});
        setDeptOuvert(false);
        setVue("formulaire");
    }

    function valider(): boolean {
        const e: Record<string, string> = {};
        if (!formUsername.trim()) e.username = "Le nom d'utilisateur est obligatoire.";
        if (!modeEdition && !formPassword.trim()) e.password = "Le mot de passe est obligatoire.";
        if (!modeEdition && formPassword.length < 6) e.password = "Minimum 6 caractères.";
        setErreurs(e);
        return Object.keys(e).length === 0;
    }

    async function sauvegarder() {
        if (!valider()) return;
        setSauvegarde(true);
        try {
        if (modeEdition && selectionne) {
            await updateResponsable(selectionne.id, {
            email: formEmail,
            role: formRole,
            communaute_culte: formCulteId,
            departement: formDeptId,
            actif: formActif,
            });
            Alert.alert("✅ Responsable modifié.");
        } else {
            await createResponsable({
            username: formUsername.trim(),
            password: formPassword,
            email: formEmail.trim(),
            role: formRole,
            communaute_culte: formCulteId,
            departement: formDeptId,
            actif: formActif,
            });
            Alert.alert("✅ Responsable créé !", `Identifiant : ${formUsername}\nMot de passe : ${formPassword}`);
        }
        await chargerDonnees();
        setVue("liste");
        } catch (error: any) {
        const data = error?.response?.data;
        if (data?.username) setErreurs(e => ({ ...e, username: data.username[0] }));
        else Alert.alert("Erreur", JSON.stringify(data ?? "Impossible de sauvegarder."));
        } finally {
        setSauvegarde(false);
        }
    }

    async function handleToggleActif(r: Responsable) {
        const action = r.actif ? "désactiver" : "activer";
        Alert.alert(
        `${r.actif ? "Désactiver" : "Activer"} ?`,
        `${action.charAt(0).toUpperCase() + action.slice(1)} le compte de ${r.username} ?`,
        [
            { text: "Annuler", style: "cancel" },
            {
            text: r.actif ? "Désactiver" : "Activer",
            onPress: async () => {
                await toggleActif(r.id);
                await chargerDonnees();
                if (selectionne?.id === r.id) {
                setSelectionne(prev => prev ? { ...prev, actif: !prev.actif } : null);
                }
            },
            },
        ]
        );
    }

    async function handleSuppression(r: Responsable) {
        Alert.alert(
        "Supprimer ?",
        `Supprimer définitivement le compte de ${r.username} ?`,
        [
            { text: "Annuler", style: "cancel" },
            {
            text: "Supprimer", style: "destructive",
            onPress: async () => {
                await deleteResponsable(r.id);
                await chargerDonnees();
                setVue("liste");
            },
            },
        ]
        );
    }

    async function handleReinitialisationMdp() {
        if (!nouveauMdp.trim()) {
        Alert.alert("Erreur", "Le mot de passe est obligatoire.");
        return;
        }
        if (nouveauMdp.length < 6) {
        Alert.alert("Erreur", "Minimum 6 caractères.");
        return;
        }
        if (nouveauMdp !== confirmerMdp) {
        Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
        return;
        }
        setSauvegarde(true);
        try {
        await reinitialiserMotDePasse(selectionne!.id, nouveauMdp);
        Alert.alert("✅ Mot de passe réinitialisé !");
        setNouveauMdp("");
        setConfirmerMdp("");
        setVue("detail");
        } catch {
        Alert.alert("Erreur", "Impossible de réinitialiser le mot de passe.");
        } finally {
        setSauvegarde(false);
        }
    }

    function initiales(nom: string) {
        return nom.split(/[\s._]/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }

    function couleur(nom: string) {
        const c = ["#07074C", "#4F46E5", "#0F6E56", "#854F0B", "#7C3AED"];
        return c[nom.charCodeAt(0) % c.length];
    }

    function nomRole(role: string) {
        return ROLES.find(r => r.valeur === role)?.label ?? role;
    }

    function nomCulte(id: number | null) {
        return cultes.find(c => c.id === id)?.nom ?? "—";
    }

    function nomDept(id: number | null) {
        if (!id) return "Aucun";
        return departements.find(d => d.id === id)?.nom ?? "—";
    }

    const deptsFiltrés = formCulteId
        ? departements.filter(d => d.communaute_culte === formCulteId)
        : departements;

    const responsablesFiltres = responsables.filter(r =>
        r.username.toLowerCase().includes(recherche.toLowerCase()) ||
        r.email?.toLowerCase().includes(recherche.toLowerCase())
    );

    // ── LISTE ──────────────────────────────────────────────────────────────────
    if (vue === "liste") {
        return (
        <SafeAreaView style={rs.safe}>
            <View style={rs.searchBar}>
            <TextInput
                style={rs.searchInput}
                placeholder="🔍  Rechercher un responsable..."
                placeholderTextColor="#94A3B8"
                value={recherche}
                onChangeText={setRecherche}
            />
            </View>

            {chargement ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />
            ) : (
            <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 100 }}>
                <Text style={rs.compteLabel}>
                {responsablesFiltres.length} responsable{responsablesFiltres.length > 1 ? "s" : ""}
                </Text>

                {responsablesFiltres.length === 0 && (
                <Text style={rs.videTexte}>Aucun responsable trouvé.</Text>
                )}

                {responsablesFiltres.map(r => (
                <Pressable
                    key={r.id}
                    style={rs.card}
                    onPress={() => { setSelectionne(r); setVue("detail"); }}
                >
                    <View style={[rs.avatar, { backgroundColor: couleur(r.username) }]}>
                    <Text style={rs.avatarTexte}>{initiales(r.username)}</Text>
                    </View>
                    <View style={rs.cardInfo}>
                    <Text style={rs.cardNom}>{r.username}</Text>
                    <Text style={rs.cardRole}>{nomRole(r.role)}</Text>
                    {r.communaute_culte && (
                        <Text style={rs.cardCulte}>{nomCulte(r.communaute_culte)}</Text>
                    )}
                    </View>
                    <View style={r.actif ? rs.badgeActif : rs.badgeInactif}>
                    <Text style={r.actif ? rs.badgeActifTexte : rs.badgeInactifTexte}>
                        {r.actif ? "Actif" : "Inactif"}
                    </Text>
                    </View>
                </Pressable>
                ))}
            </ScrollView>
            )}

            <Pressable style={rs.fab} onPress={() => ouvrirFormulaire()}>
            <Text style={rs.fabTexte}>+ Ajouter</Text>
            </Pressable>
        </SafeAreaView>
        );
    }

    // ── DÉTAIL ─────────────────────────────────────────────────────────────────
    if (vue === "detail" && selectionne) {
        const r = selectionne;
        return (
        <SafeAreaView style={rs.safe}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={rs.detailHeader}>
                <Pressable onPress={() => setVue("liste")} style={rs.retourBtn}>
                <Text style={rs.retourText}>‹ Retour</Text>
                </Pressable>
                <View style={[rs.detailAvatar, { backgroundColor: couleur(r.username) }]}>
                <Text style={rs.detailAvatarTexte}>{initiales(r.username)}</Text>
                </View>
                <Text style={rs.detailNom}>{r.username}</Text>
                <Text style={rs.detailRole}>{nomRole(r.role)}</Text>
            </View>

            <View style={{ padding: 16 }}>
                {!r.mot_de_passe_change && (
                <View style={rs.alerteMdp}>
                    <Text style={rs.alerteMdpTexte}>
                    ⚠️ Ce responsable n'a pas encore changé son mot de passe.
                    </Text>
                </View>
                )}

                <View style={rs.section}>
                <Text style={rs.sectionTitre}>Informations</Text>
                {[
                    { i: "👤", l: "Identifiant", v: r.username },
                    { i: "✉️", l: "Email", v: r.email || "—" },
                    { i: "🎭", l: "Rôle", v: nomRole(r.role) },
                    { i: "⛪", l: "Culte", v: nomCulte(r.communaute_culte) },
                    { i: "🏛️", l: "Département", v: nomDept(r.departement) },
                ].map(row => (
                    <View key={row.l} style={rs.infoRow}>
                    <Text style={rs.infoIcone}>{row.i}</Text>
                    <Text style={rs.infoLabel}>{row.l}</Text>
                    <Text style={rs.infoValeur}>{row.v}</Text>
                    </View>
                ))}
                <View style={rs.infoRow}>
                    <Text style={rs.infoIcone}>🔘</Text>
                    <Text style={rs.infoLabel}>Statut</Text>
                    <View style={r.actif ? rs.badgeActif : rs.badgeInactif}>
                    <Text style={r.actif ? rs.badgeActifTexte : rs.badgeInactifTexte}>
                        {r.actif ? "Actif" : "Inactif"}
                    </Text>
                    </View>
                </View>
                </View>

                {/* Actions */}
                <View style={rs.actionsRow}>
                <Pressable
                    style={[rs.btnAction, { backgroundColor: "#07074C" }]}
                    onPress={() => ouvrirFormulaire(r)}
                >
                    <Text style={rs.btnActionTexte}>✏️ Modifier</Text>
                </Pressable>
                <Pressable
                    style={[rs.btnAction, {
                    backgroundColor: r.actif ? "#FFFBEB" : "#F0FDF4",
                    borderWidth: 0.5,
                    borderColor: r.actif ? "#FCD34D" : "#86EFAC",
                    }]}
                    onPress={() => handleToggleActif(r)}
                >
                    <Text style={[rs.btnActionTexte, { color: r.actif ? "#633806" : "#065F46" }]}>
                    {r.actif ? "⏸ Désactiver" : "▶️ Activer"}
                    </Text>
                </Pressable>
                </View>

                <View style={rs.actionsRow}>
                <Pressable
                    style={[rs.btnAction, { backgroundColor: "#EFF6FF", borderWidth: 0.5, borderColor: "#BFDBFE" }]}
                    onPress={() => { setNouveauMdp(""); setConfirmerMdp(""); setVue("mdp"); }}
                >
                    <Text style={[rs.btnActionTexte, { color: "#1D4ED8" }]}>🔑 Réinitialiser MDP</Text>
                </Pressable>
                <Pressable
                    style={[rs.btnAction, { backgroundColor: "#FEF2F2", borderWidth: 0.5, borderColor: "#FECACA" }]}
                    onPress={() => handleSuppression(r)}
                >
                    <Text style={[rs.btnActionTexte, { color: "#EF4444" }]}>🗑 Supprimer</Text>
                </Pressable>
                </View>
            </View>
            </ScrollView>
        </SafeAreaView>
        );
    }

    // ── MOT DE PASSE ───────────────────────────────────────────────────────────
    if (vue === "mdp" && selectionne) {
        return (
        <SafeAreaView style={rs.safe}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <Pressable onPress={() => setVue("detail")} style={rs.retourBtn}>
                <Text style={[rs.retourText, { color: "#64748B" }]}>‹ Retour</Text>
            </Pressable>

            <Text style={rs.formTitre}>Réinitialiser le mot de passe</Text>
            <Text style={{ fontSize: 14, color: "#64748B", marginBottom: 20 }}>
                Compte : {selectionne.username}
            </Text>

            <Text style={rs.champLabel}>Nouveau mot de passe *</Text>
            <TextInput
                style={rs.champInput}
                value={nouveauMdp}
                onChangeText={setNouveauMdp}
                secureTextEntry
                placeholder="Minimum 6 caractères"
                placeholderTextColor="#94A3B8"
            />

            <Text style={rs.champLabel}>Confirmer le mot de passe *</Text>
            <TextInput
                style={[
                rs.champInput,
                confirmerMdp.length > 0 && nouveauMdp !== confirmerMdp && rs.champInputErreur,
                ]}
                value={confirmerMdp}
                onChangeText={setConfirmerMdp}
                secureTextEntry
                placeholder="Répétez le mot de passe"
                placeholderTextColor="#94A3B8"
            />
            {confirmerMdp.length > 0 && nouveauMdp !== confirmerMdp && (
                <Text style={rs.champErreur}>⚠ Les mots de passe ne correspondent pas.</Text>
            )}

            <Pressable
                style={[rs.btnPrimaire, sauvegarde && { opacity: 0.6 }]}
                onPress={handleReinitialisationMdp}
                disabled={sauvegarde}
            >
                {sauvegarde
                ? <ActivityIndicator color="#fff" />
                : <Text style={rs.btnPrimaireTexte}>Réinitialiser</Text>
                }
            </Pressable>
            </ScrollView>
        </SafeAreaView>
        );
    }

    // ── FORMULAIRE ─────────────────────────────────────────────────────────────
    if (vue === "formulaire") {
        return (
        <SafeAreaView style={rs.safe}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
            <Pressable
                onPress={() => setVue(modeEdition ? "detail" : "liste")}
                style={rs.retourBtn}
            >
                <Text style={[rs.retourText, { color: "#64748B" }]}>‹ Retour</Text>
            </Pressable>

            <Text style={rs.formTitre}>
                {modeEdition ? "Modifier le responsable" : "Nouveau responsable"}
            </Text>

            {/* Identifiant */}
            {!modeEdition && (
                <>
                <Text style={rs.champLabel}>Identifiant (login) *</Text>
                <TextInput
                    style={[rs.champInput, erreurs.username ? rs.champInputErreur : null]}
                    value={formUsername}
                    onChangeText={v => { setFormUsername(v); setErreurs(e => ({ ...e, username: "" })); }}
                    autoCapitalize="none"
                    placeholder="Ex: jean.dupont"
                    placeholderTextColor="#94A3B8"
                />
                {erreurs.username ? <Text style={rs.champErreur}>⚠ {erreurs.username}</Text> : null}
                </>
            )}

            {/* Mot de passe */}
            {!modeEdition && (
                <>
                <Text style={rs.champLabel}>Mot de passe temporaire *</Text>
                <TextInput
                    style={[rs.champInput, erreurs.password ? rs.champInputErreur : null]}
                    value={formPassword}
                    onChangeText={v => { setFormPassword(v); setErreurs(e => ({ ...e, password: "" })); }}
                    secureTextEntry
                    placeholder="Minimum 6 caractères"
                    placeholderTextColor="#94A3B8"
                />
                {erreurs.password ? <Text style={rs.champErreur}>⚠ {erreurs.password}</Text> : null}
                <View style={rs.alerteMdp}>
                    <Text style={rs.alerteMdpTexte}>
                    💡 Notez ce mot de passe — il sera communiqué au responsable qui pourra le changer.
                    </Text>
                </View>
                </>
            )}

            {/* Email */}
            <Text style={rs.champLabel}>Email</Text>
            <TextInput
                style={rs.champInput}
                value={formEmail}
                onChangeText={setFormEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="email@exemple.com"
                placeholderTextColor="#94A3B8"
            />

            {/* Rôle */}
            <Text style={rs.champLabel}>Rôle *</Text>
            <View style={rs.choixRow}>
                {ROLES.map(role => (
                <Pressable
                    key={role.valeur}
                    style={[rs.choixBtn, formRole === role.valeur && rs.choixBtnActif]}
                    onPress={() => setFormRole(role.valeur)}
                >
                    <Text style={[rs.choixBtnTexte, formRole === role.valeur && rs.choixBtnTexteActif]}>
                    {role.label}
                    </Text>
                </Pressable>
                ))}
            </View>

            {/* Culte */}
            <Text style={rs.champLabel}>Culte *</Text>
            <View style={rs.choixRow}>
                {cultes.map(c => (
                <Pressable
                    key={c.id}
                    style={[rs.choixBtn, formCulteId === c.id && rs.choixBtnActif]}
                    onPress={() => { setFormCulteId(c.id); setFormDeptId(null); }}
                >
                    <Text style={[rs.choixBtnTexte, formCulteId === c.id && rs.choixBtnTexteActif]}>
                    {c.nom.replace("Culte du ", "")}
                    </Text>
                </Pressable>
                ))}
            </View>

            {/* Département */}
            <Text style={rs.champLabel}>Département (optionnel)</Text>
            <Pressable style={rs.deptSelector} onPress={() => setDeptOuvert(!deptOuvert)}>
                <Text style={rs.deptSelectorTexte}>{nomDept(formDeptId)}</Text>
                <Text style={rs.deptSelectorChevron}>{deptOuvert ? "▲" : "▼"}</Text>
            </Pressable>
            {deptOuvert && (
                <View style={rs.deptListe}>
                <Pressable
                    style={rs.deptOption}
                    onPress={() => { setFormDeptId(null); setDeptOuvert(false); }}
                >
                    <Text style={[rs.deptOptionTexte, !formDeptId && rs.deptOptionTexteActif]}>
                    Aucun département
                    </Text>
                    {!formDeptId && <Text style={rs.deptCheck}>✓</Text>}
                </Pressable>
                {deptsFiltrés.map((dep, i) => {
                    const sel = formDeptId === dep.id;
                    return (
                    <Pressable
                        key={dep.id}
                        style={[
                        rs.deptOption, sel && rs.deptOptionActif,
                        i === deptsFiltrés.length - 1 && { borderBottomWidth: 0 },
                        ]}
                        onPress={() => { setFormDeptId(dep.id); setDeptOuvert(false); }}
                    >
                        <Text style={[rs.deptOptionTexte, sel && rs.deptOptionTexteActif]}>{dep.nom}</Text>
                        {sel && <Text style={rs.deptCheck}>✓</Text>}
                    </Pressable>
                    );
                })}
                </View>
            )}

            {/* Statut actif */}
            <Text style={rs.champLabel}>Statut</Text>
            <View style={[rs.choixRow, { marginBottom: 24 }]}>
                <Pressable
                style={[rs.choixBtn, formActif && rs.choixBtnActif]}
                onPress={() => setFormActif(true)}
                >
                <Text style={[rs.choixBtnTexte, formActif && rs.choixBtnTexteActif]}>✅ Actif</Text>
                </Pressable>
                <Pressable
                style={[rs.choixBtn, !formActif && rs.choixBtnActif]}
                onPress={() => setFormActif(false)}
                >
                <Text style={[rs.choixBtnTexte, !formActif && rs.choixBtnTexteActif]}>⏸ Inactif</Text>
                </Pressable>
            </View>

            <Pressable
                style={[rs.btnPrimaire, sauvegarde && { opacity: 0.6 }]}
                onPress={sauvegarder}
                disabled={sauvegarde}
            >
                {sauvegarde
                ? <ActivityIndicator color="#fff" />
                : <Text style={rs.btnPrimaireTexte}>
                    {modeEdition ? "Enregistrer les modifications" : "Créer le compte"}
                    </Text>
                }
            </Pressable>
            </ScrollView>
        </SafeAreaView>
        );
    }

    return null;
    }