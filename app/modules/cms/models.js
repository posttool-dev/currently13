exports.models = {

    /* for blobs */
    Resource: {
        schema: {
            title:         String,
            caption:       String,
            description:   String,
            path:          String,
            mimetype:      String
        },
        browse: [
            {name: "title", cell: "char", filters: ["icontains", "equals"], order: "asc,desc,default"},
            {name: "caption", cell: "char", filters: ["icontains", "equals"]},
            {name: "path", cell: "image", filters: ["icontains", "equals"], order: "asc,desc"},
        ],
        form: [
            {name: "title", widget: "input"},
            {name: "path", widget: "upload", options: {types: ["jpeg", "jpg"]}},
            {name: "caption", widget: "input"},
            {name: "description", widget: "rich_text"},
        ]
    }

}