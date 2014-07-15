vjo.ctype('com.gwg.site.Logo') //< public
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	
	normal_el:null,//<org.jquery.jQuery
	over_el:null,//<org.jquery.jQuery
	
	//>public constructor (Component parent)
	constructs: function(parent) 
	{
		var self = this; //<Logo
		self.base(parent);
		self.css({'margin-top':'30px','margin-left':'30px'});
		self.setWidth(700);
		self.setHeight(200);
		
		self.normal_el = self.$div(self.element).css({'width':'700px','height':'200px','z-index':'0'});
		self.over_el = self.$div(self.element).css({'width':'700px','height':'200px','z-index':'0'});
		

		var NL = 62;
		var NW = 614;
		var NH = 4;

		var normal = [
		    [ 30, 0, 646, NH],
			[ 38, 0, 9, NH ],
			[ 46, 0, 9, NH ],
		    [ 38, NL, NW, NH ],
			[ 46, NL, NW, NH ],
		    [ 54, 0, 646, NH ],
		    [ 62, NL, NW, NH ],
			[ 70, NL, NW, NH ],
		    [ 78, 0, 32, NH ],
		    [ 86, 0, 32, NH ],
		    [ 98, 0, 9, NH ],
		    [ 98, 46, 9, NH ],
		    [ 98, NL, NW, NH ],
		    [ 106, 0, 9, NH ],
		    [ 106, 46, 9, NH ],
		    [ 106, NL, NW, NH ],
		    [ 114, 0, 9, NH ],
		    [ 114, 46, 9, NH ],
		    [ 114, NL, NW, NH ],
			[ 122, 0, 9, NH ],
		    [ 122, 46, 9, NH ],
		    [ 122, NL, NW, NH ],
		    [ 130, 0, 9, NH ],
		    [ 130, 46, 9, NH ],
		    [ 130, NL, NW, NH ],
		    [ 138, 39, 637, NH ],
		    [ 146, 39, 637, NH ],
		    [ 158, 0, 646, NH ],
		    [ 166, 0, 9, NH ],
			[ 174, 0, 9, NH ],
		    [ 166, NL, NW, NH ],
			[ 174, NL, NW, NH ],
		    [ 182, 0, 646, NH ],
		    [ 190, NL, NW, NH ],
			[ 198, NL, NW, NH ],
		    [ 206, 0, 32, NH ],
		    [ 214, 0, 32, NH ] ];
		
		for (var i=0; i<normal.length; i++)
		{
			var l = normal[i];
			if (l[1]==0)
				this.$div(self.normal_el).css({'top':l[0]+'px',  'width':l[2]+'px', 'height':l[3]+'px','background-color':'#000', 'position':'absolute'});
			else
				this.$div(self.normal_el).css({'top':l[0]+'px', 'left':l[1]+'px', 'width':l[2]+'px', 'height':l[3]+'px','background-color':'#000', 'position':'absolute'});
		}
		
		var OL = 72;
		var OW = 604;
		var OH = 4;
		var over = [
			[30, OL, OW, OH],
			[38, OL, OW, OH],
			[46, OL, OW, OH],	
			[54, OL, OW, OH],
			[62, OL, OW, OH],
			[70, OL, OW, OH],	
			[98, OL, OW, OH],
			[106, OL, OW, OH],
			[114, OL, OW, OH],	
			[122, OL, OW, OH],
			[130, OL, OW, OH],
			[138, OL, OW, OH],
			[146, OL, OW, OH],
			[158, OL, OW, OH],
			[166, OL, OW, OH],	
			[174, OL, OW, OH],
			[182, OL, OW, OH],
			[190, OL, OW, OH],
			[198, OL, OW, OH]            
		];

		
		for (var i=0; i<over.length; i++)
		{
			var l = over[i];
			this.$div(self.over_el).css({'top':l[0]+'px', 'left':l[1]+'px', 'width':l[2]+'px', 'height':l[3]+'px', 'position':'absolute'}).addClass('pink-bar');
		}

		var text = self.$div(self.element).css({'position': 'absolute', 'top': '80px', 'left': '72px'}).text('178 Amber Drive San Francisco, California 94131');
		var email = self.$div(self.element).css({'position': 'absolute', 'top': '80px', 'left': '676px'}).html('<a href="mailto:worker@generalworkinggroup.com">worker(at)generalworkinggroup.com</a>');

		self.over_el.hide();
		
		var click_area_0 = self.$div(self.element).css({'position':'absolute','top':'30px','left':0,'width':'100px','height':'260px','z-index':'20', 'background-color':'rgba(1,0,0,0)'});
		var click_area_1 = self.$div(self.element).css({'position':'absolute','top':'30px','left':'100px','width':'600px','height':'70px','z-index':'20', 'background-color':'rgba(1,0,0,0)'});
		var click_area_2 = self.$div(self.element).css({'position':'absolute','top':'70px','left':'100px','width':'600px','height':'210px','z-index':'0', 'background-color':'rgba(0,255,0,0)'});
		var click_areas = [click_area_0, click_area_1, click_area_2];

		self.each(click_areas, 
			function(a){
				a.mouseover(function(){
					self.over_el.show();
				}).mouseout(function(){
					self.over_el.hide();
				});
			});
		
		


	}
})
.endType();