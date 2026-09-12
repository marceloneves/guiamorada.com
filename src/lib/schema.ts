import type { Corretor, Imobiliaria } from '../types/directory';
import type { CidadeData, ImobiliariaCadastro } from './cidades';
import { getEstadoNome, getPrepositionLabel } from './cidades';
import { cidadeFaq } from './cidade-faq';

export const SITE_URL = 'https://guiamorada.com';
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const CONTATO = {
  email: 'contato@guiamorada.com',
  telefone: '+5548988105199',
  whatsapp: 'https://wa.me/5548988105199',
};

/** Converte um caminho interno em URL absoluta com barra final (trailingSlash: 'always'). */
export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  const withSlash = clean.endsWith('/') || clean.includes('.') ? clean : `${clean}/`;
  return `${SITE_URL}${withSlash}`;
}

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Guia Morada',
    alternateName: 'Guia Morada — Diretório Imobiliário',
    url: `${SITE_URL}/`,
    description:
      'Registro de imobiliárias e corretores de imóveis em cada cidade do Brasil.',
    email: CONTATO.email,
    telephone: CONTATO.telefone,
    sameAs: [CONTATO.whatsapp],
    areaServed: { '@type': 'Country', name: 'Brasil' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'atendimento',
      email: CONTATO.email,
      telephone: CONTATO.telefone,
      availableLanguage: ['pt-BR'],
    },
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: 'Guia Morada',
    inLanguage: 'pt-BR',
    publisher: { '@id': ORG_ID },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function webPageSchema(opts: {
  type?: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ProfilePage';
  path: string;
  name: string;
  description: string;
  about?: unknown;
}) {
  return {
    '@type': opts.type ?? 'WebPage',
    '@id': `${absoluteUrl(opts.path)}#webpage`,
    url: absoluteUrl(opts.path),
    name: opts.name,
    description: opts.description,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': WEBSITE_ID },
    ...(opts.about ? { about: opts.about } : {}),
  };
}

export function itemListSchema(items: { name: string; path: string }[], name?: string) {
  return {
    '@type': 'ItemList',
    ...(name ? { name } : {}),
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

/** Imobiliária vinda da base de cadastros (dados públicos por cidade). */
export function imobiliariaCadastroSchema(
  imobiliaria: ImobiliariaCadastro,
  cidade: CidadeData,
  position: number,
) {
  const endereco = imobiliaria.endereco;
  // Alguns cadastros trazem nome fantasia vazio ou só pontuação; nesse caso vale a razão social.
  const fantasia = (imobiliaria.nomeComercial || imobiliaria.nome || '').trim();
  const nome = /[a-z0-9]/i.test(fantasia) ? fantasia : imobiliaria.razaoSocial;
  return {
    '@type': 'ListItem',
    position,
    item: {
      '@type': 'RealEstateAgent',
      name: nome,
      ...(imobiliaria.razaoSocial && imobiliaria.razaoSocial !== nome
        ? { legalName: imobiliaria.razaoSocial }
        : {}),
      ...(imobiliaria.telefone ? { telephone: imobiliaria.telefone } : {}),
      ...(imobiliaria.areaAtuacao ? { description: imobiliaria.areaAtuacao } : {}),
      address: {
        '@type': 'PostalAddress',
        ...(endereco.logradouro
          ? {
              streetAddress: [
                [endereco.logradouro, endereco.numero].filter(Boolean).join(', '),
                endereco.bairro,
              ]
                .filter(Boolean)
                .join(' - '),
            }
          : {}),
        addressLocality: endereco.cidade || cidade.cidade,
        addressRegion: endereco.estado || cidade.estado,
        addressCountry: 'BR',
        ...(endereco.cep ? { postalCode: endereco.cep } : {}),
      },
      areaServed: {
        '@type': 'City',
        name: cidade.cidade,
        containedInPlace: { '@type': 'State', name: getEstadoNome(cidade.estado) },
      },
    },
  };
}

/** Imobiliária do diretório editorial (perfil completo). */
export function imobiliariaSchema(imobiliaria: Imobiliaria) {
  const path = `/imobiliarias/${imobiliaria.slug}/`;
  return {
    '@type': 'RealEstateAgent',
    '@id': `${absoluteUrl(path)}#imobiliaria`,
    name: imobiliaria.nome,
    url: absoluteUrl(path),
    description: imobiliaria.descricao,
    ...(imobiliaria.slogan ? { slogan: imobiliaria.slogan } : {}),
    ...(imobiliaria.logo ? { logo: absoluteUrl(imobiliaria.logo) } : {}),
    ...(imobiliaria.capa ? { image: absoluteUrl(imobiliaria.capa) } : {}),
    telephone: imobiliaria.telefone,
    email: imobiliaria.email,
    ...(imobiliaria.site ? { sameAs: [imobiliaria.site] } : {}),
    ...(imobiliaria.anoFundacao ? { foundingDate: String(imobiliaria.anoFundacao) } : {}),
    identifier: { '@type': 'PropertyValue', name: 'CRECI', value: imobiliaria.creci },
    address: {
      '@type': 'PostalAddress',
      ...(imobiliaria.endereco.rua ? { streetAddress: imobiliaria.endereco.rua } : {}),
      addressLocality: imobiliaria.endereco.cidade,
      addressRegion: imobiliaria.endereco.estado,
      addressCountry: 'BR',
    },
    areaServed: { '@type': 'City', name: imobiliaria.endereco.cidade },
  };
}

export function corretorSchema(corretor: Corretor, imobiliaria?: Imobiliaria) {
  const path = `/corretores/${corretor.slug}/`;
  return {
    '@type': 'RealEstateAgent',
    '@id': `${absoluteUrl(path)}#corretor`,
    name: corretor.nome,
    url: absoluteUrl(path),
    description: corretor.bio,
    ...(corretor.foto ? { image: absoluteUrl(corretor.foto) } : {}),
    telephone: corretor.telefone,
    email: corretor.email,
    identifier: { '@type': 'PropertyValue', name: 'CRECI', value: corretor.creci },
    address: {
      '@type': 'PostalAddress',
      addressLocality: corretor.endereco.cidade,
      addressRegion: corretor.endereco.estado,
      addressCountry: 'BR',
    },
    areaServed: { '@type': 'City', name: corretor.endereco.cidade },
    ...(imobiliaria
      ? {
          worksFor: {
            '@type': 'RealEstateAgent',
            name: imobiliaria.nome,
            url: absoluteUrl(`/imobiliarias/${imobiliaria.slug}/`),
          },
        }
      : {}),
  };
}

export function faqSchema(items: { p: string; r: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.p,
      acceptedAnswer: { '@type': 'Answer', text: item.r },
    })),
  };
}

