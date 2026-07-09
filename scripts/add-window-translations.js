const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/renderer/src/locales');
const files = ['en.json', 'id.json', 'es.json', 'zh.json', 'ru.json', 'de.json'];

const translations = {
  en: { minimize: 'Minimize', close: 'Close' },
  id: { minimize: 'Minimalkan', close: 'Tutup' },
  es: { minimize: 'Minimizar', close: 'Cerrar' },
  zh: { minimize: '最小化', close: '关闭' },
  ru: { minimize: 'Свернуть', close: 'Закрыть' },
  de: { minimize: 'Minimieren', close: 'Schließen' }
};

for (const file of files) {
  const filePath = path.join(localesDir, file);
  const lang = file.split('.')[0];
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!data.ui) data.ui = {};
  data.ui.window = translations[lang];

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Updated ${file}`);
}
