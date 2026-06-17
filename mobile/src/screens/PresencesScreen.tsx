    import { useEffect, useState } from "react";
    import {
    View, Text, TextInput, ScrollView, Pressable,
    Alert, ActivityIndicator, SafeAreaView,
    } from "react-native";
    import { getMembres } from "../services/membres.service";
    import { getDepartements } from "../services/departements.service";
    import { getPresences, enregistrerPresencesBulk } from "../services/presences.service";
    import { getVisiteurs, createVisiteur } from "../services/visiteurs.service";
    import { styles } from "../styles/presences.styles";

    type Membre = {
    id: number; nom: string; telephone: string;
    sexe: string; departement: number | null; departement_nom: string | null;
    };
    type Departement = { id: number; nom: string };
    type Visiteur = { id: number; nom: string; telephone: string; email: string; sexe: string };
    type Presence = { id: number; membre: number; date: string; present: boolean };
    type Vue = "pointage" | "stats" | "historique" | "visiteur";

    const SEXES = ["masculin", "feminin", "autre"];
    const SEXE_LABELS: Record<string, string> = { masculin: "Masculin", feminin: "Féminin", autre: "Autre" };
    const VISITEUR_VIDE = { nom: "", telephone: "", email: "", sexe: "" };

    export default function PresencesScreen({ nomCulte }: { nomCulte: string }) {
    const dateDuJour = new Date().toISOString().split("T")[0];

    const [membres, setMembres] = useState<Membre[]>([]);
    const [departements, setDepartements] = useState<Departement[]>([]);
    const [visiteurs, setVisiteurs] = useState<Visiteur[]>([]);
    const [presencesExistantes, setPresencesExistantes] = useState<Presence[]>([]);
    const [membresPresents, setMembresPresents] = useState<Set<number>>(new Set());

    const [vue, setVue] = useState<Vue>("pointage");
    const [chargement, setChargement] = useState(true);
    const [sauvegarde, setSauvegarde] = useState(false);
    const [recherche, setRecherche] = useState("");
    const [filtreDept, setFiltreDept] = useState<number | null>(null);

    const [formulaireVisiteur, setFormulaireVisiteur] = useState(VISITEUR_VIDE);
    const [ajoutVisiteurChargement, setAjoutVisiteurChargement] = useState(false);

    const [datesHistorique, setDatesHistorique] = useState<string[]>([]);
    const [dateOuverte, setDateOuverte] = useState<string | null>(null);
    const [presencesHistorique, setPresencesHistorique] = useState<Presence[]>([]);
    const [chargementHistorique, setChargementHistorique] = useState(false);

    useEffect(() => { chargerDonnees(); }, []);

    async function chargerDonnees() {
        setChargement(true);
        try {
        const [m, d, v, p] = await Promise.all([
            getMembres(), getDepartements(), getVisiteurs(), getPresences(dateDuJour),
        ]);
        setMembres(m); setDepartements(d); setVisiteurs(v); setPresencesExistantes(p);
        const dejaPresentIds = new Set<number>(
            p.filter((pr: Presence) => pr.present).map((pr: Presence) => pr.membre)
        );
        setMembresPresents(dejaPresentIds);
        } catch {
        Alert.alert("Erreur", "Impossible de charger les données.");
        } finally { setChargement(false); }
    }

    async function chargerHistorique() {
        setChargementHistorique(true);
        try {
        const toutes = await getPresences();
        const dates = [...new Set<string>(toutes.map((p: Presence) => p.date))].sort().reverse();
        setDatesHistorique(dates);
        setPresencesHistorique(toutes);
        } finally { setChargementHistorique(false); }
    }

    function togglePresence(id: number) {
        const nouveau = new Set(membresPresents);
        if (nouveau.has(id)) nouveau.delete(id); else nouveau.add(id);
        setMembresPresents(nouveau);
    }

    const membresFiltres = membres.filter(m =>
        m.nom.toLowerCase().includes(recherche.toLowerCase()) &&
        (filtreDept ? m.departement === filtreDept : true)
    );

    const nbPresents = membresPresents.size;
    const nbAbsents = membres.length - nbPresents;
    const taux = membres.length > 0 ? Math.round((nbPresents / membres.length) * 100) : 0;

    function initiales(nom: string) {
        return nom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    function couleur(nom: string) {
        const c = ["#07074C", "#4F46E5", "#0F6E56", "#854F0B", "#993C1D"];
        return c[nom.charCodeAt(0) % c.length];
    }
    function nomDept(id: number | null) {
        if (!id) return "Sans département";
        return departements.find(d => d.id === id)?.nom ?? "—";
    }

    async function sauvegarderPresences() {
        setSauvegarde(true);
        try {
        const payload = membres.map(m => ({
            membre: m.id, date: dateDuJour,
            present: membresPresents.has(m.id), communaute_culte: 1,
        }));
        await enregistrerPresencesBulk(payload);
        Alert.alert("✅ Succès", "Présences enregistrées !");
        setVue("stats");
        } catch {
        Alert.alert("Erreur", "Impossible d'enregistrer.");
        } finally { setSauvegarde(false); }
    }

    async function ajouterVisiteur() {
        if (!formulaireVisiteur.nom.trim() || !formulaireVisiteur.telephone.trim()) {
        Alert.alert("Champs requis", "Le nom et le téléphone sont obligatoires.");
        return;
        }
        setAjoutVisiteurChargement(true);
        try {
        await createVisiteur({ ...formulaireVisiteur, communaute_culte: 1, notes: "" });
        const v = await getVisiteurs();
        setVisiteurs(v);
        setFormulaireVisiteur(VISITEUR_VIDE);
        Alert.alert("✅ Visiteur ajouté !");
        } catch {
        Alert.alert("Erreur", "Impossible d'ajouter le visiteur.");
        } finally { setAjoutVisiteurChargement(false); }
    }

    // ── POINTAGE ───────────────────────────────────────────────────────────────
    if (vue === "pointage") {
        if (chargement) return <ActivityIndicator style={{ marginTop: 60 }} color="#07074C" />;
        return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{nbPresents} / {membres.length} présents</Text>
                <View style={styles.liveTag}><Text style={styles.liveTagText}>EN DIRECT</Text></View>
            </View>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${taux}%` as any }]} />
            </View>
            <View style={styles.statsRapides}>
                <View style={styles.statPill}><Text style={styles.statPillValeur}>{nbPresents}</Text><Text style={styles.statPillLabel}>Présents</Text></View>
                <View style={styles.statPill}><Text style={styles.statPillValeur}>{nbAbsents}</Text><Text style={styles.statPillLabel}>Absents</Text></View>
                <View style={styles.statPill}><Text style={styles.statPillValeur}>{visiteurs.length}</Text><Text style={styles.statPillLabel}>Visiteurs</Text></View>
                <View style={styles.statPill}><Text style={styles.statPillValeur}>{taux}%</Text><Text style={styles.statPillLabel}>Taux</Text></View>
            </View>
            </View>

            <View style={styles.searchBar}>
            <TextInput style={styles.searchInput} placeholder="Rechercher..." placeholderTextColor="#94A3B8" value={recherche} onChangeText={setRecherche} />
            <Pressable style={styles.toutBtn} onPress={() => setMembresPresents(new Set(membresFiltres.map(m => m.id)))}>
                <Text style={styles.toutBtnText}>Tout ✓</Text>
            </Pressable>
            <Pressable style={[styles.toutBtn, { backgroundColor: "#F1F5F9" }]} onPress={() => setMembresPresents(new Set())}>
                <Text style={[styles.toutBtnText, { color: "#475569" }]}>Effacer</Text>
            </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deptFiltreScroll} contentContainerStyle={{ gap: 6, paddingHorizontal: 12 }}>
            <Pressable style={[styles.deptPill, !filtreDept && styles.deptPillActif]} onPress={() => setFiltreDept(null)}>
                <Text style={[styles.deptPillText, !filtreDept && styles.deptPillTextActif]}>Tous</Text>
            </Pressable>
            {departements.map(d => (
                <Pressable key={d.id} style={[styles.deptPill, filtreDept === d.id && styles.deptPillActif]} onPress={() => setFiltreDept(filtreDept === d.id ? null : d.id)}>
                <Text style={[styles.deptPillText, filtreDept === d.id && styles.deptPillTextActif]}>{d.nom}</Text>
                </Pressable>
            ))}
            </ScrollView>

            <ScrollView style={styles.liste} contentContainerStyle={{ paddingBottom: 160 }}>
            {membresFiltres.map(m => {
                const present = membresPresents.has(m.id);
                return (
                <Pressable key={m.id} style={[styles.membreRow, present && styles.membreRowPresent]} onPress={() => togglePresence(m.id)}>
                    <View style={[styles.avatar, { backgroundColor: present ? "#065F46" : couleur(m.nom) }]}>
                    <Text style={styles.avatarText}>{initiales(m.nom)}</Text>
                    </View>
                    <View style={styles.membreInfo}>
                    <Text style={styles.membreNom}>{m.nom}</Text>
                    <Text style={styles.membreDept}>{nomDept(m.departement)}</Text>
                    </View>
                    <View style={[styles.checkBox, present && styles.checkBoxPresent]}>
                    <Text style={styles.checkText}>{present ? "✓" : ""}</Text>
                    </View>
                </Pressable>
                );
            })}
            </ScrollView>

            <View style={styles.bottomActions}>
            <Pressable style={styles.btnVisiteur} onPress={() => setVue("visiteur")}>
                <Text style={styles.btnVisiteurText}>+ Visiteur</Text>
            </Pressable>
            <Pressable style={styles.btnHistorique} onPress={() => { chargerHistorique(); setVue("historique"); }}>
                <Text style={styles.btnHistoriqueText}>Historique</Text>
            </Pressable>
            <Pressable style={[styles.btnSauvegarder, sauvegarde && { opacity: 0.6 }]} onPress={sauvegarderPresences} disabled={sauvegarde}>
                {sauvegarde ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSauvegarderText}>Enregistrer</Text>}
            </Pressable>
            </View>
        </SafeAreaView>
        );
    }

    // ── STATS ──────────────────────────────────────────────────────────────────
    if (vue === "stats") {
        const totalFemmes = membres.filter(m => m.sexe === "feminin").length;
        const totalHommes = membres.filter(m => m.sexe === "masculin").length;
        const femmesPresentes = [...membresPresents].filter(id => membres.find(m => m.id === id)?.sexe === "feminin").length;
        const hommesPresents = [...membresPresents].filter(id => membres.find(m => m.id === id)?.sexe === "masculin").length;

        return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <Pressable onPress={() => setVue("pointage")} style={styles.retourBtn}>
                <Text style={styles.retourText}>‹ Retour au pointage</Text>
            </Pressable>
            <Text style={styles.titrePage}>Statistiques du culte</Text>
            <Text style={styles.sousTitre}>{nomCulte} — {dateDuJour}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitre}>Résumé général</Text>
                <View style={styles.statsGrid}>
                <View style={styles.statCard}><Text style={styles.statCardValeur}>{membres.length}</Text><Text style={styles.statCardLabel}>Total membres</Text></View>
                <View style={styles.statCard}><Text style={[styles.statCardValeur, { color: "#065F46" }]}>{nbPresents}</Text><Text style={styles.statCardLabel}>Présents</Text></View>
                <View style={styles.statCard}><Text style={[styles.statCardValeur, { color: "#991B1B" }]}>{nbAbsents}</Text><Text style={styles.statCardLabel}>Absents</Text></View>
                <View style={styles.statCard}><Text style={[styles.statCardValeur, { color: "#0C447C" }]}>{visiteurs.length}</Text><Text style={styles.statCardLabel}>Visiteurs</Text></View>
                </View>
                <View style={styles.tauxContainer}>
                <Text style={styles.tauxLabel}>Taux de présence</Text>
                <Text style={styles.tauxValeur}>{taux}%</Text>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${taux}%` as any, backgroundColor: "#07074C" }]} />
                </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitre}>Par sexe</Text>
                {[
                { label: "Femmes", present: femmesPresentes, total: totalFemmes },
                { label: "Hommes", present: hommesPresents, total: totalHommes },
                ].map(({ label, present, total }) => {
                const t = total > 0 ? Math.round((present / total) * 100) : 0;
                return (
                    <View key={label} style={styles.sexeRow}>
                    <Text style={styles.sexeLabel}>{label}</Text>
                    <View style={styles.sexeBarBg}><View style={[styles.sexeBarFill, { width: `${t}%` as any }]} /></View>
                    <Text style={styles.sexeTaux}>{present}/{total}</Text>
                    </View>
                );
                })}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitre}>Par département</Text>
                {departements.map(d => {
                const membresDept = membres.filter(m => m.departement === d.id);
                if (membresDept.length === 0) return null;
                const presentsDept = membresDept.filter(m => membresPresents.has(m.id)).length;
                const tauxDept = Math.round((presentsDept / membresDept.length) * 100);
                return (
                    <View key={d.id} style={styles.deptStatRow}>
                    <View style={styles.deptStatInfo}>
                        <Text style={styles.deptStatNom}>{d.nom}</Text>
                        <Text style={styles.deptStatSub}>{presentsDept}/{membresDept.length} présents</Text>
                    </View>
                    <Text style={[styles.deptStatTaux, { color: tauxDept >= 70 ? "#065F46" : tauxDept >= 50 ? "#854F0B" : "#991B1B" }]}>{tauxDept}%</Text>
                    </View>
                );
                })}
            </View>

            {visiteurs.length > 0 && (
                <View style={styles.section}>
                <Text style={styles.sectionTitre}>Visiteurs ({visiteurs.length})</Text>
                {visiteurs.map(v => (
                    <View key={v.id} style={styles.visiteurRow}>
                    <Text style={styles.visiteurNom}>{v.nom}</Text>
                    <Text style={styles.visiteurInfo}>{v.telephone}</Text>
                    </View>
                ))}
                </View>
            )}
            </ScrollView>
        </SafeAreaView>
        );
    }

    // ── HISTORIQUE ─────────────────────────────────────────────────────────────
    if (vue === "historique") {
        return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <Pressable onPress={() => setVue("pointage")} style={styles.retourBtn}>
                <Text style={styles.retourText}>‹ Retour</Text>
            </Pressable>
            <Text style={styles.titrePage}>Historique des présences</Text>
            {chargementHistorique ? (
                <ActivityIndicator color="#07074C" style={{ marginTop: 40 }} />
            ) : datesHistorique.map(date => {
                const presencesDate = presencesHistorique.filter(p => p.date === date);
                const presents = presencesDate.filter(p => p.present);
                const absents = presencesDate.filter(p => !p.present);
                const tauxDate = presencesDate.length > 0 ? Math.round((presents.length / presencesDate.length) * 100) : 0;
                const ouvert = dateOuverte === date;
                return (
                <View key={date} style={styles.histCard}>
                    <Pressable style={styles.histHeader} onPress={() => setDateOuverte(ouvert ? null : date)}>
                    <View>
                        <Text style={styles.histDate}>{date}</Text>
                        <Text style={styles.histSub}>{presents.length} présents · {absents.length} absents</Text>
                    </View>
                    <View style={styles.histTauxBox}>
                        <Text style={styles.histTaux}>{tauxDate}%</Text>
                        <Text style={styles.histChevron}>{ouvert ? "▲" : "▼"}</Text>
                    </View>
                    </Pressable>
                    {ouvert && (
                    <View style={styles.histDetail}>
                        <Text style={styles.histSousTitre}>✅ Présents ({presents.length})</Text>
                        {presents.map(p => {
                        const m = membres.find(mb => mb.id === p.membre);
                        return <Text key={p.id} style={styles.histNom}>{m?.nom ?? "Inconnu"}</Text>;
                        })}
                        <Text style={[styles.histSousTitre, { marginTop: 10 }]}>❌ Absents ({absents.length})</Text>
                        {absents.map(p => {
                        const m = membres.find(mb => mb.id === p.membre);
                        return <Text key={p.id} style={styles.histNom}>{m?.nom ?? "Inconnu"}</Text>;
                        })}
                    </View>
                    )}
                </View>
                );
            })}
            </ScrollView>
        </SafeAreaView>
        );
    }

    // ── VISITEUR ───────────────────────────────────────────────────────────────
    if (vue === "visiteur") {
        return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <Pressable onPress={() => setVue("pointage")} style={styles.retourBtn}>
                <Text style={styles.retourText}>‹ Retour</Text>
            </Pressable>
            <Text style={styles.titrePage}>Ajouter un visiteur</Text>

            {visiteurs.length > 0 && (
                <View style={styles.section}>
                <Text style={styles.sectionTitre}>Visiteurs du jour ({visiteurs.length})</Text>
                {visiteurs.map(v => (
                    <View key={v.id} style={styles.visiteurRow}>
                    <Text style={styles.visiteurNom}>{v.nom}</Text>
                    <Text style={styles.visiteurInfo}>{v.telephone}</Text>
                    </View>
                ))}
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitre}>Nouveau visiteur</Text>
                <Text style={styles.champLabel}>Nom complet *</Text>
                <TextInput style={styles.champInput} value={formulaireVisiteur.nom} onChangeText={v => setFormulaireVisiteur({ ...formulaireVisiteur, nom: v })} placeholder="Nom et prénom" placeholderTextColor="#94A3B8" />
                <Text style={styles.champLabel}>Téléphone *</Text>
                <TextInput style={styles.champInput} value={formulaireVisiteur.telephone} onChangeText={v => setFormulaireVisiteur({ ...formulaireVisiteur, telephone: v })} keyboardType="phone-pad" placeholder="06 12 34 56 78" placeholderTextColor="#94A3B8" />
                <Text style={styles.champLabel}>Email</Text>
                <TextInput style={styles.champInput} value={formulaireVisiteur.email} onChangeText={v => setFormulaireVisiteur({ ...formulaireVisiteur, email: v })} keyboardType="email-address" autoCapitalize="none" placeholder="email@exemple.com" placeholderTextColor="#94A3B8" />
                <Text style={styles.champLabel}>Sexe</Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                {SEXES.map(s => (
                    <Pressable key={s} style={[styles.choixBtn, formulaireVisiteur.sexe === s && styles.choixBtnActif]} onPress={() => setFormulaireVisiteur({ ...formulaireVisiteur, sexe: s })}>
                    <Text style={[styles.choixBtnText, formulaireVisiteur.sexe === s && styles.choixBtnTextActif]}>{SEXE_LABELS[s]}</Text>
                    </Pressable>
                ))}
                </View>
                <Pressable style={[styles.btnSauvegarder, ajoutVisiteurChargement && { opacity: 0.6 }]} onPress={ajouterVisiteur} disabled={ajoutVisiteurChargement}>
                {ajoutVisiteurChargement ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSauvegarderText}>Enregistrer le visiteur</Text>}
                </Pressable>
            </View>
            </ScrollView>
        </SafeAreaView>
        );
    }

    return null;
    }