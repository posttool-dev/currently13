vjo.ctype('com.gwg.site.SocialButtons') //< public
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	twitw:null,//<org.jquery.jQuery
	twit:null,//<org.jquery.jQuery
	twits:null,//<org.jquery.jQuery
	fbw:null,//<org.jquery.jQuery
	fbs:null,//<org.jquery.jQuery
	fb:null,//<org.jquery.jQuery

	//>public constructor (Component parent)
	constructs: function(parent) 
	{
		var self = this; //<SocialButtons
		self.base(parent,{className:'social'});
		self.element.mouseenter(function(){self.element.stop().fadeTo(200,1);}).mouseleave(function(){self.element.stop().fadeTo(200,.5);});
	},
	
	reset: function(node)
	{
		var self = this; //<SocialButtons
		self.empty();
		self.opacity(0);
		
		self.delay(function(){
		self.element.stop().delay(500).fadeTo(200,.5);
		var url = encodeURIComponent(com.pagesociety.web.ModuleConnection.BASE_URL + '/' + node._attributes.node_id);
		
		self.twitw = self.$div(self.element, 'tw');

		self.twitw.append('<iframe allowtransparency="true" frameborder="0" scrolling="no" '+
			'src="http://platform.twitter.com/widgets/tweet_button.html?url='+url+' style="width:130px; height:20px;"></iframe>');

		self.fbw = self.$div(self.element, 'fb');

		self.fbw.append('<iframe src="http://www.facebook.com/plugins/like.php?href='+url+
			'&amp;send=false&amp;layout=button_count&amp;width=200&amp;show_faces=false&amp;action=like&amp;'+
			'colorscheme=light&amp;font&amp;height=21&amp;appId=108341568468" scrolling="no" frameborder="0" '+
			'style="border:none; overflow:hidden; width:200px; height:21px;" allowTransparency="true"></iframe>');
		}, 333);
	}
	

})
.endType();