/*****
    Copyright 2010-2012 - timmaeh.de
	Description: DisplayRotate Plugin for jQuery
	Author: Tim Elbert
	Date: 21-06-2012
	All rights reserved.
*****/

jQuery.DR = {

	//Interne Variablen
	vars: {
		target: '',
		interval: '',
		intervalActive: 0,
		switchCounter: 0
	},

	//Externe Variablen, von außen steuerbar
	options: {
		progressBar: '',
		progressRate: '',
		currentDisplay: 'DR_current',
		nextDisplay: 'DR_next',
		lastDisplay: 'DR_last',
		entryClass: 'DR_entry',
		switchDuration: 10000,
		fadeDuration: 500,
		width: 0,
		reverse: 0
		},

	//Initiale Funktion, startet alle benötigten Routinen
	init: function(options){
		options = options || {};
		$.extend($.DR.options, options); //Überschreibe Standardoptionen mit externen Optionen

		$.DR.vars.target = $(this);
		
		//Definiere erstes, nächstes & letztes Display
		$(this).children('.' + $.DR.options.entryClass + ':first-child').addClass($.DR.options.currentDisplay);
		$('.' + $.DR.options.currentDisplay).next('.' + $.DR.options.entryClass).addClass($.DR.options.nextDisplay);
		$.DR.vars.target.children('.' + $.DR.options.entryClass).last().addClass($.DR.options.lastDisplay);
		
		$.DR.startInterval(); //Startet Zählintervall
		
		return;
	},

	//Updatefunktion zum Updaten der Optionen
	update: function(options){
		options = options || {};
		$.extend($.DR.options, options); //Überschreibe Programmoptionen mit externen Optionen
		return;
	},

	//Funktionscontainer
	f: {

		//Zeigt nächstes Display bei Funktionsaufruf
		next: function(options){
			options = options || {resetSwitchCounter: 0}; //Liest Optionen ein bzw. setzt Standartoption
			
			//Überschreibt Funktionen bis Animationsende
			$.DR.next = function(options){return;}
			$.DR.last = function(options){return;}	

			//Animation
			$('.' + $.DR.options.currentDisplay).animate({'margin-top': '-' + $('.' + $.DR.options.currentDisplay).height() + 'px'}, $.DR.options.fadeDuration, function(){
				$('.' + $.DR.options.currentDisplay).insertAfter('.' + $.DR.options.lastDisplay);
				$('.' + $.DR.options.lastDisplay).removeClass($.DR.options.lastDisplay);
				$('.' + $.DR.options.currentDisplay).removeClass($.DR.options.currentDisplay).addClass($.DR.options.lastDisplay).css('margin-top', '0');
				$('.' + $.DR.options.nextDisplay).removeClass($.DR.options.nextDisplay).addClass($.DR.options.currentDisplay);
				$('.' + $.DR.options.currentDisplay).next('.' + $.DR.options.entryClass).addClass($.DR.options.nextDisplay);

				//Schreibt Funktionen in alte Funktionsaufrufe
				$.DR.next = $.DR.f.next;
				$.DR.last = $.DR.f.last;
			});

			//Setzt die Progressbar zurück, wenn definiert
			if(options.resetSwitchCounter){
				$.DR.vars.switchCounter = 0;
				$($.DR.options.progressRate).css('width', '0px');
			}
			return;
		},

		//Zeigt letztes Display bei Funktionsaufruf
		last: function(options){
			options = options || {resetSwitchCounter: 0}; //Liest Optionen ein bzw. setzt Standartoption

			//Überschreibt Funktionen bis Animationsende
			$.DR.next = function(options){return;}
			$.DR.last = function(options){return;}

			//Animation
			$('.' + $.DR.options.lastDisplay).insertBefore('.' + $.DR.options.currentDisplay).css('margin-top', '-' + $('.' + $.DR.options.lastDisplay).height() + 'px');
			$('.' + $.DR.options.lastDisplay).removeClass($.DR.options.lastDisplay).addClass('DR_temp_display');
			$('.' + $.DR.options.nextDisplay).removeClass($.DR.options.nextDisplay).addClass($.DR.options.lastDisplay);
			$('.' + $.DR.options.currentDisplay).removeClass($.DR.options.currentDisplay).addClass($.DR.options.nextDisplay);
			$('.DR_temp_display').removeClass('DR_temp_display').addClass($.DR.options.currentDisplay);
			$('.' + $.DR.options.currentDisplay).animate({'margin-top': '0px'}, $.DR.options.fadeDuration, function(){

				//Schreibt Funktionen in alte Funktionsaufrufe
				$.DR.next = $.DR.f.next;
				$.DR.last = $.DR.f.last;
			});

			//Setzt die Progressbar zurück, wenn definiert
			if(options.resetSwitchCounter){
				$.DR.vars.switchCounter = 0;
				$($.DR.options.progressRate).css('width', '0px');
			}
			return;
		}
	},

	//Funktionsaufruf für nächstes Display
	next: function(options){
		$.DR.f.next(options);
		return;
	},

	//Funktionsaufruf für letztes Display
	last: function(options){
		$.DR.f.last(options);
		return;
	},

	//Starte Zählintervall
	startInterval: function(){
		if($.DR.vars.intervalActive > 0) return; //Kein Start, wenn Zählintervall bereits läuft
		$.DR.vars.interval = setInterval('$.DR.progress()', 25);
		$.DR.vars.intervalActive = 1;

		//Definiere Bereich & Event für Zählintervall-Stopp
		$.DR.vars.target.unbind('mouseleave focusout').bind('mouseover focusin', function(event){
			$.DR.stoppInterval(event);
		});
	},

	//Stoppe Zählintervall
	stoppInterval: function(event){
		if($.DR.vars.intervalActive < 1) return; //Kein Stopp, wenn Zählintervall nicht läuft
		clearInterval($.DR.vars.interval);
		$.DR.vars.intervalActive = 0;
		
		//Definiere Bereich & Event für Zählintervall-Start
		var new_event = (event.type == 'mouseover') ? 'mouseleave' : 'focusout';
		$.DR.vars.target.unbind(event.type).bind(new_event, function(){
			$.DR.startInterval();
		});
	},

	//Progress-Funktion: Setzt Switchcounter & Breite der ProgressRate
	progress: function(){
		
		//Setze Breite der ProgressRate, wenn definiert
		if($.DR.options.progressBar > '' && $.DR.options.progressRate > ''){
			$($.DR.options.progressBar).each(function(){
				var width = ($(this).width() - 10) * $.DR.vars.switchCounter / $.DR.options.switchDuration;
				$(this).find($.DR.options.progressRate).css('width', width + 'px');
			});
		}
		
		//Schalte um zu nächstem/letztem Display oder zähle Switchcounter hoch
		if($.DR.vars.switchCounter >= $.DR.options.switchDuration){
			if($.DR.options.reverse != 0) $.DR.last({resetSwitchCounter: 1});
			else $.DR.next({resetSwitchCounter: 1});
		} else {
			$.DR.vars.switchCounter += 25;
		}
	}
}

jQuery.displayRotate = jQuery.DR;
jQuery.fn.extend({displayRotate: jQuery.DR.init}); //Schreibt Initiale Funktion in jQuery-Funktionenbibliothek