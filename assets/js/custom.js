document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.kontaktai-forma');
  const resultDiv = document.getElementById('form-result');

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

  // pradžioje mygtukas išjungtas
  submitBtn.disabled = true;

  // ---- pagalbinės funkcijos klaidoms ----
  function showError(input, message) {
    input.classList.add('input-error');
    let error = input.parentElement.querySelector('.field-error');
    if (!error) {
      error = document.createElement('div');
      error.className = 'field-error';
      input.parentElement.appendChild(error);
    }
    error.textContent = message;
  }

  function clearError(input) {
    input.classList.remove('input-error');
    const error = input.parentElement.querySelector('.field-error');
    if (error) error.textContent = '';
  }

  // ---- validacijos funkcijos ----
  function validateName(input) {
    const value = input.value.trim();
    if (!value) {
      showError(input, 'Laukas negali būti tuščias.');
      return false;
    }
    // tik raidės (leidžiu LT raides, tarpus, brūkšnelius)
    const re = /^[A-Za-zÀ-žąčęėįšųūžĄČĘĖĮŠŲŪŽ\s'-]+$/;
    if (!re.test(value)) {
      showError(input, 'Naudok tik raides.');
      return false;
    }
    clearError(input);
    return true;
  }

  function validateEmail(input) {
    const value = input.value.trim();
    if (!value) {
      showError(input, 'Laukas negali būti tuščias.');
      return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value)) {
      showError(input, 'Neteisingas el. pašto formatas.');
      return false;
    }
    clearError(input);
    return true;
  }

  function validateAddress(input) {
    const value = input.value.trim();
    if (!value) {
      showError(input, 'Adresą įvesk kaip tekstą.');
      return false;
    }
    clearError(input);
    return true;
  }

  function validateRating(input) {
    const value = Number(input.value);
    if (Number.isNaN(value) || value < 1 || value > 10) {
      showError(input, 'Skaičius turi būti 1–10.');
      return false;
    }
    clearError(input);
    return true;
  }

  function formatPhone(value) {
    // paliekam tik skaičius
    let digits = value.replace(/\D/g, '');

    // pvz. jei įvedė 8xxxxxxxx, padarom 3706...
    if (digits.startsWith('8') && digits.length === 9) {
      digits = '370' + digits.slice(1);
    }

    // tikimės +370 6xx xxxxx (3706 + 7 skaičiai = 11 skaičių)
    if (digits.length !== 11 || !digits.startsWith('3706')) {
      return null;
    }

    const part1 = digits.slice(0, 3);     // 370
    const part2 = digits.slice(3, 4);     // 6
    const part3 = digits.slice(4, 7);     // xxx
    const part4 = digits.slice(7);        // xxxx

    return `+${part1} ${part2}${part3} ${part4}`;
  }

  function validatePhone(input) {
    const value = input.value.trim();
    if (!value) {
      showError(input, 'Telefono numeris negali būti tuščias.');
      return false;
    }

    const formatted = formatPhone(value);
    if (!formatted) {
      showError(input, 'Numeris turi būti formatu +370 6xx xxxxx.');
      return false;
    }

    input.value = formatted; // įrašom gražų formatą
    clearError(input);
    return true;
  }

  // ---- mygtuko aktyvavimas ----
  function validateAllFields() {
    let ok = true;

    if (!validateName(vardasInput)) ok = false;
    if (!validateName(pavardeInput)) ok = false;
    if (!validateEmail(emailInput)) ok = false;
    if (!validateAddress(adresasInput)) ok = false;
    if (!validateRating(v1Input)) ok = false;
    if (!validateRating(v2Input)) ok = false;
    if (!validateRating(v3Input)) ok = false;
    if (!validatePhone(telefonasInput)) ok = false;

    submitBtn.disabled = !ok;
    return ok;
  }

  // ---- event'ai realaus laiko validacijai ----
  [vardasInput, pavardeInput].forEach(input => {
    input.addEventListener('input', () => {
      validateName(input);
      validateAllFields();
    });
  });

  emailInput.addEventListener('input', () => {
    validateEmail(emailInput);
    validateAllFields();
  });

  adresasInput.addEventListener('input', () => {
    validateAddress(adresasInput);
    validateAllFields();
  });

  [v1Input, v2Input, v3Input].forEach(input => {
    input.addEventListener('input', () => {
      validateRating(input);
      validateAllFields();
    });
  });

  // telefone leidžiam tik skaičius ir + - tarpus
  telefonasInput.addEventListener('input', () => {
    const cleaned = telefonasInput.value.replace(/[^0-9+\-\s]/g, '');
    if (cleaned !== telefonasInput.value) {
      telefonasInput.value = cleaned;
    }
  });

  telefonasInput.addEventListener('blur', () => {
    validatePhone(telefonasInput);
    validateAllFields();
  });

  // ---- formos pateikimas ----
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateAllFields()) {
      alert('Patikrink, ar visi laukai užpildyti teisingai.');
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
      vardas,
      pavarde,
      email,
      telefonas,
      adresas,
      vertinimas1: v1,
      vertinimas2: v2,
      vertinimas3: v3,
      vidurkis: Number(vidurkis)
    };

    console.log(duomenys);

    resultDiv.innerHTML = `
      <p>Vardas: ${vardas}</p>
      <p>Pavardė: ${pavarde}</p>
      <p>El. paštas: ${email}</p>
      <p>Tel. numeris: ${telefonas}</p>
      <p>Adresas: ${adresas}</p>
      <p>Įvertinimai: ${v1}, ${v2}, ${v3}</p>
      <p><strong>${vardas} ${pavarde}: vidurkis ${vidurkis}</strong></p>
    `;

    alert('Duomenys pateikti sėkmingai!');
  });
});

