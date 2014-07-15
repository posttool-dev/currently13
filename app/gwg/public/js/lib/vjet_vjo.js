// @Package com.ebay.vjo
/**
* VJET VJO Bootstrap JST API must be updated in following files
*       com.ebay.vjo.VjBootstrapAPI.jsspec
*       com.ebay.vjo.VjBootstrapDef.java
* in order for VJET IDE to use new API otherwise API is hidden from tool.
*/
// Utility API provided by vjo

(function (enableModuleMgmt) {
//	var VERSION = 1.5,_bOldSupport = typeof (vjo)=="object";
//	if(_bOldSupport && vjo._v == VERSION){ //if this vjo version already exists, exit
//		return;
//	}
//		
//	var vjo = {}; //create a local vjo object
//	
//	// ensure latest vjo version is on global scope
//	var win = (typeof window != 'undefined') ? window : this, wv = win.vjo;
//	if (!wv || !wv._v || wv._v < VERSION) {
//		win.vjo = vjo;		// Question: is this the only place that vjo gets exported?
//	}
	
	var _vjetName = 'VJET';
	var _vjetVer = 1.5;
	
/**
 * Perform required VJET initialization.
 * 
 */
function init(vjo, global) {
	
	var _typeMap = {}; //map that holds registered types, where the key is the type name
	var _global = global; //reference to the window object, or scoped 'this'
	var _clzCache = [];
	var _enableLazyInit = true;
	/**
	 *	VJO api's and properties
	 */
	_extend (vjo, {
		//version
		_v : _vjetVer,
		_hiddenTypes : {}, //hide types (such as ftype) from global name space
		/**
		 * loader which can optionally be set, to dynamically load new types.
		 * usage would be, vjo.loader.load('type.name').
		 */
		loader : {
			async : true,
			load:function(clazz){
				//implement
				//console.log("vjo.loader.load",clazz);
			} 
		},
		
		/**
		 * answers the question is given object of type array
		 */
		isArray : function (obj) {
			if (!obj) return false;
			return (obj.constructor == Array || (typeof obj == 'object' && obj.join && obj.splice));
		},
		/**
		 * Returns vjo type of given class name. If the type has not been loaded
		 * try to load it, using vjo.loader
		 */
		getType : function(clz,doNotLoad) {
			if (!clz) return;
			clz = _getTypeName(clz);//remove generic symbols such as "<E>"

			//We should handle case such as "a.b.c.X$Y" also
			var dollar = clz.lastIndexOf('$') + 1, dot = clz.lastIndexOf('.') + 1,
			   idx = dollar || dot , cn = idx ? clz.substring(idx) : clz,
			   clz = dollar ? (clz.substring(0, dollar - 1) + '.' + cn) : clz,
			   obj = _typeMap[clz];

			if (!doNotLoad && !obj) {
				obj = vjo.loader.load(clz);
				if (obj){
					return obj;
				}
				obj = _typeMap[clz];
			}
			
			if (obj) {
				return obj.pkg[cn];
			}
			return;
		},
		
		/**
		 * mixin utility. takes an mtype, and a target. will throw an error if the mtype
		 * has static properties.
		 * Ex:
		 *		var obj = new my.package.Type();
		 *		vjo.mixin('my.package.MType', obj);
		 *		obj.doMixinMeth();
		 */
		mixin : function (mtype,target) {
			var mxn = this.getType(mtype);
			if (mxn) {
				if (mxn.vj$ && mxn.vj$._vjType === 'mtype') {
					if (mxn._props) {
						throw 'cannot mixin static props to an instance';
					}
					_extend(target,mxn._protos);
				}
			}
		},
		/**
		 * utility that creates a function reference to the method, given a ctx.
		 * openctx is a boolean, if true, it means that someone using call(...)
		 * or apply(...) who provided an alternative context to execute the
		 * function would get used otherwise if openctx was false, you can
		 * think of this functions context as being "sealed" ie not changeable
		 * in a call(...) or apply(...) usage case.  Regardless of being sealed
		 * passing a hitched function to bind will do the binding no matter what.
		 */
		hitch: function (ctx, fn, openctx) {
//				hitch: function (fn, ctx, openctx) { 
			if (!_isFn(fn)) { // swap
				var temp = fn ; 
				fn = ctx ;
				ctx = temp ;
		    }
			return function () {
				return fn.apply((openctx&&this!=window)?this:ctx,arguments);
			}
		},

		/**
		 * utility that creates a function closure to combine a method and a given set of arguments.
		 */
		curry : function (fn) {
			var slice = Array.prototype.slice;
			//all arguments after "fn"" will be pre appended to
			//the actual function call argument list
			var args = slice.call(arguments,1); //create real array
			return function () {
				return fn.apply(this, args.concat(slice.apply(arguments)));
			};
		},
		/*
		First 2 arguments are the same processing as that of hitch which is 
		basically to set the context for the functions execution.  The remaining
		arguments (if any) are used in the curry(...)'ing of the args.  We only
		need a single closure to achive the bind/curry operations.
		*/
		bind: function(ctx, fn) {
			if (typeof fn == 'string') {
				fn = ctx[fn];
			}
			var slice = Array.prototype.slice;
			//all arguments after "ctx" and "fn" will be pre appended to
			//the actual function call argument list
			var args = slice.call(arguments,2); // create real array
			return function () {
				return fn.apply(ctx, args.concat(slice.apply(arguments)));
			};
		},
		/**
		 * utility to create a dom element given a tagname, and it's innerHTML
		 */
		create: function(elementName, value) {
			var elem = document.createElement(elementName) ;
			elem.tagName == 'TEXTAREA' ? elem.value = value : elem.innerHTML = value;
			return elem ;
		},
		/**
		 * utility to create an anonymous class. 'context' to be passed, is the scope of the anonymous class. within
		 * the anonymous class, you can reference the containing scope using "this.vj$.parent". the "clz" is the type
		 * to be implemented.
		 * Example:
		 *			var myType = vjo.make(this,'my.package.Type')
		 *			.protos({
		 *				foo:function(){//override
		 *					//do something;
		 *				}
		 *			})
		 *			.endType();
		 */
		make : function (context,clz) {//used to create an anonymous class
			var a = arguments, len = a.length, tp = (_isFn(clz) && clz.vj$) ? clz : this.getType(clz), _vjo = {};
			if (len<2 || !tp) throw "context and valid type are required";
			
			//copy all types from the current vj$ context
			//later we'll use to copy to the instance's vj$.
			_forEach(context.vj$,function(val,key){
				if (_isFn(val) && val.vj$ && val.vj$._vjType) {
					this[key] = val;
				}
			},_vjo);
			
			var _protos;
			var args = Array.prototype.slice.call(a,2,len);
			return {
				protos : function (obj) {
					_protos = obj;
					return this;
				}, 
				endType : function () {
					var t = vjo.ctype(), clztype = tp.vj$._vjType, rv;
					if (clztype==='itype') t.satisfies(tp);
					else if (clztype==='ctype') {
						var typeMeta = _TypeMeta.get(tp);
						if (typeMeta && !typeMeta._completed) {//make sure type is complete
							typeMeta.complete();
						}
						t.inherits(vjo.getType(tp.vj$._class));
					}
					else throw 'incompatible anonomyous type';
					t.protos(_protos);
					t.complete();
					t = t.endType();
					rv = _Type.createNoConstruct(t); //create a type without constructing it
					rv.vj$ = t.vj$;
					_extend(rv.vj$,_vjo); //let's copy namespace from the base type or interface
					(function () {//call super constructor no matter what;
						if (this.base) this.base.apply(this,arguments);
					}).apply(rv,args);
					if (rv.base && rv._getBase) {//update base, so we're not pointing at shared prototype base
						var fn = _Type.tmpFunc;
						fn.prototype = rv._getBase();
						rv.base = new fn; 
						rv.base._parent = rv;
					}
					rv.vj$.parent = tp._outer || context; //parent points to the enclosing context
					rv.vj$.outer = tp._outer;
					if (_protos && _protos.constructs) {
						_protos.constructs.apply(rv);
					}
					return rv;
				}
			};
		},
		/**
		 * 
		 */
		needs : function (clz,alias) {
		    if (!clz) return;
		    if (!_typeMap[clz]) {
		    	_createPkg(clz);		
		    	vjo.loader.load(clz);
		    }
		},
		/* currently, not being used. this was to enable portal versioning.
		getVersion : function() {
			return _global._scope_name || "";
		},
		versionJsText : function(txt) {
			var scp = this.getVersion();
			if (scp) {
				var str = '(function(vjo){' + txt;
				str += '}).apply(' + scp + ',[' + scp + '.vjo]);';
				return str;
			}
			return txt;
		},
		*/
		/**
		 * Returns an array object with values filled in based on dimentions.
		 *
		 * @version		initial
		 *
		 * @param		val - Default value that needs to be used for initializing(0, false, or null)
		 * @param		size - Dimention, you can also pass multi-dimentions.
		 * @return		Array
		 * 
		 * All the params are optional. Not passing any info or only passing 'val' would return emty array with no elements
		 * Example:		var arr3 = vjo.createArray(null, 3, 2, 3);
		 *
		 */
		createArray : function(val, size){
		        var arr = [];
		        if (arguments.length > 1) {
		    		for (var ii=0; ii<size; ii++) {
		    			if (arguments.length > 2) {
		    				var tmp = [val];
		    				for (var k=2;k<arguments.length;k++) {
		    					tmp[tmp.length] = arguments[k];
		    				}
		    				arr[ii] = vjo.createArray.apply(this, tmp);
		    			} else {
		    				arr[ii] = val;
		    			}
		    		}
		        }
		        return arr;
		},
		/**
		 * This is utility method to test instanceof
		 */
		isInstanceOf : function(poObject, poType){
			//if poType is not vjo interface, use instanceof
			if(poObject === null) return false;	
			var isVjo = _isVjoType(poType);
			if(!isVjo || (isVjo && poType.vj$._vjType!="itype")){
				return poObject instanceof poType;
			}
			if(!poObject.vj$) return false;
			var clz = poObject.getClass();
		    if (_isInstanceForInterface(clz,poType)) return true;
		    var id = clz.getName(), meta, tp;
		    for (;;) {
		        meta = _TypeMeta.getById(id);
		        if (meta) {
		            var ihs = meta._inherits;
		            if (ihs.length==1) {
		                id = ihs[0];
		                tp=vjo.getType(id);
		                if (!tp) break;
		                if (_isInstanceForInterface(tp.clazz,poType)) return true;
		            } else break;
		        } else break;
		    }
		    return false;
		},
		
		/**
		 * Stores all the meta data handlers
		 */
		meta : {
			_list : {},
			load : function (pName, pFunc) {
				//Use suffix just to make sure we don't step on original type
				this._list[pName + '__rtti'] = pFunc;
			},
			get : function (pName) {
				return this._list[pName + '__rtti'];
			},
			has : function (pName) {
				return (this._list[pName + '__rtti'] ? true : false);
			}
		}
	});

	//CONSTANTS

	vjo.NEEDS_IMPL = function() {
		throw "needs implementation";
	};

	//===========
	// OBJECT
	//===========
	vjo.Object = function () {	
		this.vj$ = {_class:'vjo.Object',_vjType:'ctype',Object:vjo.Object, _meta : {}};
	};
	vjo.Object.prototype = {
		_hashCode : -1,
		getClass : _getClazz,
		/**
		 * Answers an integer hash code for the receiver. Any two
		 * objects which answer <code>true</code> when passed to
		 * <code>.equals</code> must answer the same value for this
		 * method.
		 */
		hashCode : function () {
			if (this._hashCode == -1) {
				this._hashCode = ++vjo.Object._hashCounter;
			} 
			return this._hashCode;
		},
			
		/**
		 * Compares the argument to the receiver, and answers true
		 * if they represent the <em>same</em> object using a class
		 * specific comparison. The implementation in Object answers
		 * true only if the argument is the exact same object as the
		 * receiver (===).
		 */
		equals : function (o) {
			return (this === o);
		},
		
		/**
		 * Answers a string containing a concise, human-readable
		 * description of the receiver.
		 *
		 * @return		String
		 *					a printable representation for the receiver.
		 */
		toString : function () {
			return this.getClass().getName() + "@" + this.hashCode().toString(16);
		}
	};
	_extend(vjo.Object,{
		vj$ : {_class:'vjo.Object',_vjType:'ctype',Object:vjo.Object,_meta:{}},

		_hashCounter : 0
		,
		isInstance : function (o) {
			return vjo.isInstanceOf(o,this);
		}
	});


	//===========
	// CLASS
	//===========
	/**
	* Represents a Class object definition
	*/
	vjo.Class = function (clz, typ){
		this._name = clz,
		this._type = typ || "ctype",
		this._satisfied = [];
		this.vj$ = {_class:'vjo.Class',_vjType:'ctype',Class:vjo.Class,_meta:{}};
	};	
	vjo.Class.prototype = new vjo.Object();
	_extend(vjo.Class.prototype, {
		/**
		 * Answers the name of the class which the receiver represents.
		 *
		 * @return		the receiver's full name including the package path.
		 *
		 */
		getName : function () {
			var n = this._name;
			return (n?n:null);
		},
		
		/**
		 * Return the simple name of this Class. The simple name does not include
		 * the package or the name of the enclosing class. The simple name of an
		 * anonymous class is "".
		 *
		 * @return the simple name
		 *
		 */
		getSimpleName : function () {
			// either a base class, or anonymous class
			// remove the package name
			var n = this.getName();
			var idx = n.lastIndexOf('.');
			if (idx != -1) {
				n = n.substring(idx+1);
				if (n) {
					idx = n.lastIndexOf("$");
					if (idx > 0) {
						n = n.substring(idx+1);
					}
				}
			}
			return n;
		},
	
		/**
		 * Answers the name of the package to which the receiver belongs.
		 * For example, Object.class.getPackageName() returns "vjo.dsf".
		 *
		 * @return		the receiver's package name.
		 *
		 */
		getPackageName : function () {
			var n = this.getName();
			if (n != null) {
				var i = n.lastIndexOf('.');
				if (i >= 0) {
					return n.substring(0, i);
				}
			}
			return "";
		},
		
		/**
		 * Answers true if the receiver represents an itype.
		 *
		 * @return		<code>true</code>
		 *					if the receiver represents an interface
		 *              <code>false</code>
		 *                  if it does not represent an interface
		 */
		isInterface : function () {
			return (this._type === "itype");
		},
		
		/**
		 * Returns true if the obj is an instance of this class.
		 */
		isInstance : function (obj) {
			var tp = vjo.getType(this.getName());
			if (tp) {
				return vjo.isInstanceOf(obj,tp); //rbhogi
			}
			return false;
		},
		
		/**
		 * Answers a string containing a concise, human-readable
		 * description of the receiver.
		 *
		 * @return		a printable representation for the receiver.
		 */
		toString : function () {
			return (this.isInterface() ? "interface " : "class ") + this.getName();
		},
		getClass : _getClazz,
		
		//Reflection related APIs
		_rtti : null,
		_metaloaded : false,
		
		getMeta : function () {
			if (this._rtti == null) {
				var err = "Metadata Not Available Exception";
				if (this._metaloaded) {
					throw err;
				} else {
					//load meta here
					var dataHdl = vjo.meta.get(this._name);
					if (dataHdl) {
						this._rtti = new vjo.TypeMetadata(dataHdl());
						this._metaloaded = true;
					} else {
						throw err;
					}
				}
			} 
			return this._rtti;
		},
		
		getConstructors : function () {
			return this.getMeta().getConstructors();
		},
		getFields : function () {
			return this.getMeta().getFields();
		},
		getDeclaredFields : function () {
			return this.getMeta().getDeclaredFields();
		},
		getMethods : function () {
			return this.getMeta().getMethods();
		},
		getDeclaredMethods : function () {
			return this.getMeta().getDeclaredMethods();
		},
		getModifiers : function () {
			return this.getMeta().getModifiers();
		},
		getAnnotations : function () {
			return this.getMeta().getAnnotations();
		},
		getInterfaces : function () {
			return this.getMeta().getInterfaces();
		},
        getVjoType : function () {
    		return vjo.getType(this.getName());
        }
	});
	
	_extend(vjo.Class,{
		/**
		 * Returns vjo.Class object of given class name. 
		 * It looks up in cache and returns, if found
		 * creates and and returns, if not found
		 */
		create : function (nm,typ) {
			if (!nm) {
				//Do not add clazz to cache if the key(class name) is undefined 
				return new vjo.Class(nm, typ?typ:'ctype');
			}
			var clz = _clzCache[nm];
			if (!clz) {
				_clzCache[nm] = clz = new vjo.Class(nm, typ?typ:'ctype');
			}
			return clz;
		}
	});

	_extend(vjo.Class,{
		/**
		 * Answers a Class object which represents the type
		 * named by the argument. The name should be the name
		 * of a type as described in the type definition.
		 *
		 * @param		clz	The name of the non-base type class to find
		 * @return		the named Class
		 * @throws		Error if a class is not found with the passed name
		 *
		 */
		forName : function (clz) {
			try {
				var o = eval(clz);
				if (o && o.clazz) {
					return o.clazz;
				}
			} catch (e) {
			}
			throw "Type not found for '" + clz + "'";
		},
		
		isInstance : function (o) {
			return vjo.isInstanceOf(o,vjo.Class); //rbhogi
		},

		clazz : vjo.Class.create("vjo.Class")
	});
	
	vjo.Object.clazz = vjo.Class.create("vjo.Object");
	
	vjo.obj = function (type, json) {
		if (!type) {
			throw "Invalid type name";
		}
		if (!json) return null;
		
		var TypeObj, err = "Invalid type '" + type + "'.";
		try {
			TypeObj = eval(type);
		} catch (e) {
			throw err;
		}
		if (!TypeObj) return err;
		
		var o = new TypeObj();
		for (var i in json) {
			o[i] = json[i];
		}
		
		return o;
	};
	
	vjo.findType = function(objType, field)  {
		var iterObj = objType;
		for (;;) {
			if (iterObj.clazz.meta!= null && iterObj.clazz.meta[field] != null)
				return iterObj.clazz.meta[field];
			// iterate to the objType parent
			if (iterObj == objType.prototype.constructor)
				return;
			else
				iterObj = objType.prototype.constructor;
		}
	};

	/**
	 * _TypeInitMgr manages type dependencies, and initializes types
	 * once all its dependencies are loaded.
	 */
	var _TypeInitMgr = (function(){
		var m_map = {}; //map of dependencies "typename" => ["depname"]
		var m_metas = {}; //map of types "typename" => typeMeta
		var m_needs = {}; //map of deferred needs "typename" => fn
		var m_stack = []; //current stack of synchronously loaded types
		var m_inners = {}; //map of inner types "typename" => [innerMeta]
		var m_loaded = {}; // map of loaded types "typename" => boolean
		var m_incomplate = []; // list of incomplete Types
		/**
		 * private methods
		 */
		function _addType(clz) {
			var depList = m_map[clz];
			if (!depList) {
				depList = [];
				m_map[clz] = depList;
			}
			return depList;
		}
		
		function _execInners(clz) {
			var ins = m_inners[clz];
			if (ins) {
				var len = ins.length;
				for (var i=0; i<len; i++) {
					var init = ins[i];
					if (init) init.complete();
				}
			}
			m_inners[clz] = null;
		}
		
		function _processNeeds(clz) {
			var n = m_needs[clz];
			if (n) {
				while (n.length>0) {
					n.pop()();
				}
				m_needs[clz] = null;
			}
		}
		
		function _pushDep(clz,stack,visited) {
			var arr = m_map[clz];
			stack.push(clz);
			visited[clz] = true;
			if (!arr || arr.length===0) return;
			var len = arr.length, i=0;
			for (; i<len; i++) {
				var key = arr[i];
				if (!visited[key]) {
					_pushDep(key,stack,visited);
				}
			}
			return;
		}
	
		function _isCompleted(clz) {
			return _TypeMeta._completed[clz];
		}

		function _canCompleteInternal(clz,start,visited) {
			if(_isCompleted(start)) return true;
			var arr = m_map[start];
			if (!arr || arr.length===0) return true;
			var len = arr.length, i=0;
			for (; i<len; i++) {
				var key = arr[i];
				if (!vjo.loader.async){
					//for synchronous loading, let's exit we find a circular dep
					if (key === clz) {
						return false;
					}
				} else if (!vjo.getType(key)) { //for async loading, let's exit we find an undefined type
				    _addIncomplete(clz, key);
				    return false;
				}
				if (!visited[key]) { //make sure we don't revisit types
					visited[key] = true;
					if (!_canCompleteInternal(clz,key,visited)){ //recursive
						return false;
					}
				}
			}
			return true;
		}
		
		/**
		    clz : Incomplete type
		    dep : Due to this type
		*/
		function _addIncomplete(clz, dep) {
		    if (!m_incomplate[dep]) {
		        m_incomplate[dep] = [];
		    }
		    m_incomplate[dep][m_incomplate[dep].length] = clz;
		}
		
		function _canComplete(clz) {
			var aD = m_map[clz];
			if (aD) {
				var len = aD.length;
				if (vjo.loader.async) {
					return _canCompleteInternal(clz,clz,{});
				} else {
					//in the synchronous case, check the stack first
					//for any circular dependencies
					var stk = m_stack, len2 = stk.length
					for (var i=0; i< len; i++) {
						var dep = aD[i];
						for (var j=0; j<len2; j++) {
							if (stk[j] === dep) return false;
						}
					}
					if (len2>0) {
						return _canCompleteInternal(clz,clz,{});
					}
				}
			} 
			return true;
		}
		
		function _complete(type) {
			_processNeeds(type);
			if (m_metas[type]) {
				m_metas[type].complete();
				m_metas[type] = null;
			}
			_execInners(type);
			m_loaded[type] = true;
		}
		
		/**
		 * public methods
		 */
		return {
			/**
			 * takes in a class, and a dependency. currently any .need on a type
			 * will add the dependency.
			 */
			addDep : function (clz,dep) {
				if (!clz) return;
				if (!_TypeMeta._completed[dep]) {
					var aD = _addType(clz);
					aD[aD.length] = dep;
				}
				if (!vjo.loader.async) { //synchronous loading to be added to stack
					var stk = m_stack;
					if (stk.length==0) stk.push(clz);
					if (stk[stk.length-1]===clz) stk.push(dep);
				}
			},
			/**
			 * takes in a class, and and removes the given dependency from the stack
			 * the stack is used for synchronous loading, so we can identify circular
			 * dependencies.
			 */
			popDep : function (clz,dep) {
				if (vjo.loader.async) return;
				var stk = m_stack;
				if (stk[stk.length-1]===dep) stk.pop();
			},
			/**
			 * associate an inner type, with a container type. Once the container type
			 * is completed, the _TypeInitMgr will complete the definition of all inner
			 * types.
			 */
			addInner : function (clz,fn) {
				if (!m_inners[clz]) m_inners[clz] = [];
				var ins = m_inners[clz];
				ins.push(fn);
			},
			/**
			 * callbacks are registered to a type so that needs can be added to the
			 * type's namespace, once it's safe to initialize.
			 */
			deferNeed : function (clz,fn) {
				var n = m_needs;
				if (!n[clz]) {
					n[clz] = [];
				}
				n[clz].push(fn);
			},

			processNeeds : function(clz){
				_processNeeds(clz);
			},
						
			/**
			 * register a type to the _TypeInitMgr
			 */
			register : function (clz,fn) {
				m_metas[clz] = fn;
			},
			/**
			 * type has completed its definition, check for any circular dependecies
			 * before initializing the type. otherwise wait notification that all 
			 * dependencies are loaded before initializing the type.
			 */
			load : function(clz) {
				if (!clz || m_loaded[clz]) return false;
				var deps = m_map[clz];
				if (!vjo.loader.async) {
					var stk = m_stack, len = stk.length;
					if (len > 0 && stk[len-1]===clz) stk.pop();
				}
				var isC = false;
				if (deps && _canComplete(clz)) {
					var stk = [];
					_pushDep(clz,stk,{});
					while(stk.length>0) {
						var type = stk.pop();
						if(_isCompleted(type)) continue;
						_complete(type);
					}
					isC = true;
				}
				if (!deps || deps.length==0) {//no dependencies
					_complete(clz)
				}

				//See if there are any types waiting for this type to complete
				//If so, trigger type complete chain.
				var list = m_incomplate[clz];
				if (!isC && list) {
				    for (var i=0,len=list.length; i<len; i++) {
				        var itm = list[i];
				        if (itm == null) continue;
				        if (_canComplete(itm)) {
				            _complete(itm);
				            list[i] = null;
				        }
				    }
				}
								
				return true;
			}
		};
	})();

		
	/**
	 * _Type holds utility methods to create type. These methods should be called in
	 * the context of the type.
	 */
	var _Type = {
		/**
		 * create a type, given a name, and if it's an interface or not.
		 */
		create : function(clz, isI) {
			isI = isI || false;
			if (!_isValidClz(clz)) {
				throw "Invalid type name '" + clz + "'";
			}
			
			var base = function() {
				var typeMeta = _TypeMeta.getById(base.vj$._meta._metaId), bConstruct = !base.__donotconstruct;
				if (_enableLazyInit && typeMeta._canDelayInit) {
					typeMeta._canDelayInit = false;
					typeMeta.endType();
				}
				if (_Type.shouldAutoConstruct(this,base,typeMeta)) {
					var b = _Type.createNoConstruct(base), rv = _Type.construct(b,arguments);
					return rv || b;
				}
				this.constructor = base;
				//last check to ensure type is completed, before we instantiate object
				if (typeMeta && !typeMeta._completed) {
					typeMeta.complete();
					//new instance creation didn't pick up update prototype, so let's
					//copy it to this instance. this will only affect the first instance
					//of this type
					_forEach(base.prototype,function(val,key,object){
							this[key] = val;
					},this);
				}
				//assign needed types from class
				this.vj$ = base.vj$;
				var t = this.vj$._vjType;
				if (bConstruct && (t == 'itype' || t == 'mtype')) {
				    throw t + " " + this.vj$._class + " cannot be instantiated";
				}
				//update inner instance types, on this instance
				_Type.processInners(this,base.vj$,base.clazz);
				if (bConstruct) {	
					var val = _Type.construct(this,arguments);
					if (val) return val;
				}
				// jce: placeholder to fix lint error
				return null;
			};
			base._name="base";
			base.vj$ = {_class:clz, _meta : {}};
			base.isInstance = this.isInstanceFunc;
			return base;
		},
		isInstanceFunc : function (o) {
			return vjo.isInstanceOf(o,this);
		},
		shouldAutoConstruct : function(ctx,type,meta) {
			return (!(ctx instanceof type) && !type.__donotconstruct && meta && meta._options.autoConstruct);
		},
		/**
		 * create an instance of a type without calling the real constructor
		 */
		createNoConstruct : function (type){
			type.__donotconstruct=true;
			var rv = new type();
			delete type.__donotconstruct;
			return rv;
		},
		/**
		 * add dependencies to a type (like a java import). currently this method
		 * should be called in the context of a type.
		 * i.e. _Type.needs.call(realType, dependencyName, alias);
		 */
		//> public final T needs(String clzName)
	    //> public final T needs(String clzName, String alias)
	    //> public final T needs(Array clzNameArray)
		needs : function (clz,alias) {
			if (!clz || this.vj$._meta._isInner) 
				return this;
			var clzs = null, useAlias = false;
			var len = 1;
			if (typeof clz == 'string') {
				clzs = [clz];
				useAlias = (alias) ? true : false;
			} else if (clz instanceof Array){
				clzs = clz;
				len = clzs.length;
			} else {
				return this;
			}
			for (var i=0; i<len; i++) {
				var cl = clzs[i];
				var pObj = _typeMap[cl], idx = cl.lastIndexOf("."), 
				cn = (idx>-1) ? cl.substring(idx+1) : cl, tp = (pObj) ? pObj.pkg[cn] : null;
				_TypeInitMgr.addDep(this.vj$._class,cl);
				if (!tp) {
					tp = vjo.getType(cl);
				}	
				_TypeInitMgr.popDep(this.vj$._class,cl);
				_Type.addToNameSpace(this,tp,cl,cn,alias,useAlias);
			}
			return this;
		},
		
		//> public final T needslib(String type)
	    //> public final T needslib(Array ary)
		needslib : function(){},
		
		addToNameSpace : function(ctx,type,name,shortname,alias,useAlias) {
			//update vj$ namespace with dependencies in the needs	
			if (alias==="") return;
			if (type) {//TODO: check for duplicates? //rbhogi
				if (this._vjType == 'mtype') return;
				if (type.vj$ && type.vj$._vjType == 'mtype') return;
				var nm = (useAlias)?alias:shortname, err = false;
				if (ctx.vj$[nm] && ctx.vj$[nm]!==type) {
					if (_bOldSupport) err = true;
					else throw "Name collision with type '" + nm + "' in need list.";
				}
				if (!err) ctx.vj$[nm] = type;
			} else {
				_TypeInitMgr.deferNeed(ctx.vj$._class,
					vjo.curry(function(shortname,fullname,ctx){
						var tp = vjo.getType(fullname);
						if (!tp || tp.vj$._vjType == 'mtype') return;
						if (ctx.vj$[shortname] && ctx.vj$[shortname]!==tp) {
							throw "Name collision with " + nm + "in need list.";
						}		
						ctx.vj$[shortname] = tp;
						
				},(useAlias)?alias:shortname,name,ctx));
			}
		},
		/**
		 * add static properties/methods to type. this method should be called in the 
		 * context of a type. i.e. _Type.props.call(realType, properties);
		 */
	
		props : function (obj,fromMixin) {
			for (var key in obj) {
				if (!_isValidProp(key)) {
					continue;
				}
				var o = obj[key];
				this[key] = o;
				if (!o) {
					continue;
				}
				if (o.vj$) {
					if (o.vj$._meta._isInner && _Type.addInner(this,o,'s_inners',key)) {//debugger;
						if (this.vj$[key]) throw "'" + key + "' in type '" + this.vj$._class + "' conflicts with needed type name";
					    var _v = _createVjNS(this.vj$,key,o);
					    o.vj$ = _v;
					    if (!this.vj$._meta._isInner) {//debugger;
					    	var metaObj = _TypeMeta.get(o);
					    	if (metaObj && !metaObj._name) {
						    	_TypeInitMgr.addInner(this.vj$._class, metaObj);
						    	var rt = this.vj$._class;
						    	//all 2nd level inner types don't have a name. since we're at the
						    	//container type, we can now update the names of all nested inner
						    	//types
								_Type.updateInners(rt,rt+"."+key,o,true)
					    	}
					    }
					}
				}
				else if (_isFn(o) && !o._name) {
				    o._name = key;
				}
			}
			if (obj.toString != Object.prototype.toString) {
				//It has custom toString method!
				this.toString = obj.toString;
			}
			
			return this;
		},
		protosHandler : function (fn,type) {
			//if a base class calls a overridden method from the
			//derived class, we must update the vjo namespace
			return function(){
				var cbase = this.base, error = false, rv, 
				out = this.vj$.outer; //keep base instance
				_Type.setBase(this,type);
//TODO stop catching my errors!
				
//				try {
					rv = _Type.execRealFn(fn,arguments,this,type,out);
//				} catch (e) {
//					error = e;
//				}
				this.base = cbase;
				
//				if (error) {
//					throw error;
//				}
				return rv;
			};
		},
		
		/**
		 * add instance properties/methods to type. this method should be called in the 
		 * context of a type. i.e. _Type.protos.call(realType, properties);
		 */
		protos : function (obj,fromMixin) {
			if (!obj) return;
			
			for (var key in obj) {
				if (key==='base') {
					continue;
				}
				var val = obj[key];
				if (!val) {
					this.prototype[key] = val;
					continue;
				}
				var prev = this.prototype[key], isType = _isVjoType(val);
				if (prev && _Type.isValidProto(key,val,prev) && !isType) {
					this.prototype[key] = _Type.protosHandler(val, this);
				} else {
					if (isType && val.vj$._meta._isInner
						&& !this.vj$._meta._isInner) {//debugger;						
						var metaObj = _TypeMeta.getById(val.vj$._meta._metaId);
						if (metaObj && !metaObj._name) {
				    		_TypeInitMgr.addInner(this.vj$._class, metaObj);
				    		var rt = this.vj$._class;
				    		//all 2nd level inner types don't have a name. since we're at the
					    	//container type, we can now update the names of all nested inner
					    	//types
							_Type.updateInners(rt,rt+"."+key,val,false);
						}
					}
					this.prototype[key] = val;
				}
				if (isType) {
					if (val.vj$._meta._isInner && _Type.addInner(this,val,'_inners',key)) {
						if (this.vj$[key]) {
							throw "'" + key + "' in type '" + this.vj$._class + "' conflicts with needed type name";
						}
					}
				}
				else if (_isFn(val) && !val._name) {
					//debugger will not have name of method in call stack
					//.name is also readonly. we set _name, which we've updated
					//rhino to understand, and will reflect correctly in VJET
		    		val._name = key;
				}				
			}
			//For IE
			if (obj.toString != Object.prototype.toString) {
				//It has custom toString method!
				this.prototype.toString = obj.toString;
			}
			return this;
		},
		isValidProto : function(key,val,prev) {
			//_ovld is a keyword produced by java2js
			return (_isFn(prev) && key.indexOf("constructs")!=0 
		    && (key.indexOf("_ovld")===-1||key.indexOf("_ovld")!=(key.length-5)) 
	        && !_isVjoType(prev) && _isFn(val));
		},
		/**
		 * add interface to type (same as 'implements' in java). this method should be  
		 * called in the context of a type. i.e. _Type.satisfies.call(realType, interfaceName);
		 */
		satisfies : function (type,doNotAddMeta) {
			var clzs = [];
			if (type instanceof Array){
				clzs = type;
			} else {
				clzs = [type];
			}
			
			_forEach(clzs,function(val,key,obj){
				var cl = _getTypeName(val), type;
				if (_isVjoType(cl)) {
					type = cl;
					var clz = type.vj$._class || "", idx = clz.lastIndexOf("."), 
					cn = (idx>-1) ? clz.substring(idx+1) : clz;
					if (cn) this.vj$[cn] = type;
				} 
				
				var iface = (type) ? type : vjo.getType(cl);
				if (iface) {
				    //add interface meta
				    if (!doNotAddMeta) this.clazz._satisfied.push(iface);
					for (var i in iface) {	//copy static properties from interface
						var val = iface[i];
						if (_isValidProp(i) && !this[i]) {
							this[i] = val;
						}
					}
				}
			},this);
			
			return this;
		},
		/**
		 * add base class to type (same as 'extends' in java). this method should be  
		 * called in the context of a type. i.e. _Type.inherits.call(realType, baseTypeName);
		 */
		inherits : function (supClass, isB) { 
		    if (supClass === "vjo.Object" || supClass === vjo.Object) {
		    	if (isB ) {
		    		_Type.createInherits(this,vjo.Object);
		    	}
		    	return this;
		    }
		    supClass = _getTypeName(supClass);
		    if (!isB && !_isValidInh(supClass)) {
		    	throw "Cannot inherit from '" + supClass + "'";
		    }
			var type;
			if (_isVjoType(supClass)) {
				type = supClass;
				var clz = type.vj$._class || "", idx = clz.lastIndexOf("."), 
				cn = (idx>-1) ? clz.substring(idx+1) : clz;
				if (cn) this.vj$[cn] = type;
			} else {
				type = this.vj$[supClass] || vjo.getType(supClass);				
			}
			
			if (_isVjoType(type)) {
				var typeMeta = _TypeMeta.getById(type.vj$._meta._metaId);
				if (typeMeta && !typeMeta._completed) typeMeta.complete();
				_Type.createInherits(this,type);
			}
			return this;
		},
		setBase : function(ctx,type) {
			//currently, getBase returns a shared base object for all types.
			//_parent is set with the current scope, affected the shared getBase.
			//we've kept this this way for now, for performance reasons. and
			//haven't run into any problems yet since JavaScript is single threaded.
			//each instance similarly update its _parent before potentially
			//calling a base method. if this ends up causing problems, we'll need
			//to create a new instance for base, and copy all getBase properties in.
			//this will be a performance hit, but potentially be needed if any issues are
			//found with the swapping approach.
			ctx.base = (type.prototype._getBase)? type.prototype._getBase() : null;
			if (ctx.base) ctx.base._parent = ctx; //keep top level scope
		},
		createInherits : function(derived,type) {
		    /**
		        type - Super class
		        derived - Current class
		    */
			var cls = this.createNoConstruct(type);
			cls.constructs = null; //do not want to pull in super constructor
			cls.constructor = derived;
			if (type === vjo.Object) {				
				cls.base = this.emptyFunc;
				derived.prototype = cls;
				cls._getBase = this.selfFunc;
				return;
			}
			var ptype = type.prototype; 			
			var baseRef = {};
			baseRef.vj$ = type.vj$;
			if (ptype._getBase && ptype._getBase()._constructs) baseRef._constructs = true;
			cls.base = function () { //super method
				var cbase = this.base, ptype = type.prototype, gb = ptype._getBase, c = ptype.constructs; 
				if (ptype.base) this.base = ptype.base;
				var cstr = (c) ? c.toString() : "", b = (cstr.indexOf("this.base(")===-1 && cstr.indexOf("this.constructs")===-1);
				if (gb && gb()._constructs && b) this.base(); 
				if (ptype.constructs) {
					var isIn = this.vj$._meta._isInner;
//					try { 
						_Type.execRealFn(ptype.constructs,arguments,this,type,isIn) 
//					} 
//					catch (e) { throw e; }
				}
				this.base = cbase;
			}
			//reference to all base class methods.
			//should only be used internally
			cls._getBase = function() {
				return baseRef;
			};

			var vOP = vjo.Object.prototype;
			//add protos methods/
			for (var i in ptype) {
				if (i === 'toString') continue;
				var pt = ptype[i], bFn = _isFn(pt);
				if (i==='constructs' && bFn) {
					if (pt.length===0) {
						baseRef._constructs = true;
					}
				} else if (_isValidInst(i)) {
					if (bFn && !pt.vj$ && vOP[i]!==pt && !(pt instanceof RegExp)) {
						var ref = this.createBaseRef(type,pt,derived);
						baseRef[i] = ref;
						if (!pt.__isChained) {
							cls[i] = this.hasBaseCall(pt,i) ? ref : this.createChainedMethod(type,pt);
							//re-calling one of these chained methods will cause an 
							//infinite look, so we tag it so we're able to identify
							cls[i].__isChained = true;
						}
					} else {//TODO add inners
						if (_isVjoType(pt) && pt.vj$._meta._isInner) {
							var dmeta = derived.vj$._meta;
							if (!dmeta._inners) {
								dmeta._inners = {};
							}
							dmeta._inners[i] = pt;
						}
						cls[i] = pt;
					}
				}
			}
			if (baseRef.toString != vjo.Object.prototype.toString) {
				baseRef.toString = this.createBaseRef(type,ptype.toString,derived);
			}
			
			derived.prototype = cls; //update prototype chain
		},
		createChainedMethod : function (type,fn) { //create chained methods
			return function () {
//				try {
					if(this.vj$._vjType==='etype') {
						return _Type.execRealFn(fn,arguments,this,type, true);
					} else {
						return _Type.execRealFn(fn,arguments,this,type);
					}
//				} catch (e) {
//					throw e;
//				}
			};
		},
		emptyFunc : function() {},
		selfFunc : function() {return this},
		hasBaseCall : function(fn,key) {
			var fnStr = fn.toString();
			return (fnStr.indexOf('this.base.'+key+'(')!=-1);
		},
		//helper to create base method
		createBaseRef : function(type,fn,der) {
			return function () { //create base types
				var scp = (this._parent) ? this._parent : this, rv, error = false, cbase = scp.base; //keep base instance
				_Type.setBase(scp,type); //point to base class "base" before executing base method
//				try {
					rv = _Type.execRealFn(fn,arguments,scp,type); 
//					}
//				catch (e) { error = e; }
				scp.base = cbase; //restore base
				if (error) throw error;
				return rv;
				
			};
		},
		/**
		 * Utility to update class names for inner types
		 */
		updateInners : function(rootclz, clzname, inner, isStatic) {
			if (inner && inner.vj$) {
				var vj = inner.vj$, clz = inner.clazz;
				vj._class = clzname;
				var idx = clzname.lastIndexOf('.'), snm = clzname.substring(idx+1);
				vj[snm] = inner;
				if (clz && rootclz) {
					if (clzname.indexOf(rootclz) == 0) {
						var tmp = clzname.replace(rootclz, "");
						while (tmp.indexOf(".")>-1) {
							tmp = tmp.replace(".", "$");
						}
						clz._name = rootclz + tmp;
					} else {
						clz._name = rootclz + "$" + snm;
					}
				}
				_createPkg(clzname,true).pkg[snm] = inner;
				var ins = (isStatic) ? vj._meta.s_inners : vj._meta._inners
				if (ins) {
					_forEach(ins,function(val,key) {
						_forEach(vj,function(val,key){
							if (!this[key]&&val&&val.vj$) this[key] = val;
						},val.vj$);
						var m = _TypeMeta.getById(val.vj$._meta._metaId);
						if (val.vj$ && m) _TypeInitMgr.addInner(rootclz,m);
						//recursive call
						_Type.updateInners(rootclz,clzname+"."+key,val,isStatic);	
					});
				}
			}
		
		},
		/**
		 * Utility to store inner types on a type, for later processing
		 */
		addInner : function(clz,inner,store,key) {
			if (!clz || !inner || !key) return false;
			var vj = inner.vj$;
			if(!vj) return false;
			if (_isVjoType(inner) && vj._meta._isInner) {

			    var cvj = clz.vj$;
				if (!vj._class && cvj._class) {
			    	var cn = vj._class = cvj._class + "." + key;
			    	if (inner.clazz) {
						inner.clazz._name = cn;	//Update class info as well
						_clzCache[cn] = inner.clazz; //Update cache as well
			    	}
			    	_createPkg(cn,true).pkg[key] = inner;
			    }
			    if(store) {
			        if (!cvj._meta[store]) {
			        	cvj._meta[store] = {};
				    }
				    cvj._meta[store][key] = inner;
				}
				return true;
			}
			return false;
		},
		/**
		 * Gas
		 */
// NOTE TODO WHATEVER - I added comments to the try catch because i prefer to know the exception than see it wrapped...?
// ??? David Karam, Dec 28, 2011
		execRealFn : function(fn,args,ctx,base,donotfix) {
			var error = false, rv, t = {vj$:ctx.vj$};
			if (!donotfix) {
				//take the first parameter's vj$ and assign it to the second's. After the real method
				//is called, swap it back. this became an issue in the case of instance inner types, 
				//because the static vj$ does not have instance specific properties, such as "parent"
				//for instance inner types. instance inner types will create their own vj$ on their
				//"base" which is why there's a check for it in the first parameter. this is a special
				//case for instance inners, in context swapping.
				_fixScope((ctx.base&&ctx.base.vj$&& base.vj$._class==ctx.base.vj$._class)?ctx.base:base,ctx)
			}
//			try {
				rv = fn.apply(ctx,args);
//			} catch (e) {
//				//make sure we fix the scope back, before throwing an error
//				//otherwise if the application catches the error, our context
//				//will be wrong. we'll still be stuck with the old context's vj$
//				error = e;
//			}
			if (!donotfix) _fixScope(t,ctx);
//			if (error) throw error;
			return rv;
		},
		createClazz : function(typ) {
			//Init class for the type
			var old = typ.clazz, nm = typ.vj$._class;
			if (old && old._name) {
				nm = old._name;
			}
			typ.clazz = vjo.Class.create(nm, typ.vj$._vjType);
			if (old) {
				typ.clazz._satisfied = old._satisfied;
			}
			if (typ.prototype) typ.prototype.getClass = _getClazz;
			else typ.getClass = _getClazz;
			
			//add self-referencing type
			typ.vj$.type = typ;
		},
		canCallBase : function(obj) {
			var str = obj.constructs.toString();
			return obj.base && str.indexOf("this.base(")===-1 && str.indexOf("this.constructs")===-1;
		},
		tmpFunc : function() {},
		construct : function(ctx,args) {
			var c = ctx.constructs;			
			var fn, rv, dconstruct = false;
			if (ctx.base && ctx._getBase) {
				//BUGDB00734926 
				//fn = this.tmpFunc;
				fn = function() {};
				fn.prototype = ctx._getBase();
				dconstruct = fn.prototype._constructs || false;
			}
			
			if (dconstruct && (!c || this.canCallBase(ctx))) { //call base constructor if needed
					ctx.base();
			}
			
			if (c) rv = c.apply(ctx,args);//call real constructs
			
			if (fn) {//update base, so we're not pointing at shared prototype base
				ctx.base = new fn; 
				ctx.base._parent = ctx;
			}
			if (rv) {
				return rv;
			}
		},
		/**
		 * Utility to create instance inner types, on the instance.
		 * we can instantiate an inner instance type, like:
		 * new obj.InnerType()
		 */
		processInners : function(context,basevjo,baseclazz) {
			var inners = (basevjo) ? basevjo._meta._inners : null;
			if (!basevjo || !inners || inners.length==0 || !context) return;
			for (var k in inners) {
				context[k] = vjo.curry(function (t,type,nm) {
						var cn = t.vj$._class + "." + nm;
						var m = _TypeMeta.getById(type.vj$._meta._metaId);
						if (m) m.complete();
						var tp = _Type.createNoConstruct(type);
						var _v = _createVjNS(basevjo,nm,type);
						tp.vj$ = _v;
						tp.vj$.outer = t;
						_Type.processInners(tp,_v,type.clazz);
						type.vj$._class = tp.vj$._class = cn;
						var s = type.prototype;
						if (type.clazz && !type.clazz._name) {
							type.clazz._name = tp.vj$._class;
							_clzCache[cn] = type.clazz; //When name is updated, update cache as well
						} else {
							_Type.createClazz(type);
						}
						_Type.construct(tp,Array.prototype.slice.call(arguments,3));
						if (tp.vj$.outer && tp.base.vj$) {
							var _v = _createVjNS(tp.vj$);
							_extend(_v,tp.base.vj$);
							tp.base.vj$ = _v;
						}
						return tp;
				},context,inners[k],k);
				context[k]._outer = context;
				context[k].vj$ = inners[k].vj$;
			}
		}};
		
	
	var hasConsole = (typeof console != "undefined");
	_extend(vjo,{
		sysout : { //do nothing or proxy to FireBug console
			print : function() {
			    if (hasConsole) {
				    console.info.apply(this, arguments);
			    }
			},
			println : function() {
			    if (hasConsole) {
				    console.info.apply(this, arguments);
			    }
			},
			printStackTrace : function() {}
		},
		syserr : {
			print : function() {
				if (hasConsole) {
					console.warn.apply(this, arguments);
				}
			},
			println : function() {
				if (hasConsole) {
					console.warn.apply(this, arguments);
				}
			},
			printStackTrace : function() {}
		},
		jsunit : {
		    assertEquals : function(){},
		    assertTrue : function(){},
		    assertFalse : function(){},
		    assertNotNull : function(){}
		}
	});
	
	/**
	 * _TypeMeta collects data about a given type, and completes the definition
	 * when all the dependent types are loaded.
	 */
	function _TypeMeta(name,kind,cfg) {
		this._needs = [];
		this._props = null;
		this._protos = null;
		this._satisfies = [];
		this._mixins = [];
		this._inherits = [];
		this._globals = null;
		this._scopeForGlobals = null;
		this._inits = null;
		this._expects = [];
		this._completed = false;
		this._isInner = (name)? false : true;
		this._name = name;
		this._kind = kind;
		this._options = {autoConstruct:true}; //default options
		this._isMetaType = false;
		this.init(cfg);
		this.setup();
	}
	
	_TypeMeta.prototype = {
		init : function (cfg) {
			this._cfg = {
				satisfiesFn : _Type.satisfies,
				inheritsFn : _Type.inherits,
				protosFn : _Type.protos,
				postDefFn : _Type.tmpFunc,
				typeDef : null,
				baseType : "vjo.Object"};
			if (cfg) _extend(this._cfg,cfg);
		},
		setup : function() {		
			var id = this._name;
			var t = this._type = this._cfg.typeDef || _Type.create(id,'itype'===this._kind);
			t.vj$._vjType = this._kind || 'ctype';
			this._canDelayInit = true; //Assume there are no static members by default, props & inits will set it to true
			if (this._isInner) { 
				id = _TypeMeta.id();
				t.vj$._meta._isInner = true;
			} else {//add type to typespace
				var pObj = (this._kind == 'ftype')? _createPkg(id, false, vjo._hiddenTypes) : _createPkg(id);
				if (!pObj.pkg[pObj.className]) pObj.pkg[pObj.className] = this._type;
				t.vj$[pObj.className] = t;
				_TypeInitMgr.register(id,this);
				this._isDup = (_TypeMeta.getById(id)!=null);
			}			
			if (!this._isDup) _TypeMeta.put(this,id);			
			t._inherits = null;
			_Type.createClazz(t);
			t.vj$._meta._metaId = id;
		},
		needs : function(need,alias) {
		    _Type.needs.apply(this._type,arguments);
			return this;
		},
		//> final public T options(vjo.optionsOL::opts opts)
		options : function(opts) {
			if (opts) {
				for (var k in opts) {
					this._options[k] = opts[k];
					if (k == 'metatype' && opts[k]) {
						this._isMetaType = true;
					}
				}
			}
			return this;
		},
		//> final public T satisfies(String type)
		//> final public T satisfies(Array type)
		satisfies : function(type) {
		    var clzs = [];
			if (type instanceof Array) clzs = type;
			else clzs = [type];
			_forEach(clzs,function(val,key,obj){
		        var clsNeed = _getTypeName(val);
		        this.needs(clsNeed); //make sure class is loaded
				_Type.needs.call(this._type,clsNeed); //make sure class is loaded
				this._satisfies.push(val);
			},this);
            return this;
		},
		 //> public final T props(ObjLiteral objLiteral) 
		props : function (props) {
			this._canDelayInit = false;
			if (this._props) throw "multiple props blocks are not allowed";
			this._props = props;
			_Type.props.apply(this._type,arguments);
			return this;
		},
		//> final public T protos(ObjLiteral objLiteral)
		protos : function (protos) {
		    if (this._protos) throw "multiple protos blocks are not allowed";
			this._protos = protos;
			return this;
		},
		//> final public T inherits(String type)
		//> final public itype inherits(Array type) ; this is only for itype allows for multiple inherits
		inherits : function(type) {
			var clzs = [];
			if (type instanceof Array) clzs = type;
			else clzs = [type];
			_forEach(clzs,function(val,key,obj){
				var clsNeed = _getTypeName(val);
				this.needs(clsNeed); //make sure class is loaded
				this._inherits.push(val);
			},this);
			return this;
		},
		
		//> final public T mixin(String type)
		//> final public T mixin(Array type)
		mixin : function (type) {
			var clzs = [];
			if (type instanceof Array) clzs = type;
			else clzs = [type];
			_forEach(clzs,function(val,key,obj){
			    var clsNeed = _getTypeName(val);
			    this.needs(clsNeed); //make sure class is loaded
				this._mixins.push(val);
			},this);
            		return this;
		},
		//> final public T inits(Function func)
		inits : function (fn) {
			this._canDelayInit = false;		
			this._inits = fn;
			return this;
		},				
		//> final public T globals(ObjLiteral obj)
		//> final public T globals(ObjLiteral obj, Object scopeForGlobals)
		globals : function (obj, scopeForGlobals) {
			this._canDelayInit = false;
			this._globals = obj;
			this._scopeForGlobals = scopeForGlobals;
			return this;
		},
		validateAndMerge : function (context,field){
			var p = (field) ? context[field] : context;
			return function(val,key,obj) {
				if (p[key]) {
					throw "collision when mixing in '" + key + "' into " +  this._name;
				} else {
					p[key] = val;
				}
			};
		},
		mergeMixins : function(props) {
			var mxns = this._mixins;
			for (var i=0; i<mxns.length; i++) {
				var m = vjo.getType(mxns[i]);
				if (!m || !m.vj$ || m.vj$._vjType!='mtype') throw mxns[i] + 'is not a valid mtype.';
				var exp = m._expects; sats = m._satisfiers;
				if (!this._protos) this._protos = {};
				if (!this._props) this._props = {};
				//update namespace with mixins
				_copyNS(m.vj$,this._type.vj$);
				//point mtype reference to target reference
				var nm = m.vj$._class, idx = nm.lastIndexOf('.');
				var clz = (idx != -1) ? nm.substring(idx+1) : nm;
				if (!this._type.vj$[clz])
					this._type.vj$[clz] = this._type;
				else
					throw clz + " is already defined in the current namespace";
				_forEach(m._protos, this.validateAndMerge(this,'_protos'), this);
				_forEach(m._props, this.validateAndMerge(props,'_props'), this);
				for (var j=0; j<sats.length; j++) this._satisfies.push(sats[i]);
				if (exp) this._expects.push(exp);
			}
		},
		completeSatisfies : function() {
			if (this._satisfies.length>0) this._cfg.satisfiesFn.call(this._type,this._satisfies);
			if (this._expects.length>0) this._cfg.satisfiesFn.call(this._type,this._expects,true);
		},
		completeInherits : function() {
			var ilen = this._inherits.length
			if (ilen>0)  {
				if (this._kind != 'itype' && ilen>1) {
					throw 'type can only inherit from one type';
				}
				for (var i=0; i<ilen; i++) this._cfg.inheritsFn.call(this._type,this._inherits[i]);
			} else {
				if (this._kind!='itype') {
					this._cfg.inheritsFn.call(this._type,this._cfg.baseType,true);
				}
			}
		},
		completeDef : function() {
			var ftype = (this._kind == 'ftype');
			if (!ftype && this._protos) {
				this._cfg.protosFn.call(this._type,this._protos);
			}
			this._cfg.postDefFn.call(this);
			// init globals
			if (this._globals && !this._isDup) this.__initGbs(this._globals, this._scopeForGlobals);
			// inits
			if (this._inits && !this._isDup) this._inits.call(this._type);			
		},
		__initGbs:function(obj, scopeForGlobals){
			//for(i in obj){ eval( i + "=\"" +obj[i] + "\"" ) }
			var scope = scopeForGlobals;
			if (scope == undefined || scope == null) {
				scope = win;
			}
			
			_forEach(obj,function(val,key){
				if (typeof(val) != 'undefined'){
					if (this[key] && this[key]!==val){
						throw key + " is already defined in the current namespace";
					}
					this[key] = val;
				}
			},scope);
			
		},
		complete : function () {
			if (this._completed) return this;
			this._completed = true;
			_TypeMeta._completed[this._name] = true;
			var ftype = (this._kind == 'ftype');
			if (!ftype) {
				//merge mixins, and validate for collisions
				_updateInnerEtypes(this._type.vj$);
				if (this._mixins.length > 0) {
					var p = {_props:{}};
					this.mergeMixins(p);
					_Type.props.call(this._type,p._props);
				}
				//complete definition of type
				this.completeSatisfies();
				this.completeInherits();
			}
			this.completeDef();
			return this;
		},
		typesAvail : function(list) {
			for (var i=0; i<list.length;i++) {
				if (!_isVjoType(list[i])) {
					return  false; 
				}
			}
			return true;
		},
		canComplete : function() {
			var b = (this._inits==null) &&  this.typesAvail(this._inherits);
			if (b) b = this.typesAvail(this._satisfies);
			if (b) b = this.typesAvail(this._mixins);
			return b;
		},
		//> final public T endType()
		endType : function () {
			if (this._isMetaType) {
				//remove it from runtime type space
				_deleteType(this._name);
				return this._type;
			}
		    if (!this._isInner) {
				if (_enableLazyInit && this._canDelayInit) {
				 	return this._type;
				}		    
				_TypeInitMgr.load(this._name);
				if (vjo.validateType) {
					vjo.validateType(this._type);
				}
		    } else if (this.canComplete()) this.complete();

		    //all other inners/anonymous will be completed at later time
			//alternatively, user can complete their type, if needed.
		    return this._type;
		}
	};
	_extend(_TypeMeta,{
		_count : 0,
		_pre : "tmp",
		_reg : {},
		_completed : {},
		/**
		 * Generate a unique id
		 */
		id : function () {
			return this._pre + this._count++;
		},
		/**
		 * Register a type meta
		 */
		put : function(meta,id) {
			var nm = (id) ? id : this._pre + this._count++;
			this._reg[nm] = meta;
		},
		/**
		 * Access TypeMeta given a type.
		 */
		get : function(type) {
			var _type;
			if (_isVjoType(type)) {
				return this._reg[type.vj$._meta._metaId];
			} else if (_type=vjo.getType(type)) {
				return this._reg[_type.vj$._meta._metaId];
			} else {
				return this._reg[type];
			}
		},
		getById : function(id) {
			return this._reg[id];
		}
	});
	
	
	/**
	 * Type Definitions
	 *
	*/
	
	/**
	 * Class Type
	 */
    //> final public T ctype(String? type)
	vjo.ctype = function (clz) {
		clz = _getTypeName(clz);
		var t = new _TypeMeta(clz);
		return t;
	};
	
	/**
	 * Interface Type
	 */
    //> final public T itype(String? type)
	vjo.itype = function (clz) {
		clz = _getTypeName(clz);
		var t = new _TypeMeta(clz,'itype', {
			inheritsFn : function (supClass) {
				var type = (this.vj$[supClass]) ? this.vj$[supClass] : 
					(this.vj$.b && this.vj$.b[supClass]) ? this.vj$.b[supClass] : vjo.getType(supClass);
				if (type) {
				    //copy static finals
				    for (var i in type) {	
						var val = type[i];
						if (_isValidProp(i) && !this[i]) {
							this[i] = val;
						}
					}
				}
				return this;
			}
		});
		t._type.isInstance = function (obj) {
			    return vjo.isInstanceOf(obj,this);
		};
		return t;
	};
	
    //> final public T ftype(String? type)
	vjo.ftype = function (clz) {
		clz = _getTypeName(clz);
		var t = new _TypeMeta(clz, 'ftype', {
			postDefFn : function(){
				var tmpType = this._type;
				var func = tmpType['_invoke_'];
				if (!_isFn(func)) {
					throw "missing required method _invoke_ in ftype";
				}
				delete func['_name'];
				this._type = (function() {
					return function() {
						return _invokeWithCallerScope(func, arguments);
					}
				})();
				for (var i in tmpType) {
					if (i == '_invoke_' ||  i == 'prototype' || i == 'undefined' || i == 'isInstance' || i == '_inherits' || i == 'clazz' || i == '_name' ) {
						continue;
					}
					this._type[i] = tmpType[i];
				}
				var pObj = _createPkg(this._name, true);
				pObj.pkg[pObj.className] = this._type;
				this._type.vj$[pObj.className] = this._type;
			}
		});
		return t;
	};
	
	function _MType(clz) {
		function _addMixinMethods(to, methods, ns) {
			if (!methods || typeof methods != 'object') return;
			var b = true;
			for (var i in methods) {
				b = false;
				if (!reservedMProp[i]) {
					to[i] = methods[i];
				}
			}
			return b;
		};
		var t = this;
		t.vj$ = { _vjType : 'mtype', _class:clz, _meta : {} };
		t._props = null;
		t._protos = {};
		t._expects = "";
		t._satisfiers = [];
		t.needs = function () { return _Type.needs.apply(this,arguments); };
		t.props = function (props) {
			var p = this._props || {};
			if (!_addMixinMethods(p,props,this.vj$)) {
				if (!this._props) {
					this._props = p;
				} 
			}
			return this;
		};
		t.protos =  function (protos) {
			if (protos && protos['constructs']) {
				throw 'mtype cannot have constructs block';
			}
			_addMixinMethods(this._protos,protos,this.vj$);
			return this;
		};
		//> final public T expects(String type)
		t.expects = function (clz) {
			this._expects = vjo.getType(clz);
			return this;
		};
		t.satisfies = function (clz) {
			var clzs = [];
			if (clz instanceof Array) clzs = clz;
			else clzs = [clz];
			_forEach(clzs,function(val,key,obj){
			    var clsNeed = _getTypeName(val);
			    this.needs(clsNeed); //make sure class is loaded
				this._satisfiers.push(val);
			},this);
			return this;
		};
			
		t.endType = function () {
			if (this.vj$._class) _TypeInitMgr.load(this.vj$._class);
			return this;
		}
		return t;
	}
	
	/**
	 * Mixin Type
	 */
	//> final public mtype mtype(String? type)
	vjo.mtype = function (clz) {
		clz = _getTypeName(clz);
		var base = new _MType(clz);
		
		//if class not specified, return class
		if (!clz || _isInnerClass(clz)) base.vj$._meta._isInner = true;
		if (!clz) return base;
		
		var pObj = _createPkg(clz);
		//if class already exists, just return the type. do not override existing class
		return (pObj.pkg[pObj.className])? base : (pObj.pkg[pObj.className] = base); 
	};
	
	/**
	 * Enum Type
	 */
    //> final public vjo.etype etype(String? type)
	vjo.etype = function(clz) {
		clz = _getTypeName(clz);
		_createEnum();
		var eDef = function (args) {
		    this.vj$ = eDef.vj$;
			if (args != false) {
				if (!this.constructs) {
					throw "'" + this.vj$._class + "' cannot be instantiated";
				}
				var rv = this.constructs.apply(this,args);
			}
		};
		eDef.vj$ = {_class:clz, _vjType:'etype', _meta:{}};
		eDef.isInstance = function (o) {
			return vjo.isInstanceOf(o,this);
		};
		var t = new _TypeMeta(clz,'etype',{
			typeDef : eDef,
			baseType : 'vjo.Enum',
			postDefFn : function(){
				this._type.prototype.toString = vjo.Enum.prototype.name;
				if (this._eVals) this._type.values.call(this._type,this._eVals);
			}
		});
		_extend(t,{
			inherits : function () {
				throw "Invalid type definition. etype cannot be inheritted from another type";
			},
			//> final public T values(String type)
		    //> final public T values(ObjLiteral objLiteral)
			values : function (vals) {
				this._eVals = vals;
				return this;
			}
		});
		
		var en = t._type;
		en._enums = [];
		en.from = vjo.Enum.from;
		en._nativeValueOf = en.valueOf;
		en.valueOf = vjo.Enum.from;
		en.values = function (vals) {
			if (arguments.length == 0) {
				if (this._enums.slice) {
					return this._enums.slice();
				} else {
					var a = [];
					for (var i = 0; i < this._enums.length; i++) {
						if (this._enums[i]) {
							a[i] = this._enums[i];
						}
					}
					return a;
				}
			} else {
		    	var ord = 0;
		    	if (typeof vals == "string" && vals.length > 0) {
					while (vals.indexOf(" ") > -1) {
						vals = vals.replace(" ", "");
					}
	    			//Simple case...
	    			//  ex: .values("MON,TUE,WED")
	    			// or .values("MON:1, TUE, WED")
		    		if (vals.indexOf(",") > 0) {
		    			var a = vals.split(","), t;
			    		if (a[0] && a[0].indexOf(":") > 0) {
			    			throw "Invalid labels for etype values: " + a[0];
			    		}
		    			for (var i = 0, l = a.length; i < l; i++) {
		    				var eV = a[i];
		    				if (i==0 && t && t.length>0) {
		    					eV = t[0];
		    				} else {
		    					if (a[i].indexOf(":")>-1) {
		    						//Error case
		    						eV = a[i].split(":")[0];
		    					}
		    				}
		    				this._enums[this._enums.length] = new en(false);
		    				this._enums[this._enums.length - 1]._name = eV;
		    			}
		    		} else {
	    				this._enums[0] = new en(false);
	    				this._enums[0]._name = vals;
		    		}
		    	} else {
					//Complex case...
					//  ex: values({MON:[true],TUE:[true],SUN:[false]})
					for (var itm in vals) {
						this._enums[this._enums.length] = new en(vals[itm]);//TODO
						this._enums[this._enums.length - 1]._name = itm;
					}
		    	}
		    	
		    	//Create static refs for enums
		    	for (var i = 0, l = this._enums.length; i < l; i++) {
		    		if (this._enums[i]) {
		    			var nm = this._enums[i]._name;
						if (this[nm]) {
							//Validate props members against values
							throw "Invalid prop member. Cannot use etype value as prop member.";
						}
			    		this[nm] = this._enums[i];
			    		this[nm]._ord = ord++;
		    		}
		    	}
			}
			en.prototype.constructs = null;
			return this;
			
		};
		    
		
		return t;
	};
	
	/**
	 * Native Object Type
	 */
	//> final public vjo.otype otype()
    //> final public vjo.otype otype(String type)
	vjo.otype = function (clz) {
		return {
			//> final public T defs(ObjLiteral objLiteral)
			defs : function (defs) {
				return this;
			},
			endType : function () {
			}
		};
	};
	
	
	/*
		reserved words
	*/
	var reservedProp = {}, reservedProto = {}, reservedMProp = {}, reservedClz = {}, reservedInh = {};
	_forEach("props protos inherits prototype inits satisfies mixin _inherits _satisfiers singleton isInstance vj$".split(" "),
		function (val,key,obj) {
			this[val] = true;
		},reservedProp);
	_forEach("constructs getClass _getBase base vj$".split(" "),
		function (val,key,obj) {
			this[val] = true;
		},reservedProto);
	_forEach("props protos _props _protos vj$ _expects expects _satisfiers satisfies endType".split(" "),
		function (val,key,obj) {
			this[val] = true;
		},reservedMProp);
	_forEach("vjo.Class vjo.Object".split(" "),
		function (val,key,obj) {
			this[val] = true;
		},reservedClz);
	
	/**
	 *	utility methods used by bootstrap
	 */
	
	function _isVjoType(clz,excludeMixin) {
		if (clz && clz.vj$ && clz.vj$._vjType) {
			if (_isFn(clz)) return true;
			else if (clz.vj$._vjType === 'mtype' && !excludeMixin) return true
		}
		return false;
	}
	
	function _isInstanceForInterface(poClass,poType) {
        var clz = poClass, arr = clz._satisfied;
        for (var i=0; i<arr.length; i++) if (_isInterfaceInstanceOf(poType, arr[i])) return true;
	    return false;
	}
	
	function _isInterfaceInstanceOf(src,target) {
	    if (src === target) return true;
	    var meta = _TypeMeta.getById(target.vj$._meta._metaId), inhs;
	    if (meta && (inhs = meta._inherits)) {
	        for (var i=0;i<inhs.length;i++) {
	            var tpName = _getTypeName(inhs[i]);
	            if (src === vjo.getType(tpName)) return true;
	        }
	    }
	    return false;
	}
	
	function _createPkg (className,doNotCreateNS,topLevelNameScope) {
		if (!className) return null;
		var pkgType = _typeMap[className];
		if (pkgType) return pkgType;//if have pkg, return
			
		var names = className.split('.'), len = names.length;
		if (doNotCreateNS) {
			pkgType = {pkg:{className:names[len-1]}};
		} else {
			var pkg = topLevelNameScope;
			if (!pkg) {
				pkg = (names[0]=='vjo') ? _global : this;
			}
			for (var i=0; i<len-1;i++){
				var name = names[i];
				var sub = pkg[name];
				if (!sub) {
					pkg[name] = sub = {};
				}
				pkg = sub;
			}
			pkgType = {pkg:pkg,className:(len>0)?names[len-1]:""}
		}
		_typeMap[className] = pkgType;
		return pkgType;
	}
	
	function _deleteType (className) {
		var pkgType = _typeMap[className];
		if (pkgType) {
			delete pkgType.pkg[pkgType.className];
		}
		var names = className.split('.'), len = names.length;
		var pkgs = [];
		var pkg = (names[0]=='vjo') ? _global : this;
		pkgs[0] = pkg;
		for (var i=0; i<len-1;i++){
			var name = names[i];
			var sub = pkg[name];
			pkgs[i+1] = sub;
			pkg = sub;
		}
		for (var i = pkgs.length - 1; i > 0; i--) {
			var empty = true;
			for (var n in pkgs[i]) {
				if (n == 'undefined') {
					continue; //due to FireFox
				}
				empty = false;
				break;
			}
			if (empty) {
				if (pkgs[i-1] == this) {
					eval('delete names[i-1]'); //due to IE issue
				}
				else {
					delete pkgs[i-1][names[i-1]];
				}
			}
		}
	}
	
	function _invokeWithCallerScope(realFn, args) {
		return realFn.apply(this, args);
	}
	
	function _createEnum() {
		//Enum created already!
		if (_isFn(vjo.Enum)) {
			return;
		}
		var nm = "vjo.Enum";
		var baseEnum = vjo.ctype(nm)
		.props({
			from : function () {
				if (arguments.length == 0 || arguments.length > 2) {
					//Invoke native valueOf method
					return this._nativeValueOf.apply(this, arguments);
				}
				var s = arguments[0];
				if (arguments.length == 2) {
					s = arguments[1];
					if (s) {
						var clz = arguments[0];
						try {
							var n = clz.getName();
							while (n.indexOf("$") > 0) {
								n = n.replace("$", ".");
							}
							var o = eval(n);
							if (o[s]) {
								return o[s];
							}
						} 
						catch (a) {
						}
					}
					throw "No enum const " + arguments[0].getName() + "." + s;
				} else {
					if (this[s]) {
						return this[s];
					}
				}
				throw "No enum const " + s;
			}
		})
		.protos({
			_name : null,
			_ord : -1,
			constructs : function() {
				throw "cannot instantiate 'vjo.Enum'";
			},
			name : function () {
				return this._name;
			},
			ordinal : function () {
				return this._ord;
			},
			compareTo : function (o) {
				if (o == null) {
					throw "compare to Etype value cannot be null";
				}
				return (this.ordinal() - o.ordinal());
			},
			equals : function (o) {
				return (this===o);
			},	
		    getDeclaringClass:function(){
                var clazz=this.getClass();
                return clazz;
			}	
		})
		.endType();	
		baseEnum._nativeValueOf = baseEnum.valueOf;
		baseEnum.valueOf = vjo.Enum.from;
		reservedClz[nm] = true;
		reservedInh[nm] = true;
	}

	//Added to Object at runtime
	function _getClazz() {
		var n = clz = this.vj$._class, idx = n.lastIndexOf('.');
		if (idx != -1) clz = n.substring(idx+1); 
		if (this.vj$[clz]) return this.vj$[clz].clazz;

		//Error case...
		return null;
	}

	function _updateInnerEtypes(context) {
		if (!context._class) return;
		var typeVjo = context._meta;
		if (typeVjo.s_inners) {
			for (var k in typeVjo.s_inners) {
				if (typeVjo.s_inners[k].vj$._vjType == 'etype') {
					for (var i=0;i<typeVjo.s_inners[k]._enums.length; i++) {
						typeVjo.s_inners[k]._enums[i].vj$ = typeVjo.s_inners[k].vj$;
						_updateInnerEtypes(typeVjo.s_inners[k]._enums[i].vj$);
					}
				}
				_updateInnerEtypes(typeVjo.s_inners[k].vj$);
			}
		}
		if (typeVjo._inners) {
			for (var k in typeVjo._inners) {
				if (typeVjo._inners[k].vj$._vjType == 'etype') {
					if (!typeVjo._inners[k].vj$._class) {
						typeVjo._inners[k].clazz._name = typeVjo._inners[k].vj$._class = typeVjo._class + "." + k;
					}
					for (var i=0;i<typeVjo._inners[k]._enums.length; i++) {
						typeVjo._inners[k]._enums[i].vj$ = typeVjo._inners[k].vj$;
						_updateInnerEtypes(typeVjo._inners[k]._enums[i].vj$);
					}
				}
				_updateInnerEtypes(typeVjo._inners[k].vj$);
			}
		}
	}
	
	function _hasCollisionWithMixin(type,name,isStatic) {
		var mxns = type.vj$._meta.mixins;
		if (!mxns || mxns.length==0) return false;
		for (var i=0; i<mxns.length; i++) {
			var mxn = mxns[i];
			if (isStatic) {
				if (mxn._props && mxn._props[name]) return true;
			} else {
				if (mxn._protos[name]) return true;
			}
		}
		return false;
	}
	
	function _isValidInst (value) {
		return !(reservedProto[value]===true);
	}
	
	function _isValidClz(value) {
		return !(reservedClz[value]===true);
	}
	
	function _isValidInh(value) {
		return !(reservedInh[value]===true);
	}
	
	function _extend(target,source) {
		for (var name in source) {
			var copy = source[name];
			if (copy !== undefined)
				target[name] = copy;
		}
		if (source.toString != Object.prototype.toString) {
			target.toString = source.toString;
		}
	}

	function _forEach(object, block, context) {
		if (!object) return;		
		if ( !vjo.isArray(object) ) {
			for (var name in object ) {
				if ( block.call(context,object[name],name,object) === false )
					break;
			}
		} else {
			for (var i =0, len = object.length; i<len; i++) {
				if (block.call(context,object[i],i,object)===false)
						break;
			}
		}
		return object;
	}
	
	function _createVjNS(ns,name,type) {
		var rv = {};
		_extend(rv,ns);
		if (name && type) {
			delete rv._meta
			_extend(rv,type.vj$); 
			rv[name] = type;
		}
		return rv;
	}
	
	function _copyNS(from,to) {
		_forEach(from,function(val,key){
			if (key != 'type' && _isVjoType(val,true)) {
				if (this[key] && this[key]!==val) 
					throw key + " is already defined in the current namespace";
				this[key] = val;
			}
		},to);
	}

	function _isInnerClass (clz) {
		if (!clz) return true;
		else if (clz.indexOf('.')==-1) return false;
		var tp = clz;
		while ((i = tp.lastIndexOf('.'))>0) {
			tp = tp.substring(0,i);
			if (_typeMap[tp])
				return true;
		}
		return false;
	}
	
	function _isFn(fn) {
		return typeof fn == 'function';
	}
	
	function _isValidProp (pVal) {
		return !(reservedProp[pVal]===true);
	}
	
	function _fixScope(from,to) {
		to.vj$ = from.vj$;
	}
	
	function _getTypeName(name) {
		if (typeof name != 'string') return name;
		var idx = name.indexOf('<');
		if (idx>0) {
			var idx2 = name.indexOf(' ');
			if (idx2 > 0 && idx2 < idx) idx = idx2;
			name = name.substring(0,idx);
		}
		return name;
	}
};

	//Module Support
	function getModuleMgmt(global) {
		
		var _Name = 'VjetModuleMgmt';
		var _Ver = '1.0';
	
		function Module (identifier, parent) {
			this.identifier = identifier;
		    this.parent = parent;
	
		    if (parent) {
		      this.moduleCache = parent.moduleCache;
		    } 
		    else {
		      this.moduleCache = {};
		    }
	
		    this.url = null;
		    this.source = null;
		    this.exports = null;
		    this.scope = null;
		    this.loaded = false;
		};
		
		var _rootModule = new Module('root', null);
		_rootModule.scope = global;
		
		var _createModule = function(identifier, parent){
			if (!parent){
				return new Module(identifier, _rootModule);
			}
			else {
				return new Module(identifier, parent);
			}
		}

		function ModuleManager (name, resolver, fetcher, evaluator){
			this.name = name;
			this.resolver = resolver;
			this.fetcher = fetcher;
			this.evaluator = evaluator;
		}
		
		function Url (){
			this.scheme = null;
			this.domain = null;
			this.port = null;
			this.path = null;
			this.query = null;
			this.relativePath = null;
			this.resourceName = null;
		}
		
		ModuleManager.prototype.getScope = function(m){
			return global;
		}
		
		ModuleManager.prototype.loadModule = function(mod){
			
			if (!mod){
				throw new Error('module is null');
			}
			
			try {

				if (!mod.url){
					mod.url = this.resolver.resolve(mod.identifier, mod.parent.url);
				}
				
				if (!mod.url){
					return false;
				}
				
				if (!mod.source){
					mod.source = this.fetcher.fetch(mod.url);
				}
				
				if (!mod.source){
					return false;
				}
				
				var scope = this.getScope(mod);
				if (scope && scope !== global){
					mod.scope = scope;
				}
				
				if (scope.exports){
					mod.exports = scope.exports;
				}

				this.evaluator.evaluate(mod.identifier, mod.source, scope);

				return true;
			}
			catch(err){
				// TODO 
//				vjo.sysout.println(err);
				return false;
			}
		}
		
		_cacheMgr = {};
		_cacheMgr.getModule = function(identifier, parent){
			if (isRelative(identifier)){
				return null;
			}
			
			if (parent){
				return parent.moduleCache[identifier];
			}
			else {
				return _rootModule.moduleCache[identifier];
			}
		}
		_cacheMgr.addModule = function(mod){
			if (!isRelative(mod.identifier)){
				mod.parent.moduleCache[mod.identifier] = mod;
			}
		}
		
		var _dispatcher = (function(){
			
			var _mgrs = {};
			
			var _addMgr = function(mgr){
				_mgrs[mgr.name] = mgr;
			}
			
			var _getMgr = function(mgrName){
				return _mgrs[mgrName];
			}
			
			var _load = function(identifier, fromModule){
				var parent = fromModule;
				if (!parent){
					parent = _rootModule;
				}
				var m = _cacheMgr.getModule(identifier, parent);
				if (m){
					return m.exports;
				}
				m = _createModule(identifier, parent); 
				for (n in _mgrs){		// TODO: is order guaranteed?
					if (_mgrs[n].loadModule(m)){
						_cacheMgr.addModule(m);
						return m.exports;
					}
				}
				return null;
			};
			
			return {load:_load, addMgr:_addMgr, getMgr:_getMgr};
				
		})();

		function isRelative(identifier){
			if (identifier.slice(0,2) === "./"
				|| identifier.slice(0,3) === "../"){
				return true;
			}
			return false;
		}
		
		// Export
		var _moduleMgmt = {name:_Name, version:_Ver};
		_moduleMgmt.addNativeModule = function(identifier, exports){
			var mod = _createModule(identifier, _rootModule);
			mod.exports = exports;
			mod.moduleCache[identifier] = mod;
			mod.loaded = true;
		}
		_moduleMgmt.addModuleMgr = function(modMgr){
			_dispatcher.addMgr(modMgr);
		}
		_moduleMgmt.getModuleMgr = function(mgrName){
			return _dispatcher.getMgr(mgrName);
		}
		_moduleMgmt.setCacheMgr = function(cacheMgr){
			_cacheMgr = cacheMgr;
		}
		_moduleMgmt.getDispatcher = function(){
			return _dispatcher;
		}
		_moduleMgmt.Module = Module;
		_moduleMgmt.ModuleManager = ModuleManager;
		return _moduleMgmt;
		
	};

	if (!enableModuleMgmt){
		
		//create a local vjo object
		var _vjo = {}; 
	
		// ensure latest vjo version is on global scope
		var win = (typeof window != 'undefined') ? window : this, wv = win.vjo;
		if (!wv || !wv._v || wv._v < VERSION) {
			win.vjo = _vjo;
		}
		
		// VJET Bootstrap
		init(_vjo, this);
	}
	else {
		
		// Integrate VJET with ModuleMgmt
		var moduleMgmt = getModuleMgmt(this);
		
		// Enable VJET
		var _vjo = {}; 
		init(_vjo, this);
		
		// Make VJET exportable via ModuleMgmt
		moduleMgmt.addNativeModule(_vjetName, {vjo : _vjo});
		
		// Add VJET module manager
		var _vjetModMgr = new moduleMgmt.ModuleManager(_vjetName);
		_vjetModMgr.loadModule = function(mod){
			try {
				var _loadModule = moduleMgmt.ModuleManager.prototype.loadModule;
				if (_loadModule.call(_vjetModMgr, mod)){
					mod.exports = _vjo.getType(mod.identifier, true);
					return true;
				}
				else {
					return false;
				}
			}
			catch(err){
				return false;
			}
		}
		moduleMgmt.addModuleMgr(_vjetModMgr);

		// Reset VJET loader to use moduleMgmt
		_vjo.loader = {
				async:true,
				load: function(identifier){
					return moduleMgmt.getDispatcher().load(identifier);
				}
		};
		
		// Enable CommonJs
		var _commonJsModMgr = new moduleMgmt.ModuleManager('CommonJS');
		_require = function(identifier, parent){
			return moduleMgmt.getDispatcher().load(identifier, parent);
		}
		_commonJsModMgr.getScope = function(m){
			var scope = {};
			function getParentScope(parent){
				if (!parent){
					return null;
				}
				if (parent.scope){
					return parent.scope;
				}
				return getParentScope(parent.parent);
			};
			var parentScope = getParentScope(m.parent);
			for (g in parentScope){
				scope[g] = parentScope[g];
			}
			scope.module = m;
			scope.require = function(identifier){
				return _require(identifier, m);
			}
			scope.exports = {};
			return scope;
		}
		moduleMgmt.addModuleMgr(_commonJsModMgr);
		
		this.require = function(identifier){
			return _require(identifier);
		}
		this.require.getModuleMgr = moduleMgmt.getModuleMgr;
	
		// TEMP (to avoid CCE at VjoLoader.java:35) TODO
		this.vjo = _vjo;
	}
	
}).call(this, false);