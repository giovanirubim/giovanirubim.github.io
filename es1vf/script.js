var sorted = [
	{"type": "F", "text": "A diferença básica entre agregação e composição é que na agregação o clico de vida do objeto parte é completamente dependente do clico de vida do objeto todo"},
	{"type": "F", "text": "Aspectos de aparência numa interface com o usuário, incluem a preocupação com a quantidade do código fonte, já que esta camada oferece inúmeras possibilidades de reuso"},
	{"type": "F", "text": "Casos de heranças são definidos pelos requisitos e conceitos presentes dentro do escopo do software a  ser desenvolvido e pela conveniência que o programador vê em economizar código durante a programação"},
	{"type": "F", "text": "Classe abstrata é um tipo de classe auxiliar que aparece em modelagens um pra um, numa relação de agregação ou composição principalmente"},
	{"type": "F", "text": "Classe transiente é um tipo de classe persistente, onde suas instâncias podem ser gravadas em tabelas diferentes no SGBD"},
	{"type": "F", "text": "Dentro de um processo de desenvolvimento com paradigma OO, para chegar ao diagrama de classes é necessário primeiramente fazer o modelo E-R"},
	{"type": "F", "text": "Dependência é um tipo especial de herança"},
	{"type": "F", "text": "Em arquitetura distribuída, todas as classes de objetos definidas para aplicação são distribuídas. Um servidor de aplicação como o Jboss, no padrão J2EE, gera os stubs e skeletons para todas as classes;"},
	{"type": "F", "text": "Em OO, a única origem para se efazer o diagrama de classes de negócio é a partir do protótipo de telas validado com o cliente"},
	{"type": "F", "text": "Escalabilidade é a possibilidade que a aplicação desenvolvida oferece de permitir várias manutenções evolutivas ao longo de seu ciclo de vida"},
	{"type": "F", "text": "Manter íntegro todos os artefatos gerados durante uma manutenção de sistemas é importante, mas não necessário, pois os artefatos gerados na análise e projeto só serviram para criar o novo software"},
	{"type": "F", "text": "Manutenção evolutiva consiste em realizar ajustes, decorrentes, por exemplo de troca do servidor de banco de dados"},
	{"type": "F", "text": "Modelo E-R é um artefato, geralmente realizado em iterações de iniciação"},
	{"type": "F", "text": "No modelo cliente/servidor onde o cliente é \"gordo\", se cria pool de conexões com o Banco de Dados como forma de maximizar o uso do gerenciador de banco de dados"},
	{"type": "F", "text": "Num teste unitário (teste de unidade) pode ser aplicado apenas o conceito de teste caixa branca"},
	{"type": "F", "text": "Numa arquitetura cliente/servidor, o modelo de cliente-gordo estabelece o princípio que a aplicação da interface gráfica é executada totalmente no micro do usuário, enquanto a aplicação referente à camada de negócio e banco de dados sempre está em outro servidor"},
	{"type": "F", "text": "Numa arquitetura distribuída, o gerenciamento do ambiente computacional é simplificado em relação a um modelo de processamento centralizado, uma vez que as interfaces de administração são gráficas e os computadores servidores são de menor porte"},
	{"type": "F", "text": "Numa arquitetura em camadas as classes do tipo entidade presentes na camada de apresentação servem para buscar as informações disponíveis no banco de dados. Desta forma esta camada é capaz de mostrar as informações solicitadas pelo usuário"},
	{"type": "F", "text": "O controle transacional e todo aspecto relacionado a uma transação e suas propriedades são detalhes exclusivamente tratados pelo gerenciador de banco de dados, não afetando em nenhum aspecto a aplicação"},
	{"type": "F", "text": "O diagrama de classes de negócio, representa o modelo estrutural e comportamental, servindo "},
	{"type": "F", "text": "Relação de agregação é uma relação \"é um tipo\" enquanto herança, é uma relação \"todo/parte\""},
	{"type": "F", "text": "RMI é um protocolo de comunicação entre simples objetos JAVA"},
	{"type": "F", "text": "Sobrecarga de operações é uma característica de codificação onde se implementa numa mesma classe métodos com nomes diferentes mas com parâmetros iguais"},
	{"type": "F", "text": "Teste estrutural ou caixa preta é um tipo de teste cujo objetivo é avaliar o software se ele está correto sob os aspectos funcionais, mas sem conhecer suas estruturas internas"},
	{"type": "F", "text": "Teste é essencialmente uma atividade para detectar se o software construído (código fonte) não tem erros"},
	{"type": "F", "text": "Um dos desafios durante a manutenção de software é mudar totalmente a arquitetura de desenvolvimento do software, já que, o software é flexível e feito para isso"},
	{"type": "F", "text": "Um relacionamento de agregação entre classes de pacotes diferentes não cria uma relação de dependência entre pacotes, somente entre as classes envolvidas"},
	{"type": "F", "text": "Um relacionamento de composição entre classes de pacotes diferentes cria uma relação de dependência entre os pacotes, mas um relacionamento de dependência não"},
	{"type": "F", "text": "Uma arquitetura define o QUE deve ser feito. A codificação define COMO deve ser feito"},
	{"type": "F", "text": "Uma camada contém componentes de software bem projetados, que são compostos por classes. A especificação e responsabilidades destas classes não precisam ser necessariamente compatíveis com o objetivo e responsabilidade geral de uma camada de software"},
	{"type": "F", "text": "Uma classe transiente representa objetos cuja as informações não são guardadas em um banco de dados relacional, apenas em arquivo tipo texto"},
	{"type": "F", "text": "Uma programação essencialmente orientada a eventos é uma forma de programação estruturada"},
	{"type": "F", "text": "Uma programação orientada a eventos é uma programação OO"},
	{"type": "F", "text": "Usabilidade/Navegabilidade, combinação de cores, reuso de código fonte, coesão do código, são apenas aspectos estruturais a serem considerados numa interface com o usuário"},
	{"type": "F", "text": "Verificação é uma atividade relacionada a TESTES, da qual o principal objetivo é verificar se os artefatos que estão sendo gerados estão compatíveis com os requisitos do negócio"},
	{"type": "F", "text": "É na fase de iniciação onde há especificação total de um sistema a ser construído"},
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
	{"type": "V", "text": "É possível, mesmo no modelo de processamento centralizado, adotar padrões de projeto em camadas"},
	{"type": "V", "text": "Ajustes em diagrama de classes de negócio, como herança, eventuais tratamento de associação via agregação e composição podem ser feitas em vários momentos do projeto. É natural que eventualmente estes ajustes sejam feitos durante a especificação de aspectos comportamentais do software"},
	{"type": "V", "text": "Algumas heranças são definidas não somente pelos requisitos e conceitos presentes dentro do escopo do software a ser desenvolvido, mas também pelo entendimento de qual contexto que o futuro software será está inserido"},
	{"type": "V", "text": "Alta coesão e baixo acoplamento são metas de um bom projeto. Por exemplo, alta coesão significa que um método de classe execute somente e tão somente a tarefa restrita, compatível com seu objetivo, exigindo pouca interação com outras estruturas"},
	{"type": "V", "text": "Boas práticas de modelagem indicam que é desaconselhável haver referência circular entre classes e/ou pacotes"},
	{"type": "V", "text": "Boas práticas de software indicam definição de estrutura de heranças em hierarquias equilibradas, onde especialisações compartilham o mesmo nível de abstração"},
	{"type": "V", "text": "Classes de associação * p/ * são especificadas dependendo da natureza do relacionamento. Se o relacionamento possui atributos ou comportamentos, sim, se não, sua necessidade dependerá do projeto para camada de persistência"},
	{"type": "V", "text": "Composição e agregação são tipos especiais de associação entre objetos. A composição, quando modelada, significa que o objeto parte tem seu ciclo de vida dependente do objeto todo"},
	{"type": "V", "text": "Em OO o modelo E-R para banco de dados relacional é definido a partir do diagrama de classes já definido"},
	{"type": "V", "text": "Java não implementa herança múltipla"},
	{"type": "V", "text": "Modelo E-R é um artefato, geralmente realiazdo na fase de elaboração"},
	{"type": "V", "text": "O diagrama de classes de negócio representa o modelo estrutural e também serve para demonstrar o entendimento capturado durante o levantamento de requisitos e guiando assim toda a estrutura do software a ser desenvolvido"},
	{"type": "V", "text": "Polimorfismo é uma característica de OO, da qual facilita a criação de frameworks, componentes"},
	{"type": "V", "text": "Um caso de uso define uma atividade específica bem definida em que um ou vários atores participam"},
	{"type": "V", "text": "Um diagrama de classes é um produto tanto de análise quanto de projeto"},
	{"type": "V", "text": "Um pacote (package) é um elemento de agrupamento, assim como classes, que agrupam atributos de um mesmo objeto"},
	{"type": "V", "text": "Um protótipo de telas de um sistema é um artefato de projeto que serve para validar requisitos"},
	{"type": "V", "text": "Um use-case define uma atividade específica bem definida em que um ou vários atores participam"},
	{"type": "V", "text": "Uma abstração representa uma realidade específica, sob um determinado foco"},
];
var array = sorted.slice(0, sorted.length);
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
function addBlock(obj, revealed) {
	var block = document.createElement("div");
	block.setAttribute("class", "block" + (revealed?" "+obj.type:""));
	block.setAttribute("result", obj.type);
	block.innerHTML = obj.text;
	block.addEventListener("click", clickHandler);
	main.appendChild(block);
}
var filterMap = {
	"ã": "a",
	"á": "a",
	"â": "a",
	"à": "a",
	"é": "e",
	"ê": "e",
	"ó": "o",
	"õ": "o",
	"ô": "o",
	"ú": "o",
	"ç": "c",
	",": " ",
	".": " ",
	"-": " ",
	"\"": " ",
	"/": " ",
	"(": " ",
	")": " ",
};
function filter(str) {
	str = str.toLowerCase();
	var res = "";
	for (var i=0; i<str.length; ++i) {
		var chr = str[i];
		res += filterMap[chr] || chr;
	}
	while (res.indexOf("  ") >= 0) res = res.replace("  ", " ");
	return res;
}
array.forEach(obj=>obj.filtered = " " + filter(obj.text).trim() + " ");
function reset() {
	shuffle();
	main.innerHTML = "";
	array.forEach(obj=>addBlock(obj));
}
document.querySelector(".button").addEventListener("click", reset);
var lastSearch = "";
document.querySelector("input").addEventListener("keyup", function(){
	if (this.value.trim() === lastSearch.trim()) {
		return;
	} else if (this.value === "") {
		lastSearch = "";
		reset();
		return;
	}
	lastSearch = this.value;
	var result = [];
	var str = " " + filter(this.value);
	sorted.forEach(obj=>{
		var i = obj.filtered.indexOf(str)
		if (i == 0) {
			result.splice(0, 0, obj);
		} else if (i > 0) {
			result.push(obj);
		}
	});
	main.innerHTML = "";
	result.forEach(obj=>addBlock(obj, true));
});
reset();