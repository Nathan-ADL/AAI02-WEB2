const TIPOS_PRODUTO = [1, 2, 3];


function validarTipoProduto(tipoProduto) {
  let valido = false;

  for (let i = 0; i < TIPOS_PRODUTO.length; i++) {
    switch (TIPOS_PRODUTO[i]) {
      case tipoProduto:
        valido = true;
        break;
      default:
        break;
    }
    if (valido) break;
  }

  return valido;
}


function codigoOrdemExiste(ordens, codigoOrdem) {
  return ordens.some((ordem) => ordem.codigoOrdem === codigoOrdem);
}


function calcularCustoUnitarioAjustado(tipoProduto, custoUnitarioBase) {
  switch (tipoProduto) {
    case 1:
      return custoUnitarioBase;
    case 2:
      return custoUnitarioBase * 1.1;
    case 3:
      return custoUnitarioBase * 1.2;
    default:
      throw new Error("tipoProduto inválido para cálculo de custo ajustado.");
  }
}

function calcularAlertaEstoque(estoqueFinal) {
  if (estoqueFinal > 5000) return "ALTO";
  if (estoqueFinal < 500) return "CRITICO";
  return "NORMAL";
}


function calcularCamposOrdem(dados) {
  const {
    codigoOrdem,
    codigoProduto,
    tipoProduto,
    quantidadeProduzida,
    custoUnitarioBase,
    estoqueInicial,
  } = dados;

  const estoqueFinal = estoqueInicial + quantidadeProduzida;
  const custoUnitarioAjustado = calcularCustoUnitarioAjustado(
    tipoProduto,
    custoUnitarioBase
  );
  const custoTotal = quantidadeProduzida * custoUnitarioAjustado;
  const alertaEstoque = calcularAlertaEstoque(estoqueFinal);

  return {
    codigoOrdem,
    codigoProduto,
    tipoProduto,
    quantidadeProduzida,
    custoUnitarioBase,
    estoqueInicial,
    estoqueFinal,
    custoUnitarioAjustado,
    custoTotal,
    alertaEstoque,
  };
}


function validarPayloadCriacao(body) {
  const erros = [];

  if (body.codigoOrdem === undefined || body.codigoOrdem === null || body.codigoOrdem === "") {
    erros.push("codigoOrdem é obrigatório.");
  }
  if (!body.codigoProduto) {
    erros.push("codigoProduto é obrigatório.");
  }
  if (body.tipoProduto === undefined || !validarTipoProduto(Number(body.tipoProduto))) {
    erros.push("tipoProduto deve ser 1 (Padrão), 2 (Premium) ou 3 (Sob encomenda).");
  }
  if (typeof body.quantidadeProduzida !== "number" || body.quantidadeProduzida < 0) {
    erros.push("quantidadeProduzida deve ser um número maior ou igual a 0.");
  }
  if (typeof body.custoUnitarioBase !== "number" || body.custoUnitarioBase < 0) {
    erros.push("custoUnitarioBase deve ser um número maior ou igual a 0.");
  }
  if (typeof body.estoqueInicial !== "number" || body.estoqueInicial < 0) {
    erros.push("estoqueInicial deve ser um número maior ou igual a 0.");
  }

  return { valido: erros.length === 0, erros };
}


function validarPayloadAtualizacao(body) {
  const erros = [];

  if (body.tipoProduto !== undefined && !validarTipoProduto(Number(body.tipoProduto))) {
    erros.push("tipoProduto deve ser 1 (Padrão), 2 (Premium) ou 3 (Sob encomenda).");
  }
  if (
    body.quantidadeProduzida !== undefined &&
    (typeof body.quantidadeProduzida !== "number" || body.quantidadeProduzida < 0)
  ) {
    erros.push("quantidadeProduzida deve ser um número maior ou igual a 0.");
  }
  if (
    body.custoUnitarioBase !== undefined &&
    (typeof body.custoUnitarioBase !== "number" || body.custoUnitarioBase < 0)
  ) {
    erros.push("custoUnitarioBase deve ser um número maior ou igual a 0.");
  }
  if (
    body.estoqueInicial !== undefined &&
    (typeof body.estoqueInicial !== "number" || body.estoqueInicial < 0)
  ) {
    erros.push("estoqueInicial deve ser um número maior ou igual a 0.");
  }

  return { valido: erros.length === 0, erros };
}

module.exports = {
  validarTipoProduto,
  codigoOrdemExiste,
  calcularCustoUnitarioAjustado,
  calcularAlertaEstoque,
  calcularCamposOrdem,
  validarPayloadCriacao,
  validarPayloadAtualizacao,
};