





$(function () {

    $('.single_upload').each(function(idx,el)
    {
        var $el = $(el);
        var data = get_data_from_dom($el);
        var view = create_upload_view($el, data.upload_url);

        var on_delete_simple = function()
        {
            view.$upload_btn.show();
            view.$info.empty();
            $el.dirty();
        }
        if (data.value)
        {
            view.$info.append(get_upload_row(data.name, data, on_delete_simple).$el);
            view.$info.show();
            view.$upload_btn.hide();
        }

        //var jqXHR =
        view.$input.fileupload({
            dataType: 'json',
            dropZone: view.$el,
            add: function (e, edata) {
                if (data.valid && !edata.files[0].name.match(data.valid))
                    return;
                view.$progress.show();
                view.$upload_btn.hide();
                edata.submit()
            },
            progressall: function (e, edata) {
                var progress = parseInt(edata.loaded / edata.total * 100, 10);
                view.$progress.show();
                view.$upload_btn.hide();
                view.$progressbar.css('width', progress + '%');
            },
            done: function (e, edata) {
                view.$progress.hide();
                view.$upload_btn.hide();
                view.$info.show();
                view.$info.empty();
                view.$info.append(get_upload_row(data.name, edata.result[0], on_delete_simple).$el);
                $el.dirty();
            }
        });
    });

    $('.multi_upload').each(function(idx,el)
    {
        // for each element, construct a dictionary of jquery elements
        var $el = $(el);
        var data = get_data_from_dom($el);
        var values = get_data_from_dom2($el);
        $el.empty();
        var view = create_upload_view($el,data.upload_url);

        var on_delete_multi = function()
        {
            $el.dirty();
        }
        if (values)
        {
            for (var i=0; i<values.length; i++)
                view.$info.append(get_upload_row(data.name, values[i].display, data.delete_url, on_delete_multi).$el);
            view.$info.show();
        }

        // init fileupload https://github.com/blueimp/jQuery-File-Upload
        view.$info.show();
        view.$input.fileupload({
            dataType: 'json',
            dropZone: view.$el,
            add: function (e, edata)
            {
                if (data.valid && !edata.files[0].name.match(data.valid))
                    return;
                view.$progress.show();
                view.$upload_btn.hide();
                edata.submit();
            },
            progressall: function (e, edata)
            {
                var progress = parseInt(edata.loaded / edata.total * 100, 10);
                view.$progress.show();
                view.$upload_btn.hide();
                view.$info.show();
                view.$progressbar.css('width', progress + '%');
            },
            done: function (e, edata)
            {
                view.$progress.hide();
                view.$upload_btn.show();
                view.$info.append(get_upload_row(data.name, edata.result[0], on_delete_multi).$el);
                $el.dirty();
            }
        });
    });


    function create_upload_view($el, upload_url)
    {
        var $progress = $$('progress progress-striped active');
        var $progressbar = $$('bar', { css: { width: '0%' }, parent: $progress });
        var $info = $$('multi-drop-area file-input-drop');
        var $btn = $$('btn btn-small file-input-button', { children: [ $('<span><i class="icon-upload"></i> Browse...</span>') ] });
        var $fileupload = $$('multi_upload', { el: 'input', parent: $btn,
                             data: { url: upload_url },
                             attributes: { type: 'file', name: 'file', multiple: 'multiple' }});
        $el.append($progress, $info, $btn);
        return { $el: $el, $progress: $progress, $progressbar: $progressbar,
            $upload_btn: $btn, $input: $fileupload, $info: $info };
    }


    function get_hidden_input(name,value)
    {
        var $el = $$('',{el:'input',attributes:{type:'hidden', name:name}});
        if (value)
            $el.attr('value',value);
        return $el;
    }

    function get_upload_row(name, display, delete_url, on_complete)
    {
        var $el = $$();
        var $el1 = $$();
        $el1.text(display);
        var $remove = $$('pull-right', {el: 'a', attributes: {href:'#'}, parent: $el1, children:[ $$('micon-large icon-remove-sign',{el:'i'}) ]});
        var $input = get_hidden_input(name, data.value);
        $el.append($el1, $input);
        $remove.click(function(){
            $.ajax({
                crossDomain: false,
                type: 'delete',
                url: delete_url,
                dataType: "json",
                contentType: "application/json",
                processData: false
            }).fail(function(e){
                    console.log("resource delete error",e);
            }).done(function(){
                $el.remove();
                if (on_complete)
                    on_complete();
            })
        })
        return { $el: $el, $input: $input, $remove: $remove };
    }




});



