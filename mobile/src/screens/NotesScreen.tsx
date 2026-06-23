import { useEffect, useState, useRef } from "react";
import {
    View, Text, TextInput, ScrollView, Pressable,
    Alert, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform,
    } from "react-native";
import { api } from "../services/api";

    type Note = {
    id: number;
    titre: string;
    contenu: string;
    couleur: string;
    epinglee: boolean;
    date_modification: string;
    };

    const COULEURS: Record<string, { fond: string; texte: string; bordure: string }> = {
    jaune:  { fond: "#FFFBEB", texte: "#633806", bordure: "#FCD34D" },
    bleu:   { fond: "#EFF6FF", texte: "#1D4ED8", bordure: "#BFDBFE" },
    vert:   { fond: "#F0FDF4", texte: "#065F46", bordure: "#86EFAC" },
    rose:   { fond: "#FDF2F8", texte: "#9D174D", bordure: "#F9A8D4" },
    orange: { fond: "#FFF7ED", texte: "#9A3412", bordure: "#FED7AA" },
    violet: { fond: "#F5F3FF", texte: "#5B21B6", bordure: "#C4B5FD" },
    gris:   { fond: "#F8FAFC", texte: "#475569", bordure: "#CBD5E0" },
    };

    const EMOJI_COULEUR: Record<string, string> = {
    jaune: "🟡", bleu: "🔵", vert: "🟢",
    rose: "🌸", orange: "🟠", violet: "🟣", gris: "⚪",
    };

    export default function NotesScreen() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [chargement, setChargement] = useState(true);
    const [recherche, setRecherche] = useState("");
    const [vue, setVue] = useState<"liste" | "edition">("liste");
    const [noteActive, setNoteActive] = useState<Note | null>(null);
    const [titre, setTitre] = useState("");
    const [contenu, setContenu] = useState("");
    const [couleur, setCouleur] = useState("jaune");
    const [sauvegarde, setSauvegarde] = useState(false);
    const [modifie, setModifie] = useState(false);
    const timerRef = useRef<any>(null);

    useEffect(() => { charger(); }, []);

    // Auto-sauvegarde 2 secondes après la dernière frappe
    useEffect(() => {
        if (!modifie || !noteActive) return;
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => sauvegarderAuto(), 2000);
        return () => clearTimeout(timerRef.current);
    }, [titre, contenu, couleur, modifie]);

    async function charger() {
        setChargement(true);
        try {
        const res = await api.get("/notes/");
        setNotes(Array.isArray(res.data) ? res.data : []);
        } catch { }
        finally { setChargement(false); }
    }

    async function sauvegarderAuto() {
        if (!noteActive || !modifie) return;
        setSauvegarde(true);
        try {
        await api.patch(`/notes/${noteActive.id}/`, { titre: titre.trim() || "Sans titre", contenu, couleur });
        setModifie(false);
        } catch { }
        finally { setSauvegarde(false); }
    }

    async function nouvelleNote() {
        try {
        const res = await api.post("/notes/", { titre: "", contenu: "", couleur: "jaune" });
        const note = res.data;
        setNotes(prev => [note, ...prev]);
        ouvrirNote(note);
        } catch { Alert.alert("Erreur", "Impossible de créer une note."); }
    }

    function ouvrirNote(note: Note) {
        setNoteActive(note);
        setTitre(note.titre === "Sans titre" ? "" : note.titre);
        setContenu(note.contenu);
        setCouleur(note.couleur);
        setModifie(false);
        setVue("edition");
    }

    async function fermerNote() {
        clearTimeout(timerRef.current);
        if (modifie && noteActive) {
        setSauvegarde(true);
        try {
            await api.patch(`/notes/${noteActive.id}/`, {
            titre: titre.trim() || "Sans titre",
            contenu, couleur,
            });
        } catch { }
        finally { setSauvegarde(false); }
        }
        await charger();
        setVue("liste");
        setNoteActive(null);
        setModifie(false);
    }

    async function supprimerNote(note: Note) {
        Alert.alert("Supprimer cette note ?", note.titre || "Sans titre", [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: async () => {
            try {
            await api.delete(`/notes/${note.id}/`);
            if (noteActive?.id === note.id) { setVue("liste"); setNoteActive(null); }
            await charger();
            } catch { Alert.alert("Erreur", "Impossible de supprimer."); }
        }},
        ]);
    }

    async function epinglerNote(note: Note) {
        try {
        await api.post(`/notes/${note.id}/epingler/`);
        await charger();
        } catch { }
    }

    function formatDate(dateStr: string) {
        try {
        const d = new Date(dateStr);
        const auj = new Date();
        const diff = Math.floor((auj.getTime() - d.getTime()) / 86400000);
        if (diff === 0) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        if (diff === 1) return "Hier";
        if (diff < 7) return d.toLocaleDateString("fr-FR", { weekday: "long" });
        return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
        } catch { return ""; }
    }

    function apercu(contenu: string) {
        return contenu.replace(/\n/g, " ").trim().slice(0, 80) || "Aucun texte supplémentaire";
    }

    const notesFiltrees = notes.filter(n =>
        n.titre.toLowerCase().includes(recherche.toLowerCase()) ||
        n.contenu.toLowerCase().includes(recherche.toLowerCase())
    );

    const epinglees = notesFiltrees.filter(n => n.epinglee);
    const autres = notesFiltrees.filter(n => !n.epinglee);

    // ── VUE ÉDITION ────────────────────────────────────────────────────────────
    if (vue === "edition" && noteActive) {
        const theme = COULEURS[couleur] ?? COULEURS.jaune;
        return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.fond }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>

            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottomWidth: 0.5, borderBottomColor: theme.bordure }}>
                <Pressable onPress={fermerNote} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 16, color: theme.texte }}>‹</Text>
                <Text style={{ fontSize: 15, color: theme.texte, fontWeight: "600" }}>Notes</Text>
                </Pressable>
                <Text style={{ fontSize: 12, color: theme.texte, opacity: 0.6 }}>
                {sauvegarde ? "Enregistrement..." : modifie ? "Modifications non sauvegardées" : "✓ Sauvegardé"}
                </Text>
                <Pressable onPress={() => supprimerNote(noteActive)} style={{ padding: 6 }}>
                <Text style={{ fontSize: 18 }}>🗑</Text>
                </Pressable>
            </View>

            {/* Sélecteur de couleur */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: theme.bordure }}
                contentContainerStyle={{ gap: 10, alignItems: "center" }}>
                {Object.entries(COULEURS).map(([key, val]) => (
                <Pressable key={key} onPress={() => { setCouleur(key); setModifie(true); }}
                    style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: val.fond, borderWidth: couleur === key ? 3 : 1, borderColor: val.bordure, alignItems: "center", justifyContent: "center" }}>
                    {couleur === key && <Text style={{ fontSize: 10 }}>✓</Text>}
                </Pressable>
                ))}
            </ScrollView>

            {/* Éditeur */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                <TextInput
                value={titre}
                onChangeText={v => { setTitre(v); setModifie(true); }}
                placeholder="Titre"
                placeholderTextColor={theme.texte + "60"}
                style={{ fontSize: 24, fontWeight: "700", color: theme.texte, marginBottom: 12, minHeight: 36 }}
                multiline
                />
                <TextInput
                value={contenu}
                onChangeText={v => { setContenu(v); setModifie(true); }}
                placeholder="Commencez à écrire..."
                placeholderTextColor={theme.texte + "60"}
                style={{ fontSize: 16, color: theme.texte, lineHeight: 26, flex: 1, minHeight: 300, textAlignVertical: "top" }}
                multiline
                autoFocus={!titre && !contenu}
                />
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
        );
    }

    // ── VUE LISTE ──────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F5F0" }}>
        {/* Recherche */}
        <View style={{ backgroundColor: "#fff", padding: 12, borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0" }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F8F5F0", borderRadius: 12, paddingHorizontal: 12, borderWidth: 0.5, borderColor: "#E2E8F0" }}>
            <Text style={{ fontSize: 16, color: "#94A3B8" }}>🔍</Text>
            <TextInput
                style={{ flex: 1, padding: 10, fontSize: 15, color: "#1E293B" }}
                placeholder="Rechercher..."
                placeholderTextColor="#94A3B8"
                value={recherche}
                onChangeText={setRecherche}
            />
            {recherche.length > 0 && (
                <Pressable onPress={() => setRecherche("")}>
                <Text style={{ fontSize: 16, color: "#94A3B8" }}>✕</Text>
                </Pressable>
            )}
            </View>
        </View>

        {chargement ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />
        ) : (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 100 }}>

            {notes.length === 0 && (
                <View style={{ alignItems: "center", marginTop: 80, gap: 12 }}>
                <Text style={{ fontSize: 60 }}>📝</Text>
                <Text style={{ fontSize: 20, fontWeight: "700", color: "#1E293B" }}>Aucune note</Text>
                <Text style={{ fontSize: 14, color: "#64748B", textAlign: "center" }}>Appuyez sur + pour créer votre première note</Text>
                </View>
            )}

            {/* Notes épinglées */}
            {epinglees.length > 0 && (
                <>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                    📌 Épinglées
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                    {epinglees.map(note => <CarteNote key={note.id} note={note} />)}
                </View>
                </>
            )}

            {/* Autres notes */}
            {autres.length > 0 && (
                <>
                {epinglees.length > 0 && (
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                    Toutes les notes
                    </Text>
                )}
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    {autres.map(note => <CarteNote key={note.id} note={note} />)}
                </View>
                </>
            )}
            </ScrollView>
        )}

        {/* FAB */}
        <Pressable
            onPress={nouvelleNote}
            style={{ position: "absolute", bottom: 24, right: 20, backgroundColor: "#07074C", width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", elevation: 6 }}
        >
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "300", lineHeight: 32 }}>+</Text>
        </Pressable>
        </SafeAreaView>
    );

    function CarteNote({ note }: { note: Note }) {
        const theme = COULEURS[note.couleur] ?? COULEURS.jaune;
        return (
        <Pressable
            onPress={() => ouvrirNote(note)}
            onLongPress={() => Alert.alert(note.titre || "Note", "Que voulez-vous faire ?", [
            { text: note.epinglee ? "Désépingler" : "📌 Épingler", onPress: () => epinglerNote(note) },
            { text: "🗑 Supprimer", style: "destructive", onPress: () => supprimerNote(note) },
            { text: "Annuler", style: "cancel" },
            ])}
            style={{
            width: "47%",
            backgroundColor: theme.fond,
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: theme.bordure,
            minHeight: 110,
            }}
        >
            {note.epinglee && <Text style={{ fontSize: 12, marginBottom: 4 }}>📌</Text>}
            <Text style={{ fontSize: 15, fontWeight: "700", color: theme.texte, marginBottom: 6 }} numberOfLines={2}>
            {note.titre || "Sans titre"}
            </Text>
            <Text style={{ fontSize: 12, color: theme.texte, opacity: 0.8, lineHeight: 18 }} numberOfLines={3}>
            {apercu(note.contenu)}
            </Text>
            <Text style={{ fontSize: 10, color: theme.texte, opacity: 0.5, marginTop: 8 }}>
            {formatDate(note.date_modification)}
            </Text>
        </Pressable>
        );
    }
    }