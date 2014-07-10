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
				 
				 self.running = function()
				 {
					 return self.currentTutorial != null;
				 };
				 
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
				 
				 self.register = function(id,config,steps)
				 {
					 var tutorialSteps = new Array();
					 
					 config = config || {};
					 
					 var configDefaults = {cancellable:false,highlightOpacity:.5};
					 angular.forEach(configDefaults,function(val,key){ if( !config[key] ) config[key] = val; });
					 
					 var tutorial = {};
					 tutorial.id = id;
					 tutorial.config = config;
					 
					 angular.forEach
					 (
						steps,
						function(_step)
						{
							if( !_step.type ) throw new Error("Step type missing for step [" + steps.indexOf(_step) + "]");
							
							var step = {};
							
							if( stepTypes.indexOf(_step.type) == -1 ) 
								throw new Error("Step type '" + _step.type + "' is unsupported");
							else 
								step.type = _step.type;
							
							//	TODO: parse args based on step type
							var args = ['delay','highlight','message','path','targets','tooltips'];
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
						
						$('.modal[data-color]').on
						(
							'show hidden',
							function () 
							{
								$('body').toggleClass('modal-color-'+ $(this).data('color'));
							}
						);
						
						var Z_INDEX_TOOLTIP = 2000;
						var Z_INDEX_HIGHLIGHT = 1999;
						var Z_INDEX_BLOCKER = 1998;
						
						var nextStep = function()
						{
							clearStep();
							
							if( $scope.tutorial.steps
								&& $scope.tutorial.steps.length )
							{
								$scope.currentStep = $scope.tutorial.steps.shift();
								
								switch( $scope.currentStep.type )
								{
									case "showMessage":
										
										processShowMessage();
										
										break;
										
									case "waitForNavigate":
									
										processWaitForNavigate();
										
										break;
										
									case "waitForClick":
										
										processWaitForClick();
										
										break;
										
									case "delay":
										
										processDelay();
										
										break;
								};
							}
							else
							{
								complete();
							}
						};
						
						var clearStep = function()
						{
							hideBlocker();
							hideHighlight();
							hideTooltips();
						};
						
						var clearTutorial = function()
						{
							angular.element('head > #angular-tutorial-styles').remove();
							
							angular.element(window).off('resize.ngTutorial');
							angular.element(window).off('scroll.ngTutorial');
						};
						
						var processWaitForNavigate = function()
						{
							showBlocker();
							showHighlight();
							showTooltips();
							
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
						
						var processShowMessage = function()
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
							
							showMessage(message,header,buttonText,$scope.tutorial.config.cancellable).then( nextStep, abort )
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
						
						var processWaitForClick = function()
						{
							showBlocker();
							showHighlight();
							showTooltips();
						};
						
						var processDelay = function()
						{
							showBlocker();
							showHighlight();
							showTooltips();
							
							$timeout( nextStep, $scope.currentStep.delay );
						};
						
						var showBlocker = function()
						{
							hideBlocker();
							
							var step = $scope.currentStep;
							
							var w = angular.element(window).width();
							var h = angular.element(window).height();
							var scrollTop = angular.element(window).scrollTop();
							
							//	blocker
							var blocker = angular.element("<div id='tutorial-blocker' style='position:absolute;z-index:" + Z_INDEX_BLOCKER + ";left:0px;top:"+scrollTop+"px;bottom:0px;right:0px;width:" + w + "px;height:" + h + "px;'></div>");
							
							angular.element('body').append(blocker);
							
							blocker.click
							(
								function(e)
								{
									e.stopImmediatePropagation();
									
									//	hide blocker from document.elementFromPoint
									angular.element(this).css('display','none');
									
									var element = angular.element(document.elementFromPoint(e.clientX, e.clientY));
									var ancestors = [angular.element(element)].concat( angular.element(element).parents() );
									
									angular.forEach
									(
										step.targets,
										function(target)
										{
											var match = false;
											
											angular.forEach
											(
												ancestors,
												function(ancestor)
												{
													if( !match
														&& angular.element(target).get(0) === ancestor.get(0) )
													{
														match = true;
														
														ancestor.trigger('click');
														
														if( step.type === "waitForClick" )
														{
															nextStep();
														}
													}
												}
											);
										}
									);
									
									angular.forEach
									(
										step.highlight,
										function(highlight)
										{
											var element = angular.element(document.elementFromPoint(e.clientX, e.clientY));
											
											if( angular.element(highlight).get(0) === angular.element(element).get(0) )
												angular.element(highlight).trigger('focus');
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
							
							var step = $scope.currentStep;
							
							var w = angular.element(window).width();
							var h = angular.element(window).height();
							var scrollTop = angular.element(window).scrollTop();
							
							var highlight = document.createElementNS('http://www.w3.org/2000/svg','svg');
							highlight.setAttribute('id','tutorial-cutout');
							highlight.setAttribute('style',"pointer-events:none;position:absolute;z-index:" + Z_INDEX_HIGHLIGHT + ";left:0px;top:" + scrollTop + "px;bottom:0px;right:0px;width:" + w + "px;height:" + h + "px;");
							
							var pathd = ["M 0,0 L" + w + ",0 " + w + "," + h + ", 0," + h + " z"];
							var targets = step.highlight || step.targets;
							
							if( targets )
							{
								for(var i=0;i<targets.length;i++)
								{
									var el = angular.element( targets[i] );
									
									if( !el || !el.get(0) ) throw new Error("Invalid element '" + targets[i] + "' specified in step [" + $scope.tutorialService.currentTutorial.steps.indexOf(step) + "]")
									
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
						
						var showTooltips = function()
						{
							var step = $scope.currentStep;
							if( !step.tooltips ) return;
							
							for(var i=0;i<step.tooltips.length;i++)
							{
								var el = angular.element( step.tooltips[i].selector );
								
								if( !el || !el.get(0) ) throw new Error("Invalid element '" + step.tooltips[i].selector + "'")
								
								el.addClass('tutorial-tooltip');
								
								el.tooltip({ animation: true, title: step.tooltips[i].text,placement:step.tooltips[i].placement||'top',container:'body'});
								el.tooltip('show');
							}
						};
						
						var hideTooltips = function()
						{
							//	hide all tooltips
							angular.element('.tooltip').tooltip('destroy');
							angular.element('.tutorial-tooltip').tooltip('destroy');
							
							var step = $scope.currentStep;
							
							if( step
								&& step.tooltips )
							{
								//	restore tooltip-related attributes
								for(var i=0;i<step.tooltips.length;i++)
								{
									var el = angular.element( step.tooltips[i].selector );
									
									if( el 
										&& el.get(0) ) 
									{
										el.removeAttr('data-original-title');
									}
								}
							}
						};
						
						var abort = function()
						{
							complete(true);
						};
						
						var complete = function(aborted)
						{
							clearStep();
							clearTutorial();							
							
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
									showTooltips();
								}
								,100
							);
						};
						
						$scope.$watch
						(
							'tutorialService.currentTutorial',
							function(newVal,oldVal)
							{
								if( newVal != oldVal )
								{
									$scope.tutorial = angular.copy( newVal );
									
									if( newVal )
									{
										var opacity = $scope.tutorial.config.highlightOpacity;
										angular.element('head').append('<style id="angular-tutorial-styles">.tooltip { z-index:' + Z_INDEX_TOOLTIP + ' !important;} .modal-backdrop.in { opacity:' + opacity + '; filter: alpha(opacity=' + (opacity*100) + '); }');
										
										angular.element(window).on('resize.ngTutorial',update);
										angular.element(window).on('scroll.ngTutorial',update);
										
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