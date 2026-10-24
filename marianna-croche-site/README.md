# marianna crochê — site

Site da loja **marianna crochê** (bolsas e peças de crochê feitas à mão no Rio de Janeiro).
É um site estático: HTML, CSS e JavaScript puros, sem build e sem dependências. Funciona em qualquer hospedagem de arquivos.

## O que tem

- **Início** com as peças penduradas num varal, como etiquetas, e a logo como adesivo.
- **Coleção** com filtros (bolsas, pra vestir, pra casa) e escolha de cor em cada peça.
- **Monte a sua**: a pessoa escolhe modelo, cor (ou listrada com duas cores), tamanho e detalhes, e vê uma prévia desenhada da bolsa.
- **Sacola**: guarda os itens no navegador. Ao finalizar, copia a mensagem do pedido e abre o direct do Instagram (ou o WhatsApp, se configurado).
- Como funciona, embalagem, perguntas frequentes e links para Instagram e TikTok.
- SEO pronto: título, descrição, imagem de compartilhamento, dados estruturados da loja e das perguntas.

## Ver no computador

As fontes só carregam quando o site é servido por HTTP. Dentro desta pasta, rode um destes comandos e abra `http://localhost:8000`:

```bash
python -m http.server 8000
# ou
npx serve -l 8000
```

Para só dar uma olhada, use o arquivo `marianna-croche.html`, que vem junto: ele tem tudo embutido e abre com dois cliques.

## Publicar

Qualquer hospedagem estática serve: Netlify (arrastar a pasta), Vercel (`npx vercel`), GitHub Pages ou Cloudflare Pages.
Depois de publicar, troque em `index.html` os caminhos de `og:image` e do bloco `application/ld+json` pelo endereço completo do site (ex.: `https://seudominio.com.br/assets/img/og.jpg`). Assim a prévia aparece direitinho quando alguém compartilhar o link.

## Editar

| O quê | Onde |
| --- | --- |
| WhatsApp (botão "Finalizar pelo WhatsApp") | `assets/js/app.js`, em `LOJA.whatsapp`: DDI + DDD + número, só dígitos (ex.: `5521999999999`) |
| Texto da mensagem do pedido | `assets/js/app.js`, em `LOJA.saudacao` e `LOJA.fechamento` |
| Cores de fio disponíveis | `assets/js/app.js`, em `FIOS` (cor do fio e sombra) |
| Peças da coleção | `index.html`: copie um bloco `<li class="peca">` e troque `data-id`, `data-nome`, `data-cat`, a foto, o texto e `data-cores` |
| Preço | troque o texto `sob encomenda` da plaquinha pelo valor (ex.: `R$ 189`) |
| Cores, fontes e espaçamentos | variáveis no início de `assets/css/styles.css` |

Nas cores das peças, use os nomes de `FIOS` separados por espaço. Para uma opção com duas ou mais cores, junte com `+` (ex.: `vermelho+off-white`).

## Fotos

As fotos atuais foram recortadas de prints do Instagram, então estão em resolução baixa.
Troque pelos arquivos originais **mantendo os mesmos nomes** em `assets/img/`: uma versão grande (cerca de 1200 px de largura) e outra com `-300` no nome (300 px de largura), que é usada no celular. Formato WebP de preferência.

## Logo

A logo em `assets/logo/` foi vetorizada a partir da foto de perfil:

- `marianna-simbolo.svg`: só o símbolo
- `marianna-adesivo.svg`: símbolo no círculo branco, igual à foto de perfil
- `favicon.svg`: ícone da aba

Se a marca tiver o arquivo original da logo (AI, PDF ou SVG), vale substituir para ficar 100% fiel.

## Estrutura

```
index.html
assets/
  css/styles.css
  js/app.js
  fonts/   Bagel Fat One (títulos) e Bricolage Grotesque (texto), licença OFL
  img/     fotos, imagem de compartilhamento (og.jpg) e ícone do celular
  logo/    logo em SVG
```
