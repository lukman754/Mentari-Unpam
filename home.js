// Buat interval yang terus memeriksa dan mengganti kedua gambar
const intervalId = setInterval(() => {
  // Ganti gambar PersonLearn dengan holo-tail gif
  const personLearnImage = document.querySelector(
    'img[src*="PersonLearn-DbY26Ht3.png"]'
  );
  if (personLearnImage) {
    personLearnImage.src =
      "https://media.tenor.com/tz5N07QkpVkAAAAi/holo-tail.gif";
    personLearnImage.style.width = "auto"; // Menambahkan inline style width: auto
  }

  // Ganti logo Mentari dengan gambar dari GitHub
  const mentariLogo = document.querySelector(
    'img[src*="MentariLogo-DfuWb4z9.png"]'
  );
  if (mentariLogo) {
    mentariLogo.src =
      "https://github.com/user-attachments/assets/bc206a62-4b37-4064-a1af-872e7a157463";
    mentariLogo.style.width = "auto"; // Menambahkan inline style width: auto untuk logo juga
  }
}, 100); // Periksa setiap 100ms

console.log("Interval aktif - kedua gambar akan terus diganti secara otomatis");

// Jika ingin menghentikan interval nanti:
// clearInterval(intervalId);
