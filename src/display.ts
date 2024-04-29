import {EventDispatcher, FbEvent, FbMouseEvent} from 'src/event';
import {Point, Rectangle, Transform} from './geometry';

const BlendMode = {
	NORMAL: 'normal',
	ADD: 'add',
	SUBTRACT: 'subtract',
	MULTIPLY: 'multiply',
	SCREEN: 'screen',

	ERASE: 'erase',
	ALPHA: 'alpha',
};

/**
 * A basic class in the Display API
 *
 * @author origin: Ivan Kuckir
 */

export class DisplayObject extends EventDispatcher {
	visible = true;
	parent: DisplayObject = null;
	stage: Stage = null;
	blendMode = BlendMode.NORMAL;

	//*
	//	for fast access
	x = 0;
	y = 0;
	z = 0;
	transform: Transform;
	protected _trect: Rectangle;
	protected _tempP: Point;
	private _torg: Float32Array;
	public _tvec4_0: Float32Array;
	public _tvec4_1: Float32Array;
	private _atsEv: FbEvent;
	private _rfsEv: FbEvent;
	private _tempm: Float32Array;
	static _tdo: DisplayObject;
	//*/

	constructor() {
		super();
		this.transform = new Transform();
		this.transform._obj = this;

		this._trect = new Rectangle(); // temporary rectangle

		this._tempP = new Point();
		this._torg = Point._v4.create();
		this._tvec4_0 = Point._v4.create();
		this._tvec4_1 = Point._v4.create();

		this._tempm = Point._m4.create();

		this._atsEv = new FbEvent(FbEvent.ADDED_TO_STAGE);
		this._rfsEv = new FbEvent(FbEvent.REMOVED_FROM_STAGE);
		this._atsEv.target = this._rfsEv.target = this;
	}

	dispatchEvent(e: FbEvent) {
		// : returns the deepest active InteractiveObject of subtree
		EventDispatcher.prototype.dispatchEvent.call(this, e);
		if (e.bubbles && this.parent != null) this.parent.dispatchEvent(e);
	}

	_globalToLocal(sp: Point, tp: Point) {
		// OK
		var org = this._torg;
		Stage._main._getOrigin(org);
		Point._m4.multiplyVec4(this._getAIMat(), org, org);

		var p1 = this._tvec4_1;
		p1[0] = sp.x;
		p1[1] = sp.y;
		p1[2] = 0;
		p1[3] = 1;
		Point._m4.multiplyVec4(this._getAIMat(), p1, p1);

		this._lineIsc(org, p1, tp);
	}

	globalToLocal(p: Point) {
		// OK
		var lp = new Point();
		this._globalToLocal(p, lp);
		return lp;
	}

	localToGlobal(p: Point) {
		// OK
		var org = this._torg;
		Stage._main._getOrigin(org);

		var p1 = this._tvec4_1;
		p1[0] = p.x;
		p1[1] = p.y;
		p1[2] = 0;
		p1[3] = 1;
		Point._m4.multiplyVec4(this._getATMat(), p1, p1);

		var lp = new Point();
		this._lineIsc(org, p1, lp);
		return lp;
	}

	// Intersection between line p0, p1 and plane z=0  (result has z==0)

	_lineIsc(p0: Float32Array, p1: Float32Array, tp: Point) {
		var dx = p1[0] - p0[0],
			dy = p1[1] - p0[1],
			dz = p1[2] - p0[2];

		var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
		dx /= len;
		dy /= len;
		dz /= len;

		var d = -p0[2] / dz;
		tp.x = p0[0] + d * dx;
		tp.y = p0[1] + d * dy;
	}

	_transfRect(
		mat: Float32Array,
		torg: Float32Array,
		srct: Rectangle,
		trct: Rectangle
	) {
		var sp = this._tvec4_0;
		var tp = this._tvec4_1;
		var p = new Point();
		var minx = Infinity,
			miny = Infinity,
			maxx = -Infinity,
			maxy = -Infinity;

		sp[0] = srct.x;
		sp[1] = srct.y;
		sp[2] = 0;
		sp[3] = 1;
		Point._m4.multiplyVec4(mat, sp, tp);
		this._lineIsc(torg, tp, p);
		minx = Math.min(minx, p.x);
		miny = Math.min(miny, p.y);
		maxx = Math.max(maxx, p.x);
		maxy = Math.max(maxy, p.y);

		sp[0] = srct.x + srct.width;
		sp[1] = srct.y;
		sp[2] = 0;
		sp[3] = 1;
		Point._m4.multiplyVec4(mat, sp, tp);
		this._lineIsc(torg, tp, p);
		minx = Math.min(minx, p.x);
		miny = Math.min(miny, p.y);
		maxx = Math.max(maxx, p.x);
		maxy = Math.max(maxy, p.y);

		sp[0] = srct.x;
		sp[1] = srct.y + srct.height;
		sp[2] = 0;
		sp[3] = 1;
		Point._m4.multiplyVec4(mat, sp, tp);
		this._lineIsc(torg, tp, p);
		minx = Math.min(minx, p.x);
		miny = Math.min(miny, p.y);
		maxx = Math.max(maxx, p.x);
		maxy = Math.max(maxy, p.y);

		sp[0] = srct.x + srct.width;
		sp[1] = srct.y + srct.height;
		sp[2] = 0;
		sp[3] = 1;
		Point._m4.multiplyVec4(mat, sp, tp);
		this._lineIsc(torg, tp, p);
		minx = Math.min(minx, p.x);
		miny = Math.min(miny, p.y);
		maxx = Math.max(maxx, p.x);
		maxy = Math.max(maxy, p.y);

		trct.x = minx;
		trct.y = miny;
		trct.width = maxx - minx;
		trct.height = maxy - miny;
	}

