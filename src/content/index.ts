// Inject the interceptor into the page context so it can override fetch
const script = document.createElement("script");
script.src = chrome.runtime.getURL("content/interceptor.js");
script.type = "module";
(document.head || document.documentElement).appendChild(script);
script.onload = () => script.remove();

// Listen for intercepted events from the page context
window.addEventListener("notion-cal-intercepted", ((event: CustomEvent) => {
  chrome.runtime.sendMessage({
    type: "NOTION_EVENTS_INTERCEPTED",
    payload: event.detail,
  });
}) as EventListener);
