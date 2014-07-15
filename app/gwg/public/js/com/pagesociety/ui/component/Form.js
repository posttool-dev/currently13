vjo.ctype('com.pagesociety.ui.component.Form') //< public
   .needs('com.pagesociety.ui.component.Label')
   .needs('com.pagesociety.ui.component.Input')
   .needs('com.pagesociety.ui.component.Select')
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	target:null,//<Component[]
	labelClass:null,//<public String
	inputClass:null,//<public String
	selectClass:null,//<public String
	map:null,//<private Object

	//>public constructor (Component parent)
	//>public constructor (Component parent, Object options)
	constructs: function(parent, options) 
	{
		var self = this;//<Form
		options = self.extend({tag:'form', use_cookie: true, cookie_prefix: 'psuiform_'}, options);
		self.base(parent, options);
		self.element.submit(function(e){ e.preventDefault();});
		self.target = [self];
		self.map = {};
	},
	
	//>public void empty()
	empty: function()
	{
		var self = this;//<Form
		self.base.empty();
		self.target = [self];
		self.map = {};
	},
	
	//>private Component top()
	top: function()
	{
		var self = this;//<Form
		return self.target[self.target.length-1];
	},
	
	//>public Component row()
	//>public Component row(Object options)
	row: function(options)
	{
		var self = this;//<Form
		options = self.extend(
			{ 
				is_row: true, 
				onaddchild: function(c)
				{ 
					c.css({'float':'left'});
				} 
			}, options);
		var c = new com.pagesociety.ui.Component(self.top(),options); 
		self.target.push(c);
		return c;
	},
	
	//>public Component column()
	//>public Component column(Object options)
	column: function(options)
	{
		var self = this;//<Form
		var c = new com.pagesociety.ui.Component(self.top(), options);
		self.target.push(c);
		return c;
	},
	
	//>public void pop()
	pop: function()
	{
		var self = this;//<Form
		var c = self.target.pop();
		if (c.options.is_row)
			c.element.append('<br clear="all"/>');
	},
	
	//>public Object get(String name)
	get: function(name)
	{
		var self = this;//<Form
		var c = self.map[name];
		return c.value();
	},
	
	//>public Object value()
	value: function()
	{
		var self = this;//<Form
		var v = {};
		for (var p in self.map)
			v[p] = self.get(p);
		return v;
	},
	
	
	//>public Label labelo(String txt)
	//>public Label labelo(String txt, Object options)
	labelo: function(txt,options)
	{
		var self = this;//<Form
		var i = new com.pagesociety.ui.component.Label(self.top(), options);
		i.data(txt);
		return i;
	},
	
	//>public Label label(String txt)
	//>public Label label(String txt, int width)
	//>public Label label(String txt, int width, String className)
	label: function(txt,width,className)
	{
		var self = this;//<Form
		var options = {};
		if (width!=null)
			options.css = { width: width+'px' };
		if (className!=null)
			options.className = className;
		else if (self.labelClass != null)
			options.className = self.labelClass;
		return self.labelo(txt,options);
	},
	
	//>public Input inputo(String field_name)
	//>public Input inputo(String field_name, Object options)
	inputo: function(field_name, options)
	{
		var self = this;//<Form
		options = self.extend({ name: field_name, use_cookie: self.options.use_cookie, className: self.inputClass }, options);
		var i = new com.pagesociety.ui.component.Input(self.top(), options);
		self.map[options.name] = i;
		if (options.use_cookie)
		{
			i.data(jQuery.cookie(self.options.cookie_prefix+field_name));
			i.addListener('change', function(val){ jQuery.cookie(self.options.cookie_prefix+field_name, val); });
		}
		return i;
	},

	//>public Input input(String field_name)
	//>public Input input(String field_name, int width)
	//>public Input input(String field_name, int width, String className)
	//>public Input input(String field_name, int width, String className, boolean pw)
	input: function(field_name, width, className, pw)
	{
		var self = this;//<Form
		var options = {};
		if (width!=null)
			options.css = { width: width+'px' };
		if (className!=null)
			options.className = className;
		if (pw)
		{
			options.type = 'password';
			options.use_cookie = false;
		}
		return self.inputo(field_name,options);
	},
	
	//>public Input password(String field_name)
	//>public Input password(String field_name, int width)
	//>public Input password(String field_name, int width, String className)
	password: function(field_name, width, className)
	{
		var self = this;//<Form
		return self.input(field_name,width,className,true);
	},
	
	//>public Select selecto(String field_name)
	//>public Select selecto(String field_name, Object options)
	selecto: function(field_name, options)
	{
		var self = this;//<Form
		options = self.extend({ name: field_name }, options);
		var i = new com.pagesociety.ui.component.Select(self.top(), options);
		self.map[options.name] = i;
		return i;
	},

	//>public Select select(String field_name)
	//>public Select select(String field_name, int width)
	//>public Select select(String field_name, int width, String className)
	select: function(field_name, width, className)
	{
		var self = this;//<Form
		var options = {};
		if (width!=null)
			options.css = { width: width+'px' };
		if (className!=null)
			options.className = className;
		else if (self.selectClass != null)
			options.className = self.selectClass;
		return self.selecto(field_name,options);
	},
	
	//>public Label button(String txt, Function f)
	button: function(txt,f)
	{
		var self = this;//<Form
		var l = self.labelo(txt, {tag:'button', html: true});
		l.addListener('click', f);
		return l;
	},
	
	//>public void gap(int g)
	gap: function(g){
		var self = this;//<Form
		var t = self.top();
		var c = t.children;
		var n = c[c.length-1];
		if (t.options.is_row)
			n.element.css('margin-right','+='+g);
		else
			n.element.css('margin-bottom','+='+g);
	}

})
.endType();