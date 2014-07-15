vjo.ctype('com.pagesociety.web.ModuleConnection') //< public
   .needs('com.pagesociety.persistence.Entity')
.props({
	
	BASE_URL:null,//<public String
	

	//>public static void doModule(String method, Array args, Function on_complete, Function on_error)
	//>public static void doModule(String method, Array args, Function on_complete, Function on_error, boolean async)
	doModule: function(method,args,on_complete,on_error,async)
	{
//		var url = '/'+method+'/.json';
//		if (com.pagesociety.web.ModuleConnection.BASE_URL != null)
//			url = com.pagesociety.web.ModuleConnection.BASE_URL + url;
//
//		jQuery.ajax({ dataType: 'jsonp', url: url, data: { args: JSON.stringify(args)} }).done(function(data)
//				{
//					//console.log("psui",url,args,data);
//					data = com.pagesociety.web.ModuleConnection.process_results(data);
//					if (data && data.exceptionType)
//						on_error(data);
//					else
//						on_complete(data);
//				});

    jQuery.ajax({url: method}).done(function(data){
      on_complete(data);
    });
	},
	
	process_results: function(data)
	{
		com.pagesociety.web.ModuleConnection.entity_pool = {};
		var ret = com.pagesociety.web.ModuleConnection.expand_entities(data.value);
		return ret;
	},
	
	entity_pool: {},
	expand_entities: function (o)
	{
		var otype = com.pagesociety.web.ModuleConnection.typeOf(o);
		if(otype == 'object')
		{
			if (o._circular_ref)
			{
				var ref = com.pagesociety.web.ModuleConnection.entity_pool[o._object_id];
				if (ref==null)
					throw new Error("com.pagesociety.web.ModuleConnection.expand_entities - no ref to "+o._object_id);
				return ref;
			}
			if(o._ps_clazz == "Entity")
			{
				if(o.attributes == null)
					o.attributes = new Object();
				var e = new com.pagesociety.persistence.Entity(o);
				com.pagesociety.web.ModuleConnection.entity_pool[o._object_id] = e;
				for(var k in o.attributes)
			 	{
			 		o.attributes[k] = com.pagesociety.web.ModuleConnection.expand_entities(o.attributes[k]);
			 	}
				return e;
			}
			else
			{
				com.pagesociety.web.ModuleConnection.entity_pool[o._object_id] = o;
				for(var k in o)
			 	{
					o[k] = com.pagesociety.web.ModuleConnection.expand_entities(o[k]);
			 	}
			}
		}
		else if (otype == 'array')
		{
 			for(var i = 0;i < o.length;i++)
 			{
 				o[i] = com.pagesociety.web.ModuleConnection.expand_entities(o[i]);
 			}

		}
		return o;
	},


	//>private String typeOf(Object value)
	typeOf: function(value)
	{
	    var s = typeof value;
	    if (s === 'object')
	    {
	        if (value) {
	            if (typeof value.length === 'number' &&
	                    !(value.propertyIsEnumerable('length')) &&
	                    typeof value.splice === 'function') {
	                s = 'array';
	            }
	        } else {
	            s = 'null';
	        }
		}
		return s;
	}
	

})
.protos({
	
})
.endType();