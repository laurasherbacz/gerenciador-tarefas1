const usuarioLogado = JSON.parse(localStorage.getItem('logged-user'));
if (!usuarioLogado) {
  window.location.href = 'login.html';
}

let tarefas = (JSON.parse(localStorage.getItem('tarefas')) || [])
    .map(tarefa => typeof tarefa === 'string' ? tarefa : tarefa.title)
    .filter(Boolean);

let detalhesTarefas = JSON.parse(localStorage.getItem('detalhes-tarefas')) || [];
let tarefasConcluidas = JSON.parse(localStorage.getItem('tarefas-concluidas')) || [];
let filtroAtual = 'Todas';

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
let editingIndex = null;

function refreshList() {
    listaTarefas.innerHTML = '';
    tarefas.forEach((tarefa, index) => {
        const concluida = Boolean(tarefasConcluidas[index]);
        if (filtroAtual === 'Pendentes' && concluida
            || filtroAtual === 'Concluídas' && !concluida) {
            return;
        }

        const detalhes = detalhesTarefas[index] || {};
        const li = document.createElement('article');
       
        li.classList.add('task-item');
       
        if (concluida) li.classList.add('completed');
        li.innerHTML = `
            <button class="task-check${concluida ? ' checked' : ''}" type="button"
                aria-label="${concluida ? 'Reabrir tarefa' : 'Concluir tarefa'}">${concluida ? '✓' : ''}</button>

            <div class="task-content">
                <h3></h3>

                <div class="task-meta">
                    <span>${detalhes.categoria || 'Estudos'}</span>
                    <span class="priority ${detalhes.prioridade || 'medium'}">${detalhes.prioridadeTexto || 'Média prioridade'}</span>
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
        li.querySelector('h3').textContent = tarefa;
        listaTarefas.appendChild(li);

        const btnExluir = li.querySelector('.delete-button');
        btnExluir.addEventListener('click', ()=>{
            const confirmar = confirm ('Deseja mesmo excluir essa tarefa?')

            if(confirmar){
            tarefas.splice(index, 1);
            detalhesTarefas.splice(index, 1);
            tarefasConcluidas.splice(index, 1);
            localStorage.setItem('tarefas', JSON.stringify(tarefas));
            localStorage.setItem('detalhes-tarefas', JSON.stringify(detalhesTarefas));
            localStorage.setItem('tarefas-concluidas', JSON.stringify(tarefasConcluidas));
            }
            refreshList();
        })

        li.querySelector('.edit-button').addEventListener('click', () => {
            openTaskModal(index);
        });

        li.querySelector('.task-check').addEventListener('click', () => {
            tarefasConcluidas[index] = !tarefasConcluidas[index];
            localStorage.setItem('tarefas-concluidas', JSON.stringify(tarefasConcluidas));
            refreshList();
        });
    });

    updateCounters();
}

function updateCounters() {
    const total = tarefas.length;
    const concluidas = tarefas.filter((_, index) => Boolean(tarefasConcluidas[index])).length;
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

function formatDeadline(detalhes) {
    if (!detalhes.data) return 'Sem prazo';

    const date = new Date(`${detalhes.data}T00:00:00`);
    const formattedDate = date.toLocaleDateString('pt-BR');
    return detalhes.prazo ? `${formattedDate}, ${detalhes.prazo}` : formattedDate;
}

function registerTask() {
    const title = inputTarefa.value.trim();

    if (!title) {
        inputTarefa.focus();
        return;
    }

    const prioridadeTexto = inputPrioridade.options[inputPrioridade.selectedIndex].text;
    const detalhes = {
        descricao: inputDescricao.value.trim(),
        categoria: inputCategoria.value,
        prioridade: inputPrioridade.value,
        prioridadeTexto,
        data: inputData.value,
        prazo: inputPrazo.value
    };

    if (editingIndex === null) {
        tarefas.push(title);
        detalhesTarefas.push(detalhes);
        tarefasConcluidas.push(false);
    } else {
        tarefas[editingIndex] = title;
        detalhesTarefas[editingIndex] = detalhes;
    }

    localStorage.setItem('tarefas', JSON.stringify(tarefas));
    localStorage.setItem('detalhes-tarefas', JSON.stringify(detalhesTarefas));
    localStorage.setItem('tarefas-concluidas', JSON.stringify(tarefasConcluidas));
    refreshList();
    closeTaskModal();
}

const btnNovaTarefa = document.querySelector('.add-button');

btnNovaTarefa.addEventListener('click', () => {
    openTaskModal();
}); 

btnAdicionar.addEventListener('click', registerTask);

function openTaskModal(index = null) {
    editingIndex = index;
    const detalhes = index === null ? {} : (detalhesTarefas[index] || {});

    inputTarefa.value = index === null ? '' : tarefas[index];
    inputDescricao.value = detalhes.descricao || '';
    inputCategoria.value = detalhes.categoria || 'Estudos';
    inputPrioridade.value = detalhes.prioridade || 'medium';
    inputData.value = detalhes.data || '';
    inputPrazo.value = detalhes.prazo || '';
    document.querySelector('#modal-title').textContent = index === null ? 'Nova tarefa' : 'Editar tarefa';
    btnAdicionar.textContent = index === null ? 'Adicionar tarefa' : 'Salvar alterações';
    modalTarefa.classList.remove('active');
    modalTarefa.classList.add('active');
    inputTarefa.focus();
}

function closeTaskModal() {
    modalTarefa.classList.remove('active');
    inputTarefa.value = '';
    inputDescricao.value = '';
    inputData.value = '';
    inputPrazo.value = '';
    editingIndex = null;
    document.querySelector('#modal-title').textContent = 'Nova tarefa';
    btnAdicionar.textContent = 'Adicionar tarefa';
}

btnCancelar.addEventListener('click', closeTaskModal);
btnFechar.addEventListener('click', closeTaskModal);

document.querySelectorAll('.filter').forEach(button => {
    button.addEventListener('click', () => {
        filtroAtual = button.firstChild.textContent.trim();
        document.querySelectorAll('.filter').forEach(filter => {
            filter.classList.toggle('active', filter === button);
        });
        refreshList();
    });
});

refreshList();


// Fazer funcionar logout, aparecer o nome certo que foi colocado no cadastro


// Fazer funcionar data quando entra na página 

//Página só para categorias, talvez? 