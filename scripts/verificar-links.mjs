import fs from "node:fs";
import path from "node:path";

const AMAZON_TAG = "gs20063-20";
const OFFLINE_CHECK = process.argv.includes("--offline-check");
const CATEGORIAS_VALIDAS = new Set(["fones", "mouses", "teclados", "headsets", "cadeiras-gamer"]);
const ISSUE_TITLE = "[Aviso] Links da Amazon quebrados";
const ISSUE_LABEL = "link-quebrado";

function montarLinkAmazon(asin) {
  return `https://www.amazon.com.br/dp/${encodeURIComponent(String(asin || "").trim())}?tag=${AMAZON_TAG}`;
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validarProduto(prod, indice) {
  const erros = [];
  if (!prod || typeof prod !== "object") {
    return [`Item #${indice} não é um objeto válido`];
  }
  const obrigatorios = ["nome", "preco", "imagem", "asin", "categoria"];
  for (const campo of obrigatorios) {
    if (prod[campo] === undefined || prod[campo] === null || String(prod[campo]).trim() === "") {
      erros.push(`campo "${campo}" ausente ou vazio`);
    }
  }
  if (!CATEGORIAS_VALIDAS.has(prod.categoria)) {
    erros.push(`categoria inválida "${prod.categoria}"`);
  }
  if (typeof prod.preco !== "number" || Number.isNaN(prod.preco) || prod.preco <= 0) {
    erros.push(`preço inválido "${prod.preco}"`);
  }
  if (!Array.isArray(prod.usos) || prod.usos.length === 0) {
    erros.push('campo "usos" deve ser um array com pelo menos 1 uso');
  }
  if (!Array.isArray(prod.vantagens) || prod.vantagens.length < 2) {
    erros.push('campo "vantagens" deve ter 2 itens');
  }
  return erros;
}

async function buscarPagina(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const resp = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8"
      }
    });
    const texto = await resp.text();
    return { status: resp.status, body: texto, finalUrl: resp.url };
  } finally {
    clearTimeout(timer);
  }
}

function classificarResposta(status, body) {
  const corpoMin = (body || "").toLowerCase();

  if (status === 404 || status === 410) {
    return { estado: "quebrado", motivo: `HTTP ${status} (página não encontrada)` };
  }

  if (
    corpoMin.includes("página não encontrada") ||
    corpoMin.includes("desculpe, não encontramos") ||
    corpoMin.includes("dogs of amazon")
  ) {
    return { estado: "quebrado", motivo: `HTTP ${status} com página de erro 404 da Amazon` };
  }

  if (
    status === 429 ||
    status === 503 ||
    corpoMin.includes("validatecaptcha") ||
    corpoMin.includes("digite os caracteres") ||
    corpoMin.includes("robot check")
  ) {
    return {
      estado: "inconclusivo",
      motivo: `HTTP ${status} / verificação automática da Amazon (não foi possível confirmar automaticamente)`
    };
  }

  if (status >= 200 && status < 400) {
    return { estado: "ok", motivo: `HTTP ${status}` };
  }

  return { estado: "quebrado", motivo: `HTTP ${status}` };
}

async function verificarUrlComRetry(url) {
  for (let tentativa = 1; tentativa <= 2; tentativa += 1) {
    try {
      const { status, body } = await buscarPagina(url);
      const resultado = classificarResposta(status, body);
      if (resultado.estado === "ok" || tentativa === 2) {
        return resultado;
      }
    } catch (erro) {
      if (tentativa === 2) {
        return { estado: "quebrado", motivo: `Erro de rede: ${erro.message}` };
      }
    }
    await esperar(2000);
  }
  return { estado: "quebrado", motivo: "Falha desconhecida" };
}

async function githubApi(endpoint, token, options = {}) {
  const resp = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!resp.ok) {
    const detalhe = await resp.text();
    throw new Error(`GitHub API ${resp.status}: ${detalhe}`);
  }
  return resp.json();
}

