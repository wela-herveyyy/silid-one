import type {
  FrappeDocResult,
  FrappeLoginSuccess,
  SchoolVersion,
} from "@/lib/entities/frappe.type";

/** Normalizes any school URL (strips `/login...` and trailing slashes). */
export function normalizeFrappeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/login.*$/i, "").replace(/\/+$/, "");
}

/** Builds HTTP headers attaching Frappe's session `sid` cookie (`Cookie: sid=...`). */
export function frappeSidHeaders(sid: string): Record<string, string> {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Cookie: `sid=${sid}`,
  };
}

/** Extracts an authenticated Frappe `sid` cookie value from HTTP `Set-Cookie` headers. */
export function extractSidFromHeaders(headers: Headers): string | null {
  const setCookies =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : [headers.get("set-cookie")].filter((v): v is string => Boolean(v));

  for (const cookie of setCookies) {
    const match = cookie.match(/(?:^|[,\s;])sid=([^;\s,]+)/i);
    if (match?.[1] && match[1] !== "Guest") {
      return decodeURIComponent(match[1]);
    }
  }
  return null;
}

/** Authenticates against a Frappe site (`/api/method/login`) and verifies the user with `sid`. */
export async function frappeHttpLogin(input: {
  baseUrl: string;
  usr: string;
  pwd: string;
  version: SchoolVersion;
}): Promise<FrappeDocResult<FrappeLoginSuccess>> {
  const baseUrl = normalizeFrappeBaseUrl(input.baseUrl);
  if (!baseUrl.startsWith("http")) {
    return { ok: false, error: "Please select a valid school site URL." };
  }

  try {
    const res = await fetch(`${baseUrl}/api/method/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ usr: input.usr.trim(), pwd: input.pwd }).toString(),
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });

    const sid = extractSidFromHeaders(res.headers);
    const text = await res.text();
    let parsed: { full_name?: string; message?: string } | null = null;
    try {
      parsed = text.trim() ? (JSON.parse(text) as { full_name?: string; message?: string }) : null;
    } catch {
      parsed = null;
    }

    if (!res.ok || !sid) {
      return {
        ok: false,
        error: parsed?.message || "Invalid school credentials.",
      };
    }

    const whoRes = await fetch(`${baseUrl}/api/method/frappe.auth.get_logged_user`, {
      headers: {
        Accept: "application/json",
        Cookie: `sid=${sid}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    const whoJson = whoRes.ok ? ((await whoRes.json()) as { message?: string }) : null;
    const email = whoJson?.message && whoJson.message !== "Guest" ? whoJson.message : input.usr.trim();

    return {
      ok: true,
      data: {
        sid,
        email,
        fullName: parsed?.full_name || email,
        baseUrl,
        version: input.version,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to connect to school Frappe server.",
    };
  }
}

/** Fetches a Frappe DocType list over HTTP using `Cookie: sid=${sid}`. */
export async function frappeHttpGetList<T = Record<string, unknown>>(input: {
  baseUrl: string;
  sid: string;
  doctype: string;
  fields?: string[];
  filters?: unknown;
  limitPageLength?: number;
}): Promise<FrappeDocResult<T[]>> {
  const baseUrl = normalizeFrappeBaseUrl(input.baseUrl);
  if (!baseUrl || !input.sid) {
    return { ok: false, error: "School URL and session sid are required." };
  }

  try {
    const res = await fetch(`${baseUrl}/api/method/frappe.client.get_list`, {
      method: "POST",
      headers: frappeSidHeaders(input.sid),
      body: JSON.stringify({
        doctype: input.doctype,
        fields: input.fields ?? ["*"],
        filters: input.filters ?? undefined,
        limit_page_length: input.limitPageLength ?? 50,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (res.ok) {
      const json = (await res.json()) as { message?: T[] };
      return { ok: true, data: Array.isArray(json.message) ? json.message : [] };
    }

    const qs = new URLSearchParams();
    if (input.fields?.length) qs.set("fields", JSON.stringify(input.fields));
    if (input.filters) qs.set("filters", JSON.stringify(input.filters));
    qs.set("limit_page_length", String(input.limitPageLength ?? 50));

    const resourceRes = await fetch(
      `${baseUrl}/api/resource/${encodeURIComponent(input.doctype)}?${qs.toString()}`,
      {
        headers: {
          Accept: "application/json",
          Cookie: `sid=${input.sid}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (!resourceRes.ok) {
      return { ok: false, error: `Frappe ${input.doctype} list failed (${resourceRes.status})` };
    }

    const resourceJson = (await resourceRes.json()) as { data?: T[] };
    return { ok: true, data: Array.isArray(resourceJson.data) ? resourceJson.data : [] };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Frappe DocType list request failed.",
    };
  }
}

/** Fetches a single Frappe document (`frappe.client.get` / `/api/resource`) using `Cookie: sid=${sid}`. */
export async function frappeHttpGetDocument<T = Record<string, unknown>>(input: {
  baseUrl: string;
  sid: string;
  doctype: string;
  name: string;
}): Promise<FrappeDocResult<T>> {
  const baseUrl = normalizeFrappeBaseUrl(input.baseUrl);
  if (!baseUrl || !input.sid) {
    return { ok: false, error: "School URL and session sid are required." };
  }

  try {
    const res = await fetch(`${baseUrl}/api/method/frappe.client.get`, {
      method: "POST",
      headers: frappeSidHeaders(input.sid),
      body: JSON.stringify({
        doctype: input.doctype,
        name: input.name,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (res.ok) {
      const json = (await res.json()) as { message?: T };
      if (json.message) return { ok: true, data: json.message };
    }

    const resourceRes = await fetch(
      `${baseUrl}/api/resource/${encodeURIComponent(input.doctype)}/${encodeURIComponent(input.name)}`,
      {
        headers: {
          Accept: "application/json",
          Cookie: `sid=${input.sid}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (!resourceRes.ok) {
      return { ok: false, error: `Frappe get document failed (${resourceRes.status})` };
    }

    const resourceJson = (await resourceRes.json()) as { data?: T };
    if (!resourceJson.data) {
      return { ok: false, error: "Empty document returned from Frappe." };
    }
    return { ok: true, data: resourceJson.data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Frappe get document request failed.",
    };
  }
}
