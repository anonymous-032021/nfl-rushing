const config	= require( "config" );
const App	= require( "./lib/app" );

const app = App( config );

app.listen( config.port, ( err ) => {
	if( err ){
		console.log( err );
		process.exit(1);
	}
	console.log( "Listening on port " + config.port );
} );
