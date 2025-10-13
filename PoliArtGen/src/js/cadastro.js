document.getElementById("cadastroForm").addEventListener("submit", function(event) {
    event.preventDefault();
  
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;
  
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }
  
    if (!nome || !email || !senha) {
      alert("Por favor, preencha todos os campos!");
      return;
    }
  
    const dadosDoUsuario = { nome, email, senha };
    fetch('/api/cadastro', { 
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosDoUsuario)
  })
  .then(response => {
      // Verifica se a resposta foi HTTP 2xx (Sucesso)
      if (response.ok) {
          return response.json(); 
      }
      // Se a resposta for 4xx ou 5xx (Erro), lança um erro para o bloco .catch()
      throw new Error('Erro na requisição ao servidor.');
  })
  .then(data => {
      
      if (data.success) {
          alert("Cadastro realizado com sucesso!");
          window.location.href = "pag_login.html"; // Redireciona para o login
      } else {
          // ERRO DE NEGÓCIO (Ex: E-mail já existe)
          alert("Erro no Cadastro: " + data.message);
      }
  })
  .catch(error => {
      // Trata Falhas de Rede ou Erros Genéricos do Servidor
      console.error('Erro de Comunicação:', error);
      alert("Falha ao tentar conectar com o servidor. Tente novamente mais tarde.");
  });
});

  