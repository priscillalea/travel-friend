# Trocado: especificação de produto, design e engenharia

> Assistente de viagem para o dia a dia. Cada trocado conta.
> Documento para uso no repositório (`/docs/TROCADO_SPEC.md`) e como contexto para o Claude Code.
> Todos os valores, preços, nomes de lugares e cotações nas telas são **ilustrativos**.

---

## 1. Visão

**Problema.** O turista converte preços de cabeça, perde a conta na calculadora, não sabe onde comer barato por perto, paga caro em câmbio sem perceber e perde ingressos e reservas espalhados em vários apps.

**Proposta.** Um app que foge do padrão "vendedor de itinerário" e funciona como assistente de viagem do dia a dia: conversão de moeda em listas etiquetadas, mapa de comida barata, orçamento, planos, reservas, tickets e memórias, tudo funcionando offline.

**Princípios**
1. Dinheiro claro: o usuário sempre sabe quanto algo custa na moeda dele.
2. Funciona sem internet: é onde o turista mais precisa do app.
3. Minimalista: ferramentas do cotidiano, não catálogo de atrações.
4. Confiança: nada de anúncio ou recomendação paga disfarçada, inclusive no chatbot.
5. Dados reais: o assistente de IA responde só com base em dados verificados, nunca inventa preço ou horário.

**Fases do app** (seletor no topo): **Antes** (planejar), **Durante** (usar), **Depois** (lembrar).

---

## 2. Referências visuais

As imagens ficam em `/docs/design/`. Use-as como fonte da verdade visual.

| Arquivo | Tela |
|---|---|
| `trocado_0_marca.png` | Marca, paleta e tipografia |
| `trocado_1_lista.png` | Lista com conversão de moeda |
| `trocado_2_mapa.png` | Mapa de comida barata |
| `trocado_3_assistente.png` | Assistente de IA |
| `trocado_v2_0_camera.png` | Escanear etiqueta |
| `trocado_v2_1_orcamento.png` | Orçamento durante a viagem |
| `trocado_v2_2_pagamento.png` | Custo real do pagamento |
| `trocado_v2_3_offline.png` | Offline e comunidade |
| `trocado_v3_0_plano.png` | Plano da viagem |
| `trocado_v3_1_passeios.png` | Passeios |
| `trocado_v3_2_reservas.png` | Reservas |
| `trocado_v3_3_tickets.png` | Tickets |
| `trocado_v3_4_orcamento.png` | Orçamento antes da viagem |
| `trocado_v3_5_memorias.png` | Memórias depois da viagem |

Boards gerais: `trocado_board.png`, `trocado_v2_board.png`, `trocado_v3_board.png`.

---

## 3. Design system

### Cores

| Token | Hex | Uso |
|---|---|---|
| `mar` | `#0B3C5D` | Cor principal, cabeçalhos, tab ativa |
| `sol` | `#FFC93C` | Ações principais, destaques, total |
| `poupanca` | `#17A36B` | Economia, confirmações, melhor opção |
| `nevoa` | `#EEF3F6` | Fundo das telas |
| `ceu` | `#CFE3EE` | Superfícies secundárias, mapa |
| `tinta` | `#0A1B2A` | Texto principal |
| `texto-mudo` | `#5E7384` | Texto secundário |
| `branco` | `#FFFFFF` | Cartões |

Regra: amarelo é sempre a ação ou o número mais importante da tela. Verde só para economia ou sucesso. Não usar cor como única forma de transmitir significado.

### Tipografia
- **Inter Display** para títulos e valores monetários (700 a 800, tracking -0.02em a -0.03em).
- **Inter** para texto e rótulos (500 a 600).
- Escala: título de tela 28/1.1, valor grande 32 a 40, cartão 16 a 18, corpo 15, rótulo 12 a 13, tab 11.
- Valores monetários usam números tabulares quando possível.

