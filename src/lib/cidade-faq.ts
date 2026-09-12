/** Perguntas frequentes das páginas de cidade — usadas no HTML e no schema FAQPage. */
export function cidadeFaq(cidade: string): { p: string; r: string }[] {
  return [
    {
      p: `Quanto custa a comissão de uma imobiliária em ${cidade}?`,
      r: 'Na venda de imóvel urbano a comissão costuma ficar entre 5% e 6% do valor do negócio, percentual que segue as tabelas de honorários publicadas pelos CRECIs estaduais. Na locação, o mais comum é uma taxa de administração de 8% a 12% do aluguel mensal, além da taxa de intermediação equivalente a parte do primeiro aluguel. O percentual é negociável e precisa estar escrito no contrato antes do início do trabalho.',
    },
    {
      p: 'Como saber se a imobiliária tem CRECI ativo?',
      r: 'Todo o registro é público: o CRECI do estado mantém consulta on-line por nome, CPF/CNPJ ou número de inscrição. Peça o número da inscrição da empresa (CRECI-J) e do corretor que vai atender (CRECI-F) e confira antes de assinar qualquer documento ou pagar qualquer valor.',
    },
    {
      p: 'Quem paga a comissão na venda: comprador ou vendedor?',
      r: 'Por praxe no Brasil, a comissão é paga por quem contratou a imobiliária — normalmente o vendedor — e sai do valor recebido na venda. Nada impede acordo diferente, desde que esteja claro no contrato de intermediação e no momento do pagamento (em geral, na assinatura da escritura ou na liberação do financiamento).',
    },
    {
      p: 'Qual a diferença entre imobiliária e corretor autônomo?',
      r: 'A imobiliária é pessoa jurídica com inscrição CRECI-J e uma equipe de corretores; o corretor autônomo tem inscrição CRECI-F e responde individualmente pelo atendimento. A imobiliária costuma oferecer estrutura de administração de aluguel e carteira maior de imóveis; o autônomo, atendimento mais direto. Ambos precisam de registro ativo para intermediar negócios.',
    },
    {
      p: 'A imobiliária pode cobrar para anunciar o meu imóvel?',
      r: 'Cobrança antecipada só para cadastrar ou anunciar um imóvel não é prática usual do mercado — a remuneração do trabalho de intermediação é a comissão, devida quando o negócio se concretiza. Se houver qualquer taxa prévia, exija a descrição por escrito do que ela cobre.',
    },
    {
      p: `Como escolher uma imobiliária em ${cidade}?`,
      r: `Compare pelo menos três opções da lista desta página, confirme o CRECI ativo, verifique há quanto tempo a empresa está aberta e se ela atua na região do seu imóvel. Pergunte quem será o corretor responsável, peça o contrato de intermediação por escrito e cheque prazo, exclusividade e valor da comissão antes de assinar.`,
    },
  ];
}
