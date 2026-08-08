function openFormsBaseUrl(): string {
  const value = process.env.OPEN_FORMS_BASE_URL;

  if (!value) {
    throw new Error('OPEN_FORMS_BASE_URL ontbreekt. Kopieer .env.example naar .env en vul de URL in.');
  }

  return value;
}

export function openFormsUrl(path: string): string {
  return new URL(path, openFormsBaseUrl()).toString();
}