### Forma e espaçamento
- Margem lateral das telas: 20.
- Raio: cartões 18 a 24, painéis inferiores 28, pílulas e chips 99, ícones de tab 8.
- Separadores tracejados (`1px dashed #CFDCE5`) lembram bilhete picotado. É o motivo gráfico da marca.
- Painel inferior (bottom sheet): fundo branco, raio 28, alça de 40x5, sombra suave para cima.
- Tab bar: 84 de altura, fundo branco, item ativo em `mar` com rótulo em negrito.

### Componentes
`PhaseSwitch` (Antes/Durante/Depois), `TabBar`, `CurrencyPair` (moeda origem e destino), `PriceRow` (valor original e convertido), `TotalBar` (total fixo, amarelo), `BottomSheet`, `Chip`, `StatusChip` (confirmado, pendente), `BudgetBar`, `CategoryCard`, `TourCard`, `BookingCard`, `TicketCard` (com QR e picote), `PriceVote` (confirmar preço), `OfflineBanner`, `ChatBubble`, `PlaceCard`, `StatTile`.

### Modo escuro
Fora do primeiro lançamento. Os tokens devem ser nomeados de forma semântica para permitir a troca depois.

---

## 4. Telas

### 4.1 Listas com conversão (`trocado_1_lista.png`)
- Título com o nome da loja. Seletor `CurrencyPair` ("Tenho" e "Quero ver em") com botão de inverter.
- Linha de cotação com horário da última atualização.
- Itens: nome, quantidade, preço original (em destaque) e convertido (abaixo).
- Linha "Adicionar item" com botão amarelo.
- `TotalBar` fixa acima da tab bar com total convertido (grande) e total original.
- Regras: preço salvo na moeda original e convertido na hora da exibição; o usuário pode "congelar" a cotação da lista.

### 4.2 Mapa de comida barata (`trocado_2_mapa.png`)
- Mapa em tela cheia com pins de preço (verde = melhor custo-benefício, amarelo = padrão).
- Filtros no topo: "Perto de mim" e teto de preço.
- Painel inferior com aviso de comparação ("Tens um meal deal a 2 min a pé. Se andares mais 5 min, há opções melhores.") e lista de opções com preço, tempo a pé e economia.
- Regra: o comparativo considera preço, distância a pé e confirmações recentes da comunidade.

### 4.3 Assistente de IA (`trocado_3_assistente.png`)
- Conversa com bolhas, cartões de lugar e atalhos ("Ver no mapa", "Salvar na lista", "Outra opção").
- Conhece localização (com permissão), orçamento e lista atual.
- Respostas usam apenas dados da base própria. Se não souber, diz que não sabe.

### 4.4 Escanear etiqueta (`trocado_v2_0_camera.png`)
- Câmera com moldura amarela, preço detectado em pílula, painel inferior com item, preço original e convertido.
- Ação principal: "Adicionar à lista". Rodapé mostra a lista atual e o total.
- OCR no dispositivo. Se a confiança for baixa, pede confirmação do valor antes de adicionar.

### 4.5 Orçamento durante a viagem (`trocado_v2_1_orcamento.png`)
- Cartão principal: gasto até agora vs. total, barra de progresso, equivalente em reais, gasto do dia vs. limite diário.
- Categorias com barra (comida, compras, transporte).
- Projeção de ritmo ("terminas £12 abaixo do orçamento").

### 4.6 Custo real do pagamento (`trocado_v2_2_pagamento.png`)
- Compara pagar na moeda local (cartão) vs. pagar em reais na maquininha, com o valor final de cada uma e a diferença.
- Usa as taxas configuradas no cartão do usuário (IOF, spread). Mostra aviso de que são estimativas.
- Botão de confirmação que registra a escolha.

### 4.5b Offline e comunidade (`trocado_v2_3_offline.png`)
- Banner "Sem internet" com idade da cotação em uso.
- Pacotes baixados (cidade com mapa, lugares e preços; listas e orçamento locais) e estado de sincronização.
- `PriceVote`: "Ainda custa £2,99?" com "Sim, confirmo" e "Mudou", mostrando a última confirmação.

