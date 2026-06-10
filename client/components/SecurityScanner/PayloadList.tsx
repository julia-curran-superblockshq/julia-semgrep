import { memo } from "react";
import { Icon } from "@/components/ui/icon";

export const PRESET_PAYLOADS = [
  { payload: "' OR 1=1 --", description: "Classic tautology attack" },
  { payload: "'; DROP TABLE transactions; --", description: "Table drop attempt" },
  { payload: "' UNION SELECT id, description, amount, type, category, date FROM personal_finance.transactions --", description: "UNION injection" },
  { payload: "1; DELETE FROM personal_finance.transactions WHERE 1=1", description: "DELETE injection" },
  { payload: "' OR '1'='1", description: "String tautology bypass" },
  { payload: "admin'--", description: "Comment-based auth bypass" },
  { payload: "' OR EXISTS(SELECT * FROM personal_finance.budgets) --", description: "Cross-table existence check" },
  { payload: "'; INSERT INTO personal_finance.transactions VALUES('hack','hack',0,'hack','hack','2024-01-01'); --", description: "INSERT injection" },
  { payload: "' AND 1=CONVERT(int,(SELECT TOP 1 table_name FROM information_schema.tables))--", description: "Error-based extraction" },
  { payload: "'; WAITFOR DELAY '0:0:5' --", description: "Time-based blind injection" },
];

type PayloadListProps = {
  onRunAll: () => void;
  onRunSingle: (payload: string) => void;
  running: boolean;
  completedPayloads: Set<string>;
};

function PayloadList({ onRunAll, onRunSingle, running, completedPayloads }: PayloadListProps) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-[18px] font-bold text-[#111111] tracking-[-0.03em]">
            Preset Payloads
          </h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">
            {PRESET_PAYLOADS.length} classic SQL injection test vectors
          </p>
        </div>
        <button
          onClick={onRunAll}
          disabled={running}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] text-white text-[14px] font-semibold rounded-[8px] hover:bg-[#6D28D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="play" className="w-4 h-4" />
          Run All
        </button>
      </div>
      <div className="divide-y divide-[#E5E7EB]">
        {PRESET_PAYLOADS.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-3 hover:bg-[#FAFAFA] transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <code className="text-[13px] font-mono text-[#111111] truncate block">
                {item.payload}
              </code>
              <span className="text-[12px] text-[#6B7280]">{item.description}</span>
            </div>
            {completedPayloads.has(item.payload) ? (
              <Icon icon="check-circle" className="w-4 h-4 text-[#059669] shrink-0" />
            ) : (
              <button
                onClick={() => onRunSingle(item.payload)}
                disabled={running}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 text-[12px] font-semibold text-[#7C3AED] border border-[#7C3AED] rounded-[6px] hover:bg-[#EDE9FE] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                Run
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(PayloadList);
