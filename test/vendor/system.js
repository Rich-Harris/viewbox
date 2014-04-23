/*
* SystemJS
*
* Copyright (c) 2013 Guy Bedford
* MIT License
*/

(function(global) {

global.upgradeSystemLoader = function() {
global.upgradeSystemLoader = undefined;

// Define an IE-friendly shim good-enough for purposes
var indexOf = Array.prototype.indexOf || function(item) {
	for (var i = 0, thisLen = this.length; i < thisLen; i++) {
	if (this[i] === item)
		return i;
	}
	return -1;
};

var lastIndexOf = Array.prototype.lastIndexOf || function(c) {
	for (var i = this.length - 1; i >= 0; i--) {
	if (this[i] === c) {
		return i;
	}
	}
	return -i;
};
/*
SystemJS Core
Adds normalization to the import function, as well as __useDefault support
*/
(function(global) {
// check we have System
if (typeof System == 'undefined')
	throw 'System not defined. Include the `es6-module-loader.js` polyfill before SystemJS.';

var curSystem = System;

/*
	__useDefault

	When a module object looks like:
	new Module({
	__useDefault: true,
	default: 'some-module'
	})

	Then the import of that module is taken to be the 'default' export and not the module object itself.

	Useful for module.exports = function() {} handling
*/
var checkUseDefault = function(module) {
	if (!(module instanceof Module)) {
	var out = [];
	for (var i = 0; i < module.length; i++)
		out[i] = checkUseDefault(module[i]);
	return out;
	}
	return module.__useDefault ? module['default'] : module;
}

// a variation on System.get that does the __useDefault check
System.getModule = function(key) {
	return checkUseDefault(System.get(key));
}

// support the empty module, as a concept
System.set('@empty', Module({}));


var systemImport = System['import'];
System['import'] = function(name, options) {
	// patch System.import to do normalization
	return new Promise(function(resolve) {
	resolve(System.normalize.call(this, name, options && options.name, options && options.address))
	})
	// add useDefault support
	.then(function(name) {
	return Promise.resolve(systemImport.call(System, name, options)).then(function(module) {
		return checkUseDefault(module);
	});
	});
}

// define exec for custom instan
System.__exec = function(load) {
	try {
	Function('global', 'with(global) { ' + load.source + ' \n }'
	+ (load.address && !load.source.match(/\/\/[@#] ?(sourceURL|sourceMappingURL)=([^\n'"]+)/)
	? '\n//# sourceURL=' + load.address : '')).call(global, global);
	}
	catch(e) {
	if (e.name == 'SyntaxError')
		e.message = 'Evaluating ' + load.address + '\n\t' + e.message;
	throw e;
	}
	// traceur overwrites System - write it back
	if (load.name == '@traceur') {
	global.traceurSystem = global.System;
	global.System = curSystem;
	}
}
})(typeof window == 'undefined' ? global : window);
/*
SystemJS Formats

Provides modular support for format detections.

Also dynamically loads Traceur if ES6 syntax is found.

Add a format with:
	System.formats.push('myformatname');
	System.format.myformat = {
	detect: function(source, load) {
		return false / depArray;
	},
	execute: function(load, depMap, global, execute) {
		return moduleObj; // (doesnt have to be a Module instance)
	}
	}

The System.formats array sets the format detection order.

See the AMD, global and CommonJS format extensions for examples.
*/
(function(global) {

System.format = {};
System.formats = [];

if (typeof window != 'undefined') {
	var curScript = document.getElementsByTagName('script');
	curScript = curScript[curScript.length - 1];
	// set the path to traceur
	var traceurSrc = curScript.getAttribute('data-traceur-src') || curScript.src.substr(0, curScript.src.lastIndexOf('/') + 1) + 'traceur.js';
}

// also in ESML, build.js
var es6RegEx = /(?:^\s*|[}{\(\);,\n]\s*)(import\s+['"]|(import|module)\s+[^"'\(\)\n;]+\s+from\s+['"]|export\s+(\*|\{|default|function|var|const|let|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*))/;

// es6 module forwarding - allow detecting without Traceur
var aliasRegEx = /^\s*export\s*\*\s*from\s*(?:'([^']+)'|"([^"]+)")/;

// module format hint regex
var formatHintRegEx = /^(\s*(\/\*.*\*\/)|(\/\/[^\n]*))*(["']use strict["'];?)?["']([^'"]+)["'][;\n]/;

var systemInstantiate = System.instantiate;
System.instantiate = function(load) {
	var name = load.name || '';

	load.source = load.source || '';

	// set load.metadata.format from metadata or format hints in the source
	var format = load.metadata.format;
	if (!format) {
	var formatMatch = load.source.match(formatHintRegEx);
	if (formatMatch)
		format = load.metadata.format = formatMatch[5];
	}

	if (name == '@traceur')
	format = 'global';

	// es6 handled by core

	// support alias modules without needing Traceur
	var match;
	if (!global.traceur && (format == 'es6' || !format) && (match = load.source.match(aliasRegEx))) {
	return {
		deps: [match[1] || match[2]],
		execute: function(depName) {
		return System.get(depName);
		}
	};
	}

	if (format == 'es6' || !format && load.source.match(es6RegEx)) {
	// dynamically load Traceur if necessary
	if (!global.traceur)
		return System['import']('@traceur', { address: traceurSrc }).then(function() {
		return systemInstantiate.call(System, load);
		});
	else
		return systemInstantiate.call(System, load);
	}

	// if it is shimmed, assume it is a global script
	if (System.shim && System.shim[load.name])
	format = 'global';

	// if we don't know the format, run detection first
	if (!format || !this.format[format])
	for (var i = 0; i < this.formats.length; i++) {
		var f = this.formats[i];
		var curFormat = this.format[f];
		if (curFormat.detect(load)) {
		format = f;
		break;
		}
	}

	var curFormat = this.format[format];

	// if we don't have a format or format rule, throw
	if (!format || !curFormat)
	throw new TypeError('No format found for ' + (format ? format : load.address));

	// now invoke format instantiation
	var deps = curFormat.deps(load, global);

	// remove duplicates from deps first
	for (var i = 0; i < deps.length; i++)
	if (lastIndexOf.call(deps, deps[i]) != i)
		deps.splice(i--, 1);

	return {
	deps: deps,
	execute: function() {
		var output = curFormat.execute.call(this, Array.prototype.splice.call(arguments, 0, arguments.length), load, global);

		if (output instanceof global.Module)
		return output;
		else
		return new global.Module(output && output.__esModule ? output : { __useDefault: true, 'default': output });
	}
	};
}

})(typeof window != 'undefined' ? window : global);
/*
SystemJS AMD Format
Provides the AMD module format definition at System.format.amd
as well as a RequireJS-style require on System.require
*/
(function() {
System.formats.push('amd');

// AMD Module Format Detection RegEx
// define([.., .., ..], ...)
// define(varName); || define(function(require, exports) {}); || define({})
var amdRegEx = /(?:^\s*|[}{\(\);,\n\?\&]\s*)define\s*\(\s*("[^"]+"\s*,|'[^']+'\s*,\s*)?(\[(\s*("[^"]+"|'[^']+')\s*,)*(\s*("[^"]+"|'[^']+')\s*)?\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/;

/*
	AMD-compatible require
	To copy RequireJS, set window.require = window.requirejs = System.require
*/
var require = System.require = function(names, callback, errback, referer) {
	// in amd, first arg can be a config object... we just ignore
	if (typeof names == 'object' && !(names instanceof Array))
	return require.apply(null, Array.prototype.splice.call(arguments, 1, arguments.length - 1));

	// amd require
	if (names instanceof Array)
	Promise.all(names.map(function(name) {
		return System['import'](name, referer);
	})).then(function(modules) {
		callback.apply(null, modules);
	}, errback);

	// commonjs require
	else if (typeof names == 'string')
	return System.getModule(names);

	else
	throw 'Invalid require';
}
function makeRequire(parentName, deps, depsNormalized) {
	return function(names, callback, errback) {
	if (typeof names == 'string' && indexOf.call(deps, names) != -1)
		return System.getModule(depsNormalized[indexOf.call(deps, names)]);
	return require(names, callback, errback, { name: parentName });
	}
}

function prepareDeps(deps, meta) {
	for (var i = 0; i < deps.length; i++)
	if (lastIndexOf.call(deps, deps[i]) != i)
		deps.splice(i--, 1);

	// remove system dependencies
	var index;
	if ((index = indexOf.call(deps, 'require')) != -1) {
	meta.requireIndex = index;
	deps.splice(index, 1);
	}
	if ((index = indexOf.call(deps, 'exports')) != -1) {
	meta.exportsIndex = index;
	deps.splice(index, 1);
	}
	if ((index = indexOf.call(deps, 'module')) != -1) {
	meta.moduleIndex = index;
	deps.splice(index, 1);
	}

	return deps;
}

function prepareExecute(depNames, load) {
	var meta = load.metadata;
	var deps = [];
	for (var i = 0; i < depNames.length; i++) {
	var module = System.get(depNames[i]);
	if (module.__useDefault) {
		module = module['default'];
	}
	else if (!module.__esModule) {
		// compatibility -> ES6 modules must have a __esModule flag
		// we clone the module object to handle this
		var moduleClone = { __esModule: true };
		for (var p in module)
		moduleClone[p] = module[p];
		module = moduleClone;
	}
	deps[i] = module;
	}

	var module, exports;

	// add back in system dependencies
	if (meta.moduleIndex !== undefined)
	deps.splice(meta.moduleIndex, 0, exports = {}, module = { id: load.name, uri: load.address, config: function() { return {}; }, exports: exports });
	if (meta.exportsIndex !== undefined)
	deps.splice(meta.exportsIndex, 0, exports = exports || {});
	if (meta.requireIndex !== undefined)
	deps.splice(meta.requireIndex, 0, makeRequire(load.name, meta.deps, depNames));

	return {
	deps: deps,
	module: module || exports && { exports: exports }
	};
}

System.format.amd = {
	detect: function(load) {
	return !!load.source.match(amdRegEx);
	},
	deps: function(load, global) {

	var deps;
	var meta = load.metadata;
	var defined = false;
	global.define = function(name, _deps, factory) {
		if (defined)
		return;

		if (typeof name != 'string') {
		factory = _deps;
		_deps = name;
		name = null;
		}
		else {
		// only allow named defines for bundles
		if (!meta.bundle)
			name = null;
		}

		// anonymous modules must only call define once
		if (!name)
		defined = true;

		if (!(_deps instanceof Array)) {
		factory = _deps;
		// CommonJS AMD form
		var src = load.source;
		load.source = factory.toString();
		_deps = ['require', 'exports', 'module'].concat(System.format.cjs.deps(load, global));
		load.source = src;
		}

		if (typeof factory != 'function')
		factory = (function(factory) {
			return function() { return factory; }
		})(factory);

		if (name && name != load.name) {
		// named define for a bundle describing another module
		var _load = {
			name: name,
			address: name,
			metadata: {}
		};
		_deps = prepareDeps(_deps, _load.metadata);
		System.defined[name] = {
			deps: _deps,
			execute: function() {
			var execs = prepareExecute(Array.prototype.splice.call(arguments, 0, arguments.length), _load);
			var output = factory.apply(global, execs.deps) || execs.module && execs.module.exports;

			if (output instanceof global.Module)
				return output;
			else
				return new global.Module(output && output.__esModule ? output : { __useDefault: true, 'default': output });
			}
		}
		}
		else {
		// we are defining this module
		deps = _deps;
		meta.factory = factory;
		}
	}
	global.define.amd = {};

	// ensure no NodeJS environment detection
	global.module = undefined;
	global.exports = undefined;

	System.__exec(load);

	// deps not defined for an AMD module that defines a different name
	deps = deps || [];

	deps = prepareDeps(deps, meta);

	global.define = undefined;

	meta.deps = deps;

	return deps;

	},
	execute: function(depNames, load, global, exec) {
	if (!load.metadata.factory)
		return;
	var execs = prepareExecute(depNames, load);
	return load.metadata.factory.apply(global, execs.deps) || execs.module && execs.module.exports;
	}
};
})();
/*
SystemJS CommonJS Format
Provides the CommonJS module format definition at System.format.cjs
*/
(function() {
System.formats.push('cjs');

// CJS Module Format
// require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
var cjsExportsRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*|module\.)(exports\s*\[\s*('[^']+'|"[^"]+")\s*\]|\exports\s*\.\s*[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*|exports\s*\=)/;
var cjsRequireRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*)require\s*\(\s*("([^"]+)"|'([^']+)')\s*\)/g;
var commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

var noop = function() {}
var nodeProcess = {
	nextTick: function(f) {
	setTimeout(f, 7);
	},
	browser: true,
	env: {},
	argv: [],
	on: noop,
	once: noop,
	off: noop,
	emit: noop,
	cwd: function() { return '/' }
};
System.set('@@nodeProcess', Module(nodeProcess));

System.format.cjs = {
	detect: function(load) {
	cjsExportsRegEx.lastIndex = 0;
	cjsRequireRegEx.lastIndex = 0;
	return !!(cjsRequireRegEx.exec(load.source) || cjsExportsRegEx.exec(load.source));
	},
	deps: function(load, global) {
	cjsExportsRegEx.lastIndex = 0;
	cjsRequireRegEx.lastIndex = 0;

	var deps = [];

	// remove comments from the source first
	var source = load.source.replace(commentRegEx, '');

	var match;

	while (match = cjsRequireRegEx.exec(source))
		deps.push(match[2] || match[3]);

	load.metadata.deps = deps;

	return deps;
	},
	execute: function(depNames, load, global) {
	var dirname = load.address.split('/');
	dirname.pop();
	dirname = dirname.join('/');

	var deps = load.metadata.deps;

	var globals = global._g = {
		global: global,
		exports: {},
		process: nodeProcess,
		require: function(d) {
		var index = indexOf.call(deps, d);
		if (index != -1)
			return System.getModule(depNames[index]);
		},
		__filename: load.address,
		__dirname: dirname,
	};
	globals.module = { exports: globals.exports };

	var glString = '';
	for (var _g in globals)
		glString += 'var ' + _g + ' = _g.' + _g + ';';

	load.source = glString + load.source;

	System.__exec(load);

	global._g = undefined;

	return globals.module.exports;
	}
};
})();/*
SystemJS Global Format
Provides the global support at System.format.global
Supports inline shim syntax with:
	"global";
	"import jquery";
	"export my.Global";

Also detects writes to the global object avoiding global collisions.
See the SystemJS readme global support section for further information.
*/
(function() {
System.formats.push('global');

// Global
var globalShimRegEx = /(["']global["'];\s*)((['"]import [^'"]+['"];\s*)*)(['"]export ([^'"]+)["'])?/;
var globalImportRegEx = /(["']import [^'"]+)+/g;

// given a module's global dependencies, prepare the global object
// to contain the union of the defined properties of its dependent modules
var moduleGlobals = {};

// also support a System.shim system
System.shim = {};

System.format.global = {
	detect: function() {
	return true;
	},
	deps: function(load, global) {
	var match, deps;
	if (match = load.source.match(globalShimRegEx)) {
		deps = match[2].match(globalImportRegEx);
		if (deps)
		for (var i = 0; i < deps.length; i++)
			deps[i] = deps[i].substr(8);
		load.metadata.globalExport = match[5];
	}
	deps = deps || [];
	var shim;
	if (shim = System.shim[load.name]) {
		if (typeof shim == 'object') {
		if (shim.exports)
			load.metadata.globalExport = shim.exports;
		if (shim.deps || shim.imports)
			shim = shim.deps || shim.imports;
		}
		if (shim instanceof Array)
		deps = deps.concat(shim);
	}
	return deps;
	},
	execute: function(depNames, load, global) {
	var hasOwnProperty = global.hasOwnProperty;
	var globalExport = load.metadata.globalExport;

	// first, we add all the dependency module properties to the global
	for (var i = 0; i < depNames.length; i++) {
		var moduleGlobal = moduleGlobals[depNames[i]];
		if (moduleGlobal)
		for (var m in moduleGlobal)
			global[m] = moduleGlobal[m];
	}

	// now store a complete copy of the global object
	// in order to detect changes
	var globalObj = {};
	for (var g in global)
		if (!hasOwnProperty || global.hasOwnProperty(g))
		globalObj[g] = global[g];

	if (globalExport)
		load.source += '\nthis["' + globalExport + '"] = ' + globalExport;

	System.__exec(load);

	// check for global changes, creating the globalObject for the module
	// if many globals, then a module object for those is created
	// if one global, then that is the module directly
	var singleGlobal, moduleGlobal;
	if (globalExport) {
		var firstPart = globalExport.split('.')[0];
		singleGlobal = eval.call(global, globalExport);
		moduleGlobal = {};
		moduleGlobal[firstPart] = global[firstPart];
	}
	else {
		moduleGlobal = {};
		for (var g in global) {
		if (!hasOwnProperty && (g == 'sessionStorage' || g == 'localStorage' || g == 'clipboardData' || g == 'frames'))
			continue;
		if ((!hasOwnProperty || global.hasOwnProperty(g)) && g != global && globalObj[g] != global[g]) {
			moduleGlobal[g] = global[g];
			if (singleGlobal) {
			if (singleGlobal !== global[g])
				singleGlobal = false;
			}
			else if (singleGlobal !== false)
			singleGlobal = global[g];
		}
		}
	}
	moduleGlobals[load.name] = moduleGlobal;

	if (singleGlobal)
		return singleGlobal;
	else
		return new Module(moduleGlobal);
	}
};
})();/*
SystemJS map support

Provides map configuration through
	System.map['jquery'] = 'some/module/map'

As well as contextual map config through
	System.map['bootstrap'] = {
	jquery: 'some/module/map2'
	}

Note that this applies for subpaths, just like RequireJS

jquery      -> 'some/module/map'
jquery/path -> 'some/module/map/path'
bootstrap   -> 'bootstrap'

Inside any module name of the form 'bootstrap' or 'bootstrap/*'
	jquery    -> 'some/module/map2'
	jquery/p  -> 'some/module/map2/p'

Maps are carefully applied from most specific contextual map, to least specific global map
*/
(function() {

System.map = System.map || {};


// return the number of prefix parts (separated by '/') matching the name
// eg prefixMatchLength('jquery/some/thing', 'jquery') -> 1
function prefixMatchLength(name, prefix) {
	var prefixParts = prefix.split('/');
	var nameParts = name.split('/');
	if (prefixParts.length > nameParts.length)
	return 0;
	for (var i = 0; i < prefixParts.length; i++)
	if (nameParts[i] != prefixParts[i])
		return 0;
	return prefixParts.length;
}


// given a relative-resolved module name and normalized parent name,
// apply the map configuration
function applyMap(name, parentName) {

	var curMatch, curMatchLength = 0;
	var curParent, curParentMatchLength = 0;
	var subPath;
	var nameParts;

	// first find most specific contextual match
	if (parentName) {
	for (var p in System.map) {
		var curMap = System.map[p];
		if (typeof curMap != 'object')
		continue;

		// most specific parent match wins first
		if (prefixMatchLength(parentName, p) <= curParentMatchLength)
		continue;

		for (var q in curMap) {
		// most specific name match wins
		if (prefixMatchLength(name, q) <= curMatchLength)
			continue;

		curMatch = q;
		curMatchLength = q.split('/').length;
		curParent = p;
		curParentMatchLength = p.split('/').length;
		}
	}
	}

	// if we found a contextual match, apply it now
	if (curMatch) {
	nameParts = name.split('/');
	subPath = nameParts.splice(curMatchLength, nameParts.length - curMatchLength).join('/');
	name = System.map[curParent][curMatch] + (subPath ? '/' + subPath : '');
	curMatchLength = 0;
	}

	// now do the global map
	for (var p in System.map) {
	var curMap = System.map[p];
	if (typeof curMap != 'string')
		continue;

	if (prefixMatchLength(name, p) <= curMatchLength)
		continue;

	curMatch = p;
	curMatchLength = p.split('/').length;
	}

	// return a match if any
	if (!curMatchLength)
	return name;

	nameParts = name.split('/');
	subPath = nameParts.splice(curMatchLength, nameParts.length - curMatchLength).join('/');
	return System.map[curMatch] + (subPath ? '/' + subPath : '');
}

var systemNormalize = System.normalize;
var mapped = {};
System.normalize = function(name, parentName, parentAddress) {
	return Promise.resolve(systemNormalize.call(System, name, parentName, parentAddress))
	.then(function(name) {
	return applyMap(name, parentName);
	});
}
})();
/*
SystemJS Plugin Support

Supports plugin syntax with "!"

The plugin name is loaded as a module itself, and can override standard loader hooks
for the plugin resource. See the plugin section of the systemjs readme.
*/
(function() {
var systemNormalize = System.normalize;
System.normalize = function(name, parentName, parentAddress) {
	// if parent is a plugin, normalize against the parent plugin argument only
	var parentPluginIndex;
	if (parentName && (parentPluginIndex = parentName.indexOf('!')) != -1)
	parentName = parentName.substr(0, parentPluginIndex);

	return Promise.resolve(systemNormalize(name, parentName, parentAddress))
	.then(function(name) {
	// if this is a plugin, normalize the plugin name and the argument
	var pluginIndex = name.lastIndexOf('!');
	if (pluginIndex != -1) {
		var argumentName = name.substr(0, pluginIndex);

		// plugin name is part after "!" or the extension itself
		var pluginName = name.substr(pluginIndex + 1) || argumentName.substr(argumentName.lastIndexOf('.') + 1);

		// normalize the plugin name relative to the same parent
		return new Promise(function(resolve) {
		resolve(System.normalize(pluginName, parentName, parentAddress));
		})
		// normalize the plugin argument
		.then(function(_pluginName) {
		pluginName = _pluginName;
		return System.normalize(argumentName, parentName, parentAddress);
		})
		.then(function(argumentName) {
		return argumentName + '!' + pluginName;
		});
	}

	// standard normalization
	return name;
	});
}

var systemLocate = System.locate;
System.locate = function(load) {
	var name = load.name;

	// plugin
	var pluginIndex = name.lastIndexOf('!');
	if (pluginIndex != -1) {
	var pluginName = name.substr(pluginIndex + 1);

	// the name to locate is the plugin argument only
	load.name = name.substr(0, pluginIndex);

	// load the plugin module
	return System.load(pluginName)
	.then(function() {
		var plugin = System.get(pluginName);
		plugin = plugin['default'] || plugin;

		// store the plugin module itself on the metadata
		load.metadata.plugin = plugin;
		load.metadata.pluginName = pluginName;
		load.metadata.pluginArgument = load.name;

		// run plugin locate if given
		if (plugin.locate)
		return plugin.locate.call(System, load);

		// otherwise use standard locate without '.js' extension adding
		else
		return new Promise(function(resolve) {
			resolve(System.locate(load));
		})
		.then(function(address) {
			return address.substr(0, address.length - 3);
		});
	});
	}

	return systemLocate.call(this, load);
}

var systemFetch = System.fetch;
System.fetch = function(load) {
	// support legacy plugins
	var self = this;
	if (typeof load.metadata.plugin == 'function') {
	return new Promise(function(fulfill, reject) {
		load.metadata.plugin(load.metadata.pluginArgument, load.address, function(url, callback, errback) {
		systemFetch.call(self, { name: load.name, address: url, metadata: {} }).then(callback, errback);
		}, fulfill, reject);
	});
	}
	return (load.metadata.plugin && load.metadata.plugin.fetch || systemFetch).call(this, load);
}

var systemTranslate = System.translate;
System.translate = function(load) {
	var plugin = load.metadata.plugin;
	if (plugin && plugin.translate)
	return plugin.translate.call(this, load);

	return systemTranslate.call(this, load);
}

})();/*
System bundles

Allows a bundle module to be specified which will be dynamically
loaded before trying to load a given module.

For example:
System.bundles['mybundle'] = ['jquery', 'bootstrap/js/bootstrap']

Will result in a load to "mybundle" whenever a load to "jquery"
or "bootstrap/js/bootstrap" is made.

In this way, the bundle becomes the request that provides the module
*/

(function() {

// bundles support (just like RequireJS)
// bundle name is module name of bundle itself
// bundle is array of modules defined by the bundle
// when a module in the bundle is requested, the bundle is loaded instead
// of the form System.bundles['mybundle'] = ['jquery', 'bootstrap/js/bootstrap']
System.bundles = System.bundles || {};

var systemFetch = System.fetch;
System.fetch = function(load) {
	// if this module is in a bundle, load the bundle first then
	for (var b in System.bundles) {
	if (indexOf.call(System.bundles[b], load.name) == -1)
		continue;
	// we do manual normalization in case the bundle is mapped
	// this is so we can still know the normalized name is a bundle
	return Promise.resolve(System.normalize(b))
	.then(function(normalized) {
		System.bundles[normalized] = System.bundles[normalized] || System.bundles[b];
		return System.load(normalized);
	})
	.then(function() {
		return '';
	});
	}
	return systemFetch.apply(this, arguments);
}

var systemLocate = System.locate;
System.locate = function(load) {
	if (System.bundles[load.name])
	load.metadata.bundle = true;
	return systemLocate.call(this, load);
}

var systemInstantiate = System.instantiate;
System.instantiate = function(load) {
	// if it is a bundle itself, it doesn't define anything
	if (load.metadata.bundle)
	return {
		deps: [],
		execute: function() {
		System.__exec(load);
		return new Module({});
		}
	};

	return systemInstantiate.apply(this, arguments);
}

})();
/*
Implementation of the System.register bundling method

This allows the output of Traceur to populate the
module registry of the System loader
*/

(function() {

// instantiation cache for System.register
System.defined = {};

// register a new module for instantiation
System.register = function(name, deps, execute) {
	System.defined[name] = {
	deps: deps,
	execute: function() {
		return Module(execute.apply(this, arguments));
	}
	};
}

var systemFetch = System.fetch;
System.fetch = function(load) {
	// if the module is already defined, skip fetch
	if (System.defined[load.name])
	return '';
	return systemFetch.apply(this, arguments);
}

var systemInstantiate = System.instantiate;
System.instantiate = function(load) {
	// if the module has been defined by a bundle, use that
	if (System.defined[load.name]) {
	var instantiateResult = System.defined[load.name];
	delete System.defined[load.name];
	return instantiateResult;
	}

	return systemInstantiate.apply(this, arguments);
}

})();
/*
SystemJS Semver Version Addon

1. Uses Semver convention for major and minor forms

Supports requesting a module from a package that contains a version suffix
with the following semver ranges:
	module       - any version
	module@1     - major version 1, any minor (not prerelease)
	module@1.2   - minor version 1.2, any patch (not prerelease)
	module@1.2.3 - exact version

It is assumed that these modules are provided by the server / file system.

First checks the already-requested packages to see if there are any packages
that would match the same package and version range.

This provides a greedy algorithm as a simple fix for sharing version-managed
dependencies as much as possible, which can later be optimized through version
hint configuration created out of deeper version tree analysis.

2. Semver-compatibility syntax (caret operator - ^)

Compatible version request support is then also provided for:

	module@^1.2.3        - module@1, >=1.2.3
	module@^1.2          - module@1, >=1.2.0
	module@^1            - module@1
	module@^0.5.3        - module@0.5, >= 0.5.3
	module@^0.0.1        - module@0.0.1

The ^ symbol is always normalized out to a normal version request.

This provides comprehensive semver compatibility.

3. System.versions version hints and version report

Note this addon should be provided after all other normalize overrides.

The full list of versions can be found at System.versions providing an insight
into any possible version forks.

It is also possible to create version solution hints on the System global:

System.versions = {
	jquery: ['1.9.2', '2.0.3'],
	bootstrap: '3.0.1'
};

Versions can be an array or string for a single version.

When a matching semver request is made (jquery@1.9, jquery@1, bootstrap@3)
they will be converted to the latest version match contained here, if present.

Prereleases in this versions list are also allowed to satisfy ranges when present.
*/

(function() {
// match x, x.y, x.y.z, x.y.z-prerelease.1
var semverRegEx = /^(\d+)(?:\.(\d+)(?:\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?)?)?$/;

var semverCompare = function(v1, v2) {
	var v1Parts = v1.split('.');
	var v2Parts = v2.split('.');
	var prereleaseIndex;
	if (v1Parts[2] && (prereleaseIndex = indexOf.call(v1Parts[2], '-')) != -1)
	v1Parts.splice(2, 1, v1Parts[2].substr(0, prereleaseIndex), v1Parts[2].substr(prereleaseIndex + 1));
	if (v2Parts[2] && (prereleaseIndex = indexOf.call(v2Parts[2], '-')) != -1)
	v2Parts.splice(2, 1, v2Parts[2].substr(0, prereleaseIndex), v2Parts[2].substr(prereleaseIndex + 1));
	for (var i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
	if (!v1Parts[i])
		return 1;
	else if (!v2Parts[i])
		return -1;
	if (v1Parts[i] != v2Parts[i])
		return parseInt(v1Parts[i]) > parseInt(v2Parts[i]) ? 1 : -1;
	}
	return 0;
}

var systemNormalize = System.normalize;

System.versions = System.versions || {};

// hook normalize and store a record of all versioned packages
System.normalize = function(name, parentName, parentAddress) {
	var packageVersions = System.versions;
	// run all other normalizers first
	return Promise.resolve(systemNormalize.call(this, name, parentName, parentAddress)).then(function(normalized) {

	var version, semverMatch, nextChar, versions;
	var index = normalized.indexOf('@');

	// see if this module corresponds to a package already in our versioned packages list

	// no version specified - check against the list (given we don't know the package name)
	if (index == -1) {
		for (var p in packageVersions) {
		versions = packageVersions[p];
		if (normalized.substr(0, p.length) != p)
			continue;

		nextChar = normalized.substr(p.length, 1);

		if (nextChar && nextChar != '/')
			continue;

		// match -> take latest version
		return p + '@' + (typeof versions == 'string' ? versions : versions[versions.length - 1]) + normalized.substr(p.length);
		}
		return normalized;
	}

	// get the version info
	version = normalized.substr(index + 1).split('/')[0];
	var versionLength = version.length;

	var minVersion;
	if (version.substr(0, 1) == '^') {
		version = version.substr(1);
		minVersion = true;
	}

	semverMatch = version.match(semverRegEx);

	// if not a semver, we cant help
	if (!semverMatch)
		return normalized;

	// translate '^' in range to simpler range form
	if (minVersion) {
		// ^0 -> 0
		// ^1 -> 1
		if (!semverMatch[2])
		minVersion = false;

		if (!semverMatch[3]) {

		// ^1.1 -> ^1.1.0
		if (semverMatch[2] > 0)
			semverMatch[3] = '0';

		// ^0.1 -> 0.1
		// ^0.0 -> 0.0
		else
			minVersion = false;
		}
	}

	if (minVersion) {
		// >= 1.0.0
		if (semverMatch[1] > 0) {
		if (!semverMatch[2])
			version = semverMatch[1] + '.0.0';
		if (!semverMatch[3])
			version = semverMatch[1] + '.0';
		minVersion = version;
		semverMatch = [semverMatch[1]];
		}
		// >= 0.1.0
		else if (semverMatch[2] > 0) {
		minVersion = version;
		semverMatch = [0, semverMatch[2]];
		}
		// >= 0.0.0
		else {
		// NB compatible with prerelease is just prelease itself?
		minVersion = false;
		semverMatch = [0, 0, semverMatch[3]];
		}
		version = semverMatch.join('.');
	}

	var packageName = normalized.substr(0, index);

	versions = packageVersions[packageName] || [];

	if (typeof versions == 'string')
		versions = [versions];

	// look for a version match
	// if an exact semver, theres nothing to match, just record it
	if (!semverMatch[3] || minVersion)
		for (var i = versions.length - 1; i >= 0; i--) {
		var curVersion = versions[i];
		// if I have requested x.y, find an x.y.z-b
		// if I have requested x, find any x.y / x.y.z-b
		if (curVersion.substr(0, version.length) == version && curVersion.substr(version.length, 1).match(/^[\.\-]?$/)) {
			// if a minimum version, then check too
			if (!minVersion || minVersion && semverCompare(curVersion, minVersion) != -1)
			return packageName + '@' + curVersion + normalized.substr(packageName.length + versionLength + 1);
		}
		}

	// no match
	// record the package and semver for reuse since we're now asking the server
	// x.y and x versions will now be latest by default, so they are useful in the version list
	if (indexOf.call(versions, version) == -1) {
		versions.push(version);
		versions.sort(semverCompare);

		normalized = packageName + '@' + version + normalized.substr(packageName.length + versionLength + 1);

		// if this is an x.y.z, remove any x.y, x
		// if this is an x.y, remove any x
		if (semverMatch[3] && (index = indexOf.call(versions, semverMatch[1] + '.' + semverMatch[2])) != -1)
		versions.splice(index, 1);
		if (semverMatch[2] && (index = indexOf.call(versions, semverMatch[1])) != -1)
		versions.splice(index, 1);

		packageVersions[packageName] = versions.length == 1 ? versions[0] : versions;
	}

	return normalized;
	});
}

})();
};

(function() {
if (!global.System || global.System.registerModule) {
	if (typeof window != 'undefined') {
	// determine the current script path as the base path
	var scripts = document.getElementsByTagName('script');
	var curPath = scripts[scripts.length - 1].src;
	var basePath = curPath.substr(0, curPath.lastIndexOf('/') + 1);
	document.write(
		'<' + 'script type="text/javascript" src="' + basePath + 'es6-module-loader.js" data-init="upgradeSystemLoader">' + '<' + '/script>'
	);
	}
	else {
	var es6ModuleLoader = require('es6-module-loader');
	global.System = es6ModuleLoader.System;
	global.Loader = es6ModuleLoader.Loader;
	global.Module = es6ModuleLoader.Module;
	module.exports = global.System;
	global.upgradeSystemLoader();
	}
}
else {
	global.upgradeSystemLoader();
}
})();


})(typeof window != 'undefined' ? window : global);
