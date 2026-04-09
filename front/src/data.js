export const panneTrend = [
  { label: 'Jul 01', value: 32 },
  { label: 'Jul 04', value: 38 },
  { label: 'Jul 07', value: 29 },
  { label: 'Jul 10', value: 44 },
  { label: 'Jul 14', value: 51 },
  { label: 'Jul 17', value: 43 },
  { label: 'Jul 20', value: 48 },
  { label: 'Jul 23', value: 41 },
  { label: 'Jul 26', value: 46 },
  { label: 'Jul 28', value: 39 },
  { label: 'Jul 30', value: 47 },
  { label: 'Jul 31', value: 52 },
];

export const resolutionBreakdown = [
  { label: 'Resolu', value: 62, color: 'var(--mint)' },
  { label: 'En cours', value: 21, color: 'var(--peach)' },
  { label: 'Critique', value: 9, color: 'var(--berry)' },
  { label: 'Reporte', value: 8, color: 'var(--slate)' },
];

export const dataTransfers = [5, 12, 9, 14, 10, 18, 7, 13, 9, 16, 11, 14];

export const visitesParSite = [
  { site: 'Antananarivo', visits: 1242 },
  { site: 'Dakar', visits: 985 },
  { site: 'Libreville', visits: 762 },
  { site: 'Abidjan', visits: 1108 },
];

export const historiquePannes = [
  {
    id: 'PN-2045',
    equipement: 'Groupe electrogene B4',
    categorie: 'Alimentation',
    gravite: 'Critique',
    date: '10 Fevrier 2026',
    resolution: 'En cours',
  },
  {
    id: 'PN-2044',
    equipement: 'Capteur temperature Z2',
    categorie: 'Capteurs',
    gravite: 'Moyenne',
    date: '08 Fevrier 2026',
    resolution: 'Resolu',
  },
  {
    id: 'PN-2043',
    equipement: 'Serveur SCADA 1',
    categorie: 'Supervision',
    gravite: 'Elevee',
    date: '05 Fevrier 2026',
    resolution: 'Resolu',
  },
  {
    id: 'PN-2042',
    equipement: 'Armoire PLC 7',
    categorie: 'Automate',
    gravite: 'Moyenne',
    date: '04 Fevrier 2026',
    resolution: 'Reporte',
  },
];

export const predictionList = [
  {
    id: 'PR-019',
    equipement: 'Ventilation Hangar 3',
    risque: '74%',
    horizon: '7 jours',
    action: 'Planifier maintenance',
  },
  {
    id: 'PR-018',
    equipement: 'Pompe hydraulique B2',
    risque: '61%',
    horizon: '10 jours',
    action: 'Verifier pression',
  },
  {
    id: 'PR-017',
    equipement: 'Routeur reseau G1',
    risque: '46%',
    horizon: '14 jours',
    action: 'Mettre a jour firmware',
  },
];

export const assistantMessages = [
  {
    from: 'IA',
    text: 'Analyse terminee. La zone Nord montre une hausse de 12% des alertes capteurs.',
  },
  {
    from: 'Utilisateur',
    text: 'Quels equipements doivent etre inspectes en priorite ?',
  },
  {
    from: 'IA',
    text: 'Priorite: PLC-7, Ventilation Hangar 3, Capteur temperature Z2.',
  },
];
