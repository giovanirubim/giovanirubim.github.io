// ========================<-------------------------------------------->======================== //
// Módulo destinado a armazenar uma lista de log de operações, podendo navegar para o passado (undo)
// ou para o presente (redo).

// ========================<-------------------------------------------->======================== //
// Variáveis globais

// Ponto separador de batches
const checkpoint = Symbol();

// Fila de logs
const queue = [checkpoint];

// Índice do log atual
let index = 0;

// ========================<-------------------------------------------->======================== //
// Métodos públicos

// Adiciona um log
export const push = log => {
	
	++ index;

	// Exclui os logs seguintes
	if (queue.length > index + 1) {
		queue.length = index + 1;
	}

	queue[index] = log;
};

// Marca um checkpoint no estado atual
export const commit = () => {
	const current = queue[index];
	if (current !== checkpoint) {
		push(checkpoint);
	}
};

// Itera todos os logs da posição atual até o checkpoint anterior
export const rollback = reverse => {
	if (index === 0) return;
	if (queue[index] === checkpoint) {
		-- index;
	}
	while (index !== 0) {
		const log = queue[index];
		if (log === checkpoint) break;
		-- index;
		reverse(log);
	}
};

// Itera todos os logs da posição atual até o próximo checkpoint
export const rollfront = apply => {
	const last = queue.length - 1;
	if (index >= last) {
		return;
	}
	while (index < last) {
		const log = queue[++index];
		if (log === checkpoint) break;
		apply(log);
	}
};

// End of File
// ========================<-------------------------------------------->======================== //