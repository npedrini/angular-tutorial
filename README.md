#Angular Tutorial#

An angular [bower](http://bower.io/) component for creating simple tutorials.

##Installation##

	bower install angular-tutorial
	cd [repo location]
    npm install && bower install && grunt
    
##Usage##
			
Add `angular-tutorial` as a module dependency:

    angular.module('app','ngTutorial');

Register a tutorial:

    angular.module('app').controller
    (
       'AppCtrl',
		[
	 		'$scope','$tutorial',
	 		function($scope,$tutorial)
	 		{
	 			$tutorial.register
	 			(
	 				"tutorial1",		//id
	 				{},					//config
	 				"My Tutorial",		//name
	 				[					//steps
	 			 		{
							type: "showMessage",
							message: {
								content:"Step 1",
								buttonText: "Start",
								header: "Welcome!"
							}
						},
						.
						.
						.
	 				]	
	 			);
	 		}
		 ]
	);

Trigger a tutorial:

    <button type='button' class='btn btn-lin' ng-tutorial ng-tutorial-id='mytutorial'>My Tutorial</button></pre>

##Step Types##
			
####waitForClick####
				
The `waitForClick` step type tells the tutorial to wait for one of the specified targets to be clicked.
					
Properties

- `selectors` One or more [css selectors](http://www.w3schools.com/cssref/css_selectors.asp) to target (Array)
- `tooltips` Tooltips to show for the corresponding `selector` (Array) 
  -  Tooltip properties:
	 - `text` Text to display in the tooltip (String)
	 - `placement` One of top, right, bottom or left (String)
					
####waitForNavigate#####
				
The `waitForNavigate` step type tells the tutorial to wait for a change to `$location.path()`.
					
Properties
					
- `path` The value `$location.path()` must be set to to continue (String, required)
- `selectors` One or more [css selectors](http://www.w3schools.com/cssref/css_selectors.asp) to target (Array)
- `tooltips` Tooltips to show for the corresponding `selector` (Array) 
  -  Tooltip properties:
	 - `text` Text to display in the tooltip (String)
	 - `placement` One of top, right, bottom or left (String)
				
####showMessage####
				
The `showMessage` step type tells the tutorial to show a message using [ui-bootstrap](http://angular-ui.github.io/bootstrap/)'s `$modal` service
					
Properties
					
- `message` The message to display (String/Object, required) 
  If the message is an Object, the following properties are supported
  - `message` Text to display in the tooltip (String, required)
  - `buttonText` Text for the confirm button (defaults to "Continue") (String)
  - `header` Text for the moda's header (no header will be displayed if unspecified) (String)

####delay####
				
The `delay` step type tells the tutorial to wait before proceeding.
					
Properties
					
- `delay` The delay in milliseconds to wait (String/Object, required)