const async	= require( "async" );
const config	= require( "config" );
const sqlite3	= require( "sqlite3" );

let dbReady = false;

// Note that this code is run on startup of
// the system. Depending on requirements
// I would assume that a better tool would be
// something like elasticsearch or an RDS 
// cluster or similar.

// This was setup specifically so that it was
// "fulfill the requirements" kind of solution
// given that it's an interview.

const db = new sqlite3.Database( ":memory:" );

// Yes reading all the data in this way is 
// stupid at serious scale, but at 10k it won't
// be an issue, and I'm solving for the requirements
// not going and making it bullet proof.

// Could use something like crossfilter instead of 
// sqlite, but again, solving for the requirements
// and not using a react starter boilerplate that
// deploys to serverless and is fault tolerant with DR
// and CI/CD and such - again, no need.

const fs = require( "fs" );

async.waterfall( [ ( cb ) => {

	db.run( "CREATE TABLE rushing ( Player TEXT, Team TEXT, Pos TEXT, Att INTEGER, 'Att/G' NUMERIC, Yds NUMERIC, Avg NUMERIC, 'Yds/G' NUMERIC, TD INTEGER, Lng NUMERIC, Lng_td BOOLEAN, '1st' NUMERIC, '1st%' NUMERIC, '20+' NUMERIC, '40+' NUMERIC, FUM NUMERIC )", cb );
}, ( cb ) => {

	// Small amount of preprocessing to 
	// facilitate separation of the 'T' at the
	// end of the Lng field. 
	async.each( JSON.parse( fs.readFileSync( "/home/robert/src/thescore/nfl-rushing/rushing.json" ) ).map( ( record ) => {

		// This could be optimized for readability or function.. right now its
		// a functional first pass, nothing more.
		const Lng_td	= typeof( record.Lng ) == "string" && record.Lng.endsWith( "T" ) ? true : false;
		const LngToUse	= typeof( record.Lng ) == "string" ? parseInt( record.Lng.replace("T","") ): record.Lng;
		return {
			...record,
			Lng_td,
			Lng: LngToUse
		};
	} ), ( record, cb ) => {

		// quick and dirty manipulation to quote strings 
		// but leave numbers or booleans as raw type.

		// Could have used params in the sqlite3 package or
		// similar; Again - solving for quick solution that is
		// functional not best and most feature proof.

		const valuesToUse = Object.values( record ).map( ( valueRecord ) => {
			if( typeof( valueRecord ) == "string" ){
				return '"' + valueRecord + '"';
			}
			return valueRecord;
		} ).join( "," );

		const _insertString = "INSERT INTO rushing ('" + Object.keys( record ).join( "', '" ) + "') VALUES( " + valuesToUse + " );";

		// console.log( _insertString );

		db.run( _insertString, cb );
	}, cb );
} ], ( err ) => {
	if( err ){
		console.log( "Couldn't setup database: " );
		console.log( err );
		process.exit(1);
	}

	// Technically should use a mutex or similar
	// if we have this population script setup here
	// in async while module.exports.data() could be
	// called beforehand.. although this is a solution
	// to a problem that shouldn't exist other than
	// this simple 'look what I can do' kind of example.

	// Ideally it wouldn't be required because the process
	// for shoving the data into some database would be
	// separated logically from startup.

	dbReady = true;
} );

// Stupid simple size, could be
// extended to be variable or defined in
// a config or similar.
const paginationSize = 10;

module.exports = {
	data: ( opts, cb ) => {

		// Catch the race condition from the async
		// db population.. absolutely a solution to
		// a problem that shouldn't exist if the purpose
		// was anything but show that it works.

		// Could be improved by having the async code
		// be setup separately, or called such that
		// it was effectively chained with the .listen
		// out of the API.
		if( !dbReady ){ return cb( "do_not_ready" ); }

		// opts is simply passed
		// through from tabulator
		// client side; Nothing fancy.

		let _queryToUse = "SELECT * FROM rushing";
		let _lastSizeQuery = "SELECT COUNT(*) FROM rushing";

		const addToQuery = ( whatToAdd ) => {
			_queryToUse += whatToAdd;
			_lastSizeQuery += whatToAdd;
		};
		
		if( opts.filters && opts.filters.length >= 1 && opts.filters[0].value !== ""){

			// Because we know we're only sorting on player
			// this is fairly stupid easy.. again, solving
			// for mvp / interview rather than everything.
			addToQuery(' WHERE Player LIKE "' + opts.filters[0].value + '%"');
		}

		// Simple default so that it looks nice to start with.. nothing
		// crazy.
		if( !opts.sorters || opts.sorters.length == 0 ){
			opts.sorters = [ { field: "Player", "dir": "asc" } ];
		}

		if( opts.sorters && opts.sorters.length >= 1 ){
			addToQuery(" ORDER BY " + opts.sorters.map( ( orderObj ) => {
				return '"' + orderObj.field + '" ' + orderObj.dir;
			} ).join( "," ) );
		}


									// Yes this is a blind sql injection
									// and I know it. Validation should have
									// handled this by now if this was a real
									// project, plus paramaterization.

		_queryToUse += " LIMIT " + paginationSize + " OFFSET " + ((opts.page-1)*paginationSize);

		// Run the query to get last size given the
		// current 

		//console.log( opts );
		//console.log( _queryToUse );

		async.parallel( [ ( cb ) => {
			db.get( _lastSizeQuery, cb );
		}, ( cb ) => {
			db.all( _queryToUse, cb );
		} ], ( err, queryResults ) => {
			if( err ){ return cb( err ); }

			// +1 required to handle offset 
			const last_page = Math.floor( Object.values(queryResults[0])[0] / paginationSize )+1;
			
			return cb( null, {
				last_page: last_page,
				data: queryResults[1]
			} );
		} );
	}

};
