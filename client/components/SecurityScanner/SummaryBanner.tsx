import { memo } from "react";
import { Icon } from "@/components/ui/icon";
import type { TestResult } from "./TestResultRow";

type SummaryBannerProps = {
  results: TestResult[];
  running: boolean;
};

function SummaryBanner({ results, running }: SummaryBannerProps) {
  if (results.length === 0 && !running) return null;

  const safeCount = results.filter((r) => r.status === "safe").length;
  const errorCount = results.filter((r) => r.status === "error").length;
  const vulnerableCount = results.filter((r) => r.status === "vulnerable").length;
  const totalTests = results.length;
  const allSafe = vulnerableCount === 0 && totalTests > 0;
  const avgDuration =
    totalTests > 0
      ? Math.round(results.reduce((sum, r) => sum + r.durationMs, 0) / totalTests)
      : 0;

  if (running) {
    return (
      <div className="flex items-center gap-3 px-6 py-4 bg-[#EDE9FE] border border-[#7C3AED]/20 rounded-[12px]">
        <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
        <span className="text-[15px] font-semibold text-[#7C3AED]">
          Running security tests...
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between px-6 py-4 rounded-[12px] border ${
        allSafe
          ? "bg-[#059669]/5 border-[#059669]/20"
          : "bg-[#DC2626]/5 border-[#DC2626]/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          icon={allSafe ? "shield-check" : "shield-alert"}
          className={`w-6 h-6 ${allSafe ? "text-[#059669]" : "text-[#DC2626]"}`}
        />
        <div>
          <div
            className={`text-[16px] font-bold ${allSafe ? "text-[#059669]" : "text-[#DC2626]"}`}
          >
            {allSafe
              ? `${totalTests}/${totalTests} tests passed`
              : `${vulnerableCount} vulnerability detected!`}
          </div>
          <div className="text-[13px] text-[#6B7280] mt-0.5">
            {safeCount} safe · {errorCount} errors · {vulnerableCount} vulnerable · avg {avgDuration}ms
          </div>
        </div>
      </div>
      <div
        className={`text-[32px] font-extrabold tracking-[-0.03em] ${
          allSafe ? "text-[#059669]" : "text-[#DC2626]"
        }`}
      >
        {allSafe ? "100%" : `${Math.round((safeCount / totalTests) * 100)}%`}
      </div>
    </div>
  );
}

export default memo(SummaryBanner);
