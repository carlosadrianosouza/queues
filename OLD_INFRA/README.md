## Requerimentos
- NPM
- Docker
- Typescript
- NodeJS 18

## Instalação
```bash 
npm install
```

## Building

```bash 
npm run build:dev
npm run build:hml
npm run build:prd
```

## Testes unitários
```bash 
npm run test
npm run test:watch
npm run test:ui
```

## Testando

Para testar, execute:

```bash 
npm run dev
```

Após subir o serviço, faça uma requisição POST para `http://localhost:3333/api/trigger/{trigger-name}`, conforme exemplo:

```bash 
curl --request POST \
  --url http://localhost:3333/api/trigger/fn-back-affiliates \
  --header 'Content-Type: application/json' \
  --data '{
	"queue":"sb-q-voomp-creators-back-affiliates-hml",
	"class":"App\\Http\\Controllers\\NameController",
	"method":"runTeste",
	"args": [1, 2, 3, 4]
}'
```

A aplicação de deve receber os dados do payload da requisição e fazer um novo POST para a ENV `APP_BACK_API_URL` adicionado o token (`APP_BACK_API_TOKEN`) no header. 

## Diagrama do fluxo geral
![diagram-queues-image](./.docs/diagram-queues.png)
