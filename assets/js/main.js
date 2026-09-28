/* Simone Ronzoni — CV: animazioni e interazioni.
   Tutto è un miglioramento progressivo: senza JS, senza GSAP o con "movimento ridotto"
   la pagina resta completa e leggibile, solo statica. */

(function () {
  "use strict";

  var radice = document.documentElement;
  var ridotto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mousePreciso = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var librerie = window.gsap && window.ScrollTrigger && window.SplitText;

  var oggetto = creaOggetto(document.querySelector(".eroe-canvas"));

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
      .from(".eroe-canvas", { opacity: 0, scale: 0.9, duration: 2 }, 0.1);

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

  /* ---------- Hero allo scroll: l'oggetto si chiude in una sfera, il titolo sale ---------- */

  function avviaHeroAlloScroll() {
    ScrollTrigger.create({
      trigger: ".eroe",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: function (self) { oggetto.imposta(self.progress); }
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
          { opacity: 0.16 },
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

      gsap.to(traccia, {
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

      return function () { radice.classList.remove("orizzontale"); };
    });

    mm.add("(max-width: 59.99rem)", function () {
      gsap.utils.toArray(".pannello").forEach(function (pannello) {
        gsap.from(pannello, {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: pannello, start: "top 90%", once: true }
        });
      });
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

  /* ---------- Luce che segue il mouse sui pannelli ---------- */

  function avviaLucePannelli() {
    document.querySelectorAll(".pannello").forEach(function (pannello) {
      pannello.addEventListener("pointermove", function (e) {
        var r = pannello.getBoundingClientRect();
        pannello.style.setProperty("--mx", (e.clientX - r.left) + "px");
        pannello.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Oggetto in fil di ferro (canvas 2D) ----------
     Un toro "a corno" fatto di meridiani attorno a un nucleo: ruota piano, si orienta
     verso il mouse e, mentre scorri oltre l'hero, si chiude in una sfera.
     Sulla griglia tratteggiata una "torcia" segue il cursore. */

  function creaOggetto(canvas) {
    var vuoto = { imposta: function () {} };
    if (!canvas || !canvas.getContext) return vuoto;

    var ctx = canvas.getContext("2d");
    var CHIARO = "236, 236, 236";
    var VIOLA = "183, 156, 255";
    var MERIDIANI = 22;
    var PASSI = 84;

    var larghezza = 0;
    var altezza = 0;
    var mouse = { x: 0.5, y: 0.5, px: -1000, py: -1000, dentro: false };
    var rotazione = { x: -0.45, y: 0.4 };
    var apertura = 1;
    var aperturaObiettivo = 1;
    var raf = 0;
    var inVista = true;

    function ridimensiona() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      larghezza = r.width;
      altezza = r.height;
      canvas.width = Math.round(larghezza * dpr);
      canvas.height = Math.round(altezza * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!raf) disegna(0);
    }

    function griglia(alfa) {
      var passoX = 40;
      var passoY = 160;
      var x0 = (larghezza % passoX) / 2;
      var y0 = (altezza % passoY) / 2;
      ctx.save();
      ctx.strokeStyle = "rgba(" + CHIARO + "," + alfa + ")";
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

      // L'oggetto si orienta dolcemente verso il mouse
      var obiettivoX = -0.45 + (mouse.y - 0.5) * 0.8;
      var obiettivoY = 0.4 + (mouse.x - 0.5) * 1.2;
      rotazione.x += (obiettivoX - rotazione.x) * 0.05;
      rotazione.y += (obiettivoY - rotazione.y) * 0.05;
      apertura += (aperturaObiettivo - apertura) * 0.08;

      // Inclinato, l'oggetto occupa in altezza circa 3,5 volte il raggio del tubo
      var tubo = Math.min(larghezza * 0.16, altezza * 0.22);
      var centro = tubo * apertura;
      var cx = larghezza / 2;
      var cy = altezza / 2;
      var fuoco = tubo * 5;
      var giro = tempo * 0.00013;
      var cosX = Math.cos(rotazione.x);
      var sinX = Math.sin(rotazione.x);
      var cosY = Math.cos(rotazione.y + giro);
      var sinY = Math.sin(rotazione.y + giro);
      var raggioMax = centro + tubo;

      for (var i = 0; i < MERIDIANI; i++) {
        var fi = (i / MERIDIANI) * Math.PI * 2;
        var cosF = Math.cos(fi);
        var sinF = Math.sin(fi);
        var sommaZ = 0;

        ctx.beginPath();
        for (var k = 0; k <= PASSI; k++) {
          var teta = (k / PASSI) * Math.PI * 2;
          var r = centro + tubo * Math.cos(teta);
          var x = r * cosF;
          var y = tubo * Math.sin(teta);
          var z = r * sinF;

          var x1 = x * cosY + z * sinY;
          var z1 = -x * sinY + z * cosY;
          var y2 = y * cosX - z1 * sinX;
          var z2 = y * sinX + z1 * cosX;

          var scala = fuoco / (fuoco + z2);
          var px = cx + x1 * scala;
          var py = cy + y2 * scala;
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          sommaZ += z2;
        }

        // I meridiani in primo piano sono più luminosi di quelli dietro
        var profondita = sommaZ / (PASSI + 1) / raggioMax;
        var alfa = Math.max(0.12, Math.min(0.95, 0.5 - profondita * 0.45));
        if (i === 0) {
          ctx.strokeStyle = "rgba(" + VIOLA + ", 0.95)";
          ctx.lineWidth = 1.6;
        } else {
          ctx.strokeStyle = "rgba(" + CHIARO + "," + alfa.toFixed(3) + ")";
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      }

      // Nucleo
      ctx.fillStyle = "rgb(" + CHIARO + ")";
      ctx.beginPath();
      ctx.arc(cx, cy, tubo * 0.13, 0, Math.PI * 2);
      ctx.fill();
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
    }

    ridimensiona();
    avvia();

    return {
      // progresso 0 = inizio hero, 1 = hero uscito dallo schermo
      imposta: function (progresso) { aperturaObiettivo = 1 - progresso; }
    };
  }
})();
