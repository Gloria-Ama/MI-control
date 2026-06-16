import { useEffect, useState } from "react";
import { Pressable, Text, View, ScrollView } from "react-native";

import MembresScreen from "./MembresScreen";
import VisiteursScreen from "./VisiteursScreen";
import PresencesScreen from "./PresencesScreen";
import DepartementsScreen from "./DepartementsScreen";
import FinancesScreen from "./FinancesScreen";
import RapportsScreen from "./RapportsScreen";

import { getMembres } from "../services/membres.service";
import { styles } from "../styles/dashboard.styles";

type Props = {
  nomCulte: string;
};

export default function DashboardScreen({ nomCulte }: Props) {
  const [moduleActif, setModuleActif] = useState<string | null>(null);
  const [membres, setMembres] = useState<any[]>([]);

  useEffect(() => {
    chargerMembres();
  }, []);

  async function chargerMembres() {
    const data = await getMembres();
    setMembres(data);
  }

  function getDateFormat(date: Date) {
    const jour = String(date.getDate()).padStart(2, "0");
    const mois = String(date.getMonth() + 1).padStart(2, "0");
    return `${jour}/${mois}`;
  }

  const aujourdHui = getDateFormat(new Date());

  const demainDate = new Date();
  demainDate.setDate(demainDate.getDate() + 1);
  const demain = getDateFormat(demainDate);

  const anniversairesAujourdhui = membres.filter(
    (membre) => membre.date_anniversaire === aujourdHui
  );

  const anniversairesDemain = membres.filter(
    (membre) => membre.date_anniversaire === demain
  );

  if (moduleActif === "membres") return <MembresScreen />;
  if (moduleActif === "visiteurs") return <VisiteursScreen />;
  if (moduleActif === "presences") return <PresencesScreen nomCulte={nomCulte} />;
  if (moduleActif === "departements") return <DepartementsScreen />;
  if (moduleActif === "finances") return <FinancesScreen />;
  if (moduleActif === "rapports") return <RapportsScreen />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{nomCulte}</Text>

      <View style={styles.birthdayBox}>
        <Text style={styles.birthdayTitle}>🎂 Anniversaires</Text>

        <Text style={styles.birthdaySubtitle}>Aujourd’hui</Text>
        {anniversairesAujourdhui.length === 0 ? (
          <Text style={styles.emptyText}>Aucun anniversaire aujourd’hui.</Text>
        ) : (
          anniversairesAujourdhui.map((membre) => (
            <Text key={membre.id} style={styles.birthdayItem}>
              🎉 {membre.nom} — {membre.telephone}
            </Text>
          ))
        )}

        <Text style={styles.birthdaySubtitle}>Demain</Text>
        {anniversairesDemain.length === 0 ? (
          <Text style={styles.emptyText}>Aucun anniversaire demain.</Text>
        ) : (
          anniversairesDemain.map((membre) => (
            <Text key={membre.id} style={styles.birthdayItem}>
              ⏰ {membre.nom} — {membre.telephone}
            </Text>
          ))
        )}
      </View>

      <Pressable style={styles.card} onPress={() => setModuleActif("membres")}>
        <Text style={styles.cardText}>Membres</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => setModuleActif("visiteurs")}>
        <Text style={styles.cardText}>Visiteurs</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => setModuleActif("presences")}>
        <Text style={styles.cardText}>Présences</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => setModuleActif("departements")}>
        <Text style={styles.cardText}>Départements</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => setModuleActif("finances")}>
        <Text style={styles.cardText}>Finances</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => setModuleActif("rapports")}>
        <Text style={styles.cardText}>Rapports</Text>
      </Pressable>
    </ScrollView>
  );
}