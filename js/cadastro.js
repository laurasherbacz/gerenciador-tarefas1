const Name = document.querySelector('#nome');
const Email = document.querySelector('#register-email');
const Senha = document.querySelector('#register-password');
const button = document.querySelector('.button button-primary'); 
const message = document.querySelector('#message');

const ls = localStorage.getItem('users');
let users = []; 
if(ls){
    JSON.parse(ls);
}

button.addEventListener('click', ()=>{
    
})