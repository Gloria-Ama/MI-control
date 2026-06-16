    import { StyleSheet } from "react-native";

    export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 22,
        backgroundColor: "#F8F5F0",
    },

    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#1E293B",
        marginBottom: 20,
    },

    input: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        fontSize: 16,
    },

    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1E293B",
        marginBottom: 10,
    },

    departmentList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 18,
    },

    departmentButton: {
        backgroundColor: "#FFFFFF",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#CBD5E1",
    },

    departmentSelected: {
        backgroundColor: "#1E293B",
        borderColor: "#1E293B",
    },

    departmentText: {
        color: "#1E293B",
        fontWeight: "600",
    },

    departmentSelectedText: {
        color: "#FFFFFF",
    },

    button: {
        backgroundColor: "#1E293B",
        padding: 17,
        borderRadius: 14,
        marginBottom: 25,
    },

    buttonText: {
        color: "#FFFFFF",
        textAlign: "center",
        fontSize: 17,
        fontWeight: "bold",
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1E293B",
        marginBottom: 12,
    },

    memberCard: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },

    memberName: {
        fontSize: 17,
        fontWeight: "bold",
    },

    memberPhone: {
        color: "#64748B",
        marginTop: 4,
    },

    memberDepartment: {
        color: "#8B5E34",
        marginTop: 6,
        fontWeight: "600",
    },

    
    deleteButtonText: {
        color: "#FFFFFF",
        textAlign: "center",
        fontWeight: "bold",
    },

    actionRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
    },

    actionButtonText: {
        color: "#FFFFFF",
        textAlign: "center",
        fontWeight: "bold",
        width: "100%",
    },

    editButton: {
        flex: 1,
        backgroundColor: "#07074C",
        paddingVertical: 12,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center"
    },

    deleteButton: {
        flex: 1,
        backgroundColor: "#07074C",
        paddingVertical: 12,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center"
    },

    selectBox: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },

    selectText: {
        fontSize: 16,
        color: "#1E293B",
    },

    selectOptions: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginBottom: 12,
        overflow: "hidden",
    },

    selectOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },

});