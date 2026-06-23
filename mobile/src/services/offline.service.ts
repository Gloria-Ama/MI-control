    import AsyncStorage from "@react-native-async-storage/async-storage";
    import NetInfo from "@react-native-community/netinfo";

    const CACHE_DUREE = 24 * 60 * 60 * 1000; // 24 heures

    // ── Vérifier la connexion ─────────────────────────────────────────────────────
    export async function estEnLigne(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
    }

    // ── Sauvegarder dans le cache ─────────────────────────────────────────────────
    export async function sauvegarderCache(cle: string, donnees: any): Promise<void> {
    try {
        const entree = {
        donnees,
        timestamp: Date.now(),
        };
        await AsyncStorage.setItem(`cache_${cle}`, JSON.stringify(entree));
    } catch {}
    }

    // ── Lire depuis le cache ───────────────────────────────────────────────────────
    export async function lireCache<T>(cle: string): Promise<T | null> {
    try {
        const valeur = await AsyncStorage.getItem(`cache_${cle}`);
        if (!valeur) return null;

        const entree = JSON.parse(valeur);
        const age = Date.now() - entree.timestamp;

        if (age > CACHE_DUREE) {
        await AsyncStorage.removeItem(`cache_${cle}`);
        return null;
        }

        return entree.donnees as T;
    } catch {
        return null;
    }
    }

    // ── Vider le cache ────────────────────────────────────────────────────────────
    export async function viderCache(): Promise<void> {
    try {
        const cles = await AsyncStorage.getAllKeys();
        const cleCache = cles.filter(c => c.startsWith("cache_"));
        await AsyncStorage.multiRemove(cleCache);
    } catch {}
    }

    // ── Taille du cache ───────────────────────────────────────────────────────────
    export async function infosCache(): Promise<{ nbElements: number; ageMoyen: string }> {
    try {
        const cles = await AsyncStorage.getAllKeys();
        const cleCache = cles.filter(c => c.startsWith("cache_"));

        if (cleCache.length === 0) return { nbElements: 0, ageMoyen: "—" };

        const valeurs = await AsyncStorage.multiGet(cleCache);
        const timestamps = valeurs
        .map(([, v]) => { try { return JSON.parse(v!).timestamp; } catch { return null; } })
        .filter(Boolean) as number[];

        const ageMoyen = timestamps.length > 0
        ? Math.round((Date.now() - timestamps.reduce((a, b) => a + b, 0) / timestamps.length) / 60000)
        : 0;

        return {
        nbElements: cleCache.length,
        ageMoyen: `${ageMoyen} min`,
        };
    } catch {
        return { nbElements: 0, ageMoyen: "—" };
    }
    }

    // ── Requête avec cache automatique ────────────────────────────────────────────
    export async function requeteAvecCache<T>(
    cle: string,
    requete: () => Promise<T>,
    options?: { forcer?: boolean }
    ): Promise<{ donnees: T; depuisCache: boolean }> {
    const enLigne = await estEnLigne();

    // Si en ligne et pas forcé depuis cache → requête normale + mise en cache
    if (enLigne && !options?.forcer) {
        try {
        const donnees = await requete();
        await sauvegarderCache(cle, donnees);
        return { donnees, depuisCache: false };
        } catch (erreur) {
        // Si la requête échoue, essayer le cache
        const cache = await lireCache<T>(cle);
        if (cache) return { donnees: cache, depuisCache: true };
        throw erreur;
        }
    }

    // Hors ligne → lire le cache
    const cache = await lireCache<T>(cle);
    if (cache) return { donnees: cache, depuisCache: true };

    // Pas de cache disponible
    if (!enLigne) {
        throw new Error("Hors ligne — aucune donnée en cache pour cette section.");
    }

    // En ligne mais forcer depuis cache → requête normale
    const donnees = await requete();
    await sauvegarderCache(cle, donnees);
    return { donnees, depuisCache: false };
    }