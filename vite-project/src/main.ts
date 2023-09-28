const offerContainer = document.querySelector('.app-offer') as HTMLDivElement;
const continueButton = document.querySelector('.app-continue') as HTMLButtonElement;
const title = document.querySelector(".app-title") as HTMLHeadingElement;
const linkElement = document.querySelector(".app-links") as HTMLDivElement
const supportedLanguages = ['de', 'en', 'es', 'fr', 'ja', 'pt'];

offerContainer.addEventListener('click', function(event: Event) {
  const target = (event.target as HTMLElement).closest('.app-offer__item');

  if (!target) return;
  if (!this.contains(target)) return;

  this.querySelectorAll('.app-offer__item').forEach(item => item.classList.remove('active'));

  target.classList.add('active');
});

continueButton.addEventListener('click', () => {
  const activeItem = offerContainer.querySelector('.app-offer__item.active');

  if (!activeItem) return;

  const url = activeItem.getAttribute('data-url');
  if (url) {
    window.location.href = url;
  }
});


function getLanguage(): string {
  let lang = navigator.language.substring(0, 2);
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');

  if (langParam && supportedLanguages.includes(langParam)) {
    return langParam;
  } else if (!supportedLanguages.includes(lang)) {
    return 'en';
  }
  return lang;
}

function replacePlaceholders(template: string, variables: { [key: string]: string | number }) {
  return template.replace(/{{(\w+)}}/g, (_, key: string) => String(variables[key] || ''));
}

async function fetchTranslations(lang: string) {
  try {
    // in dev u need to use /src/i18n/${lang}.json
    const response = await fetch(`/i18n/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch translations: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

function applyTranslations(translations: { [key: string]: string }) {
  const lang = getLanguage();
  document.querySelectorAll<HTMLElement>('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate') as string;
    const price = element.getAttribute('data-price');
    const translationTemplate = translations[key] || key;
    const variables = { price: price || '' };
    const translation = replacePlaceholders(translationTemplate, variables);

    if (translation) {
      element.innerHTML = translation;
      element.setAttribute('data-lang', lang);
      linkElement.setAttribute('data-lang', lang);
    }
  });
}

async function fetchAndApplyTranslations() {
  const lang = getLanguage();
  const translations = await fetchTranslations(lang);

  if (translations) {
    applyTranslations(translations);
  }
}

fetchAndApplyTranslations();