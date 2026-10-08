// busca os usuários logado no ls
const usuarioLogado = JSON.parse(localStorage.getItem('logged-user'));

if (!usuarioLogado) {
    window.location.href = 'login.html';
}

const emailUsuario = usuarioLogado.email;

// Cada usuário terá suas próprias tarefas
const chaveTarefas = `tarefas-${emailUsuario}`;
const chaveDetalhes = `detalhes-tarefas-${emailUsuario}`;
const chaveConcluidas = `tarefas-concluidas-${emailUsuario}`;

//Carrega as tarefas 
let tarefas = JSON.parse(localStorage.getItem(chaveTarefas)) || [];
let detalhesTarefas = JSON.parse(localStorage.getItem(chaveDetalhes)) || [];
let tarefasConcluidas = JSON.parse(localStorage.getItem(chaveConcluidas)) || [];

let filtroAtual = 'Todas';
let editingIndex = null;

// Seleciona os elemntos do HTML 
const listaTarefas = document.querySelector('.task-list');

const modalTarefa = document.querySelector('#modalTarefa');
const inputTarefa = document.querySelector('#inputTarefa');
const inputDescricao = document.querySelector('#inputDescricao');
const inputCategoria = document.querySelector('#inputCategoria');
const inputPrioridade = document.querySelector('#inputPrioridade');
const inputData = document.querySelector('#inputData');
const inputPrazo = document.querySelector('#inputPrazo');

const btnAdicionar = document.querySelector('#btnAdicionar');
const btnCancelar = document.querySelector('#btnCancelar');
const btnFechar = document.querySelector('#btnFechar');
const btnNovaTarefa = document.querySelector('.add-button');


// Salva as tarefas 
function salvarTarefas() {
    localStorage.setItem(chaveTarefas, JSON.stringify(tarefas));
    localStorage.setItem(chaveDetalhes, JSON.stringify(detalhesTarefas));
    localStorage.setItem(chaveConcluidas, JSON.stringify(tarefasConcluidas));
}


// Funçao para renderizar as tarefas e mostar elas 
function refreshList() {
    listaTarefas.innerHTML = '';

    tarefas.forEach((tarefa, index) => {

        const concluida = Boolean(tarefasConcluidas[index]);

        // Aplicar os filtros
        if (filtroAtual === 'Pendentes' && concluida) {
            return;
        }

        if (filtroAtual === 'Concluídas' && !concluida) {
            return;
        }

        const detalhes = detalhesTarefas[index] || {};

        const li = document.createElement('article');
        li.classList.add('task-item');

        if (concluida) {
            li.classList.add('completed');
        }

        li.innerHTML = `
            <button class="task-check" type="button"
                aria-label="${concluida ? 'Reabrir tarefa' : 'Concluir tarefa'}">
                ${concluida ? '✓' : ''}
            </button>

            <div class="task-content">
                <h3></h3>

                <div class="task-meta">
                    <span>${detalhes.categoria || 'Estudos'}</span>

                    <span class="priority ${detalhes.prioridade || 'medium'}">
                        ${detalhes.prioridadeTexto || 'Média prioridade'}
                    </span>

                    <span>${formatDeadline(detalhes)}</span>
                </div>
            </div>

            <div class="task-actions">
                <button class="task-action edit-button" type="button">
                    Editar
                </button>

                <button class="task-action delete-button" type="button">
                    Excluir
                </button>
            </div>
        `;

        // Colocar o título da tarefa
        li.querySelector('h3').textContent = tarefa;

        // Marcar se a tarefa está concluída
        if (concluida) {
            li.querySelector('.task-check').classList.add('checked');
        }

        listaTarefas.appendChild(li);


        // Concluir ou reabrir a tarefa 
        li.querySelector('.task-check').addEventListener('click', () => {
            tarefasConcluidas[index] = !tarefasConcluidas[index];

            salvarTarefas();
            refreshList();
        });


        //  Editar a tarefa 
        li.querySelector('.edit-button').addEventListener('click', () => {
            openTaskModal(index);
        });


        //Excluir a tarefa 

        li.querySelector('.delete-button').addEventListener('click', () => {

            const confirmar = confirm('Deseja mesmo excluir essa tarefa?');

            if (confirmar) {
                tarefas.splice(index, 1);
                detalhesTarefas.splice(index, 1);
                tarefasConcluidas.splice(index, 1);

                salvarTarefas();
                refreshList();
            }

        });

    });

    updateCounters();
}

