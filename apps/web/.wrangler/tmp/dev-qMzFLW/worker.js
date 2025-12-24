var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.ts
var MIME_TYPES = {
  // Text files
  ".html": "text/html;charset=UTF-8",
  ".css": "text/css;charset=UTF-8",
  ".js": "application/javascript;charset=UTF-8",
  ".mjs": "application/javascript;charset=UTF-8",
  ".json": "application/json;charset=UTF-8",
  ".xml": "application/xml;charset=UTF-8",
  ".txt": "text/plain;charset=UTF-8",
  // Images
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".bmp": "image/bmp",
  // Fonts
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject",
  // Media
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  // Documents
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".tar": "application/x-tar",
  ".gz": "application/gzip"
};
function getMimeType(path) {
  const lowerPath = path.toLowerCase();
  const lastDotIndex = lowerPath.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return null;
  }
  const ext = lowerPath.substring(lastDotIndex);
  return MIME_TYPES[ext] || null;
}
__name(getMimeType, "getMimeType");
var RATE_LIMIT_WINDOW = 60 * 60 * 1e3;
var RATE_LIMIT_MAX_REQUESTS = 5;
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!email || email.length > 254) {
    return false;
  }
  if (email.includes("..")) {
    return false;
  }
  const atCount = (email.match(/@/g) || []).length;
  if (atCount !== 1) {
    return false;
  }
  const localPart = email.split("@")[0];
  if (!localPart || localPart.length === 0 || localPart.length > 64) {
    return false;
  }
  return emailRegex.test(email);
}
__name(isValidEmail, "isValidEmail");
function htmlEncode(input) {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/\//g, "&#x2F;");
}
__name(htmlEncode, "htmlEncode");
function sanitizeString(input, maxLength = 5e3) {
  return input.trim().replace(/[\r\n]/g, " ").slice(0, maxLength).replace(/[<>]/g, "");
}
__name(sanitizeString, "sanitizeString");
function validateContactForm(data) {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request body" };
  }
  const { name, email, message } = data;
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return { valid: false, error: "Name must be at least 2 characters" };
  }
  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return { valid: false, error: "Invalid email address" };
  }
  if (!message || typeof message !== "string" || message.trim().length < 10) {
    return { valid: false, error: "Message must be at least 10 characters" };
  }
  return {
    valid: true,
    data: {
      name: sanitizeString(name, 200),
      email: email.trim().toLowerCase(),
      message: sanitizeString(message, 5e3)
    }
  };
}
__name(validateContactForm, "validateContactForm");
async function checkRateLimit(ip, kv) {
  if (!kv) {
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
  }
  const key = `rate_limit:${ip}`;
  const now = Date.now();
  try {
    const stored = await kv.get(key);
    if (!stored) {
      await kv.put(key, JSON.stringify({ count: 1, resetAt: now + RATE_LIMIT_WINDOW }), {
        expirationTtl: Math.floor(RATE_LIMIT_WINDOW / 1e3)
      });
      return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
    }
    const { count, resetAt } = JSON.parse(stored);
    if (now > resetAt) {
      await kv.put(key, JSON.stringify({ count: 1, resetAt: now + RATE_LIMIT_WINDOW }), {
        expirationTtl: Math.floor(RATE_LIMIT_WINDOW / 1e3)
      });
      return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
    }
    if (count >= RATE_LIMIT_MAX_REQUESTS) {
      return { allowed: false, remaining: 0 };
    }
    await kv.put(key, JSON.stringify({ count: count + 1, resetAt }), {
      expirationTtl: Math.floor((resetAt - now) / 1e3)
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - count - 1 };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
  }
}
__name(checkRateLimit, "checkRateLimit");
function getClientIP(request) {
  const cfIP = request.headers.get("CF-Connecting-IP");
  if (cfIP) return cfIP;
  const xForwardedFor = request.headers.get("X-Forwarded-For");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return "unknown";
}
__name(getClientIP, "getClientIP");
async function sendEmail(data, env) {
  const toEmail = env.CONTACT_EMAIL || "contact@lornu.ai";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "LornuAI Contact Form <noreply@lornu.ai>",
        to: [toEmail],
        replyTo: data.email,
        // data.name is already sanitized in validateContactForm with 200 chars
        // No need to sanitize again, just ensure it's safe for email subject
        subject: `New Contact Form Submission from ${data.name.slice(0, 100)}`,
        html: `
					<h2>New Contact Form Submission</h2>
					<p><strong>Name:</strong> ${htmlEncode(data.name)}</p>
					<p><strong>Email:</strong> ${htmlEncode(data.email)}</p>
					<p><strong>Message:</strong></p>
					<p>${htmlEncode(data.message).replace(/\n/g, "<br>")}</p>
				`,
        text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}

Message:
${data.message}
				`.trim()
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Resend API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      if (response.status === 401) {
        return {
          success: false,
          error: "Authentication failed. Please check RESEND_API_KEY secret."
        };
      }
      if (response.status === 403) {
        return {
          success: false,
          error: "API key lacks permission to send emails. Check API key permissions in Resend dashboard."
        };
      }
      if (response.status === 422) {
        return {
          success: false,
          error: errorData.message || "Invalid email configuration. Check domain verification."
        };
      }
      return {
        success: false,
        error: errorData.message || "Failed to send email. Please try again later."
      };
    }
    const result = await response.json().catch(() => ({}));
    console.log("Email sent successfully:", result);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      error: "Failed to send email. Please try again later."
    };
  }
}
__name(sendEmail, "sendEmail");
var getCORSHeaders = /* @__PURE__ */ __name(() => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}), "getCORSHeaders");
var MAX_REQUEST_SIZE = 10240;
async function handleHealthAPI() {
  return new Response(
    JSON.stringify({ status: "ok" }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
__name(handleHealthAPI, "handleHealthAPI");
async function handleContactAPI(request, env) {
  const corsHeaders = getCORSHeaders();
  const bypassRateHeader = request.headers.get("X-Bypass-Rate-Limit");
  const bypassEmailHeader = request.headers.get("X-Bypass-Email");
  const bypassRateLimit = Boolean(env.RATE_LIMIT_BYPASS_SECRET) && bypassRateHeader === env.RATE_LIMIT_BYPASS_SECRET;
  const bypassEmailSend = Boolean(env.EMAIL_BYPASS_SECRET) && bypassEmailHeader === env.EMAIL_BYPASS_SECRET;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
    return new Response(
      JSON.stringify({ error: "Request body too large (max 10KB)" }),
      {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
  let rateLimit = { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
  if (!bypassRateLimit) {
    const clientIP = getClientIP(request);
    rateLimit = await checkRateLimit(clientIP, env.RATE_LIMIT_KV);
  }
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please try again later."
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": "3600"
          // 1 hour
        }
      }
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const validation = validateContactForm(body);
  if (!validation.valid || !validation.data) {
    return new Response(JSON.stringify({ error: validation.error || "Validation failed" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  let emailResult = { success: true };
  if (!bypassEmailSend) {
    emailResult = await sendEmail(validation.data, env);
  }
  if (!emailResult.success) {
    return new Response(JSON.stringify({ error: emailResult.error || "Failed to send email" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  return new Response(
    JSON.stringify({
      success: true,
      message: "Message sent successfully"
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": rateLimit.remaining.toString()
      }
    }
  );
}
__name(handleContactAPI, "handleContactAPI");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      return handleHealthAPI();
    }
    if (url.pathname === "/api/contact") {
      return handleContactAPI(request, env);
    }
    if (url.pathname === "/_spark/loaded") {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      const segments = url.pathname.split("/").filter(Boolean);
      const lastSegment = segments.length > 0 ? segments[segments.length - 1] : "";
      const hasExtension = lastSegment.includes(".");
      if (!hasExtension && !url.pathname.startsWith("/api/")) {
        const indexResponse = await env.ASSETS.fetch(
          new Request(new URL("/index.html", request.url), {
            method: request.method,
            headers: request.headers
          })
        );
        if (indexResponse.status === 200) {
          const newHeaders = new Headers(indexResponse.headers);
          newHeaders.set("Content-Type", "text/html;charset=UTF-8");
          return new Response(indexResponse.body, {
            status: 200,
            statusText: "OK",
            headers: newHeaders
          });
        }
      }
      return response;
    }
    const contentType = response.headers.get("Content-Type");
    if (!contentType) {
      let mimeType = getMimeType(url.pathname);
      const segments = url.pathname.split("/").filter(Boolean);
      const lastSegment = segments.length > 0 ? segments[segments.length - 1] : "";
      const isExtensionless = lastSegment !== "" && !lastSegment.includes(".");
      if (!mimeType && (url.pathname === "/" || isExtensionless)) {
        mimeType = "text/html;charset=UTF-8";
      }
      if (mimeType) {
        const newHeaders = new Headers(response.headers);
        newHeaders.set("Content-Type", mimeType);
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      }
    }
    return response;
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-96m84F/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-96m84F/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default,
  handleContactAPI,
  handleHealthAPI
};
//# sourceMappingURL=worker.js.map