	/** TODO */
	_getLocRect(): Rectangle {
		return new Rectangle();
	}

	//  Returns bounding rectangle
	// 		tmat : matrix from global to target local
	// 		torg : origin in tmat coordinates
	//		result: read-only

	_getRect(tmat: Float32Array, torg: Float32Array, stks: unknown) {
		Point._m4.multiply(tmat, this._getATMat(), this._tempm);
		this._transfRect(this._tempm, torg, this._getLocRect(), this._trect);
		return this._trect;
	}

	_getR(tcs: DisplayObject, stks: unknown) {
		Stage._main._getOrigin(this._torg);
		Point._m4.multiplyVec4(tcs._getAIMat(), this._torg, this._torg);
		return this._getRect(tcs._getAIMat(), this._torg, stks);
	}

	_getParR(tcs: DisplayObject, stks: unknown) {
		if (DisplayObject._tdo == null) DisplayObject._tdo = new DisplayObject();
		var nopar = this.parent == null;
		if (nopar) this.parent = DisplayObject._tdo;
		var out = this._getR(this.parent, stks);
		if (nopar) this.parent = null;
		return out;
	}

	// no strokes
	getRect(tcs: DisplayObject) {
		return this._getR(tcs, false).clone();
	}
	// with strokes
	getBounds(tcs: DisplayObject) {
		return this._getR(tcs, true).clone();
	}

	//  Check, whether object hits a line org, p in local coordinate system

	_htpLocal(org: Float32Array, p: Float32Array) {
		var tp = this._tempP;
		this._lineIsc(org, p, tp);
		return this._getLocRect().contains(tp.x, tp.y);
	}

	//  tests, if object intersects a point in Stage coordinates

	hitTestPoint(x: number, y: number, shapeFlag: boolean) {
		if (shapeFlag == null) shapeFlag = false;

		var org = this._torg;
		Stage._main._getOrigin(org);
		Point._m4.multiplyVec4(this._getAIMat(), org, org);

		var p1 = this._tvec4_1;
		p1[0] = x;
		p1[1] = y;
		p1[2] = 0;
		p1[3] = 1;
		Point._m4.multiplyVec4(this._getAIMat(), p1, p1);

		//  org and p1 are in local coordinates
		//  now we have to decide, if line (p0, p1) intersects an object

		if (shapeFlag) return this._htpLocal(org, p1);
		else return this._getR(Stage._main, false).contains(x, y);
	}

	hitTestObject(obj: DisplayObject) {
		var r0 = this._getR(Stage._main, false);
		var r1 = obj._getR(Stage._main, false);
		return r0.intersects(r1);
	}

	_loseFocus() {}

	/*
		Returns the deepest InteractiveObject of subtree with mouseEnabled = true  OR itself, if "hit over" and mouseEnabled = false
	*/

	/** @override */
	_getTarget(porg: Float32Array, pp: Float32Array): DisplayObject {
		return null;
	}

	_setStage(st: Stage) {
		var pst = this.stage; // previous stage
		this.stage = st;
		if (pst == null && st != null) this.dispatchEvent(this._atsEv);
		if (pst != null && st == null) this.dispatchEvent(this._rfsEv);
	}

	/**
	 * This method adds a drawing matrix onto the OpenGL stack
	 */
	_preRender(st: Stage) {
		var m = this.transform._getTMat();
		st._mstack.push(m);
		st._cmstack.push(
			this.transform._cmat,
			this.transform._cvec,
			this.transform._cID,
			this.blendMode
		);
	}

	/**
	 * This method renders the current content
	 */
	_render(st: Stage) {}

	/**
	 * This method renders the whole object
	 */
	_renderAll(st: Stage) {
		if (!this.visible) return;

		this._preRender(st);
		this._render(st);
		st._mstack.pop();
		st._cmstack.pop();
	}

	/**
	 * Absolute Transform matrix
	 */
	_getATMat() {
		if (this.parent == null) return this.transform._getTMat();
		Point._m4.multiply(
			this.parent._getATMat(),
			this.transform._getTMat(),
			this.transform._atmat
		);
		return this.transform._atmat;
	}

	/**
	 * Absolute Inverse Transform matrix
	 */
	_getAIMat() {
		if (this.parent == null) return this.transform._getIMat();
		Point._m4.multiply(
			this.transform._getIMat(),
			this.parent._getAIMat(),
			this.transform._aimat
		);
		return this.transform._aimat;
	}

	_getMouse() {
		var lp = this._tempP;
		lp.setTo(Stage._mouseX, Stage._mouseY);
		this._globalToLocal(lp, lp);
		return lp;
	}
}

/*
this.dp = DisplayObject.prototype;
dp.ds = dp.__defineSetter__;
dp.dg = dp.__defineGetter__;
*/