### 4.6b Plano da viagem (`trocado_v3_0_plano.png`)
- Seletor de dias, linha do tempo com horário, nome, observação, custo e chip "Reservado".
- Tempo de caminhada entre paradas. Rodapé com total previsto do dia.

### 4.7 Passeios (`trocado_v3_1_passeios.png`)
- Filtros: Todos, Grátis, Até £20, Ao ar livre.
- Cartão com imagem, nome, duração, política de cancelamento e botão com preço que adiciona ao plano.
- Passeios gratuitos têm destaque. É parte da proposta da marca.

### 4.8 Reservas (`trocado_v3_2_reservas.png`)
- Cartões de voo, hotel e seguro com status e prazo de cancelamento grátis.
- Pendências têm botão de ação direto.

### 4.9 Tickets (`trocado_v3_3_tickets.png`)
- Ingresso com picote, QR code, data, hora e local. Funciona offline.
- Lista de outros comprovantes (voo, hotel) logo abaixo.
- Brilho da tela aumenta automaticamente ao abrir o QR.

### 4.10 Orçamento antes da viagem (`trocado_v3_4_orcamento.png`)
- Previsto total na moeda do destino e em reais, barra e meta de economia por semana.
- Categorias editáveis (comida, passeios, transporte, compras e extras).

### 4.11 Memórias (`trocado_v3_5_memorias.png`)
- Resumo da viagem: colagem de fotos, lugares visitados, distância a pé, gastos, diferença para o orçamento.
- Compartilhar memórias e planejar a próxima viagem.

---

## 5. Arquitetura

### Stack sugerida
- **App:** React Native com Expo e TypeScript, `expo-router` para navegação.
- **Estado e dados:** TanStack Query (rede), Zustand (estado de UI), `expo-sqlite` com Drizzle ORM (banco local).
- **Mapas:** MapLibre com dados do OpenStreetMap e pacotes offline. Evitar depender de cache de dados do Google Places por causa dos termos de uso.
- **OCR:** reconhecimento de texto no dispositivo (ML Kit no Android e Vision no iOS) via módulo nativo ou biblioteca do Expo.
- **Backend:** Postgres (Supabase ou similar) com autenticação e API simples.
- **IA:** chamada a um modelo Claude sempre pelo backend (nunca direto do app), com recuperação de dados da base própria. Confirmar o modelo atual na documentação da Anthropic.
- **Câmbio:** provedor de cotações com cache no backend e no dispositivo.

### Princípios técnicos
1. **Offline-first.** O banco local é a fonte da verdade na interface. A sincronização é em segundo plano, com resolução simples de conflito (último a escrever vence, exceto votos de preço).
2. **Dinheiro sem ponto flutuante.** Guardar valores em inteiros na menor unidade (pence, centavos) mais o código da moeda ISO. Conversão com decimal de precisão fixa e arredondamento explícito.
3. **Cotação com carimbo de tempo.** Toda conversão registra qual cotação e quando foi obtida.
4. **Privacidade.** Localização só com permissão e preferencialmente quando o mapa está aberto. Conformidade com LGPD e GDPR. Fotos das memórias ficam no dispositivo por padrão.
5. **IA ancorada.** O assistente recebe do backend apenas lugares e preços verificados e instruções para não inventar. Controle de custo por usuário (limites e cache).

