/* =============================================================================
   HealthStore Design System — shared chrome + interactions
   -----------------------------------------------------------------------------
   Each page's <body> contains a single:
     <div id="ds-root" data-ds-page="KEY" data-ds-title="...">...content...</div>
   This script injects the masthead + side-nav around it (so static pages stay
   DRY), and wires up copy-code, tab, and accordion demos.
   ============================================================================= */
(function () {
  'use strict';

  var AUDITS = [
    { key: 'report', label: 'Audit report (v1)', href: '/DS/Audits/Report-v1/index.html' },
    { key: 'report-v2', label: 'Round 2 plan (v2)', href: '/DS/Audits/Report-v2/index.html' },
    { key: 'report-v3', label: 'Round 3 plan (v3)', href: '/DS/Audits/Report-v3/index.html' },
    { key: 'report-v4', label: 'Round 4 plan (v4)', href: '/DS/Audits/Report-v4/index.html' },
    { key: 'report-v5', label: 'Audit report (v2)', href: '/DS/Audits/Report-v5/index.html' },
    { key: 'report-v6', label: 'Round 6 plan (v6)', href: '/DS/Audits/Report-v6/index.html' },
    { key: 'report-v7', label: 'Round 7 plan (v7)', href: '/DS/Audits/Report-v7/index.html' },
    { key: 'report-v8', label: 'Audit report (v3)', href: '/DS/Audits/Report-v8/index.html' }
  ];

  var NAV = [
    {
      title: 'Overview',
      items: [
        { key: 'home', label: 'Home', href: '/DS/index.html' },
        { key: 'whats-new', label: "What's changed", href: '/DS/whats-new/index.html' },
        { key: 'sitemap', label: 'Sitemap', href: '/Sitemap/index.html' }
      ]
    },
    {
      title: 'Audits',
      collapsible: true,
      storageKey: 'ds-nav-audits',
      hub: { key: 'audits', label: 'All audits', href: '/DS/Audits/index.html' },
      items: AUDITS
    },
    {
      title: 'Styles',
      collapsible: true,
      storageKey: 'ds-nav-styles',
      items: [
        { key: 'colour', label: 'Colour', href: '/DS/styles/colour.html' },
        { key: 'typography', label: 'Typography', href: '/DS/styles/typography.html' },
        { key: 'spacing', label: 'Spacing & layout', href: '/DS/styles/spacing.html' },
        { key: 'elevation', label: 'Elevation & radius', href: '/DS/styles/elevation.html' },
        { key: 'iconography', label: 'Iconography', href: '/DS/styles/iconography.html' },
        { key: 'accessibility', label: 'Accessibility', href: '/DS/styles/accessibility.html' }
      ]
    },
    {
      title: 'Components',
      collapsible: true,
      storageKey: 'ds-nav-components',
      items: [
        { key: 'badges-tags', label: 'Badges & tags', href: '/DS/components/badges-tags.html' },
        { key: 'buttons', label: 'Buttons', href: '/DS/components/buttons.html' },
        { key: 'cards', label: 'Cards & surfaces', href: '/DS/components/cards.html' },
        { key: 'alerts', label: 'Alerts & notifications', href: '/DS/components/alerts.html' },
        { key: 'section-headers', label: 'Section headers', href: '/DS/components/section-headers.html' },
        { key: 'collapsible', label: 'Collapsible sections', href: '/DS/components/collapsible.html' },
        { key: 'tabs', label: 'Tabs', href: '/DS/components/tabs.html' },
        { key: 'navigation', label: 'Navigation', href: '/DS/components/navigation.html' },
        { key: 'forms', label: 'Forms & inputs', href: '/DS/components/forms.html' },
        { key: 'back-link', label: 'Back link', href: '/DS/components/back-link.html' },
        { key: 'error-summary', label: 'Error summary', href: '/DS/components/error-summary.html' },
        { key: 'summary-list', label: 'Summary list', href: '/DS/components/summary-list.html' },
        { key: 'panel', label: 'Confirmation panel', href: '/DS/components/panel.html' },
        { key: 'tables', label: 'Tables', href: '/DS/components/tables.html' },
        { key: 'toggles', label: 'Toggles & segmented', href: '/DS/components/toggles.html' },
        { key: 'modals', label: 'Modals & dialogs', href: '/DS/components/modals.html' },
        { key: 'loading', label: 'Loading & skeletons', href: '/DS/components/loading.html' }
      ]
    },
    {
      title: 'Patterns',
      collapsible: true,
      storageKey: 'ds-nav-patterns',
      items: [
        { key: 'product-detail', label: 'Product detail (PDP)', href: '/DS/patterns/product-detail.html' },
        { key: 'discovery', label: 'Discovery & catalogue', href: '/DS/patterns/discovery.html' },
        { key: 'compare', label: 'Comparison tool', href: '/DS/patterns/compare.html' },
        { key: 'multi-step-journey', label: 'Multi-step journey', href: '/DS/patterns/multi-step-journey.html' },
        { key: 'dashboard', label: 'Dashboard', href: '/DS/patterns/dashboard.html' },
        { key: 'consent', label: 'Cookie consent', href: '/DS/patterns/consent.html' },
        { key: 'ai-advisor', label: 'AI advisor', href: '/DS/patterns/ai-advisor.html' }
      ]
    },
    {
      title: 'Templates',
      collapsible: true,
      storageKey: 'ds-nav-templates',
      items: [
        { key: 'templates', label: 'Overview', href: '/templates/index.html' },
        { key: 'tpl-home', label: 'T1 Home', href: '/templates/home.html' },
        { key: 'tpl-content-page', label: 'T2 Content page', href: '/templates/content-page.html' },
        { key: 'tpl-hub', label: 'T3 Hub (card grid)', href: '/templates/hub.html' },
        { key: 'tpl-directory', label: 'T4 Directory / listing', href: '/templates/directory.html' },
        { key: 'tpl-product-listing', label: 'T5 Product listing', href: '/templates/product-listing.html' },
        { key: 'tpl-product-detail', label: 'T6 Product detail page', href: '/templates/product-detail.html' },
        { key: 'tpl-eoi-form', label: 'T7 EOI (Form)', href: '/templates/eoi-form.html' },
        { key: 'tpl-utility', label: 'T8 Comparison tool', href: '/templates/utility.html' }
      ]
    },
    {
      title: 'Archived',
      items: [
        { key: 'archived', label: 'Archived', href: '/DS/archived.html' }
      ]
    }
  ];

  function el(tag, attrs, html) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    }
    if (html != null) node.innerHTML = html;
    return node;
  }

  function buildMasthead() {
    var skip = el('a', { class: 'ds-skiplink', href: '#ds-main' }, 'Skip to main content');
    var header = el('header', { class: 'ds-masthead' });
    var inner = el('div', { class: 'ds-masthead__inner' });
    var brand = el('a', { class: 'ds-masthead__brand', href: '/DS/index.html' },
      '<span class="ds-masthead__logo">HealthStore</span><span class="ds-masthead__tag">Design System</span>');
    var badge = el('span', { class: 'ds-masthead__badge' }, 'NHS Design System \u00B7 internal reference');
    inner.appendChild(brand);
    inner.appendChild(badge);
    header.appendChild(inner);
    var frag = document.createDocumentFragment();
    frag.appendChild(skip);
    frag.appendChild(header);
    return frag;
  }

  /** True when the active page lives inside this group (hub or item). */
  function groupActive(group, activeKey) {
    if (group.hub && group.hub.key === activeKey) return true;
    return group.items.some(function (item) { return item.key === activeKey; });
  }

  /* Pages under /templates are a sibling site: their side nav shows only the
     Templates group, rendered flat (no collapse) since it is the sole section. */
  var TEMPLATES_ONLY = window.location.pathname.indexOf('/templates/') === 0 ||
    window.location.pathname === '/templates';

  function buildSidenav(activeKey) {
    var nav = el('nav', { class: 'ds-sidenav', 'aria-label': 'Design system sections' });
    var groups = TEMPLATES_ONLY
      ? NAV.filter(function (group) { return group.title === 'Templates'; })
      : NAV;
    groups.forEach(function (group) {
      var collapsible = group.collapsible && !TEMPLATES_ONLY;
      var g = el('div', { class: 'ds-sidenav__group' + (collapsible ? ' ds-sidenav__group--collapsible' : '') });

      if (collapsible) {
        var stored = null;
        try { stored = localStorage.getItem(group.storageKey); } catch (e) { /* ignore */ }
        var isOpen = stored === '1' || (stored !== '0' && groupActive(group, activeKey));

        var head = el('div', { class: 'ds-sidenav__collapsible-head' });
        var toggle = el('button', {
          type: 'button',
          class: 'ds-sidenav__toggle',
          'aria-expanded': isOpen ? 'true' : 'false',
          'aria-controls': 'ds-nav-' + group.storageKey
        });
        toggle.innerHTML = '<span class="ds-sidenav__toggle-label">' + group.title + '</span>' +
          '<span class="ds-sidenav__chevron" aria-hidden="true"></span>';

        var panel = el('div', {
          class: 'ds-sidenav__panel',
          id: 'ds-nav-' + group.storageKey
        });
        if (!isOpen) panel.setAttribute('hidden', '');

        toggle.addEventListener('click', function () {
          var open = panel.hasAttribute('hidden');
          if (open) { panel.removeAttribute('hidden'); toggle.setAttribute('aria-expanded', 'true'); }
          else { panel.setAttribute('hidden', ''); toggle.setAttribute('aria-expanded', 'false'); }
          try { localStorage.setItem(group.storageKey, open ? '1' : '0'); } catch (e) { /* ignore */ }
        });

        head.appendChild(toggle);
        g.appendChild(head);

        var ul = el('ul', { class: 'ds-sidenav__list ds-sidenav__list--nested' });
        if (group.hub) {
          var hubLi = el('li');
          var hubA = el('a', { class: 'ds-sidenav__link ds-sidenav__link--hub', href: group.hub.href }, group.hub.label);
          if (group.hub.key === activeKey) hubA.setAttribute('aria-current', 'page');
          hubLi.appendChild(hubA);
          ul.appendChild(hubLi);
        }
        group.items.forEach(function (item) {
          var li = el('li');
          var a = el('a', { class: 'ds-sidenav__link', href: item.href }, item.label);
          if (item.key === activeKey) a.setAttribute('aria-current', 'page');
          li.appendChild(a);
          ul.appendChild(li);
        });
        panel.appendChild(ul);
        g.appendChild(panel);
      } else {
        g.appendChild(el('p', { class: 'ds-sidenav__title' }, group.title));
        var ulFlat = el('ul', { class: 'ds-sidenav__list' });
        group.items.forEach(function (item) {
          var li = el('li');
          var a = el('a', { class: 'ds-sidenav__link', href: item.href }, item.label);
          if (item.key === activeKey) a.setAttribute('aria-current', 'page');
          li.appendChild(a);
          ulFlat.appendChild(li);
        });
        g.appendChild(ulFlat);
      }

      nav.appendChild(g);
    });
    return nav;
  }

  function buildFooter() {
    return el('footer', { class: 'ds-footer' },
      'HealthStore Design System \u2014 internal reference. Built on the <strong>NHS Design System</strong> (nhsuk-frontend), with GOV.UK Frontend recoloured to NHS for gaps. Tokens mirror <code>app/globals.css</code>.');
  }

  /* Provenance label: reads data-ds-provenance on #ds-root and renders a pill at
     the top of the page content. Values: NHS | GOV.UK-recoloured | Bespoke. */
  var PROVENANCE = {
    'NHS': { cls: 'ds-provenance--nhs', text: 'NHS Design System' },
    'GOV.UK-recoloured': { cls: 'ds-provenance--govuk', text: 'GOV.UK Frontend \u2014 recoloured to NHS' },
    'Bespoke': { cls: 'ds-provenance--bespoke', text: 'Bespoke \u2014 no DS equivalent' }
  };

  function renderProvenance(root) {
    var raw = root.getAttribute('data-ds-provenance');
    if (!raw) return;
    var meta = PROVENANCE[raw] || PROVENANCE['Bespoke'];
    var pill = el('p', { class: 'ds-provenance ' + meta.cls }, meta.text);
    if (root.firstChild) root.insertBefore(pill, root.firstChild);
    else root.appendChild(pill);
  }

  function wireCopyButtons(scope) {
    var blocks = scope.querySelectorAll('pre.ds-code');
    blocks.forEach(function (pre) {
      if (pre.querySelector('.ds-code__copy')) return;
      var btn = el('button', { type: 'button', class: 'ds-code__copy' }, 'Copy');
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = code ? code.textContent : pre.textContent;
        navigator.clipboard && navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Copied';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1400);
        });
      });
      pre.appendChild(btn);
    });
  }

  function wireTabs(scope) {
    var groups = scope.querySelectorAll('[data-ds-tabs]');
    groups.forEach(function (group) {
      var tabs = group.querySelectorAll('.nhsuk-tabs__tab');
      function activate(target) {
        tabs.forEach(function (tab) {
          var li = tab.closest('.nhsuk-tabs__list-item');
          var panelId = tab.getAttribute('href').replace('#', '');
          var panel = group.querySelector('#' + CSS.escape(panelId));
          var isActive = tab === target;
          if (li) li.classList.toggle('nhsuk-tabs__list-item--selected', isActive);
          tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
          if (panel) panel.classList.toggle('nhsuk-tabs__panel--hidden', !isActive);
        });
      }
      tabs.forEach(function (tab, idx) {
        tab.addEventListener('click', function (e) { e.preventDefault(); activate(tab); });
        tab.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            var next = e.key === 'ArrowRight' ? tabs[idx + 1] || tabs[0] : tabs[idx - 1] || tabs[tabs.length - 1];
            next.focus(); activate(next);
          }
        });
      });
    });
  }

  function wireToggles(scope) {
    var toggles = scope.querySelectorAll('[data-ds-toggle]');
    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-ds-toggle');
        var panel = document.getElementById(id);
        if (!panel) return;
        var open = panel.hasAttribute('hidden') ? false : true;
        if (open) { panel.setAttribute('hidden', ''); btn.textContent = btn.getAttribute('data-show-label') || 'Show'; btn.setAttribute('aria-expanded', 'false'); }
        else { panel.removeAttribute('hidden'); btn.textContent = btn.getAttribute('data-hide-label') || 'Hide'; btn.setAttribute('aria-expanded', 'true'); }
      });
    });
  }

  function init() {
    var root = document.getElementById('ds-root');
    if (!root) return;
    var activeKey = root.getAttribute('data-ds-page') || '';

    renderProvenance(root);

    document.body.insertBefore(buildMasthead(), root);

    var layout = el('div', { class: 'ds-layout' });
    document.body.insertBefore(layout, root);

    /* Pages can opt out of the side navigation with data-ds-nav="none". */
    if (root.getAttribute('data-ds-nav') === 'none') {
      layout.classList.add('ds-layout--no-nav');
    } else {
      layout.appendChild(buildSidenav(activeKey));
    }
    var main = el('main', { class: 'ds-content', id: 'ds-main', tabindex: '-1' });
    layout.appendChild(main);
    main.appendChild(root);
    main.appendChild(buildFooter());

    wireCopyButtons(main);
    wireTabs(main);
    wireToggles(main);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