/*
	dp.ds("x", function(x){this.transform._tmat[12] = x; this.transform._imat[12] = -x;});
	dp.ds("y", function(y){this.transform._tmat[13] = y; this.transform._imat[13] = -y;});
	dp.ds("z", function(z){this.transform._tmat[14] = z; this.transform._imat[14] = -z;});
	dp.dg("x", function( ){return this.transform._tmat[12];});
	dp.dg("y", function( ){return this.transform._tmat[13];});
	dp.dg("z", function( ){return this.transform._tmat[14];});
	//*/

/*
dp.ds('scaleX', function (sx) {
	this.transform._checkVals();
	this.transform._scaleX = sx;
	this.transform._mdirty = true;
});
dp.ds('scaleY', function (sy) {
	this.transform._checkVals();
	this.transform._scaleY = sy;
	this.transform._mdirty = true;
});
dp.ds('scaleZ', function (sz) {
	this.transform._checkVals();
	this.transform._scaleZ = sz;
	this.transform._mdirty = true;
});
dp.dg('scaleX', function () {
	this.transform._checkVals();
	return this.transform._scaleX;
});
dp.dg('scaleY', function () {
	this.transform._checkVals();
	return this.transform._scaleY;
});
dp.dg('scaleZ', function () {
	this.transform._checkVals();
	return this.transform._scaleZ;
});

dp.ds('rotationX', function (r) {
	this.transform._checkVals();
	this.transform._rotationX = r;
	this.transform._mdirty = true;
});
dp.ds('rotationY', function (r) {
	this.transform._checkVals();
	this.transform._rotationY = r;
	this.transform._mdirty = true;
});
dp.ds('rotationZ', function (r) {
	this.transform._checkVals();
	this.transform._rotationZ = r;
	this.transform._mdirty = true;
});
dp.ds('rotation', function (r) {
	this.transform._checkVals();
	this.transform._rotationZ = r;
	this.transform._mdirty = true;
});
dp.dg('rotationX', function () {
	this.transform._checkVals();
	return this.transform._rotationX;
});
dp.dg('rotationY', function () {
	this.transform._checkVals();
	return this.transform._rotationY;
});
dp.dg('rotationZ', function () {
	this.transform._checkVals();
	return this.transform._rotationZ;
});
dp.dg('rotation', function () {
	this.transform._checkVals();
	return this.transform._rotationZ;
});

dp.ds('width', function (w) {
	var ow = this.width;
	this.transform._postScale(w / ow, 1);
});
dp.ds('height', function (h) {
	var oh = this.height;
	this.transform._postScale(1, h / oh);
});

dp.dg('width', function () {
	this.transform._checkVals();
	return this._getParR(this, true).width;
});
dp.dg('height', function () {
	this.transform._checkVals();
	return this._getParR(this, true).height;
});

dp.ds('alpha', function (a) {
	this.transform._cmat[15] = a;
	this.transform._checkColorID();
});
dp.dg('alpha', function () {
	return this.transform._cmat[15];
});

dp.dg('mouseX', function () {
	return this._getMouse().x;
});
dp.dg('mouseY', function () {
	return this._getMouse().y;
});

delete dp.ds;
delete dp.dg;
delete this.dp;
*/

export class InteractiveObject extends DisplayObject {
	buttonMode = false;
	mouseEnabled = true;
	mouseChildren = true;

	_getTarget(porg: Float32Array, pp: Float32Array): DisplayObject {
		if (!this.visible || !this.mouseEnabled) return null;

		var r = this._getLocRect();
		if (r == null) return null;

		var org = this._tvec4_0,
			p = this._tvec4_1;
		Point._m4.multiplyVec4(this.transform._getIMat(), porg, org);
		Point._m4.multiplyVec4(this.transform._getIMat(), pp, p);

		var pt = this._tempP;
		this._lineIsc(org, p, pt);

		if (r.contains(pt.x, pt.y)) return this;
		return null;
	}
}

/**
 * A basic container class in the Display API
 *
 * @author Ivan Kuckir
 * @version 1.0
 */
export class DisplayObjectContainer extends InteractiveObject {
	_tempR = new Rectangle();

	numChildren = 0;
	_children: DisplayObject[] = [];

	_getRect(tmat: Float32Array, torg: Float32Array, stks: DisplayObject) {
		var r = this._trect;
		r.setEmpty();

		for (var i = 0; i < this.numChildren; i++) {
			var ch = this._children[i];
			if (!ch.visible) continue;
			r._unionWith(ch._getRect(tmat, torg, stks));
		}
		return r;
	}

	_htpLocal(org: Float32Array, p: Float32Array) {
		var n = this._children.length;
		for (var i = 0; i < n; i++) {
			var ch = this._children[i];
			if (!ch.visible) continue;
			var corg = ch._tvec4_0,
				cp = ch._tvec4_1,
				im = ch.transform._getIMat();
			Point._m4.multiplyVec4(im, org, corg);
			Point._m4.multiplyVec4(im, p, cp);
			return ch._htpLocal(corg, cp);
		}
		return false;
	}

	/**
	 * Adds a child to the container
	 *
	 * @param o	a chil object to be added
	 */
	addChild(o: DisplayObject) {
		this._children.push(o);
		o.parent = this;
		o._setStage(this.stage);
		++this.numChildren;
	}

	/**
	 * Removes a child from the container
	 *
	 * @param o	a child object to be removed
	 */
	removeChild(o: DisplayObject) {
		var ind = this._children.indexOf(o);
		if (ind < 0) return;
		this._children.splice(ind, 1);
		o.parent = null;
		o._setStage(null);
		--this.numChildren;
	}

