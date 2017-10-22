module.exports = this;

var https = require('https');
var cheerio = require('cheerio');
var Promise = require('promise');

//craw by artists
//check which sites are you going to use on this start and the purpose you want (lyrics cognitive, harmony classification)

this.query = function(url) {

	return new Promise(function (resolve, reject) {

		https.get(url, function(res) {

			var allData = "";

			res.on('data', function(recData) {
				if(recData)
					allData += recData.toString();
			});

			res.on('end', function() {

				$ = cheerio.load(allData);

				var musicMeta = {
					pageTitle: $('title').text(),
					title: $('h1','.cnt-head_title').text(),
					artist: $('a[itemprop=url]','.cnt-head_title').text(),
					composer: $('.letra-info_comp').text()
						.replace('Composição:  ','')
						.replace('Sabe quem é o compositor? Envie pra gente.','')
						.replace(' · Esse não é o compositor? Nos avise.',''),
					avatar: $('a[itemprop=url] img','.cnt-head_title').attr('src'),
					views: $('b','.cnt-info_exib').text(),
					url: $('[itemprop=url]','.g-pr').prop('content'),
					album: $('[itemprop=inAlbum]','.g-pr').prop('content'),
					duration: $('[itemprop=duration]','.g-pr').prop('content')
				}

				musicMeta.lyric = $('.cnt-letra','.g-pr').html()
					.replace(/<br>/g, '\n')
					.replace(/<p>/g, '\n')
					.replace(/<\/p>/g, '\n')
					.replace(/&#(\w+);/g, function (m, n) { 
						return String.fromCharCode(parseInt('0'+ n,16)); 
					})
					.replace(/&(\w+);/g, function (m, n) { 
						return getHtmlEntity(m);
					});

				var scriptString = '';

				$('script').each(function(index){
					var content = $(this).html();
					if(content.indexOf('window.__pageArgs') != -1)
						scriptString = content.substr(0,content.indexOf('var Survey'));
				});

				//Get objects appended
				var scriptObjs = getTextObjects(scriptString);

				for(var i = 0; i < scriptObjs.length; i++) {
					var obj = eval("("+scriptObjs[i]+")");
					
					for(key in obj) {
						var newKey = key.toLowerCase();

						if(musicMeta[newKey] == undefined) {
							musicMeta[newKey] = obj[key];	
						} else {
							musicMeta[newKey + ''+ i] = obj[key];
						}
						delete obj[key];
					}

					//console.log(obj);
					//console.log('');

					//musicMeta['obj' + i] = scriptObjs[i];
				}

				resolve(musicMeta);

			})

			res.resume();

		}).on('error', function() {
			reject(arguments);
		});
	});
}




function getTextObjects(text) {
	var objectsFound = [];

	var startInd = null;
	var endInd = null;

	var leftSum = 0;
	//var rightSum = 0;

	for(var i = 0; i < text.length; i++) {
		var caract = text.charAt(i);

		if(caract == '{') {
			leftSum++;
			if(leftSum == 1)
				startInd = i;
		}

		if(caract == '}') {
			leftSum--;
			if(leftSum == 0)
				endInd = i;
		}

		if(startInd != null && endInd != null) {
			objectsFound.push(text.substring(startInd,endInd+1));
			startInd = null;
			endInd = null;
		}
	}

	return objectsFound;
}

function getHtmlEntity(entity) {

	switch(entity) {

		case "&quot;": return '"';
		case "&apos;": return "'";
		case "&amp;": return '&';
		case "&lt;": return '<';
		case "&gt;": return '>';
		case "&nbsp;": return '0';
		case "&iexcl;": return '¡';
		case "&cent;": return '¢';
		case "&pound;": return '£';
		case "&curren;": return '¤';
		case "&yen;": return '¥';
		case "&brvbar;": return '¦';
		case "&sect;": return '§';
		case "&uml;": return '¨';
		case "&copy;": return '©';
		case "&ordf;": return 'ª';
		case "&laquo;": return '«';
		case "&not;": return '¬';
		case "&shy;": return '0';
		case "&reg;": return '®';
		case "&macr;": return '¯';
		case "&deg;": return '°';
		case "&plusmn;": return '±';
		case "&sup2;": return '²';
		case "&sup3;": return '³';
		case "&acute;": return '´';
		case "&micro;": return 'µ';
		case "&para;": return '¶';
		case "&middot;": return '·';
		case "&cedil;": return '¸';
		case "&sup1;": return '¹';
		case "&ordm;": return 'º';
		case "&raquo;": return '»';
		case "&frac14;": return '¼';
		case "&frac12;": return '½';
		case "&frac34;": return '¾';
		case "&iquest;": return '¿';
		case "&times;": return '×';
		case "&divide;": return '÷';
		case "&Agrave;": return 'À';
		case "&Aacute;": return 'Á';
		case "&Acirc;": return 'Â';
		case "&Atilde;": return 'Ã';
		case "&Auml;": return 'Ä';
		case "&Aring;": return 'Å';
		case "&AElig;": return 'Æ';
		case "&Ccedil;": return 'Ç';
		case "&Egrave;": return 'È';
		case "&Eacute;": return 'É';
		case "&Ecirc;": return 'Ê';
		case "&Euml;": return 'Ë';
		case "&Igrave;": return 'Ì';
		case "&Iacute;": return 'Í';
		case "&Icirc;": return 'Î';
		case "&Iuml;": return 'Ï';
		case "&ETH;": return 'Ð';
		case "&Ntilde;": return 'Ñ';
		case "&Ograve;": return 'Ò';
		case "&Oacute;": return 'Ó';
		case "&Ocirc;": return 'Ô';
		case "&Otilde;": return 'Õ';
		case "&Ouml;": return 'Ö';
		case "&Oslash;": return 'Ø';
		case "&Ugrave;": return 'Ù';
		case "&Uacute;": return 'Ú';
		case "&Ucirc;": return 'Û';
		case "&Uuml;": return 'Ü';
		case "&Yacute;": return 'Ý';
		case "&THORN;": return 'Þ';
		case "&szlig;": return 'ß';
		case "&agrave;": return 'à';
		case "&aacute;": return 'á';
		case "&acirc;": return 'â';
		case "&atilde;": return 'ã';
		case "&auml;": return 'ä';
		case "&aring;": return 'å';
		case "&aelig;": return 'æ';
		case "&ccedil;": return 'ç';
		case "&egrave;": return 'è';
		case "&eacute;": return 'é';
		case "&ecirc;": return 'ê';
		case "&euml;": return 'ë';
		case "&igrave;": return 'ì';
		case "&iacute;": return 'í';
		case "&icirc;": return 'î';
		case "&iuml;": return 'ï';
		case "&eth;": return 'ð';
		case "&ntilde;": return 'ñ';
		case "&ograve;": return 'ò';
		case "&oacute;": return 'ó';
		case "&ocirc;": return 'ô';
		case "&otilde;": return 'õ';
		case "&ouml;": return 'ö';
		case "&oslash;": return 'ø';
		case "&ugrave;": return 'ù';
		case "&uacute;": return 'ú';
		case "&ucirc;": return 'û';
		case "&uuml;": return 'ü';
		case "&yacute;": return 'ý';
		case "&thorn;": return 'þ';
		case "&yuml;": return 'ÿ';
	}

	return entity;
}
