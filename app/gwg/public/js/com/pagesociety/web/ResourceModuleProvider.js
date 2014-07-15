vjo.ctype('com.pagesociety.web.ResourceModuleProvider') //< public
   .needs('com.pagesociety.web.ResourcePathProvider')
   .needs('com.pagesociety.web.ModuleConnection')
.props({
	
})
.protos({
	
	_module_name:null,//<String
	_type:null,//<String
	_path_provider:null,//<ResourcePathProvider
	
	//>constructor (String module_name, String type, String root_url)
	constructs: function(module_name, type, root_url)
	{
		this._module_name = module_name;
		this._type = type;
		this._path_provider = new com.pagesociety.web.ResourcePathProvider(root_url);
	},

	//>public void getResourceUrl(Number id, Function on_complete, Function on_error)
	getResourceUrl: function(id, on_complete, on_error)
	{
		com.pagesociety.web.ModuleConnection.doModule(this.GetResourceUrl(), [ id ], on_complete, on_error, true);
	},
	
	//>public void getResourceUrlWithOptions(Number id, Object options, Function on_complete, Function on_error)
	getResourceUrlWithOptions: function(id, options, on_complete, on_error)
	{
		com.pagesociety.web.ModuleConnection.doModule(this.GetResourcePreviewURL(), [ id, options ], on_complete, on_error, true);
	},
	
	//>public String getPath(com.pagesociety.persistence.Entity resource, Object options)
	getPath: function(resource, options)
	{
		return this._path_provider.getPath(resource, options);
	},
	
	CreateResource: function()
	{
		return this._module_name + "/CreateResource";
	},

	DeleteResource: function()
	{
		return this._module_name + "/DeleteResource";
	},

	UpdateResource: function()
	{
		return this._module_name + "/UpdateResource";
	},

	CancelUpload: function()
	{
		return this._module_name + "/CancelUpload";
	},

	GetResourceUrl: function()
	{
		return this._module_name + "/GetResourceURL";
	},

	GetResourcePreviewURL: function()
	{
		return this._module_name + "/GetResourcePreviewURL";
	},

	GetUploadProgress: function()
	{
		return this._module_name + "/GetUploadProgress";
	},

	GetSessionId: function()
	{
		return "User/GetSessionId";
	}
})
.endType();