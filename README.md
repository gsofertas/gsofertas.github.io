# Qual Comprar - Ofertas GS

Site estático simples de recomendação de produtos (Fones, Mouses, Teclados, Headsets e Cadeiras Gamer) pronto para publicar grátis no **GitHub Pages**, com verificador diário de links da Amazon via **GitHub Actions**.

## Estrutura dos arquivos

- `index.html`: página inicial com os botões grandes para as 5 categorias.
- `comparador.html`: página do comparador (lê `?cat=...` na URL, mostra orçamento e uso).
- `styles.css`: visual escuro, cabeçalho degradê laranja/roxo e layout responsivo para celular.
- `app.js`: lógica que lê `produtos.json`, filtra os produtos e monta os links `https://www.amazon.com.br/dp/ASIN?tag=gs20063-20`.
- `produtos.json`: lista única com todos os produtos do site.
- `scripts/verificar-links.mjs` e `.github/workflows/verificar-links.yml`: robô que roda 1 vez por dia e abre uma **Issue** no GitHub se algum link quebrar.

## Como adicionar ou editar produtos

Abra o arquivo `produtos.json`. Cada produto tem este formato:

```json
{
  "categoria": "mouses",
  "nome": "Nome do Produto",
  "preco": 99.9,
  "imagem": "https://m.media-amazon.com/images/I/...",
  "asin": "B0XXXXXXX",
  "usos": ["trabalho", "dia a dia"],
  "vantagens": [
    "Primeira vantagem",
    "Segunda vantagem"
  ],
  "limitacao": "Principal limitação",
  "exemplo": false
}
```

- Quando trocar um item de exemplo por um produto real, mude `"exemplo": false` (ou apague essa linha) para que o robô passe a monitorar o link dele todos os dias.
- Categorias válidas: `"fones"`, `"mouses"`, `"teclados"`, `"headsets"`, `"cadeiras-gamer"`.

## Como publicar no GitHub Pages (passo a passo)

1. Crie uma conta gratuita em https://github.com (se ainda não tiver).
2. Clique em **New** (Novo repositório), dê o nome `qual-comprar-ofertas-gs`, deixe como **Public** e clique em **Create repository**.
3. Na página do repositório, clique em **uploading an existing file** e arraste todos os arquivos e pastas deste projeto (inclusive a pasta oculta `.github`).
4. Clique em **Commit changes**.
5. Vá em **Settings** > **Pages** (no menu esquerdo).
6. Em **Build and deployment > Source**, escolha **Deploy from a branch**.
7. Em **Branch**, selecione `main` e a pasta `/ (root)` e clique em **Save**.
8. Aguarde cerca de 1 a 2 minutos e atualize a página: o link do seu site aparecerá no topo!
