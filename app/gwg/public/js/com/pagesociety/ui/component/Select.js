vjo.ctype('com.pagesociety.ui.component.Select') //< public
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	
	selectedValue:null,//<Object

	//>public constructor (Component parent)
	//>public constructor (Component parent, Object options)
	constructs: function(parent, options) 
	{
		var self = this;//<Select
		options = self.extend({tag:'select'},options);
		self.base(parent, options);
		self.element.change(function(e){ 
			self.selectedValue = self.element.val();
			self.dispatch('change'); 
		});
	},
	
	//>public void data(Object o)
	data: function(o)
	{
		var self = this;//<Select
		self.base.data(o);
		self.element.empty();
		for (var i=0; i<o.length; i++)
		{
			var oval = o[i];
			if (oval==null)
				continue;
			var $option = self.$el(self.element, 'option');
			if (oval==self.selectedValue)
				$option.attr('selected','selected');
			if (typeof(oval)=='number'||typeof(oval)=='string')
				$option.text(oval);
			else if (typeof(oval)=='object')
			{
				$option.attr('value',oval.value);
				$option.text(oval.display);
			}
			self.element.append($option);
			self.selectedValue = self.element.val();
		}
	},
	
	select: function(v)
	{	
		var self = this;//<Select
		self.selectedValue = v;
		self.data(self.user_object);
	},
	
	//>public Object value()
	value: function()
	{
		var self = this;//<Select
		return self.selectedValue;
	}

	
})
.endType();