angular
	.module('app',['ngRoute','ngTutorial'])
	.config
	(
		[
		 	'$locationProvider','$routeProvider',
		 	function($locationProvider,$routeProvider)
		 	{
		 		$locationProvider.hashPrefix = "!";
		 		$locationProvider.html5Mode(false);
		 		
		 		$routeProvider
		 			.when('/home',{templateUrl:"partials/home.html"})
		 			.when('/tutorials',{templateUrl:"partials/tutorials.html"})
		 			.when('/about',{templateUrl:"partials/about.html"})
		 			.otherwise({redirectUrl:"/"});
		 	}
		 ]
	)
	.controller
	(
		'AppCtrl',
		[
		 	'$scope','$location','$tutorial',
		 	function($scope,$location,$tutorial)
		 	{
		 		$scope.location = $location;
		 		$scope.navigation = [{id:"home",label:"Home"},{id:"tutorials",label:"Sample Tutorials"}];
		 		
		 		$tutorial.register
		 		(
		 			"tutorial1",
		 			{
		 				cancellable: true,
		 				highlightOpacity:.25
		 			},
		 			[
		 			 	{
							type: "showMessage",
							message: {
								content:"<p><strong>This is first step in the tutorial.</strong></p><p>This tutorial will walk you throught the various step types <code>angular-tutorial</code> supports.</p>",
								buttonText: "Start",
								header: "Welcome!"
							}
						},
						{
							type: "showMessage",
							message: {
								content:"<p>Every step in a tutorial definition must have a <code>type</code>. The <code>type</code> to display a message is <code>showMessage</code>.</p><p>The <code>showMessage</code> step type supports a single property, <code>message</code>, which can either be a string containing the message text or an object with a <code>content</code> (required), <code>header</code> and <code>buttonText</code> property.</p><blockquote class='text-info'>Note that the ability to click the underlay to dismiss the modal has been disabled to preserve tutorial linearity. A Cancel button will be displayed if the tutorial is cancellable, which will cancel the tutorial.</blockquote>",
								buttonText: "Continue",
								header: "Step Types"
							}
						},
						{
							type: "showMessage",
							message: {
								content:"<p>The <strong>waitForNavigate</strong> step type requires a <code>path</code> property which specifys the value of <code>$location.path()</code> to wait for.</p><p>In the following step, <code>path</code> is set to <code>/home</code>.</p>",
								buttonText: "Show Step Type",
								header: "waitForNavigate"
							}
						},
		 			 	{
			 				type: "waitForNavigate",
			 				path: "/home",
			 				tooltips: 
			 					[
			 					 {selector:".navbar-nav li:nth-child(1) a",text:"Click here to go to the Home Screen",placement:"right"}
			 					 ],
			 				targets: [".navbar-nav li:nth-child(1) a"]
			 			},
			 			{
							type: "showMessage",
							message: {
								content:"<p>The <strong>waitForClick</strong> step type tells <code>angular-tutorial</code> to wait for a DOM element click. The step config object requires a <code>selectors</code> property, which is an array of css selectors to wait for.</p><blockquote class='text-info'>Note that <code>angular-tutorial</code> prevents the ability to click anything else in the DOM that lies outside the bounds of the specified selectors.</blockquote>",
								buttonText: "Show Step Type",
								header: "waitForClick"
							}
						},
			 			{
			 				type: "waitForClick",
			 				tooltips: 
			 					[
			 					 {selector:".container > .row:first-child > .col-sm-8 > h1",text:"I'm waiting for you to click this, and only this",placement:"right"}
			 					 ],
			 				targets: [".container > .row:first-child > .col-sm-8 > h1"]
			 			},
			 			{
			 				type: "waitForClick",
			 				tooltips: 
			 					[
			 					 {selector:"accordion > .panel-group > .panel:nth-child(1) > .panel-heading > .panel-title > a",text:"Please click this to",placement:"right"}
			 					 ],
			 				targets: ["accordion > .panel-group > .panel:nth-child(1) > .panel-heading > .panel-title > a"]
			 			},
			 			{
							type: "showMessage",
							message: {
								content:"<p>The <strong>delay</strong> step type tells the tutorial to wait for a bit. The step config object for this step type requires a <code>delay</code> property, which is the number of milliseconds to wait.</p>",
								buttonText: "Wait for 5 Seconds",
								header: "waitForClick"
							}
						},
			 			{
			 				type: "delay",
			 				delay: 5000
			 			},
			 			{
							type: "showMessage",
							message: "That's it! We've covered all the step types. You can restart the tutorial at any time by visiting <b>Tutorials</b>.",
							header: "Tutorial Complete!"
						},
		 			]
		 		);
		 	}
		 ]
	);