const Notify = {
	
	init : function() {
		
		if (!Notification) {
			alert('Twoja przeglądarka nie wspiera notyfkacji!'); 
			return;
		}

		if (Notification.permission !== "granted")
			Notification.requestPermission();

	},
	
	show : function(title, content) {
		
		if (Notification.permission !== "granted")
			Notification.requestPermission();
		else {
			
			var notification = new Notification(title, {
				icon: 'resources/logo.png',
				body: content
			});

		}
		
	}
	
};