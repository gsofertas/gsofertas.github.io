(function () {
  "use strict";

  const AMAZON_TAG = "gs20063-20";

  const CATEGORIAS = {
    fones: {
      id: "fones",
      label: "Fones",
      emoji: "🎧",
      titulo: "Qual fone comprar?",
      subtitulo: "Escolha seu orçamento e como pretende usar para ver até 3 recomendações certeiras.",
      iconeSvg:
        '<svg viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"></path><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>',
      orcamentos: [50, 100, 150],
      usos: [
        { id: "academia", label: "🏋️ Academia" },
        { id: "jogos", label: "🎮 Jogos" },
        { id: "trabalho", label: "💼 Trabalho" },
        { id: "dia a dia", label: "🚶 Dia a dia" }
      ],
      padraoOrcamento: 100,
      padraoUso: "dia a dia"
    },
    mouses: {
      id: "mouses",
      label: "Mouses",
      emoji: "🖱️",
      titulo: "Qual mouse comprar?",
      subtitulo: "Compare modelos por preço e tipo de uso para trabalhar ou jogar melhor.",
      iconeSvg:
        '<svg viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="6"></rect><path d="M12 7v4"></path></svg>',
      orcamentos: [50, 100, 150],
      usos: [
        { id: "jogos", label: "🎮 Jogos" },
        { id: "trabalho", label: "💼 Trabalho" },
        { id: "dia a dia", label: "🚶 Dia a dia" }
      ],
      padraoOrcamento: 100,
      padraoUso: "dia a dia"
    },
    teclados: {
      id: "teclados",
      label: "Teclados",
      emoji: "⌨️",
      titulo: "Qual teclado comprar?",
      subtitulo: "Filtre pelo orçamento e encontre o teclado ideal para digitação ou games.",
      iconeSvg:
        '<svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"></path></svg>',
      orcamentos: [100, 200, 350],
      usos: [
        { id: "jogos", label: "🎮 Jogos" },
        { id: "trabalho", label: "💼 Trabalho" },
        { id: "silencioso", label: "🤫 Silencioso" },
        { id: "dia a dia", label: "🚶 Dia a dia" }
      ],
      padraoOrcamento: 200,
      padraoUso: "trabalho"
    },
    headsets: {
      id: "headsets",
      label: "Headsets",
      emoji: "🎙️",
      titulo: "Qual headset comprar?",
      subtitulo: "Veja headsets com ótimo microfone e conforto para jogos, músicas e reuniões.",
      iconeSvg:
        '<svg viewBox="0 0 24 24"><path d="M3 14v-3a9 9 0 0 1 18 0v3"></path><path d="M21 15a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h3z"></path><path d="M3 15a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H3z"></path><path d="M19 17v1a3 3 0 0 1-3 3h-3"></path></svg>',
      orcamentos: [150, 250, 400],
      usos: [
        { id: "jogos", label: "🎮 Jogos" },
        { id: "trabalho", label: "💼 Trabalho" },
        { id: "musica", label: "🎵 Música" },
        { id: "dia a dia", label: "🚶 Dia a dia" }
      ],
      padraoOrcamento: 150,
      padraoUso: "jogos"
    },
    "cadeiras-gamer": {
      id: "cadeiras-gamer",
      label: "Cadeiras Gamer",
      emoji: "🪑",
      titulo: "Qual cadeira gamer comprar?",
      subtitulo: "Escolha sua faixa de preço e prioridade para passar horas sentado com conforto.",
      iconeSvg:
        '<svg viewBox="0 0 24 24"><path d="M7 13V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8"></path><path d="M5 13h14a2 2 0 0 1 2 2v2H3v-2a2 2 0 0 1 2-2z"></path><path d="M12 17v4M8 21h8"></path></svg>',
      orcamentos: [600, 900, 1300],
      usos: [
        { id: "jogos", label: "🎮 Jogos" },
        { id: "trabalho", label: "💼 Home Office" },
        { id: "conforto", label: "🛋️ Conforto" },
        { id: "compacta", label: "📏 Compacta" }
      ],
      padraoOrcamento: 900,
      padraoUso: "jogos"
    }
  };

  const IMAGEM_FALLBACK =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">' +
        '<rect width="300" height="300" fill="#11151d"/>' +
        '<circle cx="150" cy="150" r="64" fill="none" stroke="#f97316" stroke-width="10"/>' +
        '<path d="M125 150h50M150 125v50" stroke="#9333ea" stroke-width="10" stroke-linecap="round"/>' +
      "</svg>"
    );

  function montarLinkAmazon(asin) {
    const codigo = encodeURIComponent(String(asin || "").trim());
    return "https://www.amazon.com.br/dp/" + codigo + "?tag=" + AMAZON_TAG;
  }

  function formatarPreco(valor) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(Number(valor) || 0);
  }

  function normalizarTexto(txt) {
    return String(txt || "").trim().toLowerCase();
  }

  function criarCardProduto(prod, opcoes) {
    const opts = opcoes || {};
    const index = opts.index || 0;
    const destaque = Boolean(opts.destaque);
    const mostrarCategoria = Boolean(opts.mostrarCategoria);

    const card = document.createElement("article");
    card.className = destaque ? "qf-card qf-card-destaque" : "qf-card";
    card.style.animationDelay = index * 90 + "ms";

    const imgWrap = document.createElement("div");
    imgWrap.className = "qf-img-wrap";
    const img = document.createElement("img");
    img.src = prod.imagem || IMAGEM_FALLBACK;
    img.alt = prod.nome;
    img.loading = "lazy";
    img.onerror = function () {
      this.onerror = null;
      this.src = IMAGEM_FALLBACK;
    };
    imgWrap.appendChild(img);

    const body = document.createElement("div");
    body.className = "qf-card-body";

    if (destaque) {
      const seloMelhor = document.createElement("div");
      seloMelhor.className = "qf-best-badge";
      seloMelhor.textContent = opts.textoDestaque || "★ Melhor escolha";
      body.appendChild(seloMelhor);
    }

    const badges = document.createElement("div");
    badges.className = "qf-badges";

    if (mostrarCategoria) {
      const catInfo = CATEGORIAS[prod.categoria];
      const badgeCat = document.createElement("span");
      badgeCat.className = "qf-badge-cat";
      badgeCat.textContent = catInfo ? catInfo.emoji + " " + catInfo.label : prod.categoria;
      badges.appendChild(badgeCat);
    }

    (prod.usos || []).forEach(function (u) {
      const badgeUso = document.createElement("span");
      badgeUso.className = "qf-badge-use";
      badgeUso.textContent = u;
      badges.appendChild(badgeUso);
    });

    const nome = document.createElement("h3");
    nome.className = "qf-prod-name";
    nome.textContent = prod.nome;

    const priceRow = document.createElement("div");
    priceRow.className = "qf-price-row";
    const priceBig = document.createElement("span");
    priceBig.className = "qf-price-big";
    priceBig.textContent = formatarPreco(prod.preco);
    const priceNote = document.createElement("span");
    priceNote.className = "qf-price-note";
    priceNote.textContent = "Confira o preço atualizado na Amazon";
    priceRow.appendChild(priceBig);
    priceRow.appendChild(priceNote);

    const ul = document.createElement("ul");
    ul.className = "qf-points";

    (prod.vantagens || []).slice(0, 2).forEach(function (vantagem) {
      const li = document.createElement("li");
      li.className = "qf-pro";
      li.textContent = "✓ Vantagem: " + vantagem;
      ul.appendChild(li);
    });

    if (prod.limitacao) {
      const liCon = document.createElement("li");
      liCon.className = "qf-con";
      liCon.textContent = "⚠ Limitação: " + prod.limitacao;
      ul.appendChild(liCon);
    }

    const btnAmazon = document.createElement("a");
    btnAmazon.className = "qf-amazon-btn";
    btnAmazon.href = montarLinkAmazon(prod.asin);
    btnAmazon.target = "_blank";
    btnAmazon.rel = "nofollow noopener sponsored";
    btnAmazon.textContent = "Ver na Amazon ↗";

    body.appendChild(badges);
    body.appendChild(nome);
    body.appendChild(priceRow);
    body.appendChild(ul);
    body.appendChild(btnAmazon);

    card.appendChild(imgWrap);
    card.appendChild(body);
    return card;
  }

  async function carregarProdutos() {
    const resposta = await fetch("./produtos.json", { cache: "no-store" });
    if (!resposta.ok) {
      throw new Error("HTTP " + resposta.status);
    }
    const dados = await resposta.json();
    if (!Array.isArray(dados)) {
      throw new Error("Formato inválido em produtos.json");
    }
    return dados.filter(function (prod) {
      return prod && prod.exemplo !== true;
    });
  }

  function mostrarErroCarregamento(container) {
    if (!container) return;
    container.innerHTML = "";
    const box = document.createElement("div");
    box.className = "qf-error-banner";
    box.innerHTML =
      "<strong>Não foi possível carregar o arquivo produtos.json.</strong><br>" +
      "Se você abriu o arquivo HTML direto do computador (<code>file://</code>), o navegador bloqueia a leitura do JSON por segurança. " +
      "Para testar, publique no <strong>GitHub Pages</strong> ou abra usando um servidor local.";
    container.appendChild(box);
  }

  function selecionarMaisProcurados(produtos) {
    const preferenciaAsins = ["B0DB52X2ZW", "B07Y2G7VX5", "B07JQKQ91F"];
    const escolhidos = [];

    preferenciaAsins.forEach(function (asin) {
      const encontrado = produtos.find(function (p) {
        return p.asin === asin;
      });
      if (encontrado) {
        escolhidos.push(encontrado);
      }
    });

    produtos.forEach(function (p) {
      if (escolhidos.length < 3 && escolhidos.indexOf(p) === -1) {
        escolhidos.push(p);
      }
    });

    return escolhidos.slice(0, 3);
  }

  function iniciarHome(produtos) {
    const contadores = {};
    produtos.forEach(function (p) {
      const cat = String(p.categoria || "");
      contadores[cat] = (contadores[cat] || 0) + 1;
    });

    document.querySelectorAll("[data-cat-count]").forEach(function (el) {
      const cat = el.getAttribute("data-cat-count");
      const qtd = contadores[cat] || 0;
      if (qtd === 0) {
        el.textContent = "Em breve";
      } else {
        el.textContent = qtd === 1 ? "1 opção" : qtd + " opções";
      }
    });

    const gridMaisProcurados = document.getElementById("qf-featured-grid");
    if (gridMaisProcurados) {
      gridMaisProcurados.innerHTML = "";
      const destaques = selecionarMaisProcurados(produtos);
      destaques.forEach(function (prod, index) {
        gridMaisProcurados.appendChild(
          criarCardProduto(prod, {
            index: index,
            destaque: index === 0,
            textoDestaque: "🔥 Mais procurado",
            mostrarCategoria: true
          })
        );
      });
    }
  }

  function iniciarComparador(produtos) {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get("cat") || "fones";
    const config = CATEGORIAS[catParam] || CATEGORIAS.fones;

    document.title = config.titulo + " | Qual Comprar - Ofertas GS";

    const headerIcon = document.getElementById("qf-header-icon");
    const headerTitle = document.getElementById("qf-header-title");
    const headerSubtitle = document.getElementById("qf-header-subtitle");
    const navPills = document.getElementById("qf-nav-pills");
    const grupoOrcamento = document.getElementById("qf-orcamento-grupo");
    const grupoUso = document.getElementById("qf-uso-grupo");
    const areaResultados = document.getElementById("qf-resultados-area");

    if (headerIcon) headerIcon.innerHTML = config.iconeSvg;
    if (headerTitle) headerTitle.textContent = config.titulo;
    if (headerSubtitle) headerSubtitle.textContent = config.subtitulo;

    if (navPills) {
      navPills.innerHTML = "";
      Object.keys(CATEGORIAS).forEach(function (chave) {
        const c = CATEGORIAS[chave];
        const link = document.createElement("a");
        link.className = c.id === config.id ? "nav-pill ativo" : "nav-pill";
        link.href = "./comparador.html?cat=" + encodeURIComponent(c.id);
        link.textContent = c.emoji + " " + c.label;
        navPills.appendChild(link);
      });
    }

    const produtosCategoria = produtos.filter(function (prod) {
      return prod.categoria === config.id;
    });

    if (produtosCategoria.length === 0) {
      document.querySelectorAll(".qf-step").forEach(function (sec) {
        sec.style.display = "none";
      });
      if (areaResultados) {
        areaResultados.innerHTML = "";
        const aviso = document.createElement("div");
        aviso.className = "qf-placeholder";

        const titulo = document.createElement("h2");
        titulo.className = "qf-results-header";
        titulo.style.marginTop = "0";
        titulo.textContent = "Em breve";

        const texto = document.createElement("p");
        texto.style.margin = "0";
        texto.textContent =
          "Estamos selecionando os melhores produtos desta categoria. Volte em breve ou escolha outra categoria acima.";

        aviso.appendChild(titulo);
        aviso.appendChild(texto);
        areaResultados.appendChild(aviso);
      }
      return;
    }

    let orcamentoSelecionado = config.padraoOrcamento;
    let usoSelecionado = config.padraoUso;

    function atualizarBotoes(container, atributo, valorAtivo) {
      if (!container) return;
      container.querySelectorAll(".qf-choice-btn").forEach(function (btn) {
        const ativo = btn.getAttribute(atributo) === String(valorAtivo);
        btn.classList.toggle("ativo", ativo);
        btn.setAttribute("aria-pressed", ativo ? "true" : "false");
      });
    }

    if (grupoOrcamento) {
      grupoOrcamento.innerHTML = "";
      config.orcamentos.forEach(function (valor) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "qf-choice-btn";
        btn.setAttribute("data-orcamento", String(valor));
        btn.textContent = "Até R$ " + valor;
        grupoOrcamento.appendChild(btn);
      });
    }

    if (grupoUso) {
      grupoUso.className = config.usos.length === 3 ? "qf-grid-3" : "qf-grid-4";
      grupoUso.innerHTML = "";
      config.usos.forEach(function (usoObj) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "qf-choice-btn";
        btn.setAttribute("data-uso", usoObj.id);
        btn.textContent = usoObj.label;
        grupoUso.appendChild(btn);
      });
    }

    function renderizarRecomendacoes() {
      if (!areaResultados) return;
      const limitePreco = Number(orcamentoSelecionado);
      const usoAlvo = normalizarTexto(usoSelecionado);

      const recomendados = produtosCategoria
        .filter(function (prod) {
          const precoProd = Number(prod.preco);
          const usosNormalizados = (prod.usos || []).map(normalizarTexto);
          return precoProd <= limitePreco && usosNormalizados.indexOf(usoAlvo) !== -1;
        })
        .sort(function (a, b) {
          return Number(b.preco) - Number(a.preco);
        })
        .slice(0, 3);

      areaResultados.innerHTML = "";

      if (recomendados.length === 0) {
        const vazio = document.createElement("div");
        vazio.className = "qf-placeholder";
        vazio.textContent =
          "Nenhum produto encontrado para essa combinação no momento. Tente aumentar a faixa de orçamento ou escolher outro uso.";
        areaResultados.appendChild(vazio);
        return;
      }

      const tituloRes = document.createElement("h2");
      tituloRes.className = "qf-results-header";
      tituloRes.textContent =
        recomendados.length === 1
          ? "1 recomendação encontrada:"
          : recomendados.length + " recomendações encontradas:";
      areaResultados.appendChild(tituloRes);

      const listaCards = document.createElement("div");
      listaCards.className = "qf-cards";

      recomendados.forEach(function (prod, index) {
        listaCards.appendChild(
          criarCardProduto(prod, {
            index: index,
            destaque: index === 0,
            textoDestaque: "★ Melhor escolha",
            mostrarCategoria: false
          })
        );
      });

      areaResultados.appendChild(listaCards);
    }

    if (grupoOrcamento) {
      grupoOrcamento.addEventListener("click", function (e) {
        const btn = e.target.closest(".qf-choice-btn");
        if (!btn) return;
        orcamentoSelecionado = Number(btn.getAttribute("data-orcamento"));
        atualizarBotoes(grupoOrcamento, "data-orcamento", orcamentoSelecionado);
        renderizarRecomendacoes();
      });
    }

    if (grupoUso) {
      grupoUso.addEventListener("click", function (e) {
        const btn = e.target.closest(".qf-choice-btn");
        if (!btn) return;
        usoSelecionado = btn.getAttribute("data-uso");
        atualizarBotoes(grupoUso, "data-uso", usoSelecionado);
        renderizarRecomendacoes();
      });
    }

    atualizarBotoes(grupoOrcamento, "data-orcamento", orcamentoSelecionado);
    atualizarBotoes(grupoUso, "data-uso", usoSelecionado);
    renderizarRecomendacoes();
  }

  document.addEventListener("DOMContentLoaded", async function () {
    const pagina = document.body.dataset.page;
    try {
      const produtos = await carregarProdutos();
      if (pagina === "home") {
        iniciarHome(produtos);
      } else if (pagina === "comparador") {
        iniciarComparador(produtos);
      }
    } catch (erro) {
      console.error("Erro ao carregar produtos.json:", erro);
      const alvo =
        document.getElementById("qf-resultados-area") ||
        document.getElementById("qf-home-status");
      mostrarErroCarregamento(alvo);
    }
  });
})();
