const express	= require( "express" );
const database	= require( "./database" );

const api	= express.Router( );

api.get( "/data", ( req, res, cb ) => {

	console.log( "I have req.query of " );
	console.log( req.query );

	return database.data( { }, ( err, data ) => {
		if( err ){ return cb( err ); }
		return res.json( data );
	} );
} );

module.exports = api;
