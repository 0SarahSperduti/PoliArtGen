# PoliArtGen 🎨

> Plataforma de geração de imagens educacionais com Inteligência Artificial

## 📋 Sobre o Projeto

O **PoliArtGen** é uma aplicação web desenvolvida em parceria com a Escola Poliedro e o Instituto Mauá de Tecnologia (IMT), criada para facilitar a geração de imagens educacionais de qualidade para professores e alunos do ensino médio.

A plataforma utiliza Inteligência Artificial para criar ilustrações personalizadas a partir de descrições textuais (prompts), otimizando o tempo de preparo de aulas, provas e materiais didáticos nas áreas de Ciências Naturais (Física, Química e Biologia) e Matemática.

### 🎯 Objetivos

- Agilizar a preparação de materiais didáticos visuais
- Fornecer imagens de alta qualidade e relevância pedagógica
- Oferecer interface intuitiva e acessível para usuários de diferentes níveis técnicos
- Permitir personalização de estilos e formatos de imagens

### ✨ Principais Funcionalidades

- 🖼️ **Geração de Imagens com IA**: Criação de ilustrações educacionais baseadas em prompts textuais
- 🎨 **Múltiplos Estilos**: Escolha entre diferentes estilos visuais (realista, cartoon, acadêmico, esboço)
- 📚 **Organização por Disciplinas**: Filtros para Física, Química, Biologia e Matemática
- 💾 **Histórico Pessoal**: Acesso a todas as imagens geradas anteriormente
- 📥 **Download Facilitado**: Exportação em formatos PNG e JPEG
- 🌓 **Temas Personalizáveis**: Alternância entre modo claro e escuro
- 📱 **Design Responsivo**: Funcional em desktop, tablet e smartphone

## 🖥️ Capturas de Tela

### Tela de Login
<!-- Adicionar imagem aqui -->

### Tela Principal - Gerador de Imagens
<!-- Adicionar imagem aqui -->

### Histórico de Gerações
<!-- Adicionar imagem aqui -->

### Perfil do Usuário
<!-- Adicionar imagem aqui -->

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Estruturação semântica do conteúdo
- **CSS3**: Estilização e design responsivo
- **JavaScript (ES6+)**: Lógica interativa e manipulação do DOM

### Backend
- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework web para Node.js
- **MongoDB**: Banco de dados NoSQL
- **Mongoose**: ODM para MongoDB

### Bibliotecas e Ferramentas
- **Transformers (Hugging Face)**: Processamento de Linguagem Natural (NLP)
- **bcrypt**: Criptografia de senhas
- **dotenv**: Gerenciamento de variáveis de ambiente
- **body-parser**: Parse de requisições HTTP
- **Figma**: Prototipagem e design de interface
- **Git & GitHub**: Controle de versão

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js (v14 ou superior)
- MongoDB instalado e em execução
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/0SarahSperduti/PoliArtGen.git
cd PoliArtGen
```

2. **Instale as dependências**
```bash
npm install mongoose
npm install dotenv
npm install body-parser
npm install express
npm install bcrypt
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto com as seguintes configurações:

```env
# Configuração do MongoDB
MONGODB_URI=mongodb://localhost:27017/poliartgen

# Porta do servidor
PORT=3000

# Configurações da API de IA 
HUGGINGFACE_API_KEY=sua_chave_api_aqui
```

4. **Inicie o servidor**
```bash
node server.js
```

5. **Acesse a aplicação**

Abra seu navegador e acesse: `http://localhost:3000`


## 🔒 Questões Legais e Compliance

O PoliArtGen está em conformidade com:

- **LGPD (Lei nº 13.709/2018)**: Proteção de dados pessoais
- **Lei de Direitos Autorais (Lei nº 9.610/98)**: Propriedade intelectual das imagens geradas
- **WCAG 2.1 (Nível AA)**: Acessibilidade digital

## 📊 Resultados

O projeto foi validado através de testes de usabilidade com professores e alunos, obtendo feedback positivo em relação a:
- Facilidade de uso e navegação intuitiva
- Qualidade das imagens geradas
- Agilidade no processo de criação
- Interface responsiva e acessível

## 👨‍💻 Equipe de Desenvolvimento

| Nome | RA |
|------|-----|
| Sarah Agostinho Sperduti | 25.00276-7 |
| Enzo Marangoni Freitas | 25.00383-1 |
| Lucas Quadro das Dores | 25.00107-4 |
| Felipe Slaero Idalgo | 25.00963-0 |
| Julia Bolzan Gnan | 25.01420-0 |

**Instituição**: Instituto Mauá de Tecnologia (IMT)  
**Parceiro**: Escola Poliedro  

## 📝 Licença

Este projeto foi desenvolvido como trabalho acadêmico e está disponível para fins educacionais.

## 📧 Contato

Para dúvidas ou sugestões, entre em contato através do repositório no GitHub.

---

**Desenvolvido com 💙 pela equipe PoliArtGen - 2025**
