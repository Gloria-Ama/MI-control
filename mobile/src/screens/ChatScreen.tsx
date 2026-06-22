    import { useEffect, useRef, useState } from "react";
    import {
    View, Text, TextInput, ScrollView, Pressable,
    Alert, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform,
    } from "react-native";
    import {
    getConversations, getMessages, envoyerMessage,
    envoyerMessageGroupe, marquerLus, getChatNonLus,
    } from "../services/chat.service";
    import { getResponsables } from "../services/responsables.service";
    import { getProfilConnecte } from "../services/auth.service";
    import { cs } from "../styles/chat.Styles";

    type Conversation = {
    interlocuteur_id: number;
    interlocuteur_nom: string;
    dernier_message: string;
    date_dernier: string;
    est_moi: boolean;
    non_lus: number;
    };

    type Message = {
    id: number;
    expediteur: number;
    expediteur_nom: string;
    destinataire: number;
    destinataire_nom: string;
    contenu: string;
    date_envoi: string;
    lu: boolean;
    };

    type Responsable = {
    id: number;
    username: string;
    email: string;
    role: string;
    };

    type Vue = "conversations" | "chat" | "nouvelle" | "groupe";

    type Props = { onRetour?: () => void };

    export default function ChatScreen({ onRetour }: Props) {
    const [vue, setVue] = useState<Vue>("conversations");
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [responsables, setResponsables] = useState<Responsable[]>([]);
    const [profil, setProfil] = useState<any>(null);
    const [interlocuteur, setInterlocuteur] = useState<{ id: number; nom: string } | null>(null);
    const [texte, setTexte] = useState("");
    const [chargement, setChargement] = useState(true);
    const [envoi, setEnvoi] = useState(false);
    const [recherche, setRecherche] = useState("");
    const [refreshInterval, setRefreshInterval] = useState<any>(null);
    const [totalNonLus, setTotalNonLus] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        chargerDonnees();
        return () => { if (refreshInterval) clearInterval(refreshInterval); };
    }, []);

    useEffect(() => {
        if (vue === "chat" && interlocuteur) {
        const interval = setInterval(() => {
            chargerMessages(interlocuteur.id, false);
        }, 5000);
        setRefreshInterval(interval);
        return () => clearInterval(interval);
        } else {
        if (refreshInterval) clearInterval(refreshInterval);
        }
    }, [vue, interlocuteur]);

    async function chargerDonnees() {
        setChargement(true);
        try {
        const [p, c, r, nl] = await Promise.all([
            getProfilConnecte().catch(() => null),
            getConversations().catch(() => []),
            getResponsables().catch(() => []),
            getChatNonLus().catch(() => ({ non_lus: 0 })),
        ]);
        setProfil(p);
        setConversations(Array.isArray(c) ? c : []);
        setResponsables(Array.isArray(r) ? r : []);
        setTotalNonLus(nl.non_lus ?? 0);
        } finally {
        setChargement(false);
        }
    }

    async function chargerMessages(userId: number, avecChargement = true) {
        if (avecChargement) setChargement(true);
        try {
        const m = await getMessages(userId);
        setMessages(Array.isArray(m) ? m : []);
        await marquerLus(userId).catch(() => {});
        const c = await getConversations().catch(() => []);
        setConversations(Array.isArray(c) ? c : []);
        const nl = await getChatNonLus().catch(() => ({ non_lus: 0 }));
        setTotalNonLus(nl.non_lus ?? 0);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
        } finally {
        if (avecChargement) setChargement(false);
        }
    }

    async function ouvrirConversation(conv: Conversation) {
        setInterlocuteur({ id: conv.interlocuteur_id, nom: conv.interlocuteur_nom });
        setVue("chat");
        await chargerMessages(conv.interlocuteur_id);
    }

    async function ouvrirNouvelleConversation(r: Responsable) {
        setInterlocuteur({ id: r.id, nom: r.username });
        setVue("chat");
        await chargerMessages(r.id);
    }

    async function handleEnvoi() {
        if (!texte.trim() || !interlocuteur || envoi) return;
        setEnvoi(true);
        const contenu = texte.trim();
        setTexte("");
        try {
        await envoyerMessage(interlocuteur.id, contenu);
        await chargerMessages(interlocuteur.id, false);
        } catch {
        setTexte(contenu);
        } finally {
        setEnvoi(false);
        }
    }

    async function handleEnvoiGroupe() {
        if (!texte.trim() || envoi) return;
        setEnvoi(true);
        const contenu = texte.trim();
        setTexte("");
        try {
        const result = await envoyerMessageGroupe(contenu);
        Alert.alert("✅ Message envoyé", result.detail ?? "Message envoyé à tous les responsables.");
        await chargerDonnees();
        setVue("conversations");
        } catch {
        setTexte(contenu);
        Alert.alert("Erreur", "Impossible d'envoyer le message de groupe.");
        } finally {
        setEnvoi(false);
        }
    }

    function formatDate(dateStr: string) {
        try {
        const date = new Date(dateStr);
        const maintenant = new Date();
        const diff = maintenant.getTime() - date.getTime();
        const jours = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (jours === 0) return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        if (jours === 1) return "Hier";
        if (jours < 7) return date.toLocaleDateString("fr-FR", { weekday: "short" });
        return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
        } catch { return ""; }
    }

    function formatHeure(dateStr: string) {
        try {
        return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        } catch { return ""; }
    }

    function initiales(nom: string) {
        return nom.split(/[\s._]/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }

    function couleur(nom: string) {
        const c = ["#07074C", "#4F46E5", "#0F6E56", "#854F0B", "#BE185D"];
        return c[nom.charCodeAt(0) % c.length];
    }

    function groupesParDate() {
        const groupes: { date: string; messages: Message[] }[] = [];
        let dateActuelle = "";
        messages.forEach(m => {
        const date = new Date(m.date_envoi).toLocaleDateString("fr-FR", {
            weekday: "long", day: "numeric", month: "long",
        });
        if (date !== dateActuelle) {
            dateActuelle = date;
            groupes.push({ date, messages: [m] });
        } else {
            groupes[groupes.length - 1].messages.push(m);
        }
        });
        return groupes;
    }

    const convFiltrees = conversations.filter(c =>
        c.interlocuteur_nom.toLowerCase().includes(recherche.toLowerCase())
    );
    const autresResponsables = responsables.filter(r => r.username !== profil?.username);

    // ── CONVERSATIONS ──────────────────────────────────────────────────────────
    if (vue === "conversations") {
        return (
        <SafeAreaView style={cs.safe}>
            {/* Header avec retour */}
            <View style={cs.header}>
            {onRetour && (
                <Pressable onPress={onRetour} style={{ marginRight: 10 }}>
                <Text style={{ color: "#94A3B8", fontSize: 22 }}>‹</Text>
                </Pressable>
            )}
            <Text style={[cs.headerTitre, { flex: 1 }]}>
                💬 Messages
                {totalNonLus > 0 ? ` (${totalNonLus})` : ""}
            </Text>
            {totalNonLus > 0 && (
                <View style={cs.headerBadge}>
                <Text style={cs.headerBadgeTexte}>{totalNonLus}</Text>
                </View>
            )}
            </View>

            <View style={cs.searchBar}>
            <TextInput
                style={cs.searchInput}
                placeholder="🔍  Rechercher..."
                placeholderTextColor="#94A3B8"
                value={recherche}
                onChangeText={setRecherche}
            />
            </View>

            {chargement ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />
            ) : (
            <ScrollView>
                {/* ✅ Message de groupe */}
                <Pressable
                style={[cs.convCard, { backgroundColor: "#EEF2FF" }]}
                onPress={() => setVue("groupe")}
                >
                <View style={[cs.avatar, { backgroundColor: "#4F46E5" }]}>
                    <Text style={cs.avatarTexte}>📢</Text>
                </View>
                <View style={cs.convInfo}>
                    <Text style={[cs.convNom, { color: "#4F46E5" }]}>Message de groupe</Text>
                    <Text style={cs.convDernier}>Écrire à tous les responsables</Text>
                </View>
                <Text style={{ fontSize: 18, color: "#94A3B8" }}>›</Text>
                </Pressable>

                {convFiltrees.length === 0 && (
                <Text style={cs.videTexte}>
                    Aucune conversation.{"\n"}Appuyez sur ✏️ pour écrire un message.
                </Text>
                )}
                {convFiltrees.map(conv => (
                <Pressable
                    key={conv.interlocuteur_id}
                    style={[cs.convCard, conv.non_lus > 0 && cs.convCardNonLue]}
                    onPress={() => ouvrirConversation(conv)}
                >
                    <View style={[cs.avatar, { backgroundColor: couleur(conv.interlocuteur_nom) }]}>
                    <Text style={cs.avatarTexte}>{initiales(conv.interlocuteur_nom)}</Text>
                    </View>
                    <View style={cs.convInfo}>
                    <Text style={cs.convNom}>{conv.interlocuteur_nom}</Text>
                    <Text style={cs.convDernier} numberOfLines={1}>
                        {conv.est_moi ? "Vous : " : ""}{conv.dernier_message}
                    </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 6 }}>
                    <Text style={cs.convDate}>{formatDate(conv.date_dernier)}</Text>
                    {conv.non_lus > 0 && (
                        <View style={cs.badgeNonLu}>
                        <Text style={cs.badgeNonLuTexte}>{conv.non_lus}</Text>
                        </View>
                    )}
                    </View>
                </Pressable>
                ))}
            </ScrollView>
            )}

            <Pressable style={cs.fab} onPress={() => setVue("nouvelle")}>
            <Text style={cs.fabTexte}>✏️ Nouveau</Text>
            </Pressable>
        </SafeAreaView>
        );
    }

    // ── MESSAGE DE GROUPE ──────────────────────────────────────────────────────
    if (vue === "groupe") {
        return (
        <SafeAreaView style={cs.safe}>
            <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
            <View style={cs.chatHeader}>
                <Pressable onPress={() => setVue("conversations")} style={cs.retourBtn}>
                <Text style={cs.retourText}>‹</Text>
                </Pressable>
                <View style={[cs.chatHeaderAvatar, { backgroundColor: "#4F46E5" }]}>
                <Text style={cs.chatHeaderAvatarTexte}>📢</Text>
                </View>
                <View>
                <Text style={cs.chatHeaderNom}>Message de groupe</Text>
                <Text style={cs.chatHeaderSub}>
                    {responsables.length - 1} responsable{(responsables.length - 1) > 1 ? "s" : ""}
                </Text>
                </View>
            </View>

            <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
                <View style={{
                backgroundColor: "#EEF2FF", borderRadius: 14,
                padding: 14, marginBottom: 20, borderWidth: 0.5, borderColor: "#C7D2FE",
                }}>
                <Text style={{ fontSize: 13, color: "#4F46E5", fontWeight: "600", marginBottom: 4 }}>
                    📢 Ce message sera envoyé à :
                </Text>
                {autresResponsables.map(r => (
                    <Text key={r.id} style={{ fontSize: 13, color: "#1E293B", paddingVertical: 2 }}>
                    • {r.username}
                    </Text>
                ))}
                </View>
            </View>

            <View style={cs.saisieContainer}>
                <TextInput
                style={cs.saisieInput}
                value={texte}
                onChangeText={setTexte}
                placeholder="Écrire un message pour tout le groupe..."
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={1000}
                />
                <Pressable
                style={[cs.envoiBtn, !texte.trim() && cs.envoiBtnVide]}
                onPress={handleEnvoiGroupe}
                disabled={!texte.trim() || envoi}
                >
                <Text style={cs.envoiIcone}>{envoi ? "⏳" : "➤"}</Text>
                </Pressable>
            </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
        );
    }

    // ── NOUVEAU MESSAGE ────────────────────────────────────────────────────────
    if (vue === "nouvelle") {
        return (
        <SafeAreaView style={cs.safe}>
            <View style={cs.chatHeader}>
            <Pressable onPress={() => setVue("conversations")} style={cs.retourBtn}>
                <Text style={cs.retourText}>‹</Text>
            </Pressable>
            <View>
                <Text style={cs.chatHeaderNom}>Nouveau message</Text>
                <Text style={cs.chatHeaderSub}>Choisissez un destinataire</Text>
            </View>
            </View>

            <ScrollView>
            {/* Option groupe */}
            <Pressable
                style={[cs.destCard, { backgroundColor: "#EEF2FF" }]}
                onPress={() => setVue("groupe")}
            >
                <View style={[cs.avatar, { backgroundColor: "#4F46E5", width: 42, height: 42, borderRadius: 21 }]}>
                <Text style={[cs.avatarTexte, { fontSize: 20 }]}>📢</Text>
                </View>
                <View style={{ flex: 1 }}>
                <Text style={[cs.destNom, { color: "#4F46E5" }]}>Tout le groupe</Text>
                <Text style={cs.destRole}>Envoyer à tous les responsables</Text>
                </View>
            </Pressable>

            <Text style={cs.destTitre}>Responsables ({autresResponsables.length})</Text>
            {autresResponsables.map(r => {
                const dejaConversation = conversations.find(c => c.interlocuteur_id === r.id);
                return (
                <Pressable
                    key={r.id}
                    style={cs.destCard}
                    onPress={() => ouvrirNouvelleConversation(r)}
                >
                    <View style={[cs.avatar, { backgroundColor: couleur(r.username), width: 42, height: 42, borderRadius: 21 }]}>
                    <Text style={[cs.avatarTexte, { fontSize: 15 }]}>{initiales(r.username)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                    <Text style={cs.destNom}>{r.username}</Text>
                    <Text style={cs.destRole}>{r.role}</Text>
                    </View>
                    {dejaConversation && (
                    <Text style={{ fontSize: 12, color: "#4F46E5" }}>Conversation existante</Text>
                    )}
                </Pressable>
                );
            })}
            </ScrollView>
        </SafeAreaView>
        );
    }

    // ── CHAT ───────────────────────────────────────────────────────────────────
    if (vue === "chat" && interlocuteur) {
        const groupes = groupesParDate();
        return (
        <SafeAreaView style={cs.safe}>
            <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={0}
            >
            {/* ✅ Header avec bouton retour vers la liste */}
            <View style={cs.chatHeader}>
                <Pressable
                onPress={() => {
                    setVue("conversations");
                    setMessages([]);
                    chargerDonnees();
                }}
                style={cs.retourBtn}
                >
                <Text style={cs.retourText}>‹</Text>
                </Pressable>
                <View style={[cs.chatHeaderAvatar, { backgroundColor: couleur(interlocuteur.nom) }]}>
                <Text style={cs.chatHeaderAvatarTexte}>{initiales(interlocuteur.nom)}</Text>
                </View>
                <View>
                <Text style={cs.chatHeaderNom}>{interlocuteur.nom}</Text>
                <Text style={cs.chatHeaderSub}>
                    {messages.length} message{messages.length > 1 ? "s" : ""}
                </Text>
                </View>
            </View>

            {chargement ? (
                <ActivityIndicator style={{ flex: 1 }} color="#07074C" />
            ) : (
                <ScrollView
                ref={scrollRef}
                style={cs.messagesListe}
                contentContainerStyle={cs.messagesContenu}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
                >
                {groupes.length === 0 && (
                    <Text style={[cs.videTexte, { marginTop: 60 }]}>
                    Commencez la conversation !
                    </Text>
                )}
                {groupes.map(groupe => (
                    <View key={groupe.date}>
                    <View style={cs.dateSeparateur}>
                        <Text style={cs.dateSeparateurTexte}>{groupe.date}</Text>
                    </View>
                    {groupe.messages.map(msg => {
                        const estMoi = msg.expediteur === profil?.id ||
                        msg.expediteur_nom === profil?.username;
                        return (
                        <View
                            key={msg.id}
                            style={[
                            cs.bulleContainer,
                            estMoi ? cs.bulleContainerMoi : cs.bulleContainerAutre,
                            ]}
                        >
                            <View style={[cs.bulle, estMoi ? cs.bulleMoi : cs.bulleAutre]}>
                            <Text style={[cs.bulleTexte, estMoi ? cs.bulleTexteMoi : cs.bulleTexteAutre]}>
                                {msg.contenu}
                            </Text>
                            <Text style={[cs.bulleDate, estMoi ? cs.bulleDateMoi : cs.bulleDateAutre]}>
                                {formatHeure(msg.date_envoi)}
                            </Text>
                            {estMoi && (
                                <Text style={cs.bulleLu}>{msg.lu ? "✓✓" : "✓"}</Text>
                            )}
                            </View>
                        </View>
                        );
                    })}
                    </View>
                ))}
                </ScrollView>
            )}

            <View style={cs.saisieContainer}>
                <TextInput
                style={cs.saisieInput}
                value={texte}
                onChangeText={setTexte}
                placeholder="Écrire un message..."
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={1000}
                />
                <Pressable
                style={[cs.envoiBtn, !texte.trim() && cs.envoiBtnVide]}
                onPress={handleEnvoi}
                disabled={!texte.trim() || envoi}
                >
                <Text style={cs.envoiIcone}>{envoi ? "⏳" : "➤"}</Text>
                </Pressable>
            </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
        );
    }

    return null;
    }