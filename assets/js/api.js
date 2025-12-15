const BASE_URL = "https://script.google.com/macros/s/AKfycbxZorvfzApoMf39g2V0YOMZ_nKPlX77-XFuBvmgvZW0uECNFLtBWyXE1QqrN6c21aIDkg/exec";

async function fetchAPI(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error("Erro API");
  return res.json();
}

function carregarCozinha() {
  fetchAPI("/cozinha")
    .then(renderCozinha)
    .catch(console.error);
}
