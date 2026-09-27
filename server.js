/**
 * server.js
 * API REST - Sistema de Controle de Produção com Estoque e Relatórios
 *
 * Recurso principal: /ordens
 * Relatório consolidado: /relatorios/ordens
 */

const express = require("express");
const {
  codigoOrdemExiste,
  calcularCamposOrdem,
  validarPayloadCriacao,
  validarPayloadAtualizacao,
} = require("./regras");
const { gerarRelatorioOrdens } = require("./relatorios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


let ordens = [];


app.post("/ordens", (req, res) => {
  const body = req.body;

  const { valido, erros } = validarPayloadCriacao(body);
  if (!valido) {
    return res.status(400).json({ erro: "Dados inválidos.", detalhes: erros });
  }

  if (codigoOrdemExiste(ordens, body.codigoOrdem)) {
    return res.status(400).json({
      erro: `Já existe uma ordem cadastrada com codigoOrdem "${body.codigoOrdem}".`,
    });
  }

  const novaOrdem = calcularCamposOrdem({
    codigoOrdem: body.codigoOrdem,
    codigoProduto: body.codigoProduto,
    tipoProduto: Number(body.tipoProduto),
    quantidadeProduzida: body.quantidadeProduzida,
    custoUnitarioBase: body.custoUnitarioBase,
    estoqueInicial: body.estoqueInicial,
  });

  ordens.push(novaOrdem);

  return res.status(201).json(novaOrdem);
});


app.get("/ordens", (req, res) => {
  let resultado = ordens;

  const { tipo, alerta } = req.query;

  if (tipo !== undefined) {
    const tipoNum = Number(tipo);
    resultado = resultado.filter((ordem) => ordem.tipoProduto === tipoNum);
  }

  if (alerta !== undefined) {
    const alertaStr = String(alerta).toUpperCase();
    resultado = resultado.filter((ordem) => ordem.alertaEstoque === alertaStr);
  }

  return res.status(200).json(resultado);
});


app.get("/ordens/:codigoOrdem", (req, res) => {
  const { codigoOrdem } = req.params;
  const ordem = ordens.find((o) => String(o.codigoOrdem) === String(codigoOrdem));

  if (!ordem) {
    return res.status(404).json({ erro: `Ordem "${codigoOrdem}" não encontrada.` });
  }

  return res.status(200).json(ordem);
});


app.put("/ordens/:codigoOrdem", (req, res) => {
  const { codigoOrdem } = req.params;
  const index = ordens.findIndex((o) => String(o.codigoOrdem) === String(codigoOrdem));

  if (index === -1) {
    return res.status(404).json({ erro: `Ordem "${codigoOrdem}" não encontrada.` });
  }

  const body = req.body;
  const { valido, erros } = validarPayloadAtualizacao(body);
  if (!valido) {
    return res.status(400).json({ erro: "Dados inválidos.", detalhes: erros });
  }

  const ordemAtual = ordens[index];

  const dadosAtualizados = {
    codigoOrdem: ordemAtual.codigoOrdem,
    codigoProduto: body.codigoProduto ?? ordemAtual.codigoProduto,
    tipoProduto:
      body.tipoProduto !== undefined ? Number(body.tipoProduto) : ordemAtual.tipoProduto,
    quantidadeProduzida:
      body.quantidadeProduzida !== undefined
        ? body.quantidadeProduzida
        : ordemAtual.quantidadeProduzida,
    custoUnitarioBase:
      body.custoUnitarioBase !== undefined
        ? body.custoUnitarioBase
        : ordemAtual.custoUnitarioBase,
    estoqueInicial:
      body.estoqueInicial !== undefined ? body.estoqueInicial : ordemAtual.estoqueInicial,
  };

  const ordemRecalculada = calcularCamposOrdem(dadosAtualizados);
  ordens[index] = ordemRecalculada;

  return res.status(200).json(ordemRecalculada);
});


app.delete("/ordens/:codigoOrdem", (req, res) => {
  const { codigoOrdem } = req.params;
  const index = ordens.findIndex((o) => String(o.codigoOrdem) === String(codigoOrdem));

  if (index === -1) {
    return res.status(404).json({ erro: `Ordem "${codigoOrdem}" não encontrada.` });
  }

  ordens.splice(index, 1);

  return res.status(200).json({ mensagem: `Ordem "${codigoOrdem}" removida com sucesso.` });
});


app.get("/relatorios/ordens", (req, res) => {
  const relatorio = gerarRelatorioOrdens(ordens);
  return res.status(200).json(relatorio);
});


app.get("/", (req, res) => {
  res.json({
    mensagem: "API de Controle de Produção com Estoque e Relatórios",
    endpoints: [
      "POST /ordens",
      "GET /ordens",
      "GET /ordens/:codigoOrdem",
      "PUT /ordens/:codigoOrdem",
      "DELETE /ordens/:codigoOrdem",
      "GET /relatorios/ordens",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

module.exports = app;