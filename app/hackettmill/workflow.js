var DRAFT = 100;
var PUBLISHED = 500;
var FLAGGED = 600;

exports = module.exports = {
  DRAFT: DRAFT,
  PUBLISHED: PUBLISHED,
  FLAGGED: FLAGGED,
  states: [
    {code: DRAFT, name: 'draft', editable: true},
    {code: PUBLISHED, name: 'published'},
    {code: FLAGGED, name: 'flagged'},
  ],
  groups: {
    admin: "editor",
    editor: {
      edit: '*',
      transitions: [
        {from: DRAFT, to: [PUBLISHED, FLAGGED]},
        {from: PUBLISHED, to: [FLAGGED, DRAFT]},
        {from: FLAGGED, to: [PUBLISHED, DRAFT]}
      ]
    },
    contributor: {
      edit: ['Inventory', 'Artist', 'Exhibition', 'Contact', 'Resource'],
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