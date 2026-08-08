export type KvKAddress = {
  type: 'bezoekadres' | 'correspondentieadres';
  hasPostbus: boolean;
};

export type KvKTestCompany = {
  kvkNumber: string;
  name: string;
  sourcePath: '_embedded.hoofdvestiging' | '_embedded.eigenaar';
  addresses: readonly KvKAddress[];
};

/**
 * KVK testbedrijven voor formulieren die Handelsregistergegevens inladen.
 * Houd de verwachte bron en adresvarianten hier bij zodat dezelfde set later
 * ook voor eHerkenning-scenario's gebruikt kan worden.
 */
export const kvkTestCompanies = {
  emzDagobert: {
    kvkNumber: '69599084',
    name: 'Test EMZ Dagobert',
    sourcePath: '_embedded.hoofdvestiging',
    addresses: [{ type: 'bezoekadres', hasPostbus: false }],
  },
  nvKatrien: {
    kvkNumber: '68727720',
    name: 'Test NV Katrien',
    sourcePath: '_embedded.hoofdvestiging',
    addresses: [{ type: 'correspondentieadres', hasPostbus: true }, { type: 'bezoekadres', hasPostbus: false }],
  },
  localFunzoom: {
    kvkNumber: '90004760',
    name: 'Local Funzoom',
    sourcePath: '_embedded.eigenaar',
    addresses: [{ type: 'correspondentieadres', hasPostbus: true }, { type: 'bezoekadres', hasPostbus: false }],
  },
  bvDonald: {
    kvkNumber: '68750110',
    name: 'Test BV Donald',
    sourcePath: '_embedded.hoofdvestiging',
    addresses: [{ type: 'correspondentieadres', hasPostbus: true }, { type: 'bezoekadres', hasPostbus: false }],
  },
  grandContex: {
    kvkNumber: '90001354',
    name: 'Grand Contex BV',
    sourcePath: '_embedded.hoofdvestiging',
    addresses: [{ type: 'correspondentieadres', hasPostbus: true }],
  },
  stichtingBolderbast: {
    kvkNumber: '69599068',
    name: 'Test Stichting Bolderbast',
    sourcePath: '_embedded.eigenaar',
    addresses: [{ type: 'bezoekadres', hasPostbus: false }],
  },
} as const satisfies Record<string, KvKTestCompany>;
