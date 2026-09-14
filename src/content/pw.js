// Fungsi untuk mengganti background pada elemen dengan class 'fullscreen'
function setFullscreenBackground() {
  const fullscreenEls = document.querySelectorAll(".fullscreen");
  fullscreenEls.forEach((el) => {
    el.style.background =
      "url(https://images7.alphacoders.com/139/thumb-1920-1393718.jpg) no-repeat 50%";
    el.style.backgroundSize = "cover";
  });
}

// Jalankan sekali saat load
setFullscreenBackground();

// Pantau perubahan DOM agar background tetap diganti jika .fullscreen muncul/diganti
const fullscreenObserver = new MutationObserver(() => {
  setFullscreenBackground();
});
fullscreenObserver.observe(document.body, { childList: true, subtree: true });

// Fungsi untuk mengubah background opacity pada elemen dengan class 'bg-1'
function setBg1Opacity() {
  const bg1Els = document.querySelectorAll(".bg-1");
  bg1Els.forEach((el) => {
    el.style.background = "rgba(13, 56, 247, 0)";
  });
}

// Jalankan sekali saat load
setBg1Opacity();

// Pantau perubahan DOM agar background tetap diubah jika .bg-1 muncul/diganti
const bg1Observer = new MutationObserver(() => {
  setBg1Opacity();
});
bg1Observer.observe(document.body, { childList: true, subtree: true });
