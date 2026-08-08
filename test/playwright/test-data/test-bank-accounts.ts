export type TestBankAccount = {
  accountNumber: string;
  format: 'iban' | 'non-iban';
};

/** Reusable fictional bank account numbers for form tests. */
export const testBankAccounts = {
  gbTestIban: { accountNumber: 'GB33BUKB20201555555555', format: 'iban' },
  nlTestIban: { accountNumber: 'NL02ABNA0123456789', format: 'iban' },
} as const satisfies Record<string, TestBankAccount>;
