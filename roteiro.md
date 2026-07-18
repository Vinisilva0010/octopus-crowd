# Octopus Crowd — Roteiro de Vídeo de Demo

**Formato:** blocos de narração, cada um mapeado à tela/ação que grava no DaVinci.
**Duração alvo:** ~4 min de narração (o edital permite até 5 min — deixa folga pra cortes/transições).
**Regra de ouro:** tudo que aparece na tela é 100% real — dado real, gol real, proof real. Nada fabricado.

---

## Bloco 0 — Abertura (tela: logo/intro, sem gravação de app ainda)

**Ação de tela:** card de abertura com o polvo, animação suave, título "Octopus Crowd".

**PT:**
> A maioria dos fãs assiste à Copa do Mundo com o celular na mão. Mas a experiência hoje é passiva — atualizar o placar, rolar um feed, esperar algo acontecer.

**EN:**
> Most fans watch the World Cup with their phone in hand. But today's experience is passive — refresh a score, scroll a feed, wait for something to happen.

---

## Bloco 1 — Apresentando o produto (tela: sua página `/how-it-works`, slide 2 ou 3)

**Ação de tela:** scroll pelos slides de explicação (problema → o que você faz).

**PT:**
> Octopus Crowd transforma cada partida da Copa numa sequência de micro-desafios em tempo real. Próximo gol, próximo escanteio, próximo cartão — um toque, antes de acontecer, alimentado pelo feed ao vivo da TxLINE.

**EN:**
> Octopus Crowd turns every World Cup match into a sequence of real-time micro-challenges. Next goal, next corner, next card — one tap, before it happens, powered by TxLINE's live feed.

---

## Bloco 2 — Login com wallet (tela: Home, clicar em "Select Wallet", conectar)

**Ação de tela:** grava o clique no botão de wallet e a conexão real acontecendo.

**PT:**
> Entrar é rápido — só a wallet Solana, sem senha, sem cadastro. E repara: a wallet aqui não guarda nem arrisca nenhum valor. Ela é só identidade. Isso não é uma casa de apostas.

**EN:**
> Getting in is fast — just your Solana wallet, no password, no signup. And notice: the wallet here never holds or risks any funds. It's identity only. This is not a sportsbook.

---

## Bloco 3 — Escolhendo a partida (tela: Home, lista de fixtures reais da Copa)

**Ação de tela:** grava a lista de jogos reais puxada ao vivo da TxLINE (a mesma que aparece hoje, com World Cup e outras competições).

**PT:**
> Cada partida que aparece aqui vem direto da API oficial da TxLINE, em tempo real — inclusive os próprios jogos da Copa do Mundo 2026.

**EN:**
> Every match listed here comes straight from TxLINE's live API — including the actual 2026 World Cup fixtures.

---

## Bloco 4 — Match Room, respondendo o desafio (tela: Match Room, dado real capturado)

**Ação de tela:** aqui é onde você usa o replay do gol real. Grava a tela mostrando o desafio "Próximo gol" aberto, e você clicando numa das opções com a wallet conectada.

**PT:**
> Essa é a Match Room. O sistema abre um desafio de previsão em tempo real — aqui, capturamos esse momento de uma partida real, com os dados exatos que a TxLINE transmitiu ao vivo.

**EN:**
> This is the Match Room. The system opens a live prediction challenge — here, we captured this moment from a real match, using the exact data TxLINE streamed live.

---

## Bloco 5 — Resolução automática (tela: mesma Match Room, depois de rodar o `curl` de resolve)

**Ação de tela:** grava a tela atualizando sozinha pra "Resolvido", streak aparecendo.

**PT:**
> Quando o gol acontece de verdade no feed, o sistema resolve o desafio sozinho — sem intervenção manual — e atualiza a sequência de acertos do torcedor na hora.

**EN:**
> When the goal actually happens in the feed, the system resolves the challenge on its own — no manual step — and updates the fan's streak instantly.

---

## Bloco 6 — O diferencial: prova verificável (tela: clicar em "Ver prova verificável", mostrar o JSON do Merkle proof)

**Ação de tela:** clica no link, mostra o proof real na tela (pode dar um zoom no DaVinci em cima do `eventStatRoot` ou `statProof`).

**PT:**
> E aqui está o que nos diferencia: cada resultado é verificável contra uma prova criptográfica real do oráculo da TxLINE — Merkle proof, ao vivo. Não é "confia em mim". É matematicamente checável.

**EN:**
> And here's what sets us apart: every result is checked against a real cryptographic proof from the TxLINE oracle — a live Merkle proof. It's not "trust us." It's mathematically verifiable.

---

## Bloco 7 — Perfil e reputação (tela: `/profile`, streak, frase de perfil)

**Ação de tela:** grava a tela de perfil com os números reais e a frase gerada.

**PT:**
> Cada resposta constrói o perfil do torcedor — não é só pontuação, é uma leitura de que tipo de fã ele é. Isso é o que chamamos de instinto de torcedor.

**EN:**
> Every answer builds the fan's profile — not just a score, a read on what kind of fan they are. This is what we call fan instinct.

---

## Bloco 8 — Ranking (tela: `/ranking`)

**Ação de tela:** grava o ranking.

**PT:**
> E toda semana, os melhores leitores de jogo sobem no ranking — competindo por reconhecimento, não por dinheiro.

**EN:**
> And every week, the best game-readers climb the leaderboard — competing for recognition, not money.

---

## Bloco 9 — Fechamento (tela: card final, ou volta pro logo)

**PT:**
> Octopus Crowd não é uma casa de apostas disfarçada. É uma camada de engajamento em tempo real pra torcedores e marcas de mídia esportiva — construída sobre dado real, verificável, da TxLINE.

**EN:**
> Octopus Crowd is not a sportsbook in disguise. It's a real-time engagement layer for fans and sports media brands — built on real, verifiable TxLINE data.

---

## Notas de produção

- **Blocos 2, 3, 4, 5, 6, 7, 8** são gravação de tela real — nada precisa de Gemini, é o app rodando de verdade.
- **Blocos 0, 1, 9** são os únicos onde imagem gerada faz sentido, porque são cartões de abertura/fechamento, não telas do produto — aí sim pode caprichar visualmente sem risco nenhum de parecer fabricação.
- Se quiser prompt pro Gemini pra esses cartões de abertura/fechamento (mantendo a mesma estilização preto/roxo/amarelo do site), me pede que eu escrevo — isso eu ajudo numa boa, porque não finge ser print de funcionalidade, é peça gráfica de vídeo mesmo.
- Antes de gravar o Bloco 4/5: roda os dois comandos de replay (abrir desafio + resolver com `seq: 872, correctAnswer: participant2`) — documentado na conversa anterior — pra ter o estado certo na tela na hora de gravar.