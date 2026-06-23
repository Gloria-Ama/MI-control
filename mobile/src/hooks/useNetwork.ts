    import { useEffect, useState } from "react";
    import NetInfo from "@react-native-community/netinfo";

    export function useNetwork() {
    const [estConnecte, setEstConnecte] = useState<boolean>(true);
    const [type, setType] = useState<string>("unknown");

    useEffect(() => {
        // Vérification initiale
        NetInfo.fetch().then(state => {
        setEstConnecte(state.isConnected === true);
        setType(state.type);
        });

        // Écouter les changements
        const unsubscribe = NetInfo.addEventListener(state => {
        setEstConnecte(state.isConnected === true && state.isInternetReachable !== false);
        setType(state.type);
        });

        return () => unsubscribe();
    }, []);

    return { estConnecte, type };
    }