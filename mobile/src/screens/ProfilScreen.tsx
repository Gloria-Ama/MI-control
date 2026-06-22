    import { useEffect, useState } from "react";
    import {
    View, Text, TextInput, ScrollView, Pressable,
    Alert, ActivityIndicator, SafeAreaView,
    } from "react-native";
    import { getProfilConnecte, changerMotDePasse, updateProfil } from "../services/profil.service";
    import { ps } from "../styles/profil.styles";

    type Profil = {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    communaute_culte: number | null;
    communaute_nom?: string;
    mot_de_passe_change: boolean;
    actif: boolean;
    };

    const ROLE_LABELS: Record<string, string> = {
    pasteur: "Pasteur",
    administrateur: "Administrateur",
    tresoriere: "Trésorière",
    secretaire: "Secrétaire",
    responsable_accueil: "Resp. Accueil",
    responsable: "Resp. Département",
    };

    export default function ProfilScreen({ onRetour }: { onRetour?: () => void }) {
    const [profil, setProfil] = useState<Profil | null>(null);
    const [chargement, setChargement] = useState(true);
    const [onglet, setOnglet] = useState<"info" | "mdp" | "modifier">("info");
    const [sauvegarde, setSauvegarde] = useState(false);

    // Formulaire modifier infos
    const [formEmail, setFormEmail] = useState("");
    const [formPrenom, setFormPrenom] = useState("");
    const [formNom, setFormNom] = useState("");

    // Formulaire mot de passe
    const [ancienMdp, setAncienMdp] = useState("");
    const [nouveauMdp, setNouveauMdp] = useState("");
    const [confirmerMdp, setConfirmerMdp] = useState("");
    const [erreurMdp, setErreurMdp] = useState("");
    const [succesMdp, setSuccesMdp] = useState("");

    useEffect(() => { chargerProfil(); }, []);

    async function chargerProfil() {
        setChargement(true);
        try {
        const data = await getProfilConnecte();
        setProfil(data);
        setFormEmail(data.email ?? "");
        setFormPrenom(data.first_name ?? "");
        setFormNom(data.last_name ?? "");
        } finally {
        setChargement(false);
        }
    }

    async function sauvegarderInfos() {
        setSauvegarde(true);
        try {
        await updateProfil({
            email: formEmail.trim(),
            first_name: formPrenom.trim(),
            last_name: formNom.trim(),
        });
        await chargerProfil();
        setOnglet("info");
        Alert.alert("✅ Profil mis à jour !");
        } catch {
        Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
        } finally {
        setSauvegarde(false);
        }
    }

    async function sauvegarderMotDePasse() {
        setErreurMdp("");
        setSuccesMdp("");

        if (!ancienMdp || !nouveauMdp || !confirmerMdp) {
        setErreurMdp("Tous les champs sont obligatoires.");
        return;
        }
        if (nouveauMdp.length < 6) {
        setErreurMdp("Le nouveau mot de passe doit avoir au moins 6 caractères.");
        return;
        }
        if (nouveauMdp !== confirmerMdp) {
        setErreurMdp("Les mots de passe ne correspondent pas.");
        return;
        }

        setSauvegarde(true);
        try {
        await changerMotDePasse(ancienMdp, nouveauMdp);
        setAncienMdp("");
        setNouveauMdp("");
        setConfirmerMdp("");
        setSuccesMdp("✅ Mot de passe changé avec succès !");
        await chargerProfil();
        } catch (error: any) {
        const msg = error?.response?.data?.detail ?? "Impossible de changer le mot de passe.";
        setErreurMdp(msg);
        } finally {
        setSauvegarde(false);
        }
    }

    function initiales(nom: string) {
        return nom.split(/[\s._]/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }

    if (chargement) {
        return <ActivityIndicator style={{ marginTop: 60 }} color="#07074C" size="large" />;
    }

    if (!profil) return null;

    return (
        <SafeAreaView style={ps.safe}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

            {/* Header */}
            <View style={ps.header}>
            {onRetour && (
                <Pressable onPress={onRetour} style={{ alignSelf: "flex-start", marginBottom: 12 }}>
                <Text style={{ color: "#94A3B8", fontSize: 15 }}>‹ Retour</Text>
                </Pressable>
            )}
            <View style={ps.avatarGrand}>
                <Text style={ps.avatarTexte}>{initiales(profil.username)}</Text>
            </View>
            <Text style={ps.nom}>
                {profil.first_name && profil.last_name
                ? `${profil.first_name} ${profil.last_name}`
                : profil.username}
            </Text>
            <Text style={ps.role}>{ROLE_LABELS[profil.role] ?? profil.role}</Text>
            <View style={ps.badgeRole}>
                <Text style={ps.badgeRoleTexte}>@{profil.username}</Text>
            </View>
            </View>

            {/* Alerte mot de passe non changé */}
            {!profil.mot_de_passe_change && (
            <View style={ps.alerteMdp}>
                <Text style={{ fontSize: 18 }}>⚠️</Text>
                <Text style={ps.alerteMdpTexte}>
                Vous n'avez pas encore changé votre mot de passe temporaire.
                </Text>
            </View>
            )}

            {/* Onglets */}
            <View style={{
            flexDirection: "row", marginHorizontal: 16, marginTop: 16,
            backgroundColor: "#fff", borderRadius: 12,
            borderWidth: 0.5, borderColor: "#E2E8F0", overflow: "hidden",
            }}>
            {[
                { id: "info", label: "👤 Infos" },
                { id: "modifier", label: "✏️ Modifier" },
                { id: "mdp", label: "🔑 Mot de passe" },
            ].map(o => (
                <Pressable
                key={o.id}
                style={{
                    flex: 1, paddingVertical: 12, alignItems: "center",
                    backgroundColor: onglet === o.id ? "#07074C" : "#fff",
                }}
                onPress={() => setOnglet(o.id as any)}
                >
                <Text style={{
                    fontSize: 12, fontWeight: "700",
                    color: onglet === o.id ? "#fff" : "#64748B",
                }}>
                    {o.label}
                </Text>
                </Pressable>
            ))}
            </View>

            {/* ── INFOS ───────────────────────────────────────────────────────── */}
            {onglet === "info" && (
            <View style={ps.section}>
                <Text style={ps.sectionTitre}>Informations du compte</Text>
                {[
                { i: "👤", l: "Identifiant", v: profil.username },
                { i: "✉️", l: "Email", v: profil.email || "—" },
                { i: "🎭", l: "Rôle", v: ROLE_LABELS[profil.role] ?? profil.role },
                { i: "🔐", l: "Mot de passe", v: profil.mot_de_passe_change ? "✅ Changé" : "⚠️ Temporaire" },
                { i: "🔘", l: "Statut", v: profil.actif ? "✅ Actif" : "❌ Inactif" },
                ].map(row => (
                <View key={row.l} style={ps.infoRow}>
                    <Text style={ps.infoIcone}>{row.i}</Text>
                    <Text style={ps.infoLabel}>{row.l}</Text>
                    <Text style={ps.infoValeur}>{row.v}</Text>
                </View>
                ))}
            </View>
            )}

            {/* ── MODIFIER INFOS ──────────────────────────────────────────────── */}
            {onglet === "modifier" && (
            <View style={ps.section}>
                <Text style={ps.sectionTitre}>Modifier mes informations</Text>

                <Text style={ps.champLabel}>Prénom</Text>
                <TextInput
                style={ps.champInput}
                value={formPrenom}
                onChangeText={setFormPrenom}
                placeholder="Votre prénom"
                placeholderTextColor="#94A3B8"
                />

                <Text style={ps.champLabel}>Nom</Text>
                <TextInput
                style={ps.champInput}
                value={formNom}
                onChangeText={setFormNom}
                placeholder="Votre nom de famille"
                placeholderTextColor="#94A3B8"
                />

                <Text style={ps.champLabel}>Email</Text>
                <TextInput
                style={ps.champInput}
                value={formEmail}
                onChangeText={setFormEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="email@exemple.com"
                placeholderTextColor="#94A3B8"
                />

                <View style={{ backgroundColor: "#F1F5F9", borderRadius: 10, padding: 10, marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: "#64748B" }}>
                    ⚠️ L'identifiant (@{profil.username}) ne peut pas être modifié.
                </Text>
                </View>

                <Pressable
                style={[ps.btnPrimaire, sauvegarde && { opacity: 0.6 }]}
                onPress={sauvegarderInfos}
                disabled={sauvegarde}
                >
                {sauvegarde
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={ps.btnPrimaireTexte}>Enregistrer</Text>
                }
                </Pressable>
            </View>
            )}

            {/* ── MOT DE PASSE ────────────────────────────────────────────────── */}
            {onglet === "mdp" && (
            <View style={ps.section}>
                <Text style={ps.sectionTitre}>Changer mon mot de passe</Text>

                <Text style={ps.champLabel}>Mot de passe actuel *</Text>
                <TextInput
                style={ps.champInput}
                value={ancienMdp}
                onChangeText={v => { setAncienMdp(v); setErreurMdp(""); setSuccesMdp(""); }}
                secureTextEntry
                placeholder="Votre mot de passe actuel"
                placeholderTextColor="#94A3B8"
                />

                <Text style={ps.champLabel}>Nouveau mot de passe *</Text>
                <TextInput
                style={[ps.champInput, erreurMdp ? ps.champInputErreur : null]}
                value={nouveauMdp}
                onChangeText={v => { setNouveauMdp(v); setErreurMdp(""); setSuccesMdp(""); }}
                secureTextEntry
                placeholder="Minimum 6 caractères"
                placeholderTextColor="#94A3B8"
                />

                <Text style={ps.champLabel}>Confirmer le nouveau mot de passe *</Text>
                <TextInput
                style={[
                    ps.champInput,
                    confirmerMdp.length > 0 && nouveauMdp !== confirmerMdp ? ps.champInputErreur : null,
                ]}
                value={confirmerMdp}
                onChangeText={v => { setConfirmerMdp(v); setErreurMdp(""); setSuccesMdp(""); }}
                secureTextEntry
                placeholder="Répétez le nouveau mot de passe"
                placeholderTextColor="#94A3B8"
                />

                {erreurMdp ? (
                <Text style={ps.champErreur}>⚠ {erreurMdp}</Text>
                ) : null}
                {succesMdp ? (
                <Text style={ps.champSucces}>{succesMdp}</Text>
                ) : null}

                <Pressable
                style={[ps.btnPrimaire, sauvegarde && { opacity: 0.6 }]}
                onPress={sauvegarderMotDePasse}
                disabled={sauvegarde}
                >
                {sauvegarde
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={ps.btnPrimaireTexte}>Changer le mot de passe</Text>
                }
                </Pressable>
            </View>
            )}
        </ScrollView>
        </SafeAreaView>
    );
    }