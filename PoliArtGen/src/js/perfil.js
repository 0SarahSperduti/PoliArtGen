const USER_ID = localStorage.getItem('userId');

document.addEventListener('DOMContentLoaded', () => {
    // 1. Elementos principais do DOM
    const perfilContainer = document.getElementById('perfil-article');
    const formDados = document.getElementById("form-dados");
    const formSenha = document.getElementById("form-senha");
    const logoutBtn = document.querySelector(".logout");

    // --- Chamada Inicial: Carregar Dados do Perfil ---
    if (USER_ID) {
        fetchDadosPerfil(USER_ID, perfilContainer);
    } else {
        perfilContainer.innerHTML = '<p class="alert alert-warning">Você não está logado. Redirecionando...</p>';
        setTimeout(() => { window.location.href = 'pag_login.html'; }, 1000);
    }



    // Lógica de alterção de dados (Nome/Email) 

    if (formDados) {
        formDados.addEventListener("submit", (e) => {
            e.preventDefault();

            const nome = document.getElementById("nome").value.trim();
            const email = document.getElementById("email").value.trim();
            
            if (!nome || !email) {
                alert("Preencha todos os campos antes de salvar!");
                return;
            }

            const dadosUpdate = { userId: USER_ID, nome, email };
            
            // Chama a rota de atualização de dados
            fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosUpdate)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Informações atualizadas com sucesso!');
                    // Atualiza a tela com os novos dados (sem recarregar)
                    renderizarDados(data.user);
                } else {
                    alert(`Falha ao atualizar: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Erro de Comunicação:', error);
                alert('Falha na comunicação com o servidor.');
            });
        });
    }


    // Lógica de alteração de senha

    if (formSenha) {
        formSenha.addEventListener("submit", (e) => {
            e.preventDefault();

            const senhaAtual = document.getElementById("senha-atual").value.trim();
            const novaSenha = document.getElementById("nova-senha").value.trim();
            const confirmaSenha = document.getElementById("confirma-senha").value.trim();

            if (!senhaAtual || !novaSenha || !confirmaSenha) {
                alert("Por favor, preencha todos os campos de senha.");
                return;
            }

            if (novaSenha !== confirmaSenha) {
                alert("As novas senhas não coincidem!");
                return;
            }

            if (novaSenha.length < 6) {
                alert("A nova senha deve ter pelo menos 6 caracteres.");
                return;
            }

            const dadosSenha = { userId: USER_ID, senhaAtual, novaSenha };

            // Chama a rota de atualização de senha
            fetch('/api/password/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosSenha)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Senha alterada com sucesso!');
                    formSenha.reset(); // Limpa os campos do formulário
                } else {
                    alert(`Falha ao atualizar: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Erro de Comunicação:', error);
                alert('Falha na comunicação com o servidor.');
            });
        });
    }

    // Lógica de Logout
    
    // Logout (Remoção dos dados de sessão)
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const confirmar = confirm("Deseja realmente sair?");
            if (confirmar) {
                localStorage.removeItem('userId'); 
                localStorage.removeItem('userTipo'); 
                window.location.href = "pag_login.html"; 
            }
        });
    }    
});


// Funções de Busca


// Função que carrega os dados do backend no carregamento da página
async function fetchDadosPerfil(userId, container) {
    try {
        const response = await fetch(`/api/profile/${userId}`);
        const data = await response.json();

        if (data.success && data.user) {
            renderizarDados(data.user); // Chama a função que preenche a tela
        } else {
            container.innerHTML = `<p class="text-danger">Erro: ${data.message || 'Falha ao carregar dados.'}</p>`;
        }
    } catch (error) {
        console.error('Erro de Comunicação:', error);
        container.innerHTML = `<p class="text-danger">Falha na comunicação com o servidor.</p>`;
    }
}

// Função que preenche os elementos HTML com os dados
function renderizarDados(user) {
    const dataCadastro = new Date(user.dataCriacao).toLocaleDateString('pt-BR');
    const inicial = user.nome.charAt(0).toUpperCase();

    // Preenche o Avatar e a Info
    document.getElementById("avatar-inicial").textContent = inicial;
    document.getElementById("perfil-nome").textContent = user.nome;
    document.getElementById("perfil-email").textContent = user.email;

    // Preenche os inputs dos formulários
    document.getElementById("nome").value = user.nome;
    document.getElementById("email").value = user.email;
    
    // Adiciona o tipo de usuário (opcional, dependendo do seu HTML)
    const infoContainer = document.getElementById("perfil-article");
    if (infoContainer) {
         let tipoElement = document.getElementById('perfil-tipo-usuario');
         if (!tipoElement) {
            tipoElement = document.createElement('p');
            tipoElement.id = 'perfil-tipo-usuario';
            infoContainer.prepend(tipoElement); 
         }
         tipoElement.innerHTML = `<strong>Tipo:</strong> <span class="badge bg-primary">${user.userTipo.toUpperCase()}</span>`;
    }
}