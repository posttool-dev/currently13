vjo.ctype('com.pagesociety.web.ResourcePathProvider') //< public
   .needs('com.pagesociety.persistence.Entity')
.props({
	
})
.protos({
	
	base_url:null,//<String
	
	//>constructor (String root_url)
	constructs: function(root_url)
	{
		if (root_url == null || root_url.indexOf("http://") != 0)
			throw new Error("MUST CONFIG PATH PROVIDER WITH ABSOLUTE URL BEGINNING WITH http://!");
		this.base_url = root_url;
		if (this.base_url.charAt(this.base_url.length - 1) != "/")
			this.base_url += "/";

	},
	
	//>public String getPath(Entity resource, Object options) 
	getPath: function(resource, options)
	{
		var path_token = resource._attributes['path-token'];
		if (path_token == null)
			return null;
		var preview_name = "";
		var width = (options.width ? options.width : -1);
		var height = (options.height ? options.height : -1);
		if (width == -1 || height == -1)
		{
			preview_name = path_token;
		}
		else
		{
			var dot_idx = path_token.lastIndexOf('.');
			var ext = "jpg";
			if (dot_idx != -1 && path_token.length - 1 > dot_idx)
			{
				ext = path_token.substring(dot_idx + 1).toLowerCase();
				path_token = path_token.substring(0, dot_idx);
			}
			preview_name += path_token;
			preview_name += this.getOptionsSuffix(options,ext);
			
		}
		return this.base_url + preview_name;
	},
	
	//
	getOptionsSuffix: function(options, ext)
	{
		var options_size = 0;
		for (var p in options)
			options_size++;
		if (options.type!=null)
		{
			ext = options.type;
			options_size--;
		}
		if (options_size == 2 && options.width!=null && options.height!=null)
		{
			return '_' + options.width + 'x' + options.height + '.' + ext;
		}
		var sorted_keys = [];
		for (var k in options)
		{
			if (k=='type')
				continue;
			sorted_keys.push(k);
		}
		sorted_keys.sort();
		var b = "";
		for (var i=0; i<sorted_keys.length; i++)
		{
			k = sorted_keys[i];
			b+= k + '.' + options[k] + '_';
		}
		return '_' + b.substring(0, b.length - 1) + '.' + ext;
	}
})
.endType();