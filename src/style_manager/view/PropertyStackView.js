define(['backbone','./PropertyCompositeView', 'text!./../templates/propertyStack.html','./../model/Layers','./LayersView'],
	function (Backbone, PropertyCompositeView, propertyTemplate, Layers, LayersView) {
	/**
	 * @class PropertyStackView
	 * */
	return PropertyCompositeView.extend({

		template: _.template(propertyTemplate),

		initialize: function(o) {
			PropertyCompositeView.prototype.initialize.apply(this, arguments);
			this.model.set('stackIndex', null);
			this.className 	= this.pfx  + 'property '+ this.pfx +'stack';
			this.events['click #'+this.pfx+'add']	= 'addLayer';
			this.listenTo( this.model ,'change:stackIndex', this.indexChanged);
			this.listenTo( this.model ,'updateValue', this.valueUpdated);
			this.delegateEvents();
		},

		/**
		 * Fired when the target is updated.
		 * With detached mode the component will be always empty as its value
		 * so we gonna check all props and fine if there is some differences.
		 * */
		targetUpdated: function(){
			if(!this.model.get('detached'))
				PropertyCompositeView.prototype.targetUpdated.apply(this, arguments);
			else
				this.refreshLayers();
		},

		/**
		 * Returns the collection of layers
		 * @return {Collection}
		 */
		getLayers: function(){
			return this.model.get('layers');
		},

		/**
		 * Triggered when another layer has been selected.
		 * This allow to move all rendered properties to a new
		 * selected layer
		 * @param {Event}
		 *
		 * @return {Object}
		 * */
		indexChanged: function(e){
			var layer	= this.getLayers().at(this.model.get('stackIndex'));
			layer.set('props', this.$props);
			this.model.get('properties').each(function(prop){
				prop.trigger('targetUpdated');
			});
		},

		/**
		 * Get array of values from layers
		 * @return Array
		 * */
		getStackValues: function(){
			return this.getLayers().pluck('value');
		},

		/** @inheritDoc */
		getPropsConfig: function(opts){
			var that = this;
			var result = PropertyCompositeView.prototype.getPropsConfig.apply(this, arguments);

			result.onChange = function(el, view, opt){
				var model = view.model;
				var result = that.build();

				if(that.model.get('detached')){
					var propVal = '';
					var index = model.collection.indexOf(model);
					that.getLayers().each(function(layer){
						var vals = layer.get('value').split(' ');
						if(vals.length && vals[index])
							propVal += (propVal ? ',' : '') + vals[index];
					});
					view.updateTargetStyle(propVal, null, opt);
				}else
					that.model.set('value', result);
			};

			return result;
		},

		/**
		 * Extract string from composite value
		 * @param integer	Index
		 * @param View	propView Property view
		 * @return string
		 * */
		valueOnIndex: function(index, propView){
			var result 	= null;
			// If detached the value in this case is stacked, eg. substack-prop: 1px, 2px, 3px...
			if(this.model.get('detached')){
				var valist = propView.componentValue.split(',');
				result = valist[this.model.get('stackIndex')];
			}else{
				var aStack	= this.getStackValues();
				var strVar	= aStack[this.model.get('stackIndex')];
				if(!strVar)
					return;
				var a		= strVar.split(' ');
				if(a.length && a[index]){
					result = a[index];
				}
			}
			return result;
		},

		/** @inheritdoc */
		build: function(){
			var stackIndex = this.model.get('stackIndex');
			if(stackIndex === null)
				return;
			var result = PropertyCompositeView.prototype.build.apply(this, arguments);
			var model = this.getLayers().at(stackIndex);
			if(!model)
				return;
			model.set('value', result);
			return this.createValue();
		},

		/**
		 * Add layer
		 * @param Event
		 *
		 * @return Object
		 * */
		addLayer: function(e){
			if(this.getTarget()){
				var layers = this.getLayers();
				var layer	= layers.add({ name : 'test' });
				var index	= layers.indexOf(layer);
				layer.set('value', this.getDefaultValue());
				// In detached mode valueUpdated will add new 'layer value'
				// to all subprops
				this.valueUpdated();
				// This will set subprops with a new default values
				this.model.set('stackIndex', index);
				return layer;
			}
		},

		/**
		 * Fired when the input value is updated
		 */
		valueUpdated: function(){
			if(!this.model.get('detached'))
				this.model.set('value', this.createValue());
			else{
				this.model.get('properties').each(function(prop){
					prop.trigger('change:value');
				});
			}
		},

		/**
		 * Create value by layers
		 * @return string
		 * */
		createValue: function(){
			return this.getStackValues().join(', ');
		},

		/**
		 * Render layers
		 * @return self
		 * */
		renderLayers: function() {
			if(!this.$field)
				this.$field = this.$el.find('> .' + this.pfx + 'field');

			if(!this.$layers)
				this.$layers = new LayersView({
					collection: this.getLayers(),
					stackModel: this.model,
					preview: this.model.get('preview'),
					config: this.config
				});

			this.$field.append(this.$layers.render().el);
			this.$props.hide();
			return this;
		},

		/** @inheritdoc */
		renderInput: function() {
			PropertyCompositeView.prototype.renderInput.apply(this, arguments);
			this.refreshLayers();
		},

		/**
		 * Returns array suitale for layers from target style
		 * @return {Array<string>}
		 */
		getLayersFromTarget: function(){
			var arr = [];
			var target = this.getTarget();
			if(!target)
				return arr;
			var trgStyle = target.get('style');
			this.model.get('properties').each(function(prop){
				var style = trgStyle[prop.get('property')];
				if(style){
					var list =  style.split(',');
					for(var i = 0, len = list.length; i < len; i++){
						var val = list[i].trim();
						if(arr[i])
							arr[i] += ' ' + val;
						else
							arr[i] = val;
					}
				}
			});
			return arr;
		},

		/**
		 * Refresh layers
		 * */
		refreshLayers: function(){
			var n = [];
			var a = [];
			if(this.model.get('detached')){
				a = this.getLayersFromTarget();
			}else{
				var v	= this.getComponentValue();
				if(v)
					a = v.split(', ');
			}
			_.each(a,function(e){ n.push({ value: e});},this);
			this.$props.detach();
			var layers = this.getLayers();
			layers.reset();
			layers.add(n);
			if(!this.model.get('detached'))
				this.valueUpdated();
			this.model.set({stackIndex: null}, {silent: true});
		},

		render : function(){
			this.renderLabel();
			this.renderField();
			this.renderLayers();
			this.$el.attr('class', this.className);
			return this;
		},

	});
});
