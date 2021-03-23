const path	= require( "path" );
const express	= require( "express" );
const api	= require( "./api" );

const generateApp = function( config ){
	const app = express( );

	app.use( "/api", api );
	app.use( express.static( path.join( __dirname, "../", "frontend" ) ) );

	return app;
};

module.exports = ( configToUse ) => {
	return generateApp( configToUse );
}
