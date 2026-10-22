// Plain-code money rules. The AI never touches these numbers.

export function formatRupees(n: number): string {
  return "₹" + new Intl.NumberFormat("en-IN").format(n);
}

export type FundingErrors = { estimate?: string; contribution?: string; form?: string };
export type FundingResult =
  | { ok: true; estimate: number; contribution: number; gap: number; progressPct: number }
  | { ok: false; errors: FundingErrors };

function parse(raw: string | number): { ok: true; value: number } | { ok: false; kind: "empty" | "negative" | "invalid" } {
  const s = String(raw ?? "").trim().replace(/[₹,\s]/g, "");
  if (s === "") return { ok: false, kind: "empty" };
  if (/^-\d+(\.\d+)?$/.test(s)) return { ok: false, kind: "negative" };
  if (!/^\d+$/.test(s) || Number(s) > 10_000_000) return { ok: false, kind: "invalid" };
  return { ok: true, value: Number(s) };
}

export function computeFunding(estimateRaw: string | number, contributionRaw: string | number): FundingResult {
  const errors: FundingErrors = {};
  const est = parse(estimateRaw);
  const con = parse(contributionRaw);

  if (!est.ok) {
    errors.estimate = {
      empty: "Enter the clinic's estimate in rupees, for example 8000.",
      negative: "The estimate can't be negative.",
      invalid: "The estimate must be a whole number of rupees, for example 8000.",
    }[est.kind];
  } else if (est.value === 0) {
    errors.estimate = "The estimate must be more than ₹0.";
  }
  // The contribution is optional: empty means ₹0.
  if (!con.ok && con.kind !== "empty") {
    errors.contribution =
      con.kind === "negative"
        ? "The contribution can't be negative."
        : "The contribution must be a whole number of rupees, for example 2000.";
  }
  if (errors.estimate || errors.contribution || !est.ok) return { ok: false, errors };

  const estimate = est.value;
  const contribution = con.ok ? con.value : 0;
  if (estimate <= contribution) {
    return {
      ok: false,
      errors: {
        form:
          estimate < contribution
            ? `The estimate (${formatRupees(estimate)}) is smaller than the contribution (${formatRupees(contribution)}). Please check both numbers.`
            : "The contribution already covers the whole estimate, so there is nothing left to fund.",
      },
    };
  }
  return { ok: true, estimate, contribution, gap: estimate - contribution, progressPct: Math.floor((contribution / estimate) * 100) };
}
