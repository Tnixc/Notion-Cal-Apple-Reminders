export interface RouteRequest {
  body: unknown;
  method: string;
  headers: Headers;
}

type RouteHandler = (
  url: URL,
  request: RouteRequest,
) => Promise<Response | null>;

interface Route {
  path: string;
  handler: RouteHandler;
}

const routes: Route[] = [];

export function route(path: string, handler: RouteHandler) {
  routes.push({ path, handler });
}

function matchRoute(url: URL): Route | undefined {
  return routes.find((r) => url.pathname === r.path);
}

async function parseBody(raw: BodyInit | null | undefined): Promise<unknown> {
  if (raw == null) return null;

  let text: string;
  if (typeof raw === "string") {
    text = raw;
  } else if (raw instanceof Blob) {
    text = await raw.text();
  } else if (raw instanceof ArrayBuffer || ArrayBuffer.isView(raw)) {
    text = new TextDecoder().decode(raw);
  } else if (raw instanceof ReadableStream) {
    text = await new Response(raw).text();
  } else if (raw instanceof URLSearchParams) {
    return Object.fromEntries(raw.entries());
  } else if (raw instanceof FormData) {
    return Object.fromEntries(raw.entries());
  } else {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

let _originalFetch: typeof fetch;

export function originalFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return _originalFetch.call(window, input, init);
}

export function installRouter() {
  _originalFetch = window.fetch;

  window.fetch = async function (input, init) {
    const raw =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const url = new URL(raw);
    const matched = matchRoute(url);

    if (matched) {
      const request: RouteRequest = {
        body: await parseBody(init?.body),
        method: init?.method ?? "GET",
        headers: new Headers(init?.headers),
      };

      const response = await matched.handler(url, request);
      if (response) {
        console.log(`[notion-cal] HIJACKED ${matched.path}`, request.body);
        return response;
      }
      console.log(
        `[notion-cal] BYPASSED ${matched.path} (condition not met)`,
        request.body,
      );
    }

    return _originalFetch.call(this, input, init);
  };
}
