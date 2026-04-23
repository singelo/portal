// =============================
// LOGIN TOKEN
// =============================

const loginScreen = document.getElementById("loginScreen");
const loginBtn = document.getElementById("loginBtn");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");

function checkSession() {

    const token = sessionStorage.getItem("rm_token");

    if (!token) {
        loginScreen.style.display = "flex";
    } else {
        loginScreen.style.display = "none";
        loadDashboard();
    }

}

loginBtn?.addEventListener("click", async () => {

    loginError.textContent = "";

    try {

        await login(loginPassword.value);

        loginScreen.style.display = "none";

        loadDashboard();

    } catch (err) {
        console.error("Erro real no login:", err);
        loginError.textContent = err.message || "Erro ao entrar";
    }

});

// =============================
// ELEMENTOS PRINCIPAIS
// =============================

const menuToggle = document.getElementById("menuToggle");
const closeSidebarBtn = document.getElementById("closeSidebarBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

const navLinks = document.querySelectorAll(".nav-link");
const views = document.querySelectorAll(".view");

const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");

const modalRoot = document.getElementById("modalRoot");


// =============================
// MENU MOBILE
// =============================

function openMenu() {
    sidebar.classList.add("is-open");
    document.body.classList.add("menu-open");
}

function closeMenu() {
    sidebar.classList.remove("is-open");
    document.body.classList.remove("menu-open");
}

menuToggle?.addEventListener("click", openMenu);
closeSidebarBtn?.addEventListener("click", closeMenu);
sidebarOverlay?.addEventListener("click", closeMenu);


// =============================
// TROCA DE VIEW
// =============================

const viewMap = {
    dashboard: { title: "Início", subtitle: "Controle de clientes, OS e itens" },
    clientes: { title: "Clientes", subtitle: "Cadastro e consulta" },
    "os-list": { title: "Ordens de Serviço", subtitle: "Listagem geral" },
    "os-detail": { title: "Detalhes da OS", subtitle: "Itens e PDF" }
};

function goToView(view) {

    navLinks.forEach(link => link.classList.remove("is-active"));
    document.querySelector(`[data-view="${view}"]`)?.classList.add("is-active");

    views.forEach(v => v.classList.remove("is-active"));
    document.getElementById(`view-${view}`)?.classList.add("is-active");

    pageTitle.textContent = viewMap[view]?.title || "Portal";
    pageSubtitle.textContent = viewMap[view]?.subtitle || "";

    closeMenu();
}

navLinks.forEach(btn => {
    btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        if (!view) return;
        goToView(view);
    });
});


// =============================
// MODAL
// =============================

function showModal({ title, body, actions = "" }) {

    modalRoot.innerHTML = `
  <div class="modal-backdrop">

    <div class="modal-card">

      <div class="modal-head">
        <h3>${title}</h3>
        <button class="icon-btn" data-close-modal="1">✕</button>
      </div>

      <div class="modal-body">
        ${body}
      </div>

      <div class="modal-actions">
        ${actions}
      </div>

    </div>

  </div>
  `;

    modalRoot.classList.add("has-modal");
    document.body.classList.add("modal-open");
}

function closeModal() {

    modalRoot.innerHTML = "";
    modalRoot.classList.remove("has-modal");
    document.body.classList.remove("modal-open");
}

modalRoot.addEventListener("click", (e) => {

    if (e.target.closest("[data-close-modal]")) {
        closeModal();
    }

    if (e.target.classList.contains("modal-backdrop")) {
        closeModal();
    }

});


// =============================
// MODAL CLIENTE
// =============================

function openNovoClienteModal() {

    showModal({

        title: "Novo Cliente",

        body: `
      <div class="form-grid">

        <input class="input" placeholder="Nome do cliente">

        <div class="form-row">
          <input class="input" placeholder="Telefone">
          <input class="input" placeholder="CNPJ">
        </div>

        <input class="input" placeholder="Endereço">

        <textarea class="textarea" placeholder="Observações"></textarea>

      </div>
    `,

        actions: `
      <button class="btn btn-secondary" data-close-modal="1">Cancelar</button>
      <button class="btn btn-primary">Salvar</button>
    `
    });
}


// =============================
// MODAL OS
// =============================

function openNovaOSModal() {

    showModal({

        title: "Nova OS",

        body: `
      <div class="form-grid">

        <select class="input">
          <option>Selecionar cliente</option>
        </select>

        <textarea class="textarea" placeholder="Descrição da OS"></textarea>

      </div>
    `,

        actions: `
      <button class="btn btn-secondary" data-close-modal="1">Cancelar</button>
      <button class="btn btn-primary">Criar OS</button>
    `
    });
}


// =============================
// BOTÕES
// =============================

document.getElementById("actionNovoCliente")?.addEventListener("click", openNovoClienteModal);
document.getElementById("novoClienteBtn")?.addEventListener("click", openNovoClienteModal);

document.getElementById("actionNovaOS")?.addEventListener("click", openNovaOSModal);
document.getElementById("novaOsBtn")?.addEventListener("click", openNovaOSModal);
document.getElementById("quickNewOsBtn")?.addEventListener("click", openNovaOSModal);


// =============================
// ESC FECHA MODAL
// =============================

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeModal();
        closeMenu();
    }
});


// view inicial
goToView("dashboard");