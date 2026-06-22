    import * as Print from "expo-print";
    import * as Sharing from "expo-sharing";

    // ── Styles CSS partagés ───────────────────────────────────────────────────────
    const CSS = `
    body { font-family: Arial, sans-serif; margin: 20px; color: #1E293B; }
    h1 { color: #07074C; font-size: 22px; margin-bottom: 4px; }
    h2 { color: #07074C; font-size: 16px; margin-top: 20px; margin-bottom: 8px; border-bottom: 2px solid #07074C; padding-bottom: 4px; }
    .meta { color: #64748B; font-size: 12px; margin-bottom: 20px; }
    .stats-row { display: flex; gap: 12px; margin-bottom: 20px; }
    .stat-box { flex: 1; background: #F1F5F9; border-radius: 8px; padding: 12px; text-align: center; }
    .stat-valeur { font-size: 28px; font-weight: bold; color: #07074C; }
    .stat-label { font-size: 11px; color: #64748B; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
    th { background: #07074C; color: white; padding: 8px 10px; text-align: left; }
    td { padding: 7px 10px; border-bottom: 1px solid #E2E8F0; }
    tr:nth-child(even) { background: #F8F5F0; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: bold; }
    .badge-vert { background: #D1FAE5; color: #065F46; }
    .badge-rouge { background: #FEE2E2; color: #991B1B; }
    .badge-gris { background: #F1F5F9; color: #475569; }
    .badge-bleu { background: #DBEAFE; color: #1E40AF; }
    .footer { margin-top: 30px; text-align: center; color: #94A3B8; font-size: 11px; border-top: 1px solid #E2E8F0; padding-top: 10px; }
    .confidentiel { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 6px; padding: 8px 12px; color: #991B1B; font-weight: bold; font-size: 12px; margin-bottom: 16px; }
    `;

    function enTete(titre: string, sousTitre: string) {
    const date = new Date().toLocaleDateString("fr-FR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    return `
        <h1>${titre}</h1>
        <p class="meta">${sousTitre} &nbsp;|&nbsp; Généré le ${date}</p>
    `;
    }

    function piedDePage() {
    return `<div class="footer">MI Control — Application de gestion MI Church</div>`;
    }

    // ── Export Membres ─────────────────────────────────────────────────────────────
    export async function exporterMembresPDF(membres: any[], nomCulte: string) {
    const actifs = membres.filter(m => m.statut === "actif").length;
    const inactifs = membres.filter(m => m.statut === "inactif").length;

    const lignes = membres.map(m => `
        <tr>
        <td>${m.nom}</td>
        <td>${m.telephone ?? "—"}</td>
        <td>${m.sexe === "M" ? "Homme" : "Femme"}</td>
        <td>${m.departement_nom ?? "—"}</td>
        <td>${m.date_anniversaire ?? "—"}</td>
        <td>
            <span class="badge ${m.statut === "actif" ? "badge-vert" : "badge-rouge"}">
            ${m.statut === "actif" ? "Actif" : "Inactif"}
            </span>
        </td>
        </tr>
    `).join("");

    const html = `
        <html><head><style>${CSS}</style></head><body>
        ${enTete(`Liste des membres — ${nomCulte}`, `${membres.length} membres`)}
        <div class="stats-row">
        <div class="stat-box"><div class="stat-valeur">${membres.length}</div><div class="stat-label">Total</div></div>
        <div class="stat-box"><div class="stat-valeur" style="color:#065F46">${actifs}</div><div class="stat-label">Actifs</div></div>
        <div class="stat-box"><div class="stat-valeur" style="color:#EF4444">${inactifs}</div><div class="stat-label">Inactifs</div></div>
        </div>
        <h2>Liste complète</h2>
        <table>
        <tr><th>Nom</th><th>Téléphone</th><th>Sexe</th><th>Département</th><th>Anniversaire</th><th>Statut</th></tr>
        ${lignes}
        </table>
        ${piedDePage()}
        </body></html>
    `;

    await imprimerEtPartager(html, `membres_${nomCulte.replace(/\s/g, "_")}`);
    }

    // ── Export Présences ───────────────────────────────────────────────────────────
    export async function exporterPresencesPDF(
    presences: any[],
    membres: any[],
    date: string,
    nomCulte: string
    ) {
    const presents = presences.filter(p => p.present).length;
    const absents = presences.filter(p => !p.present).length;
    const taux = presences.length > 0 ? Math.round((presents / presences.length) * 100) : 0;

    const lignes = presences.map(p => `
        <tr>
        <td>${p.membre_nom}</td>
        <td>
            <span class="badge ${p.present ? "badge-vert" : "badge-rouge"}">
            ${p.present ? "Présent" : "Absent"}
            </span>
        </td>
        </tr>
    `).join("");

    const html = `
        <html><head><style>${CSS}</style></head><body>
        ${enTete(`Rapport de présences — ${nomCulte}`, `Culte du ${date}`)}
        <div class="stats-row">
        <div class="stat-box"><div class="stat-valeur">${presences.length}</div><div class="stat-label">Membres pointés</div></div>
        <div class="stat-box"><div class="stat-valeur" style="color:#065F46">${presents}</div><div class="stat-label">Présents</div></div>
        <div class="stat-box"><div class="stat-valeur" style="color:#EF4444">${absents}</div><div class="stat-label">Absents</div></div>
        <div class="stat-box"><div class="stat-valeur" style="color:#4F46E5">${taux}%</div><div class="stat-label">Taux</div></div>
        </div>
        <h2>Détail des présences</h2>
        <table>
        <tr><th>Membre</th><th>Présence</th></tr>
        ${lignes}
        </table>
        ${piedDePage()}
        </body></html>
    `;

    await imprimerEtPartager(html, `presences_${date}`);
    }

    // ── Export Absents ─────────────────────────────────────────────────────────────
    export async function exporterAbsentsPDF(membres: any[], nomCulte: string) {
    const lignes = membres.map(m => `
        <tr>
        <td>${m.nom}</td>
        <td>${m.telephone ?? "—"}</td>
        <td>${m.departement_nom ?? "—"}</td>
        <td>${m.absences_recentes ?? 0} semaine(s)</td>
        </tr>
    `).join("");

    const html = `
        <html><head><style>${CSS}</style></head><body>
        ${enTete(`Rapport d'absences — ${nomCulte}`, `${membres.length} membres absents`)}
        <div style="background:#FEF2F2; border:1px solid #FECACA; border-radius:8px; padding:12px; margin-bottom:16px; color:#991B1B; font-size:13px;">
        ⚠️ Ces membres sont absents depuis 3 semaines ou plus. Un suivi pastoral est recommandé.
        </div>
        <table>
        <tr><th>Nom</th><th>Téléphone</th><th>Département</th><th>Absences consécutives</th></tr>
        ${lignes}
        </table>
        ${piedDePage()}
        </body></html>
    `;

    await imprimerEtPartager(html, `absents_${nomCulte.replace(/\s/g, "_")}`);
    }

    // ── Export Visiteurs ───────────────────────────────────────────────────────────
    export async function exporterVisiteursPDF(visiteurs: any[], nomCulte: string) {
    const enCours = visiteurs.filter(v => v.statut === "en_suivi").length;
    const integres = visiteurs.filter(v => v.statut === "integre").length;

    const lignes = visiteurs.map(v => `
        <tr>
        <td>${v.nom}</td>
        <td>${v.telephone ?? "—"}</td>
        <td>${v.date_premiere_visite ?? "—"}</td>
        <td>${v.nombre_visites ?? 1}</td>
        <td>
            <span class="badge ${
            v.statut === "integre" ? "badge-vert" :
            v.statut === "en_suivi" ? "badge-bleu" : "badge-gris"
            }">
            ${v.statut === "integre" ? "Intégré" : v.statut === "en_suivi" ? "En suivi" : "Nouveau"}
            </span>
        </td>
        </tr>
    `).join("");

    const html = `
        <html><head><style>${CSS}</style></head><body>
        ${enTete(`Rapport des visiteurs — ${nomCulte}`, `${visiteurs.length} visiteurs`)}
        <div class="stats-row">
        <div class="stat-box"><div class="stat-valeur">${visiteurs.length}</div><div class="stat-label">Total</div></div>
        <div class="stat-box"><div class="stat-valeur" style="color:#4F46E5">${enCours}</div><div class="stat-label">En suivi</div></div>
        <div class="stat-box"><div class="stat-valeur" style="color:#065F46">${integres}</div><div class="stat-label">Intégrés</div></div>
        </div>
        <table>
        <tr><th>Nom</th><th>Téléphone</th><th>Première visite</th><th>Nb visites</th><th>Statut</th></tr>
        ${lignes}
        </table>
        ${piedDePage()}
        </body></html>
    `;

    await imprimerEtPartager(html, `visiteurs_${nomCulte.replace(/\s/g, "_")}`);
    }

    // ── Export Budget ──────────────────────────────────────────────────────────────
    export async function exporterBudgetPDF(budget: any, annee: number) {
    const lignes = budget.lignes.map((l: any) => `
        <tr>
        <td>${l.description}</td>
        <td>${l.categorie_label}</td>
        <td>${l.departement_nom ?? "—"}</td>
        <td style="text-align:right">${Number(l.montant_prevu).toFixed(2)} $</td>
        <td style="text-align:right">${Number(l.montant_realise).toFixed(2)} $</td>
        <td style="text-align:right; color:${l.ecart > 0 ? "#EF4444" : "#065F46"}">
            ${l.ecart >= 0 ? "+" : ""}${Number(l.ecart).toFixed(2)} $
        </td>
        <td style="text-align:center">${l.taux_execution}%</td>
        </tr>
    `).join("");

    const html = `
        <html><head><style>${CSS}</style></head><body>
        ${enTete(`Budget annuel ${annee}`, `Taux d'exécution global : ${budget.taux_global}%`)}
        <div class="stats-row">
        <div class="stat-box"><div class="stat-valeur">${Number(budget.total_prevu).toFixed(2)} $</div><div class="stat-label">Total prévu</div></div>
        <div class="stat-box"><div class="stat-valeur" style="color:#065F46">${Number(budget.total_realise).toFixed(2)} $</div><div class="stat-label">Total réalisé</div></div>
        <div class="stat-box"><div class="stat-valeur" style="color:#4F46E5">${budget.taux_global}%</div><div class="stat-label">Taux exécution</div></div>
        </div>
        <h2>Détail des lignes budgétaires</h2>
        <table>
        <tr><th>Description</th><th>Catégorie</th><th>Département</th><th>Prévu</th><th>Réalisé</th><th>Écart</th><th>Taux</th></tr>
        ${lignes}
        </table>
        ${piedDePage()}
        </body></html>
    `;

    await imprimerEtPartager(html, `budget_${annee}`);
    }

    // ── Fonction commune — imprimer et partager ────────────────────────────────────
    async function imprimerEtPartager(html: string, nomFichier: string) {
    try {
        const { uri } = await Print.printToFileAsync({ html, base64: false });

        const peutPartager = await Sharing.isAvailableAsync();
        if (peutPartager) {
        await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: "Exporter le rapport",
            UTI: "com.adobe.pdf",
        });
        } else {
        await Print.printAsync({ uri });
        }
    } catch (error) {
        throw error;
    }
    }