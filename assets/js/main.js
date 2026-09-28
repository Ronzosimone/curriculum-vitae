/* Simone Ronzoni — CV: animazioni e interazioni.
   Tutto è un miglioramento progressivo: senza JS, senza GSAP o con "movimento ridotto"
   la pagina resta completa e leggibile, solo statica. */

(function () {
  "use strict";

  var radice = document.documentElement;
  var ridotto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mousePreciso = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var librerie = window.gsap && window.ScrollTrigger && window.SplitText;

  var scena = creaScena(document.querySelector(".eroe-canvas"));
  arricchisciPannelli();

  if (ridotto || !librerie) {
    radice.classList.add("pronto");
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Le divisioni in righe e lettere vanno fatte a font caricati, altrimenti le righe cambiano.
  var fontPronti = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontPronti.then(function () {
    avviaLenis();
    avviaIngresso();
    avviaHeroAlloScroll();
    avviaNastro();
    avviaProfilo();
    // La sezione bloccata va creata prima dei trigger che stanno sotto di lei,
    // altrimenti le loro posizioni non tengono conto dello spazio aggiunto dal pin.
    avviaCompetenze();
    avviaTitoli();
    avviaEsperienza();
    avviaCelle();
    if (mousePreciso) {
      avviaCursore();
      avviaMagnetici();
      avviaLucePannelli();
      avviaInclinazionePannelli();
    }
    radice.classList.add("pronto");
    ScrollTrigger.refresh();
  });

  /* ---------- Scroll fluido ---------- */

  function avviaLenis() {
    if (!window.Lenis) return;
    var testata = document.querySelector(".testata");
    var lenis = new Lenis({
      lerp: 0.1,
      anchors: { offset: -(testata ? testata.getBoundingClientRect().bottom : 0) }
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (tempo) { lenis.raf(tempo * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Ingresso della pagina ---------- */

  function avviaIngresso() {
    var tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.2 } });

    tl.from(".testata > *", { yPercent: -100, opacity: 0, stagger: 0.07, duration: 0.9 }, 0)
      .from(".eroe-canvas", { opacity: 0, duration: 1.6 }, 0.1);

    SplitText.create(".eroe-titolo", {
      type: "lines, chars",
      mask: "lines",
      onSplit: function (self) {
        return gsap.from(self.chars, {
          yPercent: 115,
          stagger: 0.035,
          duration: 1.3,
          ease: "expo.out",
          delay: 0.25
        });
      }
    });

    tl.from(".eroe-info > *", { y: 28, opacity: 0, stagger: 0.09 }, 0.55)
      .from(".eroe-cta", { yPercent: 100, opacity: 0 }, 0.75);
  }

  /* ---------- Hero allo scroll: le particelle si disperdono, il titolo sale ---------- */

  function avviaHeroAlloScroll() {
    ScrollTrigger.create({
      trigger: ".eroe",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: function (self) { scena.imposta(self.progress); }
    });

    gsap.to(".eroe-titolo", {
      yPercent: -35,
      ease: "none",
      scrollTrigger: { trigger: ".eroe", start: "top top", end: "bottom top", scrub: true }
    });
  }

  /* ---------- Nastro: scorre sempre, accelera con la velocità dello scroll ---------- */

  function avviaNastro() {
    var nastro = gsap.to(".nastro-traccia", { xPercent: -50, repeat: -1, duration: 40, ease: "none" });

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: function (self) {
        var spinta = 1 + Math.min(Math.abs(self.getVelocity()) / 200, 7);
        nastro.timeScale(spinta);
        gsap.to(nastro, { timeScale: 1, duration: 1.4, ease: "power2.out", overwrite: true });
      }
    });
  }

  /* ---------- Profilo: le parole si accendono una alla volta ---------- */

  function avviaProfilo() {
    SplitText.create(".profilo-testo", {
      type: "words",
      autoSplit: true,
      onSplit: function (self) {
        return gsap.fromTo(self.words,
          { opacity: 0.22 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: ".profilo-testo", start: "top 80%", end: "bottom 45%", scrub: true }
          });
      }
    });
  }

  /* ---------- Titoli di sezione: salgono da una maschera ---------- */

  function avviaTitoli() {
    gsap.utils.toArray(".titolo-sezione").forEach(function (titolo) {
      SplitText.create(titolo, {
        type: "lines, chars",
        mask: "lines",
        autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.chars, {
            yPercent: 110,
            stagger: 0.025,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: titolo, start: "top 88%", once: true }
          });
        }
      });
    });
  }

  /* ---------- Competenze: sezione bloccata e scorrimento orizzontale ---------- */

  function avviaCompetenze() {
    var mm = gsap.matchMedia();

    mm.add("(min-width: 60rem)", function () {
      radice.classList.add("orizzontale");

      var sezione = document.querySelector(".competenze");
      var finestra = document.querySelector(".competenze-finestra");
      var traccia = document.querySelector(".competenze-traccia");
      var barra = document.querySelector(".competenze-avanzamento span");

      function distanza() {
        return Math.max(0, traccia.scrollWidth - finestra.clientWidth);
      }

      var scorrimento = gsap.to(traccia, {
        x: function () { return -distanza(); },
        ease: "none",
        scrollTrigger: {
          trigger: sezione,
          start: "top top",
          end: function () { return "+=" + distanza(); },
          pin: true,
          scrub: 1,
          refreshPriority: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) { gsap.set(barra, { scaleX: self.progress }); }
        }
      });

      gsap.from(".pannello", {
        y: 80,
        opacity: 0,
        stagger: 0.08,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: sezione, start: "top 70%", once: true }
      });

      // Profondità: mentre la traccia scorre, icona di sfondo e tecnologie si muovono a velocità diverse
      function lungoLaTraccia(pannello) {
        return { trigger: pannello, containerAnimation: scorrimento, start: "left right", end: "right left", scrub: true };
      }
      gsap.utils.toArray(".pannello").forEach(function (pannello) {
        var sfondo = pannello.querySelector(".pannello-sfondo");
        var tech = pannello.querySelector(".pannello-tech");
        if (sfondo) {
          gsap.fromTo(sfondo,
            { xPercent: -22, rotation: -14 },
            { xPercent: 22, rotation: 14, ease: "none", scrollTrigger: lungoLaTraccia(pannello) });
        }
        if (tech) {
          gsap.fromTo(tech, { x: 22 }, { x: -22, ease: "none", scrollTrigger: lungoLaTraccia(pannello) });
        }
      });

      return function () { radice.classList.remove("orizzontale"); };
    });

    // Tablet e telefono: carosello nativo con scroll-snap; la barra segue lo scorrimento laterale
    mm.add("(max-width: 59.99rem)", function () {
      var traccia = document.querySelector(".competenze-traccia");
      var barra = document.querySelector(".competenze-avanzamento span");

      function aggiorna() {
        var massimo = traccia.scrollWidth - traccia.clientWidth;
        gsap.set(barra, { scaleX: massimo > 0 ? traccia.scrollLeft / massimo : 1 });
      }
      traccia.addEventListener("scroll", aggiorna, { passive: true });
      aggiorna();

      gsap.from(".pannello", {
        x: 60,
        opacity: 0,
        stagger: 0.08,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: traccia, start: "top 88%", once: true }
      });

      return function () { traccia.removeEventListener("scroll", aggiorna); };
    });
  }

  /* ---------- Esperienza: la linea si riempie, le tappe entrano ---------- */

  function avviaEsperienza() {
    gsap.fromTo(".linea-progresso",
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: ".linea-tempo", start: "top 70%", end: "bottom 70%", scrub: true }
      });

    gsap.utils.toArray(".tappa").forEach(function (tappa) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: tappa, start: "top 82%", once: true } });
      tl.from(tappa.querySelector(".tappa-periodo"), { x: -30, opacity: 0, duration: 1, ease: "expo.out" })
        .from(tappa.querySelector("h3"), { y: 40, opacity: 0, duration: 1, ease: "expo.out" }, 0.05)
        .from(tappa.querySelector(".tappa-dove"), { y: 20, opacity: 0, duration: 1, ease: "expo.out" }, 0.12)
        .from(tappa.querySelectorAll("li"), { y: 24, opacity: 0, stagger: 0.06, duration: 0.9, ease: "expo.out" }, 0.2);
    });
  }

  /* ---------- Celle (formazione, altre informazioni): entrano a gruppi ---------- */

  function avviaCelle() {
    // Delle celle si anima il contenuto, non la cella: le linee della griglia sono lo sfondo
    // del contenitore e trasparirebbero come blocchi grigi mentre la cella è trasparente.
    function contenuto(el) {
      return el.classList.contains("cella") ? Array.prototype.slice.call(el.children) : [el];
    }
    function tuttiIContenuti(elementi) {
      return elementi.reduce(function (tutti, el) { return tutti.concat(contenuto(el)); }, []);
    }

    var elementi = gsap.utils.toArray(".rivela");
    gsap.set(tuttiIContenuti(elementi), { y: 40, opacity: 0 });
    ScrollTrigger.batch(elementi, {
      start: "top 90%",
      once: true,
      onEnter: function (gruppo) {
        gsap.to(tuttiIContenuti(gruppo), { y: 0, opacity: 1, stagger: 0.06, duration: 1, ease: "expo.out" });
      }
    });

    gsap.from(".contatti-link", {
      y: 50,
      opacity: 0,
      duration: 1.1,
      ease: "expo.out",
      scrollTrigger: { trigger: ".contatti-link", start: "top 92%", once: true }
    });
  }

  /* ---------- Cursore che segue il mouse ---------- */

  function avviaCursore() {
    var anello = document.querySelector(".cursore");
    if (!anello) return;

    var versoX = gsap.quickTo(anello, "x", { duration: 0.45, ease: "power3" });
    var versoY = gsap.quickTo(anello, "y", { duration: 0.45, ease: "power3" });

    window.addEventListener("pointermove", function (e) {
      versoX(e.clientX);
      versoY(e.clientY);
      anello.classList.add("visibile");
    }, { passive: true });

    document.documentElement.addEventListener("pointerleave", function () {
      anello.classList.remove("visibile");
    });

    document.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("pointerenter", function () { anello.classList.add("sopra"); });
      el.addEventListener("pointerleave", function () { anello.classList.remove("sopra"); });
    });
  }

  /* ---------- Elementi magnetici: si spostano verso il cursore ---------- */

  function avviaMagnetici() {
    document.querySelectorAll(".magnetico, .testata-cv, .cella-link").forEach(function (el) {
      var versoX = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      var versoY = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      var forza = el.classList.contains("magnetico") ? 0.25 : 0.15;

      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        versoX((e.clientX - (r.left + r.width / 2)) * forza);
        versoY((e.clientY - (r.top + r.height / 2)) * forza);
      });
      el.addEventListener("pointerleave", function () {
        versoX(0);
        versoY(0);
      });
    });
  }

  /* ---------- Pannelli: icona gigante di sfondo, luce e inclinazione col mouse ---------- */

  function arricchisciPannelli() {
    document.querySelectorAll(".pannello").forEach(function (pannello) {
      var icona = pannello.querySelector(".pannello-icona");
      if (!icona) return;
      var copia = icona.cloneNode(true);
      copia.setAttribute("class", "pannello-sfondo");
      copia.removeAttribute("width");
      copia.removeAttribute("height");
      pannello.insertBefore(copia, pannello.firstChild);
    });
  }

  function avviaLucePannelli() {
    document.querySelectorAll(".pannello").forEach(function (pannello) {
      pannello.addEventListener("pointermove", function (e) {
        var r = pannello.getBoundingClientRect();
        pannello.style.setProperty("--mx", (e.clientX - r.left) + "px");
        pannello.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  function avviaInclinazionePannelli() {
    document.querySelectorAll(".pannello").forEach(function (pannello) {
      gsap.set(pannello, { transformPerspective: 1000 });
      var versoX = gsap.quickTo(pannello, "rotationX", { duration: 0.6, ease: "power3" });
      var versoY = gsap.quickTo(pannello, "rotationY", { duration: 0.6, ease: "power3" });

      pannello.addEventListener("pointermove", function (e) {
        var r = pannello.getBoundingClientRect();
        versoY(((e.clientX - r.left) / r.width - 0.5) * 8);
        versoX(-((e.clientY - r.top) / r.height - 0.5) * 8);
      });
      pannello.addEventListener("pointerleave", function () {
        versoX(0);
        versoY(0);
      });
    });
  }

  /* ---------- Scena dell'hero: nuvola di particelle (canvas 2D) ----------
     All'apertura le particelle partono dalla forma a toro e si ricompongono nelle iniziali "SR";
     poi, a ciclo, diventano "</>" e "AI". Si orientano verso il mouse e si scansano attorno
     al cursore; scorrendo oltre l'hero si disperdono. Sulla griglia una "torcia" segue il mouse. */

  function creaScena(canvas) {
    var vuoto = { imposta: function () {} };
    if (!canvas || !canvas.getContext) return vuoto;

    var ctx = canvas.getContext("2d");
    var N = window.matchMedia("(max-width: 46rem)").matches ? 1600 : 3200;
    var DURATA_MORPH = 1900;
    var PAUSA = 4200;
    var SFASAMENTO = 0.35;     // ritardo massimo di una particella rispetto alle altre nel morph
    var RAGGIO_MOUSE = 110;
    var SPINTA_MOUSE = 60;
    var FUOCO = 1400;
    var COLORI = [
      "rgba(236, 236, 236, 0.28)",
      "rgba(236, 236, 236, 0.55)",
      "rgba(236, 236, 236, 0.8)",
      "rgba(236, 236, 236, 1)",
      "rgba(183, 156, 255, 0.95)"
    ];

    var larghezza = 0;
    var altezza = 0;
    var mouse = { x: 0.5, y: 0.5, px: -1e4, py: -1e4, dentro: false };
    var rotazione = { x: -0.45, y: 0 };
    var dispersione = 0;
    var dispersioneObiettivo = 0;
    var raf = 0;
    var inVista = true;

    var ritardo = new Float32Array(N);
    var direzione = new Float32Array(N * 3);
    var spostX = new Float32Array(N);
    var spostY = new Float32Array(N);
    var schermoX = new Float32Array(N);
    var schermoY = new Float32Array(N);
    var gruppo = new Uint8Array(N);
    var i;

    for (i = 0; i < N; i++) {
      ritardo[i] = Math.random() * SFASAMENTO;
      var u = Math.random() * 2 - 1;
      var ang = Math.random() * Math.PI * 2;
      var s = Math.sqrt(1 - u * u);
      direzione[i * 3] = s * Math.cos(ang);
      direzione[i * 3 + 1] = u;
      direzione[i * 3 + 2] = s * Math.sin(ang);
    }

    // Forma 0: il toro (visibile finché il font non è pronto). Le altre si aggiungono dopo.
    var forme = [toro()];
    var da = 0;
    var a = 0;
    var inizio = 0;

    function nuovaForma() {
      return { x: new Float32Array(N), y: new Float32Array(N), z: new Float32Array(N), larga: 2, alta: 2, fattore: 1, inclinazione: 0 };
    }

    // Centra la forma e la porta in un riquadro da -1 a 1 sul lato più lungo
    function normalizza(f) {
      var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (i = 0; i < N; i++) {
        if (f.x[i] < minX) minX = f.x[i];
        if (f.x[i] > maxX) maxX = f.x[i];
        if (f.y[i] < minY) minY = f.y[i];
        if (f.y[i] > maxY) maxY = f.y[i];
      }
      var cx = (minX + maxX) / 2;
      var cy = (minY + maxY) / 2;
      var meta = Math.max(maxX - minX, maxY - minY) / 2 || 1;
      for (i = 0; i < N; i++) {
        f.x[i] = (f.x[i] - cx) / meta;
        f.y[i] = (f.y[i] - cy) / meta;
        f.z[i] = f.z[i] / meta;
      }
      f.larga = (maxX - minX) / meta;
      f.alta = (maxY - minY) / meta;
      return f;
    }

    function toro() {
      var f = nuovaForma();
      for (i = 0; i < N; i++) {
        var teta = Math.random() * Math.PI * 2;
        var fi = Math.random() * Math.PI * 2;
        var r = 1 + Math.cos(teta);
        f.x[i] = r * Math.cos(fi);
        f.y[i] = Math.sin(teta);
        f.z[i] = r * Math.sin(fi);
      }
      f.fattore = 0.75;
      f.inclinazione = -0.45;
      return normalizza(f);
    }

    // Disegna la parola su un canvas nascosto e ne campiona i pixel pieni
    function parola(testo) {
      var W = 1400, H = 520;
      var foglio = document.createElement("canvas");
      foglio.width = W;
      foglio.height = H;
      var c = foglio.getContext("2d");
      var corpo = 380;
      c.font = "600 " + corpo + "px Unbounded, sans-serif";
      var misura = c.measureText(testo).width;
      if (misura > W * 0.9) {
        corpo *= (W * 0.9) / misura;
        c.font = "600 " + corpo + "px Unbounded, sans-serif";
      }
      c.fillStyle = "#fff";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(testo, W / 2, H / 2);

      var dati = c.getImageData(0, 0, W, H).data;
      var punti = [];
      for (var y = 0; y < H; y += 3) {
        for (var x = 0; x < W; x += 3) {
          if (dati[(y * W + x) * 4 + 3] > 140) punti.push(x, y);
        }
      }
      var quanti = punti.length / 2;
      if (!quanti) return null;

      var f = nuovaForma();
      var spessore = corpo * 0.22;   // profondità delle lettere
      for (i = 0; i < N; i++) {
        var k = (Math.random() * quanti) | 0;
        f.x[i] = punti[k * 2] + (Math.random() - 0.5) * 2.5;
        f.y[i] = punti[k * 2 + 1] + (Math.random() - 0.5) * 2.5;
        f.z[i] = (Math.random() - 0.5) * spessore;
      }
      return normalizza(f);
    }

    function scala(f) {
      // Sugli schermi stretti la forma può occupare quasi tutta la larghezza
      var quotaLarghezza = larghezza < 600 ? 0.84 : 0.56;
      return Math.min(larghezza * quotaLarghezza / f.larga, altezza * 0.66 / f.alta) * f.fattore;
    }

    function facilita(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function griglia(alfa) {
      var passoX = 40;
      var passoY = 160;
      var x0 = (larghezza % passoX) / 2;
      var y0 = (altezza % passoY) / 2;
      ctx.save();
      ctx.strokeStyle = "rgba(236, 236, 236, " + alfa + ")";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      for (var x = x0; x <= larghezza; x += passoX) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, altezza);
      }
      for (var y = y0; y <= altezza; y += passoY) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(larghezza, Math.round(y) + 0.5);
      }
      ctx.stroke();
      ctx.restore();
    }

    function disegna(tempo) {
      ctx.clearRect(0, 0, larghezza, altezza);

      griglia(0.09);
      if (mouse.dentro) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mouse.px, mouse.py, 170, 0, Math.PI * 2);
        ctx.clip();
        griglia(0.4);
        ctx.restore();
      }

      // Avanzamento del morph e passaggio alla forma successiva (SR → </> → AI → SR…)
      var t = Math.min(1, Math.max(0, (tempo - inizio) / DURATA_MORPH));
      if (!ridotto && forme.length > 1 && tempo - inizio > DURATA_MORPH + PAUSA) {
        da = a;
        a = a >= forme.length - 1 ? 1 : a + 1;
        inizio = tempo;
        t = 0;
      }
      var tt = facilita(t);
      var A = forme[da];
      var B = forme[a];
      var S = scala(A) + (scala(B) - scala(A)) * tt;
      var inclinazione = A.inclinazione + (B.inclinazione - A.inclinazione) * tt;

      var obiettivoX = inclinazione + (mouse.y - 0.5) * 0.5;
      var obiettivoY = (mouse.x - 0.5) * 0.8 + Math.sin(tempo * 0.0004) * 0.12;
      rotazione.x += (obiettivoX - rotazione.x) * 0.05;
      rotazione.y += (obiettivoY - rotazione.y) * 0.05;
      dispersione += (dispersioneObiettivo - dispersione) * 0.1;

      var cosX = Math.cos(rotazione.x), sinX = Math.sin(rotazione.x);
      var cosY = Math.cos(rotazione.y), sinY = Math.sin(rotazione.y);
      var cx = larghezza / 2;
      var cy = altezza / 2;
      var raggio2 = RAGGIO_MOUSE * RAGGIO_MOUSE;
      var sparso = dispersione * 1.6;
      var profondita = S * 0.6;

      for (i = 0; i < N; i++) {
        var l = (t - ritardo[i]) / (1 - SFASAMENTO);
        l = facilita(l < 0 ? 0 : l > 1 ? 1 : l);

        var x = (A.x[i] + (B.x[i] - A.x[i]) * l + direzione[i * 3] * sparso) * S;
        var y = (A.y[i] + (B.y[i] - A.y[i]) * l + direzione[i * 3 + 1] * sparso) * S;
        var z = (A.z[i] + (B.z[i] - A.z[i]) * l + direzione[i * 3 + 2] * sparso) * S;

        var x1 = x * cosY + z * sinY;
        var z1 = -x * sinY + z * cosY;
        var y2 = y * cosX - z1 * sinX;
        var z2 = y * sinX + z1 * cosX;

        var prospettiva = FUOCO / (FUOCO + z2);
        var sx = cx + x1 * prospettiva;
        var sy = cy + y2 * prospettiva;

        // Le particelle vicine al cursore si scansano, poi tornano al loro posto
        var versoX = 0, versoY = 0;
        if (mouse.dentro) {
          var dx = sx - mouse.px;
          var dy = sy - mouse.py;
          var d2 = dx * dx + dy * dy;
          if (d2 < raggio2) {
            var d = Math.sqrt(d2) || 1;
            var forza = (1 - d / RAGGIO_MOUSE) * SPINTA_MOUSE;
            versoX = (dx / d) * forza;
            versoY = (dy / d) * forza;
          }
        }
        spostX[i] += (versoX - spostX[i]) * 0.14;
        spostY[i] += (versoY - spostY[i]) * 0.14;
        schermoX[i] = sx + spostX[i];
        schermoY[i] = sy + spostY[i];

        if (i % 13 === 0) {
          gruppo[i] = 4;
        } else {
          var vicino = 0.5 - z2 / profondita;
          gruppo[i] = vicino <= 0 ? 0 : vicino >= 1 ? 3 : (vicino * 4) | 0;
        }
      }

      var lato = 1.6;
      var meta = lato / 2;
      for (var g = 0; g < COLORI.length; g++) {
        ctx.fillStyle = COLORI[g];
        for (i = 0; i < N; i++) {
          if (gruppo[i] === g) ctx.fillRect(schermoX[i] - meta, schermoY[i] - meta, lato, lato);
        }
      }
    }

    function ridimensiona() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      larghezza = r.width;
      altezza = r.height;
      canvas.width = Math.round(larghezza * dpr);
      canvas.height = Math.round(altezza * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!raf) disegna(performance.now());
    }

    function ciclo(tempo) {
      disegna(tempo);
      raf = requestAnimationFrame(ciclo);
    }

    function avvia() {
      if (!raf && !ridotto && inVista && !document.hidden) raf = requestAnimationFrame(ciclo);
    }

    function ferma() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    if ("ResizeObserver" in window) {
      new ResizeObserver(ridimensiona).observe(canvas);
    } else {
      window.addEventListener("resize", ridimensiona);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (voci) {
        inVista = voci[0].isIntersecting;
        if (inVista) avvia(); else ferma();
      }).observe(canvas);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) ferma(); else avvia();
    });

    if (!ridotto) {
      window.addEventListener("pointermove", function (e) {
        var r = canvas.getBoundingClientRect();
        mouse.px = e.clientX - r.left;
        mouse.py = e.clientY - r.top;
        mouse.dentro = mouse.px >= 0 && mouse.py >= 0 && mouse.px <= r.width && mouse.py <= r.height;
        mouse.x = e.clientX / window.innerWidth;
        mouse.y = e.clientY / window.innerHeight;
      }, { passive: true });
      document.documentElement.addEventListener("pointerleave", function () { mouse.dentro = false; });
    }

    // Le parole si possono campionare solo con il font caricato
    var fontParole = document.fonts && document.fonts.load
      ? document.fonts.load('600 100px "Unbounded"')
      : Promise.resolve();
    fontParole.catch(function () {}).then(function () {
      ["SR", "</>", "AI"].forEach(function (testo) {
        var f = parola(testo);
        if (f) forme.push(f);
      });
      if (forme.length < 2) return;
      if (ridotto) {
        da = a = 1;
        disegna(0);
      } else {
        da = 0;
        a = 1;
        inizio = performance.now();
      }
    });

    ridimensiona();
    avvia();

    return {
      // progresso 0 = inizio hero, 1 = hero uscito dallo schermo
      imposta: function (progresso) { dispersioneObiettivo = progresso; }
    };
  }
})();
