const Name = document.querySelector('#name');
const Email = document.querySelector('#register-email');
const Senha = document.querySelector('#register-password');
const form = document.querySelector('.auth-form');
const successMessage = document.querySelector('.login-success');
const errorMessage = document.querySelector('.login-error');


const ls = localStorage.getItem('users');
let users = []; 
if(ls){
    users = JSON.parse(ls);
}

form.addEventListener('submit', (event)=>{

    event.preventDefault();
    successMessage.classList.remove('is-visible');
    errorMessage.classList.remove('is-visible');

    if(!Name.value || !Email.value || !Senha.value){
        message.innerHTML = 'Preencha todos os campos';
        return 
    }

    let userExists = false; 
    users.forEach(user =>{
        if(user.username === Name.value || user.email === Email.value){
            userExists = true;
        }
    });

    if(userExists){
       errorMessage.classList.add('is-visible');
        return 
    }

    const newUser = {
        name: Name.value, 
        email: Email.value, 
        senha: Senha.value
    }; 
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users)); 
    
    successMessage.classList.add('is-visible');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
    }); 