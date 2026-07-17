import { type JSX } from "react";
import { useTranslation } from "react-i18next";
import { useConnectedSitesStore } from "../model/connected-sites.store";
import { Globe, Link, Box } from "lucide-react";

/**
 * Settings view panel that displays the list of whitelisted dApp origins.
 * Allows the user to view currently connected sites and manually revoke
 * their access. Revoking a site removes it from the connectedSites store,
 * meaning any future JSON-RPC requests from that origin will either prompt
 * the approval modal (for connection requests) or be automatically rejected
 * as unauthorized.
 * @returns {JSX.Element} The rendered settings panel component.
 */
function ConnectedSitesSettings(): JSX.Element {
  const { t } = useTranslation();
  const connectedSites = useConnectedSitesStore((s) => s.connectedSites);
  const isExtensionLinked = useConnectedSitesStore((s) => s.isExtensionLinked);
  const removeConnectedSite = useConnectedSitesStore(
    (s) => s.removeConnectedSite,
  );
  const setExtensionLinked = useConnectedSitesStore(
    (s) => s.setExtensionLinked,
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          {t("settings.connectedSites.title")}
        </h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          {t("settings.connectedSites.description")}
        </p>
      </div>

      {/* Extension Status Banner */}
      <div
        className={`flex items-center justify-between p-4 border rounded-2xl shadow-sm ${isExtensionLinked ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"}`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isExtensionLinked ? "bg-green-100 border border-green-200" : "bg-slate-200 border border-slate-300"}`}
          >
            <Box
              width={20}
              height={20}
              className={
                isExtensionLinked ? "text-green-600" : "text-slate-500"
              }
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800">
                {t("settings.connectedSites.extensionStatusTitle")}
              </h3>
              <div
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 ${isExtensionLinked ? "bg-green-100 text-green-700 border border-green-200" : "bg-slate-200 text-slate-600 border border-slate-300"}`}
              >
                {isExtensionLinked ? (
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                )}
                {isExtensionLinked
                  ? t("settings.connectedSites.statusConnected")
                  : t("settings.connectedSites.statusDisconnected")}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isExtensionLinked
                ? t("settings.connectedSites.statusConnectedDesc")
                : t("settings.connectedSites.statusDisconnectedDesc")}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {connectedSites.length === 0 && !isExtensionLinked ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <Link width={24} height={24} className="text-slate-300" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">
              {t("settings.connectedSites.emptyTitle")}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-[250px]">
              {t("settings.connectedSites.emptyDesc")}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {isExtensionLinked && (
              <li className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Box width={20} height={20} className="text-indigo-500" />
                  </div>
                  <div className="overflow-hidden">
                    <p
                      className="text-sm font-semibold text-slate-800 truncate"
                      title="CointMU Extension"
                    >
                      {t("settings.connectedSites.extensionName")}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t("settings.connectedSites.extensionDesc")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg flex-shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                    Active
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.api.extension.unlink();
                      setExtensionLinked(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 rounded-lg transition-colors flex-shrink-0"
                  >
                    {t("settings.connectedSites.revoke")}
                  </button>
                </div>
              </li>
            )}

            {connectedSites.map((site) => (
              <li
                key={site.origin}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <Globe width={20} height={20} className="text-blue-500" />
                  </div>
                  <div className="overflow-hidden">
                    <p
                      className="text-sm font-semibold text-slate-800 truncate"
                      title={site.origin}
                    >
                      {site.origin}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {site.connectedAt
                        ? t("settings.connectedSites.connectedOn", {
                            date: new Intl.DateTimeFormat("en-US", {
                              dateStyle: "medium",
                            }).format(new Date(site.connectedAt)),
                          })
                        : t("settings.connectedSites.accessGranted")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.api.dapp.revokeSite(site.origin);
                    removeConnectedSite(site.origin);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 rounded-lg transition-colors ml-4 flex-shrink-0"
                >
                  {t("settings.connectedSites.revoke")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export { ConnectedSitesSettings };
