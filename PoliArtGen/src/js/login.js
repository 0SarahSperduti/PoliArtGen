document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");
    const lembrarCheck = document.getElementById("lembrar");

    // Verifica se há dados salvos no localStorage
    const savedEmail = localStorage.getItem("lembrarEmail");
    if (savedEmail) {
        emailInput.value = savedEmail;
        lembrarCheck.checked = true;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        // Simulação simples de login
        if (email === "admin@email.com" && senha === "1234") {
            if (lembrarCheck.checked) {
                localStorage.setItem("lembrarEmail", email);
            } else {
                localStorage.removeItem("lembrarEmail");
            }

            // Armazena nome do usuário para exibir nas outras telas
            localStorage.setItem("usuario", "Sarah");

            window.location.href = "pag_principal.html";
        } else {
            alert("Usuário ou senha inválidos!");
        }
    });
});
