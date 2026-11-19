(async function () {
  try {
    const response = await fetch('/content/site.json', { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    const setText = (key, value) => {
      if (typeof value !== 'string') return;
      document.querySelectorAll('[data-content-key="' + key + '"]').forEach(el => { el.textContent = value; });
    };
    setText('heroLead', data.brand?.heroLead);
    setText('heroAccent', data.brand?.heroAccent);
    setText('heroDescription', data.brand?.heroDescription);
    setText('storeAddress', data.brand?.storeAddress);
    setText('storeArea', data.brand?.storeArea);
    setText('aboutDescription', data.brand?.aboutDescription);
    if (data.seo?.title) document.title = data.seo.title;
    if (data.seo?.description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
      meta.content = data.seo.description;
    }
  } catch (error) {
    console.warn('Aura content config could not be loaded:', error);
  }
})();