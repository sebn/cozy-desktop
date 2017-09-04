var _ = require('lodash')

/***** CHOKIDAR EVENT TYPE **************************************************/

var ChokidarEventType = {
  moveParts: new Set(['add', 'addDir', 'unlink', 'unlinkDir']),

  canBeMovePart (type) {
    return this.moveParts.has(type)
  },

  canBeMoveSrc (type) {
    return type.startsWith('unlink')
  },

  complements: new Map([
    ['add', 'unlink'],
    ['addDir', 'unlinkDir'],
    ['unlink', 'add'],
    ['unlinkDir', 'addDir'],
  ]),

  getComplement (type) {
    return this.complements.get(type)
  },

  relevantStatFields (type) {
    const fields = ['ino', 'mtime', 'ctime']
    if (!type.endsWith('Dir')) fields.push('size')
    return fields
  },
}

ChokidarEventType.canBeMovePart('add')

ChokidarEventType.canBeMovePart('change')


ChokidarEventType.canBeMoveSrc('add')

ChokidarEventType.canBeMoveSrc('unlink')

ChokidarEventType.canBeMoveSrc('unlinkDir')


ChokidarEventType.getComplement('unlink')

ChokidarEventType.getComplement('addDir')


ChokidarEventType.relevantStatFields('add')

ChokidarEventType.relevantStatFields('addDir')


/***** CHOKIDAR EVENT *******************************************************/

var ChokidarEvent = {
  build (type, path, stats) {
    const event = {type, path}
    if (stats) {
      event.stats =_.pick(stats, ChokidarEventType.relevantStatFields(type))
    }
    return event
  },

  toString (event) {
    const idTag = event.stats ? `[${event.stats.ino}]` : ''
    return `${event.type} ${JSON.stringify(event.path)} ${idTag}`
  },
}

/***** LOCAL EVENT **********************************************************/

var LocalEvent = {
  chokidarMapping: new Map([
    ['add', 'addFile'],
    ['addDir', 'addFolder'],
    ['change', 'updateDoc'],
    ['unlink', 'deleteFile'],
    ['unlinkDir', 'deleteFolder'],
  ]),

  fromSingleChokidarEvent (chokidarEvent) {
    const localEvent = _.pick(chokidarEvent, ['path', 'id'])
    localEvent.type = this.chokidarMapping.get(chokidarEvent.type)
    return localEvent
  },

  moveFromChokidarEvents (chokidarEvent, otherChokidarEvent) {
    const moveEvent = {
      type: 'move' + (chokidarEvent.type.endsWith('Dir') ? 'Dir' : 'File'),
      id: chokidarEvent.id,
    }
    if (chokidarEvent.type.startsWith('unlink')) {
      moveEvent.src = chokidarEvent.path
      moveEvent.dst = otherChokidarEvent.path
    } else {
      moveEvent.src = otherChokidarEvent.path
      moveEvent.dst = chokidarEvent.path
    }
    return moveEvent
  },

  toString (event) {
    if (event.type.startsWith('move')) {
      return `${event.type} ${event.src} → ${event.dst} [${event.id}]`
    } else {
      return `${event.type} ${event.path} [${event.id}]`
    }
  },
}

LocalEvent.fromSingleChokidarEvent({type: 'add', path: 'foo/bar'})

LocalEvent.moveFromChokidarEvents(
  {type: 'addDir', path: 'foo/qux'},
  {type: 'unlinkDir', path: 'foo/bar'}
)

LocalEvent.moveFromChokidarEvents(
  {type: 'unlink', path: 'foo/bar'},
  {type: 'add', path: 'foo/qux'}
)

/***** POUCH STUB ***********************************************************/

function PouchStub () {
  this.docs = []
}

PouchStub.prototype.put = function (doc) {
  this.docs.push(doc)
}

PouchStub.prototype.bulkDocs = function (docs) {
  _.each(docs, this.put.bind(this))
}

PouchStub.prototype.docsWithPathInList = function (paths) {
  const pathSet = new Set(paths)
  return _.filter(this.docs, doc => pathSet.has(doc.path))
}

var pouch = new PouchStub()

pouch.put({id: 'FOO', path: 'foo', docType: 'folder', inode: '123'})
pouch.bulkDocs([
  {id: 'FOO/BAR.BAZ', path: 'foo/bar.baz', docType: 'file', inode: '456'},
  {id: 'FOO/QUX', path: 'foo/qux', docType: 'folder', inode: '789'},
])
pouch

pouch.docsWithPathInList(['foo/qux', 'missing', 'foo'])

/***** IDENTIFICATION METHODS ***********************************************/

var getter = (path) => _.partialRight(_.get, path)

var InodeIdent = function () {}
InodeIdent.prototype.docId = getter('inode')
InodeIdent.prototype.eventId = function (event) {
  return event.stats && event.stats.ino
}

var NTFSExtAttrIdent = function (syncPath) { this.syncPath = syncPath }
NTFSExtAttrIdent.prototype.docId = getter('remote.id')
NTFSExtAttrIdent.prototype.eventId = function (event) {
  // TODO: Retrieve remote ID from NTFS extended attribute
}

