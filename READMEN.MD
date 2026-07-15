# Octopus Crowd — Roadmap de Execução (Hackathon TxLINE × Solana World Cup)

**Prazo:** submissão até 19/07/2026, 23h59 UTC
**Janelas de jogo real:** semifinais 14-15/07, 3º lugar 18/07, final 19/07 (mesmo dia do fechamento)
**Posicionamento:** skill game de instinto de torcedor, zero stake/aposta, wallet só como identidade
**Track:** Consumer & Fan Experiences

---


solana-cli 2.2.0 (src:8b11c7d5; feat:3294202862, client:Agave)




## Dia 0 (13/07) — Fundação

### 1. Confirmar inscrição e credenciais do hackathon
- [ ] Confirmar que o cadastro em superteam.fun/earn/hackathon/world-cup/ está feito e vinculado a uma wallet/entidade elegível a prêmio.
- [ ] Entrar no Discord/Telegram da TxODDS (links no edital) — é onde bug de API se resolve em tempo real, não espera suporte por e-mail.
- [ ] Ler os Termos e Condições do hackathon uma vez, de verdade (não por cima) — principalmente a parte de jogos de azar, já que seu posicionamento depende de ficar claramente do lado "skill game", não "aposta".

### 2. Criar contas de infraestrutura (todas sem cartão)
- [ ] Conta no Vercel (login com GitHub facilita o deploy automático depois).
- [ ] Conta no Neon (Postgres) — cria um projeto, guarda a `DATABASE_URL` em lugar seguro (gerenciador de senha, não em chat, não em texto solto).
- [ ] Repositório público no GitHub — obrigatório pra submissão de qualquer forma, cria já.

### 3. Wallet de desenvolvimento (separada da sua pessoal)
- [ ] Gera um keypair Solana novo, só pra esse projeto. Não reusa wallet com fundos reais nem em mainnet nem em devnet — mesmo sem risco de dinheiro, é hábito ruim misturar chave de projeto com chave pessoal.
- [ ] Guarda a secret key só em `.env` local e em GitHub Secrets — nunca commitada, nem em exemplo, nem comentada.
- [ ] Pede SOL de devnet via faucet (`solana airdrop` no CLI, ou o faucet web da Solana) pra essa wallet. Isso paga as taxas de transação do `subscribe`.

### 4. Estrutura do repositório
Monorepo simples, três pastas — isso evita duplicar tipos e lógica de regras entre o worker de ingestão e a API:
```
octopus-crowd/
├── apps/
│   ├── web/          → Next.js (frontend + API routes), deploy no Vercel
│   └── ingest/        → script Node que roda no GitHub Actions durante os jogos
├── packages/
│   └── core/          → tipos compartilhados, schema do banco, engine de regras
├── .github/workflows/
└── scripts/           → seed, dataset de replay, utilitários
```
- [ ] Node 20+ instalado localmente (exigência da própria doc da TxLINE por causa do cliente SSE).
- [ ] `pnpm` ou `npm workspaces` configurado pro monorepo.

---

## Dia 0-1 (13-14/07) — Camada 0: núcleo blindado

Esta é a parte que não pode falhar. Ataca primeiro porque é a que tem mais chance de esconder um problema chato (assinatura errada, rede errada, etc).

### 5. Integração TxLINE de ponta a ponta em devnet
Ordem exata, não pula etapa:
1. `POST /auth/guest/start` no host devnet → recebe o JWT de guest.
2. Monta a transação on-chain de `subscribe` (service level `1`, `SELECTED_LEAGUES = []` pro bundle padrão gratuito da Copa) e assina com a wallet de dev.
3. Confirma a transação na rede (`connection.confirmTransaction`).
4. Monta a mensagem de ativação exatamente como a doc pede: `` `${txSig}:${leagues.join(",")}:${jwt}` ``. Repara que com `leagues = []` isso vira `txSig::jwt` — dois pontos seguidos, não um. Esse é o erro mais comum de quem integra essa API.
5. Assina essa mensagem (não a transação, a *mensagem*) com `signMessage`, codifica em base64.
6. `POST /api/token/activate` com `txSig`, `walletSignature`, `leagues`, header `Authorization: Bearer <jwt>` → recebe o token de API ativado.
7. Guarda esse token em GitHub Secrets e em `.env` local. **Nunca em variável `NEXT_PUBLIC_*` do Next.js** — isso vaza no bundle do navegador.

