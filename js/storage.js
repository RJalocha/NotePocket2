let Storage = {

	content : null, //zawartość localStorage
	
	STORAGENAME : 'notepocket', //nazwa localStorage

	// "konstruktor"
	create : function() {
	
		let obj = Object.create(this);
		obj.init();
		return obj;
	
	},
	
	//inicjacja
	init : function() {
		
		this.load();
		
	},
	
	//odczytanie localStorage
	load : function() { this.content = JSON.parse(localStorage.getItem(this.STORAGENAME)); },
	
	//zapisanie localStorage
	save : function() { localStorage.setItem(this.STORAGENAME, JSON.stringify(this.content)); },
	
	//czy odczytano localStorage
	loaded : function() { return (this.content != null) ? true : false; },
	
	//zwrócenie danych odczytanej z localStorage
	getData : function() { return this.content; }

};