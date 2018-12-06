var array = [
	{"type": "F", "text": "Aspectos de aparência numa interface com o usuário, incluem a preocupação com a quantidade do código fonte, já que esta camada oferece inúmeras possibilidades de reuso"},
	{"type": "F", "text": "Em arquitetura distribuída, todas as classes de objetos definidas para aplicação são distribuídas. Um servidor de aplicação como o Jboss, no padrão J2EE, gera os stubs e skeletons para todas as classes;"},
	{"type": "F", "text": "Escalabilidade é a possibilidade que a aplicação desenvolvida oferece de permitir várias manutenções evolutivas ao longo de seu ciclo de vida"},
	{"type": "F", "text": "Manter íntegro todos os artefatos gerados durante uma manutenção de sistemas é importante, mas não necessário, pois os artefatos gerados na análise e projeto só serviram para criar o novo software"},
	{"type": "F", "text": "Manutenção evolutiva consiste em realizar ajustes, decorrentes, por exemplo de troca do servidor de banco de dados"},
	{"type": "F", "text": "No modelo cliente/servidor onde o cliente é \"gordo\", se cria pool de conexões com o Banco de Dados como forma de maximizar o uso do gerenciador de banco de dados"},
	{"type": "F", "text": "Num teste unitário (teste de unidade) pode ser aplicado apenas o conceito de teste caixa branca"},
	{"type": "F", "text": "Numa arquitetura cliente/servidor, o modelo de cliente-gordo estabelece o princípio que a aplicação da interface gráfica é executada totalmente no micro do usuário, enquanto a aplicação referente à camada de negócio e banco de dados sempre está em outro servidor"},
	{"type": "F", "text": "Numa arquitetura distribuída, o gerenciamento do ambiente computacional é simplificado em relação a um modelo de processamento centralizado, uma vez que as interfaces de administração são gráficas e os computadores servidores são de menor porte"},
	{"type": "F", "text": "O controle transacional e todo aspecto relacionado a uma transação e suas propriedades são detalhes exclusivamente tratados pelo gerenciador de banco de dados, não afetando em nenhum aspecto a aplicação"},
	{"type": "F", "text": "RMI é um protocolo de comunicação entre simples objetos JAVA"},
	{"type": "F", "text": "Teste estrutural ou caixa preta é um tipo de teste cujo objetivo é avaliar o software se ele está correto sob os aspectos funcionais, mas sem conhecer suas estruturas internas"},
	{"type": "F", "text": "Teste é essencialmente uma atividade para detectar se o software construído (código fonte) não tem erros"},
	{"type": "F", "text": "Um dos desafios durante a manutenção de software é mudar totalmente a arquitetura de desenvolvimento do software, já que, o software é flexível e feito para isso"},
	{"type": "F", "text": "Uma arquitetura define o QUE deve ser feito. A codificação define COMO deve ser feito"},
	{"type": "F", "text": "Uma programação essencialmente orientada a eventos é uma forma de programação estruturada"},
	{"type": "F", "text": "Uma programação orientada a eventos é uma programação OO"},
	{"type": "F", "text": "Usabilidade/Navegabilidade, combinação de cores, reuso de código fonte, coesão do código, são apenas aspectos estruturais a serem considerados numa interface com o usuário"},
	{"type": "F", "text": "Verificação é uma atividade relacionada a TESTES, da qual o principal objetivo é verificar se os artefatos que estão sendo gerados estão compatíveis com os requisitos do negócio"},
	{"type": "V", "text": "Concorrência é um aspecto da Arquitetura de Desenvolvimento para sistemas distribuídos, cujo o objetivo é tratar de como as estruturas de software suportarão acessos simultâneos aos mesmos recursos: tabelas, serviços (webservices, etc)"},
	{"type": "V", "text": "Depuração é consequência de um teste. O objetivo é identificar a origem do erro para correção"},
	{"type": "V", "text": "Embora um gerenciador de banco de dados ofereça controle de transação, é responsabilidade do analista definir, projetar e implementar o que é considerado uma transação na aplicação de negócio, para garantir a consistência de informações envolvidas na transação"},
	{"type": "V", "text": "Embora um gerenciador de banco de dados ofereça controle de transação, é responsabilidade do desenvolvedor projetar e implementar uma aplicação de forma que o banco de garanta os princípios (ACID) de transação"},
	{"type": "V", "text": "Mesmo aplicando padrões de projeto, respeitando responsabilidade de classes, incluindo classes que representam serviços, promovendo baixo acoplamento entre camadas de negócio e apresentação, é possível que a aplicação não consiga ser executada de forma distribuída se não houver uso de framework relacionado a servidor de aplicação"},
	{"type": "V", "text": "Na manutenção de software uma das dificuldades pode ser quantificar o esforço e o custo da modificação a ser realizada, uma vez, que algumas variáveis como por exemplo arquitetura e estruturação do software pode influenciar no esforço"},
	{"type": "V", "text": "Num teste unitário (teste de unidade) pode ser aplicado o conceito de teste caixa branca ou teste caixa preta"},
	{"type": "V", "text": "O conceito de Portal agrega complexidade adicional no desenvolvimento e administração de tecnologia de informação, uma vez que páginas de conteúdo estático, podem ser publicadas na mesma página, onde exista um portlet representando um caso de uso de aplicação"},
	{"type": "V", "text": "Reuso é uma técnica de programação, que evita escrever código repetido"},
	{"type": "V", "text": "RMI é um dos protocolos de comunicação entre objetos JAVA padrão EJB"},
	{"type": "V", "text": "RMI é um protocolo de comunicação entre objetos JAVA"},
	{"type": "V", "text": "Teste caixa preta é um tipo de teste cujo objetivo é avaliar o software se ele está correto sob os aspectos funcionais, mas sem conhecer suas estruturas internas"},
	{"type": "V", "text": "Um processo de qualidade em desenvolvimento de software pressupõe que os diversos artefatos gerados durante o desenvolvimento de software possam ser verificados e validados, ou seja, possam ser homologáveis"},
	{"type": "V", "text": "Um serviço em SOA (Arquitetura Orientada a Serviços) pode ser implementado de forma estruturada (numa linguagem estruturada inclusive). Desde que se projete uma interface estável entre o serviço e os clientes deste serviço"},
	{"type": "V", "text": "Uma aplicação monolítica é um estilo de projeto e implementação que o código fonte da interface com usuário está fortemente acoplado ao código fonte das regras de negócio e acesso a banco"},
	{"type": "V", "text": "Uma das diferenças entre um serviço e um método de classe está na granularidade da operação implementada no método"},
	{"type": "V", "text": "Uma programação essencialmente orientada a eventos é uma forma de programação monolítica"},
	{"type": "V", "text": "É possível, mesmo no modelo de processamento centralizado, adotar padrões de projeto em camadas"}
];
function shuffle() {
	function swap(a, b) {
		var aux = array[a];
		array[a] = array[b];
		array[b] = aux;
	}
	for (var i=array.length; i; --i) {
		var pos = Math.floor(Math.random()*i);
		swap(pos, i-1);
	}
}
var main = document.querySelector("#main");
function clickHandler() {
	var str = this.getAttribute("class");
	var type = this.getAttribute("result");
	if (str.split(" ").indexOf(type) === -1) {
		this.setAttribute("class", str + " " + type);
	}
}
function addBlock(obj) {
	var block = document.createElement("div");
	block.setAttribute("class", "block");
	block.setAttribute("result", obj.type);
	block.innerHTML = obj.text;
	block.addEventListener("click", clickHandler);
	main.appendChild(block);
}
shuffle();
array.forEach(obj=>addBlock(obj));
document.querySelector(".button").addEventListener("click", function(){
	main.innerHTML = "";
	shuffle();
	array.forEach(obj=>addBlock(obj));
});