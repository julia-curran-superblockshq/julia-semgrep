import { memo, useState } from "react";
import { Icon } from "@/components/ui/icon";

export type TestResult = {
  payload: string;
  status: "safe" | "error" | "vulnerable";
  message: string;
  rowCount: number;
  durationMs: number;
};

type TestResultRowProps = {
  result: TestResult;
  index: number;
};

const statusConfig = {
  safe: {
    bg: "bg-[#059669]/10",
    text: "text-[#059669]",
    border: "border-[#059669]/30",
    label: "SAFE",
    icon: "shield-check" as const,
  },
  error: {
    bg: "bg-[#D97706]/10",
    text: "text-[#D97706]",
    border: "border-[#D97706]/30",
    label: "ERROR",
    icon: "alert-triangle" as const,
  },
  vulnerable: {
    bg: "bg-[#DC2626]/10",
    text: "text-[#DC2626]",
    border: "border-[#DC2626]/30",
    label: "VULNERABLE",
    icon: "shield-alert" as const,
  },
};

function TestResultRow({ result, index }: TestResultRowProps) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[result.status];

  return (
    <div
      className={`border rounded-[8px] overflow-hidden transition-all duration-150 ${config.border}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-[#FAFAFA] transition-colors"
      >
        <span className="text-[13px] font-semibold text-[#6B7280] w-6 shrink-0">
          #{index + 1}
        </span>
        <code className="flex-1 text-[14px] text-[#111111] font-medium truncate font-mono">
          {result.payload}
        </code>
        <span className="text-[12px] text-[#6B7280] tabular-nums shrink-0">
          {result.durationMs}ms
        </span>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-semibold uppercase tracking-[0.05em] ${config.bg} ${config.text}`}
        >
          <Icon icon={config.icon} className="w-3.5 h-3.5" />
          {config.label}
        </span>
        <Icon
          icon="chevron-down"
          className={`w-4 h-4 text-[#6B7280] transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-5 pb-4 pt-1 border-t border-[#E5E7EB]">
          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <div>
              <span className="text-[#6B7280] font-medium uppercase text-[11px] tracking-[0.05em]">
                Payload
              </span>
              <pre className="mt-1 p-3 bg-[#FAFAFA] rounded-[8px] border border-[#E5E7EB] text-[#111111] font-mono text-[12px] whitespace-pre-wrap break-all">
                {result.payload}
              </pre>
            </div>
            <div>
              <span className="text-[#6B7280] font-medium uppercase text-[11px] tracking-[0.05em]">
                Query Template
              </span>
              <pre className="mt-1 p-3 bg-[#FAFAFA] rounded-[8px] border border-[#E5E7EB] text-[#111111] font-mono text-[12px] whitespace-pre-wrap">
                {`SELECT ... FROM personal_finance.transactions\nWHERE description = ?\nLIMIT 10\n\n-- Parameter: "${result.payload}"`}
              </pre>
            </div>
          </div>
          <div className="mt-3 text-[13px] text-[#374151]">
            <span className="font-semibold">Result:</span> {result.message}
          </div>
          <div className="mt-1 text-[12px] text-[#6B7280]">
            Rows returned: {result.rowCount} | Duration: {result.durationMs}ms
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(TestResultRow);
