/**
 * relatorios.js
 * Geração do relatório consolidado de ordens de produção.
 */

const NOME_TIPO = {
  1: "padrao",
  2: "premium",
  3: "sobEncomenda",
};

function gerarRelatorioOrdens(ordens) {
  const totalOrdens = ordens.length;

  
  const estoquePorTipo = { padrao: 0, premium: 0, sobEncomenda: 0 };

 
  const quantidadeAlertas = { alto: 0, critico: 0, normal: 0 };

  const porProdutoMap = {};

  let somaCustoTotal = 0;
  let ordemMaisCara = null;
  let ordemMaisBarata = null;

  for (const ordem of ordens) {
    const chaveTipo = NOME_TIPO[ordem.tipoProduto];
    if (chaveTipo) {
      estoquePorTipo[chaveTipo] += ordem.estoqueFinal;
    }

    switch (ordem.alertaEstoque) {
      case "ALTO":
        quantidadeAlertas.alto += 1;
        break;
      case "CRITICO":
        quantidadeAlertas.critico += 1;
        break;
      case "NORMAL":
        quantidadeAlertas.normal += 1;
        break;
      default:
        break;
    }

    somaCustoTotal += ordem.custoTotal;

    if (!ordemMaisCara || ordem.custoTotal > ordemMaisCara.custoTotal) {
      ordemMaisCara = { codigoOrdem: ordem.codigoOrdem, custoTotal: ordem.custoTotal };
    }
    if (!ordemMaisBarata || ordem.custoTotal < ordemMaisBarata.custoTotal) {
      ordemMaisBarata = { codigoOrdem: ordem.codigoOrdem, custoTotal: ordem.custoTotal };
    }

    if (!porProdutoMap[ordem.codigoProduto]) {
      porProdutoMap[ordem.codigoProduto] = {
        codigoProduto: ordem.codigoProduto,
        estoqueFinalConsolidado: 0,
        valorTotalInvestido: 0,
      };
    }
    porProdutoMap[ordem.codigoProduto].estoqueFinalConsolidado += ordem.estoqueFinal;
    porProdutoMap[ordem.codigoProduto].valorTotalInvestido += ordem.custoTotal;
  }

  const mediaCustoTotalPorOrdem = totalOrdens > 0 ? somaCustoTotal / totalOrdens : 0;

  return {
    totalOrdens,
    estoquePorTipo,
    mediaCustoTotalPorOrdem,
    ordemMaisCara,
    ordemMaisBarata,
    quantidadeAlertas,
    porProduto: Object.values(porProdutoMap),
  };
}

module.exports = { gerarRelatorioOrdens };