	removeChildAt(i: number) {
		this.removeChild(this._children[i]);
	}

	/**
	 * Checks, if a container contains a certain child
	 *
	 * @param o	an object for which we check, if it is contained or not
	 * @return	true if contains, false if not
	 */
	contains(o: DisplayObject) {
		return this._children.indexOf(o) >= 0;
	}

	getChildIndex(o: DisplayObject) {
		return this._children.indexOf(o);
	}

	/**
	 * Sets the child index in the current children list.
	 * Child index represents a "depth" - an order, in which children are rendered
	 *
	 * @param c1	a child object
	 * @param i2	a new depth value
	 */
	setChildIndex(c1: DisplayObject, i2: number) {
		var i1 = this._children.indexOf(c1);

		if (i2 > i1) {
			for (var i = i1 + 1; i <= i2; i++)
				this._children[i - 1] = this._children[i];
			this._children[i2] = c1;
		} else if (i2 < i1) {
			for (var i = i1 - 1; i >= i2; i--)
				this._children[i + 1] = this._children[i];
			this._children[i2] = c1;
		}
	}

	/**
	 * Returns the child display object instance that exists at the specified index.
	 *
	 * @param i	index (depth)
	 * @return	an object at this index
	 */
	getChildAt(i: number) {
		return this._children[i];
	}

	_render(st: Stage) {
		for (var i = 0; i < this.numChildren; i++) this._children[i]._renderAll(st);
	}

	_getTarget(porg: Float32Array, pp: Float32Array): DisplayObject {
		// parent origin, parent point
		if (!this.visible || (!this.mouseChildren && !this.mouseEnabled))
			return null;

		var org = this._tvec4_0,
			p = this._tvec4_1,
			im = this.transform._getIMat();
		Point._m4.multiplyVec4(im, porg, org);
		Point._m4.multiplyVec4(im, pp, p);

		var topTGT: DisplayObject = null;
		var n = this.numChildren - 1;

		for (var i = n; i > -1; i--) {
			var ntg = this._children[i]._getTarget(org, p);
			if (ntg != null) {
				topTGT = ntg;
				break;
			}
		}
		if (!this.mouseChildren && topTGT != null) return this;
		return topTGT;
	}

	/*
		Check, whether object hits pt[0], pt[1] in parent coordinate system
	*/

	_setStage(st: Stage) {
		super._setStage(st);
		for (var i = 0; i < this.numChildren; i++) this._children[i]._setStage(st);
	}
}

var gl;

class Stage extends DisplayObjectContainer {
	stageWidth: number;
	stageHeight: number;
	static _main: Stage;
	_mcEvs: FbMouseEvent[];
	_mdEvs: FbMouseEvent[];
	_muEvs: FbMouseEvent[];
	_smd: boolean[];
	_smu: boolean[];
	_smm: boolean;
	_srs: boolean;
	_touches: {};
	_canvas: any;
	canvas: any;
	static _CMStack: any;
	_cmstack: any;
	_mstack: any;
	focus: null;
	_focii: any[];
	_mousefocus: null;
	_knM: boolean;
	_sprg: null;
	_svec4_0: Float32Array;
	_svec4_1: Float32Array;
	/** project matrix */
	_pmat: Float32Array;
	/** unit matrix */
	_umat: Float32Array;

