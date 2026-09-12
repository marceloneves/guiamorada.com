/** Perguntas frequentes das páginas de construtoras — usadas no HTML e no schema FAQPage. */
export function construtoraFaq(cidade: string): { p: string; r: string }[] {
  return [
    {
      p: 'Qual a diferença entre construtora e incorporadora?',
      r: 'A incorporadora é quem organiza o empreendimento: compra o terreno, registra a incorporação, define o projeto e vende as unidades. A construtora é quem executa a obra. Muitas empresas acumulam os dois papéis, e é por isso que esta lista reúne os dois CNAEs — 4110-7/00 (incorporação de empreendimentos imobiliários) e 4120-4/00 (construção de edifícios).',
    },
    {
      p: 'Como saber se a incorporação do empreendimento está registrada?',
      r: 'Antes de vender unidades na planta, a incorporadora precisa registrar o memorial de incorporação no Cartório de Registro de Imóveis — é a exigência do artigo 32 da Lei 4.591/1964. Peça o número do registro (o "R-" da incorporação) e confirme na matrícula do terreno, direto no cartório. Sem esse registro, a venda na planta é irregular.',
    },
    {
      p: 'O que é patrimônio de afetação e por que ele importa?',
      r: 'É o regime, previsto na Lei 10.931/2004, em que o terreno e tudo que se arrecada naquele empreendimento ficam separados do restante do patrimônio da incorporadora. Se a empresa quebrar, a obra não é arrastada junto e os compradores têm chance de concluí-la. A adoção é opcional e consta na matrícula: vale perguntar se o empreendimento tem patrimônio de afetação.',
    },
    {
      p: 'Existe prazo de tolerância para atraso de obra?',
      r: 'Sim. A Lei 13.786/2018 admite prorrogação de até 180 dias corridos sobre a data prevista de entrega, desde que esteja expressa no contrato. Passado esse prazo, o comprador pode pedir a rescisão com devolução dos valores pagos ou manter o contrato com a indenização prevista. Confira a cláusula de prazo e a de penalidade antes de assinar.',
    },
    {
      p: `Como comparar construtoras em ${cidade}?`,
      r: `Veja há quanto tempo a empresa está aberta, visite entregas anteriores dela em ${cidade}, peça a relação de obras concluídas e converse com moradores sobre assistência técnica e qualidade de acabamento. Confirme o CNPJ ativo na Receita Federal, o registro do responsável técnico no CREA ou no CAU e procure processos em nome da empresa nos tribunais de justiça.`,
    },
    {
      p: 'O que pedir antes de fechar a compra na planta?',
      r: 'Memorial de incorporação registrado, matrícula atualizada do terreno, memorial descritivo com as marcas e os padrões de acabamento, quadro de áreas, cronograma da obra, minuta do contrato com prazo e índice de reajuste, certidões negativas da incorporadora e a convenção de condomínio. Leve tudo para um advogado antes de assinar.',
    },
  ];
}
