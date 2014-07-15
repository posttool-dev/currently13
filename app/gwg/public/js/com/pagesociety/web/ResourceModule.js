vjo.ctype('com.pagesociety.web.ResourceModule') //< public
   .needs('com.pagesociety.web.ResourceModuleProvider')
   .needs('com.pagesociety.persistence.Entity')

.props({
	
	DEBUG: false,
	RESOURCE_MAP:null,
	
	//>public static void init(Object data)
	init: function(data)
	{
		if (com.pagesociety.web.ResourceModule.RESOURCE_MAP != null)
		{
			throw new Error("Resource Map has already been initialized...");
		}
		com.pagesociety.web.ResourceModule.RESOURCE_MAP = {  };
		for (var i = 0; i < data.length; i++)
		{
			var info = data[i];
			var module_name = info.resource_module_name;
			var entity_type = info.resource_entity_name;
			var base_url = info.resource_base_url;
			if (com.pagesociety.web.ResourceModule.RESOURCE_MAP[entity_type] != null)
					throw new Error("ResourceModule.init ERROR: Registering entity " + entity_type);
			com.pagesociety.web.ResourceModule.RESOURCE_MAP[entity_type] = 
				new com.pagesociety.web.ResourceModuleProvider(module_name, entity_type, base_url);
		}
	},
	


	//>public static String getPath(Entity resource)
	//>public static String getPath(Entity resource, Object options)
	getPath: function(resource, options)
	{
		if (resource == null)
			return null;
		if (com.pagesociety.web.ResourceModule.RESOURCE_MAP == null)
			throw new Error("ResourceModule.RESOURCE_MAP is not configured");
		var res_type = resource._type ? resource._type : 'Resource';
		var resource_module = com.pagesociety.web.ResourceModule.RESOURCE_MAP[res_type];//<ResourceModuleProvider
		if (resource_module == null)
			throw new Error("ResourceModule.RESOURCE_MAP does not contain " + res_type);
		if (options == null)
			options = {};
		return resource_module.getPath(resource, options);
	},

	//>public static void getUrl(Entity resource, Function on_complete)
	getUrl: function(resource, on_complete)
	{
		if (resource == null)
		{
			on_complete(null);
		}
		else
			if (com.pagesociety.web.ResourceModule.DEBUG)
			{
				on_complete(resource);
			}
			else
			{
				if (com.pagesociety.web.ResourceModule.RESOURCE_MAP == null)
					throw new Error("ResourceModule.RESOURCE_MAP is not configured");
				var res_type = resource._type ? resource._type : 'Resource';
				var resource_module = com.pagesociety.web.ResourceModule.RESOURCE_MAP[res_type];
				if (resource_module == null)
					throw new Error("ResourceModule.RESOURCE_MAP does not contain " + res_type);
				resource_module.getResourceUrl(resource._id, on_complete, function (e)
				{
					throw new Error("ResourceModule.getUrl ERROR "+e)
				});
			}
	},

	//>public static void getPreviewUrl(Entity resource, Object options, Function on_complete)
	getPreviewSrc: function(resource, options, on_complete)
	{
		if (resource == null)
		{
			on_complete(null);
		}
		else
		{
			if (com.pagesociety.web.ResourceModule.RESOURCE_MAP == null)
				throw new Error("ResourceModule.RESOURCE_MAP is not configured");
				
			var res_type = resource._type ? resource._type : 'Resource';
			
			var resource_module = com.pagesociety.web.ResourceModule.RESOURCE_MAP[res_type];//<ResourceModuleProvider
			
			if (resource_module == null)
				throw new Error("ResourceModule.RESOURCE_MAP does not contain " + res_type);
				
			resource_module.getResourceUrlWithOptions(resource._id, options, on_complete, function (e)
			{
				throw new Error("ResourceModule.getPreviewUrl ERROR "+e)
			});
		}
	},

	//>public static boolean hasResourceModuleProvider(String type)
	hasResourceModuleProvider: function(type)
	{
		return com.pagesociety.web.ResourceModule.RESOURCE_MAP[type] != null;
	}


})
.protos({
	
})
.endType();