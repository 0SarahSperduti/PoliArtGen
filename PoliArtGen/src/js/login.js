document.getElementById("loginForm").addEventListener("submit", function (event) {
    // Impede o envio padrão do formulário 
    event.preventDefault();

    // Coleta os dados de entrada
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    // Validação de campos vazios (no frontend)
    if (!email || !senha) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    // Estrutura os dados para enviar ao backend
    const dadosLogin = { email, senha };

    // Comunicação com o Backend 
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosLogin)
    })
        .then(response => {
            // Trata o JSON da resposta 
            if (response.ok || response.status === 401) {
                return response.json();
            }
            // Para outros erros graves (ex: 500)
            throw new Error('Falha na comunicação com o servidor.');
        })
        .then(data => {
            if (data.success) {

                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userTipo', data.userTipo);
                //SUCESSO: Login OK
                alert(`Bem-vindo(a)! Login de ${data.userTipo} realizado.`);

                // Em uma aplicação real, você salvaria o userId aqui (localstorage, cookies).
                // Redireciona para a página principal.
                window.location.href = "pag_principal.html";

            } else {
                //FALHA: E-mail ou senha inválidos 
                alert(`Falha no Login: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Erro de Comunicação:', error);
            alert("Ocorreu um erro inesperado. Tente novamente mais tarde.");
        });
});