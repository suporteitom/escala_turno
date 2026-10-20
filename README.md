# Escala de Turnos 2026

Aplicação web para planear escalas de turnos 24/7: grelha por trimestre, cobertura mínima por turno com alertas, saldo de férias e edição de pessoas, equipas e turnos. Os dados iniciais vêm da planilha `Escala_2026_v_10_0_1.xls`.

## Estrutura

    index.html        Página (estrutura)
    css/styles.css    Estilos (tema claro/escuro)
    js/app.js         Lógica: grelha, cobertura, alertas, férias, configuração, CSV
    js/seed.js        Dados iniciais da planilha (códigos por pessoa e dia)
    api/state.js      Função serverless do Vercel: guarda o estado num Redis (Upstash)
    server.js         Servidor local opcional (Node, sem dependências), guarda o estado em storage/state.json
    Dockerfile        Imagem para publicar fora do Vercel
    .vercelignore     Ficheiros que o Vercel não precisa (server.js, Dockerfile)

## Publicar no Vercel

O Vercel não guarda ficheiros entre pedidos, por isso a partilha de dados usa um Redis (Upstash) através de `api/state.js`.

1. Ponha esta pasta num repositório no GitHub (ou, em alternativa, instale a CLI com `npm i -g vercel` e corra `vercel` dentro da pasta).
2. No Vercel: **Add New → Project**, importe o repositório e faça **Deploy**. Não precisa de comando de build nem de framework.
3. No projeto, abra **Storage** e crie ou ligue um **Upstash Redis** (Marketplace). O Vercel acrescenta as variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` (a função também aceita `KV_REST_API_URL` e `KV_REST_API_TOKEN`). Confirme em **Settings → Environment Variables**.
4. Recomendado: em **Settings → Environment Variables** crie `EDIT_PASSWORD` com uma palavra-passe. Sem ela, qualquer pessoa com o endereço pode alterar a escala.
5. Faça **Redeploy** para as variáveis ficarem ativas.

Ao abrir a página pela primeira vez, aparece a escala inicial da planilha; a primeira alteração grava o estado no Redis. Quem editar será questionado uma vez pela palavra-passe (fica guardada no navegador). A leitura da escala continua aberta a quem tiver o endereço.

Sem o passo 3, a página funciona na mesma, mas cada pessoa vê só a sua cópia (guardada no navegador).

## Como correr localmente

**Só a página (sem partilha de dados):** abra o `index.html` ou publique a pasta em qualquer alojamento estático (Netlify, Vercel, GitHub Pages). Os dados ficam no navegador de cada utilizador.

**Com partilha entre utilizadores:** `node server.js` (Node 18 ou superior) e abra http://localhost:3000. Todos os utilizadores passam a ver e editar a mesma escala. O estado fica em `storage/state.json`.

**Docker:** `docker build -t escala . && docker run -p 3000:3000 -v escala-data:/app/storage escala`

## Como funciona a persistência

Ao abrir, a página pede `api/state` ao servidor. Se não houver servidor (alojamento estático) ou ainda não houver dados, usa o `localStorage` e, na falta dele, a escala inicial de `js/seed.js`. Cada alteração é gravada no `localStorage` e enviada ao servidor.

## Limites atuais e como escalar

- **Autenticação simples:** no Vercel, a palavra-passe de edição protege a gravação, mas não a leitura, e é única para todos. O `server.js` local não tem palavra-passe. Para perfis por pessoa (chefe de equipa, colaborador), acrescente um login a sério.
- **Sem controlo de edições simultâneas:** a última gravação vence. Para várias pessoas a editar ao mesmo tempo, passe o estado para uma base de dados (PostgreSQL ou SQLite) com uma linha por pessoa e dia, e trocar `PUT /api/state` por pedidos de alteração de uma célula.
- **Sem histórico:** um registo de quem alterou o quê precisa da base de dados.
- **Ano fixo (2026):** a constante `Y` no início de `js/app.js` define o ano; os feriados nacionais estão em `HOL` (a Páscoa e o Corpo de Deus mudam todos os anos).
- **Mínimos de serviço:** editáveis na página; os valores iniciais estão em `MINS` (noite 1, manhã 2, tarde 2, intermédio 2, como na aba Aux da planilha).
- **Código "A":** aparece na planilha sem legenda; está identificado como "Sem legenda (A)".
