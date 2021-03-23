const express	= require( "express" );
const database	= require( "./database" );

const api	= express.Router( );

// Would normally use Joi validation
// here to validate and force strict interaction

api.get( "/data", ( req, res, cb ) => {

	// Would normally not be using a GET
	// request and just a POST, but the default
	// was a GET, and I don't see a ton of reason
	// to change it given the amount of data that
	// is being shoved across.


	// The defualts for this should be
	// setup in some kind of validations not the
	// endpoint itself.
	if( !req.query.params ){
		req.query.params = "{ }";
	}

	// Note that again, this was a decision based
	// on this being an interview assignment and not
	// particularly a full featured SAAS solution.

	let _dbOpts = { };
	try{
		if( req.query.params ){
			_dbOpts = JSON.parse( req.query.params );
		}
	}catch( err ){
		return cb( err );
	}

	return database.data( _dbOpts, ( err, data ) => {
		if( err ){ return cb( err ); }
		return res.json( data );
	} );
} );

module.exports = api;
