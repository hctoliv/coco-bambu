(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SAC = '5511910081990';

  /* ---------- intro (uma vez por sessão) ---------- */
  var intro = $('#intro');
  function startHero() { document.body.classList.add('go'); }
  var seen = false;
  try { seen = sessionStorage.getItem('cb-intro') === '1'; } catch (e) {}
  if (reduce || seen || /nointro/.test(location.search)) {
    intro.classList.add('done');
    startHero();
  } else {
    try { sessionStorage.setItem('cb-intro', '1'); } catch (e) {}
    var endIntro = function () { if (intro.classList.contains('done')) return; intro.classList.add('done'); setTimeout(startHero, 250); };
    setTimeout(endIntro, 2300);
    intro.addEventListener('click', endIntro);
  }

  /* ---------- WhatsApp ---------- */
  function wa(num, msg) { return 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg); }
  $$('[data-wa]').forEach(function (a) {
    a.href = wa(a.getAttribute('data-wa-num') || SAC, a.getAttribute('data-wa'));
    a.target = '_blank'; a.rel = 'noopener';
  });

  /* ---------- header / menu ---------- */
  var hd = $('#hd'), fab = $('.fab'), burger = $('#burger'), nav = $('#nav'), uniSec = $('#unidades');
  function onScroll() {
    var y = window.scrollY;
    hd.classList.toggle('solid', y > 40);
    var ur = uniSec.getBoundingClientRect();
    var naUni = ur.top < window.innerHeight * 0.6 && ur.bottom > window.innerHeight * 0.4;
    fab.classList.toggle('on', y > window.innerHeight * 0.9 && !naUni && !nav.classList.contains('open'));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function closeNav() { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menu'); document.documentElement.classList.remove('nav-open'); }
  burger.addEventListener('click', function () {
    var open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.documentElement.classList.toggle('nav-open', open);
    if (fab) fab.classList.toggle('on', !open && window.scrollY > window.innerHeight * 0.9);
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });
  // iOS Safari ignora user-scalable=no: bloqueia o gesto de pinça e o zoom por toque duplo
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false });
  });
  document.addEventListener('touchmove', function (e) { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  var ultimoToque = 0;
  document.addEventListener('touchend', function (e) {
    var t = Date.now();
    if (t - ultimoToque < 300 && !e.target.closest('a,button,input,select,textarea,label')) e.preventDefault();
    ultimoToque = t;
  }, { passive: false });
  window.addEventListener('resize', function () { if (window.innerWidth > 900 && nav.classList.contains('open')) closeNav(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* ---------- reveal ---------- */
  var revealEls = $$('.sec-hd, .casa__intro, .hist__lista li, .ev__in, .app__in, .app__img, .tabs, .ft__top');
  revealEls.forEach(function (el) { el.classList.add('rv'); });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else revealEls.forEach(function (el) { el.classList.add('in'); });

  /* ---------- contadores ---------- */
  function countUp(el) {
    var end = +el.getAttribute('data-count'), pre = el.getAttribute('data-prefix') || '';
    if (reduce) { el.textContent = pre + end; return; }
    var start = end > 1000 ? end - 60 : 0, t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var nums = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); io2.unobserve(en.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io2.observe(n); });
  }

  /* ---------- cardápio ---------- */
  var CARTA = {
    camaroes: [
      ['camarao-internacional', 'Camarão Internacional', 'Camarões sobre cremoso arroz com ervilhas e presunto, envolvido com molho branco, gratinado com muçarela e parmesão. Acompanha batata palha.', '2 ou 4 pessoas'],
      ['camarao-coco-bambu', 'Camarão Coco Bambu', 'Camarões recheados com Catupiry e empanados, sobre arroz cremoso com camarões, ervilhas e presunto, gratinado com muçarela e parmesão.', '2 ou 3 pessoas'],
      ['camarao-mediterraneo', 'Camarão Mediterrâneo', 'Camarões refogados no azeite com alho e cebola, sobre arroz cremoso com manjericão e molho branco, gratinado com queijos.', '2 ou 4 pessoas'],
      ['camarao-iracema', 'Camarão Iracema', 'Arroz de leite com queijo coalho, coberto com camarões refogados com coentro, tomate fresco e nata. Acompanha macaxeira frita.', '2 ou 4 pessoas'],
      ['camarao-siciliano', 'Camarão Siciliano', 'Seis camarões recheados com Catupiry e empanados, servidos sobre risoto de limão siciliano. Acompanha batata palha.', '6 unidades'],
      ['moqueca-camarao', 'Moqueca Cearense de Camarão', 'De origem indígena com toques cearenses: tomate, cebola, pimentões, pimenta de cheiro, leite de coco, azeite de dendê e coentro.', '500 g de camarão']
    ],
    mar: [
      ['paella-caldosa', 'Paella Caldosa Coco Bambu', 'Arroz caldoso com camarão, lula, polvo, peixe, lagosta e mexilhão, pimentões, ervilha e um leve toque de açafrão. Servida na paellera.', '2 ou 4 pessoas'],
      ['rede-pescador-lagosta', 'Rede de Pescador com Lagosta', 'Lagosta, camarão, mexilhões, peixe e lula grelhados com molho provençal. Acompanha arroz de açafrão com parmesão.', '2 ou 4 pessoas'],
      ['lagosta-thermidor', 'Lagosta a Thermidor', 'Caudas de lagosta flambadas no vinho branco com champignons, mostarda e bechamel, gratinadas com muçarela e parmesão.', '570 g de lagosta'],
      ['polvo-provencal', 'Polvo à Provençal', 'Polvo refogado ao molho provençal com tomate seco. Acompanha arroz de brócolis e batata sauté.', '400 g de polvo'],
      ['salmao-gergelim', 'Salmão em Crosta de Gergelim', 'Filé de salmão grelhado com crosta de gergelim e molho teriyaki, arroz branco e cuscuz marroquino com legumes.', '400 g de salmão'],
      ['bacalhau-lagareiro', 'Bacalhau à Lagareiro', 'Lombo de bacalhau assado com azeite, alho confitado, ovos, azeitona azapa, batata, abóbora e brócolis.', 'meia ou inteira']
    ],
    novos: [
      ['bacalhau-bras', 'Bacalhau à Brás', 'Clássico português: lombo de bacalhau desfiado no azeite com ovos cremosos e batata palha crocante, salsinha e azeitonas Azapa.', 'Lançamento'],
      ['surf-turf', 'Coco Bambu Surf and Turf', 'Tornedor de filé mignon grelhado com camarões GG e um cremoso molho de frutos do mar perfumado com salsinha.', 'Lançamento'],
      ['camarao-pistola', 'Camarão Pistola ao Alho', 'Inspirado no Gambas al Ajillo: camarões Pistola GG em azeite fervilhante, alho dourado e um toque de pimenta. Com pão rústico.', 'Lançamento'],
      ['arpao-pescador', 'Arpão do Pescador', 'Camarões GG defumados e grelhados no charboiler, com molho provençal e alho frito laminado.', 'Lançamento'],
      ['bombinha-camarao', 'Bombinha de Camarão', 'Bolinhas crocantes recheadas com camarão, cream cheese e Catupiry, com molho Taiba.', 'Lançamento']
    ],
    doces: [
      ['cocada-forno', 'Cocada ao Forno', 'Coco ralado fresco e leite condensado, dourada ao forno e servida quente com uma bola de sorvete de creme.', 'A mais pedida'],
      ['pudim', 'Pudim de Leite “O Melhor do Mundo”', 'Com doce caseiro de ameixas pretas em calda.', 'Clássico'],
      ['petit-doce-leite', 'Petit Gateau de Doce de Leite', 'Bolinho quente de doce de leite com sorvete de creme.', 'Quente'],
      ['churros', 'Churros com Doce de Leite Argentino', 'Com doce de leite argentino e raspas de limão siciliano.', 'Para dividir'],
      ['blondie-pistache', 'Blondie de Pistache', 'Brownie de chocolate branco e pistache com sorvete de pistache.', 'Individual'],
      ['torta-banana', 'Torta de Banana Cremosa', 'Tirinhas de banana caramelizada, servida quente com sorvete de creme e canela.', 'Fatia']
    ]
  };
  var lista = $('#cartaLista'), img = $('#cartaImg'), cap = $('#cartaCap');
  var swapT;
  function show(li) {
    $$('.prato', lista).forEach(function (p) { p.classList.toggle('on', p === li); });
    var src = 'img/pratos/' + li.getAttribute('data-img') + '.jpg';
    var nome = li.getAttribute('data-nome');
    if (img.getAttribute('src') === src) return;
    img.classList.add('swap');
    clearTimeout(swapT);
    swapT = setTimeout(function () {
      var pre = new Image();
      pre.onload = pre.onerror = function () { img.src = src; img.alt = nome; cap.textContent = nome; img.classList.remove('swap'); };
      pre.src = src;
    }, reduce ? 0 : 220);
  }
  function renderCat(cat) {
    lista.innerHTML = CARTA[cat].map(function (d) {
      return '<li class="prato" tabindex="0" data-img="' + d[0] + '" data-nome="' + d[1] + '">' +
        '<img class="thumb" src="img/pratos/' + d[0] + '.jpg" alt="" loading="lazy">' +
        '<h3>' + d[1] + '</h3><p>' + d[2] + '</p><small>' + d[3] + '</small></li>';
    }).join('');
    var first = $('.prato', lista);
    first.classList.add('on');
    img.src = 'img/pratos/' + first.getAttribute('data-img') + '.jpg';
    img.alt = cap.textContent = first.getAttribute('data-nome');
    $$('.prato', lista).forEach(function (li) {
      li.addEventListener('mouseenter', function () { show(li); });
      li.addEventListener('focus', function () { show(li); });
      li.addEventListener('click', function () { show(li); });
    });
  }
  $$('.tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.tabs button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      renderCat(b.getAttribute('data-cat'));
    });
  });
  renderCat('camaroes');

  /* ---------- trilho de fotos ---------- */
  var rail = $('#rail'), bar = $('#railBar');
  function railBar() {
    var max = rail.scrollWidth - rail.clientWidth;
    var w = Math.max(12, rail.clientWidth / rail.scrollWidth * 100);
    bar.style.width = w + '%';
    bar.style.left = (max > 0 ? rail.scrollLeft / max : 0) * (100 - w) + '%';
  }
  rail.addEventListener('scroll', railBar, { passive: true });
  window.addEventListener('resize', railBar);
  railBar();
  $$('.arw').forEach(function (b) {
    b.addEventListener('click', function () {
      rail.scrollBy({ left: +b.getAttribute('data-dir') * rail.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  // arrastar com o mouse
  var drag = null;
  rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, s: rail.scrollLeft }; rail.style.scrollSnapType = 'none'; });
  window.addEventListener('pointermove', function (e) { if (drag) rail.scrollLeft = drag.s - (e.clientX - drag.x); });
  window.addEventListener('pointerup', function () { if (drag) { drag = null; rail.style.scrollSnapType = ''; } });
  rail.addEventListener('dragstart', function (e) { e.preventDefault(); });

  /* ---------- linha do tempo ---------- */
  var ano = $('#anoAtual');
  var marcos = $$('.hist__lista li');
  if ('IntersectionObserver' in window) {
    var io3 = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        marcos.forEach(function (m) { m.classList.toggle('on', m === en.target); });
        var v = en.target.getAttribute('data-ano');
        if (ano.textContent === v) return;
        ano.classList.add('flip');
        setTimeout(function () { ano.textContent = v; ano.classList.remove('flip'); }, reduce ? 0 : 220);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    marcos.forEach(function (m) { io3.observe(m); });
  }

  /* ---------- unidades ---------- */
  var U = window.CB_UNIDADES || [];
  var ufBox = $('#uniUfs'), q = $('#uniQ'), ul = $('#uniLista'), count = $('#uniCount');
  var ufAtual = 'SP';
  var acao = null;
  var ufs = [];
  U.forEach(function (u) { if (ufs.indexOf(u.uf) < 0) ufs.push(u.uf); });
  ufs.sort();
  ufBox.innerHTML = '<button type="button" data-uf="">Todas</button>' + ufs.map(function (uf) {
    return '<button type="button" data-uf="' + uf + '">' + uf + '</button>';
  }).join('');
  function norm(s) { return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function card(u) {
    var maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Coco Bambu ' + u.n + ' ' + u.e);
    var acts = [];
    if (u.r) acts.push('<a class="' + (acao !== 'cardapio' && acao !== 'evento' ? 'pri' : '') + '" href="' + esc(u.r) + '" target="_blank" rel="noopener">Reservar</a>');
    if (u.m) acts.push('<a class="' + (acao === 'cardapio' ? 'pri' : '') + '" href="' + esc(u.m) + '" target="_blank" rel="noopener">Cardápio</a>');
    acts.push('<a href="' + wa(u.w || SAC, 'Olá! Vim pelo site e queria falar com o Coco Bambu ' + u.n + '.') + '" target="_blank" rel="noopener">WhatsApp</a>');
    if (u.ev) acts.push('<a class="' + (acao === 'evento' ? 'pri' : '') + '" href="' + esc(u.ev) + '" target="_blank" rel="noopener">Evento</a>');
    acts.push('<a href="' + maps + '" target="_blank" rel="noopener">Como chegar</a>');
    var tel = u.t ? '<a class="un__t" href="tel:+55' + u.t.replace(/\D/g, '').replace(/^0/, '') + '">' + esc(u.t) + '</a>' : '';
    return '<li class="un"><span class="un__uf">' + esc(u.e) + '</span><h3>' + esc(u.n) + '</h3>' +
      (u.h ? '<p class="un__h">' + esc(u.h) + '</p>' : '<p class="un__h">Horários direto com a casa.</p>') + tel +
      '<div class="un__acts">' + acts.join('') + '</div></li>';
  }
  function render() {
    var term = norm(q.value.trim());
    var res = U.filter(function (u) {
      if (term) return norm(u.n + ' ' + u.e + ' ' + u.uf + ' ' + u.s).indexOf(term) > -1;
      return !ufAtual || u.uf === ufAtual;
    });
    $$('button', ufBox).forEach(function (b) { b.setAttribute('aria-pressed', String(!term && b.getAttribute('data-uf') === ufAtual)); });
    ul.innerHTML = res.length ? res.map(card).join('') : '<li class="uni__vazio">Nenhuma casa com esse nome. Tente o shopping, o bairro ou a cidade.</li>';
    count.textContent = res.length + (res.length === 1 ? ' casa' : ' casas') + (term ? (res.length === 1 ? ' encontrada' : ' encontradas') : (ufAtual ? ' · ' + (res[0] ? res[0].e : ufAtual) : ' pelo Brasil'));
  }
  ufBox.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    ufAtual = b.getAttribute('data-uf'); q.value = ''; render();
  });
  q.addEventListener('input', render);
  render();

  // botões "Reservar / Cardápio / Evento" levam ao buscador já com a ação em destaque
  var msg = $('#uniMsg'), msgBase = msg.textContent;
  var MSGS = {
    reservar: 'Para reservar, escolha a sua casa abaixo e toque em Reservar.',
    cardapio: 'Cada casa tem o seu cardápio e os seus preços. Escolha a unidade e toque em Cardápio.',
    evento: 'Escolha a unidade e toque em Evento para pedir o orçamento direto com a casa.'
  };
  $$('[data-acao]').forEach(function (a) {
    a.addEventListener('click', function () {
      acao = a.getAttribute('data-acao');
      msg.textContent = MSGS[acao] || msgBase;
      render();
      if (window.matchMedia('(pointer: fine)').matches) setTimeout(function () { try { q.focus({ preventScroll: true }); } catch (e) {} }, 700);
    });
  });
})();
