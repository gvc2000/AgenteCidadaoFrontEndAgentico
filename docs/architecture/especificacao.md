Gostaria que me ajudasse a fazer uma especificação para um front end.

1. Visão Geral do Produto

2. Agente Cidadão é uma interface web de chat conversacional que permite a qualquer cidadão fazer perguntas em linguagem natural sobre dados legislativos e receber respostas baseadas em dados oficiais, inicialmente da Câmara dos Deputados.

3 Objetivos do Produto
Democratizar o acesso a dados públicos legislativos
Simplificar consultas através de linguagem natural
Garantir transparência com referências às fontes oficiais
Facilitar a compreensão de informações complexas

4 Este front end terá uma proposta cidadã e pode ser inspirado nos dados abertos da Camara dos deputados do Brasil https://dadosabertos.camara.leg.br/. Porem pode usar alguma tonalidade de verde que lembre o da câmara dos deputados www.camara.leg.br.

5 Deve ser responsivo, acessível e funcionar de uma maneira semelhante a um llm, na medida que será digitado as perguntas sobre o trabalho legislativo que serão então encaminhadas a um llm depois ao mcp e depois aos dados abertos da câmara.

6 O tema principal se chamará Agente Cidadão. Sua filosofia será consultar dados de interesse da Cidadania. Neste front-end poderão estar acesso aos dados aberos de diversos orgão públicos do brasil. Inicialmente estaram somente os dados da Câmara dos Deputados.Caso O site estará todo em português do brasil. Caso crie alguma figura é importante que o texto dela também esteja em português. 

7. O site deverá ser inicialmente bilingue Português que será a língua principal e espanhol.

8. Deverá ter uma interface administrativa onde se poderão cadastrar usuários (apagar, deletar, etc). Na interface administrativa deverá ter um mecanismo que caso acionado, somente o administrador e os usuários cadastrados poderão acessar o site. também terá uma tela de login.

9. Quando o usuário submeter a sua pergunta ela será enviadapara o endereço n8n-agentecidadaoagentico-production.up.railway.app/webhook/chat. Enquanto estiver aguardando a resposta será mostrado alguma animação avisando que a consulta está sendo feito on-line as bases oficiais (com alguma animação)

10. Crie um prototipo da interface para que possamos testar.