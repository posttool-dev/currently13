vjo.ctype('com.pagesociety.ui.ComponentDimension') //< public

.props({
	WIDTH:"Width",//<public static final String
	HEIGHT:"Height",//<public static final String
		
	UNSET:0x01,//<public static final int
	PERCENT: 0x02,//<public static final int
	DELTA: 0x03,//<public static final int
	ABSOLUTE: 0x04//<public static final int
})
.protos({
	prop:null,//<private String
	pf:0,//<private Number
	o:0,//<private Number
	type:0x01,//<private int
	
	//>public constructor (String prop)
	constructs: function(prop) 
	{
		this.prop			= prop;
		this.unset();
	},
	
	//>public Boolean isUnset()
	isUnset: function()
	{
		var b = this.type == com.pagesociety.ui.ComponentDimension.UNSET;
		return b;
	},
	
	//>public void unset()
	unset: function()
	{
		this.o				= 0;
		this.pf				= 0;
		this.type 			= com.pagesociety.ui.ComponentDimension.UNSET;
	},
	
	//>public void setAbsolute(Number offset)
	setAbsolute: function(offset)
	{
		this.type 		= com.pagesociety.ui.ComponentDimension.ABSOLUTE;
		this.o			= offset;
	},
	
	//>public void setPercent(Number p)
	//>public void setPercent(Number p, Number d)
	setPercent: function(p,d)
	{
		this.type 		= com.pagesociety.ui.ComponentDimension.PERCENT;
		this.o			= d || 0;
		this.pf 		= p;
	},
	
	//>public void setDelta(Number d)
	setDelta: function(d)
	{
		this.type 		= com.pagesociety.ui.ComponentDimension.DELTA;
		this.o			= d;
	},
	
	//>public Number getValue(com.pagesociety.ui.Component c)
	getValue: function(c)
	{
		var p = c.parent;
		switch(this.type)
		{
			case com.pagesociety.ui.ComponentDimension.UNSET:
				if(p==null)
					return this.get_val(c.application);
				else
					return this.get_val(p);
				
			case com.pagesociety.ui.ComponentDimension.PERCENT:
				if(p==null)
					return Math.floor(this.pf * this.get_val(c.application) + this.o);
				else
					return Math.floor(this.pf * this.get_val(p) + this.o);

			case com.pagesociety.ui.ComponentDimension.DELTA:
				if(p==null)
					return Math.floor(this.o + this.get_val(c.application));
				else
					return Math.floor(this.o + this.get_val(p));

			case com.pagesociety.ui.ComponentDimension.ABSOLUTE:
				return this.o;

		}
		return 0;
	},
	
	//>private Number get_val(com.pagesociety.ui.Component c)
	get_val: function(c)
	{
		if (c==null)
			return;//component has been destroyed...
		return c["get"+this.prop]();
	}

})
.endType();