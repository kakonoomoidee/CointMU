const fs = require('fs');
const path = require('path');

const mapping = {
  // Global @/services
  call: '@/services',
  fetchBlockNumber: '@/services',
  fetchPeerCount: '@/services',
  fetchGasPrice: '@/services',
  fetchMiningStatus: '@/services',
  fetchHashrate: '@/services',
  fetchDifficulty: '@/services',
  fetchSyncingStatus: '@/services',
  fetchBalance: '@/services',
  waitForTransactionReceipt: '@/services',
  setEtherbase: '@/services',
  startMiner: '@/services',
  stopMiner: '@/services',
  CacheService: '@/services',
  checkForUpdates: '@/services',
  downloadUpdate: '@/services',
  installUpdate: '@/services',
  getCpuUsage: '@/services',

  // @/features/wallet
  generateMnemonic: '@/features/wallet',
  deriveAccount: '@/features/wallet',
  deriveAccountFromPrivateKey: '@/features/wallet',
  generateIdenticonGradient: '@/features/wallet',
  encryptSecret: '@/features/wallet',
  decryptSecret: '@/features/wallet',
  verifyPassword: '@/features/wallet',
  revealPrivateKey: '@/features/wallet',
  revealRecoveryPhrase: '@/features/wallet',
  generateKeystore: '@/features/wallet',
  importKeystore: '@/features/wallet',
  DerivedAccount: '@/features/wallet',
  unlockSession: '@/features/wallet',
  getSessionPassword: '@/features/wallet',
  lockSession: '@/features/wallet',

  // @/features/settings
  getSetting: '@/features/settings',
  setSetting: '@/features/settings',
  getAllSettings: '@/features/settings',
  getNetworkInsights: '@/features/settings',
  NetworkInsights: '@/features/settings',
  NetworkInsightBlock: '@/features/settings',

  // @/features/mining
  getMiningConfig: '@/features/mining',
  setMiningEnabled: '@/features/mining',
  toggleMiner: '@/features/mining',
  setThreads: '@/features/mining',
  setPoolAddress: '@/features/mining',
  fetchMiningStats: '@/features/mining',
  subscribeMiningStatus: '@/features/mining',
  subscribeDagProgress: '@/features/mining',
  subscribeMiningLog: '@/features/mining',
  MiningStats: '@/features/mining',
  MiningConfig: '@/features/mining',
  getYearlyActivity: '@/features/mining',
  ActivityContribution: '@/features/mining',

  // @/features/explorer
  detectSearchType: '@/features/explorer',
  getTransactionDetail: '@/features/explorer',
  getAddressSummary: '@/features/explorer',
  SearchType: '@/features/explorer',
  TransactionDetailData: '@/features/explorer',
  AddressSummary: '@/features/explorer',

  // @/features/notifications
  dispatchNotification: '@/features/notifications'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@\/services['"]/g;

  let match;
  let newContent = content;
  let madeChanges = false;

  while ((match = importRegex.exec(content)) !== null) {
    const originalImport = match[0];
    const importsStr = match[1];
    
    const tokens = importsStr.split(',').map(s => s.trim()).filter(s => s);
    
    const grouped = {};
    for (const token of tokens) {
      let identifier = token;
      if (identifier.startsWith('type ')) identifier = identifier.replace('type ', '');
      
      const dest = mapping[identifier] || '@/services';
      if (!grouped[dest]) grouped[dest] = [];
      grouped[dest].push(token);
    }
    
    let replacement = '';
    for (const [dest, items] of Object.entries(grouped)) {
      replacement += `import { ${items.join(', ')} } from '${dest}'\n`;
    }
    
    newContent = newContent.replace(originalImport, replacement.trim());
    madeChanges = true;
  }

  // Also replace relative imports from services/index.ts in the features directory if they exist
  // We can just fix absolute paths mostly, but we should also check for `from '../../services'` etc.
  // Actually, I'll let TS tell me if there are relative imports broken.

  if (madeChanges) {
    fs.writeFileSync(filePath, newContent);
    console.log('Updated', filePath);
  }
}

function walkDir(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walkDir('src/renderer/src');
