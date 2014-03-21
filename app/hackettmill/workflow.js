var DRAFT = exports.DRAFT = 100;
var PUBLISHED = exports.PUBLISHED = 500;
var FLAGGED = exports.FLAGGED = 600;

exports.workflow = {
  states: [
    {code: DRAFT, name: 'draft', editable: true},
    {code: PUBLISHED, name: 'published'},
    {code: FLAGGED, name: 'flagged'},
  ],
  groups: {
    admin: "editor",
    editor: {
      transitions: [
        {from: DRAFT, to: [PUBLISHED, FLAGGED]},
        {from: PUBLISHED, to: [FLAGGED, DRAFT]},
        {from: FLAGGED, to: [PUBLISHED, DRAFT]}
      ]
    },
    contributor: {
      transitions: [],
      requests: [
        {from: DRAFT, to: [PUBLISHED]},
        {from: PUBLISHED, to: [DRAFT]},
        {from: PUBLISHED, to: [FLAGGED]}
      ],
      permissions: {
        Inventory: ['edit', 'view'],
        Artist: ['']
      }
    }
  }
}