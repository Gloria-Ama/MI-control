import { useEffect, useRef, useState, useCallback } from "react";
    import {
    View, Text, TextInput, ScrollView, Pressable, FlatList,
    Alert, ActivityIndicator, SafeAreaView, KeyboardAvoidingView,
    Platform, Modal, Image, StyleSheet,
    } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import * as ImagePicker from "expo-image-picker";
    import * as DocumentPicker from "expo-document-picker";
    import {
    getCanaux, getMessages, envoyerMessage, envoyerImage,
    envoyerFichier, creerSondage, marquerLus, voter,
    creerGroupe, ouvrirConversationPrivee, initialiserCanalPrincipal,
    quitterCanal, ajouterMembre,
    } from "../services/canal.service";
    import { getProfilConnecte } from "../services/auth.service";
    import { getResponsables } from "../services/responsables.service";
    import { api } from "../services/api";

    type Props = { onRetour?: () => void; communauteId?: number };
    type Vue = "liste" | "chat" | "nouveau_groupe" | "ajouter_membre";

    export default function ChatScreen({ onRetour, communauteId }: Props) {
    const [vue, setVue] = useState<Vue>("liste");
    const [profil, setProfil] = useState<any>(null);
    const [canaux, setCanaux] = useState<any[]>([]);
    const [canalActif, setCanalActif] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
    const [chargement, setChargement] = useState(true);
    const [chargementMessages, setChargementMessages] = useState(false);
    const [envoi, setEnvoi] = useState(false);
    const [texte, setTexte] = useState("");
    const [modalSondage, setModalSondage] = useState(false);
    const [modalNouveauGroupe, setModalNouveauGroupe] = useState(false);
    const [sondageQuestion, setSondageQuestion] = useState("");
    const [sondageOptions, setSondageOptions] = useState(["", ""]);
    const [nomGroupe, setNomGroupe] = useState("");
    const [membresSelectionnes, setMembresSelectionnes] = useState<number[]>([]);
    const [recherche, setRecherche] = useState("");
    const scrollRef = useRef<ScrollView>(null);
    const cooldownRef = useRef(false);

    useEffect(() => {
        chargerDonnees();
        const interval = setInterval(rafraichir, 8000);
        return () => clearInterval(interval);
    }, []);

    async function chargerDonnees() {
        setChargement(true);
        try {
        const [p, r] = await Promise.all([
            getProfilConnecte().catch(() => null),
            getResponsables().catch(() => []),
        ]);
        setProfil(p);

        // Récupérer aussi les users via api
        const usersResp = await api.get("/responsables/").catch(() => ({ data: [] }));
        setUtilisateurs(Array.isArray(usersResp.data) ? usersResp.data : []);

        // Initialiser canal principal si communauteId fourni
        if (communauteId) {
            await initialiserCanalPrincipal(communauteId).catch(() => {});
        }

        await chargerCanaux();
        } finally {
        setChargement(false);
        }
    }

    async function chargerCanaux() {
        try {
        const c = await getCanaux();
        setCanaux(Array.isArray(c) ? c : []);
        } catch {}
    }

    async function rafraichir() {
        await chargerCanaux();
        if (canalActif) {
        const m = await getMessages(canalActif.id).catch(() => []);
        setMessages(Array.isArray(m) ? m : []);
        }
    }

    async function ouvrirCanal(canal: any) {
        setCanalActif(canal);
        setVue("chat");
        setChargementMessages(true);
        try {
        const m = await getMessages(canal.id);
        setMessages(Array.isArray(m) ? m : []);
        await marquerLus(canal.id).catch(() => {});
        await chargerCanaux();
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
        } finally {
        setChargementMessages(false);
        }
    }

    async function ouvrirPrive(userId: number) {
        try {
        const canal = await ouvrirConversationPrivee(userId);
        await chargerCanaux();
        await ouvrirCanal(canal);
        } catch {
        Alert.alert("Erreur", "Impossible d'ouvrir la conversation.");
        }
    }

    async function handleEnvoi() {
        if (!texte.trim() || !canalActif || envoi) return;
        const contenu = texte.trim();
        setTexte("");
        setEnvoi(true);
        try {
        const msg = await envoyerMessage(canalActif.id, contenu);
        setMessages(prev => [...prev, msg]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        } catch {
        setTexte(contenu);
        } finally {
        setEnvoi(false);
        }
    }

    async function handleImage() {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
        if (result.canceled || !result.assets[0] || !canalActif) return;
        setEnvoi(true);
        try {
        const msg = await envoyerImage(canalActif.id, result.assets[0].uri);
        setMessages(prev => [...prev, msg]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        } catch {
        Alert.alert("Erreur", "Impossible d'envoyer l'image.");
        } finally {
        setEnvoi(false);
        }
    }

    async function handleFichier() {
        const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
        if (result.canceled || !result.assets[0] || !canalActif) return;
        const f = result.assets[0];
        setEnvoi(true);
        try {
        const msg = await envoyerFichier(canalActif.id, f.uri, f.name, f.mimeType ?? "application/octet-stream");
        setMessages(prev => [...prev, msg]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        } catch {
        Alert.alert("Erreur", "Impossible d'envoyer le fichier.");
        } finally {
        setEnvoi(false);
        }
    }

    async function handleSondage() {
        const opts = sondageOptions.filter(o => o.trim());
        if (!sondageQuestion.trim()) { Alert.alert("Question requise"); return; }
        if (opts.length < 2) { Alert.alert("Minimum 2 options"); return; }
        if (!canalActif) return;
        setModalSondage(false);
        setEnvoi(true);
        try {
        const msg = await creerSondage(canalActif.id, sondageQuestion.trim(), opts);
        setMessages(prev => [...prev, msg]);
        setSondageQuestion(""); setSondageOptions(["", ""]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        } catch {
        Alert.alert("Erreur", "Impossible de créer le sondage.");
        } finally {
        setEnvoi(false);
        }
    }

    async function handleVoter(optionId: number) {
        if (cooldownRef.current || !canalActif) return;
        cooldownRef.current = true;
        try {
        const msgMaj = await voter(optionId);
        setMessages(prev => prev.map(m => m.id === msgMaj.id ? msgMaj : m));
        } catch {} finally {
        setTimeout(() => { cooldownRef.current = false; }, 1000);
        }
    }

    async function handleCreerGroupe() {
        if (!nomGroupe.trim()) { Alert.alert("Nom requis"); return; }
        if (membresSelectionnes.length === 0) { Alert.alert("Ajoutez des membres"); return; }
        try {
        const canal = await creerGroupe({
            nom: nomGroupe.trim(),
            membres: membresSelectionnes,
            communaute_culte: communauteId,
        });
        setModalNouveauGroupe(false);
        setNomGroupe(""); setMembresSelectionnes([]);
        await chargerCanaux();
        await ouvrirCanal(canal);
        } catch {
        Alert.alert("Erreur", "Impossible de créer le groupe.");
        }
    }

    function formatHeure(d: string) {
        try { return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; }
    }

    function formatDate(d: string) {
        try {
        const diff = Date.now() - new Date(d).getTime();
        const jours = Math.floor(diff / 86400000);
        if (jours === 0) return formatHeure(d);
        if (jours === 1) return "Hier";
        return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
        } catch { return ""; }
    }

    function initiales(nom: string) {
        return nom?.split(/[\s._]/).map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
    }

    function couleur(nom: string) {
        const c = ["#07074C", "#4F46E5", "#0F6E56", "#854F0B", "#BE185D", "#0369A1"];
        return c[(nom?.charCodeAt(0) ?? 0) % c.length];
    }

    function nomCanal(canal: any) {
        if (canal.type === "prive") {
        const autre = canal.membres?.find((m: any) => m.username !== profil?.username);
        return autre?.username ?? canal.nom ?? "Conversation";
        }
        return canal.nom || "Groupe";
    }

    function iconeCanal(canal: any) {
        if (canal.type === "principal") return "people";
        if (canal.type === "restreint") return "people-outline";
        return "chatbubble-outline";
    }

    function couleurCanal(canal: any) {
        if (canal.type === "principal") return "#07074C";
        if (canal.type === "restreint") return "#4F46E5";
        return couleur(nomCanal(canal));
    }

    // ── Modal sondage ─────────────────────────────────────────────────────────
    function renderModalSondage() {
        return (
        <Modal visible={modalSondage} transparent animationType="slide" onRequestClose={() => setModalSondage(false)}>
            <View style={s.modalOverlay}>
            <View style={s.modalCard}>
                <View style={s.modalHeader}>
                <Text style={s.modalTitre}>Créer un sondage</Text>
                <Pressable onPress={() => setModalSondage(false)}>
                    <Ionicons name="close" size={24} color="#64748B" />
                </Pressable>
                </View>
                <Text style={s.champLabel}>Question *</Text>
                <TextInput style={s.champInput} value={sondageQuestion} onChangeText={setSondageQuestion}
                placeholder="Votre question..." placeholderTextColor="#94A3B8" multiline />
                <Text style={s.champLabel}>Options *</Text>
                {sondageOptions.map((opt, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "center" }}>
                    <TextInput
                    style={[s.champInput, { flex: 1, marginBottom: 0 }]}
                    value={opt}
                    onChangeText={v => { const n = [...sondageOptions]; n[i] = v; setSondageOptions(n); }}
                    placeholder={`Option ${i + 1}`} placeholderTextColor="#94A3B8"
                    />
                    {sondageOptions.length > 2 && (
                    <Pressable onPress={() => setSondageOptions(sondageOptions.filter((_, j) => j !== i))}>
                        <Ionicons name="remove-circle-outline" size={22} color="#EF4444" />
                    </Pressable>
                    )}
                </View>
                ))}
                {sondageOptions.length < 6 && (
                <Pressable style={s.btnAjouterOption} onPress={() => setSondageOptions([...sondageOptions, ""])}>
                    <Ionicons name="add-circle-outline" size={18} color="#4F46E5" />
                    <Text style={{ color: "#4F46E5", fontSize: 13, fontWeight: "600" }}>Ajouter une option</Text>
                </Pressable>
                )}
                <Pressable style={[s.btnPrimaire, { marginTop: 16 }]} onPress={handleSondage}>
                <Ionicons name="bar-chart-outline" size={18} color="#fff" />
                <Text style={s.btnPrimaireTexte}>Créer le sondage</Text>
                </Pressable>
            </View>
            </View>
        </Modal>
        );
    }

    // ── Modal nouveau groupe ──────────────────────────────────────────────────
    function renderModalGroupe() {
        const utilisateursFiltres = utilisateurs.filter(u =>
        u.username?.toLowerCase().includes(recherche.toLowerCase()) && u.username !== profil?.username
        );
        return (
        <Modal visible={modalNouveauGroupe} transparent animationType="slide" onRequestClose={() => setModalNouveauGroupe(false)}>
            <View style={s.modalOverlay}>
            <View style={[s.modalCard, { maxHeight: "85%" }]}>
                <View style={s.modalHeader}>
                <Text style={s.modalTitre}>Nouveau groupe</Text>
                <Pressable onPress={() => setModalNouveauGroupe(false)}>
                    <Ionicons name="close" size={24} color="#64748B" />
                </Pressable>
                </View>
                <Text style={s.champLabel}>Nom du groupe *</Text>
                <TextInput style={s.champInput} value={nomGroupe} onChangeText={setNomGroupe}
                placeholder="Ex: Équipe musicale" placeholderTextColor="#94A3B8" />
                <Text style={s.champLabel}>Membres ({membresSelectionnes.length} sélectionné(s))</Text>
                <TextInput
                style={[s.champInput, { marginBottom: 8 }]}
                value={recherche} onChangeText={setRecherche}
                placeholder="Rechercher..." placeholderTextColor="#94A3B8"
                />
                <ScrollView style={{ maxHeight: 200 }}>
                {utilisateursFiltres.map(u => {
                    const selectionne = membresSelectionnes.includes(u.id);
                    return (
                    <Pressable
                        key={u.id}
                        style={[s.membreItem, selectionne && s.membreItemSelectionne]}
                        onPress={() => {
                        if (selectionne) setMembresSelectionnes(prev => prev.filter(id => id !== u.id));
                        else setMembresSelectionnes(prev => [...prev, u.id]);
                        }}
                    >
                        <View style={[s.miniAvatar, { backgroundColor: couleur(u.username) }]}>
                        <Text style={s.miniAvatarTexte}>{initiales(u.username)}</Text>
                        </View>
                        <Text style={s.membreItemNom}>{u.username}</Text>
                        {selectionne && <Ionicons name="checkmark-circle" size={20} color="#4F46E5" />}
                    </Pressable>
                    );
                })}
                </ScrollView>
                <Pressable style={[s.btnPrimaire, { marginTop: 12 }]} onPress={handleCreerGroupe}>
                <Ionicons name="people-outline" size={18} color="#fff" />
                <Text style={s.btnPrimaireTexte}>Créer le groupe</Text>
                </Pressable>
            </View>
            </View>
        </Modal>
        );
    }

    // ── Bulle message ─────────────────────────────────────────────────────────
    function renderBulle(msg: any) {
        const estMoi = msg.auteur === profil?.id || msg.auteur_nom === profil?.username;
        const estGroupe = canalActif?.type !== "prive";

        return (
        <View key={msg.id} style={[s.bulleContainer, estMoi ? s.bulleContainerMoi : s.bulleContainerAutre]}>
            {!estMoi && estGroupe && (
            <View style={[s.miniAvatar, { backgroundColor: couleur(msg.auteur_nom) }]}>
                <Text style={s.miniAvatarTexte}>{initiales(msg.auteur_nom)}</Text>
            </View>
            )}
            <View style={{ maxWidth: "78%" }}>
            {!estMoi && estGroupe && <Text style={s.auteurNom}>{msg.auteur_nom}</Text>}

            {msg.type === "texte" && (
                <View style={[s.bulle, estMoi ? s.bulleMoi : s.bulleAutre]}>
                <Text style={[s.bulleTexte, estMoi ? s.bulleTexteMoi : s.bulleTexteAutre]}>{msg.contenu}</Text>
                <Text style={[s.bulleDate, { color: estMoi ? "rgba(255,255,255,0.7)" : "#94A3B8" }]}>
                    {formatHeure(msg.date_envoi)} {estMoi && (msg.lu ? "✓✓" : "✓")}
                </Text>
                </View>
            )}

            {msg.type === "image" && msg.fichier_url && (
                <View style={[s.bulle, estMoi ? s.bulleMoi : s.bulleAutre, { padding: 4 }]}>
                <Image source={{ uri: msg.fichier_url }} style={s.imageMsg} resizeMode="cover" />
                <Text style={[s.bulleDate, { color: estMoi ? "rgba(255,255,255,0.7)" : "#94A3B8", padding: 4 }]}>
                    {formatHeure(msg.date_envoi)}
                </Text>
                </View>
            )}

            {msg.type === "fichier" && (
                <View style={[s.bulle, estMoi ? s.bulleMoi : s.bulleAutre]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="document-outline" size={22} color={estMoi ? "#fff" : "#07074C"} />
                    <Text style={[s.bulleTexte, estMoi ? s.bulleTexteMoi : s.bulleTexteAutre, { flex: 1 }]}>
                    {msg.nom_fichier || "Fichier"}
                    </Text>
                </View>
                <Text style={[s.bulleDate, { color: estMoi ? "rgba(255,255,255,0.7)" : "#94A3B8" }]}>
                    {formatHeure(msg.date_envoi)}
                </Text>
                </View>
            )}

            {msg.type === "sondage" && msg.sondage && (
                <View style={s.sondageCard}>
                <View style={{ flexDirection: "row", gap: 6, marginBottom: 10, alignItems: "center" }}>
                    <Ionicons name="bar-chart-outline" size={16} color="#4F46E5" />
                    <Text style={s.sondageTitre}>{msg.sondage.question}</Text>
                </View>
                {msg.sondage.options.map((opt: any) => {
                    const total = msg.sondage.total_votes || 1;
                    const pct = Math.round((opt.nb_votes / total) * 100);
                    return (
                    <Pressable
                        key={opt.id}
                        style={[s.sondageOption, opt.a_vote && s.sondageOptionVotee]}
                        onPress={() => handleVoter(opt.id)}
                    >
                        <View style={[s.sondageBarre, { width: `${pct}%` as any }]} />
                        <Text style={[s.sondageOptionTexte, opt.a_vote && { fontWeight: "700" }]}>{opt.texte}</Text>
                        <Text style={s.sondagePct}>{pct}%</Text>
                    </Pressable>
                    );
                })}
                <Text style={s.sondageTotal}>{msg.sondage.total_votes} vote(s) · {formatHeure(msg.date_envoi)}</Text>
                </View>
            )}
            </View>
        </View>
        );
    }

    // ── VUE LISTE ─────────────────────────────────────────────────────────────
    if (vue === "liste") {
        const totalNonLus = canaux.reduce((acc, c) => acc + (c.non_lus ?? 0), 0);
        return (
        <SafeAreaView style={s.safe}>
            <View style={s.header}>
            {onRetour && (
                <Pressable onPress={onRetour} style={s.retourBtn}>
                <Ionicons name="arrow-back" size={22} color="#94A3B8" />
                </Pressable>
            )}
            <Text style={[s.headerTitre, { flex: 1 }]}>
                Messages {totalNonLus > 0 ? `(${totalNonLus})` : ""}
            </Text>
            <Pressable onPress={() => setModalNouveauGroupe(true)} style={{ padding: 8 }}>
                <Ionicons name="people-outline" size={22} color="#07074C" />
            </Pressable>
            <Pressable onPress={() => setVue("nouveau_groupe")} style={{ padding: 8 }}>
                <Ionicons name="create-outline" size={22} color="#07074C" />
            </Pressable>
            </View>

            {chargement ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />
            ) : (
            <ScrollView>
                {canaux.length === 0 && (
                <Text style={s.videTexte}>Aucune conversation.{"\n"}Appuyez sur ✏️ pour commencer.</Text>
                )}
                {canaux.map(canal => (
                <Pressable key={canal.id} style={[s.convCard, canal.non_lus > 0 && s.convCardNonLue]} onPress={() => ouvrirCanal(canal)}>
                    <View style={[s.avatar, { backgroundColor: couleurCanal(canal) }]}>
                    <Ionicons name={iconeCanal(canal)} size={20} color="#fff" />
                    </View>
                    <View style={s.convInfo}>
                    <Text style={s.convNom}>{nomCanal(canal)}</Text>
                    <Text style={s.convDernier} numberOfLines={1}>
                        {canal.dernier_message
                        ? `${canal.dernier_message.auteur === profil?.username ? "Vous" : canal.dernier_message.auteur}: ${canal.dernier_message.contenu || `[${canal.dernier_message.type}]`}`
                        : "Aucun message"
                        }
                    </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text style={s.convDate}>
                        {canal.dernier_message ? formatDate(canal.dernier_message.date) : ""}
                    </Text>
                    {canal.non_lus > 0 && (
                        <View style={s.badgeNonLu}>
                        <Text style={s.badgeNonLuTexte}>{canal.non_lus}</Text>
                        </View>
                    )}
                    </View>
                </Pressable>
                ))}
            </ScrollView>
            )}
            {renderModalGroupe()}
        </SafeAreaView>
        );
    }

    // ── VUE NOUVEAU MESSAGE PRIVÉ ─────────────────────────────────────────────
    if (vue === "nouveau_groupe") {
        const utilisateursFiltres = utilisateurs.filter(u =>
        u.username?.toLowerCase().includes(recherche.toLowerCase()) && u.username !== profil?.username
        );
        return (
        <SafeAreaView style={s.safe}>
            <View style={s.header}>
            <Pressable onPress={() => { setVue("liste"); setRecherche(""); }} style={s.retourBtn}>
                <Ionicons name="arrow-back" size={22} color="#94A3B8" />
            </Pressable>
            <Text style={[s.headerTitre, { flex: 1 }]}>Nouvelle conversation</Text>
            </View>
            <View style={{ padding: 12 }}>
            <TextInput
                style={s.champInput}
                value={recherche} onChangeText={setRecherche}
                placeholder="Rechercher un responsable..." placeholderTextColor="#94A3B8"
            />
            </View>
            <ScrollView>
            {utilisateursFiltres.map(u => (
                <Pressable key={u.id} style={s.convCard} onPress={() => { setRecherche(""); ouvrirPrive(u.id); }}>
                <View style={[s.avatar, { backgroundColor: couleur(u.username) }]}>
                    <Text style={s.avatarTexte}>{initiales(u.username)}</Text>
                </View>
                <View style={s.convInfo}>
                    <Text style={s.convNom}>{u.username}</Text>
                    <Text style={s.convDernier}>{u.role}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
                </Pressable>
            ))}
            </ScrollView>
        </SafeAreaView>
        );
    }

    // ── VUE CHAT ──────────────────────────────────────────────────────────────
    if (vue === "chat" && canalActif) {
        return (
        <SafeAreaView style={s.safe}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
                keyboardVerticalOffset={90}
            >
            <View style={s.chatHeader}>
                <Pressable onPress={() => { setVue("liste"); setMessages([]); setCanalActif(null); chargerCanaux(); }} style={s.retourBtn}>
                <Ionicons name="arrow-back" size={22} color="#94A3B8" />
                </Pressable>
                <View style={[s.chatHeaderAvatar, { backgroundColor: couleurCanal(canalActif) }]}>
                <Ionicons name={iconeCanal(canalActif)} size={18} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                <Text style={s.chatHeaderNom} numberOfLines={1}>{nomCanal(canalActif)}</Text>
                <Text style={s.chatHeaderSub}>
                    {canalActif.nb_membres} membre{canalActif.nb_membres > 1 ? "s" : ""}
                    {canalActif.type === "principal" ? " · Groupe principal" : ""}
                </Text>
                </View>
            </View>

            {chargementMessages ? (
                <ActivityIndicator style={{ flex: 1 }} color="#07074C" />
            ) : (
                <ScrollView
                ref={scrollRef}
                style={s.messagesListe}
                contentContainerStyle={s.messagesContenu}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
                >
                {messages.length === 0 && (
                    <Text style={[s.videTexte, { marginTop: 60 }]}>Aucun message. Commencez la conversation !</Text>
                )}
                {messages.map(msg => renderBulle(msg))}
                </ScrollView>
            )}

            <View style={s.saisieContainer}>
                <Pressable style={s.saisieIcone} onPress={handleImage}>
                <Ionicons name="image-outline" size={22} color="#64748B" />
                </Pressable>
                <Pressable style={s.saisieIcone} onPress={handleFichier}>
                <Ionicons name="attach-outline" size={22} color="#64748B" />
                </Pressable>
                {canalActif.type !== "prive" && (
                <Pressable style={s.saisieIcone} onPress={() => setModalSondage(true)}>
                    <Ionicons name="bar-chart-outline" size={22} color="#4F46E5" />
                </Pressable>
                )}
                <TextInput
                style={s.saisieInput}
                value={texte} onChangeText={setTexte}
                placeholder="Message..." placeholderTextColor="#94A3B8"
                multiline maxLength={2000}
                />
                <Pressable
                style={[s.envoiBtn, !texte.trim() && s.envoiBtnVide]}
                onPress={handleEnvoi}
                disabled={!texte.trim() || envoi}
                >
                {envoi ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
                </Pressable>
            </View>
            </KeyboardAvoidingView>
            {renderModalSondage()}
        </SafeAreaView>
        );
    }

    return null;
    }

    const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F8F5F0" },
    header: { backgroundColor: "#fff", height: 60, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0", gap: 8 },
    headerTitre: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
    retourBtn: { padding: 4 },
    chatHeader: { backgroundColor: "#fff", height: 60, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0", gap: 10 },
    chatHeaderAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    chatHeaderNom: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
    chatHeaderSub: { fontSize: 11, color: "#64748B" },
    convCard: { flexDirection: "row", alignItems: "center", padding: 14, backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#F1F5F9", gap: 12 },
    convCardNonLue: { backgroundColor: "#F0F7FF" },
    convInfo: { flex: 1 },
    convNom: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
    convDernier: { fontSize: 13, color: "#64748B", marginTop: 2 },
    convDate: { fontSize: 11, color: "#94A3B8" },
    badgeNonLu: { backgroundColor: "#07074C", borderRadius: 99, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
    badgeNonLuTexte: { color: "#fff", fontSize: 11, fontWeight: "700" },
    avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
    avatarTexte: { color: "#fff", fontWeight: "700", fontSize: 16 },
    miniAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    miniAvatarTexte: { color: "#fff", fontSize: 10, fontWeight: "700" },
    auteurNom: { fontSize: 11, color: "#64748B", marginBottom: 2, marginLeft: 4 },
    messagesListe: { flex: 1, backgroundColor: "#F0F2F5" },
    messagesContenu: { padding: 12, paddingBottom: 20 },
    bulleContainer: { flexDirection: "row", marginBottom: 6, alignItems: "flex-end", gap: 6 },
    bulleContainerMoi: { justifyContent: "flex-end" },
    bulleContainerAutre: { justifyContent: "flex-start" },
    bulle: { borderRadius: 16, padding: 10, maxWidth: "100%" },
    bulleMoi: { backgroundColor: "#07074C", borderBottomRightRadius: 4 },
    bulleAutre: { backgroundColor: "#fff", borderBottomLeftRadius: 4 },
    bulleTexte: { fontSize: 14, lineHeight: 20 },
    bulleTexteMoi: { color: "#fff" },
    bulleTexteAutre: { color: "#1E293B" },
    bulleDate: { fontSize: 10, marginTop: 4 },
    imageMsg: { width: 200, height: 150, borderRadius: 10 },
    sondageCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: "#C7D2FE", minWidth: 240 },
    sondageTitre: { fontSize: 14, fontWeight: "700", color: "#1E293B", flex: 1 },
    sondageOption: { backgroundColor: "#F1F5F9", borderRadius: 8, padding: 10, marginBottom: 6, flexDirection: "row", alignItems: "center", overflow: "hidden", position: "relative", borderWidth: 1, borderColor: "#E2E8F0" },
    sondageOptionVotee: { borderColor: "#4F46E5" },
    sondageBarre: { position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: "#EEF2FF", borderRadius: 8 },
    sondageOptionTexte: { flex: 1, fontSize: 13, color: "#1E293B", zIndex: 1 },
    sondagePct: { fontSize: 12, fontWeight: "700", color: "#4F46E5", zIndex: 1 },
    sondageTotal: { fontSize: 11, color: "#94A3B8", marginTop: 6, textAlign: "right" },
    saisieContainer: { flexDirection: "row", alignItems: "flex-end", padding: 10, backgroundColor: "#fff", borderTopWidth: 0.5, borderTopColor: "#E2E8F0", gap: 6 },
    saisieIcone: { padding: 6, marginBottom: 4 },
    saisieInput: { flex: 1, backgroundColor: "#F0F2F5", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#1E293B", maxHeight: 120 },
    envoiBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#07074C", alignItems: "center", justifyContent: "center" },
    envoiBtnVide: { backgroundColor: "#CBD5E0" },
    videTexte: { color: "#94A3B8", fontStyle: "italic", textAlign: "center", marginTop: 40, fontSize: 14, lineHeight: 22 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    modalTitre: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
    champLabel: { fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 6 },
    champInput: { backgroundColor: "#F8F5F0", borderRadius: 10, padding: 12, fontSize: 14, color: "#1E293B", marginBottom: 12, borderWidth: 0.5, borderColor: "#E2E8F0" },
    btnAjouterOption: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, justifyContent: "center" },
    btnPrimaire: { backgroundColor: "#07074C", borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    btnPrimaireTexte: { color: "#fff", fontWeight: "700", fontSize: 15 },
    membreItem: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10, borderRadius: 10, marginBottom: 4 },
    membreItemSelectionne: { backgroundColor: "#EEF2FF" },
    membreItemNom: { flex: 1, fontSize: 14, color: "#1E293B", fontWeight: "500" },
    });