#xRibbon

`<x-ribbon>` elements are desgined as a simple DOM tool to support the interactive building of a linear sequence of modular pieces of information - like timelines, instructional steps, or playlists.  Functionality is provided to create, move and destroy items in a sequence.

##Basic Usage
`<x-ribbon>` elements currently have no exposed attributes.  Upon instantiation, the ribbon will have no items or 'cards' deployed; clicking on the ribbon will insert a new card at the clicked position.  New card contents are defined in the member function `this.cardConfig` (see below).  Other member functions help manage the creation, deletion and shuffling of these cards in sequence.

##Structure

###DOM Structure
The `<x-ribbon>` DOM consists of a sequence of `<div>` elements, packed linearly inside a wrapper.  The internal divs are an alternating sequence of 'ribbons', (ie divs styled to look like connecting lines joining subsequent steps in the ribbon) and 'cards', or divs intended to represent a step or item in the sequence, to be filled as needed.  Clicking on a ribbon div spawns a new item at that point in the sequence by default; also, the standard CSS packs the cards and ribbons in a horizontal row, with an internal scroll applied to the wrapper div.

###Member Functions

####`spawnCard(nextNode)`
Creates a new `<div>` for use as a new card, populates it via `this.cardConfig`, and inserts it in the ribbon sequence immediately before `nextNode`.

####`newNode(nextNode)`
Creates a new ribbon segment and item card, and inserts them in the ribbon immediately before `nextNode`.  Use this function directly for generating new items in the sequence.

####`cardConfig(targetElement)`
Populates the `targetElement` (nominally an item card) with DOM structure.  Note this is currently hard-coded as the contents for GRIFFIN's PPG items; decoupling this is pending.

####`deleteCard(target)`
Delete an item card and one adjacent ribbon segment.  `target` is the DOM element corresponding to the card to be deleted.

####`shuffleCardLater(target)`
Move an item card one step later (right) in the sequence if it isn't already at the end.  `target` is the DOM element corresponding to the card to be shuffled.

####`shuffleCardEarlier(target)`
Move an item card one step earlier (left) in the sequence if it isn't already at the beginning.  `target` is the DOM element corresponding to the card to be shuffled.
