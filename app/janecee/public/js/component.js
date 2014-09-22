
$$div = function($parent,class_name,callback)
{
    var $c = $("<div></div>");
    if (class_name!=null)
      $c.addClass(class_name)
    if (callback!=null)
      $c.click(callback);
    $parent.append($c);
    return $c;
}

function $$box(p,x,y,w,h,c)
{
	return $$div(p).css({'position':'absolute','top':y+'px', 'left':x+'px','width':w+'px','height':h+'px','background-color':'#'+c})
}

$$button = function($parent,text,event_data,callback,class_name)
{
      var $c = $('<div>'+text+'</div>');
      if (class_name!=null)
    	  $c.addClass(class_name)
      if (callback!=null)
    	  $c.click(event_data,callback);
      $parent.append($c);
      return $c;
}

$$image = function($parent,res,props)
{
	if (props==null)
		props = {};
	var w  = props.preview_width;
	var h  = props.preview_height;
	var iw = props.width;
	var ih = props.height;
	
	var $wrap = $$div($parent, 'loading');
	var $wrap2 = $$div($wrap);
	var $img = $(new Image());
	var c = 0;
	$img.load(function() 
	{
		if (props.scale != null && iw!=null && ih!=null)
			image_sizer(props.scale, $wrap2,$img,iw,ih,this.width,this.height)
		$wrap.removeClass('loading');
		$wrap2.append($img);
	});
	$img.error(function()
	{
		if (c!=0)
			throw new Error("cannot get preview for resource!")
		c++;
		com_pagesociety_web_ResourceUtil.getPreviewUrl(res, w, h, function(p)
		{
			$img.attr('src', p)
		})
	});
	$img.attr('src', com_pagesociety_web_ResourceUtil.getPath(res,w,h));
	return $wrap;
}




function image_sizer(scale,$wrap,$img,w,h,iw,ih)
{
//	var w = this.width;
//	var h = this.height;
//	var iw = this._loaded_img_width;
//	var ih = this._loaded_img_height;
	
	if (iw==0 || ih==0)
		return;
	
	var sx = w/iw;
	var sy = h/ih;
	
	var sw, sh, xo, yo;

	switch (scale)
	{
	
	case "fit":
		if ( sx < sy )
		{
			sw = iw*sx;
			sh = ih*sx;
		}
		else
		{
			sw = iw*sy;
			sh = ih*sy;
		}
		break;
	case "fit_height":
		sw = iw*sy;
		sh = ih*sy;
		break;

	case "full_bleed":
		if ( sx > sy )
		{
			sw = iw*sx;
			sh = ih*sx;
		}
		else
		{
			sw = iw*sy;
			sh = ih*sy;
		}
		break;
	}
	var xo = Math.floor((w-sw)/2);
	var yo = Math.floor((h-sh)/2);
	
	$wrap.css({position:"absolute",width: w+"px", height: h+"px", clip: "rect(0px "+w+"px "+h+"px 0px)"});
	$img.css({position:"absolute", top: yo+"px", left: xo+"px", width: Math.floor(sw)+"px", height: Math.floor(sh)+"px"});
	
}