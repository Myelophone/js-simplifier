'use strict';

if (window.location.pathname.indexOf('/turbo?') != -1) {
	var $url = window.location.pathname.split('text=')[1];
	window.location.replace(decodeURIComponent($url));
} else if (window.location.pathname.indexOf('/amp/s/') != -1) {
	var $url = window.location.pathname.split('/amp/s/')[1];
	window.location.replace(decodeURIComponent($url));
}

function trueOrFalse(string) {
	try {
		switch (string.toLowerCase().trim()) {
			case true:
			case 'true':
			case 'yes':
			case '1':
			case 1:
				return true;
			case false:
			case 'false':
			case 'no':
			case '0':
			case 0:
			case null:
				return false;
			default:
				return string;
		}
	} catch (e) {
		return string;
	}
}

/* QuotaExceededError: DOM Exception 22 error */
/* И проверка доступа к storage - иначе сайт может не открыться */
try {
	if ('localStorage' in window && typeof localStorage === 'object') {
		localStorage.setItem('QuotaExceededError', 1);
		localStorage.removeItem('QuotaExceededError');
	}
} catch (e) {
	var checkedstorage = true;
	if (e.code === DOMException.QUOTA_EXCEEDED_ERR && storage.length === 0) {
		var incognitoMode = true;
	}
	try {
		localStorage.clear();
	} catch (e) {}
}

function cache(key, value) {
	try {
		if (window.sessionStorage && typeof key !== 'undefined') {
			if (typeof value == 'undefined') {
				if (typeof sessionStorage[key] !== 'undefined') {
					return trueOrFalse(sessionStorage.getItem(key));
				}
			} else {
				sessionStorage.setItem(key, value);
				return trueOrFalse(value);
			}
		}
		return false;
	} catch (e) {
		return false;
	}
}

