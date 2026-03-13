import { NATIVE_HOST_NAME } from "@/constants";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_REMINDERS") {
    chrome.runtime.sendNativeMessage(
      NATIVE_HOST_NAME,
      { action: "getReminders", daysAhead: message.daysAhead ?? 7 },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("[notion-cal] Native host error:", chrome.runtime.lastError.message);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        sendResponse(response);
      },
    );
    return true; // keep channel open for async response
  }
});
