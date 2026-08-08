/**
 * DigiD simulatorpersonen waarvan de keuze de ingeladen BRP-gegevens in het formulier verandert.
 * Houd de volledige, verwachte BRP-situatie bij de beschrijving van iedere persoon.
 */
export type DigiDSimulatorPerson = {
  bsn: string;
  description: string;
};

/**
 * Testdata vanuit RVIG om haal centraal BRP testgegevens in te laden.
 */
export const digidSimulatorPersons = {
  persoon999971773: { bsn: '999971773', description: 'Nijmegen; 69 jaar; geen kinderen; geen partner.' },
  semVanTHul: { bsn: '999971785', description: "Nijmegen; Sem van 't Hul; 19 jaar; geen kinderen; geen partner." },
  persoon999971797: { bsn: '999971797', description: 'Nijmegen; 39 jaar; wel kinderen; geen partner.' },
  evaVanDeKamp: { bsn: '999971803', description: 'Nijmegen; Eva van de Kamp; 30 jaar; wel kinderen; geen partner.' },
  persoon999971815: { bsn: '999971815', description: 'Nijmegen; 3 jaar.' },
  jaelDeJager: { bsn: '999992740', description: 'Andere gemeente: Den Haag; Jael De Jager; jonger dan 27 jaar.' },
  bramBloem: { bsn: '999999266', description: 'Andere gemeente; Bram Bloem; jonger dan 18 jaar.' },
  adamArendsen: { bsn: '999998791', description: 'Andere gemeente; Adam Arendsen; 27+; meerdere kinderen; partner.' },
  albertZaal: { bsn: '999993471', description: 'Andere gemeente; Albert Zaal; geboren in 1963; IOAW-optie; WW stopgezet.' },
  melanoThathiaZestafoni: { bsn: '999993033', description: 'Andere gemeente; Melano Thathia Zestafoni; RNI; geen Nederlandse nationaliteit.' },
  persoon999990743: { bsn: '999990743', description: 'Andere gemeente; geboren in 2010 (15 jaar); veel diakrieten.' },
  persoon999991383: { bsn: '999991383', description: 'Andere gemeente; geboren in 2008 (17 jaar).' },
  persoon999990962: { bsn: '999990962', description: 'Andere gemeente; geen leeftijd of geboortedatum bekend.' },
} as const satisfies Record<string, DigiDSimulatorPerson>;