export function planoServiceSchema(plano: {
  nome: string;
  descricao: string;
  semestral: number;
  anual: number;
}) {
  const offer = (preco: number, meses: number, nome: string) => ({
    '@type': 'Offer',
    name: nome,
    price: preco.toFixed(2),
    priceCurrency: 'BRL',
    url: absoluteUrl('/anuncie/'),
    availability: 'https://schema.org/InStock',
    eligibleDuration: { '@type': 'QuantitativeValue', value: meses, unitCode: 'MON' },
  });

  return {
    '@type': 'Service',
    name: `Anúncio no Guia Morada — plano ${plano.nome}`,
    serviceType: 'Anúncio em diretório imobiliário',
    description: plano.descricao,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'Brasil' },
    offers: [
      offer(plano.semestral, 6, `Plano ${plano.nome} semestral`),
      offer(plano.anual, 12, `Plano ${plano.nome} anual`),
    ],
  };
}

/** Página de listagem de imobiliárias de uma cidade (inclusive páginas 2+). */
export function cidadeListingSchema(
  data: CidadeData,
  page: number,
  imobiliariasNaPagina: ImobiliariaCadastro[],
) {
  const path = page === 1 ? `/${data.slug}/` : `/${data.slug}/${page}/`;
  const prepLabel = getPrepositionLabel(data.prep, data.cidade);
  const nome = `Imobiliárias ${prepLabel}${page > 1 ? ` — página ${page}` : ''}`;
  const estadoNome = getEstadoNome(data.estado);
  const descricao = `Lista de ${data.total.toLocaleString('pt-BR')} imobiliárias ${prepLabel} (${data.estado}).`;
  const inicio = (page - 1) * imobiliariasNaPagina.length;

  return [
    {
      ...webPageSchema({
        type: 'CollectionPage',
        path,
        name: nome,
        description: descricao,
        about: {
          '@type': 'City',
          name: data.cidade,
          containedInPlace: { '@type': 'State', name: estadoNome, addressCountry: 'BR' },
        },
      }),
      dateModified: new Date().toISOString().split('T')[0],
    },
    breadcrumbSchema([
      { name: 'Início', path: '/' },
      { name: 'Imobiliárias', path: '/imobiliarias/' },
      { name: 'Cidades', path: '/imobiliarias/cidades/' },
      { name: data.cidade, path: `/${data.slug}/` },
      ...(page > 1 ? [{ name: `Página ${page}`, path }] : []),
    ]),
    {
      '@type': 'ItemList',
      name: nome,
      numberOfItems: data.total,
      itemListElement: imobiliariasNaPagina.map((imob, i) =>
        imobiliariaCadastroSchema(imob, data, inicio + i + 1),
      ),
    },
    // O bloco de conteúdo (e o FAQ) só existe na página 1 da cidade.
    ...(page === 1 ? [faqSchema(cidadeFaq(data.cidade))] : []),
  ];
}
