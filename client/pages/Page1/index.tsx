import { useState, useCallback, useRef } from "react";
import { useApi } from "@/hooks/useApi.js";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import SummaryBanner from "@/components/SecurityScanner/SummaryBanner";
import PayloadList, { PRESET_PAYLOADS } from "@/components/SecurityScanner/PayloadList";
import TestResultRow from "@/components/SecurityScanner/TestResultRow";
import type { TestResult } from "@/components/SecurityScanner/TestResultRow";

export default function Page1Component() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [customPayload, setCustomPayload] = useState("");
  const [completedPayloads, setCompletedPayloads] = useState<Set<string>>(new Set());
  const abortRef = useRef(false);

  const { run: runTest } = useApi("RunInjectionTest");

  const executeSingleTest = useCallback(
    async (payload: string) => {
      try {
        const response = await runTest({ payload });
        if (response?.result) {
          setResults((prev) => [...prev, response.result]);
          setCompletedPayloads((prev) => new Set([...prev, payload]));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setResults((prev) => [
          ...prev,
          {
            payload,
            status: "error" as const,
            message: `Client error: ${message}`,
            rowCount: 0,
            durationMs: 0,
          },
        ]);
      }
    },
    [runTest]
  );

  const handleRunAll = useCallback(async () => {
    setRunning(true);
    setResults([]);
    setCompletedPayloads(new Set());
    abortRef.current = false;

    for (const item of PRESET_PAYLOADS) {
      if (abortRef.current) break;
      await executeSingleTest(item.payload);
    }

    setRunning(false);
  }, [executeSingleTest]);

  const handleRunSingle = useCallback(
    async (payload: string) => {
      setRunning(true);
      await executeSingleTest(payload);
      setRunning(false);
    },
    [executeSingleTest]
  );

  const handleRunCustom = useCallback(async () => {
    if (!customPayload.trim()) return;
    setRunning(true);
    await executeSingleTest(customPayload.trim());
    setRunning(false);
    setCustomPayload("");
  }, [customPayload, executeSingleTest]);

  const handleClear = useCallback(() => {
    abortRef.current = true;
    setResults([]);
    setCompletedPayloads(new Set());
    setRunning(false);
  }, []);

  return (
    <div className="min-h-svh overflow-auto bg-[#FAFAFA]">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 bg-[#7C3AED] rounded-[8px]">
                <Icon icon="shield" className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-[32px] font-extrabold text-[#111111] tracking-[-0.03em]">
                SQL Injection Scanner
              </h1>
            </div>
            <p className="text-[15px] text-[#6B7280] ml-[52px]">
              Test parameterized queries against BigQuery to verify injection safety
            </p>
          </div>
          {results.length > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-[#6B7280] border border-[#E5E7EB] rounded-[8px] hover:bg-white hover:text-[#111111] transition-colors"
            >
              <Icon icon="trash-2" className="w-4 h-4" />
              Clear Results
            </button>
          )}
        </div>

        {/* Summary Banner */}
        <div className="mb-6">
          <SummaryBanner results={results} running={running} />
        </div>

        {/* Custom Payload Input */}
        <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] px-6 py-4 mb-6">
          <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.05em]">
            Custom Payload
          </label>
          <div className="flex items-center gap-3 mt-2">
            <Input
              value={customPayload}
              onChange={(e) => setCustomPayload(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRunCustom()}
              placeholder="Enter a custom SQL injection payload to test..."
              className="flex-1 font-mono text-[14px] border-[1.5px] border-[#D1D5DB] rounded-[8px] px-3.5 py-2.5 focus:border-[#7C3AED] focus:ring-[3px] focus:ring-[#EDE9FE]"
              disabled={running}
            />
            <button
              onClick={handleRunCustom}
              disabled={running || !customPayload.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] text-white text-[14px] font-semibold rounded-[8px] hover:bg-[#6D28D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Icon icon="zap" className="w-4 h-4" />
              Test
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preset Payloads */}
          <PayloadList
            onRunAll={handleRunAll}
            onRunSingle={handleRunSingle}
            running={running}
            completedPayloads={completedPayloads}
          />

          {/* Results */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[18px] font-bold text-[#111111] tracking-[-0.03em]">
                Results
              </h2>
              <span className="text-[13px] text-[#6B7280]">
                {results.length} test{results.length !== 1 ? "s" : ""} completed
              </span>
            </div>
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[12px] border border-[#E5E7EB]">
                <Icon icon="shield-question" className="w-10 h-10 text-[#D1D5DB] mb-3" />
                <p className="text-[15px] font-medium text-[#6B7280]">No tests run yet</p>
                <p className="text-[13px] text-[#9CA3AF] mt-1">
                  Run preset payloads or enter a custom one
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {results.map((result, i) => (
                  <TestResultRow key={`${result.payload}-${i}`} result={result} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