	/** scale matrix */
	_smat: Float32Array;
	constructor(canvID: string) {
		super();

		/*
		document.body.setAttribute("style", "margin:0; overflow:hidden");
		*/

		//<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>

		/*
		var meta = document.createElement('meta');
		meta.setAttribute("name", "viewport");
		meta.setAttribute("content", "width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0");
		document.getElementsByTagName('head')[0].appendChild(meta);
		*/

		this.stage = this;

		this.stageWidth = 0;
		this.stageHeight = 0;

		this.focus = null; // keyboard focus, never Stage
		this._focii = [null, null, null];
		this._mousefocus = null; // mouse focus of last mouse move, used to detect MOUSE_OVER / OUT, never Stage

		this._knM = false; // know mouse
		this._mstack = new Stage._MStack(); // transform matrix stack
		this._cmstack = new Stage._CMStack(); // color matrix stack
		this._sprg = null;

		this._svec4_0 = Point._v4.create();
		this._svec4_1 = Point._v4.create();

		/**
		 * project matrix
		 */
		this._pmat = Point._m4.create([
			1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1,
		]); // project matrix

		/**
		 * Unit matrix
		 */
		this._umat = Point._m4.create([
			2, 0, 0, 0, 0, -2, 0, 0, 0, 0, 2, 0, -1, 1, 0, 1,
		]); // unit matrix

		/**
		 * scale matrix
		 */
		this._smat = Point._m4.create([
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.001, 0, 0, 0, 0, 1,
		]); // scale matrix

		//this._efEv = new Event(Event.ENTER_FRAME);
		//this._rsEv = new Event(Event.RESIZE);

		this._mcEvs = [
			new FbMouseEvent(FbMouseEvent.CLICK, true),
			new FbMouseEvent(FbMouseEvent.MIDDLE_CLICK, true),
			new FbMouseEvent(FbMouseEvent.RIGHT_CLICK, true),
		];

		this._mdEvs = [
			new FbMouseEvent(FbMouseEvent.MOUSE_DOWN, true),
			new FbMouseEvent(FbMouseEvent.MIDDLE_MOUSE_DOWN, true),
			new FbMouseEvent(FbMouseEvent.RIGHT_MOUSE_DOWN, true),
		];

		this._muEvs = [
			new FbMouseEvent(FbMouseEvent.MOUSE_UP, true),
			new FbMouseEvent(FbMouseEvent.MIDDLE_MOUSE_UP, true),
			new FbMouseEvent(FbMouseEvent.RIGHT_MOUSE_UP, true),
		];

		this._smd = [false, false, false]; // stage mouse down, for each mouse button
		this._smu = [false, false, false]; // stage mouse up, for each mouse button

		this._smm = false; // stage mouse move
		this._srs = false; // stage resized
		this._touches = {};
		//this._touches = [];
		//for(var i=0; i<30; i++) this._touches.push({touch:null, target:null, act:0});	// down: 0 - nothing, 1 - is down, 2 - was moved, 3 - is up

		this._canvas = this.canvas = document.getElementById(canvID);
		//this.canvas.setAttribute("style", "user-select: none;");

		Stage._main = this;

		var par = {
			alpha: true,
			antialias: true,
			depth: true,
			premultipliedAlpha: true,
		};
		var c = this.canvas;
		gl = c.getContext('webgl', par);
		if (!gl) gl = c.getContext('experimental-webgl', par);
		if (!gl)
			alert(
				'Could not initialize WebGL. Try to update your browser or graphic drivers.'
			);

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		//if(WebGLDebugUtils) WebGLDebugUtils.makeDebugContext(gl);

		//c.style["-webkit-user-select"] = "none";

		/*
		var d = document;
		d.addEventListener('contextmenu', Stage._ctxt, false);
		d.addEventListener('dragstart', Stage._blck, false);

		//if(Stage._isTD())
		{
			c.addEventListener('touchstart', Stage._onTD, false);
			c.addEventListener('touchmove', Stage._onTM, false);
			c.addEventListener('touchend', Stage._onTU, false);
			d.addEventListener('touchstart', Stage._blck, false);
			c.addEventListener('touchmove', Stage._blck, false);
			c.addEventListener('touchend', Stage._blck, false);
		}
		//else
		{
			c.addEventListener('mousedown', Stage._onMD, false);
			c.addEventListener('mousemove', Stage._onMM, false);
			c.addEventListener('mouseup', Stage._onMU, false);
			//c.addEventListener("mousedown",		Stage._blck, false);	// prevents IFRAME from getting focus = receiving keyboard events
			c.addEventListener('mousemove', Stage._blck, false);
			c.addEventListener('mouseup', Stage._blck, false);
		}

		//c.onselect=function(){alert("onselect");}

		d.addEventListener('keydown', Stage._onKD, false);
		d.addEventListener('keyup', Stage._onKU, false);
		d.addEventListener('keydown', Stage._blck, false);
		d.addEventListener('keyup', Stage._blck, false);

		window.addEventListener('resize', Stage._onRS, false);
		*/

		// this._initShaders();
		// this._initBuffers();

		// gl.clearColor(0, 0, 0, 0);

		gl.enable(gl.BLEND);
		gl.blendEquation(gl.FUNC_ADD);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		this._resize();
		this._srs = true;
		_requestAF(Stage._tick);
	}

	_getOrigin(org) {
		org[0] = this.stageWidth / 2;
		org[1] = this.stageHeight / 2;
		org[2] = -500;
		org[3] = 1;
	}

	static _mouseX = 0;
	static _mouseY = 0;

	static _curBF = -1;
	static _curEBF = -1;

	static _curVC = -1;
	static _curTC = -1;
	static _curUT = -1;
	static _curTEX = -1;

	static _curBMD = 'normal';

