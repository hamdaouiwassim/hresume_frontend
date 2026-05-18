import { useContext, useMemo, useState } from "react";
import { Wand2, Loader2, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { enhanceText } from "../services/aiService";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import UpgradeProModal from "./UpgradeProModal";
import AiLoadingSkeleton from "./AiLoadingSkeleton";

export default function EnhanceTextareaButton({
  value,
  onEnhanced,
  context = "resume",
  disabled = false,
  upgradePath = "/pricing",
}) {
  const { user, setUser } = useContext(AuthContext);
  const { language } = useLanguage();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeVariant, setUpgradeVariant] = useState("default");
  const [originalText, setOriginalText] = useState("");
  const [enhancedText, setEnhancedText] = useState("");
  const enhanceLabel = language === "fr" ? "Ameliorer avec IA" : "Enhance with IA";
  const enhancingLabel = language === "fr" ? "Amelioration..." : "Enhancing...";
  const proTooltip =
    language === "fr"
      ? "Credits IA gratuits epuises — passez a Pro pour l'illimite"
      : "Free AI credits used — upgrade to Pro for unlimited";

  const { unlimited, canEnhance } = useMemo(() => {
    const u = Boolean(user?.is_admin || user?.is_pro);
    const q = user?.ai_quota;
    if (u) {
      return { unlimited: true, canEnhance: true };
    }
    if (!q || q.legacy) {
      return { unlimited: false, canEnhance: false };
    }
    return {
      unlimited: false,
      canEnhance: (q.enhance?.remaining ?? 0) > 0,
    };
  }, [user]);

  const handleEnhance = async () => {
    if (!unlimited && !canEnhance) {
      setUpgradeVariant("quota");
      setShowUpgradeModal(true);
      return;
    }

    if (!value?.trim()) {
      toast.error("Please write some text before using AI enhancement.");
      return;
    }

    setIsEnhancing(true);
    try {
      const inputText = value.trim();
      const response = await enhanceText({
        text: inputText,
        context,
      });

      if (response.data?.ai_quota) {
        setUser((prev) => (prev ? { ...prev, ai_quota: response.data.ai_quota } : prev));
      }

      const enhanced = response.data?.data?.enhanced_text;
      if (!enhanced) {
        toast.error("Unable to enhance text right now.");
        return;
      }

      setOriginalText(inputText);
      setEnhancedText(enhanced);
      toast.success(
        language === "fr"
          ? "Version amelioree prete. Verifiez puis appliquez."
          : "Enhanced version ready. Review and apply."
      );
    } catch (error) {
      const code = error.response?.data?.code;
      if (code === "AI_QUOTA_EXCEEDED") {
        if (error.response?.data?.ai_quota) {
          setUser((prev) => (prev ? { ...prev, ai_quota: error.response.data.ai_quota } : prev));
        }
        setUpgradeVariant("quota");
        setShowUpgradeModal(true);
        toast.error(
          error.response?.data?.message ||
            (language === "fr"
              ? "Credits IA gratuits epuises pour ce mois."
              : "Free AI credits exhausted for this month.")
        );
      } else {
        toast.error(error.response?.data?.message || "Unable to enhance text right now.");
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  const applyEnhancement = () => {
    if (!enhancedText) return;
    onEnhanced(enhancedText);
    setEnhancedText("");
    setOriginalText("");
    toast.success(language === "fr" ? "Texte ameliore applique." : "Enhanced text applied.");
  };

  const dismissEnhancement = () => {
    setEnhancedText("");
    setOriginalText("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleEnhance}
          disabled={disabled || isEnhancing}
          title={!unlimited && !canEnhance ? proTooltip : undefined}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold border border-violet-300 bg-violet-100 text-violet-800 shadow-[0_0_0_0_rgba(139,92,246,0)] hover:bg-violet-200 hover:shadow-[0_0_22px_rgba(139,92,246,0.45)] focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEnhancing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{enhancingLabel}</span>
            </>
          ) : (
            <>
              <Wand2 className="h-3.5 w-3.5" />
              <span>{enhanceLabel}</span>
            </>
          )}
        </button>
        {!unlimited && user?.ai_quota && !user.ai_quota.legacy && (
          <span className="text-[10px] font-medium text-slate-500">
            {language === "fr" ? "Gratuit" : "Free"}: {user.ai_quota.enhance?.remaining ?? 0}/{user.ai_quota.enhance?.limit ?? "—"}
          </span>
        )}
        <UpgradeProModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            setUpgradeVariant("default");
          }}
          upgradePath={upgradePath}
          variant={upgradeVariant}
        />
      </div>

      {isEnhancing && <AiLoadingSkeleton rows={5} className="mt-1" />}

      {enhancedText && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
            {language === "fr" ? "Apercu IA" : "AI Enhancement Preview"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold text-slate-500 mb-2">
                {language === "fr" ? "Avant" : "Before"}
              </p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{originalText}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-2">
                {language === "fr" ? "Apres" : "After"}
              </p>
              <p className="text-sm text-emerald-900 whitespace-pre-wrap">{enhancedText}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={dismissEnhancement}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {language === "fr" ? "Ignorer" : "Dismiss"}
            </button>
            <button
              type="button"
              onClick={applyEnhancement}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-200"
            >
              <Check className="h-3.5 w-3.5" />
              {language === "fr" ? "Appliquer" : "Apply enhancement"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
