module.exports = function(grunt)
{
	grunt.initConfig
	(
		{
			/*
			 * build 
			 */
			shell:
			{
				build: {
					command: [
					          'npm install',
					          'grunt html2js',
					          'grunt build:modal:accordion'
					          ].join('&&'),
					options: {
						execOptions: {
							cwd: 'bower_components/angular-ui-bootstrap/'
						},
						failOnError:true,
						stdout:true,
						stderror:true
					}
					
				}
			}
		}
	);
	
	grunt.loadNpmTasks('grunt-shell');
	
	grunt.registerTask
	(
		'default', 
		[
		 	'shell:build'
	    ]
	);
};