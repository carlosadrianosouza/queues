# Voomp Queues

## Descrição
Serviço de processamento de filas da plataforma Voomp Creators. Consome mensagens de filas SQS e processa eventos assíncronos do ecossistema, com autenticação via Lambda Authorizer.

## Stack Tecnológico
- **Runtime**: Node.js / TypeScript
- **Cloud**: AWS Lambda + SQS + API Gateway
- **IaC**: Terraform
- **Testes**: Vitest

## Arquitetura
```
┌─────────────────────────────────────────────────────────────┐
│                        voomp-queues                          │
├─────────────────────────────────────────────────────────────┤
│  AWS Infrastructure (Terraform)                              │
│  ├── API Gateway                                            │
│  ├── Lambda Functions                                       │
│  ├── Lambda Authorizer                                      │
│  └── SQS Queues                                             │
├─────────────────────────────────────────────────────────────┤
│  Application (src/)                                          │
│  ├── authorizer/ (Lambda authorizer)                        │
│  ├── handlers/ (Lambda handlers)                            │
│  ├── functions/ (business logic)                            │
│  ├── helpers/ (utilities)                                   │
│  ├── commands/ (CLI commands)                               │
│  └── MessageConsumer.ts (SQS consumer)                      │
└─────────────────────────────────────────────────────────────┘
```

## Funcionalidades Principais

### Processamento de Filas
- Consumo de mensagens SQS
- Processamento assíncrono de eventos
- Retry automático em caso de falha

### Autenticação
- Lambda Authorizer customizado
- Validação de tokens JWT
- Controle de acesso por endpoint

### Handlers
- Handlers para diferentes tipos de mensagens
- Processamento paralelo
- Dead Letter Queue para falhas

## Estrutura de Diretórios
```
voomp-queues/
├── aws/
│   └── terraform/
│       └── accounts/
│           ├── modules/
│           │   ├── api-gateway/
│           │   ├── authorizer/
│           │   ├── lambda/
│           │   └── sqs/
│           └── voomp/
│               ├── dev/
│               ├── dev1/
│               ├── dev2/
│               ├── hml/
│               └── prd/
├── src/
│   ├── authorizer/
│   ├── handlers/
│   ├── functions/
│   ├── helpers/
│   ├── commands/
│   ├── config/
│   ├── exceptions/
│   ├── MessageConsumer.ts
│   └── local.ts
├── tests/
├── scripts/
└── OLD_INFRA/        # Configurações legadas
```

## Ambientes

| Ambiente | Descrição |
|----------|-----------|
| dev | Desenvolvimento |
| dev1 | Desenvolvimento 1 |
| dev2 | Desenvolvimento 2 |
| hml | Homologação |
| prd | Produção |

## Terraform

### Módulos
- **api-gateway**: Configuração do API Gateway
- **authorizer**: Lambda Authorizer
- **lambda**: Funções Lambda
- **sqs**: Filas SQS

### Deploy
```bash
cd aws/terraform/accounts/voomp/<env>
terraform init
terraform plan
terraform apply
```

## Execução Local
```bash
# Instalar dependências (em OLD_INFRA/)
cd OLD_INFRA
npm install

# Desenvolvimento
npm run dev

# Testes
npm run test
```

## Relacionamento com Outros Serviços
- **voomp-creators-api-gateway2**: Publica mensagens nas filas
- **voomp-creators-reconciliation-***: Consome eventos de reconciliação
- **voomp-creators-api-subscription2**: Eventos de assinatura

## Owners
- Time: Voomp Creators
