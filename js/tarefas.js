const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
if (!usuarioLogado) {
  window.location.href = 'login.html';
}

const tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];

const listaTarefas = document.querySelector('#lista-tarefas');
const formTarefa = document.querySelector('#form-tarefa');
const inputTarefa = document.querySelector('#input-tarefa');

function refreshList() {
    listaTarefas.innerHTML = '';
    tarefas.forEach((tarefa, index) => {
        const li = document.createElement('li');
        li.textContent = tarefa;
        listaTarefas.appendChild(li);

        const btnExluir = li.querySelector('.task-action delete-button');
        btnExluir.addEventListener('click', ()=>{
            tarefas.splice(index, 1);
            localStorage.setItem('tarefas', JSON.stringify(tarefas));
            refreshList();
        })
    });
}