**Checkpoint de validação:** antes de seguir, faz uma chamada simples de fixtures ou scores com `Authorization: Bearer <jwt>` + `X-Api-Token: <token>` e confirma que volta dado de verdade. Se voltar 401, renova o JWT (ele expira, o token de API não). Se voltar 403, o problema está na mensagem assinada, na wallet, ou na rede — nessa ordem de suspeita.

### 6. Testes desse fluxo (não pula isso, é o ponto de maior risco técnico)
- [ ] Teste automatizado que roda o fluxo subscribe → activate contra devnet real e falha alto e claro se qualquer etapa quebrar. Você vai rodar isso várias vezes enquanto debuga — não quer descobrir na madrugada do dia 18 que a JWT expirou no meio do processo sem saber onde.
- [ ] Documenta no README os erros que você já bateu a cabeça (network mismatch, host errado, etc) — isso também vira parte da "Documentação Técnica Resumida" que o edital pede, incluindo a seção de feedback sobre a API.

---

## Dia 1 (14/07) — Primeira janela ao vivo real

### 7. Worker de ingestão
- [ ] Script Node que conecta no stream SSE de odds/scores da TxLINE e normaliza cada evento num formato único (tipo de evento, time, minuto, timestamp do servidor TxLINE — não o seu relógio local).
- [ ] Escreve cada evento normalizado no Neon via driver HTTP serverless (`@neondatabase/serverless`), tabela de eventos brutos primeiro, sem lógica de negócio ainda.
- [ ] Empacota isso num workflow do GitHub Actions (`workflow_dispatch` pra disparo manual, `timeout-minutes: 180` pra cobrir prorrogação).

### 8. Rodar contra a semifinal de hoje
- [ ] Dispara o workflow uns 10-15 min antes do kickoff.
- [ ] Acompanha ao vivo se os eventos estão chegando e sendo salvos certo — isso é o seu único teste real antes do dia 18, trata como ensaio geral, não como "só pra ver".
- [ ] No fim do jogo, esse conjunto de eventos vira automaticamente seu **dataset de replay**. Guarda ele separado (export ou tabela própria), porque é isso que vai alimentar sua demo se não der pra gravar contra jogo ao vivo depois.

**Se algo quebrar aqui**, você ainda tem a semifinal de amanhã (15/07) como segunda tentativa antes de precisar confiar 100% no que já gravou.

---

## Dia 1-2 (14-15/07) — Camada 1: engine de regras (em paralelo, com dado gravado)

Não precisa esperar acabar a ingestão pra começar isso — desenvolve contra o dataset que você já gravou no passo 8.

### 9. Engine de resolução de desafios (`packages/core`)
- [ ] Define os tipos de desafio do V1 (recomendo começar com **próximo gol** — é o mais fácil de resolver sem ambiguidade — e adicionar **próximo cartão** como segundo tipo se sobrar tempo).
- [ ] Lógica de criação: quando abrir um novo desafio pra um jogo ao vivo (ex.: a cada X minutos ou depois que o anterior resolve).
- [ ] Lógica de resolução: quando o evento relevante chega do stream, resolve o desafio, marca quem acertou, atualiza streak/score.
- [ ] **Trava a janela de resposta pelo timestamp do evento da TxLINE, nunca pelo relógio do cliente.** Esse é o ponto de integridade mais importante do produto — sem isso, dá pra "prever" depois que o gol já saiu.

