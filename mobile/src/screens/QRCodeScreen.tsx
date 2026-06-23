import { useEffect, useRef, useState } from "react";
    import {
    View, Text, ScrollView, Pressable,
    Alert, ActivityIndicator, SafeAreaView, StyleSheet, Modal,
    } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import { CameraView, useCameraPermissions } from "expo-camera";
    import QRCode from "react-native-qrcode-svg";
    import { getMembres } from "../services/membres.service";
    import { api } from "../services/api";

    type Membre = {
    id: number;
    nom: string;
    telephone: string;
    departement_nom: string | null;
    };

    type Props = { nomCulte?: string; communauteId?: number };

    export default function QRCodeScreen({ nomCulte = "Église", communauteId }: Props) {
    const [onglet, setOnglet] = useState<"scanner" | "cartes">("scanner");
    const [membres, setMembres] = useState<Membre[]>([]);
    const [chargement, setChargement] = useState(true);
    const [permission, requestPermission] = useCameraPermissions();
    const [scanActif, setScanActif] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [dernierScan, setDernierScan] = useState<{ nom: string; succes: boolean } | null>(null);
    const [membreSelectionne, setMembreSelectionne] = useState<Membre | null>(null);
    const [recherche, setRecherche] = useState("");
    const cooldownRef = useRef(false);

    const dateAujourd = new Date().toISOString().split("T")[0];

    useEffect(() => { chargerMembres(); }, []);

    async function chargerMembres() {
        setChargement(true);
        try {
        const m = await getMembres(communauteId ? { communaute_culte: communauteId } : {});
        setMembres(Array.isArray(m) ? m : []);
        } finally {
        setChargement(false);
        }
    }

    async function handleScan(data: string) {
        if (cooldownRef.current || scanning) return;
        cooldownRef.current = true;
        setScanning(true);

        try {
        const parsed = JSON.parse(data);
        const membreId = parsed.id ?? parsed.membre_id;

        if (!membreId) {
            setDernierScan({ nom: "QR Code invalide", succes: false });
            return;
        }

        const response = await api.post("/presences/qr/", {
            membre_id: membreId,
            date: dateAujourd,
            communaute_culte: communauteId,
        });

        setDernierScan({
            nom: response.data.deja_pointe
            ? `${response.data.membre_nom} (déjà pointé)`
            : response.data.membre_nom,
            succes: true,
        });

        } catch (err: any) {
        const msg = err?.response?.data?.detail ?? "Erreur de scan";
        setDernierScan({ nom: msg, succes: false });
        } finally {
        setScanning(false);
        setTimeout(() => {
            cooldownRef.current = false;
            setDernierScan(null);
        }, 3000);
        }
    }

    // ── ONGLET SCANNER ────────────────────────────────────────────────────────
    function renderScanner() {
        if (!permission) return <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" />;

        if (!permission.granted) {
        return (
            <View style={s.centrer}>
            <Ionicons name="camera-outline" size={60} color="#CBD5E0" />
            <Text style={s.permTitre}>Accès caméra requis</Text>
            <Text style={s.permSub}>Pour scanner les QR codes des membres</Text>
            <Pressable style={s.btnPrimaire} onPress={requestPermission}>
                <Text style={s.btnPrimaireTexte}>Autoriser la caméra</Text>
            </Pressable>
            </View>
        );
        }

        return (
        <View style={{ flex: 1 }}>
            {/* Résultat du dernier scan */}
            {dernierScan && (
            <View style={[s.scanResult, { backgroundColor: dernierScan.succes ? "#F0FDF4" : "#FEF2F2" }]}>
                <Ionicons
                name={dernierScan.succes ? "checkmark-circle" : "close-circle"}
                size={24}
                color={dernierScan.succes ? "#065F46" : "#EF4444"}
                />
                <Text style={[s.scanResultTexte, { color: dernierScan.succes ? "#065F46" : "#EF4444" }]}>
                {dernierScan.succes ? "✓ " : "✗ "}{dernierScan.nom}
                </Text>
            </View>
            )}

            {/* Info date */}
            <View style={s.infoDate}>
            <Ionicons name="calendar-outline" size={14} color="#64748B" />
            <Text style={s.infoDateTexte}>
                {nomCulte} — {new Date().toLocaleDateString("fr-FR")}
            </Text>
            </View>

            {/* Caméra */}
            <View style={{ flex: 1 }}>
            {scanActif ? (
                <View style={{ flex: 1 }}>
                <CameraView
                    style={{ flex: 1 }}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                    onBarcodeScanned={({ data }) => handleScan(data)}
                />
                {/* Cadre de visée */}
                <View style={s.cadreContainer}>
                    <View style={s.cadre}>
                    <View style={[s.coin, { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 }]} />
                    <View style={[s.coin, { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 }]} />
                    <View style={[s.coin, { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 }]} />
                    <View style={[s.coin, { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 }]} />
                    </View>
                    <Text style={s.cadreTexte}>Pointez la caméra sur le QR code du membre</Text>
                </View>
                <Pressable style={s.btnArreter} onPress={() => setScanActif(false)}>
                    <Ionicons name="stop-circle-outline" size={20} color="#fff" />
                    <Text style={s.btnArreterTexte}>Arrêter le scan</Text>
                </Pressable>
                </View>
            ) : (
                <View style={s.centrer}>
                <View style={s.qrIconeBox}>
                    <Ionicons name="qr-code-outline" size={80} color="#07074C" />
                </View>
                <Text style={s.scanTitre}>Scanner les QR codes</Text>
                <Text style={s.scanSub}>
                    Pointez la caméra sur le QR code d'un membre pour le marquer présent automatiquement.
                </Text>
                <Pressable style={s.btnPrimaire} onPress={() => setScanActif(true)}>
                    <Ionicons name="camera-outline" size={20} color="#fff" />
                    <Text style={s.btnPrimaireTexte}>Démarrer le scan</Text>
                </Pressable>
                </View>
            )}
            </View>
        </View>
        );
    }

    // ── ONGLET CARTES QR ──────────────────────────────────────────────────────
    function renderCartes() {
        if (chargement) return <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" />;

        const membresFiltres = membres.filter(m =>
        m.nom.toLowerCase().includes(recherche.toLowerCase())
        );

        return (
        <View style={{ flex: 1 }}>
            {/* Info */}
            <View style={[s.infoDate, { margin: 12 }]}>
            <Ionicons name="information-circle-outline" size={14} color="#64748B" />
            <Text style={s.infoDateTexte}>
                Appuyez sur un membre pour voir son QR code personnel
            </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {membresFiltres.map(m => (
                <Pressable
                    key={m.id}
                    style={s.membreCard}
                    onPress={() => setMembreSelectionne(m)}
                >
                    <View style={s.membreAvatar}>
                    <Text style={s.membreAvatarTexte}>{m.nom[0]?.toUpperCase()}</Text>
                    </View>
                    <Text style={s.membreNom} numberOfLines={1}>{m.nom}</Text>
                    <Text style={s.membreSub} numberOfLines={1}>{m.departement_nom ?? "Aucun dept."}</Text>
                    <View style={s.qrMiniIcone}>
                    <Ionicons name="qr-code-outline" size={16} color="#4F46E5" />
                    </View>
                </Pressable>
                ))}
            </View>
            </ScrollView>

            {/* Modal QR Code */}
            <Modal
            visible={!!membreSelectionne}
            transparent
            animationType="fade"
            onRequestClose={() => setMembreSelectionne(null)}
            >
            <View style={s.modalOverlay}>
                <View style={s.modalCard}>
                <Pressable style={s.modalFermer} onPress={() => setMembreSelectionne(null)}>
                    <Ionicons name="close" size={24} color="#64748B" />
                </Pressable>

                {membreSelectionne && (
                    <>
                    <Text style={s.modalNom}>{membreSelectionne.nom}</Text>
                    <Text style={s.modalSub}>{membreSelectionne.departement_nom ?? nomCulte}</Text>

                    <View style={s.qrContainer}>
                        <QRCode
                        value={JSON.stringify({
                            id: membreSelectionne.id,
                            nom: membreSelectionne.nom,
                            type: "mi_control_membre",
                        })}
                        size={200}
                        color="#07074C"
                        backgroundColor="white"
                        />
                    </View>

                    <Text style={s.modalId}>ID: #{membreSelectionne.id}</Text>
                    <Text style={s.modalInfo}>
                        Montrez ce QR code au responsable lors du culte pour vous pointer automatiquement.
                    </Text>
                    </>
                )}
                </View>
            </View>
            </Modal>
        </View>
        );
    }

    return (
        <SafeAreaView style={s.safe}>
        {/* Onglets */}
        <View style={s.onglets}>
            <Pressable
            style={[s.onglet, onglet === "scanner" && s.ongletActif]}
            onPress={() => setOnglet("scanner")}
            >
            <Ionicons name="scan-outline" size={16} color={onglet === "scanner" ? "#fff" : "#64748B"} />
            <Text style={[s.ongletTexte, onglet === "scanner" && s.ongletTexteActif]}>
                Scanner
            </Text>
            </Pressable>
            <Pressable
            style={[s.onglet, onglet === "cartes" && s.ongletActif]}
            onPress={() => setOnglet("cartes")}
            >
            <Ionicons name="id-card-outline" size={16} color={onglet === "cartes" ? "#fff" : "#64748B"} />
            <Text style={[s.ongletTexte, onglet === "cartes" && s.ongletTexteActif]}>
                Cartes QR
            </Text>
            </Pressable>
        </View>

        <View style={{ flex: 1 }}>
            {onglet === "scanner" ? renderScanner() : renderCartes()}
        </View>
        </SafeAreaView>
    );
    }

    const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F8F5F0" },
    centrer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },

    // Onglets
    onglets: {
        flexDirection: "row", backgroundColor: "#fff",
        borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0",
        padding: 8, gap: 8,
    },
    onglet: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 6, paddingVertical: 10, borderRadius: 10,
        backgroundColor: "#F1F5F9",
    },
    ongletActif: { backgroundColor: "#07074C" },
    ongletTexte: { fontSize: 14, fontWeight: "600", color: "#64748B" },
    ongletTexteActif: { color: "#fff" },

    // Scanner
    scanResult: {
        flexDirection: "row", alignItems: "center", gap: 10,
        padding: 14, margin: 12, borderRadius: 12,
        borderWidth: 0.5, borderColor: "#E2E8F0",
    },
    scanResultTexte: { fontSize: 15, fontWeight: "700", flex: 1 },
    infoDate: {
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: "#fff", padding: 10,
        borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0",
    },
    infoDateTexte: { fontSize: 12, color: "#64748B" },
    cadreContainer: {
        position: "absolute", top: 0, left: 0, right: 0, bottom: 60,
        alignItems: "center", justifyContent: "center",
    },
    cadre: { width: 220, height: 220, position: "relative" },
    coin: {
        position: "absolute", width: 30, height: 30,
        borderColor: "#fff",
    },
    cadreTexte: {
        color: "#fff", fontSize: 13, marginTop: 20,
        textAlign: "center", backgroundColor: "rgba(0,0,0,0.5)",
        padding: 8, borderRadius: 8,
    },
    btnArreter: {
        position: "absolute", bottom: 20, alignSelf: "center",
        backgroundColor: "#EF4444", borderRadius: 12,
        paddingVertical: 12, paddingHorizontal: 24,
        flexDirection: "row", alignItems: "center", gap: 8,
    },
    btnArreterTexte: { color: "#fff", fontWeight: "700", fontSize: 15 },
    qrIconeBox: {
        width: 140, height: 140, borderRadius: 20,
        backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
    },
    scanTitre: { fontSize: 20, fontWeight: "700", color: "#1E293B", marginBottom: 10 },
    scanSub: { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 20, marginBottom: 24 },
    btnPrimaire: {
        backgroundColor: "#07074C", borderRadius: 12,
        paddingVertical: 14, paddingHorizontal: 28,
        flexDirection: "row", alignItems: "center", gap: 8,
    },
    btnPrimaireTexte: { color: "#fff", fontWeight: "700", fontSize: 16 },
    permTitre: { fontSize: 18, fontWeight: "700", color: "#1E293B", marginTop: 16, marginBottom: 8 },
    permSub: { fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: 24 },

    // Cartes membres
    membreCard: {
        width: "47%", backgroundColor: "#fff", borderRadius: 14,
        padding: 14, alignItems: "center",
        borderWidth: 0.5, borderColor: "#E2E8F0",
        position: "relative",
    },
    membreAvatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#07074C", alignItems: "center", justifyContent: "center",
        marginBottom: 8,
    },
    membreAvatarTexte: { color: "#fff", fontWeight: "700", fontSize: 18 },
    membreNom: { fontSize: 13, fontWeight: "700", color: "#1E293B", textAlign: "center" },
    membreSub: { fontSize: 11, color: "#64748B", textAlign: "center", marginTop: 2 },
    qrMiniIcone: {
        position: "absolute", top: 8, right: 8,
        backgroundColor: "#EEF2FF", borderRadius: 6, padding: 4,
    },

    // Modal QR Code
    modalOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
        alignItems: "center", justifyContent: "center", padding: 20,
    },
    modalCard: {
        backgroundColor: "#fff", borderRadius: 20, padding: 24,
        width: "100%", maxWidth: 340, alignItems: "center",
    },
    modalFermer: { position: "absolute", top: 14, right: 14 },
    modalNom: { fontSize: 20, fontWeight: "700", color: "#1E293B", marginBottom: 4 },
    modalSub: { fontSize: 13, color: "#64748B", marginBottom: 20 },
    qrContainer: {
        padding: 16, backgroundColor: "#fff",
        borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0",
        marginBottom: 12,
    },
    modalId: { fontSize: 12, color: "#94A3B8", marginBottom: 8 },
    modalInfo: {
        fontSize: 12, color: "#64748B", textAlign: "center",
        lineHeight: 18, marginTop: 4,
    },
    });