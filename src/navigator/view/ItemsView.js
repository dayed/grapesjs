define(['backbone','./ItemView'],
	function (Backbone, ItemView) {
	/**
	 * @class ItemsView
	 * */
	return Backbone.View.extend({

		initialize: function(o) {
			this.opt 			= o;
			this.config		= o.config;
			this.preview	= o.preview;
			this.sorter		= o.sorter || {};
			this.pfx			= o.config.stylePrefix;
			this.parent		= o.parent;
			this.listenTo( this.collection, 'add', this.addTo );
			this.listenTo( this.collection, 'reset', this.render );
			this.className 	= this.pfx + 'items';

			if(!this.parent)
				this.className	+= ' ' + this.pfx + this.config.containerId;
		},

		/**
		 * Add to collection
		 * @param Object Model
		 *
		 * @return Object
		 * */
		addTo: function(model){
			var i	= this.collection.indexOf(model);
			this.addToCollection(model, null, i);
		},

		/**
		 * Add new object to collection
		 * @param	Object	Model
		 * @param	Object 	Fragment collection
		 * @param	integer	Index of append
		 *
		 * @return Object Object created
		 * */
		addToCollection: function(model, fragmentEl, index){
			var fragment	= fragmentEl || null;
			var viewObject	= ItemView;

			var view 		= new viewObject({
				model 	: model,
				config	: this.config,
				sorter	: this.sorter,
			});
			var rendered	= view.render().el;

			if(fragment){
				fragment.appendChild(rendered);
			}else{
				if(typeof index != 'undefined'){
					var method	= 'before';
					// If the added model is the last of collection
					// need to change the logic of append
					if(this.$el.children().length == index){
						index--;
						method	= 'after';
					}
					// In case the added is new in the collection index will be -1
					if(index < 0){
						this.$el.append(rendered);
					}else
						this.$el.children().eq(index)[method](rendered);
				}else
					this.$el.append(rendered);
			}

			return rendered;
		},

		render: function() {
			var fragment = document.createDocumentFragment();
			this.$el.empty();

			this.collection.each(function(model){
				this.addToCollection(model, fragment);
			},this);

			this.$el.append(fragment);
			this.$el.attr('class', _.result(this, 'className'));
			return this;
		}
	});
});