// Função para atuzalizar os contadores 
function updateCounters() {

    const total = tarefas.length;

    let concluidas = 0;

    tarefasConcluidas.forEach(concluida => {
        if (concluida) {
            concluidas++;
        }
    });

    const pendentes = total - concluidas;

    const counters = document.querySelectorAll('.stat-card strong');
    const filterCounters = document.querySelectorAll('.filter span');

    counters[0].textContent = total;
    counters[1].textContent = pendentes;
    counters[2].textContent = concluidas;

    filterCounters[0].textContent = total;
    filterCounters[1].textContent = pendentes;
    filterCounters[2].textContent = concluidas;
}

// Função para formatar data e prazo 
function formatDeadline(detalhes) {

    if (!detalhes.data) {
        return 'Sem prazo';
    }

    const data = new Date(detalhes.data + 'T00:00:00');
    const dataFormatada = data.toLocaleDateString('pt-BR');

    if (detalhes.prazo) {
        return dataFormatada + ', ' + detalhes.prazo;
    }

    return dataFormatada;
}

// Função para adicionar ou ediatr tarefa 
function registerTask() {

    const titulo = inputTarefa.value.trim();

    // Não permitir tarefa sem título
    if (!titulo) {
        inputTarefa.focus();
        return;
    }

    const prioridadeTexto =
        inputPrioridade.options[inputPrioridade.selectedIndex].text;

    const detalhes = {
        descricao: inputDescricao.value.trim(),
        categoria: inputCategoria.value,
        prioridade: inputPrioridade.value,
        prioridadeTexto: prioridadeTexto,
        data: inputData.value,
        prazo: inputPrazo.value
    };


    if (editingIndex === null) {

        // Criar uma nova tarefa
        tarefas.push(titulo);
        detalhesTarefas.push(detalhes);
        tarefasConcluidas.push(false);

    } else {

        // Atualizar uma tarefa existente
        tarefas[editingIndex] = titulo;
        detalhesTarefas[editingIndex] = detalhes;

    }

    salvarTarefas();
    refreshList();
    closeTaskModal();
}

// Função para abrir a modal de nova tarefa 
function openTaskModal(index = null) {

    editingIndex = index;

    let detalhes = {};

    if (index !== null) {
        detalhes = detalhesTarefas[index] || {};
    }

    // Preencher os campos
    inputTarefa.value = index === null ? '' : tarefas[index];
    inputDescricao.value = detalhes.descricao || '';
    inputCategoria.value = detalhes.categoria || 'Estudos';
    inputPrioridade.value = detalhes.prioridade || 'medium';
    inputData.value = detalhes.data || '';
    inputPrazo.value = detalhes.prazo || '';

    // Alterar o título e o botão
    if (index === null) {
        document.querySelector('#modal-title').textContent = 'Nova tarefa';
        btnAdicionar.textContent = 'Adicionar tarefa';
    } else {
        document.querySelector('#modal-title').textContent = 'Editar tarefa';
        btnAdicionar.textContent = 'Salvar alterações';
    }

    modalTarefa.classList.add('active');
    inputTarefa.focus();
}

// Função para fechar a modal 

function closeTaskModal() {

    modalTarefa.classList.remove('active');

    inputTarefa.value = '';
    inputDescricao.value = '';
    inputCategoria.value = 'Estudos';
    inputPrioridade.value = 'medium';
    inputData.value = '';
    inputPrazo.value = '';

    editingIndex = null;

    document.querySelector('#modal-title').textContent = 'Nova tarefa';
    btnAdicionar.textContent = 'Adicionar tarefa';
}


// Botões da modal 

// Abrir para criar tarefa
btnNovaTarefa.addEventListener('click', () => {
    openTaskModal();
});

// Salvar tarefa
btnAdicionar.addEventListener('click', registerTask);

// Cancelar
btnCancelar.addEventListener('click', closeTaskModal);

// Fechar no botão X
btnFechar.addEventListener('click', closeTaskModal);


// Filtar tarefas 

document.querySelectorAll('.filter').forEach(button => {

    button.addEventListener('click', () => {

        filtroAtual = button.firstChild.textContent.trim();

        document.querySelectorAll('.filter').forEach(filtro => {
            filtro.classList.toggle('active', filtro === button);
        });

        refreshList();
    });

});

// logout do usuário 
const btnLogout = document.querySelector('.logout-button');

btnLogout.addEventListener('click', event => {

    event.preventDefault();

    localStorage.removeItem('logged-user');

    window.location.href = 'login.html';
});


refreshList();

//Mostrar o nome do usuario que foi logado 

const nomeUsuario = usuarioLogado.name;

const elementoNome = document.querySelector('#nomeUsuario');

if (elementoNome) {
    elementoNome.textContent = nomeUsuario;
}

//Mostrar a data atual 

const elementoData = document.querySelector('#dataAtual');

if (elementoData) {
    const hoje = new Date();

    elementoData.textContent = hoje.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}