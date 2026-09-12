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

export type Regiao = 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul' | 'Exterior';

export const REGIOES: Regiao[] = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul', 'Exterior'];

export const ESTADOS: Record<string, { nome: string; regiao: Regiao; prep: 'no' | 'na' | 'em' }> = {
  AC: { nome: 'Acre', regiao: 'Norte', prep: 'no' },
  AP: { nome: 'Amapá', regiao: 'Norte', prep: 'no' },
  AM: { nome: 'Amazonas', regiao: 'Norte', prep: 'no' },
  PA: { nome: 'Pará', regiao: 'Norte', prep: 'no' },
  RO: { nome: 'Rondônia', regiao: 'Norte', prep: 'em' },
  RR: { nome: 'Roraima', regiao: 'Norte', prep: 'em' },
  TO: { nome: 'Tocantins', regiao: 'Norte', prep: 'no' },
  AL: { nome: 'Alagoas', regiao: 'Nordeste', prep: 'em' },
  BA: { nome: 'Bahia', regiao: 'Nordeste', prep: 'na' },
  CE: { nome: 'Ceará', regiao: 'Nordeste', prep: 'no' },
  MA: { nome: 'Maranhão', regiao: 'Nordeste', prep: 'no' },
  PB: { nome: 'Paraíba', regiao: 'Nordeste', prep: 'na' },
  PE: { nome: 'Pernambuco', regiao: 'Nordeste', prep: 'em' },
  PI: { nome: 'Piauí', regiao: 'Nordeste', prep: 'no' },
  RN: { nome: 'Rio Grande do Norte', regiao: 'Nordeste', prep: 'no' },
  SE: { nome: 'Sergipe', regiao: 'Nordeste', prep: 'em' },
  DF: { nome: 'Distrito Federal', regiao: 'Centro-Oeste', prep: 'no' },
  GO: { nome: 'Goiás', regiao: 'Centro-Oeste', prep: 'em' },
  MT: { nome: 'Mato Grosso', regiao: 'Centro-Oeste', prep: 'em' },
  MS: { nome: 'Mato Grosso do Sul', regiao: 'Centro-Oeste', prep: 'em' },
  ES: { nome: 'Espírito Santo', regiao: 'Sudeste', prep: 'no' },
  MG: { nome: 'Minas Gerais', regiao: 'Sudeste', prep: 'em' },
  RJ: { nome: 'Rio de Janeiro', regiao: 'Sudeste', prep: 'no' },
  SP: { nome: 'São Paulo', regiao: 'Sudeste', prep: 'em' },
  PR: { nome: 'Paraná', regiao: 'Sul', prep: 'no' },
  RS: { nome: 'Rio Grande do Sul', regiao: 'Sul', prep: 'no' },
  SC: { nome: 'Santa Catarina', regiao: 'Sul', prep: 'em' },
  EX: { nome: 'Exterior', regiao: 'Exterior', prep: 'no' },
};

export function getEstadoNome(uf: string): string {
  return ESTADOS[uf]?.nome ?? uf;
}

export function getRegiao(uf: string): Regiao {
  return ESTADOS[uf]?.regiao ?? 'Exterior';
}

export function slugifyRegiao(regiao: Regiao): string {
  return regiao
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-');
}

/** Capital de cada UF, pelo cidadeSlug usado no índice gerado. */
export const CAPITAIS: Record<string, string> = {
  AC: 'rio-branco',
  AL: 'maceio',
  AP: 'macapa',
  AM: 'manaus',
  BA: 'salvador',
  CE: 'fortaleza',
  DF: 'brasilia',
  ES: 'vitoria',
  GO: 'goiania',
  MA: 'sao-luis',
  MT: 'cuiaba',
  MS: 'campo-grande-ms',
  MG: 'belo-horizonte',
  PA: 'belem',
  PB: 'joao-pessoa',
  PR: 'curitiba',
  PE: 'recife',
  PI: 'teresina',
  RJ: 'rio-de-janeiro',
  RN: 'natal',
  RS: 'porto-alegre',
  RO: 'porto-velho',
  RR: 'boa-vista-rr',
  SC: 'florianopolis',
  SP: 'sao-paulo',
  SE: 'aracaju',
  TO: 'palmas-to',
};

/** As 27 capitais presentes no índice, em ordem alfabética de cidade. */
export function getCapitais(index: CidadeIndexEntry[]): CidadeIndexEntry[] {
  const collator = new Intl.Collator('pt-BR');
  return Object.entries(CAPITAIS)
    .map(([uf, cidadeSlug]) => index.find((c) => c.estado === uf && c.cidadeSlug === cidadeSlug))
    .filter((c): c is CidadeIndexEntry => Boolean(c))
    .sort((a, b) => collator.compare(a.cidade, b.cidade));
}

/** Estado com a preposição correta: "no Acre", "na Bahia", "em Minas Gerais". */
export function getEstadoLabel(uf: string): string {
  const estado = ESTADOS[uf];
  if (!estado) return uf;
  return `${estado.prep} ${estado.nome}`;
}

/** Estado no genitivo: "do Acre", "da Bahia", "de Minas Gerais". */
export function getEstadoGenitivo(uf: string): string {
  const estado = ESTADOS[uf];
  if (!estado) return uf;
  const artigo = estado.prep === 'no' ? 'do' : estado.prep === 'na' ? 'da' : 'de';
  return `${artigo} ${estado.nome}`;
}
