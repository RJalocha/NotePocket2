//pomocnicza metoda pobierająca date w odpowiednim fomracie
Date.prototype.plDateTime = function() {

	let now = new Date();
	now = now.getFullYear() + '-' + (now.getMonth() + 1 <= 9 ? '0' : '') + (now.getMonth() + 1) + '-' + (now.getDate() <= 9 ? '0' : '') + now.getDate() + 'T' + (now.getHours() <= 9 ? '0' : '') + now.getHours() + ':' + (now.getMinutes() <= 9 ? '0' : '') + now.getMinutes();
	return now;
	
}