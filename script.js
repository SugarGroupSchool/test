
window.__inTestView = window.__inTestView || false;
const { jsPDF } = window.jspdf;
let sharedAudioCtx = null;
function prepareAudioContext() {
  if (!sharedAudioCtx) {
    try { sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
  }
}

function playBeep() {
  if (!sharedAudioCtx) return;
  const o = sharedAudioCtx.createOscillator();
  const g = sharedAudioCtx.createGain();
  o.type = 'square';
  o.frequency.value = 1080; // Lebih “teng” dari default
  g.gain.value = 0.18;
  o.connect(g);
  g.connect(sharedAudioCtx.destination);
  o.start();
  setTimeout(() => {
    o.stop();
    g.disconnect();
    o.disconnect();
  }, 260); // ← Durasi beep-nya lebih panjang sedikit
}


// Application state
const appState = {
  currentTest: null,
  currentSubtest: 0,
  currentQuestion: 0,
  timer: null,
  timeLeft: 0,
  answers: {
    IST: [],
    KRAEPLIN: [],
    DISC: [],
    PAPI: [],
    BIGFIVE: []
  },
  kraeplinHistory: {},     // tracking riwayat edit tiap cell
  kraeplinKey: [],         // kunci jawaban (isi saat generate kolom)
  kraeplinStartTime: 0,    // waktu mulai tes Kraeplin
  kraeplinEndTime: 0,      // waktu selesai tes Kraeplin
  kraeplinWaktuKolom: [],
  grafis: {
    rumah: "",
    pohon: "",
    orang: ""
},// array waktu per kolom
  completed: {
  IST: false,
  KRAEPLIN: false,
  DISC: false,
  PAPI: false,
  BIGFIVE: false,
  GRAFIS: false,
  EXCEL: false,
  TYPING: false,
  SUBJECT: false,
},
  isKraeplinTrial: false,    // ← STATUS TRIAL KRAEPLIN
  kraeplinStarted: false,    // ← TAMBAHKAN INI untuk penanda "sudah klik mulai"
  currentColumn: 0,          // ← kolom aktif
  currentRow: {},            // ← baris aktif per kolom (obj)
  timerActive: false,        // ← penanda interval
  identity: {
    name: '',
    email: '',
    phone: '',
    dob: '',
    age: '',
    addressKTP: '',
    addressCurrent: '',
    sameAddress: false,
    position: '',
    teacherLevel: '',
    techRole: '',
    education: '',
    explanation: '',
    date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
  }, grafis: {
    rumah: null,
    pohon: null,
    orang: null
  },
  // Untuk hasil jawaban admin:
  adminAnswers: {
    EXCEL: null,
    TYPING: null
  }
};

// Test data
const tests = {
  IST: {
    name: "Intelligenz Struktur Test (IST)",
    description: "Tes kemampuan intelektual yang mengukur berbagai aspek kecerdasan",
    subtests: [
      {
        name: "SE (Satzergänzung)",
        description: "Melengkapi kalimat",
        time: 360, // 6 menit
        type: "multiple-choice",
        instruction: "Pilih kata yang tepat untuk melengkapi kalimat",
        example: {
          question: "Dia pergi ke ... untuk membeli sayuran.",
          options: ["A. Pasar", "B. Kantor", "C. Sekolah", "D. Rumah sakit"],
          answer: "A. Pasar",
          explanation: "Tempat membeli sayuran adalah pasar"
        },
 questions: [
  {
    id: 1,
    text: "Pengaruh seseorang terhadap orang lain seharusnya bergantung pada .....",
    options: [
      "A. kekuasaan",
      "B. bujukan",
      "C. kekayaan",
      "D. keberanian",
      "E. kewibawaan"
    ]
  },
  {
    id: 2,
    text: "Lawan kata 'hemat' ialah .....",
    options: [
      "A. murah",
      "B. kikir",
      "C. boros",
      "D. bernilai",
      "E. kaya"
    ]
  },
  {
    id: 3,
    text: "..... tidak termasuk cuaca",
    options: [
      "A. angin puyuh",
      "B. halilintar",
      "C. salju",
      "D. gempa bumi",
      "E. kabut"
    ]
  },
  {
    id: 4,
    text: "Lawan kata 'setia' ialah .....",
    options: [
      "A. cinta",
      "B. benci",
      "C. persahabatan",
      "D. khianat",
      "E. permusuhan"
    ]
  },
  {
    id: 5,
    text: "Seekor kuda selalu mempunyai .....",
    options: [
      "A. kandang",
      "B. ladam",
      "C. pelana",
      "D. kuku",
      "E. surai"
    ]
  },
  {
    id: 6,
    text: "Seorang paman ..... lebih tua dari keponakannya.",
    options: [
      "A. jarang",
      "B. biasanya",
      "C. selalu",
      "D. tidak pernah",
      "E. kadang-kadang"
    ]
  },
  {
    id: 7,
    text: "Pada jumlah yang sama, nilai kalori yang tertinggi terdapat pada .....",
    options: [
      "A. ikan",
      "B. daging",
      "C. lemak",
      "D. tahu",
      "E. sayuran"
    ]
  },
  {
    id: 8,
    text: "Pada suatu pertandingan selalu terdapat .....",
    options: [
      "A. wasit",
      "B. hadiah",
      "C. sorak",
      "D. penonton",
      "E. kemenangan"
    ]
  },
  {
    id: 9,
    text: "Suatu pernyataan yang belum dipastikan dikatakan sebagai pernyataan yang .....",
    options: [
      "A. paradoks",
      "B. tergesa-gesa",
      "C. mempunyai arti rangkap",
      "D. menyesatkan",
      "E. hipotesis"
    ]
  },
  {
    id: 10,
    text: "Pada sepatu selalu terdapat .....",
    options: [
      "A. kulit",
      "B. sol",
      "C. tali sepatu",
      "D. gesper",
      "E. lidah"
    ]
  },
   
{
  id: 11,
  text: "Suatu …………… tidak menyangkut persoalan pencegahan kecelakaan.",
  options: [
    "A. lampu lalu lintas",
    "B. kacamata pelindung",
    "C. kotak PPPK",
    "D. tanda peringatan",
    "E. palang kereta api"
  ]
},
{
  id: 12,
  text: "Jumlah hari dalam satu tahun kabisat adalah …………… hari.",
options: [
  "A. 365",
  "B. 360",
  "C. 362",
  "D. 366",
  "E. 364"
  ]
},
{
  id: 13,
  text: "Seseorang yang bersikap menyangsikan setiap kemajuan ialah seorang yang …..",
  options: [
    "A. demokratis",
    "B. radikal",
    "C. liberal",
    "D. konservatif",
    "E. anarkis"
  ]
},
{
  id: 14,
  text: "Lawannya “tidak pernah” ialah ……………",
  options: [
    "A. sering",
    "B. kadang-kadang",
    "C. jarang",
    "D. kerap kali",
    "E. selalu"
  ]
},
{
  id: 15,
 text: "Suatu keputusan dianggap adil apabila …………",
options: [
  "A. hanya menguntungkan pihak mayoritas",
  "B. ditentukan secara cepat tanpa pertimbangan",
  "C. mempertimbangkan kepentingan semua pihak",
  "D. berdasarkan tekanan dari kelompok tertentu",
  "E. ditetapkan demi kepentingan pribadi"
  ]
},
{
  id: 16,
  text: "Untuk dapat membuat nada yang rendah dan mendalam, kita memerlukan banyak ………",
  options: [
    "A. kekuatan",
    "B. peranan",
    "C. ayunan",
    "D. berat",
    "E. suara"
  ]
},
{
  id: 17,
  text: "Ayah …………… lebih berpengalaman dari pada anaknya",
  options: [
    "A. selalu",
    "B. biasanya",
    "C. jauh",
    "D. jarang",
    "E. pada dasarnya"
  ]
},
{
  id: 18,
  text: "Diantara kota-kota berikut ini, maka kota ……. letaknya paling selatan.",
  options: [
    "A. Jakarta",
    "B. Bandung",
    "C. Cirebon",
    "D. Semarang",
    "E. Surabaya"
  ]
},
{
  id: 19,
  text: "Jika kita mengetahui jumlah presentase nomor-nomor lotere yang tidak menang, maka kita dapat menghitung ………",
  options: [
    "A. jumlah nomor yang menang",
    "B. pajak lotere",
    "C. kemungkinan menang",
    "D. jumlah pengikut",
    "E. tinggi keuntungan"
  ]
},
{
  id: 20,
 text: "Keadilan dalam suatu negara akan terwujud apabila hukum …………",
options: [
  "A. ditafsirkan berbeda oleh setiap orang",
  "B. ditegakkan dengan konsisten",
  "C. hanya menguntungkan sebagian kelompok",
  "D. dibiarkan tanpa pengawasan",
  "E. dapat dibeli dengan uang"
  ]
}
]
      },
      {
        name: "WA (Wortauswahl)",
        description: "Memilih kata",
        time: 360, // 6 menit
        type: "multiple-choice",
        instruction: "Pilih kata yang paling sesuai dengan definisi",
        example: {
          question: "Tempat untuk menyimpan buku disebut:",
          options: ["A. Lemari", "B. Rak buku", "C. Meja", "D. Tas"],
          answer: "B. Rak buku",
          explanation: "Rak buku adalah tempat menyimpan buku"
        },
        questions: [
  {
    id: 21,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. lingkungan",
      "B. panah",
      "C. elips",
      "D. busur",
      "E. lengkungan"
    ]
  },
  {
    id: 22,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. mengetuk",
      "B. memakai",
      "C. menjahit",
      "D. menggergaji",
      "E. memukul"
    ]
  },
  {
    id: 23,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. lebar",
      "B. keliling",
      "C. luas",
      "D. isi",
      "E. panjang"
    ]
  },
  {
    id: 24,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. mengikat",
      "B. menyatukan",
      "C. melepaskan",
      "D. mengaitkan",
      "E. melekatkan"
    ]
  },
  {
    id: 25,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. arah",
      "B. timur",
      "C. perjalanan",
      "D. tujuan",
      "E. selatan"
    ]
  },
  {
    id: 26,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. jarak",
      "B. perpisahan",
      "C. tugas",
      "D. batas",
      "E. perceraian"
    ]
  },
  {
    id: 27,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. saringan",
      "B. kelambu",
      "C. payung",
      "D. tapisan",
      "E. jala"
    ]
  },
  {
    id: 28,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. putih",
      "B. pucat",
      "C. buram",
      "D. kasar",
      "E. berkilauan"
    ]
  },
  {
    id: 29,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. otobis",
      "B. pesawat terbang",
      "C. sepeda motor",
      "D. kereta api",
      "E. kapal api"
    ]
  },
  {
    id: 30,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. biola",
      "B. seruling",
      "C. klarinet",
      "D. terompet",
      "E. saxophon"
    ]
  },
  {
    id: 31,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. bergelombang",
      "B. kasar",
      "C. berduri",
      "D. licin",
      "E. lurus"
    ]
  },
  {
    id: 32,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. jam",
      "B. kompas",
      "C. pemupuk jalan",
      "D. bintang pari",
      "E. arah"
    ]
  },
  {
    id: 33,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. kebijaksanaan",
      "B. pendidikan",
      "C. perencanaan",
      "D. penempatan",
      "E. pengetahuan"
    ]
  },
  {
    id: 34,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. bermotor",
      "B. berjalan",
      "C. berlayar",
      "D. bersepeda",
      "E. berkuda"
    ]
  },
  {
    id: 35,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. gambar",
      "B. lukisan",
      "C. potret",
      "D. patung",
      "E. ukiran"
    ]
  },
  {
    id: 36,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. panjang",
      "B. lonjong",
      "C. runcing",
      "D. bulat",
      "E. bersudut"
    ]
  },
  {
    id: 37,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. kunci",
      "B. palang pintu",
      "C. gerendel",
      "D. gunting",
      "E. obeng"
    ]
  },
  {
    id: 38,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. jembatan",
      "B. batas",
      "C. perkawinan",
      "D. pagar",
      "E. masyarakat"
    ]
  },
  {
    id: 39,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. mengetam",
      "B. menasehati",
      "C. mengasah",
      "D. melicinkan",
      "E. menggosok"
    ]
  },
  {
    id: 40,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. batu",
      "B. baja",
      "C. bulu",
      "D. karet",
      "E. kayu"
    ]
  }
]
},
      {
        name: "AN (Analogien)",
        description: "Analogi",
        time: 420, // 7 menit
        type: "multiple-choice",
        instruction: "Temukan hubungan analogi yang tepat",
        example: {
          question: "Kaki : Sepatu = Tangan : ?",
          options: ["A. Sarung", "B. Jam", "C. Sarung Tangan", "D. Gelang"],
          answer: "C. Sarung Tangan",
          explanation: "Seperti kaki dilindungi sepatu, tangan dilindungi sarung tangan"
        },
questions: [
  {
    id: 41,
    text: "Menemukan : menghilangkan = Mengingat : ?",
    options: [
      "A. menghapal",
      "B. mengenai",
      "C. melupakan",
      "D. berpikir",
      "E. memimpikan"
    ]
  },
  {
    id: 42,
    text: "Bunga : jambangan = Burung : ?",
    options: [
      "A. sarang",
      "B. langit",
      "C. pagar",
      "D. pohon",
      "E. sangkar"
    ]
  },
  {
    id: 43,
    text: "Kereta api : rel = Otobis : ?",
    options: [
      "A. roda",
      "B. poros",
      "C. ban",
      "D. jalan raya",
      "E. kecepatan"
    ]
  },
  {
    id: 44,
    text: "Perak : emas = Cincin : ?",
    options: [
      "A. arloji",
      "B. berlian",
      "C. permata",
      "D. gelang",
      "E. platina"
    ]
  },
  {
    id: 45,
    text: "Lingkaran : bola = Bujur sangkar : ?",
    options: [
      "A. bentuk",
      "B. gambar",
      "C. segi empat",
      "D. kubus",
      "E. piramida"
    ]
  },
  {
    id: 46,
    text: "Saran : keputusan = Merundingkan : ?",
    options: [
      "A. menawarkan",
      "B. menentukan",
      "C. menilai",
      "D. menimbang",
      "E. merenungkan"
    ]
  },
  {
    id: 47,
    text: "Lidah : asam = Hidung : ?",
    options: [
      "A. mencium",
      "B. bernapas",
      "C. mengecap",
      "D. tengik",
      "E. asin"
    ]
  },
  {
    id: 48,
    text: "Darah : pembuluh = Air : ?",
    options: [
      "A. pintu air",
      "B. sungai",
      "C. talang",
      "D. hujan",
      "E. ember"
    ]
  },
  {
    id: 49,
    text: "Saraf : penyalur = Pupil : ?",
    options: [
      "A. penyinaran",
      "B. mata",
      "C. melihat",
      "D. cahaya",
      "E. pelindung"
    ]
  },
  {
    id: 50,
    text: "Pengantar surat : pengantar telegram = Pandai besi : ?",
    options: [
      "A. palu godam",
      "B. pedagang besi",
      "C. api",
      "D. tukang emas",
      "E. besi tempa"
    ]
  },
  {
    id: 51,
    text: "Buta : warna = Tuli : ?",
    options: [
      "A. pendengaran",
      "B. mendengar",
      "C. nada",
      "D. kata",
      "E. telinga"
    ]
  },
  {
    id: 52,
    text: "Makanan : bumbu = Ceramah : ?",
    options: [
      "A. penghinaan",
      "B. pidato",
      "C. kelakar",
      "D. kesan",
      "E. ayat"
    ]
  },
  {
    id: 53,
    text: "Marah : emosi = Duka cita : ?",
    options: [
      "A. suka cita",
      "B. sakit hati",
      "C. suasana hati",
      "D. sedih",
      "E. rindu"
    ]
  },
  {
    id: 54,
    text: "Mantel : jubah = wool : ?",
    options: [
      "A. bahan sandang",
      "B. domba",
      "C. sutra",
      "D. jas",
      "E. tekstil"
    ]
  },
  {
    id: 55,
    text: "Ketinggian puncak : tekanan udara = ketinggian nada : ?",
    options: [
      "A. garpu tala",
      "B. sopran",
      "C. nyanyian",
      "D. panjang senar",
      "E. selubung"
    ]
  },
  {
    id: 56,
    text: "Negara : revolusi = Hidup : ?",
    options: [
      "A. biologi",
      "B. keturunan",
      "C. mutasi",
      "D. seleksi",
      "E. ilmu hewan"
    ]
  },
  {
    id: 57,
    text: "Kekurangan : penemuan = Panas : ?",
    options: [
      "A. haus",
      "B. khatulistiwa",
      "C. es",
      "D. matahari",
      "E. dingin"
    ]
  },
  {
    id: 58,
    text: "Kayu : diketam = Besi : ?",
    options: [
      "A. dipalu",
      "B. digergaji",
      "C. dituang",
      "D. dikikir",
      "E. ditempa"
    ]
  },
  {
    id: 59,
    text: "Olahragawan : lembing = Cendekiawan : ?",
    options: [
      "A. perpustakaan",
      "B. penelitian",
      "C. karya",
      "D. studi",
      "E. mikroskop"
    ]
  },
  {
    id: 60,
    text: "Keledai : kuda pacuan = Pembakaran : ?",
    options: [
      "A. pemadam api",
      "B. obor",
      "C. letupan",
      "D. korek api",
      "E. lautan api"
]
  }
]
},
      {
        name: "GE (Gemeinsamkeiten Finden)",
        description: "Mencari kesamaan",
        time: 480, // 8 menit
        type: "text-input",
        instruction: "Temukan kesamaan dari dua kata berikut",
        example: {
          question: "Apa kesamaan antara Apel dan Jeruk?",
          answer: "Buah-buahan",
          explanation: "Keduanya adalah jenis buah-buahan"
        },
questions: [
  {
    id: 61,
    text: "Apa kesamaan antara Mawar dan Melati?"
  },
  {
    id: 62,
    text: "Apa kesamaan antara Mata dan Telinga?"
  },
  {
    id: 63,
    text: "Apa kesamaan antara Gula dan Intan?"
  },
  {
    id: 64,
    text: "Apa kesamaan antara Hujan dan Salju?"
  },
  {
    id: 65,
    text: "Apa kesamaan antara Pengantar surat dan Telepon?"
  },
  {
    id: 66,
    text: "Apa kesamaan antara Kamera dan Kacamata?"
  },
  {
    id: 67,
    text: "Apa kesamaan antara Lambung dan Usus?"
  },
  {
    id: 68,
    text: "Apa kesamaan antara Banyak dan Sedikit?"
  },
  {
    id: 69,
    text: "Apa kesamaan antara Telur dan Benih?"
  },
  {
    id: 70,
    text: "Apa kesamaan antara Bendera dan Lencana?"
  },
  {
    id: 71,
    text: "Apa kesamaan antara Rumput dan Gajah?"
  },
  {
    id: 72,
    text: "Apa kesamaan antara Ember dan Kantong?"
  },
  {
    id: 73,
    text: "Apa kesamaan antara Awal dan Akhir?"
  },
  {
    id: 74,
    text: "Apa kesamaan antara Kikir dan Boros?"
  },
  {
    id: 75,
    text: "Apa kesamaan antara Penawaran dan Permintaan?"
  },
  {
    id: 76,
    text: "Apa kesamaan antara Atas dan Bawah?"
  }
]
      },
      {
        name: "RA (Rechenaufgaben)",
        description: "Soal hitungan",
        time: 600, // 10 menit
        type: "number-input",
        instruction: "Selesaikan soal hitungan berikut",
        example: {
          question: "Berapa hasil dari 15 + 27?",
          answer: "42",
          explanation: "15 + 27 = 42"
        },
questions: [
  {
    id: 77,
    text: "Jika seorang anak memiliki 50 rupiah dan memberikan 15 rupiah kepada orang lain, berapa rupiahkah yang masih tinggal padanya?"
  },
  {
    id: 78,
    text: "Berapa km-kah yang dapat ditempuh oleh kereta api dalam waktu 7 jam, jika kecepatannya 40 km/jam?"
  },
  {
    id: 79,
    text: "15 peti buah-buahan beratnya 250 kg dan setiap peti kosong beratnya 3 kg, berapakah berat buah-buahan itu?"
  },
  {
    id: 80,
    text: "Seseorang mempunyai persediaan rumput yang cukup untuk 7 ekor kuda selama 78 hari. Berapa harikah persediaan ini cukup untuk 21 ekor kuda?"
  },
  {
    id: 81,
    text: "3 batang coklat harganya Rp 5,-. Berapa batangkah yang dapat kita beli dengan Rp 50,-?"
  },
  {
    id: 82,
    text: "Seseorang dapat berjalan 1,75 m dalam waktu 1/4 detik. Berapakah meterkah yang dapat ia tempuh dalam waktu 10 detik?"
  },
  {
    id: 83,
    text: "Jika sebuah batu terletak 15 m di sebelah selatan dari sebidang pohon dan pohon itu terletak 30 m di sebelah selatan dari sebuah rumah, berapa meterkah jarak antara batu dan rumah itu?"
  },
  {
    id: 84,
    text: "Jika 4 1/2 m bahan sandang harganya Rp 90,- berapakah rupiahkah harganya 2 1/2 m?"
  },
  {
    id: 85,
    text: "7 orang dapat menyelesaikan sesuatu pekerjaan dalam 6 hari. Berapa orangkah yang diperlukan untuk menyelesaikan pekerjaan itu dalam setengah hari?"
  },
  {
    id: 86,
    text: "Karena dipanaskan, kawat yang panjangnya 48 cm akan mengembang menjadi 52 cm. setelah pemanasan, berapakah panjangnya kawat yang berukuran 72 cm?"
  },
  {
    id: 87,
    text: "Suatu pabrik dapat menghasilkan 304 batang pensil dalam waktu 8 jam. Berapa batangkah yang dihasilkan dalam waktu setengah jam?"
  },
  {
    id: 88,
    text: "Untuk suatu campuran diperlukan 2 bagian perak dan 3 bagian timah. Berapa gramkah perak yang diperlukan untuk mendapatkan campuran itu yang beratnya 15 gram?"
  },
  {
    id: 89,
    text: "Untuk setiap Rp 3,- yang dimiliki Sidin, Hamid memiliki Rp 5,-. Jika mereka bersama mempunyai Rp 120,- berapa rupiahkah yang dimiliki Hamid?"
  },
  {
    id: 90,
    text: "Mesin A menenun 60 m kain, sedangkan mesin B menenun 40 m. berapa meterkah waktu ditenun mesin A, jika mesin B menenun 60 m?"
  },
  {
    id: 91,
    text: "Seseorang membelikan 1/10 dari uangnya untuk perangko dan 4 kali jumlah itu untuk alat tulis. Sisa uangnya masih Rp 60. Berapa rupiahkah uang semula?"
  },
  {
    id: 92,
    text: "Di dalam dua peti terdapat 43 piring. Di dalam peti yang satu terdapat 9 piring lebih banyak dari pada di dalam peti yang lain. Berapa buah piring terdapat di dalam peti yang lebih kecil?"
  },
  {
    id: 93,
    text: "Suatu lembaran kain yang panjangnya 60 cm harus dibagikan sedemikian rupa sehingga panjangnya satu bagian ialah 2/3 dari bagian yang lain. Berapa panjangnya bagian yang terpendek."
  },
  {
    id: 94,
    text: "Suatu perusahaan mengekspor 3/4 dari hasil produksinya dan menjual 4/5 dari sisa itu dalam negeri. Berapa % kah hasil produksi yang masih tinggal?"
  },
  {
    id: 95,
    text: "Jika suatu botol berisi anggur hanya 7/8 bagian dan harganya adalah Rp 84,- berapakah harga anggur di dalam botol itu hanya terisi 1/2 penuh?"
  },
  {
    id: 96,
    text: "Di dalam suatu keluarga setiap anak perempuan mempunyai jumlah saudara laki-laki yang sama dengan jumlah saudara perempuan dan setiap anak laki-laki mempunyai dua kali lebih banyak saudara perempuan dari pada saudara laki-laki. Berapa anak laki-lakikah yang terdapat di dalam keluarga tersebut?"
  }
]
      },
      {
        name: "ZR (Zahlenreihen)",
        description: "Deret angka",
        time: 600, // 10 menit
        type: "number-input",
        instruction: "Lanjutkan deret angka berikut",
        example: {
          question: "2, 4, 6, 8, ...",
          answer: "10",
          explanation: "Deret angka genap"
        },
questions: [
  {
    id: 97,
    text: "6, 9, 12, 15, 18, 21, 24, ?"
  },
  {
    id: 98,
    text: "15, 16, 18, 19, 21, 22, 24, ?"
  },
  {
    id: 99,
    text: "19, 18, 22, 21, 25, 24, 28, ?"
  },
  {
    id: 100,
    text: "16, 12, 17, 13, 18, 14, 19, ?"
  },
  {
    id: 101,
    text: "2, 4, 8, 10, 20, 22, 44, ?"
  },
  {
    id: 102,
    text: "15, 13, 16, 15, 17, 11, 18, ?"
  },
  {
    id: 103,
    text: "25, 22, 11, 33, 30, 15, 45, ?"
  },
  {
    id: 104,
    text: "49, 51, 54, 27, 9, 11, 14, ?"
  },
  {
    id: 105,
    text: "2, 3, 1, 3, 4, 2, 5, 4, ?"
  },
  {
    id: 106,
    text: "19, 17, 20, 16, 21, 15, 22, ?"
  },
  {
    id: 107,
    text: "94, 92, 46, 44, 22, 20, 10, ?"
  },
  {
    id: 108,
    text: "5, 8, 9, 8, 11, 12, 11, ?"
  },
  {
    id: 109,
    text: "12, 15, 19, 23, 28, 33, 39, ?"
  },
  {
    id: 110,
    text: "7, 5, 10, 7, 21, 17, 68, ?"
  },
  {
    id: 111,
    text: "11, 15, 18, 9, 13, 16, 8, ?"
  },
  {
    id: 112,
    text: "3, 8, 15, 24, 35, 48, 63, ?"
  },
  {
    id: 113,
    text: "4, 5, 7, 4, 8, 13, 7, ?"
  },
  {
    id: 114,
    text: "8, 5, 15, 18, 6, 3, 9, ?"
  },
  {
    id: 115,
    text: "4, 6, 18, 10, 30, 23, 69, ?"
  },
  {
    id: 116,
    text: "5, 35, 28, 4, 11, 77, 70, ?"
  }
]
      },
      {
  name: "FA (Figurenauswahl)",
  description: "Pilih gambar yang berbeda dari yang lain",
  time: 420, // 7 menit
  type: "image-choice",
  instruction: "Klik gambar yang sesuai",
  example: {
    images: [ "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_contoh_opsi_a.jpg", "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_contoh_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_contoh_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_contoh_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_contoh_opsi_e.jpg"
    ],
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_contoh_contoh_1.jpg",
    options: ["A", "B", "C", "D", "E"],
    answer: "A",
    explanation: "Jika gambar pada contoh digabungkan, maka akan menghasilkan bentuk sesuai dengan opsi 'A'."
  },
questions: [
  {
    id: 117,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_117.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_d.jpg", "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 118,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_118.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_d.jpg", "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 119,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_119.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_d.jpg", "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 120,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_120.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_d.jpg", "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 121,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_121.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_d.jpg", "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 122,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_122.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_d.jpg", "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 123,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_123.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_d.jpg", "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 124,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_124.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_d.jpg", "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 125,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_125.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_d.jpg", "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 126,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_126.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_d.jpg", "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 127,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_127.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_d.jpg", "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 128,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_128.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_d.jpg", "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 129,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_129.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 130,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_130.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 131,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_131.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 132,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_132.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 133,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_133.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 134,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_134.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 135,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_135.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 136,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA_soal_136.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/FA2_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
  }
]
      },
      {
    name: "WU (Würfelaufgaben)",
  description: "Pilih gambar kubus yang sesuai dengan pola",
  time: 540, // 9 menit
  type: "image-choice",
  instruction: "Klik gambar kubus yang sesuai dengan pola",
  example: {
    images: [
      "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_contoh_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_contoh_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_contoh_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_contoh_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_contoh_opsi_e.jpg"
    ],
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_contoh_soal_1.jpg",
    options: ["A", "B", "C", "D","E"],
    answer: "B",
    explanation: "Gambar A sesuai dengan pola"
  },
  questions: [
  {
    id: 137,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_137.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 138,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_138.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 139,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_139.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 140,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_140.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 141,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_141.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 142,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_142.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 143,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_143.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 144,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_144.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 145,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_145.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 146,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_146.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 147,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_147.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 148,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_148.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 149,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_149.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 150,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_150.jpg",
  images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 151,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_151.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 152,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_152.jpg",
  images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 153,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_153.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 154,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_154.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 155,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_155.jpg",
   images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 156,
    questionImage: "https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_soal_156.jpg",
    images: [
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_a.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_b.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_c.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_d.jpg",
"https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/WU_opsi_e.jpg"
    ],
    options: ["A", "B", "C", "D", "E"]
}
]

      },
    {
  name: "ME (Memori)",
  description: "Daya ingat: hafalkan daftar kata lalu jawab soal.",
  time: 360, // 6 menit pengerjaan soal
  type: "multiple-choice",
  instruction: "Pilih jawaban yang benar berdasarkan daftar yang telah dihafalkan.",
  memorizePhase: {
    duration: 180, // 3 menit hafalan
    title: "Hafalkan kata-kata di bawah ini selama 3 menit",
    groups: [
      { label: "BUNGA",     items: ["SOKA", "LARAT", "FLAMBOYAN", "YASMIN", "DAHLIA"] },
      { label: "PERKAKAS",  items: ["WAJAN", "JARUM", "KIKIR", "CANGKUL", "PALU"] },
      { label: "BURUNG",    items: ["ITIK", "ELANG", "WALET", "TEKUKUR", "NURI"] },
      { label: "KESENIAN",  items: ["QUANTET", "ARCA", "OPERA", "UKIRAN", "GAMELAN"] },
      { label: "BINATANG",  items: ["RUSA", "MUSANG", "BERUANG", "HARIMAU", "ZEBRA"] }
    ]
  },
  example: {
    question: "Contoh: Kata yang mempunyai huruf permulaan -Q- merupakan bagian dari _____",
    options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"],
    answer: "D", // contoh tetap menyertakan kunci
    explanation: "Kata yang berawalan -Q- adalah 'QUINTET' yang merupakan bagian dari kesenian."
  },
  questions: [
    { id: 157, text: "Kata yang mempunyai huruf permulaan -A- merupakan bagian dari _____",            options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 158, text: "Kata yang mempunyai huruf permulaan -B- merupakan bagian dari _____",   options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 159, text: "Kata yang mempunyai huruf permulaan -C- merupakan bagian dari _____",           options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 160, text: "Kata yang mempunyai huruf permulaan -D- merupakan bagian dari _____",         options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 161, text: "Kata yang mempunyai huruf permulaan -E- merupakan bagian dari _____",         options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 162, text: "Kata yang mempunyai huruf permulaan -F- merupakan bagian dari _____",      options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 163, text: "Kata yang mempunyai huruf permulaan -G- merupakan bagian dari _____",         options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 164, text: "Kata yang mempunyai huruf permulaan -H- merupakan bagian dari _____",           options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 165, text: "Kata yang mempunyai huruf permulaan -I- merupakan bagian dari _____",         options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 166, text: "Kata yang mempunyai huruf permulaan -J- merupakan bagian dari _____",   options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 167, text: "Kata yang mempunyai huruf permulaan -K- merupakan bagian dari _____",        options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 168, text: "Kata yang mempunyai huruf permulaan -L- merupakan bagian dari _____",        options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 169, text: "Kata yang mempunyai huruf permulaan -M- merupakan bagian dari _____",         options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 170, text:"Kata yang mempunyai huruf permulaan -N- merupakan bagian dari _____",          options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 171, text: "Kata yang mempunyai huruf permulaan -O- merupakan bagian dari _____",           options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 172, text:"Kata yang mempunyai huruf permulaan -P- merupakan bagian dari _____",           options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 173, text: "Kata yang mempunyai huruf permulaan -R- merupakan bagian dari _____",        options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 174, text: "Kata yang mempunyai huruf permulaan -S- merupakan bagian dari _____",   options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 175, text: "Kata yang mempunyai huruf permulaan -T- merupakan bagian dari _____",     options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] },
    { id: 176, text: "Kata yang mempunyai huruf permulaan -U- merupakan bagian dari _____",      options: ["A. bunga", "B. perkakas", "C. burung", "D. kesenian", "E. binatang"] }
  ]
}

    ]
  },
  KRAEPLIN: {
    name: "Tes Kraeplin",
    description: "Hitung cepat dan teliti, isi satu kolom dalam 15 detik.",
    columns: [], // Diisi dinamis
    timePerColumn: 15
  },
  DISC: {
  name: "Tes DISC",
  description: "Tes kepribadian yang mengukur Dominance, Influence, Steadiness, dan Compliance",
  instruction: "Untuk setiap pernyataan, pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda",
  example: {
    question: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: ["Disiplin", "Kreatif", "Sabar", "Teliti"],
    p: "Disiplin",
    k: "Kreatif",
    explanation: "Pilih 1 untuk Paling dan 1 untuk Kurang menggambarkan Anda"
  },
  questions: [
  {
    id: 1,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Gampangan, Mudah setuju",                 P: 'S', K: 'S' },
      { text: "Percaya, Mudah percaya pada orang",        P: 'I', K: 'I' },
      { text: "Petualang, Mengambil resiko",              P: '*', K: 'D' },
      { text: "Toleran, Menghormati",                     P: 'C', K: 'C' }
    ]
  },
  {
    id: 2,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Lembut suara, Pendiam",                    P: 'C', K: '*' },
      { text: "Optimistik, Visioner",                     P: 'D', K: 'D' },
      { text: "Pusat perhatian, Suka gaul",               P: '*', K: 'I' },
      { text: "Pendamai, Membawa Harmoni",                P: 'S', K: 'S' }
    ]
  },
  {
    id: 3,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Menyemangati orang",                       P: 'I', K: 'I' },
      { text: "Berusaha sempurna",                        P: '*', K: 'C' },
      { text: "Bagian dari kelompok",                     P: '*', K: 'S' },
      { text: "Ingin membuat tujuan",                     P: 'D', K: '*' }
    ]
  },
  {
    id: 4,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Menjadi frustrasi",                        P: 'C', K: 'C' },
      { text: "Menyimpan perasaan saya",                  P: 'S', K: 'S' },
      { text: "Menceritakan sisi saya",                   P: '*', K: 'I' },
      { text: "Siap beroposisi",                          P: 'D', K: 'D' }
    ]
  },
  {
    id: 5,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Hidup, Suka bicara",                       P: 'I', K: '*' },
      { text: "Gerak cepat, Tekun",                       P: 'D', K: 'D' },
      { text: "Usaha menjaga keseimbangan",               P: 'S', K: 'S' },
      { text: "Usaha mengikuti aturan",                   P: '*', K: 'C' }
    ]
  },
  {
    id: 6,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Kelola waktu secara efisien",              P: 'C', K: '*' },
      { text: "Sering terburu-buru, Merasa tertekan",     P: 'D', K: 'D' },
      { text: "Masalah sosial itu penting",               P: 'I', K: 'I' },
      { text: "Suka selesaikan apa yang saya mulai",      P: 'S', K: 'S' }
    ]
  },
  {
    id: 7,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Tolak perubahan mendadak",                 P: 'S', K: '*' },
      { text: "Cenderung janji berlebihan",               P: 'I', K: 'I' },
      { text: "Tarik diri di tengah tekanan",             P: '*', K: 'C' },
      { text: "Tidak takut bertempur",                    P: '*', K: 'D' }
    ]
  },
  {
    id: 8,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Penyemangat yang baik",                    P: 'I', K: 'I' },
      { text: "Pendengar yang baik",                      P: 'S', K: 'S' },
      { text: "Penganalisa yang baik",                    P: 'C', K: 'C' },
      { text: "Delegator yang baik",                      P: 'D', K: 'D' }
    ]
  },
  {
    id: 9,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Hasil adalah penting",                     P: 'D', K: 'D' },
      { text: "Lakukan dengan benar, Akurasi penting",    P: 'C', K: 'C' },
      { text: "Dibuat menyenangkan",                      P: '*', K: 'I' },
      { text: "Mari kerjakan bersama",                    P: '*', K: 'S' }
    ]
  },
  {
    id: 10,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Akan berjalan terus tanpa kontrol diri",   P: '*', K: 'C' },
      { text: "Akan membeli sesuai dorongan hati",        P: 'D', K: 'D' },
      { text: "Akan menunggu, Tanpa tekanan",             P: 'S', K: 'S' },
      { text: "Akan mengusahakan yang kuinginkan",        P: 'I', K: '*' }
    ]
  },
  {
    id: 11,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Ramah, Mudah bergabung",                   P: 'S', K: '*' },
      { text: "Unik, Bosan rutinitas",                    P: '*', K: 'I' },
      { text: "Aktif mengubah sesuatu",                   P: 'D', K: 'D' },
      { text: "Ingin hal-hal yang pasti",                 P: 'C', K: 'C' }
    ]
  },
  {
    id: 12,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Non-konfrontasi, Menyerah",                P: '*', K: 'S' },
      { text: "Dipenuhi hal detail",                      P: 'C', K: '*' },
      { text: "Perubahan pada menit terakhir",            P: 'I', K: 'I' },
      { text: "Menuntut, Kasar",                          P: 'D', K: 'D' }
    ]
  },
  {
    id: 13,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Ingin kemajuan",                           P: 'D', K: 'D' },
      { text: "Puas dengan segalanya",                    P: 'S', K: '*' },
      { text: "Terbuka memperlihatkan perasaan",          P: 'I', K: '*' },
      { text: "Rendah hati, Sederhana",                   P: '*', K: 'C' }
    ]
  },
  {
    id: 14,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Tenang, Pendiam",                          P: 'C', K: 'C' },
      { text: "Bahagia, Tanpa beban",                     P: 'I', K: 'I' },
      { text: "Menyenangkan, Baik hati",                  P: 'S', K: '*' },
      { text: "Tak gentar, Berani",                       P: 'D', K: 'D' }
    ]
  },
  {
    id: 15,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Menggunakan waktu berkualitas dengan teman", P: 'S', K: 'S' },
      { text: "Rencanakan masa depan, Bersiap",            P: 'C', K: '*' },
      { text: "Bepergian demi petualangan baru",           P: 'I', K: 'I' },
      { text: "Menerima ganjaran atas tujuan yang dicapai", P: 'D', K: 'D' }
    ]
  },
 {
  id: 16,
  text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
  options: [
    { text: "Aturan perlu dipertanyakan",   P: '*', K: 'D' },
    { text: "Aturan membuat adil",          P: 'C', K: '*' },
    { text: "Aturan membuat bosan",         P: 'I', K: 'I' },
    { text: "Aturan membuat aman",          P: 'S', K: 'S' }
  ]
},
  {
    id: 17,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Pendidikan, Kebudayaan",           P: '*', K: 'C' },
      { text: "Prestasi, Ganjaran",               P: 'D', K: 'D' },
      { text: "Keselamatan, Keamanan",            P: 'S', K: 'S' },
      { text: "Sosial, Perkumpulan kelompok",     P: 'I', K: '*' }
    ]
  },
  {
    id: 18,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Memimpin, pendekatan langsung",                   P: 'D', K: 'D' },
      { text: "Suka bergaul, antusias",  P: '*', K: 'I' },
      { text: "Dapat ditebak (konsisten)",                  P: '*', K: 'S' },
      { text: "Waspada, hati-hati",            P: 'C', K: '*' }
    ]
  },
  {
    id: 19,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Tak mudah dikalahkan",                     P: 'D', K: 'D' },
      { text: "Kerjakan sesuai perintah, ikut pimpinan",  P: 'S', K: '*' },
      { text: "Mudah terangsang, riang",                  P: 'I', K: 'I' },
      { text: "Ingin segalanya teratur, rapi",            P: '*', K: 'C' }
    ]
  },
  {
    id: 20,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Saya akan pimpin mereka",                  P: 'D', K: '*' },
      { text: "Saya akan melaksanakan",                   P: 'S', K: 'S' },
      { text: "Saya akan meyakinkan mereka",              P: 'I', K: 'I' },
      { text: "Saya dapatkan fakta",                      P: 'C', K: '*' }
    ]
  },
  {
    id: 21,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text:"Memikirkan orang dahulu",         P: 'S', K: 'S' },
      { text: "Kompetitif, suka tantangan",                     P: 'D', K: 'D' },
      { text: "Optimis, positif",                       P: 'I', K: 'I' },
      { text: "Pemikir logis, sistematik",              P: '*', K: 'C' }
    ]
  },
  {
    id: 22,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Menyenangkan orang, mudah setuju",                    P: 'S', K: 'S' },
      { text: "Tertawa lepas, hidup",                   P: '*', K: 'I' },
      { text: "Berani, tak gentar",                     P: 'D', K: 'D' },
      { text: "Tenang, pendiam",             P: 'C', K: 'C' }
    ]
  },
  {
    id: 23,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Ingin otoritas lebih",        P: '*', K: 'D' },
      { text: "Ingin kesempatan baru",        P: 'I', K: '*' },
      { text: "Menghindari konflik",          P: 'S', K: 'S' },
      { text: "Ingin petunjuk, ingin jelas",  P: '*', K: 'C' }
    ]
  },
  {
    id: 24,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Dapat diandalkan, Dapat dipercaya",        P: '*', K: 'S' },
      { text: "Kreatif, Unik",                            P: 'I', K: 'I' },
      { text: "Garis dasar, Orientasi hasil",             P: 'D', K: '*' },
      { text: "Jalankan standar yang tinggi, Akurat",     P: 'C', K: '*' }
    ]
  }
]
},

  PAPI: {
    name: "Tes PAPI Kostick",
    description: "Tes kepribadian yang mengukur kebutuhan psikologis individu",
    time: 1500, // 5 menit
    instruction: "Pilih pernyataan yang lebih menggambarkan diri Anda",
    example: {
      question: "Manakah yang lebih menggambarkan Anda?",
      optionA: "Saya suka bekerja sendiri",
      optionB: "Saya suka bekerja dalam tim",
      answer: "Pilih salah satu yang lebih sesuai dengan Anda",
      explanation: "Tidak ada jawaban benar/salah, pilih yang paling sesuai"
    },
       questions: [
  { id: 1, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya seorang pekerja 'keras'", optionB: "Saya 'bukan' seorang pemurung" },
  { id: 2, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka bekerja lebih baik dari orang lain", optionB: "Saya suka mengerjakan apa yang sedang saya kerjakan, sampai selesai" },
  { id: 3, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka menunjukkan caranya melaksanakan sesuatu hal", optionB: "Saya ingin bekerja sebaik mungkin" },
  { id: 4, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka berkelakar", optionB: "Saya senang mengatakan kepada orang lain, apa yang harus dilakukannya" },
  { id: 5, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka menggabungkan diri dengan kelompok-kelompok", optionB: "Saya suka diperhatikan oleh kelompok-kelompok" },
  { id: 6, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang bersahabat intim dengan seseorang", optionB: "Saya senang bersahabat dengan sekelompok orang" },
  { id: 7, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya cepat berubah bila hal itu diperlukan", optionB: "Saya berusaha untuk intim dengan teman-teman" },
  { id: 8, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka membalas dendam bila saya benar-benar disakiti", optionB: "Saya suka melakukan hal-hal yang baru dan berbeda" },
  { id: 9, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya ingin atasan saya menyukai saya", optionB: "Saya suka mengatakan kepada orang lain, bila mereka salah" },
  { id: 10, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka mengikuti perintah-perintah yang diberikan kepada saya", optionB: "Saya suka menyenangkan hati orang yang memimpin saya" },
  { id: 11, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya mencoba sekuat tenaga", optionB: "Saya seorang yang tertib. Saya meletakkan segala sesuatu pada tempatnya" },
  { id: 12, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya membuat orang lain melakukan apa yang saya inginkan", optionB: "Saya bukan orang yang cepat gusar" },
  { id: 13, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka mengatakan kepada kelompok, apa yang harus dilakukan", optionB: "Saya menekuni satu pekerjaan sampai selesai" },
  { id: 14, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya ingin tampak bersemangat dan menarik", optionB: "Saya ingin menjadi sangat sukses" },
  { id: 15, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka menyelaraskan diri dengan kelompok", optionB: "Saya suka membantu orang lain menentukan pendapatnya" },
  { id: 16, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya cemas kalau orang lain tidak menyukai saya", optionB: "Saya senang kalau orang-orang memperhatikan saya" },
  { id: 17, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka mencoba sesuatu yang baru", optionB: "Saya lebih suka bekerja bersama orang-orang daripada bekerja sendiri" },
  { id: 18, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Kadang-kadang saya menyalahkan orang lain bila terjadi sesuatu kesalahan", optionB: "Saya cemas bila seseorang tidak menyukai saya" },
  { id: 19, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka menyenangkan hati orang yang memimpin saya", optionB: "Saya suka mencoba pekerjaan-pekerjaan baru dan berbeda" },
  { id: 20, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka petunjuk yang terinci untuk melakukan suatu pekerjaan", optionB: "Saya suka mengatakan kepada orang lain bila mereka mengganggu saya" },
  { id: 21, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya selalu mencoba sekuat tenaga", optionB: "Saya senang bekerja dengan sangat cermat dan hati-hati" },
  { id: 22, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya adalah seorang pemimpin yang baik", optionB: "Saya mengorganisir tugas-tugas secara baik" },
  { id: 23, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya mudah menjadi gusar", optionB: "Saya seorang yang lambat dalam membuat keputusan" },
  { id: 24, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang mengerjakan beberapa pekerjaan pada waktu yang bersamaan", optionB: "Bila dalam kelompok, saya lebih suka diam" },
  { id: 25, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang bila diundang", optionB: "Saya ingin melakukan sesuatu lebih baik dari orang lain" },
  { id: 26, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka berteman intim dengan teman-teman saya", optionB: "Saya suka memberikan nasihat kepada orang lain" },
  { id: 27, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka melakukan hal-hal yang baru dan berbeda", optionB: "Saya suka menceritakan keberhasilan saya dalam mengerjakan tugas" },
  { id: 28, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Bila saya benar, saya suka mempertahankan mati-matian", optionB: "Saya suka bergabung dalam suatu kelompok" },
  { id: 29, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya tidak mau berbeda dengan orang lain", optionB: "Saya berusaha untuk sangat intim dengan orang-orang" },
  { id: 30, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka diajari mengenai caranya mengerjakan suatu pekerjaan", optionB: "Saya mudah merasa bosan" },
  { id: 31, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya bekerja keras", optionB: "Saya banyak berpikir dan berencana" },
  { id: 32, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya memimpin kelompok", optionB: "Hal-hal yang kecil (detail) menarik hati saya" },
  { id: 33, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya cepat dan mudah mengambil keputusan", optionB: "Saya meletakkan segala sesuatu secara rapi dan teratur" },
  { id: 34, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Tugas-tugas saya kerjakan secara cepat", optionB: "Saya jarang marah/sedih" },
  { id: 35, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya ingin menjadi bagian dari kelompok", optionB: "Pada suatu waktu tertentu, saya hanya ingin mengerjakan satu tugas saja" },
  { id: 36, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya berusaha untuk intim dengan teman-teman saya", optionB: "Saya berusaha keras untuk menjadi yang terbaik" },
  { id: 37, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya menyukai mode baju baru dan tipe-tipe mobil baru", optionB: "Saya ingin menjadi penanggungjawab bagi orang-orang lain" },
  { id: 38, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka berdebat", optionB: "Saya ingin diperhatikan" },
  { id: 39, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka menyenangkan hati orang yang memimpin saya", optionB: "Saya tertarik menjadi anggota dari suatu kelompok" },
  { id: 40, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka mengikuti aturan secara tertib", optionB: "Saya suka orang-orang mengenal saya benar-benar" },
  { id: 41, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya mencoba sekuat tenaga", optionB: "Saya sangat menyenangkan" },
  { id: 42, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Orang lain beranggapan bahwa saya adalah seorang pemimpin yang baik", optionB: "Saya berpikir jauh ke depan dan terinci" },
  { id: 43, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Seringkali saya memanfaatkan peluang", optionB: "Saya senang memperhatikan hal-hal sampai sekecil-kecilnya" },
  { id: 44, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Orang lain menganggap saya bekerja cepat", optionB: "Orang lain menganggap saya dapat melakukan penataan yang rapi dan teratur" },
  { id: 45, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya menyukai permainan-permainan dan olahraga", optionB: "Saya sangat menyenangkan" },
  { id: 46, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang bila orang-orang dapat intim dan bersahabat", optionB: "Saya selalu berusaha menyelesaikan apa yang telah saya mulai" },
  { id: 47, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka bereksperimen dan mencoba sesuatu yang baru", optionB: "Saya suka mengerjekan pekerjaan-pekerjaan yang sulit dengan baik" },
  { id: 48, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang diperlakukan secara adil", optionB: "Saya senang mengajari orang lain bagaimana caranya mengerjakan sesuatu" },
  { id: 49, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka mengerjakan apa yang diharapkan dari saya", optionB: "Saya suka menarik perhatian" },
  { id: 50, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka petunjuk-petunjuk terinci dalam melaksanakan pekerjaan", optionB: "Saya senang berada bersama dengan orang lain" },
  { id: 51, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya selalu berusaha mengerjakan tugas secara sempurna", optionB: "Orang lain menganggap, saya tidak kenal lelah dalam kerja sehari-hari" },
  { id: 52, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya tergolong tipe pemimpin", optionB: "Saya mudah berteman" },
  { id: 53, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya memanfaatkan peluang", optionB: "Saya banyak berfikir" },
  { id: 54, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya kerja dengan kecepatan yang mantap dan cepat", optionB: "Saya senang mengerjakan hal-hal yang detail" },
  { id: 55, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya memiliki banyak energi untuk permainan dan olahraga", optionB: "Saya menempatkan segala sesuatunya secara rapi dan teratur" },
  { id: 56, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya bergaul baik dengan semua orang", optionB: "Saya pandai mengendalikan diri" },
  { id: 57, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya ingin berkenalan dengan orang baru dan mengerjakan hal baru", optionB: "Saya selalu ingin menyelesaikan pekerjaan yang sudah saya mulai" },
  { id: 58, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Biasanya saya bersikeras mengenai apa yang saya yakini", optionB: "Biasanya saya suka bekerja keras" },
  { id: 59, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya menyukai saran dari orang yang saya kagumi", optionB: "Saya senang mengatur orang lain" },
  { id: 60, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya biarkan orang lain mempengaruhi saya", optionB: "Saya suka menerima banyak perhatian" },
  { id: 61, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Biasanya saya bekerja sangat keras", optionB: "Biasanya saya bekerja cepat" },
  { id: 62, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Bila saya berbicara, kelompok akan mendengarkan", optionB: "Saya terampil mempergunakan alat-alat kerja" },
  { id: 63, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya lambat membina persahabatan", optionB: "Saya lambat dalam mengambil keputusan" },
  { id: 64, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Biasanya saya makan secara cepat", optionB: "Saya suka membaca" },
  { id: 65, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya menyukai pekerjaan yang memungkinkan saya berkeliling", optionB: "Saya menyukai pekerjaan yang harus dilakukan secara teliti" },
  { id: 66, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya berteman sebanyak mungkin", optionB: "Saya dapat menemukan hal-hal yang telah saya pindahkan" },
  { id: 67, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Perencanaan saya jauh ke masa depan", optionB: "Saya selalu menyenangkan" },
  { id: 68, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya merasa bangga akan nama baik saya", optionB: "Saya tetap menekuni satu permasalahan sampai terselesaikan" },
  { id: 69, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka menyenangkan hati orang yang saya kagumi", optionB: "Saya suka menjadi orang yang berhasil" },
  { id: 70, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang bila orang lain mengambil keputusan untuk kelompok", optionB: "Saya suka mengambil keputusan untuk kelompok" },
  { id: 71, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya selalu berusaha sangat keras", optionB: "Saya cepat dan mudah mengambil keputusan" },
  { id: 72, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Biasanya kelompok saya mengerjakan hal-hal yang saya inginkan", optionB: "Biasanya saya tergesa-gesa" },
  { id: 73, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya seringkali merasa lelah", optionB: "Saya lambat dalam mengambil keputusan" },
  { id: 74, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya bekerja secara cepat", optionB: "Saya mudah mendapatkan kawan" },
  { id: 75, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Biasanya saya bersemangat dan bergairah", optionB: "Sebagian besar waktu saya untuk berpikir" },
  { id: 76, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya sangat hangat kepada orang-orang", optionB: "Saya menyukai pekerjaan yang menuntut ketepatan" },
  { id: 77, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya banyak berpikir dan merencanakan", optionB: "Saya melakukan segala sesuatu pada tempatnya" },
  { id: 78, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka tugas yang perlu ditekuni sampai kepada hal sedetailnya", optionB: "Saya tidak cepat marah" },
  { id: 79, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang mengikuti orang-orang yang saya kagumi", optionB: "Saya selalu menyelesaikan pekerjaan yang saya mulai" },
  { id: 80, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya menyukai petunjuk-petunjuk yang jelas", optionB: "Saya suka bekerja keras" },
  { id: 81, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya mengejar apa yang saya inginkan", optionB: "Saya adalah seorang pemimpin yang baik" },
  { id: 82, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya membuat orang lain bekerja keras", optionB: "Saya adalah orang yang gampangan (tidak banyak pertimbangan)" },
  { id: 83, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya membuat keputusan-keputusan secara cepat", optionB: "Bicara saya cepat" },
  { id: 84, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Biasanya saya bekerja tergesa-gesa", optionB: "Secara teratur saya berolahraga" },
  { id: 85, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya tidak suka bertemu dengan orang", optionB: "Saya cepat lelah" },
  { id: 86, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya mempunyai banyak sekali teman", optionB: "Banyak waktu saya untuk berpikir" },
  { id: 87, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka bekerja dengan teori", optionB: "Saya suka bekerja sedetail-detailnya" },
  { id: 88, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka bekerja sampai sedetail-detailnya", optionB: "Saya suka mengorganisir pekerjaan saya" },
  { id: 89, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka meletakkan segala sesuatu pada tempatnya", optionB: "Saya selalu menyenangkan" },
  { id: 90, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang diberi petunjuk mengenai apa yang harus saya lakukan", optionB: "Saya harus menyelesaikan apa yang sudah saya mulai" }
]
  },
BIGFIVE: {
  name: "Tes Big Five Personality",
  description: "Tes kepribadian berdasarkan model lima faktor besar (OCEAN)",
  time: 1800, // 10 menit (ubah sesuai kebutuhan)
  instruction: "Beri penilaian seberapa sesuai pernyataan berikut dengan diri Anda (1 = Sangat Tidak Sesuai, 5 = Sangat Sesuai)",
  example: {
    question: "Saya adalah seseorang yang suka bersosialisasi",
    options: ["1", "2", "3", "4", "5"],
    answer: "Pilih angka yang sesuai",
    explanation: "Tidak ada jawaban benar/salah, pilih yang paling menggambarkan diri Anda"
  },
  questions: [
    // ========== O ========== (1–24)
    { id: 1, text: "Saya memiliki imajinasi yang aktif.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id: 2, text: "Saya tidak tertarik pada seni abstrak.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id: 3, text: "Saya suka mendengarkan ide-ide baru.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id: 4, text: "Saya tidak suka pergi ke museum seni.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id: 5, text: "Saya suka memecahkan teka-teki yang rumit.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id: 6, text: "Puisi memiliki sedikit efek emosional pada saya.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id: 7, text: "Saya penasaran tentang berbagai hal.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id: 8, text: "Saya menghindari film yang membutuhkan pemikiran mendalam.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id: 9, text: "Saya memiliki ide yang cemerlang.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:10, text: "Saya tidak tertarik pada diskusi teoritis.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id:11, text: "Saya suka memikirkan cara-cara baru dalam melakukan sesuatu.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:12, text: "Saya merasa sulit memahami ide-ide abstrak.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id:13, text: "Saya tertarik pada pengetahuan dari berbagai bidang.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:14, text: "Saya tidak suka membaca buku yang menantang.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id:15, text: "Saya suka memecahkan masalah yang kompleks.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:16, text: "Saya lebih suka hal-hal rutin daripada perubahan.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id:17, text: "Saya suka mengeksplorasi ide dan teori baru.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:18, text: "Saya menghindari percakapan filosofis.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id:19, text: "Saya menikmati mencoba makanan baru.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:20, text: "Saya lebih suka kegiatan yang sudah saya kenal.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id:21, text: "Saya suka memikirkan tentang masa depan.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:22, text: "Saya tidak tertarik pada spekulasi tentang alam semesta.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id:23, text: "Saya suka belajar tentang budaya lain.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:24, text: "Saya tidak suka membahas teori ilmiah.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },

    // ========== C ========== (25–48)
    { id:25, text: "Saya selalu siap.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:26, text: "Saya meninggalkan barang-barang saya di mana saja.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:27, text: "Saya memperhatikan detail.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:28, text: "Saya membuat kekacauan.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:29, text: "Saya menyelesaikan tugas tepat waktu.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:30, text: "Saya sering lupa mengembalikan barang ke tempatnya.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:31, text: "Saya suka keteraturan.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:32, text: "Saya cenderung malas.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:33, text: "Saya mengikuti jadwal dengan ketat.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:34, text: "Saya menunda-nunda pekerjaan.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:35, text: "Saya melakukan tugas dengan hati-hati.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:36, text: "Saya menghindari tugas yang sulit.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:37, text: "Saya menyelesaikan apa yang saya mulai.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:38, text: "Saya tidak peduli dengan aturan.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:39, text: "Saya bekerja keras untuk mencapai tujuan saya.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:40, text: "Saya sulit memulai tugas.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:41, text: "Saya sangat teliti dalam pekerjaan saya.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:42, text: "Saya mudah terganggu dari pekerjaan.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:43, text: "Saya membuat rencana dan menaatinya.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:44, text: "Saya sering kehilangan fokus.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:45, text: "Saya menyelesaikan pekerjaan sebelum bersenang-senang.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:46, text: "Saya cenderung tidak teratur.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:47, text: "Saya memenuhi tenggat waktu dengan baik.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:48, text: "Saya mengabaikan tugas yang tidak menyenangkan.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },

    // ========== E ========== (49–72)
    { id:49, text: "Saya adalah jiwa pesta.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:50, text: "Saya tidak banyak bicara.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:51, text: "Saya merasa nyaman di sekitar orang.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:52, text: "Saya menyimpan diri saya sendiri.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:53, text: "Saya memulai percakapan.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:54, text: "Saya tidak suka menjadi pusat perhatian.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:55, text: "Saya banyak bicara.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:56, text: "Saya lebih suka mendengarkan daripada berbicara.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:57, text: "Saya memiliki banyak teman.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:58, text: "Saya merasa tidak nyaman di keramaian.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:59, text: "Saya bersemangat dalam kelompok sosial.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:60, text: "Saya menghindari kontak mata dengan orang asing.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:61, text: "Saya mudah berteman.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:62, text: "Saya membutuhkan banyak waktu untuk diri sendiri.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:63, text: "Saya suka memimpin kelompok.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:64, text: "Saya lebih suka bekerja sendirian.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:65, text: "Saya menikmati pertemuan sosial besar.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:66, text: "Saya merasa lelah setelah bersosialisasi.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:67, text: "Saya suka menjadi pusat perhatian.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:68, text: "Saya tidak suka pesta besar.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:69, text: "Saya energik saat bersama orang lain.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:70, text: "Saya pemalu dengan orang asing.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:71, text: "Saya mudah bergaul dengan orang baru.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:72, text: "Saya lebih suka aktivitas tenang.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },

    // ========== A ========== (73–96)
    { id:73, text: "Saya tertarik pada orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:74, text: "Saya mengolok-olok orang.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:75, text: "Saya bersimpati pada perasaan orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:76, text: "Saya tidak tertarik pada masalah orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:77, text: "Saya memiliki hati yang lembut.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:78, text: "Saya tidak terlalu peduli dengan orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:79, text: "Saya membuat orang merasa nyaman.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:80, text: "Saya menghina orang.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:81, text: "Saya mengasihi orang yang kurang beruntung.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:82, text: "Saya cenderung kritis terhadap orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:83, text: "Saya suka membantu orang.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:84, text: "Saya curiga pada niat orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:85, text: "Saya memaafkan orang yang menyakiti saya.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:86, text: "Saya suka membalas dendam.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:87, text: "Saya percaya pada apa yang orang katakan.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:88, text: "Saya memanipulasi orang untuk mendapatkan keuntungan.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:89, text: "Saya mudah percaya pada orang.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:90, text: "Saya mengeksploitasi orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:91, text: "Saya menghormati orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:92, text: "Saya tidak sabar dengan orang yang tidak efisien.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:93, text: "Saya menghindari konflik.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:94, text: "Saya suka berdebat.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:95, text: "Saya kooperatif dalam kelompok.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:96, text: "Saya suka bersaing daripada bekerja sama.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },

        // ========== N ========== (97–120)
    { id:97,  text: "Saya mudah gugup.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:98,  text: "Saya jarang merasa sedih.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:99,  text: "Saya sering merasa khawatir.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:100, text: "Saya puas dengan diri saya sendiri.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:101, text: "Saya mudah tersinggung.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:102, text: "Saya menangani stres dengan baik.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:103, text: "Saya sering merasa tidak enak hati.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:104, text: "Saya jarang merasa kesal.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:105, text: "Saya sering merasa murung.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:106, text: "Saya percaya diri dalam situasi baru.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:107, text: "Saya terlalu khawatir tentang hal-hal.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:108, text: "Saya merasa nyaman dengan diri sendiri.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:109, text: "Saya mudah panik.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:110, text: "Saya jarang merasa cemas.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:111, text: "Saya sering merasa tegang.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:112, text: "Saya jarang merasa tertekan.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:113, text: "Saya mudah marah.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:114, text: "Saya tetap tenang di bawah tekanan.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:115, text: "Saya merasa tidak aman dalam banyak hal.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:116, text: "Saya jarang merasa takut.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:117, text: "Saya merasa tidak berharga kadang-kadang.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:118, text: "Saya puas dengan hidup saya.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:119, text: "Saya merasa kewalahan dengan mudah.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:120, text: "Saya menikmati sebagian besar aspek hidup saya.", options: ["1","2","3","4","5"], dimension: "N", reverse: true }
  ]
},
SUBJECT: {
    name: "Tes Subjek",
    description: "Tes kemampuan akademik sesuai mata pelajaran pilihan Anda.",
    instruction: "Pilih salah satu subjek di bawah, lalu kerjakan soal yang muncul.",
    subjects: [
      {
  id: "LAMPUNG",
  name: "Bahasa Lampung",
  time: 2700, // 45 menit
  instruction: `
    <div style="margin-bottom:10px;font-size:1.1em;font-weight:600;">
      SOAL REKRUTMEN GURU BAHASA LAMPUNG
    </div>
    <ul style="text-align:left;margin-left:18px;">
      <li>Jawablah setiap pertanyaan dengan jelas dan sistematis.</li>
      <li>Gunakan contoh konkret atau pengalaman yang relevan jika memungkinkan.</li>
      <li><b>Total waktu pengerjaan: 45 menit.</b></li>
    </ul>
    <div style="margin-top:8px;font-weight:600;color:#278d28;">Selamat mengerjakan!</div>
  `,
   questions: [
        { type: "essay", question: "Lampung memiliki berbagai macam upacara adat. Jelaskan salah satu upacara adat yang kamu ketahui, mulai dari prosesi, makna, hingga nilai-nilai yang terkandung di dalamnya!" },
        { type: "essay", question: "Bagaimana pengaruh budaya luar terhadap kebudayaan Lampung saat ini? Berikan contohnya!" },
        { type: "essay", question: "Sebuah sanggar tari di Lampung ingin mementaskan tari Sembah. Apa saja persiapan yang perlu dilakukan dan bagaimana cara mereka melestarikan tarian tersebut agar tetap dikenal oleh generasi muda?" },
        { type: "essay", question: "Jelaskan ciri-ciri bahasa Lampung dialek Abung dan dialek Pesisir!" },
        { type: "essay", question: "Salah satu tantangan dalam mengajar Bahasa dan Budaya Lampung adalah menarik minat siswa terhadap hal yang dianggap sulit. Berikan contoh metode pembelajaran kreatif yang dapat meningkatkan motivasi belajar siswa! Tentukan salah satu topik yang akan dibahas." },
        { type: "essay", question: "Pada saat belajar budaya Lampung, ada beberapa siswa yang cenderung menggangu temannya sehingga pembelajaran tidak kondusif. Bagaimanakan Anda menerapkan disiplin kelas dalam menangani situasi ini, dengan melihat gaya belajar siswa yang beragam, bagaimanakah membuat proses pembelajaran yang berdeferensiasi untuk mengakomodasi kebutuhan siswa." },
        { type: "essay", question: "Jelaskan prinsip-prinsip utama dalam manajemen kelas yang efektif dan bagaimana Anda akan menerapkannya dalam mengajar Bahasa/Budaya Lampung?" },
        { type: "essay", question: "Dalam kelas Anda terdapat siswa dari berbagai latar belakang budaya dan ekonomi yang berbeda. Bagaimana Anda menciptakan lingkungan belajar yang inklusif dan mendukung keberagaman?" },
        { type: "essay", question: "Selain mengajarkan mata pelajaran Budaya Lampung, keterampilan apa yang menurut Anda perlu dikembangkan di sekolah untuk mendukung kesiapan siswa dalam menghadapi tantangan masa depan? Jelaskan bagaimana Anda akan berkontribusi dalam pengembangannya!" },
        { type: "essay", question: "Dewasa ini, teknologi semakin terintegrasi dalam pendidikan. Bagaimana Anda akan memanfaatkan teknologi untuk meningkatkan efektivitas pembelajaran Budaya Lampung di kelas Anda? Berikan contoh aplikasi atau platform yang akan Anda gunakan dan bagaimana Anda akan mengintegrasikannya dalam rencana pembelajaran Anda." }
      ]
    },
      {
      id: "BIOLOGI",
      name: "Biologi",
      time: 2700, // 45 menit
      instruction: `
        <div style="margin-bottom:10px;font-size:1.1em;font-weight:600;">
          SOAL REKRUTMEN GURU BIOLOGI
        </div>
        <ul style="text-align:left;margin-left:18px;">
          <li>Jawablah setiap pertanyaan dengan jelas dan sistematis.</li>
          <li>Gunakan contoh konkret atau pengalaman yang relevan jika memungkinkan.</li>
          <li><b>Total waktu pengerjaan: 45 menit.</b></li>
        </ul>
        <div style="margin-top:8px;font-weight:600;color:#278d28;">Selamat mengerjakan!</div>
      `,
      questions: [
        { type: "essay", question: "Jelaskan secara rinci proses fotosintesis, mulai dari tahap penyerapan cahaya hingga pembentukan glukosa. Sebutkan faktor-faktor yang mempengaruhi fotosintesis dan bagaimana masing-masing faktor tersebut dapat mempengaruhi laju fotosintesis." },
        { type: "essay", question: "Sistem kekebalan tubuh memiliki peran penting dalam melindungi tubuh dari infeksi. Analisis bagaimana sistem kekebalan tubuh mengenali dan merespons antigen, serta bagaimana mekanisme kekebalan humoral dan kekebalan seluler bekerja sama untuk melawan infeksi." },
        { type: "essay", question: "Suatu populasi hewan mengalami isolasi geografis dari populasi aslinya. Setelah beberapa generasi, populasi yang terisolasi tersebut menunjukkan perbedaan morfologi dan perilaku yang signifikan dibandingkan dengan populasi aslinya. Analisis bagaimana isolasi geografis dapat menyebabkan spesiasi, dan faktor-faktor apa saja yang dapat mempengaruhi proses spesiasi tersebut." },
        { type: "essay", question: "Seorang siswa mengalami kesulitan dalam memahami konsep metabolisme karbohidrat. Bagaimana strategi pembelajaran yang akan Anda gunakan untuk membantunya memahami konsep tersebut?" },
        { type: "essay", question: "Pada saat anda mengajar materi pewarisan sifat, ada siswa yang sangat aktif sehingga menggu pembelajaran. Dalam situasi tersebut, bagaimana Anda akan menyesuaikan pembelajaran agar lebih inklusif dan mendukung keberagaman gaya belajar siswa?" },
        { type: "essay", question: "Jelaskan bagaimana Anda menerapkan pendekatan diferensiasi dalam pembelajaran biologi untuk memastikan bahwa setiap siswa dapat mencapai kompetensi yang diharapkan!" },
        { type: "essay", question: "Dalam suatu praktikum biologi, ada beberapa siswa yang tidak mengikuti prosedur keamanan dengan benar meskipun sudah diberikan instruksi sebelumnya. Bagaimana Anda menangani situasi ini agar tetap mendidik namun tetap menjaga disiplin di kelas?" },
        { type: "essay", question: "Dewasa ini, teknologi semakin terintegrasi dalam pendidikan. Bagaimana Anda akan memanfaatkan teknologi untuk meningkatkan efektivitas pembelajaran Biologi di kelas Anda? Berikan contoh aplikasi atau platform yang akan Anda gunakan dan bagaimana Anda akan mengintegrasikannya dalam rencana pembelajaran Anda." },
        { type: "essay", question: "Selain mengajarkan mata pelajaran biologi, keterampilan apa yang menurut Anda perlu dikembangkan di sekolah untuk mendukung kesiapan siswa dalam menghadapi tantangan masa depan? Jelaskan bagaimana Anda akan berkontribusi dalam pengembangannya!" }
      ]
    },
    {
  id: "KIMIA",
  name: "Kimia",
  time: 2700, // 45 menit
  instruction: `
    <div style="margin-bottom:10px;font-size:1.1em;font-weight:600;">
      SOAL REKRUTMEN GURU KIMIA SMA
    </div>
    <ul style="text-align:left;margin-left:18px;">
      <li>Jawablah setiap pertanyaan dengan jelas dan sistematis.</li>
      <li>Gunakan contoh konkret atau pengalaman yang relevan jika memungkinkan.</li>
      <li><b>Total waktu pengerjaan: 45 menit.</b></li>
    </ul>
    <div style="margin-top:8px;font-weight:600;color:#278d28;">Selamat mengerjakan!</div>
  `,
  questions: [
    { type: "essay", question: "Jelaskan bagaimana konsep kesetimbangan kimia dapat diaplikasikan dalam industri! Berikan contoh nyata dan analisis dampaknya terhadap lingkungan." },
    { type: "essay", question: "Sebuah reaksi kimia berlangsung dengan kecepatan yang sangat lambat pada suhu ruang. Sebutkan dan jelaskan tiga cara yang dapat dilakukan untuk meningkatkan laju reaksi tersebut dengan tetap memperhatikan faktor keselamatan laboratorium." },
    { type: "essay", question: "Seorang siswa mengalami kesulitan memahami konsep stoikiometri dalam reaksi pembakaran hidrokarbon. Bagaimana strategi pembelajaran yang akan Anda gunakan untuk membantunya memahami konsep tersebut?" },
    { type: "essay", question: "Dalam kelas Anda terdapat seorang siswa dengan gaya belajar kinestetik yang sulit memahami materi larutan asam dan basa. Bagaimana Anda akan menyesuaikan pembelajaran agar lebih inklusif dan mendukung keberagaman gaya belajar siswa?" },
    { type: "essay", question: "Jelaskan bagaimana Anda menerapkan pendekatan diferensiasi dalam pembelajaran kimia untuk memastikan bahwa setiap siswa dapat mencapai kompetensi yang diharapkan!" },
    { type: "essay", question: "Salah satu tantangan dalam mengajar kimia adalah menarik minat siswa terhadap materi yang dianggap sulit. Berikan contoh metode pembelajaran kreatif berbasis teknologi atau eksperimen sederhana yang dapat meningkatkan motivasi belajar siswa!" },
    { type: "essay", question: "Anda mengajar kelas XII dan hendak mengajarkan materi elektrokimia. Bagaimana Anda mendesain pembelajaran yang interaktif dan membuat siswa lebih tertarik dengan materi tersebut?" },
    { type: "essay", question: "Dalam suatu praktikum kimia, ada beberapa siswa yang tidak mengikuti prosedur keamanan dengan benar meskipun sudah diberikan instruksi sebelumnya. Bagaimana Anda menangani situasi ini agar tetap mendidik namun tetap menjaga disiplin di kelas?" },
    { type: "essay", question: "Jelaskan prinsip-prinsip utama dalam manajemen kelas yang efektif dan bagaimana Anda akan menerapkannya dalam mengajar kimia?" },
    { type: "essay", question: "Dalam kelas Anda terdapat siswa dari berbagai latar belakang budaya dan ekonomi yang berbeda. Bagaimana Anda menciptakan lingkungan belajar yang inklusif dan mendukung keberagaman?" },
    { type: "essay", question: "Sekolah Anda ingin meningkatkan partisipasi siswa dalam kompetisi sains seperti OSN Kimia. Sebagai guru, bagaimana strategi Anda dalam mengidentifikasi, membimbing, dan mengembangkan potensi siswa untuk berprestasi dalam kompetisi tersebut?" },
    { type: "essay", question: "Selain mengajarkan mata pelajaran kimia, keterampilan apa yang menurut Anda perlu dikembangkan di sekolah untuk mendukung kesiapan siswa dalam menghadapi tantangan masa depan? Jelaskan bagaimana Anda akan berkontribusi dalam pengembangannya!" }
  ]
},
    {
  id: "MATH",
  name: "Matematika",
  time: 2700, // 45 menit
  instruction: `
    <div style="margin-bottom:10px;font-size:1.1em;font-weight:600;">
      SOAL REKRUTMEN GURU MATEMATIKA
    </div>
    <ul style="text-align:left;margin-left:18px;">
      <li>Jawablah setiap pertanyaan dengan jelas dan sistematis.</li>
      <li>Gunakan contoh konkret atau pengalaman yang relevan jika memungkinkan.</li>
      <li><b>Total waktu pengerjaan: 45 menit.</b></li>
    </ul>
    <div style="margin-top:8px;font-weight:600;color:#278d28;">Selamat mengerjakan!</div>
  `,
  questions: [
    { type: "essay", question: "Tentukan angka satuan pada bilangan 2^999!" },
    { type: "essay", question: "Nilai dari √(6150^2-6050^2 )= ?" },
    { type: "essay", question: "Kedua akar persamaan kuadrat x^2-111x+k = 0 adalah bilangan prima. Nilai k adalah ..." },
    { type: "essay", question: "Sebuah kapal berlayar dari Pelabuhan A ke Pelabuhan B sejauh 60 mil dengan arah 040° dari A, kemudian berputar haluan dilanjutkan ke Pelabuhan C sejauh 90 mil, dengan arah 160° dari B. Berapa jarak terdekat Pelabuhan A ke Pelabuhan C?" },
    { type: "essay", question: "Dalam sebuah kelas yang jumlah siswanya 40 orang, 22 orang mengikuti IMO, 17 orang mengikuti IBO, dan 20 orang mengikuti ICO. Ada juga yang mengikuti sekaligus dua kegiatan, yaitu 12 orang mengikuti IMO dan IBO, 9 orang mengikuti IMO dan ICO, 8 orang mengikuti IBO dan ICO, sedangkan 5 orang tercatat mengikuti IMO, IBO, dan ICO. Jika dipilih satu orang siswa dari kelas tersebut, maka peluang terpilihnya seorang siswa yang tidak mengikuti IMO, IBO, maupun ICO adalah… ?" },
    { type: "essay", question: "Sebuah toko alat tulis memberi diskon sebesar 20% khusus untuk pelajar. Pada awal tahun ajaran baru, toko memberi diskon tambahan sebesar 10% dari harga yang sudah didiskon. Ahmad adalah seorang pelajar SMA, yang membeli buku dengan harga Rp57.600,00 pada awal tahun ajaran baru. Berapakah harga awal dari buku tersebut?" },
    { type: "essay", question: "Suatu bak air mempunyai 1 keran pengisi bak yaitu x dan 1 keran pengosong yaitu y. Bila keran x dibuka dan keran y ditutup, bak tersebut akan penuh dalam 6 jam. Sedangkan bila y dibuka dan keran x ditutup, maka bak tersebut kosong dalam 8 jam. Berapa waktu yang diperlukan untuk mengisi penuh bak dari keadaan kosong jika kedua keran dibuka?" },
    {
      type: "essay",
      question: `
        Pada sebuah segi empat dibuat lingkaran seperti pada gambar berikut:<br>
        <img src="https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/math_subject_test.jpg" alt="Gambar soal matematika nomor 8" style="max-width:340px;margin:10px 0;border-radius:9px;box-shadow:0 2px 8px #ccc"><br>
        Keliling daerah yang diarsir adalah 100 cm. Luas daerah yang diarsir akan maksimum untuk nilai p =… (dalam π).
      `
    },
    { type: "essay", question: "Sebuah tangki berisi 50000 liter solar. Solar tersebut diisikan pada 5 drum berbentuk tabung dengan tinggi 100 cm dan jari-jari 70 cm. Berapa liter/jam debit solar jika waktu yang dihabiskan untuk mengisi ke-5 drum adalah 1 jam 17 menit? (asumsi tidak ada jeda pengisian)" },
    { type: "essay", question: "Di dalam kelas terdapat berbagai siswa dengan kemampuan yang berbeda, output yang dihasilkan biasanya tidak sesuai yang diharapkan. Perbedaan yang ada akan membuat jarak siswa pintar dan lemah semakin nampak. Desainlah sebuah program pembelajaran dengan topik persamaan trigonometri yang dapat diberikan di kelas dengan berbagai model yang dapat dipahami oleh semua siswa baik siswa yang pintar ataupun yang lemah sehingga tujuan pembelajaran dapat tercapai." }
  ]
}
,
    {
  id: "TIK",
  name: "TIK",
  time: 2700, // 45 menit
  instruction: `
    <div style="margin-bottom:10px;font-size:1.1em;font-weight:600;">
      SOAL REKRUTMEN GURU TIK / KOMPUTER
    </div>
    <ul style="text-align:left;margin-left:18px;">
      <li>Jawablah setiap pertanyaan dengan jelas dan sistematis.</li>
      <li>Gunakan contoh konkret atau pengalaman yang relevan jika memungkinkan.</li>
      <li><b>Total waktu pengerjaan: 45 menit.</b></li>
    </ul>
    <div style="margin-top:8px;font-weight:600;color:#278d28;">Selamat mengerjakan!</div>
  `,
  questions: [
    { type: "essay", question: "Sebagai guru komputer, deskripsikan master plan pelajaran komputer dari tingkat dasar kelas 4 SD hingga tingkat atas 12 SMA/SMK ?" },
    { type: "essay", question: "Ketika ada 3 kelas yang akan mengikuti pelajaran komputer dalam 1 hari, kelas A jam 07.30-09.00, kelas B jam 09.00-10.30, kelas C jam 13.15-14.45. Jumlah siswa di setiap kelas 25 orang, jumlah komputer yang tersedia di lab. Komputer 30 unit. Tindakan apa saja yang dilakukan guru ketika terjadi kerusakan sebuah unit komputer di kelas B ?" },
    {
      type: "essay",
      question: `
        Ketika ada 3 kelas yang akan mengikuti pelajaran komputer dalam 1 hari, kelas A jam 07.30-09.00, kelas B jam 09.00-10.30, kelas C jam 13.15-14.45. Jumlah siswa di setiap kelas 30 orang, jumlah komputer yang tersedia di lab. Komputer 20 unit.<br>
        a. Bagaimana rencana pembelajaran teori hari tersebut?<br>
        b. Bagaimana rencana pembelajaran praktik hari tersebut?<br>
        c. Apa tindakan yang dilakukan jika terjadi kerusakan sebuah unit komputer di kelas B?
      `
    },
    { type: "essay", question: "Ketika proses belajar di lab computer sedang berlangsung, seorang siswa yang sangat aktif menggangu proses belajar sehingga menimbulkan sedikit keributan. Apa tindakan yang sebaiknya dilakukan oleh seorang guru ?" },
    {
      type: "essay",
      question: `
        Salah satu materi pelajaran TIK/ komputer adalah Pengenalan Hardware & Software (Jumlah pertemuan disesuaikan dengan fasilitas, intake siswa & kemampuan gurunya):<br>
        a. Bagaimana rancangan pembelajaran untuk tingkat SD (kelas 4/ 5/ 6)?<br>
        b. Bagaimana rancangan pembelajaran untuk tingkat SMP (kelas 7/ 8/ 9)?<br>
        c. Bagaimana rancangan pembelajaran untuk tingkat SMA (kelas 10/ 11/ 12)?<br>
        d. Bagaimana rancangan pembelajaran untuk tingkat SMK (kelas 10/ 11/ 12)?
      `
    },
    {
      type: "essay",
      question: `
        Salah satu materi pelajaran TIK/ komputer adalah Jaringan Komputer & Internet (Jumlah pertemuan disesuaikan dengan fasilitas, intake siswa & kemampuan gurunya):<br>
        a. Bagaimana rancangan pembelajaran untuk tingkat SD (kelas 4/ 5/ 6)?<br>
        b. Bagaimana rancangan pembelajaran untuk tingkat SMP (kelas 7/ 8/ 9)?<br>
        c. Bagaimana rancangan pembelajaran untuk tingkat SMA (kelas 10/ 11/ 12)?<br>
        d. Bagaimana rancangan pembelajaran untuk tingkat SMK (kelas 10/ 11/ 12)?
      `
    },
    { type: "essay", question: "Jelaskan apakah seorang guru komputer juga harus memiliki kemampuan teknis untuk memperbaiki kerusakan perangkat keras/ perangkat lunak komputer ?" }
  ]
}
,
    {
  id: "OLAHRAGA",
  name: "Olahraga",
  time: 2700, // 45 menit
  instruction: `
    <div style="margin-bottom:10px;font-size:1.1em;font-weight:600;">
      TES TERTULIS SELEKSI GURU OLAHRAGA SEKOLAH SUGAR GROUP
    </div>
    <ul style="text-align:left;margin-left:18px;">
      <li>Waktu Pengerjaan: 45 menit</li>
      <li>Jawablah setiap pertanyaan dengan jelas dan sistematis.</li>
      <li>Gunakan contoh konkret atau pengalaman yang relevan jika memungkinkan.</li>
    </ul>
    <div style="margin-top:8px;font-weight:600;color:#278d28;">Selamat mengerjakan!</div>
  `,
  questions: [
    // Bagian 1: Kompetensi Profesional
    { type: "essay", question: "Jelaskan konsep dasar latihan fisik yang sesuai dengan tingkat perkembangan siswa SD/SMP/SMA!" },
    { type: "essay", question: "Seorang siswa mengalami cedera ringan saat mengikuti pelajaran olahraga. Bagaimana langkah-langkah yang harus Anda lakukan sebagai guru olahraga dalam menangani cedera tersebut?" },
    { type: "essay", question: "Dalam suatu pembelajaran olahraga, bagaimana cara Anda mengidentifikasi dan mengembangkan bakat siswa dalam bidang olahraga tertentu?" },
    // Bagian 2: Keberpihakan pada Murid dalam Proses Pembelajaran
    { type: "essay", question: "Bagaimana cara Anda memastikan bahwa semua siswa, termasuk mereka yang memiliki keterbatasan fisik, dapat berpartisipasi dalam pembelajaran olahraga secara optimal?" },
    { type: "essay", question: "Dalam satu kelas, terdapat siswa dengan tingkat kemampuan fisik yang sangat beragam. Bagaimana strategi Anda agar setiap siswa tetap termotivasi dan merasa dihargai dalam proses pembelajaran?" },
    // Bagian 3: Kreativitas dalam Pembelajaran
    { type: "essay", question: "Sebutkan dan jelaskan tiga metode kreatif yang dapat digunakan dalam pembelajaran olahraga agar siswa lebih termotivasi dan aktif berpartisipasi!" },
    { type: "essay", question: "Buatlah rancangan singkat sebuah permainan olahraga yang menggabungkan unsur edukatif dan kompetitif sehingga menarik bagi siswa!" },
    // Bagian 4: Manajemen Perilaku dalam Pembelajaran
    { type: "essay", question: "Dalam sesi pembelajaran olahraga, bagaimana Anda menangani siswa yang tidak disiplin dan mengganggu jalannya kegiatan?" },
    { type: "essay", question: "Bagaimana cara Anda membangun lingkungan belajar yang positif dan mendukung nilai sportivitas di dalam kelas?" },
    // Bagian 5: Pemahaman Perbedaan Kultur dan Budaya
    { type: "essay", question: "Olahraga sering kali menjadi alat pemersatu dalam masyarakat yang memiliki perbedaan budaya. Bagaimana Anda mengakomodasi keberagaman budaya siswa dalam pembelajaran olahraga di sekolah?" },
    // Bagian 6: Kompetensi Tambahan dan Pengembangan Siswa
    { type: "essay", question: "Bagaimana cara Anda mengidentifikasi dan membimbing siswa berbakat dalam bidang olahraga agar bisa berprestasi di ajang kompetisi seperti O2SN?" },
    { type: "essay", question: "Bagaimana Anda mengintegrasikan aspek kebugaran jasmani ke dalam kegiatan ekstrakurikuler agar tidak hanya berfokus pada kompetisi tetapi juga pada peningkatan kualitas hidup siswa?" }
  ]
}
,
    {
  id: "VISUALART",
  name: "Visual Art",
  time: 2700, // 45 menit
  instruction: `
    <div style="margin-bottom:10px;font-size:1.1em;font-weight:600;">
      SOAL SELEKSI GURU VISUAL ART
    </div>
    <ul style="text-align:left;margin-left:18px;">
      <li>Jawablah setiap pertanyaan dengan jelas dan sistematis.</li>
      <li>Gunakan contoh konkret atau pengalaman yang relevan jika memungkinkan.</li>
      <li><b>Total waktu pengerjaan: 45 menit.</b></li>
    </ul>
    <div style="margin-top:8px;font-weight:600;color:#278d28;">Selamat mengerjakan!</div>
  `,
  questions: [
    // DASAR
    { type: "essay", question: "Apa saja unsur-unsur seni rupa? Jelaskan masing-masing secara singkat saja!" },
    { type: "essay", question: "Apa yang dimaksud dengan garis semu dan bagaimana terjadinya?" },
    { type: "essay", question: "Jelaskan hal apa saja yang Anda ketahui tentang warna!" },
    // KETERAMPILAN MENGAJAR
    { type: "essay", question: "Uraikan bagaimana Anda mengajarkan konsep 'warna' kepada siswa kelas 10 SMA kaitannya dengan STEAM (Sains-Teknologi-Engineering-Art-Math)." },
    { type: "essay", question: "Bagaimana Anda mengelola penilaian atas kinerja siswa dalam pembelajar seni rupa?" },
    { type: "essay", question: "Apa yang Anda lakukan atas fakta bahwa tidak semua siswa punya ketertarikan dan keterampilan atas seni rupa? Hal apa pula yang Anda lakukan terhadap siswa yang mempunyai bakat dan ketertarikan yang tinggi atas seni rupa?" },
    { type: "essay", question: "Terkait dengan perkembangan teknologi, software atau aplikasi apa saja yang Anda kuasai dan yang akan Anda terap/ajarkan pada beberapa bagian pembelajaran seni rupa?" },
    // PENGETAHUAN UMUM
    { type: "essay", question: "Apa yang dimaksud dengan kurikulum? Kurikulum apa saja yg Anda ketahui dan pernah diterapkan di Indonesia?" },
    { type: "essay", question: "Bagaimana Anda akan mengintegrasikan penekanan atas pentingnya pembentukan nilai-nilai dan karakter yang baik dalam pembelajaran seni rupa?" },
    // PRAKTIK
    { type: "essay", question: "Pada selembar kertas, buatlah gambar rumah sederhana dengan menerapkan prinsip ‘2 titik hilang’." }
  ]
}
,
   {
  id: "PRIMARY",
  name: "Primary",
  time: 2700, // 45 menit
  instruction: `
    <div style="margin-bottom:10px;font-size:1.1em;font-weight:600;">
      TES TERTULIS SELEKSI GURU SD (GURU KELAS)
    </div>
    <ul style="text-align:left;margin-left:18px;">
      <li>Jawablah setiap pertanyaan dengan jelas dan sistematis.</li>
      <li>Gunakan contoh konkret atau pengalaman yang relevan jika memungkinkan.</li>
      <li><b>Total waktu pengerjaan: 45 menit.</b></li>
    </ul>
    <div style="margin-top:8px;font-weight:600;color:#278d28;">Selamat mengerjakan!</div>
  `,
  questions: [
    // 1. Pertanyaan Konseptual
    { type: "essay", question: `Jelaskan apa yang dimaksud dengan "pembelajaran yang memerdekakan" dalam konteks Kurikulum Merdeka dan bagaimana peran guru dalam pembelajaran yang memerdekakan?` },
    // 2. Studi Kasus: Keragaman Budaya Indonesia
    { type: "essay", question: `Anda adalah seorang guru kelas 3 SD. Tema yang akan Anda ajarkan adalah "Keragaman Budaya Indonesia".<br>
      <b>Tujuan pembelajaran:</b><br>
      • Siswa dapat mengidentifikasi berbagai macam budaya yang ada di Indonesia (misalnya, pakaian adat, tarian, lagu daerah, makanan khas).<br>
      • Siswa dapat menjelaskan pentingnya melestarikan keragaman budaya Indonesia.<br>
      • Siswa termotivasi untuk mempelajari lebih lanjut tentang budaya Indonesia.<br>
      <br>
      <b>Pertanyaan:</b><br>
      Bagaimana anda mendesain kegiatan pembelajaran yang kreatif dan inovatif untuk mencapai tujuan pembelajaran di atas? Kegiatan tersebut harus berpusat pada siswa (student-centered), melibatkan siswa secara aktif, menggunakan berbagai media dan sumber belajar, menyenangkan dan memotivasi siswa, serta mengembangkan kompetensi siswa (pengetahuan, keterampilan, sikap).`
    },
    // 3. Studi Kasus: Andi, Siswa dengan Disleksia
    { type: "essay", question: `Andi adalah siswa kelas 3 SD yang sangat antusias dan aktif di kelas. Dia memiliki banyak teman dan suka berpartisipasi dalam kegiatan kelompok. Namun, Andi mengalami kesulitan dalam membaca dan menulis. Dia seringkali tertukar huruf, sulit mengeja kata-kata sederhana, dan membutuhkan waktu lebih lama untuk menyelesaikan tugas-tugas yang melibatkan membaca dan menulis. Berdasarkan observasi dan asesmen yang dilakukan guru, Andi diduga mengalami disleksia.<br>
      <br>
      <b>Pertanyaan:</b> Akomodasi dan modifikasi apa yang akan Anda berikan kepada Andi dalam kegiatan pembelajaran di kelas?`
    },
    // 4. Studi Kasus: Rina, Siswa yang Sering Mengganggu Teman
    { type: "essay", question: `Rina adalah siswa kelas 4 SD yang pintar dan kreatif. Namun, dia seringkali melakukan perundungan dengan mencubit, mendorong, atau mengejek teman-temannya, sehingga membuat mereka merasa tidak nyaman dan terganggu. Perilaku Rina ini sudah berlangsung cukup lama dan tampaknya semakin sering terjadi.<br>
      <br>
      <b>Pertanyaan:</b> Bagaimana Anda akan mengidentifikasi dan memahami akar penyebab perilaku Rina yang suka melakukan perundungan teman-temannya dan strategi apa yang akan Anda gunakan untuk mengatasi perilaku Rina yang mengganggu teman-temannya?`
    },
    // 5. Pertanyaan Konseptual: Asesmen
    { type: "essay", question: `Jelaskan apa yang dimaksud dengan asesmen formatif dan sumatif, serta berikan contohnya dalam konteks pembelajaran di kelas SD.` },
    // 6. Pertanyaan Reflektif: Peran Guru
    { type: "essay", question: `Bagaimana Anda memahami peran guru dalam konteks pendidikan abad ke-21?` }
  ]
}
,
    {
  id: "KINDERGARTEN",
  name: "Kindergarten",
  time: 2700, // 45 menit
  instruction: `
    <div style="margin-bottom:10px;font-size:1.1em;font-weight:600;">
      TES TERTULIS SELEKSI GURU TAMAN KANAK-KANAK (TK)
    </div>
    <ul style="text-align:left;margin-left:18px;">
      <li>Jawablah setiap pertanyaan dengan jelas dan sistematis.</li>
      <li>Gunakan contoh konkret atau pengalaman yang relevan jika memungkinkan.</li>
      <li><b>Total waktu pengerjaan: 45 menit.</b></li>
    </ul>
    <div style="margin-top:8px;font-weight:600;color:#278d28;">Selamat mengerjakan!</div>
  `,
  questions: [
    { type: "essay", question: `Siswa/i Taman Kanak-kanak dapat melakukan kegiatan pembelajaran yang menekankan pada pembelajaran yang kontekstual, berbasis kompetensi dan berfokus pada pengembangan pribadi dan sosial mereka.<br>
      Jelaskan integrasi antara kurikulum merdeka dengan pembelajaran di Taman Kanak-kanak yang dapat diaplikasikan anda dengan keunikan karakteristik dari siswa/i yang orang tua mereka memiliki tingkat Pendidikan beragam!` },
    { type: "essay", question: `Banyak teori tentang metode pembelajaran yang dapat meningkatkan kreatifitas siswa.<br>
      Jabarkan pendapat anda mengenai metode pembelajaran yang tepat untuk diterapkan sehingga mampu meningkatkan kreatifitas siswa/i Taman Kanak-kanak yang dapat memacu motivasi dan kompetensi siswa!` },
    { type: "essay", question: `Setiap anak memiliki kebutuhan uniknya sendiri.<br>
      Bagaimana cara anda untuk menangani anak berkebutuhan khusus yang berkisar dari gangguan perkembangan seperti autism, ADHD, hingga kesulitan belajar untuk siswa/i Taman Kanak-kanak?` },
    { type: "essay", question: `Perilaku siswa/i Taman Kanak-kanak dapat diobservasi, diukur dan dipelajari melalui interaksi dengan lingkungan sekitarnya.<br>
      Bagaimana manajemen perilaku siswa yang dapat anda kelola sehingga siswa/i Taman Kanak-kanak dapat meningkatkan disiplin, respon dan ketaatan atau perilaku baik lainnya?` },
    { type: "essay", question: `Apa kompetensi yang dapat anda berikan untuk mengembangkan sekolah terkhusus Taman Kanak-kanak!` },
    { type: "essay", question: `Apa yang kamu anggap sebagai keberhasilan terbesarmu sebagai seorang guru?` }
  ]
}
,
   {
  id: "INDO",
  name: "Bahasa Indonesia",
  time: 2700, // 45 menit
  instruction: `
    <div style="margin-bottom:10px;font-size:1.1em;font-weight:600;">
      TES TERTULIS SELEKSI GURU BAHASA INDONESIA
    </div>
    <ul style="text-align:left;margin-left:18px;">
      <li>Bacalah kasus yang disajikan dan jawablah dengan jelas!</li>
      <li>Gunakan contoh konkret atau pengalaman yang relevan jika memungkinkan.</li>
      <li><b>Total waktu pengerjaan: 45 menit.</b></li>
    </ul>
    <div style="margin-top:8px;font-weight:600;color:#278d28;">Selamat mengerjakan!</div>
  `,
  questions: [
    // I. Kasus Kelas VIII C
    { type: "essay", question: `Bapak Doni adalah wali kelas VIII C yang berjumlah 24 orang dengan kemampuan belajar yang beragam. Beberapa diantara mereka adalah siswa yang pintar, aktif, antusias dan cekatan. Sehingga tugas yang diberikan selalu dikumpulkan lebih cepat dari waktu yang diberikan. Dan kemudian kelas menjadi ramai. Sementara beberapa murid masih belum selesai mengerjakan dan terganggu akan kondisi kelas yang ramai.<br>
    <br>
    Melihat situasi tersebut, bagaimana tindakan Bapak Doni?` },
    // II. Pembelajaran Diferensiasi
    { type: "essay", question: `Anda adalah seorang guru mata pelajaran Bahasa Indonesia yang mengajar di kelas VI dengan jumlah peserta didik sebanyak 30 orang. Setelah melakukan observasi awal dan beberapa penilaian formatif, Anda menyadari bahwa kemampuan peserta didik sangat beragam. Di kelas tersebut, terdapat beberapa peserta didik yang masih kesulitan memahami teks sederhana, beberapa lainnya mampu membaca dan memahami teks dengan baik, sementara ada juga yang sudah sangat mahir, bahkan menunjukkan kemampuan untuk menganalisis teks yang lebih kompleks dan melakukan penelitian mandiri.<br>
    Selama pelajaran sebelumnya, Anda menggunakan metode pengajaran yang sama untuk seluruh kelas. Namun, Anda melihat bahwa beberapa peserta didik merasa bosan karena tugas terlalu mudah, sementara beberapa lainnya merasa kewalahan dan kesulitan mengikuti pelajaran.<br>
    <br>
    Karena itulah, Anda memutuskan untuk menerapkan pembelajaran diferensiasi. Tujuannya adalah agar setiap peserta didik mendapatkan tantangan yang sesuai dengan kemampuan mereka, dan semua peserta didik dapat berkembang optimal.<br>
    <ol style="margin-left:20px;">
      <li>Bagaimana Anda mengidentifikasi kemampuan awal peserta didik untuk menentukan kelompok diferensiasi yang sesuai?</li>
      <li>Bagaimana Anda memastikan setiap peserta didik mendapatkan tantangan yang sesuai dengan kemampuannya?</li>
      <li>Bagaimana Anda menilai keberhasilan pembelajaran diferensiasi yang Anda terapkan?</li>
    </ol>
    `},
    // III. Kasus Ibu Retno
    { type: "essay", question: `Ibu Retno adalah guru mata pelajaran matematika kelas XB. Ibu Retno baru saja masuk setelah cuti melahirkan. Ibu Retno beberapa kali dalam 1 minggu terlambat datang ke sekolah. Di dalam kelas ia sering memarahi murid tanpa alasan yang jelas. Saat wakil kepala sekolah menegur, ia terlihat sedih dan menangis.<br>
    <ol style="margin-left:20px;">
      <li>Bagaimana pendapat Anda atas sikap dan perilaku Ibu Retno?</li>
      <li>Jika Anda pada posisi Ibu Retno, bagaimana sikap dan solusi yang harus Anda lakukan?</li>
    </ol>
    `},
    // IV. Kelebihan
    { type: "essay", question: `Apakah kelebihan lain yang Anda miliki? Bagaimana cara Anda membagikan kelebihan Anda pada murid?` },
    // V. Pengalaman Mengajar
    { type: "essay", question: `Tuliskan pengalaman Anda selama mengajar. Apakah pengalaman yang paling mengesankan? Pernahkah Anda menghadapi masalah dan bagaimana mengatasinya?` }
  ]
}
,
    {
  id: "FISIKA",
  name: "Fisika",
  time: 2700, // 45 menit
  instruction: `
    <div style="margin-bottom:10px;font-size:1.1em;font-weight:600;">
      TERUNTUK GURU FISIKA YANG biasanya LUCU DAN DIRINDUKAN SISWA
    </div>
    <ul style="text-align:left;margin-left:18px;">
      <li>Bagaimana kabar anda pak guru / bu guru? Semoga sebahagia kami yang membagikan lembar kertas ini.</li>
      <li>Oiya, nanti anda akan bertemu pertanyaan-pertanyaan, nah… anda tidak perlu menulis ulang pertanyaannya, maka sebaiknya anda jawab semua, yaa 😊</li>
      <li>Supaya potensi anda muncul maksimal, anda tidak perlu menggunakan HP untuk menjawab pertanyaan ini, yang pasti gunakan tangan dan pena/pulpen/pensil…😁 (eits…. Gabawa? Waduuh)</li>
      <li>Supaya mas dan mbak penilai bisa yakin, dan akhirnya memilih anda untuk diterima, tambahkan berbagai pengalaman yang pernah anda lakukan sesuai pertanyaan yang ada….</li>
      <li>Nah, sampai disini ada pertanyaan? ………….JANGAN! ……kami yang Tanya… kan ini ..tes.. 😊</li>
      <li><b>Total waktu pengerjaan: 45 menit.</b></li>
    </ul>
    <div style="margin-top:8px;font-weight:600;color:#278d28;">Selamat mengerjakan!</div>
    <div style="margin-top:10px;font-size:0.97em;color:#888;font-style:italic;">
      “Cahaya tetap berdifraksi dan berinterferensi, walau Snellius dan Huygens tidak menceritakan Alhazen” ~ Nur
    </div>
  `,
  questions: [
    { type: "essay", question: "Mas, mbak, teh, aa’, bang, non, …. FISIKA itu belajar apa yak? Trus, buat apa kita belajar fisika inii?" },
    { type: "essay", question: "Mas, mbak, katanya fisika tu ada yang modern, ada juga fisika klasik. Jelasin se-clear-clear nya" },
    { type: "essay", question: `Lagi nih, waktu itu, ada yang namanya Isaac Newton, yang lagi di bawah pohon apel, kalo ga salah. Trus beliau merumuskan hukum Fisika. Ada 3 ya? Bagaimana cerita ini?<br>
      Lalu rangkailah sebuah soal beserta kemungkinan jawabannya yang menggunakan 3 hukum Newton` },
    { type: "essay", question: "Selanjutnya, Fisika sangat erat kaitannya dengan matematika. Konsep-konsep matematika apa saja yang diperlukan dalam fisika serta topik fisika yang mana yang menerapkan konsep matematika itu?" },
    { type: "essay", question: "Alat ukur dalam Fisika sangat penting. Alat ukur apa saja yang digunakan dalam fisika, untuk mengukur apa dengan satuan apa saja, dan bagaimana cara menggunakannya? Urutkan jawaban anda dari yang paling jarang digunakan hingga yang paling sering digunakan." },
    { type: "essay", question: "Pada fisika tentang kinematika gerak, variabel utama apa yang perlu dijelaskan kepada siswa? Bagaimana anda menjelaskan materi ini secara lengkap dan menyeluruh agar siswa memahami dengan tuntas" },
    { type: "essay", question: "Berikutnya, tentang energi. Energi ini tidak terlihat, tetapi merupakan salah satu materi inti dalam fisika. Bagaimana anda mengadakan pembelajan ini agar menjadi unik dan menarik" },
    { type: "essay", question: "Nah, beberapa materi Fisika sangat berkaitan dengan mata pelajaran lain, seperti teori kinetik gas, listrik dinamis, mekanika fluida, fisika inti, gelombang dan banyak materi lain. Ceritakan bagaimana suatu skenario pembelajaran yang mengolaborasikan fisika pada satu materi tertentu dengan mata pelajaran lain sehingga tampak kerjasama anda dengan mata pelajaran lain tersebut" },
    { type: "essay", question: "Mas, mbak, saat belajar fisika, terkadang ada siswa yang sangat antusias, sering memberi peran dalam kelas, ada yang mengabaikan, ada yang hanya diam, ada yang merespon dengan destruktif, ada juga yang berperilaku lain. Nah, ceritakan pengalaman anda mengatasi hal ini." },
    { type: "essay", question: "Bagian penting lainnya, gimana caranya bikin kelas anda menjadi kelas yang semua siswanya dan semua warga sekolah memiliki penghargaan yang tinggi terhadap perbedaan dalam segala hal." },
    { type: "essay", question: "Bagian yang menantang nih. Dua bulan lagi anda akan membawa beberapa siswa ke olimpiade fisika. Bagaimana cara anda?" },
    { type: "essay", question: "Terakhir, nih… beberapa tahun ke depan siswa akan menghadapi tantangan sesuai era mereka. Nah, jelaskan bagaimana anda memberikan bekal keterampilan yang membuat siswa siap menghadapi tantangan masa depan." }
  ]
}
,
    {
  id: "ISLAM",
  name: "Agama Islam",
  time: 2700, // 45 menit
  instruction: `
    <div style="margin-bottom:10px;font-size:1.1em;font-weight:600;">
      SOAL REKRUTMEN GURU AGAMA ISLAM
    </div>
    <ul style="text-align:left;margin-left:18px;">
      <li>Jawablah setiap pertanyaan dengan jelas dan sistematis.</li>
      <li>Gunakan contoh konkret atau pengalaman yang relevan jika memungkinkan.</li>
      <li><b>Total waktu pengerjaan: 45 menit.</b></li>
    </ul>
    <div style="margin-top:8px;font-weight:600;color:#278d28;">Selamat mengerjakan!</div>
  `,
  questions: [
    { type: "essay", question: "Tuliskanlah bacaan takhiat awal dalam sholat menggunakan tulisan arab." },
    { type: "essay", question: "Jelaskan secara sistematis urutan sholat jenasah berikut laval/bacaan yang harus diucapkan." },
    { type: "essay", question: "Analisislah kompetensi dasar pada kurikulum PAI tingkat SMP kelas VIII tentang materi 'Menghindari Perilaku Tercela'. Bagaimana Anda akan mengembangkan indikator pencapaian kompetensi dan materi pembelajaran yang relevan dengan konteks kehidupan siswa saat ini?!" },
    { type: "essay", question: "Analisislah makna dan pesan yang terkandung dalam Q.S. Al-Hujurat ayat 13 tentang keragaman umat manusia. Bagaimana Anda akan menjelaskan ayat ini kepada siswa dengan latar belakang budaya yang beragam?" },
    { type: "essay", question: "Bagaimana cara anda menganalisa tentang isu-isu yang sedang marak di kalangan siswa, seperti perundungan, penyalahgunaan media sosial, dan radikalisme dalam perspektif ajaran Islam?" },
    { type: "essay", question: "Seorang siswa Anda seringkali terlambat datang ke sekolah dan menunjukkan sikap kurang hormat selama pelajaran. Setelah Anda telusuri, ternyata siswa tersebut mengalami masalah keluarga. Bagaimana Anda akan menangani situasi ini dengan pendekatan yang empatik dan sesuai dengan prinsip-prinsip pendidikan Islam?" },
    { type: "essay", question: "Di sekolah Anda, terdapat perbedaan pendapat antara guru-guru PAI mengenai pelaksanaan suatu praktik ibadah. Bagaimana Anda akan memfasilitasi dialog yang konstruktif untuk mencapai kesepahaman bersama?" },
    { type: "essay", question: "Dalam era digital, penggunaan teknologi dalam pembelajaran PAI menjadi suatu keniscayaan. Namun, ada kekhawatiran tentang dampak negatif penggunaan gawai terhadap akhlak siswa. Bagaimana Anda akan mengintegrasikan teknologi dalam pembelajaran PAI secara bijak dan bertanggung jawab?" },
    { type: "essay", question: "Di kelas Anda terdapat siswa dengan beragam latar belakang agama dan budaya. Bagaimana anda akan menciptakan suasana pembelajaran yang inklusif dan menghargai perbedaan, serta menanamkan nilai-nilai toleransi dalam diri siswa?" }
  ]
}
,
    { id: "KRISTEN",      name: "Agama Kristen",       time: 900, questions: [] },
    { id: "KATHOLIK",     name: "Agama Katholik",      time: 900, questions: [] },
    { id: "HINDU",        name: "Agama Hindu",         time: 900, questions: [] },
    { id: "SOSIAL",       name: "Sosial",              time: 900, questions: [] },
    { id: "SEJARAH",      name: "Sejarah",             time: 900, questions: [] },
    { id: "IPA",          name: "IPA",                 time: 900, questions: [] },
    { id: "INGGRIS",      name: "Bahasa Inggris",      time: 900, questions: [] }
  ]
}
};
// ============ DISKUALIFIKASI TAB TES SUBJEK ============
let subjectCheatFlag = false;
let allowTabOutSubject = false;

function onSubjectBlur() {
  if (appState.subjectSelected && !allowTabOutSubject) {
    subjectCheatFlag = true;
    clearInterval(window.subjectTimerInterval); // stop timer
    appState.subjectSelected = null;
    appState.subjectDisqualified = true;
    document.getElementById('app').innerHTML = `
      <div class="card" style="max-width:480px;margin:80px auto;padding:32px 25px 35px 25px;border-radius:17px;text-align:center;">
        <div style="font-size:2.3em;margin-bottom:13px;">❌</div>
        <h2 style="color:#c91b1b;margin-bottom:13px;">Diskualifikasi!</h2>
        <div style="font-size:1.09em;margin-bottom:24px;">
          Anda terdeteksi membuka tab/jendela lain saat mengerjakan tes subjek.<br>
          Mohon hubungi panitia jika ada kendala.
        </div>
        <button class="btn btn-danger" style="padding:12px 46px;font-size:1.15em;" onclick="logoutDiskualifikasi()">🔒 Logout</button>
      </div>
    `;
  }
}

// Fungsi logout khusus diskualifikasi
function logoutDiskualifikasi() {
  localStorage.setItem('usedPragas', '1'); // Password jadi "pragass"
  localStorage.removeItem('identity');     // Hapus data user
  setTimeout(() => {
    location.reload();
  }, 250);
}


window.addEventListener('blur', onSubjectBlur);
function renderSubjectTestHome() {
  const subs = tests.SUBJECT.subjects;
  document.getElementById('app').innerHTML = `
    <div class="card" style="
      max-width:750px;
      margin:60px auto 0 auto;
      padding:42px 30px 48px 30px;
      border-radius:30px;
      background:#fff;
      box-shadow:0 8px 48px #d2e6e870, 0 2px 14px #f0f5f540;
      ">
      <div style="text-align:center;">
        <h2 style="
          font-family:'Playfair Display',serif;
          font-size:2.5em;
          font-weight:900;
          color:#244056;
          margin-bottom:5px;
          letter-spacing:0.5px;
        ">${tests.SUBJECT.name}</h2>
        <div style="color:#277849;font-size:1.16em;font-weight:600;margin-bottom:5px;">
          ${tests.SUBJECT.description}
        </div>
        <div style="
          display:inline-block;
          margin:12px auto 26px auto;
          padding:11px 23px;
          background:linear-gradient(90deg,#e4f7ef 80%,#e6f2fb 100%);
          border-radius:12px;
          font-size:1.08em;
          color:#155773;
          box-shadow:0 1px 8px #e0efe9b8;
        ">
          ${tests.SUBJECT.instruction}
        </div>
      </div>
      <div style="
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(165px,1fr));
        gap:20px 28px;
        margin-top:12px;
        padding:6px 0 2px 0;
      ">
        ${subs.map(subj => `
          <button class="btn" style="
            width:100%;
            min-width:0;
            padding:18px 0 13px 0;
            font-size:1.18em;
            font-weight:700;
            color:#195746;
            background:linear-gradient(98deg,#f7fbf9 0%,#d6f8ef 100%);
            border-radius:15px;
            border:none;
            outline:none;
            box-shadow:0 2px 14px #e7f3e880;
            transition:box-shadow 0.18s,background 0.18s;
            cursor:pointer;
          " onmouseover="this.style.background='#e5f5ed'" onmouseout="this.style.background='linear-gradient(98deg,#f7fbf9 0%,#d6f8ef 100%)'"
          onclick="startSubjectTest('${subj.id}')">
            ${subj.name}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}


// Render instruksi awal
function startSubjectTest(subjId) {
  const subj = tests.SUBJECT.subjects.find(s => s.id === subjId);
  if (!subj) return alert("Subjek tidak ditemukan!");
  appState.subjectSelected = subjId;
  appState.subjectStartTime = Date.now();
  appState.timeLeft = subj.time || 2700; // 45 menit

  // Tampilkan instruksi dulu
  if (subj.instruction) {
    document.getElementById('app').innerHTML = `
      <div class="card" style="max-width:600px;margin:40px auto 0;padding:28px 20px;border-radius:20px;text-align:left;">
        <div>${subj.instruction}</div>
        <div style="text-align:center;margin-top:26px;">
          <button class="btn" onclick="renderSubjectQuestionSlide(0)">Mulai</button>
        </div>
      </div>
    `;
    return;
  }
  renderSubjectQuestionSlide(0);
}

// Render soal per slide
function renderSubjectQuestionSlide(qIdx) {
  allowTabOutSubject = false; // Diskualifikasi aktif!
  const subj = tests.SUBJECT.subjects.find(s => s.id === appState.subjectSelected);
  if (!subj) return;

  // Timer di atas
  let m = Math.floor(appState.timeLeft / 60), s = appState.timeLeft % 60;
  let timerHTML = `<span id="subject-timer">${(m<10?"0":"")+m}:${(s<10?"0":"")+s}</span>`;

  // Nomor & soal
  const q = subj.questions[qIdx];
  document.getElementById('app').innerHTML = `
    <div class="card" style="max-width:650px;margin:40px auto 0;padding:32px 18px 30px 18px;border-radius:18px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="margin-bottom:0;">${subj.name}</h2>
        <div style="font-size:1.05em;background:#f2fbe5;padding:7px 16px;border-radius:9px;">${timerHTML}</div>
      </div>
      <div style="margin:14px 0 17px 0;font-weight:500;font-size:1.05em;">
        Kerjakan soal berikut di kertas Anda lalu klik <b>Lanjut</b>!
      </div>
      <div style="font-size:1.3em;font-weight:700;color:#3d4f7c;margin-bottom:12px;">
        Soal ${qIdx + 1}
      </div>
      <div style="font-size:1.14em;margin-bottom:34px;min-height:100px;">
        ${q.question}
        ${q.type === "multiple-choice"
          ? `<div style="margin-top:16px;font-size:1em;">${q.options.map(opt => `<div style="margin:2px 0 2px 18px;">${opt}</div>`).join("")}</div>`
          : ""}
      </div>
      <div style="display:flex;justify-content:${qIdx===0?'flex-end':'space-between'}">
        ${qIdx > 0 ? `<button class="btn btn-outline" onclick="renderSubjectQuestionSlide(${qIdx-1})">Sebelumnya</button>` : ""}
        <button class="btn" onclick="nextSubjectQuestionSlide(${qIdx})">${qIdx === subj.questions.length-1 ? 'Selesai & Upload' : 'Lanjut'}</button>
      </div>
    </div>
  `;
  startSubjectCountdown();
}

function nextSubjectQuestionSlide(qIdx) {
  const subj = tests.SUBJECT.subjects.find(s => s.id === appState.subjectSelected);
  if (!subj) return;
  if (qIdx < subj.questions.length-1) {
    renderSubjectQuestionSlide(qIdx+1);
  } else {
    renderSubjectUpload();
  }
}

// TIMER
function startSubjectCountdown() {
  if (window.subjectTimerInterval) clearInterval(window.subjectTimerInterval);
  window.subjectTimerInterval = setInterval(function() {
    appState.timeLeft--;
    let m = Math.floor(appState.timeLeft / 60), s = appState.timeLeft % 60;
    const timer = document.getElementById('subject-timer');
    if (timer) timer.textContent = (m<10?"0":"")+m+":"+(s<10?"0":"")+s;
    if (appState.timeLeft <= 0) {
      clearInterval(window.subjectTimerInterval);
      renderSubjectUpload();
    }
  }, 1000);
}

// ==== UPLOAD JAWABAN TES SUBJEK (Drag & Drop/Click + Preview Multi Gambar) ====
function renderSubjectUpload() {
  allowTabOutSubject = true; // Upload: Boleh buka tab!
  if (window.subjectTimerInterval) clearInterval(window.subjectTimerInterval);
  document.getElementById('app').innerHTML = `
    <div class="card" style="max-width:540px;margin:44px auto;padding:32px 19px 34px 19px;border-radius:17px;text-align:center;">
      <h2>Upload Foto Jawaban</h2>
      <div style="margin:14px 0 24px 0;">Upload foto lembar jawaban kertas Anda di sini.<br>
        Bisa lebih dari 3 gambar (<b>klik</b> atau <b>drag dari WA</b> ke area bawah).</div>
      <div id="drop-area" style="border:2px dashed #83c980;border-radius:12px;padding:28px 12px;cursor:pointer;background:#f6fff3;">
        <input type="file" id="subject-upload-multi" accept="image/*" multiple style="display:none;">
        <div style="color:#789;font-size:1.08em;">Klik di sini atau drag gambar ke area ini</div>
        <div id="subject-upload-preview" style="margin-top:16px;display:flex;flex-wrap:wrap;justify-content:center;gap:11px;"></div>
      </div>
      <button class="btn" style="margin-top:28px;padding:12px 38px;" onclick="selesaiSubjectUpload()">Selesai</button>
    </div>
  `;

  // Variabel untuk simpan file dan base64 preview
  let gambarList = [];
  let base64List = [];

  // DOM element
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('subject-upload-multi');
  const previewDiv = document.getElementById('subject-upload-preview');

  dropArea.addEventListener('click', () => fileInput.click());
  dropArea.addEventListener('dragover', e => {
    e.preventDefault(); dropArea.style.background = "#eaffd5";
  });
  dropArea.addEventListener('dragleave', e => {
    e.preventDefault(); dropArea.style.background = "#f6fff3";
  });
  dropArea.addEventListener('drop', e => {
    e.preventDefault(); dropArea.style.background = "#f6fff3";
    let files = [];
    if (e.dataTransfer.items) {
      for (let item of e.dataTransfer.items) {
        if (item.kind === "file") files.push(item.getAsFile());
      }
    } else {
      files = Array.from(e.dataTransfer.files);
    }
    handleFiles(files);
  });
  fileInput.addEventListener('change', e => {
    handleFiles(e.target.files);
  });

 function handleFiles(files) {
  Array.from(files)
    .filter(f => f.type.startsWith("image/"))
    .forEach(file => {
      const reader = new FileReader();
      reader.onload = evt => {
        gambarList.push(file);
        base64List.push(evt.target.result);
        showPreview();
        // === SIMPAN KE appState ===
        if (!appState.completed) appState.completed = {};
        appState.completed.SUBJECT = true; // Ini penting biar dianggap selesai!
        appState.subjectUpload = base64List.slice(); // Simpan base64 untuk PDF
      };
      reader.readAsDataURL(file);
    });
}


  function showPreview() {
    previewDiv.innerHTML = "";
    base64List.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.style = "max-width:130px;max-height:95px;border-radius:10px;box-shadow:0 3px 15px #c5e5b990;margin:2px;";
      previewDiv.appendChild(img);
    });
  }
}

// ======= Fungsi setelah upload (Wajib Ditaruh di Bawah) =======
function selesaiSubjectUpload() {
  // 1) Tandai Tes Subjek selesai (opsional jika pakai sistem penanda)
  if (typeof window.markTestCompleted === 'function') {
    markTestCompleted('SUBJEK');
  } else {
    window.appState = window.appState || {};
    appState.completed = appState.completed || {};
    appState.completed.SUBJEK = true;
    try {
      const saved = JSON.parse(localStorage.getItem('completed') || '{}');
      saved.SUBJEK = true;
      localStorage.setItem('completed', JSON.stringify(saved));
    } catch {}
    if (typeof window.updateDownloadButtonState === "function") {
      window.updateDownloadButtonState();
    }
  }

  // 2) Render tampilan ucapan terima kasih (selaras gaya KRAEPLIN)
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card" style="
      max-width:820px;margin:34px auto;padding:32px 28px;border-radius:22px;
      background:linear-gradient(135deg,#f5fff8 86%,#e8fff1 100%);
      box-shadow:0 10px 34px #c7f4da55;border:1.6px solid #c8f1d6;text-align:center;">
      <div style="font-size:3rem;line-height:1;margin-bottom:10px;">🎉</div>
      <h2 style="margin:6px 0 8px 0;font-weight:900;color:#13693a;">
        Terima kasih! Tes Subjek sudah selesai
      </h2>
      <p style="font-size:1.08rem;color:#244;max-width:680px;margin:0 auto 16px auto;line-height:1.6;">
        Jawaban Anda untuk Tes <b>Subjek</b> telah berhasil diupload. 
        Silakan lanjut mengerjakan tes berikutnya yang Anda pilih.
        Tombol <b>Download PDF</b> akan aktif kembali setelah <b>semua</b> tes selesai dikerjakan.
      </p>

      <div style="display:flex;gap:12px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
        <button id="btnContinueSubjek" class="btn" style="
          padding:12px 24px;font-weight:800;border-radius:11px;
          background:#18a35d;color:#fff;border:0;box-shadow:0 4px 18px #bff1d7;">
          ✅ Lanjut Tes Berikutnya
        </button>
      </div>
    </div>
  `;

  // 3) Aksi tombol: matikan guard dan kembali ke Home
  const goNext = () => {
    window.__inTestView = false;
    if (typeof window.renderHome === 'function') window.renderHome();
    setTimeout(() => {
      const el = document.getElementById('homeCard') || document.getElementById('downloadPDFBox');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  document.getElementById('btnContinueSubjek').onclick = goNext;

  // Tidak ada auto-redirect; pengguna menekan tombol manual.
}




// Membuat kolom Kraeplin random (helper nomor 2)
// Membuat kolom Kraeplin random (helper)
function generateKraeplinColumns(jumlahKolom, jumlahBaris) {
  return Array.from({length: jumlahKolom}, () =>
    Array.from({length: jumlahBaris}, () => Math.floor(Math.random() * 9) + 1)
  );
}
// /src/data/kamusPAPI.js

 const kamusPAPI = {
  A: [
    { range: [0, 4], desc: "Tidak kompetitif, mapan, puas. Tidak terdorong untuk menghasilkan prestasi, tdk berusaha utk mencapai sukses, membutuhkan dorongan dari luar diri, tidak berinisiatif, tidak memanfaatkan kemampuan diri secara optimal, ragu akan tujuan diri, misalnya sbg akibat promosi / perubahan struktur jabatan." },
    { range: [5, 7], desc: "Tahu akan tujuan yang ingin dicapainya dan dapat merumuskannya, realistis akan kemampuan diri, dan berusaha untuk mencapai target." },
    { range: [8, 9], desc: "Sangat berambisi utk berprestasi dan menjadi yg terbaik, menyukai tantangan, cenderung mengejar kesempurnaan, menetapkan target yg tinggi, 'self-starter', merumuskan kerja dg baik. Tdk realistis akan kemampuannya, sulit dipuaskan, mudah kecewa, harapan yg tinggi mungkin mengganggu org lain." }
  ],
  N: [
    { range: [0, 2], desc: "Tidak terlalu merasa perlu untuk menuntaskan sendiri tugas-tugasnya, senang menangani beberapa pekerjaan sekaligus, mudah mendelegasikan tugas. Komitmen rendah, cenderung meninggalkan tugas sebelum tuntas, konsentrasi mudah buyar, mungkin suka berpindah pekerjaan." },
    { range: [3, 5], desc: "Cukup memiliki komitmen untuk menuntaskan tugas, akan tetapi jika memungkinkan akan mendelegasikan sebagian dari pekerjaannya kepada orang lain." },
    { range: [6, 7], desc: "Komitmen tinggi, lebih suka menangani pekerjaan satu demi satu, akan tetapi masih dapat mengubah prioritas jika terpaksa." },
    { range: [8, 9], desc: "Memiliki komitmen yg sangat tinggi thd tugas, sangat ingin menyelesaikan tugas, tekun dan tuntas dlm menangani pekerjaan satu demi satu hingga tuntas. Perhatian terpaku pada satu tugas, sulit utk menangani beberapa pekerjaan sekaligus, sulit diinterupsi, tidak melihat masalah sampingan." }
  ],
  G: [
    { range: [0, 2], desc: "Santai, kerja adalah sesuatu yang menyenangkan-bukan beban yg membutuhkan usaha besar. Mungkin termotivasi utk mencari cara atau sistem yg dpt mempermudah dirinya dlm menyelesaikan pekerjaan, akan berusaha menghindari kerja keras, sehingga dapat memberi kesan malas." },
    { range: [3, 4], desc: "Bekerja keras sesuai tuntutan, menyalurkan usahanya untuk hal-hal yang bermanfaat / menguntungkan." },
    { range: [5, 7], desc: "Bekerja keras, tetapi jelas tujuan yg ingin dicapainya." },
    { range: [8, 9], desc: "Ingin tampil sbg pekerja keras, sangat suka bila orang lain memandangnya sbg pekerja keras. Cenderung menciptakan pekerjaan yang tidak perlu agar terlihat tetap sibuk, kadang kala tanpa tujuan yang jelas." }
  ],
  C: [
    { range: [0, 2], desc: "Lebih mementingkan fleksibilitas daripada struktur, pendekatan kerja lebih ditentukan oleh situasi daripada oleh perencanaan sebelumnya, mudah beradaptasi. Tidak mempedulikan keteraturan atau kerapihan, ceroboh." },
    { range: [3, 4], desc: "Fleksibel tapi masih cukup memperhatikan keteraturan atau sistematika kerja." },
    { range: [5, 6], desc: "Memperhatikan keteraturan dan sistematika kerja, tapi cukup fleksibel." },
    { range: [7, 9], desc: "Sistematis, bermetoda, berstruktur, rapi dan teratur, dapat menata tugas dengan baik. Cenderung kaku, tidak fleksibel." }
  ],
  D: [
    { range: [0, 1], desc: "Melihat pekerjaan scr makro, membedakan hal penting dari yg kurang penting, mendelegasikan detil pd org lain, generalis. Menghindari detail, konsekuensinya mungkin bertindak tanpa data yg cukup/akurat, bertindak ceroboh pd hal yg butuh kecermatan. Dpt mengabaikan proses yg vital dlm evaluasi data." },
    { range: [2, 3], desc: "Cukup peduli akan akurasi dan kelengkapan data." },
    { range: [4, 6], desc: "Tertarik untuk menangani sendiri detail." },
    { range: [7, 9], desc: "Sangat menyukai detail, sangat peduli akan akurasi dan kelengkapan data. Cenderung terlalu terlibat dengan detail sehingga melupakan tujuan utama." }
  ],
  R: [
    { range: [0, 3], desc: "Tipe pelaksana, praktis - pragmatis, mengandalkan pengalaman masa lalu dan intuisi. Bekerja tanpa perencanaan, mengandalkan perasaan." },
    { range: [4, 5], desc: "Pertimbangan mencakup aspek teoritis (konsep atau pemikiran baru) dan aspek praktis (pengalaman) secara berimbang." },
    { range: [6, 7], desc: "Suka memikirkan suatu problem secara mendalam, merujuk pada teori dan konsep." },
    { range: [8, 9], desc: "Tipe pemikir, sangat berminat pada gagasan, konsep, teori, mencari alternatif baru, menyukai perencanaan. Mungkin sulit dimengerti oleh orang lain, terlalu teoritis dan tidak praktis, mengawang-awang dan berbelit-belit." }
  ],
  T: [
    { range: [0, 3], desc: "Santai. Kurang peduli akan waktu, kurang memiliki rasa urgensi, membuang-buang waktu, bukan pekerja yang tepat waktu." },
    { range: [4, 6], desc: "Cukup aktif dalam segi mental, dapat menyesuaikan tempo kerjanya dengan tuntutan pekerjaan / lingkungan." },
    { range: [7, 9], desc: "Cekatan, selalu siaga, bekerja cepat, ingin segera menyelesaikan tugas. Negatifnya: Tegang, cemas, impulsif, mungkin ceroboh, banyak gerakan yang tidak perlu." }
  ],
  V: [
    { range: [0, 2], desc: "Cocok untuk pekerjaan 'di belakang meja'. Cenderung lamban, tidak tanggap, mudah lelah, daya tahan lemah." },
    { range: [3, 6], desc: "Dapat bekerja di belakang meja dan senang jika sesekali harus terjun ke lapangan atau melaksanakan tugas-tugas yang bersifat mobile." },
    { range: [7, 9], desc: "Menyukai aktifitas fisik (a.l.: olah raga), enerjik, memiliki stamina untuk menangani tugas-tugas berat, tidak mudah lelah. Tidak betah duduk lama, kurang dapat konsentrasi 'di belakang meja'." }
  ],
  W: [
    { range: [0, 3], desc: "Hanya butuh gambaran ttg kerangka tugas scr garis besar, berpatokan pd tujuan, dpt bekerja dlm suasana yg kurang berstruktur, berinsiatif, mandiri. Tdk patuh, cenderung mengabaikan/tdk paham pentingnya peraturan/prosedur, suka membuat peraturan sendiri yg bisa bertentangan dg yg telah ada." },
    { range: [4, 5], desc: "Perlu pengarahan awal dan tolok ukur keberhasilan." },
    { range: [6, 7], desc: "Membutuhkan uraian rinci mengenai tugas, dan batasan tanggung jawab serta wewenang." },
    { range: [8, 9], desc: "Patuh pada kebijaksanaan, peraturan dan struktur organisasi. Ingin segala sesuatunya diuraikan secara rinci, kurang memiliki inisiatif, tdk fleksibel, terlalu tergantung pada organisasi, berharap 'disuapi'." }
  ],
  F: [
    { range: [0, 3], desc: "Otonom, dapat bekerja sendiri tanpa campur tangan orang lain, motivasi timbul krn pekerjaan itu sendiri - bukan krn pujian dr otoritas. Mempertanyakan otoritas, cenderung tidak puas thdp atasan, loyalitas lebih didasari kepentingan pribadi." },
    { range: [4, 6], desc: "Loyal pada Perusahaan." },
    { range: [7, 7], desc: "Loyal pada pribadi atasan." },
    { range: [8, 9], desc: "Loyal, berusaha dekat dg pribadi atasan, ingin menyenangkan atasan, sadar akan harapan atasan akan dirinya. Terlalu memperhatikan cara menyenangkan atasan, tidak berani berpendirian lain, tidak mandiri." }
  ],
  L: [
    { range: [0, 1], desc: "Puas dengan peran sebagai bawahan, memberikan kesempatan pada orang lain untuk memimpin, tidak dominan. Tidak percaya diri; sama sekali tidak berminat untuk berperan sebagai pemimpin; bersikap pasif dalam kelompok." },
    { range: [2, 3], desc: "Tidak percaya diri dan tidak ingin memimpin atau mengawasi orang lain." },
    { range: [4, 4], desc: "Kurang percaya diri dan kurang berminat utk menjadi pemimpin." },
    { range: [5, 5], desc: "Cukup percaya diri, tidak secara aktif mencari posisi kepemimpinan akan tetapi juga tidak akan menghindarinya." },
    { range: [6, 7], desc: "Percaya diri dan ingin berperan sebagai pemimpin." },
    { range: [8, 9], desc: "Sangat percaya diri utk berperan sbg atasan & sangat mengharapkan posisi tersebut. Lebih mementingkan citra & status kepemimpinannya dari pada efektifitas kelompok, mungkin akan tampil angkuh atau terlalu percaya diri." }
  ],
  P: [
    { range: [0, 1], desc: "Permisif, akan memberikan kesempatan pada orang lain untuk memimpin. Tidak mau mengontrol orang lain dan tidak mau mempertanggung jawabkan hasil kerja bawahannya." },
    { range: [2, 3], desc: "Enggan mengontrol org lain & tidak mau mempertanggung jawabkan hasil kerja bawahannya, lebih memberi kebebasan kpd bawahan utk memilih cara sendiri dlm penyelesaian tugas dan meminta bawahan utk mempertanggungjawabkan hasilnya masing-masing." },
    { range: [4, 4], desc: "Cenderung enggan melakukan fungsi pengarahan, pengendalian dan pengawasan, kurang aktif memanfaatkan kapasitas bawahan secara optimal, cenderung bekerja sendiri dalam mencapai tujuan kelompok." },
    { range: [5, 5], desc: "Bertanggung jawab, akan melakukan fungsi pengarahan, pengendalian dan pengawasan, tapi tidak mendominasi." },
    { range: [6, 7], desc: "Dominan dan bertanggung jawab, akan melakukan fungsi pengarahan, pengendalian dan pengawasan." },
    { range: [8, 9], desc: "Sangat dominan, sangat mempengaruhi & mengawasi org lain, bertanggung jawab atas tindakan & hasil kerja bawahan. Posesif, tdk ingin berada di bawah pimpinan org lain, cemas bila tdk berada di posisi pemimpin, mungkin sulit utk bekerja sama dgn rekan yg sejajar kedudukannya." }
  ],
  I: [
    { range: [0, 1], desc: "Sangat berhati-hati, memikirkan langkah-langkahnya secara bersungguh-sungguh. Lamban dlm mengambil keputusan, terlalu lama merenung, cenderung menghindar mengambil keputusan." },
    { range: [2, 3], desc: "Enggan mengambil keputusan." },
    { range: [4, 5], desc: "Berhati-hati dlm pengambilan keputusan." },
    { range: [6, 7], desc: "Cukup percaya diri dlm pengambilan keputusan, mau mengambil resiko, dpt memutuskan dgn cepat, mengikuti alur logika." },
    { range: [8, 9], desc: "Sangat yakin dl mengambil keputusan, cepat tanggap thd situasi, berani mengambil resiko, mau memanfaatkan kesempatan. Impulsif, dpt membuat keputusan yg tdk praktis, cenderung lebih mementingkan kecepatan daripada akurasi, tdk sabar, cenderung meloncat pd keputusan." }
  ],
  S: [
    { range: [0, 2], desc: "Dpt. bekerja sendiri, tdk membutuhkan kehadiran org lain. Menarik diri, kaku dlm bergaul, canggung dlm situasi sosial, lebih memperhatikan hal-hal lain daripada manusia." },
    { range: [3, 4], desc: "Kurang percaya diri & kurang aktif dlm menjalin hubungan sosial." },
    { range: [5, 9], desc: "Percaya diri & sangat senang bergaul, menyukai interaksi sosial, bisa menciptakan suasana yg menyenangkan, mempunyai inisiatif & mampu menjalin hubungan & komunikasi, memperhatikan org lain. Mungkin membuang-buang waktu utk aktifitas sosial, kurang peduli akan penyelesaian tugas." }
  ],
  B: [
    { range: [0, 2], desc: "Mandiri (dari segi emosi), tdk mudah dipengaruhi oleh tekanan kelompok. Penyendiri, kurang peka akan sikap & kebutuhan kelompok, mungkin sulit menyesuaikan diri." },
    { range: [3, 5], desc: "Selektif dlm bergabung dg kelompok, hanya mau berhubungan dg kelompok di lingkungan kerja apabila bernilai & sesuai minat, tdk terlalu mudah dipengaruhi." },
    { range: [6, 9], desc: "Suka bergabung dlm kelompok, sadar akan sikap & kebutuhan kelompok, suka bekerja sama, ingin menjadi bagian dari kelompok, ingin disukai & diakui oleh lingkungan; sangat tergantung pd kelompok, lebih memperhatikan kebutuhan kelompok daripada pekerjaan." }
  ],
  O: [
    { range: [0, 2], desc: "Menjaga jarak, lebih memperhatikan hal-hal kedinasan, tdk mudah dipengaruhi oleh individu tertentu, objektif & analitis. Tampil dingin, tdk acuh, tdk ramah, suka berahasia, mungkin tdk sadar akan perasaan org lain, & mungkin sulit menyesuaikan diri." },
    { range: [3, 5], desc: "Tidak mencari atau menghindari hubungan antar pribadi di lingkungan kerja, masih mampu menjaga jarak." },
    { range: [6, 9], desc: "Peka akan kebutuhan org lain, sangat memikirkan hal-hal yg dibutuhkan org lain, suka menjalin hubungan persahabatan yg hangat & tulus. Sangat perasa, mudah tersinggung, cenderung subjektif, dpt terlibat terlalu dalam/intim dg individu tertentu dlm pekerjaan, sangat tergantung pd individu tertentu." }
  ],
  X: [
    { range: [0, 1], desc: "Sederhana, rendah hati, tulus, tidak sombong dan tidak suka menampilkan diri. Terlalu sederhana, cenderung merendahkan kapasitas diri, tidak percaya diri, cenderung menarik diri dan pemalu." },
    { range: [2, 3], desc: "Sederhana, cenderung diam, cenderung pemalu, tidak suka menonjolkan diri." },
    { range: [4, 5], desc: "Mengharapkan pengakuan lingkungan dan tidak mau diabaikan tetapi tidak mencari-cari perhatian." },
    { range: [6, 9], desc: "Bangga akan diri dan gayanya sendiri, senang menjadi pusat perhatian, mengharapkan penghargaan dari lingkungan. Mencari-cari perhatian dan suka menyombongkan diri." }
  ],
  E: [
    { range: [0, 1], desc: "Sangat terbuka, terus terang, mudah terbaca (dari air muka, tindakan, perkataan, sikap). Tidak dapat mengendalikan emosi, cepat bereaksi, kurang mengindahkan/tidak mempunyai 'nilai' yg mengharuskannya menahan emosi." },
    { range: [2, 3], desc: "Terbuka, mudah mengungkap pendapat atau perasaannya mengenai suatu hal kepada org lain." },
    { range: [4, 6], desc: "Mampu mengungkap atau menyimpan perasaan, dapat mengendalikan emosi." },
    { range: [7, 9], desc: "Mampu menyimpan pendapat atau perasaannya, tenang, dapat mengendalikan emosi, menjaga jarak. Tampil pasif dan tidak acuh, mungkin sulit mengungkapkan emosi/perasaan/pandangan." }
  ],
  K: [
    { range: [0, 1], desc: "Sabar, tidak menyukai konflik. Mengelak atau menghindar dari konflik, pasif, menekan atau menyembunyikan perasaan sesungguhnya, menghindari konfrontasi, lari dari konflik, tidak mau mengakui adanya konflik." },
    { range: [2, 3], desc: "Lebih suka menghindari konflik, akan mencari rasionalisasi untuk dapat menerima situasi dan melihat permasalahan dari sudut pandang orang lain." },
    { range: [4, 5], desc: "Tidak mencari atau menghindari konflik, mau mendengarkan pandangan orang lain tetapi dapat menjadi keras kepala saat mempertahankan pandangannya." },
    { range: [6, 7], desc: "Akan menghadapi konflik, mengungkapkan serta memaksakan pandangan dengan cara positif." },
    { range: [8, 9], desc: "Terbuka, jujur, terus terang, asertif, agresif, reaktif, mudah tersinggung, mudah meledak, curiga, berprasangka, suka berkelahi atau berkonfrontasi, berpikir negatif." }
  ],
  Z: [
    { range: [0, 1], desc: "Mudah beradaptasi dg pekerjaan rutin tanpa merasa bosan, tidak membutuhkan variasi, menyukai lingkungan stabil dan tidak berubah. Konservatif, menolak perubahan, sulit menerima hal-hal baru, tidak dapat beradaptasi dengan situasi yg berbeda-beda." },
    { range: [2, 3], desc: "Enggan berubah, tidak siap untuk beradaptasi, hanya mau menerima perubahan jika alasannya jelas dan meyakinkan." },
    { range: [4, 5], desc: "Mudah beradaptasi, cukup menyukai perubahan." },
    { range: [6, 7], desc: "Antusias terhadap perubahan dan akan mencari hal-hal baru, tetapi masih selektif (menilai kemanfaatannya)." },
    { range: [8, 9], desc: "Sangat menyukai perubahan, gagasan baru/variasi, aktif mencari perubahan, antusias dg hal-hal baru, fleksibel dlm berpikir, mudah beradaptasi pd situasi yg berbeda-beda. Gelisah, frustasi, mudah bosan, sangat membutuhkan variasi, tidak menyukai tugas/situasi yg rutin-monoton." }
  ]
};


function getInterpretasiPAPI(aspek, nilai) {
  if (!kamusPAPI[aspek]) return "-";
  const entry = kamusPAPI[aspek].find(r => nilai >= r.range[0] && nilai <= r.range[1]);
  return entry ? entry.desc : "-";
}
// ---------- ANALISIS KECOCOKAN UNTUK SEMUA POSISI ----------
function analisisKecocokanPAPI(scores, posisi) {
  // Analisis kecocokan dengan posisi: Technical Staff, Guru, Administrator, Manajer, dst.
  // Ubah sesuai kebutuhan HRD-mu, ini sudah umum dipakai di psikotes rekrutmen Indonesia.
  let catatan = "";
  if (posisi === "Technical Staff") {
    catatan = "Pada posisi Technical Staff, dibutuhkan ketelitian, perhatian pada detail, kemampuan mengikuti aturan, dan komitmen kerja. " +
      "Jika skor D (detail), C (teratur), W (taat aturan), dan N/G/A (komitmen, dorongan kerja, prestasi) rendah, maka peserta **kurang cocok** untuk posisi ini. " +
      "Jika semua skor rendah, berarti sangat kurang cocok (minim motivasi, kurang teliti, kurang terstruktur, kurang bertanggung jawab, kurang percaya diri, kurang inisiatif, dan kurang adaptif pada perubahan).";
  } else if (posisi === "Dosen/Guru") {
    catatan = "Posisi Guru memerlukan empati, kemampuan sosial (S/B/O), komitmen kerja (N/G/A), dan kestabilan emosi (E/K). " +
      "Jika seluruh skor utama ini rendah, maka peserta **kurang cocok** sebagai Guru, apalagi bila S/B/O rendah (kurang peduli, pasif secara sosial, tidak mampu membangun relasi dengan siswa, minim inisiatif).";
  } else if (posisi === "Administrator") {
    catatan = "Administrator harus teliti (D), teratur (C), patuh pada sistem (W), dan mampu menyelesaikan tugas hingga tuntas (N/A/G). " +
      "Jika semua skor rendah, berarti kandidat kurang cocok menjadi Administrator karena kurang teliti, kurang terorganisir, mudah bosan, serta kurang bertanggung jawab.";
  } else if (posisi === "Manajer") {
    catatan = "Manajer memerlukan inisiatif (A/G/N), kepemimpinan (L/P/I), serta komunikasi (S/B), dan kemampuan adaptif (Z/E). " +
      "Jika skor kepemimpinan, pengambilan keputusan, serta dorongan kerja rendah, kandidat kurang cocok menjadi Manajer.";
  } else {
    catatan = "Dengan skor yang rendah di hampir semua aspek utama PAPI, kecocokan untuk posisi ini **sangat kurang**. Kandidat perlu pengembangan besar dalam motivasi, kemandirian, ketelitian, kedisiplinan, kepedulian sosial, dan kemampuan mengikuti aturan kerja.";
  }
  return catatan;
}
// ---------- PARAGRAF ANALISIS LENGKAP SEMUA FAKTOR ----------
function generateAnalisaPAPI(scores, posisi) {
  const faktorList = [
    ['N', 'Penyelesaian secara prestasi'],
    ['G', 'Peranan sebagai pekerja keras'],
    ['A', 'Hasrat untuk berprestasi'],
    ['L', 'Peran sebagai pimpinan'],
    ['P', 'Pengendalian orang lain'],
    ['I', 'Mudah dalam mengambil keputusan'],
    ['T', 'Tipe selalu sibuk'],
    ['V', 'Tipe yang bersemangat'],
    ['X', 'Kebutuhan untuk mendapatkan perhatian'],
    ['S', 'Pergaulan luas'],
    ['B', 'Kebutuhan berkelompok'],
    ['O', 'Kebutuhan untuk dekat dan menyayangi'],
    ['R', 'Tipe teoritikal'],
    ['D', 'Suka pekerjaan yang terperinci'],
    ['C', 'Tipe teratur'],
    ['Z', 'Hasrat untuk berubah'],
    ['E', 'Pengendalian emosi'],
    ['K', 'Agresi'],
    ['F', 'Dukungan terhadap atasan'],
    ['W', 'Kebutuhan taat pada aturan dan pengarahan'],
  ];
  let teks = "";
  faktorList.forEach(([kode, nama]) => {
    const val = scores[kode] ?? '-';
    const desc = getInterpretasiPAPI(kode, val);
    teks += `${nama} (${kode} = ${val}): ${desc}\n\n`;
  });
  const kecocokan = analisisKecocokanPAPI(scores, posisi);
  return `Rangkuman hasil PAPI Kostick berikut memuat interpretasi lengkap seluruh aspek kepribadian kandidat:\n\n${teks}\nKecocokan untuk posisi "${posisi}":\n${kecocokan}`;
}


// Kunci mapping arah kerja PAPI (N, G, A)
const mappingPAPI = {
  ArahKerja: {
    N: { tipe: 'B', nomor: [2, 13, 24, 35, 46, 57, 68, 79, 90] },
    G: { tipe: 'A', nomor: [1, 11, 21, 31, 41, 51, 61, 71, 81] },
    A: [
      { tipe: 'A', nomor: [2] },
      { tipe: 'B', nomor: [3, 14, 25, 36, 47, 58, 69, 80] }
    ]
  },
 Kepemimpinan: {
  L: [
    { tipe: 'A', nomor: [12, 22, 32, 42, 52, 62, 72, 82] },
    { tipe: 'B', nomor: [81] }
  ],
  P: [
    { tipe: 'A', nomor: [3, 13] },
    { tipe: 'B', nomor: [4, 15, 26, 37, 48, 59, 70] }
  ],
  I: [
    { tipe: 'A', nomor: [23, 33, 43, 53, 63, 73, 83] },
    { tipe: 'B', nomor: [71, 82] }
  ]
},
 Aktivitas: {
  T: [
    { tipe: 'A', nomor: [34, 44, 54, 64, 74, 84] },
    { tipe: 'B', nomor: [61, 72, 83] }
  ],
  V: [
    { tipe: 'A', nomor: [45, 55, 65, 75, 85] },
    { tipe: 'B', nomor: [51, 62, 73, 84] }
  ]
},
  Pergaulan: {
  X: [
    { tipe: 'A', nomor: [4, 14, 24] },
    { tipe: 'B', nomor: [5, 16, 27, 38, 49, 60] }
  ],
  S: [
    { tipe: 'A', nomor: [56, 66, 76, 86] },
    { tipe: 'B', nomor: [41, 52, 63, 74, 85] }
  ],
  B: [
    { tipe: 'A', nomor: [5, 15, 25, 35] },
    { tipe: 'B', nomor: [6, 17, 28, 39, 50] }
  ],
  O: [
    { tipe: 'A', nomor: [6, 16, 26, 36, 46] },
    { tipe: 'B', nomor: [7, 18, 29, 40] }
  ]
}
,
  GayaKerja: {
  R: [
    { tipe: 'A', nomor: [67, 77, 87] },
    { tipe: 'B', nomor: [31, 42, 53, 64, 75, 86] }
  ],
  D: [
    { tipe: 'A', nomor: [78, 88] },
    { tipe: 'B', nomor: [21, 32, 43, 54, 65, 76, 87] }
  ],
  C: [
    { tipe: 'A', nomor: [89] },
    { tipe: 'B', nomor: [11, 22, 33, 44, 55, 66, 77, 88] }
  ]
}
,
 Sifat: {
  Z: [
    { tipe: 'A', nomor: [7, 17, 27, 37, 47, 57] },
    { tipe: 'B', nomor: [8, 19, 30] }
  ],
  E: { tipe: 'B', nomor: [1, 12, 23, 34, 45, 56, 67, 78, 89] },
  K: [
    { tipe: 'A', nomor: [8, 18, 28, 38, 48, 58, 68] },
    { tipe: 'B', nomor: [9, 20] }
  ]
}
,
  Ketaatan: {
  F: [
    { tipe: 'A', nomor: [9, 19, 29, 39, 49, 59, 69, 79] },
    { tipe: 'B', nomor: [10] }
  ],
  W: { tipe: 'A', nomor: [10, 20, 30, 40, 50, 60, 70, 80, 90] }
}
};



function skorPAPIArahKerja(answerObjArray) {
  let hasil = { N: 0, G: 0, A: 0 };
  mappingPAPI.ArahKerja.N.nomor.forEach(n => {
    const jaw = answerObjArray.find(a => a.id === n);
    if (jaw && jaw.answer === mappingPAPI.ArahKerja.N.tipe) hasil.N++;
  });
  mappingPAPI.ArahKerja.G.nomor.forEach(n => {
    const jaw = answerObjArray.find(a => a.id === n);
    if (jaw && jaw.answer === mappingPAPI.ArahKerja.G.tipe) hasil.G++;
  });
  mappingPAPI.ArahKerja.A.forEach(group => {
    group.nomor.forEach(n => {
      const jaw = answerObjArray.find(a => a.id === n);
      if (jaw && jaw.answer === group.tipe) hasil.A++;
    });
  });
  return hasil;
}

function skorPAPIKepemimpinan(answerObjArray) {
  let hasil = { L: 0, P: 0, I: 0 };
  ['L', 'P', 'I'].forEach(kode => {
    mappingPAPI.Kepemimpinan[kode].forEach(group => {
      group.nomor.forEach(n => {
        const jaw = answerObjArray.find(a => a.id === n);
        if (jaw && jaw.answer === group.tipe) hasil[kode]++;
      });
    });
  });
  return hasil;
}

function skorPAPIAktivitas(answerObjArray) {
  let hasil = { T: 0, V: 0 };
  ['T', 'V'].forEach(kode => {
    mappingPAPI.Aktivitas[kode].forEach(group => {
      group.nomor.forEach(n => {
        const jaw = answerObjArray.find(a => a.id === n);
        if (jaw && jaw.answer === group.tipe) hasil[kode]++;
      });
    });
  });
  return hasil;
}

function skorPAPIPergaulan(answerObjArray) {
  let hasil = { X: 0, S: 0, B: 0, O: 0 };
  ['X', 'S', 'B', 'O'].forEach(kode => {
    mappingPAPI.Pergaulan[kode].forEach(group => {
      group.nomor.forEach(n => {
        const jaw = answerObjArray.find(a => a.id === n);
        if (jaw && jaw.answer === group.tipe) hasil[kode]++;
      });
    });
  });
  return hasil;
}

function skorPAPIGayaKerja(answerObjArray) {
  let hasil = { R: 0, D: 0, C: 0 };
  ['R', 'D', 'C'].forEach(kode => {
    mappingPAPI.GayaKerja[kode].forEach(group => {
      group.nomor.forEach(n => {
        const jaw = answerObjArray.find(a => a.id === n);
        if (jaw && jaw.answer === group.tipe) hasil[kode]++;
      });
    });
  });
  return hasil;
}

function skorPAPISifat(answerObjArray) {
  let hasil = { Z: 0, E: 0, K: 0 };

  ['Z', 'E', 'K'].forEach(kode => {
    const faktor = mappingPAPI.Sifat[kode];

    if (Array.isArray(faktor)) {
      // tipe campuran A dan B
      faktor.forEach(group => {
        group.nomor.forEach(n => {
          const jaw = answerObjArray.find(a => a.id === n);
          if (jaw && jaw.answer === group.tipe) hasil[kode]++;
        });
      });
    } else {
      // hanya satu tipe
      faktor.nomor.forEach(n => {
        const jaw = answerObjArray.find(a => a.id === n);
        if (jaw && jaw.answer === faktor.tipe) hasil[kode]++;
      });
    }
  });

  return hasil;
}


function skorPAPIKetaatan(answerObjArray) {
  let hasil = { F: 0, W: 0 };

  ['F', 'W'].forEach(kode => {
    const faktor = mappingPAPI.Ketaatan[kode];

    if (Array.isArray(faktor)) {
      // tipe campuran A dan B
      faktor.forEach(group => {
        group.nomor.forEach(n => {
          const jaw = answerObjArray.find(a => a.id === n);
          if (jaw && jaw.answer === group.tipe) hasil[kode]++;
        });
      });
    } else {
      // hanya satu tipe
      faktor.nomor.forEach(n => {
        const jaw = answerObjArray.find(a => a.id === n);
        if (jaw && jaw.answer === faktor.tipe) hasil[kode]++;
      });
    }
  });

  return hasil;
}
function getBigFiveSuitabilityLabel(percent) {
  if (percent >= 80) return "Cocok sekali";
  if (percent >= 65) return "Cocok";
  if (percent >= 40) return "Kurang cocok";
  return "Tidak cocok";
}
function analisaBigFiveSuitability(hasilOCEAN, posisiKey) {
  // Daftar kebutuhan ideal untuk masing-masing posisi dan aspek
  const kebutuhan = {
    "Administrator":   { O: 60, C: 75, E: 60, A: 65, N: 35 },
    "Dosen/Guru":            { O: 70, C: 70, E: 65, A: 70, N: 40 },
    "Kindergartens":   { O: 70, C: 65, E: 70, A: 75, N: 35 },
    "Primary":         { O: 70, C: 70, E: 70, A: 70, N: 35 },
    "Math":            { O: 65, C: 75, E: 60, A: 65, N: 40 },
    "PE & Health":     { O: 70, C: 70, E: 80, A: 70, N: 35 },
    "Biology":         { O: 70, C: 70, E: 65, A: 70, N: 35 },
    "Technical Staff": { O: 60, C: 70, E: 60, A: 65, N: 35 },
    "Welder":          { O: 55, C: 80, E: 55, A: 60, N: 35 },
    "Wood Maintenance Technician": { O: 60, C: 75, E: 60, A: 60, N: 35 },
    "Baker":           { O: 65, C: 75, E: 60, A: 65, N: 35 }
  };
  const kebutuhanPosisi = kebutuhan[posisiKey] || kebutuhan["Administrator"];
  let lines = [];
  Object.entries(hasilOCEAN).forEach(([dim, val]) => {
    const ideal = kebutuhanPosisi[dim] || 60;
    const label = getBigFiveSuitabilityLabel(val.percent);
    lines.push(`${val.name} (${val.percent}%) → Kebutuhan: ${ideal}%. **${label}**.\n${val.desc}`);
  });
  return lines;
}

const bigFivePositionAnalysis = {
  "Administrator": [
    "Dalam posisi Administrator, kelima dimensi kepribadian Big Five memiliki peran yang sangat penting dalam menentukan efektivitas dan kinerja individu di lingkungan kerja yang menuntut ketelitian serta koordinasi yang baik. Administrator yang memiliki skor tinggi pada aspek Conscientiousness akan sangat terorganisir, teliti, dan mampu memastikan semua proses administratif berjalan sesuai prosedur, mulai dari pencatatan data, pengarsipan, hingga pelaporan. Sikap disiplin dan konsistensi kerja yang tinggi akan mengurangi risiko kesalahan dan meningkatkan kepercayaan stakeholder terhadap integritas pelayanan administrasi. Skor Openness yang baik juga diperlukan agar Administrator siap menerima dan mengimplementasikan perubahan sistem, prosedur, maupun teknologi baru yang dapat meningkatkan efisiensi dan mutu kerja. Pada dimensi Agreeableness, Administrator yang ramah, kooperatif, dan mudah dipercaya akan menciptakan hubungan kerja yang harmonis, baik dengan rekan satu tim, atasan, maupun pihak eksternal. Kemampuan untuk menyesuaikan komunikasi dan sikap kooperatif sangat mendukung pelayanan prima dan penyelesaian tugas secara kolektif. Extraversion mendukung kemampuan dalam melayani banyak pihak, menjalin koordinasi lintas bagian, serta menjaga lingkungan kerja yang kondusif. Terakhir, skor Neuroticism yang rendah sangat penting untuk menjaga kestabilan emosi, sehingga Administrator tetap tenang, mampu mengelola stres, serta dapat berpikir jernih dalam situasi deadline atau tekanan beban kerja tinggi. Kombinasi kelima aspek kepribadian ini akan membentuk Administrator yang profesional, efisien, adaptif, dan mampu menjaga mutu pelayanan secara konsisten."
  ],
  "Dosen/Guru": [
    "Sebagai Guru, kelima dimensi kepribadian Big Five memberikan gambaran yang sangat luas terhadap potensi dan kecocokan dalam mendidik serta membimbing siswa. Guru dengan skor Openness yang tinggi akan mudah mengadopsi dan mengembangkan metode pembelajaran inovatif, mampu merespon perubahan kurikulum, serta mengintegrasikan teknologi atau pendekatan kreatif dalam proses belajar-mengajar. Sikap terbuka ini akan menumbuhkan minat siswa serta menciptakan suasana kelas yang dinamis. Pada aspek Conscientiousness, guru yang teliti dan bertanggung jawab akan memastikan semua rencana pembelajaran, tugas, serta penilaian dilakukan dengan sistematis dan tepat waktu. Guru seperti ini sangat konsisten dalam evaluasi hasil belajar dan administrasi kelas. Dimensi Extraversion sangat menunjang kemampuan berkomunikasi efektif, baik dengan siswa, orang tua, maupun kolega. Guru ekstrovert akan lebih mudah membangun relasi interpersonal yang positif, mendorong partisipasi aktif di kelas, dan menjadi motivator bagi siswa. Agreeableness yang tinggi menggambarkan guru yang penuh empati, sabar, mudah dipercaya, dan dapat memahami berbagai karakter siswa. Kepekaan sosial ini sangat membantu dalam menciptakan suasana belajar yang suportif, menghargai perbedaan, dan mampu menangani konflik dengan pendekatan solutif. Terakhir, skor Neuroticism yang rendah menunjukkan kemampuan guru dalam menjaga kestabilan emosi, tetap tenang saat menghadapi tantangan atau tekanan kelas, serta menjadi teladan dalam mengelola stres. Kombinasi kelima dimensi ini menjadikan seorang guru tidak hanya berkompeten secara akademis, tetapi juga mampu membangun lingkungan belajar yang positif, adaptif, dan inspiratif bagi siswa."
  ],
  "Kindergartens": [
    "Pada posisi Guru Taman Kanak-kanak, karakter kepribadian sangat menentukan dalam mendukung tumbuh kembang anak usia dini. Skor Openness yang tinggi akan membantu guru untuk selalu kreatif dalam menyusun permainan edukatif, merancang aktivitas yang menarik, dan menghadirkan suasana belajar yang penuh warna. Kemampuan berimajinasi dan berpikir inovatif sangat dibutuhkan untuk menghadapi rasa ingin tahu dan energi anak-anak. Conscientiousness berperan penting dalam merencanakan kegiatan pembelajaran harian secara teratur, mencatat perkembangan anak dengan detail, serta memastikan setiap anak mendapat perhatian sesuai kebutuhannya. Agreeableness sangat menonjol dalam peran ini, karena guru harus mampu menunjukkan empati, kasih sayang, dan kesabaran ekstra menghadapi ragam perilaku anak. Guru yang mudah dipercaya akan lebih efektif dalam membangun rasa aman dan nyaman pada siswa. Extraversion akan memperkuat kemampuan berinteraksi, menciptakan suasana yang ceria, serta membangun komunikasi positif dengan orang tua. Neuroticism yang rendah penting agar guru dapat tetap tenang saat menghadapi tantrum atau konflik antar anak, sehingga mampu memberikan teladan pengelolaan emosi sejak dini. Kombinasi semua aspek kepribadian ini sangat krusial untuk menciptakan lingkungan belajar yang penuh cinta, aman, dan mendukung perkembangan sosial-emosional anak-anak."
  ],
  "Primary": [
    "Sebagai Guru SD, kelima aspek kepribadian Big Five memberikan pengaruh besar pada kualitas pembelajaran dan bimbingan karakter siswa. Openness yang tinggi mendorong inovasi dalam menyampaikan materi, penggunaan alat peraga yang variatif, serta kemauan mencoba pendekatan belajar yang sesuai dengan perkembangan zaman. Conscientiousness sangat dibutuhkan untuk pengelolaan kelas yang terstruktur, pendataan perkembangan siswa, dan penilaian hasil belajar yang objektif serta adil. Extraversion membantu guru membangun interaksi yang menyenangkan di kelas, mendorong siswa untuk aktif bertanya dan berpendapat, serta membangun hubungan positif dengan orang tua. Agreeableness berperan dalam membentuk guru yang sabar, toleran, serta mampu merangkul siswa dengan berbagai karakter dan latar belakang. Sikap empati dan kehangatan akan memperkuat rasa percaya diri siswa dan memperlancar komunikasi dua arah. Neuroticism yang rendah penting untuk menjaga kestabilan emosi, mengelola tekanan administrasi maupun tantangan perilaku siswa, serta menjadi contoh dalam pengendalian diri. Guru SD yang menonjol pada kelima aspek ini akan mampu membimbing siswa tidak hanya secara akademik, tetapi juga membentuk karakter dan kepribadian anak sejak dini."
  ],
  "Math": [
    "Guru Matematika membutuhkan kombinasi kepribadian yang mencakup ketelitian tinggi (Conscientiousness), keterbukaan pada metode ajar baru (Openness), serta kemampuan membina hubungan positif dengan siswa (Agreeableness dan Extraversion). Ketelitian menjadi kunci dalam menjelaskan konsep-konsep matematis yang presisi dan logis, memeriksa hasil kerja siswa, serta menjaga keakuratan penilaian. Openness diperlukan agar guru selalu update dengan perkembangan metode pengajaran matematika, seperti penggunaan alat peraga, teknologi pembelajaran digital, atau strategi problem-based learning yang modern. Guru yang memiliki agreeableness dan extraversion baik akan lebih mudah membangun suasana kelas yang interaktif, mendorong siswa untuk bertanya, berdiskusi, dan tidak takut melakukan kesalahan. Neuroticism yang rendah akan membantu guru tetap sabar menghadapi siswa yang kesulitan memahami materi, serta menjaga suasana kelas tetap kondusif. Perpaduan kelima aspek kepribadian ini sangat mendukung keberhasilan proses belajar-mengajar matematika yang efektif, inspiratif, dan menyenangkan."
  ],
  "PE & Health": [
    "Guru Olahraga & Kesehatan sangat diuntungkan dengan kepribadian yang enerjik (Extraversion tinggi), adaptif pada variasi metode pengajaran (Openness), serta disiplin tinggi (Conscientiousness) untuk mengatur jadwal dan memastikan keselamatan siswa dalam setiap aktivitas. Extraversion yang tinggi memudahkan guru membangun semangat dan motivasi siswa, menjaga dinamika kelas, serta menumbuhkan kebersamaan dalam aktivitas kelompok. Openness memungkinkan guru terus mengembangkan model latihan atau permainan baru, mengadopsi teknik pelatihan modern, dan responsif terhadap isu kesehatan terbaru. Conscientiousness menjadi kunci agar setiap aktivitas berjalan terencana, risiko cidera dapat diminimalkan, dan evaluasi perkembangan fisik siswa dilakukan secara terstruktur. Agreeableness membantu menciptakan iklim yang suportif dan saling menghargai di antara siswa, serta membangun komunikasi efektif dengan orang tua. Neuroticism yang rendah penting agar guru mampu mengelola stres, menghadapi insiden di lapangan, serta tetap fokus dalam situasi apapun. Dengan kombinasi kepribadian ini, guru PE & Health mampu menjadi teladan gaya hidup sehat sekaligus motivator bagi siswa."
  ],
  "Biology": [
    "Guru Biologi idealnya memiliki kombinasi keterbukaan pada pengetahuan baru (Openness), ketelitian dalam eksperimen dan pencatatan hasil (Conscientiousness), serta kemampuan membangun diskusi interaktif dengan siswa (Extraversion dan Agreeableness). Openness membantu guru untuk terus update dengan perkembangan biologi, baik dari sisi penelitian, teknologi laboratorium, maupun metode pengajaran berbasis proyek. Conscientiousness dibutuhkan untuk memastikan eksperimen berjalan aman dan data yang dihasilkan akurat. Guru yang ekstrovert dan penuh empati lebih mampu mengelola diskusi kelas, memotivasi siswa untuk aktif, dan menumbuhkan rasa ingin tahu. Neuroticism yang rendah sangat penting, karena pengajaran biologi sering melibatkan situasi tak terduga di laboratorium atau di alam, sehingga kemampuan mengelola emosi dan tekanan menjadi nilai tambah. Kombinasi aspek kepribadian ini akan menghasilkan proses pembelajaran Biologi yang inspiratif, aman, dan berbasis scientific inquiry."
  ],
  "Technical Staff": [
    "Untuk Technical Staff, kelima aspek kepribadian Big Five sangat berpengaruh terhadap produktivitas, kemampuan belajar teknologi baru, serta kualitas kerja tim di lingkungan kerja yang dinamis. Openness yang tinggi memungkinkan staf teknis cepat menerima dan mempelajari perkembangan teknologi terbaru, metode troubleshooting, maupun perubahan sistem kerja. Conscientiousness sangat penting agar semua prosedur pemeliharaan, dokumentasi teknis, dan pelaporan dilakukan dengan detail, teliti, dan sesuai standar. Agreeableness dan Extraversion memperkuat komunikasi lintas tim dan membantu dalam proses kolaborasi untuk menyelesaikan masalah teknis yang kompleks. Kemampuan menerima kritik, berbagi pengetahuan, serta menjaga hubungan harmonis di lingkungan bengkel, pabrik, atau lapangan menjadi modal utama keberhasilan kerja tim. Neuroticism yang rendah sangat penting dalam menghadapi tekanan troubleshooting, deadline pekerjaan, maupun insiden tidak terduga. Kemampuan mengendalikan emosi, berpikir jernih di bawah tekanan, serta tetap responsif sangat dibutuhkan untuk menjaga produktivitas dan keselamatan kerja. Perpaduan kelima dimensi kepribadian ini akan menghasilkan Technical Staff yang profesional, inovatif, serta siap menghadapi tantangan teknologi masa kini."
  ],
  "Welder": [
    "Sebagai Welder, karakter kepribadian yang menonjol pada conscientiousness tinggi menjadi sangat penting untuk menjaga kualitas dan keamanan hasil pengelasan. Setiap pekerjaan membutuhkan perhatian penuh pada detail, kedisiplinan dalam mengikuti prosedur keselamatan, serta konsistensi dalam melakukan pengecekan kualitas. Openness dibutuhkan agar Welder mampu menerima dan belajar teknik pengelasan baru, alat modern, serta standar mutu terbaru. Agreeableness mempermudah komunikasi dan kerja sama dengan anggota tim, supervisor, serta penerimaan feedback untuk peningkatan mutu kerja. Extraversion, meskipun tidak harus sangat tinggi, tetap diperlukan untuk menunjang komunikasi efektif di lingkungan kerja yang sering ramai atau bising. Skor Neuroticism yang rendah akan membuat Welder tetap tenang dan mampu mengambil keputusan tepat saat terjadi insiden atau kesalahan teknis. Kombinasi aspek kepribadian ini sangat berperan dalam membentuk Welder yang handal, adaptif, dan selalu memperhatikan keselamatan kerja."
  ],
  "Wood Maintenance Technician": [
    "Sebagai Wood Maintenance Technician, dimensi conscientiousness yang tinggi sangat penting untuk memastikan setiap perawatan dan perbaikan dilakukan secara presisi dan sesuai prosedur. Openness memungkinkan teknisi terus mengikuti perkembangan material, teknik terbaru, maupun alat yang lebih efisien. Agreeableness dan extraversion dibutuhkan agar mampu bekerja sama dengan tim proyek, tukang lain, maupun pelanggan yang memerlukan penjelasan tentang hasil perbaikan. Sikap ramah dan terbuka juga membantu teknisi menerima saran, masukan, serta beradaptasi dengan situasi kerja yang berubah. Neuroticism yang rendah akan memudahkan teknisi tetap tenang saat menghadapi masalah, tekanan waktu, atau kondisi lapangan yang menantang. Dengan kelima aspek kepribadian yang optimal, Wood Maintenance Technician dapat diandalkan sebagai solusi masalah perawatan kayu yang efektif dan profesional."
  ],
  "Baker": [
    "Pada profesi Baker, conscientiousness yang tinggi sangat krusial dalam menyiapkan bahan, menimbang resep dengan tepat, serta memastikan proses produksi berjalan rapi, efisien, dan hasil konsisten. Openness dibutuhkan untuk berinovasi dalam pengembangan resep baru, mengikuti tren makanan, serta mencari teknik pemanggangan yang lebih baik. Agreeableness membantu membangun suasana kerja yang harmonis di dapur produksi, menerima kritik konstruktif, serta mendukung kerja tim untuk mencapai target bersama. Extraversion dapat menunjang komunikasi yang baik dengan pelanggan atau anggota tim, terutama dalam situasi padat pesanan atau tekanan waktu. Neuroticism yang rendah membantu Baker tetap fokus, sabar, dan mampu menjaga kualitas kerja meskipun harus menghadapi tekanan atau perubahan mendadak. Kombinasi kelima aspek kepribadian ini sangat mendukung kesuksesan dan efisiensi kerja seorang Baker profesional."
  ]
};
function koreksiBigFive(answers, questions) {
  const result = {
    O: { score: 0, max: 0, name: "Openness" },
    C: { score: 0, max: 0, name: "Conscientiousness" },
    E: { score: 0, max: 0, name: "Extraversion" },
    A: { score: 0, max: 0, name: "Agreeableness" },
    N: { score: 0, max: 0, name: "Neuroticism" }
  };

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    let value = answers[i]; // 1-5
    if (q.reverse) value = 6 - value; // Balik skoring jika reverse
    result[q.dimension].score += value;
    result[q.dimension].max += 5;
  }


  // Hasil: persentase dan level
 const desc = {
  O: [
    // Rendah
    "Rendah: Individu dengan skor rendah pada keterbukaan biasanya sangat menghargai tradisi, lebih nyaman dengan rutinitas, dan jarang mencari pengalaman baru. Mereka cenderung mengikuti pola pikir dan metode yang sudah terbukti, serta enggan mengambil risiko dengan mencoba pendekatan yang berbeda. Ide-ide inovatif atau perubahan besar sering dianggap sebagai sesuatu yang membebani atau mengganggu kestabilan kerja. Hal ini dapat membuat individu ini kurang fleksibel dalam menyesuaikan diri terhadap perkembangan zaman atau kebutuhan organisasi yang berubah. Meskipun demikian, sikap ini juga membuat mereka konsisten dan dapat diandalkan dalam menjalankan prosedur yang sudah ditetapkan.",
    // Sedang
    "Sedang: Skor sedang pada dimensi keterbukaan menunjukkan kemampuan adaptasi yang cukup baik, meskipun terkadang masih bergantung pada kenyamanan zona rutinitas. Individu ini dapat menerima perubahan dan mencoba ide-ide baru, terutama bila ada dorongan dari lingkungan atau kebutuhan pekerjaan. Mereka dapat bekerja dengan metode baru atau tradisional secara bergantian sesuai situasi, namun biasanya tidak terlalu menonjol dalam mencetuskan inovasi. Fleksibilitas mereka membuat mereka mampu menjaga keseimbangan antara stabilitas dan kemajuan. Dalam tim, individu ini sering berperan sebagai penyeimbang antara anggota yang inovatif dan yang konvensional.",
    // Tinggi
    "Tinggi: Individu dengan skor tinggi pada aspek keterbukaan dikenal sangat imajinatif, kreatif, dan selalu ingin tahu terhadap hal-hal baru. Mereka secara aktif mencari informasi, senang mengembangkan keterampilan, serta terbuka terhadap perubahan dan kemajuan teknologi. Pendekatan kerja mereka penuh inovasi, sering kali berinisiatif memperkenalkan cara-cara baru untuk meningkatkan efektivitas atau efisiensi. Individu seperti ini mudah beradaptasi dengan lingkungan yang dinamis dan mendorong anggota tim lainnya untuk berpikir lebih terbuka. Sikap antusias dan proaktif terhadap pembelajaran sepanjang hayat menjadi keunggulan utama yang membantu perkembangan organisasi."
  ],
  C: [
    // Rendah
    "Rendah: Individu yang memiliki skor rendah pada conscientiousness seringkali menunjukkan perilaku yang kurang teratur dan kurang teliti dalam mengelola tugas-tugasnya. Mereka mudah teralihkan perhatiannya, sering menunda pekerjaan, dan kurang konsisten dalam menuntaskan tanggung jawab. Hal ini berdampak pada akurasi dan kualitas hasil kerja yang cenderung fluktuatif. Kemampuan manajemen waktu dan prioritas pekerjaan masih perlu banyak perbaikan, sehingga berpotensi mempengaruhi produktivitas tim atau instansi. Dalam lingkungan kerja, individu ini memerlukan pengawasan atau panduan yang lebih ketat agar dapat bekerja secara efektif.",
    // Sedang
    "Sedang: Skor sedang pada conscientiousness menggambarkan seseorang yang umumnya cukup terorganisir dan bertanggung jawab, meskipun kadang masih melakukan kelalaian kecil. Mereka biasanya dapat menjaga disiplin kerja dan menyelesaikan tugas tepat waktu, namun dalam situasi tekanan tinggi atau banyak pekerjaan, fokus dan ketelitian bisa menurun. Individu ini cukup bisa diandalkan untuk pekerjaan rutin, namun perlu meningkatkan konsistensi dalam memperhatikan detail dan mengikuti prosedur. Kemampuan untuk menyeimbangkan antara kualitas dan kuantitas pekerjaan sudah baik, namun butuh strategi lebih agar hasil kerja selalu optimal. Kedisiplinan mereka menjadi modal dasar untuk berkembang lebih jauh.",
    // Tinggi
    "Tinggi: Individu dengan skor tinggi dalam conscientiousness sangat terorganisir, konsisten, dan teliti dalam setiap aspek pekerjaannya. Mereka memiliki komitmen yang kuat terhadap tanggung jawab, selalu merencanakan setiap aktivitas dengan baik, dan memastikan semua pekerjaan diselesaikan secara sistematis. Tingkat akurasi, disiplin, dan dedikasi mereka di atas rata-rata, sehingga sangat dapat diandalkan baik dalam pekerjaan individu maupun tim. Mereka jarang melewatkan detail, selalu mematuhi tenggat waktu, dan memiliki motivasi tinggi untuk mencapai hasil terbaik. Sikap ini secara langsung berkontribusi pada efisiensi serta mutu organisasi atau tim tempat mereka bekerja."
  ],
  E: [
    // Rendah
    "Rendah: Individu dengan skor rendah pada ekstraversi cenderung menikmati aktivitas yang dilakukan secara mandiri dan lebih suka bekerja di lingkungan yang tenang. Mereka sering merasa tidak nyaman dalam kelompok besar atau situasi yang membutuhkan banyak komunikasi. Kecenderungan untuk menjadi pendiam atau pemalu membuat mereka jarang mengambil inisiatif dalam percakapan atau diskusi tim. Meskipun demikian, mereka biasanya dapat fokus lebih lama pada tugas-tugas yang membutuhkan konsentrasi tinggi. Namun, mereka mungkin melewatkan peluang kerja sama atau pertukaran ide yang bermanfaat bagi perkembangan diri maupun tim.",
    // Sedang
    "Sedang: Individu dengan skor sedang pada ekstraversi mampu menyesuaikan diri dengan situasi sosial, baik saat bekerja secara tim maupun individu. Mereka dapat berinteraksi dengan baik di lingkungan kerja, meskipun terkadang tetap membutuhkan waktu untuk menyendiri guna mengisi ulang energi. Kemampuan komunikasi cukup baik, walaupun tidak selalu menjadi motor penggerak dalam kelompok. Mereka bisa berperan sebagai jembatan antar individu yang sangat ekstrovert dan sangat introvert. Fleksibilitas ini membantu menjaga keharmonisan tim dan efisiensi komunikasi di lingkungan kerja.",
    // Tinggi
    "Tinggi: Skor tinggi pada ekstraversi menandakan individu yang sangat antusias, energik, dan suka berinteraksi dengan berbagai kalangan. Mereka mudah membaur, percaya diri dalam situasi sosial, dan aktif membangun relasi baik di dalam maupun di luar lingkungan kerja. Sifat komunikatif dan optimis mereka menciptakan suasana kerja yang positif dan mendorong partisipasi tim. Individu ini sering menjadi penggerak utama dalam kegiatan kelompok, mampu menginspirasi dan memberikan energi positif kepada rekan-rekannya. Keterampilan interpersonal yang tinggi menjadi modal penting untuk keberhasilan kerja tim maupun kepemimpinan."
  ],
  A: [
    // Rendah
    "Rendah: Individu dengan skor rendah pada agreeableness cenderung bersikap tegas bahkan keras kepala, serta kurang peduli terhadap perasaan atau kebutuhan orang lain. Mereka lebih suka bersaing daripada bekerja sama, dan dalam diskusi seringkali mempertahankan pendapat sendiri tanpa banyak kompromi. Sikap kritis ini bisa berdampak positif dalam pengambilan keputusan yang tegas, namun berpotensi menghambat keharmonisan hubungan kerja jika tidak dikendalikan. Empati dan toleransi terhadap perbedaan pandangan masih perlu dikembangkan agar dapat bekerja efektif dalam tim. Dalam situasi konflik, mereka lebih memilih konfrontasi daripada penyelesaian damai.",
    // Sedang
    "Sedang: Skor sedang pada agreeableness menggambarkan seseorang yang mampu bekerja sama dan membina hubungan baik, meski terkadang masih mempertahankan kepentingan pribadi. Mereka dapat bersikap ramah dan membantu, tetapi tidak selalu menomorsatukan kebutuhan orang lain. Sikap fleksibel membuat mereka bisa menyesuaikan diri dengan dinamika tim, meskipun dalam situasi tertentu dapat bersikap kritis atau kurang kooperatif. Individu ini mampu mengelola konflik secara moderat dan menjaga keseimbangan antara asertivitas serta empati. Hubungan sosial yang dibangun cukup harmonis, meski masih bisa diperkuat.",
    // Tinggi
    "Tinggi: Individu dengan skor tinggi pada agreeableness sangat ramah, kooperatif, dan penuh empati terhadap orang di sekitarnya. Mereka mudah dipercaya, sangat peduli pada kebutuhan rekan kerja, dan selalu berusaha menjaga suasana harmonis di lingkungan kerja. Kemampuan untuk mendengarkan, memahami, dan membantu orang lain menjadi keunggulan utama dalam membangun hubungan yang solid. Mereka cenderung mengutamakan kepentingan bersama dan mampu meredam konflik dengan pendekatan yang penuh pengertian. Sikap ini membuat mereka sangat efektif dalam kolaborasi tim, pelayanan, atau peran yang membutuhkan interaksi sosial intensif."
  ],
  N: [
    // Rendah
    "Rendah: Skor rendah pada neurotisme menandakan individu yang sangat stabil secara emosional, tidak mudah cemas, dan mampu tetap tenang di bawah tekanan. Mereka jarang merasa terpengaruh oleh stres, selalu berpikir jernih ketika menghadapi masalah, dan mampu membuat keputusan rasional bahkan dalam situasi sulit. Kemampuan mengelola emosi yang baik ini berdampak positif pada suasana kerja dan memberikan contoh bagi rekan-rekan lain. Risiko terjadinya konflik akibat emosi yang tidak stabil sangat minim. Mereka menjadi sumber ketenangan dan penyeimbang di lingkungan kerja.",
    // Sedang
    "Sedang: Individu dengan skor sedang pada neurotisme kadang mengalami kecemasan atau tekanan emosional, terutama saat menghadapi tantangan besar. Namun, mereka umumnya dapat mengendalikan diri dan kembali stabil setelah mendapatkan dukungan atau waktu untuk menenangkan pikiran. Keseimbangan antara kestabilan dan sensitivitas membuat mereka cukup tahan banting, meski terkadang membutuhkan strategi khusus untuk menjaga kesehatan mental. Kemampuan mengatasi stres sudah baik, tetapi masih bisa ditingkatkan melalui latihan manajemen emosi.",
    // Tinggi
    "Tinggi: Individu dengan skor tinggi pada neurotisme mudah merasa cemas, sensitif terhadap kritik, dan rentan terhadap stres dalam menghadapi tekanan pekerjaan atau perubahan mendadak. Mereka sering merasa tidak aman dan mudah terpancing emosi dalam situasi yang menantang. Hal ini bisa mengganggu produktivitas serta hubungan kerja jika tidak diimbangi dengan keterampilan manajemen stres yang baik. Dukungan lingkungan dan pengembangan strategi coping sangat dibutuhkan agar individu tetap dapat berfungsi optimal dalam organisasi. Pengelolaan emosi yang efektif akan menjadi kunci untuk meningkatkan performa serta kesehatan psikologis mereka."
  ]
};


  const final = {};
  for (const dim in result) {
    const percent = Math.round((result[dim].score / result[dim].max) * 100);
    let idx;
    if (percent < 40) idx = 0;
    else if (percent < 70) idx = 1;
    else idx = 2;
    final[dim] = {
      name: result[dim].name,
      percent,
      desc: desc[dim][idx]
    };
  }
  return final;
}


// ===== FUNGSI ANALISIS HASIL — VERSI UGM (nama tetap) =====
function analyzeKraeplin() {
  const user = appState.answers.KRAEPLIN || [];
  const key  = appState.kraeplinKey || [];
  const history = appState.kraeplinHistory || {};

  const isiPerKolom = [];
  const benarPerKolom = [];
  const salahPerKolom = [];
  const skippedPerKolom = [];

  let totalBenar = 0, totalSalah = 0, totalSkipped = 0, kolomTerisi = 0, dibenarkan = 0;

  // Analisis per kolom (UGM)
  for (let col = 0; col < user.length; col++) {
    const U = user[col], K = key[col];
    if (!Array.isArray(U) || !Array.isArray(K)) continue;

    const n = Math.min(U.length, K.length);
    let isi = 0, b = 0, s = 0, sk = 0;

    for (let row = 0; row < n; row++) {
      const ans = U[row];
      const kunci = K[row];

      // kosong = loncatan (skipped)
      if (ans === null || typeof ans === "undefined") { sk++; continue; }

      isi++;
      if (ans === kunci) {
        b++;
        // dibenarkan: sebelumnya salah lalu jadi benar
        const hKey = `${col}-${row}`;
        const riwayat = history[hKey] || [];
        if (riwayat.length > 1 && riwayat.some(v => v !== kunci)) dibenarkan++;
      } else {
        s++;
      }
    }

    if (isi + sk > 0) {
      isiPerKolom.push(isi);
      benarPerKolom.push(b);
      salahPerKolom.push(s);
      skippedPerKolom.push(sk);

      totalBenar += b; totalSalah += s; totalSkipped += sk;
      kolomTerisi++;
    }
  }

  // Dasar (informasi tambahan/kompat)
  const kecepatan = isiPerKolom.reduce((a,b)=>a+b,0);            // total DIISI
  const avgIsiPerKolom = isiPerKolom.length ? kecepatan/isiPerKolom.length : 0;
  const totalSoal = kecepatan;                                   // yang DIISI (tanpa skipped)
  const ketelitian = totalSoal ? (totalBenar/totalSoal)*100 : 0; // % benar total

  // ===== Istilah UGM =====
  const panker  = avgIsiPerKolom;                  // laju kerja: rata item/lajur (15 dtk)
  const tianker = totalSalah + totalSkipped;       // ketelitian: error + loncatan

  // JANKER: keajegan (lebih kecil = lebih ajeg)
  let jankerRange = 0, jankerAvgDev = 0;
  if (isiPerKolom.length) {
    const maxY = Math.max(...isiPerKolom), minY = Math.min(...isiPerKolom);
    jankerRange = maxY - minY;
    jankerAvgDev = isiPerKolom.reduce((a,y)=>a+Math.abs(y-avgIsiPerKolom),0) / isiPerKolom.length;
  }

  // HANKER: ketahanan = (y50 - y0) dari garis regresi (slope × 50)
  let slope = 0, hanker = 0;
  if (isiPerKolom.length >= 2) {
    const N = isiPerKolom.length;
    const xs = Array.from({length:N}, (_,i)=>i+1);
    const meanX = xs.reduce((a,c)=>a+c,0)/N;
    const meanY = avgIsiPerKolom;
    const num = xs.reduce((a,x,i)=>a + (x-meanX)*(isiPerKolom[i]-meanY), 0);
    const den = xs.reduce((a,x)=>a + Math.pow(x-meanX,2), 0);
    slope = den ? (num/den) : 0;
    hanker = slope * 50; // proyeksi perubahan dari awal → lajur 50
  }

  // Mental fatigue (opsional, tetap)
  let mentalFatigue = 0;
  if (isiPerKolom.length >= 4) {
    const q = Math.floor(isiPerKolom.length/4);
    const awal  = isiPerKolom.slice(0,q).reduce((a,b)=>a+b,0)/(q||1);
    const akhir = isiPerKolom.slice(-q).reduce((a,b)=>a+b,0)/(q||1);
    mentalFatigue = awal>0 ? ((awal-akhir)/awal)*100 : 0;
  }

  // Akurasi per kolom (untuk grafik)
  const akurasiPerKolom = isiPerKolom.map((isi,i)=> isi>0 ? (benarPerKolom[i]/isi)*100 : 0);
  const rataAkurasi = akurasiPerKolom.length ? akurasiPerKolom.reduce((a,b)=>a+b,0)/akurasiPerKolom.length : 0;

  // (Kompat) keajegan lama
  const diffs = [];
  for (let i = 1; i < isiPerKolom.length; i++) diffs.push(Math.abs(isiPerKolom[i]-isiPerKolom[i-1]));
  const rataFluktuasi = diffs.length ? diffs.reduce((a,b)=>a+b,0)/diffs.length : 0;
  const koefisienKonsistensi = avgIsiPerKolom ? (rataFluktuasi/avgIsiPerKolom)*100 : 0;

  return {
    // total & dasar (kompat)
    benar: totalBenar,
    salah: totalSalah,
    dibenarkan,
    total: totalSoal,
    ketelitian,                 // % benar total (informasi tambahan)
    kecepatan,                  // total DIISI
    isiPerKolom,
    akurasiPerKolom,
    keajegan: rataFluktuasi,
    koefisienKonsistensi,
    ketahananSlope: slope,
    mentalFatigue,
    avgIsi: avgIsiPerKolom,
    rataAkurasi,
    kolomTerisi,

    // skor UGM (inti)
    panker,                     // laju: mean isi/lajur
    tianker,                    // ketelitian: error + loncatan
    jankerRange,
    jankerAvgDev,
    hanker
  };
}


// Fungsi kategorisasi (tetap; tidak dipakai untuk UGM kecuali ketahanan deskriptif)
function kraeplinKategori(skor, jenisMetric, tresholds) {
  const defaultThresholds = {
    kecepatan: [100, 200, 300, 400],
    ketelitian: [60, 70, 80, 90],
    konsistensi: [40, 30, 20, 10], // (legacy)
    ketahanan: [-0.5, -0.2, 0.2, 0.5]
  };
  const thresholds = tresholds || defaultThresholds[jenisMetric] || [20, 40, 60, 80];
  if (skor <= thresholds[0]) return "Rendah Sekali";
  if (skor <= thresholds[1]) return "Rendah";
  if (skor <= thresholds[2]) return "Cukup";
  if (skor <= thresholds[3]) return "Tinggi";
  return "Tinggi Sekali";
}


// ===== FUNGSI LAPORAN — VERSI UGM (nama tetap) =====
function generateKraeplinReport(analysis) {
  const {
    // UGM core
    panker, tianker, jankerRange, jankerAvgDev, hanker,
    // tambahan/kompat
    benar, salah, dibenarkan, total, ketelitian, kecepatan,
    ketahananSlope, mentalFatigue, avgIsi, kolomTerisi
  } = analysis;

  // Kategori ketahanan (arah)
  let kategoriKetahanan;
  if (hanker < -1) kategoriKetahanan = "Menurun";
  else if (hanker > 1) kategoriKetahanan = "Meningkat";
  else kategoriKetahanan = "Stabil";

  // ===== Kategori 5-level (Sangat Tinggi s.d. Rendah Sekali) =====
  const LABELS5 = ["Rendah Sekali","Rendah","Cukup","Tinggi","Sangat Tinggi"];

  // Ambang ASC (operasional 15 dtk/lajur)
  // PANKER (lebih besar lebih baik)
  const bandsP = [10, 14, 18, 22];
  // TIANKER (lebih kecil lebih baik) → pakai ASC lalu dibalik labelnya
  const bandsT = [5, 10, 15, 20];
  // JANKER avgDev (lebih kecil lebih baik)
  const bandsJ = [1.5, 2.5, 4.0, 6.0];

  function pickLabel5(value, bandsAsc, invert=false) {
    const [b1,b2,b3,b4] = bandsAsc;
    let idx = 0;
    if (value <= b1) idx = 0;
    else if (value <= b2) idx = 1;
    else if (value <= b3) idx = 2;
    else if (value <= b4) idx = 3;
    else idx = 4;
    return invert ? LABELS5.slice().reverse()[idx] : LABELS5[idx];
  }

  const catP = pickLabel5(panker ?? 0,       bandsP, false);
  const catT = pickLabel5(tianker ?? 0,      bandsT, true);
  const catJ = pickLabel5(jankerAvgDev ?? 0, bandsJ, true);

  // Aspek yang perlu penguatan
  const lowList = [];
  if (catP === "Rendah" || catP === "Rendah Sekali") lowList.push("tempo kerja");
  if (catT === "Rendah" || catT === "Rendah Sekali") lowList.push("ketelitian");
  if (catJ === "Rendah" || catJ === "Rendah Sekali") lowList.push("keajegan");
  if (kategoriKetahanan === "Menurun")               lowList.push("ketahanan (ritme menurun)");

  // Tuntutan peran (opsional)
  function roleDemand(pos) {
    switch (pos) {
      case "Administrator":
        return "tugas administratif yang menuntut ketelitian arsip, konsistensi pencatatan, dan ritme kerja stabil";
      case "Technical Staff":
        return "tugas teknis yang menuntut tempo eksekusi, ketahanan pada repetisi, dan kestabilan kualitas";
      case "Housekeeping":
        return "tugas kebersihan yang menuntut tempo terjaga, perhatian detail, dan kesinambungan hasil";
      default:
        return "tugas harian yang menuntut keseimbangan tempo, ketelitian, dan kestabilan";
    }
  }

  const posisi = (appState?.identity?.position || "").trim();
  function roleSentence(pos) {
    const angka = ` (PANKER ${ (panker??0).toFixed(1) }/lajur; TIANKER ${ tianker??0 }; JANKER ${ (jankerAvgDev??0).toFixed(2) }; HANKER ${(hanker>=0?"+":"")}${ (hanker??0).toFixed(2) })`;
    const dasar = `Untuk posisi ${pos}, profil menunjukkan kecepatan ${catP.toLowerCase()}, ketelitian ${catT.toLowerCase()}, keajegan ${catJ.toLowerCase()}, serta ketahanan yang ${kategoriKetahanan.toLowerCase()}; `;
    if (!lowList.length) return dasar + `kombinasi ini mendukung ${roleDemand(pos)}.` + angka;
    const joinLow = lowList.join(", ").replace(", ketahanan", " dan ketahanan");
    return dasar + `perlu penguatan pada ${joinLow} agar lebih selaras dengan ${roleDemand(pos)}.` + angka;
  }
  const interpretasiPosisi = (posisi && posisi !== "Guru") ? roleSentence(posisi) : null;

  return {
    skor: {
      // Inti UGM
      PANKER: panker,
      TIANKER: tianker,
      JANKER: { range: jankerRange, avgDev: jankerAvgDev },
      HANKER: hanker,

      // Tambahan kompat
      kecepatan,
      ketelitian,
      konsistensi: analysis.koefisienKonsistensi,
      ketahanan: ketahananSlope,
      mentalFatigue
    },
    kategori: {
      panker: catP,
      tianker: catT,
      janker: catJ,
      ketahanan: kategoriKetahanan
    },
    interpretasi: {
      // Narasi UGM generik (tetap ada)
      panker: `Laju kerja (PANKER): rata-rata ${(panker??0).toFixed(1)} item per lajur (15 detik/lajur).`,
      tianker: `Ketelitian (TIANKER): total kesalahan + loncatan = ${tianker??0}. Semakin kecil → semakin teliti.`,
      janker: `Keajegan (JANKER): rentang ${jankerRange??0}, deviasi rata-rata ${(jankerAvgDev??0).toFixed(2)}. Semakin kecil → semakin ajeg/stabil.`,
      hanker: `Ketahanan (HANKER): ${kategoriKetahanan} (Δ≈ ${(hanker??0).toFixed(2)} item dari awal menuju lajur 50).`,

      // Ringkas tambahan kompat
      kecepatan: `Total item diisi: ${kecepatan??0} (rata ${(avgIsi??0).toFixed(1)}/lajur, ${kolomTerisi??0} lajur dikerjakan).`,
      ketelitian_lama: `Akurasi keseluruhan (informasi tambahan): ${(ketelitian??0).toFixed(1)}%.`,

      // Kalimat psikologis sesuai posisi (kecuali Guru)
      posisi: interpretasiPosisi
    },
    detail: {
      jawabanBenar: benar,
      jawabanSalah: salah,
      jawabanDibenarkan: dibenarkan,
      totalDiisi: total,
      kolomDikerjakan: kolomTerisi
    }
  };
}


// ====== KRAEPLIN: Render Grafik Per Kolom (tanpa Chart.js) ======
function renderKraeplinChartToPDF(doc, x, y, width, height, data, opts = {}) {
  if (!Array.isArray(data) || data.length === 0) return y;

  // Opsi dasar
  const title   = opts.title   ?? '';
  const xLabel  = opts.xLabel  ?? '';
  const yLabel  = opts.yLabel  ?? '';
  const padL    = opts.padL    ?? 18;
  const padR    = opts.padR    ?? 4;
  const padT    = opts.padT    ?? (title ? 10 : 8);
  const padB    = opts.padB    ?? 12;
  const showPts = opts.showPts ?? true;

  // Tambahan opsi
  const pointLabels    = opts.pointLabels ?? false;
  const labelEveryPt   = opts.labelEveryPt ?? 1;
  const yTicksExplicit = Array.isArray(opts.yTicksExplicit) ? opts.yTicksExplicit : null;
  const yTickEvery     = opts.yTickEvery ?? 1;

  // Penanda puncak/terendah & garis tengah
  const markExtrema    = opts.markExtrema ?? true;
  const showMidrange   = opts.showMidrange ?? true;
  const midrangeLabel  = opts.midrangeLabel ?? 'Garis tengah (max–min)';

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);

  function niceNum(range, round) {
    const exp = Math.floor(Math.log10(range || 1));
    const f   = (range || 1) / Math.pow(10, exp);
    let nf;
    if (round) { if (f < 1.5) nf = 1; else if (f < 3) nf = 2; else if (f < 7) nf = 5; else nf = 10; }
    else       { if (f <= 1)  nf = 1; else if (f <= 2) nf = 2; else if (f <= 5) nf = 5; else nf = 10; }
    return nf * Math.pow(10, exp);
  }
  function niceScale(min, max, maxTicks) {
    const range    = niceNum(max - min || 1, false);
    const d        = niceNum(range / (maxTicks - 1), true);
    const graphMin = Math.floor(min / d) * d;
    const graphMax = Math.ceil (max / d) * d;
    return { min: graphMin, max: graphMax, step: d };
  }

  let yMin = (opts.yMin != null) ? opts.yMin : minVal;
  let yMax = (opts.yMax != null) ? opts.yMax : maxVal;
  if ((opts.yMin == null || opts.yMax == null) && !yTicksExplicit) {
    const n = niceScale(yMin, yMax, 6);
    if (opts.yMin == null) yMin = n.min;
    if (opts.yMax == null) yMax = n.max;
  }
  if (yMax === yMin) yMax = yMin + 1;

  // Area plot
  const px0 = x + padL;
  const py0 = y + padT;
  const pw  = Math.max(10, width  - padL - padR);
  const ph  = Math.max(10, height - padT - padB);

  // Judul
  if (title) {
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.text(title, x + width/2, y + 5, { align: 'center' });
    doc.setFont(undefined, 'normal');
  }

  // Bingkai
  doc.setDrawColor(180, 190, 200);
  doc.setLineWidth(0.2);
  doc.rect(px0, py0, pw, ph);

  // Grid & label Y
  doc.setFontSize(5);
  if (yTicksExplicit) {
    for (let i = 0; i < yTicksExplicit.length; i++) {
      const v  = yTicksExplicit[i];
      if (v < yMin || v > yMax) continue;
      const ry = py0 + ph - ((v - yMin) / (yMax - yMin)) * ph;
      doc.setDrawColor(235, 238, 240); doc.line(px0, ry, px0 + pw, ry);
      if (i % yTickEvery === 0) { doc.setTextColor(60); doc.text(String(v), px0 - 1.5, ry + 1.5, { align: 'right' }); }
    }
  } else {
    const ticks = 5;
    const step  = (yMax - yMin) / ticks;
    for (let i = 0; i <= ticks; i++) {
      const v  = yMin + i * step;
      const ry = py0 + ph - ((v - yMin) / (yMax - yMin)) * ph;
      doc.setDrawColor(235, 238, 240); doc.line(px0, ry, px0 + pw, ry);
      doc.setTextColor(60);
      const label = (Math.round(v * 10) / 10).toString();
      doc.text(label, px0 - 1.5, ry + 1.5, { align: 'right' });
    }
  }

  // Label sumbu Y
  if (yLabel) {
    doc.setTextColor(40);
    doc.setFontSize(6);
    doc.text(yLabel, x + 2, py0 + ph/2, { angle: 90 });
  }

  // Label sumbu X
  doc.setTextColor(60);
  doc.setFontSize(5.5);
  const maxXTicks = Math.min(18, data.length);
  const everyX = Math.max(1, Math.ceil(data.length / maxXTicks));
  for (let i = 0; i < data.length; i += everyX) {
    const rx = px0 + (i / (data.length - 1)) * pw;
    doc.text(String(i + 1), rx, py0 + ph + 4, { align: 'center' });
  }
  if (xLabel) {
    doc.setTextColor(40);
    doc.setFontSize(6);
    doc.text(xLabel, px0 + pw/2, py0 + ph + 7, { align: 'center' });
  }

  // Konversi koordinat
  const toPX = (idx) => px0 + (idx / (data.length - 1)) * pw;
  const toPY = (val) => py0 + ph - ((val - yMin) / (yMax - yMin)) * ph;

  // Garis data
  doc.setDrawColor(231, 76, 60);
  doc.setLineWidth(0.5);
  for (let i = 0; i < data.length - 1; i++) {
    doc.line(toPX(i), toPY(data[i]), toPX(i + 1), toPY(data[i + 1]));
  }

  // Titik data
  if (showPts) {
    doc.setFillColor(41, 128, 185);
    for (let i = 0; i < data.length; i++) {
      const cx = toPX(i), cy = toPY(data[i]);
      if (doc.circle) doc.circle(cx, cy, 0.7, 'F'); else doc.rect(cx - 0.5, cy - 0.5, 1, 1, 'F');
    }
  }

  // Ekstrema & midrange
  const idxMax = data.indexOf(maxVal);
  const idxMin = data.indexOf(minVal);
  const cxMax = toPX(idxMax), cyMax = toPY(maxVal);
  const cxMin = toPX(idxMin), cyMin = toPY(minVal);

  if (showMidrange) {
    const mid = (maxVal + minVal) / 2;
    const ryMid = toPY(mid);
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.2);
    doc.line(px0, ryMid, px0 + pw, ryMid);
    doc.setFontSize(5.5);
    doc.setTextColor(80);
    doc.text(`${midrangeLabel}: ${mid.toFixed(1)}`, px0 + pw, ryMid - 1.2, { align: 'right' });
  }

  if (markExtrema) {
    // MAX
    doc.setFillColor(22, 163, 74);
    if (doc.circle) doc.circle(cxMax, cyMax, 1.3, 'F'); else doc.rect(cxMax - 1, cyMax - 1, 2, 2, 'F');
    doc.setFontSize(6); doc.setTextColor(22, 163, 74);
    doc.text(`Puncak: ${maxVal} (kolom ${idxMax+1})`, cxMax, cyMax - 2.2, { align: 'center' });

    // MIN
    doc.setFillColor(220, 38, 38);
    if (doc.circle) doc.circle(cxMin, cyMin, 1.3, 'F'); else doc.rect(cxMin - 1, cyMin - 1, 2, 2, 'F');
    doc.setFontSize(6); doc.setTextColor(220, 38, 38);
    doc.text(`Terendah: ${minVal} (kolom ${idxMin+1})`, cxMin, cyMin + 3.2, { align: 'center' });

    doc.setTextColor(30);
  }

  // Label nilai titik (opsional)
  if (pointLabels) {
    doc.setFontSize(5);
    doc.setTextColor(30);
    for (let i = 0; i < data.length; i++) {
      if (i % labelEveryPt !== 0) continue;
      const cx = toPX(i), cy = toPY(data[i]);
      doc.text(String(data[i]), cx, cy - 1.4, { align: 'center' });
    }
  }

  // Footer note opsional
  if (opts.footerNote) {
    doc.setFontSize(5.5);
    doc.setTextColor(80);
    doc.text(opts.footerNote, px0 + 1, py0 - 1.5);
  }

  return y + height + 4;
}




// Password protection
let downloadClickCount = 0;
let PASSWORD = localStorage.getItem('usedPragas') === '1' ? "SugarGroup234" : "SugarSchools111";


// --- Efek suara welcome (futuristik) ---

function playFuturisticSound() {
    // MP3 Welcome
    const audioWelcome = new Audio('https://cdn.jsdelivr.net/gh/Pragas123/assets@main/futuristic.mp3');
    audioWelcome.volume = 0.80;
    audioWelcome.play();

    // MP3 TTS Benar Password
    const audioTTS = new Audio('https://cdn.jsdelivr.net/gh/Pragas123/assets@70d6b32ad0b433b80453e5cd0897f5a541e7075d/welcome.mp3');
    audioTTS.volume = 0.65;
    audioTTS.play();

    // OSCILLATOR Futuristik
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const mainDuration = 0.65;

    // Main layer
    const mainOsc = ctx.createOscillator();
    const mainGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    mainOsc.type = "sawtooth";
    mainOsc.frequency.setValueAtTime(180, now);
    mainOsc.frequency.exponentialRampToValueAtTime(2200, now + 0.18);
    mainOsc.frequency.exponentialRampToValueAtTime(900, now + 0.4);

    // Detune mod
    const detuneOsc = ctx.createOscillator();
    detuneOsc.type = "sine";
    detuneOsc.frequency.value = 16;
    detuneOsc.connect(mainOsc.detune);
    mainOsc.detune.value = 15;

    // Filter
    filter.type = "bandpass";
    filter.frequency.value = 2000;
    filter.Q.value = 12;
    filter.frequency.exponentialRampToValueAtTime(800, now + mainDuration);

    // Gain envelope
    mainGain.gain.setValueCurveAtTime(
        [0, 0.8, 0.3, 0.6, 0.2, 0],
        now,
        mainDuration,
        0.2
    );

    mainOsc.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(ctx.destination);

    // Layer digital glitch
    const addGlitch = (time) => {
        const glitch = ctx.createOscillator();
        const glitchGain = ctx.createGain();
        glitch.type = "square";
        glitch.frequency.value = 3800 + Math.random() * 1000;
        glitchGain.gain.value = 0.22;
        glitchGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        glitch.connect(glitchGain);
        glitchGain.connect(ctx.destination);
        glitch.start(time);
        glitch.stop(time + 0.08);
    };

    // Suara bassline sub
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.value = 90;
    subGain.gain.value = 0.15;
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    // Start semua
    mainOsc.start(now);
    detuneOsc.start(now);
    subOsc.start(now);

    mainOsc.stop(now + mainDuration);
    detuneOsc.stop(now + mainDuration);
    subOsc.stop(now + 0.5);

    addGlitch(now + 0.12);
    addGlitch(now + 0.35);
    setTimeout(() => addGlitch(ctx.currentTime), 480);
}

// --- Cek Password ---
function checkPassword() {
    const input = document.getElementById('passwordInput');
    const error = document.getElementById('passwordError');
    if (input.value === PASSWORD) {
        playFuturisticSound();
        error.textContent = '';
        document.getElementById('welcomeMessage').classList.add('show');
        document.getElementById('passwordLogo').classList.add('small');
        document.getElementById('passwordForm').style.opacity = '0';
        document.getElementById('passwordForm').style.pointerEvents = 'none';
        setTimeout(() => {
            document.getElementById('passwordScreen').classList.add('hidden');
            renderIdentityForm();
        }, 1500);
    } else {
        error.textContent = 'Kode akses salah!';
        input.focus();
    }
}
document.getElementById('passwordInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkPassword();
    }
});
window.addEventListener('load', function() {
    document.getElementById('passwordInput').focus();
});
function resetToLogin() {
  document.getElementById('passwordScreen').classList.remove('hidden');
  document.getElementById('passwordForm').style.opacity = '1';
  document.getElementById('passwordForm').style.pointerEvents = 'auto';
  document.getElementById('passwordInput').value = '';
  document.getElementById('passwordError').textContent = '';
  document.getElementById('welcomeMessage').classList.remove('show');
  document.getElementById('passwordLogo').classList.remove('small');
  document.getElementById('app').innerHTML = '';
  setTimeout(()=>document.getElementById('passwordInput').focus(), 150);
}
// --- Utility: Hitung Umur ---
function calculateAge(dob) {
    if (!dob) return '';
    const birth = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if (days < 0) {
        months -= 1;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }
    return `${years} tahun ${months} bulan ${days} hari`;
}

// --- Render Identity Form Profesional ---
function renderIdentityForm() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('app').innerHTML = `
    <form id="identityForm" class="identity-grid-form">
      <div class="identity-header full-span">
        <img src="https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/nmqo6a.png" alt="Logo Psikotes" />
        <h1>Data Identitas</h1>
        <p>Silakan isi data diri Anda dengan lengkap dan benar. Semua field <span class="star">*</span> wajib diisi.</p>
      </div>
      <div class="identity-grid-row">
        <div class="identity-grid-group">
          <label for="name">Nama Lengkap <span class="star">*</span></label>
          <input type="text" id="name" required value="${appState.identity?.name||''}">
        </div>
        <div class="identity-grid-group">
          <label for="nickname">Nama Panggilan <span class="star">*</span></label>
          <input type="text" id="nickname" required value="${appState.identity?.nickname||''}">
        </div>
      </div>
      <div class="identity-grid-row">
        <div class="identity-grid-group">
          <label for="email">Email <span class="star">*</span></label>
          <input type="email" id="email" required value="${appState.identity?.email||''}">
        </div>
        <div class="identity-grid-group">
          <label for="phone">Nomor HP <span class="star">*</span></label>
          <input type="tel" id="phone" required value="${appState.identity?.phone||''}">
        </div>
      </div>
      <div class="identity-grid-row">
        <div class="identity-grid-group">
          <label for="dob">Tanggal Lahir <span class="star">*</span></label>
          <input type="date" id="dob" max="${today}" required value="${appState.identity?.dob||''}">
        </div>
        <div class="identity-grid-group">
          <label for="status">Status <span class="star">*</span></label>
          <select id="status" required>
            <option value="" disabled ${!appState.identity?.status ? "selected" : ""}>Pilih Status</option>
            <option value="Lajang" ${appState.identity?.status==="Lajang"?"selected":""}>Lajang</option>
            <option value="Menikah" ${appState.identity?.status==="Menikah"?"selected":""}>Menikah</option>
          </select>
        </div>
      </div>
      <div class="identity-grid-row">
        <div class="identity-grid-group full-span">
          <label for="addressKTP">Alamat KTP <span class="star">*</span></label>
          <input type="text" id="addressKTP" required value="${appState.identity?.addressKTP||''}">
        </div>
      </div>
      <div class="identity-grid-row">
        <div class="identity-grid-group full-span">
          <label for="addressCurrent">Alamat Saat Ini <span class="star">*</span></label>
          <input type="text" id="addressCurrent" required value="${appState.identity?.addressCurrent||''}" ${appState.identity?.sameAddress?'disabled':''}>
          <div class="identity-checkbox-row">
            <input type="checkbox" id="sameAddress" ${appState.identity?.sameAddress?'checked':''} />
            <label for="sameAddress">Sama dengan Alamat KTP</label>
          </div>
        </div>
      </div>
      <div id="dynamicRow"></div>
      <div id="guruAlumniOptions" style="display:none;">
        <div class="identity-alumni-box">
          <div class="identity-checkbox-row">
            <input type="checkbox" id="alumniSGS" ${appState.identity?.alumniSGS ? "checked" : ""} />
            <label for="alumniSGS">Alumni Sugar Group Schools</label>
          </div>
          <div id="alumniLevels" style="display:none;margin-top:8px;">
            <div class="alumni-grid-row">
              <div class="identity-checkbox-row">
                <input type="checkbox" id="alumniSD" ${appState.identity?.alumniSD ? "checked" : ""} />
                <label for="alumniSD">SD</label>
                <input type="text" id="alumniSDText" class="alumni-text" style="display:none;" placeholder="Tahun/Sekolah" value="${appState.identity?.alumniSDText||''}">
              </div>
              <div class="identity-checkbox-row">
                <input type="checkbox" id="alumniSMP" ${appState.identity?.alumniSMP ? "checked" : ""} />
                <label for="alumniSMP">SMP</label>
                <input type="text" id="alumniSMPText" class="alumni-text" style="display:none;" placeholder="Tahun/Sekolah" value="${appState.identity?.alumniSMPText||''}">
              </div>
              <div class="identity-checkbox-row">
                <input type="checkbox" id="alumniSMA" ${appState.identity?.alumniSMA ? "checked" : ""} />
                <label for="alumniSMA">SMA</label>
                <input type="text" id="alumniSMAText" class="alumni-text" style="display:none;" placeholder="Tahun/Sekolah" value="${appState.identity?.alumniSMAText||''}">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="identity-grid-row">
        <div class="identity-grid-group full-span">
          <label for="explanation">Keterangan Tambahan</label>
          <textarea id="explanation">${appState.identity?.explanation||''}</textarea>
        </div>
      </div>
      <div class="identity-grid-row">
        <div class="identity-grid-group full-span">
          <label for="date">Tanggal Pengisian</label>
          <input type="text" id="date" readonly value="${appState.identity?.date||''}" placeholder="Tanggal Pengisian" />
        </div>
      </div>
      <div class="identity-grid-row">
        <div class="identity-grid-group full-span" style="text-align:center;">
          <button type="submit" class="btn-identity">Lanjut</button>
        </div>
      </div>
    </form>

<style>
.identity-grid-form {
  display: flex;
  flex-direction: column;
  gap: 2.1rem;
  max-width: 950px;
  margin: 40px auto 60px auto;
  background: #fff;
  padding: 44px 36px 40px 36px;
  border-radius: 1.18rem;
  box-shadow: 0 4px 36px #0002;
  border: 2px solid #e4e9f2;
}
.identity-header {
  text-align: center;
  grid-column: 1 / -1;
  margin-bottom: 12px;
}
.identity-header img { width: 92px; margin-bottom: 12px; }
.identity-header h1 { font-size: 1.72rem; margin: 7px 0 2px 0;}
.identity-header p { font-size: 1.12em; color: #405168; margin-bottom: 2px;}
.star { color: #e03; font-size: 1em;}
.identity-grid-row { display: flex; gap: 2.2rem; }
.identity-grid-group { flex: 1; display: flex; flex-direction: column; gap: 0.6rem;}
.identity-grid-group.full-span { flex: 1 1 100%; }
input, select, textarea {
  border: 1.6px solid #cbd4ea;
  border-radius: 11px;
  padding: 17px 16px;
  font-size: 1.13em;
  background: #f8fafd;
  min-height: 52px;
  transition: border .18s;
  box-sizing: border-box;
}
input:focus, select:focus, textarea:focus {
  border: 2px solid #318bfa;
  background: #fff;
}
textarea { min-height: 88px; }
.btn-identity {
  background: linear-gradient(90deg,#318bfa 30%,#1461bf 100%);
  color: #fff;
  border: none;
  border-radius: 13px;
  font-size: 1.16em;
  padding: 28px 0;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow: 0 2px 14px #1950b630;
  transition: background .14s;
  margin-top: 8px;
}
.btn-identity:hover {
  background: linear-gradient(90deg,#165fab 0%,#1950b6 100%);
}
.identity-checkbox-row {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 2px;
}
.identity-alumni-box {
  border: 1.1px solid #dbe2ef;
  border-radius: 9px;
  background: #f3f6fb;
  margin: 10px 0 4px 0;
  padding: 18px 14px 12px 14px;
}
.alumni-grid-row {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.alumni-text {
  font-size: 0.98em;
  padding: 8px 11px;
  border: 1.2px solid #bcd;
  border-radius: 7px;
  min-width: 90px;
  margin-left: 8px;
}
@media (max-width:900px) {
  .identity-grid-form { padding: 4vw 1.5vw;}
  .identity-header img { width: 66px;}
  .identity-grid-row { gap: 1.3rem;}
}
@media (max-width:650px) {
  .identity-grid-form { padding: 5vw 1vw;}
  .identity-header img { width:52px;}
  .identity-grid-row, .alumni-grid-row { flex-direction: column; gap: 0.5rem; }
}
</style>
`;

  // ==== Dynamic Row Rendering ====
  function renderDynamicRow() {
    const pos = appState.identity?.position || "";
    let html = "";
    if (pos === "Dosen/Guru") {
      html = `
      <div class="identity-grid-row">
        <div class="identity-grid-group">
          <label for="position">Posisi <span class="star">*</span></label>
          <select id="position" required>
            <option value="" disabled ${!pos ? "selected" : ""}>Pilih Posisi</option>
            <option value="Administrator" ${pos==="Administrator"?"selected":""}>Administrator</option>
            <option value="Dosen/Guru" selected>Dosen/Guru</option>
            <option value="Technical Staff">Technical Staff</option>
            <option value="IT Staff">IT Staff</option>
            <option value="Housekeeping">Housekeeping</option>
          </select>
        </div>
        <div class="identity-grid-group">
          <label for="teacherLevel">Kategori <span class="star">*</span></label>
          <select id="teacherLevel" required>
            <option value="" disabled ${!appState.identity?.teacherLevel ? "selected" : ""}>Pilih Kategori</option>
            <option value="English Lecturer" ${appState.identity?.teacherLevel==="English Lecturer"?"selected":""}>English Lecturer</option>
            <option value="Math Lecturer" ${appState.identity?.teacherLevel==="Math Lecturer"?"selected":""}>Math Lecturer</option>
            <option value="Kindergartens" ${appState.identity?.teacherLevel==="Kindergartens"?"selected":""}>Kindergartens</option>
            <option value="Primary" ${appState.identity?.teacherLevel==="Primary"?"selected":""}>Primary</option>
            <option value="Math" ${appState.identity?.teacherLevel==="Math"?"selected":""}>Math</option>
            <option value="PE & Health" ${appState.identity?.teacherLevel==="PE & Health"?"selected":""}>PE & Health</option>
            <option value="Biology" ${appState.identity?.teacherLevel==="Biology"?"selected":""}>Biology</option>
          </select>
        </div>
        <div class="identity-grid-group">
          <label for="education">Pendidikan <span class="star">*</span></label>
          <select id="education" required>
            <option value="" disabled ${!appState.identity?.education ? "selected" : ""}>Pilih Pendidikan</option>
            <option value="S3" ${appState.identity?.education==="S3"?"selected":""}>S3</option>
            <option value="S2" ${appState.identity?.education==="S2"?"selected":""}>S2</option>
            <option value="S1" ${appState.identity?.education==="S1"?"selected":""}>S1</option>
            <option value="SMA/Sederajat" ${appState.identity?.education==="SMA/Sederajat"?"selected":""}>SMA/Sederajat</option>
            <option value="SMP/Sederajat" ${appState.identity?.education==="SMP/Sederajat"?"selected":""}>SMP/Sederajat</option>
          </select>
        </div>
      </div>`;
    } else if (pos === "Technical Staff") {
      html = `
      <div class="identity-grid-row">
        <div class="identity-grid-group">
          <label for="position">Posisi <span class="star">*</span></label>
          <select id="position" required>
            <option value="" disabled ${!pos ? "selected" : ""}>Pilih Posisi</option>
            <option value="Administrator" ${pos==="Administrator"?"selected":""}>Administrator</option>
            <option value="Dosen/Guru" ${pos==="Dosen/Guru"?"selected":""}>Dosen/Guru</option>
            <option value="Technical Staff" selected>Technical Staff</option>
            <option value="IT Staff" selected>IT Staff</option>
            <option value="Housekeeping">Housekeeping</option>
          </select>
        </div>
        <div class="identity-grid-group">
          <label for="techRole">Role Teknis <span class="star">*</span></label>
          <select id="techRole" required>
            <option value="" disabled ${!appState.identity?.techRole ? "selected" : ""}>Role Teknis</option>
            <option value="Welder" ${appState.identity?.techRole==="Welder"?"selected":""}>Welder</option>
            <option value="Wood Maintenance Technician" ${appState.identity?.techRole==="Wood Maintenance Technician"?"selected":""}>Wood Maintenance Technician</option>
            <option value="Baker" ${appState.identity?.techRole==="Baker"?"selected":""}>Baker</option>
          </select>
        </div>
        <div class="identity-grid-group">
          <label for="education">Pendidikan <span class="star">*</span></label>
          <select id="education" required>
            <option value="" disabled ${!appState.identity?.education ? "selected" : ""}>Pilih Pendidikan</option>
            <option value="S3" ${appState.identity?.education==="S3"?"selected":""}>S3</option>
            <option value="S2" ${appState.identity?.education==="S2"?"selected":""}>S2</option>
            <option value="S1" ${appState.identity?.education==="S1"?"selected":""}>S1</option>
            <option value="SMA/Sederajat" ${appState.identity?.education==="SMA/Sederajat"?"selected":""}>SMA/Sederajat</option>
            <option value="SMP/Sederajat" ${appState.identity?.education==="SMP/Sederajat"?"selected":""}>SMP/Sederajat</option>
          </select>
        </div>
      </div>`;
    } else {
      html = `
      <div class="identity-grid-row">
        <div class="identity-grid-group">
          <label for="position">Posisi <span class="star">*</span></label>
          <select id="position" required>
            <option value="" disabled ${!pos ? "selected" : ""}>Pilih Posisi</option>
            <option value="Administrator" ${pos==="Administrator"?"selected":""}>Administrator</option>
            <option value="Dosen/Guru" ${pos==="Dosen/Guru"?"selected":""}>Dosen/Guru</option>
            <option value="Technical Staff" ${pos==="Technical Staff"?"selected":""}>Technical Staff</option>
             <option value="IT Staff" ${pos==="IT Staff"?"selected":""}>IT Staff</option>
            <option value="Housekeeping" ${pos==="Housekeeping"?"selected":""}>Housekeeping</option>
          </select>
        </div>
        <div class="identity-grid-group">
          <label for="education">Pendidikan <span class="star">*</span></label>
          <select id="education" required>
            <option value="" disabled ${!appState.identity?.education ? "selected" : ""}>Pilih Pendidikan</option>
            <option value="S3" ${appState.identity?.education==="S3"?"selected":""}>S3</option>
            <option value="S2" ${appState.identity?.education==="S2"?"selected":""}>S2</option>
            <option value="S1" ${appState.identity?.education==="S1"?"selected":""}>S1</option>
            <option value="SMA/Sederajat" ${appState.identity?.education==="SMA/Sederajat"?"selected":""}>SMA/Sederajat</option>
            <option value="SMP/Sederajat" ${appState.identity?.education==="SMP/Sederajat"?"selected":""}>SMP/Sederajat</option>
          </select>
        </div>
      </div>`;
    }
    document.getElementById("dynamicRow").innerHTML = html;
    if (document.getElementById('guruAlumniOptions'))
      document.getElementById('guruAlumniOptions').style.display = (pos === "Dosen/Guru") ? 'block' : 'none';
  }
  renderDynamicRow();

  // Event Handler dinamis
  document.getElementById("identityForm").addEventListener("change", function(e) {
    if (["position", "teacherLevel", "techRole", "education"].includes(e.target.id)) {
      appState.identity.position = document.getElementById('position').value;
      appState.identity.teacherLevel = document.getElementById('teacherLevel')?.value || '';
      appState.identity.techRole = document.getElementById('techRole')?.value || '';
      appState.identity.education = document.getElementById('education').value;
      renderDynamicRow();
    }
  });

  // Alumni logic
  const id = document.getElementById.bind(document);
  if (id('alumniSGS')) {
    id('alumniSGS').addEventListener('change', function() {
      id('alumniLevels').style.display = this.checked ? 'block' : 'none';
    });
    if (id('alumniSGS').checked) id('alumniLevels').style.display = 'block';
    if (id('alumniSD')) id('alumniSD').addEventListener('change', showAlumniInputs);
    if (id('alumniSMP')) id('alumniSMP').addEventListener('change', showAlumniInputs);
    if (id('alumniSMA')) id('alumniSMA').addEventListener('change', showAlumniInputs);
    function showAlumniInputs() {
      id('alumniSDText').style.display = id('alumniSD')?.checked ? 'inline-block' : 'none';
      id('alumniSMPText').style.display = id('alumniSMP')?.checked ? 'inline-block' : 'none';
      id('alumniSMAText').style.display = id('alumniSMA')?.checked ? 'inline-block' : 'none';
    }
    showAlumniInputs();
  }
  id('sameAddress').addEventListener('change', function() {
    if (this.checked) {
      id('addressCurrent').value = id('addressKTP').value;
      id('addressCurrent').disabled = true;
      id('addressCurrent').required = false;
      appState.identity.sameAddress = true;
    } else {
      id('addressCurrent').value = '';
      id('addressCurrent').disabled = false;
      id('addressCurrent').required = true;
      appState.identity.sameAddress = false;
    }
  });
  id('addressKTP').addEventListener('input', function() {
    if (id('sameAddress').checked) id('addressCurrent').value = this.value;
  });
  if (!id('sameAddress').checked) id('addressCurrent').required = true;

  document.getElementById('identityForm').onsubmit = submitIdentity;
}


function submitIdentity(e) {
  e.preventDefault();
  const id = document.getElementById.bind(document);
  let nickname = id('nickname').value.trim();
  if (!nickname && id('name').value) {
    nickname = id('name').value.trim().split(/\s+/)[0];
    id('nickname').value = nickname;
  }
  const position = id('position').value;
  const education = id('education').value;
  const teacherLevel = (position === "Dosen/Guru") ? id('teacherLevel').value : '';
  const techRole = (position === "Technical Staff") ? id('techRole').value : '';

  appState.identity = {
    name: id('name').value,
    nickname: nickname,
    email: id('email').value,
    phone: id('phone').value,
    dob: id('dob').value,
    age: calculateAge(id('dob').value),
    status: id('status').value,
    addressKTP: id('addressKTP').value,
    addressCurrent: id('sameAddress').checked ? id('addressKTP').value : id('addressCurrent').value,
    sameAddress: id('sameAddress').checked,
    position: position,
    teacherLevel: teacherLevel,
    techRole: techRole,
    alumniSGS: id('alumniSGS')?.checked || false,
    alumniSD: id('alumniSD')?.checked || false,
    alumniSMP: id('alumniSMP')?.checked || false,
    alumniSMA: id('alumniSMA')?.checked || false,
    alumniSDText: id('alumniSDText')?.value || '',
    alumniSMPText: id('alumniSMPText')?.value || '',
    alumniSMAText: id('alumniSMAText')?.value || '',
    education: education,
    explanation: id('explanation').value,
    date: id('date').value
  };

  localStorage.setItem('identity', JSON.stringify(appState.identity));
  renderTestSelection();
}



// Tambahkan fungsi untuk umur


if (appState.showTestCards === undefined) appState.showTestCards = false;
function renderTestSelection() {
  if (appState.showTestCards === undefined) appState.showTestCards = false;

  const categories = [
    {
      title: 'Psikotes',
      tests: [
        { id: 'IST', label: 'Tes IST 🧠' },
        { id: 'KRAEPLIN', label: 'Tes Kraeplin 🧮' },
        { id: 'DISC', label: 'Tes DISC 👤' },
        { id: 'PAPI', label: 'Tes PAPI 📊' },
        { id: 'BIGFIVE', label: 'Tes Big Five 📝' },
        { id: 'GRAFIS', label: 'Tes Grafis 🎨' }
      ]
    },
    {
      title: 'Tes Kemampuan',
      tests: [
        { id: 'EXCEL', label: 'Tes Excel 📑' },
        { id: 'TYPING', label: 'Tes Mengetik ⌨️' },
        { id: 'SUBJECT', label: 'Tes Subjek 📚' }
      ]
    }
  ];

  document.getElementById('app').innerHTML = `
    <div class="card tes-selection-main"
      style="max-width:940px;margin:44px auto 0 auto;padding:40px 38px 36px 38px;border-radius:25px;box-shadow:0 10px 38px #b6ccff35;background:linear-gradient(120deg,#f8fcff 87%,#ecf6fd 100%);border:1.5px solid #c7dbfc;">
      <div style="text-align:center;margin-bottom:24px;">
        <img src="https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/nmqo6a.png"
        alt="Logo"
        style="max-width:120px;box-shadow:0 4px 18px #c2e3fc40;border-radius:18px;">
      </div>
      <h2 style="text-align:center;margin-bottom:34px;font-weight:900;font-size:2rem;letter-spacing:.5px;color:#195d90;text-shadow:0 1px 8px #b0e3ff70;">
        Pilih Tes yang akan Dikerjakan
      </h2>
      <form id="testSelectionForm" style="padding:2px 0 0 0;">
        ${categories.map(cat => `
          <div style="margin-bottom:38px;">
            <div style="font-weight:800;font-size:1.19rem;color:#2674d6;margin-bottom:13px;letter-spacing:0.4px;">
              <span style="border-bottom:2.4px solid #d4e7fd;padding-bottom:2px;">${cat.title}</span>
            </div>
            <div class="test-selection" style="margin-top:5px;">
              ${cat.tests.map(test => `
                <label class="test-select-card">
                  <input type="checkbox" name="selectedTests" value="${test.id}">
                  <span class="test-checkbox"></span>
                  <span class="test-label-text">${test.label}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
        <div style="text-align:center;margin-top:30px;">
          <button class="btn" type="submit"
            style="padding:14px 38px;font-weight:800;font-size:1.18rem;letter-spacing:0.3px;border-radius:12px;background:#22a558;box-shadow:0 3px 18px #c9f5dd90,0 0 8px #b3eed4a0;border:0;color:#fff;transition:background 0.18s;">
            ✔️ Lanjutkan ke Tes
          </button>
        </div>
      </form>
    </div>
    <style>
      .test-selection {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        gap: 26px 23px;
        margin: 0;
        padding: 0;
      }
      .test-select-card {
        background: linear-gradient(120deg, #f4fbfe 85%, #e8f2fa 100%);
        border-radius: 17px;
        box-shadow: 0 2px 16px #e6f5ffb8;
        border: 1.5px solid #dbeafd;
        padding: 21px 15px 19px 17px;
        display: flex;
        align-items: center;
        font-size: 1.12rem;
        font-weight: 600;
        cursor: pointer;
        transition: box-shadow 0.18s, background 0.13s, border 0.16s;
        min-height: 67px;
        gap: 15px;
        position: relative;
        overflow: hidden;
      }
      .test-select-card:hover {
        box-shadow: 0 9px 28px #bde7e9;
        background: linear-gradient(120deg,#e5f6fb 82%,#e0f7ff 100%);
        border-color: #a8d2ff;
      }
      .test-select-card input[type="checkbox"] {
        display: none;
      }
      .test-checkbox {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2.2px solid #22a558;
        background: #fff;
        display: inline-block;
        position: relative;
        margin-right: 9px;
        transition: border .16s;
      }
      .test-select-card input[type="checkbox"]:checked + .test-checkbox {
        background: radial-gradient(circle at 60% 30%, #23c46b 77%, #14b84a 100%);
        border-color: #12ba54;
      }
      .test-select-card input[type="checkbox"]:checked + .test-checkbox:after {
        content: '';
        display: block;
        position: absolute;
        left: 5.5px;
        top: 5.5px;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 0 6px #fff7;
      }
      .test-label-text {
        color: #17507b;
        font-weight: 700;
        font-size: 1.13em;
        letter-spacing: 0.2px;
        user-select: none;
      }
      @media (max-width: 950px) {
        .test-selection { grid-template-columns: 1fr 1fr; gap: 16px 14px; }
      }
      @media (max-width: 650px) {
        .test-selection { grid-template-columns: 1fr; gap: 11px 0; }
        .tes-selection-main { padding: 15px 3vw 18px 3vw !important;}
        .card { padding: 0 !important;}
      }
    </style>
  `;

// Handle Submit Test Selection Form
document.getElementById('testSelectionForm').onsubmit = function(e) {
  e.preventDefault();
  const selected = Array.from(document.querySelectorAll('input[name="selectedTests"]:checked')).map(el => el.value);
  appState.selectedTests = selected;
  localStorage.setItem('selectedTests', JSON.stringify(selected));
  appState.showTestCards = false;
  renderHome();
};
}
const instruksiList = [
`<WELCOME>Selamat datang di platform tes Sugar Group Schools.</WELCOME>
<HEADNOTE>Sebelum memulai, perhatikan beberapa hal penting berikut:</HEADNOTE>
<div class="instruksi-section">
    <div class="section-title">📚 Jenis Tes</div>
    <div class="section-content">
        • Anda akan mengikuti beberapa jenis tes<br>
        • Setiap tes memiliki instruksi khusus yang berbeda<br>
        • Pastikan memahami instruksi masing-masing tes sebelum mengerjakan
    </div>
</div>
<div class="instruksi-section">
    <div class="section-title">📥 Pengunduhan Hasil</div>
    <div class="section-content">
        • Unduh hasil hanya setelah <b>SEMUA TES SELESAI</b><br>
        • Hasil akhir akan terkumpul dalam satu file PDF
    </div>
</div>
<div class="instruksi-section">
    <div class="section-title">🔧 Verifikasi Sistem & Urutan Langkah</div>
<div class="section-content">
    • Setelah membaca instruksi ini dan menekan tombol <b>Selesai</b>, layar akan otomatis bergulir ke tombol <b>Download</b>.<br>
    • Klik tombol <b>Download</b> untuk memastikan file PDF dapat diunduh dengan baik.<br>
    • Tombol <b>Download</b> akan aktif kembali setelah seluruh tes yang dipilih selesai dikerjakan.<br>
    • Setelah tombol aktif, silakan unduh file dengan menekan <b>Download</b>.<br>
    • Setelah file berhasil diunduh, sistem akan otomatis melakukan <i>logout</i> dan mengarahkan Anda ke Google Form untuk mengumpulkan hasil tes.<br>
    • Jika mengalami kendala, segera hubungi tim rekrutmen.
</div>

</div>
<PENTING>
    <div class="warning-header">🚫 PENTING: LARANGAN SELAMA TES 🚫</div>
    <div class="warning-content">
        Selama mengerjakan tes, Anda <b>TIDAK DIPERBOLEHKAN</b>:<br>
        • Membuka tab/jendela browser lain<br>
        • Beralih ke aplikasi lain<br>
        • Meninggalkan halaman tes<br>
        <div class="warning-alert">Sistem akan mendeteksi dan mendiskualifikasi secara otomatis jika terjadi pelanggaran!</div>
    </div>
</PENTING>
<div style="text-align:center;margin-top:24px;font-size:1.2em;">
    Selamat mengerjakan. Semoga sukses! 💪
</div>`
];

// Render Home
function renderHome() {
  if (window.__inTestView === true) return;
  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 20);

  // Pastikan appState dasar aman
  window.appState = window.appState || {};
  appState.completed = appState.completed || {};

  const nickname = appState.identity?.nickname || "Peserta";
  const selectedTests = appState.selectedTests || JSON.parse(localStorage.getItem('selectedTests') || '[]');
  const psikotesList = ['IST','KRAEPLIN','DISC','PAPI','BIGFIVE','GRAFIS'];
  const adminList   = ['EXCEL','TYPING','SUBJECT'];
  const hasPsikotes = psikotesList.some(t => selectedTests.includes(t));
  const hasAdmin    = adminList.some(t => selectedTests.includes(t));
  const isBoth      = hasPsikotes && hasAdmin;

  // Blok greeting
  let greetingHTML = '';
  if (!appState.showTestCards) {
    greetingHTML = `
      <div class="personal-greeting"
        style="margin:30px auto 30px auto;
        padding:30px 24px 23px 24px;
        max-width:480px;
        background:linear-gradient(113deg,#fff8fc 88%,#eaf6ff 100%);
        border-radius:19px;
        font-size:1.29rem;
        color:#234;
        box-shadow:0 4px 32px #bbd0ff36,0 1.5px 4px #d1f7f920;
        text-align:center;
        border:1.5px solid #d6e6fa;
        position:relative;">
        <div style="font-size:2.3em;margin-bottom:8px;">👋</div>
        <b style="font-size:1.13em;">Halo, ${nickname}!</b>
        <div style="margin-top:7px;font-size:1.08em;line-height:1.55;">
          Untuk memastikan Anda memahami seluruh proses, silakan baca dan dengarkan <span style="color:#117ad1;font-weight:700;">instruksi tes</span> terlebih dahulu.<br>
          <span style="color:#1d6c3a;font-size:1.05em;font-weight:600;">Klik tombol di bawah sebelum mulai mengerjakan!</span>
        </div>
        <div style="margin-top:21px;">
          <button class="btn blink"
            id="btnShowInstruksi"
            style="padding:13px 42px;font-size:1.15rem;font-weight:800;border:2.5px solid #FFD600;
              background:linear-gradient(91deg,#fffde4 65%,#ffe178 100%);color:#1b222e;
              box-shadow:0 0 18px #ffd600b6,0 1px 10px #eaeaba50;border-radius:11px;
              transition:background .17s,box-shadow .14s;cursor:pointer;letter-spacing:.2px;">
            📢 Lihat &amp; Dengar Instruksi
          </button>
        </div>
      </div>
    `;
  } else {
    greetingHTML = `
      <div class="personal-greeting"
        style="margin:30px auto 30px auto;
        padding:22px 24px 18px 24px;
        max-width:480px;
        background:linear-gradient(113deg,#fff8fc 88%,#eaf6ff 100%);
        border-radius:19px;
        font-size:1.22rem;
        color:#234;
        box-shadow:0 4px 24px #bbd0ff22,0 1.5px 4px #d1f7f910;
        text-align:center;
        border:1.5px solid #d6e6fa;
        position:relative;">
        <div style="font-size:2.1em;margin-bottom:8px;">👋</div>
        <b style="font-size:1.11em;">Halo, ${nickname}!</b>
        <div style="margin-top:7px;font-size:1.06em;line-height:1.48;">
          Instruksi sudah selesai.<br>
          Silakan mulai mengerjakan tes yang telah dipilih di bawah ini.<br>
          <span style="color:#278f36;font-size:1em;font-weight:600;">Semoga lancar!</span>
        </div>
      </div>
    `;
  }

  let html = `
    <div class="card" id="homeCard" style="max-width:900px;margin:36px auto 0 auto;padding:0 0 38px 0;border-radius:27px;
      background:linear-gradient(135deg,#f5faff 88%,#e5f3ff 100%);
      box-shadow:0 10px 36px #c9eaff33, 0 1.5px 6px #fff9;border:1.7px solid #bfe3fc;overflow:hidden;">
      <div style="display:flex;align-items:center;gap:18px;padding:38px 34px 0 34px;">
        <img src="https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/nmqo6a.png"
          alt="Logo Psikotes" style="width:68px;height:68px;object-fit:contain;border-radius:16px;box-shadow:0 2px 12px #bddff930;">
        <div>
          <h1 style="margin:0 0 8px 0;font-size:2.09rem;font-weight:900;color:#1662a5;letter-spacing:0.2px;text-shadow:0 1.5px 10px #e1efff99;">
            Platfoform Tes Sugar Group Schools
          </h1>
          <div style="font-size:1.11rem;color:#337;font-weight:600;opacity:.95;">
            Platform Seleksi & Pengembangan
          </div>
        </div>
      </div>
      ${greetingHTML}
  `;

  // Kartu tes & tombol download (jika instruksi selesai)
  if (appState.showTestCards) {
    if (hasPsikotes) {
      if (isBoth) html += `<div style="
        margin-bottom:14px;font-weight:800;color:#14672e;font-size:1.19em;
        letter-spacing:.01em;text-align:center;
        border-bottom:2.5px solid #dbe6e0;
        padding-bottom:5px;max-width:370px;
        margin-left:auto;margin-right:auto;">
        Kategori 1: Tes Psikologi
      </div>`;
      html += `<div class="test-selection" style="padding:0 24px;">`;
      if (selectedTests.includes('IST'))      html += `<div class="test-card ${appState.completed.IST ? 'completed' : ''}" onclick="startTest('IST')"><div class="test-icon">🧠</div><h3>Tes IST</h3><p>${tests.IST.description}</p><div class="time">Waktu: ~60 menit</div><div class="status">${appState.completed.IST ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      if (selectedTests.includes('KRAEPLIN')) html += `<div class="test-card ${appState.completed.KRAEPLIN ? 'completed' : ''}" onclick="startTest('KRAEPLIN')"><div class="test-icon">🧮</div><h3>Tes Kraeplin</h3><p>${tests.KRAEPLIN.description}</p><div class="time">Waktu: ±5-10 menit</div><div class="status">${appState.completed.KRAEPLIN ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      if (selectedTests.includes('DISC'))     html += `<div class="test-card ${appState.completed.DISC ? 'completed' : ''}" onclick="startTest('DISC')"><div class="test-icon">👤</div><h3>Tes DISC</h3><p>${tests.DISC.description}</p><div class="time">Waktu: ~5 menit</div><div class="status">${appState.completed.DISC ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      if (selectedTests.includes('PAPI'))     html += `<div class="test-card ${appState.completed.PAPI ? 'completed' : ''}" onclick="startTest('PAPI')"><div class="test-icon">📊</div><h3>Tes PAPI</h3><p>${tests.PAPI.description}</p><div class="time">Waktu: ~5 menit</div><div class="status">${appState.completed.PAPI ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      if (selectedTests.includes('BIGFIVE'))  html += `<div class="test-card ${appState.completed.BIGFIVE ? 'completed' : ''}" onclick="startTest('BIGFIVE')"><div class="test-icon">📝</div><h3>Tes Big Five</h3><p>${tests.BIGFIVE.description}</p><div class="time">Waktu: ~5 menit</div><div class="status">${appState.completed.BIGFIVE ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      if (selectedTests.includes('GRAFIS'))   html += `<div class="test-card ${appState.completed.GRAFIS ? 'completed' : ''}" onclick="startTest('GRAFIS')"><div class="test-icon">🎨</div><h3>Tes Grafis</h3><p>Upload hasil gambar Rumah, Pohon, dan Orang sesuai instruksi.</p><div class="time">Waktu: ~10 menit</div><div class="status">${appState.completed.GRAFIS ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      html += `</div>`;
    }
    if (hasAdmin) {
      if (isBoth) html += `<div style="
        margin:38px auto 14px auto;font-weight:800;
        color:#1c4e81;font-size:1.19em;
        letter-spacing:.01em;text-align:center;
        border-bottom:2.5px solid #e1eaff;
        padding-bottom:5px;max-width:430px;">
        Kategori 2: Tes Kemampuan/Administrasi
      </div>`;
      html += `<div class="test-selection" style="padding:0 24px;">`;
      if (selectedTests.includes('EXCEL'))   html += `<div class="test-card ${appState.completed.EXCEL ? 'completed' : ''}" onclick="startTest('EXCEL')"><div class="test-icon">📑</div><h3>Tes Excel</h3><p>Mengerjakan soal administrasi sekolah di spreadsheet online.</p><div class="time">Waktu: ~15 menit</div><div class="status">${appState.completed.EXCEL ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      if (selectedTests.includes('TYPING'))  html += `<div class="test-card ${appState.completed.TYPING ? 'completed' : ''}" onclick="startTest('TYPING')"><div class="test-icon">⌨️</div><h3>Tes Mengetik</h3><p>Uji kecepatan dan akurasi mengetik kalimat tertentu.</p><div class="time">Waktu: ~5 menit</div><div class="status">${appState.completed.TYPING ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      if (selectedTests.includes('SUBJECT')) html += `<div class="test-card ${appState.completed.SUBJECT ? 'completed' : ''}" onclick="startTest('SUBJECT')"><div class="test-icon">📚</div><h3>Tes Subjek</h3><p>Pilih dan kerjakan soal sesuai mata pelajaran (Math, Indonesia, Inggris, dll).</p><div class="time">Waktu: ~15 menit</div><div class="status">${appState.completed.SUBJECT ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      html += `</div>`;
    }
    html += `
    <div id="downloadPDFBox" style="text-align:center;margin:48px 0 0 0;">
      <button class="btn btn-download"
        id="btnDownloadPDF"
        style="padding:19px 48px;font-size:1.25rem;font-weight:900;border:2.4px solid #31b729;
          background:linear-gradient(92deg,#f7fff1 65%,#d3ffb8 100%);color:#15772a;
          box-shadow:0 0 18px #45ff6190,0 0 7px #eaffea55,0 1.5px 6px #fafdf6;
          border-radius:15px;margin-bottom:0;transition:background 0.16s,box-shadow 0.15s;
          letter-spacing:.1px;position:relative;"
        onclick="generatePDF()">
       <span style="font-size:1.23em;vertical-align:-3px;">📄</span> Cek Tombol Download (uji unduh PDF)
</button>
      <div style="margin-top:13px;font-size:1.01em;color:#486908;letter-spacing:.01em;opacity:.97;">
        <span style="background:#fffde8;border-radius:8px;padding:3px 13px 3px 11px;display:inline-block;border:1px solid #ffe066;">
          <b>PENTING:</b> Unduh hasil hanya setelah semua tes selesai.
        </span>
      </div>
    </div>
    <div id="cekDownloadMsg"
      style="margin:24px auto 16px auto; max-width:485px; background:#fffbe0; border:1.6px solid #ffe066; border-radius:12px;
      padding:15px 25px 13px 22px; color:#6b5a05; font-size:1.13em; box-shadow:0 2px 12px #ffe06624; display:none;">
      <div style="font-weight:800;color:#bb9300;margin-bottom:4px;">
        ⚠️ Cek Fungsi Download
      </div>
      <div>
        <b>Silakan klik tombol <u>Download Hasil Tes</u> di atas satu kali untuk memastikan file berhasil diunduh.</b><br><br>
        Jika file PDF/Excel berhasil diunduh, Anda dapat lanjut mengerjakan seluruh tes.<br>
        <b>Jika <u>tidak</u> ada file terunduh</b>, segera hubungi tim rekrutmen untuk bantuan.
      </div>
    </div>
    `;
  }

  html += `</div>
  <style>
    .btn-download:hover {background:linear-gradient(92deg,#fafff3 62%,#e1ffd4 100%) !important;box-shadow:0 0 22px #66ffb190,0 0 10px #eafff0b0;color:#17852c;border-color:#2cd645;}
    .btn-download:active {background:linear-gradient(92deg,#edffe1 67%,#c9ffb2 100%) !important;color:#18692d;border-color:#1ab529;}
    .btn.blink {animation: blink 1.6s infinite;}
    @keyframes blink {0%,100% { box-shadow:0 0 18px #ffd600b6,0 1px 10px #eaeaba50;}50% { box-shadow:0 0 30px #fff972,0 1px 16px #ffe178aa;}}
  </style>`;

  document.getElementById('app').innerHTML = html;

  // Tombol instruksi (jika belum instruksi)
  setTimeout(() => {
    const instruksiBtn = document.getElementById('btnShowInstruksi');
    if (instruksiBtn) {
      instruksiBtn.classList.add('blink');
      instruksiBtn.onclick = () => showInstruksiOverlay(nickname, instruksiList);
    }
  }, 300);

  // =========================
  // [D] Sinkronisasi tombol PDF (panggilan saja)
  // =========================

  
  // 1) counter
window.downloadClickCount = (typeof window.downloadClickCount === "number") ? window.downloadClickCount : 0;

// 2) netralisir onclick inline
(function () {
  const pdfBtnImmediate = document.getElementById('btnDownloadPDF');
  if (pdfBtnImmediate) {
    pdfBtnImmediate.removeAttribute('onclick');
  }
})();

// 3) (opsional) sinkronisasi state awal tombolmu jika punya fungsi itu
if (typeof window.updateDownloadButtonState === "function") {
  window.updateDownloadButtonState();
}

// 4) pasang handler
if (typeof window.installPdfButtonHandler === 'function') {
  window.installPdfButtonHandler();
}

}

// [PDF-HANDLER v3] Klik-1 = cek download (disable tombol).
// Saat semua tes selesai, tombol aktif lagi. Klik-2 (final) = download lagi + auto Form & auto logout.
window.installPdfButtonHandler = function () {
  const box    = document.getElementById('downloadPDFBox');
  const pdfBtn = document.getElementById('btnDownloadPDF');
  const cekMsg = document.getElementById('cekDownloadMsg');
  if (!pdfBtn || pdfBtn.hasHandler) return;

  // Netralisir onclick inline & siapkan counter
  pdfBtn.removeAttribute('onclick');
  window.downloadClickCount = (typeof window.downloadClickCount === 'number') ? window.downloadClickCount : 0;

 // setelah const pdfBtn / cekMsg dll & sebelum pdfBtn.onclick = …
if (window.downloadClickCount === 0) {
  pdfBtn.disabled = false;
  pdfBtn.style.opacity = '1';
  pdfBtn.style.pointerEvents = 'auto';
  pdfBtn.classList.add('blink');

  // label awal: CEK tombol (uji unduh), sesuai brief
  pdfBtn.innerHTML = `<span style="font-size:1.23em;vertical-align:-3px;">📄</span> Cek Tombol Download (uji unduh PDF)`;
}

  // Cek selesai dinamis: hanya tes yang DIPILIH
  const allDone = (typeof window.allTestsCompleted === 'function')
    ? window.allTestsCompleted
    : function () {
        let selected = [];
        try {
          selected = Array.isArray(appState.selectedTests) && appState.selectedTests.length
            ? appState.selectedTests
            : JSON.parse(localStorage.getItem('selectedTests') || '[]');
        } catch { selected = []; }
        if (!selected.length) return false;
        const completed = (appState && appState.completed) || {};
        return selected.every(id => completed[id] === true);
      };

  function showFormAndAutoLogout() {
    if (box) {
      box.innerHTML = `
        <div style="text-align:center;margin-top:24px;">
          <div style="color:#c00;font-weight:600;margin-bottom:14px;line-height:1.6;">
            ✅ Hasil akhir telah diunduh.<br>
            <b>Silakan unggah PDF hasil tes ke link berikut (dibuka otomatis):</b><br>
            <a href="https://forms.gle/G69K56TRfxNnBXtr9" target="_blank" rel="noopener" style="font-weight:bold;color:#1565c0;word-break:break-all;">
              https://forms.gle/G69K56TRfxNnBXtr9
            </a><br>
            Sistem akan <b>logout otomatis</b> sesaat lagi.
          </div>
        </div>
      `;
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 200);
    }
    // Buka form (tab baru)
    try { window.open('https://forms.gle/G69K56TRfxNnBXtr9', '_blank', 'noopener'); } catch {}
    // Auto logout (beri jeda pendek agar unduhan/DOM settle)
    setTimeout(() => {
      localStorage.setItem('usedPragas', '1');
      localStorage.removeItem('identity');
      try { sessionStorage.removeItem('dlClick'); } catch {}
      location.reload();
    }, 900);
  }

  pdfBtn.onclick = function () {
    // Anti double-click
    if (pdfBtn.__busy) return;

    // KLIK-1 (cek download) — saat awal atau saat belum semua tes selesai
    if (window.downloadClickCount === 0) {
      pdfBtn.__busy = true;
      try {
        if (typeof window.generatePDF === 'function') {
          window.generatePDF();
        } else {
          alert('Fungsi generatePDF() belum tersedia.');
          return;
        }
      } finally {
        setTimeout(() => { pdfBtn.__busy = false; }, 300);
      }

      // Jika ternyata SEMUA tes sudah selesai saat klik-1 → langsung final (one-click)
      if (allDone()) {
        window.downloadClickCount = 2;
        try { sessionStorage.setItem('dlClick', '2'); } catch {}
        showFormAndAutoLogout();
        return;
      }

      // ELSE: belum selesai → disable & tunggu
      window.downloadClickCount = 1;
      try { sessionStorage.setItem('dlClick', '1'); } catch {}

      pdfBtn.disabled = true;
      pdfBtn.style.opacity = '0.45';
      pdfBtn.style.pointerEvents = 'none';
      pdfBtn.classList.remove('blink');
      pdfBtn.innerHTML = `<span style="font-size:1.15em;vertical-align:-2px;">⏳</span> Sudah dicek. Silakan selesaikan semua tes yang dipilih`;

      if (cekMsg) {
        cekMsg.innerHTML = `
<b>✅ Tombol sudah dicek.</b><br>
Silakan kerjakan <u>semua</u> tes yang dipilih. Setelah semuanya selesai, tombol akan aktif kembali untuk <b>unduh akhir & logout otomatis</b>.
`;
        cekMsg.style.display = 'block';
      }

      // Pantau sampai selesai → aktifkan untuk klik-2
      if (window.__pdfBtnWatcher) { try { clearInterval(window.__pdfBtnWatcher); } catch {} }
      window.__pdfBtnWatcher = setInterval(() => {
        if (allDone()) {
          try { clearInterval(window.__pdfBtnWatcher); } catch {}
          window.__pdfBtnWatcher = null;
          pdfBtn.disabled = false;
          pdfBtn.style.opacity = '1';
          pdfBtn.style.pointerEvents = 'auto';
          pdfBtn.classList.add('blink');
          pdfBtn.innerHTML = `<span style="font-size:1.1em;vertical-align:-2px;">📄</span> Unduh Akhir & Kumpulkan (Logout Otomatis)`;
        }
      }, 700);
      return;
    }

    // KLIK-2 (final) — saat semua tes sudah selesai
    if (window.downloadClickCount === 1) {
      if (!allDone()) return; // safety
      pdfBtn.__busy = true;
      try {
        if (typeof window.generatePDF === 'function') {
          window.generatePDF(); // unduh akhir
        } else {
          alert('Fungsi generatePDF() belum tersedia.');
          pdfBtn.__busy = false;
          return;
        }
      } finally {
        setTimeout(() => { pdfBtn.__busy = false; }, 300);
      }

      window.downloadClickCount = 2;
      try { sessionStorage.setItem('dlClick', '2'); } catch {}
      showFormAndAutoLogout();
    }
  };

  pdfBtn.hasHandler = true;

  // === TIDAK ADA pemulihan otomatis dari sessionStorage untuk state "sudah dicek" ===
  // (Supaya setelah Selesai Instruksi, tombol SELALU mulai sebagai "Download PDF")
  // Jika kamu ingin tetap memulihkan state saat reload halaman, boleh tambahkan lagi logika restore di sini.
  // Pastikan kamu reset dlClick & downloadClickCount ke 0 ketika user klik "Selesai Instruksi".
  
  // Sinkronisasi tampilan jika saat ini sudah click-1 / sudah selesai semua (mis. setelah dipantau)
  if (window.downloadClickCount === 1 && !allDone()) {
    pdfBtn.disabled = true;
    pdfBtn.style.opacity = '0.45';
    pdfBtn.style.pointerEvents = 'none';
    pdfBtn.classList.remove('blink');
    pdfBtn.innerHTML = `⏳ Sudah dicek. Silakan selesaikan semua tes yang dipilih`;
  } else if (window.downloadClickCount === 1 && allDone()) {
    pdfBtn.disabled = false;
    pdfBtn.style.opacity = '1';
    pdfBtn.style.pointerEvents = 'auto';
    pdfBtn.classList.add('blink');
    pdfBtn.innerHTML = `<span style="font-size:1.1em;vertical-align:-2px;">📄</span> Unduh Akhir & Kumpulkan (Logout Otomatis)`;
  } else if (window.downloadClickCount === 2) {
    // Jika refresh setelah final → tetap arahkan ke form & logout
    showFormAndAutoLogout();
  }
};




// ==============================
// Instruksi Overlay (aman & rapih)
// ==============================
function showInstruksiOverlay(nickname, instruksiList) {
  // Scroll ke atas pelan2
  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 20);

  // ---- Helpers aman ----
  const htmlIdOnce = (id) => document.getElementById(id);
  const escapeHtml = (s = "") =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  // Sanitize minimal: hapus script/style/iframe, on* attr, javascript: URL
  function sanitizeHTML(unsafe = "") {
    let safe = String(unsafe);
    // remove whole blocks
    safe = safe.replace(/<\/?(script|style|iframe|object|embed|link|meta)[\s\S]*?>/gi, "");
    // remove on* event handlers
    safe = safe.replace(/\son\w+="[^"]*"/gi, "").replace(/\son\w+='[^']*'/gi, "").replace(/\son\w+=\S+/gi, "");
    // disallow javascript:*
    safe = safe.replace(/(href|src)\s*=\s*(['"]?)\s*javascript:[^'"]*\2/gi, '$1="#"');
    return safe;
  }

  // ---- Overlay container ----
  let overlay = htmlIdOnce("overlayInstruksi");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "overlayInstruksi";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText = `
      position:fixed; inset:0; background:rgba(16,27,48,0.93);
      z-index:9999; display:flex; align-items:center; justify-content:center;
      padding:20px; overflow-y:auto;
    `;
    document.body.appendChild(overlay);
  }
  // lock scroll
  const prevBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  // ---- Tes dipilih chips ----
  const selectedTests =
    (window.appState?.selectedTests) ||
    JSON.parse(localStorage.getItem("selectedTests") || "[]");

  const testLabels = {
    IST: { icon: "🧠", label: "Tes IST" },
    KRAEPLIN: { icon: "🧮", label: "Tes Kraeplin" },
    DISC: { icon: "👤", label: "Tes DISC" },
    PAPI: { icon: "📊", label: "Tes PAPI" },
    BIGFIVE: { icon: "📝", label: "Tes Big Five" },
    GRAFIS: { icon: "🎨", label: "Tes Grafis" },
    EXCEL: { icon: "📑", label: "Tes Excel" },
    TYPING: { icon: "⌨️", label: "Tes Mengetik" },
    SUBJECT: { icon: "📚", label: "Tes Subjek" },
  };

  const chips = selectedTests
    .map((id) => {
      const item = testLabels[id] || { icon: "•", label: id };
      return `
        <div style="display:flex;align-items:center;gap:7px;background:#f5fafd;
          padding:9px 17px 8px 13px;border-radius:10px;font-size:1.09rem;box-shadow:0 2px 9px #d7eaf4;">
          <span style="font-size:1.38em;">${item.icon}</span>
          <span style="font-weight:600;">${escapeHtml(item.label)}</span>
        </div>`;
    })
    .join("");

  const tesDipilihHTML = `
    <div style="margin:36px 0 16px 0;">
      <div style="font-weight:700;font-size:1.13rem;color:#1864ab;margin-bottom:10px;text-align:center;">
        Tes yang Akan Anda Kerjakan:
      </div>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px 18px;">${chips}</div>
    </div>`;

  // ---- Isi overlay ----
  overlay.innerHTML = `
    <div class="instruksiyuh" style="
      max-width:98%; width:900px; padding:30px; background:#fff; border-radius:18px;
      box-shadow:0 10px 40px rgba(0,0,0,0.25); position:relative;">
      <div class="instruksi-gradient-strip" style="
          height:6px; background:linear-gradient(90deg,#2c7be5,#00d97e);
          border-radius:3px; margin-bottom:20px;"></div>

      <button id="btnCloseOverlay" aria-label="Tutup" title="Tutup"
        style="position:absolute;top:10px;right:10px;border:none;background:transparent;
        font-size:22px;cursor:pointer;line-height:1;">✖</button>

      <div style="font-size:1.5rem;font-weight:700;color:#1a3d7c;margin-bottom:10px;text-align:center;">
        Hi, <b>${escapeHtml(nickname || "Peserta")}</b>!
      </div>
      <h2 style="text-align:center;margin:0 0 20px 0;color:#233;font-size:1.8rem;">Instruksi Tes</h2>

      <div id="subtitleInstruksiTyping" style="
        max-height:60vh; overflow-y:auto; padding:15px 20px; font-size:1.15rem; line-height:1.65;"></div>

      ${tesDipilihHTML}

      <div style="text-align:center; margin-top:25px;">
        <button class="btn" id="btnSelesaiInstruksi" style="
          display:none; padding:12px 40px; font-size:1.15rem; font-weight:700;
          background:#2c7be5; color:#fff; border:none; border-radius:10px; cursor:pointer;">✔️ Selesai</button>
      </div>
    </div>
  `;

  // Close actions
  const closeOverlay = () => {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.body.style.overflow = prevBodyOverflow;
  };
  overlay.querySelector("#btnCloseOverlay").onclick = closeOverlay;
  document.addEventListener(
    "keydown",
    function escHandler(e) {
      if (e.key === "Escape") {
        closeOverlay();
        document.removeEventListener("keydown", escHandler);
      }
    },
    { once: true }
  );

  // ---- Mesin ketik ----
  const teks = String((instruksiList && instruksiList[0]) || "");
  const el = htmlIdOnce("subtitleInstruksiTyping");
  el.textContent = "";
  let i = 0;

  // style anim 1x
  if (!htmlIdOnce("instruksiTypingStyle")) {
    const style = document.createElement("style");
    style.id = "instruksiTypingStyle";
    style.textContent = `
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(255, 107, 107, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
      }
      .blink-cursor { animation: blink 1s infinite; }
      @keyframes blink { 0%,100% {opacity:1;} 50% {opacity:0;} }
      #subtitleInstruksiTyping > div > div[style*="background:#ffebee"] { animation: pulse 1.5s infinite; }
    `;
    document.head.appendChild(style);
  }

  function formatTokens(rawText) {
    // mapping tag custom -> inline style
    return rawText
      .replace(
        /<WELCOME>(.*?)<\/WELCOME>/gs,
        '<div style="font-size:1.6rem;font-weight:700;color:#2c7be5;text-align:center;margin:0 0 15px 0;line-height:1.4;">$1</div>'
      )
      .replace(
        /<HEADNOTE>(.*?)<\/HEADNOTE>/gs,
        '<div style="font-size:1.25rem;font-weight:600;color:#3a506b;margin:0 0 15px 0;text-align:center;">$1</div>'
      )
      .replace(
        /<div class="instruksi-section">/g,
        '<div style="margin-bottom:18px;padding:15px;background:#f8fbff;border-radius:10px;box-shadow:0 4px 8px rgba(0,0,0,0.05);">'
      )
      .replace(
        /<div class="section-title">/g,
        '<div style="font-size:1.18rem;font-weight:700;color:#1a3d7c;margin-bottom:10px;display:flex;align-items:center;gap:8px;">'
      )
      .replace(
        /<div class="section-content">/g,
        '<div style="padding-left:20px;font-size:1.08rem;line-height:1.6;color:#334e68;">'
      )
      .replace(
        /<PENTING>(.*?)<\/PENTING>/gs,
        '<div style="margin:22px 0;padding:18px;background:#fff8f0;border:2px solid #ff6b6b;border-radius:12px;box-shadow:0 4px 15px rgba(255,107,107,0.1);">$1</div>'
      )
      .replace(
        /<div class="warning-header">/g,
        '<div style="font-size:1.25rem;font-weight:800;color:#d32f2f;text-align:center;margin-bottom:15px;">'
      )
      .replace(
        /<div class="warning-content">/g,
        '<div style="font-size:1.1rem;line-height:1.6;color:#5a3e3e;padding:0 10px;">'
      )
      .replace(
        /<div class="warning-alert">/g,
        '<div style="margin-top:15px;padding:12px;background:#ffebee;border-radius:8px;font-weight:700;color:#b71c1c;text-align:center;border:1px dashed #f44336;">'
      );
  }

  function typeLoop() {
  const rawText = teks.substring(0, i);
  const mapped = formatTokens(rawText);
  const safe = sanitizeHTML(mapped);
  el.innerHTML = safe + `<span class="blink-cursor">|</span>`;

  if (i < teks.length) {
    i++;
    setTimeout(typeLoop, 12);
  } else {
    el.innerHTML = sanitizeHTML(formatTokens(teks));

    // tombol selesai + pesan
    const btn = htmlIdOnce("btnSelesaiInstruksi");
    btn.style.display = "inline-block";

    const old = htmlIdOnce("pesanSelesaiInstruksi");
    if (old) old.remove();

    const pesan = document.createElement("div");
    pesan.id = "pesanSelesaiInstruksi";
    Object.assign(pesan.style, {
      marginTop: "30px",
      marginBottom: "18px",
      textAlign: "center",
      color: "#1668a9",
      fontSize: "1.11em",
      fontWeight: "500",
    });
    pesan.innerHTML = `Klik <b>Selesai</b> untuk mengecek tombol download hasil tes.`;
    btn.parentNode.parentNode.insertBefore(pesan, btn.parentNode);
  }
}
typeLoop();

// ---- Setelah "Selesai" ----
htmlIdOnce("btnSelesaiInstruksi").onclick = () => {
  window.appState = window.appState || {};
  appState.showTestCards = true;

  closeOverlay();

  if (typeof window.renderHome === "function") {
    window.renderHome();
  }

  // ⬇️ Tambahkan blok ini (scroll full ke bawah untuk cek tombol)
  setTimeout(() => {
    // scroll sekali
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    // (opsional) ulangi sekali lagi setelah render stabil
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 400);
  }, 200);

  // (sisanya biarkan seperti punyamu)
  window.sudahCekDownload = true;

  setTimeout(() => {
    const box   = document.getElementById("downloadPDFBox");
    const pdfBtn= document.getElementById("btnDownloadPDF");
    const cekMsg= document.getElementById("cekDownloadMsg");

    if (typeof window.enableDownloadButtonSetelahCek === "function") {
      window.enableDownloadButtonSetelahCek();
    }
    if (cekMsg) cekMsg.style.display = "block";
    // jangan ubah counter/label di sini agar tidak auto-terhitung “sudah dicek”
  }, 600);
};


}




// --- Utility agar tombol download tetap aktif setelah cek instruksi ---
function updateDownloadBtnStatusAfterInstruksi() {
    const box = document.getElementById('downloadPDFBox');
    const pdfBtn = document.getElementById('btnDownloadPDF');
    const cekMsg = document.getElementById('cekDownloadMsg');

    if (box && pdfBtn) {
        if (sudahCekDownload) {
            box.style.opacity = 1;
            box.style.pointerEvents = "auto";
            pdfBtn.disabled = false;
            pdfBtn.style.opacity = "1";
            pdfBtn.style.pointerEvents = "auto";
            pdfBtn.classList.add('blink');
            // Tampilkan pesan awal jika belum pernah diklik
            if (cekMsg && downloadClickCount === 0) {
                cekMsg.style.display = "block";
            }

            // JANGAN SET onclick DI SINI LAGI! SUDAH ADA DI TEMPAT LAIN!
        } else {
            box.style.opacity = 0.4;
            box.style.pointerEvents = "none";
            pdfBtn.disabled = true;
            pdfBtn.style.opacity = "0.8";
            pdfBtn.classList.remove('blink');
            pdfBtn.style.pointerEvents = "none";
            if (cekMsg) cekMsg.style.display = "none";
        }
    }}



// Utility functions (versi dinamis)
function allTestsCompleted() {
  window.appState = window.appState || {};
  const completed = appState.completed || {};

  let selected = [];
  try {
    if (Array.isArray(appState.selectedTests) && appState.selectedTests.length) {
      selected = appState.selectedTests;
    } else {
      selected = JSON.parse(localStorage.getItem('selectedTests') || '[]');
    }
  } catch { selected = []; }

  if (!Array.isArray(selected) || selected.length === 0) return false;

  return selected.every(id => completed[id] === true);
}



// Utility agar tombol download aktif setelah cek instruksi
function enableDownloadButtonSetelahCek() {
    updateDownloadBtnStatusAfterInstruksi();
}
function calculateProgress() {
  if (!appState.currentTest) return 0;

  if (appState.currentTest === 'IST') {
    const subtest = tests.IST.subtests[appState.currentSubtest];
    return (appState.currentQuestion / subtest.questions.length) * 100;
  } else if (appState.currentTest === 'KRAEPLIN') {
    // Progress berdasarkan kolom yang sedang dikerjakan
    return ((appState.currentColumn + 1) / tests.KRAEPLIN.columns.length) * 100;
  } else if (appState.currentTest === 'DISC') {
    return (appState.currentQuestion / tests.DISC.questions.length) * 100;
  } else if (appState.currentTest === 'PAPI') {
    return (appState.currentQuestion / tests.PAPI.questions.length) * 100;
  } else if (appState.currentTest === 'BIGFIVE') {
    return (appState.currentQuestion / tests.BIGFIVE.questions.length) * 100;
  }
  return 0;
}
function renderKraeplinInstructions() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="kraeplin-instruction">
      <div class="instruction-header">
        <div class="instruction-icon">🧮</div>
        <h2>Instruksi Tes Kraeplin</h2>
        <p>Baca instruksi singkat berikut sebelum memulai tes.</p>
      </div>
      <div class="instruction-content">
        <div class="instruction-row">
          <div class="instruction-col">
            <div class="instruction-label">Cara Mengerjakan</div>
            <ul class="compact-list">
              <li>Lihat contoh visual.</li>
              <li>Ketik <b>jawaban</b> hasil penjumlahan di box.</li>
              <li>Kerjakan tiap kolom dalam <b>15 detik</b>.</li>
            </ul>
          </div>
          <div class="instruction-col">
            <div class="instruction-label">Perhatian</div>
            <ul class="compact-list">
              <li>Kecepatan <b>dan</b> ketelitian sama penting.</li>
              <li>Hanya tulis digit terakhir (contoh: 17 → 7).</li>
              <li>Waktu habis, otomatis ke baris berikutnya.</li>
            </ul>
          </div>
        </div>
        <div class="visual-section">
          <div class="section-title">Contoh Visual</div>
          <div class="image-container">
            <img src="https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/KRAEPLIN.jpg" 
                 alt="Contoh Pengerjaan Kraeplin"
                 class="gambar-kraeplin">
          </div>
          <div class="calc-examples">
            <div>8 + 7 = 15 → tulis <b>5</b></div>
            <div>8 + 1 = 9 → tulis <b>9</b></div>
            <div>3 + 3 = 6 → tulis <b>6</b></div>
            <div>2 + 8 = 10 → tulis <b>0</b></div>
          </div>
        </div>
      </div>
      <div class="instruction-footer">
        <button class="btn-instruction-green" onclick="startKraeplinTrial()">
          <span style="font-size:1em;font-weight:600;">PAHAMI & MULAI PERCOBAAN</span>
        </button>
      </div>
    </div>
  `;
}


// Modifikasi startTest
function startTest(testName) {
  window.__inTestView = true; // NEW: tandai sedang di tampilan tes

  appState.currentTest = testName;
  appState.currentSubtest = 0;
  appState.currentQuestion = 0;

  if (testName === 'IST') {
    renderISTSubtestIntro();
  } else if (testName === 'KRAEPLIN') {
    renderKraeplinInstructions();
  } else if (testName === 'DISC') {
    renderDISCIntro();
  } else if (testName === 'PAPI') {
    renderPAPIIntro();
  } else if (testName === 'BIGFIVE') {
    appState.timeLeft = tests.BIGFIVE.time;
    renderBIGFIVEInstruction();
  } else if (testName === 'GRAFIS') {
    renderGrafisUpload();
  } else if (testName === 'EXCEL') {
    renderAdminExcelSheet();
    return;
  } else if (testName === 'TYPING') {
    renderTypingTest();
  } else if (testName === 'SUBJECT') {
    renderSubjectTestHome();
  }
}


/* ==================== Thank You Screen After KRAEPLIN (1 tombol) ==================== */
function showThankYouAndHomeKRAEPLIN() {
  // 1) Tandai Kraeplin selesai
  if (typeof window.markTestCompleted === 'function') {
    markTestCompleted('KRAEPLIN');
  } else {
    window.appState = window.appState || {};
    appState.completed = appState.completed || {};
    appState.completed.KRAEPLIN = true;
    try {
      const saved = JSON.parse(localStorage.getItem('completed') || '{}');
      saved.KRAEPLIN = true;
      localStorage.setItem('completed', JSON.stringify(saved));
    } catch {}
    if (typeof window.updateDownloadButtonState === "function") {
      window.updateDownloadButtonState();
    }
  }

  // 2) Render ucapan terima kasih (gaya sama seperti IST)
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card" style="
      max-width:820px;margin:34px auto;padding:32px 28px;border-radius:22px;
      background:linear-gradient(135deg,#f5fff8 86%,#e8fff1 100%);
      box-shadow:0 10px 34px #c7f4da55;border:1.6px solid #c8f1d6;text-align:center;">
      <div style="font-size:3rem;line-height:1;margin-bottom:10px;">🎉</div>
      <h2 style="margin:6px 0 8px 0;font-weight:900;color:#13693a;">
        Terima kasih! Tes Kraeplin sudah selesai
      </h2>
      <p style="font-size:1.08rem;color:#244;max-width:680px;margin:0 auto 16px auto;line-height:1.6;">
        Jawaban Anda untuk Tes <b>Kraeplin</b> telah tersimpan. Silakan lanjut mengerjakan tes lain yang Anda pilih.
        Tombol <b>Download PDF</b> akan aktif kembali setelah <b>semua</b> tes pilihan selesai dikerjakan.
      </p>

      <div style="display:flex;gap:12px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
        <button id="btnContinueKrae" class="btn" style="
          padding:12px 24px;font-weight:800;border-radius:11px;
          background:#18a35d;color:#fff;border:0;box-shadow:0 4px 18px #bff1d7;">
          ✅ Lanjut Tes Berikutnya
        </button>
      </div>
    </div>
  `;

  // 3) Aksi: matikan guard tes lalu kembali ke Home (tanpa tombol kedua)
  const goNext = () => {
    window.__inTestView = false; // penting agar renderHome tidak diblokir oleh guard
    if (typeof window.renderHome === 'function') window.renderHome();
    // Fokuskan user ke daftar tes / tombol download
    setTimeout(() => {
      const el = document.getElementById('homeCard') || document.getElementById('downloadPDFBox');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  document.getElementById('btnContinueKrae').onclick = goNext;

  // Tidak ada auto-redirect; biar user yang menekan tombol untuk kontrol penuh.
}



/* ======================================================================
   IST – KUNCI, SKOR, NORMA (RW→SW), RINGKASAN, PDF HELPER
   Letakkan SETELAH deklarasi `tests` dan SEBELUM renderer/ekspor PDF.
   Tidak bentrok dengan `calculateAge()`.
   ====================================================================== */

/* -------------------- KUNCI PILIHAN GANDA (huruf) -------------------- */
/* (SE #5 menerima E atau D ⇒ index 4 berisi ['E','D']) */
const IST_KEYS = {
  SE: ['E','C','D','D', ['E','D'], 'B','C','A','E','B','C','D','D','E','C','A','B','B','C','B'],
  WA: ['A','B','D','C','C','C','C','D','D','A','E','A','A','B','C','A','D','E','B','C'],
  AN: ['C','E','D','D','D','B','D','B','E','D','C','C','C','C','E','C','C','E','E','E'],
  FA: ['B','D','C','B','E','C','D','A','A','E','A','C','D','C','B','A','B','D','C','C'],
  WU: ['A','C','D','E','A','C','D','C','E','A','B','D','E','B','D','B','A','E','B','C'],
  ME: ['D','E','B','A','C','A','D','E','C','B','B','A','E','C','D','B','E','A','C','D']
};

/* -------------------- KUNCI NUMERIK (RA & ZR) -------------------- */
const RA_KEYS = [35,280,250,26,30,70,45,50,48,78,19,6,57,90,120,17,24,5,48,3];
const ZR_KEYS = [27,25,27,15,46,10,24,7,5,14,8,14,45,36,12,80,14,12,36,10];

/* -------------------- HELPER UMUM -------------------- */
function getSubtestCode(name){ return (name || '').split(' ')[0].toUpperCase(); }
function normalizeLetter(v){
  if (v == null) return '';
  const s = String(v).trim();
  const m = s.match(/^[A-E]/i);
  return m ? m[0].toUpperCase() : s.toUpperCase();
}
function normText(s){
  if (!s) return '';
  return String(s).toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[.\-_/]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

/* ====== MULTI-KEY HELPERS (untuk item yang punya >1 jawaban benar) ====== */
function isCorrectKey(key, userAns){
  const norm = x => String(x ?? '').trim().toUpperCase().replace(/^([A-E]).*$/, '$1');
  const u = norm(userAns);
  const list = Array.isArray(key) ? key : [key];
  return list.some(k => norm(k) === u);
}
function keyToLabel(key){ return Array.isArray(key) ? key.map(normalizeLetter).join(' / ') : String(key); }

/* Maksimum default bila metadata `tests` tidak tersedia */
function defaultMaxByCode(code) {
  // GE: 16 item x 2 poin = 32; lainnya 20 item x 1 poin = 20
  return code === 'GE' ? 32 : 20;
}

/* -------------------- INJEKSI KUNCI KE OBJEK SOAL -------------------- */
let __istKeysApplied = false;
function applyAllKeysIntoQuestions(){
  if (__istKeysApplied) return;
  const ist = tests?.IST;
  if (!ist?.subtests) return;

  ist.subtests.forEach(st => {
    const code = getSubtestCode(st.name);

    const letterKeys = IST_KEYS[code];
    if (letterKeys && Array.isArray(st.questions)) {
      st.questions.forEach((q,i)=>{
        const k = letterKeys[i];
        if (k == null) return;
        if (Array.isArray(k)) {
          // kompatibel tampilan lama: `answer` tetap satu huruf (ambil yang pertama),
          // namun semua kunci benar disimpan di `q.accepted`
          q.answer  = normalizeLetter(k[0]);
          q.accepted = k.map(normalizeLetter);
        } else {
          q.answer  = normalizeLetter(k);
          q.accepted = [normalizeLetter(k)];
        }
      });
    }
    if (code === 'RA' && Array.isArray(st.questions)) {
      st.questions.forEach((q,i)=>{ if (RA_KEYS[i] != null) q.answer = String(RA_KEYS[i]); });
    }
    if (code === 'ZR' && Array.isArray(st.questions)) {
      st.questions.forEach((q,i)=>{ if (ZR_KEYS[i] != null) q.answer = String(ZR_KEYS[i]); });
    }
  });
  __istKeysApplied = true;
}

/* -------------------- SKORING KHUSUS GE (2/1/0) -------------------- */
const GE_SCORING = [
  { s2:['bunga','kembang','perdu'], s1:['tumbuh-tumbuhan','tumbuhan','tanaman','tangkai','harum'] },
  { s2:['alat indra','indra','panca indra'], s1:['organ','organ tubuh','alat tubuh','bagian tubuh'] },
  { s2:['hablur','kristal','zat arang'], s1:['berkilau','berkilauanan','mengkilat','bening'] },
  { s2:['cuaca','musim'], s1:['air','basah','gejala alam'] },
  { s2:['pembawa berita','alat perhubungan','alat komunikasi'], s1:['pos','p.t.t','telekomunikasi','perhubungan','komunikasi'] },
  { s2:['alat optik','optik'], s1:['lensa'] },
  { s2:['alat pencernaan'], s1:['jalan makanan','perut','isi perut','pencernaan','pencernaan makanan'] },
  { s2:['penyebut jumlah','pengertian jumlah','jumlah','kuantitas'], s1:['mengukur','ukuran','ukur'] },
  { s2:['bibit','bakal','alat pembiak','permulaan kehidupan'], s1:['sel','pembiakan','perkembangbiak','berkembangbiak'] },
  { s2:['simbol','lambang','tanda'], s1:['nama','pengenal','tanda pengenal'] },
  { s2:['makhluk','makhluk hidup','organisme'], s1:['tumbuh','biologi','ilmu hayat','ilmu hayati'] },
  { s2:['wadah','tempat mengisi','tempat penyimpan','tempat penyimpanan'], s1:['tempat sesuatu','alat','tempat','benda'] },
  { s2:['pengertian waktu','batas','batas waktu'], s1:['waktu','masa','saat','lamanya','lama'] },
  { s2:['sifat-watak','sifat-karakter','karakter','watak'], s1:['sifat'] },
  { s2:['regulator harga','regulasi harga','pengertian ekonomi'], s1:['dagang','niaga','penjualan','pembelian','jual beli'] },
  { s2:['pengertian ruang','penyebut ruang'], s1:['arah','letak','penentuan daerah','tempat','ruang','penunjuk tempat'] }
];

/* ====== FUZZY HELPERS UNTUK GE ====== */
const GE_FUZZY_CFG = { jaccardCutoff: 0.65, maxDistShort: 1, maxDistMedium: 2, maxDistLong: 3 };

// pakai normText kamu, lalu tambah normalisasi khusus GE
function normGE(s){
  const base = normText(s);
  return base
    .replace(/\bpanca\s*indra\b/g, 'pancaindera')
    .replace(/\bpanca\s*indera\b/g, 'pancaindera')
    .replace(/\balat\s*indera\b/g, 'alat indra')
    .replace(/\bilmu\s*hayati?\b/g, 'ilmu hayat')
    .replace(/\btumbuh\s*tumbuhan\b/g, 'tumbuhan')
    .replace(/\bsifat\s*-\s*watak\b/g, 'sifat watak')
    .replace(/\bsifat\s*-\s*karakter\b/g, 'sifat karakter')
    // p.t.t → "p t t" oleh normText; satukan lagi
    .replace(/\bp\s*t\s*t\b/g, 'ptt')
    .trim();
}
function tokenizeGE(s){ return normGE(s).split(' ').filter(Boolean); }
function setify(a){ return new Set(a); }

function jaccardSim(a, b){
  const A = setify(tokenizeGE(a)), B = setify(tokenizeGE(b));
  if (A.size === 0 && B.size === 0) return 1;
  let inter = 0; for (const t of A) if (B.has(t)) inter++;
  const uni = A.size + B.size - inter;
  return inter / (uni || 1);
}
function containsAllTokens(needle, haystack){
  const N = setify(tokenizeGE(needle)), H = setify(haystack ? tokenizeGE(haystack) : []);
  if (N.size === 0) return false;
  for (const t of N) if (!H.has(t)) return false;
  return true;
}

// Damerau–Levenshtein
function dlDistance(a, b){
  const s = normGE(a), t = normGE(b);
  const n = s.length, m = t.length;
  if (!n) return m; if (!m) return n;
  const dp = Array.from({length: n+1}, () => Array(m+1).fill(0));
  for (let i=0;i<=n;i++) dp[i][0] = i;
  for (let j=0;j<=m;j++) dp[0][j] = j;
  for (let i=1;i<=n;i++){
    for (let j=1;j<=m;j++){
      const cost = s[i-1] === t[j-1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i-1][j] + 1,
        dp[i][j-1] + 1,
        dp[i-1][j-1] + cost
      );
      if (i>1 && j>1 && s[i-1]===t[j-2] && s[i-2]===t[j-1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i-2][j-2] + cost);
      }
    }
  }
  return dp[n][m];
}
function fuzzyClose(a, b){
  const s = normGE(a), t = normGE(b);
  if (s === t) return true;
  if (containsAllTokens(s, t) || containsAllTokens(t, s)) return true;
  if (jaccardSim(s, t) >= GE_FUZZY_CFG.jaccardCutoff) return true;
  const L = Math.max(s.length, t.length);
  const d = dlDistance(s, t);
  const thr = (L <= 5) ? GE_FUZZY_CFG.maxDistShort
            : (L <= 9) ? GE_FUZZY_CFG.maxDistMedium
                       : GE_FUZZY_CFG.maxDistLong;
  return d <= thr;
}
function matchAny(answer, list){
  for (const k of (list||[])) if (fuzzyClose(answer, k)) return true;
  return false;
}

/* ====== PAKAI INI ====== */
function scoreGE(idx, rawAnswer){
  const rule = GE_SCORING[idx];
  const a = normGE(rawAnswer);
  if (!a || !rule) return 0;
  if (matchAny(a, rule.s2)) return 2; // duluin 2 poin
  if (matchAny(a, rule.s1)) return 1;
  return 0;
}

/* ========== HELPER: BLOK HEADING & ENSURE SPACE ========== */
function ensureSpace(doc, y, need = 12) { if (y + need > 270) { doc.addPage(); return 20; } return y; }
function blokHeading(doc, title, rgb = [44,62,80], x, y, w, h) {
  doc.setFontSize(9); doc.setTextColor(rgb[0]||44, rgb[1]||62, rgb[2]||80); doc.text(String(title||''), 16, y + 6);
}

/* ======================================================================
   DEBUG / VALIDASI: CEK SE (hasil kamu vs kunci, termasuk multi-key #5)
   ====================================================================== */
const ansSE = ['E','C','D','D','E','B','C','A','E','B','C','D','D','E','C','A','B','B','C','A']; // jawabanmu
const keySE = ['E','C','D','D',['E','D'],'B','C','A','E','B','C','D','D','E','C','A','B','B','C','B'];

function isCorrectKey_debug(key, user){
  const norm = s => String(s||'').trim().toUpperCase().replace(/^([A-E]).*$/, '$1');
  const list = Array.isArray(key) ? key : [key];
  return list.some(k => norm(k) === norm(user));
}

const result = ansSE.map((a,i)=>({
  no: i+1,
  ans: a,
  key: Array.isArray(keySE[i]) ? keySE[i].join('/') : keySE[i],
  ok: isCorrectKey_debug(keySE[i], a)
}));

console.table(result);
const salah = result.filter(r=>!r.ok);
console.log('Nomor salah:', salah.map(r=>r.no));
console.log('Detail salah:', salah);
console.log('Total benar:', result.filter(r=>r.ok).length);


/* -------------------- DESKRIPSI PER SUBTES -------------------- */
const IST_DESCRIPTIONS = {
  SE:"Pembentukan keputusan, memanfaatkan pengalaman masa lalu, penekanan pada praktis-konkrit, pemaknaan realitas, dan berpikir secara mandiri",
  WA:"Kemampuan bahasa, perasaan empati, berpikir induktif menggunakan bahasa, dan memahami pengertian bahasa",
  AN:"Kemampuan fleksibilitas dalam berpikir, daya mengkombinasikan, mendeteksi, dan memindahkan hubungan-hubungan, serta kejelasan dan konsekuensi dalam berpikir",
  GE:"Kemampuan abstraksi verbal, menyatakan pengertian dalam bahasa, membentuk pengertian atau mencari inti persoalan, serta berpikir logis dalam bahasa",
  RA:"Kemampuan berpikir praktis dalam berhitung, berpikir induktif, reasoning, dan mengambil kesimpulan",
  ZR:"Cara berpikir teoritis dengan hitungan, berpikir induktif dengan angka-angka, serta kelincahan berpikir",
  FA:"Kemampuan membayangkan, mengkonstruksi (sintesa & analisa), berpikir konkret menyeluruh, serta memasukkan bagian ke suatu keseluruhan",
  WU:"Daya bayang ruang, kemampuan tiga dimensi, analitis, serta kemampuan konstruktif teknis",
  ME:"Daya ingat: pengenalan item setelah fase hafalan"
};

/* -------------------- UTIL USIA (MINIMAL 21) -------------------- */
function clampMin21(age){
  if (!Number.isFinite(age)) return 21;               // default 21 bila kosong/invalid
  return Math.max(21, Math.floor(Number(age)));       // paksa minimal 21
}
function getAgeYearsForNorms(){
  let age = parseInt(appState?.identity?.age, 10);
  if (!age && appState?.id?.age) age = parseInt(appState.id.age, 10);
  if (!age && appState?.identity?.dob) {
    const dob = new Date(appState.identity.dob);
    if (!Number.isNaN(dob.getTime())) {
      const today = new Date();
      age = today.getFullYear() - dob.getFullYear()
        - (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
    }
  }
  return clampMin21(Number.isFinite(age) ? age : NaN);
}

/* -------------------- NORMA FALLBACK (stanine generik) -------------------- */
const IST_NORMS = {
  SE: [{minAge:17,maxAge:25,thresholds:[4,11,23,40,60,77,89,96]},
       {minAge:26,maxAge:35,thresholds:[4,11,23,40,60,77,89,96]},
       {minAge:36,maxAge:65,thresholds:[4,11,23,40,60,77,89,96]}],
  WA: [{minAge:17,maxAge:65,thresholds:[4,11,23,40,60,77,89,96]}],
  AN: [{minAge:17,maxAge:65,thresholds:[4,11,23,40,60,77,89,96]}],
  GE: [{minAge:17,maxAge:65,thresholds:[4,11,23,40,60,77,89,96]}],
  RA: [{minAge:17,maxAge:65,thresholds:[4,11,23,40,60,77,89,96]}],
  ZR: [{minAge:17,maxAge:65,thresholds:[4,11,23,40,60,77,89,96]}],
  FA: [{minAge:17,maxAge:65,thresholds:[4,11,23,40,60,77,89,96]}],
  WU: [{minAge:17,maxAge:65,thresholds:[4,11,23,40,60,77,89,96]}],
  ME: [{minAge:17,maxAge:65,thresholds:[4,11,23,40,60,77,89,96]}]
};
function pctToSWStanine(p01, thresholds=[4,11,23,40,60,77,89,96]){
  if (p01 == null || isNaN(p01)) return 'N/A';
  const pct = p01 * 100;
  for (let i=0;i<thresholds.length;i++) if (pct <= thresholds[i]) return i+1;
  return 9;
}
function convertRWtoSW(code, ageYears, rw, totalMax){
  if (totalMax == null || totalMax <= 0) return 'N/A';
  const a = clampMin21(ageYears);
  const bands = IST_NORMS[code] || [];
  const band = bands.find(b => a >= b.minAge && a <= b.maxAge);
  const p01 = Math.max(0, Math.min(1, rw / totalMax));
  if (!band) return pctToSWStanine(p01);
  return pctToSWStanine(p01, band.thresholds);
}
// === Fallback konversi stanine → SW-x (mean 100, step 10)
function stanineToSWx(sn){
  if (sn === 'N/A' || sn == null || isNaN(sn)) return 'N/A';
  return 100 + (Number(sn) - 5) * 10; // 1→60 ... 9→140
}

/* ================== SW TABLES PER USIA (RW 0..20; GE lanjut 21..32) ================== */
/* urutan kolom per baris: SE WA AN GE RA ZR FA WU ME */
const SW_BANDS_RAW = {
  AGE18: `
72 64 76 75   75 79 74 74 73
75 66 79 76.5 78 81 76 76 76
78 69 81 78   81 84 79 80 78
81 73 83 80   84 86 82 83 80
83 77 86 82   86 88 85 86 83
86 81 89 83.5 89 91 88 89 85
89 85 91 85   92 93 90 92 88
92 89 94 87   95 95 93 94 90
94 92 96 89   98 98 96 97 92
97 96 99 91   101 100 99 100 95
100 100 101 93 104 102 101 103 97
103 104 104 94 107 105 104 106 99
106 108 106 95 109 107 107 109 102
108 112 109 96.5 112 110 110 112 104
111 115 112 98 115 112 113 115 106
114 119 114 100 118 114 115 118 109
117 123 117 102 121 117 118 121 111
119 127 119 103.5 124 119 121 123 113
122 131 122 105 126 122 124 126 116
125 135 125 106.5 129 124 127 129 118
128 138 127 108 132 126 130 132 121
`,
  LE20: `
68 61 74 72 74 78 74 74 70
70 64 76 74 77 80 77 77 73
73 66 79 76 80 82 79 80 76
76 70 81 78 83 85 82 83 78
79 74 84 79 86 87 85 86 81
82 78 86 81 89 90 87 89 83
85 81 89 83 91 92 90 91 86
87 85 91 85 93 94 92 94 89
90 89 93 86 97 96 95 97 91
93 93 97 88 100 99 98 100 93
96 97 99 89 103 101 100 103 96
99 101 102 91 106 104 103 106 98
101 105 104 92 109 106 106 109 101
104 109 107 94 111 108 109 111 103
107 112 109 96 114 111 111 114 106
110 116 112 98 117 113 114 117 108
113 120 115 100 120 115 117 120 111
116 124 117 101 123 118 120 123 113
119 127 120 102 126 120 122 126 116
122 132 122 104 128 123 125 128 118
124 135 125 106 131 125 128 131 121
`,
  LE24: `
66 63 75 74 75 80 75 75 74
68 66 78 76 77 82 78 78 77
71 69 80 77 80 84 80 80 79
74 73 83 79 83 86 83 83 81
78 76 85 80 86 89 85 86 84
80 80 88 82 88 91 88 89 86
83 83 90 83 91 93 91 92 88
86 87 92 85 94 95 93 95 91
89 91 95 86 97 97 96 97 93
92 95 97 88 99 99 98 100 95
95 98 100 89 102 102 101 103 98
98 102 102 91 105 104 103 106 100
101 106 104 92 107 106 106 108 102
104 109 107 94 110 108 108 111 105
107 113 109 95 113 110 111 114 107
110 116 111 97 115 112 113 117 109
113 120 114 98 118 115 116 120 112
116 124 116 100 121 117 119 122 114
119 128 119 102 123 119 121 125 116
123 131 121 104 126 121 124 128 119
126 135 123 105 129 124 127 131 121
`,
  LE28: `
65 65 77 73 72 77 74 74 77
67 69 79 75 76 80 77 77 80
70 73 81 76 80 82 80 80 82
73 75 84 78 82 85 82 83 84
76 79 86 80 84 87 85 85 86
79 82 88 82 87 90 88 88 89
82 85 91 83 90 92 90 91 91
86 89 93 85 93 94 93 94 93
89 92 95 87 96 97 96 97 95
92 95 98 89 98 99 99 100 98
95 99 100 90 101 101 101 103 100
98 102 102 91 104 104 104 106 102
101 105 105 92 107 106 107 109 104
104 109 107 94 110 109 109 112 107
108 112 109 96 112 111 112 115 109
111 115 112 98 115 113 115 118 111
114 119 114 99 118 116 118 121 113
117 122 116 101 120 118 120 123 116
120 125 119 102 123 120 123 126 118
123 129 121 104 126 123 126 130 120
126 132 123 105 130 127 130 133 122
`,
  LE33: `
65 65 78 75 75 80 75 76 78
68 69 80 77 77 82 77 79 80
71 72 82 78 80 84 80 81 83
74 75 84 80 83 86 83 84 85
78 79 86 81 85 89 85 87 87
81 82 88 83 88 91 88 90 89
82 85 90 84 91 93 91 92 92
86 89 93 86 93 95 93 95 94
89 92 96 87 96 97 95 98 97
92 96 98 89 99 100 99 101 99
93 100 100 90 102 102 101 104 101
98 103 102 92 104 104 103 106 103
101 106 104 93 107 106 106 109 106
104 110 107 96 110 108 109 112 108
107 113 109 97 112 111 111 115 110
110 117 111 98 115 113 115 118 112
113 120 113 99 118 115 117 120 114
116 123 116 101 121 117 120 123 117
119 127 118 102 124 120 123 126 119
122 130 120 103 126 122 127 129 122
126 134 122 104 129 124 128 131 124
`,
  LE39: `
68 69 79 76 75 79 77 77 81
71 72 81 78 77 81 80 80 83
75 75 83 79 80 83 82 82 86
77 78 86 81 83 86 85 85 88
80 81 89 82 86 88 87 87 90
83 85 91 84 88 90 90 90 92
86 88 93 85 91 92 93 93 94
89 91 95 86 94 95 95 96 97
92 94 97 87 97 97 98 98 99
95 97 100 89 99 99 101 101 101
98 101 102 90 102 102 103 104 103
101 104 104 92 105 104 105 106 106
104 107 106 93 109 106 108 109 108
107 110 108 95 111 108 110 112 110
110 114 111 96 113 111 113 115 112
113 117 113 98 116 113 115 117 115
115 120 114 99 117 113 117 119 116
119 123 117 101 120 115 120 123 118
121 126 120 102 125 120 123 125 122
124 130 122 104 128 122 126 128 124
128 133 124 105 130 124 128 131 127
`,
  LE45: `
73 73 81 76 77 80 79 78 82
75 76 83 78 79 82 81 81 84
78 80 85 79 82 84 84 84 87
81 83 88 81 85 86 86 86 89
84 85 90 82 88 89 89 89 91
87 89 92 84 90 91 91 91 93
90 92 94 85 93 93 93 95 96
92 95 97 87 96 95 97 97 98
95 98 99 88 98 98 99 100 100
98 101 101 90 101 100 102 103 102
101 104 103 91 104 102 104 105 104
104 108 106 93 106 104 107 108 107
107 111 108 94 109 107 109 111 109
110 114 110 96 112 109 112 114 111
115 120 114 99 117 113 117 119 116
118 123 117 100 120 115 120 122 118
121 126 119 102 123 118 122 124 120
124 130 121 103 125 120 125 127 122
127 133 123 105 128 122 128 130 125
130 136 126 106 131 125 130 133 127
`,
  GT45: `
75 75 82 77 77 81 80 78 84
78 78 85 79 79 83 82 81 86
81 81 87 80 81 85 85 84 89
84 84 89 81 84 88 88 87 91
87 87 91 82 88 90 91 89 93
90 90 94 84 91 92 93 92 95
93 94 96 85 94 94 96 95 98
96 97 98 87 97 97 98 98 100
99 100 101 88 99 99 101 101 102
102 103 103 90 102 101 104 103 105
104 106 105 91 104 103 106 106 107
107 110 107 93 107 105 109 109 109
110 113 110 94 110 108 112 112 111
113 116 112 96 113 110 115 115 114
116 119 114 97 116 112 117 117 116
119 123 116 99 119 114 119 120 118
122 126 119 100 121 116 122 123 120
125 129 121 102 125 118 125 125 123
128 132 123 103 128 120 128 129 125
131 135 126 105 131 123 131 131 127
134 139 129 106 134 125 133 134 130
`
};

/* -------------------- GE RW 21..32 PER USIA -------------------- */
const SW_GE_EXT = {
  AGE18: [109.5,111,113,115,116.5,118,119.5,121,123,125,126.5,128],
  LE20 : [108,109,111,112,114,116,118,119,121,122,124,126],
  LE24 : [107,108,110,111,113,114,116,117,119,120,122,123],
  LE28 : [107,108,110,112,114,115,117,118,120,122,124,125],
  LE33 : [106,107,109,110,112,113,115,116,118,120,121,122],
  LE39 : [107,108,110,111,113,114,116,117,119,120,122,124],
  LE45 : [108,109,111,112,114,115,117,118,120,121,123,124],
  GT45 : [108,109,110,111,113,115,117,118,120,121,123,125]
};

/* Parse RAW → SW_TABLE[band][code][rwIndex]; GE ditambah 21..32 */
const SW_CODES = ['SE','WA','AN','GE','RA','ZR','FA','WU','ME'];
const SW_TABLE = {};
for (const [band, raw] of Object.entries(SW_BANDS_RAW)) {
  const rows = raw.trim().split(/\n+/).map(r => r.trim().split(/\s+/).map(Number));
  const bandObj = {}; SW_CODES.forEach((c, j) => bandObj[c] = rows.map(row => row[j]));
  if (SW_GE_EXT[band]) bandObj.GE = bandObj.GE.concat(SW_GE_EXT[band]); // extend GE 21..32
  SW_TABLE[band] = bandObj;
}
/* -------------------- PILIH BAND USIA (MIN 21 ⇒ tak pernah AGE18/LE20) -------------------- */
function getAgeBandForSW(ageYears) {
  const a = clampMin21(ageYears);
  if (a <= 24) return 'LE24';
  if (a <= 28) return 'LE28';
  if (a <= 33) return 'LE33';
  if (a <= 39) return 'LE39';
  if (a <= 45) return 'LE45';
  return 'GT45';
}

/* Skala RW→index 0..20 (umum) — TIDAK TERPAKAI untuk lookup tabel */
function rwToIndex0_20(code, rw, totalMax) {
  if (totalMax <= 0) return 0;
  const idx = Math.round(Math.max(0, Math.min(1, rw / totalMax)) * 20);
  return Math.max(0, Math.min(20, idx));
}

/* === Mode indeks RW: 'round' (default) atau 'floor' untuk konservatif === */
const RW_INDEXING_MODE = 'round';
function clampIndex(v, max) { return Math.max(0, Math.min(max, v)); }

/* Ambil SW dari tabel umur; GE 0..32, selain GE 0..20; fallback → stanine yang diubah ke SW-x */
function rwToSW_ViaTable(code, ageYears, rw, totalMax) {
  const band = getAgeBandForSW(ageYears);
  const tbl = SW_TABLE[band];

  // Jika tabel/kode tak ada, jatuh ke stanine generik → konversi ke SW-x
  if (!tbl || !tbl[code]) {
    const fallbackMax = code === 'GE' ? 32 : 20;
    const sn = convertRWtoSW(code, clampMin21(ageYears), Number(rw) || 0, fallbackMax); // stanine (1..9)
    return stanineToSWx(sn); // gunakan skala SW-x (≈mean 100)
  }

  // Batas indeks keras sesuai spesifikasi: GE 0..32, lainnya 0..20
  const hardMax = code === 'GE' ? 32 : 20;

  // Panjang tabel guard: pakai yang tersedia di tabel kalau lebih pendek
  const tableMax = (tbl[code]?.length ?? (hardMax + 1)) - 1; // length-1 → indeks maksimum
  const idxMax = Math.min(hardMax, tableMax);

  // Indeks = RW dibulatkan/difloor & dibatasi ke rentang tabel
  const rawIdx = Number(rw) || 0;
  const idx = clampIndex(
    RW_INDEXING_MODE === 'floor' ? Math.floor(rawIdx) : Math.round(rawIdx),
    idxMax
  );

  return tbl[code][idx];
}

/* -------------------- UTIL SUBTES & MAX (UPDATED) -------------------- */
function getSubtestCode(name='') {
  const n = String(name || '').toUpperCase();
  // Cocokkan token persis agar tidak false positive (mis. "MEWAH" tak jadi "WA")
  const m = n.match(/\b(SE|WA|AN|GE|RA|ZR|FA|WU|ME)\b/);
  if (m) return m[1];
  // fallback kecil
  if (SW_CODES?.includes?.(n)) return n;
  for (const k of ['SE','WA','AN','GE','RA','ZR','FA','WU','ME']) {
    if (n.includes(k)) return k;
  }
  return n.slice(0,2);
}
function defaultMaxByCode(code){ return code === 'GE' ? 40 : 20; }

/* ===== helpers kecil ===== */
function normalizeLetter(x){
  if (x == null) return '';
  const s = String(x).trim().toUpperCase();
  return s.replace(/^([A-E])[\.\)]?\s*.*/, '$1');
}
function fmtSW(v){
  if (v === 'N/A' || v == null || isNaN(v)) return '-';
  return String(Math.round(Number(v)));
}

/* -------------------- HITUNG RINGKASAN PER SUBTES (MERGE DUPLICATES) -------------------- */
function computeISTPerSubtestScores(){
  const age = getAgeYearsForNorms();

  // Sumber meta: pakai definisi tes jika ada (punya qlen), jika tidak pakai dari jawaban
  const subtestsFromTests = tests?.IST?.subtests?.map((st, idx) => ({
    idx, code: getSubtestCode(st?.name), name: st?.name,
    qlen: Array.isArray(st?.questions) ? st.questions.length : null
  })) || [];

  const subtestsFromAnswers = (Array.isArray(appState?.answers?.IST) ? appState.answers.IST : [])
    .map((bucket, idx) => ({ idx, code: getSubtestCode(bucket?.name || ''), name: bucket?.name || `Subtes ${idx+1}`, qlen: null }));

  const metaList = subtestsFromTests.length ? subtestsFromTests : subtestsFromAnswers;

  // Gabungkan semua bucket dengan kode sama
  const agg = {}; // code -> { rwSum, totalMaxSum, description }
  metaList.forEach(meta => {
    const code = meta.code || '';
    if (!code) return;

    // totalMax per bucket (pakai qlen kalau ada; GE bobot 2)
    const totalMaxBucket = (meta.qlen != null)
      ? (code === 'GE' ? meta.qlen * 2 : meta.qlen)
      : defaultMaxByCode(code);

    // hitung RW mentah per bucket
    let rwBucket = 0;
    const bucket = appState?.answers?.IST?.[meta.idx];
    if (bucket?.answers?.length) {
      for (const a of bucket.answers) {
        if (typeof a.score === 'number') rwBucket += a.score;                 // GE bisa >1
        else if (typeof a.correct === 'boolean') rwBucket += a.correct ? 1 : 0; // PG/numerik
      }
    }

    if (!agg[code]) {
      agg[code] = {
        code,
        rwSum: 0,
        totalMaxSum: 0,
        description: (typeof IST_DESCRIPTIONS !== 'undefined' && IST_DESCRIPTIONS[code]) ? IST_DESCRIPTIONS[code] : '-'
      };
    }
    // Jangan clamp per bucket—biarkan dijumlah dulu, clamp di akhir
    agg[code].rwSum       += Number.isFinite(rwBucket) ? rwBucket : 0;
    agg[code].totalMaxSum += Number.isFinite(totalMaxBucket) ? totalMaxBucket : 0;
  });

  // Konversi ke array + clamp akhir + lookup SW via tabel umur
  const summary = Object.values(agg).map(r => {
    const hardMax = r.code === 'GE' ? 32 : 20;
    const rwClamped = Math.max(0, Math.min(hardMax, Math.round(r.rwSum))); // clamp setelah penjumlahan
    const totalMaxForFallback = Math.max(0, Math.round(r.totalMaxSum)) || defaultMaxByCode(r.code);
    const sw = rwToSW_ViaTable(r.code, age, rwClamped, totalMaxForFallback);
    return { code: r.code, rw: rwClamped, totalMax: totalMaxForFallback, sw, description: r.description };
  });

  // urutan final + tie-breaker untuk kode unknown
  const order = ['SE','WA','AN','GE','ME','RA','ZR','FA','WU'];
  summary.sort((a,b)=>{
    const ia = order.indexOf(a.code); const ib = order.indexOf(b.code);
    return (ia === -1 && ib === -1) ? a.code.localeCompare(b.code)
         : (ia === -1) ?  1
         : (ib === -1) ? -1
         : ia - ib;
  });
return summary;
}
/* ====== KATEGORI 5 LEVEL (SW → keterangan, per-subtes) ====== */
function swCategory5(sw) {
  if (sw === 'N/A' || sw == null || isNaN(sw)) return '-';
  const v = Number(sw);
  if (v <= 80)  return 'Sangat Rendah';
  if (v <= 94)  return 'Rendah';
  if (v <= 99)  return 'Sedang';
  if (v <= 104) return 'Cukup';
  if (v <= 118) return 'Tinggi';
  return 'Sangat Tinggi';
}

/* ========================================================================
   ΣRW → SW JML (berdasarkan usia) — TANPA GESAMT
   - JML RW: jumlahkan RW apa adanya (GE boleh 0..32).
   - JML SW: lookup ΣRW (0..180) via tabel usia yang kamu berikan.
   ======================================================================== */

/* Builder 18 blok (RW 1..10, 11..20, ..., 171..180); RW 0 -> 0 */
function buildSWSteps(values18){
  const arr = Array(181).fill(0); // arr[0] = 0 sesuai tabel
  let idx = 1;
  for (let i = 0; i < 18; i++) {
    const v = Number(values18[i] || 0);
    for (let j = 0; j < 10 && idx <= 180; j++, idx++) arr[idx] = v;
  }
  return arr;
}

/* Tabel ΣRW → SW per band usia (dari ketentuan yang kamu kirim) */
const TOTAL_SW_BY_AGE = {
  LE20: buildSWSteps([65,69,72,76,80,84,88,92,95,99,103,107,111,115,118,122,126,130]),
  LE24: buildSWSteps([65,69,72,76,80,84,88,92,95,99,103,107,111,115,118,122,126,130]),
  LE28: buildSWSteps([67,70,74,77,81,85,89,92,96,100,103,107,111,115,118,122,125,129]),
  LE33: buildSWSteps([68,71,75,79,82,86,89,93,96,100,104,107,111,114,118,121,125,128]),
  LE39: buildSWSteps([71,74,78,81,85,88,91,95,98,102,105,109,112,115,119,122,126,129]),
  LE45: buildSWSteps([73,76,80,83,86,90,93,97,100,103,107,110,114,118,121,124,128,131]),
  LE60: buildSWSteps([75,79,81,85,89,92,95,99,102,105,109,112,115,119,122,125,129,132]),
};

/* Pilih band usia (fallback 25 thn bila fungsi usia tidak tersedia) */
function pickTotalSWAgeBand(ageYears){
  const a = Math.floor(Number(
    ageYears ?? ((typeof getAgeYearsForNorms==='function') ? getAgeYearsForNorms() : 25)
  ));
  if (a <= 20) return 'LE20';
  if (a <= 24) return 'LE24';
  if (a <= 28) return 'LE28';
  if (a <= 33) return 'LE33';
  if (a <= 39) return 'LE39';
  if (a <= 45) return 'LE45';
  return 'LE60';
}

/* Lookup SW JML dari ΣRW & usia; clamp ΣRW ke 0..180 */
function getTotalSWFromRW(totalRW, ageYears){
  const band = pickTotalSWAgeBand(ageYears);
  const table = TOTAL_SW_BY_AGE[band] || TOTAL_SW_BY_AGE.LE24;
  const rw = Math.max(0, Math.min(180, Math.floor(Number(totalRW || 0))));
  return table[rw];
}

/* ==================== SW → IQ (dari tabel yang kamu berikan) ==================== */
const IQ_BY_SW = {
  58:37, 59:39, 60:40, 61:42, 62:43, 63:45, 64:46, 65:48, 66:49, 67:51,
  68:52, 69:54, 70:55, 71:57, 72:58, 73:60, 74:61, 75:63, 76:64, 77:66,
  78:67, 79:69, 80:70, 81:72, 82:73, 83:75, 84:76, 85:78, 86:79, 87:81,
  88:82, 89:84, 90:85, 91:87, 92:88, 93:90, 94:91, 95:93, 96:94, 97:96,
  98:97, 99:99, 100:100, 101:102, 102:103, 103:105, 104:106, 105:108, 106:109, 107:111,
  108:112, 109:114, 110:115, 111:117, 112:118, 113:120, 114:121, 115:123, 116:124, 117:126,
  118:127, 119:129, 120:130, 121:132, 122:133, 123:135, 124:136, 125:138, 126:139, 127:141,
  128:142, 129:144, 130:145, 131:147, 132:148, 133:150, 134:151, 135:153, 136:154, 137:156,
  138:157, 139:159, 140:160
};

function getIQFromSW(sw){
  const keys = Object.keys(IQ_BY_SW).map(Number).sort((a,b)=>a-b);
  if (!keys.length) return null;
  const s = Math.round(Number(sw || 0));
  const min = keys[0], max = keys[keys.length-1];
  if (s <= min) return IQ_BY_SW[min];
  if (s >= max) return IQ_BY_SW[max];
  if (s in IQ_BY_SW) return IQ_BY_SW[s];

  // Fallback (harusnya tak kepakai karena tabel 58..140 lengkap)
  let lo = min, hi = max;
  for (let i = 0; i < keys.length-1; i++){
    if (keys[i] < s && s < keys[i+1]) { lo = keys[i]; hi = keys[i+1]; break; }
  }
  const t = (s - lo) / (hi - lo);
  return Math.round(IQ_BY_SW[lo] + t * (IQ_BY_SW[hi] - IQ_BY_SW[lo]));
}

/* ==================== Klasifikasi IQ (sesuai gambar) ==================== */
function iqCategory(iq){
  if (iq == null || isNaN(iq)) return '-';
  const v = Math.round(Number(iq));
  if (v >= 131) return 'Tingkat Kecerdasan sangat superior atau jenius.';
  if (v >= 120) return 'Tingkat Kecerdasan superior.';
  if (v >= 111) return 'Tingkat Kecerdasan tinggi dalam kategori normal (Bright Normal).'; // 111–119
  if (v >= 91)  return 'Tingkat Kecerdasan normal atau rata-rata.';                         // 91–110
  if (v >= 80)  return 'Tingkat Kecerdasan rendah yang masih dalam kategori normal (Dull Normal).'; // 80–90
  if (v >= 70)  return 'Tingkat Kecerdasan rendah atau keterbelakangan mental.';            // 70–79
  return 'Di bawah 70.';
}

/* ===== util: encoder/decoder skor terenkripsi (0→o, 1→a, …, 9→i) ===== */
if (typeof encodeScoreCode !== 'function') {
  function encodeScoreCode(value){
    if (value == null || value === '' || isNaN(Number(value))) return '-';
    const num = Number(value), neg = num < 0;
    let s = String(Math.round(Math.abs(num))); if (s.length === 0) s = '0';
    const map = { '0':'o','1':'a','2':'b','3':'c','4':'d','5':'e','6':'f','7':'g','8':'h','9':'i' };
    let out = '';
    for (const ch of s) out += (map[ch] || '');
    if (out === '') out = 'o';
    return neg ? '-' + out : out;
  }
}
if (typeof decodeScoreCode !== 'function') {
  function decodeScoreCode(s){
    let str = String(s||'').trim().toLowerCase();
    if (!str) return NaN;
    let neg = false;
    if (str[0] === '-') { neg = true; str = str.slice(1); }
    const map = { o:'0', a:'1', b:'2', c:'3', d:'4', e:'5', f:'6', g:'7', h:'8', i:'9' };
    let digits = '';
    for (const ch of str) {
      if (!(ch in map)) return NaN;
      digits += map[ch];
    }
    const n = Number(digits);
    return neg ? -n : n;
  }
}
if (typeof toNumFlexible !== 'function') {
  function toNumFlexible(v){
    if (typeof v === 'number') return isNaN(v) ? 0 : v;
    const s = String(v||'').trim();
    if (/^-?[a-io]+$/i.test(s)) {
      const n = decodeScoreCode(s);
      return isNaN(n) ? 0 : n;
    }
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }
}

/* ==================== Dominasi (GE+RA vs AN+ZR) ==================== */
function computeDominasi(summary){
  const get = c => {
    const r = Array.isArray(summary)
      ? summary.find(x => String(x?.code||'').toUpperCase() === c)
      : null;
    const v = (r && typeof r.sw !== 'undefined') ? toNumFlexible(r.sw) : 0;
    return isNaN(v) ? 0 : v;
  };

  const left  = get('GE') + get('RA'); // FESTIGUNG (mantap/eksak)
  const right = get('AN') + get('ZR'); // FLEKSIBILITÄT (fleksibel/non-eksak)
  const delta = left - right;

  const T = 10; // ambang kestabilan
  if (delta >  T) return 'FESTIGUNG (Mantap/Eksak)';
  if (delta < -T) return 'FLEKSIBILITÄT (Fleksibel/Non-Eksak)';
  return 'Seimbang';
}

/* ==================== SW Line Chart ==================== */
function drawSWLineChart(doc, x, y, w, h, summary) {
  const CODES = ['SE','WA','AN','GE','RA','ZR','FA','WU','ME'];
  const sws = CODES.map(c => {
    const r = Array.isArray(summary) ? summary.find(s => String(s?.code||'').toUpperCase() === c) : null;
    return toNumFlexible(r?.sw);
  });
  if (!sws.length || sws.every(v => v <= 0)) return y;

  const minY = 70, maxY = 180;
  const tickValues = [70, 90, 110, 130, 150, 170, 180];
  const stepX = w / (CODES.length - 1);

  doc.setDrawColor(180);
  doc.rect(x, y, w, h);

  tickValues.forEach(val => {
    const gy = y + h - ((val - minY) / (maxY - minY)) * h;
    doc.setDrawColor(220);
    doc.line(x, gy, x + w, gy);
    doc.setTextColor(120);
    doc.setFontSize(6);
    doc.text(String(val), x - 2, gy + 2, { align: 'right' });
  });

  const clamp = v => Math.max(minY, Math.min(maxY, v));
  doc.setDrawColor(60);
  for (let i = 0; i < sws.length; i++) {
    const px = x + i * stepX;
    const py = y + h - ((clamp(sws[i]) - minY) / (maxY - minY)) * h;
    if (i) {
      const ppx = x + (i - 1) * stepX;
      const ppy = y + h - ((clamp(sws[i - 1]) - minY) / (maxY - minY)) * h;
      doc.line(ppx, ppy, px, py);
    }
    doc.circle(px, py, 0.9, 'F');
  }

  doc.setTextColor(60);
  doc.setFontSize(6);
  CODES.forEach((c, i) => {
    const px = x + i * stepX;
    doc.text(c, px - 3.2, y + h + 6);
  });

  return y + h + 10;
}

/* ====== Huruf kategori a–f dari SW ======
   a: ≤80  (Sangat Rendah)
   b: 81–94 (Rendah)
   c: 95–99 (Sedang)
   d: 100–104 (Cukup)
   e: 105–118 (Tinggi)
   f: ≥119 (Sangat Tinggi)
*/
if (typeof letterCategoryFromSw !== 'function') {
  function letterCategoryFromSw(v){
    const n = Math.round(toNumFlexible(v));
    if (isNaN(n)) return '-';
    if (n <= 80) return 'a';
    if (n <= 94) return 'b';
    if (n <= 99) return 'c';
    if (n <= 104) return 'd';
    if (n <= 118) return 'e';
    return 'f';
  }
}

/* ===== Heuristik Kesesuaian Posisi Guru (huruf a–d) =====
   a: sangat cocok (>=110)
   b: cocok        (105–109)
   c: cukup        (95–104)
   d: kurang cocok (<95)
*/
if (typeof computeGuruFitLetter !== 'function') {
  function computeGuruFitLetter(summary, iqFromSW){
    const getSW = code => {
      const r = Array.isArray(summary) ? summary.find(x => String(x?.code||'').toUpperCase()===code) : null;
      return toNumFlexible(r?.sw);
    };
    const w = { SE:0.25, WA:0.25, AN:0.20, GE:0.20, RA:0.05, ZR:0.05 };
    let comp = 0, totW = 0;
    Object.keys(w).forEach(k => {
      const v = getSW(k);
      if (v > 0){ comp += v*w[k]; totW += w[k]; }
    });
    if (totW > 0) comp /= totW;
    else if (iqFromSW != null && !isNaN(Number(iqFromSW))) comp = Number(iqFromSW);
    else comp = 100;

    if (comp >= 110) return 'a';
    if (comp >= 105) return 'b';
    if (comp >= 95)  return 'c';
    return 'd';
  }
}

/* ===== Alasan untuk posisi Guru (berbasis SW per subtes) ===== */
if (typeof buildGuruReasons !== 'function') {
  function buildGuruReasons(summary){
    const sw = c => {
      const r = Array.isArray(summary) ? summary.find(x => String(x?.code||'').toUpperCase()===c) : null;
      return toNumFlexible(r?.sw);
    };
    const se=sw('SE'), wa=sw('WA'), an=sw('AN'), ge=sw('GE'), ra=sw('RA'), zr=sw('ZR'),
          me=sw('ME'), fa=sw('FA'), wu=sw('WU');

    const reasons = [];
    const notes   = [];

    if (se>=105 || wa>=105) reasons.push('Kekuatan verbal (SE/WA) mendukung penjelasan materi dan instruksi kelas.');
    else if (se>=100 || wa>=100) reasons.push('Komunikasi verbal memadai untuk interaksi pengajaran.');
    if (an>=105 || ge>=105) reasons.push('Penalaran analogi & kategorisasi (AN/GE) membantu memberi contoh dan menyusun pertanyaan tingkat tinggi.');
    else if (an>=100 || ge>=100) reasons.push('Penalaran konseptual cukup untuk mengaitkan konsep antar materi.');
    if (me>=100) reasons.push('Memori kerja & retensi (ME) menunjang pengelolaan banyak informasi saat mengajar.');
    if (ra>=100 || zr>=100) reasons.push('Ketelitian/kecepatan numerik (RA/ZR) berguna untuk penilaian dan materi berhitung.');
    if (fa>=100 || wu>=100) reasons.push('Visual-spasial (FA/WU) membantu membuat ilustrasi/alat peraga.');

    if (se<95 && wa<95) notes.push('Perkuat komunikasi lisan (latihan diksi, ringkas-jelas).');
    if (an<95 || ge<95) notes.push('Latih penyusunan analogi & pengelompokan konsep.');
    if (me<95)          notes.push('Tingkatkan konsistensi memori kerja (chunking, catatan penyangga).');
    if (ra<95 || zr<95) notes.push('Perbaiki akurasi/kelancaran berhitung (drill bertahap).');

    return { reasons, notes };
  }
}

/* ===== Alasan untuk posisi IT Staff (berbasis SW per subtes) ===== */
if (typeof buildITStaffReasons !== 'function') {
  function buildITStaffReasons(summary){
    const sw = c => {
      const r = Array.isArray(summary) ? summary.find(x => String(x?.code||'').toUpperCase()===c) : null;
      return toNumFlexible(r?.sw);
    };
    const an=sw('AN'), ge=sw('GE'), ra=sw('RA'), zr=sw('ZR'), fa=sw('FA'), wu=sw('WU');

    const reasons = [];
    const notes   = [];

    if (an>=105 || ge>=105) reasons.push('Kemampuan analogi dan kategorisasi (AN/GE) mendukung pemecahan masalah logis.');
    else if (an>=100 || ge>=100) reasons.push('Kemampuan logika dan kategorisasi memadai untuk tugas IT.');
    if (ra>=105 || zr>=105) reasons.push('Kemampuan numerik dan deret (RA/ZR) berguna untuk algoritma dan logika programming.');
    else if (ra>=100 || zr>=100) reasons.push('Kemampuan numerik cukup untuk pemahaman algoritma.');
    if (fa>=105 || wu>=105) reasons.push('Kemampuan visual-spasial (FA/WU) menunjang desain antarmuka dan arsitektur sistem.');
    else if (fa>=100 || wu>=100) reasons.push('Kemampuan visual-spasial memadai untuk memahami diagram dan struktur.');

    if (an<95 && ge<95) notes.push('Perlu latihan logika dan analogi (berlatih soal algoritma).');
    if (ra<95 && zr<95) notes.push('Perlu penguatan dalam hal numerik dan pola deret.');
    if (fa<95 && wu<95) notes.push('Perlu latihan visual-spasial (membaca diagram, puzzle).');

    return { reasons, notes };
  }
}

/* ===== Fungsi Kesesuaian Guru ===== */
if (typeof computeGuruFitLetter !== 'function') {
  function computeGuruFitLetter(summary, iq) {
    const sw = c => {
      const r = Array.isArray(summary) ? summary.find(x => String(x?.code||'').toUpperCase()===c) : null;
      return toNumFlexible(r?.sw);
    };
    const se=sw('SE'), wa=sw('WA'), an=sw('AN'), ge=sw('GE'), me=sw('ME');
    
    // Kriteria untuk Guru
    const keySubtes = [se, wa, an, ge, me];
    const strongCount = keySubtes.filter(s => s >= 105).length;
    const adequateCount = keySubtes.filter(s => s >= 100).length;
    
    if (iq >= 110 && strongCount >= 3) return 'a';
    if (iq >= 100 && (strongCount >= 2 || adequateCount >= 4)) return 'b';
    if (iq >= 90 && adequateCount >= 2) return 'c';
    return 'd';
  }
}

/* ===== Fungsi Kesesuaian IT Staff ===== */
if (typeof computeITStaffFitLetter !== 'function') {
  function computeITStaffFitLetter(summary, iq) {
    const sw = c => {
      const r = Array.isArray(summary) ? summary.find(x => String(x?.code||'').toUpperCase()===c) : null;
      return toNumFlexible(r?.sw);
    };
    const an=sw('AN'), ge=sw('GE'), ra=sw('RA'), zr=sw('ZR'), fa=sw('FA'), wu=sw('WU');
    
    // Kriteria untuk IT Staff
    const keySubtes = [an, ge, ra, zr, fa, wu];
    const strongCount = keySubtes.filter(s => s >= 105).length;
    const adequateCount = keySubtes.filter(s => s >= 100).length;
    
    if (iq >= 110 && strongCount >= 3) return 'a';
    if (iq >= 100 && (strongCount >= 2 || adequateCount >= 4)) return 'b';
    if (iq >= 90 && adequateCount >= 2) return 'c';
    return 'd';
  }
}

/* ====== RENDER: SATU TABEL + JML + IQ(from SW) + Dominasi + BLOK TAMBAHAN + KESIMPULAN ====== */
function renderISTSummaryToPDF(doc, pageWidth, ySection){
  try {
    const LM = 16, RM = 16, MAXY = 280, LINE_H = 2.4;
    const TEXT_W = pageWidth - (LM + RM);
    const hasEnsure = (typeof ensureSpace === 'function');

    // ===== Char-spacing & sanitasi teks =====
    if (typeof setCharSpaceSafe !== 'function') {
      function setCharSpaceSafe(doc, value = 0) {
        if (doc && typeof doc.setCharSpace === 'function') { try { doc.setCharSpace(value); } catch {} }
      }
    }
    if (typeof normalizeSpaces !== 'function') {
      function normalizeSpaces(s) {
        return String(s || '')
          .replace(/\u00A0/g, ' ')
          .replace(/[ ]{2,}/g, ' ')
          .trim();
      }
    }
    if (typeof sanitizePDFText !== 'function') {
      function sanitizePDFText(s) {
        const map = {
          'Ä':'AE','Ö':'OE','Ü':'UE','ä':'ae','ö':'oe','ü':'ue','ß':'ss',
          '“':'"','”':'"','‘':"'",'’':"'",'–':'-','—':'-','•':'-',
          '→':'->','⇒':'=>' ,'←':'<-','«':'"','»':'"',
          'Δ':'delta','≤':'<=','≥':'>=','≠':'!=','±':'+/-','×':'x','÷':'/'
        };
        let t = String(s || '').replace(/[\u00A0\u2007\u202F]/g, ' ');
        t = t.replace(/[\u00AD]/g, '');
        t = t.replace(/[ÄÖÜäöüß“”‘’–—•→⇒←«»Δ≤≥≠±×÷]/g, ch => map[ch] || ch);
        try { t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch {}
        t = t.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');
        return t;
      }
    }
    if (typeof safeStr !== 'function') {
      function safeStr(s){ return normalizeSpaces(sanitizePDFText(s)); }
    }
    if (typeof textSafe !== 'function') {
      function textSafe(doc, text, x, y, opts) { setCharSpaceSafe(doc, 0); doc.text(safeStr(text), x, y, opts); }
    }
    if (typeof printLineWrap !== 'function') {
      function printLineWrap(text, y, size = 8, step = 6) {
        doc.setFontSize(size); doc.setFont(undefined, 'normal');
        const lines = doc.splitTextToSize(safeStr(String(text)), TEXT_W);
        for (let i = 0; i < lines.length; i++) {
          if (i > 0) { y += step; if (y > MAXY) { doc.addPage(); y = 20; } }
          textSafe(doc, lines[i], LM, y);
        }
        return y;
      }
    }

    // --- summary & totals ---
    const summary = computeISTPerSubtestScores();
    const toNum = v => toNumFlexible(v);
    const totalRWDisplay = Array.isArray(summary) ? summary.reduce((acc, r) => acc + toNum(r?.rw), 0) : 0;

    const ageYears = (typeof getAgeYearsForNorms==='function') ? getAgeYearsForNorms() : 25;
    const totalSWFromRW = (typeof getTotalSWFromRW === 'function') ? getTotalSWFromRW(totalRWDisplay, ageYears) : 0;

    const iqFromSW = (typeof getIQFromSW === 'function') ? getIQFromSW(totalSWFromRW) : null;
    const iqKet    = (typeof iqCategory === 'function') ? iqCategory(iqFromSW) : '';

    // --- heading blok ringkasan ---
    ySection = (hasEnsure ? ensureSpace(doc, ySection + 2, 12) : (ySection + 2 > 270 ? (doc.addPage(), 20) : ySection + 2));
    if (typeof blokHeading === 'function') {
      blokHeading(doc, 'RINGKASAN IST - SATU TABEL', [23,78,119], 16, ySection, pageWidth - 32, 8);
      setCharSpaceSafe(doc, 0);
    } else {
      doc.setFontSize(9); doc.setTextColor(23,78,119);
      textSafe(doc, 'RINGKASAN IST - SATU TABEL', LM, ySection + 6);
      doc.setTextColor(0,0,0);
    }
    ySection += 10;

    /* ===================== TABEL ===================== */
    const right = pageWidth - RM;
    const col = {
      sub : LM,
      rw  : LM + 20,
      sw  : LM + 34,
      desc: LM + 48,
      ket : right - 16
    };
    const headerH = 7;

    if (ySection + headerH > 270) { doc.addPage(); ySection = 20; }
    doc.setFillColor(235,242,248);
    doc.rect(col.sub, ySection, right - col.sub, headerH, 'F');

    doc.setFontSize(7); doc.setTextColor(44,62,80); doc.setFont(undefined,'bold');
    textSafe(doc, 'SUBTES',    col.sub + 2, ySection + 4.6);
    textSafe(doc, 'rw',        col.rw  + 2, ySection + 4.6);
    textSafe(doc, 'sw',        col.sw  + 2, ySection + 4.6);
    textSafe(doc, 'DESKRIPSI', col.desc + 2, ySection + 4.6);
    textSafe(doc, 'ket',       col.ket  + 2, ySection + 4.6);
    ySection += headerH; doc.setFont(undefined,'normal'); doc.setTextColor(44,62,80);

    // --- isi tabel (huruf a–f di kolom ket) ---
    const CELL_FONT = 7, CELL_LINE = 3.6, ROW_PAD_TOP = 4.2, ROW_PAD_BOTTOM = 2.0;
    function drawCellMultiline(x, yTop, text, maxWidth, fontSize = CELL_FONT) {
      doc.setFontSize(fontSize); doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(safeStr(String(text || '-')), maxWidth);
      for (let i = 0; i < lines.length; i++) {
        const yLine = yTop + ROW_PAD_TOP + (i * CELL_LINE);
        textSafe(doc, lines[i], x, yLine);
      }
      return (lines.length > 0 ? (ROW_PAD_TOP + (lines.length - 1) * CELL_LINE + ROW_PAD_BOTTOM) : (ROW_PAD_TOP + ROW_PAD_BOTTOM));
    }

    if (!Array.isArray(summary) || summary.length === 0) {
      const rowH = 7;
      if (ySection + rowH > 270) { doc.addPage(); ySection = 20; }
      doc.setFillColor(248,250,252);
      doc.rect(col.sub, ySection, right - col.sub, rowH, 'F');
      textSafe(doc, '-', col.sub + 2, ySection + 4.6);
      textSafe(doc, '-', col.rw  + 2, ySection + 4.6);
      textSafe(doc, '-', col.sw  + 2, ySection + 4.6);
      textSafe(doc, 'Belum ada data subtes.', col.desc + 2, ySection + 4.6);
      textSafe(doc, '-', col.ket + 2, ySection + 4.6);
      ySection += rowH;
    } else {
      summary.forEach((r, i) => {
        const code = String(r?.code || '').toUpperCase();
        const rwNum = Math.round(toNum(r?.rw));
        const swNum = Math.round(toNum(r?.sw));
        const ketLetter = letterCategoryFromSw(swNum); // a–f

        const descWidth = col.ket - col.desc - 4;
        const ketWidth  = right - col.ket - 2;
        doc.setFontSize(CELL_FONT);

        const descLines = doc.splitTextToSize(safeStr(r?.description || '-'), descWidth);
        const ketLines  = doc.splitTextToSize(safeStr(ketLetter || '-'),      ketWidth);
        const lines = Math.max(descLines.length, ketLines.length);
        const rowH = Math.max(7, ROW_PAD_TOP + (lines - 1) * CELL_LINE + ROW_PAD_BOTTOM);

        if (ySection + rowH > 270) { doc.addPage(); ySection = 20; }
        if (i % 2 === 0) { doc.setFillColor(248,250,252); doc.rect(col.sub, ySection, right - col.sub, rowH, 'F'); }

        doc.setFontSize(CELL_FONT);
        textSafe(doc, code || '-',             col.sub + 2, ySection + ROW_PAD_TOP);
        textSafe(doc, encodeScoreCode(rwNum),  col.rw  + 2, ySection + ROW_PAD_TOP);
        textSafe(doc, encodeScoreCode(swNum),  col.sw  + 2, ySection + ROW_PAD_TOP);
        drawCellMultiline(col.desc + 2, ySection, r?.description || '-', descWidth, CELL_FONT);
        drawCellMultiline(col.ket  + 2, ySection, ketLetter || '-',      ketWidth,  CELL_FONT);

        ySection += rowH;
      });
    }

    /* ===== IQ & Dominasi ===== */
    if (ySection + 12 > 270) { doc.addPage(); ySection = 20; }
    const dominasi = computeDominasi(summary);
    doc.setFontSize(8); doc.setTextColor(44,62,80);

    const iqLetter = letterCategoryFromSw(totalSWFromRW); // a–f
    const iqLine = (iqFromSW != null)
      ? `IQ: ${encodeScoreCode(iqFromSW)} — ${iqKet || '-'} [${iqLetter}]`
      : `IQ: -`;
    ySection = printLineWrap(iqLine, ySection);
    ySection += 5;
    ySection = printLineWrap(`Dominasi: ${safeStr(dominasi)}`, ySection);
    ySection += 6;

    // --- Baris JML: kode terenkripsi ---
    const jh = 7;
    if (ySection + jh > 270) { doc.addPage(); ySection = 20; }
    doc.setFillColor(232,232,232);
    doc.rect(col.sub, ySection, right - col.sub, jh, 'F');
    doc.setFont(undefined,'bold');
    textSafe(doc, 'JML',                           col.sub + 2, ySection + 4.6);
    textSafe(doc, encodeScoreCode(totalRWDisplay), col.rw  + 2, ySection + 4.6);
    textSafe(doc, encodeScoreCode(totalSWFromRW),  col.sw  + 2, ySection + 4.6);
    doc.setFont(undefined,'normal');
    ySection += jh + 2;

    /* ====================== BLOK TAMBAHAN ====================== */
    const strengths = summary.filter(r => toNum(r?.sw) > 100).map(r => String(r?.code||'').toUpperCase());
    const weaknesses = summary.filter(r => toNum(r?.sw) < 100).map(r => String(r?.code||'').toUpperCase());

    if (ySection + 18 > 270) { doc.addPage(); ySection = 20; }
    ySection = (function printHeading(text, y, size = 8) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(size); doc.setFont(undefined, 'bold');
      textSafe(doc, String(text), LM, y);
      doc.setFont(undefined, 'normal');
      return y + 0;
    })('Kekuatan', ySection);
    ySection = (function printParagraph(text, y, size = 8) {
      doc.setFontSize(size); doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(safeStr(String(text)), TEXT_W);
      for (let i = 0; i < lines.length; i++) {
        y += LINE_H; if (y > MAXY) { doc.addPage(); y = 20; }
        textSafe(doc, lines[i], LM, y);
      }
      return y;
    })( 'Subtes dengan performa di atas ambang referensi (SW): ' + (strengths.length ? strengths.join(', ') : '-'), ySection );
    ySection += 4;

    ySection = (function(text, y){ if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(8); doc.setFont(undefined, 'bold'); textSafe(doc, String(text), LM, y); doc.setFont(undefined, 'normal'); return y; })('Kelemahan', ySection);
    ySection = (function(text, y){ doc.setFontSize(8); doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(safeStr(String(text)), TEXT_W);
      for (let i = 0; i < lines.length; i++) { y += LINE_H; if (y > MAXY) { doc.addPage(); y = 20; } textSafe(doc, lines[i], LM, y); }
      return y;
    })( 'Subtes di bawah ambang referensi (SW): ' + (weaknesses.length ? weaknesses.join(', ') : '-'), ySection );
    ySection += 6;

    // Cara berpikir
    const getSW_forThink = c => {
      const r = summary.find(x => String(x?.code||'').toUpperCase() === c);
      return toNumFlexible(r?.sw);
    };
    const sumFest = getSW_forThink('GE') + getSW_forThink('RA');
    const sumFlex = getSW_forThink('AN') + getSW_forThink('ZR');
    const diff    = sumFest - sumFlex;

    ySection = (hasEnsure ? ensureSpace(doc, ySection, 40) : (ySection + 40 > 270 ? (doc.addPage(), 20) : ySection));
    ySection = (function(text, y){ if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(8); doc.setFont(undefined, 'bold'); textSafe(doc, String(text), LM, y); doc.setFont(undefined, 'normal'); return y; })('Cara berpikir', ySection);
    ySection = (function(text, y){ doc.setFontSize(8);
      const lines = doc.splitTextToSize(safeStr(String(text)), TEXT_W);
      for (let i = 0; i < lines.length; i++) { y += LINE_H; if (y > MAXY) { doc.addPage(); y = 20; } textSafe(doc, lines[i], LM, y); }
      return y;
    })( 'Perbandingan menggunakan ambang internal. Jika dominan "GE+RA" maka condong "FESTIGUNG (Mantap/Eksak)"; jika dominan "AN+ZR" maka "FLEKSIBILITAET (Fleksibel/Non-Eksak)". Bila ambang tidak terlampaui, jangan diinterpretasikan.', ySection );

    let klasCara;
    if      (diff > 10)  klasCara = 'FESTIGUNG (Mantap/Eksak)';
    else if (diff < -10) klasCara = 'FLEKSIBILITAET (Fleksibel/Non-Eksak)';
    else                 klasCara = 'Kurang pasti (ambang tidak terlampaui)';

    ySection += LINE_H;
    if (ySection > 270) { doc.addPage(); ySection = 20; }
    doc.setFontSize(8);

    const festCode  = encodeScoreCode(sumFest);
    const flexCode  = encodeScoreCode(sumFlex);
    const deltaCode = encodeScoreCode(diff);

    ySection = printLineWrap(
      `GE+RA = ${festCode} | AN+ZR = ${flexCode} | delta = ${deltaCode} => ${klasCara}`,
      ySection
    );
    ySection += 6;

    // Grafik corak berpikir
    ySection = (function(text, y){ if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(8); doc.setFont(undefined, 'bold'); textSafe(doc, String(text), LM, y); doc.setFont(undefined, 'normal'); return y; })('Corak berpikir', ySection);
    ySection += LINE_H;

    const graphWidth  = pageWidth - 40;
    const graphHeight = 46;
    ySection = (hasEnsure ? ensureSpace(doc, ySection, graphHeight + 20) : (ySection + graphHeight + 20 > 270 ? (doc.addPage(), 20) : ySection));

    if (typeof drawSWLineChart === 'function') {
      ySection = drawSWLineChart(doc, 20, ySection, graphWidth, graphHeight, summary);
      setCharSpaceSafe(doc, 0);
    }

    const vSE = getSW_forThink('SE'), vWA = getSW_forThink('WA'), vAN = getSW_forThink('AN'), vGE = getSW_forThink('GE');
    let pola = 'Tidak jelas (campuran/relatif datar).';
    if (vSE < vWA && vWA > vAN && vAN < vGE) pola = 'Huruf "M" -> cenderung verbal-teoretis.';
    else if (vSE > vWA && vWA < vAN && vAN > vGE) pola = 'Huruf "W" -> cenderung praktis-konkret.';
    ySection = printLineWrap(`Pola terdeteksi: ${pola}`, ySection);
    ySection += 6;

    // ====================== KESIMPULAN (sesuai posisi yang diapply) ======================
    ySection = (hasEnsure ? ensureSpace(doc, ySection, 20) : (ySection + 20 > 270 ? (doc.addPage(), 20) : ySection));

    // Cek posisi yang diapply dari appState.identity.position
    const position = (typeof appState !== 'undefined' && appState.identity && appState.identity.position) 
      ? String(appState.identity.position) 
      : '';

    doc.setFontSize(8.5);
    doc.setFont(undefined, 'bold');

    // Tentukan posisi mana yang akan ditampilkan
    const showGuru = position === "Dosen/Guru";
    const showITStaff = position === "IT Staff" || position === "Technical Staff";

    if (showGuru) {
      // Tampilkan hanya untuk Guru/Dosen
      textSafe(doc, 'Kesimpulan untuk Posisi Guru/Dosen', LM, ySection);
      doc.setFont(undefined, 'normal');
      ySection += 5;

      const guruFit = computeGuruFitLetter(summary, iqFromSW);
      const { reasons, notes } = buildGuruReasons(summary);

      const lines = [];
      lines.push(`Kesesuaian: ${guruFit}`);
      if (reasons.length) {
        lines.push('');
        lines.push('Alasan:');
        reasons.forEach(r => lines.push('• ' + r));
      }
      if (notes.length) {
        lines.push('');
        lines.push('Catatan pengembangan:');
        notes.forEach(n => lines.push('• ' + n));
      }

      doc.setFontSize(8);
      const BOX_W = TEXT_W, INNER_X = LM + 3, INNER_W = BOX_W - 6, LINE_GAP = 3.0;
      let wrapped = [];
      lines.forEach(l => {
        if (!l) { wrapped.push(''); return; }
        const parts = doc.splitTextToSize(l, INNER_W);
        wrapped = wrapped.concat(parts);
      });

      const contentH = Math.max(10, wrapped.length * LINE_GAP + 4);
      ySection = (hasEnsure ? ensureSpace(doc, ySection, contentH + 4) : (ySection + contentH + 4 > 270 ? (doc.addPage(), 20) : ySection));

      doc.setDrawColor(225, 229, 235);
      doc.setFillColor(248, 250, 252);
      doc.rect(LM, ySection, BOX_W, contentH, 'FD');

      let yy = ySection + 6;
      doc.setTextColor(44,62,80);
      wrapped.forEach((t) => {
        if (t === '') { yy += LINE_GAP; return; }
        textSafe(doc, t, INNER_X, yy);
        yy += LINE_GAP;
      });
      ySection = ySection + contentH + 6;
      
    } else if (showITStaff) {
      // Tampilkan hanya untuk IT Staff
      textSafe(doc, 'Kesimpulan untuk Posisi IT Staff', LM, ySection);
      doc.setFont(undefined, 'normal');
      ySection += 5;

      const itStaffFit = computeITStaffFitLetter(summary, iqFromSW);
      const { reasons, notes } = buildITStaffReasons(summary);

      const lines = [];
      lines.push(`Kesesuaian: ${itStaffFit}`);
      if (reasons.length) {
        lines.push('');
        lines.push('Alasan:');
        reasons.forEach(r => lines.push('• ' + r));
      }
      if (notes.length) {
        lines.push('');
        lines.push('Catatan pengembangan:');
        notes.forEach(n => lines.push('• ' + n));
      }

      doc.setFontSize(8);
      const BOX_W = TEXT_W, INNER_X = LM + 3, INNER_W = BOX_W - 6, LINE_GAP = 3.0;
      let wrapped = [];
      lines.forEach(l => {
        if (!l) { wrapped.push(''); return; }
        const parts = doc.splitTextToSize(l, INNER_W);
        wrapped = wrapped.concat(parts);
      });

      const contentH = Math.max(10, wrapped.length * LINE_GAP + 4);
      ySection = (hasEnsure ? ensureSpace(doc, ySection, contentH + 4) : (ySection + contentH + 4 > 270 ? (doc.addPage(), 20) : ySection));

      doc.setDrawColor(225, 229, 235);
      doc.setFillColor(248, 250, 252);
      doc.rect(LM, ySection, BOX_W, contentH, 'FD');

      let yy = ySection + 6;
      doc.setTextColor(44,62,80);
      wrapped.forEach((t) => {
        if (t === '') { yy += LINE_GAP; return; }
        textSafe(doc, t, INNER_X, yy);
        yy += LINE_GAP;
      });
      ySection = ySection + contentH + 6;
    } else {
      // Jika tidak ada posisi yang cocok (Administrator, Housekeeping, dll)
      textSafe(doc, 'Kesimpulan Umum', LM, ySection);
      doc.setFont(undefined, 'normal');
      ySection += 5;
      
      const lines = ['Tidak ada analisis spesifik untuk posisi ini.'];
      
      doc.setFontSize(8);
      const BOX_W = TEXT_W, INNER_X = LM + 3, INNER_W = BOX_W - 6, LINE_GAP = 3.0;
      let wrapped = [];
      lines.forEach(l => {
        const parts = doc.splitTextToSize(l, INNER_W);
        wrapped = wrapped.concat(parts);
      });

      const contentH = Math.max(10, wrapped.length * LINE_GAP + 4);
      ySection = (hasEnsure ? ensureSpace(doc, ySection, contentH + 4) : (ySection + contentH + 4 > 270 ? (doc.addPage(), 20) : ySection));

      doc.setDrawColor(225, 229, 235);
      doc.setFillColor(248, 250, 252);
      doc.rect(LM, ySection, BOX_W, contentH, 'FD');

      let yy = ySection + 6;
      doc.setTextColor(44,62,80);
      wrapped.forEach((t) => {
        textSafe(doc, t, INNER_X, yy);
        yy += LINE_GAP;
      });
      ySection = ySection + contentH + 6;
    }

    doc.setTextColor(0,0,0);
    setCharSpaceSafe(doc, 0);
    return ySection + 2;
  } catch (e) {
    console.warn('[IST] renderISTSummaryToPDF error', e);
    try { setCharSpaceSafe(doc, 0); } catch {}
    return ySection;
  }
}




/* ==================== IST Test (dengan optimasi loading gambar) ==================== */

/* ====== IMAGE PRELOADER & CACHE (percepat pindah soal gambar) ====== */
const __imgCache = new Map();

function preloadImage(src) {
  if (!src) return Promise.resolve();
  if (__imgCache.has(src)) return __imgCache.get(src);

  // Hint prioritas ke browser
  try {
    const l = document.createElement('link');
    l.rel = 'preload';
    l.as = 'image';
    l.href = src;
    document.head.appendChild(l);
  } catch {}

  const img = new Image();
  img.decoding = 'async';
  img.src = src;

  const p = (img.decode ? img.decode() : new Promise((res, rej) => {
    img.onload = res; img.onerror = rej;
  })).catch(() => {});
  __imgCache.set(src, p);
  return p;
}

async function preloadQuestionAssets(subtest, idx) {
  const q = subtest?.questions?.[idx];
  if (!q) return;
  const jobs = [];
  if (q.questionImage) jobs.push(preloadImage(q.questionImage));
  (q.images || []).forEach(s => jobs.push(preloadImage(s)));
  await Promise.all(jobs);
}

/* ====== Helper untuk kontrol sesi IST (hindari duplikasi jawaban) ====== */
function hasAnyISTAnswers() {
  return Array.isArray(appState?.answers?.IST) &&
         appState.answers.IST.some(b => Array.isArray(b?.answers) && b.answers.length > 0);
}

function resetISTSession() {
  appState.currentSubtest = 0;
  appState.currentQuestion = 0;
  appState.completed = appState.completed || {};
  appState.completed.IST = false;

  // siapkan bucket kosong untuk semua subtes IST
  appState.answers = appState.answers || {};
  appState.answers.IST = (tests?.IST?.subtests || []).map(st => ({
    name: st.name,
    answers: []
  }));
}

function renderISTSubtestIntro() {
  const subtest = tests.IST.subtests[appState.currentSubtest];

  if (!subtest) {
    appState.completed.IST = true;
    showBreakScreen();
    return;
  }

  // Guard contoh (jika tidak tersedia, jangan akses properti yg tidak ada)
  const hasExample = !!subtest.example;
  const ex = hasExample ? subtest.example : {};
  const exImages = Array.isArray(ex.images) ? ex.images : [];

  // Preload contoh (jika ada)
  try {
    if (ex.questionImage) preloadImage(ex.questionImage);
    exImages.forEach(src => preloadImage(src));
  } catch {}

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <h2>Subtes ${subtest.name}</h2>
      <p><strong>Deskripsi:</strong> ${subtest.description || '-'}</p>
      <p><strong>Petunjuk:</strong> ${subtest.instruction || '-'}</p>
      <p><strong>Waktu:</strong> ${Math.floor((subtest.time||0)/60)} menit</p>
      <p><strong>Jumlah soal:</strong> ${Array.isArray(subtest.questions) ? subtest.questions.length : 0}</p>

${subtest.type === 'image-choice' ? `
  ${hasExample ? `
  <div class="example-answer" style="max-width: 500px; margin: 20px auto; text-align: center; font-family: Arial, sans-serif;">
    <h4 style="margin-bottom: 15px;">Contoh Soal:</h4>
    ${ex.questionImage ? `
      <img
        src="${ex.questionImage}"
        alt="Contoh Soal Gambar"
        loading="eager"
        fetchpriority="high"
        decoding="async"
        width="640" height="360"
        style="max-width: 100%; max-height: 200px; object-fit: contain; margin: 10px auto 20px auto; display: block;"
      >
    ` : ''}
    <div class="example-option-images" style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px;">
      ${exImages.map((img, index) => `
        <div style="text-align: center;">
          <img
            src="${img}"
            alt="Pilihan ${ex.options?.[index] ?? ''}"
            loading="lazy"
            decoding="async"
            width="96" height="96"
            style="max-width: 80px; max-height: 80px; object-fit: contain; border-radius: 8px; box-shadow: 0 0 5px rgba(0,0,0,0.1);"
          ><br>
          <strong>${ex.options?.[index] ?? ''}</strong>
        </div>
      `).join('')}
    </div>
    ${ex.answer ? `<p style="font-weight: 600;"><strong>Jawaban:</strong> ${ex.answer}</p>` : ''}
    ${ex.explanation ? `<p><strong>Penjelasan:</strong> ${ex.explanation}</p>` : ''}
  </div>
  ` : ''}
` : `
  ${hasExample ? `
  <div class="example-answer">
    <h4>Contoh Soal:</h4>
    ${ex.question ? `<p><strong>Soal:</strong> ${ex.question}</p>` : ''}
    ${Array.isArray(ex.options) ? `<p><strong>Pilihan:</strong> ${ex.options.join(', ')}</p>` : ''}
    ${ex.answer ? `<p><strong>Jawaban:</strong> ${ex.answer}</p>` : ''}
    ${ex.explanation ? `<p><strong>Penjelasan:</strong> ${ex.explanation}</p>` : ''}
  </div>
  ` : ''}
`}

      <div style="text-align: center; margin-top: 30px;">
        <button class="btn" onclick="startISTSubtest()">
          Mulai Subtes
        </button>
        <button class="btn btn-outline" onclick="renderHome()">
          Kembali
        </button>
      </div>
    </div>
  `;
}


function startISTSubtest() {
  // === Pastikan kunci sudah terinjeksi SEBELUM apa pun ===
  try {
    if (!window.__istKeysApplied && typeof window.applyAllKeysIntoQuestions === 'function') {
      window.applyAllKeysIntoQuestions(); // idempoten, aman dipanggil sekali di sini
    }
  } catch (e) {
    console.warn('[IST] Gagal injeksi kunci:', e);
  }

  // Pastikan struktur jawaban ada
  appState.answers = appState.answers || {};
  appState.answers.IST = appState.answers.IST || [];

  // Jika benar-benar mulai dari awal dan ada jawaban lama → tawarkan reset
  if (appState.currentSubtest === 0 &&
      appState.currentQuestion === 0 &&
      hasAnyISTAnswers()) {
    const overwrite = window.confirm('Mulai ulang IST? Hasil sebelumnya akan dihapus.');
    if (overwrite) {
      resetISTSession();
    }
    // jika tidak di-reset, lanjut sebagai resume
  }

  // Guard: pastikan subtes tersedia
  const subtests = tests?.IST?.subtests;
  if (!Array.isArray(subtests)) {
    console.error('[IST] Subtes tidak tersedia.');
    return;
  }
  const subtest = subtests[appState.currentSubtest];
  if (!subtest) {
    // kalau sudah lewat batas, kembali ke intro/akhir
    appState.completed = appState.completed || {};
    appState.completed.IST = true;
    renderISTSubtestIntro();
    return;
  }

  // waktu
  appState.timeLeft = Number(subtest.time) || 0;

  // siapkan bucket subtes ini bila belum ada
  if (!appState.answers.IST[appState.currentSubtest]) {
    appState.answers.IST[appState.currentSubtest] = {
      name: subtest.name,
      answers: []
    };
  } else {
    // samakan nama subtes (kalau ada perubahan label)
    appState.answers.IST[appState.currentSubtest].name = subtest.name;
  }

  // Preload pertanyaan awal + lookahead
  try {
    preloadQuestionAssets(subtest, 0);
    preloadQuestionAssets(subtest, 1);
  } catch {}

  // jika ada fase hafalan (ME)
  if (subtest.memorizePhase) {
    renderISTMemorizePhase();
    return;
  }

  // default: mulai soal
  renderISTQuestion();
  startTimer();
}

function renderISTMemorizePhase() {
  const subtest = tests.IST.subtests[appState.currentSubtest];
  const dur = (subtest.memorizePhase && subtest.memorizePhase.duration) ? subtest.memorizePhase.duration : 180;

  clearInterval(appState.timer);
  appState.timeLeft = dur;

  const app = document.getElementById('app');
  const renderMemorize = () => {
    const mm = String(Math.floor(appState.timeLeft / 60)).padStart(2, '0');
    const ss = String(appState.timeLeft % 60).padStart(2, '0');

    const groupsHTML = (subtest.memorizePhase.groups || []).map(g => `
      <div style="margin:10px 0;">
        <div style="font-weight:700;color:#173;">${g.label}</div>
        <div style="letter-spacing:.4px">${g.items.join(', ')}</div>
      </div>
    `).join('');

    app.innerHTML = `
      <div class="card">
        <div class="timer-container" style="justify-content:center;">
          <div class="timer-icon">🧠</div>
          <div class="timer" id="memorize-timer-display">${mm}:${ss}</div>
        </div>
        <h3 style="text-align:center;margin-top:8px;">${subtest.memorizePhase.title || 'Hafalkan daftar berikut'}</h3>
        <div style="max-width:720px;margin:16px auto 0 auto;">
          ${groupsHTML}
        </div>
        <div style="text-align:center;margin-top:24px;">
          <button class="btn btn-outline" onclick="confirmCancelTest()">Batalkan</button>
        </div>
      </div>
    `;
  };

  try { prepareAudioContext(); playBeep(); } catch {}

  renderMemorize();
  appState.timer = setInterval(() => {
    appState.timeLeft--;
    const el = document.getElementById('memorize-timer-display');
    if (el) {
      const mm = String(Math.floor(appState.timeLeft / 60)).padStart(2, '0');
      const ss = String(appState.timeLeft % 60).padStart(2, '0');
      el.textContent = `${mm}:${ss}`;
    }
    if (appState.timeLeft <= 0) {
      clearInterval(appState.timer);
      try { playBeep(); } catch {}
      const subtestNow = tests.IST.subtests[appState.currentSubtest];
      appState.timeLeft = subtestNow.time;
      renderISTQuestion();
      startTimer();
    }
  }, 1000);
}

function renderISTQuestion() {
  const subtest = tests.IST.subtests[appState.currentSubtest];
  const question = subtest.questions[appState.currentQuestion];

  const progress = calculateProgress();

  let optionsHTML = '';

  if (subtest.type === 'multiple-choice') {
    optionsHTML = question.options.map(option => {
      const letter = normalizeLetter(option);
      const cleanText = String(option).replace(/^[A-E][\.\)]?\s*/, '');
      return `
        <label class="option-box">
          <input type="radio" name="ist-answer" value="${letter}">
          ${cleanText}
          <span class="checkmark"></span>
        </label>
      `;
    }).join('');
  }
  else if (subtest.type === 'text-input') {
    optionsHTML = `
      <div class="form-group" style="margin-top: 15px;">
        <input type="text" id="ist-answer" class="form-control" placeholder="Ketik jawaban Anda">
      </div>
    `;
  }
  else if (subtest.type === 'number-input') {
    optionsHTML = `
      <div class="form-group" style="margin-top: 15px;">
        <input type="number" id="ist-answer" class="form-control" placeholder="Ketik angka jawaban">
      </div>
    `;
  }
  else if (subtest.type === 'image-choice') {
    optionsHTML = `
      <div class="ist-question-area">
        <div class="ist-image-question">
          ${question.questionImage ? `
            <img
              src="${question.questionImage}"
              alt="Soal"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              width="640" height="360"
              style="max-width:100%; max-height:260px; object-fit:contain; display:block; margin:0 auto;"
            >
          ` : ""}
          <div class="ist-image-question-title">${subtest.instruction || ''}</div>
        </div>
        <div class="ist-image-options-grid">
          ${(question.images || []).map((img, index) => `
            <div class="ist-image-option" data-idx="${index}">
              <img
                src="${img}"
                alt="Opsi ${question.options ? question.options[index] : String.fromCharCode(65+index)}"
                loading="lazy"
                decoding="async"
                width="160" height="160"
                style="max-width:120px; max-height:120px; object-fit:contain;"
              >
              <span class="ist-image-option-label">${question.options ? question.options[index] : String.fromCharCode(65+index)}</span>
              <input type="radio" name="ist-answer" value="${question.options ? normalizeLetter(question.options[index]) : String.fromCharCode(65+index)}" style="display:none;">
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="timer-container">
        <div class="timer-icon">⏱️</div>
        <div class="timer" id="timer-display">${appState.timeLeft}s</div>
      </div>
      <div class="progress-container">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <h3>Subtes ${subtest.name}</h3>
      <div class="question-container">
        <p class="question-text">${question.text || ''}</p>
        <div class="option-grid">
          ${optionsHTML}
        </div>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <button class="btn" onclick="nextISTQuestion()">
          ${appState.currentQuestion < subtest.questions.length - 1 ? 'Lanjut' : 'Selesai'}
        </button>
        <button class="btn btn-outline" onclick="confirmCancelTest()">
          Batalkan Tes
        </button>
      </div>
    </div>
  `;

  if (subtest.type === 'image-choice') {
    document.querySelectorAll('.ist-image-option').forEach(opt => {
      opt.addEventListener('click', function () {
        document.querySelectorAll('.ist-image-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        const inp = this.querySelector('input');
        if (inp) inp.checked = true;
      });
    });
  }

  if (subtest.type === 'multiple-choice') {
    document.querySelectorAll('.option-box').forEach(box => {
      box.addEventListener('click', function () {
        document.querySelectorAll('.option-box').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        const inp = this.querySelector('input');
        if (inp) inp.checked = true;
      });
    });
  }

  // Preload 2 soal ke depan agar pindah soal terasa instan
  try {
    preloadQuestionAssets(subtest, appState.currentQuestion + 1);
    preloadQuestionAssets(subtest, appState.currentQuestion + 2);
  } catch {}

  updateTimerDisplay();
}

// Digunakan hanya untuk multiple-choice (opsi huruf, bukan gambar FA/WU)
function selectISTAnswer(value) {
  document.querySelectorAll('.option-box').forEach(b => b.classList.remove('selected'));
  const v = normalizeLetter(value);
  const radio = document.querySelector(`input[name="ist-answer"][value="${v}"]`);
  if (radio) {
    radio.checked = true;
    radio.parentElement.classList.add('selected');
  }
}

function nextISTQuestion() {
  const subtest  = tests.IST.subtests[appState.currentSubtest];
  const question = subtest.questions[appState.currentQuestion];
  let answer = '';

  // Ambil jawaban
  if (subtest.type === 'multiple-choice' || subtest.type === 'image-choice') {
    const selectedOption = document.querySelector('input[name="ist-answer"]:checked');
    answer = selectedOption ? normalizeLetter(selectedOption.value) : '-';
  } else {
    const input = document.getElementById('ist-answer');
    answer = input ? input.value : '-';
  }

  // Skoring
  const code = getSubtestCode(subtest.name);
  let correct, score, maxScore;

  if (code === 'GE') {
    const geIdx = appState.currentQuestion; // 0..15
    score = scoreGE(geIdx, answer);
    maxScore = 2;
    correct = (score === 2); // 2 poin = benar penuh
  } else if (question.answer != null && question.answer !== '') {
    if (subtest.type === 'number-input') {
      correct = String(answer).trim() === String(question.answer).trim();
    } else {
      // pilihan ganda huruf (SE/WA/AN/FA/WU/ME)
      // pastikan question.answer konsisten huruf A..E
      correct = normalizeLetter(answer) === normalizeLetter(question.answer);
    }
  }

  // ====== SIMPAN TANPA DUPLIKASI: REPLACE BY INDEX ======
  const bucket =
    appState.answers.IST[appState.currentSubtest] ||
    (appState.answers.IST[appState.currentSubtest] = { name: subtest.name, answers: [] });

  const record = {
    id: question?.id ?? `${code}-${appState.currentQuestion + 1}`,
    answer,
    correct,
    ...(typeof score === 'number' ? { score, maxScore } : {})
  };

  bucket.answers[appState.currentQuestion] = record; // <- replace, bukan push

  // Lanjut navigasi
  appState.currentQuestion++;
  if (appState.currentQuestion >= subtest.questions.length) {
    clearInterval(appState.timer);
    appState.currentSubtest++;
    appState.currentQuestion = 0;
    renderISTSubtestIntro();
  } else {
    renderISTQuestion();
  }
}

/* ==================== Thank You Screen After IST (1 tombol) ==================== */
function showBreakScreen() {
  // Tandai IST selesai
  if (typeof window.markTestCompleted === 'function') {
    markTestCompleted('IST');
  } else {
    window.appState = window.appState || {};
    appState.completed = appState.completed || {};
    appState.completed.IST = true;
    try {
      const saved = JSON.parse(localStorage.getItem('completed') || '{}');
      saved.IST = true;
      localStorage.setItem('completed', JSON.stringify(saved));
    } catch {}
    if (typeof window.updateDownloadButtonState === "function") {
      window.updateDownloadButtonState();
    }
  }

  // Render ucapan terima kasih (desain selaras IST)
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card" style="
      max-width:820px;margin:34px auto;padding:32px 28px;border-radius:22px;
      background:linear-gradient(135deg,#f5fff8 86%,#e8fff1 100%);
      box-shadow:0 10px 34px #c7f4da55;border:1.6px solid #c8f1d6;text-align:center;">
      <div style="font-size:3rem;line-height:1;margin-bottom:10px;">🎉</div>
      <h2 style="margin:6px 0 8px 0;font-weight:900;color:#13693a;">
        Terima kasih! Tes IST sudah selesai
      </h2>
      <p style="font-size:1.08rem;color:#244;max-width:680px;margin:0 auto 16px auto;line-height:1.6;">
        Jawaban Anda untuk Tes <b>IST</b> telah tersimpan. Silakan lanjut mengerjakan tes lain yang Anda pilih.
        Tombol <b>Download PDF</b> akan aktif kembali setelah <b>semua</b> tes pilihan selesai dikerjakan.
      </p>

      <div style="display:flex;gap:12px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
        <button id="btnContinueIST" class="btn" style="
          padding:12px 24px;font-weight:800;border-radius:11px;
          background:#18a35d;color:#fff;border:0;box-shadow:0 4px 18px #bff1d7;">
          ✅ Lanjut Tes Berikutnya
        </button>
      </div>
    </div>
  `;

  // Aksi: matikan guard tes lalu kembali ke Home
  const goNext = () => {
    window.__inTestView = false; // penting agar renderHome tidak diblokir oleh guard
    if (typeof window.renderHome === 'function') window.renderHome();
    setTimeout(() => {
      const el = document.getElementById('homeCard') || document.getElementById('downloadPDFBox');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  document.getElementById('btnContinueIST').onclick = goNext;

  // Tidak ada timer/auto-redirect; user menekan tombol untuk lanjut.
}



// ====================  KRAEPLIN LOGIC SIAP COPAS (KOTAK INPUT 1 PER KOLOM) ====================
let timeOutEffect = false;

/* ==================== CSS: inject sekali ==================== */
(function injectKraeplinOverlayStyles(){
  if (document.getElementById('kraeplinOverlayStyles')) return;
  const css = `
  body.kraeplin-blurred #app .kraeplin-card,
  body.kraeplin-blurred #app .kraeplin-board-flex,
  body.kraeplin-blurred #app .timer-float-top,
  body.kraeplin-blurred #app #kraeplinLiveStats{
    filter: blur(4px);
    pointer-events: none !important;
    user-select: none;
  }
  .overlay-veil{
    position:fixed; inset:0; background:rgba(15,23,42,.45);
    backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);
    display:flex; align-items:center; justify-content:center; z-index:999;
  }
  .overlay-modal{
    background:#fff; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,.25);
    width:min(520px,92vw); padding:22px 22px 18px; text-align:center;
  }
  .overlay-modal h3{ margin:0 0 6px 0; font-size:1.35rem; color:#0f172a; letter-spacing:.2px;}
  .overlay-modal p{ margin:6px 0 16px 0; color:#334155; line-height:1.5; font-size:.98rem;}
  .overlay-actions{ display:flex; justify-content:center; gap:10px; margin-top:10px;}
  .btn-pill{ border:0; border-radius:999px; padding:12px 28px; font-weight:700; font-size:1.02rem;
    cursor:pointer; box-shadow:0 6px 14px rgba(0,0,0,.15);
    transition:transform .12s ease, filter .12s ease, background .12s ease;
  }
  .btn-pill:hover{ transform:translateY(-1px); filter:brightness(.98);}
  .btn-start-trial{ background:#e67e22; color:#fff;}
  .btn-start-real{ background:#2ecc71; color:#fff;}
  .btn-start-real2{ background:#3498db; color:#fff;}
  .btn-pill:focus-visible{ outline:3px solid #60a5fa; outline-offset:2px;}

  /* ==== PROGRESS KRAEPLIN ==== */
  .kp-progress{ margin:12px 4px 14px; }
  .kp-progress-head{
    display:flex; justify-content:space-between; align-items:center;
    font-size:.95rem; color:#0f172a; margin-bottom:6px;
  }
  .kp-progress-head b{ font-weight:800; letter-spacing:.2px; }
  .kp-bar{
    width:100%; height:10px; background:#e5efff; border-radius:999px; overflow:hidden;
    box-shadow:inset 0 1px 2px rgba(0,0,0,.05);
  }
  .kp-fill{
    height:100%; width:0%;
    background:linear-gradient(90deg,#60a5fa,#34d399);
    transition:width .25s ease;
  }
  .kp-dots{
    display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; justify-content:center;
  }
  .kp-dot{
    width:8px; height:8px; border-radius:50%; background:#e2e8f0; opacity:.8;
    transition:transform .12s ease, background .12s ease, opacity .12s ease;
  }
  .kp-dot.done{ background:#34d399; opacity:1; }
  .kp-dot.cur{
    background:#60a5fa; transform:scale(1.35); box-shadow:0 0 0 2px rgba(96,165,250,.25);
  }

  /* ==== efek ketika waktu mepet ==== */
  .danger-timer{ color:#e74c3c !important; font-weight:bold !important; }
  `;
  const style = document.createElement('style');
  style.id = 'kraeplinOverlayStyles';
  style.textContent = css;
  document.head.appendChild(style);
})();

/* ==================== Overlay helpers ==================== */
function setKraeplinBlur(state){ document.body.classList.toggle('kraeplin-blurred', !!state); }
function createOverlay(inner){
  removeOverlay();
  const veil = document.createElement('div');
  veil.id = 'kraeplinOverlay';
  veil.className = 'overlay-veil';
  veil.setAttribute('role','dialog'); veil.setAttribute('aria-modal','true');
  veil.innerHTML = `<div class="overlay-modal" tabindex="-1">${inner}</div>`;
  veil.addEventListener('click', (e)=>{ if (e.target===veil){ e.preventDefault(); e.stopPropagation(); }});
  document.body.appendChild(veil);
  requestAnimationFrame(()=>{ const b=veil.querySelector('button'); if (b) b.focus(); });
}
function removeOverlay(){ const v=document.getElementById('kraeplinOverlay'); if (v) v.remove(); }
let _enterHotkeyCleanup = null;
function attachEnterHotkeyOnce(btnId, fn){
  if (_enterHotkeyCleanup) _enterHotkeyCleanup();
  const handler = (e)=>{
    if (e.key==='Enter'){
      const b=document.getElementById(btnId);
      if (b){ e.preventDefault(); fn(); }
    }
  };
  document.addEventListener('keydown', handler);
  _enterHotkeyCleanup = ()=>document.removeEventListener('keydown', handler);
}

/* ==================== BOARD & TIMER ==================== */
function renderKraeplinBoard() {
  const columns = tests.KRAEPLIN.columns;
  const app = document.getElementById('app');
  const colCount = columns.length;
  const visibleRows = appState.isKraeplinTrial ? 10 : 5;
  const visibleCols = 4;
  const activeCol = appState.currentColumn ?? 0;
  const isSelesai = appState.completed.KRAEPLIN;

  const windowEnd = Math.min(colCount, activeCol + 1);
  const windowStart = Math.max(0, windowEnd - visibleCols);

  const treadmillIndexes = (col) => {
    let arr = []; let len = columns[col].length;
    let from = Math.max(0, len - visibleRows);
    for (let i = from; i < len; i++) arr.push(i);
    return arr;
  };

  const dangerEffect = appState.kraeplinStarted && timeOutEffect ? ' danger-effect' : '';
  let label = appState.isKraeplinTrial
    ? `<div style="text-align:center;color:#b50;font-weight:600;margin-bottom:6px;">TAHAP PERCOBAAN / TRIAL</div>`
    : `<div style="text-align:center;color:#165;font-weight:600;margin-bottom:6px;">TES KRAEPLIN SESUNGGUHNYA</div>`;

  /* === Progress columns === */
  const totalCols = colCount;
  const doneCols  = (appState.kraeplinStarted && !isSelesai) ? activeCol : (isSelesai ? totalCols : 0);
  const inProg    = (appState.kraeplinStarted && !isSelesai) ? 1 : 0;
  const stepCols  = Math.min(doneCols + inProg, totalCols);
  const pctCols   = totalCols ? Math.round((stepCols / totalCols) * 100) : 0;
  const dotHTML   = Array.from({length: totalCols}, (_, i) => {
    const cls = (i < doneCols) ? 'kp-dot done' : (i === doneCols && inProg ? 'kp-dot cur' : 'kp-dot');
    return `<span class="${cls}" aria-hidden="true"></span>`;
  }).join('');

  let html = `
    <div class="card kraeplin-card${dangerEffect}" aria-hidden="${(!appState.kraeplinStarted && !isSelesai) ? 'true' : 'false'}">
      <div class="header">
        <span class="test-icon">🧮</span>
        <h2>${tests.KRAEPLIN.name}</h2>
        <p>${tests.KRAEPLIN.description}</p>
        <p style="color:#3498db">Waktu per kolom: <span id="timer-desc">${appState.timeLeft || 15}s</span></p>
        ${label}
      </div>

      <!-- Progress kolom -->
      <div class="kp-progress" aria-live="polite">
        <div class="kp-progress-head">
          <span>Kolom: <b id="kp-col">${Math.max(stepCols, isSelesai ? totalCols : stepCols)}/${totalCols}</b></span>
          <span id="kp-pct">${pctCols}%</span>
        </div>
        <div class="kp-bar"><div class="kp-fill" style="width:${pctCols}%"></div></div>
        <div class="kp-dots">${dotHTML}</div>
      </div>

      <div class="kraeplin-board-flex">
  `;

  // Render kolom treadmill
  for (let c = windowStart; c < windowEnd; c++) {
    html += `<div class="kraeplin-col-vertical${c === activeCol ? ' kraeplin-active' : ''}" data-col="${c}" style="position:relative;">`;
    html += `<div style="display:flex;flex-direction:row;align-items:flex-end;justify-content:center;">`;

    // Baris angka
    html += `<div style="display:flex;flex-direction:column;align-items:center;">`;
    let indexes = treadmillIndexes(c);
    for (let i = 0; i < indexes.length; i++) {
      let idx = indexes[i];
      html += `<div class="kraeplin-row"><div class="kraeplin-num">${columns[c][idx]}</div></div>`;
    }
    html += `</div>`;

    // Kotak input satu saja di kolom aktif & sudah mulai
    if (!isSelesai && c === activeCol && appState.kraeplinStarted && columns[c].length >= 2) {
      const idxBawah = columns[c].length - 1;
      const idxAtas  = columns[c].length - 2;
      const angkaAtas = columns[c][idxAtas];
      const angkaBawah = columns[c][idxBawah];
      html += `<div style="display:flex;flex-direction:column;align-items:center;height:100%;margin-left:17px;">
        <div style="font-size:0.95em;color:#666;margin-bottom:7px;">(${angkaAtas} + ${angkaBawah})</div>
        <input
          type="number"
          class="kraeplin-input-bottom"
          data-col="${c}"
          min="0" max="9" maxlength="1"
          autocomplete="one-time-code"
          inputmode="numeric"
          pattern="[0-9]*"
          value="${(appState.answers.KRAEPLIN?.[c] || [])[columns[c].length - 2] ?? ''}"
          ${!appState.kraeplinStarted ? 'disabled' : ''}
          oninput="isiJawabanKraeplinBottom(this)"
          style="width:38px;text-align:center;font-size:1em;"
        />
      </div>`;
    } else {
      html += `<div style="display:flex;flex-direction:column;align-items:center;height:100%;margin-left:17px;">
        <div style="font-size:0.95em;color:#999;margin-bottom:7px;">(x + y)</div>
        <input type="number" class="kraeplin-input-bottom" disabled placeholder="-" />
      </div>`;
    }

    html += `</div></div>`;
  }
  html += `</div>`;

  // ========== LIVE STATS ==========
  html += `
    <div id="kraeplinLiveStats" style="margin:17px 0 8px 0; color:#145; font-size:1.07em; text-align:center;">
      <b>Jawaban benar:</b> 0 &nbsp; | &nbsp; <b>Salah:</b> 0 &nbsp; | &nbsp; <b>Jumlah isi:</b> 0 &nbsp; | &nbsp; <b>Ketelitian:</b> 0.0%
      ${appState.isKraeplinTrial ? `<div style="color:#aa8600;font-size:.97em;margin-top:4px;">(Percobaan/Trial)</div>` : ''}
    </div>
  `;

  // Timer
  html += `
    <div class="timer-float-top" id="kraeplin-timer-top"
      style="
        position: absolute;
        top: 24px;
        right: 28px;
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 4px 18px rgba(52,152,219,0.10);
        padding: 10px 22px 10px 22px;
        font-size: 1.18em;
        font-weight: bold;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 7px;
        z-index: 100;
      ">
      <span style="font-size:1.4em; margin-right: 6px;">🕰️</span>
      <span id="kraeplin-timer-top-num">${appState.timeLeft || 15}s</span>
    </div>
  `;

  html += `</div></div>`; // tutup card
  app.innerHTML = html;

  /* ===== Overlay logic: tampil saat belum mulai / transisi ===== */
  const harusTampilStartTrial             = (appState.isKraeplinTrial && !appState.kraeplinStarted && !isSelesai);
  const harusTampilStartRealSetelahTrial  = (appState.isKraeplinTrial && isSelesai);
  const harusTampilStartReal              = (!appState.isKraeplinTrial && !appState.kraeplinStarted && !isSelesai);

  if (harusTampilStartTrial) {
    setKraeplinBlur(true);
    createOverlay(`
      <h3>Mulai Percobaan (Trial) Kraeplin</h3>
      <p>Latihan singkat agar Anda paham alurnya.</p>
      <div class="overlay-actions">
        <button class="btn-pill btn-start-trial" id="btnStartTrial" onclick="startKraeplinBoard()">Mulai Percobaan</button>
      </div>
    `);
    attachEnterHotkeyOnce('btnStartTrial', startKraeplinBoard);
  } else if (harusTampilStartRealSetelahTrial) {
    setKraeplinBlur(true);
    createOverlay(`
      <h3>Percobaan Selesai</h3>
      <p>Siap ke tes sungguhan? Waktu per kolom tetap sama. Fokus ya!</p>
      <div class="overlay-actions">
        <button class="btn-pill btn-start-real2" id="btnStartReal" onclick="startKraeplinReal()">Mulai Tes Sungguhan</button>
      </div>
    `);
    attachEnterHotkeyOnce('btnStartReal', startKraeplinReal);
  } else if (harusTampilStartReal) {
    setKraeplinBlur(true);
    createOverlay(`
      <h3>Mulai Tes Kraeplin</h3>
      <p>Tes utama akan dimulai. Pastikan siap.</p>
      <div class="overlay-actions">
        <button class="btn-pill btn-start-real" id="btnStartRealMain" onclick="startKraeplinBoard()">Mulai Tes Kraeplin</button>
      </div>
    `);
    attachEnterHotkeyOnce('btnStartRealMain', startKraeplinBoard);
  } else {
    setKraeplinBlur(false);
    removeOverlay();
  }

  // Fokus input kolom aktif saat berjalan
  setTimeout(() => {
    if (appState.kraeplinStarted) {
      let input = document.querySelector('.kraeplin-col-vertical.kraeplin-active input:not([disabled])');
      if (input) {
        input.blur(); input.focus();
        input.scrollIntoView({behavior:'smooth', block:'center'});
      }
    }
  }, 120);

  // Reset efek danger
  if (appState.kraeplinStarted && timeOutEffect) {
    playBeep(); // SUARA LANGSUNG SAAT DANGER
    setTimeout(() => {
      let tmrTop = document.getElementById('kraeplin-timer-top');
      let tmrNum = document.getElementById('kraeplin-timer-top-num');
      if (tmrTop) tmrTop.classList.add('danger-timer');
      if (tmrNum) tmrNum.classList.add('danger-timer');
      setTimeout(() => {
        if (tmrTop) tmrTop.classList.remove('danger-timer');
        if (tmrNum) tmrNum.classList.remove('danger-timer');
      }, 700);
    }, 80);
  }

  // GUNAKAN FUNGSI YANG BENAR
  updateKraeplinTimerDisplay(appState.timeLeft); // hanya update display
  updateKraeplinLiveStats(); // <== BIAR LIVE!
}

/* ========== START & TIMER ========== */
function startKraeplinBoard() {
  prepareAudioContext(); // suara
  appState.kraeplinStarted = true;
  appState.currentColumn = 0;
  appState.timeLeft = 15;
  appState.timerActive = true;
  appState.currentRow = {};

  // tutup overlay + unblur + lepas hotkey
  removeOverlay();
  setKraeplinBlur(false);
  if (_enterHotkeyCleanup) _enterHotkeyCleanup();

  renderKraeplinBoard();
  startKraeplinBoardTimer(); // timer mulai
}

function startKraeplinBoardTimer() {
  clearInterval(appState.timer);
  appState.timerActive = true;
  updateKraeplinTimerDisplay(appState.timeLeft);
  appState.timer = setInterval(() => {
    appState.timeLeft--;
    updateKraeplinTimerDisplay(appState.timeLeft);
    if (appState.timeLeft <= 0) {
      clearInterval(appState.timer);
      appState.timerActive = false;
      timeOutEffect = true;
      renderKraeplinBoard();
      setTimeout(() => {
        timeOutEffect = false;
        nextKraeplinCol();
      }, 300);
    }
  }, 1000);
}

/* ========== INPUT JAWABAN ========== */
function isiJawabanKraeplinBottom(el) {
  const col = +el.dataset.col;
  if (!appState.kraeplinStarted || appState.completed.KRAEPLIN) return;

  el.value = el.value.slice(-1);

  const columns = tests.KRAEPLIN.columns;
  const currentRowIndex = columns[col].length - 2;
  if (!appState.answers.KRAEPLIN[col]) {
    const initialLength = columns[col].length - 1;
    appState.answers.KRAEPLIN[col] = Array(initialLength).fill(null);
  }
  appState.answers.KRAEPLIN[col][currentRowIndex] = parseInt(el.value) || 0;

  updateKraeplinLiveStats();

  if (el.value.length === 1) {
    if (tests.KRAEPLIN.columns[col].length > 0) {
      tests.KRAEPLIN.columns[col].pop();
    }
    renderKraeplinBoard();
  }
}

/* ========== LIVE STATS ========== */
function updateKraeplinLiveStats() {
  let benar = 0, salah = 0, total = 0;
  const jawaban = appState.answers.KRAEPLIN || [];
  const kunci = appState.kraeplinKey || [];

  for (let col = 0; col < jawaban.length; col++) {
    if (!Array.isArray(jawaban[col])) continue;
    for (let row = 0; row < jawaban[col].length; row++) {
      if (typeof jawaban[col][row] !== 'number') continue;
      total++;
      if (jawaban[col][row] === kunci[col][row]) benar++;
      else salah++;
    }
  }
  const ketelitian = total ? (benar / total * 100).toFixed(1) : "0.0";
  const el = document.getElementById('kraeplinLiveStats');
  if (el) {
    el.innerHTML = `
      <b>Jawaban benar:</b> ${benar}
      &nbsp; | &nbsp; 
      <b>Salah:</b> ${salah}
      &nbsp; | &nbsp;
      <b>Jumlah isi:</b> ${total}
      &nbsp; | &nbsp;
      <b>Ketelitian:</b> ${ketelitian}%
      ${appState.isKraeplinTrial ? `<div style="color:#aa8600;font-size:.97em;margin-top:4px;">(Percobaan/Trial)</div>` : ''}
    `;
  }
}

/* ========== TIMER DISPLAY (UI kecil) ========== */
function updateKraeplinTimerDisplay(val) {
  const timerEl = document.getElementById('kraeplin-timer');
  const descEl = document.getElementById('timer-desc');
  const topEl = document.getElementById('kraeplin-timer-top-num');

  let display = (val !== undefined ? val : appState.timeLeft || 15) + 's';
  if (timerEl) timerEl.textContent = display;
  if (descEl) descEl.textContent = display;
  if (topEl) topEl.textContent = display;

  const isCritical = (appState.timeLeft || 15) <= 3;
  if (timerEl) {
    if (isCritical) timerEl.classList.add('danger-timer');
    else timerEl.classList.remove('danger-timer');
  }
  if (topEl) {
    if (isCritical) topEl.classList.add('danger-timer');
    else topEl.classList.remove('danger-timer');
  }
}

/* ========== PINDAH KOLOM ========== */
function nextKraeplinCol() {
  let nextCol = (appState.currentColumn ?? 0) + 1;
  if (nextCol < tests.KRAEPLIN.columns.length) {
    appState.currentColumn = nextCol;
    appState.timeLeft = 15;
    appState.timerActive = false;
    renderKraeplinBoard();
    startKraeplinBoardTimer();
  } else {
    finishKraeplinBoard();
  }
}

/* ========== FINISH ========== */
function finishKraeplinBoard() {
  clearInterval(appState.timer);
  appState.timerActive = false;
  appState.kraeplinStarted = false;
  
  console.log("======= DEBUG KRAEPLIN =======");
  console.log("Jawaban User:", JSON.parse(JSON.stringify(appState.answers.KRAEPLIN)));
  console.log("Kunci Jawaban:", JSON.parse(JSON.stringify(appState.kraeplinKey)));
  
  try {
    const analisa = analyzeKraeplin();
    console.log("Analisa Hasil:", analisa);
  } catch (e) {
    console.error("Error analisa:", e);
  }
  
  if (appState.isKraeplinTrial) {
    appState.completed.KRAEPLIN = true;
    renderKraeplinBoard();
  } else {
    appState.completed.KRAEPLIN = true;
    showThankYouAndHomeKRAEPLIN();
  }
}

/* ========== GENERATE COLUMN & KEY ========== */
function generateKraeplinColumns(jumlahKolom, jumlahBaris) {
  return Array.from({length: jumlahKolom}, () =>
    Array.from({length: jumlahBaris}, () => Math.floor(Math.random() * 9) + 1)
  );
}
function generateKraeplinKey() {
  const key = [];
  const columns = tests.KRAEPLIN.columns;
  for (let col = 0; col < columns.length; col++) {
    key[col] = [];
    for (let row = 0; row < columns[col].length - 1; row++) {
      const sum = columns[col][row] + columns[col][row + 1];
      key[col][row] = sum % 10;
    }
  }
  appState.kraeplinKey = key;
}

/* ========== START TRIAL / REAL (memicu overlay) ========== */
function startKraeplinTrial() {
  appState.isKraeplinTrial = true;
  appState.kraeplinStarted = false;
  appState.completed.KRAEPLIN = false;
  appState.currentColumn = 0;
  appState.timeLeft = 15;
  appState.answers.KRAEPLIN = [];
  appState.currentRow = {};
  appState.kraeplinHistory = {};
  tests.KRAEPLIN.columns = generateKraeplinColumns(4, 28); // 4 kolom trial, 28 baris
  generateKraeplinKey();
  renderKraeplinBoard(); // overlay "Mulai Percobaan" muncul
}

function startKraeplinReal() {
  appState.isKraeplinTrial = false;
  appState.kraeplinStarted = false;
  appState.completed.KRAEPLIN = false;  
  appState.currentColumn = 0;
  appState.timeLeft = 15;
  appState.answers.KRAEPLIN = [];
  appState.currentRow = {};
  appState.kraeplinHistory = {};
  tests.KRAEPLIN.columns = generateKraeplinColumns(50, 28); // 50 kolom real, 28 baris
  generateKraeplinKey();
  renderKraeplinBoard(); // overlay "Mulai Tes" muncul
}



// ==================== DISC Test ====================
function namaPanggilan() {
  return (appState?.identity?.nickname && String(appState.identity.nickname).trim())
    ? String(appState.identity.nickname).trim()
    : "Peserta";
}

function renderDISCIntro() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="disc-intro-container" style="
      max-width: 860px;
      margin: 28px auto 0 auto;
      background: #fafdff;
      border-radius: 18px;
      box-shadow: 0 6px 32px rgba(60,70,120,0.07);
      padding: 32px 32px 36px 32px;
      ">
      <h2 style="text-align:center;margin-bottom:6px;font-size:2.1em;letter-spacing:0.01em">${tests.DISC.name}</h2>
      <div style="text-align:center;margin-bottom:24px;color:#234;">${tests.DISC.description}</div>
      
      <div style="
        background:#f1f5fb;
        padding: 14px 26px 20px 26px;
        border-radius: 13px;
        margin: 0 0 30px 0;
        border:1.2px solid #e0e7ef;
      ">
        <div style="font-weight:600;font-size:1.15em;margin-bottom:8px;color:#1e2331;">Petunjuk</div>
        <ul style="margin-bottom:0;padding-left:22px;line-height:1.8;">
          <li>Pilih <b>1 pernyataan PALING (P)</b> yang paling sesuai dengan diri Anda</li>
          <li>Pilih <b>1 pernyataan KURANG (K)</b> yang paling tidak sesuai dengan diri Anda</li>
          <li><span style="color:#d00;font-weight:500;">P dan K tidak boleh pada pilihan yang sama</span></li>
        </ul>
      </div>

      <div class="example-visual" style="margin-bottom:28px;text-align:center;">
        <div style="font-weight:600;font-size:1.12em;margin-bottom:10px;">Contoh Visual:</div>
        <img src="https://raw.githubusercontent.com/Pragas123/assets/refs/heads/main/disc.png"
             alt="Contoh Jawaban DISC"
             style="max-width:420px;width:100%;border-radius:12px;box-shadow:0 4px 16px rgba(30,40,60,0.11);margin:auto;">
        <div style="margin-top:10px;color:#798ba8;font-size:.99em">
          Pilih <b>P</b> Jika kepribadian yang paling mendekati adalah opsi (menjadi frustasi) dan pilih <b>K</b> jika kepribadian yang paling tidak mendekati adalah opsi (menjadi frustasi).<br>
          Lihat contoh tampilan pada gambar di atas.
        </div>
      </div>

      <div style="text-align:center;margin-top:38px;">
        <button class="btn" style="min-width:170px;font-size:1.11em;" onclick="mulaiDISC()">Mulai Soal</button>
        <button class="btn btn-outline" style="min-width:130px;" onclick="renderHome()">Kembali</button>
      </div>
    </div>
  `;
}

// Mulai ulang DISC
function mulaiDISC() {
  appState.currentQuestion = 0;
  appState.tempDISC = {};
  appState.answers.DISC = [];         // WAJIB reset jawaban
  appState.completed.DISC = false;
  appState.discError = "";

  // Jika pernah pakai localStorage, hapus juga:
  // localStorage.removeItem('DISC_ANSWERS');

  renderDISCQuestion();
}

function renderDISCQuestion() {
  const soal = tests.DISC.questions;
  const idx = appState.currentQuestion;

  // Validasi index dan data soal
  if (!Array.isArray(soal) || soal.length === 0) {
    document.getElementById('app').innerHTML = 'Soal DISC belum dimuat!';
    return;
  }
  if (idx >= soal.length) {
    showDISCResult();
    return;
  }

  const question = soal[idx];
  if (!appState.tempDISC) appState.tempDISC = {};
  const progress = calculateProgress();

  const optionsHTML = question.options.map((option, index) => {
    const isP = appState.tempDISC.p === index;
    const isK = appState.tempDISC.k === index;
    let boxClass = '';
    if (isP) boxClass = ' box-p';
    else if (isK) boxClass = ' box-k';
    return `
      <div class="disc-option${boxClass}" data-index="${index}">
        <label class="p-label${isP ? ' selected-p' : ''}" onclick="selectDISCAnswer('p', ${index})">P</label>
        <label class="k-label${isK ? ' selected-k' : ''}" onclick="selectDISCAnswer('k', ${index})">K</label>
        <span class="option-text${isP ? ' option-p' : ''}${isK ? ' option-k' : ''}">${option.text}</span>
      </div>
    `;
  }).join('');

  // Error tampil di bawah opsi
  const errorHTML = appState.discError ? `
    <div class="disc-error" style="color: #c00; margin-top: 18px; text-align:center;">
      ${appState.discError}
    </div>
  ` : '';

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="progress-container">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <div class="question-container">
        <p class="question-text">${question.text}</p>
        <div class="disc-grid">
          ${optionsHTML}
        </div>
        ${errorHTML}
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <button class="btn" onclick="nextDISCQuestion()">
          ${appState.currentQuestion < tests.DISC.questions.length - 1 ? 'Lanjut' : 'Selesai'}
        </button>
        <button class="btn btn-outline" onclick="confirmCancelTest()">
          Batalkan Tes
        </button>
      </div>
    </div>
  `;
}

function selectDISCAnswer(type, index) {
  if (!appState.tempDISC) appState.tempDISC = {};
  if (type === 'p') {
    if (appState.tempDISC.k === index) appState.tempDISC.k = undefined;
    appState.tempDISC.p = index;
  } else if (type === 'k') {
    if (appState.tempDISC.p === index) appState.tempDISC.p = undefined;
    appState.tempDISC.k = index;
  }
  renderDISCQuestion();
}

function nextDISCQuestion() {
  const temp = appState.tempDISC || {};
  appState.discError = "";

  if (typeof temp.p !== 'number' || typeof temp.k !== 'number') {
    appState.discError = 'Harap pilih satu opsi untuk P (Paling) dan satu opsi untuk K (Kurang)!';
    renderDISCQuestion();
    return;
  }
  if (temp.p === temp.k) {
    appState.discError = 'P dan K tidak boleh di opsi yang sama!';
    renderDISCQuestion();
    return;
  }

  const question = tests.DISC.questions[appState.currentQuestion];
  appState.answers.DISC.push({
    id: question.id,
    p: temp.p,
    k: temp.k,
    pText: question.options[temp.p].text,
    kText: question.options[temp.k].text
  });
  appState.currentQuestion++;
  appState.tempDISC = {};
  appState.discError = "";

  // Selesai: tampilkan ucapan terima kasih, lalu auto ke Home (hasil tidak muncul!)
  if (appState.currentQuestion >= tests.DISC.questions.length) {
    appState.completed.DISC = true;
    showThankYouAndHomeDISC(); // <-- fungsi ucapan & redirect home
  } else {
    renderDISCQuestion();
  }
}
/* ==================== Thank You Screen After DISC (1 tombol) ==================== */
function showThankYouAndHomeDISC() {
  // 1) Tandai DISC selesai
  if (typeof window.markTestCompleted === 'function') {
    markTestCompleted('DISC');
  } else {
    window.appState = window.appState || {};
    appState.completed = appState.completed || {};
    appState.completed.DISC = true;
    try {
      const saved = JSON.parse(localStorage.getItem('completed') || '{}');
      saved.DISC = true;
      localStorage.setItem('completed', JSON.stringify(saved));
    } catch {}
    if (typeof window.updateDownloadButtonState === 'function') {
      window.updateDownloadButtonState();
    }
  }

  // 2) UI ucapan terima kasih (gaya selaras IST/Kraeplin)
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card" style="
      max-width:820px;margin:34px auto;padding:32px 28px;border-radius:22px;
      background:linear-gradient(135deg,#f5fff8 86%,#e8fff1 100%);
      box-shadow:0 10px 34px #c7f4da55;border:1.6px solid #c8f1d6;text-align:center;">
      <div style="font-size:3rem;line-height:1;margin-bottom:10px;">🎉</div>
      <h2 style="margin:6px 0 8px 0;font-weight:900;color:#13693a;">
        Terima kasih! Tes DISC sudah selesai
      </h2>
      <p style="font-size:1.08rem;color:#244;max-width:680px;margin:0 auto 16px auto;line-height:1.6;">
        Jawaban Anda untuk Tes <b>DISC</b> telah tersimpan. Silakan lanjut mengerjakan tes lain yang Anda pilih.
        Tombol <b>Download PDF</b> akan aktif kembali setelah <b>semua</b> tes pilihan selesai dikerjakan.
      </p>

      <div style="display:flex;gap:12px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
        <button id="btnContinueDISC" class="btn" style="
          padding:12px 24px;font-weight:800;border-radius:11px;
          background:#18a35d;color:#fff;border:0;box-shadow:0 4px 18px #bff1d7;">
          ✅ Lanjut Tes Berikutnya
        </button>
      </div>
    </div>
  `;

  // 3) Aksi tombol: matikan guard tes lalu kembali ke Home
  const goNext = () => {
    window.__inTestView = false; // penting agar renderHome tidak diblokir guard
    if (typeof window.renderHome === 'function') window.renderHome();
    setTimeout(() => {
      const el = document.getElementById('homeCard') || document.getElementById('downloadPDFBox');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  document.getElementById('btnContinueDISC').onclick = goNext;

  // Tidak ada auto-redirect. User menekan tombol untuk lanjut.
}


// ========== FUNGSI HITUNG DISC DENGAN CEGAH DATA SISA ==========
function countDISC(answers, questions) {
  const countP = { D: 0, I: 0, S: 0, C: 0, '*': 0 };
  const countK = { D: 0, I: 0, S: 0, C: 0, '*': 0 };
  // Loop hanya sesuai jumlah soal!
  for (let i = 0; i < questions.length; i++) {
    const ans = answers[i];
    const q = questions[i];
    if (!ans || !q) continue;
    const pKey = q.options[ans.p]?.P;
    const kKey = q.options[ans.k]?.K;
    if (countP.hasOwnProperty(pKey)) countP[pKey]++;
    if (countK.hasOwnProperty(kKey)) countK[kKey]++;
  }
  const change = {};
  ['D', 'I', 'S', 'C', '*'].forEach(k => {
    change[k] = (countP[k] || 0) - (countK[k] || 0);
  });
  return { most: countP, least: countK, change };
}


// ====================== CLASSIC GRAPH PIXEL ======================
const classicGraph = [
  { type: 'most', blockData: [
      { label: 4, pixel: [20, 100], values: {
        D: [{val:20, pixel:36},{val:16, pixel:44},{val:15, pixel:52},{val:14, pixel:78},{val:13, pixel:86}],
        I: [{val:17, pixel:36},{val:10, pixel:44},{val:8, pixel:63},{val:7, pixel:78}],
        S: [{val:19, pixel:36},{val:13, pixel:52},{val:11, pixel:68},{val:10, pixel:84}],
        C: [{val:14, pixel:36},{val:10, pixel:52},{val:9, pixel:62},{val:8, pixel:70},{val:7, pixel:78}]
      }},
      { label: 3, pixel: [100, 200], values: {
        D: [{val:12, pixel:110},{val:11, pixel:118},{val:10, pixel:126},{val:9, pixel:156},{val:8, pixel:172},{val:7, pixel:180}],
        I: [{val:6, pixel:118},{val:5, pixel:126},{val:4, pixel:172}],
        S: [{val:9, pixel:110},{val:8, pixel:126},{val:7, pixel:134},{val:6, pixel:172},{val:5, pixel:180}],
        C: [{val:6, pixel:126},{val:5, pixel:156},{val:4, pixel:180}]
      }},
      { label: 2, pixel: [200, 300], values: {
        D: [{val:6, pixel:208},{val:5, pixel:230},{val:4, pixel:238},{val:3, pixel:260}],
        I: [{val:3, pixel:230},{val:2, pixel:260}],
        S: [{val:4, pixel:215},{val:3, pixel:235},{val:2, pixel:290}],
        C: [{val:3, pixel:215},{val:2, pixel:260}]
      }},
      { label: 1, pixel: [300, 400], values: {
        D: [{val:2, pixel:308},{val:1, pixel:340},{val:0, pixel:360}],
        I: [{val:1, pixel:325},{val:0, pixel:351}],
        S: [{val:1, pixel:315},{val:0, pixel:323}],
        C: [{val:1, pixel:325},{val:0, pixel:351}]
      }}
  ]},
  { type: 'least', blockData: [
      { label: 4, pixel: [20, 100], values: {
        D: [{val:0, pixel:36},{val:1, pixel:70},{val:2, pixel:96}],
        I: [{val:0, pixel:44},{val:1, pixel:64}],
        S: [{val:0, pixel:36},{val:1, pixel:52},{val:2, pixel:64}],
        C: [{val:0, pixel:36},{val:1, pixel:52},{val:2, pixel:70}]
      }},
      { label: 3, pixel: [100, 200], values: {
        D: [{val:3, pixel:134},{val:4, pixel:172},{val:5, pixel:199}],
        I: [{val:2, pixel:110},{val:3, pixel:134},{val:4, pixel:172}],
        S: [{val:3, pixel:110},{val:4, pixel:134},{val:5, pixel:164},{val:6, pixel:180}],
        C: [{val:3, pixel:110},{val:4, pixel:134},{val:5, pixel:164},{val:6, pixel:199}]
      }},
      { label: 2, pixel: [200, 300], values: {
        D: [{val:6, pixel:210},{val:7, pixel:230},{val:8, pixel:238},{val:9, pixel:270},{val:10, pixel:278},{val:11, pixel:286}],
        I: [{val:5, pixel:210},{val:6, pixel:255},{val:7, pixel:286}],
        S: [{val:7, pixel:218},{val:8, pixel:238},{val:9, pixel:278}],
        C: [{val:7, pixel:210},{val:9, pixel:270},{val:10, pixel:286}]
      }},
      { label: 1, pixel: [300, 400], values: {
        D: [{val:12, pixel:315},{val:13, pixel:340},{val:14, pixel:348},{val:15, pixel:358},{val:16, pixel:368},{val:18, pixel:378},{val:21, pixel:388}],
        I: [{val:8, pixel:315},{val:9, pixel:340},{val:10, pixel:358},{val:15, pixel:373},{val:19, pixel:388}],
        S: [{val:10, pixel:315},{val:11, pixel:327},{val:12, pixel:340},{val:13, pixel:358},{val:18, pixel:373},{val:19, pixel:388}],
        C: [{val:11, pixel:315},{val:12, pixel:348},{val:13, pixel:378},{val:15, pixel:388}]
      }}
  ]},
  { type: 'change', blockData: [
      { label: 4, pixel: [20, 100], values: {
        D: [{val:20, pixel:36},{val:16, pixel:44},{val:15, pixel:52},{val:14, pixel:60},{val:13, pixel:68},{val:12, pixel:76},{val:10, pixel:84}],
        I: [{val:17, pixel:36},{val:15, pixel:44},{val:8, pixel:60},{val:7, pixel:68},{val:6, pixel:76},{val:5, pixel:84},{val:4, pixel:92}],
        S: [{val:19, pixel:36},{val:15, pixel:44},{val:10, pixel:60},{val:9, pixel:68},{val:8, pixel:76},{val:7, pixel:84}],
        C: [{val:14, pixel:36},{val:7, pixel:52},{val:6, pixel:60},{val:4, pixel:68},{val:3, pixel:84},{val:2, pixel:92}]
      }},
      { label: 3, pixel: [100, 200], values: {
        D: [{val:9, pixel:110},{val:8, pixel:118},{val:7, pixel:126},{val:5, pixel:164},{val:3, pixel:172},{val:1, pixel:199}],
        I: [{val:3, pixel:126},{val:2, pixel:144},{val:1, pixel:164},{val:0, pixel:190}],
        S: [{val:5, pixel:110},{val:4, pixel:118},{val:3, pixel:126},{val:2, pixel:144},{val:1, pixel:164},{val:0, pixel:172}],
        C: [{val:1, pixel:118},{val:0, pixel:144},{val:-1, pixel:172},{val:-2, pixel:190}]
      }},
      { label: 2, pixel: [200, 300], values: {
        D: [{val:0, pixel:210},{val:-2, pixel:218},{val:-3, pixel:226},{val:-4, pixel:234},{val:-6, pixel:270},{val:-7, pixel:278},{val:-9, pixel:286}],
        I: [{val:-1, pixel:210},{val:-2, pixel:234},{val:-3, pixel:252},{val:-4, pixel:278},{val:-5, pixel:286}],
        S: [{val:-1, pixel:210},{val:-2, pixel:218},{val:-3, pixel:226},{val:-4, pixel:234},{val:-5, pixel:252},{val:-6, pixel:278},{val:-7, pixel:286}],
        C: [{val:-3, pixel:210},{val:-4, pixel:218},{val:-5, pixel:270},{val:-6, pixel:278},{val:-7, pixel:286}]
      }},
      { label: 1, pixel: [300, 400], values: {
        D: [{val:-10, pixel:316},{val:-11, pixel:340},{val:-12, pixel:348},{val:-15, pixel:356},{val:-20, pixel:380},{val:-21, pixel:388}],
        I: [{val:-6, pixel:316},{val:-7, pixel:324},{val:-8, pixel:348},{val:-9, pixel:356},{val:-10, pixel:370},{val:-19, pixel:388}],
        S: [{val:-8, pixel:316},{val:-10, pixel:340},{val:-12, pixel:370},{val:-19, pixel:388}],
        C: [{val:-8, pixel:316},{val:-9, pixel:324},{val:-10, pixel:348},{val:-13, pixel:356},{val:-15, pixel:388}]
      }}
  ]}
];

// ====================== GET PIXEL Y ======================
function getPixelY(type, axis, val) {
  const g = classicGraph.find(e => e.type === type);
  if (!g) return 400;
  // Cari block dengan rentang val yang pas
  let chosenArr = null;
  for (let blk of g.blockData) {
    const arr = blk.values[axis] || [];
    if (!arr.length) continue;
    if (val >= arr[arr.length-1].val && val <= arr[0].val) {
      chosenArr = arr; break;
    }
    // Tangani kasus urutan kecil-ke-besar
    if (val >= arr[0].val && val <= arr[arr.length-1].val) {
      chosenArr = arr; break;
    }
    // fallback: jika val < min, ambil ini, biar tidak lompat blok
    if (val < arr[arr.length-1].val) chosenArr = arr;
    // fallback: jika val > max, ambil blok pertama
    if (val > arr[0].val && !chosenArr) chosenArr = arr;
  }
  const arr = chosenArr || (g.blockData[0].values[axis] || []);
  // Cari exact, atau interpolasi linear antar titik
  for (let i = 0; i < arr.length; i++) {
    if (val === arr[i].val) return arr[i].pixel;
    if (val > arr[i].val && i > 0) {
      let prev = arr[i-1], next = arr[i];
      let prop = (val - prev.val) / (next.val - prev.val);
      return prev.pixel + prop * (next.pixel - prev.pixel);
    }
  }
  // lebih kecil/lebih besar dari semua (fallback): ambil paling dekat
  if (arr.length && val < arr[arr.length-1].val) return arr[arr.length-1].pixel;
  if (arr.length && val > arr[0].val) return arr[0].pixel;
  return 400;
}

// ====================== DOMINAN BERDASARKAN GARIS TENGAH (DINAMIS) ======================
function getMidline(tipe) {
  const g = classicGraph.find(e => e.type === tipe);
  if (!g || !Array.isArray(g.blockData) || g.blockData.length === 0) return 200; // fallback aman
  // Ambil seluruh batas pixel blok (mis. [20,100], [100,200], ...)
  const ys = g.blockData.flatMap(b => Array.isArray(b.pixel) ? b.pixel : []);
  const ymin = Math.min(...ys);
  const ymax = Math.max(...ys);
  return (ymin + ymax) / 2; // garis tengah aktual untuk tipe grafis ini
}

/**
 * Mengembalikan array huruf ['D','I','S','C'] yang berada di atas/tepat midline (y <= mid).
 * Urutan dari paling atas (y terkecil) ke bawah. Maksimal 3 huruf.
 */
function getDominantByMidline(tipe, D, I, S, C) {
  const mid = getMidline(tipe);
  const pts = [
    { key: 'D', y: getPixelY(tipe, 'D', D), val: D },
    { key: 'I', y: getPixelY(tipe, 'I', I), val: I },
    { key: 'S', y: getPixelY(tipe, 'S', S), val: S },
    { key: 'C', y: getPixelY(tipe, 'C', C), val: C },
  ].filter(p => Number.isFinite(p.y))
   .sort((a,b) => a.y - b.y); // y kecil = titik lebih atas

  let dominan = pts.filter(p => p.y <= mid).map(p => p.key);

  // Jika tak ada yang melewati midline, ambil minimal top-2 agar tetap informatif
  if (dominan.length === 0) dominan = pts.slice(0,2).map(p => p.key);

  if (dominan.length > 3) dominan = dominan.slice(0,3);
  return dominan;
}


// ================= FUNGSI ANALISA 2/3 DOMINAN BERDASARKAN VISUAL GRAFIK =================
function analisa2DominanDISC(D, I, S, C, tipe, getPixelY) {
  // Urutkan faktor dari paling atas (y kecil) ke bawah (y besar) untuk ranking visual
  const arr = [
    { key: "D", val: D, y: getPixelY(tipe, "D", D) },
    { key: "I", val: I, y: getPixelY(tipe, "I", I) },
    { key: "S", val: S, y: getPixelY(tipe, "S", S) },
    { key: "C", val: C, y: getPixelY(tipe, "C", C) }
  ].filter(o => Number.isFinite(o.y))
   .sort((a, b) => a.y - b.y);

  // Dominan = yang berada di atas/tepat midline (dinamis)
  let dominan = getDominantByMidline(tipe, D, I, S, C);
  if (!dominan || dominan.length === 0) dominan = arr.slice(0,2).map(x=>x.key);
  if (dominan.length > 3) dominan = dominan.slice(0,3);

  const ranking = arr.map(x => x.key);
  const nama = namaPanggilan();

  // ====== DESKRIPSI SINGLE (fallback 1 huruf) – typo diperbaiki ======
  const desk = {
  D: `${nama} memiliki rasa ego yang tinggi dan cenderung invidualis dengan standard yang sangat tinggi. ${nama} lebih suka menganalisa masalah sendirian daripada bersama orang lain. Rasa egoisnya yang kuat membuat ${nama} tidak nyaman di bawah kendali orang lain; ${nama} lebih suka menjadi "boss" dan menetapkan standard tinggi baik untuk dirinya maupun orang lain. ${nama} menghindari sesuatu yang biasa-biasa dan cenderung mencari tantangan yang baru. ${nama} menyukai petualangan dan kadang-kadang beralih ke dalam petualangan baru sebelum mempertimbangkannya secara menyeluruh. |Pure D| ${nama} mampu memimpin situasi dan orang lain dalam rangka mencapai sasarannya; ${nama} ingin selalu unggul dalam persaingan dengan taruhan apapun.`,

 I: `Profile: Pure I ${nama} merupakan pribadi yang antusias dan optimistik, lebih suka mencapai sasaran melalui orang lain. ${nama} suka berhubungan dengan sesama—bahkan senang mengadakan kegiatan untuk berkumpul—yang menegaskan kepribadiannya yang ramah. ${nama} tidak suka bekerja sendirian dan cenderung bekerja bersama orang lain dalam menyelesaikan proyek. Perhatian dan fokus ${nama} sering tidak setajam yang diharapkan; karena itu ${nama} membutuhkan energi besar untuk bergerak cepat dari satu hal ke hal berikutnya tanpa penundaan. ${nama} sangat menonjol dalam keterampilan berkomunikasi; ini adalah salah satu kekuatan yang paling sering digunakan untuk memotivasi dan memberi semangat, sehingga ${nama} dikenal sebagai pribadi yang inspirasional. Saat harus memusatkan perhatian pada tugas yang detail, ${nama} bisa menjadi kurang akurat dan bahkan tidak terorganisir; namun ${nama} akan memusatkan perhatian pada pihak yang ingin ia senangkan karena enggan menolak. ${nama} menginginkan pengakuan sosial dan takut akan penolakan; ${nama} mudah menemukan teman dan berusaha menciptakan suasana yang menyenangkan. ${nama} membutuhkan manajer atau supervisor yang menetapkan batas waktu yang jelas dalam pekerjaan; dalam memimpin, ${nama} lebih menyukai gaya manajemen partisipatif yang dibangun di atas hubungan yang kuat.`,

 S: `${nama} merupakan individu konsisten yang berusaha menjaga lingkungan/suasana yang tidak berubah. ${nama} bekerja dengan baik bersama orang-orang dengan berbagai kepribadian karena perilakunya yang terkendali dan rendah hati. ${nama} sabar, loyal dan suka menolong. Persahabatan dikembangkannya dengan lambat dan selektif. ${nama} tidak bosan dengan rutinitas dan sangat baik bekerja dengan petunjuk dan peraturan yang jelas. ${nama} mengharapkan bantuan dan supervisi pada saat mengawali proyek baru. ${nama} butuh waktu untuk menyesuaikan diri dengan perubahan dan sungkan menjalankan "cara-cara lama mengerjakan sesuatu". ${nama} akan menghindari konfrontasi dan berusaha sekuat tenaga memendam perasaannya.`
,

 C: `${nama} seorang yang praktis, cakap dan unik. ${nama} mampu menilai diri sendiri dan kritis terhadap dirinya dan orang lain. ${nama} menyukai hal yang detil dan logis; secara alamiah ${nama} sangat analitis. Karena ${nama} menyimpan informasi, ${nama} meneliti isu berulang-ulang kali. ${nama} cenderung malu dan tertutup; ${nama} hati-hati dalam membuat keputusan yang berdasarkan pada logika, bukan emosi, selalu menggunakan pertanyaan "bagaimana dan mengapa". ${nama} mengerjakan sesuatu dengan sistematis dan akurat. ${nama} rapi dan terorganisir sebab ${nama} merasa bahwa keadaan berantakan sama dengan mutu yang rendah; demikian juga, rapi dan teratur merupakan mutu yang tinggi. ${nama} sangat teliti dalam segala sesuatu seperti halnya dalam pekerjaan dan penggunaan waktunya. ${nama} merencanakan dan mengorganisir semua sisi kehidupannya. Kelambanan sangat mengganggunya dan tak dapat ditolerir.`
};


// ====== DESKRIPSI GABUNGAN (1/2/3 huruf) – termasuk 3-gabungan kamu ======
  function gabunganDeskripsi(a, b, c) {
    const parts = [a, b, c].filter(Boolean).map(x => String(x).toUpperCase());
    // Normalisasi: pecah yang mungkin digabung (mis. "IS"), buang duplikat, max 3 huruf
    const letters = [...new Set(parts.join('').split(''))]
      .filter(ch => ['D','I','S','C'].includes(ch))
      .slice(0, 3);

    const join = arr => arr.join('');
    const perms = arr => {
      if (arr.length !== 3) return [];
      const [x,y,z] = arr;
      return [
        join([x,y,z]), join([x,z,y]),
        join([y,x,z]), join([y,z,x]),
        join([z,x,y]), join([z,y,x])
      ];
    };

    // --- registry kombinasi (mengacu ke data kamu; typo DI diperbaiki) ---
    const kombinasi = {
  // D group
  DI: `${nama} tidak basa-basi dan tegas, ${nama} cenderung merupakan seorang invidualis yang kuat. ${nama} berpandangan jauh ke depan, progresif dan mau berkompetisi untuk mencapai sasaran. ${nama} seorang yang selalu ingin tahu dan mempunyai minat dengan cakupan yang luas. ${nama} seorang yang logis, kritis dan tajam dalam memecahkan masalah. Sering kali ${nama} tampak imajinatif. ${nama} mempunyai kemampuan memimpinan yang baik. ${nama} kadang tampak keras kepala atau dingin karena orientasi dan prioritasnya pada tugas cenderung melebihi orientasi terhadap sesama. ${nama} mencanangkan standard tinggi pada dirinya dan akan sangat kritis ketika standard ini tidak dicapai. ${nama} juga menempatkan standard tinggi pada orang-orang di sekitarnya, serta mengutamakan kesempurnaan. ${nama} menginginkan otoritas yang jelas dan menyukai tugas-tugas baru.`
,
 DS: `${nama} seorang yang obyektif dan analitis. ${nama} ingin terlibat dalam situasi, dan ${nama} juga ingin memberikan bantuan dan dukungan kepada orang yang ${nama} hormati. Secara internal termotivasi oleh target pribadi, ${nama} berorientasi terhadap pekerjaannya tapi juga menyukai hubungan dengan sesama. Karena determinasinya yang kuat, ${nama} sering berhasil dalam berbagai hal; karakternya yang tenang, stabil dan daya tahannya yang tinggi memiliki kontribusi dalam keberhasilannya. Ulet dalam memulai pekerjaan. ${nama} akan berusaha keras untuk mencapai sasarannya. Seorang yang mandiri dan cermat serta memiliki tindak lanjut yang baik.`
,
  DC: `${nama} sensitif terhadap permasalahan, dan memiliki kreativitas yang baik dalam memecahkan masalah. ${nama} dapat menyelesaikan tugas-tugas penting dalam waktu singkat karena mempunyai keputusan yang kuat. ${nama} seorang yang tekun dan memiliki reaksi yang cepat. ${nama} akan meneliti dan mengejar semua kemungkinan yang ada dalam mencari solusi permasalahan. ${nama} banyak memberikan ide-ide dengan berfokus pada pekerjaan. Usaha yang keras pada ketepatan akan mengimbangi keinginannya pada hasil yang terukur. ${nama} cenderung perfeksionis dan dapat juga memperlambat pengambilan keputusan karena keinginannya untuk menentukan pilihan yang terbaik.`
,
  DIS: `${nama} fokus pada penyelesaian pekerjaan dan menunjukkan penghargaan yang tinggi kepada orang lain. ${nama} memiliki kemampuan untuk menggerakkan orang dan pekerjaan dikarenakan keterampilannya berpikir ke depan dan hubungan antar manusia. Tidak berorientasi detil, ${nama} fokus pada target secara keseluruhan dengan menyerahkan hal detil kepada orang lain. Enerjik dan sosial, ${nama} mampu memotivasi orang lain sambil menyelesaikan pekerjaannya. ${nama} menampilkan rasa percaya diri dan mampu meyakinkan orang lain. Sekali ${nama} memutuskan sesuatu, ${nama} akan terus mengerjakannya dan bertahan sampai selesai.`
,
 DIC: `${nama} menggabungkan antara kesenangan dengan pekerjaan/bisnis ketika melakukan sesuatu. ${nama} menyukai hubungan dengan sesama tetapi juga dapat mengerjakan hal-hal detil. ${nama} ingin melakukan segala sesuatu dengan tepat, dan ${nama} akan menyelesaikan tugasnya untuk meyakinkan ketepatan dan kelengkapannya. ${nama} ramah secara alami dan menikmati interaksi dengan sesama, namun ${nama} juga menilai orang dan tugas secara hati-hati; persahabatannya dapat bergeser sesuai dorongan hatinya pada orang-orang di sekitarnya. ${nama} sering melalaikan perencanaan yang seksama dan cenderung beralih ke proyek-proyek baru tanpa pertimbangan yang menyeluruh.`
,
 DSI: `${nama} seorang yang obyektif dan analitis. ${nama} ingin terlibat dalam situasi, dan ${nama} juga ingin memberikan bantuan dan dukungan kepada orang yang ${nama} hormati. Secara internal termotivasi oleh target pribadi, ${nama} berorientasi terhadap pekerjaannya tapi juga menyukai hubungan dengan sesama. Karena determinasinya yang kuat, ${nama} sering berhasil dalam berbagai hal; karakternya yang tenang, stabil, dan daya tahannya yang tinggi berkontribusi pada keberhasilannya. ${nama} ulet dalam memulai pekerjaan dan akan berusaha keras untuk mencapai sasarannya. ${nama} mandiri, cermat, serta memiliki tindak lanjut yang baik.`
,
 DSC: `${nama} seorang yang obyektif dan analitis. ${nama} ingin terlibat dalam situasi, dan ${nama} juga ingin memberikan bantuan dan dukungan kepada orang yang ${nama} hormati. Secara internal termotivasi oleh target pribadi, ${nama} berorientasi terhadap pekerjaannya tapi juga menyukai hubungan dengan sesama. Karena determinasinya yang kuat, ${nama} sering berhasil dalam berbagai hal; karakternya yang tenang, stabil, dan daya tahannya yang tinggi berkontribusi dalam keberhasilannya. ${nama} ulet dalam memulai pekerjaan. ${nama} akan berusaha keras untuk mencapai sasarannya. ${nama} mandiri dan cermat serta memiliki tindak lanjut yang baik.`
,
 DCI: `${nama} sensitif terhadap permasalahan, dan memiliki kreativitas yang baik dalam memecahkan masalah. ${nama} dapat menyelesaikan tugas-tugas penting dalam waktu singkat karena mempunyai keputusan yang kuat. ${nama} seorang yang tekun dan memiliki reaksi yang cepat. ${nama} akan meneliti dan mengejar semua kemungkinan yang ada dalam mencari solusi permasalahan. ${nama} banyak memberikan ide-ide dengan berfokus pada pekerjaan. Usaha ${nama} yang keras pada ketepatan akan mengimbangi keinginannya pada hasil yang terukur. ${nama} cenderung perfeksionis dan dapat juga memperlambat pengambilan keputusan karena keinginannya untuk menentukan pilihan yang terbaik.`
,
 DCS: `${nama} sensitif terhadap permasalahan, dan memiliki kreativitas yang baik dalam memecahkan masalah. ${nama} dapat menyelesaikan tugas-tugas penting dalam waktu singkat karena mempunyai keputusan yang kuat. ${nama} tekun dan memiliki reaksi yang cepat. ${nama} akan meneliti dan mengejar semua kemungkinan yang ada dalam mencari solusi permasalahan. ${nama} banyak memberikan ide-ide dengan berfokus pada pekerjaan. Usaha yang keras pada ketepatan akan mengimbangi keinginannya pada hasil yang terukur. ${nama} cenderung perfeksionis dan dapat juga memperlambat pengambilan keputusan karena keinginannya untuk menentukan pilihan yang terbaik.`
,

  // I group
  
  ID: `${nama} merupakan seorang pemimpin integratif yang bekerja dengan dan melalui orang lain. ${nama} ramah, memiliki perhatian yang tinggi akan orang dan juga mempunyai kemampuan untuk memperoleh hormat dan penghargaan dari berbagai tipe orang. ${nama} melakukan pekerjaannya dengan cara yang bersahabat, baik dalam mencapai sasarannya maupun meyakinkan pandangannya kepada orang lain. ${nama} tidak begitu memperhatikan hal-hal kecil. ${nama} kadang bertindak sesuai dengan kata hati/impulsif, terlalu antusias, dan sangat banyak bicara. ${nama} cenderung berlebihan menilai kemampuannya dalam memotivasi atau mengubah perilaku orang lain. ${nama} mencari kebebasan dari rutinitas, menginginkan otoritas/wewenang dan juga prestise. ${nama} menginginkan aktivitas yang bervariasi dan bekerja lebih efisien jika data-data analitis disediakan oleh orang lain. ${nama} menginginkan penugasan yang mengutamakan mobilitas dan tantangan.`
,
  IS: `${nama} mengesankan kehangatan, simpati, dan pengertian. ${nama} memiliki ketenangan dalam sebagian besar situasi sosial dan jarang membuat orang lain merasa tidak nyaman. Banyak orang datang kepada ${nama} karena dianggap pendengar yang baik. ${nama} cenderung sangat demonstratif dan emosinya biasanya tampak jelas bagi orang di sekitarnya. ${nama} tidak akan memaksakan ide pada orang lain; ${nama} tidak tegas dalam mengekspresikan atau memberi perintah. Jika sangat kuat merasakan sesuatu, ${nama} akan berbicara secara terbuka dan terus terang tentang pendiriannya. ${nama} cenderung menerima kritik atas pekerjaannya sebagai serangan pribadi. ${nama} dapat menjadi sangat toleran dan sabar kepada mereka yang tidak produktif di pekerjaan. ${nama} merupakan "penjaga damai" dan akan bekerja untuk menjaga kedamaian dalam setiap keadaan.`
,
  IC: `${nama} ramah dan suka berteman; ${nama} merasa nyaman bahkan dengan orang asing. ${nama} dapat mengembangkan hubungan baru dengan mudah, dan umumnya mampu mengendalikan diri sehingga jarang menimbulkan rasa benci pada orang lain dengan sengaja. ${nama} sangat sosial, menunjukkan kepedulian dan persahabatan saat menjalankan tugas. ${nama} cenderung perfeksionis secara alamiah, dan akan mengisolasi diri jika diperlukan untuk menyelesaikan pekerjaan. ${nama} berkeinginan mempromosikan tugas orang lain maupun miliknya. Terkadang ${nama} salah menilai kemampuan orang lain karena pandangan yang terlalu optimistis.`
,
  IDS: `${nama} bersahabat dan sosial; ${nama} juga suka mengendalikan situasi dan menjadi pemimpin. ${nama} menyelesaikan tugas melalui keterampilan sosial, peduli, dan menerima orang lain. ${nama} berkonsentrasi pada tugas yang ada sampai selesai dan akan meminta bantuan jika diperlukan. ${nama} menyadari keterbatasannya dan mencari dukungan saat memerlukannya. ${nama} disukai dan orang cenderung ingin menolongnya. ${nama} senang berbagi kebanggaan dengan kelompok; ${nama} seorang team player sekaligus team leader. ${nama} menginginkan popularitas dan pengakuan.`
,
  IDC: `${nama} sangat berorientasi pada tugas sekaligus menyukai orang. ${nama} sangat baik dalam menarik orang (recruiting). ${nama} bersahabat, namun menyukai keadaan di mana tugas harus dilakukan dengan benar. Sesekali ${nama} tampak dingin dan mendominasi. ${nama} bisa sangat fokus pada tugas hingga melupakan orang-orang di sekitarnya. ${nama} sangat mengharapkan orang-orang terlibat dalam proyeknya, namun kadang kurang memikirkan apa yang diinginkan orang-orang tersebut. ${nama} perlu mendengar dan mempertimbangkan kebutuhan orang di sekitarnya, khususnya kesempatan untuk mencoba. ${nama} sangat membutuhkan persetujuan sosial dan mudah mempercayai orang lain, sehingga sesekali berlebihan dalam menilai orang dan kemampuannya. ${nama} dapat tampak tidak konsisten karena kesulitan berkonsentrasi lama. ${nama} perlu belajar sungguh-sungguh mendengarkan orang lain alih-alih selalu memikirkan apa yang ingin dikatakan. ${nama} memiliki kemampuan logika yang tinggi saat mau menggunakannya.`
,
  ISD: `${nama} menampilkan gaya yang bersemangat ketika termotivasi pada sasaran. ${nama} lebih suka memimpin atau melibatkan diri, namun juga bersedia berperan sebagai pendukung. ${nama} membutuhkan pengakuan dan penghargaan serta menyukai peran pendukung. ${nama} peduli kepada orang-orang di sekitarnya dan mempertimbangkan perasaan orang lain dalam pengambilan keputusan. ${nama} menampilkan keterampilan berhubungan dan berkomunikasi dengan sangat baik. ${nama} akan berusaha keras menyelesaikan tugas dengan cepat dan efisien.`
,
 ISC: `${nama} berorientasi pada orang, lancar berkomunikasi, dan loyal. ${nama} cenderung sensitif dan memiliki standar tinggi. Keputusan diambil berdasarkan fakta dan data pendukung. ${nama} tampak tidak bisa diam; ${nama} perlu lebih terus terang dan tidak terlalu subyektif. ${nama} membutuhkan pengakuan sosial dan perhatian pribadi; ${nama} cepat akrab dengan orang lain. ${nama} bersahabat, antusias, informal, banyak bicara, dan sering khawatir tentang apa yang dipikirkan orang. ${nama} menguasai banyak hal. ${nama} ingin diterima sebagai anggota kelompok dan ingin mengetahui secara pasti apa yang diharapkan darinya sebelum memulai proyek baru.`
,
  ICD: `${nama} analitis, berhati-hati, dan ramah ketika merasa nyaman. ${nama} cukup biasa dengan orang asing karena dapat menilai dan menyesuaikan diri dalam hubungan. ${nama} mudah mengembangkan hubungan baru ketika menginginkannya, dan umumnya mampu mengendalikan diri sehingga jarang menimbulkan kebencian dengan sengaja. ${nama} menunjukkan kepedulian dan keramahan, namun tetap fokus menyelesaikan tugas. ${nama} cenderung perfeksionis dan akan mengisolasi diri jika diperlukan untuk menyelesaikan pekerjaan. ${nama} menyukai situasi yang dapat diprediksi dan minim kejutan. ${nama} sangat berorientasi pada kualitas dan bekerja keras menyelesaikan pekerjaan dengan benar. ${nama} ingin orang-orang berkenan terhadap pekerjaan yang telah diselesaikan dengan baik.`
,
 ICS: `${nama} berorientasi pada orang, lancar berkomunikasi, dan loyal. ${nama} cenderung sensitif dan memiliki standar tinggi. Keputusan dibuat berdasarkan fakta dan data pendukung. ${nama} tampak tidak bisa diam; ${nama} perlu lebih terus terang dan mengurangi subjektivitas. ${nama} membutuhkan pengakuan sosial dan perhatian pribadi; ${nama} cepat akrab dengan orang lain. ${nama} bersahabat, antusias, informal, banyak bicara, dan sering khawatir terhadap apa yang dipikirkan orang. ${nama} menguasai banyak hal. ${nama} ingin diterima sebagai anggota kelompok dan ingin mengetahui dengan jelas apa yang diharapkan darinya sebelum memulai proyek baru.`
,

  // S group
 SD: `${nama} merupakan seorang yang obyektif dan analitis. ${nama} ingin terlibat dalam situasi, dan juga ingin memberikan bantuan dan dukungan. Secara internal termotivasi oleh target pribadi, ${nama} menyukai orang-orang, tetapi juga mempunyai kemampuan untuk berorientasi pada pekerjaannya saat dibutuhkan. Karena determinasinya yang kuat, ${nama} sering berhasil dalam berbagai hal; karakternya yang tenang, stabil, dan daya tahannya berkontribusi pada keberhasilannya. Setelah memulai pekerjaan, ${nama} ulet dan akan berusaha keras untuk mencapai sasarannya. Seorang yang bebas, ${nama} cermat dan memiliki tindak lanjut yang baik. ${nama} bisa menjadi tidak ramah walaupun pada dasarnya berorientasi pada orang; dalam situasi yang tidak membuatnya nyaman, ${nama} lebih suka mendukung pemimpin daripada terlibat langsung dalam situasi.`
,
  SI: `${nama} mengesankan orang akan kehangatan, simpati dan pengertiannya. ${nama} memiliki ketenangan dalam sebagian besar situasi sosial dan jarang tidak menyenangkan orang lain. Faktanya, banyak orang datang pada ${nama} karena ${nama} kelihatan sebagai pendengar yang baik. ${nama} cenderung sangat demonstratif dan emosinya biasanya tampak jelas bagi orang di sekitarnya. ${nama} tidak akan memaksakan idenya pada orang lain; ${nama} tidak tegas dalam mengekspresikan atau memberi perintah. Jika ${nama} sangat kuat merasakan sesuatu, ${nama} akan bicara secara terbuka dan terus terang tentang pendiriannya. ${nama} cenderung menerima kritik atas pekerjaannya sebagai serangan pribadi. ${nama} dapat menjadi sangat toleran dan sabar kepada mereka yang tidak produktif di pekerjaan. ${nama} merupakan "penjaga damai" yang sebenarnya dan akan bekerja untuk menjaga kedamaian dalam setiap keadaan.`
,
  SC: `${nama} adalah orang yang baik secara alamiah dan sangat berorientasi detil. ${nama} peduli dengan orang-orang di sekitarnya dan mempunyai kualitas yang membuatnya sangat teliti dalam penyelesaian tugas. ${nama} mempertimbangkan sekelilingnya dengan hati-hati sebelum membuat keputusan untuk melihat pengaruhnya pada mereka; pada saat tertentu ${nama} terlalu hati-hati. Jika ${nama} merasa seseorang memanfaatkan situasi, ${nama} akan memperlambat kerjanya sehingga dapat mengamati apa yang sedang berlangsung di sekitarnya.`
,
 SDI: `${nama} seorang yang obyektif dan analitis. ${nama} ingin terlibat dalam situasi, dan ${nama} juga ingin memberikan bantuan dan dukungan kepada orang yang ${nama} hormati. Secara internal termotivasi oleh target pribadi, ${nama} berorientasi terhadap pekerjaannya tapi juga menyukai hubungan dengan sesama. Karena determinasinya yang kuat, ${nama} sering berhasil dalam berbagai hal; karakternya yang tenang, stabil dan daya tahannya yang tinggi memiliki kontribusi dalam keberhasilannya. ${nama} ulet dalam memulai pekerjaan. ${nama} akan berusaha keras untuk mencapai sasarannya. ${nama} mandiri dan cermat serta memiliki tindak lanjut yang baik.`
,
 SDC: `${nama} sabar, terkontrol dan suka menggali fakta dan jalan keluar. ${nama} tenang dan ramah. ${nama} merencanakan pekerjaan dengan hati-hati, tetapi agresif dalam menanyakan sesuatu serta mengumpulkan data pendukung. Kemudian ${nama} bekerja dengan konsisten dengan arahan yang benar. Menjadi individu yang penuh perhatian, rendah hati, dan ${nama} berhubungan baik dengan hampir semua orang. ${nama} konsisten dan suka menolong. People skill dari seorang ${nama} melebihi orientasi tugasnya.`
,
SID: `${nama} mengesankan orang akan kehangatan, simpati dan pengertiannya. ${nama} memiliki ketenangan dalam sebagian besar situasi sosial dan jarang tidak menyenangkan orang lain. Faktanya, banyak orang datang pada ${nama} karena ${nama} kelihatan sebagai pendengar yang baik. ${nama} cenderung sangat demonstratif dan emosinya biasanya tampak jelas bagi orang di sekitarnya. ${nama} tidak akan memaksakan idenya pada orang lain; ${nama} tidak tegas dalam mengekspresikan atau memberi perintah. Jika ${nama} sangat kuat merasakan sesuatu, ${nama} akan bicara secara terbuka dan terus terang tentang pendiriannya. ${nama} cenderung menerima kritik atas pekerjaannya sebagai serangan pribadi. ${nama} dapat menjadi sangat toleran dan sabar kepada mereka yang tidak produktif di pekerjaan. ${nama} merupakan "penjaga damai" yang sebenarnya dan akan bekerja untuk menjaga kedamaian dalam setiap keadaan.`
,
 SIC: `${nama} merupakan orang yang stabil, individu yang ramah yang berusaha keras membangun hubungan yang positif di tempat kerja dan di rumah. ${nama} dapat menjadi sangat berorientasi detil ketika situasi membutuhkan; tetapi secara keseluruhan ${nama} cenderung individualis, independen dan sedikit perhatian terhadap detil. Sekali ${nama} membuat keputusan, sangat sulit mengubah pendiriannya. ${nama} menyukai hubungan dengan orang dan cenderung mendukung pihak yang lemah. ${nama} akan mengambil posisi berlawanan dengan ketidaksepakatan dan merasa frustrasi jika sesuatu tidak sejalan dengannya. ${nama} ingin diterima sebagai anggota tim, dan ${nama} menginginkan orang lain menyukainya. ${nama} cukup sulit membuat keputusan sampai parameter wewenang secara jelas ditentukan, dan ${nama} mungkin cenderung tidak sungguh-sungguh jika dipaksa membuat keputusan ketika tidak ingin melakukannya. ${nama} menginginkan orang lain yang membuat keputusan, khususnya jika ada orang yang sangat ${nama} hargai dan hormati. ${nama} cenderung moderat, cermat dan dapat diandalkan.`
,
 SCD: `${nama} adalah orang yang baik secara alamiah dan sangat berorientasi detil. ${nama} peduli dengan orang-orang di sekitarnya dan mempunyai kualitas yang membuatnya sangat teliti dalam penyelesaian tugas. ${nama} mempertimbangkan sekelilingnya dengan hati-hati sebelum membuat keputusan untuk melihat pengaruhnya pada mereka; pada saat tertentu ${nama} terlalu hati-hati. Jika ${nama} merasa seseorang memanfaatkan situasi, ${nama} akan memperlambat kerjanya sehingga dapat mengamati apa yang sedang berlangsung di sekitarnya.`
,
 SCI: `${nama} merupakan orang yang stabil, individu yang ramah yang berusaha keras membangun hubungan yang positif di tempat kerja dan di rumah. ${nama} dapat menjadi sangat berorientasi detil ketika situasi membutuhkan; tetapi secara keseluruhan ${nama} cenderung individualis, independen dan sedikit perhatian terhadap detil. Sekali ${nama} membuat keputusan, sangat sulit mengubah pendiriannya. ${nama} menyukai hubungan dengan orang dan cenderung mendukung pihak yang lemah. ${nama} akan mengambil posisi berlawanan dengan ketidaksepakatan dan merasa frustrasi jika sesuatu tidak sejalan dengannya. ${nama} ingin diterima sebagai anggota tim, dan ${nama} menginginkan orang lain menyukainya. ${nama} cukup sulit membuat keputusan sampai parameter wewenang secara jelas ditentukan, dan ${nama} mungkin cenderung tidak sungguh-sungguh jika dipaksa membuat keputusan ketika tidak ingin melakukannya. ${nama} menginginkan orang lain yang membuat keputusan, khususnya jika ada orang yang sangat ${nama} hargai dan hormati. ${nama} cenderung moderat, cermat dan dapat diandalkan.`
,

  // C group
  
  CD: `${nama} seorang yang sangat berorientasi pada tugas dan sensitif pada permasalahan. ${nama} lebih memedulikan tugas yang ada dibanding orang-orang di sekitarnya, termasuk perasaan mereka. ${nama} sangat kukuh/keras dan mempunyai pendekatan yang efektif dalam pemecahan masalah. Karena sifat alamiah dan keinginannya akan hasil yang terukur, ${nama} akan tampak dingin, tidak berperasaan, dan menjaga jarak. ${nama} membuat keputusan berdasarkan fakta, bukan emosi. ${nama} cenderung pendiam dan tidak mudah percaya.`
,
 CI: `${nama} analitis, berhati-hati, dan ramah ketika merasa nyaman. ${nama} cukup biasa dengan orang asing karena mampu menilai dan menyesuaikan diri dalam hubungan. ${nama} dapat mengembangkan hubungan baru dengan mudah ketika menginginkannya, dan umumnya mampu mengendalikan diri sehingga jarang menimbulkan rasa benci dengan sengaja. ${nama} menunjukkan sikap peduli dan ramah, namun tetap mampu memusatkan perhatian pada penyelesaian tugas. ${nama} cenderung perfeksionis secara alami dan akan mengisolasi diri jika diperlukan untuk menyelesaikan pekerjaan. ${nama} menyukai situasi yang dapat diramalkan dan minim kejutan. ${nama} sangat berorientasi pada kualitas dan akan bekerja keras untuk menyelesaikan pekerjaan dengan benar. ${nama} ingin orang-orang berkenan terhadap pekerjaan yang telah diselesaikan dengan baik.`
,
 CS: `${nama} berpikir sistematis dan cenderung mengikuti prosedur dalam kehidupan pribadi dan pekerjaan. Teratur dan memiliki perencanaan yang baik, ${nama} teliti dan fokus pada detail. ${nama} bertindak penuh kebijaksanaan, diplomatis, dan jarang menentang rekan kerja dengan sengaja. ${nama} sangat berhati-hati dan sungguh-sungguh mengharapkan akurasi serta standar tinggi dalam pekerjaan. ${nama} cenderung terjebak dalam detail, khususnya saat harus memutuskan. ${nama} menginginkan adanya petunjuk standar pelaksanaan kerja tanpa perubahan mendadak.`
,
  CDI: `${nama} sangat berorientasi pada tugas dan sensitif pada permasalahan. ${nama} lebih memedulikan tugas dibanding orang-orang di sekitarnya, termasuk perasaan mereka. ${nama} sangat kukuh/keras dan memiliki pendekatan efektif dalam pemecahan masalah. Karena sifat alamiah dan keinginan akan hasil terukur, ${nama} tampak dingin, tidak berperasaan, dan menjaga jarak. ${nama} membuat keputusan berdasarkan fakta, bukan emosi. ${nama} cenderung pendiam dan tidak mudah percaya.`
,
  CDS: `${nama} berorientasi pada detail dan memiliki standar tinggi untuk dirinya. ${nama} logis dan analitis, ingin berbuat yang terbaik, dan selalu melihat ruang untuk kemajuan. ${nama} cenderung kompetitif dan ingin menghasilkan pekerjaan dengan mutu terbaik. ${nama} sebenarnya sensitif terhadap orang, tetapi karena sifat logisnya, orientasi pada tugas dapat menutupinya. ${nama} suka dihargai atas pekerjaan berkualitas, mampu mengerjakan tugas dan mencapai sasaran. ${nama} sangat fokus pada tugas yang ada, mantap, dan dapat diandalkan.`
,
CID: `${nama} analitis, berhati-hati, dan ramah ketika merasa nyaman. ${nama} cukup biasa dengan orang asing karena mampu menilai dan menyesuaikan diri dalam hubungan. ${nama} mudah mengembangkan hubungan baru ketika menginginkannya, dan umumnya mampu mengendalikan diri sehingga jarang menimbulkan kebencian dengan sengaja. ${nama} menunjukkan kepedulian dan keramahan, namun tetap fokus menyelesaikan tugas. ${nama} cenderung perfeksionis dan akan mengisolasi diri jika diperlukan untuk menyelesaikan pekerjaan. ${nama} menyukai situasi yang dapat diprediksi dan tanpa kejutan. ${nama} sangat berorientasi pada kualitas dan bekerja keras untuk menyelesaikan pekerjaan dengan benar. ${nama} ingin orang-orang berkenan terhadap pekerjaan yang telah diselesaikan dengan baik.`
,
CIS: `${nama} berorientasi pada orang sekaligus mampu menggabungkan ketepatan dan loyalitas. ${nama} peka dan memiliki standar tinggi, menginginkan stabilitas dan tetap berorientasi pada sasaran. ${nama} menginginkan pengakuan sosial dan perhatian pribadi; ${nama} bersahabat, antusias, informal, banyak bicara, dan kerap mencemaskan apa yang dipikirkan orang lain. ${nama} menolak agresi dan mengharapkan suasana harmonis. ${nama} cukup cerdas di berbagai hal serta merupakan pencari fakta yang baik, membuat keputusan setelah mengumpulkan fakta dan data pendukung.`
,
 CSD: `${nama} berpikir sistematis dan cenderung mengikuti prosedur dalam kehidupan pribadi dan pekerjaan. Teratur dan memiliki perencanaan yang baik, ${nama} teliti dan fokus pada detail. ${nama} bertindak penuh kebijaksanaan, diplomatis, dan jarang menentang rekan kerja dengan sengaja. ${nama} sangat berhati-hati dan sungguh-sungguh mengharapkan akurasi serta standar tinggi dalam pekerjaan. ${nama} cenderung terjebak dalam detail, khususnya saat harus memutuskan. ${nama} menginginkan petunjuk standar pelaksanaan kerja tanpa perubahan mendadak.`
,
CSI: `${nama} berorientasi pada orang, mampu menggabungkan ketepatan dan loyalitas. ${nama} peka dan memiliki standar tinggi, menginginkan stabilitas dan tetap berorientasi terhadap sasaran. ${nama} menginginkan pengakuan sosial dan perhatian pribadi; ${nama} bersahabat, antusias, informal, banyak bicara, dan mungkin sangat mencemaskan apa yang dipikirkan orang lain. ${nama} menolak agresi dan mengharapkan suasana harmonis. ${nama} cukup cerdas di berbagai hal serta merupakan pencari fakta yang sangat baik, membuat keputusan yang baik setelah mengumpulkan fakta dan data pendukung.`

};
 // 3 huruf → coba semua permutasi (CIS, CSI, ISC, dll)
    if (letters.length === 3) {
      for (const k of perms(letters)) {
        if (kombinasi[k]) return kombinasi[k];
      }
      // fallback ke pasangan top-2 (sesuai urutan yang dikirim)
      const ab = join(letters.slice(0,2));
      if (kombinasi[ab]) return kombinasi[ab];
      const ba = join([letters[1], letters[0]]);
      if (kombinasi[ba]) return kombinasi[ba];
      // fallback terakhir: gabung single
      return letters.map(h => (desk[h] || '')).join('<br>');
    }

    // 2 huruf
    if (letters.length === 2) {
      const ab = join(letters);
      if (kombinasi[ab]) return kombinasi[ab];
      const ba = join([letters[1], letters[0]]);
      if (kombinasi[ba]) return kombinasi[ba];
      return (desk[letters[0]] || '') + '<br>' + (desk[letters[1]] || '');
    }

    // 1 huruf
    if (letters.length === 1) {
      return kombinasi[letters[0]] || desk[letters[0]] || '';
    }

    return '';
  }

  // Analisis pola grafik (closure pakai arr & dominan)
  function analisaPolaGrafik() {
    if (!arr.length) return "";
    const tertinggi = arr[0].y;  // y terkecil = titik paling atas
    const terendah = arr[arr.length-1].y;
    const jarak = terendah - tertinggi;
    const faktorDominan = [...dominan];
    let analisa = "";

    if (jarak > 200) {
      analisa += `<b>Pola Ekstrim:</b> Perbedaan sangat besar antara tipe dominan dan tipe lemah.<br>`;
      faktorDominan.forEach(f => {
        if (f === 'D') analisa += `${nama} sangat dominan dan cenderung memimpin secara tegas.<br>`;
        if (f === 'I') analisa += `${nama} sangat komunikatif, mudah memengaruhi dan menggerakkan kelompok.<br>`;
        if (f === 'S') analisa += `${nama} sangat stabil, jadi penyeimbang/pedukung, kadang menghindari perubahan besar.<br>`;
        if (f === 'C') analisa += `${nama} perfeksionis, sangat detail, kadang terlalu kaku dalam standar.<br>`;
      });
    }

    if (jarak < 100) {
      analisa += `<b>Pola Seimbang:</b> Profil fleksibel, mudah beradaptasi, bisa ambil peran apa saja sesuai kebutuhan.<br>`;
      analisa += "Kekuatan: Mudah bekerja lintas tim, cocok untuk tugas rotasi.<br>";
      analisa += "Tantangan: Perlu asah ketegasan dan pengambilan keputusan saat dibutuhkan.<br>";
    }

    if (faktorDominan.length === 2) {
      const gab = faktorDominan.join('');
      if (gab === 'CD' || gab === 'DC') {
        analisa += `<b>Pola Perfeksionis Tegas:</b> fokus mutu + ketegasan eksekusi.<br>`;
      } else if (gab === 'IS' || gab === 'SI') {
        analisa += `<b>Pola Influencer Stabil:</b> relasi kuat + konsistensi tim.<br>`;
      } else if (gab === 'DS' || gab === 'SD') {
        analisa += `<b>Pola Stabil Tegas:</b> tenang, tahan banting, namun berani dorong target.<br>`;
      } else if (gab === 'IC' || gab === 'CI') {
        analisa += `<b>Pola Analitis Persuasif:</b> kombinasi logika dan komunikasi publik.<br>`;
      } else if (gab === 'DI' || gab === 'ID') {
        analisa += `<b>Pola Leader Inspiratif:</b> karisma + dorongan hasil.<br>`;
      } else if (gab === 'SC' || gab === 'CS') {
        analisa += `<b>Pola Detail Stabil:</b> ketelitian + kesabaran proses.<br>`;
      }
    }

    if (faktorDominan.length === 3) {
      analisa += `<b>Pola Multi-Dominan:</b> ${faktorDominan.join(', ')} sama kuat secara grafik.<br>
        Kekuatan: Adaptasi sangat tinggi; bisa memimpin, membangun relasi, menjaga stabilitas, atau memastikan mutu sesuai konteks.<br>
        Tantangan: Perlu prioritisasi jelas agar tidak bingung memilih gaya ketika tekanan meningkat.<br>`;
    }

    if (faktorDominan.length === 1) {
      const f = faktorDominan[0];
      analisa += `<b>Pola Satu Dominan:</b> ${f} paling menonjol secara grafik.<br>`;
    }

    return analisa;
  }

  // Deskripsi akhir: gunakan mesin gabungan untuk 1/2/3 huruf
  const deskripsi = gabunganDeskripsi(...dominan);

  return {
    dominan,                          // contoh: ["C","I","S"]
    ranking: ranking.join(' > '),     // urutan visual keseluruhan
    deskripsi,                        // HTML narasi gabungan (support 3 huruf)
    analisaPola: analisaPolaGrafik(), // insight pola jarak
    nilai: {
      D: (arr.find(i => i.key === 'D') || {}).val,
      I: (arr.find(i => i.key === 'I') || {}).val,
      S: (arr.find(i => i.key === 'S') || {}).val,
      C: (arr.find(i => i.key === 'C') || {}).val
    },
    y: {
      D: (arr.find(i => i.key === 'D') || {}).y,
      I: (arr.find(i => i.key === 'I') || {}).y,
      S: (arr.find(i => i.key === 'S') || {}).y,
      C: (arr.find(i => i.key === 'C') || {}).y
    }
  };
}


// ================ TAMPILKAN GRID, GARIS, DAN ANALISIS DISC ================
function showDISCResult() {
  const hasilDISC = countDISC(appState.answers.DISC, tests.DISC.questions);
  const identity = appState.identity || {};

  // VALIDASI: cek jumlah * pada Most (P) dan Least (K) DIGABUNGKAN
  let starMost = Number(hasilDISC.most['*'] || 0);
  let starLeast = Number(hasilDISC.least['*'] || 0);
  let totalStar = starMost + starLeast;
  let isInvalid = (totalStar > 8);

  // ANALISIS (jika valid)
  let analisaHTML = "";
  if (!isInvalid) {
    const most   = analisa2DominanDISC(hasilDISC.most.D, hasilDISC.most.I, hasilDISC.most.S, hasilDISC.most.C, 'most', getPixelY);
    const least  = analisa2DominanDISC(hasilDISC.least.D, hasilDISC.least.I, hasilDISC.least.S, hasilDISC.least.C, 'least', getPixelY);
    const change = analisa2DominanDISC(hasilDISC.change.D, hasilDISC.change.I, hasilDISC.change.S, hasilDISC.change.C, 'change', getPixelY);

    // ================ REKOMENDASI PERAN ================
    function rekomendasiPeran() {
      const roles = {
        "DI": [
          "Manajer Penjualan",
          "Entrepreneur",
          "Pemimpin Tim",
          "Marketing Director"
        ],
        "ID": [
          "Marketing, Public Relations",
          "Event Organizer",
          "Business Development"
        ],
        "DS": [
          "Manajer Operasional",
          "Supervisor Produksi",
          "Koordinator Proyek",
          "Logistik Manager",
          "Human Capital Staff"
        ],
        "SD": [
          "Koordinator SDM",
          "Staf Pelayanan Publik",
          "Komunitas Leader",
          "Human Capital Staff"
        ],
        "DC": [
          "Manajer Proyek Teknis",
          "Insinyur Senior",
          "Konsultan Spesialis",
          "Quality Control Manager"
        ],
        "CD": [
          "Auditor",
          "Analis Sistem",
          "Project Manager",
          "Lead Engineer"
        ],
        "IS": [
          "HRD Manager",
          "Konselor",
          "Guru",
          "Customer Relations Manager",
          "Human Capital Staff"
        ],
        "SI": [
          "Guru SD",
          "Fasilitator Komunitas",
          "Pendamping Anak",
          "Team Builder",
          "Human Capital Staff"
        ],
        "IC": [
          "Marketing Analyst",
          "Konsultan Bisnis",
          "Pelatihan Korporat",
          "Peneliti Pasar"
        ],
        "CI": [
          "Peneliti",
          "Content Planner",
          "Data Scientist",
          "Business Analyst"
        ],
        "SC": [
          "Analis Data",
          "Akuntan",
          "Quality Assurance",
          "Peneliti",
          "Human Capital Staff"
        ],
        "CS": [
          "QA Tester",
          "Admin Proses",
          "Laboran",
          "Support Staff",
          "Human Capital Staff"
        ]
      };
      // Kombinasi tidak urut, harus cek dua arah!
      const kode = most.dominan.join('');
      const kode2 = most.dominan.slice().reverse().join('');
      return roles[kode] || roles[kode2] || ["Beragam, sesuaikan dengan minat dan pengalaman"];
    }

   // ================ KEC OCO KAN POSISI ================
function cocokPosisi() {
  if (!identity.position) return "";

  const persyaratan = {
    "Administrator": {
      sangat: ["SC", "CS", "DC"],
      cocok: ["CD"],
      cukup: ["SD", "IS"]
    },
    "Dosen/Guru": {
      sangat: ["IS", "IC", "SI", "SC"],
      cocok: ["ID", "SD"],
      cukup: ["CS", "CI"]
    },
    "Technical Staff": {
      sangat: ["DC", "SC"],
      cocok: ["CD", "CS"],
      cukup: ["SD", "CI"]
    },
    "IT Staff": {
      // TI membutuhkan C tinggi + stabilitas S
      sangat: ["CS", "SC", "CD"],
      cocok: ["SD", "CI"],
      cukup: ["SI", "IC"]
    },
    "Manajer": {
      sangat: ["DI", "ID", "DC", "CD"],
      cocok: ["DS", "IS"],
      cukup: ["SC"]
    },
    "Housekeeping": {
      sangat: ["SC", "CS"],
      cocok: ["SI", "IC"],
      cukup: ["CI"]
    },
    "Human Capital": {
      sangat: ["IS", "SI", "SC", "SD"],
      cocok: ["DS", "CS"],
      cukup: ["IC"]
    }
  };

 const kode = most.dominan.join('');
const kode2 = most.dominan.slice().reverse().join('');
const req = persyaratan[identity.position] || {};

let tingkat = "TIDAK COCOK";
let simbol = "X";  // default

// --- Paling atas: SANGAT SESUAI
if ((req.sangat || []).includes(kode) || (req.sangat || []).includes(kode2)) {
  tingkat = "SANGAT SESUAI";
  simbol = "SS";
}
// --- COCOK
else if ((req.cocok || []).includes(kode) || (req.cocok || []).includes(kode2)) {
  tingkat = "COCOK";
  simbol = "C";
}
// --- CUKUP COCOK
else if ((req.cukup || []).includes(kode) || (req.cukup || []).includes(kode2)) {
  tingkat = "CUKUP COCOK";
  simbol = "CC";
}
// --- KURANG COCOK (share 1 huruf)
else if (
  []
    .concat(req.sangat || [], req.cocok || [], req.cukup || [])
    .some(x =>
      kode.includes(x[0]) || kode.includes(x[1]) ||
      kode2.includes(x[0]) || kode2.includes(x[1])
    )
) {
  tingkat = "KURANG COCOK";
  simbol = "K";
}

// ================= DETAIL MENGAJAR =================
let detail = "";
if (identity.teacherLevel) {
  if (identity.teacherLevel === "SD" && (kode.includes("I") || kode2.includes("I")))
    detail += "Sangat mendukung interaksi dengan anak-anak kecil.<br>";
  if (identity.teacherLevel === "SMA" && (kode.includes("C") || kode2.includes("C")))
    detail += "Pendekatan analitis cocok untuk pelajaran eksakta.<br>";
}


  return `
    <div style="margin-top:16px;padding:14px;background:${
      tingkat === "SANGAT SESUAI" ? '#e8f5e9'
      : tingkat === "COCOK" ? '#f0f7fa'
      : tingkat === "CUKUP COCOK" ? '#eef5ff'
      : tingkat === "KURANG COCOK" ? '#fff7e6'
      : '#ffebee'
    };border-radius:8px;">
      <b>Analisis Posisi "${identity.position}":</b>
      <div>
        ${
          tingkat === "SANGAT SESUAI"
            ? '✅ <span style="color:#18b172;font-weight:bold;">Cocok Sekali</span>'
          : tingkat === "COCOK"
            ? '✔️ <span style="color:#2176c7;font-weight:bold;">Cocok</span>'
          : tingkat === "CUKUP COCOK"
            ? 'ℹ️ <span style="color:#395b9a;font-weight:bold;">Cukup Cocok</span>'
          : tingkat === "KURANG COCOK"
            ? '⚠️ <span style="color:#de9000;font-weight:bold;">Kurang Cocok</span>'
          : '❌ <span style="color:#c00;font-weight:bold;">Tidak Cocok</span>'
        }
      </div>
      <div>${detail}</div>
    </div>
  `;
}



    // Analisis tekanan dan potensi stres (lebih adaptif)
function analisaTekanan() {
  const tekanan = [];
  const strategi = [];

  // Ambil posisi grafik (pixelY) untuk masing-masing faktor pada grafik Least (K)
  // Asumsikan arr sudah urut sesuai pixel grafik (y paling besar = paling bawah)
  const thresholdBawah = 300; // contoh, sesuaikan tinggi canvas grafikmu

  if (least.y.D > thresholdBawah) {
    tekanan.push("Kesulitan jika berada di lingkungan yang sangat birokratis atau diatur ketat.");
    strategi.push("Libatkan dalam pengambilan keputusan dan beri otonomi dalam menjalankan tugas, agar tetap termotivasi.");
  }
  if (least.y.I > thresholdBawah) {
    tekanan.push("Stres jika akses pada interaksi sosial atau komunikasi dibatasi.");
    strategi.push("Pastikan adanya forum, meeting, atau ruang diskusi rutin agar kebutuhan komunikasi tetap terpenuhi.");
  }
  if (least.y.S > thresholdBawah) {
    tekanan.push("Stres saat menghadapi perubahan mendadak atau lingkungan kerja yang tidak stabil.");
    strategi.push("Lakukan perubahan secara bertahap, informasikan rencana lebih awal, dan berikan waktu adaptasi yang cukup.");
  }
  if (least.y.C > thresholdBawah) {
    tekanan.push("Frustasi jika menghadapi ketidakpastian, aturan yang ambigu, atau data/instruksi tidak jelas.");
    strategi.push("Berikan petunjuk dan struktur kerja yang jelas, lengkap dengan standar operasional prosedur (SOP) dan data pendukung.");
  }

  if (!tekanan.length) {
    return "<div style='margin-top:12px'>Tidak teridentifikasi sumber stres utama pada grafik Least (K).</div>";
  }

  return `
    <div style="margin-top:16px;">
      <b>Potensi Sumber Stres:</b>
      <ul style="margin:8px 0 8px 16px">${tekanan.map(t => `<li>${t}</li>`).join('')}</ul>
      <b>Strategi Mengatasi:</b>
      <ul style="margin:8px 0 8px 16px">
        ${strategi.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
  `;
}


analisaHTML = `
  <div style="margin-top:28px; border-radius:11px; background:#f8fafb; padding:20px 26px;">
    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 300px;">
        <div style="font-weight:600;color:#2176C7;font-size:1.12em;">Analisis Mask / Most (P):</div>
        <div style="font-size:0.97em;color:#677;">Perilaku alami, motivasi utama saat nyaman atau tanpa tekanan.</div>
        <div style="margin-bottom:7px;">
          <b>Dua dominan utama:</b> <span style="color:#2176C7">${most.dominan.join(' & ')}</span><br>
          <b>Urutan:</b> ${most.ranking}<br>
          <div style="margin-top:10px;">${most.deskripsi}</div>
          <div style="margin-top:12px;">${most.analisaPola}</div>
        </div>
        <div style="font-weight:600;color:#DE9000;font-size:1.12em;margin-top:20px;">Analisis Pressure / Least (K):</div>
        <div style="font-size:0.97em;color:#a98e24;">Perilaku saat menghadapi tekanan, tuntutan, atau lingkungan sulit.</div>
        <div style="margin-bottom:7px;">
          <b>Dua dominan utama:</b> <span style="color:#DE9000">${least.dominan.join(' & ')}</span><br>
          <b>Urutan:</b> ${least.ranking}<br>
          <div style="margin-top:10px;">${least.deskripsi}</div>
          <div style="margin-top:12px;">${least.analisaPola}</div>
          ${analisaTekanan()}
        </div>
      </div>
      <div style="flex: 1; min-width: 300px;">
        <div style="font-weight:600;color:#18b172;font-size:1.12em;">Analisis Self / Change (P-K):</div>
        <div style="font-size:0.97em;color:#148562;">Pola perubahan antara situasi nyaman dan tekanan.</div>
        <div>
          <b>Dua dominan utama:</b> <span style="color:#18b172">${change.dominan.join(' & ')}</span><br>
          <b>Urutan:</b> ${change.ranking}<br>
          <div style="margin-top:10px;">${change.deskripsi}</div>
          <div style="margin-top:12px;">${change.analisaPola}</div>
        </div>
        <div style="margin:20px 0 0 0;font-weight:600;color:#1a232e;">Rekomendasi Karir:</div>
        <ul style="margin-top:8px;padding-left:20px;">
          ${rekomendasiPeran().map(r => `<li>${r}</li>`).join('')}
        </ul>
        ${cocokPosisi()}
      </div>
    </div>
    <div style="margin-top:26px;padding-top:18px;border-top:1px solid #eee;">
      <div style="font-weight:600;color:#1a232e;">Simpulan Kepribadian Menyeluruh:</div>
      <div>
        <b>Tipe dominan utama:</b> <span style="color:#008061">${most.dominan.join(' & ')}</span> 
        dengan tekanan terbesar pada <span style="color:#de9000">${least.dominan.join(' & ')}</span>
      </div>
      <div style="margin-top:12px;line-height:1.6;">
        ${namaPanggilan()} adalah individu yang 
        ${[
          most.dominan.includes('D') ? 'tegas dan berorientasi hasil' : '',
          most.dominan.includes('I') ? 'komunikatif dan persuasif' : '',
          most.dominan.includes('S') ? 'stabil dan dapat diandalkan' : '',
          most.dominan.includes('C') ? 'analitis dan teliti' : ''
        ].filter(Boolean).join(', ')}.
        Dalam lingkungan kerja, Anda akan berkembang di peran yang memberikan 
        ${[
          most.dominan.includes('D') ? 'tanggung jawab dan otoritas' : '',
          most.dominan.includes('I') ? 'kesempatan interaksi sosial' : '',
          most.dominan.includes('S') ? 'stabilitas dan rutinitas' : '',
          most.dominan.includes('C') ? 'ruang analisis mendalam' : ''
        ].filter(Boolean).join(', ')}.
      </div>
    </div>
  </div>
`;

  }

  // OUTPUT HTML
  document.getElementById('app').innerHTML = `
  <div class="card" style="max-width:780px;margin:34px auto 0 auto;padding:32px 32px 38px 32px;border-radius:18px;box-shadow:0 6px 32px #9992;">
    <h2 style="text-align:center;font-size:2em">
      Hasil DISC ${appState.identity?.nickname ? appState.identity.nickname : 'Anda'}
    </h2>
    ${isInvalid ? `
      <div style="margin:14px auto 22px auto;max-width:500px;background:#fee2e2;color:#c00;border-radius:12px;padding:19px 18px 17px 18px;font-size:1.16em;text-align:center;font-weight:600;box-shadow:0 2px 10px #fbb;">
        HASIL INVALID<br>
        <div style="margin:6px 0 0 0; font-weight:400; color:#a33; font-size:.99em;">
          (Terdeteksi pola pengisian jawaban yang tidak wajar, silakan ulangi tes.)
        </div>
        <div style="margin-top:13px; font-weight:500; color:#b11; font-size:.97em;">
          <b>Catatan Penting:</b><br>
          Hasil tes DISC Anda tidak dapat dianalisis karena pola pengisian yang terlalu seragam atau tidak konsisten.<br><br>
          Untuk hasil yang akurat dan bermanfaat, <b>jawablah seluruh pertanyaan sesuai kepribadian asli Anda</b> — bukan sekadar menyesuaikan harapan atasan atau lingkungan.<br><br>
          <i>Isi sejujur mungkin, seperti Anda dalam keseharian, bukan saat ingin mengesankan orang lain.</i>
        </div>
      </div>
    ` : ''}
    <div style="display:flex;gap:26px;justify-content:center;align-items:flex-end;margin:26px 0 18px 0;flex-wrap:wrap;">
      <div style="width:170px;height:420px;">
        <canvas id="discMost" width="170" height="420"></canvas>
        <div style="text-align:center;margin-top:6px;font-weight:600">
          Mask / Most (P)
          <div style="color:#677;font-size:0.97em;font-weight:400;">Perilaku utama, gaya diri saat nyaman/normal</div>
        </div>
      </div>
      <div style="width:170px;height:420px;">
        <canvas id="discLeast" width="170" height="420"></canvas>
        <div style="text-align:center;margin-top:6px;font-weight:600">
          Pressure / Least (K)
          <div style="color:#a98e24;font-size:0.97em;font-weight:400;">Perilaku saat tertekan/lingkungan sulit</div>
        </div>
      </div>
      <div style="width:170px;height:420px;">
        <canvas id="discChange" width="170" height="420"></canvas>
        <div style="text-align:center;margin-top:6px;font-weight:600">
          Self / Change (P-K)
          <div style="color:#148562;font-size:0.97em;font-weight:400;">Pola adaptasi antara nyaman dan tekanan</div>
        </div>
      </div>
    </div>
    <table style="margin:18px auto 0 auto;font-size:1.13em;min-width:370px;text-align:center;border-collapse:collapse;">
      <tr style="background:#f8fafb;font-weight:bold">
        <th style="padding:5px 18px">Line</th>
        <th style="padding:5px 14px">D</th>
        <th style="padding:5px 14px">I</th>
        <th style="padding:5px 14px">S</th>
        <th style="padding:5px 14px">C</th>
        <th style="padding:5px 8px;color:#999;">*</th>
        <th style="padding:5px 12px;color:#d00;">Total</th>
      </tr>
      <tr>
        <td><b>Most (P)</b></td>
        <td>${hasilDISC.most.D || 0}</td>
        <td>${hasilDISC.most.I || 0}</td>
        <td>${hasilDISC.most.S || 0}</td>
        <td>${hasilDISC.most.C || 0}</td>
        <td style="color:#999;">${hasilDISC.most['*'] || 0}</td>
        <td style="color:#d00;font-weight:600;">
          ${(hasilDISC.most.D||0)+(hasilDISC.most.I||0)+(hasilDISC.most.S||0)+(hasilDISC.most.C||0)+(hasilDISC.most['*']||0)}
        </td>
      </tr>
      <tr>
        <td><b>Least (K)</b></td>
        <td>${hasilDISC.least.D || 0}</td>
        <td>${hasilDISC.least.I || 0}</td>
        <td>${hasilDISC.least.S || 0}</td>
        <td>${hasilDISC.least.C || 0}</td>
        <td style="color:#999;">${hasilDISC.least['*'] || 0}</td>
        <td style="color:#d00;font-weight:600;">
          ${(hasilDISC.least.D||0)+(hasilDISC.least.I||0)+(hasilDISC.least.S||0)+(hasilDISC.least.C||0)+(hasilDISC.least['*']||0)}
        </td>
      </tr>
      <tr>
        <td><b>Change</b></td>
        <td>${hasilDISC.change.D >= 0 ? '+' : ''}${hasilDISC.change.D || 0}</td>
        <td>${hasilDISC.change.I >= 0 ? '+' : ''}${hasilDISC.change.I || 0}</td>
        <td>${hasilDISC.change.S >= 0 ? '+' : ''}${hasilDISC.change.S || 0}</td>
        <td>${hasilDISC.change.C >= 0 ? '+' : ''}${hasilDISC.change.C || 0}</td>
        <td style="background:#eee;">${hasilDISC.change['*'] >= 0 ? '+' : ''}${hasilDISC.change['*'] || 0}</td>
        <td style="color:#d00;">
          ${(hasilDISC.change.D||0)+(hasilDISC.change.I||0)+(hasilDISC.change.S||0)+(hasilDISC.change.C||0)+(hasilDISC.change['*']||0)}
        </td>
      </tr>
    </table>
    ${analisaHTML}
    <div style="margin-top:32px;text-align:center;">
      <button class="btn" onclick="renderHome()">Kembali ke Beranda</button>
    </div>
  </div>
`;

}

// ===================== DRAW DISC CLASSIC =====================
function drawDISCClassic(canvasOrId, tipe, D, I, S, C, warnaGaris = '#2176C7') {
  const canvas = (typeof canvasOrId === 'string' ? document.getElementById(canvasOrId) : canvasOrId);
  const ctx = canvas.getContext('2d');

  // Dimensi & konstanta layout
  const x0 = 12;            // margin kiri sumbu
  const w  = 128;           // lebar area grafik
  const top = 20;           // batas atas grafik
  const bottom = 400;       // batas bawah grafik
  const MIDLINE_Y = 200;    // garis tengah standar classicGraph

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // Grid horizontal konsisten dengan classicGraph: 20, 100, 200, 300, 400
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  [20, 100, 200, 300, 400].forEach(y => {
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x0 + w, y);
    ctx.stroke();
  });

  // Grid vertikal (tetap)
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(x0 + i * 32, top);
    ctx.lineTo(x0 + i * 32, bottom);
    ctx.stroke();
  }

  // Garis tengah yang tegas (putus-putus) di y = 200
  ctx.beginPath();
  ctx.setLineDash([6, 4]);
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#444';
  ctx.moveTo(x0, MIDLINE_Y);
  ctx.lineTo(x0 + w, MIDLINE_Y);
  ctx.stroke();
  ctx.setLineDash([]);

  // (Opsional) Label level 4/3/2/1 di sisi kiri
  ctx.fillStyle = '#6b7280';
  ctx.font = 'bold 10px Segoe UI';
  const levelLabels = [[20, '4'], [100, '3'], [200, '2'], [300, '1']];
  levelLabels.forEach(([y, t]) => {
    ctx.fillText(t, x0 - 10, y + 4);
  });

  // Titik X untuk D, I, S, C diset presisi, hindari magic numbers
  const xs = [x0 + 33, x0 + 65, x0 + 97, x0 + 129];

  // Hitung posisi Y berdasarkan mapping classicGraph → getPixelY
  const points = [
    [xs[0], getPixelY(tipe, 'D', D)],
    [xs[1], getPixelY(tipe, 'I', I)],
    [xs[2], getPixelY(tipe, 'S', S)],
    [xs[3], getPixelY(tipe, 'C', C)],
  ];

  // Gambar polyline
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.strokeStyle = warnaGaris;
  ctx.lineWidth = 2.7;
  ctx.stroke();

  // Titik & angka nilai
  const warnaTitik = ['#e74a3b', '#f6c23e', '#1cc88a', '#4e73df'];
  [D, I, S, C].forEach((v, idx) => {
    const [px, py] = points[idx];
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, 2 * Math.PI, false);
    ctx.fillStyle = warnaTitik[idx];
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.font = 'bold 13px Segoe UI';
    ctx.fillStyle = '#222';
    ctx.fillText(String(v), px - 7, py - 13);
  });

  // Label D I S C tepat di bawah masing-masing titik
  ctx.font = 'bold 14px Segoe UI';
  ctx.fillStyle = '#1a232e';
  ['D', 'I', 'S', 'C'].forEach((t, i) => {
    ctx.fillText(t, xs[i] - 6, 415);
  });

  ctx.restore();
}



function getFullDISCAnalysisHTML(hasilDISC, identity) {
  const most   = analisa2DominanDISC(hasilDISC.most.D, hasilDISC.most.I, hasilDISC.most.S, hasilDISC.most.C, 'most', getPixelY);
  const least  = analisa2DominanDISC(hasilDISC.least.D, hasilDISC.least.I, hasilDISC.least.S, hasilDISC.least.C, 'least', getPixelY);
  const change = analisa2DominanDISC(hasilDISC.change.D, hasilDISC.change.I, hasilDISC.change.S, hasilDISC.change.C, 'change', getPixelY);

  return `
Analisis Mask / Most (P):
Dominan utama: ${most.dominan.join(' & ')}
Urutan: ${most.ranking}
${most.deskripsi}
${most.analisaPola}

Analisis Pressure / Least (K):
Dominan utama: ${least.dominan.join(' & ')}
Urutan: ${least.ranking}
${least.deskripsi}

Analisis Self / Change (P-K):
Dominan utama: ${change.dominan.join(' & ')}
Urutan: ${change.ranking}
${change.deskripsi}
  `;
}

function stripHTML(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<ul>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<b>(.*?)<\/b>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/gm, '');
}


// ==================== PAPI Test ====================
function renderPAPIIntro() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <h2>${tests.PAPI.name}</h2>
      <p style="font-size:1.1em;color:#155;">${tests.PAPI.description}</p>
      <div style="margin:14px 0 24px 0;padding:13px 15px 13px 15px;background:#f5fafc;border-radius:10px;border:1.7px solid #b7dfff;">
        <b>Petunjuk Pengerjaan:</b><br>
        ${tests.PAPI.instruction}<br>
        <ul style="margin-top:8px;line-height:1.7;padding-left:18px;">
          <li>Setiap soal terdiri dari dua pernyataan, pilih salah satu yang paling sesuai dengan diri Anda.</li>
          <li>Tidak ada jawaban benar atau salah.</li>
          <li>Jawablah secara jujur dan spontan, jangan terlalu lama berpikir.</li>
          <li>Anda diberikan waktu <b>${Math.floor(tests.PAPI.time/60)} menit</b> untuk menyelesaikan seluruh soal.</li>
        </ul>
      </div>
      <div class="example-answer" style="margin:16px 0 20px 0;">
        <h4 style="margin-bottom:7px;">Contoh Soal:</h4>
        <p><b>Soal:</b> ${tests.PAPI.example.question}</p>
        <p><b>Pilihan A:</b> ${tests.PAPI.example.optionA}</p>
        <p><b>Pilihan B:</b> ${tests.PAPI.example.optionB}</p>
        <p style="color:#444;"><b>Penjelasan:</b> ${tests.PAPI.example.explanation}</p>
      </div>
      <div style="text-align:center;">
        <button class="btn" onclick="startPAPITest()">Mulai Tes PAPI</button>
        <button class="btn btn-outline" onclick="renderHome()">Kembali</button>
      </div>
    </div>
  `;
}

let timerInterval = null;

function startPAPITest() {
  appState.currentTest = 'PAPI';
  appState.currentQuestion = 0;
  appState.timeLeft = tests.PAPI.time;
  appState.answers.PAPI = [];
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    appState.timeLeft--;
    updateTimerDisplay();
    if (appState.timeLeft <= 0) {
      clearInterval(timerInterval);
      finishPAPITest();
    }
  }, 1000);
  renderPAPIQuestion();
}

function updateTimerDisplay() {
  const el = document.getElementById('timer-display');
  if (el) el.textContent = formatTime(Math.max(0, appState.timeLeft));
}

function finishPAPITest() {
  appState.completed.PAPI = true;
  renderPAPIThankYou();
}



function renderPAPIQuestion() { 
  const question = tests.PAPI.questions[appState.currentQuestion];
  const progress = calculateProgress();

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <!-- TIMER -->
      <div class="timer-container" style="text-align:right;margin-bottom:6px;">
        <span class="timer-icon" style="margin-right:5px;">⏱️</span>
        <span class="timer" id="timer-display" style="font-weight:bold;font-size:1.06em;">
          ${formatTime(appState.timeLeft)}
        </span>
      </div>
      <div class="progress-container">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <h2>${tests.PAPI.name}</h2>
      <p class="question-text">${question.text}</p>
      <div class="option-grid">
        <label class="option-box" onclick="selectPAPIAnswer(this, 'A')">
          <input type="radio" name="papi-answer" value="A">
          ${question.optionA}
          <span class="checkmark"></span>
        </label>
        <label class="option-box" onclick="selectPAPIAnswer(this, 'B')">
          <input type="radio" name="papi-answer" value="B">
          ${question.optionB}
          <span class="checkmark"></span>
        </label>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <button class="btn" onclick="nextPAPIQuestion()">
          ${appState.currentQuestion < tests.PAPI.questions.length - 1 ? 'Lanjut' : 'Selesai'}
        </button>
        <button class="btn btn-outline" onclick="confirmCancelTest()">
          Batalkan Tes
        </button>
      </div>
    </div>
  `;
  updateTimerDisplay();
  startTimer();
}

// Helper agar timer tampil "mm:ss"
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* ==================== Thank You Screen After PAPI (1 tombol, gaya IST) ==================== */
function renderPAPIThankYou() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card" style="
      max-width:820px;margin:34px auto;padding:32px 28px;border-radius:22px;
      background:linear-gradient(135deg,#f5fff8 86%,#e8fff1 100%);
      box-shadow:0 10px 34px #c7f4da55;border:1.6px solid #c8f1d6;text-align:center;">
      <div style="font-size:3rem;line-height:1;margin-bottom:10px;">🎉</div>
      <h2 style="margin:6px 0 8px 0;font-weight:900;color:#13693a;">
        Terima kasih! Tes PAPI Kostick sudah selesai
      </h2>
      <p style="font-size:1.08rem;color:#244;max-width:680px;margin:0 auto 16px auto;line-height:1.6;">
        Jawaban Anda untuk Tes <b>PAPI</b> telah tersimpan. Silakan lanjut mengerjakan tes lain yang Anda pilih.
        Tombol <b>Download PDF</b> akan aktif kembali setelah <b>semua</b> tes pilihan selesai dikerjakan.
      </p>

      <div style="display:flex;gap:12px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
        <button id="btnContinuePAPI" class="btn" style="
          padding:12px 24px;font-weight:800;border-radius:11px;
          background:#18a35d;color:#fff;border:0;box-shadow:0 4px 18px #bff1d7;">
          ✅ Lanjut Tes Berikutnya
        </button>
      </div>
    </div>
  `;

  // Aksi tombol: matikan guard tampilan tes lalu kembali ke Home
  const goNext = () => {
    window.__inTestView = false; // penting: biar renderHome nggak diblokir
    if (typeof window.renderHome === 'function') window.renderHome();
    setTimeout(() => {
      const el = document.getElementById('homeCard') || document.getElementById('downloadPDFBox');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };
  document.getElementById('btnContinuePAPI').onclick = goNext;
}




function selectPAPIAnswer(element, value) {
  // Remove previous selection
  document.querySelectorAll('.option-box').forEach(box => {
    box.classList.remove('selected');
  });
  
  // Add new selection
  element.classList.add('selected');
  element.querySelector('input').checked = true;
}

function nextPAPIQuestion() {
  const selectedOption = document.querySelector('input[name="papi-answer"]:checked');
  if (!selectedOption) return;

  const question = tests.PAPI.questions[appState.currentQuestion];
  if (!question) return;

  appState.answers.PAPI.push({
    id: question.id,
    answer: selectedOption.value,
    answerText: selectedOption.value === 'A' ? question.optionA : question.optionB
  });

  appState.currentQuestion++;

  if (appState.currentQuestion >= tests.PAPI.questions.length) {
    clearInterval(appState.timer);
    appState.completed.PAPI = true;

    // (opsional tapi disarankan) sinkronkan state tombol Download
    if (typeof window.updateDownloadButtonState === 'function') {
      window.updateDownloadButtonState();
    }

    // Simpan skor semua aspek ke appState
    appState.skorPAPIArahKerja    = skorPAPIArahKerja(appState.answers.PAPI);
    appState.skorPAPIKepemimpinan = skorPAPIKepemimpinan(appState.answers.PAPI);
    appState.skorPAPIAktivitas    = skorPAPIAktivitas(appState.answers.PAPI);
    appState.skorPAPIPergaulan    = skorPAPIPergaulan(appState.answers.PAPI);
    appState.skorPAPIGayaKerja    = skorPAPIGayaKerja(appState.answers.PAPI);
    appState.skorPAPISifat        = skorPAPISifat(appState.answers.PAPI);
    appState.skorPAPIKetaatan     = skorPAPIKetaatan(appState.answers.PAPI);

    renderPAPIThankYou();
  } else {
    renderPAPIQuestion();
  }
}



// ==================== Big Five Test (desain seragam + opsi cantik) ====================

// 1) INSTRUKSI AWAL Big Five
function renderBIGFIVEInstruction() {
  const app = document.getElementById('app');
  window.__inTestView = true; // guard: jangan mental ke Home saat tes
  app.innerHTML = `
    <div class="card" style="
      max-width:820px;margin:34px auto;padding:32px 28px;border-radius:22px;
      background:linear-gradient(135deg,#f5fff8 86%,#e8fff1 100%);
      box-shadow:0 10px 34px #c7f4da55;border:1.6px solid #c8f1d6;">
      <h2 style="margin:0 0 8px 0;font-weight:900;color:#13693a;text-align:center;">
        ${tests.BIGFIVE.name}
      </h2>
      <p style="color:#244;max-width:700px;margin:10px auto 6px auto;line-height:1.6;text-align:center;">
        ${tests.BIGFIVE.description || ""}
      </p>
      <div style="margin:18px 0 0 0;color:#244;line-height:1.65;">
        <div style="font-weight:700;margin-bottom:6px;">Instruksi:</div>
        <div>${tests.BIGFIVE.instruction}</div>
      </div>
      <div style="
        margin:18px 0 0 0;padding:14px 16px;border-radius:14px;
        background:#ffffff;box-shadow:0 4px 18px #d8f1e55c;border:1px solid #d7efe3;">
        <div style="font-weight:800;color:#115b36;margin-bottom:8px;">Contoh</div>
        <div style="color:#234;">
          <div><b>Pernyataan:</b> ${tests.BIGFIVE.example.question}</div>
          <div><b>Skala:</b> 1 (Sangat Tidak Sesuai) – 5 (Sangat Sesuai)</div>
          <div style="opacity:.95;"><b>Penjelasan:</b> ${tests.BIGFIVE.example.explanation}</div>
        </div>
      </div>

      <div style="text-align:center;margin-top:26px;">
        <button class="btn" onclick="startBIGFIVEQuestions()" style="
          padding:12px 26px;font-weight:800;border-radius:11px;
          background:#18a35d;color:#fff;border:0;box-shadow:0 4px 18px #bff1d7;">Mulai Tes</button>
        <button class="btn btn-outline" onclick="(window.__inTestView=false, renderHome())" style="
          margin-left:8px;padding:12px 22px;border-radius:11px;">Kembali</button>
      </div>
    </div>
  `;
}

// 2) MULAI PERTANYAAN
function startBIGFIVEQuestions() {
  window.__inTestView = true;
  appState.timeLeft = tests.BIGFIVE.time;
  appState.currentQuestion = 0;
  if (!appState.answers.BIGFIVE) appState.answers.BIGFIVE = [];
  renderBIGFIVEQuestion();
}

// 3) RENDER SOAL
// 3) RENDER SOAL (palet PAPI: biru lembut)
function renderBIGFIVEQuestion() {
  const qIndex   = appState.currentQuestion;
  const total    = tests.BIGFIVE.questions.length;
  const question = tests.BIGFIVE.questions[qIndex];
  const progress = Math.min(100, Math.max(0, ((qIndex) / total) * 100));
  const prevAnswer = (appState.answers.BIGFIVE || [])[qIndex] || 0;

  // Sisipkan style sekali: palet PAPI (biru)
  if (!document.getElementById('bigfiveStyles')) {
    const style = document.createElement('style');
    style.id = 'bigfiveStyles';
    style.textContent = `
      /* —— Palet PAPI —— */
      :root {
        --papi-blue: #2c7be5;
        --papi-blue-2: #1e88e5;
        --papi-border: #b7dfff;
        --papi-bg: #f5fafc;
        --papi-shadow: 0 4px 18px rgba(44,123,229,0.10);
        --text-main: #155;
        --text-sec: #345;
      }

      .likert-wrap { margin-top:10px; }
      .likert-ends {
        display:flex; justify-content:space-between; font-size:.98rem;
        color:var(--text-main); margin-bottom:8px;
      }
      .bigfive-options { display:grid; grid-template-columns: repeat(5, 1fr); gap:12px; }

      .bigfive-option {
        position:relative; background:var(--papi-bg); border:1.7px solid var(--papi-border);
        border-radius:14px; padding:14px 10px; text-align:center; cursor:pointer; user-select:none;
        box-shadow: var(--papi-shadow);
        transition:transform .06s ease, box-shadow .15s ease, border-color .15s ease, background .15s ease;
        color:var(--text-sec);
      }
      .bigfive-option:hover {
        transform:translateY(-1px);
        box-shadow:0 8px 20px rgba(44,123,229,.14);
        border-color:#8dc9ff;
        background:#f0f7ff;
      }
      .bigfive-option.selected {
        border-color:var(--papi-blue);
        box-shadow:0 10px 22px rgba(44,123,229,.18);
        background:linear-gradient(135deg,#f0f7ff 80%,#e6f2ff 100%);
        color:#123a66;
      }
      .bigfive-option input[type="radio"] { position:absolute; inset:0; opacity:0; pointer-events:none; }

      .bigfive-badge {
        width:34px; height:34px; line-height:34px; border-radius:50%;
        border:2px solid var(--papi-blue); margin:0 auto 8px auto; font-weight:800; color:#1b4f8f;
      }
      .bigfive-sub { font-size:.85rem; color:#2a4a6a; opacity:.98; }

      .chip-time {
        display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px;
        background:#ffffff; border:1.7px solid var(--papi-border);
        box-shadow: var(--papi-shadow); font-weight:700; color:#1b4f8f;
      }
      .progress-container { width:100%; height:10px; background:#eaf3ff; border-radius:999px; margin:12px 0 20px 0; overflow:hidden; }
      .progress-bar { height:100%; background:linear-gradient(90deg,var(--papi-blue),#9ec8ff); width:0%; transition:width .25s ease; }

      .question-box {
        background:var(--papi-bg); border:1.7px solid var(--papi-border); border-radius:16px; padding:16px 18px;
        box-shadow: var(--papi-shadow); color:#223; line-height:1.6;
      }
      .bf-actions .btn { margin:0 6px; }
    `;
    document.head.appendChild(style);
  }

  const scaleLabels = ['Sangat Tidak Sesuai', 'Tidak Sesuai', 'Netral', 'Sesuai', 'Sangat Sesuai'];
  const optionsHTML = [1,2,3,4,5].map(i => `
    <div class="bigfive-option${prevAnswer === i ? ' selected' : ''}" onclick="selectBIGFIVEAnswer(this, ${i})" tabindex="0" role="radio" aria-checked="${prevAnswer===i}">
      <input type="radio" name="bigfive-answer" value="${i}" ${prevAnswer === i ? 'checked' : ''}>
      <div class="bigfive-badge">${i}</div>
      <div class="bigfive-sub">${scaleLabels[i-1]}</div>
    </div>
  `).join('');

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card" style="
      max-width:900px;margin:28px auto;padding:24px 24px 28px;border-radius:22px;
      background:#ffffff; border:1.7px solid var(--papi-border); box-shadow:0 10px 34px rgba(44,123,229,.08);">

      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <div class="chip-time">
          <span>⏱️</span>
          <span id="timer-display">${formatTime(appState.timeLeft)}</span>
        </div>
        <div style="font-weight:800;color:#1b4f8f;">
          Pernyataan ${qIndex + 1} / ${total}
        </div>
      </div>

      <div class="progress-container"><div class="progress-bar" style="width:${progress}%"></div></div>

      <h2 style="margin:0 0 6px 0;font-weight:900;color:#1e5faf;">${tests.BIGFIVE.name}</h2>
      <p style="margin:0 0 14px 0;color:#155;">${tests.BIGFIVE.description || ''}</p>

      <div class="question-box">
        <div class="question-text" style="font-size:1.12rem; color:#123a66;"><b>${question.text}</b></div>
        <div class="likert-wrap">
          <div class="likert-ends">
            <span>Sangat Tidak Sesuai</span>
            <span>Sangat Sesuai</span>
          </div>
          <div class="bigfive-options">${optionsHTML}</div>
        </div>
      </div>

      <div class="bf-actions" style="text-align:center;margin-top:24px;">
        <button class="btn" onclick="nextBIGFIVEQuestion()" style="
          padding:12px 24px;font-weight:800;border-radius:11px;">
          ${qIndex < total - 1 ? 'Lanjut' : 'Selesai'}
        </button>
        <button class="btn btn-outline" onclick="confirmCancelTest()" style="
          padding:12px 20px;border-radius:11px;">
          Batalkan Tes
        </button>
      </div>
    </div>
  `;

  // keyboard: 1..5 untuk pilih, Enter untuk lanjut
  if (window.__bfKeyHandler) { window.removeEventListener('keydown', window.__bfKeyHandler); }
  window.__bfKeyHandler = (e) => {
    if (e.key >= '1' && e.key <= '5') {
      const val = parseInt(e.key,10);
      const nodes = document.querySelectorAll('.bigfive-option');
      if (nodes[val-1]) nodes[val-1].click();
    } else if (e.key === 'Enter') {
      nextBIGFIVEQuestion();
    }
  };
  window.addEventListener('keydown', window.__bfKeyHandler);

  updateTimerDisplay();
  startBIGFIVETimer();
}


// 4) TIMER Big Five
function startBIGFIVETimer() {
  if (appState.timer) clearInterval(appState.timer);
  appState.timer = setInterval(() => {
    appState.timeLeft--;
    updateTimerDisplay();
    if (appState.timeLeft <= 0) {
      clearInterval(appState.timer);
      appState.completed.BIGFIVE = true;
      // hitung hasil bila perlu
      appState.hasilOCEAN = koreksiBigFive(appState.answers.BIGFIVE || [], tests.BIGFIVE.questions);
      renderBIGFIVEThankYou(); // jangan auto Home; konsisten dengan flow lain
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('timer-display');
  if (el) el.textContent = formatTime(Math.max(0, appState.timeLeft));
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// 5) PILIH JAWABAN
function selectBIGFIVEAnswer(element, value) {
  document.querySelectorAll('.bigfive-option').forEach(opt => {
    opt.classList.remove('selected');
    const inp = opt.querySelector('input[type="radio"]');
    if (inp) inp.checked = false;
  });
  element.classList.add('selected');
  const input = element.querySelector('input[type="radio"]');
  if (input) input.checked = true;
  if (!appState.answers.BIGFIVE) appState.answers.BIGFIVE = [];
  appState.answers.BIGFIVE[appState.currentQuestion] = value;
}

// 6) LANJUT / SELESAI
function nextBIGFIVEQuestion() {
  const selected = document.querySelector('input[name="bigfive-answer"]:checked');
  if (!selected) { alert('Harap pilih salah satu skala penilaian!'); return; }

  appState.currentQuestion++;

  if (appState.currentQuestion >= tests.BIGFIVE.questions.length) {
    if (appState.timer) clearInterval(appState.timer);
    appState.completed.BIGFIVE = true;
    appState.hasilOCEAN = koreksiBigFive(appState.answers.BIGFIVE || [], tests.BIGFIVE.questions);
    renderBIGFIVEThankYou();
  } else {
    renderBIGFIVEQuestion();
  }
}

// 7) THANK YOU (gaya seragam, 1 tombol)
function renderBIGFIVEThankYou() {
  // tandai selesai (jaga-jaga)
  if (typeof window.markTestCompleted === 'function') {
    markTestCompleted('BIGFIVE');
  } else {
    appState.completed = appState.completed || {};
    appState.completed.BIGFIVE = true;
    try {
      const saved = JSON.parse(localStorage.getItem('completed') || '{}');
      saved.BIGFIVE = true;
      localStorage.setItem('completed', JSON.stringify(saved));
    } catch {}
    if (typeof window.updateDownloadButtonState === 'function') {
      window.updateDownloadButtonState();
    }
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card" style="
      max-width:820px;margin:34px auto;padding:32px 28px;border-radius:22px;
      background:linear-gradient(135deg,#f5fff8 86%,#e8fff1 100%);
      box-shadow:0 10px 34px #c7f4da55;border:1.6px solid #c8f1d6;text-align:center;">
      <div style="font-size:3rem;line-height:1;margin-bottom:10px;">🎉</div>
      <h2 style="margin:6px 0 8px 0;font-weight:900;color:#13693a;">
        Terima kasih! Tes Big Five sudah selesai
      </h2>
      <p style="font-size:1.08rem;color:#244;max-width:700px;margin:0 auto 16px auto;line-height:1.6;">
        Jawaban Anda telah tersimpan. Silakan lanjut mengerjakan tes lain yang Anda pilih.
        Tombol <b>Download PDF</b> akan aktif kembali setelah <b>semua</b> tes pilihan selesai dikerjakan.
      </p>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
        <button id="btnContinueBIGFIVE" class="btn" style="
          padding:12px 24px;font-weight:800;border-radius:11px;
          background:#18a35d;color:#fff;border:0;box-shadow:0 4px 18px #bff1d7;">
          ✅ Lanjut Tes Berikutnya
        </button>
      </div>
    </div>
  `;

  const goNext = () => {
    window.__inTestView = false; // izinkan kembali ke Home
    if (typeof window.renderHome === 'function') window.renderHome();
    setTimeout(() => {
      const el = document.getElementById('homeCard') || document.getElementById('downloadPDFBox');
      if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 200);
  };
  document.getElementById('btnContinueBIGFIVE').onclick = goNext;

  // Lepas handler keyboard
  if (window.__bfKeyHandler) {
    window.removeEventListener('keydown', window.__bfKeyHandler);
    window.__bfKeyHandler = null;
  }
}

//=====================GRAFIS=====================
function renderGrafisUpload() {
  const subtests = [
    {
      key: "orang",
      kode: "DAP",
      title: "Tes DAP (Draw A Person): Gambar Orang",
      alat: `
        <ul style="margin-left:16px;">
          <li>Siapkan <b>pensil HB/2B</b> &amp; <b>kertas A4</b> polos.</li>
          <li>Posisi kertas <b>potrait/berdiri</b> (vertical).</li>
        </ul>
      `,
      instruksi: `
        <ol style="margin-left:20px;">
          <li>Gambarlah satu <b>orang lengkap</b> (kepala sampai kaki) di tengah kertas.</li>
          <li>Detailkan wajah, rambut, pakaian, dan anggota tubuh.</li>
          <li>Bebas memilih laki-laki/perempuan dan posisi/aktivitas.</li>
          <li>Pakai pensil HB/2B di kertas putih polos.</li>
           <li>Jika sudah, di halaman yang sama, tuliskan nama dan usia orang yang Anda gambar.</li>
        </ol>
      `,
      contoh: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkQN708-vQz0R7uuwehFFlbEJDRzsHT9mhEw&s"
    },
    {
      key: "rumah",
      kode: "HTP",
      title: "Tes HTP (House-Tree-Person): Gambar Rumah, Pohon, dan Orang",
      alat: `
        <ul style="margin-left:16px;">
          <li>Siapkan <b>pensil HB/2B</b> &amp; <b>kertas A4</b> polos.</li>
          <li>Posisi kertas <b>landscape/tidur</b> (horizontal).</li>
        </ul>
      `,
      instruksi: `
        <ol style="margin-left:20px;">
          <li>Gambarlah <b>rumah, pohon, dan orang</b> di tengah kertas polos.</li>
           <li>Bebas bentuk/model rumah.</li>
          <li>Jika sudah, deskripsikan gambar tersebut di halaman yang sama.</li>
         
          <li>Pakai pensil HB/2B di kertas putih polos.</li>
        </ol>
      `,
      contoh: "https://tse2.mm.bing.net/th/id/OIP.98wasfICBNXXEoaGoC1l5gAAAA?pid=Api&P=0&h=180"
    },
    {
      key: "pohon",
      kode: "BAUM",
      title: "Tes BAUM (Tree Drawing Test): Gambar Pohon",
      alat: `
        <ul style="margin-left:16px;">
          <li>Siapkan <b>pensil HB/2B</b> &amp; <b>kertas A4</b> polos.</li>
          <li>Posisi kertas <b>potrait/berdiri</b> (vertical).</li>
        </ul>
      `,
      instruksi: `
        <ol style="margin-left:20px;">
          <li>Gambarlah <b>pohon lengkap</b> di tengah kertas polos.</li>
          <li>Detailkan akar, batang, cabang, dan daun.</li>
          <li>Bebas pilih jenis pohon apapun.</li>
          <li>Jika sudah, tuiskan pohon apa yang Anda gambar.</li>
          <li>Pakai pensil HB/2B di kertas putih polos.</li>
        </ol>
      `,
      contoh: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi5LeXM9AL4dNiCt0UfWv1XRGFsSrHEqwbL9rzM8odSOjVZRRVLgFf7rap6yJmjpvhaHosA3ITPgJv-KEe3tc-Aan9qJ-3tB6MuHgbsHesZjXkjenn1fuL8QhW5bWqzyNhoeSjhwBZw0RgL/s400/pohon-pepaya-contoh-gambar-mewarnai-di-beringin.gif"
    }
  ];

  if (!appState.grafis) appState.grafis = {};
  appState.completed.GRAFIS = false;

  let slideIndex = -1; // MULAI DARI -1, slide pertama = persiapan 3 kertas A4
  let timer = null;
  let timeLeft = 600;
  let tahap = "persiapan";

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const d = ("0" + (s % 60)).slice(-2);
    return `${m}:${d}`;
  }

  function playTimeoutSound() {
    try {
      const audio = new Audio('https://cdn.jsdelivr.net/gh/Pragas123/assets@main/time%20up.mp3');
      audio.volume = 0.87;
      audio.play();
    } catch {}
  }

  function nextOrUploadSlide(idx) {
    if (idx < subtests.length - 1) {
      renderGrafisSlide(idx + 1, "persiapan");
    } else {
      renderUploadSlide();
    }
  }

 /* ==================== STYLE SEKALI (palet PAPI/IST) ==================== */
function ensureGrafisStyles() {
  if (document.getElementById('grafisStyles')) return;
  const style = document.createElement('style');
  style.id = 'grafisStyles';
  style.textContent = `
    :root{
      --blue:#2c7be5; --blue2:#1e88e5; --blue-bg:#f4faff; --blue-br:#b7dfff;
      --green:#18a35d; --green2:#0f8a4b; --green-bg:#f5fff8; --green-br:#c8f1d6;
      --ink:#123a66; --text:#244;
      --softshadow:0 10px 34px rgba(44,123,229,.10);
    }
    .card.grafis {
      max-width: 920px; margin: 34px auto; padding: 26px 24px 30px;
      border-radius: 22px; background: #fff; border: 1.7px solid var(--blue-br);
      box-shadow: var(--softshadow);
    }
    .header h2 {
      margin: 0 0 10px 0; font-weight: 900; color: #1e5faf;
      text-shadow: 0 1px 8px #e1efff77;
    }
    .info-box {
      background: var(--blue-bg); border: 1.7px solid var(--blue-br);
      border-radius: 12px; padding: 14px 16px; box-shadow: 0 4px 18px rgba(44,123,229,.08);
      color: var(--text);
    }
    .warn-box {
      background: #fffbe8; border: 1.7px solid #ffe066;
      border-radius: 12px; padding: 14px 16px; color: #6b5a05;
    }
    .timer-chip {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 12px; border-radius: 999px; background: #fff;
      border: 1.7px solid var(--blue-br); font-weight: 800; color: #1b4f8f;
      box-shadow: 0 4px 18px rgba(44,123,229,.08);
    }
    .dz {
      border: 2.2px dashed #73aeea; border-radius: 14px; padding: 20px;
      background: #f8fcff; text-align: center; cursor: pointer; color: #359;
      transition: background .15s, transform .06s, box-shadow .15s;
      box-shadow: 0 4px 18px rgba(44,123,229,.05);
    }
    .dz:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(44,123,229,.10); }
    .preview-thumb {
      max-width: 140px; max-height: 140px; border: 2.2px solid #e6f0ff;
      border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,.06);
    }
    .btn.green {
      background: var(--green); color: #fff; border: 0; font-weight: 800;
      padding: 12px 24px; border-radius: 11px; box-shadow: 0 4px 18px #bff1d7;
    }
    .btn.green:hover { background: var(--green2); }
    /* Thank-you layout seragam */
    .thank-card {
      max-width:820px;margin:34px auto;padding:32px 28px;border-radius:22px;
      background:linear-gradient(135deg,var(--green-bg) 86%,#e8fff1 100%);
      box-shadow:0 10px 34px #c7f4da55;border:1.6px solid var(--green-br);text-align:center;
    }
  `;
  document.head.appendChild(style);
}

/* ==================== SLIDE 0: PERSIAPAN 3 KERTAS & PENSIL ==================== */
function renderPersiapanSlide() {
  ensureGrafisStyles();
  if (timer) clearInterval(timer);
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card grafis">
      <div class="header"><h2>🎨 Persiapan Tes Grafis</h2></div>
      <div style="max-width:640px;margin:0 auto;">
        <div class="warn-box" style="margin-bottom:14px;">
          <b>Siapkan terlebih dahulu:</b>
          <ul style="margin:6px 0 0 18px; line-height:1.6;">
            <li><b>3 lembar kertas A4 polos</b> (tidak bergaris/bergambar)</li>
            <li><b>Pensil HB/2B</b></li>
            <li><b>HP untuk foto</b> hasil gambar</li>
          </ul>
        </div>

        <div class="info-box" style="margin-bottom:14px;">
          <b>Cara upload gambar paling mudah:</b>
          <ol style="margin:6px 0 0 18px; line-height:1.6;">
            <li>Foto hasil gambar dengan HP.</li>
            <li>Kirim fotonya ke <b>chat WhatsApp diri sendiri</b>.</li>
            <li>Buka <a href="https://web.whatsapp.com" target="_blank" style="color:#0b72b9;font-weight:800;text-decoration:underline;">web.whatsapp.com</a> di komputer/laptop.</li>
            <li>Drag gambar dari WA Web ke komputer, lalu upload di halaman ini.</li>
          </ol>
          <div style="margin-top:8px;color:#158600;font-weight:700;">Tips: WA Web mempermudah akses & upload gambar.</div>
        </div>

        <div class="warn-box" style="color:#b74a00;">
          <b>PENTING:</b> Ikuti waktu tiap tahap. Jika terlambat, halaman upload bisa tertutup otomatis.
        </div>

        <div style="text-align:center;margin-top:18px;">
          <button class="btn green" id="btnSiapSemua">Saya sudah siap</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('btnSiapSemua').onclick = () => {
    renderGrafisSlide(0, "persiapan");
  };
}

/* ==================== SLIDE GRAFIS (DAP / HTP / BAUM) ==================== */
function renderGrafisSlide(idx, step = "persiapan") {
  ensureGrafisStyles();
  if (timer) clearInterval(timer);
  tahap = step;
  timeLeft = 600;
  const subtest = subtests[idx];
  const app = document.getElementById('app');
  window.appState = window.appState || {};
  appState.grafis = appState.grafis || {};

  // ——— PERSIAPAN PER SUBTEST ———
  if (step === "persiapan") {
    app.innerHTML = `
      <div class="card grafis">
        <div class="header"><h2>${subtest.title}</h2></div>
        <div style="max-width:640px;margin:0 auto;">
          <div class="warn-box" style="margin-bottom:12px;">
            <b>Instruksi Persiapan:</b><br>${subtest.alat}
            <div style="margin-top:10px;color:#b74a00;"><b>Pastikan alat siap sebelum mulai!</b></div>
          </div>
          <div style="text-align:center;margin-top:12px;">
            <button class="btn green" id="btnSiap">Saya sudah siap</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('btnSiap').onclick = () => renderGrafisSlide(idx, "gambar");
    return;
  }

  // ——— TAHAP MENGGAMBAR ———
  if (step === "gambar") {
    app.innerHTML = `
      <div class="card grafis">
        <div class="header"><h2>${subtest.title}</h2></div>
        <div style="max-width:700px;margin:0 auto;">
          <div class="info-box" style="margin-bottom:14px;">${subtest.instruksi}</div>

          <div id="areaTimer" style="text-align:center;margin-bottom:14px;">
            <span class="timer-chip">⏱️ <span id="timerGrafis">${formatTime(timeLeft)}</span></span>
            <button class="btn green" id="btnSelesaiGambar" style="margin-left:12px;">Selesai</button>
          </div>
        </div>
      </div>
    `;
    timer = setInterval(() => {
      timeLeft--;
      const t = document.getElementById('timerGrafis');
      if (t) t.textContent = formatTime(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
        if (typeof playTimeoutSound === 'function') playTimeoutSound();
        renderGrafisSlide(idx, "foto");
      }
    }, 1000);
    document.getElementById('btnSelesaiGambar').onclick = function () {
      if (timer) clearInterval(timer);
      renderGrafisSlide(idx, "foto");
    };
    return;
  }

  // ——— TAHAP FOTO & UPLOAD ———
  if (step === "foto") {
    timeLeft = 300;
    app.innerHTML = `
      <div class="card grafis">
        <div class="header"><h2>${subtest.title}</h2></div>
        <div style="max-width:720px;margin:0 auto;">
          <div class="info-box" style="margin-bottom:12px;">
            <b>Instruksi:</b>
            <ul style="margin:6px 0 0 18px; line-height:1.6;">
              <li>Foto hasil gambar sejelas mungkin, tidak buram/gelap.</li>
              <li>Pastikan seluruh gambar masuk dalam foto.</li>
              <li><b>Upload dengan klik/drag file ke area di bawah.</b></li>
            </ul>
            <div style="margin-top:8px;color:#e87c00;">
              Sisa waktu upload: <b><span id="timerFoto">${formatTime(timeLeft)}</span></b>
            </div>
          </div>

          <div style="text-align:center;margin:10px 0 14px;">
            <div style="margin-bottom:8px;font-size:1.02rem;color:#1a457a;font-weight:700;">Contoh hasil gambar</div>
            <img src="${subtest.contoh}" alt="Contoh" style="max-width:240px;max-height:240px;border-radius:16px;border:2.5px solid #0d67a2;box-shadow:0 6px 24px #2394e026;">
          </div>

          <div class="dz" id="dropZone">
            <input type="file" accept="image/*" id="uploadGambar" style="display:none;" />
            <div id="dropMsg"><b>Klik di sini</b> atau <b>drag & drop</b> file gambar</div>
            <div id="previewGambar" style="margin-top:12px;"></div>
          </div>

          <div style="text-align:center;margin-top:18px;">
            <button class="btn green" id="btnNextGrafis" disabled>Lanjut</button>
          </div>
        </div>
      </div>
    `;
    timer = setInterval(() => {
      timeLeft--;
      const tf = document.getElementById('timerFoto');
      if (tf) tf.textContent = formatTime(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
        if (typeof playTimeoutSound === 'function') playTimeoutSound();
        nextOrUploadSlide(idx);
      }
    }, 1000);

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('uploadGambar');
    const btnNext = document.getElementById('btnNextGrafis');
    const dropMsg = document.getElementById('dropMsg');
    const preview = document.getElementById('previewGambar');

    dropZone.onclick = () => fileInput.click();
    dropZone.ondragover = e => { e.preventDefault(); dropZone.style.background = "#e3f4ff"; };
    dropZone.ondragleave = e => { e.preventDefault(); dropZone.style.background = "#f8fcff"; };
    dropZone.ondrop = e => {
      e.preventDefault(); dropZone.style.background = "#f8fcff";
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
      }
    };
    fileInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (ev) {
        preview.innerHTML = `<img src="${ev.target.result}" class="preview-thumb" />`;
        appState.grafis[subtest.key] = ev.target.result;
        btnNext.disabled = false;
        dropMsg.style.color = "#188c3a";
        dropMsg.innerHTML = "✅ File berhasil diunggah!";
      };
      reader.readAsDataURL(file);
    });
    btnNext.onclick = function () {
      if (timer) clearInterval(timer);
      nextOrUploadSlide(idx);
    };
    return;
  }
}

/* ==================== NEXT ATAU FINISH (helper) ==================== */
function nextOrUploadSlide(idx) {
  if (idx < subtests.length - 1) {
    renderGrafisSlide(idx + 1, "persiapan");
  } else {
    renderUploadSlide();
  }
}

/* ==================== SLIDE FINAL (semua gambar sudah) ==================== */
function renderUploadSlide() {
  ensureGrafisStyles();
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card grafis">
      <div class="header"><h2>Semua Tes Gambar Selesai!</h2></div>
      <div style="max-width:640px;margin:0 auto;">
        <div class="info-box" style="background:var(--green-bg);border-color:var(--green-br);">
          <b>Semua gambar berhasil diunggah.</b><br>
          Klik <b>Selesai</b> untuk melanjutkan ke tes berikutnya.
        </div>
        <div style="text-align:center;margin-top:18px;">
          <button class="btn green" id="btnFinishGrafis" style="padding:12px 36px;">Selesai</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('btnFinishGrafis').onclick = function () {
    // jangan langsung ke home — tampilkan ucapan terima kasih seragam dulu
    renderGrafisThankYou();
    // scroll ke bawah biar terlihat
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 150);
  };
}

/* ==================== THANK YOU (seragam seperti tes lain) ==================== */
function renderGrafisThankYou() {
  ensureGrafisStyles();
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="thank-card">
      <div style="font-size:3rem;line-height:1;margin-bottom:10px;">🎉</div>
      <h2 style="margin:6px 0 8px 0;font-weight:900;color:#13693a;">
        Terima kasih! Tes Grafis sudah selesai
      </h2>
      <p style="font-size:1.08rem;color:#244;max-width:680px;margin:0 auto 16px auto;line-height:1.6;">
        Semua gambar Anda telah tersimpan. Silakan lanjut mengerjakan tes lain yang Anda pilih.
        Tombol <b>Download PDF</b> akan aktif kembali setelah <b>seluruh</b> tes pilihan selesai.
      </p>

      <div style="display:flex;gap:12px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
        <button id="btnContinueGrafis" class="btn green">✅ Lanjut Tes Berikutnya</button>
      </div>
    </div>
  `;

  document.getElementById('btnContinueGrafis').onclick = () => {
    window.appState = window.appState || {};
    appState.completed = appState.completed || {};
    appState.completed.GRAFIS = true;

    // sinkronkan tombol Download bila ada
    if (typeof window.updateDownloadButtonState === 'function') {
      window.updateDownloadButtonState();
    }
    if (typeof window.renderHome === 'function') {
      window.__inTestView = false; // longgar guard tampilan
      window.renderHome();
      setTimeout(() => {
        const el = document.getElementById('homeCard') || document.getElementById('downloadPDFBox');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  };
}

/* ==================== MULAI: slide persiapan umum ==================== */
renderPersiapanSlide();
}


// Contoh soal Tes Excel
const adminExcelQuestions = [
  {
    title: "Pengolahan Nilai (Google Spreadsheet)",
    description: `
      <b>Buatlah spreadsheet di <a href="https://sheets.new" target="_blank" rel="noopener noreferrer">Google Sheets</a>!</b>
      <ul style="margin-left:18px;">
        <li>Buat tabel berisi <b>Nama</b>, <b>Nilai UTS</b>, <b>Nilai UAS</b> untuk minimal 5 siswa.</li>
        <li>Tambahkan kolom <b>Nilai Akhir</b> yang merupakan rata-rata UTS dan UAS.</li>
        <li>Gunakan rumus di spreadsheet untuk menghitung rata-rata.</li>
        <li>Setelah selesai, klik menu <b>Bagikan (Share)</b> dan pastikan file dapat diakses oleh panitia (bisa set: "Siapa saja yang memiliki link dapat melihat").</li>
        <li>Salin <b>link Google Sheet</b> Anda dan tempelkan pada kolom di bawah ini.</li>
      </ul>
    `
  }
];



/* ==================== STYLE SERAGAM (sekali saja) ==================== */
function ensureExamStyles() {
  if (document.getElementById('examStyles')) return;
  const style = document.createElement('style');
  style.id = 'examStyles';
  style.textContent = `
    :root{
      --blue:#2c7be5; --blue2:#1e88e5; --blue-bg:#f4faff; --blue-br:#b7dfff;
      --green:#18a35d; --green2:#0f8a4b; --green-bg:#f5fff8; --green-br:#c8f1d6;
      --ink:#123a66; --text:#244;
      --softshadow:0 10px 34px rgba(44,123,229,.10);
    }
    .card.exam {
      max-width: 920px; margin: 34px auto; padding: 26px 24px 30px;
      border-radius: 22px; background: #fff; border: 1.7px solid var(--blue-br);
      box-shadow: var(--softshadow);
    }
    .exam .header h2 {
      margin: 0 0 10px 0; font-weight: 900; color: #1e5faf;
      text-shadow: 0 1px 8px #e1efff77;
    }
    .info-box {
      background: var(--blue-bg); border: 1.7px solid var(--blue-br);
      border-radius: 12px; padding: 14px 16px; box-shadow: 0 4px 18px rgba(44,123,229,.08);
      color: var(--text);
    }
    .warn-box {
      background: #fffbe8; border: 1.7px solid #ffe066;
      border-radius: 12px; padding: 14px 16px; color: #6b5a05;
    }
    .timer-chip {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 12px; border-radius: 999px; background: #fff;
      border: 1.7px solid var(--blue-br); font-weight: 800; color: #1b4f8f;
      box-shadow: 0 4px 18px rgba(44,123,229,.08);
    }
    .thank-card {
      max-width:820px;margin:34px auto;padding:32px 28px;border-radius:22px;
      background:linear-gradient(135deg,var(--green-bg) 86%,#e8fff1 100%);
      box-shadow:0 10px 34px #c7f4da55;border:1.6px solid var(--green-br);text-align:center;
    }
    .btn.green {
      background: var(--green); color: #fff; border: 0; font-weight: 800;
      padding: 12px 24px; border-radius: 11px; box-shadow: 0 4px 18px #bff1d7;
    }
    .btn.green:hover { background: var(--green2); }
    .input {
      width:100%;padding:10px;font-size:1.06em;border-radius:10px;border:1.7px solid var(--blue-br);
    }
    .hint { color:#197278; font-size:1em; }
    .hint.bad { color:#c62828; }
  `;
  document.head.appendChild(style);
}

/* ==================== THANK YOU (seragam) ==================== */
function renderExcelThankYou() {
  ensureExamStyles();
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="thank-card">
      <div style="font-size:3rem;line-height:1;margin-bottom:10px;">🎉</div>
      <h2 style="margin:6px 0 8px 0;font-weight:900;color:#13693a;">
        Terima kasih! Tes Excel sudah selesai
      </h2>
      <p style="font-size:1.08rem;color:#244;max-width:680px;margin:0 auto 16px auto;line-height:1.6;">
        Link Google Sheet Anda telah tersimpan. Silakan lanjut mengerjakan tes lain yang Anda pilih.
        Tombol <b>Download PDF</b> akan aktif kembali setelah <b>seluruh</b> tes pilihan selesai.
      </p>

      <div style="display:flex;gap:12px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
        <button id="btnContinueExcel" class="btn green">✅ Lanjut Tes Berikutnya</button>
      </div>
    </div>
  `;

  document.getElementById('btnContinueExcel').onclick = () => {
    window.appState = window.appState || {};
    appState.completed = appState.completed || {};
    appState.completed.EXCEL = true;

    if (typeof window.updateDownloadButtonState === 'function') {
      window.updateDownloadButtonState();
    }
    if (typeof window.renderHome === 'function') {
      window.__inTestView = false;
      window.renderHome();
      setTimeout(() => {
        const el = document.getElementById('homeCard') || document.getElementById('downloadPDFBox');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  };
}

/* ==================== TES EXCEL (Google Sheet) ==================== */
function renderAdminExcelSheet() {
  ensureExamStyles();

  let timeLeft = 40 * 60; // 40 menit (ubah angka menit di sini bila perlu)
  let timerInterval;
  let sudahStart = false;
  let ttsPlayed10M = false;
  let ttsPlayed30Dtk = false;

  window.appState = window.appState || {};
  appState.adminAnswers = appState.adminAnswers || {};

  const timerStr = Math.floor(timeLeft / 60).toString().padStart(2, '0') + ':00';

  document.getElementById('app').innerHTML = `
    <div class="card exam">
      <div class="header"><h2>📊 Tes Admin: Excel (Google Sheet)</h2></div>

      <div class="warn-box" style="margin-bottom:14px;">
        <b>Instruksi:</b>
        <ul style="margin:10px 18px 0 18px;line-height:1.7;">
          <li>Klik tombol di bawah untuk mendapatkan Google Sheet soal ujian Anda (<b>salin ke Google Drive Anda</b>).</li>
          <li>Kerjakan langsung di Google Sheet tersebut.</li>
          <li><b>PENTING!</b> Setelah selesai, <b>bagikan link Sheet Anda</b> ke panitia dengan akses
            <span style="color:#0277bd;font-weight:600;">“Siapa saja yang memiliki link”</span> dan
            <span style="color:#388e3c;font-weight:600;">Editor</span>.
          </li>
        </ul>
        <div style="margin-top:10px;">
          <span class="timer-chip">⏱️ <span id="timer">${timerStr}</span></span>
        </div>
      </div>

      <div class="info-box" style="text-align:center;max-width:640px;margin:0 auto 12px auto;">
        <div style="font-weight:700;color:#155;margin-bottom:6px;">Panduan Membagikan Google Sheet:</div>
        <ol style="text-align:left;display:inline-block;margin:8px auto 10px auto;padding-left:21px;line-height:1.63;">
          <li>Klik <b>Bagikan</b> (Share) di kanan atas Sheet.</li>
          <li>Pada bagian <b>Akses umum</b> (General Access), pilih: <span style="color:#0277bd;font-weight:600;">“Siapa saja yang memiliki link”</span></li>
          <li>Pilih peran <span style="color:#388e3c;font-weight:600;">Editor</span></li>
          <li>Klik <b>Salin link</b>, lalu tempel di kolom jawaban di bawah.</li>
        </ol>
        <div style="text-align:center;">
  <img src="https://github.com/Pragas123/assets/blob/d4a1edf59e14946adf9799e377ad1212ef8abbc9/TES%20EXCEL.jpg?raw=true"
       alt="Panduan Share Google Sheet"
       style="display:inline-block;max-width:96%;border-radius:12px;border:1.6px solid #90caf9;box-shadow:0 2px 10px #a4cdf850;margin:9px auto 5px auto;">
</div>


        <div style="margin:10px auto 5px auto;font-size:1em;color:#f57c00;">
          <b>Catatan:</b> Pastikan akses “Siapa saja yang memiliki link” & Editor sudah aktif sebelum mengumpulkan link!
        </div>
      </div>

      <div style="text-align:center; margin:22px 0 12px 0;">
        <a href="https://docs.google.com/spreadsheets/d/1RKykKAHOn-kXfOFrDLD2UkOQ6YlpoFAgv06ETvnRU_g/copy" target="_blank" rel="noopener" id="startSheetBtn">
          <button class="btn green" style="font-size:1.06rem;padding:12px 22px;">
            📋 Dapatkan Google Sheet Ujian Anda
          </button>
        </a>
      </div>

      <div style="max-width:560px;margin:0 auto;">
        <div style="margin-bottom:8px;font-weight:700;">Kumpulkan Link Google Sheet Anda:</div>
        <input type="url" id="sheetLinkInput" class="input" placeholder="Tempelkan link Google Sheet Anda di sini" autocomplete="off"/>
        <div id="sheetLinkMsg" class="hint" style="margin-top:8px;"></div>
      </div>

      <div id="waktuHabisMsg" class="hint bad" style="margin-top:22px;text-align:center;"></div>

      <div style="margin-top:22px;text-align:center;">
        <button class="btn" id="btnExcelDone" style="font-size:1.06rem;">Selesai</button>
      </div>
    </div>
  `;

  function updateTimer() {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      const t = document.getElementById('timer');
      if (t) t.textContent = "00:00";
      const w = document.getElementById('waktuHabisMsg');
      if (w) w.textContent = "Waktu sudah habis.";
      // opsional: nonaktifkan tombol selesai bila ingin ketat
      // document.getElementById('btnExcelDone').disabled = true;
      return;
    }
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    const t = document.getElementById('timer');
    if (t) t.textContent = `${m}:${s}`;

    if (timeLeft === 600 && !ttsPlayed10M) { // 10 menit tersisa
      playTTS10Menit(); ttsPlayed10M = true;
    }
    if (timeLeft === 30 && !ttsPlayed30Dtk) {
      playTTS30Detik(); ttsPlayed30Dtk = true;
    }
    timeLeft--;
  }

  function playTTS10Menit() {
    try {
      const audio = new Audio('https://cdn.jsdelivr.net/gh/Pragas123/assets@main/10%20minute.mp3');
      audio.volume = 1;
      audio.play();
    } catch {}
  }
  function playTTS30Detik() {
    // Tambahkan suara peringatan jika ada
  }

  // Mulai timer saat klik sheet
  document.getElementById('startSheetBtn').addEventListener('click', function () {
    if (!sudahStart) {
      sudahStart = true;
      timerInterval = setInterval(updateTimer, 1000);
      updateTimer();
      setTimeout(() => {
        this.style.pointerEvents = 'none';
        const btn = this.querySelector('button');
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = "📝 Ujian Berlangsung";
        }
      }, 350);
    }
  });

  // Simpan link jawaban
  document.getElementById('sheetLinkInput').addEventListener('input', function (e) {
    const link = e.target.value.trim();
    const msg = document.getElementById('sheetLinkMsg');
    if (link.startsWith("https://docs.google.com/spreadsheets/")) {
      appState.adminAnswers.EXCEL = { link };
      if (msg) { msg.textContent = "✅ Link tersimpan. Pastikan akses sudah “Siapa saja yang memiliki link, Editor”."; msg.classList.remove('bad'); }
    } else if (link.length > 6) {
      if (msg) { msg.textContent = "Link tidak valid. Pastikan itu link Google Sheet."; msg.classList.add('bad'); }
    } else {
      if (msg) { msg.textContent = ""; msg.classList.remove('bad'); }
    }
  });

  // Tombol Selesai → tampilkan ucapan terima kasih seragam
  document.getElementById('btnExcelDone').onclick = function () {
    clearInterval(timerInterval);
    appState.completed = appState.completed || {};
    appState.completed.EXCEL = true;

    if (typeof window.updateDownloadButtonState === 'function') {
      window.updateDownloadButtonState();
    }

    renderExcelThankYou();
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 150);
  };
}




/* ==================== Helper: normalisasi & alignment PER-KATA ==================== */
// Normalisasi spasi (untuk tokenisasi; tampilan UI tidak berubah)
function __normalizeWS(s) {
  return String(s).replace(/\s+/g, ' ').trim();
}

// DP alignment per-KATA (bukan per karakter)
// Hasil: { matches, substitutions, insertions, deletions, expectedLen, inputLen }
function fairAlignCounts(expectedRaw, inputRaw, { whitespace = 'collapse' } = {}) {
  const eStr = whitespace === 'collapse' ? __normalizeWS(expectedRaw) : String(expectedRaw).trim();
  const iStr = whitespace === 'collapse' ? __normalizeWS(inputRaw)  : String(inputRaw).trim();

  // Tokenisasi kata (spasi jadi pemisah)
  const E = eStr ? eStr.split(' ').filter(Boolean) : [];
  const I = iStr ? iStr.split(' ').filter(Boolean) : [];

  const n = E.length, m = I.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i; // deletions
  for (let j = 0; j <= m; j++) dp[0][j] = j; // insertions

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = (E[i - 1] === I[j - 1]) ? 0 : 1; // exact match (case & tanda baca)
      const del  = dp[i - 1][j] + 1;
      const ins  = dp[i][j - 1] + 1;
      const sub  = dp[i - 1][j - 1] + cost;
      dp[i][j] = Math.min(del, ins, sub);
    }
  }

  // Backtrack untuk klasifikasi
  let i = n, j = m;
  let matches = 0, substitutions = 0, insertions = 0, deletions = 0;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + ((E[i - 1] === I[j - 1]) ? 0 : 1)) {
      if (E[i - 1] === I[j - 1]) matches++; else substitutions++;
      i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      deletions++; i--;
    } else {
      insertions++; j--;
    }
  }

  return { matches, substitutions, insertions, deletions, expectedLen: n, inputLen: m };
}

/* ==================== TES KETIK (Penilaian PER-KATA) ==================== */

function renderTypingTest() {
  // Tandai konteks tes
  window.__inTestView = true;
  appState.currentTest = 'TYPING';

  // Soal pengetikan (bukan instruksi!)
  const typingText = `Sugar Group Schools merupakan institusi pendidikan yang berada di bawah naungan perusahaan agribisnis terintegrasi, tersebar di tiga perusahaan gula terbesar di Indonesia. Sekolah ini didirikan dengan tujuan utama untuk mendukung proses pendidikan dan pengembangan generasi bangsa melalui sistem pembelajaran yang berkualitas dan relevan dengan kebutuhan zaman. Dengan komitmen untuk menciptakan lingkungan belajar yang kondusif dan inovatif, kami berupaya menjadi pelopor dalam menghasilkan lulusan berkualitas tinggi yang tidak hanya berjiwa profesional, tetapi juga mampu menguasai teknologi modern dan siap bersaing di era globalisasi.`;

  const waktuTyping = 120; // detik (2 menit)

  appState.typingText   = typingText;
  appState.timeLeft     = waktuTyping;
  appState.typingStart  = Date.now();
  appState.typingEnded  = false;

  const expectedWordCount = __normalizeWS(typingText).split(' ').filter(Boolean).length;

  document.getElementById('app').innerHTML = `
    <div class="card" style="
      max-width:920px;margin:34px auto;padding:26px 24px 28px 24px;border-radius:22px;
      background:linear-gradient(135deg,#f5faff 88%,#e5f3ff 100%);
      box-shadow:0 10px 36px #c9eaff33,0 1.5px 6px #fff9;border:1.7px solid #bfe3fc;">
      
      <!-- Header + Timer -->
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;">
        <h2 style="margin:0;font-weight:900;color:#1662a5;letter-spacing:.2px;text-shadow:0 1.5px 10px #e1efff99;">
          Tes Mengetik (Typing Test)
        </h2>
        <div class="timer-container" style="text-align:right;">
          <span class="timer-icon" style="margin-right:6px;">⏱️</span>
          <span class="timer" id="typingTimer" style="font-weight:800;font-size:1.07em;">${formatTypingTime(waktuTyping)}</span>
        </div>
      </div>

      <!-- Progress -->
      <div class="progress-container" style="height:10px;width:100%;background:#dde7f5;border-radius:10px;overflow:hidden;margin:6px 0 14px 0;">
        <div id="progressTypingBarInner" class="progress-bar" style="height:100%;width:0%;background:#31b729;transition:width .18s;"></div>
      </div>

      <!-- Petunjuk -->
      <div style="margin:8px 0 14px 0;padding:13px 15px;background:#f5fafc;border-radius:12px;border:1.6px solid #b7dfff;">
        <b>Instruksi:</b>
        <ul style="margin:10px 0 0 18px;line-height:1.7;color:#155;">
          <li>Ketik ulang teks di bawah <b>tanpa menyalin</b> (copy/paste dinonaktifkan).</li>
          <li><b>Penilaian per kata</b> (spasi jadi pemisah). Kata harus sama persis (huruf besar/kecil & tanda baca).</li>
          <li>Perbedaan jumlah spasi tidak memengaruhi penilaian, karena dibandingkan per kata.</li>
          <li>Waktu: <b>${Math.floor(waktuTyping/60)} menit</b>.</li>
        </ul>
      </div>

      <!-- Teks Acuan -->
      <div id="typingText" style="
        user-select:none;pointer-events:none;filter: blur(.4px);
        background:#ffffff;padding:14px 16px;border-radius:12px;margin-bottom:12px;
        font-size:1.06em;color:#234;border:1.4px solid #d9e9ff;">
        ${typingText.replace(/\n/g, '<br>')}
      </div>

      <!-- Input Jawaban -->
      <textarea
        id="typingInput"
        placeholder="Ketik ulang teks di sini..."
        style="width:100%;min-height:130px;padding:14px 13px;font-size:1.06em;border-radius:12px;border:1.4px solid #b7dfff;outline:none;box-shadow:0 2px 11px #eaf3ff inset;"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
        oncopy="return false" onpaste="return false" oncut="return false"
      ></textarea>

      <!-- Live Stats -->
      <div id="typingLiveStats" style="margin:12px 0 0 0;font-size:1.02em;color:#155;">
        <b>Kata Benar:</b> 0 &nbsp;|&nbsp; <b>Kata Salah:</b> 0 &nbsp;|&nbsp; <b>Belum diketik:</b> ${expectedWordCount} &nbsp;|&nbsp; <b>Akurasi:</b> 0% &nbsp;|&nbsp; <b>WPM:</b> 0
      </div>

      <!-- Aksi -->
      <div style="margin-top:22px;text-align:center;">
        <button class="btn" id="btnTypingDone" style="
          padding:12px 28px;font-weight:800;border-radius:11px;background:#18a35d;color:#fff;border:0;
          box-shadow:0 4px 18px #bff1d7;">Kirim Jawaban</button>
        <button class="btn btn-outline" onclick="confirmCancelTest()" style="margin-left:8px;">Batalkan Tes</button>
      </div>
    </div>
  `;

  // Timer
  if (appState.typingTimer) clearInterval(appState.typingTimer);
  appState.typingTimer = setInterval(() => {
    appState.timeLeft--;
    const el = document.getElementById('typingTimer');
    if (el) el.textContent = formatTypingTime(appState.timeLeft);
    if (appState.timeLeft <= 0) endTypingTest(true);
  }, 1000);

  // Live feedback (debounce ringan)
  const inputEl = document.getElementById('typingInput');
  let __typingStatsTick;
  inputEl.addEventListener('input', () => {
    clearTimeout(__typingStatsTick);
    __typingStatsTick = setTimeout(updateTypingStats, 60);
  });

  // Anti copy/paste/cut
  ['copy','paste','cut'].forEach(ev => inputEl.addEventListener(ev, e => e.preventDefault()));

  // Kirim
  document.getElementById('btnTypingDone').onclick = () => endTypingTest(false);

  // Hitung & tampilkan statistik live + progress (PER-KATA)
  function updateTypingStats() {
    const inputRaw    = inputEl.value;
    const expectedRaw = typingText;

    const { matches, substitutions, insertions, deletions, expectedLen, inputLen } =
      fairAlignCounts(expectedRaw, inputRaw, { whitespace: 'collapse' });

    const benar = matches;
    const salah = substitutions + insertions; // kata salah + kata ekstra
    const belum = deletions;                  // kata expected yg belum diketik

    const akurasi = expectedLen ? (benar / expectedLen * 100) : 0;

    // WPM (words per minute) berbasis jumlah kata yang DIKETIK (bukan yg benar)
    const menit = Math.max((waktuTyping - appState.timeLeft) / 60, 1e-6);
    const wpm   = Math.round(inputLen / menit);

    const progress = Math.min(100, (inputLen / Math.max(expectedLen, 1)) * 100);

    const bar = document.getElementById('progressTypingBarInner');
    if (bar) bar.style.width = `${progress}%`;

    const stats = document.getElementById('typingLiveStats');
    if (stats) {
      stats.innerHTML =
        `<b>Kata Benar:</b> ${benar} &nbsp;|&nbsp; <b>Kata Salah:</b> ${salah} &nbsp;|&nbsp; <b>Belum diketik:</b> ${belum} &nbsp;|&nbsp; <b>Akurasi:</b> ${akurasi.toFixed(1)}% &nbsp;|&nbsp; <b>WPM:</b> ${isFinite(wpm) && wpm >= 0 ? wpm : 0}`;
    }
  }
}

function formatTypingTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function endTypingTest(timeIsUp = false) {
  if (appState.typingEnded) return;
  appState.typingEnded = true;

  if (appState.typingTimer) clearInterval(appState.typingTimer);

  const userInput = (document.getElementById('typingInput')?.value || '');
  const kunci     = appState.typingText || '';

  const { matches, substitutions, insertions, deletions, expectedLen, inputLen } =
    fairAlignCounts(kunci, userInput, { whitespace: 'collapse' });

  const benar = matches;
  const salah = substitutions + insertions;
  const belum = deletions;

  const durasiDipakai = 120 - (appState.timeLeft || 0);
  const menit = Math.max(durasiDipakai / 60, 1e-6);
  const wpm   = Math.round(inputLen / menit); // kata per menit
  const akurasi = expectedLen ? (benar / expectedLen * 100).toFixed(1) : '0.0';

  // Simpan hasil
  appState.answers = appState.answers || {};
  appState.answers.TYPING = {
    text: userInput,
    wpm,
    accuracy: akurasi,
    benar, salah, belum,
    total: expectedLen,
    waktu: durasiDipakai,
    waktuSisa: Math.max(appState.timeLeft || 0, 0),
    status: timeIsUp ? 'Waktu habis' : 'Selesai'
  };

  // Tandai selesai + sinkronkan tombol download
  appState.completed = appState.completed || {};
  appState.completed.TYPING = true;
  try {
    const saved = JSON.parse(localStorage.getItem('completed') || '{}');
    saved.TYPING = true;
    localStorage.setItem('completed', JSON.stringify(saved));
  } catch {}
  if (typeof window.updateDownloadButtonState === 'function') {
    window.updateDownloadButtonState();
  }

  renderTypingThankYou();
}

/* ==================== Thank You Screen After TYPING (gaya seragam hijau) ==================== */
function renderTypingThankYou() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card" style="
      max-width:820px;margin:34px auto;padding:32px 28px;border-radius:22px;
      background:linear-gradient(135deg,#f5fff8 86%,#e8fff1 100%);
      box-shadow:0 10px 34px #c7f4da55;border:1.6px solid #c8f1d6;text-align:center;">
      <div style="font-size:3rem;line-height:1;margin-bottom:10px;">🎉</div>
      <h2 style="margin:6px 0 8px 0;font-weight:900;color:#13693a;">
        Terima kasih! Tes Mengetik sudah selesai
      </h2>
      <p style="font-size:1.08rem;color:#244;max-width:680px;margin:0 auto 16px auto;line-height:1.6;">
        Jawaban Anda untuk Tes <b>Mengetik</b> telah tersimpan. Silakan lanjut mengerjakan tes lain yang Anda pilih.
        Tombol <b>Download PDF</b> akan aktif kembali setelah <b>semua</b> tes pilihan selesai dikerjakan.
      </p>

      <div style="display:flex;gap:12px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
        <button id="btnContinueTyping" class="btn" style="
          padding:12px 24px;font-weight:800;border-radius:11px;
          background:#18a35d;color:#fff;border:0;box-shadow:0 4px 18px #bff1d7;">
          ✅ Lanjut Tes Berikutnya
        </button>
      </div>
    </div>
  `;

  const goNext = () => {
    window.__inTestView = false;
    if (typeof window.renderHome === 'function') window.renderHome();
    setTimeout(() => {
      const el = document.getElementById('homeCard') || document.getElementById('downloadPDFBox');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };
  document.getElementById('btnContinueTyping').onclick = goNext;
}


// ==================== Timer Functions ====================
function startTimer() {
  clearInterval(appState.timer);
  
  appState.timer = setInterval(() => {
    appState.timeLeft--;
    updateTimerDisplay();
    
    if (appState.timeLeft <= 0) {
      clearInterval(appState.timer);
      timeUp();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) {
    timerDisplay.textContent = `${appState.timeLeft}s`;
    
    if (appState.timeLeft <= 10) {
      timerDisplay.classList.add('timer-warning');
    } else {
      timerDisplay.classList.remove('timer-warning');
    }
  }
}

function timeUp() {
  alert('Waktu telah habis! Tes akan dikirim secara otomatis.');
  
  if (appState.currentTest === 'IST') {
    // Save unanswered questions as '-'
    const subtest = tests.IST.subtests[appState.currentSubtest];
    while (appState.currentQuestion < subtest.questions.length) {
      appState.answers.IST[appState.currentSubtest].answers.push({
        id: subtest.questions[appState.currentQuestion].id,
        answer: '-',
        correct: false
      });
      appState.currentQuestion++;
    }
    
    appState.currentSubtest++;
    appState.currentQuestion = 0;
    renderISTSubtestIntro();
  } else if (appState.currentTest === 'PAPI') {
    // Save unanswered questions as '-'
    while (appState.currentQuestion < tests.PAPI.questions.length) {
      appState.answers.PAPI.push({
        id: tests.PAPI.questions[appState.currentQuestion].id,
        answer: '-',
        answerText: 'Tidak dijawab (waktu habis)'
      });
      appState.currentQuestion++;
    }
    
    appState.completed.PAPI = true;
    renderHome();
  } else if (appState.currentTest === 'BIGFIVE') {
    // Save unanswered questions as '-'
    while (appState.currentQuestion < tests.BIGFIVE.questions.length) {
      appState.answers.BIGFIVE.push({
        id: tests.BIGFIVE.questions[appState.currentQuestion].id,
        answer: 0,
        answerText: 'Tidak dijawab (waktu habis)'
      });
      appState.currentQuestion++;
    }
    
    appState.completed.BIGFIVE = true;
    renderHome();
  }
}

// ==================== Common Functions ====================
function confirmCancelTest() {
  if (confirm('Apakah Anda yakin ingin membatalkan tes? Semua jawaban yang sudah diisi akan hilang.')) {
    clearInterval(appState.timer);
    renderHome();
  }
} 




// ==================== PDF Generation ====================
function addDiagonalWatermark(doc, text = 'SANGAT RAHASIA', angleDeg = -35, opts = {}) {
  const pages = typeof doc.getNumberOfPages === 'function' ? doc.getNumberOfPages() : 1;

  const opt = {
    // POSISI (mm). Positif: geser ke KANAN (X) dan NAIK (Y)
    centerXOffset: 0,
    centerYOffset: 0,

    // WARNA & TRANSPARANSI
    color: [200, 20, 20], // RGB merah
    opacity: 0.12,        // 0..1 (lebih kecil = lebih tembus)
    blur: true,           // true = ada efek blur/glow samar
    blurOpacity: 0.05,    // transparansi lapisan blur
    blurPasses: 10,       // jumlah sapuan blur (lebih banyak = lebih halus)
    blurRadius: 0.7,      // radius blur (mm)

    // TEKS
    font: 'helvetica',
    fontStyle: 'bold',
    fontSizeMax: 54,      // plafon ukuran font
    edgeGap: 1.0,         // jarak dari sudut kertas di sepanjang diagonal
    baselineShift: 0.30,  // koreksi baseline relatif fontSize

    ...opts
  };

  const hasAlpha = !!doc.setGState && !!doc.GState;

  for (let i = 1; i <= pages; i++) {
    if (doc.setPage) doc.setPage(i);

    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const cx = w / 2 + (opt.centerXOffset || 0);
    const cy = h / 2 - (opt.centerYOffset || 0);

    // Ukuran font otomatis biar pas sepanjang diagonal
    const diag = Math.sqrt(w * w + h * h);
    const targetWidth = Math.max(10, diag - 2 * (opt.edgeGap || 0));
    doc.setFont(opt.font, opt.fontStyle);
    doc.setTextColor(...opt.color);

    doc.setFontSize(10);
    const widthAt10 = Math.max(1, doc.getTextWidth(text));
    const autoSize = Math.min(opt.fontSizeMax, Math.max(12, (targetWidth / widthAt10) * 10));
    doc.setFontSize(autoSize);

    const baselineNudge = autoSize * (opt.baselineShift || 0.30);

    // ====== OPACITY ======
    if (hasAlpha) {
      try { doc.saveGraphicsState(); doc.setGState(new doc.GState({ opacity: opt.opacity })); } catch {}
    } else {
      // fallback (tanpa alpha): lembutkan warna supaya terlihat “pudar”
      const soften = (c) => Math.round(255 - (255 - c) * 0.65);
      const soft = [soften(opt.color[0]), soften(opt.color[1]), soften(opt.color[2])];
      doc.setTextColor(...soft);
    }

    // ====== BLUR/GLOW (lapisan tipis di sekeliling teks) ======
    if (opt.blur && hasAlpha) {
      try { doc.setGState(new doc.GState({ opacity: opt.blurOpacity })); } catch {}
      for (let k = 0; k < opt.blurPasses; k++) {
        const t = (k / opt.blurPasses) * Math.PI * 2;
        const dx = Math.cos(t) * opt.blurRadius;
        const dy = Math.sin(t) * opt.blurRadius;
        doc.text(text, cx + dx, cy + baselineNudge + dy, { align: 'center', angle: angleDeg });
      }
      try { doc.setGState(new doc.GState({ opacity: opt.opacity })); } catch {}
    }

    // ====== TEKS UTAMA ======
    doc.text(text, cx, cy + baselineNudge, { align: 'center', angle: angleDeg });

    if (hasAlpha) { try { doc.restoreGraphicsState(); } catch {} }
  }
}









async function generatePDF() {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  // Pakai base64 hasil konversi!
  const logoBase64 = 'data:image/png;base64,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'; // Ganti dengan base64 logo Anda
 doc.addImage(logoBase64, 'PNG', pageWidth/2-10, 8, 20, 16);

  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.text('HASIL PSIKOTES', pageWidth/2, 27, { align: 'center' });
  doc.text('SUGAR GROUP SCHOOLS', pageWidth/2, 32, { align: 'center' });

   /* ==================== Helper Halaman & Font (gunakan sekali di awal) ==================== */
const Y_MAX = 280;     // batas aman konten bawah
const Y_PB  = 265;     // threshold page break
function ensurePage(doc, y) { if (y > Y_PB) { doc.addPage(); return 20; } return y; }
function setTypewriter(doc, weight='normal') { doc.setFont('courier', weight); }

/* ==================== IDENTITAS ==================== */
const col1_x = 12, col2_x = 90;
let y = 43;
setTypewriter(doc, 'bold'); doc.setFontSize(7);
doc.text('IDENTITAS PESERTA', col1_x, y); y += 2;
doc.setLineWidth(0.22);
doc.line(col1_x, y, col1_x + 35, y);
y += 3;

const id = appState.identity;

function drawLabelValueFix(doc, x, y, label, value, opts = {}) {
  const fontSize   = opts.fontSize   || 7;
  const labelWidth = opts.labelWidth || 25;
  const maxWidth   = opts.maxWidth   || 44;
  doc.setFontSize(fontSize); // font tetap courier dari setTypewriter
  doc.text(`${label}:`, x, y);
  const valStr = String(value ?? '-');
  if (doc.getTextWidth(valStr) > maxWidth) {
    let firstLine = '', secondLine = '';
    for (let i = 0; i < valStr.length; i++) {
      if (doc.getTextWidth(firstLine + valStr[i]) < maxWidth) firstLine += valStr[i];
      else { secondLine = valStr.slice(i); break; }
    }
    doc.text(firstLine,  x + labelWidth, y);
    doc.text(secondLine, x + labelWidth, y + 3.5);
    return y + 7;
  } else {
    doc.text(valStr, x + labelWidth, y);
    return y + 3.5;
  }
}

// KOLOM KIRI IDENTITAS
setTypewriter(doc, 'normal');
let y1 = y;
y1 = drawLabelValueFix(doc, col1_x, y1, "Nama Lengkap", id.name || "-");
y1 = drawLabelValueFix(doc, col1_x, y1, "Nama Panggilan", id.nickname || "-");
y1 = drawLabelValueFix(doc, col1_x, y1, "No. HP", id.phone || "-");
y1 = drawLabelValueFix(doc, col1_x, y1, "Tgl Lahir", id.dob ? new Date(id.dob).toLocaleDateString('id-ID') : '-');
y1 = drawLabelValueFix(doc, col1_x, y1, "Usia", id.age || "-"); // opsional
y1 = drawLabelValueFix(doc, col1_x, y1, "Status", id.status || "-");
y1 = drawLabelValueFix(doc, col1_x, y1, "Posisi", id.position || "-");
if (id.position === 'Dosen/Guru') y1 = drawLabelValueFix(doc, col1_x, y1, "Kategori Guru", id.teacherLevel || "-");
if (id.position === 'Technical Staff') y1 = drawLabelValueFix(doc, col1_x, y1, "Role Teknis", id.techRole || "-");
y1 = drawLabelValueFix(doc, col1_x, y1, "Pendidikan", id.education || "-");

// KOLOM KANAN IDENTITAS
let y2 = y;
y2 = drawLabelValueFix(doc, col2_x, y2, "Email", id.email || "-", {labelWidth:30, maxWidth:67, fontSize:7});
y2 = drawLabelValueFix(doc, col2_x, y2, "Alamat KTP", id.addressKTP || "-", {labelWidth:30, maxWidth:67, fontSize:7});
y2 = drawLabelValueFix(doc, col2_x, y2, "Alamat Saat Ini", id.addressCurrent || "-", {labelWidth:30, maxWidth:67, fontSize:7});
y2 = drawLabelValueFix(doc, col2_x, y2, "Keterangan Tambahan", id.explanation || "-", {labelWidth:30, maxWidth:67, fontSize:7});
y2 = drawLabelValueFix(doc, col2_x, y2, "Tanggal Pengisian", id.date || "-", {labelWidth:30, fontSize:7});

// BAGIAN ALUMNI (di bawah identitas)
const yMaxIdentitas = Math.max(y1, y2);
let ySection = yMaxIdentitas + 7;

if (id.alumniSGS) {
  let alumniText = "Alumni Sugar Group Schools:";
  let alumniArr = [];
  if (id.alumniSD)  alumniArr.push("SD"  + (id.alumniSDText  ? ` (${id.alumniSDText})`   : ""));
  if (id.alumniSMP) alumniArr.push("SMP" + (id.alumniSMPText ? ` (${id.alumniSMPText})`  : ""));
  if (id.alumniSMA) alumniArr.push("SMA" + (id.alumniSMAText ? ` (${id.alumniSMAText})` : ""));
  alumniText += " " + (alumniArr.length > 0 ? alumniArr.join(", ") : "-");
  doc.setFontSize(8);
  doc.text(alumniText, col1_x, ySection);
  ySection += 6;
}

// Cek page limit setelah identitas
ySection = ensurePage(doc, ySection);

/* ==================== IST ==================== */
if (
  appState.answers.IST &&
  Array.isArray(appState.answers.IST) &&
  appState.answers.IST.some(subtest => Array.isArray(subtest.answers) && subtest.answers.length > 0)
) {
  // injeksi kunci (idempoten)
  try { applyAllKeysIntoQuestions(); } catch {}

  // Heading
  ySection += 2; ySection = ensurePage(doc, ySection);
  setTypewriter(doc, 'bold'); doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text('JAWABAN TES IST', pageWidth/2, ySection, { align: 'center' });
  setTypewriter(doc, 'normal'); ySection += 2;
  doc.setTextColor(44, 62, 80);

  /* ===== Format ringkas per subtes ===== */
  function _pickAnswer(a) {
    if (a == null) return '';
    if (typeof a === 'string' || typeof a === 'number') return String(a);
    if (typeof a === 'object') {
      const cand = a.answer ?? a.text ?? a.value ?? a.label ?? a.choice ?? '';
      return cand == null ? '' : String(cand);
    }
    return String(a);
  }
  function _compactToken(v) {
    if (v == null || v === '') return '-';
    let s = String(v).trim();
    if (/^[A-Ea-e]\s*$/.test(s)) return s[0].toLowerCase();
    if (/^[A-Ea-e][.)](?:\s*\S.*)?$/.test(s)) return s[0].toLowerCase();
    if (/^[+-]?\d+(?:[.,]\d+)?$/.test(s)) return s.replace(',', '.');
    return s.replace(/[\[\]]/g, '').replace(/,/g, ' ');
  }
  const SUB_LABEL = {
    SE: 'SE (Satzergänzung)',
    WA: 'WA (Wortauswahl)',
    AN: 'AN (Analogien)',
    GE: 'GE (Gemeinsamkeiten Finden)',
    RA: 'RA (Rechenaufgaben)',
    ZR: 'ZR (Zahlenreihen)',
    FA: 'FA (Figurenauswahl)',
    WU: 'WU (Würfelaufgaben)',
    ME: 'ME (Memori)'
  };
  function _inferCode(name='') {
    const s = String(name).toUpperCase();
    const two = s.replace(/[^A-Z]/g, '').slice(0,2);
    if (SUB_LABEL[two]) return two;
    for (const k of Object.keys(SUB_LABEL)) { if (s.includes(k)) return k; }
    return two || s.slice(0,2) || 'SE';
  }
  function _formatSubtestLine(subtest) {
    const code  = _inferCode(subtest?.name || '');
    const label = SUB_LABEL[code] || (code + ' (' + (subtest?.name || code) + ')');
    const answersArr = Array.isArray(subtest?.answers) ? subtest.answers : [];
    const tokens = answersArr.map(a => _compactToken(_pickAnswer(a)));
    if (!tokens.length) return `${label}  [-]`;
    const groups = [];
    for (let i = 0; i < tokens.length; i += 5) {
      const chunk = tokens.slice(i, i + 5);
      groups.push(`[${chunk.join(', ')}]`);
    }
    return `${label}  ${groups.join(', ')}`;
  }

  const linesPerSub = appState.answers.IST.map(st => _formatSubtestLine(st));
  const flow = linesPerSub.join(' ||| ');

  // Cetak aliran ringkas
  const LM = 16, RM = 16, MAXY = Y_MAX;
  const TEXT_W = pageWidth - (LM + RM);
  function safeStr(s){
    return String(s || '').replace(/\u00A0/g, ' ').replace(/[ ]{2,}/g, ' ').trim();
  }

  doc.setFontSize(7); setTypewriter(doc, 'normal'); doc.setTextColor(44, 62, 80);
  const chunks = doc.splitTextToSize(safeStr(flow), TEXT_W);
  for (let i = 0; i < chunks.length; i++) {
    ySection += 2.4;
    if (ySection > MAXY) { doc.addPage(); ySection = 20; }
    doc.text(chunks[i], LM, ySection);
  }
  ySection += 2;

  // Ringkasan & render IST lanjutan
  try {
    ySection = renderISTSummaryToPDF(doc, pageWidth, ySection);
    const summary = computeISTPerSubtestScores();
    ySection = renderISTScoresToPDF(doc, pageWidth, ySection, summary);
    ySection = renderISTIQToPDF(doc, pageWidth, ySection, summary);
    ySection = renderISTDescriptionsToPDF(doc, pageWidth, ySection, summary);
    ySection = renderISTThinkingDimensionToPDF(doc, pageWidth, ySection, summary);
    ySection = renderISTSWChartToPDF(doc, pageWidth, ySection, summary);
    ySection = renderISTMWAnalysisToPDF(doc, pageWidth, ySection, summary);
  } catch (e) { console.error('IST summary/render error', e); }
}
/* ==================== KRAEPLIN (A4-safe, cleaned & fixed, SINGLE-COLUMN) ==================== */
if (
  appState.answers.KRAEPLIN &&
  Array.isArray(appState.answers.KRAEPLIN) &&
  appState.answers.KRAEPLIN.some(arr => Array.isArray(arr) && arr.length > 0)
) {
  /* ======= NORMA TETAP (SESUIKAN DENGAN NORMA UGM YANG KAMU PAKAI) ======= */
  const USE_UGM_NORMS = true;
  // Catatan penting: bands harus ASCENDING. Untuk metrik "semakin kecil semakin baik" gunakan invert=true saat kategorisasi.
  const UGM_BANDS = {
    PANKER: [10, 14, 18, 22],
    TIANKER: [5, 10, 15, 20],
    JANKER: [1.5, 2.5, 4, 6],
    HANKER: [-3, -1, 1, 3]
  };

  const LABELS5 = ["Rendah Sekali","Rendah","Cukup","Tinggi","Sangat Tinggi"];
  function catFixedAsc(value, bandsAsc, invert=false) {
    const [b1,b2,b3,b4] = bandsAsc;
    let idx = 0;
    if (value <= b1) idx = 0;
    else if (value <= b2) idx = 1;
    else if (value <= b3) idx = 2;
    else if (value <= b4) idx = 3;
    else idx = 4;
    return invert ? LABELS5[4 - idx] : LABELS5[idx];
  }

  /* ==================== PERHITUNGAN DETAIL ==================== */
  const key = appState.kraeplinKey || [];
  const ans = appState.answers.KRAEPLIN || [];
  const colsOrigin = tests?.KRAEPLIN?.columns || [];

  const expectedPerCol = colsOrigin.map(col => Math.max(0, (Array.isArray(col)? col.length : 0) - 1));
  const expectedTotal  = expectedPerCol.reduce((a,b)=>a+b,0);

  const colStats = expectedPerCol.map((exp, cIdx) => {
    const jaw = Array.isArray(ans[cIdx]) ? ans[cIdx] : [];
    const k   = Array.isArray(key[cIdx]) ? key[cIdx] : [];
    let isi=0, benar=0, salah=0;
    for (let r=0;r<Math.min(jaw.length, k.length);r++){
      const v = jaw[r];
      if (typeof v === 'number' && !Number.isNaN(v)) {
        isi++;
        if (v === k[r]) benar++; else salah++;
      }
    }
    const kosong = Math.max(0, exp - isi);
    return { exp, isi, benar, salah, kosong };
  });

  const isiPerKolom     = colStats.map(s => s.isi);
  const benarPerKolom   = colStats.map(s => s.benar);
  const salahPerKolom   = colStats.map(s => s.salah);
  const kosongPerKolom  = colStats.map(s => s.kosong);
  const akurasiPerKolom = colStats.map(s => s.isi>0 ? (s.benar/s.isi*100) : 0);

  const totalIsi    = isiPerKolom.reduce((a,b)=>a+b,0);
  const totalBenar  = benarPerKolom.reduce((a,b)=>a+b,0);
  const totalSalah  = salahPerKolom.reduce((a,b)=>a+b,0);
  const totalKosong = Math.max(0, expectedTotal - totalIsi);

  const kolomDikerjakan = isiPerKolom.filter(v => v>0).length || ((appState?.currentColumn ?? -1)+1) || 0;

  // SKOR KONSTRUK
  const panker = kolomDikerjakan>0 ? (totalIsi / kolomDikerjakan) : 0;
  const tianker_abs = totalSalah;
  const tianker_pct = totalIsi>0 ? (totalSalah/totalIsi*100) : 0;

  let jDif = [];
  for (let i=1;i<isiPerKolom.length;i++){
    if (isiPerKolom[i]>0 || isiPerKolom[i-1]>0) jDif.push(Math.abs(isiPerKolom[i]-isiPerKolom[i-1]));
  }
  const jankerAvgDev = jDif.length? (jDif.reduce((a,b)=>a+b,0)/jDif.length) : 0;

  const lastIdx  = Math.min(50, isiPerKolom.length) - 1;
  const firstIdx = 0;
  const hanker   = (lastIdx>=0 && isiPerKolom.length>0) ? (isiPerKolom[lastIdx] - isiPerKolom[firstIdx]) : 0;

  const takeAvg = (arr, from, to) => {
    const seg = arr.slice(from, to);
    const valid = seg.filter(x=>x>0);
    return valid.length? valid.reduce((a,b)=>a+b,0)/valid.length : 0;
  };
  const n   = isiPerKolom.length;
  const blk = 10;
  const earlyAvg = takeAvg(isiPerKolom, 0, Math.min(blk, n));
  const lateAvg  = takeAvg(isiPerKolom, Math.max(0, Math.min(50,n)-blk), Math.min(50,n));
  const deltaEL  = (lateAvg - earlyAvg);

  function linRegSlope(yFix){
    const x = yFix.map((_,i)=>i+1);
    const m = x.length;
    if (!m) return 0;
    const meanX = x.reduce((a,b)=>a+b,0)/m;
    const meanY = yFix.reduce((a,b)=>a+b,0)/m;
    let num=0, den=0;
    for (let i=0;i<m;i++){
      num += (x[i]-meanX)*(yFix[i]-meanY);
      den += (x[i]-meanX)*(x[i]-x[i]);
    }
    return den? (num/den) : 0;
  }
  const slope = +linRegSlope(isiPerKolom).toFixed(3);

  let trenText;
  const TH_SLOPE = 0.15;
  const TH_DELTA = 1.00;
  if (slope <= -TH_SLOPE && deltaEL < -TH_DELTA)      trenText = "Menurun (indikasi kelelahan)";
  else if (slope >= +TH_SLOPE && deltaEL > +TH_DELTA) trenText = "Meningkat (indikasi pemanasan/ketahanan)";
  else                                                trenText = "Relatif stabil";

  // KATEGORI
  const pScore = +panker.toFixed(1);
  const tScore = +tianker_abs;
  const jScore = +jankerAvgDev.toFixed(2);
  const hScore = +hanker.toFixed(2);

  const catP = USE_UGM_NORMS ? catFixedAsc(pScore, UGM_BANDS.PANKER, false) : "Cukup";
  const catT = USE_UGM_NORMS ? catFixedAsc(tScore, UGM_BANDS.TIANKER, true)  : "Cukup";
  const catJ = USE_UGM_NORMS ? catFixedAsc(jScore, UGM_BANDS.JANKER, true)   : "Cukup";
  const catH = USE_UGM_NORMS ? catFixedAsc(hScore, UGM_BANDS.HANKER, false)  : "Cukup";

  /* ==================== RENDER PDF (SEMUA TYPEWRITER) ==================== */
  // Header
  ySection += 4; ySection = ensurePage(doc, ySection);
  setTypewriter(doc, 'bold'); doc.setFontSize(7); doc.setTextColor(0,0,0);
  doc.text('HASIL TES KRAEPLIN', pageWidth/2, ySection, { align:'center' });
  setTypewriter(doc, 'normal'); ySection += 3.5; ySection = ensurePage(doc, ySection);
  doc.setFontSize(7); doc.setTextColor(44,62,80);

  const marginX  = 15;
  const contentW = pageWidth - marginX*2;
  const gap      = 8;

  // RINGKASAN ANGKA (singkat, tetap ditampilkan)
  let xData = marginX;
  let yy = ySection;
  const rows = [
    ["Benar", totalBenar],
    ["Salah", totalSalah],
    ["Kosong", totalKosong],
    ["Total Diisi", totalIsi],
    ["Total Seharusnya", expectedTotal],
    ["Kolom Dikerjakan", kolomDikerjakan]
  ];
  const labelW = 50;
  rows.forEach(([label,val])=>{
    yy = ensurePage(doc, yy);
    doc.text(label + ":", xData, yy);
    doc.text(String(val), xData + labelW, yy);
    yy += 3.1;
  });
  yy += 2.0;

  /* ==================== PERFORMA (Ringkas) — SATU KOLOM SAJA ==================== */
  const LINE = 3.4;
  const SAFE = 6;
  function wrapAt(text, maxW){
    const w = Math.max(4, maxW|0);
    try { return doc.splitTextToSize(String(text ?? ""), w); }
    catch { return [String(text ?? "")]; }
  }
  function resetCS(){ try{ doc.setCharSpace && doc.setCharSpace(0);}catch(e){} }

  let xPerf = marginX;
  let yPerf = yy + 4;
  if (yPerf > (Y_PB - 40)) { doc.addPage(); yPerf = 20; }

  setTypewriter(doc, 'bold'); doc.text('PERFORMA (Ringkas)', xPerf, yPerf);
  doc.setDrawColor(200); doc.setLineWidth(0.2); doc.line(xPerf, yPerf + 1.2, xPerf + contentW - 2, yPerf + 1.2);
  setTypewriter(doc, 'normal'); resetCS(); yPerf += 3.8;

  const perfSummary = [
    `PANKER: ${pScore.toFixed(1)} (${catP})`,
    `TIANKER: ${tScore} salah (${tianker_pct.toFixed(1)}%) — ${catT}`,
    `JANKER: ${jScore.toFixed(2)} — ${catJ}`,
    `HANKER: ${(hScore>=0?"+":"")}${hScore.toFixed(2)} — ${catH}`,
    `Tren: slope=${slope}, awal=${earlyAvg.toFixed(1)} vs akhir=${lateAvg.toFixed(1)} (Δ=${deltaEL>=0?"+":""}${deltaEL.toFixed(1)}) — ${trenText}.`
  ];
  perfSummary.forEach(line=>{
    const lines = wrapAt(line, contentW - 8);
    const h = lines.length * LINE;
    if (yPerf + h + SAFE > Y_PB) { doc.addPage(); yPerf = 20; }
    for (let i=0;i<lines.length;i++) doc.text(lines[i], xPerf + 2, yPerf + i*LINE);
    yPerf += h + 0.8;
  });

  // ===== Grafik di bawah =====
  let afterPerfBottom = yPerf + 4;
  if (afterPerfBottom > (Y_PB - 60)) { doc.addPage(); afterPerfBottom = 20; }

  let chartsBottom = afterPerfBottom;
  if (isiPerKolom.length > 0) {
    const chartW = Math.floor((contentW - gap) / 2);
    const maxIsi = Math.max(...isiPerKolom);
    const chartH = 48;
    let topY = afterPerfBottom + 2;
    if (topY + chartH > Y_PB) { doc.addPage(); topY = 20; }

    const leftBottom = renderKraeplinChartToPDF(
      doc, marginX, topY, chartW, chartH, isiPerKolom,
      {
        title: 'Pengerjaan/kolom', xLabel: 'Kolom', yLabel: 'Jumlah',
        yMin: 0, yMax: Math.max(30, Math.ceil(maxIsi*1.1)), yTicksExplicit: null, yTickEvery: 5,
        showPts: true, pointLabels: true, labelEveryPt: 1, markExtrema: true, showMidrange: true,
        footerNote: `Rata-rata: ${pScore.toFixed(1)} | Kolom: ${kolomDikerjakan}`,
        padL: 18, padT: 9, padB: 11
      }
    );

    let rightBottom = leftBottom;
    if (akurasiPerKolom.length > 0) {
      rightBottom = renderKraeplinChartToPDF(
        doc, marginX + chartW + gap, topY, chartW, chartH,
        akurasiPerKolom.map(v => +v.toFixed(1)),
        {
          title: 'Akurasi/kolom (%)', xLabel: 'Kolom', yLabel: '% benar',
          yMin: 0, yMax: 100, yTicksExplicit: Array.from({ length: 11 }, (_, i) => i*10), yTickEvery: 1,
          showPts: true, pointLabels: false, markExtrema: true, showMidrange: true,
          padL: 18, padT: 9, padB: 11
        }
      );
    }
    chartsBottom = Math.max(leftBottom, rightBottom) + 2;
  }

  // Penutup section (tanpa redeclare variabel)
  ySection = ensurePage(doc, Math.max(chartsBottom, yPerf) + 6);
}




/* ==================== DISC ==================== */
if (appState.completed.DISC) {
  ySection += 2; ySection = ensurePage(doc, ySection);

  // 1) Judul
  setTypewriter(doc, 'bold'); doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`HASIL DISC ${appState.identity?.nickname || ''}`, pageWidth / 2, ySection, { align: 'center' });
  ySection += 6;
  doc.setTextColor(44, 62, 80);

  // 2) Jawaban
  setTypewriter(doc, 'bold'); doc.setFontSize(7);
  doc.text('JAWABAN TES DISC', pageWidth / 2, ySection, { align: 'center' });
  setTypewriter(doc, 'normal'); ySection += 2;

  const jawabanDISC = (appState.answers.DISC || []).map((ans, idx) => ({
    no: (idx + 1).toString(),
    p: (ans.p + 1).toString(),
    k: (ans.k + 1).toString()
  }));

  // (lanjut render daftar/tabel jawaban DISC kamu di sini — tetap gunakan setTypewriter)

  const barisDISC = Math.ceil(jawabanDISC.length / 4);
  const cols = [[], [], [], []];
  for (let i = 0; i < jawabanDISC.length; i++) {
    const colIndex = i % 4;
    cols[colIndex].push(jawabanDISC[i]);
  }

  const colX = [29, 67, 105, 143];
  let colY = ySection + 0.5;

  for (let r = 0; r < barisDISC; r++) {
    colY += 2.3;
    if (colY > 280) { doc.addPage(); colY = 20; }
    for (let c = 0; c < 4; c++) {
      const ans = cols[c][r];
      if (ans) {
        doc.text(`${ans.no}. [P]=${ans.p} ; [K]=${ans.k}`, colX[c], colY);
      }
    }
  }
  ySection = colY + 2;

  // ====== 3. PASTIKAN ADA RUANG UNTUK GRAFIK (~126px) ======
  if (ySection > 220) {
    doc.addPage();
    ySection = 20;
  }

  // ========== PASTIKAN GRAFIK TERUPDATE SEBELUM AMBIL CANVAS ==========
  const hasilDISC = countDISC(appState.answers.DISC, tests.DISC.questions);
  if (typeof drawDISCClassic === "function") {
    drawDISCClassic('discMost',   'most',   hasilDISC.most.D,   hasilDISC.most.I,   hasilDISC.most.S,   hasilDISC.most.C,   "#2176C7");
    drawDISCClassic('discLeast',  'least',  hasilDISC.least.D,  hasilDISC.least.I,  hasilDISC.least.S,  hasilDISC.least.C,  "#DE9000");
    drawDISCClassic('discChange', 'change', hasilDISC.change.D, hasilDISC.change.I, hasilDISC.change.S, hasilDISC.change.C, "#18b172");
    await new Promise(r=>setTimeout(r,80)); // Delay penting!
  }

 

  // ========== GRAFIK DISC (CANVAS ke PDF) ==========
try {
  const imgMost   = document.getElementById('discMost')?.toDataURL('image/png') || null;
  const imgLeast  = document.getElementById('discLeast')?.toDataURL('image/png') || null;
  const imgChange = document.getElementById('discChange')?.toDataURL('image/png') || null;

  // Ukuran lebih kecil, muat semua di tengah
  const imgWidth = 28, imgHeight = 60;
  const gap = 3;
  const totalWidth = imgWidth * 3 + gap * 2;
  const xStart = pageWidth / 2 - totalWidth / 2;

  if (imgMost)   doc.addImage(imgMost,   'PNG', xStart, ySection, imgWidth, imgHeight);
  if (imgLeast)  doc.addImage(imgLeast,  'PNG', xStart + imgWidth + gap, ySection, imgWidth, imgHeight);
  if (imgChange) doc.addImage(imgChange, 'PNG', xStart + (imgWidth + gap) * 2, ySection, imgWidth, imgHeight);

  // Label bawah grafik
  doc.setFontSize(7);
  doc.setTextColor(33, 118, 199); 
  doc.text('Most (P)', xStart + imgWidth / 2, ySection + imgHeight + 6, { align: 'center' });
  doc.setTextColor(222, 144, 0);  
  doc.text('Least (K)', xStart + imgWidth + gap + imgWidth / 2, ySection + imgHeight + 6, { align: 'center' });
  doc.setTextColor(24, 177, 114); 
  doc.text('Change', xStart + (imgWidth + gap) * 2 + imgWidth / 2, ySection + imgHeight + 6, { align: 'center' });
  doc.setTextColor(44, 62, 80);

  ySection += imgHeight + 12; // Lebih irit spasi
  if (ySection > 265) { doc.addPage(); ySection = 20; }
} catch (e) {}

  // ========== TABEL NILAI DISC ==========
  doc.setFontSize(8.5);
  const tableX = pageWidth / 2 - 54;
  let tY = ySection;
  doc.setFont(undefined, 'bold');
  doc.text('Line', tableX, tY);
  doc.text('D', tableX+22, tY);
  doc.text('I', tableX+33, tY);
  doc.text('S', tableX+44, tY);
  doc.text('C', tableX+55, tY);
  doc.text('*', tableX+66, tY);
  doc.text('Total', tableX+77, tY);
  doc.setFont(undefined, 'normal');
  tY += 4;
  // Most row
  doc.text('Most (P)', tableX, tY);
  doc.text(`${hasilDISC.most.D || 0}`, tableX+22, tY);
  doc.text(`${hasilDISC.most.I || 0}`, tableX+33, tY);
  doc.text(`${hasilDISC.most.S || 0}`, tableX+44, tY);
  doc.text(`${hasilDISC.most.C || 0}`, tableX+55, tY);
  doc.text(`${hasilDISC.most['*'] || 0}`, tableX+66, tY);
  doc.text(
    `${(hasilDISC.most.D||0)+(hasilDISC.most.I||0)+(hasilDISC.most.S||0)+(hasilDISC.most.C||0)+(hasilDISC.most['*']||0)}`,
    tableX+77, tY
  );
  tY += 4;
  // Least row
  doc.text('Least (K)', tableX, tY);
  doc.text(`${hasilDISC.least.D || 0}`, tableX+22, tY);
  doc.text(`${hasilDISC.least.I || 0}`, tableX+33, tY);
  doc.text(`${hasilDISC.least.S || 0}`, tableX+44, tY);
  doc.text(`${hasilDISC.least.C || 0}`, tableX+55, tY);
  doc.text(`${hasilDISC.least['*'] || 0}`, tableX+66, tY);
  doc.text(
    `${(hasilDISC.least.D||0)+(hasilDISC.least.I||0)+(hasilDISC.least.S||0)+(hasilDISC.least.C||0)+(hasilDISC.least['*']||0)}`,
    tableX+77, tY
  );
  tY += 4;
  // Change row
  doc.text('Change', tableX, tY);
  doc.text(`${hasilDISC.change.D>=0?'+':''}${hasilDISC.change.D||0}`, tableX+22, tY);
  doc.text(`${hasilDISC.change.I>=0?'+':''}${hasilDISC.change.I||0}`, tableX+33, tY);
  doc.text(`${hasilDISC.change.S>=0?'+':''}${hasilDISC.change.S||0}`, tableX+44, tY);
  doc.text(`${hasilDISC.change.C>=0?'+':''}${hasilDISC.change.C||0}`, tableX+55, tY);
  doc.text(`${hasilDISC.change['*']>=0?'+':''}${hasilDISC.change['*']||0}`, tableX+66, tY);
  doc.text(
    `${(hasilDISC.change.D||0)+(hasilDISC.change.I||0)+(hasilDISC.change.S||0)+(hasilDISC.change.C||0)+(hasilDISC.change['*']||0)}`,
    tableX+77, tY
  );
  ySection = tY + 8;
  if (ySection > 265) { doc.addPage(); ySection = 20; }

  // ========== CEK INVALID DULU ==========
  const starMost = Number(hasilDISC.most['*'] || 0);
  const starLeast = Number(hasilDISC.least['*'] || 0);
  const totalStar = starMost + starLeast;
  const identity = appState.identity || {};
  let blokX = 16;
  let blokW = 82;

 if (totalStar >= 13) {
  if (identity.position) {
    blokHeading(doc, `Analisis Posisi: ${identity.position}`, [33,33,33], blokX, ySection, 80, 8);
    ySection += 10;
    doc.setFontSize(16);
    doc.setTextColor(200,24,44);
    doc.text("❌ INVALID", blokX+2, ySection);
    doc.setTextColor(44,62,80);
    doc.setFontSize(8.2);
    ySection += 14;
    if (ySection > 265) { doc.addPage(); ySection = 20; }
  }
  // Tambahkan paragraf penjelasan detail, jangan menyebut bintang!
  const invalidMsg = [
    "Berdasarkan analisis terhadap pola jawaban yang Anda berikan pada tes DISC, hasil tes ini dinyatakan tidak valid untuk digunakan dalam penilaian kepribadian. Ketidaksesuaian ini menunjukkan bahwa respons yang diberikan tidak merefleksikan kecenderungan kepribadian Anda yang sebenarnya, sehingga analisis lebih lanjut tidak dapat dilakukan secara objektif.",
    "Perlu ditekankan bahwa setiap alat psikotes, termasuk DISC, telah didesain dengan prinsip validitas dan reliabilitas yang tinggi sehingga tidak dapat dimanipulasi. Mengisi tes dengan mencoba menampilkan citra tertentu atau menyesuaikan jawaban dengan ekspektasi hasil hanya akan menghasilkan data yang bias dan tidak mencerminkan diri Anda yang sesungguhnya.",
    "Integritas dalam mengisi tes kepribadian sangat penting untuk memperoleh gambaran yang akurat mengenai potensi, pola perilaku, serta area pengembangan diri. Jawaban yang jujur dan sesuai kondisi diri sendiri merupakan kunci agar hasil analisis benar-benar dapat digunakan untuk tujuan pengembangan, penempatan posisi, atau konsultasi psikologi secara efektif.",
    "Apabila Anda merasa hasil ini tidak mencerminkan diri Anda, penting untuk merenungkan kembali cara pengisian tes di masa mendatang. Isilah setiap tes psikologi dengan kejujuran, spontanitas, dan sesuai instruksi, tanpa upaya untuk mengarahkan hasil, demi memperoleh manfaat yang utuh dari proses psikotes yang Anda jalani."
  ];
  invalidMsg.forEach(par => {
    const lines = doc.splitTextToSize(par, 152);
    lines.forEach(line => {
      doc.text(line, blokX+2, ySection);
      ySection += 3.1;
    });
    ySection += 1.5;
  });
  // Tetap lanjut ke proses jawaban (tidak usah break, biar selesai bagian jawaban)
} else {
  // ================= ANALISIS DISC (Most / Least / Change) =================
  const most   = analisa2DominanDISC(hasilDISC.most.D,  hasilDISC.most.I,  hasilDISC.most.S,  hasilDISC.most.C,  'most',  getPixelY);
  const least  = analisa2DominanDISC(hasilDISC.least.D, hasilDISC.least.I, hasilDISC.least.S, hasilDISC.least.C, 'least', getPixelY);
 const change = analisa2DominanDISC(hasilDISC.change.D,hasilDISC.change.I,hasilDISC.change.S,hasilDISC.change.C,'change',getPixelY);

  // ======================= ROLES MAP (ISI SESUAI KEBUTUHAN) =======================
  // CATATAN:
  // - KUNCI HARUS EXACT (urutan huruf sama persis). TIDAK ada pembalikan (ID ≠ DI).
  // - Jika kunci tidak ada / array kosong, kolom akan tampil kosong (tanpa fallback).
  const rolesMap = {
    // ----- 1 HURUF (exact) -----
    D: ["Attorney, Researcher, Sales Representative, Planning Consultant, Transport Personnel, Production (Director, Manager, Supervisor), Technologist, Strategic Planning, Trouble Shooting, Marketing Services, Consultant, Engineering (Director, Manager, Supervisor) and Self-Employment."],
    I: ["Promoting, Demonstrating, Canvassing, Marketing Services, Public Relations, Lecturing, Advertising, Publican, Publishing, Hospitality, Retail-General, Human Resources, Journalist, Singers, Technical Writing, Tour Guide, Promotional Work, Hotelier, Dancers, Host, Actors, Travel Agent, Politician, and very soft selling."],
    S: ["Administrative Work, Engineering and Production areas (Sales, Services, Project, Painter, Plumber, Draughtsman, Designer, Operative), Chef, Accounting, Telemarketing/Tele-Sales, Research and Development, Administrator, Florist/Floral Designer, Retail-General, Sales-General, Accounting-General, Service-General, Landscape Gardener"],
    C: ["Planner (any function), Engineer (Installation, Technical), Technical/Research (Chemist Technician), Academic, Statistician, Government Worker, IT Management, Prison Officer, Quality Controller."],

    // ----- 2 HURUF (EXACT, 12 kombinasi) -----
    DI: ["General Management (Directing/Managing/Supervising, Public Relations, Business Management, Conflict Resolution, Industrial Relations, Business Consultant, Trouble Shooting, Sales and Sales Management, Marketing, Promoting, Production (Director, Manager, Supervisor), Consultancy, Publishing, Sales Executive, Promotional Work, Brokers, Self-Employment, Advertising, Lecturing, Dealing/Broking)"],
    ID: ["Sales and Marketing (Directing, Manager, Person), Public Relations, Recruitment Consultant, Politician, Director, Self-Employed, Hotelier, Travel Agent, Trainer, Hospitality, Lawyer, Solicitor, Motivators, Team Leader, Politician, Trainer, Lecturer, Theatrical Agent, General Management and Leading People, Attorney"],
    DS: ["Engineering and Production (Directing, Managing, Supervising), Project Management, Researcher, Chemist (R&D), Planner, Engineering (R&D), Systems Analyst, Commercial Planner, Computer Engineer, Programmer, IT, Other computer-related disciplines, Technical Trouble Shooting and Directing, Lawyer, Solicitor, Development Engineer, Work Study, Barrister, Attorney."],
    SD: ["Investigator, Researcher, Accountant, Engineering, Production/Engineering Supervisor, Computer Specialist, Architect, Transport/Warehouse Supervisor, Credit Controller, DP Supervisor, Computer Specialist, Research and Development, Private Investigator, Quality Controller, Engineering (Designer, Draughtsman, Project Engineer), Sales and Service Engineer, Property Manager, Attorney, Administration Manager."],
    DC: ["Engineering (Management, Research, Design), Actuaries, Research (R&D), Planning, Chemist, Hospital Supervisor, Industrial Marketing, Investment Banking, Medical Administrator, Mortgage Brokers, Accountancy, Fund Management, Specialist Finance, Quality Control and Specialist work in any area where knowledge and experience is available, Production, Financial Services, Technical Management, Project Leader, Matron, Strategic Planning, Industrial Marketing."],
    CD: ["Engineering (Management, Research, Design), Research (R&D), Planning, Chemist, Accountancy, Specialist, Finance, Technician, Quality Control, Production Planning/Management, Design Engineer, Bookkeeper, Chemist Technician, Safety Officer, Librarian."],
    IS: ["Personnel, Welfare, Training, Hotelier, Promoting, Travel Agent, Lecturing, Upmarket/Speciality Sales, Soft/Service Selling, Beauty Therapist, Psychologist, Nursing, Human Resources, Retail-Specialist, Veterinarian, Social Work, Personal Assistant, Personnel-HR, Coach, Mentor."], 
    SI: ["Personnel Welfare, Training, Hotelier, Promoting, Travel Agent, Lecturing, Child Care, Charitable Organizations, Soft or Service Selling, Psychologist, Therapist, Nurse, Personal Assistant, Hospitality Manager, Social Work, Student Services, Upmarket/Speciality Sales."],
    IC: ["Teaching, Training, Inventing, Specialist Selling (Engineering, Finance or any area involving capital equipment), Project Engineer, Finance, Service Engineer or Supervising within a Technical/Specialist Area, Public Relations, Environmentalist, Marketing, Conference Organiser, Estate Agent."], 
    CI: ["Sales (Technical/Specialist), Public Relations, Lecturer, Academic, Personnel Administration, Purchasing, Travel Agent, Training, Teaching, Real Estate Agent, Hospitality Administration, Sales-Technical, Hotelier, Project Engineer, Service Engineer."],
    SC: ["Office (Manager, Supervisor, Person), Chief Clerk, General Administrator, Production Supervisor, Planner, Accountant, Research and Development, Flight Attendant, Engineering (Project Manager, Supervisor, Technician), Computer Programmer, Draughtsman, Soft/Service Selling, Doctor, Cashier, Receptionist, Data Entry, Planner, Word Processing, Property Manager, Database Administrator, Health Care, Statistician, Nursing-Administration, Company Secretary, System Analyst, Programmer, Statistician, Accounting-General, Security Specialist."], 
    CS: ["Researcher (Technician, Chemist, Quality Control), Engineer (Project, Draughtsman, Armed Forces, Designer), Statistician, Surveyor, Optician, Medical Specialist, Health Care, IT Management, Planner, Technical Writing, Production, Dentist, Quality Control, Planning, Dental Technician, Accounting, Computer Programmer, Psychologist, Surgeon, Architect, Medical Specialist."],

    // ----- 3 HURUF (EXACT, 24 kombinasi) -----
    // DIS set
    DIS: ["Engineering and Production (Directing, Managing, Supervising), Sales, Sales Management, Service Manager, Distribution, Public Relations, Office Management, Account Manager, Customer Service, Retail Manager, IT, Lecturer, Logistics, Manager-General, National Accounts Manager, Teacher, Projects Manager."], 
    DSI: ["Engineering and Production (Directing, Managing, Supervising), Sales, Sales Management, Service Manager, Distribution, Public Relations, Creative Designer, Office Management, Chief Engineer, Business Consultant, Chief Financial Officer, Customer Service, National Accounts Manager, Chief Accountant, Lecturer, Projects Manager, Research Planning, Human Resources, Scientific Work, Security Specialist, Solicitor, Planner, Production Administrator."], 
    IDS: ["Hotelier, Customer Service, Complaints Manager, Recruiting Agent, Sales (Manager/Person), Marketing Services, Public Relations, Politician, Computer Software Sales, Lecturer, Engineering and Production (Manager/Supervisor)."], 
    ISD: ["Hotelier, Community Counseling, Customer Service, Complaints Manager, Community Work, Recruitment Consultant, Hospitality, Teacher, Telemarketing, Production Manager, Complaints Manager, Recruiting Agent, Sales (Manager/Person), Marketing Services, Public Relations, Politician, Call Centre Manager, Lecturer, Engineering and Production (Manager/Supervisor)."], 
    SDI: ["Engineering and Production (Supervision), Service Selling, Distribution and Warehouse Supervision/Manager, Office Management, Customer Service, System Analyst, Radio Announcer, Technical Writing, Telemarketing, TV Presenter, Project Engineer, Film Producer, Programmer, Sales/Service Engineer, Accounting, Draughtsman, Project Engineer."], 
    SID: ["Engineering and Production (Supervision), Service Selling, Distribution and Warehouse Supervision, Office Management, Customer Service, System Analyst, Programmer, Sales/Service Engineer, Accounting, Draughtsman, Project Engineer."],
    // DIC set
    DIC: ["Technical/Scientific (Directing, Management, Supervision), Engineering, Finance, Production Planning, Personnel Disciplines, Self-Employment, Credit Manager, Planner, Fund Management, Computer Hardware/Software Sales, IT, Business Consultant, Banking, Logistics, Lecturing, Work Study, Film Director, Transport, Consultancy, Industrial Relations and Computers (Selling, Software, Systems Analyst) and General Manager."], 
    DCI: ["Technical/Scientific (Directing, Management, Supervision), Engineering, Finance, Production Planning, Personnel Disciplines, Self-Employment, Credit Manager, Planner, Lecturing, Work Study, Transport, Consultancy, Industrial Relations and Computers (Selling, Software, Systems Analyst) and General Manager."], 
    IDC: ["Specialist/Technical Selling (Computer, Finance, Engineer and others, Chef, Technical/Capital Equipment Selling), Financial (Manager, Specialist), Computer Hardware Sales, Engineering (Manager, Designer, Buyer, Draughtsman), Project Engineer, Sales Engineer, Consultant, Trainer, Lecturer, Hotelier, Insurance, Mortgage and Finance Sales, Teacher, Travel Agent, Personnel and Marketing Services."], 
    ICD: ["Specialist/Technical Selling (Computer, Finance, Engineer and others, Technical/Capital Equipment Selling), Financial (Manager, Specialist), Engineering (Manager, Designer, Buyer, Draughtsman), Project Engineer, Sales Engineer, Consultant, Trainer, Lecturer, Hotelier, Travel Agent, Personnel and Marketing Services"], 
    CDI: ["Directing, Managing or Supervising (Engineering, Research, Finance, Planning), Designer, Work Study, Sales (Technical/ Specialist), Logistic Support, Systems Analyst, Lecturer, Company Secretary, Negotiator and Purchasing."], 
    CID: ["Directing, Managing or Supervising (Engineering, Research, Finance, Planning), Designer, Work Study, Sales (Technical/Specialist), Lecturer, Company Secretary, Negotiator and Purchasing."],
    // DSC set
    DSC: ["Engineering and Production (Directing, Managing, Supervising), Sales, Sales Management, Service Manager, Distribution, Public Relations, Creative Designer, Office Management, Chief Engineer, Business Consultant, Chief Financial Officer, Customer Service, National Accounts Manager, Chief Accountant, Lecturer, Projects Manager, Research Planning, Human Resources, Scientific Work, Security Specialist, Solicitor, Planner, Production Administrator."], 
    DCS: ["Engineering, Production and Finance (Directing, Administrating, Managing and Managing Specialist Work), Scientific, Research Planning, Personnel, Trouble Shooting, Credit Control, Chief Accountant, Accountant, Chief Engineer, Work Study, Consultancy, Designer, Draughtsman, Project Work, Security Specialist, Doctor, Attorney."], 
    SDC: ["Directing, Managing or Supervising (in Engineering, Accountancy, Research and Development and Computing disciplines), Research Manager, Scientific Work, Accountant, Administration, Project Engineer, Draughtsman, Designer, Analyst, Finance, Chemist, Technical Service Support, Flight Attendant, Technician, Service Engineer, Service Manager, Security Specialist."], 
    SCD: ["Directing, Managing or Supervising (in Engineering, Accountancy, Research and Development and Computing disciplines), Accountant, Project Engineer, Draughtsman, Designer, Analyst, Chemist, Technician, Service Engineer, Manager, Security Specialist."], 
    CSD: ["Engineering, Research Director, Production and Finance (Director, Manager, Supervisor), Work Study, Accountant, Administrator, Quality Controller, Financial Services Manager, Safety Officer, Market Analyst, Planner and Personnel (Director, Manager, Administrator), MIS Manager, Electrician, Security Manager, Financial Researcher, Planner, Printer, Production Controller, Production Manager, Personnel Management, Loss Control."], 
    CDS: ["Engineering, Research, Production and Finance (Director, Manager, Supervisor), Work Study, Accountant, Administrator, Quality Controller, Safety Officer, Market Analyst, Planner and Personnel (Director, Manager, Administrator), MIS Manager, Security Manager, Loss Control."],
    // ISC set
    ISC: ["Actors, Chef, Personnel, Welfare, Broadcasting, Training, Attorney, Teaching, Accounting, Technical Instructor, Accounting-General, Accounts Supervisor, Customer Services, Public Relations, Artist, Hotelier, Demonstrator, Florist/Floral Designer, Engineering (Sales, Service, Project, Draughtsman, Designer), Graphic Designer, Specialist (Soft/Services), Selling, Purchasing, Singers, Technical Instructor, Personnel Management, Politician, Supervising (Engineering, Production, Accounts), Administration Work, Sales Engineer, Secretarial, Industrial Relations Specialist."], 
    ICS: ["Personnel, Welfare, Training, Attorney, Teaching, Accounting, Technical Instructor, Customer Services, Public Relations, Artist, Hotelier, Demonstrator, Engineering (Sales, Service, Project, Draughtsman, Designer), Specialist (Soft/Services), Selling, Purchasing, Supervising (Engineering, Production, Accounts), Administration Work, Secretarial, Industrial Relations Specialist."], 
    SIC: [
      // contoh isi untuk SIC (EXACT); silakan ubah/isi sesuai versi kamu
      "Personnel Welfare, Training, Teaching, Attorney, Accounting, Technical Instructor, Customer Service, Public Relations, Artist, Hotelier, Demonstrator, Engineer (Sales, Service, Project, Draughtsman, Designer), Specialist (Soft/Service), Selling, Purchasing, Supervising (Engineering, Production, Accounts) Administrative Work, Secretarial."
    ], 
    SCI: ["Personnel Welfare, Administrator, Advisers, Training, Teaching, Attorney, Accounting, Counseling, Technical Instructor, Customer Service, Accounting-General, Public Relations, Accounts Supervisor, Artist, Hotelier, Demonstrator, Engineer (Sales, Service, Project, Draughtsman, Designer), Specialist (Soft/Service), Selling, Purchasing, Sales Engineer, Legal, Negotiator, Student Service, Photographer, Physiotherapist, Project Engineer, Vocational Education, Supervising (Engineering, Production, Accounts) Administrative Work, Demonstrator, Secretarial, Hospitality Manager."], 
    CIS: ["Engineering and Production (Supervisor, Installer, Technician, Service and Design), Research (Supervisor, Chemist, Lab. Technician), Trainer, Finance (Supervisor, Accountant, Advisor), Public Relations, Administration, Office Administrator, Market Analyst, System Analyst, Programmer, Selling (Technical/Service)."], 
    CSI: ["Engineering and Production (Supervisor, Installer, Technician, Service and Design), Research (Supervisor, Chemist), Trainer, Finance (Manager, Supervisor, Accountant, Advisor), Public Relations-Administration, Purchasing, Chemist Research, Office Administrator, Computer Programmer, Market Analyst, System Analyst, Programmer, Research and Development Supervisor, Laboratory Technician, Legal, Selling (Technical/Service)."],

    // (opsional) 4 huruf
    DISC: []
  };

  // ============== Helper: AMBIL REKOMENDASI HANYA DARI KUNCI EXACT ==============
  function pickRolesFromDominan(dom) {
    const d = (dom || []).filter(Boolean).slice(0, 3);
    const key = d.join('').toUpperCase();   // contoh: ['S','I','C'] -> "SIC"
    const arr = rolesMap.hasOwnProperty(key) ? rolesMap[key] : [];
    return Array.isArray(arr) ? arr : [];
  }

  // ================= Ambil rekomendasi TERPISAH per grafik =================
  const rolesMost   = pickRolesFromDominan(most.dominan);
  const rolesLeast  = pickRolesFromDominan(least.dominan);
  const rolesChange = pickRolesFromDominan(change.dominan);
(function renderThreeColumns() {
  const left = blokX;                                       // margin kiri area tulis
  const topMargin = 20, bottomMargin = 20;
  const pageH = doc.internal.pageSize.getHeight ? doc.internal.pageSize.getHeight() : 297;
  const yLimit = pageH - bottomMargin;

  const gap    = 10;                                        // jarak antar kolom (lebih besar biar jelas terpisah)
  const lineH  = 3.4;
  const subHeadH = 6;                                       // tinggi subjudul kolom (tanpa bar background)
  const subHeadGap = 5;                                     // jarak subjudul -> isi
  const sectionHeadH = 10;                                  // tinggi banner section
  const sectionHeadGap = 8;                                 // jarak banner -> subjudul kolom
  const gutter = 2;                                         // gutter dalam kolom (kiri/kanan)

  const blokW = pageWidth - 2 * left;
  const colW  = (blokW - 2 * gap) / 3;

  doc.setFontSize(8);

  function measureColHeight(list) {
    let h = 0;
    list.forEach(role => {
      const lines = doc.splitTextToSize('- ' + role, colW - 2 * gutter);
      h += lines.length * lineH;
    });
    return h;
  }

  const hMost   = measureColHeight(rolesMost);
  const hLeast  = measureColHeight(rolesLeast);
  const hChange = measureColHeight(rolesChange);

  // total tinggi yang dibutuhkan untuk SELURUH paket
  const contentH = Math.max(hMost, hLeast, hChange);
  const needH = sectionHeadH + sectionHeadGap +           // banner
                subHeadH + subHeadGap +                   // baris subjudul kolom
                contentH + 4;                             // isi + padding bawah

  // keep-together
  if (ySection + needH > yLimit) {
    doc.addPage();
    ySection = topMargin;
  }

  // ===== Banner section (satu, lebar penuh) =====
  doc.setFillColor(61,131,223);
  doc.rect(left - 2, ySection - 4, blokW, sectionHeadH, 'F');
  doc.setTextColor(255,255,255);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.text("REKOMENDASI KARIR", left + 2, ySection + 2);

  // reset style untuk isi
  ySection += sectionHeadH + sectionHeadGap;
  doc.setTextColor(0,0,0);
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');

  // koordinat kolom
  const xMost   = left;
  const xLeast  = left + colW + gap;
  const xChange = left + 2 * (colW + gap);

  // ===== Subjudul kolom (tanpa bar background supaya tidak “menyatu”) =====
  doc.text("Most (P)",   xMost + gutter,   ySection);
  doc.text("Least (K)",  xLeast + gutter,  ySection);
  doc.text("Change (P-K)", xChange + gutter, ySection);

  // garis tipis di bawah subjudul agar tegas terpisah
  doc.setDrawColor(200,200,200);
  doc.line(xMost,   ySection + 1.5, xMost   + colW, ySection + 1.5);
  doc.line(xLeast,  ySection + 1.5, xLeast  + colW, ySection + 1.5);
  doc.line(xChange, ySection + 1.5, xChange + colW, ySection + 1.5);

  // jarak aman ke isi
  ySection += subHeadGap;
  doc.setFont(undefined, 'normal');

  function printCol(list, x, y) {
    let yy = y;
    list.forEach(role => {
      const lines = doc.splitTextToSize('- ' + role, colW - 2 * gutter);
      lines.forEach(line => {
        doc.text(line, x + gutter, yy);
        yy += lineH;
      });
    });
    return yy;
  }

  const yEndMost   = printCol(rolesMost,   xMost,   ySection);
  const yEndLeast  = printCol(rolesLeast,  xLeast,  ySection);
  const yEndChange = printCol(rolesChange, xChange, ySection);

  // garis pemisah vertikal samar (opsional; membantu persepsi tidak "menyatu")
  doc.setDrawColor(235,235,235);
  const colTop = ySection - subHeadGap + 1.5;             // sedikit di atas isi (tepat setelah garis subjudul)
  const colBottom = Math.max(yEndMost, yEndLeast, yEndChange);
  doc.line(xLeast - gap/2,  colTop, xLeast - gap/2,  colBottom);
  doc.line(xChange - gap/2, colTop, xChange - gap/2, colBottom);

  ySection = colBottom + 4;
})();


  // ===================== Kecocokan POSISI (opsional, pakai Most) =====================
  let simbol = "-";
  let detail = "";
  if (identity.position) {
   const persyaratan = {
  "Administrator": {
    sangat: ["SC","DC"],
    cocok:  ["CS","CD"],
    cukup:  ["SD","IS"]
  },
  
  "Dosen/Guru": {
    sangat: ["IS","IC","SI","SC"],
    cocok:  ["ID","SD"],
    cukup:  ["CS","CI"]
  },

  "Technical Staff": {
    sangat: ["DC","SC"],
    cocok:  ["CD","CS"],
    cukup:  ["DS","SD"]
  },

  "IT Staff": {
    sangat: ["DC","CD"], 
    cocok:  ["SC","CS"],
    cukup:  ["SD","DS"]
  },

  "Manajer": {
    sangat: ["DI","ID","DC","CD"],
    cocok:  ["DS","IS"],
    cukup:  ["SC","CS"]
  },

  "Housekeeping": {
    sangat: ["SC","CS"],
    cocok:  ["SI","IC"],
    cukup:  ["SD","DS"]
  }
};


    function makePairs(dom) {
      const d = (dom||[]).slice(0,3);
      const out = [];
      for (let i=0;i<d.length;i++) for (let j=i+1;j<d.length;j++) {
        out.push(d[i]+d[j], d[j]+d[i]); // di bagian posisi ini memang dua arah
      }
      return out;
    }
    const pairSet = makePairs(most.dominan);
  const posReq = persyaratan[identity.position];

if (posReq) {
  if (posReq.sangat.some(code => pairSet.includes(code))) {
    simbol = "SS";     // Sangat Sesuai
  } else if (posReq.cocok.some(code => pairSet.includes(code))) {
    simbol = "C";      // Cocok
  } else if (posReq.cukup.some(code => pairSet.includes(code))) {
    simbol = "CC";     // Cukup Cocok
  } else {
    simbol = "K";      // Kurang / Tidak Sesuai
  }
}


    if (identity.teacherLevel) {
      if (identity.teacherLevel === "SD"  && most.dominan.includes("I")) detail += "Sangat cocok untuk mengajar anak-anak.";
      if (identity.teacherLevel === "SMA" && most.dominan.includes("C")) detail += (detail ? " " : "") + "Cocok untuk mata pelajaran eksakta.";
    }

    let tinggiPos = 13 + (detail ? doc.splitTextToSize(detail, pageWidth-36).length*3.2 : 0);
    ySection = ensureSpace(doc, ySection, tinggiPos);
    blokHeading(doc, `Analisis Posisi: ${identity.position}`, [33,33,33], blokX, ySection, 80, 8);
    ySection += 10;
    doc.setFontSize(16);
    doc.text(simbol, blokX+2, ySection);
    doc.setFontSize(8.2);
    ySection += 5;
    if (detail) {
      let detLines = doc.splitTextToSize(detail, pageWidth-36);
      doc.text(detLines, blokX+2, ySection); ySection += detLines.length*3.2 + 2;
    }
    ySection += 5;
    if (ySection > 265) { doc.addPage(); ySection = 20; }
  }

 // ========== KESIMPULAN 3 GRAFIK + KECOCOKAN POSISI ==========

if (identity.position) {
  const nickname = identity.nickname || "Peserta";
  const posisi = identity.position;

  const gabunganAnalisis = (() => {
    const introMost  = `• Grafik Most (P): Menunjukkan kepribadian alami ${nickname} dalam kondisi nyaman.`;
    const mostDetails = [
      `  - Tipe Dominan: ${most.dominan.join(' dan ')} (${most.ranking})`,
      `  - Deskripsi: ${stripHTML(most.deskripsi)}`,
      `  - Implikasi: ${getImplication(most.dominan.join(""), 'most', posisi)}`
    ].join('\n');

    const introLeast  = `• Grafik Least (K): Menggambarkan respons ${nickname} terhadap tekanan dan tantangan.`;
    const leastDetails = [
      `  - Tipe Dominan: ${least.dominan.join(' dan ')} (${least.ranking})`,
      `  - Deskripsi: ${stripHTML(least.deskripsi)}`,
      `  - Implikasi: ${getImplication(least.dominan.join(""), 'least', posisi)}`
    ].join('\n');

    const introChange  = `• Grafik Change (P-K): Merefleksikan kemampuan adaptasi ${nickname} antara situasi normal dan tekanan.`;
    const changeDetails = [
      `  - Kombinasi Dominan: ${change.dominan.join(' dan ')} (${change.ranking})`,
      `  - Deskripsi: ${stripHTML(change.deskripsi)}`,
      `  - Implikasi: ${getImplication(change.dominan.join(""), 'change', posisi)}`
    ].join('\n');

    return [
      introMost, mostDetails, "",
      introLeast, leastDetails, "",
      introChange, changeDetails
    ].join('\n');
  })();


  // ===================== SIMBOL KE TEKS =====================
  const cocokStr = (
    simbol === "SS" ? "SANGAT SESUAI" :
    simbol === "C"  ? "COCOK" :
    simbol === "CC" ? "CUKUP COCOK" :
    simbol === "K"  ? "KURANG SESUAI" :
                      "TIDAK SESUAI"
  );


  // ===================== TEKS UTAMA =====================
  const kalimatCocok = `

TINGKAT KECOCOKAN:
• Posisi: ${posisi}
• ${simbol}
• Alasan: ${getCompatibilityReason(simbol, most.dominan[0], posisi)}
`;


  // ===================== CATATAN LEVEL (OPSIONAL) =====================
  let levelNote = "";
  if (identity.teacherLevel) {
    if (identity.teacherLevel === "SD" && most.dominan.includes("I")) {
      levelNote = "\n• Catatan Khusus: Gaya interpersonal yang hangat mendukung pembelajaran tingkat dasar.";
    }
    if (identity.teacherLevel === "SMA" && most.dominan.includes("C")) {
      levelNote = "\n• Catatan Khusus: Pendekatan analitis mendukung pengajaran eksakta tingkat menengah atas.";
    }
  }


  const kalimatAkhir = `

POTENSI PENGEMBANGAN:
${nickname} memiliki potensi untuk:
- Beradaptasi secara efektif dalam lingkungan kerja baru
- Berkontribusi positif melalui ${getStrengthArea(most.dominan[0])}
- Mengembangkan diri dalam peran ${posisi} melalui ${getDevelopmentArea(least.dominan[0])}`;

  const marginLR = 18;
  const blokW = pageWidth - 2 * marginLR;

  const sectionTitle = "KESIMPULAN ANALISIS DISC";
  ySection = ensureSpace(doc, ySection, 20);

  doc.setFillColor(61, 131, 223);
  doc.rect(blokX - 2, ySection - 4, blokW, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text(sectionTitle, blokX + 2, ySection + 2);

  ySection += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8.5);
  doc.setFont(undefined, 'normal');

  // Cetak gabungan analisis Most/Least/Change
  const lines = gabunganAnalisis.split('\n');
  lines.forEach(line => {
    if (!line.trim()) { ySection += 2; return; }
    const wrapLines = doc.splitTextToSize(line, blokW - 8);
    wrapLines.forEach(wrapLine => {
      ySection = ensureSpace(doc, ySection, 4);
      doc.text(wrapLine, blokX + 2, ySection);
      ySection += 4;
    });
  });

  // Cetak kecocokan posisi + catatan level + potensi pengembangan
  [kalimatCocok, levelNote, kalimatAkhir].forEach(chunk => {
    if (!chunk) return;
    ySection += 6;
    const wraps = doc.splitTextToSize(chunk, blokW - 8);
    wraps.forEach(w => { ySection = ensureSpace(doc, ySection, 4); doc.text(w, blokX + 2, ySection); ySection += 4; });
  });

  ySection += 8;
  if (ySection > 265) { doc.addPage(); ySection = 20; }

  // ====================== BERADAPTASI DENGAN LINGKUNGAN BERBEDA ======================
  // Catatan: Graph 1 = Most (P), Graph 2 = Least (K). Perubahan diukur berbasis Y-pixel.
  // Pada kanvas PDF: y lebih kecil = titik lebih ATAS (lebih dominan secara visual).

  // Helper untuk mengambil nilai {D,I,S,C} baik dari struktur {nilai:{...}} maupun langsung {...}
  const getAxisVals = (obj) => (obj && obj.nilai) ? obj.nilai : obj || {};
  const mVals = getAxisVals(most);
  const lVals = getAxisVals(least);

  // Y pixel pada masing-masing grafik (Most & Least)
  const yMost = {
    D: getPixelY('most',  'D', +(mVals.D ?? 0)),
    I: getPixelY('most',  'I', +(mVals.I ?? 0)),
    S: getPixelY('most',  'S', +(mVals.S ?? 0)),
    C: getPixelY('most',  'C', +(mVals.C ?? 0)),
  };
  const yLeast = {
    D: getPixelY('least', 'D', +(lVals.D ?? 0)),
    I: getPixelY('least', 'I', +(lVals.I ?? 0)),
    S: getPixelY('least', 'S', +(lVals.S ?? 0)),
    C: getPixelY('least', 'C', +(lVals.C ?? 0)),
  };

  // Delta pixel (Least - Most). Ingat: delta < 0 = naik (lebih atas, cenderung lebih terekspresikan); delta > 0 = turun.
  const dPx = {
    D: yLeast.D - yMost.D,
    I: yLeast.I - yMost.I,
    S: yLeast.S - yMost.S,
    C: yLeast.C - yMost.C,
  };

  // Formatter teks delta pixel
  const fmtPx = (v) => `${Math.abs(Math.round(v))} px`;

  // Klasifikasi signifikansi berbasis jarak pixel
  // 18px+ signifikan (tampak jelas); 10–17px moderat; <10px minor.
  const klasifikasi = (px) => {
    const a = Math.abs(Math.round(px));
    if (a >= 18) return { tingkat: "signifikan", penjelasan: "perubahan kuat & tampak dalam perilaku" };
    if (a >= 10) return { tingkat: "moderat",    penjelasan: "perubahan terasa pada situasi tertentu" };
    return         { tingkat: "minor",      penjelasan: "perubahan halus/nuansa" };
  };

  // Cek lintas midline (zona dominansi) untuk masing-masing faktor
  const isAbove = (tipe, axis, val) => {
    const mid = getMidline(tipe);
    const y   = getPixelY(tipe, axis, val);
    return Number.isFinite(y) ? (y <= mid) : false; // true = di atas midline (lebih menonjol)
  };
  const crossMid = (axis) => {
    const aMost  = isAbove('most',  axis, +(mVals[axis] ?? 0));
    const aLeast = isAbove('least', axis, +(lVals[axis] ?? 0));
    return aMost !== aLeast;
  };

  // Header section adaptasi
  ySection = ensureSpace(doc, ySection, 20);
  const blokXSafe = (typeof blokX !== 'undefined') ? blokX : marginLR;
  const blokW2    = pageWidth - 2 * marginLR;

  doc.setFillColor(61, 131, 223);
  doc.rect(blokXSafe - 2, ySection - 4, blokW2, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text("BERADAPTASI DENGAN LINGKUNGAN BERBEDA", blokXSafe + 2, ySection + 2);

  // Paragraf pembuka
  ySection += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8.5);
  doc.setFont(undefined, 'normal');

  const pembuka = [
    `Pada lembar ini, ${nickname} diminta melihat ketiga grafik dan materi profil secara utuh.`,
    `Perubahan dari Grafik 1 (Most) ke Grafik 2 (Least) sering merefleksikan respons terhadap stres/lingkungan.`,
    `Perubahan dapat membantu ${nickname} mengatasi tuntutan situasi atau menjadi sinyal untuk menata strategi adaptasi.`,
    `Dengan personal feedback, ${nickname} dapat melakukan self-monitor dan menggunakan informasi ini secara positif.`,
    "",
    "Bandingkan Grafik 1 dan 2. Saat berada pada Grafik 2 (Least), perhatikan pergeseran tiap faktor (naik/turun/konstan) dibandingkan Grafik 1 (Most):"
  ];

  pembuka.forEach(line => {
    if (!line.trim()) { ySection += 2; return; }
    const wraps = doc.splitTextToSize(line, blokW2 - 8);
    wraps.forEach(w => { ySection = ensureSpace(doc, ySection, 4); doc.text(w, blokXSafe + 2, ySection); ySection += 4; });
  });

  // Narasi per faktor (berbasis pixel, lintas midline, dan kaidah psikologi DISC)
  function barisFaktor(axis, dp, naikMsg, turunMsg, konstanMsg) {
    if (!Number.isFinite(dp)) return `- Faktor "${axis}": data tidak tersedia.`;
    const arah = (dp < 0) ? "naik" : (dp > 0) ? "turun" : "tetap";
    if (arah === "tetap") return `- Faktor "${axis}" tetap — ${konstanMsg}`;
    const kelas = klasifikasi(dp);
    const lintas = crossMid(axis) ? "; **melintasi midline** (zona dominansi berubah)" : "";
    const makna  = (dp < 0) ? naikMsg : turunMsg;
    return `- Faktor "${axis}" ${arah} ~${fmtPx(dp)} (${kelas.tingkat}${lintas}) — ${makna} (${kelas.penjelasan}).`;
  }

  const bulletD = barisFaktor(
    "D", dPx.D,
    `${nickname} menambah kontrol/asertivitas untuk menjaga arah & hasil saat tekanan meningkat.`,
    `${nickname} relatif melepas kontrol; lebih menerima arahan orang lain dalam situasi tertekan.`,
    "preferensi kontrol relatif stabil di berbagai konteks."
  );

  const bulletI = barisFaktor(
    "I", dPx.I,
    `${nickname} menguatkan komunikasi/persuasi dan menggalang dukungan sosial untuk menyelesaikan tugas.`,
    `${nickname} menahan komunikasi; interaksi dibuat lebih selektif & fungsional.`,
    "gaya interaksi sosial cenderung konstan (tidak banyak berubah)."
  );

  const bulletS = barisFaktor(
    "S", dPx.S,
    `${nickname} mencari kestabilan & rasa aman; cenderung menghindari konflik dan menunggu timing yang tepat.`,
    `${nickname} bergerak lebih cepat; pengambilan keputusan cenderung lebih cepat/impulsif.`,
    "kebutuhan stabilitas/ketekunan relatif tidak berubah."
  );

  const bulletC = barisFaktor(
    "C", dPx.C,
    `${nickname} meningkatkan kebutuhan data/aturan; keputusan diambil setelah informasi memadai.`,
    `${nickname} lebih pragmatis; keputusan lebih mengandalkan pertimbangan praktis/"gut feeling".`,
    "kebutuhan ketelitian/kepatuhan relatif tetap."
  );

  [bulletD, bulletI, bulletS, bulletC].forEach(line => {
    const wraps = doc.splitTextToSize(line, blokW2 - 8);
    wraps.forEach(w => { ySection = ensureSpace(doc, ySection, 4); doc.text(w, blokXSafe + 2, ySection); ySection += 4; });
  });

  ySection += 8;
  if (ySection > 265) { doc.addPage(); ySection = 20; }

  // ====================== ANALISIS SIGNIFIKANSI & POLA PSIKOLOGIS (Most vs Least) ======================
  {
    // Dominansi atas-midline di masing-masing grafik
    const domMost  = getDominantByMidline('most',  +(mVals.D??0), +(mVals.I??0), +(mVals.S??0), +(mVals.C??0));
    const domLeast = getDominantByMidline('least', +(lVals.D??0), +(lVals.I??0), +(lVals.S??0), +(lVals.C??0));

    // Skor arah adaptasi agregat:
    // Faktor yang "naik" (Δy<0) dianggap makin diaktifkan saat tekanan.
    const asertifAktif = (dPx.D < 0 ? 1 : 0) + (dPx.I < 0 ? 1 : 0); // D/I → eksekusi & pengaruh
    const stabilAktif  = (dPx.S < 0 ? 1 : 0) + (dPx.C < 0 ? 1 : 0); // S/C → stabilitas & akurasi

    let arahAdaptasi = "";
    if (asertifAktif > stabilAktif) {
      arahAdaptasi = "Di bawah tekanan, pola bergerak ke **lebih asertif/eksekutif (D/I)**: menambah kontrol, mempercepat keputusan, dan/atau meningkatkan komunikasi pengaruh.";
    } else if (stabilAktif > asertifAktif) {
      arahAdaptasi = "Di bawah tekanan, pola bergerak ke **lebih stabil/akurasi (S/C)**: mencari kepastian proses, data, dan suasana yang aman sebelum melangkah.";
    } else {
      arahAdaptasi = "Di bawah tekanan, pola **seimbang** antara dorongan asertif (D/I) dan kebutuhan stabil-akurasi (S/C); penyesuaian bersifat kontekstual.";
    }

    const domMostStr  = domMost.join("-");
    const domLeastStr = domLeast.join("-");
    const ringkasDominansi = (domMostStr !== domLeastStr)
      ? `Dominansi bergeser: **Most:** ${domMostStr || "—"} → **Least:** ${domLeastStr || "—"}`
      : `Dominansi relatif **konsisten** antara Most & Least (${domMostStr || "—"})`;

    // Subjudul kotak tip
    ySection = ensureSpace(doc, ySection, 18);
    const blokW3 = pageWidth - 2 * marginLR;

    doc.setFillColor(230, 241, 255);
    doc.rect(blokXSafe - 2, ySection - 3, blokW3, 8, 'F');
    doc.setTextColor(0, 84, 153);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text("Analisis Signifikansi Perubahan & Pola Psikologis", blokXSafe + 2, ySection + 2);

    // Narasi psikologis makro + catatan etis
    ySection += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8.5);
    doc.setFont(undefined, 'normal');

    const narasi = [
      ringkasDominansi,
      arahAdaptasi,
      "Catatan interpretatif (kaidah psikologi DISC):",
      "• D (Dominance): terkait kontrol, keberanian mengambil keputusan, orientasi hasil.",
      "• I (Influence): terkait komunikasi, persuasi, jejaring sosial, optimisme.",
      "• S (Steadiness): terkait kestabilan, kesabaran, konsistensi ritme kerja.",
      "• C (Conscientiousness): terkait ketelitian, kepatuhan, akurasi berbasis data.",
      "",
      "Peringatan interpretasi: Hasil ini adalah gambaran preferensi perilaku dalam konteks kerja/tekanan; bukan diagnosis klinis.",
      "Gunakan bersama observasi lapangan dan umpan balik rekan/atasan untuk keputusan pengembangan yang proporsional."
    ];

    narasi.forEach(line => {
      const wraps = doc.splitTextToSize(line, blokW3 - 8);
      wraps.forEach(w => { ySection = ensureSpace(doc, ySection, 4); doc.text(w, blokXSafe + 2, ySection); ySection += 4; });
    });

    ySection += 8;
    if (ySection > 265) { doc.addPage(); ySection = 20; }
  }

} // endif identity.position




function getImplication(dominantType, graphType, position, nickname = appState.identity?.nickname || "Peserta") {
  const pos = position;
  const key = dominantType || '';
  const implications = {
    D: {
      Administrator: {
        most: `
Sebagai pribadi bertipe Dominan, ${nickname} menunjukkan peran yang sangat kuat dalam mengatur dan memimpin tim administrasi. ${nickname} sigap mengambil inisiatif, berani mengusulkan perbaikan sistem kerja, dan tidak segan menegakkan aturan demi menjaga ketertiban administrasi. Dorongan untuk terus bergerak maju, serta kemauan mendorong anggota tim ke arah produktivitas, membuat ${nickname} menjadi motor penggerak tercapainya standar administrasi yang tinggi dan efisien. Karakter ini sangat penting terutama ketika institusi membutuhkan ketegasan, percepatan, dan hasil nyata di bidang tata kelola administrasi.
        `.trim(),
        least: `
Saat menghadapi tekanan besar atau perubahan mendadak, karakter Dominan dalam diri ${nickname} dapat berubah menjadi kekakuan berlebihan dalam menjalankan aturan, bahkan menuntut standar yang sangat tinggi dari rekan kerja. Sikap ini kadang membuat suasana kerja tegang dan komunikasi menjadi kurang lancar. Maka penting bagi ${nickname} untuk selalu membuka komunikasi dua arah, meningkatkan empati, dan memperkuat kerja sama tim agar tekanan tidak berujung pada demotivasi anggota.
        `.trim(),
        change: `
Dalam menghadapi tekanan deadline administrasi atau perubahan sistem, ${nickname} tetap mampu menjaga kendali dan memberikan arahan yang jelas. Namun, tantangannya adalah membuka diri pada masukan rekan sejawat dan meningkatkan fleksibilitas, sehingga sistem kerja tetap adaptif dan efisien walaupun target berubah-ubah.
        `.trim()
      },
      Guru: {
        most: `
Sebagai sosok Dominan, ${nickname} tampil sebagai pemimpin kelas yang tegas dan mampu mengambil keputusan secara cepat. Karakter ini sangat mendukung pengelolaan kelas aktif, terutama ketika dibutuhkan tindakan tegas menjaga disiplin siswa. ${nickname} cenderung mampu membentuk suasana belajar yang terarah, memberikan arahan yang jelas, dan menjadi teladan keberanian serta kemandirian di lingkungan pendidikan. Kemampuan ini sangat penting untuk memastikan proses pembelajaran berjalan lancar dan target akademik tercapai.
        `.trim(),
        least: `
Saat tekanan atau konflik muncul di kelas, sisi Dominan pada ${nickname} bisa berubah menjadi kecenderungan otoriter, kurang sabar, bahkan terlalu menuntut siswa. Sikap seperti ini bisa mengurangi rasa nyaman siswa. Oleh sebab itu, ${nickname} perlu menyeimbangkan antara ketegasan dan empati, sehingga siswa tetap merasa dihargai serta dibimbing dengan hati.
        `.trim(),
        change: `
Menghadapi perubahan kurikulum, aturan sekolah, atau tekanan di kelas, ${nickname} tetap dapat menjaga peran pemimpin dan memastikan kelas berjalan sesuai rencana. Namun, fleksibilitas dan kreativitas dalam pendekatan belajar sangat penting agar kelas tidak hanya disiplin tapi juga mampu menyesuaikan diri dengan kebutuhan siswa yang beragam.
        `.trim()
      },
      "Technical Staff": {
        most: `
Dalam peran sebagai tenaga teknis, ${nickname} yang bertipe Dominan sangat sigap mengatasi masalah, berani mengambil keputusan perbaikan, dan mampu memimpin pelaksanaan solusi di lapangan. Dorongan untuk bergerak cepat, mencari solusi tuntas, serta menjaga standar mutu tinggi menjadi ciri utama kinerja ${nickname}. Karakter ini sangat dibutuhkan terutama pada situasi teknis yang memerlukan reaksi cepat dan ketegasan.
        `.trim(),
        least: `
Pada situasi tekanan atau konflik di tim teknis, kecenderungan Dominan dalam diri ${nickname} dapat membuatnya bertindak tergesa-gesa atau menuntut hasil sempurna dari tim. Akibatnya, komunikasi teknis bisa menjadi terlalu singkat, bahkan kurang sabar terhadap proses. Untuk itu, ${nickname} perlu melatih kemampuan komunikasi, mendengarkan pendapat anggota tim, dan menjaga suasana kerja tetap kondusif walaupun dalam tekanan.
        `.trim(),
        change: `
Ketika terjadi perubahan mendadak atau tekanan pekerjaan meningkat, ${nickname} tetap mampu bertahan dan bergerak cepat mengambil keputusan. Namun, di sisi lain, penting bagi ${nickname} untuk tetap mengutamakan prosedur keselamatan kerja, mendokumentasikan langkah-langkah teknis dengan teliti, serta terbuka terhadap masukan dari rekan teknis demi kelancaran operasional jangka panjang.
        `.trim()
      },
      Housekeeping: {
        most: `
Sebagai pribadi Dominan, ${nickname} sangat cepat dan tegas dalam mengambil keputusan untuk memastikan area kerja selalu bersih, rapi, serta memenuhi standar tinggi yang ditetapkan perusahaan. Karakter kepemimpinan ${nickname} sangat menonjol dalam mengatur ritme kerja tim, memotivasi anggota agar selalu bekerja optimal, serta tidak ragu menegur jika ditemukan pelanggaran aturan kebersihan. Komitmen terhadap hasil nyata serta dorongan untuk terus memperbaiki proses kerja menjadi fondasi utama yang membuat performa tim Housekeeping tetap prima dan disiplin.
        `.trim(),
        least: `
Ketika menghadapi tekanan tinggi, karakter Dominan dalam diri ${nickname} bisa muncul sebagai kecenderungan terlalu keras menegakkan aturan kebersihan atau menunjukkan ketidaksabaran pada anggota tim yang kurang disiplin. Sikap ini berisiko menciptakan jarak emosional dengan rekan kerja, menurunkan motivasi tim, dan membuat suasana kerja menjadi kurang kondusif. Penting bagi ${nickname} untuk meningkatkan sensitivitas komunikasi, memberikan umpan balik yang membangun, serta mengasah kemampuan mendengarkan agar suasana tim tetap harmonis di bawah tekanan.
        `.trim(),
        change: `
Pada saat beban kerja meningkat atau terjadi perubahan metode kerja, ${nickname} tetap mampu menyesuaikan strategi dengan cepat dan mengambil alih kendali situasi. Tantangan utamanya adalah membuka diri terhadap masukan anggota tim agar perubahan yang dilakukan lebih efektif dan diterima bersama. Kemampuan mengelola tekanan, mendelegasikan tugas secara proporsional, dan menumbuhkan semangat kolaborasi akan memperkuat peran ${nickname} sebagai pemimpin Housekeeping yang adaptif dan inspiratif.
        `.trim()
      }
    },
    DI: {
  Administrator: {
    most: `
Sebagai kombinasi Dominan–Influencer, ${nickname} memadukan ketegasan eksekusi dengan kemampuan memobilisasi orang. ${nickname} menetapkan standar tinggi, menuntut kejelasan otoritas, dan cepat mendorong perbaikan proses. Ia logis, kritis, dan imajinatif dalam memecahkan masalah—efektif sebagai motor perubahan administrasi yang progresif. Fokus tugas menjaga kinerja terarah, sementara sisi Influencer membangun dukungan lintas unit.
    `.trim(),
    least: `
Di bawah tekanan, sisi D-I pada ${nickname} bisa tampak kaku, dingin, dan terlalu menuntut standar sempurna, membuat koordinasi top–down dan komunikasi terpotong. Risiko: overcontrol, toleransi rendah pada deviasi, dan kritik sebelum buy-in. Antidot: aktifkan empati/persuasi, buka umpan balik dua arah, dan kalibrasikan ekspektasi agar tim tetap termotivasi.
    `.trim(),
    change: `
Saat terjadi perubahan sistem atau target baru, ${nickname} bergerak cepat mengambil keputusan dan mendefinisikan arah. Manfaatkan pengaruh untuk menyosialisasikan perubahan dan menggalang komitmen. Guardrail: tetapkan checkpoint kualitas, dokumentasikan keputusan, dan pisahkan “wajib” vs “opsional” agar kecepatan tidak mengorbankan akurasi & kepatuhan.
    `.trim()
  },
  Guru: {
    most: `
Sebagai pendidik D-I, ${nickname} karismatik, tegas, dan mampu menggerakkan kelas menuju sasaran yang jelas. Progresif dalam metode, berani mencoba hal baru, serta pandai memotivasi siswa. Standar tinggi menjaga disiplin dan hasil belajar, sementara energi serta komunikasi yang kuat membuat pembelajaran hidup dan terarah.
    `.trim(),
    least: `
Dalam tekanan (konflik kelas, tenggat kurikulum), ${nickname} dapat menjadi terlalu direktif dan kurang memberi ruang suara siswa. Risiko: kelas merasa “terdorong” bukan “terinspirasi”, muncul resistensi/kelelahan. Penyeimbang: selipkan jeda refleksi, teknik bertanya terbuka, dan diferensiasi tugas agar standar tinggi tetap humanis.
    `.trim(),
    change: `
Ketika kurikulum/penilaian berubah, ${nickname} sigap menstrukturkan implementasi dan mengajak siswa mengikuti ritme baru. Sisi Influencer mendukung sosialisasi ke orang tua/kolaborator. Pastikan scaffolding: target bertahap, rubrik jelas, dan umpan balik terjadwal agar adaptasi cepat tanpa kesenjangan pemahaman.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam konteks teknis, ${nickname} bergerak cepat melakukan triase masalah, menentukan prioritas, dan memimpin eksekusi perbaikan. Ia kritis–logis saat menganalisis akar masalah dan imajinatif merancang solusi. Dorongan kompetitif dan standar tinggi menjaga reliability, sementara pengaruh interpersonal memudahkan koordinasi lintas fungsi saat insiden.
    `.trim(),
    least: `
Di tekanan insiden, ${nickname} berisiko mengambil jalan pintas, menekan tim untuk “sempurna sekarang”, atau kurang sabar pada proses. Dampak: dokumentasi terlewat, komunikasi singkat, kelelahan tim. Peredam: gunakan checklist insiden, tetapkan “fix-now / fix-next”, dan lakukan postmortem berbasis data agar kecepatan tidak mengorbankan keselamatan & traceability.
    `.trim(),
    change: `
Saat migrasi teknologi/perubahan arsitektur, ${nickname} efektif sebagai champion: menetapkan milestone, membagi peran, dan menggerakkan adopsi. Kunci: definisikan batas otoritas, sediakan rencana rollback, dan wajibkan dokumentasi konfigurasi agar keberanian mencoba hal baru tetap aman, auditable, dan terpelihara.
    `.trim()
  },
  Housekeeping: {
    most: `
Sebagai pemimpin shift D-I, ${nickname} tegas menjaga standar kebersihan, rute kerja, dan SLA area. Ia mampu memotivasi anggota, mengoordinasikan lintas area, dan cepat menindak temuan. Standar tinggi serta orientasi hasil menjadikan area rapi–terkendali, sementara pengaruh interpersonal mempercepat pembiasaan SOP.
    `.trim(),
    least: `
Di beban puncak, ${nickname} bisa terdengar keras, kurang sabar pada pelanggaran kecil, dan menekan tim untuk “zero defect” seketika. Risiko: moral turun, komunikasi satu arah. Penyeimbang: umpan balik model sandwich, toleransi kesalahan yang edukatif, dan apresiasi kepatuhan untuk menjaga motivasi.
    `.trim(),
    change: `
Ketika metode kerja atau layout area berubah, ${nickname} cekatan merancang ulang rute, menetapkan standar baru, dan melatih tim. Agar transisi mulus: lakukan pilot kecil, tampilkan metrik sederhana (compliance, temuan, waktu siklus), dan perkuat coaching on-the-spot sehingga perubahan cepat sekaligus berkelanjutan.
    `.trim()
  }
},
    DS: {
  Administrator: {
    most: `
Sebagai kombinasi Dominan–Steady, ${nickname} menggabungkan ketegasan target dengan kestabilan proses. Ia objektif, analitis, dan konsisten menjaga SLA administrasi, seraya memberi dukungan pada otoritas yang dihormati. Penetapan tujuan jelas, SOP rapi, dan tindak lanjut yang kuat membuat operasi harian tertib serta dapat diprediksi.
    `.trim(),
    least: `
Di bawah tekanan, ${nickname} dapat menjadi terlalu kaku pada prosedur dan enggan mengubah rute kerja yang sudah mapan. Risiko: keputusan tertunda “menunggu data lengkap”, over-commit pada banyak hal, serta komunikasi yang tenang tetapi kurang asertif. Penyeimbang: tetapkan batas waktu keputusan, delegasikan follow-up, dan gunakan ringkasan 1 halaman untuk percepat eskalasi.
    `.trim(),
    change: `
Saat perubahan kebijakan/sistem, ${nickname} efektif memimpin transisi bertahap: pilot kecil, jadwal jelas, dan checklist implementasi. Jaga ritme stabil dengan milestone mingguan, definisikan kriteria sukses–gagal, dan sediakan rencana rollback agar adaptasi cepat namun tetap terkendali.
    `.trim()
  },
  Guru: {
    most: `
Sebagai pendidik |D-S|, ${nickname} tegas namun menenangkan. Ia menata kelas yang disiplin, konsisten pada aturan, dan memiliki tindak lanjut tugas yang rapi. Hubungan dengan siswa dijaga secara profesional; fokus pada tujuan belajar didukung struktur kegiatan yang stabil dan aman bagi semua.
    `.trim(),
    least: `
Dalam tekanan (konflik kelas/penilaian beruntun), ${nickname} bisa menjadi kaku pada rencana, enggan mencoba metode baru, dan kurang memberi ruang spontanitas siswa. Antidot: selipkan refleksi singkat, variasi aktivitas rendah-risiko, dan gunakan kontrak belajar agar standar tetap tinggi tanpa mematikan partisipasi.
    `.trim(),
    change: `
Saat kurikulum berubah, ${nickname} menyusun adaptasi bertahap: rubrik jelas, contoh pekerjaan, dan penjadwalan ulang beban tugas. Buat “peta transisi” (apa tetap, apa berubah, apa dihapus) sehingga kestabilan kelas terjaga sembari standar mutu naik.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam konteks teknis, ${nickname} tenang–tegas: cepat menetapkan prioritas, lalu eksekusi terstruktur dengan SOP. Ia objektif dalam analisis akar masalah dan dikenal rapi pada follow-up, sehingga reliabilitas sistem terjaga dan hutang teknis ditekan.
    `.trim(),
    least: `
Di puncak tekanan, ${nickname} cenderung bertahan pada cara yang sudah aman, menunda eskalasi, atau menghindari eksperimen solusi. Dampak: penyelesaian lambat dan backlog tumbuh. Peredam: tetapkan kriteria “escalate now”, gunakan matriks risiko, dan pisahkan perbaikan cepat vs jangka panjang.
    `.trim(),
    change: `
Saat migrasi/perubahan arsitektur, ${nickname} unggul dengan rollout bertahap (canary/blue–green), runbook, serta checklist validasi. Kunci: timebox analisis, buat komunikasi status ritmik, dan dokumentasikan keputusan agar stabilitas tetap menjadi jangkar selama perubahan.
    `.trim()
  },
  Housekeeping: {
    most: `
Sebagai pemimpin tim kebersihan, ${nickname} menjaga standar tinggi dengan ritme kerja stabil. Rute, jadwal, dan inspeksi konsisten; tindak lanjut temuan selalu selesai. Kombinasi tegas–tenang memupuk kedisiplinan tanpa menciptakan kepanikan.
    `.trim(),
    least: `
Di beban puncak, ${nickname} bisa terjebak pada jadwal kaku, lambat menukar prioritas area, dan menuntut ketuntasan penuh sebelum pindah tugas. Risiko: antrean kerja dan kelelahan tim. Penyeimbang: gunakan prinsip “critical first”, rotasi beban, dan checkpoint singkat antarsesi.
    `.trim(),
    change: `
Ketika layout/SOP berubah, ${nickname} menjalankan perubahan lewat simulasi rute, briefing singkat di lapangan, dan buddy system. Metode “uji–evaluasi–sebar” memastikan adopsi cepat namun tetap stabil dan aman.
    `.trim()
  }
},

DC: {
  Administrator: {
    most: `
Kombinasi Dominan–Conscientious membuat ${nickname} tegas sekaligus presisi. Ia menetapkan target yang terukur, menjaga kepatuhan kebijakan, dan memperkuat dokumentasi serta kontrol mutu. Keputusan cepat namun berbasis data; deviasi kecil pun ditangani lewat perbaikan proses yang konkret.
    `.trim(),
    least: `
Di bawah tekanan, perfeksionisme dapat memicu micromanagement, kritik tajam, atau jeda keputusan karena “mencari opsi terbaik”. Risiko: antrian persetujuan dan demotivasi tim. Antidot: timebox analisis, definisikan “good enough” & acceptance criteria, serta delegasikan detail eksekusi.
    `.trim(),
    change: `
Dalam perubahan sistem/struktur, ${nickname} efektif bila kriteria sukses jelas, RACI tegas, dan ada “minimum viable process” untuk go-live. Sertakan kontrol mutu pasca-implementasi dan jendela freeze agar kualitas tetap terjaga saat percepatan.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |D-C|, ${nickname} menyusun pembelajaran yang sangat terstruktur dengan standar tinggi. Ia cepat memutuskan langkah kelas, namun teliti pada materi, rubrik, dan evaluasi. Hasilnya: kelas tertib, ekspektasi jelas, dan akurasi penilaian kuat.
    `.trim(),
    least: `
Dalam tekanan, ${nickname} bisa terlalu banyak aturan, nada umpan balik menjadi kritis, dan spontanitas belajar berkurang. Risiko: siswa cemas dan kreativitas menurun. Penyeimbang: ruang eksplorasi terarah, bahasa umpan balik konstruktif, dan prioritas kompetensi inti agar tempo tetap manusiawi.
    `.trim(),
    change: `
Saat ada perubahan kurikulum/asesmen, ${nickname} menyiapkan checklist, contoh tugas, dan rubrik baru. Jaga agar tidak over-engineering: batasi indikator pada yang kritikal, uji coba skala kecil, dan iterasi cepat berdasarkan data hasil belajar.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam peran teknis, ${nickname} memimpin RCA dengan tajam, menetapkan kontrol perubahan ketat, dan mengeksekusi perbaikan yang presisi. Ia menggabungkan kecepatan keputusan dengan verifikasi menyeluruh sehingga reliabilitas dan kepatuhan teknis terjaga.
    `.trim(),
    least: `
Di tekanan insiden, ${nickname} bisa jatuh ke “analysis paralysis” atau sebaliknya memutuskan cepat namun kritis pada tim. Dampak: komunikasi renggang dan risiko blame. Peredam: definisikan protokol insiden (commander, scribe, PIC), uji hipotesis bertahap, dan lakukan postmortem tanpa menyalahkan.
    `.trim(),
    change: `
Pada perubahan arsitektur, ${nickname} unggul bila ada RFC, test plan, rollback, dan metrik kualitas yang disepakati. Hindari overengineering: fokus pada CTQ (critical-to-quality), timebox desain, dan iterasi setelah telemetry menunjukkan stabil.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menegakkan standar kebersihan secara tegas sekaligus rinci. Audit rutin, SOP detail, dan pelatihan terukur memastikan kualitas konsisten. Ia cepat mengoreksi deviasi kecil agar tidak menjadi pola.
    `.trim(),
    least: `
Di beban puncak, kecenderungan perfeksionis bisa memicu kritik berlebihan dan waktu tersita pada detail minor. Risiko: motivasi tim turun dan throughput merosot. Penyeimbang: daftar CTQ area, sampling audit, dan apresiasi perilaku patuh.
    `.trim(),
    change: `
Saat metode/peralatan baru diterapkan, ${nickname} menyusun standar kerja, daftar cek, dan metrik hasil. Terapkan adopsi bertahap, review harian singkat, dan jaga keseimbangan antara akurasi dan kecepatan agar kualitas naik tanpa menghambat pelayanan.
    `.trim()
  }
},
    DIS: {
  Administrator: {
    most: `
Sebagai kombinasi Dominan–Influencer–Steady, ${nickname} unggul menggerakkan orang dan pekerjaan sekaligus menjaga ritme tim. Ia fokus pada target besar, piawai membangun dukungan lintas unit, dan konsisten melakukan tindak lanjut sampai tuntas. Detail operasional didistribusikan ke pemilik proses, sementara ${nickname} menjaga arah, momentum, dan kolaborasi.
    `.trim(),
    least: `
Di bawah tekanan, ${nickname} cenderung melepas detail berlebihan, over-optimistic pada timeline, dan mengandalkan persuasi menggantikan kontrol mutu. Risiko: slip kualitas, scope creep, serta komitmen tim melebar. Penyeimbang: tetapkan PIC detail per stream, gunakan daftar CTQ (critical-to-quality), dan kunci baseline lingkup sebelum broadcast target.
    `.trim(),
    change: `
Saat perubahan kebijakan/sistem, ${nickname} efektif sebagai motor peluncuran: sosialisasi cepat, koordinasi lintas fungsi, dan pengaturan ritme adopsi. Guardrail penting: gantungkan setiap inisiatif pada rencana implementasi bertahap, checkpoint kualitas terjadwal, dan dashboard ringkas (status, risiko, keputusan) agar laju tinggi tidak mengorbankan akurasi.
    `.trim()
  },
  Guru: {
    most: `
Sebagai pendidik |D-I-S|, ${nickname} karismatik, energik, dan konsisten mendorong kelas pada tujuan yang jelas. Ia mahir memotivasi, memberi struktur yang menenangkan, serta menjaga tindak lanjut tugas sampai selesai. Detail teknis penilaian dapat dibantu asisten/rubrik, sementara ${nickname} menjaga arah dan semangat kelas.
    `.trim(),
    least: `
Dalam tekanan (ujian beruntun/konflik kelas), ${nickname} bisa kurang teliti pada detail penilaian, terlalu cepat mengganti pendekatan, atau memberi tugas berlebih. Antidot: gunakan rubrik baku, batasi jumlah indikator, dan sisipkan sesi refleksi singkat agar disiplin belajar tetap manusiawi.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} cepat memetakan tujuan akhir dan menggerakkan keterlibatan siswa–orang tua. Pastikan scaffolding: contoh tugas, rentang nilai yang transparan, dan timeline bertahap; tugaskan ko–guru/administrasi akademik sebagai pemilik detail untuk menjaga konsistensi nilai.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam konteks teknis, ${nickname} sigap men-set prioritas, mengoordinasikan respon, dan menjaga tim tetap bergerak hingga insiden/pekerjaan tuntas. Ia kuat pada mobilisasi dan komunikasi, sementara detail eksekusi dipegang PIC khusus—mendorong throughput tanpa kehilangan arah.
    `.trim(),
    least: `
Di puncak tekanan, ${nickname} berisiko melewatkan dokumentasi, QA, atau verifikasi akhir karena fokus pada penyelesaian cepat. Peredam: terapkan checklists insiden, pisahkan “fix-now” vs “fix-next”, wajibkan postmortem tanpa menyalahkan, dan pastikan seorang owner C/QA menandatangani rilis.
    `.trim(),
    change: `
Saat migrasi/perubahan arsitektur, ${nickname} unggul menggalang dukungan dan menjaga momentum rollout. Kunci keselamatan: RFC tertulis, rencana rollback, canary/blue–green, serta metrik kesehatan yang dipantau—sehingga adopsi cepat tetap aman dan terukur.
    `.trim()
  },
  Housekeeping: {
    most: `
Sebagai pimpinan shift, ${nickname} tegas menjaga target kebersihan area, mengatur rute kerja, dan memotivasi tim dengan energi tinggi. Ia kuat di koordinasi lapangan dan follow-up temuan sampai selesai, sambil mendelegasikan detail teknis ke leader area.
    `.trim(),
    least: `
Di beban puncak, ${nickname} bisa kehilangan detail (sudut/spot kecil), mengubah prioritas terlalu cepat, atau menambah tugas tanpa perhitungan beban. Penyeimbang: daftar titik kritis (CTQ) per area, timeboxing per rute, dan sampling audit berkala untuk menjaga kualitas konsisten.
    `.trim(),
    change: `
Ketika layout/SOP berubah, ${nickname} efektif melakukan briefing massal, demo lapangan, dan coaching on-the-spot. Agar transisi mulus: pilot kecil, indikator sederhana (compliance, temuan, siklus waktu), dan penguncian rute prioritas sebelum ekspansi penuh.
    `.trim()
  }
},

DIC: {
  Administrator: {
    most: `
Kombinasi Dominan–Influencer–Conscientious membuat ${nickname} mampu menyatukan relasi, kecepatan, dan ketepatan. Ia suka berjejaring sekaligus mampu menurunkan target ke detail operasional bila dibutuhkan. Orientasi hasil tinggi namun tetap menjaga akurasi dokumen, kepatuhan, dan kelengkapan proses.
    `.trim(),
    least: `
Di bawah tekanan, ${nickname} berisiko lompat ke proyek baru sebelum perencanaan matang, multitasking berlebihan, atau terlalu perfeksionis pada detail minor—keduanya menghambat progres. Antidot: kunci prioritas triad (impact–effort–risk), timebox perencanaan, dan tetapkan “definition of done” yang tegas.
    `.trim(),
    change: `
Dalam perubahan sistem/struktur, ${nickname} andal membangun buy-in dan menyusun SOP minimal agar cepat go-live, lalu mengeraskan kontrol kualitas bertahap. Jaga fokus: batasi indikator pada CTQ, jadwalkan review iteratif, dan hindari scope hopping dengan gate keputusan yang jelas.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |D-I-C|, ${nickname} memadukan kelas yang hidup, arahan tegas, dan akurasi evaluasi. Ia komunikatif, menuntut standar tinggi, dan dapat mengerjakan detail rubrik/administrasi saat diperlukan—menciptakan pembelajaran yang engaging namun terukur.
    `.trim(),
    least: `
Dalam tekanan, kecenderungan berpindah topik/proyek atau “over-engineer” materi dapat membuat waktu habis pada detail tidak kritis. Risiko: kelelahan siswa dan backlog penilaian. Penyeimbang: template RPP ringkas, batas indikator inti, dan ritme umpan balik yang tetap.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} mengkomunikasikan alasan perubahan dengan baik dan menyiapkan contoh penilaian yang akurat. Hindari overload: uji coba skala kecil, iterasi rubrik berdasarkan bukti belajar, dan gunakan kalender evaluasi agar konsistensi terjaga.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam peran teknis, ${nickname} mampu berjejaring lintas tim, bergerak cepat, sekaligus menyelam ke detail ketika dibutuhkan. Ia menuntut ketepatan implementasi dan kelengkapan dokumentasi, sehingga hasil teknis reliabel namun tetap memiliki dukungan organisasi.
    `.trim(),
    least: `
Di insiden atau proyek paralel, ${nickname} bisa melompat konteks, melemahkan rencana, atau terjebak pada detail non-kritis. Peredam: WIP limit, kanban jelas, prioritas CTQ, dan ritual harian (standup/status 10 menit) untuk menjaga fokus dan throughput.
    `.trim(),
    change: `
Dalam perubahan arsitektur, ${nickname} efektif memimpin RFC, menyelaraskan stakeholder, dan menjaga presisi eksekusi. Pastikan disiplin: change window, checklist verifikasi, metrik kesehatan, serta evaluasi pasca-rilis agar iterasi berikutnya lebih tajam.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} ramah dan persuasif dalam memimpin tim, menegakkan standar secara detail ketika diperlukan. Ia mampu menutup gap kualitas sambil menjaga hubungan baik, sehingga kepatuhan SOP meningkat tanpa menciptakan resistensi.
    `.trim(),
    least: `
Di beban puncak, ${nickname} dapat terlalu lama pada detail kecil atau berpindah tugas sebelum rute selesai—menciptakan ketidakkonsistenan. Penyeimbang: kunci rute prioritas, target waktu per segmen, dan audit sampling agar fokus terjaga.
    `.trim(),
    change: `
Saat metode/alat baru diterapkan, ${nickname} mampu melatih tim dengan pendekatan komunikatif dan memastikan standar kerja terdokumentasi. Terapkan adopsi bertahap, ukur hasil (temuan, waktu siklus), dan perkuat umpan balik lapangan untuk menstabilkan kualitas.
    `.trim()
}
},
  DSI: {
  Administrator: {
    most: `
Sebagai kombinasi |D-S-I|, ${nickname} menyeimbangkan ketegasan target, ritme kerja stabil, dan kemampuan memobilisasi orang. Ia objektif–analitis, senang terlibat langsung, serta kuat di tindak lanjut sampai tuntas. Detail operasional didistribusikan ke pemilik proses, sementara ${nickname} menjaga arah, disiplin, dan kolaborasi harian.
    `.trim(),
    least: `
Di bawah tekanan, ${nickname} cenderung mempertahankan cara aman (S), menunda konfrontasi, atau melebarkan komitmen karena ingin tetap membantu banyak pihak (I). Risiko: keputusan lambat, scope melebar, dan prioritas kabur. Penyeimbang: batas waktu keputusan, RACI tegas, WIP limit, dan ringkasan 1 halaman untuk eskalasi cepat.
    `.trim(),
    change: `
Saat ada perubahan kebijakan/sistem, ${nickname} efektif melakukan transisi bertahap: pilot kecil, jadwal implementasi jelas, dan checklist adopsi. Jaga momentum dengan komunikasi rutin (I) namun pegang milestone tetap (D) dan ritme stabil (S) agar adaptasi cepat tapi terkendali.
    `.trim()
  },
  Guru: {
    most: `
Sebagai pendidik |D-S-I|, ${nickname} tegas namun menenangkan: tujuan belajar jelas, struktur kelas stabil, dan motivasi siswa terjaga. Ia konsisten pada tindak lanjut tugas dan membangun hubungan yang sehat di kelas, sehingga pembelajaran terasa terarah dan suportif.
    `.trim(),
    least: `
Dalam tekanan (ujian/konflik kelas), ${nickname} bisa menjadi kaku pada rencana, kurang spontan, atau memberi beban tugas berlebih demi mengejar target. Antidot: variasi aktivitas berisiko rendah, refleksi singkat, dan diferensiasi tugas agar disiplin tetap humanis.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyusun peta transisi: apa yang tetap–berubah–dihapus, contoh tugas, serta rubrik sederhana. Komunikasikan ke orang tua/kolaborator dan jalankan bertahap agar kestabilan kelas terjaga.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam konteks teknis, ${nickname} tenang–tegas: menetapkan prioritas, mengoordinasikan respons, dan menutup loop hingga insiden/proyek tuntas. Ia objektif pada RCA dan konsisten mengeksekusi rencana perbaikan.
    `.trim(),
    least: `
Di puncak tekanan, ${nickname} bisa bertahan pada metode lama yang aman (S), menunda eskalasi, atau melewatkan dokumentasi karena fokus menyelesaikan. Peredam: kriteria “escalate now”, checklist insiden, pemisahan “fix-now/fix-next”, dan postmortem tanpa menyalahkan.
    `.trim(),
    change: `
Saat migrasi/perubahan arsitektur, ${nickname} unggul pada rollout bertahap (canary/blue–green), runbook, dan komunikasi status ritmik. Milestone tegas (D) + ritme stabil (S) + persuasi lintas tim (I) = adopsi cepat namun aman.
    `.trim()
  },
  Housekeeping: {
    most: `
Sebagai pimpinan shift, ${nickname} menjaga standar area dengan rute kerja stabil, inspeksi rutin, dan dorongan motivasional. Tindak lanjut temuan konsisten hingga tuntas, sementara hubungan tim tetap hangat.
    `.trim(),
    least: `
Di beban puncak, jadwal bisa terlalu kaku, prioritas sulit ditukar, dan tugas baru ditambahkan tanpa hitung beban. Penyeimbang: prinsip “critical first”, timeboxing per rute, rotasi beban, dan sampling audit untuk jaga kualitas.
    `.trim(),
    change: `
Saat layout/SOP berubah, ${nickname} menjalankan simulasi rute, briefing lapangan, dan buddy system. Mulai dari area kunci dulu, ukur compliance & waktu siklus, lalu skalakan.
    `.trim()
  }
},

DSC: {
  Administrator: {
    most: `
Kombinasi |D-S-C| membuat ${nickname} tegas pada target, stabil dalam eksekusi, dan teliti pada kepatuhan. Ia menyukai proses rapi, dokumentasi lengkap, dan kontrol mutu yang konsisten—menghasilkan operasi administrasi yang tertib dan dapat diaudit.
    `.trim(),
    least: `
Di bawah tekanan, perfeksionisme (C) dan preferensi stabil (S) dapat memperlambat keputusan atau membuat ${nickname} enggan mengubah rute kerja. Risiko: antrean persetujuan dan lambatnya respons. Antidot: timebox analisis, definisikan “good enough” & acceptance criteria, sederhanakan jalur sign-off.
    `.trim(),
    change: `
Dalam perubahan sistem, ${nickname} efektif jika ada governance jelas: RACI, RFC, checklist go-live, dan window perubahan. Jalankan bertahap dengan metrik kualitas pasca-implementasi agar mutu terjaga tanpa menghambat laju.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |D-S-C|, ${nickname} menyusun kelas yang sangat terstruktur, konsisten, dan berstandar tinggi. Ia teliti pada materi, administrasi, dan penilaian; disiplin kelas kuat namun suasana tetap stabil dan aman.
    `.trim(),
    least: `
Dalam tekanan, ${nickname} bisa terlalu banyak aturan, fokus detail minor, dan mengurangi ruang eksplorasi siswa. Penyeimbang: batasi indikator inti, gunakan rubrik ringkas, dan beri sesi eksplorasi terarah agar tempo tetap manusiawi.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyiapkan contoh tugas, rubrik baru, dan jadwal bertahap. Hindari over-engineering: uji coba kecil, iterasi berdasar bukti belajar, dan kunci standar minimum yang realistis.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam peran teknis, ${nickname} memimpin dengan SOP yang kuat, dokumentasi presisi, dan kontrol perubahan ketat. Ia memastikan kualitas tinggi dan keandalan sistem melalui eksekusi terstruktur.
    `.trim(),
    least: `
Di insiden, ${nickname} berisiko masuk “analysis paralysis” atau menunda rilis demi kesempurnaan. Peredam: protokol insiden (commander/scribe/PIC), eksperimen bertahap, dan keputusan berbasis risiko CTQ agar kecepatan dan mutu seimbang.
    `.trim(),
    change: `
Pada perubahan arsitektur, ${nickname} mengandalkan RFC, test plan, rollback, dan metrik kesehatan. Fokus pada CTQ, batasi WIP, dan lakukan review terjadwal untuk menjaga mutu tanpa memperlambat proyek.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menegakkan standar kebersihan melalui SOP rinci, inspeksi rutin, dan jadwal stabil. Detail diperhatikan, tindak lanjut temuan rapi, dan konsistensi kualitas terjaga.
    `.trim(),
    least: `
Di beban puncak, perhatian pada detail minor bisa menurunkan throughput dan moral tim. Penyeimbang: daftar CTQ per area, sampling audit, dan apresiasi kepatuhan agar fokus tetap pada dampak terbesar.
    `.trim(),
    change: `
Saat metode/alat baru diterapkan, ${nickname} menyusun standar kerja, daftar cek, dan pelatihan bertahap. Ukur hasil (temuan, waktu siklus) dan sesuaikan sebelum ekspansi penuh.
    `.trim()
  }
},

DCI: {
  Administrator: {
    most: `
Sebagai |D-C-I|, ${nickname} menyatukan ketegasan target, presisi proses, dan komunikasi yang membangun buy-in. Ia cepat memutuskan, menjaga akurasi dokumen, dan piawai menggalang dukungan lintas unit untuk mengeksekusi perubahan.
    `.trim(),
    least: `
Di tekanan tinggi, ${nickname} bisa terjebak perfeksionisme (C) atau melompat konteks ke proyek baru (I), sementara standar tetap tinggi (D). Risiko: progres tersendat atau tim lelah oleh kritik/detail non-kritis. Antidot: triase prioritas (impact–effort–risk), timebox perencanaan, “definition of done” yang tegas, dan kanal umpan balik dua arah.
    `.trim(),
    change: `
Dalam perubahan sistem/struktur, ${nickname} efektif memimpin RFC, menetapkan CTQ, dan menyosialisasikan rencana. Gunakan gate keputusan, metrik kualitas pasca-rilis, dan iterasi terjadwal agar laju dan akurasi sama-sama terjaga.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |D-C-I|, ${nickname} mengelola kelas yang hidup namun presisi: arahan jelas, rubrik akurat, dan komunikasi yang menyemangati siswa. Standar tinggi tercapai tanpa kehilangan keterlibatan.
    `.trim(),
    least: `
Dalam tekanan, ${nickname} bisa over-engineer materi/penilaian atau berpindah topik terlalu cepat. Penyeimbang: template RPP ringkas, batasi indikator inti, dan ritme umpan balik yang konsisten agar beban tetap proporsional.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menjelaskan alasan perubahan dengan baik, menyediakan contoh penilaian, dan menguji skala kecil. Iterasi rubrik berdasarkan bukti belajar dan kunci kalender evaluasi untuk konsistensi.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam peran teknis, ${nickname} memadukan keputusan cepat (D), QA presisi (C), dan koordinasi lintas tim (I). Dokumentasi lengkap, kontrol perubahan rapi, dan komunikasi yang jelas menjaga reliabilitas sekaligus dukungan organisasi.
    `.trim(),
    least: `
Di insiden atau proyek paralel, ${nickname} bisa bergeser ke kritik tajam atau multitasking berlebih. Peredam: WIP limit, standup singkat harian, prioritas CTQ, serta postmortem tanpa menyalahkan untuk menjaga fokus dan pembelajaran.
    `.trim(),
    change: `
Dalam perubahan arsitektur, ${nickname} memimpin penyelarasan stakeholder, menegakkan checklist verifikasi, dan memastikan metrik kesehatan dipantau. Rencana rollback siap, gate kualitas jelas, dan komunikasi status ritmik.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} mendorong standar tinggi yang detail saat diperlukan, sambil menjaga semangat tim melalui komunikasi yang baik. Ia mampu menutup gap kualitas tanpa menimbulkan resistensi.
    `.trim(),
    least: `
Di beban puncak, ${nickname} berisiko teralihkan oleh detail non-kritis atau berpindah tugas sebelum rute selesai. Penyeimbang: kunci rute prioritas, target waktu per segmen, dan audit sampling agar konsistensi terjaga.
    `.trim(),
    change: `
Ketika metode/alat baru diluncurkan, ${nickname} melatih tim secara komunikatif, menjaga dokumentasi standar kerja, dan menerapkan adopsi bertahap. Ukur hasil (temuan, waktu siklus) dan perkuat umpan balik lapangan.
    `.trim()
}
},
  DCS: {
  Administrator: {
    most: `
Kombinasi |D-C-S| membuat ${nickname} menetapkan target tegas, mengeksekusi presisi, dan menjaga ritme kerja stabil. Ia sensitif pada problem, cepat memutuskan, lalu mengawal kepatuhan SOP, dokumentasi, dan kontrol mutu. Hasilnya: operasi administrasi tertib, terukur, dan dapat diaudit tanpa kehilangan kecepatan.
    `.trim(),
    least: `
Di bawah tekanan, perfeksionisme (C) dan preferensi stabil (S) dapat memperlambat keputusan atau memicu micromanagement pada detail non-kritis. Risiko: antrian persetujuan, kelelahan tim, dan melambatnya progres. Antidot: timebox analisis, definisikan “good enough” & acceptance criteria, batasi jalur sign-off, dan eskalasi cepat untuk blocker.
    `.trim(),
    change: `
Dalam perubahan sistem/struktur, ${nickname} efektif bila governance jelas: RACI tegas, RFC terdokumentasi, checklist go-live, dan window perubahan. Terapkan rollout bertahap dengan metrik pasca-implementasi (defect, SLA, compliance) agar kualitas terjaga sambil laju tetap terkendali.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |D-C-S|, ${nickname} membangun kelas yang sangat terstruktur, standar tinggi, dan konsisten. Ia cepat mengarahkan, teliti pada materi–rubrik–administrasi, serta menjaga suasana stabil sehingga target belajar tercapai dengan akurat dan tertib.
    `.trim(),
    least: `
Dalam tekanan (ujian beruntun/konflik kelas), ${nickname} bisa terlalu banyak aturan, fokus pada detail minor, dan mengurangi ruang eksplorasi siswa. Penyeimbang: batasi indikator inti, gunakan rubrik ringkas, sertakan sesi eksplorasi terarah, dan jaga bahasa umpan balik agar tetap suportif.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyiapkan contoh tugas, rubrik baru, dan kalender evaluasi bertahap. Hindari over-engineering: uji coba skala kecil, iterasi berdasar bukti belajar, dan kunci standar minimum yang realistis sebelum perluasan penuh.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam peran teknis, ${nickname} memimpin RCA tajam, menjaga kontrol perubahan ketat, dan mengeksekusi perbaikan presisi. Keputusan cepat (D) disangga dokumentasi akurat (C) dan eksekusi stabil (S), sehingga reliabilitas sistem dan kepatuhan tetap tinggi.
    `.trim(),
    least: `
Di insiden, ${nickname} berisiko masuk “analysis paralysis” atau menghabiskan waktu pada detail non-kritis. Dampak: rilis tertunda dan tekanan tim meningkat. Peredam: protokol insiden (commander/scribe/PIC), eksperimen bertahap, prioritas CTQ, dan postmortem tanpa menyalahkan untuk menjaga fokus & pembelajaran.
    `.trim(),
    change: `
Pada migrasi/rekayasa ulang, ${nickname} unggul jika ada RFC, test plan, rollback, dan metrik kesehatan yang disepakati. Fokus pada CTQ, batasi WIP, lakukan canary/blue-green, serta review terjadwal agar mutu terjaga tanpa memperlambat roadmap.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menegakkan standar kebersihan tegas sekaligus rinci, dengan jadwal dan rute kerja yang stabil. Audit rutin, checklist komplit, dan tindak lanjut temuan rapi memastikan kualitas konsisten di seluruh area.
    `.trim(),
    least: `
Di beban puncak, perhatian pada detail minor dapat menurunkan throughput dan moral tim. Penyeimbang: daftar CTQ per area, sampling audit, target waktu per segmen, dan apresiasi kepatuhan agar fokus tetap pada dampak terbesar.
    `.trim(),
    change: `
Saat metode/peralatan baru diterapkan, ${nickname} menyusun SOP, daftar cek, dan pelatihan bertahap. Mulai dari area prioritas, ukur hasil (temuan, waktu siklus), lalu skalakan; jaga komunikasi lapangan agar transisi cepat namun stabil.
    `.trim()
  }
},

    I: {
      Administrator: {
        most: `
Sebagai tipe Influencer, ${nickname} mahir membangun komunikasi efektif dengan rekan kerja maupun pihak luar, memudahkan koordinasi dan memperlancar seluruh proses administrasi. ${nickname} sering menjadi sumber inspirasi dan motivasi di lingkungan kerja, menciptakan suasana kerja yang hangat dan suportif, serta mudah menjalin hubungan baik antarbagian. Karakter ini membuat proses pelayanan dan administrasi berjalan lancar, penuh kolaborasi, serta minim konflik.
        `.trim(),
        least: `
Ketika beban kerja tinggi, ${nickname} yang berorientasi pada hubungan sosial cenderung terdistraksi oleh percakapan, interaksi informal, atau kegiatan non-prioritas. Hal ini bisa mengurangi fokus pada target kerja utama. Untuk mengimbanginya, ${nickname} perlu memperkuat disiplin pribadi, menjaga batas profesionalitas, serta memprioritaskan tugas administratif yang esensial tanpa mengabaikan keharmonisan hubungan kerja.
        `.trim(),
        change: `
Di bawah tekanan atau saat menghadapi target yang ketat, ${nickname} tetap mampu membangun sinergi tim, menjaga suasana kerja tetap positif, dan memberikan semangat kepada rekan kerja. Namun, penting untuk tetap menjaga keseimbangan antara keakraban dengan tanggung jawab profesional, serta tetap fokus pada hasil kerja yang terukur.
        `.trim()
      },
      Guru: {
        most: `
Sebagai Guru yang bertipe Influencer, ${nickname} sangat pandai membangun hubungan hangat dengan siswa dan menciptakan suasana pembelajaran yang menyenangkan serta komunikatif. Karakter ini menjadikan ${nickname} sumber motivasi dan inspirasi bagi murid-muridnya. Kelas yang dipimpin oleh ${nickname} biasanya terasa hidup, penuh antusiasme, serta sangat terbuka untuk diskusi dan ekspresi pendapat. Kemampuan ini sangat mendukung proses pembelajaran yang efektif dan membangun kedekatan emosional antara guru dan siswa.
        `.trim(),
        least: `
Saat menghadapi tekanan di kelas, ${nickname} mungkin cenderung terlalu larut dalam interaksi sosial hingga tujuan pembelajaran menjadi kurang terfokus. Ada risiko kehilangan arah pembelajaran jika terlalu mengutamakan suasana akrab. Oleh sebab itu, ${nickname} perlu memperkuat pengelolaan waktu, menegaskan batas interaksi, dan memastikan sasaran pembelajaran tetap tercapai dengan baik tanpa mengurangi nuansa kekeluargaan.
        `.trim(),
        change: `
Dalam menghadapi tantangan atau perubahan dalam dunia pendidikan, ${nickname} tetap dapat menjaga suasana kelas tetap positif dan semangat belajar siswa tetap tinggi. Namun, perlu dikontrol agar kedekatan emosional tidak mengganggu objektivitas, serta tetap memprioritaskan pencapaian akademik.
        `.trim()
      },
      "Technical Staff": {
        most: `
Sebagai tenaga teknis dengan karakter Influencer, ${nickname} unggul dalam membangun komunikasi dan koordinasi yang baik antaranggota tim. Hal ini membuat proses kerja lebih efisien, minim miskomunikasi, dan penuh kolaborasi. ${nickname} sering menjadi penghubung yang memperlancar jalannya pekerjaan teknis, mampu meredam konflik, serta menjaga motivasi kerja tim tetap tinggi dalam kondisi apapun.
        `.trim(),
        least: `
Saat menghadapi kendala teknis, kecenderungan terlalu santai atau kurang tegas dapat membuat solusi berjalan lebih lambat. Dalam situasi seperti ini, ${nickname} perlu belajar meningkatkan ketegasan dalam memberikan instruksi, memastikan setiap anggota tim memahami peran dan tanggung jawabnya, serta menjaga agar proses kerja tetap berjalan sesuai target teknis yang ditetapkan.
        `.trim(),
        change: `
Di bawah tekanan kerja teknis, ${nickname} mampu menjaga suasana tim tetap kooperatif dan komunikatif. Namun, penting untuk memastikan bahwa komunikasi yang baik juga diiringi dengan aksi nyata dalam menyelesaikan permasalahan teknis, bukan hanya mengandalkan diskusi atau suasana positif semata.
        `.trim()
      },
      Housekeeping: {
        most: `
Sebagai pribadi bertipe Influencer di lingkungan Housekeeping, ${nickname} menjadi sumber semangat dan motivasi bagi seluruh tim. Kemampuan ${nickname} membangun kerja sama, menciptakan suasana harmonis, dan menumbuhkan rasa kebersamaan sangat membantu meningkatkan produktivitas serta kenyamanan kerja. ${nickname} selalu membawa aura positif yang membuat suasana kerja terasa ringan, penuh dukungan, serta mudah mengajak anggota tim untuk saling membantu. Pendekatan komunikatif dan empati yang tinggi dari ${nickname} sangat diperlukan dalam menjaga kekompakan dan loyalitas tim Housekeeping.
        `.trim(),
        least: `
Dalam tekanan atau ketika target belum tercapai, ${nickname} kadang lebih memprioritaskan suasana hati tim dibandingkan pencapaian standar kerja yang ditetapkan. Ada risiko menghindari konfrontasi langsung, sehingga standar kerja menjadi kurang optimal. Untuk itu, ${nickname} perlu belajar menyeimbangkan keramahan dan ketegasan, serta memastikan pencapaian target kebersihan tetap menjadi prioritas utama.
        `.trim(),
        change: `
Dalam masa sibuk atau deadline mendesak, ${nickname} tetap mampu menjaga motivasi dan semangat tim. Namun, penting bagi ${nickname} untuk tetap disiplin terhadap prosedur kerja, tidak terlalu larut dalam suasana, dan memastikan hasil kerja tetap optimal di bawah tekanan.
        `.trim()
      }
    },
    ID: {
  Administrator: {
    most: `
Sebagai |I-D|, ${nickname} pemimpin integratif yang mobilisasi orang “melalui” relasi. Ia ramah, persuasif, suka variasi tugas, dan efektif meraih dukungan lintas unit. Visi jelas disosialisasikan dengan bahasa yang menggerakkan; detail analitis diserahkan pada pemilik proses agar eksekusi tetap cepat.
    `.trim(),
    least: `
Di bawah tekanan, ${nickname} bisa impulsif, terlalu optimistis, banyak bicara, dan melewati detail/prosedur. Risiko: scope creep, janji berlebih, dan kualitas turun. Penyeimbang: pasangan PIC analitik (C) untuk data/fakta, timebox keputusan, acceptance criteria yang tegas, dan ringkasan 1 halaman untuk menjaga fokus.
    `.trim(),
    change: `
Saat perubahan kebijakan/sistem, ${nickname} kuat di kampanye perubahan: membangun cerita, ajak kolaborasi, dan mengeksekusi pilot cepat. Guardrail: minta paket data dari analis, kunci ruang lingkup sebelum siaran, dan tetapkan checkpoint kualitas agar adopsi cepat tetap akurat.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |I-D|, ${nickname} karismatik, komunikatif, dan pandai memotivasi kelas menuju target. Ia menyukai aktivitas variatif, diskusi, dan proyek kolaboratif; rubrik/administrasi detail dapat dibantu template agar energi utama tersalur ke penggerakan belajar.
    `.trim(),
    least: `
Dalam tekanan, ${nickname} berisiko impulsif, berganti metode terlalu cepat, atau meluberkan tugas. Antidot: strukturkan RPP ringkas, batasi indikator inti, gunakan rubrik siap pakai, dan sisipkan jeda refleksi agar antusiasme tetap terarah.
    `.trim(),
    change: `
Saat kurikulum berganti, ${nickname} mahir menjelaskan alasan perubahan dan menggalang dukungan siswa–orang tua. Kunci: contoh tugas konkret, timeline bertahap, serta peran ko–guru untuk detail penilaian agar tempo tinggi tak mengorbankan akurasi.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam konteks teknis, ${nickname} efektif sebagai incident coordinator/liaison: cepat menggerakkan orang yang tepat, mengomunikasikan status, dan memastikan eskalasi. Detail RCA/QA didukung spesialis; ${nickname} menjaga momentum hingga selesai.
    `.trim(),
    least: `
Di insiden, risiko melewatkan dokumentasi/QA, “mengejar solusi” tanpa verifikasi, atau overpromising. Peredam: checklist insiden, pisahkan “fix-now/fix-next”, PIC dokumentasi, dan postmortem berbasis data.
    `.trim(),
    change: `
Pada migrasi/perubahan, ${nickname} champion adopsi: brief, demo, dan koordinasi. Pastikan ada RFC tertulis, metrik kesehatan, dan rencana rollback—serta partner C untuk mengawal presisi.
    `.trim()
  },
  Housekeeping: {
    most: `
Sebagai leader lapangan, ${nickname} memotivasi tim, menjaga suasana positif, dan mendorong capaian area. Ia kuat pada komunikasi dan rotasi tugas agar rutinitas tidak membosankan; QC detail dipegang leader area.
    `.trim(),
    least: `
Di beban puncak, ${nickname} bisa terlalu banyak komunikasi, kurang fokus CTQ, atau janji berlebih ke pengguna area. Penyeimbang: daftar titik kritis (CTQ), spot-check terjadwal, dan target waktu per rute.
    `.trim(),
    change: `
Saat SOP/layout berubah, ${nickname} unggul melakukan briefing massal, simulasi lapangan, dan buddy system. Kunci: checklist sederhana, papan status area, dan sampling audit agar antusiasme berbuah konsistensi.
    `.trim()
  }
},

IS: {
  Administrator: {
    most: `
Sebagai |I-S|, ${nickname} hangat, suportif, dan kuat membangun harmoni tim. Ia menjaga layanan internal, proses konsisten, dan komunikasi empatik—cocok untuk menjaga stabilitas operasi harian dan kepuasan pemangku kepentingan.
    `.trim(),
    least: `
Risiko: menghindari konfrontasi, terlalu toleran pada kinerja rendah, dan membawa kritik secara pribadi—keputusan sulit tertunda. Antidot: SLA jelas, ambang eskalasi, skrip percakapan tegas-empatik, dan metrik kinerja yang transparan.
    `.trim(),
    change: `
Dalam perubahan, ${nickname} efektif menenangkan kekhawatiran dan memfasilitasi pelatihan. Tetapkan deadline nyata, milestone kecil, dan dukungan lapangan agar tempo tidak melambat.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |I-S|, ${nickname} menciptakan kelas yang hangat, aman, dan suportif. Ia pendengar baik, peka pada emosi siswa, dan menjaga hubungan harmonis sehingga keterlibatan meningkat.
    `.trim(),
    least: `
Risiko: kurang tegas pada aturan, terlalu memaklumi, dan tersinggung oleh kritik. Penyeimbang: kontrak belajar, rubrik jelas, batas peran yang tegas, dan latihan bahasa umpan balik yang konstruktif.
    `.trim(),
    change: `
Saat kurikulum berubah, ${nickname} menyampaikan perubahan dengan empatik dan bertahap. Pastikan pacing, contoh tugas, dan jadwal evaluasi agar kelas tidak “terbawa arus” tanpa arah.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} andal di perawatan rutin, dukungan pengguna, dan dokumentasi langkah demi langkah. Ia menjaga hubungan baik dengan stakeholder dan menjaga ritme layanan stabil.
    `.trim(),
    least: `
Risiko: enggan eskalasi/konfrontasi saat ada blocking issue, atau menoleransi deviasi prosedur. Peredam: kriteria “escalate now”, runbook tegas, dan rotasi on-call dengan debrief singkat.
    `.trim(),
    change: `
Pada perubahan, ${nickname} membantu pelatihan penggunaan dan adopsi. Tetapkan batas waktu, checklist, dan dukungan onsite untuk menghindari molornya transisi.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menjaga moral tim, rutin, dan stabilitas area. Ia ramah pada pengguna area, mendengar keluhan, dan memastikan tim merasa didukung.
    `.trim(),
    least: `
Risiko: sulit menegur pelanggaran, toleran terhadap ketidakefektifan. Penyeimbang: checklist bertanda tangan, inspeksi ringan namun sering, dan format umpan balik tegas–santun.
    `.trim(),
    change: `
Saat SOP baru, ${nickname} memperkenalkan perubahan secara bertahap, dengan demo dan pendampingan. Jaga disiplin dengan target sederhana (compliance, temuan utama) dan apresiasi progres.
    `.trim()
  }
},

IC: {
  Administrator: {
    most: `
Sebagai |I-C|, ${nickname} sosial namun presisi saat diperlukan. Ia mudah membangun jaringan, mempromosikan program, dan mampu menyelam ke detail kebijakan/dokumen untuk memastikan akurasi—kombinasi yang kuat untuk layanan dan kepatuhan.
    `.trim(),
    least: `
Risiko: optimisme membuat salah menilai kemampuan orang/deadline; di sisi lain perfeksionisme bisa mendorong isolasi kerja dan jeda komunikasi. Antidot: review risiko, peer review dokumen, dan batas WIP dengan checkpoint status rutin.
    `.trim(),
    change: `
Dalam perubahan, ${nickname} komunikator andal yang menyediakan panduan rinci. Jaga agar tidak over-engineer: kunci indikator CTQ, gate keputusan jelas, dan uji coba skala kecil sebelum meluas.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |I-C|, ${nickname} menyeimbangkan kelas yang engaging dengan ketelitian rubrik/administrasi. Ia peduli relasi dan mampu menata detail penilaian sehingga adil dan transparan.
    `.trim(),
    least: `
Risiko: menilai terlalu optimistis kemampuan siswa atau tenggelam pada detail materi hingga waktu habis. Penyeimbang: kolaborasi perencanaan, batas indikator inti, dan ritme umpan balik yang konsisten.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} mahir menjelaskan dan memberi contoh konkret. Hindari beban berlebih dengan template ringkas dan iterasi rubrik berdasarkan bukti belajar.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam peran teknis, ${nickname} menjadi jembatan sains–stakeholder: komunikatif, dokumentatif, dan teliti saat dibutuhkan. Cocok untuk BA/QA, dokumentasi, dan koordinasi lintas fungsi.
    `.trim(),
    least: `
Risiko: perfeksionisme memperlambat rilis atau optimisme menyebabkan estimasi meleset. Peredam: buffer estimasi, definisi “done” yang konkret, dan review berpasangan pada artefak teknis.
    `.trim(),
    change: `
Pada perubahan, ${nickname} unggul menulis RFC, panduan, dan materi sosialisasi. Tetapkan WIP limit, jalankan canary, dan lakukan evaluasi pasca-rilis agar laju dan kualitas seimbang.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} ramah dalam memimpin tim dan mampu mengawal detail SOP saat diperlukan. Ia menjaga kepuasan pengguna area sambil memastikan standar terdokumentasi.
    `.trim(),
    least: `
Risiko: terlalu optimistis pada kemampuan tim sehingga target tidak realistis, atau bekerja sendiri terlalu lama di detail. Penyeimbang: kuota jelas per rute, audit sampling, dan komunikasi status singkat berkala.
    `.trim(),
    change: `
Saat metode/alat baru diterapkan, ${nickname} komunikatif melatih tim dan menyiapkan panduan rinci. Jaga fokus CTQ agar tidak terseret detail minor, ukur temuan & waktu siklus sebelum ekspansi penuh.
    `.trim()
}
},
    IDS: {
  Administrator: {
    most: `
Sebagai |I-D-S|, ${nickname} memimpin lewat relasi yang kuat, eksekusi cepat, dan ritme kerja stabil. Ia disukai, mudah menggerakkan dukungan lintas unit, serta tekun menutup loop sampai tuntas. Ia tahu kapan meminta bantuan dan mendelegasikan detail ke pemilik proses, sambil menjaga arah dan moral tim.
    `.trim(),
    least: `
Di bawah tekanan, ${nickname} bisa mengejar popularitas, melebarkan komitmen, atau terlalu bergantung pada bantuan sehingga prioritas kabur. Risiko: scope creep dan turunnya kualitas. Penyeimbang: kunci CTQ, tetapkan RACI, WIP limit, dan checkpoint kualitas terjadwal agar fokus tetap terjaga.
    `.trim(),
    change: `
Dalam perubahan kebijakan/sistem, ${nickname} unggul sebagai duta perubahan: kampanye yang kuat, koordinasi lapangan rapi, dan dukungan tim tinggi. Guardrail: definisikan baseline lingkup, rencana bertahap (pilot → scale), dan dashboard status-risiko-keputusan agar laju tidak mengorbankan akurasi.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |I-D-S|, ${nickname} karismatik, suportif, dan tegas mengarahkan kelas menuju tujuan yang jelas. Ia menjaga atmosfer positif, struktur stabil, dan konsisten menyelesaikan tindak lanjut tugas—mendorong keterlibatan sekaligus disiplin.
    `.trim(),
    least: `
Dalam tekanan, ${nickname} berisiko terlalu banyak aktivitas sosial, memberi beban berlebih, atau kurang teliti pada batas kelas. Antidot: kontrak belajar, rubrik ringkas, dan jeda refleksi berkala agar energi sosial tetap produktif.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menjelaskan alasan perubahan dengan bahasa yang membangun buy-in. Siapkan contoh tugas, timeline bertahap, dan peran ko–guru untuk detail penilaian sehingga adaptasi cepat dan konsisten.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} efektif sebagai koordinator insiden dan penggerak eksekusi: menghubungkan pihak relevan, menjaga komunikasi status, dan menindaklanjuti sampai tuntas dengan ritme stabil.
    `.trim(),
    least: `
Di puncak tekanan, ${nickname} bisa melewatkan dokumentasi/QA karena fokus menyelesaikan atau menunda keputusan sulit demi harmoni. Peredam: checklist insiden, kriteria “escalate now”, pisahkan “fix-now/fix-next”, dan postmortem tanpa menyalahkan.
    `.trim(),
    change: `
Saat migrasi/perubahan arsitektur, ${nickname} kuat di sosialisasi dan pendampingan. Kunci keselamatan: RFC tertulis, canary/blue–green, metrik kesehatan, dan rencana rollback agar adopsi cepat namun terukur.
    `.trim()
  },
  Housekeeping: {
    most: `
Sebagai leader lapangan, ${nickname} menjaga semangat tim, mengatur rute kerja efisien, dan konsisten menutup temuan. Ia mudah meminta dukungan lintas area dan membuat standar terasa “ringan dijalankan”.
    `.trim(),
    least: `
Risiko: menunda teguran demi suasana, target melebar, atau mengabaikan spot kecil. Penyeimbang: daftar CTQ per area, target waktu per segmen, sampling audit, dan umpan balik singkat-tegas.
    `.trim(),
    change: `
Ketika SOP/layout berubah, ${nickname} menjalankan briefing massal, demo lapangan, dan buddy system. Lakukan pilot area kritis, ukur compliance & waktu siklus, baru ekspansi bertahap.
    `.trim()
  }
},

IDC: {
  Administrator: {
    most: `
Sebagai |I-D-C|, ${nickname} menggabungkan jejaring kuat, dorongan eksekusi, dan ketepatan saat dibutuhkan. Ia andal merekrut/merangkul stakeholder, menyusun pesan yang meyakinkan, dan memastikan tugas “done right” dengan kontrol mutu memadai.
    `.trim(),
    least: `
Risiko: tampak dingin/dominan, terlalu fokus tugas hingga mengabaikan kebutuhan orang, atau overtrust pada penilaian terhadap orang/kemampuan tim. Antidot: sesi “voice of stakeholder”, gate prioritas (impact–effort–risk), WIP limit, dan partner C untuk jaga ketelitian.
    `.trim(),
    change: `
Dalam perubahan sistem/struktur, ${nickname} kuat sebagai frontman: kampanye, perekrutan champion, dan onboarding. Guardrail: checklist go-live, definition of done yang tegas, serta sesi dengar pendapat agar buy-in tidak semu.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |I-D-C|, ${nickname} menghadirkan kelas engaging dengan standar yang jelas dan akurat. Ia komunikatif, menuntut kualitas tugas, dan mampu menyelami detail rubrik saat diperlukan.
    `.trim(),
    least: `
Risiko: terlalu menekan target hingga relasi siswa terabaikan, atau sebaliknya melompat fokus karena banyak ide. Penyeimbang: RPP ringkas, indikator inti, jadwal umpan balik konsisten, dan waktu fokus tanpa distraksi.
    `.trim(),
    change: `
Saat kurikulum berganti, ${nickname} mengomunikasikan perubahan dengan baik dan menyediakan contoh penilaian tepat. Hindari overload: uji coba kecil, iterasi rubrik berdasar bukti belajar, dan kalender evaluasi yang terkunci.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam peran teknis, ${nickname} luwes mengoordinasi lintas fungsi, bergerak cepat, dan menurunkan standar ke detail saat perlu. Dokumentasi dan QA dijaga cukup agar hasil reliabel sekaligus cepat.
    `.trim(),
    least: `
Di insiden/proyek paralel, risiko konteks lompat, overpromising, atau mengkritik sebelum data lengkap. Peredam: kanban transparan, WIP limit, PIC dokumentasi, dan checkpoint QA yang wajib.
    `.trim(),
    change: `
Pada perubahan arsitektur, ${nickname} efektif menyatukan stakeholder dan menjaga presisi eksekusi. Disiplin: RFC, change window, checklist verifikasi, metrik kesehatan, dan post-implementation review.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} persuasif merekrut/menyatukan tim, menetapkan standar yang jelas, dan memantau kualitas dengan daftar cek praktis. Kinerja area naik tanpa mematikan suasana positif.
    `.trim(),
    least: `
Risiko: mendorong tugas “harus benar” namun kurang mendengar kebutuhan lapangan, atau berganti fokus sebelum rute selesai. Penyeimbang: walk-through dua arah, rute prioritas, dan audit sampling berkala.
    `.trim(),
    change: `
Ketika metode/alat baru diterapkan, ${nickname} melatih secara interaktif dan memastikan standar terdokumentasi. Kunci: indikator CTQ sederhana, pelaporan singkat, dan evaluasi mingguan agar konsistensi terjaga.
    `.trim()
  }
},

ISD: {
  Administrator: {
    most: `
Sebagai |I-S-D|, ${nickname} menjaga harmoni dan layanan internal sambil tetap mendorong target tercapai. Ia komunikatif, suportif, dan siap memimpin ketika tujuan jelas—mampu menyelesaikan pekerjaan cepat dan efisien.
    `.trim(),
    least: `
Risiko: menghindari konfrontasi, mencari pengakuan, atau menunda keputusan sulit demi menjaga suasana. Antidot: SLA & ambang eskalasi, skrip percakapan tegas–empatik, dan review metrik kinerja yang transparan.
    `.trim(),
    change: `
Dalam perubahan, ${nickname} menenangkan kekhawatiran, memfasilitasi pelatihan, dan menjaga ritme adopsi. Tetapkan milestone kecil, deadline nyata, dan forum tanya-jawab berkala agar tempo tidak melambat.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |I-S-D|, ${nickname} menghadirkan kelas hangat, komunikatif, dan efisien. Ia mempertimbangkan perasaan siswa dalam keputusan, namun tetap menutup tugas tepat waktu dengan arahan jelas.
    `.trim(),
    least: `
Risiko: terlalu toleran pada kinerja rendah, enggan menegakkan aturan, atau mencari pengakuan berlebihan. Penyeimbang: kontrak belajar, batas tegas, rubrik sederhana, dan umpan balik yang spesifik–konstruktif.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} kuat pada komunikasi dan dukungan siswa. Siapkan contoh tugas, tahapan adaptasi, dan peran asisten untuk detail agar konsistensi terjaga.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} adalah liaison yang ramah, stabil dalam eksekusi, dan mampu memimpin saat perlu. Ia menjaga dokumentasi langkah-demi-langkah dan layanan yang konsisten sambil menyelesaikan pekerjaan efisien.
    `.trim(),
    least: `
Risiko: menunda konfrontasi pada blocking issue atau terlalu lama menjaga harmoni. Peredam: kriteria eskalasi, runbook tegas, dan daily check-in singkat untuk mengunci prioritas.
    `.trim(),
    change: `
Pada perubahan, ${nickname} membantu onboarding dan adopsi pengguna. Kunci: checklist sederhana, batas waktu, dan dukungan onsite agar transisi tidak melar.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menjaga moral tim, ritme kerja stabil, dan penyelesaian tugas cepat. Ia memimpin maupun mendukung sesuai kebutuhan, memastikan area rapi dan target tercapai.
    `.trim(),
    least: `
Risiko: sulit menegur pelanggaran atau over-focus pada pengakuan. Penyeimbang: CTQ area, inspeksi ringan namun sering, dan target waktu per rute.
    `.trim(),
    change: `
Saat SOP/layout baru, ${nickname} memperkenalkan perubahan secara komunikatif, menjalankan demo, dan buddy system. Ukur compliance & temuan utama sebelum ekspansi penuh.
    `.trim()
}
},
    
ISC: {
  Administrator: {
    most: `
Sebagai |I-S-C|, ${nickname} mengandalkan hubungan yang hangat, ritme kerja stabil, dan standar kualitas yang jelas. Ia komunikatif–loyal, sensitif pada kebutuhan pemangku kepentingan, serta mengambil keputusan berbasis data/dokumen. Operasi harian rapi karena SOP dipahami semua pihak, ekspektasi diperjelas sebelum proyek dimulai, dan tindak lanjut konsisten.
    `.trim(),
    least: `
Di bawah tekanan, ${nickname} dapat terlalu peduli pada opini orang, menahan konfrontasi, dan menunda keputusan sampai data “lengkap”. Risiko: lambat, scope melebar, dan pesan tidak tegas. Antidot: SLA & ambang eskalasi, tenggat keputusan, ringkasan 1 halaman berbasis fakta, serta skrip percakapan tegas–empatik.
    `.trim(),
    change: `
Dalam perubahan kebijakan/sistem, ${nickname} efektif menenangkan kekhawatiran dan memfasilitasi pelatihan. Guardrail: ekspektasi per peran dipertegas, pilot kecil, checklist adopsi, office hour Q&A, dan metrik compliance—agar tempo adaptasi terjaga tanpa mengorbankan kualitas.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |I-S-C|, ${nickname} membangun kelas hangat dan terstruktur. Ia peka terhadap emosi siswa, menjaga stabilitas ritme belajar, dan menilai berbasis rubrik/indikator yang jelas sehingga adil dan transparan.
    `.trim(),
    least: `
Risiko: kurang tegas menegakkan aturan, terlalu memikirkan penerimaan sosial, atau menumpuk detail administrasi. Penyeimbang: kontrak belajar, batas tegas yang konsisten, rubrik ringkas (indikator inti), dan jadwal umpan balik tetap.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menjelaskan perubahan secara empatik, memberi contoh tugas & rubrik baru, lalu menggelar adaptasi bertahap. Pastikan pacing realistis dan pantau ketercapaian indikator utama.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} kuat di dukungan pengguna, dokumentasi langkah-demi-langkah, dan QA yang sabar. Ia menjaga hubungan baik, ritme stabil, dan keputusan berbasis bukti—cocok untuk BA/QA, dokumentasi, dan layanan rutin.
    `.trim(),
    least: `
Risiko: perfeksionisme administrasi, sulit menolak permintaan, menunda eskalasi karena menjaga harmoni. Peredam: kriteria “escalate now”, WIP limit, matriks prioritas CTQ, dan standup status 10 menit yang tegas.
    `.trim(),
    change: `
Pada perubahan, ${nickname} membantu adopsi lewat panduan rinci dan pendampingan. Gunakan change window, checklist verifikasi, serta sampling audit agar kualitas tetap konsisten saat transisi.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menjaga moral tim, komunikasi ramah, dan konsistensi SOP. Ia memastikan setiap anggota paham standar, rute, serta ekspektasi sebelum mulai—mendorong kepatuhan dan kualitas area yang stabil.
    `.trim(),
    least: `
Risiko: enggan menegur pelanggaran kecil, khawatir pada opini, dan fokus pada detail administrasi ketimbang throughput. Penyeimbang: checklist bertanda tangan, inspeksi ringan–sering, CTQ per area, dan target waktu per rute.
    `.trim(),
    change: `
Saat SOP/layout baru, ${nickname} mengedukasi tim via demo lapangan dan buddy system. Mulai dari area prioritas, ukur compliance & temuan kunci, lalu skalakan bertahap.
    `.trim()
  }
},

ICD: {
  Administrator: {
    most: `
Sebagai |I-C-D|, ${nickname} memadukan keramahan yang membangun jejaring, presisi kebijakan, dan dorongan menyelesaikan tugas “benar sejak awal”. Ia nyaman menilai situasi/relasi, menjaga kualitas, dan mengarahkan eksekusi berbasis dokumen/aturan yang jelas.
    `.trim(),
    least: `
Di tekanan tinggi, ${nickname} cenderung perfeksionis lalu mengisolasi diri untuk menuntaskan, enggan pada kejutan, dan menunda keputusan sampai sangat yakin. Risiko: lambat & kurang transparan. Antidot: definisikan “good enough”, timebox analisis, keputusan berbasis risiko CTQ, dan ritual status reguler.
    `.trim(),
    change: `
Dalam perubahan, ${nickname} efektif bila rencana jelas, tanpa kejutan, dengan SOP/pelatihan rapi. Terapkan rollout bertahap, checklist go-live, metrik kualitas pasca-implementasi, dan jalur umpan balik terbuka agar buy-in dan mutu sama-sama terjaga.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |I-C-D|, ${nickname} menghadirkan kelas engaging namun presisi: relasi baik dengan siswa, rubrik akurat, dan penyelesaian tugas tepat. Ia menjaga kualitas hasil belajar melalui standar jelas.
    `.trim(),
    least: `
Risiko: over-detail hingga waktu habis, enggan improvisasi, atau fokus pada kesempurnaan dokumen. Penyeimbang: indikator inti saja, contoh tugas sederhana, dan jeda eksplorasi terarah agar kreativitas siswa tetap hidup.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyiapkan panduan rinci dan contoh penilaian. Uji coba skala kecil, iterasi berdasarkan data hasil belajar, dan kunci kalender evaluasi untuk konsistensi.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam peran teknis, ${nickname} unggul pada QA, dokumentasi presisi, dan pengendalian perubahan. Ia sosial seperlunya namun tegas pada standar kualitas—mendorong hasil yang reliabel dan auditable.
    `.trim(),
    least: `
Risiko: analisis berlarut, resistensi pada perubahan mendadak, atau bekerja sendiri terlalu lama. Peredam: kanban transparan, WIP limit, gate keputusan, dan eksperimen bertahap dengan metrik kesehatan yang disepakati.
    `.trim(),
    change: `
Pada perubahan arsitektur, ${nickname} menulis RFC, menetapkan CTQ, dan menyiapkan rollback. Lakukan canary/blue–green, verifikasi terukur, dan post-implementation review untuk pembelajaran berkelanjutan.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} ramah dalam memimpin, namun sangat berorientasi pada kualitas. SOP rinci, checklist lengkap, dan inspeksi terukur membuat area konsisten bersih–rapi.
    `.trim(),
    least: `
Risiko: lambat beradaptasi saat ritme berubah, tenggelam di detail minor, atau bekerja sendiri menyelesaikan “sempurna”. Penyeimbang: CTQ area, timeboxing per rute, dan sampling audit agar fokus tetap pada dampak terbesar.
    `.trim(),
    change: `
Saat metode/alat baru diterapkan, ${nickname} menyiapkan standar kerja, pelatihan, dan evaluasi terjadwal. Mulai dari area kunci, ukur temuan & waktu siklus, kemudian perluas.
    `.trim()
  }
},

ICS: {
  Administrator: {
    most: `
Sebagai |I-C-S|, ${nickname} mengutamakan layanan empatik, kepastian standar, dan stabilitas proses. Ia komunikatif, loyal, sensitif terhadap kebutuhan pihak lain, serta mengambil keputusan berbasis data—hasilnya operasi tertib dan ramah pemangku kepentingan.
    `.trim(),
    least: `
Di bawah tekanan, ${nickname} bisa terlalu khawatir pada opini, menunda konfrontasi, atau perfeksionis pada detail administrasi. Risiko: keputusan lambat & energi terkuras. Antidot: ambang eskalasi, tenggat keputusan, CTQ yang disepakati, dan review status singkat berkala.
    `.trim(),
    change: `
Dalam perubahan, ${nickname} efektif sebagai fasilitator adopsi: menjelaskan alasan, menyiapkan panduan, dan menjaga ritme stabil. Gunakan pilot, checklist, serta metrik compliance agar kualitas tetap konsisten.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |I-C-S|, ${nickname} menghadirkan kelas hangat, terstruktur, dan adil. Ia peka pada perasaan siswa, menggunakan rubrik jelas, serta memastikan ekspektasi dipahami sebelum proyek dimulai.
    `.trim(),
    least: `
Risiko: terlalu memikirkan penerimaan sosial, kurang tegas pada pelanggaran, atau tenggelam pada detail kecil. Penyeimbang: kontrak belajar, indikator inti, bahasa umpan balik spesifik–konstruktif, dan batas waktu tugas yang konsisten.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyusun contoh tugas, rubrik baru, dan jadwal pelatihan singkat. Adaptasi bertahap dengan pemantauan indikator utama menjaga tempo tanpa mengorbankan rasa aman siswa.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} kuat di layanan pengguna, dokumentasi, dan QA praktis. Ia menjaga hubungan baik sambil memastikan standar dipenuhi—cocok untuk BA/QA & support operasional.
    `.trim(),
    least: `
Risiko: perfeksionisme dokumentasi, menunda eskalasi, dan over-communication yang mengaburkan prioritas. Peredam: kriteria “escalate now”, kanban prioritas CTQ, WIP limit, dan checkpoint QA terjadwal.
    `.trim(),
    change: `
Pada perubahan, ${nickname} menyusun panduan praktis, memberikan pelatihan, dan menjaga ritme transisi. Terapkan change window, checklist verifikasi, dan sampling audit agar kualitas konsisten.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} ramah dan telaten menjaga SOP, memastikan tim paham standar serta rute kerja sebelum eksekusi. Kualitas area stabil karena komunikasi jelas dan tindak lanjut rapi.
    `.trim(),
    least: `
Risiko: sulit menegur pelanggaran atau fokus pada detail minor hingga throughput turun. Penyeimbang: CTQ per area, target waktu per segmen, inspeksi ringan–sering, dan apresiasi kepatuhan.
    `.trim(),
    change: `
Saat SOP/layout baru, ${nickname} melakukan briefing komunikatif, demo lapangan, dan buddy system. Ukur compliance & temuan utama sebelum perluas ke seluruh area.
    `.trim()
  }
},
    SD: {
  Administrator: {
    most: `
Sebagai |S-D|, ${nickname} menggabungkan stabilitas proses dengan dorongan hasil. Ia objektif–analitis, suka terlibat langsung, dan konsisten menutup tindak lanjut hingga tuntas. Gaya tenang membangun kepercayaan, sementara dorongan D menjaga target dan SLA tercapai.
    `.trim(),
    least: `
Di bawah tekanan, ${nickname} bisa menjadi tidak ramah/terkesan dingin, menahan konfrontasi, atau lebih memilih “mendukung pemimpin” ketimbang mengambil alih isu yang tidak nyaman. Risiko: keputusan lambat dan prioritas kabur. Antidot: tenggat keputusan, ambang eskalasi, RACI tegas, dan ringkasan 1 halaman untuk mempercepat arah.
    `.trim(),
    change: `
Pada perubahan kebijakan/sistem, ${nickname} efektif dengan transisi bertahap: pilot kecil, SOP jelas, dan checklist implementasi. Jaga ritme stabil (S), namun pasang milestone tegas (D) agar adaptasi cepat tapi terkendali.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |S-D|, ${nickname} tenang–tegas: kelas terstruktur, ekspektasi jelas, dan tindak lanjut rapi. Ia suportif pada siswa namun konsisten mendorong penyelesaian tugas sampai selesai.
    `.trim(),
    least: `
Dalam tekanan, ${nickname} bisa kaku pada rencana, kurang spontan, atau menjaga jarak saat suasana tidak nyaman. Penyeimbang: variasi aktivitas berisiko rendah, check-in singkat, dan diferensiasi tugas agar disiplin tetap humanis.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyusun peta transisi (apa tetap–berubah–dihapus), contoh tugas, dan rubrik sederhana. Lakukan bertahap agar stabilitas kelas tetap terjaga.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} unggul pada prioritisasi tenang, eksekusi terstruktur, dan follow-up konsisten. Analisis obyektif dan ketahanan tinggi membuat reliabilitas sistem terjaga.
    `.trim(),
    least: `
Di puncak tekanan, ${nickname} cenderung menunda eskalasi/konfrontasi atau bertahan pada cara aman. Peredam: kriteria “escalate now”, runbook insiden, standup status 10 menit, dan pemisahan “fix-now/fix-next”.
    `.trim(),
    change: `
Saat migrasi/perubahan arsitektur, ${nickname} cocok memimpin rollout bertahap (canary/blue–green), dokumentasi, dan checkpoint kualitas. Milestone tegas memastikan laju tanpa mengorbankan stabilitas.
    `.trim()
  },
  Housekeeping: {
    most: `
Sebagai leader area, ${nickname} menjaga ritme kerja stabil, rute jelas, dan tindak lanjut temuan sampai tuntas. Ia suportif pada tim dan memastikan standar dipenuhi secara konsisten.
    `.trim(),
    least: `
Di beban puncak atau situasi tidak nyaman, ${nickname} bisa tampak dingin, menunda teguran, atau melambat untuk “mengamati”. Penyeimbang: CTQ per area, skrip umpan balik tegas–santun, target waktu per segmen, dan sampling audit.
    `.trim(),
    change: `
Ketika SOP/layout berubah, ${nickname} menjalankan simulasi rute, briefing lapangan, dan buddy system. Mulai dari area kunci, ukur compliance & waktu siklus, lalu skalakan.
    `.trim()
  }
},

SI: {
  Administrator: {
    most: `
Sebagai |S-I|, ${nickname} hangat, stabil, dan menjaga harmoni tim serta layanan internal. Ia pendengar baik, memfasilitasi kolaborasi, dan memastikan proses berjalan konsisten untuk kepuasan pemangku kepentingan.
    `.trim(),
    least: `
Risiko: menghindari konfrontasi, menerima kritik sebagai serangan pribadi, dan terlalu toleran pada kinerja rendah. Antidot: SLA & ambang eskalasi, skrip percakapan tegas–empatik, metrik kinerja transparan, dan dukungan HR/QA saat diperlukan.
    `.trim(),
    change: `
Dalam perubahan, ${nickname} menenangkan kekhawatiran dan memfasilitasi pelatihan. Tetapkan deadline nyata, milestone kecil, dan forum Q&A agar tempo tidak melambat.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |S-I|, ${nickname} menciptakan kelas hangat, aman, dan suportif. Ia pendengar yang sangat baik, mempertimbangkan perasaan siswa, dan menjaga stabilitas ritme belajar.
    `.trim(),
    least: `
Risiko: kurang tegas, terlalu memaklumi, dan terluka oleh kritik. Penyeimbang: kontrak belajar, batas peran/aturan yang konsisten, rubrik ringkas, dan latihan umpan balik spesifik–konstruktif.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyampaikan perubahan secara empatik dan bertahap dengan contoh tugas. Pastikan pacing realistis dan indikator utama dipantau.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam peran teknis, ${nickname} kuat di layanan pengguna, perawatan rutin, dan dokumentasi langkah demi langkah. Ia menjaga hubungan baik dan ritme layanan stabil.
    `.trim(),
    least: `
Risiko: menunda eskalasi demi harmoni, toleran pada deviasi prosedur, atau terlalu lama mendengarkan tanpa keputusan. Peredam: kriteria “escalate now”, runbook tegas, dan standup status singkat yang mengunci prioritas.
    `.trim(),
    change: `
Pada perubahan, ${nickname} membantu onboarding dan adopsi pengguna via panduan praktis. Gunakan checklist, batas waktu, dan sampling audit agar kualitas konsisten.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menjaga moral tim, komunikasi ramah, dan rutinitas stabil. Keluhan pengguna area ditangani dengan empatik sambil menjaga standar.
    `.trim(),
    least: `
Risiko: enggan menegur pelanggaran, toleran terhadap ketidakefektifan. Penyeimbang: checklist bertanda tangan, inspeksi ringan–sering, target waktu per rute, dan apresiasi kepatuhan.
    `.trim(),
    change: `
Saat SOP/layout baru, ${nickname} memperkenalkan perubahan secara komunikatif, demo lapangan, dan pendampingan. Fokus pada indikator CTQ agar tidak terseret isu minor.
    `.trim()
  }
},

SC: {
  Administrator: {
    most: `
Sebagai |S-C|, ${nickname} ramah–teliti: menjaga stabilitas proses, kepatuhan, dan detail operasional. Ia mempertimbangkan dampak keputusan pada orang dan menyusun SOP/dokumen yang jelas agar layanan konsisten dan dapat diaudit.
    `.trim(),
    least: `
Risiko: terlalu hati-hati, menunda keputusan, atau memperlambat kerja untuk “mengamati” saat merasa ada yang memanfaatkan situasi. Antidot: timebox analisis, definisi “good enough”, jalur sign-off sederhana, dan kanal umpan balik yang aman.
    `.trim(),
    change: `
Dalam perubahan, ${nickname} efektif dengan rencana tanpa kejutan: pilot kecil, checklist go-live, dan metrik pasca-implementasi. Komunikasi empatik menjaga buy-in, sementara standar mutu tetap tegak.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |S-C|, ${nickname} menghadirkan kelas stabil, rapi, dan teliti. Ia peduli pada siswa sekaligus menjaga akurasi administrasi dan penilaian berbasis rubrik.
    `.trim(),
    least: `
Risiko: terlalu hati-hati, ruang eksplorasi sempit, dan lambat mengambil keputusan. Penyeimbang: indikator inti saja, contoh tugas sederhana, serta sesi eksplorasi terarah agar kreativitas tidak padam.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyiapkan panduan rinci dan bertahap. Uji coba kecil, iterasi berdasar bukti belajar, dan kalender evaluasi yang terkunci menjaga konsistensi.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} kuat pada QA, SOP terperinci, dan dokumentasi. Ia menjaga layanan stabil dan kualitas detail tereksekusi dengan baik.
    `.trim(),
    least: `
Risiko: kehati-hatian berlebih memperlambat rilis atau membuat ${nickname} memperlambat kerja untuk memantau situasi. Peredam: matriks risiko CTQ, WIP limit, gate keputusan, dan eksperimen bertahap dengan metrik kesehatan.
    `.trim(),
    change: `
Pada perubahan arsitektur, ${nickname} menyusun RFC, checklist verifikasi, dan rencana rollback. Jalankan canary/blue–green, ukur hasil, dan lakukan review terjadwal agar mutu terjaga tanpa menghambat roadmap.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menjaga SOP rinci, rute kerja stabil, dan inspeksi yang telaten. Detail diperhatikan tanpa mengorbankan kenyamanan tim/area.
    `.trim(),
    least: `
Jika merasa ada yang “memanfaatkan”, ${nickname} dapat melambat untuk mengamati— throughput turun. Penyeimbang: pembagian kerja adil, rotasi rute, CTQ per area, dan umpan balik dua arah yang jelas.
    `.trim(),
    change: `
Saat metode/alat baru diterapkan, ${nickname} menyiapkan standar kerja, pelatihan, dan evaluasi. Mulai dari area prioritas, ukur temuan & waktu siklus, lalu perluas bertahap.
    `.trim()
  }
}
,
    SDI: {
  Administrator: {
    most: `
Sebagai |S-D-I|, ${nickname} menyeimbangkan ritme kerja stabil (S), ketegasan target (D), dan komunikasi yang memobilisasi (I). Ia objektif–analitis, senang terlibat langsung, suportif pada pemangku kepentingan, dan kuat pada tindak lanjut hingga tuntas. Detail operasional dapat didelegasikan ke pemilik proses, sementara ${nickname} menjaga arah, disiplin, dan kolaborasi.
    `.trim(),
    least: `
Di bawah tekanan, ${nickname} cenderung menghindari konfrontasi pada isu tidak nyaman, bertahan pada cara aman, atau melebar membantu banyak pihak hingga prioritas kabur. Risiko: keputusan lambat, scope creep, dan akuntabilitas kabur. Antidot: tenggat keputusan, RACI tegas, WIP limit, dan ringkasan 1 halaman berbasis fakta untuk eskalasi cepat.
    `.trim(),
    change: `
Saat perubahan kebijakan/sistem, ${nickname} efektif menjalankan transisi bertahap: pilot kecil, milestone jelas, dan checklist adopsi. Gunakan komunikasi ritmik (I) untuk buy-in, jaga ritme stabil (S), dan kunci CTQ serta baseline lingkup (D) agar laju tidak mengorbankan kualitas.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |S-D-I|, ${nickname} menata kelas stabil dan suportif dengan tujuan belajar yang jelas. Ia persisten menutup tugas, membangun relasi positif, dan memotivasi siswa sambil menjaga struktur aktivitas yang terarah.
    `.trim(),
    least: `
Dalam tekanan, ${nickname} bisa ragu menegakkan aturan di awal, lalu mendadak tegas belakangan; atau menambah aktivitas demi menjaga suasana hingga beban tidak proporsional. Penyeimbang: kontrak belajar, tangga konsekuensi yang konsisten, dan diferensiasi tugas agar disiplin tetap manusiawi.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} memetakan “apa tetap–berubah–dihapus”, menyiapkan contoh tugas & rubrik sederhana, dan menyosialisasikan bertahap ke siswa–orang tua. Jaga scaffolding dan ritme evaluasi agar adaptasi mulus.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam konteks teknis, ${nickname} tenang–tegas: menetapkan prioritas, mengoordinasi respon, dan menutup loop hingga insiden/proyek tuntas. Ia objektif pada RCA, komunikatif pada status, dan konsisten pada follow-up.
    `.trim(),
    least: `
Di puncak tekanan, ${nickname} bisa menunda eskalasi, bertahan pada solusi aman, atau melewatkan dokumentasi karena fokus menyelesaikan. Peredam: kriteria “escalate now”, pisahkan “fix-now/fix-next”, checklist insiden, dan postmortem tanpa menyalahkan.
    `.trim(),
    change: `
Saat migrasi/perubahan arsitektur, ${nickname} unggul dengan rollout bertahap (canary/blue–green), runbook, dan komunikasi status ritmik. Milestone tegas (D) + stabilitas eksekusi (S) + buy-in lintas tim (I) = adopsi cepat namun aman.
    `.trim()
  },
  Housekeeping: {
    most: `
Sebagai leader area, ${nickname} menjaga ritme kerja stabil, rute jelas, dan tindak lanjut temuan sampai tuntas. Ia memotivasi tim dengan komunikasi hangat sambil memastikan standar terpenuhi.
    `.trim(),
    least: `
Di beban puncak, ${nickname} bisa menunda teguran demi suasana atau menambah tugas tanpa mengukur beban. Penyeimbang: CTQ per area, target waktu per segmen, rotasi beban, dan sampling audit berkala.
    `.trim(),
    change: `
Ketika SOP/layout berubah, ${nickname} melakukan simulasi rute, briefing lapangan, dan buddy system. Mulai area prioritas, ukur compliance & waktu siklus, lalu skalakan bertahap.
    `.trim()
  }
},

SDC: {
  Administrator: {
    most: `
Sebagai |S-D-C|, ${nickname} sabar–terkontrol, menggali fakta, dan mengeksekusi konsisten. Ia merencanakan pekerjaan hati-hati, mengumpulkan data pendukung, lalu berjalan mantap sesuai arahan yang benar. People skill menonjol sehingga layanan ke pemangku kepentingan kuat, sementara kepatuhan & dokumentasi terjaga.
    `.trim(),
    least: `
Risiko: terlalu hati-hati dan lambat memutuskan, over-collecting data, atau mengutamakan kenyamanan orang dibanding batas waktu. Antidot: timebox analisis, acceptance criteria jelas, jalur sign-off sederhana, dan ambang eskalasi ketika blocker muncul.
    `.trim(),
    change: `
Dalam perubahan sistem, ${nickname} efektif jika governance jelas: RACI, RFC, checklist go-live, window perubahan, dan metrik kualitas pasca-implementasi. Jalankan bertahap dengan komunikasi empatik agar mutu dan buy-in terjaga.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |S-D-C|, ${nickname} menyiapkan kelas rapi, stabil, dan berbasis bukti. Ia sabar, ramah, teliti pada materi–rubrik, dan konsisten mendorong penyelesaian tugas yang benar.
    `.trim(),
    least: `
Dalam tekanan, ia bisa terlalu hati-hati, membatasi spontanitas, atau melambat demi verifikasi detail. Penyeimbang: indikator inti saja, contoh tugas sederhana, dan sesi eksplorasi terarah agar kreativitas tetap hidup.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyiapkan panduan rinci, contoh penilaian, dan jadwal bertahap. Hindari over-engineering: uji coba kecil dan iterasi berdasar data hasil belajar.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} kuat pada fact-finding, SOP, dan eksekusi konsisten. Ia menjaga kualitas dan stabilitas layanan melalui dokumentasi jelas dan kontrol perubahan.
    `.trim(),
    least: `
Risiko: analysis paralysis, menunda eskalasi, atau enggan mengubah rute kerja yang sudah aman. Peredam: matriks risiko CTQ, kriteria “escalate now”, dan eksperimen bertahap dengan metrik kesehatan.
    `.trim(),
    change: `
Pada perubahan arsitektur, ${nickname} mengandalkan RFC, test plan, rollback, dan verifikasi terukur. Jalankan canary/blue–green, review terjadwal, dan batasi WIP untuk menjaga mutu tanpa memperlambat roadmap.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} telaten, ramah, dan konsisten menolong tim. Rute, SOP, dan inspeksi dijalankan stabil; standar jelas sehingga kualitas area terjaga.
    `.trim(),
    least: `
Jika ritme berubah, ${nickname} bisa melambat untuk mengamati atau terlalu banyak memeriksa detail. Penyeimbang: CTQ per area, target waktu segmen, dan sampling audit agar fokus pada dampak terbesar.
    `.trim(),
    change: `
Saat metode/alat baru diterapkan, ${nickname} menyiapkan daftar cek, pelatihan, dan evaluasi bertahap. Mulai dari area prioritas, ukur temuan & waktu siklus, baru perluas.
    `.trim()
  }
},

SID: {
  Administrator: {
    most: `
Sebagai |S-I-D|, ${nickname} hangat–stabil dan komunikatif, namun siap memimpin ketika tujuan jelas. Ia mempertimbangkan perasaan orang dalam keputusan, menjaga layanan konsisten, dan mendorong penyelesaian kerja cepat–efisien ketika dibutuhkan.
    `.trim(),
    least: `
Risiko: menghindari konfrontasi, menerima kritik secara pribadi, terlalu toleran pada kinerja rendah, atau mengejar pengakuan sehingga prioritas kabur. Antidot: SLA & ambang eskalasi, skrip umpan balik tegas–empatik, metrik kinerja transparan, dan checkpoint keputusan.
    `.trim(),
    change: `
Dalam perubahan, ${nickname} menenangkan kekhawatiran dan menggalang dukungan. Tetapkan milestone kecil, deadline nyata, contoh konkret, dan forum tanya–jawab berkala agar adaptasi tidak melambat.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |S-I-D|, ${nickname} menciptakan kelas hangat dan suportif, lalu mengarahkan ke pencapaian yang jelas. Ia komunikatif, mempertimbangkan emosi siswa, dan menyelesaikan tugas tepat waktu saat target sudah disepakati.
    `.trim(),
    least: `
Risiko: kurang tegas di awal, terlalu memaklumi, atau sensitif terhadap kritik. Penyeimbang: kontrak belajar, batas peran & aturan konsisten, rubrik ringkas, dan jadwal umpan balik tetap.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyampaikan alasan perubahan secara empatik, menyediakan contoh tugas, dan menjadwalkan adaptasi bertahap. Daya dorong D dipakai untuk memastikan tenggat tercapai.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam peran teknis, ${nickname} andal pada layanan pengguna, dokumentasi langkah-demi-langkah, dan koordinasi ketika prioritas jelas. Ia menjaga ritme stabil dan menyelesaikan pekerjaan efisien.
    `.trim(),
    least: `
Risiko: menunda eskalasi atau teguran demi harmoni, menyerap kritik secara pribadi, dan toleran terhadap deviasi prosedur. Peredam: kriteria “escalate now”, runbook tegas, standup 10 menit untuk mengunci prioritas.
    `.trim(),
    change: `
Pada perubahan, ${nickname} membantu onboarding dan adopsi pengguna. Gunakan checklist, batas waktu, change window, dan sampling audit agar kualitas konsisten selama transisi.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menjaga moral tim, ritme stabil, dan siap memimpin atau mendukung sesuai kebutuhan. Ia memastikan area rapi melalui komunikasi jelas dan tindak lanjut cepat.
    `.trim(),
    least: `
Risiko: enggan menegur pelanggaran kecil, fokus pada penerimaan sosial, atau tersinggung oleh kritik. Penyeimbang: CTQ area, inspeksi ringan–sering, target waktu per rute, dan format umpan balik spesifik–konstruktif.
    `.trim(),
    change: `
Saat SOP/layout baru, ${nickname} memperkenalkan perubahan secara komunikatif, demo lapangan, dan buddy system. Ukur compliance & temuan utama sebelum ekspansi penuh.
    `.trim()
  }
},
    SIC: {
  Administrator: {
    most: `
Sebagai |S-I-C|, ${nickname} stabil, ramah, dan loyal dalam membangun hubungan pemangku kepentingan. Ia menjaga layanan konsisten, menjelaskan ekspektasi sebelum proyek dimulai, dan mampu masuk ke detail ketika dibutuhkan. Keputusan dibuat berbasis data, namun preferensi utamanya adalah menjaga harmoni tim dan kejelasan peran.
    `.trim(),
    least: `
Di bawah tekanan, ${nickname} bisa terlalu peduli pada opini, enggan konfrontasi, menunggu mandat jelas, atau menunda keputusan. Risiko: tempo melambat dan prioritas kabur. Antidot: tetapkan RACI/decision-rights, SLA & tenggat keputusan, ringkasan 1 halaman berbasis fakta, serta skrip percakapan tegas–empatik.
    `.trim(),
    change: `
Dalam perubahan kebijakan/sistem, ${nickname} efektif sebagai fasilitator: menenangkan, melatih, dan menjaga komunikasi dua arah. Guardrail: mandat tertulis, pilot kecil, checklist adopsi, office hour Q&A, dan metrik compliance agar adaptasi cepat namun tetap nyaman.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |S-I-C|, ${nickname} menciptakan kelas hangat dan terstruktur. Ia peka terhadap perasaan siswa, loyal, dan menilai dengan rubrik jelas berbasis data. Ekspektasi dipastikan dipahami sebelum tugas dimulai.
    `.trim(),
    least: `
Risiko: sulit tegas di awal, bingung saat mandat/aturan tidak jelas, atau terlalu memikirkan penerimaan sosial. Penyeimbang: kontrak belajar, indikator inti pada rubrik, batas peran konsisten, dan jadwal umpan balik tetap.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menjelaskan alasan perubahan secara empatik, menyediakan contoh tugas, dan menggelar adaptasi bertahap. Pastikan parameter wewenang & standar minimum tertulis.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} kuat di dukungan pengguna, dokumentasi langkah-demi-langkah, dan QA praktis. Ia menjaga ritme stabil dan relasi baik, serta mengeksekusi detail saat diperlukan.
    `.trim(),
    least: `
Risiko: menunda eskalasi demi harmoni, ragu mengambil keputusan tanpa mandat, atau over-communicate hingga prioritas kabur. Peredam: kriteria “escalate now”, kanban prioritas CTQ, WIP limit, dan checkpoint QA terjadwal.
    `.trim(),
    change: `
Pada perubahan, ${nickname} menyusun panduan praktis, pelatihan komunikatif, dan jalur bantuan. Gunakan change window, checklist verifikasi, dan sampling audit agar kualitas konsisten selama transisi.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} ramah, telaten, dan menjaga SOP berjalan konsisten. Ia memastikan tiap anggota paham standar dan rute sebelum eksekusi; hubungan tim positif dan kepatuhan stabil.
    `.trim(),
    least: `
Risiko: enggan menegur pelanggaran kecil, terlalu khawatir opini, atau menunda keputusan saat mandat tidak jelas. Penyeimbang: CTQ per area, target waktu per segmen, inspeksi ringan–sering, dan format umpan balik tegas–santun.
    `.trim(),
    change: `
Saat SOP/layout baru, ${nickname} melakukan demo lapangan, buddy system, dan penjelasan ekspektasi yang eksplisit. Mulai dari area prioritas, ukur compliance & temuan kunci, lalu skalakan.
    `.trim()
  }
},

SCD: {
  Administrator: {
    most: `
Sebagai |S-C-D|, ${nickname} stabil, teliti, dan berorientasi kualitas. Ia mempertimbangkan dampak keputusan pada orang, menyusun SOP/dokumen jelas, dan mengeksekusi dengan konsisten. Ketika target harus dikejar, sisi D memastikan penyelesaian tepat waktu tanpa mengorbankan mutu.
    `.trim(),
    least: `
Risiko: terlalu hati-hati, memperlambat kerja untuk “mengamati” saat merasa ada yang memanfaatkan, atau menunda keputusan demi kesempurnaan. Antidot: timebox analisis, definisi “good enough”, jalur sign-off sederhana, ambang eskalasi, dan pembagian akuntabilitas yang jelas.
    `.trim(),
    change: `
Dalam perubahan sistem, ${nickname} unggul jika governance jelas: RACI, RFC, checklist go-live, window perubahan, serta metrik pasca-implementasi. Jalankan bertahap dengan komunikasi empatik agar buy-in dan kualitas sama-sama terjaga.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |S-C-D|, ${nickname} menghadirkan kelas stabil, rapi, dan teliti. Ia peduli pada siswa, rubrik akurat, serta konsisten mendorong tugas selesai dengan benar sejak awal.
    `.trim(),
    least: `
Risiko: kehati-hatian berlebih menyempitkan eksplorasi dan memperlambat keputusan. Penyeimbang: indikator inti saja, contoh tugas sederhana, dan sesi eksplorasi terarah agar kreativitas tetap hidup.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyiapkan panduan rinci, contoh penilaian, dan jadwal bertahap. Hindari over-engineering: uji coba kecil dan iterasi berdasar data hasil belajar.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} kuat pada QA, dokumentasi presisi, dan kontrol perubahan. Ia memastikan proses dapat diaudit dan stabil, lalu mendorong penyelesaian sesuai target saat diperlukan.
    `.trim(),
    least: `
Risiko: analysis paralysis, lambat beradaptasi, atau melambat untuk memantau “situasi”. Peredam: matriks risiko CTQ, kriteria “escalate now”, eksperimen bertahap dengan metrik kesehatan, dan standup status 10 menit.
    `.trim(),
    change: `
Pada perubahan arsitektur, ${nickname} menyiapkan RFC, test plan, rollback, dan verifikasi terukur. Terapkan canary/blue–green, review terjadwal, dan batasi WIP agar mutu terjaga tanpa menghambat roadmap.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menjaga SOP rinci, rute stabil, dan inspeksi telaten. Standar kebersihan dipertahankan dengan konsisten, sementara dorongan hasil memastikan temuan ditutup tepat waktu.
    `.trim(),
    least: `
Jika merasa ada pihak “memanfaatkan”, ${nickname} dapat memperlambat kerja untuk mengamati—throughput turun. Penyeimbang: pembagian kerja adil, rotasi rute, CTQ per area, target waktu segmen, dan umpan balik dua arah.
    `.trim(),
    change: `
Saat metode/alat baru diterapkan, ${nickname} menyusun standar kerja, pelatihan, dan evaluasi terjadwal. Mulai dari area prioritas, ukur temuan & waktu siklus, kemudian perluas bertahap.
    `.trim()
  }
},

SCI: {
  Administrator: {
    most: `
Sebagai |S-C-I|, ${nickname} mengutamakan stabilitas proses, kepastian standar, dan komunikasi yang hangat. Ia membangun hubungan positif, mengambil keputusan berbasis data, serta memastikan semua pihak memahami ekspektasi sebelum mulai.
    `.trim(),
    least: `
Risiko: keras kepala pada keputusan yang sudah diambil, menahan konfrontasi, atau menunggu parameter wewenang sangat jelas sebelum melangkah. Antidot: decision-rights matrix, SLA & tenggat keputusan, ringkasan 1 halaman berbasis fakta, dan forum dengar pendapat terstruktur.
    `.trim(),
    change: `
Dalam perubahan, ${nickname} efektif sebagai fasilitator adopsi yang stabil: menjelaskan alasan, menyiapkan panduan, dan menjaga ritme. Gunakan pilot, checklist verifikasi, dan metrik compliance agar kualitas konsisten.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |S-C-I|, ${nickname} menghadirkan kelas hangat, terstruktur, dan adil. Ia peka pada kebutuhan siswa, menggunakan rubrik jelas, dan memastikan ekspektasi dipahami sebelum proyek dimulai.
    `.trim(),
    least: `
Risiko: sulit mengubah pendirian, terlalu memikirkan penerimaan sosial, atau tenggelam pada detail administrasi. Penyeimbang: indikator inti, kontrak belajar, bahasa umpan balik spesifik–konstruktif, dan batas waktu konsisten.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyusun contoh tugas, rubrik baru, dan jadwal pelatihan singkat. Adaptasi bertahap dengan pemantauan indikator utama menjaga tempo tanpa mengorbankan rasa aman siswa.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam peran teknis, ${nickname} andal di layanan pengguna, dokumentasi, dan QA praktis. Ia menjaga relasi baik, ritme stabil, dan masuk ke detail saat diperlukan untuk memastikan mutu.
    `.trim(),
    least: `
Risiko: menunda eskalasi demi harmoni, teguh pada keputusan lama walau konteks berubah, atau over-communicate sehingga fokus kabur. Peredam: kriteria “escalate now”, kanban prioritas CTQ, WIP limit, dan checkpoint QA terjadwal.
    `.trim(),
    change: `
Pada perubahan, ${nickname} menyusun panduan rinci dan pelatihan komunikatif. Terapkan change window, checklist verifikasi, dan sampling audit agar kualitas konsisten saat transisi.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menjaga SOP konsisten, komunikasi ramah, dan rute kerja stabil. Ia memastikan setiap anggota paham standar & ekspektasi sebelum eksekusi, sehingga mutu area terjaga.
    `.trim(),
    least: `
Risiko: enggan menegur pelanggaran kecil, sulit mengubah keputusan yang sudah diambil, atau fokus pada opini. Penyeimbang: CTQ per area, inspeksi ringan–sering, target waktu per rute, dan umpan balik tegas–santun.
    `.trim(),
    change: `
Saat SOP/layout baru, ${nickname} melakukan briefing komunikatif, demo lapangan, dan buddy system. Ukur compliance & temuan utama sebelum perluas ke seluruh area.
    `.trim()
  }
},
    S: {
      Administrator: {
        most: `
Sebagai tipe Steadiness, ${nickname} sangat teratur, teliti, dan andal dalam memastikan proses administrasi berjalan lancar dan minim kesalahan. Konsistensi kerja yang tinggi membuat ${nickname} menjadi andalan dalam menjaga kelancaran dokumen, arsip, dan segala urusan administratif. ${nickname} biasanya sabar menghadapi proses, tetap tenang dalam menyelesaikan tugas, serta cenderung bertahan dengan sistem kerja yang sudah terbukti efektif.
        `.trim(),
        least: `
Ketika menghadapi perubahan prosedur atau sistem baru, ${nickname} cenderung resisten atau lambat beradaptasi. Sikap ini bisa menjadi penghambat pembaruan dan inovasi dalam administrasi. Untuk itu, penting bagi ${nickname} untuk membuka diri terhadap pembaruan, aktif mencari cara meningkatkan efisiensi, dan tetap responsif terhadap kebutuhan organisasi yang berkembang.
        `.trim(),
        change: `
Saat beban kerja meningkat atau terjadi perubahan mendadak, ${nickname} tetap mampu menjaga konsistensi dan kualitas pekerjaan. Namun, untuk bisa bertahan dalam dinamika administrasi modern, ${nickname} perlu terus mengembangkan kemampuan proaktif dalam menerima perubahan, baik dalam prosedur maupun teknologi.
        `.trim()
      },
      Guru: {
        most: `
Sebagai guru tipe Steadiness, ${nickname} sangat konsisten, sabar, dan mampu menciptakan lingkungan belajar yang stabil serta aman bagi siswa. Siswa merasa nyaman dan percaya untuk berkembang dalam kelas yang dipimpin oleh ${nickname}, karena suasana yang disiplin dan penuh perhatian. Pendekatan ini sangat mendukung keberhasilan proses belajar berkelanjutan.
        `.trim(),
        least: `
Saat menghadapi perubahan kurikulum atau dinamika kelas, ${nickname} cenderung kurang fleksibel. Hal ini bisa membuat kelas sulit menyesuaikan diri dengan tuntutan zaman atau kebutuhan siswa. ${nickname} perlu meningkatkan kemampuan adaptasi, mencari inovasi dalam metode belajar, dan lebih terbuka terhadap umpan balik dari siswa maupun rekan guru.
        `.trim(),
        change: `
Ketika tekanan pekerjaan meningkat, ${nickname} tetap bisa menjaga stabilitas dan ketenangan kelas. Namun, agar kualitas pembelajaran tetap terjaga, ${nickname} perlu terus membuka diri terhadap inovasi dan berbagai metode pembelajaran baru.
        `.trim()
      },
      "Technical Staff": {
        most: `
Sebagai tenaga teknis dengan tipe Steadiness, ${nickname} memastikan setiap pekerjaan dilakukan dengan teliti, hati-hati, dan minim risiko kesalahan. Konsistensi dan keandalan menjadi nilai lebih yang membuat ${nickname} sangat dipercaya oleh rekan kerja maupun atasan. Semua SOP teknis diikuti dengan disiplin, sehingga hasil kerja tetap terjamin kualitasnya.
        `.trim(),
        least: `
Ketika dihadapkan pada perubahan alat, prosedur, atau sistem baru, ${nickname} cenderung butuh waktu lebih lama untuk beradaptasi. Akibatnya, proses upgrade teknologi bisa tertunda. Untuk menghadapi tantangan era modern, ${nickname} perlu terus mengasah kemampuan belajar hal baru dan lebih terbuka terhadap perubahan.
        `.trim(),
        change: `
Dalam tekanan kerja teknis atau perubahan mendadak, ${nickname} mampu menjaga standar kualitas, namun harus lebih responsif dan fleksibel dalam menyikapi situasi lapangan, sehingga hasil kerja tetap efisien dan sesuai kebutuhan organisasi.
        `.trim()
      },
      Housekeeping: {
        most: `
Sebagai pribadi tipe Steadiness di Housekeeping, ${nickname} sangat menjaga standar kebersihan secara konsisten dan dapat diandalkan dalam rutinitas harian. ${nickname} memastikan setiap area tetap rapi, pekerjaan dilakukan teliti, dan tidak mudah lalai terhadap detail kebersihan. Sikap sabar dan kestabilan kerja menjadikan ${nickname} tulang punggung dalam menjaga kualitas layanan Housekeeping.
        `.trim(),
        least: `
Saat terjadi perubahan pola kerja, shifting jadwal, atau penambahan tugas baru, ${nickname} cenderung sulit beradaptasi. Hal ini kadang membuat tim Housekeeping kurang responsif terhadap kebutuhan organisasi yang terus berkembang. Oleh sebab itu, ${nickname} perlu lebih fleksibel, aktif bertanya, dan belajar metode kerja baru demi mendukung performa tim.
        `.trim(),
        change: `
Ketika tekanan meningkat, ${nickname} tetap stabil, teliti, dan tidak mudah panik. Namun, peningkatan adaptasi dan keterbukaan terhadap perubahan sangat diperlukan agar kinerja Housekeeping tetap optimal di segala kondisi.
        `.trim()
      }
    },
    CD: {
  Administrator: {
    most: `
Sebagai |C-D|, ${nickname} sangat berorientasi tugas, faktual, dan tegas pada standar. Ia cepat menyusun kebijakan yang jelas, indikator kinerja terukur, serta kontrol mutu ketat. Keputusan diambil berdasarkan data—bukan emosi—sehingga operasi administrasi tertib, konsisten, dan dapat diaudit.
    `.trim(),
    least: `
Risiko: tampak dingin/berjarak, micromanagement pada detail, dan toleransi rendah pada ambiguitas. Komunikasi bisa satu arah dan kepercayaan ke tim menurun. Antidot: definisikan “good enough”, delegasikan keputusan operasional dengan acceptance criteria, dan adakan forum tanya–jawab terstruktur untuk menjaga buy-in.
    `.trim(),
    change: `
Dalam perubahan sistem/struktur, ${nickname} efektif jika ada governance jelas: RACI, RFC terdokumentasi, checklist go-live, dan window perubahan. Jalankan pilot kecil dengan metrik pasca-implementasi (defect, SLA, compliance) agar mutu terjaga tanpa menghambat laju.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |C-D|, ${nickname} menyusun pembelajaran presisi dengan rubrik ketat dan target hasil yang jelas. Ia menegakkan disiplin berbasis aturan dan menilai secara objektif, sehingga kualitas akademik terjaga.
    `.trim(),
    least: `
Risiko: umpan balik terasa keras, ruang eksplorasi sempit, dan empati ke siswa kurang—motivasi bisa turun. Penyeimbang: bahasa umpan balik konstruktif, contoh kerja “memadai” vs “unggul”, dan porsi aktivitas eksplorasi terarah.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyiapkan kriteria inti, contoh penilaian, dan pacing bertahap. Hindari overcontrol dengan memberi otonomi terbatas pada siswa di dalam koridor standar.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} unggul pada RCA tajam, kontrol perubahan ketat, dan kualitas rilis. Ia mengutamakan spesifikasi, dokumentasi presisi, serta verifikasi berbasis bukti sebelum “done”.
    `.trim(),
    least: `
Risiko: mengabaikan dimensi relasi, sulit mempercayai tim, atau menunda rilis menunggu kesempurnaan. Peredam: matriks risiko CTQ, timebox analisis, dan prinsip “fix-now / harden-next” dengan postmortem tanpa menyalahkan.
    `.trim(),
    change: `
Pada migrasi/rekayasa ulang, ${nickname} memastikan RFC, test plan, rollback, dan metrik kesehatan disepakati. Terapkan canary/blue–green dan review terjadwal untuk menjaga mutu tanpa mengorbankan roadmap.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menegakkan standar kebersihan dengan SOP rinci, checklist lengkap, dan inspeksi disiplin. Deviasi kecil segera dikoreksi agar tidak menjadi pola.
    `.trim(),
    least: `
Risiko: gaya dingin, fokus berlebih pada detail minor, dan motivasi tim turun. Penyeimbang: CTQ per area, sampling audit, serta apresiasi perilaku patuh untuk menjaga moral.
    `.trim(),
    change: `
Saat metode/alat baru diterapkan, ${nickname} menyusun standar kerja terukur, pelatihan singkat, dan evaluasi pasca-implementasi. Mulai dari area prioritas lalu skalakan.
    `.trim()
  }
},

CI: {
  Administrator: {
    most: `
Sebagai |C-I|, ${nickname} menggabungkan akurasi kebijakan dengan kemampuan membangun hubungan ketika diperlukan. Ia menetapkan standar kualitas tinggi, menyajikan data jelas, dan mampu menyosialisasikan aturan secara ramah agar diterima.
    `.trim(),
    least: `
Risiko: perfeksionisme hingga isolasi kerja, resistensi pada kejutan, dan keputusan lambat. Penyeimbang: batas WIP, timebox perencanaan, checkpoint komunikasi rutin, dan definisi “cukup layak rilis” yang disepakati.
    `.trim(),
    change: `
Dalam perubahan, ${nickname} efektif bila ada rencana tanpa kejutan: panduan rinci, FAQ, dan jalur umpan balik. Uji coba kecil dan iterasi berdasarkan data kepatuhan/kualitas menjaga buy-in.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |C-I|, ${nickname} menghadirkan kelas rapi dan adil: rubrik akurat, contoh jelas, dan komunikasi yang menenangkan. Ia peduli relasi namun tetap menjaga mutu hasil belajar.
    `.trim(),
    least: `
Risiko: waktu tersita pada detail non-kritis atau menghindari improvisasi; di sisi lain optimisme relasional dapat membuat estimasi beban kurang tepat. Penyeimbang: indikator inti, jadwal umpan balik konsisten, dan batas waktu tegas.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyediakan template sederhana, contoh penilaian, dan sosialisasi empatik. Iterasi rubrik dilakukan setelah review bukti belajar awal.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam peran teknis, ${nickname} kuat pada QA, dokumentasi, dan koordinasi yang cukup hangat. Ia menjaga akurasi artefak teknis sambil tetap mampu berjejaring lintas fungsi saat dibutuhkan.
    `.trim(),
    least: `
Risiko: analisis berlarut atau “menunggu kepastian” sehingga rilis tertunda; sebaliknya fokus hubungan bisa membuat estimasi optimistis. Peredam: buffer estimasi, gate keputusan, dan review berpasangan.
    `.trim(),
    change: `
Pada perubahan arsitektur, ${nickname} menulis RFC, menyiapkan panduan adopsi, dan mendampingi tim. Terapkan canary, metrik kesehatan, dan post-implementation review.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} teliti namun tetap ramah. Ia memastikan SOP jelas, komunikasi baik dengan pengguna area, dan tindak lanjut temuan tertata.
    `.trim(),
    least: `
Risiko: terjebak detail minor atau bekerja sendiri terlalu lama; kadang over-optimistis terhadap kemampuan tim. Penyeimbang: rute prioritas, target waktu per segmen, dan audit sampling.
    `.trim(),
    change: `
Saat SOP/alat baru, ${nickname} menyiapkan panduan dan pelatihan singkat. Mulai dari area kunci, ukur hasil, lalu perluas.
    `.trim()
  }
},

CS: {
  Administrator: {
    most: `
Sebagai |C-S|, ${nickname} sistematis, patuh prosedur, dan teliti. Ia menyusun SOP jelas, kalender kepatuhan, serta dokumentasi lengkap sehingga layanan konsisten dan dapat diaudit.
    `.trim(),
    least: `
Risiko: analysis paralysis, menghindari konflik, dan penolakan pada perubahan mendadak. Antidot: timebox keputusan, jalur sign-off sederhana, decision-rights matrix, dan komunikasi perubahan yang bertahap.
    `.trim(),
    change: `
Dalam perubahan kebijakan/sistem, ${nickname} efektif jika transisi terstruktur: pilot, checklist go-live, dan metrik pasca-implementasi. Pastikan tidak ada “kejutan” dengan rencana komunikasi berlapis.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |C-S|, ${nickname} menjaga kelas teratur dan akurat: rubrik terperinci, instruksi jelas, dan ritme belajar stabil. Siswa memahami ekspektasi sejak awal.
    `.trim(),
    least: `
Risiko: terlalu berhati-hati hingga ruang eksplorasi menyempit dan keputusan lambat. Penyeimbang: fokus indikator inti, contoh tugas sederhana, dan porsi eksplorasi terarah agar kreativitas tetap hidup.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyiapkan panduan rinci dan jadwal bertahap. Uji kecil–iterasi–sebar untuk menjaga mutu tanpa mengacaukan ritme.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} andal pada SOP, QA, dan dokumentasi presisi. Ia menjaga stabilitas layanan dan meminimalkan deviasi prosedur.
    `.trim(),
    least: `
Risiko: resistensi pada perubahan mendadak, terjebak detail, atau menunda eskalasi. Peredam: matriks risiko CTQ, kriteria “escalate now”, WIP limit, dan eksperimen bertahap dengan metrik kesehatan.
    `.trim(),
    change: `
Pada perubahan arsitektur, ${nickname} menyiapkan RFC, checklist verifikasi, dan rencana rollback. Jalankan canary/blue–green, review terjadwal, dan log keputusan untuk akuntabilitas.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menjaga standar kebersihan melalui SOP rinci, rute stabil, dan inspeksi telaten. Detail diperhatikan tanpa mengorbankan konsistensi tim.
    `.trim(),
    least: `
Risiko: terlalu lama pada detail kecil dan lambat mengubah prioritas saat beban puncak. Penyeimbang: CTQ per area, target waktu per segmen, rotasi beban, dan sampling audit.
    `.trim(),
    change: `
Saat metode/alat baru diterapkan, ${nickname} menyusun standar kerja, pelatihan, dan evaluasi pasca-implementasi. Mulai dari area prioritas, ukur temuan & waktu siklus sebelum ekspansi.
    `.trim()
  }
},
   CDI: {
  Administrator: {
    most: `
Sebagai |C-D-I|, ${nickname} sangat berorientasi tugas dan faktual: menetapkan standar terukur, KPI jelas, serta kontrol mutu ketat. Ia cepat memutuskan berdasarkan data, lalu mengomunikasikan arahan dengan efektif saat diperlukan (I), sehingga kebijakan cepat dipahami dan dijalankan.
    `.trim(),
    least: `
Risiko: terkesan dingin/berjarak, micromanagement pada detail, dan rendahnya kepercayaan ke tim. Dampak: buy-in turun, komunikasi satu arah, dan inisiatif tim mandek. Antidot: tetapkan “good enough” & acceptance criteria, lakukan sesi “voice of stakeholder”, delegasikan keputusan operasional melalui RACI, dan gunakan ringkasan 1 halaman agar tetap fokus.
    `.trim(),
    change: `
Dalam perubahan sistem/struktur, ${nickname} unggul bila governance tegas: RFC, RACI, checklist go-live, window perubahan, serta metrik pasca-implementasi (defect, SLA, compliance). Tambahkan paket komunikasi singkat–padat agar ketegasan kualitas tidak mengurangi penerimaan.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |C-D-I|, ${nickname} menegakkan standar akademik tinggi: rubrik presisi, instruksi jelas, dan disiplin konsisten. Ia mampu mengemas alasan kebijakan/penilaian agar diterima siswa/ortu tanpa mengorbankan akurasi.
    `.trim(),
    least: `
Risiko: umpan balik terasa keras, jarak emosional, dan ruang eksplorasi sempit. Penyeimbang: bahasa umpan balik konstruktif, contoh “memadai vs unggul”, serta slot eksplorasi terarah agar motivasi tetap tinggi.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menurunkan kriteria inti, contoh penilaian, dan timeline bertahap; sisipkan komunikasi singkat ke orang tua/siswa untuk mengamankan buy-in tanpa menurunkan standar.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} memimpin RCA tajam, change control ketat, dan verifikasi berbasis bukti. Ia menjaga spesifikasi–dokumentasi presisi dan memastikan “done” benar-benar memenuhi CTQ.
    `.trim(),
    least: `
Risiko: overcontrol, skeptis terhadap input tim, atau menunda rilis menunggu kesempurnaan. Peredam: matriks risiko, timebox analisis, prinsip “fix-now / harden-next”, dan postmortem tanpa menyalahkan untuk menjaga kecepatan belajar.
    `.trim(),
    change: `
Pada migrasi/rekayasa ulang, ${nickname} mengawal RFC, test plan, rollback, canary/blue–green, dan metrik kesehatan. Tambahkan paket komunikasi status ritmik (I) agar lintas fungsi tetap selaras.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menegakkan SOP rinci, checklist lengkap, dan audit disiplin—deviasi kecil segera dikoreksi. Standar area konsisten, temuan ditutup tuntas.
    `.trim(),
    least: `
Risiko: kesan dingin, fokus pada detail minor, moral tim turun. Penyeimbang: CTQ per area, sampling audit (bukan 100%), serta apresiasi perilaku patuh agar ketegasan berbuah motivasi.
    `.trim(),
    change: `
Saat metode/alat baru, ${nickname} menyusun standar kerja terukur, pelatihan singkat, dan evaluasi pasca-implementasi—mulai dari area prioritas lalu skalakan, dengan papan status sederhana untuk transparansi.
    `.trim()
  }
},

CDS: {
  Administrator: {
    most: `
Sebagai |C-D-S|, ${nickname} detail–logis dengan standar tinggi, sekaligus stabil dan dapat diandalkan. Ia menyusun SOP rapi, indikator mutu jelas, dan mengeksekusi konsisten hingga target tercapai—kualitas “benar sejak awal” menjadi ciri khasnya.
    `.trim(),
    least: `
Risiko: analysis paralysis, terlalu kompetitif pada kualitas minor, dan kurang peka pada beban tim. Antidot: timebox analisis, prioritas CTQ vs nice-to-have, jalur sign-off sederhana, dan cadangan waktu untuk kejutan operasional.
    `.trim(),
    change: `
Dalam perubahan, ${nickname} efektif dengan transisi bertahap: RFC, checklist go-live, window perubahan, serta metrik pasca-implementasi. Stabilitas (S) menjaga ritme, ketegasan (D) mengunci tenggat, dan presisi (C) memastikan kepatuhan.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |C-D-S|, ${nickname} menghadirkan kelas sangat terstruktur, rubrik detail, dan ritme belajar stabil. Ia menjaga mutu tinggi sembari konsisten pada tindak lanjut tugas.
    `.trim(),
    least: `
Risiko: perfeksionisme menyempitkan kreativitas, keputusan lambat, dan fokus pada detail non-kritis. Penyeimbang: indikator inti, contoh sederhana, dan slot eksplorasi terarah agar hasil tetap unggul tanpa memperlambat kelas.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyiapkan paket adaptasi lengkap (contoh tugas, rubrik ringkas, jadwal). Jalankan uji coba kecil dan iterasi berdasarkan data hasil belajar.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam peran teknis, ${nickname} kuat pada QA presisi, dokumentasi, dan eksekusi stabil. Ia menjaga reliabilitas dengan kontrol perubahan ketat dan follow-up konsisten.
    `.trim(),
    least: `
Risiko: menunda rilis karena mengejar kesempurnaan, lambat beradaptasi, atau berat melepas cara lama. Peredam: matriks risiko CTQ, kriteria “escalate now”, canary incremental, dan WIP limit.
    `.trim(),
    change: `
Pada migrasi/arsitektur baru, ${nickname} menyusun test plan, rollback, dan metrik kesehatan yang dipantau. Review terjadwal memastikan mutu tanpa mengorbankan roadmap.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} telaten, fokus detail, dan ritme kerja stabil; SOP jelas, inspeksi terukur, dan temuan ditutup tepat waktu. Kualitas area konsisten dan dapat diaudit.
    `.trim(),
    least: `
Risiko: terlalu lama di detail minor, kaku menukar prioritas saat beban puncak. Penyeimbang: CTQ per area, target waktu per segmen, dan sampling audit untuk menjaga throughput.
    `.trim(),
    change: `
Saat metode/alat baru, ${nickname} menggelar pelatihan bertahap, checklist verifikasi, dan evaluasi mingguan. Mulai dari area kunci, ukur temuan & waktu siklus, lalu ekspansi.
    `.trim()
  }
},

CID: {
  Administrator: {
    most: `
Sebagai |C-I-D|, ${nickname} memadukan akurasi kebijakan, komunikasi yang ramah saat diperlukan, dan dorongan penyelesaian tepat waktu. Ia menyukai situasi yang dapat diprediksi, menyiapkan dokumen jelas, dan menjaga mutu konsisten.
    `.trim(),
    least: `
Risiko: perfeksionisme → isolasi kerja, resistensi pada kejutan, atau switching antara relasi & detail sehingga fokus buyar. Antidot: batas WIP, gate prioritas (impact–effort–risk), timebox perencanaan, dan ritme komunikasi yang konsisten.
    `.trim(),
    change: `
Dalam perubahan, ${nickname} efektif bila rencana tanpa kejutan: RFC, panduan/FAQ, jalur umpan balik, serta uji coba kecil. Komunikasikan alasan perubahan secara empatik (I) sambil mengunci CTQ (D/C).
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |C-I-D|, ${nickname} menghadirkan kelas rapi dan adil: rubrik akurat, komunikasi hangat, dan penyelesaian tugas tepat waktu. Ia menjaga mutu sekaligus hubungan baik dengan siswa.
    `.trim(),
    least: `
Risiko: waktu habis pada detail, enggan improvisasi, atau sebaliknya melompat topik karena banyak ide. Penyeimbang: indikator inti, RPP ringkas, jadwal umpan balik tetap, dan blok fokus tanpa distraksi.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyediakan template sederhana, contoh penilaian, dan sosialisasi empatik. Iterasi rubrik berdasarkan bukti belajar awal menjaga ketepatan sekaligus penerimaan.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} unggul di QA/dokumentasi presisi dan koordinasi secukupnya lintas fungsi. Ia mendorong hasil yang benar sejak awal dan nyaman pada lingkungan yang dapat diprediksi.
    `.trim(),
    least: `
Risiko: analisis berlarut, menunda keputusan menunggu kepastian, atau mengisolasi diri untuk “menyempurnakan”. Peredam: buffer estimasi, kriteria “escalate now”, kanban transparan, dan review berpasangan agar progres terjaga.
    `.trim(),
    change: `
Pada perubahan arsitektur, ${nickname} menulis RFC, menyiapkan panduan adopsi, dan memantau metrik kesehatan. Terapkan canary/blue–green serta post-implementation review untuk pembelajaran berkelanjutan.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} ramah seperlunya namun detail: SOP jelas, checklist lengkap, dan kualitas area konsisten. Ia memastikan tugas selesai “benar” dan dapat diaudit.
    `.trim(),
    least: `
Risiko: tenggelam pada detail, lambat berubah saat ritme bergeser, atau bekerja sendiri terlalu lama. Penyeimbang: rute prioritas, target waktu per segmen, audit sampling, dan komunikasi status singkat berkala.
    `.trim(),
    change: `
Saat SOP/alat baru, ${nickname} menyiapkan panduan rinci, pelatihan, dan evaluasi berkala. Mulai dari area prioritas, ukur temuan & waktu siklus, lalu perluas bertahap.
    `.trim()
  }
},
    CIS: {
  Administrator: {
    most: `
Sebagai |C-I-S|, ${nickname} menggabungkan ketepatan (C), komunikasi hangat (I), dan stabilitas proses (S). Ia pencari fakta yang kuat, menyiapkan SOP jelas, dan memastikan semua pihak memahami ekspektasi sebelum mulai. Keputusan diambil setelah data memadai, layanan terasa ramah namun tertib.
    `.trim(),
    least: `
Di bawah tekanan, ${nickname} bisa terlalu peduli pada opini, menunda keputusan hingga data “lengkap”, dan menghindari konfrontasi. Risiko: tempo melambat & pesan tidak tegas. Antidot: decision-rights/RACI tegas, tenggat keputusan, ringkasan 1 halaman berbasis fakta, serta skrip percakapan tegas–empatik.
    `.trim(),
    change: `
Dalam perubahan kebijakan/sistem, ${nickname} efektif sebagai fasilitator: menjelaskan alasan, menyusun panduan rinci/FAQ, dan menjaga ritme adopsi stabil. Gunakan pilot kecil, checklist verifikasi, metrik compliance, serta forum Q&A berkala.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |C-I-S|, ${nickname} menghadirkan kelas hangat, terstruktur, dan adil. Ia menilai berbasis rubrik, komunikatif, serta menjaga stabilitas ritme belajar—membuat siswa paham standar dan merasa dihargai.
    `.trim(),
    least: `
Risiko: terlalu cemas dengan penerimaan sosial, detail administrasi menumpuk, atau keputusan lambat. Penyeimbang: indikator inti pada rubrik, kontrak belajar, batas waktu konsisten, dan bahasa umpan balik spesifik–konstruktif.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyajikan contoh tugas, rubrik baru yang ringkas, dan tahapan adaptasi realistis. Pantau indikator utama agar laju terjaga tanpa mengorbankan rasa aman siswa.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} kuat pada QA/dokumentasi, dukungan pengguna, dan komunikasi yang bersahabat. Ia mengambil keputusan setelah bukti cukup, menjaga SOP dan layanan stabil.
    `.trim(),
    least: `
Risiko: menunda eskalasi demi harmoni, perfeksionisme dokumentasi, atau over-communication yang mengaburkan prioritas. Peredam: kriteria “escalate now”, kanban prioritas CTQ, WIP limit, dan checkpoint QA terjadwal.
    `.trim(),
    change: `
Pada perubahan, ${nickname} menulis panduan praktis, melatih pengguna, dan memantau adopsi. Terapkan change window, checklist verifikasi, serta sampling audit agar kualitas konsisten.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menjaga SOP konsisten, komunikasi ramah, dan rute kerja stabil. Ia menegaskan ekspektasi di awal dan memastikan temuan ditutup rapi.
    `.trim(),
    least: `
Risiko: sulit menegur, fokus pada opini, atau melambat menunggu data lengkap. Penyeimbang: CTQ per area, target waktu per segmen, inspeksi ringan–sering, dan umpan balik tegas–santun.
    `.trim(),
    change: `
Saat SOP/layout baru, ${nickname} melakukan briefing komunikatif, demo lapangan, dan buddy system. Mulai dari area prioritas, ukur compliance & temuan utama, lalu skalakan.
    `.trim()
  }
},

CSD: {
  Administrator: {
    most: `
Sebagai |C-S-D|, ${nickname} sistematis, teliti, dan stabil; ketika target menuntut, ia menutup pekerjaan tepat waktu (D). Ia menyusun SOP rapi, indikator mutu jelas, dan eksekusi konsisten—kualitas “benar sejak awal”.
    `.trim(),
    least: `
Risiko: analysis paralysis, alergi perubahan mendadak, dan tenggelam pada detail minor. Antidot: timebox analisis, prioritas CTQ vs nice-to-have, jalur sign-off sederhana, dan ambang eskalasi untuk blocker.
    `.trim(),
    change: `
Dalam perubahan sistem, ${nickname} efektif jika ada governance tegas: RACI, RFC, checklist go-live, window perubahan, metrik pasca-implementasi. Stabilitas (S) menjaga ritme; ketegasan (D) mengunci tenggat; ketelitian (C) memastikan kepatuhan.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |C-S-D|, ${nickname} menghadirkan kelas sangat terstruktur, rubrik presisi, dan ritme belajar stabil. Ia konsisten menutup tindak lanjut tugas hingga tuntas.
    `.trim(),
    least: `
Risiko: ruang eksplorasi sempit, keputusan lambat, fokus pada detail non-kritis. Penyeimbang: indikator inti, contoh sederhana, dan slot eksplorasi terarah agar kreativitas tetap hidup.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyiapkan paket adaptasi lengkap (contoh tugas, rubrik ringkas, jadwal). Uji coba kecil–iterasi–sebar untuk menjaga mutu tanpa mengacaukan ritme.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam peran teknis, ${nickname} unggul pada QA presisi, dokumentasi, dan kontrol perubahan. Ia menjaga reliabilitas melalui eksekusi stabil dan follow-up konsisten.
    `.trim(),
    least: `
Risiko: lambat beradaptasi, menunda rilis demi kesempurnaan, atau kaku pada prosedur lama. Peredam: matriks risiko CTQ, kriteria “escalate now”, canary incremental, WIP limit, dan review terjadwal.
    `.trim(),
    change: `
Pada migrasi/arsitektur baru, ${nickname} menyusun test plan, rollback, dan metrik kesehatan yang dipantau. Jalankan canary/blue–green dan log keputusan untuk akuntabilitas.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} telaten, fokus detail, dan ritme kerja stabil; SOP jelas, inspeksi terukur, dan temuan ditutup tepat waktu. Kualitas area konsisten dan dapat diaudit.
    `.trim(),
    least: `
Risiko: terlalu lama di detail minor dan sulit menukar prioritas saat beban puncak. Penyeimbang: CTQ per area, target waktu per segmen, rotasi beban, dan sampling audit.
    `.trim(),
    change: `
Saat metode/alat baru, ${nickname} menggelar pelatihan bertahap, checklist verifikasi, dan evaluasi mingguan. Mulai dari area kunci, ukur temuan & waktu siklus, lalu ekspansi.
    `.trim()
  }
},

CSI: {
  Administrator: {
    most: `
Sebagai |C-S-I|, ${nickname} mengutamakan ketepatan standar (C), stabilitas proses (S), dan komunikasi yang hangat (I). Ia pencari fakta yang baik, memastikan ekspektasi jelas, dan menjaga layanan ramah–tertib.
    `.trim(),
    least: `
Risiko: keras pada keputusan yang sudah diambil, menahan konfrontasi, dan cemas pada opini publik internal. Antidot: decision-rights matrix, tenggat keputusan, CTQ yang disepakati, serta forum dengar pendapat terstruktur.
    `.trim(),
    change: `
Dalam perubahan, ${nickname} efektif sebagai fasilitator adopsi: menjelaskan alasan, menyiapkan panduan rinci, dan menjaga ritme. Gunakan pilot, checklist verifikasi, metrik compliance, dan komunikasi ritmik.
    `.trim()
  },
  Guru: {
    most: `
Sebagai guru |C-S-I|, ${nickname} menghadirkan kelas hangat, terstruktur, dan adil. Ia peka pada kebutuhan siswa, menggunakan rubrik jelas, dan memastikan ekspektasi dipahami sebelum proyek dimulai.
    `.trim(),
    least: `
Risiko: keputusan lambat, terlalu memikirkan penerimaan sosial, atau fokus pada detail administrasi. Penyeimbang: indikator inti, kontrak belajar, bahasa umpan balik spesifik–konstruktif, dan batas waktu konsisten.
    `.trim(),
    change: `
Saat kurikulum/asesmen berubah, ${nickname} menyusun contoh tugas, rubrik baru, dan jadwal pelatihan singkat. Adaptasi bertahap dengan pemantauan indikator utama menjaga tempo tanpa mengorbankan rasa aman.
    `.trim()
  },
  "Technical Staff": {
    most: `
Dalam tim teknis, ${nickname} andal pada QA/dokumentasi, layanan pengguna, dan komunikasi yang bersahabat. Ia menjaga SOP konsisten dan mengambil keputusan setelah bukti cukup.
    `.trim(),
    least: `
Risiko: menunda eskalasi demi harmoni, teguh pada keputusan lama walau konteks berubah, atau over-communicate hingga fokus kabur. Peredam: kriteria “escalate now”, kanban prioritas CTQ, WIP limit, dan checkpoint QA terjadwal.
    `.trim(),
    change: `
Pada perubahan, ${nickname} menulis panduan rinci, mengadakan pelatihan komunikatif, dan menjaga ritme transisi. Terapkan change window, checklist verifikasi, serta sampling audit agar kualitas konsisten.
    `.trim()
  },
  Housekeeping: {
    most: `
${nickname} menjaga SOP konsisten, komunikasi ramah, dan rute kerja stabil. Ia memastikan tiap anggota paham standar & ekspektasi sebelum eksekusi; mutu area terjaga.
    `.trim(),
    least: `
Risiko: enggan menegur pelanggaran kecil, sulit mengubah keputusan yang sudah diambil, dan fokus pada opini. Penyeimbang: CTQ per area, inspeksi ringan–sering, target waktu per rute, dan umpan balik tegas–santun.
    `.trim(),
    change: `
Saat SOP/layout baru, ${nickname} melakukan briefing komunikatif, demo lapangan, dan buddy system. Ukur compliance & temuan utama sebelum perluas ke seluruh area.
    `.trim()
  }
},
    C: {
      Administrator: {
        most: `
Sebagai tipe Compliance, ${nickname} sangat teliti dan sistematis dalam pengelolaan data maupun dokumen administrasi. Setiap detail dipastikan benar sebelum proses dilanjutkan. Standar kualitas tinggi dan akurasi menjadi ciri utama kerja ${nickname}, sehingga setiap output administrasi sangat bisa diandalkan, minim kesalahan, dan rapi.
        `.trim(),
        least: `
Kecenderungan untuk terlalu banyak pengecekan atau menunda pengambilan keputusan karena ingin semuanya sempurna, kadang membuat proses kerja menjadi lambat. Untuk meningkatkan efisiensi, ${nickname} perlu menyeimbangkan antara kebutuhan akurasi dan kecepatan, serta belajar mendelegasikan tugas jika perlu.
        `.trim(),
        change: `
Di bawah tekanan, ${nickname} tetap menjaga kualitas hasil kerja, namun kadang menjadi terlalu kaku terhadap standar atau enggan mengambil risiko. Perlu lebih fleksibel dan terbuka pada masukan untuk menciptakan sistem administrasi yang adaptif.
        `.trim()
      },
      Guru: {
        most: `
Sebagai guru tipe Compliance, ${nickname} sangat teliti, terorganisir, dan mampu menyusun rencana pembelajaran serta evaluasi dengan sistematis. Semua administrasi kelas tersusun rapi dan setiap progres siswa terpantau jelas. ${nickname} sangat memperhatikan detail, sehingga kualitas pembelajaran dan penilaian selalu terjaga tinggi.
        `.trim(),
        least: `
Terkadang, ${nickname} bisa terlalu kaku atau perfeksionis, membuat suasana kelas menjadi kurang dinamis dan siswa kurang bebas mengekspresikan kreativitas. Untuk menciptakan lingkungan belajar yang lebih hidup, ${nickname} perlu melonggarkan standar sesekali dan memberi ruang untuk eksperimen.
        `.trim(),
        change: `
Ketika beban kerja meningkat, ${nickname} tetap menjaga kualitas pembelajaran, namun penting untuk lebih fleksibel dan menyesuaikan pendekatan sesuai kebutuhan masing-masing siswa agar perkembangan akademik lebih merata.
        `.trim()
      },
      "Technical Staff": {
        most: `
Sebagai tenaga teknis Compliance, ${nickname} sangat analitis dan detail dalam menyelesaikan setiap masalah teknis. Tidak ada hal kecil yang terlewat dari pengamatan dan penanganan ${nickname}, sehingga hasil kerja teknis selalu aman, rapi, dan berkualitas tinggi.
        `.trim(),
        least: `
Kecenderungan perfeksionis terkadang membuat troubleshooting berjalan lebih lama dan solusi teknis menjadi kurang praktis. Untuk mengimbangi, ${nickname} perlu belajar mengatur prioritas, membedakan antara detail penting dan minor, serta meningkatkan efisiensi dalam penyelesaian masalah.
        `.trim(),
        change: `
Dalam kondisi tertekan atau terjadi kendala mendadak, ${nickname} tetap menjaga kualitas dan keamanan kerja. Namun, peningkatan efisiensi serta kemampuan mengatur waktu sangat penting agar proses kerja teknis tetap berjalan optimal di segala situasi.
        `.trim()
      },
      Housekeeping: {
        most: `
Sebagai tipe Compliance di Housekeeping, ${nickname} sangat teliti, rapi, dan disiplin dalam memastikan seluruh area bersih sesuai standar tertinggi. Setiap prosedur dijalankan dengan hati-hati, tidak mudah melewatkan detail sekecil apapun, dan selalu melakukan pengecekan ulang sebelum meninggalkan area kerja. Sikap profesional dan penuh tanggung jawab menjadikan ${nickname} pilar utama dalam menjaga reputasi layanan Housekeeping.
        `.trim(),
        least: `
Kecenderungan terlalu fokus pada detail kecil kadang membuat efisiensi kerja tim menjadi menurun, karena terlalu banyak waktu terbuang pada pengecekan minor. Untuk itu, ${nickname} perlu belajar memperhatikan keseimbangan antara kualitas dan efisiensi, serta mempercayakan tugas-tugas ringan pada anggota tim lain agar target tercapai lebih efektif.
        `.trim(),
        change: `
Ketika tekanan kerja meningkat atau harus mengerjakan banyak area sekaligus, ${nickname} tetap menjaga standar kebersihan dan teliti pada detail. Namun, harus diingat agar tidak terlalu terpaku pada standar pribadi sehingga menghambat kecepatan kerja tim secara keseluruhan.
        `.trim()
      }
    },
            CS: {
  Administrator: {
    most: `
Tidak basa-basi dan tegas, |D-I| ${nickname} adalah individualis yang kuat dengan visi jauh ke depan, progresif, dan siap berkompetisi untuk mencapai sasaran. ${nickname} selalu ingin tahu dengan cakupan minat yang luas. Dalam memecahkan masalah, ia logis, kritis, tajam, dan kerap imajinatif. ${nickname} memiliki kemampuan kepemimpinan yang baik; pada konteks administrasi, patokan D mendorong kecepatan keputusan, dorongan kontrol, dan eksekusi, sementara unsur I memperluas pengaruh dan jaringan untuk menggerakkan tim.
    `.trim(),
    least: `
Pada grafik Least, fokus tugas dan standar tinggi ${nickname} dapat membuatnya tampak keras kepala atau dingin; orientasi target cenderung melebihi orientasi pada relasi. ${nickname} mencanangkan standar tinggi untuk diri dan orang di sekitarnya, dan menjadi sangat kritis ketika standar tidak tercapai. Risiko: perfeksionisme, toleransi rendah pada ambiguitas, serta kecenderungan mengambil alih otoritas. Antidot: kalibrasi ekspektasi, aktifkan sisi I untuk komunikasi empatik dan membangun buy-in.
    `.trim(),
    change: `
Dalam menghadapi deadline atau perubahan sistem, patokan D membuat ${nickname} menjaga arah, mengambil keputusan cepat, menuntut otoritas yang jelas, dan menyukai tugas-tugas baru. Tantangan: mengelola impatience tanpa menurunkan akurasi. Strategi: gunakan pengaruh I untuk mobilisasi lintas fungsi, klarifikasi peran/otoritas, dan tetapkan cek-poin kualitas agar standar tetap tercapai meski bergerak cepat.
    `.trim()
  },
      Guru: {
    most: `
Tidak basa-basi dan tegas, |D-I| ${nickname} memimpin kelas dengan arah yang jelas dan ritme cepat. Ia berpandangan jauh ke depan dalam merancang pembelajaran, berani menetapkan target capaian, dan menuntut standar disiplin yang tinggi. Saat mengajar, patokan D mendorong keputusan cepat dan eksekusi, sementara unsur I membuat ${nickname} komunikatif, mampu memobilisasi antusiasme siswa, dan menyampaikan materi secara persuasif.
    `.trim(),
    least: `
Pada grafik Least, orientasi tugas dan standar tinggi ${nickname} bisa membuatnya tampak kaku, terlalu menekan, atau kurang peka terhadap dinamika emosi siswa. Risiko: ceramah satu arah, toleransi rendah pada keterlambatan/ketidakteraturan, serta kritik yang terasa tajam. Antidot: aktifkan sisi I—variasikan metode, gunakan penguatan positif, dan lakukan check-in singkat agar engagement terjaga tanpa menurunkan standar.
    `.trim(),
    change: `
Saat tekanan (ujian/proyek/insiden kelas), patokan D membuat ${nickname} menjaga arah, mengambil keputusan cepat, dan menegaskan batas. Tantangannya: mengelola impatience sambil menjaga akurasi asesmen. Strategi: rencana kontinjensi, aturan main yang diperjelas di awal, timebox aktivitas, serta ritual umpan balik singkat agar kelas tetap terkendali sekaligus termotivasi.
    `.trim()
  },

  "Technical Staff": {
    most: `
Tidak basa-basi dan tegas, |D-I| ${nickname} unggul dalam troubleshooting cepat, pemetaan prioritas tiket, dan pendorong pencapaian SLA. Patokan D menonjol pada keputusan teknis yang cepat dan eksekusi berani; unsur I membantu ${nickname} berkoordinasi lintas tim, menggalang dukungan, dan mengkomunikasikan update dengan jelas. Hasilnya: perbaikan lebih cepat, antrian tertata, dan inisiatif peningkatan sistem berjalan.
    `.trim(),
    least: `
Pada grafik Least, fokus target dan standar tinggi dapat mendorong ${nickname} cenderung mem-bypass prosedur, menekan timeline secara agresif, atau tampak kurang sabar terhadap ambiguitas/ketidakpastian akar masalah. Risiko: regresi kualitas, gesekan dengan QA/ops. Antidot: aktifkan sisi I untuk kolaborasi—sinkronisasi singkat sebelum eksekusi, transparansi perubahan, dan pencarian buy-in dari stakeholder kunci.
    `.trim(),
    change: `
Di bawah tekanan incident/outage, patokan D membuat ${nickname} mengambil alih komando, menentukan prioritas, dan mengeksekusi mitigasi cepat. Tantangan: menjaga disiplin prosedur dan dokumentasi. Strategi: war-room terstruktur, patuhi runbook, update status berkala, checklist pasca-aksi, serta postmortem singkat agar pemulihan cepat tanpa mengorbankan pembelajaran.
    `.trim()
  },

  Housekeeping: {
    most: `
Tidak basa-basi dan tegas, |D-I| ${nickname} menetapkan standar kebersihan tinggi, mempercepat turnaround kamar/area, dan memastikan inspeksi berjalan disiplin. Patokan D menonjol pada ketegasan SOP dan target harian; unsur I membuat ${nickname} mampu memotivasi tim, membangun semangat, serta tetap ramah saat berinteraksi dengan penghuni/tamu internal.
    `.trim(),
    least: `
Pada grafik Least, orientasi target bisa membuat ${nickname} tampak terlalu menekan, detail berlebihan, atau dingin dalam komunikasi saat beban puncak. Risiko: kelelahan tim, kualitas menurun karena terburu-buru. Antidot: aktifkan sisi I—briefing apresiatif, pembagian beban yang proporsional, dan umpan balik singkat yang mendorong perbaikan tanpa menjatuhkan moral.
    `.trim(),
    change: `
Saat okupansi tinggi/audit/keluhan mendesak, patokan D mendorong ${nickname} cepat mengalokasikan ulang personel, memrioritaskan area lalu lintas tinggi, dan menegaskan standar inspeksi. Strategi: zoning tugas, checklist cepat, eskalasi jalur jelas, serta koordinasi dengan Front Office/Engineering agar waktu respons singkat tetap sejalan dengan kualitas.
    `.trim()
  }
    }
  };

  // Multi-level safe access with fallback
  const getImplicationText = (key) => {
    return implications[key]?.[pos]?.[graphType] || null;
  };

  // Try primary combination
  let txt = getImplicationText(key);
  
  // Fallback to first letter if combination not found
  if (!txt && key.length > 0) {
    const primaryType = key[0];
    txt = getImplicationText(primaryType);
  }

  if (txt) return txt.replace(/\$\{nickname\}/g, nickname);
  return "Deskripsi implikasi khusus untuk posisi ini belum tersedia.";
}


// ====== 2. CONTOH PEMANGGILAN (PASTIKAN HANYA 1 HURUF, BUKAN GABUNGAN) ======
const dominantType = most.dominan[0]; // <-- ambil HANYA huruf pertama
const implication = getImplication(dominantType, 'most', 'Housekeeping');
// dst.

function getCompatibilityReason(symbol, dominantType, position) {
  const pos = position;
  const reasons = {
    Administrator: {
      SS: `Profil ${dominantType} sangat kuat untuk Administrator — teliti, rapi, konsisten, dan nyaman dengan SOP.`,
      C:  `Profil ${dominantType} cukup cocok untuk Administrator, hanya perlu peningkatan efisiensi dan koordinasi.`,
      CC: `Ada kecocokan dasar, namun beberapa aspek penting administrasi belum sepenuhnya kuat pada profil ${dominantType}.`,
      K:  `Beberapa tuntutan administrasi kurang selaras dengan karakter ${dominantType}. Perlu pendampingan.`,
      default: `Profil memiliki gap besar dengan kebutuhan pekerjaan Administrasi.`
    },

    "Dosen/Guru": {
      SS: `Profil ${dominantType} sangat selaras dengan kebutuhan Guru — stabil, komunikatif, dan konsisten.`,
      C:  `Cocok untuk mengajar, meski butuh penguatan adaptasi kelas atau manajemen dinamika siswa.`,
      CC: `Masih cukup cocok, namun beberapa aspek pedagogis tidak muncul kuat dari karakter ${dominantType}.`,
      K:  `Sebagian besar tuntutan mengajar tidak selaras dengan profil ${dominantType}.`,
      default: `Gap signifikan antara profil kepribadian dan tuntutan profesi Guru.`
    },

    "Technical Staff": {
      SS: `Profil ${dominantType} sangat sesuai untuk Technical Staff — stabil, teliti, dan tekun menyelesaikan masalah teknis.`,
      C:  `Cocok untuk peran teknis, meski perlu peningkatan kecepatan respon atau adaptasi alat baru.`,
      CC: `Cukup cocok, namun beberapa aspek troubleshooting tidak dominan.`,
      K:  `Beberapa tuntutan teknis kurang selaras dengan karakter ${dominantType}.`,
      default: `Profil memiliki gap besar dengan kebutuhan Technical Staff.`
    },

    "IT Staff": {
      SS: `Profil ${dominantType} sangat sesuai untuk IT Staff — analitis, stabil, dan sistematis.`,
      C:  `Cocok untuk IT, hanya perlu peningkatan pada respons cepat atau kolaborasi lintas unit.`,
      CC: `Masih cukup cocok, namun ketelitian atau troubleshooting belum optimal.`,
      K:  `Sejumlah kemampuan inti IT kurang tercermin pada profil ${dominantType}.`,
      default: `Profil memiliki gap besar dengan kebutuhan teknis IT.`
    },

    Housekeeping: {
      SS: `Profil ${dominantType} sangat cocok — stabil, rapi, teliti, dan konsisten menjaga standar kebersihan.`,
      C:  `Cocok, namun perlu sedikit peningkatan efisiensi atau tempo kerja.`,
      CC: `Cukup cocok, namun aspek ketelitian atau konsistensi belum kuat.`,
      K:  `Beberapa tuntutan pekerjaan Housekeeping kurang selaras dengan karakter ${dominantType}.`,
      default: `Profil memiliki gap besar untuk pekerjaan Housekeeping.`
    }
  };

  return reasons[pos]?.[symbol] || reasons[pos]?.default || `Deskripsi belum tersedia untuk posisi ${position}.`;
}



function getStrengthArea(dominantType, position) {
  const pos = position;
  const strengths = {
    D: {
      Administrator: "mengambil keputusan cepat dan mendorong perbaikan sistem administrasi",
      Guru: "mengelola kelas dengan tegas dan memberi arahan jelas",
      "Technical Staff": "menangani masalah teknis dengan cepat dan langsung pada inti masalah",
      "IT Staff": "berani mengambil keputusan saat troubleshooting kritikal dan memimpin perbaikan sistem",
      Housekeeping: "mengatur tim dan memastikan standar kebersihan terpenuhi dengan tegas"
    },
    I: {
      Administrator: "membangun hubungan kerja positif dan mempermudah komunikasi antar divisi",
      Guru: "meningkatkan motivasi belajar siswa dan membangun interaksi positif",
      "Technical Staff": "memudahkan koordinasi lapangan dan kerja sama teknis",
      "IT Staff": "mempermudah komunikasi user–IT, menjelaskan masalah teknis dengan bahasa sederhana",
      Housekeeping: "menjaga kekompakan dan semangat tim"
    },
    S: {
      Administrator: "menjaga kestabilan, konsistensi, dan alur administrasi yang rapi",
      Guru: "menyediakan pendampingan stabil yang dibutuhkan siswa",
      "Technical Staff": "bekerja konsisten, sabar, dan teliti mengikuti SOP teknis",
      "IT Staff": "mengelola support harian dengan sabar, stabil, dan disiplin dalam dokumentasi",
      Housekeeping: "menjaga standar kebersihan harian secara konsisten"
    },
    C: {
      Administrator: "mengelola dokumen dan data dengan presisi tinggi",
      Guru: "menyusun materi dan evaluasi secara sistematis",
      "Technical Staff": "melakukan pengecekan teknis detail dan meminimalkan kesalahan",
      "IT Staff": "analisis error detail, debugging presisi, dokumentasi sistem rapi, minim kesalahan",
      Housekeeping: "menjalankan pekerjaan dengan teliti dan memperhatikan detail kecil"
    }
  };

  return strengths[dominantType]?.[pos] || "kekuatan spesifik sesuai posisi";
}



function getDevelopmentArea(dominantType) {
  const areas = {
    D: "pelatihan manajemen konflik",
    I: "pengembangan fokus dan disiplin",
    S: "pelatihan adaptasi perubahan",
    C: "pengelolaan ekspektasi realistis"
  };
  return areas[dominantType] || "pengembangan kompetensi";
}

function formatBulletPoints(lines) {
  const formatted = [];
  let isNewSection = true;

  lines.forEach(line => {
    if (line.match(/^(ANALISIS|TINGKAT|POTENSI)/)) {
      formatted.push("");
      formatted.push("• " + line);
      isNewSection = true;
    } else if (line.startsWith("-") || isNewSection) {
      formatted.push("• " + line);
      isNewSection = false;
    } else {
      formatted[formatted.length - 1] += " " + line.trim();
    }
  });

  return formatted;
}}}


// ========== PAPI ==========
if (appState.completed.PAPI) {
  ySection += 8;
  if (ySection > 265) { doc.addPage(); ySection = 20; }
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('JAWABAN TES PAPI', 105, ySection, { align: 'center' });
  ySection += 7;
  doc.setFontSize(7.2);
  doc.setFont(undefined, 'normal');

  // Jawaban PAPI 18 kolom × 5 baris, margin seimbang
  const kolom = 18, baris = 5;
  const xStart = 17;   // <--- Lebih ke kiri
  const kolGap = 10;
  for (let i = 0; i < baris; i++) {
    let x = xStart;
    for (let j = 0; j < kolom; j++) {
      const idx = i + j * baris;
      if (idx < appState.answers.PAPI.length) {
        const ans = appState.answers.PAPI[idx];
        const txt = `${String(idx + 1).padStart(2, '0')}.${ans.answer || '-'}`;
        doc.text(txt, x, ySection);
        x += kolGap;
      }
    }
    ySection += 3.1;
    if (ySection > 275) { doc.addPage(); ySection = 22; }
  }
  ySection += 3;
  if (ySection > 265) { doc.addPage(); ySection = 20; }


  // SKOR PAPI - Semua Aspek
  doc.setFont(undefined, 'bold');
doc.text('Skor PAPI:', 25, ySection);
ySection += 2.2;
doc.setFont(undefined, 'normal');

// Gabungkan label + skor setiap kelompok
function gabungSkorKelompok() {
  const bagian = [
    ['Arah Kerja',      appState.skorPAPIArahKerja],
    ['Kepemimpinan',    appState.skorPAPIKepemimpinan],
    ['Aktivitas',       appState.skorPAPIAktivitas],
    ['Pergaulan',       appState.skorPAPIPergaulan],
    ['Gaya Kerja',      appState.skorPAPIGayaKerja],
    ['Sifat',           appState.skorPAPISifat],
    ['Ketaatan',        appState.skorPAPIKetaatan]
  ];
  return bagian.map(([judul, obj]) => {
    if (!obj) return '';
    const skor = Object.entries(obj).map(([k, v]) => `${k}=${v}`).join(' | ');
    return `${judul}: ${skor}`;
  });
}

// Split menjadi beberapa baris agar tidak terpotong di PDF
const skorKelompokArr = gabungSkorKelompok(); // array per kelompok
const MAX_KOLOM_PER_BARIS = 3; // <= Berapa kelompok per baris? 3 = paling aman (landscape, 2 baris), 4 jika ingin agak padat

for (let i = 0; i < skorKelompokArr.length; i += MAX_KOLOM_PER_BARIS) {
  const slice = skorKelompokArr.slice(i, i + MAX_KOLOM_PER_BARIS).join('   |   ');
  doc.text(slice, 25, ySection);
  ySection += 2.3;
  if (ySection > 265) { doc.addPage(); ySection = 20; }
}
  // ==== RANGKUMAN SKOR & INTERPRETASI (DINAMIS) ====
  ySection += 4;
  if (ySection > 265) { doc.addPage(); ySection = 20; }
  doc.setFont(undefined, 'bold');
  doc.text('Rangkuman Skor dan Deskripsi:', 25, ySection);
  ySection += 3;
  doc.setFont(undefined, 'normal');

  // KAMUS INTERPRETASI
  const kamusPAPI = {
    A: [ { range: [0, 4], desc: "Tidak kompetitif, mapan, puas. Tidak terdorong untuk menghasilkan prestasi, tdk berusaha utk mencapai sukses, membutuhkan dorongan dari luar diri, tidak berinisiatif, tidak memanfaatkan kemampuan diri secara optimal, ragu akan tujuan diri, misalnya sbg akibat promosi / perubahan struktur jabatan." }, { range: [5, 7], desc: "Tahu akan tujuan yang ingin dicapainya dan dapat merumuskannya, realistis akan kemampuan diri, dan berusaha untuk mencapai target." }, { range: [8, 9], desc: "Sangat berambisi utk berprestasi dan menjadi yg terbaik, menyukai tantangan, cenderung mengejar kesempurnaan, menetapkan target yg tinggi, 'self-starter', merumuskan kerja dg baik. Tdk realistis akan kemampuannya, sulit dipuaskan, mudah kecewa, harapan yg tinggi mungkin mengganggu org lain." } ],
    N: [ { range: [0, 2], desc: "Tidak terlalu merasa perlu untuk menuntaskan sendiri tugas-tugasnya, senang menangani beberapa pekerjaan sekaligus, mudah mendelegasikan tugas. Komitmen rendah, cenderung meninggalkan tugas sebelum tuntas, konsentrasi mudah buyar, mungkin suka berpindah pekerjaan." }, { range: [3, 5], desc: "Cukup memiliki komitmen untuk menuntaskan tugas, akan tetapi jika memungkinkan akan mendelegasikan sebagian dari pekerjaannya kepada orang lain." }, { range: [6, 7], desc: "Komitmen tinggi, lebih suka menangani pekerjaan satu demi satu, akan tetapi masih dapat mengubah prioritas jika terpaksa." }, { range: [8, 9], desc: "Memiliki komitmen yg sangat tinggi thd tugas, sangat ingin menyelesaikan tugas, tekun dan tuntas dlm menangani pekerjaan satu demi satu hingga tuntas. Perhatian terpaku pada satu tugas, sulit utk menangani beberapa pekerjaan sekaligus, sulit diinterupsi, tidak melihat masalah sampingan." } ],
    G: [ { range: [0, 2], desc: "Santai, kerja adalah sesuatu yang menyenangkan-bukan beban yg membutuhkan usaha besar. Mungkin termotivasi utk mencari cara atau sistem yg dpt mempermudah dirinya dlm menyelesaikan pekerjaan, akan berusaha menghindari kerja keras, sehingga dapat memberi kesan malas." }, { range: [3, 4], desc: "Bekerja keras sesuai tuntutan, menyalurkan usahanya untuk hal-hal yang bermanfaat / menguntungkan." }, { range: [5, 7], desc: "Bekerja keras, tetapi jelas tujuan yg ingin dicapainya." }, { range: [8, 9], desc: "Ingin tampil sbg pekerja keras, sangat suka bila orang lain memandangnya sbg pekerja keras. Cenderung menciptakan pekerjaan yang tidak perlu agar terlihat tetap sibuk, kadang kala tanpa tujuan yang jelas." } ],
    C: [ { range: [0, 2], desc: "Lebih mementingkan fleksibilitas daripada struktur, pendekatan kerja lebih ditentukan oleh situasi daripada oleh perencanaan sebelumnya, mudah beradaptasi. Tidak mempedulikan keteraturan atau kerapihan, ceroboh." }, { range: [3, 4], desc: "Fleksibel tapi masih cukup memperhatikan keteraturan atau sistematika kerja." }, { range: [5, 6], desc: "Memperhatikan keteraturan dan sistematika kerja, tapi cukup fleksibel." }, { range: [7, 9], desc: "Sistematis, bermetoda, berstruktur, rapi dan teratur, dapat menata tugas dengan baik. Cenderung kaku, tidak fleksibel." } ],
    D: [ { range: [0, 1], desc: "Melihat pekerjaan scr makro, membedakan hal penting dari yg kurang penting, mendelegasikan detil pd org lain, generalis. Menghindari detail, konsekuensinya mungkin bertindak tanpa data yg cukup/akurat, bertindak ceroboh pd hal yg butuh kecermatan. Dpt mengabaikan proses yg vital dlm evaluasi data." }, { range: [2, 3], desc: "Cukup peduli akan akurasi dan kelengkapan data." }, { range: [4, 6], desc: "Tertarik untuk menangani sendiri detail." }, { range: [7, 9], desc: "Sangat menyukai detail, sangat peduli akan akurasi dan kelengkapan data. Cenderung terlalu terlibat dengan detail sehingga melupakan tujuan utama." } ],
    R: [ { range: [0, 3], desc: "Tipe pelaksana, praktis - pragmatis, mengandalkan pengalaman masa lalu dan intuisi. Bekerja tanpa perencanaan, mengandalkan perasaan." }, { range: [4, 5], desc: "Pertimbangan mencakup aspek teoritis (konsep atau pemikiran baru) dan aspek praktis (pengalaman) secara berimbang." }, { range: [6, 7], desc: "Suka memikirkan suatu problem secara mendalam, merujuk pada teori dan konsep." }, { range: [8, 9], desc: "Tipe pemikir, sangat berminat pada gagasan, konsep, teori, mencari alternatif baru, menyukai perencanaan. Mungkin sulit dimengerti oleh orang lain, terlalu teoritis dan tidak praktis, mengawang-awang dan berbelit-belit." } ],
    T: [ { range: [0, 3], desc: "Santai. Kurang peduli akan waktu, kurang memiliki rasa urgensi, membuang-buang waktu, bukan pekerja yang tepat waktu." }, { range: [4, 6], desc: "Cukup aktif dalam segi mental, dapat menyesuaikan tempo kerjanya dengan tuntutan pekerjaan / lingkungan." }, { range: [7, 9], desc: "Cekatan, selalu siaga, bekerja cepat, ingin segera menyelesaikan tugas. Negatifnya: Tegang, cemas, impulsif, mungkin ceroboh, banyak gerakan yang tidak perlu." } ],
    V: [ { range: [0, 2], desc: "Cocok untuk pekerjaan 'di belakang meja'. Cenderung lamban, tidak tanggap, mudah lelah, daya tahan lemah." }, { range: [3, 6], desc: "Dapat bekerja di belakang meja dan senang jika sesekali harus terjun ke lapangan atau melaksanakan tugas-tugas yang bersifat mobile." }, { range: [7, 9], desc: "Menyukai aktifitas fisik (a.l.: olah raga), enerjik, memiliki stamina untuk menangani tugas-tugas berat, tidak mudah lelah. Tidak betah duduk lama, kurang dapat konsentrasi 'di belakang meja'." } ],
    W: [ { range: [0, 3], desc: "Hanya butuh gambaran ttg kerangka tugas scr garis besar, berpatokan pd tujuan, dpt bekerja dlm suasana yg kurang berstruktur, berinsiatif, mandiri. Tdk patuh, cenderung mengabaikan/tdk paham pentingnya peraturan/prosedur, suka membuat peraturan sendiri yg bisa bertentangan dg yg telah ada." }, { range: [4, 5], desc: "Perlu pengarahan awal dan tolok ukur keberhasilan." }, { range: [6, 7], desc: "Membutuhkan uraian rinci mengenai tugas, dan batasan tanggung jawab serta wewenang." }, { range: [8, 9], desc: "Patuh pada kebijaksanaan, peraturan dan struktur organisasi. Ingin segala sesuatunya diuraikan secara rinci, kurang memiliki inisiatif, tdk fleksibel, terlalu tergantung pada organisasi, berharap 'disuapi'." } ],
    F: [ { range: [0, 3], desc: "Otonom, dapat bekerja sendiri tanpa campur tangan orang lain, motivasi timbul krn pekerjaan itu sendiri - bukan krn pujian dr otoritas. Mempertanyakan otoritas, cenderung tidak puas thdp atasan, loyalitas lebih didasari kepentingan pribadi." }, { range: [4, 6], desc: "Loyal pada Perusahaan." }, { range: [7, 7], desc: "Loyal pada pribadi atasan." }, { range: [8, 9], desc: "Loyal, berusaha dekat dg pribadi atasan, ingin menyenangkan atasan, sadar akan harapan atasan akan dirinya. Terlalu memperhatikan cara menyenangkan atasan, tidak berani berpendirian lain, tidak mandiri." } ],
    L: [ { range: [0, 1], desc: "Puas dengan peran sebagai bawahan, memberikan kesempatan pada orang lain untuk memimpin, tidak dominan. Tidak percaya diri; sama sekali tidak berminat untuk berperan sebagai pemimpin; bersikap pasif dalam kelompok." }, { range: [2, 3], desc: "Tidak percaya diri dan tidak ingin memimpin atau mengawasi orang lain." }, { range: [4, 4], desc: "Kurang percaya diri dan kurang berminat utk menjadi pemimpin." }, { range: [5, 5], desc: "Cukup percaya diri, tidak secara aktif mencari posisi kepemimpinan akan tetapi juga tidak akan menghindarinya." }, { range: [6, 7], desc: "Percaya diri dan ingin berperan sebagai pemimpin." }, { range: [8, 9], desc: "Sangat percaya diri utk berperan sbg atasan & sangat mengharapkan posisi tersebut. Lebih mementingkan citra & status kepemimpinannya dari pada efektifitas kelompok, mungkin akan tampil angkuh atau terlalu percaya diri." } ],
    P: [ { range: [0, 1], desc: "Permisif, akan memberikan kesempatan pada orang lain untuk memimpin. Tidak mau mengontrol orang lain dan tidak mau mempertanggung jawabkan hasil kerja bawahannya." }, { range: [2, 3], desc: "Enggan mengontrol org lain & tidak mau mempertanggung jawabkan hasil kerja bawahannya, lebih memberi kebebasan kpd bawahan utk memilih cara sendiri dlm penyelesaian tugas dan meminta bawahan utk mempertanggungjawabkan hasilnya masing-masing." }, { range: [4, 4], desc: "Cenderung enggan melakukan fungsi pengarahan, pengendalian dan pengawasan, kurang aktif memanfaatkan kapasitas bawahan secara optimal, cenderung bekerja sendiri dalam mencapai tujuan kelompok." }, { range: [5, 5], desc: "Bertanggung jawab, akan melakukan fungsi pengarahan, pengendalian dan pengawasan, tapi tidak mendominasi." }, { range: [6, 7], desc: "Dominan dan bertanggung jawab, akan melakukan fungsi pengarahan, pengendalian dan pengawasan." }, { range: [8, 9], desc: "Sangat dominan, sangat mempengaruhi & mengawasi org lain, bertanggung jawab atas tindakan & hasil kerja bawahan. Posesif, tdk ingin berada di bawah pimpinan org lain, cemas bila tdk berada di posisi pemimpin, mungkin sulit utk bekerja sama dgn rekan yg sejajar kedudukannya." } ],
    I: [ { range: [0, 1], desc: "Sangat berhati-hati, memikirkan langkah-langkahnya secara bersungguh-sungguh. Lamban dlm mengambil keputusan, terlalu lama merenung, cenderung menghindar mengambil keputusan." }, { range: [2, 3], desc: "Enggan mengambil keputusan." }, { range: [4, 5], desc: "Berhati-hati dlm pengambilan keputusan." }, { range: [6, 7], desc: "Cukup percaya diri dlm pengambilan keputusan, mau mengambil resiko, dpt memutuskan dgn cepat, mengikuti alur logika." }, { range: [8, 9], desc: "Sangat yakin dl mengambil keputusan, cepat tanggap thd situasi, berani mengambil resiko, mau memanfaatkan kesempatan. Impulsif, dpt membuat keputusan yg tdk praktis, cenderung lebih mementingkan kecepatan daripada akurasi, tdk sabar, cenderung meloncat pd keputusan." } ],
    S: [ { range: [0, 2], desc: "Dpt. bekerja sendiri, tdk membutuhkan kehadiran org lain. Menarik diri, kaku dlm bergaul, canggung dlm situasi sosial, lebih memperhatikan hal-hal lain daripada manusia." }, { range: [3, 4], desc: "Kurang percaya diri & kurang aktif dlm menjalin hubungan sosial." }, { range: [5, 9], desc: "Percaya diri & sangat senang bergaul, menyukai interaksi sosial, bisa menciptakan suasana yg menyenangkan, mempunyai inisiatif & mampu menjalin hubungan & komunikasi, memperhatikan org lain. Mungkin membuang-buang waktu utk aktifitas sosial, kurang peduli akan penyelesaian tugas." } ],
    B: [ { range: [0, 2], desc: "Mandiri (dari segi emosi), tdk mudah dipengaruhi oleh tekanan kelompok. Penyendiri, kurang peka akan sikap & kebutuhan kelompok, mungkin sulit menyesuaikan diri." }, { range: [3, 5], desc: "Selektif dlm bergabung dg kelompok, hanya mau berhubungan dg kelompok di lingkungan kerja apabila bernilai & sesuai minat, tdk terlalu mudah dipengaruhi." }, { range: [6, 9], desc: "Suka bergabung dlm kelompok, sadar akan sikap & kebutuhan kelompok, suka bekerja sama, ingin menjadi bagian dari kelompok, ingin disukai & diakui oleh lingkungan; sangat tergantung pd kelompok, lebih memperhatikan kebutuhan kelompok daripada pekerjaan." } ],
    O: [ { range: [0, 2], desc: "Menjaga jarak, lebih memperhatikan hal-hal kedinasan, tdk mudah dipengaruhi oleh individu tertentu, objektif & analitis. Tampil dingin, tdk acuh, tdk ramah, suka berahasia, mungkin tdk sadar akan perasaan org lain, & mungkin sulit menyesuaikan diri." }, { range: [3, 5], desc: "Tidak mencari atau menghindari hubungan antar pribadi di lingkungan kerja, masih mampu menjaga jarak." }, { range: [6, 9], desc: "Peka akan kebutuhan org lain, sangat memikirkan hal-hal yg dibutuhkan org lain, suka menjalin hubungan persahabatan yg hangat & tulus. Sangat perasa, mudah tersinggung, cenderung subjektif, dpt terlibat terlalu dalam/intim dg individu tertentu dlm pekerjaan, sangat tergantung pd individu tertentu." } ],
    X: [ { range: [0, 1], desc: "Sederhana, rendah hati, tulus, tidak sombong dan tidak suka menampilkan diri. Terlalu sederhana, cenderung merendahkan kapasitas diri, tidak percaya diri, cenderung menarik diri dan pemalu." }, { range: [2, 3], desc: "Sederhana, cenderung diam, cenderung pemalu, tidak suka menonjolkan diri." }, { range: [4, 5], desc: "Mengharapkan pengakuan lingkungan dan tidak mau diabaikan tetapi tidak mencari-cari perhatian." }, { range: [6, 9], desc: "Bangga akan diri dan gayanya sendiri, senang menjadi pusat perhatian, mengharapkan penghargaan dari lingkungan. Mencari-cari perhatian dan suka menyombongkan diri." } ],
    E: [ { range: [0, 1], desc: "Sangat terbuka, terus terang, mudah terbaca (dari air muka, tindakan, perkataan, sikap). Tidak dapat mengendalikan emosi, cepat bereaksi, kurang mengindahkan/tidak mempunyai 'nilai' yg mengharuskannya menahan emosi." }, { range: [2, 3], desc: "Terbuka, mudah mengungkap pendapat atau perasaannya mengenai suatu hal kepada org lain." }, { range: [4, 6], desc: "Mampu mengungkap atau menyimpan perasaan, dapat mengendalikan emosi." }, { range: [7, 9], desc: "Mampu menyimpan pendapat atau perasaannya, tenang, dapat mengendalikan emosi, menjaga jarak. Tampil pasif dan tidak acuh, mungkin sulit mengungkapkan emosi/perasaan/pandangan." } ],
    K: [ { range: [0, 1], desc: "Sabar, tidak menyukai konflik. Mengelak atau menghindar dari konflik, pasif, menekan atau menyembunyikan perasaan sesungguhnya, menghindari konfrontasi, lari dari konflik, tidak mau mengakui adanya konflik." }, { range: [2, 3], desc: "Lebih suka menghindari konflik, akan mencari rasionalisasi untuk dapat menerima situasi dan melihat permasalahan dari sudut pandang orang lain." }, { range: [4, 5], desc: "Tidak mencari atau menghindari konflik, mau mendengarkan pandangan orang lain tetapi dapat menjadi keras kepala saat mempertahankan pandangannya." }, { range: [6, 7], desc: "Akan menghadapi konflik, mengungkapkan serta memaksakan pandangan dengan cara positif." }, { range: [8, 9], desc: "Terbuka, jujur, terus terang, asertif, agresif, reaktif, mudah tersinggung, mudah meledak, curiga, berprasangka, suka berkelahi atau berkonfrontasi, berpikir negatif." } ],
    Z: [ { range: [0, 1], desc: "Mudah beradaptasi dg pekerjaan rutin tanpa merasa bosan, tidak membutuhkan variasi, menyukai lingkungan stabil dan tidak berubah. Konservatif, menolak perubahan, sulit menerima hal-hal baru, tidak dapat beradaptasi dengan situasi yg berbeda-beda." }, { range: [2, 3], desc: "Enggan berubah, tidak siap untuk beradaptasi, hanya mau menerima perubahan jika alasannya jelas dan meyakinkan." }, { range: [4, 5], desc: "Mudah beradaptasi, cukup menyukai perubahan." }, { range: [6, 7], desc: "Antusias terhadap perubahan dan akan mencari hal-hal baru, tetapi masih selektif (menilai kemanfaatannya)." }, { range: [8, 9], desc: "Sangat menyukai perubahan, gagasan baru/variasi, aktif mencari perubahan, antusias dg hal-hal baru, fleksibel dlm berpikir, mudah beradaptasi pd situasi yg berbeda-beda. Gelisah, frustasi, mudah bosan, sangat membutuhkan variasi, tidak menyukai tugas/situasi yg rutin-monoton." } ],
  };

  function getInterpretasiPAPI(aspek, nilai) {
    if (!kamusPAPI[aspek]) return "-";
    const entry = kamusPAPI[aspek].find(r => nilai >= r.range[0] && nilai <= r.range[1]);
    return entry ? entry.desc : "-";
  }

  // Susunan kode tetap & urut
   const urutanPAPI = [
    'N','G','A', 'L','P','I', 'T','V',
    'X','S','B','O', 'R','D','C',
    'Z','E','K', 'F','W'
  ];
  const allScores = {
    ...appState.skorPAPIArahKerja,
    ...appState.skorPAPIKepemimpinan,
    ...appState.skorPAPIAktivitas,
    ...appState.skorPAPIPergaulan,
    ...appState.skorPAPIGayaKerja,
    ...appState.skorPAPISifat,
    ...appState.skorPAPIKetaatan
  };
  const entries = urutanPAPI.map(kode => [kode, allScores[kode]]).filter(([k,v])=>v !== undefined);

  // Fungsi getInterpretasiPAPI dari kamus, ambil deskripsi sesuai skor kandidat
  function getInterpretasiPAPI(aspek, nilai) {
    if (!kamusPAPI[aspek]) return "-";
    const entry = kamusPAPI[aspek].find(r => nilai >= r.range[0] && nilai <= r.range[1]);
    return entry ? entry.desc : "-";
  }

  // Tulis dua kolom interpretasi faktor (paragraf lengkap)
  let yL = ySection;
  let yR = ySection;
  const xL = 25;
  const xR = 112;
  doc.setFontSize(6.2);

  function drawKolom(pasangan, xStart, yStart) {
    let y = yStart;
    pasangan.forEach(([kode, nilai]) => {
      if (nilai == null) return;
      doc.setFont(undefined, 'bold');
      doc.text(`${kode} = ${nilai}`, xStart, y);
      doc.setFont(undefined, 'normal');
      // Ambil interpretasi lengkap dari kamus
      const interpretasi = getInterpretasiPAPI(kode, nilai);
      // Bungkus ke multi-line agar tidak tabrakan
      const lines = doc.splitTextToSize(interpretasi, 72);
      lines.forEach((line, i) => {
        doc.text(line, xStart + 12, y + (i * 2.3));
      });
      y += 4.6 + (lines.length-1)*2.3;
      if (y > 265) { doc.addPage(); y = 20; }
    });
    return y;
  }

 function hitungTinggiKolom(pasangan, fontSize = 6.2) {
  let totalY = 0;
  pasangan.forEach(([kode, nilai]) => {
    if (nilai == null) return;
    const interpretasi = getInterpretasiPAPI(kode, nilai);
    const lines = doc.splitTextToSize(interpretasi, 72);
    totalY += 4.6 + (lines.length - 1) * 2.3;
  });
  return totalY;
}

const nHalf = Math.ceil(entries.length / 2);
const kolomKiri = entries.slice(0, nHalf);
const kolomKanan = entries.slice(nHalf);

// Tambahkan logika untuk cek tinggi maksimal dari kedua kolom
const tinggiKiri = hitungTinggiKolom(kolomKiri);
const tinggiKanan = hitungTinggiKolom(kolomKanan);
const tinggiMax = Math.max(tinggiKiri, tinggiKanan);

if (ySection + tinggiMax > 275) {
  doc.addPage();
  ySection = 20;
}

// Cetak dua kolom berdampingan, tetap satu halaman
yL = drawKolom(kolomKiri, xL, ySection);
yR = drawKolom(kolomKanan, xR, ySection);
ySection = Math.max(yL, yR) + 6;


// === ANALISIS & KECOCOKAN POSISI DETAIL PAPI ===
const posisi = appState.identity?.position || "Unknown";
doc.setFontSize(7);
doc.setFont(undefined, 'bold');
doc.text(`Analisis Kecocokan untuk Posisi: ${posisi}`, 25, ySection);
ySection += 3;
doc.setFont(undefined, 'normal');

// Gabungan skor hasil PAPI (semua faktor)
const scores = allScores; // sudah lengkap N,G,A,...,W

// ==== MAPPING KEBUTUHAN PER POSISI DAN ANALISIS PERSONAL ====
const requirementPAPI = {
  "Technical Staff": {
    utama: ['D', 'C', 'W', 'N', 'G', 'A'],
    pendukung: ['E', 'K', 'Z', 'T'],
    highlight: {
      D: 'ketelitian & perhatian detail',
      C: 'keteraturan kerja',
      W: 'kepatuhan & disiplin',
      N: 'tanggung jawab menyelesaikan tugas',
      G: 'semangat kerja',
      A: 'motivasi berprestasi',
      E: 'pengendalian emosi',
      K: 'ketegasan',
      Z: 'adaptasi pada perubahan',
      T: 'kecepatan & aktivitas'
    }
  },
  "Dosen/Guru": {
    utama: ['S', 'B', 'O', 'N', 'G', 'A', 'E', 'K'],
    pendukung: ['Z', 'R', 'C'],
    highlight: {
      S: 'kemampuan sosial',
      B: 'kerjasama dalam kelompok',
      O: 'kehangatan & empati',
      N: 'komitmen kerja',
      G: 'energi kerja',
      A: 'semangat berprestasi',
      E: 'stabilitas emosi',
      K: 'ketegasan mengelola kelas',
      Z: 'adaptasi inovasi',
      R: 'penalaran & kreativitas',
      C: 'keteraturan administrasi'
    }
  },
  "Administrator": {
    utama: ['D', 'C', 'W', 'N', 'G'],
    pendukung: ['R', 'T', 'F', 'A'],
    highlight: {
      D: 'ketelitian & perhatian detail',
      C: 'keteraturan & sistematika',
      W: 'kepatuhan sistem',
      N: 'tanggung jawab kerja',
      G: 'konsistensi kerja',
      R: 'analisa data',
      T: 'aktivitas administrasi',
      F: 'loyalitas organisasi',
      A: 'motivasi hasil'
    }
  },
  "Manajer": {
    utama: ['A', 'G', 'N', 'L', 'P', 'I', 'S', 'B', 'Z', 'E'],
    pendukung: ['D', 'C', 'K', 'O'],
    highlight: {
      A: 'inisiatif & motivasi',
      G: 'dorongan kerja',
      N: 'komitmen menyelesaikan tugas',
      L: 'kepemimpinan',
      P: 'pengendalian tim',
      I: 'keputusan strategis',
      S: 'kemampuan sosial',
      B: 'kolaborasi',
      Z: 'adaptasi perubahan',
      E: 'pengendalian emosi',
      D: 'detail operasional',
      C: 'sistematika kerja',
      K: 'ketegasan pengambilan keputusan',
      O: 'relasi personal'
    }
  },
  "Housekeeping": {
    utama: ['C', 'D', 'W', 'N', 'G', 'E'],
    pendukung: ['K', 'T', 'Z', 'F', 'A'],
    highlight: {
      C: 'keteraturan & kerapian kerja',
      D: 'ketelitian & perhatian pada detail',
      W: 'kepatuhan terhadap aturan & SOP',
      N: 'tanggung jawab menyelesaikan tugas',
      G: 'semangat kerja & inisiatif',
      E: 'pengendalian emosi & ketenangan',
      K: 'ketegasan menjalankan tugas',
      T: 'kecepatan & aktivitas fisik',
      Z: 'adaptasi pada perubahan & permintaan mendadak',
      F: 'loyalitas terhadap organisasi',
      A: 'inisiatif meningkatkan kualitas kerja'
    }
  }
};


function analisisKecocokanPAPIDetail(scores, posisi, nama = "Kandidat") {
  const req = requirementPAPI[posisi];
  if (!req) return `Posisi "${posisi}" tidak dikenali.`;

  let paragraf = `Analisis kecocokan ${nama} untuk posisi **${posisi}** berdasarkan hasil Tes PAPI:\n\n`;

  // Semua faktor utama
  paragraf += `*Faktor utama posisi:*\n`;
  req.utama.forEach(k => {
    paragraf += `- ${req.highlight[k]} (skor: ${scores[k] ?? "-"}): ${getInterpretasiPAPI(k, scores[k] ?? 0)}\n`;
  });

  paragraf += `\n`;

  // Semua faktor pendukung
  paragraf += `*Faktor pendukung posisi:*\n`;
  req.pendukung.forEach(k => {
    paragraf += `- ${req.highlight[k]} (skor: ${scores[k] ?? "-"}) : ${getInterpretasiPAPI(k, scores[k] ?? 0)}\n`;
  });

  paragraf += `\n`;

  // Paragraf ringkasan kelebihan dan area pengembangan seperti biasa
  const kelebihan = [];
  const pengembangan = [];
  req.utama.forEach(k => {
    if ((scores[k] ?? 0) >= 6) kelebihan.push(req.highlight[k] + ` (skor: ${scores[k]})`);
    if ((scores[k] ?? 0) < 3) pengembangan.push(req.highlight[k] + ` (skor: ${scores[k]})`);
  });
  req.pendukung.forEach(k => {
    if ((scores[k] ?? 0) >= 7) kelebihan.push(req.highlight[k] + ` (skor: ${scores[k]})`);
    if ((scores[k] ?? 0) < 2) pengembangan.push(req.highlight[k] + ` (skor: ${scores[k]})`);
  });

  if (kelebihan.length > 0) {
    paragraf += `*Kekuatan utama:*\n${kelebihan.map(s=>'- '+s).join('\n')}\n\n`;
  } else {
    paragraf += `Tidak ditemukan kekuatan menonjol pada faktor utama. Perlu dikembangkan lebih lanjut.\n\n`;
  }
  if (pengembangan.length > 0) {
    paragraf += `*Area yang perlu dikembangkan:*\n${pengembangan.map(s=>'- '+s).join('\n')}\n\n`;
  }
  if (kelebihan.length > 0 && pengembangan.length === 0) {
    paragraf += `Kandidat memiliki kompetensi yang sangat baik untuk posisi ini.`;
  } else if (kelebihan.length > 0 && pengembangan.length > 0) {
    paragraf += `Kandidat memiliki beberapa kelebihan penting namun juga area pengembangan yang perlu diperhatikan sebelum menempati posisi ini.`;
  } else {
    paragraf += `Kandidat belum memenuhi banyak aspek utama posisi ini. Disarankan untuk pengembangan lebih lanjut atau penempatan pada posisi lain yang lebih sesuai.`;
  }
  return paragraf;
}


// === CETAK ANALISA DETAIL KE PDF ===
const nama = appState.identity?.name || "Kandidat";
const hasilAnalisisDetail = analisisKecocokanPAPIDetail(scores, posisi, nama);

// Print section judul (rapi dan sedikit lebih menonjol)
doc.setFontSize(8.5);
doc.setFont(undefined, 'bold');
doc.setTextColor(61, 131, 223);
doc.text(`Analisis Kecocokan untuk Posisi: ${posisi}`, 20, ySection);
doc.setTextColor(0, 0, 0);
doc.setFontSize(7);
doc.setFont(undefined, 'normal');
ySection += 4;

// Cetak analisis detail, tiap baris di-wrap (wrap per-baris, bukan sekaligus)
hasilAnalisisDetail.split('\n').forEach(baris => {
  // Wrap tiap baris supaya anti overflow kanan
  const wrapLines = doc.splitTextToSize(baris, 160);  // 160 = lebar aman, bisa diatur sesuai kebutuhan
  wrapLines.forEach(wrapLine => {
    if (ySection > 275) { doc.addPage(); ySection = 20; }
    // Tambahkan sedikit indent pada bullet (- atau *) biar lebih enak dibaca
    const xPos = (baris.startsWith('-') || baris.startsWith('*')) ? 27 : 20;
    doc.text(wrapLine, xPos, ySection);
    ySection += 3;
  });
});
ySection += 5;}

// ========== BIG FIVE ==========
if (appState.completed.BIGFIVE) {
  ySection += 6;
  if (ySection > 265) { doc.addPage(); ySection = 20; }
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('Tes Big Five', 105, ySection, { align: 'center' });
  ySection += 4;

  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');
  doc.text('Jawaban:', 20, ySection);
  ySection += 3;

  // --- 4 kolom, rata kiri-kanan, fit PDF A4 landscape/portrait ---
 const total = tests.BIGFIVE.questions.length;
const col_x = [18, 63, 108, 153];
const rowsPerCol = Math.ceil(total / 4);

let row = 0, col = 0, maxRow = 0;

for (let i = 0; i < total; i++) {
  // --- CEK: jika sudah mentok halaman, ganti halaman baru ---
  if ((ySection + row * 3) > 275) { // 275 px batas aman
    doc.addPage();
    ySection = 22; // atau sesuai margin atas halaman baru
    row = 0;
    col++; // lanjut ke kolom kanan, BUKAN RESET KE 0
    if (col > 3) { col = 0; } // kalau sudah 4 kolom, reset ke 0 (aman)
  }
  if (row >= rowsPerCol) { row = 0; col++; }
  if (col > 3) { doc.addPage(); ySection = 22; col = 0; row = 0; }
  const ans = appState.answers.BIGFIVE[i];
  let jawaban = "Tidak dijawab";
  if (typeof ans === 'number' && ans > 0) {
    if (ans === 1) jawaban = "1 (Sangat Tidak Sesuai)";
    else if (ans === 2) jawaban = "2 (Tidak Sesuai)";
    else if (ans === 3) jawaban = "3 (Netral)";
    else if (ans === 4) jawaban = "4 (Sesuai)";
    else if (ans === 5) jawaban = "5 (Sangat Sesuai)";
    else jawaban = ans.toString();
  }
  doc.text(
    `${(i + 1).toString().padStart(3, '0')}. ${jawaban}`,
    col_x[col], ySection + row * 3
  );
  row++;
  maxRow = Math.max(maxRow, row);
}
ySection += maxRow * 3 + 3;
  // ===== Ringkasan OCEAN =====
  if (appState.hasilOCEAN) {
    if (ySection > 255) { doc.addPage(); ySection = 20; }
    doc.setFont(undefined, 'bold');
    doc.text('Ringkasan Hasil OCEAN:', 20, ySection);
    ySection += 3;
    doc.setFont(undefined, 'normal');
    Object.entries(appState.hasilOCEAN).forEach(([dim, val]) => {
      if (ySection > 280) { doc.addPage(); ySection = 20; }
      const splitText = doc.splitTextToSize(
        `${val.name.padEnd(15)} | Skor: ${val.percent.toString().padStart(2, ' ')}% | ${val.desc}`,
        170
      );
      splitText.forEach(part => {
        if (ySection > 280) { doc.addPage(); ySection = 20; }
        doc.text(part, 25, ySection);
        ySection += 3.1;
      });
    });
    ySection += 2;
  }

  // ===== Tabel Kecocokan OCEAN per Aspek & Posisi + Kesimpulan =====
  if (appState.hasilOCEAN && appState.identity && appState.identity.position) {
    let posisiKey = appState.identity.position;
    if (posisiKey === "Dosen/Guru" && appState.identity.teacherLevel && bigFivePositionAnalysis[appState.identity.teacherLevel]) {
      posisiKey = appState.identity.teacherLevel;
    }
    if (posisiKey === "Technical Staff" && appState.identity.techRole && bigFivePositionAnalysis[appState.identity.techRole]) {
      posisiKey = appState.identity.techRole;
    }
    const aspekList = ['O', 'C', 'E', 'A', 'N'];
    const aspekLabel = {
      O: 'Openness',
      C: 'Conscientiousness',
      E: 'Extraversion',
      A: 'Agreeableness',
      N: 'Neuroticism'
    };
    function getBigFiveSuitabilityLabel(percent, dim) {
      if (dim === 'N') {
        if (percent < 40) return "Cocok sekali";
        if (percent < 65) return "Cocok";
        if (percent < 80) return "Kurang cocok";
        return "Tidak cocok";
      } else {
        if (percent >= 80) return "Cocok sekali";
        if (percent >= 65) return "Cocok";
        if (percent >= 40) return "Kurang cocok";
        return "Tidak cocok";
      }
    }

    // Simpan hasil kecocokan per aspek
    let aspekHasil = [];
    if (ySection > 250) { doc.addPage(); ySection = 20; }
    doc.setFont(undefined, 'bold');
    doc.text("Tabel Kecocokan Big Five dengan Posisi:", 20, ySection);
    ySection += 3;
    doc.setFont(undefined, 'normal');
    doc.text("Aspek             | Skor (%) | Kecocokan", 25, ySection);
    ySection += 3;
    aspekList.forEach(dim => {
      const val = appState.hasilOCEAN[dim];
      if (!val) return;
      let label = getBigFiveSuitabilityLabel(val.percent, dim);
      aspekHasil.push({ dim, label, percent: val.percent });
      let line = `${aspekLabel[dim].padEnd(15)} | ${val.percent.toString().padStart(3)}%    | ${label}`;
      doc.text(line, 25, ySection);
      ySection += 2.6;
    });
    ySection += 1.8;

    // ===== Kesimpulan Akhir Kecocokan =====
    // Hitung jumlah tiap kategori
    const count = { 'Cocok sekali': 0, 'Cocok': 0, 'Kurang cocok': 0, 'Tidak cocok': 0 };
    aspekHasil.forEach(a => count[a.label]++);
    let urutan = ["Tidak cocok", "Kurang cocok", "Cocok", "Cocok sekali"];
    let overall = urutan.find(label => count[label] === Math.max(...Object.values(count))) || "Kurang cocok";

    doc.setFont(undefined, 'bold');
    doc.text("Kesimpulan Akhir Kecocokan:", 25, ySection);
    ySection += 2.7;
    doc.setFont(undefined, 'normal');
    doc.text(`${overall.toUpperCase()}`, 90, ySection - 0.2);

    // ===== Alasan Lengkap & Detail =====
    const strongest = aspekHasil.filter(a => a.label === "Cocok sekali" || a.label === "Cocok").sort((a, b) => b.percent - a.percent)[0];
    const weakest = aspekHasil.filter(a => a.label === "Tidak cocok" || a.label === "Kurang cocok").sort((a, b) => a.percent - b.percent)[0];

    ySection += 2.6;
    doc.setFont(undefined, 'bold');
    doc.text("Alasan:", 25, ySection);
    ySection += 2.2;
    doc.setFont(undefined, 'normal');
    let alasan;
    if (overall === "Cocok sekali") {
      alasan = `Seluruh aspek kepribadian kandidat sangat sesuai dengan tuntutan posisi. Aspek paling menonjol adalah ${strongest ? aspekLabel[strongest.dim] + " (" + strongest.percent + "%)" : "-"}, yang menjadi kekuatan utama dalam menunjang kinerja dan adaptasi pada posisi ini. Tidak ditemukan aspek yang menghambat secara signifikan.`;
    } else if (overall === "Cocok") {
      alasan = `Sebagian besar aspek kepribadian kandidat sesuai dengan tuntutan posisi. Aspek yang paling mendukung adalah ${strongest ? aspekLabel[strongest.dim] + " (" + strongest.percent + "%)" : "-"}, yang sangat menunjang kebutuhan utama pada posisi ini. Namun, terdapat beberapa aspek yang perlu dikembangkan, yaitu ${weakest ? aspekLabel[weakest.dim] + " (" + weakest.percent + "%)" : "-"}, agar kinerja dan adaptasi kandidat dapat semakin optimal.`;
    } else if (overall === "Kurang cocok") {
      alasan = `Beberapa aspek kepribadian kandidat belum memenuhi kriteria utama posisi ini, terutama pada aspek ${weakest ? aspekLabel[weakest.dim] + " (" + weakest.percent + "%)" : "-"} yang menjadi area penghambat utama. Penguatan pada aspek ini sangat disarankan agar kandidat dapat menyesuaikan diri secara lebih efektif. Meski demikian, ada pula aspek yang sudah sesuai yaitu ${strongest ? aspekLabel[strongest.dim] + " (" + strongest.percent + "%)" : "-"}, yang dapat dijadikan modal awal pengembangan.`;
    } else { // Tidak cocok
      alasan = `Sebagian besar aspek kepribadian kandidat tidak sesuai dengan tuntutan posisi, terutama pada aspek ${weakest ? aspekLabel[weakest.dim] + " (" + weakest.percent + "%)" : "-"}, yang berpotensi menjadi hambatan besar dalam pelaksanaan tugas. Diperlukan pengembangan menyeluruh dan penyesuaian pada hampir seluruh aspek agar dapat mencapai kecocokan yang dibutuhkan pada posisi ini.`;
    }
    const alasanLines = doc.splitTextToSize(alasan, 170);
    alasanLines.forEach(line => {
      if (ySection > 280) { doc.addPage(); ySection = 20; }
      doc.text(line, 25, ySection);
      ySection += 2.7;
    });
    ySection += 2.5;
  }

  // ===== Analisa Kepribadian & Kecocokan Posisi (Narasi detail, tanpa judul) =====
  if (appState.identity && appState.identity.position) {
    let posisiKey = appState.identity.position;
    if (
      posisiKey === "Dosen/Guru" &&
      appState.identity.teacherLevel &&
      bigFivePositionAnalysis[appState.identity.teacherLevel]
    ) {
      posisiKey = appState.identity.teacherLevel;
    }
    if (
      posisiKey === "Technical Staff" &&
      appState.identity.techRole &&
      bigFivePositionAnalysis[appState.identity.techRole]
    ) {
      posisiKey = appState.identity.techRole;
    }
    const analisa = bigFivePositionAnalysis[posisiKey];
    if (analisa && analisa.length > 0) {
      if (ySection > 255) { doc.addPage(); ySection = 20; }
      doc.setFont(undefined, 'normal');
      analisa.forEach(line => {
        const splitText = doc.splitTextToSize(line, 170);
        splitText.forEach(part => {
          if (ySection > 280) { doc.addPage(); ySection = 20; }
          doc.text(part, 25, ySection);
          ySection += 3.3;
        });
      });
      ySection += 2;
    }
  }
}
// ========== GRAFIS ==========
// Full page, tanpa margin, gambar proporsional dan diperbesar maksimal
const grafisLabel = {
  orang: "Tes DAP (Draw A Person) - Gambar Orang",
  rumah: "Tes HTP (House-Tree-Person) - Gambar Rumah, Pohon, Orang",
  pohon: "Tes BAUM (Tree Drawing Test) - Gambar Pohon"
};

if (appState.completed.GRAFIS && appState.grafis) {
  const grafisKeys = ["orang", "rumah", "pohon"];
  for (const key of grafisKeys) {
    if (appState.grafis[key]) {
      await new Promise(resolve => {
        doc.addPage();
        // Tidak ada teks/judul apapun

        // Load gambar untuk dapat ukuran asli (agar scaling proporsional)
        const img = new window.Image();
        img.onload = function() {
          const pxToMm = px => px * 0.264583;
          const pageW = doc.internal.pageSize.getWidth();
          const pageH = doc.internal.pageSize.getHeight();

          let imgWmm = pxToMm(img.naturalWidth);
          let imgHmm = pxToMm(img.naturalHeight);
          const scale = Math.min(pageW / imgWmm, pageH / imgHmm);
          imgWmm *= scale;
          imgHmm *= scale;
          const x = (pageW - imgWmm) / 2;
          const y = (pageH - imgHmm) / 2;

          doc.addImage(appState.grafis[key], 'JPEG', x, y, imgWmm, imgHmm);
          resolve();
        };
        img.src = appState.grafis[key];
      });
    }
  }
  // === Pastikan pindah halaman setelah blok GRAFIS, reset ySection ===
  doc.addPage();
  ySection = 25;
}

// ========== TES ADMIN (EXCEL) ==========
if (appState.completed.EXCEL && appState.adminAnswers && appState.adminAnswers.EXCEL && appState.adminAnswers.EXCEL.link) {
  ySection += 5;
  if (ySection > 260) { doc.addPage(); ySection = 25; }
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text('Tes Admin: Excel/Spreadsheet', 20, ySection);
  ySection += 4;
  doc.setFont(undefined, 'normal');
  doc.setTextColor(33, 77, 170);
  const link = appState.adminAnswers.EXCEL.link;
  const wrapLink = doc.splitTextToSize(link, 160);
  doc.text('Link Google Sheet Jawaban:', 24, ySection);
  ySection += 4;
  doc.text(wrapLink, 24, ySection);
  ySection += 6;
  doc.setTextColor(44, 62, 80);
  if (ySection > 260) { doc.addPage(); ySection = 25; }
}

// ========== TES MENGETIK ==========
if (appState.completed.TYPING && appState.answers.TYPING) {
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text('Tes Mengetik', 20, ySection);
  ySection += 4;
  doc.setFont(undefined, 'normal');
  doc.setTextColor(44, 62, 80);

  const typing = appState.answers.TYPING;
  doc.text(`Karakter benar     : ${typing.benar}`, 24, ySection); ySection += 4;
  doc.text(`Karakter salah     : ${typing.salah}`, 24, ySection); ySection += 4;
  doc.text(`Belum diketik      : ${typing.belum}`, 24, ySection); ySection += 4;
  doc.text(`Akurasi            : ${typing.accuracy}%`, 24, ySection); ySection += 4;
  doc.text(`Kecepatan          : ${typing.wpm} kata/menit (WPM)`, 24, ySection); ySection += 4;
  doc.text(`Waktu digunakan    : ${typing.waktu} detik`, 24, ySection); ySection += 4;
  doc.text(`Teks hasil ketik:`, 24, ySection); ySection += 4;

  const typedText = typing.text ? typing.text.replace(/\n/g, " ") : "";
  const wrapTyping = doc.splitTextToSize(typedText, 160);
  doc.text(wrapTyping, 28, ySection);
  ySection += 4 + wrapTyping.length * 4;
  if (ySection > 260) { doc.addPage(); ySection = 25; }
  doc.setTextColor(44, 62, 80);
}

// ========== TES SUBJEK (UPLOAD JAWABAN) ==========
// Taruh sebelum tanda tangan/footer, setelah tes lain!
if (
  appState.completed &&
  appState.completed.SUBJECT &&
  Array.isArray(appState.subjectUpload) &&
  appState.subjectUpload.length > 0
) {
  for (let i = 0; i < appState.subjectUpload.length; i++) {
    await new Promise(resolve => {
      doc.addPage();
      const img = new window.Image();
      img.onload = function() {
        const pxToMm = px => px * 0.264583;
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        let imgWmm = pxToMm(img.naturalWidth);
        let imgHmm = pxToMm(img.naturalHeight);
        const scale = Math.min(pageW / imgWmm, pageH / imgHmm, 1);
        imgWmm *= scale;
        imgHmm *= scale;
        const x = (pageW - imgWmm) / 2;
        const y = (pageH - imgHmm) / 2;
        doc.addImage(appState.subjectUpload[i], 'JPEG', x, y, imgWmm, imgHmm);
        resolve();
      };
      img.src = appState.subjectUpload[i];
    });
  }
  doc.addPage();
  ySection = 25;
}

// ========== FOOTER UNTUK TANDA TANGAN ==========
let footerY = 285;
if (ySection > 245) { doc.addPage(); footerY = 285; }
const footerX = pageWidth - 20;

doc.setFontSize(10);
doc.setFont(undefined, 'bold');
doc.text('TESTER,', footerX, footerY - 36, { align: "right" });

doc.setFont(undefined, 'normal');
doc.text('Deni Pragas Septian Pratama', footerX, footerY - 12, { align: "right" });
doc.text('Human Capital Recruitment Staff', footerX, footerY - 6, { align: "right" });
doc.text('Sugar Group Schools', footerX, footerY, { align: "right" });

// ====== WATERMARK DIAGONAL: "SANGAT RAHASIA" (merah + kotak), untuk SEMUA halaman ======
// ====== WATERMARK: panggil SETELAH semua konten SELESAI, SEBELUM save() ======
addDiagonalWatermark(doc, 'SANGAT RAHASIA', -35, {
  centerYOffset: 60, 
  centerXOffset: 15,
  
  color: [200, 20, 20], // merah
  opacity: 0.10,        // lebih kecil = lebih tembus
  blur: true,
  blurOpacity: 0.05,    // lapisan blur makin samar
  blurPasses: -2,       // blur halus
  blurRadius: 0.8       // radius glow
});
// ====== SIMPAN FILE ======
let namaFile = ((typeof id === 'object' && id && id.name) ? id.name : "Peserta")
  .replace(/[^a-zA-Z0-9]/g, "-") + "-Psikotes-SGSchools.pdf";
doc.save(namaFile);


}
