(function(){

	var d = document,
		w = window,
		ls = localStorage,
		p = (d.location.protocol == 'https:' ? 'https' : 'http') + '://',
		h = d.getElementsByTagName('head')[0],
		m = typeof alm === 'undefined' ? '' : alm,
		al,
		_ = {
			
			init: function()
			{
				if(_.isModernBrowser)
				{
					al = assets;
					_.initLocal();
				}
			},
	
			isModernBrowser: (
				'querySelector' in d &&
				'addEventListener' in w &&
				'localStorage' in w &&
				(('XMLHttpRequest' in w && 'withCredentials' in new XMLHttpRequest()) || 'XDomainRequest' in w)
			),

			canWoff2: function()
			{
				if(!("FontFace" in w))
				{
					return false;
				}

				var f = new w.FontFace("t", 'url("data:application/font-woff2,") format("woff2")', {});
				f.load().catch(function() {});

				return f.status == 'loading';
			},
	
			initLocal: function()
			{
				for(var a = 0; a < al.length; a++)
				{
					if(al[a].loaded === true) continue;
					if(m === 'dev') al[a].v = new Date().getTime();
					if(al[a].hasOwnProperty('woff2') && _.canWoff2()) al[a].file = al[a].woff2;
					al[a].fullPath = p + al[a].path + al[a].file + (al[a].v ? (al[a].file.indexOf('?') > -1 ? '&amp;' : '?') + 'v=' + al[a].v : '');
					if(m !== 'dev') _.loadLocal(a);
				}
	
				_.initExternal();
			},
	
			loadLocal: function(a)
			{
				al[a].loading = true;
				try
				{
					var c = ls.getItem(al[a].fullPath);
					if(c)
					{
						al[a].loading = false;
						al[a].loaded = al[a].local = true;
						_.injectAsset(a, c, 'local');
					}
				}
				catch(e){}
			},
			
			initExternal: function()
			{
				for(var a = 0; a < al.length; a++)
				{
					if(al[a].loaded === true) continue;
					_.loadExternal(a);
				}
			},
	
			loadExternal: function(a)
			{
				if(al[a].local || al[a].loaded) return;
				
				al[a].loading = true;
	
				if(m === 'dev')
				{
					_.injectAsset(a, null, 'external');
					return;
				}
				
				var xhr = new XMLHttpRequest();
					xhr.open('GET', al[a].fullPath);
					xhr.onreadystatechange = function()
					{
						if(xhr.readyState === 4)
						{
							al[a].loading = false;
							if(xhr.status === 200)
							{
								al[a].loaded = true;
								_.injectAsset(a, xhr.responseText, 'ajax');
								_.storeLocal(al[a], xhr.responseText);
							}
							else
							{
								_.injectAsset(a, null, 'external');
							}
						}
					};
					setTimeout(
						function()
						{
							if(xhr.readyState < 4)
							{
								xhr.abort();
								al[a].loading = false;
								_.injectAsset(a, null, 'external');
							}
						},
						5000
					);
					xhr.send();
			},
			
			getAssetElement: function(asset, content, source)
			{
				var s, textNode;
				switch(asset.type)
				{
					case 'text/javascript':
						s = d.createElement('script');
						s.type = asset.type;
						s.async = 'async';
						s.defer = 'defer';
						if(source == 'external')
						{
							s.src = asset.fullPath;
						}
						else
						{
							s.text = content;
						}
						break;
					case 'text/css':
						if(source == 'external')
						{
							s = d.createElement('link');
							s.href = asset.fullPath;
							s.rel = 'stylesheet';
						}
						else
						{
							if(navigator.appName.indexOf('Internet Explorer') > -1)
							{
								d.createStyleSheet().cssText = content;
								return s;
							}
							else
							{
								s = d.createElement('style');
								s.type = 'text/css';
								s.innerHTML = content;
							}
						}
						break;
				}
				s.setAttribute('data-al-loaded-from', source);
				s.setAttribute('data-al-url', asset.path + asset.file);
				return s;
			},
			
			injectAsset: function(a, content, source)
			{
				var s = _.getAssetElement(al[a], content, source);
				if(s == undefined) return;
				
				if(al[a].firstload == undefined)
				{
					h.appendChild(s);
					assets[a].firstload = true;
				}
				
				if(al[a].onload != undefined)
				{
					(al[a].onload)();
				}
				
				if(al[a].removeClassOnLoad != undefined)
				{
					var root = d.getElementsByTagName('html')[0];
					root.classList.remove(al[a].removeClassOnLoad);
				}
			},
			
			storeLocal: function(asset, content)
			{
				var pattern = asset.fullPath.slice(0, asset.fullPath.indexOf('v=') - 1);
	
				try
				{
					Object.keys(ls).forEach(
						function(key)
						{
							if(key.match(/^' + pattern + '/g))
							{
								ls.removeItem(key);
							}
						}
					);
					
					ls.setItem(asset.fullPath, content);
				}
				catch(e){}
			}
		}
	;

	_.init();
	
	return _;
}());