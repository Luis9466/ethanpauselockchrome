(function () {
  let lockActive = false;

  function blockPause(video, lockDuration) {
    if (lockActive) return;

    lockActive = true;
    console.log("Play detected. Locking pause for", lockDuration, "seconds.");

    // Block pause attempts by overriding pause()
    const originalPause = video.pause;
    video.pause = function () {
      console.log("Pause attempt blocked during lock.");
      return;
    };

    // Block keyboard shortcuts (Space / K)
    const keydownHandler = (e) => {
      const isPauseKey = e.code === "Space" || e.key.toLowerCase() === "k";
      if (isPauseKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log("Keyboard pause shortcut blocked:", e.key);
      }
    };

    const keyupHandler = (e) => {
      const isPauseKey = e.code === "Space" || e.key.toLowerCase() === "k";
      if (isPauseKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log("Keyboard pause keyup blocked:", e.key);
      }
    };

    document.addEventListener("keydown", keydownHandler, true);
    document.addEventListener("keyup", keyupHandler, true);

    // Block pause button click
    const pauseButton = document.querySelector('.ytp-play-button');
    const buttonHandler = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      console.log("Pause button click blocked.");
    };
    if (pauseButton) {
      pauseButton.addEventListener("click", buttonHandler, true);
    }

    // Block clicking on video to pause
    const videoClickHandler = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      console.log("Video click (pause) blocked.");
    };
    video.addEventListener("click", videoClickHandler, true);

    // Unlock after timeout
    setTimeout(() => {
      video.pause = originalPause;
      document.removeEventListener("keydown", keydownHandler, true);
      document.removeEventListener("keyup", keyupHandler, true);
      if (pauseButton) {
        pauseButton.removeEventListener("click", buttonHandler, true);
      }
      video.removeEventListener("click", videoClickHandler, true);
      lockActive = false;
      console.log("Pause unlocked.");
    }, lockDuration * 1000);
  }

  function init() {
    const waitForVideo = setInterval(() => {
      const video = document.querySelector("video");
      if (video) {
        clearInterval(waitForVideo);

        video.addEventListener("play", () => {
          if (!video.ended) {
            chrome.storage.sync.get("lockDuration", (data) => {
              const duration = parseInt(data.lockDuration) || 10;
              blockPause(video, duration);
            });
          }
        });
      }
    }, 500);
  }

  init();
})();
