import { LOG_LEVELS } from "../config/settings.constants";
import { useEffect, useState, type JSX } from "react";
import { useTranslation } from "react-i18next";
import { useAdvancedStore } from "../model/advanced.store";
import { CustomDropdown } from "@/shared/ui";
import { purgeSecondaryAccounts } from "@/features/wallet";

/**
 * Formats a byte count into a compact human-readable size string.
 * @param {number} bytes - The number of bytes to format.
 * @returns {string} The formatted size (for example '4.82 GB').
 */
function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`;
}

/**
 * Advanced settings pane. Self-contained: developer/RPC preferences come from
 * the advanced store, and the storage section reads the live datadir and chain
 * database size from the main process via IPC.
 * @returns The Advanced Settings form component.
 */
export function AdvancedSettings(): JSX.Element {
  const { t } = useTranslation();
  const settings = useAdvancedStore((s) => s.settings);
  const storage = useAdvancedStore((s) => s.storage);
  const updateSettings = useAdvancedStore((s) => s.updateSettings);
  const fetchStorageInfo = useAdvancedStore((s) => s.fetchStorageInfo);

  const [corsDraft, setCorsDraft] = useState(settings.corsOrigins);

  useEffect(() => {
    void fetchStorageInfo();
  }, [fetchStorageInfo]);

  useEffect(() => {
    setCorsDraft(settings.corsOrigins);
  }, [settings.corsOrigins]);

  const handleCorsBlur = (): void => {
    if (corsDraft !== settings.corsOrigins) {
      updateSettings({ corsOrigins: corsDraft });
    }
  };

  const handlePurge = async (): Promise<void> => {
    if (window.confirm(t("settings.advanced.purgeWalletsConfirm"))) {
      await purgeSecondaryAccounts();
      alert(t("settings.advanced.purgeSuccess"));
    }
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-700 mb-6">
        {t("settings.advanced.subtitle")}
      </h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">
            {t("settings.advanced.rpcNetwork")}
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {t("settings.advanced.httpRpcTitle")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("settings.advanced.httpRpcDesc")}
                </p>
              </div>
              <button
                onClick={() => updateSettings({ httpRpc: !settings.httpRpc })}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${settings.httpRpc ? "bg-emerald-500" : "bg-slate-200"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${settings.httpRpc ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {t("settings.advanced.wsRpcTitle")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("settings.advanced.wsRpcDesc")}
                </p>
              </div>
              <button
                onClick={() => updateSettings({ wsRpc: !settings.wsRpc })}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${settings.wsRpc ? "bg-emerald-500" : "bg-slate-200"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${settings.wsRpc ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {t("settings.advanced.corsTitle")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("settings.advanced.corsDesc")}
                </p>
              </div>
              <div className="w-64">
                <input
                  type="text"
                  value={corsDraft}
                  onChange={(e) => setCorsDraft(e.target.value)}
                  onBlur={handleCorsBlur}
                  placeholder="https://*.cointmu.net"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">
            {t("settings.advanced.storage")}
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between gap-4 p-4 bg-slate-50/50">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">
                  {t("settings.advanced.datadirTitle")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("settings.advanced.datadirDesc")}
                </p>
              </div>
              <span
                className="text-sm font-bold font-mono text-slate-700 truncate max-w-[16rem]"
                title={storage.datadir}
              >
                {storage.datadir || t("settings.advanced.loading")}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50/50">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {t("settings.advanced.dbSizeTitle")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("settings.advanced.dbSizeDesc")}
                </p>
              </div>
              <span className="text-sm font-bold font-mono text-slate-700">
                {formatBytes(storage.dbSize)}
              </span>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {t("settings.advanced.openDataTitle")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("settings.advanced.openDataDesc")}
                </p>
              </div>
              <button
                onClick={() => void window.api.openDataFolder()}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                {t("settings.advanced.revealBtn")}
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">
            {t("settings.advanced.diagnostics")}
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {t("settings.advanced.logLevelTitle")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("settings.advanced.logLevelDesc")}
                </p>
              </div>
              <div className="w-48">
                <CustomDropdown<string>
                  options={LOG_LEVELS}
                  selected={settings.logLevel}
                  onSelect={(val) => updateSettings({ logLevel: val })}
                  renderSelected={(selected) => selected || "Info"}
                  renderOption={(option) => option}
                  compact
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {t("settings.advanced.analyticsTitle")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("settings.advanced.analyticsDesc")}
                </p>
              </div>
              <button
                onClick={() =>
                  updateSettings({ analytics: !settings.analytics })
                }
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${settings.analytics ? "bg-emerald-500" : "bg-slate-200"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${settings.analytics ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-red-500 mb-3">
            Danger Zone
          </h3>
          <div className="bg-white border border-red-100 rounded-xl shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-red-600">
                  {t("settings.advanced.purgeWalletsBtn")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("settings.advanced.purgeWalletsConfirm")}
                </p>
              </div>
              <button
                onClick={() => void handlePurge()}
                className="px-4 py-2 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg text-xs font-bold text-red-700 shadow-sm transition-colors"
              >
                {t("settings.advanced.purgeWalletsBtn")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
