
// --------------------------------------- CONTROLE DO GRAFO ---------------------------------------

/* Id do último nó criado */
var lastNodeId = 0;

/* Tabela de nós indexados pelo id */
var nodeIdMap = {};

/* Tablea de arestas indexadas pelo id */
var edgeIdMap = {};

/* Tabela de heurísticas indexadas pelo id */
var heuristicIdMap = {};

/* Vetor contendo todos os nós contidos no grafo */
var vNodes = [];

/* Vetor contendo todos as arestas contidas no grafo */
var vEdges = [];

/* Vetor contendo todos as heurísticas contidas no grafo */
var vHeuristics = [];

/* Mapa de vetores de heurísticas indexados pelo id do nó destino */
var heuristicsTo = {};

// --------------------------------------- ELEMENTOS ATIVOS ----------------------------------------

/* Nó carregado pelo mouse */
var caughtUpNode = null;

/* Elemento selecionável cujo mouse está sobre */
var hoveredElement = null;

/* Elemento selecionado (clicado) */
var selectedElement = null;

/* Nó selecionado como origem da busca */
var orgNode = null;

/* Nó selecionado como destino da busca */
var dstNode = null;

var hoveredCanvasButton = null;

var selectionBackup = null;

// -------------------------------------------- CANVAS ---------------------------------------------

/* Elemento correspondente à tag canvas onde o grafo é renderizado */
var canvas;

/* Contexto de controle do canvas */
var ctx;

/* Largura em pixels do canvas */
var canvasSizeX = 0;

/* Altura em pixels do canvas */
var canvasSizeY = 0;

/* Flag que indica que o canvas está graficamente atualizado */
var canvasUpdated = false;

// -------------------------------------------- EVENTOS --------------------------------------------

/* Flag que indica se a tecla ctrl está pressionada */
var ctrlKeyPressed = false;

/* Flag que impede que um evento de clique seja tratado */
var preventClick = false;

/* Flag que indica se a tecla shift está pressionada */
var shiftKeyPressed = false;

/* Objeto com informações sobre o clique inicial do cursor */
var mouseDownStart = null;

/* Flag que indica se o mouse está com o botão esquerdo clicado */
var mouseIsDown = false;

/* Distância mínima para que um nó possa ser arrastado */
var minMoveDistance = 10;

/* Distância mínima entre o cursor e os elementos para que sejam clicáveis */
var minCurDist = 15;

// --------------------------------------- MEDIDAS GRÁFICAS ----------------------------------------

/* Ângulo de abertura da ponta das setas em arestas/heurísticas direcionadas */
var arrowHeadAngle = 0.45;

/* Tamanho de abertura da ponta das setas em arestas/heurísticas direcionadas */
var arrowHeadSize = 10;

/* Espessura da linha de uma aresta */
var edgeLineWidth = 3;

/* Espessura da linha de uma heurística */
var heuristicLineWidth = 3;

/* Espessura da borda de uma bandeira (ou marcador) */
var flagBorderWidth = 2;

/* Tamanho de uma bandeira (ou marcador) */
var flagSize = 25;

/* Raio de um nó em pixels */
var nodeRadius = 8;

var gridSize = 50;

var orgNodeFlagColor = "#57c";
var orgNodeFlagBorderColor = "#357";
var dstNodeFlagColor = "#d55";
var dstNodeFlagBorderColor = "#733";
var orgDstNodeFlagColor = "#aaa";
var orgDstNodeFlagBorderColor = "#555";
var poppedNodeColor = "#f00";
var nodeInQueueColor = "#07f";
var nodeOnceInQueueColor = "#888";
var nodeColor = "#444";
var hoveredNodeColor = "#666";
var selectedNodeColor = "#444";
var hoveredSelectedNodeColor = "#666";
var backgroundEdgeColor = "#333";
var backgroundSelectedEdgeColor = "#345";
var edgeColor = "#444";
var lockedEdgeColor = "#345";
var hoveredEdgeColor = "#666";
var selectedEdgeColor = "#07F";
var selectedPathEdgeColor = "#ccc";
var hoveredSelectedEdgeColor = "#5AF";
var heuristicColor = "#666";
var lockedHeuristicColor = "rgba(0, 255, 128, 0.25)";
var hoveredHeuristicColor = "#888";
var selectedHeuristicColor = "rgba(0, 255, 128, 1)";
var hoveredSelectedHeuristicColor = "rgba(128, 255, 192, 1)";
var canvasButtonColor = "rgba(255, 255, 255, 0.15)";
var hoveredCanvasButtonColor = "rgba(64, 128, 255, 0.4)"

// ----------------------------------------- FLAGS GRÁFICAS ----------------------------------------

var flagsVisible = true;
var flagsEditable = false;
var nodesSelectable = true;
var nodesEditable = true;
var edgesSelectable = true;
var edgesEditable = true;
var heuristicsSelectable = false;
var heuristicsEditable = false;
var hoverUpdated = false;
var selectionUpdated = false;
var canvasButtonsVisible = false;

// -------------------------------------- HISTÓRICO DE EDIÇÃO --------------------------------------

var stateHistory = [];
var stateHistoryIndex = 0;
var stateHistoryMaxLength = 100;
var graphUpdated = false;

// -------------------------------------- TRATAMENTO DE ERROS --------------------------------------

var lastErrorMsg;
var lastSearchErrorMsg;

// --------------------------------------------- BUSCA ---------------------------------------------

var searchData = null;
var searchAnimationCode = null;
var searchStateHistory = null;
var canvasButtonRadius = 20;
var canvasButtonsMarginTop = 20;
var canvasButtonsMarginLeft = 20;
var nCanvasButtons = 4;
