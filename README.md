# Serviço Core (Usuários + Ordens de Pagamento)

API NestJS + TypeORM + PostgreSQL responsável pelo cadastro de usuários e pelo ciclo de vida das
ordens de pagamento, incluindo o webhook que o gateway de pagamento chama para confirmar ou
cancelar um pagamento. É um dos 2 microsserviços do desafio **Tech Challenge Fase 4 (Pós Tech
SOAT)**: uma plataforma de revenda de veículos automotores.

Este serviço é dono dos módulos **`users`** e **`payment_order`**, com banco de dados isolado
(`car_sales_core`). O outro serviço do desafio ("car-sales", repositório irmão) é dono de
**veículos** e **vendas** e tem seu próprio banco isolado. Os dois se comunicam **apenas via
HTTP**.

## Regras de negócio implementadas

- CRUD de usuários.
- Criação de ordens de pagamento (`payment_order`), vinculadas a uma venda do serviço car-sales
  por `saleId`, com um `paymentCode` único gerado no servidor (UUID) e devolvido ao chamador.
- **Webhook de pagamento**: `PATCH /payment-order/webhook/:paymentCode`, usado pela entidade que
  processa o pagamento para informar, a partir do código do pagamento, se ele foi efetuado ou
  cancelado. Esse webhook atualiza a ordem de pagamento localmente e propaga o resultado para o
  serviço car-sales, para que a venda/o veículo sejam finalizados ou liberados.

## Arquitetura e fluxo entre os serviços

```
[car-sales] ── POST /payment-order { saleId, totalPrice } ──▶ [core]
                                                                cria PaymentOrder
                                                                (status=pending,
                                                                 paymentCode=uuid)
                                                        ◀──── { paymentCode, ... }

[gateway de pagamento] ──▶ PATCH /payment-order/webhook/:paymentCode { status }
   core:
     1. busca a PaymentOrder pelo paymentCode (404 se não existir)
     2. atualiza o status (completed | cancelled)
     3. HTTP PATCH CAR_SALES_SERVICE_URL/sales/:saleId/payment-status { status } ──▶ [car-sales]
        se essa chamada falhar, o webhook responde 503 — o gateway de pagamento pode
        reenviar o webhook com segurança, pois reaplicar o mesmo status é idempotente
```

## Rotas da API

| Método | Rota                                   | Descrição                                                        |
|--------|------------------------------------------|-------------------------------------------------------------------|
| POST   | `/users`                                 | Cadastra um usuário                                                |
| GET    | `/users`                                 | Lista usuários                                                     |
| GET    | `/users/:id`                             | Busca um usuário por id                                            |
| PATCH  | `/users/:id`                              | Edita um usuário                                                   |
| DELETE | `/users/:id`                              | Remove um usuário                                                  |
| POST   | `/payment-order`                         | Cria uma ordem de pagamento (chamado pelo serviço car-sales)       |
| GET    | `/payment-order`                         | Lista ordens de pagamento                                          |
| GET    | `/payment-order/:id`                     | Busca uma ordem de pagamento por id                                |
| PATCH  | `/payment-order/:id`                      | Atualização genérica de uma ordem de pagamento                    |
| DELETE | `/payment-order/:id`                      | Remove uma ordem de pagamento                                      |
| PATCH  | `/payment-order/webhook/:paymentCode`     | Webhook do gateway de pagamento (`status: completed\|cancelled`)   |
| GET    | `/`                                       | Healthcheck (boilerplate Nest)                                     |

Documentação interativa (Swagger) disponível em `/api/docs` após subir a aplicação.

## Variáveis de ambiente

Veja `.env.example`. Resumo:

| Variável                    | Descrição                                                                 |
|-----------------------------|----------------------------------------------------------------------------|
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Conexão com o Postgres deste serviço (`car_sales_core`) |
| `PORT`                       | Porta HTTP da aplicação (padrão 3000)                                     |
| `CAR_SALES_SERVICE_URL`      | Base URL do serviço car-sales, usada pelo webhook para chamar `/sales/:id/payment-status` |

## Como rodar localmente

### Sozinho (sem o serviço car-sales)

```bash
npm install
docker compose up -d postgres02
npm run migration:run
npm run start:dev
```

Sem `CAR_SALES_SERVICE_URL` configurada, o webhook atualiza a ordem de pagamento localmente mas
responde `503` ao tentar notificar o serviço car-sales (o restante da API funciona normalmente).

### Junto com o serviço car-sales (fluxo completo, para a demo)

Os dois `docker-compose.yml` (deste repositório e do repositório `car-sales`) compartilham uma
rede Docker externa chamada `car-sales-net`, para que os containers das duas aplicações consigam
se chamar pelo nome do serviço.

```bash
docker network create car-sales-net   # uma única vez

# neste repositório
docker compose up -d --build

# no repositório car-sales
docker compose up -d --build
```

Ajuste as portas publicadas no host (`ports:` em cada `docker-compose.yml`) se for rodar os dois
serviços na mesma máquina ao mesmo tempo, para não colidir na porta 3000.

## Testes e cobertura

```bash
npm test            # suíte completa
npm run test:cov    # com relatório de cobertura (gate de 80% configurado no jest.coverageThreshold)
```

O comando `test:cov` falha automaticamente se qualquer métrica (statements, branches, functions,
lines) ficar abaixo de 80%.

## CI/CD

- `.github/workflows/ci.yml`: roda a suíte de testes com cobertura em todo push para `main`/`master`
  e em todo Pull Request.
- `.github/workflows/cd.yml`: em todo push para `main` (ou seja, após merge de um PR), builda a
  imagem Docker e publica em `ghcr.io/<owner>/<repo>` (tags `latest` e o SHA do commit).
