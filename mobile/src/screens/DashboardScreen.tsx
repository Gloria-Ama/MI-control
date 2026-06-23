import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../services/api";
import ExportPDFScreen from "./ExportPDFScreen";
import MembresScreen from "./MembresScreen";
import VisiteursScreen from "./VisiteursScreen";
import PresencesScreen from "./PresencesScreen";
import DepartementsScreen from "./DepartementsScreen";
import FinancesScreen from "./FinancesScreen";
import RapportsScreen from "./RapportsScreen";
import ResponsablesScreen from "./ResponsablesScreen";
import ChatScreen from "./ChatScreen";
import CalendrierScreen from "./CalendrierScreen";
import NotificationsScreen from "./NotificationsScreen";
import ProfilScreen from "./ProfilScreen";
import CroissanceScreen from "./CroissanceScreen";
import SuiviPastoralScreen from "./SuiviPastoralScreen";
import BudgetScreen from "./BudgetScreen";
import QRCodeScreen from "./QRCodeScreen";
import PushNotificationsScreen from "./PushNotificationsScreen";
import OfflineBanner from "../components/OfflineBanner";
import ParametresOfflineScreen from "./ParametresOfflineScreen";
import InscriptionQRScreen from "./InscriptionQRScreen";
import NotesScreen from "./NotesScreen";
import GestionCulteScreen from "./GestionCulteScreen";
import { getMembres } from "../services/membres.service";
import { getProfilConnecte } from "../services/auth.service";
import { getNonLues, genererNotifications } from "../services/notifications.service";
import { getChatNonLus } from "../services/chat.service";

type Props = {
  nomCulte: string;
  onRetour: () => void;
  onDeconnexion: () => void;
};

type OngletNav = "accueil" | "membres" | "presences" | "finances" | "plus";

// ✅ Ajout de "notes" et "culte"
type SousModule =
  | "visiteurs" | "departements" | "rapports" | "responsables"
  | "chat" | "calendrier" | "notifications" | "profil"
  | "croissance" | "pastoral" | "budget"
  | "export" | "qrcode" | "offline" | "push" | "inscription"
  | "notes" | "culte"
  | null;

