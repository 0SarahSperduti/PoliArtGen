// Espera todo o conteúdo da página carregar antes de executar o script.
document.addEventListener('DOMContentLoaded', () => {

    // 1. Encontra o formulário principal e a área de resultado no seu HTML.
    //    Garanta que seu <form> tenha o id="formPrincipal" e a div de resultado tenha id="preview-img".
    const formGerador = document.getElementById('formPrincipal');
    const resultadoDiv = document.getElementById('preview-img');

    // 2. Garante que o código só continue se o formulário realmente existir na página.
    if (formGerador) {

        // 3. Adiciona um "escutador" que espera o usuário clicar no botão "Gerar Ilustração" (do tipo submit).
        formGerador.addEventListener('submit', function (event) {
            
            // 4. Impede que a página recarregue sozinha, que é o comportamento padrão de um formulário.
            event.preventDefault();

            // 5. Mostra uma mensagem de "carregando" para o usuário saber que algo está acontecendo.
            resultadoDiv.innerHTML = '<p>Gerando sua ilustração, aguarde um momento...</p>';

            // 6. Coleta todos os dados que o usuário preencheu nos campos do formulário.
            const formData = new FormData(formGerador);
            const dadosParaApi = {
                materia: formData.get('materia'),
                estilo: formData.get('estilo'),
                topico: formData.get('topico'),
                nivel: formData.get('nivel'),
                detalhes: formData.get('detalhes')
            };

            // 7. Define o endereço exato da sua API Java que vai receber esses dados.
            const apiUrl = 'http://localhost:8080/gerar-imagem';

            // 8. A chamada para a API! O JavaScript envia os dados para o seu back-end.
            fetch(apiUrl, {
                method: 'POST', // Método para enviar dados.
                headers: {
                    'Content-Type': 'application/json', // Avisa que os dados estão no formato JSON.
                },
                body: JSON.stringify(dadosParaApi) // Converte os dados para o formato de texto JSON.
            })
            .then(response => {
                // Se a resposta do servidor não for de sucesso, gera um erro.
                if (!response.ok) {
                    throw new Error('Erro na resposta do servidor: ' + response.status);
                }
                // Converte a resposta (que também é JSON) em um objeto que o JavaScript pode usar.
                return response.json();
            })
            .then(data => {
                // 9. Sucesso! A API respondeu com os dados.
                //    Estamos esperando um objeto com uma propriedade "imageUrl".
                if (data.imageUrl) {
                    // Se a URL da imagem foi recebida, cria uma tag <img> e a exibe na tela.
                    resultadoDiv.innerHTML = `<img src="${data.imageUrl}" alt="Ilustração gerada com sucesso">`;
                } else {
                    // Se a API não retornou a URL por algum motivo.
                    resultadoDiv.innerHTML = '<p>A API respondeu, mas não retornou uma imagem.</p>';
                }
            })
            .catch(error => {
                // 10. Deu erro! Se a conexão falhar ou qualquer passo anterior der errado.
                console.error('Erro na chamada da API:', error);
                resultadoDiv.innerHTML = '<p>Oops! Algo deu errado ao se comunicar com o servidor. Verifique o console para mais detalhes.</p>';
            });
        });
    }
});