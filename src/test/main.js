const assert	= require( "assert" );
const path	= require( "path" );

const config		= require( "config" );
const superagent	= require( "superagent" );
const App		= require( path.join( __dirname, "../lib/app" ) );

const app = App( config );

let __server;
before( function( cb ){
	__server = app.listen( config.port, cb );
} );

after( function( cb ){ 
	__server.close( cb );
} );

// If I was going to be writing a bunch of tests
// I would split out not just these helpers into
// their own class for testing but also create
// an instance system that handles sessions ..

const baseUrl = ( ) => {
	return "http://localhost:" + config.port;
}

describe( "Main", function( ){
	it( "Returns a 404 on undefined path", function( cb ){

		superagent.get( baseUrl() + "/api/random_nope" )
			.end( ( err, res ) => {
				assert.equal( err.status, 404 );
				return cb( null );
			} );

	} );

	it( "Returns a JSON object if asked for data", function( cb ){
		superagent.get( baseUrl() + "/api/data" )
			.end( ( err, result ) => {
				if( err ){ return cb( err ); }
				assert.equal( result.status, 200 );
				
				assert.ok( Array.isArray( result.body.data ) );
				assert.ok( result.body.data.length > 1 );
				return cb( null );
			} );
	} );

	/*
	Would normally add in a generator for the tests using faker.js or similar
	and run some tests around sorting / filtering.

	Also would do some tests with frontend framework at this point too, since
	testing the UI can be done programmatically. This is my way of saying
	that if it was anything more than an interview request I would do that.
	*/
} );
