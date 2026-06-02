export type Especialidade =
  | 'residencial'
  | 'comercial'
  | 'rural'
  | 'luxo'
  | 'locacao'
  | 'lancamentos';

export interface Endereco {
  cidade: string;
  estado: string;
  bairro: string;
  rua?: string;
}

export interface Imobiliaria {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  slogan: string;
  logo: string;
  capa: string;
  endereco: Endereco;
  telefone: string;
  whatsapp: string;
  email: string;
  site?: string;
  creci: string;
  especialidades: Especialidade[];
  avaliacao: number;
  totalAvaliacoes: number;
  verificada: boolean;
  destaque: boolean;
  anoFundacao: number;
  corretoresCount: number;
}

export interface Corretor {
  id: string;
  slug: string;
  nome: string;
  foto: string;
  bio: string;
  endereco: Endereco;
  telefone: string;
  whatsapp: string;
  email: string;
  creci: string;
  especialidades: Especialidade[];
  avaliacao: number;
  totalAvaliacoes: number;
  verificado: boolean;
  destaque: boolean;
  imobiliariaId?: string;
  imobiliariaNome?: string;
  anosExperiencia: number;
}

export const especialidadeLabels: Record<Especialidade, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  rural: 'Rural',
  luxo: 'Alto padrão',
  locacao: 'Locação',
  lancamentos: 'Lançamentos',
};