### 10. Testes da engine de regras — é aqui que TDD paga o investimento
- [ ] Casos felizes: usuário acerta, usuário erra, streak sobe, streak zera.
- [ ] Casos de borda: dois eventos chegam fora de ordem, evento duplicado do stream, usuário tenta responder depois do desafio já resolvido, usuário não responde a tempo, partida é interrompida/adiada.
- [ ] Esses testes rodam contra o dataset gravado no passo 8 — não precisa de jogo ao vivo pra validar a engine, só pra validar a ingestão.

---

## Dia 2-3 (15-16/07) — Camada 1: frontend

### 11. Telas principais (Next.js + TypeScript + Tailwind)
Ordem de construção, não de importância — constrói na ordem que desbloqueia teste mais rápido:
1. **Match Room** primeiro — é a tela que prova o produto funciona (scoreboard, card do desafio atual, botão de resposta em 1 toque, timer visual). Testa direto contra o dataset de replay.
2. **Home** — lista de jogos live/próximos/encerrados.
3. **Result Screen** — acerto/erro, pontos, streak, próximo desafio.
4. **Ranking** — semanal, top players, posição do usuário.
5. **Perfil** — 2-3 frases geradas por regra a partir do histórico ("You predict corners better than goals").

### 12. Modo replay como cidadão de primeira classe, não gambiarra
- [ ] O app não deveria ter um "modo replay" separado tecnicamente — deveria ler de uma fonte de eventos que tanto pode ser o stream ao vivo real quanto o dataset gravado, sem o frontend saber a diferença. Isso é o que garante que sua demo do dia 19 seja idêntica à experiência real, e é exatamente o argumento que você usa no vídeo quando falar "e aqui está rodando contra dado real capturado on-chain da semifinal".

---

## Dia 3-4 (16-17/07) — Camada 2: CrowdBrain (diferencial real)

Essa é a camada que te tira do cluster de concorrentes que eu te mostrei antes (Jupiter Predict, Hunch Cup, Prediction Arena, etc.) — todos eles são "aposte e ganhe", nenhum constrói identidade analítica. É aqui que o pitch de originalidade se sustenta.

### 13. Reputação e progressão
- [ ] Score de confiabilidade: taxa de acerto, consistência, especialidade por tipo de desafio, performance ao vivo vs. o que seria esperado.
- [ ] Sistema de progressão simples: novato (só palpites simples) → avançado (desafios compostos, janelas curtas).
- [ ] Perfil mais rico: não só 3 frases fixas, frases que mudam de fato com base nos números do usuário.

### 14. Identidade on-chain (o gancho técnico que ninguém mais tem)
- [ ] Vincula o perfil à wallet (já está feito desde o login).
- [ ] Emite um badge simples on-chain de participação/season — não precisa de contrato pesado, o foco do track é fan UX, não settlement.
- [ ] **O diferencial de verdade:** vincula o resultado do desafio ao proof de validação que a própria TxLINE expõe (endpoint de validation proofs). No pitch, isso vira "seu streak não é calculado por um servidor meu em quem você tem que confiar — é verificável contra o oráculo". Nenhum concorrente do cluster que te mostrei faz isso, porque nenhum deles usa TxLINE.

---

## Dia 5 (18/07) — Segunda janela ao vivo + polish

### 15. Terceiro lugar como segundo teste real
- [ ] Roda o workflow de ingestão de novo, agora contra um app quase completo — esse é o teste de integração final antes do prazo.
- [ ] Se algo quebrar que não quebrou na semifinal, é sinal de bug introduzido nos últimos dias — corrige na hora, não deixa acumular.

### 16. Deploy e revisão final
- [ ] Deploy de produção no Vercel, confere que as env vars de produção (não as de dev) estão certas.
- [ ] Passa o olho em tudo com a lente de "um jurado que nunca viu isso vai entender em 10 segundos o que fazer?" — onboarding de 5 segundos é literalmente critério de julgamento (UX pra fã leigo).
- [ ] Revisão de segurança rápida: token de API não aparece em nenhuma chamada de rede visível no DevTools do navegador, secrets não estão no repositório público (roda um `git log -p | grep -i secret` ou similar antes de dar push final), rate limit básico no endpoint de resposta pra evitar spam.

