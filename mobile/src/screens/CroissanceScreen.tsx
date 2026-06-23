import { useEffect, useState } from "react";
    import {
    View, Text, ScrollView, Pressable,
    ActivityIndicator, SafeAreaView,
    } from "react-native";
    import { getStatsCroissance } from "../services/croissance.service";
    import { api } from "../services/api";
    import { crs } from "../styles/croissance.styles";

    type Stats = {
    mois: string[];
    nouveaux_membres: number[];
    total_membres: number[];
    taux_presence: number[];
    visiteurs: number[];
    resume: {
        total_actifs: number;
        total_inactifs: number;
        nouveaux_ce_mois: number;
        taux_moyen: number;
    };
    };

    export default function CroissanceScreen() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [chargement, setChargement] = useState(true);
    const [onglet, setOnglet] = useState<"membres" | "presences" | "visiteurs">("membres");
    const [communautes, setCommunautes] = useState<{ id: number; nom: string }[]>([]);
    const [communauteActive, setCommunauteActive] = useState<number | undefined>();

    useEffect(() => { chargerDonnees(); }, []);
    useEffect(() => { if (communauteActive !== undefined) chargerStats(); }, [communauteActive]);

    async function chargerDonnees() {
        try {
        const cultes = await api.get("/communautes/").then(r => r.data).catch(() => []);
        setCommunautes(cultes);
        const cid = cultes.length > 0 ? cultes[0].id : undefined;
        setCommunauteActive(cid);
        } catch {
        setChargement(false);
        }
    }

    async function chargerStats() {
        setChargement(true);
        try {
        const data = await getStatsCroissance(communauteActive);
        setStats(data);
        } catch {
        } finally {
        setChargement(false);
        }
    }

    // ── Graphique barres ────────────────────────────────────────────────────────
    function GraphiqueBarres({ donnees, couleur, unite = "" }: { donnees: number[]; couleur: string; unite?: string }) {
        const max = Math.max(...donnees, 1);
        const hauteurMax = 130;
        return (
        <View>
            <View style={{ flexDirection: "row", alignItems: "flex-end", height: hauteurMax + 20, gap: 4 }}>
            {donnees.map((val, i) => {
                const hauteur = max > 0 ? Math.max((val / max) * hauteurMax, val > 0 ? 4 : 0) : 0;
                return (
                <View key={i} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
                    {val > 0 && (
                    <Text style={{ fontSize: 8, color: couleur, fontWeight: "700", marginBottom: 2 }}>
                        {val}{unite}
                    </Text>
                    )}
                    <View style={{ width: "100%", height: hauteur, backgroundColor: couleur, borderRadius: 3, opacity: 0.85 }} />
                </View>
                );
            })}
            </View>
            {stats && (
            <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
                {stats.mois.map((m, i) => (
                <Text key={i} style={{ flex: 1, fontSize: 8, color: "#64748B", textAlign: "center" }}>{m}</Text>
                ))}
            </View>
            )}
        </View>
        );
    }

    // ── Graphique taux ──────────────────────────────────────────────────────────
    function GraphiqueTaux({ donnees }: { donnees: number[] }) {
        const max = 100;
        const hauteurMax = 130;
        const nonZero = donnees.filter(d => d > 0);
        const moyenne = nonZero.length > 0 ? Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length) : 0;
        return (
        <View>
            <View style={{ position: "relative", height: hauteurMax + 20 }}>
            {[100, 75, 50, 25].map(niveau => (
                <View key={niveau} style={{ position: "absolute", top: hauteurMax - (niveau / max) * hauteurMax, left: 0, right: 0, flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 8, color: "#CBD5E0", width: 22 }}>{niveau}%</Text>
                <View style={{ flex: 1, height: 0.5, backgroundColor: "#E2E8F0" }} />
                </View>
            ))}
            <View style={{ flexDirection: "row", alignItems: "flex-end", height: hauteurMax + 20, gap: 4, paddingLeft: 24 }}>
                {donnees.map((val, i) => {
                const hauteur = val > 0 ? Math.max((val / max) * hauteurMax, 4) : 0;
                const couleur = val >= 70 ? "#065F46" : val >= 50 ? "#854F0B" : "#EF4444";
                return (
                    <View key={i} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
                    {val > 0 && <Text style={{ fontSize: 8, color: couleur, fontWeight: "700", marginBottom: 2 }}>{val}%</Text>}
                    <View style={{ width: "100%", height: hauteur, backgroundColor: couleur, borderRadius: 3, opacity: 0.85 }} />
                    </View>
                );
                })}
            </View>
            </View>
            {stats && (
            <View style={{ flexDirection: "row", gap: 4, marginTop: 4, paddingLeft: 24 }}>
                {stats.mois.map((m, i) => (
                <Text key={i} style={{ flex: 1, fontSize: 8, color: "#64748B", textAlign: "center" }}>{m}</Text>
                ))}
            </View>
            )}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
            {[
                { couleur: "#065F46", label: "≥ 70% Excellent" },
                { couleur: "#854F0B", label: "50-70% Moyen" },
                { couleur: "#EF4444", label: "< 50% Faible" },
            ].map(l => (
                <View key={l.label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: l.couleur }} />
                <Text style={{ fontSize: 10, color: "#64748B" }}>{l.label}</Text>
                </View>
            ))}
            <Text style={{ fontSize: 11, color: "#4F46E5", fontWeight: "700" }}>Moyenne : {moyenne}%</Text>
            </View>
        </View>
        );
    }

    return (
        <SafeAreaView style={[crs.safe, { flex: 1 }]}>

        {/* ✅ Sélecteur de culte — flex: 0 pour ne pas prendre de place inutile */}
        {communautes.length > 1 && (
            <View style={[crs.culteRow, { flexGrow: 0 }]}>
            {communautes.map(c => (
                <Pressable
                key={c.id}
                style={[crs.cultePill, communauteActive === c.id && crs.cultePillActif]}
                onPress={() => setCommunauteActive(c.id)}
                >
                <Text style={[crs.cultePillTexte, communauteActive === c.id && crs.cultePillTexteActif]}>
                    {c.nom.replace("Culte du ", "")}
                </Text>
                </Pressable>
            ))}
            </View>
        )}

        {/* ✅ FIX Onglets — flexGrow: 0 + paddingLeft pour ne pas couper le premier onglet */}
        <View style={{
            backgroundColor: "#fff",
            borderBottomWidth: 0.5,
            borderBottomColor: "#E2E8F0",
            flexGrow: 0,
        }}>
            <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: "row", paddingHorizontal: 16, gap: 4 }}
            >
            {[
                { id: "membres",   label: "👥 Membres" },
                { id: "presences", label: "✅ Présences" },
                { id: "visiteurs", label: "🆕 Visiteurs" },
            ].map(o => (
                <Pressable
                key={o.id}
                style={[crs.onglet, onglet === o.id && crs.ongletActif]}
                onPress={() => setOnglet(o.id as any)}
                >
                <Text style={[crs.ongletTexte, onglet === o.id && crs.ongletTexteActif]}>
                    {o.label}
                </Text>
                </Pressable>
            ))}
            </ScrollView>
        </View>

        {/* ✅ Contenu — flex: 1 pour prendre l'espace restant */}
        {chargement ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />
        ) : !stats ? (
            <Text style={crs.videTexte}>Impossible de charger les statistiques.</Text>
        ) : (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>

            {/* Résumé global */}
            <View style={crs.resumeGrid}>
                <View style={crs.resumeCard}>
                <Text style={crs.resumeIcone}>✅</Text>
                <Text style={crs.resumeValeur}>{stats.resume.total_actifs}</Text>
                <Text style={crs.resumeLabel}>Membres actifs</Text>
                </View>
                <View style={crs.resumeCard}>
                <Text style={crs.resumeIcone}>🆕</Text>
                <Text style={[crs.resumeValeur, { color: stats.resume.nouveaux_ce_mois > 0 ? "#065F46" : "#64748B" }]}>
                    +{stats.resume.nouveaux_ce_mois}
                </Text>
                <Text style={crs.resumeLabel}>Ce mois-ci</Text>
                <Text style={[crs.resumeTendance, stats.resume.nouveaux_ce_mois > 0 ? crs.tendanceHausse : crs.tendanceStable]}>
                    {stats.resume.nouveaux_ce_mois > 0 ? "↗ Croissance" : "→ Stable"}
                </Text>
                </View>
                <View style={crs.resumeCard}>
                <Text style={crs.resumeIcone}>📊</Text>
                <Text style={[crs.resumeValeur, {
                    color: stats.resume.taux_moyen >= 70 ? "#065F46" :
                    stats.resume.taux_moyen >= 50 ? "#854F0B" : "#EF4444",
                }]}>
                    {stats.resume.taux_moyen}%
                </Text>
                <Text style={crs.resumeLabel}>Taux moyen</Text>
                </View>
                <View style={crs.resumeCard}>
                <Text style={crs.resumeIcone}>⏸</Text>
                <Text style={[crs.resumeValeur, { color: "#991B1B" }]}>{stats.resume.total_inactifs}</Text>
                <Text style={crs.resumeLabel}>Inactifs</Text>
                </View>
            </View>

            {/* ── MEMBRES ──────────────────────────────────────────────────── */}
            {onglet === "membres" && (
                <>
                <View style={crs.section}>
                    <Text style={crs.sectionTitre}>Nouveaux membres par mois</Text>
                    <Text style={crs.sectionSub}>12 derniers mois</Text>
                    <View style={{ height: 12 }} />
                    <GraphiqueBarres donnees={stats.nouveaux_membres} couleur="#4F46E5" />
                </View>
                <View style={crs.section}>
                    <Text style={crs.sectionTitre}>Total membres cumulatif</Text>
                    <Text style={crs.sectionSub}>Évolution du nombre total</Text>
                    <View style={{ height: 12 }} />
                    <GraphiqueBarres donnees={stats.total_membres} couleur="#07074C" />
                </View>
                <View style={crs.section}>
                    <Text style={crs.sectionTitre}>Détail mensuel</Text>
                    <View style={crs.tableauHeader}>
                    <Text style={[crs.tableauHeaderTexte, { flex: 2 }]}>Mois</Text>
                    <Text style={[crs.tableauHeaderTexte, { flex: 1, textAlign: "center" }]}>Nouveaux</Text>
                    <Text style={[crs.tableauHeaderTexte, { flex: 1, textAlign: "right" }]}>Total</Text>
                    </View>
                    {stats.mois.map((mois, i) => (
                    <View key={i} style={crs.tableauRow}>
                        <Text style={[crs.tableauTexte, { flex: 2 }]}>{mois}</Text>
                        <Text style={[crs.tableauValeur, { flex: 1, textAlign: "center", color: stats.nouveaux_membres[i] > 0 ? "#065F46" : "#94A3B8" }]}>
                        {stats.nouveaux_membres[i] > 0 ? `+${stats.nouveaux_membres[i]}` : "—"}
                        </Text>
                        <Text style={[crs.tableauValeur, { flex: 1, textAlign: "right" }]}>
                        {stats.total_membres[i] > 0 ? stats.total_membres[i] : "—"}
                        </Text>
                    </View>
                    ))}
                </View>
                </>
            )}

            {/* ── PRÉSENCES ────────────────────────────────────────────────── */}
            {onglet === "presences" && (
                <>
                <View style={crs.section}>
                    <Text style={crs.sectionTitre}>Taux de présence par mois</Text>
                    <Text style={crs.sectionSub}>12 derniers mois</Text>
                    <View style={{ height: 12 }} />
                    <GraphiqueTaux donnees={stats.taux_presence} />
                </View>
                <View style={crs.section}>
                    <Text style={crs.sectionTitre}>Détail mensuel</Text>
                    <View style={crs.tableauHeader}>
                    <Text style={[crs.tableauHeaderTexte, { flex: 2 }]}>Mois</Text>
                    <Text style={[crs.tableauHeaderTexte, { flex: 1, textAlign: "right" }]}>Taux</Text>
                    </View>
                    {stats.mois.map((mois, i) => {
                    const taux = stats.taux_presence[i];
                    const couleur = taux >= 70 ? "#065F46" : taux >= 50 ? "#854F0B" : taux > 0 ? "#EF4444" : "#94A3B8";
                    return (
                        <View key={i} style={crs.tableauRow}>
                        <Text style={[crs.tableauTexte, { flex: 2 }]}>{mois}</Text>
                        <View style={{ flex: 1, alignItems: "flex-end" }}>
                            <Text style={[crs.tableauTaux, { color: couleur }]}>{taux > 0 ? `${taux}%` : "—"}</Text>
                        </View>
                        </View>
                    );
                    })}
                </View>
                </>
            )}

            {/* ── VISITEURS ────────────────────────────────────────────────── */}
            {onglet === "visiteurs" && (
                <>
                <View style={crs.section}>
                    <Text style={crs.sectionTitre}>Visiteurs par mois</Text>
                    <Text style={crs.sectionSub}>12 derniers mois</Text>
                    <View style={{ height: 12 }} />
                    <GraphiqueBarres donnees={stats.visiteurs} couleur="#BE185D" />
                </View>
                <View style={crs.section}>
                    <Text style={crs.sectionTitre}>Détail mensuel</Text>
                    <View style={crs.tableauHeader}>
                    <Text style={[crs.tableauHeaderTexte, { flex: 2 }]}>Mois</Text>
                    <Text style={[crs.tableauHeaderTexte, { flex: 1, textAlign: "right" }]}>Visiteurs</Text>
                    </View>
                    {stats.mois.map((mois, i) => (
                    <View key={i} style={crs.tableauRow}>
                        <Text style={[crs.tableauTexte, { flex: 2 }]}>{mois}</Text>
                        <Text style={[crs.tableauValeur, { flex: 1, textAlign: "right", color: stats.visiteurs[i] > 0 ? "#BE185D" : "#94A3B8" }]}>
                        {stats.visiteurs[i] > 0 ? stats.visiteurs[i] : "—"}
                        </Text>
                    </View>
                    ))}
                </View>
                </>
            )}

            </ScrollView>
        )}
        </SafeAreaView>
    );
    }