export default function DashboardScreen({ nomCulte, onRetour, onDeconnexion }: Props) {
  const [onglet, setOnglet] = useState<OngletNav>("accueil");
  const [sousModule, setSousModule] = useState<SousModule>(null);
  const [membres, setMembres] = useState<any[]>([]);
  const [profil, setProfil] = useState<any>(null);
  const [communauteActive, setCommunauteActive] = useState<number | undefined>();
  const [notifNonLues, setNotifNonLues] = useState(0);
  const [chatNonLus, setChatNonLus] = useState(0);

  useEffect(() => {
    chargerProfil();
    chargerCommunautesEtMembres();
    chargerNotifications();
    chargerChatBadge();
    const interval = setInterval(() => {
      chargerNotifications();
      chargerChatBadge();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  async function chargerProfil() {
    try { const data = await getProfilConnecte(); setProfil(data); } catch {}
  }

  async function chargerCommunautesEtMembres() {
    try {
      const response = await api.get("/communautes/");
      const cultes = response.data;
      const culte = cultes.find((c: any) => c.nom.toLowerCase() === nomCulte.toLowerCase());
      const cid = culte?.id ?? (cultes.length > 0 ? cultes[0].id : undefined);
      setCommunauteActive(cid);
      if (cid) {
        const m = await getMembres({ communaute_culte: cid });
        setMembres(Array.isArray(m) ? m : []);
      }
    } catch {}
  }

  async function chargerNotifications() {
    try {
      await genererNotifications().catch(() => {});
      const data = await getNonLues();
      setNotifNonLues(data.non_lues ?? 0);
    } catch {}
  }

  async function chargerChatBadge() {
    try {
      const data = await getChatNonLus();
      setChatNonLus(data.non_lus ?? 0);
    } catch {}
  }

  function getCommunauteId(): number | undefined { return communauteActive; }

  function peutVoir(module: string) {
    if (!profil) return true;
    if (profil.role === "pasteur" || profil.role === "administrateur") return true;
    if (profil.role === "tresoriere") return ["finances", "rapports"].includes(module);
    if (profil.role === "secretaire") return ["membres", "visiteurs", "presences", "rapports"].includes(module);
    if (profil.role === "responsable_accueil") return ["visiteurs", "membres", "presences"].includes(module);
    if (profil.role === "responsable") return ["membres", "presences"].includes(module);
    return false;
  }

  function getDateFormat(date: Date) {
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  const aujourdHui = getDateFormat(new Date());
  const demainDate = new Date(); demainDate.setDate(demainDate.getDate() + 1);
  const demain = getDateFormat(demainDate);
  const datesCetteSemaine = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); return getDateFormat(d);
  });

  const anniversairesAujourdhui = membres.filter(m => m.date_anniversaire === aujourdHui);
  const anniversairesDemain = membres.filter(m => m.date_anniversaire === demain);
  const anniversairesSemaine = membres.filter(m => datesCetteSemaine.includes(m.date_anniversaire));

  // ── Wrapper réutilisable ──────────────────────────────────────────────────
  function SousModuleWrapper({ titre, children, onBack }: {
    titre: string; children: React.ReactNode; onBack: () => void;
  }) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Pressable onPress={onBack} style={s.retourBtn}>
            <Ionicons name="arrow-back" size={22} color="#94A3B8" />
          </Pressable>
          <Text style={s.headerTitre}>{titre}</Text>
          <View style={s.headerEspace} />
        </View>
        <View style={{ flex: 1, backgroundColor: "#F8F5F0" }}>{children}</View>
      </SafeAreaView>
    );
  }

  // ── Sous-modules ──────────────────────────────────────────────────────────
  if (sousModule === "visiteurs")    return <SousModuleWrapper titre="Visiteurs"        onBack={() => setSousModule(null)}><VisiteursScreen /></SousModuleWrapper>;
  if (sousModule === "departements") return <SousModuleWrapper titre="Départements"      onBack={() => setSousModule(null)}><DepartementsScreen /></SousModuleWrapper>;
  if (sousModule === "rapports")     return <SousModuleWrapper titre="Rapports"          onBack={() => setSousModule(null)}><RapportsScreen /></SousModuleWrapper>;
  if (sousModule === "responsables") return <SousModuleWrapper titre="Responsables"      onBack={() => setSousModule(null)}><ResponsablesScreen /></SousModuleWrapper>;
  if (sousModule === "calendrier")   return <SousModuleWrapper titre="Calendrier"        onBack={() => setSousModule(null)}><CalendrierScreen /></SousModuleWrapper>;
  if (sousModule === "croissance")   return <SousModuleWrapper titre="Croissance"        onBack={() => setSousModule(null)}><CroissanceScreen /></SousModuleWrapper>;
  if (sousModule === "pastoral")     return <SousModuleWrapper titre="Suivi pastoral"    onBack={() => setSousModule(null)}><SuiviPastoralScreen /></SousModuleWrapper>;
  if (sousModule === "budget")       return <SousModuleWrapper titre="Budget annuel"     onBack={() => setSousModule(null)}><BudgetScreen /></SousModuleWrapper>;
  if (sousModule === "export")       return <SousModuleWrapper titre="Export PDF"        onBack={() => setSousModule(null)}><ExportPDFScreen nomCulte={nomCulte} communauteId={getCommunauteId()} /></SousModuleWrapper>;
  if (sousModule === "qrcode")       return <SousModuleWrapper titre="QR Code présences" onBack={() => setSousModule(null)}><QRCodeScreen nomCulte={nomCulte} communauteId={getCommunauteId()} /></SousModuleWrapper>;
  if (sousModule === "offline")      return <SousModuleWrapper titre="Mode hors ligne"   onBack={() => setSousModule(null)}><ParametresOfflineScreen /></SousModuleWrapper>;
  if (sousModule === "push")         return <SousModuleWrapper titre="Push Notifications" onBack={() => setSousModule(null)}><PushNotificationsScreen /></SousModuleWrapper>;
  if (sousModule === "inscription")  return <SousModuleWrapper titre="Inscription membres" onBack={() => setSousModule(null)}><InscriptionQRScreen /></SousModuleWrapper>;

  // ✅ Nouveaux sous-modules — sans header (ils ont leur propre navigation interne)
  if (sousModule === "notes") {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Pressable onPress={() => setSousModule(null)} style={s.retourBtn}>
            <Ionicons name="arrow-back" size={22} color="#94A3B8" />
          </Pressable>
          <Text style={s.headerTitre}>Mes notes</Text>
          <View style={s.headerEspace} />
        </View>
        <View style={{ flex: 1 }}>
          <NotesScreen />
        </View>
      </SafeAreaView>
    );
  }

  if (sousModule === "culte") {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Pressable onPress={() => setSousModule(null)} style={s.retourBtn}>
            <Ionicons name="arrow-back" size={22} color="#94A3B8" />
          </Pressable>
          <Text style={s.headerTitre}>Gestion du culte</Text>
          <View style={s.headerEspace} />
        </View>
        <View style={{ flex: 1 }}>
          <GestionCulteScreen />
        </View>
      </SafeAreaView>
    );
  }

  if (sousModule === "notifications") {
    return (
      <SousModuleWrapper titre="Notifications" onBack={() => { setSousModule(null); chargerNotifications(); }}>
        <NotificationsScreen />
      </SousModuleWrapper>
    );
  }

  if (sousModule === "chat") {
    return (
      <SafeAreaView style={s.safe}>
        <View style={{ flex: 1, backgroundColor: "#F8F5F0" }}>
          <ChatScreen onRetour={() => { setSousModule(null); chargerChatBadge(); }} />
        </View>
      </SafeAreaView>
    );
  }

  if (sousModule === "profil") {
    return (
      <SafeAreaView style={s.safe}>
        <View style={{ flex: 1, backgroundColor: "#F8F5F0" }}>
          <ProfilScreen onRetour={() => setSousModule(null)} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Contenu ───────────────────────────────────────────────────────────────
  function renderContenu() {
    if (onglet === "membres" && peutVoir("membres"))   return <MembresScreen nomCulte={nomCulte} communauteId={getCommunauteId()} />;
    if (onglet === "presences" && peutVoir("presences")) return <PresencesScreen nomCulte={nomCulte} communauteId={getCommunauteId()} />;
    if (onglet === "finances" && peutVoir("finances")) return <FinancesScreen />;

    // ── PLUS ─────────────────────────────────────────────────────────────────
    if (onglet === "plus") {
      return (
        <ScrollView style={s.contenu} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

          <Text style={s.sectionTitre}>Personnel</Text>
          <View style={{ marginBottom: 16 }}>

            {/* ✅ Mes notes */}
            <Pressable style={s.moduleCard} onPress={() => setSousModule("notes")}>
              <View style={[s.moduleIconeBox, { backgroundColor: "#FFFBEB" }]}>
                <Text style={{ fontSize: 20 }}>📝</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>Mes notes</Text>
                <Text style={s.moduleSub}>Notes personnelles — accès privé</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>

            {/* Mon profil */}
            <Pressable style={s.moduleCard} onPress={() => setSousModule("profil")}>
              <View style={[s.moduleIconeBox, { backgroundColor: "#EEF2FF" }]}>
                <Ionicons name="person-outline" size={22} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>Mon profil</Text>
                <Text style={s.moduleSub}>Modifier mes informations</Text>
              </View>
              {!profil?.mot_de_passe_change && <View style={s.badgeWarning}><Text style={s.badgeWarningTexte}>!</Text></View>}
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>
          </View>

          <Text style={s.sectionTitre}>Gestion de l'église</Text>
          <View style={{ marginBottom: 16 }}>

            {/* ✅ Gestion du culte */}
            <Pressable style={s.moduleCard} onPress={() => setSousModule("culte")}>
              <View style={[s.moduleIconeBox, { backgroundColor: "#F0FDF4" }]}>
                <Text style={{ fontSize: 20 }}>⛪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>Gestion du culte</Text>
                <Text style={s.moduleSub}>Programme, ordre du culte, mode EN DIRECT</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>

            <Pressable style={s.moduleCard} onPress={() => setSousModule("inscription")}>
              <View style={s.moduleIconeBox}><Ionicons name="person-add-outline" size={22} color="#07074C" /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>Inscription membres</Text>
                <Text style={s.moduleSub}>QR code d'auto-inscription</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>

            {peutVoir("visiteurs") && (
              <Pressable style={s.moduleCard} onPress={() => setSousModule("visiteurs")}>
                <View style={s.moduleIconeBox}><Ionicons name="people-circle-outline" size={22} color="#07074C" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.moduleNom}>Visiteurs</Text>
                  <Text style={s.moduleSub}>Suivi des nouveaux arrivants</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
              </Pressable>
            )}

            {peutVoir("departements") && (
              <Pressable style={s.moduleCard} onPress={() => setSousModule("departements")}>
                <View style={s.moduleIconeBox}><Ionicons name="business-outline" size={22} color="#07074C" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.moduleNom}>Départements</Text>
                  <Text style={s.moduleSub}>Gérer les départements</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
              </Pressable>
            )}

            <Pressable style={s.moduleCard} onPress={() => setSousModule("pastoral")}>
              <View style={s.moduleIconeBox}><Ionicons name="heart-circle-outline" size={22} color="#07074C" /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>Suivi pastoral</Text>
                <Text style={s.moduleSub}>Notes confidentielles membres</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>

            <Pressable style={s.moduleCard} onPress={() => setSousModule("budget")}>
              <View style={s.moduleIconeBox}><Ionicons name="wallet-outline" size={22} color="#07074C" /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>Budget annuel</Text>
                <Text style={s.moduleSub}>Planification et suivi budgétaire</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>

            <Pressable style={s.moduleCard} onPress={() => setSousModule("calendrier")}>
              <View style={s.moduleIconeBox}><Ionicons name="calendar-outline" size={22} color="#07074C" /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>Calendrier</Text>
                <Text style={s.moduleSub}>Activités et événements</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>
          </View>

          <Text style={s.sectionTitre}>Communication</Text>
          <View style={{ marginBottom: 16 }}>
            <Pressable style={s.moduleCard} onPress={() => setSousModule("chat")}>
              <View style={s.moduleIconeBox}><Ionicons name="chatbubbles-outline" size={22} color="#07074C" /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>ChatIntimacy</Text>
                <Text style={s.moduleSub}>Messagerie interne de l'équipe</Text>
              </View>
              {chatNonLus > 0 && <View style={s.badge}><Text style={s.badgeTexte}>{chatNonLus}</Text></View>}
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>

            <Pressable style={s.moduleCard} onPress={() => setSousModule("notifications")}>
              <View style={s.moduleIconeBox}><Ionicons name="notifications-outline" size={22} color="#07074C" /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>Notifications</Text>
                <Text style={s.moduleSub}>Alertes et rappels automatiques</Text>
              </View>
              {notifNonLues > 0 && <View style={s.badge}><Text style={s.badgeTexte}>{notifNonLues}</Text></View>}
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>

            <Pressable style={s.moduleCard} onPress={() => setSousModule("push")}>
              <View style={s.moduleIconeBox}><Ionicons name="phone-portrait-outline" size={22} color="#07074C" /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>Push Notifications</Text>
                <Text style={s.moduleSub}>Alertes sur votre téléphone</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>
          </View>

          <Text style={s.sectionTitre}>Rapports & outils</Text>
          <View style={{ marginBottom: 16 }}>
            <Pressable style={s.moduleCard} onPress={() => setSousModule("croissance")}>
              <View style={s.moduleIconeBox}><Ionicons name="trending-up-outline" size={22} color="#07074C" /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>Croissance</Text>
                <Text style={s.moduleSub}>Statistiques sur 12 mois</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>

            {peutVoir("rapports") && (
              <Pressable style={s.moduleCard} onPress={() => setSousModule("rapports")}>
                <View style={s.moduleIconeBox}><Ionicons name="bar-chart-outline" size={22} color="#07074C" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.moduleNom}>Rapports</Text>
                  <Text style={s.moduleSub}>Statistiques et exports</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
              </Pressable>
            )}

            <Pressable style={s.moduleCard} onPress={() => setSousModule("export")}>
              <View style={s.moduleIconeBox}><Ionicons name="document-text-outline" size={22} color="#07074C" /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>Export PDF</Text>
                <Text style={s.moduleSub}>Rapports imprimables</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>

            <Pressable style={s.moduleCard} onPress={() => setSousModule("qrcode")}>
              <View style={s.moduleIconeBox}><Ionicons name="qr-code-outline" size={22} color="#07074C" /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>QR Code présences</Text>
                <Text style={s.moduleSub}>Auto-pointage des membres</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>

            <Pressable style={s.moduleCard} onPress={() => setSousModule("offline")}>
              <View style={s.moduleIconeBox}><Ionicons name="cloud-offline-outline" size={22} color="#07074C" /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>Mode hors ligne</Text>
                <Text style={s.moduleSub}>Gérer les données en cache</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>
          </View>

          <Text style={s.sectionTitre}>Administration</Text>
          <View style={{ marginBottom: 24 }}>
            <Pressable style={s.moduleCard} onPress={() => setSousModule("responsables")}>
              <View style={s.moduleIconeBox}><Ionicons name="people-outline" size={22} color="#07074C" /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.moduleNom}>Responsables</Text>
                <Text style={s.moduleSub}>Gérer les comptes et accès</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </Pressable>
          </View>

          {/* Actions */}
          <Pressable style={s.cardSecondaire} onPress={onRetour}>
            <Ionicons name="swap-horizontal-outline" size={20} color="#475569" />
            <Text style={s.moduleNom}>Changer de culte</Text>
          </Pressable>
          <Pressable style={s.cardDanger} onPress={onDeconnexion}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={s.moduleDangerTexte}>Se déconnecter</Text>
          </Pressable>
        </ScrollView>
      );
    }

    // ── ACCUEIL ───────────────────────────────────────────────────────────────
    return (
      <ScrollView style={s.contenu} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* Profil */}
        {profil && (
          <Pressable style={s.profilCard} onPress={() => setSousModule("profil")}>
            <View style={s.profilAvatar}>
              <Text style={s.profilAvatarTexte}>{profil.username?.[0]?.toUpperCase() ?? "?"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.profilNom}>Bonjour, {profil.first_name || profil.username}</Text>
              <Text style={s.profilRole}>{nomCulte}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>
        )}

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNombre}>{membres.length}</Text>
            <Text style={s.statLabel}>Membres</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNombre}>{membres.filter(m => m.statut === "actif").length}</Text>
            <Text style={s.statLabel}>Actifs</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNombre}>{membres.filter(m => (m.absences_recentes ?? 0) >= 3).length}</Text>
            <Text style={[s.statLabel, { color: "#EF4444" }]}>Absents 3+</Text>
          </View>
        </View>

        {/* Anniversaires */}
        <View style={s.section}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Ionicons name="gift-outline" size={18} color="#8B5E34" />
            <Text style={s.sectionTitre}>Anniversaires</Text>
          </View>
          <Text style={s.sousSection}>Aujourd'hui</Text>
          {anniversairesAujourdhui.length === 0
            ? <Text style={s.videTexte}>Aucun anniversaire aujourd'hui.</Text>
            : anniversairesAujourdhui.map(m => <Text key={m.id} style={s.anniversaireItem}>🎂 {m.nom} — {m.telephone}</Text>)
          }
          <Text style={s.sousSection}>Demain</Text>
          {anniversairesDemain.length === 0
            ? <Text style={s.videTexte}>Aucun anniversaire demain.</Text>
            : anniversairesDemain.map(m => <Text key={m.id} style={s.anniversaireItem}>🎂 {m.nom} — {m.telephone}</Text>)
          }
          <Text style={s.sousSection}>Cette semaine</Text>
          {anniversairesSemaine.length === 0
            ? <Text style={s.videTexte}>Aucun cette semaine.</Text>
            : anniversairesSemaine.map(m => <Text key={m.id} style={s.anniversaireItem}>🎂 {m.nom} — {m.date_anniversaire}</Text>)
          }
        </View>

        {/* Accès rapide */}
        <Text style={[s.sectionTitre, { marginBottom: 10 }]}>Accès rapide</Text>
        <View style={s.raccourcisGrid}>
          {peutVoir("membres") && (
            <Pressable style={s.raccourciCard} onPress={() => setOnglet("membres")}>
              <Ionicons name="people-outline" size={28} color="#07074C" />
              <Text style={s.raccourciNom}>Membres</Text>
            </Pressable>
          )}
          {peutVoir("presences") && (
            <Pressable style={s.raccourciCard} onPress={() => setOnglet("presences")}>
              <Ionicons name="checkmark-circle-outline" size={28} color="#07074C" />
              <Text style={s.raccourciNom}>Présences</Text>
            </Pressable>
          )}
          {peutVoir("visiteurs") && (
            <Pressable style={s.raccourciCard} onPress={() => setSousModule("visiteurs")}>
              <Ionicons name="person-add-outline" size={28} color="#07074C" />
              <Text style={s.raccourciNom}>Visiteurs</Text>
            </Pressable>
          )}
          {peutVoir("finances") && (
            <Pressable style={s.raccourciCard} onPress={() => setOnglet("finances")}>
              <Ionicons name="cash-outline" size={28} color="#07074C" />
              <Text style={s.raccourciNom}>Finances</Text>
            </Pressable>
          )}

          {/* ✅ Gestion du culte — accès rapide */}
          <Pressable style={s.raccourciCard} onPress={() => setSousModule("culte")}>
            <Text style={{ fontSize: 28 }}>⛪</Text>
            <Text style={s.raccourciNom}>Culte</Text>
          </Pressable>

          {/* ✅ Notes — accès rapide */}
          <Pressable style={s.raccourciCard} onPress={() => setSousModule("notes")}>
            <Text style={{ fontSize: 28 }}>📝</Text>
            <Text style={s.raccourciNom}>Mes notes</Text>
          </Pressable>

          <Pressable style={s.raccourciCard} onPress={() => setSousModule("croissance")}>
            <Ionicons name="trending-up-outline" size={28} color="#07074C" />
            <Text style={s.raccourciNom}>Croissance</Text>
          </Pressable>

          <Pressable style={s.raccourciCard} onPress={() => setSousModule("chat")}>
            <View style={{ position: "relative" }}>
              <Ionicons name="chatbubbles-outline" size={28} color="#07074C" />
              {chatNonLus > 0 && (
                <View style={[s.badge, { position: "absolute", top: -6, right: -8 }]}>
                  <Text style={s.badgeTexte}>{chatNonLus > 9 ? "9+" : chatNonLus}</Text>
                </View>
              )}
            </View>
            <Text style={s.raccourciNom}>Chat</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#07074C" />
      <OfflineBanner />
      <View style={s.header}>
        <View style={s.headerEspace} />
        <Text style={s.headerTitre} numberOfLines={1}>
          {onglet === "accueil" ? nomCulte
            : onglet === "membres" ? "Membres"
            : onglet === "presences" ? "Présences"
            : onglet === "finances" ? "Finances"
            : "Plus"}
        </Text>
        <Pressable
          style={[s.headerEspace, { alignItems: "flex-end", justifyContent: "center" }]}
          onPress={() => setSousModule("notifications")}
        >
          <View style={{ position: "relative" }}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {notifNonLues > 0 && (
              <View style={[s.badge, { position: "absolute", top: -6, right: -6 }]}>
                <Text style={s.badgeTexte}>{notifNonLues > 9 ? "9+" : notifNonLues}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>

      <View style={{ flex: 1, backgroundColor: "#F8F5F0" }}>{renderContenu()}</View>

      <View style={s.navbar}>
        {[
          { id: "accueil"   as OngletNav, icone: "home-outline"              as const, label: "Accueil" },
          { id: "membres"   as OngletNav, icone: "people-outline"             as const, label: "Membres",   module: "membres" },
          { id: "presences" as OngletNav, icone: "checkmark-circle-outline"   as const, label: "Présences", module: "presences" },
          { id: "finances"  as OngletNav, icone: "cash-outline"               as const, label: "Finances",  module: "finances" },
          { id: "plus"      as OngletNav, icone: "ellipsis-horizontal"        as const, label: "Plus" },
        ].map(tab => {
          if (tab.module && !peutVoir(tab.module)) return null;
          const actif = onglet === tab.id;
          return (
            <Pressable key={tab.id} style={s.tab} onPress={() => { setOnglet(tab.id); setSousModule(null); }}>
              {actif && <View style={s.tabIndicateur} />}
              <Ionicons name={tab.icone} size={22} color={actif ? "#4F46E5" : "#94A3B8"} />
              <Text style={[s.tabLabel, actif && s.tabLabelActif]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#07074C" },
  header: { backgroundColor: "#07074C", height: 54, flexDirection: "row", alignItems: "center", paddingHorizontal: 16 },
  headerTitre: { flex: 1, color: "#fff", fontSize: 17, fontWeight: "700", textAlign: "center" },
  headerEspace: { width: 70 },
  retourBtn: { paddingRight: 12 },
  contenu: { flex: 1 },
  profilCard: { backgroundColor: "#fff", borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14, borderWidth: 0.5, borderColor: "#E2E8F0" },
  profilAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#07074C", alignItems: "center", justifyContent: "center" },
  profilAvatarTexte: { color: "#fff", fontWeight: "700", fontSize: 18 },
  profilNom: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  profilRole: { fontSize: 12, color: "#64748B", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 0.5, borderColor: "#E2E8F0" },
  statNombre: { fontSize: 24, fontWeight: "700", color: "#07074C" },
  statLabel: { fontSize: 11, color: "#64748B", marginTop: 4 },
  section: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 0.5, borderColor: "#E2E8F0" },
  sectionTitre: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 8 },
  sousSection: { fontSize: 13, fontWeight: "700", color: "#8B5E34", marginTop: 10, marginBottom: 4 },
  anniversaireItem: { fontSize: 13, color: "#1E293B", paddingVertical: 3 },
  videTexte: { fontSize: 13, color: "#94A3B8", fontStyle: "italic" },
  raccourcisGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  raccourciCard: { width: "47%", backgroundColor: "#fff", borderRadius: 14, padding: 16, alignItems: "center", gap: 8, borderWidth: 0.5, borderColor: "#E2E8F0" },
  raccourciNom: { fontSize: 13, fontWeight: "700", color: "#1E293B" },
  moduleCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8, borderWidth: 0.5, borderColor: "#E2E8F0" },
  moduleIconeBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  moduleNom: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  moduleSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  cardSecondaire: { backgroundColor: "#F1F5F9", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10, borderWidth: 0.5, borderColor: "#E2E8F0" },
  cardDanger: { backgroundColor: "#FEF2F2", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 0.5, borderColor: "#FECACA" },
  moduleDangerTexte: { fontSize: 15, fontWeight: "600", color: "#EF4444" },
  badge: { backgroundColor: "#EF4444", borderRadius: 99, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeTexte: { color: "#fff", fontSize: 10, fontWeight: "700" },
  badgeWarning: { backgroundColor: "#F59E0B", borderRadius: 99, width: 20, height: 20, alignItems: "center", justifyContent: "center", marginRight: 6 },
  badgeWarningTexte: { color: "#fff", fontSize: 12, fontWeight: "700" },
  navbar: { flexDirection: "row", backgroundColor: "#fff", borderTopWidth: 0.5, borderTopColor: "#E2E8F0", paddingBottom: 8, paddingTop: 6 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 4, position: "relative" },
  tabIndicateur: { position: "absolute", top: 0, width: 28, height: 3, backgroundColor: "#4F46E5", borderRadius: 2 },
  tabLabel: { fontSize: 10, color: "#94A3B8", fontWeight: "500", marginTop: 2 },
  tabLabelActif: { color: "#4F46E5", fontWeight: "700" },
});