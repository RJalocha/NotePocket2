const App = {
	
	notes : null,	//tablica na notatki
	pin : null,		//element kontenera na notatki przypięte
	main : null,	//element kontenera na notatki
	
	storage : null,	//objekt komunikacji z localStorage
	editor : null,	//obiekt edytora
	
	searchInterval : setTimeout(() => {}, 10), //uchwyt na interwał do wyszukiwarki
	
	notificationTimer : 0,			//licznik czasu dla uruchomienia sprawdzenia notyfikacji
	notificationUpdateTime : 60000,	//czas do uruchomienia sprawdzenia notyfikacji

	lastTime : 0, 					//czas ostatniego uruchomienia pętli apliakcji

	//"konstruktor"
	create : function() {
		
		Notify.init();					//zainicjowanie notyfikacji
	
		let obj = Object.create(this);	//tworzenie obiektu
		obj.init();						//uruchomienie metody inicjującej
		return obj;						//zwrócenie obiektu
	
	},
	
	//inicjacja
	init : function() {
		
		this.pin = document.getElementById('section-pin');		//załadowanie elementu na przypięte notatki
		this.main = document.getElementById('section-main');	//załadowanie elementu na zwykłe notatki
		
		this.notes = new Array();			//reset tablicy na notatki
		
		this.storage = Storage.create();	//stworzenie obiektu localStorage
		this.editor = Editor.create();		//stworzenie obiektu edytora
		
		if(this.storage.loaded()) {			//jeśli odczytano dane z localStorage
			
			let data = this.storage.getData();	//pobranie danych z obiektu localStorage do tablicy lokalnej
			
			for(let note of data)				//przeskoczenie po wszystkich danych pobranych do tablicy lokalnej
				this.notes.push(Note.create(note, this.editor));	//stworzenie nowego obiektu notatki i dodanie go do tablicy notatek
			
			for(let note of this.notes)			//przeskoczenie po wszystkich notatkach
				this.add(note);					//uruchomienie funkcji dodajacej notatke na stronę
			
		}
		
		//zdarzenie kliknięcia w przycisk "Dodaj notatkę"
		document.getElementById('add_note').addEventListener('click', () => {
			this.editor.show({
				title: '',
				content: '',
				color: 'turquoise',
				pin: false,
				remaind_at: '',
				tags : null
			}, data => {
				
				const note = Note.create(data, this.editor);
				note.is_modify = true;
				this.notes.push(note);
				
				this.notes[this.notes.length - 1].edit();
				
			});
		});
		
		//zdarzenie wpisania treści w pole wyszukiwarki
		document.getElementById('search_bar').addEventListener('input', (e) => this.search(e.target.value) );
		
		this.lastTime = new Date().getTime();
		this.loop();
		
	},
	
	//pętla aplikacji
	loop : function() {
		
		this.updater();						//uruchomienie aktualizacji notatek
		
		let now = new Date().getTime();		//pobranie aktualnego czasu
		let delay = now - this.lastTime;	//wyliczenie rożniczy czasu od ostatniej iteracji
		this.lastTime = now;				//ustawienie aktualnego czasu jak czas ostatniej iteracji
		
		this.notificationTimer += delay;	//dodanie do licznika czasu notydikacji rózniczy czasu pomiędzy iteracjiami
		if(this.notificationTimer >= this.notificationUpdateTime) {	//jeśli licznik czasu osiągnął wartość równą lub większą niż czas na sprawdzenie notyfikacji
			this.notificationTimer -= this.notificationUpdateTime;	//odejmij od licznika czasu czas srawdzenia
			this.notification();			//sprawdz notyfikacje
		}
		
		requestAnimationFrame(() => this.loop());	//uruchom ponownie funkcję loop / nowa iteracja
		
	},
	
	//sprawdzanie czy wprowadzono zmiany w jakiejkolwiek notatce lub czy stworzono nową
	updater : function() {
		
		let update = false;								//flaga pomocnicza do zapisania zmian w przypadku ich wystąpienia
		
		for(let i = 0; i < this.notes.length; i++) {	//przeskakuje po wszystkich notatkach w poszukiwaniu zmian
			
			if(this.notes[i].to_drop) {					//jeśli notatka ma być usunięta
				this.remove(this.notes[i].element.note);//usunięcie notatki ze strony
				this.notes.splice(i, 1);				//usuń z listy notatek
				update = true;							//zmiana flagi pomocniczej na prawde
			}
		
			if(this.notes[i].is_modify) {				//jesli notatka była modyfikowana to
				this.notes[i].is_modify = false;		//reset flagi modyfikacji dla notatki
				this.add(this.notes[i]);				//przypięcie notatki do odpowiedniego kontenera w momencie wykrycia zmian
				update = true;							//zmiana flagi pomocniczej na prawde
			}
		}
		
		
		
		if(update) {													//JEŻELI była jakaś zmiana w notatkach TO
			this.save();							 					//zapisz localStorage
			this.search(document.getElementById('search_bar').value);	//uruchom wyszukiwanie aby odfiltrować zmodyfikowane notatki
		}
		
	},
	
	//wyszukiwanie notatek w argumencie szukana fraza
	search : function(target) {
		
		if(this.notes.length) {							//wyszukuje tylko jeśli istnieją już jakieś notatki
			
			clearTimeout(this.searchInterval);			//wyczyszczenie interwału aby nie wykonywało wcześniejszych wyszukań
			
			this.searchInterval = setTimeout(() => {	//uruchomienie nowego interwału po 0.5 sekundy
					
				target = target.toLowerCase();			//konwertuje wszystkie duże litery do małych w frazie
				
				for(let i = 0; i < this.notes.length; i++) {	//przeskakuje po wszystkich notatkach
				
					if(																//JEŻELI
						this.notes[i].title.toLowerCase().indexOf(target) >= 0 ||	//w tytule notatki przekonwertowanym na małe litery istnieje szukana fraza LUB
						this.notes[i].content.toLowerCase().indexOf(target) >= 0 ||	//w treści notatki przekonwertowanym na małe litery istnieje szukana fraza
						this.notes[i].tags.toLowerCase().indexOf(target) >= 0		//w tagach notatki przekonwertowanych na małe litery istnieje szukana fraza
					) this.notes[i].show();											//TO pokaż notatkę
					else this.notes[i].hide();										//W PRZECIWNY WYPADKU ukryj
					
				}
				
			}, 500);									//czas uruchomienia do iterwału
			
		}
		
	},
	
	//obsługa notyfikacji
	notification : function() {

		if(this.notes.length) {			//sprawdzaj tylko jeśli istnieją notatki
		
			let now = new Date().plDateTime();		//pobranie aktualnej daty w odpowiednim formacie
			
			for(let i = 0; i < this.notes.length; i++) {	//przeskoczenie po wszystkich notatkach
				
				let remaind_at = this.notes[i].remaind_at;	//pobranie czasu przypomnienia dla notatki
				
				if(remaind_at == '') continue;				//jeżeli notatka nie ma ustawionego czasu przypomnienia to jest pomijana
				else if(remaind_at == now)										//jeśli czas przypomnienia jest rózny obecnemu czasowi to
					Notify.show(this.notes[i].title, this.notes[i].content);	//wyświetlenie notyfikacji
			}
		
		}
		
	},
	
	//umieszczenie notatki na stronie
	add : function(note) {
		
		if(note.pin) {									//jeśli notatka ma być przypięta
			if(note.getElement().parentNode == null || note.getElement().parentNode.id != this.pin.id) //jeśli element nie ma rodzica lub jego rodzicem nie jest górna cześć strony
				this.pin.insertAdjacentElement('afterbegin', note.getElement());	//to przypnij notatkę na początku listy	
		} else {										//w przeciwnym wypadku jest umieszczana w dolnej części strony
			if(note.getElement().parentNode == null || note.getElement().parentNode.id != this.main.id) //jeśli element nie ma rodzica lub jego rodzicem nie jest dolna cześć strony na notatki
				this.main.insertAdjacentElement('afterbegin', note.getElement());	//to przypnij notatkę na początku listy
		}
	},
	
	//usunięcie notatki ze storny
	remove : function(note) { note.parentNode.removeChild(note); },
	
	//wygenerowanie danych do localStorage i zapisanie
	save : function() {
		
		this.storage.content = [];		//wyczyszczenie tablica na dane notatek w localStorage
		
		for(let i = 0; i < this.notes.length; i++) {	//przeskoczenie po wszystkich notatkach
		
			let note = this.notes[i];
		
			this.storage.content.push({	//dodanie notatek do tablicy danych z notatek w localStorage
				title : note.title,
				content : note.content,
				color : note.color,
				pin : note.pin,
				modify_at : note.modify_at,
				remaind_at : note.remaind_at,
				tags : note.tags
			});
			
		}
			
		this.storage.save();			//zapisanie localStorage
		
	}

};

//uruchomienie klasy aplikacji po załadowaniu strony
window.addEventListener('load', () => { App.create(); });