async function notificarIssueGitHub(quebrados) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) {
    console.log("GITHUB_TOKEN ou GITHUB_REPOSITORY ausentes; pulando criação de Issue.");
    return;
  }

  const dataHoje = new Date().toISOString().slice(0, 10);
  const linhasTabela = quebrados
    .map(
      (item) =>
        `| ${item.nome.replaceAll("|", "\\|")} | \`${item.categoria}\` | \`${item.asin}\` | [Abrir](${item.url}) | ${item.motivo} |`
    )
    .join("\n");

  const corpo = [
    `A verificação diária de links encontrou **${quebrados.length}** produto(s) com problema em \`${dataHoje}\`:`,
    "",
    "| Produto | Categoria | ASIN | Link | Motivo |",
    "| --- | --- | --- | --- | --- |",
    linhasTabela,
    "",
    "Confira os itens acima no arquivo `produtos.json` e atualize ou remova os ASINs quebrados."
  ].join("\n");

  const issuesAbertas = await githubApi(
    `/repos/${repo}/issues?state=open&per_page=30`,
    token
  );
  const existente = issuesAbertas.find((i) => i.title === ISSUE_TITLE && !i.pull_request);

  if (existente) {
    await githubApi(`/repos/${repo}/issues/${existente.number}/comments`, token, {
      method: "POST",
      body: JSON.stringify({ body: corpo })
    });
    console.log(`Comentário adicionado na Issue #${existente.number}.`);
    return;
  }

  try {
    const criada = await githubApi(`/repos/${repo}/issues`, token, {
      method: "POST",
      body: JSON.stringify({
        title: ISSUE_TITLE,
        body: corpo,
        labels: [ISSUE_LABEL]
      })
    });
    console.log(`Issue criada: #${criada.number} (${criada.html_url})`);
  } catch {
    const criada = await githubApi(`/repos/${repo}/issues`, token, {
      method: "POST",
      body: JSON.stringify({
        title: ISSUE_TITLE,
        body: corpo
      })
    });
    console.log(`Issue criada (sem label): #${criada.number} (${criada.html_url})`);
  }
}

function gravarResumoGitHub(relatorio) {
  const arquivoResumo = process.env.GITHUB_STEP_SUMMARY;
  if (!arquivoResumo) return;

  const linhas = [
    "## Verificação diária de links da Amazon",
    "",
    "| Produto | ASIN | Link | Status | Detalhe |",
    "| --- | --- | --- | --- | --- |",
    ...relatorio.map(
      (r) =>
        `| ${r.nome.replaceAll("|", "\\|")} | \`${r.asin}\` | ${r.url} | ${r.estado.toUpperCase()} | ${r.motivo} |`
    ),
    ""
  ].join("\n");

  fs.appendFileSync(arquivoResumo, linhas, "utf8");
}

async function main() {
  const caminhoJson = path.resolve(process.cwd(), "produtos.json");
  const produtos = JSON.parse(fs.readFileSync(caminhoJson, "utf8"));

  if (!Array.isArray(produtos)) {
    throw new Error("produtos.json precisa ser um array.");
  }

  const errosEsquema = [];
  produtos.forEach((prod, i) => {
    const errs = validarProduto(prod, i);
    if (errs.length > 0) {
      errosEsquema.push(`Produto #${i} (${prod?.nome || "sem nome"}): ${errs.join("; ")}`);
    }
  });

  if (errosEsquema.length > 0) {
    console.error("Erros encontrados em produtos.json:\n" + errosEsquema.join("\n"));
    process.exitCode = 1;
    return;
  }

  const reais = produtos.filter((p) => p.exemplo !== true);
  const exemplos = produtos.filter((p) => p.exemplo === true);

  console.log(`Total no produtos.json: ${produtos.length} (${reais.length} reais, ${exemplos.length} exemplos).`);

  if (OFFLINE_CHECK) {
    console.log("\n[Modo --offline-check] Estrutura válida! Links gerados para produtos reais:");
    for (const prod of reais) {
      console.log(`- [${prod.categoria}] ${prod.nome} -> ${montarLinkAmazon(prod.asin)}`);
    }
    return;
  }

  const relatorio = [];
  const quebrados = [];

  for (let i = 0; i < reais.length; i += 1) {
    const prod = reais[i];
    const url = montarLinkAmazon(prod.asin);
    console.log(`Verificando (${i + 1}/${reais.length}): ${prod.nome} -> ${url}`);

    const resultado = await verificarUrlComRetry(url);
    const registro = {
      nome: prod.nome,
      categoria: prod.categoria,
      asin: prod.asin,
      url,
      estado: resultado.estado,
      motivo: resultado.motivo
    };

    relatorio.push(registro);
    console.log(`  Resultado: ${registro.estado.toUpperCase()} - ${registro.motivo}`);

    if (registro.estado === "quebrado") {
      quebrados.push(registro);
    }

    if (i < reais.length - 1) {
      await esperar(2000);
    }
  }

  gravarResumoGitHub(relatorio);

  if (quebrados.length > 0) {
    console.log(`\n${quebrados.length} link(s) quebrado(s) encontrado(s).`);
    await notificarIssueGitHub(quebrados);
    process.exitCode = 1;
  } else {
    console.log("\nNenhum link quebrado confirmado.");
  }
}

main().catch((erro) => {
  console.error("Erro fatal ao verificar links:", erro);
  process.exitCode = 1;
});
