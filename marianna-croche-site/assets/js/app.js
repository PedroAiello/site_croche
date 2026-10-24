/* =========================================================
   marianna crochê — interações da loja
   Sacola que fecha o pedido pelo direct (ou WhatsApp),
   filtros da coleção e o "monte a sua" com prévia ao vivo.
   ========================================================= */
(() => {
  'use strict';

  /* ---------- configuração da loja (edite aqui) ---------- */
  const LOJA = {
    instagram: '_mariannacroche',
    // DDI + DDD + número, só dígitos (ex.: '5521999999999'). Vazio = só direct do Instagram.
    whatsapp: '',
    saudacao: 'Oi, marianna! Vim pelo site e quero encomendar:',
    fechamento: 'Pode me passar valor, prazo e frete?',
  };

  /* fios disponíveis: y = cor do fio, yd = sombra entre os pontos */
  const FIOS = {
    'preto':     { y: '#2B2725', yd: '#0F0D0D' },
    'off-white': { y: '#EFE6D3', yd: '#C9BCA2' },
    'chocolate': { y: '#6B3E26', yd: '#3F2214' },
    'caramelo':  { y: '#B07A45', yd: '#7A4F27' },
    'vinho':     { y: '#7A1F2E', yd: '#460E19' },
    'vermelho':  { y: '#C9252E', yd: '#86121A' },
    'rosa':      { y: '#EBA9BC', yd: '#C07990' },
    'amarelo':   { y: '#EBC23A', yd: '#B48C14' },
    'verde':     { y: '#2F7D4D', yd: '#1B4E2F' },
    'azul':      { y: '#2D4FA0', yd: '#1A3069' },
    'areia':     { y: '#D8C29A', yd: '#A88F64' },
  };

  const MODELOS = {
    quadrada: 'Bolsa quadrada',
    baguete: 'Baguete de ombro',
    corrente: 'Bolsa com corrente',
    praia: 'Bolsa de praia',
  };
  const TAMANHOS = { P: 0.84, M: 1, G: 1.13 };

  const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
  const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];
  const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- cores ---------- */
  const partesCombo = (combo) => String(combo || '').split('+').filter((nome) => FIOS[nome]);
  const nomeCombo = (combo) => partesCombo(combo).join(' e ');

  function fundoFio(combo) {
    const partes = partesCombo(combo);
    if (!partes.length) return '#cccccc';
    if (partes.length === 1) {
      const fio = FIOS[partes[0]];
      return `repeating-linear-gradient(125deg, ${fio.y} 0 4px, ${fio.yd} 4px 5.5px)`;
    }
    const fatia = 100 / partes.length;
    const fatias = partes.map((nome, i) => `${FIOS[nome].y} ${i * fatia}% ${(i + 1) * fatia}%`).join(', ');
    return `repeating-linear-gradient(125deg, transparent 0 4px, rgba(0,0,0,.16) 4px 5.5px), conic-gradient(from 45deg, ${fatias})`;
  }

  /* ---------- armazenamento (com tolerância a navegação privada) ---------- */
  const CHAVE = 'mc-sacola-v1';
  function lerSacola() {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE) || '[]');
      return Array.isArray(dados) ? dados.filter((i) => i && i.nome && i.qtd > 0) : [];
    } catch {
      return [];
    }
  }
  function salvarSacola() {
    try { localStorage.setItem(CHAVE, JSON.stringify(sacola)); } catch { /* segue só em memória */ }
  }
  let sacola = lerSacola();

  /* ---------- topo ---------- */
  const topo = $('[data-topo]');
  const marcarTopo = () => topo.classList.toggle('is-rolado', window.scrollY > 8);
  marcarTopo();
  window.addEventListener('scroll', marcarTopo, { passive: true });

  const ano = $('[data-ano]');
  if (ano) ano.textContent = String(new Date().getFullYear());

  /* ---------- aviso (toast) ---------- */
  const aviso = $('[data-aviso]');
  let tempoAviso;
  function esconderAviso() { aviso.classList.remove('visivel'); }
  function avisar(texto, { rotulo, acao } = {}) {
    const span = document.createElement('span');
    span.textContent = texto;
    aviso.replaceChildren(span);
    if (rotulo && acao) {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'aviso__acao';
      botao.textContent = rotulo;
      botao.addEventListener('click', () => { esconderAviso(); acao(); });
      aviso.appendChild(botao);
    }
    aviso.classList.add('visivel');
    clearTimeout(tempoAviso);
    tempoAviso = setTimeout(esconderAviso, rotulo ? 5200 : 3400);
  }

  /* ---------- coleção: cores de cada peça ---------- */
  function sinalizarBotao(botao) {
    const texto = $('span', botao);
    const icone = $('use', botao);
    if (!botao.dataset.textoOriginal) botao.dataset.textoOriginal = texto.textContent;
    botao.classList.add('ok');
    texto.textContent = 'Adicionada';
    icone?.setAttribute('href', '#i-ok');
    clearTimeout(botao._tempo);
    botao._tempo = setTimeout(() => {
      botao.classList.remove('ok');
      texto.textContent = botao.dataset.textoOriginal;
      icone?.setAttribute('href', '#i-mais');
    }, 1600);
  }

  $$('.peca__in').forEach((card) => {
    const campo = $('.cores', card);
    const combos = (campo.dataset.cores || '').split(/\s+/).filter((c) => partesCombo(c).length);
    combos.forEach((combo, i) => {
      const rotulo = document.createElement('label');
      rotulo.className = 'cor';
      rotulo.title = nomeCombo(combo);
      const entrada = document.createElement('input');
      entrada.type = 'radio';
      entrada.name = `cor-${card.dataset.id}`;
      entrada.value = combo;
      entrada.checked = i === 0;
      const bola = document.createElement('span');
      bola.className = 'cor__bola';
      bola.setAttribute('aria-hidden', 'true');
      bola.style.background = fundoFio(combo);
      const nome = document.createElement('span');
      nome.className = 'sr-only';
      nome.textContent = nomeCombo(combo);
      rotulo.append(entrada, bola, nome);
      campo.appendChild(rotulo);
    });

    const botao = $('[data-add]', card);
    botao.setAttribute('aria-label', `Adicionar ${card.dataset.nome} à sacola`);
    botao.addEventListener('click', () => {
      const combo = $('input:checked', campo)?.value || combos[0] || '';
      adicionar({
        id: card.dataset.id,
        nome: card.dataset.nome,
        detalhe: nomeCombo(combo),
        cores: combo,
        img: $('img', card)?.getAttribute('src') || '',
      });
      sinalizarBotao(botao);
    });
  });

  /* ---------- coleção: filtros + grade escalonada ---------- */
  const grade = $('[data-grade]');
  const pecas = $$('.peca', grade);
  const avisoVazio = $('[data-vazio]');

  function escalonar() {
    const colunas = getComputedStyle(grade).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
    let posicao = 0;
    pecas.forEach((peca) => {
      if (peca.hidden) { peca.classList.remove('desce'); return; }
      peca.classList.toggle('desce', colunas > 1 && (posicao % colunas) % 2 === 1);
      posicao += 1;
    });
  }

  $$('[data-filtro]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const filtro = botao.dataset.filtro;
      $$('[data-filtro]').forEach((b) => b.setAttribute('aria-pressed', String(b === botao)));
      let visiveis = 0;
      pecas.forEach((peca) => {
        const mostra = filtro === 'tudo' || peca.dataset.cat === filtro;
        peca.hidden = !mostra;
        if (mostra) visiveis += 1;
      });
      avisoVazio.hidden = visiveis > 0;
      escalonar();
    });
  });
  escalonar();
  let tempoResize;
  window.addEventListener('resize', () => {
    clearTimeout(tempoResize);
    tempoResize = setTimeout(escalonar, 120);
  });

  /* ---------- monte a sua: desenho da bolsa ---------- */
  const formMonte = $('[data-monte]');
  const provador = $('[data-provador]');
  const alvoBolsa = $('[data-bolsa]', provador);
  const resumo = $('[data-resumo]');
  const listrada = $('[data-listrada]');
  const caixaCor2 = $('[data-novelos="cor2"]');

  // alça de fio: base + marcação dos pontos + brilho
  const alca = (d, largura) =>
    `<path d="${d}" class="s-y" stroke-width="${largura}" fill="none" stroke-linecap="round"/>` +
    `<path d="${d}" class="s-yd" stroke-width="${largura}" fill="none" stroke-linecap="round" stroke-dasharray="2.4 ${(largura * 0.42).toFixed(1)}" opacity=".55"/>` +
    `<path d="${d}" stroke="#fff" stroke-opacity=".16" stroke-width="${(largura * 0.28).toFixed(1)}" fill="none" stroke-linecap="round" transform="translate(${(-largura * 0.12).toFixed(1)} ${(-largura * 0.12).toFixed(1)})"/>`;

  // corpo tecido: ponto + volume + brilho + contorno
  const corpo = (d, preenchimento = 'url(#ponto)') =>
    `<path d="${d}" fill="${preenchimento}" fill-rule="evenodd"/>` +
    `<path d="${d}" fill="url(#volume)" fill-rule="evenodd"/>` +
    `<path d="${d}" fill="url(#brilho-bolsa)" fill-rule="evenodd"/>` +
    `<path d="${d}" fill="none" class="s-yd" stroke-width="2.5" opacity=".7"/>`;

  const plaquinha = (cx, cy) =>
    `<g transform="translate(${cx - 24} ${cy - 7})">` +
    `<rect width="48" height="14" rx="2.5" fill="url(#ouro)" stroke="#9C7A33" stroke-width=".6"/>` +
    `<use href="#logo-mark" x="18.5" y="2.7" width="11" height="8.6" fill="#4A3418"/>` +
    `</g>`;

  const chao = '<ellipse cx="210" cy="335" rx="134" ry="13" fill="url(#chao)"/>';

  function corrente() {
    const p0 = [98, 222];
    const controle = [210, 352];
    const p1 = [322, 222];
    const elos = 24;
    let svg = '';
    for (let i = 0; i <= elos; i += 1) {
      const t = i / elos;
      const a = 1 - t;
      const x = a * a * p0[0] + 2 * a * t * controle[0] + t * t * p1[0];
      const y = a * a * p0[1] + 2 * a * t * controle[1] + t * t * p1[1];
      const dx = 2 * a * (controle[0] - p0[0]) + 2 * t * (p1[0] - controle[0]);
      const dy = 2 * a * (controle[1] - p0[1]) + 2 * t * (p1[1] - controle[1]);
      const angulo = (Math.atan2(dy, dx) * 180) / Math.PI;
      const deitado = i % 2 === 0;
      const rx = deitado ? 6.6 : 6;
      const ry = deitado ? 3.7 : 1.5;
      const giro = `rotate(${angulo.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`;
      svg += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx}" ry="${ry}" transform="${giro}" fill="none" stroke="#7F858D" stroke-width="3.4"/>`;
      svg += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx}" ry="${ry}" transform="${giro}" fill="none" stroke="#DDE0E5" stroke-width="1.6"/>`;
    }
    svg += '<circle cx="96" cy="220" r="5.5" fill="none" stroke="#7F858D" stroke-width="3.2"/><circle cx="96" cy="220" r="5.5" fill="none" stroke="#DDE0E5" stroke-width="1.4"/>';
    svg += '<circle cx="324" cy="220" r="5.5" fill="none" stroke="#7F858D" stroke-width="3.2"/><circle cx="324" cy="220" r="5.5" fill="none" stroke="#DDE0E5" stroke-width="1.4"/>';
    return svg;
  }

  const CORPO_PRAIA = 'M146 148H274L322 300Q330 330 294 330H126Q90 330 98 300Z';
  const DESENHOS = {
    quadrada: () =>
      chao +
      '<path d="M170 152C168 98 252 98 250 152" class="s-yd" stroke-width="16" fill="none" stroke-linecap="round"/>' +
      corpo('M140 148H280Q314 148 317 182L326 290Q329 326 292 326H128Q91 326 94 290L103 182Q106 148 140 148Z') +
      alca('M156 158C150 80 270 80 264 158', 20) +
      plaquinha(210, 218),
    baguete: () =>
      chao +
      alca('M126 214C110 20 310 20 294 214', 13) +
      corpo('M140 196H280A40 40 0 0 1 320 236V268A40 40 0 0 1 280 308H140A40 40 0 0 1 100 268V236A40 40 0 0 1 140 196Z') +
      plaquinha(210, 250),
    corrente: () =>
      chao +
      corpo('M150 112H270Q332 112 334 180L336 262Q338 328 268 328H152Q82 328 84 262L86 180Q88 112 150 112ZM158 160A52 23 0 1 0 262 160A52 23 0 1 0 158 160Z') +
      '<ellipse cx="210" cy="160" rx="52" ry="23" fill="none" class="s-yd" stroke-width="5" opacity=".8"/>' +
      plaquinha(210, 212) +
      corrente(),
    praia: () =>
      chao +
      alca('M152 152C152 86 198 54 210 52', 10) +
      alca('M268 152C268 86 222 54 210 52', 10) +
      '<circle cx="210" cy="50" r="10" class="f-y"/><circle cx="206.5" cy="46.5" r="3.5" fill="#fff" opacity=".25"/>' +
      `<path d="${CORPO_PRAIA}" fill="url(#rede)"/>` +
      `<path d="${CORPO_PRAIA}" fill="url(#volume)" opacity=".6"/>` +
      '<path d="M98 300Q90 330 126 330H294Q330 330 322 300" fill="none" class="s-y" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M144 149H276" class="s-y" stroke-width="11" stroke-linecap="round"/>' +
      '<path d="M144 149H276" class="s-yd" stroke-width="11" stroke-linecap="round" stroke-dasharray="2.4 5" opacity=".5"/>',
  };

  function criarNovelos(caixa, nomeCampo, padrao) {
    Object.keys(FIOS).forEach((cor) => {
      const rotulo = document.createElement('label');
      rotulo.className = 'novelo';
      rotulo.title = cor;
      const entrada = document.createElement('input');
      entrada.type = 'radio';
      entrada.name = nomeCampo;
      entrada.value = cor;
      entrada.checked = cor === padrao;
      const bola = document.createElement('span');
      bola.className = 'novelo__bola';
      bola.setAttribute('aria-hidden', 'true');
      bola.style.background = fundoFio(cor);
      const nome = document.createElement('span');
      nome.className = 'sr-only';
      nome.textContent = cor;
      rotulo.append(entrada, bola, nome);
      caixa.appendChild(rotulo);
    });
  }
  criarNovelos($('[data-novelos="cor1"]'), 'cor1', 'vinho');
  criarNovelos(caixaCor2, 'cor2', 'off-white');

  let modeloDesenhado = '';
  function lerMonte() {
    const dados = new FormData(formMonte);
    const modelo = MODELOS[dados.get('modelo')] ? dados.get('modelo') : 'quadrada';
    const cor1 = FIOS[dados.get('cor1')] ? dados.get('cor1') : 'vinho';
    const temListra = listrada.checked;
    const cor2Escolhida = FIOS[dados.get('cor2')] ? dados.get('cor2') : 'off-white';
    const cor2 = temListra && cor2Escolhida !== cor1 ? cor2Escolhida : null;
    const tamanho = TAMANHOS[dados.get('tamanho')] ? dados.get('tamanho') : 'M';
    const detalhes = String(dados.get('detalhes') || '').trim();
    return { modelo, cor1, cor2, tamanho, detalhes };
  }
  const descreverMonte = ({ cor1, cor2, tamanho }) => `${cor1}${cor2 ? ` com listras ${cor2}` : ''}, tamanho ${tamanho}`;

  function atualizarMonte() {
    const escolha = lerMonte();
    const fio1 = FIOS[escolha.cor1];
    const fio2 = FIOS[escolha.cor2 || escolha.cor1];
    provador.style.setProperty('--y', fio1.y);
    provador.style.setProperty('--yd', fio1.yd);
    provador.style.setProperty('--y2', fio2.y);
    alvoBolsa.style.transform = `scale(${TAMANHOS[escolha.tamanho]})`;
    if (escolha.modelo !== modeloDesenhado) {
      alvoBolsa.innerHTML = `<g class="entra">${DESENHOS[escolha.modelo]()}</g>`;
      modeloDesenhado = escolha.modelo;
    }
    resumo.textContent = `${MODELOS[escolha.modelo]} em ${descreverMonte(escolha)}`;
    return escolha;
  }

  listrada.addEventListener('change', () => {
    caixaCor2.hidden = !listrada.checked;
    atualizarMonte();
  });
  formMonte.addEventListener('change', atualizarMonte);
  formMonte.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const escolha = atualizarMonte();
    adicionar({
      id: `personalizada-${escolha.modelo}`,
      nome: `${MODELOS[escolha.modelo]} personalizada`,
      detalhe: descreverMonte(escolha),
      cores: escolha.cor2 ? `${escolha.cor1}+${escolha.cor2}` : escolha.cor1,
      obs: escolha.detalhes,
    });
  });
  atualizarMonte();

  /* ---------- sacola ---------- */
  const dialogo = $('#sacola');
  const lista = $('[data-itens]');
  const vazia = $('[data-sacola-vazia]');
  const rodapeSacola = $('[data-sacola-pe]');
  const contador = $('[data-qtd]');
  const contadorLeitor = $('[data-qtd-leitor]');
  const botaoSacola = $('[data-abrir-sacola]');
  const caixaMensagem = $('[data-mensagem]');
  const botaoWhats = $('[data-finalizar="whatsapp"]');
  const linkWhats = $('[data-whatsapp-link]');
  const whatsapp = String(LOJA.whatsapp || '').replace(/\D/g, '');

  if (whatsapp) {
    botaoWhats.hidden = false;
    linkWhats.hidden = false;
    linkWhats.href = `https://wa.me/${whatsapp}`;
  }

  const chaveItem = (item) => [item.id, item.detalhe, item.obs || ''].join('|');
  const totalItens = () => sacola.reduce((soma, item) => soma + item.qtd, 0);

  function adicionar(novo) {
    const existente = sacola.find((item) => chaveItem(item) === chaveItem(novo));
    if (existente) existente.qtd += 1;
    else sacola.push({ ...novo, qtd: 1 });
    salvarSacola();
    desenharSacola({ pular: true });
    avisar(`Adicionada à sacola: ${novo.nome}, ${novo.detalhe}`, { rotulo: 'Ver sacola', acao: abrirSacola });
  }

  function linhaItem(item, indice) {
    const li = document.createElement('li');
    li.className = 'item';

    if (item.img) {
      const moldura = document.createElement('div');
      moldura.className = 'item__foto';
      const img = document.createElement('img');
      img.src = item.img;
      img.alt = '';
      img.width = 64;
      img.height = 80;
      moldura.appendChild(img);
      li.appendChild(moldura);
    } else {
      const novelo = document.createElement('div');
      novelo.className = 'item__novelo';
      novelo.setAttribute('aria-hidden', 'true');
      novelo.style.background = fundoFio(item.cores);
      li.appendChild(novelo);
    }

    const info = document.createElement('div');
    const nome = document.createElement('p');
    nome.className = 'item__nome';
    nome.textContent = item.nome;
    const detalhe = document.createElement('p');
    detalhe.className = 'item__detalhe';
    detalhe.textContent = item.obs ? `${item.detalhe}. Detalhe: ${item.obs}` : item.detalhe;
    info.append(nome, detalhe);

    const acoes = document.createElement('div');
    acoes.className = 'item__acoes';
    const qtd = document.createElement('div');
    qtd.className = 'qtd';
    qtd.setAttribute('role', 'group');
    qtd.setAttribute('aria-label', `Quantidade de ${item.nome}`);
    const menos = document.createElement('button');
    menos.type = 'button';
    menos.textContent = '−';
    menos.dataset.menos = '';
    menos.setAttribute('aria-label', 'Diminuir quantidade');
    const valor = document.createElement('output');
    valor.textContent = String(item.qtd);
    const mais = document.createElement('button');
    mais.type = 'button';
    mais.textContent = '+';
    mais.dataset.mais = '';
    mais.setAttribute('aria-label', 'Aumentar quantidade');
    qtd.append(menos, valor, mais);
    const remover = document.createElement('button');
    remover.type = 'button';
    remover.className = 'item__remover';
    remover.dataset.remover = '';
    remover.textContent = 'Remover';
    remover.setAttribute('aria-label', `Remover ${item.nome} da sacola`);
    acoes.append(qtd, remover);

    menos.addEventListener('click', () => mudarQuantidade(indice, -1));
    mais.addEventListener('click', () => mudarQuantidade(indice, 1));
    remover.addEventListener('click', () => removerItem(indice));

    li.append(info, acoes);
    return li;
  }

  function desenharSacola({ pular = false } = {}) {
    const total = totalItens();
    contador.textContent = String(total);
    contadorLeitor.textContent = total === 0 ? ', nenhum item' : total === 1 ? ', 1 item' : `, ${total} itens`;
    botaoSacola.classList.toggle('tem-itens', total > 0);
    if (pular && !movimentoReduzido.matches) {
      contador.classList.remove('pulo');
      void contador.offsetWidth;
      contador.classList.add('pulo');
    }
    vazia.hidden = total > 0;
    rodapeSacola.hidden = total === 0;
    caixaMensagem.hidden = true;
    lista.replaceChildren(...sacola.map(linhaItem));
  }

  function mudarQuantidade(indice, passo) {
    const item = sacola[indice];
    if (!item) return;
    if (item.qtd + passo <= 0) { removerItem(indice); return; }
    item.qtd += passo;
    salvarSacola();
    desenharSacola();
    lista.children[indice]?.querySelector(passo > 0 ? '[data-mais]' : '[data-menos]')?.focus();
  }

  function removerItem(indice) {
    const [saiu] = sacola.splice(indice, 1);
    salvarSacola();
    desenharSacola();
    const proximo = lista.children[Math.min(indice, lista.children.length - 1)];
    (proximo?.querySelector('[data-remover]') || $('.sacola__fechar'))?.focus();
    if (saiu) {
      avisar(`${saiu.nome} saiu da sacola`, {
        rotulo: 'Desfazer',
        acao: () => {
          sacola.splice(Math.min(indice, sacola.length), 0, saiu);
          salvarSacola();
          desenharSacola();
        },
      });
    }
  }

  function mensagemPedido() {
    const linhas = sacola.map((item) => {
      const base = `• ${item.qtd}x ${item.nome} (${item.detalhe})`;
      return item.obs ? `${base}\n   Detalhe: ${item.obs}` : base;
    });
    return `${LOJA.saudacao}\n\n${linhas.join('\n')}\n\n${LOJA.fechamento}`;
  }

  // cópia síncrona (funciona dentro do clique, antes de abrir outra aba)
  function copiarAgora(texto) {
    try {
      const campo = document.createElement('textarea');
      campo.value = texto;
      campo.setAttribute('readonly', '');
      campo.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
      (dialogo.open ? dialogo : document.body).appendChild(campo);
      campo.select();
      const ok = document.execCommand('copy');
      campo.remove();
      return ok;
    } catch {
      return false;
    }
  }
  async function copiarDepois(texto) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      return false;
    }
  }
  function mostrarMensagem(texto) {
    caixaMensagem.value = texto;
    caixaMensagem.hidden = false;
    caixaMensagem.focus();
    caixaMensagem.select();
    avisar('Não deu pra copiar sozinho. Selecione a mensagem acima e copie.');
  }

  $$('[data-finalizar]').forEach((botao) => {
    botao.addEventListener('click', async () => {
      const mensagem = mensagemPedido();
      if (botao.dataset.finalizar === 'whatsapp' && whatsapp) {
        window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener');
        return;
      }
      const copiou = copiarAgora(mensagem);
      window.open(`https://ig.me/m/${LOJA.instagram}`, '_blank', 'noopener');
      if (copiou || (await copiarDepois(mensagem))) {
        avisar('Pedido copiado. É só colar a mensagem no direct que abriu.');
      } else {
        mostrarMensagem(mensagem);
      }
    });
  });

  $('[data-copiar]').addEventListener('click', async () => {
    const mensagem = mensagemPedido();
    if (copiarAgora(mensagem) || (await copiarDepois(mensagem))) avisar('Mensagem do pedido copiada.');
    else mostrarMensagem(mensagem);
  });

  function abrirSacola() {
    if (dialogo.open) return;
    desenharSacola();
    dialogo.classList.remove('fechando');
    dialogo.appendChild(aviso); // o aviso precisa ficar por cima do fundo escuro
    dialogo.showModal();
    document.documentElement.classList.add('sem-rolagem');
  }
  function fecharSacola(depois) {
    if (!dialogo.open) { if (depois) depois(); return; }
    const terminar = () => {
      dialogo.classList.remove('fechando');
      dialogo.close();
      if (depois) depois();
    };
    if (movimentoReduzido.matches) { terminar(); return; }
    dialogo.classList.add('fechando');
    dialogo.addEventListener('animationend', terminar, { once: true });
  }
  dialogo.addEventListener('close', () => {
    document.documentElement.classList.remove('sem-rolagem');
    document.body.appendChild(aviso);
  });
  dialogo.addEventListener('cancel', (evento) => { evento.preventDefault(); fecharSacola(); });
  dialogo.addEventListener('click', (evento) => { if (evento.target === dialogo) fecharSacola(); });
  botaoSacola.addEventListener('click', abrirSacola);
  $$('[data-fechar-sacola]').forEach((elemento) => {
    elemento.addEventListener('click', (evento) => {
      if (elemento.tagName === 'A') {
        evento.preventDefault();
        const destino = $(elemento.getAttribute('href'));
        fecharSacola(() => destino?.scrollIntoView({ behavior: movimentoReduzido.matches ? 'auto' : 'smooth' }));
        return;
      }
      fecharSacola();
    });
  });

  desenharSacola();
})();
