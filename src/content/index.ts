// Inject the interceptor into the page context so it can override fetch
const script = document.createElement("script");
script.src = chrome.runtime.getURL("content/interceptor.js");
script.type = "module";
(document.head || document.documentElement).appendChild(script);
script.onload = () => script.remove();

// Bridge: page context requests reminders via CustomEvent, we fetch from background
window.addEventListener("notion-cal-get-reminders", ((event: CustomEvent) => {
  const { daysAhead } = event.detail ?? {};
  chrome.runtime.sendMessage({ type: "GET_REMINDERS", daysAhead }).then((response) => {
    window.dispatchEvent(new CustomEvent("notion-cal-reminders-response", { detail: response }));
  });
}) as EventListener);
