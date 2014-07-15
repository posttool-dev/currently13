vjo.ctype("com.pagesociety.ui.test.SimpleComponent")
.inherits("com.pagesociety.ui.Component")
.protos({
	
	//>public constructor (Component parent)
	//>public constructor (Component parent, Object options)
	constructs: function(parent, options) 
	{
		var self = this;//<SimpleComponent
		self.base(parent, options);
	},

	
	//>public void something()
	something: function()
	{
		var self = this;//<SimpleComponent
		console.log("HEY HEY something");
	}
})
.endType();