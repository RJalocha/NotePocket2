const Editor = {
	
	element : null, //elementy DOM edytora
	
	drag : false,	//flaga na zdarzenia klikniecia w nagłówek edytora
	dragOffset : { x : 0, y : 0 },	//przesunięcie kursora od krawedzi nagłowka po kliknięciu
	
	input : null, 	//dane wejsciowe do edytora
	callback : {},	//wejściowa funkcja callback
	
	tags : [],		//pomocnicza tablica na tagi

	// "konstruktor"
	create : function() {
	
		let obj = Object.create(this);
		obj.init();
		return obj;
	
	},
	
	//inicjacja
	init : function() {
		
		this.element = {
			
			container : document.getElementById('e_container'),
			header : document.getElementById('e_header'),
			close : document.getElementById('e_close'),
			title : document.getElementById('e_input_title'),
			content : document.getElementById('e_input_content'),
			colors : document.getElementsByName('e_input_color'),
			pin : document.getElementById('e_input_pin'),
			remaind_at : document.getElementById('e_input_remaind_at'),
			submit : document.getElementById('e_submit'),
			tag : document.getElementById('e_input_tag'),
			tags : document.getElementById('e_output_tags')
			
		};
			
		const bound = this.element.container.getBoundingClientRect();
		
		this.element.container.style.left = bound.x + 'px';
		this.element.container.style.top = bound.y + 'px';
		
		this.events();
		
	},
	
	//zdarzenia na edytorze
	events : function() {
		
		//zdarzenie kliknięcia w nagłówek edytora
		this.element.header.addEventListener('mousedown', e => {
			this.drag = true;
			
			const bound = this.element.container.getBoundingClientRect();

			this.dragOffset.x = e.clientX - bound.x;
			this.dragOffset.y = e.clientY - bound.y;
		});
		
		//zdarzenie zwolnienia klawisza myszki
		window.addEventListener('mouseup', () => this.drag = false );
		
		//zdarzenie poruszenia myszką po oknie przeglądarki
		window.addEventListener('mousemove', e => {
			if(this.drag) {
				
				this.element.container.style.left = e.clientX - this.dragOffset.x + 'px';
				this.element.container.style.top = e.clientY - this.dragOffset.y + 'px';
			}
		});
		
		//zdarzenie kliknięcia w ikone ukrycia edytora
		this.element.close.addEventListener('click', () => this.hide() );
		
		//zdarzenie dodania tagu
		this.element.tag.addEventListener('keypress', (e) => {
			if(e.keyCode == 13) { //jesli kliknięto klawisz ENTER
				
				const value = e.target.value.trim();	//usunięcie zbędnych białych nzaków i zapamiętanie wartości z pola tag
				e.target.value = '';					//wyczyszczenie pola tag
				
				if(value != '')							//jeżeli w polu tag było coś wpisane
					this.addTag(value);					//dodaj tag do kontenera tagów

			}
		});
		
		//zdarzenie kliknięcia w kolory
		for(let i = 0; i < this.element.colors.length; i++) {
			this.element.colors[i].addEventListener('click', e => this.changeColor(e.target.dataset.color) );
		}
		
	},
	
	//dodanie tagu do kontenera tagów
	addTag : function(value) {
		
		if(this.tags.indexOf(value) == -1) {			//jeżeli nie istnieje jużtaki tag
		
			const tag = document.createElement('div');	//stwórz nowy element DIV na tag
			tag.className = 'editor__tag';				//ustaw mu klasę 
			tag.innerHTML = value;						//wpisz do niego zapamiętaną wartość z pola tag
			tag.title = 'Kliknij aby usunąć ten tag';
			
			this.tags.push(value);						//dodanie tagu do pomocniczej tablicy tagów
			
			this.element.tags.appendChild(tag);			//umieść element e kontenerze tagów
			
			tag.addEventListener('click', e => this.dropTag(e.target) );	//zdarzenie kliknięcia na tag
		
		}
		
	},
	
	//usunięcie tagu
	dropTag : function(target) {
		
		let id = this.tags.indexOf(target.innerHTML);	//pobranie indentyfikatora tagu na podstawie treśći w tagu
		
		if(id != -1) {									//jeżeli istnieje tag
			this.tags.splice(id, 1);					//usuń tag
			target.parentNode.removeChild(target);		//usuń element tagu z kontenera tagów
		}
		
	},
	
	//ukrycie edytora
	hide : function() {
		this.element.container.style.opacity = 0;
		this.element.container.style.transition = 'opacity .3s';
		this.element.container.style.visibility = 'hidden';
	},
	
	//zmiana aktywnego kolory w edytorze
	changeColor : function(color) {
		
		for(let i = 0; i < this.element.colors.length; i++)
			this.element.colors[i].dataset.selected = (this.element.colors[i].dataset.color == color) ? 'true' : 'false';
		
	},
	
	//pobranie wybranego koloru
	getColor : function() {
		
		for(let i = 0; i < this.element.colors.length; i++)
			if(this.element.colors[i].dataset.selected == 'true') return this.element.colors[i].dataset.color;
		
	},
	
	//włączenie edytora
	show : function(data, callback) {
		
		//dla bezpieczeństwa nadpisuje dane i funkcje callback
		this.input = data;
		this.callback = callback;
		
		this.element.tags.innerHTML = '';	//wyczyszczenie kontenera tagów
		this.tags = [];						//wyczyszczenie pomocniczej tablicy tagów
		
		//uzupełnienie edytora danymi
		this.element.container.style.visibility = 'visible';
		this.element.container.style.transition = 'opacity .3s';
		this.element.container.style.opacity = 1;
		this.element.title.value = this.input.title;
		this.element.content.value = this.input.content;
		this.element.remaind_at.value = this.input.remaind_at;
		this.changeColor(this.input.color);
		this.element.pin.checked = this.input.pin;
		
		if(this.input.tags != null) {			//jeżeli wejściowy ciąg znaków z tagami nie jest pusty
		let tags = this.input.tags.split(';');	//konwersja tagów wejściowych zapisanych w ciągu sznaków na tablice
			for(var i = 0; i < tags.length; i++)//przeskocz po tagach
				this.addTag(tags[i]);			//dodaj tag do kontenera tagów
		}
		
		//zdarzenie kliknięcia w przycisk zapisz
		this.element.submit.addEventListener('click', () => {
			this.callback({
				title : this.element.title.value,
				content : this.element.content.value,
				color : this.getColor(),
				pin : this.element.pin.checked,
				modify_at : new Date().plDateTime(),
				remaind_at : this.element.remaind_at.value,
				tags : this.tags.join(';')
			});
		});
		
	}

};