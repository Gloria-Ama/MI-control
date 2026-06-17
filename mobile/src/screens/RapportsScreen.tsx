    import { useEffect, useState } from "react";
    import {
    View, Text, ScrollView, Pressable,
    ActivityIndicator, SafeAreaView,
    } from "react-native";
    import { getMembres, getMembresAbsents } from "../services/membres.service";
    import { getPresences } from "../services/presences.service";
    import { getVisiteurs } from "../services/visiteurs.service";
    import { api } from "../services/api";
    import { r } from "../styles/rapports.styles";

    export default function RapportsScreen() {
    const [chargement, setChargement] = useState(true);
    const [onglet, setOnglet] = useState<"general" | "presences" | "absences" | "visiteurs">("general");
    const [membres, setMembres] = useState<any[]>([]);
    const [absents, setAbsents] = useState<any[]>([]);
    const [visiteurs, setVisiteurs] = useState<any[]>([]);
    const [departements, setDepartements] = useState<any[]>([]);
    const [presences, setPresences] = useState<any[]>([]);

    useEffect(() => { chargerDonnees(); }, []);

    async function chargerDonnees() {
        setChargement(true);
        try {
        const cultes = await api.get("/communautes/").then(res => res.data).catch(() => []);
        const cid = cultes.length > 0 ? cultes[0].id : undefined;

        const [m, ab, v, dep, p] = await Promise.all([
            getMembres({ communaute_culte: cid }).catch(() => []),
            getMembresAbsents(3).catch(() => []),
            getVisiteurs().catch(() => []),
            api.get(cid ? `/departements/?communaute_culte=${cid}` : "/departements/")
            .then(res => res.data).catch(() => []),
            getPresences().catch(() => []),
        ]);

        setMembres(Array.isArray(m) ? m : []);
        setAbsents(Array.isArray(ab) ? ab : []);
        setVisiteurs(Array.isArray(v) ? v : []);
        setDepartements(Array.isArray(dep) ? dep : []);
        setPresences(Array.isArray(p) ? p : []);
        } finally {
        setChargement(false);
        }
    }

    const totalMembres = membres.length;
    const membresActifs = membres.filter(m => m.statut === "actif").length;
    const membresInactifs = membres.filter(m => m.statut === "inactif").length;
    const membresFemmes = membres.filter(m => m.sexe === "feminin").length;
    const membresHommes = membres.filter(m => m.sexe === "masculin").length;
    const visiteursNouveaux = visiteurs.filter(v => v.statut === "nouveau").length;
    const visiteursIntegres = visiteurs.filter(v =>
        v.statut === "integre" || v.statut === "converti_membre"
    ).length;

    const datesUniques = [...new Set(presences.map((p: any) => p.date))].sort().reverse();
    const dernierCulte = datesUniques[0];
    const presencesDernierCulte = presences.filter((p: any) => p.date === dernierCulte);
    const presentsDernierCulte = presencesDernierCulte.filter((p: any) => p.present).length;
    const tauxDernierCulte = presencesDernierCulte.length > 0
        ? Math.round((presentsDernierCulte / presencesDernierCulte.length) * 100) : 0;

    function initiales(nom: string) {
        return nom.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    }

    function Barre({ valeur, max, couleur = "#07074C" }: { valeur: number; max: number; couleur?: string }) {
        const pct = max > 0 ? Math.round((valeur / max) * 100) : 0;
        return (
        <View style={r.barreContainer}>
            <View style={[r.barreFill, { width: `${pct}%` as any, backgroundColor: couleur }]} />
        </View>
        );
    }

    function StatBox({ icone, label, valeur, couleur }: {
        icone: string; label: string; valeur: number | string; couleur?: string;
    }) {
        return (
        <View style={r.statBox}>
            <Text style={r.statIcone}>{icone}</Text>
            <Text style={[r.statValeur, couleur ? { color: couleur } : {}]}>{valeur}</Text>
            <Text style={r.statLabel}>{label}</Text>
        </View>
        );
    }

    return (
        <SafeAreaView style={r.safe}>

        <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={{ backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0" }}
            contentContainerStyle={{ flexDirection: "row", paddingHorizontal: 8 }}
        >
            {[
            { id: "general",   label: "📊 Général" },
            { id: "presences", label: "✅ Présences" },
            { id: "absences",  label: "⚠️ Absences" },
            { id: "visiteurs", label: "🆕 Visiteurs" },
            ].map(o => (
            <Pressable
                key={o.id}
                style={[r.onglet, onglet === o.id && r.ongletActif]}
                onPress={() => setOnglet(o.id as any)}
            >
                <Text style={[r.ongletTexte, onglet === o.id && r.ongletTexteActif]}>
                {o.label}
                </Text>
            </Pressable>
            ))}
        </ScrollView>

        {chargement ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />
        ) : (
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>

            {/* ── GÉNÉRAL ─────────────────────────────────────────────────────── */}
            {onglet === "general" && (
                <>
                <View style={r.statGrid}>
                    <StatBox icone="👥" label="Total membres" valeur={totalMembres} />
                    <StatBox icone="✅" label="Actifs" valeur={membresActifs} couleur="#065F46" />
                    <StatBox icone="⏸" label="Inactifs" valeur={membresInactifs} couleur="#991B1B" />
                    <StatBox icone="⚠️" label="Absents 3+" valeur={absents.length} couleur="#EF4444" />
                </View>

                <View style={r.section}>
                    <Text style={r.sectionTitre}>Répartition par sexe</Text>
                    <View style={r.sexeRow}>
                    <Text style={r.sexeLabel}>Femmes</Text>
                    <Barre valeur={membresFemmes} max={totalMembres} couleur="#7C3AED" />
                    <Text style={r.sexeVal}>
                        {membresFemmes} ({totalMembres > 0 ? Math.round(membresFemmes / totalMembres * 100) : 0}%)
                    </Text>
                    </View>
                    <View style={r.sexeRow}>
                    <Text style={r.sexeLabel}>Hommes</Text>
                    <Barre valeur={membresHommes} max={totalMembres} couleur="#2563EB" />
                    <Text style={r.sexeVal}>
                        {membresHommes} ({totalMembres > 0 ? Math.round(membresHommes / totalMembres * 100) : 0}%)
                    </Text>
                    </View>
                </View>

                <View style={r.section}>
                    <Text style={r.sectionTitre}>Par département</Text>
                    {departements.map(dept => {
                    const nb = membres.filter(m => m.departement === dept.id).length;
                    if (nb === 0) return null;
                    return (
                        <View key={dept.id} style={r.deptRow}>
                        <Text style={r.deptNom}>{dept.nom}</Text>
                        <Barre valeur={nb} max={totalMembres} />
                        <Text style={r.deptVal}>{nb}</Text>
                        </View>
                    );
                    })}
                </View>
                </>
            )}

            {/* ── PRÉSENCES ───────────────────────────────────────────────────── */}
            {onglet === "presences" && (
                <>
                <View style={r.statGrid}>
                    <StatBox icone="📅" label="Cultes enregistrés" valeur={datesUniques.length} />
                    <StatBox
                    icone="📊" label="Taux dernier culte"
                    valeur={`${tauxDernierCulte}%`}
                    couleur={tauxDernierCulte >= 70 ? "#065F46" : "#EF4444"}
                    />
                </View>

                {dernierCulte && (
                    <View style={r.section}>
                    <Text style={r.sectionTitre}>Dernier culte — {dernierCulte}</Text>
                    <View style={r.statGrid}>
                        <StatBox icone="✅" label="Présents" valeur={presentsDernierCulte} couleur="#065F46" />
                        <StatBox icone="❌" label="Absents" valeur={presencesDernierCulte.length - presentsDernierCulte} couleur="#EF4444" />
                        <StatBox icone="📊" label="Taux" valeur={`${tauxDernierCulte}%`} />
                    </View>
                    <View style={r.barreGrandeContainer}>
                        <View style={[r.barreGrandeFill, {
                        width: `${tauxDernierCulte}%` as any,
                        backgroundColor: tauxDernierCulte >= 70 ? "#065F46" : "#EF4444",
                        }]} />
                    </View>
                    </View>
                )}

                <View style={r.section}>
                    <Text style={r.sectionTitre}>Historique des cultes</Text>
                    {datesUniques.slice(0, 10).map(date => {
                    const pDate = presences.filter((p: any) => p.date === date);
                    const presents = pDate.filter((p: any) => p.present).length;
                    const taux = pDate.length > 0 ? Math.round(presents / pDate.length * 100) : 0;
                    return (
                        <View key={date} style={r.historiqueRow}>
                        <Text style={r.historiqueDate}>{date}</Text>
                        <Barre valeur={presents} max={pDate.length} couleur={taux >= 70 ? "#065F46" : "#EF4444"} />
                        <Text style={[r.historiqueTaux, { color: taux >= 70 ? "#065F46" : "#EF4444" }]}>
                            {taux}%
                        </Text>
                        </View>
                    );
                    })}
                </View>
                </>
            )}

            {/* ── ABSENCES ────────────────────────────────────────────────────── */}
            {onglet === "absences" && (
                <>
                <View style={r.alerteBox}>
                    <Text style={r.alerteTexte}>
                    ⚠️ {absents.length} membre{absents.length > 1 ? "s" : ""} absent{absents.length > 1 ? "s" : ""} depuis 3 semaines ou plus
                    </Text>
                </View>

                {absents.length === 0 ? (
                    <Text style={r.videTexte}>🎉 Tous les membres sont présents régulièrement !</Text>
                ) : (
                    absents.map(m => (
                    <View key={m.id} style={r.absentCard}>
                        <View style={[r.absentAvatar, { backgroundColor: "#991B1B" }]}>
                        <Text style={r.absentAvatarTexte}>{initiales(m.nom)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                        <Text style={r.absentNom}>{m.nom}</Text>
                        <Text style={r.absentSub}>
                            {m.departement_nom ?? "Sans département"} · {m.telephone ?? "—"}
                        </Text>
                        {(m.absences_recentes ?? 0) >= 3 && (
                            <Text style={{ fontSize: 11, color: "#EF4444", marginTop: 2, fontWeight: "600" }}>
                            {m.absences_recentes} absences consécutives
                            </Text>
                        )}
                        </View>
                        <View style={r.absentBadge}>
                        <Text style={r.absentBadgeTexte}>Suivi requis</Text>
                        </View>
                    </View>
                    ))
                )}
                </>
            )}

            {/* ── VISITEURS ───────────────────────────────────────────────────── */}
            {onglet === "visiteurs" && (
                <>
                <View style={r.statGrid}>
                    <StatBox icone="🆕" label="Total" valeur={visiteurs.length} />
                    <StatBox icone="📞" label="Non contactés" valeur={visiteursNouveaux} couleur="#633806" />
                    <StatBox icone="✝️" label="Intégrés" valeur={visiteursIntegres} couleur="#065F46" />
                </View>

                <View style={r.section}>
                    <Text style={r.sectionTitre}>Par statut d'intégration</Text>
                    {[
                    { valeur: "nouveau",         label: "Nouveau",         couleur: "#0C447C" },
                    { valeur: "contacte",        label: "Contacté",        couleur: "#633806" },
                    { valeur: "en_suivi",        label: "En suivi",        couleur: "#3C3489" },
                    { valeur: "integre",         label: "Intégré",         couleur: "#065F46" },
                    { valeur: "converti_membre", label: "Converti membre", couleur: "#444441" },
                    ].map(s => {
                    const nb = visiteurs.filter(v => v.statut === s.valeur).length;
                    return (
                        <View key={s.valeur} style={r.deptRow}>
                        <Text style={r.deptNom}>{s.label}</Text>
                        <Barre valeur={nb} max={visiteurs.length || 1} couleur={s.couleur} />
                        <Text style={[r.deptVal, { color: s.couleur }]}>{nb}</Text>
                        </View>
                    );
                    })}
                </View>

                {visiteursNouveaux > 0 && (
                    <View style={r.section}>
                    <Text style={r.sectionTitre}>⚠️ À contacter ({visiteursNouveaux})</Text>
                    {visiteurs.filter(v => v.statut === "nouveau").map(v => (
                        <View key={v.id} style={r.absentCard}>
                        <View style={[r.absentAvatar, { backgroundColor: "#0C447C" }]}>
                            <Text style={r.absentAvatarTexte}>{initiales(v.nom)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={r.absentNom}>{v.nom}</Text>
                            <Text style={r.absentSub}>{v.telephone ?? "—"}</Text>
                        </View>
                        </View>
                    ))}
                    </View>
                )}
                </>
            )}

            </ScrollView>
        )}
        </SafeAreaView>
    );
    }