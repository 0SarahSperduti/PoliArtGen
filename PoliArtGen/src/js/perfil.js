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

// colocar da pafgina de cadrastro para login
// conectar login com bd e parte de cadrastro tmb 