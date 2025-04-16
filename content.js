(function () {
  let lockActive = false;

  function blockPlay(video, lockDuration) {
    if (lockActive) return;

    lockActive = true;
    console.log("Paused. Locking playback for", lockDuration, "seconds.");

    const originalPlay = video.play;
    video.play = function () {
      console.log("Play attempt blocked during lock.");
      return Promise.reject("Playback locked");
    };

    // Keyboard block (capture phase)
    const keydownHandler = (e) => {
      const isPlayKey = e.code === "Space" || e.key.toLowerCase() === "k";
      if (isPlayKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log("Keyboard shortcut blocked:", e.key);
      }
    };

    const keyupHandler = (e) => {
      const isPlayKey = e.code === "Space" || e.key.toLowerCase() === "k";
      if (isPlayKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log("Keyboard keyup blocked:", e.key);
      }
    };

    document.addEventListener("keydown", keydownHandler, true);
    document.addEventListener("keyup", keyupHandler, true);

    // Play button
    const playButton = document.querySelector('.ytp-play-button');
    const playBtnHandler = (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      console.log("Play button click blocked.");
    };
    if (playButton) {
      playButton.addEventListener("click", playBtnHandler, true);
    }

    // Video click (center of video)
    const videoClickHandler = (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      console.log("Video click blocked.");
    };
    video.addEventListener("click", videoClickHandler, true);

    // Unlock after time
    setTimeout(() => {
      video.play = originalPlay;
      document.removeEventListener("keydown", keydownHandler, true);
      document.removeEventListener("keyup", keyupHandler, true);
      if (playButton) {
        playButton.removeEventListener("click", playBtnHandler, true);
      }
      video.removeEventListener("click", videoClickHandler, true);
      lockActive = false;
      console.log("Playback unlocked.");
    }, lockDuration * 1000);
  }

  function init() {
    const waitForVideo = setInterval(() => {
      const video = document.querySelector("video");
      if (video) {
        clearInterval(waitForVideo);

        video.addEventListener("pause", () => {
          if (!video.ended) {
            chrome.storage.sync.get("lockDuration", (data) => {
              const duration = parseInt(data.lockDuration) || 10;
              blockPlay(video, duration);
            });
          }
        });
      }
    }, 500);
  }

  init();
})();
