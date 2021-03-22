const config = require( "config" );

module.exports = {
	data: ( opts, cb ) => {
		
		const fs = require( "fs" );
		return cb( null, JSON.parse( fs.readFileSync( "/home/robert/src/thescore/nfl-rushing/rushing.json" ) ) );
	}

};
