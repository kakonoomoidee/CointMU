const fs = require('fs');
const path = require('path');

const customIcons = {
  'MiningIcon': '@/features/mining/components/mining-icon.component',
  'ReceiveIcon': '@/features/wallet/components/receive-icon.component',
  'SendIcon': '@/features/wallet/components/send-icon.component',
  'ContractIcon': '@/features/wallet/components/contract-icon.component'
};

const lucideMappings = {
  'IconEyeSlash': 'EyeOff',
  'IconRefresh': 'RefreshCw',
  'IconBolt': 'Zap'
};

function getLucideName(iconName) {
  if (lucideMappings[iconName]) return lucideMappings[iconName];
  // IconBell -> Bell
  if (iconName.startsWith('Icon')) {
    return iconName.substring(4);
  }
  return iconName;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let madeChanges = false;
  
  // 1. Find imports from '@/assets/icons'
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@\/assets\/icons['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const originalImport = match[0];
    const importsStr = match[1];
    
    const tokens = importsStr.split(',').map(s => s.trim()).filter(s => s);
    
    let replacement = '';
    const lucideTokens = [];
    
    for (const token of tokens) {
      if (customIcons[token]) {
        replacement += `import { ${token} } from '${customIcons[token]}'\n`;
      } else {
        const newName = getLucideName(token);
        lucideTokens.push(newName);
        // Replace JSX tags in the entire file
        const openTagRegex = new RegExp(`<${token}\\b`, 'g');
        const closeTagRegex = new RegExp(`</${token}>`, 'g');
        newContent = newContent.replace(openTagRegex, `<${newName}`);
        newContent = newContent.replace(closeTagRegex, `</${newName}>`);
      }
    }
    
    if (lucideTokens.length > 0) {
      replacement += `import { ${lucideTokens.join(', ')} } from 'lucide-react'\n`;
    }
    
    // Also we need to replace the original import in newContent
    // But since we are modifying newContent in the loop, we should do string replacement carefully
    // Since originalImport is static, we can just replace it
    newContent = newContent.replace(originalImport, replacement.trim());
    madeChanges = true;
  }

  // Fallback for any missed `<IconX` tags if they were imported differently?
  // Our codebase uses absolute `@/assets/icons` mostly, but let's be thorough if there are relative imports
  const relativeImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]\.\.?\/[^'"]*icons['"]/g;
  while ((match = relativeImportRegex.exec(content)) !== null) {
    const originalImport = match[0];
    const importsStr = match[1];
    
    const tokens = importsStr.split(',').map(s => s.trim()).filter(s => s);
    
    let replacement = '';
    const lucideTokens = [];
    
    for (const token of tokens) {
      if (customIcons[token]) {
        replacement += `import { ${token} } from '${customIcons[token]}'\n`;
      } else {
        const newName = getLucideName(token);
        lucideTokens.push(newName);
        const openTagRegex = new RegExp(`<${token}\\b`, 'g');
        const closeTagRegex = new RegExp(`</${token}>`, 'g');
        newContent = newContent.replace(openTagRegex, `<${newName}`);
        newContent = newContent.replace(closeTagRegex, `</${newName}>`);
      }
    }
    
    if (lucideTokens.length > 0) {
      replacement += `import { ${lucideTokens.join(', ')} } from 'lucide-react'\n`;
    }
    newContent = newContent.replace(originalImport, replacement.trim());
    madeChanges = true;
  }


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