### Modelo de dados (resumo)
```
Trip(id, destino, inicio, fim, moeda_origem, moeda_destino, orcamento_minor)
Day(id, trip_id, data)
PlanItem(id, day_id, hora, titulo, categoria, custo_minor, moeda, booking_id?)
ShoppingList(id, trip_id, loja, moeda_origem, moeda_destino, cotacao_congelada?)
ListItem(id, list_id, nome, qtd, preco_minor, moeda)
Expense(id, trip_id, categoria, valor_minor, moeda, data, meio_pagamento)
Booking(id, trip_id, tipo, status, politica_cancelamento, dados_json)
Ticket(id, trip_id, titulo, data_hora, local, qr_payload, offline_ok)
Place(id, nome, geo, categoria, cidade)
PricePoint(id, place_id, item, preco_minor, moeda, confirmacoes, ultima_confirmacao)
PriceVote(id, price_point_id, user_id, voto, criado_em)
FxRate(par, taxa, obtida_em)
OfflinePack(cidade, versao, tamanho, baixado_em)
Memory(id, trip_id, fotos_uris, resumo_json)
```

### Monetização (futuro)
Assinatura (mapas offline ilimitados, várias viagens, listas compartilhadas) e afiliados bem escolhidos (cartão de viagem, eSIM, câmbio). Sem anúncios e sem patrocínio dentro do assistente.

---

## 6. Plano de entrega

| Fase | Entrega |
|---|---|
| 1. MVP | Listas com conversão, escanear etiqueta, offline, uma cidade (Londres) |
| 2 | Mapa de comida barata com votos da comunidade |
| 3 | Orçamento (antes e durante) e custo real do pagamento |
| 4 | Plano, passeios, reservas e tickets |
| 5 | Assistente de IA e memórias |
| 6 | Assinatura e afiliados |

Critérios de aceite do MVP: adicionar 20 itens a uma lista em modo avião sem erro; total convertido correto ao centavo; escanear 10 etiquetas reais com pelo menos 80% de acerto no primeiro disparo.

---

## 7. Instruções para o Claude Code

Cole o bloco "Contexto inicial" na primeira conversa e depois use os prompts por etapa, **um por vez**, revisando o resultado antes de seguir.

### Contexto inicial (cole primeiro)

```text
Vamos construir o app "Trocado", um assistente de viagem. Leia docs/TROCADO_SPEC.md
e as imagens em docs/design/ antes de qualquer código. Siga o design system da
seção 3 exatamente (tokens de cor, tipografia, raios). Regras:
- React Native + Expo + TypeScript, expo-router, expo-sqlite com Drizzle.
- Offline-first: o banco local é a fonte da verdade da interface.
- Dinheiro sempre em inteiros na menor unidade + código ISO da moeda. Nunca float.
- Nomeie tokens de design de forma semântica, para permitir modo escuro depois.
- Escreva testes para toda lógica de dinheiro e conversão.
- Antes de cada etapa, resuma o plano em poucas linhas e aguarde meu OK.
- Não invente dados reais de preços: use fixtures claramente marcadas como exemplo.
```

### Etapa 1: base do projeto
```text
Crie o projeto Expo com TypeScript e expo-router. Configure ESLint, Prettier e testes
(Jest). Crie a pasta src/theme com os tokens da seção 3 (cores, tipografia, espaçamento,
raios) e carregue as fontes Inter e Inter Display. Crie a tab bar com 4 abas e o
componente PhaseSwitch (Antes/Durante/Depois). Sem lógica de negócio ainda.
```

### Etapa 2: módulo de dinheiro e câmbio
```text
Crie src/domain/money: tipo Money (valor em inteiro na menor unidade + moeda ISO),
funções de soma, conversão por cotação e formatação por locale (pt-BR e en-GB).
Defina o arredondamento explicitamente e teste casos de borda (£2,50 x 7,24, totais
de 20 itens, cotações com muitas casas decimais). Crie o repositório FxRate com
carimbo de tempo e cache local, com um provedor de cotações plugável (interface) e
um provedor falso para testes.
```

### Etapa 3: listas com conversão (tela 4.1)
```text
Implemente o banco local (Drizzle + expo-sqlite) para ShoppingList e ListItem e a
tela de lista conforme docs/design/trocado_1_lista.png: CurrencyPair com inverter,
linha de cotação com horário, PriceRow, linha de adicionar item e TotalBar fixa.
Deve funcionar em modo avião. Adicione a opção de congelar a cotação da lista.
```

