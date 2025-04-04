const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

function store(key, value) {
  localStorage.setItem(key, value);
}

function retrieve(key) {
  return localStorage.getItem(key);
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSHA256Hash() {
  let cachedHash = retrieve('sha256');
  let cachedNumber = retrieve('originalNumber');

  if (cachedHash && cachedNumber) {
    return { hash: cachedHash, number: cachedNumber };
  }

  const originalNumber = getRandomNumber(MIN, MAX).toString().padStart(3, '0');
  const hash = await sha256(originalNumber);

  store('sha256', hash);
  store('originalNumber', originalNumber);

  return { hash, number: originalNumber };
}

async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const { hash } = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

async function test() {
  const pin = pinInput.value.trim();
  if (!pin) {
    resultView.innerHTML = '⚠️ 3-digit PIN is required';
    resultView.classList.remove('hidden');
    return;
  }

  if (pin.length !== 3 || isNaN(pin)) {
    resultView.innerHTML = '💡 Enter a valid 3-digit number';
    resultView.classList.remove('hidden');
    return;
  }

  const { number } = await getSHA256Hash();
  const hashedPin = await sha256(pin);

  if (hashedPin === sha256HashView.innerHTML) {
    resultView.innerHTML = '🎉 Success! You guessed correctly!';
    resultView.classList.add('success');
  } else {
    const hint = pin < number ? 'Try a higher number ⬆️' : 'Try a lower number ⬇️';
    resultView.innerHTML = `❌ Wrong guess. ${hint}`;
  }
  resultView.classList.remove('hidden');
}

pinInput.addEventListener('input', (e) => {
  pinInput.value = e.target.value.replace(/\D/g, '').slice(0, 3);
});

document.getElementById('check').addEventListener('click', test);

main();