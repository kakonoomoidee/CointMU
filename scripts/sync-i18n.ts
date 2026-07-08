import * as fs from "fs";
import * as path from "path";

const LOCALES_DIR = path.join(__dirname, "../src/renderer/src/locales");
const SOURCE_FILE = "en.json";
const TARGET_FILES = ["id.json", "es.json", "zh.json", "ru.json", "de.json"];

/**
 * Recursively diffs an object against a source object to find missing keys.
 * @param source - The source object to check against.
 * @param target - The target object to check for missing keys.
 * @param prefix - The current object path prefix.
 * @returns An array of missing key paths.
 */
function findMissingKeys(source: any, target: any, prefix = ""): string[] {
  let missing: string[] = [];

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;

      if (target[key] === undefined) {
        missing.push(currentPath);
      } else if (typeof source[key] === "object" && source[key] !== null) {
        if (typeof target[key] === "object" && target[key] !== null) {
          missing = missing.concat(
            findMissingKeys(source[key], target[key], currentPath),
          );
        } else {
          missing.push(currentPath);
        }
      }
    }
  }

  return missing;
}

/**
 * Audits all target locale files against the primary english locale.
 * @returns Void.
 */
function auditLocales(): void {
  const sourcePath = path.join(LOCALES_DIR, SOURCE_FILE);

  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`);
    process.exit(1);
  }

  const sourceData = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  console.log(`Starting i18n audit against ${SOURCE_FILE}...`);

  let totalMissing = 0;

  TARGET_FILES.forEach((targetFile) => {
    const targetPath = path.join(LOCALES_DIR, targetFile);

    if (!fs.existsSync(targetPath)) {
      console.warn(`Target file not found: ${targetFile}`);
      return;
    }

    const targetData = JSON.parse(fs.readFileSync(targetPath, "utf8"));
    const missingKeys = findMissingKeys(sourceData, targetData);

    if (missingKeys.length > 0) {
      console.log(`\n[${targetFile}] Missing ${missingKeys.length} keys:`);
      missingKeys.forEach((key) => console.log(`  - ${key}`));
      totalMissing += missingKeys.length;
    } else {
      console.log(`\n[${targetFile}] All keys are synced!`);
    }
  });

  if (totalMissing > 0) {
    console.log(
      `\nAudit complete. Found ${totalMissing} missing translations total.`,
    );
    process.exit(1);
  } else {
    console.log("\nAudit complete. 100% translation coverage!");
    process.exit(0);
  }
}

auditLocales();
