const usernameInput = document.getElementById('username');
const usernameInfo = document.getElementById('username-info');
const registerForm = document.querySelector('form[action="/signup"]');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const response = await fetch(`/check-username/${usernameInput.value}`);

    if (response.ok) {
        registerForm.submit();
    } else {
        usernameInput.style.borderColor = 'red';
        usernameInput.style.animation = 'shake .5s';
        usernameInput.style.animationIterationCount = 'infinite';
        usernameInfo.innerText = 'Потребителското име е заето';
    }
});

usernameInput.addEventListener('change', async (event) => {
        usernameInput.style.borderColor = 'grey';
        usernameInfo.innerText = '';
});