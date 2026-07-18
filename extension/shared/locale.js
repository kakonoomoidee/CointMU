"use strict";

/**
 * Flattens a nested object into a single level object with dot-notation keys.
 * @param {Object} obj - The object to flatten.
 * @param {string} [prefix=''] - The prefix for the current level.
 * @returns {Object} The flattened object.
 */
export function flattenObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (
      typeof obj[k] === "object" &&
      obj[k] !== null &&
      !Array.isArray(obj[k])
    ) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}

/**
 * Loads the English translation JSON file and flattens it for UI consumption.
 * Simultaneously updates all DOM elements with matching IDs.
 * @returns {Promise<Object>} The flattened translations object.
 */
export async function loadTranslations() {
  try {
    const response = await fetch("../locales/en.json");
    if (!response.ok) throw new Error("Failed to load translations");
    const json = await response.json();
    const translations = flattenObject(json);

    document.querySelectorAll("[id]").forEach((el) => {
      if (translations[el.id]) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = translations[el.id];
        } else {
          el.textContent = translations[el.id];
        }
      }
    });
    return translations;
  } catch (err) {
    console.error("Error loading translations:", err);
    return {};
  }
}
