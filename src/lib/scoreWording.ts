/** Türkçe skor başlıkları — “Sen kazandı” gibi hatalı çekimleri önler */

function isSecondPerson(name: string): boolean {
  const n = name.trim().toLocaleLowerCase('tr-TR');
  return n === 'sen' || n === 'senı' || n === 'ben';
}

/** Maç sonu */
export function matchWinnerLine(name: string): string {
  if (isSecondPerson(name)) return 'Sen kazandın!';
  return `${name.trim()} kazandı!`;
}

/** Tur sonu — “önde” yerine net sıralama */
export function roundLeaderLine(name: string): string {
  if (isSecondPerson(name)) return 'Sen 1. sıradasın';
  return `1. sıra · ${name.trim()}`;
}

export function tieLine(): string {
  return 'Berabere';
}
