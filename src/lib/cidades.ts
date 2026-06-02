export interface ImobiliariaCadastro {
  id: string;
  razaoSocial: string;
  nomeComercial: string;
  nome: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    completo: string;
  };
  telefone: string;
  segmento: string;
  areaAtuacao: string;
  dataAbertura: string;
  porte: string;
  naturezaJuridica: string;
}

export interface CidadeData {
  slug: string;
  prep: 'em' | 'no';
  cidade: string;
  estado: string;
  cidadeSlug: string;
  total: number;
  totalPages: number;
  imobiliarias: ImobiliariaCadastro[];
}

export interface CidadeIndexEntry {
  slug: string;
  prep: 'em' | 'no';
  cidade: string;
  estado: string;
  cidadeSlug: string;
  total: number;
  totalPages: number;
}

export const IMOBILIARIAS_POR_PAGINA = 20;

export function getPrepositionLabel(prep: 'em' | 'no', cidade: string): string {
  return prep === 'no' ? `no ${cidade}` : `em ${cidade}`;
}

export function paginateImobiliarias<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

export function getWhatsAppLink(telefone: string, nome: string): string | null {
  const digits = telefone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  const number = digits.startsWith('55') ? digits : `55${digits}`;
  const msg = encodeURIComponent(`Olá! Vi a ${nome} no Guia Morada e gostaria de mais informações.`);
  return `https://wa.me/${number}?text=${msg}`;
}
