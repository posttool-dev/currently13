vjo.ctype('com.pagesociety.ui.component.Input') //< public
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	
	input:null,//<org.jquery.jQuery
	prompt:null,//<org.jquery.jQuery
	error:null,//<org.jquery.jQuery
	
	//>public constructor (Component parent)
	//>public constructor (Component parent, Object options)
	constructs: function(parent, options) 
	{
		var self = this;//<Input
		options = self.extend({tag:'input', type:'text', name:'noname'}, options);
		if (options.prompt == null)
		{
			self.base(parent,options);
			self.input = self.element;
		}
		else
		{
			options.tag = 'div'; // this is a composite
			self.base(parent,options);
			self.input = self.$el(self.element,'input',null,null,self.options.type);
			self.prompt = self.$div(self.element,'prompt');
			self.prompt.text(self.options.prompt);
			self.prompt.click(function(){ self.input.focus(); });
		}
		self.input.attr('name', self.options.name);
		self.input.focus(function(e){ self.focus(e,false); });
		self.input.blur(function(e){ self.focus(e,true); });
		self.input.change(function(e){ self.change(e); });
	},
	
	focus: function(e,b)
	{
		var self = this;//<Input
		var v = self.value();
		self.show_prompt(b && (v==null || v==''));
	},
	
	show_prompt: function(b)
	{
		var self = this;//<Input
		if (self.prompt==null)
			return;
		if (b)
			self.prompt.show();
		else
			self.prompt.hide();
	},
	
	change: function(e)
	{
		var self = this;//<Input
		var v = self.value();
		self.show_prompt(v==null || v=='');
		self.dispatch('change', self.value());
	},
	
	//>public String value()
	value: function()
	{
		var self = this;//<Input
		return self.input.val();
	},
	
	//>public void data(Object o)
	data: function(o)
	{
		var self = this;//<Input
		self.show_prompt(o==null || o=='');
		self.input.val(o);
	}
	
})
.endType();