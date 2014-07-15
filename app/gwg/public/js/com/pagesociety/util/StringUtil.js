vjo.ctype('com.pagesociety.util.StringUtil') //< public
.props({
	
	//>public static boolean empty(String s)
	empty: function(s)
	{
		if (s==null)
			return true;
		s = $('<root>'+s+'</root>').text();
		return jQuery.trim(s) == '';
	},
	
	//>public static String stripHtml(String s)
	stripHtml: function(s)
	{
		return $(s).text();
	},
	
	//>public static boolean endsWith(String s, String e)
	endsWith: function(s,e)
	{
		return s.indexOf(e) == s.length - e.length;
	}
	
})
.protos({
	
})
.endType();