var HiddenFileIdent = function (syncPath) { this.syncPath = syncPath }
HiddenFileIdent.prototype.docId = getter('remote.id')
HiddenFileIdent.prototype.eventId = function (event) {
  // TODO: Retrieve remote ID from hidden file
}

/***** IDENTIFICATION *******************************************************/

var pouch = new PouchStub()

pouch.put({path: 'foo', inode: '10351796'})
pouch.put({path: 'foo/subdir', inode: '10364693'})
pouch.put({path: 'foo/subdir/file', inode: '10353173'})

pouch.docs

var events = [
  {type: 'unlink', path: 'foo/subdir/file'},
  {type: 'unlinkDir', path: 'foo/subdir'},
  {type: 'unlinkDir', path: 'foo'},
  {type: 'addDir', path: 'bar', stats: {ino: '10351796'}},
  {type: 'addDir', path: 'bar/subdir', stats: {ino: '10364693'}},
  {type: 'add', path: 'bar/subdir/file', stats: {ino: '10353173'}},
]

var identifyEvents = (events, pouch, identMethod) => {
  const eventPaths = _.chain(events).map('path').uniq().value()
  const relatedDocs = pouch.docsWithPathInList(eventPaths)
  const knownIdsByPath = new Map(_.map(relatedDocs, doc => [doc.path, identMethod.docId(doc)]))

  return events.map(event => {
    const id = identMethod.eventId(event) || knownIdsByPath.get(event.path)
    return _.set(event, 'id', id)
  })
}

var identifiedEvents = identifyEvents(events, pouch, new InodeIdent())

/***** MOVE STEPS AGGREGATION ***********************************************/

// var eventsById = _.groupBy(events, 'id')
// _.chain(events).map('id').uniq().map(_.partial(_.get, eventsById)).value()

var findMovePartIndex = (chokidarEvents, event, startIndex) => {
  for (var index = startIndex; index < chokidarEvents.length; index++) {
    const otherEvent = chokidarEvents[index];

    if (otherEvent.id === event.id) {

      if (otherEvent.type === ChokidarEventType.getComplement(event.type) &&
          otherEvent.path !== event.path) {
        return index
      } else {
        return
      }
    }
  }
}

var aggregateMoves = (chokidarEvents) => {
  const localEvents = []
  const skip = new Set()

  for (var index = 0; index < chokidarEvents.length; index++) {
    if (skip.has(index)) continue

    const event = chokidarEvents[index]

    if (ChokidarEventType.canBeMovePart(event.type)) {
      const otherIndex = this.findMovePartIndex(chokidarEvents, event, index+1)

      if (otherIndex) {
        const otherEvent = chokidarEvents[otherIndex]
        localEvents.push(LocalEvent.moveFromChokidarEvents(event, otherEvent))
        skip.add(otherIndex)
      } else {
        localEvents.push(LocalEvent.fromSingleChokidarEvent(event))
      }
    }
  }

  return localEvents
}

var aggregate = (chokidarEvents) => {
  return aggregateMoves(chokidarEvents).map(LocalEvent.toString)
}

var macOSMove = [
  {type: 'addDir', path: 'src/dir', id: 1},
  {type: 'addDir', path: 'src/dir/empty-subdir', id: 2},
  {type: 'addDir', path: 'src/dir/subdir', id: 3},
  {type: 'add', path: 'src/dir/subdir/file', id: 4},
  {type: 'unlinkDir', path: 'src/dir/empty-subdir', id: 2},
  {type: 'unlinkDir', path: 'src/dir/subdir', id: 3},
  {type: 'unlinkDir', path: 'src/dir', id: 1},
  {type: 'addDir', path: 'dst/dir', id: 1},
  {type: 'addDir', path: 'dst/dir/empty-subdir', id: 2},
  {type: 'addDir', path: 'dst/dir/subdir', id: 3},
  {type: 'unlink', path: 'src/dir/subdir/file', id: 4},
  {type: 'add', path: 'dst/dir/subdir/file', id: 4},
  {type: 'unlink', path: 'dst/dir/subdir/file', id: 4},
  {type: 'unlinkDir', path: 'dst/dir/empty-subdir', id: 2},
]
aggregate(macOSMove)

var winMoveOk = [
  {type: 'addDir', path: 'dst/dir', id: 1},
  {type: 'addDir', path: 'dst/dir/empty-subdir', id: 2},
  {type: 'addDir', path: 'dst/dir/subdir', id: 3},
  {type: 'unlinkDir', path: 'src/dir/subdir', id: 3},
  {type: 'unlinkDir', path: 'src/dir/empty-subdir', id: 2},
  {type: 'unlinkDir', path: 'src/dir', id: 1},
  {type: 'unlink', path: 'src/dir/subdir/file', id: 4},
  {type: 'add', path: 'dst/dir/subdir/file', id: 4},
]
aggregate(winMoveOk)

