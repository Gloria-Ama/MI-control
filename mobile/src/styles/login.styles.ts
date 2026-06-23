    import { StyleSheet } from "react-native";

    export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#F8F5F0",
    },
    title: {
        fontSize: 34,
        fontWeight: "800",
        color: "#07074C",
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: "#64748B",
        textAlign: "center",
        marginBottom: 36,
    },
    input: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        fontSize: 16,
        color: "#1E293B",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    button: {
        backgroundColor: "#07074C",
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
    },
    buttonDisabled: {
        backgroundColor: "#94A3B8",
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 16,
    },
    });