vjo.ctype('com.pagesociety.ui.component.Label') //< public
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	
	//>public constructor (Component parent, Object options)
	constructs: function(parent, options) 
	{
		var self = this;//<Label
		options = self.extend({html:false},options);
		self.base(parent, options);
	},
	
	//>public void data(Object o)
	data: function(o)
	{
		var self = this;//<Label
		self.base.data(o);
		if (self.options.html)
			self.element.html(o);
		else
			self.element.text(o);
	}
	
})
.endType();