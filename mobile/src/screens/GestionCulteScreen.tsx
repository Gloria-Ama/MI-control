    import { useEffect, useState } from "react";
    import {
    View, Text, TextInput, ScrollView, Pressable,
    Alert, ActivityIndicator, SafeAreaView, Modal,
    } from "react-native";
    import { api } from "../services/api";

    type Element = {
    id: number;
    type: string;
    type_label: string;
    titre: string;
    responsable: string;
    duree_minutes: number;
    ordre: number;
    notes: string;
    complete: boolean;
    };

    type Programme = {
    id: number;
    communaute_culte: number;
    date: string;
    theme: string;
    predicateur: string;
    verset_cle: string;
    notes_generales: string;
    elements: Element[];
    duree_totale: number;
    cree_par_nom: string;
    };

    const TYPES_ELEMENTS = [
    { valeur: "accueil",     label: "Accueil",          emoji: "🙏" },
    { valeur: "adoration",   label: "Adoration",         emoji: "🎵" },
    { valeur: "priere",      label: "Prière",            emoji: "✝️" },
    { valeur: "chant",       label: "Chant",             emoji: "🎶" },
    { valeur: "lecture",     label: "Lecture biblique",  emoji: "📖" },
    { valeur: "predication", label: "Prédication",       emoji: "🎤" },
    { valeur: "offrande",    label: "Offrande",          emoji: "💝" },
    { valeur: "annonce",     label: "Annonces",          emoji: "📢" },
    { valeur: "communion",   label: "Sainte Cène",       emoji: "🍷" },
    { valeur: "temoignage",  label: "Témoignage",        emoji: "✨" },
    { valeur: "autre",       label: "Autre",             emoji: "•" },
    ];

    function emojiType(type: string) {
    return TYPES_ELEMENTS.find(t => t.valeur === type)?.emoji ?? "•";
    }

    export default function GestionCulteScreen() {
    const [programmes, setProgrammes] = useState<Programme[]>([]);
    const [chargement, setChargement] = useState(true);
    const [communautes, setCommunautes] = useState<{ id: number; nom: string }[]>([]);
    const [communauteActive, setCommunauteActive] = useState<number | undefined>();
    const [vue, setVue] = useState<"liste" | "detail" | "formulaire_programme" | "formulaire_element">("liste");
    const [programmeActif, setProgrammeActif] = useState<Programme | null>(null);
    const [modeEnDirect, setModeEnDirect] = useState(false);

    // Formulaire programme
    const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
    const [formTheme, setFormTheme] = useState("");
    const [formPredicateur, setFormPredicateur] = useState("");
    const [formVerset, setFormVerset] = useState("");
    const [formNotes, setFormNotes] = useState("");
    const [modeEdition, setModeEdition] = useState(false);
    const [sauvegarde, setSauvegarde] = useState(false);

    // Formulaire élément
    const [elemType, setElemType] = useState("adoration");
    const [elemTitre, setElemTitre] = useState("");
    const [elemResponsable, setElemResponsable] = useState("");
    const [elemDuree, setElemDuree] = useState("10");
    const [elemNotes, setElemNotes] = useState("");
    const [elemEdite, setElemEdite] = useState<Element | null>(null);

    useEffect(() => { chargerDonnees(); }, []);
    useEffect(() => { if (communauteActive) chargerProgrammes(); }, [communauteActive]);

    async function chargerDonnees() {
        try {
        const c = await api.get("/communautes/").then(r => r.data).catch(() => []);
        setCommunautes(c);
        if (c.length > 0) setCommunauteActive(c[0].id);
        } catch { setChargement(false); }
    }

    async function chargerProgrammes() {
        setChargement(true);
        try {
        const res = await api.get(`/programmes-culte/?communaute_culte=${communauteActive}`);
        setProgrammes(Array.isArray(res.data) ? res.data : []);
        } catch { }
        finally { setChargement(false); }
    }

    async function sauvegarderProgramme() {
        if (!formDate) { Alert.alert("Date requise"); return; }
        setSauvegarde(true);
        try {
        const data = { communaute_culte: communauteActive, date: formDate, theme: formTheme.trim(), predicateur: formPredicateur.trim(), verset_cle: formVerset.trim(), notes_generales: formNotes.trim() };
        if (modeEdition && programmeActif) {
            await api.patch(`/programmes-culte/${programmeActif.id}/`, data);
        } else {
            await api.post("/programmes-culte/", data);
        }
        await chargerProgrammes();
        setVue("liste");
        resetFormProgramme();
        } catch { Alert.alert("Erreur", "Impossible de sauvegarder."); }
        finally { setSauvegarde(false); }
    }

    async function supprimerProgramme(prog: Programme) {
        Alert.alert("Supprimer ?", `Supprimer le programme du ${formatDate(prog.date)} ?`, [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: async () => {
            await api.delete(`/programmes-culte/${prog.id}/`);
            await chargerProgrammes();
            setVue("liste");
        }},
        ]);
    }

    async function dupliquerProgramme(prog: Programme) {
        try {
        await api.post(`/programmes-culte/${prog.id}/dupliquer/`);
        await chargerProgrammes();
        Alert.alert("✅ Programme dupliqué pour aujourd'hui !");
        } catch { Alert.alert("Erreur", "Impossible de dupliquer."); }
    }

    async function sauvegarderElement() {
        if (!programmeActif) return;
        setSauvegarde(true);
        try {
        const data = { programme: programmeActif.id, type: elemType, titre: elemTitre.trim(), responsable: elemResponsable.trim(), duree_minutes: parseInt(elemDuree) || 10, notes: elemNotes.trim(), ordre: elemEdite ? elemEdite.ordre : (programmeActif.elements.length * 10) };
        if (elemEdite) {
            await api.patch(`/elements-programme/${elemEdite.id}/`, data);
        } else {
            await api.post("/elements-programme/", data);
        }
        const res = await api.get(`/programmes-culte/${programmeActif.id}/`);
        setProgrammeActif(res.data);
        setVue("detail");
        resetFormElement();
        } catch { Alert.alert("Erreur", "Impossible de sauvegarder l'élément."); }
        finally { setSauvegarde(false); }
    }

    async function supprimerElement(elem: Element) {
        Alert.alert("Supprimer ?", `Supprimer "${elem.titre || elem.type_label}" ?`, [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: async () => {
            await api.delete(`/elements-programme/${elem.id}/`);
            const res = await api.get(`/programmes-culte/${programmeActif!.id}/`);
            setProgrammeActif(res.data);
        }},
        ]);
    }

    async function cocherElement(elem: Element) {
        await api.post(`/elements-programme/${elem.id}/cocher/`);
        const res = await api.get(`/programmes-culte/${programmeActif!.id}/`);
        setProgrammeActif(res.data);
    }

    function ouvrirProgramme(prog: Programme) {
        setProgrammeActif(prog);
        setModeEnDirect(false);
        setVue("detail");
    }

    function ouvrirFormProgramme(prog?: Programme) {
        if (prog) {
        setFormDate(prog.date); setFormTheme(prog.theme);
        setFormPredicateur(prog.predicateur); setFormVerset(prog.verset_cle);
        setFormNotes(prog.notes_generales); setModeEdition(true);
        } else {
        resetFormProgramme(); setModeEdition(false);
        }
        setVue("formulaire_programme");
    }

    function ouvrirFormElement(elem?: Element) {
        if (elem) {
        setElemType(elem.type); setElemTitre(elem.titre);
        setElemResponsable(elem.responsable); setElemDuree(String(elem.duree_minutes));
        setElemNotes(elem.notes); setElemEdite(elem);
        } else {
        resetFormElement();
        }
        setVue("formulaire_element");
    }

    function resetFormProgramme() {
        setFormDate(new Date().toISOString().split("T")[0]);
        setFormTheme(""); setFormPredicateur(""); setFormVerset(""); setFormNotes("");
    }

    function resetFormElement() {
        setElemType("adoration"); setElemTitre(""); setElemResponsable("");
        setElemDuree("10"); setElemNotes(""); setElemEdite(null);
    }

    function formatDate(dateStr: string) {
        try { return new Date(dateStr).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
        catch { return dateStr; }
    }

    function dureeFormatee(minutes: number) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0) return `${h}h${m > 0 ? String(m).padStart(2, "0") : ""}`;
        return `${m} min`;
    }

    // ── FORMULAIRE PROGRAMME ──────────────────────────────────────────────────
    if (vue === "formulaire_programme") {
        return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F5F0" }}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <Pressable onPress={() => setVue(modeEdition ? "detail" : "liste")} style={{ marginBottom: 16 }}>
                <Text style={{ color: "#64748B", fontSize: 15 }}>‹ Retour</Text>
            </Pressable>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#07074C", marginBottom: 20 }}>
                {modeEdition ? "Modifier le programme" : "Nouveau programme de culte"}
            </Text>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 6 }}>Date du culte *</Text>
            <TextInput style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 15, color: "#1E293B", borderWidth: 0.5, borderColor: "#E2E8F0", marginBottom: 16 }}
                value={formDate} onChangeText={setFormDate} placeholder="AAAA-MM-JJ" placeholderTextColor="#94A3B8" />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 6 }}>Thème du culte</Text>
            <TextInput style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 15, color: "#1E293B", borderWidth: 0.5, borderColor: "#E2E8F0", marginBottom: 16 }}
                value={formTheme} onChangeText={setFormTheme} placeholder="Ex: La grâce de Dieu" placeholderTextColor="#94A3B8" />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 6 }}>Prédicateur</Text>
            <TextInput style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 15, color: "#1E293B", borderWidth: 0.5, borderColor: "#E2E8F0", marginBottom: 16 }}
                value={formPredicateur} onChangeText={setFormPredicateur} placeholder="Nom du prédicateur" placeholderTextColor="#94A3B8" />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 6 }}>Verset clé</Text>
            <TextInput style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 15, color: "#1E293B", borderWidth: 0.5, borderColor: "#E2E8F0", marginBottom: 16 }}
                value={formVerset} onChangeText={setFormVerset} placeholder="Ex: Jean 3:16" placeholderTextColor="#94A3B8" />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 6 }}>Notes générales</Text>
            <TextInput style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 15, color: "#1E293B", borderWidth: 0.5, borderColor: "#E2E8F0", marginBottom: 24, minHeight: 80, textAlignVertical: "top" }}
                value={formNotes} onChangeText={setFormNotes} multiline placeholder="Notes pour l'équipe..." placeholderTextColor="#94A3B8" />

            <Pressable style={[{ backgroundColor: "#07074C", borderRadius: 12, padding: 16, alignItems: "center" }, sauvegarde && { opacity: 0.6 }]} onPress={sauvegarderProgramme} disabled={sauvegarde}>
                {sauvegarde ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{modeEdition ? "Enregistrer" : "Créer le programme"}</Text>}
            </Pressable>
            </ScrollView>
        </SafeAreaView>
        );
    }

    // ── FORMULAIRE ÉLÉMENT ────────────────────────────────────────────────────
    if (vue === "formulaire_element") {
        return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F5F0" }}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <Pressable onPress={() => { setVue("detail"); resetFormElement(); }} style={{ marginBottom: 16 }}>
                <Text style={{ color: "#64748B", fontSize: 15 }}>‹ Retour</Text>
            </Pressable>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#07074C", marginBottom: 20 }}>
                {elemEdite ? "Modifier l'élément" : "Ajouter un élément"}
            </Text>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 8 }}>Type *</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {TYPES_ELEMENTS.map(t => (
                <Pressable key={t.valeur}
                    style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: elemType === t.valeur ? "#07074C" : "#E2E8F0", backgroundColor: elemType === t.valeur ? "#07074C" : "#fff" }}
                    onPress={() => setElemType(t.valeur)}>
                    <Text style={{ fontSize: 13, color: elemType === t.valeur ? "#fff" : "#1E293B", fontWeight: elemType === t.valeur ? "700" : "400" }}>
                    {t.emoji} {t.label}
                    </Text>
                </Pressable>
                ))}
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 6 }}>Titre / Détail</Text>
            <TextInput style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 15, color: "#1E293B", borderWidth: 0.5, borderColor: "#E2E8F0", marginBottom: 16 }}
                value={elemTitre} onChangeText={setElemTitre} placeholder="Ex: A la Croix, Cantique 45..." placeholderTextColor="#94A3B8" />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 6 }}>Responsable</Text>
            <TextInput style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 15, color: "#1E293B", borderWidth: 0.5, borderColor: "#E2E8F0", marginBottom: 16 }}
                value={elemResponsable} onChangeText={setElemResponsable} placeholder="Nom du responsable" placeholderTextColor="#94A3B8" />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 6 }}>Durée (minutes)</Text>
            <TextInput style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 15, color: "#1E293B", borderWidth: 0.5, borderColor: "#E2E8F0", marginBottom: 16 }}
                value={elemDuree} onChangeText={setElemDuree} keyboardType="number-pad" placeholder="10" placeholderTextColor="#94A3B8" />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 6 }}>Notes</Text>
            <TextInput style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 15, color: "#1E293B", borderWidth: 0.5, borderColor: "#E2E8F0", marginBottom: 24, minHeight: 70, textAlignVertical: "top" }}
                value={elemNotes} onChangeText={setElemNotes} multiline placeholder="Instructions particulières..." placeholderTextColor="#94A3B8" />

            <Pressable style={[{ backgroundColor: "#4F46E5", borderRadius: 12, padding: 16, alignItems: "center" }, sauvegarde && { opacity: 0.6 }]} onPress={sauvegarderElement} disabled={sauvegarde}>
                {sauvegarde ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Enregistrer</Text>}
            </Pressable>
            </ScrollView>
        </SafeAreaView>
        );
    }

    // ── DÉTAIL PROGRAMME ──────────────────────────────────────────────────────
    if (vue === "detail" && programmeActif) {
        const prog = programmeActif;
        const completes = prog.elements.filter(e => e.complete).length;
        const total = prog.elements.length;
        const progression = total > 0 ? Math.round((completes / total) * 100) : 0;

        return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F5F0" }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header */}
            <View style={{ backgroundColor: "#07074C", padding: 20, paddingTop: 16 }}>
                <Pressable onPress={() => setVue("liste")} style={{ marginBottom: 12 }}>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>‹ Retour</Text>
                </Pressable>
                <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 4 }}>
                {prog.theme || "Programme du culte"}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{formatDate(prog.date)}</Text>
                {prog.predicateur ? <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 }}>🎤 {prog.predicateur}</Text> : null}
                {prog.verset_cle ? <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 }}>📖 {prog.verset_cle}</Text> : null}
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 8 }}>⏱ Durée totale : {dureeFormatee(prog.duree_totale)}</Text>
            </View>

            {/* Mode EN DIRECT */}
            <Pressable
                onPress={() => setModeEnDirect(!modeEnDirect)}
                style={{ margin: 14, padding: 14, borderRadius: 12, backgroundColor: modeEnDirect ? "#EF4444" : "#F0FDF4", borderWidth: 1, borderColor: modeEnDirect ? "#FECACA" : "#86EFAC", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
            >
                <View>
                <Text style={{ fontWeight: "700", color: modeEnDirect ? "#fff" : "#065F46", fontSize: 15 }}>
                    {modeEnDirect ? "🔴 Mode EN DIRECT activé" : "▶️ Démarrer le culte"}
                </Text>
                <Text style={{ fontSize: 12, color: modeEnDirect ? "rgba(255,255,255,0.8)" : "#065F46", marginTop: 2 }}>
                    {modeEnDirect ? "Cochez chaque élément au fur et à mesure" : "Suivez le déroulement en temps réel"}
                </Text>
                </View>
                {modeEnDirect && (
                <Text style={{ color: "#fff", fontWeight: "700" }}>{completes}/{total}</Text>
                )}
            </Pressable>

            {/* Barre de progression (mode EN DIRECT) */}
            {modeEnDirect && total > 0 && (
                <View style={{ marginHorizontal: 14, marginBottom: 10 }}>
                <View style={{ height: 6, backgroundColor: "#E2E8F0", borderRadius: 3 }}>
                    <View style={{ height: 6, backgroundColor: "#065F46", borderRadius: 3, width: `${progression}%` as any }} />
                </View>
                <Text style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{progression}% complété</Text>
                </View>
            )}

            {/* Éléments du programme */}
            <View style={{ paddingHorizontal: 14 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E293B" }}>Ordre du culte</Text>
                <Pressable onPress={() => ouvrirFormElement()} style={{ backgroundColor: "#EEF2FF", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                    <Text style={{ fontSize: 13, color: "#4F46E5", fontWeight: "600" }}>+ Ajouter</Text>
                </Pressable>
                </View>

                {prog.elements.length === 0 && (
                <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 20, alignItems: "center", borderWidth: 0.5, borderColor: "#E2E8F0" }}>
                    <Text style={{ fontSize: 30, marginBottom: 8 }}>📋</Text>
                    <Text style={{ fontSize: 14, color: "#64748B", textAlign: "center" }}>Aucun élément. Ajoutez les étapes du culte.</Text>
                </View>
                )}

                {prog.elements.map((elem, index) => (
                <Pressable
                    key={elem.id}
                    onPress={() => modeEnDirect ? cocherElement(elem) : null}
                    onLongPress={() => !modeEnDirect && Alert.alert(elem.titre || elem.type_label, "Que faire ?", [
                    { text: "✏️ Modifier", onPress: () => ouvrirFormElement(elem) },
                    { text: "🗑 Supprimer", style: "destructive", onPress: () => supprimerElement(elem) },
                    { text: "Annuler", style: "cancel" },
                    ])}
                    style={{
                    backgroundColor: elem.complete ? "#F0FDF4" : "#fff",
                    borderRadius: 12, padding: 14, marginBottom: 8,
                    borderWidth: 1, borderColor: elem.complete ? "#86EFAC" : "#E2E8F0",
                    flexDirection: "row", alignItems: "center", gap: 12,
                    }}
                >
                    {/* Numéro / check */}
                    <View style={{
                    width: 34, height: 34, borderRadius: 17,
                    backgroundColor: elem.complete ? "#065F46" : "#EEF2FF",
                    alignItems: "center", justifyContent: "center",
                    }}>
                    {elem.complete
                        ? <Text style={{ color: "#fff", fontSize: 16 }}>✓</Text>
                        : <Text style={{ fontSize: 18 }}>{emojiType(elem.type)}</Text>
                    }
                    </View>

                    <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: elem.complete ? "#065F46" : "#1E293B", textDecorationLine: elem.complete ? "line-through" : "none" }}>
                        {elem.titre || elem.type_label}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 10, marginTop: 2 }}>
                        {elem.responsable ? <Text style={{ fontSize: 12, color: "#64748B" }}>👤 {elem.responsable}</Text> : null}
                        <Text style={{ fontSize: 12, color: "#94A3B8" }}>⏱ {dureeFormatee(elem.duree_minutes)}</Text>
                    </View>
                    {elem.notes ? <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2, fontStyle: "italic" }}>{elem.notes}</Text> : null}
                    </View>

                    {!modeEnDirect && <Text style={{ color: "#CBD5E0", fontSize: 18 }}>⋯</Text>}
                    {modeEnDirect && !elem.complete && <Text style={{ color: "#94A3B8", fontSize: 12 }}>Toucher pour cocher</Text>}
                </Pressable>
                ))}
            </View>

            {/* Notes générales */}
            {prog.notes_generales ? (
                <View style={{ margin: 14, backgroundColor: "#FFFBEB", borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: "#FCD34D" }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#633806", marginBottom: 6 }}>📝 Notes générales</Text>
                <Text style={{ fontSize: 13, color: "#633806", lineHeight: 20 }}>{prog.notes_generales}</Text>
                </View>
            ) : null}

            {/* Actions */}
            {!modeEnDirect && (
                <View style={{ flexDirection: "row", gap: 10, marginHorizontal: 14, marginTop: 8 }}>
                <Pressable style={{ flex: 1, backgroundColor: "#EEF2FF", borderRadius: 10, padding: 12, alignItems: "center" }} onPress={() => ouvrirFormProgramme(prog)}>
                    <Text style={{ color: "#4F46E5", fontWeight: "600", fontSize: 13 }}>✏️ Modifier</Text>
                </Pressable>
                <Pressable style={{ flex: 1, backgroundColor: "#F0FDF4", borderRadius: 10, padding: 12, alignItems: "center" }} onPress={() => dupliquerProgramme(prog)}>
                    <Text style={{ color: "#065F46", fontWeight: "600", fontSize: 13 }}>📋 Dupliquer</Text>
                </Pressable>
                <Pressable style={{ backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12, alignItems: "center", paddingHorizontal: 14 }} onPress={() => supprimerProgramme(prog)}>
                    <Text style={{ color: "#EF4444", fontWeight: "600", fontSize: 13 }}>🗑</Text>
                </Pressable>
                </View>
            )}
            </ScrollView>
        </SafeAreaView>
        );
    }

    // ── LISTE DES PROGRAMMES ──────────────────────────────────────────────────
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F5F0" }}>
        {/* Sélecteur culte */}
        {communautes.length > 1 && (
            <View style={{ flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0", flexGrow: 0 }}>
            {communautes.map(c => (
                <Pressable key={c.id}
                style={{ flex: 1, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: communauteActive === c.id ? "#07074C" : "transparent", alignItems: "center" }}
                onPress={() => setCommunauteActive(c.id)}>
                <Text style={{ fontWeight: communauteActive === c.id ? "700" : "400", color: communauteActive === c.id ? "#07074C" : "#64748B", fontSize: 14 }}>
                    {c.nom.replace("Culte du ", "")}
                </Text>
                </Pressable>
            ))}
            </View>
        )}

        {chargement ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />
        ) : (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 100 }}>
            {programmes.length === 0 && (
                <View style={{ alignItems: "center", marginTop: 60, gap: 12 }}>
                <Text style={{ fontSize: 60 }}>⛪</Text>
                <Text style={{ fontSize: 20, fontWeight: "700", color: "#1E293B" }}>Aucun programme</Text>
                <Text style={{ fontSize: 14, color: "#64748B", textAlign: "center" }}>Créez votre premier programme de culte</Text>
                </View>
            )}

            {programmes.map(prog => {
                const completes = prog.elements.filter(e => e.complete).length;
                const total = prog.elements.length;
                return (
                <Pressable key={prog.id} onPress={() => ouvrirProgramme(prog)}
                    style={{ backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 0.5, borderColor: "#E2E8F0" }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: "700", color: "#07074C" }}>{prog.theme || "Programme sans thème"}</Text>
                        <Text style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{formatDate(prog.date)}</Text>
                        {prog.predicateur ? <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>🎤 {prog.predicateur}</Text> : null}
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                        <Text style={{ fontSize: 11, color: "#94A3B8" }}>⏱ {dureeFormatee(prog.duree_totale)}</Text>
                        <Text style={{ fontSize: 11, color: "#64748B" }}>{total} étapes</Text>
                    </View>
                    </View>

                    {total > 0 && (
                    <View style={{ marginTop: 10 }}>
                        <View style={{ height: 4, backgroundColor: "#E2E8F0", borderRadius: 2 }}>
                        <View style={{ height: 4, backgroundColor: completes === total ? "#065F46" : "#4F46E5", borderRadius: 2, width: `${total > 0 ? (completes / total) * 100 : 0}%` as any }} />
                        </View>
                        <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 3 }}>{completes}/{total} éléments complétés</Text>
                    </View>
                    )}
                </Pressable>
                );
            })}
            </ScrollView>
        )}

        <Pressable
            onPress={() => ouvrirFormProgramme()}
            style={{ position: "absolute", bottom: 24, right: 20, backgroundColor: "#07074C", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 6, elevation: 5 }}
        >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>+ Nouveau programme</Text>
        </Pressable>
        </SafeAreaView>
    );
    }