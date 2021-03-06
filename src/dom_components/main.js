/**
 *
 * - [getWrapper](#getwrapper)
 * - [getComponents](#getcomponents)
 * - [addComponent](#addcomponent)
 * - [render](#render)
 *
 * With this module is possible to manage all the HTML structure inside the canvas
 * You can init the editor with initial components via configuration
 *
 * ```js
 * var editor = new GrapesJS({
 * 	...
 *  components: {...} // Check below for the possible properties
 * 	...
 * });
 * ```
 *
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var ComponentsService = editor.get('Components');
 * ```
 *
 * @module Components
 * @param {Object} config Configurations
 * @param {Array<Object>} [config.defaults=[]] Array of possible components
 * @example
 * ...
 * components: {
 *  	defaults: [
 *  		{
 *  			style: { background: 'red'}
 *  			components:[
 *  				{style: { background: 'blue'}},
 *  				{style: { background: 'green'}}
 *  			]
 *  		}
 *  	],
 * }
 * ...
 */
define(function(require) {

	var Components = function (config){

		var c = config || {},
			defaults = require('./config/config'),
			Component = require('./model/Component'),
			ComponentText = require('./model/ComponentText'),
			ComponentImage = require('./model/ComponentImage'),
			ComponentView = require('./view/ComponentView'),
			ComponentImageView = require('./view/ComponentImageView'),
			ComponentTextView	= require('./view/ComponentTextView');

	  // Set default options
		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}

		if(!c.wrapper.attributes)
			c.wrapper.attributes 	= {};
		c.wrapper.attributes.id		= 'wrapper';

		// If there is no components try to append defaults
		if(!c.wrapper.components.length && c.defaults.length){
			c.wrapper.components = c.defaults;
		}

		if(!c.wrapper.style)
			c.wrapper.style 		= {};

		c.wrapper.style.position	= 'relative';
		var component		= new Component(c.wrapper, { sm: c.em });

		var obj				= {
			model: component,
			config: c,
		};

		this.c = c;
	  var componentView 	= new ComponentView(obj);

	  return {

			/**
			 * Returns privately the main wrapper
			 * @return {Object}
			 * @private
			 */
			getComponent	: function(){
				return component;
			},

			/**
			 * Returns root component inside the canvas. Something like <body> inside HTML page
			 * The wrapper doesn't differ from the original Component Model
			 * @return {Component} Root Component
			 * @example
			 * // Change background of the wrapper and set some attribute
			 * var wrapper = ComponentsService.getWrapper();
			 * wrapper.set('style', {'background-color': 'red'});
			 * wrapper.set('attributes', {'title': 'Hello!'});
			 */
			getWrapper: function(){
				return this.getComponent();
			},

			/**
			 * Returns wrapper's children collection. Once you have the collection you can
			 * add other Components(Models) inside. Each component can have several nested
			 * components inside and you can nest them as more as you wish.
			 * @return {Components} Collection of components
			 * @example
			 * // Let's add some component
			 * var wrapperChildren = ComponentsService.getComponents();
			 * var comp1 = wrapperChildren.add({
			 * 	style: { 'background-color': 'red'}
			 * });
			 * var comp2 = wrapperChildren.add({
			 * 	tagName: 'span',
			 * 	attributes: { title: 'Hello!'}
			 * });
			 * // Now let's add an other one inside first component
			 * // First we have to get the collection inside. Each
			 * // component has 'components' property
			 * var comp1Children = comp1.get('components');
			 * // Procede as before. You could also add multiple objects
			 * comp1Children.add([
			 * 	{ style: { 'background-color': 'blue'}},
			 * 	{ style: { height: '100px', width: '100px'}}
			 * ]);
			 * // Remove comp2
			 * wrapperChildren.remove(comp2);
			 */
			getComponents: function(){
				return this.getWrapper().get('components');
			},

			/**
			 * Add new components to the wrapper's children. It's the same
			 * as 'ComponentsService.getComponents().add(...)'
			 * @param {Object|Component|Array<Object>} component Component/s to add
			 * @param {string} [component.tagName='div'] Tag name
			 * @param {string} [component.type=''] Type of the component. Available: ''(default), 'text', 'image'
			 * @param {boolean} [component.removable=true] If component is removable
			 * @param {boolean} [component.movable=true] If is possible to move the component around the structure
			 * @param {boolean} [component.droppable=true] If is possible to drop inside other components
			 * @param {boolean} [component.badgable=true] If the badge is visible when the component is selected
			 * @param {boolean} [component.stylable=true] If is possible to style component
			 * @param {boolean} [component.copyable=true] If is possible to copy&paste the component
			 * @param {string} [component.content=''] String inside component
			 * @param {Object} [component.style={}] Style object
			 * @param {Object} [component.attributes={}] Attribute object
			 * @return {Component|Array<Component>} Component/s added
			 * @example
			 * // Example of a new component with some extra property
			 * var comp1 = ComponentsService.addComponent({
			 * 	tagName: 'div',
			 * 	removable: true, // Can't remove it
			 * 	movable: true, // Can't move it
			 * 	copyable: true, // Disable copy/past
			 * 	content: 'Content text', // Text inside component
			 * 	style: { color: 'red'},
			 * 	attributes: { title: 'here' }
			 * });
			 */
			addComponent: function(component){
				return this.getComponents().add(component);
			},

			/**
			 * Render and returns wrapper element with all components inside.
			 * Once the wrapper is rendered, and it's what happens when you init the editor,
			 * the all new components will be added automatically and property changes are all
			 * updated immediately
			 * @return {HTMLElement}
			 */
			render		: function(){
				return componentView.render().el;
			},
		};
	};

	return Components;
});