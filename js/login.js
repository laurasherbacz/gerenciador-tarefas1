const email = document.querySelector('#email'); 
const password = document.querySelector('#password');
const form = document.querySelector('.auth-form');
const successMessage = document.querySelector('.login-success');
const errorMessage = document.querySelector('.login-error');

const ls = localStorage.getItem('users');

let users = []; 
if(ls){
    users = JSON.parse(ls); 
}

form.addEventListener('submit', (event) => {
	event.preventDefault();
    successMessage.classList.remove('is-visible');
    errorMessage.classList.remove('is-visible');

    const loggedUser = users.find(user =>
        user.email === email.value && user.senha === password.value
    );

    successMessage.classList.remove('is-visible');
    errorMessage.classList.remove('is-visible');

    if (!loggedUser) {
        errorMessage.classList.add('is-visible');
        return;
    }

    localStorage.setItem('logged-user', JSON.stringify(loggedUser));
    successMessage.classList.add('is-visible');
    setTimeout(() => {
        window.location.href = 'tarefas.html';
    }, 1500);

});