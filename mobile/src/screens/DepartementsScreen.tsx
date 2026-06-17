    import { useEffect, useState } from "react";
    import {
    View, Text, ScrollView, Pressable,
    ActivityIndicator, SafeAreaView,
    } from "react-native";
    import { api } from "../services/api";
    import { getMembres } from "../services/membres.service";
    import { d } from "../styles/departements.styles";

    type Departement = {
    id: number; nom: string; description: string;
    communaute_culte: number; communaute_nom: string;
    };
    type Membre = {
    id: number; nom: string; telephone: string; sexe: string;
    statut: string; departement: number | null;
    departement_nom: string | null; absences_recentes: number;
    };

    const DEPT_ICONES: Record<string, string> = {
    "Chorale": "🎵", "Accueil": "🤝", "Logistique": "📦",
    "Restauration": "🍽️", "Coordination": "📋", "Transport": "🚌",
    "Intercession": "🙏", "Communication": "📢", "Secrétariat": "✍️",
    "Protocole": "🎖️", "Évangélisation": "✝️",
    };

    const SEXE_LABELS: Record<string, string> = {
    masculin: "M", feminin: "F", autre: "A",
    };

    export default function DepartementsScreen() {
    const [departements, setDepartements] = useState<Departement[]>([]);
    const [membres, setMembres] = useState<Membre[]>([]);
    const [communautes, setCommunautes] = useState<{ id: number; nom: string }[]>([]);
    const [communauteActive, setCommunauteActive] = useState<number | null>(null);
    const [deptOuvert, setDeptOuvert] = useState<number | null>(null);
    const [chargement, setChargement] = useState(true);

    useEffect(() => { chargerDonnees(); }, []);

    async function chargerDonnees() {
        setChargement(true);
        try {
        const [c, m] = await Promise.all([
            api.get("/communautes/").then(r => r.data).catch(() => []),
            getMembres(),
        ]);
        setCommunautes(c);
        setMembres(Array.isArray(m) ? m : []);

        if (c.length > 0) {
            setCommunauteActive(c[0].id);
            const deps = await api.get(`/departements/?communaute_culte=${c[0].id}`)
            .then(r => r.data).catch(() => []);
            setDepartements(Array.isArray(deps) ? deps : []);
        }
        } finally {
        setChargement(false);
        }
    }

    async function changerCommunaute(id: number) {
        setCommunauteActive(id);
        setDeptOuvert(null);
        setChargement(true);
        try {
        const deps = await api.get(`/departements/?communaute_culte=${id}`)
            .then(r => r.data).catch(() => []);
        setDepartements(Array.isArray(deps) ? deps : []);
        } finally {
        setChargement(false);
        }
    }

    function membresDuDept(deptId: number) {
        return membres.filter(m => m.departement === deptId);
    }

    function initiales(nom: string) {
        return nom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }

    function couleur(nom: string) {
        const c = ["#07074C", "#4F46E5", "#0F6E56", "#854F0B", "#993C1D"];
        return c[nom.charCodeAt(0) % c.length];
    }

    const membresAssignes = membres.filter(m =>
        departements.some(dep => dep.id === m.departement)
    );

    return (
        <SafeAreaView style={d.safe}>

        {/* Sélecteur de culte */}
        {communautes.length > 1 && (
            <View style={d.culteRow}>
            {communautes.map(c => (
                <Pressable
                key={c.id}
                style={[d.cultePill, communauteActive === c.id && d.cultePillActif]}
                onPress={() => changerCommunaute(c.id)}
                >
                <Text style={[d.cultePillTexte, communauteActive === c.id && d.cultePillTexteActif]}>
                    {c.nom.replace("Culte du ", "")}
                </Text>
                </Pressable>
            ))}
            </View>
        )}

        {chargement ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />
        ) : (
            <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 80 }}>

            {/* Résumé */}
            <View style={d.resumeRow}>
                <View style={d.resumeCard}>
                <Text style={d.resumeNombre}>{departements.length}</Text>
                <Text style={d.resumeLabel}>Départements</Text>
                </View>
                <View style={d.resumeCard}>
                <Text style={d.resumeNombre}>{membresAssignes.length}</Text>
                <Text style={d.resumeLabel}>Membres assignés</Text>
                </View>
                <View style={d.resumeCard}>
                <Text style={d.resumeNombre}>
                    {membresAssignes.filter(m => m.statut === "actif").length}
                </Text>
                <Text style={d.resumeLabel}>Actifs</Text>
                </View>
            </View>

            {/* Liste des départements */}
            {departements.length === 0 ? (
                <Text style={d.videTexte}>Aucun département pour ce culte.</Text>
            ) : (
                departements.map(dept => {
                const membresDept = membresDuDept(dept.id);
                const actifs = membresDept.filter(m => m.statut === "actif").length;
                const ouvert = deptOuvert === dept.id;
                const icone = DEPT_ICONES[dept.nom] ?? "🏛️";
                const tauxActifs = membresDept.length > 0
                    ? Math.round((actifs / membresDept.length) * 100) : 0;

                return (
                    <View key={dept.id} style={d.deptCard}>
                    <Pressable
                        style={d.deptHeader}
                        onPress={() => setDeptOuvert(ouvert ? null : dept.id)}
                    >
                        <View style={d.deptIconeBox}>
                        <Text style={d.deptIcone}>{icone}</Text>
                        </View>
                        <View style={d.deptInfo}>
                        <Text style={d.deptNom}>{dept.nom}</Text>
                        <Text style={d.deptSub}>
                            {membresDept.length} membre{membresDept.length > 1 ? "s" : ""}
                            {membresDept.length > 0 ? ` · ${actifs} actifs` : ""}
                        </Text>
                        {membresDept.length > 0 && (
                            <View style={d.progressBar}>
                            <View style={[d.progressFill, { width: `${tauxActifs}%` as any }]} />
                            </View>
                        )}
                        </View>
                        <Text style={d.deptChevron}>{ouvert ? "▲" : "▼"}</Text>
                    </Pressable>

                    {ouvert && (
                        <View style={d.membresList}>
                        {membresDept.length === 0 ? (
                            <Text style={d.videTexte}>Aucun membre dans ce département.</Text>
                        ) : (
                            membresDept.map((m, i) => (
                            <View
                                key={m.id}
                                style={[
                                d.membreRow,
                                i === membresDept.length - 1 && { borderBottomWidth: 0 },
                                ]}
                            >
                                <View style={[d.membreAvatar, { backgroundColor: couleur(m.nom) }]}>
                                <Text style={d.membreAvatarTexte}>{initiales(m.nom)}</Text>
                                </View>
                                <View style={d.membreInfo}>
                                <Text style={d.membreNom}>{m.nom}</Text>
                                <Text style={d.membreSub}>
                                    {SEXE_LABELS[m.sexe] ?? "—"}
                                    {m.telephone ? ` · ${m.telephone}` : ""}
                                </Text>
                                </View>
                                <View style={[
                                d.statutBadge,
                                m.statut === "actif" ? d.statutActif :
                                m.statut === "inactif" ? d.statutInactif : d.statutPause,
                                ]}>
                                <Text style={[
                                    d.statutTexte,
                                    m.statut === "actif" ? d.statutActifTexte :
                                    m.statut === "inactif" ? d.statutInactifTexte : d.statutPauseTexte,
                                ]}>
                                    {m.statut === "actif" ? "Actif" :
                                    m.statut === "inactif" ? "Inactif" : "En pause"}
                                </Text>
                                </View>
                            </View>
                            ))
                        )}

                        {membresDept.length > 0 && (
                            <View style={d.deptStats}>
                            <View style={d.deptStatItem}>
                                <Text style={d.deptStatNombre}>
                                {membresDept.filter(m => m.sexe === "feminin").length}
                                </Text>
                                <Text style={d.deptStatLabel}>Femmes</Text>
                            </View>
                            <View style={d.deptStatItem}>
                                <Text style={d.deptStatNombre}>
                                {membresDept.filter(m => m.sexe === "masculin").length}
                                </Text>
                                <Text style={d.deptStatLabel}>Hommes</Text>
                            </View>
                            <View style={d.deptStatItem}>
                                <Text style={[d.deptStatNombre, { color: "#065F46" }]}>{actifs}</Text>
                                <Text style={d.deptStatLabel}>Actifs</Text>
                            </View>
                            <View style={[d.deptStatItem, { borderRightWidth: 0 }]}>
                                <Text style={[d.deptStatNombre, {
                                color: membresDept.filter(m => (m.absences_recentes ?? 0) >= 3).length > 0
                                    ? "#EF4444" : "#07074C",
                                }]}>
                                {membresDept.filter(m => (m.absences_recentes ?? 0) >= 3).length}
                                </Text>
                                <Text style={d.deptStatLabel}>Absents</Text>
                            </View>
                            </View>
                        )}
                        </View>
                    )}
                    </View>
                );
                })
            )}
            </ScrollView>
        )}
        </SafeAreaView>
    );
    }