    import { Pressable, Text, View } from "react-native";

    export default function PlusPage() {
    return (
        <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
            Plus
        </Text>

        <Text>Départements</Text>
        <Text>Finances</Text>
        <Text>Responsables</Text>
        <Text>Paramètres</Text>
        </View>
    );
    }