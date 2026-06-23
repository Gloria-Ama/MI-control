import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, Pressable,
  Alert, ActivityIndicator, SafeAreaView,
} from "react-native";
import {
  getNotifications, lireNotification, marquerToutesLues,
  genererNotifications, deleteNotification,
} from "../services/notifications.service";
import { ns } from "../styles/notifications.styles";

type Notification = {
  id: number;
  type: string;
  type_label: string;
  titre: string;
  message: string;
  lue: boolean;
  date_creation: string;
  lien_id: number | null;
};

const TYPE_CONFIG: Record<string, { icone: string; couleur: string }> = {
  anniversaire: { icone: "🎂", couleur: "#D97706" },
  absence:      { icone: "⚠️", couleur: "#EF4444" },
  finance:      { icone: "💰", couleur: "#065F46" },
  message:      { icone: "💬", couleur: "#4F46E5" },
  info:         { icone: "ℹ️", couleur: "#0C447C" },
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chargement, setChargement] = useState(true);
  const [generation, setGeneration] = useState(false);

  useEffect(() => {
    chargerNotifications();
  }, []);

  async function chargerNotifications() {
    setChargement(true);
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } finally {
      setChargement(false);
    }
  }

  async function handleLire(notif: Notification) {
    if (!notif.lue) {
      await lireNotification(notif.id).catch(() => {});
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, lue: true } : n)
      );
    }
  }

  async function handleToutLire() {
    await marquerToutesLues().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
  }

  async function handleGenerer() {
    setGeneration(true);
    try {
      const result = await genererNotifications();
      await chargerNotifications();
      Alert.alert(
        "✅ Notifications générées",
        result.generees > 0
          ? `${result.generees} nouvelle(s) notification(s) créée(s).`
          : "Aucune nouvelle notification à générer."
      );
    } catch {
      Alert.alert("Erreur", "Impossible de générer les notifications.");
    } finally {
      setGeneration(false);
    }
  }

  async function handleSupprimer(notif: Notification) {
    await deleteNotification(notif.id).catch(() => {});
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
  }

  function formatDate(dateStr: string) {
    try {
      const date = new Date(dateStr);
      const maintenant = new Date();
      const diff = maintenant.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const heures = Math.floor(diff / 3600000);
      const jours = Math.floor(diff / 86400000);

      if (minutes < 1) return "À l'instant";
      if (minutes < 60) return `Il y a ${minutes} min`;
      if (heures < 24) return `Il y a ${heures}h`;
      if (jours === 1) return "Hier";
      if (jours < 7) return `Il y a ${jours} jours`;
      return date.toLocaleDateString("fr-FR");
    } catch { return ""; }
  }

  const nonLues = notifications.filter(n => !n.lue).length;

  return (
    <SafeAreaView style={ns.safe}>
      {/* Header */}
      <View style={ns.header}>
        <Text style={ns.headerTitre}>
          🔔 Notifications {nonLues > 0 ? `(${nonLues})` : ""}
        </Text>
        <View style={ns.headerActions}>
          {nonLues > 0 && (
            <Pressable style={ns.btnToutLire} onPress={handleToutLire}>
              <Text style={ns.btnToutLireTexte}>Tout lire</Text>
            </Pressable>
          )}
          <Pressable
            style={[ns.btnGenerer, generation && { opacity: 0.6 }]}
            onPress={handleGenerer}
            disabled={generation}
          >
            {generation
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={ns.btnGenererTexte}>🔄 Actualiser</Text>
            }
          </Pressable>
        </View>
      </View>

      {chargement ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#07074C" size="large" />
      ) : notifications.length === 0 ? (
        <>
          <Text style={ns.videIcone}>🔕</Text>
          <Text style={ns.videTexte}>
            Aucune notification pour le moment.{"\n"}
            Appuyez sur 🔄 Actualiser pour vérifier les anniversaires, absences et demandes financières.
          </Text>
        </>
      ) : (
        <ScrollView>
          <Text style={ns.compteur}>
            {notifications.length} notification{notifications.length > 1 ? "s" : ""}
            {nonLues > 0 ? ` · ${nonLues} non lue${nonLues > 1 ? "s" : ""}` : ""}
          </Text>

          {notifications.map(notif => {
            const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info;
            return (
              <Pressable
                key={notif.id}
                style={[ns.notifCard, !notif.lue && ns.notifCardNonLue]}
                onPress={() => handleLire(notif)}
                onLongPress={() => {
                  Alert.alert("Supprimer ?", notif.titre, [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Supprimer", style: "destructive",
                      onPress: () => handleSupprimer(notif),
                    },
                  ]);
                }}
              >
                {/* Icône */}
                <View style={[ns.iconeBox, { backgroundColor: config.couleur + "20" }]}>
                  <Text style={ns.icone}>{config.icone}</Text>
                </View>

                {/* Contenu */}
                <View style={ns.notifContenu}>
                  <Text style={[ns.notifTitre, !notif.lue && ns.notifTitreNonLu]}>
                    {notif.titre}
                  </Text>
                  <Text style={ns.notifMessage}>{notif.message}</Text>
                  <Text style={ns.notifDate}>{formatDate(notif.date_creation)}</Text>
                </View>

                {/* Point non lu */}
                {!notif.lue && <View style={ns.pointNonLu} />}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}