if (!cache('sessioncached')) {
	var isSimplePhone = Math.min(screen.width, screen.height) <= 360;
	cache('isSimplePhone', isSimplePhone);

	var isSafari =
		Object.prototype.toString.call(window.safari) ===
			'[object SafariRemoteNotification]' ||
		(typeof safari !== 'undefined' && safari.pushNotification);
	cache('isSafari', isSafari);

	var isFirefox =
		typeof InstallTrigger !== 'undefined' ||
		!!window.sidebar ||
		'MozAppearance' in document.documentElement.style ||
		/^function \(/.test([].sort);
	cache('isFirefox', isFirefox);

	var supportsServiceWorker = 'serviceWorker' in navigator;
	cache('supportsServiceWorker', supportsServiceWorker);

	if (!incognitoMode) {
		var incognitoMode = false;
		try {
			window.indexedDB.open('incognito');
		} catch (e) {
			incognitoMode = true;
		}
		if (
			window.safariIncognito ||
			checkedstorage ||
			!navigator.cookieEnabled
		) {
			incognitoMode = true;
		}
		if (isSafari) {
			try {
				window.openDatabase(null, null, null, null);
			} catch (e) {
				incognitoMode = true;
			}
		}
		if (
			!window.indexedDB &&
			(window.PointerEvent || window.MSPointerEvent)
		) {
			incognitoMode = true;
		}
		if (isFirefox && !supportsServiceWorker) {
			incognitoMode = true;
		}
		if (isSafari) {
			try {
				incognitoMode = safari.self.browserWindow.activeTab.private;
			} catch (e) {
				incognitoMode = true;
			}
		}
	}
	cache('incognitoMode', incognitoMode);

	cache('sessioncached', true);
} else {
	var isSimplePhone = cache('isSimplePhone');
	var isSafari = cache('isSafari');
	var isFirefox = cache('isFirefox');
	var supportsServiceWorker = cache('supportsServiceWorker');
	var incognitoMode = cache('incognitoMode');
}

var conntype = 'unknown';
var slowinternet = false;
if ('connection' in navigator && document.addEventListener) {
	var connection =
		navigator.connection ||
		navigator.mozConnection ||
		navigator.webkitConnection;
	conntype = connection.effectiveType;
	if (
		navigator.connection.saveData === true ||
		conntype === 'slow-2g' ||
		conntype === '2g'
	) {
		slowinternet = true;
	}
	function updateConnectionStatus() {
		conntype = connection.effectiveType;
		if (
			navigator.connection.saveData === true ||
			conntype === 'slow-2g' ||
			conntype === '2g'
		) {
			slowinternet = true;
		}
	}
	connection.addEventListener('change', updateConnectionStatus);
}
if (isSimplePhone) {
	slowinternet = true;
}

(function (global) {
	var $$ = global.$;
	var version = '0.2';

	var methodRegistry = {};

	function $(selector, context) {
		context = context || document;

		var elements;

		if (typeof selector === 'string') {
			if (selector.indexOf(':contains(') > -1) {
				var text = selector.match(/:contains\(([^)]+)\)/)[1];
				elements = [];
				var allElements = context.querySelectorAll('*');
				for (var i = 0; i < allElements.length; i++) {
					if (allElements[i].textContent.indexOf(text) > -1) {
						elements.push(allElements[i]);
					}
				}
			} else {
				elements = context.querySelectorAll(selector);
			}
		} else if (selector instanceof NodeList || selector instanceof Array) {
			elements = selector;
		} else {
			elements = [selector];
		}

		var elementsArray = Array.prototype.slice.call(elements);

		elementsArray.click = function (handler) {
			return this.on('click', handler);
		};

		elementsArray.dblclick = function (handler) {
			return this.on('dblclick', handler);
		};

		elementsArray.focus = function () {
			if (this.length) {
				this[0].focus();
			}
			return this;
		};

		elementsArray.clone = function () {
			var clonedElements = [];
			for (var i = 0; i < this.length; i++) {
				clonedElements.push(this[i].cloneNode(true));
			}
			return $(clonedElements);
		};

		elementsArray.closest = function (selector) {
			var foundElements = [];
			for (var i = 0; i < this.length; i++) {
				var el = this[i].closest(selector);
				if (el && foundElements.indexOf(el) === -1) {
					foundElements.push(el);
				}
			}
			return $(foundElements);
		};

		elementsArray.empty = function () {
			for (var i = 0; i < this.length; i++) {
				this[i].innerHTML = '';
			}
			return this;
		};

		elementsArray.fadeIn = function (duration) {
			duration = duration || 400;
			for (var i = 0; i < this.length; i++) {
				this[i].style.opacity = 0;
				this[i].style.display = '';
				(function (el) {
					var last = +new Date();
					var tick = function () {
						el.style.opacity =
							+el.style.opacity + (new Date() - last) / duration;
						last = +new Date();
						if (+el.style.opacity < 1) {
							requestAnimationFrame(tick);
						}
					};
					tick();
				})(this[i]);
			}
			return this;
		};

		elementsArray.fadeOut = function (duration) {
			duration = duration || 400;
			for (var i = 0; i < this.length; i++) {
				(function (el) {
					el.style.opacity = 1;
					var last = +new Date();
					var tick = function () {
						el.style.opacity =
							+el.style.opacity - (new Date() - last) / duration;
						last = +new Date();
						if (+el.style.opacity > 0) {
							requestAnimationFrame(tick);
						} else {
							el.style.display = 'none';
						}
					};
					tick();
				})(this[i]);
			}
			return this;
		};

		elementsArray.scrollTo = function () {
			if (this.length) {
				this[0].scrollIntoView({ behavior: 'smooth' });
			}
			return this;
		};

		elementsArray.has = function (selector) {
			var foundElements = [];
			for (var i = 0; i < this.length; i++) {
				if (this[i].querySelector(selector)) {
					foundElements.push(this[i]);
				}
			}
			return $(foundElements);
		};

		elementsArray.height = function (value) {
			if (value === undefined) {
				return this.length ? this[0].offsetHeight : null;
			} else {
				for (var i = 0; i < this.length; i++) {
					this[i].style.height = value + 'px';
				}
				return this;
			}
		};

		elementsArray.width = function (value) {
			if (value === undefined) {
				return this.length ? this[0].offsetWidth : null;
			} else {
				for (var i = 0; i < this.length; i++) {
					this[i].style.width = value + 'px';
				}
				return this;
			}
		};

		elementsArray.innerHeight = function () {
			return this.length ? this[0].clientHeight : null;
		};

		elementsArray.innerWidth = function () {
			return this.length ? this[0].clientWidth : null;
		};

		elementsArray.hover = function (hoverIn, hoverOut) {
			return this.on('mouseenter', hoverIn).on(
				'mouseleave',
				hoverOut || hoverIn
			);
		};

		elementsArray.unique = function () {
			return $(Array.from(new Set(this)));
		};

		elementsArray.one = function (event, handler) {
			var self = this;
			var oneTimeHandler = function (e) {
				handler.call(this, e);
				self.off(event, oneTimeHandler);
			};
			return this.on(event, oneTimeHandler);
		};

		elementsArray.on = function (event, callback) {
			for (var i = 0; i < this.length; i++) {
				this[i].addEventListener(event, callback);
			}
			return this;
		};

		elementsArray.off = function (event, callback) {
			for (var i = 0; i < this.length; i++) {
				this[i].removeEventListener(event, callback);
			}
			return this;
		};

		elementsArray.css = function (property, value) {
			for (var i = 0; i < this.length; i++) {
				this[i].style[property] = value;
			}
			return this;
		};

		elementsArray.hide = function () {
			for (var i = 0; i < this.length; i++) {
				this[i].style.display = 'none';
			}
			return this;
		};

		elementsArray.show = function () {
			for (var i = 0; i < this.length; i++) {
				this[i].style.display = '';
			}
			return this;
		};

		elementsArray.addClass = function (className) {
			for (var i = 0; i < this.length; i++) {
				this[i].classList.add(className);
			}
			return this;
		};

		elementsArray.removeClass = function (className) {
			for (var i = 0; i < this.length; i++) {
				this[i].classList.remove(className);
			}
			return this;
		};

		elementsArray.toggleClass = function (className) {
			for (var i = 0; i < this.length; i++) {
				this[i].classList.toggle(className);
			}
			return this;
		};

		elementsArray.html = function (htmlContent) {
			if (htmlContent === undefined) {
				return this[0].innerHTML;
			} else {
				for (var i = 0; i < this.length; i++) {
					this[i].innerHTML = htmlContent;
				}
				return this;
			}
		};

		elementsArray.text = function (textContent) {
			if (textContent === undefined) {
				return this[0].textContent;
			} else {
				for (var i = 0; i < this.length; i++) {
					this[i].textContent = textContent;
				}
				return this;
			}
		};

		elementsArray.attr = function (attribute, value) {
			if (value === undefined) {
				return this[0].getAttribute(attribute);
			} else {
				for (var i = 0; i < this.length; i++) {
					this[i].setAttribute(attribute, value);
				}
				return this;
			}
		};

		elementsArray.removeAttr = function (attribute) {
			for (var i = 0; i < this.length; i++) {
				this[i].removeAttribute(attribute);
			}
			return this;
		};

		elementsArray.append = function (content) {
			for (var i = 0; i < this.length; i++) {
				if (typeof content === 'string') {
					this[i].insertAdjacentHTML('beforeend', content);
				} else {
					this[i].appendChild(content.cloneNode(true));
				}
			}
			return this;
		};

		elementsArray.prepend = function (content) {
			for (var i = 0; i < this.length; i++) {
				if (typeof content === 'string') {
					this[i].insertAdjacentHTML('afterbegin', content);
				} else {
					this[i].insertBefore(
						content.cloneNode(true),
						this[i].firstChild
					);
				}
			}
			return this;
		};

		elementsArray.each = function (callback) {
			for (var i = 0; i < this.length; i++) {
				callback.call(this[i], i, this[i]);
			}
			return this;
		};

		elementsArray.parent = function () {
			var parents = [];
			for (var i = 0; i < this.length; i++) {
				var parent = this[i].parentElement;
				if (parent && parents.indexOf(parent) === -1) {
					parents.push(parent);
				}
			}
			return $(parents);
		};

		elementsArray.children = function () {
			var children = [];
			for (var i = 0; i < this.length; i++) {
				children = children.concat(
					Array.prototype.slice.call(this[i].children)
				);
			}
			return $(children);
		};

		elementsArray.remove = function () {
			for (var i = 0; i < this.length; i++) {
				this[i].parentElement.removeChild(this[i]);
			}
			return this;
		};

		for (var method in methodRegistry) {
			if (methodRegistry.hasOwnProperty(method)) {
				elementsArray[method] = methodRegistry[method];
			}
		}

		return elementsArray;
	}

	$.isHTML = function (str) {
		var a = document.createElement('div');
		a.innerHTML = str;
		for (var c = a.childNodes, i = c.length; i--; ) {
			if (c[i].nodeType == 1) return true;
		}
		return false;
	};

	$.isFunction = function (obj) {
		return typeof obj === 'function' && typeof obj.nodeType !== 'number';
	};

	$.isString = function (str) {
		return typeof str === 'string' || str instanceof String;
	};

	$.isArray = function (obj) {
		return Array.isArray(obj);
	};

	$.trim = function (text) {
		var whitespace = '[\\x20\\t\\r\\n\\f]';
		var rtrim = new RegExp(
			'^' +
				whitespace +
				'+|((?:^|[^\\\\])(?:\\\\.)*)' +
				whitespace +
				'+$',
			'g'
		);
		return text == null ? '' : (text + '').replace(rtrim, '');
	};

	$.stopEvent = function (e) {
		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
	};

	$.clearInputFile = function (f) {
		if (f.value) {
			try {
				f.value = ''; //for IE11, latest Chrome/Firefox/Opera...
			} catch (err) {}
			if (f.value) {
				//for IE5 ~ IE10
				var form = document.createElement('form'),
					ref = f.nextSibling;
				form.appendChild(f);
				form.reset();
				ref.parentNode.insertBefore(f, ref);
			}
		}
	};

	$.ajax = function (options) {
		var xhr = new XMLHttpRequest();
		var method = options.method || 'GET';
		var url = options.url || '';
		var async = options.async !== false;
		var data = options.data || null;
		var headers = options.headers || {};
		var success = options.success || function () {};
		var error = options.error || function () {};
		var contentType =
			options.contentType ||
			'application/x-www-form-urlencoded; charset=UTF-8';

		xhr.open(method, url, async);

		if (contentType) {
			xhr.setRequestHeader('Content-Type', contentType);
		}

		for (var header in headers) {
			if (headers.hasOwnProperty(header)) {
				xhr.setRequestHeader(header, headers[header]);
			}
		}

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 300) {
					var response = xhr.responseText;
					try {
						response = JSON.parse(response);
					} catch (e) {
						// response is not JSON
					}
					success(response, xhr.status, xhr);
				} else {
					error(xhr, xhr.status, xhr.statusText);
				}
			}
		};

		if (method === 'GET' || !data) {
			xhr.send();
		} else {
			if (
				typeof data === 'object' &&
				contentType.includes('application/x-www-form-urlencoded')
			) {
				data = Object.keys(data)
					.map(function (key) {
						return (
							encodeURIComponent(key) +
							'=' +
							encodeURIComponent(data[key])
						);
					})
					.join('&');
			} else if (
				typeof data === 'object' &&
				contentType.includes('application/json')
			) {
				data = JSON.stringify(data);
			}
			xhr.send(data);
		}
	};

	$.get = function (url, success, error) {
		return $.ajax({
			method: 'GET',
			url: url,
			success: success,
			error: error,
		});
	};

	$.post = function (url, data, success, error, contentType) {
		return $.ajax({
			method: 'POST',
			url: url,
			data: data,
			contentType:
				contentType ||
				'application/x-www-form-urlencoded; charset=UTF-8',
			success: success,
			error: error,
		});
	};

	$.ready = function (callback) {
		if (
			document.readyState === 'complete' ||
			document.readyState === 'interactive'
		) {
			callback();
		} else {
			document.addEventListener('DOMContentLoaded', callback);
		}
	};

	$.allLoaded = function (callback) {
		if (document.readyState === 'complete') {
			callback();
		} else {
			window.addEventListener('load', callback);
		}
	};

	$.noConflict = function () {
		global.$ = $$;
		return $;
	};

	$.extend = function (methods) {
		for (var method in methods) {
			if (methods.hasOwnProperty(method)) {
				methodRegistry[method] = methods[method];
			}
		}
	};

	$.parseurl = function (strUrl) {
		/* https://github.com/addyosmani/parsely - a comprehensive URL parser */
		var uri = {},
			keys = [
				'source',
				'protocol',
				'authDomain',
				'authLogin',
				'user',
				'password',
				'host',
				'port',
				'relative',
				'path',
				'dir',
				'file',
				'query',
				'anchor',
			],
			i = keys.length,
			n =
				/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
			m = n.exec(strUrl),
			ext = ['path', 'dir', 'anchor'],
			c = ext.length;
		(k = /(?:^|&)([^&=]*)=?([^&]*)/g), (l = /(?:[^\/\\]+|\\.)+/g);
		while (i--) uri[keys[i]] = m[i] || '';
		uri['queries'] = {};
		uri['query'].replace(k, function ($0, $1, $2) {
			if ($1) uri['queries'][$1] = $2;
		});
		while (c--) uri[ext[c] + 's'] = uri[ext[c]].match(l) || '';
		return uri;
	};
	//$.parseurl( url );

	$.domain = function (url) {
		var domain = url
			.replace('http://', '')
			.replace('https://', '')
			.replace('ftp://', '')
			.replace('//', '')
			.split(/[/?#]/)[0]
			.split(':')[0]
			.replace('www.', '')
			.split('.');
		/* https://stackoverflow.com/a/45214334 */
		var firstTLDs =
			'ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|be|bf|bg|bh|bi|bj|bm|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|cl|cm|cn|co|cr|cu|cv|cw|cx|cz|de|dj|dk|dm|do|dz|ec|ee|eg|es|et|eu|fi|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|im|in|io|iq|ir|is|it|je|jo|jp|kg|ki|km|kn|kp|kr|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|na|nc|ne|nf|ng|nl|no|nr|nu|nz|om|pa|pe|pf|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|yt'.split(
				'|'
			);
		var secondTLDs =
			'com|edu|gov|net|mil|org|nom|sch|caa|res|off|gob|int|tur|ip6|uri|urn|asn|act|nsw|qld|tas|vic|pro|biz|adm|adv|agr|arq|art|ato|bio|bmd|cim|cng|cnt|ecn|eco|emp|eng|esp|etc|eti|far|fnd|fot|fst|g12|ggf|imb|ind|inf|jor|jus|leg|lel|mat|med|mus|not|ntr|odo|ppg|psc|psi|qsl|rec|slg|srv|teo|tmp|trd|vet|zlg|web|ltd|sld|pol|fin|k12|lib|pri|aip|fie|eun|sci|prd|cci|pvt|mod|idv|rel|sex|gen|nic|abr|bas|cal|cam|emr|fvg|laz|lig|lom|mar|mol|pmn|pug|sar|sic|taa|tos|umb|vao|vda|ven|mie|北海道|和歌山|神奈川|鹿児島|ass|rep|tra|per|ngo|soc|grp|plc|its|air|and|bus|can|ddr|jfk|mad|nrw|nyc|ski|spy|tcm|ulm|usa|war|fhs|vgs|dep|eid|fet|fla|flå|gol|hof|hol|sel|vik|cri|iwi|ing|abo|fam|gok|gon|gop|gos|aid|atm|gsm|sos|elk|waw|est|aca|bar|cpa|jur|law|sec|plo|www|bir|cbg|jar|khv|msk|nov|nsk|ptz|rnd|spb|stv|tom|tsk|udm|vrn|cmw|kms|nkz|snz|pub|fhv|red|ens|nat|rns|rnu|bbs|tel|bel|kep|nhs|dni|fed|isa|nsn|gub|e12|tec|орг|обр|упр|alt|nis|jpn|mex|ath|iki|nid|gda|inc'.split(
				'|'
			);

		while (domain.length > 3) {
			domain.shift();
		}

		if (
			domain.length === 3 &&
			((domain[1].length > 2 && domain[2].length > 2) ||
				(secondTLDs.indexOf(domain[1]) === -1 &&
					firstTLDs.indexOf(domain[2]) === -1))
		) {
			domain.shift();
		}

		return domain.join('.');
	};

	$.setQuery = function (params) {
		if (!params || typeof params !== 'object') {
			throw new Error('The params argument must be an object.');
		}

		var url = new URL(window.location.href);

		Object.keys(params).forEach(function (key) {
			var value = params[key];
			if (value === null || value === undefined) {
				url.searchParams.delete(key);
			} else {
				url.searchParams.set(key, value);
			}
		});

		window.history.replaceState({}, '', url.toString());
	};

	/* http://krasimirtsonev.com/blog/article/JavaScript-template-engine-in-just-20-line */
	$.templator = function (tpl, data) {
		for (var key in data) {
			if (data.hasOwnProperty(key)) {
				var re = /{%([^%>]+)?%}/g,
					match;
				while ((match = re.exec(tpl))) {
					tpl = tpl.replace(match[0], data[match[1].trim()]);
				}
			}
		}
		return tpl;
	};

	$.strip = function (html) {
		return html.replace(/(<([^>]+)>)/gi, '');
	};

	$.shuffle = function (array) {
		var currentIndex = array.length,
			temporaryValue,
			randomIndex;
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	};

	$.translit = function (str) {
		var space = '-';
		var link = '';
		var transl = {
			а: 'a',
			б: 'b',
			в: 'v',
			г: 'g',
			д: 'd',
			е: 'e',
			ё: 'e',
			ж: 'zh',
			з: 'z',
			и: 'i',
			й: 'j',
			к: 'k',
			л: 'l',
			м: 'm',
			н: 'n',
			о: 'o',
			п: 'p',
			р: 'r',
			с: 's',
			т: 't',
			у: 'u',
			ф: 'f',
			х: 'h',
			ц: 'c',
			ч: 'ch',
			ш: 'sh',
			щ: 'sh',
			ъ: space,
			ы: 'y',
			ь: space,
			э: 'e',
			ю: 'yu',
			я: 'ya',
		};
		if (str != '') {
			str = str.toLowerCase();
		}
		for (var i = 0; i < str.length; i++) {
			if (/[а-яё]/.test(str.charAt(i))) {
				link += transl[str.charAt(i)];
			} else if (/[a-z0-9]/.test(str.charAt(i))) {
				link += str.charAt(i);
			} else {
				if (link.slice(-1) !== space) link += space;
			}
		}
		return link;
	};

	$.generateId = function () {
		var a = 'abcdefghijklmnopqrstuv';
		var l = a.length;
		var t = new Date().getTime();
		var r = [0, 0, 0]
			.map(function (d) {
				return a[Math.floor(Math.random() * l)];
			})
			.join('');
		return '' + r + t;
	};

	$.favicon = function (icon) {
		if (!icon) return;
		var link =
			document.querySelector("link[rel*='icon']") ||
			document.createElement('link');
		var oldLink = document.getElementById('dynamic-favicon');
		link.type = 'image/x-icon';
		link.rel = 'shortcut icon';
		link.id = 'dynamic-favicon';
		link.href = icon;
		if (oldLink) {
			document.getElementsByTagName('head')[0].removeChild(oldLink);
		}
		document.getElementsByTagName('head')[0].appendChild(link);
	};

	$.vibrate = function (time = 100) {
		if (window.navigator.vibrate) {
			window.navigator.vibrate(time);
		}
	};

	$.randomTrueFalse = function () {
		return rand(0, 1) == 1;
	};

	$.arrayRemove = function (array, value) {
		var index = array.indexOf(value);
		if (index >= 0) {
			array.splice(index, 1);
		}
		return index;
	};

	$.info = function () {
		console.log('MyelophOne js-simplifier v' + version);
	};

	global.$ = $;
})(this);
