const DEFAULT_COLOR = "#9fc6e7";

interface ListColors {
  [listName: string]: string;
}

async function loadLists() {
  const container = document.getElementById("lists")!;
  const status = document.getElementById("status")!;

  // Fetch reminder lists from native host via background
  const response: { success: boolean; reminders?: { list: string }[]; error?: string } =
    await chrome.runtime.sendMessage({ type: "GET_REMINDERS" });

  if (!response?.success || !response.reminders) {
    container.innerHTML = `<p class="loading">Could not load lists: ${response?.error ?? "unknown error"}</p>`;
    return;
  }

  const listNames = [...new Set(response.reminders.map((r) => r.list))].sort();

  // Load saved colors
  const stored = await chrome.storage.local.get("listColors");
  const colors: ListColors = stored.listColors ?? {};

  container.innerHTML = "";

  for (const name of listNames) {
    const row = document.createElement("div");
    row.className = "list-row";

    const label = document.createElement("span");
    label.className = "list-name";
    label.textContent = name;

    const picker = document.createElement("input");
    picker.type = "color";
    picker.value = colors[name] ?? DEFAULT_COLOR;
    picker.addEventListener("input", () => {
      colors[name] = picker.value;
      save(colors, status);
    });

    row.appendChild(label);
    row.appendChild(picker);
    container.appendChild(row);
  }

  if (listNames.length === 0) {
    container.innerHTML = `<p class="loading">No reminder lists found.</p>`;
  }
}

let saveTimeout: ReturnType<typeof setTimeout>;

function save(colors: ListColors, status: HTMLElement) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    await chrome.storage.local.set({ listColors: colors });
    status.textContent = "Saved";
    setTimeout(() => (status.textContent = ""), 1500);
  }, 300);
}

loadLists();
