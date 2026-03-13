import { NATIVE_HOST_NAME } from "@/constants";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_REMINDERS") {
    chrome.runtime
      .sendNativeMessage(NATIVE_HOST_NAME, { action: "getReminders" })
      .then((response) => sendResponse(response))
      .catch((err) => {
        console.error("[notion-cal] Native host error:", err);
        sendResponse({ success: false, error: String(err) });
      });
    return true;
  }
});
