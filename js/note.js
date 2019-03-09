const Note = {
	
	title : null,	//tytuł notatki
	content : null,	//treść notatki
	color : null,	//kolor notatki
	pin : false,	//czy przypięta do góry
	modify_at : '0000-00-00T00:00',		//data utworzenia notatki
	remaind_at : '0000-00-00T00:00',	//data przypomnienia o notatce
	tags : null, 	//tagi notatki
	
	is_modify : false,	//flaga czy notatka zostala zmodyfikowana od ostatniego zapisania w localStorage
	to_drop : false,	//flaga czy element jest do usuniecia
	
	editor : null, 		//referencja do edytora
	
	element : null, 	//elementy DOM notatki
	
	// "konstruktor"
	create : function(note, editor) {
		
		let obj = Object.create(this);
		obj.init(note, editor);
		return obj;
		
	},
	
	//inicjacja
	init : function(note, editor) {
		
		this.title = note.title;
		this.content = note.content;
		this.color = note.color;
		this.pin = note.pin;
		this.modify_at = note.modify_at;
		this.remaind_at = note.remaind_at;
		this.tags = note.tags;
		
		this.editor = editor;
		
		this.generateElement();
		
	},
	
	//generowanie elementu
	generateElement : function() {
		
		let note = document.createElement('div');
		note.className = 'note u-background-color-' + this.color;
		note.title = 'Kliknij aby otworzyć lub edytorać';
		
		let title = document.createElement('div');
		title.className = 'note__title';
		title.innerHTML = this.title;
		
		let date = document.createElement('div');
		date.className = 'note__date';
		date.innerHTML = this.modify_at.replace('T', ' ');
		date.title = 'Data ostatniej modyfikacji';
		
		let drop = document.createElement('div');
		drop.className = 'note__drop';
		drop.title = 'Kliknij aby usunąć notatkę';
		
		note.appendChild(title);
		note.appendChild(date);
		note.appendChild(drop);
		
		this.element = {
			
			note : note,
			title : title,
			date : date
			
		};
		
		//zdarzenie kliknięcia w element
		this.element.note.addEventListener('click', () => this.edit() );
		
		//zdarzenie klikniecia na przycisk usuniecia notatki i zmiana flagi usuniecia na prawdę
		drop.addEventListener('click', () => this.to_drop = true );
		
	},
	
	//uruchomienie edycji/podglądu notatki
	edit : function() {
		
		if(!this.to_drop) {
			
			this.editor.show({
				title: this.title,
				content: this.content,
				color: this.color,
				pin: this.pin,
				remaind_at: this.remaind_at,
				tags: this.tags
			}, data => {

				this.title = data.title;
				this.content = data.content;
				this.color = data.color;
				this.pin = data.pin;
				this.modify_at = data.modify_at;
				this.remaind_at = data.remaind_at;
				this.tags = data.tags;
				
				this.is_modify = true;
				
				this.element.title.innerHTML = this.title;
				this.element.date.innerHTML = this.modify_at.replace('T', ' ');
				this.element.note.className = 'note u-background-color-' + this.color;
				
			});
		
		}
		
	},
	
	// zwrócenie elementu notatki
	getElement : function() { return this.element.note; },
	
	//ukrycie notatki
	hide : function() { this.element.note.style.display = 'none'; },
	
	//pokazanie notatki
	show : function() { this.element.note.style.display = 'inline-block'; }
	
};