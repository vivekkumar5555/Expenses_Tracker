import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../utils/axios";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "../hooks/useTranslation";
import {
  useLanguageCurrency,
  languages,
  currencies,
} from "../contexts/LanguageCurrencyContext";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { toast, showToast, hideToast } = useToast();
  const { t } = useTranslation();
  const { language, currency, setLanguage, setCurrency } =
    useLanguageCurrency();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      setSettings(res.data.settings);
      reset({
        currency: res.data.settings.currency,
        language: res.data.settings.language,
        approvalLimit: res.data.settings.approvalLimit || "",
        theme: res.data.settings.theme,
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      // Clean data - remove empty strings and convert approvalLimit to number
      const cleanedData = {
        currency: data.currency || undefined,
        language: data.language || undefined,
        approvalLimit: data.approvalLimit
          ? parseFloat(data.approvalLimit)
          : undefined,
        theme: data.theme || undefined,
      };
      // Remove undefined values
      Object.keys(cleanedData).forEach(
        (key) => cleanedData[key] === undefined && delete cleanedData[key]
      );

      await api.put("/settings", cleanedData);

      // Sync with context if changed
      if (data.language && data.language !== language) {
        setLanguage(data.language);
      }
      if (data.currency && data.currency !== currency) {
        setCurrency(data.currency);
      }

      showToast(t("settings.settingsSaved"), "success");
      fetchSettings();
    } catch (error) {
      console.error("Failed to save settings:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        t("settings.settingsSaveFailed");
      showToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={hideToast}
          />
        )}
      </AnimatePresence>

      <div className="space-y-4 lg:space-y-6">
        <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
          {t("settings.title")}
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-auto"
        >
          <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">
            {t("settings.userPreferences")}
          </h3>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                {t("settings.currency")}
              </label>
              <div className="relative">
                <select
                  {...register("currency")}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm sm:text-base appearance-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 shadow-sm"
                >
                  {Object.values(currencies).map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                {t("settings.language")}
              </label>
              <div className="relative">
                <select
                  {...register("language")}
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    register("language").onChange(e);
                  }}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm sm:text-base appearance-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 shadow-sm"
                >
                  {Object.values(languages).map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                {t("settings.approvalLimit")}
              </label>
              <input
                type="number"
                step="0.01"
                {...register("approvalLimit", { min: 0 })}
                placeholder="0.00"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm sm:text-base"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("settings.approvalLimitDesc")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                {t("settings.theme")}
              </label>
              <div className="relative">
                <select
                  {...register("theme")}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm sm:text-base appearance-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 shadow-sm"
                >
                  <option value="light">{t("settings.light")}</option>
                  <option value="dark">{t("settings.dark")}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm sm:text-base"
            >
              {saving ? t("common.saving") : t("settings.saveSettings")}
            </button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}
