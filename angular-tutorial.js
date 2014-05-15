(function (window, angular, undefined) { 'use strict';

	angular.module('ngTutorial',['ngSanitize','ui.bootstrap'])
		.factory
		(
			'$tutorial',
			 function($rootScope)
			 {
				 var stepTypes = ["showMessage", "waitForNavigate","waitForClick","delay"];
				 
				 var self = {};
				 
				 self.currentTutorial = null;
				 self._tutorials = null;
				 
				 self.get = function(id)
				 {
					 if( !id || !self._tutorials[id] ) return null;
					 
					 return self._tutorials[id];
				 };
				 
				 self.set = function(tutorial)
				 {
					 if( !self._tutorials ) self._tutorials = {};
					 
					 self._tutorials[tutorial.id] = tutorial;
				 };
				 
				 self.register = function(id,config,name,steps)
				 {
					 var tutorialSteps = new Array();
					 
					 var configDefaults = {cancellable:false,highlightOpacity:.5};
					 angular.forEach(configDefaults,function(val,key){ if( !config[key] ) config[key] = val; });
					 
					 var tutorial = {};
					 tutorial.id = id;
					 tutorial.config = config;
					 tutorial.name = name || "Tutorial";
					 
					 angular.forEach
					 (
						steps,
						function(_step)
						{
							if( !_step.type ) throw new Error("type required");
							
							var step = {};
							
							if( stepTypes.indexOf(_step.type) == -1 ) 
								throw new Error("Step type '" + _step.type + "' is unsupported");
							else 
								step.type = _step.type;
							
							//	TODO: parse args based on step type
							var args = ['delay','selectors','message','path','tooltips'];
							angular.forEach(args,function(key){if(_step[key]) step[key] = _step[key];})
							
							tutorialSteps.push( step );
						}
					 );
					 
					 tutorial.steps = tutorialSteps;
					 
					 self.set(tutorial);
				 };
				 
				 self.start = function(tutorial)
				 {
					 if( !tutorial ) throw new Error( "no tutorial" );
					 
					 $rootScope.$apply(function(){ self.currentTutorial = tutorial; });
				 };
				 
				 self.startTutorialById = function(tutorialId)
				 {
					 self.start( self.get(tutorialId) );
				 };
				 
				 return self;
			 }
		)
		.directive
		(
			'ngTutorial',
			function($tutorial,$compile,$modal)
			{
				return {
					type:'A',
					controller: function($scope,$rootScope,$tutorial,$location,$timeout)
					{
						$scope.tutorialService = $tutorial;
						$scope.tutorial = null;
						
						$scope.locationListenerDeregister;
						$scope.tooltipAttributeCache;
						
						$('.modal[data-color]').on
						(
							'show hidden',
							function () 
							{
								$('body').toggleClass('modal-color-'+ $(this).data('color'));
							}
						);
						
						var nextStep = function()
						{
							reset();
							
							if( $scope.tutorial.steps
								&& $scope.tutorial.steps.length )
							{
								$scope.currentStep = $scope.tutorial.steps.shift();
								
								switch( $scope.currentStep.type )
								{
									case "showMessage":
										
										processMessage();
										
										break;
										
									case "waitForNavigate":
									
										processNavigate();
										
										showBlocker();
										showHighlight();
										
										break;
										
									case "waitForClick":
										
										showBlocker();
										showHighlight();
										
										break;
										
									case "delay":
										
										showBlocker();
										showHighlight();
										
										processDelay();
										
										break;
								};
							}
							else
							{
								complete();
							}
						};
						
						var reset = function()
						{
							hideBlocker();
							hideHighlight();
							
							//	hide all tooltips
							angular.element('.tutorial-tooltip').tooltip('hide').removeClass('tutorial-tooltip');
							
							var step = $scope.currentStep;
							
							if( step
								&& step.selectors
								&& step.tooltips )
							{
								//	restore tooltip-related attributes
								for(var i=0;i<step.selectors.length;i++)
								{
									var el = angular.element( step.selectors[i] );
									
									if( el 
										&& el.get(0)
										&& step.tooltips 
										&& step.tooltips[i] ) 
									{
										if( $scope.tooltipAttributeCache[i] )
										{
											angular.forEach
											(
												$scope.tooltipAttributeCache[i],
												function(val,key)
												{
													if( val !== undefined )
														el.attr(key,unescape(val));
													else
														el.removeAttr(key);
												}
											);
										}
									}
								}
							}
						};
						
						var processNavigate = function()
						{
							var path = $location.path();
							
							if( path == $scope.currentStep.path )
							{
								nextStep();
							}
							else
							{
								$scope.locationListenerDeregister = $rootScope.$on
								(
									'$locationChangeSuccess',
									function()
									{
										var path = $location.path();
										
										if( $scope.currentStep 
											&& $scope.currentStep.type == "waitForNavigate" 
											&& path == $scope.currentStep.path )
										{
											$scope.locationListenerDeregister();
											
											$timeout(function(){nextStep()},100);
										}
									}
								);
							}
						};
						
						var showBlocker = function()
						{
							hideBlocker();
							
							var step = $scope.currentStep;
							
							var w = angular.element(window).width();
							var h = angular.element(window).height();
							var scrollTop = angular.element(window).scrollTop();
							
							//	blocker
							var blocker = angular.element("<div id='tutorial-blocker' style='position:absolute;z-index:1031;left:0px;top:"+scrollTop+"px;bottom:0px;right:0px;width:" + w + "px;height:" + h + "px;'></div>");
							
							angular.element('body').append(blocker);
							
							blocker.click
							(
								function(e)
								{
									//	hide blocker from document.elementFromPoint
									angular.element(this).css('display','none');
									
									var element = angular.element(document.elementFromPoint(e.clientX, e.clientY));
									var ancestors = [angular.element(element)].concat( angular.element(element).parents() );
									
									angular.forEach
									(
										step.selectors,
										function(selector)
										{
											var match = false;
											
											angular.forEach
											(
												ancestors,
												function(ancestor)
												{
													if( !match
														&& angular.element(selector).get(0) === ancestor.get(0) )
													{
														match = true;
														
														ancestor.click();
														
														if( step.type === "waitForClick" )
														{
															nextStep();
														}
													}
												}
											);
										}
									);
									
									//	show blocker
									angular.element(this).css('display','block');
								}
							);
						};
						
						var hideBlocker = function()
						{
							if( angular.element("#tutorial-blocker") )
								angular.element("#tutorial-blocker").remove();
						};
						
						var showHighlight = function()
						{
							hideHighlight();
							
							$scope.tooltipAttributeCache = {};
							
							var step = $scope.currentStep;
							
							var w = angular.element(window).width();
							var h = angular.element(window).height();
							var scrollTop = angular.element(window).scrollTop();
							
							var highlight = document.createElementNS('http://www.w3.org/2000/svg','svg');
							highlight.setAttribute('id','tutorial-cutout');
							highlight.setAttribute('style',"pointer-events:none;position:absolute;z-index:1030;left:0px;top:" + scrollTop + "px;bottom:0px;right:0px;width:" + w + "px;height:" + h + "px;");
							
							var pathd = ["M 0,0 L" + w + ",0 " + w + "," + h + ", 0," + h + " z"];
							
							if( step.selectors )
							{
								for(var i=0;i<step.selectors.length;i++)
								{
									var el = angular.element( step.selectors[i] );
									
									if( !el || !el.get(0) ) throw new Error("Invalid element " + step.selectors[i] )
									
									if( step.tooltips 
										&& step.tooltips[i] ) 
									{
										el.addClass('tutorial-tooltip');
										
										$scope.tooltipAttributeCache[i] = {'title':escape(el.attr('title')),'data-toggle':escape(el.attr('data-toggle')),'data-placement':escape(el.attr('data-placement'))};
										
										el.attr('title',step.tooltips[i].text);
										el.attr('data-toggle','tooltip');
										el.attr('data-placement',step.tooltips[i].placement||'top');
										el.attr('data-container','body');
										
										el.tooltip('show');
									}
									
									var pos = el.offset();
									var dims = {width:el.outerWidth(),height:el.outerHeight()};
									
									pos.top -= scrollTop;
									
									var p = 'M ' + pos.left + ',' + pos.top + ' L' + (pos.left) + ',' + (pos.top+dims.height) + ' ' + (pos.left+dims.width) + ',' + (pos.top+dims.height) + ' ' + (pos.left+dims.width) + ',' + pos.top + ' z' ;
									
									pathd.push(p);
								}
							}
							
							var path = document.createElementNS('http://www.w3.org/2000/svg','path');
							path.setAttribute('fill','#000');
							path.setAttribute('fill-opacity',$scope.tutorial.config.highlightOpacity);
							path.setAttribute('d',pathd.join(' '));
							
							highlight.appendChild( path );
							
							document.body.appendChild(highlight);
						};
						
						var hideHighlight = function()
						{
							if( angular.element("#tutorial-cutout") )
								angular.element("#tutorial-cutout").remove();
						};
						
						var processMessage = function()
						{
							var step = $scope.currentStep;
							
							var message = (typeof step.message === 'object') ? step.message.content : step.message;
							var header = null;
							var buttonText = null;
							
							if( !message ) nextStep();
							
							if( (typeof step.message === 'object') )
							{
								header = step.message.header;
								buttonText = step.message.buttonText;
							}
							
							var waitForModalClose = showMessage(message,header,buttonText,$scope.tutorial.config.cancellable);
							
							waitForModalClose.then( nextStep, abort )
						};
						
						var showMessage = function(message,header,closeText,cancellable)
						{
							closeText = closeText || "Continue";
							
							var ModalCtrl = function($scope,$modalInstance,message,header,closeText,cancellable)
						    {
						    	$scope.message = message;
						    	$scope.header = header;
						    	$scope.cancellable = cancellable;
						    	$scope.closeText = closeText;
						    };
						    
							var modalInstance = $modal.open
						    (
					    		 {
					    			 template: '<div class="modal-header" ng-if="header"><h4 class="modal-title">{{header}}</h4></div><div class="modal-body"><span ng-bind-html="message"></span></div><div class="modal-footer"><button type="submit" class="btn btn-default btn-sm" ng-click="$dismiss()">Cancel Tutorial</button><button type="submit" class="btn btn-primary btn-sm" ng-click="$close()">{{closeText}}</button></div>',
					    			 backdrop: 'static',
					    			 controller: ModalCtrl,
								     resolve: {
								    	 cancellable: function(){ return cancellable; },
								    	 closeText: function(){ return closeText; },
								    	 header: function(){ return header; },
								    	 message: function(){ return message; }
								     }
					    		 }
						    );
						    
							return modalInstance.result;
						};
						
						var processDelay = function()
						{
							$timeout( nextStep, $scope.currentStep.delay );
						};
						
						var abort = function()
						{
							complete(true);
						};
						
						var complete = function(aborted)
						{
							$scope.tutorial = null;
							$tutorial.currentTutorial = null;
						};
						
						var updateTimeout;
						var update = function()
						{
							if( updateTimeout ) 
							{
								$timeout.cancel(updateTimeout);
								
								updateTimeout = null;
							}								
							
							updateTimeout = $timeout
							(
								function()
								{
									updateTimeout = null;
									
									showBlocker();
									showHighlight();
								}
								,100
							);
						};
						
						angular.element(window).resize(update);
						angular.element(window).scroll(update);
						
						$scope.$watch
						(
							'tutorialService.currentTutorial',
							function(newVal,oldVal)
							{
								if( newVal != oldVal )
								{
									$scope.tutorial = angular.copy( newVal );

									angular.element('head > #angular-tutorial-styles').remove();
									
									if( newVal )
									{
										var opacity = $scope.tutorial.config.highlightOpacity;
										angular.element('head').append('<style id="angular-tutorial-styles">.modal-backdrop.in { opacity:' + opacity + '; filter: alpha(opacity=' + (opacity*100) + '); }');
										
										nextStep();
									}
								}
							}
						);
					},
					link: function(scope,element,attrs)
					{
						angular.element(element).on
						(
							'click',
							function()
							{
								if( attrs.ngTutorialId )
									$tutorial.startTutorialById( attrs.ngTutorialId );
							}
						);
					}
				};
			}
		);
	}
)(window,window.angular);