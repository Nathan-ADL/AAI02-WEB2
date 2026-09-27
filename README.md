# API de Controle de Produção com Estoque e Relatórios

API REST em Node.js + Express para gerenciar ordens de produção de uma indústria automotiva.

## Como rodar

```bash
npm install
npm start
```

O servidor sobe em `http://localhost:3000`.

## Estrutura

- `server.js` — rotas Express (POST/GET/PUT/DELETE de `/ordens` e `GET /relatorios/ordens`).
- `regras.js` — validações (código único, tipoProduto) e cálculo dos campos derivados.
- `relatorios.js` — geração do relatório consolidado.

## Endpoints

| Método | Rota                     | Descrição                                   |
|--------|--------------------------|----------------------------------------------|
| POST   | `/ordens`                | Cadastra uma nova ordem de produção          |
| GET    | `/ordens`                | Lista ordens (filtros `?tipo=` e `?alerta=`) |
| GET    | `/ordens/:codigoOrdem`   | Retorna uma ordem específica                 |
| PUT    | `/ordens/:codigoOrdem`   | Atualiza uma ordem e recalcula os campos     |
| DELETE | `/ordens/:codigoOrdem`   | Remove uma ordem                             |
| GET    | `/relatorios/ordens`     | Relatório consolidado de todas as ordens     |

## Exemplo de corpo para POST /ordens

```json
{
  "codigoOrdem": "OP1",
  "codigoProduto": "P100",
  "tipoProduto": 1,
  "quantidadeProduzida": 100,
  "custoUnitarioBase": 10,
  "estoqueInicial": 200
}
```

## Regras de negócio implementadas

- `estoqueFinal = estoqueInicial + quantidadeProduzida`
- `custoUnitarioAjustado`: Padrão (tipo 1) = custo base; Premium (tipo 2) = +10%; Sob encomenda (tipo 3) = +20%
- `custoTotal = quantidadeProduzida * custoUnitarioAjustado`
- `alertaEstoque`: `ALTO` se `estoqueFinal > 5000`, `CRITICO` se `< 500`, senão `NORMAL`
- `codigoOrdem` deve ser único (validado no POST)
- `tipoProduto` deve ser 1, 2 ou 3 (validado com switch + loop)

Testado manualmente com curl — todos os endpoints (criação, listagem, filtros, busca por código, atualização com recálculo, remoção e relatório) responderam corretamente, incluindo os casos de erro (código duplicado → 400, ordem inexistente → 404).