	static _setBF = function (bf) {
		if (Stage._curBF != bf) {
			gl.bindBuffer(gl.ARRAY_BUFFER, bf);
			Stage._curBF = bf;
		}
	};
	static _setEBF = function (ebf) {
		if (Stage._curEBF != ebf) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebf);
			Stage._curEBF = ebf;
		}
	};
	static _setVC = function (vc) {
		if (Stage._curVC != vc) {
			gl.bindBuffer(gl.ARRAY_BUFFER, vc);
			gl.vertexAttribPointer(Stage._main._sprg.vpa, 3, gl.FLOAT, false, 0, 0);
			Stage._curVC = Stage._curBF = vc;
		}
	};
	static _setTC = function (tc) {
		if (Stage._curTC != tc) {
			gl.bindBuffer(gl.ARRAY_BUFFER, tc);
			gl.vertexAttribPointer(Stage._main._sprg.tca, 2, gl.FLOAT, false, 0, 0);
			Stage._curTC = Stage._curBF = tc;
		}
	};
	static _setUT = function (ut) {
		if (Stage._curUT != ut) {
			gl.uniform1i(Stage._main._sprg.useTex, ut);
			Stage._curUT = ut;
		}
	};
	static _setTEX = function (tex) {
		if (Stage._curTEX != tex) {
			gl.bindTexture(gl.TEXTURE_2D, tex);
			Stage._curTEX = tex;
		}
	};
	static _setBMD = function (bmd) {
		if (Stage._curBMD != bmd) {
			if (bmd == BlendMode.NORMAL) {
				gl.blendEquation(gl.FUNC_ADD);
				gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			} else if (bmd == BlendMode.MULTIPLY) {
				gl.blendEquation(gl.FUNC_ADD);
				gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
			} else if (bmd == BlendMode.ADD) {
				gl.blendEquation(gl.FUNC_ADD);
				gl.blendFunc(gl.ONE, gl.ONE);
			} else if (bmd == BlendMode.SUBTRACT) {
				gl.blendEquationSeparate(gl.FUNC_REVERSE_SUBTRACT, gl.FUNC_ADD);
				gl.blendFunc(gl.ONE, gl.ONE);
			} else if (bmd == BlendMode.SCREEN) {
				gl.blendEquation(gl.FUNC_ADD);
				gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);
			} else if (bmd == BlendMode.ERASE) {
				gl.blendEquation(gl.FUNC_ADD);
				gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
			} else if (bmd == BlendMode.ALPHA) {
				gl.blendEquation(gl.FUNC_ADD);
				gl.blendFunc(gl.ZERO, gl.SRC_ALPHA);
			}
			Stage._curBMD = bmd;
		}
	};

	static _okKeys = // keyCodes, which are not prevented by IvanK
		[
			112,
			113,
			114,
			115,
			116,
			117,
			118,
			119,
			120,
			121,
			122,
			123, // F1 - F12
			13, // Enter
			16, // Shift
			//17,	// Ctrl
			18, // Alt
			27, // Esc
		];

	/** Is Touchscreen Device */
	static _isTD = function () {
		return !!('ontouchstart' in window);
	};

	static _ctxt = function (e) {
		if (Stage._main.hasEventListener(MouseEvent.RIGHT_CLICK))
			e.preventDefault();
	};

	_getMakeTouch = function (id) {
		var t = this._touches['t' + id];
		if (t == null) {
			t = {touch: null, target: null, act: 0};
			this._touches['t' + id] = t;
		}
		return t;
	};

	static _onTD = function (e) {
		Stage._setStageMouse(e.touches.item(0));
		Stage._main._smd[0] = true;
		Stage._main._knM = true;

		var main = Stage._main;
		for (var i = 0; i < e.changedTouches.length; i++) {
			var tdom = e.changedTouches.item(i);
			var t = main._getMakeTouch(tdom.identifier);
			t.touch = tdom;
			t.act = 1;
		}
		main._processMouseTouch();
	};
	static _onTM = function (e) {
		Stage._setStageMouse(e.touches.item(0));
		Stage._main._smm = true;
		Stage._main._knM = true;
		var main = Stage._main;
		for (var i = 0; i < e.changedTouches.length; i++) {
			var tdom = e.changedTouches.item(i);
			var t = main._getMakeTouch(tdom.identifier);
			t.touch = tdom;
			t.act = 2;
		}
		main._processMouseTouch();
	};
	static _onTU = function (e) {
		Stage._main._smu[0] = true;
		Stage._main._knM = true;
		var main = Stage._main;
		for (var i = 0; i < e.changedTouches.length; i++) {
			var tdom = e.changedTouches.item(i);
			var t = main._getMakeTouch(tdom.identifier);
			t.touch = tdom;
			t.act = 3;
		}
		main._processMouseTouch();
	};

	static _onMD = function (e) {
		Stage._setStageMouse(e);
		Stage._main._smd[e.button] = true;
		Stage._main._knM = true;
		Stage._main._processMouseTouch();
	};
	static _onMM = function (e) {
		Stage._setStageMouse(e);
		Stage._main._smm = true;
		Stage._main._knM = true;
		Stage._main._processMouseTouch();
	};
	static _onMU = function (e) {
		Stage._main._smu[e.button] = true;
		Stage._main._knM = true;
		Stage._main._processMouseTouch();
	};

	static _onKD = function (e) {
		var st = Stage._main;
		var ev = new KeyboardEvent(KeyboardEvent.KEY_DOWN, true);
		ev._setFromDom(e);
		if (st.focus && st.focus.stage) st.focus.dispatchEvent(ev);
		else st.dispatchEvent(ev);
	};
	static _onKU = function (e) {
		var st = Stage._main;
		var ev = new KeyboardEvent(KeyboardEvent.KEY_UP, true);
		ev._setFromDom(e);
		if (st.focus && st.focus.stage) st.focus.dispatchEvent(ev);
		else st.dispatchEvent(ev);
	};
	static _blck = function (e) {
		if (e.keyCode != null) {
			if (e.target.tagName.toLowerCase() == 'textarea') {
			} else if (Stage._okKeys.indexOf(e.keyCode) == -1) e.preventDefault();
		} else e.preventDefault();
	};
	static _onRS = function (e) {
		Stage._main._srs = true;
	};

	static _getDPR = function () {
		return window.devicePixelRatio || 1;
	};

	_resize = function () {
		var dpr = Stage._getDPR();
		var w = window.innerWidth * dpr;
		var h = window.innerHeight * dpr;

		this._canvas.style.width = window.innerWidth + 'px';
		this._canvas.style.height = window.innerHeight + 'px';

		this.stageWidth = w;
		this.stageHeight = h;

		this._canvas.width = w;
		this._canvas.height = h;

		this._setFramebuffer(null, w, h, false);
	};

	_getShader = function (gl, str, fs) {
		var shader;
		if (fs) shader = gl.createShader(gl.FRAGMENT_SHADER);
		else shader = gl.createShader(gl.VERTEX_SHADER);

		gl.shaderSource(shader, str);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(shader));
			return null;
		}
		return shader;
	};

	_initShaders = function () {
		var fs =
			'\
			precision mediump float;\
			varying vec2 texCoord;\
			\
			uniform sampler2D uSampler;\
			uniform vec4 color;\
			uniform bool useTex;\
			\
			uniform mat4 cMat;\
			uniform vec4 cVec;\
			\
			void main(void) {\
				vec4 c;\
				if(useTex) { c = texture2D(uSampler, texCoord);  c.xyz *= (1.0/c.w); }\
				else c = color;\
				c = (cMat*c)+cVec;\n\
				c.xyz *= min(c.w, 1.0);\n\
				gl_FragColor = c;\
			}';

		var vs =
			'\
			attribute vec3 verPos;\
			attribute vec2 texPos;\
			\
			uniform mat4 tMat;\
			\
			varying vec2 texCoord;\
			\
			void main(void) {\
				gl_Position = tMat * vec4(verPos, 1.0);\
				texCoord = texPos;\
			}';

		var fShader = this._getShader(gl, fs, true);
		var vShader = this._getShader(gl, vs, false);

		this._sprg = gl.createProgram();
		gl.attachShader(this._sprg, vShader);
		gl.attachShader(this._sprg, fShader);
		gl.linkProgram(this._sprg);

		if (!gl.getProgramParameter(this._sprg, gl.LINK_STATUS)) {
			alert('Could not initialise shaders');
		}

		gl.useProgram(this._sprg);

		this._sprg.vpa = gl.getAttribLocation(this._sprg, 'verPos');
		this._sprg.tca = gl.getAttribLocation(this._sprg, 'texPos');
		gl.enableVertexAttribArray(this._sprg.tca);
		gl.enableVertexAttribArray(this._sprg.vpa);

		this._sprg.tMatUniform = gl.getUniformLocation(this._sprg, 'tMat');
		this._sprg.cMatUniform = gl.getUniformLocation(this._sprg, 'cMat');
		this._sprg.cVecUniform = gl.getUniformLocation(this._sprg, 'cVec');
		this._sprg.samplerUniform = gl.getUniformLocation(this._sprg, 'uSampler');
		this._sprg.useTex = gl.getUniformLocation(this._sprg, 'useTex');
		this._sprg.color = gl.getUniformLocation(this._sprg, 'color');
	};

	_initBuffers = function () {
		this._unitIBuffer = gl.createBuffer();

		Stage._setEBF(this._unitIBuffer);
		gl.bufferData(
			gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array([0, 1, 2, 1, 2, 3]),
			gl.STATIC_DRAW
		);
	};

	_setFramebuffer = function (fbo, w, h, flip) {
		this._mstack.clear();

		this._mstack.push(this._pmat, 0);
		if (flip) {
			this._umat[5] = 2;
			this._umat[13] = -1;
		} else {
			this._umat[5] = -2;
			this._umat[13] = 1;
		}
		this._mstack.push(this._umat);

		this._smat[0] = 1 / w;
		this._smat[5] = 1 / h;
		this._mstack.push(this._smat);

		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
		if (fbo)
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
		gl.viewport(0, 0, w, h);
	};

	static _setStageMouse = function (t) {
		// event, want X
		var dpr = Stage._getDPR();
		Stage._mouseX = t.clientX * dpr;
		Stage._mouseY = t.clientY * dpr;
		//console.log(Stage._mouseX, Stage._mouseY);
	};

	_drawScene = function () {
		if (this._srs) {
			this._resize();
			this.dispatchEvent(new Event(Event.RESIZE));
			this._srs = false;
		}

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		//this._processMouseTouch();

		//	proceeding EnterFrame
		var efs = EventDispatcher.efbc;
		var ev = new Event(Event.ENTER_FRAME, false);
		for (var i = 0; i < efs.length; i++) {
			ev.target = efs[i];
			efs[i].dispatchEvent(ev);
		}

		this._renderAll(this);
	};

	_processMouseTouch = function () {
		if (this._knM) {
			var org = this._svec4_0;
			this._getOrigin(org);
			var p = this._svec4_1;
			p[0] = Stage._mouseX;
			p[1] = Stage._mouseY;
			p[2] = 0;
			p[3] = 1;

			//	proceeding Mouse Events
			var newf = this._getTarget(org, p);
			var fa = this._mousefocus || this;
			var fb = newf || this;

			if (newf != this._mousefocus) {
				if (fa != this) {
					var ev = new MouseEvent(MouseEvent.MOUSE_OUT, true);
					ev.target = fa;
					fa.dispatchEvent(ev);
				}
				if (fb != this) {
					var ev = new MouseEvent(MouseEvent.MOUSE_OVER, true);
					ev.target = fb;
					fb.dispatchEvent(ev);
				}
			}

			if (this._smd[0] && this.focus && newf != this.focus)
				this.focus._loseFocus();
			for (var i = 0; i < 3; i++) {
				this._mcEvs[i].target =
					this._mdEvs[i].target =
					this._muEvs[i].target =
						fb;
				if (this._smd[i]) {
					fb.dispatchEvent(this._mdEvs[i]);
					this._focii[i] = this.focus = newf;
				}
				if (this._smu[i]) {
					fb.dispatchEvent(this._muEvs[i]);
					if (newf == this._focii[i]) fb.dispatchEvent(this._mcEvs[i]);
				}
				this._smd[i] = this._smu[i] = false;
			}

			if (this._smm) {
				var ev = new MouseEvent(MouseEvent.MOUSE_MOVE, true);
				ev.target = fb;
				fb.dispatchEvent(ev);
				this._smm = false;
			}

			this._mousefocus = newf;

			//	checking buttonMode
			var uh = false,
				ob = fb;
			while (ob.parent != null) {
				uh |= ob.buttonMode;
				ob = ob.parent;
			}
			var cursor = uh ? 'pointer' : 'default';
			if (fb instanceof TextField && fb.selectable) cursor = 'text';
			this._canvas.style.cursor = cursor;
		}

		var dpr = Stage._getDPR();
		//for(var i=0; i<this._touches.length; i++)
		for (var tind in this._touches) {
			var t = this._touches[tind];
			if (t.act == 0) continue;

			var org = this._svec4_0;
			this._getOrigin(org);
			var p = this._svec4_1;
			p[0] = t.touch.clientX * dpr;
			p[1] = t.touch.clientY * dpr;
			p[2] = 0;
			p[3] = 1;

			var newf = this._getTarget(org, p);
			var fa = t.target || this;
			var fb = newf || this;

			if (newf != t.target) {
				if (fa != this) {
					var ev = new TouchEvent(TouchEvent.TOUCH_OUT, true);
					ev._setFromDom(t.touch);
					ev.target = fa;
					fa.dispatchEvent(ev);
				}
				if (fb != this) {
					var ev = new TouchEvent(TouchEvent.TOUCH_OVER, true);
					ev._setFromDom(t.touch);
					ev.target = fb;
					fb.dispatchEvent(ev);
				}
			}

			var ev;
			if (t.act == 1) ev = new TouchEvent(TouchEvent.TOUCH_BEGIN, true);
			if (t.act == 2) ev = new TouchEvent(TouchEvent.TOUCH_MOVE, true);
			if (t.act == 3) ev = new TouchEvent(TouchEvent.TOUCH_END, true);
			ev._setFromDom(t.touch);
			ev.target = fb;
			fb.dispatchEvent(ev);
			if (t.act == 3 && newf == t.target) {
				ev = new TouchEvent(TouchEvent.TOUCH_TAP, true);
				ev._setFromDom(t.touch);
				ev.target = fb;
				fb.dispatchEvent(ev);
			}
			t.act = 0;
			t.target = t.act == 3 ? null : newf;
		}
	};

	static _tick = function () {
		_requestAF(Stage._tick);
		Stage.prototype._drawScene.call(Stage._main);
	};
}

