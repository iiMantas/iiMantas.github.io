(() => {
  const byId = (id) => document.getElementById(id);

  /* =========================
     HELPERS
     ========================= */
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  }

  function uid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `u-${Math.random().toString(16).slice(2)}`;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* =========================
     CONTACT FORM (validacija + output)
     ========================= */
  function initContactForm() {
    const form = byId("contact-form") || document.querySelector(".kontaktai-forma");
    const resultDiv = byId("form-result");
    if (!form || !resultDiv) return;

    const vardasInput = form.querySelector('input[name="vardas"]');
    const pavardeInput = form.querySelector('input[name="pavarde"]');
    const emailInput = form.querySelector('input[name="email"]');
    const telefonasInput = form.querySelector('input[name="telefonas"]');
    const adresasInput = form.querySelector('input[name="adresas"]');
    const v1Input = form.querySelector('input[name="vertinimas1"]');
    const v2Input = form.querySelector('input[name="vertinimas2"]');
    const v3Input = form.querySelector('input[name="vertinimas3"]');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!vardasInput || !pavardeInput || !emailInput || !telefonasInput || !adresasInput || !v1Input || !v2Input || !v3Input || !submitBtn) {
      return;
    }

    submitBtn.disabled = true;

    function showError(input, message) {
      input.classList.add("input-error");
      let error = input.parentElement.querySelector(".field-error");
      if (!error) {
        error = document.createElement("div");
        error.className = "field-error";
        input.parentElement.appendChild(error);
      }
      error.textContent = message;
    }

    function clearError(input) {
      input.classList.remove("input-error");
      const error = input.parentElement.querySelector(".field-error");
      if (error) error.textContent = "";
    }

    function validateName(input) {
      const value = input.value.trim();
      if (!value) {
        showError(input, "Laukas negali būti tuščias.");
        return false;
      }
      const re = /^[A-Za-zÀ-žąčęėįšųūžĄČĘĖĮŠŲŪŽ\s'-]+$/;
      if (!re.test(value)) {
        showError(input, "Naudok tik raides.");
        return false;
      }
      clearError(input);
      return true;
    }

    function validateEmail(input) {
      const value = input.value.trim();
      if (!value) {
        showError(input, "Laukas negali būti tuščias.");
        return false;
      }
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(value)) {
        showError(input, "Neteisingas el. pašto formatas.");
        return false;
      }
      clearError(input);
      return true;
    }

    function validateAddress(input) {
      const value = input.value.trim();
      if (!value) {
        showError(input, "Adresą įvesk kaip tekstą.");
        return false;
      }
      clearError(input);
      return true;
    }

    function validateRating(input) {
      const value = Number(input.value);
      if (!Number.isFinite(value) || value < 1 || value > 10) {
        showError(input, "Skaičius turi būti 1–10.");
        return false;
      }
      clearError(input);
      return true;
    }

    function normalizePhoneDigits(value) {
      let digits = value.replace(/\D/g, "");
      if (digits.startsWith("8") && digits.length === 9) {
        digits = "370" + digits.slice(1); // 8xxxxxxx -> 3706xxxxxxx
      }
      return digits;
    }

    function formatLtPhone(digits) {
      if (digits.length !== 11 || !digits.startsWith("3706")) return null;
      const p1 = digits.slice(0, 3); // 370
      const p2 = digits.slice(3, 4); // 6
      const p3 = digits.slice(4, 7); // xxx
      const p4 = digits.slice(7);    // xxxx
      return `+${p1} ${p2}${p3} ${p4}`;
    }

    function validatePhoneSoft(input) {
      const value = input.value.trim();
      if (!value) {
        showError(input, "Telefono numeris negali būti tuščias.");
        return false;
      }
      const digits = normalizePhoneDigits(value);
      if (!digits.startsWith("370") && !digits.startsWith("8")) {
        showError(input, "Numeris turi prasidėti +370... arba 8...");
        return false;
      }
      clearError(input);
      return true;
    }

    function validatePhoneStrict(input) {
      const value = input.value.trim();
      if (!value) {
        showError(input, "Telefono numeris negali būti tuščias.");
        return false;
      }
      const digits = normalizePhoneDigits(value);
      const formatted = formatLtPhone(digits);
      if (!formatted) {
        showError(input, "Numeris turi būti +370 6xx xxxxx (arba 8xxxxxxxx).");
        return false;
      }
      input.value = formatted;
      clearError(input);
      return true;
    }

    function validateAllFields(whenSubmit = false) {
      let ok = true;

      if (!validateName(vardasInput)) ok = false;
      if (!validateName(pavardeInput)) ok = false;
      if (!validateEmail(emailInput)) ok = false;
      if (!validateAddress(adresasInput)) ok = false;
      if (!validateRating(v1Input)) ok = false;
      if (!validateRating(v2Input)) ok = false;
      if (!validateRating(v3Input)) ok = false;

      if (whenSubmit) {
        if (!validatePhoneStrict(telefonasInput)) ok = false;
      } else {
        if (!validatePhoneSoft(telefonasInput)) ok = false;
      }

      submitBtn.disabled = !ok;
      return ok;
    }

    [vardasInput, pavardeInput].forEach((input) => {
      input.addEventListener("input", () => {
        validateName(input);
        validateAllFields(false);
      });
    });

    emailInput.addEventListener("input", () => {
      validateEmail(emailInput);
      validateAllFields(false);
    });

    adresasInput.addEventListener("input", () => {
      validateAddress(adresasInput);
      validateAllFields(false);
    });

    [v1Input, v2Input, v3Input].forEach((input) => {
      input.addEventListener("input", () => {
        validateRating(input);
        validateAllFields(false);
      });
    });

    telefonasInput.addEventListener("input", () => {
      const cleaned = telefonasInput.value.replace(/[^0-9+\-\s]/g, "");
      if (cleaned !== telefonasInput.value) telefonasInput.value = cleaned;
      validatePhoneSoft(telefonasInput);
      validateAllFields(false);
    });

    telefonasInput.addEventListener("blur", () => {
      validatePhoneStrict(telefonasInput);
      validateAllFields(false);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!validateAllFields(true)) {
        resultDiv.innerHTML = `<strong>Klaida:</strong> Patikrink laukus.`;
        resultDiv.classList.add("show");
        return;
      }

      const vardas = vardasInput.value.trim();
      const pavarde = pavardeInput.value.trim();
      const email = emailInput.value.trim();
      const telefonas = telefonasInput.value.trim();
      const adresas = adresasInput.value.trim();

      const v1 = Number(v1Input.value);
      const v2 = Number(v2Input.value);
      const v3 = Number(v3Input.value);
      const vidurkis = ((v1 + v2 + v3) / 3).toFixed(1);

      const duomenys = {
        vardas, pavarde, email, telefonas, adresas,
        vertinimas1: v1, vertinimas2: v2, vertinimas3: v3,
        vidurkis: Number(vidurkis)
      };

      console.log("Kontaktų forma:", duomenys);

      resultDiv.innerHTML = `
        <p>Vardas: ${escapeHtml(vardas)}</p>
        <p>Pavardė: ${escapeHtml(pavarde)}</p>
        <p>El. paštas: ${escapeHtml(email)}</p>
        <p>Tel. numeris: ${escapeHtml(telefonas)}</p>
        <p>Adresas: ${escapeHtml(adresas)}</p>
        <p>Įvertinimai: ${v1}, ${v2}, ${v3}</p>
        <p><strong>${escapeHtml(vardas)} ${escapeHtml(pavarde)}: vidurkis ${vidurkis}</strong></p>
      `;
      resultDiv.classList.add("show");
    });

    validateAllFields(false);
  }

  /* =========================
     MEMORY GAME (+ localStorage best + timer)
     ========================= */
  function initMemoryGame() {
    const board = byId("mg-board");
    if (!board) return;

    const ICONS = [
      { id: "motor",   label: "Variklis",   icon: "bi-gear-wide-connected" },
      { id: "drive",   label: "Pavara",     icon: "bi-speedometer2" },
      { id: "sensor",  label: "Sensorius",  icon: "bi-broadcast" },
      { id: "tool",    label: "Įrankiai",   icon: "bi-wrench-adjustable" },
      { id: "bolt",    label: "Energija",   icon: "bi-lightning-charge" },
      { id: "code",    label: "Kodas",      icon: "bi-code-slash" },
      { id: "chart",   label: "Grafikai",   icon: "bi-graph-up" },
      { id: "shield",  label: "Apsauga",    icon: "bi-shield-check" },
      { id: "cpu",     label: "Valdiklis",  icon: "bi-cpu" },
      { id: "box",     label: "Spinta",     icon: "bi-box-seam" },
      { id: "plug",    label: "Jungtis",    icon: "bi-plug" },
      { id: "robot",   label: "Automatika", icon: "bi-robot" }
    ];

    const LEVELS = {
      easy: { cols: 4, rows: 3, pairs: 6 },
      hard: { cols: 6, rows: 4, pairs: 12 }
    };

    const LS_KEY = {
      easy: "mg_best_easy",
      hard: "mg_best_hard"
    };

    let deck = [];
    let first = null;
    let second = null;
    let lock = false;

    let moves = 0;
    let matches = 0;
    let totalPairs = 0;

    let started = false;
    let timerId = null;
    let startTs = 0;
    let elapsedMs = 0;

    const startBtn = byId("mg-start");
    const resetBtn = byId("mg-reset");

    // stat elementai geriausiems rezultatams (jei jų nėra HTML – susikuriam)
    const statsWrap = document.querySelector(".memory-game .stats");
    let bestEasyEl = byId("mg-best-easy");
    let bestHardEl = byId("mg-best-hard");

    function ensureBestUI() {
      if (!statsWrap) return;

      if (!bestEasyEl) {
        const div = document.createElement("div");
        div.className = "stat";
        div.innerHTML = `<span class="value" id="mg-best-easy">–</span><span class="label">Geriausias (easy)</span>`;
        statsWrap.appendChild(div);
        bestEasyEl = byId("mg-best-easy");
      }

      if (!bestHardEl) {
        const div = document.createElement("div");
        div.className = "stat";
        div.innerHTML = `<span class="value" id="mg-best-hard">–</span><span class="label">Geriausias (hard)</span>`;
        statsWrap.appendChild(div);
        bestHardEl = byId("mg-best-hard");
      }
    }

    function selectedDifficulty() {
      const r = document.querySelector('input[name="mg-difficulty"]:checked');
      return r ? r.value : "easy";
    }

    function stopTimer() {
      if (timerId) clearInterval(timerId);
      timerId = null;
    }

    function setMessage(text) {
      const box = byId("mg-message");
      if (!box) return;

      if (!text) {
        box.classList.remove("show");
        box.textContent = "";
        return;
      }
      box.textContent = text;
      box.classList.add("show");
    }

    function updateStats() {
      const mv = byId("mg-moves");
      const mt = byId("mg-matches");
      if (mv) mv.textContent = String(moves);
      if (mt) mt.textContent = String(matches);
    }

    function buildDeck(pairs) {
      const chosen = ICONS.slice(0, pairs);
      const d = [];
      for (const item of chosen) {
        d.push({ ...item, uid: uid() });
        d.push({ ...item, uid: uid() });
      }
      return shuffle(d);
    }

    function renderBoard() {
      const cfg = LEVELS[selectedDifficulty()];
      totalPairs = cfg.pairs;

      board.style.gridTemplateColumns = `repeat(${cfg.cols}, minmax(0, 1fr))`;
      board.innerHTML = "";

      for (const card of deck) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "memory-card";
        btn.dataset.key = card.id;
        btn.dataset.uid = card.uid;
        btn.setAttribute("aria-label", "Kortelė");

        btn.innerHTML = `
          <div class="card-inner">
            <div class="card-face card-front">
              <i class="bi bi-question-lg" aria-hidden="true"></i>
            </div>
            <div class="card-face card-back">
              <i class="bi ${card.icon}" aria-hidden="true"></i>
              <span>${card.label}</span>
            </div>
          </div>
        `;

        btn.addEventListener("click", onCardClick);
        board.appendChild(btn);
      }
    }

    /* ===== localStorage best ===== */
    function readBest(level) {
      try {
        const raw = localStorage.getItem(LS_KEY[level]);
        if (!raw) return null;
        const obj = JSON.parse(raw);
        if (!obj || typeof obj.moves !== "number") return null;
        return obj; // {moves, timeMs}
      } catch {
        return null;
      }
    }

    function writeBest(level, bestObj) {
      try {
        localStorage.setItem(LS_KEY[level], JSON.stringify(bestObj));
      } catch {
        // ignore
      }
    }

    function bestText(bestObj) {
      if (!bestObj) return "–";
      const t = typeof bestObj.timeMs === "number" ? formatTime(bestObj.timeMs) : "–";
      return `${bestObj.moves} ėj. / ${t}`;
    }

    function updateBestUI() {
      const be = readBest("easy");
      const bh = readBest("hard");
      if (bestEasyEl) bestEasyEl.textContent = bestText(be);
      if (bestHardEl) bestHardEl.textContent = bestText(bh);
    }

    function isBetterResult(newRes, oldRes) {
      // pagal užduotį: mažiausi ėjimai, lygiems ėjimams – mažesnis laikas
      if (!oldRes) return true;
      if (newRes.moves < oldRes.moves) return true;
      if (newRes.moves > oldRes.moves) return false;

      const newT = typeof newRes.timeMs === "number" ? newRes.timeMs : Number.MAX_SAFE_INTEGER;
      const oldT = typeof oldRes.timeMs === "number" ? oldRes.timeMs : Number.MAX_SAFE_INTEGER;
      return newT < oldT;
    }

    /* ===== Game lifecycle ===== */
    function prepareBoard() {
      stopTimer();
      started = false;

      moves = 0;
      matches = 0;
      first = null;
      second = null;
      lock = false;

      elapsedMs = 0;

      const cfg = LEVELS[selectedDifficulty()];
      deck = buildDeck(cfg.pairs);
      renderBoard();

      const timeEl = byId("mg-time");
      if (timeEl) timeEl.textContent = "0:00";

      updateStats();
      setMessage('Pasirinkite sunkumą ir spauskite „Start“.');
    }

    function startGame() {
      // Start visada pradeda naują žaidimą ir laikmatį (pagal reikalavimą)
      prepareBoard();

      started = true;
      setMessage("");

      startTs = Date.now();
      timerId = setInterval(() => {
        elapsedMs = Date.now() - startTs;
        const timeEl = byId("mg-time");
        if (timeEl) timeEl.textContent = formatTime(elapsedMs);
      }, 250);
    }

    function flip(cardEl) { cardEl.classList.add("flipped"); }
    function unflip(cardEl) { cardEl.classList.remove("flipped"); }

    function markMatched(cardEl) {
      cardEl.classList.add("matched");
      cardEl.disabled = true;
    }

    function resetTurn() {
      first = null;
      second = null;
      lock = false;
    }

    function onCardClick(e) {
      if (!started) return;
      if (lock) return;

      const card = e.currentTarget;
      if (card.classList.contains("flipped")) return;
      if (card.classList.contains("matched")) return;

      flip(card);

      if (!first) {
        first = card;
        return;
      }

      second = card;
      moves += 1;
      updateStats();
      lock = true;

      const isMatch = first.dataset.key === second.dataset.key;

      if (isMatch) {
        setTimeout(() => {
          markMatched(first);
          markMatched(second);

          matches += 1;
          updateStats();
          resetTurn();

          if (matches === totalPairs) {
            // laimėta -> stabdom laikmatį
            stopTimer();
            started = false;

            const level = selectedDifficulty();
            const result = { moves, timeMs: elapsedMs };

            const prevBest = readBest(level);
            let msg = `Laimėjote! Ėjimai: ${moves}, laikas: ${formatTime(elapsedMs)}.`;

            if (isBetterResult(result, prevBest)) {
              writeBest(level, result);
              updateBestUI();
              msg += " 🎉 Naujas geriausias rezultatas!";
            }

            setMessage(msg);
          }
        }, 350);
      } else {
        setTimeout(() => {
          unflip(first);
          unflip(second);
          resetTurn();
        }, 850);
      }
    }

    // init UI
    ensureBestUI();
    updateBestUI();

    // events
    if (startBtn) startBtn.addEventListener("click", startGame);
    if (resetBtn) resetBtn.addEventListener("click", prepareBoard);

    document.querySelectorAll('input[name="mg-difficulty"]').forEach((r) => {
      r.addEventListener("change", prepareBoard);
    });

    // pirmas užkrovimas
    prepareBoard();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initContactForm();
    initMemoryGame();
  });
})();
