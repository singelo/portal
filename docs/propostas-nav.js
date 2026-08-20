const PROPOSTAS_URL = '/portal/propostas.html';

function restorePropostasNavigation() {
  document.querySelectorAll('nav').forEach((nav) => {
    if (nav.querySelector('[data-propostas-restored="true"]')) return;

    const orcamentosLink = nav.querySelector('a[href="#/orcamentos"]');
    if (!orcamentosLink) return;

    const propostasLink = orcamentosLink.cloneNode(true);
    propostasLink.href = PROPOSTAS_URL;
    propostasLink.dataset.propostasRestored = 'true';
    propostasLink.classList.remove('bg-white', 'text-foreground', 'shadow-sm', 'ring-1', 'ring-border');
    propostasLink.classList.add('text-muted-foreground');

    const textNodes = Array.from(propostasLink.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE);
    const labelNode = textNodes[textNodes.length - 1];
    if (labelNode) {
      labelNode.textContent = 'Propostas';
    } else {
      propostasLink.append(document.createTextNode('Propostas'));
    }

    orcamentosLink.insertAdjacentElement('afterend', propostasLink);
  });
}

restorePropostasNavigation();

new MutationObserver(restorePropostasNavigation).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