Stage._MStack = function () {
	this.mats = [];
	this.size = 1;
	for (var i = 0; i < 30; i++) this.mats.push(Point._m4.create());
};

Stage._MStack.prototype.clear = function () {
	this.size = 1;
};

Stage._MStack.prototype.push = function (m) {
	var s = this.size++;
	Point._m4.multiply(this.mats[s - 1], m, this.mats[s]);
};

Stage._MStack.prototype.pop = function () {
	this.size--;
};

Stage._MStack.prototype.top = function () {
	return this.mats[this.size - 1];
};

/*
		Color matrix stack
	*/
Stage._CMStack = class {
	mats: any[];
	vecs: any[];
	isID: any[];
	bmds: any[];
	lnnm: any[];
	size: number;
	dirty: boolean;
	constructor() {
		this.mats = []; //	linear transform matrix
		this.vecs = []; //  affine shift column
		this.isID = []; //	is Identity

		this.bmds = []; //	blend modes
		this.lnnm = []; //	last not NORMAL blend mode
		this.size = 1;
		this.dirty = true; // if top matrix is different than shader value
		for (var i = 0; i < 30; i++) {
			this.mats.push(Point._m4.create());
			this.vecs.push(new Float32Array(4));
			this.isID.push(true);
			this.bmds.push(BlendMode.NORMAL);
			this.lnnm.push(0);
		}
	}
};

