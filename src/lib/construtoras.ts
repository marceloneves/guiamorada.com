import type { ImobiliariaCadastro } from './cidades';

/** Mesma forma dos cadastros de imobiliária, com o CNPJ público e o CNAE principal. */
export interface ConstrutoraCadastro extends ImobiliariaCadastro {
  cnpj: string;
  cnae: string;
}

export interface ConstrutoraCidadeData {
  slug: string;
  prep: 'em' | 'no';
  cidade: string;
  cidadeSlug: string;
  estado: string;
  total: number;
  totalPages: number;
  empresas: ConstrutoraCadastro[];
}

export interface ConstrutoraIndexEntry {
  slug: string;
  prep: 'em' | 'no';
  cidade: string;
  cidadeSlug: string;
  estado: string;
  total: number;
  totalPages: number;
}

export const CONSTRUTORAS_POR_PAGINA = 20;

export const CNAES_CONSTRUCAO: Record<string, string> = {
  '4110700': 'Incorporação de empreendimentos imobiliários',
  '4120400': 'Construção de edifícios',
};
