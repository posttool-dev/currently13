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
      transitions: [
        {from: DRAFT, to: [PUBLISHED, FLAGGED]},
        {from: PUBLISHED, to: [FLAGGED, DRAFT]},
        {from: FLAGGED, to: [PUBLISHED, DRAFT]}
      ]
    },
    contributor: {
      form: ['Inventory', 'Artist', 'Exhibition', 'Contact', 'Resource', { name: 'User', form: 'profile' }],
      browse: ['Inventory', 'Artist', 'Exhibition', 'Contact', 'Resource'],
      transitions: [],
      requests: [
        {from: DRAFT, to: [PUBLISHED]},
        {from: PUBLISHED, to: [DRAFT]},
        {from: PUBLISHED, to: [FLAGGED]}
      ]
    }
  }
}