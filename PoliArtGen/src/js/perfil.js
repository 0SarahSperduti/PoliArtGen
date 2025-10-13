document.addEventListener("DOMContentLoaded", () => {
    const formDados = document.getElementById("form-dados");
    const formSenha = document.getElementById("form-senha");
    const btnAlterarAvatar = document.getElementById("btn-alterar-avatar");
    const btnExcluirConta = document.getElementById("btn-excluir-conta");
    const logoutBtn = document.querySelector(".logout");

    // === Atualizar dados do perfil ===
    formDados.addEventListener("submit", (e) => {
        e.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();

        if (!nome || !email) {
            alert("Preencha todos os campos antes de salvar!");
            return;
        }

        document.getElementById("perfil-nome").textContent = nome;
        document.getElementById("perfil-email").textContent = email;
        document.getElementById("avatar-inicial").textContent = nome.charAt(0).toUpperCase();

        alert("Informações atualizadas com sucesso!");
    });

    // === Atualizar senha ===
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
            alert("As senhas não coincidem!");
            return;
        }

        if (novaSenha.length < 6) {
            alert("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }

        alert("Senha atualizada com sucesso!");
        formSenha.reset();
    });

    // === Alterar avatar ===
    btnAlterarAvatar.addEventListener("click", () => {
        const novaInicial = prompt("Digite uma nova letra para o avatar:")?.trim().toUpperCase();
        if (novaInicial && novaInicial.length === 1) {
            document.getElementById("avatar-inicial").textContent = novaInicial;
            alert("Avatar atualizado!");
        } else {
            alert("Por favor, insira apenas uma letra.");
        }
    });

    // === Excluir conta ===
    btnExcluirConta.addEventListener("click", () => {
        const confirmar = confirm("Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita!");
        if (confirmar) {
            alert("Conta excluída com sucesso. Redirecionando...");
            window.location.href = "pag_login.html";
        }
    });

    // === Logout ===
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const confirmar = confirm("Deseja realmente sair?");
        if (confirmar) {
            window.location.href = "pag_login.html";
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {

    // --- Seleciona os elementos do modal e dos gatilhos ---
    const modal = document.getElementById('sucesso-modal');
    const modalTitulo = document.getElementById('modal-sucesso-titulo');
    const modalMensagem = document.getElementById('modal-sucesso-mensagem');

    const formDados = document.getElementById('form-dados');
    const formSenha = document.getElementById('form-senha');
    const btnExcluirConta = document.getElementById('btn-excluir-conta');
    const btnAlterarAvatar = document.getElementById('btn-alterar-avatar');

    function mostrarModalSucesso(titulo, mensagem) {
        modalTitulo.textContent = titulo;
        modalMensagem.textContent = mensagem;
        modal.classList.add('visible');
        
        // O temporizador foi REMOVIDO. O modal não fechará sozinho.
    }
    // ... (resto do seu código do perfil.js) ...

// Adiciona um evento para fechar o modal ao clicar no fundo escuro
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        fecharModalSucesso();
    }
});

    function fecharModalSucesso() {
        modal.classList.remove('visible');
    }

    // --- Adiciona os eventos de clique ---

    // 1. Salvar Alterações (dados do perfil)
    if (formDados) {
        formDados.addEventListener('submit', (event) => {
            event.preventDefault(); 
            console.log('Simulando salvamento de dados...');
            
            // MENSAGEM ESPECÍFICA AQUI
            mostrarModalSucesso('Sucesso!', 'Suas alterações foram salvas com sucesso!');
        });
    }

    // 2. Atualizar Senha
    if (formSenha) {
        formSenha.addEventListener('submit', (event) => {
            event.preventDefault();
            console.log('Simulando atualização de senha...');
            
            // MENSAGEM ESPECÍFICA AQUI
            mostrarModalSucesso('Sucesso!', 'Sua senha foi atualizada com sucesso!');
        });
    }

    // 3. Excluir Conta
    if (btnExcluirConta) {
        btnExcluirConta.addEventListener('click', () => {
            const confirmado = confirm('Esta ação é irreversível. Você tem certeza que deseja excluir sua conta?');
            
            if (confirmado) {
                console.log('Simulando exclusão da conta...');
                
                // MENSAGEM ESPECÍFICA AQUI
                mostrarModalSucesso('Conta Excluída', 'Sua conta foi excluída com sucesso!');
            }
        });
    }
    
    // 4. Alterar Avatar
    if (btnAlterarAvatar) {
        btnAlterarAvatar.addEventListener('click', () => {
            console.log('Simulando alteração de avatar...');
            
            // MENSAGEM ESPECÍFICA AQUI
            mostrarModalSucesso('Sucesso!', 'Seu avatar foi alterado com sucesso!');
        });
    }
});

// colocar da pafgina de cadrastro para login
// conectar login com bd e parte de cadrastro tmb 