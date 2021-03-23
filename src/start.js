const config	= require( "config" );
const path	= require( "path" );
const App	= require( path.join( __dirname, "./lib/app" ) );

const app = App( config );

app.listen( config.port, ( err ) => {
	if( err ){
		console.log( err );
		process.exit(1);
	}
	console.log( "Listening on port " + config.port );
} );