---

## Dia 6 (19/07) — Submissão

### 17. Vídeo de demo (até 5 min — isso decide praticamente tudo)
Estrutura que casa com os critérios de julgamento, nessa ordem:
1. O problema em 15-20s: fã assiste com celular na mão, mas experiência hoje é passiva.
2. Abre o app, entra num jogo em segundos — mostra a fricção zero do onboarding.
3. Responde um desafio ao vivo (ou via replay da semifinal/3º lugar, deixa claro que é dado real capturado, não mockado).
4. Sistema reage a um evento real, streak sobe, ranking atualiza.
5. Mostra o perfil — o "fan instinct" — esse é o momento que carrega a originalidade.
6. 20-30s explicando tecnicamente como a TxLINE alimenta tudo (fixtures/odds/scores + o proof de validação, se deu tempo de implementar).
7. Fecha com o posicionamento: "não é aposta, é um teste de instinto de torcedor" — e uma frase sobre caminho de monetização (branded challenges, private leagues, whitelabel pra mídia esportiva).

### 18. Checklist de submissão (não deixa nada de fora, desclassificação é automática se faltar algo)
- [ ] Link do vídeo (Loom/YouTube).
- [ ] Link funcional do app deployado (Vercel) ou endpoint de API testável.
- [ ] Repositório público com README claro.
- [ ] Documentação técnica resumida: ideia central, aspectos técnicos/comerciais, lista dos endpoints TxLINE específicos usados.
- [ ] Resposta ao pedido de feedback do edital sobre a experiência de usar a API TxLINE — isso é rápido de escrever e é ponto ganho de graça com o patrocinador.
- [ ] Confere que o texto todo do produto está em inglês se o público-alvo do pitch for internacional (jurados do hackathon), ajusta se necessário.

---

## Notas finais

- **Se alguma camada acima da 1 não terminar**, tudo bem — Camada 0+1 sozinha já é um produto completo e submissível. É pra isso que a ordem por risco existe: você nunca fica sem nada pra entregar, só fica sem a cereja do topo.
- **Não deixa a integração de subscribe/activate pro fim.** É a parte com mais chance de esconder um erro chato de assinatura/rede, e é a única que, se quebrar, derruba o projeto inteiro — todo o resto depende dela.
- Volta nesse arquivo sempre que precisar se situar de novo — ele reflete as decisões que já validamos juntos (posicionamento, arquitetura, ordem de risco), não precisa reargumentar do zero.





vnspo@vinicius:~/dev/octopus-crowd$ export ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
export ANCHOR_WALLET=/home/vnspo/.config/solana/id.json
pnpm --filter ingest exec tsx src/subscribe-activate.ts
(node:27296) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Fazendo subscribe...
txSig: 4kTVq2f33zCFXxPGAFVCiyHsofPNmAaS2K8oK9vDuMffzEJwEQJzupAHh1kikUYhG1rv36Q35PGdeznGd1a34EqX
Pegando JWT...
Ativando...
Status: 200
Body completo: txoracle_api_e5c9b531a9024bcb808dfb1c50f10c68

=======================================================
TXLINE_JWT=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3ODY2NjE2MDYsInNlc3Npb25JZCI6Ijg4YjQ1OGEzLTBjN2ItNDE5OC1iMDgxLTIxNGMyYTg4NTZhOSIsInJvbGUiOiJndWVzdCIsIm1heWJlQ2xpZW50SXAiOiIxOC42OC4xLjE0OCJ9.0e2JYcb7noKBRLxg4JAGueeGX2gdRduAqWkdsyeEdUFZegrq-jBHnjmajdV_P1ga83nQErRBdz7dj_rOopH0-A
TXLINE_API_KEY=txoracle_api_e5c9b531a9024bcb808dfb1c50f10c68
=======================================================


https://console.neon.tech/app/projects/calm-dew-65015479?database=neondb&branchId=br-dawn-meadow-ataz9w0u