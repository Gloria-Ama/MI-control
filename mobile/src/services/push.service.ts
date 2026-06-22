    import * as Notifications from "expo-notifications";
    import * as Device from "expo-device";
    import { Platform } from "react-native";
    import { api } from "./api";

    // ── Configuration des notifications ───────────────────────────────────────────
    Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
    });

    // ── Demander la permission et enregistrer le token ────────────────────────────
    export async function enregistrerPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
        console.log("Push notifications nécessitent un appareil physique.");
        return null;
    }

    // Vérifier la permission
    const { status: statutExistant } = await Notifications.getPermissionsAsync();
    let statut = statutExistant;

    if (statutExistant !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        statut = status;
    }

    if (statut !== "granted") {
        console.log("Permission de notification refusée.");
        return null;
    }

    // Configuration Android
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
        name: "MI Control",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#07074C",
        });
    }

    // Obtenir le token Expo
    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "mi-control",
        });
        const token = tokenData.data;

        // Sauvegarder le token sur le backend
        await api.post("/push/token/", { token });

        return token;
    } catch (error) {
        console.log("Erreur obtention token push:", error);
        return null;
    }
    }

    // ── Envoyer une notification locale (sans serveur) ────────────────────────────
    export async function notificationLocale(
    titre: string,
    corps: string,
    delaiSecondes = 1
    ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: {
        title: titre,
        body: corps,
        sound: "default",
        },
        trigger: { seconds: delaiSecondes },
    });
    }

    // ── Envoyer une notification push via le backend ──────────────────────────────
    export async function envoyerPushGroupe(titre: string, corps: string): Promise<any> {
    const response = await api.post("/push/envoyer/", {
        titre,
        corps,
        destinataires: "tous",
    });
    return response.data;
    }

    // ── Vider le badge ─────────────────────────────────────────────────────────────
    export async function viderBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
    }

    // ── Écouter les notifications reçues ─────────────────────────────────────────
    export function ecouterNotifications(
    onReception: (notification: Notifications.Notification) => void,
    onReponse: (response: Notifications.NotificationResponse) => void
    ) {
    const receptionSub = Notifications.addNotificationReceivedListener(onReception);
    const reponseSub = Notifications.addNotificationResponseReceivedListener(onReponse);

    return () => {
        receptionSub.remove();
        reponseSub.remove();
    };
    }