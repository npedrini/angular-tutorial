#Angular Tutorial#

An angular [bower](http://bower.io/) component for creating simple tutorials.

##Installation##

###Build###

	bower install angular-tutorial
	cd bower_components/angular-tutorial
    npm install && bower install && grunt
  
###Include Dependencies###

Angular Tutorial depends on [UI Bootstrap](http://angular-ui.github.io/bootstrap/)'s Modal and [Bootstrap](http://getbootstrap.com/)'s tooltip (we're forced to use Bootstrap's native tooltip until UI Bootstrap's tooltip supports programmatic triggers). 

Make sure they are included in the page along with the `angular-tutorial` source:

	<script type="text/javascript" src="bower_components/bootstrap/js/tooltip.js"></script>
	<script type="text/javascript" src="bower_components/angular-ui-bootstrap/dist/ui-bootstrap-custom-tpls-0.10.0.js"></script>
	<script type="text/javascript" src="bower_components/angular-tutorial/angular-tutorial.js"></script>
    
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

- `highlight` One or more [css selectors](http://www.w3schools.com/cssref/css_selectors.asp) to hightlight via a cutout in the backdrop (defaults to `targets` if unspecified) (Array)
- `targets` One or more [css selectors](http://www.w3schools.com/cssref/css_selectors.asp) representing click targets (Array)
- `tooltips` Tooltips to show (Array) 
   Tooltip Properties
   - `selector` CSS selector to affix the tooltip to (String, required)
   - `text` Text to display in the tooltip (String)
   - `placement` One of top, right, bottom or left (String)
					
####waitForNavigate#####
				
The `waitForNavigate` step type tells the tutorial to wait for a change to `$location.path()`.
					
Properties

- `highlight` One or more [css selectors](http://www.w3schools.com/cssref/css_selectors.asp) to hightlight via a cutout in the backdrop (defaults to `targets` if unspecified) (Array)
- `path` The change in `$location.path()` to wait for (String, required)
- `targets` One or more [css selectors](http://www.w3schools.com/cssref/css_selectors.asp) representing click targets (Array)
- `tooltips` Tooltips to show for the corresponding `selector` (Array) 
   Tooltip Properties
   - `selector` CSS selector to affix the tooltip to (String, required)</li>
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