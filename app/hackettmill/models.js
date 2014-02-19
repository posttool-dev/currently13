var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

exports.models = {

    /* for images */
    Resource: {
        schema: {
            title:         String,
            caption:       String,
            description:   String,
            path:          String
        },
        browse: [
            {name: "title", cell: "char", filters: ["icontains", "equals"], order: "asc,desc,default"},
            {name: "caption", cell: "char", filters: ["icontains", "equals"]},
            {name: "path", cell: "image", filters: ["icontains", "equals"], order: "asc,desc"},
        ],
        form: [
            {name: "title", widget: "input-large"},
            {name: "path", widget: "upload-single", options: {types: ["jpeg", "jpg"]}},
            {name: "caption", widget: "input"},
            {name: "description", widget: "rich-text"},
        ]
    },

    /* hackett mill calls their catalog of art "inventory" */
    Inventory: {
        schema: {
            title:         String,
            code:          String,
            description:   String,
            resource:      {type: ObjectId, ref: 'Resource'},
            views:          [{type: ObjectId, ref: 'Resource'}],
            use:           String,
            alignment:     String,
            year:          Number,
            materials:     String,
            dimensions:    String
        },
        browse: [
            {name: "title", cell: "char", filters: ["icontains", "equals"], order: "asc,desc"},
            {name: "code", cell: "char", filters: ["icontains", "equals"], order: "asc,desc,default"},
            {name: "resource", cell: "image"},
            {name: "year", cell: "int", filters: ["gt","lt","gte","lte"], order: "asc,desc"},
        ],
        form: [
            {_row: [
                {name: "title", widget: "input-large", options: {width: "80%"}},
                {name: "code", widget: "input-large", options: {width: "20%"}},
            ]},
            {_row: [
                {name: "resource", widget: "choose-create", options: {type: "Resource"}},
                {name: "views", widget: "choose-create", options: {type: "Resource", array: true}},
            ]},
            {name: "description", widget: "rich-text"},
            {_section: "Details"},
            {name: "use", widget: "input", help: "More details about the use."},
            {name: "alignment", widget: "input"},
            {name: "year", widget: "input"},
            {name: "materials", widget: "input"},
            {name: "dimensions", widget: "input"},
        ]
    },

    /* the artists */
    Artist: {
        schema: {
            first_name:    String,
            last_name:     String,
            description:   String,
            work:          [{type: ObjectId, ref: 'Inventory'}]
        },
        browse: [
            {name: "first_name", cell: "char", filters: ["icontains", "equals"], order: "asc,desc"},
            {name: "last_name", cell: "char", filters: ["icontains", "equals"], order: "asc,desc,default"}
        ],
        form: [
            {name: "first_name", widget: "input"},
            {name: "last_name", widget: "input"},
            {name: "description", widget: "rich-text"},
            {name: "works", widget: "choose-create", options: {type:"Inventory", array: true}}
        ]
    },

    /* pages */
    Page: {
        schema: {
            title:         String,
            subtitle:      String,
            body:          String,
            pages:         [{type: ObjectId, ref: 'Page'}]
        },
        browse: [
            {name: "title", cell: "char", filters: ["icontains", "equals"], order: "asc,desc,default"},
            {name: "subtitle", cell: "char", filters: ["icontains", "equals"], order: "asc,desc"}
        ],
        form: [
            {name: "title", widget: "input"},
            {name: "subtitle", widget: "input"},
            {name: "body", widget: "rich-text"},
            {name: "pages", widget: "choose-create", options: {type:"Pages", array: true}}
        ]
    },

    /* news */
    News: {
        schema: {
            title:         String,
            subtitle:      String,
            body:          String,
            release_date:  Date
        },
        browse: [
            {name: "title", cell: "char", filters: ["icontains", "equals"], order: "asc,desc,default"},
            {name: "release_date", cell: "date", filters: ["gt","lt"], order: "asc,desc"}
        ],
        form: [
            {name: "title", widget: "input"},
            {name: "subtitle", widget: "input"},
            {name: "body", widget: "rich-text"},
            {name: "release_date", widget: "date-time"}
        ]
    },

    Contact: {
        schema: {
            title:         String,
            overview:      String,
            directions:    String,
            address_line_1:String,
            address_line_2:String,
            city:          String,
            state:         String,
            zip:           String,
            email:         String,
            phone:         String,
            mobile:        String
        }
    },

    Essay: {
        schema: {
            title1:         String,
            title2:         String,
            title3:         String,
            author:         String,
            audio_bio:      String,
            body:           String
        }
    },

    Catalog: {
        schema: {
            price:          Number,
            title:          String,
            caption:        String,
            images:         [{type: ObjectId, ref: 'Resource'}]
        }
    },

    Exhibition: {
        schema: {
            title:          String,
            subtitle:       String,
            images:         [{type: ObjectId, ref: 'Resource'}],
            start_date:     Date,
            end_date:       Date,
            opening_date:   Date,
            opening_length: String,
            essays:         [{type: ObjectId, ref: 'Essay'}],
            catalog:        {type: ObjectId, ref: 'Catalog'}
        }
    }
}





