Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  try {
    assert(!mgr.error, 'unexpected database manager error: '+JSON.stringify(mgr.error));

    var allnames = mgr.allDatabaseNames;
    assert(!mgr.error, 'unexpected database manager error: allDatabaseNames');
    assert(allnames, 'allDatabaseNames should not return null');
    if (allnames.length > 0) {
      Ti.API.warn("removing leftover databases: "+allnames);
      _.each(allnames, function(name) {
        var db = mgr.databaseNamed(name);
        db.deleteDatabase();
      });
    }

    var nonexistantdb = mgr.databaseNamed('test002');
    assert(!mgr.error, 'unexpected database manager error: nonexistant test002 '+JSON.stringify(mgr.error));
    assert(!nonexistantdb, 'databaseManager.databaseNamed() returned a nonexistant database');
  
    var newdb = mgr.createDatabaseNamed('test002');
    assert(!mgr.error, 'unexpected database manager error: createDatabaseNamed test002');
    assert(newdb, 'error creating new database: '+JSON.stringify(newdb));
    assert(newdb.name === 'test002', 'created db with incorrect name');
  
    var newdb2 = mgr.databaseNamed('test002');
    assert(!mgr.error, 'unexpected database manager error');
    assert(newdb2, 'failed to get newly-created db');
    assert(newdb == newdb2, 'proxies were not equal');

    allnames = mgr.allDatabaseNames;
    assert(!mgr.error, 'unexpected database manager error: allDatabaseNames');
    assert(allnames.length === 1, 'wrong number of database names');
    assert(allnames[0] === 'test002', 'wrong name returned by allDatabaseNames');
    
    // TODO delete database?
    var result = newdb.deleteDatabase();
    assert(result === true, 'error deleting database: '+JSON.stringify(result));

    // database with invalid characters
    var invaliddb = mgr.createDatabaseNamed('_REpL1Cati0n');
    assert(!invaliddb, 'failed to return error when creating a database with an invalid name');
    assert(mgr.error, 'missing error field');

    if (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {
      // install database
      var basedir = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'assets', 'CouchbaseLite').path;
      var dbfile = [basedir, 'elements.touchdb'].join(Ti.Filesystem.separator);
      var attdir = [basedir, 'elements attachments'].join(Ti.Filesystem.separator);
      var installresult = mgr.installDatabase('elements', dbfile, attdir);
      assert(installresult, 'install failed: '+mgr.error);
      var eldb = mgr.databaseNamed('elements');
      assert(eldb, 'could not open elements database after install');
      var doc = eldb.documentWithID('1AD71A0D-3213-4059-9D91-8C4A70DD9183');
      var att = doc.currentRevision.attachmentNamed('image.jpg');
      imageView1.image = att.bodyURL;
      eldb.deleteDatabase();
      
      // install failure
      installresult = mgr.installDatabase('failure', '/foo/bar/baz', '/bing/bang/boom');
      assert(!installresult, 'failed install returned true');
      assert(mgr.error, 'no error object on failed install');
    }
  }
  catch (e) {
      throw e;
  }
    
}