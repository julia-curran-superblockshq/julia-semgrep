import { api, z, bigquery } from "@superblocksteam/sdk-api";

const JULIA_BIGQUERY = "2089585e-cc58-4b5c-9084-610b1705c8ff";

const TestResultSchema = z.object({
  payload: z.string(),
  status: z.enum(["safe", "error", "vulnerable"]),
  message: z.string(),
  rowCount: z.number(),
  durationMs: z.number(),
});

export default api({
  name: "RunInjectionTest",
  description: "Runs a SQL injection payload against BigQuery via parameterized query to verify safety.",

  integrations: {
    bq: bigquery(JULIA_BIGQUERY),
  },

  input: z.object({
    payload: z.string(),
  }),

  output: z.object({
    result: TestResultSchema,
  }),

  async run(ctx, { payload }) {
    const start = Date.now();

    try {
      // This uses parameterized queries — the payload should ALWAYS be treated as a literal string value.
      // If parameterization works correctly, injection payloads will simply match nothing or be treated as data.
      const ResultSchema = z.object({
        id: z.string(),
        description: z.string(),
        amount: z.coerce.number(),
        type: z.string(),
        category: z.string(),
        date: z.any(),
      });

      const rows = await ctx.integrations.bq.query(
        "SELECT id, description, amount, type, category, date FROM personal_finance.transactions WHERE description = ? LIMIT 10",
        ResultSchema,
        [payload],
        { label: `Injection test: ${payload.slice(0, 50)}` }
      );

      const durationMs = Date.now() - start;

      // A parameterized query treats the payload as a literal string value.
      // If a classic injection payload like "' OR 1=1 --" returns rows,
      // it would mean the query is NOT properly parameterized (vulnerable).
      // If it returns 0 rows or just rows matching the exact literal, it's safe.
      const isClassicInjection = /('|--|;|OR\s+1\s*=\s*1|UNION|DROP|DELETE|INSERT|UPDATE)/i.test(payload);

      if (isClassicInjection && rows.length > 0) {
        // Check if results actually match the literal payload or indicate injection success
        const allMatch = rows.every((r) => r.description === payload);
        if (!allMatch) {
          return {
            result: {
              payload,
              status: "vulnerable" as const,
              message: `Query returned ${rows.length} row(s) that don't match the literal payload — possible injection success.`,
              rowCount: rows.length,
              durationMs,
            },
          };
        }
      }

      return {
        result: {
          payload,
          status: "safe" as const,
          message: rows.length === 0
            ? "Payload treated as literal — no matching rows (as expected)."
            : `Payload treated as literal — ${rows.length} row(s) matched the exact string.`,
          rowCount: rows.length,
          durationMs,
        },
      };
    } catch (err: unknown) {
      const durationMs = Date.now() - start;
      const message = err instanceof Error ? err.message : String(err);

      return {
        result: {
          payload,
          status: "error" as const,
          message: `Query rejected with error: ${message}`,
          rowCount: 0,
          durationMs,
        },
      };
    }
  },
});
