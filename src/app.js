const express		= require( "express" );
const app		= express( );
const router		= express.Router( );

router.get( "/data", ( req, res ) => {
	return res.json( { "foo": "bar" } );
} );

app.use( "/api", router );
app.use( express.static( __dirname + "/www/" ) );

app.listen( 8080, function( ){
	console.log( "Listening on 8080" );
} );
