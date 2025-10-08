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
  
    alert("Cadastro realizado com sucesso!");
    window.location.href = "pag_login.html"; // redireciona pro login
  });
  