document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("timeInput");
  const status = document.getElementById("status");

  chrome.storage.sync.get("lockDuration", (data) => {
    input.value = data.lockDuration || 10;
  });

  document.getElementById("saveBtn").addEventListener("click", () => {
    const seconds = parseInt(input.value);
    if (!isNaN(seconds) && seconds > 0) {
      chrome.storage.sync.set({ lockDuration: seconds }, () => {
        status.textContent = `Saved ${seconds} seconds`;
        setTimeout(() => (status.textContent = ""), 1500);
      });
    } else {
      status.textContent = "Please enter a valid number";
    }
  });
});