### Etapa 4: escanear etiqueta (tela 4.4)
```text
Implemente o scanner conforme docs/design/trocado_v2_0_camera.png usando câmera e
OCR no dispositivo. Extraia valores monetários (formatos £2.50, 2,50, £2), mostre a
pílula de preço detectado e o painel inferior com a conversão. Se a confiança for
baixa, peça confirmação antes de adicionar. Isole o OCR atrás de uma interface para
poder trocar de biblioteca e testar com imagens de exemplo.
```

### Etapa 5: offline e sincronização (tela 4.5b)
```text
Implemente OfflineBanner, pacotes offline (OfflinePack) e a fila de sincronização
em segundo plano. Defina a política de conflito: último a escrever vence, exceto
PriceVote, que é aditivo. Mostre o estado de sincronização conforme
docs/design/trocado_v2_3_offline.png.
```

### Etapa 6: backend e mapa
```text
Crie o backend (Postgres) com tabelas Place, PricePoint e PriceVote e uma API para
buscar lugares por área e registrar votos. Implemente a tela de mapa conforme
docs/design/trocado_2_mapa.png com MapLibre e dados do OpenStreetMap, pins de preço,
filtros e painel inferior com a comparação "2 min vs. 7 min". Use dados de exemplo
marcados como fictícios.
```

### Etapa 7: orçamento e custo do pagamento
```text
Implemente Expense e a tela de orçamento (antes e durante a viagem) conforme
trocado_v3_4_orcamento.png e trocado_v2_1_orcamento.png, com projeção de ritmo.
Depois implemente a tela de custo real do pagamento (trocado_v2_2_pagamento.png)
usando taxas configuráveis por cartão (IOF, spread) e deixe claro que são estimativas.
```

### Etapa 8: plano, passeios, reservas e tickets
```text
Implemente o plano por dia, a lista de passeios com filtros, as reservas com status
e os tickets com QR code e picote conforme as imagens trocado_v3_0 a trocado_v3_3.
Tickets devem funcionar offline e aumentar o brilho da tela ao abrir o QR.
```

### Etapa 9: assistente de IA
```text
Crie um endpoint no backend que recebe a pergunta, a localização aproximada, o
orçamento e a lista atual, busca lugares e preços verificados no banco e chama o
modelo Claude com instruções para responder apenas com esses dados e admitir quando
não souber. A chave da API nunca vai para o app. Aplique limite de uso por usuário.
Implemente a tela conforme trocado_3_assistente.png.
```

### Etapa 10: memórias
```text
Gere o resumo da viagem (lugares, distância a pé, gastos, diferença para o orçamento)
a partir dos dados locais e implemente a tela de memórias conforme
trocado_v3_5_memorias.png. Fotos ficam no dispositivo por padrão.
```

### Boas práticas ao trabalhar com o Claude Code
- Peça sempre o plano antes do código e revise.
- Um prompt por etapa. Faça commit ao fim de cada etapa.
- Para ajustar visual, anexe a imagem da tela e a captura do app e peça a comparação.
- Mantenha este arquivo atualizado: mudou o produto, muda o documento primeiro.
- Se a ideia de dados da comunidade (mapa) exigir muita manutenção, valide com poucos lugares antes de ampliar.

---

## 8. Riscos e decisões em aberto

- **Dados de preço:** precisam de comunidade ativa e moderação. Começar por uma cidade.
- **Licença de mapas e lugares:** confirmar termos antes de baixar dados para uso offline.
- **Reservas e pagamentos:** decidir se o app vende (exige parceiros e conformidade) ou só organiza reservas feitas em outro lugar. Recomendação inicial: apenas organizar.
- **IOF e taxas:** variam com o tempo e o cartão. Manter configuráveis, nunca fixas no código.
- **Retenção:** o uso é episódico. Os ganchos são o planejamento antes, as memórias depois e a próxima viagem.