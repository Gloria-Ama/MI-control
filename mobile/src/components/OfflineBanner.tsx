    import { useEffect, useRef } from "react";
    import { View, Text, StyleSheet, Animated } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import { useNetwork } from "../hooks/useNetwork";

    export default function OfflineBanner() {
    const { estConnecte } = useNetwork();
    const opacite = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(opacite, {
        toValue: estConnecte ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
        }).start();
    }, [estConnecte]);

    if (estConnecte) return null;

    return (
        <Animated.View style={[s.banner, { opacity: opacite }]}>
        <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
        <Text style={s.texte}>Hors ligne — données depuis le cache</Text>
        </Animated.View>
    );
    }

    const s = StyleSheet.create({
    banner: {
        backgroundColor: "#1E293B",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    texte: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
    });