Stage._CMStack.prototype.push = function (m, v, id, bmd) {
	var s = this.size++;
	this.isID[s] = id;

	if (id) {
		Point._m4.set(this.mats[s - 1], this.mats[s]);
		Point._v4.set(this.vecs[s - 1], this.vecs[s]);
	} else {
		Point._m4.multiply(this.mats[s - 1], m, this.mats[s]);
		Point._m4.multiplyVec4(this.mats[s - 1], v, this.vecs[s]);
		Point._v4.add(this.vecs[s - 1], this.vecs[s], this.vecs[s]);
	}
	if (!id) this.dirty = true;

	this.bmds[s] = bmd;
	this.lnnm[s] = bmd == BlendMode.NORMAL ? this.lnnm[s - 1] : s;
};

Stage._CMStack.prototype.update = function () {
	if (this.dirty) {
		var st = Stage._main,
			s = this.size - 1;
		gl.uniformMatrix4fv(st._sprg.cMatUniform, false, this.mats[s]);
		gl.uniform4fv(st._sprg.cVecUniform, this.vecs[s]);
		this.dirty = false;
	}
	var n = this.lnnm[this.size - 1];
	Stage._setBMD(this.bmds[n]);
};

Stage._CMStack.prototype.pop = function () {
	if (!this.isID[this.size - 1]) this.dirty = true;
	this.size--;
};
