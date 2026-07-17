import { CURRENCY_OPTIONS } from "../settings.constants";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import type { SettingsStore } from "./settings-view.component";
import { LanguageSwitcher } from "./language-switcher.component";
import { CustomDropdown } from "@/components";

interface GeneralSettingsProps {
  config: SettingsStore["general"];
  onUpdate: (key: string, value: any) => void;
}

/**
 * General settings pane containing startup behaviors, notifications, and
 * display localization preferences.
 * @param props The configuration state and the update callback.
 * @returns The General Settings form component.
 */
export function GeneralSettings({
  config,
  onUpdate,
}: GeneralSettingsProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-700 mb-6">
        {t("settings.general.subtitle")}
      </h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">
            {t("settings.general.startup")}
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {t("settings.general.launchTitle")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("settings.general.launchDesc")}
                </p>
              </div>
              <button
                onClick={() => onUpdate("launchAtLogin", !config.launchAtLogin)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.launchAtLogin ? "bg-emerald-500" : "bg-slate-200"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.launchAtLogin ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {t("settings.general.backgroundTitle")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("settings.general.backgroundDesc")}
                </p>
              </div>
              <button
                onClick={() =>
                  onUpdate("openInBackground", !config.openInBackground)
                }
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.openInBackground ? "bg-emerald-500" : "bg-slate-200"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.openInBackground ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">
            {t("settings.general.display")}
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <LanguageSwitcher />
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {t("settings.general.currencyTitle")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("settings.general.currencyDesc")}
                </p>
              </div>
              <div className="w-48">
                <CustomDropdown<string>
                  options={CURRENCY_OPTIONS}
                  selected={config.currency}
                  onSelect={(val) => onUpdate("currency", val)}
                  renderSelected={(selected) => selected || "CMU (native)"}
                  renderOption={(option) => option}
                  compact
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
