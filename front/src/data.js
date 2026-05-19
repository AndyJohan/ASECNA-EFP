export const categoryBreakdown = [
  { label: 'COM', value: 38, color: 'var(--mint)', count: 19 },
  { label: 'MET', value: 27, color: 'var(--peach)', count: 13 },
  { label: 'SURV', value: 21, color: 'var(--berry)', count: 10 },
  { label: 'RESEAU', value: 14, color: 'var(--slate)', count: 7 },
];

export const pannesParEquipement = [
  { equipement: 'VHF SOL', pannes: 14 },
  { equipement: 'VHF TWR', pannes: 9 },
  { equipement: 'VHF APP', pannes: 6 },
  { equipement: 'RADIOSONDAGE', pannes: 11 },
  { equipement: 'SAAPI', pannes: 7 },
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