var winMoveBroken = [
  {type: 'addDir', path: 'dst/dir', id: 0},
  {type: 'add', path: 'dst/dir/file1', id: 1},
  {type: 'add', path: 'dst/dir/file2', id: 2},
  {type: 'add', path: 'dst/dir/file3', id: 3},
  {type: 'unlink', path: 'src/dir/file3', id: 3},
  {type: 'unlink', path: 'src/dir/file2', id: 2},
  {type: 'unlink', path: 'src/dir/file1', id: 1},
  {type: 'unlinkDir', path: 'src/dir', id: 0},
]
aggregate(winMoveBroken)

/***** ROOT MOVES AGGREGATION ***********************************************/

/* var aggregateRootMoves = (eventList) => {
  const moves = new Map()
  const aggregatedEvents = []

  for (let event of eventList) {
    if (event.type.startsWith('move')) {
      moves.set(event.src, event.dst)
    }
  }

  return aggregatedEvents
} */

/***** STATE MANAGEMENT *****************************************************/

// Message types (input)
var CHOKIDAR_READY = 'CHOKIDAR_READY'
var CHOKIDAR_EVENT = 'CHOKIDAR_EVENT'

// Side-effect types (output)
var BULK_DOCS = 'BULK_DOCS'

var initialState = () => {
  return {
    initialScan: true,
    pendingEvents: [],
    lastEventTime: null,
  }
}

var docFromInitialScanEvent = (event) => {
  return {
    id: event.path.toUpperCase(),
    path: event.path,
    docType: (event.type.endsWith('Dir') ? 'folder' : 'file'),
    inode: event.stats.ino,
  }
}

docFromInitialScanEvent({type: 'addDir', path: 'foo/bar', stats: {ino: '10147030'}, id: '10147030'})

var update = (state, msg) => {
  switch (msg.type) {
    case CHOKIDAR_EVENT:
      const event = msg.event
      if (state.timeSinceLastEvent > 2000 && !state.initialScan) {
        const events = state.pendingEvents
        state.pendingEvents = []
        return {type: PROCESS_EVENTS, events}
      } else {
        state.pendingEvents.push(event)
      }
      break

    case CHOKIDAR_READY:
      // FIXME: Temporarily save initial scan results in Pouch
      const docs = _.map(state.pendingEvents, docFromInitialScanEvent)
      state.initialScan = false
      state.pendingEvents = []
      return {type: BULK_DOCS, docs}
  }
}

var state = initialState()
state

update(state, {type: CHOKIDAR_EVENT, event: {type: 'addDir', path: '', stats: {ino: '10147030 '}}})

update(state, {type: CHOKIDAR_EVENT, event: {type: 'addDir', path: 'toto', stats: {ino: '10351796  '}}})

update(state, {type: CHOKIDAR_EVENT, event: {type: 'add', path: 'coucou.txt', stats: {ino: '10353173  '}}})

state

update(state, {type: CHOKIDAR_READY})

state

update(state, {type: CHOKIDAR_EVENT, event: {type: 'addDir', path: 'foo', stats: {ino: '12345'}}})

state.lastEventTime

/***** LOCAL WATCHER ********************************************************/

var chokidar = require('chokidar')
var path = require('path')

if (LocalWatcher) delete LocalWatcher

function LocalWatcher (syncPath, pouch) {
  this.syncPath = syncPath
  this.pouch = pouch
  this.state = initialState()
}

InitialScanEvent = {
  toString (event) {
    return `${event.path} [${event.stats.ino}]`
  },
}

LocalWatcher.prototype.start = function () {
  if (this.chokidarWatcher) {
    console.warn('Already watching!')
  } else {
    // Start chokidar
    this.chokidarWatcher = chokidar.watch('.', {
      cwd: this.syncPath,
      alwaysStat: true,
    })

    // Set up event handlers
    for (let eventType of ['add', 'addDir', 'change', 'unlink', 'unlinkDir']) {
      this.chokidarWatcher.on(eventType, (path, stats) => {
        if (path === '') return
        const event = ChokidarEvent.build(eventType, path, stats)
        if (this.state.initialScan) {
          console.log(InitialScanEvent.toString(event))
        } else {
          console.log(ChokidarEvent.toString(event))
        }
        this.state.timeSinceLastEvent = this.state.timeSinceLastEvent ? new Date() - this.state.timeSinceLastEvent : 0
        this.update({type: CHOKIDAR_EVENT, event})
      })
    }

    console.log('----- Start of initial scan --------')

    this.chokidarWatcher.on('ready', () => {
      console.log('----- End of initial scan ----------')
      this.update({type: CHOKIDAR_READY})
    })
  }
}

LocalWatcher.prototype.update = function (msg) {
  const sideEffect = update(this.state, msg)

  if (sideEffect) {
    switch (sideEffect.type) {
      case BULK_DOCS:
        this.pouch.bulkDocs(sideEffect.docs)
        break
    }
  }
}

LocalWatcher.prototype.stop = function () {
  if (this.chokidarWatcher) {
    this.chokidarWatcher.close()
    delete this.chokidarWatcher
  }
}

var watcher
if (watcher) {
  watcher.stop()
  delete watcher
}

watcher = new LocalWatcher(path.resolve('./tmp/ng'), new PouchStub())
watcher.start()

// Following values can be evaluated after FS changes

watcher.state

watcher.pouch
