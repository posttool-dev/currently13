var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var cms = require('../modules/cms/models');

exports.models = {

    Resource: cms.models.Resource,

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
            {begin: "row"},
                {name: "title", widget: "input", options: {className:"large", width: "80%"}},
                {name: "code", widget: "input", options: {className:"large", width: "20%"}},
            {end: "row" },
            {begin: "row"},
                {name: "resource", widget: "choose_create", options: {type: "Resource"}},
                {name: "views", widget: "choose_create", options: {type: "Resource", array: true}},
            {end: "row" },
            {name: "description", widget: "rich_text"},
            {begin: "section"},
                {name: "use", widget: "input", help: "More details about the use."},
                {name: "alignment", widget: "input"},
                {name: "year", widget: "input"},
                {name: "materials", widget: "input"},
                {name: "dimensions", widget: "input"},
            {end: "section"}
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
            {name: "description", widget: "rich_text"},
            {name: "works", widget: "choose_create", options: {type:"Inventory", array: true}}
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
            {name: "body", widget: "rich_text"},
            {name: "pages", widget: "choose_create", options: {type:"Pages", array: true}}
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
            {name: "body", widget: "rich_text"},
            {name: "release_date", widget: "date"}
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





